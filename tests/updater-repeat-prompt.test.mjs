import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const updater = readFileSync(new URL('../assets/evia-updater.js', import.meta.url), 'utf8');
const rootSw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const publicSw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

test('successful Evia installs are remembered across app launches', () => {
  assert.match(updater, /INSTALLED_KEY="evia-installed-version"/);
  assert.match(updater, /rememberInstalled\(manifest\.version\)/);
  assert.match(updater, /effectiveVersion\(\)/);
});

test('an already-installed offline shell is recovered without reopening the update panel', () => {
  assert.match(updater, /hasOfflineCache\(m\.version\).*deployedVersion\(m\.version\)/s);
  assert.match(updater, /silentRefresh\(m\.version\)/);
});

test('root and public service workers stay identical', () => {
  assert.equal(rootSw, publicSw);
  assert.match(rootSw, /evia-shell-v88/);
  assert.match(rootSw, /evia-updater\.js/);
});
