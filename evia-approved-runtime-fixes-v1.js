(()=>{'use strict';
const SUPPORT_KEY='eviaLearningSupportV1';
const THINKING_PAUSE_MS=3000;
let delayedOptionsTimer=null;
function state(){try{const value=JSON.parse(localStorage.getItem(SUPPORT_KEY)||'{}');return value&&typeof value==='object'?value:{}}catch{return{}}}
function enabled(){return Boolean(state().extraThinkingTime)}
function injectStyles(){if(document.getElementById('eviaRuntimeFixStyles'))return;const style=document.createElement('style');style.id='eviaRuntimeFixStyles';style.textContent='html.evia-reduce-motion #screen.evia-update-ready .evia-body{animation:eviaUpdateHeartbeat 1.35s ease-in-out infinite!important;transform-origin:center!important}';document.head.appendChild(style)}
function shouldPause(options){if(!enabled()||!Array.isArray(options)||!options.length)return false;const actions=new Set(['test-answer','check-wellbeing','check-confidence']);return options.some(option=>actions.has(String(option?.action||'')))}
function patchChoices(){
  try{
    if(typeof renderChatOptions!=='function'||renderChatOptions.__eviaThinkingPause)return;
    const original=renderChatOptions;
    const wrapped=function(options){
      if(delayedOptionsTimer){clearTimeout(delayedOptionsTimer);delayedOptionsTimer=null}
      if(!shouldPause(options))return original.apply(this,arguments);
      const context=this,args=arguments;original.call(context,[]);
      delayedOptionsTimer=setTimeout(()=>{delayedOptionsTimer=null;try{original.apply(context,args)}catch{}},THINKING_PAUSE_MS);
    };
    wrapped.__eviaThinkingPause=true;renderChatOptions=wrapped;
  }catch{}
}
injectStyles();patchChoices();setInterval(patchChoices,2500);window.eviaExtraThinkingTimeEnabled=enabled;
})();

(()=>{'use strict';
function isIPhone(){return /iPhone|iPod/i.test(String(navigator.userAgent||''))}
function loadImage(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),image=new Image();
    image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};
    image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read this photo.'))};
    image.src=url;
  });
}
function jpegBlob(canvas,quality){return new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality))}
async function compressIPhonePhoto(file){
  const image=await loadImage(file),sourceWidth=image.naturalWidth||image.width,sourceHeight=image.naturalHeight||image.height;
  if(!sourceWidth||!sourceHeight)throw new Error('Could not read this photo.');
  const maxDimension=1280,scale=Math.min(1,maxDimension/Math.max(sourceWidth,sourceHeight));
  let canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(sourceWidth*scale));canvas.height=Math.max(1,Math.round(sourceHeight*scale));
  let context=canvas.getContext('2d',{alpha:false});context.drawImage(image,0,0,canvas.width,canvas.height);
  const targetBytes=350*1024,qualities=[0.88,0.82,0.76,0.70,0.64,0.60];
  let best=null;
  for(const quality of qualities){const blob=await jpegBlob(canvas,quality);if(blob){best=blob;if(blob.size<=targetBytes)return blob}}
  for(let pass=0;pass<2&&best&&best.size>targetBytes;pass++){
    const longest=Math.max(canvas.width,canvas.height);if(longest<=900)break;
    const factor=Math.max(0.75,Math.min(0.90,Math.sqrt(targetBytes/best.size)*0.95));
    const next=document.createElement('canvas');next.width=Math.max(1,Math.round(canvas.width*factor));next.height=Math.max(1,Math.round(canvas.height*factor));
    context=next.getContext('2d',{alpha:false});context.drawImage(canvas,0,0,next.width,next.height);canvas=next;
    for(const quality of [0.72,0.66,0.60]){const blob=await jpegBlob(canvas,quality);if(blob){best=blob;if(blob.size<=targetBytes)return blob}}
  }
  if(!best)throw new Error('Could not compress this photo.');
  return best;
}
function sizeLabel(bytes){if(!Number.isFinite(bytes))return'';return bytes>=1024*1024?`${(bytes/1024/1024).toFixed(1)} MB`:`${Math.max(1,Math.round(bytes/1024))} KB`}
try{
  if(isIPhone()&&typeof openPhotoCapture==='function'){
    const originalOpenPhotoCapture=openPhotoCapture;
    openPhotoCapture=async function(step,sessionId){
      if(!isIPhone())return originalOpenPhotoCapture.apply(this,arguments);
      stopCapture();captureMode='photo';
      evidenceTop.innerHTML='<div class="capture-surface"><div class="audio-panel"><button class="capture-button" id="photoCapture" type="button">Take photo</button><input id="eviaIphonePhotoInput" type="file" accept="image/*" capture="environment" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none"><div class="capture-status" id="captureStatus"></div></div></div>';
      evidenceTop.style.gridTemplateRows='1fr';
      const capture=document.getElementById('photoCapture'),input=document.getElementById('eviaIphonePhotoInput');
      updateBackButton();fitUiText();showCaptureStatus('Tap Take photo to open the iPhone camera.');
      capture.addEventListener('click',()=>{if(sessionId!==captureSessionId)return;input.value='';input.click()});
      input.addEventListener('change',async()=>{
        const file=input.files?.[0];if(!file||sessionId!==captureSessionId)return;
        capture.disabled=true;showCaptureStatus('Compressing photo…');
        try{
          const blob=await compressIPhonePhoto(file);if(sessionId!==captureSessionId)return;
          await saveEvidenceBlob(blob,'photo');
          showCaptureStatus(`Saved · ${sizeLabel(file.size)} → ${sizeLabel(blob.size)}`);
          await new Promise(resolve=>setTimeout(resolve,450));
          await completeCaptureStep(sessionId);
        }catch(error){capture.disabled=false;showCaptureStatus(error?.message||'Could not save this photo.')}
      });
    };
    window.EviaIPhonePhotoTest={enabled:true,targetKb:350,maxDimension:1280};
  }
}catch(error){console.warn('Evia iPhone photo test could not start',error)}
})();