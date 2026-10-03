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
    const a=S.a,units=a.units,out=[],add=(u,title,detail,label,run)=>out.push({u,title,detail,label,run});
    const term=window.eviaTerm?window.eviaTerm().many:"KSBs";

    /* The assessor asked for more on a unit. */
    const more=window.eviaMoreRequired?window.eviaMoreRequired():[];
    [...new Set(more.map(x=>x.unit))].forEach(name=>{const u=units.find(x=>x.name===name);if(!u)return;
      const codes=more.filter(x=>x.unit===name).map(x=>x.code);
      add(100,"Your assessor wants more on "+name,"Still needed: "+codes.slice(0,5).join(", ")+(codes.length>5?" and "+(codes.length-5)+" more":""),"Catch up",unitAt(u,"#cu-start","click"))});

    /* No evidence yet: the first unit. */
    const started=units.filter(u=>u.started);
    if(!started.length&&a.quickest)add(95,"Start your first piece of evidence",a.quickest.name+" is a good place to start. Any job from site this week can count.","Start "+a.quickest.name,()=>openUnit(a.quickest));

    /* Targets from the review. */
    const T=window.eviaTargets,targets=T?T.mine().filter(t=>!t.done):[];
    targets.forEach(t=>{const due=new Date(t.due+"T23:59:59").getTime(),days=Math.ceil((due-Date.now())/DAY),go=C().targetDo?C().targetDo(t):leave(()=>nav("learning"));
      if(days<0)add(90,"Target overdue: "+t.title,"It was due on "+shortDay(due)+".","Do it now",go);
      else if(days<=14)add(70,"Target: "+t.title,"Due "+(days===0?"today":days===1?"tomorrow":"in "+plural(days,"day"))+".","Do it now",go);
      else add(40,"Target: "+t.title,"Due "+shortDay(due)+".","Do it now",go)});

    /* A review that's close, with things to get ready (including their comments for the assessor). */
    const rd=window.eviaReviewDue&&window.eviaReviewDue(),prep=window.eviaReviewPrepCount?window.eviaReviewPrepCount():0;
    if(rd&&rd.days<=14&&rd.days>=-14&&prep)add(rd.days<=7?85:65,rd.days<0?"Your progress review is overdue":rd.days===0?"Your progress review is today":"Your progress review is in "+plural(rd.days,"day"),plural(prep,"thing")+" to get ready, one at a time.","Get ready",inChat("Get ready for my review",()=>C().prepare&&C().prepare()));

    /* Evidence started but not saved. */
    if(typeof isDraft==="function")units.filter(u=>isDraft(u.name)).slice(0,2).forEach(u=>add(75,"Finish your "+u.name+" draft","You’ve started it but it isn’t saved as evidence yet.","Finish it",()=>openUnit(u)));

    /* Behind pace: the unit that ticks off the most. */
    if(started.length&&a.timePct!=null&&a.quickest&&a.timePct-a.ksbPct>10)
      add(Math.min(80,60+Math.round((a.timePct-a.ksbPct)/5)),"Next unit to stay on track: "+a.quickest.name,"You’re "+a.timePct+"% through your course and "+a.ksbPct+"% of your "+term+" have evidence. This unit covers "+plural(a.quickest.missing.length,"KSB")+" you still need.",(a.quickest.started?"Add to ":"Start ")+a.quickest.name,()=>openUnit(a.quickest));

    /* Weak evidence: too few photos, or a write-up missing what the assessor looks for. */
    (S.checks||[]).map(c=>({c,p:c.terms.length?c.covered.length/c.terms.length:1})).filter(x=>x.p<.5||x.c.photos<3).sort((x,y)=>x.p-y.p).slice(0,2).forEach(({c,p})=>{
      const few=c.photos<3;
      add(55,"Make "+c.u.name+" stronger",few?(c.photos?"Only "+plural(c.photos,"photo")+".":"No photos yet.")+" Add the start, middle and finished job.":"The write-up covers "+c.covered.length+" of "+c.terms.length+" things your assessor looks for."+(c.missing&&c.missing.length?" Add "+listText(c.missing.slice(0,3))+".":""),
        few?"Add photos":"Improve it",few?unitAt(c.u,"#evidence-photos"):unitAt(c.u,"#write","focus"))});

    /* Learning hours: behind this week (from Wednesday), or last week fell short. */
    const aim=aimPerWeek(),wd=new Date().getDay(),ws=weekStart(Date.now());
    const last=(typeof hours!=="undefined"?hours:[]).filter(x=>{const t=Number(x.on||x.createdAt);return t>=ws-7*DAY&&t<ws}).reduce((n,x)=>n+Number(x.n||0),0);
    if(S.otjWeek<aim&&(wd===0||wd>=3))add(50,"Log your learning hours",(S.otjWeek?hm(S.otjWeek)+" logged this week.":"Nothing logged this week yet.")+" The aim is about "+hm(aim)+": training, toolbox talks and research all count.","Log hours",inChat("Log my hours",()=>C().hours&&C().hours()));
    else if(S.otjWeek<aim&&last<aim&&started.length)add(45,"Log your learning hours","Last week you logged "+hm(last)+" and the aim is about "+hm(aim)+". Anything you haven’t logged yet?","Log hours",inChat("Log my hours",()=>C().hours&&C().hours()));

    /* The confidence check: never done, or over 12 weeks ago. */
    const conf=S.confidence;
    if(!conf.sessions)add(35,"Rate your skills","You haven’t done a confidence check yet. It takes about two minutes, and it tells your tutor what to practise.","Start",inChat("Rate my skills",()=>C().confidence&&C().confidence()));
    else if(conf.last&&Date.now()-conf.last>84*DAY)add(30,"Rate your skills again","Your last confidence check was on "+shortDay(conf.last)+". See how far you’ve come.","Start",inChat("Rate my skills",()=>C().confidence&&C().confidence()));

    /* A backup, for learners not connected to a college (their work only lives on this phone). */
    const joined=window.eviaNisia&&window.eviaNisia.joined&&window.eviaNisia.joined();
    if(!joined){
      const packs=(typeof evidence!=="undefined"?evidence:[]).filter(e=>e&&!e.induction),lastB=Date.parse(localStorage.getItem("evia7-last-backup")||"")||null;
      const since=lastB?packs.filter(e=>(Date.parse(e.savedAt||"")||0)>lastB).length:packs.length;
      if((!lastB&&packs.length>=3)||(lastB&&since>=5))add(25,"Back up your portfolio",lastB?plural(since,"evidence pack")+" added since your last backup.":"It’s only saved on this phone. Keep a copy in case it breaks or goes missing.","Back up now",()=>K().runNudge({action:{kind:"backup",label:"Back up now"}}));
    }
    /* Connected to a college: course notifications, until they've answered once. */
    if(window.eviaPush&&window.eviaPush.state()==="off"&&!window.eviaPush.asked())add(20,"Turn on course notifications","So you hear when your assessor signs something off or a review is due.","Turn on",pushOn);

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
  const GO='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  function show(opts){
    document.body.classList.remove("evia-epa");
    const k=K(),items=window.eviaTodo.list(),top=items.slice(0,3),name=k.firstName?k.firstName():"",again=!!(opts&&opts.again);
    const hello=again?"":["Morning","Afternoon","Evening"][new Date().getHours()<12?0:new Date().getHours()<18?1:2]+(name?" "+esc(name):"")+". ";
    if(!items.length){
      if(window.eviaMood)window.eviaMood("happy");
      k.say(hello+"You’re all caught up. Nice work.");
      k.say("Want to get ahead?");
      let a=null;try{a=window.eviaStats.compute().a}catch(_){}
      const q=a&&a.quickest;
      k.replies([q?{label:(q.started?"Add to ":"Start ")+q.name,primary:true,run:()=>openUnit(q)}:{label:"Go to My course",primary:true,run:leave(()=>nav("course"))},
        {label:"A Teach me lesson",run:leave(()=>nav("teach"))},
        {label:(window.eviaNvq&&window.eviaNvq.on())?"Knowledge tests":"EPA practice",run:()=>C().epa&&C().epa()}]);
      return;
    }
    k.say(again?(items.length===1?"Here’s what’s left.":"Here’s what’s left, most urgent first."):hello+(items.length===1?"You’ve got one thing to do.":items.length<=3?"You’ve got "+items.length+" things to do.":"You’ve got "+items.length+" things to do. Here are the 3 most urgent."));
    k.widget('<div class="td-list">'+top.map((x,i)=>'<button type="button" class="td-item'+(x.u>=85?" urgent":"")+'" data-i="'+i+'"><span class="td-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small><b>'+esc(x.label)+GO+'</b></span></button>').join("")+'</div>',el=>{
      el.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{el.querySelectorAll("button").forEach(x=>x.disabled=true);el.classList.add("td-used");top[+b.dataset.i].run()});
    });
  }
  window.eviaTodo={list,show};
})();
