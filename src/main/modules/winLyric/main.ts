import path from 'node:path'
import { release } from 'node:os'
import { BrowserWindow, desktopCapturer, screen } from 'electron'
import { debounce, getPlatform, isLinux, isWin } from '@common/utils'
import { initWindowSize, minHeight, minWidth } from './utils'
import { mainSend } from '@common/mainIpc'
import { encodePath } from '@common/utils/electron'

// require('./event')
// require('./rendererEvent')

let browserWindow: Electron.BrowserWindow | null = null
let isWinBoundsUpdateing = false

const saveBoundsConfig = debounce((config: Partial<LX.AppSetting>) => {
  global.lx.event_app.update_config(config)
  if (isWinBoundsUpdateing) isWinBoundsUpdateing = false
}, 500)

const winEvent = () => {
  if (!browserWindow) return

  // browserWindow.on('close', () => {
  //   if (global.lx.appSetting['desktopLyric.enable'] && !global.lx.mainWindowClosed) {
  //     browserWindow = null
  //     global.lx.event_app.update_config({ 'desktopLyric.enable': false })
  //   }
  // })

  browserWindow.on('closed', () => {
    browserWindow = null
  })

  browserWindow.on('move', () => {
    // bounds = browserWindow.getBounds()
    // console.log('move', isWinBoundsUpdateing)
    if (isWinBoundsUpdateing) {
      const bounds = browserWindow!.getBounds()
      saveBoundsConfig({
        'desktopLyric.x': bounds.x,
        'desktopLyric.y': bounds.y,
        'desktopLyric.width': bounds.width,
        'desktopLyric.height': bounds.height,
      })
    } else if (isWin) {
      // Linux 不允许将窗口设置出屏幕之外，MacOS未知，故只在Windows下执行强制设置
      // 非主动调整窗口触发的窗口位置变化将重置回设置值
      browserWindow!.setBounds({
        x: global.lx.appSetting['desktopLyric.x'] ?? 0,
        y: global.lx.appSetting['desktopLyric.y'] ?? 0,
        width: global.lx.appSetting['desktopLyric.width'],
        height: global.lx.appSetting['desktopLyric.height'],
      })
    }
  })

  browserWindow.on('resize', () => {
    // bounds = browserWindow.getBounds()
    // console.log(bounds)
    isWinBoundsUpdateing = true
    const bounds = browserWindow!.getBounds()
    saveBoundsConfig({
      'desktopLyric.x': bounds.x,
      'desktopLyric.y': bounds.y,
      'desktopLyric.width': bounds.width,
      'desktopLyric.height': bounds.height,
    })
  })

  // browserWindow.on('restore', () => {
  //   browserWindow.webContents.send('restore')
  // })
  // browserWindow.on('focus', () => {
  //   browserWindow.webContents.send('focus')
  // })

  browserWindow.once('ready-to-show', () => {
    showWindow()
    if (global.lx.appSetting['desktopLyric.isLock']) {
      browserWindow!.setIgnoreMouseEvents(true, {
        forward: !isLinux && global.lx.appSetting['desktopLyric.isHoverHide'],
      })
    }
    // linux下每次重开时貌似要重新设置置顶
    // if (isLinux && global.lx.appSetting['desktopLyric.isAlwaysOnTop']) {
    //   browserWindow!.setAlwaysOnTop(global.lx.appSetting['desktopLyric.isAlwaysOnTop'], 'screen-saver')
    // }
    if (
      global.lx.appSetting['desktopLyric.isAlwaysOnTop'] &&
      global.lx.appSetting['desktopLyric.isAlwaysOnTopLoop']
    )
      alwaysOnTopTools.startLoop()
    browserWindow!.blur()
  })
}

export const createWindow = () => {
  closeWindow()
  if (!global.envParams.workAreaSize) return
  let x = global.lx.appSetting['desktopLyric.x']
  let y = global.lx.appSetting['desktopLyric.y']
  let width = global.lx.appSetting['desktopLyric.width']
  let height = global.lx.appSetting['desktopLyric.height']
  let isAlwaysOnTop = global.lx.appSetting['desktopLyric.isAlwaysOnTop']
  // let isLockScreen = global.lx.appSetting['desktopLyric.isLockScreen']
  let isShowTaskbar = global.lx.appSetting['desktopLyric.isShowTaskbar']
  // let { width: screenWidth, height: screenHeight } = global.envParams.workAreaSize
  const winSize = initWindowSize(x, y, width, height)
  global.lx.event_app.update_config({
    'desktopLyric.x': winSize.x,
    'desktopLyric.y': winSize.y,
    'desktopLyric.width': winSize.width,
    'desktopLyric.height': winSize.height,
  })

  const { shouldUseDarkColors, theme } = global.lx.theme

  /**
   * Initial window options
   */
  browserWindow = new BrowserWindow({
    height: winSize.height,
    width: winSize.width,
    x: winSize.x,
    y: winSize.y,
    minWidth,
    minHeight,
    useContentSize: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    // enableRemoteModule: false,
    // icon: join(global.__static, isWin ? 'icons/256x256.ico' : 'icons/512x512.png'),
    resizable: isWin,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    roundedCorners: false,
    show: false,
    alwaysOnTop: isAlwaysOnTop,
    skipTaskbar: !isShowTaskbar,
    webPreferences: {
      contextIsolation: false,
      webSecurity: false,
      sandbox: false,
      nodeIntegration: true,
      enableWebSQL: false,
      webgl: false,
      spellcheck: false, // 禁用拼写检查器
      backgroundThrottling: false,
    },
  })

  const winURL =
    process.env.NODE_ENV !== 'production'
      ? 'http://localhost:9081/lyric.html'
      : `file://${path.join(encodePath(__dirname), 'lyric.html')}`
  void browserWindow.loadURL(
    winURL +
      `?os=${getPlatform()}&dark=${shouldUseDarkColors}&theme=${encodeURIComponent(JSON.stringify(theme))}`
  )

  winEvent()
  // browserWindow.webContents.openDevTools()
  global.lx.event_app.desktop_lyric_window_created(browserWindow)
}
export const isExistWindow = (): boolean => !!browserWindow

export const closeWindow = () => {
  if (!browserWindow) return
  browserWindow.close()
}

export const showWindow = () => {
  if (!browserWindow) return
  browserWindow.show()
}

export const setResizeable = (isResizeable: boolean) => {
  if (!browserWindow) return
  browserWindow.setResizable(isResizeable)
}

export const sendEvent = <T = any>(name: string, params?: T) => {
  if (!browserWindow) return
  mainSend(browserWindow, name, params)
}

export const getBounds = (): Electron.Rectangle => {
  if (!browserWindow) throw new Error('window is not available')
  return browserWindow.getBounds()
}

let backgroundCapture: Promise<LX.DesktopLyric.BackgroundSample | null> | null = null

export const getBackgroundSample = (): Promise<LX.DesktopLyric.BackgroundSample | null> => {
  if (global.lx.appSetting['desktopLyric.autoColor'] === false) return Promise.resolve(null)
  const lyricWindow = browserWindow
  // shortcut: 旧 Windows / 其他平台不能可靠排除歌词窗口，使用细描边；有原生排除捕获 API 后再接入。
  if (!isWin || Number(release().split('.')[2]) < 19041 || !lyricWindow?.isVisible()) {
    return Promise.resolve(null)
  }
  if (backgroundCapture) return backgroundCapture
  backgroundCapture = (async () => {
    const bounds = lyricWindow.getContentBounds()
    const wasProtected = lyricWindow.isContentProtected()
    try {
      // 只在采样时排除本窗口，避免把歌词自身取成背景；不隐藏实际窗口。
      lyricWindow.setContentProtection(true)
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        // 最终仅使用 16x8 色点，避免周期性分配高分辨率屏幕缩略图。
        thumbnailSize: { width: 320, height: 180 },
        fetchWindowIcons: false,
      })
      if (
        lyricWindow.isDestroyed() ||
        browserWindow !== lyricWindow ||
        global.lx.appSetting['desktopLyric.autoColor'] === false
      ) return null
      const current = lyricWindow.getContentBounds()
      if (
        current.x !== bounds.x || current.y !== bounds.y ||
        current.width !== bounds.width || current.height !== bounds.height
      ) return null
      const colors: LX.DesktopLyric.BackgroundSample['colors'] = []
      const displays = screen.getAllDisplays()
      for (const display of displays) {
        const area = display.bounds
        const left = Math.max(bounds.x, area.x)
        const top = Math.max(bounds.y, area.y)
        const right = Math.min(bounds.x + bounds.width, area.x + area.width)
        const bottom = Math.min(bounds.y + bounds.height, area.y + area.height)
        if (right <= left || bottom <= top) continue
        const source = sources.find((source) => source.display_id === String(display.id)) ??
          (displays.length === 1 && sources.length === 1 ? sources[0] : undefined)
        if (!source || source.thumbnail.isEmpty()) continue
        const size = source.thumbnail.getSize()
        const x = Math.floor(((left - area.x) / area.width) * size.width)
        const y = Math.floor(((top - area.y) / area.height) * size.height)
        const width = Math.min(
          size.width - x, Math.ceil(((right - left) / area.width) * size.width)
        )
        const height = Math.min(
          size.height - y, Math.ceil(((bottom - top) / area.height) * size.height)
        )
        if (width <= 0 || height <= 0) continue
        const pixels = source.thumbnail
          .crop({ x, y, width, height })
          .resize({ width: 16, height: 8, quality: 'good' })
          .toBitmap({ scaleFactor: 1 })
        // Windows NativeImage 的位图是 BGRA；只传颜色，截图不落盘、不发给 renderer。
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] < 128) continue
          colors.push({ r: pixels[i + 2], g: pixels[i + 1], b: pixels[i] })
        }
      }
      return colors.length ? { bounds, colors } : null
    } finally {
      if (!lyricWindow.isDestroyed()) lyricWindow.setContentProtection(wasProtected)
    }
  })().finally(() => {
    backgroundCapture = null
  })
  return backgroundCapture
}

export const setBounds = (bounds: Electron.Rectangle) => {
  if (!browserWindow) return
  isWinBoundsUpdateing = true
  browserWindow.setBounds(bounds)
}

export const setIgnoreMouseEvents = (
  ignore: boolean,
  options?: Electron.IgnoreMouseEventsOptions
) => {
  if (!browserWindow) return
  browserWindow.setIgnoreMouseEvents(ignore, options)
}

export const setSkipTaskbar = (skip: boolean) => {
  if (!browserWindow) return
  browserWindow.setSkipTaskbar(skip)
}

export const setAlwaysOnTop = (
  flag: boolean,
  level?:
    | 'normal'
    | 'floating'
    | 'torn-off-menu'
    | 'modal-panel'
    | 'main-menu'
    | 'status'
    | 'pop-up-menu'
    | 'screen-saver'
    | undefined,
  relativeLevel?: number | undefined
) => {
  if (!browserWindow) return
  browserWindow.setAlwaysOnTop(flag, level, relativeLevel)
}

export const getMainFrame = (): Electron.WebFrameMain | null => {
  if (!browserWindow) return null
  return browserWindow.webContents.mainFrame
}

interface AlwaysOnTopTools {
  timeout: NodeJS.Timeout | null
  setAlwaysOnTop: (isLoop: boolean) => void
  startLoop: () => void
  clearLoop: () => void
}
export const alwaysOnTopTools: AlwaysOnTopTools = {
  timeout: null,
  setAlwaysOnTop(isLoop) {
    this.clearLoop()
    setAlwaysOnTop(global.lx.appSetting['desktopLyric.isAlwaysOnTop'], 'screen-saver')
    // console.log(isLoop)
    if (isLoop) this.startLoop()
  },
  startLoop() {
    this.clearLoop()
    this.timeout = setInterval(() => {
      if (!isExistWindow()) {
        this.clearLoop()
        return
      }
      setAlwaysOnTop(true, 'screen-saver')
    }, 500)
  },
  clearLoop() {
    if (!this.timeout) return
    clearInterval(this.timeout)
    this.timeout = null
  },
}
