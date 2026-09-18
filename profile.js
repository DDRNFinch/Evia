/* Evia7 learner profile, course selection and welcome experience. */
(function(){
  const KEY="evia7-profile";
  const defaults={name:"",start:"",end:"",avatar:"",signature:""};
  const get=()=>Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||"{}"));
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
      '<div class="profile-block"><div class="profile-kicker">CURRENT COURSE</div><div class="course-options">'+Object.keys(C).map(k=>'<button type="button" class="course-option '+(k===course?"selected":"")+'" data-profile-course="'+k+'">'+esc(C[k].name)+'<span>›</span></button>').join("")+'</div></div>'+
      '<div class="profile-block"><div class="profile-kicker">YOUR SIGNATURE</div><p>Write your signature with your finger. It will be attached to saved evidence with the time and date.</p><div class="signature-wrap"><canvas id="signature-pad" width="900" height="260"></canvas><button type="button" id="clear-signature">Clear</button></div></div>'+
      '<div class="profile-actions"><button type="button" class="secondary" id="save-portfolio">Save portfolio</button><button type="button" class="primary" id="save-profile">Save profile</button></div>'+
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
      const r=new FileReader();r.onload=()=>{p.avatar=r.result;openProfile()};r.readAsDataURL(f);
    };
    document.querySelectorAll("[data-profile-course]").forEach(b=>b.onclick=()=>{
      course=b.dataset.profileCourse;persist();openProfile();
    });
    document.getElementById("profile-close").onclick=()=>document.getElementById("modal-root").innerHTML="";
    document.getElementById("save-profile").onclick=()=>{
      const signature=canvasHasInk(canvas)?canvas.toDataURL("image/png"):(p.signature||"");
      set({name:document.getElementById("profile-name").value.trim(),start:document.getElementById("profile-start").value,end:document.getElementById("profile-end").value,avatar:p.avatar,signature});
      refreshProfileButton();document.getElementById("modal-root").innerHTML="";
    };
    document.getElementById("save-portfolio").onclick=savePortfolio;
  }

  function canvasHasInk(canvas){
    const d=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height).data;
    for(let i=3;i<d.length;i+=4)if(d[i]>20)return true;
    return false;
  }

  function savePortfolio(){
    const p=get();
    const mine=evidence.filter(e=>e.c===course);
    const payload={learner:p.name,course:data().name,standard:data().std,startDate:p.start,endDate:p.end,evidence:mine,savedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Evia-portfolio-"+(p.name||"apprentice").replace(/[^a-z0-9]+/gi,"-")+".json";a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  function refreshProfileButton(){
    const b=document.getElementById("profile-btn");if(!b)return;
    const p=get();b.innerHTML=p.avatar?'<img src="'+p.avatar+'" alt="Profile">':'<span class="profile-default">●</span>';
  }

  function welcome(){
    const p=get();
    const root=document.createElement("div");root.id="welcome-screen";
    root.innerHTML='<div class="welcome-inner">'+
      '<div class="welcome-avatar evia-welcome-face"><span class="evia-eye"></span><span class="evia-eye"></span></div>'+
      '<div class="welcome-pulse"></div>'+
      '<div class="welcome-copy"><div class="welcome-small">EVIA</div><h2>Hi'+(p.name?", "+esc(p.name):"")+'.</h2><p>What do you want to work on today?</p></div>'+
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    root.querySelector(".welcome-avatar").onclick=finishWelcome;
  }

  function finishWelcome(){
    const root=document.getElementById("welcome-screen"),fab=document.getElementById("evia-fab");
    if(!root||!fab)return;
    const target=fab.getBoundingClientRect(),start=root.querySelector(".welcome-avatar").getBoundingClientRect();
    const clone=root.querySelector(".welcome-avatar").cloneNode(true);
    clone.classList.add("welcome-flying");
    Object.assign(clone.style,{left:start.left+"px",top:start.top+"px",width:start.width+"px",height:start.height+"px"});
    document.body.appendChild(clone);
    root.classList.add("leaving");
    const dx=target.left+target.width/2-(start.left+start.width/2),dy=target.top+target.height/2-(start.top+start.height/2);
    requestAnimationFrame(()=>{clone.style.transform="translate("+dx+"px,"+dy+"px) scale("+(target.width/start.width)+")"});
    setTimeout(()=>{root.remove();clone.remove();document.getElementById("screen").classList.add("welcome-revealed")},650);
  }

  window.addEventListener("load",()=>{
    refreshProfileButton();
    document.getElementById("profile-btn").onclick=openProfile;
    /* Keep course selection exclusively in Profile rather than displaying
       course-switching controls throughout Course/Progress/Portfolio. */
    const style=document.createElement("style");
    style.textContent=`
      .course-picker{display:none!important}
      .profile-btn{overflow:hidden;padding:0;display:grid;place-items:center}
      .profile-btn img,.profile-photo{width:100%;height:100%;object-fit:cover;border-radius:50%}
      .profile-default{font-size:17px;color:#596273}
      .profile-overlay{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.18);backdrop-filter:blur(12px);display:flex;align-items:flex-end}
      .profile-sheet{width:100%;max-height:90vh;overflow:auto;background:#fbfaf7;border-radius:28px 28px 0 0;padding:22px 20px calc(24px + env(safe-area-inset-bottom));box-sizing:border-box;box-shadow:0 -18px 55px rgba(16,24,40,.16)}
      .profile-head,.profile-avatar-row,.profile-dates,.profile-actions{display:flex;align-items:center;justify-content:space-between;gap:14px}
      .profile-kicker,.welcome-small{font-size:10px;letter-spacing:.14em;color:#9aa3af;font-weight:700}
      .profile-head h2{margin:5px 0 0;font-size:22px;letter-spacing:-.03em}
      .profile-close{width:34px;height:34px;border:0;border-radius:50%;background:#eef1f4;font-size:22px;color:#667085}
      .profile-avatar-row{justify-content:flex-start;margin:22px 0}
      .profile-avatar-row p,.profile-block p{font-size:12px;color:#7b8797;line-height:1.5;margin:5px 0 10px}
      .profile-photo{width:72px;height:72px;border:1px solid #e2e6eb;flex:0 0 72px}
      .profile-placeholder{display:grid;place-items:center;background:#f2f4f7;color:#a0aaba;font-size:24px}
      .profile-upload{display:inline-block;padding:9px 12px;border:1px solid #dfe4ea;border-radius:12px;background:#fff;font-size:12px;color:#4d5969}
      .profile-upload input{display:none}
      .profile-fields{display:grid;gap:12px}
      .profile-fields label,.profile-dates label{font-size:11px;color:#788496}
      .profile-fields input,.profile-dates input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border:1px solid #dfe4ea;border-radius:13px;background:#fff;font-size:14px}
      .profile-dates{align-items:stretch}.profile-dates label{flex:1}
      .profile-block{margin-top:22px}
      .course-options{display:grid;gap:7px;margin-top:9px}
      .course-option{display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 14px;border:1px solid #e6e9ed;border-radius:14px;background:#fff;text-align:left;font-size:13px;color:#4e5969}
      .course-option.selected{background:#fff8d8;border-color:#ead277;color:#5f5200}
      .course-option span{font-size:20px;color:#a2aab5}
      .signature-wrap{position:relative;margin-top:9px;background:#fff;border:1px solid #dfe4ea;border-radius:15px;overflow:hidden}
      #signature-pad{display:block;width:100%;height:150px;touch-action:none}
      #clear-signature{position:absolute;right:8px;top:8px;border:0;border-radius:10px;background:#f1f3f5;padding:7px 9px;font-size:11px;color:#667085}
      .profile-actions{margin-top:20px}.profile-actions .primary,.profile-actions .secondary{flex:1}
      .evidence-signoff{margin-top:14px;padding:12px 0;border-top:1px solid #edf0f3;display:grid;gap:5px}
      .evidence-signoff img{display:block;width:180px;height:52px;object-fit:contain;object-position:left center}
      .evidence-signoff small{font-size:10px;color:#9aa3af}
      .welcome-avatar{cursor:pointer}
      #welcome-screen{position:fixed;inset:0;z-index:2000;background:#fffdfa;display:grid;place-items:center;opacity:0;transition:opacity .45s ease}
      #welcome-screen.visible{opacity:1}
      #welcome-screen.leaving{opacity:0}
      .welcome-inner{text-align:center;position:relative;display:flex;flex-direction:column;align-items:center;gap:22px}
      .welcome-avatar{width:118px;height:118px;border-radius:50%;border:4px solid #e6b800;background:#fffdfa;box-shadow:0 18px 45px rgba(16,24,40,.12);display:grid;place-items:center;position:relative;z-index:2;overflow:hidden;cursor:pointer}
      .welcome-avatar .profile-placeholder{width:100%;height:100%;border-radius:50%}
      .welcome-pulse{position:absolute;width:150px;height:150px;border:1px solid #e6b800;border-radius:50%;animation:welcomePulse 2.1s ease-out infinite}
      .welcome-copy h2{font-size:28px;letter-spacing:-.045em;margin:0 0 5px}.welcome-copy p{font-size:15px;color:#7b8797;margin:0}
      .welcome-copy button{margin-top:17px;border:0;background:#151c2b;color:#fff;border-radius:14px;padding:12px 18px;font-size:13px}
      .welcome-flying{position:fixed;z-index:2100;border-radius:50%;border:3px solid #e6b800;background:#fffdfa;object-fit:cover;display:grid;place-items:center;box-shadow:0 10px 25px rgba(16,24,40,.12);transition:transform .62s cubic-bezier(.2,.75,.2,1)}
      .welcome-revealed{animation:revealScreen .42s ease both}
      @keyframes welcomePulse{0%{transform:scale(.75);opacity:.75}70%,100%{transform:scale(1.25);opacity:0}}
      @keyframes revealScreen{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
      @media(prefers-reduced-motion:reduce){#welcome-screen,.welcome-flying,.welcome-revealed{animation:none!important;transition:none!important}.welcome-pulse{animation:none!important}}
    `;
    document.head.appendChild(style);
    welcome();
  });
})();