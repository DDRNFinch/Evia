from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
replacements=[
    ("      applyImportedCourse(items,cleanText(pack?.qualification?.title),meta);", "      await applyImportedCourse(items,cleanText(pack?.qualification?.title),meta);", 'NVQ apply'),
    ("      applyImportedCourse(items, cleanText(pack?.qualification?.title), meta);", "      await applyImportedCourse(items, cleanText(pack?.qualification?.title), meta);", 'KSB apply'),
    ("    function applyImportedCourse(items, title = '', meta = {}) {\n      try { window.__eviaDemo?.prepareForFullMode?.('course'); } catch {}", "    async function applyImportedCourse(items, title = '', meta = {}) {\n      try { await window.__eviaDemo?.prepareForFullMode?.('course'); } catch {}", 'common apply'),
    ("        applyImportedCourse(items,'',{});\n        closeScanner(false);", "        applyImportedCourse(items,'',{}).then(() => closeScanner(false)).catch((error) => {\n          console.error('Could not apply scanned course', error);\n          scannerStatus.textContent = 'Could not load that course.';\n        });", 'raw QR apply'),
]
for old,new,label in replacements:
    if s.count(old)!=1:
        raise SystemExit(f'Expected exactly one {label}; found {s.count(old)}')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

p=Path('service-worker.js')
s=p.read_text(encoding='utf-8')
for old,new,label in [
    ("const C='evia-pwa-v53';", "const C='evia-pwa-v54';", 'cache version'),
    ("url.searchParams.set('__evia_refresh','53')", "url.searchParams.set('__evia_refresh','54')", 'refresh marker'),
]:
    if s.count(old)!=1:
        raise SystemExit(f'Expected exactly one {label}; found {s.count(old)}')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('Sequenced demo cleanup before full-course activation')
