import { onBeforeUnmount, onMounted, shallowRef, watch } from '@common/utils/vueTools'
import { musicInfo, setting } from '@lyric/store/state'
import { getBackgroundSample, onThemeChange } from '@lyric/utils/ipc'
import { getArtworkColors, type Rgb } from '../../renderer/utils/colorExtract'
import { getDesktopLyricForeground } from '../../renderer/utils/artworkBackground'

export default () => {
  const palette = shallowRef<Rgb[]>([])
  const background = shallowRef<LX.DesktopLyric.BackgroundSample | null>(null)
  let artworkToken = 0
  let active = true
  let sampling = false
  let timer: ReturnType<typeof setTimeout> | null = null
  const colorProbe = document.createElement('span')
  colorProbe.style.display = 'none'
  document.body.appendChild(colorProbe)

  const rThemeChange = onThemeChange(({ params: setting }) => {
    window.setTheme(setting.theme.colors)
  })

  watch(
    () => musicInfo.pic,
    async (pic) => {
      const token = ++artworkToken
      palette.value = []
      const colors = await getArtworkColors(pic ?? '')
      if (!active || token !== artworkToken) return
      palette.value = colors
    },
    { immediate: true }
  )

  const sampleBackground = async () => {
    if (!active || sampling) return
    sampling = true
    try {
      const sample = await getBackgroundSample()
      if (active) background.value = sample
    } catch {
      if (active) background.value = null
    } finally {
      sampling = false
    }
  }
  const sampleLoop = async () => {
    await sampleBackground()
    if (active) timer = setTimeout(sampleLoop, 1500)
  }
  onMounted(() => {
    void sampleLoop()
  })
  watch(
    () => [
      setting['desktopLyric.x'],
      setting['desktopLyric.y'],
      setting['desktopLyric.width'],
      setting['desktopLyric.height'],
    ],
    () => {
      background.value = null
      void sampleBackground()
    }
  )

  watch(
    () => [
      palette.value,
      background.value,
      setting['desktopLyric.style.lyricPlayedColor'],
      setting['desktopLyric.style.opacity'],
    ],
    () => {
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
    artworkToken++
    if (timer != null) clearTimeout(timer)
    colorProbe.remove()
    document.documentElement.classList.remove('desktop-artwork-color')
    rThemeChange()
  })
}
