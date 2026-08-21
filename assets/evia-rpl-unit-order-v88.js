(()=>{
"use strict";
const VERSION=88;
const RPL_KEY="evia-rpl-ksbs-v1";
function ctx(){const c=window.EviaCourseContext?.current?.();return c?.courseType==="nvq"?c:null}
function meta(){return window.EviaTrowelMeta||null}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function read(k,d){try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}
function rplSet(){const c=ctx(),allowed=new Set(c?.codes||[]),x=read(RPL_KEY,[]);return new Set((Array.isArray(x)?x:[]).filter(code=>allowed.has(code)))}
function save(set){write(RPL_KEY,[...set]);window.dispatchEvent(new Event("evia:rpl-changed"))}
function desc(code){return window.EviaTrowelACText?.describe?.(code)||meta()?.themeNames?.[meta()?.codeTheme?.[code]]||"Assessment criterion"}
function numeric(a,b){return String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:"base"})}
function units(){
  const c=ctx(),m=meta();if(!c||!m)return[];
  const configured=Array.isArray(c.units)&&c.units.length?c.units:[...new Set((c.codes||[]).map(code=>m.codeUnit?.[code]).filter(Boolean))];
  return configured.map(Number).filter(Boolean)
}
function codesFor(unit){
  const c=ctx(),m=meta();if(!c||!m)return[];
  const allowed=new Set(c.codes||[]);
  return (m.unitCodes?.[String(unit)]||[]).filter(code=>allowed.has(code)).slice().sort(numeric)
}
function unitTitle(unit){return meta()?.unitTitles?.[String(unit)]||`Unit ${unit}`}
function acLabel(code){const p=String(code).split(".");return p.length>=3?`AC ${p.slice(1).join(".")}`:`AC ${code}`}
function close(){document.querySelector(".evia-rpl-unit-layer")?.remove();document.querySelector(".evia-tools-layer.admin")?.classList.remove("evia-rpl-under")}
function layer(body,title,back=close){
  close();document.querySelector(".evia-rpl-course-layer")?.remove();
  const admin=[...document.querySelectorAll(".evia-tools-layer.admin")].find(el=>el.querySelector("[data-admin-rpl]"));admin?.classList.add("evia-rpl-under");
  const el=document.createElement("div");el.className="evia-tools-layer evia-rpl-course-layer evia-rpl-unit-layer";
  el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-rpl-unit-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;
  document.body.appendChild(el);el.querySelector("[data-rpl-unit-back]").onclick=back;return el
}
function updateSummary(root,set=rplSet()){
  if(!root)return;const currentUnit=Number(root.dataset.rplUnit||0),codes=currentUnit?codesFor(currentUnit):(ctx()?.codes||[]),done=codes.filter(code=>set.has(code)).length;
  const strong=root.querySelector("[data-rpl-summary-count]");if(strong)strong.textContent=String(done);
  const line=root.querySelector("[data-rpl-summary-line]");if(line)line.textContent=currentUnit?`of ${codes.length} ACs marked RPL in Unit ${currentUnit}`:`of ${codes.length} ACs marked RPL`;
}
function bindAcRows(el,unit){
  el.querySelectorAll("[data-rpl-unit-code]").forEach(btn=>btn.onclick=()=>{
    const set=rplSet(),code=btn.dataset.rplUnitCode;if(set.has(code))set.delete(code);else set.add(code);save(set);
    const on=set.has(code);btn.classList.toggle("on",on);const em=btn.querySelector("em");if(em)em.textContent=on?"RPL":"";updateSummary(el,set)
  })
}
function openUnit(unit){
  const r=rplSet(),codes=codesFor(unit);if(!codes.length)return openIndex();
  const rows=codes.map(code=>`<button type="button" class="evia-rpl-row evia-rpl-ac ${r.has(code)?"on":""}" data-rpl-unit-code="${esc(code)}"><span><b>${esc(acLabel(code))}</b><small>${esc(desc(code))}</small></span><em>${r.has(code)?"RPL":""}</em></button>`).join("");
  const el=layer(`<p class="evia-tools-kicker">Unit ${unit}</p><h2>${esc(unitTitle(unit))}</h2><p class="evia-tools-copy">Assessment criteria are shown in official numerical order. Tap an AC to mark or unmark it as recognised prior learning.</p><div class="evia-rpl-summary"><strong data-rpl-summary-count>${codes.filter(code=>r.has(code)).length}</strong><span data-rpl-summary-line>of ${codes.length} ACs marked RPL in Unit ${unit}</span></div><div class="evia-rpl-group">${rows}</div>`,`Unit ${unit}`,openIndex);
  el.dataset.rplUnit=String(unit);bindAcRows(el,unit)
}
function openIndex(){
  const c=ctx(),m=meta();if(!c||!m)return;const r=rplSet(),ordered=units(),all=c.codes||[];
  const rows=ordered.map(unit=>{const codes=codesFor(unit),done=codes.filter(code=>r.has(code)).length;return `<button type="button" class="evia-tools-row" data-rpl-unit="${unit}"><span><b>Unit ${unit}</b><small>${esc(unitTitle(unit))} · ${done?`${done} RPL · `:""}${codes.length} ACs</small></span><i>›</i></button>`}).join("");
  const el=layer(`<p class="evia-tools-kicker">Recognised prior learning</p><h2>RPL by unit</h2><p class="evia-tools-copy">Units are listed in qualification order. Open a unit to see every required AC in numerical order.</p><div class="evia-rpl-summary"><strong data-rpl-summary-count>${all.filter(code=>r.has(code)).length}</strong><span data-rpl-summary-line>of ${all.length} ACs marked RPL</span></div>${rows}`,"RPL");
  el.querySelectorAll("[data-rpl-unit]").forEach(btn=>btn.onclick=()=>openUnit(Number(btn.dataset.rplUnit)))
}
function intercept(e){
  const btn=e.target?.closest?.("[data-admin-rpl]");if(!btn||!ctx())return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openIndex()
}
window.addEventListener("click",intercept,true);
window.EviaRplUnitOrder=Object.freeze({version:VERSION,open:openIndex,units,codesFor});
})();
