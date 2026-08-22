import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const index=fs.readFileSync("index.html","utf8");
const live=fs.readFileSync("assets/evia-selfobs-live.js","utf8");
const updater=fs.readFileSync("assets/evia-updater.js","utf8");
const sw=fs.readFileSync("sw.js","utf8");
const publicSw=fs.readFileSync("public/sw.js","utf8");
const manifest=JSON.parse(fs.readFileSync("update.json","utf8"));

test("Evia v99 keeps the shell mounted when the assistant opens",()=>{
  assert.match(live,/function syncShell\(\)/);
  assert.match(live,/function refreshShellMeta\(\)/);
  assert.match(live,/\$\("\[data-evia\]"\)\.onclick=.*syncShell\(\)/);
  assert.doesNotMatch(live,/\$\("\[data-evia\]"\)\.onclick=.*mount\(\)/);
  assert.doesNotMatch(live,/panel\.innerHTML=""/);
});

test("Evia v99 has one service-worker owner",()=>{
  assert.doesNotMatch(live,/serviceWorker\.register/);
  assert.match(updater,/serviceWorker\.register/);
});

test("Evia v99 no longer loads duplicate motion layers",()=>{
  for(const name of ["evia-avatar-motion","evia-premium-motion","evia-avatar-life","evia-v73-page-handoff"]){
    assert.equal(index.includes(name),false,`${name} must not be loaded`);
  }
});

test("Evia v99 runtime, manifest and offline cache agree",()=>{
  assert.equal(manifest.version,"99");
  assert.match(index,/evia-app-version" content="99"/);
  assert.match(index,/evia-version-v99\.js\?v=99/);
  assert.match(sw,/evia-shell-v99/);
  assert.match(sw,/evia-version-v99\.js/);
  assert.equal(publicSw.trimEnd(),sw.trimEnd());
});

test("obsolete migration chunks are absent",()=>{
  assert.equal(fs.existsSync(".v42-transfer"),false);
});
