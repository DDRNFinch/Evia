from pathlib import Path

TIME = Path('evia-approved-time-monthly-packs-v1.js')
TEST = Path('tests/time-only-redesign.spec.js')
RUNTIME_TEST = Path('tests/runtime-manifest.spec.js')

time = TIME.read_text(encoding='utf-8')
old_close = "function closeTime(){exitTimeFullscreen();try{if(typeof closeArchDetail==='function')closeArchDetail()}catch{}}"
new_close = "function closeTime(){exitTimeFullscreen();const finish=()=>{try{if(typeof closeArchDetail==='function')closeArchDetail()}catch{}};if(typeof setTimeout==='function')setTimeout(finish,0);else finish()}"
if time.count(old_close) != 1:
    raise SystemExit('Expected exactly one generated Time close function')
time = time.replace(old_close, new_close, 1)

old_epa = "function makeEpaEvents(){const state=readJson('eviaEpaPracticeV1',{});if(!clean(state?.completedAt)||!Number.isFinite(Number(state?.percent)))return[];return[{id:`epa:${dayKey(state.completedAt)}`,date:state.completedAt,kind:'epa',assistant:'',title:'EPA practice completed',summary:`${Math.round(Number(state.percent))}% practice score`,items:[state]}]}"
new_epa = "function epaPracticeLabel(report){const type=clean(report?.type).toLowerCase();return type==='mcq'?'Multiple-choice':type==='discussion'?'Interview':'Practical Prep'}\nfunction makeEpaEvents(){const reports=readJson('eviaEpaPracticeReportsV1',[]);if(Array.isArray(reports)&&reports.length)return reports.filter(report=>clean(report?.completedAt)).map(report=>{const percent=Number(report?.percent),overall=clean(report?.overall),summary=Number.isFinite(percent)?`${Math.round(percent)}%${overall?` - ${overall}`:''}`:(overall||'Practice report');return{id:`epa-report:${clean(report?.id)||dayKey(report.completedAt)}`,date:report.completedAt,kind:'epa',assistant:'',title:`EPA Practice - ${epaPracticeLabel(report)}`,summary,items:[report]}});const state=readJson('eviaEpaPracticeV1',{});if(!clean(state?.completedAt)||!Number.isFinite(Number(state?.percent)))return[];return[{id:`epa:${dayKey(state.completedAt)}`,date:state.completedAt,kind:'epa',assistant:'',title:'EPA Practice - Multiple-choice',summary:`${Math.round(Number(state.percent))}%`,items:[state]}]}"
if time.count(old_epa) != 1:
    raise SystemExit('Expected exactly one legacy EPA timeline source')
time = time.replace(old_epa, new_epa, 1)

old_detail = "function eventDetailMarkup(event){const items=Array.isArray(event.items)?event.items:[];if(event.kind==='evidence'){const first=items[0],codes=[...new Set(items.flatMap(x=>codesForPath(x?.path)))];return`<p>${esc(evidencePathLabel(first))}</p>${codes.length?`<p><strong>Mapped:</strong> ${esc(codes.join(', '))}</p>`:''}${first?.assessmentGuide?`<p><strong>Evidence guide:</strong><br>${esc(first.assessmentGuide).replaceAll('\\n','<br>')}</p>`:''}`}if(event.kind==='learning'||event.kind==='college')return items.slice(0,6).map(item=>`<p><strong>${esc(learningTitle(item))}</strong>${Number(item?.hours)>0?` - ${Number(item.hours).toFixed(1)}h`:''}<br>${esc(item?.text||'')}</p>`).join('');return`<p>${esc(event.summary)}</p>`}"
new_detail = "function eventDetailMarkup(event){const items=Array.isArray(event.items)?event.items:[];if(event.kind==='evidence'){const first=items[0],codes=[...new Set(items.flatMap(x=>codesForPath(x?.path)))];return`<p>${esc(evidencePathLabel(first))}</p>${codes.length?`<p><strong>Mapped:</strong> ${esc(codes.join(', '))}</p>`:''}${first?.assessmentGuide?`<p><strong>Evidence guide:</strong><br>${esc(first.assessmentGuide).replaceAll('\\n','<br>')}</p>`:''}`}if(event.kind==='learning'||event.kind==='college')return items.slice(0,6).map(item=>`<p><strong>${esc(learningTitle(item))}</strong>${Number(item?.hours)>0?` - ${Number(item.hours).toFixed(1)}h`:''}<br>${esc(item?.text||'')}</p>`).join('');if(event.kind==='epa'){const report=items[0]||{},sections=[],add=(title,values)=>{if(Array.isArray(values)&&values.length)sections.push(`<p><strong>${esc(title)}</strong><br>${values.map(value=>esc(value)).join('<br>')}</p>`)};add('Strong areas',report.strongAreas);add('Weak areas',report.weakAreas);add('Evidence to revisit',report.evidenceToRevisit);add('Next focus',report.nextActions);sections.push('<p><em>EPA practice guidance only - not a pass decision.</em></p>');return sections.join('')}return`<p>${esc(event.summary)}</p>`}"
if time.count(old_detail) != 1:
    raise SystemExit('Expected exactly one Time event detail renderer')
time = time.replace(old_detail, new_detail, 1)
TIME.write_text(time, encoding='utf-8')

test = TEST.read_text(encoding='utf-8')
open_marker = "  await expect.poll(async () => page.evaluate(() => Boolean(window.EviaMonthlyPacks?.renderTimeTimeline))).toBeTruthy();\n  await page.evaluate(() => document.getElementById('timeArch').click());"
open_replacement = "  await expect.poll(async () => page.evaluate(() => Boolean(window.EviaMonthlyPacks?.renderTimeTimeline))).toBeTruthy();\n  await page.evaluate(() => localStorage.setItem('eviaEpaPracticeReportsV1', JSON.stringify([{id:'epa-test-1',completedAt:'2026-09-05T12:00:00',type:'discussion',overall:'strong',strongAreas:['Explains checks clearly'],weakAreas:['Add more tolerances'],evidenceToRevisit:['Safe working'],nextActions:['Practise one follow-up'],itemCount:2}])));\n  await page.evaluate(() => document.getElementById('timeArch').click());"
if test.count(open_marker) != 1:
    raise SystemExit('Expected one Time harness open marker')
test = test.replace(open_marker, open_replacement, 1)

insert_before = "  await context.close();\n});\n\ntest('Time evidence uses the compact date-name label and opens the existing viewer'"
report_assertions = "  const report = page.locator('.evia-timeline-event.learner.epa .evia-timeline-event-button');\n  await expect(report).toContainText('5th - EPA Practice - Interview');\n  await page.evaluate(() => document.querySelector('.evia-timeline-event.learner.epa .evia-timeline-event-button').click());\n  await expect(page.locator('.evia-timeline-event.learner.epa .evia-timeline-event-detail')).toContainText('Strong areas');\n\n  await context.close();\n});\n\ntest('Time evidence uses the compact date-name label and opens the existing viewer'"
if test.count(insert_before) != 1:
    raise SystemExit('Expected Time report assertion insertion point')
test = test.replace(insert_before, report_assertions, 1)
TEST.write_text(test, encoding='utf-8')

s = RUNTIME_TEST.read_text(encoding='utf-8')
s = s.replace('service worker uses the manifest as its runtime source and is v84','service worker uses the manifest as its runtime source and is v85')
s = s.replace("const C='evia-pwa-v84'","const C='evia-pwa-v85'")
s = s.replace("url.searchParams.set('__evia_refresh','84')","url.searchParams.set('__evia_refresh','85')")
RUNTIME_TEST.write_text(s, encoding='utf-8')