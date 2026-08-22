import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('current Evia shell loads the Milos-matched motion assets', async () => {
  const html = await read('index.html');
  const update = JSON.parse(await read('update.json'));
  assert.match(html, new RegExp(`name="evia-app-version" content="${update.version}"`));
  assert.match(html, /evia-avatar-motion\.css\?v=\d+/);
  assert.match(html, /evia-avatar-motion\.js\?v=\d+/);
  assert.match(html, new RegExp(`evia-version-v${update.version}\\.js\\?v=${update.version}`));
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

test('motion assets are forcibly refreshed by the current offline shell', async () => {
  const sw = await read('sw.js');
  const update = JSON.parse(await read('update.json'));
  assert.match(sw, new RegExp(`evia-shell-v${update.version}`));
  assert.match(sw, new RegExp(`evia-beta-shell-v${update.version}`));
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
