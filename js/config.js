/* Game art registry: generated paintings and native interface/effect layers. */

const ASSETS = {
  'bg-river-surface': { src: 'assets/bg-river-surface.webp',note:'同一河岸俯近水面的整屏视角，水流由浏览器实时呈现'},
  'item-river-lantern': { src: 'assets/item-river-lantern.webp',note:'透明底莲花河灯，独立放入真实场景的水面'},
  'bg-wine-table': { src: 'assets/bg-wine-table.webp',note:'楼阁中同一木案与空酒杯的近景，酒壶与酒液由交互层呈现'},
  'bg-tomb-phoenix': { src: 'assets/bg-tomb-phoenix.webp',note:'同一墓室中完整的青铜凤鸟，剧情意象'},
  'bg-phoenix-turn': { src: 'assets/bg-phoenix-turn.webp',note:'铜凤鸟转向游客，金属眼缘有暗红泪痕'},
  'bg-tomb-phoenix-broken': { src: 'assets/bg-tomb-phoenix-broken.webp',note:'同一铜凤鸟断颈后的墓室，鸟首落在石座旁'},
  'bg-fair-stage': { src: 'assets/bg-fair-stage.webp',note:'真正的百戏表演台与观众，姊妹侧身相随'},
  'bg-fair-walk': { src: 'assets/bg-fair-walk.webp',note:'姊妹沿街走向河边的连续镜头'},
  'bg-river-sisters': { src: 'assets/bg-river-sisters.webp',note:'姊妹在河边石阶旁，注意力朝向河灯与彼此'},
  'bg-censer-open': { src: 'assets/bg-censer-open.webp',note:'同一书案与凤鸟铜炉揭盖后的完整场景'},
  'bg-censer-inside': { src: 'assets/bg-censer-inside.webp',note:'俯近凤鸟铜炉，香灰、木炭与余烬的完整近景'},
  'bg-teashop-whisper': { src: 'assets/bg-teashop-whisper.webp',note:'送行街道旁的小馆子，阿瑾与姐姐侧身斟茶擦杯、低声交谈'},
  'bg-pottery-close': { src: 'assets/bg-pottery-close.webp',note:'同一墓室陶罐与罐口断竹的俯身近景，供残简辨读'},
  'char-stranger-front': { src: 'assets/stranger-front.webp',note:'失忆男子正面干净底图，独立全身雾层随记忆消散'},
  'item-censer-body': { src: 'assets/censer-body.webp',note:'可操作凤鸟铜炉的炉身，剧情意象插画'},
  'item-censer-lid': { src: 'assets/censer-lid.webp',note:'独立镂空铜炉盖，实时抬起与转动'},
  /* ---------- 背景 ---------- */
  'bg-title':       { src: 'assets/bg-que-built.webp', note: '标题背景（汉阙剪影／水墨意境，尺寸建议 1920×1080）' },
  'bg-street':      { src: 'assets/street.webp', note: '背景·清晨街角（老婆婆卖火柴，1920×1080）' },
  'bg-bus':         { src: 'assets/bus-landscape.webp', note: '大巴入梦：独立窗外山村与透明车厢窗框，雨滴和薄雾由程序合成' },
  'bg-tomb':        { src: 'assets/tomb.webp', note: '背景·昏暗墓室（汉代墓室，整体漆黑、微光可见轮廓，1920×1080）' },
  'bg-stone':       { src: 'assets/bg-stone.webp', note: '背景·胡汉交兵画像石（墓壁石刻特写，1920×1080）' },
  'bg-camp':        { src: 'assets/bg-camp.webp', note: '背景·夜晚军营（营帐群，仅主营帐亮灯，1920×1080）' },
  'bg-tent':        { src: 'assets/bg-tent.webp', note: '背景·主营帐内（二人相谈，灯火摇曳，1920×1080）' },
  'bg-feast':       { src: 'assets/bg-feast.webp', note: '背景·庆功宴饮（定格画面，1920×1080）' },
  'bg-censer':      { src: 'assets/bg-censer.webp', note: '背景·冯焕任河南京令的官署内室（冬日，铜熏炉飘香，1920×1080）' },
  'bg-fenghuan':    { src: 'assets/bg-fenghuan.webp', note: '背景·冯焕正对凤鸟炉（只有握笔的手与飘烟炉子，1920×1080）' },
  'bg-yuewu':       { src: 'assets/bg-yuewu.webp', note: '背景·乐舞杂技画像石（墓壁石刻特写，色彩未褪，1920×1080）' },
  'bg-fair':        { src: 'assets/bg-fair.webp', note: '背景·汉代庙会街头（舞乐杂技，人群热闹，1920×1080）' },
  'bg-river':       { src: 'assets/bg-river.webp', note: '背景·河畔放河灯（夜色，河面灯盏点点，1920×1080）' },
  'bg-tower':       { src: 'assets/bg-tower.webp', note: '背景·楼阁之上（二人背影持杯，桌上酒壶，河流远景，1920×1080）' },
  'bg-shufang':     { src: 'assets/bg-censer.webp', note: '背景·冯焕书房（冯焕披外衣坐于椅上，冯绲立于左侧，1920×1080）' },
  'bg-proclaim':    { src: 'assets/bg-censer.webp', note: '背景·宣旨场景（宣旨之人居高临下，众人惊惧，1920×1080）' },
  'bg-prison':      { src: 'assets/bg-prison.webp', note: '背景·牢狱（阴冷狱室，1920×1080）' },
  'bg-coffin':      { src: 'assets/bg-coffin.webp', note: '背景·灵堂（棺椁陈设，白幡素烛，1920×1080）' },
  'bg-coffin-close': { src: 'assets/bg-coffin-close.webp', note: '同一棺椁的半身俯视近景，供观察遗容与安放玉蝉' },
  'char-fenggun-back': { src: 'assets/char-fenggun-back.webp', note: '冯绲朝送行人群走去的背面形象' },
  'bg-funeral':     { src: 'assets/bg-funeral.webp', note: '背景·百姓送行（穿白衣的民众夹道，1920×1080）' },
  'bg-que-built':   { src: 'assets/bg-que-built.webp', note: '背景·宕渠故里（冯焕阙已立好，冯绲仰望，1920×1080）' },
  'bg-shuangque':   { src: 'assets/bg-que-built.webp', note: '背景·苍茫双阙（四周空茫，仅双阙与二人；后用作阙前石门机关场景，1920×1080）' },
  'bg-que-today':   { src: 'assets/bg-que-today.webp', note: '背景·现实中的冯焕阙（现代景点，文保碑，1920×1080）' },
  'bg-zhujian':     { src: 'assets/item-zhujian.webp', note: '文物·假诏竹简（残缺竹简特写，1920×1080）' },

  /* ---------- 立绘 ---------- */
  'char-oldlady':   { src: 'assets/oldlady.webp', note: '立绘·老婆婆（衣着破旧、骨瘦如柴，透明底 PNG，高约 1000px）' },
  'char-shadow':    { src: 'assets/stranger.webp', note: '失忆男子：半隐面容与透明雾影，游戏想象角色' },
  'char-fenghuan':  { src: 'assets/char-fenghuan.webp', note: '立绘·失忆男子【逐渐清晰】（四十至五十岁，衣冠旧而整洁，灯下无影，透明底 PNG）' },
  'char-bangu':     { src: 'assets/char-bangu.webp', note: '立绘·班固（汉军护军装束、佩剑，透明底 PNG，可备拔剑／沉思两态）' },
  'char-shuli':     { src: 'assets/char-shuli.webp', note: '立绘·属吏（昌文，汉吏装束，透明底 PNG）' },
  'char-ajin':      { src: 'assets/char-ajin.webp', note: '立绘·阿瑾（少女，汉代便服，透明底 PNG）' },
  'char-ajie':      { src: 'assets/char-ajie.webp', note: '立绘·阿瑾的姐姐（少女，汉代便服，透明底 PNG）' },
  'char-yaoguang':  { src: 'assets/char-yaoguang.webp', note: '立绘·姚光（玄菟太守，楼阁同饮者，汉官装束，透明底 PNG）' },
  'char-fenggun':   { src: 'assets/char-fenggun.webp', note: '立绘·冯绲（冯焕之子，青年，透明底 PNG，可备泣不成声一态）' },
  'char-pangfen':   { src: 'assets/char-pangfen.webp', note: '立绘·庞奋（辽东属国都尉，宣旨之人，透明底 PNG）' },
  'char-fenghuanqi': { src: 'assets/char-fenghuanqi.webp', note: '立绘·冯焕妻（中年妇人，素服，透明底 PNG）' },
  'char-servant':   { src: 'assets/char-shuli.webp', note: '立绘·下人（府中仆役，透明底 PNG）' },
  'char-driver':    { src: 'assets/char-driver.webp', note: '立绘·司机（现代大巴司机，透明底 PNG）' },
  'char-guide':     { src: 'assets/char-guide.webp', note: '立绘·导游（现代讲解员，透明底 PNG）' },
  'char-fenghuan-dead': { src: 'assets/char-fenghuan-dead.webp', note: '立绘·冯焕遗容（非常瘦、似遭虐待，与前三幕大不相同）' },

  /* ---------- 道具 ---------- */
  'item-match':     { src: 'assets/matchbox.webp', note: '道具·火柴／火柴盒（道具图，透明底 PNG 或方形图标）' },
  'item-torch':     { src: 'assets/torch-lit.webp', note: '完整点燃火把，焦黑布头、炭火与火焰为同一图层' },
  'item-mingtie':   { src: 'assets/name-card.svg', note: '道具·名帖（拜帖／名刺，可作文档配图，透明底 PNG）' },
  'item-winepot':   { src: 'assets/item-winepot.webp', note: '道具·酒壶（桌上酒壶，透明底 PNG 或方形图标）' },
  'item-zhujian':   { src: 'assets/item-zhujian.webp', note: '道具·假诏竹简（残缺竹简，透明底 PNG 或方形图标）' },
  'item-yuchan':    { src: 'assets/item-yuchan.webp', note: '道具·玉蝉（汉八刀玉蝉，透明底 PNG 或方形图标）' },

  /* ---------- 特效 ---------- */
  'fx-lunge':       { src: 'assets/stranger.webp', note: '特效·黑影扑屏（可提供贴图；未提供时使用程序模拟的黑影）' },
  'fx-war':         { src: 'assets/bg-feast.webp', note: '定格·战争场面（脚本已按“直接跳转”处理，此占位可在日后替换为战场定格）' },
  'fx-blood':       { procedural: true, src: '', note: '特效·血泪喷溅（鲜血流淌动图；未提供时使用程序模拟的血滴）' },
  'fx-painting':    { src: 'assets/bg-yuewu.webp', note: '定格·画像活化（画像上的人物动起来、化成实体；未提供时使用程序转场）' },
  'fx-eye':         { procedural: true, src: '', note: '特效·流泪的眼睛（屏幕正中一只不停流泪的眼睛；未提供时使用程序模拟）' },
  'fx-ink':         { procedural: true, src: '', note: '特效·墨滴晕染（一滴墨在屏幕上晕染开来；未提供时使用程序模拟）' },
  'fx-white':       { procedural: true, src: '', note: '特效·双阙白光（双阙中间发出强烈白光覆盖一切；未提供时使用程序模拟）' },
  'fx-que':         { src: 'assets/bg-que-built.webp', note: '场景·双阙与石门机关（铭文拼合小游戏背景；建议提供阙身与二十字铭文贴图）' },

  /* ---------- UI（可选） ---------- */
  'ui-book-bg':     { src: 'assets/book-paper.svg', note: '证据册内页装饰（可选·汉风纹样，无素材时用程序样式）' },
};

/* Game art registry: generated paintings and native interface/effect layers. */
const SETTINGS = {
  hpMax: 5,            // 探案模式心神（血条）上限
  typeSpeed: 38,       // 打字机每字间隔（毫秒），快进模式下为 0
  fastDelay: 620,      // 快进模式下自动推进到下一句的间隔（毫秒）
  matchDrag: 240,      // 火柴点火需要滑动的像素距离
  matchRadius: 130,    // 火柴光照半径（px）
  torchRadius: 240,    // 火把光照半径（px）
  waveCount: 5,        // 第一幕声波数量（按脚本：第一幕五道线，后续递减）
  scareDur: 1100,      // 黑影扑屏惊吓时长（毫秒）
  staticDur: 1500,     // 电视雪花转场时长（毫秒）
  transitionDur: 900,  // 常规淡入淡出时长（毫秒）
};

/* 证据册六页（顺序即页签顺序） */
const EVIDENCE_PAGES = ['籍贯', '官职', '品格', '亲缘', '经历', '结局'];

/* 每页空态文案（尚未收录证据时显示） */
const EVIDENCE_EMPTY = {
  '籍贯': '墓主是何方人氏？尚无证言。',
  '官职': '墓主身居何职？尚无线索。',
  '品格': '墓主是何性情？且听他亲口道来。',
  '亲缘': '墓主可有亲眷？尚无消息。',
  '经历': '墓主生平如何？从器物记忆中探寻。',
  '结局': '墓主如何离世？……这是最后的谜底。',
};

