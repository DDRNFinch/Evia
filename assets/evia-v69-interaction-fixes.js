(()=>{
"use strict";
const STYLE_ID="evia-v69-interaction-fixes-style";
const LOOK_CLASSES=["evia-v70-look-milos","evia-v70-look-tinos","evia-v70-look-symi","evia-v70-look-center"];
let handoffTimer=null,strokeTimer=null,lookTimers=[],lookState=null;
function ensureStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs.evia-team-handoff .evia-team-choice{opacity:0!important;transform:translateY(0) scale(1)!important;transition:opacity .26s ease!important;pointer-events:none!important}
.selfobs.evia-v70-look-milos [data-evia] .evia-face{translate:-.7% 1%!important;rotate:-2.2deg!important}.selfobs.evia-v70-look-milos [data-evia] .evia-eyes{transform:translate(-17%,16%)!important}
.selfobs.evia-v70-look-tinos [data-evia] .evia-face{translate:.7% 1%!important;rotate:2.2deg!important}.selfobs.evia-v70-look-tinos [data-evia] .evia-eyes{transform:translate(17%,16%)!important}
.selfobs.evia-v70-look-symi [data-evia] .evia-face{translate:0 1.5%!important;rotate:0deg!important}.selfobs.evia-v70-look-symi [data-evia] .evia-eyes{transform:translate(0,18%)!important}
.selfobs.evia-v70-look-center [data-evia] .evia-face{translate:0 0!important;rotate:0deg!important}.selfobs.evia-v70-look-center [data-evia] .evia-eyes{transform:translate(0,0)!important}
`;
  document.head.appendChild(s)
}
function app(){return document.querySelector(".evia-app.selfobs")}
function resetEviaStroke(){document.querySelectorAll(".evia-anchor[data-evia]").forEach(b=>b.style.removeProperty("--evia-stroke"))}
function applyLook(){
  const a=app();if(!a)return;
  LOOK_CLASSES.forEach(c=>a.classList.remove(c));
  if(lookState)a.classList.add(`evia-v70-look-${lookState}`)
}
function clearLook(){lookTimers.forEach(clearTimeout);lookTimers=[];lookState=null;applyLook()}
function setLook(state){lookState=state;applyLook()}
function startImmediateLook(){
  lookTimers.forEach(clearTimeout);lookTimers=[];
  setLook("milos");
  lookTimers.push(setTimeout(()=>setLook("tinos"),950));
  lookTimers.push(setTimeout(()=>setLook("symi"),1900));
  lookTimers.push(setTimeout(()=>setLook("center"),3000));
}
function fadeAssistantHandoff(){
  const a=app();if(!a)return;
  clearTimeout(handoffTimer);a.classList.add("evia-team-handoff");
  handoffTimer=setTimeout(()=>a.classList.remove("evia-team-handoff"),760)
}
document.addEventListener("pointerdown",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  const launch=t.closest("[data-evia-team-launch]");
  if(launch){
    if(launch.getAttribute("aria-expanded")==="true")clearLook();else startImmediateLook();
    return
  }
  if(t.closest("[data-evia-team]")){clearLook();fadeAssistantHandoff()}
},true);
document.addEventListener("click",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  if(t.closest(".evia-anchor[data-evia]")){
    clearTimeout(strokeTimer);strokeTimer=setTimeout(resetEviaStroke,980);
    if(app()?.classList.contains("evia-team-open"))clearLook()
  }
  if(t.closest("[data-team-page-back]"))clearLook()
},true);
const observer=new MutationObserver(()=>{applyLook()});
ensureStyles();observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("pageshow",()=>{resetEviaStroke();applyLook()});
})();
