(()=>{
  'use strict';
  if(window.__eviaFirstRunIntroV1)return;
  window.__eviaFirstRunIntroV1=true;

  const INTRO_KEY='eviaFirstRunIntroV1';
  const DEMO_ID='EVIA-DEMO';
  let overlay=null;
  let currentStep=0;
  let savedName='';

  const steps=[
    {
      lines:[
        "Hi, I'm Evia.",
        'I help apprentices understand their course, collect evidence and keep track of their progress.'
      ],
      button:'Show me around'
    },
    {
      target:'courseArch',
      lines:[
        'This is Course.',
        "It shows what you're working towards and how much you've covered."
      ],
      button:'Next'
    },
    {
      target:'naxosArch',
      lines:[
        'This centre button is where your course tools and portfolio live.',
        'Your photos, videos, audio and written evidence stay together here.'
      ],
      button:'Next'
    },
    {
      target:'learnArch',
      lines:[
        'Learn keeps track of learning away from your normal work.',
        'You can add learning hours and short reflections here.'
      ],
      button:'Next'
    },
    {
      name:true,
      lines:[
        "That's the quick tour.",
        'What should I call you?'
      ],
      button:'Continue'
    },
    {
      final:true,
      lines:[],
      button:'Start demo'
    }
  ];

  function readJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch{return fallback}}
  function storedMeta(){return readJson('eviaNaxosCourseMetaV1',{})||{}}
  function courseId(meta=storedMeta()){return String(meta?.qualificationId||meta?.qualification?.id||'').trim()}
  function hasStoredCourse(){const raw=localStorage.getItem('eviaNaxosCourse');return raw!==null&&raw!==''}
  function hasRealCourse(){return hasStoredCourse()&&courseId()!==DEMO_ID}
  function isDone(){return localStorage.getItem(INTRO_KEY)==='1'}
  function markDone(){try{localStorage.setItem(INTRO_KEY,'1')}catch{}}

  function currentProfile(){
    try{if(typeof learnerProfile!=='undefined'&&learnerProfile&&typeof learnerProfile==='object')return {...learnerProfile}}catch{}
    return readJson('eviaLearnerProfile',{})||{};
  }

  function profileDisplayName(){
    const profile=currentProfile();
    return String(profile.nickname||profile.firstName||'').trim();
  }

  function saveName(value){
    const clean=String(value||'').trim().replace(/\s+/g,' ').slice(0,80);
    if(!clean)return'';
    const parts=clean.split(' ');
    const existing=currentProfile();
    const next={
      ...existing,
      firstName:parts[0]||'',
      lastName:parts.slice(1).join(' ')
    };
    try{
      if(typeof saveLearnerProfile==='function')saveLearnerProfile(next);
      else localStorage.setItem('eviaLearnerProfile',JSON.stringify(next));
    }catch{
      try{localStorage.setItem('eviaLearnerProfile',JSON.stringify(next))}catch{}
    }
    try{if(typeof learnerProfile!=='undefined')learnerProfile=next}catch{}
    return parts[0]||clean;
  }

  function speak(lines){
    const clean=(Array.isArray(lines)?lines:[lines]).map(value=>String(value||'').trim()).filter(Boolean);
    try{if(typeof setSpeech==='function'){setSpeech(clean);return}}catch{}
    const speech=document.querySelector('.evia-speech');
    if(!speech)return;
    speech.innerHTML='';
    clean.forEach(line=>{
      const node=document.createElement('div');
      node.className='speech-line';
      node.textContent=line;
      speech.appendChild(node);
    });
  }

  function injectStyles(){
    if(document.getElementById('eviaFirstRunIntroStyles'))return;
    const style=document.createElement('style');
    style.id='eviaFirstRunIntroStyles';
    style.textContent=`
      #screen.evia-first-run-active .evia-stage,
      #screen.evia-first-run-active .evia-speech{z-index:116!important}
      #eviaFirstRunIntro{position:fixed;inset:0;z-index:100;background:rgba(255,255,255,.38);backdrop-filter:blur(1px);-webkit-backdrop-filter:blur(1px);display:block}
      #eviaFirstRunIntro .evia-first-run-controls{position:absolute;left:50%;bottom:82px;transform:translateX(-50%);width:min(calc(100vw - 36px),430px);z-index:130;border:1.5px solid rgba(245,196,0,.34);border-radius:24px;background:rgba(255,255,255,.98);box-shadow:0 16px 38px rgba(0,0,0,.10);padding:14px;display:flex;flex-direction:column;gap:10px}
      #eviaFirstRunIntro .evia-first-run-progress{font-size:10px;color:rgba(45,45,45,.44);text-align:center;letter-spacing:.04em}
      #eviaFirstRunIntro button{width:100%;min-height:46px;border:1.5px solid rgba(245,196,0,.40);border-radius:999px;background:rgba(250,249,242,.98);color:rgba(45,45,45,.72);font-size:13px;font-weight:600;padding:8px 16px;cursor:pointer}
      #eviaFirstRunIntro input{width:100%;min-height:46px;border:1.5px solid rgba(245,196,0,.32);border-radius:16px;background:#fff;color:rgba(45,45,45,.82);font-size:16px;padding:10px 14px;outline:none;text-align:center}
      #eviaFirstRunIntro input:focus{border-color:rgba(245,196,0,.72);box-shadow:0 0 0 3px rgba(245,196,0,.10)}
      #eviaFirstRunIntro .evia-first-run-error{min-height:14px;font-size:11px;color:rgba(150,40,40,.72);text-align:center}
      #bottomArches.evia-first-run-raise{z-index:112!important;pointer-events:none!important}
      #bottomArches.evia-first-run-raise>button{pointer-events:none!important}
      .evia-first-run-highlight{transform:translateY(-4px) scale(1.04)!important;filter:drop-shadow(0 0 9px rgba(245,196,0,.80))!important;transition:transform 260ms ease,filter 260ms ease!important}
      @media (max-height:650px){#eviaFirstRunIntro .evia-first-run-controls{bottom:70px;padding:10px}}
    `;
    document.head.appendChild(style);
  }

  function clearHighlight(){
    document.querySelectorAll('.evia-first-run-highlight').forEach(node=>node.classList.remove('evia-first-run-highlight'));
    document.getElementById('bottomArches')?.classList.remove('evia-first-run-raise');
  }

  function highlight(targetId){
    clearHighlight();
    if(!targetId)return;
    const target=document.getElementById(targetId);
    if(!target)return;
    document.getElementById('bottomArches')?.classList.add('evia-first-run-raise');
    target.classList.add('evia-first-run-highlight');
  }

  function removeOverlay(){
    clearHighlight();
    document.getElementById('screen')?.classList.remove('evia-first-run-active');
    if(overlay){overlay.remove();overlay=null}
  }

  function makeOverlay(){
    if(overlay)return overlay;
    overlay=document.createElement('div');
    overlay.id='eviaFirstRunIntro';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Meet Evia');
    overlay.innerHTML='<div class="evia-first-run-controls"><div class="evia-first-run-progress" id="eviaFirstRunProgress"></div><div id="eviaFirstRunForm"></div><div class="evia-first-run-error" id="eviaFirstRunError"></div><button type="button" id="eviaFirstRunNext">Continue</button></div>';
    document.body.appendChild(overlay);
    document.getElementById('screen')?.classList.add('evia-first-run-active');
    overlay.querySelector('#eviaFirstRunNext')?.addEventListener('click',advance);
    return overlay;
  }

  function renderStep(){
    const step=steps[currentStep];
    if(!step)return;
    makeOverlay();
    highlight(step.target||'');
    const progress=overlay.querySelector('#eviaFirstRunProgress');
    const form=overlay.querySelector('#eviaFirstRunForm');
    const error=overlay.querySelector('#eviaFirstRunError');
    const next=overlay.querySelector('#eviaFirstRunNext');
    if(progress)progress.textContent=`MEET EVIA · ${currentStep+1} OF ${steps.length}`;
    if(error)error.textContent='';
    if(form)form.innerHTML='';

    if(step.final){
      const name=savedName||profileDisplayName()||'there';
      speak([
        `Nice to meet you, ${name}.`,
        "I've put a short demo course in Evia. It takes about ten minutes and you don't need any specialist equipment."
      ]);
    }else{
      speak(step.lines);
    }

    if(step.name&&form){
      const input=document.createElement('input');
      input.id='eviaFirstRunName';
      input.type='text';
      input.autocomplete='name';
      input.maxLength=80;
      input.placeholder='Your name';
      input.value=profileDisplayName();
      input.setAttribute('aria-label','Your name');
      input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();advance()}});
      form.appendChild(input);
      setTimeout(()=>input.focus(),80);
    }
    if(next)next.textContent=step.button||'Continue';
  }

  function waitForDemoThenOpenCourse(attempt=0){
    const active=window.eviaDemoCourse?.isActive?.()||courseId()===DEMO_ID;
    const courseButton=document.getElementById('courseArch');
    if(active&&courseButton){setTimeout(()=>courseButton.click(),450);return}
    if(attempt<30)setTimeout(()=>waitForDemoThenOpenCourse(attempt+1),150);
  }

  function finishIntro(){
    markDone();
    removeOverlay();
    const name=savedName||profileDisplayName();
    speak(name?[`Have a go, ${name}.`,'Start with any item in the demo course.']:['Have a go.','Start with any item in the demo course.']);
    waitForDemoThenOpenCourse();
  }

  function advance(){
    const step=steps[currentStep];
    if(!step)return;
    if(step.name){
      const input=overlay?.querySelector('#eviaFirstRunName');
      const error=overlay?.querySelector('#eviaFirstRunError');
      const value=String(input?.value||'').trim();
      if(!value){if(error)error.textContent='Enter the name you would like Evia to use.';input?.focus();return}
      savedName=saveName(value);
    }
    if(step.final){finishIntro();return}
    currentStep+=1;
    renderStep();
  }

  function startIfNeeded(attempt=0){
    if(isDone())return;
    if(hasRealCourse()){markDone();return}
    const screen=document.getElementById('screen');
    if(!screen||typeof setSpeech!=='function'){
      if(attempt<40)setTimeout(()=>startIfNeeded(attempt+1),150);
      return;
    }
    injectStyles();
    currentStep=0;
    savedName='';
    renderStep();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>startIfNeeded(),250),{once:true});
  else setTimeout(()=>startIfNeeded(),250);

  window.eviaFirstRunIntro={
    isComplete:isDone
  };
})();
