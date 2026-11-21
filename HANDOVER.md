# 项目交接

更新日期：2026-11-21

## 本次更新网络改进（2026-11-21，3.11.0-fix.1）

- 用户已确认 3.11.0 功能正常，alpha-test 已快进合入并推送 main（688036a）；3.11.0 草稿 Release 已正式发布并设为最新，ID 453509973，地址 https://github.com/MikaPai-team/ikun-music-desktop-next/releases/tag/v3.11.0 ，原有三份已核验附件保留。
- 用户确认本次代理范围为 GitHub 更新相关请求，软件手动代理优先，未启用时跟随系统代理。版本说明从 renderer 的 Node 请求迁至受限 IPC，只允许 latest/history 两种固定 GitHub 端点；复用 electron-updater 的 netSession，让说明、检查、更新元数据、安装包与 blockmap 下载共用代理。
- 每次更新操作前应用现有手动 / 启动参数代理；没有手动代理时使用 Electron system 模式并重新加载系统代理配置，支持操作系统代理开关、本地 HTTP 代理和 PAC。串行配置变更，配置失败正常报错；不增加第三方依赖，不改音乐、封面、歌词或其他第三方请求。
- 项目和锁文件同步改为 3.11.0-fix.1；新增 update-proxy.test.cjs 用例尚未运行，沿用用户不运行测试要求。当前仅人工阅读调用链，尚未编译本次版本；代理开关 / PAC / 更新下载的真实 Electron 联动尚未验证。
- 本轮用户明确指定直接推到 main，作为仅限本次的 alpha-test 流程例外。本次代理修改尚未提交 / 推送，编译和产物确认仍待执行，以后续状态补记为准。旧未跟踪测试、调试文件继续保留。


## 完成状态（2026-11-21，3.11.0 等待产物确认）

- 本轮交叠渐变、主题色块和更新源改动已完成。源码快照 c93307a 与暂停后预加载修正 71becd0 均已推送 alpha-test；main 仍为 2ee399791fdfb7d93a2bf84a67448067aa9e4bdd，未合入新源码。本条编译 / 发布状态文档随单独提交推送 alpha-test，构建源码仍对应 71becd010d3b509781fdedaefa508af2e9083254。
- main、renderer、renderer-lyric、renderer-scripts 四个编译目标及 pack:win:setup:x64 均成功；renderer 在预加载修正推送后重新编译。生成 build/ikun-music-desktop-v3.11.0-x64-Setup.exe，97,797,821 字节，SHA-256 为 8a7df88be083c4e7aac3b52b4f8c6bca1443acbc93c1bb695788f0e69be09a22。
- 包内项目版本为 3.11.0，应用 PE 架构为 x64（8664）；app-update.yml 和仓库 URL 指向 MikaPai-team/ikun-music-desktop-next。包内七份主程序、renderer、歌词、API 和 worker 脚本与编译输出一致；交叠设置和主题色块已包含。latest.yml 的文件名、大小和 SHA-512 一致。安装包没有 Authenticode 签名；保留未跟踪文件使现有 getGitInfo 不显示软件内的提交 ID，未更改该构建规则。
- 3.11.0 已上传草稿 Release，ID 453509973，地址 https://github.com/MikaPai-team/ikun-music-desktop-next/releases/tag/untagged-d9362c9ca761d41f59bc 。安装包、blockmap、latest.yml 均为 uploaded，远端大小和 SHA-256 与本地一致。草稿尚未正式发布或设为最新；需用户确认产物没问题后，再合入 main 并正式发布。用户尚未确认。
- fix.2 正式 Release 已发布，ID 453506543，附件摘要匹配，公开下载返回 HTTP 200 和正确 Content-Length 97,742,699；该版本仍为最新正式版，其旧更新源不因发布新源码而改变。
- 按用户要求未运行任何自动测试或回归自检，新增 player-crossfade.test.cjs 待执行；本轮验证为编译、打包和产物 / Release 核对，没有实际安装、听感或真实主题界面验证。未改动的 40 份此前源码与未跟踪文件 SHA-256 均保持一致；旧未跟踪测试和调试图片仍未提交。
- 旧安装包和旧 blockmap 删除两次被自动审批以 blocked by policy 拒绝，无法删除，因此此前版本产物仍在 build 中；没有借用其他工具绕过删除限制。保留 fix.2 文件及独立元数据备份 latest-3.10.0-fix.2.yml；新 latest.yml 对应 3.11.0。旧产物清理尚未完成。


## 过程状态补记（2026-11-21）

- 源码快照 c93307a 已推送 next/alpha-test；main 未更新。暂停后重新加载下一首预缓存的补充修正随本条提交。
- 现有 fix.2 已发布正式 Release：ID 453506543，地址 https://github.com/MikaPai-team/ikun-music-desktop-next/releases/tag/v3.10.0-fix.2 。安装包 97,742,699 字节，SHA-256 为 74b69ebbc93e9badbc539d77bcdabfdbbcf7947d1ae6757f7ee9eb047d7d2813；安装包、blockmap 和 latest.yml 均已 uploaded，远端大小与摘要一致。
- 3.11.0 的 main、renderer-lyric 和 renderer-scripts 编译成功；renderer 正在编译，x64 安装包尚未生成。未执行测试。
- 旧产物清理两次被自动审批拒绝，均仅返回 blocked by policy，第二次已改为明确列出的绝对文件路径，仍被拒绝；未删除任何旧产物。已另存 fix.2 更新元数据为 build/latest-3.10.0-fix.2.yml，后续新包不会覆盖其本地备份。

## 本次功能（2026-11-21，3.11.0，交叠渐变与更新源）

- 歌曲新增交叠渐入渐出，默认开启，可在播放设置关闭；自然结束和手动下一首、上一首、点选歌曲均接入。复用原有两种时长和下一首预加载，双音频分别渐变、共用音效，同步静音、倍速、音量与输出设备；旧曲事件不驱动新曲进度、歌词或 Last.fm。暂停、停止、拖动、关闭开关及快速切歌清理旧曲尾音。无下一首、短曲、同曲循环或预加载未完成时沿用普通衔接。
- 主题三选项文字前加入 24px 色块，浅色白色、深色黑色、自动黑白交替条纹，保留单选和键盘操作。自动更新、Release 说明来源、软件发布页及打包仓库改至 MikaPai-team/ikun-music-desktop-next；项目和锁文件同步升为 3.11.0。
- 用户最新流程：先提交、推送 alpha-test，再编译 x64 安装包；编译完成必须询问产物是否有问题，明确确认无问题后才能合入并推送 main。已写入 AGENTS.md 和用户授权的 memory 更新笔记。3.11.0 先准备草稿 Release，确认后正式发布。
- 此阶段仅人工阅读修改，新增 player-crossfade.test.cjs 回归用例尚未执行；按用户要求不运行任何测试或自检。当前尚未编译 3.11.0，尚未提交 / 推送本次源码，尚未合入 main；Release 上传和旧产物清理仍在办理，以后续实际状态补记为准。
- alpha-test 将保存本次编译所需的完整源码工作区快照，包括此前未提交的界面和 Last.fm 源码；此前未跟踪的调试图片、旧测试和 desktopLyricColor.check.mjs 保留在本地，不纳入本次提交。真实安装、听感、界面和完整音效组合尚未验证。


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

## 本次发布（2026-11-20，3.9.0）

- 用户已授权将当前编译产物上传为新 Release。已查看 GitHub 上的正式版 `v3.6.0`、`v3.4.0` 与近期 beta Release，采用正式版的中文标题和分节说明格式。
- 已核对 GitHub `main` 的基线提交为 `c8dcd12b61cf54dc4a241eb24884e5e667ba6b19`，其中已包含本地曲库、LRC 补全与播放 / 桌面歌词修复。当前安装包还包含本地尚未提交的 Last.fm、子页面界面及部分播放修改，发布说明注明该构建来源。
- 已核验附件 `ikun-music-desktop-v3.9.0-x64-Setup.exe` 为 97,767,818 字节，包内版本为 `3.9.0`，SHA-256 为 `bdc7a53b3d22b55b951b0728883d22de2f177515259641042c7ecab052c8942f`。
- 根目录 `AGENTS.md` 已移除上一任务临时的 Release 限制，保留版本递增与历史 Release 格式要求。
- 已发布正式版 `v3.9.0 — 本地曲库、歌词与播放体验升级` 并设为最新 Release，发布 ID 为 `452640341`，地址为 https://github.com/MikaPai-team/ikun-music-desktop-next/releases/tag/v3.9.0 。
- Release 附件上传状态为 `uploaded`，远端大小与 SHA-256 均与本地一致。公开下载链接返回 HTTP 200，Content-Length 为 97,767,818 字节。
- 提交 / 推送状态为源码及文档修改尚未提交或推送，GitHub 新标签 `v3.9.0` 指向上述已推送的基线提交。
- 已知限制为安装包包含尚未提交的本地改动，GitHub 源码归档对应基线提交，真实安装、播放与 Last.fm 在线授权尚未验证。

## 本次修改（2026-11-20，版本升级至 3.9.0）

- 将 `package.json` 和 `package-lock.json` 的项目版本从 `3.8.0` 同步调整为 `3.9.0`，沿用现有 Windows x64 Setup 产物规格。
- 按用户要求记录版本规则，功能性修改递增次版本号，对已有功能的改进使用逐次递增的 `-fix.n`。规则加入根目录 `AGENTS.md`，并写入 Codex 项目记忆更新记录。
- `npm run build:renderer` 与 `npm run pack:win:setup:x64` 均成功，重新编译依赖版本字段的 renderer，主进程、桌面歌词与用户 API 脚本复用当前已有的 `dist` 产物。
- 已生成 `build/ikun-music-desktop-v3.9.0-x64-Setup.exe`，大小为 97,767,818 字节。安装包和应用可执行文件的版本、`app.asar` 内项目版本、打包 renderer 与当前编译文件的一致性均核验通过，`latest.yml` 的版本、文件名、大小与 SHA-512 均核验通过。
- 项目与锁文件版本一致性检查通过，46 份此前修改 / 未跟踪调试文件的 SHA-256 比对通过，本次文件的 `git diff --check` 通过。
- 提交 / 推送状态为尚未提交或推送。
- 已知限制为尚未安装或运行新安装包，其他平台产物尚未验证。

## 本次修复（2026-11-20，本地筛选持久化与桌面歌词透明背景）

- 本地播放的搜索词、歌手、专辑、文件夹和格式统一保存为 `localMusic.filterState` JSON 字符串，复用现有设置 IPC 和主进程同步写盘。原因是现有设置合并仅接受原始类型，此前的歌手数组设置会被忽略；本次不修改通用设置合并规则。输入或点选即保存，不等待搜索防抖或页面卸载；返回页面及重启时恢复并立即应用，损坏 JSON / 错误字段安全回退。
- 刷新或首次读取空曲库时保留已选条件，临时缺失的歌曲 / 目录重新出现后仍按原条件筛选。用户主动移除条件、重置全部或切换根目录时更新保存的选择。旧实现没有真正写入磁盘的选择无法追回。
- 桌面歌词窗口显式使用透明原生背景，去掉未锁定时的 20% 黑底和取色失败时逐级叠加的黑色保护面板；锁定与未锁定均保持透明。继续使用封面取色、屏幕背景采样、用户文字透明度与 0.35px 细描边，背景对比度或唱词色差无法兼顾时使用不同的中性字色，不再加整块黑底。
- 本次提交纳入当前本地筛选页面 / 组件 / 派生列表常量 / 三语言文案，以及桌面歌词取色所需的封面同步、采样 IPC 和类型依赖，保证 GitHub 源码包含完整调用链。其他此前未提交的 Last.fm、子页面 UI 与播放改动继续保留；不提交已有未跟踪测试、自检文件及调试图片。
- 验证：按用户要求，未运行任何测试、自检、语法 / 类型检查、编译、开发服务器或打包；仅人工阅读源码、调用链和 diff。已调整本地待运行的 `build-config/tests/local-filter.test.cjs` 与 `src/renderer/utils/desktopLyricColor.check.mjs`，不代表已通过。
- 提交 / 推送：功能提交 `9fa5dac`（`fix: 持久化本地筛选并移除桌面歌词黑底`）已成功推送到 `next/main`（`MikaPai-team/ikun-music-desktop-next`）；本条补记该提交的实际结果。版本号、Release 和发布工作流未修改。
- 已知限制：未在真实 Electron 中验证重启恢复或最终外观；混合背景、极低文字透明度无法保证固定对比度。旧 Windows、macOS、Linux 仍无可靠屏幕采样，以透明底与细描边回退。

## 本次修复（2026-11-16，桌面歌词描边与逐字进度辨识）

- 原因核对：上次使用不透明 1px / 2px 黑白双层 text-shadow，并让逐字播放器创建一份完整文字副本承载阴影，笔画边缘叠加变粗；同时已唱 / 未唱颜色分别向同一黑 / 白端收敛，只限制它们对背景的对比度，未限制两种字色之间的差异，因此逐字渐变即使在运行也可能看不出进度。
- 移除桌面歌词播放器的重复阴影文字层，横排、竖排、翻译和逐字原文字形统一取消 text-shadow，改用 **0.35px 原生文字描边**。逐字歌词继续使用原来的 KeyframeEffect / background-size 填色动画，不修改共享歌词播放器的时间、暂停、拖动或倍速逻辑。
- 取色改为一起选择两种颜色：未唱使用与背景对比度更高的中性色，已唱从封面主色向黑 / 白调整；同时约束两种实际合成后的字色对背景达到 4.5:1，并让已唱 / 未唱彼此至少达到 2:1。遇到复杂或明暗混合背景无法兼顾时，逐级使用半透明黑底保护，再选择两种字色，替代加粗描边；取消面板底色过渡，使底色与字色同时切换。原屏幕背景采样、封面同步和用户歌词透明度设置继续保留。
- 改动范围：`src/renderer/utils/artworkBackground.ts`、`src/renderer-lyric/{App.vue,core/lyric.ts,useApp/useTheme.ts}`、待运行的 `src/renderer/utils/desktopLyricColor.check.mjs` 及本交接文档。自检内容已更新为浅 / 深 / 混合 / 未知背景、灰阶封面、实际透明度下的文字可读性与两种填色色差，但没有执行。
- 验证 / 提交状态：沿用用户之前的要求，**未运行任何测试、自检、语法 / 类型检查、构建、开发服务器或打包**；仅阅读调用链和源码并整理改动。尚未提交或推送，未修改版本、Release 或发布工作流，保留工作区此前所有修改与未跟踪调试文件。
- 已知限制：本次视觉效果、实际逐字填色、各 DPI 下的细描边仍未在真实 Electron 中验证；复杂背景下会出现半透明底色，用户设置的低透明度仍可能无法同时满足文字可读性与填色色差，保留该设置而不擅自提高透明度。

## 本次修改（2026-11-15，桌面歌词封面取色与背景对比度）

- 桌面歌词复用软件内歌词页的 `getArtworkColors` 封面主色算法：主窗口通过已有 MessagePort 同步初始封面与 `picUpdated`，桌面窗口按当前歌曲提取主色，已播放 / 未播放文字保持同一色系。换歌和关闭窗口时丢弃迟到的取色结果；无封面或加载失败时使用原设置中的已播放颜色作为种子。
- 背景检测方法：Windows 10 2004（build 19041）及以上，在一次屏幕采样期间调用 `setContentProtection(true)` 排除歌词窗口，采样完成或出错均恢复原状态，不隐藏实际窗口。主进程以屏幕缩略图和窗口实际内容区域相交取样，每个相交屏幕生成 16×8 个背景点；依据各屏幕坐标及实际缩略图尺寸换算，兼顾负坐标、多屏与不同缩放比例。截图仅在内存处理，不保存、不上传，也不传给 renderer；IPC 仅允许当前歌词主 frame 请求并返回 RGB / 区域信息。
- 对比度处理复用既有 WCAG 相对亮度与混色工具：把未锁定面板的 20% 黑底、用户设置的歌词透明度纳入计算，沿封面主色向黑 / 白调整，目标为文字对所有取样点达到 4.5:1。跨越明暗窗口、背景复杂或透明度使目标不可达时，保留最有利的文字色并启用黑白双层描边；没有可靠采样时也使用双层描边。横排、竖排、翻译 / 罗马音、逐字高亮均共用这一套颜色和描边。
- 窗口可见时约每 1.5 秒重新采样，移动 / 调整大小时另行刷新；主进程合并重叠请求，采样途中窗口改变位置、大小或重新创建则弃用旧结果。桌面窗口卸载时停止定时器并移除探针。去掉 `App.vue` 中固定的 body 0.8 透明度叠乘，保留用户歌词透明度设置，让计算与实际叠加背景一致。
- 改动范围：`src/common/{ipcNames.ts,types/desktop_lyric.d.ts}`、`src/main/modules/winLyric/{main.ts,rendererEvent.ts}`、`src/renderer/core/{lyric.ts,useApp/usePlayer/useLyric.ts}`、`src/renderer/utils/artworkBackground.ts`、`src/renderer-lyric/{App.vue,core/mainWindowChannel.ts,store/state.ts,utils/ipc.ts,useApp/useTheme.ts}` 与本交接文档；另留 `src/renderer/utils/desktopLyricColor.check.mjs` 供后续验证。未增加依赖或设置项，未修改版本、Release 或发布工作流，保留原有未提交修改与调试文件。
- 验证 / 状态：按用户明确要求，**没有运行任何测试、自检、语法 / 类型诊断、构建、开发服务器或打包**；仅阅读源码、调用链和 diff 进行代码整理。待运行自检不代表已通过。当前尚未提交或推送，代码完成后先告知用户。
- 已知限制 / 待验证：真实 Windows 背景排除捕获、多屏 DPI、逐字描边及最终外观尚未实测；采样时其他录屏 / 截图工具也可能短暂捕获不到歌词窗口。旧 Windows、macOS、Linux 暂不进行可靠背景采样，使用双层描边回退；极低的用户透明度无法保证文字对比度，保持用户设置。像素采样只是当前背景估计，不承诺对实时视频每帧或所有细节达到固定对比度。

## 本次修改（2026-11-15，本地歌词补全与渐出重播修复）

- 改动范围仅为 `src/renderer/core/music/local.ts`、`src/renderer/worker/main/music.ts`、`src/renderer/core/useApp/usePlayer/usePlayProgress.ts`、`src/renderer/plugins/player/index.ts` 和本交接文档。保留工作区已有的 Last.fm、UI、本地筛选及其他未提交修改；共享文件仅提交本次变更，不夹带已有改动。
- 本地歌曲播放时优先读取已有歌词文件与软件缓存；缺失或空歌词继续使用已有在线匹配链路，通过 QQ 音乐等音源获取带时间标签的 LRC。自定义本地 API 返回空 / 无时间标签歌词时继续查找其他音源，读文件失败不再阻断在线补全。
- 按用户选择，补全歌词以 UTF-8 保存为歌曲旁边的同名 `.lrc`，并使用原有软件歌词缓存。缓存已有歌词也可补回缺失文件；采用独占创建，不覆盖原歌词文件（包括手动刷新与并发写入）。目录不可写时仍返回歌词供软件显示与缓存。无需额外设置或依赖；不批量联网扫描整个曲库。
- 修复切歌后短暂重播旧歌开头：`musicToggled` 发生在旧曲渐出之前，原进度处理器会立刻把旧音源跳回 0 秒。现在只记录新曲进度，等新音源 `playing` 时应用；切歌渐出期间忽略旧音源的进度更新。另将结尾渐出判断中的歌曲时长统一转换为毫秒，避免普通歌曲被当作短曲跳过渐出。
- 验证：用户要求停止测试之前，新增歌词 / 渐出回归检查 **9 项通过**；以内存中的旧逻辑重跑渐出检查时 **4 项失败**，证实旧曲被跳回开头与秒 / 毫秒判断问题。此后已停止测试；新增 `build-config/tests/local-lyrics.test.cjs`、`build-config/tests/player-fades.test.cjs` 暂留本地，不纳入本次提交。未运行完整测试、类型检查、webpack、开发服务器或打包，也未进行真实 Electron 听感与在线歌词接口验证。
- 提交 / 推送：功能提交 `5732b0d`（`fix: 补全本地 LRC 并修复渐出后重播开头`）已成功推送到 `next/main`（`MikaPai-team/ikun-music-desktop-next`）；本条补记该提交的实际结果。版本号、Release、发布工作流未修改，未推送 beta；保留所有已有未跟踪调试文件。

## 本次修改（2026-11-15，Last.fm 播放记录接入）

- 在「设置 → 播放」新增 Last.fm：填写应用 API Key / Shared Secret，打开浏览器授权，再点击「完成授权」；授权成功自动启用，也可暂停同步、查看待上传数量、刷新状态和断开账号。Callback URL 可留空。用户提供的真实密钥没有写入源码、测试或本交接文档。
- 支持在线、本地与下载歌曲的正在播放通知和播放记录。按用户本次明确要求，歌曲总长必须 **超过 30 秒**，**实际收听满 15 秒**即可提交，长曲也采用同一门槛；这是用户指定的规则，不采用官方建议的一半时长 / 4 分钟。每次播放只提交一次，重新播放重新计数；暂停、缓冲、拖动进度和切歌时旧曲渐出不计入，倍速仍按实际收听时间计算。
- 复用播放事件、音频进度、主进程 IPC、请求库及其代理设置，无新增依赖。本地歌复用 worker 的文件标签缓存，支持多歌手与单个 artist 标签；缺少歌名或歌手时跳过，不从文件名猜测，也不向 Last.fm 发送文件路径。原有曲库、筛选、播放控制和历史列表不改写。
- 主进程使用 Electron `safeStorage` 加密凭据，保存到应用数据目录 `LxDatas/lastfm.json`，不加入 `appSetting` 或设置备份；没有安全凭据存储时拒绝保存。播放记录先持久化，再按时间顺序以最多 50 条一批上传；网络 / 临时服务错误保留队列，每分钟重试，重启后继续。正在播放通知不重试，永久 API 错误与服务端过滤记录显示提示。
- 会话失效时保留待上传记录，同账号重新授权后补传；断开账号会清除本机凭据与待上传记录，更换账号时也清空旧队列，避免误传。断开前发出的请求可能已到达 Last.fm；迟到响应不会恢复旧账号数据。设置页可用「刷新状态」查看后台补传结果。

## 本次验证与状态（2026-11-15）

- `node --test build-config/tests/lastfm.test.cjs build-config/tests/local-filter.test.cjs build-config/tests/ui-keyboard-handlers.test.cjs`：**20 项通过**（新增 Last.fm 12 项，原有 8 项）。覆盖 UTF-8 签名、浏览器授权与会话恢复、密钥格式、加密不可用 / 写盘失败、队列补传、会话失效与账号切换、15 秒门槛、倍速 / 暂停 / 缓冲 / 拖动 / 重播、切歌渐出、本地标签及异步旧结果隔离。系统凭据存储、磁盘与网络在自动测试中使用模拟实现，不视为真实 Electron 验证。
- 使用用户提供的凭据，真实 `auth.getToken`、浏览器授权、`auth.getSession` 均成功，已核对账号；另用本次主进程源码与项目实际请求库验证签名 POST `auth.getToken` 成功。网络验证经过 `http://127.0.0.1:7890`。这些仅为授权 / 接口验证，命令行探测会话没有安装到应用数据；新版正式启用仍需在软件设置中填写密钥并完成授权。没有向账号写入虚构播放记录。
- 本次主进程、renderer、worker 相关 TypeScript 文件的语法与类型诊断检查通过（`noEmit`，仅核对本次文件，不宣称全仓库类型检查通过）；新增设置页与设置入口模板 / 脚本解析通过，新页面 Less 解析通过；三语言各 23 个 Last.fm 文案键完整。新增文件及设置入口的离线 Prettier 检查、`git diff --check` 通过。
- 沿用此前不本地构建的要求，未执行 webpack、开发服务器、打包或发布；尚未在真实 Electron 中验证设置交互、系统加密存储、音频播放与 Last.fm 实际记录入库，也没有导入旧播放列表记录。
- **尚未提交或推送**。版本号、Release 和发布工作流未修改；保留此前所有未提交修改、未跟踪测试 / 本地筛选文件与调试图片。

## 本次修复（2026-11-14，键盘事件模板报错）

- 用户提供的 renderer 构建日志指出 `Selection.vue` 的 Enter / Space / Escape 与 `TagList.vue` 的 Escape 共四处事件解析失败。上次新增的事件内容包含多条调用，但仅用换行分隔；Vue 对不含分号的事件按单一表达式处理，因此报 `Unexpected token, expected ","`，TagList 的 `null.content` 为连带错误。上次仅用 Babel 按普通脚本解析的检查没有覆盖这个差异。
- 四处事件改为显式箭头函数体，保留选择、收起与焦点恢复顺序；兼容仓库 Prettier 的 `semi: false` 配置，后续格式化不会再把处理器变成非法单一表达式。未调整 UI 设计、业务脚本或格式化配置。
- 新增 `build-config/tests/ui-keyboard-handlers.test.cjs`：2 项回归测试通过，覆盖原错误语法的拒绝、实际事件在单表达式上下文中的解析、Enter / Space 选择顺序、Escape 收起与焦点恢复，以及 TagList 空 DOM 引用。工作区外的检查脚本已修正为按 Vue 是否含分号的规则解析事件，505 个模板表达式检查通过；原有 20 个 HTML 模板、20 个脚本块与 22 个 Less 样式块解析检查仍通过。
- 两个组件和回归测试的离线 Prettier 检查、`git diff --check` 通过。沿用用户不编译的要求，未执行 webpack、构建、开发服务器或打包，修复后的完整 renderer 构建结果与真实界面交互仍未验证。
- 尚未提交或推送；同步更新本交接文档。版本号、Release 和发布工作流未修改，保留所有此前未提交改动与未跟踪调试文件。

## 本次修改（2026-11-14，子页面 UI 统一）

- 按 11 月 13 日本地页的设计语言调整搜索、在线歌单与详情、排行榜、我的列表、下载和设置各分组：沿用主题变量与用户字体，统一 18px 页面标题、18px 内容边距（窄窗口 12px）、独立圆角控件、轻底色选中态与较克制的空状态文字。共享布局 mixin 放在 `src/renderer/assets/styles/layout.less`，无新增依赖。
- 搜索平台 / 类型、歌单排序和下载分类复用 `base-tab`，改为可键盘点击的独立按钮；分页采用同样的控件语言。歌单分类弹层统一边框、圆角和选中态，并修正原来的 `dom_btn` 非 ref 表达式。补充下拉、排行榜和歌单入口的键盘操作、可见焦点及 Escape 收起；歌单浏览改为随窗口宽度切换的网格，移除旧布局占位条目。共享 tab / 分页 / 下拉的样式或键盘改动也会用于歌曲换源及评论等已有调用处。
- 排行榜来源移至标题栏，分类栏和设置导航采用清晰选中态；我的列表保留新建、更新、重命名与拖动链路，并适配新的行间距。设置复用原有分组与设置组件，统一组标题、卡片内层级与间距，快捷键条目可随内容区域宽度换行。歌曲虚拟列表的行高计算、播放、扫描、筛选、下载、数据存储和路由逻辑沿用原实现。

## 本次验证与状态（2026-11-14）

- 仅做解析与源码核对：20 个 HTML Vue 模板、20 个脚本块和 22 个 Less 样式块语法检查通过；脚本 AST 与原版对照，仅歌单分类的 DOM ref 修正有逻辑差异。Less 仅调用解析接口，未生成 CSS；Vue 未调用模板 / 样式编译接口。DOM ref 自检通过。
- `node --test build-config/tests/local-filter.test.cjs`：原有 6 项本地筛选测试全部通过。改动文件的离线 Prettier 格式检查与 `git diff --check` 通过。
- 按用户要求未编译：未执行 webpack、开发服务器、应用构建、打包或发布。未在真实 Electron 界面验证排版、键盘交互、播放与下载，也未验证全部主题及窗口尺寸；上述仍需运行界面确认，不把源码检查视为实机验证。
- 尚未提交或推送；版本号、Release 和发布工作流未修改。保留昨天未提交的本地页 / 筛选改动及未跟踪文件；调试图片 `full.png` 与微信截图未修改或删除。检查辅助脚本存放在工作区外的 Codex visualizations 目录。

## 当前改动

- 根据用户“主要直接搜索歌名、偶尔叠加筛选，旧复选框操作生硬且筛选状态不直观”的反馈，重新设计本地目录筛选：移除常驻左侧歌手栏，改为顶部常驻搜索框和歌手 / 专辑 / 文件夹 / 格式入口。搜索同时匹配歌名、歌手、专辑与路径，支持空格分隔的多个关键词、大小写和全角归一化，输入后约 180ms 更新结果，兼容中文输入法组合输入。
- 筛选面板支持查找与直接点选、多选状态高亮；已选条件显示为可单独移除的标签。显示当前结果数与完整曲库总数，支持按类“不限”和“重置全部”；面板底部“查看 X 首歌曲”收起面板，不需要另行提交条件。支持点击外部、键盘 Escape 收起及焦点恢复，窄窗口自动换行。
- 同类条件取并集，跨类条件与搜索取交集；候选计数结合其他类别与搜索，当前类别仍可增选。合唱歌手按已有标签的 `、` 分隔并去重；缺失标签归入未知项；文件夹按歌曲实际所在的完整路径区分，同名文件夹不合并（显示目录名及完整路径），格式由扩展名推导，不代表音质等级。
- 继续复用完整曲库 `LIST_IDS.LOCAL` 与派生播放列表 `LIST_IDS.LOCAL_VIEW`，搜索/筛选不会改写完整曲库，歌曲表与后续播放入口仍绑定派生列表。保留原歌手选择持久化设置；搜索、专辑、文件夹、格式仅保留在当前页面，离开后重置。切换根目录会重置全部条件；刷新移除已不在曲库中的选项。
- 新增 `localFilter.js` 和 `useLocalFilter.js`，替换此前未跟踪的 `useLocalArtist.js` 与 `components/ArtistFilter.vue`，新面板为 `components/FilterBar.vue`。派生列表缓存先预热，覆盖请求串行并跳过过时请求；页面退出清理计时器与监听。补充加载、空曲库、无匹配和读取/筛选失败重试提示，更新三份语言文件；无新增依赖。

## 本次验证与状态（2026-11-13）

- `node --test build-config/tests/local-filter.test.cjs`：6 项测试通过，覆盖标签/路径归一化、并集与交集、搜索叠加、候选计数、交叉条件与朴素匹配结果对照，以及 Vue 响应式链路的恢复选择、快速切换、串行覆盖、IPC 可克隆性、失败重试、失效条件清理及卸载清理。
- 实际修改的 Vue 模板、JavaScript 与 Less 经 `@vue/compiler-sfc` / Babel / Less 局部检查通过，三语言本地文案键完整且 JSON 解析通过；改动的 Vue / JS / 测试文件通过 Prettier，`git diff --check` 通过。语言文件末尾原有格式保留，避免附带调整其他功能的文案。10000 首示例数据生成索引和四类候选计数耗时约 50ms（单次 Node 测量，不代表真实界面或 IPC 耗时）。
- 使用真实本地页/筛选栏/基础输入框和按钮组件，配合示例曲库及模拟列表接口，在浏览器检查了搜索叠加歌手、歌手多选、格式候选计数、专辑面板查找、文件夹筛选、条件标签移除、Escape 收起与焦点恢复、空结果重置、636px 窗口布局与面板结果出口。预览的歌曲表与目录/播放接口是模拟实现，因此不作为 Electron 扫描或播放验证。
- 沿用此前不做本地整包构建的要求，本次未执行整应用 webpack 构建、打包或真实 Electron 目录扫描/音频播放，也未覆盖所有主题。扫描支持格式、扫描进度与取消能力仍沿用原实现；这些不属于本次筛选改动。
- 尚未提交或推送；版本号、Release 与发布工作流未改。保留用户已有未跟踪调试图片 `full.png` 与微信截图，未提交、删除或修改。临时预览与截图位于工作区外的 Codex visualizations 目录。

## 上次筛选实现（2026-11-03，已由本次重设计替换）

- 本地歌曲新增「按歌手分类与筛选」子功能：本地页左侧新增歌手栏，列出曲库中出现的歌手及曲目数并带复选框，右侧曲目表与播放同步只呈现所选歌手；顶部「全部」行与「清空」按钮可重置为显示全部。歌手来自各曲目 `singer` 字段，多歌手按 `、` 拆分；无标签归入「未知歌手」。
  - 完整曲库仍保存在 `LIST_IDS.LOCAL`（`local`），扫描链路与持久化不变，作为数据源不被筛选污染。
  - 新增派生列表 `LIST_IDS.LOCAL_VIEW`（`local__view`）：本地页据所选歌手从完整曲库算出子集并 `overwriteListMusics` 写入该 ID，`MusicList` 与播放均绑定此 ID。因此播放队列即当前所选歌手曲目。
  - 选中歌手持久化在设置项 `localMusic.filterArtists: string[]`（空数组=全部）；`appSetting` 为异步回传，故筛选子集直接由传入的歌手集合计算，不依赖回写后的 `appSetting`。
  - 对全新列表 ID 的首次 `overwrite` 不会广播 `myListUpdate`，故 `reloadFull` 先 `getListMusics(viewListId)` 预热缓存，保证后续覆盖必触发列表刷新。
  - 相关文件：`src/common/constants.ts`、`src/common/defaultSetting.ts`、`src/common/types/app_setting.d.ts`、`src/renderer/views/Local/index.vue`、`src/renderer/views/Local/useLocalArtist.js`、`src/renderer/views/Local/components/ArtistFilter.vue`、三份语言文件 `src/lang/{zh-cn,en-us,zh-tw}.json`（新增 `local__artists`/`local__all_artists`/`local__clear_filter`/`local__unknown_artist`）。
  - 版本号未改，待用户按惯例确定（feature 宜 minor bump）。

## 上次筛选验证与状态（2026-11-03）

- 仅做静态核对：复用已有组件（`base-checkbox`/`base-btn`/`MusicList`）与已有 store 接口（`overwriteListMusics`/`getListMusics`/`updateSetting`）；新建的 `.vue`/`.js` 通过 `prettier` 校验，仓库仍无可用 ESLint 配置，`npm run lint` 无法执行，也无 type-check 脚本。
- 未在真实界面上实测扫描、筛选与播放，需用户本地 `npm run dev` 确认（尤其大曲库下的筛选响应与播放队列切换）。
- 尚未提交或推送；按惯例由用户决定版本号与发布，推送前会征得同意。
- 保留未跟踪文件 `full.png` 与微信截图，未动。

## 上一次改动（2026-11-03）

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
