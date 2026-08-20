(()=>{
"use strict";
const DURATION=920;
let active=null;
function reduced(){return !!(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||document.querySelector(".is-reduced-motion"))}
function stopStroke(token){if(!token)return;token.stopped=true;if(token.frame)cancelAnimationFrame(token.frame)}
function cleanup(proxy,dest,travel,strokeToken){
  stopStroke(strokeToken);
  try{travel?.cancel()}catch{}
  dest?.classList.remove("evia-avatar-motion-target","evia-avatar-motion-handoff");
  proxy?.remove();active=null
}
function clearActive(){
  if(!active)return;
  cleanup(active.proxy,active.dest,active.travel,active.strokeToken)
}
function strokePx(el,fallback=3){
  const n=parseFloat(el?getComputedStyle(el).borderTopWidth:"");
  return Number.isFinite(n)&&n>0?n:fallback
}
function makeProxy(button,rect){
  const proxy=button.cloneNode(true),face=button.querySelector(".evia-face"),stroke=strokePx(face,3);
  proxy.removeAttribute("data-evia");proxy.setAttribute("aria-hidden","true");proxy.tabIndex=-1;proxy.classList.add("evia-motion-proxy");
  proxy.querySelectorAll("[id]").forEach(el=>el.removeAttribute("id"));
  proxy.style.setProperty("--evia-stroke",`${stroke}px`);
  Object.assign(proxy.style,{position:"fixed",left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:"0",transform:"translate3d(0,0,0) scale(1)",transformOrigin:"0 0",opacity:"0",zIndex:"10000",pointerEvents:"none"});
  document.body.appendChild(proxy);return proxy
}
function renderedScale(proxy){
  try{
    const value=getComputedStyle(proxy).transform;
    if(!value||value==="none")return 1;
    if(typeof DOMMatrixReadOnly==="function"){
      const m=new DOMMatrixReadOnly(value),s=Math.hypot(m.a,m.b);
      if(Number.isFinite(s)&&s>0)return s
    }
    const match=value.match(/^matrix\(([^)]+)\)$/);
    if(match){const p=match[1].split(",").map(Number),s=Math.hypot(p[0],p[1]);if(Number.isFinite(s)&&s>0)return s}
  }catch{}
  return 1
}
function keepStrokeContinuous(proxy,startStroke,destStroke,endScale){
  const token={frame:0,stopped:false};
  const tick=()=>{
    if(token.stopped||!proxy.isConnected)return;
    const scale=renderedScale(proxy),den=endScale-1;
    const progress=Math.abs(den)<.0001?1:Math.max(0,Math.min(1,(scale-1)/den));
    const visibleStroke=startStroke+(destStroke-startStroke)*progress;
    proxy.style.setProperty("--evia-stroke",`${visibleStroke/Math.max(scale,.001)}px`);
    token.frame=requestAnimationFrame(tick)
  };
  token.frame=requestAnimationFrame(tick);return token
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
function handoff(proxy,dest,travel,strokeToken){
  if(!proxy?.isConnected||!dest?.isConnected)return cleanup(proxy,dest,travel,strokeToken);
  stopStroke(strokeToken);
  syncAnimationPhase(proxy,dest);
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
  const startStroke=strokePx(button.querySelector(".evia-face"),3),proxy=makeProxy(button,from);
  requestAnimationFrame(()=>{
    if(button.isConnected){proxy.remove();return}
    const dest=document.querySelector(".selfobs .evia-anchor[data-evia]");
    if(!dest){proxy.remove();return}
    const to=dest.getBoundingClientRect();if(!to.width||!to.height){proxy.remove();return}
    const destStroke=strokePx(dest.querySelector(".evia-face"),startStroke);
    dest.classList.add("evia-avatar-motion-target");proxy.style.opacity="1";
    const dx=to.left-from.left,dy=to.top-from.top,sx=to.width/from.width,sy=to.height/from.height,endScale=(sx+sy)/2;
    const travel=proxy.animate([
      {transform:"translate3d(0,0,0) scale(1,1)"},
      {transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`}
    ],{duration:DURATION,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"});
    const strokeToken=keepStrokeContinuous(proxy,startStroke,destStroke,endScale);
    active={proxy,dest,travel,strokeToken};
    travel.finished.then(()=>handoff(proxy,dest,travel,strokeToken)).catch(()=>{
      if(active?.proxy===proxy)cleanup(proxy,dest,travel,strokeToken)
    })
  })
},true);
window.addEventListener("pagehide",clearActive);
})();
