/* Evia7 ↔ Nisia: joining a college, and what the college sees.
   The learner types the code their tutor gave them (or scans its QR code). The code names a group at a college, and
   the group's course unlocks in Evia. The learner agrees what's shared first: counts, never the evidence itself.
   Until Nisia's backend is live, join() checks the example codes below; only join() and send() change when it is.
   window.eviaNisia: join(code)  accept(group)  joined()  summary()  sync()  clean(code)  SHARED  NOT_SHARED */
(function(){
  /* The example groups from the Nisia portal mock-up (one per course). */
  const GROUPS={
    BRK7Q4M:{college:"Brookfield College",group:"Bricklaying 2025 intake",course:"bricklayer",tutor:"Dan Okafor"},
    BRK9X2T:{college:"Brookfield College",group:"Bricklaying 2026 intake",course:"bricklayer",tutor:"Dan Okafor"},
    CJ4H8KP:{college:"Brookfield College",group:"Site Carpentry 2025",course:"site",tutor:"Priya Shah"},
    JNR5W2C:{college:"Brookfield College",group:"Bench Joinery 2025",course:"joiner",tutor:"Priya Shah"},
    TRW3M6D:{college:"Brookfield College",group:"Plastering L3",course:"trowel3",tutor:"Mark Ellis"}
  };
  const ENDPOINT="";   /* Nisia's sync address, once the backend is live */
  const SHARED=["How much evidence you have per unit","Your learning hours","Lessons and tests you’ve done","When you last used Evia"];
  const NOT_SHARED=["Your photos, videos or write-ups","Your chats with Evia","Your wellbeing check-ins"];
  /* Codes are letters and numbers; people type them with dashes, spaces and lower case, or scan a link holding one. */
  const clean=s=>{s=String(s||"");const m=/[?&#]code=([A-Za-z0-9-]+)/.exec(s);return (m?m[1]:s).toUpperCase().replace(/[^A-Z0-9]/g,"")};

  async function join(code){
    const k=clean(code);
    if(k.length<6)throw new Error("That code looks too short. It’s on the card from your tutor.");
    const g=GROUPS[k];
    if(!g)throw new Error("That code didn’t work. Check it with your tutor.");
    return Object.assign({code:k},g);
  }
  /* The learner agreed: save the enrolment, so the course comes from Nisia from now on. */
  function accept(g){
    const en=Object.assign({},window.eviaData.enrolment()||{},{course:g.course,college:g.college,group:g.group,tutor:g.tutor,code:g.code,sharing:true,joinedAt:new Date().toISOString()});
    window.eviaData.enrol(en);
    return en;
  }
  const joined=()=>{const e=window.eviaData.enrolment();return e&&e.college?e:null};

  /* What the college sees, and nothing else: counts per unit, hours, lessons and tests, and when Evia was last used. */
  function summary(){
    const D=window.eviaData,e=joined();if(!e)return null;
    const ev=D.list("evidence").filter(x=>!x.deletedAt&&(!x.course||x.course===e.course)),perUnit={};
    ev.forEach(x=>{const u=x.unit||"Other";perUnit[u]=(perUnit[u]||0)+1});
    const sup=D.list("supporting").filter(x=>!x.deletedAt).length;
    const mins=D.list("hours").filter(x=>!x.deletedAt).reduce((s,x)=>s+(x.minutes||0),0);
    const lessons=D.list("lessonResults").filter(x=>x.done).length,tests=D.list("tests").length;
    let last=null;try{last=localStorage.getItem("evia7-last-open")}catch(_){}
    return {v:1,learnerId:D.learnerId(),code:e.code,course:e.course,evidencePerUnit:perUnit,supporting:sup,learningMinutes:mins,lessonsDone:lessons,testsTaken:tests,
      lastUsedAt:last||new Date().toISOString(),at:new Date().toISOString()};
  }
  /* Sends the summary when Nisia is live; until then it's kept, ready to send. */
  async function sync(){
    const s=summary();if(!s)return null;
    try{localStorage.setItem("evia7-nisia-summary",JSON.stringify(s))}catch(_){}
    if(!ENDPOINT||!navigator.onLine)return s;
    const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});
    if(!r.ok)throw new Error("Nisia sync failed ("+r.status+")");
    return s;
  }
  try{localStorage.setItem("evia7-last-open",new Date().toISOString())}catch(_){}
  addEventListener("load",()=>setTimeout(()=>{if(joined())sync().catch(err=>console.warn("Evia: Nisia sync",err))},4000));

  window.eviaNisia={join,accept,joined,summary,sync,clean,SHARED,NOT_SHARED};
})();
