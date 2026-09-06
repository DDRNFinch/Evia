from pathlib import Path

manifest=Path('evia-runtime-manifest.js')
index=Path('index.html')
test=Path('tests/evidence-viewer-pack-v2.spec.js')

m=manifest.read_text(encoding='utf-8')
anchor="  './evia-evidence-viewer-pack-v2.js?v=2',\n"
if m.count(anchor)!=1: raise SystemExit('runtime viewer anchor changed')
m=m.replace(anchor,anchor+"  './evia-evidence-ksb-index-v1.js?v=1',\n",1)
manifest.write_text(m,encoding='utf-8')

i=index.read_text(encoding='utf-8')
anchor='  <script src="./evia-evidence-viewer-pack-v2.js?v=2"></script>\n'
if i.count(anchor)!=1: raise SystemExit('index viewer anchor changed')
i=i.replace(anchor,anchor+'  <script src="./evia-evidence-ksb-index-v1.js?v=1"></script>\n',1)
index.write_text(i,encoding='utf-8')

t=test.read_text(encoding='utf-8')
old="  await page.addScriptTag({ url: 'http://127.0.0.1:4173/evia-evidence-viewer-pack-v2.js?v=2' });\n"
new=old+"  await page.addScriptTag({ url: 'http://127.0.0.1:4173/evia-evidence-ksb-index-v1.js?v=1' });\n"
if t.count(old)!=1: raise SystemExit('viewer test script anchor changed')
t=t.replace(old,new,1)

t=t.replace("window.courseMetaMappings=()=>({K1:[\"Unit A\",\"Skill one\"],S2:[\"Unit A\",\"Skill two\"]});","window.courseMetaMappings=()=>({K1:[\"Unit A\",\"Skill one\"],K22:[\"Unit A\",\"Skill one\"],S2:[\"Unit A\",\"Skill two\"]});",1)
old_opts="      scopeType:'month', scopeLabel:'September 2026', course:'Test Standard', learner:{firstName:'Test',lastName:'Learner'}\n    });\n    return { names:files.map(file=>file.name), html:new TextDecoder().decode(files[0].data), readme:new TextDecoder().decode(files[1].data) };"
new_opts="      scopeType:'month', scopeLabel:'September 2026', course:'Test Standard', learner:{firstName:'Test',lastName:'Learner'},\n      epaPlan:{ courseId:'TEST', planVersion:'1.0', title:'Test Standard EPA', methodLabels:{'multiple-choice-test':'Multiple-choice test','practical-assessment-with-questions':'Practical assessment with questions','interview-underpinned-by-portfolio':'Interview underpinned by a portfolio of evidence'}, ksbMethods:{K1:'multiple-choice-test',K22:'practical-assessment-with-questions',S2:'interview-underpinned-by-portfolio'} }\n    });\n    const mapping=files.find(file=>file.name==='KSB Evidence Mapping.pdf');\n    return { names:files.map(file=>file.name), html:new TextDecoder().decode(files[0].data), readme:new TextDecoder().decode(files[1].data), mappingHead:new TextDecoder().decode(mapping.data.slice(0,8)) };"
if t.count(old_opts)!=1: raise SystemExit('viewer build fixture changed')
t=t.replace(old_opts,new_opts,1)

t=t.replace("  expect(built.names).toEqual(['Open Evidence Viewer.html','Evidence Viewer - Read Me.txt']);","  expect(built.names).toEqual(['Open Evidence Viewer.html','Evidence Viewer - Read Me.txt','KSB Evidence Mapping.pdf']);\n  expect(built.mappingHead).toBe('%PDF-1.4');",1)
anchor="  expect(built.html).toContain('1 Audio');\n"
if t.count(anchor)!=1: raise SystemExit('viewer html assertion anchor changed')
t=t.replace(anchor,anchor+"  expect(built.html).toContain('KSB Evidence Index');\n  expect(built.html).toContain('EV-001');\n  expect(built.html).toContain('K22');\n  expect(built.html).toContain('Practical assessment with questions');\n",1)

anchor="  await expect(page.locator('#slide')).toContainText('5 evidence files');\n\n"
if t.count(anchor)!=1: raise SystemExit('overview assertion anchor changed')
t=t.replace(anchor,anchor+"  await page.locator('#ksbBtn').click();\n  await expect(page.locator('#slide')).toContainText('KSB Evidence Index');\n  await expect(page.locator('#slide')).toContainText('K22');\n  await expect(page.locator('#slide')).toContainText('EV-001');\n  await page.locator('#ksbSearch').fill('K22');\n  await expect(page.locator('.ksb-row')).toHaveCount(1);\n  await page.locator('[data-ksb-jump=\"1\"]').click();\n  await expect(page.locator('#slide')).toContainText('EV-001');\n  await expect(page.locator('#slide')).toContainText('Build a test wall');\n  await page.locator('#prev').click();\n  await expect(page.locator('#slide')).toContainText('2 evidence sections');\n\n",1)

anchor="  expect(manifest).toContain(\"'./evia-evidence-viewer-pack-v2.js?v=2'\");\n"
if t.count(anchor)!=1: raise SystemExit('manifest contract anchor changed')
t=t.replace(anchor,anchor+"  expect(manifest).toContain(\"'./evia-evidence-ksb-index-v1.js?v=1'\");\n  expect(index).toContain('evia-evidence-ksb-index-v1.js?v=1');\n",1)
anchor="  expect(viewer).not.toContain('filePaths');\n"
if t.count(anchor)!=1: raise SystemExit('viewer contract tail changed')
t=t.replace(anchor,anchor+"  const ksbIndex = fs.readFileSync('evia-evidence-ksb-index-v1.js','utf8');\n  expect(ksbIndex).toContain('KSB Evidence Mapping.pdf');\n  expect(ksbIndex).toContain('KSB Evidence Index');\n  expect(ksbIndex).toContain('EV-${String(index+1).padStart(3');\n  expect(ksbIndex).toContain('Naxos-Mapping_Engine/assessment-plans.json');\n",1)

test.write_text(t,encoding='utf-8')
