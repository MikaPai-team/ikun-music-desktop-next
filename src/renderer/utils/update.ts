import { getUpdateReleaseInfo } from './ipc'

interface Release {
  tag_name: string
  body: string | null
  draft: boolean
  prerelease: boolean
}
const isRelease = (info: Release) =>
  info && !info.draft && !info.prerelease && typeof info.tag_name === 'string' &&
  /^v?\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(info.tag_name) &&
  (info.body == null || typeof info.body === 'string')
const toVersionInfo = (info: Release) => ({ version: info.tag_name.replace(/^v/, ''), desc: info.body ?? '' })

const request = async (endpoint: 'latest' | 'history', retryNum = 0): Promise<any> => {
  try {
    return await getUpdateReleaseInfo(endpoint)
  } catch (error) {
    if (++retryNum >= 3) throw error
    return request(endpoint, retryNum)
  }
}

export const getVersionInfo = async (): Promise<LX.VersionInfo & { history: LX.VersionInfo[] }> => {
  const latest: Release = await request('latest')
  if (!isRelease(latest)) throw new Error('Invalid GitHub release')
  const releases: unknown = await request('history').catch(() => [])
  return {
    ...toVersionInfo(latest),
    history: Array.isArray(releases)
      ? releases.filter((info) => isRelease(info) && info.tag_name !== latest.tag_name).map(toVersionInfo)
      : [],
  }
}
