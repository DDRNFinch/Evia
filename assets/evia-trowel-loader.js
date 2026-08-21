(()=>{
"use strict";
const SOURCE="./assets/evia-trowel-data.js?v=31";
const TRANSFERABLE_UNITS=new Set([102,300,303,502]);
const STOP=new Set(["about","after","again","against","also","another","around","based","before","being","between","carry","could","doing","from","give","have","into","needed","other","relevant","same","should","show","that","their","these","they","this","through","using","what","when","where","which","with","work","working","your"]);
function words(value){
  return new Set(String(value||"").toLowerCase().replace(/[^a-z0-9]+/g," ").split(/\s+/).filter(w=>w.length>3&&!STOP.has(w)))
}
function description(code){return window.EviaTrowelACText?.describe?.(code)||window.EviaTrowelHandbook?.describe?.(code)||""}
function semanticScore(op,code,m,units){
  const unit=Number(m.codeUnit?.[code]),prompt=words(`${op.title||""} ${op.instruction||""} ${op.question||""}`),ac=words(description(code));
  let score=units.includes(unit)?8:TRANSFERABLE_UNITS.has(unit)?4:0;
  prompt.forEach(w=>{if(ac.has(w))score+=2});
  words(op.title||"").forEach(w=>{if(ac.has(w))score+=2});
  return score
}
function fillEmptyOpportunity(item,expected,m){
  if(item.o.codes.length)return;
  const themes=Array.isArray(item.o.themes)?item.o.themes:[];
  const candidates=expected.filter(code=>themes.includes(m.codeTheme?.[code]));
  if(!candidates.length)throw new Error(`No NVQ AC theme candidates for ${item.o.id||item.o.title}`);
  const ranked=candidates.map(code=>({code,score:semanticScore(item.o,code,m,item.units)})).sort((a,b)=>b.score-a.score||a.code.localeCompare(b.code,undefined,{numeric:true}));
  const best=ranked[0]?.score||0;
  let chosen=ranked.filter(x=>x.score>0&&x.score>=best-2).slice(0,12).map(x=>x.code);
  if(!chosen.length){
    const preferred=ranked.filter(x=>item.units.includes(Number(m.codeUnit?.[x.code]))||TRANSFERABLE_UNITS.has(Number(m.codeUnit?.[x.code]))).slice(0,8).map(x=>x.code);
    chosen=preferred.length?preferred:ranked.slice(0,4).map(x=>x.code)
  }
  item.o.codes=[...new Set(chosen)];
  item.o.holistic=true
}
function buildFrom(D,option){
  const m=window.EviaTrowelMeta;if(!m)throw new Error("Trowel qualification map is unavailable");
  const route=m.routeUnits?.[option]?option:"thin",allowed=new Set(m.routeUnits?.[route]||[]);
  function cat(x){
    return{id:x[0],title:x[1],jobs:x[2].map(j=>({
      id:j[0],title:j[1],_units:(j[2]||[]).filter(u=>allowed.has(u)),
      opps:(j[3]||[]).map(o=>({id:o[0],title:o[1],instruction:o[2],question:o[3],themes:o[4]||[],codes:[],bundle:x[1],...(o[5]==="talk"?{media:"talk"}:{})}))
    }))}
  }
  const optional=D.optional?.[route];if(!optional)throw new Error(`Missing Trowel optional route: ${route}`);
  const data=[...(D.common||[]),optional].map(cat),opps=[];
  data.forEach(c=>c.jobs.forEach(j=>j.opps.forEach(o=>opps.push({o,units:j._units}))));
  const expected=(m.routeUnits?.[route]||[]).flatMap(u=>m.unitCodes?.[String(u)]||[]).map(String);

  // Holistic first pass: one real work activity may support several relevant ACs across units.
  for(const item of opps){
    const seen=new Set();
    for(const code of expected){
      const theme=m.codeTheme?.[code],unit=Number(m.codeUnit?.[code]);
      if(!theme||!item.o.themes.includes(theme))continue;
      if(!item.units.includes(unit)&&!TRANSFERABLE_UNITS.has(unit))continue;
      if(!seen.has(code)){item.o.codes.push(code);seen.add(code)}
    }
  }

  // Every selectable area must map to at least one real AC. If the strict unit pass leaves
  // an area empty, use its P/T themes plus the handbook wording to select the closest
  // legitimate ACs from the learner's route. This keeps holistic evidence broad without
  // inventing criteria or leaving dead-end screens.
  for(const item of opps)fillEmptyOpportunity(item,expected,m);

  // Qualification fail-safe: every official AC must remain reachable somewhere in Evia.
  const mappedSet=new Set(opps.flatMap(x=>x.o.codes));
  for(const code of expected){
    if(mappedSet.has(code))continue;
    const theme=m.codeTheme?.[code],unit=Number(m.codeUnit?.[code]),candidates=opps.filter(x=>x.o.themes.includes(theme));
    const target=candidates.find(x=>x.units.includes(unit))||candidates.find(x=>TRANSFERABLE_UNITS.has(unit))||candidates[0];
    if(!target)throw new Error(`No Trowel evidence route for ${code} (${theme})`);
    target.o.codes.push(code);mappedSet.add(code)
  }

  const empty=opps.filter(x=>!Array.isArray(x.o.codes)||!x.o.codes.length);
  if(empty.length)throw new Error(`Trowel mapping contains ${empty.length} selectable areas with no ACs`);
  data.forEach(c=>c.jobs.forEach(j=>delete j._units));
  const mapped=data.flatMap(c=>c.jobs.flatMap(j=>j.opps.flatMap(o=>o.codes))),unique=new Set(mapped),unknown=[...unique].filter(code=>!expected.includes(code));
  if(unique.size!==expected.length||expected.some(code=>!unique.has(code))||unknown.length)throw new Error(`Trowel holistic AC mapping audit failed: ${unique.size}/${expected.length}`);
  return data
}
function parseSource(source){
  const start=source.indexOf("const D=");let end=source.indexOf("\nfunction build",start);if(end<0)end=source.indexOf("function build",start);
  if(start<0||end<0)throw new Error("Trowel source data could not be read");
  let raw=source.slice(start+8,end).trim();if(raw.endsWith(";"))raw=raw.slice(0,-1);
  return JSON.parse(raw)
}
function install(D){
  const api={build:option=>buildFrom(D,option)};
  for(const option of ["thin","repair","specialist","drainage"])api.build(option);
  window.EviaTrowelData=api;return api
}
function syncLoad(){
  const xhr=new XMLHttpRequest();xhr.open("GET",SOURCE,false);xhr.send(null);
  if(!((xhr.status>=200&&xhr.status<300)||xhr.status===0)||!xhr.responseText)throw new Error(`Trowel source ${xhr.status}`);
  return install(parseSource(xhr.responseText))
}
try{
  const api=syncLoad();window.EviaTrowelDataReady=Promise.resolve(api)
}catch(syncError){
  console.warn("Evia Trowel synchronous loader fallback",syncError);
  window.EviaTrowelDataReady=fetch(SOURCE,{cache:"no-store"}).then(response=>{if(!response.ok)throw new Error(`Trowel source ${response.status}`);return response.text()}).then(source=>install(parseSource(source))).catch(error=>{console.error("Evia Trowel loader",error);throw error})
}
})();
