/* Evia7 coach: the things Evia does with the learner in the chat, spoken like a coach rather than filled in like a
   form. Log my hours (with an hours-and-minutes wheel), a confidence check one skill at a time, Upskill me, Check my
   evidence, and a message box that understands the common things apprentices ask. Uses the chat helpers in ui.js. */
(function(){
  const K=()=>window.eviaChatKit;
  const esc=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const hm=h=>window.eviaHM?window.eviaHM(h):h+" h";
  const weekStart=()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()};
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Log my hours ---------- */
  const KINDS=[
    ["College day","College day",7.5],["Toolbox talk","Toolbox talk",.5],["Training course","Training course",3],
    ["Research or reading","Research and reading",1],["Shadowing someone","Shadowing",2],["Something else","",1]
  ];
  /* The wheel: hours 0–12 and minutes in 5s, each a scroll-snapping column. */
  function wheelHtml(){
    const col=(name,values,fmt)=>'<div class="hw-col" data-col="'+name+'" tabindex="0" role="listbox" aria-label="'+(name==="h"?"Hours":"Minutes")+'"><div class="hw-pad"></div>'+values.map(v=>'<div class="hw-item" data-v="'+v+'" role="option">'+fmt(v)+'</div>').join("")+'<div class="hw-pad"></div></div>';
    return '<div class="hw"><div class="hw-band" aria-hidden="true"></div>'+
      col("h",[...Array(13).keys()],v=>v)+'<span class="hw-unit">h</span>'+
      col("m",[...Array(12).keys()].map(i=>i*5),v=>String(v).padStart(2,"0"))+'<span class="hw-unit">min</span></div>'+
      '<div class="hw-presets">'+[[.5,"30 min"],[1,"1 h"],[3.75,"Half day"],[7.5,"Full day"]].map(([v,l])=>'<button type="button" class="hw-preset" data-preset="'+v+'">'+l+'</button>').join("")+'</div>'+
      '<p class="hw-readout" aria-live="polite"></p><button type="button" class="chat-pill ui-pill-primary hw-ok"><strong>That’s right</strong></button>';
  }
  function bindWheel(el,start,done){
    const ITEM=40,cols={h:el.querySelector('[data-col="h"]'),m:el.querySelector('[data-col="m"]')},readout=el.querySelector(".hw-readout");
    const val=()=>{const h=Math.round(cols.h.scrollTop/ITEM),m=Math.round(cols.m.scrollTop/ITEM)*5;return {h:Math.max(0,Math.min(12,h)),m:Math.max(0,Math.min(55,m))}};
    const show=()=>{const v=val();readout.textContent=v.h||v.m?hm(v.h+v.m/60):"Scroll to set the time";el.querySelectorAll(".hw-col").forEach(c=>{const i=Math.round(c.scrollTop/ITEM);c.querySelectorAll(".hw-item").forEach((it,n)=>it.classList.toggle("on",n===i))})};
    const set=(hours,smooth)=>{const total=Math.round(hours*60),h=Math.floor(total/60),m=Math.round((total%60)/5);const b=smooth&&!reduced()?"smooth":"auto";cols.h.scrollTo({top:h*ITEM,behavior:b});cols.m.scrollTo({top:m*ITEM,behavior:b});setTimeout(show,smooth?350:0)};
    Object.values(cols).forEach(c=>{
      let t=null;c.addEventListener("scroll",()=>{clearTimeout(t);t=setTimeout(show,60)},{passive:true});
      c.addEventListener("keydown",e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();c.scrollBy({top:e.key==="ArrowDown"?ITEM:-ITEM})}});
      c.querySelectorAll(".hw-item").forEach((it,n)=>it.onclick=()=>c.scrollTo({top:n*ITEM,behavior:reduced()?"auto":"smooth"}));
    });
    el.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>set(Number(b.dataset.preset),true));
    requestAnimationFrame(()=>set(start,false));
    el.querySelector(".hw-ok").onclick=()=>{const v=val(),hrs=v.h+v.m/60;if(hrs<=0){readout.textContent="Set how long first";return}el.querySelector(".hw-ok").disabled=true;el.classList.add("done");done(hrs)};
  }
  function logHours(){
    const k=K();
    k.say(k.pick(["Nice one. What did you do?","Let’s log it. What was it?","Good stuff. What kind of learning was it?"]));
    k.replies(KINDS.map(([label,desc,start])=>({label,run:()=>askTime(desc,start)})));
  }
  function askTime(desc,start){
    const k=K();
    k.say("How long did it take? Scroll to set it, or tap a quick one.");
    k.widget(wheelHtml(),el=>bindWheel(el,start,hrs=>askNote(desc,hrs)));
  }
  function askNote(desc,hrs){
    const k=K();
    k.userSays(hm(hrs));
    k.say(desc?"Want to add a few words about it? It helps your assessor.":"What did you do? A few words is plenty.");
    k.widget('<div class="hw-note"><textarea rows="2" placeholder="'+esc(desc?"For example: "+({"College day":"cavity walls and wall ties","Toolbox talk":"working at height","Training course":"abrasive wheels","Research and reading":"reading up on mortar mixes","Shadowing":"watching the setting out of a new block"}[desc]||""):"For example: toolbox talk on manual handling")+'"></textarea><div class="hw-note-actions">'+(desc?'<button type="button" class="chat-pill hw-skip"><strong>Skip</strong></button>':"")+'<button type="button" class="chat-pill ui-pill-primary hw-save"><strong>Save</strong></button></div></div>',el=>{
      const ta=el.querySelector("textarea");if(!desc)setTimeout(()=>ta.focus(),50);
      const finish=extra=>{
        const text=[desc,extra].filter(Boolean).join(": ");
        if(!text){ta.focus();ta.placeholder="Add a few words first";return}
        el.querySelectorAll("button").forEach(b=>b.disabled=true);el.classList.add("done");
        if(extra)k.userSays(extra);
        save(hrs,text);
      };
      el.querySelector(".hw-save").onclick=()=>finish(ta.value.trim());
      const sk=el.querySelector(".hw-skip");if(sk)sk.onclick=()=>finish("");
    });
  }
  function save(hrs,text){
    const k=K(),now=Date.now();
    hours.push({id:"otj-"+now+"-"+Math.random().toString(36).slice(2,8),n:Math.round(hrs*100)/100,description:text,createdAt:now,savedAt:formatDateTime(now)});
    persist();
    if(window.eviaCheckTargets)window.eviaCheckTargets();
    const week=hours.filter(x=>Number(x.createdAt)>=weekStart()).reduce((n,x)=>n+Number(x.n||0),0);
    if(window.eviaMood)window.eviaMood("happy");
    k.say("Logged <strong>"+esc(hm(hrs))+"</strong>. "+(week>=6?"That’s <strong>"+esc(hm(week))+"</strong> this week, which is brilliant.":"That’s <strong>"+esc(hm(week))+"</strong> this week so far."));
    k.replies([{label:"Log more",run:logHours},{label:"Something else",run:k.somethingElse}]);
  }

  /* ---------- Confidence check: one skill at a time ---------- */
  const LEVELS=["Need more training","Know the basics","Quite confident","Mastered"],SHORT=["Need training","Basics","Confident","Mastered"];
  function confidence(){
    const k=K(),qs=typeof confidenceQuestions==="function"?confidenceQuestions():[];
    if(!qs.length){k.say("I don’t have a skills list for your course yet.");k.replies([{label:"Something else",run:k.somethingElse}]);return}
    const prev=new Map();readJson("evia7-confidence",[]).filter(x=>x&&x.course===course&&Array.isArray(x.scores)).forEach(s=>s.scores.forEach(x=>prev.set(x.area,x.score)));
    k.say("Be honest, there are no wrong answers. I’ll ask about "+qs.length+" skills: slide each one to where you are now."+(prev.size?" The faint dot shows where you were last time.":"")+" It takes about two minutes.");
    const scores=[];let i=0;
    const ask=()=>{
      if(i>=qs.length){finish();return}
      const [area,question]=qs[i],was=prev.get(area),v=was||1;
      /* The same slider as the Practice check: four stops, and a faint dot where you were last time. */
      k.widget('<div class="cfc"><div class="cfc-top"><span>'+(i+1)+' of '+qs.length+'</span><span class="cfc-dots" aria-hidden="true">'+qs.map((_,n)=>'<i class="'+(n<i?"done":n===i?"now":"")+'"></i>').join("")+'</span></div>'+
        '<div class="cf-row'+(was?"":" unset")+'"'+(was?' data-level="'+(was<=2?"low":"high")+'"':"")+'><div class="cf-row-top"><strong id="cfc-name-'+i+'">'+esc(area)+'</strong><span class="cf-level">'+(was?esc(SHORT[was-1]):"Slide to rate")+'</span></div>'+
        '<p class="cf-desc">'+esc(question)+'</p>'+
        '<div class="cf-track" style="--v:'+v+'"><span class="cf-stops" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'+(was?'<span class="cf-last" style="--l:'+was+'" title="Last time: '+esc(LEVELS[was-1])+'"></span>':"")+'<input type="range" min="1" max="4" step="1" value="'+v+'" aria-labelledby="cfc-name-'+i+'" aria-valuetext="'+(was?esc(LEVELS[v-1]):"Not rated")+'"></div>'+
        '<div class="cfc-legend" aria-hidden="true"><span>Need training</span><span>Basics</span><span>Confident</span><span>Mastered</span></div></div>'+
        (was?'<small class="cfc-was">Last time: '+esc(LEVELS[was-1])+' (the faint dot)</small>':"")+
        '<button type="button" class="chat-pill ui-pill-primary cfc-next"'+(was?"":" disabled")+'><strong>'+(was?"Same as last time":"Next")+'</strong></button></div>',el=>{
        const row=el.querySelector(".cf-row"),input=el.querySelector("input"),track=el.querySelector(".cf-track"),next=el.querySelector(".cfc-next");
        const set=()=>{
          const n=+input.value;row.classList.remove("unset");row.dataset.level=n<=2?"low":"high";track.style.setProperty("--v",n);
          row.querySelector(".cf-level").innerHTML=esc(SHORT[n-1])+(was&&was!==n?' <small>· was '+esc(SHORT[was-1])+'</small>':"");
          input.setAttribute("aria-valuetext",LEVELS[n-1]);
          next.disabled=false;next.querySelector("strong").textContent=i+1<qs.length?"Next":"Finish";
        };
        ["input","change","pointerup"].forEach(ev=>input.addEventListener(ev,set));
        next.onclick=()=>{
          if(next.disabled)return;
          const score=+input.value;input.disabled=true;el.firstElementChild.parentElement.classList.add("done");
          scores.push({area,score,question,answeredAt:new Date().toISOString()});
          i++;setTimeout(ask,reduced()?0:200);
        };
      });
    };
    const finish=()=>{
      const now=new Date().toISOString(),all=readJson("evia7-confidence",[]);
      all.push({id:"confidence-"+Date.now(),course,startedAt:now,savedAt:now,source:"self-assessment",scores});
      localStorage.setItem("evia7-confidence",JSON.stringify(all));
      try{localStorage.removeItem("evia7-confidence-cycle-"+course)}catch(_){}
      if(window.eviaCheckTargets)window.eviaCheckTargets();
      const low=scores.filter(x=>x.score<=2).sort((a,b)=>a.score-b.score),high=scores.filter(x=>x.score>=3).sort((a,b)=>b.score-a.score);
      const up=scores.filter(x=>prev.has(x.area)&&x.score>prev.get(x.area));
      if(window.eviaMood)window.eviaMood("happy");
      k.say("Thanks, that’s saved."+(up.length?" You’ve moved up in <strong>"+esc(k.listText(up.map(x=>x.area)))+"</strong>, nice progress.":"")+(high.length?" You’re strongest at <strong>"+esc(high[0].area)+"</strong>.":""));
      if(low.length){
        k.say("I’d work on <strong>"+esc(k.listText(low.slice(0,3).map(x=>x.area)))+"</strong> next. Tell your tutor or supervisor, and ask to get involved when that work comes up on site.");
        k.replies([{label:"Find me a college task",primary:true,run:upskillTask},{label:"See my confidence",run:()=>{k.closeChat();setTimeout(()=>{nav("learning");setTimeout(()=>window.eviaProgressDeep&&window.eviaProgressDeep("conf"),450)},60)}},{label:"Something else",run:k.somethingElse}]);
      }else{
        k.say("Nothing rated low. Keep it up, and try a full mock test to prove it.");
        k.replies([{label:"Test me",run:()=>window.eviaTestMe&&window.eviaTestMe()},{label:"Something else",run:k.somethingElse}]);
      }
    };
    ask();
  }

  /* ---------- Upskill me ---------- */
  function upskill(){
    const k=K(),sp=window.eviaScenarios?window.eviaScenarios.progress():null;
    k.say(k.pick(["Love it. What do you fancy?","Let’s get you better at something. Pick one:"]));
    const list=[{label:"A college task",primary:true,run:upskillTask}];
    if(sp&&sp.total&&sp.done<sp.total)list.push({label:"A real-life scenario",run:()=>{k.say("These are situations you might meet at work. There’s no pass or fail; just think about what you’d do.");k.replies([{label:"Let’s go",primary:true,run:()=>{k.closeChat();setTimeout(()=>window.eviaScenarios.openNext(),80)}},{label:"Something else",run:k.somethingElse}])}});
    list.push({label:"A quick question",run:()=>window.eviaTestMe&&window.eviaTestMe({type:"epa",count:1})},{label:"Something else",run:k.somethingElse});
    k.replies(list);
  }
  /* A college task as a card in the chat: Evia's pick if the confidence check has low skills, otherwise any. */
  function upskillTask(){
    const k=K(),P=window.eviaPractice,all=(window.EVIA_PRACTICE_TASKS||{})[course]||[];
    if(!P||!all.length){k.say("I don’t have college tasks for your course yet. Ask your tutor which jobs to practise in the workshop.");k.replies([{label:"Something else",run:k.somethingElse}]);return}
    const picks=P.suggestTasks(3),pick=picks[0]||{task:all[Math.floor(Math.random()*all.length)],covers:[]},t=pick.task;
    k.say(pick.covers.length?"Try this in the workshop. It works on <strong>"+esc(k.listText(pick.covers))+"</strong>, which you rated low.":"Here’s a good one to try in the workshop.");
    k.widget('<div class="ut"><span class="ut-kicker">College task · about '+esc(t.time)+'</span><strong>'+esc(t.title)+'</strong><p>'+esc(t.brief)+'</p><ol>'+t.steps.slice(0,3).map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>'+(t.steps.length>3?'<button type="button" class="ut-more">All '+t.steps.length+' steps ›</button>':"")+'</div>',el=>{
      const m=el.querySelector(".ut-more");if(m)m.onclick=()=>{k.closeChat();setTimeout(()=>picks.length?P.openTask(0):P.openAllTasks(),80)};
    });
    k.replies([{label:"Another idea",run:upskillTask},{label:"All college tasks",run:()=>{k.closeChat();setTimeout(P.openAllTasks,80)}},{label:"Something else",run:k.somethingElse}]);
  }

  /* ---------- Check my evidence: unit by unit, plainly ---------- */
  function evidence(){
    const k=K(),a=k.analyse(),prompts=(window.eviaLearnerPrompts||{})[course]||{};
    const started=a.units.filter(u=>u.started);
    if(!started.length){k.say("You haven’t saved any evidence yet. Pick a unit on My course, take a few photos and write what you did. I’ll check it for you after.");k.replies([{label:"Something else",run:k.somethingElse}]);return}
    const checks=started.map(u=>{const c=prompts[u.name]?k.checkUnit(u,prompts):null;const latest=u.entries.slice().sort((x,y)=>Date.parse(y.savedAt||0)-Date.parse(x.savedAt||0))[0];const photos=c?c.photos:(latest&&(latest.photoIds||latest.p||[]).length)||0,words=c?c.words:String(latest&&latest.w||"").trim().split(/\s+/).filter(Boolean).length;
      const issues=[];if(photos<5)issues.push(photos<3?"only "+k.plural(photos,"photo")+": add the start, middle and finished job":"add "+(5-photos)+" more photo"+(5-photos===1?"":"s"));
      if(c&&c.missing.length)issues.push("mention "+k.listText(c.missing.slice(0,3))+(c.missing.length>3?" and "+(c.missing.length-3)+" more":""));
      if(words<60)issues.push("write a bit more about how you did it and how you checked it");
      return {u,issues,score:issues.length,pct:c&&c.terms.length?Math.round(c.covered.length/c.terms.length*100):null}}).sort((x,y)=>y.score-x.score);
    const weak=checks.filter(c=>c.score),good=checks.filter(c=>!c.score);
    k.say("I’ve been through "+k.plural(checks.length,"unit")+" with evidence."+(good.length?" <strong>"+esc(k.listText(good.slice(0,3).map(c=>c.u.name)))+"</strong> "+(good.length===1?"looks":"look")+" strong.":""));
    if(!weak.length){if(window.eviaMood)window.eviaMood("happy");k.say("Everything I can check looks good. Nice work.");}
    else k.widget('<div class="ec">'+weak.slice(0,3).map(c=>'<div class="ec-item"><div class="ec-head"><strong>'+esc(c.u.name)+'</strong>'+(c.pct!=null?'<span>'+c.pct+'% of key points</span>':"")+'</div><ul>'+c.issues.map(x=>'<li>'+esc(x.charAt(0).toUpperCase()+x.slice(1))+'</li>').join("")+'</ul><button type="button" class="ec-open" data-unit="'+c.u.index+'">Open '+esc(c.u.name)+' ›</button></div>').join("")+'</div>',el=>{
      el.querySelectorAll("[data-unit]").forEach(b=>b.onclick=()=>k.openUnitFromChat({index:+b.dataset.unit}));
    });
    const notStarted=a.units.filter(u=>!u.started).length;
    if(notStarted)k.say(k.plural(notStarted,"unit")+" still "+(notStarted===1?"has":"have")+" no evidence."+(a.quickest?" <strong>"+esc(a.quickest.name)+"</strong> would tick off the most.":""));
    k.replies([a.quickest?{label:"Open "+a.quickest.name,run:()=>k.openUnitFromChat(a.quickest)}:null,{label:"Something else",run:k.somethingElse}].filter(Boolean));
  }

  /* ---------- The message box: understands the common things apprentices ask ---------- */
  function understand(text){
    const k=K(),t=text.toLowerCase();
    const flows=window.eviaCoachFlows;
    if(/\b(otj|off.?the.?job|hours?|log|toolbox|college day)\b/.test(t))return logHours();
    if(/\b(test|quiz|question me|mock|exam|epa)\b/.test(t))return window.eviaTestMe&&window.eviaTestMe();
    if(/\b(review)\b/.test(t))return K().reviewFromMenu();
    if(/\b(confiden|rate|rating)\w*/.test(t))return flows.confidence();
    if(/\b(evidence|write.?up|photos?|portfolio|weak|check)\b/.test(t))return flows.evidence();
    if(/\b(task|improve|practi[sc]e|upskill|better|learn|scenario)\w*/.test(t))return flows.upskill();
    /* "How do I…" about a unit: what to capture and what to mention. */
    const units=data().u.map((u,i)=>({name:u[0],i})),words=t.split(/\W+/).filter(w=>w.length>3);
    const hit=units.map(u=>({u,n:words.filter(w=>u.name.toLowerCase().includes(w)).length})).sort((x,y)=>y.n-x.n)[0];
    if(hit&&hit.n){
      const p=((window.eviaLearnerPrompts||{})[course]||{})[hit.u.name]||{};
      k.say("For <strong>"+esc(hit.u.name)+"</strong>, take photos of: "+esc(String(p.photos||"the start, middle and end of the job").split("·").map(x=>x.trim()).filter(Boolean).join(", "))+".");
      if(p.writeup)k.say("In your write-up, mention: "+esc(String(p.writeup).split("·").map(x=>x.trim()).filter(Boolean).join(", "))+".");
      k.replies([{label:"Open "+hit.u.name,primary:true,run:()=>k.openUnitFromChat({index:hit.u.i})},{label:"Something else",run:k.somethingElse}]);
      return;
    }
    if(/\b(hi|hello|hey|thanks|thank you|cheers)\b/.test(t)){k.say(k.pick(["Any time. What’s next?","Happy to help. Anything else?"]));return k.somethingElse()}
    k.say("I’m still learning to understand everything, but I can help with these:");
    k.somethingElse();
  }
  function input(sheet){
    if(sheet.querySelector(".ui-ask"))return;
    const form=document.createElement("form");form.className="ui-ask";
    form.innerHTML='<input type="text" placeholder="Ask Evia anything…" aria-label="Message Evia" enterkeyhint="send" autocomplete="off"><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></button>';
    sheet.appendChild(form);
    const field=form.querySelector("input");
    field.addEventListener("input",()=>{if(window.eviaLook)window.eviaLook(-4,-26,1600);form.classList.toggle("has-text",!!field.value.trim())});
    form.onsubmit=e=>{
      e.preventDefault();const text=field.value.trim();if(!text)return;
      field.value="";form.classList.remove("has-text");
      document.querySelectorAll("#chat .ui-actions,#chat .ui-replies").forEach(x=>x.remove());
      K().userSays(text);understand(text);
    };
  }

  window.eviaCoachFlows={hours:logHours,confidence,upskill,evidence,input};
})();
