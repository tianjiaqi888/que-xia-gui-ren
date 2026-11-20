/* Scene actions start conversations. Characters speak original lines in order. */
'use strict';
const StoryPlay={
  paused:false,
  triggers:{
    meet:{label:'回应黑影',x:56,y:49},
    tent:{label:'察看军情图',x:50,y:63},
    'act4-prison':{label:'走近牢门',x:32,y:44},
    'epi-que':{label:'走近讲解员',x:43,y:49}
  },
  policy(node,line,index,lines){
    if(node.id?.startsWith('recall'))return 'auto';
    if(line.evidence?.length||line.pose||line.cls==='action')return 'manual';
    if(['act5-lingtang','act5-lingtang2','act5-lingtang3','final-que'].includes(node.id))return 'manual';
    if((line.text||'').length>85)return 'manual';
    if(line.speaker==='tourist'&&/[？?]/.test(line.text||''))return 'manual';
    if(index===lines.length-1&&['meet','tent','act2-study2','act3-tower','act4-prison','final-tomb','final-walk','epi-que'].includes(node.id))return 'manual';
    return 'auto';
  },
  duration(line){return Math.max(1800,Math.min(7500,1050+(line.text||'').length*105));},
  async trigger(node){
    if(node.id==='act5-songxing')return FarewellScene.approach();
    if(node.id==='act2-tomb')return NarrativeScenes.phoenixLight();
    if(node.id==='act3-fair')return NarrativeScenes.approachStage();
    const cue=this.triggers[node.id];if(!cue)return;
    Engine.hideDlg();Engine.hint('靠近发光处，触发眼前的对话。');
    await new Promise(resolve=>{
      const layer=document.createElement('section');layer.className='story-play-layer';layer.setAttribute('aria-label','场景任务');
      const point=document.createElement('button');point.className='story-cue';point.textContent=cue.label;point.setAttribute('aria-label',cue.label);point.style.left=(innerWidth<700?Math.max(28,Math.min(72,cue.x)):cue.x)+'%';point.style.top=cue.y+'%';
      point.onclick=()=>{if(Engine.isReadingModal())return;AudioFX.unlock();AudioFX.click();layer.remove();resolve();};layer.append(point);Engine.els.stage.append(layer);
    });
  },
  async show(lines,ctx){
    const node=Engine.currentNode||{},start=ctx.checkpoint?(Engine._resumeLine||0):0;Engine._resumeLine=0;
    this.setPaused(false);
    if(ctx.checkpoint){const alreadyStarted=Engine._resumeDialogue;Engine._resumeDialogue=false;if(start===0&&!alreadyStarted)await this.trigger(node);}
    Engine.els.dlg.classList.add('show');this.pauseButton.hidden=false;
    try{
      for(let i=start;i<lines.length;i++){
        if(ctx.checkpoint)Progress.line(i);
        if(ctx.checkpoint)await NarrativeScenes.line(node,lines[i],i);
        this.gloss.hidden=!(lines[i].text||'').includes('浮一大白');
        const kind=this.policy(node,lines[i],i,lines);
        Engine.els.dlg.dataset.pacing=kind;
        Engine.els.dlgContinue&&(Engine.els.dlgContinue.textContent=kind==='auto'?'对话继续中 · 点按可略过停顿':'▼ 点击继续');
        Engine.hint(kind==='auto'?'人物正在交谈，可随时暂停或点按继续。':'留意他的这句话，准备好后再继续。');
        await Engine.renderLine(lines[i],ctx,kind==='auto'?this.duration(lines[i]):0,{lineIndex:i});
      }
    }finally{this.setPaused(false);this.pauseButton.hidden=true;this.gloss.hidden=true;delete Engine.els.dlg.dataset.pacing;Engine.hideDlg();}
  },
  setPaused(value){this.paused=value;if(this.pauseButton)this.pauseButton.textContent=value?'继续对话':'暂停对话';const badge=document.getElementById('reading-paused');if(badge)badge.textContent=value?'对话已暂停':'开卷阅证 · 剧情暂停';if(typeof StreetScene!=='undefined')StreetScene.syncPause?.();if(typeof AudioFX!=='undefined'&&AudioFX.refresh)AudioFX.refresh();},
  install(){
    EncounterScene.igniteTorch=async()=>{await TombScene.wait(TombScene.reducedMotion?0:250);};
    const card=Engine.nodeCard.bind(Engine);Engine.nodeCard=(node,kind)=>card(node.id==='torch'?{...node,title:'燃着的火把',desc:'火焰贴着焦黑的布头燃烧。他示意你接过，用它照亮前路。',button:'接过火把',toast:'火把已接过，眼前明亮了一些。'}:node,kind);
    Engine.els.dlgContinue=document.getElementById('dlg-continue');
    const gloss=document.createElement('p');gloss.id='dialogue-gloss';gloss.hidden=true;gloss.textContent='浮一大白：这里是说，痛快地饮尽这一大杯酒。';Engine.els.dlgText.after(gloss);this.gloss=gloss;
    const pause=document.createElement('button');pause.id='dialogue-pause';pause.hidden=true;pause.textContent='暂停对话';pause.onclick=e=>{e.stopPropagation();this.setPaused(!this.paused);};Engine.els.dlg.append(pause);this.pauseButton=pause;
    const reading=Engine.isReadingModal.bind(Engine);Engine.isReadingModal=()=>this.paused||reading();
    const modal=Engine.isReadingModal.bind(Engine);Engine.isReadingModal=()=>!!document.querySelector('.stone-learning[open]')||modal();
    const original=Engine.showLines.bind(Engine);Engine.showLines=(lines,ctx={})=>{
      const node=Engine.currentNode||{};
      if(new URLSearchParams(location.search).get('dialogue')==='classic'||['bus','street'].includes(node.id)||!lines.length)return original(lines,ctx);
      return this.show(lines,ctx);
    };
  }
};
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>StoryPlay.install(),0));
