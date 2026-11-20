/* Street art and interaction layer. Full story remains in data.js / engine.js. */
'use strict';
const StreetScene = {
  reviewMode: new URLSearchParams(location.search).get('review') === 'street',
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  async receiveMatch() {
    const source = Engine.els.cardAsset.querySelector('img');
    if (!source || this.reducedMotion) return;
    const r = source.getBoundingClientRect();
    const hud = Engine.els.fire.getBoundingClientRect();
    const clone = source.cloneNode();
    clone.className = 'received-match';
    Object.assign(clone.style, { left:r.left+'px', top:r.top+'px', width:r.width+'px', height:r.height+'px' });
    document.body.append(clone);
    AudioFX.collect();
    try {
      await clone.animate([
        { transform:'translate(0,0) scale(1)', opacity:1 },
        { transform:`translate(${hud.left-r.left}px,${hud.top-r.top}px) scale(.15)`, opacity:.5 }
      ], { duration:750, easing:'cubic-bezier(.25,.7,.3,1)', fill:'forwards' }).finished;
    } catch (_) { /* The inventory update still completes if an animation is cancelled. */ }
    clone.remove();
    Engine.els.fire.classList.add('just-received');
    setTimeout(() => Engine.els.fire.classList.remove('just-received'),1800);
  },
  reviewCheckpoint() {
    return new Promise(resolve => {
      const d = document.getElementById('street-review');
      Engine.fast = false;
      Engine.els.dlgFast.classList.remove('on');
      d.showModal();
      document.getElementById('review-continue').onclick = () => { d.close(); resolve(); };
      // Escape closes a review sheet but must also unblock the story.
      d.addEventListener('close', () => resolve(), { once:true });
    });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const game = document.getElementById('game');
  document.getElementById('dlg').addEventListener('pointerdown', e => {
    if (e.target.closest('button') || Engine.isReadingModal()) return;
    if (Engine.advanceFn) Engine.advanceFn();
  });
  const label = document.createElement('div');
  label.id = 'scene-label';
  label.innerHTML = '<span>阙 下 归 人</span><b>序幕 · 清晨街角</b>';
  game.append(label);
  const accept = document.createElement('dialog');
  accept.id = 'street-review';
  accept.setAttribute('aria-labelledby','street-review-title');
  accept.innerHTML = '<span class="review-eyebrow">序幕 · 清晨街角</span><h2 id="street-review-title">一盒火柴，<br>一场尚未醒来的梦。</h2><p>火柴已收入随身物品。街角这一段到此结束。</p><p class="review-note">本次验收：街景、人物、对白、购买与入包反馈。<br>后续场景仍在逐段制作。</p><div class="review-actions"><a href="?review=street">重看本段</a><button id="review-continue">继续后续原版流程 →</button></div>';
  document.body.append(accept);
  const pause = document.createElement('div');
  pause.id = 'reading-paused';
  pause.textContent = '开卷阅证 · 剧情暂停';
  game.append(pause);
  // The existing game owns audio; this layer adds only visual atmosphere.
  const air=document.getElementById('street-air');
  for(let i=0;i<14;i++) {
    const streak=document.createElement('i');
    streak.style.setProperty('--x',`${(i*7.3)%100}%`);
    streak.style.setProperty('--delay',`${-i*.81}s`);
    streak.style.setProperty('--duration',`${1.6+i%4*.3}s`);
    air.append(streak);
  }
  window.addEventListener('pointermove', e => {
    if (StreetScene.reducedMotion || Engine.isReadingModal()) return;
    const x=e.clientX/window.innerWidth-.5, y=e.clientY/window.innerHeight-.5;
    document.documentElement.style.setProperty('--scene-x',`${-x*10}px`);
    document.documentElement.style.setProperty('--scene-y',`${-y*5}px`);
    document.documentElement.style.setProperty('--character-x',`${-x*17}px`);
  }, {passive:true});
  const syncPause = () => {
    const active=Engine.isReadingModal();
    game.classList.toggle('reading-modal',active);
    pause.classList.toggle('show',active && !accept.open && !document.getElementById('bus-review')?.open && !document.getElementById('tomb-review')?.open && !document.getElementById('encounter-review')?.open);
  };
  StreetScene.syncPause = syncPause;
  const observer=new MutationObserver(syncPause);
  ['evidence-book','document-modal','review-modal'].forEach(id => observer.observe(document.getElementById(id),{attributes:true,attributeFilter:['class']}));
  observer.observe(accept,{attributes:true,attributeFilter:['open']});
  if(StreetScene.reviewMode&&!StoryHistory.hasRequest()) {
    // Queue after the original main.js has initialized its engine.
    setTimeout(async () => {
      const assetPaths=['assets/street.webp','assets/oldlady.webp','assets/matchbox.webp'];
      await Promise.all(assetPaths.map(src=>new Promise(resolve=>{const i=new Image();i.onload=i.onerror=resolve;i.src=src;})));
      Engine.player={name:'游客',gender:'f'};
      Engine.start('tour');
    }, 0);
  }
});
window.addEventListener('game-node', e => {
  const node=e.detail;
  const street=node.id==='street'||node.id==='buy-match';
  const bus=node.id==='bus';
  const tomb=['tomb-dark','strike-match','tomb-lit','tomb-observe'].includes(node.id);
  const label=document.getElementById('scene-label');
  label?.classList.toggle('show',street||bus||tomb);
  if(label) label.querySelector('b').textContent=tomb?'序幕 · 墓室初醒':bus?'序幕 · 大巴入梦':'序幕 · 清晨街角';
});
