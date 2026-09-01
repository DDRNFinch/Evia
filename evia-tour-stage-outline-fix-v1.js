(()=>{
  'use strict';
  if(window.__eviaTourStageOutlineFixV1)return;
  window.__eviaTourStageOutlineFixV1=true;

  function removeTourOutlineFromEvia(){
    const stage=document.getElementById('eviaStage');
    if(!stage)return;
    stage.classList.remove('evia-tour-highlight-v3','evia-tour-final-v3');
  }

  function watch(){
    const stage=document.getElementById('eviaStage');
    if(!stage){setTimeout(watch,100);return;}
    removeTourOutlineFromEvia();
    const observer=new MutationObserver(()=>removeTourOutlineFromEvia());
    observer.observe(stage,{attributes:true,attributeFilter:['class']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});
  else watch();
})();
