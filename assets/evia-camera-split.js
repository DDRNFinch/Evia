(()=>{
"use strict";
let frame=0;
function makeButton(kind,label){
  const button=document.createElement("button");
  button.type="button";
  button.className="self-button primary";
  if(kind==="video")button.dataset.captureVideo="";
  else button.dataset.capturePhoto="";
  button.textContent=label;
  return button;
}
function replacePicker(original){
  if(!original||!original.isConnected)return;
  const wrap=document.createElement("div");
  wrap.className="self-capture-actions";
  wrap.append(makeButton("photo","Take photo"),makeButton("video","Record video"));
  original.replaceWith(wrap);
}
function buildCaptureButtons(){
  document.querySelectorAll("[data-pick]").forEach(replacePicker);
}
function apply(){buildCaptureButtons()}
function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(apply)}
function openNativeCamera(kind){
  const input=document.querySelector("#selfPhoto");
  if(!input)return;
  input.value="";
  input.type="file";
  input.setAttribute("capture","environment");
  input.setAttribute("accept",kind==="video"?"video/*":"image/*");
  input.click();
}
// Block the original combined picker even during the tiny render window before
// the MutationObserver has replaced it. It must never fall through to the
// base app's gallery-style file picker.
document.addEventListener("click",e=>{
  const original=e.target.closest?.("[data-pick]");
  if(original){
    e.preventDefault();
    e.stopImmediatePropagation();
    replacePicker(original);
    return;
  }
  const photo=e.target.closest?.("[data-capture-photo]");
  const video=e.target.closest?.("[data-capture-video]");
  if(!photo&&!video)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  openNativeCamera(video?"video":"photo");
},true);
const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true});
buildCaptureButtons();
schedule();
})();