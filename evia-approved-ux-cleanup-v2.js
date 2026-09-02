(() => {
  'use strict';

  const QR_CACHE = 'evia-feature-lib-v1';
  const QR_LIBRARY_URL = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  const TARGETS_KEY = 'eviaMilosTargetsV1';
  const EPA_CONFIDENCE_KEY = 'eviaEpaConfidenceV1';
  const EPA_PRACTICE_KEY = 'eviaEpaPracticeV1';

  const clean = (value) => String(value ?? '').trim();
  const finite = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };
  const rounded = (value, places = 1) => {
    const number = finite(value);
    if (number === null) return null;
    const factor = 10 ** places;
    return Math.round(number * factor) / factor;
  };
  const safeJson = (value, fallback) => {
    try { const parsed = JSON.parse(value); return parsed ?? fallback; } catch (error) { return fallback; }
  };

  function injectStyles() {
    if (document.getElementById('eviaUxCleanupV2Styles')) return;
    const style = document.createElement('style');
    style.id = 'eviaUxCleanupV2Styles';
    style.textContent = `
      .evia-attend-v2{display:flex;flex-direction:column;gap:12px}
      .evia-attend-overview-v2{border:1.5px solid rgba(245,196,0,.27);border-radius:24px;background:linear-gradient(180deg,#fff,#fffdf8);padding:16px;box-shadow:0 8px 20px rgba(35,35,35,.04)}
      .evia-attend-combined-v2{text-align:center;padding:3px 4px 14px}
      .evia-attend-combined-v2 span{display:block;font-size:10.5px;color:rgba(45,45,45,.52);font-weight:650}
      .evia-attend-combined-v2 strong{display:block;margin-top:4px;font-size:20px;line-height:1.15;color:rgba(45,45,45,.84)}
      .evia-attend-split-v2{display:grid;grid-template-columns:1fr 1fr;gap:8px;border-top:1px solid rgba(45,45,45,.055);padding-top:12px}
      .evia-attend-stat-v2{min-width:0;text-align:center;padding:8px 6px}
      .evia-attend-stat-v2 span{display:block;font-size:9.5px;color:rgba(45,45,45,.48);font-weight:650}
      .evia-attend-stat-v2 strong{display:block;margin-top:4px;font-size:15px;line-height:1.18;color:rgba(45,45,45,.8)}
      .evia-attend-stat-v2+ .evia-attend-stat-v2{border-left:1px solid rgba(45,45,45,.055)}
      .evia-attend-hours-v2{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 14px;border-radius:18px;background:rgba(250,249,242,.72)}
      .evia-attend-hours-v2 span{font-size:11px;color:rgba(45,45,45,.58);font-weight:650}.evia-attend-hours-v2 strong{font-size:15px;color:rgba(45,45,45,.82)}
      .evia-attend-note-v2{margin:0 5px;font-size:10px;line-height:1.4;text-align:center;color:rgba(45,45,45,.46)}
      .evia-attend-actions-v2{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px!important;width:100%!important}
      .evia-attend-actions-v2 .evia-update-button{min-height:58px!important;border-radius:20px!important;padding:10px 12px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:3px!important;text-align:left!important;box-shadow:0 5px 14px rgba(35,35,35,.03)!important}
      .evia-attend-actions-v2 .evia-update-button span{font-size:13px!important;font-weight:800!important;color:rgba(45,45,45,.78)!important}
      .evia-attend-actions-v2 .evia-update-button small{font-size:9.5px!important;text-align:left!important;color:rgba(45,45,45,.48)!important;line-height:1.2!important}
      .evia-attend-actions-v2 .evia-inline-status{grid-column:1/-1;min-height:0!important;font-size:9px!important;color:rgba(45,45,45,.44)!important}

      .evia-learn-v2 .evia-section-label{display:none!important}
      .evia-learn-v2 .learn-action-grid,.evia-learn-v2 .evia-learn-actions{display:flex!important;grid-template-columns:none!important;flex-direction:column!important;gap:8px!important;margin-top:2px!important}
      .evia-learn-v2 .learn-action-card{width:100%!important;min-height:64px!important;height:auto!important;border-radius:20px!important;padding:11px 42px 11px 14px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:3px!important;text-align:left!important;position:relative!important;background:#fff!important;border:1.5px solid rgba(245,196,0,.27)!important;box-shadow:0 5px 15px rgba(35,35,35,.03)!important}
      .evia-learn-v2 .learn-action-card.evia-learn-primary{background:rgba(245,196,0,.09)!important;border-color:rgba(245,196,0,.48)!important}
      .evia-learn-v2 .learn-action-card strong{font-size:13.5px!important;line-height:1.2!important;color:rgba(45,45,45,.82)!important}
      .evia-learn-v2 .learn-action-card span,.evia-learn-v2 .learn-action-card small{font-size:10px!important;line-height:1.32!important;color:rgba(45,45,45,.5)!important;margin:0!important}
      .evia-learn-v2 .learn-action-card::after{content:'›'!important;position:absolute!important;right:16px!important;top:50%!important;transform:translateY(-50%)!important;font-size:24px!important;color:rgba(45,45,45,.36)!important}
      .evia-learn-v2 .learn-action-count{display:none!important}

      .evia-share-v2{display:flex;flex-direction:column;gap:11px}
      .evia-share-v2-summary{border:1.5px solid rgba(245,196,0,.27);border-radius:22px;background:linear-gradient(180deg,#fff,#fffdf8);padding:14px;box-shadow:0 7px 18px rgba(35,35,35,.035)}
      .evia-share-v2-summary>strong{font-size:15px;color:rgba(45,45,45,.82)}.evia-share-v2-summary>p{margin-top:5px;font-size:10.5px;line-height:1.42;color:rgba(45,45,45,.53)}
      .evia-share-v2-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:10px}
      .evia-share-v2-metric{padding:8px 5px;border-radius:14px;background:rgba(250,249,242,.8);text-align:center}.evia-share-v2-metric strong{display:block;font-size:13px;color:#444}.evia-share-v2-metric span{display:block;margin-top:2px;font-size:8.5px;color:#777}
      .evia-share-v2-card{border:1.5px solid rgba(245,196,0,.27);border-radius:22px;background:#fff;padding:14px;text-align:center;box-shadow:0 7px 18px rgba(35,35,35,.035)}
      .evia-share-v2-qr{width:min(68vw,270px);height:min(68vw,270px);margin:0 auto;display:grid;place-items:center;background:#fff;padding:6px}
      .evia-share-v2-qr canvas,.evia-share-v2-qr img,.evia-share-v2-qr svg{max-width:100%!important;height:auto!important}
      .evia-share-v2-status{margin-top:7px;font-size:9.5px;color:rgba(45,45,45,.48)}

      @media(max-width:390px){
        .evia-attend-overview-v2{padding:14px}.evia-attend-combined-v2 strong{font-size:18px}
        .evia-attend-actions-v2 .evia-update-button{min-height:55px!important;padding:9px 10px!important}
        .evia-learn-v2 .learn-action-card{min-height:60px!important;padding:10px 40px 10px 13px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function fmtPercent(value, missing = 'Not received yet') {
    const number = finite(value);
    return number === null ? missing : `${Math.max(0, Math.min(100, Math.round(number)))}%`;
  }

  function currentMeta() {
    try { if (typeof inferredCourseMeta === 'function') return inferredCourseMeta() || {}; } catch (error) {}
    try { return activeCourseMeta || {}; } catch (error) { return {}; }
  }

  function renderAttendLayoutV2() {
    if (typeof archDetailContent === 'undefined' || !archDetailContent) return;
    let data = { college:null, workplace:null, collegeLearningHours:0 };
    try { if (typeof loadAttendanceData === 'function') data = loadAttendanceData() || data; } catch (error) {}
    let combined = null;
    try { if (typeof combinedAttendancePercent === 'function') combined = combinedAttendancePercent(data); } catch (error) {}
    const hours = finite(data?.collegeLearningHours) ?? 0;
    const raw = safeJson(localStorage.getItem('eviaAttendanceDataV1') || '{}', {});
    let status = '';
    if (raw?.updatedAt) {
      const when = new Date(raw.updatedAt);
      if (Number.isFinite(when.getTime())) status = `Last updated ${when.toLocaleString()}`;
    }

    archDetailContent.classList.add('evia-clean-attend');
    archDetailContent.classList.remove('evia-clean-learn','evia-learn-v2');
    archDetailContent.innerHTML = `
      <div class="evia-attend-v2">
        <section class="evia-attend-overview-v2">
          <div class="evia-attend-combined-v2">
            <span>Combined attendance</span>
            <strong>${fmtPercent(combined, 'Not available yet')}</strong>
          </div>
          <div class="evia-attend-split-v2">
            <div class="evia-attend-stat-v2"><span>College</span><strong>${fmtPercent(data?.college)}</strong></div>
            <div class="evia-attend-stat-v2"><span>Workplace</span><strong>${fmtPercent(data?.workplace)}</strong></div>
          </div>
        </section>
        <div class="evia-attend-hours-v2"><span>College Learning Hours</span><strong>${hours.toFixed(1)}h</strong></div>
        <p class="evia-attend-note-v2">College attendance comes from tutor/assessor review data. Workplace attendance comes from employer/review data.</p>
        <div class="evia-attend-actions-v2" id="eviaAttendanceUpdateActions">
          <button class="evia-update-button primary" id="eviaAttendanceManual" type="button"><span>Manual update</span><small>Enter directly</small></button>
          <button class="evia-update-button" id="eviaAttendanceQr" type="button"><span>Scan QR</span><small>Receive an update</small></button>
          <div class="evia-inline-status" id="eviaAttendanceUpdateStatus">${status}</div>
        </div>
      </div>`;
  }

  function tidyLearnLayoutV2() {
    if (typeof archDetailContent === 'undefined' || !archDetailContent) return;
    archDetailContent.classList.add('evia-clean-learn','evia-learn-v2');
    archDetailContent.classList.remove('evia-clean-attend');
    archDetailContent.querySelectorAll(':scope > .evia-section-label').forEach((node) => node.remove());
    const grid = archDetailContent.querySelector('.learn-action-grid');
    if (!grid) return;
    let gapCount = null;
    try { if (typeof uncoveredOtjIdeas === 'function') gapCount = uncoveredOtjIdeas().length; } catch (error) {}
    grid.classList.add('evia-learn-actions');
    grid.innerHTML = `
      <button class="learn-action-card evia-learn-primary" id="openManualLearning" type="button"><strong>Add Learning</strong><span>Record learning when it happens.</span></button>
      <button class="learn-action-card" id="openLearnCatchup" type="button"><strong>Catch Up</strong><span>Add learning time from completed evidence.</span></button>
      <button class="learn-action-card" id="openOtjIdeas" type="button"><strong>Learning ideas</strong><span>${gapCount === null ? 'Choose a useful learning activity and add time.' : `${gapCount} area${gapCount === 1 ? '' : 's'} to consider.`}</span></button>`;
  }

  function updateReferenceKeyRoles() {
    const key = document.getElementById('eviaAssistantReferenceKey');
    if (!key) return;
    const items = key.querySelectorAll('.evia-assistant-key-item');
    if (items[0]) items[0].innerHTML = '<i class="evia-assistant-key-dot milos" aria-hidden="true"></i>Assessor';
    if (items[1]) items[1].innerHTML = '<i class="evia-assistant-key-dot symi" aria-hidden="true"></i>Tutor';
    if (items[2]) items[2].innerHTML = '<i class="evia-assistant-key-dot tinos" aria-hidden="true"></i>Employer';
    key.setAttribute('aria-label', 'Evidence reference key');
  }

  function targetFigures() {
    const state = safeJson(localStorage.getItem(TARGETS_KEY) || '[]', []);
    const list = Array.isArray(state) ? state : [];
    const completed = list.filter((target) => {
      const status = clean(target?.status).toLowerCase();
      return target?.completed === true || target?.complete === true || ['complete','completed','done','achieved'].includes(status);
    }).length;
    return [list.length, completed, Math.max(0, list.length - completed)];
  }

  function confidencePercent() {
    const state = safeJson(localStorage.getItem(EPA_CONFIDENCE_KEY) || '{}', {});
    const values = Object.values(state && typeof state === 'object' ? state : {})
      .map((item) => finite(item?.value)).filter((value) => value !== null);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  function practicePercent() {
    const state = safeJson(localStorage.getItem(EPA_PRACTICE_KEY) || '{}', {});
    return finite(state?.percent);
  }

  async function compactSharePayload() {
    let attendance = {};
    try { if (typeof loadAttendanceData === 'function') attendance = loadAttendanceData() || {}; } catch (error) {}
    let combined = null;
    try { if (typeof combinedAttendancePercent === 'function') combined = combinedAttendancePercent(attendance); } catch (error) {}
    let toc = null;
    try { if (typeof courseProgressPercent === 'function') toc = courseProgressPercent(); } catch (error) {}
    let progress = { completed:null, total:null, percent:null };
    try { if (typeof completedCourseProgress === 'function') progress = completedCourseProgress() || progress; } catch (error) {}
    let required = null;
    try { if (typeof totalLearningRequirement === 'function') required = totalLearningRequirement(); } catch (error) {}
    let learnerHours = 0;
    try { if (typeof learnerLearningHours === 'function') learnerHours = finite(learnerLearningHours()) ?? 0; } catch (error) {}
    const collegeHours = finite(attendance?.collegeLearningHours) ?? 0;
    const totalHours = learnerHours + collegeHours;
    const learningPercent = finite(required) && Number(required) > 0 ? Math.min(100, (totalHours / Number(required)) * 100) : null;
    let learningCount = null;
    try { if (typeof learningEntries !== 'undefined' && Array.isArray(learningEntries)) learningCount = learningEntries.length; } catch (error) {}
    let evidenceCount = null;
    try {
      if (typeof getPortfolioEntries === 'function') {
        const entries = await getPortfolioEntries();
        if (Array.isArray(entries)) evidenceCount = entries.length;
      }
    } catch (error) {}
    const confidence = confidencePercent();
    const practice = practicePercent();
    const coursePercent = finite(progress?.percent);
    const readinessParts = [coursePercent, confidence, practice].filter((value) => value !== null);
    const readiness = readinessParts.length ? readinessParts.reduce((sum, value) => sum + value, 0) / readinessParts.length : null;
    const targets = targetFigures();
    const meta = currentMeta();
    const courseId = clean(meta?.qualificationId || meta?.standardId || meta?.qualification?.id || meta?.id);
    const courseVersion = clean(meta?.version || meta?.qualification?.version);

    return {
      t:'evia-figures-v2',
      v:2,
      c:[courseId, courseVersion],
      f:[
        rounded(toc),
        finite(progress?.completed), finite(progress?.total), rounded(coursePercent),
        rounded(attendance?.college), rounded(attendance?.workplace), rounded(combined),
        rounded(required), rounded(collegeHours), rounded(learnerHours), rounded(totalHours), rounded(learningPercent), finite(learningCount),
        finite(evidenceCount),
        targets[0], targets[1], targets[2],
        rounded(confidence), rounded(practice), rounded(readiness)
      ]
    };
  }

  async function loadQrLibrary(force = false) {
    if (!force && typeof QRCode === 'function' && QRCode?.CorrectLevel?.L !== undefined) return true;
    try {
      let response = null;
      if ('caches' in window) {
        const cache = await caches.open(QR_CACHE);
        response = await cache.match(QR_LIBRARY_URL);
        if (!response) {
          const fetched = await fetch(QR_LIBRARY_URL, { mode:'cors', cache:'no-store' });
          if (fetched.ok) { await cache.put(QR_LIBRARY_URL, fetched.clone()); response = fetched; }
        }
      } else {
        response = await fetch(QR_LIBRARY_URL, { mode:'cors', cache:'force-cache' });
      }
      if (!response || !response.ok) return false;
      const source = await response.text();
      (0, eval)(source);
      return typeof QRCode === 'function' && QRCode?.CorrectLevel?.L !== undefined;
    } catch (error) { return false; }
  }

  function drawQr(target, text) {
    target.innerHTML = '';
    new QRCode(target, {
      text,
      width:260,
      height:260,
      correctLevel:QRCode.CorrectLevel.L
    });
  }

  async function renderShareQrV2() {
    try { naxosMenu?.classList.remove('open'); naxosArch?.setAttribute('aria-expanded','false'); } catch (error) {}
    try { if (typeof openArchShell === 'function') openArchShell('Share QR code'); } catch (error) { return; }
    try { archDetailStack = []; } catch (error) {}
    if (typeof archDetailContent === 'undefined' || !archDetailContent) return;

    const payload = await compactSharePayload();
    const figures = payload.f;
    archDetailContent.classList.remove('evia-clean-attend','evia-clean-learn','evia-learn-v2');
    archDetailContent.innerHTML = `
      <div class="evia-share-v2">
        <section class="evia-share-v2-summary">
          <strong>Share Evia figures</strong>
          <p>One QR shares Evia's tracked figures. Assessor, tutor and employer tools can each use the parts they need.</p>
          <div class="evia-share-v2-metrics">
            <div class="evia-share-v2-metric"><strong>${figures[3] === null ? '--' : `${Math.round(figures[3])}%`}</strong><span>course</span></div>
            <div class="evia-share-v2-metric"><strong>${figures[6] === null ? '--' : `${Math.round(figures[6])}%`}</strong><span>attendance</span></div>
            <div class="evia-share-v2-metric"><strong>${figures[11] === null ? '--' : `${Math.round(figures[11])}%`}</strong><span>Learning Hours</span></div>
          </div>
        </section>
        <section class="evia-share-v2-card">
          <div class="evia-share-v2-qr" id="eviaSharedFiguresQrV2"></div>
          <div class="evia-share-v2-status" id="eviaSharedFiguresQrV2Status">Preparing QR…</div>
        </section>
      </div>`;

    const target = document.getElementById('eviaSharedFiguresQrV2');
    const status = document.getElementById('eviaSharedFiguresQrV2Status');
    const text = JSON.stringify(payload);
    let ready = await loadQrLibrary(false);
    if (!ready) { if (status) status.textContent = 'QR generation is unavailable on this device right now.'; return; }
    try {
      drawQr(target, text);
      if (status) status.textContent = 'One QR · Evia figures only';
      return;
    } catch (error) {}
    ready = await loadQrLibrary(true);
    if (!ready) { if (status) status.textContent = 'QR generation is unavailable on this device right now.'; return; }
    try {
      drawQr(target, text);
      if (status) status.textContent = 'One QR · Evia figures only';
    } catch (error) {
      if (status) status.textContent = 'Could not generate the QR on this device.';
    }
  }

  function shareControl(target) {
    const button = target?.closest?.('button,[role="button"]');
    if (!button) return null;
    if (button.dataset?.naxosAction === 'send') return button;
    const inMenu = button.closest('#naxosMenu,.naxos-menu,[data-naxos-menu]');
    if (inMenu && /share\s*(qr|with)/i.test(clean(button.textContent))) return button;
    return null;
  }

  function installWrappers() {
    try {
      if (typeof renderAttendPage === 'function' && !renderAttendPage.__eviaUxV2) {
        const previous = renderAttendPage;
        const wrapped = function (...args) {
          const result = previous.apply(this, args);
          renderAttendLayoutV2();
          return result;
        };
        wrapped.__eviaUxV2 = true;
        renderAttendPage = wrapped;
      }
    } catch (error) {}

    try {
      if (typeof renderLearnPage === 'function' && !renderLearnPage.__eviaUxV2) {
        const previous = renderLearnPage;
        const wrapped = function (...args) {
          const result = previous.apply(this, args);
          tidyLearnLayoutV2();
          return result;
        };
        wrapped.__eviaUxV2 = true;
        renderLearnPage = wrapped;
      }
    } catch (error) {}
  }

  injectStyles();
  installWrappers();
  window.addEventListener('click', (event) => {
    const share = shareControl(event.target);
    if (!share) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    renderShareQrV2().catch(() => {});
  }, true);

  const observer = new MutationObserver(() => updateReferenceKeyRoles());
  observer.observe(document.documentElement, { childList:true, subtree:true });
  updateReferenceKeyRoles();
})();
