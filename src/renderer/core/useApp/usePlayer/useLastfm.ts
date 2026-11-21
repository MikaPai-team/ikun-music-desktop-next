import { onBeforeUnmount, watch } from '@common/utils/vueTools'
import {
  getCurrentTime,
  getDuration,
  getPlaybackRate,
  onTimeupdate,
  onSeeking,
  isSwitchingAudioSource,
} from '@renderer/plugins/player'
import { isPlay, musicInfo, playMusicInfo } from '@renderer/store/player/state'
import { appSetting } from '@renderer/store/setting'
import { lastfm, lastfmRequest } from '@renderer/store/lastfm'
import type { LastfmTrack } from '@common/lastfm'

export default () => {
  let track: LastfmTrack | null = null
  let listened = 0
  let playing = false
  let submitted = false
  let submitting = false
  let position = 0
  let clock = 0
  let rate = 1
  let revision = 0
  let starting = false
  let nowPlayingSent = false
  const enabled = () => appSetting['lastfm.enabled'] && lastfm.authorized
  const baseline = () => {
    position = getCurrentTime()
    clock = performance.now()
    rate = getPlaybackRate()
  }
  const tick = () => {
    const currentPosition = getCurrentTime()
    const now = performance.now()
    const elapsed = Math.max(0, (now - clock) / 1000)
    const advanced = (currentPosition - position) / rate
    if (
      playing &&
      enabled() &&
      !isSwitchingAudioSource() &&
      advanced > 0 &&
      advanced <= elapsed + 1
    ) {
      listened += Math.min(advanced, elapsed)
    }
    baseline()
    if (!track || !enabled() || submitted || submitting) return
    track.duration = getDuration()
    if (!Number.isFinite(track.duration) || track.duration <= 30 || listened < 15) return
    const current = track
    submitting = true
    void lastfmRequest({
      action: 'scrobble',
      track: { ...current, duration: Math.ceil(current.duration) },
    }).then((ok) => {
      if (track != current) return
      submitted = ok
      submitting = false
    })
  }
  const pause = () => {
    tick()
    playing = false
  }
  const reset = () => {
    revision++
    starting = false
    nowPlayingSent = false
    playing = false
    track = null
    listened = 0
    submitted = false
    submitting = false
    baseline()
  }
  const nowPlaying = () => {
    if (!track || nowPlayingSent || !playing) return
    nowPlayingSent = true
    void lastfmRequest({ action: 'nowPlaying', track: { ...track } })
  }
  const play = async () => {
    if (!enabled() || isSwitchingAudioSource()) return
    playing = true
    baseline()
    if (!track) {
      if (starting || !musicInfo.id) return
      const duration = getDuration()
      if (!Number.isFinite(duration) || duration <= 30) return
      const timestamp = Math.floor(Date.now() / 1000)
      const attempt = revision
      starting = true
      let tags = {
        artist: musicInfo.singer.trim(),
        track: musicInfo.name.trim(),
        album: musicInfo.album.trim(),
      }
      const currentMusic = playMusicInfo.musicInfo
      const sourceMusic =
        currentMusic &&
        ('progress' in currentMusic ? currentMusic.metadata.musicInfo : currentMusic)
      try {
        if (sourceMusic?.source == 'local') {
          tags = await window.lx.worker.main.getLocalMusicTags(sourceMusic.meta.filePath)
        }
      } catch {
        if (attempt == revision) {
          starting = false
          lastfm.error = 'metadata'
        }
        return
      }
      if (attempt != revision || !enabled()) return
      starting = false
      if (!tags.track || !tags.artist) {
        lastfm.error = 'metadata'
        return
      }
      track = { ...tags, duration: Math.ceil(duration), timestamp }
    }
    nowPlaying()
  }
  const seek = () => {
    baseline()
  }
  const events = [
    [
      'playerPlaying',
      () => {
        void play()
      },
    ],
    ['pause', pause],
    ['playerWaiting', pause],
    ['playerError', pause],
    ['playerEmptied', pause],
    ['playerLoadstart', pause],
    ['playerEnded', pause],
    ['stop', reset],
    ['musicToggled', reset],
    ['setProgress', seek],
  ] as const
  for (const [name, handler] of events) window.app_event.on(name, handler)
  const offTimeupdate = onTimeupdate(tick)
  const offSeeking = onSeeking(seek)
  watch(
    () => [appSetting['lastfm.enabled'], lastfm.authorized, lastfm.username],
    () => {
      reset()
      if (isPlay.value) void play()
    }
  )
  void lastfmRequest({ action: 'status' })
  onBeforeUnmount(() => {
    for (const [name, handler] of events) window.app_event.off(name, handler)
    offTimeupdate()
    offSeeking()
    reset()
  })
}
