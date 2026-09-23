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
    const a=analyse(),s=suggestion(a);
    const recent=a.entries.slice().sort((x,y)=>entryTime(y)-entryTime(x)).slice(0,4);
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
          '<button type="button" class="ui-card ui-quick-btn" id="ui-capture"><span class="ui-icon-chip">'+icon(ICONS.camera)+'</span><span>Capture evidence</span></button>'+
        '</div>'+
        '<section class="ui-section"><div class="ui-section-head"><h2>Recent evidence</h2>'+(recent.length?'<button type="button" class="ui-link" id="ui-see-all">See all</button>':"")+'</div>'+
          (recent.length?'<div class="ui-recent">'+recent.map((e,i)=>'<button type="button" class="ui-recent-item" data-recent="'+i+'"><span class="ui-photo" data-recent-photo="'+i+'">'+icon(ICONS.camera,22)+'</span><strong>'+escHtml(e.u)+'</strong><small>'+escHtml(new Date(entryTime(e)).toLocaleDateString("en-GB",{day:"numeric",month:"short"}))+'</small></button>').join("")+'</div>'
          :'<div class="ui-card ui-empty"><span class="ui-icon-chip">'+icon(ICONS.camera)+'</span><p>Your evidence will show up here once you submit your first unit.</p></div>')+
        '</section>'+
      '</div>';
    const openSuggested=()=>{if(s.unit)openUnit(s.unit.index);else nav("course")};
    const prog=$("#ui-home-progress");prog.onclick=()=>nav("progress");prog.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();nav("progress")}};
    $("#ui-log-otj").onclick=()=>nav("learning");
    $("#ui-capture").onclick=openSuggested;
    const all=$("#ui-see-all");if(all)all.onclick=()=>nav("portfolio");
    document.querySelectorAll("[data-recent]").forEach(b=>b.onclick=()=>{const e=recent[+b.dataset.recent];if(window.eviaOpenSendToPortfolio)window.eviaOpenSendToPortfolio(e.u)});
    recent.forEach(async(e,i)=>{
      try{const photos=window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]);const el=document.querySelector('[data-recent-photo="'+i+'"]');if(el&&photos[0])el.innerHTML='<img src="'+photos[0]+'" alt="">'}catch(_){}
    });
    homeSuggestion(s);
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
  function homeSuggestion(s){
    hideBubble();
    if(!s.unit||document.body.classList.contains("evia-onboarding"))return;
    const today=new Date().toDateString(),seen=readJson(TIP_KEY,{});
    if(seen.day===today&&seen.unit===s.unit.name)return;
    const name=firstName();
    bubbleTimer=setTimeout(()=>{
      if(screen!=="home"||document.querySelector(".chat-sheet"))return;
      const lead=partOfDay()+(name?" "+escHtml(name):"")+". ";
      const text=s.draft?lead+escHtml(s.text):lead+"<strong>"+escHtml(s.unit.name)+"</strong> is your quickest win: "+s.unit.missing.length+" KSB"+(s.unit.missing.length===1?"":"s")+" still need evidence.";
      const dismiss=()=>localStorage.setItem(TIP_KEY,JSON.stringify({day:today,unit:s.unit.name}));
      eviaSay(text,[{label:"Open unit",primary:true,run:()=>{dismiss();openUnit(s.unit.index)}},{label:"Not now",run:dismiss}]);
    },900);
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
  const plural=(n,word)=>n+" "+word+(n===1?"":"s");
  const listText=items=>items.length<2?items.join(""):items.slice(0,-1).join(", ")+" and "+items[items.length-1];
  const more=exclude=>[
    {label:"Check my write-ups",run:writeups},
    {label:"Which KSBs am I missing?",run:ksbGaps},
    {label:"Plan my week",run:planWeek},
    {label:"How am I doing?",run:howAmIDoing},
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
  const dayWord=t=>{const d=Math.floor((new Date().setHours(0,0,0,0)-new Date(t).setHours(0,0,0,0))/864e5);return d<=0?"today":d===1?"yesterday":"on "+new Date(t).toLocaleDateString("en-GB",{weekday:"long"})};
  const weekStart=()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()};
  const otjThisWeek=()=>hours.filter(x=>Number(x.createdAt)>=weekStart()).reduce((n,x)=>n+Number(x.n||0),0);

  /* Things Evia notices before she answers: recent evidence, milestones and this week's learning. */
  const MILESTONE_KEY="evia7-coach-milestone";
  let noticedThisChat=false; /* she mentions these once each time the chat opens */
  function noticing(a){
    const lines=[];
    const bucket=[100,75,50,25].find(b=>a.ksbPct>=b)||0,seen=Number(localStorage.getItem(MILESTONE_KEY)||0);
    if(bucket>seen){
      localStorage.setItem(MILESTONE_KEY,String(bucket));
      lines.push(bucket===100?"You’ve got evidence for <strong>every KSB</strong> on your course. That’s a huge milestone.":"You’ve passed <strong>"+bucket+"%</strong> of your KSBs. That’s a big milestone, well done.");
      if(window.eviaMood)window.eviaMood("happy");
    }
    if(a.lastEntry&&Date.now()-entryTime(a.lastEntry)<3*864e5)lines.push(pick(["Nice work submitting <strong>"+escHtml(a.lastEntry.u)+"</strong> "+dayWord(entryTime(a.lastEntry))+".","I saw your <strong>"+escHtml(a.lastEntry.u)+"</strong> evidence come in "+dayWord(entryTime(a.lastEntry))+". Good stuff."]));
    const wk=otjThisWeek();
    if(wk>0&&lines.length<2)lines.push("You’ve logged "+wk.toFixed(1).replace(/\.0$/,"")+" hours of off-the-job learning this week.");
    return lines;
  }

  function nextStep(){
    const a=analyse(),s=suggestion(a);
    if(!s.unit){say(escHtml(s.text));replies(more());return}
    const u=s.unit;
    if(s.draft){
      say(pick(["You’ve got a draft waiting: <strong>"+escHtml(u.name)+"</strong>. Finish it off and submit it so it counts.","<strong>"+escHtml(u.name)+"</strong> is started but not submitted yet. Let’s get it over the line."]));
    }else{
      const codes=u.missing.slice(0,3).join(", ")+(u.missing.length>3?" and more":"");
      say(pick([
        "Your quickest win is <strong>"+escHtml(u.name)+"</strong>. It covers <strong>"+plural(u.missing.length,"KSB")+"</strong> you don’t have evidence for yet ("+escHtml(codes)+").",
        "I’d go for <strong>"+escHtml(u.name)+"</strong> next. One good job there would tick off <strong>"+plural(u.missing.length,"KSB")+"</strong>, including "+escHtml(codes)+".",
        "If you want the most progress for one job, <strong>"+escHtml(u.name)+"</strong> is it: "+plural(u.missing.length,"KSB")+" with no evidence yet."
      ]));
    }
    remember(u);
    replies([{label:"Open "+u.name,primary:true,run:()=>openUnitFromChat(u)}].concat(more()));
  }
  function coach(){
    const memory=readJson(COACH_KEY,null),a=analyse();
    if(!noticedThisChat){noticedThisChat=true;noticing(a).forEach(line=>say(line))}
    if(memory&&memory.unit&&Date.now()-memory.at>36e5){
      const u=a.units.find(x=>x.name===memory.unit);
      if(u&&u.entries.some(e=>entryTime(e)>memory.at)){
        say(pick(["And you got <strong>"+escHtml(u.name)+"</strong> done since we last spoke. That’s more KSBs ticked off.","You did <strong>"+escHtml(u.name)+"</strong> like we planned. Great stuff."]));
        if(window.eviaMood)window.eviaMood("happy");
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
    if(!checks.length){say("You haven’t submitted a unit with a write-up yet. Once you do, I’ll check it covers the key points.");replies([{label:"What should I do next?",primary:true,run:nextStep},{label:"Something else",run:somethingElse}]);return}
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
      {label:"Plan my week",run:planWeek},
      {label:"Something else",run:somethingElse}
    ]);
  }

  /* ---------- Plan my week ---------- */
  function planWeek(){
    const a=analyse(),s=suggestion(a),plan=coverPlan(a),wk=otjThisWeek();
    const steps=[];
    if(s.unit)steps.push((s.draft?"Finish and submit ":"Capture a job for ")+"<strong>"+escHtml(s.unit.name)+"</strong>"+(s.unit.missing.length?" ("+plural(s.unit.missing.length,"KSB")+")":""));
    const weak=a.units.filter(u=>u.started&&u.entries.every(e=>photoCount(e)<3));
    if(weak.length)steps.push("Add a stronger evidence pack to <strong>"+escHtml(weak[0].name)+"</strong> (more photos)");
    steps.push(wk>0?"Keep logging your off-the-job learning (<strong>"+wk.toFixed(1).replace(/\.0$/,"")+" hours</strong> so far this week)":"Log your off-the-job learning (none logged yet this week)");
    say("Here’s a plan for this week:<br>"+steps.map((t,i)=>(i+1)+". "+t).join("<br>"));
    if(a.endDate&&plan.length){
      const weeks=Math.max(1,Math.round((a.endDate.getTime()-Date.now())/(7*864e5)));
      const every=weeks/plan.length;
      say("You’ve got about <strong>"+plural(weeks,"week")+"</strong> left and roughly <strong>"+plural(plan.length,"unit")+"</strong> to cover the KSBs still missing. "+(every>=2?"That’s about one unit every "+Math.floor(every)+" weeks, which is very doable.":every>=1?"That’s about one unit a week, so keep a steady pace.":"That’s more than one unit a week, so try to capture evidence from every suitable job."));
    }else if(!a.endDate){
      say("Add your apprenticeship dates in your profile and I can tell you how many weeks you’ve got to do it.");
    }
    const opts=[];
    if(s.unit)opts.push({label:"Open "+s.unit.name,primary:true,run:()=>openUnitFromChat(s.unit)});
    opts.push({label:"Log OTJ hours",run:()=>{closeChat();setTimeout(()=>nav("learning"),60)}});
    if(!a.endDate)opts.push({label:"Add my dates",run:()=>{closeChat();setTimeout(()=>window.eviaOpenProfile&&window.eviaOpenProfile(),60)}});
    opts.push({label:"Something else",run:somethingElse});
    replies(opts);
    if(s.unit)remember(s.unit);
  }

  /* ---------- How am I doing? ---------- */
  function howAmIDoing(){
    const a=analyse(),remaining=a.units.filter(u=>!u.started).length;
    let msg="You’ve got evidence for <strong>"+a.met+" of "+a.total+"</strong> KSBs ("+a.ksbPct+"%). ";
    if(a.timePct!=null){const gap=a.timePct-a.ksbPct;msg+="About "+a.timePct+"% of your course time has gone, so "+(gap>10?"you’re a little behind. Two units this month would help you catch up.":gap<-5?"you’re ahead. Keep it up.":"you’re right on track.")}
    say(msg);
    if(a.timePct!=null&&a.timePct-a.ksbPct<-5&&window.eviaMood)window.eviaMood("happy");
    if(a.daysSince!=null&&a.daysSince>=14)say("It’s been "+a.daysSince+" days since your last evidence. A quick job this week keeps things moving.");
    else if(a.daysSince==null)say("You haven’t submitted any unit evidence yet. Your first one is the hardest, and I’ll help.");
    say(remaining?plural(remaining,"unit")+" still "+(remaining===1?"has":"have")+" no evidence at all.":"Every unit has at least some evidence now.");
    const opts=[{label:"Plan my week",primary:true,run:planWeek},{label:"Which KSBs am I missing?",run:ksbGaps},{label:"Something else",run:somethingElse}];
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
    queue=Promise.resolve();noticedThisChat=false;
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
  window.chat=function(){hideBubble();originalChat();enhanceChat();if(window.eviaMood)window.eviaMood("happy")};
  $("#evia-fab").onclick=window.chat;
  window.eviaHome=home;
  window.eviaCoach={analyse,suggestion};
  if(screen==="course"&&!document.body.classList.contains("evia-onboarding")){screen="home";render()}
})();
