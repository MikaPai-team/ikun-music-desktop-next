# 项目交接

更新日期：2026-11-20

## 本次修复（2026-11-20，本地筛选持久化与桌面歌词透明背景）

- 本地播放的搜索词、歌手、专辑、文件夹和格式统一保存为 `localMusic.filterState` JSON 字符串，复用现有设置 IPC 和主进程同步写盘。原因是现有设置合并仅接受原始类型，此前的歌手数组设置会被忽略；本次不修改通用设置合并规则。输入或点选即保存，不等待搜索防抖或页面卸载；返回页面及重启时恢复并立即应用，损坏 JSON / 错误字段安全回退。
- 刷新或首次读取空曲库时保留已选条件，临时缺失的歌曲 / 目录重新出现后仍按原条件筛选。用户主动移除条件、重置全部或切换根目录时更新保存的选择。旧实现没有真正写入磁盘的选择无法追回。
- 桌面歌词窗口显式使用透明原生背景，去掉未锁定时的 20% 黑底和取色失败时逐级叠加的黑色保护面板；锁定与未锁定均保持透明。继续使用封面取色、屏幕背景采样、用户文字透明度与 0.35px 细描边，背景对比度或唱词色差无法兼顾时使用不同的中性字色，不再加整块黑底。
- 本次提交纳入当前本地筛选页面 / 组件 / 派生列表常量 / 三语言文案，以及桌面歌词取色所需的封面同步、采样 IPC 和类型依赖，保证 GitHub 源码包含完整调用链。其他此前未提交的 Last.fm、子页面 UI 与播放改动继续保留；不提交已有未跟踪测试、自检文件及调试图片。
- 验证：按用户要求，未运行任何测试、自检、语法 / 类型检查、编译、开发服务器或打包；仅人工阅读源码、调用链和 diff。已调整本地待运行的 `build-config/tests/local-filter.test.cjs` 与 `src/renderer/utils/desktopLyricColor.check.mjs`，不代表已通过。
- 提交 / 推送：功能提交 `9fa5dac`（`fix: 持久化本地筛选并移除桌面歌词黑底`）已成功推送到 `next/main`（`MikaPai-team/ikun-music-desktop-next`）；本条补记该提交的实际结果。版本号、Release 和发布工作流未修改。
- 已知限制：未在真实 Electron 中验证重启恢复或最终外观；混合背景、极低文字透明度无法保证固定对比度。旧 Windows、macOS、Linux 仍无可靠屏幕采样，以透明底与细描边回退。

## 本次修改（2026-11-15，本地歌词补全与渐出重播修复）

- 改动范围仅为 `src/renderer/core/music/local.ts`、`src/renderer/worker/main/music.ts`、`src/renderer/core/useApp/usePlayer/usePlayProgress.ts`、`src/renderer/plugins/player/index.ts` 和本交接文档。保留工作区已有的 Last.fm、UI、本地筛选及其他未提交修改；共享文件仅提交本次变更，不夹带已有改动。
- 本地歌曲播放时优先读取已有歌词文件与软件缓存；缺失或空歌词继续使用已有在线匹配链路，通过 QQ 音乐等音源获取带时间标签的 LRC。自定义本地 API 返回空 / 无时间标签歌词时继续查找其他音源，读文件失败不再阻断在线补全。
- 按用户选择，补全歌词以 UTF-8 保存为歌曲旁边的同名 `.lrc`，并使用原有软件歌词缓存。缓存已有歌词也可补回缺失文件；采用独占创建，不覆盖原歌词文件（包括手动刷新与并发写入）。目录不可写时仍返回歌词供软件显示与缓存。无需额外设置或依赖；不批量联网扫描整个曲库。
- 修复切歌后短暂重播旧歌开头：`musicToggled` 发生在旧曲渐出之前，原进度处理器会立刻把旧音源跳回 0 秒。现在只记录新曲进度，等新音源 `playing` 时应用；切歌渐出期间忽略旧音源的进度更新。另将结尾渐出判断中的歌曲时长统一转换为毫秒，避免普通歌曲被当作短曲跳过渐出。
- 验证：用户要求停止测试之前，新增歌词 / 渐出回归检查 **9 项通过**；以内存中的旧逻辑重跑渐出检查时 **4 项失败**，证实旧曲被跳回开头与秒 / 毫秒判断问题。此后已停止测试；新增 `build-config/tests/local-lyrics.test.cjs`、`build-config/tests/player-fades.test.cjs` 暂留本地，不纳入本次提交。未运行完整测试、类型检查、webpack、开发服务器或打包，也未进行真实 Electron 听感与在线歌词接口验证。
- 提交 / 推送：功能提交 `5732b0d`（`fix: 补全本地 LRC 并修复渐出后重播开头`）已成功推送到 `next/main`（`MikaPai-team/ikun-music-desktop-next`）；本条补记该提交的实际结果。版本号、Release、发布工作流未修改，未推送 beta；保留所有已有未跟踪调试文件。

## 当前改动

- 修复切歌时旧曲渐出被执行两遍：`src/renderer/plugins/player/index.ts`。`handlePlay()` 会先后调用 `setStop()` 和 `setMusicUrl → setResource()`，两者各自对旧曲启动一段切歌渐出，第二段用 `clearFade()` 顶掉第一段并从当前音量重新渐出，导致旧曲可闻时长约为两段渐出之和。现让两者共用同一段渐出：`setStop` 渐出结束的回调改为新增的 `finishSwitchFade`（有待换源的 `pendingSrc` 就接上新歌，否则停止）；`setResource` 在 `isSwitchFadeRunning` 为真时只存 `pendingSrc` 并返回，不再另起渐出。
- 修复压缩器开关无效：`src/renderer/plugins/player/index.ts` 的 `initConvolver()`。`convolverDynamicsCompressor` 一直在干声通路上，却沿用 DynamicsCompressor 的默认参数（threshold -24 / ratio 12 / knee 30），等于常开重压，把真正的用户压缩器 `compressorNode` 的效果盖掉。现把它改成 -1dB 的峰值限制器（threshold -1 / knee 0 / ratio 20 / attack 0.001 / release 0.1），只在逼近 0dBFS 的瞬时峰值介入给混响防削顶，正常电平直通，用户压缩器滑块重新可闻。

## 本次验证与状态

- 仅做静态核对：改动只引用已有符号（`applyPendingSrc`/`stopAudio`/`isSwitchFadeRunning`/`convolverDynamicsCompressor`），未改节点拓扑。仓库仍无可用 ESLint 配置，`npm run lint` 无法执行；无 type-check 脚本。
- 未在真实界面或打包产物上听感验证切歌渐出与压缩器；需用户本地跑 `npm run dev` 实听确认。
- 已提交 `6c1e0a6`，按用户要求（不编译）直接推送到 fork：`next` 远端已改指 `https://github.com/MikaPai-team/ikun-music-desktop-next.git`，`git push next main` 成功（`b312280..6c1e0a6`）。版本号未改，按惯例两处均属 bug 修复，发版时走 `-fix(n)`。未建 Release（由用户发布）。
- 保留未跟踪文件 `full.png` 与微信截图，未动。

## 上一次改动（2026-10-19）

- 新增「本地歌曲」页面（`/local`）：选择本地目录后递归扫描其中的音频文件，解析标签后作为独立列表播放。
- 支持目录记忆（设置项 `localMusic.directory`）与手动刷新；再次进入页面时若列表为空会自动扫描。
- 目录扫描在 renderer 主 worker 中完成（`getLocalMusicFiles`），复用已有的 `createLocalMusicInfos` 解析 `music-metadata`，播放、封面、内嵌歌词继续走既有 `source == 'local'` 链路。
- 新增列表 ID `LIST_IDS.LOCAL`，列表数据复用现有 DB 列表接口持久化；导航栏新增文件夹图标入口。
- 版本号 3.7.0 -> 3.8.0（minor）。

## 验证与发布

- 初次 `npm run build:renderer` 通过（webpack 5.105.2，compiled successfully）；用户随后要求不再本地构建，后续改动改由 GitHub Actions 编译验证。
- beta 工作流已移除 `Windows_7` 与 `Linux` job，`Release` 的 `needs` 改为 `[Windows, Mac]`，发布说明同步删去对应平台；YAML 已用 js-yaml 解析校验。
- 未在真实界面上手动选择目录或播放；仓库当前没有可用的 ESLint 配置文件，`npm run lint` 无法执行。
- 本次提交推送到 `next` 的 `main` 与 `beta`；beta 推送触发 Build Beta，构建结果以 GitHub Actions 为准。

## 未完成事项 / 已知限制

- 仅扫描 `mp3/flac/ogg/oga/wav/m4a`，不含 ape、m4v 等格式；不跟随符号链接。
- 刷新会覆盖整个本地列表，目录中已删除的歌曲会消失，手动从列表中移除的歌曲会在下次刷新时重新出现。
- 大量歌曲时逐个解析标签较慢，仅有「正在扫描...」状态，没有进度条或取消操作。
- 本地目录是机器相关路径，已并入 appSetting；若后续接入设置同步需排除该键。
- 用户已有的未跟踪文件 `full.png` 和微信截图应保留，不要误提交或删除。
