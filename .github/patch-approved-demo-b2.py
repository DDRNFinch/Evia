from pathlib import Path

p=Path('evia-demo-v1.js')
s=p.read_text(encoding='utf-8')
old="""          {
            label: 'Photo + written',
            type: 'camera',
            details: [
              { displayType: 'Photo', label: '1 photo', instruction: `Take a photo of a colleague who ${colleaguePrompt}.` },
              { displayType: 'Written', label: 'Short written answer', instruction: 'Write one short line explaining why they fit the challenge.' }
            ]
          },
          {
            label: 'Solo: photo + audio',
            type: 'camera',
            details: [
              { displayType: 'Photo', label: '1 photo', instruction: `If you are on your own, ${soloPrompt} and take a photo of it.` },
              { displayType: 'Audio', label: 'Short audio', instruction: 'Explain why your choice fits the challenge.' }
            ]
          },"""
new="""          {
            label: 'Photo + audio or written',
            type: 'camera',
            details: [
              { displayType: 'Photo', label: '1 photo', instruction: `With colleagues, take a photo of a colleague who ${colleaguePrompt}. If you are on your own, ${soloPrompt} and take a photo of it.` },
              { displayType: 'Audio or written', label: 'Audio or written', instruction: 'Explain in one short line or audio clip why your choice fits the challenge.' }
            ]
          },
          {
            label: 'Witness verification',
            type: 'witness',
            details: [
              { displayType: 'Witness testimony', label: 'Witness testimony', instruction: 'Ask someone in the room to verify your answer using witness evidence.' }
            ]
          },"""
if s.count(old)!=1:
    raise SystemExit(f'Expected one current B2 block; found {s.count(old)}')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='./evia-demo-v1.js?v=1'
new='./evia-demo-v1.js?v=2'
if s.count(old)!=1:
    raise SystemExit(f'Expected one direct demo v1 reference; found {s.count(old)}')
p.write_text(s.replace(old,new,1),encoding='utf-8')

p=Path('service-worker.js')
s=p.read_text(encoding='utf-8')
for old,new,label in [
    ("const C='evia-pwa-v54';", "const C='evia-pwa-v55';", 'cache version'),
    ("'./evia-demo-v1.js?v=1'", "'./evia-demo-v1.js?v=2'", 'demo runtime reference'),
    ("url.searchParams.set('__evia_refresh','54')", "url.searchParams.set('__evia_refresh','55')", 'refresh marker'),
]:
    if s.count(old)!=1:
        raise SystemExit(f'Expected one {label}; found {s.count(old)}')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('Aligned approved B2 route and advanced demo delivery to v2')
