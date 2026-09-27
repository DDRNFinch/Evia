/* Evia7 learner data: one module every screen can use, and the only one Nisia will talk to.
   See the "Evia data model" write-up. For now this is an adapter over the storage the app already uses: reads hand
   back records in the new shape (stable id, learnerId, ISO dates, v), and writes are turned back into today's shape,
   so there is only ever one copy of the learner's data. When every screen goes through here, the storage underneath
   can change format in one step without touching the screens.

   eviaData.list(collection, filter)   eviaData.get(collection, id)   eviaData.put(collection, record)
   eviaData.remove(collection, id)     eviaData.on("change", fn)       eviaData.learnerId()
   eviaData.files.get(fileId, kind)    eviaData.snapshot()
   Sync (for Nisia, nothing else):     eviaData.changesSince()  eviaData.markSynced(records)
   Collections: learner, evidence, supporting, nvqAnswers, hours, lessonResults, tests, confidence, scenarios,
   reviews, targets, rewards. Writes: hours and evidence for now; the rest move over screen by screen. */
(function(){
  const V=1,ID_KEY="evia7-learner-id",SYNC_KEY="evia7-data-synced";
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const writeJson=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
  /* app.js keeps these as top-level variables, which every script can see by name. */
  const G=name=>name==="evidence"?(typeof evidence!=="undefined"?evidence:undefined):name==="hours"?(typeof hours!=="undefined"?hours:undefined)
    :name==="otjBatches"?(typeof otjBatches!=="undefined"?otjBatches:undefined):name==="course"?(typeof course!=="undefined"?course:undefined):undefined;
  const courseNow=()=>G("course")||localStorage.getItem("evia7-course")||"";

  /* The learner id comes from Nisia at sign-in. Until then a local one, kept on the phone. */
  function learnerId(){
    let id=localStorage.getItem(ID_KEY);
    if(!id){id="local-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);try{localStorage.setItem(ID_KEY,id)}catch(_){}}
    return id;
  }

  /* One date format: ISO 8601 UTC. Today's data has ms numbers, ISO strings and en-GB "dd/mm/yyyy, hh:mm:ss". */
  function iso(v){
    if(v==null||v==="")return null;
    if(typeof v==="number"||/^\d{10,}$/.test(String(v))){const d=new Date(Number(v));return isNaN(d)?null:d.toISOString()}
    const s=String(v),uk=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if(uk){const d=new Date(+uk[3],uk[2]-1,+uk[1],+(uk[4]||0),+(uk[5]||0),+(uk[6]||0));return isNaN(d)?null:d.toISOString()}
    const d=new Date(s);return isNaN(d)?null:d.toISOString();
  }
  const ms=v=>{const t=Date.parse(iso(v)||"");return isNaN(t)?Date.now():t};
  const slug=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  /* Units are named, not numbered, in today's data. A stable id from the course and the name; course packs from Nisia
     will carry real ids, matched to these once by name. */
  const unitId=(c,name)=>c&&name?c+"/"+slug(name):null;
  const shared=key=>(readJson("evia7-shared",{})||{})[key]||null;
  const submission=key=>{const at=shared(key);return {status:at?"shared":"not sent",at:iso(at),by:null,feedback:null}};
  const base=(id,extra)=>Object.assign({id:String(id),v:V,learnerId:learnerId()},extra);

  /* ---------- Reading: today's storage into the new shape ---------- */
  const R={
    learner(){
      const p=readJson("evia7-profile",{})||{};
      return [base("learner",{course:courseNow(),name:p.name||"",start:p.start||"",end:p.end||"",mathsEnabled:!!p.mathsEnabled,englishEnabled:!!p.englishEnabled,
        hasSignature:!!p.signature,hasPhoto:!!p.avatar,updatedAt:null})];
    },
    evidence(){
      return (G("evidence")||readJson("evia7-evidence",[])||[]).filter(Boolean).map(e=>{
        const lp=e.learnerProfile||{},made=iso(e.savedAt)||iso(e.d);
        return base(e.id,{course:e.c||"",unitId:unitId(e.c,e.u),unit:e.u||"",text:e.w||"",ksbs:(e.k||[]).filter(Boolean),
          photoIds:Array.isArray(e.photoIds)?e.photoIds.slice():[],inlinePhotos:Array.isArray(e.p)?e.p.length:0,photoTakenAt:(e.photoTimes||[]).map(iso),
          guidedAreas:(e.guidedAreas||[]).slice(),signedAs:{name:lp.name||""},hasSignature:!!e.signature,
          createdAt:made,updatedAt:iso(e.updatedAt)||made,deletedAt:null,submission:submission("pack:"+e.id)});
      });
    },
    supporting(){
      const list=typeof supportingMeta==="function"?supportingMeta():readJson("evia7-supporting-evidence",[]);
      return (list||[]).filter(Boolean).map(x=>base(x.id,{course:x.course||"",title:x.title||x.filename||"",type:x.witness&&x.witness.name?"witness":x.type||"file",
        fileId:x.id,mime:x.mime||"",size:x.size||0,filename:x.filename||"",witness:x.witness&&x.witness.name?{name:x.witness.name,role:x.witness.role||""}:null,
        nvqUnit:x.nvqUnit||null,criteria:(x.criteria||[]).slice(),createdAt:iso(x.addedAt),updatedAt:iso(x.updatedAt||x.addedAt),deletedAt:null,submission:submission("sup:"+x.id)}));
    },
    nvqAnswers(){
      const all=readJson("evia7-nvq-answers",{})||{},nvq=(window.EVIA_NVQ||{}).id||null;
      return Object.keys(all).map(q=>base(q,{course:nvq,questionId:q,text:all[q].t||"",createdAt:iso(all[q].savedAt),updatedAt:iso(all[q].updatedAt||all[q].savedAt),deletedAt:null}));
    },
    hours(){
      const batches=G("otjBatches")||readJson("evia7-otj-batches",[])||[];
      const batchOf=x=>{const t=Number(x.createdAt);const b=batches.find(b=>(b.entryIds||[]).includes(x.id))||batches.find(b=>Number(b.cutoff)>=t);return b?b.id:null};
      return (G("hours")||readJson("evia7-hours",[])||[]).filter(Boolean).map(x=>{
        const made=iso(x.createdAt)||iso(x.savedAt);
        return base(x.id,{minutes:Math.round(x.mins!=null?Number(x.mins):Number(x.n||0)*60),description:x.description||"",did:x.did||"",learned:x.learned||"",
          source:x.auto?"auto":("did" in x||"learned" in x)?"evia":"manual",activityKey:x.autoKey||null,occurredAt:made,createdAt:made,
          updatedAt:iso(x.updatedAt)||made,deletedAt:null,confirmed:x.confirmed||null,exportedIn:batchOf(x)});
      });
    },
    lessonResults(){
      const s=readJson("evia7-teach",{})||{},out=[];
      Object.keys(s).filter(c=>c!=="_me").forEach(c=>{const L=(s[c]||{}).lessons||{};Object.keys(L).forEach(id=>{const r=L[id]||{};
        out.push(base(c+":"+id,{course:c,lessonId:id,done:!!r.done,best:Number(r.best)||0,last:Number(r.last)||0,attempts:r.attempts||null,lastAt:iso(r.at),updatedAt:iso(r.at)}))})});
      return out;
    },
    tests(){
      return (readJson("evia7-test-results",[])||[]).filter(Boolean).map((t,i)=>base(t.id||("test-"+(ms(t.savedAt))+"-"+i),{course:t.course||"",type:t.type||"test",
        score:t.score??null,total:t.total??null,pct:t.pct??(t.total?Math.round((t.score||0)/t.total*100):null),full:!!t.full,missed:(t.missed||[]).slice(),takenAt:iso(t.savedAt),updatedAt:iso(t.savedAt)}));
    },
    confidence(){
      return (readJson("evia7-confidence",[])||[]).filter(Boolean).map((c,i)=>base(c.id||("confidence-"+i),{course:c.course||"",takenAt:iso(c.savedAt||c.startedAt),
        scores:(c.scores||[]).map(s=>({area:s.area,score:s.score,question:s.question||"",answeredAt:iso(s.answeredAt),carried:!!s.carried})),updatedAt:iso(c.savedAt)}));
    },
    scenarios(){
      const d=readJson("evia7-scenarios",{})||{};
      return Object.keys(d).map(id=>base(id,{scenarioId:id,doneAt:iso(d[id].at),best:!!d[id].best,updatedAt:iso(d[id].at)}));
    },
    reviews(){
      return (readJson("evia7-progress-reviews",[])||[]).filter(Boolean).map((r,i)=>base(r.id||("review-"+i),{course:r.course||"",date:iso(r.date),format:r.format||1,
        snapshot:r.snapshot||r.metrics||null,reflection:r.reflection||null,targetIds:(r.targets||[]).map(t=>t.id).filter(Boolean),updatedAt:iso(r.date)}));
    },
    /* Two target stores today (reviews.js and review.js): read as one, marked with where they came from. */
    targets(){
      const a=(readJson("evia7-review-targets",[])||[]).filter(Boolean).map(t=>base(t.id,{course:t.course||"",kind:t.kind||"",title:t.title||"",why:t.why||t.reason||"",
        goal:t.target??null,baseline:t.baseline??0,param:t.param||null,due:iso(t.due||t.deadline),setBy:"evia",reviewId:t.reviewId||null,metAt:t.done?iso(t.doneAt||t.createdAt):null,
        createdAt:iso(t.createdAt),updatedAt:iso(t.updatedAt||t.createdAt),store:"review-targets"}));
      const b=(readJson("evia7-targets",[])||[]).filter(Boolean).map((t,i)=>base(t.id||("target-"+i),{course:t.course||courseNow(),kind:t.kind||"",title:t.title||"",why:t.reason||"",
        goal:t.targetValue??null,baseline:0,param:t.measure||null,due:iso(t.deadline),setBy:"evia",reviewId:null,metAt:t.done?iso(t.doneAt):null,createdAt:null,updatedAt:null,store:"targets"}));
      return a.concat(b);
    },
    rewards(){
      const r=readJson("evia7-rewards",{})||{};
      return [base("rewards",{coins:Math.max(0,(r.bank||0)-(r.spent||0)),earned:r.bank||0,spent:r.spent||0,owned:(r.owned||[]).slice(),hat:r.hat||"",expr:r.expr||"",updatedAt:null})];
    }
  };
  const COLLECTIONS=Object.keys(R);
  function list(c,filter){
    if(!R[c])throw new Error("eviaData: unknown collection "+c);
    let out=R[c]();
    if(filter)out=out.filter(r=>Object.keys(filter).every(k=>filter[k]===undefined||r[k]===filter[k]));
    return out;
  }
  const get=(c,id)=>list(c).find(r=>r.id===String(id))||null;

  /* ---------- Writing: the new shape back into today's storage ---------- */
  const listeners=[];
  const emit=c=>listeners.slice().forEach(fn=>{try{fn(c)}catch(err){console.error("eviaData listener",err)}});
  const save=()=>{if(typeof persist==="function")persist()};
  const W={
    hours:{
      put(r){
        const arr=G("hours");if(!arr)throw new Error("eviaData: hours are not loaded");
        const minutes=Math.max(0,Math.round(Number(r.minutes)||0)),t=r.createdAt?ms(r.createdAt):Date.now();
        const legacy={id:String(r.id||("otj-"+Date.now()+"-"+Math.random().toString(36).slice(2,8))),n:Math.round(minutes/60*100)/100,mins:minutes,description:r.description||"",
          createdAt:t,savedAt:typeof formatDateTime==="function"?formatDateTime(t):new Date(t).toLocaleString("en-GB"),updatedAt:Date.now()};
        if(r.source==="evia"||r.did!=null||r.learned!=null){legacy.did=r.did||"";legacy.learned=r.learned||""}
        if(r.source==="auto"){legacy.auto=true;legacy.autoKey=r.activityKey||null}
        const i=arr.findIndex(x=>x&&x.id===legacy.id);
        if(i>=0)arr[i]=Object.assign({},arr[i],legacy);else arr.push(legacy);
        save();return legacy.id;
      },
      remove(id){const arr=G("hours");const i=arr?arr.findIndex(x=>x&&x.id===String(id)):-1;if(i<0)return false;arr.splice(i,1);save();return true}
    },
    evidence:{
      /* Only fields a learner can change after saving: the write-up and the KSBs. New evidence is still made by the
         save flow in polish.js (it moves photos into their own store first); it moves here with the capture screens. */
      put(r){
        const arr=G("evidence");const e=arr&&arr.find(x=>x&&String(x.id)===String(r.id));
        if(!e)throw new Error("eviaData: evidence "+r.id+" not found");
        if(r.text!=null)e.w=String(r.text);if(Array.isArray(r.ksbs))e.k=r.ksbs.slice();e.updatedAt=new Date().toISOString();
        save();return e.id;
      },
      remove(id){const arr=G("evidence");const i=arr?arr.findIndex(x=>x&&String(x.id)===String(id)):-1;if(i<0)return false;arr.splice(i,1);save();return true}
    }
  };
  function put(c,r){if(!W[c])throw new Error("eviaData: "+c+" can't be written through eviaData yet");const id=W[c].put(r||{});emit(c);return id}
  function remove(c,id){if(!W[c])throw new Error("eviaData: "+c+" can't be written through eviaData yet");const ok=W[c].remove(id);if(ok)emit(c);return ok}

  /* ---------- Files: photos, supporting files (signatures later) ---------- */
  const files={
    async get(fileId,kind){
      if(kind==="supporting"||!kind){const rec=window.eviaSupportingFileGet?await window.eviaSupportingFileGet(fileId):null;if(rec&&rec.blob)return rec.blob;if(kind)return null}
      return window.eviaGetEvidencePhoto?window.eviaGetEvidencePhoto(fileId):null;
    }
  };

  /* ---------- Sync with Nisia ----------
     Works whoever wrote the data (a screen not yet moved here included): each record's fingerprint is compared with
     the one last sent. changesSince() gives new and changed records, plus ids that have gone (deleted). */
  const SYNCED=["learner","evidence","supporting","nvqAnswers","hours","lessonResults","tests","confidence","scenarios","reviews","targets","rewards"];
  const fp=r=>{const s=JSON.stringify(r);let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36)};
  function changesSince(){
    const done=readJson(SYNC_KEY,{})||{},out=[];
    SYNCED.forEach(c=>{const seen=done[c]||{},now=list(c),ids=new Set();
      now.forEach(r=>{ids.add(r.id);const f=fp(r);if(seen[r.id]!==f)out.push({collection:c,record:r,fingerprint:f})});
      Object.keys(seen).forEach(id=>{if(!ids.has(id))out.push({collection:c,record:base(id,{deletedAt:new Date().toISOString()}),fingerprint:null})})});
    return out;
  }
  function markSynced(changes){
    const done=readJson(SYNC_KEY,{})||{};
    (changes||[]).forEach(ch=>{const m=done[ch.collection]=done[ch.collection]||{};if(ch.fingerprint)m[ch.record.id]=ch.fingerprint;else delete m[ch.record.id]});
    writeJson(SYNC_KEY,done);
  }
  /* Everything, in the new shape: for Nisia's first upload, and for checking the move worked. */
  const snapshot=()=>{const o={v:V,learnerId:learnerId(),at:new Date().toISOString()};COLLECTIONS.forEach(c=>{o[c]=list(c)});return o};

  window.eviaData={V,COLLECTIONS,list,get,put,remove,files,learnerId,iso,unitId,changesSince,markSynced,snapshot,
    on(ev,fn){if(ev==="change"&&typeof fn==="function")listeners.push(fn);return()=>{const i=listeners.indexOf(fn);if(i>=0)listeners.splice(i,1)}}};
})();
