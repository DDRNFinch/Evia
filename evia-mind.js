/* Evia7 mind: makes typing to Evia feel like talking to an assistant, without an AI service. It all runs on the
   phone, so nothing the learner types leaves it, it costs nothing and it works offline.
     Reading      fixes spelling against everything Evia knows, text-speak ("hw many hrs hav i dun") and number words.
     About you    the learner's own hours, review, pace, units, tests, coins, sign-offs, confidence and streak.
     Follow-ups   "tell me more", "why?", "what's it used for?", "and a jointer?" carry on from the last topic.
     Compare      "difference between a bolster and a chisel".
     Small talk   who Evia is, what she can do, jokes, and how the learner's feeling.
     Help         how the app works and what apprenticeship words mean.
     Search       when nothing fits, the closest matches from the glossary, Teach me, KSBs, units and help.
   Everything else goes on to Evia's brain (evia-brain.js): calculations, the glossary, KSBs and lessons.
   window.eviaMind: answer(text), fallback(text), read(text) (the tidied text, for tests), search(text). */
(function(){
  const K=()=>window.eviaChatKit,B=()=>window.eviaBrain||{},C=()=>window.eviaCoachFlows||{};
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const hm=h=>window.eviaHM?window.eviaHM(h):Math.round(h*10)/10+"h";
  const day=d=>new Date(d).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  const shortDay=d=>new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  const plural=(n,w,ws)=>n+" "+(n===1?w:(ws||w+"s"));
  const listText=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
  const leave=f=>()=>{K().closeChat();setTimeout(f,100)};
  const goNav=where=>leave(()=>typeof nav==="function"&&nav(where));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const trade=()=>typeof course!=="undefined"?course:"bricklayer";
  const stats=()=>{try{return window.eviaStats.compute()}catch(_){return null}};
  const say=h=>K().say(h),replies=l=>K().replies(l.filter(Boolean));

  /* ---------- Reading: text-speak, number words and spelling ---------- */
  const SLANG={u:"you",ya:"you",yu:"you",ur:"your",yr:"your",r:"are",wat:"what",wot:"what",wht:"what",wut:"what",wats:"whats",wots:"whats",hw:"how",hows:"how is",
    cn:"can",cud:"could",wud:"would",shud:"should",plz:"please",pls:"please",thx:"thanks",ty:"thanks",tnx:"thanks",im:"i am",ive:"i have",id:"i would",
    dunno:"dont know",gonna:"going to",wanna:"want to",gimme:"give me",abt:"about",b4:"before","2day":"today",tmrw:"tomorrow",tmoz:"tomorrow",tmw:"tomorrow",
    hrs:"hours",hr:"hour",mins:"minutes",min:"minutes",wk:"week",wks:"weeks",mth:"month",n:"and",nd:"and",teh:"the",da:"the",mi:"my",
    dun:"done",dne:"done",hav:"have",hve:"have",av:"have",wen:"when",wer:"where",wich:"which",wch:"which",gud:"good",bc:"because",cuz:"because",coz:"because",cos:"because",
    tbh:"",lol:"",lmao:"",omg:"",ffs:"",innit:"",m8:"mate",gr8:"great",l8r:"later",ppl:"people",sumthin:"something",smth:"something",sth:"something",
    alot:"a lot",tho:"though",thru:"through",nite:"night",wanted:"wanted",whens:"when is",wheres:"where is",whos:"who is",
    otj:"off the job",gcse:"gcse",epa:"epa",ksbs:"ksbs",ksb:"ksb"};
  const NUMW={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,
    seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  /* "four point two metres" -> "4.2 metres", "two hundred and fifty" -> "250", "half a metre" -> "0.5 metre". */
  function numberWords(t){
    t=t.replace(/\bhalf an? (metre|meter|m|hour|day)\b/g,"0.5 $1").replace(/\ba (hundred|thousand)\b/g,"one $1");
    const w=t.split(" "),out=[],key=x=>x.replace(/[^a-z]/g,""),num=x=>key(x) in NUMW&&key(x)===x;
    for(let i=0;i<w.length;){
      if(!num(w[i])){out.push(w[i]);i++;continue}
      let total=0,cur=0,dec="",j=i;
      while(j<w.length){const x=w[j];
        if(num(x)){cur+=NUMW[x];j++}
        else if(x==="hundred"){cur=(cur||1)*100;j++}
        else if(x==="thousand"){total+=(cur||1)*1000;cur=0;j++}
        else if(x==="and"&&num(w[j+1]||"")&&(cur>=100||total)){j++}
        else if(x==="point"&&num(w[j+1]||"")){j++;while(j<w.length&&num(w[j])&&NUMW[w[j]]<10){dec+=NUMW[w[j]];j++}break}
        else break}
      out.push(String(total+cur)+(dec?"."+dec:""));i=j;
    }
    return out.join(" ");
  }
  /* Words Evia knows, with how often she uses them: from the glossary, Teach me, the KSBs, the units and this file. */
  let VOCAB=null;
  const PROTECT="useless rubbish stupid dumb crap pointless amazing brilliant class knackered exhausted shattered buzzing robot chatgpt joke jokes funny laugh bored tired happy sad angry upset monkey purple orange banana football weather news music phone game games level boss mate lads dinner lunch break holiday money pay wages sick ill late early";
  const COMMON="the and you your what how when where which who why can could would should will have has had been being are was were is it its this that these those there their they them then than with without from into onto about above below after before again also just only very really much many more most some any all each every other another same such own off out over under up down here now today tomorrow yesterday week weeks month year time times day days hour hours minute minutes please thanks thank yes yeah no not dont doesnt didnt cant wont isnt arent wasnt ive im id ill youre youve were theyre its lets ok okay alright good great bad best worst better worse need needs want wants know knew think thought tell told show give gave get got make made do does did done doing go going gone went come came see saw look find found use used using work working worked job jobs site sites learn learning learnt lesson lessons course courses college tutor assessor employer boss mate review reviews target targets evidence photo photos write writeup unit units test tests score scores mock mocks exam exams practice practise question questions answer answers help hello hiya hey morning afternoon evening night tired bored stressed happy sad stuck joke funny robot human real person name called call left right first last next new old big small long short high low wide deep tall thick thin hard easy quick slow far near behind ahead track pace finish finished start started end ended coins coin money pay paid streak confidence skills skill strong weak strongest weakest sign signed signoff feedback difference between versus compare same like love hate".split(" ");
  function vocab(){
    if(VOCAB)return VOCAB;
    const v=new Map(),add=(s,w)=>String(s||"").toLowerCase().replace(/[’']/g,"").split(/[^a-z]+/).forEach(x=>{if(x.length>=3)v.set(x,(v.get(x)||0)+(w||1))});
    COMMON.forEach(w=>add(w,50));Object.values(SLANG).forEach(w=>add(w,20));
    /* Every word in Evia's own patterns, so a feeling or a question word is never "corrected" into a trade word. */
    TALK.forEach(([re])=>add(re.source,60));ME.forEach(([f])=>add(f.toString(),60));add(PROTECT,60);
    try{(B().glossary?B().glossary():[]).forEach(g=>{add(g[0],30);(g[1]||[]).forEach(x=>add(x,20));add(g[2])})}catch(_){}
    try{(B().lessons?B().lessons():[]).forEach(({l})=>{add(l.title,10);add(l.blurb);(l.steps||[]).forEach(st=>add([st.title,st.say,st.why,st.q].join(" ")))})}catch(_){}
    try{const d=data();d.u.forEach(u=>{add(u[0],20);u[1].forEach(k=>add(String(k).split("|").slice(1).join(" ")))})}catch(_){}
    FAQ.forEach(f=>{f.q.forEach(q=>add(q,10));add(f.a)});
    ["bricks","blocks","mortar","concrete","stairs","diagonal","gradient","calculator","calculators","volume","area","metres","millimetres","plasterboard","timber","joinery","carpentry","bricklaying","apprenticeship","apprentice","gateway","portfolio","knowledge","behaviour","behaviours","functional","maths","english","backup","notifications","rewards","shape","colour","teach","progress","logged","logging","hours","week"].forEach(w=>add(w,40));
    return VOCAB=v;
  }
  function dist(a,b,max){
    if(Math.abs(a.length-b.length)>max)return max+1;
    const d=[];for(let i=0;i<=a.length;i++){d[i]=[i];for(let j=1;j<=b.length;j++)d[i][j]=i?0:j}
    for(let i=1;i<=a.length;i++){let row=max+1;for(let j=1;j<=b.length;j++){const c=a[i-1]===b[j-1]?0:1;
      d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
      row=Math.min(row,d[i][j])}
      if(row>max)return max+1}
    return d[a.length][b.length];
  }
  function fix(w){
    const V=vocab();if(w.length<4||/\d/.test(w)||V.has(w))return w;
    const max=w.length>=7?2:1;let best=w,bd=max+1,bf=0;
    for(const [c,f] of V){if(c.length<3)continue;const dd=dist(w,c,max);if(dd>max)continue;
      if(dd>1&&c[0]!==w[0])continue;
      if(dd<bd||(dd===bd&&f>bf)){best=c;bd=dd;bf=f}}
    return best;
  }
  /* The tidied message: lower case, slang and number words swapped, spelling fixed. Digits and units are kept. */
  function read(text){
    let t=String(text||"").toLowerCase().replace(/[’`]/g,"'").replace(/(\w)'(\w)/g,"$1$2");
    t=t.replace(/[a-z0-9]+/g,w=>w in SLANG?SLANG[w]:w).replace(/\s+/g," ").trim();
    t=t.replace(/([a-z])([?!,.]+)(\s|$)/g,"$1 $2$3").replace(/\b(one|half)[ -](brick)/g,"$1$2");
    t=numberWords(t).replace(/\b(one|half)brick/g,"$1 brick").replace(/\s+([?!,.]+)/g,"$1");
    t=t.replace(/[a-z]+/g,w=>fix(w));
    return t.replace(/\s+/g," ").trim();
  }

  /* ---------- About you: answered from the learner's own records ---------- */
  const isMe=t=>/\b(i|i am|i have|my|me|mine|am i|have i|did i|do i|ive|im)\b/.test(t);
  const asks=t=>/\b(how many|how much|how long|how far|what|whats|when|which|where|have i|did i|am i|do i|is my|tell me|show me|total|so far)\b/.test(t);
  function aimPerWeek(){
    try{const en=window.eviaData.enrolment&&window.eviaData.enrolment(),p=window.eviaData.learner()||{},s=Date.parse((en&&en.start)||p.start||""),e=Date.parse((en&&en.end)||p.end||""),planned=Number(en&&en.plannedOtjHours);
      if(planned>0&&e>s)return Math.round(planned/((e-s)/(7*864e5))*10)/10}catch(_){}
    return 6;
  }
  function myHours(t){
    const S=stats();if(!S)return false;
    const today=new Date();today.setHours(0,0,0,0);
    const todayH=(typeof hours!=="undefined"?hours:[]).filter(x=>Number(x.on||x.createdAt)>=today.getTime()).reduce((n,x)=>n+Number(x.n||0),0);
    const aim=aimPerWeek();
    if(/\btoday\b/.test(t))say(todayH?"You’ve logged <strong>"+hm(todayH)+"</strong> of learning today.":"Nothing logged today yet.");
    else if(/\bmonth\b/.test(t))say("You’ve logged <strong>"+hm(S.otjMonth)+"</strong> of learning this month.");
    else if(/\b(total|altogether|overall|so far|in all|all time)\b/.test(t))say("You’ve logged <strong>"+hm(S.otjTotal)+"</strong> of learning in total.");
    else say("This week you’ve logged <strong>"+hm(S.otjWeek)+"</strong>"+(S.otjWeek>=aim?", which meets the "+hm(aim)+" a week to aim for. Nice.":", and the aim is about <strong>"+hm(aim)+"</strong> a week.")+" That’s "+hm(S.otjTotal)+" in total.");
    replies([{label:"Log hours",primary:S.otjWeek<aim,run:()=>C().hours&&C().hours()},{label:"See my learning logs",run:leave(()=>window.eviaOpenLearningLogs&&window.eviaOpenLearningLogs())}]);
    return true;
  }
  function myReview(){
    const rd=window.eviaReviewDue&&window.eviaReviewDue();
    if(!rd){say("You don’t have a progress review date yet. Your assessor or tutor sets it, usually every 12 weeks.");return true}
    say(rd.days<0?"Your progress review was due on <strong>"+day(rd.due)+"</strong>, so it’s overdue.":rd.days===0?"Your progress review is <strong>today</strong>.":"Your next progress review is on <strong>"+day(rd.due)+"</strong>, in "+plural(rd.days,"day")+".");
    const n=window.eviaReviewPrepCount?window.eviaReviewPrepCount():0;
    if(n&&rd.days<=21)say("There "+(n===1?"is 1 thing":"are "+n+" things")+" I’d sort out before it.");
    replies([{label:"Get ready for my review",primary:true,run:()=>C().prepare&&C().prepare()}]);
    return true;
  }
  function myPace(){
    const S=stats();if(!S)return false;const a=S.a;
    if(a.timePct==null){say("You’ve got evidence for <strong>"+a.ksbPct+"%</strong> of your "+(window.eviaTerm?window.eviaTerm().many:"KSBs")+". Add your course start and end dates in your profile and I can tell you if that’s on track.");return true}
    const gap=a.timePct-a.ksbPct;
    say("You’re <strong>"+a.timePct+"%</strong> of the way through your course and <strong>"+a.ksbPct+"%</strong> of your "+(window.eviaTerm?window.eviaTerm().many:"KSBs")+(a.signoff?" are signed off":" have evidence")+". "+
      (gap<=0?"That’s ahead of where you need to be. Brilliant.":gap<=10?"That’s about on track.":gap<=25?"That’s a bit behind, but very catchable.":"That’s behind, so evidence is the thing to focus on."));
    if(gap>10&&a.quickest)say("The quickest win is <strong>"+esc(a.quickest.name)+"</strong>: it covers "+plural(a.quickest.missing.length,"KSB")+" you’re still missing.");
    replies([gap>10&&a.quickest?{label:"Open "+a.quickest.name,primary:true,run:()=>K().openUnitFromChat(a.quickest)}:null,{label:"Open My progress",run:goNav("learning")}]);
    return true;
  }
  function myFinish(){
    const S=stats();if(!S)return false;const a=S.a;
    if(!a.endDate){say("I don’t have your course end date. You can add it in your profile.");return true}
    say("Your course ends on <strong>"+day(a.endDate)+"</strong>"+(S.weeksLeft!=null?", "+plural(S.weeksLeft,"week")+" from now":"")+"."+(S.unitsLeft?" You’ve got "+plural(S.unitsLeft,"unit")+" without evidence yet.":""));
    return true;
  }
  function myUnits(t){
    const S=stats();if(!S)return false;const a=S.a,done=a.units.filter(u=>u.started).length,total=a.units.length;
    if(/\b(next|should|start|first|quickest|easiest)\b/.test(t)){
      if(!a.quickest){say("Every unit has evidence. Next, make the weakest ones stronger with more photos and fuller write-ups.");return true}
      say("I’d do <strong>"+esc(a.quickest.name)+"</strong> next. It covers "+plural(a.quickest.missing.length,"KSB")+" you’re still missing, more than any other unit.");
      replies([{label:"Open "+a.quickest.name,primary:true,run:()=>K().openUnitFromChat(a.quickest)}]);return true;
    }
    const left=a.units.filter(u=>!u.started).map(u=>u.name);
    say("You’ve got evidence in <strong>"+done+" of "+total+"</strong> units."+(left.length?" Still to start: "+esc(listText(left.slice(0,4)))+(left.length>4?" and "+(left.length-4)+" more":"")+".":" Every unit has started."));
    if(a.quickest)replies([{label:"Open "+a.quickest.name,primary:true,run:()=>K().openUnitFromChat(a.quickest)}]);
    return true;
  }
  function myWeakest(){
    const S=stats();if(!S)return false;
    const c=(S.checks||[]).map(x=>({x,p:x.covered.length/x.terms.length})).sort((a,b)=>a.p-b.p)[0];
    if(!c){say("I haven’t got a write-up to check yet. Save some evidence with a write-up and I’ll tell you which is weakest.");return true}
    say("Your weakest write-up is <strong>"+esc(c.x.u.name)+"</strong>: it covers "+c.x.covered.length+" of "+c.x.terms.length+" things to mention."+(c.x.missing&&c.x.missing.length?" Add "+esc(listText(c.x.missing.slice(0,3)))+".":""));
    replies([{label:"Open "+c.x.u.name,primary:true,run:()=>K().openUnitFromChat(c.x.u)},{label:"Check my evidence",run:()=>C().evidenceCheck&&C().evidenceCheck()}]);
    return true;
  }
  function myTests(){
    const tests=(window.eviaData?window.eviaData.list("tests"):[]).filter(t=>t&&t.course===trade()&&t.pct!=null).sort((a,b)=>Date.parse(a.takenAt||0)-Date.parse(b.takenAt||0));
    if(!tests.length){say("You haven’t taken a practice test yet. A short one takes about five minutes.");replies([{label:"Practise now",primary:true,run:()=>C().epa&&C().epa()}]);return true}
    const last=tests[tests.length-1],best=Math.max(...tests.map(t=>Number(t.pct)||0));
    say("Your last test"+(last.takenAt?" on "+shortDay(last.takenAt):"")+" scored <strong>"+last.pct+"%</strong>. Your best is <strong>"+best+"%</strong> from "+plural(tests.length,"test")+"."+(last.pct>=70?" Good going.":" Aim for 70% or more."));
    replies([{label:"Practise again",primary:true,run:()=>C().epa&&C().epa()}]);
    return true;
  }
  function myCoins(){
    const R=window.eviaRewards;if(!R||!R.balance)return false;
    const n=R.balance();say("You’ve got <strong>"+n+" coin"+(n===1?"":"s")+"</strong>. You earn them for evidence, learning hours, lessons, targets and games, and spend them in Rewards.");
    replies([{label:"Open Rewards",run:goNav("rewards")}]);return true;
  }
  function mySignoffs(){
    const joined=window.eviaNisia&&window.eviaNisia.joined&&window.eviaNisia.joined();
    if(!joined){say("Your assessor’s sign-offs come through here once you’ve joined your college in Evia. Until then I mark off the KSBs in your evidence.");return true}
    const all=Object.values(readJson("evia7-nisia-feedback",{})||{}).filter(f=>f&&f.kind!=="observation");
    const ok=all.filter(f=>f.decision==="accepted").length,more=all.filter(f=>f.decision&&f.decision!=="accepted").length,S=stats();
    say(all.length?"Your assessor has signed off <strong>"+plural(ok,"piece")+"</strong> of evidence"+(more?" and asked for more on <strong>"+more+"</strong>":"")+"."+(S?" That’s "+S.a.ksbPct+"% of your KSBs signed off.":""):"Your assessor hasn’t looked at any evidence yet. I’ll tell you when they do.");
    return true;
  }
  function myConfidence(){
    const S=stats();if(!S)return false;const sc=S.confidence.scores.slice().sort((a,b)=>a.score-b.score);
    if(!sc.length){say("You haven’t rated your skills yet. It takes two minutes, and then I can tell you what to practise.");replies([{label:"Rate my skills",primary:true,run:()=>C().confidence&&C().confidence()}]);return true}
    const low=sc.filter(x=>x.score<=2),high=sc.filter(x=>x.score>=3);
    say((low.length?"You rated yourself lowest at <strong>"+esc(listText(low.slice(0,3).map(x=>x.area)))+"</strong>. ":"")+(high.length?"You’re most confident at <strong>"+esc(high[high.length-1].area)+"</strong>.":""));
    if(low.length)replies([{label:"Find a college task",primary:true,run:()=>C().task&&C().task()}]);
    return true;
  }
  function myStreak(){
    const S=stats();if(!S)return false;
    say(S.streak?"You’re on a <strong>"+plural(S.streak,"week")+"</strong> streak of doing something every week. Your longest is "+plural(S.longest,"week")+".":"No streak at the moment. Save evidence or log some learning this week to start one.");
    return true;
  }
  function whoAmI(){
    let p={};try{p=window.eviaData.learner()||{}}catch(_){}
    let d=null;try{d=data()}catch(_){}
    say((p.name?"You’re <strong>"+esc(p.name)+"</strong>":"I don’t know your name yet")+(d?", on the <strong>"+esc(d.name)+"</strong> course":"")+".");
    return true;
  }
  const ME=[
    [t=>/\b(hours?|learning|off the job|training)\b/.test(t)&&!/\b(log|add|record|put in|enter|need|needed|should|required|minimum|supposed|meant|count|counts|logs|where)\b/.test(t)&&asks(t)&&(isMe(t)||/\b(this week|today|this month)\b/.test(t)),myHours],
    [t=>/\breview\b/.test(t)&&/\b(when|next|due|date|day)\b/.test(t),myReview],
    [t=>/\b(how am i doing|am i (on track|behind|ahead|doing (ok|okay|well|alright))|on track|my progress|how far (am i|through)|where am i)\b/.test(t),myPace],
    [t=>/\b(when do i finish|when does my (course|apprenticeship) (end|finish)|end date|weeks left|how long (have i got|left)|finish date)\b/.test(t),myFinish],
    [t=>/\bunits?\b/.test(t)&&isMe(t)&&/\b(how many|left|done|started|next|should|which|what|first|quickest)\b/.test(t)&&!/\bwhat is\b/.test(t),myUnits],
    [t=>/\b(weakest|worst)\b.*\b(evidence|write ?ups?|unit)\b|\b(evidence|write ?up)\b.*\b(weakest|worst)\b/.test(t),myWeakest],
    [t=>/\b(tests?|scores?|mocks?|quiz|marks?)\b/.test(t)&&/\b(last|best|my|average|how did i|what did i get)\b/.test(t),myTests],
    [t=>/\b(coins?|balance)\b/.test(t)&&/\b(how many|my|have i|got)\b/.test(t),myCoins],
    [t=>/\b(signed off|sign offs?|signoffs?|assessor)\b/.test(t)&&/\b(has|have|did|what|how many|anything|my)\b/.test(t)&&!/\bwhat is\b/.test(t),mySignoffs],
    [t=>/\b(weakest|worst|bad at|best at|strongest|good at|struggle|confiden)\w*/.test(t)&&isMe(t),myConfidence],
    [t=>/\bstreak\b/.test(t),myStreak],
    [t=>/\b(whats my name|who am i|what course am i|which course am i|what am i studying)\b/.test(t),whoAmI]
  ];

  /* ---------- Help: how the app works and what apprenticeship words mean ---------- */
  const FAQ=[
    {q:["what is epa","end point assessment","what is the end point assessment","how does epa work"],a:"The end-point assessment (EPA) is the independent check at the end of your apprenticeship that you can do the job. It’s usually a knowledge test, a practical and a professional discussion, with an assessor who hasn’t trained you. You take it after gateway.",go:["EPA practice",()=>C().epa&&C().epa()]},
    {q:["what is gateway","when is gateway","gateway meaning"],a:"Gateway is when you, your employer and your college agree you’re ready for your end-point assessment. Your portfolio needs to be in good shape, and you’ll need any English and maths your apprenticeship asks for."},
    {q:["what is a ksb","what are ksbs","what does ksb mean","knowledge skills behaviours"],a:"KSBs are the Knowledge, Skills and Behaviours your apprenticeship standard says you must show. K codes are what you know, S codes what you can do, and B codes how you work. Your evidence proves each one."},
    {q:["what is off the job training","what counts as off the job","how many off the job hours do i need","what are learning hours","what counts as learning hours"],a:"Off-the-job training is learning in your paid hours that isn’t your normal work: college days, training courses, toolbox talks, research, shadowing and Teach me. Most full-time apprentices need at least 6 hours a week. Your college sets your exact planned hours.",go:["Log hours",()=>C().hours&&C().hours()]},
    {q:["what is a progress review","what happens at a review","how often are reviews"],a:"A progress review is a catch-up with you, your employer and your tutor or assessor, usually every 12 weeks. You look at your progress, evidence, learning hours and wellbeing, and agree new targets.",go:["Get ready for my review",()=>C().prepare&&C().prepare()]},
    {q:["how do i add evidence","how do i take photos","how do i upload evidence","how do i do a unit","how do i start a unit"],a:"Open a unit on My course, take your photos of the job (start, middle and finished), then write what you did. Let Evia guide you takes you through the write-up one KSB at a time.",go:["Go to My course",goNav("course")]},
    {q:["how do i back up","backup my portfolio","save my work","what if i lose my phone"],a:"A backup saves your whole portfolio to a file, in case your phone breaks or goes missing. If you’ve joined your college, your work is also synced to Nisia and comes back when you sign in on a new phone.",go:["Back up now",()=>K().runNudge({action:{kind:"backup",label:"Back up now"}})]},
    {q:["who can see my evidence","is my data private","what happens to my data","gdpr","privacy","do you share what i type"],a:"Your work is saved on your phone. If you’ve joined your college, your evidence, hours and progress are shared with your college and assessor so they can review them. What you type to me stays on your phone: I work everything out here, without sending it anywhere."},
    {q:["what happens if i fail epa","can i resit epa","failed my epa","retake epa"],a:"If you don’t pass part of your EPA, you can normally resit or retake that part. Your assessor and employer plan it with you, with extra support for anything you found hard."},
    {q:["do i need maths and english","functional skills","do i need gcse"],a:"Some apprentices need Functional Skills English and maths before gateway, depending on their age and the qualifications they already have. Your college will tell you if you need them. Teach me has maths and English lessons either way."},
    {q:["how do i connect to my college","join my college","link to college","what is nisia"],a:"Your college gives you a code or QR code to join. Once you’re in, your assessor sees your evidence, signs off KSBs and your reviews come through here.",go:["Join my college",()=>window.eviaJoinCollege?leave(window.eviaJoinCollege)():goNav("course")()]},
    {q:["where are my learning logs","download my hours","learning hours pdf","my learning log"],a:"Your learning logs list every entry, and you can download them as a PDF for your assessor.",go:["Open learning logs",leave(()=>window.eviaOpenLearningLogs&&window.eviaOpenLearningLogs())]},
    {q:["how do i change my name","edit my profile","change my course dates","change my details"],a:"Tap your profile button at the top of the page. You can change your details and dates there, unless your college has set them."},
    {q:["what is teach me","how do lessons work","where are the lessons"],a:"Teach me has short lessons for your trade, maths, English and EDI, with games to check you’ve got it. Every lesson counts towards your learning hours.",go:["Open Teach me",goNav("teach")]},
    {q:["what is a professional discussion","how does the discussion work","discussion questions"],a:"The professional discussion is a conversation with your end-point assessor about your work and your portfolio. Explain what you did, how and why, using real jobs. You can practise it in EPA practice.",go:["Practise a discussion",()=>C().epa&&C().epa()]},
    {q:["what should i wear on site","what ppe do i need","what do i need to wear","what kit do i need on site","do i need a hard hat"],a:"On most sites you need a hard hat, hi-vis, safety boots with toe caps and gloves as a minimum. Add eye protection when cutting or mixing, ear defenders around loud tools, and the right mask (such as FFP3) for dust. Always follow the site rules and your risk assessment."},
    {q:["what is a portfolio","how do i make a strong portfolio","what makes good evidence"],a:"Your portfolio is your evidence: photos and write-ups of real jobs that prove your KSBs. Strong evidence has your own start, middle and end photos, full PPE in every photo, and a write-up that says what you did, how, why and how you checked it.",go:["Show me how",leave(()=>window.eviaStrength&&window.eviaStrength.guide())]}
  ];

  /* ---------- Small talk ---------- */
  const JOKES=["Why did the bricklayer get promoted? He laid the groundwork.","I told a joke about a level once. It fell flat… no, actually, it was spot on.","What do you call a bricklayer who’s always late? A slow mortar.","Why did the joiner go to therapy? Too many issues with his cutting edge.","How does a carpenter stay calm? He just keeps his level head.","I was going to tell you a joke about a ladder, but you might not be able to get over it."];
  function capabilities(){
    say("I’m best at these. Just ask the way you’d ask a mate:");
    K().widget('<div class="br-card br-help mi-can"><p><b>Your course</b> “How many hours have I done this week?”, “When’s my review?”, “Am I on track?”, “Which unit next?”</p>'+
      '<p><b>The trade</b> “What’s a bolster for?”, “Difference between a header and a stretcher”, “What’s K20?”</p>'+
      '<p><b>Sums</b> “Bricks for a 4 m by 1.2 m wall”, “Mortar for 500 bricks”, “Stairs for a 2.6 m rise”</p>'+
      '<p><b>Doing things</b> “Log my hours”, “Check my evidence”, “Get me ready for my review”</p></div>');
  }
  const TALK=[
    [/^(who|what) (are|is) (you|evia)\b|\bwho is evia\b|\bwhat is evia\b|^whats evia\b|\btell me about (yourself|you)\b/,()=>say("I’m Evia, your apprenticeship buddy. I know your course, your evidence and your hours, and I can help with the trade and the maths. I work everything out on your phone, so what you type stays here.")],
    [/\b(are you|you are|is evia) (a |an )?(robot|bot|ai|real|human|person|chat ?gpt|alive)\b/,()=>say("I’m not a person, and I’m not ChatGPT. I’m built into Evia: I read what you type and work out the answer on your phone, from your course and everything I’ve been taught about the trade.")],
    [/\b(who (made|built|created) you|who is your (maker|creator))\b/,()=>say("I was made for apprentices by the team behind Evia and Nisia, with help from tutors and assessors.")],
    [/^(how are you|how is it going|how are things|you (alright|ok|okay)|hows it going)\b/,()=>say(pick(["I’m good, thanks. How’s work going?","All good here. What are you working on today?","Doing well! Anything I can help with?"]))],
    [/\b(what can you do|what do you do|what do you know|how do you work|how can you help|what can i ask)\b|^(help|help me|help please|please help|i need help)$/,capabilities],
    [/\b(joke|make me laugh|something funny)\b/,()=>say(pick(JOKES))],
    [/\b(i am|i feel|feeling|im) (so )?(bored)\b|^bored$/,()=>{say("Bored? Try a quick game in Teach me: they test what you know and earn coins.");replies([{label:"Open Teach me",run:goNav("teach")}])}],
    [/\b(i am|i feel|feeling|im) (so |really |well )?(tired|knackered|exhausted|shattered)\b/,()=>say("Sounds like a long day. Rest up. If you’ve got ten minutes later, a Teach me lesson counts towards your learning hours.")],
    [/\b(i am|im|i feel|feeling) (so |really )?(happy|good|great|buzzing)\b/,()=>say(pick(["Love that. Keep it going!","Brilliant. What’s been good?"]))],
    [/\b(i am|im) (stuck|lost|confused)\b|\bi (dont|do not) (get|understand) (it|this|that)\b/,()=>{say("No problem, let’s sort it. Tell me what you’re working on, or ask about a word, a KSB or a sum and I’ll explain it.")}],
    [/\b(i love you|love you evia|you are (great|the best|amazing|cool|brilliant|good|class)|good bot|well done evia)\b/,()=>say(pick(["Aw, thanks! You’re not bad yourself.","That’s made my day. Keep up the good work."]))],
    [/\b(you are|ur|this is) (rubbish|useless|stupid|dumb|bad|crap|pointless)\b|\byou (dont|do not) understand\b/,()=>{say("Sorry I missed the mark there. Try asking another way, with the key word first, like “bolster” or “hours this week”. I’ll keep learning.");try{const k="evia7-unanswered",q=JSON.parse(localStorage.getItem(k)||"[]");q.push({t:"[unhappy] "+(K().lastText||""),at:Date.now()});localStorage.setItem(k,JSON.stringify(q.slice(-50)))}catch(_){}}],
    [/^(bye|goodbye|see you|see ya|later|night|good night|cya|ttyl)\b/,()=>say(pick(["See you later! Good luck on site.","Bye for now. I’ll be here."]))],
    [/\bwhat (day|date) is it\b|\bwhats the date\b|\bwhat is the date\b/,()=>say("It’s <strong>"+day(Date.now())+"</strong>.")],
    [/\bwhat time is it\b/,()=>say("It’s <strong>"+new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})+"</strong>.")],
    [/\b(weather|football|score of the match|news)\b/,()=>say("I can’t look things up on the internet, sorry. I stick to your course, the trade and the maths.")]
  ];

  /* ---------- Follow-ups: carrying on from the last topic ---------- */
  const PRONOUN=/\b(it|its|that|them|they)\b/;
  function more(){
    const tp=B().topic&&B().topic();if(!tp)return false;
    if(tp.kind==="term"){
      const g=tp.g,les=B().findLesson&&B().findLesson(g[0]+" "+(g[1]||[]).join(" "));
      if(les){B().setTopic({kind:"lesson",name:les.l.title,les,shown:1,said:[les.snippet],g});say("More on <strong>"+esc(g[0])+"</strong>, from the lesson <strong>"+esc(les.l.title)+"</strong>:");say(esc(les.snippet.length>360?les.snippet.slice(0,357)+"…":les.snippet));
        replies([{label:"Open the lesson",primary:true,run:leave(()=>window.eviaTeach&&window.eviaTeach.play(les.l.id))},{label:"Tell me more",run:()=>{K().userSays("Tell me more");more()}}]);return true}
      say("That’s everything I’ve got on <strong>"+esc(g[0])+"</strong> for now. Ask your tutor too: they’ll have real examples.");return true;
    }
    if(tp.kind==="lesson"){
      const said=tp.said||[],steps=(tp.les.l.steps||[]).map(s=>String(s.say||s.why||"").replace(/<[^>]+>/g,"").trim()).filter(x=>x&&!said.includes(x));
      if(!steps.length){say("That’s the whole of <strong>"+esc(tp.les.l.title)+"</strong>. Open the lesson to try the games.");replies([{label:"Open the lesson",primary:true,run:leave(()=>window.eviaTeach&&window.eviaTeach.play(tp.les.l.id))}]);return true}
      const next=steps[0];said.push(next);tp.said=said;
      say(esc(next.length>360?next.slice(0,357)+"…":next));
      replies([{label:"Tell me more",primary:true,run:()=>{K().userSays("Tell me more");more()}},{label:"Open the lesson",run:leave(()=>window.eviaTeach&&window.eviaTeach.play(tp.les.l.id))}]);
      return true;
    }
    if(tp.kind==="ksb"){B().answer("which ksbs am i missing",true);return true}
    return false;
  }
  function followUp(t){
    const tp=B().topic&&B().topic();
    if(!tp||!tp.g||/\d/.test(t))return false;
    const g=tp.g,name=g[0];
    /* "and a jointer?", "what about lime?" */
    const ab=/^(and|what about|how about|whats? about)\s+(an? |the )?(.+)$/.exec(t);
    if(ab&&!/\d/.test(ab[3])&&B().findTerm(ab[3])){B().answer("what is "+ab[3],true);return true}
    /* "what's it used for?", "is it dangerous?" */
    if(PRONOUN.test(t)&&t.split(" ").length<=8&&!B().findTerm(t)){
      if(/\b(safe|dangerous|danger|hurt|harm|ppe|careful)\b/.test(t)){
        say(/\b(cut|sharp|chisel|saw|bolster|hammer|router|mixer|grinder|irritant|caustic|dust|harm)\w*/i.test(g[2]+" "+name)?"Yes, take care with a <strong>"+esc(name.toLowerCase())+"</strong>. "+esc(g[2])+" Wear the right PPE, keep the area tidy, and never rush.":"Here’s what to know about the <strong>"+esc(name.toLowerCase())+"</strong>: "+esc(g[2]));
        return true;
      }
      B().answer(t.replace(PRONOUN,name),true);return true;
    }
    return false;
  }

  /* ---------- Compare two things ---------- */
  function compare(t){
    const m=/\b(?:difference between|differences between|whats the difference between|compare)\s+(.+?)\s+(?:and|with|to|vs|versus)\s+(.+)$/.exec(t)||/^(?:what is |whats )?(.+?)\s+(?:vs|versus|or|compared to|compared with)\s+(.+)$/.exec(t);
    if(!m)return false;
    const a=B().findTerm&&B().findTerm(m[1]),b=B().findTerm&&B().findTerm(m[2]);
    if(!a||!b||a===b)return false;
    say("Here’s how <strong>"+esc(a[0])+"</strong> and <strong>"+esc(b[0])+"</strong> compare:");
    K().widget('<div class="br-card mi-compare">'+[a,b].map(g=>'<div><strong>'+esc(g[0])+'</strong><p class="br-def">'+esc(g[2])+'</p></div>').join("")+'</div>');
    B().setTopic({kind:"term",name:b[0],g:b});
    return true;
  }

  /* ---------- Search: everything Evia knows, ranked ---------- */
  let INDEX=null;
  const toks=s=>{const S=B().STOP||new Set(),st=B().stem||(w=>w);return String(s||"").toLowerCase().replace(/[’']/g,"").split(/[^a-z0-9]+/).filter(w=>w.length>2&&!S.has(w)).map(st)};
  function index(){
    if(INDEX)return INDEX;
    const docs=[];
    try{(B().glossary?B().glossary():[]).forEach(g=>docs.push({kind:"term",title:g[0],head:toks(g[0]+" "+(g[1]||[]).join(" ")),body:toks(g[2]),run:()=>B().answer("what is "+g[0],true)}))}catch(_){}
    FAQ.forEach(f=>docs.push({kind:"faq",title:f.q[0].replace(/^\w/,c=>c.toUpperCase())+"?",head:toks(f.q.join(" ")),phrases:f.q.map(toks),body:toks(f.a),f}));
    try{(B().lessons?B().lessons():[]).forEach(({l,unit})=>docs.push({kind:"lesson",title:l.title,head:toks(l.title+" "+(l.blurb||"")),body:toks((l.steps||[]).map(s=>[s.title,s.say,s.why,s.q].join(" ")).join(" ")),l,unit}))}catch(_){}
    try{const d=data();d.u.forEach((u,i)=>{docs.push({kind:"unit",title:u[0],head:toks(u[0]),body:toks(u[1].map(k=>String(k).split("|").slice(1).join(" ")).join(" ")),i});
      u[1].forEach(k=>{const [c,...r]=String(k).split("|");docs.push({kind:"ksb",title:c.trim()+": "+r.join(" ").trim().slice(0,60),head:toks(c),body:toks(r.join(" ")),code:c.trim()})})})}catch(_){}
    const seen=new Set();const uniq=docs.filter(d=>{const k=d.kind+"|"+d.title;if(seen.has(k))return false;seen.add(k);return true});
    const df=new Map();uniq.forEach(d=>new Set(d.head.concat(d.body)).forEach(w=>df.set(w,(df.get(w)||0)+1)));
    const avg=uniq.reduce((n,d)=>n+d.body.length,0)/Math.max(1,uniq.length);
    return INDEX={docs:uniq,df,avg,N:uniq.length};
  }
  function search(text,limit){
    const I=index(),q=[...new Set(toks(text))];if(!q.length)return [];
    const idf=w=>Math.log(1+(I.N-(I.df.get(w)||0)+.5)/((I.df.get(w)||0)+.5));
    return I.docs.map(d=>{
      let s=0;const len=d.body.length;
      /* The title counts once per word; for help, the phrasing that fits best (all of "what is epa" beats part of "can i resit epa"). */
      const headScore=ph=>q.filter(w=>ph.includes(w)).reduce((n,w)=>n+idf(w),0)*Math.sqrt(q.filter(w=>ph.includes(w)).length/Math.max(1,new Set(ph).size));
      s+=3*(d.phrases?Math.max(...d.phrases.map(headScore)):headScore(d.head));
      q.forEach(w=>{const bf=d.body.filter(x=>x===w).length;if(bf)s+=idf(w)*(bf*2.2)/(bf+1.2*(.25+.75*len/I.avg))});
      const hit=q.filter(w=>d.head.includes(w)||d.body.includes(w)).length;
      s*=.5+.5*hit/q.length;
      if(d.kind==="ksb")s*=.7;
      return {d,s,cover:hit/q.length};
    }).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,limit||3);
  }
  function show(d){
    if(d.kind==="faq"){say(esc(d.f.a));if(d.f.go)replies([{label:d.f.go[0],primary:true,run:d.f.go[1]}]);return}
    if(d.kind==="term"){d.run();return}
    if(d.kind==="ksb"){B().answer(d.code,true);return}
    if(d.kind==="unit"){B().answer("evidence for "+d.title,true);return}
    if(d.kind==="lesson"){
      const steps=(d.l.steps||[]).map(s=>String(s.say||s.why||"").replace(/<[^>]+>/g,"").trim()).filter(Boolean),snip=steps[0]||d.l.blurb||"";
      B().setTopic({kind:"lesson",name:d.l.title,les:{l:d.l,unit:d.unit,snippet:snip},shown:1,said:[snip]});
      say("I teach that in <strong>"+esc(d.l.title)+"</strong> ("+esc(d.unit)+"):");
      K().widget('<div class="br-card br-lesson"><p class="br-def">'+esc(snip.length>320?snip.slice(0,317)+"…":snip)+'</p></div>');
      replies([{label:"Open the lesson",primary:true,run:leave(()=>window.eviaTeach&&window.eviaTeach.play(d.l.id))},{label:"Tell me more",run:()=>{K().userSays("Tell me more");more()}}]);
    }
  }
  /* Evia's brain had nothing: the closest matches, answered straight away when one clearly fits. */
  function fallback(text){
    const r=search(read(text),4);
    if(!r.length)return false;
    const [a,b]=r;
    if(a.s>=6&&a.cover>=.6&&(!b||a.s>=b.s*1.35)){say(pick(["I think this is what you’re after.","Here’s the closest I’ve got."]));show(a.d);return true}
    if(a.s<2.5||a.cover<.5)return false;
    say("I’m not sure I’ve understood. Did you mean one of these?");
    replies(r.slice(0,3).map(x=>({label:x.d.title.length>48?x.d.title.slice(0,46)+"…":x.d.title,run:()=>show(x.d)})));
    try{const k="evia7-unanswered",q=JSON.parse(localStorage.getItem(k)||"[]");q.push({t:String(text).slice(0,200),at:Date.now(),near:a.d.title});localStorage.setItem(k,JSON.stringify(q.slice(-50)))}catch(_){}
    return true;
  }
  function faq(t){
    const r=search(t,2);if(!r.length||r[0].d.kind!=="faq")return false;
    const [a,b]=r,qt=toks(t),head=a.d.head,hit=qt.filter(w=>head.includes(w)).length;
    if(hit>=Math.min(2,qt.length)&&hit>=Math.ceil(qt.length*.6)&&(!b||a.s>=b.s*1.2)){show(a.d);return true}
    return false;
  }

  /* ---------- Doing things: started straight away, the way an assistant would ---------- */
  function doIt(t){
    if(!DO.test(t))return false;const c=C();
    if(/\b(log|record|add|enter)\b/.test(t)&&c.hours){c.hours();return true}
    if(/\bcheck\b/.test(t)&&c.evidenceCheck){c.evidenceCheck();return true}
    if(/\bready\b/.test(t)&&c.prepare){c.prepare();return true}
    if(/\btargets\b/.test(t)&&c.targets){c.targets();return true}
    if(/\b(confidence|rate)\b/.test(t)&&c.confidence){c.confidence();return true}
    return false;
  }
  /* ---------- Putting it together ---------- */
  const DO=/\b(log|record|add|enter)\b.*\b(hours?|learning|training|time)\b|\bcheck (my )?(evidence|write ?ups?)\b|\b(get|make) me ready\b|\bready for (my )?review\b|\b(show|see) (me )?my targets\b|\b(confidence check|rate my skills)\b/;
  function one(text){
    const t=read(text).replace(/[?!.]+$/,"").trim();
    if(!t)return;
    const brain=B();
    if(brain.isWorry&&brain.isWorry(text))return brain.worry();
    if(/^(tell me more|more|go on|and|explain( more| that| it)?|more info|keep going|what else|carry on|continue|why|how come|example|give me an example)$/.test(t)&&more())return;
    for(const [test,fn] of ME){if(test(t)&&fn(t)!==false)return}
    if(compare(t))return;
    for(const [re,fn] of TALK){if(re.test(t))return fn(t)}
    if(followUp(t))return;
    /* Asking to do something goes straight to doing it, not to the help about it. */
    if(doIt(t))return;
    if(faq(t))return;
    brain.answer?brain.answer(t):K().say("I’m still waking up. Try again in a moment.");
  }
  /* Two questions in one message are answered in turn. */
  function answer(text){
    try{K().lastText=text}catch(_){}
    const parts=String(text||"").split(/\?\s+(?=\S)|\s+(?:and also|also,)\s+/i).map(s=>s.trim()).filter(s=>s.length>1).slice(0,3);
    (parts.length?parts:[text]).forEach(one);
  }
  window.eviaMind={answer,fallback,read,search};
})();
