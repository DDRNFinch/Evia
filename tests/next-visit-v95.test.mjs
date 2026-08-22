import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const nextVisit = fs.readFileSync(new URL("../assets/evia-next-visit-v95.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const sw = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const update = JSON.parse(fs.readFileSync(new URL("../update.json", import.meta.url), "utf8"));
const version = String(update.version);

test("Milos review nextReviewDate is persisted for Evia", () => {
  assert.match(nextVisit, /evia-mini-milos-visits-v2/);
  assert.match(nextVisit, /data\.nextReviewDate/);
  assert.match(nextVisit, /evia-milos-next-visit-v1/);
  assert.match(nextVisit, /item\.t==="review"/);
});

test("opening message uses learner first name, status and next visit for five seconds", () => {
  assert.match(nextVisit, /evia-full-name/);
  assert.match(nextVisit, /You are currently/);
  assert.match(nextVisit, /Your next visit is on/);
  assert.match(nextVisit, /setTimeout\(\(\)=>node\.classList\.add\("is-leaving"\),5000\)/);
});

test("review status is simplified to on track or off track", () => {
  assert.match(nextVisit, /\?"on track":"off track"/);
});

test("Targets permanently exposes the locally stored next assessor visit", () => {
  assert.match(nextVisit, /evia-milos-next-visit-target/);
  assert.match(nextVisit, /Next assessor visit/);
  assert.match(nextVisit, /Booked in Milos/);
  assert.match(nextVisit, /\.evia-target-layer \.evia-tools-body/);
});

test("next-visit feature remains enabled in the current Evia shell", () => {
  assert.match(index, /evia-next-visit-v95\.js\?v=\d+/);
  assert.match(sw, new RegExp(`evia-shell-v${version}`));
  assert.match(sw, /evia-next-visit-v95\.js/);
  assert.doesNotMatch(nextVisit, /setInterval\s*\(/);
});
