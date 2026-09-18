/* Evia7 evidence UX: thumbnail-first, three-stage capture. */
(function(){
  const makeThumb=file=>new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=640, scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
        const c=document.createElement("canvas");
        c.width=Math.max(1,Math.round(img.naturalWidth*scale));
        c.height=Math.max(1,Math.round(img.naturalHeight*scale));
        c.getContext("2d",{alpha:false}).drawImage(img,0,0,c.width,c.height);
        c.toBlob(blob=>{
          if(!blob)return reject(new Error("thumbnail"));
          const rr=new FileReader(); rr.onload=()=>resolve(rr.result); rr.onerror=reject; rr.readAsDataURL(blob);
        },"image/jpeg",.72);
      };
      img.onerror=reject; img.src=r.result;
    };
    r.onerror=reject; r.readAsDataURL(file);
  });

  function renderStagePhotos(){
    for(let s=0;s<3;s++){
      const g=$("#stage-"+s); if(!g)continue;
      const items=photos.map((p,i)=>({p,i})).filter(x=>x.p.stage===s);
      g.innerHTML=items.map(x=>'<div class="photo-item"><img class="thumb" src="'+x.p.src+'" alt="Evidence photo"><button type="button" class="photo-remove" data-remove="'+x.i+'">×</button></div>').join("");
      g.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{photos.splice(+b.dataset.remove,1);renderStagePhotos()});
    }
  }

  window.openUnit=function(i){
    screen="unit"; unit=i; photos=[];
    const u=data().u[i];
    const stages=[
      ["Beginning","Show the starting point: preparation, drawings/setting out, tools, materials and safety controls where relevant."],
      ["Middle","Show the work in progress: key techniques, measurements, materials, fixings, checks and decisions."],
      ["End","Show the finished result: quality, accuracy, finish, protection and relevant final checks."]
    ];
    $("#page-title").textContent=u[0];
    $("#screen").innerHTML=
      '<button class="secondary" id="back">‹ Course</button>'+
      '<div class="card unit-hero"><div class="unit-number">UNIT '+(i+1)+'</div><h2>'+esc(u[0])+'</h2><p>Capture the job in three simple moments. You can add as many photos as you need.</p></div>'+
      '<div class="evidence-stages">'+stages.map((s,n)=>
        '<section class="stage-card">'+
          '<div class="stage-top"><span class="stage-dot">'+(n+1)+'</span><div><div class="stage-kicker">'+s[0]+' of the job</div><p>'+s[1]+'</p></div></div>'+
          '<label class="stage-camera"><span>＋</span> Add photo<input class="stage-file" type="file" accept="image/*" capture="environment" multiple data-stage="'+n+'"></label>'+
          '<div class="stage-photos" id="stage-'+n+'"></div>'+
        '</section>'
      ).join("")+'</div>'+
      '<div class="guidance"><strong>Your write-up</strong><p>Describe what you did, how you did it, the tools and materials used, the checks you made, and anything you solved or adjusted. This helps explain the evidence across the whole job.</p></div>'+
      '<textarea id="write" placeholder="Describe the job in your own words…"></textarea>'+
      '<details class="ksb-details"><summary>Unit evidence guide</summary><div class="ksb-list">'+u[1].map(k=>'<div class="ksb"><span class="code">'+esc(code(k))+'</span><div class="ksbtext">'+esc(text(k))+'</div></div>').join("")+'</div></details>'+
      '<button class="primary" id="save">Save evidence</button>';

    $("#back").onclick=courses;
    document.querySelectorAll(".stage-file").forEach(input=>input.onchange=async e=>{
      const stage=+e.target.dataset.stage;
      const files=[...e.target.files];
      if(!files.length)return;
      try{
        /* Compress immediately on capture/selection. The original file is never
           placed into photos, rendered as the evidence thumbnail, or persisted. */
        const thumbs=await Promise.all(files.map(makeThumb));
        thumbs.forEach(src=>photos.push({src,stage}));
        e.target.value="";
        renderStagePhotos();
      }catch(_){alert("That photo could not be added. Please try again.");}
    });
    $("#save").onclick=saveStagedEvidence;
    renderStagePhotos();
  };

  function saveStagedEvidence(){
    const w=$("#write").value.trim();
    if(!photos.length&&!w){alert("Add at least one photo or some written evidence.");return;}
    const save=$("#save"); save.disabled=true; save.textContent="Saving…";
    const u=data().u[unit];
    evidence.push({
      id:Date.now(),c:course,u:u[0],d:new Date().toLocaleString("en-GB"),
      p:photos.map(x=>x.src),w:w,k:u[1].map(code),
      stages:{
        beginning:photos.filter(x=>x.stage===0).length,
        middle:photos.filter(x=>x.stage===1).length,
        end:photos.filter(x=>x.stage===2).length
      }
    });
    persist(); screen="portfolio"; render();
  }

  window.addEventListener("load",()=>{
    const style=document.createElement("style");
    style.textContent=`
      .unit-hero{margin-top:12px}
      .evidence-stages{display:grid;gap:10px;margin-top:12px}
      .stage-card{background:rgba(255,255,255,.94);border:1px solid #e8ebef;border-radius:20px;padding:15px;box-shadow:0 4px 16px rgba(16,24,40,.035)}
      .stage-top{display:flex;gap:12px;align-items:flex-start}
      .stage-dot{display:grid;place-items:center;flex:0 0 28px;height:28px;border-radius:50%;background:#fff7d2;color:#756000;font-size:12px;font-weight:700}
      .stage-kicker{font-size:15px;font-weight:700;letter-spacing:-.015em}
      .stage-top p{margin:5px 0 0;font-size:12.5px;line-height:1.48;color:#7c8797}
      .stage-camera{display:flex;align-items:center;gap:7px;width:max-content;margin:13px 0 0;padding:9px 12px;border:1px solid #e1e5ea;border-radius:13px;font-size:12px;color:#4e5969;background:#fafbfc}
      .stage-camera span{font-size:18px;line-height:12px}
      .stage-file{display:none}
      .stage-photos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:10px}
      .stage-photos:empty{display:none}
      .photo-item{position:relative;min-width:0}
      .thumb{display:block;width:100%;height:72px;object-fit:cover;border-radius:10px;box-shadow:none}
      .photo-remove{position:absolute;right:4px;top:4px;width:22px;height:22px;border:0;border-radius:50%;background:rgba(16,24,40,.72);color:#fff;line-height:18px}
      .guidance{margin-top:12px}
      .guidance p{font-size:13px;line-height:1.55;color:#6f7988;margin:6px 0 0}
      #write{width:100%;box-sizing:border-box;margin-top:10px}
      .ksb-details{margin:14px 2px;color:#687386}
      .ksb-details summary{font-size:12px;cursor:pointer;list-style:none}
      .ksb-details summary::-webkit-details-marker{display:none}
      .ksb-details summary:after{content:"＋";float:right;font-size:16px}
      .ksb-details[open] summary:after{content:"−"}
      .ksb-list{margin-top:10px;display:grid;gap:8px}
      .ksb-list .ksb{background:#fff;border:1px solid #edf0f3;border-radius:13px;padding:10px}
      @media(min-width:600px){.evidence-stages{grid-template-columns:repeat(3,1fr)}}
    `;
    document.head.appendChild(style);
  });
})();