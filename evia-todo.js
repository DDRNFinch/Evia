/* Evia7 to-do: Evia keeps the learner on track. When the chat opens she lists what actually needs doing, the three
   most urgent first, each one tap from the place in the app to do it. Nothing to do: "You're all caught up", and three
   ways to get ahead. The work itself happens in the rest of the app.
   What counts, most urgent first: what the assessor asked for, the first piece of evidence, overdue targets, a review
   that's close, evidence drafts, targets due soon, the next unit when behind pace, weak evidence, learning hours,
   other targets, the confidence check, a backup, and course notifications.
   window.eviaTodo: list(), show(opts). */
(function(){
  const K=()=>window.eviaChatKit,C=()=>window.eviaCoachFlows||{};
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const DAY=864e5,hm=h=>window.eviaHM?window.eviaHM(h):Math.round(h*10)/10+"h";
  const plural=(n,w)=>n+" "+w+(n===1?"":"s");
  const listText=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
  const shortDay=d=>new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  const leave=f=>()=>{K().closeChat();setTimeout(f,100)};
  const openUnit=u=>K().openUnitFromChat(u);
  const unitAt=(u,sel,how)=>()=>C().openUnitAt?C().openUnitAt(u,sel,how):openUnit(u);
  const inChat=(said,f)=>()=>{K().userSays(said);f()};
  function aimPerWeek(){
    try{const en=window.eviaData.enrolment&&window.eviaData.enrolment(),p=window.eviaData.learner()||{},s=Date.parse((en&&en.start)||p.start||""),e=Date.parse((en&&en.end)||p.end||""),planned=Number(en&&en.plannedOtjHours);
      if(planned>0&&e>s)return Math.round(planned/((e-s)/(7*DAY))*10)/10}catch(_){}
    return 6;
  }
  const weekStart=t=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()};

  /* Everything that needs doing, most urgent first: {u: urgency, title, detail, label, run}. */
  function list(){
    let S=null;try{S=window.eviaStats.compute()}catch(_){return []}
    const a=S.a,units=a.units,out=[],add=(u,ic,title,detail,label,run)=>out.push({u,ic,title,detail,label,run});

    /* The assessor asked for more on a unit. */
    const more=window.eviaMoreRequired?window.eviaMoreRequired():[];
    [...new Set(more.map(x=>x.unit))].forEach(name=>{const u=units.find(x=>x.name===name);if(!u)return;
      const codes=more.filter(x=>x.unit===name).map(x=>x.code);
      add(100,"assessor","Assessor wants more: "+name,"Still needed: "+codes.slice(0,4).join(", ")+(codes.length>4?" +"+(codes.length-4):""),"Catch up",unitAt(u,"#cu-start","click"))});

    /* No evidence yet: the first unit. */
    const started=units.filter(u=>u.started);
    if(!started.length&&a.quickest)add(95,"evidence","Start your first evidence",a.quickest.name+" is a good place to start","Start "+a.quickest.name,()=>openUnit(a.quickest));

    /* Targets from the review. */
    const T=window.eviaTargets,targets=T?T.mine().filter(t=>!t.done):[];
    targets.forEach(t=>{const due=new Date(t.due+"T23:59:59").getTime(),days=Math.ceil((due-Date.now())/DAY),go=C().targetDo?C().targetDo(t):leave(()=>nav("learning"));
      if(days<0)add(90,"target",t.title,"Target overdue since "+shortDay(due),"Do it now",go);
      else if(days<=14)add(70,"target",t.title,"Target due "+(days===0?"today":days===1?"tomorrow":"in "+plural(days,"day")),"Do it now",go);
      else add(40,"target",t.title,"Target due "+shortDay(due),"Do it now",go)});

    /* A review that's close, with things to get ready (including their comments for the assessor). */
    const rd=window.eviaReviewDue&&window.eviaReviewDue(),prep=window.eviaReviewPrepCount?window.eviaReviewPrepCount():0;
    if(rd&&rd.days<=14&&rd.days>=-14&&prep)add(rd.days<=7?85:65,"review",rd.days<0?"Review overdue: get ready":rd.days===0?"Review today: get ready":"Review in "+plural(rd.days,"day"),plural(prep,"thing")+" to get ready","Get ready",inChat("Get ready for my review",()=>C().prepare&&C().prepare()));

    /* Evidence started but not saved. */
    if(typeof isDraft==="function")units.filter(u=>isDraft(u.name)).slice(0,2).forEach(u=>add(75,"draft","Finish your "+u.name+" draft","Started, not saved yet","Finish it",()=>openUnit(u)));

    /* Behind pace: the unit that ticks off the most. */
    if(started.length&&a.timePct!=null&&a.quickest&&a.timePct-a.ksbPct>10)
      add(Math.min(80,60+Math.round((a.timePct-a.ksbPct)/5)),"unit","Next unit: "+a.quickest.name,"Covers "+plural(a.quickest.missing.length,"KSB")+" you still need","Open "+a.quickest.name,()=>openUnit(a.quickest));

    /* Weak evidence: too few photos, or a write-up missing what the assessor looks for. */
    (S.checks||[]).map(c=>({c,p:c.terms.length?c.covered.length/c.terms.length:1})).filter(x=>x.p<.5||x.c.photos<3).sort((x,y)=>x.p-y.p).slice(0,2).forEach(({c})=>{
      const few=c.photos<3;
      add(55,few?"photo":"write","Strengthen "+c.u.name,few?(c.photos?"Only "+plural(c.photos,"photo")+": add more":"No photos yet"):"Covers "+c.covered.length+" of "+c.terms.length+" key points",
        few?"Add photos":"Improve it",few?unitAt(c.u,"#evidence-photos"):unitAt(c.u,"#write","focus"))});

    /* Learning hours: behind this week (from Wednesday), or last week fell short. */
    const aim=aimPerWeek(),wd=new Date().getDay(),ws=weekStart(Date.now());
    const last=(typeof hours!=="undefined"?hours:[]).filter(x=>{const t=Number(x.on||x.createdAt);return t>=ws-7*DAY&&t<ws}).reduce((n,x)=>n+Number(x.n||0),0);
    if(S.otjWeek<aim&&(wd===0||wd>=3))add(50,"hours","Log your learning hours",(S.otjWeek?hm(S.otjWeek):"Nothing")+" this week, aim for "+hm(aim),"Log hours",inChat("Log my hours",()=>C().hours&&C().hours()));
    else if(S.otjWeek<aim&&last<aim&&started.length)add(45,"hours","Log your learning hours",hm(last)+" last week, aim for "+hm(aim),"Log hours",inChat("Log my hours",()=>C().hours&&C().hours()));

    /* The confidence check: never done, or over 12 weeks ago. */
    const conf=S.confidence;
    if(!conf.sessions)add(35,"skills","Rate your skills","Two minutes, tells your tutor what to practise","Start",inChat("Rate my skills",()=>C().confidence&&C().confidence()));
    else if(conf.last&&Date.now()-conf.last>84*DAY)add(30,"skills","Rate your skills again","Last done "+shortDay(conf.last),"Start",inChat("Rate my skills",()=>C().confidence&&C().confidence()));

    /* A backup, for learners not connected to a college (their work only lives on this phone). */
    const joined=window.eviaNisia&&window.eviaNisia.joined&&window.eviaNisia.joined();
    if(!joined){
      const packs=(typeof evidence!=="undefined"?evidence:[]).filter(e=>e&&!e.induction),lastB=Date.parse(localStorage.getItem("evia7-last-backup")||"")||null;
      const since=lastB?packs.filter(e=>(Date.parse(e.savedAt||"")||0)>lastB).length:packs.length;
      if((!lastB&&packs.length>=3)||(lastB&&since>=5))add(25,"backup","Back up your portfolio",lastB?plural(since,"new pack")+" since your last backup":"Only saved on this phone","Back up now",()=>K().runNudge({action:{kind:"backup",label:"Back up now"}}));
    }
    /* Connected to a college: course notifications, until they've answered once. */
    if(window.eviaPush&&window.eviaPush.state()==="off"&&!window.eviaPush.asked())add(20,"bell","Turn on course notifications","Hear about sign-offs and reviews","Turn on",pushOn);

    return out.sort((x,y)=>y.u-x.u);
  }
  async function pushOn(){
    K().userSays("Turn on notifications");
    let ok=false;try{ok=await window.eviaPush.on()}catch(_){}
    K().say(ok?"Done. I’ll only tell you about your course, and never between 9pm and 7:30am. You can turn them off in your profile."
      :window.eviaPush.state()==="blocked"?"Notifications are blocked for Evia in your phone’s settings. Allow them there, then turn them on in your profile."
      :"I couldn’t turn them on just now. You can try again from your profile.");
    K().replies([{label:"Something else",run:()=>show({again:true})}]);
  }

  /* ---------- In the chat ---------- */
  const SVG=p=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
  const ICON={
    assessor:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    evidence:'<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z"/><circle cx="12" cy="13" r="3.5"/>',
    photo:'<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z"/><circle cx="12" cy="13" r="3.5"/>',
    target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    review:'<path d="M9 4.5h6a1 1 0 0 1 1 1V7H8V5.5a1 1 0 0 1 1-1Z"/><path d="M8 5.5H6.5A1.5 1.5 0 0 0 5 7v12.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H16"/><path d="m8.5 13.5 2.3 2.3 4.7-4.8"/>',
    draft:'<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
    write:'<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
    unit:'<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    hours:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    skills:'<path d="M5 19V13M10 19V9M15 19v-5M20 19V5"/>',
    backup:'<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.5A3.8 3.8 0 0 1 17.5 18Z"/><path d="M12 11v5M9.5 13.5 12 11l2.5 2.5"/>',
    bell:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'
  };
  const GO=SVG('<path d="m9 6 6 6-6 6"/>');
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* All caught up: a tick that draws itself and a burst of confetti. */
  function celebrate(){
    const colours=["var(--yellow,#f5c518)","#3cb371","#4f8cff","#ff7a59","#b06cff"];
    K().widget('<div class="td-done" role="img" aria-label="All caught up"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="m15 27 7 7 15-16"/></svg>'+
      (reduced()?"":'<span class="td-confetti" aria-hidden="true">'+Array.from({length:18},(_,i)=>{const ang=i/18*Math.PI*2+Math.random()*.3,d=60+Math.random()*50;
        return '<i style="--x:'+Math.round(Math.cos(ang)*d)+'px;--y:'+Math.round(Math.sin(ang)*d-20)+'px;--r:'+Math.round(Math.random()*540-270)+'deg;--d:'+(Math.random()*.15).toFixed(2)+'s;background:'+colours[i%colours.length]+'"></i>'}).join("")+'</span>')+'</div>');
  }
  function show(opts){
    document.body.classList.remove("evia-epa");
    const k=K(),items=window.eviaTodo.list(),top=items.slice(0,3),name=k.firstName?k.firstName():"",again=!!(opts&&opts.again);
    const hello=again?"":["Morning","Afternoon","Evening"][new Date().getHours()<12?0:new Date().getHours()<18?1:2]+(name?" "+esc(name):"")+". ";
    if(window.eviaLook)window.eviaLook(0,-30,1800);
    if(!items.length){
      if(window.eviaMood)window.eviaMood("happy");
      k.say(hello+"You’re all caught up. Nice work.");
      celebrate();
      k.say("Want to get ahead?");
      let a=null;try{a=window.eviaStats.compute().a}catch(_){}
      const q=a&&a.quickest;
      k.replies([q?{label:(q.started?"Add to ":"Start ")+q.name,primary:true,run:()=>openUnit(q)}:{label:"Go to My course",primary:true,run:leave(()=>nav("course"))},
        {label:"A Teach me lesson",run:leave(()=>nav("teach"))},
        {label:(window.eviaNvq&&window.eviaNvq.on())?"Knowledge tests":"EPA practice",run:()=>C().epa&&C().epa()}]);
      return;
    }
    if(window.eviaMood)window.eviaMood(items.some(x=>x.u>=85)?"think":"happy");
    const n='<span class="td-count">'+items.length+'</span>';
    k.say(again?(items.length===1?"Here’s what’s left.":"Here’s what’s left, most urgent first."):hello+(items.length===1?"You’ve got <span class=\"td-count\">one</span> thing to do.":items.length<=3?"You’ve got "+n+" things to do.":"You’ve got "+n+" things to do. Here are the 3 most urgent."));
    k.widget('<div class="td-list">'+top.map((x,i)=>'<button type="button" class="td-item'+(x.u>=85?" urgent":"")+'" data-i="'+i+'" style="--i:'+i+'" aria-label="'+esc(x.title+". "+x.detail+". "+x.label)+'">'+
      '<span class="td-ic">'+SVG(ICON[x.ic]||ICON.unit)+'</span><span class="td-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></span><span class="td-go">'+GO+'</span></button>').join("")+'</div>',el=>{
      el.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{
        el.querySelectorAll("button").forEach(x=>x.disabled=true);el.classList.add("td-used");b.classList.add("td-picked");
        setTimeout(()=>top[+b.dataset.i].run(),reduced()?0:260);
      });
    });
  }
  window.eviaTodo={list,show};
})();
