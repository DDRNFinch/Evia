import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const browser=fs.readFileSync(new URL('../assets/evia-nvq-ac-browser-v90.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../assets/evia-nvq-ac-browser-v90.css',import.meta.url),'utf8');
const arch=fs.readFileSync(new URL('../assets/evia-milos-observed-arch-v91.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('NVQ AC coverage includes Milos observed criteria',()=>{
  assert.match(browser,/evia-mini-milos-observed-v1/);
  assert.match(browser,/observed\.forEach\(code=>covered\.add\(code\)\)/);
  assert.match(browser,/Blue o = observed as competent by an assessor in Milos/);
  assert.match(browser,/evia-acb-observed/);
});

test('observed AC marker is blue and distinct from RPL/evidence',()=>{
  assert.match(css,/\.evia-acb-observed\{color:#377fd0/);
  assert.match(css,/\.evia-acb-rpl\{color:#7b3fc6/);
  assert.match(css,/\.evia-acb-evidence\{color:#d8a900/);
});

test('apprenticeship arch shows observed badge and summary',()=>{
  assert.match(arch,/data-arch=\\"KSB\\"/);
  assert.match(arch,/evia-milos-arch-badge/);
  assert.match(arch,/Observed by assessor in Milos/);
  assert.match(arch,/evia-milos-observed-summary/);
});

test('observed arch integration is available offline',()=>{
  assert.match(sw,/evia-milos-observed-arch-v91\.js/);
});
