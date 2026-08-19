(()=>{
"use strict";
function current(){return window.EviaCourseContext?.current?.()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function close(){document.querySelector(".evia-course-epa-layer")?.remove()}
function open(){
  close();document.querySelector(".evia-tools-layer")?.remove();
  const c=current(),el=document.createElement("div");el.className="evia-tools-layer evia-course-epa-layer";
  el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-course-epa-back>‹ Back</button><b>EPA practice</b><span></span></div><div class="evia-tools-body"><p class="evia-tools-kicker">${esc(c?.pathwayTitle||"Carpentry & Joinery")}</p><h2>EPA practice</h2><p class="evia-tools-copy">This pathway is installed for course evidence. Its EPA practice will be configured separately so Evia does not show Bricklayer EPA content to a carpentry learner.</p><button class="evia-tools-primary" data-course-epa-close>Back home</button></div></section>`;
  document.body.appendChild(el);el.querySelector("[data-course-epa-back]").onclick=close;el.querySelector("[data-course-epa-close]").onclick=close
}
document.addEventListener("click",e=>{
  const b=e.target.closest?.('[data-arch="EPA"]'),c=current();if(!b||!c||c.epaConfigured!==false)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open()
},true);
})();