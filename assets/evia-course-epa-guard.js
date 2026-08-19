(()=>{
"use strict";
const EPA_KEY="evia-epa-practice-v1";
let mcqState=null,mcqTimer=null,interviewState=null,practicalState=null,recorder=null,stream=null,chunks=[],recordTimer=null,recordStarted=0;
function current(){return window.EviaCourseContext?.current?.()}
function profile(){const c=current();if(!c)return null;return window.EviaEPAProfiles?.[`${c.courseId}:${c.pathway||""}`]||null}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function read(){try{return JSON.parse(localStorage.getItem(EPA_KEY)||"{}")||{}}catch{return{}}}
function write(v){try{localStorage.setItem(EPA_KEY,JSON.stringify(v))}catch{}}
function score(key){const n=Number(read()[key]);return Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):0}
function overall(){return Math.round((score("mcq")+score("practical")+score("interview"))/3)}
function clock(ms){const n=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(n/60),s=n%60;return`${m}:${String(s).padStart(2,"0")}`}
function clearTimers(){clearInterval(mcqTimer);mcqTimer=null;clearInterval(recordTimer);recordTimer=null}
function cleanupRecording(stop=true){
  clearInterval(recordTimer);recordTimer=null;
  if(stop&&recorder&&recorder.state!=="inactive"){try{recorder.onstop=null;recorder.stop()}catch{}}
  recorder=null;chunks=[];try{stream?.getTracks?.().forEach(t=>t.stop())}catch{}stream=null
}
function cleanupInterview(){cleanupRecording();if(interviewState?.recordings)interviewState.recordings.forEach(r=>{if(r?.url)try{URL.revokeObjectURL(r.url)}catch{}});interviewState=null}
function close(){clearTimers();cleanupRecording();document.querySelector(".evia-course-epa-layer")?.remove()}
function layer(body,title="EPA practice",back=null){
  clearTimers();cleanupRecording();document.querySelector(".evia-course-epa-layer")?.remove();document.querySelector(".evia-tools-layer:not(.evia-course-epa-layer)")?.remove();
  const el=document.createElement("div");el.className="evia-tools-layer evia-course-epa-layer evia-course-epa";
  el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-course-epa-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;
  document.body.appendChild(el);el.querySelector("[data-course-epa-back]").onclick=back||close;return el
}
function patchArch(){
  if(!profile())return;
  const pct=overall();
  document.querySelectorAll('[data-arch="EPA"]').forEach(b=>{b.querySelector(".arch-value")?.setAttribute("stroke-dasharray",`${pct} 100`);const n=b.querySelector(".arch-number");if(n)n.textContent=`${pct}%`})
}
function saveScore(key,pct,extra={}){
  const x=read();x[key]=Math.max(0,Math.min(100,Math.round(pct)));x.attempts=x.attempts||{};x.attempts[key]=(Number(x.attempts[key])||0)+1;x.last=x.last||{};x.last[key]={at:Date.now(),...extra};write(x);patchArch()
}
function methodCard(key,label,desc){return `<button class="evia-epa-card" data-course-epa-method="${key}"><span><b>${esc(label)}</b><small>${esc(desc)}</small></span><em>${score(key)}%</em></button>`}
function openEPA(){
  const p=profile();if(!p)return;
  cleanupInterview();
  const el=layer(`
    <p class="evia-tools-kicker">${esc(p.pathwayTitle)} · ${esc(p.standard)}</p>
    <div class="evia-epa-overall"><strong>${overall()}%</strong><span>practice readiness</span></div>
    ${methodCard("mcq","Multiple-choice mock",`${p.mcq.questions} questions · ${p.mcq.minutes} minutes · closed-book style`)}
    ${methodCard("practical","Practical mock",`${p.practical.hours} hour EPA format · at least ${p.practical.minQuestions} assessor questions`)}
    ${methodCard("interview","Interview mock",`${p.interview.minutes} minutes · at least ${p.interview.questions} questions · portfolio underpinned`)}
    <p class="evia-epa-note">Practice percentages are Evia readiness indicators, not official EPA grades. Each mock is built only from the KSBs and EPA themes for ${esc(p.pathwayTitle)}.</p>
  `,"EPA practice",close);
  el.querySelectorAll("[data-course-epa-method]").forEach(b=>b.onclick=()=>{const k=b.dataset.courseEpaMethod;if(k==="mcq")mcqIntro();else if(k==="practical")practicalIntro();else interviewIntro()})
}
function shuffled(xs){const a=[...xs],seed=(Date.now()^(Number(read()?.attempts?.mcq)||0)*2654435761)>>>0;let x=seed||123456789;const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function mcqIntro(){
  const p=profile(),el=layer(`<p class="evia-tools-kicker">${esc(p.pathwayTitle)}</p><h2>Multiple-choice mock</h2><p class="evia-tools-copy">This follows the ST0264 test format: ${p.mcq.questions} questions, four options per question and ${p.mcq.minutes} minutes. It uses only the knowledge mapped to the multiple-choice method for this pathway.</p><div class="evia-course-epa-facts"><span>Pass practice band <b>25–32</b></span><span>Distinction practice band <b>33–40</b></span></div><button class="evia-tools-primary" data-course-mcq-start>Start ${p.mcq.questions}-question test</button>`,"Multiple-choice mock",openEPA);
  el.querySelector("[data-course-mcq-start]").onclick=startMCQ
}
function startMCQ(){
  const p=profile(),questions=shuffled(p.mcqBank).slice(0,p.mcq.questions);mcqState={index:0,questions,answers:Array(questions.length).fill(null),ends:Date.now()+p.mcq.minutes*60*1000};renderMCQ();startMCQTimer()
}
function startMCQTimer(){clearInterval(mcqTimer);mcqTimer=setInterval(()=>{if(!mcqState){clearInterval(mcqTimer);return}const left=mcqState.ends-Date.now(),node=document.querySelector("[data-course-mcq-time]");if(node)node.textContent=clock(left);if(left<=0){clearInterval(mcqTimer);finishMCQ()}},250)}
function renderMCQ(){
  const s=mcqState;if(!s)return;const i=s.index,item=s.questions[i],answer=s.answers[i],left=s.ends-Date.now();
  const el=layer(`<div class="evia-mcq-meta"><span>Question ${i+1} of ${s.questions.length}</span><b data-course-mcq-time>${clock(left)}</b></div><h2 class="evia-question-title">${esc(item.question)}</h2><div class="evia-answer-list">${item.options.map((o,n)=>`<button class="evia-answer ${answer===n?"on":""}" data-course-answer="${n}" data-answer="${n}"><span>${String.fromCharCode(65+n)}</span><b>${esc(o)}</b></button>`).join("")}</div><div class="evia-course-epa-ksb">${esc(item.ksb)}</div><div class="evia-question-actions"><button class="evia-tools-secondary" data-course-mcq-prev ${i===0?"disabled":""}>Previous</button><button class="evia-tools-primary" data-course-mcq-next>${i===s.questions.length-1?"Finish":"Next"}</button></div>`,"Multiple-choice mock",i===0?mcqIntro:()=>{s.index--;renderMCQ();startMCQTimer()});
  el.querySelectorAll("[data-course-answer]").forEach(b=>b.onclick=()=>{s.answers[i]=Number(b.dataset.courseAnswer);renderMCQ();startMCQTimer()});
  el.querySelector("[data-course-mcq-prev]").onclick=()=>{if(i>0){s.index--;renderMCQ();startMCQTimer()}};
  el.querySelector("[data-course-mcq-next]").onclick=()=>{if(i===s.questions.length-1)finishMCQ();else{s.index++;renderMCQ();startMCQTimer()}};
  startMCQTimer()
}
function finishMCQ(){
  if(!mcqState)return;clearInterval(mcqTimer);const p=profile(),s=mcqState;let correct=0;s.questions.forEach((q,i)=>{if(s.answers[i]===q.answer)correct++});const pct=Math.round(correct/s.questions.length*100),grade=correct<=p.mcq.failMax?"Below pass":correct<=p.mcq.passMax?"Pass range":"Distinction range";saveScore("mcq",pct,{marks:correct,total:s.questions.length,grade});mcqState=null;
  const el=layer(`<div class="result"><p class="evia-tools-kicker">Multiple-choice practice</p><div class="evia-result-score">${correct}/${p.mcq.questions}</div><h2>${esc(grade)}</h2><p class="evia-tools-copy">Your Evia readiness score for this method is ${pct}%. The official ST0264 mark bands are 0–24 fail, 25–32 pass and 33–40 distinction.</p><button class="evia-tools-primary" data-course-result-done>Back to EPA practice</button></div>`,"Multiple-choice mock",openEPA);el.querySelector("[data-course-result-done]").onclick=openEPA
}
function practicalIntro(){
  const p=profile(),el=layer(`<p class="evia-tools-kicker">${esc(p.pathwayTitle)}</p><h2>Practical mock</h2><p class="evia-tools-copy">The real ST0264 practical lasts ${p.practical.hours} hours and includes at least ${p.practical.minQuestions} questions. This practice breaks the pathway-specific practical into the same key areas so you can check what you can demonstrate.</p><button class="evia-tools-primary" data-course-practical-start>Start practical mock</button>`,"Practical mock",openEPA);el.querySelector("[data-course-practical-start]").onclick=()=>{practicalState={index:0,checks:p.practicalAreas.map(a=>a.checks.map(()=>false))};renderPractical()}
}
function renderPractical(){
  const p=profile(),s=practicalState,i=s.index,a=p.practicalAreas[i],checks=s.checks[i];
  const el=layer(`<div class="evia-mcq-meta"><span>Area ${i+1} of ${p.practicalAreas.length}</span><b>${esc(p.pathwayTitle)}</b></div><h2 class="evia-question-title">${esc(a.title)}</h2><p class="evia-tools-copy">${esc(a.desc)}</p><div class="evia-check-list">${a.checks.map((t,n)=>`<button class="evia-check ${checks[n]?"on":""}" data-course-practical-check="${n}"><i>${checks[n]?"✓":""}</i><span>${esc(t)}</span></button>`).join("")}</div><div class="evia-course-epa-ksb">${a.ksbs.join(" · ")}</div><div class="evia-question-actions"><button class="evia-tools-secondary" data-course-practical-prev ${i===0?"disabled":""}>Previous</button><button class="evia-tools-primary" data-course-practical-next>${i===p.practicalAreas.length-1?"Finish":"Next"}</button></div>`,"Practical mock",i===0?practicalIntro:()=>{s.index--;renderPractical()});
  el.querySelectorAll("[data-course-practical-check]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.coursePracticalCheck);checks[n]=!checks[n];b.classList.toggle("on",checks[n]);b.querySelector("i").textContent=checks[n]?"✓":""});
  el.querySelector("[data-course-practical-prev]").onclick=()=>{if(i>0){s.index--;renderPractical()}};
  el.querySelector("[data-course-practical-next]").onclick=()=>{if(i===p.practicalAreas.length-1)finishPractical();else{s.index++;renderPractical()}}
}
function finishPractical(){
  const p=profile(),got=practicalState.checks.flat().filter(Boolean).length,total=practicalState.checks.flat().length,pct=Math.round(got/total*100);saveScore("practical",pct,{checks:got,total});practicalState=null;
  const el=layer(`<div class="result"><p class="evia-tools-kicker">Practical practice</p><div class="evia-result-score">${pct}%</div><h2>Practical mock complete</h2><p class="evia-tools-copy">You checked ${got} of ${total} pathway-specific practice points. This is a readiness indicator only; the real practical is assessed holistically against the official task, KSBs and tolerances.</p><button class="evia-tools-primary" data-course-result-done>Back to EPA practice</button></div>`,"Practical mock",openEPA);el.querySelector("[data-course-result-done]").onclick=openEPA
}
function interviewIntro(){
  const p=profile();cleanupInterview();interviewState={index:0,checks:p.interview.map(q=>q.cover.map(()=>false)),recordings:p.interview.map(()=>null)};
  const el=layer(`<p class="evia-tools-kicker">${esc(p.pathwayTitle)}</p><h2>Interview mock</h2><p class="evia-tools-copy">The real interview lasts ${p.interview.minutes} minutes and has at least ${p.interview.questions} questions. Record each answer as if an assessor asked you. The specific points to cover stay on screen while you speak; tick them as you actually cover them, then listen back before moving on.</p><button class="evia-tools-primary" data-course-interview-start>Start interview mock</button>`,"Interview mock",openEPA);el.querySelector("[data-course-interview-start]").onclick=renderInterview
}
function mime(){if(typeof MediaRecorder==="undefined")return"";const xs=["audio/webm;codecs=opus","audio/mp4","audio/webm"];return xs.find(x=>!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(x))||""}
function revokeRecording(i){const r=interviewState?.recordings?.[i];if(r?.url)try{URL.revokeObjectURL(r.url)}catch{}}
function renderInterview(){
  cleanupRecording(false);const p=profile(),s=interviewState,i=s.index,item=p.interview[i],checks=s.checks[i],recording=s.recordings[i];
  const el=layer(`<div class="evia-mcq-meta"><span>Question ${i+1} of ${p.interview.length}</span><b>${esc(item.theme)}</b></div><h2 class="evia-question-title">${esc(item.question)}</h2><div class="evia-int-cover"><b>Cover this in your answer</b><span>Tick each point when you have actually said it.</span></div><div class="evia-check-list">${item.cover.map((t,n)=>`<button class="evia-check ${checks[n]?"on":""}" data-course-interview-check="${n}"><i>${checks[n]?"✓":""}</i><span>${esc(t)}</span></button>`).join("")}</div><div class="evia-int-recorder"><div class="evia-int-record-head"><b data-course-rec-status>${recording?"Answer recorded":"Ready to record"}</b><span data-course-rec-time>${recording?"Listen back below":"0:00"}</span></div>${recording?`<audio controls preload="metadata" src="${recording.url}"></audio>`:""}<button class="evia-tools-primary" data-course-rec-start>${recording?"Record again":"Start recording"}</button><button class="evia-tools-secondary" data-course-rec-stop hidden>Stop recording</button></div><div class="evia-course-epa-ksb">${item.ksbs.join(" · ")}</div><div class="evia-question-actions"><button class="evia-tools-secondary" data-course-int-prev ${i===0?"disabled":""}>Previous</button><button class="evia-tools-primary" data-course-int-next ${recording?"":"disabled"}>${i===p.interview.length-1?"Finish":"Next"}</button></div>`,"Interview mock",i===0?interviewIntro:()=>{s.index--;renderInterview()});
  el.querySelectorAll("[data-course-interview-check]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.courseInterviewCheck);checks[n]=!checks[n];b.classList.toggle("on",checks[n]);b.querySelector("i").textContent=checks[n]?"✓":""});
  el.querySelector("[data-course-int-prev]").onclick=()=>{if(i>0){s.index--;renderInterview()}};
  el.querySelector("[data-course-int-next]").onclick=()=>{if(!s.recordings[i])return;if(i===p.interview.length-1)finishInterview();else{s.index++;renderInterview()}};
  el.querySelector("[data-course-rec-start]").onclick=()=>startRecording(el,i);el.querySelector("[data-course-rec-stop]").onclick=stopRecording
}
async function startRecording(el,index){
  if(recorder?.state==="recording")return;
  const status=el.querySelector("[data-course-rec-status]"),start=el.querySelector("[data-course-rec-start]"),stop=el.querySelector("[data-course-rec-stop]"),time=el.querySelector("[data-course-rec-time]");
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){status.textContent="Voice recording is not supported on this device.";return}
  try{stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:{ideal:1},echoCancellation:true,noiseSuppression:true}})}catch{status.textContent="Allow microphone access to record your answer.";return}
  if(!stream.getAudioTracks().length){cleanupRecording(false);status.textContent="No microphone was available.";return}
  chunks=[];const type=mime(),opts=type?{mimeType:type,audioBitsPerSecond:64000}:{audioBitsPerSecond:64000};try{recorder=new MediaRecorder(stream,opts)}catch{try{recorder=new MediaRecorder(stream)}catch{cleanupRecording(false);status.textContent="Could not start the recorder.";return}}
  start.hidden=true;stop.hidden=false;status.textContent="Recording · microphone on";recordStarted=Date.now();time.textContent="0:00";recordTimer=setInterval(()=>{time.textContent=clock(Date.now()-recordStarted)},250);
  const active=recorder;active.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};active.onerror=()=>{cleanupRecording(false);status.textContent="Recording problem · try again";start.hidden=false;stop.hidden=true};active.onstop=()=>{clearInterval(recordTimer);recordTimer=null;try{stream?.getTracks().forEach(t=>t.stop())}catch{}stream=null;const blob=new Blob(chunks,{type:active.mimeType||type||chunks[0]?.type||"audio/webm"});chunks=[];if(recorder===active)recorder=null;if(blob.size<500){status.textContent="Nothing was recorded · try again";start.hidden=false;stop.hidden=true;return}revokeRecording(index);interviewState.recordings[index]={blob,url:URL.createObjectURL(blob),type:blob.type,durationMs:Date.now()-recordStarted};renderInterview()};active.start(500)
}
function stopRecording(){if(recorder&&recorder.state!=="inactive")try{recorder.stop()}catch{}}
function finishInterview(){
  cleanupRecording(false);const p=profile(),got=interviewState.checks.flat().filter(Boolean).length,total=interviewState.checks.flat().length,pct=Math.round(got/total*100);saveScore("interview",pct,{checks:got,total});const finished=interviewState;interviewState=null;finished.recordings.forEach(r=>{if(r?.url)try{URL.revokeObjectURL(r.url)}catch{}});
  const el=layer(`<div class="result"><p class="evia-tools-kicker">Interview practice</p><div class="evia-result-score">${pct}%</div><h2>Interview mock complete</h2><p class="evia-tools-copy">You covered ${got} of ${total} pathway-specific answer points across your recorded responses. This is an Evia readiness indicator, not an assessor grade.</p><button class="evia-tools-primary" data-course-result-done>Back to EPA practice</button></div>`,"Interview mock",openEPA);el.querySelector("[data-course-result-done]").onclick=openEPA
}
document.addEventListener("click",e=>{
  const p=profile();if(!p)return;const b=e.target.closest?.('[data-arch="EPA"]');if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openEPA()
},true);
function ready(){patchArch();const root=document.getElementById("root");if(root&&!root.__eviaCourseEPAObserved){root.__eviaCourseEPAObserved=true;new MutationObserver(()=>requestAnimationFrame(patchArch)).observe(root,{childList:true})}}
window.addEventListener("load",ready);window.addEventListener("pageshow",patchArch);window.addEventListener("focus",patchArch);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")patchArch()});setTimeout(ready,250);
window.EviaCourseEPAEngine={open:openEPA,profile};
})();