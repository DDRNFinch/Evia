from pathlib import Path
import re

INDEX=Path('index.html')
TIME=Path('evia-approved-time-monthly-packs-v1.js')
MANIFEST=Path('evia-runtime-manifest.js')
TIME_TEST=Path('tests/time-only-redesign.spec.js')
VIEWER=Path('evia-evidence-viewer-pack-v1.js')

# Correct the portable viewer's JSON escaping helper. Escaping every < already protects </script.
viewer_source=VIEWER.read_text(encoding='utf-8')
bad=r".replace(/<\\/script/gi,'<\\/script')"
if viewer_source.count(bad)!=1:
    raise SystemExit(f'Viewer JSON escape fix anchor expected once, got {viewer_source.count(bad)}')
VIEWER.write_text(viewer_source.replace(bad,'',1),encoding='utf-8')

# Runtime: load the self-contained viewer builder before Time, and bust the changed Time file.
manifest=MANIFEST.read_text(encoding='utf-8')
old="  './evia-approved-witness-video-v1.js',\n  './evia-approved-time-monthly-packs-v1.js?v=7',"
new="  './evia-approved-witness-video-v1.js',\n  './evia-evidence-viewer-pack-v1.js?v=1',\n  './evia-approved-time-monthly-packs-v1.js?v=8',"
if manifest.count(old)!=1:
    raise SystemExit('Runtime manifest anchor changed')
MANIFEST.write_text(manifest.replace(old,new,1),encoding='utf-8')

# Full portfolio ZIP: keep every existing file, then append the viewer files immediately before ZIP creation.
index=INDEX.read_text(encoding='utf-8')
anchor="        const zipBlob = await createZip(files);"
insert="""        if (globalThis.EviaEvidencePackViewer?.buildViewerFiles) {
          try {
            const viewerFiles = await globalThis.EviaEvidencePackViewer.buildViewerFiles(entries, {
              scopeType: 'portfolio',
              scopeLabel: 'Complete portfolio',
              course: typeof activeCourseTitle !== 'undefined' ? activeCourseTitle : '',
              learner: typeof officialLearnerProfile === 'function' ? officialLearnerProfile() : {},
              learning: typeof learningEntries !== 'undefined' && Array.isArray(learningEntries) ? learningEntries : [],
              filePaths: entries.map((entry) => `evidence/${entry.fileName}`)
            });
            files.push(...viewerFiles);
          } catch (viewerError) {
            console.warn('Could not add the Evia evidence viewer to the portfolio ZIP.', viewerError);
          }
        }

        const zipBlob = await createZip(files);"""
if index.count(anchor)!=1:
    raise SystemExit(f'Portfolio ZIP anchor expected once, got {index.count(anchor)}')
INDEX.write_text(index.replace(anchor,insert,1),encoding='utf-8')

# Monthly evidence ZIP: append the same offline viewer while preserving the existing PDF, JSON and Evidence files.
time=TIME.read_text(encoding='utf-8')
pattern=r"(async function buildEvidenceMonthPack\(key,statusNode\)\{.*?)(if\(typeof createZip!=='function'\)throw new Error\('Evia ZIP builder is unavailable\.'\);)"
match=re.search(pattern,time,re.S)
if not match:
    raise SystemExit('Monthly evidence pack integration anchor changed')
viewer="""const viewerFilePaths=entries.map((entry,index)=>entry?.blob instanceof Blob&&entry.blob.size?`Evidence/${String(index+1).padStart(2,'0')}-${safeName(entry.fileName||`${String(index+1).padStart(2,'0')}-${evidenceTitle(entry)}`)}`:'');try{if(globalThis.EviaEvidencePackViewer?.buildViewerFiles){const viewerFiles=await globalThis.EviaEvidencePackViewer.buildViewerFiles(entries,{scopeType:'month',scopeLabel:monthLabel(key),course:getCourseTitle(),learner:getLearner(),learning:[],filePaths:viewerFilePaths});files.push(...viewerFiles)}}catch(viewerError){console.warn('Could not add the Evia evidence viewer to the monthly ZIP.',viewerError)}"""
time=time[:match.start(2)]+viewer+match.group(2)+time[match.end(2):]
TIME.write_text(time,encoding='utf-8')

# Time regression follows the cache-busted runtime URL only; behaviour assertions remain unchanged.
test=TIME_TEST.read_text(encoding='utf-8')
needle='evia-approved-time-monthly-packs-v1.js?v=7'
count=test.count(needle)
if count<1:
    raise SystemExit('Expected Time v7 references in regression test')
TIME_TEST.write_text(test.replace(needle,'evia-approved-time-monthly-packs-v1.js?v=8'),encoding='utf-8')
