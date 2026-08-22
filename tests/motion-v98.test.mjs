import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Evia 98 loads the Milos-matched motion assets', async () => {
  const html = await read('index.html');
  assert.match(html, /name="evia-app-version" content="98"/);
  assert.match(html, /evia-avatar-motion\.css\?v=98/);
  assert.match(html, /evia-avatar-motion\.js\?v=98/);
  assert.match(html, /evia-version-v98\.js\?v=98/);
});

test('avatar and menu use Milos timing and coordinated transitions', async () => {
  const js = await read('assets/evia-avatar-motion.js');
  assert.match(js, /const DURATION=920/);
  assert.match(js, /const MENU_DELAY=140/);
  assert.match(js, /const MENU_IN=580/);
  assert.match(js, /const MENU_OUT=360/);
  assert.match(js, /cubic-bezier\(\.22,1,\.36,1\)/);
  assert.match(js, /function animateMenuEnter/);
  assert.match(js, /function animateMenuExit/);
  assert.match(js, /function animateHomeEnter/);
  assert.doesNotMatch(js, /cubic-bezier\(\.16,1,\.3,1\)/);
});

test('motion assets are forcibly refreshed by the v98 offline shell', async () => {
  const sw = await read('sw.js');
  assert.match(sw, /evia-shell-v98/);
  assert.match(sw, /evia-beta-shell-v98/);
  assert.match(sw, /\.\/assets\/evia-avatar-motion\.js/);
  assert.match(sw, /\.\/assets\/evia-avatar-motion\.css/);
  assert.match(sw, /\/Evia\/assets\/evia-avatar-motion\.js/);
  assert.match(sw, /\/Evia\/assets\/evia-avatar-motion\.css/);
});

test('motion proxies cannot block taps and reduced motion remains respected', async () => {
  const css = await read('assets/evia-avatar-motion.css');
  assert.match(css, /\.evia-menu-motion-proxy\{/);
  assert.match(css, /pointer-events:none!important/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});