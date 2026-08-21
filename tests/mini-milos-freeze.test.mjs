import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../assets/evia-mini-milos-v86.js', import.meta.url), 'utf8');

test('Mini Milos does not eagerly load QR generation on app start', () => {
  assert.doesNotMatch(src, /markObserved\(document\);ensureQr\(\)/);
  assert.match(src, /async function openShare\(\).*await ensureQr\(\)/s);
});

test('Mini Milos observer only processes added element roots', () => {
  assert.match(src, /record\.addedNodes\.forEach\(scheduleUi\)/);
  assert.match(src, /pendingRoots\.add\(node\)/);
  assert.doesNotMatch(src, /new MutationObserver\(\(\)=>\{patchMini\(\);markObserved\(\)\}\)/);
});

test('Mini Milos QR remains anonymous', () => {
  assert.match(src, /NISI:EVIA:PROGRESS:1:/);
  assert.doesNotMatch(src, /learnerName|fullName|email|phone|address|signature/i);
});
