from pathlib import Path

path=Path('index.html')
text=path.read_text(encoding='utf-8')


def replace_once(old,new,label):
    global text
    if old not in text:
        raise SystemExit(f'marker not found: {label}')
    text=text.replace(old,new,1)


def replace_between(start,end,new_block,label):
    global text
    s=text.find(start)
    if s<0: raise SystemExit(f'start marker not found: {label}')
    e=text.find(end,s)
    if e<0: raise SystemExit(f'end marker not found: {label}')
    text=text[:s]+new_block+text[e:]

# UI overrides: one rounded progress arch, unclipped check-in badge, stronger Learn actions,
# duration inputs, clickable OTJ idea cards, and a visible evidence hover before filing.
css_marker='    @keyframes talkingFloat {'
css_block=r'''    /* approved Learn/catch-up UI, progress consistency and save animation */
    .chat-option { overflow: visible; }
    .status-arch {
      border: 0 !important;
      border-bottom: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      overflow: visible !important;
      padding-top: 10px;
    }
    .arch-progress-svg { inset: -2px 0 0; height: 58px; overflow: visible; }
    .arch-progress-track,.arch-progress-fill { stroke-width: 3.2; stroke-linecap: round; }
    .arch-progress-track { stroke: rgba(245,196,0,.22); }
    .learn-action-grid { display:grid; grid-template-columns:1fr; gap:10px; }
    .learn-action-card {
      width:100%; min-height:84px; border:1.5px solid rgba(245,196,0,.32); border-radius:22px;
      background:linear-gradient(180deg,#fff,rgba(250,249,242,.96)); box-shadow:0 8px 22px rgba(0,0,0,.045);
      text-align:left; padding:15px 16px; cursor:pointer; display:flex; flex-direction:column; gap:5px;
    }
    .learn-action-card strong { font-size:14px; color:#333; }
    .learn-action-card span { font-size:11.5px; line-height:1.38; color:#505050; }
    .learn-action-card .learn-action-count { width:fit-content; padding:3px 8px; border-radius:999px; background:rgba(245,196,0,.15); font-size:10px; font-weight:700; }
    .otj-idea-button { text-align:left; cursor:pointer; appearance:none; }
    .otj-idea-button:active,.learn-action-card:active { transform:scale(.99); }
    .learning-time-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
    .learning-time-grid label { display:flex; flex-direction:column; gap:5px; font-size:11px; font-weight:700; color:#505050; }
    .learning-time-grid input,.learn-date-input {
      width:100%; min-height:44px; border:1.5px solid rgba(245,196,0,.30); border-radius:14px;
      background:#fff; padding:0 11px; color:#333; outline:0;
    }
    .learn-reflection-time { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
    .learn-reflection-time label { display:flex; flex-direction:column; gap:4px; font-size:11px; font-weight:700; color:#505050; }
    .learn-reflection-time input { min-height:44px; border:1.5px solid rgba(245,196,0,.30); border-radius:14px; background:#fff; padding:0 11px; color:#333; outline:0; }
    .flying-file { opacity:1; top:43%; }
    .flying-file.hover { animation:fileSavedHover 1000ms ease-in-out both; }
    .flying-file.fly { animation:fileToPortfolioApproved 920ms cubic-bezier(.2,.8,.2,1) forwards; }
    @keyframes fileSavedHover { 0%{opacity:0;transform:translate(-50%,-50%) scale(.9)} 20%{opacity:1;transform:translate(-50%,-50%) scale(1)} 55%{transform:translate(-50%,calc(-50% - 5px)) scale(1.02)} 100%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
    @keyframes fileToPortfolioApproved { 0%{top:43%;transform:translate(-50%,-50%) scale(1);opacity:1} 70%{opacity:1} 100%{top:calc(100dvh - 24px);transform:translate(-50%,-50%) scale(.16);opacity:0} }

'''
if css_block.strip() not in text:
    replace_once(css_marker,css_block+css_marker,'css insertion')

# Make the SVG itself the only arch outline and use a rounder curve.
text=text.replace('d="M5 51 A45 45 0 0 1 95 51"','d="M8 52 C8 20 25 7 50 7 C75 7 92 20 92 52"')

old_reflection='<div class="learn-reflection-box" id="learnReflectionBox" hidden><textarea id="learnReflectionText" aria-label="What did you learn?" placeholder="What did you learn while completing this task?"></textarea><div class="learn-reflection-actions"><button class="capture-button" id="saveLearnReflection" type="button">Save to Learn</button></div><div class="learn-reflection-status" id="learnReflectionStatus"></div></div>'
new_reflection='<div class="learn-reflection-box" id="learnReflectionBox" hidden><textarea id="learnReflectionText" aria-label="What did you learn?" placeholder="What did you learn while completing this task?"></textarea><div class="learn-reflection-time"><label>Hours<input id="learnReflectionHours" type="number" min="0" step="1" inputmode="numeric" value="0"></label><label>Minutes<input id="learnReflectionMinutes" type="number" min="0" max="59" step="1" inputmode="numeric" value="0"></label></div><div class="learn-reflection-actions"><button class="capture-button" id="saveLearnReflection" type="button">Save to Learn</button></div><div class="learn-reflection-status" id="learnReflectionStatus"></div></div>'
replace_once(old_reflection,new_reflection,'completion learning inputs')

old_refs="    const learnReflectionText = document.getElementById('learnReflectionText');\n    const saveLearnReflection = document.getElementById('saveLearnReflection');"
new_refs="    const learnReflectionText = document.getElementById('learnReflectionText');\n    const learnReflectionHours = document.getElementById('learnReflectionHours');\n    const learnReflectionMinutes = document.getElementById('learnReflectionMinutes');\n    const saveLearnReflection = document.getElementById('saveLearnReflection');"
replace_once(old_refs,new_refs,'reflection refs')

# Learn landing page: clearer cards rather than cramped text buttons.
replace_between(
    '    function renderLearnPage(){',
    '    function completedPathsWithoutLearning() {',
    r'''    function renderLearnPage(){
      openArchShell('Learn');archDetailStack=[];
      const attendance=loadAttendanceData(),college=attendance.collegeLearningHours||0,learner=learnerLearningHours(),total=college+learner,required=totalLearningRequirement(),elapsed=courseProgressPercent();
      const targetNow=required!==null&&elapsed!==null?required*(elapsed/100):null,catchup=targetNow===null?null:Math.max(0,targetNow-total),label=inferredCourseMeta().courseType==='nvq'?'GLH':'OTJ',uncovered=uncoveredOtjIdeas();
      archDetailContent.innerHTML=`<div class="detail-card"><strong>${label} learning position</strong><p>${required===null?'Evia is waiting for the course learning-hours requirement from Naxos.':`${required.toFixed(1)} total ${label} hours are required for this course.`}</p></div><div class="detail-metrics"><div class="detail-metric"><strong>${college.toFixed(1)}h</strong><span>college ${label}</span></div><div class="detail-metric"><strong>${learner.toFixed(1)}h</strong><span>learner-added ${label}</span></div><div class="detail-metric"><strong>${total.toFixed(1)}h</strong><span>total learning</span></div><div class="detail-metric"><strong>${targetNow===null?'--':`${targetNow.toFixed(1)}h`}</strong><span>expected by now</span></div></div><div class="detail-card"><strong>${catchup===null?'Catch-up position not available yet':catchup>0?`${catchup.toFixed(1)}h to catch up`:'On or ahead of target'}</strong>${catchup===null?'<p>Evia will calculate catch-up once the Naxos learning requirement and course dates are available.</p>':catchup>0?`<p>You need ${catchup.toFixed(1)} additional learning hours to reach the current course position.</p>`:'<p>Your recorded learning hours are currently on or ahead of the expected course position.</p>'}</div><div class="learn-action-grid"><button class="learn-action-card" id="openLearnCatchup" type="button"><strong>Catch Up from evidence</strong><span>Review completed evidence that has no Learn entry yet.</span></button><button class="learn-action-card" id="openOtjIdeas" type="button"><span class="learn-action-count">${uncovered.length} gap${uncovered.length===1?'':'s'} to consider</span><strong>Explore OTJ ideas</strong><span>Choose a learning activity, then add the date, details, hours and minutes.</span></button></div>`;
    }

''',
    'renderLearnPage'
)

# OTJ ideas are selectable and lead to a real Learn entry form.
replace_between(
    '    function renderOtjIdeasPage(){',
    '    function renderLearnPage(){',
    r'''    function otjIdeaMarkup(idea,uncovered=false){
      return `<button class="otj-idea otj-idea-button${uncovered?' uncovered':''}" type="button" data-otj-idea="${escapeDetailHtml(idea.id)}">${uncovered?'<span class="otj-idea-badge">Gap to consider</span>':''}<strong>${escapeDetailHtml(idea.title)}</strong><span>${escapeDetailHtml(idea.description)}</span></button>`;
    }
    function renderOtjIdeasPage(){
      const uncovered=uncoveredOtjIdeas(),ids=new Set(uncovered.map(x=>x.id)),priority=uncovered.slice(0,8);
      archDetailContent.innerHTML=`<div class="detail-card"><strong>OTJ learning ideas</strong><p>Choose an activity only if it genuinely happened and developed occupational knowledge, skills or behaviours. Normal college days are tracked separately.</p></div><div class="detail-section-heading"><strong>Gaps to consider</strong><span>${uncovered.length} of ${OTJ_ACTIVITY_LIBRARY.length}</span></div><div class="otj-ideas">${priority.length?priority.map(idea=>otjIdeaMarkup(idea,true)).join(''):'<div class="detail-card"><strong>Good coverage</strong><p>Your Learn entries already mention all of Evia’s OTJ idea areas.</p></div>'}</div><div class="detail-section-heading"><strong>All ideas</strong><span>Tap to add learning</span></div><div class="otj-ideas">${OTJ_ACTIVITY_LIBRARY.map(idea=>otjIdeaMarkup(idea,ids.has(idea.id))).join('')}</div>`;
    }

    function renderOtjEntryForm(ideaId){
      const idea=OTJ_ACTIVITY_LIBRARY.find(item=>item.id===ideaId);if(!idea)return;
      const today=new Date(),yyyy=today.getFullYear(),mm=String(today.getMonth()+1).padStart(2,'0'),dd=String(today.getDate()).padStart(2,'0');
      archDetailContent.innerHTML=`<div class="detail-card"><strong>${escapeDetailHtml(idea.title)}</strong><p>${escapeDetailHtml(idea.description)}</p><p class="detail-muted">Only save this if the learning actually took place.</p></div><div class="learn-catchup-form"><label class="detail-muted">Date</label><input class="learn-date-input" id="otjLearningDate" type="date" value="${yyyy}-${mm}-${dd}"><textarea id="otjLearningText" placeholder="What did you learn?"></textarea><div class="learning-time-grid"><label>Hours<input id="otjLearningHours" type="number" min="0" step="1" inputmode="numeric" value="0"></label><label>Minutes<input id="otjLearningMinutes" type="number" min="0" max="59" step="1" inputmode="numeric" value="0"></label></div><button class="secondary-button" id="saveOtjLearning" type="button">Save to Learn</button><div class="detail-muted" id="otjLearningStatus"></div></div>`;
      document.getElementById('saveOtjLearning')?.addEventListener('click',()=>{
        const textValue=document.getElementById('otjLearningText').value.trim(),hours=Math.max(0,Number(document.getElementById('otjLearningHours').value||0)),minutes=Math.max(0,Math.min(59,Number(document.getElementById('otjLearningMinutes').value||0))),date=document.getElementById('otjLearningDate').value,status=document.getElementById('otjLearningStatus');
        if(!textValue){status.textContent='Add what you learned before saving.';return}
        const totalHours=hours+(minutes/60);
        if(totalHours<=0){status.textContent='Add the learning time before saving.';return}
        saveLearningReflection(textValue,totalHours,[],idea.title,{activityType:idea.id,learningDate:date,learningSource:'learner-added OTJ'});
        status.textContent='Saved to Learn.';setTimeout(()=>{archDetailStack=[];renderLearnPage()},250);
      });
    }

''',
    'OTJ ideas forms'
)

# Catch-up evidence form uses hours + minutes as well.
replace_between(
    '    async function renderCatchupEntryForm(path){',
    '    function handleArchDetailAction(event){',
    r'''    async function renderCatchupEntryForm(path){
      let entries=[];try{entries=entriesForEvidencePath(await getPortfolioEntries(),path)}catch(error){}const date=completedEvidenceDate(entries),encoded=encodeURIComponent(JSON.stringify(path));
      archDetailContent.innerHTML=`<div class="detail-card"><strong>${escapeDetailHtml(path[path.length-1])}</strong><p>${escapeDetailHtml(path.slice(0,-1).join(' › '))}</p><p>${date?`Evidence completed ${escapeDetailHtml(date)}`:'Evidence completion date unavailable'}</p>${entries.length?`<button class="detail-action-button" type="button" data-catchup-view="${encoded}" style="margin-top:10px">View Evidence</button>`:''}</div><div class="learn-catchup-form"><textarea id="catchupLearningText" placeholder="What did you learn?"></textarea><div class="learning-time-grid"><label>Hours<input id="catchupLearningHours" type="number" min="0" step="1" inputmode="numeric" value="0"></label><label>Minutes<input id="catchupLearningMinutes" type="number" min="0" max="59" step="1" inputmode="numeric" value="0"></label></div><button class="secondary-button" id="saveCatchupLearning" type="button">Save to Learn</button><div class="detail-muted" id="catchupLearningStatus"></div></div>`;
      document.getElementById('saveCatchupLearning')?.addEventListener('click',()=>{const textValue=document.getElementById('catchupLearningText').value.trim(),hours=Math.max(0,Number(document.getElementById('catchupLearningHours').value||0)),minutes=Math.max(0,Math.min(59,Number(document.getElementById('catchupLearningMinutes').value||0))),status=document.getElementById('catchupLearningStatus');if(!textValue){status.textContent='Add what you learned before saving.';return}const totalHours=hours+(minutes/60);if(totalHours<=0){status.textContent='Add the learning time before saving.';return}saveLearningReflection(textValue,totalHours,path,path[path.length-1]);status.textContent='Saved to Learn.';setTimeout(()=>{archDetailStack=[];renderLearnPage()},250)});
    }

''',
    'catchup duration form'
)

# Route selected OTJ idea cards to their entry form.
old_handle="      if(event.target.closest('#openOtjIdeas')){pushArchView(renderOtjIdeasPage,'OTJ Ideas');return}\n      const viewButton=event.target.closest('[data-catchup-view]');"
new_handle="      if(event.target.closest('#openOtjIdeas')){pushArchView(renderOtjIdeasPage,'OTJ Ideas');return}\n      const otjIdeaButton=event.target.closest('[data-otj-idea]');if(otjIdeaButton){const ideaId=otjIdeaButton.dataset.otjIdea;pushArchView(()=>renderOtjEntryForm(ideaId),'Add Learning');return}\n      const viewButton=event.target.closest('[data-catchup-view]');"
replace_once(old_handle,new_handle,'OTJ action handler')

# Learning entries can carry optional activity/date metadata while existing calls remain unchanged.
replace_between(
    '    function saveLearningReflection(textValue, hoursValue = 0, evidencePath = null, evidenceLabel = \'\'){',
    '    function setArchProgress(archId,value)',
    r'''    function saveLearningReflection(textValue, hoursValue = 0, evidencePath = null, evidenceLabel = '', extras = {}){
      const value=cleanText(textValue); if(!value)return null;
      const hours=Number(hoursValue);
      const path=Array.isArray(evidencePath)?evidencePath.slice():(completionContext?.path?completionContext.path.slice():[]);
      const label=cleanText(evidenceLabel)||(completionContext?.label||'');
      const entry={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,createdAt:new Date().toISOString(),text:value,hours:Number.isFinite(hours)&&hours>0?hours:0,evidencePath:path,evidenceLabel:label,courseTitle:activeCourseTitle,evidenceUse:'OTJ/GLH learning evidence',...(extras&&typeof extras==='object'?extras:{})};
      learningEntries.unshift(entry);saveLearningEntries();updateArchBars().catch(()=>{});return entry;
    }

    function completedCourseProgress(){
      const leaves=courseLeaves();
      if(!leaves.length)return {completed:0,total:0,percent:null};
      const completed=leaves.filter(leaf=>completedEvidencePaths.has(evidencePathKey(leaf.path))).length;
      return {completed,total:leaves.length,percent:(completed/leaves.length)*100};
    }

''',
    'saveLearningReflection + course progress helper'
)

# Home Course arch uses exactly the same completed task definition as Quick Review.
replace_between(
    '    async function updateArchBars(){',
    '    async function animateEvidenceIntoPortfolio()',
    r'''    async function updateArchBars(){
      updateWeeklyCheckInBadge();
      const elapsed=courseProgressPercent();timeArchValue.textContent=elapsed===null?'--':`${Math.round(elapsed)}%`;setArchProgress('timeArch',elapsed);
      let coursePercent=null;if(courseItems===placeholderCourse){courseArchValue.textContent='--'}else{const progress=completedCourseProgress();coursePercent=progress.percent;courseArchValue.textContent=coursePercent===null?'--':`${Math.round(coursePercent)}%`}setArchProgress('courseArch',coursePercent);
      const attendance=combinedAttendancePercent();attendanceArchValue.textContent=attendance===null?'--':`${Math.max(0,Math.min(100,Math.round(attendance)))}%`;setArchProgress('attendanceArch',attendance);
      const required=totalLearningRequirement(),college=loadAttendanceData().collegeLearningHours||0,learner=learnerLearningHours(),total=college+learner,learnPercent=required?Math.min(100,(total/required)*100):null;learnArchValue.textContent=learnPercent!==null?`${Math.round(learnPercent)}%`:String(learningEntries.length||0);setArchProgress('learnArch',learnPercent);
    }

''',
    'home Course progress'
)

# Save animation: visible hover for one second, then deliberate flight to Portfolio.
replace_between(
    '    async function animateEvidenceIntoPortfolio(){',
    '    async function completeEvidenceExperience(){',
    r'''    async function animateEvidenceIntoPortfolio(){
      flyingFile.hidden=false;flyingFile.classList.remove('fly','hover');void flyingFile.offsetWidth;flyingFile.classList.add('hover');
      await wait(1000);
      flyingFile.classList.remove('hover');void flyingFile.offsetWidth;flyingFile.classList.add('fly');
      await wait(920);
      flyingFile.classList.remove('fly');flyingFile.hidden=true;
    }

''',
    'evidence save animation'
)

# Reset and store evidence-linked Learn hours/minutes.
old_reset="reflectionActions.hidden=true;learnReflectionBox.hidden=true;learnReflectionText.value='';learnReflectionStatus.textContent='';updateBackButton();"
new_reset="reflectionActions.hidden=true;learnReflectionBox.hidden=true;learnReflectionText.value='';learnReflectionHours.value='0';learnReflectionMinutes.value='0';learnReflectionStatus.textContent='';updateBackButton();"
replace_once(old_reset,new_reset,'completion reflection reset')

old_open="    async function openLearnReflection(){reflectionActions.hidden=true;learnReflectionBox.hidden=false;learnReflectionText.value='';learnReflectionStatus.textContent='';await speak(['What did you learn?']);if(screen.classList.contains('completion-open'))learnReflectionText.focus()}"
new_open="    async function openLearnReflection(){reflectionActions.hidden=true;learnReflectionBox.hidden=false;learnReflectionText.value='';learnReflectionHours.value='0';learnReflectionMinutes.value='0';learnReflectionStatus.textContent='';await speak(['What did you learn?']);if(screen.classList.contains('completion-open'))learnReflectionText.focus()}"
replace_once(old_open,new_open,'open learning reflection')

old_store='    async function storeLearnReflection(){const value=learnReflectionText.value.trim();if(!value){learnReflectionStatus.textContent=\'Add what you learned before saving.\';return}saveLearningReflection(value);learnReflectionStatus.textContent=\'Saved to Learn.\';await speak(["Thanks — I\'ve added that to Learn."]);await wait(350);returnToHomeFromCompletion()}'
new_store='    async function storeLearnReflection(){const value=learnReflectionText.value.trim(),hours=Math.max(0,Number(learnReflectionHours.value||0)),minutes=Math.max(0,Math.min(59,Number(learnReflectionMinutes.value||0)));if(!value){learnReflectionStatus.textContent=\'Add what you learned before saving.\';return}const totalHours=hours+(minutes/60);if(totalHours<=0){learnReflectionStatus.textContent=\'Add the learning time before saving.\';return}saveLearningReflection(value,totalHours);learnReflectionStatus.textContent=\'Saved to Learn.\';await speak(["Thanks — I\'ve added that to Learn."]);await wait(350);returnToHomeFromCompletion()}'
replace_once(old_store,new_store,'store learning reflection')

# Quick Review uses completed evidence tasks, matching the home Course percentage.
old_quick="""    async function runQuickReview() {
      const leaves = courseLeaves();
      if (!leaves.length) {
        await chatSay('I need your Naxos course first. Once it is loaded, I can review your progress.', mainChatOptions());
        return;
      }
      let entries = [];
      try { entries = await getPortfolioEntries(); } catch (error) { entries = []; }
      const evidencePaths = new Set(entries.map((entry) => Array.isArray(entry.path) ? entry.path.join('||') : '').filter(Boolean));
      const coveredLeaves = leaves.filter((leaf) => evidencePaths.has(leaf.path.join('||')));
      const coverage = leaves.length ? Math.round((coveredLeaves.length / leaves.length) * 100) : 0;
"""
new_quick="""    async function runQuickReview() {
      const leaves = courseLeaves();
      if (!leaves.length) {
        await chatSay('I need your Naxos course first. Once it is loaded, I can review your progress.', mainChatOptions());
        return;
      }
      const evidencePaths = new Set();
      completedEvidencePaths.forEach((key)=>{try{const savedPath=JSON.parse(key);if(Array.isArray(savedPath))evidencePaths.add(savedPath.join('||'))}catch(error){}});
      const coveredLeaves = leaves.filter((leaf) => completedEvidencePaths.has(evidencePathKey(leaf.path)));
      const coverage = leaves.length ? Math.round((coveredLeaves.length / leaves.length) * 100) : 0;
"""
replace_once(old_quick,new_quick,'Quick Review progress source')

required=['data-otj-idea','learnReflectionHours','learnReflectionMinutes','function completedCourseProgress()','fileSavedHover','Gap to consider','saveLearningReflection(textValue,totalHours,[],idea.title','completedEvidencePaths.has(evidencePathKey(leaf.path))']
for marker in required:
    if marker not in text: raise SystemExit('missing required marker: '+marker)

path.write_text(text,encoding='utf-8')
print('approved Evia learning UI/progress patch applied')
