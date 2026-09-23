/* Evia7 UI refresh: Home screen, grouped Progress, photo Portfolio and the "What should I do next?" coach.
   Loads last and replaces the screen functions from app.js; data and storage are unchanged. */
(function(){
  const PPE_UNIT="Personal protective equipment";
  const COACH_KEY="evia7-coach";
  const escHtml=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const pick=list=>list[Math.floor(Math.random()*list.length)];
  const entryTime=e=>{const t=Date.parse(e.savedAt||"");if(!isNaN(t))return t;const m=String(e.d||"").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);return m?new Date(+m[3],m[2]-1,+m[1]).getTime():0};
  const firstName=()=>String(readJson("evia7-profile",{}).name||"").trim().split(/\s+/)[0]||"";
  const partOfDay=()=>{const h=new Date().getHours();return h<12?"Morning":h<18?"Afternoon":"Evening"};
  const eviaAvatar=(size)=>'<span class="ui-evia" style="width:'+size+'px;height:'+size+'px" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span>';
  const icon=(d,size=20)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>';
  const ICONS={
    clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
    camera:'<rect x="3" y="6.5" width="18" height="14" rx="3"/><path d="M8 6.5l1.4-2h5.2l1.4 2"/><circle cx="12" cy="13.5" r="3.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    chev:'<path d="m9 5 7 7-7 7"/>',
    back:'<path d="m15 5-7 7 7 7"/>'
  };
  function ring(pct,size,stroke,label,sub){
    const r=(size-stroke)/2,c=2*Math.PI*r,dash=Math.max(0,Math.min(1,pct/100))*c;
    return '<span class="ui-ring" style="width:'+size+'px;height:'+size+'px">'+
      '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" aria-hidden="true"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="ui-ring-track" stroke-width="'+stroke+'"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="ui-ring-fill" stroke-width="'+stroke+'" stroke-dasharray="'+dash.toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/></svg>'+
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
    if(a.drafts.length){const d=a.drafts[0];return {unit:d,text:pick(["You started "+d.name+" but haven’t submitted it yet. Finish it off and it counts towards your KSBs.","Your "+d.name+" evidence is still a draft. Submit it and those KSBs get ticked off."]),action:"Finish "+d.name}}
    if(a.quickest){const q=a.quickest,n=q.missing.length;return {unit:q,text:q.name+" covers "+n+" KSB"+(n===1?"":"s")+" you haven’t got evidence for yet. That’s your quickest win.",action:"Open "+q.name}}
    return {unit:null,text:"Every KSB on your course has some evidence. Keep strengthening the units with the least photos and detail.",action:null};
  }

  /* ---------- Home ---------- */
  function home(){
    $("#page-title").textContent="Home";
    const a=analyse(),s=suggestion(a),name=firstName();
    const today=new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
    const recent=a.entries.slice().sort((x,y)=>entryTime(y)-entryTime(x)).slice(0,4);
    const timeDetail=a.timePct==null?"Add your dates in Profile":a.timePct+"%";
    $("#screen").innerHTML=
      '<div class="ui-page">'+
        '<header class="ui-hello"><span class="ui-date">'+escHtml(today)+'</span><h1>'+partOfDay()+(name?", "+escHtml(name):"")+'</h1></header>'+
        '<section class="ui-suggest">'+
          '<div class="ui-suggest-head">'+eviaAvatar(44)+'<span class="ui-kicker">EVIA SUGGESTS</span></div>'+
          '<p>'+escHtml(s.text)+'</p>'+
          '<div class="ui-suggest-actions">'+(s.unit?'<button type="button" class="primary" id="ui-suggest-open">'+escHtml(s.action)+'</button>':"")+'<button type="button" class="secondary" id="ui-suggest-chat">Talk to Evia</button></div>'+
        '</section>'+
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
          '<button type="button" class="ui-card ui-quick-btn" id="ui-capture"><span class="ui-icon-chip">'+icon(ICONS.camera)+'</span><span>Capture evidence</span></button>'+
        '</div>'+
        '<section class="ui-section"><div class="ui-section-head"><h2>Recent evidence</h2>'+(recent.length?'<button type="button" class="ui-link" id="ui-see-all">See all</button>':"")+'</div>'+
          (recent.length?'<div class="ui-recent">'+recent.map((e,i)=>'<button type="button" class="ui-recent-item" data-recent="'+i+'"><span class="ui-photo" data-recent-photo="'+i+'">'+icon(ICONS.camera,22)+'</span><strong>'+escHtml(e.u)+'</strong><small>'+escHtml(new Date(entryTime(e)).toLocaleDateString("en-GB",{day:"numeric",month:"short"}))+'</small></button>').join("")+'</div>'
          :'<div class="ui-card ui-empty">'+eviaAvatar(40)+'<p>Your evidence will show up here once you submit your first unit.</p></div>')+
        '</section>'+
      '</div>';
    const openSuggested=()=>{if(s.unit)openUnit(s.unit.index);else nav("course")};
    const openBtn=$("#ui-suggest-open");if(openBtn)openBtn.onclick=openSuggested;
    $("#ui-suggest-chat").onclick=()=>{window.chat();setTimeout(()=>runCoachFromMenu(),50)};
    const prog=$("#ui-home-progress");prog.onclick=()=>nav("progress");prog.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();nav("progress")}};
    $("#ui-log-otj").onclick=()=>nav("learning");
    $("#ui-capture").onclick=openSuggested;
    const all=$("#ui-see-all");if(all)all.onclick=()=>nav("portfolio");
    document.querySelectorAll("[data-recent]").forEach(b=>b.onclick=()=>{const e=recent[+b.dataset.recent];if(window.eviaOpenSendToPortfolio)window.eviaOpenSendToPortfolio(e.u)});
    recent.forEach(async(e,i)=>{
      try{const photos=window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]);const el=document.querySelector('[data-recent-photo="'+i+'"]');if(el&&photos[0])el.innerHTML='<img src="'+photos[0]+'" alt="">'}catch(_){}
    });
  }

  /* ---------- Progress ---------- */
  const GROUPS=[["K","Knowledge"],["S","Skills"],["B","Behaviours"]];
  let collapsed={};
  function progressScreen(){
    $("#page-title").textContent="Progress";
    const a=analyse(),all=allK(),supporting=supportingMeta().filter(s=>s.course===course);
    const hasSupport=c=>supporting.some(s=>Array.isArray(s.ksbs)&&s.ksbs.includes(c));
    let pace="";
    if(a.timePct!=null){const gap=a.timePct-a.ksbPct;pace=gap>10?"A little behind: aim for a couple of units this month.":gap<-5?"You’re ahead of schedule. Great work.":"You’re on track."}
    else pace="Add your start and end dates in Profile to see if you’re on track.";
    $("#screen").innerHTML=
      '<div class="ui-page">'+
        '<header class="ui-hello"><span class="ui-date">'+escHtml(data().name+" · "+data().std)+'</span><h1>Progress</h1></header>'+
        '<section class="ui-summary">'+
          ring(a.ksbPct,112,12,a.ksbPct+"%","of KSBs")+
          '<div class="ui-summary-lines">'+
            '<div><small>Course time</small><strong>'+(a.timePct==null?"Not set":a.timePct+"%"+(a.endDate?" · ends "+a.endDate.toLocaleDateString("en-GB",{month:"short",year:"numeric"}):""))+'</strong></div>'+
            '<div><small>Off-the-job</small><strong>'+a.otj.toFixed(1)+' hours</strong></div>'+
            '<span class="ui-accent-text">'+escHtml(pace)+'</span>'+
          '</div>'+
        '</section>'+
        '<section class="ui-card ui-groups">'+GROUPS.map(([letter,label],gi)=>{
          const items=all.filter(x=>x[0].startsWith(letter));if(!items.length)return"";
          const done=items.filter(x=>a.evidenced.has(x[0])).length,pct=Math.round(done/items.length*100),open=!collapsed[letter];
          return (gi?'<div class="ui-divider"></div>':"")+
            '<button type="button" class="ui-group-head" data-group="'+letter+'" aria-expanded="'+open+'">'+ring(pct,44,5,null)+
              '<span class="ui-group-copy"><strong>'+label+'</strong><small>'+done+' of '+items.length+' with evidence</small></span><span class="ui-group-pct">'+pct+'%</span><span class="ui-chev'+(open?" open":"")+'">'+icon(ICONS.chev,18)+'</span></button>'+
            (open?'<div class="ui-ksb-grid">'+items.map(x=>{const met=a.evidenced.has(x[0]);return '<button type="button" class="ui-ksb'+(met?" met":"")+'" data-ksb-code="'+escHtml(x[0])+'" aria-label="'+escHtml(x[0])+(met?", evidence captured":"")+'">'+(met?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>':"")+escHtml(x[0])+(hasSupport(x[0])?'<i class="ui-ksb-dot" aria-label="Supporting evidence"></i>':"")+'</button>'}).join("")+'</div>':"");
        }).join("")+'<p class="ui-help">Tap a KSB to see its wording and the evidence mapped to it.</p></section>'+
      '</div>';
    document.querySelectorAll("[data-group]").forEach(b=>b.onclick=()=>{collapsed[b.dataset.group]=!collapsed[b.dataset.group];progressScreen()});
    document.querySelectorAll("[data-ksb-code]").forEach(b=>b.onclick=()=>{const item=all.find(x=>x[0]===b.dataset.ksbCode);if(item)ksbDetail(item[0],item[1],a.evidenced.has(item[0]))});
  }

  /* ---------- Portfolio ---------- */
  function portfolioScreen(){
    $("#page-title").textContent="Portfolio";
    const a=analyse(),supporting=supportingMeta().filter(x=>x.course===course),reviews=window.eviaGetReviews?window.eviaGetReviews():[];
    const tiles=a.units.map(u=>({name:u.name,index:u.index,entries:u.entries}));
    const ppe=a.entries.filter(e=>e.u===PPE_UNIT);
    if(ppe.length)tiles.unshift({name:PPE_UNIT,index:-1,entries:ppe});
    const started=a.units.filter(u=>u.started).length;
    const bars=level=>{const n={strong:3,good:2,weak:1}[level]||0;return '<span class="ui-bars" aria-label="Evidence strength: '+(level||"none")+'">'+[0,1,2].map(i=>'<i class="'+(i<n?"on":"")+'" style="height:'+(5+i*3)+'px"></i>').join("")+'</span>'};
    $("#screen").innerHTML=
      '<div class="ui-page">'+
        '<header class="ui-hello"><span class="ui-date">'+a.entries.length+' evidence pack'+(a.entries.length===1?"":"s")+' · '+started+' unit'+(started===1?"":"s")+' started</span><h1>Portfolio</h1></header>'+
        '<div class="ui-tabs" role="tablist"><button type="button" class="on" aria-selected="true">Units</button><button type="button" id="ui-tab-supporting">Supporting <span>'+supporting.length+'</span></button><button type="button" id="ui-tab-reviews">Reviews <span>'+reviews.length+'</span></button><button type="button" id="ui-tab-logs">Logs <span>'+hours.length+'</span></button></div>'+
        '<div class="ui-gallery">'+tiles.map((t,i)=>t.entries.length
          ?'<button type="button" class="ui-tile" data-unit-open="'+escHtml(t.name)+'"><span class="ui-tile-photo" data-cover="'+i+'">'+icon(ICONS.camera,26)+'</span><span class="ui-tile-scrim"><strong>'+escHtml(t.name)+'</strong><span class="ui-tile-meta"><small>'+t.entries.length+' saved</small>'+bars(t.index>=0?unitStrengthForCourse(t.name):"good")+'</span></span></button>'
          :'<button type="button" class="ui-tile empty" data-unit-start="'+t.index+'"><span class="ui-icon-chip">'+icon(ICONS.plus,18)+'</span><span class="ui-tile-copy"><strong>'+escHtml(t.name)+'</strong><small>No evidence yet</small></span></button>'
        ).join("")+'</div>'+
      '</div>';
    document.querySelectorAll("[data-unit-open]").forEach(b=>b.onclick=()=>{const n=b.getAttribute("data-unit-open");if(window.eviaOpenSendToPortfolio)window.eviaOpenSendToPortfolio(n);else if(window.downloadUnitEvidencePack)window.downloadUnitEvidencePack(n)});
    document.querySelectorAll("[data-unit-start]").forEach(b=>b.onclick=()=>openUnit(+b.dataset.unitStart));
    $("#ui-tab-supporting").onclick=()=>openSupportingPortfolio();
    $("#ui-tab-reviews").onclick=()=>openSavedReviews();
    $("#ui-tab-logs").onclick=()=>openSavedLearningLogs();
    tiles.forEach(async(t,i)=>{
      if(!t.entries.length)return;
      const latest=t.entries.slice().sort((x,y)=>entryTime(y)-entryTime(x));
      try{
        for(const e of latest){
          const photos=window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]);
          if(photos[0]){const el=document.querySelector('[data-cover="'+i+'"]');if(el)el.innerHTML='<img src="'+photos[0]+'" alt="">';break}
        }
      }catch(_){}
    });
  }

  /* ---------- Coach: "What should I do next?" ---------- */
  const chatBox=()=>document.getElementById("chat");
  const scrollChat=()=>{const c=chatBox();if(c)c.scrollTop=c.scrollHeight};
  let queue=Promise.resolve();
  /* app.js animates each new Evia bubble with "Evia is thinking", so messages are queued to arrive one at a time. */
  function say(html){
    queue=queue.then(()=>new Promise(resolve=>{
      const c=chatBox();if(!c)return resolve();
      const d=document.createElement("div");d.className="bubble evia";d.innerHTML=html;c.appendChild(d);scrollChat();
      setTimeout(resolve,1350);
    }));
    return queue;
  }
  function userSays(text){const c=chatBox();if(!c)return;const d=document.createElement("div");d.className="bubble user";d.textContent=text;c.appendChild(d);scrollChat()}
  function replies(list){
    queue=queue.then(()=>{
      const c=chatBox();if(!c)return;
      const box=document.createElement("div");box.className="chat-options ui-replies";
      list.forEach(r=>{const b=document.createElement("button");b.type="button";b.className="chat-pill"+(r.primary?" ui-pill-primary":"");b.innerHTML="<strong>"+escHtml(r.label)+"</strong>";b.onclick=()=>{box.remove();userSays(r.label);r.run()};box.appendChild(b)});
      c.appendChild(box);scrollChat();
    });
  }
  function closeChat(){const x=document.getElementById("x");if(x)x.click()}
  const openUnitFromChat=u=>{closeChat();setTimeout(()=>openUnit(u.index),60)};
  const remember=u=>localStorage.setItem(COACH_KEY,JSON.stringify({unit:u.name,at:Date.now()}));
  const more=()=>[{label:"Check my write-ups",run:writeups},{label:"How am I doing?",run:howAmIDoing},{label:"Something else",run:somethingElse}];

  function nextStep(){
    const a=analyse(),s=suggestion(a);
    if(!s.unit){say(escHtml(s.text));replies(more().filter(r=>r.label!=="Something else").concat([{label:"Something else",run:somethingElse}]));return}
    const u=s.unit;
    if(a.drafts.length&&a.drafts[0]===u){
      say(pick(["You’ve got a draft waiting: <strong>"+escHtml(u.name)+"</strong>. Finish it off and submit it so it counts.","<strong>"+escHtml(u.name)+"</strong> is started but not submitted yet. Let’s get it over the line."]));
    }else{
      const codes=u.missing.slice(0,3).join(", ")+(u.missing.length>3?" and more":"");
      say(pick([
        "Your quickest win is <strong>"+escHtml(u.name)+"</strong>. It covers <strong>"+u.missing.length+" KSB"+(u.missing.length===1?"":"s")+"</strong> you don’t have evidence for yet ("+escHtml(codes)+").",
        "I’d go for <strong>"+escHtml(u.name)+"</strong> next. One good job there would tick off <strong>"+u.missing.length+" KSB"+(u.missing.length===1?"":"s")+"</strong>, including "+escHtml(codes)+".",
        "If you want the most progress for one job, <strong>"+escHtml(u.name)+"</strong> is it: "+u.missing.length+" KSB"+(u.missing.length===1?"":"s")+" with no evidence yet."
      ]));
    }
    remember(u);
    replies([{label:"Open "+u.name,primary:true,run:()=>openUnitFromChat(u)}].concat(more()));
  }
  function coach(){
    const memory=readJson(COACH_KEY,null),a=analyse();
    if(memory&&memory.unit&&Date.now()-memory.at>36e5){
      const u=a.units.find(x=>x.name===memory.unit);
      if(u&&u.entries.some(e=>entryTime(e)>memory.at)){
        say(pick(["Nice work on <strong>"+escHtml(u.name)+"</strong> since we last spoke. That’s more KSBs ticked off.","You got <strong>"+escHtml(u.name)+"</strong> done. Great stuff."]));
        localStorage.removeItem(COACH_KEY);nextStep();return;
      }
      if(u&&u.missing.length){
        say(pick(["Last time we said you’d look at <strong>"+escHtml(u.name)+"</strong>. Did you get to it?","How did <strong>"+escHtml(u.name)+"</strong> go? Last time that was the plan."]));
        replies([
          {label:"Not yet",run:()=>{say(pick(["No problem. It’s still a good one to do.","That’s fine. Here’s where I’d start."]));localStorage.removeItem(COACH_KEY);nextStep()}},
          {label:"Yes, I did the job",run:()=>{say("Great. Take your photos and write it up in the unit so it counts towards your KSBs.");replies([{label:"Open "+u.name,primary:true,run:()=>openUnitFromChat(u)},{label:"Something else",run:somethingElse}])}}
        ]);
        return;
      }
    }
    nextStep();
  }
  function termMatched(term,text){
    return term.split("/").some(alt=>{
      const words=alt.toLowerCase().replace(/&/g," ").split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!["and","the","for","with"].includes(w));
      return words.length&&words.every(w=>{const stem=w.replace(/s$/,"").slice(0,5);return text.includes(stem)});
    });
  }
  function writeups(){
    const a=analyse(),prompts=(window.eviaLearnerPrompts||{})[course]||{};
    const checks=a.units.filter(u=>u.started&&prompts[u.name]).map(u=>{
      const latest=u.entries.slice().sort((x,y)=>entryTime(y)-entryTime(x))[0];
      const text=String(latest.w||"").toLowerCase();
      const terms=String(prompts[u.name].writeup||"").split("·").map(t=>t.trim()).filter(Boolean);
      return {u,missing:terms.filter(t=>!termMatched(t,text)),total:terms.length};
    }).filter(c=>c.total).sort((x,y)=>y.missing.length/y.total-x.missing.length/x.total);
    if(!checks.length){say("You haven’t submitted a unit with a write-up yet. Once you do, I can check it covers the key points.");replies([{label:"What should I do next?",primary:true,run:nextStep},{label:"Something else",run:somethingElse}]);return}
    const weak=checks.filter(c=>c.missing.length);
    if(!weak.length){say(pick(["Your write-ups cover all the key points. Nice.","I’ve checked your write-ups and they mention everything they should. Good job."]));replies(more().filter(r=>r.label!=="Check my write-ups"));return}
    weak.slice(0,2).forEach((c,i)=>{
      const list=c.missing.slice(0,3),rest=c.missing.length-list.length;
      say((i?"And in ":"In your ")+"<strong>"+escHtml(c.u.name)+"</strong> write-up you haven’t mentioned "+escHtml(list.join(", ").replace(/, ([^,]*)$/," or $1"))+(rest>0?" (plus "+rest+" more)":"")+". Adding "+(list.length===1?"it":"those")+" would make it stronger.");
    });
    replies([{label:"Open "+weak[0].u.name,primary:true,run:()=>openUnitFromChat(weak[0].u)},{label:"What should I do next?",run:nextStep},{label:"Something else",run:somethingElse}]);
  }
  function howAmIDoing(){
    const a=analyse(),remaining=a.units.filter(u=>!u.started).length;
    let msg="You’ve got evidence for <strong>"+a.met+" of "+a.total+"</strong> KSBs ("+a.ksbPct+"%). ";
    if(a.timePct!=null){const gap=a.timePct-a.ksbPct;msg+="About "+a.timePct+"% of your course time has gone, so "+(gap>10?"you’re a little behind. Two units this month would help you catch up.":gap<-5?"you’re ahead. Keep it up.":"you’re right on track.")}
    say(msg);
    if(a.daysSince!=null&&a.daysSince>=14)say("It’s been "+a.daysSince+" days since your last evidence. A quick job this week keeps things moving.");
    else if(a.daysSince==null)say("You haven’t submitted any unit evidence yet. Your first one is the hardest, and I’ll help.");
    say(remaining?remaining+" unit"+(remaining===1?"":"s")+" still have no evidence at all.":"Every unit has at least some evidence now.");
    const opts=[{label:"What should I do next?",primary:true,run:nextStep},{label:"Something else",run:somethingElse}];
    if(a.timePct==null)opts.splice(1,0,{label:"Add my dates",run:()=>{closeChat();setTimeout(()=>window.eviaOpenProfile&&window.eviaOpenProfile(),60)}});
    replies(opts);
  }
  let menuItems=[];
  function somethingElse(){
    queue=queue.then(()=>{
      const c=chatBox();if(!c)return;
      const box=document.createElement("div");box.className="chat-options ui-replies";
      menuItems.forEach(item=>{const b=document.createElement("button");b.type="button";b.className="chat-pill";b.innerHTML="<strong>"+escHtml(item.label)+"</strong>";b.onclick=()=>{box.remove();item.run()};box.appendChild(b)});
      c.appendChild(box);scrollChat();
    });
  }
  function runCoachFromMenu(){userSays("What should I do next?");coach()}
  function enhanceChat(){
    const c=chatBox();if(!c)return;
    queue=Promise.resolve();
    const greet=c.querySelector(".bubble.evia"),name=firstName();
    if(greet)greet.innerHTML=pick([partOfDay()+(name?" "+escHtml(name):"")+". What would you like to do?","Hi"+(name?" "+escHtml(name):"")+". How can I help today?"]);
    menuItems=[];
    c.querySelectorAll("[data-chat-option]").forEach(b=>{
      const label=b.textContent.trim(),original=b.onclick;
      const item=label==="Portfolio check"?{label:"What should I do next?",run:runCoachFromMenu}:{label,run:()=>original&&original.call(b)};
      menuItems.push(item);
      b.innerHTML="<strong>"+escHtml(item.label)+"</strong>";
      b.onclick=()=>{const box=b.closest(".chat-options");if(box)box.remove();item.run()};
    });
  }

  /* ---------- Wire into the app ---------- */
  const originalRender=window.render,originalChat=window.chat,originalLearning=window.learning;
  window.render=function(){
    if(screen==="home"){
      const profileBtn=document.getElementById("profile-btn");if(profileBtn)profileBtn.style.display="flex";
      document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav==="home"));
      home();return;
    }
    originalRender();
  };
  window.progress=progressScreen;
  window.portfolio=portfolioScreen;
  window.learning=function(){
    originalLearning();
    if(!document.getElementById("ui-back-home"))$("#screen").insertAdjacentHTML("afterbegin",'<button class="secondary ui-back" id="ui-back-home" type="button">‹ Home</button>');
    $("#ui-back-home").onclick=()=>nav("home");
  };
  window.chat=function(){originalChat();enhanceChat()};
  $("#evia-fab").onclick=window.chat;
  window.eviaHome=home;
  window.eviaCoach={analyse,suggestion};
  if(screen==="course"&&!document.body.classList.contains("evia-onboarding")){screen="home";render()}
})();
