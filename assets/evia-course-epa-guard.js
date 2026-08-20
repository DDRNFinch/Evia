(()=>{
"use strict";

const EPA_KEY="evia-epa-practice-v1";
const TRANSITION_MS={fade:430,titleIn:720,titleOut:1620,swap:1940,reveal:2100,done:2580};
let mcqState=null,mcqTimer=null,interviewState=null,practicalState=null,recorder=null,stream=null,chunks=[],recordTimer=null,recordStarted=0,transitioning=false;

const q=(question,options,answer,ksb)=>({question,options,answer,ksb});
const BRICK_MCQ=[
q("Which document normally sets out the safe sequence and controls for a task?",["Method statement","Delivery ticket","Timesheet","Snagging list"],0,"K3"),
q("What is the main purpose of a risk assessment?",["To identify hazards and decide controls","To order materials","To calculate wages","To record brick quantities"],0,"K3"),
q("Which control is most appropriate for reducing inhalation of silica dust when cutting masonry?",["Suitable dust suppression or extraction and RPE","Work faster","Open a window only","Wear gloves only"],0,"K2"),
q("What does COSHH mainly deal with?",["Hazardous substances and exposure controls","Scaffold design","Brick bonds","Setting-out dimensions"],0,"K1"),
q("Why should waste be segregated on site?",["To support safe disposal, reuse and recycling","To make skips heavier","To avoid measuring materials","To replace a risk assessment"],0,"K4"),
q("What is a main purpose of wall insulation?",["Reduce heat transfer","Increase mortar strength","Replace wall ties","Prevent all movement"],0,"K5"),
q("What is the main purpose of a DPC?",["Resist moisture passing through the construction","Support a lintel","Tie wall leaves together","Control mortar colour"],0,"K8"),
q("Which document is most likely to give dimensions and locations for the work?",["Construction drawing","Payslip","Toolbox register","Delivery receipt"],0,"K10"),
q("Why is a gauge rod useful?",["To keep courses and heights consistent","To test electrical tools","To measure mortar strength","To sharpen tools"],0,"K21"),
q("What is the main purpose of wall ties in a cavity wall?",["Connect the two leaves while maintaining the cavity","Replace insulation","Support scaffold boards","Form the DPC"],0,"K22"),
q("Why are weep holes used above some openings?",["To allow water collected by a cavity tray to drain out","To hold insulation in place","To ventilate the room","To fix the lintel"],0,"K22"),
q("What is the purpose of a cavity tray?",["To direct moisture to the outer leaf and weep holes","To increase brick strength","To replace the lintel","To support the inner leaf"],0,"K22"),
q("What is the best reason for checking line, level and plumb regularly?",["To identify and correct inaccuracies as work progresses","To reduce the number of wall ties","To avoid using drawings","To make mortar set faster"],0,"K21"),
q("What does stretcher bond mainly show on the face of a wall?",["Stretchers overlapping by approximately half a unit","Headers only","Vertical joints aligned in every course","Bricks laid on edge only"],0,"K15"),
q("Which bond alternates headers and stretchers within each course?",["Flemish bond","Stretcher bond","Stack bond","Broken bond"],0,"K15"),
q("Why are movement joints provided in masonry?",["To accommodate movement and reduce uncontrolled cracking","To drain the cavity","To hold insulation","To replace DPC"],0,"K19"),
q("What is efflorescence?",["Salt deposits that can appear on masonry surfaces","A type of wall tie","A mortar joint profile","A lintel defect"],0,"K24"),
q("Why should bricks and blocks be protected from frost and saturation?",["To reduce damage and poor performance","To make them heavier","To remove the need for mortar","To improve colour matching only"],0,"K25"),
q("What is the purpose of a lintel?",["Support masonry over an opening","Tie two wall leaves together","Stop rising damp","Set mortar ratio"],0,"K8"),
q("Before using a powered cutting tool, what should be checked first?",["That it is suitable, guarded and in safe condition","That the wall is already complete","That mortar is fully dry","That the delivery note is signed"],0,"K14"),
q("What is meant by gauging mortar materials?",["Measuring ingredients consistently to the required ratio","Adding water without measuring","Mixing any available materials","Judging colour only"],0,"K20"),
q("Why should a mortar ratio be followed?",["To achieve the specified performance and consistency","To make every mix the same colour only","To eliminate curing time","To avoid using clean water"],0,"K20"),
q("Which joint finish is formed with a rounded jointing tool?",["Half-round","Flush","Recessed","Weather-struck"],0,"K17"),
q("Why is a recessed joint generally more exposed than a half-round joint?",["It leaves the mortar face set back from the masonry face","It contains no cement","It has no bed joints","It removes the need for pointing"],0,"K17"),
q("What should happen if a drawing conflicts with the work on site?",["Stop and seek clarification before proceeding","Choose whichever dimension is easiest","Ignore the drawing","Continue and correct it later"],0,"K10"),
q("Why are openings checked for size and position during setting out?",["So components and finishes can fit the required dimensions","To reduce the number of courses","To avoid using profiles","To change the bond automatically"],0,"K21"),
q("What is a key reason for keeping the cavity clear?",["To reduce moisture bridging and maintain performance","To increase mortar waste","To support scaffold","To replace insulation"],0,"K22"),
q("How should rigid cavity insulation generally be fitted?",["Tightly jointed and positioned as specified without gaps","Loose with large gaps","Only at corners","Against the outer face regardless of specification"],0,"K22"),
q("Why is fire stopping installed in required locations?",["To restrict the spread of fire and smoke through concealed spaces","To replace wall ties","To increase opening width","To colour-code the cavity"],0,"K22"),
q("What is the best response to finding defective brickwork?",["Identify the cause and use an appropriate repair method","Cover it immediately","Ignore it if it is above ground","Add more wall ties"],0,"K24"),
q("Why should hand tools be cleaned and stored correctly?",["To maintain condition, safety and service life","To change their size","To avoid PPE","To increase mortar strength"],0,"K13"),
q("When cutting a brick by hand, what helps achieve an accurate cut?",["Measure, mark and use the correct tool and technique","Strike it randomly","Soak every brick first","Remove PPE"],0,"K29"),
q("What is the purpose of a return in masonry?",["It forms a change in wall direction and helps create a stable junction","It drains a cavity tray","It replaces a lintel","It is a mortar joint finish"],0,"K22"),
q("Why is clear construction terminology important when speaking with the team?",["It reduces misunderstanding about the work","It replaces drawings","It removes the need for supervision","It changes tolerances"],0,"K26"),
q("What is a good example of effective teamwork?",["Coordinating work and communicating with other trades","Working without telling anyone","Ignoring sequencing","Only checking your own area"],0,"K27"),
q("What should you do if you are unsure how to carry out an unfamiliar task safely?",["Ask for guidance or training before continuing","Guess and continue","Remove the controls","Wait until the end of the day"],0,"K1"),
q("Why is inclusion important on a construction site?",["People should be treated fairly and able to contribute safely","It removes all site rules","It means everyone does the same job","It replaces competence requirements"],0,"K28"),
q("What is the most appropriate action if you or a colleague is struggling with wellbeing?",["Use available support and raise concerns appropriately","Ignore it","Post about it publicly","Leave the site without telling anyone"],0,"K31"),
q("Why are materials estimated before work starts?",["To plan sufficient resources and reduce shortages and waste","To avoid reading drawings","To replace quality checks","To remove the need for storage"],0,"K12"),
q("What is the safest approach when work at height is required?",["Use the planned access and fall-prevention controls","Stand on loose materials","Climb the wall","Work without checking the platform"],0,"K1")
];

const BRICK_INTERVIEW=[
{theme:"Defects & repair",question:"Tell me about a time you identified a defect or problem in brickwork and what you did about it.",cover:["What the defect or problem was","How you identified the likely cause","What repair or correction you carried out","How you checked the finished result"],ksbs:["K24","S16","B3"]},
{theme:"Protection",question:"Explain how you protect materials and finished masonry from weather or site damage.",cover:["What needed protecting","The risk from frost, water or site activity","What protection you used","How you checked it remained effective"],ksbs:["K25","S17","B3"]},
{theme:"Mortar",question:"Tell me about a mortar mix you have used and how you made sure the ratio and consistency were right.",cover:["The specified ratio","How the materials were gauged","How the mortar was mixed","How you knew the consistency was suitable"],ksbs:["K20","S14"]},
{theme:"Information",question:"Give an example of how you used a drawing, specification or site information to carry out your work.",cover:["What information you needed","Where you found it","How it affected your setting out or work","What you did if anything was unclear"],ksbs:["K10","S5"]},
{theme:"Communication",question:"Tell me about a time you had to communicate clearly with another trade or member of the site team.",cover:["Who you communicated with","What construction terminology you used","How you made the message clear","How you confirmed it was understood"],ksbs:["K26","S18"]},
{theme:"Teamwork",question:"Describe a job where teamwork affected the quality or sequence of your brickwork.",cover:["Who else was involved","How the work was sequenced","What you did to support the wider team","What the result was"],ksbs:["K27","S20","B6"]},
{theme:"Ownership",question:"Tell me about a time you checked your own work and corrected something before it became a bigger problem.",cover:["What you checked","What was wrong or at risk","What you changed","How you confirmed the standard afterwards"],ksbs:["B3","S11"]},
{theme:"Inclusion",question:"Explain how you make sure people are treated fairly and respectfully when you are working with them.",cover:["A realistic workplace example","How you considered another person's needs or viewpoint","What inclusive behaviour looked like","Why it mattered to the team"],ksbs:["K28","S19","B4"]},
{theme:"Development",question:"Tell me about something new you learned or practised and how it improved your work.",cover:["What you learned","How you practised it","What feedback you used","How it improved your competence"],ksbs:["B5"]},
{theme:"Wellbeing",question:"If you or someone else was struggling physically or mentally at work, what support could you use?",cover:["What signs might concern you","How you would respond appropriately","Where support could be found","Why wellbeing is part of safe working"],ksbs:["K31","S21","B1"]}
];

const BRICK_PRACTICAL=[
{title:"Safe setup and controls",desc:"Rehearse the safe start to the practical before any masonry work begins.",checks:["Identify the main hazards and controls","Select suitable PPE and RPE","Prepare and maintain a safe work area","Check tools and equipment before use"],ksbs:["K1","K2","K3","S1","S2","S7","B1"]},
{title:"Set out cavity wall and opening",desc:"Rehearse setting out from the drawing and maintaining accurate line, level, square and gauge.",checks:["Read the required dimensions from the drawing","Set out wall lines and opening position","Use profiles, level, square and gauge correctly","Re-check dimensions before building"],ksbs:["K10","K21","S5","S10"]},
{title:"Build cavity wall accurately",desc:"Rehearse building the two leaves, return and opening while keeping the cavity clean.",checks:["Maintain stretcher bond and correct lap","Keep line, level, plumb and gauge within tolerance","Form the return and opening accurately","Keep the cavity clean while building"],ksbs:["K22","S11","B3"]},
{title:"Opening, lintel and special courses",desc:"Rehearse the opening details and special brickwork required by the practical task.",checks:["Install or position the lintel to the task information","Set out the soldier course accurately","Form the brick-on-edge sill correctly","Check the opening dimensions and finish"],ksbs:["K22","K23","S11","B3"]},
{title:"Cavity components",desc:"Rehearse the components that control moisture, thermal performance and fire within the cavity wall.",checks:["Position wall ties and retaining clips correctly","Fit insulation tightly without avoidable gaps","Install DPC, cavity tray and weep holes to the task","Include cavity closure and fire stopping where specified"],ksbs:["K8","K22","S11"]},
{title:"Finishing, cutting and quality",desc:"Rehearse the final workmanship checks, joint finishes, cutting and protection.",checks:["Produce the specified mortar joint finishes","Measure and cut masonry accurately","Identify and correct simple defects","Protect the completed work from damage"],ksbs:["K17","K24","K25","K29","S12","S15","S16","S17","B3"]}
];

const BRICK_PROFILE={
standard:"ST0095 v1.2",title:"Bricklayer",pathway:"",pathwayTitle:"Bricklayer",
mcq:{minutes:60,questions:40,failMax:24,passMax:32},
interview:{minutes:60,questions:10},
practical:{hours:12,minQuestions:6},
mcqBank:BRICK_MCQ,interview:BRICK_INTERVIEW,practicalAreas:BRICK_PRACTICAL
};

function current(){return window.EviaCourseContext?.current?.()||null}
function activePack(){try{return window.EviaCoursePacks?.active?.()||null}catch{return null}}
function activeCodes(){const c=current();return Array.isArray(c?.codes)?[...new Set(c.codes.map(String).filter(Boolean))]:[]}
function descriptions(){
  const a=activePack(),p=a?.pathway,pack=a?.pack;
  const d=(p&&p.codeDescriptions&&typeof p.codeDescriptions==="object"?p.codeDescriptions:null)||(pack&&pack.codeDescriptions&&typeof pack.codeDescriptions==="object"?pack.codeDescriptions:null)||{};
  return d
}
function courseLabel(){const c=current();return c?.pathwayTitle||c?.courseTitle||"Your course"}
function standardLabel(){const c=current(),a=activePack();return a?.pack?.standard||a?.pack?.standardId||c?.courseTitle||c?.courseId||""}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function read(){try{return JSON.parse(localStorage.getItem(EPA_KEY)||"{}")||{}}catch{return{}}}
function write(v){try{localStorage.setItem(EPA_KEY,JSON.stringify(v))}catch{}}
function score(key){const n=Number(read()[key]);return Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):0}
function overall(){return Math.round((score("mcq")+score("practical")+score("interview"))/3)}
function clock(ms){const n=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(n/60),s=n%60;return`${m}:${String(s).padStart(2,"0")}`}
function clearTimers(){clearInterval(mcqTimer);mcqTimer=null;clearInterval(recordTimer);recordTimer=null}
function cleanupRecording(stop=true){
  clearInterval(recordTimer);recordTimer=null;
  if(stop&&recorder&&recorder.state!=="inactive"){try{recorder.onstop=null;recorder.stop()}catch{}}
  recorder=null;chunks=[];try{stream?.getTracks?.().forEach(t=>t.stop())}catch{}stream=null
}
function cleanupInterview(){cleanupRecording();if(interviewState?.recordings)interviewState.recordings.forEach(r=>{if(r?.url)try{URL.revokeObjectURL(r.url)}catch{}});interviewState=null}
function filterKsbs(xs,set){return (Array.isArray(xs)?xs:[]).map(String).filter(x=>set.has(x))}
function genericProfile(c){
  const a=activePack(),pack=a?.pack,path=a?.pathway,data=path?.siteData||pack?.siteData||[],codes=new Set(activeCodes());
  const interview=[],practicalAreas=[];
  for(const cat of Array.isArray(data)?data:[]){
    for(const job of Array.isArray(cat?.jobs)?cat.jobs:[]){
      const opps=Array.isArray(job?.opps)?job.opps:[];
      const ksbs=[...new Set(opps.flatMap(o=>Array.isArray(o?.codes)?o.codes:[]).map(String).filter(x=>codes.has(x)))];
      if(opps.length&&interview.length<10){
        const o=opps.find(x=>x?.question)||opps[0];
        interview.push({theme:job.title||cat.title||"Course practice",question:o?.question||`Talk me through ${job.title||"this work"}.`,cover:["Describe what you did","Explain why you used that method","Explain how you checked the work","Explain what you would do if something was wrong"],ksbs:filterKsbs(o?.codes,codes)})
      }
      if(opps.length&&practicalAreas.length<8)practicalAreas.push({title:job.title||cat.title||"Practical area",desc:`Rehearse the course requirements for ${job.title||cat.title||"this area"}.`,checks:opps.slice(0,4).map(o=>o.instruction||o.title).filter(Boolean),ksbs})
    }
  }
  return{
    standard:standardLabel(),title:c?.courseTitle||"Course",pathway:c?.pathway||"",pathwayTitle:courseLabel(),generic:true,
    mcq:{minutes:60,questions:0,failMax:0,passMax:0},interview:{minutes:60,questions:Math.min(10,interview.length)},practical:{hours:12,minQuestions:6},
    mcqBank:[],interview,practicalAreas
  }
}
function profile(){
  const c=current();if(!c||c.epaConfigured===false||String(c.courseType||"apprenticeship")==="nvq")return null;
  const key=`${c.courseId}:${c.pathway||""}`;
  let p=window.EviaEPAProfiles?.[key]||null;
  if(!p&&c.courseId==="st0095-v1-2")p=BRICK_PROFILE;
  if(!p)p=genericProfile(c);
  const codes=new Set(activeCodes()),hasCodes=codes.size>0;
  const bank=(p.mcqBank||[]).filter(x=>!hasCodes||!x.ksb||codes.has(String(x.ksb)));
  const interview=(p.interview||[]).map(x=>({...x,ksbs:filterKsbs(x.ksbs,codes)})).filter(x=>!hasCodes||x.ksbs.length||!x.ksbs);
  const practicalAreas=(p.practicalAreas||[]).map(x=>({...x,ksbs:filterKsbs(x.ksbs,codes)})).filter(x=>!hasCodes||x.ksbs.length||!x.ksbs);
  const questions=Math.min(Number(p.mcq?.questions)||bank.length,bank.length);
  return{...p,mcq:{...p.mcq,questions},interview,practicalAreas}
}
function ksbStat(code){
  const x=read()?.ksb?.[code];if(!x||!Number(x.attempts))return null;
  return Math.round(Number(x.total||0)/Number(x.attempts))
}
function recordKsb(code,pct){
  code=String(code||"");if(!activeCodes().includes(code))return;
  const x=read();x.ksb=x.ksb||{};const s=x.ksb[code]||{attempts:0,total:0};
  s.attempts=Number(s.attempts||0)+1;s.total=Number(s.total||0)+Math.max(0,Math.min(100,Number(pct)||0));x.ksb[code]=s;write(x)
}
function weakCodes(limit=6){
  return activeCodes().map(code=>({code,score:ksbStat(code)})).filter(x=>x.score!==null&&x.score<75).sort((a,b)=>a.score-b.score).slice(0,limit)
}
function saveScore(key,pct,extra={}){
  const x=read();x[key]=Math.max(0,Math.min(100,Math.round(pct)));x.attempts=x.attempts||{};x.attempts[key]=(Number(x.attempts[key])||0)+1;x.last=x.last||{};x.last[key]={at:Date.now(),...extra};write(x);patchArch()
}
function patchArch(){
  if(!profile())return;
  const pct=overall();
  document.querySelectorAll('[data-arch="EPA"]').forEach(b=>{b.querySelector(".arch-value")?.setAttribute("stroke-dasharray",`${pct} 100`);const n=b.querySelector(".arch-number");if(n)n.textContent=`${pct}%`})
}
function removeLayer(){clearTimers();cleanupInterview();document.querySelector(".evia-course-epa-layer")?.remove()}
function transition(toNaxos,after){
  if(transitioning)return;transitioning=true;
  const mask=document.createElement("div");mask.className=`naxos-section-transition${toNaxos?"":" to-evia"}`;
  mask.innerHTML=`<div class="naxos-transition-title"><strong>${toNaxos?"Naxos":"Evia"}</strong><span>${toNaxos?"EPA Simulator":"Apprenticeship Assistant"}</span></div>`;
  document.body.appendChild(mask);
  requestAnimationFrame(()=>mask.classList.add("is-visible"));
  setTimeout(()=>mask.classList.add("show-title"),TRANSITION_MS.titleIn);
  setTimeout(()=>mask.classList.remove("show-title"),TRANSITION_MS.titleOut);
  setTimeout(()=>{after?.()},TRANSITION_MS.swap);
  setTimeout(()=>mask.classList.remove("is-visible"),TRANSITION_MS.reveal);
  setTimeout(()=>{mask.remove();transitioning=false},TRANSITION_MS.done)
}
function exitNaxos(){transition(false,removeLayer)}
function layer(body,title="Naxos",back=null){
  clearTimers();cleanupRecording();document.querySelector(".evia-course-epa-layer")?.remove();document.querySelector(".evia-tools-layer:not(.evia-course-epa-layer)")?.remove();
  const el=document.createElement("div");el.className="evia-tools-layer evia-course-epa-layer evia-course-epa naxos-layer";
  el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-course-epa-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;
  document.body.appendChild(el);el.querySelector("[data-course-epa-back]").onclick=back||openEPA;return el
}
function avatar(){return `<div class="naxos-avatar" aria-hidden="true"><span class="naxos-halo"></span><span class="naxos-face"><i></i><i></i></span></div>`}
function methodCard(key,label,desc,disabled=false){return `<button class="naxos-method-card" data-course-epa-method="${key}" ${disabled?"disabled":""}><span><b>${esc(label)}</b><small>${esc(desc)}</small></span><em>${disabled?"—":`${score(key)}%`}</em></button>`}
function openEPA(){
  const p=profile();if(!p)return;
  cleanupInterview();const weak=weakCodes(),codes=activeCodes();
  const weakCopy=weak.length?`${weak.length} KSB${weak.length===1?"":"s"} need more practice`:"No weak KSBs identified yet";
  const mcqReady=!!p.mcq.questions&&p.mcqBank.length>=p.mcq.questions;
  const el=layer(`
    <div class="naxos-home">
      ${avatar()}
      <div class="naxos-brand"><strong>Naxos</strong><span>EPA Simulator</span></div>
      <p class="naxos-course">${esc(courseLabel())}${standardLabel()?` · ${esc(standardLabel())}`:""}</p>
      <div class="naxos-readiness"><strong>${overall()}%</strong><span>practice readiness</span><small>${codes.length} current KSB${codes.length===1?"":"s"} from the assigned course</small></div>
      ${methodCard("mcq","Knowledge Test",mcqReady?`${p.mcq.questions} questions · ${p.mcq.minutes} minutes · closed-book style`:"Knowledge simulator not configured for this standard yet",!mcqReady)}
      ${methodCard("interview","Interview",`${p.interview.minutes} minute practice · course-specific KSB prompts`,!p.interview.length)}
      ${methodCard("practical","Practical",`${p.practical.hours} hour format · practical areas and assessor questions`,!p.practicalAreas.length)}
      <button class="naxos-special-card" data-naxos-full><span><b>Full Mock EPA</b><small>Run all three EPA areas as one preparation route</small></span><i>›</i></button>
      <div class="naxos-split">
        <button data-naxos-test><b>Naxos, test me</b><small>One quick challenge</small></button>
        <button data-naxos-weak><b>Weak areas</b><small>${esc(weakCopy)}</small></button>
      </div>
      <p class="naxos-note">Naxos uses the KSBs from the course currently assigned in Evia. Practice results are readiness indicators, not official EPA grades.</p>
    </div>
  `,"Naxos",exitNaxos);
  el.querySelectorAll("[data-course-epa-method]").forEach(b=>b.onclick=()=>{if(b.disabled)return;const k=b.dataset.courseEpaMethod;if(k==="mcq")mcqIntro();else if(k==="practical")practicalIntro();else interviewIntro()});
  el.querySelector("[data-naxos-full]").onclick=fullMock;
  el.querySelector("[data-naxos-test]").onclick=quickTest;
  el.querySelector("[data-naxos-weak]").onclick=weakAreas
}
function enterNaxos(){transition(true,openEPA)}
function shuffled(xs){const a=[...xs],seed=(Date.now()^(Number(read()?.attempts?.mcq)||0)*2654435761)>>>0;let x=seed||123456789;const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function fullMock(){
  const p=profile(),el=layer(`<p class="evia-tools-kicker">Full Mock EPA</p><h2>Rehearse the complete EPA route.</h2><p class="evia-tools-copy">Complete each method without coaching. Your three latest method scores remain separate so you can see exactly where you are ready and where you still need practice.</p><div class="naxos-full-list"><div><span>01</span><b>Knowledge Test</b><em>${score("mcq")}%</em></div><div><span>02</span><b>Interview</b><em>${score("interview")}%</em></div><div><span>03</span><b>Practical</b><em>${score("practical")}%</em></div></div>${p.mcq.questions?'<button class="evia-tools-primary" data-full-start>Start with Knowledge Test</button>':""}<button class="evia-tools-secondary" data-full-back>Back to Naxos</button>`,"Full Mock EPA",openEPA);
  el.querySelector("[data-full-start]")?.addEventListener("click",mcqIntro);el.querySelector("[data-full-back]").onclick=openEPA
}
function weakAreas(){
  const xs=weakCodes(20),d=descriptions();const body=xs.length?xs.map(x=>`<div class="naxos-weak-row"><span><b>${esc(x.code)}</b><small>${esc(d[x.code]||"Current course KSB")}</small></span><em>${x.score}%</em></div>`).join(""):`<div class="naxos-empty"><b>No weak areas yet</b><span>Complete some Naxos practice and your weaker KSBs will appear here.</span></div>`;
  layer(`<p class="evia-tools-kicker">${esc(courseLabel())}</p><h2>Weak areas</h2><p class="evia-tools-copy">These are calculated only from KSBs in your currently assigned course.</p><div class="naxos-weak-list">${body}</div>`,"Weak areas",openEPA)
}
function quickTest(){
  const p=profile(),weak=new Set(weakCodes(20).map(x=>x.code)),pool=p.mcqBank.filter(x=>weak.has(String(x.ksb))),source=pool.length?pool:p.mcqBank;
  if(!source.length){interviewIntro();return}
  const item=shuffled(source)[0],el=layer(`<p class="evia-tools-kicker">Naxos, test me</p><div class="evia-mcq-meta"><span>Quick challenge</span><b>${esc(item.ksb||"")}</b></div><h2 class="evia-question-title">${esc(item.question)}</h2><div class="evia-answer-list">${item.options.map((o,n)=>`<button class="evia-answer" data-quick-answer="${n}"><span>${String.fromCharCode(65+n)}</span><b>${esc(o)}</b></button>`).join("")}</div><div data-quick-result></div>`,"Quick test",openEPA);
  el.querySelectorAll("[data-quick-answer]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.quickAnswer),ok=n===item.answer;el.querySelectorAll("[data-quick-answer]").forEach((x,i)=>{x.disabled=true;x.classList.toggle("on",i===item.answer)});if(item.ksb)recordKsb(item.ksb,ok?100:0);el.querySelector("[data-quick-result]").innerHTML=`<div class="naxos-feedback ${ok?"good":"review"}"><b>${ok?"Correct":"Review this KSB"}</b><span>${esc(descriptions()[item.ksb]||item.ksb||"")}</span></div><button class="evia-tools-primary" data-quick-again>Another question</button>`;el.querySelector("[data-quick-again]").onclick=quickTest})
}
function mcqIntro(){
  const p=profile();if(!p?.mcq?.questions)return openEPA();
  const el=layer(`<p class="evia-tools-kicker">${esc(courseLabel())}</p><h2>Knowledge Test</h2><p class="evia-tools-copy">This mock uses only knowledge KSBs that belong to the course currently assigned in Evia. Coaching disappears once the test starts.</p><div class="evia-course-epa-facts"><span>Questions <b>${p.mcq.questions}</b></span><span>Time <b>${p.mcq.minutes} minutes</b></span></div><button class="evia-tools-primary" data-course-mcq-start>Start ${p.mcq.questions}-question test</button>`,"Knowledge Test",openEPA);
  el.querySelector("[data-course-mcq-start]").onclick=startMCQ
}
function startMCQ(){
  const p=profile(),questions=shuffled(p.mcqBank).slice(0,p.mcq.questions);mcqState={index:0,questions,answers:Array(questions.length).fill(null),ends:Date.now()+p.mcq.minutes*60*1000};renderMCQ();startMCQTimer()
}
function startMCQTimer(){clearInterval(mcqTimer);mcqTimer=setInterval(()=>{if(!mcqState){clearInterval(mcqTimer);return}const left=mcqState.ends-Date.now(),node=document.querySelector("[data-course-mcq-time]");if(node)node.textContent=clock(left);if(left<=0){clearInterval(mcqTimer);finishMCQ()}},250)}
function renderMCQ(){
  const s=mcqState;if(!s)return;const i=s.index,item=s.questions[i],answer=s.answers[i],left=s.ends-Date.now();
  const el=layer(`<div class="evia-mcq-meta"><span>Question ${i+1} of ${s.questions.length}</span><b data-course-mcq-time>${clock(left)}</b></div><h2 class="evia-question-title">${esc(item.question)}</h2><div class="evia-answer-list">${item.options.map((o,n)=>`<button class="evia-answer ${answer===n?"on":""}" data-course-answer="${n}"><span>${String.fromCharCode(65+n)}</span><b>${esc(o)}</b></button>`).join("")}</div><div class="evia-course-epa-ksb">${esc(item.ksb||"")}</div><div class="evia-question-actions"><button class="evia-tools-secondary" data-course-mcq-prev ${i===0?"disabled":""}>Previous</button><button class="evia-tools-primary" data-course-mcq-next>${i===s.questions.length-1?"Finish":"Next"}</button></div>`,"Knowledge Test",i===0?mcqIntro:()=>{s.index--;renderMCQ();startMCQTimer()});
  el.querySelectorAll("[data-course-answer]").forEach(b=>b.onclick=()=>{s.answers[i]=Number(b.dataset.courseAnswer);renderMCQ();startMCQTimer()});
  el.querySelector("[data-course-mcq-prev]").onclick=()=>{if(i>0){s.index--;renderMCQ();startMCQTimer()}};
  el.querySelector("[data-course-mcq-next]").onclick=()=>{if(i===s.questions.length-1)finishMCQ();else{s.index++;renderMCQ();startMCQTimer()}};
  startMCQTimer()
}
function finishMCQ(){
  if(!mcqState)return;clearInterval(mcqTimer);const p=profile(),s=mcqState;let correct=0;s.questions.forEach((item,i)=>{const ok=s.answers[i]===item.answer;if(ok)correct++;if(item.ksb)recordKsb(item.ksb,ok?100:0)});const pct=Math.round(correct/s.questions.length*100),grade=correct<=p.mcq.failMax?"Below pass":correct<=p.mcq.passMax?"Pass range":"Distinction range";saveScore("mcq",pct,{marks:correct,total:s.questions.length,grade});mcqState=null;
  const el=layer(`<div class="result"><p class="evia-tools-kicker">Knowledge Test</p><div class="evia-result-score">${correct}/${p.mcq.questions}</div><h2>${esc(grade)}</h2><p class="evia-tools-copy">Naxos has updated your readiness and KSB weak-area data from this attempt.</p><button class="evia-tools-primary" data-course-result-done>Back to Naxos</button></div>`,"Knowledge Test",openEPA);el.querySelector("[data-course-result-done]").onclick=openEPA
}
function practicalIntro(){
  const p=profile();if(!p.practicalAreas.length)return openEPA();
  const el=layer(`<p class="evia-tools-kicker">${esc(courseLabel())}</p><h2>Practical</h2><p class="evia-tools-copy">Work through the trade-specific areas you may need to demonstrate. Tick only what you can genuinely perform to the required standard.</p><div class="evia-course-epa-facts"><span>EPA format <b>${p.practical.hours} hours</b></span><span>Assessor questions <b>At least ${p.practical.minQuestions}</b></span></div><button class="evia-tools-primary" data-course-practical-start>Start practical rehearsal</button>`,"Practical",openEPA);
  el.querySelector("[data-course-practical-start]").onclick=()=>{practicalState={index:0,checks:p.practicalAreas.map(a=>a.checks.map(()=>false))};renderPractical()}
}
function renderPractical(){
  const p=profile(),s=practicalState,i=s.index,a=p.practicalAreas[i],checks=s.checks[i];
  const el=layer(`<div class="evia-mcq-meta"><span>Area ${i+1} of ${p.practicalAreas.length}</span><b>${esc(courseLabel())}</b></div><h2 class="evia-question-title">${esc(a.title)}</h2><p class="evia-tools-copy">${esc(a.desc)}</p><div class="evia-check-list">${a.checks.map((t,n)=>`<button class="evia-check ${checks[n]?"on":""}" data-course-practical-check="${n}"><i>${checks[n]?"✓":""}</i><span>${esc(t)}</span></button>`).join("")}</div><div class="evia-course-epa-ksb">${a.ksbs.join(" · ")}</div><div class="evia-question-actions"><button class="evia-tools-secondary" data-course-practical-prev ${i===0?"disabled":""}>Previous</button><button class="evia-tools-primary" data-course-practical-next>${i===p.practicalAreas.length-1?"Finish":"Next"}</button></div>`,"Practical",i===0?practicalIntro:()=>{s.index--;renderPractical()});
  el.querySelectorAll("[data-course-practical-check]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.coursePracticalCheck);checks[n]=!checks[n];b.classList.toggle("on",checks[n]);b.querySelector("i").textContent=checks[n]?"✓":""});
  el.querySelector("[data-course-practical-prev]").onclick=()=>{if(i>0){s.index--;renderPractical()}};
  el.querySelector("[data-course-practical-next]").onclick=()=>{if(i===p.practicalAreas.length-1)finishPractical();else{s.index++;renderPractical()}}
}
function finishPractical(){
  const p=profile(),all=practicalState.checks.flat(),got=all.filter(Boolean).length,total=all.length,pct=total?Math.round(got/total*100):0;
  p.practicalAreas.forEach((a,i)=>{const checks=practicalState.checks[i],apct=checks.length?Math.round(checks.filter(Boolean).length/checks.length*100):0;(a.ksbs||[]).forEach(code=>recordKsb(code,apct))});
  saveScore("practical",pct,{checks:got,total});practicalState=null;
  const el=layer(`<div class="result"><p class="evia-tools-kicker">Practical</p><div class="evia-result-score">${pct}%</div><h2>Practical rehearsal complete</h2><p class="evia-tools-copy">You checked ${got} of ${total} trade-specific practice points. Naxos has updated the KSB areas that need more rehearsal.</p><button class="evia-tools-primary" data-course-result-done>Back to Naxos</button></div>`,"Practical",openEPA);el.querySelector("[data-course-result-done]").onclick=openEPA
}
function interviewIntro(){
  const p=profile();if(!p.interview.length)return openEPA();cleanupInterview();interviewState={index:0,checks:p.interview.map(item=>item.cover.map(()=>false)),recordings:p.interview.map(()=>null)};
  const el=layer(`<p class="evia-tools-kicker">${esc(courseLabel())}</p><h2>Interview</h2><p class="evia-tools-copy">Record your answer as if the assessor asked you. Use the cover points to learn what a complete answer sounds like, then repeat it until you can answer naturally without prompts.</p><div class="evia-course-epa-facts"><span>EPA format <b>${p.interview.minutes} minutes</b></span><span>Questions <b>At least ${p.interview.questions}</b></span></div><button class="evia-tools-primary" data-course-interview-start>Start interview practice</button>`,"Interview",openEPA);el.querySelector("[data-course-interview-start]").onclick=renderInterview
}
function mime(){if(typeof MediaRecorder==="undefined")return"";const xs=["audio/webm;codecs=opus","audio/mp4","audio/webm"];return xs.find(x=>!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(x))||""}
function revokeRecording(i){const r=interviewState?.recordings?.[i];if(r?.url)try{URL.revokeObjectURL(r.url)}catch{}}
function renderInterview(){
  cleanupRecording(false);const p=profile(),s=interviewState,i=s.index,item=p.interview[i],checks=s.checks[i],recording=s.recordings[i];
  const el=layer(`<div class="evia-mcq-meta"><span>Question ${i+1} of ${p.interview.length}</span><b>${esc(item.theme)}</b></div><h2 class="evia-question-title">${esc(item.question)}</h2><div class="evia-int-cover"><b>Cover this in your answer</b><span>Tick each point only when you have genuinely covered it.</span></div><div class="evia-check-list">${item.cover.map((t,n)=>`<button class="evia-check ${checks[n]?"on":""}" data-course-interview-check="${n}"><i>${checks[n]?"✓":""}</i><span>${esc(t)}</span></button>`).join("")}</div><div class="evia-int-recorder"><div class="evia-int-record-head"><b data-course-rec-status>${recording?"Answer recorded":"Ready to record"}</b><span data-course-rec-time>${recording?"Listen back below":"0:00"}</span></div>${recording?`<audio controls preload="metadata" src="${recording.url}"></audio>`:""}<button class="evia-tools-primary" data-course-rec-start>${recording?"Record again":"Start recording"}</button><button class="evia-tools-secondary" data-course-rec-stop hidden>Stop recording</button></div><div class="evia-course-epa-ksb">${item.ksbs.join(" · ")}</div><div class="evia-question-actions"><button class="evia-tools-secondary" data-course-int-prev ${i===0?"disabled":""}>Previous</button><button class="evia-tools-primary" data-course-int-next ${recording?"":"disabled"}>${i===p.interview.length-1?"Finish":"Next"}</button></div>`,"Interview",i===0?interviewIntro:()=>{s.index--;renderInterview()});
  el.querySelectorAll("[data-course-interview-check]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.courseInterviewCheck);checks[n]=!checks[n];b.classList.toggle("on",checks[n]);b.querySelector("i").textContent=checks[n]?"✓":""});
  el.querySelector("[data-course-int-prev]").onclick=()=>{if(i>0){s.index--;renderInterview()}};
  el.querySelector("[data-course-int-next]").onclick=()=>{if(!s.recordings[i])return;if(i===p.interview.length-1)finishInterview();else{s.index++;renderInterview()}};
  el.querySelector("[data-course-rec-start]").onclick=()=>startRecording(el,i);el.querySelector("[data-course-rec-stop]").onclick=stopRecording
}
async function startRecording(el,index){
  if(recorder?.state==="recording")return;
  const status=el.querySelector("[data-course-rec-status]"),start=el.querySelector("[data-course-rec-start]"),stop=el.querySelector("[data-course-rec-stop]"),time=el.querySelector("[data-course-rec-time]");
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){status.textContent="Voice recording is not supported on this device.";return}
  try{stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:{ideal:1},echoCancellation:true,noiseSuppression:true}})}catch{status.textContent="Allow microphone access to record your answer.";return}
  if(!stream.getAudioTracks().length){cleanupRecording(false);status.textContent="No microphone was available.";return}
  chunks=[];const type=mime(),opts=type?{mimeType:type,audioBitsPerSecond:64000}:{audioBitsPerSecond:64000};try{recorder=new MediaRecorder(stream,opts)}catch{try{recorder=new MediaRecorder(stream)}catch{cleanupRecording(false);status.textContent="Could not start the recorder.";return}}
  start.hidden=true;stop.hidden=false;status.textContent="Recording · microphone on";recordStarted=Date.now();time.textContent="0:00";recordTimer=setInterval(()=>{time.textContent=clock(Date.now()-recordStarted)},250);
  const active=recorder;active.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};active.onerror=()=>{cleanupRecording(false);status.textContent="Recording problem · try again";start.hidden=false;stop.hidden=true};active.onstop=()=>{clearInterval(recordTimer);recordTimer=null;try{stream?.getTracks().forEach(t=>t.stop())}catch{}stream=null;const blob=new Blob(chunks,{type:active.mimeType||type||chunks[0]?.type||"audio/webm"});chunks=[];if(recorder===active)recorder=null;if(blob.size<500){status.textContent="Nothing was recorded · try again";start.hidden=false;stop.hidden=true;return}revokeRecording(index);interviewState.recordings[index]={blob,url:URL.createObjectURL(blob),type:blob.type,durationMs:Date.now()-recordStarted};renderInterview()};active.start(500)
}
function stopRecording(){if(recorder&&recorder.state!=="inactive")try{recorder.stop()}catch{}}
function finishInterview(){
  cleanupRecording(false);const p=profile(),all=interviewState.checks.flat(),got=all.filter(Boolean).length,total=all.length,pct=total?Math.round(got/total*100):0;
  p.interview.forEach((item,i)=>{const checks=interviewState.checks[i],ipct=checks.length?Math.round(checks.filter(Boolean).length/checks.length*100):0;(item.ksbs||[]).forEach(code=>recordKsb(code,ipct))});
  saveScore("interview",pct,{checks:got,total});const finished=interviewState;interviewState=null;finished.recordings.forEach(r=>{if(r?.url)try{URL.revokeObjectURL(r.url)}catch{}});
  const el=layer(`<div class="result"><p class="evia-tools-kicker">Interview</p><div class="evia-result-score">${pct}%</div><h2>Interview practice complete</h2><p class="evia-tools-copy">You covered ${got} of ${total} answer points across your recorded responses. Naxos has updated your KSB weak areas from this practice.</p><button class="evia-tools-primary" data-course-result-done>Back to Naxos</button></div>`,"Interview",openEPA);el.querySelector("[data-course-result-done]").onclick=openEPA
}

document.addEventListener("click",e=>{
  const p=profile();if(!p)return;const b=e.target.closest?.('[data-arch="EPA"]');if(!b)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();enterNaxos()
},true);

function ready(){patchArch();const root=document.getElementById("root");if(root&&!root.__eviaCourseEPAObserved){root.__eviaCourseEPAObserved=true;new MutationObserver(()=>requestAnimationFrame(patchArch)).observe(root,{childList:true,subtree:true})}}
window.addEventListener("load",ready);window.addEventListener("pageshow",patchArch);window.addEventListener("focus",patchArch);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")patchArch()});setTimeout(ready,250);
window.EviaCourseEPAEngine={open:enterNaxos,profile,weakCodes};
})();