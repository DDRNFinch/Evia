const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function runtimeScripts() {
  const source = fs.readFileSync(path.join(root, 'evia-runtime-manifest.js'), 'utf8');
  const context = {};
  context.globalThis = context;
  vm.runInNewContext(source, context);
  return Array.from(context.EVIA_RUNTIME_SCRIPTS || []);
}

function cleanRuntimePath(value) {
  return String(value || '').replace(/^\.\//, '').split('?')[0];
}

async function bootControlled(page) {
  await page.goto('/', { waitUntil: 'load' });
  await expect(page.locator('#eviaStage')).toBeVisible();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.evaluate(async () => {
        if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
      });
      break;
    } catch (error) {
      await page.waitForLoadState('load').catch(() => {});
    }
  }

  await page.waitForFunction(() => Boolean(navigator.serviceWorker && navigator.serviceWorker.controller), null, { timeout: 25000 });
  await page.reload({ waitUntil: 'load' });
  await expect(page.locator('#eviaStage')).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker && navigator.serviceWorker.controller));
}

function trackPageErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('cold launch activates the complete approved runtime without uncaught errors', async ({ page }) => {
  const errors = trackPageErrors(page);
  await bootControlled(page);

  const expected = runtimeScripts().map(cleanRuntimePath);
  const loaded = await page.locator('script[src]').evaluateAll((nodes) => nodes.map((node) => {
    try { return new URL(node.src).pathname.split('/').pop(); } catch { return ''; }
  }).filter(Boolean));

  for (const script of expected) {
    expect(loaded, `${script} was not present after the controlled reload`).toContain(script.split('/').pop());
  }

  await expect(page.locator('.bottom-arches .status-arch')).toHaveCount(4);
  await expect(page.locator('.bottom-arches .status-arch .arch-progress-svg')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('core learner surfaces open: evidence, Learn, portfolio and chat', async ({ page }) => {
  const errors = trackPageErrors(page);
  await bootControlled(page);

  const evidenceApi = await page.evaluate(() => typeof goToEvidencePath === 'function');
  expect(evidenceApi).toBeTruthy();
  await page.evaluate(async () => { await goToEvidencePath(['Knowledge', 'K1 · Stationery Detective']); });
  await expect(page.locator('#evidenceScreen')).toBeVisible();
  await expect(page.locator('.evidence-choice')).toHaveCount(2);
  await expect(page.locator('#evidenceRequirements')).toBeVisible();

  await page.reload({ waitUntil: 'load' });
  await page.locator('#learnArch').click();
  await expect(page.locator('#archDetailPanel')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#archDetailContent')).toContainText(/Learning|Learn|hours/i);

  await page.reload({ waitUntil: 'load' });
  await page.evaluate(async () => { if (typeof openPortfolio === 'function') await openPortfolio(); });
  await expect(page.locator('#portfolioPanel')).toHaveAttribute('aria-hidden', 'false');

  await page.reload({ waitUntil: 'load' });
  await page.evaluate(() => { if (typeof openChat === 'function') openChat(); });
  await expect(page.locator('#chatPanel')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#chatOptions')).not.toBeEmpty();

  expect(errors).toEqual([]);
});

test('Ask Evia works inside both Teach Me and Test Me with a controlled AI response', async ({ page }) => {
  const errors = trackPageErrors(page);

  await page.addInitScript(() => {
    localStorage.clear();
    const course = [{
      label: 'Health and safety',
      children: [{
        label: 'K1 · Health and safety',
        requirements: 'Explain how health and safety requirements affect the work you carry out.',
        ksbTargets: ['K1'],
        recommended: { label: 'Written', type: 'text', details: [{ displayType: 'Written', label: 'Short answer', instruction: 'Explain the requirement.' }] }
      }]
    }];
    const meta = {
      courseType: 'ksb',
      qualificationId: 'EVIA-SMOKE-TEST',
      standardCode: 'EVIA-SMOKE-TEST',
      standardTitle: 'Evia Smoke Test',
      mappings: { K1: [['Health and safety', 'K1 · Health and safety']] },
      ksbOrder: ['K1'],
      criteria: [{ id: 'K1', wording: 'Health and safety requirements and how they affect occupational work.' }]
    };
    localStorage.setItem('eviaNaxosCourse', JSON.stringify(course));
    localStorage.setItem('eviaNaxosCourseTitle', 'Evia Smoke Test');
    localStorage.setItem('eviaNaxosCourseMetaV1', JSON.stringify(meta));
  });

  await page.route('https://evia-teach-test.finchyisnow.workers.dev/v1/teach-test', async (route) => {
    const request = route.request();
    let body = {};
    try { body = request.postDataJSON(); } catch {}
    if (body.mode === 'test') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          mode: 'test',
          subject: 'ask',
          title: 'Cavity tray test',
          questions: Array.from({ length: 5 }, (_, index) => ({
            question: `Smoke test question ${index + 1}?`,
            answers: [`Correct ${index + 1}`, `Wrong A ${index + 1}`, `Wrong B ${index + 1}`, `Wrong C ${index + 1}`],
            correct: 0,
            explanation: 'Controlled smoke-test explanation.',
            mappedTo: ['K1'],
            difficulty: 'competent'
          }))
        })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        mode: 'teach',
        subject: 'ask',
        title: 'Cavity trays',
        focus: 'Cavity trays',
        mappedTo: ['K1'],
        teaching: [
          'Controlled teaching point one.',
          'Controlled teaching point two.',
          'Controlled teaching point three.'
        ]
      })
    });
  });

  await bootControlled(page);
  await page.evaluate(async () => { openChat(); await startTeachMe(); });
  const teachAsk = page.locator('#chatOptions [data-chat-action="ai-ask-teach"]');
  await expect(teachAsk).toBeVisible();
  await teachAsk.click();
  await expect(page.locator('#eviaAiAskForm')).toHaveClass(/open/);
  await page.locator('#eviaAiAskInput').fill('cavity trays');
  await page.locator('#eviaAiAskForm button[type="submit"]').click();
  await expect(page.locator('#chatScroll')).toContainText('Controlled teaching point three.', { timeout: 15000 });

  await page.evaluate(async () => { await startTestMe(); });
  const testAsk = page.locator('#chatOptions [data-chat-action="ai-ask-test"]');
  await expect(testAsk).toBeVisible();
  await testAsk.click();
  await page.locator('#eviaAiAskInput').fill('cavity trays');
  await page.locator('#eviaAiAskForm button[type="submit"]').click();
  await expect(page.locator('#chatScroll')).toContainText('Smoke test question 1?', { timeout: 15000 });

  expect(errors).toEqual([]);
});

test('installed Evia reloads while offline', async ({ page, context }) => {
  const errors = trackPageErrors(page);
  await bootControlled(page);

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#eviaStage')).toBeVisible();
    await expect(page.locator('.bottom-arches .status-arch')).toHaveCount(4);
  } finally {
    await context.setOffline(false);
  }

  expect(errors).toEqual([]);
});
