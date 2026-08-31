(()=>{'use strict';
const SUPPORT_KEY='eviaLearningSupportV1';
const THINKING_PAUSE_MS=3000;
let delayedOptionsTimer=null;

function supportState(){
  try{const value=JSON.parse(localStorage.getItem(SUPPORT_KEY)||'{}');return value&&typeof value==='object'?value:{}}catch{return{}}
}
function extraThinkingEnabled(){return Boolean(supportState().extraThinkingTime)}
function injectStyles(){
  if(document.getElementById('eviaSmokeFixStyles'))return;
  const style=document.createElement('style');
  style.id='eviaSmokeFixStyles';
  style.textContent=`html.evia-reduce-motion #screen.evia-update-ready .evia-body{animation:eviaUpdateHeartbeat 1.35s ease-in-out infinite!important;transform-origin:center!important}`;
  document.head.appendChild(style);
}
function shouldPause(options){
  if(!extraThinkingEnabled()||!Array.isArray(options)||!options.length)return false;
  const actions=new Set(['test-answer','check-wellbeing','check-confidence']);
  return options.some(option=>actions.has(String(option?.action||'')));
}
function patchQuestionChoices(){
  try{
    if(typeof renderChatOptions!=='function'||renderChatOptions.__eviaThinkingPause)return;
    const original=renderChatOptions;
    const wrapped=function(options){
      if(delayedOptionsTimer){clearTimeout(delayedOptionsTimer);delayedOptionsTimer=null}
      if(!shouldPause(options))return original.apply(this,arguments);
      const context=this,args=arguments;
      original.call(context,[]);
      delayedOptionsTimer=setTimeout(()=>{
        delayedOptionsTimer=null;
        try{original.apply(context,args)}catch{}
      },THINKING_PAUSE_MS);
    };
    wrapped.__eviaThinkingPause=true;
    renderChatOptions=wrapped;
  }catch{}
}
function syncThinkingLabel(){
  const button=document.querySelector('[data-support-toggle="extraThinkingTime"]');
  const description=button?.closest('.support-row')?.querySelector('.support-label span');
  if(description)description.textContent='Adds a short processing pause before answer choices in Test Me and Check-ins.';
}
function refresh(){patchQuestionChoices();syncThinkingLabel()}
injectStyles();
refresh();
const observer=new MutationObserver(syncThinkingLabel);
observer.observe(document.body,{childList:true,subtree:true});
setInterval(patchQuestionChoices,2500);
window.eviaExtraThinkingTimeEnabled=extraThinkingEnabled;
})();
