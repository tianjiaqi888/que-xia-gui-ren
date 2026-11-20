/* ============================================================
 * 《阙下归人》· 声音映射（数据层，不含播放实现）
 *  - 场景 -> 环境声；剧情段落 -> 录制纯音乐
 *  - 环境声合成配方与本地 CC BY 4.0 配乐来源
 *  - 终幕按剧情与当前对白选择乐段
 * 播放、淡入淡出、阅读降噪与暂停由 audio.js / music.js 负责。
 * ============================================================ */
'use strict';

const AUDIO_MAP = {
  version: 2,

  /* 场景匹配按顺序取第一个命中项。key 是 <div id="stage" data-scene>。 */
  /* 章节给出默认配乐，score() 负责情绪段落；场景表只管理环境声。 */
  chapters: {
    '序幕': 'mystery', '第一幕': 'campaign', '第二幕': 'integrity',
    '第三幕': 'humanity', '第四幕': 'injustice', '第五幕': 'mourning',
    '终幕': 'reunion', '尾声': 'home',
  },

  scenes: [
    { m: /^bg-title$/, amb: ['wind-far'] },
    { m: /^bg-street$/, amb: ['street-morning'] },
    { m: /^bg-bus$/, amb: [] },
    { m: /^bg-tomb$|^bg-stone$|^bg-pottery-close$|^bg-zhujian$/, amb: ['tomb'] },
    { m: /^bg-tomb-phoenix|^bg-phoenix-turn/, amb: ['tomb'] },
    { m: /^bg-camp$/, amb: ['camp'] },
    { m: /^bg-tent$/, amb: ['tent'] },
    { m: /^bg-feast$/, amb: ['feast'] },
    { m: /^bg-(censer|fenghuan|shufang|proclaim)/, amb: ['office'] },
    { m: /^bg-yuewu$/, amb: ['stone-hall'] },
    { m: /^bg-fair/, amb: ['fair-crowd'] },
    { m: /^bg-(river|tower|wine-table)/, amb: ['river'] },
    { m: /^bg-prison$/, amb: ['prison'] },
    { m: /^bg-coffin/, amb: ['coffin'] },
    { m: /^bg-funeral$/, amb: ['funeral'] },
    { m: /^bg-teashop/, amb: ['teashop'] },
    { m: /^bg-(que-built|shuangque|que-today)/, amb: ['wind-far'] },
  ],

  /* ---------- 环境声配方（24s 循环，离线合成一遍后循环播放） ----------
   * noise: 白噪声 -> 单极低通(lp) -> 单极高通(hp)，am 为慢速幅度调制
   * tones: 持续正弦，am 让音高/音量缓慢呼吸
   * pulses: 稀疏事件（水滴/钟/鼓/鸟/金属），[kind,minGap,maxGap,level]
   * 所有参数只影响听感，不参与玩法判定。
   */
  ambience: {
    'wind-far': { level: .5, noise: { level: .55, lp: 900, hp: 60, am: [.05, .55] }, pulses: [['wind-gust', 9, 20, .35]] },
    'street-morning': { level: .45, noise: { level: .3, lp: 1400, hp: 90, am: [.11, .3] }, pulses: [['bird', 5, 13, .18], ['passby', 14, 26, .5], ['bird', 17, 30, .12]] },
    tomb: { level: .55, noise: { level: .22, lp: 260, hp: 30, am: [.04, .4] }, pulses: [['drip', 7, 19, .5]] },
    camp: { level: .5, noise: { level: .35, lp: 700, hp: 70, am: [.08, .45] }, pulses: [['drum-far', 8, 18, .25], ['night-bug', 3, 9, .12]] },
    tent: { level: .4, noise: { level: .2, lp: 500, hp: 50, am: [.09, .4] }, pulses: [['ember', 3, 8, .1]] },
    feast: { level: .4, noise: { level: .3, lp: 1100, hp: 100, am: [.2, .35] }, pulses: [['cup-far', 2, 6, .2]] },
    office: { level: .35, noise: { level: .14, lp: 700, hp: 50, am: [.05, .35] }, pulses: [['wood', 15, 30, .12]] },
    'stone-hall': { level: .45, noise: { level: .2, lp: 420, hp: 40, am: [.03, .35] }, pulses: [['drip', 12, 26, .2]] },
    'fair-crowd': { level: .5, noise: { level: .42, lp: 1500, hp: 120, am: [.23, .3] }, pulses: [['clink', 6, 14, .12]] },
    river: { level: .45, noise: { level: .45, lp: 800, hp: 80, am: [.18, .3] }, pulses: [['water-bubble', 2, 6, .15], ['water-bubble', 8, 15, .1]] },
    prison: { level: .5, noise: { level: .15, lp: 300, hp: 35, am: [.03, .3] }, pulses: [['chain', 12, 26, .2], ['drip', 9, 20, .3]] },
    coffin: { level: .4, noise: { level: .12, lp: 380, hp: 40, am: [.04, .3] }, pulses: [['candle', 4, 9, .08]] },
    funeral: { level: .45, noise: { level: .26, lp: 900, hp: 90, am: [.1, .3] }, pulses: [['footfall', 1.2, 2.6, .18]] },
    teashop: { level: .4, noise: { level: .28, lp: 1200, hp: 120, am: [.16, .3] }, pulses: [['clink', 3, 8, .18]] },
  },

  /* 本地纯音乐；正文、片尾与来源清单均保留作者署名。 */
  music: {
    memory: { title: 'Memories Of Stone', author: 'Scott Buckley', file: 'assets/music/memories-of-stone.mp3', source: 'https://www.scottbuckley.com.au/library/memories-of-stone/', gain: .8, loopEnd: 325 },
    mystery: { title: 'Darkest Child', author: 'Kevin MacLeod', file: 'assets/music/darkest-child.mp3', source: 'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100783', gain: .75 },
    campaign: { title: 'Legionnaire (Original)', author: 'Scott Buckley', file: 'assets/music/legionnaire.mp3', source: 'https://www.scottbuckley.com.au/library/legionnaire/', gain: .68, loopEnd: 177 },
    integrity: { title: 'Eastern Thought', author: 'Kevin MacLeod', file: 'assets/music/eastern-thought.mp3', source: 'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100682', gain: .82 },
    humanity: { title: 'Ishikari Lore', author: 'Kevin MacLeod', file: 'assets/music/ishikari-lore.mp3', source: 'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100192', gain: .88 },
    injustice: { title: 'Undertow', author: 'Scott Buckley', file: 'assets/music/undertow.mp3', source: 'https://www.scottbuckley.com.au/library/undertow/', gain: .85 },
    mourning: { title: 'In This Moment', author: 'Scott Buckley', file: 'assets/music/in-this-moment.mp3', source: 'https://www.scottbuckley.com.au/library/in-this-moment/', gain: .92, loopEnd: 190, fadeIn: 5 },
    reunion: { title: 'Ascension', author: 'Scott Buckley', file: 'assets/music/ascension.mp3', source: 'https://www.scottbuckley.com.au/library/ascension/', gain: .9,
      cues: {
        recollection: { start: 0, loopStart: 8, loopEnd: 96, gain: .72 },
        recognition: { start: 96, loopStart: 100, loopEnd: 192, gain: .82, fadeIn: 4 },
        reassurance: { start: 240, loopStart: 330, loopEnd: 360, gain: 1, fadeIn: 4 },
        farewell: { start: 272, loopStart: 330, loopEnd: 360, gain: 1, fadeIn: 4 },
      },
    },
    home: { title: 'Reawakening', author: 'Scott Buckley', file: 'assets/music/reawakening.mp3', source: 'https://www.scottbuckley.com.au/library/reawakening/', gain: .88, fadeIn: 5 },
  },

  // Priority: emotional story beat > local tension > chapter. The same tomb has different meanings later.
  score({ chapter, node, scene, line = 0, previous = null }) {
    const id = node?.id || '';
    if ((node?.title === '尾声' || id === 'epi-white') && previous?.theme === 'reunion')
      return { theme: 'reunion', cue: previous.cue || 'farewell' };
    if (chapter === 'reunion') {
      if (id === 'final-que') return { theme: 'reunion', cue: 'farewell' };
      if (id === 'final-walk' || node?.type === 'inscription') return { theme: 'reunion', cue: 'reassurance' };
      if (id === 'final-shuangque') return { theme: 'reunion', cue: line >= 11 ? 'reassurance' : 'recognition' };
      return { theme: 'reunion', cue: 'recollection' };
    }
    if (node?.type === 'intertitle') return { theme: chapter };
    if (chapter === 'home') return { theme: 'home' };
    if (/^bg-(street|bus)$/.test(scene)) return { theme: null };
    if (chapter === 'integrity' && /^bg-(tomb-phoenix|phoenix-turn)/.test(scene)) return { theme: 'mystery' };
    return { theme: chapter || 'mystery' };
  },
};
