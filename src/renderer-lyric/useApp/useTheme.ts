import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from '@common/utils/vueTools'
import { normalizeDesktopLyricColorInterval } from '@common/utils/desktopLyricColor'
import { musicInfo, setting } from '@lyric/store/state'
import { getBackgroundSample, onThemeChange } from '@lyric/utils/ipc'
import { getArtworkColors, type Rgb } from '../../renderer/utils/colorExtract'
import { getDesktopLyricForeground } from '../../renderer/utils/artworkBackground'

export default () => {
  const palette = shallowRef<Rgb[]>([])
  const background = shallowRef<LX.DesktopLyric.BackgroundSample | null>(null)
  const autoColor = computed(() => setting['desktopLyric.autoColor'] !== false)
  const interval = computed(() =>
    normalizeDesktopLyricColorInterval(setting['desktopLyric.autoColorInterval'])
  )
  let artworkToken = 0
  let backgroundToken = 0
  let active = true
  let mounted = false
  let sampling = false
  let timer: ReturnType<typeof setTimeout> | null = null
  const colorProbe = document.createElement('span')
  colorProbe.style.display = 'none'
  document.body.appendChild(colorProbe)

  const rThemeChange = onThemeChange(({ params: setting }) => {
    window.setTheme(setting.theme.colors)
  })

  watch(
    [autoColor, () => musicInfo.pic],
    async ([enabled, pic]) => {
      const token = ++artworkToken
      palette.value = []
      if (!enabled || !pic) return
      const colors = await getArtworkColors(pic ?? '')
      if (!active || !autoColor.value || token !== artworkToken) return
      palette.value = colors
    },
    { immediate: true }
  )

  const clearSampleTimer = () => {
    if (timer == null) return
    clearTimeout(timer)
    timer = null
  }

  const scheduleSample = () => {
    if (!mounted || !autoColor.value || sampling) return
    timer = setTimeout(() => {
      timer = null
      void sampleBackground()
    }, interval.value)
  }

  const sampleBackground = async () => {
    if (!mounted || !autoColor.value || sampling) return
    const token = backgroundToken
    sampling = true
    try {
      const sample = await getBackgroundSample()
      if (!mounted || !autoColor.value || token !== backgroundToken) return
      const previous = background.value
      // 周期采样产生新对象；颜色未变时保留旧引用，避免重算和歌词重绘。
      if (sample?.colors.length !== previous?.colors.length ||
        sample?.colors.some((color, index) => {
          const old = previous?.colors[index]
          return !old || color.r !== old.r || color.g !== old.g || color.b !== old.b
        })) background.value = sample
    } catch {
      if (mounted && autoColor.value && token === backgroundToken) background.value = null
    } finally {
      sampling = false
      if (token !== backgroundToken) void sampleBackground()
      else scheduleSample()
    }
  }

  onMounted(() => {
    mounted = true
    void sampleBackground()
  })
  watch(interval, () => {
    clearSampleTimer()
    scheduleSample()
  })
  watch(
    () => [
      autoColor.value,
      setting['desktopLyric.x'],
      setting['desktopLyric.y'],
      setting['desktopLyric.width'],
      setting['desktopLyric.height'],
    ],
    () => {
      backgroundToken++
      clearSampleTimer()
      background.value = null
      void sampleBackground()
    }
  )

  watch(
    () => [
      autoColor.value,
      palette.value,
      background.value,
      setting['desktopLyric.style.lyricUnplayColor'],
      setting['desktopLyric.style.lyricPlayedColor'],
      setting['desktopLyric.style.lyricShadowColor'],
      setting['desktopLyric.style.opacity'],
    ],
    () => {
      if (!autoColor.value) {
        const shadow = setting['desktopLyric.style.lyricShadowColor']
        window.setLyricColor({
          '--color-lyric-unplay': setting['desktopLyric.style.lyricUnplayColor'],
          '--color-lyric-played': setting['desktopLyric.style.lyricPlayedColor'],
          '--color-lyric-shadow': shadow,
          '--color-lyric-shadow-font-mode': shadow,
        })
        document.documentElement.classList.remove('desktop-artwork-color')
        return
      }

      colorProbe.style.color = ''
      colorProbe.style.color = setting['desktopLyric.style.lyricPlayedColor']
      const channels = getComputedStyle(colorProbe).color.match(/[\d.]+/g)?.map(Number)
      const source = palette.value[0] ?? (
        channels && channels.length >= 3
          ? { r: channels[0], g: channels[1], b: channels[2] }
          : { r: 7, g: 197, b: 86 }
      )
      const foreground = getDesktopLyricForeground(
        source,
        background.value?.colors ?? [],
        setting['desktopLyric.style.opacity'] / 100
      )
      window.setLyricColor({
        '--color-lyric-unplay': foreground.unplay,
        '--color-lyric-played': foreground.played,
        '--color-lyric-shadow': foreground.shadow,
        '--color-lyric-shadow-font-mode': foreground.shadow,
        '--desktop-lyric-background': foreground.background,
      })
      document.documentElement.classList.add('desktop-artwork-color')
    },
    {
      immediate: true,
    }
  )

  onBeforeUnmount(() => {
    active = false
    mounted = false
    artworkToken++
    clearSampleTimer()
    colorProbe.remove()
    document.documentElement.classList.remove('desktop-artwork-color')
    rThemeChange()
  })
}
