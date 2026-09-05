(()=>{'use strict';
const VERSION=1;
let timelineEvidenceMode=false;
let timelineGroupEntries=[];
let timelineGroupIndex=0;
let timelineNav=null;
let timelineNeedsRefresh=false;

function clean(value){return String(value??'').replace(/\s+/g,' ').trim()}
function calendarParts(value){
  if(value instanceof Date&&!Number.isNaN(value.getTime()))return{y:value.getFullYear(),m:value.getMonth()+1,d:value.getDate()};
  const text=clean(value);if(!text)return null;
  const dateOnly=text.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if(dateOnly&&text.length===10)return{y:Number(dateOnly[1]),m:Number(dateOnly[2]),d:Number(dateOnly[3])};
  const date=new Date(text);
  if(Number.isNaN(date.getTime()))return dateOnly?{y:Number(dateOnly[1]),m:Number(dateOnly[2]),d:Number(dateOnly[3])}:null;
  return{y:date.getFullYear(),m:date.getMonth()+1,d:date.getDate()};
}
function dayKey(value){const p=calendarParts(value);return p?`${String(p.y).padStart(4,'0')}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`:''}
function pathKey(path){
  try{if(typeof evidencePathKey==='function')return evidencePathKey(path)}catch{}
  try{return JSON.stringify((Array.isArray(path)?path:[]).map(clean))}catch{return''}
}
function entryEventId(entry){
  const date=entry?.createdAt||entry?.updatedAt||'';
  return`evidence:${dayKey(date)}:${pathKey(entry?.path)}:learner`;
}
function removeTimelineNav(){
  timelineNav?.remove();
  timelineNav=null;
}
function resetTimelineEvidenceMode(){
  timelineEvidenceMode=false;
  timelineGroupEntries=[];
  timelineGroupIndex=0;
  timelineNeedsRefresh=false;
  removeTimelineNav();
}
function addStyles(){
  if(document.getElementById('eviaTimeEvidenceEditV1Styles'))return;
  const style=document.createElement('style');
  style.id='eviaTimeEvidenceEditV1Styles';
  style.textContent=`
    #archDetailContent.evia-time-timeline-v1{padding:0 6px 24px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-time-overview{margin:0 0 9px!important;padding:10px 12px!important;border-width:1px!important;border-color:rgba(245,196,0,.16)!important;border-radius:18px!important;background:rgba(250,249,242,.58)!important;box-shadow:none!important;gap:5px 12px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-time-overview strong{font-size:13.5px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-time-overview span{font-size:9.5px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-time-overview .value{font-size:19px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-vertical-timeline{padding:2px 0 6px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-vertical-timeline::before{left:24px!important;width:1.5px!important;background:linear-gradient(180deg,rgba(245,196,0,.12),rgba(245,196,0,.36) 48%,rgba(45,45,45,.08))!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-month{padding:3px 0 8px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-month-heading{margin:3px 2px 7px 64px!important;min-height:27px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-month-heading strong{font-size:13px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-month-heading span{font-size:8px!important;color:rgba(45,45,45,.34)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event{min-height:48px!important;padding:0 4px 6px 64px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-dot{left:17px!important;top:15px!important;width:15px!important;height:15px!important;border-width:3px!important;box-shadow:0 0 0 1px rgba(245,196,0,.30)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event-button,#archDetailContent.evia-time-timeline-v1 .evia-today-card,#archDetailContent.evia-time-timeline-v1 .evia-boundary-card{min-height:44px!important;border-color:rgba(45,45,45,.055)!important;border-radius:15px!important;padding:7px 10px!important;gap:1px!important;box-shadow:none!important;background:rgba(255,255,255,.82)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event-button strong,#archDetailContent.evia-time-timeline-v1 .evia-today-card strong,#archDetailContent.evia-time-timeline-v1 .evia-boundary-card strong{font-size:11.8px!important;line-height:1.22!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event-button>span:not(.evia-timeline-event-date),#archDetailContent.evia-time-timeline-v1 .evia-today-card span,#archDetailContent.evia-time-timeline-v1 .evia-boundary-card span{font-size:8.7px!important;line-height:1.28!important;color:rgba(45,45,45,.44)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event-date{font-size:8px!important;color:rgba(45,45,45,.32)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event-detail{margin:4px 0 0!important;padding:7px 9px!important;border-radius:12px!important;background:rgba(250,249,242,.56)!important;font-size:9px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event.assistant{padding-left:78px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event.assistant .evia-timeline-dot{left:20px!important;top:17px!important;width:9px!important;height:9px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-stem{left:28px!important;top:21px!important;width:29px!important;background:rgba(45,45,45,.12)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-assistant-node{left:54px!important;top:15px!important;width:13px!important;height:13px!important;box-shadow:0 0 0 1px rgba(45,45,45,.10)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event.today{padding-left:64px!important;min-height:52px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event.today .evia-timeline-dot{left:14px!important;top:13px!important;width:21px!important;height:21px!important;border-width:4px!important;box-shadow:0 0 0 1.5px rgba(245,196,0,.30),0 0 0 5px rgba(245,196,0,.05)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-today-card{min-height:46px!important;justify-content:center!important;border-color:rgba(245,196,0,.20)!important;background:rgba(245,196,0,.035)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-today-card strong{font-size:13.5px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event.boundary{padding-left:64px!important;min-height:48px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-month-pack{margin:2px 4px 8px 64px!important;padding:8px 0 5px!important;border:0!important;border-top:1px solid rgba(245,196,0,.12)!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;gap:5px 9px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-month-pack>div:first-child{gap:1px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-month-pack-state{font-size:7.5px!important;color:rgba(45,45,45,.34)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-month-pack strong{font-size:9.8px!important;font-weight:700!important}
    #archDetailContent.evia-time-timeline-v1 .evia-month-pack small{font-size:8.2px!important;color:rgba(45,45,45,.38)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-month-pack button{min-height:34px!important;border-width:1px!important;border-color:rgba(245,196,0,.28)!important;font-size:9px!important;padding:6px 10px!important;background:rgba(255,255,255,.74)!important}
    #archDetailContent.evia-time-timeline-v1 .evia-month-pack-status{font-size:8px!important}
    #archDetailContent.evia-time-timeline-v1 .evia-timeline-event.learner.evidence .evia-timeline-event-button{cursor:pointer!important}
    .evia-timeline-evidence-nav{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 2px}
    .evia-timeline-evidence-nav button{min-width:72px;min-height:36px;border:1px solid rgba(245,196,0,.30);border-radius:999px;background:#fff;color:#333;font-size:11px;font-weight:700;padding:6px 10px}
    .evia-timeline-evidence-nav button:disabled{opacity:.35}
    .evia-timeline-evidence-nav span{min-width:58px;text-align:center;font-size:10px;font-weight:700;color:#505050}
    @media(max-width:380px){#archDetailContent.evia-time-timeline-v1 .evia-timeline-event{padding-left:60px!important}#archDetailContent.evia-time-timeline-v1 .evia-timeline-month-heading{margin-left:60px!important}#archDetailContent.evia-time-timeline-v1 .evia-month-pack{margin-left:60px!important;grid-template-columns:minmax(0,1fr) auto!important}#archDetailContent.evia-time-timeline-v1 .evia-month-pack button{width:auto!important}}
  `;
  document.head.appendChild(style);
}

function renderTimelineNav(){
  removeTimelineNav();
  if(!timelineEvidenceMode||timelineGroupEntries.length<2)return;
  const actions=document.querySelector('#portfolioViewer .portfolio-viewer-actions');
  if(!actions)return;
  const nav=document.createElement('div');
  nav.className='evia-timeline-evidence-nav';
  nav.innerHTML='<button type="button" data-evia-timeline-prev>Previous</button><span></span><button type="button" data-evia-timeline-next>Next</button>';
  actions.parentNode.insertBefore(nav,actions);
  timelineNav=nav;
  const prev=nav.querySelector('[data-evia-timeline-prev]');
  const next=nav.querySelector('[data-evia-timeline-next]');
  const label=nav.querySelector('span');
  prev.disabled=timelineGroupIndex<=0;
  next.disabled=timelineGroupIndex>=timelineGroupEntries.length-1;
  label.textContent=`${timelineGroupIndex+1} of ${timelineGroupEntries.length}`;
  prev.addEventListener('click',()=>showTimelineEntry(timelineGroupIndex-1));
  next.addEventListener('click',()=>showTimelineEntry(timelineGroupIndex+1));
}
async function showTimelineEntry(index){
  if(!timelineEvidenceMode||!timelineGroupEntries.length)return;
  timelineGroupIndex=Math.max(0,Math.min(timelineGroupEntries.length-1,index));
  const entry=timelineGroupEntries[timelineGroupIndex];
  try{
    await openEvidenceViewer(entry);
    if(typeof portfolioTitle!=='undefined'&&portfolioTitle)portfolioTitle.textContent=timelineGroupEntries.length>1?`Evidence ${timelineGroupIndex+1} of ${timelineGroupEntries.length}`:'Evidence';
    renderTimelineNav();
  }catch(error){console.error('Could not open timeline evidence',error)}
}
async function openTimelineEvidence(entries){
  if(!Array.isArray(entries)||!entries.length)return;
  timelineEvidenceMode=true;
  timelineGroupEntries=entries.slice();
  timelineGroupIndex=0;
  try{
    await openPortfolio();
    await showTimelineEntry(0);
  }catch(error){
    resetTimelineEvidenceMode();
    console.error('Could not open evidence from Time',error);
  }
}
async function entriesForEvent(id){
  try{
    const entries=await getPortfolioEntries();
    return entries.filter(entry=>entryEventId(entry)===id);
  }catch{return[]}
}
async function closeTimelineEvidence(){
  if(!timelineEvidenceMode)return;
  const refresh=timelineNeedsRefresh;
  try{closePortfolio(false)}catch{}
  resetTimelineEvidenceMode();
  if(refresh){try{await window.EviaMonthlyPacks?.renderTimeTimeline?.()}catch{}}
}
async function deleteTimelineEvidence(event){
  if(!timelineEvidenceMode)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const current=timelineGroupEntries[timelineGroupIndex];
  const id=current?.id;
  try{await deleteActiveEvidence()}catch(error){console.error('Could not delete timeline evidence',error);return}
  if(typeof portfolioViewer!=='undefined'&&portfolioViewer?.classList.contains('open'))return;
  if(id)timelineGroupEntries=timelineGroupEntries.filter(entry=>entry?.id!==id);
  timelineNeedsRefresh=true;
  if(!timelineGroupEntries.length){await closeTimelineEvidence();return}
  timelineGroupIndex=Math.min(timelineGroupIndex,timelineGroupEntries.length-1);
  try{await showTimelineEntry(timelineGroupIndex)}catch{}
}
function bind(){
  const root=document.getElementById('archDetailContent');
  if(root&&!root.dataset.eviaTimeEvidenceEditBound){
    root.dataset.eviaTimeEvidenceEditBound='1';
    root.addEventListener('click',async event=>{
      const button=event.target.closest('.evia-timeline-event.learner.evidence .evia-timeline-event-button');
      if(!button)return;
      const article=button.closest('.evia-timeline-event');
      const id=article?.dataset?.event||'';
      if(!id.startsWith('evidence:'))return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const entries=await entriesForEvent(id);
      if(entries.length)await openTimelineEvidence(entries);
    },true);
  }
  const back=document.getElementById('backButton');
  if(back&&!back.dataset.eviaTimeEvidenceBackBound){
    back.dataset.eviaTimeEvidenceBackBound='1';
    back.addEventListener('click',event=>{
      if(!timelineEvidenceMode)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      closeTimelineEvidence().catch(()=>{});
    },true);
  }
  const deleteButton=document.getElementById('portfolioDeleteEvidence');
  if(deleteButton&&!deleteButton.dataset.eviaTimeEvidenceDeleteBound){
    deleteButton.dataset.eviaTimeEvidenceDeleteBound='1';
    deleteButton.addEventListener('click',event=>{if(timelineEvidenceMode)deleteTimelineEvidence(event)},true);
  }
}
function boot(){addStyles();bind();window.EviaTimeEvidenceEdit=Object.freeze({version:VERSION})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
