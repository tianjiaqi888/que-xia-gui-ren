/* A stranger, a torch, and the first voice of an object. */
'use strict';
const EncounterScene={
  reviewMode:new URLSearchParams(location.search).get('review')==='encounter',
  reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
  isFirstListen(node){return node===SCRIPT.find(n=>n.type==='listen');},
  async scare(){
    if(typeof Actors!=='undefined'&&!Actors.raf){await new Promise(resolve=>setTimeout(resolve,0));if(Actors.raf)return this.scare();}
    const stage=Engine.els.stage;stage.classList.add('encounter');Engine.hideDlg();Engine.hint('墓室深处，忽然有影子靠近。');
    Engine.setChars([{id:'stranger',slot:'center',asset:'char-stranger-front'}]);AudioFX.whoosh();
    await TombScene.wait(this.reducedMotion?150:1000);
  },
  async igniteTorch(){
    const card=Engine.els.card;card.classList.add('torch-igniting');
    const flame=FireFX.mount(card.querySelector('.asset-item'));
    FireFX.burst(flame,{count:28,spread:1.2});AudioFX.strike();
    try{await TombScene.wait(this.reducedMotion?100:850);await StreetScene.receiveMatch();}
    finally{flame.remove();card.classList.remove('torch-igniting');}
  },
  positions:[[19,37],[31,74],[85,54],[52,24],[65,78]],
  placeWaves(){
    const r=Engine.els.stage.getBoundingClientRect(),f=TombScene.frame||{x:r.x,y:r.y,w:r.width,h:r.height};
    document.querySelectorAll('[data-encounter-wave]').forEach(b=>{const p=this.positions[+b.dataset.encounterWave];b.style.left=f.x+p[0]/100*f.w+'px';b.style.top=f.y+p[1]/100*f.h+'px';});
  },
  listen(node){return EchoSearch.enter(node);},
  reviewCheckpoint(){return new Promise(resolve=>{this.review.showModal();document.getElementById('encounter-review-continue').onclick=()=>this.review.close();this.review.addEventListener('close',()=>resolve(),{once:true});});}
};
window.addEventListener('DOMContentLoaded',()=>{
  const review=document.createElement('dialog');review.id='encounter-review';review.setAttribute('aria-labelledby','encounter-review-title');review.innerHTML='<span class="review-eyebrow">序幕 · 器物有声</span><h2 id="encounter-review-title">它们认得我，<br>我却不认得它们了。</h2><p>已与失忆男子相遇，取得火把，打开证据册，并选定了最强的回声。</p><p class="review-note">下一段将进入第一幕「射天狼」。<br>本次只验收现身、火把、证据册和聆听。</p><div class="review-actions"><a href="?review=encounter">重看本段</a><a href="?review=tomb">回到墓室初醒</a><button id="encounter-review-continue">继续第一幕原版 →</button></div>';document.body.append(review);EncounterScene.review=review;
  new MutationObserver(()=>StreetScene.syncPause?.()).observe(review,{attributes:true,attributeFilter:['open']});
  window.addEventListener('resize',()=>EncounterScene.placeWaves());
  window.addEventListener('game-node',e=>{
    const node=e.detail;
    if(node.id==='meet'||node.id==='torch'||(node.type==='book'&&Engine.els.stage.classList.contains('encounter'))||EncounterScene.isFirstListen(node)){
      Engine.els.stage.classList.add('encounter');const label=document.getElementById('scene-label');label?.classList.add('show');if(label)label.querySelector('b').textContent='序幕 · 器物有声';
    }
  });
  if(EncounterScene.reviewMode&&!StoryHistory.hasRequest())setTimeout(async()=>{
    await Promise.all(['assets/stranger.webp','assets/torch.webp','assets/tomb.webp','assets/pottery.webp'].map(src=>new Promise(resolve=>{const image=new Image();image.onload=image.onerror=resolve;image.src=src;})));
    TombScene.lit=true;Engine.setBg('bg-tomb');Engine.setLight('match');Engine.player={name:'游客',gender:'f'};Engine.start('tour',SCRIPT.findIndex(n=>n.type==='scare'));Engine.addItem('火柴');
  },0);
});

/* All five sources look alike; listening precedes committing to a direction. */

const EchoSearch={
  enter(node){return new Promise(resolve=>{
    Engine.hideDlg();Engine.setChars([]);if(Engine.els.stage.dataset.scene!=='bg-tomb')Engine.setBg('bg-tomb');Engine.setLight(Engine.items.has('火把')?'torch':'match');Engine.hint('先比较各处回声，再确定最清晰的一处。');
    const layer=document.getElementById('minigame-layer');layer.replaceChildren();layer.classList.add('show');layer.dataset.encounterState='intro';
    const intro=document.createElement('button');intro.className='encounter-listen';intro.innerHTML='<span>器 物 有 声</span><b>仔细聆听</b><small>点按各处点位聆听，比较清晰与远近；越清晰的那处越贴近石壁</small>';layer.append(intro);
    intro.onclick=()=>{AudioFX.unlock();layer.replaceChildren();layer.dataset.encounterState='listening';const heard=new Set(),buttons=[];let current=null,solved=false;
      const caption=document.createElement('p');caption.className='encounter-wave-caption';caption.textContent='点按点位听一听：编号 1–5，选最贴近石壁、最清晰的一处。';const confirm=document.createElement('button');confirm.className='echo-confirm';confirm.textContent='确定这处回声';confirm.disabled=true;layer.append(caption,confirm);
      const CLARITY=['清亮，像贴着石壁传来','发闷，像隔着一层土','很远，像从另一间墓室折回','散开了，听不清方向','被水汽吞着，只剩一点尾音'];
      const cue=index=>{if(solved||Engine.isReadingModal())return;current=index;heard.add(index);for(const b of buttons)b.classList.toggle('echo-current',Number(b.dataset.encounterWave)===index);const strong=index===0;AudioFX.directionEcho(strong,(EncounterScene.positions[index][0]-50)/55,index);
        const p=EncounterScene.positions[index],f=TombScene.frame;if(f)Engine.pointerMove(f.x+p[0]/100*f.w,f.y+p[1]/100*f.h);
        const button=buttons[index];if(button){button.classList.add('heard');const clarity=button.querySelector('.echo-clarity');if(clarity)clarity.textContent=strong?'清晰':'发闷';button.setAttribute('aria-label','聆听声源'+(index+1)+'，已听，'+(strong?'清晰':'发闷'));}
        caption.textContent='第'+(index+1)+'处回声：'+CLARITY[index]+'。'+(heard.size<2?'再听一处比较。':'已听过'+heard.size+'处，选最贴近石壁的那一处。');
        confirm.disabled=heard.size<2;
      };
      for(let index=0;index<Math.min(node.count||5,5);index++){const b=document.createElement('button');b.className='encounter-wave';b.dataset.encounterWave=index;b.setAttribute('aria-label','聆听声源'+(index+1));b.innerHTML='<span class="echo-core" data-idx="'+(index+1)+'"></span><i style="--ring:0"></i><i style="--ring:1"></i><em class="echo-clarity"></em>';b.onpointerenter=()=>{if(matchMedia('(hover:hover)').matches)cue(index);};b.onfocus=()=>cue(index);b.onclick=()=>cue(index);buttons.push(b);layer.append(b);}
      confirm.onclick=async()=>{if(current===null||heard.size<2||solved||Engine.isReadingModal())return;if(current!==0){AudioFX.wrong();caption.textContent='这一处'+CLARITY[current]+'。再比较它的清晰程度与远近。';if(Engine.mode==='detective'){Engine.damage('回声还没辨清……');if(Engine.hp<=0){solved=true;confirm.disabled=true;buttons.forEach(b=>b.disabled=true);Engine.die('稍歇一会，再凝神比较回声。',()=>{Engine.restoreHp();solved=false;buttons.forEach(b=>b.disabled=false);confirm.disabled=heard.size<2;});}}return;}
        solved=true;confirm.disabled=true;for(const b of buttons)b.disabled=true;layer.dataset.encounterState='solved';AudioFX.echo(true);Engine.hint('声音贴着画像石传来，往事正在苏醒。');await TombScene.wait(TombScene.reducedMotion?200:1000);layer.classList.remove('show');layer.replaceChildren();delete layer.dataset.encounterState;Engine.fast=false;Engine.els.dlgFast.classList.remove('on');if(EncounterScene.reviewMode)await EncounterScene.reviewCheckpoint();Engine.els.stage.classList.remove('encounter');resolve();
      };EncounterScene.placeWaves();
    };
  });}
};
