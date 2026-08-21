import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rpl = fs.readFileSync(new URL('../assets/evia-rpl-unit-order-v88.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

test('NVQ RPL is unit-first and uses the qualification unit order', () => {
  assert.match(rpl, /Array\.isArray\(c\.units\)&&c\.units\.length\?c\.units/);
  assert.match(rpl, /m\.unitCodes\?\.\[String\(unit\)\]/);
  assert.match(rpl, /\.sort\(numeric\)/);
  assert.match(rpl, /RPL by unit/);
  assert.match(rpl, /Units are listed in qualification order/);
});

test('each unit presents ACs directly in numerical order', () => {
  assert.match(rpl, /AC \$\{p\.slice\(1\)\.join\("\."\)\}/);
  assert.match(rpl, /data-rpl-unit-code/);
  assert.match(rpl, /Assessment criteria are shown in official numerical order/);
  assert.doesNotMatch(rpl, /data-rpl-cat/);
  assert.doesNotMatch(rpl, /data-rpl-job/);
});

test('v88 loads the unit-first override after the existing RPL runtime and caches it offline', () => {
  const oldAt = index.indexOf('evia-rpl-course.js?v=43');
  const unitAt = index.indexOf('evia-rpl-unit-order-v88.js?v=88');
  assert.ok(oldAt >= 0 && unitAt > oldAt);
  assert.match(index, /evia-app-version" content="88/);
  assert.match(sw, /evia-shell-v88/);
  assert.match(sw, /\.\/assets\/evia-rpl-unit-order-v88\.js/);
});
