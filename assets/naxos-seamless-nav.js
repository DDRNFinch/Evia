(()=>{
"use strict";
const nativeRemove=Element.prototype.remove;
let patched=false;
function exiting(){return !!document.querySelector(".naxos-section-transition.to-evia")}
function install(){
  if(patched)return;
  patched=true;
  Element.prototype.remove=function(){
    if(this instanceof Element&&this.classList?.contains("evia-course-epa-layer")&&!exiting()){
      const el=this;
      el.classList.add("naxos-outgoing-layer");
      el.style.pointerEvents="none";
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(el.isConnected)nativeRemove.call(el)
      }));
      return
    }
    return nativeRemove.call(this)
  };
  const style=document.createElement("style");
  style.id="naxos-seamless-nav-style";
  style.textContent=`
.naxos-section-backdrop{z-index:2147481000!important;background:linear-gradient(180deg,#fcfcfd 0%,#f8f8fb 72%,#f1f2f8 100%)!important;opacity:1!important}
.evia-course-epa-layer{z-index:2147482000!important;background:linear-gradient(180deg,#fcfcfd 0%,#f8f8fb 62%,#f0f1f7 100%)!important}
.naxos-avatar-anchor{z-index:2147482500!important}
.naxos-outgoing-layer{z-index:2147481999!important}
.naxos-section-transition{z-index:2147483000!important}
`;
  document.head.appendChild(style)
}
install();
window.NaxosSeamlessNav={installed:true};
})();
