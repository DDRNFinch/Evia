(()=>{
"use strict";

const TIMELINE_KEY="evia-course-timeline";
const NAME_KEY="evia-full-name";
const COURSES=[
  {id:"st0095-v1-2",title:"Bricklayer — ST0095 v1.2",pathways:[]},
  {id:"st0264-v1-4",title:"Carpentry & Joinery — ST0264 v1.4",pathways:[
    {id:"site-carpenter",title:"Site Carpenter"},
    {id:"architectural-joiner",title:"Architectural Joiner"}
  ]}
];

function readJSON(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}
function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function currentName(){return String(localStorage.getItem(NAME_KEY)||"").trim()}
function currentTimeline(){
  const x=readJSON(TIMELINE_KEY,{});
  const course=COURSES.find(c=>c.id===x.courseId)||COURSES[0];
  const pathway=course.pathways.find(p=>p.id===x.pathway)||course.pathways[0]||null;
  return{
    courseId:course.id,
    courseTitle:course.title,
    pathway:pathway?.id||"",
    pathwayTitle:pathway?.title||"",
    startDate:String(x.startDate||""),
    endDate:String(x.endDate||""),
    updatedAt:Number(x.updatedAt)||0
  };
}
function parseDay(value){
  const m=String(value||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return null;
  const y=Number(m[1]),mo=Number(m[2])-1,d=Number(m[3]),ms=Date.UTC(y,mo,d),date=new Date(ms);
  if(date.getUTCFullYear()!==y||date.getUTCMonth()!==mo||date.getUTCDate()!==d)return null;return ms
}
function todayDay(){const d=new Date();return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())}
function daysInUTCMonth(year,month){return new Date(Date.UTC(year,month+1,0)).getUTCDate()}
function addMonthsClamped(dayMs,months){
  const d=new Date(dayMs),day=d.getUTCDate(),baseMonth=d.getUTCMonth()+months;
  const year=d.getUTCFullYear()+Math.floor(baseMonth/12),month=((baseMonth%12)+12)%12;
  return Date.UTC(year,month,Math.min(day,daysInUTCMonth(year,month)))
}
function calendarDiff(fromMs,toMs){
  if(fromMs===null||toMs===null||toMs<=fromMs)return{months:0,days:Math.max(0,Math.round(((toMs||0)-(fromMs||0))/86400000))};
  const a=new Date(fromMs),b=new Date(toMs);let months=(b.getUTCFullYear()-a.getUTCFullYear())*12+(b.getUTCMonth()-a.getUTCMonth()),anchor=addMonthsClamped(fromMs,months);
  if(anchor>toMs){months--;anchor=addMonthsClamped(fromMs,months)}
  return{months:Math.max(0,months),days:Math.max(0,Math.round((toMs-anchor)/86400000))}
}
function formatSpan(span){const m=span.months,d=span.days;return`${m} month${m===1?"":"s"} · ${d} day${d===1?"":"s"}`}
function formatDate(value){const ms=parseDay(value);if(ms===null)return"Not set";return new Date(ms).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}
function coursePosition(t=currentTimeline()){
  const start=parseDay(t.startDate),end=parseDay(t.endDate),today=todayDay();
  if(start===null||end===null||end<=start)return{valid:false,pct:0,on:{months:0,days:0},remaining:{months:0,days:0}};
  const elapsedEnd=Math.min(Math.max(today,start),end),remainingStart=Math.min(Math.max(today,start),end),total=end-start;
  const pct=today<=start?0:today>=end?100:Math.round((today-start)/total*100);
  return{valid:true,pct,on:calendarDiff(start,elapsedEnd),remaining:calendarDiff(remainingStart,end)}
}
function patchArch(){
  const pos=coursePosition();
  document.querySelectorAll('[data-arch="TOC"]').forEach(button=>{
    const path=button.querySelector(".arch-value"),number=button.querySelector(".arch-number");
    if(path)path.setAttribute("stroke-dasharray",`${pos.pct} 100`);
    if(number)number.textContent=`${pos.pct}%`
  })
}
function patchName(){const name=currentName();if(!name)return;document.querySelectorAll(".self-top small").forEach(el=>{if(el.textContent!==name)el.textContent=name})}
function closeLayer(){document.querySelector(".evia-toc-layer")?.remove()}
function layer(body,title="My course",back=null){
  closeLayer();document.querySelector(".evia-tools-layer")?.remove();
  const el=document.createElement("div");el.className="evia-tools-layer evia-toc-layer evia-toc";
  el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-toc-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;
  document.body.appendChild(el);el.querySelector("[data-toc-back]").onclick=back||closeLayer;return el
}
function summary(){
  const t=currentTimeline(),pos=coursePosition(t),name=currentName()||"Name not set";if(!pos.valid)return edit();
  const courseLine=t.pathwayTitle?`${t.courseTitle} · ${t.pathwayTitle}`:t.courseTitle;
  const el=layer(`
    <p class="evia-tools-kicker">Time on course</p>
    <div class="evia-toc-hero"><strong>${pos.pct}%</strong><span>through planned course time</span></div>
    <div class="evia-toc-profile"><b>${esc(name)}</b><span>${esc(courseLine)}</span></div>
    <div class="evia-toc-details">
      <div><span>Start date</span><b>${esc(formatDate(t.startDate))}</b></div>
      <div><span>Planned end date</span><b>${esc(formatDate(t.endDate))}</b></div>
      <div class="wide"><span>Time on course</span><b>${esc(formatSpan(pos.on))}</b></div>
      <div class="wide"><span>Time remaining</span><b>${esc(formatSpan(pos.remaining))}</b></div>
    </div>
    <button class="evia-tools-primary" data-edit-course>Edit course details</button>
  `,"My course",closeLayer);
  el.querySelector("[data-edit-course]").onclick=edit
}
function edit(){
  const t=currentTimeline(),name=currentName();
  const courseOptions=COURSES.map(c=>`<option value="${esc(c.id)}" ${c.id===t.courseId?"selected":""}>${esc(c.title)}</option>`).join("");
  const carp=COURSES.find(c=>c.id==="st0264-v1-4");
  const pathwayOptions=carp.pathways.map(p=>`<option value="${esc(p.id)}" ${p.id===t.pathway?"selected":""}>${esc(p.title)}</option>`).join("");
  const el=layer(`
    <h2>Course details</h2>
    <p class="evia-tools-copy">These details set your time-on-course progress and the course Evia loads. Your full name is the same name Evia uses throughout the app.</p>
    <div class="evia-toc-form">
      <label>Full name<input data-toc-name type="text" autocomplete="name" value="${esc(name)}" placeholder="Your full name"></label>
      <label>Course<select data-toc-course>${courseOptions}</select></label>
      <label data-toc-pathway-wrap>Pathway<select data-toc-pathway>${pathwayOptions}</select></label>
      <label>Start date<input data-toc-start type="date" value="${esc(t.startDate)}"></label>
      <label>Planned end date<input data-toc-end type="date" value="${esc(t.endDate)}"></label>
    </div>
    <div class="evia-toc-error" data-toc-error aria-live="polite"></div>
    <button class="evia-tools-primary" data-save-course>Save course details</button>
  `,"My course",t.startDate&&t.endDate?summary:closeLayer);
  const courseSelect=el.querySelector("[data-toc-course]"),pathwayWrap=el.querySelector("[data-toc-pathway-wrap]"),pathwaySelect=el.querySelector("[data-toc-pathway]");
  function syncPathway(){const isCarp=courseSelect.value==="st0264-v1-4";pathwayWrap.hidden=!isCarp;if(isCarp&&!pathwaySelect.value)pathwaySelect.value="site-carpenter"}
  courseSelect.onchange=syncPathway;syncPathway();
  el.querySelector("[data-save-course]").onclick=()=>{
    const fullName=el.querySelector("[data-toc-name]").value.trim(),courseId=courseSelect.value,startDate=el.querySelector("[data-toc-start]").value,endDate=el.querySelector("[data-toc-end]").value,error=el.querySelector("[data-toc-error]");
    const start=parseDay(startDate),end=parseDay(endDate);if(!fullName){error.textContent="Enter the learner's full name.";return}
    if(start===null||end===null){error.textContent="Enter both the start date and planned end date.";return}
    if(end<=start){error.textContent="The planned end date must be after the start date.";return}
    const course=COURSES.find(c=>c.id===courseId)||COURSES[0],pathway=course.pathways.find(p=>p.id===pathwaySelect.value)||course.pathways[0]||null;
    const changed=course.id!==t.courseId||(pathway?.id||"")!==t.pathway;
    localStorage.setItem(NAME_KEY,fullName);
    writeJSON(TIMELINE_KEY,{courseId:course.id,courseTitle:course.title,pathway:pathway?.id||"",pathwayTitle:pathway?.title||"",startDate,endDate,updatedAt:Date.now()});
    patchName();patchArch();
    if(changed){closeLayer();setTimeout(()=>location.reload(),120)}else summary()
  }
}
document.addEventListener("click",e=>{
  const toc=e.target.closest?.('[data-arch="TOC"]');if(!toc)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  const t=currentTimeline();if(parseDay(t.startDate)===null||parseDay(t.endDate)===null)edit();else summary()
},true);
window.addEventListener("load",()=>{patchArch();patchName()});
window.addEventListener("pageshow",()=>{patchArch();patchName()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")patchArch()});
window.addEventListener("storage",e=>{if(e.key===TIMELINE_KEY||e.key===NAME_KEY){patchArch();patchName()}});
setTimeout(()=>{patchArch();patchName()},250);
})();