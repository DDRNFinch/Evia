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
    const evidenced=window.eviaNvq&&window.eviaNvq.on()?window.eviaNvq.evidenced():new Set(entries.flatMap(e=>Array.isArray(e.k)?e.k:[]));
    const all=allK(),met=all.filter(x=>evidenced.has(x[0])).length;
    const ksbPct=all.length?Math.round(met/all.length*100):0;
    const unitInfo=units.map((u,i)=>{
      const codes=[...new Set(u[1].map(code))];
      const es=entries.filter(e=>e.u===u[0]);
      return {index:i,name:u[0],codes,missing:codes.filter(c=>!evidenced.has(c)),entries:es,started:es.length>0};
    }).filter(x=>!(window.eviaNvq&&window.eviaNvq.on())||window.eviaNvq.packShown(x.index)); /* NVQ: only jobs for the learner's units */
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
  /* One nudge a day on Course: the most useful thing from My stats. Achievements are celebrated first. */
  function courseNudge(){
    hideBubble();
    if(document.body.classList.contains("evia-onboarding")||!window.eviaStats)return;
    let n;try{n=window.eviaStats.nudges(window.eviaStats.compute())[0]}catch(_){return}
    if(!n)return;
    const today=new Date().toDateString(),seen=readJson(TIP_KEY,{});
    if(seen.day===today&&(!n.celebrate||seen.id===n.id))return;
    const name=firstName();
    const fire=()=>{
      if(screen!=="course"||!document.getElementById("ui-course-head")||document.querySelector(".chat-sheet"))return;
      if(document.querySelector(".evidence-toast")){bubbleTimer=setTimeout(fire,2400);return} /* wait for "Saved"-style messages to clear */
      const dismiss=()=>{localStorage.setItem(TIP_KEY,JSON.stringify({day:today,id:n.id}));if(n.achievements)window.eviaStats.markSeen(n.achievements)};
      const lead=n.celebrate?(name?"Well done "+escHtml(name)+"! ":"Well done! "):partOfDay()+(name?" "+escHtml(name):"")+". ";
      eviaSay(lead+n.text,[{label:n.action.label,primary:true,run:()=>{dismiss();runNudge(n)}},{label:"Not now",run:dismiss}]);
      if(n.celebrate&&window.eviaMood)window.eviaMood("happy");
    };
    bubbleTimer=setTimeout(fire,900);
  }
  /* Carries out a nudge's action from Course or the chat. */
  function runNudge(n){
    const kind=n.action.kind,inChat=!!chatBox();
    const go=fn=>{if(inChat)closeChat();setTimeout(fn,inChat?60:0)};
    if(kind==="stats")go(showStats);
    else if(kind==="course")go(()=>nav("course"));
    else if(kind==="learning")go(()=>nav("hours"));
    else if(kind==="backup")go(async()=>{try{await window.eviaStorage.backup();if(typeof showEvidenceToast==="function")showEvidenceToast("Backup saved to your downloads. Keep a copy somewhere safe, like your email")}catch(e){console.error(e);if(typeof showEvidenceToast==="function")showEvidenceToast("Couldn’t make the backup. Try again from Profile",true)}});
    else if(kind==="targets"||kind==="review"){
      const label=kind==="targets"?"My targets":"Progress review";
      const run=()=>{const item=menuItems.find(x=>x.label===label);if(item)item.run()};
      if(inChat)queue=queue.then(run);else{window.chat({quiet:true});setTimeout(run,50)}
    }
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
    else{
      /* Started from Practice, a target or a suggestion: a clean test screen, without the chat greeting and menu. */
      window.chat({quiet:true});
      setTimeout(()=>{
        const c=chatBox();if(c)c.innerHTML="";
        const sh=document.querySelector(".chat-sheet"),h=sh&&sh.querySelector("h2"),k=sh&&sh.querySelector(".chat-kicker");
        if(sh)sh.classList.add("ui-test-mode");if(h)h.textContent=label;if(k)k.textContent="PRACTICE TEST";
        window.eviaTestMe&&window.eviaTestMe({type,count});
      },50);
    }
  }
  function showStats(){
    if(screen!=="learning")nav("learning");
    setTimeout(()=>{const el=document.getElementById("ui-stats");if(el)el.scrollIntoView({behavior:window.eviaAccessibility&&window.eviaAccessibility.reducedMotion()?"auto":"smooth",block:"start"})},80);
  }
  /* Evia's one tip for the Learning tab: the most useful learning nudge (not a celebration or a backup reminder). */
  function learningTip(st){
    if(!st||!window.eviaStats)return null;
    try{return window.eviaStats.nudges(st).find(n=>!n.celebrate&&n.action&&!["backup","course","stats","review","targets"].includes(n.action.kind))||null}catch(_){return null}
  }
  function openTile(id,st){
    const P=window.eviaPractice;
    if(id==="hours")nav("hours");
    else if(id==="tests"&&P)P.openHub();
    else if(id==="skills"&&P)P.openConfidence();
    else if(id==="tasks"&&P)P.openAllTasks();
    else if(id==="scenarios"&&window.eviaScenarios)window.eviaScenarios.openTopics();
    else if(id==="knowledge"&&window.eviaNvq)window.eviaNvq.openKnowledge();
    else if(id==="reviews")openSavedReviews();
    else if(id==="badges"&&st){
      uiSheet("LEARNING","Achievements",window.eviaStats.badgesHtml(st));
      window.eviaStats.markSeen(window.eviaStats.achievements(st).fresh.map(x=>x.id));
    }
  }
  /* A bottom sheet in the same style as Practice. */
  function uiSheet(kicker,title,body){
    const root=document.getElementById("modal-root");
    root.innerHTML='<div class="overlay"><section class="sheet pr-sheet" role="dialog" aria-modal="true" aria-labelledby="ui-sheet-title"><div class="sheet-head"><div><div class="chat-kicker">'+kicker+'</div><h2 id="ui-sheet-title">'+escHtml(title)+'</h2></div><button class="close" id="ui-sheet-close" type="button" aria-label="Close">×</button></div><div class="pr-body">'+body+'</div></section></div>';
    const close=()=>{root.innerHTML=""};
    document.getElementById("ui-sheet-close").onclick=close;
    root.querySelector(".overlay").addEventListener("click",e=>{if(e.target.classList.contains("overlay"))close()});
    const h=document.getElementById("ui-sheet-title");h.setAttribute("tabindex","-1");h.focus({preventScroll:true});
    return {el:root.querySelector(".pr-sheet"),close};
  }
  /* ---------- Progress ---------- */
  const GROUPS=[["K","Knowledge"],["S","Skills"],["B","Behaviours"]];
  let expanded={}; /* groups start collapsed: three rings, tap one to see its KSBs */
  function progressScreen(still){ /* still: redrawn after opening a KSB group, so don't replay the animations */
    $("#page-title").textContent="My progress";
    const a=analyse(),all=allK(),supporting=supportingMeta().filter(s=>s.course===course);
    const hasSupport=c=>supporting.some(s=>Array.isArray(s.ksbs)&&s.ksbs.includes(c));
    const S=window.eviaStats,st=(()=>{try{return S?S.compute():null}catch(_){return null}})();
    const tip=learningTip(st);
    $("#screen").innerHTML=pageHead("My progress")+
      '<div class="ui-page">'+
        (st?S.heroHtml(st):"")+
        (()=>{const rd=window.eviaReviewDue&&window.eviaReviewDue();if(!rd)return"";const d=rd.due.toLocaleDateString("en-GB",{day:"numeric",month:"short"});return '<button type="button" class="ui-card ui-review-due'+(rd.days<=14?" soon":"")+'" id="ui-review-due"><span><small>Next progress review</small><strong>'+(rd.days<0?"Overdue · was due "+d:rd.days===0?"Due today":"Due "+d+(rd.days<=14?" · in "+rd.days+" day"+(rd.days===1?"":"s"):""))+'</strong></span><em>'+(rd.days<=14?"Start now":"Do it early")+' ›</em></button>'})()+
        (window.eviaTargets?(window.eviaTargets.check(false),window.eviaTargets.cardHtml()):"")+
        (tip?'<section class="ui-card ui-tip"><span class="evia-mini" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span><div><p>'+escHtml(tip.text)+'</p><button type="button" class="ui-tip-go" id="ui-tip-go">'+escHtml(tip.action.label)+' ›</button></div></section>':"")+
        (st?S.tilesHtml(st):"")+
        (window.eviaNvq&&window.eviaNvq.on()?"":'<h2 class="pg-x-h">Knowledge, skills and behaviours</h2>')+
        (window.eviaNvq&&window.eviaNvq.on()?window.eviaNvq.progressHtml(a):'<section class="ui-card ui-groups">'+GROUPS.map(([letter,label],gi)=>{
          const items=all.filter(x=>x[0].startsWith(letter));if(!items.length)return"";
          const done=items.filter(x=>a.evidenced.has(x[0])).length,pct=Math.round(done/items.length*100),open=!!expanded[letter]||document.body.classList.contains("evia-onboarding"); /* the demo points at K2 and S2, so keep groups open */
          return (gi?'<div class="ui-divider"></div>':"")+
            '<button type="button" class="ui-group-head" data-group="'+letter+'" aria-expanded="'+open+'">'+ring(pct,44,5,null)+
              '<span class="ui-group-copy"><strong>'+label+'</strong><small>'+done+' of '+items.length+' with evidence</small></span><span class="ui-group-pct">'+pct+'%</span><span class="ui-chev'+(open?" open":"")+'">'+icon(ICONS.chev,18)+'</span></button>'+
            (open?'<div class="ui-ksb-grid">'+items.map(x=>{const met=a.evidenced.has(x[0]);return '<button type="button" class="ui-ksb'+(met?" met":"")+'" data-ksb-code="'+escHtml(x[0])+'" aria-label="'+escHtml(x[0])+(met?", evidence captured":"")+'">'+(met?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>':"")+escHtml(x[0])+(hasSupport(x[0])?'<i class="ui-ksb-dot" aria-label="Supporting evidence"></i>':"")+'</button>'}).join("")+'</div>':"");
        }).join("")+'<p class="ui-help">Tap a KSB to see its wording and the evidence mapped to it.</p></section>')+
      '</div>';
    if(window.eviaTargets){window.eviaTargets.bind(document.getElementById("pg-targets"),()=>progressScreen(true))}
    if(window.eviaNvq&&window.eviaNvq.on())window.eviaNvq.bindProgress(()=>progressScreen(true));
    const rdb=document.getElementById("ui-review-due");if(rdb)rdb.onclick=()=>window.eviaStartReview&&window.eviaStartReview();
    if(st)S.animate(document.getElementById("screen"),still===true);
    document.querySelectorAll("[data-group]").forEach(b=>b.onclick=()=>{const y=window.scrollY;expanded[b.dataset.group]=!expanded[b.dataset.group];progressScreen(true);window.scrollTo(0,y)});
    document.querySelectorAll("[data-tile]").forEach(b=>b.onclick=()=>openTile(b.dataset.tile,st));
    const tg=document.getElementById("ui-tip-go");if(tg)tg.onclick=()=>runNudge(tip);
    document.querySelectorAll(".ui-groups [data-ksb-code]").forEach(b=>b.onclick=()=>{const item=all.find(x=>x[0]===b.dataset.ksbCode);if(item)ksbDetail(item[0],item[1],a.evidenced.has(item[0]))});
  }

  /* ---------- My course: saved evidence sits under the capture page ---------- */
  const SHARE_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3.5"/><path d="m7.5 8 4.5-4.5L16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/></svg>';
  const photoOf=async e=>{try{const p=window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]);return p[0]||null}catch(_){return null}};
  const savedDay=t=>new Date(t).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
  const tileHtml=(key,img,title,sub)=>'<div class="ev-tile"><button type="button" class="ev-tile-main" data-ev-open="'+key+'"><span class="ev-tile-img" data-ev-img="'+key+'">'+img+'</span><span class="ev-tile-copy"><strong>'+escHtml(title)+'</strong><small>'+escHtml(sub)+'</small></span></button><button type="button" class="ev-tile-share" data-ev-share="'+key+'" aria-label="Share">'+SHARE_ICON+'</button></div>';
  /* Called by the evidence pack page (polish.js): a grey line, then one tile per saved pack. */
  function savedTiles(unitName,page){
    if(!page)return;
    const entries=evidence.filter(e=>e.c===course&&e.u===unitName).sort((x,y)=>entryTime(y)-entryTime(x));
    if(!entries.length)return;
    const words=e=>String(e.w||"").trim()?String(e.w).trim().split(/\s+/).length:0,count=e=>(e.photoIds||e.p||[]).length;
    page.insertAdjacentHTML("beforeend",'<div class="ev-saved-line"></div><section class="ev-saved"><h3>Saved evidence</h3>'+
      entries.map(e=>tileHtml(escHtml(e.id),icon(ICONS.camera,20),"Saved "+savedDay(entryTime(e)),count(e)+" photo"+(count(e)===1?"":"s")+" · "+words(e)+" words")).join("")+'</section>');
    entries.forEach(async e=>{const src=await photoOf(e),el=page.querySelector('[data-ev-img="'+CSS.escape(String(e.id))+'"]');if(src&&el)el.innerHTML='<img src="'+src+'" alt="">'});
    page.querySelectorAll("[data-ev-open]").forEach(b=>b.onclick=()=>viewPack(entries.find(e=>String(e.id)===b.dataset.evOpen)));
    page.querySelectorAll("[data-ev-share]").forEach(b=>b.onclick=()=>{const e=entries.find(x=>String(x.id)===b.dataset.evShare);if(e&&window.eviaOpenSendToPortfolio)window.eviaOpenSendToPortfolio(unitName,e.id)});
  }
  /* A saved pack, to look back at: its photos and write-up. */
  async function viewPack(e){
    if(!e)return;
    const sh=uiSheet("SAVED "+savedDay(entryTime(e)).toUpperCase(),e.u,
      '<div class="ev-view-photos" id="ev-view-photos"></div>'+
      (String(e.w||"").trim()?'<p class="ev-view-text">'+escHtml(e.w)+'</p>':"")+
      '<div class="pr-actions"><button type="button" class="secondary" id="ev-view-share">'+SHARE_ICON+' Share</button></div>');
    sh.el.querySelector("#ev-view-share").onclick=()=>{sh.close();window.eviaOpenSendToPortfolio&&window.eviaOpenSendToPortfolio(e.u,e.id)};
    try{const photos=window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]);const g=sh.el.querySelector("#ev-view-photos");if(g)g.innerHTML=photos.map(src=>'<img src="'+src+'" alt="Evidence photo">').join("")}catch(_){}
  }
  window.eviaSavedTiles=savedTiles;
  /* Supporting evidence is its own unit: the same capture page, with its files as tiles underneath. */
  const originalSupporting=window.openSupportingEvidence;
  window.openSupportingEvidence=async function(){
    await originalSupporting.apply(this,arguments);
    const scr=document.getElementById("screen"),items=supportingMeta().filter(x=>x.course===course).slice().reverse();
    if(!items.length||!scr)return;
    const TYPE_ICON={photo:ICONS.camera};
    scr.insertAdjacentHTML("beforeend",'<div class="ev-saved-line"></div><section class="ev-saved"><h3>Saved evidence</h3>'+
      items.map(x=>tileHtml(escHtml(x.id),typeof supportingCardIcon==="function"?supportingCardIcon(x.type):icon(TYPE_ICON[x.type]||ICONS.camera,20),x.title||"Supporting evidence",[savedDay(x.createdAt||x.savedAt||Date.now()),typeof supportingSummary==="function"?supportingSummary(x):""].filter(Boolean).join(" · "))).join("")+'</section>');
    items.filter(x=>x.type==="photo").forEach(async x=>{try{const rec=await window.eviaSupportingFileGet(x.id),el=scr.querySelector('[data-ev-img="'+CSS.escape(x.id)+'"]');if(rec&&rec.blob&&el)el.innerHTML='<img src="'+URL.createObjectURL(rec.blob)+'" alt="">'}catch(_){}});
    scr.querySelectorAll("[data-ev-open]").forEach(b=>b.onclick=()=>openSupportingDetails(b.dataset.evOpen,false,window.openSupportingEvidence));
    scr.querySelectorAll("[data-ev-share]").forEach(b=>b.onclick=async()=>{
      const x=items.find(i=>i.id===b.dataset.evShare);if(!x)return;
      try{
        const rec=await window.eviaSupportingFileGet(x.id);if(!rec||!rec.blob)throw new Error("missing");
        const file=new File([rec.blob],x.filename||"supporting-evidence",{type:rec.blob.type||"application/octet-stream"});
        if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:x.title||"Supporting evidence"});return}
        const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=file.name;document.body.appendChild(a);a.click();a.remove();
      }catch(err){if(!(err&&err.name==="AbortError")&&typeof showEvidenceToast==="function")showEvidenceToast("Couldn’t share that file",true)}
    });
  };

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
  let userTurns=0; /* counts the learner's choices, so a late suggestion doesn't land after one */
  function userSays(text){userTurns++;const c=chatBox();if(!c)return;const d=document.createElement("div");d.className="bubble user";d.textContent=text;c.appendChild(d);scrollChat()}
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
        say("Tap any KSB on My progress to see its full wording.");
        replies([{label:"Go to My progress",primary:true,run:()=>{closeChat();setTimeout(()=>nav("progress"),60)}}].concat(more("Which KSBs am I missing?").slice(0,2),[{label:"Something else",run:somethingElse}]));
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
    const gen=chatGen,turns=userTurns;
    queue=queue.then(()=>{
      const c=chatBox();if(!c||gen!==chatGen||turns!==userTurns)return; /* they've already picked something else */
      const box=document.createElement("div");box.className="chat-options ui-replies";
      const b=document.createElement("button");b.type="button";b.className="chat-pill ui-pill-primary";b.innerHTML="<strong>"+escHtml(n.action.label)+"</strong>";
      b.onclick=()=>{box.remove();if(!["test","confidence","targets","review"].includes(n.action.kind))userSays(n.action.label);runNudge(n)};
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
  /* My targets: the targets from the latest review, or a new set from Evia if there aren't any. */
  function targetsFromMenu(){
    userSays("My targets");
    const T=window.eviaTargets,{list,created}=T.ensure();
    if(!list.length){say("I need a bit more from you first. Capture some evidence and I’ll set targets.");replies([{label:"Something else",run:somethingElse}]);return}
    T.check(false);
    const now=T.mine(),S=T.stats(),done=now.filter(t=>t.done).length;
    const open=now.filter(t=>!t.done).map(t=>({t,p:T.progress(t,S).pct})).sort((x,y)=>y.p-x.p);
    if(created)say("You didn’t have any targets yet, so I’ve set "+plural(now.length,"target")+" based on how you’re getting on.");
    else say(done===now.length?"You’ve completed all "+now.length+" targets. Brilliant. A progress review will set new ones.":"You’ve completed <strong>"+done+" of "+now.length+"</strong> targets."+(open[0]&&open[0].p>0?" Closest to done: <strong>"+escHtml(open[0].t.title)+"</strong> ("+Math.round(open[0].p*100)+"%).":""));
    const gen=chatGen;
    queue=queue.then(()=>{
      const c=chatBox();if(!c||gen!==chatGen)return;
      const box=document.createElement("div");box.className="chat-targets pg-animate";box.innerHTML=T.cardHtml({chat:true});c.appendChild(box);
      T.bind(box);scrollChat();
      requestAnimationFrame(()=>requestAnimationFrame(()=>{const card=box.querySelector(".pg-card");if(card)card.classList.add("pg-in")}));
    });
    replies([{label:"See them in My progress",primary:true,run:()=>{closeChat();setTimeout(()=>{nav("progress");setTimeout(()=>{const el=document.getElementById("pg-targets");if(el)el.scrollIntoView({block:"start",behavior:"smooth"})},400)},60)}},{label:"Start a progress review",run:reviewFromMenu},{label:"Something else",run:somethingElse}]);
  }
  /* Progress review: a short click-through of sections; finishing it sets new targets. */
  function reviewFromMenu(){
    userSays("Progress review");
    const last=(window.eviaGetReviews?window.eviaGetReviews():[])[0],rd=window.eviaReviewDue?window.eviaReviewDue():null;
    if(rd)say(rd.days<0?"Your review was due on <strong>"+rd.due.toLocaleDateString("en-GB",{day:"numeric",month:"long"})+"</strong>, so now’s a good time.":"Your next review is due on <strong>"+rd.due.toLocaleDateString("en-GB",{day:"numeric",month:"long"})+"</strong>"+(rd.days<=14?", so now’s a good time.":". You can do one early whenever you like."));
    say("I’ll take you through your review in a few short sections: evidence, learning, tests, skills and staying safe. At the end I’ll set your new targets. It takes about 3 minutes."+(last?" Your last review was on "+new Date(last.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})+".":""));
    replies([{label:"Start my review",primary:true,run:()=>{closeChat();setTimeout(window.eviaStartReview,80)}},{label:"Not now",run:somethingElse}]);
  }
  /* College task: Evia's pick from the confidence check, or the full list if there isn't one. */
  function taskFromMenu(){
    userSays("Suggest a college task");
    const P=window.eviaPractice,picks=P.suggestTasks(3),all=(window.EVIA_PRACTICE_TASKS||{})[course]||[];
    const open=f=>()=>{closeChat();setTimeout(f,80)};
    if(picks.length){
      const x=picks[0];
      say("Try this in the workshop: <strong>"+escHtml(x.task.title)+"</strong>. It practises "+escHtml(x.covers.join(", "))+", which you rated low in your confidence check. It takes about "+escHtml(x.task.time)+".");
      replies([{label:"Show me the steps",primary:true,run:open(()=>P.openTask(0))},{label:"See all college tasks",run:open(P.openAllTasks)},{label:"Something else",run:somethingElse}]);
    }else if(all.length){
      say("I pick college tasks from your confidence check, so I can aim them at the skills you’re least sure of. You haven’t rated anything low yet. Do a quick confidence check, or have a look at all "+all.length+" tasks for your course.");
      replies([{label:"Do a confidence check",primary:true,run:open(P.openConfidence)},{label:"See all college tasks",run:open(P.openAllTasks)},{label:"Something else",run:somethingElse}]);
    }else{
      say("I don’t have college tasks for your course yet. Ask your tutor which jobs to practise in the workshop.");
      replies([{label:"Something else",run:somethingElse}]);
    }
  }
  function enhanceChat(opts){
    const c=chatBox();if(!c)return;
    queue=Promise.resolve();chatGen++;
    const greet=c.querySelector(".bubble.evia"),name=firstName();
    if(greet)greet.innerHTML=pick([partOfDay()+(name?" "+escHtml(name):"")+". What would you like to do?","Hi"+(name?" "+escHtml(name):"")+". How can I help today?"]);
    menuItems=[];
    /* Confidence check lives in Practice now; its place in the menu goes to My targets. */
    c.querySelectorAll("[data-chat-option]").forEach(b=>{
      const label=b.textContent.trim(),original=b.onclick;
      const item=label==="Portfolio check"?{label:"My stats",run:statsFromMenu}
        :label==="Confidence check"&&window.eviaTargets?{label:"My targets",run:targetsFromMenu}
        :label==="Progress review"&&window.eviaStartReview?{label,run:reviewFromMenu}
        :{label,run:()=>original&&original.call(b)};
      menuItems.push(item);
      b.innerHTML="<strong>"+escHtml(item.label)+"</strong>";
      b.onclick=()=>{userTurns++;const box=b.closest(".chat-options");if(box)box.remove();item.run()};
    });
    /* College task goes in after the app's own options. */
    const optBox=c.querySelector("[data-chat-option]")&&c.querySelector("[data-chat-option]").closest(".chat-options");
    if(optBox&&window.eviaPractice&&window.eviaPractice.openAllTasks){
      const item={label:"College task",run:taskFromMenu};menuItems.push(item);
      const b=document.createElement("button");b.type="button";b.className=optBox.querySelector("[data-chat-option]").className;b.innerHTML="<strong>College task</strong>";
      b.onclick=()=>{userTurns++;optBox.remove();item.run()};optBox.appendChild(b);
    }
    if(!(opts&&opts.quiet===true))today();
  }
  /* After a test: celebrate a good score and offer what to do next. */
  window.addEventListener("evia:test-saved",e=>{
    if(!chatBox())return;
    const d=e.detail||{};
    if(d.pct>=80&&window.eviaMood)window.eviaMood("happy");
    const opts=[{label:"Try another test",primary:true,run:()=>{closeChat();setTimeout(()=>window.eviaPractice&&window.eviaPractice.openHub(),60)}}];
    if(window.eviaReviewDraft&&window.eviaReviewDraft()){opts[0].primary=false;opts.unshift({label:"Back to my review",primary:true,run:()=>{closeChat();setTimeout(()=>window.eviaResumeReview&&window.eviaResumeReview(),60)}})}
    if(d.missed&&d.missed.length)opts.push({label:"Go to My progress",run:()=>{closeChat();setTimeout(()=>nav("progress"),60)}});
    opts.push({label:"See my stats",run:()=>{closeChat();setTimeout(showStats,60)}},{label:"Something else",run:somethingElse});
    queue=queue.then(()=>new Promise(r=>setTimeout(r,1400))); /* let the result bubble finish "thinking" first */
    replies(opts);
  });

  /* Page heading in the strip beside the profile button: where you are, and which course. */
  const pageHead=title=>'<header class="ui-page-head"><h1>'+escHtml(title)+'</h1><span>'+escHtml(data().name)+'</span></header>';

  /* ---------- Hours: off-the-job learning ---------- */
  /* Quick amounts to tap, one line about what you did, and the log underneath. */
  function hoursScreen(){
    $("#page-title").textContent="Hours";
    const lastBatch=otjBatches[otjBatches.length-1],cutoff=Number(lastBatch?lastBatch.cutoff:0);
    const pending=hours.filter(x=>Number(x.createdAt)>cutoff).length;
    const total=hours.reduce((n,x)=>n+Number(x.n||0),0);
    const weekStart=(()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()})();
    const week=hours.filter(x=>Number(x.createdAt)>=weekStart).reduce((n,x)=>n+Number(x.n||0),0);
    const fmt=n=>Math.round(n*100)/100;
    const day=t=>new Date(Number(t)).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
    $("#screen").innerHTML='<button class="secondary ui-back" id="ui-hours-back" type="button">‹ My progress</button><h1 class="ui-sub-title">Off-the-job hours</h1>'+
      '<div class="ui-page">'+
        '<section class="ui-card ui-hours-sum"><div><strong>'+fmt(total)+'</strong><small>hours logged</small></div><div><strong>'+fmt(week)+'</strong><small>this week</small></div></section>'+
        '<section class="ui-card ui-hours-log">'+
          '<h2>Log off-the-job hours</h2>'+
          '<div class="ui-hours-chips" role="group" aria-label="Hours">'+[0.5,1,2,3,7.5].map(n=>'<button type="button" class="ui-hours-chip" data-hrs="'+n+'">'+n+'</button>').join("")+'<input id="hrs" type="number" min="0" step=".25" inputmode="decimal" placeholder="Other" aria-label="Hours"></div>'+
          '<textarea id="otj-description" rows="2" placeholder="What did you do or learn? For example: toolbox talk on working at height"></textarea>'+
          '<button class="primary" id="add" type="button">Save hours</button>'+
          '<p class="ui-hours-hint">College days, training, toolbox talks, research and shadowing all count.</p>'+
        '</section>'+
        (pending||lastBatch?'<div class="ui-hours-pdf"><span>'+(pending?"<strong>"+pending+" new "+(pending===1?"entry":"entries")+"</strong> for your OTJ PDF":"All entries are in your last PDF")+'</span>'+(pending?'<button class="secondary" id="download-otj" type="button">Download PDF</button>':'<button class="secondary" id="download-last-otj" type="button">Last PDF again</button>')+'</div>':"")+
        (hours.length?'<h2 class="ui-hours-h">Your log</h2><div class="ui-card ui-hours-list">'+hours.slice().reverse().map(x=>'<div class="ui-hours-item"><span class="ui-hours-n">'+fmt(Number(x.n||0))+'<small>hrs</small></span><span class="ui-hours-copy"><strong>'+escHtml(x.description||"No description recorded.")+'</strong><small>'+escHtml(day(x.createdAt))+(Number(x.createdAt)>cutoff&&lastBatch?' · <em>New</em>':"")+'</small></span></div>').join("")+'</div>':"")+
      '</div>';
    const input=$("#hrs");
    document.querySelectorAll("[data-hrs]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-hrs]").forEach(x=>x.classList.toggle("on",x===b));input.value=b.dataset.hrs});
    input.oninput=()=>document.querySelectorAll("[data-hrs]").forEach(x=>x.classList.toggle("on",x.dataset.hrs===input.value));
    $("#add").onclick=()=>{
      const n=Number(input.value),description=$("#otj-description").value.trim();
      if(!(n>0)){input.focus();if(typeof showEvidenceToast==="function")showEvidenceToast("Pick how many hours first",true);return}
      if(!description){$("#otj-description").focus();if(typeof showEvidenceToast==="function")showEvidenceToast("Add a few words about what you did",true);return}
      const now=Date.now();hours.push({id:"otj-"+now+"-"+Math.random().toString(36).slice(2,8),n,description,createdAt:now,savedAt:formatDateTime(now)});persist();
      hoursScreen();if(typeof showEvidenceToast==="function")showEvidenceToast(fmt(n)+" hour"+(n===1?"":"s")+" saved");
      if(window.eviaCheckTargets)window.eviaCheckTargets();
    };
    $("#ui-hours-back").onclick=()=>nav("learning");
    const dl=$("#download-otj");if(dl)dl.onclick=()=>downloadOTJPDF("new");
    const lp=$("#download-last-otj");if(lp)lp.onclick=()=>downloadOTJPDF("last");
  }

  /* ---------- Wire into the app ---------- */
  const originalRender=window.render,originalChat=window.chat;
  /* Two tabs either side of Evia. Old screen names still work: Portfolio is Course's "My evidence", Progress is Learning. */
  const TOP_SCREENS=["course","learning"];
  window.render=function(){
    hideBubble();
    if(screen==="home")screen="course";
    if(screen==="portfolio")screen="course";
    if(screen==="progress")screen="learning";
    const scr=document.getElementById("screen");if(scr)scr.classList.toggle("ui-top",TOP_SCREENS.includes(screen));
    if(screen==="learning"||screen==="hours"){
      const pb=document.getElementById("profile-btn");if(pb)pb.style.display=screen==="learning"?"flex":"none";
      document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav==="learning"));
      if(screen==="hours")hoursScreen();else progressScreen();
      return;
    }
    originalRender();
  };
  window.progress=progressScreen;
  window.learning=()=>screen==="hours"?hoursScreen():progressScreen();
  const originalCourses=window.courses;
  window.courses=function(){
    originalCourses();
    const head=document.querySelector("#screen > .card:not(.unit-card)");
    if(head)head.remove();
    document.getElementById("screen").insertAdjacentHTML("afterbegin",pageHead("My course").replace('class="ui-page-head"','class="ui-page-head" id="ui-course-head"'));
    courseNudge();
  };
  window.portfolio=()=>window.courses();
  /* Evia's bubble belongs to the course list: it goes when anything else (a unit, supporting evidence) replaces it. */
  const scrEl=document.getElementById("screen");
  if(scrEl)new MutationObserver(()=>{if(!document.getElementById("ui-course-head")&&document.getElementById("ui-evia-bubble"))hideBubble()}).observe(scrEl,{childList:true});
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
  window.eviaCoach={analyse,suggestion,checkUnit,showStats};
  window.eviaStartTest=startTest;
  if(!document.body.classList.contains("evia-onboarding"))render();
})();
