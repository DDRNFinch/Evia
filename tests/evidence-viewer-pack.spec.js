const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test('evidence pack builder creates a portable offline presentation viewer for media and written evidence', async ({ page }) => {
  await page.setContent('<!doctype html><html><body><script>window.courseMetaMappings=()=>({K1:["Unit A","Skill one"],S2:["Unit A","Skill two"]});</script></body></html>');
  await page.addScriptTag({ url: 'http://127.0.0.1:4173/evia-evidence-viewer-pack-v1.js?v=1' });
  const built = await page.evaluate(async () => {
    const entries = [
      { id:'v1', createdAt:'2026-09-05T10:00:00', type:'video', mimeType:'video/mp4', fileName:'video.mp4', path:['Unit A','Skill one'], evidenceLabel:'Wall construction video', methodHeading:'Video', methodLabel:'Practical evidence', assessmentGuide:'Show the checks and finished result.', blob:new Blob(['video'],{type:'video/mp4'}) },
      { id:'a1', createdAt:'2026-09-06T10:00:00', type:'audio', mimeType:'audio/webm', fileName:'audio.webm', path:['Unit A','Skill two'], evidenceLabel:'Learner reflection', methodHeading:'Audio', blob:new Blob(['audio'],{type:'audio/webm'}) },
      { id:'p1', createdAt:'2026-09-07T10:00:00', type:'photo', mimeType:'image/jpeg', fileName:'photo.jpg', path:['Unit A','Skill one'], evidenceLabel:'Finished work', blob:new Blob(['photo'],{type:'image/jpeg'}) },
      { id:'t1', createdAt:'2026-09-08T10:00:00', type:'text', mimeType:'text/plain', fileName:'writeup.txt', path:['Unit A','Skill one'], evidenceLabel:'Written explanation', blob:new Blob(['I checked the work and explained why the method was suitable.'],{type:'text/plain'}) }
    ];
    const files = await window.EviaEvidencePackViewer.buildViewerFiles(entries, {
      scopeType:'month', scopeLabel:'September 2026', course:'Test Standard', learner:{firstName:'Test',lastName:'Learner'},
      filePaths:['Evidence/01-video.mp4','Evidence/02-audio.webm','Evidence/03-photo.jpg','Evidence/04-writeup.txt']
    });
    return { names:files.map(file=>file.name), html:new TextDecoder().decode(files[0].data), readme:new TextDecoder().decode(files[1].data) };
  });

  expect(built.names).toEqual(['Open Evidence Viewer.html','Evidence Viewer - Read Me.txt']);
  expect(built.html).toContain('September 2026');
  expect(built.html).toContain('Evidence/01-video.mp4');
  expect(built.html).toContain('Evidence/02-audio.webm');
  expect(built.html).toContain('Evidence/03-photo.jpg');
  expect(built.html).toContain('I checked the work and explained why the method was suitable.');
  expect(built.html).toContain('K1');
  expect(built.html).not.toContain('https://');
  expect(built.html).not.toContain('http://');
  expect(built.readme).toContain('Extract this ZIP before opening the viewer.');

  await page.setContent(built.html, { waitUntil:'domcontentloaded' });
  await expect(page.locator('#slide')).toContainText('Portable offline evidence pack');
  await page.locator('#next').click();
  await expect(page.locator('video')).toHaveAttribute('src','Evidence/01-video.mp4');
  await expect(page.locator('video')).toHaveAttribute('preload','auto');
  await expect(page.locator('#slide')).toContainText('Wall construction video');
  await page.locator('#next').click();
  await expect(page.locator('audio')).toHaveAttribute('src','Evidence/02-audio.webm');
  await expect(page.locator('audio')).toHaveAttribute('preload','auto');
  await page.locator('#next').click();
  await expect(page.locator('img')).toHaveAttribute('src','Evidence/03-photo.jpg');
  await page.locator('#next').click();
  await expect(page.locator('.text-evidence')).toContainText('I checked the work');

  await page.setViewportSize({ width:390, height:844 });
  await expect(page.locator('#menu')).toBeVisible();
  await expect(page.locator('#slide')).toBeVisible();
});

test('month and portfolio downloads both add the viewer without replacing existing pack contents', async () => {
  const manifest = fs.readFileSync('evia-runtime-manifest.js','utf8');
  const index = fs.readFileSync('index.html','utf8');
  const time = fs.readFileSync('evia-approved-time-monthly-packs-v1.js','utf8');
  const viewer = fs.readFileSync('evia-evidence-viewer-pack-v1.js','utf8');

  expect(manifest).toContain("'./evia-evidence-viewer-pack-v1.js?v=1'");
  expect(manifest).toContain("'./evia-approved-time-monthly-packs-v1.js?v=8'");
  expect(index).toContain('EviaEvidencePackViewer.buildViewerFiles(entries');
  expect(index).toContain("name: 'portfolio.json'");
  expect(time).toContain('EviaEvidencePackViewer.buildViewerFiles(entries');
  expect(time).toContain("name:`${label} - Evidence.pdf`");
  expect(time).toContain("name:'month-evidence.json'");
  expect(viewer).toContain("name:'Open Evidence Viewer.html'");
  expect(viewer).toContain("preload=\"auto\"");
  expect(viewer).toContain('@media(max-width:760px)');
});
