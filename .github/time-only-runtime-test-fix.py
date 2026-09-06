from pathlib import Path
p=Path('tests/runtime-manifest.spec.js')
s=p.read_text(encoding='utf-8')
s=s.replace('service worker uses the manifest as its runtime source and is v84','service worker uses the manifest as its runtime source and is v85')
s=s.replace("const C='evia-pwa-v84'","const C='evia-pwa-v85'")
s=s.replace("url.searchParams.set('__evia_refresh','84')","url.searchParams.set('__evia_refresh','85')")
p.write_text(s,encoding='utf-8')
