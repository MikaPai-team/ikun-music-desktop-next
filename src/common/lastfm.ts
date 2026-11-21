export interface LastfmTrack {
  artist: string
  track: string
  album: string
  duration: number
  timestamp: number
}

export interface LastfmStatus {
  authorized: boolean
  authorizing: boolean
  username: string
  pending: number
  error: string
}

export type LastfmAction =
  | { action: 'status' | 'complete' | 'disconnect' }
  | { action: 'authorize'; apiKey: string; apiSecret: string }
  | { action: 'nowPlaying' | 'scrobble'; track: LastfmTrack }

export interface LastfmResult {
  ok: boolean
  status: LastfmStatus
}
