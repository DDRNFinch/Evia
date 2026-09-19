/* Evia7 evidence UX: persistent three-stage working pack. */
(function(){
  const WORKING_KEY="evia7-working-evidence-packs";

  const STAGES=[
    ["Beginning","Capture the start of the job: preparation, setting out, tools, materials and safety controls."],
    ["Middle","Capture the work in progress: techniques, measurements, materials, fixings, checks and decisions."],
    ["End","Capture the finished result: quality, accuracy, finish, protection and final checks."]
  ];

  const makeThumb=file=>new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=640;
        const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
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

  function readWorking(){
    try{return JSON.parse(localStorage.getItem(WORKING_KEY)||"{}")}catch(_){return{}}
  }

  function writeWorking(all){
    try{localStorage.setItem(WORKING_KEY,JSON.stringify(all));return true}catch(_){
      alert("Evia could not save this working evidence pack. Please remove some photos and try again.");
      return false;
    }
  }

  function packKey(){
    const u=data().u[unit];
    return course+"|"+u[0];
  }

  function newPack(){
    return {
      course,
      unit:data().u[unit][0],
      unitIndex:unit,
      currentStage:0,
      stages:[0,1,2].map(()=>({photos:[],text:""})),
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
  }

  function getPack(){
    const all=readWorking();
    const key=packKey();
    if(!all[key]){
      all[key]=newPack();
      writeWorking(all);
    }
    return all[key];
  }

  function savePack(pack){
    const all=readWorking();
    pack.updatedAt=new Date().toISOString();
    all[packKey()]=pack;
    return writeWorking(all);
  }

  function removePack(){
    const all=readWorking();
    delete all[packKey()];
    writeWorking(all);
  }

  function skillsAndKsb(){
    const u=data().u[unit];
    const items=u[1]||[];
    return {
      skills:items.filter(k=>String(code(k)).toUpperCase().startsWith("S")),
      all:items
    };
  }

  function skillPrompt(k){
    const raw=String(text(k)||"").trim();
    return raw.replace(/^Skills?:\s*/i,"");
  }

  function ksbPrompt(k){
    const raw=String(text(k)||"").trim();
    return raw.replace(/^(Knowledge|Behaviours?|Skills?):\s*/i,"");
  }

  function stageSkills(skills,stage){
    if(!skills.length)return [];
    return skills.filter((_,i)=>i%3===stage);
  }

  function renderPhotos(pack,stage){
    const g=$("#stage-photos");
    if(!g)return;
    const photos=pack.stages[stage].photos||[];
    g.innerHTML=photos.map((p,i)=>
      '<div class="photo-item"><img class="thumb" src="'+p.src+'" alt="Evidence photo">'+
      '<button type="button" class="photo-remove" data-remove-photo="'+i+'" aria-label="Remove photo">×</button></div>'
    ).join("");
    g.querySelectorAll("[data-remove-photo]").forEach(b=>b.onclick=()=>{
      pack.stages[stage].photos.splice(+b.dataset.removePhoto,1);
      savePack(pack);
      renderStage(pack);
    });
  }

  function renderStage(pack){
    const totalScreens=4;
    const stage=pack.currentStage;
    const u=data().u[unit];
    const {skills,all}=skillsAndKsb();
    const skillItems=stageSkills(skills,stage);

    if(stage<3){
      const prompts=skillItems.length
        ? skillItems.map(k=>'<li>'+esc(skillPrompt(k))+'</li>').join("")
        : '<li>Capture a clear photo that shows the work at this stage.</li>';

      $("#page-title").textContent=u[0];
      $("#screen").innerHTML=
        '<div class="evidence-stage-page">'+
          '<div class="evidence-progress"><span>Stage '+(stage+1)+' of 3</span><strong>'+esc(STAGES[stage][0])+'</strong></div>'+
          '<div class="card unit-hero"><div class="unit-number">EVIDENCE PACK</div><h2>'+esc(u[0])+'</h2><p>'+esc(STAGES[stage][1])+'</p></div>'+
          '<section class="card evidence-prompt"><div class="section-title">PHOTO PROMPTS</div><p>Take photos that show the practical skills being demonstrated.</p><ul>'+prompts+'</ul></section>'+
          '<section class="card capture-card">'+
            '<label class="stage-camera"><span>＋</span> Add photos<input id="stage-file" class="stage-file" type="file" accept="image/*" capture="environment" multiple></label>'+
            '<p class="gallery-hint">You can select several photos at once.</p>'+
            '<div class="stage-photos" id="stage-photos"></div>'+
          '</section>'+
          '<div class="stage-actions">'+
            (stage===0?'<button class="secondary" id="exit-evidence">Exit</button>':'<button class="secondary" id="previous-stage">Previous</button>')+
            '<button class="primary" id="next-stage">Next</button>'+
          '</div>'+
        '</div>';

      if(stage===0)$("#exit-evidence").onclick=()=>{savePack(pack);courses()};
      else $("#previous-stage").onclick=()=>{pack.currentStage--;savePack(pack);renderStage(pack)};

      $("#next-stage").onclick=()=>{pack.currentStage++;savePack(pack);renderStage(pack)};

      $("#stage-file").onchange=async e=>{
        const files=[...e.target.files];
        if(!files.length)return;
        try{
          const thumbs=await Promise.all(files.map(makeThumb));
          thumbs.forEach(src=>pack.stages[stage].photos.push({src,addedAt:new Date().toISOString()}));
          e.target.value="";
          savePack(pack);
          renderStage(pack);
        }catch(_){
          alert("That photo could not be added. Please try again.");
        }
      };

      renderPhotos(pack,stage);
      return;
    }

    const writeText=pack.stages[0].text;
    const write2=pack.stages[1].text;
    const write3=pack.stages[2].text;
    const allPhotos=[0,1,2].flatMap(s=>(pack.stages[s].photos||[]).map((p,i)=>({p,i,s})));
    const complete=pack.stages.every(s=>(s.photos||[]).length>0) && [writeText,write2,write3].every(Boolean);

    $("#page-title").textContent=u[0];
    $("#screen").innerHTML=
      '<div class="evidence-stage-page">'+
        '<div class="evidence-progress"><span>Write-up</span><strong>Bring your evidence together</strong></div>'+
        '<div class="card unit-hero"><div class="unit-number">FINAL STEP</div><h2>'+esc(u[0])+'</h2><p>Review the photos from all three stages and explain the job in your own words.</p></div>'+
        '<section class="card evidence-gallery"><div class="section-title">YOUR PHOTOS</div><div class="collated-photos">'+
          (allPhotos.length?allPhotos.map(x=>'<img class="thumb" src="'+x.p.src+'" alt="Evidence photo from '+esc(STAGES[x.s][0])+'">').join(""):'<p>No photos captured yet.</p>')+
        '</div></section>'+
        '<section class="card writeup-card">'+
          '<div class="section-title">WHAT TO WRITE</div>'+
          '<p>Explain what you did, how you did it, what tools and materials you used, the checks you made, and anything you solved or adjusted.</p>'+
          '<div class="writeup-stage"><label>Beginning of the job</label><textarea id="write-0" placeholder="Describe your preparation and how you started the job…">'+esc(writeText)+'</textarea></div>'+
          '<div class="writeup-stage"><label>Middle of the job</label><textarea id="write-1" placeholder="Describe the work, techniques, measurements, checks and decisions…">'+esc(write2)+'</textarea></div>'+
          '<div class="writeup-stage"><label>End of the job</label><textarea id="write-2" placeholder="Describe the finished result, quality checks and final checks…">'+esc(write3)+'</textarea></div>'+
        '</section>'+
        '<section class="card ksb-prompts"><div class="section-title">JOB WRITE-UP GUIDE</div><p>Use these points to make sure your write-up explains the knowledge and behaviours involved in the job.</p>'+
          '<div class="ksb-list">'+all.filter(k=>!String(code(k)).toUpperCase().startsWith("S")).map(k=>'<div class="ksb"><div class="ksbtext">'+esc(ksbPrompt(k))+'</div></div>').join("")+'</div>'+
        '</section>'+
        '<div class="stage-actions"><button class="secondary" id="previous-stage">Previous</button><button class="primary" id="submit-evidence" '+(complete?"":"disabled")+'>Submit evidence</button></div>'+
        '<p class="submit-hint">'+(complete?"Everything required is ready to submit.":"Complete each stage with at least one photo and complete all three write-up sections before submitting.")+'</p>'+
      '</div>';

    [0,1,2].forEach(i=>{
      $("#write-"+i).oninput=e=>{
        pack.stages[i].text=e.target.value;
        savePack(pack);
        const ready=pack.stages.every(s=>(s.photos||[]).length>0) && pack.stages.every(s=>String(s.text||"").trim());
        const btn=$("#submit-evidence");
        if(btn){
          btn.disabled=!ready;
          const hint=document.querySelector(".submit-hint");
          if(hint)hint.textContent=ready?"Everything required is ready to submit.":"Complete each stage with at least one photo and complete all three write-up sections before submitting.";
        }
      };
    });

    $("#previous-stage").onclick=()=>{pack.currentStage=2;savePack(pack);renderStage(pack)};
    $("#submit-evidence").onclick=()=>submitPack(pack);
  }

  function submitPack(pack){
    const ready=pack.stages.every(s=>(s.photos||[]).length>0) && pack.stages.every(s=>String(s.text||"").trim());
    if(!ready)return;

    const u=data().u[unit];
    const profile=JSON.parse(localStorage.getItem("evia7-profile")||"{}");
    const photos=pack.stages.flatMap(s=>s.photos.map(p=>p.src));
    const write=pack.stages.map((s,i)=>STAGES[i][0]+" of the job\n"+s.text.trim()).join("\n\n");

    evidence.push({
      id:Date.now(),
      c:course,
      u:u[0],
      d:new Date().toLocaleString("en-GB"),
      p:photos,
      w:write,
      k:u[1].map(code),
      learnerProfile:profile,
      signature:profile.signature||"",
      savedAt:new Date().toISOString(),
      stages:{
        beginning:pack.stages[0].photos.length,
        middle:pack.stages[1].photos.length,
        end:pack.stages[2].photos.length
      }
    });

    persist();
    removePack();
    screen="portfolio";
    render();
  }

  window.openUnit=function(i){
    screen="unit";
    unit=i;
    const pack=getPack();
    if(pack.unitIndex!==i){
      const replacement=newPack();
      pack.currentStage=replacement.currentStage;
      pack.stages=replacement.stages;
      pack.unitIndex=i;
      pack.unit=data().u[i][0];
      savePack(pack);
    }
    renderStage(pack);
  };

  window.addEventListener("load",()=>{
    const style=document.createElement("style");
    style.textContent=`
      .evidence-stage-page{padding-bottom:18px}
      .evidence-progress{display:flex;justify-content:space-between;align-items:center;margin:8px 2px 10px;font-size:12px;color:#7a8493}
      .evidence-progress strong{font-size:13px;color:#263142}
      .unit-hero{margin-top:8px}
      .evidence-prompt,.capture-card,.evidence-gallery,.writeup-card,.ksb-prompts{margin-top:10px}
      .evidence-prompt ul{margin:10px 0 0;padding-left:19px}
      .evidence-prompt li{margin:7px 0;font-size:13px;line-height:1.48;color:#5f6b7b}
      .capture-card{padding:15px}
      .stage-camera{display:flex;align-items:center;gap:7px;width:max-content;padding:10px 13px;border:1px solid #e1e5ea;border-radius:13px;font-size:12px;color:#4e5969;background:#fafbfc}
      .stage-camera span{font-size:18px;line-height:12px}
      .stage-file{display:none}
      .gallery-hint{font-size:11.5px;color:#8791a0;margin:8px 0 0}
      .stage-photos,.collated-photos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:11px}
      .stage-photos:empty{display:none}
      .photo-item{position:relative;min-width:0}
      .thumb{display:block;width:100%;height:74px;object-fit:cover;border-radius:10px}
      .photo-remove{position:absolute;right:4px;top:4px;width:22px;height:22px;border:0;border-radius:50%;background:rgba(16,24,40,.72);color:#fff;line-height:18px}
      .stage-actions{display:flex;gap:10px;margin-top:14px}
      .stage-actions button{flex:1}
      .writeup-stage{margin-top:13px}
      .writeup-stage label{display:block;font-size:12px;font-weight:700;color:#475467;margin-bottom:6px}
      .writeup-stage textarea{width:100%;min-height:105px;box-sizing:border-box}
      .ksb-list{display:grid;gap:8px;margin-top:10px}
      .ksb-list .ksb{background:#fff;border:1px solid #edf0f3;border-radius:13px;padding:10px}
      .ksbtext{font-size:12.5px;line-height:1.48;color:#687386}
      .submit-hint{text-align:center;font-size:11.5px;line-height:1.45;color:#7b8696;margin:9px 4px 0}
      button:disabled{opacity:.45;cursor:not-allowed}
      @media(min-width:600px){.stage-photos,.collated-photos{grid-template-columns:repeat(6,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  });
})();