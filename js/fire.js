/* Shared code-native flame and embers. No external media dependencies. */
'use strict';
const FireFX={
  reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
  effects:new Set(),
  mount(host,kind='torch'){
    const flame=document.createElement('span');flame.className='firefx firefx-'+kind;flame.setAttribute('aria-hidden','true');
    flame.innerHTML='<span class="firefx-glow"></span><span class="firefx-outer"></span><span class="firefx-middle"></span><span class="firefx-core"></span><span class="firefx-base"></span><span class="firefx-ember ember-a"></span><span class="firefx-ember ember-b"></span><span class="firefx-ember ember-c"></span>';
    host.append(flame);return flame;
  },
  burst(element,{count=20,spread=1}={}){
    if(this.reduced||!element)return;
    const r=element.getBoundingClientRect(),origin={x:r.left+r.width*.5,y:r.top+r.height*.25};
    const wrap=document.createElement('span');wrap.className='firefx-burst';wrap.setAttribute('aria-hidden','true');Object.assign(wrap.style,{left:origin.x+'px',top:origin.y+'px'});document.body.append(wrap);
    const particles=Array.from({length:Math.min(count,innerWidth<760?18:30)},()=>{const el=document.createElement('span');el.className='firefx-spark';const size=.8+Math.random()*1.8;Object.assign(el.style,{width:size+'px',height:(size*(1+Math.random()*1.8))+'px',background:Math.random()>.4?'#ffcf6c':'#f48c36'});wrap.append(el);return{el,vx:(Math.random()-.5)*190*spread,vy:-45-Math.random()*165,life:450+Math.random()*700,age:0};});
    let previous=performance.now(),raf=0;const effect={stop:()=>{cancelAnimationFrame(raf);wrap.remove();this.effects.delete(effect);}};this.effects.add(effect);
    if(this.effects.size>4)this.effects.values().next().value.stop();
    const step=now=>{const dt=Math.min(50,now-previous);previous=now;if(!Engine.isReadingModal()&&!document.hidden){for(const p of particles){p.age+=dt;const t=p.age/1000;p.el.style.transform=`translate(${p.vx*t}px,${p.vy*t+95*t*t}px) rotate(${p.vx*t*3}deg)`;p.el.style.opacity=Math.max(0,1-p.age/p.life)**1.5;} }if(particles.every(p=>p.age>=p.life)){effect.stop();return;}raf=requestAnimationFrame(step);};raf=requestAnimationFrame(step);
  }
};
window.addEventListener('DOMContentLoaded',()=>{
  const flame=document.getElementById('flame');FireFX.mount(flame);
  const hud=document.getElementById('hud-fire');new MutationObserver(()=>{const host=hud.querySelector('.torch-icon > i');if(host&&!host.querySelector('.firefx'))FireFX.mount(host,'small');}).observe(hud,{childList:true,subtree:true});
  window.addEventListener('pagehide',()=>{for(const effect of [...FireFX.effects])effect.stop();});
});
