from pathlib import Path

index_path = Path('index.html')
index = index_path.read_text(encoding='utf-8')

head_marker = '\n</head>'
demo_tag = '  <script src="./evia-demo-v1.js?v=1"></script>\n'
if demo_tag not in index:
    if index.count(head_marker) != 1:
        raise SystemExit(f'Expected exactly one </head>; found {index.count(head_marker)}')
    index = index.replace(head_marker, '\n' + demo_tag + '</head>', 1)

old_apply = "    function applyImportedCourse(items, title = '', meta = {}) {\n      courseItems = items.slice(0, 5);"
new_apply = "    function applyImportedCourse(items, title = '', meta = {}) {\n      try { window.__eviaDemo?.prepareForFullMode?.('course'); } catch {}\n      courseItems = items.slice(0, 5);"
if "window.__eviaDemo?.prepareForFullMode?.('course')" not in index:
    if index.count(old_apply) != 1:
        raise SystemExit(f'Expected exactly one applyImportedCourse insertion point; found {index.count(old_apply)}')
    index = index.replace(old_apply, new_apply, 1)
index_path.write_text(index, encoding='utf-8')

sw_path = Path('service-worker.js')
sw = sw_path.read_text(encoding='utf-8')
replacements = [
    ("const C='evia-pwa-v52';", "const C='evia-pwa-v53';", 'cache version'),
    ("const RUNTIME_SCRIPTS=[\n", "const RUNTIME_SCRIPTS=[\n  './evia-demo-v1.js?v=1',\n", 'demo runtime entry'),
    ("url.searchParams.set('__evia_refresh','52')", "url.searchParams.set('__evia_refresh','53')", 'refresh marker'),
]
for old, new, label in replacements:
    if new in sw:
        continue
    if sw.count(old) != 1:
        raise SystemExit(f'Expected exactly one {label}; found {sw.count(old)}')
    sw = sw.replace(old, new, 1)
sw_path.write_text(sw, encoding='utf-8')

print('Applied approved Evia demo first-install integration')
