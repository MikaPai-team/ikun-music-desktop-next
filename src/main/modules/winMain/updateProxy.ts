import { autoUpdater } from 'electron-updater'
import { getProxy } from '@main/utils'

let configuredProxy = ''
let proxySetup: Promise<void> = Promise.resolve()

export const prepareUpdateSession = async () => {
  const ses = autoUpdater.netSession
  const proxy = getProxy()
  const proxyRules = proxy ? `http://${proxy.host}:${proxy.port}` : ''
  // Serialize changes so concurrent metadata and download requests use one session policy.
  const setup = proxySetup.catch(() => {}).then(async () => {
    const key = proxyRules || 'system'
    if (configuredProxy !== key) {
      await ses.setProxy(proxyRules
        ? { mode: 'fixed_servers', proxyRules }
        : { mode: 'system' })
      configuredProxy = key
    }
    if (!proxyRules) await ses.forceReloadProxyConfig()
  })
  proxySetup = setup
  await setup
  return ses
}
