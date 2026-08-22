import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sync = readFileSync(new URL('../assets/evia-milos-review-sync-v97.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const update = JSON.parse(readFileSync(new URL('../update.json', import.meta.url), 'utf8'));
const version = String(update.version);

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

test('Milos review sync remains loaded and cached in the current shell', () => {
  assert.match(index, /evia-milos-review-sync-v97\.js\?v=\d+/);
  assert.match(sw, new RegExp(`evia-shell-v${version}`));
  assert.match(sw, /evia-milos-review-sync-v97\.js/);
});
