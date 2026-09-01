(()=>{
  'use strict';
  if(window.__eviaDemoCourseV1)return;
  window.__eviaDemoCourseV1=true;

  const DEMO_ID='EVIA-DEMO';
  const DEMO_VERSION='1.2';
  const DEMO_PATHS_KEY='eviaDemoCoursePathsV1';
  const DEMO_ACTIVE_KEY='eviaDemoCourseActiveV1';
  let installing=false;

  function readJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch{return fallback}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  function storedMeta(){return readJson('eviaNaxosCourseMetaV1',{})||{}}
  function currentMeta(){try{if(typeof activeCourseMeta!=='undefined'&&activeCourseMeta&&typeof activeCourseMeta==='object')return activeCourseMeta}catch{}return storedMeta()}
  function isDemoMeta(meta){return String(meta?.qualificationId||meta?.qualification?.id||'').trim()===DEMO_ID}
  function demoVersion(meta=currentMeta()){return String(meta?.version||meta?.qualification?.version||'').trim()}
  function isDemoActive(){return isDemoMeta(currentMeta())}
  function hasStoredCourse(){const raw=localStorage.getItem('eviaNaxosCourse');return raw!==null&&raw!==''}

  function leafPaths(items,prefix=[],out=[]){
    (Array.isArray(items)?items:[]).forEach(node=>{
      const label=String(node?.label||'').trim();
      const path=label?[...prefix,label]:prefix.slice();
      if(Array.isArray(node?.children)&&node.children.length)leafPaths(node.children,path,out);
      else if(path.length)out.push(path);
    });
    return out;
  }

  function rememberDemoPaths(){
    let items=[];
    try{if(typeof courseItems!=='undefined'&&Array.isArray(courseItems))items=courseItems}catch{}
    if(!items.length)items=readJson('eviaNaxosCourse',[])||[];
    writeJson(DEMO_PATHS_KEY,leafPaths(items));
  }

  function demoPaths(){const value=readJson(DEMO_PATHS_KEY,[]);return Array.isArray(value)?value:[]}

  function clearDemoCompletionPaths(){
    const paths=demoPaths();
    if(typeof clearEvidencePathComplete==='function'){
      paths.forEach(path=>{try{clearEvidencePathComplete(path)}catch{}});
      return;
    }
    try{
      const saved=readJson('eviaCompletedEvidencePathsV1',[])||[];
      const remove=new Set(paths.map(path=>JSON.stringify((Array.isArray(path)?path:[]).map(part=>String(part||'').trim()))));
      localStorage.setItem('eviaCompletedEvidencePathsV1',JSON.stringify(saved.filter(key=>!remove.has(key))));
    }catch{}
  }

  async function demoEntries(){
    try{
      if(typeof getPortfolioEntries!=='function')return[];
      const entries=await getPortfolioEntries();
      return (entries||[]).filter(entry=>entry?.eviaDemoCourse===true||String(entry?.eviaDemoCourseId||'')===DEMO_ID);
    }catch{return[]}
  }

  async function deleteDemoEvidence(){
    if(typeof openPortfolioDb!=='function')return;
    const db=await openPortfolioDb();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('evidence','readwrite');
      const store=tx.objectStore('evidence');
      const request=store.openCursor();
      request.onsuccess=()=>{
        const cursor=request.result;
        if(!cursor)return;
        const entry=cursor.value||{};
        if(entry.eviaDemoCourse===true||String(entry.eviaDemoCourseId||'')===DEMO_ID)cursor.delete();
        cursor.continue();
      };
      request.onerror=()=>reject(request.error);
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error||new Error('Demo reset was interrupted.'));
    }).finally(()=>{try{db.close()}catch{}});
  }

  async function refreshAfterDemoChange(){
    try{if(typeof renderPortfolioList==='function')await renderPortfolioList()}catch{}
    try{if(typeof updateArchBars==='function')await updateArchBars()}catch{}
    try{
      const title=document.getElementById('archDetailTitle');
      if(isDemoActive()&&title?.textContent?.trim()==='Course'&&typeof renderCoursePage==='function')renderCoursePage();
    }catch{}
    setTimeout(decorateDemoCoursePage,0);
  }

  async function resetDemo(){
    if(!isDemoActive())return;
    const ok=window.confirm('Reset the Evia Demo Course? This removes only demo evidence and returns demo progress to 0%.');
    if(!ok)return;
    await deleteDemoEvidence();
    clearDemoCompletionPaths();
    await refreshAfterDemoChange();
  }

  async function offerDemoEvidenceCleanup(){
    const entries=await demoEntries();
    if(!entries.length)return;
    const ok=window.confirm('Your real course has replaced the Evia Demo Course. Remove the demo evidence from this device?');
    if(!ok)return;
    await deleteDemoEvidence();
    try{if(typeof renderPortfolioList==='function')await renderPortfolioList()}catch{}
  }

  function patchPortfolio(){
    try{
      if(typeof addPortfolioEntry!=='function'||addPortfolioEntry.__eviaDemoWrapped)return;
      const original=addPortfolioEntry;
      const wrapped=async function(entry){
        const next=isDemoActive()?{...(entry||{}),eviaDemoCourse:true,eviaDemoCourseId:DEMO_ID,eviaDemoCourseVersion:DEMO_VERSION}:entry;
        return original.call(this,next);
      };
      wrapped.__eviaDemoWrapped=true;
      wrapped.__eviaDemoOriginal=original;
      addPortfolioEntry=wrapped;
    }catch{}
  }

  function patchCourseImport(){
    try{
      if(typeof applyImportedCourse!=='function'||applyImportedCourse.__eviaDemoWrapped)return;
      const original=applyImportedCourse;
      const wrapped=function(items,title,meta){
        const wasDemo=isDemoActive();
        const incomingDemo=isDemoMeta(meta);
        const result=original.apply(this,arguments);
        if(incomingDemo){
          try{localStorage.setItem(DEMO_ACTIVE_KEY,'1')}catch{}
          rememberDemoPaths();
          setTimeout(decorateDemoCoursePage,0);
        }else if(wasDemo){
          try{localStorage.removeItem(DEMO_ACTIVE_KEY)}catch{}
          clearDemoCompletionPaths();
          setTimeout(()=>offerDemoEvidenceCleanup().catch(()=>{}),150);
        }
        return result;
      };
      wrapped.__eviaDemoWrapped=true;
      wrapped.__eviaDemoOriginal=original;
      applyImportedCourse=wrapped;
    }catch{}
  }

  function patchHooks(){patchPortfolio();patchCourseImport()}

  function decorateDemoCoursePage(){
    if(!isDemoActive())return;
    const content=document.getElementById('archDetailContent');
    const title=document.getElementById('archDetailTitle');
    if(!content||title?.textContent?.trim()!=='Course'||!content.querySelector('.criterion-grid')||document.getElementById('eviaDemoControls'))return;
    const card=document.createElement('div');
    card.className='detail-card';
    card.id='eviaDemoControls';
    card.innerHTML='<strong>Demo Course</strong><p>This course is for exploring Evia. It is not a qualification. Your organisation\'s real courses become available with an active subscription.</p><button class="detail-action-button" id="eviaResetDemo" type="button">Reset Demo</button>';
    const first=content.firstElementChild;
    if(first)first.insertAdjacentElement('afterend',card);else content.prepend(card);
    card.querySelector('#eviaResetDemo')?.addEventListener('click',()=>resetDemo().catch(()=>{}));
  }

  function demoPointer(){
    return {
      type:'evia-mapping-pack-url-v1',
      version:1,
      courseType:'ksb',
      courseId:DEMO_ID,
      standardVersion:DEMO_VERSION,
      packUrl:new URL('./demo/pack.json',window.location.href).href
    };
  }

  function finishDemoInstall(){
    try{localStorage.setItem(DEMO_ACTIVE_KEY,'1')}catch{}
    rememberDemoPaths();
    try{if(typeof updateArchBars==='function')updateArchBars().catch(()=>{})}catch{}
    setTimeout(decorateDemoCoursePage,0);
  }

  function importDemo(attempt=0,refreshExisting=false){
    if(installing)return;
    if(typeof importNaxosKsbPack!=='function'){
      if(attempt<40)setTimeout(()=>importDemo(attempt+1,refreshExisting),150);
      return;
    }
    installing=true;
    Promise.resolve()
      .then(async()=>{
        if(refreshExisting){
          await deleteDemoEvidence().catch(()=>{});
          clearDemoCompletionPaths();
        }
      })
      .then(()=>importNaxosKsbPack(demoPointer()))
      .then(finishDemoInstall)
      .catch(error=>console.warn('Evia demo course could not be prepared',error))
      .finally(()=>{installing=false});
  }

  function installDemoIfNeeded(){
    patchHooks();
    if(hasStoredCourse()){
      if(!isDemoActive())return;
      try{localStorage.setItem(DEMO_ACTIVE_KEY,'1')}catch{}
      rememberDemoPaths();
      if(demoVersion()!==DEMO_VERSION){importDemo(0,true);return;}
      decorateDemoCoursePage();
      return;
    }
    importDemo(0,false);
  }

  const observer=new MutationObserver(()=>decorateDemoCoursePage());
  if(document.documentElement)observer.observe(document.documentElement,{childList:true,subtree:true});
  patchHooks();
  setInterval(patchHooks,2000);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>installDemoIfNeeded(),{once:true});
  else setTimeout(()=>installDemoIfNeeded(),0);

  window.eviaDemoCourse={isActive:isDemoActive,reset:resetDemo,version:()=>DEMO_VERSION};
})();