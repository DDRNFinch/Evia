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
      : '<div class="'+(large?"welcome-avatar profile-placeholder":"profile-photo profile-placeholder")+'"><span>+</span></div>';
  }

  function openProfile(){
    const p=get();
    document.getElementById("modal-root").innerHTML=
      '<div class="profile-overlay"><section class="profile-sheet">'+
      '<div class="profile-head"><div><div class="profile-kicker">YOUR PROFILE</div><h2>Apprentice profile</h2></div><button class="profile-close" id="profile-close">×</button></div>'+
      '<div class="profile-avatar-row">'+avatarMarkup(p,false)+'<div><strong>Profile picture</strong><p>Add a photo so your profile is recognisable.</p><label class="profile-upload">Choose photo<input id="avatar-file" type="file" accept="image/*"></label></div></div>'+
      '<div class="profile-fields">'+
      '<label>Name<input id="profile-name" value="'+esc(p.name)+'" placeholder="Your name"></label>'+
      '<div class="profile-dates"><label>Start date<input id="profile-start" type="date" value="'+esc(p.start)+'"></label><label>End date<input id="profile-end" type="date" value="'+esc(p.end)+'"></label></div>'+
      '</div>'+
      '<div class="profile-block"><div class="profile-kicker">YOUR COURSE</div><div class="course-options">'+Object.keys(C).map(k=>'<button type="button" class="course-option '+(k===course?"selected":"")+'" data-profile-course="'+k+'">'+esc(C[k].name)+'<span>›</span></button>').join("")+'</div></div>'+
      '<div class="profile-block"><div class="profile-kicker">MATHS & ENGLISH</div><p>Choose which subjects Evia should include in your tests and progress reviews.</p><label class="study-check"><input id="profile-maths" type="checkbox"><span>I am studying Maths</span></label><label class="study-check"><input id="profile-english" type="checkbox"><span>I am studying English</span></label></div>'+
      '<div class="profile-block"><button type="button" class="settings-entry" id="open-settings"><span><strong>Accessibility & settings</strong><small>Personalise how Evia looks, reads and behaves</small></span><span aria-hidden="true">›</span></button></div><div class="profile-block"><div class="profile-kicker">YOUR SIGNATURE</div><p>Write your signature with your finger. It will be attached to saved evidence with the time and date.</p><div class="signature-wrap"><canvas id="signature-pad" width="900" height="260"></canvas><button type="button" id="clear-signature">Clear</button></div></div>'+
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
  const defaultSettings={textScale:"100",dyslexiaFont:false,letterSpacing:false,lineSpacing:false,readingGuide:false,focusMode:false,highContrast:false,reducedMotion:false,colourOverlay:"none"};
  function getSettings(){return Object.assign({},defaultSettings,readObject(SETTINGS_KEY,{}))}
  function saveSettings(s){localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));applySettings(s)}
  function applySettings(s){const root=document.documentElement;root.style.setProperty("--evia-text-scale",(Number(s.textScale||100)/100).toFixed(2));root.classList.toggle("evia-dyslexia-font",!!s.dyslexiaFont);root.classList.toggle("evia-letter-spacing",!!s.letterSpacing);root.classList.toggle("evia-line-spacing",!!s.lineSpacing);root.classList.toggle("evia-reading-guide",!!s.readingGuide);root.classList.toggle("evia-focus-mode",!!s.focusMode);root.classList.toggle("evia-high-contrast",!!s.highContrast);root.classList.toggle("evia-reduced-motion",!!s.reducedMotion);root.dataset.eviaOverlay=s.colourOverlay||"none"}
  function openSettings(){
    const s=getSettings();
    const opts=[["dyslexiaFont","Dyslexia-friendly text","Use a clearer, more readable typeface"],["letterSpacing","More letter spacing","Give characters more breathing room"],["lineSpacing","More line spacing","Increase space between lines of text"],["readingGuide","Reading guide","A subtle guide across the page"],["focusMode","Focus mode","Reduce visual distraction"],["highContrast","High contrast","Increase text and interface contrast"],["reducedMotion","Reduce motion","Use calmer transitions and animations"]];
    document.getElementById("modal-root").innerHTML='<div class="profile-overlay settings-overlay"><section class="profile-sheet settings-sheet"><div class="profile-head"><div><div class="profile-kicker">SETTINGS</div><h2>Accessibility</h2></div><button class="profile-close" id="settings-close">×</button></div><p class="settings-intro">Personalise Evia to make it easier to read, understand and use. Your choices are saved on this device.</p><div class="settings-section"><div class="settings-label">TEXT SIZE</div><div class="settings-segment">'+["100","115","130","150"].map(v=>'<button type="button" data-text-size="'+v+'" class="'+(s.textScale===v?"selected":"")+'">'+v+'%</button>').join("")+'</div></div><div class="settings-section"><div class="settings-label">READABILITY</div>'+opts.map(o=>'<label class="setting-toggle"><span><strong>'+o[1]+'</strong><small>'+o[2]+'</small></span><input type="checkbox" data-setting="'+o[0]+'" '+(s[o[0]]?"checked":"")+'><i aria-hidden="true"></i></label>').join("")+'</div><div class="settings-section"><div class="settings-label">COLOUR OVERLAY</div><div class="overlay-options">'+[["none","None"],["cream","Cream"],["soft-yellow","Soft yellow"],["soft-blue","Soft blue"],["soft-pink","Soft pink"]].map(o=>'<button type="button" data-overlay="'+o[0]+'" class="'+(s.colourOverlay===o[0]?"selected":"")+'"><i></i><span>'+o[1]+'</span></button>').join("")+'</div></div><div class="settings-section settings-about"><div class="settings-label">EVIA</div><p>Version 7.0</p><small>Accessibility preferences do not change course requirements or assessment decisions.</small></div></section></div>';
    document.getElementById("settings-close").onclick=()=>openProfile();
    document.querySelectorAll("[data-text-size]").forEach(b=>b.onclick=()=>{s.textScale=b.dataset.textSize;saveSettings(s);openSettings()});
    document.querySelectorAll("[data-setting]").forEach(i=>i.onchange=()=>{s[i.dataset.setting]=i.checked;saveSettings(s)});
    document.querySelectorAll("[data-overlay]").forEach(b=>b.onclick=()=>{s.colourOverlay=b.dataset.overlay;saveSettings(s);openSettings()});
  }

  function canvasHasInk(canvas){
    const d=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height).data;
    for(let i=3;i<d.length;i+=4)if(d[i]>20)return true;
    return false;
  }

  function evidenceEntry(e){
    return '<article class="evidence-entry">'+
      '<div class="entry-meta">'+esc(e.d||e.savedAt||"")+'</div>'+
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

  function openEvidencePackWindow(mine,title){
    const p=get();
    const learner=p.name||"Apprentice";
    const printWindow=window.open("","_blank");
    if(!printWindow){alert("Please allow pop-ups to download your evidence pack.");return false;}
    printWindow.document.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>'+
      '@page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#172033;font:11pt -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.45}.pack-header{border-bottom:2px solid #e6b800;padding-bottom:14px;margin-bottom:20px}.eyebrow{font-size:9pt;letter-spacing:.12em;color:#667085;font-weight:700}.pack-header h1{font-size:24pt;letter-spacing:-.04em;margin:4px 0}.pack-details{display:grid;grid-template-columns:1fr 1fr;gap:5px;color:#475467}.evidence-entry{break-inside:avoid;page-break-inside:avoid;border:1px solid #e4e7ec;border-radius:12px;padding:15px;margin:0 0 14px}.entry-meta{font-size:9pt;letter-spacing:.08em;text-transform:uppercase;color:#667085}.evidence-entry h2{font-size:16pt;margin:4px 0 10px}.evidence-photos{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0}.evidence-photos img{width:100%;height:115px;object-fit:cover;border-radius:7px;border:1px solid #eaecf0}.evidence-notes{white-space:normal;color:#344054}.evidence-ksbs{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}.evidence-ksbs span{background:#fff7d6;border-radius:999px;padding:3px 7px;font:700 8pt -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#675600}.evidence-signature{border-top:1px solid #eaecf0;margin-top:13px;padding-top:8px;display:grid;gap:3px;font-size:8pt;color:#667085}.evidence-signature img{width:140px;height:38px;object-fit:contain;object-position:left center}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>'+
      '<header class="pack-header"><div class="eyebrow">EVIA · EVIDENCE PACK</div><h1>'+esc(learner)+'</h1><div class="pack-details"><span><strong>Course:</strong> '+esc(data().name)+'</span><span><strong>Standard:</strong> '+esc(data().std)+'</span>'+(p.start?'<span><strong>Start date:</strong> '+esc(p.start)+'</span>':"")+(p.end?'<span><strong>End date:</strong> '+esc(p.end)+'</span>':"")+(mine.length===1?'<span><strong>Unit:</strong> '+esc(mine[0].u)+'</span>':"")+'</div></header>'+mine.slice().reverse().map(evidenceEntry).join("")+'</body></html>');
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
    const p=get();b.innerHTML=p.avatar?'<img src="'+p.avatar+'" alt="Profile">':'<span class="profile-default" aria-hidden="true">+</span>';
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
    const root=document.createElement("div");root.id="welcome-screen";root.style.opacity="1";root.style.zIndex="2000";
    root.innerHTML='<div class="welcome-inner">'+
      '<div class="welcome-avatar evia-welcome-face"><span class="evia-face"><i></i><i></i></span></div>'+
      '<div class="welcome-pulse"></div>'+
      '<div class="welcome-copy"><div class="welcome-small">EVIA</div><h2>Hi'+(p.name?", "+esc(String(p.name).trim().split(/\\s+/)[0]):"")+'.</h2><p>What do you want to work on today?</p></div>'+
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
    try{refreshProfileButton()}catch(e){}
    const profileButton=document.getElementById("profile-btn");
    if(profileButton)profileButton.onclick=openProfile;
    window.eviaOpenProfile=openProfile;
    const style=document.createElement("style");
    style.textContent=`
      .course-picker{display:none!important}
      .course-options{display:grid;gap:7px;margin-top:9px}.course-option{display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 14px;border:1px solid #e6e9ed;border-radius:14px;background:#fff;text-align:left;font-size:13px;color:#4e5969}.course-option.selected{background:#fff8d8;border-color:#ead277;color:#5f5200}.course-option span{font-size:20px;color:#a2aab5}
      .profile-btn{overflow:hidden;padding:0;display:grid;place-items:center}.profile-btn img,.profile-photo{width:100%;height:100%;object-fit:cover;border-radius:50%}.profile-default{font-size:17px;color:#596273}
      .profile-overlay{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.18);backdrop-filter:blur(12px);display:flex;align-items:flex-end}.profile-sheet{width:100%;max-height:90vh;overflow:auto;background:#fbfaf7;border-radius:28px 28px 0 0;padding:22px 20px calc(24px + env(safe-area-inset-bottom));box-sizing:border-box;box-shadow:0 -18px 55px rgba(16,24,40,.16)}
      .profile-head,.profile-avatar-row,.profile-dates,.profile-actions{display:flex;align-items:center;justify-content:space-between;gap:14px}.profile-kicker,.welcome-small{font-size:10px;letter-spacing:.14em;color:#9aa3af;font-weight:700}.profile-head h2{margin:5px 0 0;font-size:22px;letter-spacing:-.03em}.profile-close{width:34px;height:34px;border:0;border-radius:50%;background:#eef1f4;font-size:22px;color:#667085}.profile-avatar-row{justify-content:flex-start;margin:22px 0}.profile-avatar-row p,.profile-block p{font-size:12px;color:#7b8797;line-height:1.5;margin:5px 0 10px}.profile-photo{width:72px;height:72px;border:1px solid #e2e6eb;flex:0 0 72px}.profile-placeholder{display:grid;place-items:center;background:#f2f4f7;color:#a0aaba;font-size:24px}.profile-upload{display:inline-block;padding:9px 12px;border:1px solid #dfe4ea;border-radius:12px;background:#fff;font-size:12px;color:#4d5969}.profile-upload input{display:none}.profile-fields{display:grid;gap:12px}.profile-fields label,.profile-dates label{font-size:11px;color:#788496}.profile-fields input,.profile-dates input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border:1px solid #dfe4ea;border-radius:13px;background:#fff;font-size:14px}.profile-dates{align-items:stretch}.profile-dates label{flex:1}.profile-block{margin-top:22px}.signature-wrap{position:relative;margin-top:9px;background:#fff;border:1px solid #dfe4ea;border-radius:15px;overflow:hidden}#signature-pad{display:block;width:100%;height:150px;touch-action:none}#clear-signature{position:absolute;right:8px;top:8px;border:0;border-radius:10px;background:#f1f3f5;padding:7px 9px;font-size:11px;color:#667085}.profile-actions{margin-top:20px}.profile-actions .primary,.profile-actions .secondary{flex:1}
      .welcome-avatar{cursor:pointer}.welcome-avatar .evia-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px}.welcome-avatar .evia-face i{display:block;flex:0 0 30px;width:30px;height:38px;border:4.5px solid var(--yellow);border-radius:50%;position:relative;transform-origin:center}.welcome-avatar .evia-face i:after{display:none}.welcome-avatar .evia-face i:first-child{animation:eyeLookA 7s ease-in-out infinite}.welcome-avatar .evia-face i:nth-child(2){animation:eyeLookB 7s ease-in-out infinite}
      #welcome-screen{position:fixed;inset:0;z-index:2000;background:#fffdfa;display:grid;place-items:center;opacity:0;transition:opacity .45s ease}#welcome-screen.visible{opacity:1}#welcome-screen.leaving{opacity:0}.welcome-inner{text-align:center;position:relative;display:flex;flex-direction:column;align-items:center;gap:22px}.welcome-avatar{width:138px;height:138px;border-radius:50%;border:6px solid #e6b800;background:#fffdfa;box-shadow:0 18px 45px rgba(16,24,40,.12);display:grid;place-items:center;position:relative;z-index:2;overflow:hidden;cursor:pointer}.welcome-pulse{position:absolute;width:150px;height:150px;border:1px solid #e6b800;border-radius:50%;animation:welcomePulse 2.1s ease-out infinite}.welcome-copy h2{font-size:28px;letter-spacing:-.045em;margin:0 0 5px}.welcome-copy p{font-size:15px;color:#7b8797;margin:0}.welcome-app-hidden{opacity:0!important;transition:opacity .56s ease!important}.welcome-app-hidden.welcome-app-visible{opacity:1!important}.welcome-main-hidden,.welcome-main-visible,.welcome-revealed{animation:none!important}@keyframes welcomePulse{0%{transform:scale(.75);opacity:.75}70%,100%{transform:scale(1.25);opacity:0}}@keyframes revealScreen{from{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){#app.welcome-app-hidden,#welcome-screen,.welcome-flying,.welcome-revealed{animation:none!important;transition:none!important}.welcome-pulse{animation:none!important}    `;
    document.head.appendChild(style);
    welcome();
  }
  // The profile script is loaded at the end of index.html, so the DOM is already
  // available. Initialise immediately rather than relying on a later load event.
  // The guard above prevents duplicate initialisation if the load event also fires.
  try{initEviaProfile()}catch(e){console.error("Evia profile initialisation failed",e)}
  window.addEventListener("load",()=>{
    try{initEviaProfile()}catch(e){console.error("Evia profile initialisation failed",e)}
  });

})();