(()=>{
"use strict";
const MARKER="evia-6570-no-empty-v91",COURSE_ID="6570-05";
function read(k,d){try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??d}catch{return d}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}
function audit(pack){
  const empty=[];
  (pack?.pathways||[]).forEach(path=>(path.siteData||[]).forEach(cat=>(cat.jobs||[]).forEach(job=>(job.opps||[]).forEach(op=>{
    if(!Array.isArray(op.codes)||!op.codes.length)empty.push(`${path.id}/${cat.id}/${job.id}/${op.id}`)
  }))));
  if(empty.length)throw Error(`NVQ remap still contains ${empty.length} selectable areas without ACs.`);
  return true
}
function run(){
  if(read(MARKER,null)?.done)return true;
  const packs=window.EviaCoursePacks,migration=window.Evia6570PackMigration;
  if(!packs?.get||!packs?.install||!migration?.build)return false;
  const current=packs.get(COURSE_ID);if(!current)return false;
  try{
    const next=migration.build();audit(next);packs.install(next);
    write(MARKER,{done:true,updatedAt:Date.now(),rule:"every-selectable-area-has-ac"});
    const timeline=read("evia-course-timeline",{});if(timeline?.courseId===COURSE_ID)setTimeout(()=>location.reload(),80);
    return true
  }catch(error){console.error("Evia 6570 v91 remap",error);write(MARKER,{done:false,failedAt:Date.now(),message:String(error?.message||error)});return false}
}
let tries=0;function attempt(){if(run()||++tries>20)return;setTimeout(attempt,120)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attempt);else attempt();
})();
