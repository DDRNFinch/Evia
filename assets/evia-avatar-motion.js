(()=>{
"use strict";
const DURATION=920;
const MENU_DELAY=140;
const MENU_IN=580;
const MENU_OUT=360;
const EASE="cubic-bezier(.22,1,.36,1)";
let active=null;

function reduced(){return !!(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.querySelector(".is-reduced-motion"))}
function appRoot(node){return node?.closest?.(".selfobs,.selfobs-app")||null}
function removeAnimation(animation){try{animation?.cancel()}catch{}}
function cleanup(entry){
  if(!entry)return;
  removeAnimation(entry.travel);
  removeAnimation(entry.menuEnter);
  removeAnimation(entry.menuExit);
  removeAnimation(entry.homeEnter);
  entry.dest?.classList.remove("evia-avatar-motion-target","evia-avatar-motion-handoff");
  entry.proxy?.remove();
  entry.menuProxy?.remove();
  if(active===entry)active=null
}
function clearActive(){cleanup(active)}
function strokePx(el,fallback=3){
  const n=parseFloat(el?getComputedStyle(el).borderTopWidth:"");
  return Number.isFinite(n)&&n>0?n:fallback
}
function makeAvatarProxy(button,rect){
  const proxy=button.cloneNode(true),face=button.querySelector(".evia-face"),stroke=strokePx(face,3);
  proxy.removeAttribute("data-evia");
  proxy.setAttribute("aria-hidden","true");
  proxy.tabIndex=-1;
  proxy.classList.add("evia-motion-proxy");
  proxy.querySelectorAll("[id]").forEach(el=>el.removeAttribute("id"));
  proxy.style.setProperty("--evia-stroke",`${stroke}px`);
  Object.assign(proxy.style,{position:"fixed",left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:"0",transform:"translate3d(0,0,0) scale(1)",transformOrigin:"0 0",opacity:"0",zIndex:"10000",pointerEvents:"none"});
  document.body.appendChild(proxy);
  return proxy
}
function makeMenuProxy(root){
  if(!root?.classList.contains("is-open"))return null;
  const shell=root.querySelector(".menu-shell");
  if(!shell)return null;
  const rect=shell.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  const proxy=shell.cloneNode(true);
  proxy.classList.add("evia-menu-motion-proxy");
  proxy.setAttribute("aria-hidden","true");
  proxy.querySelectorAll("button,input,textarea,select,a,[tabindex]").forEach(el=>{el.tabIndex=-1;el.setAttribute("aria-hidden","true")});
  Object.assign(proxy.style,{position:"fixed",left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:"0",opacity:"1",transform:"translate3d(0,0,0)",pointerEvents:"none",zIndex:"8"});
  document.body.appendChild(proxy);
  return proxy
}
function animateMenuExit(proxy){
  if(!proxy)return null;
  return proxy.animate([
    {opacity:1,transform:"translate3d(0,0,0)"},
    {opacity:0,transform:"translate3d(0,14px,0)"}
  ],{duration:MENU_OUT,delay:MENU_DELAY,easing:"ease",fill:"forwards"})
}
function animateMenuEnter(root){
  if(!root?.classList.contains("is-open"))return null;
  const shell=root.querySelector(".menu-shell");
  if(!shell)return null;
  return shell.animate([
    {opacity:0,transform:"translate3d(0,14px,0)"},
    {opacity:1,transform:"translate3d(0,0,0)"}
  ],{duration:MENU_IN,delay:MENU_DELAY,easing:EASE,fill:"both"})
}
function animateHomeEnter(root){
  if(!root||root.classList.contains("is-open"))return null;
  const invite=root.querySelector(".self-invite,.milos-home-copy");
  if(!invite)return null;
  return invite.animate([{opacity:0},{opacity:1}],{duration:360,delay:300,easing:"ease",fill:"both"})
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
function handoff(entry){
  const {proxy,dest,travel}=entry;
  if(!proxy?.isConnected||!dest?.isConnected)return cleanup(entry);
  syncAnimationPhase(proxy,dest);
  dest.classList.add("evia-avatar-motion-handoff");
  dest.classList.remove("evia-avatar-motion-target");
  void dest.offsetWidth;
  proxy.remove();
  entry.proxy=null;
  requestAnimationFrame(()=>requestAnimationFrame(()=>dest.isConnected&&dest.classList.remove("evia-avatar-motion-handoff")));
  Promise.allSettled([entry.menuEnter?.finished,entry.menuExit?.finished,entry.homeEnter?.finished].filter(Boolean)).finally(()=>{
    entry.menuProxy?.remove();
    if(active===entry)active=null
  })
}

document.addEventListener("click",event=>{
  if(active||reduced())return;
  const button=event.target instanceof Element?event.target.closest(".evia-anchor[data-evia]"):null;
  if(!button||button.classList.contains("evia-motion-proxy"))return;
  const from=button.getBoundingClientRect();
  if(!from.width||!from.height)return;
  const root=appRoot(button);
  const menuProxy=makeMenuProxy(root);
  const menuExit=animateMenuExit(menuProxy);
  const startStroke=strokePx(button.querySelector(".evia-face"),3);
  const proxy=makeAvatarProxy(button,from);
  const pending={proxy,dest:null,travel:null,menuProxy,menuExit,menuEnter:null,homeEnter:null};
  active=pending;
  requestAnimationFrame(()=>{
    if(button.isConnected){cleanup(pending);return}
    const dest=document.querySelector(".selfobs .evia-anchor[data-evia],.selfobs-app .evia-anchor[data-evia]");
    if(!dest){cleanup(pending);return}
    const to=dest.getBoundingClientRect();
    if(!to.width||!to.height){cleanup(pending);return}
    const destRoot=appRoot(dest);
    const dx=to.left-from.left,dy=to.top-from.top,sx=to.width/from.width,sy=to.height/from.height,endScale=(sx+sy)/2;
    dest.style.setProperty("--evia-stroke",`${startStroke*endScale}px`);
    dest.classList.add("evia-avatar-motion-target");
    proxy.style.opacity="1";
    pending.dest=dest;
    pending.menuEnter=animateMenuEnter(destRoot);
    pending.homeEnter=animateHomeEnter(destRoot);
    const travel=proxy.animate([
      {transform:"translate3d(0,0,0) scale(1,1)"},
      {transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`}
    ],{duration:DURATION,easing:EASE,fill:"forwards"});
    pending.travel=travel;
    travel.finished.then(()=>handoff(pending)).catch(()=>cleanup(pending))
  })
},true);

window.addEventListener("pagehide",clearActive);
})();