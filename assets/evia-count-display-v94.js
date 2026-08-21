(()=>{
"use strict";
const STORE="evia-selfobs-live-v3";let queued=false;
function readEntries(){try{const x=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(x)?x:[]}catch{return[]}}
function mark(n){n=Math.max(0,Math.round(Number(n)||0));if(!n)return"";return n>5?`o x ${n}`:"o".repeat(n)}
function setText(el,n){if(!el)return;const text=mark(n);if(el.textContent!==text)el.textContent=text}
function count(entries,field,id){return entries.reduce((n,e)=>n+(e?.[field]===id?1:0),0)}
function patch(){
  queued=false;const entries=readEntries();
  document.querySelectorAll("button[data-cat]").forEach(b=>setText(b.querySelector(".self-side b"),count(entries,"categoryId",b.dataset.cat)));
  document.querySelectorAll("button[data-job]").forEach(b=>setText(b.querySelector(".self-side b"),count(entries,"jobId",b.dataset.job)));
  document.querySelectorAll("button[data-opp]").forEach(b=>setText(b.querySelector(".self-side b"),count(entries,"opportunityId",b.dataset.opp)));
  document.querySelectorAll(".self-ksbs button[data-code]").forEach(b=>{const code=b.dataset.code,n=entries.reduce((total,e)=>total+(Array.isArray(e?.codes)&&e.codes.includes(code)?1:0),0),span=Array.from(b.children).find(x=>x.tagName==="SPAN"&&!x.classList.contains("evia-rpl-o"));setText(span,n)});
  document.querySelectorAll(".self-card.group").forEach(card=>setText(card.querySelector("strong em"),card.querySelectorAll(".self-entry").length))
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(patch)}
const COUNT_SELECTOR="button[data-cat],button[data-job],button[data-opp],.self-ksbs button[data-code],.self-card.group,.self-entry";
function relevant(records){return records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.(COUNT_SELECTOR)||node.querySelector?.(COUNT_SELECTOR))))}
function start(){
  patch();const root=document.getElementById("root")||document.body;if(root&&!root.__eviaCountV94Observer){root.__eviaCountV94Observer=true;new MutationObserver(records=>{if(relevant(records))queue()}).observe(root,{subtree:true,childList:true})}
}
window.addEventListener("load",start);window.addEventListener("pageshow",patch);window.addEventListener("storage",e=>{if(e.key===STORE)patch()});
document.addEventListener("click",event=>{if(event.target.closest?.(COUNT_SELECTOR))setTimeout(patch,0)},true);
if(document.readyState!=="loading")start();

/* Keep the fade transition on ordinary Evia navigation only. TOC, OTJ, ARP and
   the Targets launcher have their own document-level handlers and must receive
   the original physical click rather than a replayed synthetic click. */
const NAV_SELECTOR=[
  "button[data-cat]","button[data-job]","button[data-opp]","button[data-mode]","button[data-tab]","button[data-code]",
  "button[data-arch='KSB']","button[data-quick]","button[data-evia]",".option-row",".self-back",".self-evidence",
  ".evia-target-row",".evia-target-history-row","[data-view]","[data-nav]","[data-route]",
  "[data-action='back']","[data-action='next']","[data-action='save']","[data-action='submit']","[data-action='finish']",
  "[data-action='home']","[data-action='evidence']","[data-action='coverage']"
].join(",");
const SURFACE_SELECTOR=".self-panel,.view-panel,.selfobs-view,.evia-tools-screen,.evia-sign-card,.selfobs-help-card,.evia-target-layer,.evia-rpl-layer";
let replaying=false,transitioning=false;
function reducedMotion(){return !!(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.querySelector(".is-reduced-motion"))}
function surfaceFor(control){return control.closest?.(SURFACE_SELECTOR)||document.querySelector(SURFACE_SELECTOR)}
function fallbackSurface(){return document.querySelector(SURFACE_SELECTOR)}
document.addEventListener("click",event=>{
  if(replaying||transitioning||reducedMotion()||event.defaultPrevented)return;
  const control=event.target instanceof Element?event.target.closest(NAV_SELECTOR):null;if(!control||control.disabled||control.getAttribute?.("aria-disabled")==="true")return;
  if(control.matches?.("[data-evia-native-photo],[data-evia-native-video],[data-evia-native-gallery],[data-pick],[data-action='record'],[data-action='stop'],[data-action='download'],[data-install-update],[data-later]"))return;
  const surface=surfaceFor(control);if(!surface)return;
  event.preventDefault();event.stopImmediatePropagation();transitioning=true;surface.classList.remove("evia-nav-enter");surface.classList.add("evia-nav-leave");
  window.setTimeout(()=>{replaying=true;try{control.click()}finally{replaying=false}requestAnimationFrame(()=>requestAnimationFrame(()=>{const next=surface.isConnected?surface:fallbackSurface();if(next){next.classList.remove("evia-nav-leave");next.classList.remove("evia-nav-enter");void next.offsetWidth;next.classList.add("evia-nav-enter")}transitioning=false}))},125)
},true);
})();
