/* Late-loaded completion layer. Story text and evidence stay in data.js. */
'use strict';
const Chapters={
  starts(){const names=['第一幕','第二幕','第三幕','第四幕','第五幕','终幕','尾声'];return names.map(name=>({name,index:SCRIPT.findIndex(n=>n.type==='intertitle'&&n.title===name)}));},
  layer(){Engine.hideDlg();const l=document.getElementById('minigame-layer');l.replaceChildren();l.classList.add('show');return l;},
  finish(layer,resolve){layer.classList.remove('show');layer.replaceChildren();resolve();},
  clean(text){return String(text||'').replace(/（内心想法[：:]/g,'（').replace('官职：【】、','官职：尚书侍郎、');},
  narration(text){
    // Mixed storyboard notes retain only the events that the visitor witnesses.
    const rewrites=[
      ['大的铜凤鸟','铜凤鸟突然转向你，头颈逼近。暗红的泪从眼缘滑落，喉间挤出嘶哑的鸣声。'],
      ['切换后即为','冬日，铜熏炉飘着熏香。一名属吏把名帖放到案边，冯焕未动。'],
      ['玩家继续探索','你继续探索，火光照亮了石壁上的另一件文物。'],
      ['耳边传来声音','耳边传来人群的声音。'],
      ['画面改变：二人','二人已走到河边。'],
      ['放河灯','河灯随水远去。楼阁之上，姚光与冯焕持杯而立，面前是铺满灯火的河流。'],
      ['说罢，其小吏','小吏强行带走了冯焕。冯绲目送一身白衣的父亲渐渐远去。'],
      ['待冯绲离开','冯绲离开后，冯焕吐出了一口鲜血。'],
      ['脚步声临近','脚步声临近，冯焕叫住对方：“大人，留步。”他请求借来纸笔。'],
      ['凑近发现','凑近一看，那是一枚玉蝉。'],
      ['画面中出现一个下人','一名下人走了过来。'],
      ['画面再次回归到冯绲','冯绲的车队远去，终于回到宕渠。双阙已在故乡立起。'],
      ['讲述完，场景回归','墓室在四周坍塌，天地苍茫，只余双阙。冯焕周身的黑雾散尽，终于完整地站在你面前。'],
      ['最终走到阙前','你们走到阙前。石块散落在地，双阙之间的门紧闭着。'],
    ];
    for(const [fragment,result]of rewrites)if(text.includes(fragment))return result;
    if(/语音可做|可替换|画面|屏幕|镜头|制作|交互|提示玩家|线索提示|引导玩家|游客口述|左上角|程序模拟|随着冯焕走远|玩家举着火把/.test(text))return null;
    return this.clean(text);
  },
  chapterHref(key,mode){return '?chapter='+encodeURIComponent(key)+(mode==='detective'?'&mode=detective':'');},
  cleanNode(node){
    const clone={...node};
    if(node.lines)clone.lines=node.lines.flatMap(line=>{if(typeof line==='string')return[this.clean(line)];const text=line.cls==='narration'?this.narration(line.text):this.clean(line.text);return text===null?[]:[{...line,text}];});
    if(clone.type==='transition'&&/画面：|最终定格|直接跳转/.test(clone.text||''))clone.text='';
    return clone;
  },
  writing(){return new Promise(resolve=>{
    const l=this.layer(),w=document.createElement('section');w.className='chapter-writing';w.innerHTML='<h2>上书自讼 · 落笔</h2><p>按住纸面书写，让申诉穿过牢狱。</p><canvas width="900" height="390" aria-label="书写申诉的纸面"></canvas><progress max="1" value="0" aria-label="书写进度"></progress><button>执笔续写一行</button>';l.append(w);
    const cv=w.querySelector('canvas'),g=cv.getContext('2d'),meter=w.querySelector('progress'),button=w.querySelector('button');let drawing=false,last=null,ink=0,finished=false;
    const add=(p,q)=>{if(finished||Engine.isReadingModal())return;g.strokeStyle='#2d2922';g.lineWidth=3.5;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();ink+=Math.min(100,Math.hypot(q.x-p.x,q.y-p.y));meter.value=Math.min(1,ink/1900);if(ink>=1900){finished=true;button.disabled=true;AudioFX.collect();Engine.toast('收笔——愿此书能还众人清白。','good');TombScene.wait(650).then(()=>this.finish(l,resolve));}};
    const point=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*900/r.width,y:(e.clientY-r.top)*390/r.height};};
    cv.onpointerdown=e=>{e.stopPropagation();if(finished||Engine.isReadingModal())return;drawing=true;last=point(e);cv.setPointerCapture(e.pointerId);};
    cv.onpointermove=e=>{if(!drawing)return;for(const sample of (e.getCoalescedEvents?.()||[e])){const p=point(sample);add(last,p);last=p;}};
    cv.onpointerup=e=>{if(drawing)add(last,point(e));drawing=false;last=null;};cv.onpointercancel=()=>{drawing=false;last=null;};
    button.onclick=()=>{const y=65+Math.min(4,Math.floor(ink/430))*56;for(let x=100;x<650;x+=40)add({x,y},{x:x+26,y:y+Math.sin(x)*10});};
  });},
  jade(){return new Promise(resolve=>{
    const l=this.layer(),panel=document.createElement('section');panel.className='chapter-jade';
    const portrait=buildAsset('char-fenghuan-dead','char');portrait.classList.add('jade-portrait');panel.append(portrait);
    const target=document.createElement('button');target.className='chapter-jade-target';target.textContent='安置玉蝉';target.setAttribute('aria-label','安置玉蝉，拖动玉蝉至此或选中后点击');panel.append(target);
    const item=document.createElement('button');item.className='chapter-jade-item';item.append(buildAsset('item-yuchan','item'));item.setAttribute('aria-label','选择玉蝉');panel.append(item);
    const label=document.createElement('p');label.textContent='拖至下方“安置玉蝉”区域，或先选玉蝉，再点按钮。';panel.append(label);l.append(panel);
    let selected=false,done=false,start=null,dragging=false;
    const complete=async()=>{if(done||!selected||Engine.isReadingModal())return;done=true;item.disabled=target.disabled=true;target.classList.add('placed');AudioFX.collect();Engine.toast('玉蝉已安放。','good');await TombScene.wait(700);this.finish(l,resolve);};
    item.onclick=()=>{selected=true;item.classList.add('selected');};target.onclick=complete;
    item.onpointerdown=e=>{e.stopPropagation();if(done||Engine.isReadingModal())return;dragging=true;selected=true;start={x:e.clientX,y:e.clientY};item.setPointerCapture(e.pointerId);};
    item.onpointermove=e=>{if(dragging)item.style.transform=`translate(${e.clientX-start.x}px,${e.clientY-start.y}px)`;};
    item.onpointerup=e=>{if(!dragging)return;dragging=false;const r=target.getBoundingClientRect(),pad=24;if(e.clientX>=r.left-pad&&e.clientX<=r.right+pad&&e.clientY>=r.top-pad&&e.clientY<=r.bottom+pad)complete();else{item.style.transform='';item.classList.add('selected');Engine.toast('玉蝉已选中，轻点安置处即可。','info');}};
    item.onpointercancel=()=>{dragging=false;item.style.transform='';};
  });},
  credits(node){return new Promise(resolve=>{
    const l=this.layer(),panel=document.createElement('section');panel.className='chapter-credits';const heading=document.createElement('h2');heading.textContent='此梦留痕';panel.append(heading);
    for(const line of node.lines||[]){const p=document.createElement('p');p.textContent=line;panel.append(p);}const button=document.createElement('button');button.textContent='查看渠县汉阙导览';button.onclick=()=>this.finish(l,resolve);panel.append(button);l.append(panel);
  });},
  install(){
    const originalRun=Engine.runNode.bind(Engine);Engine.runNode=async node=>{const cleaned=this.cleanNode(node);if(this.isOriginalListen(node))return originalRun(node);return originalRun(cleaned);};
    // Object identity distinguishes the first listen, so preserve its original node.
    Minigames.writing=node=>this.writing(node);Minigames.jade=node=>this.jade(node);Minigames.credits=node=>this.credits(node);
    const originalScene=Engine.nodeScene.bind(Engine);Engine.nodeScene=async node=>{Engine.els.stage.dataset.atmosphere=this.atmosphere(node.bg);return originalScene(node);};
    const transition=Engine.nodeTransition.bind(Engine);Engine.nodeTransition=async node=>{if(['fx-white','item-yuchan'].includes(node.asset))return transition({...node,effect:'fade',asset:null,dur:650,text:''});if(node.effect==='flash'&&!node.asset)node={...node,asset:'bg-feast'};return transition(node);};
    const fx=document.createElement('div');fx.id='chapter-atmosphere';fx.setAttribute('aria-hidden','true');fx.innerHTML='<i></i><i></i><i></i>';Engine.els.stage.append(fx);
    const strip=()=>{document.querySelectorAll('#minigame-layer .ph-tag,#fx-layer .ph-tag,.blood-note,.ink-note,.eye-note,.ins-note,.writing-note,.jade-note,.redflash-note').forEach(e=>e.remove());const corpse=document.querySelector('.jade-corpse');if(corpse&&!corpse.querySelector('.asset'))corpse.append(buildAsset('char-fenghuan-dead','char'));document.querySelectorAll('.eye').forEach(e=>e.setAttribute('aria-label','擦去泪水'));};
    const observer=new MutationObserver(strip);observer.observe(document.getElementById('minigame-layer'),{childList:true,subtree:true});observer.observe(Engine.els.fx,{childList:true,subtree:true});
    const nav=document.createElement('button');nav.id='chapter-nav-open';nav.textContent='章节';nav.onclick=()=>{for(const a of this.nav.querySelectorAll('a[data-chapter]'))a.href=this.chapterHref(a.dataset.chapter,Engine.mode);this.nav.showModal();if(typeof AudioFX!=='undefined'&&AudioFX.refresh)AudioFX.refresh();};document.getElementById('game').append(nav);
    const d=document.createElement('dialog');d.id='chapter-nav';d.innerHTML='<h2>梦中拾忆</h2><p>选择一幕预览，不覆盖正式进度。</p>';const prologue=document.createElement('a');prologue.textContent='序幕 · 昏沉梦';prologue.dataset.chapter='prologue';prologue.href=this.chapterHref('prologue',new URLSearchParams(location.search).get('mode'));d.append(prologue);for(const [index,item]of this.starts().entries()){const a=document.createElement('a');a.textContent=item.name;a.dataset.chapter=({'终幕':'final','尾声':'epilogue'}[item.name]||String(index+1));a.href=this.chapterHref(a.dataset.chapter,new URLSearchParams(location.search).get('mode'));d.append(a);}const close=document.createElement('button');close.textContent='返回故事';close.onclick=()=>d.close();d.append(close);document.body.append(d);this.nav=d;
    const reading=Engine.isReadingModal.bind(Engine);Engine.isReadingModal=()=>d.open||reading();
    const sync=()=>{StreetScene.syncPause?.();if(typeof AudioFX!=='undefined'&&AudioFX.refresh)AudioFX.refresh();};new MutationObserver(sync).observe(d,{attributes:true,attributeFilter:['open']});
    const key=new URLSearchParams(location.search).get('chapter');if(key&&!StoryHistory.hasRequest()){const index=key==='final'?5:key==='epilogue'?6:Number(key)-1;const target=key==='prologue'?{index:0}:this.starts()[index];if(target&&target.index>=0){Engine.player={name:'游客',gender:'f'};Engine.start(new URLSearchParams(location.search).get('mode')==='detective'?'detective':'tour',target.index);if(target.index>0){Engine.addItem('火柴');Engine.addItem('火把');TombScene.lit=true;}for(const prior of SCRIPT.slice(0,target.index)){for(const line of prior.lines||[])for(const id of line.evidence||[])Engine.collectEvidence(id);for(const id of prior.evidence||[])Engine.collectEvidence(id);}}}
  },
  isOriginalListen(node){return EncounterScene.isFirstListen(node);},
  atmosphere(bg){if(/censer|fenghuan|shufang|tent/.test(bg||''))return'smoke';if(/river|tower/.test(bg||''))return'river';if(/coffin|funeral/.test(bg||''))return'ash';if(/camp|feast|fair/.test(bg||''))return'embers';if(/prison/.test(bg||''))return'cold';if(/shuangque|que-built/.test(bg||''))return'gate';return'';}
};
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>Chapters.install(),0));
