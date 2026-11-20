/* Local checkpoints: full story and chapter previews never share writes. */
'use strict';
const Progress = {
  key:'qxgr_story_v1', version:1, pending:null, available:true,
  get preview(){const q=new URLSearchParams(location.search);return q.has('chapter')||q.has('review');},
  signature(){if(this._signature)return this._signature;let h=2166136261;for(const ch of JSON.stringify(SCRIPT))h=Math.imul(h^ch.charCodeAt(0),16777619);return this._signature=(h>>>0).toString(16)+'-first-memory-1';},
  nodeKey(index){const n=SCRIPT[index];return n&&[n.type,n.id||n.title||n.logId||n.asset||'',index].join(':');},
  snapshot(){return {
    mode:Engine.mode,player:{...Engine.player},hp:Engine.hp,items:[...Engine.items],collected:[...Engine.collected],
    logs:JSON.parse(JSON.stringify(Engine.logs)),memories:JSON.parse(JSON.stringify(Engine.memories||{})),
    lit:TombScene.lit,notes:[...TombScene.records.keys()],
    scene:{bg:Engine.els.stage.dataset.scene||null,chars:Engine.sceneChars||[],light:Engine._lightLevel||null,encounter:Engine.els.stage.classList.contains('encounter')}
  };},
  begin(from=0){this.pending=null;TombScene.records.clear();TombScene.lit=SCRIPT.slice(0,from).some(n=>n.id==='strike-match');TombScene.updateProgress();},
  enter(index){
    if(this.preview||!Engine.mode)return;
    this.pending={version:this.version,story:this.signature(),index,nodeKey:this.nodeKey(index),line:Engine._nodePhase?0:(Engine._resumeLine||0),phase:Engine._nodePhase||'',spoken:false,state:this.snapshot(),savedAt:Date.now()};
    this.flush();
  },
  line(index){if(typeof StoryHistory!=='undefined')StoryHistory.line(index);if(this.preview||!this.pending)return;this.pending.line=index;this.pending.spoken=true;this.pending.state=this.snapshot();this.flush();},
  resources(){
    if(this.preview||!this.pending)return;
    // Do not copy logs here: the current sentence has already entered the live log,
    // but its checkpoint deliberately replays it from its pre-log state.
    Object.assign(this.pending.state,{hp:Engine.hp,items:[...Engine.items],collected:[...Engine.collected],memories:JSON.parse(JSON.stringify(Engine.memories||{})),lit:TombScene.lit,notes:[...TombScene.records.keys()]});
    this.flush();
  },
  flush(){
    if(this.preview||!this.pending)return;
    this.pending.savedAt=Date.now();
    try{localStorage.setItem(this.key,JSON.stringify(this.pending));this.available=true;}
    catch(e){this.available=false;}
    const label=this.available?'进度已自动保存':'当前浏览器无法保存进度';if(this.status&&this.status.textContent!==label)this.status.textContent=label;
  },
  validate(save){
    if(!save||save.version!==this.version||save.story!==this.signature()||!Number.isFinite(save.savedAt)||!Number.isInteger(save.index)||save.index<0||save.index>=SCRIPT.length||save.nodeKey!==this.nodeKey(save.index))return null;
    const s=save.state,n=SCRIPT[save.index];if(save.phase&&(!StoryHistory.validPhase(save.phase,n)||save.line!==0))return null;if(!s||!['tour','detective'].includes(s.mode)||!s.player||typeof s.player.name!=='string'||!['f','m'].includes(s.player.gender)||!Number.isFinite(s.hp)||s.hp<0||s.hp>SETTINGS.hpMax)return null;
    if(!Array.isArray(s.items)||s.items.some(x=>!['火柴','火把'].includes(x))||!Array.isArray(s.collected)||s.collected.some(x=>!Object.hasOwn(EVIDENCE_DEFS,x)))return null;
    if(!Number.isInteger(save.line)||save.line<0||save.spoken!==undefined&&typeof save.spoken!=='boolean')return null;
    const lines=typeof Chapters!=='undefined'?Chapters.cleanNode(n).lines:n.lines;
    if(save.line>0&&(n.type!=='scene'||n.id==='bus'||save.line>=(lines||[]).length))return null;
    if(!s.logs||typeof s.logs!=='object'||Array.isArray(s.logs)||Object.keys(s.logs).some(k=>!/^act[1-6]$/.test(k)))return null;
    if(Object.values(s.logs).some(rows=>!Array.isArray(rows)||rows.length>500||rows.some(row=>!row||typeof row.text!=='string'||row.text.length>12000)))return null;
    if(!s.scene||s.scene.bg&&!Object.hasOwn(ASSETS,s.scene.bg)||!Array.isArray(s.scene.chars)||s.scene.chars.length>4||s.scene.chars.some(c=>!c||!Object.hasOwn(ASSETS,c.asset)||!['left','right','center'].includes(c.slot)||!Object.hasOwn(CHAR_DEFS,c.id)))return null;
    if(![null,'match','torch'].includes(s.scene.light))return null;
    const points=SCRIPT.find(x=>x.id==='tomb-observe').points.map(p=>p.label);
    if(!Array.isArray(s.notes)||s.notes.some(x=>!points.includes(x)))return null;
    const m=s.memories;if(!m||typeof m!=='object'||Array.isArray(m)||JSON.stringify(m).length>5000)return null;
    if(m.relief&&(!Array.isArray(m.relief.seen)||m.relief.seen.some(x=>!['horse','blade','wheel'].includes(x))||!Array.isArray(m.relief.cells)||m.relief.cells.some(x=>!Number.isInteger(x)||x<0||x>=180)))return null;
    if(m.relief&&['returnFound','returnPlaced'].some(k=>m.relief[k]!==undefined&&typeof m.relief[k]!=='boolean'))return null;
    if(m.relief?.observeMs!==undefined&&(!Number.isFinite(m.relief.observeMs)||m.relief.observeMs<0||m.relief.observeMs>20000))return null;
    if(m.plan&&Object.entries(m.plan).some(([k,v])=>!['fire','drums','army'].includes(k)||typeof v!=='boolean'))return null;
    if(m.act1&&!['strategy','integrity','people'].includes(m.act1))return null;
    if(m.experience?.musicObserveMs!==undefined&&(!Number.isFinite(m.experience.musicObserveMs)||m.experience.musicObserveMs<0||m.experience.musicObserveMs>12000))return null;
    if(m.experience){const e=m.experience;if(['riverReleased','wineLocated','fairHouseHeard'].some(k=>e[k]!==undefined&&typeof e[k]!=='boolean'))return null;if(e.riverWishDraft!==undefined&&(typeof e.riverWishDraft!=='string'||e.riverWishDraft.length>40))return null;if(e.riverDriftMs!==undefined&&(!Number.isFinite(e.riverDriftMs)||e.riverDriftMs<0||e.riverDriftMs>6000))return null;if(e.riverDrop&&(!Number.isFinite(e.riverDrop.x)||!Number.isFinite(e.riverDrop.y)||e.riverDrop.x<0||e.riverDrop.x>1||e.riverDrop.y<0||e.riverDrop.y>1))return null;if(e.wineVolume!==undefined&&(!Number.isFinite(e.wineVolume)||e.wineVolume<0||e.wineVolume>1))return null;}
    if(m.live){const l=m.live;if(['jadeFound','jadeAwakened'].some(k=>l[k]!==undefined&&typeof l[k]!=='boolean'))return null;if(typeof l!=='object'||Array.isArray(l))return null;const lists={censer:['bird','body','feet'],fair:['stage','fields','river'],fragments:[0,1,2],tears:Array.from({length:96},(_,i)=>i),inscription:Array.from({length:10},(_,i)=>i)};for(const[key,allowed]of Object.entries(lists))if(l[key]&&(!Array.isArray(l[key])||l[key].some(x=>!allowed.includes(x))))return null;for(const k of ['writing','reasoning'])if(l[k]!==undefined&&(!Number.isInteger(l[k])||l[k]<0||l[k]>3))return null;if(l.prayer!==undefined&&(typeof l.prayer!=='string'||!l.prayer.trim()||l.prayer.length>40))return null;}
    if(m.experience){const e=m.experience;if(e.censerBeat!==undefined&&!['wide','close','open','inside','tended'].includes(e.censerBeat))return null;if(e.censerFuel!==undefined&&typeof e.censerFuel!=='boolean')return null;if(e.censerHeat!==undefined&&(!Number.isFinite(e.censerHeat)||e.censerHeat<0||e.censerHeat>1.2))return null;if(e.finalWords&&(!Array.isArray(e.finalWords)||e.finalWords.length>3||e.finalWords.some(k=>!['regret','wrong','late'].includes(k))))return null;if(e.fragmentReads&&(!Array.isArray(e.fragmentReads)||e.fragmentReads.length>2||e.fragmentReads.some(i=>![0,1].includes(i))))return null;if(e.fragmentFocus!==undefined&&!['praise','sentence'].includes(e.fragmentFocus))return null;if(e.fragmentLocated!==undefined&&typeof e.fragmentLocated!=='boolean')return null;if(typeof e!=='object'||Array.isArray(e))return null;for(const k of ['markedLetter','markedEdict'])if(e[k]!==undefined&&(!Number.isInteger(e[k])||e[k]<0||e[k]>=SCRIPT.find(n=>n.id===(k==='markedLetter'?'act2-mingtie':'act4-zhaoshu')).lines.length))return null;if(e.petitionBasis&&(!Array.isArray(e.petitionBasis)||e.petitionBasis.some(id=>!['act4-kin','act4-plot','act1-char'].includes(id))))return null;if(e.deployment&&(typeof e.deployment!=='object'||Array.isArray(e.deployment)||Object.entries(e.deployment).some(([k,v])=>!['fire','drums','army'].includes(k)||!['grain','east','seam'].includes(v))))return null;if(e.reflection&&(typeof e.reflection!=='object'||Array.isArray(e.reflection)||Object.entries(e.reflection).some(([k,v])=>!['regret','wrong','late'].includes(k)||!['act3-exp','act4-plot','act5-end'].includes(v))))return null;}
    return save;
  },
  read(){
    try{const raw=localStorage.getItem(this.key);if(!raw)return null;if(raw.length>300000)return null;return this.validate(JSON.parse(raw));}
    catch(e){return null;}
  },
  restore(save){
    const s=save.state;Engine.mode=s.mode;Engine.player={name:s.player.name.slice(0,8),gender:s.player.gender};Engine.hp=s.hp>0?s.hp:SETTINGS.hpMax;
    Engine.items=new Set(s.items);Engine.collected=new Set(s.collected);Engine.logs=JSON.parse(JSON.stringify(s.logs));Engine.memories=JSON.parse(JSON.stringify(s.memories));
    TombScene.lit=!!s.lit;TombScene.records.clear();for(const p of SCRIPT.find(n=>n.id==='tomb-observe').points)if(s.notes.includes(p.label))TombScene.records.set(p.label,p.text);TombScene.updateProgress();
    Engine.setBg(s.scene.bg);Engine.setChars(s.scene.chars);Engine.setLight(s.scene.light);Engine.els.stage.classList.toggle('encounter',!!s.scene.encounter);
    if(s.scene.bg==='bg-bus'&&SCRIPT[save.index].id!=='bus')BusScene.arrive();
    Engine.els.bookBadge.textContent=Engine.collected.size||'';
  },
  describe(save){let title='序幕';for(let i=0;i<=save.index;i++)if(SCRIPT[i].type==='intertitle')title=SCRIPT[i].title+' · '+SCRIPT[i].sub;return title+' / '+(save.state.mode==='tour'?'游览':'探案');},
  confirmNewGame(){
    if(!this.read()||this.preview)return Promise.resolve(true);
    return new Promise(resolve=>{const d=document.getElementById('restart-confirm');d.showModal();let yes=false;d.querySelector('[data-restart]').onclick=()=>{yes=true;d.close();};d.querySelector('[data-cancel]').onclick=()=>d.close();d.addEventListener('close',()=>resolve(yes),{once:true});});
  },
  install(){
    const panel=document.createElement('div');panel.id='saved-story';
    const text=document.createElement('p'),button=document.createElement('button');button.textContent='续上这场梦';panel.append(text,button);document.getElementById('btn-start').before(panel);
    const save=this.read();panel.hidden=!save||this.preview;
    if(save){text.textContent=this.describe(save)+' · '+new Date(save.savedAt).toLocaleString('zh-CN');document.getElementById('btn-start').textContent='填写名字，开始新故事';}
    button.onclick=()=>{const latest=this.read();if(!latest){text.textContent='这份进度无法读取，请开始新故事。';return;}AudioFX.unlock();Engine.start(latest.state.mode,latest.index,latest);};
    const d=document.createElement('dialog');d.id='restart-confirm';d.innerHTML='<h2>重新开始这场梦？</h2><p>当前故事进度会被新故事替换。</p><button data-cancel>保留进度</button><button data-restart>重新开始</button>';document.body.append(d);
    const status=document.createElement('p');status.id='save-status';status.setAttribute('role','status');status.textContent=this.preview?'章节预览 · 不覆盖正式进度':'';document.getElementById('game').append(status);this.status=status;
    if(this.preview)status.classList.add('preview-status');
    window.addEventListener('pagehide',()=>this.flush());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.flush();});
  }
};
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{Progress.install();StoryHistory.install();},0));


/* Chapter-local undo checkpoints. Re-enter through the normal engine after a clean reload,
   so timers, audio, pointer capture and scene animations cannot survive an abandoned step. */
const StoryHistory={
  steps:[],pool:{},chapter:-1,busy:false,seed:null,key:'qxgr_rewind_request',
  phases:{censer:'act2-study2',camp:'camp',tactics:'tent',fair:'act3-fair',lantern:'act3-river',reasoning:'recall9',sendoff:'final-que'},
  validPhase(name,node){return name==='reflection'?node.type==='review'&&node.logId==='act1':Object.hasOwn(this.phases,name)&&this.phases[name]===node.id;},
  hasRequest(){try{return !!sessionStorage.getItem(this.key);}catch(_){return false;}},
  route(){const q=new URLSearchParams(location.search);q.delete('v');const search=q.toString();return location.pathname+(search?'?'+search:'');},
  storageKey(){return 'qxgr_chapter_history:'+this.route();},
  chapterOf(index){let chapter=0;for(let i=0;i<=index;i++)if(SCRIPT[i].type==='intertitle')chapter=i;return chapter;},
  eligible(node,index){
    if(['epi-white','act5-tomb2'].includes(node.id))return false;
    if(node.type==='artifact')return !['bg-zhujian','item-yuchan','bg-censer'].includes(node.asset);
    if(node.type==='transition')return SCRIPT[index-1]?.id==='stone';
    return ['scene','item','interact','minigame','observe','listen','document','writing','coffinview','jade','inscription','review','evidence-overview','spot'].includes(node.type);
  },
  begin(restored){
    this.busy=false;
    if(this.seed){this.steps=this.seed.steps;this.pool=this.seed.pool;this.chapter=this.seed.chapter;this.seed=null;}
    else {this.steps=[];this.pool={};this.chapter=-1;if(restored)this.load(restored);}
    this.sync();
  },
  load(save){
    try{const h=JSON.parse(sessionStorage.getItem(this.storageKey())||'null');
      if(!this.validHistory(h)||h.mode!==save.state.mode||h.player!==save.state.player.name||h.chapter!==this.chapterOf(save.index))return;
      this.steps=h.steps.filter(e=>e.index<save.index||e.index===save.index&&(e.phase===save.phase||!e.phase&&!save.phase&&e.line<=save.line));this.pool=h.pool;this.chapter=h.chapter;
    }catch(_){}
  },
  enter(index){
    Engine._nodePhase=Engine._nodePhase||'';
    const chapter=this.chapterOf(index);if(chapter!==this.chapter){this.steps=[];this.pool={};this.chapter=chapter;}
    if(!Engine._nodePhase&&!(Engine._resumeLine>0)&&this.eligible(SCRIPT[index],index))this.capture(index,0,'');this.sync();
  },
  line(line){if(Engine.currentIndex!==undefined)this.capture(Engine.currentIndex,line,'',true);},
  phase(name){
    const node=SCRIPT[Engine.currentIndex];if(!node||!this.validPhase(name,node))return;
    Engine._nodePhase=name;
    if(!this.steps.some(e=>e.index===Engine.currentIndex&&e.phase===name))this.capture(Engine.currentIndex,0,name);
    if(Progress.pending&&!Progress.preview){Progress.pending.phase=name;Progress.pending.line=0;Progress.pending.spoken=false;Progress.pending.state=Progress.snapshot();Progress.flush();}this.sync();
  },
  panel(cls){const name=cls.includes('battle-plan')?'tactics':cls.includes('fair-work')?'fair':cls.includes('lantern-work')?'lantern':cls.includes('farewell-work')?'sendoff':'';if(name)this.phase(name);},
  capture(index,line,phase,dialogue=false){
    if(this.busy||!Engine.mode)return;
    const state=Progress.snapshot();this.pool=state.logs;const counts=Object.fromEntries(Object.entries(state.logs).map(([key,rows])=>[key,rows.length]));delete state.logs;
    const entry={index,line,phase,dialogue,state,counts},last=this.steps.at(-1);
    if(last&&last.index===index&&last.line===line&&last.phase===phase)this.steps[this.steps.length-1]=entry;else this.steps.push(entry);
    if(this.steps.length>180)this.steps.shift();this.sync();
  },
  pack(){return{story:Progress.signature(),route:this.route(),chapter:this.chapter,mode:Engine.mode,player:Engine.player.name,steps:this.steps,pool:this.pool};},
  validHistory(h){return !!h&&h.story===Progress.signature()&&h.route===this.route()&&Array.isArray(h.steps)&&h.steps.length<=180&&h.pool&&typeof h.pool==='object'&&h.steps.every(e=>Number.isInteger(e.index)&&e.index>=0&&e.index<SCRIPT.length&&Number.isInteger(e.line)&&e.line>=0&&e.state&&e.counts&&(!e.phase||this.validPhase(e.phase,SCRIPT[e.index])));},
  save(){if(this.busy||!Engine.mode||!this.steps.length)return;try{sessionStorage.setItem(this.storageKey(),JSON.stringify(this.pack()));}catch(_){}},
  checkpoint(entry){
    const state=JSON.parse(JSON.stringify(entry.state));state.logs={};
    for(const[key,count]of Object.entries(entry.counts)){if(!Number.isInteger(count)||count<0||!Array.isArray(this.pool[key])||count>this.pool[key].length)throw Error('history logs');state.logs[key]=this.pool[key].slice(0,count);}
    return{version:Progress.version,story:Progress.signature(),index:entry.index,nodeKey:Progress.nodeKey(entry.index),line:entry.line,phase:entry.phase||'',spoken:!!entry.dialogue,state,savedAt:Date.now()};
  },
  interactionIndex(){const index=Engine.currentIndex;for(let i=this.steps.length-1;i>=0;i--){const e=this.steps[i];if(e.index!==index)break;if(e.phase||e.line===0&&(SCRIPT[index].type!=='scene'||['bus','act5-songxing'].includes(SCRIPT[index].id)))return i;}return -1;},
  resetInteraction(save){
    const node=SCRIPT[save.index],m=save.state.memories,l=m.live||(m.live={}),e=m.experience||(m.experience={});
    if(save.phase==='tactics'){m.plan={};e.deployment={};e.lastTrial=null;}
    if(save.phase==='fair')l.fair=[];
    if(save.phase==='lantern'){delete l.prayer;delete e.riverWishDraft;delete e.riverReleased;delete e.riverDriftMs;delete e.riverDrop;}
    if(save.phase==='reflection')delete m.act1;
    if(save.phase==='reasoning'){l.reasoning=0;e.finalWords=[];}
    if(node.type==='writing'){l.writing=0;delete e.petitionBasis;}
    if(node.type==='jade')l.jadePlaced=false;
    if(node.type==='coffinview')l.jadeViewed=false;
    if(node.type==='document')delete e[node.id==='act2-mingtie'?'markedLetter':'markedEdict'];
    if(node.asset==='bg-censer'||save.phase==='censer'){l.censer=[];e.lidOpen=false;delete e.censerBeat;delete e.censerFuel;delete e.censerHeat;}
    if(node.id==='act3-winepot'){e.wineShared=false;delete e.wineLocated;delete e.wineVolume;}
    if(node.id==='act4-zhujian'){l.fragments=[];e.fragmentReads=[];delete e.fragmentFocus;e.fragmentLocated=false;}
    if(node.id==='act5-yuchan')l.jadeAwakened=false;
    if(node.type==='inscription')l.inscription=[];
    if(node.id==='tomb-observe')save.state.notes=[];
    if(node.id==='strike-match')save.state.lit=false;
    if(node.asset==='bg-stone')m.relief={seen:[],cells:[],observeMs:0};
    if(node.asset==='bg-yuewu')e.musicObserveMs=0;
    if(node.type==='transition'&&SCRIPT[save.index-1]?.id==='stone'){m.relief={...m.relief,returnFound:false,returnPlaced:false};}
  },
  go(position,replay=false){
    if(this.busy||position<0||this.blocked())return;
    try{
      const entry=this.steps[position],save=this.checkpoint(entry);if(replay)this.resetInteraction(save);
      if(!Progress.validate(save))throw Error('invalid checkpoint');
      const history=this.pack();history.steps=history.steps.slice(0,position+1);history.pool=save.state.logs;
      sessionStorage.setItem(this.key,JSON.stringify({save,history}));
      this.busy=true;if(!Progress.preview){Progress.pending=save;Progress.flush();}
      if(typeof AudioFX!=='undefined'&&AudioFX.stopScene)AudioFX.stopScene();
      document.documentElement.classList.add('rewind-loading');location.reload();
    }catch(_){this.busy=false;Engine.toast('暂时无法返回，请确认浏览器允许保存本地游玩记录。','info');}
  },
  blocked(){return !!document.querySelector('dialog[open],#evidence-book.show,#document-modal.show,#overlay.show,#intertitle.show,#ending.show,#death.show,.actor-observation');},
  sync(){if(!this.nav)return;const active=!!Engine.mode;this.nav.hidden=!active;document.getElementById('game').classList.toggle('history-active',active);
    this.back.disabled=this.steps.length<2||this.busy;const last=this.steps.at(-1);this.back.textContent=last?.dialogue&&Engine.els.dlg.classList.contains('show')?'上一句':'上一步';
    this.replay.hidden=this.interactionIndex()<0;this.replay.disabled=this.busy;
  },
  async playPhase(name){
    const methods={censer:()=>Immersive.censer(),camp:()=>FirstMemory.camp(),tactics:()=>FirstMemory.tactics(),reflection:()=>FirstMemory.reflection(),fair:()=>Immersive.fair(),lantern:()=>Immersive.lantern(),reasoning:()=>Immersive.reasoning(),sendoff:async()=>{const{layer,w}=Immersive.work('暂别','让他走远一些。你可以在这里停留，准备好后再回去。','farewell-work');await new Promise(resolve=>Immersive.button(w,'回到来时的地方',()=>Immersive.finish(layer,resolve)));}};
    return methods[name]();
  },
  boot(){
    let request;try{request=JSON.parse(sessionStorage.getItem(this.key)||'null');sessionStorage.removeItem(this.key);}catch(_){}
    if(request&&this.validHistory(request.history)&&Progress.validate(request.save)){
      this.seed=request.history;AudioFX.unlock();Engine.start(request.save.state.mode,request.save.index,request.save);
    }
    requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('rewind-loading')));
  },
  install(){
    const nav=document.createElement('nav');nav.id='story-navigation';nav.setAttribute('aria-label','章内返回');nav.hidden=true;
    const back=document.createElement('button'),replay=document.createElement('button');back.id='story-back';back.textContent='上一步';back.title='回到本章上一句或上一步，同时恢复当时的进度';replay.id='story-replay';replay.textContent='重玩此处';
    back.onclick=()=>this.go(this.steps.length-2);replay.onclick=()=>this.go(this.interactionIndex(),true);nav.append(back,replay);document.getElementById('game').append(nav);this.nav=nav;this.back=back;this.replay=replay;
    new MutationObserver(()=>this.sync()).observe(Engine.els.dlg,{attributes:true,attributeFilter:['class']});
    document.addEventListener('pointerdown',()=>AudioFX.unlock(),{once:true,capture:true});
    window.addEventListener('pagehide',()=>this.save());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.save();});this.sync();
  }
};
