const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { test } = require('node:test')
const ts = require('typescript')

const exportsForTest = {}
const source = readFileSync(path.join(__dirname, '../../src/renderer/utils/artworkBackground.ts'), 'utf8')
const result = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
vm.runInNewContext(result.outputText, { exports: exportsForTest })
const { getContrastRatio, getDesktopLyricForeground } = exportsForTest
const rgb = (value) => {
  const [r, g, b] = value.match(/\d+/g).map(Number)
  return { r, g, b }
}
const white = { r: 255, g: 255, b: 255 }
const black = { r: 0, g: 0, b: 0 }
const blue = { r: 40, g: 120, b: 210 }

test('明暗背景、混合背景与取色失败均保留封面色相，不回退黑字或灰字', () => {
  for (const backgrounds of [[white], [black], [white, black], []]) {
    for (const opacity of [1, 0.95, 0.1]) {
      const colors = getDesktopLyricForeground(blue, backgrounds, opacity)
      assert.equal(colors.background, 'transparent')
      assert.notEqual(colors.played, colors.unplay)
      for (const value of [colors.played, colors.unplay]) {
        const color = rgb(value)
        assert.ok(color.b > color.g && color.g > color.r, value)
      }
    }
  }
})

test('窗下背景改变时重新调整明暗，封面改变时重新调整色相', () => {
  const dark = getDesktopLyricForeground(blue, [black], 1)
  const light = getDesktopLyricForeground(blue, [white], 1)
  assert.notEqual(dark.played, light.played)
  assert.notEqual(dark.unplay, light.unplay)
  const red = getDesktopLyricForeground({ r: 220, g: 70, b: 80 }, [black], 1)
  assert.notEqual(dark.played, red.played)
  assert.notEqual(dark.unplay, red.unplay)
})

test('均匀背景能达到对比度时仍保证文字可读，灰阶原色也不选纯黑或纯白', () => {
  for (const background of [white, black]) {
    const colors = getDesktopLyricForeground(blue, [background], 1)
    for (const value of [colors.played, colors.unplay]) {
      assert.ok(getContrastRatio(rgb(value), background) >= 4.5)
    }
    for (const source of [white, black]) {
      const neutral = getDesktopLyricForeground(source, [background], 1)
      assert.notEqual(neutral.played, 'rgb(0, 0, 0)')
      assert.notEqual(neutral.unplay, 'rgb(0, 0, 0)')
      assert.notEqual(neutral.played, 'rgb(255, 255, 255)')
      assert.notEqual(neutral.unplay, 'rgb(255, 255, 255)')
    }
  }
})
