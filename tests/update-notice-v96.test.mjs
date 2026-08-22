import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const updater = fs.readFileSync(new URL("../assets/evia-updater.js", import.meta.url), "utf8");
const guard = fs.readFileSync(new URL("../assets/evia-version-v96.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const sw = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const update = JSON.parse(fs.readFileSync(new URL("../update.json", import.meta.url), "utf8"));

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

test("Evia 96 shell and manifest agree", () => {
  assert.equal(update.version, "96");
  assert.match(guard, /EviaAppVersion=96/);
  assert.match(index, /evia-app-version\" content=\"96/);
  assert.match(index, /evia-updater\.js\?v=96/);
  assert.match(index, /evia-version-v96\.js\?v=96/);
  assert.match(sw, /evia-shell-v96/);
  assert.match(sw, /evia-version-v96\.js/);
});
