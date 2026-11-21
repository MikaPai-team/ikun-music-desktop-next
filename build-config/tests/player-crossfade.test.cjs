const assert = require('node:assert/strict')
const { test } = require('node:test')
const { EventEmitter } = require('node:events')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function player() {
  let now = 0
  let id = 0
  const timers = new Map()
  const elements = []
  class Audio extends EventEmitter {
    constructor() {
      super()
      elements.push(this)
      this.volume = 1
      this.paused = true
      this.duration = 180
      this.currentTime = 0
      this.playbackRate = this.defaultPlaybackRate = 1
      this.readyState = 0
      this._src = ''
    }
    addEventListener(name, callback) { this.on(name, callback) }
    removeEventListener(name, callback) { this.off(name, callback) }
    dispatchEvent(event) { this.emit(event.type) }
    getAttribute(name) { return name === 'src' ? this._src : null }
    removeAttribute(name) { if (name === 'src') this._src = '' }
    get src() { return this._src }
    set src(value) {
      this._src = value
      this.currentTime = 0
      this.readyState = 0
      this.paused = true
    }
    load() { this.readyState = 0 }
    pause() { this.paused = true }
    async play() { this.paused = false; this.emit('playing') }
    async setSinkId(id) { this.sinkId = id }
    ready() { this.readyState = 4; this.emit('canplay') }
  }
  const source = readFileSync(path.join(__dirname, '../../src/renderer/plugins/player/index.ts'), 'utf8')
    .replace(/import\.meta\.url/g, "'file:///player/index.ts'")
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const api = {}
  vm.runInNewContext(compiled, {
    exports: api,
    console: { log() {} },
    window: { Audio },
    Event: class Event { constructor(type) { this.type = type } },
    performance: { now: () => now },
    setInterval(callback) { timers.set(++id, callback); return id },
    clearInterval(id) { timers.delete(id) },
    setTimeout() { return ++id },
    clearTimeout() {},
  })
  api.createAudio()
  api.setResource('old.flac')
  return {
    api, elements,
    tick(ms) { now += ms; for (const callback of [...timers.values()]) callback() },
    async start() { await elements[0].play(); this.tick(800) },
    async next() {
      api.prepareTrackSwitch(true)
      api.setResource('new.flac')
      await elements[1].play()
    },
  }
}

test('manual switching fades two tracks concurrently and ignores the outgoing ended event', async () => {
  const p = player()
  await p.start()
  let ended = 0
  p.api.onEnded(() => ended++)
  await p.next()
  p.tick(400)
  assert.ok(p.elements[0].volume > 0 && p.elements[0].volume < 1)
  assert.ok(p.elements[1].volume > 0 && p.elements[1].volume < 1)
  p.elements[0].emit('ended')
  assert.equal(ended, 0)
  p.tick(800)
  assert.equal(p.elements[0].paused, true)
  assert.equal(p.elements[0].src, '')
  assert.equal(p.elements[1].volume, 1)
  p.elements[1].emit('ended')
  assert.equal(ended, 1)
})

test('natural transition reuses the preloaded audio from the beginning at playback speed', async () => {
  const p = player()
  await p.start()
  p.api.setPlaybackRate(2)
  p.elements[0].currentTime = 179
  const ready = p.api.preloadResource('next.flac')
  p.elements[1].ready()
  assert.equal(await ready, true)
  assert.equal(p.api.isResourcePreloaded('next.flac'), true)
  p.api.prepareTrackSwitch(true, 800, 'next.flac')
  p.api.setResource('next.flac')
  assert.equal(p.elements[1].paused, false)
  assert.equal(p.elements[1].playbackRate, 2)
  p.tick(500)
  assert.equal(p.elements[0].src, '')
  assert.ok(p.elements[1].volume > 0 && p.elements[1].volume < 1)
  p.tick(300)
  assert.equal(p.elements[1].volume, 1)
})

test('disabled crossfade retains the original sequential source switch', async () => {
  const p = player()
  await p.start()
  p.api.setCrossfadeEnabled(false)
  p.api.prepareTrackSwitch(true)
  p.api.setResource('next.flac')
  assert.equal(p.elements[0].src, 'old.flac')
  assert.equal(p.elements[1].src, '')
  p.tick(1200)
  assert.equal(p.elements[0].src, 'next.flac')
})

test('pause, stop, seek and disabling either switch release the outgoing tail', async () => {
  for (const action of [
    p => p.api.setPause(), p => p.api.setStop(), p => p.api.setCurrentTime(40),
    p => p.api.setCrossfadeEnabled(false), p => p.api.setVolumeFadeEnabled(false),
  ]) {
    const p = player()
    await p.start()
    await p.next()
    action(p)
    assert.equal(p.elements[0].paused, true)
    assert.equal(p.elements[0].src, '')
  }
})

test('rapid switching uses only two audio elements and synchronizes output controls', async () => {
  const p = player()
  await p.start()
  await p.next()
  p.api.prepareTrackSwitch(true)
  p.api.setResource('third.flac')
  await p.elements[0].play()
  p.api.setMute(true)
  p.api.setPlaybackRate(1.5)
  p.api.setPreservesPitch(false)
  await p.api.setMediaDeviceId('speakers')
  assert.equal(p.elements.length, 2)
  for (const element of p.elements) {
    assert.equal(element.muted, true)
    assert.equal(element.playbackRate, 1.5)
    assert.equal(element.preservesPitch, false)
    assert.equal(element.sinkId, 'speakers')
  }
  p.tick(1200)
  assert.equal(p.elements[1].src, '')
  assert.equal(p.elements[0].src, 'third.flac')
})
