const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { test } = require('node:test')
const ts = require('typescript')

const read = (file) => readFileSync(path.join(__dirname, '../../', file), 'utf8')
const flush = () => new Promise(setImmediate)
function compile(source, imports, globals = {}) {
  const exports = {}
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: (name) => {
    assert.ok(name in imports, name)
    return imports[name]
  }, ...globals })
  return exports
}

function visualizer() {
  const mounted = []
  const unmounted = []
  const watches = []
  const frames = new Map()
  let now = 0
  let frameId = 0
  let requests = 0
  let draws = 0
  let listener
  const canvas = { width: 0, height: 0, clientWidth: 800, clientHeight: 120,
    getContext: () => ({ clearRect() { draws++ }, fillRect() {} }) }
  const isPlay = { value: true }
  const source = read('src/renderer-lyric/components/common/AudioVisualizer.vue')
    .match(/<script>([\s\S]*?)<\/script>/)[1]
  const component = compile(source, {
    '@common/utils/vueTools': {
      ref: () => ({ value: canvas }),
      onMounted: (cb) => mounted.push(cb), onBeforeUnmount: (cb) => unmounted.push(cb),
      watch: (source, cb) => watches.push({ source, cb }),
    },
    '@lyric/core/mainWindowChannel': {
      useEvent: (cb) => { listener = cb; unmounted.push(() => { listener = null }) },
      getAnalyserDataArray: () => { requests++ },
    },
    '@lyric/store/state': { isPlay, setting: { 'desktopLyric.audioVisualization': true } },
  }, { window: {
    requestAnimationFrame: (cb) => { frames.set(++frameId, cb); return frameId },
    cancelAnimationFrame: (id) => frames.delete(id),
    addEventListener() {}, removeEventListener() {},
  }, performance: { now: () => now } }).default
  component.setup()
  mounted.forEach((cb) => cb())
  return {
    frames, canvas,
    get requests() { return requests }, get draws() { return draws },
    reply() { listener?.({ action: 'send_analyser_data_array', data: new Uint8Array(128) }) },
    tick(time) {
      now = time
      const callbacks = [...frames.values()]
      frames.clear()
      callbacks.forEach((cb) => cb(now))
    },
    play(value) {
      isPlay.value = value
      watches.find((watch) => watch.source === isPlay).cb(value)
    },
    unmount() { unmounted.forEach((cb) => cb()) },
  }
}

test('144 Hz 屏幕的桌面频谱请求限制到约 30 次每秒', () => {
  const app = visualizer()
  app.reply()
  for (let frame = 1; frame <= 144; frame++) {
    const previous = app.requests
    app.tick(frame * 1000 / 144)
    if (app.requests !== previous) app.reply()
  }
  assert.ok(app.requests >= 25 && app.requests <= 32, `requests: ${app.requests}`)
  assert.equal(app.frames.size, 1)
  app.unmount()
  assert.equal(app.frames.size, 0)
  assert.equal(app.canvas.width, 0)
  assert.equal(app.canvas.height, 0)
})

test('频谱回复迟到时暂停再播放不会产生重叠请求或多个动画循环', () => {
  const app = visualizer()
  app.play(false)
  app.play(true)
  assert.equal(app.requests, 1)
  app.reply()
  app.reply()
  assert.equal(app.frames.size, 1)
  app.tick(40)
  app.play(false)
  const draws = app.draws
  app.reply()
  assert.equal(app.draws, draws)
  assert.equal(app.frames.size, 0)
  app.play(true)
  assert.equal(app.requests, 3)
  app.unmount()
  app.reply()
  assert.equal(app.frames.size, 0)
})

test('相同背景采样不触发重算，真实颜色变化仍更新，卸载后丢弃迟到结果', async () => {
  const mounted = []
  const unmounted = []
  const refs = []
  let timer
  let channel = 10
  let pending
  let resolvePending
  const sample = () => ({ bounds: { x: 0, y: 0, width: 800, height: 120 },
    colors: [{ r: channel, g: 20, b: 30 }] })
  const probe = { style: {}, remove() {} }
  const useTheme = compile(read('src/renderer-lyric/useApp/useTheme.ts'), {
    '@common/utils/vueTools': {
      shallowRef(value) {
        const ref = { writes: 0, get value() { return value },
          set value(next) { value = next; this.writes++ } }
        refs.push(ref)
        return ref
      },
      watch(source, cb, options) { if (options?.immediate) cb(source()) },
      onMounted: (cb) => mounted.push(cb), onBeforeUnmount: (cb) => unmounted.push(cb),
    },
    '@lyric/store/state': { musicInfo: { pic: null }, setting: {
      'desktopLyric.style.lyricPlayedColor': 'green', 'desktopLyric.style.opacity': 95,
    } },
    '@lyric/utils/ipc': { getBackgroundSample: () => pending ?? Promise.resolve(sample()),
      onThemeChange: () => () => {} },
    '../../renderer/utils/colorExtract': { getArtworkColors: async () => [] },
    '../../renderer/utils/artworkBackground': { getDesktopLyricForeground: () => ({}) },
  }, {
    document: { createElement: () => probe, body: { appendChild() {} },
      documentElement: { classList: { add() {}, remove() {} } } },
    getComputedStyle: () => ({ color: 'rgb(10, 20, 30)' }),
    window: { setLyricColor() {} },
    setTimeout: (cb) => { timer = cb; return 1 }, clearTimeout: () => { timer = null },
  }).default
  useTheme()
  mounted.forEach((cb) => cb())
  await flush()
  for (let i = 0; i < 5; i++) { await timer(); await flush() }
  assert.equal(refs[1].writes, 1)
  channel++
  await timer()
  assert.equal(refs[1].writes, 2)
  pending = new Promise((resolve) => { resolvePending = resolve })
  const sampling = timer()
  unmounted.forEach((cb) => cb())
  resolvePending(sample())
  await sampling
  assert.equal(refs[1].writes, 2)
  assert.equal(timer, null)
})

test('相同字色不重写样式表，也不持续记录颜色对象', () => {
  let writes = 0
  let logs = 0
  const styles = []
  const window = { location: { search: '?os=windows' } }
  const script = read('src/renderer-lyric/index.html').match(/<script>([\s\S]*?)<\/script>/)[1]
  vm.runInNewContext(script, {
    window, navigator: { language: 'zh-CN' }, console: { log() { logs++ } },
    document: { createElement() {
      let text = ''
      const style = { get innerText() { return text }, set innerText(value) { text = value; writes++ } }
      styles.push(style)
      return style
    }, documentElement: { setAttribute() {}, classList: { add() {} } }, body: { appendChild() {} } },
  })
  const colors = { '--color-lyric-played': 'rgb(10, 20, 30)' }
  for (let i = 0; i < 20; i++) window.setLyricColor({ ...colors })
  assert.equal(writes, 1)
  assert.equal(logs, 0)
  window.setLyricColor({ '--color-lyric-played': 'rgb(20, 30, 40)' })
  assert.equal(writes, 2)
})
