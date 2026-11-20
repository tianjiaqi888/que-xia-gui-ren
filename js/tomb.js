/* Approved sample art and physical discoveries in the tomb. */
'use strict';
const TombScene = {
  reviewMode:new URLSearchParams(location.search).get('review')==='tomb',
  reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
  records:new Map(),lit:false,rendering:false,raf:0,previous:0,
  particles:Array.from({length:48},()=>({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.1,s:.0005+Math.random()*.001})),
  anchors:{'墓壁铭文':{x:19,y:37},'陶罐':{x:31,y:74},'棺椁轮廓':{x:85,y:54}},
  reset(){this.lit=false;this.records.clear();this.stage.classList.add('tomb-unlit');this.updateProgress();},
  isOpening(){return ['tomb-dark','strike-match','tomb-lit','tomb-observe'].includes(Engine.currentNode?.id);},
  backgroundChanged(key){
    if(!this.stage)return;
    if(key!=='bg-tomb'){this.rendering=false;cancelAnimationFrame(this.raf);this.stage.classList.remove('tomb-unlit');return;}
    this.layout();this.stage.classList.toggle('tomb-unlit',!this.lit);
    if(!this.rendering){this.rendering=true;this.previous=performance.now();this.tick(this.previous);}
  },
  layout(){
    const ratio=1672/941,w=Math.min(innerWidth,innerHeight*ratio),h=w/ratio;
    this.frame={x:(innerWidth-w)/2,y:(innerHeight-h)/2,w,h};
    for(const [key,value]of Object.entries({left:this.frame.x,top:this.frame.y,width:w,height:h}))this.stage.style.setProperty('--tomb-'+key,value+'px');
    this.dust.width=Math.round(w);this.dust.height=Math.round(h);this.positionMarkers();
  },
  positionMarkers(){
    if(!this.frame)return;
    document.querySelectorAll('[data-tomb-clue]').forEach(b=>{const p=this.anchors[b.dataset.tombClue],f=this.frame;b.style.left=f.x+p.x/100*f.w+'px';b.style.top=f.y+p.y/100*f.h+'px';});
  },
  pointAt(label){const p=this.anchors[label],f=this.frame;if(p&&f)Engine.pointerMove(f.x+p.x/100*f.w,f.y+p.y/100*f.h);},
  tick(now){
    if(!this.rendering)return;
    const dt=Math.min(now-this.previous,80);this.previous=now;
    if(!Engine.isReadingModal()&&!document.hidden&&!this.reducedMotion){
      const c=this.dust.getContext('2d'),w=this.dust.width,h=this.dust.height;c.clearRect(0,0,w,h);
      for(const p of this.particles){p.y-=p.s*dt/45;if(p.y<0){p.y=1;p.x=Math.random();}c.beginPath();c.fillStyle=this.lit?'rgba(228,210,157,.25)':'rgba(193,215,205,.06)';c.arc(p.x*w,p.y*h,p.r,0,Math.PI*2);c.fill();}
      const x=Math.max(0,Math.min(1,(Engine._tx??innerWidth/2)/innerWidth))-.5,y=Math.max(0,Math.min(1,(Engine._ty??innerHeight/2)/innerHeight))-.5;
      this.stage.style.setProperty('--tomb-pan-x',-x*7+'px');this.stage.style.setProperty('--tomb-pan-y',-y*4+'px');
      this.warmth.style.setProperty('--warm-x',(Engine._lx??innerWidth/2)+'px');this.warmth.style.setProperty('--warm-y',(Engine._ly??innerHeight/2)+'px');
    }
    TombRelics.syncEarly(dt);
    this.raf=requestAnimationFrame(t=>this.tick(t));
  },
  wait(ms){return new Promise(resolve=>{let elapsed=0,last=performance.now();const step=now=>{const dt=Math.min(now-last,80);last=now;if(!Engine.isReadingModal()&&!document.hidden)elapsed+=dt;if(elapsed>=ms)resolve();else requestAnimationFrame(step);};requestAnimationFrame(step);});},

  strikeMatch(){return new Promise(resolve=>{
    Engine.hideDlg();Engine.hint('按住火柴向右擦动 · 也可轻触点燃');
    const layer=document.getElementById('minigame-layer');layer.replaceChildren();layer.classList.add('show');
    const panel=document.createElement('section');panel.className='tomb-match-panel';
    panel.innerHTML='<span class="tomb-eyebrow">点 亮 光 源</span><h2>让微光醒来</h2><p>按住火柴，沿砂皮向右擦动。</p><div class="tomb-striker"><div class="tomb-strike-fill"></div><span>向 右 擦 动 ─────→</span><button class="tomb-match-handle" aria-label="向右拖动火柴，或按回车点燃"><i></i><b></b></button></div><button class="tomb-tap-light">轻触点燃</button>';
    layer.append(panel);const track=panel.querySelector('.tomb-striker'),handle=panel.querySelector('.tomb-match-handle'),fill=panel.querySelector('.tomb-strike-fill');
    let dragging=false,startX=0,dx=0,done=false,lastSpark=0;
    const limit=()=>Math.max(60,track.clientWidth-handle.offsetWidth-24);
    const move=x=>{dx=Math.max(0,Math.min(limit(),x-startX));handle.style.transform=`translateX(${dx}px)`;fill.style.width=dx/limit()*100+'%';if(dragging)AudioFX.matchRub(true,dx/limit());if(dx>lastSpark+24){AudioFX.friction(dx/limit());AudioFX.spark();FireFX.burst(handle.querySelector("b"),{count:5,spread:.65});lastSpark=dx;}if(dx>limit()*.75)ignite();};
    const ignite=async()=>{if(done||Engine.isReadingModal())return;done=true;dragging=false;AudioFX.matchRub(false);FireFX.mount(handle.querySelector('b'),'small');FireFX.burst(handle.querySelector('b'),{count:22,spread:1});AudioFX.strike();panel.classList.add('lit');handle.disabled=true;panel.querySelector('.tomb-tap-light').disabled=true;await this.wait(this.reducedMotion?120:350);this.lit=true;this.stage.classList.remove('tomb-unlit');Engine.setLight('match');AudioFX.flame();Engine.toast('火种已燃——周围亮了起来','good');await this.wait(this.reducedMotion?100:550);layer.classList.remove('show');layer.replaceChildren();resolve();};
    handle.addEventListener('pointerdown',e=>{e.stopPropagation();if(done||Engine.isReadingModal())return;dragging=true;lastSpark=0;startX=e.clientX;handle.setPointerCapture(e.pointerId);AudioFX.unlock();AudioFX.matchRub(true,0);});
    handle.addEventListener('pointermove',e=>{if(dragging&&!done&&!Engine.isReadingModal())move(e.clientX);});
    handle.addEventListener('pointerup',e=>{if(dragging&&!done)move(e.clientX);dragging=false;AudioFX.matchRub(false);if(!done){dx=0;handle.style.transform='';fill.style.width='0%';}});
    handle.addEventListener('pointercancel',()=>{dragging=false;AudioFX.matchRub(false);if(!done){handle.style.transform='';fill.style.width='0%';}});
    handle.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();ignite();}});
    panel.querySelector('.tomb-tap-light').onclick=ignite;
  });},

  observe(node){return new Promise(resolve=>{
    Engine.hideDlg();Engine.setLight('match');this.progress.classList.add('show');
    const layer=document.getElementById('minigame-layer');layer.replaceChildren();layer.classList.add('show');
    if(this.records.size===node.points.length){layer.classList.remove('show');this.progress.classList.remove('show');resolve();return;}
    let busy=false;const buttons=[];
    for(const point of node.points){
      const b=document.createElement('button');b.className='tomb-clue';b.dataset.tombClue=point.label;b.setAttribute('aria-label','观察'+point.label);b.innerHTML='<i></i><span></span>';b.querySelector('span').textContent=point.label;
      b.classList.toggle('visited',this.records.has(point.label));
      b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('focus',()=>this.pointAt(point.label));
      b.onclick=async()=>{
        if(busy||Engine.isReadingModal())return;busy=true;buttons.forEach(x=>x.disabled=true);this.pointAt(point.label);AudioFX.touchMaterial(point.label==='陶罐'?'pottery':point.label==='棺椁轮廓'?'wood':'stone');
        await Engine.showLines([{cls:'narration',name:'观察 · '+point.label,text:point.text}],{log:null,chars:[]});
        const fresh=!this.records.has(point.label);this.records.set(point.label,point.text);b.classList.add('visited');b.setAttribute('aria-label','观察'+point.label+'（已察）');this.updateProgress();
        if(typeof Progress!=='undefined')Progress.resources();
        if(fresh){Engine.toast('已记入墓室札记 · '+point.label,'good');AudioFX.paper('page');}
        busy=false;buttons.forEach(x=>x.disabled=false);
        if(this.records.size===node.points.length){
          busy=true;buttons.forEach(x=>x.disabled=true);Engine.hint('三处观察完成 · 墓室深处似有回声');
          await this.wait(450);layer.classList.remove('show');layer.replaceChildren();this.progress.classList.remove('show');
          Engine.fast=false;Engine.els.dlgFast.classList.remove('on');if(this.reviewMode)await this.reviewCheckpoint();resolve();
        }else Engine.hint(`循光察物 · 已观察 ${this.records.size} / ${node.points.length} 处`);
      };
      buttons.push(b);layer.append(b);
    }
    this.positionMarkers();this.updateProgress();Engine.hint(`循光察物 · 已观察 ${this.records.size} / ${node.points.length} 处`);
  });},
  updateProgress(){if(this.progress)this.progress.innerHTML='<span>循 光 察 物</span><b>'+this.records.size+' / 3</b>';},
  showNotes(){
    const e=Engine.els;e.bookTabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===this.notesTab));e.bookContent.replaceChildren();e.bookCount.textContent=`身份线索 ${Engine.collected.size} 条 · 观察记录 ${this.records.size} 处`;
    if(!this.records.size){const p=document.createElement('p');p.className='book-empty';p.textContent='让火光照向墓室，记下那些仍留在尘土里的东西。';e.bookContent.append(p);}
    for(const[title,text]of this.records){const article=document.createElement('article');article.className='book-entry';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=text;const small=document.createElement('span');small.className='src';small.textContent='序幕 · 观察附记（尚非身份定论）';article.append(h,p,small);e.bookContent.append(article);}
  },
  reviewCheckpoint(){return new Promise(resolve=>{
    const d=this.review;let readingNotes=false;
    const closed=()=>{if(readingNotes)return;d.removeEventListener('close',closed);resolve();};
    d.addEventListener('close',closed);d.showModal();document.getElementById('tomb-review-continue').onclick=()=>d.close();
    document.getElementById('tomb-review-notes').onclick=()=>{readingNotes=true;d.close();Engine.openBook();this.showNotes();Engine._onBookCloseOnce=()=>{readingNotes=false;d.showModal();};};
  });}
};

window.addEventListener('DOMContentLoaded',()=>{
  TombScene.stage=document.getElementById('stage');
  TombRelics.installEarly();
  const props=document.createElement('div');props.id='tomb-props';props.setAttribute('aria-hidden','true');props.innerHTML='<img src="assets/pottery.webp" alt="" class="tomb-pottery"><canvas id="tomb-dust"></canvas>';
  TombScene.stage.insertBefore(props,document.getElementById('char-layer'));TombScene.dust=document.getElementById('tomb-dust');
  const warmth=document.createElement('div');warmth.id='tomb-warmth';warmth.setAttribute('aria-hidden','true');TombScene.stage.append(warmth);TombScene.warmth=warmth;
  const progress=document.createElement('div');progress.id='tomb-progress';document.getElementById('game').append(progress);TombScene.progress=progress;TombScene.updateProgress();
  const review=document.createElement('dialog');review.id='tomb-review';review.setAttribute('aria-labelledby','tomb-review-title');
  review.innerHTML='<span class="review-eyebrow">序幕 · 墓室初醒</span><h2 id="tomb-review-title">一星火，<br>照见千年。</h2><p>火柴已点燃，三处观察已记入墓室札记。</p><p class="review-note">本段验收：点火、移动照明、三处观察与札记。<br>下一段将制作失忆男子现身。</p><div class="review-actions"><a href="?review=tomb">重看本段</a><a href="?review=bus">回到大巴</a><button id="tomb-review-notes">查看札记</button><button id="tomb-review-continue">继续后续原版 →</button></div>';
  document.body.append(review);TombScene.review=review;
  new MutationObserver(()=>StreetScene.syncPause?.()).observe(review,{attributes:true,attributeFilter:['open']});
  window.addEventListener('resize',()=>{if(TombScene.stage.dataset.scene==='bg-tomb')TombScene.layout();});
  setTimeout(()=>{const notes=document.createElement('button');notes.className='book-tab';notes.textContent='墓室札记';notes.onclick=()=>TombScene.showNotes();Engine.els.bookTabs.prepend(notes);TombScene.notesTab=notes;},0);
  if(TombScene.reviewMode&&!StoryHistory.hasRequest())setTimeout(async()=>{
    await Promise.all(['assets/tomb.webp','assets/pottery.webp'].map(src=>new Promise(resolve=>{const image=new Image();image.onload=image.onerror=resolve;image.src=src;})));
    Engine.player={name:'游客',gender:'f'};Engine.start('tour',SCRIPT.findIndex(n=>n.id==='tomb-dark'));Engine.addItem('火柴');
  },0);
});

/* Shared tomb discoveries stay in the room and its camera, not item cards. */
const TombRelics={
  jadeAnchor:{x:.73,y:.78},
  state(){return Engine.memories.live||(Engine.memories.live={});},
  point(anchor){const f=TombScene.frame||{x:0,y:0,w:innerWidth,h:innerHeight};return{x:f.x+f.w*anchor.x,y:f.y+f.h*anchor.y};},
  inLight(p){const radius=Engine._lightLevel==='torch'?Math.min(220,SETTINGS.torchRadius*.7):Math.min(105,SETTINGS.matchRadius*.75);return Math.hypot((Engine._lx??innerWidth/2)-p.x,(Engine._ly??innerHeight/2)-p.y)<radius;},
  makeJade(){const b=document.createElement('button');b.className='tomb-loose-jade';b.setAttribute('aria-label','拾起尘土里的玉蝉');b.append(buildAsset('item-yuchan','item'));b.ondragstart=e=>e.preventDefault();return b;},
  installEarly(){
    const b=this.makeJade();b.id='tomb-early-jade';b.hidden=true;TombScene.stage.append(b);this.early=b;this.earlyDwell=0;
    b.onpointerdown=e=>{e.stopPropagation();Engine.pointerMove(e.clientX,e.clientY);};b.onfocus=()=>{const p=this.point(this.jadeAnchor);Engine.pointerMove(p.x,p.y);};
    b.onclick=e=>{e.stopPropagation();if(Engine.isReadingModal()||this.earlyDwell<400)return;this.state().jadeFound=true;Progress.resources();b.hidden=true;AudioFX.advance();Engine.hint('你收好这枚冰凉的玉器。它的回声，还不甚清楚。');};
  },
  syncEarly(dt){
    const b=this.early;if(!b||!Engine.mode)return;const stage=TombScene.stage,node=Engine.currentNode||{};
    const visible=stage.dataset.scene==='bg-tomb'&&TombScene.lit&&!stage.classList.contains('tomb-relics')&&!this.state().jadeFound&&!Engine.els.dlg.classList.contains('show')&&!Engine.isReadingModal()&&['tomb-lit','tomb-observe','meet','torch','act2-tomb','act4-tomb'].includes(node.id);
    b.hidden=!visible;if(!visible){this.earlyDwell=0;return;}const p=this.point(this.jadeAnchor);b.style.left=p.x+'px';b.style.top=p.y+'px';b.style.setProperty('--jade-world-size',Math.max(18,Math.min(36,TombScene.frame.w*.024))+'px');
    const near=this.inLight(p);if(!document.hidden)this.earlyDwell=near?Math.min(450,this.earlyDwell+dt):0;b.style.opacity=near?'1':'.035';b.setAttribute('aria-disabled',String(this.earlyDwell<400));
  },
  animate(ms,render){return new Promise(resolve=>{let elapsed=0,last=performance.now();const tick=now=>{const dt=Math.min(70,now-last);last=now;if(!Engine.isReadingModal()&&!document.hidden){elapsed+=dt;render(Math.min(1,elapsed/ms));}if(elapsed>=ms)resolve();else requestAnimationFrame(tick);};requestAnimationFrame(tick);});},
  open(kind){
    Engine.hideDlg();Engine.hint('');Engine.fast=false;Engine.els.dlgFast.classList.remove('on');Engine.setBg('bg-tomb');Engine.setChars([]);TombScene.lit=true;Engine.setLight('torch');
    const layer=document.getElementById('minigame-layer');layer.replaceChildren();layer.classList.add('show');const root=document.createElement('section');root.className='tomb-discovery';root.dataset.kind=kind;root.dataset.view='search';root.setAttribute('aria-label',kind==='jade'?'举火寻找玉蝉':'举火察看陶罐');
    const caption=document.createElement('p');caption.className='relic-caption';caption.setAttribute('role','status');root.append(caption);layer.append(root);TombScene.stage.classList.add('tomb-relics');TombScene.stage.style.setProperty('--relic-push','0');
    const finish=resolve=>{TombScene.stage.classList.remove('tomb-relics');TombScene.stage.style.removeProperty('--relic-push');FirstMemory.close(layer,resolve);};return{root,caption,finish};
  },
  findJade(){return new Promise(resolve=>{
    const {root,caption,finish}=this.open('jade'),held=!!this.state().jadeFound,b=this.makeJade();root.append(b);let dwell=held?450:0,busy=false,alive=true,last=performance.now(),raf=0;
    if(held){b.setAttribute('aria-label','将收好的玉蝉移近火光');caption.textContent='你取出先前收好的玉蝉，火光映着它的纹路。';}
    const anchor=held?{x:.5,y:.66}:this.jadeAnchor;
    const layout=()=>{const p=this.point(anchor);b.style.left=p.x+'px';b.style.top=p.y+'px';b.style.setProperty('--jade-world-size',(held?48:Math.max(18,Math.min(36,TombScene.frame.w*.024)))+'px');return p;};
    b.onpointerdown=e=>{e.stopPropagation();Engine.pointerMove(e.clientX,e.clientY);};b.onfocus=()=>{const p=layout();Engine.pointerMove(p.x,p.y);};
    root.onpointerdown=e=>{if(!e.target.closest('button'))Engine.pointerMove(e.clientX,e.clientY);};
    b.onclick=async()=>{if(busy||dwell<400||Engine.isReadingModal())return;busy=true;this.state().jadeFound=true;this.state().jadeAwakened=true;Progress.resources();b.disabled=true;caption.textContent='指腹触到冰凉的纹路，远处传来一声轻叹。';AudioFX.echo(true);const from=layout();root.dataset.view='lifting';
      await this.animate(TombScene.reducedMotion?250:1000,p=>{const ease=p*p*(3-2*p);b.style.left=(from.x+(innerWidth*.5-from.x)*ease)+'px';b.style.top=(from.y+(innerHeight*.48-from.y)*ease)+'px';b.style.setProperty('--jade-world-size',(held?48:32)+ease*40+'px');});alive=false;cancelAnimationFrame(raf);finish(resolve);
    };
    const tick=now=>{if(!alive||!root.isConnected)return;const dt=Math.min(70,now-last);last=now;if(!busy){const p=layout(),near=held||this.inLight(p);if(!Engine.isReadingModal()&&!document.hidden)dwell=near?Math.min(450,dwell+dt):0;b.style.opacity=near?'1':'.035';b.setAttribute('aria-disabled',String(dwell<400));}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  });},
  fragments(){if(this.state().fragments?.length===3&&Refinements.experience().fragmentFocus)return Promise.resolve();return new Promise(resolve=>{
    const {root,caption,finish}=this.open('fragments'),exp=Refinements.experience(),legacy=this.state().fragments||[],read=new Set(exp.fragmentReads||(legacy.length===3?[0,1]:[]));
    let view='search',dwell=0,last=performance.now(),raf=0,busy=false,alive=true;const pot=document.createElement('button');pot.className='relic-pot';pot.setAttribute('aria-label','俯身察看陶罐口的残竹');pot.innerHTML='<i></i><i></i>';root.append(pot);const initial=this.point({x:.33,y:.60});Object.assign(pot.style,{left:initial.x+'px',top:initial.y+'px',width:Math.max(55,TombScene.frame.w*.11)+'px',height:Math.max(55,TombScene.frame.h*.16)+'px'});
    const close=document.createElement('img');close.className='relic-pot-close';close.src='assets/bg-pottery-close.webp';close.alt='俯身看向同一陶罐，罐口露出断竹，脚边是碎陶与尘土';root.prepend(close);
    const pieces=document.createElement('div');pieces.className='relic-fragments';pieces.hidden=true;root.append(pieces);
    const facts=[{key:'praise',text:'朕甚嘉之',note:'前一段还在称许他的作为。'},{key:'sentence',text:'即速行刑',note:'后一段却催促立刻行刑。'}];
    const buttons=[];const sync=()=>{exp.fragmentReads=[...read];Progress.resources();root.dataset.read=String(read.size);};
    const paint=(canvas,index,revealed)=>{canvas.width=170;canvas.height=490;const g=canvas.getContext('2d');g.beginPath();g.moveTo(18,14);g.lineTo(130,0);g.lineTo(158,50);g.lineTo(149,155);g.lineTo(165,322);g.lineTo(143,465);g.lineTo(38,489);g.lineTo(9,426);g.lineTo(20,275);g.lineTo(0,138);g.closePath();g.save();g.clip();const wood=g.createLinearGradient(0,0,170,0);wood.addColorStop(0,'#80603a');wood.addColorStop(.3,'#b89b65');wood.addColorStop(.7,'#a18654');wood.addColorStop(1,'#665137');g.fillStyle=wood;g.fillRect(0,0,170,490);for(let x=6;x<170;x+=13){g.strokeStyle=x%2?'#443b2922':'#ede0af22';g.lineWidth=1;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x-7,150,x+10,290,x-3,490);g.stroke();}g.strokeStyle='#68513188';g.lineWidth=2;for(const x of [55,113]){g.beginPath();g.moveTo(x,0);g.lineTo(x-3,490);g.stroke();}g.fillStyle='#1f251f';g.beginPath();g.ellipse(125,55,6,11,0,0,Math.PI*2);g.fill();if(revealed){g.font='39px serif';g.textAlign='center';[...facts[index].text].forEach((c,i)=>g.fillText(c,83,134+i*72));}else{g.strokeStyle='#463b2b66';g.lineWidth=3;for(let i=0;i<5;i++){g.beginPath();g.moveTo(40,110+i*65);g.lineTo(114,89+i*65);g.stroke();}g.fillStyle='#c3ae7a77';g.fillRect(0,0,170,490);}g.restore();g.strokeStyle='#4a3a25';g.lineWidth=4;g.stroke();};
    facts.forEach((fact,i)=>{const b=document.createElement('button');b.className='relic-fragment';b.dataset.fragment=i;b.setAttribute('aria-label','翻看第'+(i+1)+'片残简');const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');b.append(canvas);pieces.append(b);buttons.push(b);b.dataset.fragment=facts[i].key;b.classList.toggle('read',read.has(i));if(read.has(i))b.setAttribute('aria-label','残简：'+facts[i].text);paint(canvas,i,read.has(i));
      b.onclick=async()=>{if(busy||view!=='close'||Engine.isReadingModal())return;if(!read.has(i)){read.add(i);b.classList.add('read');b.setAttribute('aria-label','残简：'+fact.text);paint(canvas,i,true);AudioFX.advance();caption.textContent=read.size===2?'一处写“朕甚嘉之”，一处却催“即速行刑”。为何前后态度截然不同？再触碰你想追问的那片残简。':fact.note+'再看看另一片。';sync();return;}if(read.size<2){caption.textContent='另一片的绳孔与这片相接。先看看它写了什么。';return;}
        busy=true;exp.fragmentFocus=fact.key;this.state().fragments=[0,1,2];sync();await Engine.showLines([{cls:'thought',name:'你',text:i===0?'前面还在称许，为什么忽然变成了死刑？':'这道命令这样急，他当时来得及替自己辩白吗？'}],{log:null,chars:[]});alive=false;cancelAnimationFrame(raf);finish(resolve);
      };
    });
    pot.onpointerdown=e=>{e.stopPropagation();Engine.pointerMove(e.clientX,e.clientY);};pot.onfocus=()=>{const p=this.point({x:.33,y:.60});Engine.pointerMove(p.x,p.y);};root.onpointerdown=e=>{if(!e.target.closest('button'))Engine.pointerMove(e.clientX,e.clientY);};
    const settled=()=>{view='close';root.dataset.view=view;pieces.hidden=false;pot.hidden=true;busy=false;exp.fragmentLocated=true;sync();caption.textContent=read.size===2?'两句相反的话，来自同一卷竹简。触碰你最想追问的一句。':'断绳间露出墨迹。翻看它们，看看原来写着什么。';};
    pot.onclick=async()=>{if(busy||dwell<400||Engine.isReadingModal())return;busy=true;view='push';root.dataset.view=view;pot.disabled=true;Engine.setLight(null);AudioFX.advance();try{await close.decode();}catch(_){busy=false;view='search';root.dataset.view=view;pot.disabled=false;Engine.setLight('torch');caption.textContent='近处还未看清，稍候再俯身看看。';return;}await this.animate(TombScene.reducedMotion?300:1700,p=>{const ease=p*p*(3-2*p);TombScene.stage.style.setProperty('--relic-push',TombScene.reducedMotion?0:ease);root.style.setProperty('--relic-blend',Math.max(0,(p-.4)/.6));});settled();};
    const tick=now=>{if(!alive||!root.isConnected)return;const dt=Math.min(70,now-last);last=now;if(view==='search'){const p=this.point({x:.33,y:.60});pot.style.left=p.x+'px';pot.style.top=p.y+'px';pot.style.width=Math.max(55,TombScene.frame.w*.11)+'px';pot.style.height=Math.max(55,TombScene.frame.h*.16)+'px';const near=this.inLight(p);if(!Engine.isReadingModal()&&!document.hidden)dwell=near?Math.min(450,dwell+dt):0;pot.style.setProperty('--splinter-opacity',near?'.8':'.025');pot.setAttribute('aria-disabled',String(dwell<400));}raf=requestAnimationFrame(tick);};sync();if(exp.fragmentLocated){view='push';busy=true;pot.disabled=true;Engine.setLight(null);close.decode().then(()=>{TombScene.stage.style.setProperty('--relic-push',TombScene.reducedMotion?0:1);root.style.setProperty('--relic-blend',1);settled();}).catch(()=>{view='search';busy=false;pot.disabled=false;Engine.setLight('torch');});}raf=requestAnimationFrame(tick);
  });}
};
