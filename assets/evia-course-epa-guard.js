(()=>{
"use strict";
const BACKDROP_CLASS="naxos-section-backdrop";
const AVATAR_CLASS="naxos-avatar-anchor";
function eligible(){try{const c=window.EviaCourseContext?.current?.();return !!c&&c.epaConfigured!==false&&String(c.courseType||"apprenticeship")!=="nvq"}catch{return false}}
function ensureStyles(){
  if(document.getElementById("naxos-section-shell-style"))return;
  const s=document.createElement("style");
  s.id="naxos-section-shell-style";
  s.textContent=`
.${BACKDROP_CLASS}{position:fixed;inset:0;z-index:2147481000;background:linear-gradient(180deg,#fcfcfd 0%,#f8f8fb 72%,#f1f2f8 100%);opacity:1;pointer-events:auto;transition:opacity .42s ease}
.evia-course-epa-layer{position:fixed!important;inset:0!important;z-index:2147482000!important;overflow:hidden!important;background:linear-gradient(180deg,#fcfcfd 0%,#f8f8fb 62%,#f0f1f7 100%)!important}
.evia-course-epa-layer .evia-tools-screen{height:100%;min-height:100%;overflow:hidden;background:transparent!important}
.evia-course-epa-layer .evia-tools-body{height:calc(100% - 3.2rem);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-top:6.95rem!important;animation:naxos-page-in .2s cubic-bezier(.22,1,.36,1)}
.${AVATAR_CLASS}{position:fixed;z-index:2147482500;top:calc(env(safe-area-inset-top,0px) + 3.35rem);left:50%;width:6rem;height:6rem;opacity:0;pointer-events:none;transform:translate(-50%,8px) scale(.965);transition:opacity .46s ease,transform .62s cubic-bezier(.22,1,.36,1)}
.${AVATAR_CLASS}.is-visible{opacity:1;transform:translate(-50%,0) scale(1)}
.naxos-avatar-float{position:relative;display:grid;width:100%;height:100%;place-items:center;animation:naxos-float 5.6s ease-in-out infinite}
.naxos-avatar-halo{position:absolute;inset:-34%;border-radius:50%;background:radial-gradient(circle,rgba(48,52,94,.24) 0%,rgba(48,52,94,.075) 43%,transparent 72%);filter:blur(18px);animation:naxos-halo 4.4s ease-in-out infinite}
.naxos-avatar-face{position:relative;display:grid;width:78%;height:78%;place-items:center;border:2.6px solid #30345e;border-radius:50%;background:rgba(255,255,255,.14);filter:drop-shadow(0 8px 14px rgba(32,35,63,.08))}
.naxos-avatar-eyes{display:flex;width:100%;align-items:center;justify-content:center;gap:20%}
.naxos-avatar-eye{width:21%;aspect-ratio:1;border:2.6px solid #30345e;border-radius:50%;transform-origin:center;animation:naxos-blink 7.6s ease-in-out infinite}
.naxos-avatar-eye.right{animation-delay:38ms}
@keyframes naxos-page-in{from{opacity:.78;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
@keyframes naxos-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes naxos-halo{0%,100%{opacity:.72;transform:scale(.98)}50%{opacity:1;transform:scale(1.035)}}
@keyframes naxos-blink{0%,44%,48%,100%{transform:scaleY(1)}46%{transform:scaleY(.08)}}
@media(max-width:360px){.${AVATAR_CLASS}{width:5.55rem;height:5.55rem;top:calc(env(safe-area-inset-top,0px) + 3.45rem)}.evia-course-epa-layer .evia-tools-body{padding-top:6.45rem!important}.naxos-avatar-face,.naxos-avatar-eye{border-width:2.4px}}
`;
  document.head.appendChild(s)
}
function installPersistentLayer(){
  const n=window.NaxosDemoEPA;
  if(!n||window.__naxosPersistentLayer)return;
  window.__naxosPersistentLayer=true;
  n.layer=function(body,title="EPA",back=n.home){
    ensureStyles();
    if(n.state?.timer){clearInterval(n.state.timer);n.state.timer=null}
    let el=document.querySelector(".evia-course-epa-layer");
    if(!el){
      el=document.createElement("div");
      el.className="evia-tools-layer evia-course-epa-layer evia-course-epa";
      document.body.appendChild(el)
    }else{
      el.className="evia-tools-layer evia-course-epa-layer evia-course-epa";
      el.style.pointerEvents=""
    }
    const esc=n.esc||((v)=>String(v??""));
    el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-naxos-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;
    const backButton=el.querySelector("[data-naxos-back]");
    if(backButton)backButton.onclick=typeof back==="function"?back:n.home;
    const bodyEl=el.querySelector(".evia-tools-body");
    if(bodyEl)bodyEl.scrollTop=0;
    return el
  }
}
function ensureAvatar(){
  ensureStyles();
  let a=document.querySelector(`.${AVATAR_CLASS}`);
  if(a)return a;
  a=document.createElement("div");
  a.className=AVATAR_CLASS;
  a.setAttribute("aria-hidden","true");
  a.innerHTML='<span class="naxos-avatar-float"><span class="naxos-avatar-halo"></span><span class="naxos-avatar-face"><span class="naxos-avatar-eyes"><span class="naxos-avatar-eye"></span><span class="naxos-avatar-eye right"></span></span></span></span>';
  document.body.appendChild(a);
  requestAnimationFrame(()=>a.classList.add("is-visible"));
  return a
}
function hideAvatar(delay=0){
  window.setTimeout(()=>{
    const a=document.querySelector(`.${AVATAR_CLASS}`);if(!a)return;
    a.classList.remove("is-visible");
    window.setTimeout(()=>a.remove(),520)
  },delay)
}
function showBackdrop(){
  ensureStyles();
  let b=document.querySelector(`.${BACKDROP_CLASS}`);
  if(!b){b=document.createElement("div");b.className=BACKDROP_CLASS;b.setAttribute("aria-hidden","true");document.body.appendChild(b)}
  b.style.opacity="1"
}
function hideBackdrop(delay=0){
  window.setTimeout(()=>{
    const b=document.querySelector(`.${BACKDROP_CLASS}`);if(!b)return;
    b.style.opacity="0";
    window.setTimeout(()=>b.remove(),450)
  },delay)
}
function openNaxos(){
  const n=window.NaxosDemoEPA;
  if(!n?.enter){hideBackdrop();hideAvatar();console.error("Naxos EPA modules were not available");return}
  installPersistentLayer();
  ensureAvatar();
  n.enter()
}
installPersistentLayer();
window.addEventListener("click",e=>{
  const b=e.target.closest?.('[data-arch="EPA"]');
  if(!b||!eligible())return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
  showBackdrop();
  installPersistentLayer();
  ensureAvatar();
  openNaxos()
},true);
const observer=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    for(const node of mutation.addedNodes){
      if(node?.nodeType!==1)continue;
      if(node.matches?.(".evia-course-epa-layer")||node.querySelector?.(".evia-course-epa-layer"))ensureAvatar();
      if(node.matches?.(".naxos-section-transition.to-evia")||node.querySelector?.(".naxos-section-transition.to-evia")){
        hideAvatar(360);
        hideBackdrop(1940);
        return
      }
    }
  }
});
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("load",()=>{installPersistentLayer();window.NaxosDemoEPA?.patchArch?.()});
window.EviaNaxosLoader={loading:false,open:openNaxos};
})();
