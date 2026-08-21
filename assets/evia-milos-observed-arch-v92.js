(()=>{
"use strict";
const VERSION=93,OBS_KEY="evia-mini-milos-observed-v1";
function read(k,d){try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}}
function ctx(){return window.EviaCourseContext?.current?.()||null}
function routeId(c=ctx()){
  if(!c||c.noCourse)return"";
  if(c.courseId==="st0095-v1-2")return"ST0095";
  if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";
  if(c.courseId==="6570-05"){
    const p=String(c.pathway||"thin").toUpperCase();
    return({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||"";
  }
  return"";
}
function observed(){
  const c=ctx(),route=routeId(c),map=read(OBS_KEY,{}),source=route&&map[route]&&typeof map[route]==="object"?map[route]:{};
  const allowed=new Set((c?.codes||[]).map(code=>String(code).toUpperCase()));
  const out=new Set();
  Object.keys(source).forEach(code=>{const value=String(code).toUpperCase();if(!allowed.size||allowed.has(value))out.add(value)});
  return out;
}
function style(){
  if(document.getElementById("evia-milos-observed-arch-v92-style"))return;
  const s=document.createElement("style");s.id="evia-milos-observed-arch-v92-style";s.textContent=`
.evia-milos-arch-marker{display:inline-grid!important;place-items:center!important;width:.86rem!important;height:.86rem!important;min-width:.86rem!important;border:1.5px solid #377fd0!important;border-radius:50%!important;color:#377fd0!important;background:rgba(255,255,255,.92)!important;font:700 .58rem/1 system-ui!important;margin-left:.35rem!important;vertical-align:middle!important;box-sizing:border-box!important}
.evia-milos-ac-summary{display:block!important;margin-top:.3rem!important;color:#377fd0!important;font-size:.72rem!important;font-weight:700!important}
.evia-acb-status .evia-milos-arch-marker{margin-left:.25rem!important}
`;
  document.head.appendChild(s);
}
function marker(){const o=document.createElement("span");o.className="evia-milos-arch-marker";o.textContent="o";o.title="Observed as competent by assessor in Milos";o.setAttribute("aria-label","Observed as competent by assessor in Milos");return o}
function hasMarker(el){return !!el?.querySelector?.(":scope > .evia-milos-arch-marker,:scope > .evia-milos-observed-marker")}
function codeFromElement(el){
  const direct=String(el?.dataset?.code||"").trim().toUpperCase();if(direct)return direct;
  const own=Array.from(el?.childNodes||[]).filter(n=>n.nodeType===3).map(n=>n.textContent).join(" ").trim();
  const m=own.match(/^(K\d+|S\d+|B\d+|AC\d+(?:\.\d+)?)(?:\b|\s|·|:)/i);return m?m[1].toUpperCase():"";
}
function clearHomeArchBadges(){
  document.querySelectorAll('.progress-arch[data-arch="KSB"] .evia-milos-arch-observed,.progress-arch[data-arch="AC"] .evia-milos-arch-observed').forEach(el=>el.remove())
}
function patchCodeRows(set){
  document.querySelectorAll("[data-code]").forEach(el=>{const code=codeFromElement(el);if(!code||!set.has(code)||hasMarker(el))return;el.appendChild(marker())});
  document.querySelectorAll(".self-ksbs button,.self-ksbs article,.self-ksbs li").forEach(el=>{const code=codeFromElement(el);if(!code||!set.has(code)||hasMarker(el))return;el.appendChild(marker())});
}
function acCode(article){
  const label=article.querySelector(".evia-acb-ac-head b")?.textContent||"";
  const m=label.match(/Unit\s+(\d+)\s*[·-]\s*AC\s+([0-9.]+)/i);return m?`${m[1]}.${m[2]}`.toUpperCase():"";
}
function patchAcRows(set){
  document.querySelectorAll(".evia-acb-ac").forEach(article=>{
    const code=acCode(article);if(!code||!set.has(code))return;
    article.classList.add("milos-observed");
    const target=article.querySelector(".evia-acb-status")||article.querySelector(".evia-acb-ac-head");
    if(target&&!target.querySelector(".evia-milos-arch-marker,.evia-milos-observed-marker"))target.appendChild(marker());
  });
  const overall=document.querySelector(".evia-nvq-ac-browser-layer .evia-nvq-overall");
  if(overall){let note=overall.querySelector(".evia-milos-ac-summary");if(!note){note=document.createElement("small");note.className="evia-milos-ac-summary";overall.appendChild(note)}note.textContent=`${set.size} assessor-observed AC${set.size===1?"":"s"} returned from Milos`;}
}
function patchGenericText(set){
  const selector=".self-ksbs button,.self-ksbs li,.self-ksbs article,.evia-tools-screen button,.evia-tools-screen article";
  document.querySelectorAll(selector).forEach(el=>{
    if(hasMarker(el))return;
    const text=(el.textContent||"").trim();const m=text.match(/^(K\d+|S\d+|B\d+)\b/i);if(m&&set.has(m[1].toUpperCase()))el.appendChild(marker());
  });
}
function patch(){style();clearHomeArchBadges();const set=observed();if(!set.size)return;patchCodeRows(set);patchAcRows(set);patchGenericText(set)}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;patch()})}
new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener("load",patch);window.addEventListener("pageshow",patch);document.addEventListener("click",()=>setTimeout(patch,40),true);
setInterval(patch,900);setTimeout(patch,120);
window.EviaMilosObservedArch=Object.freeze({version:VERSION,refresh:patch,observedCodes:()=>[...observed()]});
})();
