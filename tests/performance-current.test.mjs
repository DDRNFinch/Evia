import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const live=fs.readFileSync("assets/evia-selfobs-live.js","utf8");
const motionCss=fs.readFileSync("assets/evia-selfobs-live.css","utf8");
const updater=fs.readFileSync("assets/evia-updater.js","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const publicSw=fs.readFileSync("public/sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));
const version=String(manifest.version);

test("Evia keeps one mounted interaction shell",()=>{
  assert.match(live,/function syncShell\(\)/);
  assert.match(live,/function refreshShellMeta\(\)/);
  assert.match(live,/\$\("\[data-evia\]"\)\.onclick=.*syncShell\(\)/);
  assert.doesNotMatch(live,/\$\("\[data-evia\]"\)\.onclick=.*mount\(\)/);
  assert.doesNotMatch(live,/panel\.innerHTML=""/);
});

test("Evia motion matches the Milos interaction timing",()=>{
  assert.match(motionCss,/top \.92s var\(--ease-out\)/);
  assert.match(motionCss,/width \.92s var\(--ease-out\)/);
  assert.match(motionCss,/height \.92s var\(--ease-out\)/);
  assert.match(motionCss,/evia-milos-view-in \.46s var\(--ease-out\)/);
  assert.match(motionCss,/opacity \.36s ease \.14s/);
  assert.match(motionCss,/transform \.58s var\(--ease-out\) \.14s/);
  assert.match(motionCss,/top:40\.5%/);
  assert.match(motionCss,/--evia-size:5\.9rem/);
});

test("Evia has one service-worker owner and one current cache",()=>{
  assert.doesNotMatch(live,/serviceWorker\.register/);
  assert.match(updater,/serviceWorker\.register/);
  assert.match(updater,new RegExp(`evia-shell-v\\$\\{version\\}`));
  assert.doesNotMatch(updater,/evia-beta-shell-v/);
  assert.doesNotMatch(sw,/LEGACY_READY_CACHE|migrateOldShell/);
});

test("duplicate motion and production audit layers stay removed",()=>{
  for(const name of ["evia-avatar-motion","evia-premium-motion","evia-avatar-life","evia-v73-page-handoff","evia-6570-smoke"]){
    assert.equal(index.includes(name),false,`${name} must not be loaded`);
  }
  assert.equal(fs.existsSync("assets/evia-6570-smoke.js"),false);
  assert.equal(fs.existsSync(".v42-transfer"),false);
});

test("runtime, manifest and offline cache agree",()=>{
  assert.match(index,new RegExp(`evia-app-version\\" content=\\"${version}`));
  assert.match(index,new RegExp(`evia-version-v${version}\\.js\\?v=${version}`));
  assert.match(index,new RegExp(`evia-updater\\.js\\?v=${version}`));
  assert.match(sw,new RegExp(`evia-shell-v${version}`));
  assert.match(sw,new RegExp(`evia-version-v${version}\\.js`));
  assert.equal(publicSw.trimEnd(),sw.trimEnd());
});
