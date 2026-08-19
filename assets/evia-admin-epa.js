(()=>{
"use strict";

const RPL_KEY="evia-rpl-ksbs-v1";
const EPA_KEY="evia-epa-practice-v1";
const EVIDENCE_KEY="evia-selfobs-live-v3";
const MEDIA_DB="evia-self-observation-media";
const ALL_CODES=[...Array.from({length:31},(_,i)=>`K${i+1}`),...Array.from({length:22},(_,i)=>`S${i+1}`),...Array.from({length:6},(_,i)=>`B${i+1}`)];

const LABELS={
K1:"Health and safety regulations, standards and guidance",
K2:"Safety control equipment, PPE and RPE",
K3:"Safe systems of work",
K4:"Environmental impact, waste and resource efficiency",
K5:"Environment, sustainability and building performance",
K6:"Building principles and components",
K7:"Standards, regulations and warranty requirements",
K8:"Bricklaying materials and components",
K9:"Modern methods of construction",
K10:"Drawings and specifications",
K11:"Digital design and modelling information",
K12:"Estimating resources and quantities",
K13:"Hand tools: use, maintenance and storage",
K14:"Power tools: use, limitations and safety",
K15:"Bond types",
K16:"Solid wall setting out, construction and capping",
K17:"Joint finishes",
K18:"Decorative walling and piers",
K19:"Expansion and movement joints",
K20:"Mixing mortar",
K21:"Cavity wall setting out",
K22:"Cavity wall construction and components",
K23:"Brick-on-edge and soldier courses",
K24:"Defects and repair",
K25:"Protecting materials and finished work",
K26:"Verbal communication and construction terminology",
K27:"Team working",
K28:"Inclusion, equity and diversity",
K29:"Cutting bricks and blocks with hand tools",
K30:"Raking-cut walls",
K31:"Wellbeing and support",
S1:"Comply with health and safety requirements",
S2:"Identify and use PPE and RPE",
S3:"Minimise environmental impact and manage waste",
S4:"Comply with industry regulations and standards",
S5:"Interpret drawings and specifications",
S6:"Estimate and select resources",
S7:"Prepare and maintain a safe work area",
S8:"Select and use hand and power tools",
S9:"Maintain and store hand tools",
S10:"Set out a brick and block cavity wall",
S11:"Construct a cavity wall with return and opening",
S12:"Form joint finishes",
S13:"Set out and construct a simple solid wall",
S14:"Gauge and mix mortar to the required ratio",
S15:"Measure and cut bricks and blocks with hand tools",
S16:"Carry out a simple repair",
S17:"Protect materials and finished work",
S18:"Communicate verbally using construction terminology",
S19:"Follow inclusion, equity and diversity principles",
S20:"Apply team-working principles",
S21:"Identify wellbeing support",
S22:"Construct a wall with a raking cut",
B1:"Put health, safety and wellbeing first",
B2:"Consider the environment",
B3:"Take ownership of work",
B4:"Support an inclusive and diverse culture",
B5:"Seek learning and development opportunities",
B6:"Work as part of the wider team"
};

const MCQ=[
["Which document normally sets out the safe sequence and controls for a task?",["Method statement","Delivery ticket","Timesheet","Snagging list"],0],
["What is the main purpose of a risk assessment?",["To identify hazards and decide controls","To order materials","To calculate wages","To record brick quantities"],0],
["Which control is most appropriate for reducing inhalation of silica dust when cutting masonry?",["Suitable dust suppression/extraction and RPE","Work faster","Open a window only","Wear gloves only"],0],
["What does COSHH mainly deal with?",["Hazardous substances and exposure controls","Scaffold design","Brick bonds","Setting-out dimensions"],0],
["Why should waste be segregated on site?",["To support safe disposal, reuse and recycling","To make skips heavier","To avoid measuring materials","To replace a risk assessment"],0],
["What is a main purpose of wall insulation?",["Reduce heat transfer","Increase mortar strength","Replace wall ties","Prevent all movement"],0],
["What is the main purpose of a DPC?",["Resist moisture passing through the construction","Support a lintel","Tie wall leaves together","Control mortar colour"],0],
["Which document is most likely to give dimensions and locations for the work?",["Construction drawing","Payslip","Toolbox register","Delivery receipt"],0],
["Why is a gauge rod useful?",["To keep courses and heights consistent","To test electrical tools","To measure mortar strength","To sharpen tools"],0],
["What is the main purpose of wall ties in a cavity wall?",["Connect the two leaves while maintaining the cavity","Replace insulation","Support scaffold boards","Form the DPC"],0],
["Why are weep holes used above some openings?",["To allow water collected by a cavity tray to drain out","To hold insulation in place","To ventilate the room","To fix the lintel"],0],
["What is the purpose of a cavity tray?",["To direct moisture to the outer leaf and weep holes","To increase brick strength","To replace the lintel","To support the inner leaf"],0],
["What is the best reason for checking line, level and plumb regularly?",["To identify and correct inaccuracies as work progresses","To reduce the number of wall ties","To avoid using drawings","To make mortar set faster"],0],
["What does stretcher bond mainly show on the face of a wall?",["Stretchers overlapping by approximately half a unit","Headers only","Vertical joints aligned in every course","Bricks laid on edge only"],0],
["Which bond alternates headers and stretchers within each course?",["Flemish bond","Stretcher bond","Stack bond","Broken bond"],0],
["Why are movement joints provided in masonry?",["To accommodate movement and reduce uncontrolled cracking","To drain the cavity","To hold insulation","To replace DPC"],0],
["What is efflorescence?",["Salt deposits that can appear on masonry surfaces","A type of wall tie","A mortar joint profile","A lintel defect"],0],
["Why should bricks and blocks be protected from frost and saturation?",["To reduce damage and poor performance","To make them heavier","To remove the need for mortar","To improve colour matching only"],0],
["What is the purpose of a lintel?",["Support masonry over an opening","Tie two wall leaves together","Stop rising damp","Set mortar ratio"],0],
["Before using a powered cutting tool, what should be checked first?",["That it is suitable, guarded and in safe condition","That the wall is already complete","That mortar is fully dry","That the delivery note is signed"],0],
["What is meant by gauging mortar materials?",["Measuring ingredients consistently to the required ratio","Adding water without measuring","Mixing any available materials","Judging colour only"],0],
["Why should a mortar ratio be followed?",["To achieve the specified performance and consistency","To make every mix the same colour only","To eliminate curing time","To avoid using clean water"],0],
["Which joint finish is formed with a rounded jointing tool?",["Half-round","Flush","Recessed","Weather-struck"],0],
["Why is a recessed joint generally more exposed than a half-round joint?",["It leaves the mortar face set back from the masonry face","It contains no cement","It has no bed joints","It removes the need for pointing"],0],
["What should happen if a drawing conflicts with the work on site?",["Stop and seek clarification before proceeding","Choose whichever dimension is easiest","Ignore the drawing","Continue and correct it later"],0],
["Why are openings checked for size and position during setting out?",["So components and finishes can fit the required dimensions","To reduce the number of courses","To avoid using profiles","To change the bond automatically"],0],
["What is a key reason for keeping the cavity clear?",["To reduce moisture bridging and maintain performance","To increase mortar waste","To support scaffold","To replace insulation"],0],
["How should rigid cavity insulation generally be fitted?",["Tightly jointed and positioned as specified without gaps","Loose with large gaps","Only at corners","Against the outer face regardless of specification"],0],
["Why is fire stopping installed in required locations?",["To restrict the spread of fire and smoke through concealed spaces","To replace wall ties","To increase opening width","To colour-code the cavity"],0],
["What is the best response to finding defective brickwork?",["Identify the cause and use an appropriate repair method","Cover it immediately","Ignore it if it is above ground","Add more wall ties"],0],
["Why should hand tools be cleaned and stored correctly?",["To maintain condition, safety and service life","To change their size","To avoid PPE","To increase mortar strength"],0],
["When cutting a brick by hand, what helps achieve an accurate cut?",["Measure, mark and use the correct tool and technique","Strike it randomly","Soak every brick first","Remove PPE"],0],
["What is the purpose of a return in masonry?",["It forms a change in wall direction and helps create a stable junction","It drains a cavity tray","It replaces a lintel","It is a mortar joint finish"],0],
["Why is clear construction terminology important when speaking with the team?",["It reduces misunderstanding about the work","It replaces drawings","It removes the need for supervision","It changes tolerances"],0],
["What is a good example of effective teamwork?",["Coordinating work and communicating with other trades","Working without telling anyone","Ignoring sequencing","Only checking your own area"],0],
["What should you do if you are unsure how to carry out an unfamiliar task safely?",["Ask for guidance or training before continuing","Guess and continue","Remove the controls","Wait until the end of the day"],0],
["Why is inclusion important on a construction site?",["People should be treated fairly and able to contribute safely","It removes all site rules","It means everyone does the same job","It replaces competence requirements"],0],
["What is the most appropriate action if you or a colleague is struggling with wellbeing?",["Use available support and raise concerns appropriately","Ignore it","Post about it publicly","Leave the site without telling anyone"],0],
["Why are materials estimated before work starts?",["To plan sufficient resources and reduce shortages and waste","To avoid reading drawings","To replace quality checks","To remove the need for storage"],0],
["What is the safest approach when work at height is required?",["Use the planned access and fall-prevention controls","Stand on loose materials","Climb the wall","Work without checking the platform"],0]
];

const INTERVIEW=[
["Tell me about a time you identified a defect or problem in brickwork and what you did about it.","Defects, repair and ownership"],
["Explain how you protect materials and finished masonry from weather or site damage.","Protection and ownership"],
["Tell me about a mortar mix you have used and how you made sure the ratio and consistency were right.","Mortar"],
["Give an example of how you used a drawing, specification or site information to carry out your work.","Information"],
["Tell me about a time you had to communicate clearly with another trade or member of the site team.","Communication"],
["Describe a job where teamwork affected the quality or sequence of your brickwork.","Teamwork"],
["Tell me about a time you checked your own work and corrected something before it became a bigger problem.","Ownership"],
["Explain how you make sure people are treated fairly and respectfully when you are working with them.","Inclusion"],
["Tell me about something new you learned or practised and how it improved your work.","Development"],
["If you or someone else was struggling physically or mentally at work, what support could you use?","Wellbeing"]
];

const PRACTICAL=[
["Safe setup and controls","Set up a suitable work area, select the required PPE/RPE and explain the main hazards and controls."],
["Set out cavity wall and opening","Practise setting out the wall, opening, lines, levels, profiles and gauge so the work can be built accurately."],
["Build cavity wall accurately","Practise building the two leaves, return and opening while checking line, level, plumb, gauge and cavity cleanliness."],
["Opening, lintel and special courses","Practise the opening detail, lintel, soldier course and brick-on-edge sill where suitable."],
["Cavity components","Practise or rehearse correct wall ties, insulation, DPC, cavity tray, weep holes and fire-stopping details."],
["Finishing, cutting and quality","Practise joint finishing, measuring/cutting masonry, checking tolerances and protecting the finished work."]
];

function readJSON(key,fallback){
  try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}
}
function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function rplSet(){return new Set(readJSON(RPL_KEY,[]).filter(x=>ALL_CODES.includes(x)))}
function epaData(){
  const x=readJSON(EPA_KEY,{});
  return {
    mcq:Number.isFinite(Number(x.mcq))?Math.max(0,Math.min(100,Number(x.mcq))):0,
    interview:Number.isFinite(Number(x.interview))?Math.max(0,Math.min(100,Number(x.interview))):0,
    practical:Number.isFinite(Number(x.practical))?Math.max(0,Math.min(100,Number(x.practical))):0,
    attempts:x.attempts||{}
  };
}
function overallEPA(){
  const x=epaData();
  return Math.round((x.mcq+x.interview+x.practical)/3);
}
function evidenceCodes(){
  const out=new Set();
  const entries=readJSON(EVIDENCE_KEY,[]);
  if(Array.isArray(entries)) entries.forEach(e=>{
    if(Array.isArray(e?.codes)) e.codes.forEach(c=>{if(ALL_CODES.includes(c))out.add(c)});
  });
  return out;
}
function setArch(button,pct){
  if(!button)return;
  const value=button.querySelector(".arch-value");
  const number=button.querySelector(".arch-number");
  const dash=`${pct} 100`,text=`${pct}%`;
  if(value&&value.getAttribute("stroke-dasharray")!==dash)value.setAttribute("stroke-dasharray",dash);
  if(number&&number.textContent!==text)number.textContent=text;
}
function patchArches(){
  const rpl=rplSet(), evidence=evidenceCodes();
  const covered=new Set([...rpl,...evidence]);
  document.querySelectorAll('[data-arch="KSB"]').forEach(b=>setArch(b,Math.round(covered.size/59*100)));
  document.querySelectorAll('[data-arch="EPA"]').forEach(b=>setArch(b,overallEPA()));
}
function patchCoverage(){
  const panel=document.querySelector(".self-panel");
  if(!panel)return;
  const ksbs=panel.querySelector(".self-ksbs");
  if(!ksbs)return;
  const rpl=rplSet();
  const copy=panel.querySelector(".self-copy");
  const coverageCopy="Yellow marks show learner evidence. A purple o means the KSB has been marked as RPL. RPL counts towards coverage, but you can still add more evidence.";
  if(copy&&copy.textContent!==coverageCopy)copy.textContent=coverageCopy;
  ksbs.querySelectorAll("button[data-code]").forEach(btn=>{
    const code=btn.dataset.code;
    let mark=btn.querySelector(".evia-rpl-o");
    if(rpl.has(code)){
      if(!mark){mark=document.createElement("span");mark.className="evia-rpl-o";mark.textContent="o";btn.appendChild(mark)}
    }else mark?.remove();
  });
}
function patchUI(){patchArches();patchCoverage()}

function overlay(inner,cls=""){
  closeOverlay();
  const layer=document.createElement("div");
  layer.className=`evia-tools-layer ${cls}`.trim();
  layer.innerHTML=`<section class="evia-tools-screen">${inner}</section>`;
  document.body.appendChild(layer);
  return layer;
}
function closeOverlay(){document.querySelector(".evia-tools-layer")?.remove()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toolHeader(title,backAction="close"){
  return `<div class="evia-tools-head"><button type="button" data-tools-back="${backAction}">‹ Back</button><b>${esc(title)}</b><span></span></div>`;
}
function bindBack(layer,fn=closeOverlay){
  layer.querySelectorAll("[data-tools-back]").forEach(b=>b.onclick=fn);
}

let adminTapTimes=[];
document.addEventListener("click",e=>{
  const name=e.target.closest?.(".self-top b");
  if(!name||name.textContent.trim()!=="Evia")return;
  const now=Date.now();
  adminTapTimes=adminTapTimes.filter(t=>now-t<4500);
  adminTapTimes.push(now);
  if(adminTapTimes.length>=7){
    adminTapTimes=[];
    e.preventDefault();
    e.stopPropagation();
    openAdmin();
  }
},true);

document.addEventListener("click",e=>{
  const epa=e.target.closest?.('[data-arch="EPA"]');
  if(!epa)return;
  e.preventDefault();
  e.stopPropagation();
  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  openEPA();
},true);

function openAdmin(){
  const layer=overlay(`${toolHeader("Admin mode")}
    <div class="evia-tools-body">
      <p class="evia-tools-kicker">Evia</p>
      <h2>Admin mode</h2>
      <p class="evia-tools-copy">Manage recognised prior learning or reset this learner's Evia data on this device.</p>
      <button class="evia-tools-row" data-admin-rpl><span><b>Recognised prior learning</b><small>Mark individual KSBs as RPL</small></span><i>›</i></button>
      <button class="evia-tools-row danger" data-admin-clear><span><b>Clear learner app data</b><small>Name, evidence, media, OTJ, EPA practice, RPL and progress</small></span><i>›</i></button>
    </div>`,"admin");
  bindBack(layer);
  layer.querySelector("[data-admin-rpl]").onclick=openRPL;
  layer.querySelector("[data-admin-clear]").onclick=openClearConfirm;
}
function openRPL(){
  const rpl=rplSet();
  const groups=[["Knowledge","K",31],["Skills","S",22],["Behaviours","B",6]];
  const sections=groups.map(([title,prefix,count])=>`
    <div class="evia-rpl-group"><h3>${title}</h3>
      ${Array.from({length:count},(_,i)=>{
        const code=`${prefix}${i+1}`,on=rpl.has(code);
        return `<button class="evia-rpl-row ${on?"on":""}" data-rpl-code="${code}">
          <span><b>${code}</b><small>${esc(LABELS[code])}</small></span>
          <em>${on?"RPL":""}</em>
        </button>`;
      }).join("")}
    </div>`).join("");
  const layer=overlay(`${toolHeader("Recognised prior learning","admin")}
    <div class="evia-tools-body">
      <h2>RPL KSBs</h2>
      <p class="evia-tools-copy">Tap a KSB to mark or unmark it. RPL appears as a purple o to the learner and counts towards KSB coverage.</p>
      ${sections}
    </div>`,"admin");
  bindBack(layer,openAdmin);
  layer.querySelectorAll("[data-rpl-code]").forEach(btn=>btn.onclick=()=>{
    const set=rplSet(),code=btn.dataset.rplCode;
    if(set.has(code))set.delete(code);else set.add(code);
    writeJSON(RPL_KEY,[...set]);
    btn.classList.toggle("on",set.has(code));
    btn.querySelector("em").textContent=set.has(code)?"RPL":"";
    patchUI();
  });
}
function openClearConfirm(){
  const layer=overlay(`${toolHeader("Clear learner data","admin")}
    <div class="evia-tools-body">
      <h2>Clear all learner data?</h2>
      <p class="evia-tools-copy">This removes the learner's name, evidence, photos, videos, voice recordings, OTJ, EPA practice, RPL and Evia progress stored on this device.</p>
      <div class="evia-warning">The installed offline app stays on the device. This cannot be undone unless the learner already exported their work elsewhere.</div>
      <button class="evia-tools-primary danger-fill" data-clear-confirm>Clear all learner data</button>
      <button class="evia-tools-secondary" data-clear-cancel>Cancel</button>
    </div>`,"admin");
  bindBack(layer,openAdmin);
  layer.querySelector("[data-clear-cancel]").onclick=openAdmin;
  layer.querySelector("[data-clear-confirm]").onclick=clearLearnerData;
}
async function clearLearnerData(){
  const button=document.querySelector("[data-clear-confirm]");
  if(button){button.disabled=true;button.textContent="Clearing…"}
  try{
    for(let i=localStorage.length-1;i>=0;i--){
      const key=localStorage.key(i);
      if(key&&key.startsWith("evia-"))localStorage.removeItem(key);
    }
    for(let i=sessionStorage.length-1;i>=0;i--){
      const key=sessionStorage.key(i);
      if(key&&key.startsWith("evia-"))sessionStorage.removeItem(key);
    }
    const dbNames=new Set([MEDIA_DB]);
    if(indexedDB.databases){
      try{(await indexedDB.databases()).forEach(x=>{if(x.name?.startsWith("evia-"))dbNames.add(x.name)})}catch{}
    }
    await Promise.all([...dbNames].map(name=>new Promise(resolve=>{
      try{const req=indexedDB.deleteDatabase(name);req.onsuccess=req.onerror=req.onblocked=()=>resolve()}catch{resolve()}
    })));
  }finally{
    location.reload();
  }
}

function scoreCard(label,key,desc){
  const x=epaData(),score=Math.round(x[key]||0);
  return `<button class="evia-epa-card" data-epa-method="${key}">
    <span><b>${esc(label)}</b><small>${esc(desc)}</small></span>
    <em>${score}%</em>
  </button>`;
}
function openEPA(){
  const overall=overallEPA();
  const layer=overlay(`${toolHeader("EPA practice")}
    <div class="evia-tools-body">
      <p class="evia-tools-kicker">Practice readiness</p>
      <div class="evia-epa-overall"><strong>${overall}%</strong><span>EPA readiness</span></div>
      <p class="evia-tools-copy">Practise each of the three EPA methods independently. This is an Evia practice indicator, not an official EPA grade.</p>
      ${scoreCard("Multiple-choice test","mcq","40 questions · 60 minutes")}
      ${scoreCard("Interview practice","interview","10 questions · build strong spoken answers")}
      ${scoreCard("Practical practice","practical","6 rehearsal tasks · self-check your readiness")}
      <div class="evia-epa-note">Your overall readiness is the average of the three practice scores. Each method counts equally in Evia.</div>
    </div>`,"epa");
  bindBack(layer);
  layer.querySelector('[data-epa-method="mcq"]').onclick=()=>openMCQIntro();
  layer.querySelector('[data-epa-method="interview"]').onclick=()=>openInterviewIntro();
  layer.querySelector('[data-epa-method="practical"]').onclick=()=>openPracticalIntro();
}

let mcqState=null,mcqTimer=null;
function openMCQIntro(){
  const layer=overlay(`${toolHeader("Multiple-choice test","epa")}
    <div class="evia-tools-body">
      <h2>Full practice test</h2>
      <p class="evia-tools-copy">40 original Evia practice questions. You have 60 minutes and four options for each question. These are not live EPAO questions.</p>
      <button class="evia-tools-primary" data-start-mcq>Start 40-question test</button>
    </div>`,"epa");
  bindBack(layer,openEPA);
  layer.querySelector("[data-start-mcq]").onclick=startMCQ;
}
function startMCQ(){
  mcqState={index:0,answers:Array(MCQ.length).fill(null),ends:Date.now()+60*60*1000};
  renderMCQ();
  clearInterval(mcqTimer);
  mcqTimer=setInterval(()=>{
    if(!document.querySelector(".evia-mcq-time")){clearInterval(mcqTimer);return}
    const left=Math.max(0,mcqState.ends-Date.now());
    const m=Math.floor(left/60000),s=Math.floor((left%60000)/1000);
    document.querySelector(".evia-mcq-time").textContent=`${m}:${String(s).padStart(2,"0")}`;
    if(left<=0){clearInterval(mcqTimer);finishMCQ()}
  },250);
}
function renderMCQ(){
  const i=mcqState.index,[q,opts]=MCQ[i],chosen=mcqState.answers[i];
  const layer=overlay(`${toolHeader("MCQ practice","quit-mcq")}
    <div class="evia-tools-body">
      <div class="evia-mcq-meta"><span>Question ${i+1} of ${MCQ.length}</span><b class="evia-mcq-time">60:00</b></div>
      <h2 class="evia-question-title">${esc(q)}</h2>
      <div class="evia-answer-list">${opts.map((o,n)=>`<button class="evia-answer ${chosen===n?"on":""}" data-answer="${n}"><span>${String.fromCharCode(65+n)}</span>${esc(o)}</button>`).join("")}</div>
      <div class="evia-question-actions">
        <button class="evia-tools-secondary" data-mcq-prev ${i===0?"disabled":""}>Previous</button>
        <button class="evia-tools-primary" data-mcq-next ${chosen===null?"disabled":""}>${i===MCQ.length-1?"Finish":"Next"}</button>
      </div>
    </div>`,"epa");
  bindBack(layer,openMCQIntro);
  layer.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{
    mcqState.answers[i]=Number(b.dataset.answer);renderMCQ();
  });
  layer.querySelector("[data-mcq-prev]").onclick=()=>{mcqState.index--;renderMCQ()};
  layer.querySelector("[data-mcq-next]").onclick=()=>{
    if(mcqState.answers[i]===null)return;
    if(i===MCQ.length-1)finishMCQ();else{mcqState.index++;renderMCQ()}
  };
}
function finishMCQ(){
  clearInterval(mcqTimer);
  let correct=0;MCQ.forEach((q,i)=>{if(mcqState?.answers[i]===q[2])correct++});
  const pct=Math.round(correct/MCQ.length*100);
  saveEPAScore("mcq",pct);
  const layer=overlay(`${toolHeader("MCQ result","epa")}
    <div class="evia-tools-body result">
      <p class="evia-tools-kicker">Practice score</p><div class="evia-result-score">${pct}%</div>
      <h2>${correct} of ${MCQ.length} correct</h2>
      <p class="evia-tools-copy">This score has been added to your EPA practice readiness.</p>
      <button class="evia-tools-primary" data-result-home>Back to EPA practice</button>
      <button class="evia-tools-secondary" data-result-again>Try again</button>
    </div>`,"epa");
  bindBack(layer,openEPA);
  layer.querySelector("[data-result-home]").onclick=openEPA;
  layer.querySelector("[data-result-again]").onclick=openMCQIntro;
}
function saveEPAScore(key,pct){
  const x=epaData();x[key]=Math.round(pct);x.attempts[key]=(Number(x.attempts[key])||0)+1;writeJSON(EPA_KEY,x);patchArches();
}

let interviewState=null;
function openInterviewIntro(){
  const layer=overlay(`${toolHeader("Interview practice","epa")}
    <div class="evia-tools-body">
      <h2>10-question interview practice</h2>
      <p class="evia-tools-copy">Answer each question out loud as if an assessor asked you. Then tick the parts you genuinely included in your answer.</p>
      <button class="evia-tools-primary" data-start-interview>Start interview practice</button>
    </div>`,"epa");
  bindBack(layer,openEPA);
  layer.querySelector("[data-start-interview]").onclick=()=>{interviewState={index:0,checks:INTERVIEW.map(()=>[false,false,false,false])};renderInterview()};
}
function renderInterview(){
  const i=interviewState.index,[q,theme]=INTERVIEW[i],checks=interviewState.checks[i];
  const items=["I gave a real example","I explained what I did","I explained why I did it","I explained the result or what I learned"];
  const layer=overlay(`${toolHeader("Interview practice","epa")}
    <div class="evia-tools-body">
      <div class="evia-mcq-meta"><span>Question ${i+1} of ${INTERVIEW.length}</span><b>${esc(theme)}</b></div>
      <h2 class="evia-question-title">${esc(q)}</h2>
      <p class="evia-tools-copy">Say your answer out loud first. Then check only what you actually included.</p>
      <div class="evia-check-list">${items.map((t,n)=>`<button class="evia-check ${checks[n]?"on":""}" data-int-check="${n}"><i>${checks[n]?"✓":""}</i><span>${esc(t)}</span></button>`).join("")}</div>
      <div class="evia-question-actions">
        <button class="evia-tools-secondary" data-int-prev ${i===0?"disabled":""}>Previous</button>
        <button class="evia-tools-primary" data-int-next>${i===INTERVIEW.length-1?"Finish":"Next"}</button>
      </div>
    </div>`,"epa");
  bindBack(layer,openEPA);
  layer.querySelectorAll("[data-int-check]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.intCheck);checks[n]=!checks[n];renderInterview()});
  layer.querySelector("[data-int-prev]").onclick=()=>{interviewState.index--;renderInterview()};
  layer.querySelector("[data-int-next]").onclick=()=>{if(i===INTERVIEW.length-1)finishInterview();else{interviewState.index++;renderInterview()}};
}
function finishInterview(){
  const got=interviewState.checks.flat().filter(Boolean).length,total=INTERVIEW.length*4,pct=Math.round(got/total*100);
  saveEPAScore("interview",pct);
  showSimpleResult("Interview",pct,`${got} of ${total} answer-building checks`);
}

let practicalState=null;
function openPracticalIntro(){
  const layer=overlay(`${toolHeader("Practical practice","epa")}
    <div class="evia-tools-body">
      <h2>Practical rehearsal</h2>
      <p class="evia-tools-copy">Use these six areas when you have a suitable training wall or site opportunity. For each one, only tick what you can genuinely do.</p>
      <button class="evia-tools-primary" data-start-practical>Start practical practice</button>
    </div>`,"epa");
  bindBack(layer,openEPA);
  layer.querySelector("[data-start-practical]").onclick=()=>{practicalState={index:0,checks:PRACTICAL.map(()=>[false,false,false,false])};renderPractical()};
}
function renderPractical(){
  const i=practicalState.index,[title,task]=PRACTICAL[i],checks=practicalState.checks[i];
  const items=["I can carry this out independently","I can explain why each main step is needed","I can work accurately to the required standard","I can check my work and correct problems"];
  const layer=overlay(`${toolHeader("Practical practice","epa")}
    <div class="evia-tools-body">
      <div class="evia-mcq-meta"><span>Task ${i+1} of ${PRACTICAL.length}</span><b>Practice</b></div>
      <h2>${esc(title)}</h2><p class="evia-tools-copy">${esc(task)}</p>
      <div class="evia-check-list">${items.map((t,n)=>`<button class="evia-check ${checks[n]?"on":""}" data-prac-check="${n}"><i>${checks[n]?"✓":""}</i><span>${esc(t)}</span></button>`).join("")}</div>
      <div class="evia-question-actions">
        <button class="evia-tools-secondary" data-prac-prev ${i===0?"disabled":""}>Previous</button>
        <button class="evia-tools-primary" data-prac-next>${i===PRACTICAL.length-1?"Finish":"Next"}</button>
      </div>
    </div>`,"epa");
  bindBack(layer,openEPA);
  layer.querySelectorAll("[data-prac-check]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.pracCheck);checks[n]=!checks[n];renderPractical()});
  layer.querySelector("[data-prac-prev]").onclick=()=>{practicalState.index--;renderPractical()};
  layer.querySelector("[data-prac-next]").onclick=()=>{if(i===PRACTICAL.length-1)finishPractical();else{practicalState.index++;renderPractical()}};
}
function finishPractical(){
  const got=practicalState.checks.flat().filter(Boolean).length,total=PRACTICAL.length*4,pct=Math.round(got/total*100);
  saveEPAScore("practical",pct);
  showSimpleResult("Practical",pct,`${got} of ${total} readiness checks`);
}
function showSimpleResult(label,pct,detail){
  const layer=overlay(`${toolHeader(`${label} result`,"epa")}
    <div class="evia-tools-body result">
      <p class="evia-tools-kicker">Practice score</p><div class="evia-result-score">${pct}%</div>
      <h2>${esc(detail)}</h2>
      <p class="evia-tools-copy">This score has been added to your EPA practice readiness.</p>
      <button class="evia-tools-primary" data-result-home>Back to EPA practice</button>
    </div>`,"epa");
  bindBack(layer,openEPA);layer.querySelector("[data-result-home]").onclick=openEPA;
}

const observer=new MutationObserver(()=>patchUI());
observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener("load",patchUI);
window.addEventListener("pageshow",patchUI);
setTimeout(patchUI,250);
})();