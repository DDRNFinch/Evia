
(function(){
  const captureGuidance={
    "Mixing mortar":{
      capture:["mixing mortar","ratio","silos","pre-mix","gauging","hand/mechanical","mortar quantity","safety signage","teamwork"],
      mention:["ratio","silos","pre-mix","gauging","hand/mechanical","mortar quantity","safety signage","teamwork","health","wellbeing"]
    },
    "Set out Cavity Walling":{
      capture:["cavity setting-out","openings","levels","profiles","gauge rods","squares","DPCs","cavity trays","weep holes"],
      mention:["bricks/blocks","wall ties","insulation","DPCs","cavity trays","lintels","mortar","materials","CoSHH","PUWER","electrical safety","manual handling","learning"]
    }
  };
  function esc2(s){return String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))}
  function guidanceFor(name){
    return captureGuidance[name]||{
      capture:["safety","preparation","tools and materials","setting out","work in progress","quality check","finished job"],
      mention:["process","tools","materials","measurements","health","safety","quality","wellbeing"]
    };
  }
  function readPhoto(file){
    return new Promise((resolve,reject)=>{
      if(!file||!/^image\//i.test(file.type)||!file.size)return reject(new Error("Invalid photo"));
      const r=new FileReader();
      r.onload=()=>r.result?resolve(r.result):reject(new Error("Empty photo"));
      r.onerror=()=>reject(r.error||new Error("Photo read failed"));
      r.readAsDataURL(file);
    });
  }
  function cameraIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h3l1.2-2.1h7.6L17 8.5h3a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10.5a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14" r="3.6"/></svg>'}
  function galleryIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M8.2 14.5 11 12l2.6 2.8 2.2-2.7 4.2 4.4"/><circle cx="9" cy="9" r="1.7"/></svg>'}
  window.openUnit=async function(i){
    const profileBtn=document.getElementById("profile-btn");if(profileBtn)profileBtn.style.display="none";
    unit=i;
    const u=data().u[i];
    if(!u){nav("course");return}
    const g=guidanceFor(u[0]);
    $("#page-title").textContent=u[0];
    const existingRaw=evidence.filter(e=>e.c===course&&e.u===u[0]);
    const existing=window.eviaGetEvidencePhotoData
      ?await Promise.all(existingRaw.map(async e=>Object.assign({},e,{p:await window.eviaGetEvidencePhotoData(e)})))
      :existingRaw;
    let captured=[];
    const render=()=>{
      $("#screen").innerHTML=
        '<div class="capture-page">'+
          '<section class="capture-evidence-tile">'+
            '<div class="capture-head"><button class="capture-back" id="capture-back" aria-label="Back">‹</button><div class="capture-head-copy"><div class="capture-eyebrow">EVIDENCE PACK</div><h2>'+esc2(u[0])+'</h2><p class="capture-intro">Capture evidence for the work you have completed. Evia helps you gather evidence; your assessor decides whether it meets the standard.</p></div></div>'+
            '<div class="capture-action-row">'+
              '<input id="capture-camera" type="file" accept="image/*" capture="environment" hidden>'+ 
              '<input id="capture-gallery" type="file" accept="image/*" multiple hidden>'+ 
              '<button class="capture-action primary" id="capture-take" type="button">'+cameraIcon()+'<span>Camera</span></button>'+ 
              '<button class="capture-action secondary" id="capture-choose" type="button">'+galleryIcon()+'<span>Gallery</span></button>'+ 
            '</div>'+
            '<div class="capture-list-block"><div class="capture-label">THINGS TO CAPTURE</div><ul class="capture-item-list">'+g.capture.map(x=>'<li>'+esc2(x)+'</li>').join("")+'</ul></div>'+ 
          '</section>'+ 
          '<section class="capture-evidence-tile">'+
            '<div class="capture-list-block"><div class="capture-label">THINGS TO MENTION</div><ul class="capture-item-list subtle">'+g.mention.map(x=>'<li>'+esc2(x)+'</li>').join("")+'</ul></div>'+ 
            '<div class="capture-write-card"><label class="capture-note-label" for="capture-note">Write about the process and what you did…</label><textarea class="capture-note" id="capture-note" placeholder="Write about the process and what you did…"></textarea><div class="capture-actions"><button class="capture-continue" id="capture-continue" type="button">Continue later</button><button class="capture-submit" id="capture-submit" type="button" disabled>Save evidence</button></div></div>'+ 
          '</section>'+ 
        '</div>';
      $("#capture-back").onclick=()=>nav("course");
      const camera=$("#capture-camera"),gallery=$("#capture-gallery"),take=$("#capture-take"),choose=$("#capture-choose"),continueBtn=$("#capture-continue"),submit=$("#capture-submit"),note=$("#capture-note");
      const refreshSave=()=>submit.disabled=!(captured.length&&note.value.trim());
      refreshSave();
      note.oninput=refreshSave;
      const add=async files=>{
        const selected=[...files].filter(f=>/^image\//i.test(f.type)&&f.size).slice(0,6-captured.length);
        if(!selected.length)return;
        submit.disabled=true;
        try{for(const f of selected)captured.push(await readPhoto(f));render()}catch(e){alert("That photo could not be added. Please try again.")}
      };
      take.onclick=()=>camera.click();
      choose.onclick=()=>gallery.click();
      camera.onchange=()=>{const fs=camera.files;add(fs).finally(()=>camera.value="")};
      gallery.onchange=()=>{const fs=gallery.files;add(fs).finally(()=>gallery.value="")};
      continueBtn.onclick=()=>{ const w=note.value.trim(); if(!captured.length&&!w)return; const entry={c:course,u:u[0],d:new Date().toLocaleDateString("en-GB"),savedAt:new Date().toLocaleString("en-GB"),p:captured.slice(),w,k:u[1].filter(k=>/^[SKB]\d+\|/.test(k)).map(k=>code(k))}; evidence.push(entry);persist();if(window.eviaCheckTargets)window.eviaCheckTargets();openUnit(i); };
      submit.onclick=()=>{
        const w=note.value.trim();
        if(!captured.length||!w)return;
        const entry={c:course,u:u[0],d:new Date().toLocaleDateString("en-GB"),savedAt:new Date().toLocaleString("en-GB"),p:captured.slice(),w,k:u[1].filter(k=>/^[SKB]\d+\|/.test(k)).map(k=>code(k))};
        evidence.push(entry);persist();if(window.eviaCheckTargets)window.eviaCheckTargets();openUnit(i);
      };
    };
    render();
  };
})();
