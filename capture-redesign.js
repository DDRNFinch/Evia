(function(){
  const packs={
    "Mixing mortar":[
      ["Safety & setup","Show the safe mixing area, required PPE/RPE and relevant safety controls."],
      ["Preparation","Show the tools, materials and information you used before mixing."],
      ["Measure the materials","Show the sand and cement being measured and the ratio you are working to."],
      ["Mix the mortar","Show the mortar being mixed by hand or mechanically."],
      ["Check the mix","Show the finished mortar and its consistency before it is used."],
      ["Finished work","Show the mortar ready for use and the completed work it supported, where appropriate."]
    ],
    "Set out Cavity Walling":[
      ["Safety & setup","Show your PPE/RPE, safe working area and relevant controls."],
      ["Read the information","Show the drawing or specification you are working from."],
      ["Set out","Show profiles, levels, measurements and the position of the opening."],
      ["DPCs & cavity details","Show DPCs, cavity trays and weep holes where they apply."],
      ["Wall ties & insulation","Show wall ties and insulation in their correct positions."],
      ["Final check","Show the completed setting-out ready for construction."]
    ]
  };
  const fallback=[
    ["Safety & setup","Show the safe working area and the PPE or other controls you used."],
    ["Preparation","Show the tools, materials and information you used before starting."],
    ["Set up the job","Show your measurements, setting out or preparation."],
    ["Work in progress","Show the main practical activity while you are carrying it out."],
    ["Quality check","Show the work being checked for quality and accuracy."],
    ["Finished job","Show the completed work from a useful overall view."]
  ];
  const esc=s=>String(s??"").replace(/[&<>\"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[x]));
  const photo=file=>new Promise((ok,no)=>{if(!file||!/^image\\//i.test(file.type)||!file.size)return no();const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(file)});
  window.openUnit=async function(i){
    const u=data().u[i]; if(!u){nav("course");return} unit=i;
    const stages=packs[u[0]]||fallback; let n=0,photos=[],answers=[],phase="photos";
    const draw=()=>{
      $("#page-title").textContent=u[0];
      if(phase==="photos"){
        const s=stages[n];
        $("#screen").innerHTML='<div class="guided-capture"><button id="gc-back" class="gc-back">‹ Back</button><div class="gc-kicker">CAPTURE THIS JOB</div><h2>'+esc(s[0])+'</h2><div class="gc-count">Photo '+(n+1)+' of '+stages.length+'</div><div class="gc-tip"><strong>What to show</strong><p>'+esc(s[1])+'</p></div><input id="gc-file" type="file" accept="image/*" capture="environment" hidden><button id="gc-camera" class="gc-camera"><span class="gc-icon">＋</span><strong>Take photo</strong><small>One photo at a time</small></button><button id="gc-skip" class="gc-skip">Skip this one</button>'+(photos.length?'<div class="gc-thumbs">'+photos.map((p,x)=>'<img src="'+p+'" alt="Evidence photo '+(x+1)+'">').join("")+'</div>':"")+'</div>';
        $("#gc-back").onclick=()=>nav("course");
        $("#gc-camera").onclick=()=>$("#gc-file").click();
        $("#gc-file").onchange=async()=>{const f=$("#gc-file").files[0];$("#gc-file").value="";if(!f)return;try{photos.push(await photo(f));n++;if(n>=stages.length)phase="questions";draw()}catch(e){alert("That photo could not be added. Please try again.")}};
        $("#gc-skip").onclick=()=>{n++;if(n>=stages.length)phase="questions";draw()};
      }else{
        const qs=[
          ["What did you do?","Describe the job and what you did."],
          ["What did you check?","Mention the important measurements, materials, tools, safety or quality checks."],
          ["Anything else?","Add anything useful the photos do not show. This is optional."]
        ],q=qs[answers.length];
        $("#screen").innerHTML='<div class="guided-capture"><button id="gc-back" class="gc-back">‹ Back</button><div class="gc-kicker">TELL US ABOUT IT</div><h2>'+esc(q[0])+'</h2><p class="gc-question">'+esc(q[1])+'</p><textarea id="gc-answer" class="gc-answer" placeholder="Type here…"></textarea><button id="gc-next" class="gc-next">'+(answers.length===2?"Save evidence":"Next")+'</button></div>';
        $("#gc-back").onclick=()=>{if(!answers.length){phase="photos";n=Math.max(0,stages.length-1)}else answers.pop();draw()};
        $("#gc-next").onclick=()=>{answers.push($("#gc-answer").value.trim());if(answers.length<3){draw();return}if(!photos.length){alert("Add at least one photo before saving.");phase="photos";n=0;draw();return}const w=answers.filter(Boolean).join("\\n\\n");evidence.push({c:course,u:u[0],d:new Date().toLocaleDateString("en-GB"),savedAt:new Date().toLocaleString("en-GB"),p:photos.slice(),w,k:u[1].filter(k=>/^[SKB]\\d+\\|/.test(k)).map(k=>code(k))});persist();if(window.eviaCheckTargets)window.eviaCheckTargets();openUnit(i)};
      }
    }; draw();
  };
})();