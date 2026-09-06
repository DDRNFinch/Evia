from pathlib import Path
import re

TIME = Path('evia-approved-time-monthly-packs-v1.js')
TEST = Path('tests/time-only-redesign.spec.js')
EPA_TEST = Path('tests/epa-menu.spec.js')
MANIFEST = Path('evia-runtime-manifest.js')
INDEX = Path('index.html')

time = TIME.read_text(encoding='utf-8')

def sub_once(pattern, repl, text, label, flags=re.S):
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, got {count}')
    return out

time = sub_once(
    r"function timelineMonthRange\(entries,learning\)\{.*?\}\nfunction pathKey",
    """function timelineMonthRange(entries,learning){const dates=profileDates(),today=new Date(),evidenceDates=(Array.isArray(entries)?entries:[]).map(entry=>dateFor(evidenceDate(entry))).filter(Boolean).sort((a,b)=>a-b),start=dateFor(dates.start)||evidenceDates[0]||today,courseEnd=dateFor(dates.end),latestEvidence=evidenceDates.at(-1)||null;let end=courseEnd||latestEvidence||start;if(latestEvidence&&latestEvidence>end)end=latestEvidence;if(end<start)end=start;const keys=monthKeysBetween(start,end);return keys.length?keys:[monthKey(start)]}
function pathKey""",
    time,
    'timeline month range'
)

new_styles = r"""function injectStyles(){const old=document.getElementById('eviaTimeMonthlyV1Styles');if(old)old.remove();const style=document.createElement('style');style.id='eviaTimeMonthlyV1Styles';style.textContent=`
body.evia-time-fullscreen #backButton{display:none!important}
#archDetailPanel.evia-time-fullscreen{position:absolute!important;inset:0!important;padding:0!important;align-items:stretch!important;justify-content:stretch!important;background:#fff!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;z-index:19!important}
#archDetailPanel.evia-time-fullscreen .arch-detail-card{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;border:0!important;border-radius:0!important;padding:0!important;gap:0!important;box-shadow:none!important;background:#fff!important}
#archDetailPanel.evia-time-fullscreen .arch-detail-title{display:none!important}
#archDetailPanel.evia-time-fullscreen .arch-detail-content{display:block!important;flex:1 1 auto!important;min-height:0!important;width:100%!important;height:100%!important;padding:0!important;gap:0!important;overflow:hidden!important}
.evia-time-screen{position:relative;width:100%;height:100%;background:#fff;color:rgba(45,45,45,.78);overflow:hidden}
.evia-time-topbar{position:absolute;z-index:30;left:0;right:0;top:0;height:64px;padding:calc(max(10px,env(safe-area-inset-top)) + 2px) max(14px,env(safe-area-inset-right)) 8px max(18px,env(safe-area-inset-left));display:flex;align-items:flex-start;justify-content:space-between;background:linear-gradient(180deg,#fff 78%,rgba(255,255,255,.96) 92%,rgba(255,255,255,0))}
.evia-time-title{padding-top:7px;font-size:14px;font-weight:750;letter-spacing:.01em;color:rgba(45,45,45,.76)}
.evia-time-close{width:44px;height:44px;flex:0 0 44px;border:0;background:transparent;color:rgba(45,45,45,.62);font-size:28px;font-weight:300;line-height:1;display:grid;place-items:center;cursor:pointer;border-radius:50%}
.evia-time-browser{position:absolute;left:0;right:0;top:64px;bottom:calc(clamp(70px,10dvh,92px) + 72px);display:flex;flex-direction:column;min-height:0;padding:0 max(12px,env(safe-area-inset-right)) 0 max(12px,env(safe-area-inset-left));overflow:hidden}
.evia-time-month-summary{flex:0 0 auto;padding:8px 6px 10px;border-bottom:1px solid rgba(45,45,45,.06)}
.evia-time-month-heading{font-size:19px;font-weight:760;line-height:1.15;color:rgba(45,45,45,.82)}
.evia-time-month-count{margin-top:4px;font-size:10.5px;font-weight:600;color:rgba(45,45,45,.42)}
.evia-time-evidence-list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:10px 4px 18px;display:flex;flex-direction:column;gap:8px;scrollbar-width:none}
.evia-time-evidence-list::-webkit-scrollbar{display:none}
.evia-time-section-label{padding:6px 4px 2px;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(45,45,45,.34)}
.evia-time-evidence-card{width:100%;min-height:66px;border:1px solid rgba(45,45,45,.08);border-radius:16px;background:#fff;box-shadow:0 5px 16px rgba(45,45,45,.055);padding:9px 11px;display:grid;grid-template-columns:58px minmax(0,1fr) auto;align-items:center;gap:9px;text-align:left;color:inherit;cursor:pointer}
.evia-time-evidence-date{font-size:10px;font-weight:800;line-height:1.2;color:#b58e00;text-align:center}
.evia-time-evidence-date small{display:block;margin-top:3px;font-size:8px;font-weight:650;color:rgba(45,45,45,.34)}
.evia-time-evidence-copy{min-width:0}.evia-time-evidence-copy strong{display:block;font-size:11px;font-weight:720;line-height:1.28;color:rgba(45,45,45,.76)}.evia-time-evidence-copy small{display:block;margin-top:4px;font-size:8.8px;line-height:1.3;color:rgba(45,45,45,.42);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.evia-time-evidence-action{font-size:8.5px;font-weight:800;white-space:nowrap;color:rgba(45,45,45,.38)}
.evia-time-empty-month{margin:auto;padding:26px 20px;text-align:center;font-size:11px;line-height:1.5;color:rgba(45,45,45,.42)}
.evia-time-activity-card{border:1px solid rgba(45,45,45,.065);border-radius:14px;background:#fafaf8;overflow:hidden}
.evia-time-activity-button{width:100%;min-height:54px;border:0;background:transparent;padding:8px 11px;display:grid;grid-template-columns:58px minmax(0,1fr);align-items:center;gap:9px;text-align:left;color:inherit;cursor:pointer}
.evia-time-activity-button span{font-size:9px;font-weight:800;color:rgba(45,45,45,.36);text-align:center}.evia-time-activity-button strong{font-size:10px;font-weight:700;line-height:1.3;color:rgba(45,45,45,.62)}
.evia-time-activity-detail{padding:0 11px 10px 78px;font-size:8.8px;line-height:1.4;color:rgba(45,45,45,.50)}.evia-time-activity-detail p{margin:5px 0}
.evia-time-download-zone{position:absolute;z-index:22;left:0;right:0;bottom:clamp(70px,10dvh,92px);height:72px;padding:8px max(18px,env(safe-area-inset-right)) 8px max(18px,env(safe-area-inset-left));display:flex;flex-direction:column;align-items:center;justify-content:flex-start;background:linear-gradient(180deg,rgba(255,255,255,0),#fff 18%,#fff)}
.evia-time-download-button{min-width:180px;min-height:40px;border:1.5px solid rgba(245,196,0,.38);border-radius:999px;background:#fffaf0;color:rgba(45,45,45,.70);font-size:11px;font-weight:760;padding:0 20px;box-shadow:0 4px 14px rgba(45,45,45,.05);cursor:pointer}
.evia-time-download-menu{position:absolute;bottom:58px;left:50%;transform:translateX(-50%);width:min(310px,calc(100vw - 34px));padding:7px;border:1px solid rgba(45,45,45,.09);border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(0,0,0,.12);display:grid;gap:6px}
.evia-time-download-menu[hidden]{display:none!important}.evia-time-download-option{min-height:44px;border:1px solid rgba(45,45,45,.07);border-radius:12px;background:#fff;color:rgba(45,45,45,.70);font-size:11px;font-weight:700;text-align:left;padding:0 14px;cursor:pointer}.evia-time-download-option:disabled{opacity:.35;cursor:default}.evia-time-download-option.primary{border-color:rgba(245,196,0,.28);background:#fffaf0}
.evia-time-download-status{min-height:15px;margin-top:4px;font-size:8.5px;line-height:1.25;text-align:center;color:rgba(45,45,45,.42)}
.evia-time-month-carousel{position:absolute;z-index:21;left:0;right:0;bottom:0;height:clamp(70px,10dvh,92px);display:flex;align-items:stretch;gap:10px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;padding:7px 15% calc(max(7px,env(safe-area-inset-bottom)) + 1px);background:#fff;touch-action:pan-x}
.evia-time-month-carousel::-webkit-scrollbar{display:none}
.evia-time-month-option{flex:0 0 70%;min-width:70%;height:100%;scroll-snap-align:center;scroll-snap-stop:always;border:1px solid rgba(45,45,45,.075);border-radius:18px;background:#fafaf8;color:rgba(45,45,45,.38);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;transform:scale(.90);opacity:.50;transition:transform .24s ease,opacity .24s ease,border-color .24s ease,background .24s ease;cursor:pointer}
.evia-time-month-option strong{font-size:14px;font-weight:760;line-height:1;color:inherit}.evia-time-month-option small{font-size:9px;font-weight:650;color:rgba(45,45,45,.30)}.evia-time-month-option em{font-style:normal;font-size:8px;font-weight:700;color:rgba(45,45,45,.28)}
.evia-time-month-option.active{transform:scale(1);opacity:1;border-color:rgba(245,196,0,.48);background:#fffaf0;color:rgba(45,45,45,.76);box-shadow:0 5px 16px rgba(45,45,45,.05)}.evia-time-month-option.active small,.evia-time-month-option.active em{color:rgba(45,45,45,.42)}
.evia-timeline-evidence-nav{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 2px}.evia-timeline-evidence-nav button{min-width:72px;min-height:36px;border:1px solid rgba(245,196,0,.30);border-radius:999px;background:#fff;color:#333;font-size:11px;font-weight:700;padding:6px 10px}.evia-timeline-evidence-nav button:disabled{opacity:.35}.evia-timeline-evidence-nav span{min-width:58px;text-align:center;font-size:10px;font-weight:700;color:#505050}body.evia-time-evidence-open #backButton{display:flex!important;z-index:60!important}
@media(max-width:360px){.evia-time-evidence-card{grid-template-columns:50px minmax(0,1fr) auto;padding:8px}.evia-time-evidence-date{font-size:9.4px}.evia-time-evidence-copy strong{font-size:10.4px}.evia-time-evidence-action{font-size:8px}.evia-time-activity-button{grid-template-columns:50px minmax(0,1fr)}.evia-time-activity-detail{padding-left:69px}}
html.evia-reduce-motion .evia-time-month-carousel{scroll-behavior:auto!important}`;document.head.appendChild(style)}
let selectedTimeMonth='',timeBrowserEntries=[],timeBrowserLearning=[],timeBrowserEvents=[],timeVisibleEntries=[],timeVisibleActivities=[],timeCarouselTimer=0;
let timelineEvidenceMode="""

time = sub_once(
    r"function injectStyles\(\)\{.*?\nlet timelineEvidenceMode=",
    new_styles,
    time,
    'Time browser styles'
)

helpers_and_render = r"""function monthEvidenceEntries(key,entries){return(Array.isArray(entries)?entries:[]).filter(entry=>sameMonth(evidenceDate(entry),key)).slice().sort((a,b)=>{const ad=dateFor(evidenceDate(a)),bd=dateFor(evidenceDate(b));return(ad?.getTime()||0)-(bd?.getTime()||0)})}
function timeMonthInitial(months){if(!months.length)return'';if(selectedTimeMonth&&months.includes(selectedTimeMonth))return selectedTimeMonth;const current=monthKey(new Date());if(months.includes(current))return current;const evidenceMonths=[...new Set(timeBrowserEntries.map(entry=>monthKey(evidenceDate(entry))).filter(Boolean))].sort();const latest=evidenceMonths.at(-1);if(latest&&months.includes(latest))return latest;if(current<months[0])return months[0];return months.at(-1)}
function timeEvidenceCardMarkup(entry,index){const d=dateFor(evidenceDate(entry)),day=d?String(d.getDate()).padStart(2,'0'):'--',month=d?d.toLocaleDateString(undefined,{month:'short'}).toUpperCase():'',type=evidenceKind(entry).replace(/^./,c=>c.toUpperCase()),path=evidencePathLabel(entry),codes=codesForPath(entry?.path),meta=[type,path,codes.length?codes.join(', '):''].filter(Boolean).join(' · ');return`<button class="evia-time-evidence-card" type="button" data-evia-time-entry="${index}"><span class="evia-time-evidence-date">${esc(day)}<small>${esc(month)}</small></span><span class="evia-time-evidence-copy"><strong>${esc(evidenceTitle(entry))}</strong><small>${esc(meta||'Evidence')}</small></span><span class="evia-time-evidence-action">View / edit</span></button>`}
function timeActivityMarkup(event,index){return`<article class="evia-time-activity-card ${esc(event.kind)}" data-evia-time-activity="${index}"><button class="evia-time-activity-button" type="button" aria-expanded="false"><span>${esc(shortDate(event.date))}</span><strong>${esc(event.title)}</strong></button><div class="evia-time-activity-detail" hidden>${eventDetailMarkup(event)}</div></article>`}
function renderTimeMonthSelection(scrollSelected=true){const root=document.getElementById('archDetailContent');if(!root)return;const months=timelineMonthRange(timeBrowserEntries,timeBrowserLearning);if(!months.length)return;selectedTimeMonth=timeMonthInitial(months);timeVisibleEntries=monthEvidenceEntries(selectedTimeMonth,timeBrowserEntries);timeVisibleActivities=timeBrowserEvents.filter(event=>event.kind!=='evidence'&&sameMonth(event.date,selectedTimeMonth)).sort((a,b)=>(dateFor(a.date)?.getTime()||0)-(dateFor(b.date)?.getTime()||0));const heading=root.querySelector('.evia-time-month-heading'),count=root.querySelector('.evia-time-month-count'),list=root.querySelector('.evia-time-evidence-list'),monthDownload=root.querySelector('[data-evia-download-month]'),menu=root.querySelector('.evia-time-download-menu'),status=root.querySelector('.evia-time-download-status');if(heading)heading.textContent=monthLabel(selectedTimeMonth);if(count)count.textContent=`${timeVisibleEntries.length} evidence submission${timeVisibleEntries.length===1?'':'s'}`;const evidenceMarkup=timeVisibleEntries.length?`<div class="evia-time-section-label">Evidence</div>${timeVisibleEntries.map(timeEvidenceCardMarkup).join('')}`:'<div class="evia-time-empty-month">No evidence was submitted in this month.</div>';const activityMarkup=timeVisibleActivities.length?`<div class="evia-time-section-label">Other activity</div>${timeVisibleActivities.map(timeActivityMarkup).join('')}`:'';if(list)list.innerHTML=evidenceMarkup+activityMarkup;if(monthDownload){monthDownload.disabled=!timeVisibleEntries.length;monthDownload.textContent=`Download month`}if(menu)menu.hidden=true;if(status)status.textContent='';root.querySelectorAll('[data-evia-time-month]').forEach(button=>{const active=button.dataset.eviaTimeMonth===selectedTimeMonth;button.classList.toggle('active',active);button.setAttribute('aria-current',active?'true':'false')});if(scrollSelected)requestAnimationFrame(()=>root.querySelector(`[data-evia-time-month="${CSS.escape(selectedTimeMonth)}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}))}
async function renderTimeTimeline(){try{if(typeof openArchShell==='function')openArchShell('Time')}catch{}try{if(typeof archDetailStack!=='undefined')archDetailStack=[]}catch{}enterTimeFullscreen();const root=document.getElementById('archDetailContent');if(!root)return;root.classList.add('evia-time-timeline-v1');root.innerHTML='<div class="evia-time-screen"><div class="evia-time-topbar"><div class="evia-time-title">Time</div><button class="evia-time-close" type="button" data-evia-time-close aria-label="Close Time">×</button></div><section class="evia-time-browser"><div class="evia-time-month-summary"><div class="evia-time-month-heading"></div><div class="evia-time-month-count"></div></div><div class="evia-time-evidence-list"></div></section><div class="evia-time-download-zone"><button class="evia-time-download-button" type="button" data-evia-time-download>Download</button><div class="evia-time-download-menu" hidden><button class="evia-time-download-option primary" type="button" data-evia-download-month>Download month</button><button class="evia-time-download-option" type="button" data-evia-download-portfolio>Download portfolio</button></div><div class="evia-time-download-status" aria-live="polite"></div></div><div class="evia-time-month-carousel" role="listbox" aria-label="Course months"></div></div>';const [entries,learning]=await Promise.all([getEvidenceEntries(),Promise.resolve(getLearningEntries())]);timeBrowserEntries=entries;timeBrowserLearning=learning;timeBrowserEvents=buildTimelineEvents(entries,learning);const months=timelineMonthRange(entries,learning),carousel=root.querySelector('.evia-time-month-carousel');if(!months.length){root.querySelector('.evia-time-evidence-list').innerHTML='<div class="evia-time-empty-month">Add the course start and end dates in Learner Profile to browse evidence by month.</div>';return}selectedTimeMonth=timeMonthInitial(months);carousel.innerHTML=months.map(key=>{const d=monthStart(key),count=monthEvidenceEntries(key,entries).length;return`<button class="evia-time-month-option" type="button" role="option" data-evia-time-month="${esc(key)}"><strong>${esc(d?d.toLocaleDateString(undefined,{month:'long'}):key)}</strong><small>${esc(d?String(d.getFullYear()):'')}</small><em>${count} evidence</em></button>`}).join('');renderTimeMonthSelection(true);carousel.addEventListener('scroll',()=>{clearTimeout(timeCarouselTimer);timeCarouselTimer=setTimeout(()=>{const buttons=[...carousel.querySelectorAll('[data-evia-time-month]')];if(!buttons.length)return;const centre=carousel.scrollLeft+(carousel.clientWidth/2);let nearest=buttons[0],distance=Infinity;buttons.forEach(button=>{const d=Math.abs((button.offsetLeft+(button.offsetWidth/2))-centre);if(d<distance){distance=d;nearest=button}});const key=nearest?.dataset?.eviaTimeMonth;if(key&&key!==selectedTimeMonth){selectedTimeMonth=key;renderTimeMonthSelection(false)}},100)},{passive:true})}
function pdfSafe"""

time = sub_once(
    r"async function renderTimeTimeline\(\)\{.*?\}\nfunction pdfSafe",
    helpers_and_render,
    time,
    'monthly evidence browser render'
)

evidence_pack = r"""async function buildMonthEvidencePdf(key,entries){await ensurePdfLib();const {PDFDocument,StandardFonts}=window.PDFLib,pdfDoc=await PDFDocument.create(),regular=await pdfDoc.embedFont(StandardFonts.Helvetica),bold=await pdfDoc.embedFont(StandardFonts.HelveticaBold),fonts={regular,bold},dark=pdfColor([45,45,45]),muted=pdfColor([100,100,95]);let page=pdfPage(pdfDoc),y=drawHeader(page,fonts,'Evia Monthly Evidence',`${monthLabel(key)} - ${getCourseTitle()}${fullLearnerName()?` - ${fullLearnerName()}`:''}`);if(!entries.length){page.drawText('No evidence was submitted in this month.',{x:36,y,size:10,font:regular,color:muted})}for(const entry of entries){const guide=clean(entry?.assessmentGuide),codes=codesForPath(entry?.path),path=evidencePathLabel(entry),written=clean(entry?.text||entry?.writtenText||entry?.notes||entry?.reflection||''),detail=[`${evidenceKind(entry).replace(/^./,c=>c.toUpperCase())} - ${shortDate(evidenceDate(entry))}`,path?`Course: ${path}`:'',codes.length?`Mapped: ${codes.join(', ')}`:'',clean(entry?.methodLabel)?`Method: ${clean(entry.methodLabel)}`:'',written?`Evidence: ${written}`:'',guide?`Evidence guide: ${guide}`:''].filter(Boolean).join('\n'),titleLines=wrapPdf(bold,evidenceTitle(entry),11,365),detailLines=wrapPdf(regular,detail,8.6,365),rowH=Math.max(112,22+titleLines.length*13+Math.min(detailLines.length,12)*10);if(y-rowH<55){page=pdfPage(pdfDoc);y=drawHeader(page,fonts,'Monthly evidence continued',monthLabel(key))}await drawEvidenceThumbnail(pdfDoc,page,entry,36,y-3,118,88,fonts);let textY=y-4;textY=drawTextLines(page,bold,titleLines,170,textY,11,13,dark,3)-5;drawTextLines(page,regular,detailLines,170,textY,8.6,10,muted,12);page.drawLine({start:{x:36,y:y-rowH+5},end:{x:559,y:y-rowH+5},thickness:.6,color:pdfColor([225,225,220])});y-=rowH}const pages=pdfDoc.getPages();pages.forEach((p,index)=>p.drawText(`Evia - ${pdfSafe(monthLabel(key))} evidence - Page ${index+1} of ${pages.length}`,{x:36,y:20,size:7.5,font:regular,color:pdfColor([130,130,125])}));return new Uint8Array(await pdfDoc.save())}
async function buildEvidenceMonthPack(key,statusNode){if(statusNode)statusNode.textContent=`Building ${monthName(key)} evidence pack...`;try{const entries=monthEvidenceEntries(key,await getEvidenceEntries());if(!entries.length)throw new Error('There is no evidence to download in this month.');const pdfBytes=await buildMonthEvidencePdf(key,entries),label=safeName(monthLabel(key)),manifest={version:1,month:key,label:monthLabel(key),generatedAt:new Date().toISOString(),course:getCourseTitle(),evidence:entries.map(entry=>({id:entry?.id,createdAt:entry?.createdAt,updatedAt:entry?.updatedAt,type:entry?.type,mimeType:entry?.mimeType,fileName:entry?.fileName,path:entry?.path,evidenceLabel:entry?.evidenceLabel,methodLabel:entry?.methodLabel,assessmentGuide:entry?.assessmentGuide||'',mappedCodes:codesForPath(entry?.path),text:clean(entry?.text||entry?.writtenText||entry?.notes||entry?.reflection||'')}))},files=[{name:`${label} - Evidence.pdf`,data:pdfBytes,date:new Date()},{name:'month-evidence.json',data:new TextEncoder().encode(JSON.stringify(manifest,null,2)),date:new Date()}];entries.forEach((entry,index)=>{if(entry?.blob instanceof Blob&&entry.blob.size){const name=safeName(entry.fileName||`${String(index+1).padStart(2,'0')}-${evidenceTitle(entry)}`);files.push({name:`Evidence/${String(index+1).padStart(2,'0')}-${name}`,data:entry.blob,date:dateFor(evidenceDate(entry))||new Date()})}});if(typeof createZip!=='function')throw new Error('Evia ZIP builder is unavailable.');const zip=await createZip(files);downloadBlob(zip,`${label} Evidence Pack.zip`);const archive=readJson(MONTH_ARCHIVE_KEY,{});archive[key]={...(archive[key]||{}),updatedAt:new Date().toISOString(),evidenceItems:entries.length,kind:'evidence-only'};writeJson(MONTH_ARCHIVE_KEY,archive);if(statusNode)statusNode.textContent=`${monthName(key)} evidence pack downloaded.`;return true}catch(error){console.error('Could not build Evia month evidence pack',error);if(statusNode)statusNode.textContent=error?.message||'Could not build this month evidence pack.';return false}}
function unitFilter"""

time = sub_once(
    r"function unitFilter",
    evidence_pack,
    time,
    'evidence-only month pack insertion',
    flags=0
)

new_bind = r"""function bind(){const time=document.getElementById('timeArch');if(time&&!time.dataset.eviaTimelineBound){time.dataset.eviaTimelineBound='1';time.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();renderTimeTimeline().catch(error=>console.error('Could not render Evia monthly evidence browser',error))},true)}const root=document.getElementById('archDetailContent');if(root&&!root.dataset.eviaTimelineActionBound){root.dataset.eviaTimelineActionBound='1';root.addEventListener('click',async event=>{const close=event.target.closest('[data-evia-time-close]');if(close){event.preventDefault();event.stopImmediatePropagation();closeTime();return}const month=event.target.closest('[data-evia-time-month]');if(month){event.preventDefault();selectedTimeMonth=month.dataset.eviaTimeMonth;renderTimeMonthSelection(true);return}const evidenceButton=event.target.closest('[data-evia-time-entry]');if(evidenceButton){event.preventDefault();event.stopImmediatePropagation();const entry=timeVisibleEntries[Number(evidenceButton.dataset.eviaTimeEntry)];if(entry){timelineNeedsRefresh=true;await openTimelineEvidence([entry])}return}const activityButton=event.target.closest('.evia-time-activity-button');if(activityButton){const article=activityButton.closest('.evia-time-activity-card'),detail=article?.querySelector('.evia-time-activity-detail'),open=activityButton.getAttribute('aria-expanded')==='true';activityButton.setAttribute('aria-expanded',String(!open));if(detail)detail.hidden=open;return}const download=event.target.closest('[data-evia-time-download]');if(download){const menu=root.querySelector('.evia-time-download-menu');if(menu)menu.hidden=!menu.hidden;return}const monthDownload=event.target.closest('[data-evia-download-month]');if(monthDownload){event.preventDefault();const menu=root.querySelector('.evia-time-download-menu'),status=root.querySelector('.evia-time-download-status');if(menu)menu.hidden=true;await buildEvidenceMonthPack(selectedTimeMonth,status);return}const portfolioDownload=event.target.closest('[data-evia-download-portfolio]');if(portfolioDownload){event.preventDefault();const menu=root.querySelector('.evia-time-download-menu'),status=root.querySelector('.evia-time-download-status');if(menu)menu.hidden=true;try{if(typeof downloadPortfolioZip==='function'){await downloadPortfolioZip();if(status)status.textContent='Portfolio download started.'}else{const button=document.getElementById('downloadPortfolio');if(button){button.click();if(status)status.textContent='Portfolio download started.'}else if(status)status.textContent='Portfolio download is unavailable.'}}catch{if(status)status.textContent='Could not download the portfolio.'}return}const unitButton=event.target.closest('[data-evia-unit-pdf]');if(unitButton){const status=unitButton.closest('.evia-unit-pdf-wrap')?.querySelector('.evia-unit-pdf-status');downloadUnitPdf(unitButton.dataset.eviaUnitPdf,status,unitButton)}})}const back=document.getElementById('backButton');if(back&&!back.dataset.eviaTimelineEvidenceBackBound){back.dataset.eviaTimelineEvidenceBackBound='1';back.addEventListener('click',event=>{if(!timelineEvidenceMode)return;event.preventDefault();event.stopImmediatePropagation();closeTimelineEvidence().catch(()=>{})},true)}const del=document.getElementById('portfolioDeleteEvidence');if(del&&!del.dataset.eviaTimelineEvidenceDeleteBound){del.dataset.eviaTimelineEvidenceDeleteBound='1';del.addEventListener('click',async event=>{if(!timelineEvidenceMode)return;event.preventDefault();event.stopImmediatePropagation();const current=timelineGroupEntries[timelineGroupIndex],id=current?.id;await deleteActiveEvidence();if(typeof portfolioViewer!=='undefined'&&portfolioViewer?.classList.contains('open'))return;if(id)timelineGroupEntries=timelineGroupEntries.filter(entry=>entry?.id!==id);timelineNeedsRefresh=true;if(!timelineGroupEntries.length){await closeTimelineEvidence();return}timelineGroupIndex=Math.min(timelineGroupIndex,timelineGroupEntries.length-1);await showTimelineEntry(timelineGroupIndex)},true)}document.addEventListener('click',event=>{const unitButton=event.target.closest('[data-nvq-unit]');if(unitButton){const unit=unitButton.dataset.nvqUnit;lastUnitContext={unit,label:getCourseMeta()?.unitTitles?.[unit]||`Unit ${unit}`};setTimeout(()=>injectUnitPdfButton(lastUnitContext.unit,lastUnitContext.label),30)}if(event.target.closest('.arch-detail-back,.back-button')&&!timelineEvidenceMode)lastUnitContext=null},false);const panel=document.getElementById('archDetailPanel');if(panel)new MutationObserver(()=>{if(!panel.classList.contains('open')&&(panel.classList.contains('evia-time-fullscreen')||document.body.classList.contains('evia-time-fullscreen')))exitTimeFullscreen()}).observe(panel,{attributes:true,attributeFilter:['class']});const observer=new MutationObserver(()=>{const title=clean(document.getElementById('archDetailTitle')?.textContent);if(lastUnitContext&&title===clean(lastUnitContext.label))injectUnitPdfButton(lastUnitContext.unit,lastUnitContext.label)});observer.observe(document.getElementById('archDetailPanel')||document.body,{subtree:true,childList:true,characterData:true})}
function boot"""

time = sub_once(
    r"function bind\(\)\{.*?\}\nfunction boot",
    new_bind,
    time,
    'monthly browser event binding'
)

time = time.replace(
    "window.EviaMonthlyPacks=Object.freeze({version:VERSION,renderTimeTimeline,buildMonthlyPack,downloadUnitPdf})",
    "window.EviaMonthlyPacks=Object.freeze({version:VERSION,renderTimeTimeline,buildMonthlyPack,buildEvidenceMonthPack,downloadUnitPdf})"
)
if time.count("buildEvidenceMonthPack") < 3:
    raise SystemExit('Expected month evidence pack to be defined, bound and exported')

TIME.write_text(time, encoding='utf-8')

manifest = MANIFEST.read_text(encoding='utf-8')
if manifest.count("./evia-approved-time-monthly-packs-v1.js?v=4") != 1:
    raise SystemExit('Expected one Time runtime v4 manifest entry')
MANIFEST.write_text(manifest.replace("./evia-approved-time-monthly-packs-v1.js?v=4","./evia-approved-time-monthly-packs-v1.js?v=5"),encoding='utf-8')

index = INDEX.read_text(encoding='utf-8')
if index.count("./evia-approved-time-monthly-packs-v1.js?v=4") != 1:
    raise SystemExit('Expected one Time runtime v4 index entry')
INDEX.write_text(index.replace("./evia-approved-time-monthly-packs-v1.js?v=4","./evia-approved-time-monthly-packs-v1.js?v=5"),encoding='utf-8')

TEST.write_text(r"""const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

const HARNESS = '<!doctype html><html><head></head><body>\n<button id="timeArch" type="button">Time</button>\n<button id="backButton" type="button">Back</button>\n<div id="archDetailPanel" aria-hidden="true"><div class="arch-detail-card"><div id="archDetailTitle" class="arch-detail-title"></div><div id="archDetailContent" class="arch-detail-content"></div></div></div>\n<div id="portfolioPanel" aria-hidden="true"></div>\n<div id="portfolioViewer"><div class="portfolio-viewer-actions"></div></div>\n<div id="portfolioTitle"></div>\n<button id="portfolioEditEvidence" type="button">Edit</button>\n<button id="portfolioDeleteEvidence" type="button">Delete</button>\n<button id="downloadPortfolio" type="button">Download ZIP</button>\n<script>\nwindow.learnerProfile={startDate:\'2026-01-01\',endDate:\'2026-12-31\'};\nwindow.learningEntries=[];\nwindow.completedEvidencePaths=new Set();window.activeCourseTitle=\'Test course\';window.archDetailStack=[];\nwindow.courseProgressPercent=()=>55;window.completedCourseProgress=()=>({completed:42,total:100,percent:42});\nwindow.totalLearningRequirement=()=>100;window.learnerLearningHours=()=>0;window.loadAttendanceData=()=>({collegeLearningHours:0});\nwindow.courseLeaves=()=>Array.from({length:100});window.officialLearnerProfile=()=>({});window.inferredCourseMeta=()=>({courseType:\'standard\'});window.courseMetaMappings=()=>({});window.evidencePathKey=path=>JSON.stringify(path||[]);\nwindow.getPortfolioEntries=async()=>[\n{id:\'sep-1\',createdAt:\'2026-09-02T12:00:00\',type:\'text\',mimeType:\'text/plain\',fileName:\'rams.txt\',path:[\'Health and safety\',\'K1\'],evidenceLabel:\'Follow RAMS, induction or toolbox information\'},\n{id:\'sep-2\',createdAt:\'2026-09-05T09:00:00\',type:\'photo\',mimeType:\'image/jpeg\',fileName:\'bond.jpg\',path:[\'Brickwork\',\'S1\'],evidenceLabel:\'Build a different bond or broken bond detail\'},\n{id:\'sep-3\',createdAt:\'2026-09-05T10:00:00\',type:\'text\',mimeType:\'text/plain\',fileName:\'sealant.txt\',path:[\'Health and safety\',\'K2\'],evidenceLabel:\'Apply sealant and manage paints or chemicals safely\'},\n{id:\'sep-4\',createdAt:\'2026-09-06T11:00:00\',type:\'text\',mimeType:\'text/plain\',fileName:\'plaster.txt\',path:[\'Repairs\',\'S2\'],evidenceLabel:\'Prepare and repair a plaster defect\'},\n{id:\'after-end\',createdAt:\'2027-01-06T11:00:00\',type:\'text\',mimeType:\'text/plain\',fileName:\'late.txt\',path:[\'Completion\',\'K3\'],evidenceLabel:\'Evidence after planned end date\'}\n];\nwindow.openArchShell=title=>{document.getElementById(\'archDetailTitle\').textContent=title;const p=document.getElementById(\'archDetailPanel\');p.classList.add(\'open\');p.setAttribute(\'aria-hidden\',\'false\')};\nwindow.closeArchDetail=()=>{const p=document.getElementById(\'archDetailPanel\');p.classList.remove(\'open\');p.setAttribute(\'aria-hidden\',\'true\')};window.updateBackButton=()=>{};\nwindow.openPortfolio=async()=>{const p=document.getElementById(\'portfolioPanel\');p.classList.add(\'open\');p.setAttribute(\'aria-hidden\',\'false\')};window.openEvidenceViewer=async entry=>{window.__openedEvidence=entry.id};\nwindow.closePortfolio=()=>{const p=document.getElementById(\'portfolioPanel\');p.classList.remove(\'open\');p.setAttribute(\'aria-hidden\',\'true\')};window.deleteActiveEvidence=async()=>{};\nwindow.downloadPortfolioZip=async()=>{window.__portfolioDownloaded=true};\nwindow.createZip=async()=>new Blob([\'zip\'],{type:\'application/zip\'});\n</script></body></html>';

async function openHarness(browser) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('http://127.0.0.1:4173/time-harness', route => route.fulfill({ status: 200, contentType: 'text/html', body: HARNESS }));
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/time-harness', { waitUntil: 'domcontentloaded' });
  await page.addScriptTag({ url: 'http://127.0.0.1:4173/evia-approved-time-monthly-packs-v1.js?v=5' });
  await expect.poll(async () => page.evaluate(() => Boolean(window.EviaMonthlyPacks?.renderTimeTimeline))).toBeTruthy();
  await page.evaluate(() => document.getElementById('timeArch').click());
  await expect(page.locator('.evia-time-screen')).toBeVisible();
  return { context, page };
}

test('Time is a month-by-month evidence browser with a 70 percent month carousel', async ({ browser }) => {
  const { context, page } = await openHarness(browser);
  await expect(page.locator('#archDetailPanel')).toHaveClass(/evia-time-fullscreen/);
  await expect(page.locator('.evia-time-month-carousel')).toBeVisible();
  await expect(page.locator('[data-evia-time-month="2027-01"]')).toBeAttached();

  await page.locator('[data-evia-time-month="2026-09"]').click();
  await expect(page.locator('[data-evia-time-month="2026-09"]')).toHaveClass(/active/);
  await expect(page.locator('.evia-time-month-heading')).toHaveText('September 2026');
  await expect(page.locator('.evia-time-month-count')).toHaveText('4 evidence submissions');
  await expect(page.locator('.evia-time-evidence-card')).toHaveCount(4);
  await expect(page.locator('.evia-time-evidence-card').nth(0)).toContainText('Follow RAMS');
  await expect(page.locator('.evia-time-evidence-card').nth(3)).toContainText('Prepare and repair a plaster defect');

  const widths = await page.evaluate(() => {
    const carousel = document.querySelector('.evia-time-month-carousel');
    const active = carousel.querySelector('.evia-time-month-option.active');
    return { carousel: carousel.getBoundingClientRect().width, active: active.getBoundingClientRect().width };
  });
  expect(widths.active / widths.carousel).toBeGreaterThan(0.64);
  expect(widths.active / widths.carousel).toBeLessThan(0.74);

  await page.locator('[data-evia-time-month="2027-01"]').click();
  await expect(page.locator('.evia-time-month-heading')).toHaveText('January 2027');
  await expect(page.locator('.evia-time-evidence-card')).toHaveCount(1);
  await expect(page.locator('.evia-time-evidence-card')).toContainText('Evidence after planned end date');

  await page.locator('[data-evia-time-close]').click();
  await expect(page.locator('#archDetailPanel')).toHaveAttribute('aria-hidden', 'true');
  await context.close();
});

test('Time evidence opens the existing editable portfolio viewer and download offers month or whole portfolio', async ({ browser }) => {
  const { context, page } = await openHarness(browser);
  await page.locator('[data-evia-time-month="2026-09"]').click();
  await page.locator('.evia-time-evidence-card').nth(1).click();
  await expect.poll(async () => page.evaluate(() => window.__openedEvidence || '')).toBe('sep-2');
  await expect(page.locator('#portfolioEditEvidence')).toBeAttached();

  await page.locator('#backButton').click();
  await expect(page.locator('.evia-time-screen')).toBeVisible();

  await page.locator('[data-evia-time-download]').click();
  await expect(page.locator('[data-evia-download-month]')).toHaveText('Download month');
  await expect(page.locator('[data-evia-download-portfolio]')).toHaveText('Download portfolio');
  await page.locator('[data-evia-download-portfolio]').click();
  await expect.poll(async () => page.evaluate(() => Boolean(window.__portfolioDownloaded))).toBeTruthy();
  await context.close();
});

test('Time keeps one source of truth and the existing portfolio edit contract', async () => {
  const html = fs.readFileSync('index.html','utf8');
  const time = fs.readFileSync('evia-approved-time-monthly-packs-v1.js','utf8');
  const manifest = fs.readFileSync('evia-runtime-manifest.js','utf8');
  const worker = fs.readFileSync('service-worker.js','utf8');
  expect(html).not.toContain('function renderTimePage()');
  expect((time.match(/function renderTimeTimeline\\(/g)||[]).length).toBe(1);
  expect((manifest.match(/evia-approved-time-monthly-packs-v1\\.js/g)||[]).length).toBe(1);
  expect(manifest).toContain("'./evia-approved-time-monthly-packs-v1.js?v=5'");
  expect(time).toContain('evia-time-month-carousel');
  expect(time).toContain('flex:0 0 70%');
  expect(time).toContain('buildEvidenceMonthPack');
  expect(time).toContain('Download portfolio');
  expect(time).toContain('latestEvidence&&latestEvidence>end');
  expect(html).toContain("portfolioEditEvidence.addEventListener('click'");
  expect(worker).toContain("const C='evia-pwa-v85'");
  expect(worker).toContain("const RELEASE_VERSION='1.1'");
});
""", encoding='utf-8')

epa = EPA_TEST.read_text(encoding='utf-8')
old = """  const reportEvent = app.locator('.evia-timeline-event.learner.epa').filter({ hasText:'EPA Practice - Interview' }).first();
  await expect(reportEvent).toBeVisible({ timeout:5000 });
  await reportEvent.locator('.evia-timeline-event-button').click();
  await expect(reportEvent.locator('.evia-timeline-event-detail')).toContainText('Clear sequence');"""
new = """  const reportEvent = app.locator('.evia-time-activity-card.epa').filter({ hasText:'EPA Practice - Interview' }).first();
  await expect(reportEvent).toBeVisible({ timeout:5000 });
  await reportEvent.locator('.evia-time-activity-button').click();
  await expect(reportEvent.locator('.evia-time-activity-detail')).toContainText('Clear sequence');"""
if epa.count(old) != 1:
    raise SystemExit('Expected one EPA Time timeline assertion block')
EPA_TEST.write_text(epa.replace(old,new,1), encoding='utf-8')
