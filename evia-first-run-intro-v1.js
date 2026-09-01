(()=>{
  'use strict';
  if(window.__eviaFirstRunTourV3)return;
  window.__eviaFirstRunTourV3=true;

  const INTRO_KEY='eviaFirstRunTourV3';
  const DEMO_ID='EVIA-DEMO';
  const DEMO_STATE_KEY='eviaDemoTourStateV1';
  const ATTENDANCE_KEY='eviaAttendanceDataV1';
  const TARGETS_KEY='eviaMilosTargetsV1';
  const EPA_CONFIDENCE_KEY='eviaEpaConfidenceV1';
  const EPA_PRACTICE_KEY='eviaEpaPracticeV1';
  const EPA_FORMAL_KEY='eviaMilosEpaReadinessV1';
  const LEARNING_KEY='eviaLearningEntries';

  let guide=null;
  let stepIndex=0;
  let savedName='';
  let finalTapHandler=null;
  let importPatched=false;

  const steps=[
    {kind:'intro',title:'Meet Evia',lines:["Hi, I'm Evia.",'I help apprentices understand their course, collect evidence, record learning and keep track of progress.'],button:'Show me around'},
    {kind:'name',title:'First things first',lines:['What should I call you?'],button:'Continue'},
    {kind:'time',title:'Time',lines:['This shows where a learner is in their programme.','For this demo I have added example start and end dates so you can see it working.'],button:'Next'},
    {kind:'course',title:'Course',lines:['This shows the knowledge, skills and behaviours in the course.','As evidence is added, the learner can see exactly what has been covered.'],button:'Next'},
    {kind:'centre',title:'Course tools',lines:['The centre button opens the course tools.','This is where a learner can scan an approved course and open their portfolio.'],button:'Next'},
    {kind:'attendance',title:'Attendance',lines:['Attendance can show college and workplace attendance separately.','The demo uses example figures so you can see the progress view immediately.'],button:'Next'},
    {kind:'learn',title:'Learn',lines:['Learn keeps learning hours and reflections together.','It also shows progress towards the required learning hours for the programme.'],button:'Next'},
    {kind:'menu',title:'More tools',lines:['The three-line menu opens five more parts of Evia: Chat, Targets, Profile, EPA and Settings.'],button:'Show me'},
    {kind:'chat',title:'Chat',lines:['Chat is where a learner works with me directly.','I can run a quick review, check in, teach a topic or test their knowledge.'],button:'Next'},
    {kind:'targets',title:'Targets',lines:['Targets keeps review actions visible between visits.','I have added two example targets so you can see how they would look.'],button:'Next'},
    {kind:'profile',title:'Profile',lines:['Profile holds the learner details Evia needs locally.','The name you gave me and the example programme dates are shown here.'],button:'Next'},
    {kind:'epa',title:'EPA',lines:['EPA brings readiness into one place.','It can combine course coverage, confidence, practice, learning progress and formal readiness.'],button:'Next'},
    {kind:'settings',title:'Settings',lines:['Settings lets Evia adapt to the learner.','There are accessibility options for reading, text size, contrast, motion and thinking time.'],button:'Next'},
    {kind:'evidence',title:'Evidence',lines:['This is the important part.','A learner opens a course activity, sees the recommended evidence and captures it in Evia.'],button:'Next'},
    {kind:'evidence2',title:'Evidence becomes progress',lines:['Evidence can be photos, video, audio or writing.','One useful submission can cover several mapped requirements, update progress and stay in the portfolio.'],button:'Finish tour'}
  ];

  function readJson(key,fallback){
    try{const value=JSON.parse(localStorage.getItem(key)||'null');return value===null?fallback:value}catch{return fallback}
  }
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  function storedMeta(){return readJson('eviaNaxosCourseMetaV1',{})||{}}
  function courseId(meta=storedMeta()){return String(meta?.qualificationId||meta?.qualification?.id||'').trim()}
  function hasStoredCourse(){const raw=localStorage.getItem('eviaNaxosCourse');return raw!==null&&raw!==''}
  function hasRealCourse(){return hasStoredCourse()&&courseId()!==DEMO_ID}
  function isDemoCourse(){return courseId()===DEMO_ID||window.eviaDemoCourse?.isActive?.()===true}
  function isDone(){return localStorage.getItem(INTRO_KEY)==='1'}
  function markDone(){try{localStorage.setItem(INTRO_KEY,'1')}catch{}}

  function isoDate(date){
    const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }
  function relativeProgrammeDates(){
    const now=new Date();
    const start=new Date(now.getFullYear(),now.getMonth()-8,now.getDate());
    const end=new Date(now.getFullYear(),now.getMonth()+16,now.getDate());
    return {startDate:isoDate(start),endDate:isoDate(end)};
  }

  function currentProfile(){
    try{if(typeof learnerProfile!=='undefined'&&learnerProfile&&typeof learnerProfile==='object')return {...learnerProfile}}catch{}
    return readJson('eviaLearnerProfile',{})||{};
  }
  function applyProfile(profile){
    writeJson('eviaLearnerProfile',profile);
    try{if(typeof learnerProfile!=='undefined'&&learnerProfile&&typeof learnerProfile==='object')Object.assign(learnerProfile,profile)}catch{}
  }
  function displayName(){const profile=currentProfile();return String(profile.nickname||profile.firstName||'').trim()}
  function saveName(value){
    const clean=String(value||'').trim().replace(/\s+/g,' ').slice(0,80);
    if(!clean)return'';
    const parts=clean.split(' '),existing=currentProfile();
    applyProfile({...existing,firstName:parts[0]||'',lastName:parts.slice(1).join(' ')});
    return parts[0]||clean;
  }

  function demoState(){const value=readJson(DEMO_STATE_KEY,{});return value&&typeof value==='object'?value:{}}
  function rememberBackup(state,name,key){
    if(Object.prototype.hasOwnProperty.call(state,name))return;
    const raw=localStorage.getItem(key);
    state[name]={exists:raw!==null,raw:raw===null?'':raw};
  }
  function restoreBackup(record,key){
    if(!record)return;
    try{if(record.exists)localStorage.setItem(key,record.raw||'');else localStorage.removeItem(key)}catch{}
  }
  function fakeLearningEntries(){
    const now=Date.now();
    return [
      {id:'evia-demo-tour-learning-1',createdAt:new Date(now-21*86400000).toISOString(),text:'Reviewed course expectations and discussed how evidence can cover more than one requirement.',hours:26,evidencePath:[],evidenceLabel:'Demo learning',courseTitle:'Evia Demo — Meet Evia',evidenceUse:'OTJ/GLH learning evidence',eviaDemoTour:true},
      {id:'evia-demo-tour-learning-2',createdAt:new Date(now-12*86400000).toISOString(),text:'Practised explaining a task clearly and reflecting on what could be improved.',hours:28,evidencePath:[],evidenceLabel:'Demo learning',courseTitle:'Evia Demo — Meet Evia',evidenceUse:'OTJ/GLH learning evidence',eviaDemoTour:true},
      {id:'evia-demo-tour-learning-3',createdAt:new Date(now-5*86400000).toISOString(),text:'Completed guided learning and recorded a short reflection in Evia.',hours:24,evidencePath:[],evidenceLabel:'Demo learning',courseTitle:'Evia Demo — Meet Evia',evidenceUse:'OTJ/GLH learning evidence',eviaDemoTour:true}
    ];
  }

  function seedDemoState(){
    if(hasRealCourse()||!isDemoCourse())return;
    const state=demoState(),profile=currentProfile();
    if(!state.profileDates)state.profileDates={startDate:Object.prototype.hasOwnProperty.call(profile,'startDate')?profile.startDate:null,endDate:Object.prototype.hasOwnProperty.call(profile,'endDate')?profile.endDate:null};
    const dates=relativeProgrammeDates();
    applyProfile({...profile,startDate:dates.startDate,endDate:dates.endDate});

    rememberBackup(state,'attendance',ATTENDANCE_KEY);
    writeJson(ATTENDANCE_KEY,{college:96,workplace:98,collegeLearningHours:114,eviaDemoTour:true});

    const existingLearning=readJson(LEARNING_KEY,[]);
    const keptLearning=(Array.isArray(existingLearning)?existingLearning:[]).filter(entry=>entry?.eviaDemoTour!==true);
    const seededLearning=[...keptLearning,...fakeLearningEntries()];
    writeJson(LEARNING_KEY,seededLearning);
    try{if(typeof learningEntries!=='undefined')learningEntries=seededLearning}catch{}

    const existingTargets=readJson(TARGETS_KEY,[]);
    const keptTargets=(Array.isArray(existingTargets)?existingTargets:[]).filter(target=>target?.eviaDemoTour!==true);
    const due1=new Date(),due2=new Date();
    due1.setDate(due1.getDate()+14);due2.setDate(due2.getDate()+28);
    writeJson(TARGETS_KEY,[
      ...keptTargets,
      {title:'Add one piece of practical evidence',detail:'Use a photo or video and check which demo KSBs it covers.',dueDate:isoDate(due1),status:'open',eviaDemoTour:true},
      {title:'Record a learning reflection',detail:'Add a short reflection to Learn and include the time spent.',dueDate:isoDate(due2),status:'open',eviaDemoTour:true}
    ]);

    rememberBackup(state,'epaConfidence',EPA_CONFIDENCE_KEY);
    rememberBackup(state,'epaPractice',EPA_PRACTICE_KEY);
    rememberBackup(state,'epaFormal',EPA_FORMAL_KEY);
    writeJson(EPA_CONFIDENCE_KEY,{
      'Communication':{value:78,eviaDemoTour:true},
      'Practical demonstration':{value:72,eviaDemoTour:true},
      'Explaining decisions':{value:68,eviaDemoTour:true}
    });
    writeJson(EPA_PRACTICE_KEY,{percent:64,completedAt:new Date(Date.now()-9*86400000).toISOString(),eviaDemoTour:true});
    writeJson(EPA_FORMAL_KEY,{status:'On track',updatedAt:new Date().toISOString(),eviaDemoTour:true});

    const meta=storedMeta();
    if(courseId(meta)===DEMO_ID){
      const next={...meta};
      next.learning={...(next.learning||{}),type:'OTJ',requiredHours:600};
      next.learningRequiredHours=600;
      next.qualification={...(next.qualification||{}),otjHours:600};
      next.assessmentPlanVersion='Demo plan';
      next.assessmentMethods=[
        {title:'Practical demonstration',description:'Show a task and explain the checks made.'},
        {title:'Professional discussion',description:'Talk through decisions, learning and evidence.'},
        {title:'Knowledge check',description:'Answer short questions to confirm understanding.'}
      ];
      writeJson('eviaNaxosCourseMetaV1',next);
      try{if(typeof activeCourseMeta!=='undefined'&&activeCourseMeta&&typeof activeCourseMeta==='object')Object.assign(activeCourseMeta,next)}catch{}
    }

    state.seededAt=state.seededAt||new Date().toISOString();
    writeJson(DEMO_STATE_KEY,state);
    try{if(typeof updateArchBars==='function')Promise.resolve(updateArchBars()).catch(()=>{})}catch{}
  }

  function cleanupDemoState(){
    const state=demoState(),profile=currentProfile();
    if(state.profileDates){
      const next={...profile};
      if(state.profileDates.startDate===null)delete next.startDate;else next.startDate=state.profileDates.startDate;
      if(state.profileDates.endDate===null)delete next.endDate;else next.endDate=state.profileDates.endDate;
      applyProfile(next);
    }
    restoreBackup(state.attendance,ATTENDANCE_KEY);
    restoreBackup(state.epaConfidence,EPA_CONFIDENCE_KEY);
    restoreBackup(state.epaPractice,EPA_PRACTICE_KEY);
    restoreBackup(state.epaFormal,EPA_FORMAL_KEY);
    const learning=readJson(LEARNING_KEY,[]);
    const cleanLearning=(Array.isArray(learning)?learning:[]).filter(entry=>entry?.eviaDemoTour!==true);
    writeJson(LEARNING_KEY,cleanLearning);
    try{if(typeof learningEntries!=='undefined')learningEntries=cleanLearning}catch{}
    const targets=readJson(TARGETS_KEY,[]);
    writeJson(TARGETS_KEY,(Array.isArray(targets)?targets:[]).filter(target=>target?.eviaDemoTour!==true));
    try{localStorage.removeItem(DEMO_STATE_KEY)}catch{}
    try{if(typeof updateArchBars==='function')Promise.resolve(updateArchBars()).catch(()=>{})}catch{}
  }

  function patchCourseImportCleanup(){
    if(importPatched)return;
    try{
      if(typeof applyImportedCourse!=='function'||applyImportedCourse.__eviaDemoTourCleanupV3)return;
      const original=applyImportedCourse;
      const wrapped=function(items,title,meta){
        const incoming=courseId(meta);
        if(isDemoCourse()&&incoming&&incoming!==DEMO_ID)cleanupDemoState();
        return original.apply(this,arguments);
      };
      wrapped.__eviaDemoTourCleanupV3=true;
      applyImportedCourse=wrapped;
      importPatched=true;
    }catch{}
  }

  function injectStyles(){
    if(document.getElementById('eviaFirstRunTourV3Styles'))return;
    const style=document.createElement('style');
    style.id='eviaFirstRunTourV3Styles';
    style.textContent=`
      #eviaFirstRunGuideV3{position:fixed;left:50%;bottom:max(82px,calc(env(safe-area-inset-bottom) + 72px));transform:translateX(-50%);width:min(calc(100vw - 28px),460px);z-index:3000;border:1.5px solid rgba(245,196,0,.38);border-radius:24px;background:rgba(255,255,255,.985);box-shadow:0 18px 46px rgba(0,0,0,.13);padding:14px;display:flex;flex-direction:column;gap:9px}
      #eviaFirstRunGuideV3 .evia-tour-progress{font-size:9px;color:rgba(45,45,45,.42);text-align:center;letter-spacing:.08em;font-weight:700}
      #eviaFirstRunGuideV3 .evia-tour-title{font-size:17px;font-weight:700;color:rgba(45,45,45,.82);text-align:center}
      #eviaFirstRunGuideV3 .evia-tour-copy{font-size:12.5px;line-height:1.45;text-align:center;color:rgba(45,45,45,.68)}
      #eviaFirstRunGuideV3 .evia-tour-copy div+div{margin-top:3px}
      #eviaFirstRunGuideV3 .evia-tour-form{display:flex;flex-direction:column;gap:7px}
      #eviaFirstRunGuideV3 input{width:100%;min-height:44px;border:1.5px solid rgba(245,196,0,.32);border-radius:16px;background:#fff;color:rgba(45,45,45,.82);font-size:16px;padding:9px 13px;text-align:center;outline:none}
      #eviaFirstRunGuideV3 button{width:100%;min-height:44px;border:1.5px solid rgba(245,196,0,.40);border-radius:999px;background:rgba(250,249,242,.98);color:rgba(45,45,45,.72);font-size:13px;font-weight:600;padding:8px 16px;cursor:pointer}
      #eviaFirstRunGuideV3 .evia-tour-error{min-height:11px;font-size:10.5px;color:rgba(150,40,40,.72);text-align:center}
      .evia-tour-highlight-v3{outline:3px solid rgba(245,196,0,.72)!important;outline-offset:4px!important;filter:drop-shadow(0 0 9px rgba(245,196,0,.60))!important}
      #eviaDemoEvidenceTourCardV3{border:1.5px solid rgba(245,196,0,.38);border-radius:22px;background:linear-gradient(180deg,#fff,rgba(250,249,242,.96));padding:14px;margin-bottom:10px}
      #eviaDemoEvidenceTourCardV3 strong{display:block;font-size:14px;color:#3d3d3d}
      #eviaDemoEvidenceTourCardV3 p{font-size:11.5px;line-height:1.45;color:#616161;margin-top:5px}
      #eviaDemoEvidenceTourCardV3 .evia-demo-methods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px}
      #eviaDemoEvidenceTourCardV3 .evia-demo-method{border:1px solid rgba(245,196,0,.24);border-radius:15px;padding:9px;text-align:center;font-size:11px;font-weight:700;color:#555;background:#fff}
      #eviaStage.evia-tour-final-v3{z-index:3001!important;outline:3px solid rgba(245,196,0,.72)!important;outline-offset:9px!important;border-radius:50%!important;filter:drop-shadow(0 0 12px rgba(245,196,0,.72))!important}
      @media(max-height:700px){#eviaFirstRunGuideV3{bottom:max(68px,calc(env(safe-area-inset-bottom) + 60px));padding:10px;gap:6px}#eviaFirstRunGuideV3 .evia-tour-copy{font-size:11.5px}}
    `;
    document.head.appendChild(style);
  }

  function clearHighlights(){
    document.querySelectorAll('.evia-tour-highlight-v3').forEach(node=>node.classList.remove('evia-tour-highlight-v3'));
  }
  function highlight(selector){
    clearHighlights();
    const node=typeof selector==='string'?document.querySelector(selector):selector;
    if(node)node.classList.add('evia-tour-highlight-v3');
  }

  function safeCloseViews(){
    try{if(typeof stopTalking==='function')stopTalking(false)}catch{}
    try{document.getElementById('archDetailPanel')?.classList.remove('open')}catch{}
    try{document.getElementById('archDetailPanel')?.setAttribute('aria-hidden','true')}catch{}
    try{document.getElementById('naxosMenu')?.classList.remove('open')}catch{}
    try{document.getElementById('naxosArch')?.setAttribute('aria-expanded','false')}catch{}
    try{document.getElementById('chatPanel')?.classList.remove('open')}catch{}
    try{document.getElementById('chatPanel')?.setAttribute('aria-hidden','true')}catch{}
    try{document.getElementById('portfolioPanel')?.classList.remove('open')}catch{}
    try{document.getElementById('portfolioPanel')?.setAttribute('aria-hidden','true')}catch{}
    try{document.getElementById('eviaSupportOverlay')?.classList.remove('open')}catch{}
    try{document.getElementById('eviaSupportOverlay')?.setAttribute('aria-hidden','true')}catch{}
    try{document.getElementById('eviaToolsMenu')?.classList.remove('open')}catch{}
    try{document.getElementById('eviaToolsMenuButton')?.setAttribute('aria-expanded','false')}catch{}
    try{if(typeof closeLearnerProfile==='function')closeLearnerProfile()}catch{}
    clearHighlights();
  }

  function showBottom(kind){
    safeCloseViews();
    const ids={time:'timeArch',course:'courseArch',centre:'naxosArch',attendance:'attendanceArch',learn:'learnArch'};
    const id=ids[kind];
    const button=id?document.getElementById(id):null;
    if(button){button.click();setTimeout(()=>highlight(button),60)}
  }

  function showMenu(){
    safeCloseViews();
    const button=document.getElementById('eviaToolsMenuButton');
    if(button){button.click();setTimeout(()=>highlight(button),50)}
  }

  function showTool(tool){
    safeCloseViews();
    const menuButton=document.getElementById('eviaToolsMenuButton');
    const menu=document.getElementById('eviaToolsMenu');
    if(menu&&!menu.classList.contains('open'))menuButton?.click();
    const item=document.querySelector(`[data-evia-tool="${tool}"]`);
    if(item){item.click();setTimeout(()=>highlight(item),80)}
  }

  function addEvidenceTourCard(second=false){
    const content=document.getElementById('archDetailContent');
    if(!content)return;
    document.getElementById('eviaDemoEvidenceTourCardV3')?.remove();
    const card=document.createElement('div');
    card.id='eviaDemoEvidenceTourCardV3';
    card.innerHTML=second
      ? '<strong>From evidence to progress</strong><p>One useful submission can be mapped to several KSBs. When the evidence is saved, Evia updates course progress and keeps the item in the learner portfolio.</p><div class="evia-demo-methods"><div class="evia-demo-method">Mapped KSBs</div><div class="evia-demo-method">Progress</div><div class="evia-demo-method">Portfolio</div><div class="evia-demo-method">Export</div></div>'
      : '<strong>Evidence in Evia</strong><p>Evia recommends the most useful evidence method for the activity, while still allowing a practical alternative where appropriate.</p><div class="evia-demo-methods"><div class="evia-demo-method">Photo</div><div class="evia-demo-method">Video</div><div class="evia-demo-method">Audio</div><div class="evia-demo-method">Written</div></div>';
    content.prepend(card);
    highlight(card);
  }

  function showEvidence(second=false){
    safeCloseViews();
    const course=document.getElementById('courseArch');
    course?.click();
    setTimeout(()=>addEvidenceTourCard(second),120);
  }

  function enterStep(step){
    if(!step)return;
    try{
      if(step.kind==='time'||step.kind==='course'||step.kind==='centre'||step.kind==='attendance'||step.kind==='learn')showBottom(step.kind);
      else if(step.kind==='menu')showMenu();
      else if(['chat','targets','profile','epa','settings'].includes(step.kind))showTool(step.kind);
      else if(step.kind==='evidence')showEvidence(false);
      else if(step.kind==='evidence2')showEvidence(true);
      else if(step.kind==='intro'||step.kind==='name'){safeCloseViews();highlight(document.getElementById('eviaStage'))}
    }catch(error){console.warn('Evia demo tour step could not open',error)}
  }

  function ensureGuide(){
    if(guide)return guide;
    guide=document.createElement('section');
    guide.id='eviaFirstRunGuideV3';
    guide.setAttribute('role','dialog');
    guide.setAttribute('aria-label','Meet Evia');
    guide.innerHTML='<div class="evia-tour-progress" id="eviaTourProgressV3"></div><div class="evia-tour-title" id="eviaTourTitleV3"></div><div class="evia-tour-copy" id="eviaTourCopyV3"></div><div class="evia-tour-form" id="eviaTourFormV3"></div><div class="evia-tour-error" id="eviaTourErrorV3"></div><button type="button" id="eviaTourNextV3">Continue</button>';
    document.body.appendChild(guide);
    guide.querySelector('#eviaTourNextV3')?.addEventListener('click',advance);
    return guide;
  }

  function renderStep(){
    const step=steps[stepIndex];
    if(!step)return finishTour();
    ensureGuide();
    enterStep(step);
    const progress=guide.querySelector('#eviaTourProgressV3');
    const title=guide.querySelector('#eviaTourTitleV3');
    const copy=guide.querySelector('#eviaTourCopyV3');
    const form=guide.querySelector('#eviaTourFormV3');
    const error=guide.querySelector('#eviaTourErrorV3');
    const next=guide.querySelector('#eviaTourNextV3');
    if(progress)progress.textContent=`MEET EVIA · ${stepIndex+1} OF ${steps.length}`;
    if(title)title.textContent=step.title||'Meet Evia';
    if(copy)copy.innerHTML=(step.lines||[]).map(line=>`<div>${String(line).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</div>`).join('');
    if(form)form.innerHTML='';
    if(error)error.textContent='';
    if(next)next.textContent=step.button||'Next';

    if(step.kind==='name'&&form){
      const input=document.createElement('input');
      input.id='eviaTourNameV3';
      input.type='text';input.maxLength=80;input.autocomplete='name';input.placeholder='Your name';input.value=displayName();input.setAttribute('aria-label','Your name');
      input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();advance()}});
      form.appendChild(input);
      setTimeout(()=>input.focus(),80);
    }
  }

  function advance(){
    const step=steps[stepIndex];
    if(!step)return;
    if(step.kind==='name'){
      const input=guide?.querySelector('#eviaTourNameV3');
      const error=guide?.querySelector('#eviaTourErrorV3');
      const value=String(input?.value||'').trim();
      if(!value){if(error)error.textContent='Enter the name you would like Evia to use.';input?.focus();return}
      savedName=saveName(value);
      seedDemoState();
    }
    stepIndex+=1;
    if(stepIndex>=steps.length){finishTour();return}
    renderStep();
  }

  function removeGuide(){if(guide){guide.remove();guide=null}}

  function finishTour(){
    safeCloseViews();
    removeGuide();
    const stage=document.getElementById('eviaStage');
    const name=savedName||displayName();
    try{if(typeof setSpeech==='function')setSpeech(name?[`That's the tour, ${name}.`,'Tap me and I\'ll open the demo course so you can try it yourself.']:["That's the tour.",'Tap me and I\'ll open the demo course so you can try it yourself.'])}catch{}
    if(!stage){markDone();return}
    stage.classList.add('evia-tour-final-v3');
    finalTapHandler=(event)=>{
      event.preventDefault();event.stopImmediatePropagation();
      stage.removeEventListener('click',finalTapHandler,true);
      stage.classList.remove('evia-tour-final-v3');
      finalTapHandler=null;
      markDone();
      try{if(typeof setSpeech==='function')setSpeech(name?[`Have a go, ${name}.`,'Choose any activity in the demo course.']:['Have a go.','Choose any activity in the demo course.'])}catch{}
      setTimeout(()=>document.getElementById('courseArch')?.click(),120);
    };
    stage.addEventListener('click',finalTapHandler,true);
  }

  function readyForTour(){
    return isDemoCourse()&&
      typeof document.getElementById('timeArch')?.click==='function'&&
      document.getElementById('courseArch')&&
      document.getElementById('naxosArch')&&
      document.getElementById('attendanceArch')&&
      document.getElementById('learnArch')&&
      document.getElementById('eviaStage')&&
      document.getElementById('eviaToolsMenuButton')&&
      document.querySelector('[data-evia-tool="settings"]');
  }

  function startWhenReady(attempt=0){
    patchCourseImportCleanup();
    if(isDone()||hasRealCourse())return;
    if(!readyForTour()){
      if(attempt<80)setTimeout(()=>startWhenReady(attempt+1),150);
      return;
    }
    try{
      seedDemoState();
      injectStyles();
      stepIndex=0;savedName='';
      renderStep();
    }catch(error){
      console.warn('Evia demo tour could not start',error);
      removeGuide();
      clearHighlights();
    }
  }

  setInterval(patchCourseImportCleanup,2500);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>startWhenReady(),350),{once:true});
  else setTimeout(()=>startWhenReady(),350);

  window.eviaFirstRunIntro={
    isComplete:isDone,
    restart(){try{localStorage.removeItem(INTRO_KEY)}catch{};removeGuide();clearHighlights();setTimeout(()=>startWhenReady(),100)}
  };
})();
