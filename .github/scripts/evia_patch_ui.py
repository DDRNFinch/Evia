from pathlib import Path
p=Path('index.html'); t=p.read_text()
css_marker="    .naxos-menu {\n"
if '.bottom-arches {' not in t:
    css=r'''    .pill,.naxos-pill,.secondary-button,.capture-button,.reflection-pill,.chat-option{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .bottom-arches{position:absolute;left:0;right:0;bottom:0;height:64px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 86px minmax(0,1fr) minmax(0,1fr);align-items:end;gap:4px;padding:0 5px;z-index:8;pointer-events:none}
    .bottom-arches>button{pointer-events:auto}
    .status-arch{width:100%;height:54px;border-radius:58px 58px 0 0;border:1.5px solid rgba(245,196,0,.42);border-bottom:0;background:rgba(250,249,242,.97);box-shadow:0 -4px 14px rgba(0,0,0,.035),inset 0 0 0 1px rgba(255,255,255,.7);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;color:rgba(45,45,45,.65);padding:8px 3px 3px;cursor:default}
    .status-arch-value{max-width:100%;font-size:12px;line-height:1;font-weight:700;color:rgba(45,45,45,.72);white-space:nowrap;overflow:hidden}
    .status-arch-label{max-width:100%;font-size:9px;line-height:1.05;letter-spacing:.01em;white-space:nowrap;overflow:hidden}
    .bottom-arches .naxos-arch{position:relative;left:auto;bottom:auto;width:86px;height:62px;transform:none;align-self:end}
    .completion-panel{position:absolute;left:50%;top:calc(max(18px,env(safe-area-inset-top)) + 156px);bottom:72px;width:min(calc(100vw - 36px),430px);transform:translateX(-50%);display:none;align-items:flex-start;justify-content:center;z-index:6;pointer-events:none}
    .screen.completion-open .completion-panel{display:flex}
    .reflection-actions,.learn-reflection-box{width:100%;display:flex;flex-direction:column;gap:10px;pointer-events:auto}
    .reflection-actions[hidden],.learn-reflection-box[hidden],.flying-file[hidden]{display:none!important}
    .reflection-pill{width:100%;min-height:52px;border-radius:999px;border:1.5px solid rgba(245,196,0,.35);background:rgba(250,249,242,.96);box-shadow:0 8px 20px rgba(0,0,0,.05),inset 0 0 0 1px rgba(255,255,255,.72);color:rgba(45,45,45,.62);font-size:14px;padding:0 18px;cursor:pointer}
    .learn-reflection-box{border:1.5px solid rgba(245,196,0,.35);background:rgba(250,249,242,.96);border-radius:24px;padding:14px;box-shadow:0 8px 20px rgba(0,0,0,.05),inset 0 0 0 1px rgba(255,255,255,.72)}
    .learn-reflection-box textarea{width:100%;min-height:150px;resize:none;border:0;outline:0;background:transparent;color:#333;font-size:16px;line-height:1.45;padding:8px}
    .learn-reflection-actions{display:flex;justify-content:center}.learn-reflection-status{min-height:18px;text-align:center;font-size:12px;color:rgba(45,45,45,.62)}
    .flying-file{position:fixed;left:50%;top:43%;width:54px;height:68px;transform:translate(-50%,-50%) scale(1);border:2px solid rgba(245,196,0,.75);border-radius:8px;background:rgba(255,255,255,.98);box-shadow:0 10px 26px rgba(0,0,0,.12);opacity:0;pointer-events:none;z-index:40}
    .flying-file::before{content:"";position:absolute;right:-2px;top:-2px;width:18px;height:18px;border-left:2px solid rgba(245,196,0,.75);border-bottom:2px solid rgba(245,196,0,.75);background:#fff;clip-path:polygon(0 0,100% 100%,0 100%)}
    .flying-file::after{content:"";position:absolute;left:11px;right:11px;top:31px;height:2px;background:rgba(245,196,0,.55);box-shadow:0 8px 0 rgba(245,196,0,.38),0 16px 0 rgba(245,196,0,.25)}
    .flying-file.fly{animation:fileToPortfolio 1250ms cubic-bezier(.2,.8,.2,1) forwards}
    @keyframes fileToPortfolio{0%{top:43%;transform:translate(-50%,-50%) scale(.92);opacity:0}14%{opacity:1;transform:translate(-50%,-50%) scale(1)}72%{opacity:1}100%{top:calc(100dvh - 24px);transform:translate(-50%,-50%) scale(.16);opacity:0}}

'''
    if css_marker not in t: raise SystemExit('css marker missing')
    t=t.replace(css_marker,css+css_marker,1)
old='''    <button class="naxos-arch" id="naxosArch" type="button" aria-label="Open Naxos QR menu" aria-expanded="false">\n      <span class="naxos-scan-mark" aria-hidden="true"><span class="naxos-scan-dot"></span></span>\n    </button>'''
new='''    <div class="bottom-arches" id="bottomArches" aria-label="Learner progress">\n      <button class="status-arch" id="timeArch" type="button" aria-label="Time on course" tabindex="-1"><span class="status-arch-value" id="timeArchValue">--</span><span class="status-arch-label">Time</span></button>\n      <button class="status-arch" id="courseArch" type="button" aria-label="Course progress" tabindex="-1"><span class="status-arch-value" id="courseArchValue">--</span><span class="status-arch-label">Course</span></button>\n      <button class="naxos-arch" id="naxosArch" type="button" aria-label="Open Naxos QR and portfolio menu" aria-expanded="false"><span class="naxos-scan-mark" aria-hidden="true"><span class="naxos-scan-dot"></span></span></button>\n      <button class="status-arch" id="attendanceArch" type="button" aria-label="Attendance" tabindex="-1"><span class="status-arch-value" id="attendanceArchValue">--</span><span class="status-arch-label">Attendance</span></button>\n      <button class="status-arch" id="learnArch" type="button" aria-label="Learn entries" tabindex="-1"><span class="status-arch-value" id="learnArchValue">0</span><span class="status-arch-label">Learn</span></button>\n    </div>'''
if old not in t: raise SystemExit('arch markup missing')
t=t.replace(old,new,1)
marker='''    </section>\n\n    <div class="naxos-menu" id="naxosMenu" aria-label="Naxos QR menu">'''
insert='''    </section>\n\n    <section class="completion-panel" id="completionPanel" aria-label="Evidence completion">\n      <div class="flying-file" id="flyingFile" hidden aria-hidden="true"></div>\n      <div class="reflection-actions" id="reflectionActions" hidden><button class="reflection-pill" id="learnYes" type="button">Yes</button><button class="reflection-pill" id="learnNo" type="button">No</button></div>\n      <div class="learn-reflection-box" id="learnReflectionBox" hidden><textarea id="learnReflectionText" aria-label="What did you learn?" placeholder="What did you learn while completing this task?"></textarea><div class="learn-reflection-actions"><button class="capture-button" id="saveLearnReflection" type="button">Save to Learn</button></div><div class="learn-reflection-status" id="learnReflectionStatus"></div></div>\n    </section>\n\n    <div class="naxos-menu" id="naxosMenu" aria-label="Naxos QR menu">'''
if marker not in t: raise SystemExit('completion marker missing')
t=t.replace(marker,insert,1)
dom="    const naxosArch = document.getElementById('naxosArch');\n"
extra='''    const timeArchValue = document.getElementById('timeArchValue');\n    const courseArchValue = document.getElementById('courseArchValue');\n    const attendanceArchValue = document.getElementById('attendanceArchValue');\n    const learnArchValue = document.getElementById('learnArchValue');\n    const completionPanel = document.getElementById('completionPanel');\n    const flyingFile = document.getElementById('flyingFile');\n    const reflectionActions = document.getElementById('reflectionActions');\n    const learnYes = document.getElementById('learnYes');\n    const learnNo = document.getElementById('learnNo');\n    const learnReflectionBox = document.getElementById('learnReflectionBox');\n    const learnReflectionText = document.getElementById('learnReflectionText');\n    const saveLearnReflection = document.getElementById('saveLearnReflection');\n    const learnReflectionStatus = document.getElementById('learnReflectionStatus');\n'''
if dom not in t: raise SystemExit('dom marker missing')
t=t.replace(dom,dom+extra,1)
state="    let recordingStartedAt = 0;\n"
if state not in t: raise SystemExit('state marker missing')
t=t.replace(state,state+"    let capturePlan = [];\n    let captureStepIndex = 0;\n    let captureSessionId = 0;\n    let completionContext = null;\n    let learningEntries = loadLearningEntries();\n",1)
old_home="      return [name ? `Hi ${name}` : 'Hi', 'What are we working on today?'];"
if old_home not in t: raise SystemExit('home wording missing')
t=t.replace(old_home,"      return [name ? `Hi ${name}` : 'Hi', 'Tap me to get started'];",1)
clean='''    function cleanText(value) {\n      return typeof value === 'string' ? value.trim() : '';\n    }\n'''
fit=clean+r'''
    function fitTextToElement(element, minimum = 9) {
      if (!element || !element.isConnected || element.offsetParent === null) return;
      const computed = getComputedStyle(element);
      const base = Number(element.dataset.fitBase || parseFloat(computed.fontSize) || 14);
      if (!element.dataset.fitBase) element.dataset.fitBase = String(base);
      element.style.fontSize = `${base}px`;
      let size = base;
      while (size > minimum && element.scrollWidth > element.clientWidth + 1) { size -= .5; element.style.fontSize = `${size}px`; }
    }
    function fitUiText(){requestAnimationFrame(()=>document.querySelectorAll('.pill,.naxos-pill,.secondary-button,.capture-button,.reflection-pill,.chat-option').forEach(el=>fitTextToElement(el)))}
    function startTextFitObserver(){const observer=new MutationObserver(()=>fitUiText());observer.observe(screen,{subtree:true,childList:true,characterData:true});window.addEventListener('resize',fitUiText);fitUiText()}
'''
if clean not in t: raise SystemExit('clean marker missing')
t=t.replace(clean,fit,1)
choice="        button.dataset.evidenceLabel = option.label || heading;\n"
if choice not in t: raise SystemExit('choice marker missing')
t=t.replace(choice,choice+"        button.dataset.evidenceChoice = heading === 'Alternative' ? 'alternative' : 'recommended';\n",1)
p.write_text(t)
