import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const updater = await readFile(new URL('../assets/evia-updater.js', import.meta.url), 'utf8');
const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');

test('updater accepts both main and legacy shell cache names', () => {
  assert.match(updater, /evia-shell-v\$\{version\}/);
  assert.match(updater, /evia-beta-shell-v\$\{version\}/);
});

test('service worker exposes legacy ready marker for older installed updater', () => {
  assert.match(sw, /LEGACY_READY_CACHE\s*=\s*'evia-beta-shell-v88'/);
  assert.match(sw, /await caches\.open\(LEGACY_READY_CACHE\)/);
});

test('service worker refreshes updater instead of migrating a stale copy', () => {
  assert.match(sw, /'\.\/assets\/evia-updater\.js'/);
  assert.match(sw, /'\/Evia\/assets\/evia-updater\.js'/);
});
