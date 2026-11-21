import { onBeforeUnmount, watch } from '@common/utils/vueTools'
import {
  onTimeupdate, getCurrentTime, getDuration, getPlaybackRate,
  preloadResource, isResourcePreloaded, cancelPreload,
} from '@renderer/plugins/player'
import { isPlay, playMusicInfo } from '@renderer/store/player/state'
import { getNextPlayMusicInfo, resetRandomNextMusicInfo, playNext } from '@renderer/core/player'
import { getMusicUrl } from '@renderer/core/music'
import { appSetting } from '@renderer/store/setting'

export default () => {
  let revision = 0
  let loading = false
  let lastAttempt = -Infinity
  let nextInfo: LX.Player.PlayMusicInfo | null = null
  let nextSrc = ''
  let switching = false
  const reset = () => {
    revision++
    loading = false
    lastAttempt = -Infinity
    nextInfo = null
    nextSrc = ''
    switching = false
  }
  const invalidate = () => {
    reset()
    cancelPreload()
  }
  const preload = async (time: number) => {
    const attempt = revision
    loading = true
    lastAttempt = time
    try {
      const info = await getNextPlayMusicInfo()
      if (!info || attempt !== revision) return
      let src = await getMusicUrl({ musicInfo: info.musicInfo })
      if (!src || attempt !== revision) return
      if (!(await preloadResource(src))) {
        if (attempt !== revision) return
        src = await getMusicUrl({ musicInfo: info.musicInfo, isRefresh: true })
        if (!src || attempt !== revision || !(await preloadResource(src))) return
      }
      if (attempt !== revision) return
      nextInfo = info
      nextSrc = src
    } catch {
      // Preloading is optional; normal playback retains URL refresh and error handling.
    } finally {
      if (attempt === revision) loading = false
    }
  }
  const crossfade = async () => {
    const attempt = revision
    const current = playMusicInfo.musicInfo
    const info = nextInfo
    const src = nextSrc
    if (!current || !info || current.id === info.musicInfo.id) return
    switching = true
    try {
      const candidate = await getNextPlayMusicInfo()
      if (attempt !== revision || !candidate) return
      if (candidate.musicInfo.id !== info.musicInfo.id || candidate.listId !== info.listId) {
        invalidate()
        return
      }
      await playNext(true, { current, next: candidate, src })
    } catch {
      // A failed early transition falls back to the normal ended event.
    } finally {
      if (attempt === revision) switching = false
    }
  }
  watch(
    () => [appSetting['player.togglePlayMethod'], appSetting['player.isCrossfade'], appSetting['player.isVolumeFade']],
    () => {
      resetRandomNextMusicInfo()
      invalidate()
    }
  )
  window.app_event.on('setProgress', invalidate)
  window.app_event.on('musicToggled', reset)
  const offTimeupdate = onTimeupdate(() => {
    if (!isPlay.value || !playMusicInfo.musicInfo || window.lx.isPlayedStop) return
    const time = getCurrentTime()
    const duration = getDuration()
    const remaining = (duration - time) * 1000 / getPlaybackRate()
    if (!Number.isFinite(remaining) || remaining <= 20) return
    if (remaining < 10000 && !nextInfo && !loading && time - lastAttempt >= 3) void preload(time)
    if (
      appSetting['player.isCrossfade'] && appSetting['player.isVolumeFade'] &&
      duration * 1000 / getPlaybackRate() > appSetting['player.volumeFadeDuration'] &&
      remaining <= appSetting['player.volumeFadeDuration'] &&
      nextInfo && nextSrc && !switching && isResourcePreloaded(nextSrc)
    ) void crossfade()
  })
  onBeforeUnmount(() => {
    offTimeupdate()
    window.app_event.off('setProgress', invalidate)
    window.app_event.off('musicToggled', reset)
    invalidate()
  })
}
