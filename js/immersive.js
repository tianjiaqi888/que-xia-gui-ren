/* Runtime staging and tactile chapters. */
'use strict';
const Immersive={
  phase:0,time:0,last:0,px:0,py:0,x:0,y:0,
  state(){return Engine.memories.live||(Engine.memories.live={});},
  save(){Progress.resources();},
  work(title,text,cls=''){const p=FirstMemory.panel('live-work '+cls,title,text);return p;},
  button(w,text,fn){const b=document.createElement('button');b.textContent=text;b.className='live-action';b.onclick=()=>{if(!Engine.isReadingModal())fn(b);};w.append(b);return b;},
  message(w,text){const p=document.createElement('p');p.className='live-message';p.setAttribute('aria-live','polite');p.textContent=text;w.append(p);return p;},
  finish(layer,resolve){FirstMemory.close(layer,resolve);},
  range(w,label,change,value=0){const l=document.createElement('label');l.className='live-range';l.append(document.createTextNode(label));const r=document.createElement('input');r.type='range';r.min=0;r.max=100;r.value=value;r.setAttribute('aria-label',label);r.oninput=()=>{if(!Engine.isReadingModal())change(Number(r.value));};l.append(r);w.append(l);return r;},
  drag(button,drop){let start=null,moved=false;button.onpointerdown=e=>{if(Engine.isReadingModal()||button.disabled)return;e.stopPropagation();start={x:e.clientX,y:e.clientY};moved=false;button.setPointerCapture(e.pointerId);};button.onpointermove=e=>{if(!start||Engine.isReadingModal())return;const dx=e.clientX-start.x,dy=e.clientY-start.y;moved ||= Math.hypot(dx,dy)>8;button.style.transform=`translate(${dx}px,${dy}px) rotate(-4deg)`;};button.onpointerup=e=>{if(!start)return;start=null;button.style.transform='';if(moved)drop(e.clientX,e.clientY);};button.onpointercancel=()=>{start=null;button.style.transform='';};},
  inside(element,x,y){const r=element.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;},
  censer(){return CenserScene.enter();},
  document(node){return new Promise(resolve=>{
    if(node.bg)Engine.setBg(node.bg);if(node.chars)Engine.setChars(node.chars);Engine.setLight(null);
    const {layer,w}=this.work(node.docName==='诏书'?'展开诏书':'案上的名帖','先解开折页，再读一读这份文字想让谁得到什么。','letter-work');
    const paper=document.createElement('article');paper.className='live-letter folded';paper.innerHTML='<div class="letter-fold">'+(node.docName||'名帖')+'</div><div class="letter-text"></div>';const body=paper.querySelector('.letter-text');for(const line of node.lines){const p=document.createElement('p');p.textContent=line.replace(/[【】]/g,'');body.append(p);}w.append(paper);
    const note=this.message(w,'折页遮住了后半段文字。');const next=this.button(w,'读罢，放回案上',()=>{
      if(node.log){const rows=Engine.logs[node.log]||(Engine.logs[node.log]=[]);for(const line of node.lines)rows.push({doc:true,name:node.docName,text:line,evidence:node.evidence||null});}
      if(Engine.mode==='tour')for(const id of node.evidence||[])Engine.collectEvidence(id);this.finish(layer,resolve);
    });next.disabled=true;
    this.range(w,'展开折页',value=>{paper.style.setProperty('--unfold',value/100);if(value>=85){paper.classList.remove('folded');next.disabled=false;note.textContent=node.id==='act2-mingtie'?'一边是求情的人，一边是再也回不了家的人。带着这份重量，听听他的回答。':'先记住诏书的说法，暂不急于认定真假。随后听冯绲的疑问。';}});
  });},
  fair(){return NarrativeScenes.followRiver();},
  lantern(){return RiverRitual.enter();},
  pour(){return WineRitual.enter();},
  fragments(){return TombRelics.fragments();},
  writing(){return new Promise(resolve=>{
    const{layer,w}=this.work('上书自讼','沿每行的落笔引导从左向右写；每写成一句，申诉意旨才会显出。','petition-work');
    const lines=['愿得上书自讼。','还自己、家人、百姓一个清白。','愿此书，能还众人清白。'];let row=this.state().writing||0,step=0,down=false,last=null;
    const canvas=document.createElement('canvas');canvas.width=900;canvas.height=360;canvas.setAttribute('aria-label','沿引导从左向右书写三行申诉意旨');w.append(canvas);const g=canvas.getContext('2d');const note=this.message(w,'纸上要留下的，是他仍愿相信公道的心。');const next=this.button(w,'收笔，把申诉交出去',()=>this.finish(layer,resolve));
    const render=()=>{g.fillStyle='#d6c7a8';g.fillRect(0,0,900,360);g.font='30px serif';for(let r=0;r<3;r++){g.strokeStyle='#8f806433';g.beginPath();g.moveTo(65,75+r*110);g.lineTo(830,75+r*110);g.stroke();g.save();g.beginPath();g.rect(65,35+r*110,r<row?800:r===row?step/8*800:0,65);g.clip();g.fillStyle='#35362b';g.fillText(lines[r],70,76+r*110);g.restore();}if(row<3){g.beginPath();g.arc(85+step*95,75+row*110,14,0,Math.PI*2);g.fillStyle='#a47436aa';g.fill();}next.disabled=row<3;};
    const completeRow=()=>{row++;step=0;this.state().writing=row;this.save();note.textContent=lines[row-1];render();};
    const mark=p=>{if(Engine.isReadingModal()||row>=3)return;if(Math.abs(p.y-(75+row*110))<30&&Math.abs(p.x-(85+step*95))<42){step++;if(step===8)completeRow();else render();}};
    const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*900/r.width,y:(e.clientY-r.top)*360/r.height};};
    canvas.onpointerdown=e=>{e.stopPropagation();if(Engine.isReadingModal())return;down=true;last=point(e);canvas.setPointerCapture(e.pointerId);mark(last);};canvas.onpointermove=e=>{if(!down)return;const p=point(e),steps=Math.max(1,Math.ceil(Math.hypot(p.x-last.x,p.y-last.y)/15));for(let i=1;i<=steps;i++)mark({x:last.x+(p.x-last.x)*i/steps,y:last.y+(p.y-last.y)*i/steps});last=p;};canvas.onpointerup=canvas.onpointercancel=()=>{down=false;last=null;};
    this.button(w,'执笔写下一句',()=>{if(row<3)completeRow();});render();
  });},
  jade(){return new Promise(resolve=>{
    const{layer,w}=this.work('最后的礼数','先看一看他的遗容，再为他安放玉蝉。','farewell-work');const portrait=buildAsset('char-fenghuan-dead','char');portrait.classList.add('farewell-portrait');w.append(portrait);const note=this.message(w,'许多想说的话，已经来不及亲口听见。');let viewed=false,selected=false,placed=false;
    this.button(w,'静静看一看',()=>{viewed=true;this.state().jadeViewed=true;note.textContent='这张脸，已不是营帐中意气风发的模样。先前的回忆，如今有了重量。';this.save();});
    const item=this.button(w,'拿起玉蝉',b=>{if(!viewed){note.textContent='先停下来，看一看他。';return;}selected=true;b.classList.add('chosen');});item.setAttribute('aria-label','拿起玉蝉');item.classList.add('farewell-jade');item.prepend(buildAsset('item-yuchan','item'));
    const target=this.button(w,'安放玉蝉',async b=>{if(!selected||placed){note.textContent='看过遗容后，再拿起手边的玉蝉。';return;}placed=true;b.disabled=true;item.disabled=true;w.classList.add('jade-placed');this.state().jadePlaced=true;this.save();note.textContent='玉蝉安放妥当。此刻，无需再催促任何事。';await TombScene.wait(TombScene.reducedMotion?300:2500);next.disabled=false;});
    const next=this.button(w,'陪他安静片刻后，继续',()=>this.finish(layer,resolve));next.disabled=true;
    this.drag(item,(x,y)=>{if(viewed&&this.inside(target,x,y)){selected=true;target.click();}});
  });},
  tears(){return new Promise(resolve=>{
    const{layer,w}=this.work('让记忆重新清晰','按住薄雾，轻轻擦开；雾后是为他送行的人。','tears-work');const frame=document.createElement('div');frame.className='tear-window';frame.innerHTML='<img src="assets/bg-funeral.webp" alt="为冯焕送行的人群"><canvas width="720" height="400" aria-label="擦开不同区域的薄雾"></canvas>';w.append(frame);const canvas=frame.querySelector('canvas'),g=canvas.getContext('2d'),cells=new Set(this.state().tears||[]);let down=false,last=null;
    const note=this.message(w,'你仍记得河畔那些盼人归来的灯。');const next=this.button(w,'看清送行的人，继续',()=>this.finish(layer,resolve));next.disabled=true;
    const stamp=index=>{const x=(index%12+.5)*60,y=(Math.floor(index/12)+.5)*50;g.save();g.globalCompositeOperation='destination-out';const brush=g.createRadialGradient(x,y,8,x,y,70);brush.addColorStop(0,'#000');brush.addColorStop(1,'#0000');g.fillStyle=brush;g.fillRect(x-70,y-70,140,140);g.restore();};
    g.fillStyle='#b4bfbc';g.fillRect(0,0,720,400);for(const index of cells)stamp(index);
    const update=()=>{this.state().tears=[...cells];if(cells.size>=40){frame.classList.add('clear');note.textContent='“愿冯大人来世安康，不再受苦。”记忆留下了人们的声音。';next.disabled=false;}this.save();};
    const mark=p=>{if(Engine.isReadingModal()||cells.size>=40)return;const col=Math.max(0,Math.min(11,Math.floor(p.x/60))),row=Math.max(0,Math.min(7,Math.floor(p.y/50))),index=row*12+col;if(!cells.has(index)){cells.add(index);stamp(index);update();}};
    const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*720/r.width,y:(e.clientY-r.top)*400/r.height};};canvas.onpointerdown=e=>{e.stopPropagation();down=true;last=point(e);canvas.setPointerCapture(e.pointerId);mark(last);};canvas.onpointermove=e=>{if(!down)return;const p=point(e),steps=Math.max(1,Math.ceil(Math.hypot(p.x-last.x,p.y-last.y)/20));for(let i=1;i<=steps;i++)mark({x:last.x+(p.x-last.x)*i/steps,y:last.y+(p.y-last.y)*i/steps});last=p;};canvas.onpointerup=canvas.onpointercancel=()=>{down=false;last=null;};
    this.button(w,'轻轻拭去一处雾气',()=>{for(let i=0;i<5&&cells.size<40;i++){const index=Array.from({length:96},(_,j)=>j).find(j=>!cells.has(j));mark({x:(index%12+.5)*60,y:(Math.floor(index/12)+.5)*50});}});update();
  });},
  reasoning(){return new Promise(resolve=>{
    const{layer,w}=this.work('他没有等到什么','用你听过的往事作答，依据会比猜测更接近这个人。','reasoning-work');const questions=[{ask:'他最后没有等到什么？',answer:'act5-end',options:['act1-exp','act5-end','act3-office'],reply:'澄清冤屈的消息到来时，他已病死狱中。'}, {ask:'是谁劝他仍要申诉？',answer:'act4-kin',options:['act3-exp','act4-kin','act2-office'],reply:'冯绲坚持劝父亲上书自讼。'}, {ask:'为何不能只凭诏书认定他的罪？',answer:'act4-plot',options:['act4-plot','act5-home','act1-char'],reply:'往事揭示了怨者构陷与伪造玺书。'}];let index=this.state().reasoning||0;
    const content=document.createElement('div');content.className='evidence-choices';w.append(content);const note=this.message(w,'选错不会扣心神，可以回看依据。');const next=this.button(w,'带着这些依据，走向石门',()=>this.finish(layer,resolve));
    const render=()=>{content.replaceChildren();next.disabled=index<questions.length;if(index>=questions.length){note.textContent='知道他的名字，也记得他没来得及等到的结局。';return;}const q=questions[index],h=document.createElement('h3');h.textContent=q.ask;content.append(h);for(const id of q.options){const def=EVIDENCE_DEFS[id];const b=this.button(content,def.title+'：'+def.text,()=>{if(id!==q.answer){note.textContent='再看看这条依据与问题的关系。你可以打开证据册回顾。';return;}note.textContent=q.reply;index++;this.state().reasoning=index;this.save();render();});b.dataset.evidence=id;}};render();
  });},
  inscription(node){return new Promise(resolve=>{
    Engine.setBg('bg-shuangque');Engine.setChars([]);Engine.setLight(null);const{layer,w}=this.work('把他的名字留在阙上','选择石块，再点对应位置；可按任意顺序安放，错误只提示依据。','gate-work');
    const gate=document.createElement('div');gate.className='live-gate';gate.innerHTML='<i class="gate-leaf left"></i><i class="gate-leaf right"></i><div class="gate-light"></div>';w.append(gate);const slots=document.createElement('div'),tray=document.createElement('div');slots.className='stone-slots';tray.className='stone-tray';w.append(slots,tray);let selected=null;const pieces=Engine.mode==='detective'?node.pairs:node.groups,placed=new Set(this.state().inscription||[]);let gateOpened=false;
    const note=this.message(w,'从官职、生平，到神道署名。可以随时翻看证据册。');const next=this.button(w,'门已开启，陪他走一段',()=>this.finish(layer,resolve));
    const sync=()=>{for(const slot of slots.children){const i=Number(slot.dataset.slot);slot.textContent=placed.has(i)?pieces[i]:(Engine.mode==='tour'?['起首官职','京畿任职','州郡任职','墓道称谓'][i]:'第'+(i+1)+'处');slot.classList.toggle('filled',placed.has(i));}for(const b of tray.children)b.disabled=placed.has(Number(b.dataset.piece));next.disabled=placed.size!==pieces.length;if(!next.disabled){gate.classList.add('open');note.textContent='石门缓缓打开。这一次，你知道站在身旁的人是谁。';if(!gateOpened){gateOpened=true;AudioFX.gate(true);}}};
    const place=i=>{if(selected===null||Engine.isReadingModal())return;if(i!==selected){note.textContent='这块还未接上。官职可查“官职”页，最后四字是墓道署名。';return;}placed.add(i);selected=null;this.state().inscription=[...placed];this.save();AudioFX.tokenDrop();sync();};
    pieces.forEach((_,i)=>{const b=this.button(slots,'',()=>place(i));b.dataset.slot=i;});for(const i of pieces.map((_,i)=>i).reverse()){const b=this.button(tray,pieces[i],button=>{selected=i;for(const other of tray.children)other.classList.toggle('chosen',other===button);});b.dataset.piece=i;this.drag(b,(x,y)=>{selected=i;for(const target of slots.children)if(this.inside(target,x,y)){place(Number(target.dataset.slot));break;}});}sync();
  });},
  tick(now){
    const dt=this.last?Math.min(60,now-this.last):0;this.last=now;
    if(!document.hidden&&!Engine.isReadingModal()&&!TombScene.reducedMotion){this.time+=dt;this.x+=(this.px-this.x)*.04;this.y+=(this.py-this.y)*.04;const s=Engine.els.stage;s.style.setProperty('--depth-x',this.x.toFixed(3));s.style.setProperty('--depth-y',this.y.toFixed(3));s.style.setProperty('--live-breath',Math.sin(this.time/2600).toFixed(3));s.style.setProperty('--live-flame',(0.87+Math.sin(this.time/157)*.045+Math.sin(this.time/83)*.03).toFixed(3));}
    this.raf=requestAnimationFrame(t=>this.tick(t));
  },
  install(){
    const originalSpot=Minigames.spot.bind(Minigames);Minigames.spot=node=>SCRIPT[Engine.currentIndex-1]?.id==='act5-songxing'?FarewellScene.turnToShop():originalSpot(node);
    const setBg=Engine.setBg.bind(Engine);Engine.setBg=key=>{SceneCinema.reset();setBg(key);const live=key&&!['bg-street','bg-bus','bg-tomb'].includes(key);Engine.els.stage.classList.toggle('live-depth',!!live);};
    const foreground=document.createElement('div');foreground.id='live-foreground';foreground.setAttribute('aria-hidden','true');foreground.innerHTML='<i class="near-shadow"></i><i class="live-beam"></i><i class="hanging-cloth"></i>';Engine.els.stage.append(foreground);
    window.addEventListener('pointermove',e=>{this.px=e.clientX/innerWidth-.5;this.py=e.clientY/innerHeight-.5;},{passive:true});this.raf=requestAnimationFrame(t=>this.tick(t));
    const original=Engine.runNode.bind(Engine);Engine.runNode=async node=>{
      if(node.type==='artifact'&&node.asset==='bg-yuewu'){Engine.currentNode=node;return MusicStone.enter();}
      if(node.type==='transition'&&node.asset==='fx-painting'){Engine.currentNode=node;Engine.hideDlg();Engine.setChars([]);Engine.setLight(null);await SceneCinema.push(.52,.44,1.18,1000);await SceneCinema.change('bg-fair-stage',.31,.45,1,1600);AudioFX.performance();return;}
      if(node.id==='act2-tomb')node={...node,bg:'bg-tomb-phoenix',chars:[],lines:node.lines.map(l=>l.speaker==='stranger'?{...l,label:'失忆男子（身后）'}:l)};
      if(node.id==='act2-tomb2')node={...node,bg:'bg-tomb-phoenix-broken',chars:[]};
      if(node.id==='act3-stone')node={...node,chars:[]};
      if(node.id==='act3-fair')node={...node,bg:'bg-fair-stage',chars:[]};
      if(node.id==='act3-river')node={...node,bg:'bg-river-sisters',chars:[],lines:node.lines.map(l=>l.cls==='narration'?{...l,text:'河面已经亮起盏盏灯火。她们在石阶旁停下。'}:l)};
      if(['epi-white','act5-tomb2'].includes(node.id)||node.type==='artifact'&&['bg-zhujian','item-yuchan','bg-censer'].includes(node.asset)){Engine.currentNode=node;Engine.hint('');return;}
      if(node.id==='act5-yuchan'){Engine.currentNode=node;return TombRelics.findJade();}
      if(node.id==='act5-ajin'){const close={...node,bg:'bg-teashop-whisper',chars:[],lines:node.lines.filter(line=>line.cls!=='narration')};return FarewellScene.conversation(close,()=>original(close));}
      this.phase=SCRIPT.slice(0,Engine.currentIndex+1).filter(n=>n.type==='intertitle').length-1;Engine.els.stage.dataset.emotion=this.phase>=5?'farewell':this.phase>=2?'familiar':'unknown';Engine.els.stage.dataset.shot=node.id||node.type;
      const methods={document:()=>this.document(node),writing:()=>this.writing(),jade:()=>this.jade(),eye:()=>this.tears(),inscription:()=>this.inscription(node)};
      if(node.id==='act2-close'){node={...node,bg:'bg-censer-open'};}
      if(node.id==='act4-zhujian'){Engine.currentNode=node;return this.fragments();}
      if(node.id==='act3-winepot'){Engine.currentNode=node;return this.pour();}
      if(node.type==='blood'||node.type==='redflash'){Engine.currentNode=node;Engine.hideDlg();Engine.els.stage.classList.add('memory-tremor');try{await TombScene.wait(TombScene.reducedMotion?150:900);}finally{Engine.els.stage.classList.remove('memory-tremor');}return;}
      if(methods[node.type]){Engine.currentNode=node;return methods[node.type]();}
      const quiet=this.phase>=4;Engine.quietEvidence=quiet;
      try{await original(node);}finally{Engine.quietEvidence=false;}
      if(node.id==='act2-study2')await this.censer();
      if(node.id==='act2-close')await NarrativeScenes.returnPhoenix();
      if(node.id==='act3-river')await this.lantern();if(node.id==='recall9')await this.reasoning();
      if(node.id==='final-que'){const{layer,w}=this.work('暂别','让他走远一些。你可以在这里停留，准备好后再回去。','farewell-work');await new Promise(resolve=>this.button(w,'回到来时的地方',()=>this.finish(layer,resolve)));}
    };
    const journal=FirstMemory.journal.bind(FirstMemory);FirstMemory.journal=()=>{journal();const state=this.state();const entries=[];if(this.state()&&Engine.memories.experience?.fragmentFocus)entries.push(['残简上的两句话',Engine.memories.experience.fragmentFocus==='praise'?'同一卷上的称许与催刑，让我想追问他经历了怎样的转折。':'比起找出一句罪名，我更想知道他当时有没有机会为自己辩白。']);if(state.censer?.length===3)entries.push(['炉中旧事','听过名帖中的求情，再亲手续起将尽的香火。他想驱散的“恶”，来自案卷里的不公。']);if(state.prayer)entries.push(['人间愿',state.prayer+'。这盏灯，也让我记住了河畔的普通人。']);if(state.writing===3)entries.push(['上书自讼','愿此书，能还众人清白。他仍选择把申诉交出去。']);if(state.jadeFound&&!state.jadePlaced)entries.push(['墓室里的玉蝉','你把玉蝉收好了，它的回声尚未清晰。']);if(state.jadePlaced)entries.push(['最后的礼数','看过他的遗容，为他安放玉蝉，然后停留片刻。']);if(state.reasoning===3)entries.push(['阙前回声','记得他的官职，也记得他没有等到的澄冤消息。']);for(const[title,text]of entries){const article=document.createElement('article');article.className='book-entry';const h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=text;article.append(h,p);Engine.els.bookContent.append(article);}};
  }
};
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>Immersive.install(),0));

/* Matched full-screen views. Every dissolve replaces the scene, never opens an image card. */
const SceneCinema={
  pose:{x:.5,y:.5,s:1},targets:new Set(),
  reset(){if(!Engine.els?.stage)return;Engine.els.stage.classList.remove('scene-cinema');this.pose={x:.5,y:.5,s:1};},
  frame(){return CenserScene.frame(this.pose.x,this.pose.y,this.pose.s);},
  paint(){const f=this.frame(),s=Engine.els.stage;s.classList.add('scene-cinema');for(const[k,v]of Object.entries({x:f.x,y:f.y,width:f.iw,height:f.ih,scale:f.scale}))s.style.setProperty('--cinema-'+k,String(v)+(k==='scale'?'':'px'));for(const layout of this.targets)layout();},
  set(x=.5,y=.5,s=1){this.pose={x,y,s};this.paint();},
  async push(x,y,s,duration=1100){const from={...this.pose};await TombRelics.animate(TombScene.reducedMotion?180:duration,p=>{const t=p*p*(3-2*p);this.pose={x:from.x+(x-from.x)*t,y:from.y+(y-from.y)*t,s:from.s+(s-from.s)*t};this.paint();});},
  async change(key,x=.5,y=.5,s=1,duration=950){
    const src=ASSETS[key]?.src;if(!src)throw Error('Missing scene '+key);const next=new Image();next.src=src;await next.decode();
    const old=Engine.els.bg.querySelector('img'),f=this.frame(),cut=document.createElement('div');cut.className='scene-cut';cut.setAttribute('aria-hidden','true');
    if(old){const img=old.cloneNode();Object.assign(img.style,{width:f.iw+'px',height:f.ih+'px',transform:'translate('+f.x+'px,'+f.y+'px) scale('+f.scale+')'});cut.append(img);}
    Engine.setBg(key);this.set(x,y,s);Engine.els.stage.append(cut);
    try{await TombRelics.animate(TombScene.reducedMotion?180:duration,p=>{cut.style.opacity=String(1-p);});}finally{cut.remove();}
  },
  target(label,x,y,w=.13,h=.18){const b=document.createElement('button');b.className='scene-touch';b.setAttribute('aria-label',label);const layout=()=>{const f=this.frame(),p=CenserScene.point(f,x,y);Object.assign(b.style,{left:p.x+'px',top:p.y+'px',width:Math.max(48,f.w*w)+'px',height:Math.max(48,f.h*h)+'px'});};const resize=new ResizeObserver(layout);resize.observe(Engine.els.stage);this.targets.add(layout);layout();b.dispose=()=>{resize.disconnect();this.targets.delete(layout);};return b;},
  touch(label,x,y,text,{torch=false,beside}={}){return new Promise(resolve=>{
    Engine.hideDlg();Engine.hint('');const root=document.createElement('section');root.className='scene-touch-layer';const b=this.target(label,x,y),caption=document.createElement('p');caption.className='scene-caption';caption.textContent=text;root.append(b,caption);Engine.els.stage.append(root);let done=false,raf=0,last=performance.now(),near=0,moved=false;
    let busy=false,extra=null,pan=null;if(!torch&&innerWidth<700){root.style.pointerEvents='auto';root.style.touchAction='none';root.onpointerdown=e=>{if(e.target.closest('button')||busy||Engine.isReadingModal())return;pan={x:e.clientX,pose:SceneCinema.pose.x};root.setPointerCapture(e.pointerId);};root.onpointermove=e=>{if(!pan||Engine.isReadingModal())return;const f=this.frame();SceneCinema.set(Math.max(.15,Math.min(.85,pan.pose-(e.clientX-pan.x)/f.w)),this.pose.y,this.pose.s);};root.onpointerup=root.onpointercancel=()=>{pan=null;};}
    if(beside){extra=this.target(beside.label,beside.x,beside.y);root.append(extra);extra.onclick=async()=>{if(done||busy||Engine.isReadingModal())return;busy=true;b.disabled=extra.disabled=true;caption.textContent='';try{await beside.run();}finally{busy=false;b.disabled=extra.disabled=false;caption.textContent=text;}};}
    const finish=()=>{if(done||busy||Engine.isReadingModal())return;done=true;cancelAnimationFrame(raf);document.removeEventListener('pointermove',move);document.removeEventListener('pointerdown',move);b.dispose();extra?.dispose();root.remove();AudioFX.unlock();resolve();};
    const move=()=>{moved=true;};document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerdown',move,{passive:true});b.onclick=finish;
    const tick=now=>{if(!root.isConnected)return;const dt=Math.min(70,now-last);last=now;if(torch&&!Engine.isReadingModal()&&!document.hidden&&moved){const r=b.getBoundingClientRect(),distance=Math.hypot((Engine._tx-r.x-r.width/2)/(r.width/2),(Engine._ty-r.y-r.height/2)/(r.height/2));near=distance<1?near+dt:0;if(near>=700){finish();return;}}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  });}
};
window.addEventListener('resize',()=>{if(Engine.els?.stage?.classList.contains('scene-cinema'))SceneCinema.paint();});

const NarrativeScenes={
  async phoenixLight(){SceneCinema.set(.43,.47,1);await SceneCinema.touch('举火照亮凤鸟冠羽',.43,.29,'高处有一抹铜色的冠羽。举火看清它。',{torch:true});await SceneCinema.push(.43,.38,1.12,1100);},
  async approachStage(){SceneCinema.set(.34,.5,1);AudioFX.drumHit(.6);await SceneCinema.touch('走近鼓声传来的表演台',.28,.46,'鼓声从人群前方传来。');AudioFX.footstep();AudioFX.drumHit(.45);await SceneCinema.push(.3,.43,1.16,1500);},
  async followRiver(){
    if(Engine.els.stage.dataset.scene!=='bg-fair-walk')await SceneCinema.change('bg-fair-walk',.48,.5,1,1100);
    await SceneCinema.touch('沿巷口走向河边',.36,.5,'她们往临水的巷口走去。街边的人家正收起粮食。',{beside:{label:'走近正在收粮的人家',x:.16,y:.52,run:async()=>{await SceneCinema.push(.18,.53,1.2,1100);await Engine.showLines([{cls:'action',name:'收粮的妇人',text:'往年收了粮，总怕又被夺走。如今田地还回来了，才敢把一年的盼头装进筐里。'},{speaker:'tourist',text:'她们说的“还田”，原来就落在这一家人的日子里。'}],{log:null,chars:[]});Refinements.experience().fairHouseHeard=true;Progress.resources();await SceneCinema.push(.46,.49,1.08,1000);}}});
    await SceneCinema.push(.36,.47,1.35,1300);await SceneCinema.change('bg-river-sisters',.5,.5,1,1400);Immersive.state().fair=['stage','fields','river'];Progress.resources();
  },
  async line(node,line,index){
    if(node.id==='act2-tomb'){
      if(index===0&&!Engine.els.stage.classList.contains('scene-cinema'))SceneCinema.set(.43,.38,1.12);
      if(line.cls==='narration'&&/铜凤鸟/.test(line.text)){Engine.hideDlg();Engine.setChars([]);Engine.setLight(null);await SceneCinema.change('bg-phoenix-turn',.43,.32,1.03,600);AudioFX.phoenix();Engine.els.stage.classList.add('phoenix-alarm');try{await SceneCinema.push(.43,.31,1.48,1350);}finally{Engine.els.stage.classList.remove('phoenix-alarm');}}
    }
    if(node.id==='act2-close'&&index===0){SceneCinema.set(.35,.38,1);await SceneCinema.push(.33,.35,1.22,1200);}
    if(node.id==='act2-tomb2'&&index===0){const phone=innerWidth<700;SceneCinema.set(.46,.58,1);await SceneCinema.push(phone?.74:.62,.9,phone?1.85:1.6,1800);}
    if(node.id==='act3-stone')SceneCinema.set(.5,.45,1);
    if(node.id==='act3-fair'){
      const text=line.text||'',lines=node.lines||[];
      if(index===0){SceneCinema.set(.31,.45,1.12);}
      const walking=lines.slice(0,index+1).some(l=>(l.text||'').includes('先到河畔'));
      if(line.cls==='narration'&&/二人已走到河边/.test(text)){await this.followRiver();return;}
      const desired=walking?'bg-fair-walk':'bg-fair-stage';
      if(Engine.els.stage.dataset.scene!==desired){Engine.hideDlg();await SceneCinema.change(desired,walking?.53:.72,.5,1,1200);}
      if(!walking&&text==='阿瑾，快些来呀！'){Engine.hideDlg();await SceneCinema.push(.74,.48,1.08,1300);}
      if(walking&&text.includes('阿姐你瞧')){Engine.hideDlg();await SceneCinema.push(.46,.49,1.12,1300);}
    }
    if(node.id==='act3-river')SceneCinema.set(.48,.5,1);
  },
  async returnPhoenix(){
    Engine.hideDlg();Engine.setChars([]);Engine.setLight(null);await SceneCinema.push(.32,.3,1.35,900);
    await SceneCinema.change('bg-phoenix-turn',.43,.34,1.12,1300);AudioFX.phoenix();await TombScene.wait(450);
    Engine.els.stage.classList.add('phoenix-fracture');AudioFX.fracture();try{await SceneCinema.change('bg-tomb-phoenix-broken',.46,.58,1,850);}finally{Engine.els.stage.classList.remove('phoenix-fracture');}await TombScene.wait(650);
  }
};

/* A twelve-second encounter with the whole wall precedes the original conversation. */
const MusicStone={
  enter(){return new Promise(async(resolve,reject)=>{try{
    Engine.hideDlg();Engine.setChars([]);Engine.hint('');Engine.setBg('bg-yuewu');Engine.setLight('torch');SceneCinema.set(.5,.45,1);
    const exp=Refinements.experience(),root=document.createElement('section');root.className='music-stone';root.dataset.phase='observe';root.setAttribute('aria-busy','true');
    const info=document.createElement('details');info.className='stone-learning';info.innerHTML='<summary>石上为什么有乐舞？</summary><p>画像石，是把图像雕刻在石材上的艺术。汉代画像石中的乐舞百戏，记录了吹奏、击鼓、舞蹈和杂技等表演场面。</p><p>试着看：上方的乐人怎样配合？下方的舞者与杂技者又在做什么？这些图像，也帮助今天的人了解汉代的表演生活。</p><p class="stone-source">眼前为剧情意象插画，并非某件出土文物的原貌。</p><a href="https://www.chnmus.net/ch/collection/appraise/details.html?id=512151315360810774" target="_blank" rel="noopener">延伸阅读 · 河南博物院</a>';
    const target=SceneCinema.target('轻触石上的舞袖，听见旧日乐声',.52,.44,.22,.27);target.disabled=true;target.hidden=true;const caption=document.createElement('p');caption.className='scene-caption';caption.textContent='火光掠过刻痕。先静静看看这面石壁。';root.append(info,target,caption);Engine.els.stage.append(root);
    let alive=true,elapsed=exp.musicObserveMs||0,last=performance.now(),age=0,raf=0;const reading=new Image();reading.src=ASSETS['bg-yuewu'].src;await reading.decode();last=performance.now();root.setAttribute('aria-busy','false');
    target.onclick=async()=>{if(!alive||elapsed<12000||Engine.isReadingModal())return;alive=false;cancelAnimationFrame(raf);target.disabled=true;info.open=false;root.dataset.phase='touch';AudioFX.performance('stone');await SceneCinema.push(.52,.44,1.12,900);target.dispose();root.remove();exp.musicObserveMs=12000;Progress.resources();resolve();};
    const tick=now=>{if(!alive||!root.isConnected)return;const dt=Math.min(250,now-last);last=now;if(!Engine.isReadingModal()&&!document.hidden){elapsed=Math.min(12000,elapsed+dt);age+=dt;root.dataset.elapsed=String(Math.round(elapsed));if(age>=650||elapsed===12000&&exp.musicObserveMs!==12000){exp.musicObserveMs=Math.round(elapsed);Progress.resources();age=0;}if(elapsed>=12000){root.dataset.phase='listen';target.hidden=false;target.disabled=false;caption.textContent='像有鼓声从石中传来。轻触那道舒展的舞袖。';}}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  }catch(error){reject(error);}});}
};

/* One spatial route: follow the mourners, overhear the shop, look back at the street. */
const FarewellScene={
  pose:{x:.5,y:.5,scale:1},
  setCamera(x,y,scale,inside=false){
    const w=innerWidth,h=innerHeight,iw=inside?1536:1672,ih=inside?1024:941,r=Math.max(w/iw,h/ih),width=iw*r,height=ih*r,tx=Math.max(w-width*scale,Math.min(0,w*.5-scale*width*x)),ty=Math.max(h-height*scale,Math.min(0,h*.5-scale*height*y)),stage=Engine.els.stage;
    this.pose={x:(w*.5-tx)/(width*scale),y:(h*.5-ty)/(height*scale),scale};this.frame={x:tx,y:ty,width,height,scale};stage.style.setProperty('--farewell-width',width+'px');stage.style.setProperty('--farewell-height',height+'px');stage.style.setProperty('--farewell-x',tx+'px');stage.style.setProperty('--farewell-y',ty+'px');stage.style.setProperty('--farewell-scale',scale);
  },
  project(x,y){const f=this.frame;return{x:f.x+f.scale*f.width*x,y:f.y+f.scale*f.height*y,width:f.width*f.scale,height:f.height*f.scale};},
  curtain(){if(!this.cut?.isConnected){this.cut=document.createElement('div');this.cut.className='farewell-cut';this.cut.setAttribute('aria-hidden','true');Engine.els.stage.append(this.cut);}return this.cut;},
  approach(){return new Promise(resolve=>{
    Engine.hideDlg();Engine.hint('');Engine.fast=false;Engine.els.dlgFast.classList.remove('on');const stage=Engine.els.stage;stage.classList.add('farewell-route');this.setCamera(innerWidth<700?.66:.5,.5,1);const entry=document.createElement('button');entry.className='procession-entrance';entry.setAttribute('aria-label','跟上白衣送行的人群');entry.innerHTML='<span>跟上人群</span>';stage.append(entry);
    const layout=()=>{this.setCamera(this.pose.x,this.pose.y,this.pose.scale);const p=this.project(.74,.51);Object.assign(entry.style,{left:p.x+'px',top:p.y+'px',width:Math.max(80,p.width*.18)+'px',height:Math.max(90,p.height*.25)+'px'});};const resize=new ResizeObserver(layout);resize.observe(stage);layout();
    entry.onclick=async()=>{if(entry.disabled||Engine.isReadingModal())return;entry.disabled=true;const start=this.pose.x,actor=Actors.models.get('fenggun');AudioFX.advance();await TombRelics.animate(TombScene.reducedMotion?350:2100,p=>{const t=p*p*(3-2*p);this.setCamera(start+(.74-start)*t,.5,1+.8*t);if(actor)actor.el.style.opacity=String(Math.max(0,1-t*1.2));});Engine.setChars([]);entry.remove();resize.disconnect();resolve();};
  });},
  async turnToShop(){
    Engine.hideDlg();Engine.setChars([]);if(Engine.els.stage.dataset.scene!=='bg-funeral')Engine.setBg('bg-funeral');Engine.els.stage.classList.add('farewell-route');this.setCamera(.74,.5,1.8);Engine.hint('旁边的小馆子里，传来压低的交谈声。');
    const preload=new Image();preload.src='assets/bg-teashop-whisper.webp';const loaded=preload.decode().catch(()=>{});await TombScene.wait(750);const cut=this.curtain();cut.style.opacity='0';
    await TombRelics.animate(TombScene.reducedMotion?350:1800,p=>{const t=p*p*(3-2*p);this.setCamera(.74+(.24-.74)*t,.5,1.8-.5*t);cut.style.opacity=String(Math.max(0,(p-.7)/.3));});await loaded;
  },
  async conversation(node,play){
    const stage=Engine.els.stage;stage.classList.add('farewell-route');Engine.fast=false;Engine.els.dlgFast.classList.remove('on');const cut=this.cut,played=play();this.setCamera(.63,.49,1.04,true);if(cut?.isConnected)TombRelics.animate(TombScene.reducedMotion?150:500,p=>cut.style.opacity=String(1-p));
    let alive=true,last=performance.now(),x=.63,scale=1.04,raf=0;
    const tick=now=>{if(!alive)return;const dt=Math.min(70,now-last);last=now;if(!Engine.isReadingModal()&&!document.hidden){scale+=(1.085-scale)*(1-Math.exp(-dt/9000));const who=Engine.els.dlgName.textContent,desired=innerWidth<700?(who.includes('姐姐')?.72:.56):(who.includes('姐姐')?.65:.61);x+=(desired-x)*(1-Math.exp(-dt/1400));this.setCamera(x,.49,scale,true);}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
    try{await played;}finally{alive=false;cancelAnimationFrame(raf);}
    Engine.hideDlg();Engine.hint('低语渐渐散去，街上传来远行的车轮声。');const veil=this.curtain();const from=x,zoom=scale;
    await TombRelics.animate(TombScene.reducedMotion?250:1000,p=>{const t=p*p*(3-2*p);this.setCamera(from+(.5-from)*t,.49,zoom+(1-zoom)*t,true);veil.style.opacity=String(Math.max(0,(p-.65)/.35));});
    Engine.setBg('bg-funeral');Engine.setChars([]);this.setCamera(.74,.5,1.8);await TombRelics.animate(TombScene.reducedMotion?200:450,p=>veil.style.opacity=String(1-p));
    await TombRelics.animate(TombScene.reducedMotion?250:1700,p=>{const t=p*p*(3-2*p);this.setCamera(.74+(.5-.74)*t,.5,1.8-.8*t);});veil.remove();stage.classList.remove('farewell-route');for(const name of ['--farewell-x','--farewell-y','--farewell-scale','--farewell-width','--farewell-height'])stage.style.removeProperty(name);Engine.hint('');
  }
};
