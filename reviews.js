/* Evia7 reviews and targets.
   - Targets measure themselves from what Evia already records (OTJ hours, units, KSBs, tests, skills, scenarios…).
   - "My targets" shows them with progress; if there are none, Evia sets some.
   - A full review is a click-through of short sections; finishing it replaces the targets with new ones. */
(function(){
  const TARGETS="evia7-review-targets",REVIEWS="evia7-progress-reviews";
  const DAY=864e5;
  const escHtml=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const ukDate=t=>new Date(t).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  const plural=(n,w)=>n+" "+w+(n===1?"":"s");
  const clamp=v=>Math.max(0,Math.min(1,v));
  const stats=()=>{try{return window.eviaStats.compute()}catch(_){return null}};
  const skillMap=()=>{const m=new Map();readJson("evia7-confidence",[]).filter(x=>x&&x.course===course&&Array.isArray(x.scores)).forEach(s=>s.scores.forEach(sc=>m.set(sc.area,sc.score)));return m};
  const bestTestSince=(types,since,full)=>readJson("evia7-test-results",[]).filter(t=>t&&t.course===course&&types.includes(t.type)&&Date.parse(t.savedAt)>=since&&(!full||t.full||t.total>=20)).reduce((n,t)=>Math.max(n,typeof t.pct==="number"?t.pct:Math.round((t.score||0)/(t.total||1)*100)),-1);
  const startedUnits=S=>S.a.units.filter(u=>u.started).length;

  /* ---------- What each kind of target measures ---------- */
  const KINDS={
    otj:{measure:(t,S)=>S.otjTotal-t.baseline,unit:"hours",action:["Log hours","learning"]},
    units:{measure:(t,S)=>startedUnits(S)-t.baseline,unit:"units",action:["Capture evidence","course"]},
    ksb:{measure:(t,S)=>S.a.met-t.baseline,unit:"KSBs",action:["Capture evidence","course"]},
    epa:{measure:t=>bestTestSince(["epa"],t.createdAt,true),pct:true,action:["Take a full mock","epa-full"]},
    quiz:{measure:t=>bestTestSince(["epa"],t.createdAt,false)>=0?1:0,action:["Take a quiz","epa"]},
    maths:{measure:t=>bestTestSince(["maths"],t.createdAt),pct:true,action:["Maths test","maths"]},
    english:{measure:t=>bestTestSince(["english"],t.createdAt),pct:true,action:["English test","english"]},
    skill:{measure:t=>skillMap().get(t.param)||t.baseline,action:["Rate my skills","confidence"]},
    quality:{measure:(t,S)=>S.coverage||0,pct:true,action:["Go to Course","course"]},
    scenarios:{measure:t=>{const p=window.eviaScenarios&&window.eviaScenarios.progress().topics.find(x=>x.id===t.param);return p?p.done:0},action:["Open scenarios","scenarios"]},
    streak:{measure:(t,S)=>S.streak,unit:"weeks",action:["Add evidence","course"]},
    rate:{measure:(t,S)=>S.confidence.sessions?1:0,action:["Rate my skills","confidence"]}
  };
  function progress(t,S){
    if(t.done)return {pct:1,value:t.target,text:"Done"};
    const k=KINDS[t.kind];if(!k||!S)return {pct:0,value:0,text:""};
    let v=k.measure(t,S),pct;
    if(t.kind==="skill")pct=t.target>t.baseline?(v-t.baseline)/(t.target-t.baseline):v>=t.target?1:0;
    else pct=t.target?Math.max(0,v)/t.target:0;
    pct=clamp(pct);
    const text=k.pct?(v<0?"Not tried since this target was set · aim "+t.target+"%":"Best since set: "+v+"% · aim "+t.target+"%"):t.kind==="skill"?["","Need training","Basics","Confident","Mastered"][v]+" · aim Confident":t.kind==="scenarios"?Math.max(0,v)+" of "+t.target+" done":t.kind==="quiz"||t.kind==="rate"?(pct>=1?"Done":"Not done yet"):(Math.round(Math.max(0,v)*10)/10)+" of "+t.target+" "+(k.unit||"");
    return {pct,value:v,text};
  }

  /* ---------- Choosing targets from Evia's stats ---------- */
  function suggest(S){
    const out=[],now=Date.now(),due=w=>new Date(now+w*7*DAY).toISOString().slice(0,10);
    const add=(kind,title,why,target,baseline,weeks,param)=>out.push({id:"t-"+now+"-"+out.length,course,kind,title,why,target,baseline:baseline||0,param:param||null,due:due(weeks),createdAt:now,done:false});
    const a=S.a,gap=a.timePct==null?0:a.timePct-a.ksbPct;
    if(S.unitsLeft>0){
      const n=gap>10&&S.unitsLeft>1?2:1,next=a.quickest;
      add("units","Capture evidence for "+plural(n,"new unit"),(gap>10?"You’re a little behind on evidence. ":"")+(next?"Start with "+next.name+": it covers "+plural(next.missing.length,"KSB")+" you still need.":"Pick a unit you haven’t started yet."),n,startedUnits(S),n===2?6:4);
    }else if(a.ksbPct<100){
      const n=Math.min(6,a.total-a.met);add("ksb","Get evidence for "+plural(n,"more KSB"),"Every unit has evidence; now fill the KSB gaps. Ask Evia “Which KSBs am I missing?”",n,a.met,6);
    }
    if(S.otjMonth<8)add("otj","Log 10 off-the-job hours","You’ve logged "+(Math.round(S.otjMonth*10)/10)+" hours this month. Training, toolbox talks and research all count.",10,S.otjTotal,6);
    const epaBest=bestTestSince(["epa"],0,true);
    if((window.eviaNvq&&window.eviaNvq.on())){} /* NVQs have no end-point assessment */
    else if(a.timePct!=null&&a.timePct>=60)add("epa","Score 70% or more on a full EPA mock",epaBest>=0?"Your best full mock so far is "+epaBest+"%.":"You haven’t tried a full EPA mock yet, and your end-point assessment is getting closer.",70,0,4);
    else if(!S.tests.some(t=>t.type==="epa"))add("quiz","Try an EPA quick quiz","It only takes a few minutes and shows what the end-point test is like.",1,0,4);
    const skills=S.confidence.scores.filter(x=>x.score<=2).sort((x,y)=>x.score-y.score);
    if(skills.length){
      const sk=skills[0],task=window.eviaPractice&&window.eviaPractice.suggestTasks(1)[0];
      add("skill","Move "+sk.area+" up to Confident","You rated it “"+["Need more training","Know the basics"][sk.score-1]+"”."+(task?" The college task “"+task.task.title+"” practises it.":" Ask to get involved when the job comes up."),3,sk.score,8,sk.area);
    }else if(!S.confidence.sessions)add("rate","Rate your practical skills","A confidence check shows you and your tutor what to practise.",1,0,2);
    if(S.maths){const m=bestTestSince(["maths"],0);if(m<70)add("maths","Score 70% or more in a maths test",m>=0?"Your best so far is "+m+"%.":"No maths test taken yet.",70,0,6)}
    if(S.english){const e=bestTestSince(["english"],0);if(e<70)add("english","Score 70% or more in an English test",e>=0?"Your best so far is "+e+"%.":"No English test taken yet.",70,0,6)}
    if(S.coverage!=null&&S.coverage<70)add("quality","Get your write-ups covering 70% of key points","They cover "+S.coverage+"% now. Use the “Things to mention” list on each unit.",70,0,6);
    const topic=window.eviaScenarios&&window.eviaScenarios.progress().topics.find(t=>t.done<t.total);
    if(topic)add("scenarios","Complete the "+topic.title+" scenarios","Short real-life situations about what you’d do. About 5 minutes.",topic.total,0,4,topic.id);
    if(S.streak<4)add("streak","Stay active 4 weeks in a row","Add evidence or log learning each week. You’re on "+plural(S.streak,"week")+".",4,0,5);
    return out.slice(0,5);
  }

  /* ---------- Stored targets ---------- */
  const all=()=>readJson(TARGETS,[]);
  const mine=()=>all().filter(t=>t.course===course);
  function setTargets(list){write(TARGETS,all().filter(t=>t.course!==course).concat(list))}
  function ensureTargets(){
    let list=mine();
    if(list.length)return {list,created:false};
    const S=stats();if(!S)return {list:[],created:false};
    list=suggest(S);setTargets(list);return {list,created:true};
  }
  /* Marks targets done as they're reached, and celebrates each one once. */
  function check(celebrate){
    const S=stats();if(!S)return;
    const list=mine();let changed=false;const fresh=[];
    list.forEach(t=>{
      if(t.done||!KINDS[t.kind])return;
      if(progress(t,S).pct>=1){t.done=true;t.doneAt=Date.now();changed=true;fresh.push(t)}
    });
    if(changed)setTargets(list);
    if(celebrate&&fresh.length){
      if(typeof showEvidenceToast==="function")showEvidenceToast("Target complete: "+fresh[0].title);
      if(window.eviaMood)window.eviaMood("happy");
    }
  }
  const statusOf=t=>t.done?"done":new Date(t.due+"T23:59:59").getTime()<Date.now()?"overdue":"active";

  /* ---------- Targets card (Progress page and chat) ---------- */
  function cardHtml(opts={}){
    const list=mine(),S=stats();
    if(!list.length)return opts.chat?"":'<section class="ui-card pg-card" id="pg-targets"><header class="pg-head"><span class="pg-icon">'+ICON+'</span><h3>Targets</h3></header><p class="pg-note">No targets yet. Ask Evia for “My targets” and she’ll set some.</p><button type="button" class="pg-action" data-target-new>Set my targets</button></section>';
    const done=list.filter(t=>t.done).length;
    const rows=list.map((t,i)=>{
      const p=progress(t,S),st=statusOf(t),act=KINDS[t.kind].action;
      return '<div class="tg-row '+st+'">'+
        '<div class="pg-row-top"><span><strong>'+escHtml(t.title)+'</strong></span><em class="tg-chip '+st+'">'+(st==="done"?"Done ✓":st==="overdue"?"Overdue":"Due "+ukDate(t.due+"T12:00:00"))+'</em></div>'+
        (opts.chat?"":'<small class="tg-why">'+escHtml(t.why)+'</small>')+
        '<span class="pg-bar'+(st==="done"?" good":st==="overdue"?" low":"")+'"><i style="--to:'+Math.round(p.pct*100)+'%;--d:'+i*90+'ms"></i></span>'+
        '<div class="tg-foot"><small>'+escHtml(p.text)+'</small>'+(st==="done"?"":'<span class="tg-acts">'+'<button type="button" class="tg-btn primary-lite" data-target-act="'+t.id+'">'+act[0]+'</button></span>')+'</div>'+
      '</div>';
    }).join("");
    const from=list[0]&&list[0].reviewDate?"From your review on "+ukDate(list[0].reviewDate):"Set by Evia";
    return '<section class="ui-card pg-card tg-card" id="pg-targets"><header class="pg-head"><span class="pg-icon">'+ICON+'</span><h3>Targets</h3><span class="pg-meta">'+done+' of '+list.length+' done</span></header><small class="tg-from">'+escHtml(from)+'</small>'+rows+'</section>';
  }
  const ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>';
  function runAction(id){
    const t=mine().find(x=>x.id===id);if(!t)return;
    const a=KINDS[t.kind].action[1],close=()=>{const x=document.getElementById("x");if(x)x.click();else{const r=document.getElementById("modal-root");if(r)r.innerHTML=""}};
    close();
    setTimeout(()=>{
      if(a==="learning"||a==="course")nav(a);
      else if(a==="confidence")window.eviaPractice&&window.eviaPractice.openConfidence();
      else if(a==="scenarios")window.eviaScenarios&&window.eviaScenarios.openTopics();
      else if(window.eviaStartTest)window.eviaStartTest(a==="epa-full"?"epa":a,a==="epa-full"?20:5,KINDS[t.kind].action[0]);
    },80);
  }
  /* Wires up the buttons in a targets card; redraw is called after new targets are set. */
  function bind(root,redraw){
    if(!root)return;
    root.querySelectorAll("[data-target-act]").forEach(b=>b.onclick=()=>runAction(b.dataset.targetAct));
    root.querySelectorAll("[data-target-new]").forEach(b=>b.onclick=()=>{ensureTargets();redraw&&redraw()});
  }

  /* ---------- The click-through review ---------- */
  function snapshot(S){
    const a=S.a,gap=a.timePct==null?null:a.timePct-a.ksbPct;
    const checks=S.checks.slice().sort((x,y)=>(y.covered.length/y.terms.length)-(x.covered.length/x.terms.length));
    const conf=S.confidence.scores,confPct=conf.length?Math.round(conf.reduce((n,x)=>n+x.score,0)/conf.length/4*100):null;
    const hist=readJson("evia7-confidence",[]).filter(x=>x&&x.course===course&&Array.isArray(x.scores)&&x.scores.length);
    const prevConf=hist.length>1?hist[hist.length-2].scores:null,confPrevPct=prevConf?Math.round(prevConf.reduce((n,x)=>n+x.score,0)/prevConf.length/4*100):null;
    const lastFull=readJson("evia7-test-results",[]).filter(t=>t&&t.course===course&&t.type==="epa"&&(t.full||t.total>=20)).pop();
    const task=window.eviaPractice&&window.eviaPractice.suggestTasks(1)[0];
    const prevReview=readJson(REVIEWS,[]).filter(r=>r.course===course).pop();
    const prevTargets=mine();
    return {
      ksbPct:a.ksbPct,met:a.met,total:a.total,timePct:a.timePct,verdict:gap==null?null:gap>10?"behind":gap<-5?"ahead":"ontrack",weeksPerUnit:S.weeksPerUnit!=null?Math.max(1,Math.floor(S.weeksPerUnit)):null,weeksLeft:S.weeksLeft,
      unitsStarted:startedUnits(S),unitsTotal:a.units.length,packs:S.allPacks,coverage:S.coverage,avgPhotos:S.avgPhotos!=null?Math.round(S.avgPhotos*10)/10:null,
      strongest:checks[0]?checks[0].u.name:null,weakest:checks.length>1?checks[checks.length-1].u.name:null,weakestMissing:checks.length>1?checks[checks.length-1].missing.slice(0,3):[],
      otjTotal:Math.round(S.otjTotal*10)/10,otjMonth:Math.round(S.otjMonth*10)/10,streak:S.streak,longest:S.longest,lastUpload:S.lastUpload,
      tests:S.tests.map(t=>({name:t.name,latest:t.latest?(typeof t.latest.pct==="number"?t.latest.pct:Math.round((t.latest.score||0)/(t.latest.total||1)*100)):0,best:t.best})),missed:lastFull&&Array.isArray(lastFull.missed)?lastFull.missed.slice(0,8):[],
      confPct,confPrevPct,lowSkills:conf.filter(x=>x.score<=2).map(x=>x.area),highSkills:conf.filter(x=>x.score>=3).map(x=>x.area),task:task?task.task.title:null,
      scen:window.eviaScenarios?window.eviaScenarios.progress().topics:[],
      prevReviewDate:prevReview?prevReview.date:null,prevTargets:prevTargets.length?{done:prevTargets.filter(t=>t.done).length,total:prevTargets.length}:null
    };
  }
  const bar=(pct,cls,d)=>'<span class="pg-bar'+(cls?" "+cls:"")+'"><i style="--to:'+Math.round(Math.max(0,Math.min(100,pct)))+'%;--d:'+(d||0)+'ms"></i></span>';
  const row=(l,v,b)=>'<div class="pg-row"><div class="pg-row-top"><span>'+l+'</span><strong>'+v+'</strong></div>'+b+'</div>';
  const big=(n,l)=>'<div class="rv-big"><b>'+n+'</b><small>'+l+'</small></div>';
  const say=t=>'<p class="rv-evia"><span class="rv-evia-face" aria-hidden="true"><i></i><i></i></span><span>'+t+'</span></p>';
  const chips=(list,cls)=>list.length?'<div class="rv-chips">'+list.map(x=>'<span class="pr-chip '+(cls||"")+'">'+escHtml(x)+'</span>').join("")+'</div>':"";
  function slides(r,readOnly){
    const s=r.snapshot,v={behind:["A little behind","low"],ontrack:["On track","good"],ahead:["Ahead of schedule","good"]}[s.verdict];
    const out=[];
    out.push({title:"Overview",body:
      '<div class="rv-hero"><div class="rv-ring" style="--p:'+s.ksbPct+'"><b>'+s.ksbPct+'%</b><small>of KSBs</small></div><div class="rv-hero-side">'+
        (s.timePct!=null?row("Course time",s.timePct+"%",bar(s.timePct,"muted"))+row("Evidence",s.ksbPct+"%",bar(s.ksbPct,"",150)):"")+(v?'<span class="pg-verdict '+(v[1]==="good"?"ontrack":"behind")+'">'+v[0]+'</span>':"")+'</div></div>'+
      say(s.met+" of "+s.total+" KSBs have evidence."+(s.weeksPerUnit?" You’ve got about "+plural(s.weeksLeft,"week")+" left, roughly "+plural(s.weeksPerUnit,"week")+" per unit still to start.":"")+(s.prevReviewDate?" Your last review was on "+ukDate(s.prevReviewDate)+".":""))});
    out.push({title:"Evidence",body:
      '<div class="rv-bigs">'+big(s.unitsStarted+"/"+s.unitsTotal,"units started")+big(s.packs,"evidence packs")+big(s.avgPhotos==null?"–":s.avgPhotos,"photos per pack")+'</div>'+
      (s.coverage!=null?row("Write-ups cover the key points",s.coverage+"%",bar(s.coverage,s.coverage>=70?"good":s.coverage<40?"low":"")):"")+
      say((s.strongest?"Your strongest write-up is <strong>"+escHtml(s.strongest)+"</strong>. ":"")+(s.weakest?"<strong>"+escHtml(s.weakest)+"</strong> needs the most work"+(s.weakestMissing.length?": mention "+escHtml(s.weakestMissing.join(", "))+" next time.":"."):s.packs?"":"Capture your first unit and Evia will start checking your write-ups."))});
    out.push({title:"Learning and activity",body:
      '<div class="rv-bigs">'+big(s.otjTotal,"OTJ hours")+big(s.otjMonth,"this month")+big(s.streak,"week streak")+'</div>'+
      say((s.lastUpload?"Your last upload was "+escHtml(window.eviaStats.ago(s.lastUpload).toLowerCase())+". ":"")+(s.longest>1?"Your longest streak is "+plural(s.longest,"week")+". ":"")+(s.otjMonth<8?"Try to log a bit more off-the-job learning each month.":"Good off-the-job learning this month."))});
    out.push({title:"Tests",body:
      (s.tests.length?s.tests.map((t,i)=>row(escHtml(t.name),t.latest+"% <small>best "+t.best+"%</small>",bar(t.latest,t.latest>=70?"good":t.latest<50?"low":"",i*100))).join(""):'<p class="pg-note">No tests taken yet.</p>')+
      (s.missed.length?'<p class="rv-label">Worth revising from your last full mock</p>'+chips(s.missed):"")+
      say(s.tests.length?(s.tests.some(t=>t.latest<70)?"Keep practising the tests below 70%: little and often works best.":"Strong results. Keep them ticking over."):"A quick EPA quiz takes about 3 minutes. It’s a good place to start.")});
    out.push({title:"Your skills",body:
      (s.confPct!=null?'<div class="rv-bigs">'+big(s.confPct+"%","course confidence")+(s.confPrevPct!=null?big((s.confPct-s.confPrevPct>0?"+":"")+(s.confPct-s.confPrevPct),"since last check"):"")+'</div>':'<p class="pg-note">No confidence check yet.</p>')+
      (s.lowSkills.length?'<p class="rv-label">Needs more training</p>'+chips(s.lowSkills,"low"):"")+
      say(s.task?"A good college task for this: <strong>"+escHtml(s.task)+"</strong>. Ask your tutor to set it up.":s.lowSkills.length?"Tell your tutor you’d like more practice on these.":"Rate your skills regularly so your tutor knows where to focus.")});
    if(s.scen&&s.scen.length)out.push({title:"Staying safe and respected",body:
      s.scen.map((t,i)=>row(escHtml(t.title),t.done+" of "+t.total,bar(t.total?t.done/t.total*100:0,t.done===t.total?"good":"",i*90))).join("")+
      say(s.scen.every(t=>t.done===t.total)?"You’ve completed every real-life scenario. Brilliant.":"These cover safeguarding, Prevent, British values and equality. Each takes about 5 minutes.")});
    const c=r.reflection||{},q=r.ksbFollowUp;
    out.push({title:"Your comments",body:
      '<label class="rv-q"><span>Is anything affecting your wellbeing, learning or work that you’d like your tutor to know? <small>Optional</small></span>'+(readOnly?'<p class="rv-a">'+escHtml(c.wellbeing||"No comment.")+'</p>':'<textarea data-reflect="wellbeing" rows="3">'+escHtml(c.wellbeing||"")+'</textarea>')+'</label>'+
      '<label class="rv-q"><span>How are you finding your apprenticeship? <small>Optional</small></span>'+(readOnly?'<p class="rv-a">'+escHtml(c.learnerFeedback||"No comment.")+'</p>':'<textarea data-reflect="learnerFeedback" rows="3">'+escHtml(c.learnerFeedback||"")+'</textarea>')+'</label>'+
      (q?'<label class="rv-q"><span>'+escHtml(q.question)+' <small>Optional</small></span>'+(readOnly?'<p class="rv-a">'+escHtml(c.ksbFollowUp||"No comment.")+'</p>':'<textarea data-reflect="ksbFollowUp" rows="3">'+escHtml(c.ksbFollowUp||"")+'</textarea>')+'</label>':"")});
    out.push({title:readOnly?"Targets set":"Your new targets",body:
      (!readOnly&&s.prevTargets?'<p class="pg-note">These replace your current targets ('+s.prevTargets.done+' of '+s.prevTargets.total+' done).</p>':"")+
      '<ol class="rv-targets">'+r.targets.map(t=>'<li><strong>'+escHtml(t.title)+'</strong><small>'+escHtml(t.why)+'</small><em>Due '+ukDate(t.due+"T12:00:00")+'</em></li>').join("")+'</ol>'+
      say(readOnly?"You can see how you’re getting on with your current targets in My targets.":"Tap <strong>Save review</strong> and these become your targets. I’ll track them for you.")});
    return out;
  }
  function openReview(r,readOnly){
    const list=slides(r,readOnly);let i=0;
    const root=document.getElementById("modal-root");
    root.innerHTML='<div class="overlay"><section class="sheet pr-sheet rv-sheet" role="dialog" aria-modal="true" aria-labelledby="rv-title"><div class="sheet-head"><div><div class="chat-kicker" id="rv-kicker"></div><h2 id="rv-title" tabindex="-1"></h2></div><button class="close" id="rv-close" type="button" aria-label="Close">×</button></div>'+
      '<div class="rv-dots" id="rv-dots">'+list.map((s,n)=>'<button type="button" data-rv-go="'+n+'" aria-label="'+escHtml(s.title)+'"></button>').join("")+'</div>'+
      '<div class="rv-body pg-animate" id="rv-body"></div>'+
      '<div class="rv-nav"><button type="button" class="secondary" id="rv-back">Back</button><button type="button" class="primary" id="rv-next">Next</button></div></section></div>';
    const body=root.querySelector("#rv-body"),next=root.querySelector("#rv-next"),back=root.querySelector("#rv-back");
    const keepComments=()=>{if(readOnly)return;body.querySelectorAll("[data-reflect]").forEach(t=>{r.reflection=r.reflection||{};r.reflection[t.dataset.reflect]=t.value.trim()})};
    const show=n=>{
      keepComments();i=Math.max(0,Math.min(list.length-1,n));
      root.querySelector("#rv-kicker").textContent=(readOnly?"REVIEW · "+ukDate(r.date).toUpperCase():"PROGRESS REVIEW")+" · "+(i+1)+" OF "+list.length;
      root.querySelector("#rv-title").textContent=list[i].title;
      body.innerHTML='<div class="pg-card rv-slide">'+list[i].body+'</div>';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{const c=body.querySelector(".pg-card");if(c)c.classList.add("pg-in")}));
      root.querySelectorAll("[data-rv-go]").forEach((d,n)=>d.classList.toggle("on",n===i));
      back.style.visibility=i?"visible":"hidden";
      const last=i===list.length-1;
      next.textContent=last?(readOnly?"Download PDF":"Save review"):"Next";
      root.querySelector(".rv-sheet").scrollTop=0;
    };
    root.querySelector("#rv-close").onclick=()=>{root.innerHTML=""};
    back.onclick=()=>show(i-1);
    root.querySelectorAll("[data-rv-go]").forEach(d=>d.onclick=()=>show(+d.dataset.rvGo));
    next.onclick=()=>{
      if(i<list.length-1)return show(i+1);
      if(readOnly){if(window.eviaDownloadReviewPdf)window.eviaDownloadReviewPdf(r);return}
      keepComments();save(r);root.innerHTML="";
      if(typeof showEvidenceToast==="function")showEvidenceToast("Review saved. Your new targets are ready.");
      if(window.eviaMood)window.eviaMood("happy");
      if(typeof screen!=="undefined"&&(screen==="progress"||screen==="home"))render();
    };
    show(0);
  }
  function save(r){
    const reviews=readJson(REVIEWS,[]);reviews.push(r);write(REVIEWS,reviews.slice(-30));
    setTargets(r.targets.map(t=>Object.assign({},t,{reviewId:r.id,reviewDate:r.date})));
  }
  function startReview(){
    const S=stats();if(!S)return;
    const base=window.eviaBuildReviewRecord?window.eviaBuildReviewRecord():{course,date:new Date().toISOString()};
    const targets=suggest(S);
    const r=Object.assign(base,{id:"review-"+Date.now(),format:2,snapshot:snapshot(S),targets:targets.map(t=>Object.assign({},t,{reason:t.why,deadline:t.due})),reflection:{}});
    openReview(r,false);
  }
  /* Opening a saved review: new ones use the click-through, older ones the original screen. */
  function showReview(id){
    const r=readJson(REVIEWS,[]).find(x=>x.id===id);if(!r)return;
    if(r.format===2)openReview(r,true);else if(window.eviaOpenLegacyReview)window.eviaOpenLegacyReview(r);
  }

  window.eviaTargets={ensure:ensureTargets,mine,progress,cardHtml,bind,check,stats};
  window.eviaStartReview=startReview;
  window.eviaShowReview=showReview;
  window.eviaCheckTargets=()=>check(true);
})();
