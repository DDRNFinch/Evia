(()=>{
"use strict";
const DURATION=920,HANDOFF=140;
let active=null;
function reduced(){return !!(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.querySelector(".is-reduced-motion"))}
function cleanup(proxy,dest,travel,destFade,proxyFade){
  try{travel?.cancel()}catch{}
  try{destFade?.cancel()}catch{}
  try{proxyFade?.cancel()}catch{}
  dest?.classList.remove("evia-avatar-motion-target","evia-avatar-motion-handoff");
  proxy?.remove();active=null
}
function clearActive(){
  if(!active)return;
  cleanup(active.proxy,active.dest,active.travel,active.destFade,active.proxyFade)
}
function makeProxy(button,rect){
  const proxy=button.cloneNode(true),face=button.querySelector(".evia-face"),stroke=face?getComputedStyle(face).borderTopWidth:"3px";
  proxy.removeAttribute("data-evia");proxy.setAttribute("aria-hidden","true");proxy.tabIndex=-1;proxy.classList.add("evia-motion-proxy");
  proxy.querySelectorAll("[id]").forEach(el=>el.removeAttribute("id"));
  proxy.style.setProperty("--evia-stroke",stroke);
  Object.assign(proxy.style,{position:"fixed",left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:"0",transform:"translate3d(0,0,0) scale(1)",transformOrigin:"0 0",opacity:"0",zIndex:"10000",pointerEvents:"none"});
  document.body.appendChild(proxy);return proxy
}
function handoff(proxy,dest,travel){
  if(!proxy?.isConnected||!dest?.isConnected)return cleanup(proxy,dest,travel);
  dest.classList.remove("evia-avatar-motion-target");
  dest.classList.add("evia-avatar-motion-handoff");
  const options={duration:HANDOFF,easing:"cubic-bezier(.22,1,.36,1)",fill:"forwards"};
  const destFade=dest.animate([{opacity:0},{opacity:1}],options);
  const proxyFade=proxy.animate([{opacity:1},{opacity:0}],options);
  active={proxy,dest,travel,destFade,proxyFade};
  Promise.allSettled([destFade.finished,proxyFade.finished]).then(()=>{
    if(active?.proxy!==proxy)return;
    cleanup(proxy,dest,travel,destFade,proxyFade)
  })
}
document.addEventListener("click",event=>{
  if(active||reduced())return;
  const button=event.target instanceof Element?event.target.closest(".evia-anchor[data-evia]"):null;
  if(!button||button.classList.contains("evia-motion-proxy"))return;
  const from=button.getBoundingClientRect();if(!from.width||!from.height)return;
  const proxy=makeProxy(button,from);
  requestAnimationFrame(()=>{
    /* v44 delays section-changing clicks for the page fade. The first user click therefore
       leaves the original anchor connected; the replayed click performs the real shell swap. */
    if(button.isConnected){proxy.remove();return}
    const dest=document.querySelector(".selfobs .evia-anchor[data-evia]");
    if(!dest){proxy.remove();return}
    const to=dest.getBoundingClientRect();if(!to.width||!to.height){proxy.remove();return}
    dest.classList.add("evia-avatar-motion-target");proxy.style.opacity="1";
    const dx=to.left-from.left,dy=to.top-from.top,sx=to.width/from.width,sy=to.height/from.height;
    const travel=proxy.animate([
      {transform:"translate3d(0,0,0) scale(1,1)"},
      {transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`}
    ],{duration:DURATION,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"});
    active={proxy,dest,travel,destFade:null,proxyFade:null};
    travel.finished.then(()=>handoff(proxy,dest,travel)).catch(()=>{
      if(active?.proxy===proxy)cleanup(proxy,dest,travel)
    })
  })
},true);
window.addEventListener("pagehide",clearActive);
})();
