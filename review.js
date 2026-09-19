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
          document.querySelector(".rating-options")?.remove();
          const mini=( !ok && isAcademic && q[5] && Array.isArray(q[6]) ) ? '<div class="micro-teach"><div class="tag">Mini-session</div><p><strong>'+escLocal(q[5])+'</strong></p><div class="rating-options">'+q[6].map((a,n)=>'<button class="rating-pill" data-micro-answer="'+encodeURIComponent(a)+'"><strong>'+String.fromCharCode(65+n)+'. '+escLocal(a)+'</strong></button>').join("")+'</div><div class="micro-result" id="micro-result"></div></div>' : ( !ok ? '<br><br><strong>Mini-session:</strong> Read the explanation, then say the key point back to yourself before continuing.' : '' );
          chatEl.insertAdjacentHTML("beforeend",'<div class="bubble evia"><strong>'+(ok?"Correct":"Not quite")+'</strong><br>'+(ok?"That is correct.":"The correct answer is: "+escLocal(correct)+".")+'<br><br>'+escLocal(explanation)+mini+'</div>'+(mini?'':'<button class="chat-pill test-submit" data-next-test><strong>'+(i+1<qs.length?"Next question":"Finish")+'</strong></button>'));
          if(mini){
            document.querySelectorAll("[data-micro-answer]").forEach(mb=>mb.onclick=()=>{
              const microChosen=decodeURIComponent(mb.dataset.microAnswer),microCorrect=String(q[7]??q[6][0]);
              document.querySelectorAll("[data-micro-answer]").forEach(x=>x.disabled=true);
              const box=document.getElementById("micro-result");
              if(microChosen===microCorrect){
                mb.classList.add("correct");
                box.innerHTML='<strong>Mini-session complete.</strong> You can move on.';
                chatEl.insertAdjacentHTML("beforeend",'<button class="chat-pill test-submit" data-next-test><strong>'+(i+1<qs.length?"Next question":"Finish")+'</strong></button>');
              }else{
                mb.classList.add("wrong");
                box.innerHTML='Not quite. The correct answer is <strong>'+escLocal(microCorrect)+'</strong>.';
                document.querySelectorAll("[data-micro-answer]").forEach(x=>{if(decodeURIComponent(x.dataset.microAnswer)===microCorrect){x.disabled=false;x.classList.add("correct")}});
              }
              scroll();
              const next=document.querySelector("[data-next-test]");
              if(next)next.onclick=()=>{next.remove();i++;ask()};
            });
          }else{
            document.querySelector("[data-next-test]").onclick=()=>{document.querySelector("[data-next-test]").remove();i++;ask()};
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
    if(metrics.otjBehind)add("Build your off-the-job learning hours","Your recorded OTJ progress is behind the planned course timeline.",4,"otj");
    else add("Keep your off-the-job learning record current","Continue recording eligible learning activity so your progress remains visible.",4,"otj");
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
      return {unit:u[0],entries:es.length,photos:es.reduce((n,e)=>n+(Array.isArray(e.photoIds)?e.photoIds.length:(Number.isFinite(Number(e.photoCount))?Number(e.photoCount):(Array.isArray(e.p)?e.p.length:0))),0),words:es.reduce((n,e)=>n+String(e.w||"").trim().split(/\s+/).filter(Boolean).length,0),ksbs:[...new Set(es.flatMap(e=>Array.isArray(e.k)?e.k:[]))],evidence:es.map(e=>({date:e.savedAt||e.d||"",photos:Array.isArray(e.p)?e.p.length:0,notes:e.w||"",ksbs:Array.isArray(e.k)?e.k:[]}))};
    });
    const totalOTJ=hours.reduce((n,x)=>n+Number(x.n||0),0), meta=courseProgressMeta(), p=read("evia7-profile",{});
    let elapsed=0;
    if(p.start&&p.end){const s=new Date(p.start+"T00:00:00").getTime(),e=new Date(p.end+"T23:59:59").getTime();if(e>s)elapsed=Math.max(0,Math.min(1,(Date.now()-s)/(e-s)));}
    const history=confidenceHistory().filter(x=>x.course===course&&Array.isArray(x.scores)), current=history[history.length-1]||null, previous=history[history.length-2]||null;
    const confidenceAverage=current&&current.scores.length?Math.round(current.scores.reduce((n,x)=>n+x.score,0)/current.scores.length*100)/100:null;
    const pct=type=>{const t=latestTest(type);return t&&typeof t.pct==="number"?t.pct:null};
    const tests={discussion:latestTest("discussion"),epa:latestTest("epa"),maths:latestTest("maths"),english:latestTest("english")};
    const testDetails={};Object.keys(tests).forEach(k=>{const t=tests[k];testDetails[k]=t?{pct:t.pct,score:t.score,total:t.total,questions:t.questions||[],savedAt:t.savedAt||null}:null});
    const otjDetails=hours.map(x=>({date:x.savedAt||x.d||"",hours:Number(x.n||0),description:x.description||""}));
    return {covered:covered.size,units:units.length,unitGap:Math.max(0,units.length-covered.size),completion:units.length?Math.round(covered.size/units.length*100):0,entries:entries.length,totalPhotos,totalWords,unitDetails,otjDetails,ksbTotal:allKsb.size,ksbCaptured:captured.size,ksbCompletion:allKsb.size?Math.round(captured.size/allKsb.size*100):0,ksbGroups:groups,totalOTJ,otjEntries:hours.length,otjBatches:otjBatches.length,otjTarget:meta.otjTarget,otjBehind:meta.otjTarget?totalOTJ<Math.max(1,meta.otjTarget*elapsed):false,elapsed,tests:testDetails,confidenceAverage,confidenceRatings:current?.scores||[],previousConfidenceRatings:previous?.scores||[],confidenceChecks:history.length,lowConfidence:(current?.scores||[]).filter(x=>x.score<=2).map(x=>x.area)};
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
  function renderFullReview(review){
    const m=review.metrics, testBits=[["Discussion",review.tests.discussion],["EPA MCQ",review.tests.epa],["Maths",review.tests.maths],["English",review.tests.english]].filter(([,v])=>v!==null).map(([l,v])=>'<span class="pill">'+l+': '+v+'%</span>').join("");
    const units=m.unitDetails.map(u=>'<details class="review-detail"><summary><strong>'+escLocal(u.unit)+'</strong><span>'+u.entries+' entries · '+u.photos+' photos</span></summary><p>'+u.words+' written words · '+u.ksbs.length+' KSBs captured.</p>'+u.evidence.map(e=>'<div class="review-detail-row"><strong>'+escLocal(e.date)+'</strong><span>'+e.photos+' photos · '+e.ksbs.join(", ")+'</span>'+(e.notes?'<p>'+escLocal(e.notes)+'</p>':"")+'</div>').join("")+'</details>').join("");
    const conf=m.confidenceRatings.length?m.confidenceRatings.map(x=>'<span class="pill">'+escLocal(x.area)+': '+x.score+'/4</span>').join(""):'<span class="pill">No confidence check yet</span>';
    reply('<strong>Full progress review complete</strong><br>I’ve saved the complete review to your Portfolio.<br><br><div class="review-report"><h3>Course progress</h3><p><strong>Evidence:</strong> '+m.completion+'% ('+m.covered+'/'+m.units+' units) · '+m.entries+' entries · '+m.totalPhotos+' photos · '+m.totalWords+' written words.</p><p><strong>KSB coverage:</strong> '+m.ksbCompletion+'% ('+m.ksbCaptured+'/'+m.ksbTotal+') — S '+m.ksbGroups.capturedS+'/'+m.ksbGroups.S+' · K '+m.ksbGroups.capturedK+'/'+m.ksbGroups.K+' · B '+m.ksbGroups.capturedB+'/'+m.ksbGroups.B+'.</p><h3>Unit tracking</h3>'+units+'<h3>Off-the-job learning</h3><p>'+m.totalOTJ.toFixed(2)+' hours across '+m.otjEntries+' entries and '+m.otjBatches+' downloads.</p>'+m.otjDetails.map(x=>'<div class="review-detail-row"><strong>'+escLocal(x.date)+'</strong><span>'+x.hours.toFixed(2)+' hours</span><p>'+escLocal(x.description)+'</p></div>').join("")+'<h3>Practice & tests</h3><div class="row">'+testBits+'</div><h3>Confidence tracking</h3><p>'+m.confidenceChecks+' checks recorded'+(m.confidenceAverage!==null?' · latest average '+m.confidenceAverage+'/4':'')+'.</p><div class="row">'+conf+'</div><h3>Targets</h3>'+review.targets.map(targetHtml).join("")+'</div><br><button class="chat-pill" id="open-saved-review"><strong>Open saved review</strong></button>');
    setTimeout(()=>{const b=$("#open-saved-review");if(b)b.onclick=()=>showReview(review.id)},950);
  }
  function showReview(id){
    const review=read(REVIEW_KEY,[]).find(x=>x.id===id);if(!review)return;
    const m=review.metrics, bits=[["Discussion",review.tests.discussion],["EPA MCQ",review.tests.epa],["Maths",review.tests.maths],["English",review.tests.english]].filter(([,v])=>v!==null).map(([l,v])=>'<span class="pill">'+l+': '+v+'%</span>').join("");
    const units=m.unitDetails.map(u=>'<div class="target-item"><div><strong>'+escLocal(u.unit)+'</strong><p>'+u.entries+' evidence entries · '+u.photos+' photos · '+u.words+' words · '+u.ksbs.length+' KSBs captured</p></div></div>').join("");
    const conf=m.confidenceRatings.length?m.confidenceRatings.map(x=>'<span class="pill">'+escLocal(x.area)+': '+x.score+'/4</span>').join(""):'<span class="pill">No confidence check</span>';
    $("#modal-root").innerHTML='<div class="overlay"><section class="sheet review-sheet"><div class="sheet-head"><div><div class="chat-kicker">EVIA</div><h2>Full progress review · '+new Date(review.date).toLocaleDateString("en-GB")+'</h2></div><button class="close" id="review-close" aria-label="Close">×</button></div><div class="review-content"><h3>Course progress</h3><p><strong>Evidence:</strong> '+m.completion+'% ('+m.covered+'/'+m.units+' units) · '+m.entries+' entries · '+m.totalPhotos+' photos · '+m.totalWords+' written words.</p><p><strong>KSB coverage:</strong> '+m.ksbCompletion+'% ('+m.ksbCaptured+'/'+m.ksbTotal+') — S '+m.ksbGroups.capturedS+'/'+m.ksbGroups.S+' · K '+m.ksbGroups.capturedK+'/'+m.ksbGroups.K+' · B '+m.ksbGroups.capturedB+'/'+m.ksbGroups.B+'.</p><h3>Unit tracking</h3>'+units+'<h3>Off-the-job learning</h3><p>'+m.totalOTJ.toFixed(2)+' hours across '+m.otjEntries+' entries and '+m.otjBatches+' downloads.</p><h3>Practice & tests</h3><div class="row">'+bits+'</div><h3>Confidence tracking</h3><p>'+m.confidenceChecks+' checks recorded'+(m.confidenceAverage!==null?' · latest average '+m.confidenceAverage+'/4':'')+'.</p><div class="row">'+conf+'</div><h3>Targets</h3>'+review.targets.map(targetHtml).join("")+'</div><div class="review-actions"><button class="secondary" id="review-pdf">Download PDF</button></div></section></div>';
    $("#review-close").onclick=()=>$("#modal-root").innerHTML="";
    $("#review-pdf").onclick=()=>downloadReviewPdf(review);
  }
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
