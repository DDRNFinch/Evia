from pathlib import Path
p = Path('.tmp_portfolio_viewer_patch.py')
s = p.read_text()
old = r"join('\n');"
new = r"join('\\n');"
if old not in s:
    raise SystemExit('join escape marker not found')
p.write_text(s.replace(old, new, 1))
