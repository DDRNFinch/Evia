from pathlib import Path
p=Path('evia-demo-v1.js')
s=p.read_text(encoding='utf-8')
old="if (!('indexedDB' in window)) return resolve();"
new="if (!window.indexedDB?.open) return resolve();"
if s.count(old)!=1:
    raise SystemExit(f'Expected one IndexedDB fallback guard, found {s.count(old)}')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('Hardened demo transition IndexedDB fallback')
