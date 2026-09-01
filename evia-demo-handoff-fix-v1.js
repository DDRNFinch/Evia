(()=>{
  'use strict';
  if(window.__eviaDemoMenuHandoffFixV1)return;
  window.__eviaDemoMenuHandoffFixV1=true;

  const INTRO_KEY='eviaFirstRunTourV3';
  const DEMO_ID='EVIA-DEMO';
  const DEMO_VERSION='1.2';
  const TOUR_REFRESH_KEY='eviaDemoTourV12RefreshV1';
  let armed=localStorage.getItem(INTRO_KEY)!=='1';

  function readJson(key,fallback){
    try{const value=JSON.parse(localStorage.getItem(key)||'null');return value===null?fallback:value}catch{return fallback}
  }

  function demoMeta(){return readJson('eviaNaxosCourseMetaV1',{})||{}}
  function isDemo(){
    const meta=demoMeta();
    return String(meta?.qualificationId||meta?.qualification?.id||'').trim()===DEMO_ID;
  }
  function demoVersion(){
    const meta=demoMeta();
    return String(meta?.version||meta?.qualification?.version||'').trim();
  }

  function patchCourseButton(attempt=0){
    const course=document.getElementById('courseArch');
    const stage=document.getElementById('eviaStage');
    if(!course||!stage){
      if(attempt<80)setTimeout(()=>patchCourseButton(attempt+1),150);
      return;
    }
    if(course.__eviaDemoMenuHandoffPatched)return;
    const normalClick=course.click.bind(course);
    course.click=function(...args){
      const tourJustFinished=localStorage.getItem(INTRO_KEY)==='1';
      if(armed&&tourJustFinished&&isDemo()){
        armed=false;
        setTimeout(()=>stage.click(),0);
        return;
      }
      return normalClick(...args);
    };
    course.__eviaDemoMenuHandoffPatched=true;
  }

  function refreshUpdatedDemoTour(attempt=0){
    if(!isDemo()||demoVersion()!==DEMO_VERSION){
      if(attempt<100)setTimeout(()=>refreshUpdatedDemoTour(attempt+1),150);
      return;
    }
    if(localStorage.getItem(TOUR_REFRESH_KEY)==='1')return;
    try{localStorage.setItem(TOUR_REFRESH_KEY,'1')}catch{}
    if(localStorage.getItem(INTRO_KEY)==='1'){
      armed=true;
      setTimeout(()=>window.eviaFirstRunIntro?.restart?.(),120);
    }
  }

  patchCourseButton();
  refreshUpdatedDemoTour();
})();
