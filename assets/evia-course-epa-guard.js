(()=>{
"use strict";
let pending=false,loading=true;
function eligible(){try{const c=window.EviaCourseContext?.current?.();return !!c&&c.epaConfigured!==false&&String(c.courseType||"apprenticeship")!=="nvq"}catch{return false}}
window.addEventListener("click",e=>{
  const b=e.target.closest?.('[data-arch="EPA"]');
  if(!b||!eligible())return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
  if(window.NaxosDemoEPA?.enter)window.NaxosDemoEPA.enter();else pending=true;
},true);
const files=["naxos-epa-data.js","naxos-epa-core.js","naxos-epa-practical.js","naxos-epa-interview.js"];
function load(i){
  if(i>=files.length){loading=false;if(pending&&window.NaxosDemoEPA?.enter){pending=false;window.NaxosDemoEPA.enter()}return}
  const s=document.createElement("script");s.src=`/Evia/assets/${files[i]}?v=50`;s.defer=true;
  s.onload=()=>load(i+1);
  s.onerror=()=>{loading=false;pending=false;console.error(`Naxos EPA could not load ${files[i]}`)};
  document.head.appendChild(s)
}
load(0);
window.EviaNaxosLoader={get loading(){return loading}};
})();
