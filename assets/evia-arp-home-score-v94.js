(()=>{
"use strict";
const VERSION=94,MC_KEY="evia-arp-mocks-v1",DISCUSSION_KEY="evia-arp-discussion-v1",PRACTICAL_KEY="evia-arp-practical-v1";
let queued=false;
function read(key){try{const value=JSON.parse(localStorage.getItem(key)||"{}");return value&&typeof value==="object"?value:{}}catch{return{}}}
function enrolmentId(){
  const current=window.EviaCourseContext?.current?.();if(!current||current.noCourse)return"";
  const family=String(current.packFamilyId||current.standardId||"").toUpperCase(),courseId=String(current.courseId||"").toLowerCase(),pathway=String(current.pathway||"").toLowerCase();
  if(family==="ST0095"||courseId==="st0095-v1-2")return"ST0095";
  if(family==="ST0264"||courseId==="st0264-v1-4")return pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(family==="6570-05"||courseId==="6570-05")return`6570-05-${({thin:"THIN",repair:"REPAIR",specialist:"SPECIALIST",drainage:"DRAINAGE"}[pathway]||"THIN")}`;
  return""
}
function record(key,id){const all=read(key),value=all[id];return value&&typeof value==="object"?value:{}}
function attemptsFor(key,item){if(key===PRACTICAL_KEY)return Array.isArray(item.attempts)?item.attempts.length:Number(item.attempts||0);return Number(item.attempts||0)}
function modeScore(key,id){const item=record(key,id),attempts=attemptsFor(key,item);return attempts?{attempts,bestPercent:Math.max(0,Math.min(100,Math.round(Number(item.bestPercent||0))))}:{attempts:0,bestPercent:0}}
function progress(){
  const id=enrolmentId();if(!id)return{id:"",attempts:0,percent:0,multipleChoice:0,discussion:0,practical:0};
  const mc=modeScore(MC_KEY,id),discussion=modeScore(DISCUSSION_KEY,id),practical=modeScore(PRACTICAL_KEY,id),attempts=mc.attempts+discussion.attempts+practical.attempts;
  return{id,attempts,percent:attempts?Math.round((mc.bestPercent+discussion.bestPercent+practical.bestPercent)/3):0,multipleChoice:mc.bestPercent,discussion:discussion.bestPercent,practical:practical.bestPercent}
}
function button(){return document.querySelector('.progress-arch[data-arch="ARP"],.progress-arch[data-arch="EPA"],.progress-arch[data-arch="Q&A"],.progress-arch[data-arch="Units"]')}
function patch(){
  queued=false;const target=button();if(!target)return;
  const state=progress(),value=Math.max(0,Math.min(100,state.percent));target.dataset.arch="ARP";target.dataset.arpAttempts=String(state.attempts);target.dataset.arpProgress=String(value);
  const label=target.querySelector(".arch-label");if(label&&label.textContent!=="ARP")label.textContent="ARP";
  const number=target.querySelector(".arch-number");if(number&&number.textContent!==`${value}%`)number.textContent=`${value}%`;
  const path=target.querySelector(".arch-value");if(path){if(path.style.strokeDasharray!==`${value} 100`)path.style.strokeDasharray=`${value} 100`;if(path.getAttribute("stroke-dasharray")!==`${value} 100`)path.setAttribute("stroke-dasharray",`${value} 100`)}
  const detail=state.attempts?`${state.attempts} completed practice ${state.attempts===1?"attempt":"attempts"}`:"no ARP practice attempted yet";
  target.setAttribute("aria-label",`ARP — Assessment Readiness & Practice. ${value}% practice readiness; ${detail}. Open assessment practice`)
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(patch)}
function relevant(records){return records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.(".progress-arch")||node.querySelector?.(".progress-arch"))))}
function start(){
  patch();const root=document.getElementById("root");if(root&&!root.__eviaArpV94Observer){root.__eviaArpV94Observer=true;new MutationObserver(records=>{if(relevant(records))queue()}).observe(root,{childList:true,subtree:true})}
}
window.addEventListener("load",start);window.addEventListener("pageshow",patch);window.addEventListener("storage",e=>{if([MC_KEY,DISCUSSION_KEY,PRACTICAL_KEY].includes(e.key))patch()});
document.addEventListener("click",event=>{if(event.target.closest?.('[data-arp],[data-arch="ARP"]'))setTimeout(patch,40)},true);
if(document.readyState!=="loading")start();
window.EviaArpHomeScore=Object.freeze({version:VERSION,progress,refresh:patch});
})();
