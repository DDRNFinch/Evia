const { test, expect } = require('@playwright/test');

async function bootControlled(context, page) {
  await page.goto('/evia-release.json', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    const marker = await caches.open('evia-update-ui-ready-v1');
    const releaseUrl = new URL('/__evia-visible-release-version__', location.origin).href;
    await marker.put(releaseUrl, new Response('__time_edit_previous_release__', {
      headers: { 'content-type': 'text/plain' }
    }));
  });

  const workerStarted = context.serviceWorkers().length
    ? Promise.resolve(context.serviceWorkers()[0])
    : context.waitForEvent('serviceworker', { timeout: 15000 }).catch(() => null);

  await page.goto('/?__evia_time_edit_smoke=1', { waitUntil: 'domcontentloaded' });
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
  await expect.poll(async () => page.evaluate(() => Boolean(
    window.EviaMonthlyPacks?.renderTimeTimeline && window.EviaTimeEvidenceEdit?.version === 1
  )).catch(() => false), { timeout: 10000 }).toBeTruthy();
}

test('Time evidence cards open the existing evidence editor and stay grouped', async ({ page, context }) => {
  await bootControlled(context, page);

  const stored = await page.evaluate(async () => {
    const now = new Date().toISOString();
    const evidencePath = ['Health and safety', 'K1 · Safe working'];
    await addPortfolioEntry({
      id: 'time-edit-one', createdAt: now, type: 'text', mimeType: 'text/plain;charset=utf-8',
      fileName: 'time-edit-one.txt', path: evidencePath, evidenceLabel: 'Safe working', methodHeading: 'Written', methodLabel: 'Reflection',
      requirements: '', learner: {}, blob: new Blob(['Timeline evidence one'], { type: 'text/plain;charset=utf-8' })
    });
    await addPortfolioEntry({
      id: 'time-edit-two', createdAt: now, type: 'text', mimeType: 'text/plain;charset=utf-8',
      fileName: 'time-edit-two.txt', path: evidencePath, evidenceLabel: 'Safe working', methodHeading: 'Written', methodLabel: 'Reflection',
      requirements: '', learner: {}, blob: new Blob(['Timeline evidence two'], { type: 'text/plain;charset=utf-8' })
    });
    const entries = await getPortfolioEntries();
    await window.EviaMonthlyPacks.renderTimeTimeline();
    return entries.filter(entry => entry.id === 'time-edit-one' || entry.id === 'time-edit-two').length;
  });
  expect(stored).toBe(2);

  await expect(page.locator('#archDetailTitle')).toHaveText('Time');
  const evidenceCard = page.locator('.evia-timeline-event.learner.evidence .evia-timeline-event-button').filter({ hasText: 'Safe working' }).first();
  await expect(evidenceCard).toContainText('2 evidence items');
  await evidenceCard.click();

  await expect(page.locator('#portfolioPanel')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#portfolioTitle')).toHaveText('Evidence 1 of 2');
  await expect(page.locator('#portfolioPreview')).toContainText('Timeline evidence one');
  await expect(page.locator('.evia-timeline-evidence-nav')).toBeVisible();

  await page.locator('[data-evia-timeline-next]').click();
  await expect(page.locator('#portfolioTitle')).toHaveText('Evidence 2 of 2');
  await expect(page.locator('#portfolioPreview')).toContainText('Timeline evidence two');

  await page.locator('#portfolioEditEvidence').click();
  await expect(page.locator('#portfolioEditTextarea')).toBeVisible();
  await page.locator('#portfolioEditTextarea').fill('Timeline evidence two edited');
  await page.locator('#portfolioEditEvidence').click();
  await expect(page.locator('#portfolioPreview')).toContainText('Timeline evidence two edited');

  await page.locator('#backButton').click();
  await expect(page.locator('#portfolioPanel')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#archDetailTitle')).toHaveText('Time');
});
