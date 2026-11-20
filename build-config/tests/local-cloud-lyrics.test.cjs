const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { test } = require('node:test')
const ts = require('typescript')

const localLyric = '[00:01.00]文件歌词'
const cloudLyric = '[00:01.00]云端歌词'
const musicInfo = {
  id: 'local-song', source: 'local', name: '歌名', singer: '歌手',
  meta: { filePath: 'D:\\Music\\歌手 - 歌名.flac', albumName: '' },
}

function load({ enabled = true, apiFails = false, searchFails = false, cached = null } = {}) {
  const calls = []
  const imports = {
    '@common/utils/common': {},
    '@renderer/store/list/action': {},
    '@renderer/utils/music': {},
    '@renderer/store/setting': { appSetting: { 'localMusic.cloudLyric': enabled } },
    '@renderer/utils/ipc': { saveLyric: async (info) => calls.push(['save', info.source]) },
    './utils': {
      existTimeExp: /\[\d{1,2}:.*\d{1,4}\]/,
      buildLyricInfo: async (info) => ({ ...info, rawlrcInfo: info }),
      getCachedLyricInfo: async () => { calls.push(['cache']); return cached },
      getOnlineOtherSourceLyricByLocal: async (_info, refresh) => {
        calls.push(['api', refresh])
        if (apiFails) throw new Error('API unavailable')
        return { lyricInfo: { lyric: cloudLyric }, isFromCache: false }
      },
      getOtherSource: async (info) => {
        calls.push(['search', info.name, info.singer])
        if (searchFails) return []
        return [{ ...info, source: 'tx', id: 'cloud-song' }]
      },
      getOnlineOtherSourceLyricInfo: async ({ musicInfos, isRefresh }) => {
        calls.push(['online', isRefresh])
        return { lyricInfo: { lyric: cloudLyric }, musicInfo: musicInfos[0], isFromCache: false }
      },
    },
  }
  const exports = {}
  const source = readFileSync(path.join(__dirname, '../../src/renderer/core/music/local.ts'), 'utf8')
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  vm.runInNewContext(result.outputText, {
    exports, console,
    require: (name) => {
      if (!(name in imports)) throw new Error('Unexpected import: ' + name)
      return imports[name]
    },
    window: { lx: { worker: { main: {
      getMusicFileLyric: async () => { calls.push(['file']); return { lyric: localLyric } },
      saveMusicFileLyric: async () => calls.push(['write']),
    } } } },
  })
  return { get: () => exports.getLyricInfo({ musicInfo, isRefresh: false }), calls }
}

test('云端模式跳过文件与旧缓存，强制请求在线歌词，不改写本地歌词', async () => {
  const state = load({ cached: { lyric: '[00:01.00]编辑歌词' } })
  assert.equal((await state.get()).lyric, cloudLyric)
  assert.deepEqual(state.calls, [['api', true]])
})

test('本地 API 不可用时按歌名与歌手匹配在线来源，强制刷新歌词', async () => {
  const state = load({ apiFails: true })
  assert.equal((await state.get()).lyric, cloudLyric)
  assert.deepEqual(state.calls, [
    ['api', true], ['search', '歌名', '歌手'], ['online', true], ['save', 'tx'],
  ])
})

test('在线无结果时不回退到文件歌词或旧缓存，并尝试文件名的两种顺序', async () => {
  const state = load({ apiFails: true, searchFails: true, cached: { lyric: localLyric } })
  await assert.rejects(state.get(), /source not found/)
  assert.deepEqual(state.calls, [
    ['api', true], ['search', '歌名', '歌手'],
    ['search', '歌手', '歌名'], ['search', '歌名', '歌手'],
  ])
})

test('关闭后恢复文件歌词和编辑缓存的原有优先级', async () => {
  const file = load({ enabled: false })
  assert.equal((await file.get()).lyric, localLyric)
  assert.deepEqual(file.calls, [['cache'], ['file']])
  const edited = load({ enabled: false, cached: { lyric: cloudLyric } })
  assert.equal((await edited.get()).lyric, cloudLyric)
  assert.deepEqual(edited.calls, [['cache'], ['file']])
})
