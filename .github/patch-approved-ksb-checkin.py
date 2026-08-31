from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')


def replace_between(start, end, new_block):
    global text
    s = text.index(start)
    e = text.index(end, s)
    text = text[:s] + new_block + text[e:]

# Add criterion progress rings, mapped-location status, and polished chat badge styling.
css_marker = "    @keyframes talkingFloat {"
css_block = r'''    /* approved KSB/AC proportional progress + weekly check-in badge */
    .criterion-tile.met::after { content: none; }
    .criterion-code { position: relative; z-index: 1; }
    .criterion-progress-mark {
      position: absolute;
      right: 5px;
      top: 5px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      flex: 0 0 auto;
    }
    .criterion-progress-ring {
      background: conic-gradient(var(--evia-yellow) var(--criterion-progress, 0deg), rgba(245,196,0,.16) 0);
    }
    .criterion-progress-ring::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
      background: #fff;
    }
    .criterion-progress-tick {
      display: grid;
      place-items: center;
      background: var(--evia-yellow);
      color: #fff;
      font-size: 13px;
      line-height: 1;
      font-weight: 800;
    }
    .mapping-button.completed {
      border-color: rgba(245,196,0,.52);
      background: rgba(245,196,0,.07);
    }
    .mapping-status {
      margin-top: 6px !important;
      font-size: 10px !important;
      font-weight: 700;
      color: rgba(45,45,45,.50) !important;
    }
    .mapping-button.completed .mapping-status { color: rgba(128,102,0,.82) !important; }
    .chat-button {
      width: 46px;
      height: 46px;
      border: 1.5px solid rgba(245,196,0,.34);
      border-radius: 50%;
      background: rgba(255,255,255,.98);
      box-shadow: 0 7px 18px rgba(0,0,0,.055), inset 0 0 0 1px rgba(255,255,255,.8);
    }
    .chat-icon {
      width: 23px;
      height: 18px;
      border: 1.8px solid rgba(45,45,45,.61);
      border-radius: 8px;
      background:
        radial-gradient(circle at 31% 50%, rgba(45,45,45,.52) 0 1.4px, transparent 1.6px),
        radial-gradient(circle at 50% 50%, rgba(45,45,45,.52) 0 1.4px, transparent 1.6px),
        radial-gradient(circle at 69% 50%, rgba(45,45,45,.52) 0 1.4px, transparent 1.6px),
        rgba(255,255,255,.98);
    }
    .chat-icon::after {
      right: 3px;
      bottom: -4px;
      width: 7px;
      height: 7px;
      border-right: 1.8px solid rgba(45,45,45,.61);
      border-bottom: 1.8px solid rgba(45,45,45,.61);
      background: #fff;
    }
    .chat-notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border: 2px solid #fff;
      border-radius: 999px;
      background: #d93025;
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 10px;
      line-height: 1;
      font-weight: 800;
      z-index: 2;
    }
    .chat-notification-badge[hidden] { display: none; }

'''
if css_block.strip() not in text:
    text = text.replace(css_marker, css_block + css_marker, 1)

old_chat = '''    <button class="chat-button" id="chatButton" type="button" aria-label="Open Evia chat">\n      <span class="chat-icon" aria-hidden="true"></span>\n    </button>'''
new_chat = '''    <button class="chat-button" id="chatButton" type="button" aria-label="Open Evia chat">\n      <span class="chat-icon" aria-hidden="true"></span>\n      <span class="chat-notification-badge" id="chatNotificationBadge" hidden aria-hidden="true">1</span>\n    </button>'''
if old_chat not in text:
    raise SystemExit('chat button marker not found')
text = text.replace(old_chat, new_chat, 1)

# KSB/AC progress is completed mapped evidence locations / total mapped locations.
replace_between(
    "    function targetIsMet(id) {",
    "    function naturalTargetSort",
    r'''    function targetProgress(id) {
      const raw = courseMetaMappings()[id] || [];
      const unique = [];
      const seen = new Set();
      raw.forEach((path) => {
        if (!Array.isArray(path) || !path.length) return;
        const key = evidencePathKey(path);
        if (seen.has(key)) return;
        seen.add(key);
        unique.push(path);
      });
      const total = unique.length;
      const completed = unique.filter((path) => completedEvidencePaths.has(evidencePathKey(path))).length;
      const fraction = total ? completed / total : 0;
      return { completed, total, fraction, percent: fraction * 100, complete: total > 0 && completed >= total, paths: unique };
    }

    function targetIsMet(id) {
      return targetProgress(id).complete;
    }

    function criterionProgressMarkup(id) {
      const progress = targetProgress(id);
      if (!progress.total) return '';
      if (progress.complete) return '<span class="criterion-progress-mark criterion-progress-tick" aria-hidden="true">✓</span>';
      return `<span class="criterion-progress-mark criterion-progress-ring" style="--criterion-progress:${progress.fraction * 360}deg" aria-hidden="true"></span>`;
    }

'''
)

replace_between(
    "    function renderKsbGrid(meta) {",
    "    function nvqCriteria",
    r'''    function renderKsbGrid(meta) {
      const mappings = courseMetaMappings();
      const official = meta.officialItems || {};
      const ids = (Array.isArray(meta.ksbOrder) && meta.ksbOrder.length ? meta.ksbOrder : Object.keys(official).length ? Object.keys(official) : Object.keys(mappings)).slice().sort(naturalTargetSort);
      archDetailContent.innerHTML = `<div class="detail-card"><strong>${escapeDetailHtml(meta.title || activeCourseTitle || 'Course')}</strong><p>${ids.length} mapped KSBs</p></div><div class="criterion-grid">${ids.map(id=>{const progress=targetProgress(id);return `<button class="criterion-tile${progress.complete?' met':''}" type="button" data-course-target="${escapeDetailHtml(id)}" aria-label="${escapeDetailHtml(id)}. ${progress.completed} of ${progress.total} mapped evidence locations complete"><span class="criterion-code">${escapeDetailHtml(id)}</span>${criterionProgressMarkup(id)}</button>`}).join('')}</div>${Object.keys(official).length?'':'<div class="detail-muted">Re-import this Naxos course once to load its full official KSB wording into this device.</div>'}`;
    }

'''
)

replace_between(
    "    function nvqCriteria(meta, unit) {",
    "    function renderNvqUnits",
    r'''    function nvqCriteria(meta, unit) {
      return (Array.isArray(meta.criteria) ? meta.criteria : []).filter(item => String(item.id).split('.')[0] === String(unit));
    }

    function nvqUnitProgress(meta, unit) {
      const criteria = nvqCriteria(meta, unit);
      if (!criteria.length) return { fraction: 0, complete: false, completedCriteria: 0, totalCriteria: 0 };
      const progress = criteria.map((item) => targetProgress(item.id));
      const fraction = progress.reduce((sum, item) => sum + item.fraction, 0) / criteria.length;
      const complete = progress.every((item) => item.complete);
      return { fraction, complete, completedCriteria: progress.filter((item) => item.complete).length, totalCriteria: criteria.length };
    }

'''
)

replace_between(
    "    function renderNvqUnits(meta) {",
    "    function renderNvqUnitDetail",
    r'''    function renderNvqUnits(meta) {
      const units = Array.isArray(meta.units) && meta.units.length ? meta.units : [...new Set((meta.criteria||[]).map(x=>String(x.id).split('.')[0]))];
      archDetailContent.innerHTML = `<div class="detail-card"><strong>${escapeDetailHtml(meta.title || activeCourseTitle || 'NVQ')}</strong><p>Select a unit to view its Assessment Criteria.</p></div><div class="unit-list">${units.map(unit=>{
        const progress=nvqUnitProgress(meta,unit);
        const title=meta.unitTitles?.[unit] || `Unit ${unit}`;
        return `<button class="unit-button" type="button" data-nvq-unit="${escapeDetailHtml(unit)}"><span class="unit-progress${progress.complete?' complete':''}" style="--unit-progress:${progress.fraction*360}deg"></span><span class="unit-copy"><strong>${escapeDetailHtml(title)}</strong><span>${progress.completedCriteria}/${progress.totalCriteria} ACs fully complete</span></span></button>`;
      }).join('')}</div>`;
    }

'''
)

replace_between(
    "    function renderNvqUnitDetail(unit) {",
    "    function renderTargetDetail",
    r'''    function renderNvqUnitDetail(unit) {
      const meta=inferredCourseMeta(), criteria=nvqCriteria(meta,unit);
      archDetailContent.innerHTML = `<div class="criterion-grid">${criteria.map(item=>{const progress=targetProgress(item.id);return `<button class="criterion-tile${progress.complete?' met':''}" type="button" data-course-target="${escapeDetailHtml(item.id)}" aria-label="${escapeDetailHtml(item.id)}. ${progress.completed} of ${progress.total} mapped evidence locations complete"><span class="criterion-code">${escapeDetailHtml(item.id)}</span>${criterionProgressMarkup(item.id)}</button>`}).join('')}</div>`;
    }

'''
)

replace_between(
    "    function renderTargetDetail(id) {",
    "    function findCoursePathIndices",
    r'''    function renderTargetDetail(id) {
      const meta=inferredCourseMeta(), mappings=courseMetaMappings(), isNvq=meta.courseType==='nvq';
      const wording = isNvq ? cleanText((meta.criteria||[]).find(x=>x.id===id)?.wording) : cleanText(meta.officialItems?.[id]);
      const atoms = isNvq ? ((meta.criteria||[]).find(x=>x.id===id)?.atoms || []) : [];
      const paths = targetProgress(id).paths;
      archDetailContent.innerHTML = `<div class="detail-card"><strong>${escapeDetailHtml(id)}</strong>${wording?`<p>${escapeDetailHtml(wording)}</p>`:`<p class="detail-muted">${isNvq?'The current Naxos pack supplies this official AC identifier and mapping, but does not yet include its full official wording. Evia will show it here when Naxos supplies it.':'Official wording is not stored on this device yet. Re-import the Naxos course to load it.'}</p>`}${atoms.length?`<p>Atomic criteria: ${atoms.map(escapeDetailHtml).join(', ')}</p>`:''}</div><div class="detail-card"><strong>Where this can be evidenced</strong><div class="mapping-list">${paths.length?paths.map(path=>{const completed=completedEvidencePaths.has(evidencePathKey(path));return `<button class="mapping-button${completed?' completed':''}" type="button" data-evidence-path="${encodeURIComponent(JSON.stringify(path))}"><strong>${escapeDetailHtml(path[path.length-1]||'Evidence')}</strong><span>${escapeDetailHtml(path.slice(0,-1).join(' › '))}</span><span class="mapping-status">${completed?'✓ Completed':'Not completed yet'}</span></button>`}).join(''):'<p>No mapped evidence location is stored for this item.</p>'}</div></div>`;
    }

'''
)

# Weekly Monday check-in notification. It stays due for the week until the full existing Check-in flow is completed.
weekly_marker = "    async function startCheckIn() {"
weekly_block = r'''    function weeklyCheckInMondayKey(date = new Date()) {
      const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const daysSinceMonday = (day.getDay() + 6) % 7;
      day.setDate(day.getDate() - daysSinceMonday);
      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, '0');
      const dateNumber = String(day.getDate()).padStart(2, '0');
      return `${year}-${month}-${dateNumber}`;
    }

    function weeklyCheckInIsDue() {
      let completedWeek = '';
      try { completedWeek = localStorage.getItem('eviaWeeklyCheckInCompletedWeek') || ''; } catch (error) {}
      return completedWeek !== weeklyCheckInMondayKey();
    }

    function updateWeeklyCheckInBadge() {
      const badge = document.getElementById('chatNotificationBadge');
      if (!badge) return;
      const due = weeklyCheckInIsDue();
      badge.hidden = !due;
      chatButton.setAttribute('aria-label', due ? 'Open Evia chat. Weekly check-in due.' : 'Open Evia chat');
    }

    function markWeeklyCheckInComplete() {
      try { localStorage.setItem('eviaWeeklyCheckInCompletedWeek', weeklyCheckInMondayKey()); } catch (error) {}
      updateWeeklyCheckInBadge();
    }

'''
if weekly_block.strip() not in text:
    text = text.replace(weekly_marker, weekly_block + weekly_marker, 1)

replace_between(
    "    async function askConfidenceArea() {",
    "    function dialSavedNumber",
    r'''    async function askConfidenceArea() {
      if (!checkInState) return;
      if (checkInState.areaIndex >= checkInState.areas.length) {
        markWeeklyCheckInComplete();
        const name = learnerConversationName();
        await chatSay(name ? `Thanks ${name}. That's your quick check-in done.` : "Thanks. That's your quick check-in done.", mainChatOptions());
        return;
      }
      const area = checkInState.areas[checkInState.areaIndex];
      checkInState.stage = 'confidence';
      await chatSay(`How confident do you feel with ${area}?`, [
        { label: 'Confident', action: 'check-confidence', value: 'confident' },
        { label: 'Getting there', action: 'check-confidence', value: 'getting-there' },
        { label: 'Need help', action: 'check-confidence', value: 'need-help' }
      ]);
    }

'''
)

old_update = "    async function updateArchBars(){\n      const elapsed=courseProgressPercent();"
new_update = "    async function updateArchBars(){\n      updateWeeklyCheckInBadge();\n      const elapsed=courseProgressPercent();"
if old_update not in text:
    raise SystemExit('updateArchBars marker not found')
text = text.replace(old_update, new_update, 1)

# Guardrails.
required = [
    'function targetProgress(id)',
    'function criterionProgressMarkup(id)',
    'function nvqUnitProgress(meta, unit)',
    'chatNotificationBadge',
    'function weeklyCheckInMondayKey',
    'function markWeeklyCheckInComplete',
    "markWeeklyCheckInComplete();",
    "completedEvidencePaths.has(evidencePathKey(path))",
]
for marker in required:
    if marker not in text:
        raise SystemExit(f'missing required marker: {marker}')

path.write_text(text, encoding='utf-8')
print('approved KSB/AC progress and weekly check-in patch applied')
