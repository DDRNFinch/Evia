/* Evia7 first-run demo: choose a course, complete the one-time PPE unit, then a guided tour of Progress, My course, Teach me, Rewards, Evia and Profile. */
(function(){
  const KEY="evia7-onboarding";
  const PPE_UNIT="Personal protective equipment";
  const nvqOn=()=>!!(window.eviaNvq&&window.eviaNvq.on());
  const ppeCodes=()=>nvqOn()?["102.1.2","102.1.4"]:["K2","S2"]; /* NVQ: using H&S control equipment, and why and when to use it */
  const MAX_PHOTOS=4;
  const COURSES=[
    {key:"bricklayer",label:"Bricklayer",sub:"Brickwork and blockwork",c:"#d9643a",
      ic:'<svg viewBox="0 0 24 24"><rect x="3" y="13.5" width="8" height="5.5" rx="1"/><rect x="13" y="13.5" width="8" height="5.5" rx="1"/><rect x="8" y="6.5" width="8" height="5.5" rx="1"/></svg>'},
    {key:"site",label:"Site Carpenter",sub:"Carpentry on site",c:"#2f80ed",
      ic:'<svg viewBox="0 0 24 24"><path d="M2.5 12 12 4l9.5 8"/><path d="M5.5 10v9.5h13V10"/><path d="M12 4v15.5M5.5 14.5 12 9l6.5 5.5"/></svg>'},
    {key:"joiner",label:"Bench Joiner",sub:"Joinery in the workshop",c:"#b7791f",
      ic:'<svg viewBox="0 0 24 24"><path d="M3.5 15.5h17v3.5h-17z"/><path d="M6 15.5l2-5h8l2 5"/><path d="M13 10.5c0-2.5 1.5-4.5 4-5"/></svg>'},
    {key:"trowel3",label:"Trowel Occupations L3",sub:"NVQ Level 3 Diploma · City & Guilds",c:"#7c3aed",
      ic:'<svg viewBox="0 0 24 24"><path d="M11 13 4 20"/><path d="M11 13l3-9 7 7-9 3z"/></svg>'}
  ];
  const escHtml=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(_){return null}};
  const writeState=stage=>{try{localStorage.setItem(KEY,JSON.stringify({stage,updatedAt:new Date().toISOString()}))}catch(_){}};
  const firstName=()=>{try{return String(JSON.parse(localStorage.getItem("evia7-profile")||"{}").name||"").trim().split(/\s+/)[0]||""}catch(_){return""}};

  function injectStyles(){
    if(document.getElementById("evia-onboarding-styles"))return;
    const style=document.createElement("style");
    style.id="evia-onboarding-styles";
    style.textContent=`
      #evia-onboard-course{position:fixed;inset:0;z-index:10040;background:var(--bg,#fffdfa);display:flex;align-items:center;justify-content:center;padding:32px 20px;opacity:0;transition:opacity .4s ease;overflow:auto}
      #evia-onboard-course.visible{opacity:1}
      #evia-onboard-course.leaving{opacity:0}
      .evia-onboard-inner{max-width:420px;width:100%;text-align:center}
      .evia-onboard-kicker{font-size:11px;letter-spacing:.16em;color:#9aa3af;font-weight:800;margin-bottom:8px}
      .evia-onboard-inner h2{font-size:26px;margin:0 0 8px;letter-spacing:-.03em;color:#172033}
      .evia-onboard-inner p{font-size:14px;color:#7b8797;margin:0 0 24px;line-height:1.5}
      .evia-onboard-courses{display:grid;gap:12px;text-align:left}
      .evia-onboard-course{display:flex;align-items:center;gap:14px;width:100%;padding:14px 16px;border-radius:20px;border:2px solid #edf0f4;background:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(25,36,55,.05);color:#172033;font:inherit;transition:transform .12s ease,border-color .15s ease}
      .evia-onboard-course:active{transform:scale(.98)}
      .evia-onboard-course:hover,.evia-onboard-course:focus-visible{border-color:var(--c,var(--yellow))}
      .evia-onboard-course-dot{width:48px;height:48px;flex:0 0 48px;border-radius:15px;display:grid;place-items:center;background:var(--c);color:#fff;box-shadow:0 6px 14px color-mix(in srgb,var(--c) 35%,transparent)}
      .evia-onboard-course-dot svg{width:27px;height:27px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .evia-onboard-course-copy{flex:1;min-width:0;display:grid;gap:3px;text-align:left}
      .evia-onboard-course-copy strong{font-size:16.5px}
      .evia-onboard-course-copy small{font-size:12.5px;color:#7b8797}
      .evia-onboard-course-arrow{font-size:24px;color:#98a2b3}
      /* The very first screen: a welcome from Evia, then the course cards. */
      #evia-onboard-course.welcome{display:block;padding:0;background:#fffdfa}
      .ew-hero{position:relative;overflow:hidden;padding:max(44px,calc(env(safe-area-inset-top) + 28px)) 22px 76px;text-align:center;color:#fff;background:radial-gradient(130% 120% at 50% 0%,#3b3576 0%,#241f4d 55%,#16132f 100%)}
      .ew-hero::before{content:"";position:absolute;inset:0;opacity:.07;background-image:linear-gradient(#fff 2px,transparent 2px),linear-gradient(90deg,#fff 2px,transparent 2px),linear-gradient(90deg,#fff 2px,transparent 2px);background-size:64px 26px,64px 26px,64px 26px;background-position:0 0,0 0,32px 13px;mask-image:linear-gradient(transparent,#000 60%)}
      .ew-hero::after{content:"";position:absolute;left:50%;top:40px;width:260px;height:260px;margin-left:-130px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--yellow) 38%,transparent),transparent 68%);pointer-events:none}
      .ew-evia-wrap{position:relative;z-index:1;display:inline-block;animation:ewFloat 3.6s ease-in-out infinite}
      html body .ew-evia{width:104px;height:104px;border-width:6px;background:#fffdfa;box-shadow:0 14px 34px rgba(0,0,0,.35)}
      html body .ew-evia .evia-face{gap:12px}
      html body .ew-evia .evia-face i{width:19px!important;height:25px!important;border-width:4.5px!important;animation:ewBlink 4.2s infinite}
      .ew-wave{position:absolute;right:-18px;top:-4px;font-size:30px;transform-origin:70% 80%;animation:ewWave 2.2s ease-in-out .6s 2}
      .ew-say{position:relative;z-index:1;display:inline-block;margin:18px auto 0;padding:10px 16px;border-radius:18px;background:#fff;color:#172033;font-size:15px;font-weight:700;box-shadow:0 8px 20px rgba(0,0,0,.25)}
      .ew-say::before{content:"";position:absolute;left:50%;top:-7px;width:14px;height:14px;margin-left:-7px;background:#fff;transform:rotate(45deg);border-radius:3px}
      .ew-title{position:relative;z-index:1;margin:18px 0 6px;font-size:30px;line-height:1.1;font-weight:800;letter-spacing:-.035em}
      .ew-title span{color:var(--yellow)}
      .ew-sub{position:relative;z-index:1;margin:0 auto;max-width:330px;font-size:14.5px;line-height:1.5;color:rgba(255,255,255,.75)}
      .ew-chips{position:relative;z-index:1;display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-top:18px}
      .ew-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 12px 7px 9px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);font-size:12.5px;font-weight:700;color:#fff}
      .ew-chip svg{width:17px;height:17px;fill:none;stroke:var(--yellow);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .ew-pick{position:relative;z-index:2;max-width:440px;margin:-44px auto 0;padding:22px 18px calc(28px + env(safe-area-inset-bottom));border-radius:28px 28px 0 0;background:#fffdfa;text-align:left}
      .ew-pick h2{margin:0 4px 4px;font-size:22px;letter-spacing:-.02em;color:#172033}
      .ew-pick>p{margin:0 4px 16px;font-size:13.5px;color:#7b8797;line-height:1.45}
      .ew-in{opacity:0;transform:translateY(14px);animation:ewIn .55s cubic-bezier(.2,.8,.3,1) forwards;animation-delay:calc(var(--d,0) * 90ms + 150ms)}
      @keyframes ewIn{to{opacity:1;transform:none}}
      @keyframes ewFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @keyframes ewWave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(18deg)}40%,80%{transform:rotate(-10deg)}}
      @keyframes ewBlink{0%,46%,50%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}
      @media (prefers-reduced-motion:reduce){.ew-evia-wrap,.ew-wave,html body .ew-evia .evia-face i{animation:none}.ew-in{animation:none;opacity:1;transform:none}}

      body.evia-onboarding .bottom-nav,body.evia-onboarding .evia-fab,body.evia-onboarding #profile-btn{pointer-events:none}
      body.evia-onboarding .bottom-nav{opacity:.55}
      body.evia-onboarding #screen{padding-bottom:230px}

      .evia-guide{position:fixed;z-index:60;left:50%;bottom:calc(max(14px,env(safe-area-inset-bottom)) + 84px);width:min(520px,calc(100% - 32px));transform:translate(-50%,10px);opacity:0;background:#fff;border:1px solid #e9edf2;border-radius:22px;padding:14px 16px;box-shadow:0 14px 38px rgba(16,24,40,.16);transition:opacity .25s ease,transform .25s ease}
      .evia-guide.show{opacity:1;transform:translate(-50%,0)}
      .evia-guide:after{content:"";position:absolute;left:50%;bottom:-9px;width:18px;height:18px;background:#fff;border-right:1px solid #e9edf2;border-bottom:1px solid #e9edf2;transform:translateX(-50%) rotate(45deg);border-radius:3px}
      .evia-guide-kicker,.evia-guide-inline .evia-guide-kicker{font-size:10px;letter-spacing:.14em;color:var(--yellow-ink);font-weight:800;margin-bottom:5px}
      .evia-guide-text{font-size:14px;line-height:1.5;color:#273244}
      .evia-guide-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
      .evia-guide-top .evia-guide-kicker{margin-bottom:0}
      .evia-guide-skip{border:0;background:none;min-height:36px;padding:6px 2px 6px 10px;font:inherit;font-size:12.5px;font-weight:700;color:#667085;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
      .evia-guide-actions{display:flex;justify-content:flex-end;margin-top:10px}
      .evia-guide-actions button{min-height:40px;padding:8px 18px;border-radius:13px;background:#1b2435;color:#fff;font-weight:700;font-size:13px;cursor:pointer}
      body.evia-keyboard-editing .evia-guide{opacity:0;pointer-events:none}
      .evia-guide-inline{margin:4px 0 16px;padding:14px 16px;border-radius:18px;background:var(--soft);border:1px solid var(--yellow-line)}
      .evia-guide-inline .evia-guide-text{font-size:13.5px}

      .evia-guide-target{scroll-margin-top:90px;outline:3px solid var(--yellow)!important;outline-offset:4px;border-radius:14px;animation:eviaGuidePulse 1.6s ease-in-out infinite}
      @keyframes eviaGuidePulse{0%,100%{outline-offset:3px}50%{outline-offset:7px}}

      .evia-ppe-ksbs{display:grid;gap:8px;margin-top:14px}
      .evia-ppe-ksb{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid #e9edf2;border-radius:14px;background:#fff}
      .evia-ppe-ksb .code{flex:0 0 auto}
      .evia-ppe-ksb span:last-child{font-size:12px;line-height:1.45;color:#475467}
      .evia-ppe-page .pack-actions{grid-template-columns:1fr}
      @media(prefers-reduced-motion:reduce){.evia-guide-target{animation:none}.evia-guide{transition:none}}
    `;
    document.head.appendChild(style);
  }

  /* ---------- Evia speech bubble ---------- */
  const SKIP_BUTTON='<button type="button" class="evia-guide-skip">Skip demo</button>';
  let guideEl=null;
  function clearTargets(){document.querySelectorAll(".evia-guide-target").forEach(el=>el.classList.remove("evia-guide-target"))}
  function hideGuide(){
    clearTargets();
    if(guideEl){const el=guideEl;guideEl=null;el.classList.remove("show");setTimeout(()=>el.remove(),260)}
  }
  function guide(html,opts={}){
    injectStyles();
    clearTargets();
    if(!guideEl){
      guideEl=document.createElement("div");
      guideEl.className="evia-guide";
      guideEl.setAttribute("role","status");
      guideEl.setAttribute("aria-live","polite");
      document.body.appendChild(guideEl);
      requestAnimationFrame(()=>requestAnimationFrame(()=>guideEl&&guideEl.classList.add("show")));
    }
    guideEl.innerHTML='<div class="evia-guide-top"><div class="evia-guide-kicker">EVIA · GETTING STARTED</div>'+SKIP_BUTTON+'</div><div class="evia-guide-text">'+html+'</div>'+
      (opts.button?'<div class="evia-guide-actions"><button type="button" id="evia-guide-next">'+escHtml(opts.button)+'</button></div>':"");
    if(opts.button)document.getElementById("evia-guide-next").onclick=opts.onNext;
    (opts.targets||[]).forEach(el=>el&&el.classList.add("evia-guide-target"));
  }

  /* ---------- Step 1: choose course ---------- */
  function showCoursePicker(){
    injectStyles();
    const root=document.createElement("div");
    root.id="evia-onboard-course";
    root.className="welcome";
    const I=d=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>';
    root.innerHTML='<section class="ew-hero">'+
        '<div class="ew-evia-wrap ew-in" style="--d:0"><span class="evia-mini ew-evia" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span><span class="ew-wave" aria-hidden="true">👋</span></div><br>'+
        '<div class="ew-say ew-in" style="--d:1">Hi, I’m Evia!</div>'+
        '<h1 class="ew-title ew-in" style="--d:2">Your apprenticeship, <span>sorted</span></h1>'+
        '<p class="ew-sub ew-in" style="--d:3">I’ll help you build your portfolio, learn your trade and get ready for your end-point assessment.</p>'+
        '<div class="ew-chips ew-in" style="--d:4">'+
          '<span class="ew-chip">'+I('<rect x="3" y="6.5" width="18" height="14" rx="3"/><path d="M8 6.5l1.4-2h5.2l1.4 2"/><circle cx="12" cy="13.5" r="3.5"/>')+'Capture evidence</span>'+
          '<span class="ew-chip">'+I('<path d="M6.5 3h12v15h-12a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z"/><path d="M4.5 20a2 2 0 0 0 2 1.5h12V18"/>')+'Learn with games</span>'+
          '<span class="ew-chip">'+I('<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12"/><path d="M12 8.5C10.5 5 6.8 4.2 6.8 6.4c0 1.6 2.7 2.1 5.2 2.1ZM12 8.5c1.5-3.5 5.2-4.3 5.2-2.1 0 1.6-2.7 2.1-5.2 2.1Z"/>')+'Earn rewards</span>'+
        '</div></section>'+
      '<section class="ew-pick"><h2 class="ew-in" style="--d:5">Which course are you on?</h2><p class="ew-in" style="--d:5">I’ll set up your units and everything you need to evidence.</p>'+
      '<div class="evia-onboard-courses">'+COURSES.filter(c=>C[c.key]).map((c,i)=>
        '<button type="button" class="evia-onboard-course ew-in" style="--d:'+(6+i)+';--c:'+c.c+'" data-onboard-course="'+c.key+'"><span class="evia-onboard-course-dot" aria-hidden="true">'+c.ic+'</span><span class="evia-onboard-course-copy"><strong>'+escHtml(c.label)+'</strong><small>'+escHtml(c.sub)+'</small></span><span class="evia-onboard-course-arrow" aria-hidden="true">›</span></button>'
      ).join("")+'</div></section>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    root.querySelectorAll("[data-onboard-course]").forEach(b=>b.onclick=()=>{
      course=b.dataset.onboardCourse;persist();
      const nvq=nvqOn();
      writeState(nvq?"optional":"unit");
      const next=()=>nvq?showOptionalPicker():pickersThen(showPpeUnit);
      if(window.eviaHandoff)window.eviaHandoff(root,next);else{root.remove();next()}
    });
  }

  /* ---------- Step 2: one-time PPE unit ---------- */
  const compressPhoto=file=>new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{
      const max=1280,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
      const c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));
      c.getContext("2d",{alpha:false}).drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      c.toBlob(blob=>blob?resolve(blob):reject(new Error("Photo compression failed")),"image/jpeg",.78);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Photo could not be read"))};
    img.src=url;
  });
  const blobToDataUrl=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)});
  function ppeKsbs(){const c=ppeCodes();return allK().filter(x=>c.includes(x[0]))}

  /* ---------- NVQ only: choose the optional unit(s) ---------- */
  function showOptionalPicker(){
    injectStyles();
    const root=document.createElement("div");
    root.id="evia-onboard-course";
    root.innerHTML='<div class="evia-onboard-inner">'+
      '<div class="evia-onboard-kicker">TROWEL OCCUPATIONS L3</div>'+
      '<h2>Which optional unit are you doing?</h2>'+
      '<p>You need at least one. Most learners do <strong>690 Repair and maintenance</strong>. You can change this later in Profile.</p>'+
      '<div class="nvq-opts">'+window.eviaNvq.optionalHtml()+'</div>'+
      '<button type="button" class="primary evia-onboard-go" id="nvq-opt-go">Continue</button></div>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    const go=root.querySelector("#nvq-opt-go"),upd=()=>{go.disabled=!window.eviaNvq.readOptional(root).length};
    root.querySelectorAll(".nvq-opt input").forEach(i=>i.onchange=upd);upd();
    go.onclick=()=>{
      window.eviaNvq.setOptional(window.eviaNvq.readOptional(root));
      writeState("unit");
      const next=()=>pickersThen(showPpeUnit);
      if(window.eviaHandoff)window.eviaHandoff(root,next);else{root.remove();next()}
    };
  }
  /* After the course: Evia's shape and colour, if not chosen yet, then carry on. */
  function pickersThen(next){
    const shape=window.eviaShapeHasBeenPicked&&window.eviaShapeHasBeenPicked(),colour=window.eviaThemeHasBeenPicked&&window.eviaThemeHasBeenPicked();
    const doColour=()=>{if(!colour&&window.eviaShowThemePicker)window.eviaShowThemePicker(next);else next()};
    if(!shape&&window.eviaShowShapePicker)window.eviaShowShapePicker(doColour);else doColour();
  }

  function showPpeUnit(){
    injectStyles();
    document.body.classList.add("evia-onboarding");
    screen="unit";
    document.querySelectorAll("[data-nav]").forEach(b=>b.classList.remove("active"));
    const profileBtn=document.getElementById("profile-btn");if(profileBtn)profileBtn.style.display="none";
    $("#page-title").textContent=PPE_UNIT;
    const photos=[];
    $("#screen").innerHTML=
      '<div class="evidence-pack-page evia-ppe-page">'+
        '<div class="evidence-heading">'+
          '<div class="evidence-label">INDUCTION UNIT · ONE TIME ONLY</div>'+
          '<h2>'+PPE_UNIT+'</h2>'+
          '<p>Show that you have the right PPE and know how to use it. Take a photo of yourself <strong>wearing your PPE</strong>, then explain what each item is used for.</p>'+
          '<div class="evia-ppe-ksbs">'+ppeKsbs().map(k=>'<div class="evia-ppe-ksb"><span class="code">'+escHtml(k[0])+'</span><span>'+escHtml(k[1])+'</span></div>').join("")+'</div>'+
        '</div>'+
        '<div class="evidence-photo-actions" id="ppe-photo-actions">'+
          '<label class="evidence-photo-button" for="ppe-camera"><span class="evidence-photo-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.5" width="18" height="14" rx="3"></rect><path d="M8 6.5l1.4-2h5.2l1.4 2"></path><circle cx="12" cy="13.5" r="3.5"></circle></svg></span><span>Camera</span><input id="ppe-camera" type="file" accept="image/*" capture="user"></label>'+
          '<label class="evidence-photo-button" for="ppe-gallery"><span class="evidence-photo-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"></rect><circle cx="8.5" cy="9.5" r="1.6"></circle><path d="M4 16.5l5-5 4 4 3-3 4 4"></path></svg></span><span>Gallery</span><input id="ppe-gallery" type="file" accept="image/*" multiple></label>'+
        '</div>'+
        '<div class="evidence-thumbs" id="ppe-photos"></div>'+
        '<section class="evidence-section">'+
          '<div class="evidence-section-title">THINGS TO CAPTURE</div>'+
          '<div class="compact-prompts">you wearing your PPE · hard hat · hi-vis · safety boots · gloves · eye protection · ear protection · dust mask (RPE)</div>'+
        '</section>'+
        '<div class="evidence-section-divider"></div>'+
        '<section class="evidence-section writeup-section">'+
          '<div class="evidence-section-title">THINGS TO MENTION</div>'+
          '<div class="compact-prompts">each item of PPE · what it protects you from · when you need to wear it · checking it for damage · storing and replacing it · RPE and dust · site rules</div>'+
          '<textarea id="write" placeholder="Explain your PPE and what it’s for, e.g. My hard hat protects my head from falling objects…"></textarea>'+
        '</section>'+
        '<div class="pack-actions"><button class="primary" id="ppe-submit" type="button" disabled>Submit to Portfolio</button></div>'+
        '<p class="submit-hint" id="ppe-hint">Add at least one photo and complete the write-up before submitting.</p>'+
      '</div>';
    window.scrollTo(0,0);
    const actions=$("#ppe-photo-actions"),thumbs=$("#ppe-photos"),write=$("#write"),submit=$("#ppe-submit"),hint=$("#ppe-hint");
    let stage="intro";
    const ready=()=>photos.length>0&&write.value.trim().length>0;
    const step=()=>{
      submit.disabled=!ready();
      hint.textContent=ready()?"Your evidence is ready to submit.":"Add at least one photo and complete the write-up before submitting.";
      if(stage==="intro")return;
      if(!photos.length){
        stage="photo";
        guide('First, take a photo of yourself <strong>wearing your PPE</strong> using <strong>Camera</strong>, or upload one from your <strong>Gallery</strong>.',{targets:[actions]});
      }else if(!write.value.trim()){
        if(stage!=="write"){stage="write";guide('Great photo! Now use the text box to <strong>explain your PPE</strong> — what each item is and what it protects you from.',{targets:[write]});}
      }else if(stage!=="submit"){
        stage="submit";
        guide('Looking good. When you are happy with your write-up, tap <strong>Submit to Portfolio</strong>.',{targets:[submit]});
      }
    };
    const renderThumbs=()=>{
      thumbs.innerHTML=photos.map((p,i)=>'<div class="photo-item"><img class="thumb" src="'+p.url+'" alt="PPE evidence photo"><button type="button" class="photo-remove" data-ppe-remove="'+i+'" aria-label="Remove photo">×</button></div>').join("");
      thumbs.querySelectorAll("[data-ppe-remove]").forEach(b=>b.onclick=()=>{const [p]=photos.splice(+b.dataset.ppeRemove,1);if(p)URL.revokeObjectURL(p.url);renderThumbs();step()});
    };
    const addFiles=async files=>{
      const chosen=[...files].filter(f=>f&&f.size&&/^image\//i.test(f.type)).slice(0,Math.max(0,MAX_PHOTOS-photos.length));
      if(!chosen.length)return;
      try{
        for(const f of chosen){const blob=await compressPhoto(f);photos.push({blob,url:URL.createObjectURL(blob)})}
      }catch(err){console.error("Evia PPE photo failed",err);alert("That photo could not be added. Please try again.")}
      renderThumbs();step();
    };
    $("#ppe-camera").onchange=e=>{addFiles(e.target.files).finally(()=>e.target.value="")};
    const camLabel=document.querySelector('label[for="ppe-camera"]');
    if(camLabel&&window.eviaCamera&&window.eviaCamera.supported())camLabel.onclick=e=>{e.preventDefault();window.eviaCamera.open({title:"Personal protective equipment",prompts:["you wearing your PPE","hard hat","hi-vis","safety boots","gloves","eye protection","ear protection","dust mask (RPE)"],onDone:files=>addFiles(files)})};
    $("#ppe-gallery").onchange=e=>{addFiles(e.target.files).finally(()=>e.target.value="")};
    write.oninput=step;
    let saving=false;
    submit.onclick=async()=>{
      if(saving||!ready())return;
      saving=true;submit.disabled=true;submit.textContent="Saving to Portfolio…";
      try{
        const photoIds=[],inline=[];
        for(const p of photos){
          if(window.eviaStoreEvidencePhoto)photoIds.push(await window.eviaStoreEvidencePhoto(p.blob));
          else inline.push(await blobToDataUrl(p.blob));
        }
        const profile=JSON.parse(localStorage.getItem("evia7-profile")||"{}");
        const entry={id:Date.now()+"-"+Math.random().toString(36).slice(2,8),c:course,u:PPE_UNIT,d:new Date().toLocaleString("en-GB"),p:inline,w:write.value.trim(),k:ppeCodes(),learnerProfile:{name:profile.name||"",start:profile.start||"",end:profile.end||""},signature:profile.signature||"",savedAt:new Date().toISOString(),photoCount:photos.length,induction:true};
        if(photoIds.length)entry.photoIds=photoIds;
        evidence.push(entry);persist();
        photos.forEach(p=>URL.revokeObjectURL(p.url));
        writeState("progress");
        showProgressStep();
      }catch(err){
        console.error("Evia PPE submission failed",err);
        saving=false;submit.disabled=false;submit.textContent="Submit to Portfolio";
        alert("Evia could not save this evidence to your portfolio. Please try again.");
      }
    };
    guide('Welcome to your first unit, <strong>'+PPE_UNIT+'</strong>. It is a one-time unit, but every unit in Evia works the same way — I will show you how to collect evidence.',{button:"Show me",onNext:()=>{stage="guided";step()}});
  }

  /* ---------- Step 3: progress ---------- */
  function showProgressStep(){
    document.body.classList.add("evia-onboarding");
    nav("progress");
    const name=firstName(),[c1,c2]=ppeCodes(),nvq=nvqOn();
    setTimeout(()=>{
      const card=document.getElementById("pv-ksb");
      document.querySelectorAll(".pv-card").forEach(c=>c.classList.add("pv-in"));
      if(card)card.scrollIntoView({block:"center",behavior:"smooth"});
      guide('Your PPE evidence is saved'+(name?", "+escHtml(name):"")+'. This is <strong>My progress</strong>: it shows how you’re getting on, and every card opens up for more detail. Your PPE work has already ticked off '+(nvq?'criteria <strong>1.2</strong> and <strong>1.4</strong> in Unit 102':'<strong>'+escHtml(c1||"K2")+'</strong> and <strong>'+escHtml(c2||"S2")+'</strong>')+'. Keep capturing jobs and these fill up.',{
        targets:[card],button:"Next",onNext:()=>{writeState("portfolio");showPortfolioStep()}
      });
    },200);
  }

  /* ---------- Step 4: my course ---------- */
  const closePanels=()=>{const m=document.getElementById("modal-root");if(m&&!m.querySelector(".profile-sheet"))m.innerHTML=""};
  function showPortfolioStep(){
    document.body.classList.add("evia-onboarding");closePanels();
    nav("course");
    window.scrollTo(0,0);
    const tile=document.querySelector("#screen .unit-card[data-u]");
    guide('This is <strong>My course</strong>. Open any unit to capture evidence. Everything you save stays inside that unit, underneath, ready to look back at or share with your assessor.',{
      targets:[tile],button:"Next",onNext:()=>{
        const grid=document.getElementById("ui-logs-grid");
        if(grid)grid.scrollIntoView({block:"center",behavior:"smooth"});
        guide('Your <strong>learning logs</strong> (off-the-job hours) are kept here too, ready to download for your assessor. Progress reviews are at the top of <strong>My progress</strong>.',{
          targets:[grid],button:"Next",onNext:()=>{writeState("teach");showTeachStep()}
        });
      }
    });
  }

  /* ---------- Teach me and Rewards ---------- */
  function showTeachStep(){
    document.body.classList.add("evia-onboarding");closePanels();
    nav("teach");window.scrollTo(0,0);
    setTimeout(()=>{
      const list=document.querySelector("#screen .tt-list");
      guide('This is <strong>Teach me</strong>: short lessons for your course, maths and English, with quick games to check what you know. Every lesson earns you <strong>coins</strong>.',{
        targets:[list],button:"Next",onNext:()=>{writeState("rewards");showRewardsStep()}
      });
    },450);
  }
  function showRewardsStep(){
    document.body.classList.add("evia-onboarding");closePanels();
    nav("rewards");window.scrollTo(0,0);
    setTimeout(()=>{
      const bal=document.querySelector("#screen .rw-bal");
      guide('And this is <strong>Rewards</strong>. Spend your coins on new looks for me, loot boxes and mini games. You earn them from lessons, your off-the-job hours and good evidence.',{
        targets:[bal],button:"Next",onNext:()=>{writeState("evia");showEviaStep()}
      });
    },450);
  }

  /* ---------- Step 5: Evia ---------- */
  function showEviaStep(){
    document.body.classList.add("evia-onboarding");closePanels();
    window.scrollTo(0,0);
    const fab=document.getElementById("evia-fab");
    if(window.eviaMood)window.eviaMood("happy");
    guide('And this is me. Tap me any time: I can <strong>check your evidence</strong>, give you a <strong>quick review</strong> of how you’re doing, show your <strong>targets</strong> and help you practise for your <strong>EPA</strong>.',{
      targets:[fab],button:"Next",onNext:()=>{writeState("profile");showProfileStep()}
    });
  }

  /* ---------- Step 6: profile ---------- */
  function showProfileStep(){
    document.body.classList.add("evia-onboarding");closePanels();
    hideGuide();
    if(!window.eviaOpenProfile){finish();return}
    const modal=document.getElementById("modal-root");
    let seen=false;
    if(profileObserver)profileObserver.disconnect();
    /* Evia walks through the profile one section at a time: name, dates, signature, then Save. */
    const STEPS=[
      ["#profile-name","First, type your <strong>name</strong> here. It goes on all your evidence."],
      ["#profile-start","Now your apprenticeship <strong>start and end dates</strong>. I use them to tell you if you’re on track."],
      ["#signature-pad","Sign here with your finger. Your <strong>signature</strong> is added to the evidence you save."],
      ["#save-profile","That’s it. Tap <strong>Save</strong> and you’re all set."]
    ];
    let at=-1;
    const showStep=(sheet,i)=>{
      at=i;const [sel,text]=STEPS[i],target=sheet.querySelector(sel);
      let box=sheet.querySelector(".evia-guide-inline");
      if(!box){box=document.createElement("div");box.className="evia-guide-inline";box.setAttribute("role","status")}
      box.innerHTML='<div class="evia-guide-top"><div class="evia-guide-kicker">EVIA · LAST STEP · '+(i+1)+' OF '+STEPS.length+'</div>'+SKIP_BUTTON+'</div><div class="evia-guide-text">'+text+'</div>'+(i<STEPS.length-1?'<div class="evia-guide-actions"><button type="button" id="evia-guide-pnext">Next</button></div>':"");
      /* Sit Evia's note just above the section it's talking about. */
      const anchor=target&&(target.closest(".pf-group")||target.closest(".pf-head")||target.closest(".pf-save"));
      if(anchor)anchor.insertAdjacentElement(sel==="#profile-name"?"afterend":"beforebegin",box);else sheet.prepend(box);
      sheet.querySelectorAll(".evia-guide-target").forEach(el=>el.classList.remove("evia-guide-target"));
      const hl=sel==="#profile-start"?target&&target.closest(".pf-dates"):sel==="#signature-pad"?target&&target.closest(".pf-sign"):target;
      if(hl)hl.classList.add("evia-guide-target");
      const nb=box.querySelector("#evia-guide-pnext");if(nb)nb.onclick=()=>showStep(sheet,i+1);
      setTimeout(()=>{(hl||box).scrollIntoView({block:"center",behavior:"smooth"});if(sel==="#profile-name"&&target&&!target.value)target.focus({preventScroll:true})},120);
    };
    const decorate=()=>{
      const sheet=modal.querySelector(".profile-sheet");
      if(sheet){
        seen=true;
        if(at<0||!sheet.querySelector(".evia-guide-inline"))showStep(sheet,Math.max(0,at));
      }else if(seen&&!modal.innerHTML.trim()){
        observer.disconnect();finish();
      }
    };
    const observer=profileObserver=new MutationObserver(decorate);
    observer.observe(modal,{childList:true,subtree:true});
    window.eviaOpenProfile();
    decorate();
  }

  let profileObserver=null;
  /* Skip demo: available from every step after choosing a course. */
  function skipDemo(){
    if(profileObserver){profileObserver.disconnect();profileObserver=null}
    const modal=document.getElementById("modal-root");
    if(modal&&modal.querySelector(".evia-guide-inline"))modal.innerHTML="";
    finish();
  }
  document.addEventListener("click",e=>{if(e.target.closest(".evia-guide-skip"))skipDemo()});

  function finish(){
    writeState("done");
    hideGuide();
    document.body.classList.remove("evia-onboarding");
    nav("course");
    if(typeof showEvidenceToast==="function")showEvidenceToast("You're all set");
  }

  function resume(stage){
    if(stage==="course")showCoursePicker();
    else if(stage==="optional"&&nvqOn())showOptionalPicker();
    else if(stage==="unit")showPpeUnit();
    else if(stage==="progress")showProgressStep();
    else if(stage==="portfolio")showPortfolioStep();
    else if(stage==="teach")showTeachStep();
    else if(stage==="rewards")showRewardsStep();
    else if(stage==="evia")showEviaStep();
    else if(stage==="profile")showProfileStep();
  }

  /* Called after the shape/colour pickers. Returns true when the demo takes over from the welcome screen. */
  window.eviaMaybeStartOnboarding=function(firstRun){
    let forced=false;
    try{
      const params=new URLSearchParams(location.search);
      if(params.has("demo")){
        forced=true;params.delete("demo");
        history.replaceState(null,"",location.pathname+(params.toString()?"?"+params:"")+location.hash);
      }
      /* Shared test pages only pass a plain #anchor, so #demo replays it too. */
      if(location.hash==="#demo"){forced=true;history.replaceState(null,"",location.pathname+location.search)}
    }catch(_){}
    const state=readState();
    if(forced||(!state&&firstRun)){writeState("course");resume("course");return true}
    if(state&&state.stage&&state.stage!=="done"){resume(state.stage);return true}
    return false;
  };
})();
