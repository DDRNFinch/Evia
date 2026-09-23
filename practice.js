/* Evia7 Practice: the tests hub (EPA mocks, discussion, maths, English) and the confidence self-assessment.
   Tests still run in the chat (review.js); this file chooses them and shows what's due. */
(function(){
  const DAY=864e5;
  const escHtml=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const RATINGS=["Need more training","Know the basics","Quite confident","I’ve mastered this"];
  const icon=d=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>';
  const ICONS={
    epa:'<path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15l-3-1.8-3 1.8-3-1.8-3 1.8V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M9 8.5h6M9 12h6"/>',
    quick:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/>',
    discussion:'<path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 16H10l-4.5 3.5V16a2.5 2.5 0 0 1-1-2Z"/>',
    maths:'<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h1M12 12h1M15 12h.5M8.5 16h1M12 16h1M15 16h.5"/>',
    english:'<path d="M5 19.5V6a2.5 2.5 0 0 1 2.5-2.5H19v13H7.5A2.5 2.5 0 0 0 5 19Zm0 0A2.5 2.5 0 0 0 7.5 22H19"/>',
    confidence:'<path d="M4 20h16"/><rect x="5.5" y="12" width="3" height="6" rx="1"/><rect x="10.5" y="8" width="3" height="10" rx="1"/><rect x="15.5" y="4" width="3" height="14" rx="1"/>'
  };
  const pctOf=t=>typeof t.pct==="number"?t.pct:(t.total?Math.round((t.score||0)/t.total*100):0);
  const ago=t=>window.eviaStats?window.eviaStats.ago(t).toLowerCase():"";
  function testsOf(type,filter){return readJson("evia7-test-results",[]).filter(t=>t&&t.course===course&&t.type===type&&(!filter||filter(t)))}
  function summary(type,filter){
    const list=testsOf(type,filter);if(!list.length)return {count:0,text:"Not tried yet"};
    const last=list[list.length-1],best=Math.max(...list.map(pctOf));
    return {count:list.length,last:Date.parse(last.savedAt),text:"Last "+pctOf(last)+"% "+ago(Date.parse(last.savedAt))+" · best "+best+"%"};
  }
  function profile(){return readJson("evia7-profile",{})}
  function timePct(){try{return window.eviaCoach.analyse().timePct}catch(_){return null}}
  const daysAgo=t=>t==null?Infinity:(Date.now()-t)/DAY;
  function epaDue(){const tp=timePct();if(tp==null||tp<75)return false;const t=testsOf("epa");const last=t.length?Date.parse(t[t.length-1].savedAt):null;return daysAgo(last)>(tp>=90?7:14)}

  function closeSheet(){const r=document.getElementById("modal-root");if(r)r.innerHTML=""}
  function sheet(kicker,title,body,cls){
    const root=document.getElementById("modal-root");
    root.innerHTML='<div class="overlay"><section class="sheet pr-sheet '+(cls||"")+'" role="dialog" aria-modal="true" aria-labelledby="pr-title"><div class="sheet-head"><div><div class="chat-kicker">'+kicker+'</div><h2 id="pr-title">'+title+'</h2></div><button class="close" id="pr-close" type="button" aria-label="Close">×</button></div><div class="pr-body">'+body+'</div></section></div>';
    document.getElementById("pr-close").onclick=closeSheet;
    root.querySelector(".overlay").addEventListener("click",e=>{if(e.target.classList.contains("overlay"))closeSheet()});
    const h=document.getElementById("pr-title");if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}
    return root.querySelector(".pr-sheet");
  }

  /* ---------- Tests hub ---------- */
  function openHub(){
    const p=profile(),tp=timePct(),conf=confidenceState();
    const rows=[];
    const row=(id,iconKey,title,desc,sum,due)=>rows.push('<button type="button" class="pr-row" data-pr="'+id+'"><span class="pr-icon">'+icon(ICONS[iconKey])+'</span><span class="pr-copy"><strong>'+title+(due?' <em class="pr-due">Due</em>':"")+'</strong><small>'+desc+'</small><small class="pr-sum">'+escHtml(sum)+'</small></span></button>');
    row("epa-full","epa","EPA full mock","20 questions from across your KSBs",summary("epa",t=>t.full||t.total>=20).text,epaDue());
    row("epa","quick","EPA quick quiz","5 questions · about 3 minutes",summary("epa",t=>!(t.full||t.total>=20)).text,false);
    row("discussion","discussion","Professional discussion","5 questions · type your answers",summary("discussion").text,false);
    if(p.mathsEnabled)row("maths","maths","Maths","5 questions with worked answers",summary("maths").text,daysAgo(summary("maths").last)>14);
    if(p.englishEnabled)row("english","english","English","5 questions with worked answers",summary("english").text,daysAgo(summary("english").last)>14);
    const banner=tp!=null&&tp>=75
      ?'<div class="pr-banner"><strong>You’re '+tp+'% through your course.</strong> Time to get ready for your end-point assessment. Try a full EPA mock every '+(tp>=90?"week":"couple of weeks")+'.</div>'
      :'<p class="pr-note">'+(tp!=null?"You’re "+tp+"% through your course. Evia will remind you about EPA mocks from 75%.":"Add your course dates in Profile and Evia will remind you when it’s time for EPA mocks.")+'</p>';
    const body=banner+
      '<h3 class="pr-h">Tests</h3><div class="pr-list">'+rows.join("")+'</div>'+
      (!p.mathsEnabled&&!p.englishEnabled?'<p class="pr-note">Maths and English practice can be switched on in your Profile.</p>':"")+
      '<h3 class="pr-h">Your skills</h3><div class="pr-list"><button type="button" class="pr-row" data-pr="confidence"><span class="pr-icon">'+icon(ICONS.confidence)+'</span><span class="pr-copy"><strong>Confidence check'+(daysAgo(conf.last)>30?' <em class="pr-due">Due</em>':"")+'</strong><small>Rate yourself on each practical skill</small><small class="pr-sum">'+escHtml(conf.last?conf.practise.length+" need more training · rated "+ago(conf.last):"Not done yet")+'</small></span></button></div>';
    const el=sheet("PRACTICE","Tests and checks",body);
    el.querySelectorAll("[data-pr]").forEach(b=>b.onclick=()=>{
      const id=b.dataset.pr;closeSheet();
      if(id==="confidence"){openConfidence();return}
      const label=b.querySelector("strong").childNodes[0].textContent.trim();
      startTest(id==="epa-full"?"epa":id,id==="epa-full"?20:5,label);
    });
  }
  function startTest(type,count,label){
    if(window.eviaStartTest)window.eviaStartTest(type,count,label);
    else{window.chat();setTimeout(()=>window.eviaTestMe&&window.eviaTestMe({type,count}),60)}
  }

  /* ---------- Confidence self-assessment ---------- */
  /* Every save stores the full picture: skills not re-rated keep their last rating, so the latest record is always complete. */
  function skills(){try{return (typeof confidenceQuestions==="function"?confidenceQuestions():[]).map(q=>({area:q[0],question:q[1],desc:String(q[1]).replace(/^How confident are you (?:at|with|in) /i,"").replace(/\?$/,"").replace(/^./,c=>c.toUpperCase())}))}catch(_){return[]}}
  function history(){return readJson("evia7-confidence",[]).filter(x=>x&&x.course===course&&Array.isArray(x.scores)&&x.scores.length)}
  function latestMap(){const m=new Map();history().forEach(s=>s.scores.forEach(sc=>m.set(sc.area,sc)));return m}
  function confidenceState(){
    const h=history(),last=h[h.length-1],m=latestMap();
    return {last:last?Date.parse(last.savedAt||last.startedAt)||null:null,practise:[...m.values()].filter(x=>x.score<=2).map(x=>x.area)};
  }
  function openConfidence(){
    const list=skills();
    if(!list.length){sheet("SKILLS","Confidence check",'<p class="pr-note">There are no practical skills loaded for this course yet.</p>');return}
    const prev=latestMap(),picked=new Map();
    const body='<p class="pr-intro">Rate yourself honestly on each practical skill. Low ratings aren’t bad: they show you and your tutor what to practise. High ratings mean you can keep improving on the job.</p>'+
      '<ol class="pr-skills">'+list.map((s,i)=>{
        const p=prev.get(s.area);
        return '<li class="pr-skill" data-skill="'+i+'"><div class="pr-skill-head"><strong id="pr-skill-'+i+'">'+escHtml(s.area)+'</strong>'+(p?'<small>Last time: '+escHtml(RATINGS[p.score-1]||"")+'</small>':"")+'</div>'+
          '<p>'+escHtml(s.desc)+'</p>'+
          '<div class="pr-scale" role="radiogroup" aria-labelledby="pr-skill-'+i+'">'+RATINGS.map((r,n)=>'<button type="button" role="radio" aria-checked="false" data-rate="'+(n+1)+'" class="lvl'+(n+1)+'"><span class="pr-dots" aria-hidden="true">'+[1,2,3,4].map(d=>'<i class="'+(d<=n+1?"on":"")+'"></i>').join("")+'</span>'+escHtml(r)+'</button>').join("")+'</div></li>';
      }).join("")+'</ol>'+
      '<div class="pr-save"><span id="pr-count">0 of '+list.length+' rated</span><button type="button" class="primary" id="pr-save" disabled>Save my ratings</button></div>';
    const el=sheet("SKILLS","How confident are you?",body,"pr-conf");
    const count=el.querySelector("#pr-count"),save=el.querySelector("#pr-save");
    el.querySelectorAll(".pr-skill").forEach(li=>{
      const i=+li.dataset.skill;
      li.querySelectorAll("[data-rate]").forEach(b=>b.onclick=()=>{
        picked.set(i,+b.dataset.rate);
        li.querySelectorAll("[data-rate]").forEach(x=>x.setAttribute("aria-checked",String(x===b)));
        li.classList.add("done");
        count.textContent=picked.size+" of "+list.length+" rated";
        save.disabled=false;
        const next=li.nextElementSibling;
        if(next&&!next.classList.contains("done")&&picked.size<list.length)setTimeout(()=>next.scrollIntoView({block:"nearest",behavior:window.eviaAccessibility&&window.eviaAccessibility.reducedMotion()?"auto":"smooth"}),120);
      });
    });
    save.onclick=()=>{
      if(!picked.size)return;
      const now=new Date().toISOString();
      const scores=list.map((s,i)=>picked.has(i)?{area:s.area,score:picked.get(i),question:s.question,answeredAt:now}:prev.has(s.area)?Object.assign({},prev.get(s.area),{carried:true}):null).filter(Boolean);
      const all=readJson("evia7-confidence",[]);
      all.push({id:"confidence-"+Date.now(),course,startedAt:now,savedAt:now,source:"self-assessment",scores});
      localStorage.setItem("evia7-confidence",JSON.stringify(all));
      try{localStorage.removeItem("evia7-confidence-cycle-"+course)}catch(_){}
      showPlan(scores,prev);
    };
  }
  function showPlan(scores,prev){
    const low=scores.filter(x=>x.score<=2).sort((a,b)=>a.score-b.score),high=scores.filter(x=>x.score>=3).sort((a,b)=>b.score-a.score);
    const change=x=>{const p=prev.get(x.area);if(!p||x.carried||p.score===x.score)return"";const up=x.score>p.score;return ' <span class="pr-change '+(up?"up":"down")+'">'+(up?"↑ up":"↓ down")+'</span>'};
    const item=x=>'<li><strong>'+escHtml(x.area)+'</strong><small>'+escHtml(RATINGS[x.score-1])+change(x)+'</small></li>';
    const improved=scores.filter(x=>{const p=prev.get(x.area);return p&&!x.carried&&x.score>p.score});
    const body=(improved.length?'<div class="pr-banner good">You’ve moved up on <strong>'+escHtml(improved.map(x=>x.area).join(", "))+'</strong>. That’s real progress.</div>':"")+
      '<h3 class="pr-h">Needs more training</h3>'+(low.length?'<ul class="pr-plan low">'+low.map(item).join("")+'</ul><p class="pr-note">Tell your tutor or supervisor you’d like more practice on these. When one of these jobs comes up on site, ask to get involved.</p>':'<p class="pr-note">Nothing rated low. Nice.</p>')+
      '<h3 class="pr-h">Confident</h3>'+(high.length?'<ul class="pr-plan high">'+high.map(item).join("")+'</ul><p class="pr-note">Keep doing these on the job and they’ll keep getting better.</p>':'<p class="pr-note">Nothing rated high yet. That’s fine: it takes time.</p>')+
      '<div class="pr-actions"><button type="button" class="secondary" id="pr-send">Send to my tutor</button><button type="button" class="primary" id="pr-done">Done</button></div><p class="pr-note" id="pr-sent" role="status"></p>';
    const el=sheet("SKILLS","Your training plan",body,"pr-conf");
    if(window.eviaMood)window.eviaMood("happy");
    el.querySelector("#pr-done").onclick=()=>{closeSheet();if(typeof screen!=="undefined"&&(screen==="progress"||screen==="home"))render()};
    el.querySelector("#pr-send").onclick=async()=>{
      const name=String(profile().name||"").trim();
      const text="Confidence check"+(name?" – "+name:"")+" ("+new Date().toLocaleDateString("en-GB")+")\n\nNeeds more training:\n"+(low.length?low.map(x=>"• "+x.area+" – "+RATINGS[x.score-1]).join("\n"):"• None")+"\n\nConfident:\n"+(high.length?high.map(x=>"• "+x.area+" – "+RATINGS[x.score-1]).join("\n"):"• None");
      const note=el.querySelector("#pr-sent");
      try{if(navigator.share){await navigator.share({title:"Confidence check",text});return}}catch(e){if(e&&e.name==="AbortError")return}
      try{await navigator.clipboard.writeText(text);note.textContent="Copied. Paste it into a message or email to your tutor."}
      catch(_){note.textContent="Sharing isn’t available here. Show your tutor this screen instead."}
    };
  }

  window.eviaPractice={openHub,openConfidence,epaDue,startTest};
})();
