from pathlib import Path

sync_path = Path('nisia-sync.js')
text = sync_path.read_text(encoding='utf-8')


def replace_once(old, new, label):
    global text
    if text.count(old) != 1:
        raise SystemExit(f'Expected exactly one {label}; found {text.count(old)}')
    text = text.replace(old, new, 1)


replace_once(
    "  let syncRunning = false;\n  let buttonBound = null;",
    "  let syncRunning = false;\n  let buttonBound = null;\n  let pairingQrMode = false;",
    'pairing state marker',
)

insert_marker = "  function evidenceType(entry) {"
helper_block = r'''  function entryAreaComplete(entry) {
    const path = Array.isArray(entry?.path) ? entry.path : [];
    try {
      if (typeof evidencePathKey === 'function' && typeof completedEvidencePaths !== 'undefined') {
        return completedEvidencePaths.has(evidencePathKey(path));
      }
    } catch {}
    try {
      const key = JSON.stringify(path.map(clean));
      const saved = JSON.parse(localStorage.getItem('eviaCompletedEvidencePathsV1') || '[]');
      return Array.isArray(saved) && saved.includes(key);
    } catch { return false; }
  }

'''
if insert_marker not in text:
    raise SystemExit('Evidence type insertion marker not found')
text = text.replace(insert_marker, helper_block + insert_marker, 1)

start = text.find('  function fingerprint(entry, codes) {')
end = text.find('\n  async function shortHash', start)
if start < 0 or end < 0:
    raise SystemExit('Fingerprint block not found')
text = text[:start] + r'''  function fingerprint(entry, codes, areaComplete) {
    return JSON.stringify([
      entry?.id,
      entry?.createdAt,
      entry?.type,
      entry?.mimeType,
      entry?.fileName,
      entry?.blob?.size || 0,
      entry?.path || [],
      evidenceTitle(entry),
      codes,
      areaComplete,
    ]);
  }
''' + text[end:]

replace_once(
    "    const codes = criterionCodesForEntry(entry);\n    const fp = fingerprint(entry, codes);",
    "    const codes = criterionCodesForEntry(entry);\n    const areaComplete = entryAreaComplete(entry);\n    const fp = fingerprint(entry, codes, areaComplete);",
    'sync fingerprint call',
)
replace_once(
    "        path: Array.isArray(entry.path) ? entry.path : [],\n        method:",
    "        path: Array.isArray(entry.path) ? entry.path : [],\n        area_complete: areaComplete,\n        method:",
    'area completion payload',
)
replace_once(
    "    if (importCourse && data.enrolment && data.course) await importAssignedCourse(data);\n    updateConnectionButton();",
    "    if (importCourse && data.enrolment && data.course) await importAssignedCourse(data);\n    await recoverNisiaState(data);\n    updateConnectionButton();",
    'bootstrap recovery hook',
)

recovery_marker = "  function createModal() {"
recovery_block = r'''  function recoveredLocalId(row) {
    const reference = clean(row?.client_reference);
    return reference.startsWith('evia:') ? reference.slice(5) : `nisia-${clean(row?.id)}`;
  }

  function recoveredType(row) {
    const type = clean(row?.evidence_type).toLowerCase();
    if (type === 'written') return 'text';
    if (type === 'other' && /witness/i.test(clean(row?.title))) return 'witness';
    return type || 'document';
  }

  function recoveredExtension(mime, type) {
    const value = clean(mime).toLowerCase();
    if (value.includes('webm')) return 'webm';
    if (value.includes('mp4')) return type === 'audio' ? 'm4a' : 'mp4';
    if (value.includes('jpeg')) return 'jpg';
    if (value.includes('png')) return 'png';
    if (value.includes('webp')) return 'webp';
    if (value.includes('pdf')) return 'pdf';
    if (value.includes('plain')) return 'txt';
    return type === 'text' ? 'txt' : 'bin';
  }

  function restoreLearnerProfile(data) {
    const displayName = clean(data?.profile?.display_name);
    if (!displayName) return false;
    const current = readJson('eviaLearnerProfile', {});
    if (clean(current?.firstName) || clean(current?.nickname)) return false;
    const parts = displayName.split(/\s+/).filter(Boolean);
    const restored = {
      ...current,
      firstName: parts[0] || displayName,
      lastName: parts.slice(1).join(' '),
      nickname: clean(current?.nickname),
      startDate: clean(current?.startDate) || clean(data?.enrolment?.start_date),
      endDate: clean(current?.endDate) || clean(data?.enrolment?.end_date),
    };
    writeJson('eviaLearnerProfile', restored);
    try { learnerProfile = loadLearnerProfile(); } catch {}
    try {
      if (typeof setSpeech === 'function' && typeof homeSpeechLines === 'function' && !document.getElementById('screen')?.classList.contains('active')) setSpeech(homeSpeechLines());
    } catch {}
    return true;
  }

  function openRecoveryPortfolioDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EviaPortfolio', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('evidence')) {
          const store = db.createObjectStore('evidence', { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('type', 'type');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Portfolio recovery database unavailable'));
    });
  }

  async function putRecoveredPortfolioEntry(entry) {
    const db = await openRecoveryPortfolioDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('evidence', 'readwrite');
      tx.objectStore('evidence').put(entry);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  async function recoveryBlob(file) {
    if (!file?.id) return null;
    const nisia = getClient();
    const { data, error } = await nisia.functions.invoke('secure-evidence-download', { body: { file_id: file.id } });
    if (error || !data?.url) throw new Error('Nisia recovery file could not be authorised.');
    const response = await fetch(data.url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Nisia recovery file could not be downloaded.');
    return response.blob();
  }

  function restoreCompletedPath(row) {
    const metadata = row?.source_metadata && typeof row.source_metadata === 'object' ? row.source_metadata : {};
    if (metadata.area_complete !== true || !Array.isArray(metadata.path) || !metadata.path.length) return;
    const key = JSON.stringify(metadata.path.map(clean));
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('eviaCompletedEvidencePathsV1') || '[]'); } catch {}
    const next = new Set(Array.isArray(saved) ? saved.filter((item) => typeof item === 'string') : []);
    next.add(key);
    try { localStorage.setItem('eviaCompletedEvidencePathsV1', JSON.stringify([...next])); } catch {}
  }

  async function recoverNisiaState(data) {
    restoreLearnerProfile(data);
    const rows = Array.isArray(data?.recovery_evidence) ? data.recovery_evidence : [];
    if (!rows.length || !('indexedDB' in window)) return { restored: 0 };
    const existingEntries = await portfolioEntries();
    const existingIds = new Set(existingEntries.map((entry) => String(entry?.id || '')).filter(Boolean));
    const baseline = new Set(readJson(BASELINE_KEY, []));
    let restored = 0;

    for (const row of rows) {
      restoreCompletedPath(row);
      const id = recoveredLocalId(row);
      if (!id || existingIds.has(id)) { if (id) baseline.add(id); continue; }
      const metadata = row?.source_metadata && typeof row.source_metadata === 'object' ? row.source_metadata : {};
      const file = Array.isArray(row?.files) ? row.files[0] : null;
      let blob = null;
      try { if (file) blob = await recoveryBlob(file); } catch (error) { console.warn('Nisia evidence file remains available for later recovery', id, error); continue; }
      const type = recoveredType(row);
      const mimeType = clean(file?.mime_type) || blob?.type || (type === 'text' ? 'text/plain' : 'application/octet-stream');
      const title = clean(row?.title) || 'Recovered Evia evidence';
      const entry = {
        id,
        createdAt: clean(metadata.local_created_at) || clean(row?.created_at) || new Date().toISOString(),
        type,
        mimeType,
        fileName: `recovered-${id}.${recoveredExtension(mimeType, type)}`,
        blob: blob || new Blob([], { type: mimeType }),
        path: Array.isArray(metadata.path) ? metadata.path.map(clean).filter(Boolean) : [],
        courseTitle: clean(data?.course?.title),
        evidenceLabel: title,
        methodHeading: clean(metadata?.method?.heading),
        methodLabel: clean(metadata?.method?.label),
        requirements: metadata?.method?.requirements || null,
        recoveredFromNisia: true,
      };
      await putRecoveredPortfolioEntry(entry);
      existingIds.add(id);
      baseline.add(id);
      restored += 1;
    }

    if (baseline.size) writeJson(BASELINE_KEY, [...baseline]);
    try { completedEvidencePaths = loadCompletedEvidencePaths(); } catch {}
    try { updateArchBars().catch(() => {}); } catch {}
    return { restored };
  }

  async function redeemPairingCode(code, onStatus = () => {}) {
    const cleanCode = clean(code);
    if (!cleanCode) throw new Error('No Nisia connection code was supplied.');
    const nisia = getClient();
    await establishBaseline();
    onStatus('Connecting…');
    const { data, error } = await nisia.functions.invoke('evia-redeem-pairing', { body: { pairing_code: cleanCode } });
    if (error || !data?.token_hash) throw new Error(data?.error || 'That connection code could not be used.');
    const { error: verifyError } = await nisia.auth.verifyOtp({ token_hash: data.token_hash, type: 'email' });
    if (verifyError) throw verifyError;
    localStorage.setItem(CONNECTED_AT_KEY, new Date().toISOString());
    onStatus('Connected. Loading assigned course…');
    const assignment = await loadAssignment({ importCourse: true });
    await syncNewEvidence();
    updateConnectionButton();
    return assignment;
  }

  function pairingCodeFromQr(rawValue) {
    try {
      const parsed = JSON.parse(String(rawValue || ''));
      if (parsed?.type !== 'nisia-evia-pairing-v1') return '';
      return clean(parsed?.pairing_code);
    } catch { return ''; }
  }

  function installPairingQrHandler() {
    try {
      if (typeof handleQrRawValue === 'function' && !handleQrRawValue.__nisiaPairing) {
        const original = handleQrRawValue;
        const wrapped = function(rawValue) {
          if (!pairingQrMode) return original.apply(this, arguments);
          const code = pairingCodeFromQr(rawValue);
          if (!code) {
            if (typeof scannerStatus !== 'undefined' && scannerStatus) scannerStatus.textContent = 'That is not a Nisia connection QR. Keep scanning.';
            return false;
          }
          pairingQrMode = false;
          if (typeof scannerStatus !== 'undefined' && scannerStatus) scannerStatus.textContent = 'Connecting to Nisia…';
          redeemPairingCode(code, (status) => { try { if (scannerStatus) scannerStatus.textContent = status; } catch {} })
            .then((assignment) => {
              try { if (scannerStatus) scannerStatus.textContent = assignment?.course ? `Connected · ${assignment.course.title}` : 'Connected to Nisia.'; } catch {}
              setTimeout(() => { try { closeScanner(false); } catch {} }, 650);
            })
            .catch((error) => {
              console.error('Evia QR pairing failed', error);
              pairingQrMode = true;
              try { if (scannerStatus) scannerStatus.textContent = error?.message || 'Nisia could not connect. Try the QR again.'; } catch {}
              try { if (typeof scanFrame === 'function') requestAnimationFrame(scanFrame); } catch {}
            });
          return true;
        };
        wrapped.__nisiaPairing = true;
        handleQrRawValue = wrapped;
      }
    } catch {}
  }

'''
if recovery_marker not in text:
    raise SystemExit('Recovery insertion marker not found')
text = text.replace(recovery_marker, recovery_block + recovery_marker, 1)

start = text.find('  async function showConnectionModal() {')
end = text.find('\n  async function isConnected()', start)
if start < 0 or end < 0:
    raise SystemExit('Connection modal block not found')
new_modal = r'''  async function showConnectionModal() {
    const nisia = getClient();
    const { data: sessionData } = await nisia.auth.getSession();
    const { overlay, card } = createModal();
    const title = document.createElement('h2'); title.textContent = sessionData?.session ? 'Nisia connected' : 'Connect Evia to Nisia'; title.style.margin = '0'; card.appendChild(title);
    const note = document.createElement('p'); note.style.cssText = 'margin:0;line-height:1.45;font-size:14px;color:#666'; card.appendChild(note);

    if (!sessionData?.session) {
      note.textContent = 'Scan the one-time QR shown for this learner in Nisia. You can still enter the code manually if needed.';
      const message = document.createElement('p'); message.style.cssText = 'margin:0;font-size:13px;line-height:1.4'; card.appendChild(message);
      const scan = modalButton('Scan Nisia QR', true); card.appendChild(scan);
      scan.addEventListener('click', () => {
        pairingQrMode = true;
        overlay.remove();
        try {
          installPairingQrHandler();
          startScanner();
          setTimeout(() => { try { if (scannerStatus) scannerStatus.textContent = 'Scan the Nisia connection QR shown for this learner.'; } catch {} }, 80);
        } catch (error) {
          pairingQrMode = false;
          console.error('Nisia QR scanner could not open', error);
          showConnectionModal().catch(() => {});
        }
      });

      const fallback = document.createElement('div'); fallback.style.cssText = 'display:grid;gap:8px;padding-top:4px;border-top:1px solid #eee'; card.appendChild(fallback);
      const fallbackLabel = document.createElement('p'); fallbackLabel.textContent = 'Manual code fallback'; fallbackLabel.style.cssText = 'margin:0;font-size:12px;color:#777;font-weight:700'; fallback.appendChild(fallbackLabel);
      const input = document.createElement('input'); input.type = 'text'; input.inputMode = 'text'; input.autocomplete = 'one-time-code'; input.placeholder = 'XXXXX-XXXXX-XXXXX'; input.maxLength = 17; input.style.cssText = 'min-height:48px;border:1px solid #ccc;border-radius:14px;padding:0 12px;font:inherit;text-transform:uppercase;letter-spacing:.04em'; fallback.appendChild(input);
      const connect = modalButton('Connect with code'); fallback.appendChild(connect);
      connect.addEventListener('click', async () => {
        const code = input.value.trim(); if (!code) return;
        connect.disabled = true;
        try {
          const assignment = await redeemPairingCode(code, (status) => { message.textContent = status; });
          message.textContent = assignment?.course ? `Connected · ${assignment.course.title}` : 'Connected · no course assigned yet.';
          await sleep(700); overlay.remove();
        } catch (error) {
          console.error('Evia pairing failed', error); message.textContent = error?.message || 'Evia could not connect to Nisia.'; connect.disabled = false;
        }
      });
    } else {
      const assignment = readJson(ASSIGNMENT_KEY, {});
      note.textContent = assignment?.course_title ? `Assigned course: ${assignment.course_title}. Nisia is also available as a recovery copy for synced Evia evidence.` : 'Evia is linked to Nisia. No Naxos-published course is currently assigned.';
      const message = document.createElement('p'); message.style.cssText = 'margin:0;font-size:13px;line-height:1.4'; card.appendChild(message);
      const sync = modalButton('Sync now', true); card.appendChild(sync);
      sync.addEventListener('click', async () => {
        sync.disabled = true; message.textContent = 'Syncing…';
        try { const result = await syncNewEvidence({ force: true }); const fresh = readJson(ASSIGNMENT_KEY, {}); message.textContent = `${result.synced} evidence update${result.synced === 1 ? '' : 's'} synced${fresh.course_title ? ` · ${fresh.course_title}` : ''}.`; }
        catch (error) { message.textContent = error?.message || 'Sync could not complete.'; }
        finally { sync.disabled = false; }
      });
      const disconnect = modalButton('Disconnect Nisia'); card.appendChild(disconnect);
      disconnect.addEventListener('click', async () => {
        await nisia.auth.signOut(); bootstrapData = null; localStorage.removeItem(ASSIGNMENT_KEY); overlay.remove(); updateConnectionButton();
      });
    }
    const close = modalButton('Close'); card.appendChild(close); close.addEventListener('click', () => overlay.remove());
  }
'''
text = text[:start] + new_modal + text[end:]

replace_once(
    "  async function boot() {\n    bindConnectionButton();",
    "  async function boot() {\n    installPairingQrHandler();\n    bindConnectionButton();",
    'boot QR handler',
)
replace_once(
    "      if (connected) {\n        if (!localStorage.getItem(BASELINE_KEY)) await establishBaseline();\n        await loadAssignment({ importCourse: true });\n        await syncNewEvidence();\n      }",
    "      if (connected) {\n        await loadAssignment({ importCourse: true });\n        if (!localStorage.getItem(BASELINE_KEY)) await establishBaseline();\n        await syncNewEvidence();\n      }",
    'connected recovery order',
)

required = [
    'area_complete: areaComplete',
    'entryAreaComplete(entry)',
    'recoverNisiaState(data)',
    "Scan Nisia QR",
    "nisia-evia-pairing-v1",
    "secure-evidence-download",
]
for marker in required:
    if marker not in text:
        raise SystemExit(f'Missing approved Nisia marker: {marker}')

sync_path.write_text(text, encoding='utf-8')

sw_path = Path('service-worker.js')
sw = sw_path.read_text(encoding='utf-8')
replacements = {
    "const C='evia-pwa-v50';": "const C='evia-pwa-v51';",
    "  './nisia-loader.js',": "  './nisia-loader.js?v=3',",
    "  './nisia-sync.js',": "  './nisia-sync.js?v=3',",
    "url.searchParams.set('__evia_refresh','50')": "url.searchParams.set('__evia_refresh','51')",
}
for old, new in replacements.items():
    if sw.count(old) != 1:
        raise SystemExit(f'Service worker marker not unique: {old}')
    sw = sw.replace(old, new, 1)
for marker in ["evia-pwa-v51", "./nisia-loader.js?v=3", "./nisia-sync.js?v=3", "__evia_refresh','51"]:
    if marker not in sw:
        raise SystemExit(f'Missing service worker marker: {marker}')
sw_path.write_text(sw, encoding='utf-8')

print('Approved Evia Nisia completion, recovery and QR patch applied')
