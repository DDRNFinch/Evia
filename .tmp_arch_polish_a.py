from pathlib import Path
p=Path('index.html');s=p.read_text()
def rep(a,b,label):
 c=s.count(a)
 if c!=1: raise SystemExit(f'{label}:{c}')
 return s.replace(a,b,1)
anchor='    .learn-catchup-form textarea { min-height:120px; resize:vertical; }\n\n    @keyframes talkingFloat {'
css='''    .learn-catchup-form textarea { min-height:120px; resize:vertical; }

    /* approved arch progress + detail UI polish */
    .status-arch{position:relative;overflow:hidden;isolation:isolate}.status-arch-value,.status-arch-label{position:relative;z-index:2}
    .arch-progress-svg{position:absolute;inset:0;width:100%;height:54px;z-index:1;pointer-events:none;overflow:visible}.arch-progress-track,.arch-progress-fill{fill:none;vector-effect:non-scaling-stroke;stroke-width:3}.arch-progress-track{stroke:rgba(245,196,0,.13)}.arch-progress-fill{stroke:var(--evia-yellow);stroke-linecap:round;stroke-dasharray:var(--arch-progress,0) 100;transition:stroke-dasharray 700ms cubic-bezier(.22,1,.36,1),opacity 240ms ease;opacity:0}.status-arch.progress-ready .arch-progress-fill{opacity:1}
    #archDetailPanel{background:rgba(255,255,255,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}.arch-detail-card{background:#fff;border:1px solid rgba(45,45,45,.08);border-radius:28px;padding:16px;box-shadow:0 18px 46px rgba(0,0,0,.08);gap:14px}.arch-detail-title{font-size:21px;font-weight:700;letter-spacing:-.015em;color:rgba(45,45,45,.86)}.arch-detail-content{gap:11px;padding:2px 1px 8px}
    .detail-card{border-color:rgba(245,196,0,.25);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(250,249,242,.96));border-radius:22px;padding:16px;box-shadow:0 8px 22px rgba(0,0,0,.045)}.detail-card>strong:first-child{font-size:15px;line-height:1.25}.detail-card p{margin-top:7px}.detail-metric{min-height:82px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-color:rgba(245,196,0,.20);background:linear-gradient(180deg,#fff,rgba(250,249,242,.92));box-shadow:0 6px 18px rgba(0,0,0,.035)}.detail-metric strong{font-size:19px}
    .time-track{height:18px;margin-top:26px;box-shadow:inset 0 1px 3px rgba(0,0,0,.05)}.time-track-fill{box-shadow:0 2px 8px rgba(245,196,0,.18)}.criterion-tile{min-height:58px;background:#fff;box-shadow:0 5px 14px rgba(0,0,0,.035);transition:transform 180ms ease,border-color 180ms ease,background 180ms ease}.criterion-tile:active{transform:scale(.98)}.criterion-tile.met{background:rgba(245,196,0,.08);border-color:rgba(245,196,0,.46)}.unit-button,.mapping-button,.catchup-button{border-radius:19px;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.035)}
    .catchup-evidence-card,.otj-idea{width:100%;border:1.5px solid rgba(245,196,0,.24);border-radius:20px;background:#fff;padding:14px;box-shadow:0 6px 16px rgba(0,0,0,.035)}.catchup-evidence-card strong,.otj-idea strong{display:block;color:rgba(45,45,45,.80);font-size:13px}.catchup-evidence-card span,.otj-idea span{display:block;margin-top:4px;color:rgba(45,45,45,.56);font-size:11px;line-height:1.4}.catchup-evidence-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:11px}.catchup-evidence-actions button,.detail-action-button{min-height:40px;border:1.5px solid rgba(245,196,0,.34);border-radius:999px;background:rgba(250,249,242,.98);color:rgba(45,45,45,.68);padding:7px 10px;font-size:12px;cursor:pointer}
    .detail-section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:2px 3px 0}.detail-section-heading strong{font-size:14px;color:rgba(45,45,45,.78)}.detail-section-heading span{font-size:11px;color:rgba(45,45,45,.48)}.otj-ideas{display:flex;flex-direction:column;gap:8px}.otj-idea.uncovered{border-color:rgba(245,196,0,.46);background:rgba(245,196,0,.055)}.otj-idea-badge{display:inline-flex!important;width:fit-content;margin:0 0 6px!important;padding:3px 7px;border-radius:999px;background:rgba(245,196,0,.16);color:rgba(45,45,45,.62)!important;font-size:9px!important;font-weight:700;text-transform:uppercase;letter-spacing:.03em}
    .evidence-gallery{display:flex;flex-direction:column;gap:10px;width:100%}.evidence-gallery-item{border:1px solid rgba(245,196,0,.22);border-radius:18px;background:#fff;padding:12px}.evidence-gallery-meta{font-size:11px;line-height:1.4;color:rgba(45,45,45,.55);margin-bottom:9px}.evidence-gallery-preview{width:100%;display:flex;align-items:center;justify-content:center}.evidence-gallery-preview img,.evidence-gallery-preview video{max-width:100%;max-height:46dvh;border-radius:12px}.evidence-gallery-preview audio{width:100%}

    @keyframes talkingFloat {'''
s=rep(anchor,css,'css')
svg='<svg class="arch-progress-svg" viewBox="0 0 100 54" preserveAspectRatio="none" aria-hidden="true"><path class="arch-progress-track" pathLength="100" d="M5 51 A45 45 0 0 1 95 51"></path><path class="arch-progress-fill" pathLength="100" d="M5 51 A45 45 0 0 1 95 51"></path></svg>'
olds=[
('<button class="status-arch" id="timeArch" type="button" aria-label="Time on course">','Time'),
('<button class="status-arch" id="courseArch" type="button" aria-label="Course progress">','Course'),
('<button class="status-arch" id="attendanceArch" type="button" aria-label="Attendance">','Attend'),
('<button class="status-arch" id="learnArch" type="button" aria-label="Learn entries">','Learn')]
for prefix,label in olds:
 if s.count(prefix)!=1: raise SystemExit('arch prefix')
 s=s.replace(prefix,prefix+svg,1)
s=s.replace('<span class="status-arch-label">Attendance</span>','<span class="status-arch-label">Attend</span>',1)
s=rep('    let archDetailStack = [];\n    let portfolioViewerOpen = false;','    let archDetailStack = [];\n    let archPreviewUrls = [];\n    let portfolioViewerOpen = false;','state')
p.write_text(s)
