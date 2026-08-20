(()=>{
"use strict";
const STYLE_ID="evia-v69-interaction-fixes-style";
let handoffTimer=null,strokeTimer=null;
function ensureStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement("style");s.id=STYLE_ID;s.textContent=`
.selfobs.evia-team-handoff .evia-team-choice{opacity:1!important;transform:translateY(0) scale(1)!important;transition:none!important}
`;
  document.head.appendChild(s)
}
function resetEviaStroke(){
  document.querySelectorAll(".evia-anchor[data-evia]").forEach(b=>b.style.removeProperty("--evia-stroke"))
}
function freezeAssistantHandoff(){
  const app=document.querySelector(".evia-app.selfobs");if(!app)return;
  clearTimeout(handoffTimer);app.classList.add("evia-team-handoff");
  handoffTimer=setTimeout(()=>app.classList.remove("evia-team-handoff"),850)
}
document.addEventListener("pointerdown",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  if(t.closest(".evia-anchor[data-evia]"))resetEviaStroke();
  if(t.closest("[data-evia-team]"))freezeAssistantHandoff()
},true);
document.addEventListener("click",e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  if(t.closest(".evia-anchor[data-evia]")){
    clearTimeout(strokeTimer);strokeTimer=setTimeout(resetEviaStroke,1040)
  }
},true);
const observer=new MutationObserver(()=>{
  const app=document.querySelector(".evia-app.selfobs");
  if(!app?.querySelector("[data-evia-team-page]"))app?.classList.remove("evia-team-handoff")
});
ensureStyles();observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("pageshow",resetEviaStroke);
})();
