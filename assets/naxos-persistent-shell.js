(()=>{
"use strict";
const N=window.NaxosDemoEPA;if(!N)return;
function esc(s){return N.esc?N.esc(s):String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function ensureStyle(){
 if(document.getElementById("naxos-persistent-shell-style"))return;
 const s=document.createElement("style");
 s.id="naxos-persistent-shell-style";
 s.textContent=`
.evia-course-epa-layer{position:fixed!important;inset:0!important;overflow:hidden!important;background:linear-gradient(180deg,#fcfcfd 0%,#f8f8fb 62%,#f0f1f7 100%)!important}
.evia-course-epa-layer .evia-tools-screen{height:100%;min-height:100%;overflow:hidden;background:transparent!important}
.evia-course-epa-layer .evia-tools-body{height:calc(100% - 3.2rem);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;animation:naxos-page-in .22s cubic-bezier(.22,1,.36,1)}
@keyframes naxos-page-in{from{opacity:.72;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
`;
 document.head.appendChild(s)
}
function layer(body,title="EPA",back=N.home){
 ensureStyle();
 if(N.state?.timer){clearInterval(N.state.timer);N.state.timer=null}
 let el=document.querySelector(".evia-course-epa-layer");
 if(!el){
   el=document.createElement("div");
   el.className="evia-tools-layer evia-course-epa-layer evia-course-epa";
   document.body.appendChild(el)
 }else{
   el.className="evia-tools-layer evia-course-epa-layer evia-course-epa";
   el.style.pointerEvents="";
   el.classList.remove("naxos-outgoing-layer")
 }
 el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-naxos-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;
 const backButton=el.querySelector("[data-naxos-back]");
 if(backButton)backButton.onclick=typeof back==="function"?back:N.home;
 const bodyEl=el.querySelector(".evia-tools-body");
 if(bodyEl)bodyEl.scrollTop=0;
 return el
}
N.layer=layer;
window.NaxosPersistentShell={installed:true,layer};
})();
