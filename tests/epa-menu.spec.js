const { test, expect } = require('@playwright/test');

async function bootControlled(context, app) {
  await app.goto('/evia-release.json', { waitUntil: 'domcontentloaded' });
  await app.evaluate(async () => {
    const marker = await caches.open('evia-update-ui-ready-v1');
    const releaseUrl = new URL('/__evia-visible-release-version__', location.origin).href;
    await marker.put(releaseUrl, new Response('__smoke_previous_release__', { headers: { 'content-type': 'text/plain' } }));
  });
  const workerStarted = context.serviceWorkers().length ? Promise.resolve(context.serviceWorkers()[0]) : context.waitForEvent('serviceworker', { timeout: 15000 }).catch(() => null);
  await app.goto('/?__evia_epa_smoke=1', { waitUntil: 'domcontentloaded' });
  await expect(app.locator('#eviaStage')).toBeVisible();
  const firstWorker = await workerStarted;
  expect(firstWorker || context.serviceWorkers()[0]).toBeTruthy();
  const ready = await app.evaluate(async () => navigator.serviceWorker ? Promise.race([navigator.serviceWorker.ready.then(registration => Boolean(registration.active)), new Promise(resolve => setTimeout(() => resolve(false), 20000))]) : false);
  expect(ready).toBeTruthy();
  await expect.poll(async () => app.evaluate(() => Boolean(navigator.serviceWorker?.controller)).catch(() => false), { timeout: 10000, intervals: [100, 250, 500, 1000] }).toBeTruthy();
  await app.reload({ waitUntil: 'domcontentloaded' });
  await expect(app.locator('#eviaStage')).toBeVisible();
  return app;
}

function seedCourse() {
  localStorage.clear();
  localStorage.setItem('eviaDemoModeV1', '0');
  const course = [{ label:'Brickwork', children:[{ label:'K1 · Health and safety', requirements:'Explain how health and safety requirements affect bricklaying work.', ksbTargets:['K1'], recommended:{label:'Written',type:'text',details:[{displayType:'Written',label:'Short answer',instruction:'Explain the requirement.'}]} }] }];
  const meta = { courseType:'ksb', qualificationId:'ST0095', standardCode:'ST0095', standardTitle:'Bricklayer', criteria:{ K1:'Health and safety requirements and how they affect occupational work.' }, mappings:{ K1:[['Brickwork','K1 · Health and safety']] }, ksbOrder:['K1'] };
  localStorage.setItem('eviaNaxosCourse', JSON.stringify(course));
  localStorage.setItem('eviaNaxosCourseTitle', 'Bricklayer — ST0095 v1.2');
  localStorage.setItem('eviaNaxosCourseMetaV1', JSON.stringify(meta));
}

test('plus menu is consolidated and EPA practice follows the course assessment plan', async ({ page, context }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript(seedCourse);
  await context.route('https://ddrnfinch.github.io/Naxos-Mapping_Engine/assessment-plans.json', async route => {
    await route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ courses:{ ST0095:{ title:'Bricklayer — ST0095 v1.2', methods:[
      { title:'Multiple-choice test', detail:'40 multiple-choice questions · 60 minutes · closed book.' },
      { title:'Interview underpinned by a portfolio of evidence', detail:'60-minute interview · at least 10 questions.' },
      { title:'Practical assessment with questions', detail:'12-hour practical assessment · at least 6 questions.' }
    ] } } }) });
  });
  await context.route('https://evia-teach-test.finchyisnow.workers.dev/v1/epa-discussion', async route => {
    const request = route.request();
    if ((request.headers()['content-type'] || '').includes('application/json')) {
      await route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ ok:true, action:'question', question:'Explain the checks you would make while constructing a cavity wall and why they matter.', focus:'Quality checks', mappedTo:['K1'] }) });
      return;
    }
    await route.fulfill({ status:500, contentType:'application/json', body:JSON.stringify({ ok:false, error:'Audio feedback is not exercised in this browser smoke test.' }) });
  });

  const app = await bootControlled(context, page);
  await app.locator('#naxosArch').click();
  const menu = app.locator('#eviaPlusMenu .evia-plus-pill');
  await expect(menu).toHaveCount(5);
  expect(await menu.allTextContents()).toEqual(['Chat with Evia','Targets','EPA Practice','Share & Scan','Profile & Settings']);

  await menu.filter({ hasText:'Share & Scan' }).click();
  await expect(app.locator('#eviaSupportTitle')).toHaveText('Share & Scan');
  await expect(app.locator('#eviaShowQr')).toBeVisible();
  await expect(app.locator('#eviaScanQr')).toBeVisible();
  await app.locator('#eviaSupportOverlay .evia-support-back').click();

  await app.locator('#naxosArch').click();
  await app.locator('#eviaPlusMenu .evia-plus-pill', { hasText:'Profile & Settings' }).click();
  await expect(app.locator('#eviaSupportTitle')).toHaveText('Profile & Settings');
  await expect(app.locator('#eviaOpenProfile')).toBeVisible();
  await expect(app.locator('#eviaOpenSettings')).toBeVisible();
  await app.locator('#eviaSupportOverlay .evia-support-back').click();

  await app.locator('#naxosArch').click();
  await app.locator('#eviaPlusMenu .evia-plus-pill', { hasText:'EPA Practice' }).click();
  await expect(app.locator('#eviaSupportTitle')).toHaveText('EPA Practice');
  await expect(app.locator('#eviaEpaMcq')).toBeVisible();
  await expect(app.locator('#eviaEpaDiscussion')).toBeVisible();
  await expect(app.locator('#eviaEpaPractical')).toBeVisible();

  await app.locator('#eviaEpaDiscussion').click();
  await expect(app.locator('.evia-epa-question')).toContainText('checks you would make', { timeout:15000 });
  await expect(app.locator('#eviaEpaRecord')).toBeVisible();
  expect(errors).toEqual([]);
});
