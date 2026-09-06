from pathlib import Path

js_path = Path('evia-evidence-ksb-index-v1.js')
test_path = Path('tests/evidence-viewer-pack-v2.spec.js')
manifest_path = Path('evia-runtime-manifest.js')
index_path = Path('index.html')

source = js_path.read_text(encoding='utf-8')
old = "pages.forEach((pageLines,i)=>{const pageNo=i+1,ops=['BT'];let y=806;pageLines.forEach((line,index)=>{const size=Number(line.size)||9,font=line.bold?'F2':'F1';ops.push(`/${font} ${size} Tf 36 ${y} Td (${pdfEscape(line.text)}) Tj`);y=-(size+4);ops.push(`0 ${y} Td`)});ops.push(`/F1 7 Tf 0 ${Math.max(0,-y)+6} Td (Evia KSB Evidence Mapping - Page ${pageNo} of ${pages.length}) Tj`);ops.push('ET');"
new = "pages.forEach((pageLines,i)=>{const pageNo=i+1,ops=['BT'];let y=806;pageLines.forEach(line=>{const size=Number(line.size)||9,font=line.bold?'F2':'F1';ops.push(`/${font} ${size} Tf 1 0 0 1 36 ${y} Tm (${pdfEscape(line.text)}) Tj`);y-=size+4});ops.push(`/F1 7 Tf 1 0 0 1 36 24 Tm (Evia KSB Evidence Mapping - Page ${pageNo} of ${pages.length}) Tj`);ops.push('ET');"
if source.count(old) != 1:
    raise SystemExit(f'Expected exactly one PDF positioning block, found {source.count(old)}')
js_path.write_text(source.replace(old, new, 1), encoding='utf-8')

for path in (manifest_path, index_path):
    text = path.read_text(encoding='utf-8')
    old_url = 'evia-evidence-ksb-index-v1.js?v=1'
    if text.count(old_url) != 1:
        raise SystemExit(f'{path}: expected one KSB index v1 runtime reference')
    path.write_text(text.replace(old_url, 'evia-evidence-ksb-index-v1.js?v=2', 1), encoding='utf-8')

test = test_path.read_text(encoding='utf-8')
old_return = "return { names:files.map(file=>file.name), html:new TextDecoder().decode(files[0].data), readme:new TextDecoder().decode(files[1].data), mappingHead:new TextDecoder().decode(mapping.data.slice(0,8)) };"
new_return = "return { names:files.map(file=>file.name), html:new TextDecoder().decode(files[0].data), readme:new TextDecoder().decode(files[1].data), mappingHead:new TextDecoder().decode(mapping.data.slice(0,8)), mappingText:new TextDecoder().decode(mapping.data) };"
if test.count(old_return) != 1:
    raise SystemExit('Expected one mapping test return block')
test = test.replace(old_return, new_return, 1)
old_assert = "expect(built.mappingHead).toBe('%PDF-1.4');"
new_assert = "expect(built.mappingHead).toBe('%PDF-1.4');\n  expect(built.mappingText).toContain('1 0 0 1 36 806 Tm');\n  expect(built.mappingText).toContain('1 0 0 1 36 24 Tm');\n  expect(built.mappingText).not.toMatch(/Tf 36 -?\\d+ Td/);\n  expect((built.mappingText.match(/1 0 0 1 36 \\d+ Tm/g)||[]).length).toBeGreaterThan(5);"
if test.count(old_assert) != 1:
    raise SystemExit('Expected one mapping PDF header assertion')
test = test.replace(old_assert, new_assert, 1)
if test.count("evia-evidence-ksb-index-v1.js?v=1") != 2:
    raise SystemExit('Expected two KSB index v1 test references')
test = test.replace("evia-evidence-ksb-index-v1.js?v=1", "evia-evidence-ksb-index-v1.js?v=2")
test_path.write_text(test, encoding='utf-8')
