from pathlib import Path
import re

p = Path('index.html')
s = p.read_text()

def replace_once(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        raise SystemExit(f'{label}: expected 1 match, found {n}')
    s = s.replace(old, new, 1)

# 1) Evidence choice cards: all Naxos text must fit without internal scrolling.
replace_once("""    .evidence-top {
      min-height: 0;
      display: grid;
      grid-template-rows: 1fr 1fr;
      gap: 10px;
    }
""", """    .evidence-top {
      min-height: 0;
      display: grid;
      grid-template-rows: auto auto;
      align-content: start;
      gap: 10px;
    }
""", 'evidence top auto rows')

replace_once("""      text-align: left;
      cursor: pointer;
      overflow-y: auto;
    }
""", """      text-align: left;
      cursor: pointer;
      overflow: visible;
      flex: 0 0 auto;
    }
""", 'remove evidence card scrolling')

replace_once("""      evidenceTop.style.gridTemplateRows = choices.length === 1 ? '1fr' : '1fr 1fr';
""", """      evidenceTop.style.gridTemplateRows = choices.length === 1 ? 'auto' : 'auto auto';
""", 'choice rows fit content')

replace_once("""      evidenceScreen.style.gridTemplateRows = hasRequirements ? '1fr 1fr' : '1fr';
""", """      evidenceScreen.style.gridTemplateRows = hasRequirements ? 'auto minmax(0, 1fr)' : 'auto';
""", 'choice screen fits full card text')

# 2) Route each explicit Naxos evidence method to the correct capture surface,
# including additive phrases such as photos plus audio.
old_router = """    function captureKindFromDetail(detail, fallbackType = 'text') {
      const text = `${detail?.displayType || ''} ${detail?.label || ''} ${detail?.instruction || ''}`.toLowerCase();
      if (/\\bvideo\\b/.test(text)) return 'video';
      if (/\\bphotos?\\b|\\bcamera\\b|\\bimages?\\b/.test(text)) return 'photo';
      if (/\\baudio\\b|\\bvoice\\b|\\bmicrophone\\b|\\breflection\\b/.test(text)) return 'audio';
      if (/\\bwritten\\b|\\bwrite\\b|\\btext\\b|\\bstatement\\b|\\btyping\\b/.test(text)) return 'text';
      if (fallbackType === 'camera') return 'photo';
      if (fallbackType === 'audio') return 'audio';
      return 'text';
    }
"""
new_router = """    function captureKindFromText(value, fallbackType = 'text') {
      const text = cleanText(value).toLowerCase();
      if (/\\bvideo\\b/.test(text)) return 'video';
      if (/\\bphotos?\\b|\\bcamera\\b|\\bimages?\\b/.test(text)) return 'photo';
      if (/\\baudio\\b|\\bvoice\\b|\\bmicrophone\\b|\\breflection\\b/.test(text)) return 'audio';
      if (/\\bwritten\\b|\\bwrite\\b|\\btext\\b|\\bstatement\\b|\\btyping\\b/.test(text)) return 'text';
      if (fallbackType === 'camera') return 'photo';
      if (fallbackType === 'audio') return 'audio';
      return fallbackType === 'video' ? 'video' : 'text';
    }

    function captureKindsFromDetail(detail, fallbackType = 'text') {
      const source = `${detail?.displayType || ''} ${detail?.label || ''} ${detail?.instruction || ''}`;
      const additiveParts = source.split(/\\b(?:plus|then|followed by)\\b/i).map((part) => part.trim()).filter(Boolean);
      const parts = additiveParts.length > 1 ? additiveParts : [source];
      const kinds = parts.map((part) => captureKindFromText(part, '')).filter(Boolean);
      return kinds.length ? kinds : [captureKindFromText(source, fallbackType)];
    }
"""
replace_once(old_router, new_router, 'evidence method routing')

replace_once("""      const direct = source.match(new RegExp(`\\\\b(\\\\d+)\\\\s*(?:x\\\\s*)?(?:${words})\\\\b`, 'i'));
""", """      const direct = source.match(new RegExp(`\\\\b(\\\\d+)\\\\s*(?:x\\\\s*)?(?:-|\\\\s)?(?:${words})\\\\b`, 'i'));
""", 'hyphenated evidence quantity')

old_plan = """      details.forEach((detail) => {
        const cleanDetail = normaliseEvidenceDetail(detail) || detail || {};
        const type = captureKindFromDetail(cleanDetail, fallback);
        const quantity = captureQuantity(cleanDetail, type);
        for (let index = 0; index < quantity; index += 1) {
          steps.push({ type, label: cleanText(cleanDetail.label) || evidenceTypeDisplayLabel(type), instruction: cleanText(cleanDetail.instruction), itemIndex: index + 1, itemTotal: quantity });
        }
      });
"""
new_plan = """      details.forEach((detail) => {
        const cleanDetail = normaliseEvidenceDetail(detail) || detail || {};
        const types = captureKindsFromDetail(cleanDetail, fallback);
        types.forEach((type) => {
          const quantity = captureQuantity(cleanDetail, type);
          for (let index = 0; index < quantity; index += 1) {
            steps.push({ type, label: cleanText(cleanDetail.label) || evidenceTypeDisplayLabel(type), instruction: cleanText(cleanDetail.instruction), itemIndex: index + 1, itemTotal: quantity });
          }
        });
      });
"""
replace_once(old_plan, new_plan, 'multi-method evidence plan')

# 3) Restore capture to the original upper evidence area with requirements below.
old_begin = """    function beginEvidenceCollection(option, heading){clearCaptureSequence();captureSessionId+=1;capturePlan=buildCapturePlan(option);captureStepIndex=0;activeEvidenceMethod={type:option?.type||'text',heading,label:option?.label||heading};evidenceRequirements.style.display='none';evidenceScreen.style.gridTemplateRows='1fr';runCaptureStep()}
"""
new_begin = """    function beginEvidenceCollection(option, heading){clearCaptureSequence();captureSessionId+=1;capturePlan=buildCapturePlan(option);captureStepIndex=0;activeEvidenceMethod={type:option?.type||'text',heading,label:option?.label||heading};const hasRequirements=renderEvidenceRequirements(activeEvidence);evidenceRequirements.style.display=hasRequirements?'block':'none';evidenceScreen.style.gridTemplateRows=hasRequirements?'1fr 1fr':'1fr';runCaptureStep()}
"""
replace_once(old_begin, new_begin, 'restore upper capture position')

# Guardrails: approved changes present, unrelated systems preserved.
required = [
    'overflow: visible;',
    "gridTemplateRows = choices.length === 1 ? 'auto' : 'auto auto'",
    'function captureKindsFromDetail(',
    "source.split(/\\b(?:plus|then|followed by)\\b/i)",
    "evidenceScreen.style.gridTemplateRows=hasRequirements?'1fr 1fr':'1fr'",
    "openPhotoCapture(step, sessionId)",
    "openVideoCapture(step, sessionId)",
    "openAudioCapture(step, sessionId)",
    "openTextCapture(step, sessionId)",
    'function renderEvidenceRequirements(',
    'function updateArchBars(',
    'function openChat(',
    'function downloadPortfolioZip('
]
for marker in required:
    if marker not in s:
        raise SystemExit(f'missing required/preserved marker: {marker}')

banned = [
    'overflow-y: auto;\n    }\n\n    .evidence-choice-heading',
    "function captureKindFromDetail(",
    "evidenceRequirements.style.display='none';evidenceScreen.style.gridTemplateRows='1fr';runCaptureStep()"
]
for marker in banned:
    if marker in s:
        raise SystemExit(f'old behaviour remains: {marker}')

p.write_text(s)
