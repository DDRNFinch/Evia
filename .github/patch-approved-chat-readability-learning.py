from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')


def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f'{label} marker not found')
    text = text.replace(old, new, 1)


def replace_between(start, end, new_block, label):
    global text
    s = text.find(start)
    if s < 0:
        raise SystemExit(f'{label} start marker not found')
    e = text.find(end, s)
    if e < 0:
        raise SystemExit(f'{label} end marker not found')
    text = text[:s] + new_block + text[e:]

# Readability, concise interactive text, check-in badge, and home greeting fade.
css_marker = "    @keyframes talkingFloat {"
css_block = r'''    /* approved readability + concise chat pills */
    .evia-speech { transition: top 1100ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease; }
    .evia-speech.home-exit { opacity: 0; }
    .pill { min-height: 52px; height: auto; padding-top: 9px; padding-bottom: 9px; font-size: 13px; }
    .pill-label { white-space: normal; line-height: 1.25; overflow-wrap: anywhere; }
    .chat-option { min-height: 42px; height: auto; padding: 8px 10px; font-size: 12.5px; line-height: 1.25; white-space: normal; overflow-wrap: anywhere; position: relative; }
    .chat-option-checkin-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border: 2px solid #fff;
      border-radius: 999px;
      background: #d93025;
      color: #fff !important;
      display: grid;
      place-items: center;
      font-size: 10px;
      line-height: 1;
      font-weight: 800;
    }
    #screen,
    #screen button,
    #screen input,
    #screen textarea,
    #screen a,
    #screen p,
    #screen span,
    #screen strong,
    #screen label,
    #screen div { color: #333; }
    #screen .detail-muted,
    #screen .profile-note,
    #screen .profile-status,
    #screen .portfolio-status,
    #screen .portfolio-viewer-meta,
    #screen .evidence-gallery-meta,
    #screen .mapping-status { color: #505050; }
    #screen .pill-progress-tick,
    #screen .criterion-progress-tick,
    #screen .chat-notification-badge,
    #screen .chat-option-checkin-badge { color: #fff; }
    .unit-progress.complete::after { color: #fff; }

'''
if css_block.strip() not in text:
    replace_once(css_marker, css_block + css_marker, 'CSS')

# The home greeting should visibly leave before the active menu appears.
replace_once(
    "    async function activateHome() {\n      screen.classList.add('active');",
    "    async function activateHome() {\n      eviaSpeech.classList.add('home-exit');\n      await wait(220);\n      eviaSpeech.innerHTML = '';\n      eviaSpeech.classList.remove('home-exit');\n      screen.classList.add('active');",
    'activateHome'
)

# Mirror the Monday due badge on the actual Check-in option.
replace_once(
    "        button.textContent = option.label;\n        chatOptions.appendChild(button);",
    "        button.textContent = option.label;\n        if (option.action === 'check-in' && weeklyCheckInIsDue()) {\n          const dueBadge = document.createElement('span');\n          dueBadge.className = 'chat-option-checkin-badge';\n          dueBadge.textContent = '1';\n          dueBadge.setAttribute('aria-hidden', 'true');\n          button.appendChild(dueBadge);\n          button.setAttribute('aria-label', `${option.label}. Weekly check-in due.`);\n        }\n        chatOptions.appendChild(button);",
    'renderChatOptions'
)

# Natural fixed chat language.
replacements = [
    ("await chatSay(name ? `Hi ${name}, what's up?` : \"Hi, what's up?\", mainChatOptions());", "await chatSay(name ? `Hi ${name}. What can I help with?` : 'Hi. What can I help with?', mainChatOptions());", 'chat greeting'),
    ("await chatSay(\"How's your day going?\", [", "await chatSay(\"How's today going?\", [", 'check-in day'),
    ("await chatSay('Want to speak to someone?', [", "await chatSay('Want to talk to someone?', [", 'support prompt'),
    ("await chatSay('How are you feeling right now?', [", "await chatSay('How are you feeling?', [", 'feeling prompt'),
    ("await chatSay(`How confident do you feel with ${area}?`, [", "await chatSay(`How confident are you with ${area}?`, [", 'confidence prompt'),
    ("await chatSay(name ? `Thanks ${name}. That's your quick check-in done.` : \"Thanks. That's your quick check-in done.\", mainChatOptions());", "await chatSay(name ? `Thanks ${name}. Check-in done.` : 'Thanks. Check-in done.', mainChatOptions());", 'check-in complete'),
    ("await chatSay('What do you want to learn about?', teachingOptions(teachState.items, 1));", "await chatSay('What do you want to go over?', teachingOptions(teachState.items, 1));", 'teach start'),
    ("const prompt = teachState.path.length === 1 ? 'Which part of that area?' : 'Which topic?';", "const prompt = teachState.path.length === 1 ? 'Which part?' : 'Which topic?';", 'teach prompt'),
    ("await chatSay('What do you want me to test you on?', [", "await chatSay('What should I test you on?', [", 'test start'),
    ("await chatSay(`You got ${testState.score} out of ${bank.length}.`, [", "await chatSay(`${testState.score}/${bank.length}. Want another go?`, [", 'test result'),
    ("await chatSay(correct ? 'Correct.' : `Not quite. The answer is ${question.a[question.correct]}.`);", "await chatSay(correct ? \"Yep — that's right.\" : `Not quite — it's ${question.a[question.correct]}.`);", 'test feedback'),
    ("await chatSay('What would you like to do?', mainChatOptions());", "await chatSay('What do you want to do?', mainChatOptions());", 'chat home')
]
for old, new, label in replacements:
    replace_once(old, new, label)

# Shorter Test Me / EPA copy so answer pills remain compact on phones.
replace_between(
    "    const quickTestBanks = {",
    "    async function startTestMe() {",
    r'''    const quickTestBanks = {
      maths: [
        { q: '4.8 m is how many mm?', a: ['480 mm', '4,800 mm', '48,000 mm', '0.48 mm'], correct: 1 },
        { q: 'What is 25% of 240?', a: ['40', '50', '60', '80'], correct: 2 },
        { q: 'Area of 3.5 m × 2 m?', a: ['5.5 m²', '7 m²', '11 m²', '14 m²'], correct: 1 }
      ],
      english: [
        { q: 'Which is punctuated correctly?', a: ['please check the drawing.', 'Please check the drawing.', 'Please check the drawing', 'please Check the drawing.'], correct: 1 },
        { q: 'What is an instruction text for?', a: ['To entertain', 'To explain how', 'To advertise', 'To describe someone'], correct: 1 },
        { q: 'Best formal work message?', a: ['Send it now.', 'Can u send it?', 'Please send the updated drawing.', 'Need it ASAP lol'], correct: 2 }
      ],
      trade: [
        { q: 'Damaged power tool: first action?', a: ['Use carefully', 'Tape it up', 'Stop and report it', 'Pass it on'], correct: 2 },
        { q: 'At 1:50, 1 cm represents?', a: ['5 cm', '50 cm', '5 m', '50 m'], correct: 1 },
        { q: 'Unfamiliar task: first step?', a: ['Start and adapt', 'Check method & risks', 'Wait', 'Skip checks'], correct: 1 }
      ],
      epa: [
        { q: 'What makes an EPA answer stronger?', a: ['One-word reply', 'What you did + why', 'Guessing', 'Changing subject'], correct: 1 },
        { q: 'Best way to explain quality?', a: ["I know it's right", 'Someone checks', 'Checks + standards', 'I work quickly'], correct: 2 },
        { q: 'Unsure about a safety rule in EPA?', a: ['Carry on', 'Make it up', "Explain how you'd check", 'Ignore it'], correct: 2 }
      ]
    };

''',
    'quick test banks'
)

# Quick Review: more natural and offer a direct route to the weakest area.
replace_between(
    "    async function runQuickReview() {",
    "    function randomCourseAreas",
    r'''    async function runQuickReview() {
      const leaves = courseLeaves();
      if (!leaves.length) {
        await chatSay('I need your Naxos course first. Once it is loaded, I can review your progress.', mainChatOptions());
        return;
      }

      const coveredLeaves = leaves.filter((leaf) => completedEvidencePaths.has(evidencePathKey(leaf.path)));
      const coverage = leaves.length ? Math.round((coveredLeaves.length / leaves.length) * 100) : 0;
      const elapsed = courseProgressPercent();
      let paceMessage = `You have completed ${coveredLeaves.length} of ${leaves.length} evidence areas (${coverage}%).`;

      if (elapsed !== null) {
        const elapsedRounded = Math.round(elapsed);
        const targetCount = Math.ceil((elapsed / 100) * leaves.length);
        const catchUp = Math.max(0, targetCount - coveredLeaves.length);
        if (coverage + 5 >= elapsedRounded) {
          paceMessage += ` You're about ${elapsedRounded}% through the course, so you're on track.`;
        } else {
          paceMessage += ` You're about ${elapsedRounded}% through the course, so there are a few areas to catch up.`;
          if (catchUp) paceMessage += ` Around ${catchUp} more evidence area${catchUp === 1 ? '' : 's'} would bring you closer to target.`;
        }
      } else {
        paceMessage += ' Add your course dates and I can compare this with where you should be.';
      }
      await chatSay(paceMessage);

      const areaStats = courseItems.map((area, index) => {
        const areaLeaves = courseLeaves([area]);
        const covered = areaLeaves.filter((leaf) => completedEvidencePaths.has(evidencePathKey(leaf.path))).length;
        return { label: area.label, index, total: areaLeaves.length, covered, rate: areaLeaves.length ? covered / areaLeaves.length : 0 };
      }).filter((area) => area.total);
      areaStats.sort((a, b) => b.rate - a.rate);
      const strongest = areaStats[0];
      const weakest = areaStats[areaStats.length - 1];

      if (!strongest || !weakest) {
        await chatSay('Keep adding evidence and I’ll be able to show you where to focus next.', mainChatOptions());
        return;
      }

      if (strongest.rate > 0 && strongest.label !== weakest.label) {
        await chatSay(`${strongest.label} is looking strongest right now.`);
      }

      if (weakest.rate < 1) {
        await chatSay(`${weakest.label} needs the most attention. Want me to take you there?`, [
          { label: 'Go there', action: 'review-area', value: weakest.label },
          { label: 'Not now', action: 'chat-home' }
        ]);
      } else {
        await chatSay('Everything currently mapped has evidence. Nice work.', mainChatOptions());
      }
    }

    async function openQuickReviewArea(label) {
      const index = courseItems.findIndex((item) => item.label === label);
      if (index < 0) {
        await chatSay('I could not open that area. Try it from My Course.', mainChatOptions());
        return;
      }
      closeChat();
      stopTalking(false);
      closeEvidence();
      resetPills();
      pillTransitionBusy = false;
      menuPath = [];
      menuLevel = 1;
      currentItems = courseItems;
      screen.classList.add('active');
      screen.classList.remove('completion-open', 'evidence-open', 'evidence-ready');
      renderPills(false);
      screen.classList.add('pills-ready');
      updateBackButton();
      await wait(80);
      const pill = pillStack.querySelector(`.pill[data-index="${index}"]`);
      if (pill) openNextPillSet(pill);
    }

''',
    'quick review'
)

replace_once(
    "      if (action === 'quick-review') { await runQuickReview(); return; }\n      if (action === 'check-in') { await startCheckIn(); return; }",
    "      if (action === 'quick-review') { await runQuickReview(); return; }\n      if (action === 'review-area') { await openQuickReviewArea(value); return; }\n      if (action === 'check-in') { await startCheckIn(); return; }",
    'quick review action'
)

# Standardise NVQ course-hour metadata to the same learning.requiredHours contract used by Standards.
replace_between(
    "    function buildNvqCourseMeta(pack,items,categories,requiredTargets) {",
    "    async function importNaxosNvqPack(pointer) {",
    r'''    function buildNvqCourseMeta(pack,items,categories,requiredTargets) {
      const qualification=pack?.qualification||{}, units=(pack?.route?.activeUnits||[]).map(String), unitTitles={};
      (qualification.optionalUnits||[]).forEach(unit=>{if(cleanText(unit?.id)&&cleanText(unit?.title))unitTitles[String(unit.id)]=cleanText(unit.title)});
      if(pack?.route?.optionalUnit&&pack?.route?.title)unitTitles[String(pack.route.optionalUnit)]=cleanText(pack.route.title);
      if(qualification.unitTitles&&typeof qualification.unitTitles==='object')Object.assign(unitTitles,qualification.unitTitles);
      const atomsByParent=new Map();
      flatNvqTasks(categories).forEach(({task})=>uniqueStrings([...(task.directLo7Targets||[]),...(task.mappedAtomicTargets||[])]).forEach(atom=>{const parent=nvqParentAc(atom);if(!atomsByParent.has(parent))atomsByParent.set(parent,new Set());atomsByParent.get(parent).add(atom)}));
      const wordingSource=pack.criteriaWording||qualification.criteriaWording||{};
      const criteria=[...atomsByParent.entries()].map(([id,atoms])=>({id,wording:cleanText(wordingSource[id]),atoms:[...atoms].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))})).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
      const suppliedLearning=pack?.learning||qualification?.learning||{};
      const glh=Number(suppliedLearning.requiredHours||qualification.glh||0)||null;
      const learning={type:cleanText(suppliedLearning.type)||'GLH',requiredHours:glh};
      return { courseType:'nvq', qualificationId:cleanText(qualification.id), title:cleanText(qualification.title), source:cleanText(qualification.source), learning, learningRequiredHours:glh, glh, tqt:Number(qualification.tqt||0)||null, units, unitTitles, criteria, mappings:mappedPathsFromCourse(items,'acTargets'), atomicTargetCount:requiredTargets.length, qualification:{id:cleanText(qualification.id),title:cleanText(qualification.title),glh,tqt:Number(qualification.tqt||0)||null} };
    }

''',
    'NVQ course metadata'
)

required = [
    'chat-option-checkin-badge',
    "option.action === 'check-in' && weeklyCheckInIsDue()",
    'async function openQuickReviewArea(label)',
    "action === 'review-area'",
    'What makes an EPA answer stronger?',
    "eviaSpeech.classList.add('home-exit')",
    "const learning={type:cleanText(suppliedLearning.type)||'GLH',requiredHours:glh};",
    '#screen button',
]
for marker in required:
    if marker not in text:
        raise SystemExit(f'missing required marker: {marker}')

path.write_text(text, encoding='utf-8')
print('approved Evia patch applied')
