/* Recorded instrumental score. Streams local MP3s; no procedural melody or remote runtime dependency. */
'use strict';
const Music = (() => {
  let active = null, pending = null, fading = null, audition = null;
  let desired = null, generation = 0, paused = false, held = false, lastError = null;
  let transport = null, pauseTimer = null, pauseTicket = 0;
  const failed = new Set();
  const scoreFiles = new Map();

  function seekableScore(file) {
    if (scoreFiles.has(file)) return scoreFiles.get(file).promise;
    const controller = new AbortController(), entry = { controller, url: null };
    entry.promise = fetch(file, { signal: controller.signal }).then(response => {
      if (!response.ok) throw Error('Music file unavailable');
      return response.blob();
    }).then(blob => { if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError'); entry.url = URL.createObjectURL(blob); return entry.url; });
    scoreFiles.set(file, entry);
    return entry.promise;
  }

  function dispose(entry) {
    if (!entry || entry.disposed) return;
    entry.disposed = true;
    clearTimeout(entry.timer);
    entry.media.onplaying = entry.media.onerror = entry.media.onloadedmetadata = null;
    entry.media.pause();
    entry.media.removeAttribute('src'); entry.media.load();
    try { entry.source.disconnect(); entry.gain.disconnect(); } catch (_) {}
  }

  function retire(entry, seconds = 3) {
    dispose(fading); fading = entry;
    if (!entry) return;
    const t = entry.context.currentTime;
    entry.gain.gain.cancelScheduledValues(t);
    entry.gain.gain.setValueAtTime(entry.gain.gain.value, t);
    entry.gain.gain.linearRampToValueAtTime(0, t + seconds);
    entry.timer = setTimeout(() => { dispose(entry); if (fading === entry) fading = null; }, seconds * 1000 + 60);
  }

  function record(name, cue = '') {
    const track = AUDIO_MAP.music[name];
    if (!track) return null;
    return { ...track, ...(track.cues?.[cue] || {}), name, cue, key: name + ':' + cue };
  }

  function create(rec, context, preview = false) {
    const media = new Audio();
    media.preload = 'auto'; media.loop = false;
    const source = context.createMediaElementSource(media), gain = context.createGain();
    gain.gain.value = 0;
    if (!preview && !transport) {
      transport = context.createGain(); transport.gain.value = held ? 0 : 1;
      transport.connect(AudioFX.busNode('music'));
    }
    source.connect(gain).connect(preview ? AudioFX.busNode('music', true) : transport);
    const entry = { rec, media, source, gain, context, disposed: false, ready: false, srcReady: false, timer: null };
    media.onloadedmetadata = () => {
      if (entry.disposed) return;
      const start = Math.min(rec.start || 0, Math.max(0, media.duration - 2));
      if (start) media.currentTime = start;
    };
    if (rec.cues) {
      // Static hosts may not support byte ranges. One shared local blob makes
      // narrative cue seeking reliable without downloading the file for each cue.
      seekableScore(rec.file).then(url => {
        if (entry.disposed) return;
        media.src = url; entry.srcReady = true;
        if (entry.playRequested && (preview || !paused)) resume(entry);
      }).catch(error => fail(entry, error));
    } else { media.src = rec.file; entry.srcReady = true; }
    return entry;
  }

  function fail(entry, error) {
    if (entry.disposed) return;
    if (error?.name === 'AbortError') return;
    // A subsequent user gesture can resume a blocked media element.
    if (error?.name === 'NotAllowedError') { entry.blocked = true; return; }
    lastError = entry.rec.name; failed.add(entry.rec.key);
    if (pending === entry) { pending = null; retire(active, 1.5); active = null; }
    if (active === entry) active = null;
    dispose(entry);
  }

  function resume(entry) {
    if (!entry || entry.disposed) return;
    entry.playRequested = true;
    if (!entry.srcReady) return;
    entry.blocked = false;
    entry.media.play().catch(error => fail(entry, error));
  }

  function play(name, cue = '', force = false, startOverride = null) {
    if (!name) { if (desired || active || pending) stop(); return; }
    const rec = record(name, cue);
    if (!rec || !AudioFX.unlockedState()) return;
    if (!force && desired === rec.key && (active?.rec.key === rec.key || pending?.rec.key === rec.key)) return;
    if (failed.has(rec.key)) return;
    const context = AudioFX.ctx(); if (!context) return;
    generation++; const stamp = generation;
    dispose(pending); pending = null; desired = rec.key;
    const entry = create(startOverride === null ? rec : { ...rec, start: startOverride }, context);
    pending = entry;
    entry.media.onerror = () => fail(entry, entry.media.error);
    entry.media.onplaying = () => {
      if (entry.disposed || stamp !== generation || pending !== entry) return;
      if (paused && held) { entry.media.pause(); return; }
      entry.ready = true; lastError = null;
      const previous = active; active = entry; pending = null;
      const t = context.currentTime;
      entry.gain.gain.setValueAtTime(0, t);
      entry.gain.gain.linearRampToValueAtTime(rec.gain ?? 1, t + (rec.fadeIn || 3));
      retire(previous, rec.fadeOut || 3);
    };
    if (!paused) resume(entry);
  }

  function stop(seconds = 2) {
    generation++; desired = null;
    dispose(pending); pending = null;
    const previous = active; active = null;
    retire(previous, seconds);
  }

  function setPaused(value, immediate = false) {
    if (paused === !!value && !(value && immediate && !held)) return;
    paused = !!value;
    clearTimeout(pauseTimer); const ticket = ++pauseTicket;
    const context = AudioFX.ctx();
    if (transport && context) {
      const t = context.currentTime, p = transport.gain;
      if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t);
      else { const v = p.value; p.cancelScheduledValues(t); p.setValueAtTime(v, t); }
      p.setValueAtTime(p.value, t);
      if (immediate) p.setValueAtTime(paused ? 0 : 1, t);
      else p.linearRampToValueAtTime(paused ? 0 : 1, t + (paused ? .7 : 1.05));
    }
    if (paused) {
      const hold = () => {
        if (ticket !== pauseTicket || !paused) return;
        held = true;
        for (const e of [active, pending, fading]) if (e && !e.disposed) e.media.pause();
      };
      if (immediate) hold(); else pauseTimer = setTimeout(hold, 730);
    } else {
      held = false;
      for (const e of [active, pending, fading]) if (e && !e.disposed && e.media.paused) resume(e);
    }
  }

  function tick() {
    if (paused || !active || pending || active.disposed || !active.ready) return;
    const { media, rec } = active;
    if (!Number.isFinite(media.duration)) return;
    const end = Math.min(rec.loopEnd || media.duration - 1, media.duration - .1);
    if (media.currentTime >= end - 3.2 || media.ended) {
      // Crossfade the phrase boundary; at most two world tracks can coexist.
      play(rec.name, rec.cue, true, rec.loopStart ?? rec.start ?? 0);
    }
  }

  function stopPreview() { dispose(audition); audition = null; }

  function preview(name = 'home', cue = '') {
    stopPreview();
    const rec = record(name, cue), context = AudioFX.previewContext();
    if (!rec || !context) return;
    const entry = create(rec, context, true); audition = entry;
    entry.media.onerror = () => { dispose(entry); if (audition === entry) audition = null; };
    entry.media.onplaying = () => {
      if (entry.disposed || audition !== entry || entry.ready) return;
      entry.ready = true;
      const t = context.currentTime;
      entry.gain.gain.setValueAtTime(0, t); entry.gain.gain.linearRampToValueAtTime(.85, t + .5);
      entry.gain.gain.setValueAtTime(.85, t + 18); entry.gain.gain.linearRampToValueAtTime(0, t + 20);
      entry.timer = setTimeout(() => { dispose(entry); if (audition === entry) audition = null; }, 20100);
    };
    resume(entry);
  }

  return {
    play, stop, preview, stopPreview, tick, setPaused,
    setScene: play,
    unlock() {
      for (const entry of [pending, active]) if (entry?.blocked && !paused) resume(entry);
    },
    reset() {
      clearTimeout(pauseTimer); pauseTicket++;
      generation++; stopPreview(); dispose(active); dispose(pending); dispose(fading);
      active = pending = fading = null; desired = null; paused = held = false; lastError = null; failed.clear();
      if (transport) transport.disconnect(); transport = null;
      for (const entry of scoreFiles.values()) { entry.controller.abort(); if (entry.url) URL.revokeObjectURL(entry.url); }
      scoreFiles.clear();
    },
    inspect() {
      const entry = active || pending;
      return { theme: desired?.split(':')[0] || null, cue: desired?.split(':')[1] || '',
        playing: active?.rec.name || null, fading: fading?.rec.name || null,
        loading: !!pending, paused: held, pauseRequested: paused, transportGain: transport?.gain.value ?? 1, previewing: !!audition, error: lastError,
        title: entry?.rec.title || null, file: entry?.rec.file || null,
        outputGain: active?.gain.gain.value || 0, position: active?.media.currentTime || 0,
        duration: Number.isFinite(active?.media.duration) ? active.media.duration : 0 };
    },
    resumeTitle() { if (!desired) play('memory'); },
  };
})();
