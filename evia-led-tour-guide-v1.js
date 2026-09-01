(()=>{
  'use strict';
  if(window.__eviaLedTourGuideV1)return;
  window.__eviaLedTourGuideV1=true;

  const DEMO_ID='EVIA-DEMO';
  let avatar=null;
  let bubble=null;
  let active=false;
  let originalStage=null;
  let originalSpeech=null;
  let stageVisibility='';
  let speechVisibility='';
  let lastStep='';
  let syncTimer=0;

  function readJson(key,fallback){
    try{const value=JSON.parse(localStorage.getItem(key)||'null');return value===null?fallback:value}catch{return fallback}
  }

  function isDemo(){
    const meta=readJson('eviaNaxosCourseMetaV1',{})||{};
    return String(meta?.qualificationId||meta?.qualification?.id||'').trim()===DEMO_ID;
  }

  function stripIds(node){
    if(!node)return;
    if(node.removeAttribute)node.removeAttribute('id');
    node.querySelectorAll?.('[id]').forEach(child=>child.removeAttribute('id'));
  }

  function injectStyles(){
    if(document.getElementById('eviaLedTourGuideV1Styles'))return;
    const style=document.createElement('style');
    style.id='eviaLedTourGuideV1Styles';
    style.textContent=`
      #eviaLedTourAvatarV1{position:fixed!important;left:50vw;top:34vh;width:1em!important;height:1em!important;font-size:78px!important;transform:translate(-50%,-50%)!important;z-index:3605!important;pointer-events:none!important;transition:left 760ms cubic-bezier(.22,1,.36,1),top 760ms cubic-bezier(.22,1,.36,1),font-size 420ms ease!important;visibility:visible!important;opacity:1!important}
      #eviaLedTourAvatarV1 .evia-float{animation:eviaLedTourBobV1 1800ms ease-in-out infinite!important}
      #eviaLedTourAvatarV1 .evia-float::before{opacity:1!important}
      #eviaLedTourBubbleV1{position:fixed;z-index:3604;width:min(290px,calc(100vw - 28px));border:1.5px solid rgba(245,196,0,.36);border-radius:22px;background:rgba(255,255,255,.985);box-shadow:0 14px 36px rgba(0,0,0,.10);padding:12px 14px;text-align:left;color:rgba(45,45,45,.72);pointer-events:none;transition:left 760ms cubic-bezier(.22,1,.36,1),top 760ms cubic-bezier(.22,1,.36,1)}
      #eviaLedTourBubbleV1 strong{display:block;font-size:14px;line-height:1.25;color:rgba(45,45,45,.86);margin-bottom:5px}
      #eviaLedTourBubbleV1 p{font-size:12px;line-height:1.42;margin:0}
      #eviaLedTourBubbleV1 p+p{margin-top:3px}
      body.evia-led-tour-v1 #eviaFirstRunGuideV3 .evia-tour-title,body.evia-led-tour-v1 #eviaFirstRunGuideV3 .evia-tour-copy{display:none!important}
      body.evia-led-tour-v1 #eviaFirstRunGuideV3{width:min(calc(100vw - 28px),360px)!important;padding:10px 12px!important;gap:7px!important;z-index:3610!important}
      body.evia-led-tour-v1 #eviaFirstRunGuideV3 .evia-tour-progress{font-size:9px!important}
      @keyframes eviaLedTourBobV1{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
      @media(max-width:520px){#eviaLedTourAvatarV1{font-size:68px!important}#eviaLedTourBubbleV1{width:min(250px,calc(100vw - 24px))}}
    `;
    document.head.appendChild(style);
  }

  function makeAvatar(){
    if(avatar)return avatar;
    originalStage=document.getElementById('eviaStage');
    if(!originalStage)return null;
    avatar=originalStage.cloneNode(true);
    stripIds(avatar);
    avatar.id='eviaLedTourAvatarV1';
    avatar.classList.remove('evia-tour-highlight-v3','evia-tour-final-v3');
    avatar.querySelectorAll('.evia-tour-highlight-v3').forEach(node=>node.classList.remove('evia-tour-highlight-v3'));
    avatar.querySelector('.evia-float')?.classList.add('talking');
    avatar.querySelector('.evia-character')?.classList.add('talking');
    document.body.appendChild(avatar);
    stageVisibility=originalStage.style.visibility;
    originalStage.style.visibility='hidden';
    originalSpeech=document.querySelector('.evia-speech');
    if(originalSpeech){speechVisibility=originalSpeech.style.visibility;originalSpeech.style.visibility='hidden'}
    return avatar;
  }

  function makeBubble(){
    if(bubble)return bubble;
    bubble=document.createElement('div');
    bubble.id='eviaLedTourBubbleV1';
    bubble.setAttribute('aria-live','polite');
    document.body.appendChild(bubble);
    return bubble;
  }

  function cleanup(){
    active=false;
    lastStep='';
    clearTimeout(syncTimer);
    avatar?.remove();avatar=null;
    bubble?.remove();bubble=null;
    document.body.classList.remove('evia-led-tour-v1');
    if(originalStage){originalStage.style.visibility=stageVisibility;originalStage=null}
    if(originalSpeech){originalSpeech.style.visibility=speechVisibility;originalSpeech=null}
  }

  function stepTitle(){return String(document.getElementById('eviaTourTitleV3')?.textContent||'').trim()}
  function stepLines(){
    return [...(document.getElementById('eviaTourCopyV3')?.children||[])].map(node=>String(node.textContent||'').trim()).filter(Boolean);
  }

  function toolKey(title){
    const map={Chat:'chat',Targets:'targets',Profile:'profile',EPA:'epa',Settings:'settings'};
    return map[title]||'';
  }

  function targetFor(title){
    const map={
      Time:'#timeArch',
      Course:'#courseArch',
      'Course tools':'#naxosArch',
      Attendance:'#attendanceArch',
      Learn:'#learnArch',
      'More tools':'#eviaToolsMenuButton'
    };
    if(map[title])return document.querySelector(map[title]);
    const tool=toolKey(title);
    if(tool)return document.querySelector(`[data-evia-tool="${tool}"]`)||document.getElementById('eviaToolsMenuButton');
    if(title==='Evidence'||title==='Evidence becomes progress')return document.getElementById('eviaDemoEvidenceTourCardV3')||document.getElementById('courseArch');
    return null;
  }

  function ensureToolMenu(title){
    const tool=toolKey(title);
    if(!tool)return;
    const menu=document.getElementById('eviaToolsMenu');
    const button=document.getElementById('eviaToolsMenuButton');
    if(menu&&button&&!menu.classList.contains('open')){
      try{button.click()}catch{}
    }
  }

  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

  function destination(target,title){
    const w=window.innerWidth,h=window.innerHeight;
    if(!target){return{x:w*.5,y:title==='First things first'?h*.30:h*.34}}
    const r=target.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    if(r.top>h*.72)return{x:clamp(cx,52,w-52),y:clamp(r.top-62,72,h-120)};
    if(r.top<120&&r.left>w*.55)return{x:clamp(r.left-58,56,w-56),y:clamp(r.bottom+58,70,h-110)};
    if(toolKey(title)){
      const preferLeft=r.left>130;
      return{x:clamp(preferLeft?r.left-54:r.right+54,52,w-52),y:clamp(cy,75,h-120)};
    }
    if(title==='Evidence'||title==='Evidence becomes progress')return{x:clamp(r.right-24,58,w-58),y:clamp(r.top+54,78,h-130)};
    return{x:clamp(cx,52,w-52),y:clamp(cy-66,75,h-120)};
  }

  function placeBubble(x,y,title,lines){
    const b=makeBubble();
    if(!b)return;
    b.innerHTML=`<strong>${escapeHtml(title||'Meet Evia')}</strong>${lines.map(line=>`<p>${escapeHtml(line)}</p>`).join('')}`;
    const w=window.innerWidth,h=window.innerHeight;
    const bw=Math.min(290,w-28);
    let left=x<w*.52?x+54:x-bw-54;
    left=clamp(left,12,w-bw-12);
    let top=y-58;
    if(y>h*.68)top=y-160;
    if(y<150)top=y+56;
    top=clamp(top,62,h-220);
    b.style.left=`${Math.round(left)}px`;
    b.style.top=`${Math.round(top)}px`;
  }

  function escapeHtml(value){
    return String(value||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }

  function bounce(){
    if(!avatar?.animate)return;
    try{
      avatar.animate([
        {transform:'translate(-50%,-50%) scale(1)'},
        {transform:'translate(-50%,-58%) scale(1.045)',offset:.38},
        {transform:'translate(-50%,-47%) scale(.985)',offset:.68},
        {transform:'translate(-50%,-50%) scale(1)'}
      ],{duration:620,easing:'cubic-bezier(.22,1,.36,1)'});
    }catch{}
  }

  function sync(){
    const guide=document.getElementById('eviaFirstRunGuideV3');
    if(!guide||!isDemo()){if(active)cleanup();return}
    active=true;
    injectStyles();
    document.body.classList.add('evia-led-tour-v1');
    if(!makeAvatar())return;
    const title=stepTitle()||'Meet Evia';
    const lines=stepLines();
    ensureToolMenu(title);
    clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>{
      const target=targetFor(title);
      const point=destination(target,title);
      avatar.style.left=`${Math.round(point.x)}px`;
      avatar.style.top=`${Math.round(point.y)}px`;
      placeBubble(point.x,point.y,title,lines);
      if(title!==lastStep){bounce();lastStep=title}
    },toolKey(title)?120:30);
  }

  const observer=new MutationObserver(()=>sync());
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',()=>{if(active)sync()});
  window.addEventListener('orientationchange',()=>setTimeout(()=>{if(active)sync()},180));
  setTimeout(sync,200);
})();
