from pathlib import Path

Path('tests/time-only-redesign.spec.js').write_text(r'''const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test('Time renders the approved full-page timeline from existing Evia sources', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('http://127.0.0.1:4173/time-harness', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<!doctype html><html><head></head><body>
        <button id="timeArch" type="button">Time</button>
        <button id="backButton" type="button">Back</button>
        <div id="archDetailPanel" aria-hidden="true"><div class="arch-detail-card"><div id="archDetailTitle" class="arch-detail-title"></div><div id="archDetailContent" class="arch-detail-content"></div></div></div>
        <div id="portfolioPanel" aria-hidden="true"></div>
        <div id="portfolioViewer"><div class="portfolio-viewer-actions"></div></div>
        <div id="portfolioTitle"></div>
        <button id="portfolioDeleteEvidence" type="button">Delete</button>
        <script>
          window.learnerProfile={startDate:'2026-01-01',endDate:'2026-12-31'};
          window.learningEntries=[{id:'learn-1',hours:60,learningDate:'2026-09-03T12:00:00',activityTitle:'Workshop learning'}];
          window.completedEvidencePaths=new Set();
          window.activeCourseTitle='Test course';
          window.archDetailStack=[];
          window.courseProgressPercent=()=>55;
          window.completedCourseProgress=()=>({completed:42,total:100,percent:42});
          window.totalLearningRequirement=()=>100;
          window.learnerLearningHours=()=>60;
          window.loadAttendanceData=()=>({collegeLearningHours:10});
          window.courseLeaves=()=>Array.from({length:100});
          window.officialLearnerProfile=()=>({});
          window.inferredCourseMeta=()=>({courseType:'standard'});
          window.courseMetaMappings=()=>({});
          window.evidencePathKey=path=>JSON.stringify(path||[]);
          window.getPortfolioEntries=async()=>[{id:'evidence-1',createdAt:'2026-09-04T12:00:00',type:'text',mimeType:'text/plain',fileName:'safe-working.txt',path:['Health and safety','K1'],evidenceLabel:'Safe working',methodHeading:'Written',methodLabel:'Reflection'}];
          window.openArchShell=title=>{document.getElementById('archDetailTitle').textContent=title;const p=document.getElementById('archDetailPanel');p.classList.add('open');p.setAttribute('aria-hidden','false')};
          window.closeArchDetail=()=>{const p=document.getElementById('archDetailPanel');p.classList.remove('open');p.setAttribute('aria-hidden','true')};
          window.updateBackButton=()=>{};
          window.openPortfolio=async()=>{const p=document.getElementById('portfolioPanel');p.classList.add('open');p.setAttribute('aria-hidden','false')};
          window.openEvidenceViewer=async entry=>{window.__openedEvidence=entry.id};
          window.closePortfolio=()=>{const p=document.getElementById('portfolioPanel');p.classList.remove('open');p.setAttribute('aria-hidden','true')};
          window.deleteActiveEvidence=async()=>{};
        </script>
      </body></html>`
    });
  });

  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/time-harness', { waitUntil: 'domcontentloaded' });
  await page.addScriptTag({ url: 'http://127.0.0.1:4173/evia-approved-time-monthly-packs-v1.js?v=2' });
  await expect.poll(async () => page.evaluate(() => Boolean(window.EviaMonthlyPacks?.renderTimeTimeline))).toBeTruthy();

  await page.evaluate(() => document.getElementById('timeArch').click());
  await expect(page.locator('.evia-time-screen')).toBeVisible();
  await expect(page.locator('#archDetailPanel')).toHaveClass(/evia-time-fullscreen/);
  await expect(page.locator('[data-evia-time-close]')).toBeVisible();
  await expect(page.locator('.evia-time-key')).toContainText('Course');
  await expect(page.locator('.evia-time-key')).toContainText('Time');
  await expect(page.locator('.evia-time-key')).toContainText('Learning');
  await expect(page.locator('.evia-time-track.fill.course')).toHaveCSS('width', '2px');
  await expect(page.locator('.evia-time-track.fill.time')).toHaveCSS('width', '4px');
  await expect(page.locator('.evia-time-track.fill.learning')).toHaveCSS('width', '2px');

  const progress = await page.locator('.evia-time-screen').evaluate(node => ({
    course: Number(node.dataset.courseProgress),
    time: Number(node.dataset.timeProgress),
    learning: Number(node.dataset.learningProgress)
  }));
  expect(progress.course).toBeCloseTo(42, 3);
  expect(progress.time).toBeCloseTo(55, 3);
  expect(progress.learning).toBeCloseTo(70, 3);

  await expect(page.locator('.evia-time-month-marker[data-month="2026-09"] .evia-time-month-circle')).toContainText('SEP');
  await expect(page.locator('.evia-time-month-marker[data-month="2026-09"] .evia-time-month-circle')).toContainText('2026');
  const evidence = page.locator('.evia-timeline-event.learner.evidence .evia-timeline-event-button');
  await expect(evidence).toContainText('4th - Safe working');
  await page.evaluate(() => document.querySelector('.evia-timeline-event.learner.evidence .evia-timeline-event-button')?.click());
  await expect.poll(async () => page.evaluate(() => window.__openedEvidence || '')).toBe('evidence-1');

  await page.evaluate(() => document.querySelector('[data-evia-time-close]')?.click());
  await expect(page.locator('#archDetailPanel')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#archDetailPanel')).not.toHaveClass(/evia-time-fullscreen/);
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
