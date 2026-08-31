from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')
old = """        { label: 'Not confident', action: 'check-confidence', value: 'not-confident' },
        { label: 'A little', action: 'check-confidence', value: 'a-little' },
        { label: 'Fairly confident', action: 'check-confidence', value: 'fairly-confident' },
        { label: 'Very confident', action: 'check-confidence', value: 'very-confident' }
"""
new = """        { label: 'New to this', action: 'check-confidence', value: 'not-confident' },
        { label: 'Starting out', action: 'check-confidence', value: 'a-little' },
        { label: 'Getting there', action: 'check-confidence', value: 'fairly-confident' },
        { label: 'Know my stuff', action: 'check-confidence', value: 'very-confident' }
"""
count = text.count(old)
if count != 1:
    raise SystemExit(f'Expected exactly one confidence option block, found {count}')
text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')

updated = path.read_text(encoding='utf-8')
for label in ['New to this', 'Starting out', 'Getting there', 'Know my stuff']:
    if label not in updated:
        raise SystemExit(f'Missing approved label: {label}')
for value in ['not-confident', 'a-little', 'fairly-confident', 'very-confident']:
    if f"value: '{value}'" not in updated:
        raise SystemExit(f'Confidence scoring value changed unexpectedly: {value}')
print('Approved confidence labels applied; existing scoring order preserved.')
