import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const index = read('index.html');
const browser = read('assets/evia-nvq-ac-browser-v90.js');
const css = read('assets/evia-nvq-ac-browser-v90.css');
const sw = read('sw.js');
const publicSw = read('public/sw.js');
const update = JSON.parse(read('update.json'));

test('v90 loads the full AC browser before the legacy NVQ AC click handler', () => {
  assert.match(index, /evia-app-version" content="90"/);
  const browserAt = index.indexOf('evia-nvq-ac-browser-v90.js?v=90');
  const legacyAt = index.indexOf('evia-nvq.js?v=89');
  assert.ok(browserAt > 0 && legacyAt > browserAt);
  assert.match(index, /evia-nvq-ac-browser-v90\.css\?v=90/);
});

test('AC browser exposes both holistic P\/T and qualification unit views', () => {
  assert.match(browser, /By P \/ T/);
  assert.match(browser, /By unit/);
  assert.match(browser, /codeTheme/);
  assert.match(browser, /unitCodes/);
  assert.match(browser, /LO \$\{esc\(lo\)\}/);
  assert.match(browser, /EviaTrowelACText/);
  assert.match(browser, /full handbook wording/);
});

test('AC rows retain evidence and RPL status separately', () => {
  assert.match(browser, /evia-acb-evidence/);
  assert.match(browser, /evia-acb-rpl/);
  assert.match(browser, /Recognised prior learning/);
  assert.match(css, /color:#7b3fc6/);
  assert.match(css, /color:#d8a900/);
});

test('offline workers and update metadata publish v90 consistently', () => {
  assert.equal(sw, publicSw);
  assert.match(sw, /evia-shell-v90/);
  assert.match(sw, /evia-nvq-ac-browser-v90\.js/);
  assert.match(sw, /evia-nvq-ac-browser-v90\.css/);
  assert.equal(update.version, '90');
});
