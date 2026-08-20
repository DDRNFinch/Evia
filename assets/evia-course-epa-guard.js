(()=>{
"use strict";
const LANDING_CLASS="naxos-blank-landing";
let active=false;

function eligible(){
  try{
    const c=window.EviaCourseContext?.current?.();
    return !!c&&c.epaConfigured!==false&&String(c.courseType||"apprenticeship")!=="nvq"
  }catch{return false}
}

function ensureStyles(){
  if(document.getElementById("naxos-blank-epa-style"))return;
  const s=document.createElement("style");
  s.id="naxos-blank-epa-style";
  s.textContent=`
.selfobs.is-naxos-landing .self-top,
.selfobs.is-naxos-landing .self-evidence,
.selfobs.is-naxos-landing .evia-anchor,
.selfobs.is-naxos-landing .self-invite{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
.selfobs.is-naxos-landing .self-panel{visibility:hidden!important;pointer-events:none!important}
.selfobs.is-naxos-landing .menu-stage{display:flex!important;align-items:center!important;justify-content:center!important;padding-top:0!important;overflow:hidden!important}
.${LANDING_CLASS}{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.35rem;text-align:center;pointer-events:none;animation:naxos-blank-in .4s cubic-bezier(.22,1,.36,1)}
.naxos-blank-title{font-size:clamp(1rem,4vw,1.18rem);font-weight:430;letter-spacing:-.025em;color:#30345e}
.naxos-landing-avatar{position:relative;display:grid;width:6rem;height:6rem;place-items:center}
.naxos-avatar-float{position:relative;display:grid;width:100%;height:100%;place-items:center;animation:naxos-blank-float 5.6s ease-in-out infinite}
.naxos-avatar-halo{position:absolute;inset:-34%;border-radius:50%;background:radial-gradient(circle,rgba(48,52,94,.24) 0%,rgba(48,52,94,.075) 43%,transparent 72%);filter:blur(18px);animation:naxos-blank-halo 4.4s ease-in-out infinite}
.naxos-avatar-face{position:relative;display:grid;width:78%;height:78%;place-items:center;border:2.6px solid #30345e;border-radius:50%;background:rgba(255,255,255,.14);filter:drop-shadow(0 8px 14px rgba(32,35,63,.08))}
.naxos-avatar-eyes{display:flex;width:100%;align-items:center;justify-content:center;gap:20%}
.naxos-avatar-eye{width:21%;aspect-ratio:1;border:2.6px solid #30345e;border-radius:50%;transform-origin:center;animation:naxos-blank-blink 7.6s ease-in-out infinite}
.naxos-avatar-eye.right{animation-delay:38ms}
@keyframes naxos-blank-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes naxos-blank-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes naxos-blank-halo{0%,100%{opacity:.72;transform:scale(.98)}50%{opacity:1;transform:scale(1.035)}}
@keyframes naxos-blank-blink{0%,44%,48%,100%{transform:scaleY(1)}46%{transform:scaleY(.08)}}
@media(max-width:360px){.naxos-landing-avatar{width:5.55rem;height:5.55rem}.naxos-avatar-face,.naxos-avatar-eye{border-width:2.4px}}
@media(prefers-reduced-motion:reduce){.${LANDING_CLASS},.naxos-avatar-float,.naxos-avatar-halo,.naxos-avatar-eye{animation:none!important}}
`;
  document.head.appendChild(s)
}

function buildLanding(){
  const app=document.querySelector(".selfobs");
  const stage=app?.querySelector(".menu-stage");
  if(!app||!stage)return false;
  ensureStyles();
  app.classList.add("is-naxos-landing");
  let landing=stage.querySelector(`.${LANDING_CLASS}`);
  if(!landing){
    landing=document.createElement("section");
    landing.className=LANDING_CLASS;
    landing.setAttribute("aria-label","The Naxos EPA assistant");
    landing.innerHTML='<div class="naxos-blank-title">The Naxos EPA assistant</div><div class="naxos-landing-avatar" aria-hidden="true"><span class="naxos-avatar-float"><span class="naxos-avatar-halo"></span><span class="naxos-avatar-face"><span class="naxos-avatar-eyes"><span class="naxos-avatar-eye"></span><span class="naxos-avatar-eye right"></span></span></span></span></div>';
    stage.appendChild(landing)
  }
  return true
}

function enter(){
  if(!eligible())return;
  active=true;
  buildLanding()
}

function exit(){
  active=false;
  document.querySelectorAll(`.${LANDING_CLASS}`).forEach(x=>x.remove());
  document.querySelectorAll(".selfobs.is-naxos-landing").forEach(x=>x.classList.remove("is-naxos-landing"))
}

document.addEventListener("click",e=>{
  const b=e.target instanceof Element?e.target.closest("[data-arch]"):null;
  if(!b)return;
  if(String(b.dataset.arch||"").toUpperCase()==="EPA"&&eligible()){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    enter();
    return
  }
  if(active)exit()
},true);

const observer=new MutationObserver(()=>{
  if(active&&!document.querySelector(`.${LANDING_CLASS}`))requestAnimationFrame(buildLanding)
});
const root=document.getElementById("root");
if(root)observer.observe(root,{childList:true,subtree:true});
else window.addEventListener("DOMContentLoaded",()=>{
  const r=document.getElementById("root");
  if(r)observer.observe(r,{childList:true,subtree:true})
},{once:true});

window.EviaNaxosLanding={enter,exit,isActive:()=>active};
})();
