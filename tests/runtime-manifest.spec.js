const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function runtimeScripts() {
  const source = fs.readFileSync(path.join(root, 'evia-runtime-manifest.js'), 'utf8');
  const context = {};
  context.globalThis = context;
  vm.runInNewContext(source, context, { filename: 'evia-runtime-manifest.js' });
  return Array.from(context.EVIA_RUNTIME_SCRIPTS || []);
}

function cleanRuntimePath(value) {
  return String(value || '').replace(/^\.\//, '').split('?')[0];
}

test('runtime manifest is unique and every runtime file exists', async () => {
  const scripts = runtimeScripts();
  expect(scripts.length).toBeGreaterThan(30);
  expect(new Set(scripts).size).toBe(scripts.length);

  for (const script of scripts) {
    expect(script.startsWith('./')).toBeTruthy();
    expect(fs.existsSync(path.join(root, cleanRuntimePath(script))), `missing ${script}`).toBeTruthy();
  }
});

test('service worker uses the manifest as its runtime source and is v81', async () => {
  const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  expect(worker).toContain("importScripts('./evia-runtime-manifest.js')");
  expect(worker).toContain("const C='evia-pwa-v81'");
  expect(worker).toContain("url.searchParams.set('__evia_refresh','81')");
  expect(worker).not.toMatch(/const\s+RUNTIME_SCRIPTS\s*=\s*\[/);
});

test('approved EPA menu runtime loads after AI and before the demo override', async () => {
  const manifest = runtimeScripts().map(cleanRuntimePath);
  const epa = manifest.indexOf('evia-approved-menu-epa-practice-v1.js');
  const ask = manifest.indexOf('evia-approved-ai-ask-v1.js');
  const demo = manifest.indexOf('evia-approved-demo-teach-test-v1.js');
  expect(epa).toBeGreaterThan(ask);
  expect(demo).toBeGreaterThan(epa);
});

test('direct first-load runtime scripts remain an ordered subset of the manifest', async () => {
  const manifest = runtimeScripts().map(cleanRuntimePath);
  const manifestIndex = new Map(manifest.map((item, index) => [item, index]));
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const direct = [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => cleanRuntimePath(match[1]))
    .filter((src) => manifestIndex.has(src));

  expect(direct.length).toBeGreaterThan(10);
  let previous = -1;
  for (const src of direct) {
    const index = manifestIndex.get(src);
    expect(index, `${src} moved out of approved runtime order`).toBeGreaterThan(previous);
    previous = index;
  }
});
