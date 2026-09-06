from pathlib import Path

path = Path('evia-approved-time-monthly-packs-v1.js')
text = path.read_text(encoding='utf-8')
old_markup = "${downloaded?`✓ ${esc(name)} pack downloaded`:`Download ${esc(name)} pack`}"
new_markup = "${downloaded?`&#10003; ${esc(name)} pack downloaded`:`Download ${esc(name)} pack`}"
old_text = "button.textContent=`✓ ${monthName(key)} pack downloaded`"
new_text = "button.textContent=`\\u2713 ${monthName(key)} pack downloaded`"
if text.count(old_markup) != 1:
    raise SystemExit(f'pack markup checkmark: expected 1 match, found {text.count(old_markup)}')
if text.count(old_text) != 1:
    raise SystemExit(f'pack text checkmark: expected 1 match, found {text.count(old_text)}')
text = text.replace(old_markup, new_markup, 1).replace(old_text, new_text, 1)
path.write_text(text, encoding='utf-8')
