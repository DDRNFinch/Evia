
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
          '<div class="capture-head"><button class="capture-back" id="capture-back" aria-label="Back">‹</button><div class="capture-head-copy"><div class="capture-eyebrow">EVIDENCE PACK</div><h2>'+esc2(u[0])+'</h2><p class="capture-intro">Capture the whole job in one pack. Take photos from the beginning, middle and end of the job.</p></div></div>'+
          '<section class="capture-evidence-card">'+
            '<section class="capture-media">'+
              '<input id="capture-camera" type="file" accept="image/*" capture="environment" hidden>'+
              '<input id="capture-gallery" type="file" accept="image/*" multiple hidden>'+
              '<button class="capture-camera-tile" id="capture-take" type="button"><span class="capture-tile-icon">⌾</span><span><strong>Camera</strong><small>Take a photo</small></span></button>'+
              '<button class="capture-gallery-tile" id="capture-choose" type="button"><span class="capture-tile-icon">▧</span><span><strong>Gallery</strong><small>Choose photos</small></span></button>'+
            '</section>'+
            '<div class="capture-label">THINGS TO CAPTURE</div><div class="capture-pills">'+g.capture.map(x=>'<span>'+esc2(x)+'</span>').join("")+'</div>'+
          '</section>'+
          '<section class="capture-write-card">'+
            '<div class="capture-label">THINGS TO MENTION</div><div class="capture-pills mention">'+g.mention.map(x=>'<span>'+esc2(x)+'</span>').join("")+'</div>'+
            '<div class="capture-label capture-write-label">WRITE-UP</div><textarea class="capture-note" id="capture-note" placeholder="Write about the process and what you did…"></textarea>'+
            '<div class="capture-actions"><button class="capture-continue" id="capture-continue" type="button">Continue later</button><button class="capture-submit" id="capture-submit" type="button">Submit to Portfolio</button></div>'+
          '</section>'+
          (captured.length?'<section class="capture-photo-panel"><div class="capture-photo-top"><div><div class="capture-label">PHOTOS</div><h3>Your photos</h3></div><span class="capture-count">'+captured.length+' / 6</span></div><div class="capture-preview">'+captured.map(p=>'<img class="capture-thumb" src="'+p+'" alt="Evidence photo">').join("")+'</div></section>':"")+
          (existing.length?'<section class="capture-saved"><h3>Saved evidence</h3>'+existing.slice().reverse().map(e=>'<div class="capture-saved-card"><strong>'+esc2(e.d)+'</strong>'+(e.p&&e.p.length?'<div class="capture-preview">'+e.p.map(p=>'<img class="capture-thumb" src="'+p+'" alt="Saved evidence photo">').join("")+'</div>':"")+(e.w?'<p style="white-space:pre-wrap;font-size:12px;color:#475467">'+esc2(e.w)+'</p>':"")+'</div>').join("")+'</section>':"")+
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
      continueBtn.onclick=()=>{ const w=note.value.trim(); if(!captured.length&&!w)return; const entry={c:course,u:u[0],d:new Date().toLocaleDateString("en-GB"),savedAt:new Date().toLocaleString("en-GB"),p:captured.slice(),w,k:u[1].filter(k=>/^[SKB]\d+\|/.test(k)).map(k=>code(k))}; evidence.push(entry); persist(); if(window.eviaCheckTargets)window.eviaCheckTargets(); nav("portfolio"); };\n      submit.onclick=()=>{
        const w=note.value.trim();
        if(!captured.length||!w)return;
        const entry={c:course,u:u[0],d:new Date().toLocaleDateString("en-GB"),savedAt:new Date().toLocaleString("en-GB"),p:captured.slice(),w,k:u[1].filter(k=>/^[SKB]\d+\|/.test(k)).map(k=>code(k))};
        evidence.push(entry);persist();if(window.eviaCheckTargets)window.eviaCheckTargets();openUnit(i);
      };
    };
    render();
  };
})();
