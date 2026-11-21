import { httpGet } from './request'
import pkg from '../../../package.json'

const repository = new URL(pkg.repository.url.replace(/^git\+/, '')).pathname.replace(/\.git$/, '')
const releasesUrl = `https://api.github.com/repos${repository}/releases`

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

const request = async (url: string, retryNum = 0): Promise<any> => {
  return new Promise((resolve, reject) => {
    httpGet(
      url,
      {
        timeout: 10000,
        headers: { Accept: 'application/vnd.github+json' },
      },
      (err: Error | null, resp: any, body: any) => {
        if (err || resp?.statusCode != 200) {
          ++retryNum >= 3
            ? reject(err || new Error(resp?.statusMessage || String(resp?.statusCode)))
            : request(url, retryNum).then(resolve).catch(reject)
        } else resolve(body)
      }
    )
  })
}

export const getVersionInfo = async (): Promise<LX.VersionInfo & { history: LX.VersionInfo[] }> => {
  const latest: Release = await request(`${releasesUrl}/latest`)
  if (!isRelease(latest)) throw new Error('Invalid GitHub release')
  const releases: unknown = await request(`${releasesUrl}?per_page=100`).catch(() => [])
  return {
    ...toVersionInfo(latest),
    history: Array.isArray(releases)
      ? releases.filter((info) => isRelease(info) && info.tag_name !== latest.tag_name).map(toVersionInfo)
      : [],
  }
}
