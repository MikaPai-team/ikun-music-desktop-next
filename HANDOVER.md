# 项目交接

更新日期：2026-11-21

## 本次修复（2026-11-21，3.10.0-fix.2，桌面歌词唱词色差回退）

- 原因：复杂背景、无可靠采样或文字透明度较低时，旧回退评分给背景可读性 100 倍权重，唱词色差只有最多 2 分，已唱 / 未唱字色会收敛到几乎一样的明暗值。现在可达到 2:1 色差时，优先在这组颜色中选择对背景最易读的色调；达不到时选择可达到的最大色差，不再仅保证 RGB 值不完全相等。
- 改动仅在桌面歌词共用取色函数，横排、竖排、逐字与整行歌词沿用现有调用链。封面色相、至少 10% 原色、透明背景、用户透明度和 0.35px 描边继续保留。项目及锁文件同步升级为 `3.10.0-fix.2`。
- 验证：人工阅读取色与歌词填色调用链，`git diff --check` 通过；已补充复杂背景、采样失败与低透明度回归用例，按用户要求未运行任何测试或自检。47 份此前修改 / 未跟踪文件 SHA-256 比对一致，既有交接内容保留。
- 编译：`npm run build:main`、`npm run build:renderer`、`npm run build:renderer-lyric`、`npm run build:renderer-scripts` 与 `npm run pack:win:setup:x64` 均成功。生成 `build/ikun-music-desktop-v3.10.0-fix.2-x64-Setup.exe`，97,742,699 字节，SHA-256 为 `74b69ebbc93e9badbc539d77bcdabfdbbcf7947d1ae6757f7ee9eb047d7d2813`。项目、锁文件与包内版本一致；包内主程序、worker、renderer、歌词与 API 五份脚本均与本次编译输出一致，`latest.yml` 的版本、文件名、大小和 SHA-512 均核对一致。保留此前安装包。
- 提交 / 推送：修复提交 `f232d8d`（`fix: 保证桌面歌词回退颜色可区分`）已成功推送到 `next/main`（`MikaPai-team/ikun-music-desktop-next`）；本条实际状态补记随交接文档提交。本次仅纳入修复、版本号、待运行回归用例与本交接条目，此前工作区修改与未跟踪文件继续保留。
- 已知限制：真实桌面视觉效果尚未实测；复杂背景下无法同时保证两种字色对所有背景点达到固定可读性要求，极低透明度无法保证 2:1 色差。本地安装包包含工作区此前未提交的改动；本次未发布 Release 或修改发布工作流，其他平台未编译。

## 本次修复（2026-11-20，3.10.0-fix.1，动态歌词色调与主题简化）

- 桌面歌词原先固定使用黑 / 白未唱字色，无法同时满足对比度与唱词色差时，已唱色又回退到灰色。本次两种字色均从封面颜色动态调整明暗，保留至少 10% 原色，不再因约束失败丢掉色相或选择纯黑 / 纯白。不能满足固定对比度时优先保留可读性，再兼顾唱词色差；透明背景与 0.35px 细描边继续保留。
- 复用现有 1.5 秒窗下背景采样、窗口移动 / 缩放、封面与文字透明度变化时的重算流程，背景改变后会重新选取字色。只修改桌面歌词前景算法，播放详情页的取色不变。
- 设置 → 基础外观 → 主题仅保留「浅色 / 深色 / 自动」，复用原有单选控件和 Fluent 浅深主题。移除更多皮肤、新增 / 编辑与自动主题的右键配置入口；自动跟随系统浅深模式。打开基础设置时按旧主题的明暗属性映射到新模式，自动模式继续保留，预设统一为 Fluent；用户自定义主题数据与文件没有删除。
- `package.json` 与 `package-lock.json` 同步由 `3.10.0` 调整为 `3.10.0-fix.1`。中文、繁体中文与英文标签 / 自动说明同步更新。
- 验证：人工阅读取色、设置持久化和自动切换调用链，`git diff --check` 通过；沿用用户要求未跑测试。新增取色回归测试待执行；已有未跟踪 `desktopLyricColor.check.mjs` 仅更新旧的黑白色断言，继续保留在本地，不纳入提交。43 份无关的已有修改 / 未跟踪文件 SHA-256 保持一致。
- 编译：`npm run build:main`、`npm run build:renderer`、`npm run build:renderer-lyric`、`npm run build:renderer-scripts` 与 `npm run pack:win:setup:x64` 均成功。生成 `build/ikun-music-desktop-v3.10.0-fix.1-x64-Setup.exe`，97,742,765 字节，SHA-256 为 `fb78b622d7054f0d63c6fdba9f3bd57e90753dc1b591b45dab21bdc9cdc8ead8`。两份项目文件与包内版本一致，包内五份主程序 / worker / 歌词 / API 脚本与本次编译输出一致；新取色算法和三选项主题页已包含，`latest.yml` 的版本、文件名、大小和 SHA-512 均核对一致。
- 提交 / 推送：修复提交 `7988dfe`（`fix: 保留桌面歌词动态色调并简化主题选择`）已成功推送到 `next/main`（`MikaPai-team/ikun-music-desktop-next`）；本次状态补记随交接文档提交。本次只纳入动态歌词色调、主题页与三语言文案、版本号、新回归用例和本交接条目，其他既有修改继续留在工作区。本次未创建 Release 或触发云端发布。
- 已知限制：尚未验证真实桌面视觉效果与设置交互。旧 Windows、macOS、Linux 无可靠排除歌词窗口的背景采样；混合背景或低透明度无法保证统一对比度，仍用保留原色的明暗调整与细描边处理。本地编译包含此前未提交的改动。

## 本次功能（2026-11-20，3.10.0，本地云端歌词）

- 设置 → 歌词新增「本地播放始终使用云端歌词」，默认开启，复用现有设置持久化。按歌曲标签中的歌名 / 歌手搜索，失败时沿用文件名及歌手 / 歌名两种顺序的匹配；忽略文件自带歌词、同名 LRC 和本地歌词缓存。关闭后恢复原有歌词优先级。
- 开关切换立即清空旧歌词并重新加载当前本地歌曲，主界面与桌面歌词共用结果。播放、恢复播放与切换开关共用加载入口，通过请求序号与当前歌曲隔离迟到结果。
- 云端模式强制在线获取，仅显示歌词，不改写音乐文件、同名 LRC 或本地歌曲的编辑缓存。没有在线结果时沿用歌词加载失败提示；需要网络，匹配准确度取决于歌曲标签、文件名与音源。
- 项目版本从当前本地 `3.9.0` 同步升级至 `3.10.0`，更新 `package.json` 与 `package-lock.json` 的两处项目版本。
- 验证：人工阅读调用链与 diff，`git diff --check` 通过；按用户要求未运行测试。新增云端歌词回归用例待执行；既有未跟踪 `local-lyrics.test.cjs` 仅补充关闭新开关的设置模拟，继续留在本地，不纳入提交。41 份不属于本次修改的已有修改 / 调试文件 SHA-256 保持一致。
- 编译：`npm run build:main`、`npm run build:renderer`、`npm run build:renderer-lyric`、`npm run build:renderer-scripts` 与 `npm run pack:win:setup:x64` 均成功。安装包为 `build/ikun-music-desktop-v3.10.0-x64-Setup.exe`，97,765,624 字节，SHA-256 为 `cfebefd6c49209e3e8697479739c3fb80b20e7fa3a66f35fb74a5805af8deb0d`；包内版本与两份项目文件一致，包内五份主程序 / worker / 歌词 / API 脚本与当前编译输出一致，新开关与云端逻辑已包含；`latest.yml` 的版本、文件名、大小和 SHA-512 核对一致。独立编译四个目标，保留此前安装包。
- 提交 / 推送：功能提交 `4be1c9a`（`feat: 本地播放支持默认启用的云端歌词`）已成功推送到 `next/main`（`MikaPai-team/ikun-music-desktop-next`）。本次交接状态补记随文档提交；功能提交仅纳入新功能、版本号与本交接条目，此前 Last.fm、界面与播放修改，以及已有未跟踪调试文件继续保留。
- 已知限制：尚未验证真实安装、播放、设置持久化和在线匹配；本地安装包包含工作区此前未提交的 Last.fm、界面与播放修改，源码提交仅包含本次功能。其他平台尚未编译；本次未创建 Release 或触发云端发布。

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
