from pathlib import Path
import re

p = Path('index.html')
s = p.read_text()


def sub_once(pattern, replacement, label, flags=0):
    global s
    s2, n = re.subn(pattern, replacement, s, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f'{label}: expected 1 match, found {n}')
    s = s2


sub_once(
    r'''    \.evidence-choice \{\n      width: 100%;\n      border-radius: 999px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      padding: 14px 18px;\n      color: rgba\(45, 45, 45, 0\.68\);\n      cursor: pointer;\n    \}\n\n    \.evidence-choice strong \{ font-weight: 600; \}\n''',
    '''    .evidence-choice {\n      width: 100%;\n      border-radius: 24px;\n      display: flex;\n      flex-direction: column;\n      align-items: flex-start;\n      justify-content: center;\n      gap: 4px;\n      padding: 14px 18px;\n      color: rgba(45, 45, 45, 0.68);\n      text-align: left;\n      cursor: pointer;\n      overflow-y: auto;\n    }\n\n    .evidence-choice-heading { font-size: 12px; font-weight: 600; color: rgba(45,45,45,.58); letter-spacing: .02em; }\n    .evidence-choice-detail { width: 100%; display: flex; flex-direction: column; gap: 3px; }\n    .evidence-choice-detail + .evidence-choice-detail { margin-top: 5px; padding-top: 7px; border-top: 1px solid rgba(245,196,0,.2); }\n    .evidence-choice-type { font-size: 14px; font-weight: 600; color: rgba(45,45,45,.82); }\n    .evidence-choice-label { font-size: 13px; font-weight: 600; color: rgba(45,45,45,.74); }\n    .evidence-choice-instruction { font-size: 12px; line-height: 1.38; color: rgba(45,45,45,.66); }\n''',
    'evidence choice CSS'
)

sub_once(
    r'''(    \.evidence-requirements h2 \{\n      font-size: 14px;\n      font-weight: 600;\n      margin-bottom: 10px;\n      color: rgba\(45, 45, 45, 0\.82\);\n    \}\n)''',
    r'''\1\n    .evidence-requirements ul { margin: 0; padding-left: 19px; display: flex; flex-direction: column; gap: 7px; }\n    .evidence-requirements li { padding-left: 2px; font-size: 13px; line-height: 1.38; }\n''',
    'requirements list CSS'
)

if s.count('<h2>Evidence Requirements</h2>') != 1:
    raise SystemExit('requirements heading HTML not found once')
s = s.replace('<h2>Evidence Requirements</h2>', '<h2 id="requirementsHeading">Evidence Requirements</h2>', 1)

old = "    const evidenceRequirements = document.getElementById('evidenceRequirements');\n    const requirementsText = document.getElementById('requirementsText');"
new = "    const evidenceRequirements = document.getElementById('evidenceRequirements');\n    const requirementsHeading = document.getElementById('requirementsHeading');\n    const requirementsText = document.getElementById('requirementsText');"
if s.count(old) != 1:
    raise SystemExit('requirements DOM bindings not found once')
s = s.replace(old, new, 1)

sub_once(
    r'''    function normaliseEvidenceOption\(option, fallbackLabel\) \{.*?\n    \}\n\n(?=    function normaliseNode)''',
    '''    function evidenceTypeDisplayLabel(value) {\n      const raw = cleanText(value).toLowerCase();\n      const labels = {\n        video: 'Video', photos: 'Photos', photo: 'Photo', camera: 'Camera',\n        audio: 'Audio', microphone: 'Audio', voice: 'Audio', reflection: 'Reflection',\n        text: 'Written', written: 'Written', writing: 'Written', document: 'Document',\n        witness: 'Witness statement', observation: 'Assessor observation'\n      };\n      return labels[raw] || cleanText(value);\n    }\n\n    function normaliseEvidenceDetail(item) {\n      if (!item) return null;\n      if (typeof item === 'string') return { displayType: '', label: cleanText(item), instruction: '' };\n      if (typeof item !== 'object') return null;\n      const rawType = cleanText(item.type || item.method || item.evidenceType);\n      return {\n        displayType: cleanText(item.displayType || item.typeLabel) || evidenceTypeDisplayLabel(rawType),\n        label: cleanText(item.label || item.name || item.title),\n        instruction: cleanText(item.instruction || item.description || item.guidance || item.text)\n      };\n    }\n\n    function normaliseEvidenceOption(option, fallbackLabel) {\n      if (!option) return null;\n      if (typeof option === 'string') return { label: option.trim() || fallbackLabel, type: 'text', displayType: '', instruction: '', details: [] };\n      if (typeof option !== 'object') return null;\n      const label = cleanText(option.label || option.name || option.title) || fallbackLabel;\n      const rawType = cleanText(option.type || option.method || option.evidenceType).toLowerCase();\n      let type = 'text';\n      if (['camera', 'video', 'photo', 'photos'].includes(rawType)) type = 'camera';\n      if (['audio', 'microphone', 'voice', 'reflection'].includes(rawType)) type = 'audio';\n      if (['text', 'written', 'writing'].includes(rawType)) type = 'text';\n      const details = Array.isArray(option.details) ? option.details.map(normaliseEvidenceDetail).filter(Boolean) : [];\n      return {\n        label,\n        type,\n        displayType: cleanText(option.displayType || option.typeLabel) || evidenceTypeDisplayLabel(rawType),\n        instruction: cleanText(option.instruction || option.description || option.guidance || option.text),\n        details\n      };\n    }\n\n''',
    'evidence normaliser',
    re.S
)

sub_once(
    r'''        normalised\.recommended = normaliseEvidenceOption\(node\.recommended \|\| node\.recommendedEvidence, 'Recommended'\);\n        normalised\.alternative = normaliseEvidenceOption\(node\.alternative \|\| node\.alternativeEvidence, 'Alternative'\);\n        normalised\.requirements = cleanText\(node\.requirements \|\| node\.evidenceRequirements \|\| node\.evidence \|\| node\.guidance\);\n''',
    '''        const recommendedSource = node.recommended || node.recommendedEvidence || (Array.isArray(node.preferred) ? {\n          label: node.preferred.map((item) => cleanText(item?.label || item?.type)).filter(Boolean).join(' + '),\n          type: node.preferred[0]?.type, details: node.preferred\n        } : null);\n        const alternativeSource = node.alternative || node.alternativeEvidence || (Array.isArray(node.alternatives) && node.alternatives.length ? {\n          label: cleanText(node.alternatives[0]?.label) || 'Alternative',\n          type: node.alternatives[0]?.type, details: node.alternatives\n        } : null);\n        normalised.recommended = normaliseEvidenceOption(recommendedSource, 'Recommended');\n        normalised.alternative = normaliseEvidenceOption(alternativeSource, 'Alternative');\n\n        const requirementObject = node.evidenceRequirements && typeof node.evidenceRequirements === 'object' && !Array.isArray(node.evidenceRequirements) ? node.evidenceRequirements : null;\n        const rawRequirementItems = node.requirementItems || node.requirementsItems || node.capture || requirementObject?.items || requirementObject?.bullets || (Array.isArray(node.evidenceRequirements) ? node.evidenceRequirements : []);\n        const requirementItems = Array.isArray(rawRequirementItems) ? rawRequirementItems.map(cleanText).filter(Boolean) : [];\n        const requirementText = cleanText(node.requirements || (typeof node.evidenceRequirements === 'string' ? node.evidenceRequirements : '') || node.evidence || node.guidance);\n        normalised.requirementsHeading = cleanText(node.requirementsHeading || requirementObject?.heading || requirementObject?.title);\n        normalised.requirementItems = requirementItems;\n        normalised.requirements = requirementItems.length ? requirementItems.join('\\n') : requirementText;\n''',
    'node evidence fields'
)

sub_once(
    r'''    function renderEvidenceChoices\(animateIn = false\) \{.*?\n    \}\n\n(?=    async function revealEvidenceOptions)''',
    '''    function appendEvidenceChoiceContent(button, heading, option) {\n      const headingElement = document.createElement('div');\n      headingElement.className = 'evidence-choice-heading';\n      headingElement.textContent = heading;\n      button.appendChild(headingElement);\n      const details = Array.isArray(option?.details) && option.details.length\n        ? option.details\n        : [{ displayType: option?.displayType || '', label: option?.label || '', instruction: option?.instruction || '' }];\n      details.forEach((detail) => {\n        const cleanDetail = normaliseEvidenceDetail(detail);\n        if (!cleanDetail) return;\n        const wrap = document.createElement('div');\n        wrap.className = 'evidence-choice-detail';\n        if (cleanDetail.displayType) {\n          const el = document.createElement('div'); el.className = 'evidence-choice-type'; el.textContent = cleanDetail.displayType; wrap.appendChild(el);\n        }\n        if (cleanDetail.label) {\n          const el = document.createElement('div'); el.className = 'evidence-choice-label'; el.textContent = cleanDetail.label; wrap.appendChild(el);\n        }\n        if (cleanDetail.instruction) {\n          const el = document.createElement('div'); el.className = 'evidence-choice-instruction'; el.textContent = cleanDetail.instruction; wrap.appendChild(el);\n        }\n        button.appendChild(wrap);\n      });\n    }\n\n    function renderEvidenceChoices(animateIn = false) {\n      stopCapture();\n      captureMode = null;\n      activeEvidenceMethod = null;\n      evidenceTop.innerHTML = '';\n      const choices = [\n        ['Recommended', activeEvidence?.recommended],\n        ['Alternative', activeEvidence?.alternative]\n      ].filter(([, option]) => option && (cleanText(option.label) || (Array.isArray(option.details) && option.details.length)));\n      choices.forEach(([heading, option]) => {\n        const button = document.createElement('button');\n        button.type = 'button';\n        button.className = `evidence-choice${animateIn ? ' evidence-enter' : ''}`;\n        button.dataset.evidenceType = option.type || 'text';\n        button.dataset.evidenceHeading = heading;\n        button.dataset.evidenceLabel = option.label || heading;\n        appendEvidenceChoiceContent(button, heading, option);\n        evidenceTop.appendChild(button);\n      });\n      evidenceTop.style.gridTemplateRows = choices.length === 1 ? '1fr' : '1fr 1fr';\n      if (!animateIn) evidenceRequirements.classList.remove('evidence-enter', 'reveal-step');\n      updateBackButton();\n      return [...evidenceTop.querySelectorAll('.evidence-choice')];\n    }\n\n''',
    'evidence card renderer',
    re.S
)

sub_once(
    r'''    async function openEvidence\(node\) \{.*?\n    \}\n\n(?=    function closeEvidence)''',
    '''    function renderEvidenceRequirements(node) {\n      const items = Array.isArray(node?.requirementItems) ? node.requirementItems.map(cleanText).filter(Boolean) : [];\n      const text = cleanText(node?.requirements);\n      const hasRequirements = items.length > 0 || Boolean(text);\n      requirementsHeading.textContent = cleanText(node?.requirementsHeading) || (items.length ? 'What the evidence must show or explain' : 'Evidence Requirements');\n      requirementsText.innerHTML = '';\n      if (items.length) {\n        const list = document.createElement('ul');\n        items.forEach((item) => { const li = document.createElement('li'); li.textContent = item; list.appendChild(li); });\n        requirementsText.appendChild(list);\n      } else if (text) {\n        requirementsText.textContent = text;\n      }\n      return hasRequirements;\n    }\n\n    async function openEvidence(node) {\n      activeEvidence = node;\n      screen.classList.remove('pills-ready', 'evidence-ready');\n      screen.classList.add('evidence-open');\n      evidenceTop.innerHTML = '';\n      const hasRequirements = renderEvidenceRequirements(node);\n      evidenceRequirements.style.display = hasRequirements ? 'block' : 'none';\n      evidenceRequirements.classList.remove('reveal-step');\n      evidenceScreen.style.gridTemplateRows = hasRequirements ? '1fr 1fr' : '1fr';\n      updateBackButton();\n      const evidenceAtStart = activeEvidence;\n      const finished = await speak(evidenceSpeechLines());\n      if (!finished || activeEvidence !== evidenceAtStart || !screen.classList.contains('evidence-open')) return;\n      await revealEvidenceOptions();\n    }\n\n''',
    'requirements renderer',
    re.S
)

sub_once(
    r'''    function naxosPreferredOption\(profile\) \{.*?\n    \}\n\n    function naxosAlternativeOption\(profile\) \{.*?\n    \}\n\n    function naxosTaskRequirements\(task, registry, profile\) \{.*?\n    \}\n\n(?=    function buildNaxosKsbCourse)''',
    '''    function naxosPreferredOption(profile) {\n      const preferred = Array.isArray(profile?.preferred) ? profile.preferred : [];\n      if (!preferred.length) return { label: 'Written evidence', type: 'text', details: [] };\n      const details = preferred.map((item) => ({\n        displayType: evidenceTypeDisplayLabel(item?.type),\n        label: cleanText(item?.label),\n        instruction: cleanText(item?.instruction)\n      }));\n      const label = preferred.map((item) => cleanText(item?.label || item?.type)).filter(Boolean).join(' + ') || 'Recommended evidence';\n      const typeSource = preferred.map((item) => `${item?.type || ''} ${item?.label || ''} ${item?.instruction || ''}`).join(' ');\n      return { label, type: naxosCaptureType(typeSource), details };\n    }\n\n    function naxosAlternativeOption(profile) {\n      const alternative = Array.isArray(profile?.alternatives) ? profile.alternatives[0] : null;\n      if (!alternative) return null;\n      const label = cleanText(alternative.label) || 'Alternative evidence';\n      return {\n        label,\n        type: naxosCaptureType(`${label} ${alternative.instruction || ''}`),\n        details: [{ displayType: evidenceTypeDisplayLabel(alternative.type), label, instruction: cleanText(alternative.instruction) }]\n      };\n    }\n\n    function naxosTaskRequirements(task, registry, profile) {\n      const items = Array.isArray(profile?.capture) ? profile.capture.map(cleanText).filter(Boolean) : [];\n      const prompt = cleanText(task?.conditionalPrompt);\n      if (prompt) items.push(prompt);\n      return items;\n    }\n\n''',
    'Naxos evidence data',
    re.S
)

sub_once(
    r'''            return \{\n              label: cleanText\(task\?\.title\) \|\| cleanText\(task\?\.id\) \|\| 'Task',\n              recommended: naxosPreferredOption\(profile\),\n              alternative: naxosAlternativeOption\(profile\),\n              requirements: naxosTaskRequirements\(task, registry, profile\)\n            \};''',
    '''            const requirementItems = naxosTaskRequirements(task, registry, profile);\n            return {\n              label: cleanText(task?.title) || cleanText(task?.id) || 'Task',\n              recommended: naxosPreferredOption(profile),\n              alternative: naxosAlternativeOption(profile),\n              requirementsHeading: 'What the evidence must show or explain',\n              requirementItems,\n              requirements: requirementItems.join('\\n')\n            };''',
    'Naxos course task build'
)

for banned in ['Evidence must show or explain: ${capture.join', 'KSBs this task can support:']:
    if banned in s:
        raise SystemExit(f'old combined evidence requirement formatting remains: {banned}')
for required in [
    "requirementsHeading: 'What the evidence must show or explain'",
    "instruction: cleanText(item?.instruction)",
    "className = 'evidence-choice-instruction'",
    "const requirementItems = naxosTaskRequirements(task, registry, profile);"
]:
    if required not in s:
        raise SystemExit(f'missing expected update: {required}')

p.write_text(s)
