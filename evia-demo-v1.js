(()=>{
  'use strict';
  if(window.__eviaDemoV1)return;
  window.__eviaDemoV1=true;

  const DEMO_ID='EVIA-DEMO';
  const DEMO_VERSION='2.0';
  const TOUR_KEY='eviaDemoV1TourDone';
  const STATE_KEY='eviaDemoV1State';
  const LEGACY_STATE_KEY='eviaDemoTourStateV1';
  const ATTENDANCE_KEY='eviaAttendanceDataV1';
  const TARGETS_KEY='eviaMilosTargetsV1';
  const EPA_CONFIDENCE_KEY='eviaEpaConfidenceV1';
  const EPA_PRACTICE_KEY='eviaEpaPracticeV1';
  const EPA_FORMAL_KEY='eviaMilosEpaReadinessV1';
  const LEARNING_KEY='eviaLearningEntries';
  const PROFILE_KEY='eviaLearnerProfile';
  const COURSE_KEY='eviaNaxosCourse';
  const META_KEY='eviaNaxosCourseMetaV1';
  const COMPLETED_KEY='eviaCompletedEvidencePathsV1';

  let hooksPatched=false;
  let installBusy=false;
  let tourBubble=null;
  let activeTarget=null;
  let tourStage=null;
  let tourFloat=null;
  let tourCharacter=null;
  let tourStopped=false;

  const officialItems={
    K1:'Communicate a simple introduction clearly.',
    K2:'Choose an appropriate way to communicate for the situation.',
    K3:'Explain or follow a simple activity clearly.',
    S1:'Use audio, video or written communication to introduce yourself or another person.',
    S2:'Carry out and record a short practical activity.',
    B1:'Communicate respectfully and consider permission and privacy.',
    B2:'Keep trying and complete an activity accurately.'
  };

  const demoItems=[
    {
      label:'Introduction',
      children:[
        {
          label:'Say hello',
          recommended:{label:'1 short audio',type:'audio',details:[{displayType:'Audio',label:'1 short audio',instruction:'Say hello and briefly introduce yourself in your own words.'}]},
          alternative:{label:'Written alternative',type:'text',details:[{displayType:'Written',label:'1 short written introduction',instruction:'Write a short hello and introduce yourself in your own words.'}]},
          requirementsHeading:'What the evidence must show or explain',
          requirementItems:['A clear hello or introduction in your own words.'],
          requirements:'A clear hello or introduction in your own words.',
          ksbTargets:['K1','K2','S1']
        },
        {
          label:'Introduce someone',
          recommended:{label:'1 short video',type:'camera',details:[{displayType:'Video',label:'1 short video',instruction:'Introduce someone who has agreed to be recorded. Keep the introduction short and respectful.'}]},
          alternative:{label:'Audio alternative',type:'audio',details:[{displayType:'Audio',label:'1 short audio',instruction:'Introduce someone by audio instead. Only share details they are happy for you to use.'}]},
          requirementsHeading:'What the evidence must show or explain',
          requirementItems:['Introduce the person clearly.','Make sure they have agreed to take part.'],
          requirements:'Introduce the person clearly.\nMake sure they have agreed to take part.',
          ksbTargets:['K1','K2','S1','B1']
        }
      ]
    },
    {
      label:'Activities',
      children:[
        {
          label:'Rock, Paper, Scissors',
          recommended:{label:'1 video — best of 3',type:'camera',details:[{displayType:'Video',label:'1 video',instruction:'Record a best-of-three game of Rock, Paper, Scissors. Show the three rounds clearly.'}]},
          alternative:{label:'3 photos',type:'camera',details:[{displayType:'Photo',label:'3 photos',instruction:'Take one clear photo for each of the three rounds.'}]},
          requirementsHeading:'What the evidence must show or explain',
          requirementItems:['Complete a best-of-three game.','Show each round clearly.'],
          requirements:'Complete a best-of-three game.\nShow each round clearly.',
          ksbTargets:['K3','S2','B2']
        },
        {
          label:'Red lorry, yellow lorry',
          recommended:{label:'1 audio recording',type:'audio',details:[{displayType:'Audio',label:'1 audio recording',instruction:'Say “red lorry, yellow lorry” five times without going wrong.'}]},
          alternative:{label:'Video alternative',type:'camera',details:[{displayType:'Video',label:'1 short video',instruction:'Record yourself saying “red lorry, yellow lorry” five times without going wrong.'}]},
          requirementsHeading:'What the evidence must show or explain',
          requirementItems:['Say “red lorry, yellow lorry” five times.','Complete all five without going wrong.'],
          requirements:'Say “red lorry, yellow lorry” five times.\nComplete all five without going wrong.',
          ksbTargets:['K3','S2','B2']
        }
      ]
    }
  ];

  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v===null?fallback:v}catch{return fallback}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  function clean(value){return String(value??'').trim()}
  function currentMeta(){
    try{if(typeof activeCourseMeta!=='undefined'&&activeCourseMeta&&typeof activeCourseMeta==='object')return activeCourseMeta}catch{}
    return readJson(META_KEY,{})||{};
  }
  function courseId(meta=currentMeta()){return clean(meta?.qualificationId||meta?.qualification?.id)}
  function storedCourseExists(){const raw=localStorage.getItem(COURSE_KEY);return raw!==null&&raw!==''}
  function courseKind(){if(!storedCourseExists())return'none';return courseId()===DEMO_ID?'demo':'real'}
  function isDemo(){return courseKind()==='demo'}
  function demoMeta(){
    const mappings={};
    const walk=(nodes,path=[])=>{(nodes||[]).forEach(node=>{const next=[...path,node.label];if(node.children?.length)walk(node.children,next);else(node.ksbTargets||[]).forEach(id=>{(mappings[id]||=[]).push(next)})})};
    walk(demoItems);
    return {
      courseType:'ksb',qualificationId:DEMO_ID,title:'Evia Demo',version:DEMO_VERSION,
      source:'Built-in Evia demonstration — not a qualification',officialItems,ksbOrder:Object.keys(officialItems),mappings,
      learning:{type:'OTJ',requiredHours:600},learningRequiredHours:600,
      qualification:{id:DEMO_ID,title:'Evia Demo',version:DEMO_VERSION,otjHours:600},
      assessmentPlanVersion:'Demo plan',
      assessmentMethods:[
        {title:'Practical demonstration',description:'Show a task and explain what you are doing.'},
        {title:'Professional discussion',description:'Talk through decisions, learning and evidence.'},
        {title:'Knowledge check',description:'Answer short questions to confirm understanding.'}
      ]
    };
  }
  function storedDemoVersion(){const meta=currentMeta();return courseId(meta)===DEMO_ID?clean(meta?.version||meta?.qualification?.version):''}

  function leafPaths(items=demoItems,prefix=[],out=[]){(items||[]).forEach(node=>{const next=[...prefix,clean(node?.label)].filter(Boolean);if(node?.children?.length)leafPaths(node.children,next,out);else if(next.length)out.push(next)});return out}
  function clearCompletedPaths(paths){
    const normalised=(paths||[]).map(path=>(path||[]).map(clean));
    if(typeof clearEvidencePathComplete==='function'){normalised.forEach(path=>{try{clearEvidencePathComplete(path)}catch{}});return}
    const saved=readJson(COMPLETED_KEY,[])||[];
    const remove=new Set(normalised.map(path=>JSON.stringify(path)));
    writeJson(COMPLETED_KEY,(Array.isArray(saved)?saved:[]).filter(item=>!remove.has(typeof item==='string'?item:JSON.stringify(item))));
  }
  function oldStoredLeafPaths(){const items=readJson(COURSE_KEY,[])||[];return leafPaths(Array.isArray(items)?items:[])}

  async function deleteDemoEvidence(){
    if(typeof openPortfolioDb!=='function')return;
    let db;
    try{db=await openPortfolioDb()}catch{return}
    await new Promise(resolve=>{
      let settled=false;const finish=()=>{if(!settled){settled=true;resolve()}};
      try{
        const tx=db.transaction('evidence','readwrite'),store=tx.objectStore('evidence'),req=store.openCursor();
        req.onsuccess=()=>{const cursor=req.result;if(!cursor)return;const entry=cursor.value||{};if(entry.eviaDemoCourse===true||entry.eviaDemoV1===true||clean(entry.eviaDemoCourseId)===DEMO_ID)cursor.delete();cursor.continue()};
        req.onerror=finish;tx.oncomplete=finish;tx.onerror=finish;tx.onabort=finish;
      }catch{finish()}
    });
    try{db.close()}catch{}
  }

  function backupRecord(state,name,key){if(Object.prototype.hasOwnProperty.call(state,name))return;const raw=localStorage.getItem(key);state[name]={exists:raw!==null,raw:raw||''}}
  function restoreRecord(record,key){if(!record)return;try{if(record.exists)localStorage.setItem(key,record.raw||'');else localStorage.removeItem(key)}catch{}}
  function profile(){return readJson(PROFILE_KEY,{})||{}}
  function saveProfile(next){writeJson(PROFILE_KEY,next);try{if(typeof learnerProfile!=='undefined'&&learnerProfile&&typeof learnerProfile==='object')Object.assign(learnerProfile,next)}catch{}}

  function restoreLegacyDemoState(){
    const legacy=readJson(LEGACY_STATE_KEY,null);if(!legacy||typeof legacy!=='object')return;
    const p=profile();
    if(legacy.profileDates){const next={...p};if(legacy.profileDates.startDate===null)delete next.startDate;else next.startDate=legacy.profileDates.startDate;if(legacy.profileDates.endDate===null)delete next.endDate;else next.endDate=legacy.profileDates.endDate;saveProfile(next)}
    restoreRecord(legacy.attendance,ATTENDANCE_KEY);restoreRecord(legacy.epaConfidence,EPA_CONFIDENCE_KEY);restoreRecord(legacy.epaPractice,EPA_PRACTICE_KEY);restoreRecord(legacy.epaFormal,EPA_FORMAL_KEY);
    const learning=readJson(LEARNING_KEY,[]);writeJson(LEARNING_KEY,(Array.isArray(learning)?learning:[]).filter(row=>row?.eviaDemoTour!==true));
    const targets=readJson(TARGETS_KEY,[]);writeJson(TARGETS_KEY,(Array.isArray(targets)?targets:[]).filter(row=>row?.eviaDemoTour!==true));
    try{localStorage.removeItem(LEGACY_STATE_KEY)}catch{}
  }

  function isoDate(date){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return`${y}-${m}-${d}`}
  function seedDemoState(){
    if(!isDemo())return;
    const state=readJson(STATE_KEY,{})||{};
    const p=profile();
    if(!state.profileDates)state.profileDates={startDate:Object.prototype.hasOwnProperty.call(p,'startDate')?p.startDate:null,endDate:Object.prototype.hasOwnProperty.call(p,'endDate')?p.endDate:null};
    const now=new Date(),start=new Date(now.getFullYear(),now.getMonth()-8,now.getDate()),end=new Date(now.getFullYear(),now.getMonth()+16,now.getDate());
    saveProfile({...p,startDate:isoDate(start),endDate:isoDate(end)});
    backupRecord(state,'attendance',ATTENDANCE_KEY);writeJson(ATTENDANCE_KEY,{college:96,workplace:98,collegeLearningHours:114,eviaDemoV1:true});
    const learning=(Array.isArray(readJson(LEARNING_KEY,[]))?readJson(LEARNING_KEY,[]):[]).filter(row=>row?.eviaDemoV1!==true&&row?.eviaDemoTour!==true);
    const t=Date.now();
    learning.push(
      {id:'evia-demo-v1-learning-1',createdAt:new Date(t-21*86400000).toISOString(),text:'Reviewed the demo course and how evidence can cover more than one requirement.',hours:26,evidenceLabel:'Demo learning',eviaDemoV1:true},
      {id:'evia-demo-v1-learning-2',createdAt:new Date(t-12*86400000).toISOString(),text:'Practised giving a clear explanation and recording evidence.',hours:28,evidenceLabel:'Demo learning',eviaDemoV1:true},
      {id:'evia-demo-v1-learning-3',createdAt:new Date(t-5*86400000).toISOString(),text:'Completed guided learning and added a short reflection.',hours:24,evidenceLabel:'Demo learning',eviaDemoV1:true}
    );
    writeJson(LEARNING_KEY,learning);try{if(typeof learningEntries!=='undefined')learningEntries=learning}catch{}
    const targets=(Array.isArray(readJson(TARGETS_KEY,[]))?readJson(TARGETS_KEY,[]):[]).filter(row=>row?.eviaDemoV1!==true&&row?.eviaDemoTour!==true);
    const d1=new Date(),d2=new Date();d1.setDate(d1.getDate()+14);d2.setDate(d2.getDate()+28);
    targets.push(
      {title:'Add one piece of practical evidence',detail:'Use one of the demo activities to add evidence.',dueDate:isoDate(d1),status:'open',eviaDemoV1:true},
      {title:'Record a learning reflection',detail:'Add a short reflection in Learn and include the time spent.',dueDate:isoDate(d2),status:'open',eviaDemoV1:true}
    );
    writeJson(TARGETS_KEY,targets);
    backupRecord(state,'epaConfidence',EPA_CONFIDENCE_KEY);backupRecord(state,'epaPractice',EPA_PRACTICE_KEY);backupRecord(state,'epaFormal',EPA_FORMAL_KEY);
    writeJson(EPA_CONFIDENCE_KEY,{'Say hello':{value:78,eviaDemoV1:true},'Rock, Paper, Scissors':{value:72,eviaDemoV1:true},'Red lorry, yellow lorry':{value:68,eviaDemoV1:true}});
    writeJson(EPA_PRACTICE_KEY,{percent:64,completedAt:new Date(t-9*86400000).toISOString(),eviaDemoV1:true});
    writeJson(EPA_FORMAL_KEY,{status:'On track',updatedAt:new Date().toISOString(),eviaDemoV1:true});
    state.seededAt=state.seededAt||new Date().toISOString();writeJson(STATE_KEY,state);
    try{if(typeof updateArchBars==='function')Promise.resolve(updateArchBars()).catch(()=>{})}catch{}
  }

  function cleanupDemoState(){
    const state=readJson(STATE_KEY,{})||{},p=profile();
    if(state.profileDates){const next={...p};if(state.profileDates.startDate===null)delete next.startDate;else next.startDate=state.profileDates.startDate;if(state.profileDates.endDate===null)delete next.endDate;else next.endDate=state.profileDates.endDate;saveProfile(next)}
    restoreRecord(state.attendance,ATTENDANCE_KEY);restoreRecord(state.epaConfidence,EPA_CONFIDENCE_KEY);restoreRecord(state.epaPractice,EPA_PRACTICE_KEY);restoreRecord(state.epaFormal,EPA_FORMAL_KEY);
    const learning=readJson(LEARNING_KEY,[]);const cleanLearning=(Array.isArray(learning)?learning:[]).filter(row=>row?.eviaDemoV1!==true&&row?.eviaDemoTour!==true);writeJson(LEARNING_KEY,cleanLearning);try{if(typeof learningEntries!=='undefined')learningEntries=cleanLearning}catch{}
    const targets=readJson(TARGETS_KEY,[]);writeJson(TARGETS_KEY,(Array.isArray(targets)?targets:[]).filter(row=>row?.eviaDemoV1!==true&&row?.eviaDemoTour!==true));
    try{localStorage.removeItem(STATE_KEY)}catch{}
  }

  function patchHooks(){
    if(hooksPatched)return;
    try{
      if(typeof addPortfolioEntry==='function'&&!addPortfolioEntry.__eviaDemoV1){const originalAdd=addPortfolioEntry;const wrappedAdd=async function(entry){const next=isDemo()?{...(entry||{}),eviaDemoCourse:true,eviaDemoV1:true,eviaDemoCourseId:DEMO_ID,eviaDemoCourseVersion:DEMO_VERSION}:entry;return originalAdd.call(this,next)};wrappedAdd.__eviaDemoV1=true;addPortfolioEntry=wrappedAdd}
      if(typeof applyImportedCourse==='function'&&!applyImportedCourse.__eviaDemoV1){const originalApply=applyImportedCourse;const wrappedApply=function(items,title,meta){const leavingDemo=isDemo()&&clean(meta?.qualificationId||meta?.qualification?.id)!==DEMO_ID;if(leavingDemo){cleanupDemoState();clearCompletedPaths(oldStoredLeafPaths());deleteDemoEvidence().catch(()=>{})}return originalApply.apply(this,arguments)};wrappedApply.__eviaDemoV1=true;applyImportedCourse=wrappedApply}
      hooksPatched=typeof addPortfolioEntry==='function'&&typeof applyImportedCourse==='function';
    }catch{}
  }

  async function installDemo(force=false){
    if(installBusy||courseKind()==='real')return false;
    if(typeof applyImportedCourse!=='function')return false;
    if(!force&&isDemo()&&storedDemoVersion()===DEMO_VERSION)return true;
    installBusy=true;
    try{
      restoreLegacyDemoState();
      const previous=oldStoredLeafPaths();
      await deleteDemoEvidence().catch(()=>{});
      clearCompletedPaths(previous);clearCompletedPaths(leafPaths());
      applyImportedCourse(JSON.parse(JSON.stringify(demoItems)),'Evia Demo',demoMeta());
      try{if(typeof deactivateHome==='function')deactivateHome()}catch{}
      seedDemoState();
      return true;
    }finally{installBusy=false}
  }

  async function resetDemo(){
    if(!isDemo())return;
    await deleteDemoEvidence().catch(()=>{});clearCompletedPaths(oldStoredLeafPaths());clearCompletedPaths(leafPaths());cleanupDemoState();
    try{localStorage.removeItem(TOUR_KEY)}catch{}
    applyImportedCourse(JSON.parse(JSON.stringify(demoItems)),'Evia Demo',demoMeta());
    try{if(typeof deactivateHome==='function')deactivateHome()}catch{}
    seedDemoState();startTour(true);
  }

  function saveName(value){
    const text=clean(value).replace(/\s+/g,' ').slice(0,80);if(!text)return'';
    const parts=text.split(' '),p=profile(),next={...p,firstName:parts[0]||'',lastName:parts.slice(1).join(' ')};saveProfile(next);return parts[0]||text;
  }

  function injectTourStyles(){
    if(document.getElementById('eviaDemoV1Styles'))return;
    const style=document.createElement('style');style.id='eviaDemoV1Styles';style.textContent=`
      body.evia-demo-tour-v1 .evia-stage{position:fixed!important;left:var(--evia-demo-x,50vw)!important;top:var(--evia-demo-y,50vh)!important;transform:translate(-50%,-50%)!important;font-size:clamp(56px,9vw,76px)!important;z-index:12030!important;transition:left .72s cubic-bezier(.22,1,.36,1),top .72s cubic-bezier(.22,1,.36,1),font-size .45s ease!important}
      body.evia-demo-tour-v1 .evia-stage.evia-demo-pointing{pointer-events:none!important}
      #eviaDemoV1Bubble{position:fixed;left:50%;top:max(88px,calc(env(safe-area-inset-top) + 70px));transform:translateX(-50%);width:min(calc(100vw - 32px),430px);z-index:12031;border:1.5px solid rgba(245,196,0,.34);border-radius:24px;background:rgba(255,255,255,.985);box-shadow:0 16px 42px rgba(0,0,0,.10);padding:14px;display:flex;flex-direction:column;gap:8px;text-align:center;color:rgba(45,45,45,.72)}
      #eviaDemoV1Bubble.menu-side{left:20px;top:112px;transform:none;width:min(330px,calc(100vw - 116px));text-align:left}
      #eviaDemoV1Bubble strong{font-size:16px;color:rgba(45,45,45,.86)}
      #eviaDemoV1Bubble p{font-size:12.5px;line-height:1.45;margin:0}
      #eviaDemoV1Bubble button{min-height:42px;border:1.5px solid rgba(245,196,0,.34);border-radius:999px;background:rgba(250,249,242,.98);color:rgba(45,45,45,.72);font-size:12.5px;font-weight:600;padding:8px 14px;cursor:pointer}
      #eviaDemoV1Bubble input{width:100%;min-height:42px;border:1.5px solid rgba(245,196,0,.28);border-radius:15px;background:#fff;color:#333;font-size:16px;text-align:center;padding:8px 12px;outline:none}
      #eviaDemoV1Bubble .evia-demo-error{font-size:10px;min-height:12px;color:#9b3b3b}
      .evia-demo-target-v1{position:relative!important;z-index:12029!important;box-shadow:0 0 0 3px rgba(245,196,0,.72),0 0 18px rgba(245,196,0,.42)!important;animation:eviaDemoTargetPulse 1.15s ease-in-out infinite!important}
      @keyframes eviaDemoTargetPulse{0%,100%{box-shadow:0 0 0 2px rgba(245,196,0,.55),0 0 10px rgba(245,196,0,.22)}50%{box-shadow:0 0 0 5px rgba(245,196,0,.28),0 0 22px rgba(245,196,0,.48)}}
      #eviaDemoControlsV1{border:1.5px solid rgba(245,196,0,.28);border-radius:20px;background:rgba(250,249,242,.82);padding:12px;margin-top:10px}
      #eviaDemoControlsV1 strong{font-size:13px;color:#444}#eviaDemoControlsV1 p{font-size:10.5px;line-height:1.4;color:#666;margin-top:4px}#eviaDemoControlsV1 button{margin-top:8px;min-height:38px;border:1.5px solid rgba(245,196,0,.3);border-radius:999px;background:#fff;padding:6px 12px;color:#555;font-size:11px}
    `;document.head.appendChild(style)
  }
  function ensureBubble(){
    injectTourStyles();if(tourBubble&&document.body.contains(tourBubble))return tourBubble;
    tourBubble=document.createElement('div');tourBubble.id='eviaDemoV1Bubble';document.body.appendChild(tourBubble);return tourBubble;
  }
  function setTalking(on){try{tourFloat?.classList.toggle('talking',on);tourCharacter?.classList.toggle('talking',on)}catch{}}
  function bounce(){try{tourCharacter?.classList.remove('accent-wobble');void tourCharacter?.offsetWidth;tourCharacter?.classList.add('accent-wobble');setTimeout(()=>tourCharacter?.classList.remove('accent-wobble'),1250)}catch{}}
  function clearTarget(){if(activeTarget){activeTarget.classList.remove('evia-demo-target-v1');activeTarget=null}}
  function setBubble(title,lines,{button=null,onButton=null,input=false,menuSide=false}={}){
    const bubble=ensureBubble();bubble.classList.toggle('menu-side',menuSide);bubble.innerHTML=`<strong>${title}</strong>${(lines||[]).map(line=>`<p>${line}</p>`).join('')}${input?'<input id="eviaDemoV1Name" type="text" autocomplete="name" placeholder="Your name"><div class="evia-demo-error" id="eviaDemoV1Error"></div>':''}${button?`<button type="button" id="eviaDemoV1Next">${button}</button>`:''}`;
    if(button&&onButton)bubble.querySelector('#eviaDemoV1Next')?.addEventListener('click',onButton,{once:true});setTalking(true);return bubble
  }
  function moveStage(x,y,target=null){
    if(!tourStage)return;const safeX=Math.max(52,Math.min(innerWidth-52,x)),safeY=Math.max(62,Math.min(innerHeight-76,y));document.body.style.setProperty('--evia-demo-x',`${safeX}px`);document.body.style.setProperty('--evia-demo-y',`${safeY}px`);bounce();
    if(target){const r=target.getBoundingClientRect(),tx=r.left+r.width/2,ty=r.top+r.height/2,dx=tx-safeX,dy=ty-safeY;document.documentElement.style.setProperty('--eye-x',`${Math.max(-.045,Math.min(.045,dx/900))}em`);document.documentElement.style.setProperty('--eye-y',`${Math.max(-.03,Math.min(.03,dy/1000))}em`);document.documentElement.style.setProperty('--char-tilt',`${Math.max(-3,Math.min(3,dx/140))}deg`)}
  }
  function moveNear(target){const r=target.getBoundingClientRect();if(r.top>innerHeight*.62)moveStage(r.left+r.width/2,r.top-68,target);else if(r.left>innerWidth*.66)moveStage(r.left-66,r.top+r.height/2,target);else moveStage(r.right+66,r.top+r.height/2,target)}
  function moveSafe(){moveStage(innerWidth-72,Math.max(100,(document.getElementById('archDetailPanel')?.classList.contains('open')?118:105)),null)}
  function closeOpenTourPanel(kind){
    try{
      if(kind==='arch'&&typeof closeArchDetail==='function')closeArchDetail();
      if(kind==='centre'&&document.getElementById('naxosMenu')?.classList.contains('open')&&typeof toggleNaxosMenu==='function')toggleNaxosMenu();
      if(kind==='chat'&&typeof closeChat==='function')closeChat();
      if(kind==='profile'&&typeof closePortfolio==='function')closePortfolio(false);
      if(['targets','epa'].includes(kind))document.querySelector('#eviaSupportOverlay.open .evia-support-back')?.click();
      if(kind==='settings')document.querySelector('#eviaStableSettings.open [data-stable-action="back"]')?.click();
    }catch{}
  }
  function reopenToolsMenu(){const menu=document.getElementById('eviaToolsMenu'),button=document.getElementById('eviaToolsMenuButton');if(!menu?.classList.contains('open'))button?.click()}

  const bottomSteps=[
    {selector:'#timeArch',name:'Time',prompt:'Time shows how far a learner is through their programme. Tap Time to open it.',explain:['This uses the learner’s start and end dates to show their position in the programme.','The demo is set to roughly 33% so you can see the progress display working.'],kind:'arch'},
    {selector:'#courseArch',name:'Course',prompt:'Course shows progress through the knowledge, skills and behaviours. Tap Course to open it.',explain:['This is where the learner can see the KSBs in their course and which ones already have evidence.','The demo starts at 0% so you can watch progress rise when evidence is added.'],kind:'arch'},
    {selector:'#naxosArch',name:'Course tools',prompt:'The centre button opens the course tools. Tap it to see what is inside.',explain:['This is where an approved course can be scanned into Evia and where the learner opens their portfolio.'],kind:'centre'},
    {selector:'#attendanceArch',name:'Attendance',prompt:'Attendance keeps college and workplace attendance visible. Tap Attend to open it.',explain:['College and workplace attendance can be shown separately.','The demo uses 96% and 98%, giving a combined 97%.'],kind:'arch'},
    {selector:'#learnArch',name:'Learn',prompt:'Learn keeps learning hours and reflections together. Tap Learn to open it.',explain:['Learners can record what they learned and the time spent learning.','The demo shows 192 of 600 hours, which is 32%.'],kind:'arch'}
  ];
  const menuSteps=[
    {selector:'[data-evia-tool="chat"]',name:'Chat',prompt:'This is Chat. Tap it and I will show you what it does.',explain:['Chat is where a learner works directly with Evia.','They can run a quick review, check in, learn a topic or test their knowledge.'],kind:'chat'},
    {selector:'[data-evia-tool="targets"]',name:'Targets',prompt:'This is Targets. Tap it to open the learner’s actions.',explain:['Targets keeps review actions visible between visits so the learner knows what to work on next.','The demo includes two example targets.'],kind:'targets'},
    {selector:'[data-evia-tool="profile"]',name:'Profile',prompt:'This is Profile. Tap it to see the learner details Evia keeps locally.',explain:['Profile holds the learner details Evia needs on this device, including programme dates and contact information.'],kind:'profile'},
    {selector:'[data-evia-tool="epa"]',name:'EPA',prompt:'This is EPA. Tap it to see readiness information.',explain:['EPA brings course coverage, confidence, practice, learning progress and formal readiness together.','The demo includes example readiness information so the screen is populated.'],kind:'epa'},
    {selector:'[data-evia-tool="settings"]',name:'Settings',prompt:'This is Settings. Tap it to see how Evia can adapt to the learner.',explain:['Settings includes accessibility choices such as text size, contrast, reduced motion, reading support and thinking time.'],kind:'settings'}
  ];

  function waitForSelector(selector,attempt=0){return new Promise(resolve=>{const el=document.querySelector(selector);if(el||attempt>40)return resolve(el);setTimeout(()=>waitForSelector(selector,attempt+1).then(resolve),100)})}
  function pointStep(step,onDone,{menu=false}={}){
    if(tourStopped)return;waitForSelector(step.selector).then(target=>{if(!target||tourStopped)return onDone();clearTarget();activeTarget=target;target.classList.add('evia-demo-target-v1');moveNear(target);setBubble(step.name,[step.prompt],{menuSide:menu});
      let handled=false;
      const handler=()=>{if(handled)return;handled=true;target.removeEventListener('pointerup',handler,true);target.removeEventListener('click',handler,true);target.removeEventListener('keydown',keyHandler,true);clearTarget();const openDelay=step.kind==='profile'?700:step.kind==='chat'?350:260;setTimeout(()=>{if(tourStopped)return;moveSafe();setBubble(step.name,step.explain,{button:'Next',menuSide:menu,onButton:()=>{closeOpenTourPanel(step.kind);setTimeout(()=>{if(menu&&step.kind!=='settings')reopenToolsMenu();onDone()},120)}})},openDelay)};
      const keyHandler=(event)=>{if(event.key==='Enter'||event.key===' ')handler()};
      target.addEventListener('pointerup',handler,true);
      target.addEventListener('click',handler,true);
      target.addEventListener('keydown',keyHandler,true)
    })
  }
  function runBottom(index=0){if(index>=bottomSteps.length)return runMenuIntro();pointStep(bottomSteps[index],()=>runBottom(index+1))}
  function runMenuIntro(){
    const button=document.getElementById('eviaToolsMenuButton');if(!button)return finishTourPrompt();clearTarget();activeTarget=button;button.classList.add('evia-demo-target-v1');moveNear(button);setBubble('More tools',['The three-line menu opens five more parts of Evia. Tap it and I will show you each one.']);
    const handler=()=>{button.removeEventListener('click',handler,true);clearTarget();setTimeout(()=>{moveSafe();setBubble('More tools',['Chat, Targets, Profile, EPA and Settings all live here.'],{button:'Show me',menuSide:true,onButton:()=>runMenuStep(0)})},150)};button.addEventListener('click',handler,true)
  }
  function runMenuStep(index){if(index>=menuSteps.length)return finishTourPrompt();reopenToolsMenu();setTimeout(()=>pointStep(menuSteps[index],()=>runMenuStep(index+1),{menu:true}),100)}

  function cleanupTourVisuals(){clearTarget();setTalking(false);document.body.classList.remove('evia-demo-tour-v1');tourStage?.classList.remove('evia-demo-pointing');document.body.style.removeProperty('--evia-demo-x');document.body.style.removeProperty('--evia-demo-y');document.documentElement.style.setProperty('--eye-x','0em');document.documentElement.style.setProperty('--eye-y','0em');document.documentElement.style.setProperty('--char-tilt','0deg');tourBubble?.remove();tourBubble=null}
  function finishTourPrompt(){
    try{if(typeof closeArchDetail==='function')closeArchDetail()}catch{};try{if(typeof closeChat==='function')closeChat()}catch{};try{if(typeof closePortfolio==='function')closePortfolio(false)}catch{};document.querySelector('#eviaSupportOverlay.open .evia-support-back')?.click();const tools=document.getElementById('eviaToolsMenu');if(tools?.classList.contains('open'))document.getElementById('eviaToolsMenuButton')?.click();try{if(typeof deactivateHome==='function')deactivateHome()}catch{};
    moveStage(innerWidth/2,innerHeight/2,null);tourStage?.classList.remove('evia-demo-pointing');setBubble('Your turn',['That is the main tour.','Tap Evia and choose an activity to try the evidence journey for yourself.']);
    const done=()=>{tourStage?.removeEventListener('click',done,true);try{localStorage.setItem(TOUR_KEY,'1')}catch{};cleanupTourVisuals()};tourStage?.addEventListener('click',done,true)
  }
  function startTour(force=false){
    if(tourStopped||(!force&&localStorage.getItem(TOUR_KEY)==='1')||!isDemo())return;
    tourStage=document.querySelector('.evia-stage');tourCharacter=document.querySelector('.evia-character');tourFloat=document.querySelector('.evia-float');if(!tourStage||!tourCharacter||!tourFloat)return setTimeout(()=>startTour(force),120);
    if(!document.getElementById('eviaToolsMenuButton')||!document.querySelector('[data-evia-tool="epa"]'))return setTimeout(()=>startTour(force),120);
    injectTourStyles();document.body.classList.add('evia-demo-tour-v1');tourStage.classList.add('evia-demo-pointing');try{if(typeof deactivateHome==='function')deactivateHome()}catch{};moveStage(innerWidth/2,innerHeight*.40,null);
    setBubble('Meet Evia',["Hi, I’m Evia.",'I help apprentices understand their course, collect evidence, record learning and keep track of progress.'],{button:'Show me around',onButton:()=>{
      setBubble('First things first',['What should I call you?'],{input:true,button:'Continue',onButton:()=>{const input=document.getElementById('eviaDemoV1Name'),saved=saveName(input?.value);if(!saved){const error=document.getElementById('eviaDemoV1Error');if(error)error.textContent='Add a name to continue.';return startTourNameRetry()}runBottom(0)}})
    }})
  }
  function startTourNameRetry(){const button=document.getElementById('eviaDemoV1Next');if(button)button.addEventListener('click',()=>{const input=document.getElementById('eviaDemoV1Name'),saved=saveName(input?.value);if(!saved){const error=document.getElementById('eviaDemoV1Error');if(error)error.textContent='Add a name to continue.';return startTourNameRetry()}runBottom(0)},{once:true})}

  function decorateCoursePage(){
    if(!isDemo())return;const title=document.getElementById('archDetailTitle'),content=document.getElementById('archDetailContent');if(!content||clean(title?.textContent)!=='Course'||document.getElementById('eviaDemoControlsV1'))return;
    const card=document.createElement('div');card.id='eviaDemoControlsV1';card.innerHTML='<strong>Demo Course</strong><p>This is a demonstration course, not a qualification. Resetting removes only demo evidence and demo progress.</p><button type="button" id="eviaDemoResetV1">Reset Demo</button>';content.appendChild(card);card.querySelector('#eviaDemoResetV1')?.addEventListener('click',()=>{if(confirm('Reset the Evia Demo? This removes only demo evidence and restarts the demo.'))resetDemo().catch(()=>{})})
  }

  async function initialise(attempt=0){
    patchHooks();
    if(typeof applyImportedCourse!=='function'||typeof addPortfolioEntry!=='function'||!document.querySelector('.evia-stage')||!document.getElementById('eviaToolsMenuButton')||!document.querySelector('[data-evia-tool="epa"]')){if(attempt<80)setTimeout(()=>initialise(attempt+1),120);return}
    patchHooks();
    if(courseKind()==='real'){restoreLegacyDemoState();if(readJson(STATE_KEY,null)){cleanupDemoState();deleteDemoEvidence().catch(()=>{})}return}
    await installDemo(false);
    seedDemoState();
    const observer=new MutationObserver(()=>decorateCoursePage());observer.observe(document.documentElement,{subtree:true,childList:true});decorateCoursePage();
    setTimeout(()=>startTour(false),180);
  }

  window.eviaDemoV1={
    id:DEMO_ID,version:DEMO_VERSION,isActive:isDemo,reset:()=>resetDemo(),startTour:()=>startTour(true),
    ready:false,
    getCourse:()=>JSON.parse(JSON.stringify(demoItems))
  };

  const readyTimer=setInterval(()=>{if(isDemo()&&storedDemoVersion()===DEMO_VERSION){window.eviaDemoV1.ready=true;clearInterval(readyTimer)}},100);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initialise(),{once:true});else setTimeout(()=>initialise(),0);
})();