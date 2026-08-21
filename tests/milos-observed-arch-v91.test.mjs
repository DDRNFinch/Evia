import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const browser=fs.readFileSync(new URL('../assets/evia-nvq-ac-browser-v90.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../assets/evia-nvq-ac-browser-v90.css',import.meta.url),'utf8');
const arch=fs.readFileSync(new URL('../assets/evia-milos-observed-arch-v94.js',import.meta.url),'utf8');
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

test('observed markers remain inside coverage detail, not Home',()=>{
  assert.match(arch,/function clearHome\(/);
  assert.match(arch,/Observed as competent by assessor in Milos/);
  assert.match(arch,/evia-milos-observed-summary-v94/);
  assert.doesNotMatch(arch,/setInterval\(/);
});

test('observed arch integration is available offline',()=>{
  assert.match(sw,/evia-milos-observed-arch-v94\.js/);
});
