/* ============================================================
 * 《阙下归人》· 剧情数据（完整版）
 *   序幕·昏沉梦 → 第一幕·射天狼 → 第二幕·香祛浊恶 → 第三幕·人间愿
 *   → 第四幕·白黑溷淆 → 第五幕·寒蝉至 → 终幕·魂归何处 → 尾声·罗浮梦
 * ------------------------------------------------------------
 * 依据《阙下归人(文本）.docx》完整版文字脚本整理。
 * 对白均逐字保留原文（含标点）；括号内的开发备注不显示在台词中。
 * 第三幕起按脚本要求以句号（含问号、感叹号）为限拆分对话框。
 * 按最新要求：第三幕同行者统一为「姚光」，全篇不再出现另一名号。
 * 历史取舍（第一幕）：「在下」「陷阱」、电视雪花、直接跳转+定格庆功宴。
 * 注：原文「若君能替我们重识」按上下文微调为「替我重识」。
 * ============================================================ */

/* ---------- 证据定义 ----------
 * 每个证据对应证据册的某一页。line 上的 evidence 字段指向这里的 id。
 * historyNote 为史料小注（不剧透身份）。 */
const EVIDENCE_DEFS = {
  'act1-exp': {
    page: '经历',
    title: '随班固征讨匈奴',
    text: '墓主曾随班固征讨匈奴，献火攻烧粮、声东击西之策大破敌军。班固赞道：“这次获胜可多亏了你的谋略！”并愿班师回朝后为其请旨封官。',
    source: '第一幕·射天狼',
    historyNote: '史实小注：墓主随班固征讨匈奴、以谋略立功，于史有载；本幕的具体谋划与冲突为虚构。',
  },
  'act1-char': {
    page: '品格',
    title: '刚直不屈',
    text: '班固劝墓主：“官场阴翳，不似战场……脱身是需要圆滑的身段。”墓主却答：“冯某甘愿因棱角遭残，情愿为正道殉身。”——性情刚直，宁折不弯。',
    source: '第一幕·射天狼',
  },
  'act2-office': {
    page: '官职',
    title: '河南京令',
    text: '名帖抬头「“某顿首再拜河南京令明廷足下：」——墓主时任河南京令，主理洛阳京畿。此帖为说情而来：某家顽孙率众欺路人致死，其家托人多番求留余地。',
    source: '第二幕·香祛浊恶',
  },
  'act2-char': {
    page: '品格',
    title: '法不阿贵',
    text: '属吏劝道「您不妨先将其下狱……对外宣称犯人已死」，墓主厉色连问：「天下苍生究竟能有几个轮回，能忍得了一世的含冤而死？」终使属吏叹服：「您向来秉信法不阿贵，怎肯为这一人破例。」',
    source: '第二幕·香祛浊恶',
  },
  'act3-office': {
    page: '官职',
    title: '字平侯 · 豫州幽州刺史',
    text: '墓主字平侯。曾在豫州任刺史，行令严明；如今移镇幽州，政声卓著，百姓道「比过去的好了不知千百倍」。',
    source: '第三幕·人间愿',
  },
  'act3-exp': {
    page: '经历',
    title: '征句骊',
    text: '公元121年春，句骊王久有谋反之心，圣上有意让墓主年后即刻启程，携玄菟太守姚光一道共赴边关，以镇其邪心。',
    source: '第三幕·人间愿',
  },
  'act4-id': {
    page: '籍贯',
    title: '冯焕',
    text: '诏书明言「幽州刺史冯焕」——墓主正是冯焕。',
    source: '第四幕·白黑溷淆',
  },
  'act4-kin': {
    page: '亲缘',
    title: '其子冯绲',
    text: '墓主之子冯绲，字鸿卿；疑诏书有蹊跷，劝父上书自讼，还冯家清白。',
    source: '第四幕·白黑溷淆',
  },
  'act4-plot': {
    page: '结局',
    title: '遭怨者构陷',
    text: '墓主为人刚正，与姚光同为权贵所恶；怨者趁其兵败伪造玺书，意图逼其认罪赴死。',
    source: '第四幕·白黑溷淆',
  },
  'act5-end': {
    page: '结局',
    title: '病死狱中',
    text: '公元121年春，冯焕病死狱中。汉安帝知晓怨者构陷之事时已无法挽回，最终决定治罪庞奋，并赐钱十万愍之。',
    source: '第五幕·寒蝉至',
  },
  'act5-home': {
    page: '籍贯',
    title: '巴郡宕渠',
    text: '墓主故里巴郡宕渠。陛下愿为其越礼立阙，冯绲将择日启程回宕渠故乡，安置父亲并督工。',
    source: '第五幕·寒蝉至',
  },
  'act6-office': {
    page: '官职',
    title: '尚书侍郎',
    text: '墓主官场生涯自尚书侍郎始——「我也时时想起从做尚书侍郎开始的官场生涯」。',
    source: '终幕·魂归何处',
  },
};

/* ---------- 出场角色 ---------- */
const CHAR_DEFS = {
  tourist:   { name: '游客',      color: '#9fd0ff' },
  oldlady:   { name: '老婆婆',    color: '#d9b38c' },
  stranger:  { name: '失忆男子',  color: '#e8dfc8' },
  bangu:     { name: '班固',      color: '#d8b070' },
  shuli:     { name: '属吏',      color: '#b8a07a' },
  ajin:      { name: '阿瑾',      color: '#e3b7c8' },
  ajie:      { name: '阿瑾的姐姐', color: '#d8c3a5' },
  ajie0:     { name: '...（一个女子）', color: '#d8c3a5' },
  yaoguang:  { name: '姚光',      color: '#a8c8a0' },
  fenggun:   { name: '冯绲',      color: '#e0a8a0' },
  fenghuan:  { name: '冯焕',      color: '#e8dfc8' },
  pangfen:   { name: '庞奋',      color: '#c8b090' },
  fenghuanqi:{ name: '冯焕妻',    color: '#d8b8d0' },
  servant:   { name: '下人',      color: '#b0a890' },
  driver:    { name: '司机',      color: '#a8c8e0' },
  guide:     { name: '导游',      color: '#a8c8e0' },
};

/* ---------- 主流程脚本 ----------
 * 节点类型：
 *  intertitle 幕间字幕 | scene 对白场景 | interact 交互卡 | minigame 小游戏
 *  observe 观察教学 | scare 惊吓 | item 获得道具 | book 证据册教学
 *  listen 聆听声波 | transition 转场 | artifact 文物原型卡 | warpanel 定格占位
 *  review 剧情回顾（探案模式专用） | ending 结局结算
 * ============================================================ */

const SCRIPT = [
  /* ================= 序幕 · 昏沉梦 ================= */
  { type: 'intertitle', title: '序幕', sub: '昏沉梦', hint: '' },

  /* --- 街角 · 买火柴 --- */
  {
    type: 'scene', id: 'street', bg: 'bg-street',
    chars: [{ id: 'oldlady', slot: 'left', asset: 'char-oldlady' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '清晨，你刚醒出门，被叫住了。' },
      { speaker: 'oldlady', pose: null, text: '小姑娘/小伙子，买上点火柴吧，阴天可以驱寒呐。' },
      { cls: 'thought', name: '内心想法', text: '什么年代了还用火柴？算了，老人家年纪大了，买些算积德了。' },
    ],
  },
  {
    type: 'interact', id: 'buy-match',
    title: '购买火柴', asset: 'item-match',
    desc: '老婆婆颤巍巍地递来一盒火柴。',
    button: '买下火柴', items: ['火柴'],
    toast: '获得道具：火柴 ×1',
    hint: '点击按钮完成交互',
  },

  /* --- 大巴 · 入梦 --- */
  {
    type: 'scene', id: 'bus', bg: 'bg-bus',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '你脸贴着车窗。昨夜熬得太狠，早上为了搭上这趟去看汉阙的车又起得早，非常困倦，不知不觉就睡了过去……' },
      { cls: 'narration', name: '旁白', text: '于是你见证了一场免于遗忘的梦。' },
    ],
  },
  { type: 'transition', effect: 'fade', text: '' },

  /* --- 墓室 · 点火教学 --- */
  {
    type: 'scene', id: 'tomb-dark', bg: 'bg-tomb', dark: true,
    hint: '……太暗了。点亮光源。',
    lines: [
      { cls: 'narration', name: '旁白', text: '再次睁眼，你已到了一处很昏暗的墓室。四周漆黑，什么也看不清。' },
      { cls: 'narration', name: '旁白', text: '随身的火柴还在。先借一点火光，看看四周。' },
    ],
  },
  { type: 'minigame', id: 'strike-match', hint: '按住火柴，沿砂皮向右滑动，擦燃点亮' },
  {
    type: 'scene', id: 'tomb-lit', bg: 'bg-tomb', dark: true, light: 'match',
    hint: '移动鼠标（手指），用火光照亮四周，观察可疑之处',
    lines: [
      { cls: 'narration', name: '旁白', text: '微弱的火光在指尖摇曳，勉强照亮了周身一圈。' },
      { cls: 'narration', name: '旁白', text: '趁火柴未熄，四处看看吧——墓室里似乎有几处值得留意的地方。' },
    ],
  },
  {
    type: 'observe', id: 'tomb-observe', light: 'match',
    hint: '点击发亮的光点进行观察（共 3 处）',
    points: [
      { x: 22, y: 34, label: '墓壁铭文', text: '斑驳的石壁上刻着模糊的汉隶。火光一晃，字迹又隐入黑暗。' },
      { x: 70, y: 60, label: '陶罐', text: '角落倒着几只陶罐，蒙着厚厚的尘土——大约千余年无人动过了。' },
      { x: 46, y: 76, label: '棺椁轮廓', text: '远处一具棺椁的轮廓若隐若现……你还是别凑太近了。' },
    ],
  },
  { type: 'scare', hint: '' },

  /* --- 墓室 · 冯焕现身对话 --- */
  {
    type: 'scene', id: 'meet', bg: 'bg-tomb', dark: true, light: 'match',
    chars: [{ id: 'stranger', slot: 'right', asset: 'char-shadow' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', text: '这里…像是汉代的墓室？' },
      { cls: 'action', name: '黑影', text: '（一团黑影突然逼近）……！！' },
      { speaker: 'tourist', pose: null, text: '这是什么东西？！' },
      { speaker: 'stranger', pose: null, text: '别怕，别怕，在下只是太激动了。如今，是什么年头啦？' },
      { speaker: 'tourist', text: '是 2026 年。你到底是什么东西？' },
      { speaker: 'stranger', text: '2026？这是谁的年号？我是谁……我也不知道我是谁，曾经应当是可以和你一般站在天地之间的。可我已经忘了许多。哦对了，大汉可还兴盛？' },
      { speaker: 'tourist', text: '你是汉朝人？汉朝，已经覆灭千年之余了。那这…...不会是你的墓室吧？无意打扰无意打扰，我真不是盗墓的，我就睡了个觉就过来了！您知道我该怎么离开吗？' },
      { speaker: 'stranger', text: '覆灭千年……（叹息）罢了，不去想它啦。后世的君子，你好啊。我困于此地许久，曾有梦里仙人诺了我一愿——有缘人来使我忆起我是何人，我便可以归去。大抵便是你吧。我离开了，这里便留不住人了。' },
      { speaker: 'tourist', text: '我？！我既不是道士也不会出马，能看见你估计都是当牛马当久了——困得不行流了牛眼泪才成功的。我该怎么帮你？' },
      { speaker: 'stranger', text: '不必，不必做那些。你我二人有缘，也许便能读懂它们整日嚷嚷的我的过往——它们认得我，我却不认得它们了。若君能替我重识，大抵便可脱离此地了。' },
      { speaker: 'tourist', text: '这位……大人，您这墓里百宝奇珍如此多，难道我要都检查一遍？那得到什么时候？' },
      { speaker: 'stranger', text: '不必，不必。你且仔细听听此处哪里有声响，就去哪个方向。近来仍然嚷嚷的器物，也就四五件了吧。哦对了，别拿你那根小木棒照明啦，拿上这个。' },
    ],
  },

  /* --- 获得火把 --- */
  {
    type: 'item', id: 'torch', asset: 'item-torch',
    title: '获得 · 大号火把',
    desc: '失忆男子递来一根大号木棍，示意你用它照明。',
    button: '接过火把并点燃', items: ['火把'], toast: '获得道具：火把（光照范围更大）',
    hint: '点击按钮完成交互',
  },

  /* --- 证据册教学 --- */
  {
    type: 'book', hint: '身份证据册已解锁：共六页——籍贯、官职、品格、亲缘、经历、结局',
    lines: [
      { cls: 'narration', name: '旁白', text: '你翻开随身的证据册——它分为六页：籍贯、官职、品格、亲缘、经历、结局。' },
      { cls: 'narration', name: '旁白', text: '想要知道他是谁，就得从器物的记忆里，把这些页一页页填满。' },
    ],
  },

  /* --- 聆听声波 --- */
  { type: 'listen', count: 5, hint: '仔细聆听——点击声波最强烈之处' },

  /* ================= 第一幕 · 射天狼 ================= */
  { type: 'intertitle', title: '第一幕', sub: '射天狼', hint: '' },

  { type: 'artifact', title: '文物原型', name: '胡汉交兵画像石', asset: 'bg-stone', hint: '' },

  {
    type: 'scene', id: 'stone', bg: 'bg-stone', dark: true, light: 'torch',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '你举着火把向前摸索，来到声响处，把火把凑近墙壁——发现是一处石刻。' },
      { speaker: 'tourist', text: '这是......？' },
    ],
  },

  { type: 'transition', effect: 'static', text: '画面：电视雪花' },

  {
    type: 'scene', id: 'camp', bg: 'bg-camp',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '雪花散去，你置身于一片军营驻扎之处。其余营帐灯都已熄灭，只有主营帐没有熄灯。' },
      { speaker: 'tourist', text: '我变透明了？...在这个地方倒也正常。' },
      { speaker: 'tourist', text: '这大概便是那个鬼说的器物的记忆了吧。到前面亮着的地方去看看。' },
    ],
  },

  /* --- 主营帐 · 谋划 --- */
  {
    type: 'scene', id: 'tent', bg: 'bg-tent', log: 'act1',
    chars: [{ id: 'bangu', slot: 'left', asset: 'char-bangu' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '主营帐内，二人相谈，神色严肃。你隐约认出其中一人，正是刚刚墓穴的主人。' },
      { speaker: 'bangu', text: '冯先生，我有意待到后日五更，全军饱食，擂鼓振士，从南面冲锋。你意下何如？' },
      { speaker: 'stranger', text: '班护军，您也不是未见那夷人今日折我兵三百的骄横之态。若真是这么去了，怕不是给人个筑京观的好机会。' },
      { speaker: 'bangu', pose: 'angry', text: '你这说的是什么话？！岂能咒我三军！' },
      { speaker: 'stranger', text: '班护军，稍安勿躁啊。您如今用剑可斩我一人头颅，却于我大汉疆土无用呐。今日我军从南面攻其地，双方损失相当，对于匈奴而言并非难以补上的口子。而他们迟迟未动，您想想，这到底是恢复不了，还是陷阱？' },
      { speaker: 'bangu', text: '那你说，后日该怎样打？' },
      { speaker: 'stranger', text: '敌粮草屯在西北坡，营栅连林，明夜有东南风。将军可令小将军率三百轻骑，多带火种，二更出营，绕后烧粮。全军同时偃旗息鼓，把鼓角集中到东面，佯作主力要往东突围。敌见火起，必回救粮；敌阵一动，将军率主力从两营接头的西北角结合部突阵——此役，必胜。若有误，我愿自刎以慰我大汉将士在天之灵。' },
      { speaker: 'bangu', pose: 'think', text: '那便依你之见。' },
    ],
  },

  { type: 'transition', effect: 'flash', text: '画面：直接跳转，最终定格为庆功宴饮' },

  /* --- 庆功宴 · 品格宣言（含关键证据） --- */
  {
    type: 'scene', id: 'feast', bg: 'bg-feast', log: 'act1',
    chars: [{ id: 'bangu', slot: 'left', asset: 'char-bangu' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '战事已定，庆功宴上，班固举杯相敬。' },
      { speaker: 'bangu', text: '冯先生，这次获胜可多亏了你的谋略！待班师回朝，我便为你请旨封官！', evidence: ['act1-exp'] },
      { speaker: 'stranger', text: '谢护军赞赏。' },
      { speaker: 'bangu', text: '只是……官场阴翳，不似战场。若陷进什么困局，有时候脱身是需要圆滑的身段。' },
      { speaker: 'stranger', text: '谢护军提点。只是冯某甘愿因棱角遭残，情愿为正道殉身。', evidence: ['act1-char'] },
      { speaker: 'tourist', text: '原来他曾随班固出征过......现在说话的语气，倒是与千年前截然不同了。' },
    ],
  },

  /* --- 剧情回顾（探案模式） / 游览模式自动完成 --- */
  { type: 'review', logId: 'act1', hint: '对白里藏着关键证据……打开“剧情回顾”，找出它们' },

  /* ================= 第二幕 · 香祛浊恶 ================= */
  { type: 'intertitle', title: '第二幕', sub: '香祛浊恶', hint: '' },

  { type: 'artifact', title: '文物原型', name: '五凤铜熏炉', asset: 'bg-censer', hint: '' },

  /* --- 墓室 · 凤鸟泣血 --- */
  {
    type: 'scene', id: 'act2-tomb', bg: 'bg-tomb', dark: true, light: 'torch', log: 'act2',
    chars: [{ id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', label: '游客（手中火光照亮文物，看见冠子）', text: '嘶......这是鸡吗？' },
      { speaker: 'stranger', label: '失忆男子（突然出现）', text: '阁下真会说笑。这是凤鸟，是盛世昌明才会临世的祥瑞。' },
      { speaker: 'tourist', text: '原来是凤鸟啊。' },
      { cls: 'narration', name: '旁白', text: '（大的铜凤鸟迅速扭过头来正对屏幕，眼里流出血泪，张开嘴想要鸣叫却只发出了嘶哑的声音。喉咙喷出血、溅到屏幕上，制作鲜血流淌的动图，正好场景切换。' },
    ],
  },

  { type: 'blood', hint: '' },

  /* --- 河南京令 · 名帖 --- */
  {
    type: 'scene', id: 'act2-study', bg: 'bg-censer', log: 'act2',
    chars: [{ id: 'shuli', slot: 'left', asset: 'char-shuli' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '切换后即为冯焕任河南京令的时刻，画面为铜熏炉飘着熏香，时令为冬日。一名属吏把名帖放到案边，冯焕未动。）' },
      { speaker: 'shuli', text: '此人已托过多次关系，您多少留些余地。' },
      { cls: 'narration', name: '旁白', text: '（交互：点击有发光点的名帖，查看具体内容）' },
    ],
  },

  {
    type: 'document', id: 'act2-mingtie', bg: 'bg-censer', log: 'act2',
    chars: [{ id: 'shuli', slot: 'left', asset: 'char-shuli' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    docTitle: '【具体内容如下：', docName: '名帖', evidence: ['act2-office'],
    hint: '点击发光的名帖，查看具体内容',
    lines: [
      '“某顿首再拜河南京令明廷足下：',
      '某顽劣之孙，不率教令，群欺路人，致其身死。某闻之，惊怛愧痛，不知所云。其罪至重，某不敢一言称冤，亦愧于故河南尹之名。',
      '然某衰暮之年，其父辈兄亲常居朝堂之上而少能伴者，唯此孙朝夕在侧。某固知其为国法所不容，而私情所不能已。若有一线可矜，使某得见其孙终某一世，则明廷之赐，某虽死不朽。',
      '某诚惶诚恐，顿首顿首，死罪死罪。】',
    ],
  },

  /* --- 拒情 · 法不阿贵 --- */
  {
    type: 'scene', id: 'act2-study2', bg: 'bg-censer', log: 'act2',
    chars: [{ id: 'shuli', slot: 'left', asset: 'char-shuli' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'stranger', text: '哼，余地？那你倒是说说，如何给这伤人性命的人留余地？' },
      { speaker: 'shuli', text: '其罪难逃。但犯人世代累官高位，您不妨先将其下狱，至于后事如何，且与其家人商议再定。毕竟，死者非家世显赫之辈，您对外宣称犯人已死，他们还能怀疑不成？' },
      { speaker: 'stranger', text: '昌文，你可还记得，你曾与我说过，你幼时目睹邻人遭难？' },
      { speaker: 'stranger', text: '你可还记得，你与我说至惨烈之处，都忍不住潸然泪下？' },
      { speaker: 'stranger', text: '你难道希望这死者的父母兄亲乃至他的邻人，不仅仅活在悲痛、还要活在欺瞒之中？！' },
      { speaker: 'stranger', text: '天下苍生究竟能有几个轮回，能忍得了一世的含冤而死？' },
      { speaker: 'stranger', text: '汉土苍阔，岂容奸黠晦污？' },
      { speaker: 'shuli', text: '......（叹息）属下该死。是我偏颇了，您向来秉信法不阿贵，怎肯为这一人破例。', evidence: ['act2-char'] },
      { speaker: 'stranger', text: '既知道，便不必再说了。' },
      { speaker: 'stranger', text: '你将熏香燃得再旺些就先出去吧，这案卷藏恶，熏上些香气，许能使我不甚厌烦。' },
    ],
  },

  /* --- 凤鸟炉 · 喃喃 --- */
  {
    type: 'scene', id: 'act2-close', bg: 'bg-fenghuan', log: 'act2',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（画面变化，转至冯焕正对凤鸟炉，出现的只有他握着笔的手和飘烟的炉子）' },
      { speaker: 'stranger', label: '失忆男子（喃喃自语）', text: '凤鸟啊凤鸟，你何时肯降临这世上呢？' },
      { cls: 'narration', name: '旁白', text: '（画面向凤鸟炉出移近镜头，此时凤鸟炉由金色逐渐褪色为青铜色，并流出血泪。待完全回归墓室场景，让大凤鸟头部直接断裂）' },
    ],
  },

  /* --- 回归墓室 · 断首凤鸟 --- */
  {
    type: 'scene', id: 'act2-tomb2', bg: 'bg-tomb', dark: true, light: 'torch', log: 'act2',
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', text: '这鸟的头怎么断了？那位大人呢？应当不会让我赔付吧。姓冯的历史人物我还真不知道多少，这样刚正的更是对不上号......他究竟是谁呢？' },
      { speaker: 'tourist', text: '不过既然大人生前如此令人钦佩，万万不能像先前那样不尊重了。且先接着看看吧。' },
    ],
  },

  { type: 'review', logId: 'act2', hint: '对白与名帖里藏着关键证据……打开“剧情回顾”，找出它们' },

  { type: 'hint', text: '与下一处文物交流' },

  /* ================= 第三幕 · 人间愿 ================= */
  { type: 'intertitle', title: '第三幕', sub: '人间愿', hint: '' },

  { type: 'artifact', title: '文物原型', name: '乐舞杂技画像石', asset: 'bg-yuewu', hint: '' },

  /* --- 石壁 · 画像活化 --- */
  {
    type: 'scene', id: 'act3-stone', bg: 'bg-yuewu', dark: true, light: 'torch', log: 'act3',
    chars: [{ id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（玩家继续探索，来到下一处文物处，火光照亮石壁）' },
      { speaker: 'tourist', text: '千年了，这石壁上的画竟仍是栩栩如生啊。' },
      { speaker: 'tourist', text: '许多颜色都还没褪……太不可思议了。' },
      { speaker: 'stranger', label: '失忆男子（突然冒出）', text: '是啊。' },
      { speaker: 'stranger', text: '这么多年过去，我这儿原有的许多坚硬的东西也尽数湮灭了。' },
      { speaker: 'stranger', text: '而这被涂抹上去的薄薄的一层乐舞，却在此徘徊吟唱了千年。' },
      { speaker: 'stranger', text: '你说……我生前会是个喜欢戏乐杂戏的人么？' },
      { speaker: 'stranger', text: '我总觉着，看到这幅画像，纵使周身无火也甚是温暖。' },
      { speaker: 'tourist', text: '......您下次出现前打个招呼，让我准备一下。' },
      { speaker: 'tourist', text: '真是吓死了。' },
      { speaker: 'tourist', text: '既然死后都要画下来相伴，说不定真是您生前酷爱呢。' },
      { speaker: 'tourist', text: '我且去看看究竟如何。' },
      { cls: 'narration', name: '旁白', text: '（画面：手放在画像上，画像上的人物先是动起来，最后化成实体）' },
    ],
  },

  { type: 'transition', effect: 'flash', asset: 'fx-painting', text: '' },

  /* --- 庙会 · 姊妹观舞 --- */
  {
    type: 'scene', id: 'act3-fair', bg: 'bg-fair', log: 'act3',
    chars: [{ id: 'ajie0', slot: 'left', asset: 'char-ajie' }, { id: 'ajin', slot: 'right', asset: 'char-ajin' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（耳边传来声音，随即画面转动到周围的人群中）' },
      { speaker: 'tourist', text: '这难道算是汉代的庙会？' },
      { speaker: 'tourist', text: '好热闹啊。' },
      { speaker: 'ajie0', text: '阿瑾，快些来呀！' },
      { speaker: 'ajie0', text: '你再那么慢悠悠的，可就看不到你爱看的杂戏了！' },
      { speaker: 'ajin', text: '哎哟阿姐你慢点！' },
      { speaker: 'ajin', text: '我都快跟不上你了。' },
      { speaker: 'ajin', text: '就算今天赶不上，明后两天也都能看到的。' },
      { speaker: 'ajie', text: '明后日？' },
      { speaker: 'ajie', text: '你莫不是终日读书读傻了？' },
      { speaker: 'ajie', text: '这舞乐队，历来分明只有今日才会出演。' },
      { speaker: 'ajin', text: '阿姐，这分明是你的消息不够灵通了。' },
      { speaker: 'ajin', text: '夫子和我们说过，那句骊王有谋反之心久矣，圣上有意让冯大人年后即刻启程，携玄菟太守姚光一道共赴边关以镇其邪心。', evidence: ['act3-exp'] },
      { speaker: 'ajin', text: '这戏乐班子里不知有谁听了这事情，就决定连演三日扛鼎弄剑为刺史大人送行。' },
      { speaker: 'ajie', text: '竟是这样，还是我们阿瑾有见识呐。' },
      { speaker: 'ajie', text: '那我们今儿就不去挤了，先到河畔放河灯，好不好？' },
      { speaker: 'ajin', text: '好啊好啊！' },
      { speaker: 'ajin', text: '阿姐，我们快去吧！' },
      { speaker: 'ajie', text: '阿瑾可是最近有了什么心事？' },
      { speaker: 'ajie', text: '怎么到了放灯许愿，走得这样急切？' },
      { speaker: 'ajin', text: '是有。' },
      { speaker: 'ajin', text: '阿姐你瞧，舞乐之人尚且知晓感激冯刺史的恩惠，我们这得了豪强还田的小民，怎么能不感激呢？' },
      { speaker: 'ajin', text: '他从洛阳来时，那些大族还不信他能把在豫州做刺史的行令方式直接搬过来。', evidence: ['act3-office'] },
      { speaker: 'ajin', text: '都认为他在洛阳积累的声威是因为天子脚下诸侯不敢造次。' },
      { speaker: 'ajin', text: '而你看看这如今的幽州，比过去的好了不知千百倍。', evidence: ['act3-office'] },
      { speaker: 'ajin', text: '如此明官在上，我如何能不为他祈福，愿大军凯旋、愿我大汉长安呢？' },
      { cls: 'narration', name: '旁白', text: '（画面改变：二人已走到河边）' },
    ],
  },

  /* --- 河畔 · 放河灯 --- */
  {
    type: 'scene', id: 'act3-river', bg: 'bg-river', log: 'act3',
    chars: [{ id: 'ajie', slot: 'left', asset: 'char-ajie' }, { id: 'ajin', slot: 'right', asset: 'char-ajin' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'ajie', text: '好呀，我们阿瑾有报恩之心，也有壮志之情。' },
      { speaker: 'ajie', text: '日后，也会像冯大人那般做官为民、造福一方的。' },
      { cls: 'narration', name: '旁白', text: '（放河灯，画面推远，展示亮着许多灯的河流，一直到楼阁之上：姚光、冯焕两人的背影，手里拿着酒杯；旁边有一张桌子，上面有酒壶，二人中间是那条河流的远景。）' },
    ],
  },

  /* --- 楼阁 · 人间愿 --- */
  {
    type: 'scene', id: 'act3-tower', bg: 'bg-tower', log: 'act3',
    chars: [{ id: 'yaoguang', slot: 'left', asset: 'char-yaoguang' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'stranger', text: '姚光，你说，河边的人都在许什么愿呢？' },
      { speaker: 'yaoguang', text: '嗯......许是像国泰民安、家人康健、五谷丰登一类的？' },
      { speaker: 'yaoguang', text: '这么多人呢，列举是举不完的。' },
      { speaker: 'yaoguang', text: '不过你别说，大家都在许愿，像是都在给生活许下盼头。' },
      { speaker: 'yaoguang', text: '再去想你我开春时的开拔，盼望得胜的心似乎更甚昨日。' },
      { speaker: 'stranger', text: '我何尝不是呢。' },
      { speaker: 'stranger', text: '不过我却希望这世上的愿望能少一点、再少一点。' },
      { speaker: 'yaoguang', text: '平侯，有愿望是好事啊。你这话说得我可不懂了。', evidence: ['act3-office'] },
      { speaker: 'stranger', text: '若已经取胜，就无需盼望；若年年丰收，便不必祈求；若金吾不禁，或安忧国之心。' },
      { speaker: 'yaoguang', text: '好啊，也对也对。' },
      { speaker: 'yaoguang', text: '平侯兄，若你我此去能重展燕然之姿，那离你的希望便更近了。' },
      { speaker: 'yaoguang', text: '但今日是个好时节啊，我这杯里所剩无几，你那却还是满满的，是不是——' },
      { speaker: 'stranger', text: '哈哈哈，我还不了解你么？' },
      { speaker: 'stranger', text: '我自当浮一大白！' },
      { cls: 'narration', name: '旁白', text: '（交互：点击取桌上酒壶，使冯焕直饮。）' },
    ],
  },

  /* --- 取酒壶 --- */
  {
    type: 'interact', id: 'act3-winepot',
    title: '交互', asset: 'item-winepot',
    desc: '桌上放着一只酒壶，为这最后一杯斟满吧。',
    button: '取酒壶', toast: '冯焕举壶直饮——浮一大白！',
    hint: '点击按钮完成交互',
  },

  { type: 'review', logId: 'act3', hint: '对白里藏着关键证据……打开“剧情回顾”，找出它们' },

  /* ================= 第四幕 · 白黑溷淆 ================= */
  { type: 'intertitle', title: '第四幕', sub: '白黑溷淆', hint: '' },

  { type: 'artifact', title: '文物原型', name: '假诏竹简', asset: 'bg-zhujian', hint: '' },

  {
    type: 'scene', id: 'act4-tomb', bg: 'bg-tomb', dark: true, light: 'torch', log: 'act4',
    chars: [{ id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', text: '我想我知道您为什么在这里不冷了。' },
      { speaker: 'stranger', text: '为何？你知道我是谁了？' },
      { speaker: 'tourist', text: '不知道，我连您的全名都不知道。' },
      { speaker: 'tourist', text: '但这画里的人、当年看这“画”的人，也许为您燃了盏千年不灭的灯火。' },
      { speaker: 'stranger', text: '你说话当真有趣。' },
      { speaker: 'stranger', text: '不过，你听完后的几件器物都安静了，真是难得的清净啊。' },
      { speaker: 'stranger', text: '还剩两件啦，也许听完这两件，你就知晓我的名字啦。' },
      { cls: 'narration', name: '旁白', text: '（提示玩家查看下一处文物，发现是一些残缺的竹简。交互：捡拾起来。随后画面切换到冯焕披着外衣坐在书房椅子上，冯绲在他左侧站着。）' },
    ],
  },

  {
    type: 'interact', id: 'act4-zhujian',
    title: '交互', asset: 'item-zhujian',
    desc: '地上散落着一些残缺的竹简。',
    button: '捡拾竹简', toast: '获得：假诏竹简',
    hint: '点击按钮完成交互',
  },

  /* --- 书房 · 待旨 --- */
  {
    type: 'scene', id: 'act4-study', bg: 'bg-shufang', log: 'act4',
    chars: [{ id: 'fenggun', slot: 'left', asset: 'char-fenggun' }, { id: 'fenghuan', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'fenggun', text: '父亲，据说派旨的宫人马上就要到了。您提前做些准备吧。' },
      { speaker: 'fenghuan', label: '冯焕（闭着眼睛，没有移动）', text: '......' },
      { speaker: 'fenggun', text: '父亲，您振作些。' },
      { speaker: 'fenggun', text: '遭句骊王诈降而失利，非您一人之过。' },
      { speaker: 'fenggun', text: '您最后极力挽战，已是尽了全力。' },
      { speaker: 'fenggun', text: '更何况，这前半场战役我军也颇有所获啊。' },
      { speaker: 'fenggun', text: '陛下知您劳苦爱民，定然不会为难您。' },
      { speaker: 'fenghuan', text: '输了便是输了，无可争辩。' },
      { speaker: 'fenghuan', text: '无论圣上意下何如，我......都认。' },
      { cls: 'narration', name: '旁白', text: '（画面全黑，等一小会大概三秒，先有声音”圣旨到”再出现画面：宣旨之人居高临下）' },
    ],
  },

  { type: 'transition', effect: 'fade', text: '圣旨到', dur: 2800 },

  /* --- 宣旨 · 假诏 --- */
  {
    type: 'scene', id: 'act4-proclaim', bg: 'bg-proclaim', log: 'act4',
    chars: [{ id: 'pangfen', slot: 'left', asset: 'char-pangfen' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'pangfen', text: '冯焕接旨。' },
      { cls: 'narration', name: '旁白', text: '（这个时候做个交互，游客可以浏览诏书全文，不用做那么长的语音：制诏辽东属国都尉庞奋：' },
    ],
  },

  {
    type: 'document', id: 'act4-zhaoshu', bg: 'bg-proclaim', log: 'act4',
    chars: [{ id: 'pangfen', slot: 'left', asset: 'char-pangfen' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    docTitle: '诏书全文', docName: '诏书', evidence: ['act4-id'],
    hint: '点击发光处，浏览诏书全文',
    lines: [
      '幽州刺史冯焕，受任北州，志在疾恶，到官以来，豪右屏气，闾里获安。玄菟太守姚光，久历边郡，谙晓胡情，与焕同心，共修武备，朕甚嘉之。',
      '句骊小丑，敢窥塞垣，焕等提兵问罪，虽未即枭悬，而共解玄菟之困，亦足褫其魄。',
      '然——',
      '近闻焕在州，专戮自恣，行事轻狂，使蛮夷有所获。边人苦之，怨声上闻。',
      '夫刺史者，朕之耳目，非朕之爪牙。生杀之柄，岂人臣所专？',
      '昔朕以肺腑待焕，焕乃以跋扈报朕。 此而不惩，何以令天下？',
      '今赐焕、光欧刀各一，下辽东都尉庞奋，即速行刑。军中还者有罪，勿连坐。布告北州，使明知朕意。',
    ],
  },

  {
    type: 'scene', id: 'act4-proclaim2', bg: 'bg-proclaim', log: 'act4',
    chars: [{ id: 'pangfen', slot: 'left', asset: 'char-pangfen' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（语音可做开头一段和结尾的，中间省略，在文本框里表示为省略号）' },
      { cls: 'narration', name: '旁白', text: '（画面：当读到“今赐焕、光欧刀各一”的时候，除了庞奋，周围所有人全部变换表情：瞪大眼、张嘴——总之，表现惊恐。可在图上贴上一层闪烁的红色滤镜。）' },
    ],
  },

  { type: 'redflash', hint: '' },

  {
    type: 'scene', id: 'act4-proclaim3', bg: 'bg-proclaim', log: 'act4',
    chars: [{ id: 'pangfen', slot: 'left', asset: 'char-pangfen' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'stranger', label: '失忆男子（小声、惶恐）', text: '这，这……圣上怎会如此？' },
      { speaker: 'pangfen', text: '冯大人，请吧。' },
      { cls: 'narration', name: '旁白', text: '（说罢，其小吏便强制带走了冯焕。画面可以定格在冯绲眼中一身白衣被带离的父亲逐渐消失最后只剩下瞳孔的黑色，借由这个黑色转场进入牢狱，冯绲前来劝说。）' },
    ],
  },

  { type: 'transition', effect: 'fade', text: '' },

  /* --- 牢狱 · 上书 --- */
  {
    type: 'scene', id: 'act4-prison', bg: 'bg-prison', log: 'act4',
    chars: [{ id: 'fenggun', slot: 'left', asset: 'char-fenggun' }, { id: 'fenghuan', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'fenggun', text: '父亲，父亲！您抬头看看我啊。' },
      { speaker: 'fenghuan', text: '……鸿卿来啦。', evidence: ['act4-kin'] },
      { speaker: 'fenghuan', text: '我已是罪人之身，哪还有什么脸面去见你和你的母亲弟兄呢。' },
      { speaker: 'fenggun', text: '不，不是的。您明明是忠臣，是百姓嘴里口口相传的好官啊。' },
      { speaker: 'fenghuan', label: '冯焕（自嘲地笑）', text: '哼，哪个好官会沦落到圣上亲下罪诏、得一欧刀作结的结局呢？' },
      { speaker: 'fenggun', text: '父亲，您往这走几步，我有几句话想对您说。' },
      { cls: 'narration', name: '旁白', text: '（画面转为二人私语）' },
      { speaker: 'fenggun', text: '父亲，您当真不觉得这诏书蹊跷？' },
      { speaker: 'fenggun', text: '我军信了诈降确有失误，而如今他却已被迅速斩杀，这可合乎法制？' },
      { speaker: 'fenghuan', text: '姚兄已被杀了？！是我对不住他啊，是我之过，是我之过啊。' },
      { speaker: 'fenghuan', text: '鸿卿，我知你有意为我解难，而简书之上，刻字定罪分明，我如何向圣上辩得？' },
      { speaker: 'fenggun', text: '若这诏书本非陛下所制呢？！' },
      { speaker: 'fenggun', text: '当今圣上仁厚，可却纵了那太监外戚之权。' },
      { speaker: 'fenggun', text: '您为人刚正，他们视您与姚光大人为眼中钉亦是久矣。', evidence: ['act4-plot'] },
      { speaker: 'fenggun', text: '这下诏本就不符常理，圣上下诏怎会直接到一都尉手中？' },
      { speaker: 'fenggun', text: '您在民间素有贤名，怎会“边人苦之，怨声上闻”？' },
      { speaker: 'fenghuan', text: '可万一……' },
      { speaker: 'fenggun', text: '父亲，事态紧急，容不得您同我再三思虑了。孩儿恳请您上书自讼，还您自己一个清白，还我冯家一个清白，还这边疆百姓一个清白！', evidence: ['act4-kin'] },
      { speaker: 'fenghuan', label: '冯焕（剧烈咳嗽）', text: '好，我听你的。' },
      { speaker: 'fenghuan', text: '你先离开吧，这牢狱阴冷，留久了别伤了身子，待巡狱者至，我自会索其纸笔。' },
      { speaker: 'fenggun', text: '父亲，您身子还好吗？' },
      { speaker: 'fenggun', text: '您切勿思虑过重，这一切并非死局。' },
      { speaker: 'fenghuan', text: '不碍事的，劳你挂念了。' },
      { speaker: 'fenghuan', text: '你先快些离去吧。' },
      { speaker: 'fenggun', text: '那我走了，您多保重' },
      { cls: 'narration', name: '旁白', text: '（冯焕点了点头）' },
      { cls: 'narration', name: '旁白', text: '（待冯绲离开画面，冯焕即刻吐出了一口鲜血）' },
      { speaker: 'fenghuan', text: '……近来怎么老得这样快、病得这样急。' },
      { cls: 'narration', name: '旁白', text: '（脚步声临近，冯焕叫住对方“大人，留步”并请求拿到纸笔）' },
      { cls: 'narration', name: '旁白', text: '（拿到纸笔，玩家点击交互键，笔开始移动并留下墨迹，不用清晰的文字，呈书写状态即可）' },
    ],
  },

  { type: 'writing', hint: '按住笔锋，在纸上写下申诉' },

  {
    type: 'scene', id: 'act4-prison2', bg: 'bg-prison', log: 'act4',
    chars: [{ id: 'fenghuan', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（收笔）' },
      { speaker: 'fenghuan', text: '愿此书，能还众人清白。' },
      { cls: 'narration', name: '旁白', text: '（一滴墨滴在屏幕上晕染开来，切换回墓室场景）' },
    ],
  },

  { type: 'inkdrop', hint: '' },

  { type: 'review', logId: 'act4', hint: '对白与诏书里藏着关键证据……打开“剧情回顾”，找出它们' },

  { type: 'hint', text: '与下一处文物交流' },

  /* ================= 第五幕 · 寒蝉至 ================= */
  { type: 'intertitle', title: '第五幕', sub: '寒蝉至', hint: '' },

  { type: 'artifact', title: '文物原型', name: '汉代玉蝉意象', asset: 'item-yuchan', hint: '' },

  {
    type: 'scene', id: 'act5-tomb', bg: 'bg-tomb', dark: true, light: 'torch', log: 'act5',
    chars: [{ id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', text: '原来那位大人名冯焕。' },
      { speaker: 'tourist', text: '他去哪了？' },
      { speaker: 'tourist', text: '我知道了他的名字，怎么又不在了？' },
      { speaker: 'tourist', text: '先将这最后一块文物看完吧。' },
      { cls: 'narration', name: '旁白', text: '（线索提示：捡起旁边的玉蝉）' },
    ],
  },

  {
    type: 'interact', id: 'act5-yuchan',
    title: '交互', asset: 'item-yuchan',
    desc: '一枚玉蝉静静躺在尘土里。',
    button: '捡起玉蝉', toast: '获得：玉蝉',
    hint: '点击按钮完成交互',
  },

  {
    type: 'scene', id: 'act5-tomb2', bg: 'bg-tomb', dark: true, light: 'torch',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（玉蝉闪过光，向玉蝉拉近镜头，更换为灵堂场面）' },
    ],
  },

  { type: 'transition', effect: 'flash', asset: 'item-yuchan', text: '' },

  /* --- 灵堂 --- */
  {
    type: 'scene', id: 'act5-lingtang', bg: 'bg-coffin', log: 'act5',
    chars: [{ id: 'fenggun', slot: 'left', asset: 'char-fenggun' }, { id: 'fenghuanqi', slot: 'right', asset: 'char-fenghuanqi' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'fenggun', label: '冯绲（伏在棺材旁边，泣不成声）', text: '父亲，您听到陛下刚刚传下的旨意了吗？' },
      { speaker: 'fenggun', text: '玺书是奸人伪造，陛下知晓您和姚大人已故，特赐十万钱以示怜悯......', evidence: ['act5-end'] },
      { cls: 'narration', name: '旁白', text: '（交互：这次交互和冯绲说话是同时进行的。点击棺材，可见冯焕死后容颜，与前三幕所见大不相同：非常瘦、看起来像遭受了虐待。）' },
    ],
  },

  { type: 'coffinview', hint: '点击棺椁，再看一眼' },

  {
    type: 'scene', id: 'act5-lingtang2', bg: 'bg-coffin', log: 'act5',
    chars: [{ id: 'fenggun', slot: 'left', asset: 'char-fenggun' }, { id: 'fenghuanqi', slot: 'right', asset: 'char-fenghuanqi' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'fenghuanqi', text: '绲儿，你莫要再哭了。' },
      { speaker: 'fenghuanqi', text: '自你父亲归去，你多少时日是用泪水填满的？' },
      { speaker: 'fenghuanqi', text: '你父亲看到你这副样子，也会心痛的啊。' },
      { speaker: 'fenggun', text: '母亲，道理我都明白。' },
      { speaker: 'fenggun', text: '可我敬重爱戴的父亲如此不明不白地去了，教人如何不伤心？' },
      { speaker: 'fenghuanqi', text: '娘能理解你呐。' },
      { speaker: 'fenghuanqi', text: '这全府上下，哪有几个人不因此悲痛？' },
      { speaker: 'fenghuanqi', text: '你日日哭泣，娘担忧你，而你父亲的魂灵有所牵挂，也难以安歇。' },
      { speaker: 'fenghuanqi', text: '你且坚强些，我们好好把日子过下去，比他在的时候再好些，让他不再忧心、安心归去吧。' },
      { speaker: 'fenggun', text: '好，我会的。' },
      { speaker: 'fenggun', text: '我也要像父亲那样为官，为百姓请命。' },
      { speaker: 'fenggun', text: '纵使他已离去，我要让他的志向永永远远地活着。' },
      { speaker: 'fenghuanqi', text: '娘知道，你向来把你父亲当作榜样，希望有朝一日能像他那般为民造福。' },
      { speaker: 'fenghuanqi', text: '如今陛下为安抚冯家，亲封你为郎中，给了你这样一个机会。' },
      { speaker: 'fenghuanqi', text: '但绲儿你要记住，娘只盼望你健康顺遂，勿要如你父亲那般再踏足凶险之地。' },
      { speaker: 'fenghuanqi', text: '娘不求至亲青史留名，但求我冯家子孙长乐无忧。' },
      { speaker: 'fenggun', text: '......母亲，我知道了，孩儿谨遵您的教诲。' },
      { speaker: 'fenggun', text: '陛下愿为父亲越礼立阙，我将择日启程回宕渠故乡安置父亲并督工。', evidence: ['act5-home'] },
      { speaker: 'fenghuanqi', text: '好，你愿意听我的就好。' },
      { speaker: 'fenghuanqi', text: '从此到巴郡的路途凶险，你定要当心。' },
      { cls: 'narration', name: '旁白', text: '（画面中出现一个下人）' },
      { speaker: 'servant', text: '见过夫人、公子。刚刚清点赐钱时，在钱箱中发现此物。' },
      { cls: 'narration', name: '旁白', text: '（凑近发现是一枚玉蝉）' },
      { speaker: 'fenggun', text: '这......大抵是陛下的恩赐。' },
      { speaker: 'fenggun', text: '你去把它放于该放的陪葬处吧。' },
      { cls: 'narration', name: '旁白', text: '（困难路线交互：拿玉蝉，划到冯焕嘴边放入，没有提示，失败扣血条；简单的则是左上角提示：放入冯焕口中。）' },
    ],
  },

  { type: 'jade', hint: '' },

  {
    type: 'scene', id: 'act5-lingtang3', bg: 'bg-coffin', log: 'act5',
    chars: [{ id: 'fenggun', slot: 'left', asset: 'char-fenggun' }, { id: 'servant', slot: 'right', asset: 'char-servant' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'fenggun', text: '大约后几日便要启程往宕渠，你且吩咐府里上下准备准备，别耽误了事。' },
      { speaker: 'servant', text: '是。' },
      { cls: 'narration', name: '旁白', text: '（画面变黑，一只眼睛出现在屏幕正中，不停流泪。玩家交互为其擦干泪水，擦三下后画面渐明，来到百姓为冯绲送行的场景）' },
    ],
  },

  { type: 'eye', hint: '为它擦干泪水（三次）' },

  /* --- 送行 --- */
  {
    type: 'scene', id: 'act5-songxing', bg: 'bg-funeral', log: 'act5',
    chars: [{ id: 'fenggun', slot: 'center', asset: 'char-fenggun' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'fenggun', label: '冯绲（走过一些穿白衣的民众）', text: '父亲，您看，我就说您是个好官。' },
      { cls: 'narration', name: '旁白', text: '（交互，左上角提示听听百姓在说什么，同时人群中一人身上亮起白色交互光点，是第三幕出现过的阿瑾和他姐姐。）' },
    ],
  },

  { type: 'spot', hint: '人群中亮起了一点白光——上前听听' },

  {
    type: 'scene', id: 'act5-ajin', bg: 'bg-funeral', log: 'act5',
    chars: [{ id: 'ajin', slot: 'left', asset: 'char-ajin' }, { id: 'ajie', slot: 'right', asset: 'char-ajie' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'ajin', text: '阿姐，我总觉得，我们去放河灯就是在昨天。' },
      { speaker: 'ajin', text: '为何今日就已经无长安、无太平、无喜乐了？' },
      { speaker: 'ajie', text: '会有一天再出现的。' },
      { speaker: 'ajie', text: '阿瑾，再为冯使君许一次愿吧。' },
      { speaker: 'ajie', text: '他功德傍身，说不定这次就实现了呢。' },
      { cls: 'narration', name: '旁白', text: '（画面再次回归到冯绲的车队，展现浩浩汤汤的车队背影，屏幕暗下去，再次亮起就已经到了宕渠即今天的渠县，阙已立好。）' },
    ],
  },

  { type: 'transition', effect: 'fade', text: '' },

  {
    type: 'scene', id: 'act5-que', bg: 'bg-que-built', log: 'act5',
    chars: [{ id: 'fenggun', slot: 'center', asset: 'char-fenggun' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'fenggun', label: '冯绲（望着高高的阙）', text: '父亲，有了这座阙，你便能望着它往前走，走到神道，走到仙界了吧。' },
      { speaker: 'fenggun', text: '您在人间的日子太苦，愿您后世长与逍遥作伴。' },
    ],
  },

  { type: 'review', logId: 'act5', hint: '对白里藏着关键证据……打开“剧情回顾”，找出它们' },

  {
    type: 'evidence-overview',
    hint: '',
    lines: [
      '籍贯：冯焕，字平侯，巴郡宕渠人。',
      '官职：【】、河南京令、豫州及幽州刺史。',
      '品格：疾忌奸恶',
      '亲缘：其子冯绲，字鸿卿，劝父上书自讼，因此闻名得拜郎中。',
      '经历：曾随班固出征并在燕然山大捷时立功；为官刚正，不偏袒豪右；带领玄菟太守征句骊，遭诈降未得胜；建光元年遭怨者伪造玺书下狱，后来查明真相，还其清白。',
      '结局：史料载，病死狱中。',
    ],
  },

  /* ================= 终幕 · 魂归何处 ================= */
  { type: 'intertitle', title: '终幕', sub: '魂归何处', hint: '' },

  {
    type: 'scene', id: 'final-tomb', bg: 'bg-tomb', dark: true, light: 'torch',
    chars: [{ id: 'fenghuan', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（屏幕变黑，回到墓室场景）' },
      { speaker: 'fenghuan', text: '小友，你现下可知我是谁了？' },
      { speaker: 'tourist', text: '知道了大概，也许不全。' },
      { speaker: 'fenghuan', text: '无妨，你且和我说来听听。' },
      { cls: 'narration', name: '旁白', text: '（下面来到游客口述环节，这一部分画面不停留在墓室，尽量做得漂亮一点，伴随游客的讲述内容切换不同的画面）' },
    ],
  },

  { type: 'scene', id: 'recall1', bg: 'bg-tomb', dark: true, light: 'torch', lines: [{ speaker: 'tourist', text: '您名为冯焕，字平侯，是巴郡宕渠人。' }], hint: '点击画面或按空格推进对话' },
  { type: 'scene', id: 'recall2', bg: 'bg-censer', lines: [{ speaker: 'tourist', text: '您向来直爽刚正，有什么便说什么，也看不惯那些豪门大族仗势欺人。' }], hint: '点击画面或按空格推进对话' },
  { type: 'scene', id: 'recall3', bg: 'bg-camp', lines: [{ speaker: 'tourist', text: '年轻时，随班固出征，以谋略助将军取得燕然山大捷，班师回朝后，上任为官。' }], hint: '点击画面或按空格推进对话' },
  { type: 'scene', id: 'recall4', bg: 'bg-fair', lines: [{ speaker: 'tourist', text: '您在做河南京令、豫州刺史、幽州刺史时，惩处奸恶，为百姓做了不少好事，却也得罪了不少人。' }], hint: '点击画面或按空格推进对话' },
  { type: 'scene', id: 'recall5', bg: 'bg-tower', lines: [{ speaker: 'tourist', text: '建光元年，您率兵征伐句骊，未料到对方诈降而败，从此时时自责。' }], hint: '点击画面或按空格推进对话' },
  { type: 'scene', id: 'recall6', bg: 'bg-prison', lines: [{ speaker: 'tourist', text: '记恨您的人趁此时机伪造诏书，意图逼您认罪赴死。' }, { speaker: 'tourist', text: '您本已心灰意冷，而冯绲坚持劝您上书自讼，您决定听从他的意见。' }], hint: '点击画面或按空格推进对话' },
  { type: 'scene', id: 'recall7', bg: 'bg-proclaim', lines: [{ speaker: 'tourist', text: '最后，皇上下了真正的旨意，洗清了这伪造玺书下的冤屈。' }], hint: '点击画面或按空格推进对话' },
  { type: 'scene', id: 'recall8', bg: 'bg-tomb', dark: true, light: 'torch', lines: [{ speaker: 'tourist', text: '可您即使恢复记忆，也不会知道这结局。' }], hint: '点击画面或按空格推进对话' },
  {
    type: 'scene', id: 'recall9', bg: 'bg-tomb', dark: true, light: 'torch',
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', text: '您留在了那个离圣旨很近很近的春天。' },
      { cls: 'narration', name: '旁白', text: '（讲述完，场景回归墓室，但周围的一切开始坍塌，到最后四周一片苍茫，只有双阙和玩家冯焕二人，冯焕周身不再萦绕黑雾，而是完完整整的出现在玩家面前）' },
    ],
  },

  { type: 'transition', effect: 'fade', text: '' },

  /* --- 双阙 · 记起来了 --- */
  {
    type: 'scene', id: 'final-shuangque', bg: 'bg-shuangque',
    chars: [{ id: 'fenghuan', slot: 'center', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'fenghuan', text: '......记起来了，我都记起来了。' },
      { speaker: 'fenghuan', text: '我也明白了，我为何会失去记忆。' },
      { speaker: 'tourist', text: '为什么？' },
      { speaker: 'tourist', text: '是那些您生前害您的人做的？' },
      { speaker: 'fenghuan', text: '（笑）不是。' },
      { speaker: 'fenghuan', text: '是我自己，我自困囹圄。' },
      { speaker: 'fenghuan', text: '我死后，执念深重，不肯散去。' },
      { speaker: 'fenghuan', text: '我常常想起和将军纵马燕然的日子，想起他说我“文武兼备，可当大用”；我也时时想起从做尚书侍郎开始的官场生涯，想起洛阳的百姓因一句公正的判决而泪流满面的样子；我更无法摆脱久久盘旋脑中的那场战役，想起因我的一次轻信而未能大获全胜的痛苦。', evidence: ['act6-office'], autoEvidence: true },
      { speaker: 'fenghuan', text: '我更是反复思索那道圣旨：是不是我已经让信任我的百姓失望，是不是我已经让冯家列祖列宗蒙羞......' },
      { speaker: 'fenghuan', text: '我甚至想，也许不那么正直，就不会招致记恨。' },
      { speaker: 'fenghuan', text: '可我想得太多，当欲念满溢，人就不再算人、鬼也不再算鬼了。' },
      { speaker: 'tourist', text: '您从未让百姓失望。' },
      { speaker: 'tourist', text: '您死后，他们自发为您送行，多少人情难自禁，泣不成声。' },
      { speaker: 'tourist', text: '您也没有让冯家失望，您的儿子秉承您的志向，成了东汉名臣，为官造福一方。' },
      { speaker: 'fenghuan', text: '哈哈，谢谢你宽慰我，小友。' },
      { speaker: 'fenghuan', text: '不过如今我已开脱了。' },
      { speaker: 'fenghuan', text: '斗转星移，汉都死了，我却仍旧执着于旧事，实在是有些傻了。' },
      { speaker: 'fenghuan', text: '我也是时候离开这里了。' },
      { speaker: 'fenghuan', text: '久居地下，我的双眼已经瞎了，小友可愿用火把送我一程？' },
      { speaker: 'tourist', text: '火把？您不是看不见吗？' },
      { speaker: 'fenghuan', text: '哎，你也没比我聪明多少。' },
      { speaker: 'fenghuan', text: '我看不见火把，还不知道它是热的吗？' },
      { cls: 'thought', name: '游客', text: '（内心想法：......算是见识到真正的嘴毒正版冯焕了。冯绲说阙会指引人走向何方，应当引领他到那里即可吧。）' },
      { speaker: 'tourist', text: '好，那我们走吧。' },
      { cls: 'narration', name: '旁白', text: '（玩家举着火把带领冯焕前进，一路上有许多回忆的声音，“要不是冯大人，杀我儿的祸害怎么可能被处死”“冯大人是个好官呐，是这世上少有的好官了。”等等表达对冯焕的赞美，一句一句说，大概说个四五句，每一句声线不同。快到了的时候，声音消失，二人继续对话。）' },
    ],
  },

  {
    type: 'scene', id: 'final-walk', bg: 'bg-tomb', dark: true, light: 'torch',
    chars: [{ id: 'fenghuan', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '回忆之声', text: '要不是冯大人，杀我儿的祸害怎么可能被处死' },
      { cls: 'narration', name: '回忆之声', text: '冯大人是个好官呐，是这世上少有的好官了。' },
      { cls: 'narration', name: '回忆之声', text: '多亏了冯使君，咱们家才能要回那几亩田呐。' },
      { cls: 'narration', name: '回忆之声', text: '冯大人这样为百姓的好官，往后怕是再难遇到了。' },
      { cls: 'narration', name: '回忆之声', text: '愿冯大人来世安康，不再受苦。' },
      { speaker: 'fenghuan', text: '你是怎么来到我这儿的？' },
      { speaker: 'tourist', text: '不知道，也许是睡了一觉，也许是买了包火柴？' },
      { speaker: 'fenghuan', text: '......那你可要留好那包火柴。' },
      { speaker: 'tourist', text: '什么意思？' },
      { speaker: 'fenghuan', label: '冯焕（笑）', text: '也许只是因为，火比较温暖呢。' },
      { speaker: 'tourist', text: '最好是吧。' },
      { cls: 'narration', name: '旁白', text: '（最终走到阙前，发现一些石块散落在地上，双阙中间有一道紧闭的“门”，似乎需要机关开启，此时游戏指引写出“拼凑冯焕生前信息，助他引渡”）' },
      { cls: 'narration', name: '旁白', text: '（引导玩家点击信息册，查看信息并拼凑）' },
      { cls: 'narration', name: '旁白', text: '（二十个铭文字块散落在画面下方。游览模式按“故尚书侍郎／河南京令／豫州幽州刺史／冯使君神道”四组拼合；探案模式拆为十组二字词块，每拼对一组便固定在阙身，拼好后，两阙中间的门消失，游客想往前走，发现走不了。）' },
    ],
  },

  {
    type: 'inscription',
    hint: '拼凑冯焕生前信息，助他引渡',
    groups: ['故尚书侍郎', '河南京令', '豫州幽州刺史', '冯使君神道'],
    pairs: ['故尚', '书侍', '郎河', '南京', '令豫', '州幽', '州刺', '史冯', '使君', '神道'],
  },

  {
    type: 'scene', id: 'final-que', bg: 'bg-shuangque',
    chars: [{ id: 'fenghuan', slot: 'center', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', text: '后面的路，得需要您自己走了，我过不去。' },
      { speaker: 'fenghuan', text: '谢小友今日送我一程，改日再会。' },
      { speaker: 'tourist', text: '......还是相见不如多怀念吧。' },
    ],
  },

  /* ================= 尾声 · 罗浮梦 ================= */
  { type: 'intertitle', title: '尾声', sub: '罗浮梦', hint: '' },

  {
    type: 'scene', id: 'epi-white', bg: 'bg-shuangque',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（随着冯焕走远，画面从双阙中间发出强烈白光，最终覆盖一切后转换画面。画面转到车上，司机正在玩家面前）' },
    ],
  },

  { type: 'transition', effect: 'flash', asset: 'fx-white', text: '' },

  {
    type: 'scene', id: 'epi-bus', bg: 'bg-bus',
    chars: [{ id: 'driver', slot: 'left', asset: 'char-driver' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'driver', text: '欸，（小姑娘/小伙子），你怎么睡着了？' },
      { speaker: 'driver', text: '怎么还哭了呀？' },
      { speaker: 'driver', text: '做噩梦啦？' },
      { cls: 'thought', name: '游客', text: '（内心想法：嗯...？我这是回来了？我是睡着了吗？）' },
      { speaker: 'tourist', text: '师傅，这是到哪了？' },
      { speaker: 'driver', text: '看那块文保碑嘛，这不写着“冯焕阙”？' },
      { speaker: 'driver', text: '已经到啦，快下车去看看吧。' },
      { speaker: 'driver', text: '怎么还哭了呀？' },
      { speaker: 'driver', text: '做噩梦啦？' },
      { speaker: 'tourist', text: '谢谢您，我这就下去，不是做噩梦了，也许......只是太困了吧。' },
      { cls: 'narration', name: '旁白', text: '（画面变化，来到阙前）' },
    ],
  },

  { type: 'transition', effect: 'fade', text: '' },

  {
    type: 'scene', id: 'epi-que', bg: 'bg-que-today',
    chars: [{ id: 'guide', slot: 'left', asset: 'char-guide' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'guide', text: '阙常成对立在建筑或神道前。冯焕阙原有双阙，如今仅存东阙主阙部分，正面的二十字铭文还留着墓主身份......' },
      { speaker: 'tourist', text: '终究是一场虚幻。' },
      { speaker: 'tourist', text: '冯使君，我们又见面了。' },
    ],
  },

  {
    type: 'credits',
    lines: [
      '“江山留胜迹，我辈复登临。”',
      '你循着旧物留下的记忆，认识了冯焕，也渡他放下了过往，走向新生。',
      '千年飞逝，铜驼夜悲。然花开无尽，人间生生不息，等待总能听见回音。阙上的铭文总能与新的后来者相视——今日你读到了他的名字，他便不只留在过去，也随你走进了此刻。',
      '感谢参观。冯焕阙的故事讲完了，然史书几字寥寥，人间多少兴衰。渠县汉阙中还有许多沉默的往事，等待与你相逢。',
      '拾阙人 敬上',
    ],
  },

  /* --- 结算：渠县汉阙导览地图 --- */
  { type: 'ending' },
];

/* 结局结算：渠县汉阙导览地图数据 */
const ENDING_MAP = [
  { name: '冯焕阙', lit: true },
  { name: '沈府君阙', note: '“府君虽去，英姿如故。”' },
  { name: '蒲家湾无铭阙', note: '“仙人骑鹿逍遥，朱雀展翅得道。”' },
  { name: '王家坪无铭阙', note: '“以生事死，求阴阳无异。”' },
  { name: '赵家村东、西无铭阙', note: '“东西异处，其思何如？”' },
];

