from pathlib import Path

TIME=Path('evia-approved-time-monthly-packs-v1.js')
TEST=Path('tests/time-only-redesign.spec.js')
MANIFEST=Path('evia-runtime-manifest.js')

time=TIME.read_text(encoding='utf-8')
old='<section class="evia-time-browser"><div class="evia-time-month-summary"><div class="evia-time-month-heading"></div><div class="evia-time-month-count"></div></div><div class="evia-time-evidence-list"></div></section>'
new='<section class="evia-time-browser"><div class="evia-time-evidence-list"></div></section>'
if time.count(old)!=1:
    raise SystemExit(f'Expected one Time month summary block, found {time.count(old)}')
time=time.replace(old,new,1)
TIME.write_text(time,encoding='utf-8')

manifest=MANIFEST.read_text(encoding='utf-8')
oldv="'./evia-approved-time-monthly-packs-v1.js?v=6'"
newv="'./evia-approved-time-monthly-packs-v1.js?v=7'"
if manifest.count(oldv)!=1:
    raise SystemExit(f'Expected one Time v6 runtime reference, found {manifest.count(oldv)}')
MANIFEST.write_text(manifest.replace(oldv,newv,1),encoding='utf-8')

test=TEST.read_text(encoding='utf-8')
test=test.replace('evia-approved-time-monthly-packs-v1.js?v=6','evia-approved-time-monthly-packs-v1.js?v=7')
test=test.replace("  await expect(page.locator('.evia-time-month-heading')).toHaveText('September 2026');\n  await expect(page.locator('.evia-time-month-count')).toHaveText('4 evidence submissions');\n", "  await expect(page.locator('.evia-time-month-summary')).toHaveCount(0);\n  await expect(page.locator('.evia-time-month-heading')).toHaveCount(0);\n  await expect(page.locator('.evia-time-month-count')).toHaveCount(0);\n")
test=test.replace("  await expect(page.locator('.evia-time-month-heading')).toHaveText('January 2027');\n", "  await expect(page.locator('.evia-time-month-summary')).toHaveCount(0);\n")
test=test.replace("expect(manifest).toContain(\"'./evia-approved-time-monthly-packs-v1.js?v=6'\");", "expect(manifest).toContain(\"'./evia-approved-time-monthly-packs-v1.js?v=7'\");")
TEST.write_text(test,encoding='utf-8')
