/* Evia review/test layer. Uses the copied DDRNFinch/EPA banks in test-banks.js. */
(function(){
  const TEST_KEY="evia7-test-results";
  const REVIEW_KEY="evia7-progress-reviews";
  const TARGET_KEY="evia7-targets";
  const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||"");return v??fallback}catch(_){return fallback}};
  const write=(key,v)=>localStorage.setItem(key,JSON.stringify(v));
  const courseMap={bricklayer:"bricklaying",site:"siteCarpentry",joiner:"benchJoinery"};
  const academicEnabled=subject=>{
    const p=read("evia7-profile",{});
    return !!p[subject+"Enabled"];
  };
  const enabledSubjects=()=>["maths","english"].filter(academicEnabled);
  const escLocal=s=>String(s??"").replace(/[&<>"]/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]));
  const shuffle=a=>[...a].sort(()=>Math.random()-.5);
  const bankFor=subject=>{
    const key=courseMap[course]||"bricklaying";
    if(subject==="discussion")return Array.isArray(EPA_DISCUSSIONS?.[key])?EPA_DISCUSSIONS[key]:[];
    if(subject==="epa")return Array.isArray(EPA_QUESTIONS?.[key])?EPA_QUESTIONS[key]:[];
    if(subject==="maths")return Array.isArray(EPA_MATHS_QUESTIONS)?EPA_MATHS_QUESTIONS:[];
    if(subject==="english")return Array.isArray(EPA_ENGLISH_QUESTIONS)?EPA_ENGLISH_QUESTIONS:[];
    return [];
  };
  const saveTest=(type,result)=>{
    const all=read(TEST_KEY,[]);
    all.push({...result,type,course,savedAt:new Date().toISOString()});
    write(TEST_KEY,all.slice(-50));
  };
  const latestTest=type=>{
    const all=read(TEST_KEY,[]).filter(x=>x.course===course&&x.type===type);
    return all[all.length-1]||null;
  };
  const latestTests=()=>({discussion:latestTest("discussion"),epa:latestTest("epa"),maths:latestTest("maths"),english:latestTest("english")});
  const testLabel=t=>({discussion:"Discussion",epa:"EPA MCQ",maths:"Maths",english:"English"}[t]||t);
  const formatUKDate=value=>{if(!value)return "";const s=String(value);const m=s.match(/^(\\d{4})-(\\d{2})-(\\d{2})(?:$|T|\\s)/);if(m)return m[3]+"/"+m[2]+"/"+m[1];const d=new Date(s);return Number.isNaN(d.getTime())?s:d.toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"})};
  const wordCount=s=>String(s||"").trim().split(/\\s+/).filter(Boolean).length;
  const evidenceStrength=(photos,words)=>{const p=photos<=4?"weak":photos<=9?"good":"strong",w=words<=49?"weak":words<=99?"good":"strong";return p==="strong"&&w==="strong"?"strong":p==="weak"||w==="weak"?"weak":"good"};
  const strengthLabel=s=>s==="strong"?"Strong":s==="good"?"Good":s==="weak"?"Weak":"No evidence";
  const meaningfulTerms=text=>{const stop=new Set("the and for with from that this have has was were are is to of a an in on at by as it i we our my you your they them did do done then than into using used use about what when where how while after before very also just more less good great completed complete evidence task job work".split(" "));const raw=String(text||"").toLowerCase().replace(/[^a-z0-9' -]/g," ").split(/\\s+/).filter(Boolean);const counts=new Map();for(let i=0;i<raw.length;i++){const w=raw[i];if(w.length>=4&&!stop.has(w))counts.set(w,(counts.get(w)||0)+1);if(i<raw.length-1){const b=w+" "+raw[i+1];if(w.length>=3&&raw[i+1].length>=3&&!stop.has(w)&&!stop.has(raw[i+1]))counts.set(b,(counts.get(b)||0)+1)}}return [...counts.entries()].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length).map(x=>x[0]).filter((x,i,a)=>!a.some((y,j)=>j<i&&y.includes(x))).slice(0,3)};
  const unitStatement=(u,name)=>{const es=evidence.filter(e=>e.c===course&&e.u===u);if(!es.length)return "No evidence has been submitted for this unit yet.";const photos=es.reduce((n,e)=>n+(Array.isArray(e.photoIds)?e.photoIds.length:(Number.isFinite(Number(e.photoCount))?Number(e.photoCount):(Array.isArray(e.p)?e.p.length:0))),0),words=es.reduce((n,e)=>n+wordCount(e.w),0),strength=evidenceStrength(photos,words),terms=meaningfulTerms(es.map(e=>e.w||"").join(" "));const area=terms.length?" and has referenced areas such as "+terms.join(", "):"";const opening=strength==="strong"?"has built a strong evidence pack for":strength==="good"?"has built a good evidence pack for":"has started the evidence pack for";const close=strength==="strong"?"This is currently classed as a strong evidence pack based on the amount of supporting material provided.":strength==="good"?"This is currently classed as a good evidence pack based on the amount of supporting material provided.":"Further evidence or written detail would strengthen the pack.";return name+" "+opening+" "+u+area+". They have provided "+es.length+" "+(es.length===1?"occasion":"occasions")+" consisting of "+photos+" photos and "+words+" written words. "+close};
  const bar=(label,value)=>'<div class="review-bar-row"><div><strong>'+escLocal(label)+'</strong><span>'+value+'%</span></div><div class="review-bar-track"><i style="width:'+Math.max(0,Math.min(100,Number(value)||0))+'%"></i></div></div>';
  const stat=(label,value,sub="")=>'<div class="review-stat"><span>'+escLocal(label)+'</span><strong>'+escLocal(value)+'</strong>'+(sub?'<small>'+escLocal(sub)+'</small>':"")+'</div>';
  const ensureReviewStyles=()=>{if(document.getElementById("evia-review-dashboard-style"))return;const s=document.createElement("style");s.id="evia-review-dashboard-style";s.textContent='.review-dashboard{display:grid;gap:14px}.review-section{border:1px solid #e4e7ec;border-radius:16px;padding:15px;background:#fff}.review-section h3{margin:0 0 11px}.review-sub{color:#667085;font-size:12px;margin:0 0 12px}.review-stat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.review-stat{border:1px solid #edf0f3;border-radius:12px;padding:11px;display:grid;gap:3px}.review-stat span{font-size:11px;color:#667085}.review-stat strong{font-size:18px}.review-stat small{font-size:10px;color:#98a2b3}.review-bar-row{margin:10px 0}.review-bar-row>div:first-child{display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px}.review-bar-track{height:9px;border-radius:999px;background:#eef1f4;overflow:hidden}.review-bar-track i{display:block;height:100%;border-radius:999px;background:#1b2435}.review-chart{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-items:end;height:110px;padding-top:8px}.review-chart-col{height:100%;display:flex;flex-direction:column;justify-content:end;align-items:center;gap:5px}.review-chart-col i{display:block;width:70%;max-width:28px;min-height:3px;border-radius:6px 6px 2px 2px;background:#1b2435}.review-chart-col span{font-size:9px;color:#667085;text-align:center}.review-pills{display:flex;flex-wrap:wrap;gap:6px}.review-pill{border:1px solid #e1e5ea;border-radius:999px;padding:7px 9px;font-size:11px}.review-generated{line-height:1.55;color:#344054}.review-unit-strength{display:flex;align-items:center;gap:8px}.review-strength-bars{display:flex;gap:3px}.review-strength-bars i{width:7px;height:13px;border-radius:2px;background:#e5e7eb}.review-strength-bars i.filled{background:#1b2435}@media(min-width:700px){.review-stat-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}';document.head.appendChild(s)};

  const reply=(html,delay=700)=>{const chat=$("#chat");if(!chat)return;const el=document.createElement("div");el.className="bubble evia evia-thinking";el.innerHTML='<span class="thinking-label">Evia is thinking</span><span class="thinking-dots"><i></i><i></i><i></i></span>';chat.appendChild(el);chat.scrollTop=chat.scrollHeight;setTimeout(()=>{el.outerHTML='<div class="bubble evia" data-thought-complete="1">'+html+'</div>';chat.scrollTop=chat.scrollHeight},delay)};

  function eviaTestMe(){
    const options=[["discussion","Discussion"],["epa","EPA MCQ"]];
    if(academicEnabled("maths"))options.push(["maths","Maths"]);
    if(academicEnabled("english"))options.push(["english","English"]);
    const chatEl=$("#chat");
    const addBubble=v=>chatEl.insertAdjacentHTML("beforeend",'<div class="bubble user">'+escLocal(v)+'</div>');
    const scroll=()=>chatEl.scrollTop=chatEl.scrollHeight;
    chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>Test me</strong><br>Choose a test.</div><div class="chat-options">'+options.map(o=>'<button class="chat-pill" data-test-kind="'+o[0]+'"><strong>'+o[1]+'</strong></button>').join("")+'</div>');
    scroll();
    document.querySelectorAll("[data-test-kind]").forEach(b=>b.onclick=()=>{
      const type=b.dataset.testKind;
      addBubble(testLabel(type));
      document.querySelectorAll("[data-test-kind]").forEach(x=>x.remove());
      if(type==="discussion")runDiscussion();
      else runChoiceTest(type);
    });

    function runDiscussion(){
      const qs=bankFor("discussion").slice(0,5);
      const result={questions:[],score:0,total:qs.length};
      let i=0;
      const ask=()=>{
        if(i>=qs.length){
          result.pct=result.total?Math.round(result.score/result.total*100):0;
          saveTest("discussion",result);
          chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>Discussion complete</strong><br>'+result.score+' / '+result.total+' areas covered ('+result.pct+'%). I’ve saved this for your progress review.</div>');
          scroll();return;
        }
        const q=qs[i];
        chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>Question '+(i+1)+' of '+qs.length+'</strong><br>'+escLocal(q.prompt)+'</div><textarea class="test-response" data-discussion-answer placeholder="Type or use your phone microphone to answer..."></textarea><button class="chat-pill test-submit" data-discussion-submit><strong>Submit answer</strong></button>');
        scroll();
        const submit=document.querySelector("[data-discussion-submit]");
        submit.onclick=()=>{
          const input=document.querySelector("[data-discussion-answer]");
          const answer=String(input?.value||"").trim();
          if(!answer)return;
          const lower=answer.toLowerCase();
          const covered=q.points.filter(p=>p.terms.some(term=>lower.includes(term.toLowerCase())));
          const pct=Math.round(covered.length/q.points.length*100);
          const passed=covered.length>=3;
          if(passed)result.score++;
          result.questions.push({prompt:q.prompt,answer,covered:covered.map(x=>x.label),missing:q.points.filter(x=>!covered.includes(x)).map(x=>x.label),pct,correct:passed});
          input.disabled=true;submit.remove();
          chatEl.insertAdjacentHTML("beforeend",'<div class="bubble user">'+escLocal(answer)+'</div><div class="bubble evia">'+(passed?"Good coverage. ":"There are areas to develop. ")+'You covered '+covered.length+' of '+q.points.length+' key areas.'+(passed?"":"<br><strong>Mini-session:</strong> Revisit "+q.points.filter(x=>!covered.includes(x)).map(x=>escLocal(x.label)).join(", ")+" before your next attempt.")+'</div><button class="chat-pill test-submit" data-next-test><strong>'+(i+1<qs.length?"Next question":"Finish")+'</strong></button>');
          document.querySelector("[data-next-test]").onclick=()=>{document.querySelector("[data-next-test]").remove();i++;ask()};
          scroll();
        };
      };
      ask();
    }

    function runChoiceTest(type){
      const source=bankFor(type);
      const qs=shuffle(source).slice(0,5);
      let i=0,score=0;
      const result={questions:[],score:0,total:qs.length};
      const ask=()=>{
        if(i>=qs.length){
          result.score=score;result.pct=qs.length?Math.round(score/qs.length*100):0;
          saveTest(type,result);
          chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>'+testLabel(type)+' complete</strong><br>'+score+' / '+qs.length+' correct ('+result.pct+'%). I’ve saved this for your progress review.</div>');
          scroll();return;
        }
        const q=qs[i];
        const isAcademic=type==="maths"||type==="english";
        const answers=isAcademic?q[2]:q[2];
        const correct=isAcademic?q[3]:q[2][0];
        const explanation=isAcademic?q[4]:"The correct answer is "+correct+".";
        chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>Question '+(i+1)+' of '+qs.length+'</strong><br>'+escLocal(q[1])+'</div><div class="rating-options">'+shuffle(answers).map((a,n)=>'<button class="rating-pill" data-test-answer="'+encodeURIComponent(a)+'"><strong>'+String.fromCharCode(65+n)+'. '+escLocal(a)+'</strong></button>').join("")+'</div>');
        scroll();
        document.querySelectorAll("[data-test-answer]").forEach(btn=>btn.onclick=()=>{
          const chosen=decodeURIComponent(btn.dataset.testAnswer);
          const ok=chosen===correct;
          if(ok)score++;
          result.questions.push({question:q[1],chosen,correct,ok,explanation});
          document.querySelectorAll("[data-test-answer]").forEach(x=>x.disabled=true);
          document.querySelectorAll("[data-test-answer]").forEach(x=>{if(decodeURIComponent(x.dataset.testAnswer)===correct)x.classList.add("correct")});
          if(!ok)btn.classList.add("wrong");
          const currentOptions=btn.closest(".rating-options");
          if(currentOptions)currentOptions.remove();
          const hasMini=!ok && isAcademic && q[5] && Array.isArray(q[6]);
          const microId="micro-"+Date.now()+"-"+i+"-"+Math.random().toString(36).slice(2,7);
          const miniHtml=hasMini
            ? '<div id="'+microId+'" class="micro-teach"><div class="tag">Mini-session</div><p><strong>'+escLocal(q[5])+'</strong></p><div class="rating-options micro-options">'+q[6].map((a,n)=>'<button type="button" class="rating-pill" data-micro-answer="'+encodeURIComponent(a)+'"><strong>'+String.fromCharCode(65+n)+'. '+escLocal(a)+'</strong></button>').join("")+'</div><div class="micro-result"></div></div>'
            : '';
          chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>'+(ok?"Correct":"Not quite")+'</strong><br>'+(ok?"That is correct.":"The correct answer is: "+escLocal(correct)+".")+'<br><br>'+escLocal(explanation)+'</div>'+miniHtml+(hasMini?'':'<button type="button" class="chat-pill test-submit" data-next-test><strong>'+(i+1<qs.length?"Next question":"Finish")+'</strong></button>'));
          if(hasMini){
            const microBlock=document.getElementById(microId);
            const microButtons=Array.from(microBlock.querySelectorAll("[data-micro-answer]"));
            microButtons.forEach(mb=>mb.onclick=e=>{
              e.preventDefault();
              e.stopPropagation();
              if(microBlock.dataset.answered==="1")return;
              microBlock.dataset.answered="1";
              const microChosen=decodeURIComponent(mb.dataset.microAnswer);
              const microCorrect=String(q[7]??q[6][0]);
              microButtons.forEach(x=>x.disabled=true);
              const box=microBlock.querySelector(".micro-result");
              if(microChosen===microCorrect){
                mb.classList.add("correct");
                box.innerHTML='<strong>Mini-session complete.</strong> You can move on.';
              }else{
                mb.classList.add("wrong");
                microButtons.forEach(x=>{if(decodeURIComponent(x.dataset.microAnswer)===microCorrect)x.classList.add("correct")});
                box.innerHTML='Not quite. The correct answer is <strong>'+escLocal(microCorrect)+'</strong>.';
              }
              const nextWrap=document.createElement("div");
              nextWrap.innerHTML='<button type="button" class="chat-pill test-submit" data-next-test><strong>'+(i+1<qs.length?"Next question":"Finish")+'</strong></button>';
              microBlock.appendChild(nextWrap.firstElementChild);
              const next=microBlock.querySelector("[data-next-test]");
              next.onclick=e=>{e.preventDefault();e.stopPropagation();next.remove();i++;ask()};
              scroll();
            });
          }else{
            const next=document.querySelector("[data-next-test]");
            if(next)next.onclick=()=>{next.remove();i++;ask()};
          }
          scroll();
        });
      };
      ask();
    }
  }

  function targetReasoning(metrics){
    const targets=[];
    const now=new Date();
    const add=(title,reason,weeks,kind)=>{
      const deadline=new Date(now);deadline.setDate(deadline.getDate()+weeks*7);
      targets.push({title,reason,deadline:deadline.toISOString().slice(0,10),kind});
    };
    if(metrics.unitGap>0)add("Capture evidence for your next outstanding unit","You have "+metrics.unitGap+" course unit"+(metrics.unitGap===1?"":"s")+" without saved evidence.",2,"units");
    else if(metrics.weakUnits>0)add("Strengthen weaker portfolio evidence","Some started units need additional photos or written detail.",2,"portfolio");
    if(academicEnabled("maths"))add(metrics.mathsPct!==null&&metrics.mathsPct<70?"Practise Maths Level 2":"Maintain Maths Level 2 practice",metrics.mathsPct===null?"No Maths test has been recorded yet.":"Your latest Maths result was "+metrics.mathsPct+"%.",6,"maths");
    if(academicEnabled("english"))add(metrics.englishPct!==null&&metrics.englishPct<70?"Practise English Level 2":"Maintain English Level 2 practice",metrics.englishPct===null?"No English test has been recorded yet.":"Your latest English result was "+metrics.englishPct+"%.",6,"english");
    if(metrics.epaPct===null)add("Complete EPA MCQ practice","No EPA MCQ result has been recorded yet.",8,"epa");
    else add(metrics.epaPct<70?"Build EPA MCQ knowledge":"Maintain EPA MCQ practice","Your latest EPA MCQ result was "+metrics.epaPct+"%.",8,"epa");
    if(metrics.lowConfidence)add("Revisit a low-confidence practical area","Your latest confidence check identifies a practical area to revisit.",8,"confidence");
    while(targets.length<5)add("Strengthen your next practical task","Use your next job to gather stronger evidence and reflect on what you have learned.",8+targets.length*2,"practical");
    return targets.slice(0,5).map((t,i)=>({...t,id:"target-"+Date.now()+"-"+i,priority:i+1,createdAt:new Date().toISOString(),completed:false,progress:0}));
  }
  function metrics(){
    const entries=evidence.filter(e=>e.c===course), units=data().u;
    const covered=new Set(entries.map(e=>e.u));
    const totalPhotos=entries.reduce((n,e)=>n+(Array.isArray(e.photoIds)?e.photoIds.length:(Number.isFinite(Number(e.photoCount))?Number(e.photoCount):(Array.isArray(e.p)?e.p.length:0))),0);
    const totalWords=entries.reduce((n,e)=>n+String(e.w||"").trim().split(/\s+/).filter(Boolean).length,0);
    const allKsb=new Map(); units.forEach(u=>u[1].forEach(k=>allKsb.set(code(k),text(k))));
    const captured=new Set(entries.flatMap(e=>Array.isArray(e.k)?e.k:[]));
    const groups={S:0,K:0,B:0,capturedS:0,capturedK:0,capturedB:0};
    allKsb.forEach((_,k)=>{if(groups[k[0]]!==undefined)groups[k[0]]++});
    captured.forEach(k=>{if(groups["captured"+k[0]]!==undefined)groups["captured"+k[0]]++});
    const unitDetails=units.map(u=>{
      const es=entries.filter(e=>e.u===u[0]);
      return {unit:u[0],entries:es.length,photos:es.reduce((n,e)=>n+(Array.isArray(e.photoIds)?e.photoIds.length:(Number.isFinite(Number(e.photoCount))?Number(e.photoCount):(Array.isArray(e.p)?e.p.length:0))),0),words:es.reduce((n,e)=>n+String(e.w||"").trim().split(/\s+/).filter(Boolean).length,0),ksbs:[...new Set(es.flatMap(e=>Array.isArray(e.k)?e.k:[]))],evidence:es.map(e=>({date:formatUKDate(e.savedAt||e.d||""),photos:Array.isArray(e.photoIds)?e.photoIds.length:(Number.isFinite(Number(e.photoCount))?Number(e.photoCount):(Array.isArray(e.p)?e.p.length:0)),notes:e.w||"",ksbs:Array.isArray(e.k)?e.k:[]}))};
    });
    const totalOTJ=hours.reduce((n,x)=>n+Number(x.n||0),0), meta=courseProgressMeta(), p=read("evia7-profile",{});
    let elapsed=0;
    if(p.start&&p.end){const s=new Date(p.start+"T00:00:00").getTime(),e=new Date(p.end+"T23:59:59").getTime();if(e>s)elapsed=Math.max(0,Math.min(1,(Date.now()-s)/(e-s)));}
    const history=confidenceHistory().filter(x=>x.course===course&&Array.isArray(x.scores)), current=history[history.length-1]||null, previous=history[history.length-2]||null;
    const confidenceAverage=current&&current.scores.length?Math.round(current.scores.reduce((n,x)=>n+x.score,0)/current.scores.length*100)/100:null;
    const pct=type=>{const t=latestTest(type);return t&&typeof t.pct==="number"?t.pct:null};
    const tests={discussion:latestTest("discussion"),epa:latestTest("epa"),maths:latestTest("maths"),english:latestTest("english")};
    const testDetails={};Object.keys(tests).forEach(k=>{const t=tests[k];testDetails[k]=t?{pct:t.pct,score:t.score,total:t.total,questions:t.questions||[],savedAt:t.savedAt||null}:null});
    const otjDetails=hours.map(x=>({date:formatUKDate(x.savedAt||x.d||""),hours:Number(x.n||0),description:x.description||""}));
    return {covered:covered.size,units:units.length,unitGap:Math.max(0,units.length-covered.size),completion:units.length?Math.round(covered.size/units.length*100):0,entries:entries.length,totalPhotos,totalWords,unitDetails,otjDetails,ksbTotal:allKsb.size,ksbCaptured:captured.size,ksbCompletion:allKsb.size?Math.round(captured.size/allKsb.size*100):0,ksbGroups:groups,totalOTJ,otjEntries:hours.length,otjBatches:otjBatches.length,otjTarget:meta.otjTarget,otjBehind:meta.otjTarget?totalOTJ<Math.max(1,meta.otjTarget*elapsed):false,elapsed,timePercent:Math.round(elapsed*100),tests:testDetails,confidenceAverage,confidenceRatings:current?.scores||[],previousConfidenceRatings:previous?.scores||[],confidenceChecks:history.length,lowConfidence:(current?.scores||[]).filter(x=>x.score<=2).map(x=>x.area)};
  }
  function targetStatus(t){
    if(t.completed||t.progress>=100)return "complete";
    if(new Date(t.deadline+"T23:59:59").getTime()<Date.now())return "overdue";
    return "active";
  }
  function targetHtml(t){
    const status=targetStatus(t), label=status==="complete"?"Completed":status==="overdue"?"Overdue":"Active";
    return '<div class="target-item '+status+'"><div><strong>'+escLocal(t.title)+'</strong><p>'+escLocal(t.reason)+'</p><small>Due '+escLocal(new Date(t.deadline+"T00:00:00").toLocaleDateString("en-GB"))+' · '+label+'</small></div><b>'+Math.min(100,Math.max(0,Number(t.progress||0)))+'%</b></div>';
  }
  function quickTarget(m){
    const targets=read(TARGET_KEY,[]).filter(t=>t.course===course&&!t.completed);
    if(targets.length)return targets[0];
    const t=targetReasoning(m)[0];t.course=course;write(TARGET_KEY,[t]);return t;
  }
  function progressReview(){
    const m=metrics(), target=quickTarget(m);
    const name=String(read("evia7-profile",{}).name||"").split(/\s+/)[0];
    const test=latestTests();
    const testSummary=["epa","maths","english"].filter(t=>test[t]).map(t=>testLabel(t)+" "+test[t].pct+"%").join(" · ");
    reply('<strong>Progress review'+(name?", "+escLocal(name):"")+'</strong><br>Course evidence: '+m.completion+'% ('+m.covered+'/'+m.units+' units).<br>Off-the-job learning: '+m.totalOTJ.toFixed(1)+(m.otjTarget?" / "+m.otjTarget:"")+" hours."+(testSummary?"<br>Test results: "+escLocal(testSummary)+".":"")+
      '<br><br><strong>Quick target</strong><br>I’ve set a target to help you catch up: '+escLocal(target.title)+'. Aim to complete it by '+escLocal(new Date(target.deadline+"T00:00:00").toLocaleDateString("en-GB"))+'.<br><br><button class="chat-pill" id="start-full-review"><strong>Start full review</strong></button>');
    setTimeout(()=>{const b=$("#start-full-review");if(b)b.onclick=()=>fullReview();},950);
  }
  function fullReview(){
    const m=metrics(), targets=targetReasoning(m).map(t=>({...t,course})), test=latestTests(), history=confidenceHistory().filter(x=>x.course===course&&Array.isArray(x.scores)), p=read("evia7-profile",{}), name=String(p.name||"").trim(), id="review-"+Date.now();
    const review={id,course,date:new Date().toISOString(),learner:name,profile:{start:p.start||"",end:p.end||""},metrics:m,tests:{discussion:test.discussion?.pct??null,epa:test.epa?.pct??null,maths:academicEnabled("maths")?(test.maths?.pct??null):null,english:academicEnabled("english")?(test.english?.pct??null):null},testDetails:m.tests,confidence:m.confidenceRatings,previousConfidence:m.previousConfidenceRatings,targets};
    const all=read(REVIEW_KEY,[]);all.push(review);write(REVIEW_KEY,all.slice(-30));
    const existing=read(TARGET_KEY,[]).filter(t=>t.course!==course||t.completed);write(TARGET_KEY,existing.concat(targets));
    renderFullReview(review);
  }
  function reviewDashboardHtml(review){ensureReviewStyles();const m=review.metrics,p=read("evia7-profile",{}),name=String(review.learner||p.name||"Apprentice").split(/\\s+/)[0]||"Apprentice",timePct=Number(m.timePercent||m.elapsed*100||0),ksbPct=Number(m.ksbCompletion||0),strengthCounts={strong:0,good:0,weak:0};m.unitDetails.forEach(u=>{const s=evidenceStrength(u.photos,u.words);if(s)strengthCounts[s]++});const testCards=["maths","english","epa","discussion"].map(k=>{const t=m.tests[k],enabled=k==="maths"||k==="english"?academicEnabled(k):true;if(!enabled)return stat(testLabel(k),"Not enabled");if(!t)return stat(testLabel(k),"No test yet","0 attempts");const all=read(TEST_KEY,[]).filter(x=>x.course===course&&x.type===k),scores=all.map(x=>Number(x.pct)||0);return stat(testLabel(k),t.pct+"%",all.length+" attempts · best "+Math.max(...scores)+"%")}).join(""),recentTests=["maths","english","epa","discussion"].flatMap(k=>read(TEST_KEY,[]).filter(x=>x.course===course&&x.type===k).map(x=>({k,pct:Number(x.pct)||0,date:x.savedAt||""}))).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(-4),testChart=recentTests.length?'<div class="review-chart">'+recentTests.map(x=>'<div class="review-chart-col"><i style="height:'+Math.max(4,Math.min(100,x.pct))+'%"></i><span>'+escLocal(testLabel(x.k))+'<br>'+x.pct+'%</span></div>').join("")+'</div>':'<p class="review-sub">No test attempts recorded yet.</p>',unitHtml=m.unitDetails.map(u=>{const s=evidenceStrength(u.photos,u.words);return '<details class="review-detail"><summary><strong>'+escLocal(u.unit)+'</strong><span>'+u.entries+' occasions · '+u.photos+' photos</span></summary><div class="review-unit-strength"><span class="review-strength-bars">'+[0,1,2].map(i=>'<i class="'+(i<(s==="strong"?3:s==="good"?2:s==="weak"?1:0)?"filled":"")+'"></i>').join("")+'</span><strong>'+strengthLabel(s)+'</strong></div><p class="review-generated">'+escLocal(unitStatement(u.unit,name))+'</p><p>'+u.words+' written words · '+u.ksbs.length+' KSBs captured.</p>'+u.evidence.map(e=>'<div class="review-detail-row"><strong>'+escLocal(e.date)+'</strong><span>'+e.photos+' photos · '+escLocal(e.ksbs.join(", "))+'</span></div>').join("")+'</details>'}).join(""),subjectCards=["maths","english"].map(k=>'<div class="review-stat"><span>'+testLabel(k)+'</span><strong>'+(academicEnabled(k)?"Enabled":"Not enabled")+'</strong><small>'+(!academicEnabled(k)?"Not part of current learner setup.":m.tests[k]?m.tests[k].pct+"% latest · "+read(TEST_KEY,[]).filter(x=>x.course===course&&x.type===k).length+" attempts":"Enabled · no test completed yet")+'</small></div>').join(""),conf=m.confidenceRatings.length?m.confidenceRatings.map(x=>'<span class="review-pill">'+escLocal(x.area)+': '+x.score+'/4</span>').join(""):'<span class="review-pill">No confidence check yet</span>';return '<div class="review-dashboard"><section class="review-section"><h3>Time on programme vs KSB coverage</h3><p class="review-sub">Elapsed course time compared with KSBs captured in evidence.</p>'+bar("Time on programme",timePct)+bar("KSBs captured",ksbPct)+'</section><section class="review-section"><h3>KSB coverage</h3><div class="review-stat-grid">'+stat("Overall",m.ksbCaptured+"/"+m.ksbTotal,ksbPct+"% captured")+stat("Skills",m.ksbGroups.capturedS+"/"+m.ksbGroups.S,m.ksbGroups.S?Math.round(m.ksbGroups.capturedS/m.ksbGroups.S*100)+"%":"0%")+stat("Knowledge",m.ksbGroups.capturedK+"/"+m.ksbGroups.K,m.ksbGroups.K?Math.round(m.ksbGroups.capturedK/m.ksbGroups.K*100)+"%":"0%")+stat("Behaviours",m.ksbGroups.capturedB+"/"+m.ksbGroups.B,m.ksbGroups.B?Math.round(m.ksbGroups.capturedB/m.ksbGroups.B*100)+"%":"0%")+'</div></section><section class="review-section"><h3>Evidence portfolio</h3><div class="review-stat-grid">'+stat("Evidence occasions",m.entries)+stat("Photos",m.totalPhotos)+stat("Written words",m.totalWords)+stat("Units covered",m.covered+"/"+m.units,m.completion+"%")+'</div><div class="review-pills"><span class="review-pill">Strong: '+strengthCounts.strong+'</span><span class="review-pill">Good: '+strengthCounts.good+'</span><span class="review-pill">Weak: '+strengthCounts.weak+'</span></div></section><section class="review-section"><h3>Maths & English</h3><div class="review-stat-grid">'+subjectCards+'</div></section><section class="review-section"><h3>EPA & practice tests</h3><div class="review-stat-grid">'+testCards+'</div>'+testChart+'</section><section class="review-section"><h3>Confidence</h3><div class="review-stat-grid">'+stat("Checks",m.confidenceChecks)+stat("Latest average",m.confidenceAverage!==null?m.confidenceAverage+"/4":"No check")+'</div><div class="review-pills">'+conf+'</div></section><section class="review-section"><h3>Off-the-job learning</h3><div class="review-stat-grid">'+stat("Total OTJ",m.totalOTJ.toFixed(2)+" hours")+stat("Learning entries",m.otjEntries)+stat("OTJ PDF batches",m.otjBatches)+'</div></section><section class="review-section"><h3>Evidence by unit</h3>'+unitHtml+'</section><section class="review-section"><h3>Targets</h3>'+review.targets.map(targetHtml).join("")+'</section></div>'}
  function renderFullReview(review){ensureReviewStyles();reply('<strong>Full progress review complete</strong><br>I’ve saved the complete review to your Portfolio.<br><br>'+reviewDashboardHtml(review)+'<br><button class="chat-pill" id="open-saved-review"><strong>Open saved review</strong></button>');setTimeout(()=>{const b=document.querySelector("#open-saved-review");if(b)b.onclick=()=>showReview(review.id)},950)}
  function showReview(id){const review=read(REVIEW_KEY,[]).find(x=>x.id===id);if(!review)return;if(review.course===course){const fresh=metrics();review.metrics={...review.metrics,totalPhotos:fresh.totalPhotos,unitDetails:fresh.unitDetails,timePercent:fresh.timePercent,elapsed:fresh.elapsed};const all=read(REVIEW_KEY,[]),idx=all.findIndex(x=>x.id===id);if(idx>=0){all[idx]=review;write(REVIEW_KEY,all)}}startReviewConversation(review)}
  function saveReviewUpdate(review){const all=read(REVIEW_KEY,[]),idx=all.findIndex(x=>x.id===review.id);if(idx>=0){all[idx]=review;write(REVIEW_KEY,all)}}
  function askReviewText(review,key,prompt,next){
    const chatEl=$("#chat");if(!chatEl){next();return;}
    const blockId="review-text-"+Date.now()+"-"+Math.random().toString(36).slice(2,7);
    chatEl.insertAdjacentHTML("beforeend",'<div id="'+blockId+'" class="review-text-block"><div class="bubble evia"><strong>'+escLocal(prompt)+'</strong></div><textarea class="test-response" data-review-answer placeholder="Type your answer..."></textarea><button type="button" class="chat-pill test-submit" data-review-submit><strong>Save answer</strong></button></div>');
    const block=document.getElementById(blockId);
    if(!block){next();return}
    const input=block.querySelector("[data-review-answer]");
    const submit=block.querySelector("[data-review-submit]");
    if(!input||!submit){next();return}
    const advance=()=>{
      if(block.dataset.completed==="1")return;
      block.dataset.completed="1";
      const answer=String(input.value||"").trim();
      if(!answer)return;
      try{
        review.reflection=review.reflection||{};
        review.reflection[key]=answer;
        saveReviewUpdate(review);
      }catch(err){console.error("Evia review save failed",err)}
      input.disabled=true;
      submit.disabled=true;
      submit.remove();
      chatEl.insertAdjacentHTML("beforeend",'<div class="bubble user">'+escLocal(answer)+'</div>');
      chatEl.scrollTop=chatEl.scrollHeight;
      window.setTimeout(next,0);
    };
    submit.onclick=e=>{e.preventDefault();e.stopPropagation();advance()};
    input.addEventListener("keydown",e=>{
      if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();advance()}
    });
    chatEl.scrollTop=chatEl.scrollHeight;
  }
  function startReviewReflectionQuestions(review){
    const questions=[
      ["wellbeing","How are things going for you at the moment? Is there anything affecting your learning, work or wellbeing that you would like to tell me?"],
      ["support","Is there anything you need help or support with? If not, type “Nothing at the moment”."],
      ["courseComments","How are you finding your course?"],
      ["successes","What have you been most successful with since your last review?"],
      ["challenges","What have you found challenging?"]
    ];
    let index=0;
    const askNext=()=>{
      if(index>=questions.length){
        const subjects=shuffle(["EDI","Prevent","Safeguarding","British Values","Health & Safety"]).slice(0,2);
        review.reviewLearning=review.reviewLearning||{};
        review.reviewLearning.subjects=subjects;
        runReviewLesson(review,subjects,0,()=>{
          const employer=review.employerFeedback;
          const chatEl=$("#chat");
          chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>Employer feedback</strong><br>'+(employer?'Your employer has submitted feedback for this review.':'I can include employer feedback, but it must be submitted directly by the employer through an authenticated employer review form. I won\'t treat learner-entered comments as an employer statement.')+'</div>');
          if(!employer)chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia">For this test version, the verified employer portal is not connected yet. The review will continue without an employer statement.</div>');
          chatEl.insertAdjacentHTML("beforeend",'<button type="button" class="chat-pill test-submit" data-open-review-final><strong>Open full review</strong></button>');
          const open=chatEl.querySelector("[data-open-review-final]");
          if(open)open.onclick=e=>{e.preventDefault();open.remove();openSavedReview(review)};
          chatEl.scrollTop=chatEl.scrollHeight;
        });
        return;
      }
      const [key,prompt]=questions[index++];
      askReviewText(review,key,prompt,askNext);
    };
    askNext();
  }
  function runReviewLesson(review,subjects,index,done){
    if(index>=subjects.length){
      review.reviewLearning=review.reviewLearning||{};
      review.reviewLearning.completedAt=new Date().toISOString();
      review.reviewLearning.subjects=subjects;
      saveReviewUpdate(review);
      done();
      return;
    }
    const subject=subjects[index], lessons={
      "EDI":{q:"Which approach best supports an inclusive workplace?",a:["Treat everyone exactly the same regardless of their circumstances","Make reasonable adjustments and treat people fairly and respectfully","Only involve people who have the same background as you"],correct:1,why:"Equality, diversity and inclusion means treating people fairly, respecting differences and removing unnecessary barriers."},
      "Prevent":{q:"What should you do if you are concerned that someone may be being drawn towards extremist ideas?",a:["Ignore it unless they directly ask for help","Challenge them yourself and investigate their beliefs","Follow your organisation's safeguarding or Prevent reporting route"],correct:2,why:"Prevent concerns should be handled through the appropriate safeguarding and Prevent procedures. Do not investigate or confront someone yourself."},
      "Safeguarding":{q:"If you are worried about someone's safety, what should you normally do?",a:["Keep it to yourself","Follow your organisation's safeguarding procedure and tell the appropriate person","Post the concern in a group chat"],correct:1,why:"Safeguarding concerns should be passed to the appropriate safeguarding lead or route in line with the organisation's procedure."},
      "British Values":{q:"Which set is commonly used for the fundamental British Values in education and training?",a:["Democracy, rule of law, individual liberty, mutual respect and tolerance","Competition, profit, speed, strength and independence","Attendance, punctuality, productivity, teamwork and promotion"],correct:0,why:"The commonly referenced British Values are democracy, the rule of law, individual liberty, and mutual respect and tolerance for those with different faiths and beliefs."},
      "Health & Safety":{q:"What is the safest approach when you identify a workplace hazard?",a:["Carry on if the job is nearly finished","Ignore it if nobody has been injured","Stop or make the situation safe and follow the relevant risk assessment and reporting procedure"],correct:2,why:"Hazards should be controlled promptly using the relevant safe system of work, risk assessment and reporting arrangements."}
    }[subject];
    if(!lesson){done();return;}
    const chatEl=$("#chat");
    const questionId="review-lesson-"+Date.now()+"-"+index+"-"+Math.random().toString(36).slice(2,7);
    chatEl.insertAdjacentHTML("beforeend",'<div id="'+questionId+'" class="review-lesson-block"><div class="bubble evia"><strong>'+escLocal(subject)+' quick lesson</strong><br>'+escLocal(lesson.why)+'</div><div class="bubble evia"><strong>Quick check</strong><br>'+escLocal(lesson.q)+'</div><div class="rating-options">'+lesson.a.map((a,n)=>'<button type="button" class="rating-pill" data-review-lesson="'+n+'"><strong>'+String.fromCharCode(65+n)+'. '+escLocal(a)+'</strong></button>').join("")+'</div></div>');
    const block=document.getElementById(questionId);
    if(!block)return;
    chatEl.scrollTop=chatEl.scrollHeight;
    const answerButtons=Array.from(block.querySelectorAll("[data-review-lesson]"));
    answerButtons.forEach(button=>{
      button.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
        if(block.dataset.answered==="1")return;
        block.dataset.answered="1";
        const chosen=Number(button.dataset.reviewLesson);
        answerButtons.forEach(x=>{x.disabled=true;x.setAttribute("aria-disabled","true")});
        answerButtons.forEach(x=>{
          if(Number(x.dataset.reviewLesson)===lesson.correct)x.classList.add("correct");
        });
        if(chosen!==lesson.correct)button.classList.add("wrong");
        review.reviewLearning=review.reviewLearning||{subjects:subjects,results:[]};
        review.reviewLearning.results=review.reviewLearning.results||[];
        review.reviewLearning.results.push({subject,correct:chosen===lesson.correct,chosen,correctAnswer:lesson.correct,completedAt:new Date().toISOString()});
        saveReviewUpdate(review);
        const nextLabel=index+1<subjects.length?"Next lesson":"Finish review questions";
        block.insertAdjacentHTML("beforeend",'<div class="bubble evia">'+(chosen===lesson.correct?"Correct. ":"Not quite. ")+escLocal(lesson.why)+'</div><button type="button" class="chat-pill test-submit" data-review-lesson-next><strong>'+nextLabel+'</strong></button>');
        const next=block.querySelector("[data-review-lesson-next]");
        if(next)next.onclick=e=>{
          e.preventDefault();
          e.stopPropagation();
          if(next.disabled)return;
          next.disabled=true;
          runReviewLesson(review,subjects,index+1,done);
        };
        chatEl.scrollTop=chatEl.scrollHeight;
      };
    });
  }
  function startReviewConversation(review){
    const chatEl=$("#chat");if(!chatEl){openSavedReview(review);return}
    chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>Let\'s complete your review reflection</strong><br>Before we open the full review, I\'ll ask a few short questions about wellbeing, your course and your progress.</div>');
    chatEl.scrollTop=chatEl.scrollHeight;
    startReviewReflectionQuestions(review);
  }
  function openSavedReview(review){ensureReviewStyles();$("#modal-root").innerHTML='<div class="overlay"><section class="sheet review-sheet"><div class="sheet-head"><div><div class="chat-kicker">EVIA</div><h2>Full progress review · '+formatUKDate(review.date)+'</h2></div><button class="close" id="review-close" aria-label="Close">×</button></div><div class="review-content">'+reviewDashboardHtml(review)+'<section class="review-section"><h3>Your review reflection</h3><p class="review-sub">Your answers are included as part of this review.</p><div class="review-generated">'+Object.entries(review.reflection||{}).map(([k,v])=>'<p><strong>'+escLocal({wellbeing:"Wellbeing",support:"Support",courseComments:"Course comments",successes:"Successes",challenges:"Challenges"}[k]||k)+':</strong> '+escLocal(v)+'</p>').join("")+'</div></section><section class="review-section"><h3>Review learning</h3><p class="review-sub">Two short learning sessions completed as part of this review.</p><div class="review-pills">'+((review.reviewLearning?.subjects||[]).map(s=>'<span class="review-pill">'+escLocal(s)+'</span>').join("")||'<span class="review-pill">Not completed</span>')+'</div></section><section class="review-section"><h3>Employer feedback</h3><p class="review-sub">Employer feedback is only shown here as employer-submitted when it has been entered through the authenticated employer review process.</p>'+(review.employerFeedback?'<p class="review-generated"><strong>Submitted by:</strong> '+escLocal(review.employerFeedback.name)+'<br><strong>Company:</strong> '+escLocal(review.employerFeedback.company)+'<br><strong>Date:</strong> '+escLocal(review.employerFeedback.date)+'</p><p class="review-generated">'+escLocal(review.employerFeedback.comments||"")+'</p>' : '<p>No verified employer feedback has been submitted for this review.</p>')+'</section></div><div class="review-actions"><button class="secondary" id="review-pdf">Download PDF</button></div></section></div>';$("#review-close").onclick=()=>$("#modal-root").innerHTML="";$("#review-pdf").onclick=()=>downloadReviewPdf(review)}
    function downloadReviewPdf(review){
    const p=read("evia7-profile",{}),m=review.metrics,win=window.open("","_blank");
    if(!win){alert("Please allow pop-ups to download the progress review PDF.");return;}
    const tests=[["Discussion",review.tests.discussion],["EPA MCQ",review.tests.epa],["Maths",review.tests.maths],["English",review.tests.english]].filter(([,v])=>v!==null);
    const testHtml=tests.map(([l,v])=>'<div class="stat"><strong>'+l+'</strong><span>'+v+'%</span></div>').join("");
    const unitHtml=m.unitDetails.map(u=>'<section class="unit"><h3>'+escLocal(u.unit)+'</h3><p><strong>'+u.entries+'</strong> evidence entries · <strong>'+u.photos+'</strong> photos · <strong>'+u.words+'</strong> written words · <strong>'+u.ksbs.length+'</strong> KSBs captured</p>'+u.evidence.map(e=>'<div class="record"><strong>'+escLocal(e.date)+'</strong><span>'+e.photos+' photos'+(e.ksbs.length?' · '+escLocal(e.ksbs.join(", ")):"")+'</span>'+(e.notes?'<p>'+escLocal(e.notes)+'</p>':"")+'</div>').join("")+'</section>').join("");
    const otjHtml=m.otjDetails.map(x=>'<div class="record"><strong>'+escLocal(x.date)+'</strong><span>'+x.hours.toFixed(2)+' hours</span>'+(x.description?'<p>'+escLocal(x.description)+'</p>':"")+'</div>').join("");
    const confHtml=m.confidenceRatings.length?m.confidenceRatings.map(x=>'<span class="pill">'+escLocal(x.area)+': '+x.score+'/4</span>').join(""):'No confidence check recorded';
    const prevConf=m.previousConfidenceRatings.length?m.previousConfidenceRatings.map(x=>'<span class="pill">'+escLocal(x.area)+': '+x.score+'/4</span>').join(""):'No previous confidence check recorded';
    const targets=review.targets.map((t,i)=>'<section class="target"><strong>'+(i+1)+'. '+escLocal(t.title)+'</strong><p>'+escLocal(t.reason)+'</p><span>Due '+new Date(t.deadline+"T00:00:00").toLocaleDateString("en-GB")+' · '+(targetStatus(t)==="complete"?"Completed":targetStatus(t)==="overdue"?"Overdue":"Active")+' · '+Number(t.progress||0)+'%</span></section>').join("");
    const qHtml=Object.entries(m.tests).filter(([,t])=>t).map(([k,t])=>'<section class="test"><h3>'+escLocal(testLabel(k))+'</h3><p><strong>'+t.score+' / '+t.total+'</strong> · '+t.pct+'% · '+escLocal(t.savedAt||"")+'</p>'+t.questions.map((q,i)=>'<div class="record"><strong>Question '+(i+1)+'</strong><p>'+escLocal(q.question||q.prompt||"")+'</p>'+(q.chosen!==undefined?'<p>Answer: '+escLocal(q.chosen)+' · '+(q.ok?"Correct":"Incorrect")+'</p>':"")+(q.answer!==undefined?'<p>Response: '+escLocal(q.answer)+'</p>':"")+(q.explanation?'<p>Explanation: '+escLocal(q.explanation)+'</p>':"")+(q.covered?'<p>Areas covered: '+escLocal(q.covered.join(", "))+'</p>':"")+'</div>').join("")+'</section>').join("");
    win.document.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Evia Progress Review</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;color:#172033;font:10pt -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.45}header{border-bottom:2px solid #e6b800;padding-bottom:14px;margin-bottom:18px}h1{font-size:23pt;margin:4px 0}h2{font-size:16pt;margin:20px 0 9px}h3{font-size:12pt;margin:0 0 6px}.eyebrow{font-size:8pt;letter-spacing:.13em;color:#667085;font-weight:800}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.stat{border:1px solid #e4e7ec;border-radius:10px;padding:10px;display:flex;justify-content:space-between}.unit,.test,.target{border:1px solid #e4e7ec;border-radius:10px;padding:11px;margin:8px 0;break-inside:avoid}.record{border-top:1px solid #eef0f3;padding:8px 0}.record:first-of-type{border-top:0}.record strong{display:block}.record span,.target span{color:#667085;font-size:9pt}.record p{margin:4px 0}.pill{display:inline-block;border:1px solid #dfe3e8;border-radius:999px;padding:4px 7px;margin:2px}.small{color:#667085;font-size:9pt}.page-break{break-before:page}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><header><div class="eyebrow">EVIA · FULL PROGRESS REVIEW</div><h1>'+escLocal(p.name||"Apprentice")+'</h1><p>'+escLocal(data().name)+' · '+escLocal(data().std)+' · Review date '+new Date(review.date).toLocaleDateString("en-GB")+'</p></header><h2>Course progress</h2><div class="grid"><div class="stat"><strong>Unit completion</strong><span>'+m.completion+'% ('+m.covered+'/'+m.units+')</span></div><div class="stat"><strong>Evidence entries</strong><span>'+m.entries+'</span></div><div class="stat"><strong>Evidence photos</strong><span>'+m.totalPhotos+'</span></div><div class="stat"><strong>Written evidence</strong><span>'+m.totalWords+' words</span></div><div class="stat"><strong>KSB coverage</strong><span>'+m.ksbCompletion+'% ('+m.ksbCaptured+'/'+m.ksbTotal+')</span></div><div class="stat"><strong>OTJ learning</strong><span>'+m.totalOTJ.toFixed(2)+(m.otjTarget?" / "+m.otjTarget:"")+' hours</span></div></div><p class="small">KSB breakdown: Skills '+m.ksbGroups.capturedS+'/'+m.ksbGroups.S+' · Knowledge '+m.ksbGroups.capturedK+'/'+m.ksbGroups.K+' · Behaviours '+m.ksbGroups.capturedB+'/'+m.ksbGroups.B+'.</p><h2>Unit-by-unit evidence tracking</h2>'+unitHtml+'<h2>Off-the-job learning records</h2>'+otjHtml+'<h2>Practice and tests</h2><div class="grid">'+testHtml+'</div>'+qHtml+'<h2>Confidence tracking</h2><p>'+m.confidenceChecks+' checks recorded'+(m.confidenceAverage!==null?' · latest average '+m.confidenceAverage+'/4':'')+'.</p><p><strong>Latest:</strong> '+confHtml+'</p><p><strong>Previous:</strong> '+prevConf+'</p>'+(m.lowConfidence.length?'<p><strong>Low-confidence areas:</strong> '+escLocal(m.lowConfidence.join(", "))+'</p>':"")+'<h2>Review targets</h2>'+targets+'</body></html>');
    win.document.close();win.focus();setTimeout(()=>win.print(),250);
  }
  function targetsCardHtml(){
    const targets=eviaGetTargets().sort((a,b)=>a.priority-b.priority);
    if(!targets.length)return '<div class="card targets-card"><div class="section-title">TARGETS</div><h2>My targets</h2><p>No active targets yet. Complete a full progress review to create five.</p></div>';
    return '<div class="card targets-card"><div class="section-title">TARGETS</div><h2>My targets</h2>'+targets.map(t=>'<div class="target-item '+targetStatus(t)+'"><div><strong>'+escLocal(t.title)+'</strong><p>'+escLocal(t.reason)+'</p><small>Due '+new Date(t.deadline+"T00:00:00").toLocaleDateString("en-GB")+(targetStatus(t)==="overdue"?" · Overdue":"")+'</small></div>'+(targetStatus(t)==="complete"?'<b>Completed</b>':'<button class="secondary" data-target-complete="'+escLocal(t.id||"")+'">Mark complete</button>')+'</div>').join("")+'</div>';
  }
  function bindTargets(){
    document.querySelectorAll("[data-target-complete]").forEach(b=>b.onclick=()=>{
      const all=read(TARGET_KEY,[]),idx=all.findIndex(t=>t.course===course&&String(t.id)===String(b.dataset.targetComplete));
      if(idx<0)return;all[idx].completed=true;all[idx].progress=100;all[idx].completedAt=new Date().toISOString();write(TARGET_KEY,all);
      if(typeof progress==="function")progress();
    });
  }
  window.eviaTargetsCardHtml=targetsCardHtml;
  window.eviaBindTargets=bindTargets;
  window.eviaTestMe=eviaTestMe;
  window.eviaProgressReview=progressReview;
  window.eviaFullReview=fullReview;
  window.eviaShowReview=showReview;
  window.eviaDownloadReviewPdf=downloadReviewPdf;
  window.eviaGetReviews=()=>read(REVIEW_KEY,[]).filter(x=>x.course===course).slice().reverse();
  window.eviaGetTargets=()=>read(TARGET_KEY,[]).filter(x=>x.course===course);
  window.eviaTargetStatus=targetStatus;
  window.eviaTargetHtml=targetHtml;
})();
