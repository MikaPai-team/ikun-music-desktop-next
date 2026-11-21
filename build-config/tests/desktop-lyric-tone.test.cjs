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
const mix = (background, foreground, alpha) => ({
  r: background.r + (foreground.r - background.r) * alpha,
  g: background.g + (foreground.g - background.g) * alpha,
  b: background.b + (foreground.b - background.b) * alpha,
})

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

test('复杂背景与取色失败时优先保留实际唱词色差，不只比较 RGB 是否相等', () => {
  for (const source of [blue, { r: 220, g: 70, b: 80 }, { r: 180, g: 180, b: 180 }, white]) {
    for (const backgrounds of [[black, white], [{ r: 20, g: 30, b: 50 }, { r: 180, g: 190, b: 210 }], []]) {
      for (const opacity of [1, 0.95]) {
        const colors = getDesktopLyricForeground(source, backgrounds, opacity)
        for (const background of backgrounds.length ? backgrounds : [black, white]) {
          assert.ok(getContrastRatio(
            mix(background, rgb(colors.played), opacity),
            mix(background, rgb(colors.unplay), opacity)
          ) >= 2, `${JSON.stringify({ source, background, opacity, colors })}`)
        }
      }
    }
  }
})

test('低透明度无法达到 2:1 时仍选择可达到的最大唱词色差', () => {
  const opacity = 0.1
  for (const background of [black, white]) {
    const colors = getDesktopLyricForeground(blue, [background], opacity)
    const unplay = mix(background, rgb(colors.unplay), opacity)
    const separation = getContrastRatio(mix(background, rgb(colors.played), opacity), unplay)
    for (const target of [black, white]) {
      const extreme = {
        r: Math.round(blue.r + (target.r - blue.r) * 0.9),
        g: Math.round(blue.g + (target.g - blue.g) * 0.9),
        b: Math.round(blue.b + (target.b - blue.b) * 0.9),
      }
      assert.ok(separation >= getContrastRatio(mix(background, extreme, opacity), unplay))
    }
  }
})
