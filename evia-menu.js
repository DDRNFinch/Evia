/* Evia7 menu: Evia as the learner's coach. Her job is to get evidence gathered for the course; learning hours come
   next, then progress and practice. Games and Rewards aren't here.
     focus()  the one thing she'd do now, evidence first: what the assessor asked for, the first unit, a review that's
              close, catching up when well behind, a weak write-up, learning hours slipping, then the next unit.
     menu()   four categories, each with four things to do.
   window.eviaMenu: focus(), menu(), open(category). */
(function(){
  const K=()=>window.eviaChatKit,C=()=>window.eviaCoachFlows||{};
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const hm=h=>window.eviaHM?window.eviaHM(h):Math.round(h*10)/10+"h";
  const plural=(n,w)=>n+" "+w+(n===1?"":"s");
  const listText=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
  const day=d=>new Date(d).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  const stats=()=>{try{return window.eviaStats.compute()}catch(_){return null}};
  const leave=f=>()=>{K().closeChat();setTimeout(f,100)};
  const openUnit=u=>K().openUnitFromChat(u);
  const term=()=>window.eviaTerm?window.eviaTerm().many:"KSBs";
  function aimPerWeek(){
    try{const en=window.eviaData.enrolment&&window.eviaData.enrolment(),p=window.eviaData.learner()||{},s=Date.parse((en&&en.start)||p.start||""),e=Date.parse((en&&en.end)||p.end||""),planned=Number(en&&en.plannedOtjHours);
      if(planned>0&&e>s)return Math.round(planned/((e-s)/(7*864e5))*10)/10}catch(_){}
    return 6;
  }

  /* ---------- Today's focus: one thing, evidence first ---------- */
  function focus(){
    const S=stats();if(!S)return null;
    const a=S.a,units=a.units,byName=n=>units.find(u=>u.name===n);
    /* 1. The assessor wants more on a unit. */
    const more=window.eviaMoreRequired?window.eviaMoreRequired():[];
    if(more.length){
      const name=more[0].unit,u=byName(name),codes=more.filter(x=>x.unit===name).map(x=>x.code);
      if(u)return {kicker:"Your assessor asked",text:"Your assessor would like a bit more on <strong>"+esc(name)+"</strong>: "+esc(codes.slice(0,4).join(", "))+(codes.length>4?" and more":"")+". Catch up takes you straight through them.",
        label:"Catch up on "+name,run:()=>C().openUnitAt?C().openUnitAt(u,"#cu-start","click"):openUnit(u)};
    }
    /* 2. No evidence yet. */
    if(!units.some(u=>u.started)&&a.quickest)return {kicker:"Let’s get started",text:"Your first piece of evidence is the big one. <strong>"+esc(a.quickest.name)+"</strong> is a good place to start: any job from site this week can count.",
      label:"Start "+a.quickest.name,run:()=>openUnit(a.quickest)};
    /* 3. A review in the next week with things to get ready. */
    const rd=window.eviaReviewDue&&window.eviaReviewDue(),left=window.eviaReviewPrepCount?window.eviaReviewPrepCount():0;
    if(rd&&rd.days<=7&&rd.days>=-14&&left)return {kicker:rd.days<0?"Review overdue":"Review coming up",text:(rd.days<0?"Your progress review was due on <strong>"+day(rd.due)+"</strong>.":rd.days===0?"Your progress review is <strong>today</strong>.":"Your progress review is in <strong>"+plural(rd.days,"day")+"</strong>.")+" There "+(left===1?"is 1 thing":"are "+left+" things")+" to get ready, one at a time.",
      label:"Get ready for my review",run:()=>{K().userSays("Get ready for my review");C().prepare&&C().prepare()}};
    /* 4. Well behind: the unit that ticks off the most. */
    if(a.timePct!=null&&a.timePct-a.ksbPct>20&&a.quickest)return {kicker:"Catch up",text:"You’re "+a.timePct+"% through your course with "+a.ksbPct+"% of your "+esc(term())+" evidenced. <strong>"+esc(a.quickest.name)+"</strong> covers "+plural(a.quickest.missing.length,"KSB")+" you still need: the biggest step you can take.",
      label:(a.quickest.started?"Add to ":"Start ")+a.quickest.name,run:()=>openUnit(a.quickest)};
    /* 5. A weak write-up, while it's fresh. */
    const weak=(S.checks||[]).map(c=>({c,p:c.terms.length?c.covered.length/c.terms.length:1})).filter(x=>x.p<.5).sort((x,y)=>x.p-y.p)[0];
    if(weak){const u=weak.c.u;return {kicker:"Make it stronger",text:"Your <strong>"+esc(u.name)+"</strong> write-up covers "+weak.c.covered.length+" of "+weak.c.terms.length+" things your assessor looks for."+(weak.c.missing&&weak.c.missing.length?" Add "+esc(listText(weak.c.missing.slice(0,3)))+".":""),
      label:"Improve "+u.name,run:()=>C().openUnitAt?C().openUnitAt(u,"#write","focus"):openUnit(u)}}
    /* 6. Learning hours slipping, late in the week. */
    const aim=aimPerWeek(),wd=new Date().getDay();
    if((wd===0||wd>=4)&&S.otjWeek<aim/2)return {kicker:"Learning hours",text:"You’ve logged <strong>"+hm(S.otjWeek)+"</strong> this week and the aim is about "+hm(aim)+". Training, toolbox talks and research all count.",
      label:"Log my hours",run:()=>{K().userSays("Log my hours");C().hours&&C().hours()}};
    /* 7. The unit that ticks off the most. */
    if(a.quickest)return {kicker:"Up next",text:"<strong>"+esc(a.quickest.name)+"</strong> covers "+plural(a.quickest.missing.length,"KSB")+" you still need, more than any other unit.",
      label:"Open "+a.quickest.name,run:()=>openUnit(a.quickest)};
    /* 8. Everything has evidence. */
    const w2=(S.checks||[]).map(c=>({c,p:c.terms.length?c.covered.length/c.terms.length:1})).sort((x,y)=>x.p-y.p)[0];
    return {kicker:"All evidenced",text:"Every "+(window.eviaTerm?window.eviaTerm().one:"KSB")+" has evidence. Brilliant. Now make the weakest unit stronger"+(w2?": <strong>"+esc(w2.c.u.name)+"</strong>":"")+".",
      label:w2?"Improve "+w2.c.u.name:"Go to My course",run:w2?()=>C().openUnitAt?C().openUnitAt(w2.c.u,"#write","focus"):openUnit(w2.c.u):leave(()=>nav("course"))};
  }

  /* ---------- Short answers from the learner's own records ---------- */
  function myHours(){
    const S=stats();if(!S)return;const aim=aimPerWeek();
    K().say("This week you’ve logged <strong>"+hm(S.otjWeek)+"</strong>"+(S.otjWeek>=aim?", which meets the "+hm(aim)+" a week to aim for. Nice.":", and the aim is about <strong>"+hm(aim)+"</strong> a week.")+" That’s "+hm(S.otjMonth)+" this month and "+hm(S.otjTotal)+" in total.");
    K().replies([{label:"Log hours",primary:S.otjWeek<aim,run:()=>C().hours&&C().hours()},{label:"See my learning logs",run:leave(()=>window.eviaOpenLearningLogs&&window.eviaOpenLearningLogs())},{label:"Something else",run:menu}]);
  }
  function hoursCount(){
    K().say("Learning hours are learning in your paid hours that isn’t your normal work: college days, training courses, toolbox talks, research, shadowing someone, and Teach me lessons. Most full-time apprentices need at least 6 hours a week. Your college sets your exact hours.");
    K().replies([{label:"Log hours",primary:true,run:()=>C().hours&&C().hours()},{label:"Something else",run:menu}]);
  }
  function myPace(){
    const S=stats();if(!S)return;const a=S.a;
    if(a.timePct==null){K().say("You’ve got evidence for <strong>"+a.ksbPct+"%</strong> of your "+esc(term())+". Add your course dates in your profile and I can tell you if that’s on track.");return menu()}
    const gap=a.timePct-a.ksbPct;
    K().say("You’re <strong>"+a.timePct+"%</strong> of the way through your course and <strong>"+a.ksbPct+"%</strong> of your "+esc(term())+(a.signoff?" are signed off":" have evidence")+". "+
      (gap<=0?"That’s ahead of where you need to be. Brilliant.":gap<=10?"That’s about on track.":gap<=25?"That’s a bit behind, but very catchable.":"That’s behind, so evidence is the thing to focus on."));
    if(gap>10&&a.quickest)K().say("The quickest win is <strong>"+esc(a.quickest.name)+"</strong>: it covers "+plural(a.quickest.missing.length,"KSB")+" you’re still missing.");
    K().replies([gap>10&&a.quickest?{label:"Open "+a.quickest.name,primary:true,run:()=>openUnit(a.quickest)}:null,{label:"Open My progress",run:leave(()=>nav("learning"))},{label:"Something else",run:menu}].filter(Boolean));
  }

  /* ---------- Four categories, four things each ---------- */
  const SVG=p=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
  const ICON={
    evidence:'<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z"/><circle cx="12" cy="13" r="3.5"/>',
    hours:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    progress:'<path d="M4 19.5h16"/><path d="M7 16v-4M12 16V8M17 16v-6"/>',
    practise:'<path d="M3 9.5 12 5l9 4.5-9 4.5Z"/><path d="M7 11.5V16c1.5 1.5 3 2 5 2s3.5-.5 5-2v-4.5"/>'
  };
  function categories(){
    const S=stats(),a=S&&S.a,more=window.eviaMoreRequired?window.eviaMoreRequired():[],nvq=!!(window.eviaNvq&&window.eviaNvq.on());
    return [
      {id:"evidence",label:"Evidence",line:"Evidence is what gets you through. What do you want to do?",items:[
        a&&a.quickest?{label:(a.quickest.started?"Add to ":"Start ")+a.quickest.name,run:()=>openUnit(a.quickest)}:{label:"Go to My course",run:leave(()=>nav("course"))},
        {label:"Check my evidence",run:()=>C().evidenceCheck&&C().evidenceCheck()},
        {label:more.length?"What my assessor wants":"Which KSBs am I missing?",run:()=>window.eviaBrain&&window.eviaBrain.answer("which ksbs am i missing",true)},
        {label:"How to make strong evidence",run:leave(()=>window.eviaStrength&&window.eviaStrength.guide())}]},
      {id:"hours",label:"Learning hours",line:"Learning hours are checked at every review. What do you need?",items:[
        {label:"Log hours",run:()=>C().hours&&C().hours()},
        {label:"How many have I done?",run:myHours},
        {label:"What counts?",run:hoursCount},
        {label:"My learning logs",run:leave(()=>window.eviaOpenLearningLogs&&window.eviaOpenLearningLogs())}]},
      {id:"progress",label:"My progress",line:"Here’s what I can show you.",items:[
        {label:"Am I on track?",run:myPace},
        {label:"Get ready for my review",run:()=>C().prepare&&C().prepare()},
        {label:"My targets",run:()=>C().targets&&C().targets()},
        {label:"Every area at a glance",run:()=>C().quickReview&&C().quickReview()}]},
      {id:"practise",label:"Practise",line:"Practice helps, but evidence comes first. Pick one:",items:[
        {label:nvq?"Knowledge tests":"EPA practice",run:()=>C().epa&&C().epa()},
        {label:"Rate my skills",run:()=>C().confidence&&C().confidence()},
        {label:"A Teach me lesson",run:leave(()=>nav("teach"))},
        {label:"Site calculators",run:()=>{K().say("Which one do you need?");window.eviaBrain&&window.eviaBrain.calculators()}}]}
    ];
  }
  /* The four categories as tiles in the chat. */
  function menu(opts){
    document.body.classList.remove("evia-epa");
    if(!(opts&&opts.quiet))K().say(["What next?","What shall we work on?","Anything else?"][Math.floor(Math.random()*3)]);
    K().widget('<div class="mn-grid" role="group" aria-label="What Evia can help with">'+categories().map((c,i)=>'<button type="button" class="mn-tile'+(i===0?" core":"")+'" data-cat="'+c.id+'">'+SVG(ICON[c.id])+'<span>'+esc(c.label)+'</span></button>').join("")+'</div>',el=>{
      el.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{el.remove();open(b.dataset.cat)});
    });
  }
  function open(id){
    const c=categories().find(x=>x.id===id);if(!c)return;
    K().userSays(c.label);K().say(c.line);
    K().replies(c.items.map((it,i)=>({label:it.label,primary:i===0&&id==="evidence",run:it.run})).concat([{label:"Back",back:true,run:()=>menu({quiet:true})}]));
  }
  window.eviaMenu={focus,menu,open};
})();
