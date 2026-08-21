import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const arp = read("assets/evia-arp-home-score-v93.js");
const observed = read("assets/evia-milos-observed-arch-v92.js");
const index = read("index.html");
const sw = read("sw.js");

test("ARP home score comes only from actual ARP history", () => {
  assert.match(arp, /evia-arp-mocks-v1/);
  assert.match(arp, /evia-arp-discussion-v1/);
  assert.match(arp, /evia-arp-practical-v1/);
  assert.match(arp, /const percent=attempts\?Math\.round\(\(mc\.bestPercent\+discussion\.bestPercent\+practical\.bestPercent\)\/3\):0/);
  assert.match(arp, /no ARP practice attempted yet/);
  assert.match(arp, /\.arch-number/);
  assert.match(arp, /\.arch-value/);
});

test("Milos observed summary is removed from Home but retained inside coverage views", () => {
  assert.match(observed, /clearHomeArchBadges/);
  assert.match(observed, /\.progress-arch\[data-arch=\"KSB\"\]/);
  assert.doesNotMatch(observed, /function patchArchButtons/);
  assert.match(observed, /\.evia-nvq-ac-browser-layer \.evia-nvq-overall/);
  assert.match(observed, /assessor-observed AC/);
  assert.match(observed, /patchCodeRows/);
});

test("Evia v93 loads and caches the fixes", () => {
  assert.match(index, /evia-app-version\" content=\"93\"/);
  assert.match(index, /evia-arp-home-score-v93\.js\?v=93/);
  assert.match(index, /evia-milos-observed-arch-v92\.js\?v=93/);
  assert.match(sw, /evia-shell-v93/);
  assert.match(sw, /evia-arp-home-score-v93\.js/);
});
