/* Evia7 ↔ Nisia: pairing and sync.
   Joining: the learner scans their assessor's pairing QR (NISI:PAIR:2:<code>), opens the invite link (?pair=<code>) or
   types the code shown under the QR. Nisia replies with the learner's enrolment: who they are, their course and dates,
   college, employer, assessor, tutor and safeguarding lead, so the learner doesn't type any of it.
   Sync: Nisia sees everything the learner does in Evia. Records (evidence, hours, lessons, tests, reviews, targets…)
   go on any connection, from eviaData.changesSince(); photos, videos and files go only on WiFi, and wait until then.
   Until Nisia's backend is live, pair() knows the example learners below and the demo "sync" keeps everything on the
   phone and marks it sent. Only ENDPOINT, pair() and send() change when the backend is ready.
   window.eviaNisia: pair(code)  accept(enrolment)  joined()  sync()  status()  clean(code)  onStatus(fn) */
(function(){
  const ENDPOINT="";   /* Nisia's sync address, once the backend is live */
  const MEDIA_KEY="evia7-nisia-media",STATUS_KEY="evia7-nisia-status";
  /* Example learners (from the Nisia portal mock-up), one per course. */
  const COLLEGE={college:"Brookfield College",safeguarding:{name:"Sarah Mitchell",phone:"01922 555 010",email:"safeguarding@brookfield.example"}};
  const LEARNERS={
    BRK7Q4M:{learnerId:"nisia-demo-callum",name:"Callum Hughes",course:"bricklayer",start:"2025-09-01",end:"2027-08-31",group:"Bricklaying 2025 intake",employer:"Hughes & Sons Builders",assessor:"Mark Ellis",tutor:"Dan Okafor"},
    CJ4H8KP:{learnerId:"nisia-demo-amira",name:"Amira Khan",course:"site",start:"2025-09-01",end:"2027-08-31",group:"Site Carpentry 2025",employer:"Kestrel Homes",assessor:"Mark Ellis",tutor:"Priya Shah"},
    JNR5W2C:{learnerId:"nisia-demo-jordan",name:"Jordan Price",course:"joiner",start:"2025-09-01",end:"2027-08-31",group:"Bench Joinery 2025",employer:"Oakline Joinery",assessor:"Mark Ellis",tutor:"Priya Shah"},
    TRW3M6D:{learnerId:"nisia-demo-ellie",name:"Ellie Morgan",course:"trowel3",start:"2026-01-05",end:"2027-07-30",group:"Plastering L3",employer:"Morgan Plastering",assessor:"Mark Ellis",tutor:"Mark Ellis",nvqOptional:["690"]}
  };
  /* The code under the QR, however it arrives: typed with dashes or spaces, a scanned NISI:PAIR:2: payload, or a link. */
  const clean=s=>{s=String(s||"").trim();const m=/^NISI:PAIR:\d+:(.+)$/i.exec(s)||/[?&#](?:pair|code)=([A-Za-z0-9-]+)/.exec(s);return (m?m[1]:s).toUpperCase().replace(/[^A-Z0-9]/g,"")};

  async function pair(code){
    const k=clean(code);
    if(k.length<6)throw new Error("That code looks too short. It’s under your assessor’s QR code.");
    const L=LEARNERS[k];
    if(!L)throw new Error("That code didn’t work. Codes only last a few minutes, so ask your assessor for a new one.");
    return Object.assign({code:k,demo:!ENDPOINT},COLLEGE,L);
  }
  /* The learner confirmed it's them: the enrolment and their details come from Nisia from now on. */
  function accept(en){
    try{if(en.learnerId)localStorage.setItem("evia7-learner-id",en.learnerId)}catch(_){}
    const e=Object.assign({},en,{joinedAt:new Date().toISOString()});
    window.eviaData.enrol(e);
    window.eviaData.put("learner",{name:en.name,start:en.start,end:en.end,safeguarding:en.safeguarding,...(en.nvqOptional?{nvqOptional:en.nvqOptional}:{})});
    setTimeout(()=>sync().catch(()=>{}),500);
    return e;
  }
  const joined=()=>{const e=window.eviaData.enrolment();return e&&e.college?e:null};

  /* ---------- Sync ---------- */
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const writeJson=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
  /* WiFi (or a cable) only for media. Phones that don't say what they're on (iPhone) count as WiFi unless data saver is on. */
  const onWifi=()=>{const c=navigator.connection;if(!c||!c.type)return !(c&&c.saveData);return c.type==="wifi"||c.type==="ethernet"};
  /* Every photo and file the records point at. */
  function mediaIds(){
    const D=window.eviaData,out=[];
    D.list("evidence").forEach(e=>(e.photoIds||[]).forEach(id=>out.push({id,kind:"photo"})));
    D.list("supporting").forEach(s=>out.push({id:s.id,kind:"supporting"}));
    return out;
  }
  const listeners=[];
  const note=s=>{const st=Object.assign(readJson(STATUS_KEY,{})||{},s);writeJson(STATUS_KEY,st);listeners.slice().forEach(fn=>{try{fn(st)}catch(_){}});return st};
  async function send(kind,body){
    if(!ENDPOINT)return true;   /* demo: nothing leaves the phone */
    const r=await fetch(ENDPOINT+"/"+kind,{method:"POST",headers:body instanceof Blob?{"Content-Type":body.type||"application/octet-stream"}:{"Content-Type":"application/json"},body:body instanceof Blob?body:JSON.stringify(body)});
    if(!r.ok)throw new Error("Nisia "+kind+" failed ("+r.status+")");
    return true;
  }
  let running=null;
  function sync(){
    if(running)return running;
    running=(async()=>{
      if(!joined())return status();
      if(!navigator.onLine)return note({offline:true});
      const D=window.eviaData,changes=D.changesSince();
      /* Records: small, on any connection, in batches. */
      for(let i=0;i<changes.length;i+=50){const batch=changes.slice(i,i+50);await send("records",{learnerId:D.learnerId(),changes:batch.map(c=>({collection:c.collection,record:c.record}))});D.markSynced(batch)}
      /* Media: only on WiFi. */
      const sent=readJson(MEDIA_KEY,{})||{};
      if(onWifi()){
        for(const m of mediaIds().filter(m=>!sent[m.id])){
          try{const blob=await D.files.get(m.id,m.kind);if(!blob){sent[m.id]="missing";continue}await send("media/"+encodeURIComponent(m.id),blob);sent[m.id]=new Date().toISOString();writeJson(MEDIA_KEY,sent)}
          catch(err){console.warn("Evia: Nisia media",m.id,err);break}
        }
      }
      return note({offline:false,lastSync:new Date().toISOString()});
    })().catch(err=>{note({error:String(err&&err.message||err)});throw err}).finally(()=>{running=null});
    return running;
  }
  /* What's still to send: changes waiting, and photos and files waiting for WiFi. */
  function status(){
    const st=readJson(STATUS_KEY,{})||{},sent=readJson(MEDIA_KEY,{})||{};
    let changes=0,media=0;
    try{changes=window.eviaData.changesSince().length;media=mediaIds().filter(m=>!sent[m.id]).length}catch(_){}
    return {joined:!!joined(),lastSync:st.lastSync||null,changes,media,wifi:onWifi(),online:navigator.onLine,error:st.error||null};
  }
  /* In words, for the profile. */
  function statusText(){
    const s=status(),e=joined();if(!e)return "";
    if(!s.online)return "Offline. Everything is saved on your phone and goes to "+e.college+" when you’re back online.";
    if(s.media&&!s.wifi)return s.media+" photo"+(s.media===1?"":"s")+" and file"+(s.media===1?"":"s")+" waiting for WiFi.";
    if(s.changes||s.media)return "Sending to "+e.college+"…";
    if(s.lastSync){const m=Math.round((Date.now()-Date.parse(s.lastSync))/60000);return "Up to date with "+e.college+" · "+(m<1?"just now":m<60?m+" min ago":new Date(s.lastSync).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}))}
    return "Waiting to send to "+e.college+".";
  }

  /* When: soon after something changes, when the phone comes back online or onto WiFi, when Evia opens, and every few minutes. */
  let t=null;const soon=()=>{clearTimeout(t);t=setTimeout(()=>{if(joined())sync().catch(()=>{})},3000)};
  addEventListener("online",soon);
  if(navigator.connection&&navigator.connection.addEventListener)navigator.connection.addEventListener("change",soon);
  addEventListener("load",()=>{if(window.eviaData&&window.eviaData.on)window.eviaData.on("change",soon);setTimeout(soon,3000);setInterval(soon,5*60000)});

  /* A dot on the profile button while anything is waiting (no signal, or photos waiting for WiFi), so nobody thinks
     their work has reached the college when it hasn't. The profile says what's waiting. */
  function badge(){const b=document.getElementById("profile-btn");if(!b)return;const st=status();b.classList.toggle("nisia-waiting",st.joined&&(st.changes>0&&!st.online||st.media>0&&!st.wifi));
    const line=document.getElementById("pf-sync");if(line)line.textContent=statusText()}
  listeners.push(badge);addEventListener("offline",badge);addEventListener("online",badge);
  addEventListener("load",()=>setInterval(badge,30000));
  window.eviaNisia={pair,accept,joined,sync,status,statusText,clean,onStatus:fn=>listeners.push(fn)};
})();
