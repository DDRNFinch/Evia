(()=>{
"use strict";
const VERSION=94,OBS_KEY="evia-mini-milos-observed-v1";
let queued=false;
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}};
function ctx(){return window.EviaCourseContext?.current?.()||null}
function routeId(c=ctx()){
  if(!c||c.noCourse)return"";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="6570-05"){
    const p=String(c.pathway||"thin").toUpperCase();
    return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||"6570-05-THIN"
  }
  return""
}
function observedSet(){
  const c=ctx(),route=routeId(c),allowed=new Set(c?.codes||[]),map=read(OBS_KEY,{}),bucket=route&&map&&typeof map[route]==="object"?map[route]:{};
  return new Set(Object.keys(bucket||{}).map(x=>String(x).toUpperCase()).filter(code=>!allowed.size||allowed.has(code)))
}
function marker(){const s=document.createElement("span");s.className="evia-milos-arch-marker evia-milos-observed-marker";s.textContent="o";s.title="Observed as competent by assessor in Milos";s.setAttribute("aria-label","Observed by assessor in Milos");return s}
function hasMarker(el){return !!el?.querySelector?.(":scope > .evia-milos-arch-marker,:scope > .evia-milos-observed-marker")}
function append(el){if(!el||hasMarker(el))return;el.appendChild(marker())}
function normalCode(value){const t=String(value||"").trim().toUpperCase();const m=t.match(/^(?:AC\s*)?([KSB]?\d+(?:\.\d+){0,3}[A-Z]?)/);return m?m[1]:""}
function decorateCodeRows(set,root=document){
  const rows=[];
  if(root.nodeType===1&&root.matches?.("[data-code]"))rows.push(root);
  root.querySelectorAll?.("[data-code]").forEach(row=>rows.push(row));
  rows.forEach(row=>{const code=normalCode(row.dataset.code);if(set.has(code))append(row)})
}
function decorateKsbRows(set,root=document){
  const selector=".self-ksbs button,.self-ksbs article,.self-ksbs li";
  const rows=[];if(root.nodeType===1&&root.matches?.(selector))rows.push(root);root.querySelectorAll?.(selector).forEach(row=>rows.push(row));
  rows.forEach(row=>{const text=(row.querySelector("strong,b")?.textContent||row.textContent||"").trim();const code=normalCode(text);if(set.has(code))append(row)})
}
function decorateNvqRows(set,root=document){
  const selector=".evia-acb-ac";const rows=[];if(root.nodeType===1&&root.matches?.(selector))rows.push(root);root.querySelectorAll?.(selector).forEach(row=>rows.push(row));
  rows.forEach(row=>{const text=(row.querySelector("b")?.textContent||row.textContent||"");const match=text.match(/\bAC\s*(\d+(?:\.\d+){1,3})\b/i);if(match&&set.has(match[1].toUpperCase()))append(row)})
}
function decorateGenericRows(set,root=document){
  const selector=".evia-tools-screen .evia-tools-row";const rows=[];if(root.nodeType===1&&root.matches?.(selector))rows.push(root);root.querySelectorAll?.(selector).forEach(row=>rows.push(row));
  rows.forEach(row=>{const text=(row.querySelector("b,strong")?.textContent||"").trim();const m=text.match(/^(?:AC\s*)?([KSB]?\d+(?:\.\d+){0,3}[A-Z]?)(?:\b|\s|·|:)/i);if(m&&set.has(m[1].toUpperCase()))append(row)})
}
function clearHome(){
  document.querySelectorAll('.progress-arch .evia-milos-arch-marker,.progress-arch .evia-milos-observed-marker,[data-arch="AC"] .evia-milos-arch-badge,[data-arch="KSB"] .evia-milos-arch-badge').forEach(x=>x.remove())
}
function summary(set){
  document.querySelectorAll(".evia-acb-layer,.evia-nvq-layer").forEach(layer=>{
    let line=layer.querySelector(".evia-milos-observed-summary-v94");
    if(!set.size){line?.remove();return}
    if(!line){line=document.createElement("p");line.className="evia-milos-observed-summary-v94";const anchor=layer.querySelector(".evia-acb-overall,.evia-nvq-overall,.evia-tools-copy");anchor?.insertAdjacentElement("afterend",line)}
    if(line)line.innerHTML=`<span class="evia-milos-arch-marker evia-milos-observed-marker">o</span>${set.size} assessor-observed ${ctx()?.coverageLabel||"course"} ${set.size===1?"item":"items"} returned from Milos`
  })
}
function patch(root=document){
  queued=false;clearHome();const set=observedSet();if(!set.size){summary(set);return}
  decorateCodeRows(set,root);decorateKsbRows(set,root);decorateNvqRows(set,root);decorateGenericRows(set,root);summary(set)
}
function queue(root=document){if(queued)return;queued=true;requestAnimationFrame(()=>patch(root&&root.isConnected?root:document))}
function relevant(node){return node?.nodeType===1&&(node.matches?.(".self-ksbs,[data-code],.evia-acb-layer,.evia-acb-ac,.evia-nvq-layer,.evia-tools-screen,.evia-tools-row,.progress-arch")||node.querySelector?.(".self-ksbs,[data-code],.evia-acb-layer,.evia-acb-ac,.evia-nvq-layer,.evia-tools-screen,.evia-tools-row,.progress-arch"))}
function hookObservedStorage(){
  if(window.__eviaMilosObservedStorageHookV94)return;window.__eviaMilosObservedStorageHookV94=true;
  const native=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){const result=native.call(this,key,value);if(this===localStorage&&String(key)===OBS_KEY)window.dispatchEvent(new CustomEvent("evia:milos-observed-changed"));return result}
}
function start(){
  hookObservedStorage();patch(document);
  const root=document.getElementById("root")||document.body;
  if(root&&!root.__eviaMilosObservedV94Observer){root.__eviaMilosObservedV94Observer=true;new MutationObserver(records=>{for(const record of records){for(const node of record.addedNodes){if(relevant(node)){queue(node);return}}}}).observe(root,{childList:true,subtree:true})}
}
window.addEventListener("load",start);window.addEventListener("pageshow",()=>patch(document));window.addEventListener("evia:milos-observed-changed",()=>patch(document));window.addEventListener("storage",e=>{if(e.key===OBS_KEY)patch(document)});
if(document.readyState!=="loading")start();else document.addEventListener("DOMContentLoaded",start,{once:true});
const style=document.createElement("style");style.id="evia-milos-observed-v94-style";style.textContent=`.evia-milos-arch-marker{display:inline-grid!important;place-items:center!important;width:.86rem!important;height:.86rem!important;min-width:.86rem!important;border:1.5px solid #367fd0!important;border-radius:50%!important;color:#367fd0!important;font:700 .56rem/1 system-ui!important;margin-left:.34rem!important;vertical-align:middle!important;background:rgba(255,255,255,.9)!important}.evia-milos-observed-summary-v94{display:flex;align-items:center;gap:.45rem;margin:.55rem 0 .85rem;color:#3975b8;font-size:.78rem;line-height:1.35}`;document.head.appendChild(style);
window.EviaMilosObservedArch=Object.freeze({version:VERSION,observed:()=>[...observedSet()],refresh:()=>patch(document)});
})();
