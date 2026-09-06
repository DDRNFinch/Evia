from pathlib import Path
import re

TIME=Path('evia-approved-time-monthly-packs-v1.js')
TEST=Path('tests/time-only-redesign.spec.js')
MANIFEST=Path('evia-runtime-manifest.js')

def sub_once(pattern,repl,text,label,flags=re.S):
    out,n=re.subn(pattern,lambda m: repl,text,count=1,flags=flags)
    if n!=1:
        raise SystemExit(f'{label}: expected 1 match, got {n}')
    return out

time=TIME.read_text(encoding='utf-8')
old="let selectedTimeMonth='',timeBrowserEntries=[],timeBrowserLearning=[],timeBrowserEvents=[],timeVisibleEntries=[],timeVisibleActivities=[],timeCarouselTimer=0;"
new="let selectedTimeMonth='',timeBrowserEntries=[],timeBrowserLearning=[],timeBrowserEvents=[],timeVisibleEntries=[],timeVisibleGroups=[],timeVisibleActivities=[],timeCarouselTimer=0;"
if time.count(old)!=1: raise SystemExit('Time state anchor changed')
time=time.replace(old,new,1)

new_group_funcs="""function evidenceGroupTypeSummary(items){const counts=new Map();(items||[]).forEach(entry=>{const kind=evidenceKind(entry);counts.set(kind,(counts.get(kind)||0)+1)});const labels={photo:['Photo','Photos'],video:['Video','Videos'],audio:['Audio','Audio'],written:['Written','Written'],document:['Document','Documents'],witness:['Witness','Witnesses'],observation:['Observation','Observations']},order=['photo','video','audio','written','document','witness','observation'],parts=[];order.forEach(kind=>{const count=counts.get(kind)||0;if(!count)return;const pair=labels[kind]||[kind,`${kind}s`];parts.push(`${count} ${count===1?pair[0]:pair[1]}`);counts.delete(kind)});counts.forEach((count,kind)=>parts.push(`${count} ${count===1?kind:`${kind}s`}`));return parts.join(' · ')||`${(items||[]).length} evidence`}
function timeEvidenceGroupCardMarkup(group,index){const items=Array.isArray(group?.items)?group.items:[],first=items[0]||{},d=dateFor(group?.date||evidenceDate(first)),day=d?String(d.getDate()).padStart(2,'0'):'--',month=d?d.toLocaleDateString(undefined,{month:'short'}).toUpperCase():'',types=evidenceGroupTypeSummary(items),path=evidencePathLabel(first),codes=[...new Set(items.flatMap(entry=>codesForPath(entry?.path)))],meta=[types,path,codes.length?codes.join(', '):''].filter(Boolean).join(' · ');return`<button class=\"evia-time-evidence-card\" type=\"button\" data-evia-time-group=\"${index}\"><span class=\"evia-time-evidence-date\">${esc(day)}<small>${esc(month)}</small></span><span class=\"evia-time-evidence-copy\"><strong>${esc(group?.title||evidenceTitle(first))}</strong><small>${esc(meta||'Evidence')}</small></span><span class=\"evia-time-evidence-action\">View / edit</span></button>`}
function timeActivityMarkup"""
time=sub_once(r"function timeEvidenceCardMarkup\(entry,index\)\{.*?\}\nfunction timeActivityMarkup",new_group_funcs,time,'Time evidence card function')

anchor="timeVisibleEntries=monthEvidenceEntries(selectedTimeMonth,timeBrowserEntries);timeVisibleActivities="
replace="timeVisibleEntries=monthEvidenceEntries(selectedTimeMonth,timeBrowserEntries);timeVisibleGroups=makeEvidenceEvents(timeVisibleEntries).sort((a,b)=>(dateFor(a.date)?.getTime()||0)-(dateFor(b.date)?.getTime()||0));timeVisibleActivities="
if time.count(anchor)!=1: raise SystemExit('Time visible entries anchor changed')
time=time.replace(anchor,replace,1)

old_markup="const evidenceMarkup=timeVisibleEntries.length?`<div class=\"evia-time-section-label\">Evidence</div>${timeVisibleEntries.map(timeEvidenceCardMarkup).join('')}`:'<div class=\"evia-time-empty-month\">No evidence was submitted in this month.</div>';"
new_markup="const evidenceMarkup=timeVisibleGroups.length?`<div class=\"evia-time-section-label\">Evidence</div>${timeVisibleGroups.map(timeEvidenceGroupCardMarkup).join('')}`:'<div class=\"evia-time-empty-month\">No evidence was submitted in this month.</div>';"
if time.count(old_markup)!=1: raise SystemExit('Time evidence markup anchor changed')
time=time.replace(old_markup,new_markup,1)

old_click="const evidenceButton=event.target.closest('[data-evia-time-entry]');if(evidenceButton){event.preventDefault();event.stopImmediatePropagation();const entry=timeVisibleEntries[Number(evidenceButton.dataset.eviaTimeEntry)];if(entry){timelineNeedsRefresh=true;await openTimelineEvidence([entry])}return}"
new_click="const evidenceButton=event.target.closest('[data-evia-time-group]');if(evidenceButton){event.preventDefault();event.stopImmediatePropagation();const group=timeVisibleGroups[Number(evidenceButton.dataset.eviaTimeGroup)];if(group?.items?.length){timelineNeedsRefresh=true;await openTimelineEvidence(group.items)}return}"
if time.count(old_click)!=1: raise SystemExit('Time evidence click anchor changed')
time=time.replace(old_click,new_click,1)
TIME.write_text(time,encoding='utf-8')

manifest=MANIFEST.read_text(encoding='utf-8')
old_m="'./evia-approved-time-monthly-packs-v1.js?v=7'"
new_m="'./evia-approved-time-monthly-packs-v1.js?v=8'"
if manifest.count(old_m)!=1: raise SystemExit('Time manifest version anchor changed')
MANIFEST.write_text(manifest.replace(old_m,new_m,1),encoding='utf-8')

test=TEST.read_text(encoding='utf-8')
test=test.replace("evia-approved-time-monthly-packs-v1.js?v=7","evia-approved-time-monthly-packs-v1.js?v=8")
old_entry="{id:'sep-4',createdAt:'2026-09-06T11:00:00',type:'text',mimeType:'text/plain',fileName:'plaster.txt',path:['Repairs','S2'],evidenceLabel:'Prepare and repair a plaster defect'},"
new_entries="""{id:'plaster-photo-1',createdAt:'2026-09-06T09:00:00',type:'photo',mimeType:'image/jpeg',fileName:'plaster-1.jpg',path:['Repairs','S2'],evidenceLabel:'Prepare and repair a plaster defect'},
{id:'plaster-photo-2',createdAt:'2026-09-06T09:05:00',type:'photo',mimeType:'image/jpeg',fileName:'plaster-2.jpg',path:['Repairs','S2'],evidenceLabel:'Prepare and repair a plaster defect'},
{id:'plaster-photo-3',createdAt:'2026-09-06T09:10:00',type:'photo',mimeType:'image/jpeg',fileName:'plaster-3.jpg',path:['Repairs','S2'],evidenceLabel:'Prepare and repair a plaster defect'},
{id:'plaster-audio',createdAt:'2026-09-06T09:15:00',type:'audio',mimeType:'audio/webm',fileName:'plaster.webm',path:['Repairs','S2'],evidenceLabel:'Prepare and repair a plaster defect'},"""
if test.count(old_entry)!=1: raise SystemExit('Time test plaster anchor changed')
test=test.replace(old_entry,new_entries,1)

test=test.replace("await expect(page.locator('.evia-time-evidence-card').nth(3)).toContainText('Prepare and repair a plaster defect');","await expect(page.locator('.evia-time-evidence-card').nth(3)).toContainText('Prepare and repair a plaster defect');\n  await expect(page.locator('.evia-time-evidence-card').nth(3)).toContainText('3 Photos · 1 Audio');")
test=test.replace("await expect(page.locator('[data-evia-month-pick=\"2026-09\"] em')).toHaveText('4');","await expect(page.locator('[data-evia-month-pick=\"2026-09\"] em')).toHaveText('7');")
old_open="await page.locator('.evia-time-evidence-card').nth(1).click();\n  await expect.poll(async () => page.evaluate(() => window.__openedEvidence || '')).toBe('sep-2');\n  await expect(page.locator('#portfolioEditEvidence')).toBeAttached();"
new_open="await page.locator('.evia-time-evidence-card').nth(3).click();\n  await expect.poll(async () => page.evaluate(() => window.__openedEvidence || '')).toBe('plaster-photo-1');\n  await expect(page.locator('.evia-timeline-evidence-nav')).toBeVisible();\n  await expect(page.locator('.evia-timeline-evidence-nav span')).toHaveText('1 of 4');\n  await page.locator('[data-evia-timeline-next]').click();\n  await expect.poll(async () => page.evaluate(() => window.__openedEvidence || '')).toBe('plaster-photo-2');\n  await expect(page.locator('.evia-timeline-evidence-nav span')).toHaveText('2 of 4');\n  await expect(page.locator('#portfolioEditEvidence')).toBeAttached();"
if test.count(old_open)!=1: raise SystemExit('Time test viewer anchor changed')
test=test.replace(old_open,new_open,1)
old_contract="expect(manifest).toContain(\"'./evia-approved-time-monthly-packs-v1.js?v=8'\");"
# v8 replacement above already updates source contract. Add grouping checks immediately afterwards.
if test.count(old_contract)!=1: raise SystemExit('Time test manifest contract changed')
test=test.replace(old_contract,old_contract+"\n  expect(time).toContain('timeVisibleGroups');\n  expect(time).toContain('data-evia-time-group');\n  expect(time).toContain('evidenceGroupTypeSummary');",1)
TEST.write_text(test,encoding='utf-8')
