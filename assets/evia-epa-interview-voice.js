(()=>{
"use strict";
const EPA_KEY="evia-epa-practice-v1";
const QUESTIONS=[
["Tell me about a time you identified a defect or problem in brickwork and what you did about it.","Defects, repair and ownership"],
["Explain how you protect materials and finished masonry from weather or site damage.","Protection and ownership"],
["Tell me about a mortar mix you have used and how you made sure the ratio and consistency were right.","Mortar"],
["Give an example of how you used a drawing, specification or site information to carry out your work.","Information"],
["Tell me about a time you had to communicate clearly with another trade or member of the site team.","Communication"],
["Describe a job where teamwork affected the quality or sequence of your brickwork.","Teamwork"],
["Tell me about a time you checked your own work and corrected something before it became a bigger problem.","Ownership"],
["Explain how you make sure people are treated fairly and respectfully when you are working with them.","Inclusion"],
["Tell me about something new you learned or practised and how it improved your work.","Development"],
["If you or someone else was struggling physically or mentally at work, what support could you use?","Wellbeing"]
];
const COVER=["I gave a real example","I explained what I did","I explained why I did it","I explained the result or what I learned"];
let state=null,recorder=null,stream=null,chunks=[],timer=null,started=0;
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function read(){try{return JSON.parse(localStorage.getItem(EPA_KEY)||"{}")||{}}catch{return{}}}
function write(v){try{localStorage.setItem(EPA_KEY,JSON.stringify(v))}catch{}}
function clock(ms){const n=Math.max(0,Math.floor(ms/1000)),m=Math.floor(n/60),s=n%60;return`${m}:${String(s).padStart(2,"0")}`}
function mime(){if(typeof MediaRecorder==="undefined")return"";const xs=["audio/webm;codecs=opus","audio/mp4","audio/webm"];return xs.find(x=>!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(x))||""}
function cleanupRecording(stop=true){
  clearInterval(timer);timer=null;
  if(stop&&recorder&&recorder.state!=="inactive")try{recorder.stop()}catch{}
  recorder=null;chunks=[];
  try{stream?.getTracks?.().forEach(t=>t.stop())}catch{}
  stream=null;
}
function closeLayer(){cleanupRecording();document.querySelector(".evia-tools-layer")?.remove()}
function backToEPA(){closeLayer();setTimeout(()=>document.querySelector('[data-arch="EPA"]')?.click(),0)}
function layer(body,title="Interview practice",back=backToEPA){
  closeLayer();
  const el=document.createElement("div");
  el.className="evia-tools-layer evia-interview-voice";
  el.innerHTML=`<section class="evia-tools-screen"><div class="evia-tools-head"><button type="button" data-int-back>‹ Back</button><b>${esc(title)}</b><span></span></div><div class="evia-tools-body">${body}</div></section>`;
  document.body.appendChild(el);el.querySelector("[data-int-back]").onclick=back;return el;
}
function intro(){
  state={index:0,checks:QUESTIONS.map(()=>[false,false,false,false]),recordings:QUESTIONS.map(()=>null)};
  const el=layer(`<p class="evia-tools-kicker">EPA practice</p><h2>Interview mock</h2><p class="evia-tools-copy">Record each answer as if an assessor asked you. The points to cover stay on screen while you speak, so you can tick them as you go. You can listen back before moving on.</p><button class="evia-tools-primary" data-int-start>Start interview mock</button>`);
  el.querySelector("[data-int-start]").onclick=()=>renderQuestion();
}
function revokeRecording(index){const r=state?.recordings?.[index];if(r?.url)try{URL.revokeObjectURL(r.url)}catch{}}
function renderQuestion(){
  cleanupRecording(false);
  const i=state.index,[question,theme]=QUESTIONS[i],checks=state.checks[i],recording=state.recordings[i];
  const el=layer(`
    <div class="evia-mcq-meta"><span>Question ${i+1} of ${QUESTIONS.length}</span><b>${esc(theme)}</b></div>
    <h2 class="evia-question-title">${esc(question)}</h2>
    <div class="evia-int-cover"><b>Cover this in your answer</b><span>Tick each point when you have actually said it.</span></div>
    <div class="evia-check-list">${COVER.map((t,n)=>`<button class="evia-check ${checks[n]?"on":""}" data-voice-check="${n}"><i>${checks[n]?"✓":""}</i><span>${esc(t)}</span></button>`).join("")}</div>
    <div class="evia-int-recorder">
      <div class="evia-int-record-head"><b data-rec-status>${recording?"Answer recorded":"Ready to record"}</b><span data-rec-time>${recording?"Listen back below":"0:00"}</span></div>
      ${recording?`<audio controls preload="metadata" src="${recording.url}"></audio>`:""}
      <button class="evia-tools-primary" data-rec-start>${recording?"Record again":"Start recording"}</button>
      <button class="evia-tools-secondary" data-rec-stop hidden>Stop recording</button>
    </div>
    <div class="evia-question-actions">
      <button class="evia-tools-secondary" data-int-prev ${i===0?"disabled":""}>Previous</button>
      <button class="evia-tools-primary" data-int-next ${recording?"":"disabled"}>${i===QUESTIONS.length-1?"Finish":"Next"}</button>
    </div>
  `,"Interview practice",i===0?backToEPA:()=>{state.index--;renderQuestion()});
  el.querySelectorAll("[data-voice-check]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.voiceCheck);checks[n]=!checks[n];b.classList.toggle("on",checks[n]);b.querySelector("i").textContent=checks[n]?"✓":""});
  el.querySelector("[data-int-prev]").onclick=()=>{if(i>0){state.index--;renderQuestion()}};
  el.querySelector("[data-int-next]").onclick=()=>{if(!state.recordings[i])return;if(i===QUESTIONS.length-1)finish();else{state.index++;renderQuestion()}};
  el.querySelector("[data-rec-start]").onclick=()=>startRecording(el,i);
  el.querySelector("[data-rec-stop]").onclick=()=>stopRecording();
}
async function startRecording(el,index){
  if(recorder?.state==="recording")return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){
    const status=el.querySelector("[data-rec-status]");if(status)status.textContent="Voice recording is not supported on this device.";return;
  }
  try{stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:{ideal:1},echoCancellation:true,noiseSuppression:true}})}catch{
    const status=el.querySelector("[data-rec-status]");if(status)status.textContent="Allow microphone access to record your answer.";return;
  }
  if(!stream.getAudioTracks().length){cleanupRecording(false);el.querySelector("[data-rec-status]").textContent="No microphone was available.";return}
  chunks=[];const type=mime(),opts=type?{mimeType:type,audioBitsPerSecond:64000}:{audioBitsPerSecond:64000};
  try{recorder=new MediaRecorder(stream,opts)}catch{try{recorder=new MediaRecorder(stream)}catch{cleanupRecording(false);el.querySelector("[data-rec-status]").textContent="Could not start the recorder.";return}}
  const start=el.querySelector("[data-rec-start]"),stop=el.querySelector("[data-rec-stop]"),status=el.querySelector("[data-rec-status]"),time=el.querySelector("[data-rec-time]");
  start.hidden=true;stop.hidden=false;status.textContent="Recording · microphone on";started=Date.now();time.textContent="0:00";
  timer=setInterval(()=>{time.textContent=clock(Date.now()-started)},250);
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.onerror=()=>{clearInterval(timer);timer=null;status.textContent="Recording problem · try again";start.hidden=false;stop.hidden=true;try{stream?.getTracks().forEach(t=>t.stop())}catch{};stream=null};
  recorder.onstop=()=>{
    clearInterval(timer);timer=null;
    try{stream?.getTracks().forEach(t=>t.stop())}catch{};stream=null;
    const blob=new Blob(chunks,{type:recorder.mimeType||type||chunks[0]?.type||"audio/webm"});chunks=[];recorder=null;
    if(blob.size<500){status.textContent="Nothing was recorded · try again";start.hidden=false;stop.hidden=true;return}
    revokeRecording(index);const url=URL.createObjectURL(blob);state.recordings[index]={blob,url,type:blob.type,durationMs:Date.now()-started};renderQuestion();
  };
  recorder.start(500);
}
function stopRecording(){if(recorder&&recorder.state!=="inactive")try{recorder.stop()}catch{}}
function patchEPAArch(){
  const x=read(),mcq=Math.max(0,Math.min(100,Number(x.mcq)||0)),interview=Math.max(0,Math.min(100,Number(x.interview)||0)),practical=Math.max(0,Math.min(100,Number(x.practical)||0)),pct=Math.round((mcq+interview+practical)/3);
  document.querySelectorAll('[data-arch="EPA"]').forEach(b=>{b.querySelector(".arch-value")?.setAttribute("stroke-dasharray",`${pct} 100`);const n=b.querySelector(".arch-number");if(n)n.textContent=`${pct}%`});
}
function finish(){
  cleanupRecording(false);
  const got=state.checks.flat().filter(Boolean).length,total=QUESTIONS.length*COVER.length,pct=Math.round(got/total*100),x=read();
  x.interview=pct;x.attempts=x.attempts||{};x.attempts.interview=(Number(x.attempts.interview)||0)+1;write(x);patchEPAArch();
  const el=layer(`<div class="result"><p class="evia-tools-kicker">Interview practice</p><div class="evia-result-score">${pct}%</div><h2>Mock interview complete</h2><p class="evia-tools-copy">${got} of ${total} answer-building points were covered across your recorded answers.</p><button class="evia-tools-primary" data-int-done>Back to EPA practice</button></div>`,"Interview practice",backToEPA);
  el.querySelector("[data-int-done]").onclick=backToEPA;
}
document.addEventListener("click",e=>{
  const card=e.target.closest?.('[data-epa-method="interview"]');
  if(!card)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();intro();
},true);
})();
