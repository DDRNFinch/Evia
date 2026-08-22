import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sync = readFileSync(new URL('../assets/evia-milos-review-sync-v97.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

test('progress review display removes the duplicate heading and uses UK dates', () => {
  assert.match(sync, /head\.textContent=\"Progress review\"/);
  assert.match(sync, /h2\.remove\(\)/);
  assert.match(sync, /`Completed \$\{value\}`/);
  assert.match(sync, /\$\{m\[3\]\}\/\$\{m\[2\]\}\/\$\{m\[1\]\}/);
});

test('new Milos review replaces active targets and archives the old period', () => {
  assert.match(sync, /TARGETS_KEY=\"evia-targets-v1\"/);
  assert.match(sync, /archiveState\(old\)/);
  assert.match(sync, /dueDate:due,calculatedForDate:due/);
  assert.match(sync, /type:\"milos\"/);
  assert.match(sync, /sourceReviewId/);
});

test('Evia 97 loads and caches the review sync module', () => {
  assert.match(index, /evia-app-version\" content=\"97\"/);
  assert.match(index, /evia-milos-review-sync-v97\.js\?v=97/);
  assert.match(sw, /evia-shell-v97/);
  assert.match(sw, /evia-milos-review-sync-v97\.js/);
});
