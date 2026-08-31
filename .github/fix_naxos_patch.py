from pathlib import Path
p=Path('.github/patch_naxos_evidence.py')
s=p.read_text()
old="""def sub_once(pattern, replacement, label, flags=0):
    global s
    s2, n = re.subn(pattern, replacement, s, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f'{label}: expected 1 match, found {n}')
    s = s2
"""
new="""def sub_once(pattern, replacement, label, flags=0):
    global s
    matches = list(re.finditer(pattern, s, flags))
    if len(matches) != 1:
        raise SystemExit(f'{label}: expected 1 match, found {len(matches)}')
    match = matches[0]
    output = replacement
    for index in range(1, len(match.groups()) + 1):
        output = output.replace(f'\\\\{index}', match.group(index) or '')
    s = s[:match.start()] + output + s[match.end():]
"""
if s.count(old)!=1: raise SystemExit('sub_once helper not found')
s=s.replace(old,new,1)
old2="""    r'''\\1\\n    .evidence-requirements ul { margin: 0; padding-left: 19px; display: flex; flex-direction: column; gap: 7px; }\\n    .evidence-requirements li { padding-left: 2px; font-size: 13px; line-height: 1.38; }\\n''',"""
new2="""    '''\\\\1
    .evidence-requirements ul { margin: 0; padding-left: 19px; display: flex; flex-direction: column; gap: 7px; }
    .evidence-requirements li { padding-left: 2px; font-size: 13px; line-height: 1.38; }
''',"""
if s.count(old2)!=1: raise SystemExit('requirements replacement not found')
s=s.replace(old2,new2,1)
p.write_text(s)
