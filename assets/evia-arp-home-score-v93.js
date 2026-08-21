(()=>{
"use strict";
const VERSION=93;
const MC_KEY="evia-arp-mocks-v1";
const DISCUSSION_KEY="evia-arp-discussion-v1";
const PRACTICAL_KEY="evia-arp-practical-v1";
let queued=false;

function read(key){try{const value=JSON.parse(localStorage.getItem(key)||"{}");return value&&typeof value==="object"?value:{}}catch{return{}}}
function enrolmentId(){
  const current=window.EviaCourseContext?.current?.();
  if(!current||current.noCourse)return"";
  const family=String(current.packFamilyId||current.standardId||"").toUpperCase();
  const courseId=String(current.courseId||"").toLowerCase();
  const pathway=String(current.pathway||"").toLowerCase();
  if(family==="ST0095"||courseId==="st0095-v1-2")return"ST0095";
  if(family==="ST0264"||courseId==="st0264-v1-4")return pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(family==="6570-05"||courseId==="6570-05"){
    const suffix={thin:"THIN",repair:"REPAIR",specialist:"SPECIALIST",drainage:"DRAINAGE"}[pathway]||"THIN";
    return`6570-05-${suffix}`
  }
  return""
}
function record(key,id){const all=read(key),value=all[id];return value&&typeof value==="object"?value:{}}
function attemptsFor(key,item){
  if(key===PRACTICAL_KEY)return Array.isArray(item.attempts)?item.attempts.length:Number(item.attempts||0);
  return Number(item.attempts||0)
}
function modeScore(key,id){
  const item=record(key,id),attempts=attemptsFor(key,item);
  if(!attempts)return{attempts:0,bestPercent:0};
  return{attempts,bestPercent:Math.max(0,Math.min(100,Math.round(Number(item.bestPercent||0))))}
}
function progress(){
  const id=enrolmentId();
  if(!id)return{id:"",attempts:0,percent:0,multipleChoice:0,discussion:0,practical:0};
  const mc=modeScore(MC_KEY,id),discussion=modeScore(DISCUSSION_KEY,id),practical=modeScore(PRACTICAL_KEY,id);
  const attempts=mc.attempts+discussion.attempts+practical.attempts;
  const percent=attempts?Math.round((mc.bestPercent+discussion.bestPercent+practical.bestPercent)/3):0;
  return{id,attempts,percent,multipleChoice:mc.bestPercent,discussion:discussion.bestPercent,practical:practical.bestPercent}
}
function button(){return document.querySelector('.progress-arch[data-arch="ARP"],.progress-arch[data-arch="EPA"],.progress-arch[data-arch="Q&A"],.progress-arch[data-arch="Units"]')}
function patch(){
  queued=false;
  const target=button();if(!target)return;
  const state=progress(),value=Math.max(0,Math.min(100,state.percent));
  target.dataset.arch="ARP";
  target.dataset.arpAttempts=String(state.attempts);
  target.dataset.arpProgress=String(value);
  const label=target.querySelector(".arch-label");if(label)label.textContent="ARP";
  const number=target.querySelector(".arch-number");if(number)number.textContent=`${value}%`;
  const path=target.querySelector(".arch-value");if(path){path.style.strokeDasharray=`${value} 100`;path.setAttribute("stroke-dasharray",`${value} 100`)}
  const detail=state.attempts?`${state.attempts} completed practice ${state.attempts===1?"attempt":"attempts"}`:"no ARP practice attempted yet";
  target.setAttribute("aria-label",`ARP — Assessment Readiness & Practice. ${value}% practice readiness; ${detail}. Open assessment practice`)
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(patch)}
new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener("load",patch);window.addEventListener("pageshow",patch);window.addEventListener("storage",patch);
document.addEventListener("click",()=>setTimeout(patch,30),true);
setInterval(patch,900);setTimeout(patch,100);
window.EviaArpHomeScore=Object.freeze({version:VERSION,progress,refresh:patch});
})();
