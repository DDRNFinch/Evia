from pathlib import Path

p = Path('index.html')
s = p.read_text()


def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'missing marker: {label}')
    s = s.replace(old, new, 1)

rep("""    .portfolio-main {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
""", """    .portfolio-main {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .portfolio-item[role=\"button\"] { cursor: pointer; }

    .portfolio-viewer {
      width: 100%;
      min-height: 0;
      display: none;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      padding: 2px 2px 6px;
    }

    .portfolio-viewer.open { display: flex; }

    .portfolio-viewer-meta {
      font-size: 12px;
      line-height: 1.4;
      color: rgba(45, 45, 45, 0.62);
      white-space: pre-wrap;
    }

    .portfolio-preview {
      width: 100%;
      min-height: 160px;
      max-height: 52dvh;
      overflow: auto;
      border: 1px solid rgba(245, 196, 0, 0.28);
      background: rgba(250, 249, 242, 0.9);
      border-radius: 18px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .portfolio-preview img,
    .portfolio-preview video { max-width: 100%; max-height: 46dvh; border-radius: 12px; }
    .portfolio-preview audio { width: 100%; }
    .portfolio-preview-text { width: 100%; white-space: pre-wrap; font-size: 14px; line-height: 1.45; color: rgba(45,45,45,.78); }
    .portfolio-edit-textarea { width: 100%; min-height: 220px; resize: vertical; border: 1px solid rgba(245,196,0,.3); border-radius: 16px; padding: 12px; outline: 0; color: #333; background: rgba(250,249,242,.92); font-size: 14px; line-height: 1.45; }
    .portfolio-edit-textarea[hidden] { display: none; }
    .portfolio-viewer-actions { width: 100%; display: flex; justify-content: center; gap: 10px; }
""", 'portfolio viewer css')

rep("""          <div class=\"portfolio-status\" id=\"portfolioStatus\"></div>
        </div>

        <form class=\"learner-profile\" id=\"learnerProfileForm\">
""", """          <div class=\"portfolio-status\" id=\"portfolioStatus\"></div>
        </div>

        <div class=\"portfolio-viewer\" id=\"portfolioViewer\">
          <div class=\"portfolio-viewer-meta\" id=\"portfolioViewerMeta\"></div>
          <div class=\"portfolio-preview\" id=\"portfolioPreview\"></div>
          <textarea class=\"portfolio-edit-textarea\" id=\"portfolioEditTextarea\" aria-label=\"Edit written evidence\" hidden></textarea>
          <input id=\"portfolioEditFileInput\" type=\"file\" hidden>
          <div class=\"portfolio-viewer-actions\">
            <button class=\"secondary-button\" id=\"portfolioEditEvidence\" type=\"button\">Edit</button>
            <button class=\"secondary-button\" id=\"portfolioDeleteEvidence\" type=\"button\">Delete</button>
          </div>
          <div class=\"portfolio-status\" id=\"portfolioViewerStatus\"></div>
        </div>

        <form class=\"learner-profile\" id=\"learnerProfileForm\">
""", 'portfolio viewer html')

rep("""    const portfolioList = document.getElementById('portfolioList');
    const portfolioStatus = document.getElementById('portfolioStatus');
    const learnerProfileButton = document.getElementById('learnerProfileButton');
""", """    const portfolioList = document.getElementById('portfolioList');
    const portfolioStatus = document.getElementById('portfolioStatus');
    const portfolioViewer = document.getElementById('portfolioViewer');
    const portfolioViewerMeta = document.getElementById('portfolioViewerMeta');
    const portfolioPreview = document.getElementById('portfolioPreview');
    const portfolioEditTextarea = document.getElementById('portfolioEditTextarea');
    const portfolioEditFileInput = document.getElementById('portfolioEditFileInput');
    const portfolioEditEvidence = document.getElementById('portfolioEditEvidence');
    const portfolioDeleteEvidence = document.getElementById('portfolioDeleteEvidence');
    const portfolioViewerStatus = document.getElementById('portfolioViewerStatus');
    const learnerProfileButton = document.getElementById('learnerProfileButton');
""", 'portfolio viewer dom refs')

rep("""    let learnerProfile = loadLearnerProfile();
    let profileViewOpen = false;
    let speechRunId = 0;
""", """    let learnerProfile = loadLearnerProfile();
    let profileViewOpen = false;
    let portfolioViewerOpen = false;
    let activePortfolioEntry = null;
    let portfolioEntriesById = new Map();
    let portfolioViewerUrl = '';
    let portfolioEditingText = false;
    let speechRunId = 0;
""", 'portfolio viewer state')

rep("""    async function getPortfolioEntries() {
      const db = await openPortfolioDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('evidence', 'readonly');
        const request = tx.objectStore('evidence').getAll();
        request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      });
    }
""", """    async function getPortfolioEntries() {
      const db = await openPortfolioDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('evidence', 'readonly');
        const request = tx.objectStore('evidence').getAll();
        request.onsuccess = () => resolve((request.result || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      });
    }

    async function deletePortfolioEntry(id) {
      const db = await openPortfolioDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('evidence', 'readwrite');
        tx.objectStore('evidence').delete(id);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
      });
    }
""", 'delete portfolio entry')

rep("""    function markEvidencePathComplete(path) {
      const key = evidencePathKey(path);
      if (key === '[]') return;
      completedEvidencePaths.add(key);
      saveCompletedEvidencePaths();
    }
""", """    function markEvidencePathComplete(path) {
      const key = evidencePathKey(path);
      if (key === '[]') return;
      completedEvidencePaths.add(key);
      saveCompletedEvidencePaths();
    }

    function clearEvidencePathComplete(path) {
      const key = evidencePathKey(path);
      if (key === '[]') return;
      completedEvidencePaths.delete(key);
      saveCompletedEvidencePaths();
    }
""", 'clear completion path')

old_portfolio = """    async function openPortfolio() {
      naxosMenu.classList.remove('open');
      naxosArch.setAttribute('aria-expanded', 'false');
      portfolioPanel.classList.add('open');
      portfolioPanel.setAttribute('aria-hidden', 'false');
      closeLearnerProfile();
      portfolioStatus.textContent = '';
      updateBackButton();

      try {
        const entries = await getPortfolioEntries();
        portfolioList.innerHTML = '';
        if (!entries.length) {
          portfolioList.innerHTML = '<div class=\"portfolio-item\"><strong>No evidence yet</strong><span>Evidence you capture will appear here.</span></div>';
          return;
        }
        entries.forEach((entry) => {
          const item = document.createElement('div');
          item.className = 'portfolio-item';
          const path = Array.isArray(entry.path) ? entry.path.join(' › ') : entry.evidenceLabel || 'Evidence';
          const date = new Date(entry.createdAt).toLocaleString();
          item.innerHTML = `<strong>${path}</strong><span>${entry.methodHeading || ''}${entry.methodLabel ? ` — ${entry.methodLabel}` : ''}</span><span>${date} · ${formatBytes(entry.blob?.size || 0)}</span>`;
          portfolioList.appendChild(item);
        });
      } catch (error) {
        portfolioList.innerHTML = '<div class=\"portfolio-item\"><strong>Portfolio unavailable</strong><span>Local evidence storage could not be opened.</span></div>';
      }
    }

    function closePortfolio(reopenNaxos = true) {
      closeLearnerProfile();
      portfolioPanel.classList.remove('open');
      portfolioPanel.setAttribute('aria-hidden', 'true');
      if (reopenNaxos) {
        naxosMenu.classList.add('open');
        naxosArch.setAttribute('aria-expanded', 'true');
      }
      updateBackButton();
    }
"""
new_portfolio = """    function revokePortfolioViewerUrl() {
      if (portfolioViewerUrl) URL.revokeObjectURL(portfolioViewerUrl);
      portfolioViewerUrl = '';
    }

    async function renderPortfolioList() {
      try {
        const entries = await getPortfolioEntries();
        portfolioEntriesById = new Map(entries.map((entry) => [entry.id, entry]));
        portfolioList.innerHTML = '';
        if (!entries.length) {
          portfolioList.innerHTML = '<div class=\"portfolio-item\"><strong>No evidence yet</strong><span>Evidence you capture will appear here.</span></div>';
          return;
        }
        entries.forEach((entry) => {
          const item = document.createElement('div');
          item.className = 'portfolio-item';
          item.dataset.evidenceId = entry.id;
          item.setAttribute('role', 'button');
          item.setAttribute('tabindex', '0');
          const path = Array.isArray(entry.path) ? entry.path.join(' › ') : entry.evidenceLabel || 'Evidence';
          const date = new Date(entry.createdAt).toLocaleString();
          item.innerHTML = `<strong>${path}</strong><span>${entry.methodHeading || ''}${entry.methodLabel ? ` — ${entry.methodLabel}` : ''}</span><span>${date} · ${formatBytes(entry.blob?.size || 0)}</span>`;
          portfolioList.appendChild(item);
        });
      } catch (error) {
        portfolioList.innerHTML = '<div class=\"portfolio-item\"><strong>Portfolio unavailable</strong><span>Local evidence storage could not be opened.</span></div>';
      }
    }

    function closeEvidenceViewer() {
      revokePortfolioViewerUrl();
      portfolioViewerOpen = false;
      activePortfolioEntry = null;
      portfolioEditingText = false;
      portfolioViewer.classList.remove('open');
      portfolioPreview.innerHTML = '';
      portfolioEditTextarea.hidden = true;
      portfolioEditTextarea.value = '';
      portfolioEditFileInput.value = '';
      portfolioViewerStatus.textContent = '';
      portfolioEditEvidence.textContent = 'Edit';
      portfolioMain.style.display = 'flex';
      portfolioTitle.textContent = 'My Portfolio';
      updateBackButton();
    }

    async function renderEvidenceViewer(entry) {
      revokePortfolioViewerUrl();
      portfolioPreview.innerHTML = '';
      portfolioEditTextarea.hidden = true;
      portfolioEditTextarea.value = '';
      portfolioEditingText = false;
      portfolioEditEvidence.textContent = 'Edit';
      portfolioViewerStatus.textContent = '';

      const path = Array.isArray(entry.path) ? entry.path.join(' › ') : entry.evidenceLabel || 'Evidence';
      const method = `${entry.methodHeading || ''}${entry.methodLabel ? ` — ${entry.methodLabel}` : ''}`.trim();
      const date = new Date(entry.createdAt).toLocaleString();
      portfolioViewerMeta.textContent = [path, method, `${date} · ${formatBytes(entry.blob?.size || 0)}`].filter(Boolean).join('\n');

      const mime = cleanText(entry.mimeType || entry.blob?.type).toLowerCase();
      if (entry.type === 'text' || mime.startsWith('text/')) {
        const text = await entry.blob.text();
        const pre = document.createElement('div');
        pre.className = 'portfolio-preview-text';
        pre.textContent = text;
        portfolioPreview.appendChild(pre);
        return;
      }

      portfolioViewerUrl = URL.createObjectURL(entry.blob);
      if (entry.type === 'photo' || mime.startsWith('image/')) {
        const image = document.createElement('img');
        image.src = portfolioViewerUrl;
        image.alt = entry.evidenceLabel || 'Evidence photo';
        portfolioPreview.appendChild(image);
      } else if (entry.type === 'video' || mime.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = portfolioViewerUrl;
        video.controls = true;
        video.playsInline = true;
        portfolioPreview.appendChild(video);
      } else if (entry.type === 'audio' || mime.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = portfolioViewerUrl;
        audio.controls = true;
        portfolioPreview.appendChild(audio);
      } else {
        const link = document.createElement('a');
        link.className = 'secondary-button';
        link.href = portfolioViewerUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.download = entry.originalFileName || entry.fileName || 'evidence-file';
        link.textContent = `Open ${entry.originalFileName || entry.fileName || 'file'}`;
        portfolioPreview.appendChild(link);
      }
    }

    async function openEvidenceViewer(entry) {
      if (!entry) return;
      closeLearnerProfile();
      portfolioMain.style.display = 'none';
      portfolioViewer.classList.add('open');
      portfolioViewerOpen = true;
      activePortfolioEntry = entry;
      portfolioTitle.textContent = 'Evidence';
      await renderEvidenceViewer(entry);
      updateBackButton();
    }

    async function replaceActiveEvidenceFile(file) {
      if (!file || !activePortfolioEntry) return;
      const entry = activePortfolioEntry;
      const ext = witnessFileExtension(file);
      const baseName = (entry.fileName || safeFilename(entry.evidenceLabel || 'evidence')).replace(/\.[^.]+$/, '');
      const updated = {
        ...entry,
        updatedAt: new Date().toISOString(),
        mimeType: file.type || entry.mimeType || 'application/octet-stream',
        fileName: `${baseName}.${ext}`,
        originalFileName: cleanText(file.name),
        blob: file
      };
      await addPortfolioEntry(updated);
      activePortfolioEntry = updated;
      portfolioEntriesById.set(updated.id, updated);
      await renderPortfolioList();
      await renderEvidenceViewer(updated);
      portfolioViewerStatus.textContent = 'Evidence updated.';
    }

    async function editActiveEvidence() {
      if (!activePortfolioEntry) return;
      const mime = cleanText(activePortfolioEntry.mimeType || activePortfolioEntry.blob?.type).toLowerCase();
      if (activePortfolioEntry.type === 'text' || mime.startsWith('text/')) {
        if (!portfolioEditingText) {
          portfolioEditTextarea.value = await activePortfolioEntry.blob.text();
          portfolioPreview.innerHTML = '';
          portfolioEditTextarea.hidden = false;
          portfolioEditingText = true;
          portfolioEditEvidence.textContent = 'Save Edit';
          return;
        }
        const value = portfolioEditTextarea.value.trim();
        if (!value) {
          portfolioViewerStatus.textContent = 'Written evidence cannot be empty.';
          return;
        }
        const updated = {
          ...activePortfolioEntry,
          updatedAt: new Date().toISOString(),
          mimeType: 'text/plain;charset=utf-8',
          blob: new Blob([value], { type: 'text/plain;charset=utf-8' })
        };
        await addPortfolioEntry(updated);
        activePortfolioEntry = updated;
        portfolioEntriesById.set(updated.id, updated);
        await renderPortfolioList();
        await renderEvidenceViewer(updated);
        portfolioViewerStatus.textContent = 'Evidence updated.';
        return;
      }

      portfolioEditFileInput.value = '';
      portfolioEditFileInput.removeAttribute('accept');
      if (activePortfolioEntry.type === 'photo') portfolioEditFileInput.accept = 'image/*';
      else if (activePortfolioEntry.type === 'video') portfolioEditFileInput.accept = 'video/*';
      else if (activePortfolioEntry.type === 'audio') portfolioEditFileInput.accept = 'audio/*';
      portfolioEditFileInput.click();
    }

    async function deleteActiveEvidence() {
      if (!activePortfolioEntry) return;
      if (!window.confirm('Delete this evidence?')) return;
      const deleted = activePortfolioEntry;
      try {
        await deletePortfolioEntry(deleted.id);
        clearEvidencePathComplete(deleted.path);
        portfolioEntriesById.delete(deleted.id);
        closeEvidenceViewer();
        await renderPortfolioList();
        renderPills(false);
        updateArchBars().catch(() => {});
        portfolioStatus.textContent = 'Evidence deleted.';
      } catch (error) {
        portfolioViewerStatus.textContent = 'Could not delete this evidence.';
      }
    }

    async function openPortfolio() {
      naxosMenu.classList.remove('open');
      naxosArch.setAttribute('aria-expanded', 'false');
      portfolioPanel.classList.add('open');
      portfolioPanel.setAttribute('aria-hidden', 'false');
      if (portfolioViewerOpen) closeEvidenceViewer();
      closeLearnerProfile();
      portfolioStatus.textContent = '';
      updateBackButton();
      await renderPortfolioList();
    }

    function closePortfolio(reopenNaxos = true) {
      if (portfolioViewerOpen) closeEvidenceViewer();
      closeLearnerProfile();
      portfolioPanel.classList.remove('open');
      portfolioPanel.setAttribute('aria-hidden', 'true');
      if (reopenNaxos) {
        naxosMenu.classList.add('open');
        naxosArch.setAttribute('aria-expanded', 'true');
      }
      updateBackButton();
    }
"""
rep(old_portfolio, new_portfolio, 'portfolio functions')

rep("""        const entries = await getPortfolioEntries();
        if (!entries.length) {
          portfolioStatus.textContent = 'There is no evidence to download yet.';
          return;
        }

        const metadata = entries.map(({ blob, ...entry }) => ({ ...entry, size: blob?.size || 0 }));
        const files = entries.map((entry) => ({
          name: `evidence/${entry.fileName}`,
          data: entry.blob,
          date: new Date(entry.createdAt)
        }));
""", """        const entries = await getPortfolioEntries();
        if (!entries.length && !learningEntries.length) {
          portfolioStatus.textContent = 'There is no evidence or learning to download yet.';
          return;
        }

        const metadata = entries.map(({ blob, ...entry }) => ({ ...entry, size: blob?.size || 0 }));
        const files = entries.map((entry) => ({
          name: `evidence/${entry.fileName}`,
          data: entry.blob,
          date: new Date(entry.createdAt)
        }));
        if (learningEntries.length) {
          files.push({
            name: 'learn/learning.json',
            data: new TextEncoder().encode(JSON.stringify({ entries: learningEntries }, null, 2)),
            date: new Date()
          });
          learningEntries.forEach((entry) => {
            files.push({
              name: `learn/${safeFilename(entry.evidenceLabel || 'learning')}-${safeFilename(entry.id || String(Date.now()))}.txt`,
              data: new TextEncoder().encode(entry.text || ''),
              date: new Date(entry.createdAt || Date.now())
            });
          });
        }
""", 'zip learn files')

rep("""            learner: officialLearnerProfile(),
            evidence: metadata
""", """            learner: officialLearnerProfile(),
            evidence: metadata,
            learning: learningEntries
""", 'portfolio json learning')

rep("""    function showSupabasePlaceholder() {
      portfolioStatus.textContent = 'Supabase upload is ready to connect when the website endpoint is added. Your portfolio remains stored locally.';
    }
""", """    function showSupabasePlaceholder() {
      portfolioStatus.textContent = 'Upload Portfolio is ready to connect when the website endpoint is added. The upload package will include your portfolio evidence and Learn entries; everything remains stored locally until then.';
    }
""", 'upload placeholder learning')

rep("""      if (portfolioPanel.classList.contains('open')) {
        if (profileViewOpen) {
          closeLearnerProfile();
          return;
        }
        closePortfolio(true);
        return;
      }
""", """      if (portfolioPanel.classList.contains('open')) {
        if (portfolioViewerOpen) {
          closeEvidenceViewer();
          return;
        }
        if (profileViewOpen) {
          closeLearnerProfile();
          return;
        }
        closePortfolio(true);
        return;
      }
""", 'portfolio back viewer')

rep("""    learnerProfileButton.addEventListener('click', openLearnerProfile);
    learnerProfileForm.addEventListener('submit', (event) => {
""", """    portfolioList.addEventListener('click', (event) => {
      const item = event.target.closest('[data-evidence-id]');
      if (!item) return;
      openEvidenceViewer(portfolioEntriesById.get(item.dataset.evidenceId));
    });
    portfolioList.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const item = event.target.closest('[data-evidence-id]');
      if (!item) return;
      event.preventDefault();
      openEvidenceViewer(portfolioEntriesById.get(item.dataset.evidenceId));
    });
    portfolioEditEvidence.addEventListener('click', () => editActiveEvidence().catch(() => { portfolioViewerStatus.textContent = 'Could not update this evidence.'; }));
    portfolioEditFileInput.addEventListener('change', () => replaceActiveEvidenceFile(portfolioEditFileInput.files?.[0]).catch(() => { portfolioViewerStatus.textContent = 'Could not update this evidence.'; }));
    portfolioDeleteEvidence.addEventListener('click', deleteActiveEvidence);

    learnerProfileButton.addEventListener('click', openLearnerProfile);
    learnerProfileForm.addEventListener('submit', (event) => {
""", 'portfolio viewer handlers')

# Existing profile opening should never leave viewer visible.
rep("""    function openLearnerProfile() {
      profileViewOpen = true;
      populateLearnerProfileForm();
""", """    function openLearnerProfile() {
      if (portfolioViewerOpen) closeEvidenceViewer();
      profileViewOpen = true;
      populateLearnerProfileForm();
""", 'profile closes viewer')

p.write_text(s)
