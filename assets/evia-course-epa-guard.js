(()=>{
"use strict";
const BACKDROP_CLASS="naxos-section-backdrop";
function eligible(){try{const c=window.EviaCourseContext?.current?.();return !!c&&c.epaConfigured!==false&&String(c.courseType||"apprenticeship")!=="nvq"}catch{return false}}
function ensureStyles(){
  if(document.getElementById("naxos-section-shell-style"))return;
  const s=document.createElement("style");
  s.id="naxos-section-shell-style";
  s.textContent=`.${BACKDROP_CLASS}{position:fixed;inset:0;z-index:100005;background:linear-gradient(180deg,#fcfcfd 0%,#f8f8fb 72%,#f1f2f8 100%);opacity:1;pointer-events:auto;transition:opacity .42s ease}.evia-course-epa-layer{z-index:100010!important}`;
  document.head.appendChild(s)
}
function showBackdrop(){
  ensureStyles();
  let b=document.querySelector(`.${BACKDROP_CLASS}`);
  if(!b){b=document.createElement("div");b.className=BACKDROP_CLASS;b.setAttribute("aria-hidden","true");document.body.appendChild(b)}
  b.style.opacity="1";
}
function hideBackdrop(delay=0){
  window.setTimeout(()=>{
    const b=document.querySelector(`.${BACKDROP_CLASS}`);if(!b)return;
    b.style.opacity="0";
    window.setTimeout(()=>b.remove(),450)
  },delay)
}
function openNaxos(){
  const n=window.NaxosDemoEPA;
  if(!n?.enter){hideBackdrop();console.error("Naxos EPA modules were not available");return}
  n.enter()
}
window.addEventListener("click",e=>{
  const b=e.target.closest?.('[data-arch="EPA"]');
  if(!b||!eligible())return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
  showBackdrop();
  openNaxos();
},true);
const observer=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    for(const node of mutation.addedNodes){
      if(node?.nodeType!==1)continue;
      if(node.matches?.(".naxos-section-transition.to-evia")||node.querySelector?.(".naxos-section-transition.to-evia")){
        hideBackdrop(1940);
        return
      }
    }
  }
});
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("load",()=>window.NaxosDemoEPA?.patchArch?.());
window.EviaNaxosLoader={loading:false,open:openNaxos};
})();
