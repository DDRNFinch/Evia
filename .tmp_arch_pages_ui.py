from pathlib import Path

p=Path('index.html')
s=p.read_text()

def insert_before(marker, block, label):
    global s
    if marker not in s: raise SystemExit(f'missing {label}')
    s=s.replace(marker, block+marker, 1)

def replace_once(old,new,label):
    global s
    if old not in s: raise SystemExit(f'missing {label}')
    s=s.replace(old,new,1)

def replace_block(start,end,new,label):
    global s
    i=s.find(start)
    if i<0: raise SystemExit(f'missing start {label}')
    j=s.find(end,i)
    if j<0: raise SystemExit(f'missing end {label}')
    s=s[:i]+new+s[j:]

css=r'''    .arch-detail-card {
      width: min(100%, 520px);
      max-height: calc(100dvh - 116px);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .arch-detail-title {
      font-size: 19px;
      font-weight: 600;
      color: rgba(45,45,45,.82);
      text-align: center;
    }

    .arch-detail-content {
      width: 100%;
      min-height: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 2px 2px 8px;
    }

    .detail-card {
      width: 100%;
      border: 1.5px solid rgba(245,196,0,.30);
      background: rgba(250,249,242,.94);
      border-radius: 20px;
      padding: 14px;
      color: rgba(45,45,45,.70);
    }

    .detail-card strong { color: rgba(45,45,45,.82); }
    .detail-card p { margin-top: 5px; font-size: 13px; line-height: 1.45; }
    .detail-muted { color: rgba(45,45,45,.54); font-size: 12px; line-height: 1.4; }

    .detail-metrics {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;
    }

    .detail-metric {
      border: 1px solid rgba(245,196,0,.24);
      background: rgba(250,249,242,.88);
      border-radius: 17px;
      padding: 12px;
      text-align: center;
    }

    .detail-metric strong { display:block; font-size:18px; color:rgba(45,45,45,.82); }
    .detail-metric span { display:block; margin-top:3px; font-size:11px; color:rgba(45,45,45,.56); }

    .time-track {
      position: relative;
      height: 16px;
      margin: 18px 4px 10px;
      border-radius: 999px;
      background: rgba(245,196,0,.16);
      overflow: visible;
    }

    .time-track-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--evia-yellow);
      width: var(--time-progress, 0%);
    }

    .time-epa-marker {
      position: absolute;
      top: -8px;
      left: var(--epa-position, 0%);
      width: 2px;
      height: 32px;
      background: rgba(45,45,45,.58);
      transform: translateX(-1px);
    }

    .time-epa-marker::after {
      content: 'EPA';
      position: absolute;
      top: -18px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 9px;
      font-weight: 700;
      color: rgba(45,45,45,.62);
    }

    .time-label-row { display:flex; justify-content:space-between; gap:10px; font-size:11px; color:rgba(45,45,45,.56); }

    .criterion-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }

    .criterion-tile {
      min-height: 54px;
      border: 1.5px solid rgba(245,196,0,.30);
      border-radius: 15px;
      background: rgba(250,249,242,.96);
      color: rgba(45,45,45,.70);
      position: relative;
      display: grid;
      place-items: center;
      padding: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .criterion-tile.met::after {
      content: '✓';
      position: absolute;
      right: 5px;
      top: 3px;
      color: var(--evia-yellow);
      font-size: 14px;
      font-weight: 800;
    }

    .unit-list { display:flex; flex-direction:column; gap:9px; width:100%; }
    .unit-button, .mapping-button, .catchup-button {
      width: 100%;
      min-height: 48px;
      border: 1.5px solid rgba(245,196,0,.32);
      border-radius: 17px;
      background: rgba(250,249,242,.96);
      color: rgba(45,45,45,.70);
      padding: 10px 13px;
      text-align: left;
      cursor: pointer;
    }

    .unit-button { display:flex; align-items:center; gap:12px; }
    .unit-progress {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      flex: 0 0 auto;
      background: conic-gradient(var(--evia-yellow) var(--unit-progress,0deg), rgba(245,196,0,.16) 0);
      position: relative;
    }
    .unit-progress::after { content:''; position:absolute; inset:5px; border-radius:50%; background:rgba(250,249,242,.98); }
    .unit-progress.complete::after { content:'✓'; inset:0; display:grid; place-items:center; background:var(--evia-yellow); color:white; font-weight:800; font-size:15px; }
    .unit-copy { min-width:0; flex:1 1 auto; }
    .unit-copy strong { display:block; font-size:13px; }
    .unit-copy span { display:block; font-size:11px; margin-top:2px; color:rgba(45,45,45,.54); }

    .mapping-list { display:flex; flex-direction:column; gap:8px; width:100%; }
    .mapping-button strong { display:block; font-size:13px; color:rgba(45,45,45,.78); }
    .mapping-button span { display:block; margin-top:3px; font-size:11px; color:rgba(45,45,45,.54); }

    .learn-catchup-form { display:flex; flex-direction:column; gap:9px; width:100%; }
    .learn-catchup-form textarea,
    .learn-catchup-form input {
      width:100%;
      border:1.5px solid rgba(245,196,0,.30);
      border-radius:15px;
      background:rgba(250,249,242,.94);
      color:#333;
      padding:11px;
      outline:0;
    }
    .learn-catchup-form textarea { min-height:120px; resize:vertical; }

'''
insert_before('    @keyframes talkingFloat {',css,'arch css marker')

replace_once('class="status-arch" id="timeArch" type="button" aria-label="Time on course" tabindex="-1"','class="status-arch" id="timeArch" type="button" aria-label="Time on course"','time arch tabindex')
replace_once('class="status-arch" id="courseArch" type="button" aria-label="Course progress" tabindex="-1"','class="status-arch" id="courseArch" type="button" aria-label="Course progress"','course arch tabindex')
replace_once('class="status-arch" id="attendanceArch" type="button" aria-label="Attendance" tabindex="-1"','class="status-arch" id="attendanceArch" type="button" aria-label="Attendance"','attendance arch tabindex')
replace_once('class="status-arch" id="learnArch" type="button" aria-label="Learn entries" tabindex="-1"','class="status-arch" id="learnArch" type="button" aria-label="Learn entries"','learn arch tabindex')
replace_once('cursor:default}', 'cursor:pointer}', 'status arch cursor')

html='''    <div class="overlay-panel" id="archDetailPanel" aria-hidden="true">
      <div class="arch-detail-card">
        <div class="arch-detail-title" id="archDetailTitle"></div>
        <div class="arch-detail-content" id="archDetailContent"></div>
      </div>
    </div>

'''
insert_before('    <div class="overlay-panel" id="scannerPanel" aria-hidden="true">',html,'arch detail html')

replace_once("    const naxosArch = document.getElementById('naxosArch');\n", "    const naxosArch = document.getElementById('naxosArch');\n    const timeArch = document.getElementById('timeArch');\n    const courseArch = document.getElementById('courseArch');\n    const attendanceArch = document.getElementById('attendanceArch');\n    const learnArch = document.getElementById('learnArch');\n    const archDetailPanel = document.getElementById('archDetailPanel');\n    const archDetailTitle = document.getElementById('archDetailTitle');\n    const archDetailContent = document.getElementById('archDetailContent');\n", 'arch dom refs')

replace_once("    let activeCourseTitle = loadSavedCourseTitle();\n", "    let activeCourseTitle = loadSavedCourseTitle();\n    let activeCourseMeta = loadSavedCourseMeta();\n", 'active course meta state')
replace_once("    let profileViewOpen = false;\n", "    let profileViewOpen = false;\n    let archDetailOpen = false;\n    let archDetailStack = [];\n", 'arch state')

meta_helpers=r'''    function loadSavedCourseMeta() {
      try {
        const parsed = JSON.parse(localStorage.getItem('eviaNaxosCourseMetaV1') || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (error) {
        return {};
      }
    }

    function saveCourseMeta(meta) {
      activeCourseMeta = meta && typeof meta === 'object' ? meta : {};
      try { localStorage.setItem('eviaNaxosCourseMetaV1', JSON.stringify(activeCourseMeta)); } catch (error) {}
    }

'''
insert_before('    function saveCourse(items, title = activeCourseTitle) {',meta_helpers,'course meta helpers')

arch_functions=r'''    function escapeDetailHtml(value) {
      return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
    }

    function parseCourseDate(value) {
      const stamp = Date.parse(`${cleanText(value)}T00:00:00Z`);
      return Number.isFinite(stamp) ? new Date(stamp) : null;
    }

    function addUtcMonths(date, months) {
      const d = new Date(date.getTime());
      const originalDay = d.getUTCDate();
      d.setUTCDate(1);
      d.setUTCMonth(d.getUTCMonth() + months);
      const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
      d.setUTCDate(Math.min(originalDay, last));
      return d;
    }

    function monthsDaysBetween(start, end) {
      if (!start || !end || end <= start) return { months: 0, days: 0 };
      let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
      let anchor = addUtcMonths(start, months);
      if (anchor > end) { months -= 1; anchor = addUtcMonths(start, months); }
      const days = Math.max(0, Math.floor((end - anchor) / 86400000));
      return { months: Math.max(0, months), days };
    }

    function formatMonthsDays(value) {
      const parts = [];
      if (value.months) parts.push(`${value.months} month${value.months === 1 ? '' : 's'}`);
      parts.push(`${value.days} day${value.days === 1 ? '' : 's'}`);
      return parts.join(' ');
    }

    function closeArchDetail() {
      archDetailOpen = false;
      archDetailStack = [];
      archDetailPanel.classList.remove('open');
      archDetailPanel.setAttribute('aria-hidden','true');
      archDetailContent.innerHTML = '';
      updateBackButton();
    }

    function openArchShell(title) {
      naxosMenu.classList.remove('open');
      naxosArch.setAttribute('aria-expanded','false');
      archDetailTitle.textContent = title;
      archDetailPanel.classList.add('open');
      archDetailPanel.setAttribute('aria-hidden','false');
      archDetailOpen = true;
      updateBackButton();
    }

    function pushArchView(renderer, title) {
      archDetailStack.push({ html: archDetailContent.innerHTML, title: archDetailTitle.textContent });
      archDetailTitle.textContent = title;
      archDetailContent.innerHTML = '';
      renderer();
      archDetailContent.scrollTop = 0;
      updateBackButton();
    }

    function restoreArchView() {
      const previous = archDetailStack.pop();
      if (!previous) { closeArchDetail(); return; }
      archDetailTitle.textContent = previous.title;
      archDetailContent.innerHTML = previous.html;
      archDetailContent.scrollTop = 0;
      updateBackButton();
    }

    function renderTimePage() {
      openArchShell('Time');
      archDetailStack = [];
      const start = parseCourseDate(learnerProfile.startDate);
      const end = parseCourseDate(learnerProfile.endDate);
      if (!start || !end || end <= start) {
        archDetailContent.innerHTML = '<div class="detail-card"><strong>Course dates needed</strong><p>Add the course start and end dates in Learner Profile to show the course timeline.</p></div>';
        return;
      }
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const clampedNow = new Date(Math.max(start.getTime(), Math.min(end.getTime(), today.getTime())));
      const progress = Math.max(0, Math.min(100, ((clampedNow-start)/(end-start))*100));
      const epa = addUtcMonths(end, -3);
      const epaPosition = Math.max(0, Math.min(100, ((epa-start)/(end-start))*100));
      const elapsed = monthsDaysBetween(start, clampedNow);
      const remaining = monthsDaysBetween(clampedNow, end);
      archDetailContent.innerHTML = `
        <div class="detail-card">
          <strong>${escapeDetailHtml(activeCourseTitle || 'Course timeline')}</strong>
          <div class="time-track" style="--time-progress:${progress}%;--epa-position:${epaPosition}%"><div class="time-track-fill"></div><div class="time-epa-marker"></div></div>
          <div class="time-label-row"><span>${start.toLocaleDateString()}</span><span>${end.toLocaleDateString()}</span></div>
          <p>Expected EPA: <strong>${epa.toLocaleDateString()}</strong></p>
        </div>
        <div class="detail-metrics">
          <div class="detail-metric"><strong>${escapeDetailHtml(formatMonthsDays(elapsed))}</strong><span>on course so far</span></div>
          <div class="detail-metric"><strong>${escapeDetailHtml(formatMonthsDays(remaining))}</strong><span>remaining</span></div>
        </div>`;
    }

    function courseMetaMappings() {
      const mappings = activeCourseMeta?.mappings;
      if (mappings && typeof mappings === 'object') return mappings;
      const out = {};
      courseLeaves().forEach(({node,path}) => {
        const ids = [...(Array.isArray(node.ksbTargets) ? node.ksbTargets : []), ...(Array.isArray(node.acTargets) ? node.acTargets : [])];
        ids.forEach(id => { const key=cleanText(id); if(!key)return; (out[key] ||= []).push(path); });
      });
      return out;
    }

    function targetIsMet(id) {
      const mappings = courseMetaMappings()[id] || [];
      return mappings.some(path => completedEvidencePaths.has(evidencePathKey(path)));
    }

    function naturalTargetSort(a,b) {
      const rank={K:0,S:1,B:2};
      const aa=String(a),bb=String(b), ar=rank[aa[0]] ?? 5, br=rank[bb[0]] ?? 5;
      return ar-br || aa.localeCompare(bb, undefined, {numeric:true,sensitivity:'base'});
    }

    function inferredCourseMeta() {
      const mappings = courseMetaMappings();
      const ids = Object.keys(mappings);
      if (activeCourseMeta && Object.keys(activeCourseMeta).length) return activeCourseMeta;
      const isNvq = ids.some(id => /^\d+\./.test(id));
      return { courseType: isNvq ? 'nvq' : 'ksb', mappings, officialItems: {}, ksbOrder: ids.sort(naturalTargetSort), criteria: ids.map(id=>({id,wording:''})) };
    }

    function renderCoursePage() {
      openArchShell('Course');
      archDetailStack = [];
      if (courseItems === placeholderCourse) {
        archDetailContent.innerHTML = '<div class="detail-card"><strong>No Naxos course loaded</strong><p>Scan a Naxos course QR to show qualification progress here.</p></div>';
        return;
      }
      const meta = inferredCourseMeta();
      if (meta.courseType === 'nvq') renderNvqUnits(meta);
      else renderKsbGrid(meta);
    }

    function renderKsbGrid(meta) {
      const mappings = courseMetaMappings();
      const official = meta.officialItems || {};
      const ids = (Array.isArray(meta.ksbOrder) && meta.ksbOrder.length ? meta.ksbOrder : Object.keys(official).length ? Object.keys(official) : Object.keys(mappings)).slice().sort(naturalTargetSort);
      archDetailContent.innerHTML = `<div class="detail-card"><strong>${escapeDetailHtml(meta.title || activeCourseTitle || 'Course')}</strong><p>${ids.length} mapped KSBs</p></div><div class="criterion-grid">${ids.map(id=>`<button class="criterion-tile${targetIsMet(id)?' met':''}" type="button" data-course-target="${escapeDetailHtml(id)}">${escapeDetailHtml(id)}</button>`).join('')}</div>${Object.keys(official).length?'':'<div class="detail-muted">Re-import this Naxos course once to load its full official KSB wording into this device.</div>'}`;
    }

    function nvqCriteria(meta, unit) {
      return (Array.isArray(meta.criteria) ? meta.criteria : []).filter(item => String(item.id).split('.')[0] === String(unit));
    }

    function renderNvqUnits(meta) {
      const units = Array.isArray(meta.units) && meta.units.length ? meta.units : [...new Set((meta.criteria||[]).map(x=>String(x.id).split('.')[0]))];
      archDetailContent.innerHTML = `<div class="detail-card"><strong>${escapeDetailHtml(meta.title || activeCourseTitle || 'NVQ')}</strong><p>Select a unit to view its Assessment Criteria.</p></div><div class="unit-list">${units.map(unit=>{
        const criteria=nvqCriteria(meta,unit), met=criteria.filter(x=>targetIsMet(x.id)).length, total=criteria.length||1, complete=criteria.length>0&&met>=criteria.length;
        const title=meta.unitTitles?.[unit] || `Unit ${unit}`;
        return `<button class="unit-button" type="button" data-nvq-unit="${escapeDetailHtml(unit)}"><span class="unit-progress${complete?' complete':''}" style="--unit-progress:${(met/total)*360}deg"></span><span class="unit-copy"><strong>${escapeDetailHtml(title)}</strong><span>${met}/${criteria.length} ACs complete</span></span></button>`;
      }).join('')}</div>`;
    }

    function renderNvqUnitDetail(unit) {
      const meta=inferredCourseMeta(), criteria=nvqCriteria(meta,unit);
      archDetailContent.innerHTML = `<div class="criterion-grid">${criteria.map(item=>`<button class="criterion-tile${targetIsMet(item.id)?' met':''}" type="button" data-course-target="${escapeDetailHtml(item.id)}">${escapeDetailHtml(item.id)}</button>`).join('')}</div>`;
    }

    function renderTargetDetail(id) {
      const meta=inferredCourseMeta(), mappings=courseMetaMappings(), isNvq=meta.courseType==='nvq';
      const wording = isNvq ? cleanText((meta.criteria||[]).find(x=>x.id===id)?.wording) : cleanText(meta.officialItems?.[id]);
      const atoms = isNvq ? ((meta.criteria||[]).find(x=>x.id===id)?.atoms || []) : [];
      const paths = mappings[id] || [];
      archDetailContent.innerHTML = `<div class="detail-card"><strong>${escapeDetailHtml(id)}</strong>${wording?`<p>${escapeDetailHtml(wording)}</p>`:`<p class="detail-muted">${isNvq?'The current Naxos pack supplies this official AC identifier and mapping, but does not yet include its full official wording. Evia will show it here when Naxos supplies it.':'Official wording is not stored on this device yet. Re-import the Naxos course to load it.'}</p>`}${atoms.length?`<p>Atomic criteria: ${atoms.map(escapeDetailHtml).join(', ')}</p>`:''}</div><div class="detail-card"><strong>Where this can be evidenced</strong><div class="mapping-list">${paths.length?paths.map(path=>`<button class="mapping-button" type="button" data-evidence-path="${encodeURIComponent(JSON.stringify(path))}"><strong>${escapeDetailHtml(path[path.length-1]||'Evidence')}</strong><span>${escapeDetailHtml(path.slice(0,-1).join(' › '))}</span></button>`).join(''):'<p>No mapped evidence location is stored for this item.</p>'}</div></div>`;
    }

    function findCoursePathIndices(labels) {
      let items=courseItems, indices=[];
      for (const label of labels) {
        const index=items.findIndex(item=>item.label===label);
        if(index<0)return null;
        indices.push(index);
        items=Array.isArray(items[index].children)?items[index].children:[];
      }
      return indices;
    }

    async function goToEvidencePath(path) {
      const indices=findCoursePathIndices(path);
      if(!indices||!indices.length)return;
      let items=courseItems, node=null;
      indices.forEach(index=>{node=items[index];items=Array.isArray(node?.children)?node.children:[];});
      if(!node)return;
      closeArchDetail();
      screen.classList.add('active');
      screen.classList.remove('completion-open');
      menuPath=indices.slice(0,-1);
      menuLevel=Math.max(1,indices.length);
      currentItems=getItemsAtPath(menuPath);
      activeEvidencePath=path.slice();
      await openEvidence(node);
    }

    function loadAttendanceData() {
      let data={};
      try { const parsed=JSON.parse(localStorage.getItem('eviaAttendanceDataV1')||'{}'); if(parsed&&typeof parsed==='object')data=parsed; } catch(error){}
      let legacy=''; try{legacy=localStorage.getItem('eviaAttendancePercent')||''}catch(error){}
      return { college:Number.isFinite(Number(data.college))?Number(data.college):null, workplace:Number.isFinite(Number(data.workplace))?Number(data.workplace):null, collegeLearningHours:Number.isFinite(Number(data.collegeLearningHours))?Number(data.collegeLearningHours):0, legacy:Number.isFinite(Number(legacy))&&legacy!==''?Number(legacy):null };
    }

    function combinedAttendancePercent(data=loadAttendanceData()) {
      if(data.college!==null&&data.workplace!==null)return (data.college+data.workplace)/2;
      return data.legacy;
    }

    function renderAttendPage() {
      openArchShell('Attend'); archDetailStack=[];
      const data=loadAttendanceData(), combined=combinedAttendancePercent(data);
      const fmt=value=>value===null?'Not received yet':`${Math.max(0,Math.min(100,Math.round(value)))}%`;
      archDetailContent.innerHTML=`<div class="detail-metrics"><div class="detail-metric"><strong>${fmt(data.college)}</strong><span>college attendance</span></div><div class="detail-metric"><strong>${fmt(data.workplace)}</strong><span>workplace attendance</span></div></div><div class="detail-card"><strong>${combined===null?'Combined attendance not available':`${Math.round(combined)}% combined attendance`}</strong><p>College attendance will be received from tutor/assessor review data. Workplace attendance will be received from employer/review data.</p></div><div class="detail-card"><strong>${data.collegeLearningHours.toFixed(1)} hours</strong><p>College OTJ/GLH learning hours received with attendance data.</p></div>`;
    }

    function learnerLearningHours() { return learningEntries.reduce((sum,entry)=>sum+(Number.isFinite(Number(entry.hours))?Math.max(0,Number(entry.hours)):0),0); }

    function totalLearningRequirement() {
      const meta=inferredCourseMeta();
      const candidates=[meta.learningRequiredHours,meta.requiredLearningHours,meta.otjHours,meta.glh,meta.learning?.requiredHours,meta.qualification?.glh,meta.qualification?.otjHours];
      for(const value of candidates){const n=Number(value);if(Number.isFinite(n)&&n>0)return n;}
      return null;
    }

    function renderLearnPage() {
      openArchShell('Learn'); archDetailStack=[];
      const attendance=loadAttendanceData(), college=attendance.collegeLearningHours||0, learner=learnerLearningHours(), total=college+learner, required=totalLearningRequirement(), elapsed=courseProgressPercent();
      const targetNow=required!==null&&elapsed!==null?required*(elapsed/100):null;
      const catchup=targetNow===null?null:Math.max(0,targetNow-total);
      const label=inferredCourseMeta().courseType==='nvq'?'GLH':'OTJ';
      archDetailContent.innerHTML=`<div class="detail-metrics"><div class="detail-metric"><strong>${college.toFixed(1)}h</strong><span>college ${label}</span></div><div class="detail-metric"><strong>${learner.toFixed(1)}h</strong><span>learner-added ${label}</span></div><div class="detail-metric"><strong>${total.toFixed(1)}h</strong><span>total learning</span></div><div class="detail-metric"><strong>${targetNow===null?'--':`${targetNow.toFixed(1)}h`}</strong><span>expected by now</span></div></div><div class="detail-card"><strong>${required===null?'Learning requirement not yet supplied by Naxos':`${required.toFixed(1)} total ${label} hours required`}</strong>${catchup===null?'<p>Evia will calculate catch-up once the Naxos learning requirement and course dates are available.</p>':catchup>0?`<p>You need ${catchup.toFixed(1)} additional learning hours to reach the current course position.</p>`:'<p>You are currently on or ahead of the learning-hours position.</p>'}</div><button class="catchup-button" id="openLearnCatchup" type="button"><strong>Catch Up</strong><span>Check completed evidence for learning entries that may have been missed.</span></button>`;
    }

    function completedPathsWithoutLearning() {
      const learned=new Set(learningEntries.filter(x=>Array.isArray(x.evidencePath)&&x.evidencePath.length).map(x=>evidencePathKey(x.evidencePath)));
      const result=[];
      completedEvidencePaths.forEach(key=>{try{const path=JSON.parse(key);if(Array.isArray(path)&&path.length&&!learned.has(key))result.push(path)}catch(error){}});
      return result;
    }

    function renderCatchupPage() {
      const paths=completedPathsWithoutLearning();
      archDetailContent.innerHTML=`<div class="detail-card"><strong>Evia catch-up</strong><p>These are completed evidence tasks where no Learn entry is currently attached. Only add learning that actually happened.</p></div>${paths.length?`<div class="mapping-list">${paths.map(path=>`<button class="mapping-button" type="button" data-catchup-path="${encodeURIComponent(JSON.stringify(path))}"><strong>${escapeDetailHtml(path[path.length-1])}</strong><span>${escapeDetailHtml(path.slice(0,-1).join(' › '))}</span></button>`).join('')}</div>`:'<div class="detail-card"><strong>No missing learning entries found</strong><p>Every completed evidence task currently has a Learn entry attached.</p></div>'}`;
    }

    function renderCatchupEntryForm(path) {
      archDetailContent.innerHTML=`<div class="detail-card"><strong>${escapeDetailHtml(path[path.length-1])}</strong><p>${escapeDetailHtml(path.slice(0,-1).join(' › '))}</p></div><div class="learn-catchup-form"><textarea id="catchupLearningText" placeholder="What did you learn?"></textarea><input id="catchupLearningHours" type="number" min="0" step="0.25" inputmode="decimal" placeholder="Learning hours"><button class="secondary-button" id="saveCatchupLearning" type="button">Save to Learn</button><div class="detail-muted" id="catchupLearningStatus"></div></div>`;
      document.getElementById('saveCatchupLearning')?.addEventListener('click',()=>{
        const text=document.getElementById('catchupLearningText').value.trim(), hours=Number(document.getElementById('catchupLearningHours').value||0), status=document.getElementById('catchupLearningStatus');
        if(!text){status.textContent='Add what you learned before saving.';return;}
        saveLearningReflection(text,hours,path,path[path.length-1]);
        status.textContent='Saved to Learn.';
        setTimeout(()=>{ archDetailStack=[]; renderLearnPage(); },250);
      });
    }

    function handleArchDetailAction(event) {
      const targetButton=event.target.closest('[data-course-target]');
      if(targetButton){const id=targetButton.dataset.courseTarget;pushArchView(()=>renderTargetDetail(id),id);return;}
      const unitButton=event.target.closest('[data-nvq-unit]');
      if(unitButton){const unit=unitButton.dataset.nvqUnit;pushArchView(()=>renderNvqUnitDetail(unit),inferredCourseMeta().unitTitles?.[unit]||`Unit ${unit}`);return;}
      const evidenceButton=event.target.closest('[data-evidence-path]');
      if(evidenceButton){try{goToEvidencePath(JSON.parse(decodeURIComponent(evidenceButton.dataset.evidencePath)))}catch(error){}return;}
      if(event.target.closest('#openLearnCatchup')){pushArchView(renderCatchupPage,'Catch Up');return;}
      const catchupButton=event.target.closest('[data-catchup-path]');
      if(catchupButton){try{const path=JSON.parse(decodeURIComponent(catchupButton.dataset.catchupPath));pushArchView(()=>renderCatchupEntryForm(path),'Add Learning')}catch(error){} }
    }

'''
insert_before('    function loadLearningEntries() {',arch_functions,'arch detail functions')

replace_block('    function saveLearningReflection(textValue){','    async function updateArchBars(){',r'''    function saveLearningReflection(textValue, hoursValue = 0, evidencePath = null, evidenceLabel = ''){
      const value=cleanText(textValue); if(!value)return null;
      const hours=Number(hoursValue);
      const path=Array.isArray(evidencePath)?evidencePath.slice():(completionContext?.path?completionContext.path.slice():[]);
      const label=cleanText(evidenceLabel)||(completionContext?.label||'');
      const entry={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,createdAt:new Date().toISOString(),text:value,hours:Number.isFinite(hours)&&hours>0?hours:0,evidencePath:path,evidenceLabel:label,courseTitle:activeCourseTitle,evidenceUse:'OTJ/GLH learning evidence'};
      learningEntries.unshift(entry);saveLearningEntries();updateArchBars().catch(()=>{});return entry;
    }

''','save learning reflection')

replace_block('    async function updateArchBars(){','    async function animateEvidenceIntoPortfolio()',r'''    async function updateArchBars(){
      const elapsed=courseProgressPercent();timeArchValue.textContent=elapsed===null?'--':`${Math.round(elapsed)}%`;
      if(courseItems===placeholderCourse){courseArchValue.textContent='--'}else{
        try{const leaves=courseLeaves(),entries=await getPortfolioEntries(),covered=new Set(entries.map(entry=>Array.isArray(entry.path)?entry.path.join('||'):'').filter(Boolean)),count=leaves.filter(leaf=>covered.has(leaf.path.join('||'))).length;courseArchValue.textContent=leaves.length?`${Math.round((count/leaves.length)*100)}%`:'--'}catch(error){courseArchValue.textContent='--'}
      }
      const attendance=combinedAttendancePercent();attendanceArchValue.textContent=attendance===null?'--':`${Math.max(0,Math.min(100,Math.round(attendance)))}%`;
      const required=totalLearningRequirement(), college=loadAttendanceData().collegeLearningHours||0, learner=learnerLearningHours(), total=college+learner;
      learnArchValue.textContent=required?`${Math.min(100,Math.round((total/required)*100))}%`:String(learningEntries.length||0);
    }

''','update arch bars')

replace_once("        portfolioPanel.classList.contains('open') ||\n", "        portfolioPanel.classList.contains('open') ||\n        archDetailPanel.classList.contains('open') ||\n", 'back button arch state')

replace_once("      if (scannerPanel.classList.contains('open')) {\n        closeScanner(true);\n        return;\n      }\n", "      if (scannerPanel.classList.contains('open')) {\n        closeScanner(true);\n        return;\n      }\n      if (archDetailPanel.classList.contains('open')) {\n        if (archDetailStack.length) restoreArchView();\n        else closeArchDetail();\n        return;\n      }\n", 'back arch handling')

listeners=r'''    timeArch.addEventListener('click', renderTimePage);
    courseArch.addEventListener('click', renderCoursePage);
    attendanceArch.addEventListener('click', renderAttendPage);
    learnArch.addEventListener('click', renderLearnPage);
    archDetailContent.addEventListener('click', handleArchDetailAction);

'''
insert_before("    naxosArch.addEventListener('click', toggleNaxosMenu);",listeners,'arch listeners')

p.write_text(s)
print('arch UI patch applied')
