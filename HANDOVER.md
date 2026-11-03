# 项目交接

更新日期：2026-11-03

## 当前改动

- 修复切歌时旧曲渐出被执行两遍：`src/renderer/plugins/player/index.ts`。`handlePlay()` 会先后调用 `setStop()` 和 `setMusicUrl → setResource()`，两者各自对旧曲启动一段切歌渐出，第二段用 `clearFade()` 顶掉第一段并从当前音量重新渐出，导致旧曲可闻时长约为两段渐出之和。现让两者共用同一段渐出：`setStop` 渐出结束的回调改为新增的 `finishSwitchFade`（有待换源的 `pendingSrc` 就接上新歌，否则停止）；`setResource` 在 `isSwitchFadeRunning` 为真时只存 `pendingSrc` 并返回，不再另起渐出。
- 修复压缩器开关无效：`src/renderer/plugins/player/index.ts` 的 `initConvolver()`。`convolverDynamicsCompressor` 一直在干声通路上，却沿用 DynamicsCompressor 的默认参数（threshold -24 / ratio 12 / knee 30），等于常开重压，把真正的用户压缩器 `compressorNode` 的效果盖掉。现把它改成 -1dB 的峰值限制器（threshold -1 / knee 0 / ratio 20 / attack 0.001 / release 0.1），只在逼近 0dBFS 的瞬时峰值介入给混响防削顶，正常电平直通，用户压缩器滑块重新可闻。

## 本次验证与状态

- 仅做静态核对：改动只引用已有符号（`applyPendingSrc`/`stopAudio`/`isSwitchFadeRunning`/`convolverDynamicsCompressor`），未改节点拓扑。仓库仍无可用 ESLint 配置，`npm run lint` 无法执行；无 type-check 脚本。
- 未在真实界面或打包产物上听感验证切歌渐出与压缩器；需用户本地跑 `npm run dev` 实听确认。
- 未提交、未推送；版本号未改。按惯例两处均属 bug 修复，发版时走 `-fix(n)`。
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
