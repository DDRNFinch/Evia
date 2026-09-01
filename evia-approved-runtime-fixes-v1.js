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
function loadDemoCourse(){
  if(window.__eviaDemoCourseV1||document.querySelector('script[data-evia-demo-course-v1]'))return;
  const script=document.createElement('script');
  script.src='./evia-demo-course-v1.js';
  script.async=false;
  script.dataset.eviaDemoCourseV1='1';
  document.head.appendChild(script);
}
injectStyles();patchChoices();loadDemoCourse();setInterval(patchChoices,2500);window.eviaExtraThinkingTimeEnabled=enabled;
})();