const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');

const BASE = 'http://127.0.0.1:4173/';

async function boot(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 5; i += 1) {
    try {
      await page.waitForFunction(() => window.eviaDemoV1 && window.eviaDemoV1.ready === true, null, { timeout: 5000 });
      await page.waitForSelector('#eviaDemoV1Bubble', { timeout: 5000 });
      return;
    } catch (error) {
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
  }
  throw new Error('Clean demo module did not become ready.');
}

async function bubbleTitle(page, title) {
  await page.waitForFunction((expected) => document.querySelector('#eviaDemoV1Bubble strong')?.textContent.trim() === expected, title, { timeout: 6000 });
}

async function next(page) {
  const button = page.locator('#eviaDemoV1Next');
  await button.waitFor({ state: 'visible', timeout: 5000 });
  await button.click();
}

async function pointedStep(page, selector, title) {
  await page.waitForSelector(`${selector}.evia-demo-target-v1`, { timeout: 6000 });
  await page.locator(selector).click();
  await bubbleTitle(page, title);
  const stageInfo = await page.locator('.evia-stage').evaluate((el) => ({
    visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    targetClass: el.classList.contains('evia-demo-target-v1'),
    bodyTour: document.body.classList.contains('evia-demo-tour-v1')
  }));
  assert.equal(stageInfo.visible, true, `${title}: Evia should remain visible`);
  assert.equal(stageInfo.targetClass, false, `${title}: Evia must not receive the target highlight box`);
  assert.equal(stageInfo.bodyTour, true, `${title}: tour presentation should still be active`);
  await next(page);
}

async function pillTexts(page) {
  return page.locator('#pillStack .pill-label').allTextContents();
}

async function openCategory(page, name) {
  await page.waitForSelector('#pillStack .pill');
  const pill = page.locator('#pillStack .pill', { hasText: name }).first();
  await pill.click();
  await page.waitForTimeout(120);
}

async function openEvidence(page, task) {
  const pill = page.locator('#pillStack .pill', { hasText: task }).first();
  await pill.click();
  await page.waitForSelector('#evidenceScreen .evidence-choice', { timeout: 6000 });
  return page.locator('#evidenceScreen .evidence-choice').allTextContents();
}

async function back(page) {
  await page.locator('#backButton').click();
  await page.waitForTimeout(120);
}

async function run(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  try {
    await boot(page);

    const state = await page.evaluate(() => ({
      meta: JSON.parse(localStorage.getItem('eviaNaxosCourseMetaV1') || '{}'),
      course: JSON.parse(localStorage.getItem('eviaNaxosCourse') || '[]'),
      time: document.getElementById('timeArchValue')?.textContent,
      courseValue: document.getElementById('courseArchValue')?.textContent,
      attend: document.getElementById('attendanceArchValue')?.textContent,
      learn: document.getElementById('learnArchValue')?.textContent
    }));
    assert.equal(state.meta.qualificationId, 'EVIA-DEMO');
    assert.equal(state.meta.version, '2.0');
    assert.deepEqual(state.course.map((row) => row.label), ['Introduction', 'Activities']);
    assert.equal(state.courseValue, '0%');
    assert.equal(state.attend, '97%');
    assert.equal(state.learn, '32%');
    assert.ok(Number.parseInt(state.time, 10) >= 31 && Number.parseInt(state.time, 10) <= 35, `unexpected Time value ${state.time}`);

    await bubbleTitle(page, 'Meet Evia');
    await next(page);
    await bubbleTitle(page, 'First things first');
    await page.locator('#eviaDemoV1Name').fill('Alex Tester');
    await next(page);

    await pointedStep(page, '#timeArch', 'Time');
    await pointedStep(page, '#courseArch', 'Course');
    await pointedStep(page, '#naxosArch', 'Course tools');
    await pointedStep(page, '#attendanceArch', 'Attendance');
    await pointedStep(page, '#learnArch', 'Learn');

    await page.waitForSelector('#eviaToolsMenuButton.evia-demo-target-v1', { timeout: 6000 });
    await page.locator('#eviaToolsMenuButton').click();
    await bubbleTitle(page, 'More tools');
    await next(page);

    await pointedStep(page, '[data-evia-tool="chat"]', 'Chat');
    await pointedStep(page, '[data-evia-tool="targets"]', 'Targets');
    await pointedStep(page, '[data-evia-tool="profile"]', 'Profile');
    await pointedStep(page, '[data-evia-tool="epa"]', 'EPA');
    await pointedStep(page, '[data-evia-tool="settings"]', 'Settings');

    await bubbleTitle(page, 'Your turn');
    await page.locator('.evia-stage').click();
    await page.waitForFunction(() => document.getElementById('screen')?.classList.contains('active'), null, { timeout: 5000 });
    let top = await pillTexts(page);
    assert.deepEqual(top, ['Introduction', 'Activities']);

    await openCategory(page, 'Introduction');
    let intro = await pillTexts(page);
    assert.deepEqual(intro, ['Say hello', 'Introduce someone']);

    let choices = await openEvidence(page, 'Say hello');
    assert.ok(choices.some((text) => /1 short audio/i.test(text)), 'Say hello should offer audio');
    assert.ok(choices.some((text) => /Written alternative/i.test(text)), 'Say hello should offer written/text alternative');
    await back(page);

    choices = await openEvidence(page, 'Introduce someone');
    assert.ok(choices.some((text) => /1 short video/i.test(text)), 'Introduce someone should offer video');
    assert.ok(choices.some((text) => /Audio alternative/i.test(text)), 'Introduce someone should offer audio alternative');
    await back(page);
    await back(page);

    await openCategory(page, 'Activities');
    let activities = await pillTexts(page);
    assert.deepEqual(activities, ['Rock, Paper, Scissors', 'Red lorry, yellow lorry']);

    choices = await openEvidence(page, 'Rock, Paper, Scissors');
    assert.ok(choices.some((text) => /best of 3/i.test(text)), 'RPS should offer best-of-three video');
    assert.ok(choices.some((text) => /3 photos/i.test(text)), 'RPS should offer three-photo alternative');
    await back(page);

    choices = await openEvidence(page, 'Red lorry, yellow lorry');
    assert.ok(choices.some((text) => /audio recording/i.test(text)), 'tongue twister should offer audio');
    assert.ok(choices.some((text) => /Video alternative/i.test(text)), 'tongue twister should offer video alternative');
    await back(page);
    await back(page);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.eviaDemoV1 && window.eviaDemoV1.ready === true, null, { timeout: 8000 });
    const offlineState = await page.evaluate(() => ({
      id: JSON.parse(localStorage.getItem('eviaNaxosCourseMetaV1') || '{}').qualificationId,
      labels: JSON.parse(localStorage.getItem('eviaNaxosCourse') || '[]').map((row) => row.label)
    }));
    assert.equal(offlineState.id, 'EVIA-DEMO');
    assert.deepEqual(offlineState.labels, ['Introduction', 'Activities']);
    await context.setOffline(false);

    await page.evaluate(() => {
      applyImportedCourse([
        { label: 'Real course area', children: [{ label: 'Real task', recommended: { label: 'Written evidence', type: 'text', details: [] }, alternative: null, requirementItems: [], requirements: '', ksbTargets: ['K1'] }] }
      ], 'Real test course', {
        courseType: 'ksb', qualificationId: 'REAL-TEST', title: 'Real test course', version: '1', officialItems: { K1: 'Real criterion' }, ksbOrder: ['K1'], mappings: { K1: [['Real course area', 'Real task']] }, qualification: { id: 'REAL-TEST', title: 'Real test course', version: '1' }
      });
    });
    await page.waitForTimeout(300);
    const cleaned = await page.evaluate(() => ({
      id: JSON.parse(localStorage.getItem('eviaNaxosCourseMetaV1') || '{}').qualificationId,
      profile: JSON.parse(localStorage.getItem('eviaLearnerProfile') || '{}'),
      attendance: localStorage.getItem('eviaAttendanceDataV1'),
      learning: JSON.parse(localStorage.getItem('eviaLearningEntries') || '[]'),
      targets: JSON.parse(localStorage.getItem('eviaMilosTargetsV1') || '[]')
    }));
    assert.equal(cleaned.id, 'REAL-TEST');
    assert.equal(cleaned.profile.firstName, 'Alex');
    assert.equal('startDate' in cleaned.profile, false, 'demo start date should be removed when a real course arrives');
    assert.equal('endDate' in cleaned.profile, false, 'demo end date should be removed when a real course arrives');
    assert.equal(cleaned.attendance, null, 'demo attendance should be restored/removed');
    assert.equal(cleaned.learning.some((row) => row.eviaDemoV1 === true), false);
    assert.equal(cleaned.targets.some((row) => row.eviaDemoV1 === true), false);

    assert.deepEqual(errors, [], `${name} page errors: ${errors.join('\n')}`);
    console.log(`PASS ${name}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  await run(chromium, 'Chromium');
  await run(webkit, 'WebKit');
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});