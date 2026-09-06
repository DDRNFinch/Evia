from pathlib import Path

Path('tests/time-only-redesign.spec.js').write_text(r'''const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test('Time opens as the approved full-page three-line timeline without changing home', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto('/?time_only=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#eviaStage')).toBeVisible();

  const homeBefore = await page.evaluate(() => ({
    arches: document.querySelector('#bottomArches')?.outerHTML || '',
    naxos: document.querySelector('#naxosArch')?.outerHTML || '',
    stageClass: document.querySelector('#eviaStage')?.className || '',
    stageStyle: document.querySelector('#eviaStage')?.getAttribute('style') || ''
  }));

  await page.addScriptTag({ url: '/evia-approved-time-monthly-packs-v1.js?v=2' });
  await expect.poll(async () => page.evaluate(() => Boolean(window.EviaMonthlyPacks?.renderTimeTimeline)), { timeout: 10000 }).toBeTruthy();

  await page.evaluate(() => {
    learnerProfile.startDate = '2026-01-01';
    learnerProfile.endDate = '2026-12-31';
    if (typeof saveLearnerProfile === 'function') saveLearnerProfile();
    document.getElementById('timeArch')?.click();
  });

  await expect(page.locator('.evia-time-screen')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[data-evia-time-close]')).toBeVisible();
  await expect(page.locator('.evia-time-key')).toContainText('Course');
  await expect(page.locator('.evia-time-key')).toContainText('Time');
  await expect(page.locator('.evia-time-key')).toContainText('Learning');
  await expect(page.locator('.evia-time-track.fill.course')).toHaveCSS('width', '2px');
  await expect(page.locator('.evia-time-track.fill.time')).toHaveCSS('width', '4px');
  await expect(page.locator('.evia-time-track.fill.learning')).toHaveCSS('width', '2px');
  await expect(page.locator('.evia-time-month-marker[data-month="2026-09"] .evia-time-month-circle')).toContainText('SEP');
  await expect(page.locator('.evia-time-month-marker[data-month="2026-09"] .evia-time-month-circle')).toContainText('2026');
  await expect(page.locator('.evia-time-overview')).toHaveCount(0);

  await page.evaluate(() => document.querySelector('[data-evia-time-close]')?.click());
  await expect(page.locator('#archDetailPanel')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#eviaStage')).toBeVisible();
  await expect(page.locator('#bottomArches')).toBeVisible();
  await expect(page.locator('#naxosArch')).toBeVisible();

  const homeAfter = await page.evaluate(() => ({
    arches: document.querySelector('#bottomArches')?.outerHTML || '',
    naxos: document.querySelector('#naxosArch')?.outerHTML || '',
    stageClass: document.querySelector('#eviaStage')?.className || '',
    stageStyle: document.querySelector('#eviaStage')?.getAttribute('style') || ''
  }));
  expect(homeAfter).toEqual(homeBefore);
  await context.close();
});

test('Time has one source of truth and reuses the existing progress calculations', async () => {
  const html = fs.readFileSync('index.html','utf8');
  const time = fs.readFileSync('evia-approved-time-monthly-packs-v1.js','utf8');
  const manifest = fs.readFileSync('evia-runtime-manifest.js','utf8');
  const worker = fs.readFileSync('service-worker.js','utf8');

  expect(html).not.toContain('function renderTimePage()');
  expect(html).not.toContain("timeArch.addEventListener('click', renderTimePage)");
  expect(html).not.toContain('.time-epa-marker');
  expect((time.match(/function renderTimeTimeline\(/g)||[]).length).toBe(1);
  expect((manifest.match(/evia-approved-time-monthly-packs-v1\.js/g)||[]).length).toBe(1);
  expect(manifest).toContain("'./evia-approved-time-monthly-packs-v1.js?v=2'");
  expect(time).toContain("typeof courseProgressPercent==='function'");
  expect(time).toContain("typeof completedCourseProgress==='function'");
  expect(time).toContain("typeof learnerLearningHours==='function'");
  expect(worker).toContain("const C='evia-pwa-v85'");
  expect(worker).toContain("url.searchParams.set('__evia_refresh','85')");
});
''', encoding='utf-8')
