/* First-act playable slice: touch a thing, test a memory, meet its owner again. */
'use strict';
const FirstMemory = {
  spots:[{key:'horse',name:'马蹄',x:57,y:53,text:'马蹄扬起，前后相逐。石纹里传来一阵短促的踏地声。'}, {key:'blade',name:'兵刃',x:63,y:28,text:'兵刃向前，交错成阵。一声金属碰响，像从很远的地方传来。'}, {key:'wheel',name:'车轮',x:21,y:66,text:'木轮吱呀，车辙滚滚。车轮与人马挤在同一片石面上，这不是一个人的故事。'}],
  replies:{strategy:{label:'他看见了别人没有看见的局势',note:'营帐中的他敢于指出陷阱，也能提出具体的计策。',reply:'“我记得那一夜的风……还有等着天亮的人。”'},integrity:{label:'他宁可受伤，也不愿磨平棱角',note:'胜利之后，他依旧不愿用圆滑换取安稳。',reply:'“那句话……像是我会说的。可后来，我守住它了吗？”'},people:{label:'他冒险，是想让更多人活下来',note:'战阵之外，仍有许多等待人归来的人。你想再听听他的往事。',reply:'“你这样说，我倒想起……那些未能回来的人。”'}},
  featureCell(spot){return Math.floor(spot.y/10)*18+Math.floor(spot.x/100*18);},
  covered(cells){return cells.size>=162&&this.spots.every(spot=>cells.has(this.featureCell(spot)));},
  panel(className,title,instruction){
    if(typeof StoryHistory!=='undefined')StoryHistory.panel(className);
    Engine.hideDlg();Engine.fast=false;Engine.els.dlgFast.classList.remove('on');Engine.hint('');
    const layer=document.getElementById('minigame-layer');layer.replaceChildren();layer.classList.add('show');
    const w=document.createElement('section');w.className='memory-work '+className;w.setAttribute('aria-label',title);
    const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.className='memory-instruction';p.textContent=instruction;w.append(h,p);layer.append(w);return{layer,w};
  },
  close(layer,resolve){layer.classList.remove('show');layer.replaceChildren();resolve();},
  relief(){return StoneListening.enter();},
  enter(){return RubbingReturn.enter();},
  camp(){return CampExploration.enter();},
  place(plan,role,target){
    if(!role||!Object.hasOwn({fire:1,drums:1,army:1},role))return{ok:false,text:'先拿起一枚令筹，再选择落点。'};
    if(plan[role])return{ok:false,text:'这一路已经安排好了。'};
    if(role==='army'&&(!plan.fire||!plan.drums))return{ok:false,text:'主力先等一等。粮草起火、东面鼓响，才有突阵的机会。'};
    if(role!==target)return{ok:false,text:'再想想他的布置：西北粮草、东面鼓角，最后才是突阵。'};
    plan[role]=true;return{ok:true,text:{fire:'轻骑带着火种潜向西北坡，等候夜风。',drums:'鼓角移到东面，准备引开敌军的注意。',army:'两路已备，主力守候在西北接合处。'}[role]};
  },
  tactics(){return BattlePlan.enter();},
  async reflection(){
    StoryHistory.phase('reflection');
    Engine.setBg('bg-tomb');Engine.setChars([{id:'stranger',slot:'right',asset:'char-shadow'}]);Engine.setLight('torch');Engine.els.stage.dataset.bond='first-memory';
    await Engine.showLines([{cls:'narration',name:'旁白',text:'营帐的灯火远去。指下仍是冰凉的石壁，而他的声音似乎近了一些。'}],{log:null,chars:[]});
    let choice=Engine.memories.act1;
    if(!choice){choice=await new Promise(resolve=>{const {layer,w}=this.panel('memory-reflection','回声之后','这一段往事里，你最想向他提起什么？');for(const [key,value]of Object.entries(this.replies)){const b=document.createElement('button');b.textContent=value.label;b.onclick=()=>{if(Engine.isReadingModal())return;Engine.memories.act1=key;Progress.resources();this.close(layer,()=>resolve(key));};w.append(b);}});}
    const reply=this.replies[choice];await Engine.showLines([{speaker:'tourist',text:reply.label+'。'},{speaker:'stranger',label:'失忆男子',text:reply.reply}],{log:null,chars:[{id:'stranger'}]});
    await new Promise(resolve=>{const {layer,w}=this.panel('memory-reflection','拾忆札记',reply.note);const b=document.createElement('button');b.textContent='收起拓片，继续探索';b.onclick=()=>{if(!Engine.isReadingModal())this.close(layer,resolve);};w.append(b);});
  },
  journal(){
    const box=Engine.els.bookContent;box.replaceChildren();Engine.els.bookTabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===this.tab));Engine.els.bookCount.textContent='拾忆札记 · 不计入身份证据';
    const p=document.createElement('p');p.className='book-empty';p.textContent=Engine.memories.act1?this.replies[Engine.memories.act1].note:'亲手触摸器物，记下你如何理解它的主人。';box.append(p);
    if(Engine.memories.relief?.cells?.length){const image=document.createElement('img');image.className='journal-rubbing';image.src='assets/bg-stone.webp';image.alt='你留下的石刻拓印意象';box.append(image);}
  },
  install(){
    const original=Engine.runNode.bind(Engine);
    Engine.runNode=async node=>{
      Engine.els.stage.dataset.bond=Engine.memories.act1?'first-memory':'';
      if(node.type==='artifact'&&node.asset==='bg-stone'){Engine.currentNode=node;return this.relief();}
      if(node.type==='transition'&&SCRIPT[Engine.currentIndex-1]?.id==='stone'){Engine.currentNode=node;return this.enter();}
      if(node.id==='feast')Engine.quietEvidence=true;
      try{await original(node);}finally{Engine.quietEvidence=false;}
      if(node.id==='camp')await this.camp();
      if(node.id==='tent')await this.tactics();
      if(node.type==='review'&&node.logId==='act1')await this.reflection();
    };
    const tab=document.createElement('button');tab.className='book-tab';tab.textContent='拾忆札记';tab.onclick=()=>this.journal();Engine.els.bookTabs.append(tab);this.tab=tab;
    const nav=document.getElementById('chapter-nav-open');if(nav)nav.textContent='章节预览';
  }
};


/* A quiet first look, positional echoes, and rubbing that must cover the paper. */

const StoneListening={
  observeMs:20000,
  enter(){return new Promise(resolve=>{
    Engine.setBg('bg-stone');Engine.setChars([]);Engine.setLight(null);Engine.els.stage.classList.add('stone-exploring');
    const {layer,w}=FirstMemory.panel('memory-relief stone-listening','石上有声','');
    const saved=Engine.memories.relief||(Engine.memories.relief={seen:[],cells:[]});
    const seen=new Set(saved.seen),cells=new Set(saved.cells);
    let elapsed=Math.min(this.observeMs,saved.observeMs||0);if(seen.size||cells.size)elapsed=this.observeMs;
    let phase=elapsed>=this.observeMs?'listen':'observe',down=false,last=null,ready=false,finished=false,clock=performance.now(),persisted=elapsed,lastSound=0,voice=null,nearest=null,raf=0,coverageFrame=0,lastNear=null,lastNearAt=0;
    let light={x:50,y:50},pan=.5;
    const figure=document.createElement('div');figure.className='relief-table stone-surface';figure.tabIndex=0;figure.setAttribute('role','group');figure.setAttribute('aria-label','画像石：移动火把观察；提示出现后触碰有回声的刻痕。方向键移动，回车触碰。');
    figure.innerHTML='<img src="assets/bg-stone.webp" alt="胡汉交兵画像石的人马、兵刃与车轮"><canvas width="900" height="500" aria-label="按住并移动，拓出石刻纹理"></canvas><div class="stone-dark" aria-hidden="true"></div><img class="stone-torch" src="assets/torch-lit.webp" alt="" aria-hidden="true">';w.append(figure);
    const canvas=figure.querySelector('canvas'),g=canvas.getContext('2d'),instruction=w.querySelector('.memory-instruction');
    const feedback=document.createElement('p');feedback.className='memory-feedback';feedback.setAttribute('aria-live','polite');
    const meter=document.createElement('progress');meter.max=100;meter.value=0;meter.setAttribute('aria-label','实际拓印覆盖进度');meter.hidden=true;
    const actions=document.createElement('div');actions.className='memory-actions';const rub=document.createElement('button');rub.textContent='铺纸拓印';rub.hidden=true;
    const next=document.createElement('button');next.textContent='贴近刻痕，听它的回声';next.hidden=true;
    const assist=document.createElement('details');assist.className='stone-assist';assist.hidden=true;assist.innerHTML='<summary>操作辅助</summary><button>沿纹理轻拓一次</button>';
    const help=document.createElement('p');help.className='stone-help';help.textContent='循声触碰石刻 · 静音时留意纹理微光 · 方向键举火，回车触碰';actions.append(rub,next,assist);w.append(feedback,meter,actions,help);
    const halos=new Map();for(const spot of FirstMemory.spots){const halo=document.createElement('i');halo.className='stone-resonance';halo.dataset.stone=spot.key;halo.setAttribute('aria-hidden','true');halo.style.left=spot.x+'%';halo.style.top=spot.y+'%';figure.append(halo);halos.set(spot.key,halo);}
    const frame=()=>{const b=figure.getBoundingClientRect(),scale=Math.max(b.width/1672,b.height/941),iw=1672*scale,ih=941*scale;return{w:b.width,h:b.height,iw,ih,x:(b.width-iw)*pan,y:(b.height-ih)/2};};
    const sourcePoint=p=>{if(phase==='rub')return p;const f=frame();return{x:(p.x/100*f.w-f.x)/f.iw*100,y:(p.y/100*f.h-f.y)/f.ih*100};};
    const layout=()=>{if(phase==='rub')return;const f=frame();for(const spot of FirstMemory.spots){const h=halos.get(spot.key);h.style.left=(f.x+f.iw*spot.x/100)/f.w*100+'%';h.style.top=(f.y+f.ih*spot.y/100)/f.h*100+'%';}Engine.els.stage.style.setProperty('--stone-pan',pan*100+'%');};
    const persist=()=>{saved.seen=[...seen];saved.cells=[...cells];saved.observeMs=Math.min(this.observeMs,Math.round(elapsed));Progress.resources();persisted=elapsed;};
    const setPhase=value=>{phase=value;w.dataset.phase=value;Engine.els.stage.classList.toggle('stone-rubbing',value==='rub');instruction.textContent=value==='observe'?'':value==='listen'?'石纹里传来回声。举火靠近，触碰声音所在的刻痕。':'沿纸面均匀轻拓，让人马与车轮一点点连起来。';layout();if(value==='listen'&&!seen.size)setTimeout(()=>{if(!finished&&phase==='listen'){echo(FirstMemory.spots[0]);lastSound=performance.now();feedback.textContent=FirstMemory.spots[0].text;}},450);};
    const move=p=>{light={x:Math.max(0,Math.min(100,p.x)),y:Math.max(0,Math.min(100,p.y))};figure.style.setProperty('--stone-x',light.x+'%');figure.style.setProperty('--stone-y',light.y+'%');const source=sourcePoint(light);nearest=FirstMemory.spots.map(s=>({spot:s,d:Math.hypot((s.x-source.x)/10,(s.y-source.y)/13)})).sort((a,b)=>a.d-b.d)[0];
      const now=performance.now();if(phase==='listen'&&!finished&&nearest&&nearest.d<1.35&&(nearest.spot.key!==lastNear||now-lastNearAt>4200)){lastNear=nearest.spot.key;lastNearAt=now;echo(nearest.spot);lastSound=now;feedback.textContent=nearest.spot.text;}};
    const echo=spot=>{const source=sourcePoint(light),f=frame();voice?.stop();voice=AudioFX.stoneEcho(spot.key,(f.x+f.iw*spot.x/100)/f.w*2-1,Math.max(0,1-Math.hypot(spot.x-source.x,spot.y-source.y)/40));for(const h of halos.values())h.classList.remove('echoing');halos.get(spot.key).classList.add('echoing');};
    const inspect=()=>{if(phase!=='listen'||Engine.isReadingModal()||!ready)return;
      if(!nearest||nearest.d>1.05){feedback.textContent='指下仍是冰凉的刻痕。试着把火光移向回声传来的方向。';return;}
      const spot=nearest.spot;seen.add(spot.key);halos.get(spot.key).classList.add('heard');feedback.textContent=spot.text;echo(spot);lastSound=performance.now();rub.hidden=seen.size<3;persist();
      if(seen.size===3)instruction.textContent='踏地声、兵刃声、木轮声，渐渐连成同一场远行。可以铺纸留下它们。';
    };
    const stamp=(x,y)=>{g.save();g.globalCompositeOperation='destination-out';const brush=g.createRadialGradient(x,y,8,x,y,50);brush.addColorStop(0,'#000');brush.addColorStop(.7,'#000');brush.addColorStop(1,'#0000');g.fillStyle=brush;g.fillRect(x-50,y-50,100,100);g.restore();};
    const coverage=()=>{coverageFrame=0;if(phase!=='rub')return;
      const pixels=g.getImageData(0,0,900,500).data;cells.clear();
      for(let row=0;row<10;row++)for(let col=0;col<18;col++){const x=col*50+25,y=row*50+25;let alpha=0;for(const [dx,dy]of [[0,0],[-12,-12],[12,-12],[-12,12],[12,12]])alpha+=pixels[((y+dy)*900+x+dx)*4+3];if(alpha/5<64)cells.add(row*18+col);}
      const percent=Math.floor(cells.size/180*100);meter.value=percent;
      if(FirstMemory.covered(cells)){figure.classList.add('complete');next.hidden=false;assist.hidden=true;feedback.textContent='整幅纹路终于接上了。石壁深处，有鼓声传来。';voice?.stop();persist();}
      else feedback.textContent='纸面已拓开约 '+percent+'%。'+(percent<85?'还有留白，沿四周和未拓开的地方继续。':'再照顾一下未显出的边角。');
      if(Math.abs(cells.size-saved.cells.length)>=8)persist();
    };
    const mark=p=>{if(phase!=='rub'||Engine.isReadingModal()||FirstMemory.covered(cells))return;stamp(p.x,p.y);if(!coverageFrame)coverageFrame=requestAnimationFrame(coverage);};
    const point=e=>{const b=figure.getBoundingClientRect();return{x:(e.clientX-b.left)/b.width*100,y:(e.clientY-b.top)/b.height*100};};
    figure.onpointermove=e=>{if(Engine.isReadingModal())return;const p=point(e);move(p);if(phase==='rub'&&down){const q={x:p.x*9,y:p.y*5},steps=Math.max(1,Math.ceil(Math.hypot(q.x-last.x,q.y-last.y)/12));AudioFX.brush(true,Math.min(1,Math.hypot(q.x-last.x,q.y-last.y)/24));for(let i=1;i<=steps;i++)mark({x:last.x+(q.x-last.x)*i/steps,y:last.y+(q.y-last.y)*i/steps});last=q;}};
    figure.onpointerdown=e=>{if(Engine.isReadingModal()||!ready)return;e.stopPropagation();AudioFX.unlock();const p=point(e);move(p);figure.setPointerCapture(e.pointerId);if(phase==='rub'){down=true;last={x:p.x*9,y:p.y*5};AudioFX.brush(true,.15);mark(last);}else inspect();};
    figure.onpointerup=figure.onpointercancel=()=>{down=false;last=null;AudioFX.brush(false);if(phase==='rub'){if(coverageFrame){cancelAnimationFrame(coverageFrame);coverageFrame=0;}coverage();persist();}};
    figure.onkeydown=e=>{if(phase==='rub'||Engine.isReadingModal())return;const d={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4]}[e.key];if(d){e.preventDefault();move({x:light.x+d[0],y:light.y+d[1]});}else if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect();}};
    rub.onclick=()=>{if(Engine.isReadingModal()||seen.size<3)return;voice?.stop();setPhase('rub');figure.classList.add('rubbing');rub.hidden=true;assist.hidden=false;meter.hidden=false;g.globalCompositeOperation='source-over';g.fillStyle='#d5c6a8';g.fillRect(0,0,900,500);for(const index of cells)stamp((index%18+.5)*50,(Math.floor(index/18)+.5)*50);coverage();};
    assist.querySelector('button').onclick=()=>{if(Engine.isReadingModal())return;const missing=Array.from({length:180},(_,i)=>i).filter(i=>!cells.has(i));for(const index of missing.slice(0,3))stamp((index%18+.5)*50,(Math.floor(index/18)+.5)*50);coverage();persist();};
    next.onclick=()=>{if(Engine.isReadingModal()||!FirstMemory.covered(cells))return;finished=true;voice?.stop();AudioFX.brush(false);cancelAnimationFrame(raf);cancelAnimationFrame(coverageFrame);persist();Engine.els.stage.classList.remove('stone-exploring','stone-rubbing');Engine.els.stage.style.removeProperty('--stone-pan');FirstMemory.close(layer,resolve);};
    const tick=now=>{if(!w.isConnected||finished){voice?.stop();return;}const dt=Math.min(80,now-clock);clock=now;const paused=Engine.isReadingModal()||document.hidden;w.classList.toggle('stone-paused',paused);
      if(paused){voice?.stop();AudioFX.brush(false);lastSound=now;}else if(ready){
        if(phase!=='rub'){if(innerWidth<700){const edge=light.x<20?-1:light.x>80?1:0;pan=Math.max(0,Math.min(1,pan+edge*dt*.0004));}layout();move(light);}
        if(phase==='observe'){elapsed=Math.min(this.observeMs,elapsed+dt);if(elapsed-persisted>=2000)persist();if(elapsed>=this.observeMs){setPhase('listen');feedback.textContent='安静中，你听见石壁里传出一声轻响。';persist();}}
        if(phase==='listen'&&now-lastSound>4600){const unheard=FirstMemory.spots.filter(s=>!seen.has(s.key));const spot=nearest?.d<1.5?nearest.spot:(unheard[Math.floor(now/4600)%Math.max(1,unheard.length)]||FirstMemory.spots[Math.floor(now/4600)%3]);if(spot){echo(spot);lastSound=now;if(!seen.has(spot.key))feedback.textContent=spot.text;}}
      }raf=requestAnimationFrame(tick);
    };
    const loaded=()=>{ready=true;w.setAttribute('aria-busy','false');if(cells.size){rub.hidden=false;rub.onclick();}};w.setAttribute('aria-busy','true');const img=figure.querySelector('img');img.onload=loaded;if(img.complete&&img.naturalWidth)loaded();
    setPhase(phase);move(light);rub.hidden=phase==='rub'||seen.size<3;for(const key of seen)halos.get(key)?.classList.add('heard');raf=requestAnimationFrame(tick);
  });}
};

/* Search with a torch, then register the rubbing against the broken stone. */

const RubbingReturn={
  outline:[[.06,.03],[.43,0],[.68,.05],[.94,.01],[1,.27],[.95,.54],[.99,.95],[.7,1],[.45,.95],[.02,.99],[.05,.68],[0,.36]],
  aligned(x,y,target){return Math.abs(x-target.x)<target.w*.2&&Math.abs(y-target.y)<target.h*.2;},
  enter(){return new Promise(resolve=>{
    const saved=Engine.memories.relief||(Engine.memories.relief={seen:[],cells:[]});
    if(saved.returnPlaced){resolve();return;}
    Engine.setChars([]);Engine.setLight(null);
    const {layer,w}=FirstMemory.panel('rubbing-return','石纹深处','举火沿石壁寻找，看看手里的拓片能与哪一处断纹接上。');
    const board=document.createElement('div');board.className='return-wall';board.tabIndex=0;board.setAttribute('aria-label','石壁：移动鼠标或手指举火寻找，方向键也能移动火把');board.setAttribute('aria-busy','true');
    board.innerHTML='<canvas class="return-stone" aria-hidden="true"></canvas><button class="return-socket" aria-label="石壁上的拓片凹槽" disabled></button><div class="return-dark" aria-hidden="true"></div><img class="return-torch" src="assets/torch-lit.webp" alt="" aria-hidden="true"><button class="return-paper" aria-label="拿起拓片" disabled><canvas aria-hidden="true"></canvas><span>手中拓片</span></button>';
    const status=document.createElement('p');status.className='memory-feedback';status.setAttribute('aria-live','polite');
    const help=document.createElement('p');help.className='return-help';help.textContent='移动火光寻找断纹 · 找到后拖动拓片，或先点拓片再点凹槽 · 方向键举火';w.append(board,status,help);
    const stone=board.querySelector('.return-stone'),socket=board.querySelector('.return-socket'),paper=board.querySelector('.return-paper'),paperCanvas=paper.querySelector('canvas'),torch=board.querySelector('.return-torch');
    const image=new Image();let found=!!saved.returnFound,carrying=false,done=false,drag=null,suppress=false,raf=0,last=performance.now(),dwell=0,ready=false;
    let light={x:.22,y:.58},position={x:.15,y:.8},target={x:0,y:0,w:0,h:0};
    const persist=()=>Progress.resources();
    const path=(g,width,height)=>{g.beginPath();this.outline.forEach(([x,y],i)=>i?g.lineTo(x*width,y*height):g.moveTo(x*width,y*height));g.closePath();};
    const sync=()=>{w.dataset.found=String(found);w.dataset.carrying=String(carrying);paper.disabled=!found||!ready;socket.disabled=!found||!ready;paper.setAttribute('aria-pressed',String(carrying));
      status.textContent=found?'凹槽边缘的刻痕，正好能接上拓片。拿起它，对准断纹。':'火光掠过起伏的刻痕。找找边缘凹下、纹路断开的地方。';};
    const moveLight=(x,y)=>{light={x:Math.max(.01,Math.min(.99,x)),y:Math.max(.01,Math.min(.99,y))};board.style.setProperty('--fire-x',light.x*100+'%');board.style.setProperty('--fire-y',light.y*100+'%');};
    const movePaper=(x,y)=>{position={x:Math.max(.02,Math.min(.98,x)),y:Math.max(.02,Math.min(.98,y))};paper.style.left=position.x*100+'%';paper.style.top=position.y*100+'%';};
    const paint=()=>{
      if(!image.naturalWidth)return;
      const b=board.getBoundingClientRect();if(!b.width||!b.height)return;
      const bw=Math.round(b.width),bh=Math.round(b.height),tw=Math.max(90,Math.min(235,bw*.23,bh*.6/1.23)),th=tw*1.23;
      target={x:bw*.64,y:bh*.43,w:tw,h:th};
      stone.width=bw;stone.height=bh;const g=stone.getContext('2d');
      const scale=Math.max(bw/image.width,bh/image.height),sw=bw/scale,sh=bh/scale;
      g.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,0,0,bw,bh);
      // The rubbing uses the exact section removed from the rendered wall, so its lines match.
      paperCanvas.width=Math.round(tw);paperCanvas.height=Math.round(th);const pg=paperCanvas.getContext('2d');pg.save();path(pg,tw,th);pg.clip();pg.fillStyle='#dbcfb0';pg.fillRect(0,0,tw,th);pg.filter='grayscale(1) contrast(1.9)';pg.globalAlpha=.77;pg.drawImage(stone,target.x-tw/2,target.y-th/2,tw,th,0,0,tw,th);pg.restore();
      pg.strokeStyle='#e9dbb4';pg.lineWidth=5;path(pg,tw,th);pg.stroke();
      g.save();g.translate(target.x-tw/2,target.y-th/2);path(g,tw,th);g.clip();g.fillStyle='#242824';g.fillRect(0,0,tw,th);
      const shade=g.createLinearGradient(0,0,tw,th);shade.addColorStop(0,'#111713');shade.addColorStop(.45,'#3a3b2e');shade.addColorStop(1,'#1c231e');g.fillStyle=shade;g.fillRect(0,0,tw,th);
      // A few interrupted grooves lead the eye to the missing stone without a task marker.
      g.strokeStyle='#7d795c66';g.lineWidth=2;for(let i=0;i<7;i++){g.beginPath();g.moveTo(0,th*(i+.4)/7);g.lineTo(tw*.18,th*(i+.1)/7);g.stroke();}
      g.restore();g.save();g.translate(target.x-tw/2,target.y-th/2);g.shadowColor='#000';g.shadowBlur=10;g.strokeStyle='#0b100c';g.lineWidth=10;path(g,tw,th);g.stroke();g.shadowBlur=0;g.strokeStyle='#b7a77b99';g.lineWidth=2;path(g,tw,th);g.stroke();g.restore();
      Object.assign(socket.style,{left:target.x/bw*100+'%',top:target.y/bh*100+'%',width:tw+'px',height:th+'px'});
      board.style.setProperty('--paper-w',tw+'px');board.style.setProperty('--paper-h',th+'px');
      ready=true;board.setAttribute('aria-busy','false');sync();
    };
    const point=e=>{const b=board.getBoundingClientRect();return{x:(e.clientX-b.left)/b.width,y:(e.clientY-b.top)/b.height};};
    const lift=()=>{if(!found||!ready||done||Engine.isReadingModal())return;carrying=true;sync();status.textContent='拓片已拿起。让纸上的刻纹接回凹槽边缘，再松手贴合。';AudioFX.click();};
    const place=async(x,y)=>{
      if(!carrying||!found||!ready||done||Engine.isReadingModal())return;
      const b=board.getBoundingClientRect();
      if(!this.aligned(x*b.width,y*b.height,target)){status.textContent='这里的刻纹接不上。拓片仍在手里，再对一对凹槽边缘。';AudioFX.click();return;}
      done=true;carrying=false;movePaper(target.x/b.width,target.y/b.height);w.dataset.carrying='true';w.classList.add('return-placed');paper.disabled=socket.disabled=true;saved.returnPlaced=true;persist();status.textContent='拓片上的纹路与石壁接上了。石壁深处，鼓声渐渐清晰……';AudioFX.whoosh();
      await TombScene.wait(TombScene.reducedMotion?250:1500);cancelAnimationFrame(raf);resize.disconnect();FirstMemory.close(layer,resolve);
    };
    board.onpointermove=e=>{if(done||Engine.isReadingModal())return;const p=point(e);moveLight(p.x,p.y);if(carrying){movePaper(p.x,p.y);if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)drag.moved=true;}};
    board.onpointerdown=e=>{if(e.target.closest('.return-paper,.return-socket')||done||Engine.isReadingModal())return;const p=point(e);moveLight(p.x,p.y);if(carrying){movePaper(p.x,p.y);place(p.x,p.y);}else if(e.pointerType==='touch')board.setPointerCapture(e.pointerId);};
    paper.onpointerdown=e=>{e.stopPropagation();if(!found||done||Engine.isReadingModal())return;lift();drag={x:e.clientX,y:e.clientY,moved:false};paper.setPointerCapture(e.pointerId);};
    paper.onpointerup=e=>{if(!drag)return;const moved=drag.moved;drag=null;if(moved){suppress=true;const p=point(e);place(p.x,p.y);}};
    paper.onpointercancel=()=>{drag=null;};
    paper.onclick=e=>{e.stopPropagation();if(suppress){suppress=false;return;}if(!carrying)lift();else if(e.detail>0){const p=point(e);if(Math.hypot(position.x-.15,position.y-.8)>.04)place(p.x,p.y);}};
    socket.onclick=e=>{e.stopPropagation();if(!carrying){status.textContent='找到了。先拿起手中的拓片。';return;}const b=board.getBoundingClientRect();place(target.x/b.width,target.y/b.height);};
    board.onkeydown=e=>{if(done||Engine.isReadingModal()||e.target!==board)return;const d={ArrowLeft:[-.045,0],ArrowRight:[.045,0],ArrowUp:[0,-.045],ArrowDown:[0,.045]}[e.key];if(d){e.preventDefault();moveLight(light.x+d[0],light.y+d[1]);}};
    const tick=now=>{if(!w.isConnected)return;const dt=Math.min(70,now-last);last=now;const b=board.getBoundingClientRect();const paused=Engine.isReadingModal()||document.hidden;
      w.classList.toggle('return-paused',paused);
      if(!paused&&ready&&!found){const near=Math.abs(light.x*b.width-target.x)<target.w*.55&&Math.abs(light.y*b.height-target.y)<target.h*.55;dwell=near?dwell+dt:0;if(dwell>=650){found=true;saved.returnFound=true;persist();sync();AudioFX.click();}}
      if(!done)raf=requestAnimationFrame(tick);
    };
    const resize=new ResizeObserver(paint);resize.observe(board);image.onload=paint;image.src='assets/bg-stone.webp';moveLight(light.x,light.y);movePaper(position.x,position.y);sync();raf=requestAnimationFrame(tick);
  });}
};

/* The player finds the lit tent in the scene after the arriving dialogue ends. */

const CampExploration={
  enter(){return new Promise(resolve=>{
    StoryHistory.phase('camp');
    Engine.hideDlg();Engine.hint('');Engine.setLight(null);
    const stage=Engine.els.stage;stage.classList.add('camp-search');
    const entry=document.createElement('button');entry.className='camp-door';entry.setAttribute('aria-label','进入亮着灯的主营帐');
    const glow=document.createElement('i');glow.className='camp-lamplight';glow.setAttribute('aria-hidden','true');stage.append(glow,entry);
    const place=()=>{const b=stage.getBoundingClientRect(),scale=Math.max(b.width/1672,b.height/941),imageWidth=1672*scale,imageHeight=941*scale,x=(b.width-imageWidth)*(b.width<700?.72:.5)+imageWidth*.735,y=(b.height-imageHeight)/2+imageHeight*.57;
      const width=Math.max(70,imageWidth*.15),height=Math.max(80,imageHeight*.28);for(const el of [entry,glow])Object.assign(el.style,{left:x+'px',top:y+'px',width:width+'px',height:height+'px'});
    };
    const resize=new ResizeObserver(place);resize.observe(stage);place();
    entry.onclick=async()=>{if(Engine.isReadingModal()||entry.disabled)return;entry.disabled=true;stage.classList.add('camp-entering');AudioFX.advance();await TombScene.wait(TombScene.reducedMotion?150:750);resize.disconnect();entry.remove();glow.remove();stage.classList.remove('camp-search','camp-entering');resolve();};
  });}
};

/* A causal tabletop simulation: buildings stay put; units enact the quoted plan. */

const BattlePlan={
  targets:{grain:[180,95,'西北坡 · 粮草'],east:[775,255,'东面 · 营外'],seam:[490,230,'两营西北接合处']},
  labels:{fire:'轻骑 / 火种',drums:'鼓角 / 佯动',army:'主力'},
  enter(){return new Promise(resolve=>{
    const {layer,w}=Immersive.work('营帐案头 · 推演','轻骑绕后烧粮，鼓角集中东面；待守军调动，主力再从两营西北接合处突阵。','memory-tactics causal-tactics battle-plan');
    const stored=Refinements.experience(),plan={...(stored.deployment||{})};if(!Object.keys(plan).length)for(const key of Object.keys(Engine.memories.plan||{}))if(Engine.memories.plan[key])plan[key]={fire:'grain',drums:'east',army:'seam'}[key];
    let selected=null,running=false,success=stored.lastTrial==='gap-open'&&Refinements.trial(plan).success,elapsed=0,last=0,raf=0,stage=-1,outcome=null;
    const board=document.createElement('div');board.className='tactics-board battle-board';board.innerHTML='<svg viewBox="0 0 900 520" aria-label="北在上方：西北粮草，东面营外，两营接合处；蓝色为我军、红色为守军"><defs><marker id="battle-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="currentColor"/></marker></defs><path class="battle-hills" d="M30 110Q150 15 330 75M25 150Q150 50 320 110M660 390Q790 320 880 380"/><text x="40" y="35" class="battle-compass">北 ↑　西 ←</text><text x="705" y="495" class="battle-compass">东南风 ↖</text><g class="battle-camps"><path d="M350 160h145v100H350zM500 240h145v100H500z"/><text x="422" y="212">西营</text><text x="573" y="295">东营</text></g><g class="battle-grain"><path d="M150 82h62v40h-62zM146 82l34-22 37 22"/><text x="180" y="148">粮草</text></g><g class="battle-base"><path d="M350 445h100v52H350z"/><text x="400" y="477">我军</text></g><g class="battle-paths"><path id="battle-fire" d="M400 445Q170 420 120 300T180 95"/><path id="battle-drums" d="M400 445Q780 470 775 255"/><path id="battle-army" d="M400 445Q290 360 315 265Q330 180 400 190L490 230L650 125"/><path id="battle-recall-a" d="M425 235Q330 165 180 95"/><path id="battle-recall-b" d="M575 310Q390 180 180 95"/><path id="battle-east-a" d="M425 235Q620 190 775 255"/><path id="battle-east-b" d="M575 310Q700 350 775 255"/></g><ellipse class="battle-gap" cx="491" cy="231" rx="42" ry="35"/><text class="battle-gap-label" x="485" y="196">空隙出现</text><text class="battle-guard-label" x="490" y="196">仍有守军</text><g class="battle-fire-effect"><path d="M175 100Q150 75 174 45Q178 75 191 58Q213 85 190 103"/></g><g class="battle-drums-effect"><circle cx="775" cy="255" r="40"/><circle cx="775" cy="255" r="55"/></g><g class="battle-unit ours" data-unit="fire"><circle r="16"/><text>骑</text></g><g class="battle-unit ours" data-unit="drums"><circle r="16"/><text>鼓</text></g><g class="battle-unit ours army" data-unit="army"><circle r="18"/><text>军</text></g><g class="battle-unit enemy" data-unit="enemy-a"><path d="M-18 -12h36v24h-36z"/><text>守</text></g><g class="battle-unit enemy" data-unit="enemy-b"><path d="M-18 -12h36v24h-36z"/><text>守</text></g><g class="battle-unit enemy" data-unit="guard"><path d="M-16 -11h32v22h-32z"/><text>守</text></g></svg>';
    const svg=board.querySelector('svg');for(const [key,[x,y,label]]of Object.entries(this.targets)){const b=Immersive.button(board,label,()=>place(key));b.classList.add('map-target');b.dataset.target=key;b.style.left=x/9+'%';b.style.top=y/5.2+'%';}w.append(board);
    const legend=document.createElement('p');legend.className='battle-legend';legend.textContent='蓝色圆旗：我军　红色方旗：守军　营地建筑保持不动';
    const steps=document.createElement('ol');steps.className='battle-steps';for(const text of ['二更，轻骑绕后','西北火起，东面鼓响','守军回救，接合处露空','主力突阵']){const li=document.createElement('li');li.textContent=text;steps.append(li);}w.append(legend,steps);
    const tray=document.createElement('div');tray.className='tactics-tray';w.append(tray);const note=Immersive.message(w,'拿起令筹，放到对应位置。可以先试，再调整。'),result=Immersive.message(w,'尚未推演。');note.classList.add('battle-pickup');result.classList.add('trial-result');
    const actions=document.createElement('div');actions.className='live-actions';w.append(actions);
    const requirements=document.createElement('p');requirements.className='battle-requirements';requirements.setAttribute('aria-live','polite');w.append(requirements);
    const clearAnimation=()=>{board.classList.remove('battle-playing','battle-complete');board.dataset.beat='-1';board.dataset.gap='false';steps.querySelectorAll('li').forEach(li=>li.classList.remove('active','done'));stage=-1;render(0);};
    const invalidate=()=>{success=false;stored.lastTrial=null;next.disabled=true;clearAnimation();};
    const missing=()=>[['fire','grain','轻骑 → 西北粮草'],['drums','east','鼓角 → 东面营外'],['army','seam','主力 → 两营接合处']].filter(([role,target])=>plan[role]!==target).map(([role,,label])=>(plan[role]?'需调整：':'未布置：')+label);
    const sync=()=>{for(const b of board.querySelectorAll('[data-target]')){const key=b.dataset.target,placed=Object.entries(plan).filter(([,v])=>v===key).map(([k])=>({fire:'火种',drums:'鼓角',army:'主力'}[k]));b.textContent=BattlePlan.targets[key][2]+(placed.length?' · '+placed.join('/'):'');}
      for(const b of tray.children){b.classList.toggle('chosen',b.dataset.role===selected);b.disabled=running;const key=b.dataset.role;b.textContent=({fire:'火种',drums:'鼓角',army:'主力'}[key])+'令筹'+(plan[key]?' · 已放':' · 未放');}
      board.dataset.fireCorrect=String(plan.fire==='grain');board.dataset.drumsCorrect=String(plan.drums==='east');requirements.textContent=success?'三路配合已完成，主力已越过空隙。':missing().join('；')||'三路已就位，推演后确认是否成功。';next.disabled=!success||running;stored.deployment={...plan};Progress.resources();
    };
    const choose=key=>{if(running)return;clearAnimation();selected=key;note.textContent='拿起'+BattlePlan.labels[key]+'，选择落点。';sync();};
    const place=key=>{if(!selected||running)return;plan[selected]=key;selected=null;invalidate();note.textContent='令筹已放下。可以继续布置或先看一次结果。';result.textContent='布置已改变，可以重新推演。';sync();};
    for(const [key,label]of Object.entries({fire:'火种',drums:'鼓角',army:'主力'})){const b=Immersive.button(tray,label+'令筹',()=>choose(key));b.setAttribute('aria-label',label+'令筹');b.classList.add('order-token');b.dataset.role=key;Immersive.drag(b,(x,y)=>{selected=key;for(const t of board.querySelectorAll('[data-target]'))if(Immersive.inside(t,x,y)){place(t.dataset.target);break;}});}
    const run=Immersive.button(actions,'推演当前布置',()=>{if(running)return;running=true;success=false;next.disabled=true;run.disabled=reset.disabled=true;outcome=Refinements.trial(plan);elapsed=0;stage=-1;board.classList.add('battle-playing');board.classList.remove('battle-complete');board.dataset.outcome=outcome.key;note.textContent='观察路线、守军与接合处的变化。';sync();w.scrollTop=0;});
    const reset=Immersive.button(actions,'收回全部令筹',()=>{if(running)return;for(const key of Object.keys(plan))delete plan[key];selected=null;invalidate();result.textContent='令筹已收回，可重新布置。';sync();});
    const next=Immersive.button(w,'推演成功，继续回忆',()=>{if(success&&!running){cancelAnimationFrame(raf);Immersive.finish(layer,resolve);}});next.classList.add('battle-next');next.disabled=true;
    const units=Object.fromEntries([...board.querySelectorAll('[data-unit]')].map(el=>[el.dataset.unit,el]));
    const locate=(key,x,y,visible=true)=>{units[key].setAttribute('transform',`translate(${x} ${y})`);units[key].style.display=visible?'':'none';};
    const along=(unit,id,t)=>{const path=svg.querySelector('#battle-'+id),fraction=TombScene.reducedMotion?(t>=1?1:0):Math.max(0,Math.min(1,t)),p=path.getPointAtLength(path.getTotalLength()*fraction);locate(unit,p.x,p.y);};
    function render(time){
      const beat=running?Math.min(3,Math.floor(time/1800)):stage,part=Math.max(0,Math.min(1,(time-(Math.max(0,beat)*1800))/1800));
      if(running&&beat!==stage){stage=beat;board.dataset.beat=String(beat);steps.querySelectorAll('li').forEach((li,i)=>{li.classList.toggle('active',i===beat);li.classList.toggle('done',i<beat);});
        const hasFire=plan.fire==='grain',hasDrums=plan.drums==='east';
        const captions=[hasFire?'二更，轻骑从西侧绕后，火种送向西北坡粮草。':'轻骑没有到达西北粮草处；敌军的补给仍安全。',hasDrums?'全军其余各处偃旗息鼓，鼓角集中东面，佯作主力东出。':'东面没有鼓角佯动，敌军不必分出更多守军。',hasFire?(hasDrums?'粮草火起、东面鼓响。守军沿路调动，两营接合处出现空隙。':'部分守军回救粮草，但另一营仍守住接合处。'):'粮草未受威胁，守军仍守在营防之中。',outcome.success?'敌阵已动，主力从西北接合处突入，越过营防。':outcome.text];result.textContent=captions[beat];AudioFX.battleCue?.(beat===0?'horse':beat===1?'drums':beat===2?'recall':'army');
      }
      const fireT=beat<0?0:beat>0?1:part,drumT=beat<1?0:beat>1?1:part,enemyT=beat<2?0:beat>2?1:part;
      if(plan.fire==='grain')along('fire','fire',fireT);else locate('fire',400,445,!!plan.fire);
      if(plan.drums==='east')along('drums','drums',drumT);else locate('drums',430,465,!!plan.drums);
      const pulled=plan.fire==='grain';if(pulled){along('enemy-a','recall-a',enemyT);}else locate('enemy-a',425,235);
      if(plan.drums==='east'&&beat>=1){if(pulled&&beat>=2)along('enemy-b','recall-b',enemyT);else along('enemy-b','east-b',beat>1?.4:part*.4);}else locate('enemy-b',575,310);
      const gap=pulled&&plan.drums==='east'&&beat>=2&&enemyT>.55;board.dataset.gap=String(gap);locate('guard',490,230,!gap);
      if(beat>=3&&outcome?.success)along('army','army',part);else locate('army',400,445,!!plan.army);
    }
    const tick=now=>{if(!w.isConnected)return;const dt=last?Math.min(70,now-last):0;last=now;if(running&&!Engine.isReadingModal()&&!document.hidden){elapsed+=dt;w.dataset.elapsed=String(Math.round(elapsed));render(elapsed);if(elapsed>=7200){render(7199);running=false;success=outcome.success;board.classList.remove('battle-playing');board.classList.add('battle-complete');run.disabled=reset.disabled=false;stored.lastTrial=outcome.key;if(success)Engine.memories.plan={fire:true,drums:true,army:true};result.textContent=outcome.text;note.textContent=success?'主力已通过接合处。可以回到记忆中。':'还可以拿起令筹，调整后重试。';sync();if(innerWidth<900&&success)next.scrollIntoView({block:'nearest'});}}
      raf=requestAnimationFrame(tick);
    };
    svg.querySelector('#battle-recall-b').setAttribute('d','M668 315Q440 170 180 95');render(0);sync();if(success){stage=3;outcome=Refinements.trial(plan);running=true;render(7199);running=false;board.classList.add('battle-complete');result.textContent=outcome.text;}raf=requestAnimationFrame(tick);
  });}
};

window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>FirstMemory.install(),0));
