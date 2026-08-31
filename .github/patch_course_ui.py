from pathlib import Path
import re

p = Path('index.html')
s = p.read_text()


def replace_once(old, new, label):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    s = s.replace(old, new, 1)


replace_once("""    .eye {
      transition:
        width 240ms ease,
        height 240ms ease,
        border 240ms ease,
        border-radius 240ms ease,
        transform 150ms ease;
    }

""", "", 'remove independent eye size transition')

replace_once("""    .speech-line { width: 100%; min-height: 21px; line-height: 1.45; white-space: normal; }
  .speech-line-reveal {
""", """    .speech-line { width: 100%; min-height: 21px; line-height: 1.45; white-space: normal; }

    .course-title {
      position: absolute;
      left: 50%;
      top: calc(max(18px, env(safe-area-inset-top)) + 136px);
      width: min(calc(100vw - 42px), 430px);
      transform: translateX(-50%);
      color: rgba(45, 45, 45, 0.62);
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.3;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      z-index: 3;
      transition: opacity 320ms ease, visibility 0s linear 320ms;
    }

    .screen.active:not(.evidence-open) .course-title.has-title {
      opacity: 1;
      visibility: visible;
      transition: opacity 320ms ease, visibility 0s linear 0s;
    }

  .speech-line-reveal {
""", 'course title CSS')

replace_once("top: calc(max(18px, env(safe-area-inset-top)) + 152px);\n      width: min(calc(100vw - 40px), 460px);", "top: calc(max(18px, env(safe-area-inset-top)) + 160px);\n      width: min(calc(100vw - 40px), 460px);", 'pill stack top')
replace_once("""      transition:
        opacity 520ms ease 360ms,
        transform 820ms cubic-bezier(0.22, 1, 0.36, 1) 360ms,
        visibility 0s linear 360ms;
""", """      transition:
        opacity 520ms ease,
        transform 820ms cubic-bezier(0.22, 1, 0.36, 1),
        visibility 0s linear 0s;
""", 'remove pill reveal delay')

replace_once("""    <div class=\"evia-speech\" id=\"eviaSpeech\" aria-live=\"polite\" aria-atomic=\"true\"></div>

    <div class=\"pill-stack\" id=\"pillStack\" aria-label=\"Course menu\"></div>
""", """    <div class=\"evia-speech\" id=\"eviaSpeech\" aria-live=\"polite\" aria-atomic=\"true\"></div>
    <div class=\"course-title\" id=\"courseTitle\" aria-live=\"polite\"></div>

    <div class=\"pill-stack\" id=\"pillStack\" aria-label=\"Course menu\"></div>
""", 'course title HTML')

replace_once("""    const eviaSpeech = document.getElementById('eviaSpeech');
    const backButton = document.getElementById('backButton');
""", """    const eviaSpeech = document.getElementById('eviaSpeech');
    const courseTitle = document.getElementById('courseTitle');
    const backButton = document.getElementById('backButton');
""", 'course title DOM binding')

replace_once("""    let currentItems = placeholderCourse;
    let courseItems = loadSavedCourse() || placeholderCourse;
    let activeEvidence = null;
""", """    let currentItems = placeholderCourse;
    let courseItems = loadSavedCourse() || placeholderCourse;
    let activeCourseTitle = loadSavedCourseTitle();
    let activeEvidence = null;
""", 'course title state')

replace_once("""  function homeSpeechLines() {
      const name = learnerConversationName();
      return [name ? `Hi ${name}` : 'Hi', 'What are we doing today?'];
    }

    function menuSpeechLines(level = menuLevel) {
      if (level === 1) return ['What task are we working on?'];
      if (level === 2) return ['What part of that task are we evidencing?'];
      return ['Ok great, here are some evidence opportunities.'];
    }

    function evidenceSpeechLines() {
      const recommendation = cleanText(activeEvidence?.recommended?.label);
      return recommendation
        ? ['Choose how you want to evidence this.', `(I recommend ${recommendation})`]
        : ['Choose how you want to evidence this.'];
    }
""", """  function homeSpeechLines() {
      const name = learnerConversationName();
      return [name ? `Hi ${name}` : 'Hi', 'What are we working on today?'];
    }

    function menuSpeechLines(level = menuLevel) {
      if (level === 1) return ['What are you working on today?'];
      if (level === 2) return ['Okay, which part are we getting evidence for?'];
      return ['Great — here are your best evidence options.'];
    }

    function evidenceSpeechLines() {
      const recommendation = cleanText(activeEvidence?.recommended?.label);
      return recommendation
        ? ['How would you like to evidence this?', `I'd recommend ${recommendation}.`]
        : ['How would you like to evidence this?'];
    }
""", 'natural Evia wording')

replace_once("""    function saveCourse(items) {
      try {
        localStorage.setItem('eviaNaxosCourse', JSON.stringify(items));
      } catch (error) {
        // Imported course remains active for this session.
      }
    }

    function cleanText(value) {
""", """    function loadSavedCourseTitle() {
      try {
        return cleanText(localStorage.getItem('eviaNaxosCourseTitle'));
      } catch (error) {
        return '';
      }
    }

    function saveCourse(items, title = activeCourseTitle) {
      try {
        localStorage.setItem('eviaNaxosCourse', JSON.stringify(items));
        if (cleanText(title)) localStorage.setItem('eviaNaxosCourseTitle', cleanText(title));
        else localStorage.removeItem('eviaNaxosCourseTitle');
      } catch (error) {
        // Imported course remains active for this session.
      }
    }

    function renderCourseTitle() {
      const title = cleanText(activeCourseTitle);
      courseTitle.textContent = title;
      courseTitle.classList.toggle('has-title', Boolean(title));
    }

    function cleanText(value) {
""", 'course title persistence')

replace_once("""          currentItems = node.children.slice(0, 5);
          screen.classList.remove('pills-ready');
          const targetLevel = menuLevel;
          const finished = await speak(menuSpeechLines(targetLevel));
          if (!finished || menuLevel !== targetLevel || screen.classList.contains('evidence-open')) {
            pillTransitionBusy = false;
            return;
          }
          renderPills(true);
          screen.classList.add('pills-ready');
          pillTransitionBusy = false;
""", """          currentItems = node.children.slice(0, 5);
          screen.classList.remove('pills-ready');
          const targetLevel = menuLevel;
          const speechPromise = speak(menuSpeechLines(targetLevel));
          renderPills(true);
          screen.classList.add('pills-ready');
          const finished = await speechPromise;
          if (!finished || menuLevel !== targetLevel || screen.classList.contains('evidence-open')) {
            pillTransitionBusy = false;
            return;
          }
          pillTransitionBusy = false;
""", 'level pill and speech concurrency')

replace_once("""      updateBackButton();
      const finished = await speak(menuSpeechLines(1));
      if (!finished || !screen.classList.contains('active') || menuLevel !== 1 || screen.classList.contains('evidence-open')) return;
      renderPills(true);
      screen.classList.add('pills-ready');
""", """      updateBackButton();
      const speechPromise = speak(menuSpeechLines(1));
      renderPills(true);
      screen.classList.add('pills-ready');
      const finished = await speechPromise;
      if (!finished || !screen.classList.contains('active') || menuLevel !== 1 || screen.classList.contains('evidence-open')) return;
""", 'home pill and speech concurrency')

replace_once("""      const items = buildNaxosKsbCourse(categories, registry, evidenceRules);
      if (!items.length) throw new Error('The Naxos KSB pack contains no course structure.');
      applyImportedCourse(items);
      closeScanner(false);
    }

    function applyImportedCourse(items) {
      courseItems = items.slice(0, 5);
      saveCourse(courseItems);
      closeEvidence();
      resetPills();
      screen.classList.add('active', 'pills-ready');
      setSpeech(menuSpeechLines(1));
""", """      const items = buildNaxosKsbCourse(categories, registry, evidenceRules);
      if (!items.length) throw new Error('The Naxos KSB pack contains no course structure.');
      applyImportedCourse(items, cleanText(pack?.qualification?.title));
      closeScanner(false);
    }

    function applyImportedCourse(items, title = '') {
      courseItems = items.slice(0, 5);
      activeCourseTitle = cleanText(title);
      saveCourse(courseItems, activeCourseTitle);
      renderCourseTitle();
      closeEvidence();
      resetPills();
      screen.classList.add('active', 'pills-ready');
      setSpeech(menuSpeechLines(1));
""", 'Naxos pack course title import')

replace_once("""    resetPills();
    applyLook();
    speak(homeSpeechLines());
""", """    resetPills();
    renderCourseTitle();
    applyLook();
    speak(homeSpeechLines());
""", 'initial course title render')

required = [
    "let activeCourseTitle = loadSavedCourseTitle();",
    "cleanText(pack?.qualification?.title)",
    "const speechPromise = speak(menuSpeechLines(targetLevel));",
    "const speechPromise = speak(menuSpeechLines(1));",
    "Great — here are your best evidence options.",
    "I'd recommend ${recommendation}.",
    "class=\"course-title\" id=\"courseTitle\""
]
for marker in required:
    if marker not in s:
        raise SystemExit(f'missing required approved change: {marker}')

for marker in [
    "width 240ms ease",
    "height 240ms ease",
    "opacity 520ms ease 360ms",
    "transform 820ms cubic-bezier(0.22, 1, 0.36, 1) 360ms"
]:
    if marker in s:
        raise SystemExit(f'old behaviour remains: {marker}')

for preserved in [
    'function renderEvidenceChoices(',
    'function renderEvidenceRequirements(',
    'function openChat(',
    'function downloadPortfolioZip(',
    'function buildNaxosKsbCourse(',
    'requirementsHeading',
    'naxosPreferredOption(profile)',
    'naxosAlternativeOption(profile)'
]:
    if preserved not in s:
        raise SystemExit(f'unexpected missing preserved code: {preserved}')

p.write_text(s)
