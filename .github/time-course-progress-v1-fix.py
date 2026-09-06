from pathlib import Path
import re

path = Path('.github/time-course-progress-v1.py')
source = path.read_text(encoding='utf-8')
source, count = re.subn(r'(old_contract = .*?evia-approved-time-monthly-packs-v1\.js\?v=)5', r'\g<1>6', source, count=1)
if count != 1:
    raise SystemExit('Expected one old_contract v5 reference')
path.write_text(source, encoding='utf-8')
