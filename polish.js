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
    const u=data().u[unit],groups=ksbGroups(),photos=pack.photos||[];
    $("#page-title").textContent=u[0];
    $("#screen").innerHTML=
      '<div class="evidence-pack-page">'+
        '<div class="card unit-hero"><div class="unit-number">EVIDENCE PACK</div><h2>'+esc(u[0])+'</h2>'+
        '<p>Capture the whole job in one pack. Take photos from the <strong>beginning, middle and end</strong> of the job.</p></div>'+
        '<section class="card capture-card">'+
          '<div class="section-title">ADD PHOTOS</div>'+
          '<p class="capture-intro">Use the prompts below to guide your photos. You can add photos from your camera or gallery and add more at any time.</p>'+
          '<label class="stage-camera"><span>＋</span> Add photos<input id="evidence-file" class="stage-file" type="file" accept="image/*" capture="environment" multiple></label>'+
          '<div class="photo-guide">'+
            '<div><strong>Beginning</strong><span>Show preparation, setting out, tools, materials and safety.</span></div>'+
            '<div><strong>Middle</strong><span>Show the work in progress and the practical skills being demonstrated.</span></div>'+
            '<div><strong>End</strong><span>Show the finished work, quality, accuracy and final checks.</span></div>'+
          '</div>'+
          '<div class="evidence-photos" id="evidence-photos"></div>'+
        '</section>'+
        '<section class="card prompt-card">'+
          '<div class="section-title">PHOTO PROMPTS</div>'+
          '<p>These are the practical skills involved in this job. Use the beginning, middle and end photos to show them in practice.</p>'+
          '<div class="prompt-list">'+groups.skills.map(k=>'<div class="prompt-row"><span class="prompt-dot">Photo</span><span>'+esc(clean(k,true))+'</span></div>').join("")+'</div>'+
        '</section>'+
        '<section class="card writeup-card">'+
          '<div class="section-title">YOUR WRITE-UP</div>'+
          '<p>Use the prompts below to explain what you did. Write in your own words and cover the knowledge and behaviours involved in the job.</p>'+
          '<textarea id="write" placeholder="Describe what you did, how you did it, the tools and materials you used, the checks you made, and anything you solved or adjusted…">'+esc(pack.write||"")+'</textarea>'+
          '<div class="writeup-prompts">'+groups.writeups.map(k=>'<div class="prompt-row"><span class="prompt-dot">Write</span><span>'+esc(clean(k,false))+'</span></div>').join("")+'</div>'+
        '</section>'+
        '<div class="pack-actions"><button class="secondary" id="exit-evidence">Exit</button><button class="primary" id="submit-evidence" '+(photos.length&&String(pack.write||"").trim()?"":"disabled")+'>Submit evidence</button></div>'+
        '<p class="submit-hint">'+(photos.length&&String(pack.write||"").trim()?"Your evidence pack is ready to submit.":"Add at least one photo and complete the write-up before submitting.")+'</p>'+
      '</div>';

    $("#exit-evidence").onclick=()=>{savePack(pack);courses()};
    $("#evidence-file").onchange=async e=>{
      const files=[...e.target.files];if(!files.length)return;
      try{
        const thumbs=await Promise.all(files.map(makeThumb));
        thumbs.forEach(src=>pack.photos.push({src,addedAt:new Date().toISOString()}));
        e.target.value="";savePack(pack);renderPack(pack);
      }catch(_){alert("That photo could not be added. Please try again.")}
    };
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
      .evidence-pack-page{padding-bottom:18px}
      .unit-hero{margin-top:8px}
      .capture-card,.prompt-card,.writeup-card{margin-top:10px}
      .capture-intro,.prompt-card>p,.writeup-card>p{font-size:12.5px;line-height:1.5;color:#707b8b}
      .stage-camera{display:flex;align-items:center;gap:7px;width:max-content;padding:10px 13px;border:1px solid #e1e5ea;border-radius:13px;font-size:12px;color:#4e5969;background:#fafbfc}
      .stage-camera span{font-size:18px;line-height:12px}
      .stage-file{display:none}
      .photo-guide{display:grid;gap:8px;margin-top:14px}
      .photo-guide>div{display:grid;grid-template-columns:74px 1fr;gap:8px;align-items:start}
      .photo-guide strong{font-size:12px;color:#344054}
      .photo-guide span{font-size:12px;line-height:1.45;color:#778293}
      .evidence-photos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:12px}
      .evidence-photos:empty{display:none}
      .photo-item{position:relative;min-width:0}
      .thumb{display:block;width:100%;height:74px;object-fit:cover;border-radius:10px}
      .photo-remove{position:absolute;right:4px;top:4px;width:22px;height:22px;border:0;border-radius:50%;background:rgba(16,24,40,.72);color:#fff;line-height:18px}
      .prompt-list,.writeup-prompts{display:grid;gap:8px;margin-top:12px}
      .prompt-row{display:flex;gap:9px;align-items:flex-start;padding:10px 11px;background:#fff;border:1px solid #edf0f3;border-radius:13px}
      .prompt-row>span:last-child{font-size:12.5px;line-height:1.5;color:#596577}
      .prompt-dot{flex:0 0 auto;font-size:10px!important;font-weight:700;color:#6b7280!important;background:#f5f6f8;border-radius:8px;padding:3px 6px}
      #write{width:100%;min-height:190px;box-sizing:border-box;margin-top:12px}
      .pack-actions{display:flex;gap:10px;margin-top:14px}
      .pack-actions button{flex:1}
      .submit-hint{text-align:center;font-size:11.5px;line-height:1.45;color:#7b8696;margin:9px 4px 0}
      button:disabled{opacity:.45;cursor:not-allowed}
      @media(min-width:600px){.evidence-photos{grid-template-columns:repeat(6,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  });
})();