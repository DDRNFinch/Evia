from pathlib import Path
import re

index_path = Path('index.html')
feature_path = Path('evia-approved-features.js')
text = index_path.read_text(encoding='utf-8')
feature = feature_path.read_text(encoding='utf-8')


def sub_once(source, pattern, replacement, label, flags=re.S):
    updated, count = re.subn(pattern, replacement, source, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 replacement, got {count}')
    return updated

# Guarantee every Evia chat choice surface renders exactly four choices. More than four paginates;
# fewer than four receives useful existing Evia navigation choices rather than fake content.
text = sub_once(
    text,
    r"    function renderChatOptions\(options = \[\]\) \{\n      chatOptions\.innerHTML = '';\n      options\.forEach\(\(option\) => \{",
    """    let chatOptionOverflow = [];

    function prepareChatOptions(options = []) {
      const list = Array.isArray(options) ? options.filter(Boolean).map((option) => ({ ...option })) : [];
      if (!list.length) return [];
      if (list.length > 4) {
        chatOptionOverflow = list.slice(3);
        return [...list.slice(0, 3), { label: 'More', action: 'chat-more-options' }];
      }
      chatOptionOverflow = [];
      const usedActions = new Set(list.map((option) => option.action));
      const usedLabels = new Set(list.map((option) => option.label));
      const fallbacks = [
        { label: 'Quick Review', action: 'quick-review' },
        { label: 'Teach Me', action: 'teach-me' },
        { label: 'Test Me', action: 'test-me' },
        { label: 'Main menu', action: 'chat-home' }
      ];
      for (const fallback of fallbacks) {
        if (list.length >= 4) break;
        if (usedActions.has(fallback.action) || usedLabels.has(fallback.label)) continue;
        list.push(fallback);
        usedActions.add(fallback.action);
        usedLabels.add(fallback.label);
      }
      return list.slice(0, 4);
    }

    function renderChatOptions(options = []) {
      chatOptions.innerHTML = '';
      const preparedOptions = prepareChatOptions(options);
      preparedOptions.forEach((option) => {""",
    'four-option chat renderer'
)

# Replace the old two-question wellbeing + broad section confidence flow with one wellbeing question
# followed by three task-specific confidence questions.
checkin_block = r"    async function startCheckIn\(\) \{.*?\n    function dialSavedNumber"
checkin_replacement = """    function shuffledConfidenceTasks(count = 3) {
      const leaves = courseLeaves().filter((leaf) => leaf?.node && Array.isArray(leaf.path) && leaf.path.length);
      const shuffle = (items) => {
        const copy = items.slice();
        for (let i = copy.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      };
      const incomplete = leaves.filter((leaf) => !completedEvidencePaths.has(evidencePathKey(leaf.path)));
      const complete = leaves.filter((leaf) => completedEvidencePaths.has(evidencePathKey(leaf.path)));
      return [...shuffle(incomplete), ...shuffle(complete)].slice(0, count).map((leaf) => ({
        label: cleanText(leaf.node?.label || leaf.path[leaf.path.length - 1]),
        path: leaf.path.slice()
      }));
    }

    async function startCheckIn() {
      checkInState = { stage: 'wellbeing', tasks: shuffledConfidenceTasks(3), taskIndex: 0, lowTasks: [] };
      await chatSay('Wellbeing check-in — how are you feeling this week?', [
        { label: 'Good', action: 'check-wellbeing', value: 'good' },
        { label: 'Mostly okay', action: 'check-wellbeing', value: 'okay' },
        { label: 'Struggling a bit', action: 'check-wellbeing', value: 'struggling' },
        { label: 'Not doing well', action: 'check-wellbeing', value: 'not-well' }
      ]);
    }

    async function askSupportChoice() {
      const assessorLabel = learnerProfile.assessorName || 'Assessor';
      await chatSay('Would you like some support before we continue?', [
        { label: assessorLabel, action: 'call-assessor' },
        { label: 'Safeguarding', action: 'call-safeguarding' },
        { label: 'Continue', action: 'support-continue' },
        { label: 'Main menu', action: 'chat-home' }
      ]);
    }

    async function askConfidenceTask() {
      if (!checkInState) return;
      const tasks = Array.isArray(checkInState.tasks) ? checkInState.tasks : [];
      if (checkInState.taskIndex >= tasks.length) {
        markWeeklyCheckInComplete();
        const name = learnerConversationName();
        const lowTask = Array.isArray(checkInState.lowTasks) ? checkInState.lowTasks[0] : null;
        if (lowTask?.path?.length) {
          const encoded = encodeURIComponent(JSON.stringify(lowTask.path));
          await chatSay(name ? `Thanks ${name}. Check-in done. ${lowTask.label} looks like the best place to focus next.` : `Check-in done. ${lowTask.label} looks like the best place to focus next.`, [
            { label: 'Go to task', action: 'check-open-task', value: encoded },
            { label: 'Teach Me', action: 'teach-me' },
            { label: 'Quick Review', action: 'quick-review' },
            { label: 'Main menu', action: 'chat-home' }
          ]);
        } else {
          await chatSay(name ? `Thanks ${name}. Check-in done.` : 'Thanks. Check-in done.', mainChatOptions());
        }
        return;
      }
      const task = tasks[checkInState.taskIndex];
      checkInState.stage = 'confidence';
      await chatSay(`How confident do you feel with this task? ${task.label}`, [
        { label: 'Not confident', action: 'check-confidence', value: 'not-confident' },
        { label: 'A little', action: 'check-confidence', value: 'a-little' },
        { label: 'Fairly confident', action: 'check-confidence', value: 'fairly-confident' },
        { label: 'Very confident', action: 'check-confidence', value: 'very-confident' }
      ]);
    }

    function dialSavedNumber"""
text = sub_once(text, checkin_block, checkin_replacement, 'check-in flow')

# Update check-in action handling while retaining the existing phone actions.
text = sub_once(
    text,
    r"      if \(action === 'check-day'\) \{.*?      if \(action === 'teach-pick'\)",
    """      if (action === 'chat-more-options') {
        const more = chatOptionOverflow.slice();
        chatOptionOverflow = [];
        await chatSay('More options', more);
        return;
      }
      if (action === 'check-wellbeing') {
        if (checkInState) checkInState.wellbeing = value;
        if (['struggling', 'not-well'].includes(value)) await askSupportChoice();
        else await askConfidenceTask();
        return;
      }
      if (action === 'support-continue' || action === 'support-no') { await askConfidenceTask(); return; }
      if (action === 'call-assessor') {
        dialSavedNumber(learnerProfile.assessorPhone, 'Add your assessor phone number in Learner Profile before using this call option.');
        return;
      }
      if (action === 'call-safeguarding') {
        dialSavedNumber(learnerProfile.safeguardingPhone, 'Add the safeguarding phone number in Learner Profile before using this call option.');
        return;
      }
      if (action === 'check-confidence') {
        if (checkInState) {
          const task = checkInState.tasks?.[checkInState.taskIndex];
          if (task && ['not-confident', 'a-little'].includes(value)) checkInState.lowTasks.push(task);
          checkInState.taskIndex += 1;
        }
        await askConfidenceTask();
        return;
      }
      if (action === 'check-open-task') {
        try {
          const path = JSON.parse(decodeURIComponent(value));
          closeChat();
          await goToEvidencePath(path);
        } catch (error) {}
        return;
      }
      if (action === 'teach-pick')""",
    'check-in action routing'
)

# Quick Review actions: four useful choices, with direct routing retained.
text = sub_once(
    text,
    r"        await chatSay\(`\$\{weakest\.label\} needs the most attention\. Want me to take you there\?`, \[\n          \{ label: 'Go there', action: 'review-area', value: weakest\.label \},\n          \{ label: 'Not now', action: 'chat-home' \}\n        \]\);",
    """        await chatSay(`${weakest.label} needs the most attention. Want me to take you there?`, [
          { label: 'Go there', action: 'review-area', value: weakest.label },
          { label: 'Teach Me', action: 'teach-me' },
          { label: 'Test Me', action: 'test-me' },
          { label: 'Not now', action: 'chat-home' }
        ]);""",
    'Quick Review four choices'
)

# Make the existing generic EPA bank genuinely applied and add occupation-specific banks.
epa_tail = r"      epa: \[\n.*?\n      \]\n    \};\n\n    async function startTestMe"
epa_replacement = """      epa: [
        { q: 'A drawing dimension conflicts with the site opening. First action?', a: ['Work to drawing', 'Work to opening', 'Stop and clarify', 'Split the difference'], correct: 2 },
        { q: 'A RAMS control no longer works on site. Best response?', a: ['Adapt quietly', 'Stop and reassess', 'Carry on slowly', 'Finish then report'], correct: 1 },
        { q: 'Finished work is just outside tolerance. Best action?', a: ['Leave if usable', 'Hide the defect', 'Report and correct', 'Wait for inspection'], correct: 2 },
        { q: 'A machine guard is damaged before use. What should you do?', a: ['Use at low speed', 'Remove the guard', 'Isolate and report', 'Ask someone else'], correct: 2 },
        { q: 'A client requests work outside the specification. First step?', a: ['Do it now', 'Get the change agreed', 'Price it later', 'Ignore the request'], correct: 1 },
        { q: 'Two checks give different measurements. What next?', a: ['Use the smaller', 'Average them', 'Recheck datum and method', 'Use drawing value'], correct: 2 }
      ]
    };

    const epaQuestionBanks = {
      bricklayer: [
        { q: 'A 6 m wall is 12 mm out of line before the next lift. First action?', a: ['Correct with joints', 'Stop and check setting-out', 'Follow datum only', 'Finish then snag'], correct: 1 },
        { q: 'Mortar has stiffened beyond its usable working time. Best action?', a: ['Add water and remix', 'Use in hidden work', 'Discard and mix fresh', 'Blend with new mortar'], correct: 2 },
        { q: 'Cavity insulation bridges the cavity at a joint. What should you do?', a: ['Leave if dry', 'Pack mortar around it', 'Correct before continuing', 'Add another wall tie'], correct: 2 },
        { q: 'Wall-tie spacing conflicts with the drawing. What should you do?', a: ['Follow drawing only', 'Use usual spacing', 'Clarify the specification', 'Use extra ties'], correct: 2 },
        { q: 'Silica dust stays high while cutting despite extraction. Next step?', a: ['Make shorter cuts', 'Stop and review controls', 'Use a wet mask', 'Move downwind'], correct: 1 },
        { q: 'A DPC is 15 mm below the specified level. Best response?', a: ['Raise the next course', 'Leave if covered', 'Stop and correct it', 'Increase bed joint'], correct: 2 }
      ],
      carpenter: [
        { q: 'A door opening is 9 mm out of square. Before fixing the lining?', a: ['Pack one hinge', 'Check datum and opening', 'Trim the door later', 'Fix the head first'], correct: 1 },
        { q: 'Structural timber has a split close to a bearing. Best action?', a: ['Turn split upward', 'Add screws', 'Quarantine and report', 'Cut the split shorter'], correct: 2 },
        { q: 'A fire-door gap is outside its specified tolerance. What next?', a: ['Adjust to specification', 'Rely on smoke seal', 'Leave if it closes', 'Record it only'], correct: 0 },
        { q: 'A cut list conflicts with the latest drawing revision. First step?', a: ['Use the cut list', 'Use the drawing', 'Confirm current revision', 'Split the difference'], correct: 2 },
        { q: 'A power-saw guard sticks intermittently. What should you do?', a: ['Lubricate and continue', 'Hold it manually', 'Isolate and report', 'Use for short cuts'], correct: 2 },
        { q: 'A joist position clashes with a service route. Best action?', a: ['Notch it to fit', 'Move the joist', 'Stop and clarify detail', 'Move the service'], correct: 2 }
      ],
      joiner: [
        { q: 'A component is 2 mm oversize after machining. Best next step?', a: ['Force assembly', 'Check tolerance and drawing', 'Sand until it fits', 'Reduce matching part'], correct: 1 },
        { q: 'Timber moisture is above the job specification. What should you do?', a: ['Machine immediately', 'Acclimatise and check', 'Seal both faces', 'Use extra adhesive'], correct: 1 },
        { q: 'A machine fence moves during a trial cut. Best action?', a: ['Hold it by hand', 'Reduce feed speed', 'Isolate and reset safely', 'Finish the batch'], correct: 2 },
        { q: 'A joint closes at the face but gaps internally. What should you do?', a: ['Add more adhesive', 'Clamp harder', 'Find and correct the cause', 'Pin through the joint'], correct: 2 },
        { q: 'A revised drawing changes size after cutting starts. First step?', a: ['Use old sizes', 'Stop and verify revision', 'Modify finished pieces', 'Average dimensions'], correct: 1 },
        { q: 'A frame is square but outside overall size tolerance. Best response?', a: ['Accept because square', 'Report and correct', 'Adjust the opening', 'Plane one edge'], correct: 1 }
      ],
      property: [
        { q: 'You uncover material that may contain asbestos. First action?', a: ['Bag it', 'Wet it', 'Stop and follow procedure', 'Take a small sample'], correct: 2 },
        { q: 'A leak is reported but the source is unclear. First step?', a: ['Replace visible seal', 'Trace and diagnose source', 'Repaint damage', 'Ask them to monitor'], correct: 1 },
        { q: 'A fire door closes but its gap is outside specification. Best response?', a: ['Adjust to specification', 'Leave because it closes', 'Fit a thicker seal', 'Record it only'], correct: 0 },
        { q: 'A customer asks for extra work outside the job instruction. First step?', a: ['Do it as goodwill', 'Agree scope through procedure', 'Refuse immediately', 'Add it to invoice'], correct: 1 },
        { q: 'You isolate a circuit but the test result is unexpected. What next?', a: ['Continue carefully', 'Retest and prove isolation', 'Use insulated gloves', 'Ask the customer'], correct: 1 },
        { q: 'A defect returns after two previous repairs. Best approach?', a: ['Repeat the repair', 'Use stronger material', 'Investigate root cause', 'Close the job'], correct: 2 }
      ]
    };

    function epaCourseKey() {
      const title = cleanText(activeCourseTitle).toLowerCase();
      if (title.includes('brick')) return 'bricklayer';
      if (title.includes('architectural join')) return 'joiner';
      if (title.includes('carpenter')) return 'carpenter';
      if (title.includes('property maintenance')) return 'property';
      return 'generic';
    }

    function testBankForCategory(category) {
      if (category !== 'epa') return quickTestBanks[category] || [];
      return epaQuestionBanks[epaCourseKey()] || quickTestBanks.epa;
    }

    async function startTestMe"""
text = sub_once(text, epa_tail, epa_replacement, 'EPA question banks')
text = text.replace("const bank = quickTestBanks[testState.category] || [];", "const bank = testBankForCategory(testState.category);", 1)
text = text.replace("const bank = quickTestBanks[testState?.category] || [];", "const bank = testBankForCategory(testState?.category);", 1)
if "const bank = quickTestBanks[testState.category] || [];" in text or "const bank = quickTestBanks[testState?.category] || [];" in text:
    raise SystemExit('old test bank lookup remains')

# Give the post-teaching and post-test screens four intentional choices.
text = text.replace(
    """      await chatSay('Want to learn something else?', [
        { label: 'Teach Me', action: 'teach-me' },
        { label: 'Back to menu', action: 'chat-home' }
      ]);""",
    """      await chatSay('Want to learn something else?', [
        { label: 'Teach Me', action: 'teach-me' },
        { label: 'Quick Review', action: 'quick-review' },
        { label: 'Test Me', action: 'test-me' },
        { label: 'Main menu', action: 'chat-home' }
      ]);""",
    1
)
text = text.replace(
    """        await chatSay(`${testState.score}/${bank.length}. Want another go?`, [
          { label: 'Test Me again', action: 'test-me' },
          { label: 'Back to menu', action: 'chat-home' }
        ]);""",
    """        await chatSay(`${testState.score}/${bank.length}. Want another go?`, [
          { label: 'Test Me again', action: 'test-me' },
          { label: 'Quick Review', action: 'quick-review' },
          { label: 'Teach Me', action: 'teach-me' },
          { label: 'Main menu', action: 'chat-home' }
        ]);""",
    1
)

# Feature layer: confidence now belongs to evidence tasks, not top-level course areas.
feature = sub_once(
    feature,
    r"  function epaConfidenceValue\(label\) \{.*?\n  function currentCourseCoverage",
    """  function epaConfidenceValue(label) {
    const values = {
      'not-confident': 20,
      'a-little': 45,
      'fairly-confident': 75,
      'very-confident': 100,
      confident: 100,
      'getting-there': 65,
      'need-help': 30
    };
    return values[label] ?? null;
  }

  function confidenceTaskKey(task) {
    if (task && typeof task === 'object') {
      if (Array.isArray(task.path) && task.path.length) return task.path.map((part) => String(part || '').trim()).join(' › ');
      return String(task.label || '').trim();
    }
    return String(task || '').trim();
  }

  function storeAreaConfidence(task, answer) {
    const key = confidenceTaskKey(task);
    const value = epaConfidenceValue(answer);
    if (!key || value === null) return;
    const state = readConfidence();
    state[key] = { value, answer, updatedAt: new Date().toISOString() };
    saveConfidence(state);
  }

  function currentConfidenceSummary() {
    const state = readConfidence();
    const validTasks = new Set();
    try {
      courseLeaves().forEach((leaf) => {
        const key = confidenceTaskKey({ path: leaf?.path, label: leaf?.node?.label });
        if (key) validTasks.add(key);
      });
    } catch (error) {}
    const values = Object.entries(state)
      .filter(([task, item]) => validTasks.has(task) && Number.isFinite(Number(item?.value)))
      .map(([, item]) => Number(item.value));
    if (!values.length) return { percent: null, recorded: 0, total: validTasks.size };
    return {
      percent: values.reduce((sum, value) => sum + value, 0) / values.length,
      recorded: values.length,
      total: validTasks.size
    };
  }

  function currentCourseCoverage""",
    'feature confidence storage'
)
feature = feature.replace("confidence${model.confidenceTotal ? ` · ${model.confidenceRecorded}/${model.confidenceTotal} areas` : ''}", "confidence${model.confidenceTotal ? ` · ${model.confidenceRecorded}/${model.confidenceTotal} tasks` : ''}", 1)

# Feature layer wrapper stores the current specific task before the base handler advances it.
feature = sub_once(
    feature,
    r"      if \(action === 'check-confidence' && checkInState\) \{\n        const area = checkInState\.areas\?\.\[checkInState\.areaIndex\];\n        storeAreaConfidence\(area, value\);\n      \}",
    """      if (action === 'check-confidence' && checkInState) {
        const task = checkInState.tasks?.[checkInState.taskIndex] || checkInState.areas?.[checkInState.areaIndex];
        storeAreaConfidence(task, value);
      }""",
    'feature confidence handler'
)

# Feature layer EPA completion must follow the course-specific EPA bank and retain four choices.
feature = feature.replace("const bank = quickTestBanks[testState?.category] || [];", "const bank = typeof testBankForCategory === 'function' ? testBankForCategory(testState?.category) : (quickTestBanks[testState?.category] || []);", 1)
feature = feature.replace(
    """        await chatSay(`${testState.score}/${bank.length}. Your EPA readiness indicator is now ${fmtPercent(model.percent)}. Want another go?`, [
          { label: 'Test Me again', action: 'test-me' },
          { label: 'Back to menu', action: 'chat-home' }
        ]);""",
    """        await chatSay(`${testState.score}/${bank.length}. Your EPA readiness indicator is now ${fmtPercent(model.percent)}. Want another go?`, [
          { label: 'Test Me again', action: 'test-me' },
          { label: 'Quick Review', action: 'quick-review' },
          { label: 'Teach Me', action: 'teach-me' },
          { label: 'Main menu', action: 'chat-home' }
        ]);""",
    1
)

# Explicitly reject the superseded wording/logic.
for old in [
    "How's today going?",
    "How are you feeling?",
    "How confident are you with ${area}?",
    "What makes an EPA answer stronger?",
    "One-word reply",
    "checkInState = { stage: 'day'"
]:
    if old in text:
        raise SystemExit(f'old wording remains: {old}')

index_path.write_text(text, encoding='utf-8')
feature_path.write_text(feature, encoding='utf-8')
