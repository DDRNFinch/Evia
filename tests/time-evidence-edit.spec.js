const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

async function addLocalScript(page, file) {
  await page.addScriptTag({ content: fs.readFileSync(path.join(root, file), 'utf8') });
}

test('Time evidence cards open the existing evidence editor and stay grouped', async ({ page }) => {
  await page.route('**/service-worker.js', route => route.abort());
  await page.goto('/');

  await addLocalScript(page, 'evia-approved-time-monthly-packs-v1.js');
  await addLocalScript(page, 'evia-approved-time-evidence-edit-v1.js');

  await page.evaluate(async () => {
    const now = new Date().toISOString();
    const path = ['Health and safety', 'K1 · Safe working'];
    await addPortfolioEntry({
      id: 'time-edit-one', createdAt: now, type: 'text', mimeType: 'text/plain;charset=utf-8',
      fileName: 'time-edit-one.txt', path, evidenceLabel: 'Safe working', methodHeading: 'Written', methodLabel: 'Reflection',
      requirements: '', learner: {}, blob: new Blob(['Timeline evidence one'], { type: 'text/plain;charset=utf-8' })
    });
    await addPortfolioEntry({
      id: 'time-edit-two', createdAt: now, type: 'text', mimeType: 'text/plain;charset=utf-8',
      fileName: 'time-edit-two.txt', path, evidenceLabel: 'Safe working', methodHeading: 'Written', methodLabel: 'Reflection',
      requirements: '', learner: {}, blob: new Blob(['Timeline evidence two'], { type: 'text/plain;charset=utf-8' })
    });
    await window.EviaMonthlyPacks.renderTimeTimeline();
  });

  const evidenceCard = page.locator('.evia-timeline-event.learner.evidence .evia-timeline-event-button').first();
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
