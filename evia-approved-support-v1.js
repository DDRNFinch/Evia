(()=>{'use strict';
const STYLE_ID='eviaSupportV1Styles';
function injectStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    html.evia-dyslexia body,
    html.evia-dyslexia button,
    html.evia-dyslexia input,
    html.evia-dyslexia textarea,
    html.evia-dyslexia .evia-support-overlay,
    html.evia-dyslexia .evia-support-preview{font-family:Verdana,Tahoma,Arial,sans-serif!important}
    html.evia-dyslexia #screen,
    html.evia-dyslexia .evia-support-overlay{letter-spacing:.025em!important;word-spacing:.085em!important}
    html.evia-dyslexia #screen p,
    html.evia-dyslexia #screen .chat-bubble,
    html.evia-dyslexia #screen .speech-line,
    html.evia-dyslexia #screen .pill,
    html.evia-dyslexia .evia-support-overlay p,
    html.evia-dyslexia .evia-support-overlay .support-label span{line-height:1.68!important}
    html.evia-dyslexia #screen p,
    html.evia-dyslexia #screen .chat-bubble,
    html.evia-dyslexia .evia-support-overlay p{max-width:42ch}

    html.evia-line-spacing #screen,
    html.evia-line-spacing .evia-support-overlay{line-height:1.75!important}
    html.evia-line-spacing #screen p,
    html.evia-line-spacing #screen .chat-bubble,
    html.evia-line-spacing #screen .speech-line,
    html.evia-line-spacing #screen .pill,
    html.evia-line-spacing .evia-support-overlay p,
    html.evia-line-spacing .evia-support-overlay .support-label span{line-height:1.78!important}

    html.evia-letter-spacing #screen,
    html.evia-letter-spacing .evia-support-overlay{letter-spacing:.06em!important;word-spacing:.18em!important}

    html.evia-high-contrast #screen,
    html.evia-high-contrast .evia-support-overlay{filter:contrast(1.28)!important}
    html.evia-high-contrast #screen .pill,
    html.evia-high-contrast #screen .detail-card,
    html.evia-high-contrast .evia-support-overlay .evia-support-section{border-color:rgba(120,94,0,.62)!important}

    html.evia-simple-reading #screen .evia-float::before{display:none!important}
    html.evia-simple-reading #screen .pill,
    html.evia-simple-reading #screen .detail-card,
    html.evia-simple-reading #screen .arch-detail-card,
    html.evia-simple-reading #screen .criterion-tile,
    html.evia-simple-reading #screen .evidence-choice,
    html.evia-simple-reading #screen .evidence-requirements,
    html.evia-simple-reading #screen .capture-surface,
    html.evia-simple-reading #screen .etr-target,
    html.evia-simple-reading #screen .etr-summary,
    html.evia-simple-reading #screen .etr-review{box-shadow:none!important;background:#fff!important}
    html.evia-simple-reading #screen p,
    html.evia-simple-reading #screen .chat-bubble,
    html.evia-simple-reading #screen .speech-line,
    html.evia-simple-reading #screen .detail-card p{font-size:1.06em!important;line-height:1.78!important;letter-spacing:.01em!important}
    html.evia-simple-reading #screen .pill-stack,
    html.evia-simple-reading #screen .arch-detail-content,
    html.evia-simple-reading #screen .evia-epa-checks{gap:16px!important}
    html.evia-simple-reading #screen .detail-card,
    html.evia-simple-reading #screen .etr-target,
    html.evia-simple-reading #screen .etr-summary,
    html.evia-simple-reading #screen .etr-review{padding:20px!important}
    html.evia-simple-reading #screen .detail-muted{opacity:.7!important}

    #eviaSupportPreview[data-preview-kind="dyslexia"] .evia-preview-column:nth-child(2) .evia-preview-sample{font-family:Verdana,Tahoma,Arial,sans-serif!important;line-height:1.72!important;letter-spacing:.035em!important;word-spacing:.11em!important}
    #eviaSupportPreview[data-preview-kind="dyslexia"] .evia-preview-column:nth-child(2) .evia-preview-sample p{max-width:34ch;margin-bottom:16px!important}

    #eviaSupportPreview[data-preview-kind="simplified"] .evia-preview-column:nth-child(2) .evia-preview-sample{padding:23px!important;line-height:1.78!important;box-shadow:none!important;background:#fff!important}
    #eviaSupportPreview[data-preview-kind="simplified"] .evia-preview-column:nth-child(2) .evia-preview-sample p{font-size:1.08em!important;line-height:1.78!important;margin-bottom:20px!important}
    #eviaSupportPreview[data-preview-kind="simplified"] .evia-preview-column:nth-child(2) .evia-preview-pill{margin-top:16px!important;min-height:46px!important;box-shadow:none!important;background:#fff!important}
    #eviaSupportPreview[data-preview-kind="simplified"] .evia-preview-column:nth-child(2) .evia-preview-motion{display:none!important}

    #eviaSupportPreview[data-preview-kind="line"] .evia-preview-column:nth-child(2) .evia-preview-sample{line-height:1.85!important}
    #eviaSupportPreview[data-preview-kind="line"] .evia-preview-column:nth-child(2) .evia-preview-sample p{line-height:1.85!important}
    #eviaSupportPreview[data-preview-kind="letters"] .evia-preview-column:nth-child(2) .evia-preview-sample{letter-spacing:.07em!important;word-spacing:.2em!important}
    #eviaSupportPreview[data-preview-kind="contrast"] .evia-preview-column:nth-child(2) .evia-preview-sample{filter:contrast(1.35)!important;border-color:rgba(120,94,0,.68)!important}
  `;
  document.head.appendChild(style);
}
function markPreview(){
  const preview=document.getElementById('eviaSupportPreview');
  if(!preview)return;
  const title=String(preview.querySelector('.evia-preview-head strong')?.textContent||'').toLowerCase();
  let kind='';
  if(title.includes('dyslexia'))kind='dyslexia';
  else if(title.includes('simplified'))kind='simplified';
  else if(title.includes('line spacing'))kind='line';
  else if(title.includes('word and letter'))kind='letters';
  else if(title.includes('contrast'))kind='contrast';
  preview.dataset.previewKind=kind;
}
injectStyles();
const observer=new MutationObserver(markPreview);
observer.observe(document.body,{childList:true,subtree:true,characterData:true});
markPreview();
})();
