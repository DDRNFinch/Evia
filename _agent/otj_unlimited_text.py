from pathlib import Path

page_path = Path('app/page.tsx')
css_path = Path('app/globals.css')
page = page_path.read_text()
css = css_path.read_text()

old = '<label className="clean-field is-wide is-required"><span>What did you learn?</span><input required type="text" value={otjDraft.title} onChange={(event) => { setOtjDraft({ ...otjDraft, title: event.target.value, unitId: selectedUnit.id }); setOtjError(""); }} placeholder="Example: cavity wall workshop" maxLength={120} /></label>'
new = '<label className="clean-field is-wide is-required"><span>What did you learn?</span><textarea required rows={5} value={otjDraft.title} onChange={(event) => { setOtjDraft({ ...otjDraft, title: event.target.value, unitId: selectedUnit.id }); setOtjError(""); }} placeholder="Describe what you did and what you learned" /></label>'
assert old in page, 'OTJ learning field not found'
page = page.replace(old, new, 1)

marker = '/* Unlimited Unit OTJ learning notes */'
if marker not in css:
    css += '''\n\n/* Unlimited Unit OTJ learning notes */\n.unit-otj-form .clean-field textarea {\n  width: 100%;\n  min-width: 0;\n  min-height: 7rem;\n  border: 0;\n  outline: 0;\n  resize: vertical;\n  background: transparent;\n  color: #404043;\n  font: inherit;\n  line-height: 1.45;\n}\n'''

page_path.write_text(page)
css_path.write_text(css)
print('patched')
