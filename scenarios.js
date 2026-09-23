/* Evia7 Real-life scenarios: safeguarding, Prevent, British values and equality, diversity & inclusion taught as
   short "what would you do?" stories from site and college. Content should be reviewed by the provider's DSL.
   Progress is stored in evia7-scenarios as {scenarioId:{at, best}}. */
(function(){
  const KEY="evia7-scenarios";
  const escHtml=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const icon=d=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>';

  const TOPICS=[
    {id:"safeguarding",title:"Safeguarding",blurb:"Spotting when someone isn’t safe, and what to do about it",
     icon:'<path d="M12 3.5 5 6v5.5c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6l-7-2.5Z"/><path d="m9 12 2 2 4-4"/>',
     scenarios:[
      {id:"sg-bruises",title:"The bruises",
       story:"Kyle, 17, has turned up to site with bruises on his arms three times this month. He says he’s just clumsy. Today he flinched when the supervisor raised his voice, and he asked if he could stay late because he doesn’t want to go home.",
       options:[
        {t:"Leave it. He said he’s clumsy, and it’s none of your business.",why:"Repeated injuries, fear and not wanting to go home can all be signs of abuse. If everyone says nothing, nobody helps."},
        {t:"Ask him quietly if he’s OK, listen without pushing, then tell your tutor or safeguarding lead.",best:true,why:"You don’t have to work out what’s happening or prove anything. Listen, then pass it on to someone trained to help."},
        {t:"Go round to his house to find out what’s going on.",why:"That could make things worse and put you both at risk. Leave it to the safeguarding lead."}],
       remember:"Spot it, listen, pass it on. You never need proof to share a worry."},
      {id:"sg-secret",title:"Keep it a secret",
       story:"Your mate pulls you aside at break: “I’ll tell you something, but you have to promise not to tell anyone.” You can tell it’s serious.",
       options:[
        {t:"Promise. They trust you, so you’ll keep it.",why:"If they tell you they’re being hurt or are at risk, you’ll need to get help, and breaking a promise then feels worse for both of you."},
        {t:"Say you’ll keep it between you unless you think they’re at risk, and then you’d only tell someone who can help.",best:true,why:"That’s honest. They can decide what to tell you, and they know where they stand."},
        {t:"Tell them you’d rather not know.",why:"They picked you because they trust you. Pushing them away might mean they tell no one."}],
       remember:"Never promise to keep a secret. Be honest that you’d share it with someone who can help."},
      {id:"sg-lifts",title:"The lifts home",
       story:"Ellie, 16, has just started on site. An older worker has been messaging her on Snapchat, giving her lifts and buying her food. He’s told her to keep their chats “just between us”.",
       options:[
        {t:"It’s nice he’s looking out for her. Stay out of it.",why:"Gifts, special attention and asking for secrecy are common signs of grooming. Being friendly in public doesn’t make it safe."},
        {t:"Have a word with the worker and tell him to back off.",why:"He may deny it and delete the messages. It’s safer to let people trained in this handle it."},
        {t:"Tell your tutor or safeguarding lead what you’ve noticed.",best:true,why:"An adult asking a young person to keep things secret is a big warning sign. Reporting it protects Ellie, even if it turns out to be nothing."}],
       remember:"Secrets, gifts and “special” attention from an older person are warning signs of grooming. Report it."},
      {id:"sg-chat",title:"The group chat",
       story:"Someone shares a nude photo of a lad from your college course in the group chat. People are laughing and forwarding it on.",
       options:[
        {t:"Don’t forward it or save it, and tell your tutor or safeguarding lead.",best:true,why:"If the person in the photo is under 18, sharing it is illegal, even between people the same age. It can also do serious harm to them."},
        {t:"Forward it to him so he knows it’s going round.",why:"Forwarding the image, even to help, is still sharing it. Tell him you’re getting help instead."},
        {t:"Leave the chat and forget about it.",why:"Leaving is a good start, but someone is being harmed. Telling a trusted adult can get it taken down."}],
       remember:"Never share or save a nude image of anyone under 18, not even as “evidence”. Report it."}
     ]},
    {id:"prevent",title:"Prevent",blurb:"Recognising when someone is being drawn into extremism",
     icon:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5M12 16h.01"/>',
     scenarios:[
      {id:"pv-videos",title:"The videos",
       story:"A workmate keeps showing you videos that blame one group of people for everything wrong with the country. Lately he’s been saying “someone needs to do something about them”, and he’s started talking about violence.",
       options:[
        {t:"Ignore it. Everyone’s entitled to their opinion.",why:"Having views is fine. Talking about violence against a group isn’t, and it can be a sign someone is being drawn in."},
        {t:"Tell your tutor or safeguarding lead that you’re worried about him.",best:true,why:"Prevent is about support, not getting people into trouble. Most people who are referred get help like mentoring, not police action."},
        {t:"Have a big argument with him in front of everyone.",why:"Public arguments usually push people further into their views. Let someone trained help."}],
       remember:"Prevent is about safeguarding people before they’re drawn into extremism. If you’re worried, tell your safeguarding lead."},
      {id:"pv-gaming",title:"The gaming invite",
       story:"In an online game, a player you’ve chatted with for months invites you to a private server “for people who get it”. They start sending memes about a “race war” and say the media is lying to you.",
       options:[
        {t:"Join. It’s only memes.",why:"Extremist groups often use jokes, memes and games to draw young people in, bit by bit."},
        {t:"Don’t join. Block and report them on the platform, and tell your safeguarding lead or tutor.",best:true,why:"Reporting protects you and others. You can also report online terrorist content through the government’s ACT (Action Counters Terrorism) website."},
        {t:"Argue with them to prove them wrong.",why:"Recruiters are skilled at this, and it keeps you talking to them. Walk away and report it."}],
       remember:"Radicalisation often starts online, with someone who seems friendly. Block, report and tell someone."},
      {id:"pv-myth",title:"Myth or fact?",
       story:"A mate says: “Prevent is only about one religion.” Are they right?",
       options:[
        {t:"Yes, it’s only about religious extremism.",why:"Not true. Prevent covers every kind of extremism."},
        {t:"No. It covers all kinds of extremism, including extreme right-wing, Islamist and other ideologies.",best:true,why:"Prevent covers any ideology used to justify violence. In recent years, extreme right-wing concerns have made up a large share of referrals."},
        {t:"It’s only about stopping bombs.",why:"Prevent is about stopping people being drawn into extremism in the first place, long before anything like that."}],
       remember:"Prevent covers every type of extremism. It’s about spotting when someone’s being drawn in and getting them support."}
     ]},
    {id:"values",title:"British values",blurb:"Democracy, the rule of law, individual liberty, respect and tolerance",
     icon:'<path d="M5 20V4M5 5h11l-2 3.5 2 3.5H5"/>',
     scenarios:[
      {id:"bv-vote",title:"Having a say",value:"Democracy",
       story:"Your site team has to decide whether to start and finish an hour early on Fridays. Some want to, some don’t.",
       options:[
        {t:"The loudest people decide.",why:"That isn’t fair on the quieter people, who are just as affected."},
        {t:"Everyone gets a say, you vote, and everyone accepts the result, even if they voted the other way.",best:true,why:"That’s democracy: a fair say, a majority decision and respect for the result. It’s how we choose MPs and councillors too."},
        {t:"Whoever’s been there longest decides.",why:"Experience counts, but everyone affected should get a say."}],
       remember:"Democracy: everyone has a voice, and we respect decisions made fairly, even when we disagree."},
      {id:"bv-law",title:"Skip the check",value:"The rule of law",
       story:"It’s late and the supervisor says: “Don’t bother checking the scaffold tag, it was fine yesterday. Just crack on.”",
       options:[
        {t:"Crack on. The supervisor’s in charge.",why:"Health and safety law applies to everyone on site, supervisors included. The tag shows whether the scaffold has been inspected and is safe to use."},
        {t:"Check the tag anyway. If it’s out of date or says unsafe, don’t go up, and explain why.",best:true,why:"Laws like the Health and Safety at Work Act protect everyone. Following them isn’t being awkward: it keeps people alive."},
        {t:"Refuse to do any more work today.",why:"You can refuse unsafe work, but check first and explain calmly. There may be a safe way to carry on."}],
       remember:"The rule of law: rules apply to everyone equally, and they’re there to protect people."},
      {id:"bv-liberty",title:"Your choice",value:"Individual liberty",
       story:"At the end-of-job barbecue, a new apprentice turns down a beer and doesn’t eat some of the food. A couple of people start pressuring them about it.",
       options:[
        {t:"Join in. It’s only banter.",why:"Pressure to drink or eat something is not banter to the person on the receiving end."},
        {t:"Back them up: what they eat and drink is their choice.",best:true,why:"Individual liberty means people are free to make their own choices, as long as they’re within the law and don’t harm others."},
        {t:"Stay quiet and let them sort it out.",why:"They might feel isolated. A few words of support make a big difference."}],
       remember:"Individual liberty: people can make their own choices, and we respect them."},
      {id:"bv-respect",title:"Prayer time",value:"Mutual respect and tolerance",
       story:"A colleague asks the supervisor if they can use the site office for a few minutes at lunchtime to pray. Someone starts making jokes about it.",
       options:[
        {t:"Laugh along. It’s harmless.",why:"Jokes about someone’s faith can make them feel unwelcome, and they can be harassment."},
        {t:"Tell the joker it’s out of order, and if it carries on, raise it with the supervisor.",best:true,why:"Mutual respect and tolerance means people can follow their faith, or no faith, without being mocked."},
        {t:"Say they should pray in their own time.",why:"Lunch is their own time. A small request like this is easy to support."}],
       remember:"Respect and tolerance: you don’t have to share someone’s beliefs to respect their right to hold them."}
     ]},
    {id:"edi",title:"Equality and inclusion",blurb:"Treating people fairly, and knowing your rights",
     icon:'<circle cx="8.5" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3.5 19c.5-3 2.6-5 5-5s4.5 2 5 5M13.5 18.5c.4-2.3 1.6-3.8 3-3.8 1.8 0 3 1.5 3.5 3.8"/>',
     scenarios:[
      {id:"ed-banter",title:"Just banter?",
       story:"Priya, a new bricklayer, joins the gang. A couple of the lads keep saying she should “be in the office” and make comments about her body. They say it’s just banter.",
       options:[
        {t:"It’s banter. She needs to toughen up.",why:"If comments are unwanted and leave someone feeling intimidated, degraded or humiliated, it can be harassment under the Equality Act 2010, whatever it’s called."},
        {t:"Tell them to knock it off, check Priya’s OK, and report it if it carries on.",best:true,why:"Speaking up changes site culture. Priya can report it to her employer, and so can you."},
        {t:"Stay out of it. It’s not your problem.",why:"Everyone on site shares responsibility for how people are treated."}],
       remember:"It stops being banter when the other person doesn’t find it funny. Harassment is against the law."},
      {id:"ed-dyslexia",title:"The paperwork",
       story:"Jordan is dyslexic. They’re great on the tools but struggle to read long method statements quickly, and they’re worried people will think they’re slow.",
       options:[
        {t:"Tell Jordan to try harder.",why:"That doesn’t solve anything, and it could make Jordan hide the problem."},
        {t:"Encourage Jordan to tell the supervisor or tutor, so they can make adjustments like talking the method statement through or giving extra time.",best:true,why:"Employers must make reasonable adjustments for disabled workers, and dyslexia can count as a disability under the Equality Act 2010."},
        {t:"Quietly read everything for Jordan from now on.",why:"Kind, but it isn’t a long-term fix. Proper adjustments help Jordan every day."}],
       remember:"Reasonable adjustments remove barriers so everyone can do their job well."},
      {id:"ed-age",title:"Too old to learn?",
       story:"Dave, 58, asks to go on the laser level training. The site manager says: “No point, you’re too old to learn new tech.”",
       options:[
        {t:"Fair enough. Training’s for the young ones.",why:"Refusing someone training because of their age can be age discrimination."},
        {t:"That could be age discrimination. Dave should be judged on his ability, not his age.",best:true,why:"Age is one of the nine protected characteristics under the Equality Act 2010. Everyone should get a fair chance at training."},
        {t:"Offer to go on the training instead of Dave.",why:"That doesn’t fix the unfairness to Dave."}],
       remember:"The nine protected characteristics are age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation."}
     ]}
  ];
  const ALL=TOPICS.flatMap(t=>t.scenarios.map(s=>Object.assign({topic:t},s)));

  const done=()=>readJson(KEY,{});
  function progress(){
    const d=done(),ids=Object.keys(d).filter(id=>ALL.some(s=>s.id===id));
    const last=ids.reduce((n,id)=>Math.max(n,d[id].at||0),0)||null;
    return {done:ids.length,total:ALL.length,last,
      topics:TOPICS.map(t=>({id:t.id,title:t.title,done:t.scenarios.filter(s=>d[s.id]).length,total:t.scenarios.length})),
      topicsDone:TOPICS.filter(t=>t.scenarios.every(s=>d[s.id])).length};
  }
  function nextScenario(){const d=done();return ALL.find(s=>!d[s.id])||null}

  /* ---------- Sheet ---------- */
  function closeSheet(){const r=document.getElementById("modal-root");if(r)r.innerHTML=""}
  function sheet(kicker,title,body){
    const root=document.getElementById("modal-root");
    root.innerHTML='<div class="overlay"><section class="sheet pr-sheet sc-sheet" role="dialog" aria-modal="true" aria-labelledby="sc-title"><div class="sheet-head"><div><div class="chat-kicker">'+kicker+'</div><h2 id="sc-title">'+title+'</h2></div><button class="close" id="sc-close" type="button" aria-label="Close">×</button></div><div class="pr-body">'+body+'</div></section></div>';
    document.getElementById("sc-close").onclick=closeSheet;
    root.querySelector(".overlay").addEventListener("click",e=>{if(e.target.classList.contains("overlay"))closeSheet()});
    const s=root.querySelector(".sc-sheet");s.scrollTop=0;
    const h=document.getElementById("sc-title");h.setAttribute("tabindex","-1");h.focus({preventScroll:true});
    return s;
  }
  function contactsHtml(topicId){
    const P=window.EVIA_PROVIDER||{},dsl=P.safeguarding||{},dep=P.deputy||{};
    const tel=n=>'<a href="tel:'+escHtml(String(n).replace(/[^\d+]/g,""))+'">'+escHtml(n)+'</a>';
    const person=(role,x)=>x&&x.name?'<li><strong>'+escHtml(role)+': '+escHtml(x.name)+'</strong>'+(x.phone?'<span>'+tel(x.phone)+'</span>':"")+(x.email?'<span><a href="mailto:'+escHtml(x.email)+'">'+escHtml(x.email)+'</a></span>':"")+(x.hours?'<span>'+escHtml(x.hours)+'</span>':"")+'</li>':"";
    const lead=person((P.name?P.name+" s":"S")+"afeguarding lead",dsl)+person("Deputy safeguarding lead",dep);
    return '<div class="sc-contacts"><h3 class="pr-h">Who to talk to</h3><ul>'+
      (lead||'<li><strong>Your safeguarding lead</strong><span>Every college and training provider has one. Ask your tutor who yours is.</span></li>')+
      '<li><strong>Your tutor or supervisor</strong><span>They’ll know what to do next.</span></li>'+
      '<li><strong>In an emergency</strong><span>Call '+tel("999")+'</span></li>'+
      (topicId==="prevent"?'<li><strong>Anti-Terrorist Hotline</strong><span>'+tel("0800 789 321")+' (confidential)</span></li>':"")+
      '<li><strong>Childline (under 19)</strong><span>'+tel("0800 1111")+'</span></li>'+
      '<li><strong>Samaritans (any time)</strong><span>'+tel("116 123")+'</span></li>'+
      '<li><strong>Shout</strong><span>Text SHOUT to 85258</span></li>'+
    '</ul></div>';
  }
  function openTopics(){
    const p=progress();
    const body='<p class="pr-intro">Short situations from site and college. Pick what you’d do, and Evia explains why. There are no marks: it’s about knowing what to do if it happens for real.</p>'+
      '<div class="pr-list">'+TOPICS.map((t,i)=>{const tp=p.topics[i],complete=tp.done===tp.total;return '<button type="button" class="pr-row" data-topic="'+t.id+'"><span class="pr-icon">'+icon(t.icon)+'</span><span class="pr-copy"><strong>'+escHtml(t.title)+(complete?' <em class="sc-tick">Done</em>':"")+'</strong><small>'+escHtml(t.blurb)+'</small><small class="pr-sum">'+tp.done+' of '+tp.total+' scenarios</small></span></button>'}).join("")+'</div>'+
      contactsHtml();
    const el=sheet("REAL-LIFE SCENARIOS","What would you do?",body);
    el.querySelectorAll("[data-topic]").forEach(b=>b.onclick=()=>{const t=TOPICS.find(x=>x.id===b.dataset.topic),d=done();const first=t.scenarios.findIndex(s=>!d[s.id]);play(t,first<0?0:first)});
  }
  function play(topic,index){
    const sc=topic.scenarios[index];
    const order=sc.options.map((o,i)=>i).sort(()=>Math.random()-.5); /* so the best answer isn't always in the same place */
    const body=(sc.value?'<span class="sc-value">'+escHtml(sc.value)+'</span>':"")+
      '<div class="sc-story"><p>'+escHtml(sc.story)+'</p></div>'+
      '<h3 class="pr-h">What would you do?</h3>'+
      '<div class="sc-options" role="list">'+order.map((i,pos)=>'<button type="button" class="sc-option" data-opt="'+i+'" role="listitem"><span class="sc-letter" aria-hidden="true">'+"ABC"[pos]+'</span><span class="sc-text">'+escHtml(sc.options[i].t)+'</span></button>').join("")+'</div>'+
      '<div id="sc-after"></div>';
    const el=sheet(escHtml(topic.title.toUpperCase())+" · "+(index+1)+" OF "+topic.scenarios.length,escHtml(sc.title),body);
    el.querySelectorAll("[data-opt]").forEach(b=>b.onclick=()=>{
      const pickedIdx=+b.dataset.opt,picked=sc.options[pickedIdx];
      el.querySelectorAll("[data-opt]").forEach(x=>{
        const o=sc.options[+x.dataset.opt];x.disabled=true;
        x.classList.add(o.best?"best":"other");if(x===b)x.classList.add("picked");
        x.insertAdjacentHTML("beforeend",'<span class="sc-why"><strong>'+(o.best?"Best choice. ":x===b?"Your choice. ":"")+'</strong>'+escHtml(o.why)+'</span>');
      });
      const d=done();d[sc.id]={at:Date.now(),best:!!picked.best};localStorage.setItem(KEY,JSON.stringify(d));
      if(picked.best&&window.eviaMood)window.eviaMood("happy");
      const last=index===topic.scenarios.length-1;
      el.querySelector("#sc-after").innerHTML='<div class="pr-banner'+(picked.best?" good":"")+'" role="status"><strong>'+(picked.best?"Spot on.":"Good to think about.")+'</strong> '+escHtml(sc.remember)+'</div>'+
        '<div class="pr-actions"><button type="button" class="primary" id="sc-next">'+(last?"Finish":"Next scenario")+'</button></div>';
      el.querySelector("#sc-next").onclick=()=>last?finish(topic):play(topic,index+1);
      setTimeout(()=>{const a=el.querySelector("#sc-after");if(a)a.scrollIntoView({block:"nearest",behavior:window.eviaAccessibility&&window.eviaAccessibility.reducedMotion()?"auto":"smooth"})},60);
    });
  }
  function finish(topic){
    const d=done(),best=topic.scenarios.filter(s=>d[s.id]&&d[s.id].best).length;
    const body='<div class="pr-banner good"><strong>'+escHtml(topic.title)+' complete.</strong> You picked the best option in '+best+' of '+topic.scenarios.length+'. You can replay any topic whenever you like.</div>'+
      '<h3 class="pr-h">Remember</h3><ul class="sc-remember">'+topic.scenarios.map(s=>'<li>'+escHtml(s.remember)+'</li>').join("")+'</ul>'+
      contactsHtml(topic.id)+
      '<div class="pr-actions"><button type="button" class="secondary" id="sc-topics">Other topics</button><button type="button" class="primary" id="sc-done">Done</button></div>';
    const el=sheet("REAL-LIFE SCENARIOS","Nice work",body);
    if(window.eviaMood)window.eviaMood("happy");
    el.querySelector("#sc-topics").onclick=openTopics;
    el.querySelector("#sc-done").onclick=()=>{closeSheet();if(typeof screen!=="undefined"&&(screen==="home"||screen==="progress"))render()};
  }
  function openNext(){
    const n=nextScenario();
    if(!n){openTopics();return}
    play(n.topic,n.topic.scenarios.findIndex(s=>s.id===n.id));
  }

  window.eviaScenarios={openTopics,openNext,progress,topics:TOPICS};
})();
