(()=>{'use strict';
const ID='eviaUiPolishVisibleV1';
if(document.getElementById(ID))return;
const style=document.createElement('style');
style.id=ID;
style.textContent=`
/* Visible refinement layer: same Evia layout, clearer hierarchy and surfaces. */
.overlay-panel{background:rgba(248,248,246,.965)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.chat-card,.portfolio-card,.scanner-card,.arch-detail-card{border:1px solid rgba(45,45,45,.09)!important;box-shadow:0 22px 55px rgba(35,35,35,.105)!important}
.arch-detail-card,.portfolio-card,.scanner-card{background:#fff!important}
.detail-card,.etr-target,.etr-summary,.etr-review,.evia-epa-card,.evia-epa-hero,.evia-support-section,.evia-update-card{border:1.5px solid rgba(245,196,0,.31)!important;background:linear-gradient(180deg,#fff 0%,#fffdf7 100%)!important;box-shadow:0 10px 26px rgba(35,35,35,.055)!important}
.pill{border:1.5px solid rgba(245,196,0,.39)!important;background:linear-gradient(180deg,#fffdf8,rgba(250,249,242,.98))!important;box-shadow:0 9px 22px rgba(35,35,35,.06)!important}
.pill-label{color:rgba(38,38,38,.76)!important;font-weight:600!important}
.evidence-choice,.evidence-requirements,.capture-surface{border:1.5px solid rgba(245,196,0,.36)!important;background:linear-gradient(180deg,#fff,#fffdf8)!important;box-shadow:0 10px 26px rgba(35,35,35,.06)!important}
#eviaToolsMenu.evia-tools-menu{border:1px solid rgba(245,196,0,.30)!important;box-shadow:0 18px 48px rgba(35,35,35,.12)!important}
#eviaToolsMenu .evia-tool-item{border:1px solid rgba(245,196,0,.12)!important;background:linear-gradient(180deg,#fffdf8,rgba(250,249,242,.88))!important}
.chat-bubble{box-shadow:0 6px 18px rgba(35,35,35,.055)!important}.chat-row.bot .chat-bubble{background:#f1f1f1!important}.chat-row.user .chat-bubble{background:rgba(245,196,0,.18)!important}
.chat-option{border:1.5px solid rgba(245,196,0,.39)!important;background:#fffdf8!important;box-shadow:0 6px 17px rgba(35,35,35,.045)!important}
.etr-badge{background:rgba(245,196,0,.15)!important}.etr-track{height:7px!important}.etr-track i{box-shadow:0 0 8px rgba(245,196,0,.18)}
.evia-epa-metric,.etr-metric{background:#fff!important;border-color:rgba(245,196,0,.20)!important}
.support-row+.support-row{border-top:1px solid rgba(45,45,45,.045)}
.support-toggle{box-shadow:inset 0 0 0 1px rgba(45,45,45,.055)!important}.support-toggle.on{box-shadow:0 0 0 3px rgba(245,196,0,.08)!important}
.evia-preview-column{border-radius:20px}.evia-preview-sample{border-color:rgba(245,196,0,.30)!important}
.arch-progress-track{stroke:rgba(245,196,0,.16)!important}.arch-progress-fill{filter:drop-shadow(0 1px 2px rgba(245,196,0,.16))}
.status-arch-value{letter-spacing:-.01em}.status-arch-label{letter-spacing:.015em!important}
.overlay-panel.open>.chat-card,.overlay-panel.open>.portfolio-card,.overlay-panel.open>.scanner-card,.overlay-panel.open>.arch-detail-card,.evia-support-overlay.open .evia-support-shell,.evia-support-preview.open .evia-preview-shell,.evia-update-overlay.open .evia-update-shell{animation:eviaVisibleCardIn 300ms cubic-bezier(.22,1,.36,1) both!important}
@keyframes eviaVisibleCardIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
html.evia-reduce-motion .overlay-panel.open>*,html.evia-reduce-motion .evia-support-overlay.open .evia-support-shell,html.evia-reduce-motion .evia-support-preview.open .evia-preview-shell,html.evia-reduce-motion .evia-update-overlay.open .evia-update-shell{animation:none!important}
html.evia-reduce-motion #screen.evia-update-ready .evia-body{animation:eviaUpdateHeartbeat 1.35s ease-in-out infinite!important}
`;
document.head.appendChild(style);
})();
