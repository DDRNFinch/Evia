from pathlib import Path

TIME = Path('evia-approved-time-monthly-packs-v1.js')
INDEX = Path('index.html')
MANIFEST = Path('evia-runtime-manifest.js')
TEST = Path('tests/time-only-redesign.spec.js')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)


time = TIME.read_text(encoding='utf-8')

time = replace_once(
    time,
    "function monthLabel(key){const d=monthStart(key);return d?d.toLocaleDateString(undefined,{month:'long',year:'numeric'}):key}",
    "function monthLabel(key){const d=monthStart(key);return d?d.toLocaleDateString(undefined,{month:'long',year:'numeric'}):key}\nfunction monthName(key){const d=monthStart(key);return d?d.toLocaleDateString(undefined,{month:'long'}):key}",
    'month name helper',
)

time = replace_once(
    time,
    "function compactEventMarkup(event,y){const assistant=assistantClass(event.assistant),klass=assistant?` assistant ${assistant}`:` learner ${esc(event.kind)}`;return`<article class=\"evia-timeline-event${klass}\" data-event=\"${esc(event.id)}\" style=\"bottom:${Math.round(y)}px\"><span class=\"evia-timeline-dot\" aria-hidden=\"true\"></span><span class=\"evia-timeline-connector\" aria-hidden=\"true\"></span><button class=\"evia-timeline-event-button\" type=\"button\" aria-expanded=\"false\"><span aria-hidden=\"true\">[</span><strong>${esc(`${ordinalDay(event.date)} - ${event.title}`)}</strong><span aria-hidden=\"true\">]</span></button><div class=\"evia-timeline-event-detail\" hidden>${eventDetailMarkup(event)}</div></article>`}",
    "function compactEventMarkup(event,y){const assistant=assistantClass(event.assistant),klass=assistant?` assistant ${assistant}`:` learner ${esc(event.kind)}`;return`<article class=\"evia-timeline-event${klass}\" data-event=\"${esc(event.id)}\" style=\"bottom:${Math.round(y)}px\"><span class=\"evia-timeline-dot\" aria-hidden=\"true\"></span><span class=\"evia-timeline-connector\" aria-hidden=\"true\"></span><button class=\"evia-timeline-event-button\" type=\"button\" aria-expanded=\"false\"><strong>${esc(`${ordinalDay(event.date)} - ${event.title}`)}</strong></button><div class=\"evia-timeline-event-detail\" hidden>${eventDetailMarkup(event)}</div></article>`}",
    'remove evidence brackets',
)

time = replace_once(
    time,
    ".evia-time-month-marker{position:absolute;left:42px;z-index:6;transform:translate(-50%,50%);display:flex;flex-direction:column;align-items:center;gap:3px}",
    ".evia-time-month-marker{position:absolute;left:42px;z-index:6;transform:translate(-50%,50%);width:46px;display:flex;flex-direction:column;align-items:center;gap:3px}",
    'month marker anchor',
)

time = replace_once(
    time,
    ".evia-time-pack-button{min-height:22px;border:0;background:transparent;color:rgba(45,45,45,.36);font-size:7.5px;font-weight:700;padding:2px 4px;cursor:pointer}.evia-time-pack-button:disabled{opacity:.35}.evia-time-pack-status{position:absolute;left:56px;top:18px;width:150px;font-size:8px;color:rgba(45,45,45,.42)}",
    ".evia-time-pack-button{position:absolute;left:56px;top:48px;min-height:30px;border:1px solid rgba(245,196,0,.34);border-radius:999px;background:rgba(245,196,0,.12);color:rgba(45,45,45,.70);font-size:9px;font-weight:700;line-height:1;padding:6px 10px;white-space:nowrap;cursor:pointer;box-shadow:0 1px 5px rgba(0,0,0,.04)}.evia-time-pack-button.downloaded{border-color:rgba(45,45,45,.10);background:rgba(45,45,45,.045);color:rgba(45,45,45,.42)}.evia-time-pack-button:disabled{opacity:.48}.evia-time-pack-status{position:absolute;left:58px;top:82px;width:190px;font-size:8px;line-height:1.3;color:rgba(45,45,45,.42)}",
    'pack button visibility',
)

time = replace_once(
    time,
    ".evia-time-today{position:absolute;left:42px;z-index:8;transform:translate(-50%,50%);width:12px;height:12px;border-radius:50%;background:#f5c400;border:3px solid #fff;box-shadow:0 0 0 1px rgba(245,196,0,.72)}.evia-time-today::after{content:'Today';position:absolute;right:17px;top:50%;transform:translateY(-50%);font-size:8px;font-weight:800;color:rgba(45,45,45,.42);white-space:nowrap}.evia-time-boundary{position:absolute;left:72px;z-index:3;font-size:8.5px;font-weight:700;color:rgba(45,45,45,.34);transform:translateY(50%)}",
    ".evia-time-today{position:absolute;left:42px;right:12px;z-index:4;transform:translateY(50%);height:2px;background:rgba(245,196,0,.52);pointer-events:none}.evia-time-today::before{content:'';position:absolute;left:-7px;top:50%;transform:translateY(-50%);width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #f5c400;box-shadow:0 0 0 2px #fff}.evia-time-today::after{content:'';position:absolute;left:-2px;top:50%;transform:translateY(-50%);width:4px;height:4px;border-radius:50%;background:#f5c400}.evia-time-today-label{position:absolute;left:12px;top:-17px;padding:1px 4px;border-radius:4px;background:rgba(255,255,255,.94);font-size:8px;font-weight:800;letter-spacing:.06em;color:rgba(45,45,45,.52);white-space:nowrap}.evia-time-boundary{position:absolute;left:72px;z-index:3;font-size:8.5px;font-weight:700;color:rgba(45,45,45,.34);transform:translateY(50%)}",
    'today marker hierarchy',
)

time = replace_once(
    time,
    ".evia-timeline-event{position:absolute;left:42px;right:8px;z-index:5;min-height:28px;transform:translateY(50%);display:flex;align-items:center}",
    ".evia-timeline-event{position:absolute;left:42px;right:12px;z-index:5;min-height:26px;transform:translateY(50%);display:flex;align-items:center}",
    'event row compactness',
)

time = replace_once(
    time,
    ".evia-timeline-event-button{min-width:0;min-height:28px!important;max-width:calc(100% - 35px);border:1px solid rgba(45,45,45,.10)!important;border-radius:8px!important;background:rgba(255,255,255,.96)!important;box-shadow:none!important;padding:4px 7px!important;color:rgba(45,45,45,.62)!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:3px!important;text-align:left!important;cursor:pointer!important}.evia-timeline-event-button strong{min-width:0;font-size:9.5px!important;font-weight:600!important;line-height:1.2!important;color:rgba(45,45,45,.68)!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.evia-timeline-event-button>span[aria-hidden=\"true\"]{font-size:10px;color:rgba(45,45,45,.30)}",
    ".evia-timeline-event-button{min-width:0;min-height:25px!important;max-width:min(82%,calc(100% - 39px));border:1px solid rgba(45,45,45,.09)!important;border-radius:7px!important;background:rgba(255,255,255,.96)!important;box-shadow:none!important;padding:3px 7px!important;color:rgba(45,45,45,.62)!important;display:flex!important;flex-direction:row!important;align-items:center!important;text-align:left!important;cursor:pointer!important}.evia-timeline-event-button strong{min-width:0;font-size:9px!important;font-weight:600!important;line-height:1.2!important;color:rgba(45,45,45,.66)!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    'event card styling',
)

time = replace_once(
    time,
    ".evia-timeline-event-button{max-width:calc(100% - 31px)}}html.evia-reduce-motion",
    ".evia-timeline-event-button{max-width:min(84%,calc(100% - 35px))}}html.evia-reduce-motion",
    'small screen card width',
)

time = replace_once(time, "stageHeight=Math.max(900,months.length*150+events.length*24)", "stageHeight=Math.max(900,months.length*150+events.length*28)", 'event stage spacing')
time = replace_once(time, "row=Math.max(base,floor,lastY+30)", "row=Math.max(base,floor,lastY+34)", 'event vertical spacing')
time = replace_once(time, "currentMonth=monthKey(new Date());let lastY", "currentMonth=monthKey(new Date()),archive=readJson(MONTH_ARCHIVE_KEY,{});let lastY", 'archive render state')

old_month_rows = "const monthRows=months.map(key=>{const marker=y(trackPosition(monthStart(key),start,end)),txt=monthMarkerText(key),future=key>currentMonth,data=monthData(key,entries,learning,events),has=data.evidence.length||data.learning.length;return`<div class=\"evia-time-month-marker${future?' future':''}\" style=\"bottom:${Math.round(marker)}px\" data-month=\"${esc(key)}\"><div class=\"evia-time-month-circle\"><strong>${esc(txt.month)}</strong><small>${esc(txt.year)}</small></div>${has&&!future?`<button class=\"evia-time-pack-button\" type=\"button\" data-evia-month-pack=\"${esc(key)}\">Pack</button><span class=\"evia-time-pack-status\" aria-live=\"polite\"></span>`:''}</div>`}).join('')"
new_month_rows = "const monthRows=months.map(key=>{const marker=y(trackPosition(monthStart(key),start,end)),txt=monthMarkerText(key),future=key>currentMonth,data=monthData(key,entries,learning,events),has=data.evidence.length||data.learning.length,downloaded=Boolean(archive?.[key]?.updatedAt),name=monthName(key);return`<div class=\"evia-time-month-marker${future?' future':''}\" style=\"bottom:${Math.round(marker)}px\" data-month=\"${esc(key)}\"><div class=\"evia-time-month-circle\"><strong>${esc(txt.month)}</strong><small>${esc(txt.year)}</small></div>${has&&!future?`<button class=\"evia-time-pack-button${downloaded?' downloaded':''}\" type=\"button\" data-evia-month-pack=\"${esc(key)}\">${downloaded?`✓ ${esc(name)} pack downloaded`:`Download ${esc(name)} pack`}</button><span class=\"evia-time-pack-status\" aria-live=\"polite\"></span>`:''}</div>`}).join('')"
time = replace_once(time, old_month_rows, new_month_rows, 'month pack presentation')

time = replace_once(
    time,
    "const today=time===null?'':`<span class=\"evia-time-today\" data-evia-today=\"true\" style=\"bottom:${Math.round(y(time))}px\" aria-label=\"Today\"></span>`",
    "const today=time===null?'':`<span class=\"evia-time-today\" data-evia-today=\"true\" style=\"bottom:${Math.round(y(time))}px\" aria-label=\"Today\"><span class=\"evia-time-today-label\">TODAY</span></span>`",
    'today markup',
)

old_pack = "async function buildMonthlyPack(key,statusNode,button){const old=button?.textContent;if(button){button.disabled=true;button.textContent='Building...'}if(statusNode)statusNode.textContent='Building PDF and monthly pack locally...';try{const [entries,learning]=await Promise.all([getEvidenceEntries(),Promise.resolve(getLearningEntries())]),events=buildTimelineEvents(entries,learning),data=monthData(key,entries,learning,events);if(!data.evidence.length&&!data.learning.length)throw new Error('There is no evidence or learning recorded in this month.');const snapshot=monthSnapshot(data,entries,learning);saveManifest(data,snapshot);const pdfBytes=await buildMonthlyPdf(data,snapshot),label=safeName(data.label),files=[{name:`${label} - Evidence & Progress.pdf`,data:pdfBytes,date:new Date()},{name:'month-manifest.json',data:new TextEncoder().encode(JSON.stringify(manifestForPack(data,snapshot),null,2)),date:new Date()}];data.evidence.forEach((entry,index)=>{if(entry?.blob instanceof Blob&&entry.blob.size){const name=safeName(entry.fileName||`${String(index+1).padStart(2,'0')}-${evidenceTitle(entry)}`);files.push({name:`Evidence/${String(index+1).padStart(2,'0')}-${name}`,data:entry.blob,date:dateFor(evidenceDate(entry))||new Date()})}});if(data.learning.length){files.push({name:'Learning/learning-logs.json',data:new TextEncoder().encode(JSON.stringify({month:key,entries:data.learning},null,2)),date:new Date()});files.push({name:'Learning/learning-logs.txt',data:new TextEncoder().encode(learningTextFile(data.learning)),date:new Date()})}if(typeof createZip!=='function')throw new Error('Evia ZIP builder is unavailable.');const zip=await createZip(files);downloadBlob(zip,`${label} Evidence Pack.zip`);if(statusNode)statusNode.textContent='Monthly pack downloaded.'}catch(error){console.error('Could not build Evia monthly pack',error);if(statusNode)statusNode.textContent=error?.message||'Could not build this monthly pack.'}finally{if(button){button.disabled=false;button.textContent=old||'Download pack'}}}"
new_pack = "async function buildMonthlyPack(key,statusNode,button){const old=button?.textContent;let completed=false;if(button){button.disabled=true;button.textContent='Building pack...'}if(statusNode)statusNode.textContent='';try{const [entries,learning]=await Promise.all([getEvidenceEntries(),Promise.resolve(getLearningEntries())]),events=buildTimelineEvents(entries,learning),data=monthData(key,entries,learning,events);if(!data.evidence.length&&!data.learning.length)throw new Error('There is no evidence or learning recorded in this month.');const snapshot=monthSnapshot(data,entries,learning);saveManifest(data,snapshot);const pdfBytes=await buildMonthlyPdf(data,snapshot),label=safeName(data.label),files=[{name:`${label} - Evidence & Progress.pdf`,data:pdfBytes,date:new Date()},{name:'month-manifest.json',data:new TextEncoder().encode(JSON.stringify(manifestForPack(data,snapshot),null,2)),date:new Date()}];data.evidence.forEach((entry,index)=>{if(entry?.blob instanceof Blob&&entry.blob.size){const name=safeName(entry.fileName||`${String(index+1).padStart(2,'0')}-${evidenceTitle(entry)}`);files.push({name:`Evidence/${String(index+1).padStart(2,'0')}-${name}`,data:entry.blob,date:dateFor(evidenceDate(entry))||new Date()})}});if(data.learning.length){files.push({name:'Learning/learning-logs.json',data:new TextEncoder().encode(JSON.stringify({month:key,entries:data.learning},null,2)),date:new Date()});files.push({name:'Learning/learning-logs.txt',data:new TextEncoder().encode(learningTextFile(data.learning)),date:new Date()})}if(typeof createZip!=='function')throw new Error('Evia ZIP builder is unavailable.');const zip=await createZip(files);downloadBlob(zip,`${label} Evidence Pack.zip`);completed=true;if(button){button.classList.add('downloaded');button.textContent=`✓ ${monthName(key)} pack downloaded`}if(statusNode)statusNode.textContent=''}catch(error){console.error('Could not build Evia monthly pack',error);if(statusNode)statusNode.textContent=error?.message||'Could not build this monthly pack.'}finally{if(button){button.disabled=false;if(!completed)button.textContent=old||`Download ${monthName(key)} pack`}}}"
time = replace_once(time, old_pack, new_pack, 'monthly pack completion state')

TIME.write_text(time, encoding='utf-8')

index = INDEX.read_text(encoding='utf-8')
index = replace_once(index, './evia-approved-time-monthly-packs-v1.js?v=2', './evia-approved-time-monthly-packs-v1.js?v=3', 'index Time cache key')
INDEX.write_text(index, encoding='utf-8')

manifest = MANIFEST.read_text(encoding='utf-8')
manifest = replace_once(manifest, './evia-approved-time-monthly-packs-v1.js?v=2', './evia-approved-time-monthly-packs-v1.js?v=3', 'manifest Time cache key')
MANIFEST.write_text(manifest, encoding='utf-8')

test = TEST.read_text(encoding='utf-8')
test = replace_once(test, "await page.addScriptTag({ url: 'http://127.0.0.1:4173/evia-approved-time-monthly-packs-v1.js?v=2' });", "await page.addScriptTag({ url: 'http://127.0.0.1:4173/evia-approved-time-monthly-packs-v1.js?v=3' });", 'test Time cache key')
test = replace_once(
    test,
    "  await expect(page.locator('.evia-time-month-marker[data-month=\"2026-09\"] .evia-time-month-circle')).toContainText('2026');\n\n  const report =",
    "  await expect(page.locator('.evia-time-month-marker[data-month=\"2026-09\"] .evia-time-month-circle')).toContainText('2026');\n  const pack = page.locator('.evia-time-month-marker[data-month=\"2026-09\"] .evia-time-pack-button');\n  await expect(pack).toHaveText('Download September pack');\n  await expect(page.locator('.evia-time-today-label')).toHaveText('TODAY');\n  await page.evaluate(async () => { localStorage.setItem('eviaMonthlyArchiveV1', JSON.stringify({'2026-09':{updatedAt:'2026-09-06T10:00:00Z'}})); await window.EviaMonthlyPacks.renderTimeTimeline(); });\n  await expect(page.locator('.evia-time-month-marker[data-month=\"2026-09\"] .evia-time-pack-button')).toHaveText('✓ September pack downloaded');\n  await expect(page.locator('.evia-time-month-marker[data-month=\"2026-09\"] .evia-time-pack-button')).toHaveClass(/downloaded/);\n\n  const report =",
    'timeline hierarchy assertions',
)
test = replace_once(
    test,
    "  await expect(evidence).toContainText('4th - Safe working');\n  await page.evaluate",
    "  await expect(evidence).toContainText('4th - Safe working');\n  await expect(evidence.locator('span[aria-hidden=\"true\"]')).toHaveCount(0);\n  await page.evaluate",
    'no bracket assertion',
)
test = replace_once(test, "expect(manifest).toContain(\"'./evia-approved-time-monthly-packs-v1.js?v=2'\")", "expect(manifest).toContain(\"'./evia-approved-time-monthly-packs-v1.js?v=3'\")", 'manifest test cache key')
TEST.write_text(test, encoding='utf-8')
