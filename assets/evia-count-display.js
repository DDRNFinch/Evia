(()=>{
"use strict";
const STORE="evia-selfobs-live-v3";
function readEntries(){try{const x=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(x)?x:[]}catch{return[]}}
function mark(n){n=Math.max(0,Math.round(Number(n)||0));if(!n)return"";return n>5?`o x ${n}`:"o".repeat(n)}
function setText(el,n){if(!el)return;const text=mark(n);if(el.textContent!==text)el.textContent=text}
function count(entries,field,id){return entries.reduce((n,e)=>n+(e?.[field]===id?1:0),0)}
function patch(){
  const entries=readEntries();
  document.querySelectorAll("button[data-cat]").forEach(b=>setText(b.querySelector(".self-side b"),count(entries,"categoryId",b.dataset.cat)));
  document.querySelectorAll("button[data-job]").forEach(b=>setText(b.querySelector(".self-side b"),count(entries,"jobId",b.dataset.job)));
  document.querySelectorAll("button[data-opp]").forEach(b=>setText(b.querySelector(".self-side b"),count(entries,"opportunityId",b.dataset.opp)));
  document.querySelectorAll(".self-ksbs button[data-code]").forEach(b=>{
    const code=b.dataset.code,n=entries.reduce((total,e)=>total+(Array.isArray(e?.codes)&&e.codes.includes(code)?1:0),0);
    const span=Array.from(b.children).find(x=>x.tagName==="SPAN"&&!x.classList.contains("evia-rpl-o"));
    setText(span,n);
  });
  document.querySelectorAll(".self-card.group").forEach(card=>setText(card.querySelector("strong em"),card.querySelectorAll(".self-entry").length));
}
const observer=new MutationObserver(patch);
observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener("load",patch);
window.addEventListener("pageshow",patch);
document.addEventListener("click",()=>setTimeout(patch,0),true);
setTimeout(patch,250);
})();
