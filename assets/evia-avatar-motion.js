(()=>{
"use strict";
const DURATION=920;
let active=null;
function reduced(){return !!(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.querySelector(".is-reduced-motion"))}
function clearActive(){
  if(!active)return;
  try{active.animation?.cancel()}catch{}
  active.dest?.classList.remove("evia-avatar-motion-target");
  active.proxy?.remove();active=null
}
function makeProxy(button,rect){
  const proxy=button.cloneNode(true),face=button.querySelector(".evia-face"),stroke=face?getComputedStyle(face).borderTopWidth:"3px";
  proxy.removeAttribute("data-evia");proxy.setAttribute("aria-hidden","true");proxy.tabIndex=-1;proxy.classList.add("evia-motion-proxy");
  proxy.querySelectorAll("[id]").forEach(el=>el.removeAttribute("id"));
  proxy.style.setProperty("--evia-stroke",stroke);
  Object.assign(proxy.style,{position:"fixed",left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:"0",transform:"translate3d(0,0,0) scale(1)",transformOrigin:"0 0",opacity:"0",zIndex:"10000",pointerEvents:"none"});
  document.body.appendChild(proxy);return proxy
}
function finish(proxy,dest){
  dest?.classList.remove("evia-avatar-motion-target");
  proxy?.remove();active=null
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
    const animation=proxy.animate([
      {transform:"translate3d(0,0,0) scale(1,1)"},
      {transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`}
    ],{duration:DURATION,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"});
    active={proxy,dest,animation};
    animation.addEventListener("finish",()=>finish(proxy,dest),{once:true});
    animation.addEventListener("cancel",()=>finish(proxy,dest),{once:true})
  })
},true);
window.addEventListener("pagehide",clearActive);
})();
