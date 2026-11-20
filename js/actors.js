/* Authored blocking, viewer focus, and a separate full-body memory veil. */
'use strict';
const Actors={
  models:new Map(),last:0,focused:null,observing:false,
  layouts:{
    'bg-tent':[[32,8,81,40],[62,10,73,37]],'bg-feast':[[38,12,66,34],[65,13,65,34]],
    'bg-censer':[[29,10,69,36],[59,9,78,40]],'bg-fenghuan':[[60,9,74,38]],
    'bg-fair':[[27,12,65,34],[43,10,60,32]],'bg-river':[[42,13,64,34],[63,12,61,32]],
    'bg-tower':[[37,10,70,37],[64,11,73,38]],'bg-shufang':[[42,9,76,38],[68,8,68,36]],
    'bg-proclaim':[[57,7,88,43],[26,11,69,35]],'bg-prison':[[43,8,78,40],[69,9,68,37]],
    'bg-coffin':[[39,11,70,37],[65,10,68,36]],'bg-funeral':[[58,16,58,31]],
    'bg-que-built':[[58,10,65,35]],'bg-shuangque':[[58,8,83,43]],
    'bg-que-today':[[43,7,81,42]],'bg-bus':[[43,5,87,45]]
  },
  ghost(id,bg){return ['stranger','fenghuan'].includes(id)&&['bg-tomb','bg-shuangque'].includes(bg);},
  veil(){const phase=SCRIPT.slice(0,(Engine.currentIndex||0)+1).filter(n=>n.type==='intertitle').length-1;return [1,.88,.65,.42,.22,.12,0,0][Math.max(0,phase)]||0;},
  position(id,index,bg){
    const mobile=innerWidth<700;
    let p=this.ghost(id,bg)?[55,0,96,54]:(this.layouts[bg]?.[index]||[[32,9,75,37],[67,10,72,37]][index%2]);
    p=[...p];if(mobile){p[0]=this.ghost(id,bg)?53:Math.max(22,Math.min(78,p[0]));p[2]*=.84;p[3]=this.ghost(id,bg)?90:Math.max(55,p[3]*1.5);if(this.ghost(id,bg))p[2]=97;}
    return p;
  },
  build(chars,base){
    if(this.observing)this.observe(false);
    const bg=Engine.els.stage.dataset.scene,previous=this.models;this.models=new Map();this.focused=null;
    const mapped=chars.map(c=>this.ghost(c.id,bg)?{...c,asset:'char-stranger-front'}:bg==='bg-funeral'&&c.id==='fenggun'?{...c,asset:'char-fenggun-back'}:c);base(mapped);
    Engine.els.stage.classList.toggle('actor-scene',mapped.some(c=>c.id!=='oldlady'));
    mapped.forEach((c,index)=>{
      if(c.id==='oldlady')return;
      const el=document.getElementById('char-'+c.id),fig=el.querySelector('.asset-char'),path=document.createElement('div'),body=document.createElement('div');
      path.className='actor-path';body.className='actor-body';fig.replaceWith(path);path.append(body);body.append(fig);
      const mist=document.createElement('div');mist.className='actor-fog';mist.setAttribute('aria-hidden','true');mist.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i>';body.append(mist);
      el.classList.add('staged-actor');const isGhost=this.ghost(c.id,bg);el.classList.toggle('tomb-presence',isGhost);el.style.setProperty('--veil',isGhost?this.veil():0);
      const target=this.position(c.id,index,bg),old=previous.get(c.id);
      const start=isGhost?[...target]:old?[...old.current]:[target[0]+(index%2?16:-16),target[1],target[2]*.94,target[3]];
      const model={id:c.id,el,path,body,base:target,target:[...target],current:start,lean:0,acted:new Set()};this.models.set(c.id,model);
      el.setAttribute('role','img');el.tabIndex=-1;el.setAttribute('aria-label',CHAR_DEFS[c.id]?.name||'人物');
      el.onpointerdown=e=>{if(this.observing)e.stopPropagation();};el.onclick=e=>{if(this.observing){e.stopPropagation();this.focus(c.id);}};el.onkeydown=e=>{if(this.observing&&(e.code==='Enter'||e.code==='Space')){e.preventDefault();e.stopPropagation();this.focus(c.id);}};
      this.paint(model);
    });
    this.notice.hidden=true;
  },
  observe(open){if(open&&(!this.models.size||this.otherModal()))return;this.observing=open;this.focused=null;this.retarg();document.getElementById('game').classList.toggle('actor-observation',open);this.observeButton.textContent=open?'返回对话':'观察人物';this.observeButton.setAttribute('aria-pressed',String(open));for(const m of this.models.values()){m.el.setAttribute('role',open?'button':'img');m.el.tabIndex=open?0:-1;}this.notice.hidden=!open;this.notice.textContent=open?'观察中 · 点选人物近看 · Esc 返回对话':'';StreetScene.syncPause?.();if(typeof AudioFX!=='undefined'&&AudioFX.refresh)AudioFX.refresh();},
  focus(id){if(!this.observing||this.otherModal())return;if(this.ghost(id,Engine.els.stage.dataset.scene))return;this.focused=this.focused===id?null:id;this.retarg();this.notice.hidden=false;this.notice.textContent=this.focused?'近看人物 · 再点人物退回 · Esc 返回对话':'观察中 · 点选人物近看 · Esc 返回对话';},
  retarg(){for(const m of this.models.values()){
    m.target=[...m.base];m.el.setAttribute('aria-pressed',String(m.id===this.focused));m.el.classList.toggle('actor-observed',m.id===this.focused);
    if(this.ghost(m.id,Engine.els.stage.dataset.scene)){m.current=[...m.base];continue;}
    if(this.focused===m.id){m.target[0]=50;m.target[2]=Math.min(110,m.base[2]*1.15);m.target[3]=Math.min(100,m.base[3]*1.18);}
    else if(this.focused){m.target[0]+=m.target[0]<50?-9:9;m.target[2]*=.94;}
  }},
  cue(line){
    if(this.focused)return;this.retarg();const id=line.speaker==='ajie'&&!this.models.has('ajie')?'ajie0':line.speaker;
    for(const m of this.models.values()){m.el.classList.toggle('actor-speaking',m.id===id);m.lean=0;m.body.dataset.gesture='listen';}
    if(line.cls==='narration'&&/带走|渐渐远去/.test(line.text||'')){const leaving=this.models.get('stranger')||this.models.get('fenghuan');if(leaving){leaving.target[0]-=15;leaving.target[2]*=.85;leaving.el.classList.add('actor-departing');}}
    const m=this.models.get(id);if(!m)return;
    if(this.ghost(id,Engine.els.stage.dataset.scene))return;
    m.body.dataset.gesture='speak';
    if(line.pose==='angry'){m.target[0]+=(50-m.base[0])*.18;m.lean=-2;m.body.dataset.gesture='challenge';}
    if(line.pose==='think'){m.lean=2;m.body.dataset.gesture='consider';}
    const text=line.text||'';
    if(id==='fenggun'&&/恳请|几句话/.test(text)&&!m.acted.has('plead')){m.acted.add('plead');m.base[0]+=7;m.target[0]=m.base[0];m.lean=2;m.body.dataset.gesture='plead';}
    if(/请吧/.test(text)&&id==='pangfen'){const other=this.models.get('stranger');if(other){other.target[0]-=6;other.target[2]-=3;}m.target[0]-=4;}
    if(/剧烈咳嗽|闭着眼睛/.test(line.label||'')){m.lean=4;m.target[2]-=2;m.body.dataset.gesture='weary';}
    if(Engine.currentNode?.id==='final-que'&&/再见|走了|告辞/.test(text)&&id==='fenghuan'){m.target[0]=52;m.target[2]=m.base[2]*.7;m.el.classList.add('actor-departing');}
  },
  paint(m){const[x,b,h,w]=m.current;Object.assign(m.el.style,{left:x+'%',right:'auto',bottom:b+'%',top:'auto',height:h+'vh',width:w+'vw',transform:'translateX(-50%)'});m.body.style.setProperty('--actor-lean',m.lean+'deg');},
  tick(now){const dt=this.last?Math.min(60,now-this.last):16;this.last=now;this.observeButton.hidden=!this.models.size||document.getElementById('minigame-layer').classList.contains('show')||Engine.els.title.classList.contains('show');if(!document.hidden&&(!Engine.isReadingModal()||this.observing&&!this.otherModal()))for(const m of this.models.values()){
    for(let i=0;i<4;i++)m.current[i]+= (m.target[i]-m.current[i])*(TombScene.reducedMotion?1:1-Math.exp(-dt/290));this.paint(m);
  }this.raf=requestAnimationFrame(t=>this.tick(t));},
  install(){
    const notice=document.createElement('p');notice.id='actor-focus-note';notice.hidden=true;notice.setAttribute('role','status');document.getElementById('game').append(notice);this.notice=notice;
    const button=document.createElement('button');button.id='actor-observe';button.textContent='观察人物';button.setAttribute('aria-pressed','false');button.onclick=()=>this.observe(!this.observing);document.getElementById('game').append(button);this.observeButton=button;const reading=Engine.isReadingModal.bind(Engine);this.otherModal=reading;Engine.isReadingModal=()=>this.observing||reading();
    const base=Engine.setChars.bind(Engine);Engine.setChars=chars=>this.build(chars||[],base);
    const render=Engine.renderLine.bind(Engine);Engine.renderLine=(line,ctx,auto,meta)=>{const result=render(line,ctx,auto,meta);this.cue(line);return result;};
    EncounterScene.scare=async()=>{Engine.els.stage.classList.add('encounter');Engine.hideDlg();Engine.hint('墓室深处，一团模糊的黑影正向你靠近。');Engine.setChars([{id:'stranger',slot:'center',asset:'char-stranger-front'}]);AudioFX.whoosh();await TombScene.wait(TombScene.reducedMotion?150:1200);};
    document.addEventListener('keydown',e=>{if(e.code==='Escape'&&this.observing&&!this.otherModal())this.observe(false);});
    window.addEventListener('resize',()=>{let index=0;for(const m of this.models.values())m.base=this.position(m.id,index++,Engine.els.stage.dataset.scene);this.retarg();});
    this.raf=requestAnimationFrame(t=>this.tick(t));
  }
};
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>Actors.install(),0));
