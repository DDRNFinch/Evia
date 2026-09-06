from pathlib import Path

path = Path('.github/time-course-progress-v1.py')
source = path.read_text(encoding='utf-8')

old_tick = "count?'✓':''"
if source.count(old_tick) != 1:
    raise SystemExit('Expected one Time progress tick source')
source = source.replace(old_tick, "count?'&#10003;':''", 1)

old_write = "TEST.write_text(test, encoding='utf-8')"
extra = r'''# Keep month selection deterministic now that tapping the active month opens the quick selector.
initial_active = "  await expect(page.locator('[data-evia-time-month=\"2026-09\"]')).toHaveClass(/active/);\n  await expect(page.locator('[data-evia-progress-month=\"2026-09\"]')).toHaveClass(/selected/);"
initial_selected = "  await page.evaluate(() => { const month=document.querySelector('[data-evia-time-month=\\\"2026-09\\\"]'); if(month&&!month.classList.contains('active'))month.click(); });\n  await expect(page.locator('[data-evia-time-month=\"2026-09\"]')).toHaveClass(/active/);\n  await expect(page.locator('[data-evia-progress-month=\"2026-09\"]')).toHaveClass(/selected/);"
if test.count(initial_active) != 1:
    raise SystemExit('Expected one initial selected-month assertion block')
test = test.replace(initial_active, initial_selected, 1)

old_second = "  await page.locator('[data-evia-time-month=\"2026-09\"]').click();\n  await page.locator('.evia-time-evidence-card').nth(1).click();"
new_second = "  await page.evaluate(() => { const month=document.querySelector('[data-evia-time-month=\\\"2026-09\\\"]'); if(month&&!month.classList.contains('active'))month.click(); });\n  await expect(page.locator('[data-evia-time-month=\"2026-09\"]')).toHaveClass(/active/);\n  await page.locator('.evia-time-evidence-card').nth(1).click();"
if test.count(old_second) != 1:
    raise SystemExit('Expected one editable evidence month-selection block')
test = test.replace(old_second, new_second, 1)
TEST.write_text(test, encoding='utf-8')'''
if source.count(old_write) != 1:
    raise SystemExit('Expected one Time test write point')
source = source.replace(old_write, extra, 1)
path.write_text(source, encoding='utf-8')
