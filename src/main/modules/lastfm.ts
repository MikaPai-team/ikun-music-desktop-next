import { createHash } from 'node:crypto'
import { safeStorage, shell } from 'electron'
import { mainHandle } from '@common/mainIpc'
import { LASTFM_EVENT_NAME } from '@common/ipcNames'
import type { LastfmAction, LastfmResult, LastfmTrack } from '@common/lastfm'
import { request } from '@common/utils/request'
import getStore from '@main/utils/store'

interface Credentials {
  apiKey: string
  apiSecret: string
  session: string
  username: string
}

class LastfmError extends Error {
  constructor(
    message: string,
    public retryable = false
  ) {
    super(message)
  }
}

export const signParams = (params: Record<string, string>, secret: string) =>
  createHash('md5')
    .update(
      Object.keys(params)
        .filter((key) => key != 'format' && key != 'callback' && key != 'api_sig')
        .sort()
        .map((key) => key + params[key])
        .join('') + secret,
      'utf8'
    )
    .digest('hex')

const validTrack = (track: LastfmTrack) =>
  track &&
  typeof track.artist == 'string' &&
  track.artist.trim().length > 0 &&
  track.artist.length <= 512 &&
  typeof track.track == 'string' &&
  track.track.trim().length > 0 &&
  track.track.length <= 512 &&
  typeof track.album == 'string' &&
  track.album.length <= 1024 &&
  Number.isFinite(track.duration) &&
  track.duration > 30 &&
  Number.isInteger(track.timestamp) &&
  track.timestamp > 0

export default () => {
  const store = getStore('lastfm')
  let credentials: Credentials | null = null
  let pendingAuth: (Credentials & { token: string }) | null = null
  const savedQueue = store.get<LastfmTrack[]>('queue')
  let queue = Array.isArray(savedQueue) ? savedQueue.filter(validTrack) : []
  let error = ''
  let revision = 0
  let flushing = false

  const encrypt = (value: Credentials) => {
    if (
      !safeStorage.isEncryptionAvailable() ||
      (process.platform == 'linux' && safeStorage.getSelectedStorageBackend() == 'basic_text')
    ) {
      throw new LastfmError('storage')
    }
    return safeStorage.encryptString(JSON.stringify(value)).toString('base64')
  }
  try {
    const saved = store.get<string>('credentials')
    if (saved) {
      const value = JSON.parse(
        safeStorage.decryptString(Buffer.from(saved, 'base64'))
      ) as Credentials
      if (
        !/^[a-f\d]{32}$/i.test(value.apiKey) ||
        !/^[a-f\d]{32}$/i.test(value.apiSecret) ||
        typeof value.session != 'string' ||
        typeof value.username != 'string'
      )
        throw new Error()
      credentials = value
    }
  } catch {
    error = 'storage'
  }

  const status = () => ({
    authorized: !!credentials?.session,
    authorizing: !!pendingAuth?.token,
    username: credentials?.username ?? '',
    pending: queue.length,
    error,
  })
  const saveQueue = (next: LastfmTrack[]) => {
    try {
      store.set('queue', next)
    } catch {
      throw new LastfmError('storage')
    }
    queue = next
  }
  const call = async (method: string, values: Record<string, string>, auth: Credentials) => {
    const params = { ...values, method, api_key: auth.apiKey }
    const response = await request<string>('https://ws.audioscrobbler.com/2.0/', {
      method: 'POST',
      form: { ...params, api_sig: signParams(params, auth.apiSecret), format: 'json' },
      retryNum: 0,
      maxRedirect: 0,
      timeout: 15000,
    }).catch(() => {
      throw new LastfmError('network', true)
    })
    let body: any
    try {
      body = typeof response.body == 'string' ? JSON.parse(response.body) : response.body
    } catch {
      throw new LastfmError('response', true)
    }
    if (body?.error) {
      const code = Number(body.error)
      throw new LastfmError('api_' + code, [11, 16, 29].includes(code))
    }
    if (response.statusCode != 200 || !body || typeof body != 'object') {
      throw new LastfmError(
        'network',
        response.statusCode == null || response.statusCode >= 500 || response.statusCode == 429
      )
    }
    return body
  }
  const recordError = (err: unknown) => {
    error = err instanceof LastfmError ? err.message : 'storage'
    if (error == 'api_9' && credentials) {
      const next = { ...credentials, session: '' }
      credentials = next
      try {
        store.set('credentials', encrypt(next))
      } catch {
        error = 'storage'
      }
    }
  }

  const flush = async () => {
    if (
      flushing ||
      !queue.length ||
      !credentials?.session ||
      !global.lx.appSetting['lastfm.enabled']
    )
      return
    flushing = true
    const currentRevision = revision
    const auth = credentials
    try {
      while (
        queue.length &&
        currentRevision == revision &&
        global.lx.appSetting['lastfm.enabled']
      ) {
        const batch = queue.slice(0, 50)
        const values: Record<string, string> = { sk: auth.session }
        batch.forEach((track, index) => {
          for (const key of ['artist', 'track', 'album', 'duration', 'timestamp'] as const) {
            values[`${key}[${index}]`] = String(track[key])
          }
        })
        try {
          const body = await call('track.scrobble', values, auth)
          if (currentRevision != revision) break
          if (
            !body.scrobbles ||
            Number(body.scrobbles['@attr']?.accepted) + Number(body.scrobbles['@attr']?.ignored) !=
              batch.length
          )
            throw new LastfmError('response', true)
          saveQueue(queue.slice(batch.length))
          error = Number(body.scrobbles['@attr'].ignored) ? 'ignored' : ''
        } catch (err) {
          if (currentRevision != revision) break
          recordError(err)
          if (
            !(err instanceof LastfmError) ||
            err.retryable ||
            err.message == 'api_9' ||
            err.message == 'storage'
          )
            break
          saveQueue(queue.slice(batch.length))
          break
        }
      }
    } catch (err) {
      recordError(err)
    } finally {
      flushing = false
      if (currentRevision != revision) void flush()
    }
  }

  mainHandle<LastfmAction, LastfmResult>(LASTFM_EVENT_NAME.request, async ({ params }) => {
    try {
      if (!params || typeof params.action != 'string') throw new LastfmError('invalid')
      switch (params.action) {
        case 'status':
          break
        case 'authorize': {
          if (
            typeof params.apiKey != 'string' ||
            typeof params.apiSecret != 'string' ||
            !/^[a-f\d]{32}$/i.test(params.apiKey.trim()) ||
            !/^[a-f\d]{32}$/i.test(params.apiSecret.trim())
          ) {
            throw new LastfmError('keys')
          }
          const auth = {
            apiKey: params.apiKey.trim(),
            apiSecret: params.apiSecret.trim(),
            session: '',
            username: '',
            token: '',
          }
          encrypt(auth)
          pendingAuth = auth
          const body = await call('auth.getToken', {}, auth)
          if (pendingAuth != auth) throw new LastfmError('cancelled')
          if (typeof body.token != 'string' || !body.token) throw new LastfmError('response')
          auth.token = body.token
          await shell.openExternal(
            'https://www.last.fm/api/auth/?' +
              new URLSearchParams({ api_key: auth.apiKey, token: auth.token }).toString()
          )
          error = ''
          break
        }
        case 'complete': {
          const auth = pendingAuth
          if (!auth?.token) throw new LastfmError('authorize')
          const body = await call('auth.getSession', { token: auth.token }, auth)
          if (pendingAuth != auth) throw new LastfmError('cancelled')
          if (
            typeof body.session?.key != 'string' ||
            !body.session.key ||
            typeof body.session?.name != 'string' ||
            !body.session.name
          )
            throw new LastfmError('response')
          const next = {
            apiKey: auth.apiKey,
            apiSecret: auth.apiSecret,
            session: body.session.key,
            username: body.session.name,
          }
          const nextQueue = credentials?.username == next.username ? queue : []
          store.override({ credentials: encrypt(next), queue: nextQueue })
          credentials = next
          queue = nextQueue
          pendingAuth = null
          revision++
          error = ''
          void flush()
          break
        }
        case 'disconnect':
          store.override({})
          revision++
          credentials = null
          pendingAuth = null
          queue = []
          error = ''
          break
        case 'nowPlaying':
        case 'scrobble': {
          if (!global.lx.appSetting['lastfm.enabled'] || !credentials?.session)
            throw new LastfmError('authorize')
          if (!validTrack(params.track)) throw new LastfmError('invalid')
          if (params.action == 'scrobble') {
            if (
              !queue.some(
                (track) =>
                  track.timestamp == params.track.timestamp &&
                  track.artist == params.track.artist &&
                  track.track == params.track.track
              )
            ) {
              saveQueue([...queue, params.track])
            }
            void flush()
          } else {
            const currentRevision = revision
            const { artist, track, album, duration } = params.track
            try {
              const body = await call(
                'track.updateNowPlaying',
                { artist, track, album, duration: String(duration), sk: credentials.session },
                credentials
              )
              if (currentRevision == revision) {
                if (!body.nowplaying?.ignoredMessage) throw new LastfmError('response')
                error = Number(body.nowplaying.ignoredMessage.code) ? 'ignored' : ''
              }
            } catch (err) {
              if (currentRevision == revision) recordError(err)
            }
          }
          break
        }
        default:
          throw new LastfmError('invalid')
      }
      return { ok: true, status: status() }
    } catch (err) {
      recordError(err)
      return { ok: false, status: status() }
    }
  })

  setInterval(() => {
    void flush()
  }, 60000).unref()
  void flush()
}
