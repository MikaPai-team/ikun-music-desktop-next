const assert = require('node:assert/strict')
const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function load() {
  let proxy = null
  let failure = false
  const configurations = []
  let reloads = 0
  const ses = {
    async setProxy(config) {
      if (failure) throw new Error('proxy configuration failed')
      configurations.push(config)
    },
    async forceReloadProxyConfig() { reloads++ },
  }
  const source = readFileSync(path.join(__dirname, '../../src/main/modules/winMain/updateProxy.ts'), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === 'electron-updater') return { autoUpdater: { netSession: ses } }
      if (name === '@main/utils') return { getProxy: () => proxy }
      throw new Error('Unexpected import: ' + name)
    },
  })
  return {
    prepare: exports.prepareUpdateSession,
    ses, configurations,
    get reloads() { return reloads },
    setProxy(value) { proxy = value },
    fail(value) { failure = value },
  }
}

test('without an application proxy, every update request reloads system proxy configuration', async () => {
  const p = load()
  assert.equal(await p.prepare(), p.ses)
  await p.prepare()
  assert.equal(p.configurations.length, 1)
  assert.equal(p.configurations[0].mode, 'system')
  assert.equal(p.reloads, 2)
})

test('manual proxy has priority and disabling it restores system proxy mode', async () => {
  const p = load()
  p.setProxy({ host: '127.0.0.1', port: 7890 })
  await p.prepare()
  assert.equal(p.configurations[0].mode, 'fixed_servers')
  assert.equal(p.configurations[0].proxyRules, 'http://127.0.0.1:7890')
  assert.equal(p.reloads, 0)
  p.setProxy(null)
  await p.prepare()
  assert.equal(p.configurations[1].mode, 'system')
  assert.equal(p.reloads, 1)
})

test('concurrent requests avoid duplicate setup and use changed manual proxy settings', async () => {
  const p = load()
  p.setProxy({ host: '127.0.0.1', port: 7890 })
  await Promise.all([p.prepare(), p.prepare(), p.prepare()])
  assert.equal(p.configurations.length, 1)
  p.setProxy({ host: 'localhost', port: 8888 })
  await p.prepare()
  assert.equal(p.configurations[1].proxyRules, 'http://localhost:8888')
})

test('configuration failures propagate and later requests can retry without a direct fallback', async () => {
  const p = load()
  p.fail(true)
  await assert.rejects(p.prepare(), /proxy configuration failed/)
  assert.equal(p.configurations.length, 0)
  p.fail(false)
  await p.prepare()
  assert.equal(p.configurations[0].mode, 'system')
})
