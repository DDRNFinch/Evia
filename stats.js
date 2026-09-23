/* Evia7 "My stats": activity, streaks, pace, quality, tests, confidence and achievements, plus the daily nudge Evia
   chooses. Everything is worked out from data already on the device; nothing leaves the phone. */
(function(){
  const PPE_UNIT="Personal protective equipment";
  const EARNED_KEY="evia7-achievements";
  const DAY=864e5,WEEK=7*DAY;
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const entryTime=e=>{const t=Date.parse(e.savedAt||"");if(!isNaN(t))return t;const m=String(e.d||"").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);return m?new Date(+m[3],m[2]-1,+m[1]).getTime():0};
  const weekStart=t=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()};
  const monthStart=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1).getTime()};
  const photoCount=e=>Array.isArray(e.photoIds)?e.photoIds.length:Number.isFinite(Number(e.photoCount))?Number(e.photoCount):Array.isArray(e.p)?e.p.length:0;
  const testPct=t=>typeof t.pct==="number"?t.pct:(t.total?Math.round((t.score||0)/t.total*100):0);
  const TEST_NAMES={maths:"Maths",english:"English",epa:"EPA mock",discussion:"Professional discussion"};

  function compute(){
    const coach=window.eviaCoach,a=coach.analyse(),now=Date.now();
    const entries=a.entries,unitEntries=entries.filter(e=>e.u!==PPE_UNIT);
    /* Activity: any evidence, off-the-job entry or supporting file counts towards a week. */
    const supporting=(()=>{try{return supportingMeta().filter(x=>x.course===course)}catch(_){return[]}})();
    const times=[...entries.map(entryTime),...hours.map(x=>Number(x.createdAt)||0),...supporting.map(x=>Date.parse(x.addedAt)||0)].filter(t=>t>0);
    const weeks=new Set(times.map(weekStart));
    let streak=0,w=weekStart(now);
    if(!weeks.has(w))w-=WEEK; /* this week isn't over yet, so an empty week so far doesn't break the streak */
    while(weeks.has(w)){streak++;w-=WEEK}
    let longest=0,run=0,prev=null;
    [...weeks].sort((x,y)=>x-y).forEach(t=>{run=prev!==null&&Math.round((t-prev)/WEEK)===1?run+1:1;longest=Math.max(longest,run);prev=t});
    const otjSince=t=>hours.filter(x=>Number(x.createdAt)>=t).reduce((n,x)=>n+Number(x.n||0),0);
    /* Pace: weeks left for each unit that has no evidence yet. */
    const unitsLeft=a.units.filter(u=>!u.started).length;
    const weeksLeft=a.endDate?Math.max(0,Math.round((a.endDate.getTime()-now)/WEEK)):null;
    /* Quality: how many key points the latest write-up of each unit covers. */
    const prompts=(window.eviaLearnerPrompts||{})[course]||{};
    const checks=coach.checkUnit?a.units.filter(u=>u.started&&prompts[u.name]).map(u=>coach.checkUnit(u,prompts)).filter(c=>c.terms.length):[];
    const coverage=checks.length?Math.round(checks.reduce((n,c)=>n+c.covered.length/c.terms.length,0)/checks.length*100):null;
    /* Tests saved by review.js. */
    const tests=readJson("evia7-test-results",[]).filter(t=>t&&t.course===course);
    const byType={};
    tests.forEach(t=>{const k=t.type;if(!byType[k])byType[k]={type:k,name:TEST_NAMES[k]||k,count:0,best:0,latest:null};const s=byType[k];s.count++;s.best=Math.max(s.best,testPct(t));if(!s.latest||Date.parse(t.savedAt)>Date.parse(s.latest.savedAt))s.latest=t});
    /* Confidence: the learner's own rating. 1–2 = needs practice, 3–4 = confident. */
    const sessions=readJson("evia7-confidence",[]).filter(x=>x&&x.course===course&&Array.isArray(x.scores)&&x.scores.length);
    const lastConf=sessions[sessions.length-1]||null;
    const latestByArea=new Map();
    sessions.forEach(sess=>sess.scores.forEach(sc=>latestByArea.set(sc.area,sc.score)));
    const practise=[...latestByArea].filter(([,v])=>v<=2).map(([k])=>k);
    const confident=[...latestByArea].filter(([,v])=>v>=3).map(([k])=>k);
    const p=readJson("evia7-profile",{});
    return {
      a,now,packs:unitEntries.length,allPacks:entries.length,
      lastUpload:a.lastEntry?entryTime(a.lastEntry):null,daysSince:a.daysSince,
      packsThisMonth:entries.filter(e=>entryTime(e)>=monthStart()).length,
      otjWeek:otjSince(weekStart(now)),otjMonth:otjSince(monthStart()),otjTotal:a.otj,
      streak,longest,activeThisWeek:weeks.has(weekStart(now)),
      unitsLeft,weeksLeft,weeksPerUnit:weeksLeft!=null&&unitsLeft?weeksLeft/unitsLeft:null,
      coverage,checks,avgPhotos:unitEntries.length?unitEntries.reduce((n,e)=>n+photoCount(e),0)/unitEntries.length:null,
      tests:Object.values(byType),testCount:tests.length,bestTest:tests.reduce((n,t)=>Math.max(n,testPct(t)),0),
      lastTestAt:type=>{const s=byType[type];return s&&s.latest?Date.parse(s.latest.savedAt):null},
      confidence:{last:lastConf?Date.parse(lastConf.startedAt||lastConf.savedAt||0)||null:null,practise,confident,sessions:sessions.length},
      maths:!!p.mathsEnabled,english:!!p.englishEnabled,
      ppeDone:entries.some(e=>e.u===PPE_UNIT)
    };
  }

  /* ---------- Achievements ---------- */
  const ACHIEVEMENTS=[
    {id:"ppe",label:"Safety first",desc:"Completed the PPE induction",test:s=>s.ppeDone},
    {id:"first-pack",label:"First evidence",desc:"Submitted your first evidence pack",test:s=>s.packs>=1},
    {id:"five-packs",label:"Building up",desc:"Submitted 5 evidence packs",test:s=>s.packs>=5},
    {id:"ten-packs",label:"Portfolio pro",desc:"Submitted 10 evidence packs",test:s=>s.packs>=10},
    {id:"ksb-25",label:"Quarter way",desc:"Evidence for 25% of your KSBs",test:s=>s.a.ksbPct>=25},
    {id:"ksb-50",label:"Halfway",desc:"Evidence for 50% of your KSBs",test:s=>s.a.ksbPct>=50},
    {id:"ksb-75",label:"Three quarters",desc:"Evidence for 75% of your KSBs",test:s=>s.a.ksbPct>=75},
    {id:"ksb-100",label:"Every KSB",desc:"Evidence for every KSB",test:s=>s.a.ksbPct>=100},
    {id:"all-units",label:"All-rounder",desc:"Evidence in every unit",test:s=>s.a.units.length>0&&s.unitsLeft===0},
    {id:"streak-4",label:"On a roll",desc:"Active 4 weeks in a row",test:s=>s.longest>=4},
    {id:"streak-12",label:"Steady worker",desc:"Active 12 weeks in a row",test:s=>s.longest>=12},
    {id:"otj-10",label:"Learning logged",desc:"10 hours of off-the-job learning",test:s=>s.otjTotal>=10},
    {id:"otj-50",label:"Dedicated learner",desc:"50 hours of off-the-job learning",test:s=>s.otjTotal>=50},
    {id:"first-test",label:"Test taker",desc:"Completed your first test",test:s=>s.testCount>=1},
    {id:"test-80",label:"Top marks",desc:"Scored 80% or more in a test",test:s=>s.bestTest>=80},
    {id:"confidence",label:"Know yourself",desc:"Completed a confidence check",test:s=>s.confidence.sessions>=1},
    {id:"writeup",label:"Full marks write-up",desc:"A write-up covering every key point",test:s=>s.checks.some(c=>c.covered.length===c.terms.length)}
  ];
  /* Records when each achievement was first earned; newly earned ones are returned so Evia can celebrate them. */
  function achievements(s){
    const earned=readJson(EARNED_KEY,{});let changed=false;const fresh=[];
    const list=ACHIEVEMENTS.map(x=>{
      const has=!!x.test(s);
      if(has&&!earned[x.id]){earned[x.id]={at:Date.now(),seen:false};changed=true}
      const rec=earned[x.id];
      if(has&&rec&&!rec.seen)fresh.push(x);
      return Object.assign({},x,{earned:has||!!rec,at:rec?rec.at:null});
    });
    if(changed)localStorage.setItem(EARNED_KEY,JSON.stringify(earned));
    return {list,fresh,count:list.filter(x=>x.earned).length};
  }
  function markSeen(ids){
    const earned=readJson(EARNED_KEY,{});
    ids.forEach(id=>{if(earned[id])earned[id].seen=true});
    localStorage.setItem(EARNED_KEY,JSON.stringify(earned));
  }

  /* ---------- Evia's nudges, most useful first ---------- */
  function nudges(s){
    const list=[],ach=achievements(s),day=new Date().getDay();
    const daysAgo=t=>t==null?Infinity:(s.now-t)/DAY;
    if(ach.fresh.length){
      const x=ach.fresh[0];
      list.push({id:"ach-"+x.id,celebrate:true,achievements:ach.fresh.map(f=>f.id),text:"You’ve earned a new achievement: <strong>"+x.label+"</strong>. "+x.desc+".",action:{label:"See my stats",kind:"stats"}});
    }
    if(s.daysSince==null&&s.a.units.length)list.push({id:"first-evidence",text:"Ready for your first unit? Any job from site can be evidence. Take photos and write up what you did.",action:{label:"Go to Course",kind:"course"}});
    else if(s.daysSince!=null&&s.daysSince>=14)list.push({id:"quiet",text:"It’s been "+s.daysSince+" days since your last evidence. Anything from site this week worth capturing?",action:{label:"Go to Course",kind:"course"}});
    if(s.otjWeek===0&&(day===0||day>=4))list.push({id:"otj-week",text:"No off-the-job learning logged this week yet. Training, toolbox talks and research all count.",action:{label:"Log OTJ hours",kind:"learning"}});
    const timePct=s.a.timePct;
    if(timePct!=null&&timePct>=75){
      const gap=timePct>=90?7:14;
      if(daysAgo(s.lastTestAt("epa"))>gap)list.push({id:"epa",text:"You’re "+timePct+"% of the way through your course, so it’s time to practise for your end-point assessment. Try an EPA mock test.",action:{label:"Take an EPA full mock",kind:"test"}});
    }
    if(s.maths&&daysAgo(s.lastTestAt("maths"))>14)list.push({id:"maths",text:"It’s been a while since your last maths practice. A quick test keeps it fresh.",action:{label:"Take a maths test",kind:"test"}});
    if(s.english&&daysAgo(s.lastTestAt("english"))>14)list.push({id:"english",text:"Fancy a quick English practice test? It only takes a few minutes.",action:{label:"Take an English test",kind:"test"}});
    if(daysAgo(s.confidence.last)>30)list.push({id:"confidence",text:s.confidence.sessions?"It’s been a month since your last confidence check. Rate yourself again so your tutor knows what to focus on.":"Rate how confident you feel on each practical skill. It shows you and your tutor what to practise.",action:{label:"Do a confidence check",kind:"confidence"}});
    return list;
  }

  /* ---------- Stats section (Progress page) ---------- */
  const escHtml=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const ago=t=>{if(t==null)return"Not yet";const d=Math.floor((new Date().setHours(0,0,0,0)-new Date(t).setHours(0,0,0,0))/DAY);return d<=0?"Today":d===1?"Yesterday":d+" days ago"};
  const hrs=n=>(Math.round(n*10)/10).toString()+" hr"+(n===1?"":"s");
  const BADGE='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/></svg>';
  function sectionHtml(s){
    const ach=achievements(s);
    const tile=(label,value,sub)=>'<div class="st-tile"><small>'+label+'</small><strong>'+value+'</strong>'+(sub?'<span>'+sub+'</span>':"")+'</div>';
    const pace=s.weeksPerUnit!=null?"About <strong>"+Math.max(1,Math.floor(s.weeksPerUnit))+" week"+(Math.floor(s.weeksPerUnit)>1?"s":"")+" per unit</strong> ("+s.weeksLeft+" weeks left, "+s.unitsLeft+" unit"+(s.unitsLeft===1?"":"s")+" still to start)"
      :s.unitsLeft===0&&s.a.units.length?"Every unit has evidence. Use the time left to strengthen the weaker ones."
      :"Add your start and end dates in Profile to see your pace.";
    const tests=s.tests.length?s.tests.map(t=>'<li><span>'+escHtml(t.name)+'</span><strong>'+testPct(t.latest)+'%</strong><small>best '+t.best+'% · '+ago(Date.parse(t.latest.savedAt)).toLowerCase()+'</small></li>').join(""):'<li class="st-empty">No tests taken yet</li>';
    const chips=(list,cls)=>list.length?list.map(x=>'<span class="st-chip '+cls+'">'+escHtml(x)+'</span>').join(""):'<span class="st-none">None</span>';
    return '<section class="ui-card st-card" id="ui-stats" aria-labelledby="st-title">'+
      '<h2 id="st-title" class="st-title">My stats</h2>'+
      '<div class="st-tiles">'+tile("Last upload",ago(s.lastUpload))+tile("Streak",s.streak+" week"+(s.streak===1?"":"s"),s.activeThisWeek||!s.streak?"":"add something this week to keep it")+tile("This month",s.packsThisMonth+" pack"+(s.packsThisMonth===1?"":"s"))+'</div>'+
      '<div class="st-row"><small>Off-the-job learning</small><p><strong>'+hrs(s.otjWeek)+'</strong> this week · '+hrs(s.otjMonth)+' this month · '+hrs(s.otjTotal)+' total</p></div>'+
      '<div class="st-row"><small>Pace</small><p>'+pace+'</p></div>'+
      '<div class="st-row"><small>Evidence quality</small><p>'+(s.coverage==null?"Submit a unit write-up to see this.":"Write-ups cover <strong>"+s.coverage+"%</strong> of key points"+(s.avgPhotos!=null?" · "+(Math.round(s.avgPhotos*10)/10)+" photos per pack":""))+'</p></div>'+
      '<div class="st-row"><small>Tests</small><ul class="st-tests">'+tests+'</ul><button type="button" class="st-action" data-st-action="tests">Practice tests</button></div>'+
      '<div class="st-row"><small>Confidence '+(s.confidence.last?"· rated "+ago(s.confidence.last).toLowerCase():"")+'</small>'+
        (s.confidence.sessions?'<div class="st-conf"><span class="st-conf-label">Needs practice</span><div>'+chips(s.confidence.practise,"low")+'</div><span class="st-conf-label">Confident</span><div>'+chips(s.confidence.confident,"high")+'</div></div>':'<p>Do a confidence check to see which skills need practice.</p>')+
        '<button type="button" class="st-action" data-st-action="confidence">'+(s.confidence.sessions?"Rate my skills again":"Rate my skills")+'</button>'+
      '</div>'+
      '<div class="st-row"><small>Achievements · '+ach.count+' of '+ach.list.length+'</small><ul class="st-badges">'+ach.list.map(x=>'<li class="'+(x.earned?"on":"")+'" title="'+escHtml(x.desc)+'"><span class="st-badge-icon">'+BADGE+'</span><strong>'+escHtml(x.label)+'</strong><small>'+escHtml(x.desc)+'</small></li>').join("")+'</ul></div>'+
    '</section>';
  }

  window.eviaStats={compute,achievements,markSeen,nudges,sectionHtml,ago};
})();
