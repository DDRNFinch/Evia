(()=>{
"use strict";
const reduce=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.querySelector(".is-reduced-motion");
const panels=new WeakMap();
function restart(el,cls){
  if(!el||reduce())return;
  const old=panels.get(el);
  if(old)cancelAnimationFrame(old);
  el.classList.remove(cls);
  const id=requestAnimationFrame(()=>{
    requestAnimationFrame(()=>el.isConnected&&el.classList.add(cls));
  });
  panels.set(el,id);
}
function animateNode(node){
  if(!(node instanceof Element))return;
  if(node.matches(".self-panel,.view-panel,.selfobs-view"))restart(node,"evia-motion-enter");
  node.querySelectorAll?.(".self-panel,.view-panel,.selfobs-view").forEach(el=>restart(el,"evia-motion-enter"));
  if(node.matches(".evia-tools-screen,.evia-sign-card,.selfobs-help-card,.evia-target-layer .evia-tools-screen,.evia-rpl-layer > *"))restart(node,"evia-motion-layer-enter");
  node.querySelectorAll?.(".evia-tools-screen,.evia-sign-card,.selfobs-help-card,.evia-target-layer .evia-tools-screen,.evia-rpl-layer > *").forEach(el=>restart(el,"evia-motion-layer-enter"));
}
function start(){
  document.querySelectorAll(".self-panel,.view-panel,.selfobs-view").forEach(el=>restart(el,"evia-motion-enter"));
  const observer=new MutationObserver(records=>{
    const touched=new Set();
    for(const record of records){
      if(record.type!=="childList")continue;
      const host=record.target instanceof Element?record.target:null;
      const panel=host?.closest?.(".self-panel,.view-panel,.selfobs-view");
      if(panel)touched.add(panel);
      record.addedNodes.forEach(animateNode);
    }
    touched.forEach(el=>restart(el,"evia-motion-enter"));
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
