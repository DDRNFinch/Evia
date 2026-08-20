(()=>{
"use strict";
const STYLE_ID="evia-v69-interaction-fixes-style";
const BUILTIN_LOOK=["evia-team-look-milos","evia-team-look-tinos","evia-team-look-symi","evia-team-look-center"];
const V71_LOOK=["evia-v71-look-milos","evia-v71-look-tinos","evia-v71-look-symi","evia-v71-look-center"];
let handoffTimer=null,strokeTimer=null,lookTimers=[],lastTeamOpen=false;
function ensureStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
/* v71: keep the floating assistants exactly where they are through selection.
   Opacity does not affect hit testing, so the real assistant click still lands. */
.selfobs.evia-team-handoff .evia-team-choice{opacity:1!important;transform:translateY(0) scale(1)!important;transition:none!important;pointer-events:auto!important}
.selfobs.evia-team-handoff-fade .evia-team-choice{opacity:0!important;transform:translateY(0) scale(1)!important;transition:opacity .22s ease!important;pointer-events:auto!important}
/* The v68 module still schedules its old delayed gaze. Neutralise those visual
   states so only the immediate v71 sequence can move Evia. */
.selfobs.evia-team-look-milos [data-evia] .evia-face,.selfobs.evia-team-look-tinos [data-evia] .evia-face,.selfobs.evia-team-look-symi [data-evia] .evia-face,.selfobs.evia-team-look-center [data-evia] .evia-face{translate:0 0!important;rotate:0deg!important}
.selfobs.evia-team-look-milos [data-evia] .evia-eyes,.selfobs.evia-team-look-tinos [data-evia] .evia-eyes,.selfobs.evia-team-look-symi [data-evia] .evia-eyes,.selfobs.evia-team-look-center [data-evia] .evia-eyes{transform:translate(0,0)!important}
/* One smooth gaze system. */
.selfobs.evia-v71-gazing [data-evia] .evia-face{transition:translate .82s cubic-bezier(.16,1,.3,1),rotate .82s cubic-bezier(.16,1,.3,1),filter .32s ease!important}
.selfobs.evia-v71-gazing [data-evia] .evia-eyes{transition:transform .82s cubic-bezier(.16,1,.3,1)!important}
.selfobs.evia-v71-look-milos [data-evia] .evia-face{translate:-.7% 1%!important;rotate:-2.2deg!important}.selfobs.evia-v71-look-milos [data-evia] .evia-eyes{transform:translate(-17%,16%)!important}
.selfobs.evia-v71-look-tinos [data-evia] .evia-face{translate:.7% 1%!important;rotate:2.2deg!important}.selfobs.evia-v71-look-tinos [data-evia] .evia-eyes{transform:translate(17%,16%)!important}
.selfobs.evia-v71-look-symi [data-evia] .evia-face{translate:0 1.5%!important;rotate:0deg!important}.selfobs.evia-v71-look-symi [data-evia] .evia-eyes{transform:translate(0,18%)!important}
.selfobs.evia-v71-look-center [data-evia] .evia-face{translate:0 0!important;rotate:0deg!important}.selfobs.evia-v71-look-center [data-evia] .evia-eyes{transform:translate(0,0)!important}
`;
  document.head.appendChild(s)
}
function app(){return document.querySelector(".evia-app.selfobs")}
function resetEviaStroke(){document.querySelectorAll(".evia-anchor[data-evia]").forEach(b=>b.style.removeProperty("--evia-stroke"))}
function clearLookTimers(){lookTimers.forEach(clearTimeout);lookTimers=[]}
function setLook(state){
  const a=app();if(!a)return;
  V71_LOOK.forEach(c=>a.classList.remove(c));
  if(state)a.classList.add(`evia-v71-look-${state}`)
}
function clearLook(){
  clearLookTimers();
  const a=app();if(!a)return;
  a.classList.remove("evia-v71-gazing");V71_LOOK.forEach(c=>a.classList.remove(c))
}
function startImmediateLook(){
  clearLookTimers();
  const a=app();if(!a)return;
  a.classList.add("evia-v71-gazing");setLook("milos");
  lookTimers.push(setTimeout(()=>{if(app()?.classList.contains("evia-team-open"))setLook("tinos")},950));
  lookTimers.push(setTimeout(()=>{if(app()?.classList.contains("evia-team-open"))setLook("symi")},1900));
  lookTimers.push(setTimeout(()=>{if(app()?.classList.contains("evia-team-open"))setLook("center")},2850))
}
function prepAssistantHandoff(){
  const a=app();if(!a)return;
  clearTimeout(handoffTimer);a.classList.remove("evia-team-handoff-fade");a.classList.add("evia-team-handoff")
}
function fadeAssistantHandoff(){
  const a=app();if(!a)return;
  a.classList.add("evia-team-handoff-fade");
  clearTimeout(handoffTimer);handoffTimer=setTimeout(()=>a.classList.remove("evia-team-handoff","evia-team-handoff-fade"),760)
}
function cancelAssistantHandoff(){
  clearTimeout(handoffTimer);const a=app();a?.classList.remove("evia-team-handoff","evia-team-handoff-fade")
}
document.addEventListener("pointerdown",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  const launch=t.closest("[data-evia-team-launch]");
  if(launch){
    if(launch.getAttribute("aria-expanded")==="true")clearLook();else startImmediateLook();
    return
  }
  if(t.closest("[data-evia-team]")){clearLook();prepAssistantHandoff()}
},true);
document.addEventListener("pointerup",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  if(t.closest("[data-evia-team]")){fadeAssistantHandoff();return}
  if(t.closest(".evia-anchor[data-evia]")){
    clearTimeout(strokeTimer);strokeTimer=setTimeout(resetEviaStroke,1120)
  }
},true);
document.addEventListener("pointercancel",e=>{
  const t=e.target instanceof Element?e.target:null;if(t?.closest("[data-evia-team]"))cancelAssistantHandoff()
},true);
document.addEventListener("click",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  if(t.closest("[data-team-page-back]"))clearLook()
},true);
const observer=new MutationObserver(()=>{
  const a=app();if(!a)return;
  const open=a.classList.contains("evia-team-open");
  if(open&&!lastTeamOpen&&!a.classList.contains("evia-v71-gazing"))startImmediateLook();
  if(!open&&lastTeamOpen&&!a.querySelector("[data-evia-team-page]"))clearLook();
  lastTeamOpen=open;
});
ensureStyles();observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
window.addEventListener("pageshow",()=>{resetEviaStroke();cancelAssistantHandoff();clearLook()});
})();
