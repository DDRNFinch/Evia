(()=>{
"use strict";
let frame=0;
function buildCaptureButtons(){
  const original=document.querySelector("[data-pick]");
  if(!original||original.closest(".self-capture-actions"))return;
  const wrap=document.createElement("div");
  wrap.className="self-capture-actions";
  const photo=document.createElement("button");
  photo.type="button";
  photo.className="self-button primary";
  photo.dataset.capturePhoto="";
  photo.textContent="Take photo";
  const video=document.createElement("button");
  video.type="button";
  video.className="self-button primary";
  video.dataset.captureVideo="";
  video.textContent="Record video";
  wrap.append(photo,video);
  original.replaceWith(wrap);
}
function apply(){buildCaptureButtons()}
function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(apply)}
function openNativeCamera(kind){
  const input=document.querySelector("#selfPhoto");
  if(!input)return;
  input.value="";
  input.setAttribute("capture","environment");
  input.setAttribute("accept",kind==="video"?"video/*":"image/*");
  input.click();
}
document.addEventListener("click",e=>{
  const photo=e.target.closest?.("[data-capture-photo]");
  const video=e.target.closest?.("[data-capture-video]");
  if(!photo&&!video)return;
  e.preventDefault();
  e.stopPropagation();
  openNativeCamera(video?"video":"photo");
},true);
const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true});
schedule();
})();