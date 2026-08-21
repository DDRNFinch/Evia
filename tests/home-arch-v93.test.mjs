import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const arp = read("assets/evia-arp-home-score-v94.js");
const observed = read("assets/evia-milos-observed-arch-v94.js");
const nvq = read("assets/evia-nvq-v94.js");
const counts = read("assets/evia-count-display-v94.js");
const index = read("index.html");
const sw = read("sw.js");

test("ARP Home score comes only from actual ARP history and has no polling loop", () => {
  assert.match(arp, /evia-arp-mocks-v1/);
  assert.match(arp, /evia-arp-discussion-v1/);
  assert.match(arp, /evia-arp-practical-v1/);
  assert.match(arp, /percent:attempts\?Math\.round\(\(mc\.bestPercent\+discussion\.bestPercent\+practical\.bestPercent\)\/3\):0/);
  assert.match(arp, /no ARP practice attempted yet/);
  assert.doesNotMatch(arp, /setInterval\(/);
  assert.doesNotMatch(arp, /observe\(document\.documentElement/);
});

test("Home AC uses evidence, RPL and Milos observed coverage", () => {
  assert.match(nvq, /OBS_KEY="evia-mini-milos-observed-v1"/);
  assert.match(nvq, /observedSet\(\)\.forEach\(code=>out\.add\(code\)\)/);
  assert.match(nvq, /setArch\(ksb,"AC",acPercent\(\),"AC"\)/);
  assert.match(nvq, /evia:milos-observed-changed/);
});

test("Milos observed detail remains out of the Home arch and has no polling loop", () => {
  assert.match(observed, /function clearHome\(/);
  assert.match(observed, /\.progress-arch \.evia-milos-arch-marker/);
  assert.match(observed, /assessor-observed/);
  assert.doesNotMatch(observed, /setInterval\(/);
  assert.doesNotMatch(observed, /evia-milos-arch-badge/);
});

test("Evia count and camera guards are event driven", () => {
  assert.doesNotMatch(counts, /observe\(document\.documentElement/);
  assert.doesNotMatch(index, /setInterval\(repairCaptureScreen,120\)/);
  assert.match(index, /__eviaCaptureV94Observer/);
});

test("Evia v94 loads and caches the performance fixes", () => {
  assert.match(index, /evia-app-version\" content=\"94\"/);
  assert.match(index, /evia-arp-home-score-v94\.js\?v=94/);
  assert.match(index, /evia-milos-observed-arch-v94\.js\?v=94/);
  assert.match(index, /evia-nvq-v94\.js\?v=94/);
  assert.match(index, /evia-count-display-v94\.js\?v=94/);
  assert.doesNotMatch(index, /evia-arp-home-score-v93\.js/);
  assert.doesNotMatch(index, /evia-milos-observed-arch-v92\.js/);
  assert.match(sw, /evia-shell-v94/);
  assert.match(sw, /evia-nvq-v94\.js/);
});
