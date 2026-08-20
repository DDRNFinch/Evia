(()=>{
"use strict";
const DURATION=920;
let active=null;
function reduced(){return !!(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.querySelector(".is-reduced-motion"))}
function cleanup(proxy,dest,travel){
  try{travel?.cancel()}catch{}
  dest?.classList.remove("evia-avatar-motion-target","evia-avatar-motion-handoff");
  proxy?.remove();active=null
}
function clearActive(){
  if(!active)return;
  cleanup(active.proxy,active.dest,active.travel)
}
function makeProxy(button,rect){
  const proxy=button.cloneNode(true),face=button.querySelector(".evia-face"),stroke=face?getComputedStyle(face).borderTopWidth:"3px";
  proxy.removeAttribute("data-evia");proxy.setAttribute("aria-hidden","true");proxy.tabIndex=-1;proxy.classList.add("evia-motion-proxy");
  proxy.querySelectorAll("[id]").forEach(el=>el.removeAttribute("id"));
  proxy.style.setProperty("--evia-stroke",stroke);
  Object.assign(proxy.style,{position:"fixed",left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:"0",transform:"translate3d(0,0,0) scale(1)",transformOrigin:"0 0",opacity:"0",zIndex:"10000",pointerEvents:"none"});
  document.body.appendChild(proxy);return proxy
}
function syncAnimationPhase(proxy,dest){
  const selectors=[".evia-float",".evia-halo",".evia-eye"];
  for(const selector of selectors){
    const from=[...proxy.querySelectorAll(selector)],to=[...dest.querySelectorAll(selector)];
    for(let i=0;i<Math.min(from.length,to.length);i++){
      const a=from[i].getAnimations?.()||[],b=to[i].getAnimations?.()||[];
      for(let j=0;j<Math.min(a.length,b.length);j++){
        const t=a[j].currentTime;
        if(typeof t==="number"&&Number.isFinite(t))try{b[j].currentTime=t}catch{}
      }
    }
  }
}
function handoff(proxy,dest,travel){
  if(!proxy?.isConnected||!dest?.isConnected)return cleanup(proxy,dest,travel);
  syncAnimationPhase(proxy,dest);
  /* Keep the real avatar fully opaque before the travelling copy is removed.
     This prevents Evia's normal 0.6s anchor opacity transition from flashing at touchdown. */
  dest.classList.add("evia-avatar-motion-handoff");
  dest.classList.remove("evia-avatar-motion-target");
  void dest.offsetWidth;
  proxy.remove();active=null;
  requestAnimationFrame(()=>requestAnimationFrame(()=>dest.isConnected&&dest.classList.remove("evia-avatar-motion-handoff")))
}
document.addEventListener("click",event=>{
  if(active||reduced())return;
  const button=event.target instanceof Element?event.target.closest(".evia-anchor[data-evia]"):null;
  if(!button||button.classList.contains("evia-motion-proxy"))return;
  const from=button.getBoundingClientRect();if(!from.width||!from.height)return;
  const proxy=makeProxy(button,from);
  requestAnimationFrame(()=>{
    /* Page navigation replays this click after its short fade-out. Animate only after
       that replay has replaced the original Evia anchor with the destination anchor. */
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
    active={proxy,dest,travel};
    travel.finished.then(()=>handoff(proxy,dest,travel)).catch(()=>{
      if(active?.proxy===proxy)cleanup(proxy,dest,travel)
    })
  })
},true);
window.addEventListener("pagehide",clearActive);
})();
