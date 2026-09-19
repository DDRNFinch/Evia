/* Evia7 evidence UX: single-page working evidence pack. */
(function(){
  const WORKING_KEY="evia7-working-evidence-packs";

  const makeThumb=file=>new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=640,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
        const c=document.createElement("canvas");
        c.width=Math.max(1,Math.round(img.naturalWidth*scale));
        c.height=Math.max(1,Math.round(img.naturalHeight*scale));
        c.getContext("2d",{alpha:false}).drawImage(img,0,0,c.width,c.height);
        c.toBlob(blob=>{
          if(!blob)return reject(new Error("thumbnail"));
          const rr=new FileReader();
          rr.onload=()=>resolve(rr.result);
          rr.onerror=reject;
          rr.readAsDataURL(blob);
        },"image/jpeg",.72);
      };
      img.onerror=reject;
      img.src=r.result;
    };
    r.onerror=reject;
    r.readAsDataURL(file);
  });

  function readWorking(){try{return JSON.parse(localStorage.getItem(WORKING_KEY)||"{}")}catch(_){return{}}}
  function writeWorking(all){
    try{localStorage.setItem(WORKING_KEY,JSON.stringify(all));return true}
    catch(_){alert("Evia could not save this working evidence pack. Please remove some photos and try again.");return false}
  }
  function packKey(){return course+"|"+data().u[unit][0]}
  function newPack(){
    return {course,unit:data().u[unit][0],unitIndex:unit,photos:[],write:"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
  }
  function getPack(){
    const all=readWorking(),key=packKey();
    if(!all[key]){all[key]=newPack();writeWorking(all)}
    return all[key];
  }
  function savePack(pack){
    const all=readWorking();pack.updatedAt=new Date().toISOString();all[packKey()]=pack;return writeWorking(all);
  }
  function removePack(){const all=readWorking();delete all[packKey()];writeWorking(all)}

  function ksbGroups(){
    const items=data().u[unit][1]||[];
    return {
      skills:items.filter(k=>String(code(k)).toUpperCase().startsWith("S")),
      writeups:items.filter(k=>!String(code(k)).toUpperCase().startsWith("S"))
    };
  }
  function clean(k,skills){
    const raw=String(text(k)||"").trim();
    return raw.replace(new RegExp("^(Skills?|Knowledge|Behaviours?):\\s*","i"),"");
  }

  const LEARNER_PROMPTS={
    bricklayer:{
      "Mixing mortar":{photos:"mixing mortar · ratio · silos · pre-mix · gauging · hand/mechanical · mortar quantity · safety signage · teamwork",writeup:"ratio · silos · pre-mix · gauging · hand/mechanical · mortar quantity · safety signage · teamwork · health · wellbeing"},
      "Jointing Styles":{photos:"joint finishes · half round · flush · weather struck · recessed · PPE · protection",writeup:"joint finishes · PPE · frost/water protection · construction damage · teamwork"},
      "Repair brick walling":{photos:"brick repairs · damaged bricks · safe working area",writeup:"defects · repair methods · asbestos · safe systems · toolbox talks · risk assessments · method statements · terminology · environment"},
      "Basic Brick wall":{photos:"wall setting-out · construction · capping · PPE · hand tools · tool maintenance",writeup:"solid wall construction · health & safety · building principles · DPCs · brick ties · materials · health · safety · wellbeing"},
      "Set out solid walling":{photos:"wall setting-out · drawings · specifications · communication",writeup:"solid wall setting-out · drawings · specifications · slips/trips/falls · communication · digital design/modelling · decorative walling · piers · banding · ownership"},
      "Build solid walling":{photos:"solid wall construction · drawings/specifications · environmental practices",writeup:"wall construction · drawings · specifications · resource efficiency · recycling · waste · surface water · English/Flemish/garden/broken bonds · environment"},
      "Set out Cavity Walling":{photos:"cavity setting-out · openings · levels · profiles · gauge rods · squares · DPCs · cavity trays · weep holes",writeup:"bricks/blocks · wall ties · insulation · DPCs · cavity trays · lintels · mortar · materials · CoSHH · PUWER · electrical safety · manual handling · learning"},
      "Construct Cavity Walling":{photos:"stretcher bond · returns · openings · insulation · fire stopping",writeup:"cavity construction · drawings/specifications · fire safety · fire extinguishers · wellbeing · thermal qualities · airtightness · ventilation · sustainability · learning"},
      "Cavity opening":{photos:"cavity closure · edge sill · wall ties · lintel · soldiers",writeup:"cavity closure · wall ties · lintels · standards · building regulations · warranty standards · inclusion · equity · diversity · expansion joints · modern construction"},
      "Gable end/Raked wall":{photos:"raking cut · gable/garden wall · measuring · cutting · PPE",writeup:"raking walls · working at height · confined spaces · hand-tool cutting · disc cutters · mixers/drills · ownership"}
    },
    site:{
      "Structural carcassing":{photos:"structural carcassing · load-bearing studwork · power tools",writeup:"carcassing · health & safety · power-tool use/storage · timber characteristics · health · safety · wellbeing"},
      "Timber/metal partition walls":{photos:"timber/metal partitions · laser level · timber sizing",writeup:"partition installation · laser levels · timber sizing · building methods · learning & development"},
      "Floor joists (and coverings)":{photos:"floor joists · coverings · safety equipment · structural fixings",writeup:"joists/coverings · CoSHH · PUWER · electrical safety · manual handling · structural fixings · timber sizing · timber decay/repair · environment"},
      "Straight flights of stairs":{photos:"straight stairs · safety · drawings · specifications",writeup:"stair installation · safety · slips/trips/falls · drawings · specifications · digital design/modelling · health · safety · wellbeing"},
      "Service encasement":{photos:"service encasement · safety equipment · hand tools",writeup:"service encasement · fire safety · fire extinguishers · hand tools · tool storage · wellbeing · inclusion · diversity"},
      "Cladding":{photos:"cladding · safe working area",writeup:"cladding · asbestos · safe systems · site inductions · toolbox talks · risk assessments · method statements · hazard identification · mental/physical health · safety"},
      "Wall and floor units":{photos:"wall/floor units · environmental practices · jigs",writeup:"units/fitments · recycling · reuse · waste · sustainable forestry · jig production · teamwork"},
      "Handrails and spindles":{photos:"handrails · spindles · safety signage · communication",writeup:"handrails/spindles · safety signage · communication · construction terminology · hand tools · learning & development"},
      "Internal and external doors":{photos:"doors · joints · nails/screws/bolts · adhesive · hand tools",writeup:"doors · mastics · preservatives · wood fillers · plastics · ironmongery · tool maintenance · sharpening · drawings/specifications · health · safety · wellbeing"},
      "Skirting boards and architrave":{photos:"skirting · architrave · safety equipment · splicing · scribing",writeup:"mouldings · PPE/RPE/LEV · splicing · scribing · employment types · small business · tax · environment"},
      "Window boards":{photos:"window boards · measuring · marking out · cutting · mitring · hinging · recessing",writeup:"window boards · standards · building regulations · warranty standards · measuring · fitting · cutting · mitring · inclusion · equity · diversity"},
      "Roofs and loft hatch":{photos:"rafter roofs · trussed/traditional roofs · verge · eaves · loft access · material estimation · cutting list",writeup:"roof installation · rafter/trussed roofs · confined spaces · working at height · material estimation · timber lengths · fixings · cutting lists · flat roofs · teamwork"}
    },
    joiner:{
      "Basic woodworking joints":{photos:"dovetail · bridal · mortise/tenon · halving · dowels · biscuit · staples · adhesives",writeup:"timber joints · joint production · connections · timber characteristics · health · safety · wellbeing"},
      "Timber Window":{photos:"timber window · casement · glazing rebates · ironmongery · safety equipment · drawings",writeup:"window manufacture/assembly · asbestos · drawings/specifications · digital design/modelling · environment"},
      "Straight staircases":{photos:"straight staircase · material estimation · cutting list · communication",writeup:"staircase manufacture/assembly · working at height · confined spaces · material estimation · timber lengths · fixings · cutting lists · terminology · inclusion · equity · diversity"},
      "Door frames and linings":{photos:"door frames · linings · safety equipment · hand tools",writeup:"frame/lining manufacture · safety signage · hand-tool maintenance · sharpening · timber decay/repair · learning & development"},
      "Timber doors":{photos:"timber doors · power tools · safe working",writeup:"door manufacture/assembly · CoSHH · PUWER · electrical safety · manual handling · power-tool use/storage · timber · health · safety · wellbeing · teamwork"},
      "Wall and floor units":{photos:"wall/floor units · PPE · environmental practices",writeup:"units/fitments · PPE · recycling · reuse · waste · jig production · employment types · small business · tax · health · safety · wellbeing"},
      "Timber mouldings":{photos:"timber mouldings · safe working · environmental practices",writeup:"moulding manufacture · recycling · reuse · waste · wellbeing · mental/physical health · teamwork · environment"},
      "Staircase spindles and balustrades":{photos:"spindles · balustrades · safety · jigs",writeup:"staircase components · safety · jig production · teamwork"},
      "Ironmongery":{photos:"ironmongery · measuring/marking · hand tools",writeup:"ironmongery · standards · building regulations · warranty standards · hand tools · tool storage · inclusion · equity · diversity · learning & development"},
      "Fixed Machinery":{photos:"fixed machinery · PPE · safe working area",writeup:"machinery · safe systems · site inductions · toolbox talks · risk assessments · method statements · hazard identification · building principles · learning & development · teamwork"}
    }
  };
  function learnerPrompts(){
    const coursePrompts=LEARNER_PROMPTS[course]||{};
    return coursePrompts[data().u[unit][0]]||{photos:"",writeup:""};
  }
  function renderPhotos(pack){
    const g=$("#evidence-photos");
    g.innerHTML=(pack.photos||[]).map((p,i)=>
      '<div class="photo-item"><img class="thumb" src="'+p.src+'" alt="Evidence photo">'+
      '<button type="button" class="photo-remove" data-remove-photo="'+i+'" aria-label="Remove photo">×</button></div>'
    ).join("");
    g.querySelectorAll("[data-remove-photo]").forEach(b=>b.onclick=()=>{
      pack.photos.splice(+b.dataset.removePhoto,1);savePack(pack);renderPhotos(pack);
    });
  }

  function renderPack(pack){
    const u=data().u[unit],photos=pack.photos||[],prompts=learnerPrompts();
    $("#page-title").textContent=u[0];
    $("#screen").innerHTML=
      '<div class="evidence-pack-page">'+
        '<div class="evidence-heading">'+
          '<div class="evidence-label">EVIDENCE PACK</div>'+
          '<h2>'+esc(u[0])+'</h2>'+
          '<p>Capture the whole job in one pack. Take photos from the <strong>beginning, middle and end</strong> of the job.</p>'+
        '</div>'+
        '<div class="evidence-photo-actions">'+
          '<label class="evidence-photo-button"><span>Camera</span><input id="evidence-camera" type="file" accept="image/*" capture="environment"></label>'+
          '<label class="evidence-photo-button"><span>Gallery</span><input id="evidence-gallery" type="file" accept="image/*" multiple></label>'+
        '</div>'+
        '<div class="evidence-thumbs" id="evidence-photos"></div>'+
        '<section class="evidence-section">'+
          '<div class="evidence-section-title">THINGS TO CAPTURE</div>'+
          '<div class="compact-prompts">'+esc(prompts.photos)+'</div>'+
        '</section>'+
        '<section class="evidence-section writeup-section">'+
          '<div class="evidence-section-title">EXPLAIN THE PROCESS AND WHAT YOU DID</div>'+
          '<div class="evidence-section-title evidence-subtitle">THINGS TO MENTION</div>'+
          '<div class="compact-prompts">'+esc(prompts.writeup)+'</div>'+
          '<textarea id="write" placeholder="Write about the process and what you did…">'+esc(pack.write||"")+'</textarea>'+
        '</section>'+
        '<div class="pack-actions">'+
          '<button class="secondary" id="continue-later">Continue later</button>'+
          '<button class="primary" id="submit-evidence" '+(photos.length&&String(pack.write||"").trim()?"":"disabled")+'>Submit to Portfolio</button>'+
        '</div>'+
        '<p class="submit-hint">Add at least one photo and complete the write-up before submitting.</p>'+
      '</div>';

    $("#continue-later").onclick=()=>{savePack(pack);courses()};
    const addFiles=async files=>{
      if(!files.length)return;
      try{
        const thumbs=await Promise.all(files.map(makeThumb));
        thumbs.forEach(src=>pack.photos.push({src,addedAt:new Date().toISOString()}));
        savePack(pack);renderPack(pack);
      }catch(_){alert("That photo could not be added. Please try again.")}
    };
    $("#evidence-camera").onchange=async e=>{await addFiles([...e.target.files]);e.target.value=""};
    $("#evidence-gallery").onchange=async e=>{await addFiles([...e.target.files]);e.target.value=""};
    $("#write").oninput=e=>{
      pack.write=e.target.value;savePack(pack);
      const ready=pack.photos.length>0&&String(pack.write||"").trim();
      const btn=$("#submit-evidence"),hint=document.querySelector(".submit-hint");
      if(btn)btn.disabled=!ready;
      if(hint)hint.textContent=ready?"Your evidence pack is ready to submit.":"Add at least one photo and complete the write-up before submitting.";
    };
    $("#submit-evidence").onclick=()=>submitPack(pack);
    renderPhotos(pack);
  }

  function submitPack(pack){
    if(!(pack.photos||[]).length||!String(pack.write||"").trim())return;
    const u=data().u[unit],profile=JSON.parse(localStorage.getItem("evia7-profile")||"{}");
    evidence.push({
      id:Date.now(),c:course,u:u[0],d:new Date().toLocaleString("en-GB"),
      p:pack.photos.map(x=>x.src),w:pack.write.trim(),k:u[1].map(code),
      learnerProfile:profile,signature:profile.signature||"",savedAt:new Date().toISOString(),
      photoCount:pack.photos.length
    });
    persist();removePack();screen="portfolio";render();
  }

  window.openUnit=function(i){
    screen="unit";unit=i;renderPack(getPack());
  };

  window.addEventListener("load",()=>{
    const style=document.createElement("style");
    style.textContent=`
      .evidence-pack-page{padding:18px 16px 28px}
      .evidence-heading{padding:0 2px}
      .evidence-label{font-size:11px;font-weight:700;letter-spacing:.1em;color:#98a2b3}
      .evidence-heading h2{margin:6px 0 7px;font-size:26px;line-height:1.16;letter-spacing:-.025em}
      .evidence-heading p{max-width:560px;margin:0;font-size:13px;line-height:1.55;color:#667085}
      .evidence-photo-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}
      .evidence-photo-button{min-height:52px;display:flex;align-items:center;justify-content:center;border:1px solid #e3e7ed;border-radius:15px;background:#fff;font-size:13px;font-weight:650;color:#273244;cursor:pointer;box-shadow:0 2px 8px rgba(25,36,55,.035);transition:transform .15s ease,background .15s ease,border-color .15s ease}
      .evidence-photo-button:active{transform:scale(.985);background:#f8fafb}
      .evidence-photo-button input{display:none}
      .evidence-thumbs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
      .evidence-thumbs:empty{display:none}
      .photo-item{position:relative;min-width:0}
      .thumb{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:cover;border-radius:12px;background:#f3f5f7;border:1px solid #edf0f4}
      .photo-remove{position:absolute;right:6px;top:6px;width:24px;height:24px;border:0;border-radius:50%;background:rgba(23,32,51,.78);color:#fff;font-size:15px;line-height:22px;padding:0}
      .evidence-section{margin-top:22px;padding-top:1px}
      .evidence-section-title{margin-bottom:8px;font-size:11px;font-weight:750;letter-spacing:.075em;color:#344054}
      .compact-prompts{font-size:13px;line-height:1.65;color:#667085}
      .writeup-section{margin-top:28px}
      .evidence-subtitle{margin-top:18px}
      #write{display:block;width:100%;min-height:150px;box-sizing:border-box;margin-top:10px;padding:14px 15px;border:1px solid #dfe4ea;border-radius:15px;background:#fff;color:#172033;font-size:14px;line-height:1.55;resize:vertical;outline:none;transition:border-color .15s ease,box-shadow .15s ease}
      #write:focus{border-color:#b9c1cc;box-shadow:0 0 0 3px rgba(27,36,53,.06)}
      #write::placeholder{color:#a0a9b7}
      .pack-actions{display:grid;grid-template-columns:1fr 1.35fr;gap:10px;margin-top:18px}
      .pack-actions button{min-height:50px;padding:12px 14px;border-radius:15px;font-size:13px}
      .pack-actions .secondary{background:#f4f6f8}
      .pack-actions .primary{background:#1b2435}
      .submit-hint{text-align:center;font-size:11.5px;line-height:1.45;color:#98a2b3;margin:9px 6px 0}
      .prompt-list,.writeup-prompts,.photo-guide,.capture-intro{display:none}
      button:disabled{opacity:.45;cursor:not-allowed}
      @media(min-width:600px){.evidence-pack-page{padding-left:4px;padding-right:4px}.evidence-thumbs{grid-template-columns:repeat(5,minmax(0,1fr))}}
      @media(max-width:520px){.evidence-pack-page{padding-top:14px}.evidence-heading h2{font-size:24px}.evidence-photo-actions{margin-top:18px}.pack-actions{grid-template-columns:1fr 1.25fr}}
`;
    document.head.appendChild(style);
  });
})();