(() => {
  'use strict';

  const COURSE_KEY = 'evia-course';
  const EVIDENCE_KEY = 'evia-evidence-records';
  const HOURS_KEY = 'evia-otj-entries';
  const RPL_KEY = 'evia-rpl-codes';
  let scheduled = false;

  const read = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; }
    catch { return fallback; }
  };
  const course = () => read(COURSE_KEY, null);
  const isNvq = (value = course()) => Boolean(value && (value.courseKind === 'nvq' || value.nvq?.version));
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const words = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;
  const fmt = (value) => {
    const rounded = Math.round((Number(value) || 0) * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  };

  function recordComplete(record) {
    if (!record) return false;
    if (record.method === 'photo') return (record.fileIds || []).length >= 3;
    if (record.method === 'video' || record.method === 'audio') return (record.fileIds || []).length >= 1;
    if (record.method === 'written' || record.method === 'reflection') return words(record.text) >= 30;
    return Boolean(record.witness?.name?.trim() && record.witness?.role?.trim() && record.witness?.date && record.witness?.signature?.strokes?.length && words(record.witness?.testimony) >= 30);
  }

  function stats() {
    const c = course();
    if (!isNvq(c)) return null;
    const evidence = read(EVIDENCE_KEY, []);
    const rpl = new Set(read(RPL_KEY, []));
    const completeCodes = new Set(evidence.filter(recordComplete).map((record) => record.ksbCode));
    rpl.forEach((code) => completeCodes.add(code));
    const clusters = Array.isArray(c.nvq?.clusters) ? c.nvq.clusters : [];
    const allRefs = new Set();
    const completeRefs = new Set();
    clusters.forEach((cluster) => {
      (cluster.criteriaRefs || []).forEach((ref) => allRefs.add(ref));
      if (completeCodes.has(cluster.code)) (cluster.criteriaRefs || []).forEach((ref) => completeRefs.add(ref));
    });
    const acTotal = Number(c.nvq?.criteriaCount) || allRefs.size;
    const acDone = completeRefs.size;
    const acProgress = acTotal ? clamp((acDone / acTotal) * 100) : 0;
    const entries = read(HOURS_KEY, []);
    const logged = entries.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0);
    const glhTarget = Number(c.nvq?.glhTotal ?? c.qualification?.glh) || 0;
    const glhProgress = glhTarget ? clamp((logged / glhTarget) * 100) : 0;
    const unitGlh = new Map((c.nvq?.units || []).map((unit) => [String(unit.number), Number(unit.glh) || 0]));
    const unitStats = new Map((c.units || []).map((unit) => {
      const loggedUnit = entries.filter((entry) => entry.unitId === unit.id).reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0);
      const target = unitGlh.get(String(unit.number)) || 0;
      return [unit.id, { logged: loggedUnit, target, progress: target ? clamp((loggedUnit / target) * 100) : 0 }];
    }));
    return { c, acTotal, acDone, acProgress, logged, glhTarget, glhProgress, unitStats };
  }

  function textSwap(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.parentElement?.closest('script,style')) return;
      let text = node.nodeValue || '';
      text = text.replace(/Off The Job/g, 'Guided Learning Hours')
        .replace(/Off-the-job training/g, 'Guided learning hours')
        .replace(/off-the-job training/g, 'guided learning hours')
        .replace(/off-the-job/g, 'guided learning')
        .replace(/\bOTJ\b/g, 'GLH')
        .replace(/\bKSBs\b/g, 'ACs')
        .replace(/\bKSB\b/g, 'AC');
      if (text !== node.nodeValue) node.nodeValue = text;
    });
  }

  function apply() {
    scheduled = false;
    const s = stats();
    document.documentElement.classList.toggle('evia-nvq-course', Boolean(s));
    if (!s) return;

    const row = document.querySelector('.progress-row');
    if (row) {
      row.classList.add('nvq-progress-row');
      [...row.querySelectorAll('.progress-arch')].forEach((arch) => {
        const label = arch.querySelector('.arch-label');
        const code = (label?.textContent || '').trim();
        if (code === 'EPA') { arch.hidden = true; return; }
        arch.hidden = false;
        const number = arch.querySelector('.arch-number');
        if (code === 'KSB' || code === 'AC') {
          if (label) label.textContent = 'AC';
          if (number) number.textContent = `${s.acProgress}%`;
          arch.setAttribute('aria-label', `Assessment criteria evidence: ${s.acProgress}%. Open AC details`);
        } else if (code === 'OTJ' || code === 'GLH') {
          if (label) label.textContent = 'GLH';
          if (number) number.textContent = `${s.glhProgress}%`;
          arch.setAttribute('aria-label', `Guided learning hours: ${s.glhProgress}%. Open GLH details`);
        }
      });
    }

    textSwap(document.body);

    // AC progress workspace: use official AC references, not synthetic evidence-cluster count.
    document.querySelectorAll('.progress-summary-main').forEach((main) => {
      const label = main.querySelector('span')?.textContent || '';
      const strong = main.querySelector('strong');
      const small = main.querySelector('small');
      if (/AC evidence|Portfolio coverage/i.test(label) && strong) {
        strong.textContent = `${s.acProgress}%`;
        if (small) small.textContent = `${s.acDone} of ${s.acTotal} ACs evidenced`;
      }
      if (/Guided Learning|GLH/i.test(label) && strong) {
        strong.textContent = `${s.glhProgress}%`;
        if (small) small.textContent = `${fmt(s.logged)} of ${fmt(s.glhTarget)} GLH recorded`;
      }
    });

    // Course menu: NVQ has no EPA route.
    document.querySelectorAll('.option-row').forEach((button) => {
      const text = button.textContent || '';
      if (/EPA Practice/i.test(text)) button.hidden = true;
      if (/Guided Learning Hours/i.test(text)) {
        const note = button.querySelector('small');
        if (note) note.textContent = `${fmt(s.logged)} of ${fmt(s.glhTarget)} hours recorded`;
      }
    });

    // Unit GLH tiles use each official Unit GLH target.
    document.querySelectorAll('.unit-otj-item').forEach((item) => {
      const unitView = item.closest('.progress-workspace, .view-content, .menu-panel');
      const pageText = unitView?.textContent || document.body.textContent || '';
      const unit = (s.c.units || []).find((candidate) => pageText.includes(candidate.title));
      if (!unit) return;
      const u = s.unitStats.get(unit.id);
      if (!u) return;
      const strong = item.querySelector('.ksb-description-copy strong');
      const small = item.querySelector('.ksb-description-copy small');
      if (strong) strong.textContent = `Record GLH ${fmt(u.logged)}/${u.target ? fmt(u.target) : '—'}hrs`;
      if (small) small.textContent = u.target ? 'Guided learning allocated to this Unit' : 'No Unit GLH target supplied';
      const dot = item.querySelector('.status-dot');
      if (dot) dot.textContent = u.progress >= 100 ? '✓' : '';
    });

    // Unit-list mini pies: relabel and use official per-Unit GLH; 100% becomes a yellow tick.
    document.querySelectorAll('.unit-otj-mini').forEach((mini) => {
      const rowEl = mini.closest('button, article, li, .option-row');
      const rowText = rowEl?.textContent || '';
      const unit = (s.c.units || []).find((candidate) => rowText.includes(candidate.title));
      const b = mini.querySelector('b');
      if (b) b.textContent = 'GLH';
      if (!unit) return;
      const u = s.unitStats.get(unit.id);
      if (!u) return;
      mini.setAttribute('aria-label', `GLH: ${u.progress}% complete for this Unit`);
      const pie = mini.querySelector('i');
      if (pie) {
        pie.classList.toggle('nvq-glh-complete', u.progress >= 100);
        pie.textContent = u.progress >= 100 ? '✓' : '';
        if (u.progress < 100) pie.style.background = `conic-gradient(from -90deg, #efc33d 0deg ${u.progress * 3.6}deg, rgba(80,79,75,.2) ${u.progress * 3.6}deg 360deg)`;
        else pie.style.background = 'transparent';
      }
    });

    // Onboarding wording follows the active course type.
    document.querySelectorAll('.onboarding-panel h1').forEach((title) => {
      if (/Four arches/i.test(title.textContent || '')) title.textContent = 'Three arches. One clear view.';
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('storage', schedule);
  document.addEventListener('click', () => setTimeout(schedule, 0), true);
  schedule();
})();
