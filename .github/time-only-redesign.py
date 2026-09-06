from pathlib import Path
import re

TIME = Path('evia-approved-time-monthly-packs-v1.js')
INDEX = Path('index.html')
MANIFEST = Path('evia-runtime-manifest.js')
WORKER = Path('service-worker.js')
TEST = Path('tests/time-only-redesign.spec.js')

text = TIME.read_text(encoding='utf-8')
start = text.index('function eventMarkup(event)')
end = text.index('function pdfSafe(value)')
new_renderer = r'''function ordinalDay(value){const d=dateFor(value);if(!d)return'';const n=d.getDate(),m=n%100,s=m>=11&&m<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th';return`${n}${s}`}
function clampPercent(value){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):null}
function timeProgressPercent(){try{if(typeof courseProgressPercent==='function')return clampPercent(courseProgressPercent())}catch{}return clampPercent(courseTimePercent(new Date()))}
function learningProgressPercent(){const required=totalRequiredLearning();if(!(Number.isFinite(required)&&required>0))return null;let learner=0;try{learner=typeof learnerLearningHours==='function'?Number(learnerLearningHours()):getLearningEntries().reduce((sum,item)=>sum+(Number(item?.hours)||0),0)}catch{learner=getLearningEntries().reduce((sum,item)=>sum+(Number(item?.hours)||0),0)}const attendance=currentAttendance(),college=Number(attendance?.collegeLearningHours)||0;return clampPercent(((Math.max(0,college)+Math.max(0,Number.isFinite(learner)?learner:0))/required)*100)}
function monthMarkerText(key){const d=monthStart(key);return d?{month:d.toLocaleDateString(undefined,{month:'short'}).toUpperCase(),year:String(d.getFullYear())}:{month:key,year:''}}
function trackPosition(value,start,end){const d=dateFor(value);if(!d||!start||!end||end<=start)return 0;return clampPercent(((d-start)/(end-start))*100)||0}
function compactEventMarkup(event,y){const assistant=assistantClass(event.assistant),klass=assistant?` assistant ${assistant}`:` learner ${esc(event.kind)}`;return`<article class="evia-timeline-event${klass}" data-event="${esc(event.id)}" style="bottom:${Math.round(y)}px"><span class="evia-timeline-dot" aria-hidden="true"></span><span class="evia-timeline-connector" aria-hidden="true"></span><button class="evia-timeline-event-button" type="button" aria-expanded="false"><span aria-hidden="true">[</span><strong>${esc(`${ordinalDay(event.date)} - ${event.title}`)}</strong><span aria-hidden="true">]</span></button><div class="evia-timeline-event-detail" hidden>${eventDetailMarkup(event)}</div></article>`}
function injectStyles(){const old=document.getElementById('eviaTimeMonthlyV1Styles');if(old)old.remove();const style=document.createElement('style');style.id='eviaTimeMonthlyV1Styles';style.textContent=`
body.evia-time-fullscreen #backButton{display:none!important}
#archDetailPanel.evia-time-fullscreen{position:absolute!important;inset:0!important;padding:0!important;align-items:stretch!important;justify-content:stretch!important;background:#fff!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;z-index:19!important}
#archDetailPanel.evia-time-fullscreen .arch-detail-card{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;border:0!important;border-radius:0!important;padding:0!important;gap:0!important;box-shadow:none!important;background:#fff!important}
#archDetailPanel.evia-time-fullscreen .arch-detail-title{display:none!important}
#archDetailPanel.evia-time-fullscreen .arch-detail-content{display:block!important;flex:1 1 auto!important;min-height:0!important;width:100%!important;height:100%!important;padding:0!important;gap:0!important;overflow:hidden!important}
.evia-time-screen{position:relative;width:100%;height:100%;background:#fff;color:rgba(45,45,45,.72);overflow:hidden}
.evia-time-topbar{position:absolute;z-index:30;left:0;right:0;top:0;min-height:66px;padding:calc(max(10px,env(safe-area-inset-top)) + 2px) max(12px,env(safe-area-inset-right)) 8px max(12px,env(safe-area-inset-left));display:flex;align-items:flex-start;justify-content:space-between;gap:10px;background:linear-gradient(180deg,#fff 72%,rgba(255,255,255,.96) 88%,rgba(255,255,255,0))}
.evia-time-key{display:flex;align-items:center;flex-wrap:wrap;gap:8px 11px;padding-top:5px;font-size:10px;color:rgba(45,45,45,.50)}.evia-time-key>strong{font-size:11px;color:rgba(45,45,45,.72)}.evia-time-key-item{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.evia-time-key-line{display:inline-block;height:15px;border-radius:999px}.evia-time-key-line.course{width:2px;background:#4baf73}.evia-time-key-line.time{width:4px;background:#f5c400}.evia-time-key-line.learning{width:2px;background:#4f8edb}
.evia-time-close{width:44px;height:44px;flex:0 0 44px;border:0;background:transparent;color:rgba(45,45,45,.62);font-size:28px;font-weight:300;line-height:1;display:grid;place-items:center;cursor:pointer;border-radius:50%}
.evia-time-scroll{position:absolute;inset:0;overflow-y:auto;overscroll-behavior:contain;padding:72px max(10px,env(safe-area-inset-right)) calc(max(18px,env(safe-area-inset-bottom)) + 10px) max(10px,env(safe-area-inset-left));scroll-behavior:smooth}.evia-time-stage{position:relative;width:100%;min-width:0}
.evia-time-tracks{position:absolute;left:34px;top:34px;bottom:34px;width:18px;z-index:1;pointer-events:none}.evia-time-track{position:absolute;bottom:0;border-radius:999px}.evia-time-track.base{height:100%}.evia-time-track.fill{z-index:2}.evia-time-track.course{left:0;width:2px}.evia-time-track.time{left:6px;width:4px}.evia-time-track.learning{left:14px;width:2px}.evia-time-track.base.course{background:rgba(75,175,115,.16)}.evia-time-track.base.time{background:rgba(245,196,0,.18)}.evia-time-track.base.learning{background:rgba(79,142,219,.16)}.evia-time-track.fill.course{background:#4baf73}.evia-time-track.fill.time{background:#f5c400}.evia-time-track.fill.learning{background:#4f8edb}
.evia-time-month-marker{position:absolute;left:42px;z-index:6;transform:translate(-50%,50%);display:flex;flex-direction:column;align-items:center;gap:3px}.evia-time-month-circle{width:46px;height:46px;border-radius:50%;border:2px solid rgba(245,196,0,.60);background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;box-shadow:0 0 0 3px rgba(255,255,255,.88)}.evia-time-month-circle strong{font-size:10px;letter-spacing:.05em;color:rgba(45,45,45,.72)}.evia-time-month-circle small{font-size:7.5px;margin-top:3px;color:rgba(45,45,45,.42)}.evia-time-month-marker.future .evia-time-month-circle{border-color:rgba(45,45,45,.13)}.evia-time-month-marker.future .evia-time-month-circle strong,.evia-time-month-marker.future .evia-time-month-circle small{color:rgba(45,45,45,.28)}
.evia-time-pack-button{min-height:22px;border:0;background:transparent;color:rgba(45,45,45,.36);font-size:7.5px;font-weight:700;padding:2px 4px;cursor:pointer}.evia-time-pack-button:disabled{opacity:.35}.evia-time-pack-status{position:absolute;left:56px;top:18px;width:150px;font-size:8px;color:rgba(45,45,45,.42)}
.evia-time-today{position:absolute;left:42px;z-index:8;transform:translate(-50%,50%);width:12px;height:12px;border-radius:50%;background:#f5c400;border:3px solid #fff;box-shadow:0 0 0 1px rgba(245,196,0,.72)}.evia-time-today::after{content:'Today';position:absolute;right:17px;top:50%;transform:translateY(-50%);font-size:8px;font-weight:800;color:rgba(45,45,45,.42);white-space:nowrap}.evia-time-boundary{position:absolute;left:72px;z-index:3;font-size:8.5px;font-weight:700;color:rgba(45,45,45,.34);transform:translateY(50%)}.evia-time-boundary.end{transform:translateY(-50%)}
.evia-timeline-event{position:absolute;left:42px;right:8px;z-index:5;min-height:28px;transform:translateY(50%);display:flex;align-items:center}.evia-timeline-dot{position:absolute!important;left:-3px!important;top:50%!important;transform:translateY(-50%)!important;width:7px!important;height:7px!important;border:0!important;border-radius:50%!important;background:#f5c400!important;box-shadow:0 0 0 2px #fff!important;z-index:3!important}.evia-timeline-event.assistant.milos .evia-timeline-dot{background:#4f8edb!important}.evia-timeline-event.assistant.symi .evia-timeline-dot{background:#4baf73!important}.evia-timeline-event.assistant.tinos .evia-timeline-dot{background:#e9871b!important}.evia-timeline-event.learning .evia-timeline-dot,.evia-timeline-event.college .evia-timeline-dot{background:#4f8edb!important}.evia-timeline-connector{width:31px;height:1px;margin-left:4px;flex:0 0 31px;background:rgba(45,45,45,.22)}
.evia-timeline-event-button{min-width:0;min-height:28px!important;max-width:calc(100% - 35px);border:1px solid rgba(45,45,45,.10)!important;border-radius:8px!important;background:rgba(255,255,255,.96)!important;box-shadow:none!important;padding:4px 7px!important;color:rgba(45,45,45,.62)!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:3px!important;text-align:left!important;cursor:pointer!important}.evia-timeline-event-button strong{min-width:0;font-size:9.5px!important;font-weight:600!important;line-height:1.2!important;color:rgba(45,45,45,.68)!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.evia-timeline-event-button>span[aria-hidden="true"]{font-size:10px;color:rgba(45,45,45,.30)}.evia-timeline-event-detail{position:absolute!important;left:35px!important;top:31px!important;z-index:20!important;width:min(310px,calc(100vw - 98px))!important;margin:0!important;padding:8px 9px!important;border:1px solid rgba(45,45,45,.08)!important;border-radius:10px!important;background:#fff!important;box-shadow:0 7px 22px rgba(0,0,0,.08)!important;font-size:8.5px!important;line-height:1.35!important;color:rgba(45,45,45,.54)!important}
.evia-time-empty{position:absolute;left:78px;right:16px;top:50%;transform:translateY(-50%);font-size:11px;line-height:1.45;color:rgba(45,45,45,.42)}.evia-timeline-evidence-nav{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 2px}.evia-timeline-evidence-nav button{min-width:72px;min-height:36px;border:1px solid rgba(245,196,0,.30);border-radius:999px;background:#fff;color:#333;font-size:11px;font-weight:700;padding:6px 10px}.evia-timeline-evidence-nav button:disabled{opacity:.35}.evia-timeline-evidence-nav span{min-width:58px;text-align:center;font-size:10px;font-weight:700;color:#505050}body.evia-time-evidence-open #backButton{display:flex!important;z-index:60!important}
@media(max-width:360px){.evia-time-key{gap:6px 8px;font-size:9px}.evia-time-tracks{left:28px}.evia-time-month-marker,.evia-time-today{left:36px}.evia-timeline-event{left:36px}.evia-time-boundary{left:66px}.evia-time-month-circle{width:42px;height:42px}.evia-timeline-connector{width:27px;flex-basis:27px}.evia-timeline-event-button{max-width:calc(100% - 31px)}}html.evia-reduce-motion .evia-time-scroll{scroll-behavior:auto!important}`;document.head.appendChild(style)}
let timelineEvidenceMode=false,timelineGroupEntries=[],timelineGroupIndex=0,timelineNav=null,timelineNeedsRefresh=false;
function entryEventId(entry){return`evidence:${dayKey(evidenceDate(entry))}:${pathKey(entry?.path)}:learner`}
function removeTimelineNav(){timelineNav?.remove();timelineNav=null}
function resetTimelineEvidence(){timelineEvidenceMode=false;timelineGroupEntries=[];timelineGroupIndex=0;timelineNeedsRefresh=false;removeTimelineNav();document.body.classList.remove('evia-time-evidence-open')}
function renderTimelineNav(){removeTimelineNav();if(!timelineEvidenceMode||timelineGroupEntries.length<2)return;const actions=document.querySelector('#portfolioViewer .portfolio-viewer-actions');if(!actions)return;const nav=document.createElement('div');nav.className='evia-timeline-evidence-nav';nav.innerHTML='<button type="button" data-evia-timeline-prev>Previous</button><span></span><button type="button" data-evia-timeline-next>Next</button>';actions.parentNode.insertBefore(nav,actions);timelineNav=nav;const prev=nav.querySelector('[data-evia-timeline-prev]'),next=nav.querySelector('[data-evia-timeline-next]'),label=nav.querySelector('span');prev.disabled=timelineGroupIndex<=0;next.disabled=timelineGroupIndex>=timelineGroupEntries.length-1;label.textContent=`${timelineGroupIndex+1} of ${timelineGroupEntries.length}`;prev.addEventListener('click',()=>showTimelineEntry(timelineGroupIndex-1));next.addEventListener('click',()=>showTimelineEntry(timelineGroupIndex+1))}
async function showTimelineEntry(index){if(!timelineEvidenceMode||!timelineGroupEntries.length)return;timelineGroupIndex=Math.max(0,Math.min(timelineGroupEntries.length-1,index));const entry=timelineGroupEntries[timelineGroupIndex];await openEvidenceViewer(entry);if(typeof portfolioTitle!=='undefined'&&portfolioTitle)portfolioTitle.textContent=timelineGroupEntries.length>1?`Evidence ${timelineGroupIndex+1} of ${timelineGroupEntries.length}`:'Evidence';renderTimelineNav()}
async function openTimelineEvidence(entries){if(!Array.isArray(entries)||!entries.length)return;timelineEvidenceMode=true;timelineGroupEntries=entries.slice();timelineGroupIndex=0;document.body.classList.add('evia-time-evidence-open');await openPortfolio();await showTimelineEntry(0)}
async function entriesForEvent(id){const entries=await getPortfolioEntries();return entries.filter(entry=>entryEventId(entry)===id)}
async function closeTimelineEvidence(){if(!timelineEvidenceMode)return;const refresh=timelineNeedsRefresh;try{closePortfolio(false)}catch{}resetTimelineEvidence();if(refresh)await renderTimeTimeline()}
function enterTimeFullscreen(){const panel=document.getElementById('archDetailPanel');if(!panel)return;panel.classList.add('evia-time-fullscreen');document.body.classList.add('evia-time-fullscreen')}
function exitTimeFullscreen(){const panel=document.getElementById('archDetailPanel');panel?.classList.remove('evia-time-fullscreen');document.body.classList.remove('evia-time-fullscreen','evia-time-evidence-open')}
function closeTime(){exitTimeFullscreen();try{if(typeof closeArchDetail==='function')closeArchDetail()}catch{}}
async function renderTimeTimeline(){try{if(typeof openArchShell==='function')openArchShell('Time')}catch{}try{if(typeof archDetailStack!=='undefined')archDetailStack=[]}catch{}enterTimeFullscreen();const root=document.getElementById('archDetailContent');if(!root)return;root.classList.add('evia-time-timeline-v1');root.innerHTML='<div class="evia-time-screen"><div class="evia-time-topbar"><div class="evia-time-key"><strong>Key</strong><span class="evia-time-key-item"><i class="evia-time-key-line course"></i>Course</span><span class="evia-time-key-item"><i class="evia-time-key-line time"></i>Time</span><span class="evia-time-key-item"><i class="evia-time-key-line learning"></i>Learning</span></div><button class="evia-time-close" type="button" data-evia-time-close aria-label="Close Time">×</button></div><div class="evia-time-scroll"><div class="evia-time-empty">Loading timeline…</div></div></div>';const [entries,learning]=await Promise.all([getEvidenceEntries(),Promise.resolve(getLearningEntries())]),dates=profileDates(),start=dateFor(dates.start),end=dateFor(dates.end),scroll=root.querySelector('.evia-time-scroll');if(!start||!end||end<=start){scroll.innerHTML='<div class="evia-time-stage" style="height:520px"><div class="evia-time-empty">Add the course start and end dates in Learner Profile to show the Time timeline.</div></div>';return}const events=buildTimelineEvents(entries,learning),months=monthKeysBetween(start,end),time=timeProgressPercent(),course=currentCourseProgress(),learn=learningProgressPercent(),stageHeight=Math.max(900,months.length*150+events.length*24),pad=34,height=stageHeight-(pad*2),y=p=>pad+(height*((clampPercent(p)||0)/100)),currentMonth=monthKey(new Date());let lastY=pad-31;const eventRows=[];for(const event of events){const pos=trackPosition(event.date,start,end),monthPos=trackPosition(monthStart(monthKey(event.date)),start,end),base=y(pos),floor=y(monthPos)+28,row=Math.max(base,floor,lastY+30);lastY=Math.min(stageHeight-pad-8,row);eventRows.push(compactEventMarkup(event,lastY))}const monthRows=months.map(key=>{const marker=y(trackPosition(monthStart(key),start,end)),txt=monthMarkerText(key),future=key>currentMonth,data=monthData(key,entries,learning,events),has=data.evidence.length||data.learning.length;return`<div class="evia-time-month-marker${future?' future':''}" style="bottom:${Math.round(marker)}px" data-month="${esc(key)}"><div class="evia-time-month-circle"><strong>${esc(txt.month)}</strong><small>${esc(txt.year)}</small></div>${has&&!future?`<button class="evia-time-pack-button" type="button" data-evia-month-pack="${esc(key)}">Pack</button><span class="evia-time-pack-status" aria-live="polite"></span>`:''}</div>`}).join('');const today=time===null?'':`<span class="evia-time-today" data-evia-today="true" style="bottom:${Math.round(y(time))}px" aria-label="Today"></span>`;scroll.innerHTML=`<div class="evia-time-stage" style="height:${Math.round(stageHeight)}px"><div class="evia-time-tracks" aria-hidden="true"><span class="evia-time-track base course"></span><span class="evia-time-track base time"></span><span class="evia-time-track base learning"></span><span class="evia-time-track fill course" style="height:${course??0}%"></span><span class="evia-time-track fill time" style="height:${time??0}%"></span><span class="evia-time-track fill learning" style="height:${learn??0}%"></span></div><span class="evia-time-boundary start" style="bottom:${pad}px">Course start</span><span class="evia-time-boundary end" style="bottom:${stageHeight-pad}px">Course end</span>${monthRows}${today}${eventRows.join('')}${events.length?'':'<div class="evia-time-empty">No evidence or learning has been recorded on the timeline yet.</div>'}</div>`;const screen=root.querySelector('.evia-time-screen');if(screen){screen.dataset.courseProgress=course===null?'':String(course);screen.dataset.timeProgress=time===null?'':String(time);screen.dataset.learningProgress=learn===null?'':String(learn)}requestAnimationFrame(()=>{const marker=scroll.querySelector('[data-evia-today="true"]');if(marker)scroll.scrollTop=Math.max(0,marker.offsetTop-(scroll.clientHeight*.56));else scroll.scrollTop=scroll.scrollHeight})}
'''
text = text[:start] + new_renderer + text[end:]

bind_start = text.index('function bind(){')
boot_start = text.index('function boot(){', bind_start)
boot_end = text.index("if(document.readyState==='loading')", boot_start)
new_bind = r'''function bind(){const time=document.getElementById('timeArch');if(time&&!time.dataset.eviaTimelineBound){time.dataset.eviaTimelineBound='1';time.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();renderTimeTimeline().catch(error=>console.error('Could not render Evia timeline',error))},true)}const root=document.getElementById('archDetailContent');if(root&&!root.dataset.eviaTimelineActionBound){root.dataset.eviaTimelineActionBound='1';root.addEventListener('click',async event=>{const close=event.target.closest('[data-evia-time-close]');if(close){event.preventDefault();event.stopImmediatePropagation();closeTime();return}const eventButton=event.target.closest('.evia-timeline-event-button');if(eventButton){const article=eventButton.closest('.evia-timeline-event'),id=article?.dataset?.event||'';if(id.startsWith('evidence:')&&article?.classList.contains('learner')){event.preventDefault();event.stopImmediatePropagation();const entries=await entriesForEvent(id);if(entries.length)await openTimelineEvidence(entries);return}const detail=article?.querySelector('.evia-timeline-event-detail'),open=eventButton.getAttribute('aria-expanded')==='true';eventButton.setAttribute('aria-expanded',String(!open));if(detail)detail.hidden=open;return}const pack=event.target.closest('[data-evia-month-pack]');if(pack){const status=pack.closest('.evia-time-month-marker')?.querySelector('.evia-time-pack-status');buildMonthlyPack(pack.dataset.eviaMonthPack,status,pack);return}const unitButton=event.target.closest('[data-evia-unit-pdf]');if(unitButton){const status=unitButton.closest('.evia-unit-pdf-wrap')?.querySelector('.evia-unit-pdf-status');downloadUnitPdf(unitButton.dataset.eviaUnitPdf,status,unitButton)}})}const back=document.getElementById('backButton');if(back&&!back.dataset.eviaTimelineEvidenceBackBound){back.dataset.eviaTimelineEvidenceBackBound='1';back.addEventListener('click',event=>{if(!timelineEvidenceMode)return;event.preventDefault();event.stopImmediatePropagation();closeTimelineEvidence().catch(()=>{})},true)}const del=document.getElementById('portfolioDeleteEvidence');if(del&&!del.dataset.eviaTimelineEvidenceDeleteBound){del.dataset.eviaTimelineEvidenceDeleteBound='1';del.addEventListener('click',async event=>{if(!timelineEvidenceMode)return;event.preventDefault();event.stopImmediatePropagation();const current=timelineGroupEntries[timelineGroupIndex],id=current?.id;await deleteActiveEvidence();if(typeof portfolioViewer!=='undefined'&&portfolioViewer?.classList.contains('open'))return;if(id)timelineGroupEntries=timelineGroupEntries.filter(entry=>entry?.id!==id);timelineNeedsRefresh=true;if(!timelineGroupEntries.length){await closeTimelineEvidence();return}timelineGroupIndex=Math.min(timelineGroupIndex,timelineGroupEntries.length-1);await showTimelineEntry(timelineGroupIndex)},true)}document.addEventListener('click',event=>{const unitButton=event.target.closest('[data-nvq-unit]');if(unitButton){const unit=unitButton.dataset.nvqUnit;lastUnitContext={unit,label:getCourseMeta()?.unitTitles?.[unit]||`Unit ${unit}`};setTimeout(()=>injectUnitPdfButton(lastUnitContext.unit,lastUnitContext.label),30)}if(event.target.closest('.arch-detail-back,.back-button')&&!timelineEvidenceMode)lastUnitContext=null},false);const panel=document.getElementById('archDetailPanel');if(panel)new MutationObserver(()=>{if(!panel.classList.contains('open'))exitTimeFullscreen()}).observe(panel,{attributes:true,attributeFilter:['class']});const observer=new MutationObserver(()=>{const title=clean(document.getElementById('archDetailTitle')?.textContent);if(lastUnitContext&&title===clean(lastUnitContext.label))injectUnitPdfButton(lastUnitContext.unit,lastUnitContext.label)});observer.observe(document.getElementById('archDetailPanel')||document.body,{subtree:true,childList:true,characterData:true})}
function boot(){injectStyles();bind();window.EviaMonthlyPacks=Object.freeze({version:VERSION,renderTimeTimeline,buildMonthlyPack,downloadUnitPdf})}
'''
text = text[:bind_start] + new_bind + text[boot_end:]
TIME.write_text(text, encoding='utf-8')

index = INDEX.read_text(encoding='utf-8')
a_marker = '    function renderTimePage() {'
b_marker = '    function renderCoursePage() {'
if index.count(a_marker) != 1 or index.count(b_marker) != 1:
    raise SystemExit('Original Time renderer boundaries are not unique')
a = index.index(a_marker)
b = index.index(b_marker, a)
index = index[:a] + index[b:]
listener = "    timeArch.addEventListener('click', renderTimePage);\n"
if index.count(listener) != 1:
    raise SystemExit('Original Time listener is not unique')
index = index.replace(listener, '', 1)
for selector in ['time-track','time-track-fill','time-epa-marker','time-epa-marker::after']:
    pattern = re.compile(r'\n    \.' + re.escape(selector) + r' \{.*?\n    \}\n', re.S)
    index, count = pattern.subn('\n', index, count=1)
    if count != 1:
        raise SystemExit(f'Expected one old .{selector} CSS block, found {count}')
label = "    .time-label-row { display:flex; justify-content:space-between; gap:10px; font-size:11px; color:rgba(45,45,45,.56); }\n"
if index.count(label) != 1:
    raise SystemExit('Expected one old Time label CSS rule')
index = index.replace(label, '', 1)
polish = '.time-track{height:18px;margin-top:26px;box-shadow:inset 0 1px 3px rgba(0,0,0,.05)}.time-track-fill{box-shadow:0 2px 8px rgba(245,196,0,.18)}'
if index.count(polish) != 1:
    raise SystemExit('Expected one old Time polish rule')
index = index.replace(polish, '', 1)
if 'function renderTimePage()' in index or "timeArch.addEventListener('click', renderTimePage)" in index or '.time-epa-marker' in index:
    raise SystemExit('Superseded Time source still remains in index.html')
INDEX.write_text(index, encoding='utf-8')

manifest = MANIFEST.read_text(encoding='utf-8')
old_entry = "'./evia-approved-time-monthly-packs-v1.js'"
new_entry = "'./evia-approved-time-monthly-packs-v1.js?v=2'"
if manifest.count(old_entry) != 1:
    raise SystemExit('Expected one Time runtime entry')
MANIFEST.write_text(manifest.replace(old_entry,new_entry,1), encoding='utf-8')

worker = WORKER.read_text(encoding='utf-8')
if worker.count("const C='evia-pwa-v84'") != 1 or worker.count("url.searchParams.set('__evia_refresh','84')") != 1:
    raise SystemExit('Expected restored v84 worker markers')
worker = worker.replace("const C='evia-pwa-v84'", "const C='evia-pwa-v85'", 1)
worker = worker.replace("url.searchParams.set('__evia_refresh','84')", "url.searchParams.set('__evia_refresh','85')", 1)
WORKER.write_text(worker, encoding='utf-8')

TEST.write_text(r'''const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test('Time opens as the approved full-page three-line timeline', async ({ page }) => {
  await page.goto('/?time_only=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#eviaStage')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => Boolean(window.EviaMonthlyPacks?.renderTimeTimeline)).catch(() => false), { timeout: 10000 }).toBeTruthy();
  await page.evaluate(() => {
    learnerProfile.startDate = '2026-01-01';
    learnerProfile.endDate = '2026-12-31';
    if (typeof saveLearnerProfile === 'function') saveLearnerProfile();
  });
  await page.locator('#timeArch').click();
  await expect(page.locator('.evia-time-screen')).toBeVisible();
  await expect(page.locator('[data-evia-time-close]')).toBeVisible();
  await expect(page.locator('.evia-time-key')).toContainText('Course');
  await expect(page.locator('.evia-time-key')).toContainText('Time');
  await expect(page.locator('.evia-time-key')).toContainText('Learning');
  await expect(page.locator('.evia-time-track.fill.course')).toHaveCSS('width', '2px');
  await expect(page.locator('.evia-time-track.fill.time')).toHaveCSS('width', '4px');
  await expect(page.locator('.evia-time-track.fill.learning')).toHaveCSS('width', '2px');
  await expect(page.locator('.evia-time-month-marker[data-month="2026-09"] .evia-time-month-circle')).toContainText('SEP');
  await expect(page.locator('.evia-time-month-marker[data-month="2026-09"] .evia-time-month-circle')).toContainText('2026');
  await expect(page.locator('.evia-time-overview')).toHaveCount(0);
  await page.locator('[data-evia-time-close]').click();
  await expect(page.locator('#archDetailPanel')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#eviaStage')).toBeVisible();
  await expect(page.locator('#bottomArches')).toBeVisible();
  await expect(page.locator('#naxosArch')).toBeVisible();
});

test('Time has one source of truth and no superseded renderer', async () => {
  const html = fs.readFileSync('index.html','utf8');
  const time = fs.readFileSync('evia-approved-time-monthly-packs-v1.js','utf8');
  const manifest = fs.readFileSync('evia-runtime-manifest.js','utf8');
  expect(html).not.toContain('function renderTimePage()');
  expect(html).not.toContain("timeArch.addEventListener('click', renderTimePage)");
  expect(html).not.toContain('.time-epa-marker');
  expect((time.match(/function renderTimeTimeline\(/g)||[]).length).toBe(1);
  expect((manifest.match(/evia-approved-time-monthly-packs-v1\.js/g)||[]).length).toBe(1);
});
''', encoding='utf-8')
