(() => {
  'use strict';

  const SUPABASE_URL = 'https://ffgfigkeeeauzkifopei.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_w_R4Kqq3UqNKQuv6erQzAQ_bXBkw8Bc';
  const AUTH_STORAGE_KEY = 'nisia-evia-auth-v1';
  const ASSIGNMENT_KEY = 'eviaNisiaAssignmentV1';
  const BASELINE_KEY = 'eviaNisiaEvidenceBaselineV1';
  const SYNC_STATE_KEY = 'eviaNisiaEvidenceSyncV1';
  const CONNECTED_AT_KEY = 'eviaNisiaConnectedAtV1';
  const COURSE_HASH_KEY = 'eviaNisiaCourseHashV1';
  const COURSE_BACKUP_KEY = 'eviaNisiaPreLinkCourseBackupV1';
  let client = null;
  let bootstrapData = null;
  let syncRunning = false;
  let buttonBound = null;

  function getClient() {
    if (client) return client;
    if (!window.supabase?.createClient) throw new Error('Nisia connection library is unavailable.');
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: AUTH_STORAGE_KEY,
      },
    });
    return client;
  }

  function readJson(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; } catch { return fallback; }
  }
  function writeJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
  function clean(value) { return typeof value === 'string' ? value.trim() : ''; }
  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function portfolioEntries() {
    try {
      if (typeof getPortfolioEntries === 'function') return await getPortfolioEntries();
    } catch (error) { console.warn('Could not read Evia portfolio for Nisia sync', error); }
    return [];
  }

  async function establishBaseline() {
    if (localStorage.getItem(BASELINE_KEY)) return;
    const entries = await portfolioEntries();
    writeJson(BASELINE_KEY, entries.map((entry) => String(entry?.id || '')).filter(Boolean));
    localStorage.setItem(CONNECTED_AT_KEY, new Date().toISOString());
  }

  function backupCurrentCourseOnce() {
    if (localStorage.getItem(COURSE_BACKUP_KEY)) return;
    const keys = ['eviaNaxosCourse', 'eviaNaxosCourseTitle', 'eviaNaxosCourseMetaV1'];
    const backup = {};
    keys.forEach((key) => { const value = localStorage.getItem(key); if (value !== null) backup[key] = value; });
    writeJson(COURSE_BACKUP_KEY, backup);
  }

  function coursePointerType(pointer) {
    if (clean(pointer?.courseType).toLowerCase() === 'ksb') return 'ksb';
    if (clean(pointer?.courseType).toLowerCase() === 'nvq') return 'nvq';
    if (pointer?.type === 'evia-mapping-pack-url') return 'nvq';
    return 'ksb';
  }

  async function importAssignedCourse(data) {
    const course = data?.course;
    const pointer = course?.source_pointer;
    if (!course || !pointer) return { imported: false, reason: 'The assigned course has not been published from Naxos.' };
    const currentHash = localStorage.getItem(COURSE_HASH_KEY) || '';
    if (course.content_hash && currentHash === course.content_hash) return { imported: false, unchanged: true };

    backupCurrentCourseOnce();
    const type = coursePointerType(pointer);
    if (type === 'nvq') {
      if (typeof importNaxosNvqPack !== 'function') throw new Error('Evia NVQ importer is unavailable.');
      await importNaxosNvqPack(pointer);
    } else {
      if (typeof importNaxosKsbPack !== 'function') throw new Error('Evia KSB importer is unavailable.');
      await importNaxosKsbPack(pointer);
    }
    if (course.content_hash) localStorage.setItem(COURSE_HASH_KEY, course.content_hash);
    return { imported: true };
  }

  async function loadAssignment({ importCourse = true } = {}) {
    const nisia = getClient();
    const { data: sessionData } = await nisia.auth.getSession();
    if (!sessionData?.session) { bootstrapData = null; return null; }
    const { data, error } = await nisia.functions.invoke('evia-bootstrap', { body: {} });
    if (error || !data?.connected) throw new Error(data?.error || 'Nisia could not load this learner assignment.');
    bootstrapData = data;
    writeJson(ASSIGNMENT_KEY, {
      organisation_id: data.organisation_id,
      member_id: data.member_id,
      learner_id: data.learner_id,
      enrolment_id: data.enrolment?.id || null,
      course_id: data.course?.id || null,
      course_title: data.course?.title || '',
      course_code: data.course?.code || '',
      content_hash: data.course?.content_hash || '',
      criterion_codes: (data.criteria || []).map((criterion) => criterion.code).filter(Boolean),
      synced_at: new Date().toISOString(),
    });
    if (importCourse && data.enrolment && data.course) await importAssignedCourse(data);
    updateConnectionButton();
    return data;
  }

  function samePath(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, index) => clean(item) === clean(b[index]));
    if (typeof a === 'string' && Array.isArray(b)) return a === b.join(' > ') || a === b.join(' / ');
    if (Array.isArray(a) && typeof b === 'string') return samePath(b, a);
    return clean(a) === clean(b);
  }

  function criterionCodesForEntry(entry) {
    let mappings = null;
    try { if (typeof courseMetaMappings === 'function') mappings = courseMetaMappings(); } catch {}
    if (!mappings || typeof mappings !== 'object') return [];
    const entryPath = Array.isArray(entry?.path) ? entry.path : [];
    const matches = [];
    for (const [code, mapped] of Object.entries(mappings)) {
      const candidates = Array.isArray(mapped) ? mapped : [mapped];
      const pathCandidates = candidates.some((candidate) => Array.isArray(candidate)) ? candidates : [mapped];
      if (pathCandidates.some((candidate) => samePath(candidate, entryPath))) matches.push(code);
    }
    return [...new Set(matches)].filter(Boolean);
  }

  function evidenceType(entry) {
    const type = clean(entry?.type).toLowerCase();
    const mime = clean(entry?.mimeType).toLowerCase();
    if (type.includes('photo') || mime.startsWith('image/')) return 'photo';
    if (type.includes('video') || mime.startsWith('video/')) return 'video';
    if (type.includes('audio') || mime.startsWith('audio/')) return 'audio';
    if (type.includes('text') || type.includes('written') || mime === 'text/plain') return 'written';
    if (type.includes('document') || type.includes('file') || mime.includes('pdf') || mime.includes('word') || mime.includes('sheet')) return 'document';
    return 'other';
  }

  function evidenceTitle(entry) {
    return clean(entry?.evidenceLabel) || clean(entry?.methodLabel) || clean(entry?.fileName) || `Evia ${evidenceType(entry)} evidence`;
  }

  function fingerprint(entry, codes) {
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
    ]);
  }

  async function shortHash(value) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(value)));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 28);
  }

  function fileExtension(entry) {
    const fileName = clean(entry?.fileName);
    const match = fileName.match(/(\.[A-Za-z0-9]{1,8})$/);
    if (match) return match[1].toLowerCase();
    const mime = clean(entry?.mimeType).toLowerCase();
    if (mime === 'image/jpeg') return '.jpg';
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    if (mime === 'video/mp4') return '.mp4';
    if (mime === 'audio/mpeg') return '.mp3';
    if (mime === 'audio/mp4') return '.m4a';
    if (mime === 'application/pdf') return '.pdf';
    if (mime === 'text/plain') return '.txt';
    return '';
  }

  async function syncFile(entry, result) {
    if (!(entry?.blob instanceof Blob) || !entry.blob.size) return true;
    const nisia = getClient();
    const { data: existing, error: existingError } = await nisia
      .from('evidence_files')
      .select('id, storage_path')
      .eq('evidence_id', result.evidence_id)
      .limit(1);
    if (existingError) throw existingError;
    if (existing?.length) return true;

    const name = `${await shortHash(`evia:${entry.id}`)}${fileExtension(entry)}`;
    const storagePath = `${result.storage_path_prefix}${name}`;
    const mimeType = clean(entry.mimeType) || entry.blob.type || 'application/octet-stream';
    const { error: uploadError } = await nisia.storage.from('evidence').upload(storagePath, entry.blob, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError && !/already exists|duplicate/i.test(uploadError.message || '')) throw uploadError;

    const { error: fileRowError } = await nisia.from('evidence_files').insert({
      organisation_id: result.organisation_id,
      evidence_id: result.evidence_id,
      uploaded_by_member_id: result.member_id,
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: entry.blob.size,
    });
    if (fileRowError && !/duplicate|unique/i.test(fileRowError.message || '')) throw fileRowError;
    return true;
  }

  async function syncOne(entry, state) {
    const assignment = bootstrapData || await loadAssignment({ importCourse: false });
    if (!assignment?.enrolment?.id) return false;
    const codes = criterionCodesForEntry(entry);
    const fp = fingerprint(entry, codes);
    if (state[entry.id]?.fingerprint === fp && state[entry.id]?.complete) return false;

    const nisia = getClient();
    const { data, error } = await nisia.functions.invoke('evia-sync-evidence', {
      body: {
        enrolment_id: assignment.enrolment.id,
        client_reference: `evia:${entry.id}`,
        evidence_type: evidenceType(entry),
        title: evidenceTitle(entry),
        criterion_codes: codes,
        path: Array.isArray(entry.path) ? entry.path : [],
        method: {
          heading: clean(entry.methodHeading),
          label: clean(entry.methodLabel),
          requirements: entry.requirements || null,
        },
        created_at: clean(entry.createdAt),
      },
    });
    if (error || !data?.evidence_id) throw new Error(data?.error || 'Nisia evidence sync failed.');
    await syncFile(entry, data);
    state[entry.id] = { fingerprint: fp, evidence_id: data.evidence_id, complete: true, synced_at: new Date().toISOString(), mapped: data.mapped_criteria };
    return true;
  }

  async function syncNewEvidence({ force = false } = {}) {
    if (syncRunning || !navigator.onLine) return { synced: 0 };
    const nisia = getClient();
    const { data: sessionData } = await nisia.auth.getSession();
    if (!sessionData?.session) return { synced: 0 };
    syncRunning = true;
    let synced = 0;
    try {
      if (!bootstrapData || force) await loadAssignment({ importCourse: true });
      const baseline = new Set(readJson(BASELINE_KEY, []));
      if (!localStorage.getItem(BASELINE_KEY)) await establishBaseline();
      const currentBaseline = new Set(readJson(BASELINE_KEY, []));
      const state = readJson(SYNC_STATE_KEY, {});
      const entries = await portfolioEntries();
      for (const entry of entries) {
        const id = String(entry?.id || '');
        if (!id || currentBaseline.has(id) || baseline.has(id)) continue;
        try { if (await syncOne(entry, state)) { synced += 1; writeJson(SYNC_STATE_KEY, state); } }
        catch (error) { console.warn('Evia evidence remains queued for Nisia', id, error); }
      }
      writeJson(SYNC_STATE_KEY, state);
      return { synced };
    } finally {
      syncRunning = false;
      updateConnectionButton();
    }
  }

  function createModal() {
    const overlay = document.createElement('div');
    overlay.id = 'eviaNisiaModal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.38);display:grid;place-items:center;padding:20px';
    const card = document.createElement('div');
    card.style.cssText = 'width:min(100%,390px);max-height:85vh;overflow:auto;background:#fff;border-radius:24px;padding:20px;display:grid;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,.18);font-family:inherit;color:#202020';
    overlay.appendChild(card);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    return { overlay, card };
  }

  function modalButton(text, primary = false) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = text;
    button.style.cssText = `min-height:44px;border:${primary ? '0' : '1px solid #ddd'};border-radius:999px;padding:0 15px;font:inherit;font-weight:750;background:${primary ? '#222' : '#fff'};color:${primary ? '#fff' : '#222'}`;
    return button;
  }

  async function showConnectionModal() {
    const nisia = getClient();
    const { data: sessionData } = await nisia.auth.getSession();
    const { overlay, card } = createModal();
    const title = document.createElement('h2'); title.textContent = sessionData?.session ? 'Nisia connected' : 'Connect Evia to Nisia'; title.style.margin = '0'; card.appendChild(title);
    const note = document.createElement('p'); note.style.cssText = 'margin:0;line-height:1.45;font-size:14px;color:#666'; card.appendChild(note);

    if (!sessionData?.session) {
      note.textContent = 'Create a one-time Evia connection code from this learner in Nisia, then enter it here. Your existing Evia profile and existing portfolio stay on this device.';
      const input = document.createElement('input'); input.type = 'text'; input.inputMode = 'text'; input.autocomplete = 'one-time-code'; input.placeholder = 'XXXXX-XXXXX-XXXXX'; input.maxLength = 17; input.style.cssText = 'min-height:48px;border:1px solid #ccc;border-radius:14px;padding:0 12px;font:inherit;text-transform:uppercase;letter-spacing:.04em'; card.appendChild(input);
      const message = document.createElement('p'); message.style.cssText = 'margin:0;font-size:13px;line-height:1.4'; card.appendChild(message);
      const connect = modalButton('Connect', true); card.appendChild(connect);
      connect.addEventListener('click', async () => {
        const code = input.value.trim(); if (!code) return;
        connect.disabled = true; message.textContent = 'Connecting…';
        try {
          await establishBaseline();
          const { data, error } = await nisia.functions.invoke('evia-redeem-pairing', { body: { pairing_code: code } });
          if (error || !data?.token_hash) throw new Error(data?.error || 'That connection code could not be used.');
          const { error: verifyError } = await nisia.auth.verifyOtp({ token_hash: data.token_hash, type: 'email' });
          if (verifyError) throw verifyError;
          localStorage.setItem(CONNECTED_AT_KEY, new Date().toISOString());
          message.textContent = 'Connected. Loading assigned course…';
          const assignment = await loadAssignment({ importCourse: true });
          message.textContent = assignment?.course ? `Connected · ${assignment.course.title}` : 'Connected · no course assigned yet.';
          await syncNewEvidence();
          await sleep(900); overlay.remove(); updateConnectionButton();
        } catch (error) {
          console.error('Evia pairing failed', error); message.textContent = error?.message || 'Evia could not connect to Nisia.'; connect.disabled = false;
        }
      });
    } else {
      const assignment = readJson(ASSIGNMENT_KEY, {});
      note.textContent = assignment?.course_title ? `Assigned course: ${assignment.course_title}. Existing pre-connection evidence has not been uploaded.` : 'Evia is linked to Nisia. No Naxos-published course is currently assigned.';
      const message = document.createElement('p'); message.style.cssText = 'margin:0;font-size:13px;line-height:1.4'; card.appendChild(message);
      const sync = modalButton('Sync now', true); card.appendChild(sync);
      sync.addEventListener('click', async () => {
        sync.disabled = true; message.textContent = 'Syncing…';
        try { const result = await syncNewEvidence({ force: true }); const fresh = readJson(ASSIGNMENT_KEY, {}); message.textContent = `${result.synced} new evidence item${result.synced === 1 ? '' : 's'} synced${fresh.course_title ? ` · ${fresh.course_title}` : ''}.`; }
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

  async function isConnected() {
    try { const { data } = await getClient().auth.getSession(); return Boolean(data?.session); } catch { return false; }
  }

  async function updateConnectionButton() {
    const button = document.getElementById('uploadPortfolio');
    if (!button) return;
    const connected = await isConnected();
    button.textContent = connected ? 'Sync with Nisia' : 'Connect Nisia';
  }

  function bindConnectionButton() {
    const button = document.getElementById('uploadPortfolio');
    if (!button || buttonBound === button) return;
    buttonBound = button;
    button.addEventListener('click', (event) => {
      event.preventDefault(); event.stopImmediatePropagation(); showConnectionModal().catch((error) => console.error('Could not open Nisia connection', error));
    }, true);
    updateConnectionButton();
  }

  async function boot() {
    bindConnectionButton();
    const observer = new MutationObserver(() => bindConnectionButton());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('online', () => syncNewEvidence({ force: true }).catch(() => {}));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNewEvidence({ force: true }).catch(() => {}); });
    setInterval(() => syncNewEvidence().catch(() => {}), 30000);

    try {
      const connected = await isConnected();
      if (connected) {
        if (!localStorage.getItem(BASELINE_KEY)) await establishBaseline();
        await loadAssignment({ importCourse: true });
        await syncNewEvidence();
      }
    } catch (error) { console.warn('Nisia connection will retry when online', error); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();