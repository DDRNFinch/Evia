(()=>{
  'use strict';
  if(window.__eviaFirstRunTourV2)return;
  window.__eviaFirstRunTourV2=true;

  const INTRO_KEY='eviaFirstRunTourV2';
  const DEMO_ID='EVIA-DEMO';
  const DEMO_STATE_KEY='eviaDemoTourStateV1';
  const DEMO_ATTENDANCE_KEY='eviaAttendanceDataV1';
  const DEMO_TARGETS_KEY='eviaMilosTargetsV1';
  const DEMO_EPA_CONFIDENCE_KEY='eviaEpaConfidenceV1';
  const DEMO_EPA_PRACTICE_KEY='eviaEpaPracticeV1';
  const DEMO_EPA_FORMAL_KEY='eviaMilosEpaReadinessV1';
  const DEMO_LEARNING_KEY='eviaLearningEntries';
  let overlay=null;
  let currentStep=0;
  let savedName='';
  let waitingForEviaTap=false;
  let patchedImport=false;

  const steps=[
    {kind:'intro',lines:["Hi, I'm Evia.",'I help apprentices understand their course, collect evidence, record learning and keep track of progress.'],button:'Meet Evia'},
    {kind:'name',lines:['Before I show you around, what should I call you?'],button:'Continue'},
    {kind:'time',lines:['This is Time.','I use the programme start and end dates to show how far through the apprenticeship someone is.'],button:'Next'},
    {kind:'course',lines:['This is Course.','I show the knowledge, skills and behaviours in the course and which ones have evidence against them.'],button:'Next'},
    {kind:'centre',lines:['The centre button holds the course tools.','A learner can scan an approved course QR and open their portfolio from here.'],button:'Next'},
    {kind:'attendance',lines:['This is Attendance.','College and workplace attendance can be shown separately, with an overall picture on the home screen.'],button:'Next'},
    {kind:'learn',lines:['This is Learn.','I keep learning hours and reflections together and show progress towards the required learning hours.'],button:'Next'},
    {kind:'menu',lines:['The three lines open my other tools.','There are five: Chat, Targets, Profile, EPA and Settings.'],button:'Show me'},
    {kind:'chat',lines:['Chat is where a learner can work with me directly.','I can run a quick review, check in, teach a topic or test their knowledge.'],button:'Next'},
    {kind:'targets',lines:['Targets keeps review actions visible between visits.','Targets from Milos can appear here so the learner always knows what to work on next.'],button:'Next'},
    {kind:'profile',lines:['Profile holds the learner details that Evia needs locally.','That includes their name and programme dates, and it can be updated by the learner.'],button:'Next'},
    {kind:'epa',lines:['EPA brings readiness into one place.','It can combine course coverage, confidence, practice activity, learning progress and formal readiness.'],button:'Next'},
    {kind:'settings',lines:['Settings is where Evia can adapt to the learner.','Accessibility options include text size, reading support, contrast, reduced motion and extra thinking time.'],button:'Next'},
    {kind:'evidence',lines:['This is the important part: evidence.','A learner opens a course activity, sees the recommended evidence, captures it, and Evia maps it to the right course requirements.'],button:'Next'},
    {kind:'evidence2',lines:['Evidence can be photos, video, audio or writing.','One useful piece of evidence can cover several mapped requirements, update progress and stay in the learner portfolio.'],button:'Finish tour'},
    {kind:'final',lines:[],button:''}
  ];

  function readJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value===null?fallback:value}catch{return fallback}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  function storedMeta(){return readJson('eviaNaxosCourseMetaV1',{})||{}}
  function courseId(meta=storedMeta()){return String(meta?.qualificationId||meta?.qualification?.id||'').trim()}
  function hasStoredCourse(){const raw=localStorage.getItem('eviaNaxosCourse');return raw!==null&&raw!==''}
  function hasRealCourse(){return hasStoredCourse()&&courseId()!==DEMO_ID}
  function isDemoCourse(){return courseId()===DEMO_ID||window.eviaDemoCourse?.isActive?.()===true}
  function isDone(){return localStorage.getItem(INTRO_KEY)==='1'}
  function markDone(){try{localStorage.setItem(INTRO_KEY,'1')}catch{}}

  function isoDate(date){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`}
  function relativeProgrammeDates(){const now=new Date(),start=new Date(now.getFullYear(),now.getMonth()-8,now.getDate()),end=new Date(now.getFullYear(),now.getMonth()+16,now.getDate());return {startDate:isoDate(start),endDate:isoDate(end)}}

  function currentProfile(){try{if(typeof learnerProfile!=='undefined'&&learnerProfile&&typeof learnerProfile==='object')return {...learnerProfile}}catch{}return readJson('eviaLearnerProfile',{})||{}}
  function profileDisplayName(){const profile=currentProfile();return String(profile.nickname||profile.firstName||'').trim()}
  function applyProfile(profile){writeJson('eviaLearnerProfile',profile);try{if(typeof learnerProfile!=='undefined'&&learnerProfile&&typeof learnerProfile==='object')Object.assign(learnerProfile,profile)}catch{}}
  function saveName(value){const clean=String(value||'').trim().replace(/\s+/g,' ').slice(0,80);if(!clean)return'';const parts=clean.split(' '),existing=currentProfile(),next={...existing,firstName:parts[0]||'',lastName:parts.slice(1).join(' ')};applyProfile(next);return parts[0]||clean}

  function demoState(){const state=readJson(DEMO_STATE_KEY,{});return state&&typeof state==='object'?state:{}}
  function rememberRawBackup(state,name,key){if(Object.prototype.hasOwnProperty.call(state,name))return;const raw=localStorage.getItem(key);state[name]={exists:raw!==null,raw:raw===null?'':raw}}
  function fakeLearningEntries(){const now=Date.now();return [
    {id:'evia-demo-tour-learning-1',createdAt:new Date(now-21*86400000).toISOString(),text:'Reviewed course expectations and discussed how evidence can cover more than one requirement.',hours:26,evidencePath:[],evidenceLabel:'Demo learning',courseTitle:'Evia Demo — Meet Evia',evidenceUse:'OTJ/GLH learning evidence',eviaDemoTour:true},
    {id:'evia-demo-tour-learning-2',createdAt:new Date(now-12*86400000).toISOString(),text:'Practised explaining a task clearly and reflecting on what could be improved.',hours:28,evidencePath:[],evidenceLabel:'Demo learning',courseTitle:'Evia Demo — Meet Evia',evidenceUse:'OTJ/GLH learning evidence',eviaDemoTour:true},
    {id:'evia-demo-tour-learning-3',createdAt:new Date(now-5*86400000).toISOString(),text:'Completed guided learning and recorded a short reflection in Evia.',hours:24,evidencePath:[],evidenceLabel:'Demo learning',courseTitle:'Evia Demo — Meet Evia',evidenceUse:'OTJ/GLH learning evidence',eviaDemoTour:true}
  ]}

  function seedDemoState(){
    if(hasRealCourse())return;
    const state=demoState(),profile=currentProfile();
    if(!state.profileDates)state.profileDates={startDate:Object.prototype.hasOwnProperty.call(profile,'startDate')?profile.startDate:null,endDate:Object.prototype.hasOwnProperty.call(profile,'endDate')?profile.endDate:null};
    const dates=relativeProgrammeDates();applyProfile({...profile,startDate:dates.startDate,endDate:dates.endDate});
    rememberRawBackup(state,'attendance',DEMO_ATTENDANCE_KEY);writeJson(DEMO_ATTENDANCE_KEY,{college:96,workplace:98,collegeLearningHours:114,eviaDemoTour:true});
    const existingLearning=readJson(DEMO_LEARNING_KEY,[]),keptLearning=(Array.isArray(existingLearning)?existingLearning:[]).filter(entry=>entry?.eviaDemoTour!==true),seededLearning=[...keptLearning,...fakeLearningEntries()];writeJson(DEMO_LEARNING_KEY,seededLearning);try{if(typeof learningEntries!=='undefined')learningEntries=seededLearning}catch{}
    const existingTargets=readJson(DEMO_TARGETS_KEY,[]),keptTargets=(Array.isArray(existingTargets)?existingTargets:[]).filter(target=>target?.eviaDemoTour!==true),due1=new Date(),due2=new Date();due1.setDate(due1.getDate()+14);due2.setDate(due2.getDate()+28);writeJson(DEMO_TARGETS_KEY,[...keptTargets,{title:'Add one piece of practical evidence',detail:'Use a photo or video and check which demo KSBs it covers.',dueDate:isoDate(due1),status:'open',eviaDemoTour:true},{title:'Record a learning reflection',detail:'Add a short reflection to Learn and include the time spent.',dueDate:isoDate(due2),status:'open',eviaDemoTour:true}]);
    rememberRawBackup(state,'epaConfidence',DEMO_EPA_CONFIDENCE_KEY);rememberRawBackup(state,'epaPractice',DEMO_EPA_PRACTICE_KEY);rememberRawBackup(state,'epaFormal',DEMO_EPA_FORMAL_KEY);
    writeJson(DEMO_EPA_CONFIDENCE_KEY,{'Communication':{value:78,eviaDemoTour:true},'Practical demonstration':{value:72,eviaDemoTour:true},'Explaining decisions':{value:68,eviaDemoTour:true}});writeJson(DEMO_EPA_PRACTICE_KEY,{percent:64,completedAt:new Date(Date.now()-9*86400000).toISOString(),eviaDemoTour:true});writeJson(DEMO_EPA_FORMAL_KEY,{status:'On track',updatedAt:new Date().toISOString(),eviaDemoTour:true});
    const meta=storedMeta();if(courseId(meta)===DEMO_ID){const next={...meta};next.learning={...(next.learning||{}),type:'OTJ',requiredHours:600};next.learningRequiredHours=600;next.qualification={...(next.qualification||{}),otjHours:600};next.assessmentPlanVersion='Demo plan';next.assessmentMethods=[{title:'Practical demonstration',description:'Show a task and explain the checks made.'},{title:'Professional discussion',description:'Talk through decisions, learning and evidence.'},{title:'Knowledge check',description:'Answer short questions to confirm understanding.'}];writeJson('eviaNaxosCourseMetaV1',next);try{if(typeof activeCourseMeta!=='undefined'&&activeCourseMeta&&typeof activeCourseMeta==='object')Object.assign(activeCourseMeta,next)}catch{}}
    state.seededAt=state.seededAt||new Date().toISOString();writeJson(DEMO_STATE_KEY,state);try{if(typeof updateArchBars==='function')Promise.resolve(updateArchBars()).catch(()=>{})}catch{}
  }

  function restoreRawBackup(record,key){if(!record)return;try{if(record.exists)localStorage.setItem(key,record.raw||'');else localStorage.removeItem(key)}catch{}}
  function cleanupDemoState(){
    const state=demoState(),profile=currentProfile();if(state.profileDates){const next={...profile};if(state.profileDates.startDate===null)delete next.startDate;else next.startDate=state.profileDates.startDate;if(state.profileDates.endDate===null)delete next.endDate;else next.endDate=state.profileDates.endDate;applyProfile(next)}
    restoreRawBackup(state.attendance,DEMO_ATTENDANCE_KEY);restoreRawBackup(state.epaConfidence,DEMO_EPA_CONFIDENCE_KEY);restoreRawBackup(state.epaPractice,DEMO_EPA_PRACTICE_KEY);restoreRawBackup(state.epaFormal,DEMO_EPA_FORMAL_KEY);
    const learning=readJson(DEMO_LEARNING_KEY,[]),cleanedLearning=(Array.isArray(learning)?learning:[]).filter(entry=>entry?.eviaDemoTour!==true);writeJson(DEMO_LEARNING_KEY,cleanedLearning);try{if(typeof learningEntries!=='undefined')learningEntries=cleanedLearning}catch{}
    const targets=readJson(DEMO_TARGETS_KEY,[]);writeJson(DEMO_TARGETS_KEY,(Array.isArray(targets)?targets:[]).filter(target=>target?.eviaDemoTour!==true));try{localStorage.removeItem(DEMO_STATE_KEY)}catch{};try{if(typeof updateArchBars==='function')Promise.resolve(updateArchBars()).catch(()=>{})}catch{}
  }

  function patchCourseImportCleanup(){if(patchedImport)return;try{if(typeof applyImportedCourse!=='function'||applyImportedCourse.__eviaDemoTourCleanup)return;const original=applyImportedCourse,wrapped=function(items,title,meta){const incoming=courseId(meta),leavingDemo=isDemoCourse()&&incoming&&incoming!==DEMO_ID;if(leavingDemo)cleanupDemoState();return original.apply(this,arguments)};wrapped.__eviaDemoTourCleanup=true;wrapped.__eviaDemoTourOriginal=original;applyImportedCourse=wrapped;patchedImport=true}catch{}}

  function speak(lines){const clean=(Array.isArray(lines)?lines:[lines]).map(value=>String(value||'').trim()).filter(Boolean);try{if(typeof setSpeech==='function'){setSpeech(clean);return}}catch{}const speech=document.querySelector('.evia-speech');if(!speech)return;speech.innerHTML='';clean.forEach(line=>{const node=document.createElement('div');node.className='speech-line';node.textContent=line;speech.appendChild(node)})}

  function injectStyles(){if(document.getElementById('eviaFirstRunIntroStyles'))return;const style=document.createElement('style');style.id='eviaFirstRunIntroStyles';style.textContent=`
    #eviaFirstRunIntro{position:fixed;inset:0;z-index:1000;background:rgba(255,255,255,.08);pointer-events:none}
    #eviaFirstRunIntro .evia-first-run-controls{position:absolute;left:50%;bottom:78px;transform:translateX(-50%);width:min(calc(100vw - 30px),450px);z-index:1002;border:1.5px solid rgba(245,196,0,.38);border-radius:24px;background:rgba(255,255,255,.985);box-shadow:0 18px 42px rgba(0,0,0,.13);padding:14px;display:flex;flex-direction:column;gap:9px;pointer-events:auto}
    #eviaFirstRunIntro .evia-first-run-progress{font-size:9px;color:rgba(45,45,45,.42);text-align:center;letter-spacing:.08em;font-weight:700}
    #eviaFirstRunIntro .evia-first-run-copy{font-size:13px;line-height:1.45;text-align:center;color:rgba(45,45,45,.72)}
    #eviaFirstRunIntro .evia-first-run-copy div+div{margin-top:3px}
    #eviaFirstRunIntro button{width:100%;min-height:44px;border:1.5px solid rgba(245,196,0,.40);border-radius:999px;background:rgba(250,249,242,.98);color:rgba(45,45,45,.72);font-size:13px;font-weight:600;padding:8px 16px;cursor:pointer}
    #eviaFirstRunIntro input{width:100%;min-height:46px;border:1.5px solid rgba(245,196,0,.32);border-radius:16px;background:#fff;color:rgba(45,45,45,.82);font-size:16px;padding:10px 14px;outline:none;text-align:center}
    #eviaFirstRunIntro input:focus{border-color:rgba(245,196,0,.72);box-shadow:0 0 0 3px rgba(245,196,0,.10)}
    #eviaFirstRunIntro .evia-first-run-error{min-height:12px;font-size:10.5px;color:rgba(150,40,40,.72);text-align:center}
    .evia-first-run-highlight{outline:3px solid rgba(245,196,0,.72)!important;outline-offset:4px!important;filter:drop-shadow(0 0 10px rgba(245,196,0,.65))!important}
    #screen.evia-first-run-final .evia-stage{z-index:1003!important;outline:3px solid rgba(245,196,0,.72);outline-offset:10px;border-radius:50%;filter:drop-shadow(0 0 12px rgba(245,196,0,.72));pointer-events:auto!important}
    #eviaFirstRunIntro.evia-first-run-final-overlay .evia-first-run-controls{bottom:72px}
    #eviaDemoEvidenceTourCard{border:1.5px solid rgba(245,196,0,.38);border-radius:22px;background:linear-gradient(180deg,#fff,rgba(250,249,242,.96));padding:14px;margin-bottom:10px}
    #eviaDemoEvidenceTourCard strong{display:block;font-size:14px;color:#3d3d3d}#eviaDemoEvidenceTourCard p{font-size:11.5px;line-height:1.45;color:#616161;margin-top:5px}#eviaDemoEvidenceTourCard .evia-demo-methods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px}#eviaDemoEvidenceTourCard .evia-demo-method{border:1px solid rgba(245,196,0,.22);border-radius:15px;background:#fff;padding:8px;text-align:center;font-size:10.5px;font-weight:700;color:#555}
    @media (max-height:650px){#eviaFirstRunIntro .evia-first-run-controls{bottom:66px;padding:10px;gap:7px}#eviaFirstRunIntro .evia-first-run-copy{font-size:12px}}
  `;document.head.appendChild(style)}

  function makeOverlay(){if(overlay)return overlay;overlay=document.createElement('div');overlay.id='eviaFirstRunIntro';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','false');overlay.setAttribute('aria-label','Meet Evia');overlay.innerHTML='<div class="evia-first-run-controls"><div class="evia-first-run-progress" id="eviaFirstRunProgress"></div><div class="evia-first-run-copy" id="eviaFirstRunCopy"></div><div id="eviaFirstRunForm"></div><div class="evia-first-run-error" id="eviaFirstRunError"></div><button type="button" id="eviaFirstRunNext">Continue</button></div>';document.body.appendChild(overlay);overlay.querySelector('#eviaFirstRunNext')?.addEventListener('click',advance);return overlay}
  function clearHighlights(){document.querySelectorAll('.evia-first-run-highlight').forEach(node=>node.classList.remove('evia-first-run-highlight'))}
  function highlight(selector){clearHighlights();const node=typeof selector==='string'?document.querySelector(selector):selector;if(node)node.classList.add('evia-first-run-highlight')}

  function closeTourSurfaces(){const arch=document.getElementById('archDetailPanel');arch?.classList.remove('open');arch?.setAttribute('aria-hidden','true');const chat=document.getElementById('chatPanel');chat?.classList.remove('open');chat?.setAttribute('aria-hidden','true');const support=document.getElementById('eviaSupportOverlay');support?.classList.remove('open');support?.setAttribute('aria-hidden','true');const portfolio=document.getElementById('portfolioPanel');portfolio?.classList.remove('open');portfolio?.setAttribute('aria-hidden','true');const tools=document.getElementById('eviaToolsMenu');tools?.classList.remove('open');document.getElementById('eviaToolsMenuButton')?.setAttribute('aria-expanded','false');const naxos=document.getElementById('naxosMenu');naxos?.classList.remove('open');document.getElementById('naxosArch')?.setAttribute('aria-expanded','false');document.getElementById('eviaDemoEvidenceTourCard')?.remove()}
  function openBottom(id){closeTourSurfaces();setTimeout(()=>document.getElementById(id)?.click(),60)}
  function openToolsMenu(){closeTourSurfaces();setTimeout(()=>{const button=document.getElementById('eviaToolsMenuButton'),menu=document.getElementById('eviaToolsMenu');if(button&&menu&&!menu.classList.contains('open'))button.click()},60)}
  function openTool(name){closeTourSurfaces();setTimeout(()=>{const button=document.getElementById('eviaToolsMenuButton'),menu=document.getElementById('eviaToolsMenu');if(button&&menu&&!menu.classList.contains('open'))button.click();setTimeout(()=>menu?.querySelector(`[data-evia-tool="${name}"]`)?.click(),80)},50)}
  function addEvidenceTourCard(){const content=document.getElementById('archDetailContent');if(!content||document.getElementById('eviaDemoEvidenceTourCard'))return;const card=document.createElement('div');card.id='eviaDemoEvidenceTourCard';card.innerHTML='<strong>How evidence works</strong><p>Open an activity and Evia shows the recommended evidence. Capture it once, and the mapped KSBs update automatically.</p><div class="evia-demo-methods"><div class="evia-demo-method">Photo</div><div class="evia-demo-method">Video</div><div class="evia-demo-method">Audio</div><div class="evia-demo-method">Written</div></div>';content.prepend(card)}

  function applyStepView(step){clearHighlights();if(!step)return;if(step.kind==='time'){openBottom('timeArch');setTimeout(()=>highlight('#timeArch'),130);return}if(step.kind==='course'){openBottom('courseArch');setTimeout(()=>highlight('#courseArch'),130);return}if(step.kind==='centre'){closeTourSurfaces();setTimeout(()=>{document.getElementById('naxosArch')?.click();highlight('#naxosArch')},70);return}if(step.kind==='attendance'){openBottom('attendanceArch');setTimeout(()=>highlight('#attendanceArch'),130);return}if(step.kind==='learn'){openBottom('learnArch');setTimeout(()=>highlight('#learnArch'),130);return}if(step.kind==='menu'){openToolsMenu();setTimeout(()=>highlight('#eviaToolsMenuButton'),130);return}if(step.kind==='chat'){openTool('chat');setTimeout(()=>highlight('#chatPanel .chat-card'),220);return}if(step.kind==='targets'){openTool('targets');return}if(step.kind==='profile'){openTool('profile');return}if(step.kind==='epa'){openTool('epa');return}if(step.kind==='settings'){openTool('settings');return}if(step.kind==='evidence'||step.kind==='evidence2'){openBottom('courseArch');setTimeout(()=>{addEvidenceTourCard();highlight('#eviaDemoEvidenceTourCard')},170);return}if(step.kind==='final')prepareFinalTap()}

  function renderStep(){const step=steps[currentStep];if(!step)return;makeOverlay();const progress=overlay.querySelector('#eviaFirstRunProgress'),copy=overlay.querySelector('#eviaFirstRunCopy'),form=overlay.querySelector('#eviaFirstRunForm'),error=overlay.querySelector('#eviaFirstRunError'),next=overlay.querySelector('#eviaFirstRunNext');if(progress)progress.textContent=`MEET EVIA · ${currentStep+1} OF ${steps.length}`;if(error)error.textContent='';if(form)form.innerHTML='';if(copy)copy.innerHTML='';if(next){next.hidden=false;next.textContent=step.button||'Continue'}const lines=step.kind==='final'?[`That's the tour, ${savedName||profileDisplayName()||'there'}.`,'Tap me and I\'ll open your demo course so you can try it yourself.']:step.lines;speak(lines);if(copy)lines.forEach(line=>{const div=document.createElement('div');div.textContent=line;copy.appendChild(div)});if(step.kind==='name'&&form){const input=document.createElement('input');input.id='eviaFirstRunName';input.type='text';input.autocomplete='name';input.maxLength=80;input.placeholder='Your name';input.value=profileDisplayName();input.setAttribute('aria-label','Your name');input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();advance()}});form.appendChild(input);setTimeout(()=>input.focus(),100)}applyStepView(step)}
  function advance(){const step=steps[currentStep];if(!step||waitingForEviaTap)return;if(step.kind==='name'){const input=overlay?.querySelector('#eviaFirstRunName'),error=overlay?.querySelector('#eviaFirstRunError'),value=String(input?.value||'').trim();if(!value){if(error)error.textContent='Enter the name you would like Evia to use.';input?.focus();return}savedName=saveName(value);seedDemoState()}currentStep+=1;renderStep()}
  function removeOverlay(){clearHighlights();document.getElementById('screen')?.classList.remove('evia-first-run-final');if(overlay){overlay.remove();overlay=null}}
  function prepareFinalTap(){closeTourSurfaces();waitingForEviaTap=true;overlay?.classList.add('evia-first-run-final-overlay');const next=overlay?.querySelector('#eviaFirstRunNext');if(next)next.hidden=true;document.getElementById('screen')?.classList.add('evia-first-run-final');const evia=document.querySelector('.evia-stage');if(!evia)return;const handler=(event)=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();evia.removeEventListener('click',handler,true);waitingForEviaTap=false;markDone();removeOverlay();speak([`Here you go, ${savedName||profileDisplayName()||'there'}.`,'Choose any demo activity and Evia will show you the evidence options.']);setTimeout(()=>document.getElementById('courseArch')?.click(),120)};evia.addEventListener('click',handler,true)}

  function startIfNeeded(attempt=0){patchCourseImportCleanup();if(hasRealCourse()){if(!isDone())markDone();cleanupDemoState();return}if(!isDemoCourse()){if(attempt<50){setTimeout(()=>startIfNeeded(attempt+1),160);return}}seedDemoState();if(isDone())return;const ready=document.getElementById('screen')&&document.getElementById('eviaToolsMenuButton')&&typeof setSpeech==='function';if(!ready){if(attempt<50)setTimeout(()=>startIfNeeded(attempt+1),160);return}injectStyles();currentStep=0;savedName=profileDisplayName();waitingForEviaTap=false;renderStep()}

  setInterval(patchCourseImportCleanup,1800);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>startIfNeeded(),350),{once:true});else setTimeout(()=>startIfNeeded(),350);
  window.eviaFirstRunIntro={isComplete:isDone,cleanupDemoState,seedDemoState};
})();
