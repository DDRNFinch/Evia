import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const updater = fs.readFileSync(new URL("../assets/evia-updater.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const sw = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const publicSw = fs.readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const update = JSON.parse(fs.readFileSync(new URL("../update.json", import.meta.url), "utf8"));
const publicUpdate = JSON.parse(fs.readFileSync(new URL("../public/update.json", import.meta.url), "utf8"));
const version = String(update.version);
const guard = fs.readFileSync(new URL(`../assets/evia-version-v${version}.js`, import.meta.url), "utf8");

test("Evia shows a persistent update available notification", () => {
  assert.match(updater, /Update available/);
  assert.match(updater, /evia-update-notice/);
  assert.match(updater, /Install update/);
  assert.match(updater, /data-later/);
});

test("Evia checks uncached update and index manifests", () => {
  assert.match(updater, /update\.json\?check=/);
  assert.match(updater, /index\.html\?version-check=/);
  assert.match(updater, /cache:\"no-store\"/);
});

test("Evia no longer silently refreshes when the next cache is ready", () => {
  assert.doesNotMatch(updater, /silentRefresh|silentRefreshing|evia-silent-refresh/);
  assert.doesNotMatch(updater, /rememberInstalled|effectiveVersion/);
});

test("current Evia shell, public assets and manifest agree", () => {
  assert.equal(String(publicUpdate.version), version);
  assert.match(guard, new RegExp(`EviaAppVersion=${version}`));
  assert.match(index, new RegExp(`evia-app-version\\" content=\\"${version}`));
  assert.match(index, new RegExp(`evia-updater\\.js\\?v=${version}`));
  assert.match(index, new RegExp(`evia-version-v${version}\\.js\\?v=${version}`));
  assert.match(sw, new RegExp(`evia-shell-v${version}`));
  assert.equal(publicSw.trimEnd(), sw.trimEnd());
});
