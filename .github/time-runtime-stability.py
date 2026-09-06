from pathlib import Path
import json
import re

INDEX = Path('index.html')
MANIFEST = Path('evia-runtime-manifest.js')
WORKER = Path('service-worker.js')
UPDATES = Path('evia-approved-updates-stable-v1.js')
RELEASE = Path('evia-release.json')
RUNTIME_TEST = Path('tests/runtime-manifest.spec.js')
EPA_MENU_TEST = Path('tests/epa-menu.spec.js')
EPA_HOME_TEST = Path('tests/epa-home-evia-v84.spec.js')

# 1) Make the runtime explicit on first load instead of depending on a service-worker reload.
manifest = MANIFEST.read_text(encoding='utf-8')
match = re.search(r"const scripts=\[(.*?)\];", manifest, re.S)
if not match:
    raise SystemExit('Could not read Evia runtime manifest')
scripts = re.findall(r"'([^']+)'", match.group(1))
if len(scripts) < 30:
    raise SystemExit('Runtime manifest unexpectedly short')

index = INDEX.read_text(encoding='utf-8')
head_script = f'<script src="{scripts[0]}"></script>'
if index.count(head_script) != 1:
    raise SystemExit('Expected the first runtime script once in the document head')
marker = '  <!-- Current Evia runtime: direct first-load path; the service worker skips runtime files already present here. -->'
if index.count(marker) != 1:
    raise SystemExit('Expected one current direct-runtime block')
start = index.index(marker)
end = index.index('</body>', start)
runtime_block = '  <!-- Evia runtime: explicit first-load path mirrors the runtime manifest. The service worker is cache/offline support, not a second boot path. -->\n'
runtime_block += '\n'.join(f'  <script src="{src}"></script>' for src in scripts[1:]) + '\n\n'
index = index[:start] + runtime_block + index[end:]
INDEX.write_text(index, encoding='utf-8')

# 2) Make updates deliberate. A service worker must never navigate a learner away mid-task.
worker = WORKER.read_text(encoding='utf-8')
worker = worker.replace("const RELEASE_VERSION='1.0';", "const RELEASE_VERSION='1.1';", 1)
old_marker = "const INTERNAL_RELOAD_MARKER_URL=new URL('./__evia-internal-reload__',self.registration.scope).href;"
new_marker = "const LEGACY_INTERNAL_RELOAD_MARKER_URL=new URL('./__evia-internal-reload__',self.registration.scope).href;"
if worker.count(old_marker) != 1:
    raise SystemExit('Expected one legacy internal reload marker')
worker = worker.replace(old_marker, new_marker, 1)
old_install = "    if(!installedVersion||installedVersion===RELEASE_VERSION)await marker.put(INTERNAL_RELOAD_MARKER_URL,new Response('1',{headers:{'content-type':'text/plain'}}));\n    if(!installedVersion||installedVersion===RELEASE_VERSION)await self.skipWaiting();"
new_install = "    if(!installedVersion)await self.skipWaiting();"
if worker.count(old_install) != 1:
    raise SystemExit('Expected one automatic internal-reload install block')
worker = worker.replace(old_install, new_install, 1)
old_activate = "    const internalReload=await marker.match(INTERNAL_RELOAD_MARKER_URL);\n    await marker.put(RELEASE_MARKER_URL,new Response(RELEASE_VERSION,{headers:{'content-type':'text/plain'}}));\n    await self.clients.claim();\n    if(internalReload){\n      await marker.delete(INTERNAL_RELOAD_MARKER_URL);\n      const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});\n      await Promise.all(windows.map(client=>{\n        try{const url=new URL(client.url);url.searchParams.set('__evia_refresh','85');return client.navigate(url.href).catch(()=>null)}catch{return null}\n      }));\n    }"
new_activate = "    await marker.delete(LEGACY_INTERNAL_RELOAD_MARKER_URL);\n    await marker.put(RELEASE_MARKER_URL,new Response(RELEASE_VERSION,{headers:{'content-type':'text/plain'}}));\n    await self.clients.claim();"
if worker.count(old_activate) != 1:
    raise SystemExit('Expected one automatic client-navigation activate block')
worker = worker.replace(old_activate, new_activate, 1)
if 'client.navigate(' in worker or '__evia_refresh' in worker:
    raise SystemExit('Automatic service-worker navigation still remains')
WORKER.write_text(worker, encoding='utf-8')

# 3) Keep release metadata aligned with the worker/update UI.
updates = UPDATES.read_text(encoding='utf-8')
if updates.count("const CURRENT_VERSION='1.0';") != 1:
    raise SystemExit('Expected one current Evia update version')
UPDATES.write_text(updates.replace("const CURRENT_VERSION='1.0';", "const CURRENT_VERSION='1.1';", 1), encoding='utf-8')

release = {
    'version': '1.1',
    'released': '2026-09-06',
    'title': 'Evia v1.1',
    'details': 'This update makes Time and app startup more reliable while keeping learner data on this device.',
    'whatsNew': [
        'Time now uses one timeline source instead of overlapping old and new renderers.',
        'EPA Practice reports now appear directly on the Time timeline with their useful feedback.',
        'Evia now loads its approved runtime explicitly and no longer relies on an automatic service-worker reload to finish starting.'
    ]
}
RELEASE.write_text(json.dumps(release, indent=2) + '\n', encoding='utf-8')

# 4) EPA timeline smoke data must include the real Time prerequisite: course dates.
epa = EPA_MENU_TEST.read_text(encoding='utf-8')
seed_marker = "  await app.evaluate(() => {\n    localStorage.setItem('eviaEpaPracticeReportsV1'"
seed_replacement = "  await app.evaluate(() => {\n    learnerProfile.startDate='2026-01-01';\n    learnerProfile.endDate='2026-12-31';\n    localStorage.setItem('eviaEpaPracticeReportsV1'"
if epa.count(seed_marker) != 1:
    raise SystemExit('Expected one EPA report smoke seed block')
epa = epa.replace(seed_marker, seed_replacement, 1)
EPA_MENU_TEST.write_text(epa, encoding='utf-8')

# 5) The EPA identity regression must open the real runtime zone when it already exists.
# With explicit first-load runtime, creating a second element with the same id is invalid and
# makes document.getElementById() intentionally resolve the original closed zone.
epa_home = EPA_HOME_TEST.read_text(encoding='utf-8')
old_zone_setup = """  await page.evaluate(() => {\n    const zone = document.createElement('section');\n    zone.id = 'eviaEpaZoneV2';\n    zone.className = 'evia-epa-zone-v2 open';\n    zone.innerHTML = '<div class=\"evia-epa-stage-v2\"><div class=\"evia-epa-avatar-v2\"></div></div>';\n    document.getElementById('screen').appendChild(zone);\n  });"""
new_zone_setup = """  await page.evaluate(() => {\n    const existing = document.getElementById('eviaEpaZoneV2');\n    if (existing) {\n      existing.classList.add('open');\n      return;\n    }\n    const zone = document.createElement('section');\n    zone.id = 'eviaEpaZoneV2';\n    zone.className = 'evia-epa-zone-v2 open';\n    zone.innerHTML = '<div class=\"evia-epa-stage-v2\"><div class=\"evia-epa-avatar-v2\"></div></div>';\n    document.getElementById('screen').appendChild(zone);\n  });"""
if epa_home.count(old_zone_setup) != 1:
    raise SystemExit('Expected one legacy EPA identity zone setup')
epa_home = epa_home.replace(old_zone_setup, new_zone_setup, 1)
EPA_HOME_TEST.write_text(epa_home, encoding='utf-8')

# 6) Strengthen the architectural regression tests.
test = RUNTIME_TEST.read_text(encoding='utf-8')
old_worker_expect = "  expect(worker).toContain(\"url.searchParams.set('__evia_refresh','85')\");"
new_worker_expect = "  expect(worker).toContain(\"const RELEASE_VERSION='1.1'\");\n  expect(worker).not.toContain('client.navigate(');\n  expect(worker).not.toContain('__evia_refresh');"
if test.count(old_worker_expect) != 1:
    raise SystemExit('Expected generated v85 refresh assertion')
test = test.replace(old_worker_expect, new_worker_expect, 1)

old_direct = "  expect(direct.length).toBeGreaterThan(10);\n  let previous = -1;\n  for (const src of direct) {\n    const index = manifestIndex.get(src);\n    expect(index, `${src} moved out of approved runtime order`).toBeGreaterThan(previous);\n    previous = index;\n  }"
new_direct = "  expect(direct).toEqual(manifest);"
if test.count(old_direct) != 1:
    raise SystemExit('Expected direct runtime subset assertion block')
test = test.replace(old_direct, new_direct, 1)

append = """

test('release version is aligned across the worker, update UI and release metadata', async () => {
  const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const updates = fs.readFileSync(path.join(root, 'evia-approved-updates-stable-v1.js'), 'utf8');
  const release = JSON.parse(fs.readFileSync(path.join(root, 'evia-release.json'), 'utf8'));
  expect(worker).toContain("const RELEASE_VERSION='1.1'");
  expect(updates).toContain("const CURRENT_VERSION='1.1'");
  expect(release.version).toBe('1.1');
});
"""
if "release version is aligned across the worker" in test:
    raise SystemExit('Release alignment test already exists')
test += append
RUNTIME_TEST.write_text(test, encoding='utf-8')
