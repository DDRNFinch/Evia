/* Evia7 UI refresh: Home screen, grouped Progress with "My stats", photo Portfolio and Evia's coaching in the chat.
   Loads last and replaces the screen functions from app.js; data and storage are unchanged. */
(function(){
  const PPE_UNIT="Personal protective equipment";
    const escHtml=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const pick=list=>list[Math.floor(Math.random()*list.length)];
  const entryTime=e=>{const t=Date.parse(e.savedAt||"");if(!isNaN(t))return t;const m=String(e.d||"").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);return m?new Date(+m[3],m[2]-1,+m[1]).getTime():0};
  const firstName=()=>String(readJson("evia7-profile",{}).name||"").trim().split(/\s+/)[0]||"";
  const partOfDay=()=>{const h=new Date().getHours();return h<12?"Morning":h<18?"Afternoon":"Evening"};
  const icon=(d,size=20)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>';
  const ICONS={
    clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
    camera:'<rect x="3" y="6.5" width="18" height="14" rx="3"/><path d="M8 6.5l1.4-2h5.2l1.4 2"/><circle cx="12" cy="13.5" r="3.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    chev:'<path d="m9 5 7 7-7 7"/>',
    back:'<path d="m15 5-7 7 7 7"/>',
    test:'<path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15l-3-1.8-3 1.8-3-1.8-3 1.8V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M9 8.5h6M9 12h6"/>'
  };
  function ring(pct,size,stroke,label,sub){
    const r=(size-stroke)/2,c=2*Math.PI*r,dash=Math.max(0,Math.min(1,pct/100))*c;
    return '<span class="ui-ring" style="width:'+size+'px;height:'+size+'px">'+
      '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" aria-hidden="true"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="ui-ring-track" stroke-width="'+stroke+'"/>'+(dash>0?'<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="ui-ring-fill" stroke-width="'+stroke+'" stroke-dasharray="'+dash.toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/>':"")+'</svg>'+
      (label!=null?'<span class="ui-ring-label"><strong>'+label+'</strong>'+(sub?'<small>'+sub+'</small>':"")+'</span>':"")+
    '</span>';
  }

  /* ---------- Shared analysis used by Home and the coach ---------- */
  function analyse(){
    const units=data().u,entries=evidence.filter(e=>e.c===course);
    const evidenced=new Set(entries.flatMap(e=>Array.isArray(e.k)?e.k:[]));
    const all=allK(),met=all.filter(x=>evidenced.has(x[0])).length;
    const ksbPct=all.length?Math.round(met/all.length*100):0;
    const unitInfo=units.map((u,i)=>{
      const codes=[...new Set(u[1].map(code))];
      const es=entries.filter(e=>e.u===u[0]);
      return {index:i,name:u[0],codes,missing:codes.filter(c=>!evidenced.has(c)),entries:es,started:es.length>0};
    });
    const quickest=unitInfo.filter(u=>u.missing.length).sort((a,b)=>b.missing.length-a.missing.length||(a.started-b.started)||a.index-b.index)[0]||null;
    const packs=readJson("evia7-working-evidence-packs",{});
    const drafts=Object.values(packs).filter(p=>p&&p.course===course&&((p.photos||[]).length||String(p.write||"").trim())).map(p=>unitInfo.find(u=>u.name===p.unit)).filter(Boolean);
    const lastEntry=entries.slice().sort((a,b)=>entryTime(b)-entryTime(a))[0]||null;
    const daysSince=lastEntry?Math.floor((Date.now()-entryTime(lastEntry))/864e5):null;
    const p=readJson("evia7-profile",{});
    let timePct=null,endDate=null;
    if(p.start&&p.end){
      const s=new Date(p.start+"T00:00:00").getTime(),e=new Date(p.end+"T23:59:59").getTime();
      if(e>s){timePct=Math.round(Math.max(0,Math.min(1,(Date.now()-s)/(e-s)))*100);endDate=new Date(e)}
    }
    const otj=hours.reduce((n,x)=>n+Number(x.n||0),0);
    return {units:unitInfo,entries,evidenced,met,total:all.length,ksbPct,quickest,drafts,lastEntry,daysSince,timePct,endDate,otj};
  }
  function suggestion(a){
    if(a.drafts.length){const d=a.drafts[0];return {unit:d,text:pick(["You started "+d.name+" but haven’t submitted it yet. Finish it off and it counts towards your KSBs.","Your "+d.name+" evidence is still a draft. Submit it and those KSBs get ticked off."]),action:"Finish "+d.name,draft:true}}
    if(a.quickest){const q=a.quickest,n=q.missing.length;return {unit:q,text:q.name+" covers "+n+" KSB"+(n===1?"":"s")+" you haven’t got evidence for yet. That’s your quickest win.",action:"Open "+q.name}}
    return {unit:null,text:"Every KSB on your course has some evidence. Keep strengthening the units with the least photos and detail.",action:null};
  }

  /* ---------- Home ---------- */
  function home(){
    $("#page-title").textContent="Home";
    const a=analyse();
    const recent=a.entries.slice().sort((x,y)=>entryTime(y)-entryTime(x)).slice(0,2);
    const timeDetail=a.timePct==null?"Dates not set":a.timePct+"%";
    $("#screen").innerHTML=
      '<div class="ui-page">'+
        '<section class="ui-card ui-progress-card" id="ui-home-progress" role="button" tabindex="0" aria-label="Open progress">'+
          ring(a.ksbPct,104,11,a.ksbPct+"%","KSBs")+
          '<div class="ui-progress-lines">'+
            '<div class="ui-line"><div class="ui-line-head"><span>Course time</span><span>'+escHtml(timeDetail)+'</span></div><div class="ui-track"><span style="width:'+(a.timePct||0)+'%"></span></div></div>'+
            '<div class="ui-line"><div class="ui-line-head"><span>Off-the-job</span><span>'+a.otj.toFixed(1)+' hrs</span></div><div class="ui-track"><span style="width:'+Math.min(100,a.otj/3)+'%"></span></div></div>'+
            '<span class="ui-accent-text">'+a.met+' of '+a.total+' KSBs have evidence</span>'+
          '</div>'+
        '</section>'+
        '<div class="ui-quick">'+
          '<button type="button" class="ui-card ui-quick-btn" id="ui-log-otj"><span class="ui-icon-chip">'+icon(ICONS.clock)+'</span><span>Log OTJ hours</span></button>'+
          '<button type="button" class="ui-card ui-quick-btn" id="ui-practice"><span class="ui-icon-chip">'+icon(ICONS.test)+'</span><span>Practice</span>'+(window.eviaPractice&&window.eviaPractice.epaDue()?'<em class="ui-due">EPA</em>':"")+'</button>'+
        '</div>'+
        '<section class="ui-section"><div class="ui-section-head"><h2>Recent evidence</h2>'+(recent.length?'<button type="button" class="ui-link" id="ui-see-all">See all</button>':"")+'</div>'+
          (recent.length?'<div class="ui-recent">'+recent.map((e,i)=>'<button type="button" class="ui-recent-item" data-recent="'+i+'"><span class="ui-photo" data-recent-photo="'+i+'">'+icon(ICONS.camera,22)+'</span><strong>'+escHtml(e.u)+'</strong><small>'+escHtml(new Date(entryTime(e)).toLocaleDateString("en-GB",{day:"numeric",month:"short"}))+'</small></button>').join("")+'</div>'
          :'<div class="ui-card ui-empty"><span class="ui-icon-chip">'+icon(ICONS.camera)+'</span><p>Your evidence will show up here once you submit your first unit.</p></div>')+
        '</section>'+
      '</div>';
    const prog=$("#ui-home-progress");prog.onclick=()=>nav("progress");prog.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();nav("progress")}};
    $("#ui-log-otj").onclick=()=>nav("learning");
    $("#ui-practice").onclick=()=>window.eviaPractice&&window.eviaPractice.openHub();
    const all=$("#ui-see-all");if(all)all.onclick=()=>nav("portfolio");
    document.querySelectorAll("[data-recent]").forEach(b=>b.onclick=()=>{const e=recent[+b.dataset.recent];if(window.eviaOpenSendToPortfolio)window.eviaOpenSendToPortfolio(e.u)});
    recent.forEach(async(e,i)=>{
      try{const photos=window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]);const el=document.querySelector('[data-recent-photo="'+i+'"]');if(el&&photos[0])el.innerHTML='<img src="'+photos[0]+'" alt="">'}catch(_){}
    });
    homeNudge();
  }

  /* ---------- Evia speaks from her button: one Evia on screen ---------- */
  const TIP_KEY="evia7-home-tip";
  let bubbleTimer=null;
  function hideBubble(){
    clearTimeout(bubbleTimer);
    const el=document.getElementById("ui-evia-bubble");
    if(el){el.classList.remove("show");setTimeout(()=>el.remove(),260)}
  }
  function eviaSay(html,actions){
    hideBubble();
    const el=document.createElement("div");
    el.id="ui-evia-bubble";el.className="ui-evia-bubble";el.setAttribute("role","status");el.setAttribute("aria-live","polite");
    el.innerHTML='<p>'+html+'</p>'+(actions&&actions.length?'<div class="ui-evia-bubble-actions">'+actions.map((a,i)=>'<button type="button" class="'+(a.primary?"primary":"secondary")+'" data-bubble-action="'+i+'">'+escHtml(a.label)+'</button>').join("")+'</div>':"");
    document.body.appendChild(el);
    el.querySelectorAll("[data-bubble-action]").forEach(b=>b.onclick=()=>{const a=actions[+b.dataset.bubbleAction];hideBubble();a.run&&a.run()});
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add("show")));
    if(window.eviaMood)window.eviaMood("happy");
  }
  /* One nudge a day on Home: the most useful thing from My stats. Achievements are celebrated first. */
  function homeNudge(){
    hideBubble();
    if(document.body.classList.contains("evia-onboarding")||!window.eviaStats)return;
    let n;try{n=window.eviaStats.nudges(window.eviaStats.compute())[0]}catch(_){return}
    if(!n)return;
    const today=new Date().toDateString(),seen=readJson(TIP_KEY,{});
    if(seen.day===today&&(!n.celebrate||seen.id===n.id))return;
    const name=firstName();
    bubbleTimer=setTimeout(()=>{
      if(screen!=="home"||document.querySelector(".chat-sheet"))return;
      const dismiss=()=>{localStorage.setItem(TIP_KEY,JSON.stringify({day:today,id:n.id}));if(n.achievements)window.eviaStats.markSeen(n.achievements)};
      const lead=n.celebrate?(name?"Well done "+escHtml(name)+"! ":"Well done! "):partOfDay()+(name?" "+escHtml(name):"")+". ";
      eviaSay(lead+n.text,[{label:n.action.label,primary:true,run:()=>{dismiss();runNudge(n)}},{label:"Not now",run:dismiss}]);
      if(n.celebrate&&window.eviaMood)window.eviaMood("happy");
    },900);
  }
  /* Carries out a nudge's action from Home or the chat. */
  function runNudge(n){
    const kind=n.action.kind,inChat=!!chatBox();
    const go=fn=>{if(inChat)closeChat();setTimeout(fn,inChat?60:0)};
    if(kind==="stats")go(showStats);
    else if(kind==="course")go(()=>nav("course"));
    else if(kind==="learning")go(()=>nav("learning"));
    else if(kind==="scenario")go(()=>window.eviaScenarios&&window.eviaScenarios.openNext());
    else if(kind==="confidence")go(()=>window.eviaPractice&&window.eviaPractice.openConfidence());
    else if(kind==="test"){
      const t={epa:["epa",20],maths:["maths",5],english:["english",5]}[n.id]||["epa",5];
      startTest(t[0],t[1],n.action.label);
    }
  }
  /* Runs a test in the chat. Opening the chat for a test skips Evia's "what I'd do today". */
  function startTest(type,count,label){
    const run=()=>{userSays(label);window.eviaTestMe&&window.eviaTestMe({type,count})};
    if(chatBox())queue=queue.then(run);
    else{window.chat({quiet:true});setTimeout(run,50)}
  }
  function showStats(){
    if(screen!=="progress")nav("progress");
    setTimeout(()=>{const el=document.getElementById("ui-stats");if(el)el.scrollIntoView({behavior:window.eviaAccessibility&&window.eviaAccessibility.reducedMotion()?"auto":"smooth",block:"start"})},80);
  }
  /* ---------- Progress ---------- */
  const GROUPS=[["K","Knowledge"],["S","Skills"],["B","Behaviours"]];
  let expanded={}; /* groups start collapsed: three rings, tap one to see its KSBs */
  function progressScreen(){
    $("#page-title").textContent="Progress";
    const a=analyse(),all=allK(),supporting=supportingMeta().filter(s=>s.course===course);
    const hasSupport=c=>supporting.some(s=>Array.isArray(s.ksbs)&&s.ksbs.includes(c));
    let pace="";
    if(a.timePct!=null){const gap=a.timePct-a.ksbPct;pace=gap>10?"A little behind: aim for a couple of units this month.":gap<-5?"You’re ahead of schedule. Great work.":"You’re on track."}
    else pace="Add your start and end dates in Profile to see if you’re on track.";
    const st=(()=>{try{return window.eviaStats?window.eviaStats.compute():null}catch(_){return null}})();
    if(st&&st.weeksPerUnit!=null){const w=Math.max(1,Math.floor(st.weeksPerUnit));pace+=" About "+w+" week"+(w===1?"":"s")+" per unit left."}
    $("#screen").innerHTML=
      '<div class="ui-page">'+
        '<section class="ui-summary">'+
          ring(a.ksbPct,112,12,a.ksbPct+"%","of KSBs")+
          '<div class="ui-summary-lines">'+
            '<div><small>Course time</small><strong>'+(a.timePct==null?"Not set":a.timePct+"%"+(a.endDate?" · ends "+a.endDate.toLocaleDateString("en-GB",{month:"short",year:"numeric"}):""))+'</strong></div>'+
            '<div><small>Off-the-job</small><strong>'+a.otj.toFixed(1)+' hours'+(st?' · '+(Math.round(st.otjWeek*10)/10)+' this week':"")+'</strong></div>'+
            '<span class="ui-accent-text">'+escHtml(pace)+'</span>'+
          '</div>'+
        '</section>'+
        '<section class="ui-card ui-groups">'+GROUPS.map(([letter,label],gi)=>{
          const items=all.filter(x=>x[0].startsWith(letter));if(!items.length)return"";
          const done=items.filter(x=>a.evidenced.has(x[0])).length,pct=Math.round(done/items.length*100),open=!!expanded[letter];
          return (gi?'<div class="ui-divider"></div>':"")+
            '<button type="button" class="ui-group-head" data-group="'+letter+'" aria-expanded="'+open+'">'+ring(pct,44,5,null)+
              '<span class="ui-group-copy"><strong>'+label+'</strong><small>'+done+' of '+items.length+' with evidence</small></span><span class="ui-group-pct">'+pct+'%</span><span class="ui-chev'+(open?" open":"")+'">'+icon(ICONS.chev,18)+'</span></button>'+
            (open?'<div class="ui-ksb-grid">'+items.map(x=>{const met=a.evidenced.has(x[0]);return '<button type="button" class="ui-ksb'+(met?" met":"")+'" data-ksb-code="'+escHtml(x[0])+'" aria-label="'+escHtml(x[0])+(met?", evidence captured":"")+'">'+(met?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>':"")+escHtml(x[0])+(hasSupport(x[0])?'<i class="ui-ksb-dot" aria-label="Supporting evidence"></i>':"")+'</button>'}).join("")+'</div>':"");
        }).join("")+'<p class="ui-help">Tap a KSB to see its wording and the evidence mapped to it.</p></section>'+
        (st&&window.eviaStats?window.eviaStats.sectionHtml(st):"")+
      '</div>';
    document.querySelectorAll("[data-group]").forEach(b=>b.onclick=()=>{expanded[b.dataset.group]=!expanded[b.dataset.group];progressScreen()});
    document.querySelectorAll("[data-st-action]").forEach(b=>b.onclick=()=>{if(!window.eviaPractice)return;if(b.dataset.stAction==="tests")window.eviaPractice.openHub();else if(b.dataset.stAction==="scenarios"){if(window.eviaScenarios)window.eviaScenarios.openTopics()}else window.eviaPractice.openConfidence()});
    document.querySelectorAll("[data-ksb-code]").forEach(b=>b.onclick=()=>{const item=all.find(x=>x[0]===b.dataset.ksbCode);if(item)ksbDetail(item[0],item[1],a.evidenced.has(item[0]))});
  }

  /* ---------- Portfolio ---------- */
  function portfolioScreen(){
    $("#page-title").textContent="Portfolio";
    const a=analyse(),supporting=supportingMeta().filter(x=>x.course===course),reviews=window.eviaGetReviews?window.eviaGetReviews():[];
    const tiles=a.units.map(u=>({name:u.name,index:u.index,entries:u.entries}));
    const ppe=a.entries.filter(e=>e.u===PPE_UNIT);
    if(ppe.length)tiles.unshift({name:PPE_UNIT,index:-1,entries:ppe});
    const shown=tiles.filter(t=>t.entries.length),notStarted=a.units.filter(u=>!u.started).length;
    const bars=level=>{const n={strong:3,good:2,weak:1}[level]||0;return '<span class="ui-bars" aria-label="Evidence strength: '+(level||"none")+'">'+[0,1,2].map(i=>'<i class="'+(i<n?"on":"")+'" style="height:'+(5+i*3)+'px"></i>').join("")+'</span>'};
    $("#screen").innerHTML=
      '<div class="ui-page">'+
        '<div class="ui-tabs" role="tablist"><button type="button" class="on" aria-selected="true">Units</button><button type="button" id="ui-tab-supporting">Supporting <span>'+supporting.length+'</span></button><button type="button" id="ui-tab-reviews">Reviews <span>'+reviews.length+'</span></button><button type="button" id="ui-tab-logs">Logs <span>'+hours.length+'</span></button></div>'+
        (shown.length?'<div class="ui-gallery">'+shown.map((t,i)=>'<button type="button" class="ui-tile" data-unit-open="'+escHtml(t.name)+'"><span class="ui-tile-photo" data-cover="'+i+'">'+icon(ICONS.camera,26)+'</span><span class="ui-tile-scrim"><strong>'+escHtml(t.name)+'</strong><span class="ui-tile-meta"><small>'+t.entries.length+' saved</small>'+bars(t.index>=0?unitStrengthForCourse(t.name):"good")+'</span></span></button>'
        ).join("")+'</div>':'<div class="ui-card ui-empty"><span class="ui-icon-chip">'+icon(ICONS.camera)+'</span><p>Your evidence will show up here once you submit your first unit.</p></div>')+
        (notStarted?'<button type="button" class="ui-card ui-more-units" id="ui-not-started"><span>'+notStarted+' unit'+(notStarted===1?"":"s")+' not started yet</span><strong>Go to Course '+icon(ICONS.chev,16)+'</strong></button>':"")+
      '</div>';
    const ns=$("#ui-not-started");if(ns)ns.onclick=()=>nav("course");
    document.querySelectorAll("[data-unit-open]").forEach(b=>b.onclick=()=>{const n=b.getAttribute("data-unit-open");if(window.eviaOpenSendToPortfolio)window.eviaOpenSendToPortfolio(n);else if(window.downloadUnitEvidencePack)window.downloadUnitEvidencePack(n)});
    $("#ui-tab-supporting").onclick=()=>openSupportingPortfolio();
    $("#ui-tab-reviews").onclick=()=>openSavedReviews();
    $("#ui-tab-logs").onclick=()=>openSavedLearningLogs();
    shown.forEach(async(t,i)=>{
      const latest=t.entries.slice().sort((x,y)=>entryTime(y)-entryTime(x));
      try{
        for(const e of latest){
          const photos=window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]);
          if(photos[0]){const el=document.querySelector('[data-cover="'+i+'"]');if(el)el.innerHTML='<img src="'+photos[0]+'" alt="">';break}
        }
      }catch(_){}
    });
  }

  /* ---------- Evia chat: stats, write-ups and KSB gaps ---------- */
  const chatBox=()=>document.getElementById("chat");
  const scrollChat=()=>{const c=chatBox();if(c)c.scrollTop=c.scrollHeight};
  let queue=Promise.resolve(),chatGen=0; /* chatGen stops messages queued in a closed chat landing in the next one */
  /* app.js animates each new Evia bubble with "Evia is thinking", so messages are queued to arrive one at a time. */
  function say(html){
    const gen=chatGen;
    queue=queue.then(()=>new Promise(resolve=>{
      const c=chatBox();if(!c||gen!==chatGen)return resolve();
      const d=document.createElement("div");d.className="bubble evia";d.innerHTML=html;c.appendChild(d);scrollChat();
      setTimeout(resolve,1350);
    }));
    return queue;
  }
  function userSays(text){const c=chatBox();if(!c)return;const d=document.createElement("div");d.className="bubble user";d.textContent=text;c.appendChild(d);scrollChat()}
  function replies(list){
    const gen=chatGen;
    queue=queue.then(()=>{
      const c=chatBox();if(!c||gen!==chatGen)return;
      const box=document.createElement("div");box.className="chat-options ui-replies";
      list.forEach(r=>{const b=document.createElement("button");b.type="button";b.className="chat-pill"+(r.primary?" ui-pill-primary":"");b.innerHTML="<strong>"+escHtml(r.label)+"</strong>";b.onclick=()=>{box.remove();userSays(r.label);r.run()};box.appendChild(b)});
      c.appendChild(box);scrollChat();
    });
  }
  function closeChat(){const x=document.getElementById("x");if(x)x.click()}
  const openUnitFromChat=u=>{closeChat();setTimeout(()=>openUnit(u.index),60)};
  const plural=(n,word)=>n+" "+word+(n===1?"":"s");
  const listText=items=>items.length<2?items.join(""):items.slice(0,-1).join(", ")+" and "+items[items.length-1];
  const more=exclude=>[
    {label:"Check my write-ups",run:writeups},
    {label:"Which KSBs am I missing?",run:ksbGaps},
    {label:"My stats",run:myStats},
    {label:"Something else",run:somethingElse}
  ].filter(r=>r.label!==exclude);

  /* Greedy pick of units that cover the most KSBs still missing evidence. */
  function coverPlan(a){
    const left=new Set(a.units.flatMap(u=>u.missing)),plan=[];
    while(left.size){
      const best=a.units.map(u=>({u,gain:u.codes.filter(c=>left.has(c))})).sort((x,y)=>y.gain.length-x.gain.length||x.u.index-y.u.index)[0];
      if(!best||!best.gain.length)break;
      plan.push({unit:best.u,covers:best.gain});best.gain.forEach(c=>left.delete(c));
    }
    return plan;
  }


  /* ---------- Write-up checker ---------- */
  /* Trade wording that counts as covering a "Things to mention" point, beyond the words themselves. */
  const SYNONYMS={
    "ratio":/\bratios?\b|\b\d+\s*(?::|to)\s*\d+\b|\bparts?\b/,
    "ppe":/\bppe\b|hard ?hat|helmet|hi-?vis|high[- ]vis|gloves?|goggles|safety glasses|glasses|boots|ear (?:defenders|plugs|protection)|dust mask|respirator/,
    "rpe":/\brpe\b|dust mask|respirator|ffp\d|mask/,
    "lev":/\blev\b|extract(?:ion|or)|dust extraction|vacuum/,
    "health & safety":/safe|safety|hazard|risk/,
    "safety":/safe|safety|hazard|risk/,
    "health":/health|wellbeing|well-being|break|hydrat|drink|tired|fatigue/,
    "wellbeing":/wellbeing|well-being|health|break|stress|hydrat|drink|tired|fatigue/,
    "mental":/mental|stress|wellbeing|well-being|talk(?:ed)? to/,
    "physical health":/health|stretch|back|lifting|posture|break/,
    "teamwork":/team|colleague|together|helped|help(?:ing)? (?:the|a|my)|labourer|gang|supervisor|foreman|mate/,
    "communication":/talk|spoke|told|asked|explain|communicat|briefing|radio|discuss/,
    "gauging":/gaug|measur\w* (?:the )?(?:sand|cement)|bucket|gauge box/,
    "silos":/\bsilos?\b/,
    "pre-mix":/pre-?mix|ready-?mix|bagged|premix/,
    "hand":/by hand|hand mix|shovel|spade/,
    "mechanical":/mixer|mechanical|drill|paddle/,
    "mortar quantity":/quantit|how much mortar|batch|bags? of|enough mortar|tonnes?/,
    "safety signage":/\bsigns?\b|signage/,
    "manual handling":/lift|carr(?:y|ied)|manual handling|two-man|team lift|trolley|barrow/,
    "working at height":/height|scaffold|ladder|platform|podium|harness|stepladder/,
    "dpcs":/\bdpcs?\b|damp[- ]?proof/,
    "wall ties":/\bties?\b/,
    "brick ties":/\bties?\b/,
    "cavity trays":/cavity trays?|\btrays?\b/,
    "insulation":/insulat|\bbatts?\b|kingspan|celotex|rockwool|\bboards?\b/,
    "coshh":/coshh|hazardous substance|cement burn|chemical|irritant/,
    "puwer":/puwer|checked the (?:mixer|saw|tool)|guard|inspect/,
    "risk assessments":/risk assess|\brams\b/,
    "method statements":/method statement|\brams\b/,
    "toolbox talks":/toolbox/,
    "site inductions":/induction/,
    "slips":/slip|housekeeping|tidy|clean(?:ed)? up/,
    "trips":/trip|housekeeping|tidy/,
    "falls":/fall|edge protection|guard ?rail/,
    "drawings":/drawing|\bplans?\b|elevation|section|blueprint/,
    "specifications":/spec(?:ification)?s?\b|specified|drawing/,
    "measuring":/measur|tape|dimension|\bmm\b|metres?|\bcm\b/,
    "cutting":/\bcut|\bsaw/,
    "fixings":/screw|nail|fixing|bolt|plug|\bfixed\b/,
    "timber":/timber|wood|softwood|hardwood|\bmdf\b|\bply/,
    "materials":/material|brick|block|timber|sand|cement|mortar/,
    "waste":/waste|skip|offcut|left ?over/,
    "recycling":/recycl|skip|segregat/,
    "reuse":/re-?use|offcut|left ?over/,
    "resource efficiency":/efficien|waste|offcut|re-?use/,
    "environment":/environment|waste|recycl|dust|noise|spill|run-?off/,
    "sustainability":/sustainab|recycl|waste|re-?use/,
    "hand tools":/tool|trowel|chisel|plane|hammer|level|square|jointer/,
    "tool maintenance":/clean(?:ed)? (?:my |the )?tools?|oil|sharpen|maintain|maintenance/,
    "tool storage":/stor|put away|tool ?box/,
    "sharpening":/sharpen|hone|whetstone/,
    "laser levels":/laser|\blevel/,
    "expansion joints":/expansion|movement joint/,
    "english":/\bbonds?\b|english/,"flemish":/\bbonds?\b|flemish/,"garden":/\bbonds?\b|garden/,"broken bonds":/\bbonds?\b|broken/,
    "joint finishes":/joint|pointing|jointer|flush|recess|weather ?struck|bucket handle|half[- ]round/,
    "frost":/frost|cold|hessian|cover/,"water protection":/rain|water|cover|polythene|sheet/,
    "construction damage":/damage|protect/,
    "defects":/defect|crack|spall|fault|damaged/,
    "repair methods":/repair|replace|cut out|rake out|patch/,
    "electrical safety":/electric|cable|110 ?v|pat test|\brcd\b|lead/,
    "fire safety":/\bfire\b|extinguisher|hot works/,
    "fire extinguishers":/extinguisher/,
    "learning":/learn|improve|next time|feedback|develop|practis|practic/,
    "learning & development":/learn|improve|next time|feedback|develop|practis|practic/,
    "ownership":/responsib|\bown\b|took charge|checked (?:my|it|the)|made sure/,
    "standards":/standard|tolerance|plumb|level|square|\bnhbc\b|straight/,
    "ventilation":/vent|air ?brick|airflow/,
    "hazard identification":/hazard|risk|danger|spotted/,
    "safe systems":/safe system|permit|exclusion zone|barrier|cordon/,
    "mastics":/mastic|sealant|silicone/,
    "ironmongery":/hinge|handle|lock|latch|ironmongery|keep|closer/,
    "scribing":/scrib/,
    "mitring":/mitre|miter/
  };
  function termMatched(term,text){
    return term.toLowerCase().split("/").some(alt=>{
      alt=alt.trim();
      const syn=SYNONYMS[alt];
      if(syn&&syn.test(text))return true;
      const words=alt.replace(/&/g," ").split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!["and","the","for","with"].includes(w));
      return words.length>0&&words.every(w=>{const stem=w.replace(/s$/,"").slice(0,5);return text.includes(stem)});
    });
  }
  const photoCount=e=>Array.isArray(e.photoIds)?e.photoIds.length:Number.isFinite(Number(e.photoCount))?Number(e.photoCount):Array.isArray(e.p)?e.p.length:0;
  const wordCount=t=>String(t||"").trim().split(/\s+/).filter(Boolean).length;
  function checkUnit(u,prompts){
    const latest=u.entries.slice().sort((x,y)=>entryTime(y)-entryTime(x))[0];
    const text=String(latest.w||"").toLowerCase();
    const terms=String((prompts[u.name]||{}).writeup||"").split("·").map(t=>t.trim()).filter(Boolean);
    const covered=terms.filter(t=>termMatched(t,text));
    return {u,terms,covered,missing:terms.filter(t=>!covered.includes(t)),words:wordCount(latest.w),photos:photoCount(latest)};
  }
  function writeups(){
    const a=analyse(),prompts=(window.eviaLearnerPrompts||{})[course]||{};
    const checks=a.units.filter(u=>u.started&&prompts[u.name]).map(u=>checkUnit(u,prompts)).filter(c=>c.terms.length)
      .sort((x,y)=>(y.missing.length/y.terms.length)-(x.missing.length/x.terms.length));
    if(!checks.length){say("You haven’t submitted a unit with a write-up yet. Once you do, I’ll check it covers the key points.");replies([{label:"Go to Course",primary:true,run:()=>{closeChat();setTimeout(()=>nav("course"),60)}},{label:"Something else",run:somethingElse}]);return}
    const needsWork=checks.filter(c=>c.missing.length||c.words<50||c.photos<3);
    if(!needsWork.length){
      say(pick(["Your write-ups cover all the key points, with plenty of photos. Nice.","I’ve checked your write-ups: they mention everything they should and have good photos. Good job."]));
      if(window.eviaMood)window.eviaMood("happy");
      replies(more("Check my write-ups"));return;
    }
    say("I’ve checked "+plural(checks.length,"write-up")+" against each unit’s things to mention.");
    needsWork.slice(0,2).forEach(c=>{
      let msg="<strong>"+escHtml(c.u.name)+"</strong>: covers <strong>"+c.covered.length+" of "+c.terms.length+"</strong> key points.";
      if(c.missing.length){const list=c.missing.slice(0,3),rest=c.missing.length-list.length;msg+=" Not mentioned yet: "+escHtml(listText(list))+(rest>0?" (plus "+rest+" more)":"")+"."}
      const tips=[];
      if(c.photos<3)tips.push("only "+plural(c.photos,"photo")+", so add ones from the beginning, middle and end of the job");
      if(c.words<50)tips.push("the write-up is short ("+plural(c.words,"word")+"), so explain the steps in more detail");
      if(tips.length)msg+=" Also, "+tips.join("; ")+".";
      say(msg);
    });
    say("You can add these next time you submit evidence for that unit.");
    replies([{label:"Open "+needsWork[0].u.name,primary:true,run:()=>openUnitFromChat(needsWork[0].u)}].concat(more("Check my write-ups").slice(0,2),[{label:"Something else",run:somethingElse}]));
  }

  /* ---------- KSB gaps ---------- */
  function ksbGaps(){
    const a=analyse(),missing=allK().filter(x=>!a.evidenced.has(x[0]));
    if(!missing.length){say("Every KSB on your course has evidence. Brilliant.");if(window.eviaMood)window.eviaMood("happy");replies(more("Which KSBs am I missing?"));return}
    const groups=[["K","Knowledge"],["S","Skills"],["B","Behaviours"]].map(([l,n])=>[n,missing.filter(x=>x[0].startsWith(l)).length]).filter(g=>g[1]);
    say("You still need evidence for <strong>"+plural(missing.length,"KSB")+"</strong>: "+groups.map(g=>g[1]+" "+g[0]).join(", ")+".");
    const plan=coverPlan(a),top=plan.slice(0,3),covered=top.reduce((n,p)=>n+p.covers.length,0);
    say("The fastest way to close the gap: "+top.map(p=>"<strong>"+escHtml(p.unit.name)+"</strong> ("+p.covers.length+")").join(", ").replace(/, ([^,]*)$/," then $1")+". "+(top.length===1?"That one unit":"Those "+top.length+" units")+" would cover "+covered+" of them.");
    replies([
      {label:"Open "+top[0].unit.name,primary:true,run:()=>openUnitFromChat(top[0].unit)},
      {label:"Show the full list",run:()=>{
        [["K","Knowledge"],["S","Skills"],["B","Behaviours"]].forEach(([l,n])=>{const codes=missing.filter(x=>x[0].startsWith(l)).map(x=>x[0]);if(codes.length)say("<strong>"+n+":</strong> "+escHtml(codes.join(", ")))});
        say("Tap any KSB on the Progress page to see its full wording.");
        replies([{label:"Go to Progress",primary:true,run:()=>{closeChat();setTimeout(()=>nav("progress"),60)}}].concat(more("Which KSBs am I missing?").slice(0,2),[{label:"Something else",run:somethingElse}]));
      }},
      {label:"Something else",run:somethingElse}
    ]);
  }

  /* ---------- My stats ---------- */
  function myStats(){
    const S=window.eviaStats;if(!S){replies(more("My stats"));return}
    const st=S.compute(),ach=S.achievements(st);
    const lines=[];
    lines.push("Last upload: <strong>"+escHtml(S.ago(st.lastUpload))+"</strong>"+(st.packsThisMonth?" · "+plural(st.packsThisMonth,"pack")+" this month":""));
    lines.push(st.streak?"You’ve been active <strong>"+plural(st.streak,"week")+" in a row</strong>."+(st.activeThisWeek?"":" Add something this week to keep it going."):"No streak yet. Add evidence or log learning each week to start one.");
    lines.push("Off-the-job: <strong>"+hrsText(st.otjWeek)+"</strong> this week, "+hrsText(st.otjTotal)+" in total.");
    say(lines.join("<br>"));
    if(st.weeksPerUnit!=null)say("You’ve got about <strong>"+plural(st.weeksLeft,"week")+"</strong> left and <strong>"+plural(st.unitsLeft,"unit")+"</strong> still to start. That’s about <strong>"+plural(Math.max(1,Math.floor(st.weeksPerUnit)),"week")+" per unit</strong>"+(st.weeksPerUnit>=2?", which is very doable.":st.weeksPerUnit>=1?", so keep a steady pace.":", so capture every suitable job you get."));
    else if(!st.a.endDate)say("Add your apprenticeship dates in Profile and I’ll work out how many weeks you’ve got per unit.");
    say("Achievements: <strong>"+ach.count+" of "+ach.list.length+"</strong>."+(ach.fresh.length?" New: "+escHtml(listText(ach.fresh.map(x=>x.label)))+".":""));
    if(ach.fresh.length){S.markSeen(ach.fresh.map(x=>x.id));if(window.eviaMood)window.eviaMood("happy")}
    const task=st.confidence.practise.length&&window.eviaPractice?window.eviaPractice.suggestTasks(1)[0]:null;
    if(st.confidence.practise.length)say("From your confidence check, you want more practice on "+escHtml(listText(st.confidence.practise.slice(0,4)))+"."+(task?" A good college task for that: <strong>"+escHtml(task.task.title)+"</strong>.":" Tell your tutor or supervisor so they can help."));
    replies([...(task?[{label:"Show me the task",primary:true,run:()=>{closeChat();setTimeout(()=>window.eviaPractice.openTask(0),60)}}]:[]),{label:"See all my stats",primary:!task,run:()=>{closeChat();setTimeout(showStats,60)}},{label:"Check my write-ups",run:writeups},{label:"Which KSBs am I missing?",run:ksbGaps},{label:"Something else",run:somethingElse}]);
  }
  const hrsText=n=>{const v=Math.round(n*10)/10;return v+" hour"+(v===1?"":"s")};
  /* Evia opens the chat with what she'd do today, from the same nudges as Home. */
  /* Evia opens the chat with one suggestion: the same one she'd make on Home. */
  function today(){
    const S=window.eviaStats;if(!S)return;
    let n;try{n=S.nudges(S.compute())[0]}catch(_){return}
    if(!n)return;
    if(n.celebrate&&window.eviaMood)window.eviaMood("happy");
    say(n.celebrate?n.text:"Here’s what I’d do today: "+n.text);
    if(n.achievements)S.markSeen(n.achievements);
    const gen=chatGen;
    queue=queue.then(()=>{
      const c=chatBox();if(!c||gen!==chatGen)return;
      const box=document.createElement("div");box.className="chat-options ui-replies";
      const b=document.createElement("button");b.type="button";b.className="chat-pill ui-pill-primary";b.innerHTML="<strong>"+escHtml(n.action.label)+"</strong>";
      b.onclick=()=>{box.remove();if(n.action.kind!=="test"&&n.action.kind!=="confidence")userSays(n.action.label);runNudge(n)};
      box.appendChild(b);c.appendChild(box);scrollChat();
    });
  }
  let menuItems=[];
  function somethingElse(){
    const gen=chatGen;
    queue=queue.then(()=>{
      const c=chatBox();if(!c||gen!==chatGen)return;
      const box=document.createElement("div");box.className="chat-options ui-replies";
      menuItems.forEach(item=>{const b=document.createElement("button");b.type="button";b.className="chat-pill";b.innerHTML="<strong>"+escHtml(item.label)+"</strong>";b.onclick=()=>{box.remove();item.run()};box.appendChild(b)});
      c.appendChild(box);scrollChat();
    });
  }
  function statsFromMenu(){userSays("My stats");myStats()}
  function enhanceChat(opts){
    const c=chatBox();if(!c)return;
    queue=Promise.resolve();chatGen++;
    const greet=c.querySelector(".bubble.evia"),name=firstName();
    if(greet)greet.innerHTML=pick([partOfDay()+(name?" "+escHtml(name):"")+". What would you like to do?","Hi"+(name?" "+escHtml(name):"")+". How can I help today?"]);
    menuItems=[];
    /* Confidence check lives in Practice now, so the menu keeps three options. */
    c.querySelectorAll("[data-chat-option]").forEach(b=>{
      const label=b.textContent.trim(),original=b.onclick;
      if(label==="Confidence check"&&window.eviaPractice){b.remove();return}
      const item=label==="Portfolio check"?{label:"My stats",run:statsFromMenu}:{label,run:()=>original&&original.call(b)};
      menuItems.push(item);
      b.innerHTML="<strong>"+escHtml(item.label)+"</strong>";
      b.onclick=()=>{const box=b.closest(".chat-options");if(box)box.remove();item.run()};
    });
    /* app.js only brings the profile button back on some screens when the chat closes; Home needs it too. */
    const x=document.getElementById("x");
    if(x)x.addEventListener("click",()=>{const pb=document.getElementById("profile-btn");if(pb&&screen==="home")pb.style.display="flex"});
    if(!(opts&&opts.quiet===true))today();
  }
  /* After a test: celebrate a good score and offer what to do next. */
  window.addEventListener("evia:test-saved",e=>{
    if(!chatBox())return;
    const d=e.detail||{};
    if(d.pct>=80&&window.eviaMood)window.eviaMood("happy");
    const opts=[{label:"Try another test",primary:true,run:()=>{closeChat();setTimeout(()=>window.eviaPractice&&window.eviaPractice.openHub(),60)}}];
    if(d.missed&&d.missed.length)opts.push({label:"Go to Progress",run:()=>{closeChat();setTimeout(()=>nav("progress"),60)}});
    opts.push({label:"See my stats",run:()=>{closeChat();setTimeout(showStats,60)}},{label:"Something else",run:somethingElse});
    queue=queue.then(()=>new Promise(r=>setTimeout(r,1400))); /* let the result bubble finish "thinking" first */
    replies(opts);
  });

  /* ---------- Wire into the app ---------- */
  const originalRender=window.render,originalChat=window.chat,originalLearning=window.learning;
  const TOP_SCREENS=["home","course","progress","portfolio"];
  window.render=function(){
    hideBubble();
    const scr=document.getElementById("screen");if(scr)scr.classList.toggle("ui-top",TOP_SCREENS.includes(screen));
    if(screen==="home"){
      const profileBtn=document.getElementById("profile-btn");if(profileBtn)profileBtn.style.display="flex";
      document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav==="home"));
      home();return;
    }
    originalRender();
  };
  window.progress=progressScreen;
  const originalCourses=window.courses;
  window.courses=function(){
    originalCourses();
    const head=document.querySelector("#screen > .card:not(.unit-card)");
    if(head)head.remove();
  };
  window.portfolio=portfolioScreen;
  window.learning=function(){
    originalLearning();
    if(!document.getElementById("ui-back-home"))$("#screen").insertAdjacentHTML("afterbegin",'<button class="secondary ui-back" id="ui-back-home" type="button">‹ Home</button>');
    $("#ui-back-home").onclick=()=>nav("home");
  };
  /* Page changes fade: the current page fades out, the new one fades in. */
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;
  let fadeTimer=null;
  function withFade(change){
    const scr=document.getElementById("screen");
    if(!scr||reduced()||document.body.classList.contains("evia-onboarding")){change();return}
    clearTimeout(fadeTimer);
    scr.classList.remove("ui-entering");scr.classList.add("ui-leaving");
    fadeTimer=setTimeout(()=>{
      const show=()=>{scr.classList.remove("ui-leaving");void scr.offsetWidth;scr.classList.add("ui-entering");fadeTimer=setTimeout(()=>scr.classList.remove("ui-entering"),260)};
      let r;try{r=change()}catch(e){show();throw e}
      Promise.resolve(r).then(show,show); /* some pages (a unit) load photos first */
    },140);
  }
  const originalNav=window.nav,originalOpenUnit=window.openUnit;
  window.nav=function(s){withFade(()=>originalNav(s))};
  window.openUnit=function(i){withFade(()=>originalOpenUnit(i))};
  window.chat=function(opts){hideBubble();originalChat();enhanceChat(opts);if(window.eviaMood)window.eviaMood("happy")};
  $("#evia-fab").onclick=window.chat;
  window.eviaHome=home;
  window.eviaCoach={analyse,suggestion,checkUnit,showStats};
  window.eviaStartTest=startTest;
  if(screen==="course"&&!document.body.classList.contains("evia-onboarding")){screen="home";render()}
})();
