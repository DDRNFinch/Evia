from pathlib import Path
p=Path('index.html'); t=p.read_text()
insert_marker='    async function runQuickReview() {'
if insert_marker not in t: raise SystemExit('helper marker missing')
helpers=r'''    function loadLearningEntries() {
      try { const parsed=JSON.parse(localStorage.getItem('eviaLearningEntries')||'[]'); return Array.isArray(parsed)?parsed:[]; }
      catch(error){ return []; }
    }

    function saveLearningEntries(){ try{localStorage.setItem('eviaLearningEntries',JSON.stringify(learningEntries))}catch(error){} }

    function saveLearningReflection(textValue){
      const value=cleanText(textValue); if(!value)return null;
      const entry={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,createdAt:new Date().toISOString(),text:value,evidencePath:completionContext?.path?completionContext.path.slice():[],evidenceLabel:completionContext?.label||'',courseTitle:activeCourseTitle,evidenceUse:'OTJ/GLH learning evidence'};
      learningEntries.unshift(entry);saveLearningEntries();updateArchBars().catch(()=>{});return entry;
    }

    async function updateArchBars(){
      const elapsed=courseProgressPercent();timeArchValue.textContent=elapsed===null?'--':`${Math.round(elapsed)}%`;
      if(courseItems===placeholderCourse){courseArchValue.textContent='--'}else{
        try{const leaves=courseLeaves(),entries=await getPortfolioEntries(),covered=new Set(entries.map(entry=>Array.isArray(entry.path)?entry.path.join('||'):'').filter(Boolean)),count=leaves.filter(leaf=>covered.has(leaf.path.join('||'))).length;courseArchValue.textContent=leaves.length?`${Math.round((count/leaves.length)*100)}%`:'--'}catch(error){courseArchValue.textContent='--'}
      }
      let attendance='';try{attendance=localStorage.getItem('eviaAttendancePercent')||''}catch(error){}
      const n=Number(attendance);attendanceArchValue.textContent=attendance!==''&&Number.isFinite(n)?`${Math.max(0,Math.min(100,Math.round(n)))}%`:'--';learnArchValue.textContent=String(learningEntries.length||0);
    }

    async function animateEvidenceIntoPortfolio(){flyingFile.hidden=false;flyingFile.classList.remove('fly');void flyingFile.offsetWidth;flyingFile.classList.add('fly');await wait(1280);flyingFile.classList.remove('fly');flyingFile.hidden=true}

    async function completeEvidenceExperience(){
      completionContext={path:activeEvidencePath.slice(),label:activeEvidencePath[activeEvidencePath.length-1]||activeEvidence?.label||'Evidence'};
      closeEvidence();resetPills();screen.classList.add('active','completion-open');screen.classList.remove('pills-ready','evidence-ready');reflectionActions.hidden=true;learnReflectionBox.hidden=true;learnReflectionText.value='';learnReflectionStatus.textContent='';updateBackButton();
      evia.classList.add('accent-squish');setTimeout(()=>evia.classList.remove('accent-squish'),1200);
      await speak(['Nice work — that evidence is safely filed in your portfolio.']);if(!screen.classList.contains('completion-open'))return;
      await animateEvidenceIntoPortfolio();if(!screen.classList.contains('completion-open'))return;
      await speak(['Did you learn anything new while doing this task?']);if(!screen.classList.contains('completion-open'))return;
      reflectionActions.hidden=false;fitUiText();updateBackButton();
    }

    function returnToHomeFromCompletion(){stopTalking(false);clearCaptureSequence();completionContext=null;reflectionActions.hidden=true;learnReflectionBox.hidden=true;flyingFile.hidden=true;screen.classList.remove('completion-open','active','pills-ready','evidence-open','evidence-ready');resetPills();setSpeech(homeSpeechLines());updateBackButton();fitUiText()}

    async function openLearnReflection(){reflectionActions.hidden=true;learnReflectionBox.hidden=false;learnReflectionText.value='';learnReflectionStatus.textContent='';await speak(['What did you learn?']);if(screen.classList.contains('completion-open'))learnReflectionText.focus()}

    async function storeLearnReflection(){const value=learnReflectionText.value.trim();if(!value){learnReflectionStatus.textContent='Add what you learned before saving.';return}saveLearningReflection(value);learnReflectionStatus.textContent='Saved to Learn.';await speak(["Thanks — I've added that to Learn."]);await wait(350);returnToHomeFromCompletion()}

'''
t=t.replace(insert_marker,helpers+insert_marker,1)
back_old='''      if (captureMode !== null && screen.classList.contains('evidence-open')) {\n        setSpeech(evidenceSpeechLines());\n        evidenceRequirements.classList.remove('evidence-enter', 'reveal-step');\n        renderEvidenceChoices(false);\n        screen.classList.add('evidence-ready');\n        return;\n      }'''
back_new='''      if (screen.classList.contains('completion-open')) {\n        returnToHomeFromCompletion();\n        return;\n      }\n      if (captureMode !== null && screen.classList.contains('evidence-open')) {\n        cancelEvidenceCollectionToChoices();\n        return;\n      }'''
if back_old not in t: raise SystemExit('back capture branch missing')
t=t.replace(back_old,back_new,1)
cond="        captureMode !== null ||\n        screen.classList.contains('evidence-open') ||"
if cond not in t: raise SystemExit('back condition missing')
t=t.replace(cond,"        captureMode !== null ||\n        screen.classList.contains('completion-open') ||\n        screen.classList.contains('evidence-open') ||",1)
events="    naxosArch.addEventListener('click', toggleNaxosMenu);\n"
if events not in t: raise SystemExit('event marker missing')
t=t.replace(events,"    learnNo.addEventListener('click', returnToHomeFromCompletion);\n    learnYes.addEventListener('click', openLearnReflection);\n    saveLearnReflection.addEventListener('click', storeLearnReflection);\n\n"+events,1)
profile="      refreshGuidanceStatic();\n    });\n\n    downloadPortfolio.addEventListener('click', downloadPortfolioZip);"
if profile not in t: raise SystemExit('profile marker missing')
t=t.replace(profile,"      refreshGuidanceStatic();\n      updateArchBars().catch(() => {});\n    });\n\n    downloadPortfolio.addEventListener('click', downloadPortfolioZip);",1)
init='''    renderCourseTitle();\n    applyLook();\n    speak(homeSpeechLines());'''
if init not in t: raise SystemExit('init marker missing')
t=t.replace(init,'''    renderCourseTitle();\n    applyLook();\n    startTextFitObserver();\n    updateArchBars().catch(() => {});\n    speak(homeSpeechLines());''',1)
imp='''      applyImportedCourse(items, cleanText(pack?.qualification?.title));\n      closeScanner(false);'''
if imp in t:t=t.replace(imp,'''      applyImportedCourse(items, cleanText(pack?.qualification?.title));\n      updateArchBars().catch(() => {});\n      closeScanner(false);''',1)
p.write_text(t)
sw=Path('service-worker.js')
if sw.exists():sw.write_text(sw.read_text().replace("const C='evia-pwa-v1'","const C='evia-pwa-v2'",1))
