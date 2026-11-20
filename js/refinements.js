/* Interaction rules and authored object sequences, integrated into existing nodes. */
'use strict';
const Refinements={
  experience(){return Engine.memories.experience||(Engine.memories.experience={});},
  scene(title,text,cls){const p=Immersive.work(title,text,cls);p.w.classList.add('scene-play');document.getElementById('game').dataset.playMode='explore';return p;},
  rangeOf(element){return element.getBoundingClientRect();},
  evidenceText(id){return EVIDENCE_DEFS[id].text;},
  trial(plan){
    if(plan.fire!=='grain')return{key:'grain-safe',success:false,text:'粮草未受威胁，敌军不必回救，主力仍面对完整的营防。'};
    if(plan.drums!=='east')return{key:'line-held',success:false,text:'粮草起火，敌军分兵回救；没有东面佯动，另一营仍守住接合处。'};
    if(plan.army!=='seam')return{key:'missed-gap',success:false,text:'敌军已被火与鼓声牵动，但主力没有赶到两营接合处，错过了空隙。'};
    return{key:'gap-open',success:true,text:'火起西北，鼓响东面。两营调动之间露出空隙，主力由接合处突入。'};
  },
  censer(){return CenserScene.enter();},
  document(node){return new Promise(resolve=>{
    Engine.setBg(node.bg);Engine.setChars(node.chars||[]);Engine.setLight(null);
    const{layer,w}=this.scene(node.docName==='诏书'?'案前的诏书':'属吏放下名帖','物件留在现场。拿起后展开，标记一段想带进接下来对话的文字。','letter-work');
    const paper=document.createElement('article');paper.className='live-letter folded scene-letter delivering';paper.style.setProperty('--unfold',0);const front=document.createElement('button');front.className='letter-fold';front.textContent=node.docName||'名帖';front.setAttribute('aria-label','掀开'+(node.docName||'名帖')+'折页');const body=document.createElement('div');body.className='letter-text';paper.append(front,body);w.append(paper);
    const markKey=node.id==='act2-mingtie'?'markedLetter':'markedEdict';let unfolded=false,selected=this.experience()[markKey]??null,finished=false;const note=this.message(w,'他把这份文字放到案上。你准备好时，再伸手取阅。');
    const next=this.button(w,'放回案上，听他回应',()=>{
      if(finished||selected===null)return;finished=true;
      if(node.log){const rows=Engine.logs[node.log]||(Engine.logs[node.log]=[]);for(const text of node.lines)rows.push({doc:true,name:node.docName,text,evidence:node.evidence||null});}
      this.experience()[node.id==='act2-mingtie'?'markedLetter':'markedEdict']=selected;
      if(Engine.mode==='tour')for(const id of node.evidence||[])Engine.collectEvidence(id);this.save();this.finish(layer,resolve);
    });next.disabled=true;
    node.lines.forEach((text,i)=>{const b=this.button(body,text.replace(/[【】]/g,''),()=>{if(!unfolded)return;selected=i;this.experience()[markKey]=i;this.save();for(const line of body.children)line.classList.toggle('chosen',line===b);note.textContent='你记住了：“'+text.replace(/[【】]/g,'').slice(0,65)+'”';next.disabled=false;});b.classList.add('letter-line');b.dataset.line=i;});
    const open=()=>{if(unfolded||Engine.isReadingModal())return;unfolded=true;paper.classList.remove('folded');paper.classList.add('unfolded');paper.style.setProperty('--unfold',1);note.textContent='点选一段值得记住的文字。你不必替求情者作答，接下来会听到主人的选择。';if(selected!==null){body.children[selected]?.classList.add('chosen');next.disabled=false;}};front.onclick=open;if(selected!==null)open();
    let down=null;front.onpointerdown=e=>{if(Engine.isReadingModal())return;e.stopPropagation();down=e.clientX;front.setPointerCapture(e.pointerId);};front.onpointermove=e=>{if(down!==null&&Math.abs(e.clientX-down)>55){down=null;open();}};front.onpointerup=front.onpointercancel=()=>down=null;
    const actor=Actors.models.get(node.id==='act2-mingtie'?'shuli':'pangfen');if(actor){const rect=actor.el.getBoundingClientRect();paper.style.setProperty('--delivery-x',(rect.x+rect.width*.6-innerWidth*.5)+'px');paper.style.setProperty('--delivery-y',(rect.y+rect.height*.5-innerHeight*.48)+'px');actor.body.dataset.gesture='deliver';actor.lean=-3;}
    TombScene.wait(TombScene.reducedMotion?0:900).then(()=>{if(!paper.isConnected)return;paper.classList.remove('delivering');if(actor){actor.lean=0;actor.body.dataset.gesture='listen';}});
  });},
  pour(){return WineRitual.enter();},
  tactics(){return BattlePlan.enter();},
  basisChoices:{'act4-kin':'冯绲坚持劝父上书自讼','act4-plot':'诏书可能出自怨者构陷','act1-char':'他曾说宁愿为正道承受棱角'},
  writing(){return new Promise(resolve=>{
    const{layer,w}=this.work('为何仍要申诉','先选出你理解的依据。再把这份理解，一句句写进申诉。','petition-work');
    const exp=this.experience(),basis=new Set(exp.petitionBasis||[]),choices=document.createElement('div');choices.className='petition-basis';w.append(choices);const note=this.message(w,'失利与自责，不能替代对真相的追问。');
    const canvas=document.createElement('canvas');canvas.width=900;canvas.height=360;canvas.setAttribute('aria-label','沿引导书写三行申诉意旨');w.append(canvas);const g=canvas.getContext('2d');let row=this.state().writing||0,step=0,down=false,last=null;
    const lines=['愿得上书自讼。','还自己、家人、百姓一个清白。','愿此书，能还众人清白。'];const ready=()=>basis.has('act4-kin')&&basis.has('act4-plot');
    for(const[id,label]of Object.entries(Refinements.basisChoices)){const b=this.button(choices,label,()=>{basis.has(id)?basis.delete(id):basis.add(id);exp.petitionBasis=[...basis];this.save();render();});b.dataset.basis=id;}
    const next=this.button(w,'收笔，把申诉交出去',()=>this.finish(layer,resolve));const assist=this.button(w,'执笔写下一句',()=>{if(ready()&&row<3)complete();});
    const render=()=>{for(const b of choices.children)b.classList.toggle('chosen',basis.has(b.dataset.basis));g.fillStyle='#d6c7a8';g.fillRect(0,0,900,360);g.font='30px serif';for(let r=0;r<3;r++){g.strokeStyle='#8f806433';g.beginPath();g.moveTo(65,75+r*110);g.lineTo(830,75+r*110);g.stroke();g.save();g.beginPath();g.rect(65,35+r*110,r<row?800:r===row?step/8*800:0,65);g.clip();g.fillStyle='#35362b';g.fillText(lines[r],70,76+r*110);g.restore();}if(row<3&&ready()){g.beginPath();g.arc(85+step*95,75+row*110,14,0,Math.PI*2);g.fillStyle='#a47436aa';g.fill();}assist.disabled=!ready()||row>=3;next.disabled=!ready()||row<3;note.textContent=ready()?(row?lines[row-1]:'亲人的劝告与尚待查明的构陷，给了他继续申诉的理由。'):'回看冯绲的劝告和诏书的疑点。刚直的性格之外，还有值得查明的事实。';};
    const complete=()=>{row++;step=0;this.state().writing=row;this.save();render();};const mark=p=>{if(!ready()||Engine.isReadingModal()||row>=3)return;if(Math.abs(p.y-(75+row*110))<30&&Math.abs(p.x-(85+step*95))<42){if(++step===8)complete();else render();}};
    const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*900/r.width,y:(e.clientY-r.top)*360/r.height};};canvas.onpointerdown=e=>{if(Engine.isReadingModal())return;e.stopPropagation();down=true;last=point(e);canvas.setPointerCapture(e.pointerId);AudioFX.brush(true,.2);mark(last);};canvas.onpointermove=e=>{if(!down)return;const p=point(e),n=Math.max(1,Math.ceil(Math.hypot(p.x-last.x,p.y-last.y)/15));AudioFX.brush(true,Math.min(1,Math.hypot(p.x-last.x,p.y-last.y)/18));for(let i=1;i<=n;i++)mark({x:last.x+(p.x-last.x)*i/n,y:last.y+(p.y-last.y)*i/n});last=p;};canvas.onpointerup=canvas.onpointercancel=()=>{down=false;last=null;AudioFX.brush(false);};render();
  });},
  async reasoning(){
    StoryHistory.phase('reasoning');
    Engine.hideDlg();Engine.hint('');Engine.fast=false;Engine.els.dlgFast.classList.remove('on');Engine.setBg('bg-tomb');Engine.setLight(null);Engine.setChars([{id:'fenghuan',slot:'right',asset:'char-fenghuan'}]);
    const layer=document.getElementById('minigame-layer');layer.replaceChildren();layer.classList.add('show');const root=document.createElement('section');root.className='understanding-conversation';root.setAttribute('aria-label','与冯焕谈谈他的往事');layer.append(root);
    const choices=document.createElement('div');choices.className='understanding-choices';choices.hidden=true;const done=document.createElement('button');done.className='understanding-done';done.textContent='我记得你了';done.hidden=true;root.append(choices,done);
    const exp=this.experience(),spoken=new Set(exp.finalWords||[]),state=this.state();let busy=false;const completed=()=>state.reasoning===3||spoken.size>0;
    const words={regret:{say:'那场败仗，不是您一生的全部。',reply:'可那些未能回来的人……我还是记挂。'},wrong:{say:'遭人构陷，并不等于您有罪。',reply:'那道诏书……原来，我还可以问一句为什么。'},late:{say:'后来，他们查清了那份冤屈。',reply:'原来，他们后来知道了。只是……有些话，我没能等到。'}};
    let leave;const finished=new Promise(resolve=>leave=resolve);
    for(const [key,line]of Object.entries(words)){const b=document.createElement('button');b.className='understanding-choice';b.dataset.word=key;b.textContent=line.say;choices.append(b);b.onclick=async()=>{if(busy||Engine.isReadingModal())return;busy=true;choices.hidden=done.hidden=true;spoken.add(key);exp.finalWords=[...spoken];this.save();await Engine.showLines([{speaker:'tourist',text:line.say},{speaker:'fenghuan',text:line.reply}],{log:null,chars:[{id:'fenghuan'}]});state.reasoning=3;this.save();busy=false;choices.hidden=false;done.hidden=false;Engine.hint('还有想说的话，也可以在这里多陪他一会儿。');};}
    done.onclick=async()=>{if(busy||!completed()||Engine.isReadingModal())return;busy=true;choices.hidden=done.hidden=true;await Engine.showLines([{speaker:'tourist',text:'我记得你了。'}],{log:null,chars:[{id:'fenghuan'}]});Engine.hint('');this.finish(layer,leave);};
    if(!completed())await Engine.showLines([{speaker:'fenghuan',text:'听过这些往事……你还想对我说什么？'}],{log:null,chars:[{id:'fenghuan'}]});choices.hidden=false;done.hidden=!completed();await finished;
  },
  jade(){return CoffinCamera.enter('jade');},
  coffinview(){return CoffinCamera.enter('observe');},
  tears(){return Promise.resolve();},
  install(){
    const keys=['experience','scene','censer','document','pour','writing','reasoning','jade','coffinview','tears'];for(const key of keys)Immersive[key]=this[key];FirstMemory.tactics=()=>this.tactics.call(Immersive);Minigames.coffinview=()=>Immersive.coffinview();
    const journal=FirstMemory.journal.bind(FirstMemory);FirstMemory.journal=()=>{journal();const e=this.experience.call(Immersive);if(e.markedLetter!==undefined){const text=SCRIPT.find(n=>n.id==='act2-mingtie').lines[e.markedLetter];if(text){const p=document.createElement('p');p.className='book-entry';p.textContent='你在名帖中标记了：'+text;Engine.els.bookContent.append(p);}}};
    const finish=Immersive.finish.bind(Immersive);Immersive.finish=(layer,resolve)=>{delete document.getElementById('game').dataset.playMode;return finish(layer,resolve);};
  }
};


/* A scene camera, not a portrait panel: approach the coffin, lean over, place the jade. */

const CoffinCamera={
  hand:{x:.60,y:.84},
  enter(kind='observe'){return new Promise(resolve=>{
    Engine.hideDlg();Engine.hint('');Engine.fast=false;Engine.els.dlgFast.classList.remove('on');Engine.setLight(null);
    const previous=Engine.sceneChars||[],stage=Engine.els.stage;Engine.setBg('bg-coffin');Engine.setChars([]);stage.classList.add('coffin-shot');stage.style.setProperty('--coffin-push','0');
    const layer=document.getElementById('minigame-layer');layer.replaceChildren();layer.classList.add('show');
    const scene=document.createElement('section');scene.className='coffin-camera';scene.dataset.view='wide';scene.setAttribute('aria-label',kind==='jade'?'棺旁安放玉蝉':'棺旁观察遗容');
    scene.innerHTML='<img class="coffin-overhead" src="assets/bg-coffin-close.webp" alt="俯视打开的棺椁，冯焕安静地躺在素衾上"><button class="coffin-approach" aria-label="走近棺椁，俯身看他"></button><button class="coffin-rest" aria-label="将玉蝉安放到手旁" disabled></button><p class="coffin-caption" role="status"></p><button class="coffin-return"></button>';
    layer.append(scene);const picture=scene.querySelector('img'),entry=scene.querySelector('.coffin-approach'),target=scene.querySelector('.coffin-rest'),caption=scene.querySelector('.coffin-caption'),back=scene.querySelector('.coffin-return');
    const state=Immersive.state();let view='wide',time=0,last=performance.now(),raf=0,ready=false,carrying=false,placed=!!state.jadePlaced,drag=null,suppress=false,finished=false;
    let jade=null,jadePoint={x:.82,y:.77};
    back.hidden=true;back.textContent=kind==='jade'?'准备好了，离开灵堂':'退回棺旁';caption.textContent='';
    const pictureFrame=()=>{const r=scene.getBoundingClientRect(),iw=picture.naturalWidth||1536,ih=picture.naturalHeight||1024,scale=Math.max(r.width/iw,r.height/ih);return{r,iw:iw*scale,ih:ih*scale,x:(r.width-iw*scale)/2,y:(r.height-ih*scale)/2};};
    const restPoint=()=>{const f=pictureFrame();return{x:f.x+f.iw*CoffinCamera.hand.x,y:f.y+f.ih*CoffinCamera.hand.y};};
    const positionJade=(x,y)=>{if(!jade)return;const r=scene.getBoundingClientRect();jadePoint={x:Math.max(.02,Math.min(.98,x)),y:Math.max(.02,Math.min(.98,y))};jade.style.left=jadePoint.x*r.width+'px';jade.style.top=jadePoint.y*r.height+'px';};
    const layout=()=>{const r=scene.getBoundingClientRect(),scale=Math.max(r.width/1672,r.height/941),iw=1672*scale,ih=941*scale;Object.assign(entry.style,{left:((r.width-iw)/2+iw*.585)+'px',top:((r.height-ih)/2+ih*.45)+'px',width:iw*.27+'px',height:ih*.22+'px'});const p=restPoint();target.style.left=p.x+'px';target.style.top=p.y+'px';scene.style.setProperty('--jade-size',Math.max(40,Math.min(70,pictureFrame().iw*.045))+'px');if(placed&&jade){jadePoint={x:p.x/r.width,y:p.y/r.height};}positionJade(jadePoint.x,jadePoint.y);};
    const cleanup=()=>{finished=true;cancelAnimationFrame(raf);resize.disconnect();stage.classList.remove('coffin-shot');stage.style.removeProperty('--coffin-push');Engine.setChars(previous);FirstMemory.close(layer,resolve);};
    back.onclick=()=>{if(!Engine.isReadingModal()&&view==='close'&&(kind!=='jade'||placed))cleanup();};
    const place=(x,y)=>{if(!carrying||placed||view!=='close'||Engine.isReadingModal())return;const p=restPoint(),tolerance=Math.max(30,Math.min(48,pictureFrame().iw*.033));if(Math.hypot(x-p.x,y-p.y)>tolerance){caption.textContent='还没放稳，再靠近他的双手一些。';return;}
      placed=true;carrying=false;state.jadePlaced=true;state.jadeViewed=true;Progress.resources();scene.classList.add('jade-placed');scene.classList.remove('jade-held');target.disabled=true;jade.disabled=true;layout();caption.textContent='玉蝉已安放。可以在这里陪他停留，准备好了再离开。';back.hidden=false;AudioFX.advance();
    };
    const lift=()=>{if(placed||view!=='close'||Engine.isReadingModal())return;carrying=true;scene.classList.add('jade-held');target.disabled=false;caption.textContent='托住玉蝉，轻轻送到他的手旁。';};
    const point=e=>{const r=scene.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
    if(kind==='jade'){
      jade=document.createElement('button');jade.className='coffin-jade';jade.setAttribute('aria-label','拿起玉蝉');jade.append(buildAsset('item-yuchan','item'));jade.hidden=true;scene.append(jade);
      jade.ondragstart=e=>e.preventDefault();
      jade.onpointerdown=e=>{e.stopPropagation();if(Engine.isReadingModal()||placed||view!=='close')return;lift();drag={x:e.clientX,y:e.clientY,moved:false};jade.setPointerCapture(e.pointerId);};
      jade.onpointermove=e=>{if(!drag||Engine.isReadingModal())return;drag.moved ||=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7;const p=point(e),r=scene.getBoundingClientRect();positionJade(p.x/r.width,p.y/r.height);};
      jade.onpointerup=e=>{if(!drag)return;const moved=drag.moved;drag=null;if(moved){suppress=true;const p=point(e);place(p.x,p.y);}};
      jade.onpointercancel=()=>{drag=null;};jade.onclick=e=>{e.stopPropagation();if(suppress){suppress=false;return;}lift();};
      target.onclick=e=>{e.stopPropagation();const p=restPoint();place(p.x,p.y);};
      scene.onpointerdown=e=>{if(!carrying||e.target.closest('button')||Engine.isReadingModal())return;const p=point(e),r=scene.getBoundingClientRect();positionJade(p.x/r.width,p.y/r.height);place(p.x,p.y);};
    }
    entry.disabled=true;entry.onclick=()=>{if(!ready||view!=='wide'||Engine.isReadingModal())return;view='push';time=0;scene.dataset.view=view;entry.disabled=true;caption.textContent='';AudioFX.advance();};
    const loaded=()=>{ready=true;entry.disabled=false;layout();};picture.onload=loaded;if(picture.complete&&picture.naturalWidth)loaded();
    const resize=new ResizeObserver(layout);resize.observe(scene);layout();
    const tick=now=>{if(finished||!scene.isConnected)return;const dt=Math.min(70,now-last);last=now;
      if(view==='push'&&!Engine.isReadingModal()&&!document.hidden){time+=dt;const duration=TombScene.reducedMotion?450:2100,p=Math.min(1,time/duration),ease=p*p*(3-2*p);stage.style.setProperty('--coffin-push',TombScene.reducedMotion?0:ease);scene.style.setProperty('--coffin-blend',Math.max(0,(p-.38)/.62));scene.style.setProperty('--coffin-settle',1+(1-ease)*.08);
        if(p>=1){view='close';scene.dataset.view=view;state.jadeViewed=true;Progress.resources();entry.hidden=true;if(kind==='jade'){jade.hidden=false;jade.disabled=placed;target.disabled=!carrying||placed;scene.classList.toggle('jade-placed',placed);caption.textContent=placed?'玉蝉仍妥帖地安放着。可以停留，也可以离开。':'玉蝉就在你手边。把它轻放在他的双手旁。';back.hidden=!placed;layout();}else{caption.textContent='他安静地躺在这里。你想起营帐里那个不肯退让的人。';back.hidden=false;}}
      }raf=requestAnimationFrame(tick);
    };raf=requestAnimationFrame(tick);
  });}
};

window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>Refinements.install(),0));


/* One burner in one continuous scene: lean in, lift its lid, tend the incense. */
const CenserScene={
  frame(x=.5,y=.5,scale=1){const w=innerWidth,h=innerHeight,r=Math.max(w/1672,h/941),iw=1672*r,ih=941*r;return{x:Math.max(w-iw*scale,Math.min(0,w*.5-iw*scale*x)),y:Math.max(h-ih*scale,Math.min(0,h*.5-ih*scale*y)),w:iw*scale,h:ih*scale,iw,ih,scale};},
  point(f,x,y){return{x:f.x+f.w*x,y:f.y+f.h*y};},
  enter(){return new Promise(resolve=>{
    StoryHistory.phase('censer');Engine.hideDlg();Engine.hint('');Engine.fast=false;Engine.els.dlgFast.classList.remove('on');Engine.setChars([]);Engine.setLight(null);
    const exp=Refinements.experience(),state=Immersive.state();if(exp.censerBeat==='tended'){Engine.setBg('bg-censer-open');resolve();return;}
    Engine.setBg('bg-censer');const stage=Engine.els.stage;stage.classList.add('censer-camera-active');
    const layer=document.getElementById('minigame-layer');layer.replaceChildren();layer.classList.add('show');const root=document.createElement('section');root.className='censer-camera';root.setAttribute('aria-label','走近铜炉，为他续起案前的香火');root.setAttribute('aria-busy','true');
    root.innerHTML='<div class="censer-world censer-desk"><img class="censer-closed" src="assets/bg-fenghuan.webp" alt="书案上唯一的凤鸟铜炉"><img class="censer-open" src="assets/bg-censer-open.webp" alt="炉盖已放在案上，炉腹内留着香灰与将尽的余火"></div><div class="censer-world censer-bowl"><img src="assets/bg-censer-inside.webp" alt="俯身看进同一铜炉，灰下有炭与微红的余烬"></div><canvas class="censer-breath" aria-hidden="true"></canvas><button class="censer-approach" aria-label="走近案上的香炉"></button><button class="censer-lift" aria-label="向上揭开炉盖"></button><button class="censer-look" aria-label="俯身看进炉内"></button><button class="censer-fuel" aria-label="捻起手边的香料"><canvas width="150" height="120" aria-hidden="true"></canvas><span>捻一撮香</span></button><button class="censer-ember" aria-label="把香送到余火上，在炉口按住轻扇，松手让烟安定"></button><p class="censer-caption" role="status"></p>';
    layer.append(root);
    const desk=root.querySelector('.censer-desk'),bowl=root.querySelector('.censer-bowl'),closed=root.querySelector('.censer-closed'),opened=root.querySelector('.censer-open'),approach=root.querySelector('.censer-approach'),lid=root.querySelector('.censer-lift'),look=root.querySelector('.censer-look'),fuel=root.querySelector('.censer-fuel'),ember=root.querySelector('.censer-ember'),caption=root.querySelector('.censer-caption'),canvas=root.querySelector('.censer-breath'),g=canvas.getContext('2d');
    let view=exp.censerBeat||(exp.lidOpen?'open':'wide'),busy=false,ready=false,alive=true,raf=0,last=performance.now(),fan=false,heat=exp.censerHeat||0,fueled=!!exp.censerFuel,carrying=false,settled=0,saveAge=0,wind=0,smokeAge=0,particles=[],drag=null,lidDrag=null,suppressFuel=false,suppressLid=false;
    let scenePose={x:innerWidth<700?.78:.5,y:.5,s:1},deskPose={x:.33,y:.41,s:1},bowlPose={x:.5,y:.54,s:1},sceneFrame,deskFrame,bowlFrame;
    const save=()=>{exp.censerFuel=fueled;exp.censerHeat=Math.round(Math.max(0,Math.min(1.2,heat))*1000)/1000;Progress.resources();};
    const paintWorld=(el,f)=>Object.assign(el.style,{width:f.iw+'px',height:f.ih+'px',transform:'translate('+f.x+'px,'+f.y+'px) scale('+f.scale+')'});
    const anchor=(el,f,x,y,w,h)=>{const p=this.point(f,x,y);Object.assign(el.style,{left:p.x+'px',top:p.y+'px',width:Math.max(52,f.w*w)+'px',height:Math.max(48,f.h*h)+'px'});};
    const frame=()=>{
      sceneFrame=this.frame(scenePose.x,scenePose.y,scenePose.s);deskFrame=this.frame(deskPose.x,deskPose.y,deskPose.s);bowlFrame=this.frame(bowlPose.x,bowlPose.y,bowlPose.s);paintWorld(desk,deskFrame);paintWorld(bowl,bowlFrame);
      for(const [key,value]of Object.entries({x:sceneFrame.x,y:sceneFrame.y,width:sceneFrame.iw,height:sceneFrame.ih,scale:sceneFrame.scale}))stage.style.setProperty('--censer-'+key,String(value)+(key==='scale'?'':'px'));
      anchor(approach,sceneFrame,.84,.50,.105,.17);anchor(lid,deskFrame,.32,.28,.23,.18);anchor(look,deskFrame,.32,.34,.20,.13);anchor(ember,bowlFrame,.50,.55,.18,.16);
      if(!carrying){fuel.style.left=(innerWidth<700?innerWidth*.18:innerWidth*.14)+'px';fuel.style.top=(innerHeight<500?innerHeight*.62:innerHeight*.73)+'px';}
    };
    const chooseView=value=>{
      view=value;root.dataset.view=value;approach.hidden=value!=='wide';lid.hidden=value!=='close';look.hidden=value!=='open';fuel.hidden=value!=='inside'||fueled;ember.hidden=value!=='inside';
      desk.style.opacity=['close','open'].includes(value)?'1':'0';bowl.style.opacity=value==='inside'?'1':'0';opened.style.opacity=value==='open'?'1':'0';closed.style.opacity=value==='open'?'0':'1';
      if(['wide','close','open','inside'].includes(value)){exp.censerBeat=value;save();}
      caption.textContent=value==='wide'?'他的目光留在案上，香气似乎快散了。':value==='close'?'拿住炉盖，轻轻向上揭。':value==='open'?'盖下还有一点余火。俯身看看炉里。':fueled?'在炉口按住轻扇，红光温起来后松手，看看烟。':'灰下还压着一点红光。捻起手边的香料，送近它。';frame();
    };
    const animate=(duration,render)=>TombRelics.animate(TombScene.reducedMotion?Math.min(300,duration):duration,render);
    const enterDesk=async()=>{if(busy||!ready||Engine.isReadingModal())return;busy=true;chooseView('approach');const start={...scenePose};await animate(1800,p=>{const t=p*p*(3-2*p);scenePose={x:start.x+(.84-start.x)*t,y:.5,s:1+1.25*t};desk.style.opacity=String(Math.max(0,(p-.52)/.48));frame();});busy=false;chooseView('close');AudioFX.touchMaterial('wood');};
    const openLid=async()=>{if(busy||view!=='close'||Engine.isReadingModal())return;busy=true;root.dataset.view='opening';await animate(650,p=>{closed.style.opacity=String(1-p);opened.style.opacity=String(p);});exp.lidOpen=true;busy=false;chooseView('open');AudioFX.censer('lid');};
    const lean=async()=>{if(busy||view!=='open'||Engine.isReadingModal())return;busy=true;root.dataset.view='lean';caption.textContent='炉里是薄灰、木炭与将尽的火。';await animate(1500,p=>{const t=p*p*(3-2*p);deskPose.s=1+.65*t;deskPose.y=.41+(.34-.41)*t;desk.style.opacity=String(1-Math.max(0,(p-.45)/.55));bowl.style.opacity=String(Math.max(0,(p-.45)/.55));frame();});busy=false;chooseView('inside');};
    approach.onclick=enterDesk;look.onclick=lean;
    lid.onpointerdown=e=>{if(busy||view!=='close'||Engine.isReadingModal())return;e.stopPropagation();lidDrag={y:e.clientY,amount:0,moved:false};lid.setPointerCapture(e.pointerId);};
    lid.onpointermove=e=>{if(!lidDrag||busy||Engine.isReadingModal())return;const distance=lidDrag.y-e.clientY;lidDrag.moved ||=Math.abs(distance)>6;lidDrag.amount=Math.max(0,Math.min(1,distance/Math.max(48,Math.min(95,innerHeight*.12))));closed.style.opacity=String(1-lidDrag.amount*.85);opened.style.opacity=String(lidDrag.amount*.85);if(lidDrag.amount>=.75){suppressLid=true;lidDrag=null;openLid();}};
    lid.onpointerup=lid.onpointercancel=()=>{if(!lidDrag)return;suppressLid=lidDrag.moved;const enough=lidDrag.amount>=.75;lidDrag=null;if(enough)openLid();else{closed.style.opacity='1';opened.style.opacity='0';}};lid.onclick=()=>{if(suppressLid){suppressLid=false;return;}openLid();};
    const grain=fuel.querySelector('canvas').getContext('2d');grain.shadowColor='#0009';grain.shadowBlur=8;for(let i=0;i<34;i++){const x=36+(i*31%79),y=35+(i*17%49),size=3+i%6;grain.save();grain.translate(x,y);grain.rotate(i*1.7);grain.fillStyle=['#b3864c','#72502d','#d0a166','#956330'][i%4];grain.fillRect(-size*.5,-size,size,3+size*.4);grain.strokeStyle='#d9b17d66';grain.lineWidth=.7;grain.beginPath();grain.moveTo(-size*.5,0);grain.lineTo(size*.5,0);grain.stroke();grain.restore();}
    const nearEmber=(x,y)=>{const p=this.point(bowlFrame,.5,.55);return Math.hypot((x-p.x)/Math.max(60,bowlFrame.w*.09),(y-p.y)/Math.max(50,bowlFrame.h*.09))<1;};
    const pick=()=>{if(busy||view!=='inside'||fueled||Engine.isReadingModal())return;carrying=true;fuel.classList.add('carrying');caption.textContent='把这一撮香送到灰下的红光上。';};
    const drop=(x,y)=>{if(!carrying||Engine.isReadingModal())return;if(!nearEmber(x,y)){carrying=false;fuel.classList.remove('carrying');frame();caption.textContent='这里的灰是凉的，再靠近那一点红光。';return;}fueled=true;carrying=false;fuel.classList.remove('carrying');fuel.hidden=true;caption.textContent='香落在余烬旁。按住轻扇片刻，等红光温起来，再松手。';save();AudioFX.censer('grain');};
    fuel.ondragstart=e=>e.preventDefault();fuel.onpointerdown=e=>{if(busy||fueled||Engine.isReadingModal())return;e.stopPropagation();pick();drag={x:e.clientX,y:e.clientY,moved:false};fuel.setPointerCapture(e.pointerId);};
    fuel.onpointermove=e=>{if(!drag||Engine.isReadingModal())return;drag.moved ||=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7;fuel.style.left=e.clientX+'px';fuel.style.top=e.clientY+'px';};fuel.onpointerup=e=>{if(!drag)return;const moved=drag.moved;drag=null;if(moved){suppressFuel=true;drop(e.clientX,e.clientY);}};fuel.onpointercancel=()=>{drag=null;carrying=false;fuel.classList.remove('carrying');frame();};fuel.onclick=()=>{if(suppressFuel){suppressFuel=false;return;}pick();};
    const setFan=value=>{if(busy||view!=='inside'||Engine.isReadingModal())return;if(!fueled){caption.textContent='先把香料送到余火上。';return;}fan=value;AudioFX.fan(value,heat);root.classList.toggle('fanning',value);if(!value)save();};
    ember.onpointerdown=e=>{if(Engine.isReadingModal())return;e.stopPropagation();if(carrying){const p=this.point(bowlFrame,.5,.55);drop(p.x,p.y);return;}ember.setPointerCapture(e.pointerId);setFan(true);};ember.onpointermove=e=>{if(fan)wind=Math.max(-1,Math.min(1,e.movementX/12));};ember.onpointerup=ember.onpointercancel=()=>setFan(false);ember.onblur=()=>setFan(false);
    ember.onclick=e=>{if(carrying){const p=this.point(bowlFrame,.5,.55);drop(p.x,p.y);}};ember.onkeydown=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();e.stopPropagation();if(carrying){const p=this.point(bowlFrame,.5,.55);drop(p.x,p.y);}else setFan(true);}};ember.onkeyup=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();setFan(false);}};
    const finish=async()=>{if(busy)return;busy=true;fan=false;AudioFX.fan(false);AudioFX.censer('settle');root.dataset.view='settle';caption.textContent='香气慢慢续上了。他的目光又落回凤鸟上。';exp.censerBeat='tended';state.censer=['bird','body','feet'];save();
      await animate(1400,p=>{bowl.style.opacity=String(1-p);desk.style.opacity=String(p);deskPose={x:.33+.17*p,y:.41+.09*p,s:1};opened.style.opacity='1';closed.style.opacity='0';frame();});
      alive=false;cancelAnimationFrame(raf);resize.disconnect();stage.classList.remove('censer-camera-active');for(const key of ['x','y','width','height','scale'])stage.style.removeProperty('--censer-'+key);Engine.setBg('bg-censer-open');FirstMemory.close(layer,resolve);
    };
    const resize=new ResizeObserver(()=>{const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);g.setTransform(d,0,0,d,0,0);frame();});resize.observe(root);
    const draw=(dt)=>{g.clearRect(0,0,innerWidth,innerHeight);if(!['inside','settle'].includes(root.dataset.view))return;const p=this.point(bowlFrame,.5,.55),warm=Math.min(1,heat);
      if(fueled){for(let i=0;i<20;i++){const angle=i*2.399,r=8+(i*13%40);g.fillStyle=warm>.7?'#c17736':'#9b6a3a';g.beginPath();g.ellipse(p.x+Math.cos(angle)*r,p.y+Math.sin(angle)*r*.4,2.5+i%3,1.6,angle,0,Math.PI*2);g.fill();}}
      if(warm>0){const glow=g.createRadialGradient(p.x,p.y,0,p.x,p.y,28+warm*35);glow.addColorStop(0,'rgba(242,102,26,'+warm*.3+')');glow.addColorStop(1,'#b63e1800');g.fillStyle=glow;g.fillRect(p.x-70,p.y-70,140,140);}
      smokeAge+=dt;if(fueled&&heat>.25&&smokeAge>120&&particles.length<60){smokeAge=0;particles.push({x:p.x+(Math.random()-.5)*25,y:p.y,life:0,max:2600+Math.random()*1900,size:5+Math.random()*9});}
      for(const v of particles){v.life+=dt;v.x+=(wind*16+Math.sin(v.life/650)*9)*dt/1000;v.y-=dt*.025;const alpha=Math.sin(Math.min(1,v.life/v.max)*Math.PI)*.12;g.fillStyle='rgba(207,205,180,'+alpha+')';g.beginPath();g.ellipse(v.x,v.y,v.size+v.life*.004,(v.size+v.life*.004)*1.8,wind*.2,0,Math.PI*2);g.fill();}particles=particles.filter(v=>v.life<v.max);
    };
    const tick=now=>{if(!alive||!root.isConnected)return;const dt=Math.min(65,now-last);last=now;const paused=Engine.isReadingModal()||document.hidden;root.classList.toggle('censer-paused',paused);
      if(paused){fan=false;AudioFX.fan(false);root.classList.remove('fanning');}else{if(view==='inside'&&!busy){if(fan&&fueled){heat=Math.min(1.2,heat+dt/1600);settled=0;if(!CenserScene._fanAt||now-CenserScene._fanAt>90){CenserScene._fanAt=now;AudioFX.fan(true,heat);}caption.textContent=heat>=.7?'余烬已温起来。松开手，让烟安定。':'红光正一点点温起来……';}else if(fueled&&heat>=.7){settled+=dt;if(settled>=900)finish();}saveAge+=dt;if(saveAge>650&&fan){saveAge=0;save();}}root.dataset.heat=heat.toFixed(3);draw(dt);wind*=.95;}raf=requestAnimationFrame(tick);
    };
    chooseView(view);busy=true;approach.disabled=true;Promise.all([...root.querySelectorAll('.censer-world img')].map(img=>img.decode())).then(()=>{if(!alive)return;ready=true;busy=false;root.setAttribute('aria-busy','false');approach.disabled=false;}).catch(()=>{busy=false;caption.textContent='近处还未看清，请稍候重新走近。';approach.disabled=false;approach.onclick=()=>location.reload();});raf=requestAnimationFrame(tick);
  });}
};

/* River water is the scene itself; the lamp shares its current and reflections. */
const RiverRitual={
  async enter(){
    StoryHistory.phase('lantern');Engine.hideDlg();Engine.setChars([]);Engine.setLight(null);Engine.hint('');Engine.fast=false;Engine.els.dlgFast.classList.remove('on');
    const state=Immersive.state(),exp=Refinements.experience();
    if(!exp.riverReleased){SceneCinema.set(.53,.6,1);await SceneCinema.push(.65,.66,1.25,1100);}
    await SceneCinema.change('bg-river-surface',.5,.5,1,1200);
    return new Promise(async(resolve,reject)=>{try{
      const root=document.createElement('section');root.className='river-ritual';root.setAttribute('aria-label','在河边写愿、放灯');root.dataset.phase=exp.riverReleased?'drift':'write';
      root.innerHTML='<canvas class="river-current" aria-hidden="true"></canvas><button class="river-release scene-touch" aria-label="将河灯轻放在眼前的水面"></button><form class="river-wish"><label for="river-wish-text">写在灯笺上</label><input id="river-wish-text" maxlength="40" disabled autocomplete="off" placeholder="愿……" aria-label="写下你的心愿"><button type="submit" disabled>收好灯笺</button></form><button class="river-lamp" aria-label="拿起写好心愿的河灯"><img src="assets/item-river-lantern.webp" alt="莲花河灯"></button><p class="scene-caption" role="status"></p>';
      Engine.els.stage.append(root);const cv=root.querySelector('canvas'),g=cv.getContext('2d'),water=root.querySelector('.river-release'),form=root.querySelector('form'),input=root.querySelector('input'),lamp=root.querySelector('.river-lamp'),caption=root.querySelector('.scene-caption');
      const source=new Image();source.src=ASSETS['bg-river-surface'].src;await Promise.all([source.decode(),lamp.querySelector('img').decode()]);
      let alive=true,released=!!exp.riverReleased,carrying=false,drag=null,suppress=false,busy=false,time=0,last=performance.now(),age=0,drift=exp.riverDriftMs||0,rings=[],point={x:.23,y:.76},buffer=document.createElement('canvas');
      input.value=state.prayer||exp.riverWishDraft||'';form.hidden=released;lamp.disabled=!state.prayer||released;
      const save=()=>{exp.riverReleased=released;exp.riverDriftMs=Math.round(drift);Progress.resources();};
      const say=()=>{caption.textContent=released?'水接住了灯。可以静静看着它漂远。':state.prayer?'拿起河灯，把它送到眼前的流水上。':'把想说的话写在灯笺上，再随她们放入河中。';};say();
      const placeLamp=()=>{lamp.style.left=point.x*innerWidth+'px';lamp.style.top=point.y*innerHeight+'px';lamp.style.setProperty('--lamp-size',Math.max(80,Math.min(145,innerWidth*.15))+'px');};
      const layout=()=>{const d=Math.min(devicePixelRatio||1,1.3);cv.width=Math.round(innerWidth*d);cv.height=Math.round(innerHeight*d);g.setTransform(d,0,0,d,0,0);buffer.width=innerWidth;buffer.height=innerHeight;const b=buffer.getContext('2d'),f=SceneCinema.frame();b.drawImage(source,f.x,f.y,f.w,f.h);placeLamp();};
      const resize=new ResizeObserver(layout);resize.observe(root);layout();
      input.oninput=()=>{exp.riverWishDraft=input.value.slice(0,40);Progress.resources();};
      form.onsubmit=e=>{e.preventDefault();if(Engine.isReadingModal()||released)return;const wish=input.value.trim();if(!wish){caption.textContent='先留下一句心愿。';input.focus();return;}state.prayer=wish;exp.riverWishDraft=wish;form.hidden=true;lamp.disabled=false;input.blur();Progress.resources();say();};
      const lift=()=>{if(released||!state.prayer||Engine.isReadingModal())return;carrying=true;lamp.classList.add('carrying');caption.textContent='轻轻送到水面上。';};
      const drop=(x,y)=>{if(!carrying||released||Engine.isReadingModal())return;const nx=x/innerWidth,ny=y/innerHeight;if(nx<.38||ny<.2||ny>.79){caption.textContent='再往流水中送近一点，岸边还托着灯。';point={x:.23,y:.76};placeLamp();return;}released=true;carrying=false;lamp.disabled=true;lamp.classList.remove('carrying');form.hidden=true;root.dataset.phase='drift';point={x:nx,y:ny};exp.riverDrop={x:nx,y:ny};rings.push({x,y,age:0});save();say();AudioFX.water();};
      lamp.ondragstart=e=>e.preventDefault();lamp.onpointerdown=e=>{e.stopPropagation();if(lamp.disabled)return;lift();drag={x:e.clientX,y:e.clientY,moved:false};lamp.setPointerCapture(e.pointerId);};lamp.onpointermove=e=>{if(!drag||Engine.isReadingModal())return;drag.moved ||=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7;point={x:e.clientX/innerWidth,y:e.clientY/innerHeight};placeLamp();};lamp.onpointerup=e=>{if(!drag)return;const moved=drag.moved;drag=null;if(moved){suppress=true;drop(e.clientX,e.clientY);}};lamp.onpointercancel=()=>{drag=null;carrying=false;point={x:.23,y:.76};placeLamp();};lamp.onclick=()=>{if(suppress){suppress=false;return;}lift();};water.onclick=e=>{if(Engine.isReadingModal())return;if(carrying){const x=e.detail?e.clientX:innerWidth*.63,y=e.detail?e.clientY:innerHeight*.55;drop(x,y);}else rings.push({x:e.clientX||innerWidth*.65,y:e.clientY||innerHeight*.5,age:0});};
      const finish=async()=>{if(busy)return;busy=true;caption.textContent='';await Engine.showLines([{speaker:'ajin',text:'愿灯上的心愿，也能到达远行人的身边。'}],{log:null,chars:[]});alive=false;cancelAnimationFrame(raf);resize.disconnect();root.remove();await SceneCinema.change('bg-tower',.57,.5,1,1300);resolve();};
      const draw=dt=>{
        g.clearRect(0,0,innerWidth,innerHeight);g.save();g.beginPath();g.moveTo(innerWidth*.28,0);g.lineTo(innerWidth,0);g.lineTo(innerWidth,innerHeight);g.lineTo(innerWidth*.38,innerHeight);g.lineTo(innerWidth*.18,innerHeight*.7);g.closePath();g.clip();
        for(let y=0;y<innerHeight;y+=6){const dx=TombScene.reducedMotion?0:Math.sin(time/1350+y*.027)*1.6+Math.sin(time/2400+y*.061)*.9;g.drawImage(buffer,0,y,innerWidth,Math.min(6,innerHeight-y),dx,y,innerWidth,Math.min(6,innerHeight-y));}g.restore();
        for(const r of rings){r.age+=dt;g.strokeStyle='rgba(221,195,147,'+Math.max(0,.28-r.age/6500)+')';g.lineWidth=.8;for(const delay of [0,270]){const a=Math.max(0,r.age-delay);g.beginPath();g.ellipse(r.x,r.y,8+a*.039,3+a*.012,0,0,Math.PI*2);g.stroke();}}rings=rings.filter(r=>r.age<1800);
        if(released){const start=exp.riverDrop||{x:.63,y:.55},p=Math.min(1,drift/6000);point={x:start.x+(.68-start.x)*p+Math.sin(time/1200)*.005,y:start.y-(start.y-.29)*p+Math.sin(time/780)*.003};placeLamp();lamp.style.transform='translate(-50%,-50%) scale('+(1-p*.58)+') rotate('+(Math.sin(time/1400)*3)+'deg)';const x=point.x*innerWidth,y=point.y*innerHeight,size=(1-p*.58)*22;g.fillStyle='rgba(242,177,72,.13)';g.beginPath();g.ellipse(x,y+size*.8,size*.7,size*1.5,0,0,Math.PI*2);g.fill();g.strokeStyle='rgba(218,194,143,.2)';g.beginPath();g.ellipse(x,y+size*.8,size*1.5,size*.4,0,0,Math.PI*2);g.stroke();}
      };
      input.disabled=false;form.querySelector('button').disabled=false;
      const tick=now=>{if(!alive||!root.isConnected)return;const dt=Math.min(65,now-last);last=now;if(!Engine.isReadingModal()&&!document.hidden){time+=dt;if(released&&!busy){drift=Math.min(6000,drift+dt);root.dataset.drift=String(Math.round(drift));AudioFX.waterDrift(true,drift/6000);age+=dt;if(age>650){age=0;save();}if(drift>=6000){save();AudioFX.waterDrift(false);finish();}}draw(dt);}else AudioFX.waterDrift(false);raf=requestAnimationFrame(tick);};let raf=requestAnimationFrame(tick);
    }catch(error){reject(error);}});
  }
};

/* The painted cup stays on its actual table; only its liquid and the held jug move. */
const WineRitual={
  async enter(){
    Engine.hideDlg();Engine.setChars([]);Engine.setLight(null);Engine.hint('');Engine.fast=false;Engine.els.dlgFast.classList.remove('on');const exp=Refinements.experience();if(exp.wineShared)return;
    if(!exp.wineLocated){Engine.setBg('bg-tower');SceneCinema.set(.56,.53,1);await SceneCinema.touch('走近案上的酒杯',.56,.54,'栏前的案上，还放着他们的酒杯。');await SceneCinema.push(.56,.53,1.6,1400);}
    await SceneCinema.change('bg-wine-table',innerWidth<700?.61:.5,.5,1,1100);exp.wineLocated=true;Progress.resources();
    return new Promise(resolve=>{
      const root=document.createElement('section');root.className='wine-ritual';root.setAttribute('aria-label','在案上斟酒');root.innerHTML='<canvas class="wine-liquid" aria-hidden="true"></canvas><button class="wine-jug" aria-label="按住倾壶，松开扶正"><img src="assets/item-winepot.webp" alt="手边的铜酒壶"></button><p class="scene-caption" role="status"></p>';
      const cup=SceneCinema.target('端起斟好的酒杯',.65,.54,.18,.30);cup.classList.add('wine-cup-hit');cup.disabled=true;root.append(cup);Engine.els.stage.append(root);const jug=root.querySelector('.wine-jug'),cv=root.querySelector('canvas'),g=cv.getContext('2d'),caption=root.querySelector('.scene-caption');
      let alive=true,pouring=false,angle=0,volume=exp.wineVolume||0,last=performance.now(),age=0,time=0,busy=false,raf=0;
      const save=()=>{exp.wineVolume=Math.round(volume*1000)/1000;Progress.resources();};
      const layout=()=>{const d=Math.min(devicePixelRatio||1,1.5);cv.width=Math.round(innerWidth*d);cv.height=Math.round(innerHeight*d);g.setTransform(d,0,0,d,0,0);};const resize=new ResizeObserver(layout);resize.observe(root);layout();
      const set=value=>{if(busy||Engine.isReadingModal())return;pouring=value;if(!value)save();};jug.onpointerdown=e=>{e.stopPropagation();jug.setPointerCapture(e.pointerId);set(true);};jug.onpointerup=jug.onpointercancel=()=>set(false);jug.onblur=()=>set(false);jug.onkeydown=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();e.stopPropagation();set(true);}};jug.onkeyup=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();set(false);}};
      cup.onclick=async()=>{if(busy||cup.disabled||Engine.isReadingModal())return;busy=true;exp.wineShared=true;save();AudioFX.pour(false);caption.textContent='';AudioFX.cup();await SceneCinema.push(.65,.48,1.12,700);await Engine.showLines([{speaker:'yaoguang',text:'好，待凯旋之日，再共饮。'},{speaker:'stranger',text:'愿那时，百姓少一些忧惧，多一些安稳。'}],{log:null,chars:[]});alive=false;cancelAnimationFrame(raf);resize.disconnect();cup.dispose();root.remove();await SceneCinema.change('bg-tower',.57,.5,1,1100);resolve();};
      const draw=()=>{const f=SceneCinema.frame(),phone=innerWidth<700,p=CenserScene.point(f,.65,.424),w=f.w*(phone?.19:.22),h=w*1200/1300,c=CenserScene.point(f,(phone?.47:.30)+(phone?.08:.20)*angle,.54-.19*angle);if(phone)c.x=Math.max(70,c.x);Object.assign(jug.style,{left:c.x+'px',top:c.y+'px',width:w+'px',height:h+'px',transform:'translate(-50%,-50%) rotate('+(angle*38)+'deg)'});
        g.clearRect(0,0,innerWidth,innerHeight);if(volume>0){const rx=f.w*.085,ry=f.h*.024;g.save();g.beginPath();g.ellipse(p.x,p.y,rx*.94,ry*.9,0,0,Math.PI*2);g.clip();const fill=g.createLinearGradient(p.x,p.y-ry,p.x,p.y+ry);fill.addColorStop(0,'#6b4225');fill.addColorStop(.6,'#aa713a');fill.addColorStop(1,'#4b2f1a');g.globalAlpha=.35+volume*.6;g.fillStyle=fill;g.fillRect(p.x-rx,p.y-ry,rx*2,ry*2);g.strokeStyle='#e4be7d66';g.lineWidth=1;g.beginPath();g.ellipse(p.x,p.y,rx*(.35+volume*.57),ry*(.35+volume*.5),0,0,Math.PI*2);g.stroke();if(pouring&&angle>.55){g.strokeStyle='#e9cd9388';g.beginPath();g.ellipse(p.x,p.y,rx*(.4+Math.sin(time/150)*.12),ry*.5,0,0,Math.PI*2);g.stroke();}g.restore();}
        if(pouring&&angle>.55&&volume<1){const a=angle*38*Math.PI/180,dx=(.83-.65)*w,dy=(.30-.65)*h,ox=c.x+w*.15,oy=c.y+h*.15,sx=ox+dx*Math.cos(a)-dy*Math.sin(a),sy=oy+dx*Math.sin(a)+dy*Math.cos(a);g.strokeStyle='#e7bf7977';g.lineWidth=Math.max(1.5,f.w*.0015);g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(p.x,sy+(p.y-sy)*.35,p.x,p.y);g.stroke();}
      };
      const tick=now=>{if(!alive||!root.isConnected)return;const dt=Math.min(60,now-last);last=now;if(Engine.isReadingModal()||document.hidden)pouring=false;else{time+=dt;angle+=(Number(pouring&&volume<1)-angle)*(1-Math.exp(-dt/180));if(pouring&&angle>.55)volume=Math.min(1,volume+dt/2800);cup.disabled=volume<.98||pouring||angle>.08;root.dataset.volume=volume.toFixed(3);caption.textContent=volume>=.98?(pouring?'杯已斟满。松手扶正酒壶。':'酒流停了。轻碰杯沿，把这一杯递过去。'):'按住酒壶轻倾出酒，松手扶正。杯中的酒会留下。';age+=dt;if(age>650&&pouring){age=0;save();}draw();}AudioFX.pour(pouring&&angle>.55&&volume<1,Math.min(1,angle));raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
    });
  }
};
