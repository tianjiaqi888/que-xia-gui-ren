/* The bus sequence uses the original narrative engine and layered game art. */
'use strict';
const BusScene = {
  reviewMode: new URLSearchParams(location.search).get('review') === 'bus',
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  active:false, phase:'idle', age:0, sleepElapsed:0, raf:0, previous:0,
  drops:[], wiping:false, lastWipe:null, sleepDone:null,

  async play(node) {
    delete this.root.dataset.arrived;
    this.wipeHint.hidden=false;
    this.surface.tabIndex=0;
    Engine.setBg(node.bg);
    Engine.setChars([]);
    Engine.setLight(null);
    Engine.hint('车窗薄雾可轻擦 · 点击下方对白继续');
    this.active=true;
    this.phase='awake';
    this.age=0;
    this.sleepElapsed=0;
    this.root.style.setProperty('--sleep-progress',0);
    this.rest.hidden=true;
    this.resize();
    this.drops=Array.from({length:this.reducedMotion?15:36},()=>({x:Math.random(),y:Math.random(),r:1.1+Math.random()*2.3,v:.003+Math.random()*.012}));
    this.previous=performance.now();
    this.tick(this.previous);
    AudioFX.busStart();
    await Engine.showLines([node.lines[0]], {log:null,chars:[]});
    Engine.hint('山色从窗边掠过。困意渐浓，合眼歇一会儿。');
    this.rest.hidden=false;
    await new Promise(resolve=>{
      this.sleepButton.onclick=()=>{
        AudioFX.unlock();
        this.rest.hidden=true;
        this.phase='sleeping';
        this.sleepElapsed=0;
        this.sleepDone=resolve;
      };
    });
    Engine.hint('');
    await Engine.showLines(node.lines.slice(1), {log:null,chars:[]});
    Engine.fast=false;
    Engine.els.dlgFast.classList.remove('on');
    if(this.reviewMode) await this.reviewCheckpoint();
    this.stop();
  },

  resize() {
    if(!this.root) return;
    const r=this.surface.getBoundingClientRect();
    this.w=Math.max(1,Math.round(r.width));this.h=Math.max(1,Math.round(r.height));
    for(const canvas of [this.fog,this.rain]){canvas.width=this.w;canvas.height=this.h;}
    const c=this.fog.getContext('2d');
    c.fillStyle='rgba(192,210,205,.15)';c.fillRect(0,0,this.w,this.h);
    const g=c.createRadialGradient(this.w*.56,this.h*.57,10,this.w*.56,this.h*.57,this.w*.7);
    g.addColorStop(0,'rgba(229,235,222,.15)');g.addColorStop(1,'rgba(203,219,210,0)');
    c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
    this.lastWipe=null;
  },

  wipe(e) {
    if(!this.active||this.phase!=='awake'||Engine.isReadingModal())return;
    const r=this.surface.getBoundingClientRect();
    const p={x:(e.clientX-r.left)*this.w/r.width,y:(e.clientY-r.top)*this.h/r.height};
    const c=this.fog.getContext('2d');
    c.save();c.globalCompositeOperation='destination-out';
    const previous=this.lastWipe||p;
    const radius=Math.max(28,Math.min(this.w,this.h)*.085);
    const steps=Math.max(1,Math.min(60,Math.ceil(Math.hypot(p.x-previous.x,p.y-previous.y)/8)));
    for(let i=0;i<=steps;i++){
      const x=previous.x+(p.x-previous.x)*i/steps,y=previous.y+(p.y-previous.y)*i/steps;
      const brush=c.createRadialGradient(x,y,0,x,y,radius);
      brush.addColorStop(0,'rgba(0,0,0,.20)');brush.addColorStop(.5,'rgba(0,0,0,.09)');brush.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=brush;c.fillRect(x-radius,y-radius,radius*2,radius*2);
    }
    c.restore();
    this.lastWipe=p;
    this.wipeHint.textContent='薄雾散开了一点 · 山色正从窗边经过';
  },

  tick(now) {
    if(!this.active)return;
    const dt=Math.min(80,now-this.previous);this.previous=now;
    if(!Engine.isReadingModal()&&!document.hidden){
      this.age+=dt;
      if(!this.reducedMotion){
        const drift=Math.min(this.age/65000,1);
        this.landscape.style.transform=`scale(1.13) translateX(${3-drift*6}%)`;
        this.carriage.style.transform=`scale(1.015) translateY(${Math.sin(this.age/750)*.55}px) rotate(${Math.sin(this.age/1400)*.055}deg)`;
      }
      this.drawRain(dt);
      if(this.phase==='sleeping'){
        this.sleepElapsed+=dt;
        const t=this.sleepElapsed;
        const progress=this.reducedMotion?Math.min(t/700,1):t<850?Math.sin(t/850*Math.PI)*.58:t<1300?0:Math.min((t-1300)/1500,1);
        this.root.style.setProperty('--sleep-progress',progress.toFixed(3));
        if(t>(this.reducedMotion?850:3100)){
          this.phase='asleep';this.root.style.setProperty('--sleep-progress',1);
          const done=this.sleepDone;this.sleepDone=null;if(done)done();
        }
      }
    }
    this.raf=requestAnimationFrame(t=>this.tick(t));
  },

  drawRain(dt) {
    const c=this.rain.getContext('2d');c.clearRect(0,0,this.w,this.h);
    for(const d of this.drops){
      if(!this.reducedMotion){d.y+=d.v*dt/1000;if(d.y>1.07){d.y=-.03;d.x=Math.random();}}
      const x=d.x*this.w,y=d.y*this.h;
      c.beginPath();c.strokeStyle='rgba(232,243,232,.25)';c.lineWidth=.65;c.moveTo(x-.8,y-d.r*6);c.lineTo(x,y);c.stroke();
      c.beginPath();c.ellipse(x,y,d.r*.65,d.r*1.3,-.15,0,Math.PI*2);c.fillStyle='rgba(209,231,226,.15)';c.fill();c.strokeStyle='rgba(239,250,240,.5)';c.stroke();
    }
  },

  reviewCheckpoint() {
    return new Promise(resolve=>{
      this.review.showModal();
      document.getElementById('bus-review-continue').onclick=()=>this.review.close();
      this.review.addEventListener('close',()=>resolve(),{once:true});
    });
  },

  arrive() {
    this.stop();
    this.root.dataset.arrived='true';
    this.root.style.setProperty('--sleep-progress',0);
    this.carriage.style.transform='';
    this.wipeHint.hidden=true;
    this.surface.tabIndex=-1;
  },

  stop() {
    this.active=false;this.phase='idle';this.wiping=false;this.sleepDone=null;
    cancelAnimationFrame(this.raf);
    AudioFX.busStop();
    
    this.rest.hidden=true;
  }
};

window.addEventListener('DOMContentLoaded',()=>{
  const root=document.createElement('section');root.id='bus-view';root.setAttribute('aria-label','大巴车窗与流动的山村景色');
  root.innerHTML='<div id="bus-carriage"><img id="bus-landscape" src="assets/bus-landscape.webp" alt="薄雾中的川东山村与田野"><div id="bus-window-surface" aria-label="按住车窗擦拭薄雾"><canvas id="bus-fog" aria-hidden="true"></canvas><canvas id="bus-rain" aria-hidden="true"></canvas></div><img id="bus-frame" src="assets/bus-frame.webp" alt="大巴侧窗、座椅和浅色窗帘"></div><div class="bus-eyelid upper" aria-hidden="true"></div><div class="bus-eyelid lower" aria-hidden="true"></div><div id="bus-wipe-hint">按住玻璃，轻轻擦开薄雾</div><div id="bus-rest" hidden><span>路 途 尚 远</span><button id="bus-sleep">合眼片刻 <i>⌄</i></button><small>火柴已收好，安心歇一会儿。</small></div>';
  document.getElementById('stage').insertBefore(root,document.getElementById('char-layer'));
  Object.assign(BusScene,{root,carriage:root.querySelector('#bus-carriage'),landscape:root.querySelector('#bus-landscape'),surface:root.querySelector('#bus-window-surface'),fog:root.querySelector('#bus-fog'),rain:root.querySelector('#bus-rain'),rest:root.querySelector('#bus-rest'),sleepButton:root.querySelector('#bus-sleep'),wipeHint:root.querySelector('#bus-wipe-hint')});
  const s=BusScene.surface;
  s.addEventListener('pointerdown',e=>{e.stopPropagation();if(BusScene.phase!=='awake')return;BusScene.wiping=true;BusScene.lastWipe=null;s.setPointerCapture(e.pointerId);BusScene.wipe(e);AudioFX.unlock();AudioFX.busStart();});
  s.addEventListener('pointermove',e=>{if(BusScene.wiping)BusScene.wipe(e);});
  s.addEventListener('click',e=>{e.stopPropagation();BusScene.lastWipe=null;BusScene.wipe(e);});
  s.setAttribute('role','button');s.tabIndex=0;s.setAttribute('aria-label','擦拭车窗薄雾');
  s.addEventListener('keydown',e=>{
    if(e.code!=='Space'&&e.code!=='Enter')return;
    e.preventDefault();e.stopPropagation();
    const r=s.getBoundingClientRect();BusScene.lastWipe=null;BusScene.wipe({clientX:r.left+r.width*.5,clientY:r.top+r.height*.5});
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture'])s.addEventListener(event,()=>{BusScene.wiping=false;BusScene.lastWipe=null;});
  window.addEventListener('resize',()=>{if(BusScene.active)BusScene.resize();});
  const d=document.createElement('dialog');d.id='bus-review';d.setAttribute('aria-labelledby','bus-review-title');
  d.innerHTML='<span class="review-eyebrow">序幕 · 大巴入梦</span><h2 id="bus-review-title">于是，你见证了一场<br>免于遗忘的梦。</h2><p>车窗雨痕、景物流动、困倦合眼与入梦转场已完成。</p><p class="review-note">本段到此，接下来是墓室点火。<br>你可以重看这一段，也可以从街角连贯体验。</p><div class="review-actions"><a href="?review=bus">重看本段</a><a href="?review=street">从街角开始</a><button id="bus-review-continue">进入墓室 →</button></div>';
  document.body.append(d);BusScene.review=d;
  new MutationObserver(()=>StreetScene.syncPause?.()).observe(d,{attributes:true,attributeFilter:['open']});
  window.addEventListener('pagehide',()=>BusScene.stop());
  if(BusScene.reviewMode&&!StoryHistory.hasRequest())setTimeout(async()=>{
    await Promise.all(['assets/bus-frame.webp','assets/bus-landscape.webp'].map(src=>new Promise(resolve=>{const image=new Image();image.onload=image.onerror=resolve;image.src=src;})));
    Engine.player={name:'游客',gender:'f'};Engine.start('tour',SCRIPT.findIndex(n=>n.id==='bus'));Engine.addItem('火柴');
  },0);
});
