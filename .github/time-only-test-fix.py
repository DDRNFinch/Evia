from pathlib import Path

Path('tests/time-only-redesign.spec.js').write_text(r'''const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

async function bootInstalledRuntime(context, page) {
  await page.goto('/evia-release.json', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    const marker = await caches.open('evia-update-ui-ready-v1');
    const releaseUrl = new URL('/__evia-visible-release-version__', location.origin).href;
    await marker.put(releaseUrl, new Response('__time_previous_release__', { headers: { 'content-type': 'text/plain' } }));
  });

  const workerStarted = context.serviceWorkers().length
    ? Promise.resolve(context.serviceWorkers()[0])
    : context.waitForEvent('serviceworker', { timeout: 15000 }).catch(() => null);

  await page.goto('/?time_only=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#eviaStage')).toBeVisible();
  expect(await workerStarted || context.serviceWorkers()[0], 'Evia service worker did not start').toBeTruthy();

  const ready = await page.evaluate(async () => Promise.race([
    navigator.serviceWorker.ready.then(registration => Boolean(registration.active)),
    new Promise(resolve => setTimeout(() => resolve(false), 20000))
  ]));
  expect(ready, 'Evia service worker did not become active').toBeTruthy();

  await expect.poll(async () => page.evaluate(() => Boolean(navigator.serviceWorker.controller)).catch(() => false), {
    timeout: 10000,
    intervals: [100, 250, 500, 1000]
  }).toBeTruthy();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#eviaStage')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => Boolean(window.EviaMonthlyPacks?.renderTimeTimeline)).catch(() => false), {
    timeout: 10000
  }).toBeTruthy();
}

test('Time opens as the approved full-page three-line timeline', async ({ page, context }) => {
  await bootInstalledRuntime(context, page);
  await page.evaluate(() => {
    learnerProfile.startDate = '2026-01-01';
    learnerProfile.endDate = '2026-12-31';
    if (typeof saveLearnerProfile === 'function') saveLearnerProfile();
  });
  await page.locator('#timeArch').click();
  await expect(page.locator('.evia-time-screen')).toBeVisible();
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
  await page.locator('[data-evia-time-close]').click();
  await expect(page.locator('#archDetailPanel')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#eviaStage')).toBeVisible();
  await expect(page.locator('#bottomArches')).toBeVisible();
  await expect(page.locator('#naxosArch')).toBeVisible();
});

test('Time has one source of truth and no superseded renderer', async () => {
  const html = fs.readFileSync('index.html','utf8');
  const time = fs.readFileSync('evia-approved-time-monthly-packs-v1.js','utf8');
  const manifest = fs.readFileSync('evia-runtime-manifest.js','utf8');
  expect(html).not.toContain('function renderTimePage()');
  expect(html).not.toContain("timeArch.addEventListener('click', renderTimePage)");
  expect(html).not.toContain('.time-epa-marker');
  expect((time.match(/function renderTimeTimeline\(/g)||[]).length).toBe(1);
  expect((manifest.match(/evia-approved-time-monthly-packs-v1\.js/g)||[]).length).toBe(1);
});
''', encoding='utf-8')
