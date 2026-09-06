from pathlib import Path
import re

INDEX=Path('index.html')
TIME=Path('evia-approved-time-monthly-packs-v1.js')
MANIFEST=Path('evia-runtime-manifest.js')
TIME_TEST=Path('tests/time-only-redesign.spec.js')

manifest=MANIFEST.read_text(encoding='utf-8')
old="  './evia-approved-witness-video-v1.js',\n  './evia-approved-time-monthly-packs-v1.js?v=8',"
new="  './evia-approved-witness-video-v1.js',\n  './evia-evidence-viewer-pack-v2.js?v=2',\n  './evia-approved-time-monthly-packs-v1.js?v=9',"
if manifest.count(old)!=1:
    raise SystemExit(f'Runtime manifest anchor expected once, got {manifest.count(old)}')
MANIFEST.write_text(manifest.replace(old,new,1),encoding='utf-8')

index=INDEX.read_text(encoding='utf-8')
direct_old='  <script src="./evia-approved-witness-video-v1.js"></script>\n  <script src="./evia-approved-time-monthly-packs-v1.js?v=5"></script>'
direct_new='  <script src="./evia-approved-witness-video-v1.js"></script>\n  <script src="./evia-evidence-viewer-pack-v2.js?v=2"></script>\n  <script src="./evia-approved-time-monthly-packs-v1.js?v=5"></script>'
if index.count(direct_old)!=1:
    raise SystemExit(f'Direct runtime anchor expected once, got {index.count(direct_old)}')
index=index.replace(direct_old,direct_new,1)

zip_anchor='        const zipBlob = await createZip(files);'
portfolio_insert="""        if (globalThis.EviaEvidencePackViewer?.buildViewerFiles) {
          try {
            const viewerFiles = await globalThis.EviaEvidencePackViewer.buildViewerFiles(entries, {
              scopeType: 'portfolio',
              scopeLabel: 'Complete portfolio',
              course: typeof activeCourseTitle !== 'undefined' ? activeCourseTitle : '',
              learner: typeof officialLearnerProfile === 'function' ? officialLearnerProfile() : {},
              learning: typeof learningEntries !== 'undefined' && Array.isArray(learningEntries) ? learningEntries : []
            });
            files.push(...viewerFiles);
          } catch (viewerError) {
            console.warn('Could not add the self-contained Evia evidence viewer to the portfolio ZIP.', viewerError);
          }
        }

        const zipBlob = await createZip(files);"""
if index.count(zip_anchor)!=1:
    raise SystemExit(f'Portfolio ZIP anchor expected once, got {index.count(zip_anchor)}')
INDEX.write_text(index.replace(zip_anchor,portfolio_insert,1),encoding='utf-8')

time=TIME.read_text(encoding='utf-8')
pattern=r"(async function buildEvidenceMonthPack\(key,statusNode\)\{.*?)(if\(typeof createZip!=='function'\)throw new Error\('Evia ZIP builder is unavailable\.'\);)"
match=re.search(pattern,time,re.S)
if not match:
    raise SystemExit('Monthly evidence pack integration anchor changed')
viewer="""try{if(globalThis.EviaEvidencePackViewer?.buildViewerFiles){const viewerFiles=await globalThis.EviaEvidencePackViewer.buildViewerFiles(entries,{scopeType:'month',scopeLabel:monthLabel(key),course:getCourseTitle(),learner:getLearner(),learning:[]});files.push(...viewerFiles)}}catch(viewerError){console.warn('Could not add the self-contained Evia evidence viewer to the monthly ZIP.',viewerError)}"""
time=time[:match.start(2)]+viewer+match.group(2)+time[match.end(2):]
TIME.write_text(time,encoding='utf-8')

test=TIME_TEST.read_text(encoding='utf-8')
needle='evia-approved-time-monthly-packs-v1.js?v=8'
count=test.count(needle)
if count<1:
    raise SystemExit('Expected Time v8 references in regression test')
TIME_TEST.write_text(test.replace(needle,'evia-approved-time-monthly-packs-v1.js?v=9'),encoding='utf-8')
