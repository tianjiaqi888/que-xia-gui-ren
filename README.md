# 阙下归人

基于朋友提供的架构独立开发的在线叙事互动游戏。开发位于 game/，original/ 与 sample/ 保持原样。运行使用 HTML、CSS、JavaScript，无构建或安装步骤。

## 运行与入口

Windows 双击 START.cmd，需已安装 Python。完整入口为 http://127.0.0.1:8767/ ，开始新故事会从序幕街角买火柴进入。启动器的诊断日志放在系统临时目录，不写入项目。

也可在 game/ 中执行 `python -m http.server 8767 --bind 127.0.0.1`，保持该终端运行。

章节预览会跳过此前剧情：`?chapter=prologue`、`?chapter=1` 至 `5`、`?chapter=final`、`?chapter=epilogue`。探案预览加 `&mode=detective`。左上“章节预览”包含序幕至尾声各章；预览不覆盖正式存档。

序幕局部入口保留 `?review=street`、`bus`、`tomb`、`encounter`。

## 游玩行为

- 标题页先填写名字，再选择游览或探案模式；首次进入没有续玩按钮，有有效进度时才显示“续上这场梦”。
- 章内可用“上一句／上一步”返回，也可“重玩此处”。返回会恢复当时的道具、证据、记录与交互进度，并从返回处继续；已离开的后续步骤会重新游玩。记录保存在当前浏览器会话，不写项目文件；旧存档继续后开始积累返回记录。
- 保留原104个剧情节点、12项身份证据、游览/探案两种模式。正式进度保存在当前浏览器，标题页可“续上这场梦”；逐句恢复不会重复收证或记录日志。营地寻找、推演、续香、庙会、河灯与临别交谈可直接恢复交互阶段。更换浏览器、端口或清除网站数据后不能自动迁移进度。
- 物品或场景目标触发原台词，人物按原顺序交谈。短句自然接续；争论、长论述、关键线索、灵堂和告别手动停留。对白可以暂停；开卷、观察人物和切后台暂停相关时间。
- 序幕聆听的五处声源使用相同外观。先听过并比较，再确认方向；静音时提供听过该处之后的文字反馈。
- 第一幕先举火自由观察约20秒，再循踏地、金属与木轮声触碰石刻。没有三个文字框。石壁探索与寻找凹槽使用全屏场景，手机把火光移近屏幕两端可以察看石壁两侧。
- 拓印按实际纸面透明度采样，至少覆盖90%和主要刻痕才完整显现。找到墙面凹槽后拿起拓片，拖动对位；手机或键盘可先选拓片再选凹槽。误放允许调整，不扣心神。
- 庆功宴过场直接切换完整背景，光色淡出后进入宴席对白；不再把宴席图片放入中央效果卡。
- 第二幕墓室实景中放置完整铜凤鸟，举火照近冠羽后触发对话；转头、逼近与泪痕由匹配画面、镜头推进和短音效同步呈现。续香独白后从炉中凤鸟转回墓室，鸟首已断落在座旁，手机镜头会移向落下的鸟首。
- 第三幕直接进入整屏乐舞画像石，先保留12秒有效观察时间，再可轻触舞袖听见往事。科普小签可自由展开，阅读、证据册与切后台均暂停观察计时；刷新保留已观察时间，重玩此处从头观察。科普参考河南博物院《汉代乐舞百戏画像石》，游戏画面为意象插画。
- 姊妹融入戏台、临水街巷和河边三个场景，镜头随原对白推近、移向交谈者，再跟随她们走到河边。取消正面站立画像与对白后的三按钮收集面板。
- 临水街巷可走近收粮的人家，听一段关于还田的生活片段，再跟随姊妹去河边；没有必须点满三个角落的清单。手机可拖动空处左右察看。
- 河灯从河岸推近到整屏流水，玩家在灯笺上自由写愿，再拿起河灯放入水面；水纹、涟漪、灯影与漂流由代码实时呈现。愿望草稿和放流进度可恢复，重玩会重新写愿。
- 楼阁斟酒由案上的酒杯引导，推进同一木案近景。酒壶倾斜时酒流落入画面中的杯口，松手停止，酒量保留；杯满扶正后端起，再接两人的祝愿。原文“我自当浮一大白”保留并附简释，释义参考[教育部《重编国语辞典》](https://dict.revised.moe.edu.tw/dictView.jsp?ID=38246&la=0&powerMode=0)。
- 营地对白结束后在完整场景中找亮灯帐篷，点击帐篷进入。推演依次表现轻骑绕后烧粮、东面鼓角佯动、守军回救露空、主力突阵。缺少或放错令筹会明确说明，成功后可“推演成功，继续回忆”。
- 终幕以临别对话取代三格材料分类。玩家可以先谈败仗、构陷或迟来的澄冤，得到各自回应后可说“我记得你了”；无需把三个话题逐一完成。
- 第二幕先听完名帖与拒绝说情的对白，再执行续香：走近书案、揭盖、俯看余烬、添香、轻扇后松手。烟气续起便接原来的凤鸟独白；没有三处察看按钮或重复炉体。后续保留读名帖并标记、庙会观察、放河灯、按住斟酒、辨读残简的前后反差、选申诉依据并逐行落笔、临别对话与铭文等交互。
- 玉蝉从墓室初次点亮后就能举火发现，提前找到会记入札记并收好，第五幕再取出唤起记忆。残简由陶罐口的实物引导，镜头俯近后翻读“朕甚嘉之”与“即速行刑”，选择想追问的话进入回忆；没有三格配对或弹出物品卡。告别后的悬浮光团已撤销，直接淡出回到大巴。
- 灵堂点击棺椁后推近，再过渡到半身俯视近景。遗容真实位于棺内，玉蝉也在同一镜头中拿取、拖至手旁。玉蝉在手旁放大显示，完成后可自由停留；再次打开保留已安放状态。送行中的冯绲使用背影，跟近白衣队伍后，镜头转向路边小馆子的姊妹低语，再回望远去的车队。姊妹融入场景，侧身料理茶具，没有面向镜头的立绘。

镜头由浏览器实时变换与匹配视角的美术过渡组成；人物仍为二维素材，没有制作完整三维场景、骨骼行走或实录配音。目前声音为合成现场音效。

## 声音（audio-mix-8）

人物对白只显示字幕，无 TTS。背景音乐已改为本地成品纯音乐，运行时不访问音乐网站。首次点击后启用声音；右上角设置可以调整音量、选择各幕及终幕段落试听。试听独立于剧情，关闭设置即停。

| 段落 | 曲目与作者 | 情绪与安排 |
| --- | --- | --- |
| 序曲 | Memories Of Stone — Scott Buckley | 古老、怀念，给进入故事留距离 |
| 序幕 | Darkest Child — Kevin MacLeod | 不安与未知；聆听线索时降低音乐 |
| 第一幕 | Legionnaire (Original) — Scott Buckley | 军阵的行动感，控制力度，为后半程保留空间 |
| 第二幕 | Eastern Thought — Kevin MacLeod | 克制、沉思；凤鸟异常时短暂进入悬疑 |
| 第三幕 | Ishikari Lore — Kevin MacLeod | 温暖、舒展，表现值得守护的人间生活 |
| 第四幕 | Undertow — Scott Buckley | 无力、压抑，陪伴冤屈与申诉 |
| 第五幕 | In This Moment — Scott Buckley | 亲近的独奏钢琴；安放玉蝉后退入静默 |
| 终幕 | Ascension — Scott Buckley | 回忆蓄势 → 记起往事 → 获得理解 → 送别；各段按剧情触发 |
| 尾声 | Reawakening — Scott Buckley | 从告别回到现实，保留余温 |

终幕回顾不会随背景切图换曲。Ascension 的回忆、认知、宽慰、告别段分别从 0、96、240、272 秒进入；其中后两段播过展开部分后回到 330–360 秒的舒缓尾声循环，避免玩家停留解谜时一直承受高潮。宽慰段随“您从未让百姓失望”这一句进入；章节预览和返回对白同样按当前句判断。

所有曲目遵循 **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**；作者和逐首来源链接在游戏声音设置、结局与 `ASSET_PROVENANCE.json` 中可见。Scott Buckley 的[授权说明](https://www.scottbuckley.com.au/library/using-this-music/)、Kevin MacLeod 的[授权说明](https://incompetech.com/music/royalty-free/licenses/)要求署名。音乐许可与项目源代码许可分别保留。

曲目统一响度并压缩至 128kbps 立体声，九首约 36.1 MB；不预载全部曲目；终幕首次进入时会预取约 6 MB 的 Ascension，复用同一份数据进行可靠跳段，兼容不支持范围请求的静态预览服务。播放时进行分段、循环与淡化，已在鸣谢中注明这些改动。音频工具位于 `D:/阙下归人音频工具`，项目内不保留转码过程文件。

开证据册、设置或暂停对白时，配乐先用约 0.7 秒淡出，再冻结时间线；关闭后从原处用约 1 秒淡入。快速开合会取消过期的暂停回调；操作循环停止，环境声降低。切后台暂停；离开场景清理旧音效。播放失败不阻塞字幕和交互。

回声、马蹄、车轮与兵刃出现时配乐降低 22 dB，凤鸣降低 18 dB，鼓声降低 16 dB；结束后平滑恢复，重叠音效分别释放优先级。心神耗尽使用独立的三组渐慢心跳、暗场脉动与文字渐显，约 3 秒后回到本段；静音和减少动态效果仍有效。

验收：`node tools/check_music.cjs`；浏览器专项将 `QXGR_TEST_CASE` 设为 `audio foundation`、`melody mix` 或 `sound priorities and death`。

## 代码职责

本轮按现有模块合并，不额外保留临时场景脚本或重复实现。

| 文件 | 职责 |
| --- | --- |
| js/config.js、data.js | 素材配置、原剧情、证据定义 |
| js/audio-map.js | 场景→环境声/音乐路由、程序化合成配方、句尾停顿 |
| js/audio.js、music.js | 四类声音播放、降噪/暂停/清理、程序化环境声与本地纯音乐 |
| js/engine.js、main.js、audio.js | 流程与界面装配、输入、文字、声音 |
| js/street.js、bus.js、tomb.js、encounter.js | 序幕各场景与聆听；tomb.js 管理墓室实物寻找与残简辨读，encounter.js 管理声源比较 |
| js/first-memory.js | 第一幕完整循环：观察、拓印、寻槽贴合、营帐、推演、返回与札记 |
| js/progress.js、chapters.js | 正式存档、章节预览、清理游客不应看到的制作备注 |
| js/immersive.js、refinements.js | 后续器物操作、香炉与续香镜头、临别对话、棺材与玉蝉镜头、送行至馆子的连续镜头 |
| js/actors.js、fire.js、story-play.js | 人物调度、火焰与火星、原对白节奏 |
| css/ | 与上述职责对应的呈现；第一幕、聆听、棺材样式已分别合回现有CSS |

## 检查

在工作区根目录执行，默认只输出检查结果：

```text
node tools/audit_release.cjs --details
node tools/check_story.cjs
node tools/check_progress.cjs
node tools/check_pause.cjs
node tools/check_fire.cjs
node tools/check_refinements.cjs
node tools/check_story_play.cjs
```

浏览器检查使用已安装的 Playwright 与本机 Chrome，可用第二个参数传入 Playwright 模块路径：

```text
node tools/browser_first_memory.cjs
node tools/browser_revision.cjs
node tools/browser_immersive.cjs
```

分别覆盖第一幕连续流程、场景专项及第二幕至结局。测试用隔离浏览器上下文，不改写日常浏览器存档；默认不写截图、报告或项目缓存。需要主动导出截图时，可设置 QXGR_CAPTURE_DIR 为自行指定的输出目录。手机尺寸模拟不能替代真实手机的手感验收。

## 素材与发布

assets/ 保留最终运行素材及其来源原图；art-prompts/、art-records/ 与各 *PROVENANCE.json 保留生成说明和来源。棺内近景、送行背影、香炉、凤鸟、庙会连续场景与河灯等配套画面使用内置 image_gen 制作。最终文件与提示词对应如下：

| 成品 | 提示词 |
| --- | --- |
| assets/bg-coffin-close.webp | art-prompts/bg-coffin-close.txt |
| assets/char-fenggun-back.webp | art-prompts/char-fenggun-back.txt |
| assets/bg-pottery-close.webp | art-prompts/bg-pottery-close.txt |
| assets/bg-teashop-whisper.webp | art-prompts/bg-teashop-whisper.txt |
| assets/bg-censer-open.webp | art-prompts/bg-censer-open.txt |
| assets/bg-censer-inside.webp | art-prompts/bg-censer-inside.txt |
| assets/bg-tomb-phoenix.webp | art-prompts/bg-tomb-phoenix.txt |
| assets/bg-phoenix-turn.webp | art-prompts/bg-phoenix-turn.txt |
| assets/bg-tomb-phoenix-broken.webp | art-prompts/bg-tomb-phoenix-broken.txt |
| assets/bg-fair-stage.webp | art-prompts/bg-fair-stage.txt |
| assets/bg-fair-walk.webp | art-prompts/bg-fair-walk.txt |
| assets/bg-river-sisters.webp | art-prompts/bg-river-sisters.txt |
| assets/bg-river-surface.webp | art-prompts/bg-river-surface.txt |
| assets/item-river-lantern.webp | art-prompts/item-river-lantern.txt |
| assets/bg-wine-table.webp | art-prompts/bg-wine-table.txt |

已撤下比例不合适的全身棺内草稿。

美术为剧情意象插画，非实物照片或精确考古复原。书页照片和用户文档不在发布目录。署名与许可见 OPEN_SOURCE_NOTES.md；尚未替用户指定开源许可证或推送GitHub。

发布时以 game/ 为静态网站根目录。GitHub Pages 不需要 START.cmd 或 preview.ps1。
