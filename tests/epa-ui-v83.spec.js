const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('EPA UI correction matches main Evia visual language and keeps readable contrast', async () => {
  const main = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const fix = fs.readFileSync(path.join(root, 'evia-approved-epa-ui-fix-v1.js'), 'utf8');

  expect(main).toContain('background: transparent;');
  expect(main).toContain('border: 0.026em solid var(--evia-yellow);');
  expect(main).toContain('border: 0.022em solid var(--evia-yellow);');

  expect(fix).toContain('background:transparent!important');
  expect(fix).toContain('border:3px solid var(--evia-yellow,#f5c400)!important');
  expect(fix).toContain('background:rgba(250,249,242,.98)!important');
  expect(fix).toContain('color:#333!important');
  expect(fix).toContain('.epa-v2-card>strong{color:#fff7d2!important;}');
  expect(fix).toContain('.epa-v2-btn{color:#f5e7a9!important;}');
});
