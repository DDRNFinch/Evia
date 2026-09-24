/* NVQ courses: City & Guilds Level 3 NVQ Diploma in Trowel Occupations (data in nvq-data.js).
   The 335 assessment criteria stay in the background. Learners see:
   - evidence packs for real site jobs (each ticks off the "doing" criteria of its unit),
   - question sets for the "describe / explain" criteria (a question shared by several units is answered once),
   - witness testimony and documents in Supporting evidence, linked to a unit.
   Loaded before app.js so the course exists on first render; everything else runs when called. */
(function(){
  "use strict";
  const N=window.EVIA_NVQ;if(!N)return;
  const ID=N.id,UNITS=N.units,BY={};UNITS.forEach(u=>BY[u.n]=u);
  const BEHAVIOUR=["102","300","303","502"];          // evidenced by witness testimony, documents and questions
  const DEFAULT_OPTIONAL=["690"];
  const ANSWERS_KEY="evia7-nvq-answers",MIN_WORDS=12;
  const escH=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v==null?f:v}catch(_){return f}};
  const words=t=>String(t||"").trim().split(/\s+/).filter(Boolean).length;
  const subLetter=i=>i<26?String.fromCharCode(97+i):String.fromCharCode(71+i).repeat(2);

  /* Every criterion by code, e.g. "313.7.3". Sub-points of "at least N of" criteria get a letter: "313.7.3a". */
  const CRIT={};
  UNITS.forEach(u=>u.o.forEach(o=>o.c.forEach(c=>{CRIT[u.n+"."+c.n]={u,o,c}})));
  const subOf=code=>{const m=/^(\d+\.\d+\.\d+)([a-z]+)$/.exec(code);if(!m||!CRIT[m[1]])return null;const c=CRIT[m[1]].c,i=[...Array((c.s||[]).length).keys()].find(j=>subLetter(j)===m[2]);return i==null?null:{parent:m[1],text:c.s[i]}};
  const critText=code=>CRIT[code]?CRIT[code].c.t:(subOf(code)||{}).text||"";
  const label=code=>{const p=code.split(".");return "Unit "+p[0]+" · "+p.slice(1).join(".")};

  /* ---------- Evidence packs: one per real site job ---------- */
  const COMMON="drawings and specification · risk assessment and method statement · PPE and access equipment · materials you chose and checked · protecting the work · waste · time allowed · tools you used and looked after";
  const PACKS=[
    {unit:"313",sub:"a",title:"Arches",capture:"setting out the arch · turning piece or centre · springing points · voussoirs · key brick · joint finish · finished arch · you wearing your PPE",mention:"arch type (rough ringed, axed or gauged) · how you set out the centre and springing line · "+COMMON},
    {unit:"313",sub:"b",title:"Chimney stack",capture:"setting out · flue liners · bond around the flue · DPC and flashings · oversailing courses · capping or cowl · access equipment · finished stack",mention:"flue liners · DPC and tray positions · working at height · "+COMMON},
    {unit:"313",sub:"c",title:"Fireplace",capture:"setting out the hearth · fireplace opening · lintel or arch over the opening · fire bricks and throat · decorative finish · finished fireplace",mention:"hearth and opening sizes · the throat and gather · "+COMMON},
    {unit:"313",sub:"d",title:"Decorative features",capture:"setting out · flush or projecting features (corbels, plinths, string courses, dentil courses, panels) · special bricks · joint finish · finished feature",mention:"the feature you built and why · special bricks · keeping the bond and gauge · "+COMMON},
    {unit:"313",sub:"e",title:"Curved wall (on plan)",capture:"setting out the radius · trammel or template · bond on the curve · checking with the template · finished curve",mention:"the radius and how you set it out · how you kept the curve true · cutting · "+COMMON},
    {unit:"313",sub:"f",title:"Curved wall (in elevation)",capture:"setting out the curve · template or rod · curved cuts · coping or capping · finished wall",mention:"how you set out and checked the curve · cutting · coping · "+COMMON},
    {unit:"313",sub:"g",title:"Splayed wall",capture:"setting out the angle · squint bricks or cuts at the splay · bond at the angle · finished wall",mention:"the angle and how you set it out · squint bricks or cuts · keeping the bond · "+COMMON}
  ];
  const doCodes=u=>u.o.flatMap(o=>o.c.filter(c=>!c.q&&!c.min).map(c=>u.n+"."+c.n));
  const minCrit=u=>{for(const o of u.o)for(const c of o.c)if(c.min)return c;return null};
  function packCodes(p){
    const u=BY[p.unit],m=minCrit(u),codes=doCodes(u);
    if(m&&p.sub)codes.push(u.n+"."+m.n+p.sub);
    codes.push("102.1.2"); // every site job shows health and safety control equipment in use
    return codes;
  }
  window.EVIA_EXTRA_COURSES=Object.assign(window.EVIA_EXTRA_COURSES||{},{[ID]:{
    name:"Trowel Occupations L3",std:"C&G "+N.qual+" · NVQ Level 3",nvq:true,
    u:PACKS.map(p=>[p.title,packCodes(p).map(c=>c+"|"+critText(c)),{unit:p.unit,sub:p.sub}])
  }});
  window.EVIA_EXTRA_PROMPTS=Object.assign(window.EVIA_EXTRA_PROMPTS||{},{[ID]:Object.fromEntries(PACKS.map(p=>[p.title,{photos:p.capture,writeup:p.mention}]))});

  /* ---------- Which units, which criteria, what's evidenced ---------- */
  const on=()=>typeof course!=="undefined"&&course===ID;
  const profile=()=>readJson("evia7-profile",{});
  function optionalChosen(){const o=profile().nvqOptional;const list=(Array.isArray(o)?o:[]).filter(n=>BY[n]&&BY[n].opt);return list.length?list:DEFAULT_OPTIONAL.slice()}
  function setOptional(list){const p=profile();p.nvqOptional=list.filter(n=>BY[n]&&BY[n].opt);if(!p.nvqOptional.length)p.nvqOptional=DEFAULT_OPTIONAL.slice();localStorage.setItem("evia7-profile",JSON.stringify(p))}
  const selected=()=>{const o=optionalChosen();return UNITS.filter(u=>!u.opt||o.includes(u.n))};
  const unitCodes=u=>u.o.flatMap(o=>o.c.map(c=>u.n+"."+c.n));
  function allK(){return selected().flatMap(u=>u.o.flatMap(o=>o.c.map(c=>[u.n+"."+c.n,c.t])))}
  const answers=()=>readJson(ANSWERS_KEY,{});
  const answered=(q,a)=>{const x=(a||answers())[q];return !!x&&words(x.t)>=MIN_WORDS};
  function supportingFor(){try{return supportingMeta().filter(x=>x.course===ID&&Array.isArray(x.ksbs))}catch(_){return[]}}
  function evidenced(){
    const s=new Set(),a=answers();
    (typeof evidence!=="undefined"?evidence:[]).filter(e=>e.c===ID).forEach(e=>(e.k||[]).forEach(k=>s.add(k)));
    Object.keys(CRIT).forEach(code=>{const q=CRIT[code].c.q;if(q&&answered(q,a))s.add(code)});
    supportingFor().forEach(x=>x.ksbs.forEach(k=>s.add(k)));
    Object.keys(CRIT).forEach(code=>{const c=CRIT[code].c;if(c.min&&(c.s||[]).filter((_,i)=>s.has(code+subLetter(i))).length>=c.min)s.add(code)});
    return s;
  }
  const questionsOf=u=>[...new Set(u.o.flatMap(o=>o.c.filter(c=>c.q).map(c=>c.q)))];
  const unitsAsking=q=>selected().filter(u=>u.o.some(o=>o.c.some(c=>c.q===q)));

  /* ---------- Shared bits ---------- */
  function sheet(kicker,title,body,cls){
    const root=document.getElementById("modal-root");
    root.innerHTML='<div class="overlay"><section class="sheet pr-sheet nvq-sheet '+(cls||"")+'" role="dialog" aria-modal="true" aria-labelledby="pr-title"><div class="sheet-head"><div><div class="chat-kicker">'+kicker+'</div><h2 id="pr-title">'+title+'</h2></div><button class="close" id="pr-close" type="button" aria-label="Close">×</button></div><div class="pr-body">'+body+'</div></section></div>';
    const close=()=>{root.innerHTML="";if(sheetClosed)sheetClosed()};
    document.getElementById("pr-close").onclick=close;
    root.querySelector(".overlay").addEventListener("click",e=>{if(e.target.classList.contains("overlay"))close()});
    const h=document.getElementById("pr-title");if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}
    return root.querySelector(".pr-sheet");
  }
  let sheetClosed=null; // redraw whatever screen opened the sheet, so ticks show straight away
  const miniRing=(pct,size)=>{size=size||34;const r=(size-4)/2,c=2*Math.PI*r,d=Math.max(0,Math.min(1,pct/100))*c;return '<svg class="nvq-ring" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" aria-hidden="true"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="ui-ring-track" stroke-width="4"/>'+(d>0?'<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="ui-ring-fill" stroke-width="4" stroke-dasharray="'+d.toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')" stroke-linecap="round"/>':"")+'</svg>'};
  const unitStats=(u,ev)=>{const codes=unitCodes(u),done=codes.filter(c=>ev.has(c)).length;return {done,total:codes.length,pct:codes.length?Math.round(done/codes.length*100):0}};

  /* ---------- Course screen: packs and questions grouped by unit ---------- */
  function courseScreen(){
    document.getElementById("page-title").textContent="Course";
    const ev=evidenced(),a=answers(),packs=data().u.map((u,i)=>({u,i,meta:u[2]||{}}));
    const blocks=selected().map(u=>{
      const st=unitStats(u,ev),mine=packs.filter(p=>p.meta.unit===u.n),m=minCrit(u),qs=questionsOf(u),qDone=qs.filter(q=>answered(q,a)).length;
      let body="";
      if(mine.length){
        const got=m?(m.s||[]).filter((_,i)=>ev.has(u.n+"."+m.n+subLetter(i))).length:0;
        if(m)body+='<p class="nvq-min">Do at least <strong>'+m.min+'</strong> of these '+mine.length+' jobs · '+(got>=m.min?'<span class="nvq-ok">✓ '+got+' done</span>':got+' done')+'</p>';
        body+=mine.map(p=>'<div class="card unit-card" data-u="'+p.i+'"><div class="unit-title">'+escH(p.u[0])+'</div>'+(typeof strengthBars==="function"?strengthBars(unitStrengthForCourse(p.u[0])):"")+'</div>').join("");
      }else if(BEHAVIOUR.includes(u.n)){
        body+='<button type="button" class="card unit-card nvq-link-card" data-nvq-support><span><span class="unit-title">Witness testimony and documents</span><small>Add them in Supporting evidence and link them to this unit.</small></span><span class="supporting-course-arrow">›</span></button>';
      }else{
        body+='<div class="card nvq-soon"><small>Evidence packs for this unit are coming next. For now, add site evidence in Supporting evidence and link it to this unit.</small></div>';
      }
      if(qs.length)body+='<button type="button" class="card unit-card nvq-link-card" data-nvq-q="'+u.n+'"><span><span class="unit-title">Knowledge questions</span><small>'+qDone+' of '+qs.length+' answered</small></span><span class="supporting-course-arrow">›</span></button>';
      return '<section class="nvq-unit-block"><div class="nvq-unit-head">'+miniRing(st.pct)+'<div><strong><span class="nvq-unit-num">'+u.n+'</span> '+escH(u.short)+'</strong><small>'+st.done+' of '+st.total+' criteria'+(u.opt?' · optional unit':'')+'</small></div></div>'+body+'</section>';
    }).join("");
    document.getElementById("screen").innerHTML=
      '<div class="card"><div class="section-title">'+escH(data().std)+'</div><h2>'+escH(data().name)+'</h2><p>'+selected().length+' units. Evidence packs for your site jobs, and questions for what you know. Your optional unit can be changed in Profile.</p></div>'+
      blocks+
      '<div class="card unit-card supporting-course-card" data-supporting-evidence><div class="unit-title">Supporting Evidence</div><small>Witness testimony, documents, audio and video.</small><span class="supporting-course-arrow">›</span></div>';
    document.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>openUnit(+b.dataset.u));
    document.querySelectorAll("[data-supporting-evidence],[data-nvq-support]").forEach(b=>b.onclick=()=>openSupportingEvidence());
    document.querySelectorAll("[data-nvq-q]").forEach(b=>b.onclick=()=>{sheetClosed=courseScreen;openQuestions(b.dataset.nvqQ)});
  }

  /* ---------- Knowledge questions ---------- */
  function openQuestions(unitNum){
    const u=BY[unitNum];if(!u)return;
    const a=answers(),seen=new Set();
    const groups=u.o.map(o=>{
      const qs=o.c.filter(c=>c.q&&!seen.has(c.q)&&seen.add(c.q));
      if(!qs.length)return"";
      return '<div class="pr-h">Outcome '+o.n+'</div><div class="pr-list">'+qs.map(c=>{
        const q=N.q[c.q],done=answered(c.q,a),also=unitsAsking(c.q).filter(x=>x.n!==u.n).map(x=>x.n);
        return '<button type="button" class="pr-row nvq-q-row'+(done?" done":"")+'" data-q="'+c.q+'"><span class="nvq-q-tick" aria-hidden="true">'+(done?"✓":"")+'</span><span class="pr-copy"><strong>'+escH(q.t)+'</strong><small>'+(done?"Answered":"Not answered yet")+(also.length?" · also counts for "+also.join(", "):"")+'</small></span></button>';
      }).join("")+'</div>';
    }).join("");
    const qs=questionsOf(u),done=qs.filter(q=>answered(q,a)).length;
    sheet("UNIT "+u.n+" · QUESTIONS",escH(u.short),
      '<p class="pr-intro">Answer each one in your own words, as you would to your assessor. You can type or use your keyboard’s microphone. <strong>'+done+' of '+qs.length+'</strong> answered.</p>'+groups+
      (Object.keys(a).length?'<button type="button" class="secondary nvq-pdf-btn" id="nvq-pdf">Download all my answers (PDF) for my assessor</button>':""));
    document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>openQuestion(b.dataset.q,u.n));
    const pdf=document.getElementById("nvq-pdf");if(pdf)pdf.onclick=()=>answersPdf(pdf);
  }
  function openQuestion(qid,unitNum){
    const q=N.q[qid];if(!q)return;
    const u=BY[unitNum]||unitsAsking(qid)[0],order=u?questionsOf(u):[qid],pos=order.indexOf(qid);
    const a=answers(),cur=a[qid]||{},also=unitsAsking(qid);
    sheet((u?"UNIT "+u.n+" · ":"")+"QUESTION "+(pos+1)+" OF "+order.length,"In your own words",
      '<p class="nvq-question">'+escH(q.t)+'</p>'+
      (q.s?'<div class="nvq-think"><span>Cover each of these:</span><ul>'+q.s.map(s=>'<li>'+escH(s)+'</li>').join("")+'</ul></div>':"")+
      '<textarea id="nvq-answer" data-nvq-answer rows="7" placeholder="Type your answer, or tap the microphone on your keyboard to speak it…">'+escH(cur.t||"")+'</textarea>'+
      '<p class="nvq-count" id="nvq-count"></p>'+
      (also.length>1?'<div class="nvq-counts-for"><span>This answer counts for</span>'+also.map(x=>'<span class="pr-chip">'+x.n+' '+escH(x.short)+'</span>').join("")+'</div>':"")+
      '<div class="pr-save"><button type="button" class="secondary" id="nvq-back">All questions</button><button type="button" class="primary" id="nvq-save">Save answer</button></div>');
    const ta=document.getElementById("nvq-answer"),count=document.getElementById("nvq-count"),save=document.getElementById("nvq-save");
    const upd=()=>{const n=words(ta.value);count.textContent=n<MIN_WORDS?"Aim for at least "+MIN_WORDS+" words · "+n+" so far":n+" words";count.classList.toggle("ok",n>=MIN_WORDS);save.disabled=!ta.value.trim()};
    ta.addEventListener("input",upd);upd();
    document.getElementById("nvq-back").onclick=()=>u?openQuestions(u.n):null;
    save.onclick=()=>{
      const all=answers(),t=ta.value.trim();
      if(t)all[qid]={t,savedAt:all[qid]&&all[qid].savedAt||new Date().toISOString(),updatedAt:new Date().toISOString()};else delete all[qid];
      localStorage.setItem(ANSWERS_KEY,JSON.stringify(all));
      if(typeof showEvidenceToast==="function")showEvidenceToast(words(t)>=MIN_WORDS?"Answer saved":"Saved. Add a bit more detail so it counts");
      if(window.eviaCheckTargets)window.eviaCheckTargets();
      const next=u?order.slice(pos+1).concat(order.slice(0,pos)).find(x=>!answered(x,all)):null;
      if(next)openQuestion(next,u.n);else if(u)openQuestions(u.n);
    };
  }

  /* All answered questions in one PDF, each listing every criterion it covers. */
  function loadJsPdf(){
    if(window.jspdf)return Promise.resolve(window.jspdf);
    return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="vendor/jspdf.umd.min.js";s.onload=()=>window.jspdf?resolve(window.jspdf):reject(new Error("PDF library unavailable"));s.onerror=()=>reject(new Error("PDF library unavailable"));document.head.appendChild(s)});
  }
  async function answersPdf(btn){
    const label0=btn.textContent;btn.disabled=true;btn.textContent="Making your PDF…";
    try{
      const {jsPDF}=await loadJsPdf(),doc=new jsPDF({unit:"mm",format:"a4",compress:true});
      const a=answers(),p=profile(),W=210,M=16,TW=W-2*M,seen=new Set();let y=M;
      const room=h=>{if(y+h>280){doc.addPage();y=M}};
      const para=(txt,size,style,color,gap)=>{doc.setFont("helvetica",style||"normal");doc.setFontSize(size);doc.setTextColor(...(color||[23,32,51]));const lines=doc.splitTextToSize(String(txt),TW),lh=size*.42;lines.forEach(l=>{room(lh);doc.text(l,M,y+lh*.8);y+=lh});y+=gap||0};
      para("Knowledge answers",20,"bold",null,2);
      para((p.name||"Learner")+" · "+N.title+" ("+N.qual+")",10,"normal",[102,112,133],1);
      para("Downloaded "+new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})+". Answers are in the learner’s own words.",9,"normal",[102,112,133],6);
      selected().forEach(u=>{
        const qs=questionsOf(u).filter(q=>!seen.has(q)&&answered(q,a));if(!qs.length)return;
        room(14);para("Unit "+u.n+" · "+u.t,13,"bold",null,3);
        qs.forEach(q=>{
          seen.add(q);const refs=selected().flatMap(x=>x.o.flatMap(o=>o.c.filter(c=>c.q===q).map(c=>x.n+" "+c.n)));
          para("Criteria "+refs.join(" · "),8.5,"normal",[110,92,0],1);
          para(N.q[q].t+(N.q[q].s?": "+N.q[q].s.join("; "):""),10.5,"bold",null,1.5);
          para(a[q].t,10.5,"normal",[52,64,84],6);
        });
      });
      const pages=doc.getNumberOfPages();
      for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(152,162,179);doc.text("Created using Evia",M,290);doc.text(i+" / "+pages,W-M,290,{align:"right"})}
      const name=(String(p.name||"learner").trim().replace(/[^a-z0-9]+/gi,"-")||"learner")+"-knowledge-answers.pdf";
      const file=new File([doc.output("blob")],name,{type:"application/pdf"});
      let shared=false;
      try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file]});shared=true}}catch(err){if(err&&err.name==="AbortError")shared=true}
      if(!shared){const l=document.createElement("a");l.href=URL.createObjectURL(file);l.download=name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(l.href),60000)}
    }catch(err){console.error("Evia answers PDF failed",err);if(typeof showEvidenceToast==="function")showEvidenceToast("Couldn't make the PDF. Please try again",true)}
    btn.disabled=false;btn.textContent=label0;
  }

  /* ---------- Progress: unit rings → outcomes → criteria ---------- */
  const open={};
  function progressHtml(a){
    const ev=a&&a.evidenced||evidenced(),demo=document.body.classList.contains("evia-onboarding");
    const sel=selected();
    return '<section class="ui-card nvq-units"><div class="nvq-units-head"><strong>Your units</strong><small>'+sel.filter(u=>!u.opt).length+' mandatory · '+sel.filter(u=>u.opt).length+' optional</small></div>'+
      sel.map((u,i)=>{
        const st=unitStats(u,ev),isOpen=!!open[u.n]||(demo&&u.n==="102");
        return (i?'<div class="ui-divider"></div>':"")+
          '<button type="button" class="ui-group-head nvq-unit-row" data-nvq-unit="'+u.n+'" aria-expanded="'+isOpen+'">'+miniRing(st.pct,44)+
          '<span class="ui-group-copy"><strong>'+u.n+' '+escH(u.short)+'</strong><small>'+st.done+' of '+st.total+' criteria'+(u.opt?' · optional':'')+'</small></span><span class="ui-group-pct">'+st.pct+'%</span><span class="ui-chev'+(isOpen?" open":"")+'"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>'+
          (isOpen?'<div class="nvq-outcomes">'+u.o.map(o=>{
            const d=o.c.filter(c=>ev.has(u.n+"."+c.n)).length;
            return '<div class="nvq-outcome"><div class="nvq-outcome-head"><span>'+o.n+'</span><p>'+escH(o.t)+'</p><small>'+d+'/'+o.c.length+'</small></div><div class="ui-ksb-grid nvq-grid">'+o.c.map(c=>{
              const code=u.n+"."+c.n,met=ev.has(code);
              return '<button type="button" class="ui-ksb'+(met?" met":"")+'" data-ksb-code="'+code+'" aria-label="Criterion '+c.n+(met?", evidence captured":"")+'">'+escH(c.n)+'</button>';
            }).join("")+'</div></div>';
          }).join("")+'</div>':"");
      }).join("")+
      '<p class="ui-help">Tap a unit to see its outcomes, then a criterion to see what it asks for and the evidence behind it.</p></section>';
  }
  function bindProgress(redraw){
    document.querySelectorAll("[data-nvq-unit]").forEach(b=>b.onclick=()=>{const y=window.scrollY;open[b.dataset.nvqUnit]=!open[b.dataset.nvqUnit];redraw();window.scrollTo(0,y)});
    document.querySelectorAll(".nvq-units [data-ksb-code]").forEach(b=>b.onclick=()=>{sheetClosed=redraw;criterion(b.dataset.ksbCode)});
  }
  function criterion(code){
    const x=CRIT[code];if(!x)return;
    const {u,o,c}=x,ev=evidenced(),met=ev.has(code),a=answers();
    const packs=(typeof evidence!=="undefined"?evidence:[]).filter(e=>e.c===ID&&(e.k||[]).some(k=>k===code||k.indexOf(code)===0&&/^[a-z]+$/.test(k.slice(code.length))));
    const support=supportingFor().filter(s=>s.ksbs.includes(code));
    const subs=(c.s||[]).map((s,i)=>{const got=c.min&&ev.has(code+subLetter(i));return '<li class="'+(got?"got":"")+'">'+(c.min?'<span aria-hidden="true">'+(got?"✓":"○")+'</span> ':"")+escH(s)+'</li>'}).join("");
    const evidenceRows=packs.map(e=>'<div class="ksb-evidence-item"><strong>'+escH(e.u)+'</strong><span>'+escH(e.d||(e.savedAt?new Date(e.savedAt).toLocaleDateString("en-GB"):"Evidence pack"))+'</span></div>').join("")+
      support.map(s=>'<div class="ksb-evidence-item"><strong>'+escH(s.title)+'</strong><span>'+escH(s.witness?"Witness testimony · "+s.witness.name:(s.type||"Supporting evidence"))+'</span></div>').join("")+
      (c.q&&answered(c.q,a)?'<div class="ksb-evidence-item"><strong>Your answer</strong><span>'+escH(a[c.q].t.slice(0,140))+(a[c.q].t.length>140?"…":"")+'</span></div>':"");
    const how=c.q?'<button type="button" class="primary" id="nvq-answer-q">'+(a[c.q]?"Edit your answer":"Answer this question")+'</button>'
      :c.min?'<p class="pr-intro">Do at least '+c.min+' of these as evidence packs from the Course page.</p>'
      :BEHAVIOUR.includes(u.n)?'<p class="pr-intro">Ask your supervisor for witness testimony, or add a document that shows this, in Supporting evidence. Link it to Unit '+u.n+'.</p>'
      :'<p class="pr-intro">Any evidence pack for this unit covers this.</p>';
    sheet(escH(label(code)).toUpperCase(),met?"Evidence captured":"Not yet evidenced",
      '<p class="nvq-question">'+escH(c.t)+'</p>'+(subs?'<ul class="nvq-subs'+(c.min?" min":"")+'">'+subs+'</ul>':"")+
      (c.min?'<p class="nvq-min">At least <strong>'+c.min+'</strong> needed · '+(c.s||[]).filter((_,i)=>ev.has(code+subLetter(i))).length+' done</p>':"")+
      '<div class="pr-h">Outcome '+o.n+'</div><p class="pr-intro">'+escH(o.t)+'</p>'+
      '<div class="pr-h">Evidence</div>'+(evidenceRows||'<p class="pr-intro">Nothing yet.</p>')+how);
    const b=document.getElementById("nvq-answer-q");if(b)b.onclick=()=>openQuestion(c.q,u.n);
  }

  /* ---------- Optional units (first-run demo and Profile) ---------- */
  function optionalHtml(){
    const chosen=optionalChosen();
    return UNITS.filter(u=>u.opt).map(u=>'<label class="nvq-opt"><input type="checkbox" value="'+u.n+'"'+(chosen.includes(u.n)?" checked":"")+'><span><strong>'+u.n+' '+escH(u.short)+'</strong><small>'+escH(u.t)+(u.n==="690"?" · most learners choose this":"")+'</small></span></label>').join("");
  }
  const readOptional=root=>[...root.querySelectorAll(".nvq-opt input:checked")].map(i=>i.value);

  /* While the NVQ course is on, on-screen "KSB" wording (Home, stats, targets, chat) reads "criterion"/"criteria". */
  const swap=node=>{if(!on())return;const walk=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let t;while((t=walk.nextNode()))if(t.nodeValue.indexOf("KSB")>=0)t.nodeValue=t.nodeValue.replace(/\bKSBs\b/g,"criteria").replace(/\bKSB\b/g,"criterion")};
  const watch=()=>new MutationObserver(ms=>{if(on())ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)swap(n);else if(n.nodeType===3&&n.parentNode)swap(n.parentNode)}))}).observe(document.body,{childList:true,subtree:true});
  if(document.body)watch();else document.addEventListener("DOMContentLoaded",watch);
  window.eviaTerm=()=>on()?{one:"criterion",many:"criteria",Many:"Criteria"}:{one:"KSB",many:"KSBs",Many:"KSBs"};
  window.eviaNvq={on,id:ID,allK,evidenced,courseScreen,progressHtml,bindProgress,criterion,openQuestions,openQuestion,optionalHtml,readOptional,setOptional,optionalChosen,selected,label,critText,units:UNITS,behaviour:BEHAVIOUR,
    unitCodes:n=>BY[n]?unitCodes(BY[n]):[],doCodesFor:n=>BY[n]?BY[n].o.flatMap(o=>o.c.filter(c=>!c.q).map(c=>[n+"."+c.n,c.t])):[],answers};
})();
