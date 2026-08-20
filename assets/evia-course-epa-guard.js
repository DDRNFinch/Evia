(()=>{
"use strict";
const SHELL_CLASS="naxos-epa-shell";
const INDIGO="#30345e";
let active=false;
let timers=[];

function eligible(){
  try{
    const c=window.EviaCourseContext?.current?.();
    return !!c&&c.epaConfigured!==false&&String(c.courseType||"apprenticeship")!=="nvq"
  }catch{return false}
}

function later(fn,ms){
  const id=window.setTimeout(()=>{
    timers=timers.filter(x=>x!==id);
    fn()
  },ms);
  timers.push(id);
  return id
}

function clearTimers(){
  timers.forEach(id=>window.clearTimeout(id));
  timers=[]
}

function ensureStyles(){
  if(document.getElementById("naxos-epa-shell-style"))return;
  const s=document.createElement("style");
  s.id="naxos-epa-shell-style";
  s.textContent=`
.${SHELL_CLASS}{
  --yellow:${INDIGO};
  --ease-out:cubic-bezier(.22,1,.36,1);
  z-index:1000;
  position:absolute;
  inset:0;
  overflow:hidden;
  opacity:0;
  pointer-events:auto;
  background:linear-gradient(180deg,#fcfcfd 0%,#f8f8fb 60%,#ececf5 100%);
  transition:opacity .68s ease;
  isolation:isolate;
}
.${SHELL_CLASS}:before{
  content:"";
  position:absolute;
  inset:0;
  z-index:-2;
  pointer-events:none;
  background:radial-gradient(at 50% 105%,rgba(48,52,94,.25),transparent 42%),radial-gradient(circle at 10% 8%,rgba(255,255,255,.95),transparent 30%);
}
.${SHELL_CLASS}:after{
  content:"";
  position:absolute;
  width:24rem;
  height:24rem;
  border-radius:50%;
  top:18%;
  left:50%;
  z-index:-1;
  opacity:.18;
  filter:blur(105px);
  pointer-events:none;
  background:rgba(48,52,94,.28);
  transform:translateX(-50%);
  transition:transform 1.65s var(--ease-out),opacity 1.2s ease;
}
.${SHELL_CLASS}.is-screen-visible{opacity:1}
.${SHELL_CLASS}.is-menu-open:after{opacity:.13;transform:translate(-50%,-5vh) scale(.94)}
.naxos-epa-intro{
  position:absolute;
  inset:0;
  z-index:30;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  opacity:0;
  pointer-events:none;
  transform:translateY(6px);
  transition:opacity .55s ease,transform .55s var(--ease-out);
}
.naxos-epa-intro.is-visible{opacity:1;transform:translateY(0)}
.naxos-epa-intro strong{
  color:${INDIGO};
  letter-spacing:-.04em;
  font-size:clamp(2rem,7vw,3rem);
  font-weight:420;
  line-height:1;
}
.naxos-epa-intro span{
  color:rgba(48,52,94,.72);
  letter-spacing:.035em;
  margin-top:.52rem;
  font-size:clamp(.72rem,2.4vw,.9rem);
  font-weight:430;
}
.${SHELL_CLASS} .naxos-epa-avatar{
  --evia-size:clamp(9.75rem,17vw,11.75rem);
  --evia-stroke:clamp(2.5px,.26vw,3px);
  z-index:20;
  width:var(--evia-size);
  height:var(--evia-size);
  opacity:0;
  pointer-events:none;
  cursor:pointer;
  transition:top .92s var(--ease-out),width .92s var(--ease-out),height .92s var(--ease-out),opacity .6s ease,transform .92s var(--ease-out);
  background:transparent;
  border:0;
  border-radius:50%;
  margin:0;
  padding:0;
  position:absolute;
  top:42%;
  left:50%;
  transform:translate(-50%,calc(18px - 50%));
}
.${SHELL_CLASS}.is-content-ready .naxos-epa-avatar{
  opacity:1;
  pointer-events:auto;
  transform:translate(-50%,-50%);
}
.${SHELL_CLASS}.is-menu-open .naxos-epa-avatar{
  --evia-size:clamp(6.25rem,9vw,6.8rem);
  --evia-stroke:clamp(1.5px,.15vw,1.75px);
  top:clamp(5rem,11vh,6.35rem);
}
.${SHELL_CLASS} .naxos-epa-avatar .evia-halo{
  background:radial-gradient(circle,rgba(48,52,94,.24) 0%,rgba(48,52,94,.075) 43%,transparent 72%);
}
.${SHELL_CLASS} .naxos-epa-avatar .evia-face,
.${SHELL_CLASS} .naxos-epa-avatar .evia-eye{border-color:${INDIGO}}
.${SHELL_CLASS} .naxos-epa-avatar:hover .evia-face{filter:drop-shadow(0 8px 14px rgba(48,52,94,.13))}
.naxos-epa-menu{
  position:absolute;
  z-index:15;
  inset:clamp(8.4rem,18vh,10rem) .85rem calc(1.25rem + env(safe-area-inset-bottom));
  display:grid;
  justify-items:center;
  align-items:start;
  padding-top:.45rem;
  opacity:0;
  pointer-events:none;
  transform:translateY(14px);
  transition:opacity .36s ease .14s,transform .58s var(--ease-out) .14s;
}
.${SHELL_CLASS}.is-menu-open .naxos-epa-menu{opacity:1;pointer-events:auto;transform:translateY(0)}
.naxos-epa-options{
  width:min(29rem,100%);
  display:grid;
  grid-template-rows:repeat(4,3.55rem);
  gap:.7rem;
  align-content:start;
}
.${SHELL_CLASS} .naxos-epa-option{
  color:#363849;
  border-color:rgba(48,52,94,.13);
  box-shadow:inset 0 1px rgba(255,255,255,.86),0 5px 18px rgba(32,35,63,.055);
}
.${SHELL_CLASS} .naxos-epa-option:hover,
.${SHELL_CLASS} .naxos-epa-option:focus-visible{border-color:rgba(48,52,94,.24);background:rgba(255,255,255,.79)}
.${SHELL_CLASS} .naxos-epa-option .option-row-copy>span{color:#363849}
@media(max-width:560px){
  .${SHELL_CLASS} .naxos-epa-avatar{top:40.5%}
  .${SHELL_CLASS}.is-menu-open .naxos-epa-avatar{--evia-size:5.9rem;top:max(4.45rem,calc(env(safe-area-inset-top) + 3.45rem))}
  .naxos-epa-options{grid-template-rows:repeat(4,3.42rem);gap:.64rem}
  .naxos-epa-menu{inset:max(7.65rem,calc(env(safe-area-inset-top) + 6.9rem)) 1rem calc(1rem + env(safe-area-inset-bottom));padding-top:.55rem}
}
@media(max-height:700px){
  .naxos-epa-menu{inset:7.4rem .75rem calc(.8rem + env(safe-area-inset-bottom));padding-top:.1rem}
  .naxos-epa-options{grid-template-rows:repeat(4,3.2rem);gap:.52rem}
}
@media(max-height:650px){
  .${SHELL_CLASS}.is-menu-open .naxos-epa-avatar{--evia-size:5.45rem;top:3.5rem}
  .naxos-epa-menu{top:6.3rem}
}
@media(prefers-reduced-motion:reduce){
  .${SHELL_CLASS},.naxos-epa-intro,.${SHELL_CLASS} .naxos-epa-avatar,.naxos-epa-menu{transition-duration:.01ms!important;transition-delay:0s!important}
}
`;
  document.head.appendChild(s)
}

function makeShell(host){
  document.querySelector(`.${SHELL_CLASS}`)?.remove();
  const shell=document.createElement("section");
  shell.className=SHELL_CLASS;
  shell.setAttribute("aria-label","Naxos EPA assistant");
  shell.innerHTML=`
    <div class="naxos-epa-intro" aria-hidden="true"><strong>Naxos</strong><span>EPA assistant</span></div>
    <button type="button" class="evia-anchor naxos-epa-avatar" data-naxos aria-label="Naxos EPA assistant" aria-expanded="false">
      <span class="evia-float">
        <span class="evia-halo"></span>
        <span class="evia-face expression-idle">
          <span class="evia-eyes">
            <span class="evia-eye eye-left"></span>
            <span class="evia-eye eye-right"></span>
          </span>
        </span>
      </span>
    </button>
    <section class="naxos-epa-menu" aria-hidden="true">
      <div class="naxos-epa-options">
        <button type="button" class="option-row naxos-epa-option" data-naxos-option="multiple-choice"><span class="option-row-copy"><span>Multiple choice Mock</span></span></button>
        <button type="button" class="option-row naxos-epa-option" data-naxos-option="interview"><span class="option-row-copy"><span>Interview Mock</span></span></button>
        <button type="button" class="option-row naxos-epa-option" data-naxos-option="practical"><span class="option-row-copy"><span>Practical Mock</span></span></button>
        <button type="button" class="option-row naxos-epa-option" data-naxos-option="full"><span class="option-row-copy"><span>Full EPA Mock</span></span></button>
      </div>
    </section>`;
  host.appendChild(shell);
  const avatar=shell.querySelector("[data-naxos]");
  const menu=shell.querySelector(".naxos-epa-menu");
  avatar?.addEventListener("click",e=>{
    e.preventDefault();
    e.stopPropagation();
    const open=!shell.classList.contains("is-menu-open");
    shell.classList.toggle("is-menu-open",open);
    avatar.setAttribute("aria-expanded",String(open));
    menu?.setAttribute("aria-hidden",String(!open))
  });
  shell.querySelectorAll("[data-naxos-option]").forEach(button=>button.addEventListener("click",e=>{
    e.preventDefault();
    e.stopPropagation()
  }));
  return shell
}

function enter(){
  if(active||!eligible())return false;
  const host=document.querySelector(".selfobs");
  if(!host)return false;
  ensureStyles();
  clearTimers();
  active=true;
  const shell=makeShell(host);
  const intro=shell.querySelector(".naxos-epa-intro");
  requestAnimationFrame(()=>requestAnimationFrame(()=>shell.classList.add("is-screen-visible")));
  later(()=>intro?.classList.add("is-visible"),720);
  later(()=>intro?.classList.remove("is-visible"),1600);
  later(()=>shell.classList.add("is-content-ready"),2200);
  return true
}

function exit(){
  clearTimers();
  active=false;
  document.querySelectorAll(`.${SHELL_CLASS}`).forEach(x=>x.remove())
}

document.addEventListener("click",e=>{
  const b=e.target instanceof Element?e.target.closest("[data-arch]"):null;
  if(!b)return;
  const arch=String(b.dataset.arch||"").toUpperCase();
  if(arch==="EPA"&&eligible()){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    enter();
    return
  }
  if(active)exit()
},true);

window.addEventListener("pagehide",exit);
window.EviaNaxosLanding={enter,exit,isActive:()=>active};
})();
