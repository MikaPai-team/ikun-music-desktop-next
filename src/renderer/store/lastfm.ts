import { reactive } from '@common/utils/vueTools'
import { rendererInvoke } from '@common/rendererIpc'
import { LASTFM_EVENT_NAME } from '@common/ipcNames'
import type { LastfmAction, LastfmResult, LastfmStatus } from '@common/lastfm'

export const lastfm = reactive<LastfmStatus>({
  authorized: false,
  authorizing: false,
  username: '',
  pending: 0,
  error: '',
})

export const lastfmRequest = async (action: LastfmAction) => {
  try {
    const result = await rendererInvoke<LastfmAction, LastfmResult>(
      LASTFM_EVENT_NAME.request,
      action
    )
    Object.assign(lastfm, result.status)
    return result.ok
  } catch {
    lastfm.error = 'network'
    return false
  }
}
