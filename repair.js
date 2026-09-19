// Evia7 final stability fixes: evidence photos, fixed navigation and accessibility persistence.
(function(){
  const A11Y_KEY="evia7-accessibility";
  const PACK_KEY="evia7-working-evidence-packs";
  const readJson=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||"")||f}catch(_){return f}};
  const getA11y=()=>Object.assign({textScale:"100",dyslexiaFont:false,letterSpacing:false,lineSpacing:false,readingGuide:false,readingGuidePosition:48,readingGuideTransparency:42,readingGuideColour:"clear",focusMode:false,highContrast:false,colourOverlay:"none",readAloud:true},readJson(A11Y_KEY,{}));

  const style=document.createElement("style");
  style.id="evia-final-layout-fixes";
  style.textContent=`
    :root{--evia-nav-bottom:max(14px,env(safe-area-inset-bottom));--evia-nav-height:72px;--evia-fab-size:48px}
    @media(max-width:520px){:root{--evia-nav-height:70px}}
    .bottom-nav{position:fixed!important;bottom:var(--evia-nav-bottom)!important;transform:none!important}
    .evia-fab{position:fixed!important;bottom:calc(var(--evia-nav-bottom) + (var(--evia-nav-height) - var(--evia-fab-size))/2)!important;width:var(--evia-fab-size)!important;height:var(--evia-fab-size)!important;transform:translateX(-50%)!important}
    body.evia-keyboard-editing .bottom-nav{transform:none!important;opacity:1!important;pointer-events:auto!important}
    body.evia-keyboard-editing .evia-fab{transform:translateX(-50%)!important;opacity:1!important}
    html[data-evia-dyslexia="on"] #app,html[data-evia-dyslexia="on"] #app *,html[data-evia-dyslexia="on"] #modal-root,html[data-evia-dyslexia="on"] #modal-root *,html[data-evia-dyslexia="on"] #welcome-screen,html[data-evia-dyslexia="on"] #welcome-screen *{font-family:"Trebuchet MS","Arial Rounded MT Bold",Verdana,Arial,sans-serif!important}
    html[data-evia-letter-spacing="on"] #app *,html[data-evia-letter-spacing="on"] #modal-root *,html[data-evia-letter-spacing="on"] #welcome-screen *{letter-spacing:.12em!important;word-spacing:.08em!important}
    html[data-evia-line-spacing="on"] #app *,html[data-evia-line-spacing="on"] #modal-root *,html[data-evia-line-spacing="on"] #welcome-screen *{line-height:2!important}
    html[data-evia-scale="115"] #screen,html[data-evia-scale="115"] .profile-sheet,html[data-evia-scale="115"] .settings-sheet{font-size:115%!important}
    html[data-evia-scale="130"] #screen,html[data-evia-scale="130"] .profile-sheet,html[data-evia-scale="130"] .settings-sheet{font-size:130%!important}
    html[data-evia-scale="150"] #screen,html[data-evia-scale="150"] .profile-sheet,html[data-evia-scale="150"] .settings-sheet{font-size:150%!important}
    html[data-evia-contrast="on"] body,html[data-evia-contrast="on"] #app,html[data-evia-contrast="on"] #screen,html[data-evia-contrast="on"] #modal-root,html[data-evia-contrast="on"] #welcome-screen{background:#000!important;color:#fff!important}
    html[data-evia-contrast="on"] #app *,html[data-evia-contrast="on"] #screen *,html[data-evia-contrast="on"] #modal-root *,html[data-evia-contrast="on"] #welcome-screen *{color:#fff!important;border-color:#fff!important;box-shadow:none!important}
    html[data-evia-contrast="on"] #app button,html[data-evia-contrast="on"] #modal-root button{background:#000!important;border:2px solid #fff!important}
    html[data-evia-contrast="on"] #app input,html[data-evia-contrast="on"] #app textarea,html[data-evia-contrast="on"] #modal-root input,html[data-evia-contrast="on"] #modal-root textarea{background:#000!important;color:#fff!important;border:2px solid #fff!important}
    html[data-evia-overlay="soft-green"] body:after,html[data-evia-overlay="soft-yellow"] body:after,html[data-evia-overlay="soft-blue"] body:after,html[data-evia-overlay="soft-pink"] body:after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9000}
    html[data-evia-overlay="soft-green"] body:after{background:rgba(239,250,241,.42)}
    html[data-evia-overlay="soft-yellow"] body:after{background:rgba(255,251,232,.42)}
    html[data-evia-overlay="soft-blue"] body:after{background:rgba(237,246,255,.42)}
    html[data-evia-overlay="soft-pink"] body:after{background:rgba(255,240,245,.42)}
  `;
  document.head.appendChild(style);

  function syncA11y(){
    const s=getA11y(),root=document.documentElement;
    const values={eviaScale:String(s.textScale||"100"),eviaDyslexia:s.dyslexiaFont?"on":"off",eviaLetterSpacing:s.letterSpacing?"on":"off",eviaLineSpacing:s.lineSpacing?"on":"off",eviaFocus:s.focusMode?"on":"off",eviaContrast:s.highContrast?"on":"off",eviaOverlay:s.colourOverlay||"none",eviaReadingGuide:s.readingGuide?"on":"off"};
    Object.keys(values).forEach(k=>{if(root.dataset[k]!==values[k])root.dataset[k]=values[k]});
  }
  syncA11y();
  new MutationObserver(syncA11y).observe(document.documentElement,{attributes:true,attributeFilter:["data-evia-scale","data-evia-dyslexia","data-evia-letter-spacing","data-evia-line-spacing","data-evia-focus","data-evia-contrast","data-evia-overlay","data-evia-reading-guide"]});
  window.addEventListener("storage",e=>{if(e.key===A11Y_KEY)syncA11y()});

  document.addEventListener("focusin",()=>document.body.classList.remove("evia-keyboard-editing"));
  document.addEventListener("focusout",()=>document.body.classList.remove("evia-keyboard-editing"));
})();