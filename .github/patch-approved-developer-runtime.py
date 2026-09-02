from pathlib import Path

path = Path('service-worker.js')
text = path.read_text(encoding='utf-8')

replacements = [
    ("const C='evia-pwa-v51';", "const C='evia-pwa-v52';", 'cache version'),
    ("  './evia-approved-settings-stable-v1.js',\n", "  './evia-approved-settings-stable-v1.js',\n  './evia-developer-mode-v1.js?v=1',\n", 'developer runtime entry'),
    ("  './nisia-sync.js?v=3',", "  './nisia-sync.js?v=4',", 'Nisia cache bust'),
    ("url.searchParams.set('__evia_refresh','51')", "url.searchParams.set('__evia_refresh','52')", 'internal refresh marker'),
]
for old, new, label in replacements:
    if text.count(old) != 1:
        raise SystemExit(f'Expected exactly one {label}; found {text.count(old)}')
    text = text.replace(old, new, 1)

for expected in ["evia-pwa-v52", "./evia-developer-mode-v1.js?v=1", "./nisia-sync.js?v=4", "__evia_refresh','52"]:
    if expected not in text:
        raise SystemExit(f'Missing runtime marker: {expected}')

path.write_text(text, encoding='utf-8')
print('Approved Developer Mode runtime cache patch applied')
