import { onBeforeUnmount, watch } from '@common/utils/vueTools'
import { debounce } from '@common/utils/common'
// import { setDesktopLyricInfo, onGetDesktopLyricInfo } from '@renderer/utils/ipc'
// import { musicInfo } from '@renderer/store/player/state'
import { pause, play, setLyric, stop, init, sendInfo, sendPic, setPlaybackRate } from '@renderer/core/lyric'
import { appSetting } from '@renderer/store/setting'
import { loadLyric } from '@renderer/core/player'
import { playMusicInfo } from '@renderer/store/player/state'

const handleApplyPlaybackRate = debounce(setPlaybackRate, 300)

export default () => {
  init()

  const setPlayInfo = () => {
    stop()
    sendInfo()
  }

  watch(() => appSetting['player.isShowLyricTranslation'], setLyric)
  watch(() => appSetting['player.isShowLyricRoma'], setLyric)
  watch(() => appSetting['player.isSwapLyricTranslationAndRoma'], setLyric)
  watch(() => appSetting['player.isPlayLxlrc'], setLyric)
  watch(() => appSetting['localMusic.cloudLyric'], () => {
    const musicInfo = playMusicInfo.musicInfo
    if (!musicInfo || 'progress' in musicInfo || musicInfo.source != 'local') return
    stop()
    loadLyric()
  })

  window.app_event.on('play', play)
  window.app_event.on('pause', pause)
  window.app_event.on('stop', stop)
  window.app_event.on('error', pause)
  window.app_event.on('musicToggled', setPlayInfo)
  window.app_event.on('lyricUpdated', setLyric)
  window.app_event.on('picUpdated', sendPic)
  window.app_event.on('setPlaybackRate', handleApplyPlaybackRate)

  onBeforeUnmount(() => {
    window.app_event.off('play', play)
    window.app_event.off('pause', pause)
    window.app_event.off('stop', stop)
    window.app_event.off('error', pause)
    window.app_event.off('musicToggled', setPlayInfo)
    window.app_event.off('lyricUpdated', setLyric)
    window.app_event.off('picUpdated', sendPic)
    window.app_event.off('setPlaybackRate', handleApplyPlaybackRate)
  })
}
