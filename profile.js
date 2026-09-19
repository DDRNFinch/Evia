/* Evia7 learner profile, course selection and welcome experience. */
(function(){
  const KEY="evia7-profile";
  const defaults={name:"",start:"",end:"",avatar:"",signature:"",mathsEnabled:false,englishEnabled:false};
  const readObject=(key,fallback={})=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}};
  const get=()=>Object.assign({},defaults,readObject(KEY,{}));
  const set=p=>localStorage.setItem(KEY,JSON.stringify(p));
  const esc=s=>String(s??"").replace(/[&<>"]/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]));

  function avatarMarkup(p,large){
    return p.avatar
      ? '<img class="'+(large?"welcome-avatar":"profile-photo")+'" src="'+p.avatar+'" alt="Profile photo">'
      : '<div class="'+(large?"welcome-avatar profile-placeholder":"profile-photo profile-placeholder")+'" role="img" aria-label="Default profile picture"><svg class="profile-silhouette" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="21" r="11"></circle><path d="M13 55c2-12 9-19 19-19s17 7 19 19"></path></svg></div>';
  }

  function openProfile(){
    const p=get();
    document.getElementById("modal-root").innerHTML=
      '<div class="profile-overlay"><section class="profile-sheet">'+
      '<div class="profile-head"><div><div class="profile-kicker">YOUR PROFILE</div><h2>Apprentice profile</h2></div><button class="profile-close" id="profile-close">×</button></div>'+
      '<div class="profile-avatar-row profile-photo-row">'+avatarMarkup(p,false)+'<div class="profile-photo-copy"><strong>Profile picture</strong><p>Your photo appears as a small thumbnail in the profile button.</p><label class="profile-upload">Choose photo<input id="avatar-file" type="file" accept="image/*"></label></div></div>'+
      '<div class="profile-fields">'+
      '<label>Name<input id="profile-name" value="'+esc(p.name)+'" placeholder="Your name"></label>'+
      '<div class="profile-dates"><label>Start date<input id="profile-start" type="date" value="'+esc(p.start)+'"></label><label>End date<input id="profile-end" type="date" value="'+esc(p.end)+'"></label></div>'+
      '</div>'+
      '<div class="profile-block"><div class="profile-kicker">YOUR COURSE</div><div class="course-options">'+Object.keys(C).map(k=>'<button type="button" class="course-option '+(k===course?"selected":"")+'" data-profile-course="'+k+'">'+esc(C[k].name)+'<span>›</span></button>').join("")+'</div></div>'+
      '<div class="profile-block"><div class="profile-kicker">MATHS & ENGLISH</div><p>Choose which subjects Evia should include in your tests and progress reviews.</p><label class="study-check"><input id="profile-maths" type="checkbox"><span>I am studying Maths</span></label><label class="study-check"><input id="profile-english" type="checkbox"><span>I am studying English</span></label></div>'+
      '<div class="profile-block"><button type="button" class="settings-entry" id="open-settings"><span class="settings-entry-icon" aria-hidden="true">Aa</span><span class="settings-entry-copy"><strong>Accessibility & settings</strong><small>Personalise how Evia looks, reads and behaves</small></span><span class="settings-entry-arrow" aria-hidden="true">›</span></button></div><div class="profile-block"><div class="profile-kicker">YOUR SIGNATURE</div><p>Write your signature with your finger. It will be attached to saved evidence with the time and date.</p><div class="signature-wrap"><canvas id="signature-pad" width="900" height="260"></canvas><button type="button" id="clear-signature">Clear</button></div></div>'+
      '<div class="profile-actions"><button type="button" class="secondary" id="download-portfolio">Download PDF</button><button type="button" class="primary" id="save-profile">Save profile</button></div>'+
      '</section></div>';

    const canvas=document.getElementById("signature-pad"),ctx=canvas.getContext("2d");
    ctx.lineWidth=4;ctx.lineCap="round";ctx.lineJoin="round";
    if(p.signature){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,canvas.width,canvas.height);img.src=p.signature}
    let drawing=false;
    const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
    canvas.onpointerdown=e=>{drawing=true;canvas.setPointerCapture(e.pointerId);const q=point(e);ctx.beginPath();ctx.moveTo(q.x,q.y)};
    canvas.onpointermove=e=>{if(!drawing)return;const q=point(e);ctx.lineTo(q.x,q.y);ctx.stroke()};
    canvas.onpointerup=canvas.onpointercancel=()=>drawing=false;
    document.getElementById("clear-signature").onclick=()=>ctx.clearRect(0,0,canvas.width,canvas.height);

    document.getElementById("avatar-file").onchange=e=>{
      const f=e.target.files[0];if(!f)return;
      const r=new FileReader();r.onload=()=>{p.avatar=r.result;set(p);refreshProfileButton();openProfile()};r.readAsDataURL(f);
    };
    document.querySelectorAll("[data-profile-course]").forEach(b=>b.onclick=()=>{course=b.dataset.profileCourse;persist();openProfile();});
    document.getElementById("open-settings").onclick=()=>openSettings();document.getElementById("open-settings").onkeydown=e=>{if(e.key==="Enter"||e.key===" ")openSettings()};
    document.getElementById("profile-close").onclick=()=>document.getElementById("modal-root").innerHTML="";
    document.getElementById("save-profile").onclick=()=>{
      const signature=canvasHasInk(canvas)?canvas.toDataURL("image/png"):(p.signature||"");
      set({name:document.getElementById("profile-name").value.trim(),start:document.getElementById("profile-start").value,end:document.getElementById("profile-end").value,avatar:p.avatar,signature,mathsEnabled:document.getElementById("profile-maths").checked,englishEnabled:document.getElementById("profile-english").checked});
      refreshProfileButton();document.getElementById("modal-root").innerHTML="";
    };
    document.getElementById("download-portfolio").onclick=downloadEvidencePack;
    document.getElementById("profile-maths").checked=!!p.mathsEnabled;
    document.getElementById("profile-english").checked=!!p.englishEnabled;
  }

  const SETTINGS_KEY="evia7-accessibility";
  const defaultSettings={textScale:"100",dyslexiaFont:false,letterSpacing:false,lineSpacing:false,readingGuide:false,readingGuidePosition:48,readingGuideTransparency:42,readingGuideColour:"clear",focusMode:false,highContrast:false,colourOverlay:"none",readAloud:true};
  function getSettings(){return Object.assign({},defaultSettings,readObject(SETTINGS_KEY,{}))}
  function saveSettings(s){const next=Object.assign({},defaultSettings,s);localStorage.setItem(SETTINGS_KEY,JSON.stringify(next));applySettings(next)}
  function ensureAccessibilityStyles(){
    if(document.getElementById("evia-accessibility-styles"))return;
  function enforceAccessibilityDom(s){
    const root=document.documentElement;
    const app=document.getElementById("app"), modal=document.getElementById("modal-root"), welcome=document.getElementById("welcome-screen");
    const areas=[app,modal,welcome].filter(Boolean);
    const textNodes=[];
    areas.forEach(area=>area.querySelectorAll("p,h1,h2,h3,h4,h5,h6,button,label,small,strong,span,li,textarea,input,output").forEach(el=>textNodes.push(el)));
    textNodes.forEach(el=>{
      if(s.dyslexiaFont){el.style.setProperty("font-family",'Arial Rounded MT Bold, Trebuchet MS, Verdana, Arial, sans-serif',"important")}
      else el.style.removeProperty("font-family");
      if(s.letterSpacing){el.style.setProperty("letter-spacing",".14em","important");el.style.setProperty("word-spacing",".08em","important")}
      else {el.style.removeProperty("letter-spacing");el.style.removeProperty("word-spacing")}
      if(s.lineSpacing)el.style.setProperty("line-height","2.15","important");else el.style.removeProperty("line-height");
    });
    const screen=document.getElementById("screen");
    if(screen){
      [...screen.children].forEach(el=>{
        if(s.focusMode){el.style.setProperty("opacity",".32","important");el.style.setProperty("filter","saturate(.25) blur(.2px)","important")}
        else {el.style.removeProperty("opacity");el.style.removeProperty("filter")}
      });
      if(s.focusMode){screen.style.setProperty("max-width","600px","important")}else screen.style.removeProperty("max-width");
    }
    if(s.highContrast){
      document.body.style.setProperty("background","#000","important");
      document.body.style.setProperty("color","#fff","important");
    }else{
      document.body.style.removeProperty("background");document.body.style.removeProperty("color");
    }
  }
  function watchAccessibilityDom(){
    if(window.__eviaAccessibilityObserver)return;
    window.__eviaAccessibilityObserver=new MutationObserver(()=>{
      if(window.__eviaAccessibilityApplying)return;
      window.__eviaAccessibilityApplying=true;
      try{enforceAccessibilityDom(getSettings())}finally{window.__eviaAccessibilityApplying=false}
    });
    window.__eviaAccessibilityObserver.observe(document.body,{childList:true,subtree:true});
  }

    const style=document.createElement("style");
    style.id="evia-accessibility-styles";
    style.textContent=`
      html[data-evia-dyslexia="on"] #app,html[data-evia-dyslexia="on"] #app *,html[data-evia-dyslexia="on"] #modal-root,html[data-evia-dyslexia="on"] #modal-root *,html[data-evia-dyslexia="on"] #welcome-screen,html[data-evia-dyslexia="on"] #welcome-screen *{font-family:"Arial Rounded MT Bold","Trebuchet MS",Verdana,Arial,sans-serif!important;font-size:1.03em!important;font-weight:500!important;font-synthesis:none!important}
      html[data-evia-letter-spacing="on"] #app *,html[data-evia-letter-spacing="on"] #modal-root *,html[data-evia-letter-spacing="on"] #welcome-screen *{letter-spacing:.14em!important;word-spacing:.08em!important}
      html[data-evia-line-spacing="on"] #app *,html[data-evia-line-spacing="on"] #modal-root *,html[data-evia-line-spacing="on"] #welcome-screen *{line-height:2.15!important}
      html[data-evia-focus="on"] #app .bottom-nav,html[data-evia-focus="on"] #app .evia-fab{opacity:.12!important;filter:grayscale(1)!important}
      html[data-evia-focus="on"] #app #screen{max-width:600px!important}
      html[data-evia-focus="on"] #app #screen>*{opacity:.32!important;filter:saturate(.25) blur(.2px)!important;transition:opacity .18s ease,filter .18s ease!important}
      html[data-evia-focus="on"] #app #screen>*:hover,html[data-evia-focus="on"] #app #screen>*:focus-within{opacity:1!important;filter:none!important}
      html[data-evia-contrast="on"] body,html[data-evia-contrast="on"] #app,html[data-evia-contrast="on"] #screen,html[data-evia-contrast="on"] #modal-root,html[data-evia-contrast="on"] #welcome-screen{background:#000!important;color:#fff!important}
      html[data-evia-contrast="on"] #app *,html[data-evia-contrast="on"] #screen *,html[data-evia-contrast="on"] #modal-root *,html[data-evia-contrast="on"] #welcome-screen *{color:#fff!important;border-color:#fff!important;box-shadow:none!important}
      html[data-evia-contrast="on"] #app .card,html[data-evia-contrast="on"] #app .panel,html[data-evia-contrast="on"] #app .section,html[data-evia-contrast="on"] #app .bottom-nav,html[data-evia-contrast="on"] #app button,html[data-evia-contrast="on"] #modal-root .profile-sheet,html[data-evia-contrast="on"] #modal-root button{background:#000!important}
      html[data-evia-contrast="on"] #app button,html[data-evia-contrast="on"] #modal-root button{border:2px solid #fff!important}
      html[data-evia-contrast="on"] #app input,html[data-evia-contrast="on"] #app textarea,html[data-evia-contrast="on"] #modal-root input,html[data-evia-contrast="on"] #modal-root textarea{background:#000!important;color:#fff!important;border:2px solid #fff!important}
      html[data-evia-scale="115"] #app{zoom:1.15!important}html[data-evia-scale="130"] #app{zoom:1.30!important}html[data-evia-scale="150"] #app{zoom:1.50!important}
      html[data-evia-scale="115"] #modal-root,html[data-evia-scale="115"] #welcome-screen{zoom:1.15!important}html[data-evia-scale="130"] #modal-root,html[data-evia-scale="130"] #welcome-screen{zoom:1.30!important}html[data-evia-scale="150"] #modal-root,html[data-evia-scale="150"] #welcome-screen{zoom:1.50!important}
    `;

    document.head.appendChild(style);
  }
  function applySettings(s){
    ensureAccessibilityStyles();
    const root=document.documentElement;
    const transparency=Math.max(0,Math.min(100,Number(s.readingGuideTransparency??42)));
    const guideColours={yellow:[255,220,0],blue:[80,160,255],pink:[255,100,160],clear:[255,255,255]};
    const gc=guideColours[s.readingGuideColour||"clear"]||guideColours.clear;
    const alpha=s.readingGuideColour==="clear"?0:(100-transparency)/100;
    const scale=String(s.textScale||"100");
    root.style.setProperty("--evia-text-scale",(Number(scale)/100).toFixed(2));
    root.dataset.eviaScale=scale;
    root.dataset.eviaDyslexia=s.dyslexiaFont?"on":"off";
    root.dataset.eviaLetterSpacing=s.letterSpacing?"on":"off";
    root.dataset.eviaLineSpacing=s.lineSpacing?"on":"off";
    root.dataset.eviaFocus=s.focusMode?"on":"off";
    root.dataset.eviaContrast=s.highContrast?"on":"off";
    root.style.setProperty("--evia-reading-guide-position",(Number(s.readingGuidePosition??48))+"%");
    root.style.setProperty("--evia-reading-guide-background","rgba("+gc.join(",")+","+alpha.toFixed(2)+")");
    root.dataset.eviaReadingGuide=s.readingGuide?"on":"off";
    root.dataset.eviaOverlay=s.colourOverlay||"none";
    enforceAccessibilityDom(s);watchAccessibilityDom();
    let guide=document.getElementById("evia-reading-guide");
    if(s.readingGuide){
      if(!guide){guide=document.createElement("div");guide.id="evia-reading-guide";guide.setAttribute("aria-label","Reading guide. Hold and drag up or down to move it.");document.body.appendChild(guide)}
      guide.style.top=(Number(s.readingGuidePosition??48))+"%";
      guide.style.background=s.readingGuideColour==="clear"?"transparent":"rgba("+gc.join(",")+","+alpha.toFixed(2)+")";
    }else if(guide)guide.remove();
  }
  function initReadingGuideDrag(){
    if(window.__eviaReadingGuideDragInitialised)return;
    window.__eviaReadingGuideDragInitialised=true;
    document.addEventListener("pointerdown",e=>{
      const guide=e.target.closest("#evia-reading-guide");
      if(!guide)return;
      guide.setPointerCapture?.(e.pointerId);
      guide.dataset.dragging="true";
      e.preventDefault();
    });
    document.addEventListener("pointermove",e=>{
      const guide=document.getElementById("evia-reading-guide");
      if(!guide||guide.dataset.dragging!=="true")return;
      const position=Math.max(4,Math.min(96,(e.clientY/window.innerHeight)*100));
      guide.style.top=position+"%";
      document.documentElement.style.setProperty("--evia-reading-guide-position",position+"%");
      const s=getSettings();
      s.readingGuidePosition=Math.round(position);
      localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));
      e.preventDefault();
    });
    document.addEventListener("pointerup",e=>{
      const guide=document.getElementById("evia-reading-guide");
      if(guide)guide.dataset.dragging="false";
    });
    document.addEventListener("pointercancel",()=>{
      const guide=document.getElementById("evia-reading-guide");
      if(guide)guide.dataset.dragging="false";
    });
  }
  function settingLabel(key){return ({textScale:"Text size",dyslexiaFont:"Dyslexia-friendly text",letterSpacing:"More letter spacing",lineSpacing:"More line spacing",readingGuide:"Reading guide",focusMode:"Focus mode",highContrast:"High contrast",colourOverlay:"Colour overlay",readAloud:"Read aloud"})[key]||key}
  function settingDescription(key){return ({textScale:"See exactly how the text size will change.",dyslexiaFont:"Use a clearer, more spacious typeface for easier reading.",letterSpacing:"Add visible space between each letter.",lineSpacing:"Add visible space between lines of text.",readingGuide:"Add a movable reading guide and choose its colour.",focusMode:"Reduce visual distraction and keep attention on the main content.",highContrast:"Increase the contrast between text and interface elements.",colourOverlay:"Add a soft colour tint across the Evia interface.",readAloud:"Double tap the example to hear it read aloud."})[key]||""}
  function forcedPreviewSettings(key,saved){
    const d=Object.assign({},saved);
    if(key==="textScale")d.textScale=saved.textScale==="150"?"150":"130";
    if(key==="dyslexiaFont")d.dyslexiaFont=true;
    if(key==="letterSpacing")d.letterSpacing=true;
    if(key==="lineSpacing")d.lineSpacing=true;
    if(key==="readingGuide"){d.readingGuide=true;d.readingGuidePosition=48;d.readingGuideTransparency=42;d.readingGuideColour="yellow"}
    if(key==="focusMode")d.focusMode=true;
    if(key==="highContrast")d.highContrast=true;
    if(key==="colourOverlay")d.colourOverlay=saved.colourOverlay==="none"?"soft-green":saved.colourOverlay;
    return d;
  }
  function previewClass(draft,key){
    return (key==="textScale"?"preview-scale-"+String(draft.textScale)+" ":"")+(draft.dyslexiaFont?"preview-dyslexia ":"")+(draft.letterSpacing?"preview-letter ":"")+(draft.lineSpacing?"preview-lines ":"")+(draft.highContrast?"preview-contrast ":"")+(draft.colourOverlay!=="none"?"preview-overlay-"+draft.colourOverlay:"")+(draft.focusMode?"preview-focus ":"")+(key==="readingGuide"?"preview-guide ":"");
  }
  function previewSample(draft,key){
    const guideAlpha=draft.readingGuideColour==="clear"?0:(100-Math.max(0,Math.min(100,Number(draft.readingGuideTransparency??42))))/100;const guideRgb=({clear:[255,255,255],yellow:[255,220,0],blue:[80,160,255],pink:[255,100,160]})[draft.readingGuideColour||"yellow"]||[255,220,0];const guideStyle=key==="readingGuide"?' style="--preview-guide-position:'+(Number(draft.readingGuidePosition??48))+'%;--preview-guide-background:rgba('+guideRgb.join(",")+","+guideAlpha.toFixed(2)+')"' : "";return '<div class="settings-preview-card '+previewClass(draft,key)+'"'+guideStyle+'><span class="preview-eyebrow">EVIA</span><h3>Read this example</h3><p>Double tap to read aloud. Making a change here lets you see exactly how Evia will look when this accessibility setting is applied.</p><button type="button">Example button</button></div>';
  }
  function openSettings(){
    const modal=document.getElementById("modal-root");
    const main=()=>{
      const saved=getSettings();
      const rows=[["textScale","Text size",saved.textScale+"%"],["dyslexiaFont","Dyslexia-friendly text",saved.dyslexiaFont?"On":"Off"],["letterSpacing","More letter spacing",saved.letterSpacing?"On":"Off"],["lineSpacing","More line spacing",saved.lineSpacing?"On":"Off"],["readingGuide","Reading guide",saved.readingGuide?"On":"Off"],["focusMode","Focus mode",saved.focusMode?"On":"Off"],["highContrast","High contrast",saved.highContrast?"On":"Off"],["colourOverlay","Colour overlay",saved.colourOverlay==="none"?"None":saved.colourOverlay.replace("soft-","").replace(/\b\w/g,m=>m.toUpperCase())],["readAloud","Read aloud",saved.readAloud?"On":"Off"]];
      modal.innerHTML='<div class="profile-overlay settings-overlay"><section class="profile-sheet settings-sheet"><div class="profile-head"><div><div class="profile-kicker">ACCESSIBILITY & SETTINGS</div><h2>Make Evia work for you</h2></div><button class="profile-close" id="settings-close" aria-label="Close">×</button></div><p class="settings-intro">Choose a setting to see a real before-and-after preview. The main app only changes when you confirm.</p><div class="settings-list">'+rows.map(r=>'<button type="button" class="settings-row" data-open-setting="'+r[0]+'"><span><strong>'+r[1]+'</strong><small>'+settingDescription(r[0])+'</small></span><span class="settings-row-value">'+r[2]+' <b>›</b></span></button>').join("")+'</div><div class="settings-section settings-about"><div class="settings-label">APPLIES ACROSS EVIA</div><p>Confirmed choices apply across the whole app, including learning, course, progress, portfolio, profile, settings and Evia content.</p></div></section></div>';
      document.getElementById("settings-close").onclick=()=>openProfile();
      document.querySelectorAll("[data-open-setting]").forEach(b=>b.onclick=()=>openSetting(b.dataset.openSetting));
    };
    const openSetting=(key)=>{
      const saved=getSettings();
      const draft=Object.assign({},saved);
      const preview=forcedPreviewSettings(key,saved);
      const renderAfter=()=>{const el=document.getElementById("setting-after");if(el)el.innerHTML=previewSample(preview,key)};
      let controls="";
      if(key==="textScale")controls='<div class="settings-segment">'+["100","115","130","150"].map(v=>'<button type="button" data-choice="'+v+'" class="'+(preview.textScale===v?"selected":"")+'">'+v+'%</button>').join("")+'</div>';
      else if(key==="colourOverlay")controls='<div class="overlay-options">'+[["soft-green","Soft green"],["soft-yellow","Soft yellow"],["soft-blue","Soft blue"],["soft-pink","Soft pink"]].map(o=>'<button type="button" data-choice="'+o[0]+'" class="'+(preview.colourOverlay===o[0]?"selected":"")+'"><i></i><span>'+o[1]+'</span></button>').join("")+'</div>';
      else if(key==="readingGuide")controls='<label class="guide-position-control"><span>Transparency</span><input id="guide-position" type="range" min="0" max="100" value="42"><output id="guide-position-value">42%</output></label><div class="guide-colour-options">'+[["clear","Clear"],["yellow","Yellow"],["blue","Blue"],["pink","Pink"]].map(o=>'<button type="button" data-choice="'+o[0]+'" class="'+(o[0]==="yellow"?"selected":"")+'"><i></i>'+o[1]+'</button>').join("")+'</div>';
      else controls='<div class="setting-preview-note">The AFTER panel shows this setting switched on. Confirm applies it to the whole app.</div>';
      modal.innerHTML='<div class="profile-overlay settings-overlay"><section class="profile-sheet settings-sheet setting-detail"><div class="profile-head"><div><div class="profile-kicker">PREVIEW</div><h2>'+settingLabel(key)+'</h2></div><button class="profile-close" id="setting-close" aria-label="Close">×</button></div><p class="settings-intro">'+settingDescription(key)+'</p><div class="settings-preview"><div class="settings-preview-head"><strong>BEFORE — EVIA AS NORMAL</strong><strong>AFTER — SETTING ON</strong></div><div class="settings-preview-grid"><div class="settings-preview-card"><span class="preview-eyebrow">EVIA</span><h3>Read this example</h3><p>Making a change here lets you see exactly how Evia will look when this accessibility setting is applied.</p><button type="button">Example button</button></div><div id="setting-after"></div></div></div><div class="setting-detail-controls">'+controls+'</div><div class="settings-actions"><button type="button" class="secondary" id="setting-cancel">Cancel</button><div id="setting-toggle-action"></div></div></section></div>';
      if(key==="readingGuide"){
        const pos=document.getElementById("guide-position");
        pos.oninput=()=>{preview.readingGuideTransparency=Number(pos.value);document.getElementById("guide-position-value").value=pos.value+"%";renderAfter()};
        document.querySelectorAll("[data-choice]").forEach(b=>b.onclick=()=>{preview.readingGuideColour=b.dataset.choice;document.querySelectorAll("[data-choice]").forEach(x=>x.classList.toggle("selected",x.dataset.choice===preview.readingGuideColour));renderAfter()});
      }else if(key==="textScale"||key==="colourOverlay"){
        document.querySelectorAll("[data-choice]").forEach(b=>b.onclick=()=>{preview[key]=b.dataset.choice;document.querySelectorAll("[data-choice]").forEach(x=>x.classList.toggle("selected",x.dataset.choice===b.dataset.choice));renderAfter()});
      }
      document.getElementById("setting-close").onclick=()=>main();
      document.getElementById("setting-cancel").onclick=()=>main();
      const toggleKeys=["dyslexiaFont","letterSpacing","lineSpacing","readingGuide","focusMode","highContrast","readAloud"];
      if(toggleKeys.includes(key)){
        const action=document.getElementById("setting-toggle-action");
        action.innerHTML='<label class="setting-switch setting-switch-large"><input id="setting-enabled" type="checkbox"><i></i><em>Off</em></label>';
        const enabled=document.getElementById("setting-enabled");
        enabled.checked=!!saved[key];
        preview[key]=enabled.checked;
        enabled.onchange=()=>{
          preview[key]=enabled.checked;
          renderAfter();
          draft[key]=enabled.checked;
          if(key==="readingGuide"){draft.readingGuidePosition=preview.readingGuidePosition;draft.readingGuideColour=preview.readingGuideColour}
          saveSettings(draft);
          main();
        };
      }else{
        const action=document.getElementById("setting-toggle-action");
        action.innerHTML='<button type="button" class="primary" id="setting-confirm">Confirm</button>';
        document.getElementById("setting-confirm").onclick=()=>{
          if(key==="textScale")draft.textScale=preview.textScale;
          else if(key==="colourOverlay")draft.colourOverlay=preview.colourOverlay;
          saveSettings(draft);main();
        };
      }
      renderAfter();
    };
    main();
  }
  function canvasHasInk(canvas){
    const d=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height).data;
    for(let i=3;i<d.length;i+=4)if(d[i]>20)return true;
    return false;
  }

  function formatUKDate(value){
    if(!value)return "";
    const s=String(value);
    const m=s.match(/^(\\d{4})-(\\d{2})-(\\d{2})(?:$|T|\\s)/);
    if(m)return m[3]+"/"+m[2]+"/"+m[1];
    const d=new Date(s);
    if(Number.isNaN(d.getTime()))return s;
    return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")+"/"+d.getFullYear();
  }

  function evidenceEntry(e){
    return '<article class="evidence-entry">'+
      '<div class="entry-meta">'+esc(formatUKDate(e.d||e.savedAt||""))+'</div>'+
      '<h2>'+esc(e.u)+'</h2>'+
      (e.p&&e.p.length?'<div class="evidence-photos">'+e.p.map(p=>'<img src="'+p+'" alt="Evidence photo">').join("")+'</div>':"")+
      (e.w?'<p class="evidence-notes">'+esc(e.w).replace(/\n/g,"<br>")+'</p>':"")+
      '<div class="evidence-ksbs">'+(e.k||[]).map(k=>'<span>'+esc(k)+'</span>').join("")+'</div>'+
      (e.signature?'<div class="evidence-signature"><img src="'+e.signature+'" alt="Learner signature"><span>Signed by '+esc((e.learnerProfile&&e.learnerProfile.name)||"Apprentice")+' · '+esc(e.savedAt||e.d||"")+'</span></div>':"")+
      '</article>';
  }

  function downloadEvidencePack(){
    const p=get();
    const mine=evidence.filter(e=>e.c===course);
    if(!mine.length){alert("Save evidence before downloading an evidence pack.");return;}
    openEvidencePackWindow(mine,"Evia evidence pack");
  }

  async function openEvidencePackWindow(mine,title){
    if(window.eviaGetEvidencePhotoData)mine=await Promise.all(mine.map(async e=>Object.assign({},e,{p:await window.eviaGetEvidencePhotoData(e)})));
    const p=get();
    const learner=p.name||"Apprentice";
    const pdfDate=formatUKDate(new Date().toISOString());
    const printWindow=window.open("","_blank");
    if(!printWindow){alert("Please allow pop-ups to download your evidence pack.");return false;}
    printWindow.document.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>'+
      '@page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#172033;font:11pt -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.45}.pack-header{border-bottom:2px solid #e6b800;padding-bottom:14px;margin-bottom:20px}.eyebrow{font-size:9pt;letter-spacing:.12em;color:#667085;font-weight:700}.pack-header h1{font-size:24pt;letter-spacing:-.04em;margin:4px 0}.pack-details{display:grid;grid-template-columns:1fr 1fr;gap:5px;color:#475467}.evidence-entry{break-inside:avoid;page-break-inside:avoid;border:1px solid #e4e7ec;border-radius:12px;padding:15px;margin:0 0 14px}.entry-meta{font-size:9pt;letter-spacing:.08em;text-transform:uppercase;color:#667085}.evidence-entry h2{font-size:16pt;margin:4px 0 10px}.evidence-photos{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:10px 0}.evidence-photos img{width:100%;aspect-ratio:1/1;height:auto;object-fit:cover;object-position:center center;border-radius:7px;border:1px solid #eaecf0;background:#f5f6f8}.evidence-notes{white-space:normal;color:#344054}.evidence-ksbs{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}.evidence-ksbs span{background:#fff7d6;border-radius:999px;padding:3px 7px;font:700 8pt -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#675600}.evidence-signature{border-top:1px solid #eaecf0;margin-top:13px;padding-top:8px;display:grid;gap:3px;font-size:8pt;color:#667085}.evidence-signature img{width:140px;height:38px;object-fit:contain;object-position:left center}.learner-signature{break-inside:avoid;page-break-inside:avoid;margin-top:28px;padding-top:18px;border-top:2px solid #e6b800;display:grid;gap:5px}.learner-signature-title{font-size:10pt;font-weight:700;color:#172033}.learner-signature-meta{display:grid;gap:2px;font-size:9pt;color:#475467}.learner-signature img{width:220px;height:70px;object-fit:contain;object-position:left center;margin-top:8px}.learner-signature-line{width:220px;border-top:1px solid #98a2b3;margin-top:-1px}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>'+
      '<header class="pack-header"><div class="eyebrow">EVIA · EVIDENCE PACK</div><h1>'+esc(learner)+'</h1><div class="pack-details"><span><strong>Course:</strong> '+esc(data().name)+'</span><span><strong>Standard:</strong> '+esc(data().std)+'</span>'+(p.start?'<span><strong>Start date:</strong> '+esc(formatUKDate(p.start))+'</span>':"")+(p.end?'<span><strong>End date:</strong> '+esc(formatUKDate(p.end))+'</span>':"")+(mine.length===1?'<span><strong>Unit:</strong> '+esc(mine[0].u)+'</span>':"")+'</div></header>'+mine.slice().reverse().map(evidenceEntry).join("")+(p.signature?'<section class="learner-signature"><div class="learner-signature-title">Learner signature</div><div class="learner-signature-meta"><span><strong>Learner:</strong> '+esc(learner)+'</span><span><strong>Date:</strong> '+esc(pdfDate)+'</span></div><img src="'+p.signature+'" alt="Learner signature"><div class="learner-signature-line"></div></section>':"")+'</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(()=>printWindow.print(),250);
    return true;
  }

  function downloadUnitEvidencePack(unitName){
    const mine=evidence.filter(e=>e.c===course&&e.u===unitName);
    if(!mine.length){alert("Save evidence for this unit before downloading.");return;}
    const title="Evia evidence pack · "+unitName;
    openEvidencePackWindow(mine,title);
    const state=JSON.parse(localStorage.getItem("evia7-downloaded-unit-pdfs")||"{}");
    state[course+"|"+unitName]=Date.now();
    localStorage.setItem("evia7-downloaded-unit-pdfs",JSON.stringify(state));
  }

  window.downloadEvidencePack=downloadEvidencePack;
  window.downloadUnitEvidencePack=downloadUnitEvidencePack;

  function refreshProfileButton(){
    const b=document.getElementById("profile-btn");if(!b)return;
    const p=get();b.innerHTML=p.avatar?'<img src="'+p.avatar+'" alt="Profile">':'<svg class="profile-silhouette profile-button-silhouette" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="21" r="11"></circle><path d="M13 55c2-12 9-19 19-19s17 7 19 19"></path></svg>';
  }

  function courseOnboarding(){
    const root=document.createElement("div");
    root.id="course-onboarding";
    root.innerHTML='<div class="course-onboarding-inner">'+
      '<div class="course-onboarding-kicker">WELCOME TO EVIA</div>'+
      '<h2>Choose your apprenticeship course</h2>'+
      '<p>This is the course you will use throughout your apprenticeship.</p>'+
      '<div class="course-onboarding-options">'+
        Object.keys(C).map(k=>'<button type="button" class="course-onboarding-option" data-first-course="'+k+'"><strong>'+esc(C[k].name)+'</strong><span>'+esc(C[k].std)+'</span></button>').join("")+
      '</div>'+
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    root.querySelectorAll("[data-first-course]").forEach(b=>b.onclick=()=>{
      course=b.dataset.firstCourse;
      persist();
      root.classList.add("leaving");
      setTimeout(()=>{root.remove();welcome()},320);
    });
  }

  function welcome(){
    if(document.getElementById("welcome-screen"))return;
    const appEl=document.getElementById("app");
    if(appEl){
      appEl.classList.remove("welcome-app-visible");
      appEl.classList.add("welcome-app-hidden");
    }
    const p=get();
    const root=document.createElement("div");root.id="welcome-screen";root.style.zIndex="2000";
    root.innerHTML='<div class="welcome-inner">'+
      '<div class="welcome-avatar evia-welcome-face"><span class="evia-face"><i></i><i></i></span></div>'+
      '<div class="welcome-pulse"></div>'+
      '<div class="welcome-copy"><div class="welcome-small">EVIA</div><h2>Hi'+(p.name?", "+esc(String(p.name).trim().split(/\s+/)[0]):"")+'.</h2><p>What do you want to work on today?</p></div>'+
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    root.querySelector(".welcome-avatar").onclick=finishWelcome;
  }

  function finishWelcome(){
    const root=document.getElementById("welcome-screen");
    const appEl=document.getElementById("app");
    if(!root||!appEl)return;
    void appEl.offsetWidth;
    root.classList.add("leaving");
    requestAnimationFrame(()=>appEl.classList.add("welcome-app-visible"));
    setTimeout(()=>{
      appEl.classList.remove("welcome-app-hidden","welcome-app-visible");
      root.remove();
    },600);
  }

  let eviaProfileInitialised=false;
  function initEviaProfile(){
    if(eviaProfileInitialised)return;
    eviaProfileInitialised=true;
    try{applySettings(getSettings())}catch(e){}
    try{initReadingGuideDrag()}catch(e){}
    try{initReadAloud()}catch(e){}
    try{refreshProfileButton()}catch(e){}
    const profileButton=document.getElementById("profile-btn");
    if(profileButton)profileButton.onclick=openProfile;
    window.eviaOpenProfile=openProfile;
    const style=document.createElement("style");
    style.textContent=`
      .profile-photo-row{align-items:center}.profile-photo-row .profile-photo{width:58px;height:58px;flex:0 0 58px;border-radius:14px;object-fit:cover}.profile-photo-copy{min-width:0}.profile-photo-copy p{margin:4px 0 8px}.profile-btn{overflow:hidden;padding:0;display:grid;place-items:center}.profile-btn img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%}.profile-btn .profile-button-silhouette{width:25px;height:25px}.profile-silhouette{display:block;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}      .settings-list{display:grid;gap:8px;margin:12px 0 20px}.settings-entry{width:100%;display:grid;grid-template-columns:42px 1fr 20px;align-items:center;gap:12px;text-align:left;padding:13px 14px;border:1px solid #e6e9ed;border-radius:16px;background:#fff;box-shadow:0 2px 8px rgba(25,36,55,.035);cursor:pointer}.settings-entry-icon{width:42px;height:42px;border-radius:12px;background:#fff8d8;border:1px solid #f0df8d;display:grid;place-items:center;font-size:13px;font-weight:800;color:#665600}.settings-entry-copy{display:grid;gap:4px}.settings-entry-copy strong{font-size:13px;color:#273244}.settings-entry-copy small{font-size:11px;line-height:1.4;color:#8a94a3}.settings-entry-arrow{font-size:20px;color:#7b8797}.settings-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;text-align:left;padding:15px 14px;border:1px solid #e6e9ed;border-radius:16px;background:#fff;box-shadow:0 2px 8px rgba(25,36,55,.035);cursor:pointer}.settings-row>span:first-child{display:grid;gap:4px}.settings-row strong{font-size:13px;color:#273244}.settings-row small{font-size:11px;line-height:1.4;color:#8a94a3}.settings-row-value{font-size:11px;color:#7b8797;white-space:nowrap}.settings-row-value b{font-size:20px;font-weight:400;vertical-align:-2px;margin-left:3px}.settings-intro{font-size:13px;line-height:1.55;color:#667085;margin:0 0 16px}.settings-preview{margin:6px 0 18px}.settings-preview-head{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:7px;font-size:10px;letter-spacing:.1em;color:#98a2b3}.settings-preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.settings-preview-card{min-width:0;padding:14px;border:1px solid #e4e7ec;border-radius:16px;background:#fff;overflow:hidden}.settings-preview-card h3{font-size:15px;margin:4px 0 7px}.settings-preview-card p{font-size:12px;line-height:1.45;color:#667085;margin:0 0 10px}.settings-preview-card button{padding:9px 11px;border-radius:11px;background:#172033;color:#fff;font-size:11px;font-weight:700}.preview-scale-115 h3{font-size:17.25px!important}.preview-scale-115 p{font-size:12.65px!important}.preview-scale-115 button{font-size:11.5px!important}.preview-scale-130 h3{font-size:19.5px!important}.preview-scale-130 p{font-size:14.3px!important}.preview-scale-130 button{font-size:13px!important}.preview-scale-150 h3{font-size:22px!important}.preview-scale-150 p{font-size:16.5px!important}.preview-scale-150 button{font-size:15px!important}.preview-dyslexia,.preview-dyslexia *{font-family:"Trebuchet MS",Verdana,sans-serif!important;letter-spacing:.035em!important;word-spacing:.12em!important}.preview-dyslexia p{font-size:12.5px!important}.preview-letter *{letter-spacing:.08em!important}.preview-lines p{line-height:2!important}.preview-contrast{color:#fff!important;border-color:#000!important;background:#111!important}.preview-contrast p{color:#fff!important}.preview-contrast button{background:#fff!important;color:#000!important;border:2px solid #000!important}.preview-overlay-cream{background:#fff7df!important}.preview-overlay-soft-yellow{background:#fffbe8!important}.preview-overlay-soft-blue{background:#edf6ff!important}.preview-overlay-soft-pink{background:#fff0f5!important}.preview-focus{background:#f2f4f7!important;border:3px solid #172033!important;box-shadow:0 0 0 5px rgba(23,32,51,.14)!important}.preview-focus:before{content:"FOCUS";display:block;font-size:8px;letter-spacing:.16em;font-weight:800;color:#172033;margin-bottom:6px}.preview-guide{position:relative}.preview-guide:after{content:"";position:absolute;left:-13px;right:-13px;top:var(--preview-guide-position,48%);height:38px;transform:translateY(-50%);background:var(--preview-guide-background,rgba(255,220,0,.55));border-top:2px solid rgba(80,65,0,.45);border-bottom:2px solid rgba(80,65,0,.45);pointer-events:none;z-index:4}.guide-colour-options{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.guide-colour-options button{min-height:42px;border:1px solid #e1e5ea;border-radius:12px;background:#fff;color:#4d5969;font-size:12px}.guide-colour-options button.selected{border-color:#e6c85a;background:#fff8d8;color:#5b4e00;font-weight:700}.guide-colour-options button i{display:block;width:22px;height:12px;border-radius:6px;margin:0 auto 5px;border:1px solid #dfe4ea}.guide-colour-options button[data-choice="clear"] i{background:transparent}.guide-colour-options button[data-choice="yellow"] i{background:rgba(255,220,0,.42)}.guide-colour-options button[data-choice="blue"] i{background:rgba(80,160,255,.30)}.guide-colour-options button[data-choice="pink"] i{background:rgba(255,100,160,.28)}.settings-actions{display:flex;gap:9px;margin:20px 0 4px;align-items:center}.settings-actions>*{flex:1}.setting-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 0;margin-top:12px;border-top:1px solid #edf0f3}.setting-toggle-row span{display:grid;gap:3px}.setting-toggle-row strong{font-size:13px;color:#273244}.setting-toggle-row small{font-size:11px;color:#8a94a3}.setting-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer}.setting-switch input{position:absolute;opacity:0;pointer-events:none}.setting-switch i{width:44px;height:26px;border-radius:999px;background:#d9dee5;position:relative;display:block;flex:0 0 44px}.setting-switch i:after{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(16,24,40,.2);transition:transform .18s ease}.setting-switch input:checked+i{background:#172033}.setting-switch input:checked+i:after{transform:translateX(18px)}.setting-switch em{font-style:normal;font-size:11px;font-weight:700;color:#667085;min-width:22px}.setting-switch-large{justify-content:center;min-height:44px;padding:0 10px}.setting-switch-large em{font-size:13px}.settings-section{margin-top:20px}.settings-label{font-size:10px;letter-spacing:.13em;color:#98a2b3;font-weight:700;margin-bottom:8px}.settings-segment{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.settings-segment button,.overlay-options button{min-height:42px;border:1px solid #e1e5ea;border-radius:12px;background:#fff;color:#4d5969;font-size:12px}.settings-segment button.selected,.overlay-options button.selected{border-color:#e6c85a;background:#fff8d8;color:#5b4e00;font-weight:700}.setting-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid #edf0f3}.setting-toggle span{display:grid;gap:3px}.setting-toggle strong{font-size:13px;color:#273244}.setting-toggle small{font-size:11px;color:#8a94a3}.setting-toggle input{position:absolute;opacity:0}.setting-toggle i{width:44px;height:26px;border-radius:999px;background:#d9dee5;position:relative;flex:0 0 44px}.setting-toggle i:after{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(16,24,40,.2);transition:transform .18s ease}.setting-toggle input:checked+i{background:#172033}.setting-toggle input:checked+i:after{transform:translateX(18px)}.overlay-options{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.overlay-options button{display:grid;gap:6px;place-items:center;padding:7px}.overlay-options button i{width:22px;height:22px;border-radius:50%;background:#fff;border:1px solid #dfe4ea}.overlay-options button[data-overlay="soft-green"] i{background:#effaf1}.overlay-options button[data-overlay="soft-yellow"] i{background:#fffbe8}.overlay-options button[data-overlay="soft-blue"] i{background:#edf6ff}.overlay-options button[data-overlay="soft-pink"] i{background:#fff0f5}
      html[data-evia-reading-guide="off"] #evia-reading-guide{display:none!important}
      #evia-reading-guide{position:fixed;left:0;right:0;height:54px;transform:translateY(-50%);border-top:2px solid rgba(23,32,51,.5);border-bottom:2px solid rgba(23,32,51,.5);box-shadow:0 0 0 1px rgba(255,255,255,.55) inset;pointer-events:auto;touch-action:none;cursor:grab;z-index:9998}
      #evia-reading-guide:active{cursor:grabbing}
      html[data-evia-overlay="soft-green"] #app,html[data-evia-overlay="soft-green"] #modal-root,html[data-evia-overlay="soft-green"] #welcome-screen{background:#effaf1!important}
      html[data-evia-overlay="soft-yellow"] #app,html[data-evia-overlay="soft-yellow"] #modal-root,html[data-evia-overlay="soft-yellow"] #welcome-screen{background:#fffbe8!important}
      html[data-evia-overlay="soft-blue"] #app,html[data-evia-overlay="soft-blue"] #modal-root,html[data-evia-overlay="soft-blue"] #welcome-screen{background:#edf6ff!important}
      html[data-evia-overlay="soft-pink"] #app,html[data-evia-overlay="soft-pink"] #modal-root,html[data-evia-overlay="soft-pink"] #welcome-screen{background:#fff0f5!important}
      html[data-evia-overlay="soft-green"] body:after,html[data-evia-overlay="soft-yellow"] body:after,html[data-evia-overlay="soft-blue"] body:after,html[data-evia-overlay="soft-pink"] body:after{content:"";position:fixed;inset:0;pointer-events:none;z-index:900}
      html[data-evia-overlay="soft-green"] body:after{background:rgba(239,250,241,.42)}
      html[data-evia-overlay="soft-yellow"] body:after{background:rgba(255,251,232,.42)}
      html[data-evia-overlay="soft-blue"] body:after{background:rgba(237,246,255,.42)}
      html[data-evia-overlay="soft-pink"] body:after{background:rgba(255,240,245,.42)}
      #welcome-screen{position:fixed;inset:0;z-index:2000;background:#fffdfa;display:grid;place-items:center;opacity:0;transition:opacity .45s ease}#welcome-screen.visible{opacity:1}#welcome-screen.leaving{opacity:0}.welcome-inner{text-align:center;position:relative;display:flex;flex-direction:column;align-items:center;gap:22px}.welcome-avatar .evia-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px}.welcome-avatar .evia-face i{display:block;width:28px;height:38px;border:4px solid #e6b800;border-radius:50%;position:relative;transform-origin:center}.welcome-avatar .evia-face i:first-child{animation:welcomeEyeA 7s ease-in-out infinite}.welcome-avatar .evia-face i:nth-child(2){animation:welcomeEyeB 7s ease-in-out infinite}@keyframes welcomeEyeA{0%,12%{transform:translate(0,0) rotate(0)}20%,31%{transform:translate(4px,1px) rotate(8deg)}40%,50%{transform:translate(-3px,-2px) rotate(-7deg)}61%,72%{transform:translate(2px,2px) rotate(5deg)}82%,100%{transform:translate(0,0) rotate(0)}}@keyframes welcomeEyeB{0%,12%{transform:translate(0,0) rotate(0)}20%,31%{transform:translate(4px,1px) rotate(8deg)}40%,50%{transform:translate(-3px,-2px) rotate(-7deg)}61%,72%{transform:translate(2px,2px) rotate(5deg)}82%,100%{transform:translate(0,0) rotate(0)}}.welcome-avatar .evia-face{pointer-events:none}
      .welcome-avatar{width:138px;height:138px;border-radius:50%;border:6px solid #e6b800;background:#fffdfa;box-shadow:0 18px 45px rgba(16,24,40,.12);display:grid;place-items:center;position:relative;z-index:2;overflow:hidden;cursor:pointer}.welcome-pulse{position:absolute;width:150px;height:150px;border:1px solid #e6b800;border-radius:50%;animation:welcomePulse 2.1s ease-out infinite}.welcome-copy h2{font-size:28px;letter-spacing:-.045em;margin:0 0 5px}.welcome-copy p{font-size:15px;color:#7b8797;margin:0}.welcome-app-hidden{opacity:0!important;transition:opacity .56s ease!important}.welcome-app-hidden.welcome-app-visible{opacity:1!important}.welcome-main-hidden,.welcome-main-visible,.welcome-revealed{animation:none!important}@keyframes welcomePulse{0%{transform:scale(.75);opacity:.75}70%,100%{transform:scale(1.25);opacity:0}}@keyframes revealScreen{from{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){#app.welcome-app-hidden,#welcome-screen,.welcome-flying,.welcome-revealed{animation:none!important;transition:none!important}.welcome-pulse{animation:none!important}    `;
    document.head.appendChild(style);
    welcome();
  }
  let readAloudPanel=null;
  function stopReadAloud(){
    try{if("speechSynthesis" in window)window.speechSynthesis.cancel()}catch(e){}
    if(readAloudPanel){readAloudPanel.classList.remove("evia-read-aloud-active");readAloudPanel=null}
  }
  function speakPanel(panel){
    if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined")return;
    const spoken=(panel.innerText||"").replace(/\\s+/g," ").trim();
    if(!spoken)return;
    if(readAloudPanel===panel&&window.speechSynthesis.speaking){stopReadAloud();return}
    stopReadAloud();
    const utterance=new SpeechSynthesisUtterance(spoken);
    utterance.lang="en-GB";
    utterance.rate=0.95;
    utterance.onend=()=>{if(readAloudPanel===panel){panel.classList.remove("evia-read-aloud-active");readAloudPanel=null}};
    utterance.onerror=()=>{if(readAloudPanel===panel){panel.classList.remove("evia-read-aloud-active");readAloudPanel=null}};
    readAloudPanel=panel;
    panel.classList.add("evia-read-aloud-active");
    window.speechSynthesis.speak(utterance);
  }
  function findReadAloudPanel(target){
    const panel=target.closest(".card,.profile-sheet,.settings-preview-card,.evidence-entry,.welcome-copy,.chat-message,.panel,.section,.screen,#screen > *,#modal-root > *");
    if(!panel)return null;
    if(!document.body.contains(panel))return null;
    return panel;
  }
  function initReadAloud(){
    if(window.__eviaReadAloudInitialised)return;
    window.__eviaReadAloudInitialised=true;
    document.addEventListener("dblclick",e=>{
      if(e.target.closest("button,a,input,textarea,select,label,canvas,[contenteditable=true]"))return;
      const panel=findReadAloudPanel(e.target);
      if(panel)speakPanel(panel);
    });
    document.addEventListener("click",e=>{
      if(Date.now()-(window.__eviaLastTouchRead||0)<550)return;
      if(e.detail!==2)return;
      if(e.target.closest("button,a,input,textarea,select,label,canvas,[contenteditable=true]"))return;
      const panel=findReadAloudPanel(e.target);
      if(panel)speakPanel(panel);
    });
    document.addEventListener("touchend",e=>{
      const t=e.target;
      if(t.closest("button,a,input,textarea,select,label,canvas,[contenteditable=true]"))return;
      const panel=findReadAloudPanel(t);
      if(!panel)return;
      const now=Date.now();
      const last=window.__eviaLastTap;
      window.__eviaLastTap={time:now,panel};
      if(last&&last.panel===panel&&now-last.time<420){
        window.__eviaLastTap=null;
        window.__eviaLastTouchRead=Date.now();
        speakPanel(panel);
      }
    },{passive:true});
    const style=document.createElement("style");
    style.textContent=".evia-read-aloud-active{outline:2px solid #e6b800!important;outline-offset:4px}.evia-read-aloud-active:before{content:\"READING ALOUD\";display:block;font-size:9px;letter-spacing:.12em;font-weight:800;color:#8a6b00;margin-bottom:7px}";
    document.head.appendChild(style);
  }

  // The profile script is loaded at the end of index.html, so the DOM is already
  // available. Initialise immediately rather than relying on a later load event.
  // The guard above prevents duplicate initialisation if the load event also fires.
  try{initEviaProfile()}catch(e){console.error("Evia profile initialisation failed",e)}
  window.addEventListener("load",()=>{
    try{initEviaProfile()}catch(e){console.error("Evia profile initialisation failed",e)}
  });

})();