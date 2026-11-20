/* ============================================================
 * 《阙下归人》· 场景声音引擎（无人物朗读）
 *  - 界面音 / 操作音效 / 环境声 / 背景音乐
 *  - ui 图（界面、试听）与 world 图（剧情、场景）分离
 *  - 阅读态：音乐/环境声降低；切后台：整体挂起
 *  - 程序化音效、环境声与本地授权配乐，无在线合成请求
 * ============================================================ */

const AudioFX = (() => {
  const defaults = { master: .7, effects: .6, ambience: .3, music: .65 };
  const settings = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem('qxgr_audio_v2') || localStorage.getItem('qxgr_audio_v1') || '{}');
    // 旧版原始默认值迁移到新混音；保留玩家亲自调过的数值和静音选择。
    if (!localStorage.getItem('qxgr_audio_v2')) for (const [k, v] of Object.entries({effects:.75, ambience:.5, music:.45})) if (saved[k] === v) saved[k] = defaults[k];
    for (const k of Object.keys(defaults)) if (Number.isFinite(saved[k])) settings[k] = Math.max(0, Math.min(1, saved[k]));
  } catch (_) {}
  let muted = (() => { try { return localStorage.getItem('qxgr_muted') === '1'; } catch (_) { return false; } })();

  let ctx = null, master = null;
  const graphs = {};
  const loops = new Map();      // 场景内循环（fire/fan/match-rub/...）
  const beds = new Map();       // 环境声底床
  const sources = new Set();    // 一次性音源
  const recent = [];
  const textures = new Set();
  const foreground = new Map();
  let echoHandle = null;
  let unlocked = false, hiddenPaused = false, modalPaused = false;
  let scene = '', sceneKey = null, lastClick = 0, lastFriction = 0;
  let chapterTheme = 'mystery';
  let busAmbience = null;
  let uiTrim = null;
  const ducks = { modal: 0, reading: 0, focus: 0, quiet: 0, cue: 0, death: 0 };
  let timer = null;

  const record = (name, channel = 'effects') => { recent.push({ name, channel }); if (recent.length > 40) recent.shift(); };

  function ramp(param, value, c, time = .025) {
    try { param.cancelScheduledValues(c.currentTime); param.setTargetAtTime(value, c.currentTime, time); } catch (_) {}
  }

  function graph(kind) {
    if (graphs[kind]) return graphs[kind];
    if (!unlocked) return null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      const c = new AC();
      const out = c.createGain();
      const limit = c.createDynamicsCompressor();
      limit.threshold.value = -6; limit.knee.value = 10; limit.ratio.value = 2.5;
      out.connect(limit).connect(c.destination);
      const buses = {}, duckNodes = {};
      for (const channel of ['effects', 'ambience', 'music']) {
        buses[channel] = c.createGain();
        if (channel === 'ambience' || channel === 'music') {
          duckNodes[channel] = c.createGain();
          buses[channel].connect(duckNodes[channel]).connect(out);
        } else {
          buses[channel].connect(out);
        }
        buses[channel].gain.value = settings[channel];
      }
      out.gain.value = muted ? 0 : settings.master;
      return (graphs[kind] = { c, out, buses, ducks: duckNodes, trim: null });
    } catch (_) { return null; }
  }

  function busNode(channel, preview = false) {
    const kind = (preview || channel === 'ui') ? 'ui' : 'world';
    const g = graphs[kind] || graphs.world;
    if (!g) return null;
    return g.buses[channel === 'ui' ? 'effects' : channel] || g.buses.effects;
  }

  function ensure(channel = 'effects', preview = false) {
    const kind = (preview || channel === 'ui') ? 'ui' : 'world';
    const g = graph(kind);
    if (!g) return null;
    if (kind === 'world') { ctx = g.c; master = g.buses.effects; }
    if (g.c.state === 'suspended' && !hiddenPaused) g.c.resume().catch(() => {});
    return g.c;
  }

  function saveSettings() {
    try { localStorage.setItem('qxgr_audio_v2', JSON.stringify(settings)); localStorage.setItem('qxgr_muted', muted ? '1' : '0'); } catch (_) {}
    for (const g of Object.values(graphs)) {
      ramp(g.out.gain, muted ? 0 : settings.master, g.c);
      for (const k of Object.keys(defaults).filter((k) => k !== 'master')) ramp(g.buses[k].gain, settings[k], g.c);
    }
    applyDuck();
    const b = document.getElementById('mute-btn');
    if (b) { b.textContent = muted ? '🔇' : '🔊'; b.setAttribute('aria-label', muted ? '声音设置，当前已静音' : '声音设置'); }
    const m = document.getElementById('audio-master-mute');
    if (m) { m.textContent = muted ? '开启声音' : '全部静音'; m.setAttribute('aria-pressed', String(muted)); }
  }

  function applyDuck() {
    const musicDb = Math.min(ducks.modal, ducks.reading, ducks.focus, ducks.quiet, ducks.cue, ducks.death);
    const ambDb = Math.min(ducks.modal, ducks.focus, ducks.reading, ducks.cue ? -8 : 0, ducks.death);
    for (const g of Object.values(graphs)) {
      if (!g.ducks) continue;
      ramp(g.ducks.music.gain, Math.pow(10, musicDb / 20), g.c, ducks.death || ducks.cue ? .035 : ducks.quiet ? .6 : .45);
      ramp(g.ducks.ambience.gain, Math.pow(10, ambDb / 20), g.c, .15);
    }
  }

  function focusCue(token, kind, active) {
    if (active) foreground.set(token, kind.startsWith('echo-') || ['horse','wheel','blade'].includes(kind) ? -22 : kind === 'phoenix' ? -18 : -16);
    else foreground.delete(token);
    ducks.cue = Math.min(0, ...foreground.values());
    applyDuck();
  }

  /* ---------------- 场景环境声 ---------------- */

  const SR = 22050;
  function seedRandom(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function addPulse(out, sr, at, kind, level) {
    const len = out.length;
    const start = Math.floor(at * sr);
    const put = (i, v) => { if (i >= 0 && i < len) out[i] += v; };
    if (kind === 'drum-far' || kind === 'stage-drum') {
      const dur = kind === 'stage-drum' ? .7 : .55;
      for (let i = 0; i < dur * sr; i++) { const t = i / sr; put(start + i, Math.sin(2 * Math.PI * (kind === 'stage-drum' ? 68 : 52) * t) * level * Math.exp(-t * 5)); }
    } else if (kind === 'drip') {
      for (let i = 0; i < .25 * sr; i++) { const t = i / sr; put(start + i, (Math.sin(2 * Math.PI * (1500 - t * 900) * t) * .7 + Math.sin(2 * Math.PI * 2300 * t) * .2) * level * Math.exp(-t * 18)); }
    } else if (kind === 'bird') {
      for (let i = 0; i < .2 * sr; i++) { const t = i / sr; put(start + i, Math.sin(2 * Math.PI * (2700 + 700 * Math.sin(t * 18)) * t) * level * Math.exp(-t * 12)); }
    } else if (kind === 'water-bubble') {
      for (let i = 0; i < .18 * sr; i++) { const t = i / sr; put(start + i, Math.sin(2 * Math.PI * (520 + t * 1400) * t) * level * Math.exp(-t * 14)); }
    } else if (kind === 'cup-far' || kind === 'clink' || kind === 'metal-far' || kind === 'chain' || kind === 'bell-sparse' || kind === 'stage-bell') {
      const f = { 'cup-far': 1800, clink: 2600, 'metal-far': 1100, chain: 900, 'bell-sparse': 520, 'stage-bell': 1046 }[kind];
      const dur = kind === 'bell-sparse' ? 3 : kind === 'stage-bell' ? 1.8 : .7;
      for (let i = 0; i < dur * sr; i++) { const t = i / sr; put(start + i, (Math.sin(2 * Math.PI * f * t) + .4 * Math.sin(2 * Math.PI * f * 2.01 * t)) * level * Math.exp(-t * (kind === 'bell-sparse' ? 1.6 : 4))); }
    } else if (kind === 'crowd') {
      for (let i = 0; i < .9 * sr; i++) { const t = i / sr; const v = Math.sin(2 * Math.PI * 320 * t) * .4 + Math.sin(2 * Math.PI * 470 * t) * .3; put(start + i, v * level * Math.exp(-t * 3.2) * (0.6 + .4 * Math.sin(t * 40))); }
    } else if (kind === 'paper' || kind === 'ember' || kind === 'candle' || kind === 'stone-creak') {
      const rnd = seedRandom(start + kind.length);
      for (let i = 0; i < (kind === 'stone-creak' ? .6 : .18) * sr; i++) { put(start + i, (rnd() * 2 - 1) * level * Math.exp(-i / sr * 10)); }
    } else if (kind === 'night-bug') {
      for (let i = 0; i < .16 * sr; i++) { const t = i / sr; put(start + i, Math.sin(2 * Math.PI * 3600 * t) * level * (.5 + .5 * Math.sin(t * 90)) * Math.exp(-t * 9)); }
    } else if (kind === 'footfall') {
      for (let i = 0; i < .22 * sr; i++) { const t = i / sr; put(start + i, Math.sin(2 * Math.PI * 90 * t) * level * Math.exp(-t * 14)); }
    } else if (kind === 'passby') {
      const dur = 2.2;
      for (let i = 0; i < dur * sr; i++) { const t = i / sr; const env = Math.sin(Math.PI * Math.min(1, t / dur)); put(start + i, (Math.random() * 2 - 1) * level * .12 * env); }
    } else if (kind === 'wind-gust') {
      const dur = 3;
      for (let i = 0; i < dur * sr; i++) { const t = i / sr; const env = Math.sin(Math.PI * Math.min(1, t / dur)); put(start + i, (Math.random() * 2 - 1) * level * .05 * env); }
    } else {
      for (let i = 0; i < .2 * sr; i++) { put(start + i, (Math.random() * 2 - 1) * level * .15 * Math.exp(-i / sr * 9)); }
    }
  }

  function renderBed(name) {
    const rec = AUDIO_MAP.ambience[name];
    if (!rec) return null;
    const len = Math.floor(SR * 24);
    const out = new Float32Array(len);
    const rnd = seedRandom(name.length * 131 + name.charCodeAt(1) * 977);
    const n = rec.noise;
    if (n) {
      let lp = 0, hp = 0, prev = 0;
      const lpA = 1 - Math.exp(-2 * Math.PI * (n.lp || 800) / SR);
      const hpA = Math.exp(-2 * Math.PI * (n.hp || 60) / SR);
      const amRate = n.am ? n.am[0] : 0, amDepth = n.am ? n.am[1] : 0;
      for (let s = 0; s < len; s++) {
        const white = rnd() * 2 - 1;
        lp += lpA * (white - lp);
        hp = hpA * hp;
        const t = s / SR;
        const am = 1 - amDepth * (0.5 + 0.5 * Math.sin(2 * Math.PI * amRate * t));
        out[s] += (lp - hp) * (n.level || .3) * am;
      }
    }
    for (const tone of rec.tones || []) {
      const amRate = tone.am ? tone.am[0] : 0, amDepth = tone.am ? tone.am[1] : 0;
      for (let s = 0; s < len; s++) {
        const t = s / SR;
        out[s] += Math.sin(2 * Math.PI * tone.f * t) * tone.level * (1 - amDepth * (0.5 + 0.5 * Math.sin(2 * Math.PI * (amRate || .02) * t)));
      }
    }
    for (const [kind, minGap, maxGap, level] of rec.pulses || []) {
      let t = rnd() * 2;
      while (t < 23.5) { addPulse(out, SR, t, kind, level); t += minGap + rnd() * (maxGap - minGap); }
    }
    let peak = 0;
    for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(out[i]));
    // 只限制峰值，不把微弱风声、底噪强行放大成与鼓声一样响。
    const norm = peak > .5 ? .5 / peak : 1;
    const fade = Math.floor(SR * 1.2);
    for (let i = 0; i < len; i++) out[i] *= norm;
    for (let i = 0; i < fade; i++) { const w = i / fade; out[i] = out[i] * w + out[len - fade + i] * (1 - w); }
    const c = toolsCtx();
    if (!c) return null;
    const buffer = c.createBuffer(1, len, SR);
    buffer.getChannelData(0).set(out);
    return buffer;
  }

  const bedCache = new Map();
  function toolsCtx() { return (graphs.world || {}).c || (graphs.ui || {}).c || ctx || null; }

  function startBed(name) {
    const c = toolsCtx();
    if (!c || beds.has(name)) return;
    let buffer = bedCache.get(name);
    if (!buffer) { buffer = renderBed(name); if (!buffer) return; bedCache.set(name, buffer); if (bedCache.size > 8) bedCache.delete(bedCache.keys().next().value); }
    const src = c.createBufferSource();
    const gain = c.createGain();
    const pan = c.createStereoPanner();
    const rec = AUDIO_MAP.ambience[name] || {};
    pan.pan.value = rec.pan || 0;
    src.buffer = buffer; src.loop = true;
    gain.gain.value = 0;
    src.connect(gain).connect(pan).connect(busNode('ambience'));
    src.start();
    ramp(gain.gain, (rec.level || .5) * .5, c, .8);
    beds.set(name, { src, gain, pan });
  }

  function stopBed(name, fade = 2) {
    const bed = beds.get(name);
    if (!bed || !toolsCtx()) return;
    beds.delete(name);
    const c = toolsCtx();
    try {
      ramp(bed.gain.gain, 0, c, fade / 3);
      setTimeout(() => { try { bed.src.stop(); bed.src.disconnect(); bed.gain.disconnect(); bed.pan.disconnect(); } catch (_) {} }, fade * 1000 + 80);
    } catch (_) {}
  }

  function applyBeds(names) {
    for (const key of [...beds.keys()]) if (!names.includes(key)) stopBed(key);
    for (const name of names) startBed(name);
  }

  /* ---------------- 场景与音乐 ---------------- */

  function sceneConfig(key) {
    if (!key) return null;
    for (const s of AUDIO_MAP.scenes) if (s.m.test(key)) return s;
    return null;
  }

  function stopActionLoops() { for (const k of [...loops.keys()]) stopLoop(k); }

  function chapterOfCurrent() {
    if (typeof Engine === 'undefined' || !Number.isInteger(Engine.currentIndex) || typeof SCRIPT === 'undefined') return chapterTheme;
    let title = '序幕';
    for (let i = 0; i <= Engine.currentIndex; i++) if (SCRIPT[i] && SCRIPT[i].type === 'intertitle') title = SCRIPT[i].title;
    return (AUDIO_MAP.chapters && AUDIO_MAP.chapters[title]) || chapterTheme;
  }

  function chapterMusic(title) {
    const theme = AUDIO_MAP.chapters && AUDIO_MAP.chapters[title];
    if (!theme) return;
    chapterTheme = theme;
    routeMusic(scene);
  }

  function routeMusic(key) {
    if (typeof Music === 'undefined') return;
    if (!Engine.mode) { if (key === 'bg-title') Music.play('memory'); return; }
    const score = AUDIO_MAP.score({ chapter: chapterOfCurrent(), node: Engine.currentNode,
      scene: key, line: Engine._audioLineNode === Engine.currentNode ? Engine._audioLineIndex : 0,
      previous: Music.inspect() });
    Music.setScene(score.theme, score.cue || '');
  }

  function setScene(key, force = false) {
    if (!force && key === sceneKey) return;
    for (const h of [...textures]) h.stop();
    sceneKey = key;
    const cfg = sceneConfig(key);
    const names = (cfg && cfg.amb ? cfg.amb : []).concat(cfg && cfg.extra ? cfg.extra : []);
    applyBeds(names);
    routeMusic(key);
    // 场景切换由配乐淡入承接，避免与幕间钟声重复叠加。
  }

  /* ---------------- 一次性合成音 ---------------- */

  function tone(freq, dur, type, vol, slideTo, delay, channel = 'effects', preview = false) {
    const c = ensure(channel, preview); if (!c || muted || (hiddenPaused && !preview)) return;
    try {
      const t0 = c.currentTime + (delay || 0);
      const osc = c.createOscillator(), g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(busNode(channel, preview));
      const entry = { node: osc, kind: preview ? 'ui' : 'world' }; sources.add(entry);
      osc.addEventListener('ended', () => { sources.delete(entry); try { osc.disconnect(); } catch (_) {} }, { once: true });
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    } catch (_) {}
  }

  function noise(dur, vol, filterFreq, delay, channel = 'effects', preview = false, type = 'lowpass') {
    const c = ensure(channel, preview); if (!c || muted || (hiddenPaused && !preview)) return;
    try {
      const t0 = c.currentTime + (delay || 0);
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = filterFreq || 1200;
      const g = c.createGain(); g.gain.value = vol || 0.2;
      src.connect(f); f.connect(g); g.connect(busNode(channel, preview));
      const entry = { node: src, kind: preview ? 'ui' : 'world' }; sources.add(entry);
      src.addEventListener('ended', () => { sources.delete(entry); try { src.disconnect(); } catch (_) {} }, { once: true });
      src.start(t0);
    } catch (_) {}
  }

  function loopNoise(key, active, level, cutoff, channel = 'effects', pan = 0) {
    if (!active || !unlocked || hiddenPaused) { stopLoop(key); return; }
    const c = ensure(channel); if (!c) return;
    const old = loops.get(key);
    if (old) {
      ramp(old.gain.gain, level, c);
      if (old.filter) ramp(old.filter.frequency, cutoff || 900, c);
      if (old.panner) ramp(old.panner.pan, pan, c);
      return;
    }
    const data = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const a = data.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < a.length; i++) { previous = (previous + Math.random() * .12 - .06) / 1.02; a[i] = previous * .7; }
    const node = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain(), panner = c.createStereoPanner();
    node.buffer = data; node.loop = true; filter.type = 'lowpass'; filter.frequency.value = cutoff || 900;
    panner.pan.value = pan; gain.gain.value = 0;
    node.connect(filter).connect(gain).connect(panner).connect(busNode(channel));
    node.start();
    ramp(gain.gain, level, c);
    loops.set(key, { node, filter, gain, panner });
  }

  function stopLoop(key) {
    const v = loops.get(key); if (!v) return;
    loops.delete(key);
    try { v.node.stop(); v.node.disconnect(); v.gain.disconnect(); if (v.panner) v.panner.disconnect(); } catch (_) {}
  }

  function stopWorld() {
    sceneKey = null;
    api.busStop();
    for (const k of [...loops.keys()]) stopLoop(k);
    for (const name of [...beds.keys()]) stopBed(name, .3);
    for (const entry of [...sources]) if (entry.kind === 'world') { try { entry.node.stop(); } catch (_) {} sources.delete(entry); }
    for (const handle of [...textures]) handle.stop();
    if (typeof Music !== 'undefined') Music.stop(1);
    busAmbience = null;
  }

  // 具象短音：蹄击、木轮、金属、鸟鸣与鼓点。一个聆听点一次只播放一组。
  function texture(kind, pan = 0, level = 1) {
    const fatal = kind === 'death', c = ensure('effects', fatal);
    if (!c || muted || hiddenPaused || document.hidden || (!fatal && (modalPaused || (typeof Engine !== 'undefined' && Engine.isReadingModal())))) return { stop() {} };
    record(fatal ? 'death' : kind.startsWith('echo-') ? 'direction-' + kind : 'stone-echo-' + kind);
    const duration = fatal ? 2.8 : kind === 'phoenix' ? 1.8 : kind === 'drum' ? .85 : 3.1;
    const samples = new Float32Array(Math.ceil(SR * duration));
    const rnd = seedRandom(437 + kind.length * 71);
    const hit = (at, freq, decay, amp, grit = .2) => {
      const start = Math.floor(at * SR);
      for (let i = 0; i < decay * 7 * SR && start + i < samples.length; i++) {
        const t = i / SR, attack = Math.min(1, t / .003);
        const ring = Math.sin(2 * Math.PI * freq * t) + .28 * Math.sin(2 * Math.PI * freq * 2.73 * t);
        samples[start + i] += attack * amp * (ring * Math.exp(-t / decay) + (rnd()*2-1) * grit * Math.exp(-t / .018));
      }
    };
    if (fatal) {
      // 三组逐渐放慢的心跳，最后只剩低沉的气息；不叠普通扣血提示音。
      for (const [at,amp] of [[0,.30],[.16,.16],[.70,.22],[.90,.12],[1.70,.13],[1.96,.06]]) {
        hit(at,84,.09,amp,.15); hit(at,252,.04,amp*.25,.3);
      }
      let phase = 0, breath = 0;
      for (let i=0;i<samples.length;i++) {
        const t=i/SR, env=Math.sin(Math.PI*t/duration)**2;
        phase += 2*Math.PI*(105-65*t/duration)/SR;
        breath += .025*((rnd()*2-1)-breath);
        samples[i] += env*(.045*Math.sin(phase)+.075*breath);
      }
    } else if (kind.startsWith('echo-')) {
      const near = kind === 'echo-near';
      hit(0, 243, .075, near ? .28 : .10, .6);
      for (let i = 1; i <= 5; i++) hit(i * (near ? .16 : .28), 243, .10 + i * .025, (near ? .055 : .10) * Math.pow(.65, i-1), .12);
    } else if (kind === 'horse') {
      for (let stride = 0; stride < 4; stride++) {
        const at = stride * .64;
        for (const [d,f,a] of [[0,165,.23],[.10,210,.17],[.22,138,.25],[.37,190,.15]]) hit(at+d,f,.035,a,1.5);
      }
    } else if (kind === 'blade') {
      for (const at of [0,.68,1.42]) {
        for (const f of [1240,1973,3011]) hit(at,f,.19,.065,.7);
        hit(at+.19,85,.065,.12,.8);
      }
    } else if (kind === 'wheel') {
      let low = 0;
      for (let i = 0; i < samples.length; i++) {
        const t = i / SR, envelope = Math.sin(Math.PI * t / duration);
        low += .08 * ((rnd()*2-1) - low);
        samples[i] = envelope * (.12 * low * (1+.5*Math.sin(t*23)) + .026 * Math.sin(2*Math.PI*258*t+8*Math.sin(t*2.5)) * Math.sin(t*7)**6);
      }
      for (const at of [0,.48,.97,1.46,1.95,2.44]) hit(at,92,.045,.12,1);
    } else if (kind === 'phoenix') {
      let phase = 0, breath = 0;
      for (let i = 0; i < samples.length; i++) {
        const t = i / SR, f = 850 - 470*t/duration + 44*Math.sin(t*39);
        phase += 2*Math.PI*f/SR;
        breath += .35 * ((rnd()*2-1) - breath);
        const env = Math.sin(Math.PI*t/duration)**1.5 * (.65+.35*Math.sin(t*69));
        samples[i] = env * (.12*Math.sin(phase) + .045*Math.sin(phase*2) + .12*breath);
      }
    } else if (kind === 'performance' || kind === 'drum') {
      const pattern = kind === 'drum' ? [[0,.28]] : [[0,.28],[.48,.16],[.72,.16],[.96,.25],[1.44,.16],[1.68,.16],[1.92,.28],[2.16,.18],[2.4,.16]];
      for (const [at,amp] of pattern) {
        hit(at,64,.12,amp,.45); hit(at,144,.07,amp*.45,.35); hit(at,285,.028,amp*.28,.9);
      }
    }
    const src = c.createBufferSource(), gain = c.createGain(), panner = c.createStereoPanner();
    const buffer = c.createBuffer(1,samples.length,SR);
    buffer.getChannelData(0).set(samples); src.buffer = buffer;
    gain.gain.value = level * (fatal ? 1 : 1.25); panner.pan.value = Math.max(-1,Math.min(1,pan));
    src.connect(gain).connect(panner).connect(busNode('effects', fatal));
    const entry = { node: src, kind: fatal ? 'death' : 'world' };
    const handle = { kind, at: performance.now(), stop() { try { src.stop(); } catch (_) {} cleanup(); } };
    let cleaned = false;
    const cleanup = () => { if (cleaned) return; cleaned = true; textures.delete(handle); sources.delete(entry); if (!fatal) focusCue(handle, kind, false); src.disconnect(); gain.disconnect(); panner.disconnect(); };
    src.onended = cleanup; textures.add(handle); sources.add(entry);
    if (!fatal) focusCue(handle, kind, true);
    src.start(c.currentTime + .05);
    return handle;
  }

  /* ---------------- 同步与暂停 ---------------- */

  function sync() {
    if (!unlocked) return;
    const hidden = !!document.hidden;
    if (hidden !== hiddenPaused) {
      hiddenPaused = hidden;
      for (const g of Object.values(graphs)) {
        try { hidden ? g.c.suspend() : g.c.resume(); } catch (_) {}
      }
    }
    if (typeof Engine === 'undefined' || !Engine.els || !Engine.els.stage) return;
    const modal = typeof Engine.isReadingModal === 'function' ? !!Engine.isReadingModal() : false;
    if (modal !== modalPaused) {
      modalPaused = modal;
      ducks.modal = modal ? -12 : 0;
      if (modal) { stopLoop('fan'); stopLoop('match-rub'); stopLoop('wine-pour'); stopLoop('brush'); for (const h of [...textures]) h.stop(); }
      applyDuck();
    }
    if (typeof Music !== 'undefined') Music.setPaused(hidden || modal, hidden);
    // 对白显示时音乐让位（不朗读文字，只给阅读留空间）
    const reading = !!(Engine.els.dlg && Engine.els.dlg.classList.contains('show'));
    const dialogueDuck = reading ? -2 : 0;
    if (dialogueDuck !== ducks.reading) {
      ducks.reading = dialogueDuck;
      applyDuck();
    }
    const focus = !!document.querySelector('#minigame-layer[data-encounter-state="listening"],.stone-listening[data-phase="listen"]');
    if (ducks.focus !== (focus ? -10 : 0)) { ducks.focus = focus ? -10 : 0; applyDuck(); }
    const quiet = !!document.querySelector('.coffin-camera.jade-placed');
    if (ducks.quiet !== (quiet ? -60 : 0)) { ducks.quiet = quiet ? -60 : 0; applyDuck(); }
    if (typeof Music !== 'undefined') Music.tick();
    const nowPlaying = document.getElementById('music-now');
    if (nowPlaying && document.getElementById('audio-settings')?.open) {
      const m = Music.inspect();
      const text = m.error ? '配乐暂未载入，仍可继续游玩。' : m.title ? '当前配乐：' + m.title : '此处留给环境声。';
      if (nowPlaying.textContent !== text) nowPlaying.textContent = text;
    }

    if (!Engine.mode) return;
    const key = Engine.els.stage.dataset.scene || '';
    if (key !== scene || sceneKey === null) {
      scene = key;
      stopActionLoops();
      setScene(key);
    }
    routeMusic(key);
    const tomb = /^bg-(tomb|stone|yuewu|pottery-close|zhujian|phoenix)/.test(key);
    const lit = !!Engine._lightLevel;
    loopNoise('fire', lit && (tomb || key === 'bg-stone'), Engine._lightLevel === 'torch' ? .055 : .028, Engine._lightLevel === 'torch' ? 1400 : 900, 'ambience');
    if (lit && loops.has('fire')) {
      const c = toolsCtx();
      if (c) {
        const flick = .85 + .15 * Math.sin(c.currentTime * 6.2) * Math.sin(c.currentTime * 2.7);
        const f = loops.get('fire');
        if (f) ramp(f.gain.gain, (Engine._lightLevel === 'torch' ? .055 : .028) * flick, c, .08);
      }
    }
  }

  let installed = false;
  function install() {
    if (installed) return; installed = true;
    const open = document.getElementById('mute-btn');
    if (open) { open.title = '声音设置'; open.setAttribute('aria-label', '声音设置'); open.onclick = () => api.openSettings(); }
    const dialog = document.createElement('dialog');
    dialog.id = 'audio-settings';
    dialog.setAttribute('aria-labelledby', 'audio-settings-title');
    dialog.innerHTML = '<h2 id="audio-settings-title">声音设置</h2><p>调整到你觉得舒服的音量。各幕使用不同纯音乐，终幕随故事逐步展开。对白只显示文字。</p><div class="audio-levels"></div><p class="audio-later">操作音效包含界面点击、翻页与场景交互声。</p><label class="music-audition-label">试听段落<select id="music-audition" aria-label="试听段落"></select></label><p id="music-now" aria-live="polite"></p><div class="audio-preview"><button data-preview="effects">试听操作音</button><button data-preview="ambience">试听环境声</button><button data-preview="music">试听音乐</button></div><div class="audio-buttons"><button id="audio-master-mute">全部静音</button><button id="audio-settings-close">返回游戏</button></div>';
    document.body.append(dialog);
    const select = dialog.querySelector('#music-audition');
    for (const [label, theme, cue] of [['序曲 · 石上回声','memory',''],['序幕 · 墓室初醒','mystery',''],
      ['第一幕 · 军阵','campaign',''],['第二幕 · 操守','integrity',''],['第三幕 · 人间烟火','humanity',''],
      ['第四幕 · 冤屈','injustice',''],['第五幕 · 最后的礼数','mourning',''],['终幕 · 重拾往事','reunion','recollection'],
      ['终幕 · 我记得你了','reunion','reassurance'],['终幕 · 送你一程','reunion','farewell'],['尾声 · 梦醒','home','']]) {
      const option = document.createElement('option'); option.value = theme + ':' + cue; option.textContent = label; select.append(option);
    }
    select.value = 'home:';
    select.onchange = () => { Music.stopPreview(); };
    const credits = () => {
      const details = document.createElement('details'); details.className = 'music-credits';
      const summary = document.createElement('summary'); summary.textContent = '配乐与鸣谢'; details.append(summary);
      const list = document.createElement('ul');
      for (const rec of Object.values(AUDIO_MAP.music)) {
        const li = document.createElement('li'), link = document.createElement('a');
        link.href = rec.source; link.target = '_blank'; link.rel = 'noopener'; link.textContent = rec.title;
        li.append(link, ' — ' + rec.author + ' · CC BY 4.0'); list.append(li);
      }
      const notice = document.createElement('p'); notice.textContent = '配乐已调整响度与压缩；游戏播放使用分段、循环和淡化。';
      const license = document.createElement('a'); license.href = 'https://creativecommons.org/licenses/by/4.0/';
      license.target = '_blank'; license.rel = 'noopener'; license.textContent = 'Creative Commons Attribution 4.0';
      details.append(list, notice, license); return details;
    };
    dialog.querySelector('.audio-buttons').before(credits());
    document.querySelector('.ending-panel')?.append(credits());

    for (const [k, label] of Object.entries({ master: '总音量', effects: '操作音效', ambience: '环境声', music: '背景音乐' })) {
      const row = document.createElement('label');
      row.innerHTML = '<span>' + label + '</span><input type="range" min="0" max="100" aria-label="' + label + '"><output></output>';
      const input = row.querySelector('input'), out = row.querySelector('output');
      input.value = Math.round(settings[k] * 100); out.value = input.value + '%';
      input.oninput = () => { api.setVolume(k, Number(input.value) / 100); out.value = input.value + '%'; };
      dialog.querySelector('.audio-levels').append(row);
    }
    dialog.querySelector('#audio-settings-close').onclick = () => dialog.close();
    dialog.querySelector('#audio-master-mute').onclick = () => api.toggleMute();
    dialog.addEventListener('close', () => { if (typeof Music !== 'undefined') Music.stopPreview(); sync(); });
    dialog.querySelectorAll('[data-preview]').forEach((b) => { b.onclick = () => api.preview(b.dataset.preview); });
    const reading = Engine.isReadingModal.bind(Engine);
    Engine.isReadingModal = () => dialog.open || reading();
    const bg = Engine.setBg.bind(Engine);
    Engine.setBg = (key) => { bg(key); sync(); };
    let openingBook = false;
    for (const [method, kind] of [['openBook', 'open'], ['closeBook', 'close'], ['switchBookTab', 'page']]) {
      const fn = Engine[method].bind(Engine);
      Engine[method] = (...args) => {
        const before = Engine.els.book.classList.contains('show');
        if (method === 'openBook') openingBook = true;
        let result;
        try { result = fn(...args); } finally { if (method === 'openBook') openingBook = false; }
        if (method === 'switchBookTab' ? before && !openingBook : method === 'openBook' ? !before : before) api.paper(kind);
        sync();
        return result;
      };
    }
    const start = Engine.start.bind(Engine);
    Engine.start = (...args) => { stopWorld(); return start(...args); };
    document.addEventListener('pointerdown', () => api.unlock(), { capture: true });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b && !b.disabled && !b.closest('.censer-camera,.tomb-match-panel') && !['hud-book', 'book-close', 'mute-btn'].includes(b.id)) api.click();
      sync();
    });
    document.addEventListener('keydown', () => queueMicrotask(sync));
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', () => {
      stopWorld();
      for (const g of Object.values(graphs)) { try { g.c.close().catch(() => {}); } catch (_) {} }
      graphs.ui = graphs.world = undefined;
      Object.keys(graphs).forEach((k) => delete graphs[k]);
      if (typeof Music !== 'undefined' && Music.reset) Music.reset();
      ctx = null; master = null; unlocked = false; scene = ''; sceneKey = null; hiddenPaused = false; modalPaused = false;
      loops.clear(); beds.clear(); sources.clear();
    });
    timer = setInterval(sync, 100);
    saveSettings();
  }

  /* ---------------- 对外接口 ---------------- */

  const api = {
    unlock() {
      if (unlocked) { ensure(); if (typeof Music !== 'undefined') Music.unlock(); sync(); return; }
      unlocked = true;
      graph('ui'); graph('world');
      ensure('ui', true); ensure();
      if (typeof Engine !== 'undefined' && !Engine.mode) {
        setScene('bg-title');
      }
      sync();
    },
    refresh() { sync(); },
    sync,
    chapterMusic,
    stopScene: stopWorld,
    ctx() { return toolsCtx(); },
    busNode,
    unlockedState() { return unlocked; },
    toggleMute() { muted = !muted; try { localStorage.setItem('qxgr_muted', muted ? '1' : '0'); } catch (_) {} saveSettings(); return muted; },
    isMuted() { return muted; },
    openSettings() { api.unlock(); const d = document.getElementById('audio-settings'); if (d && !d.open) d.showModal(); sync(); },
    setVolume(channel, value) { if (!Object.hasOwn(settings, channel) || !Number.isFinite(value)) return; settings[channel] = Math.max(0, Math.min(1, value)); saveSettings(); },
    duck(name, db) { ducks[name] = db; applyDuck(); },

    paper(kind = 'page') { record('paper-' + kind, 'ui'); noise(kind === 'open' ? .22 : .12, kind === 'open' ? .045 : .03, kind === 'close' ? 700 : 1700, 0, 'ui'); },
    touchMaterial(kind) {
      record('touch-' + kind);
      if (kind === 'pottery') { tone(420, .16, 'sine', .035, 350); tone(820, .09, 'sine', .012); }
      else if (kind === 'wood') { noise(.11, .045, 650); tone(105, .12, 'sine', .025, 70); }
      else { noise(.15, .035, 480); tone(170, .12, 'sine', .018, 120); }
    },
    friction(amount = 1) {
      if (performance.now() - lastFriction < 80) return;
      lastFriction = performance.now();
      record('match-rub');
      noise(.08, .025 * Math.min(1, amount), 2400);
    },
    spark() { record('match-spark'); noise(.05, .05, 3600); tone(1400, .04, 'square', .012, 700); },
    matchRub(active, progress = 0) { loopNoise('match-rub', active, .008 + .035 * Math.max(0, Math.min(1, progress)), 1200 + 3200 * progress, 'effects'); },
    censer(kind) {
      record('censer-' + kind);
      if (kind === 'lid') { noise(.16, .026, 1900); for (const [f, v] of [[480, .035], [719, .014], [1147, .008]]) tone(f, .45, 'sine', v, f * .97); }
      else if (kind === 'grain') noise(.26, .035, 2500);
      else noise(.3, .018, 900);
    },
    fan(active, heat = 0) { loopNoise('fan', active, .06 + Math.min(1, heat) * .07, 700 + heat * 1400, 'effects'); },
    pour(active, flow = 0) { loopNoise('wine-pour', active, .006 + .045 * flow, 500 + 2600 * flow, 'effects'); },
    brush(active, speed = 0) { loopNoise('brush', active, .004 + .03 * Math.min(1, speed), 2000 + 2500 * Math.min(1, speed), 'effects'); },
    waterDrift(active, distance = 0) { loopNoise('water-drift', active, .04 * Math.max(.15, 1 - distance), 1300 - 700 * distance, 'ambience'); },
    gate(open) { record('gate'); if (open) { noise(2.2, .09, 320); tone(46, 2.4, 'sine', .09, 34); tone(88, 1.8, 'triangle', .03, 60); } else noise(.3, .04, 500); },
    tokenDrop() { record('token-drop'); noise(.08, .05, 800); tone(180, .09, 'sine', .03, 120); },
    footstep() { record('footstep'); noise(.12, .04, 500); tone(90, .12, 'sine', .02, 65); },
    drumHit(level = .5) { return texture('drum', -.35, Math.max(.2, Math.min(1, level)) * 1.6); },
    previewContext() { return ensure('music', true); },
    preview(channel) {
      api.unlock(); record('preview-' + channel, channel);
      if (channel === 'ambience') noise(.9, .06, 600, 0, 'ambience', true);
      else if (channel === 'music') { const [theme, cue] = (document.getElementById('music-audition')?.value || 'home:').split(':'); if (typeof Music !== 'undefined') Music.preview(theme, cue); }
      else { noise(.15, .045, 1900, 0, 'effects', true); tone(480, .45, 'sine', .03, 460, .08, 'effects', true); }
    },
    battleCue(kind) {
      if (kind === 'horse') { for (const d of [0, .16, .38, .54]) tone(130, .12, 'sine', .09, 48, d); }
      else if (kind === 'drums') { for (const d of [0, .38, .76]) tone(82, .26, 'sine', .11, 44, d); }
      else if (kind === 'recall') { noise(.25, .035, 650); }
      else tone(196, .35, 'sine', .06, 147);
    },
    directionEcho(strong, pan = 0) {
      if (echoHandle?.kind === (strong ? 'echo-near' : 'echo-far') && performance.now() - echoHandle.at < 130) return echoHandle;
      echoHandle?.stop();
      echoHandle = texture(strong ? 'echo-near' : 'echo-far', pan);
      return echoHandle;
    },
    stoneEcho(kind, pan = 0, proximity = 0) {
      if (echoHandle?.kind === kind && performance.now() - echoHandle.at < 130) return echoHandle;
      echoHandle?.stop();
      echoHandle = texture(kind, pan, .55 + .45 * Math.max(0, Math.min(1, proximity)));
      return echoHandle;
    },
    busStart() {
      if (busAmbience) return;
      const c = ensure(); if (!c) return;
      try {
        const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const road = c.createBufferSource(); road.buffer = buffer; road.loop = true;
        const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 190;
        const gain = c.createGain(); gain.gain.setValueAtTime(0, c.currentTime); gain.gain.linearRampToValueAtTime(.055, c.currentTime + 1);
        road.connect(filter).connect(gain).connect(busNode('ambience')); road.start();
        const motor = c.createOscillator(); motor.type = 'sine'; motor.frequency.value = 58;
        const low = c.createGain(); low.gain.value = .13; motor.connect(low).connect(gain); motor.start();
        busAmbience = { nodes: [road, motor], gain };
      } catch (_) { busAmbience = null; }
    },
    busStop() {
      if (!busAmbience || !ctx) return;
      const old = busAmbience; busAmbience = null;
      old.gain.gain.cancelScheduledValues(ctx.currentTime);
      old.gain.gain.setValueAtTime(old.gain.gain.value, ctx.currentTime);
      old.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + .3);
      old.nodes.forEach((n) => { try { n.stop(ctx.currentTime + .35); } catch (_) {} });
    },
    click() { if (performance.now() - lastClick < 65) return; lastClick = performance.now(); record('click', 'ui'); tone(580, .035, 'sine', .03, 440, 0, 'ui'); },
    echo(strong) { tone(strong ? 196 : 330, .45, 'sine', strong ? .07 : .035, strong ? 147 : 260); },
    advance() {}, // 阅读推进保持安静，器物操作才给材质反馈。
    typeTick() {},
    strike() { record('match-strike'); noise(.09, .07, 2800); noise(.18, .022, 1600, .05); },
    flame() { noise(0.35, 0.14, 900); tone(220, 0.3, 'sine', 0.05, 160); },
    torch() { noise(0.5, 0.2, 700); tone(140, 0.5, 'sawtooth', 0.04, 90); },
    whoosh() { noise(0.4, 0.035, 600); },
    phoenix() { return texture('phoenix'); },
    fracture() { noise(.25, .12, 1300); tone(190, .7, 'triangle', .1, 70); },
    water() { noise(.6, .04, 700); tone(320, .35, 'sine', .035, 180); },
    cup() { tone(1180, .4, 'sine', .045, 1120); tone(1790, .25, 'sine', .02); },
    performance() { return texture('performance'); },
    scare() { tone(190, 0.7, 'sawtooth', 0.28, 55); noise(0.5, 0.3, 500); },
    gong() { tone(98, 1.6, 'sine', 0.08, 60); tone(147, 1.2, 'sine', 0.03, 90); },
    collect() { noise(.09, .018, 1400, 0, 'ui'); },
    wrong() { tone(160, .22, 'sine', .055, 110); },
    hurt() { tone(120, 0.3, 'sawtooth', 0.2, 60); noise(0.25, 0.2, 400); },
    death(active = true) {
      for (const h of [...textures]) if (active || h.kind === 'death') h.stop();
      if (active) {
        for (const e of [...sources]) if (e.kind === 'world') { try { e.node.stop(); } catch (_) {} sources.delete(e); }
        stopActionLoops();
        if (typeof Music !== 'undefined') Music.stopPreview();
      }
      ducks.death = active ? -60 : 0; applyDuck();
      if (active) return texture('death');
    },
    success() { tone(392, .6, 'sine', .045); tone(588, .55, 'sine', .025, null, .12); },
    droneStart() { tone(62, 6, 'sine', 0.05, 58); tone(93, 6, 'sine', 0.03, 87); },
    droneStop() {},

    inspect() {
      const states = {}, clocks = {}, gains = {}, mix = {};
      for (const [k, v] of Object.entries(graphs)) {
        states[k] = v.c.state; clocks[k] = v.c.currentTime;
        gains[k] = Object.fromEntries(Object.entries(v.buses).map(([channel, node]) => [channel, node.gain.value]));
        mix[k] = { music: v.ducks.music.gain.value, ambience: v.ducks.ambience.gain.value };
      }
      return {
        settings: { ...settings }, muted, unlocked, paused: hiddenPaused, modal: modalPaused, scene,
        loops: [...loops.keys()], beds: [...beds.keys()], sources: sources.size, textures: textures.size, recent: [...recent],
        states, clocks, gains, mix,
        music: typeof Music !== 'undefined' ? Music.inspect() : null,
        ducks: { ...ducks },
      };
    },
  };

  window.addEventListener('DOMContentLoaded', () => setTimeout(install, 0));
  window.addEventListener('pageshow', (e) => { if (e.persisted) { unlocked = false; } });
  return api;
})();
