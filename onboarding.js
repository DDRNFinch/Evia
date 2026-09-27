/* Evia7 first-run tour, in the Teach me style: short steps, one line each, about a minute.
   The course comes from Nisia (eviaData.enrolment()); a welcome, the one-time PPE unit (saved to Supporting evidence,
   linked to its KSBs), then "tap this" steps round My course, Progress, Teach me, Rewards, Evia and the profile. */
(function(){
  const KEY="evia7-onboarding";
  const nvqOn=()=>!!(window.eviaNvq&&window.eviaNvq.on());
  const ppeCodes=()=>nvqOn()?["102.1.2","102.1.4"]:["K2","S2"]; /* NVQ: using H&S control equipment, and why and when to use it */
  const COURSES=[
    {key:"bricklayer",label:"Bricklayer",sub:"Brickwork and blockwork",
      ic:'<svg viewBox="0 0 24 24"><rect x="3" y="13.5" width="8" height="5.5" rx="1"/><rect x="13" y="13.5" width="8" height="5.5" rx="1"/><rect x="8" y="6.5" width="8" height="5.5" rx="1"/></svg>'},
    {key:"site",label:"Site Carpenter",sub:"Carpentry on site",
      ic:'<svg viewBox="0 0 24 24"><path d="M2.5 12 12 4l9.5 8"/><path d="M5.5 10v9.5h13V10"/><path d="M12 4v15.5M5.5 14.5 12 9l6.5 5.5"/></svg>'},
    {key:"joiner",label:"Bench Joiner",sub:"Joinery in the workshop",
      ic:'<svg viewBox="0 0 24 24"><path d="M3.5 15.5h17v3.5h-17z"/><path d="M6 15.5l2-5h8l2 5"/><path d="M13 10.5c0-2.5 1.5-4.5 4-5"/></svg>'},
    {key:"trowel3",label:"Trowel Occupations L3",sub:"NVQ Level 3 Diploma · City & Guilds",
      ic:'<svg viewBox="0 0 24 24"><path d="M11 13 4 20"/><path d="M11 13l3-9 7 7-9 3z"/></svg>'}
  ];
  const escHtml=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(_){return null}};
  const writeState=stage=>{try{localStorage.setItem(KEY,JSON.stringify({stage,updatedAt:new Date().toISOString()}))}catch(_){}};
  const firstName=()=>String(window.eviaData.learner().name||"").trim().split(/\s+/)[0]||"";

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
      .evia-onboard-course{display:flex;align-items:center;gap:14px;width:100%;padding:14px 16px;border-radius:20px;border:1px solid rgba(16,24,40,.08);background:#fff;cursor:pointer;box-shadow:0 1px 2px rgba(16,24,40,.04),0 6px 20px rgba(16,24,40,.05);color:#172033;font:inherit;transition:transform .12s ease,border-color .15s ease}
      .evia-onboard-course:active{transform:scale(.98)}
      .evia-onboard-course:hover,.evia-onboard-course:focus-visible{border-color:var(--yellow)}
      .evia-onboard-course-dot{width:46px;height:46px;flex:0 0 46px;border-radius:14px;display:grid;place-items:center;background:var(--soft);color:var(--yellow-ink)}
      .evia-onboard-course-dot svg{width:27px;height:27px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .evia-onboard-course-copy{flex:1;min-width:0;display:grid;gap:3px;text-align:left}
      .evia-onboard-course-copy strong{font-size:16.5px}
      .evia-onboard-course-copy small{font-size:12.5px;color:#7b8797}
      .evia-onboard-course-arrow{font-size:24px;color:#98a2b3}
      /* The very first screen: a welcome from Evia, then the course cards. */
      #evia-onboard-course.welcome{display:block;padding:0;background:#fffdfa}
      .ew-hero{position:relative;overflow:hidden;padding:max(40px,calc(env(safe-area-inset-top) + 26px)) 22px 56px;text-align:center;color:#172033;background:radial-gradient(120% 85% at 50% 0%,color-mix(in srgb,var(--yellow) 13%,#fffdfa) 0%,#fffdfa 72%)}
      .ew-hero::before{content:"";position:absolute;inset:0;opacity:.05;background-image:linear-gradient(#172033 1px,transparent 1px),linear-gradient(90deg,#172033 1px,transparent 1px);background-size:48px 20px;mask-image:linear-gradient(#000,transparent 75%);-webkit-mask-image:linear-gradient(#000,transparent 75%)}
      .ew-hero::after{content:"";position:absolute;left:50%;top:30px;width:240px;height:240px;margin-left:-120px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--yellow) 22%,transparent),transparent 68%);pointer-events:none}
      .ew-evia-wrap{position:relative;z-index:1;display:inline-block;animation:ewFloat 3.6s ease-in-out infinite}
      html body .ew-evia{width:100px;height:100px;border-width:6px;background:#fffdfa;box-shadow:0 12px 30px rgba(16,24,40,.12)}
      html body .ew-evia .evia-face{gap:12px}
      html body .ew-evia .evia-face i{width:18px!important;height:24px!important;border-width:4.5px!important;animation:ewBlink 4.2s infinite}
      .ew-say{position:relative;z-index:1;display:inline-block;margin:16px auto 0;padding:9px 16px;border-radius:16px;background:#fff;color:#172033;font-size:14.5px;font-weight:700;border:1px solid rgba(16,24,40,.07);box-shadow:0 6px 18px rgba(16,24,40,.07)}
      .ew-say::before{content:"";position:absolute;left:50%;top:-6px;width:12px;height:12px;margin-left:-6px;background:#fff;transform:rotate(45deg);border-left:1px solid rgba(16,24,40,.07);border-top:1px solid rgba(16,24,40,.07);border-radius:2px 0 0 0}
      .ew-pick{position:relative;z-index:2;max-width:440px;margin:-18px auto 0;padding:8px 18px calc(28px + env(safe-area-inset-bottom));background:transparent;text-align:left}
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
      /* The thing to tap stays tappable, and stands out. */
      body.evia-onboarding .evia-guide-target{pointer-events:auto;opacity:1}
      .evia-guide-target{scroll-margin-top:90px;outline:3px solid var(--yellow)!important;outline-offset:4px;border-radius:14px;animation:eviaGuidePulse 1.6s ease-in-out infinite}
      @keyframes eviaGuidePulse{0%,100%{outline-offset:3px}50%{outline-offset:7px}}
      body.evia-onboarding .bottom-nav:has(.evia-guide-target){opacity:1}
      /* During the tour only what Evia asks for can be used: the thing she's pointing at (if she says tap it), her notes,
         and the date wheel she opens. Pointed-at things with a Next button are only looked at. */
      body.ob-lock #app,body.ob-lock #modal-root,body.ob-lock .bottom-nav,body.ob-lock .evia-fab,body.ob-lock #profile-btn{pointer-events:none}
      body.ob-lock .evia-guide-target,body.ob-lock .evia-guide-target *,body.ob-lock .dw-overlay,body.ob-lock .dw-overlay *{pointer-events:auto}
      body.ob-lock .evia-guide-target.ob-look,body.ob-lock .evia-guide-target.ob-look *{pointer-events:none}
      body.ob-lock .profile-sheet{overflow:hidden}
      .profile-sheet.ob-profile .evia-guide-target{scroll-margin-top:24px}
      /* Save sits at the end of the profile during the tour, so it isn't under Evia; she scrolls to it last. */
      .profile-sheet.ob-profile .pf-save{position:static;margin-top:16px}
      #ob-spot i,#ob-spot b{position:fixed;z-index:10010;display:block}
      #ob-spot i{background:rgba(15,23,42,.22);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
      #ob-spot b{background:transparent}
      #ob-spot.none i{background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none}
      #ob-spot.none i:first-child{inset:0!important;width:auto!important;height:auto!important}
      /* Evia's button stays in view, above the blur, for her speech bubble. */
      body.ob-lock .evia-fab{z-index:10020!important;opacity:1!important;translate:none!important}
      body.evia-onboarding .bottom-nav:has(.evia-guide-target) button:not(.evia-guide-target){opacity:.45}

      /* Teach me style screens (the welcome and the PPE unit) */
      .ob-lesson{z-index:10035}
      .ob-skip{margin-left:auto;border:0;background:none;min-height:36px;padding:6px 4px;font:inherit;font-size:13px;font-weight:700;color:var(--ui-muted,#667085);cursor:pointer}
      .ob-lesson .tm-bar strong+.ob-skip{margin-left:0}
      .ob-body{display:flex;flex-direction:column;gap:14px;max-width:520px;margin:0 auto}
      .ob-body .tm-hero{padding-top:28px}
      .ob-body .tm-says p{font-size:16px}
      .ob-prompts{margin:0 2px;font-size:13px;line-height:1.6;color:var(--ui-muted,#667085)}
      .ob-photo img{display:block;width:100%;max-height:52vh;object-fit:cover;border-radius:20px;border:1px solid var(--pm-hair,rgba(16,24,40,.08))}
      .ob-photo-actions{margin-top:4px}
      .ob-text{width:100%;min-height:150px;box-sizing:border-box;padding:14px 15px;border:1px solid #dfe4ea;border-radius:16px;background:#fff;font:inherit;font-size:15px;line-height:1.5;resize:vertical}

      /* The tour card: one line at a time, above the menu */
      .ob-card{position:fixed;z-index:10030;left:14px;bottom:calc(max(14px,env(safe-area-inset-bottom)) + 96px);width:min(420px,calc(100% - 28px));transform:translateY(12px);opacity:0;
        display:flex;flex-direction:column;gap:10px;padding:12px 14px 14px;border-radius:22px;background:#fff;border:1px solid var(--pm-hair,rgba(16,24,40,.08));box-shadow:0 16px 40px rgba(16,24,40,.16);transition:opacity .22s ease,transform .22s ease}
      .ob-card.show{opacity:1;transform:none}
      .ob-card::after{content:"";position:absolute;bottom:-8px;left:var(--tail,50%);width:16px;height:16px;margin-left:-8px;background:#fff;border-right:1px solid var(--pm-hair,rgba(16,24,40,.08));border-bottom:1px solid var(--pm-hair,rgba(16,24,40,.08));transform:rotate(45deg)}
      .ob-card-top{display:flex;align-items:center;gap:10px}
      .ob-card-top .tm-prog{height:8px}
      .ob-card .tm-says p{font-size:15px}
      .ob-card .ob-next{width:100%}
      body.evia-keyboard-editing .ob-card{opacity:0;pointer-events:none}
      @media(prefers-reduced-motion:reduce){.evia-guide-target{animation:none}.ob-card{transition:none}}
    `;
    document.head.appendChild(style);
  }

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
      writeState("ppe");
      const next=()=>pickersThen(startPpe);
      if(window.eviaHandoff)window.eviaHandoff(root,next);else{root.remove();next()}
    };
  }
  /* After the course: Evia's shape and colour, if not chosen yet, then carry on. */
  function pickersThen(next){
    const shape=window.eviaShapeHasBeenPicked&&window.eviaShapeHasBeenPicked(),colour=window.eviaThemeHasBeenPicked&&window.eviaThemeHasBeenPicked();
    const doColour=()=>{if(!colour&&window.eviaShowThemePicker)window.eviaShowThemePicker(next);else next()};
    if(!shape&&window.eviaShowShapePicker)window.eviaShowShapePicker(doColour);else doColour();
  }

  /* ---------- Welcome: the course comes from Nisia ----------
     Nisia enrols the learner (eviaData.enrolment(): course, name, dates), so they don't pick a course. Until Nisia is
     connected, the course picker below is the fallback. */
  const courseName=()=>{try{return C[course].name}catch(_){return ""}};
  const EVIA_BIG='<span class="tm-evia evia-mini xl" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span>';
  const EVIA_SM='<span class="tm-evia evia-mini sm" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span>';
  /* A full screen in the Teach me style: a bar (progress or a title), Evia, the content, and buttons at the bottom. */
  function lessonScreen(o){
    injectStyles();
    let root=document.getElementById("ob-lesson");
    if(!root){root=document.createElement("div");root.id="ob-lesson";root.className="tm ob-lesson";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");document.body.appendChild(root)}
    root.innerHTML='<header class="tm-bar tm-lbar">'+(o.prog!=null?'<span class="tm-prog" aria-hidden="true"><i style="width:'+o.prog+'%"></i></span>':'<strong>'+escHtml(o.title||"")+'</strong>')+
        '<button type="button" class="ob-skip" id="ob-skip">Skip</button></header>'+
      '<div class="tm-scroll"><div class="ob-body">'+o.body+'</div></div>'+
      '<footer class="tm-foot tm-row">'+o.buttons.map((b,i)=>'<button type="button" class="'+(b.primary?"primary":"secondary")+' tm-go" data-ob="'+i+'"'+(b.disabled?" disabled":"")+'>'+escHtml(b.label)+'</button>').join("")+'</footer>';
    root.querySelectorAll("[data-ob]").forEach(el=>el.onclick=()=>o.buttons[+el.dataset.ob].run());
    root.querySelector("#ob-skip").onclick=skipDemo;
    root.querySelector(".tm-scroll").scrollTop=0;
    return root;
  }
  const closeLesson=()=>{const r=document.getElementById("ob-lesson");if(r)r.remove()};

  async function applyEnrolment(en){
    await window.eviaPacks.ensure(en.course);
    const p={course:en.course};["name","start","end"].forEach(k=>{if(en[k])p[k]=en[k]});
    if(Array.isArray(en.nvqOptional)&&en.nvqOptional.length)p.nvqOptional=en.nvqOptional.slice();
    window.eviaData.put("learner",p);
  }
  function showWelcome(){
    const name=firstName();
    lessonScreen({title:"Welcome",
      body:'<div class="tm-hero">'+EVIA_BIG+'<p class="tm-say">Hi'+(name?" "+escHtml(name):"")+', I’m Evia. You’re on <strong>'+escHtml(courseName())+'</strong>.<br>Let me show you around. It takes a minute.</p></div>',
      buttons:[{label:"Let’s go",primary:true,run:()=>{closeLesson();afterCourse()}}]});
  }
  /* NVQ learners choose their optional unit unless Nisia already has it; then Evia's look, then the PPE unit. */
  function afterCourse(){
    const needOptional=nvqOn()&&!(window.eviaData.learner().nvqOptional||[]).length;
    if(needOptional){writeState("optional");showOptionalPicker();return}
    writeState("ppe");pickersThen(startPpe);
  }

  /* ---------- Fallback: pick the course (only until Nisia sends it) ---------- */
  function showCoursePicker(){
    injectStyles();
    const root=document.createElement("div");
    root.id="evia-onboard-course";
    root.className="welcome";
    root.innerHTML='<section class="ew-hero">'+
        '<div class="ew-evia-wrap ew-in" style="--d:0"><span class="evia-mini ew-evia" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span></div><br>'+
        '<div class="ew-say ew-in" style="--d:1">Hi, I’m Evia! Which course are you on?</div></section>'+
      '<section class="ew-pick"><div class="evia-onboard-courses">'+COURSES.filter(c=>window.eviaPacks.COURSES.includes(c.key)).map((c,i)=>
        '<button type="button" class="evia-onboard-course ew-in" style="--d:'+(2+i)+'" data-onboard-course="'+c.key+'"><span class="evia-onboard-course-dot" aria-hidden="true">'+c.ic+'</span><span class="evia-onboard-course-copy"><strong>'+escHtml(c.label)+'</strong><small>'+escHtml(c.sub)+'</small></span><span class="evia-onboard-course-arrow" aria-hidden="true">›</span></button>'
      ).join("")+'</div></section>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    root.querySelectorAll("[data-onboard-course]").forEach(b=>b.onclick=async()=>{
      /* The course's pack is downloaded first if it isn't on the phone (packs.js). */
      const k=b.dataset.onboardCourse;b.disabled=true;
      try{await window.eviaPacks.ensure(k)}catch(err){b.disabled=false;if(typeof showEvidenceToast==="function")showEvidenceToast(err.message,true);return}
      window.eviaData.put("learner",{course:k});
      if(window.eviaHandoff)window.eviaHandoff(root,afterCourse);else{root.remove();afterCourse()}
    });
  }

  /* ---------- The PPE unit, like a Teach me lesson ----------
     One photo of the learner in their PPE and a few words about it. It's saved once, as a PDF in Supporting evidence,
     linked to the KSBs it shows (and ticks them off). */
  const PPE_CAPTURE="hard hat · hi-vis · safety boots · gloves · eye and ear protection · dust mask";
  const PPE_MENTION="what each item protects you from · when you wear it · checking it for damage";
  const ppe={photo:null,url:"",text:""};
  function ksbLabel(){const c=ppeCodes();return nvqOn()?"Unit 102 criteria 1.2 and 1.4":"<strong>"+escHtml(c[0])+"</strong> and <strong>"+escHtml(c[1])+"</strong>"}
  function startPpe(){
    injectStyles();document.body.classList.add("evia-onboarding");
    const has=!!ppe.photo;
    const el=lessonScreen({prog:25,
      body:'<div class="tm-says">'+EVIA_SM+'<p>First job: show me your <strong>PPE</strong>. Take a photo of you wearing it.</p></div>'+
        (has?'<div class="ob-photo"><img src="'+ppe.url+'" alt="You in your PPE"></div>':
          '<div class="evidence-photo-actions ob-photo-actions">'+
            '<label class="evidence-photo-button" for="ob-camera"><span class="evidence-photo-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.5" width="18" height="14" rx="3"></rect><path d="M8 6.5l1.4-2h5.2l1.4 2"></path><circle cx="12" cy="13.5" r="3.5"></circle></svg></span><span>Camera</span><input id="ob-camera" type="file" accept="image/*" capture="user" hidden></label>'+
            '<label class="evidence-photo-button" for="ob-gallery"><span class="evidence-photo-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"></rect><circle cx="8.5" cy="9.5" r="1.6"></circle><path d="M4 16.5l5-5 4 4 3-3 4 4"></path></svg></span><span>Gallery</span><input id="ob-gallery" type="file" accept="image/*" hidden></label>'+
          '</div>')+
        '<p class="ob-prompts">'+escHtml(PPE_CAPTURE)+'</p>',
      buttons:(has?[{label:"Retake",run:()=>{URL.revokeObjectURL(ppe.url);ppe.photo=null;startPpe()}}]:[]).concat([{label:"Next",primary:true,disabled:!has,run:ppeWrite}])});
    const add=async files=>{const f=[...(files||[])].find(x=>x&&x.size&&/^image\//i.test(x.type));if(!f)return;
      try{ppe.photo=await compressPhoto(f);ppe.url=URL.createObjectURL(ppe.photo);startPpe()}catch(err){console.error("Evia PPE photo failed",err);alert("That photo could not be added. Please try again.")}};
    const cam=el.querySelector("#ob-camera"),gal=el.querySelector("#ob-gallery");
    if(cam)cam.onchange=e=>add(e.target.files);
    if(gal)gal.onchange=e=>add(e.target.files);
    const camLabel=el.querySelector('label[for="ob-camera"]');
    if(camLabel&&window.eviaCamera&&window.eviaCamera.supported())camLabel.onclick=e=>{e.preventDefault();window.eviaCamera.open({title:"Your PPE",prompts:PPE_CAPTURE.split("·"),onDone:files=>add(files)})};
  }
  function ppeWrite(){
    const el=lessonScreen({prog:60,
      body:'<div class="tm-says">'+EVIA_SM+'<p>Now tell me about it. What does each bit <strong>protect you from</strong>?</p></div>'+
        '<p class="ob-prompts">'+escHtml(PPE_MENTION)+'</p>'+
        '<textarea id="write" class="ob-text" rows="6" placeholder="e.g. My hard hat protects my head from falling objects…">'+escHtml(ppe.text)+'</textarea>',
      buttons:[{label:"Back",run:startPpe},{label:"Save",primary:true,disabled:!ppe.text.trim(),run:ppeSave}]});
    const box=el.querySelector("#write"),save=el.querySelector('[data-ob="1"]');
    box.oninput=()=>{ppe.text=box.value;save.disabled=!ppe.text.trim()};
  }
  /* The PPE page: the photo, what they wrote, the KSBs it shows, their name and signature. */
  async function ppePdf(){
    const {jsPDF}=await window.eviaLoadJsPdf(),T=window.eviaPdfText||(s=>String(s||"")),L=window.eviaData.learner();
    const doc=new jsPDF({unit:"mm",format:"a4"}),W=210,M=16;let y=22;
    doc.setFont("helvetica","bold");doc.setFontSize(20);doc.setTextColor(23,32,51);doc.text("PPE induction",M,y);y+=7;
    doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(102,112,133);
    doc.text(T([L.name,courseName(),new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})].filter(Boolean).join("  ·  ")),M,y);y+=8;
    const src=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(ppe.photo)});
    const img=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
    if(img){const maxW=W-2*M,maxH=120,s=Math.min(maxW/img.width,maxH/img.height),w=img.width*s,h=img.height*s;doc.addImage(src,"JPEG",M,y,w,h);y+=h+8}
    doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(23,32,51);doc.text("My PPE and what it's for",M,y);y+=6;
    doc.setFont("helvetica","normal");doc.setFontSize(10.5);const lines=doc.splitTextToSize(T(ppe.text),W-2*M);doc.text(lines,M,y);y+=lines.length*5+6;
    doc.setFont("helvetica","bold");doc.setFontSize(11);doc.text("Linked to",M,y);y+=6;
    doc.setFont("helvetica","normal");doc.setFontSize(9.5);doc.setTextColor(71,84,103);
    ppeKsbs().forEach(k=>{const t=doc.splitTextToSize(T(k[0]+"  "+k[1]),W-2*M);if(y+t.length*4.5>280){doc.addPage();y=20}doc.text(t,M,y);y+=t.length*4.5+2});
    const sig=window.eviaData.files.signature();
    if(sig){if(y>250){doc.addPage();y=20}y+=4;try{doc.addImage(sig,"PNG",M,y,50,14)}catch(_){}doc.setFontSize(9);doc.text("Signed",M,y+18)}
    return doc.output("blob");
  }
  let saving=false;
  async function ppeSave(){
    if(saving||!ppe.photo||!ppe.text.trim())return;saving=true;
    const btn=document.querySelector('#ob-lesson [data-ob="1"]');if(btn){btn.disabled=true;btn.textContent="Saving…"}
    try{
      const pdf=await ppePdf(),id="supporting-"+Date.now()+"-"+Math.random().toString(36).slice(2,8);
      await window.eviaSupportingFilePut({id,blob:pdf});
      window.eviaData.put("supporting",{id,course,title:"PPE induction",type:"document",mime:"application/pdf",filename:"PPE-induction.pdf",size:pdf.size,
        nvqUnit:nvqOn()?"102":undefined,criteria:ppeCodes(),induction:true});
      URL.revokeObjectURL(ppe.url);ppe.photo=null;ppe.text="";saving=false;
      writeState("tour:0");
      lessonScreen({prog:100,
        body:'<div class="tm-hero">'+EVIA_BIG+'<p class="tm-say">Saved to <strong>Supporting evidence</strong>. That’s '+ksbLabel()+' ticked off.<br>Every unit works like this.</p></div>',
        buttons:[{label:"Next",primary:true,run:()=>{closeLesson();tour(0)}}]});
    }catch(err){
      console.error("Evia PPE save failed",err);saving=false;
      if(btn){btn.disabled=false;btn.textContent="Save"}
      alert("Evia couldn’t save your PPE evidence. Please try again.");
    }
  }

  /* ---------- The tour: one short card per step ----------
     "Tap this" steps wait for the learner to tap the highlighted thing; the others have Next. */
  const $q=s=>document.querySelector(s);
  const TOUR=[
    {nav:"course",seen:"course",target:"#screen .unit-card[data-u]",tap:true,text:"This is <strong>My course</strong>. All your units are here. Tap one."},
    {seen:"unit",target:".ev-modes",text:"Add evidence two ways: <strong>I guide you</strong>, or <strong>free range</strong>. Your saved work shows underneath."},
    {target:'[data-nav="learning"]',tap:true,text:"Tap <strong>Progress</strong>."},
    {seen:"learning",text:"<strong>My progress</strong> shows how you’re doing on your course, and what to do next."},
    {target:'[data-nav="teach"]',tap:true,text:"Tap <strong>Teach me</strong>."},
    {seen:"teach",text:"Short lessons and games for your course. Each one earns <strong>coins</strong>."},
    {target:'[data-nav="rewards"]',tap:true,text:"Tap <strong>Rewards</strong>."},
    {seen:"rewards",text:"Spend your coins on new looks for me, and mini games."},
    {seen:"evia",target:"#evia-fab",text:"And this is me. Tap me any time for help, evidence checks and practice tests."},
    {nav:"course",target:"#profile-btn",tap:true,text:"Last one: tap your <strong>profile</strong>."},
    {profile:true,seen:"profile"}
  ];
  let card=null,tapWatch=null,profileObserver=null;
  /* The spotlight: everything but what Evia is pointing at is blurred, and can't be used. Four blurred panels frame it;
     when she's only showing it (Next), a clear cover stops it being tapped too. With nothing to point at, the page stays
     sharp but can't be used. */
  let spot=null,spotEl=null,spotLook=false,spotRaf=0;
  function spotlight(el,look){
    if(!spot){spot=document.createElement("div");spot.id="ob-spot";spot.innerHTML='<i></i><i></i><i></i><i></i><b></b>';document.body.appendChild(spot)}
    spotEl=el||null;spotLook=!!look;spot.classList.toggle("none",!el);
    cancelAnimationFrame(spotRaf);
    const [t,r,btm,l]=spot.querySelectorAll("i"),cover=spot.querySelector("b");
    const frame=()=>{
      if(spotEl&&document.body.contains(spotEl)){
        const R=spotEl.getBoundingClientRect(),p=6,x1=Math.max(0,R.left-p),y1=Math.max(0,R.top-p),x2=Math.min(innerWidth,R.right+p),y2=Math.min(innerHeight,R.bottom+p);
        t.style.cssText="left:0;top:0;width:100%;height:"+y1+"px";btm.style.cssText="left:0;top:"+y2+"px;width:100%;bottom:0";
        l.style.cssText="left:0;top:"+y1+"px;width:"+x1+"px;height:"+(y2-y1)+"px";r.style.cssText="left:"+x2+"px;top:"+y1+"px;right:0;height:"+(y2-y1)+"px";
        cover.style.cssText=spotLook?"left:"+x1+"px;top:"+y1+"px;width:"+(x2-x1)+"px;height:"+(y2-y1)+"px":"display:none";
      }
      placeBubble();   /* Evia's button may still be sliding in */
      spotRaf=requestAnimationFrame(frame);
    };
    frame();
  }
  function spotOff(){cancelAnimationFrame(spotRaf);spotEl=null;if(spot){spot.remove();spot=null}}
  /* Evia's words come from her button in the menu, as a speech bubble pointing at her. */
  function placeBubble(){
    if(!card)return;const fab=document.getElementById("evia-fab");if(!fab)return;
    const R=fab.getBoundingClientRect(),cw=card.offsetWidth;
    card.style.bottom=Math.max(12,innerHeight-R.top+12)+"px";
    const left=Math.max(14,Math.min(innerWidth-cw-14,R.left+R.width/2-cw/2));
    card.style.left=left+"px";card.style.setProperty("--tail",(R.left+R.width/2-left)+"px");
  }
  addEventListener("resize",placeBubble);
  const stopWatch=()=>{if(tapWatch)document.removeEventListener("click",tapWatch,true);tapWatch=null};
  const clearTargets=()=>document.querySelectorAll(".evia-guide-target").forEach(el=>el.classList.remove("evia-guide-target","ob-look"));
  function hideCard(){stopWatch();clearTargets();spotOff();if(card){const c=card;card=null;c.classList.remove("show");setTimeout(()=>c.remove(),220)}}
  function showCard(i,s){renderCard(Math.round((i+1)/TOUR.length*100),s.text,s.tap,()=>tour(i+1))}
  function renderCard(pct,text,tap,onNext){
    if(!card){card=document.createElement("div");card.className="ob-card";card.setAttribute("role","status");card.setAttribute("aria-live","polite");document.body.appendChild(card);requestAnimationFrame(()=>requestAnimationFrame(()=>card&&card.classList.add("show")))}
    card.innerHTML='<div class="ob-card-top"><span class="tm-prog" aria-hidden="true"><i style="width:'+pct+'%"></i></span><button type="button" class="ob-skip">Skip</button></div>'+
      '<div class="tm-says">'+EVIA_SM+'<p>'+text+'</p></div>'+
      (tap?'':'<button type="button" class="primary tm-go ob-next">Next</button>');
    card.querySelector(".ob-skip").onclick=skipDemo;
    const n=card.querySelector(".ob-next");if(n)n.onclick=onNext;
    placeBubble();requestAnimationFrame(placeBubble);
  }
  function tour(i){
    stopWatch();clearTargets();
    document.body.classList.add("evia-onboarding","ob-lock");
    if(i>=TOUR.length){finish();return}
    writeState("tour:"+i);
    const s=TOUR[i];
    /* What the tour explains doesn't get a first-visit note later (tips.js). */
    if(s.seen&&window.eviaTips)window.eviaTips.seen(s.seen);
    if(s.profile){profileStep();return}
    if(s.nav&&screen!==s.nav){const m=document.getElementById("modal-root");if(m)m.innerHTML="";nav(s.nav)}
    showCard(i,s);
    /* The screen may still be drawing: find the thing to point at, then highlight it. */
    let tries=0;
    const point=()=>{
      const el=s.target&&$q(s.target);
      if(s.target&&!el&&tries++<20){setTimeout(point,100);return}
      if(el){el.classList.add("evia-guide-target");if(!s.tap)el.classList.add("ob-look");el.scrollIntoView({block:"center",behavior:"smooth"})}
      spotlight(el,!s.tap);
      if(s.tap){
        tapWatch=e=>{if(!(e.target.closest&&e.target.closest(s.target)))return;stopWatch();clearTargets();setTimeout(()=>tour(i+1),500)};
        document.addEventListener("click",tapWatch,true);
        if(!el)setTimeout(()=>tour(i+1),300); /* nothing to tap on this phone: carry on */
      }
    };
    setTimeout(point,s.nav?350:120);
  }
  /* The profile, one part at a time. Evia stays at the bottom, as in the rest of the tour; the part she's talking about is
     scrolled up above her and is the only thing that can be used. Name and dates are skipped when Nisia already sent
     them. Saving finishes the tour. */
  const PSTEPS=[
    {key:"name",sel:"#profile-name",hl:"#profile-name",text:"Type your <strong>name</strong>. It goes on all your evidence."},
    {key:"dates",sel:"#profile-start",hl:".pf-dates",text:"Add the <strong>start and end dates</strong> of your apprenticeship."},
    {key:"sign",sel:"#signature-pad",hl:".pf-sign",text:"Sign in the box with your finger. It goes on the evidence you save."},
    {key:"save",sel:"#save-profile",hl:"#save-profile",tap:true,text:"All done. Tap <strong>Save</strong>."}
  ];
  function profileStep(){
    hideCard();
    if(!window.eviaOpenProfile){finish();return}
    const L=window.eviaData.learner();
    const steps=PSTEPS.filter(p=>!(p.key==="name"&&String(L.name||"").trim())&&!(p.key==="dates"&&L.start&&L.end));
    const modal=document.getElementById("modal-root");let seen=false,at=-1;
    if(profileObserver)profileObserver.disconnect();
    const place=sheet=>{
      const p=steps[at],target=sheet.querySelector(p.sel);if(!target)return;
      clearTargets();
      const hl=sheet.querySelector(p.hl)||target;hl.classList.add("evia-guide-target");spotlight(hl,false);
      renderCard(Math.round((at+1)/steps.length*100),p.text,p.tap,()=>{at++;place(sheet)});
      if(card)card.classList.add("ob-over");
      setTimeout(()=>{hl.scrollIntoView({block:p.key==="save"?"center":"start",behavior:"smooth"});if(p.key==="name"&&!target.value)target.focus({preventScroll:true})},150);
    };
    const decorate=()=>{
      const sheet=modal.querySelector(".profile-sheet");
      if(sheet){seen=true;sheet.classList.add("ob-profile");if(at<0){at=0;place(sheet)}else if(!sheet.querySelector(".evia-guide-target"))place(sheet)}
      else if(seen&&!modal.innerHTML.trim()){observer.disconnect();profileObserver=null;finish()}
    };
    const observer=profileObserver=new MutationObserver(decorate);
    observer.observe(modal,{childList:true,subtree:true});
    window.eviaOpenProfile();decorate();
  }

  function skipDemo(){
    if(profileObserver){profileObserver.disconnect();profileObserver=null}
    const modal=document.getElementById("modal-root");if(modal&&modal.querySelector(".ob-profile"))modal.innerHTML="";
    finish();
  }
  function finish(){
    writeState("done");
    hideCard();closeLesson();clearTargets();
    document.body.classList.remove("evia-onboarding","ob-lock");spotOff();
    const pick=document.getElementById("evia-onboard-course");if(pick)pick.remove();
    nav("course");
    if(typeof showEvidenceToast==="function")showEvidenceToast("You’re all set");
  }

  /* Picks up where the learner left off. Stages from the old, longer demo carry on at the nearest step. */
  function resume(stage){
    const t=/^tour:(\d+)$/.exec(stage||"");
    if(t)return tour(+t[1]);
    if(stage==="course"){const en=window.eviaData.enrolment&&window.eviaData.enrolment();
      if(en)applyEnrolment(en).then(showWelcome).catch(err=>{console.error(err);showCoursePicker()});else showCoursePicker();return}
    if(stage==="optional"&&nvqOn())return showOptionalPicker();
    if(stage==="ppe"||stage==="unit"||stage==="optional")return pickersThen(startPpe);
    tour(0);
  }

  /* Called after the welcome screen. Returns true when the tour takes over. */
  window.eviaMaybeStartOnboarding=function(firstRun){
    let forced=false;
    try{
      const params=new URLSearchParams(location.search);
      if(params.has("demo")){
        forced=true;params.delete("demo");
        history.replaceState(null,"",location.pathname+(params.toString()?"?"+params:"")+location.hash);
      }
      /* Shared test pages only pass a plain #anchor, so #demo replays it too, and #demo&course=site stands in for
         Nisia's enrolment. */
      const hash=new URLSearchParams(location.hash.slice(1));
      if(hash.has("demo")){forced=true;const c=hash.get("course");if(c&&!window.eviaData.enrolment())window.eviaData.enrol({course:c});history.replaceState(null,"",location.pathname+location.search)}
    }catch(_){}
    const state=readState();
    if(forced||(!state&&firstRun)){writeState("course");resume("course");return true}
    if(state&&state.stage&&state.stage!=="done"){resume(state.stage);return true}
    return false;
  };
})();
