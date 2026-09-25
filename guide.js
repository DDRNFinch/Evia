/* Evia7 guided evidence: Evia walks a learner through one evidence pack, if they want her to.
   window.eviaGuide.start({unitName, prompts, ksbs, pack, addFiles, save, done})
     1. Photos: Evia's camera follows the job in stages (getting ready, setting out, part-way through, finished),
        saying what to show at each; take as many as you like, or skip.
     2. Questions: one per stage, with the things to mention and the unit's skills for that stage as prompts.
     3. Statement: the answers are put together, in the learner's own words, as the pack's write-up,
        which goes on the PDF with the photos as normal.
   Answers are saved in the pack as they go (pack.guide), so a learner can stop and carry on later. */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const split=s=>{const seen=new Set();return String(s||"").split("·").map(t=>t.trim()).filter(t=>{const k=t.toLowerCase();if(!t||seen.has(k))return false;seen.add(k);return true})};
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AVATAR='<span class="evia-mini" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span>';

  /* ---------- The stages of a job ---------- */
  /* Each thing to capture, thing to mention and the unit's skills and behaviours is sorted into the stage of the job
     it belongs to, so Evia follows the job from start to finish and asks about each part once. The learner never sees
     codes: skills show as plain "Good evidence shows you can…" lines. */
  const STAGES=[
    {key:"setout",title:"Setting out",
      photo:"Photograph your setting out: the lines, levels and measurements, with the tape or level showing. Get one of the whole set-up, then move in close.",
      ask:"How did you set it out, and how did you check it was right?"},
    {key:"finish",title:"The finished job",
      photo:"Photograph the finished job. Stand back to get the whole thing in, then move in close on the detail: joints, levels, finish. Include how you left the area.",
      ask:"How did you finish off, and how did you check the quality of your work?"},
    {key:"ready",title:"Getting ready",
      photo:"Before you start, photograph your work area set up safely, and the materials, tools and drawings ready to use.",
      ask:"How did you get ready for this job?"},
    {key:"know",title:"Why it matters",
      ask:"What would you tell a new apprentice about doing this job properly, and why it matters?"},
    {key:"doing",title:"The job in progress",
      photo:"Photograph the job part-way through. Ask someone to take one of you at work, then take a few of how it’s coming along.",
      ask:"Talk me through how you did the job, step by step."}
  ];
  const ORDER=["ready","setout","doing","finish","know","reflect"];
  const REFLECT={key:"reflect",title:"Looking back",ask:"What went well, and what would you do differently next time?"};
  /* Checked in this order: safety belongs to getting ready even when it mentions protection; materials only count as
     getting ready when nothing else places them. */
  const RULES=[
    ["doing",/\bteam|communicat/],
    ["reflect",/learning|development|reflect|feedback|improv/],
    ["setout",/setting[- ]?out|set out|marking out|\blevels?\b|laser|profile|gauge rods?|squares?\b|\blines?\b|datum|plumb|radius|angle/],
    ["ready",/\bppe\b|\brpe\b|protective equipment|safe|hazard|risk|\bsigns?\b|signage|asbestos|slips|height|manual handling|health|wellbeing|well-being|toolbox|method statement/],
    ["know",/regulation|standard|warrant|inclus|equity|divers|equal|modern|digital|terminology|principle|legislation|ownership|\bcost|programme|design/],
    ["finish",/finish|joint|pointing|flush|half round|weather|recess|struck|protect|clean|waste|recycl|environment|surface water|maintain|maintenance|capping|coping|tidy|inspect|quality|check/],
    ["ready",/drawing|specification|estimat|resource|select|quantit|material|pre-?mix|silo|\btools?\b|plan\b|prepar|survey|defect|damage/]
  ];
  const stageOf=text=>{const t=String(text).toLowerCase();const r=RULES.find(([,re])=>re.test(t));return r?r[0]:"doing"};
  const list=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
  /* A skill or behaviour from the unit, as a plain line: "Gauge and hand mix mortar to ratio". */
  function plain(ksb){
    let t=String(ksb).split("|").slice(1).join("|").split(/:\s|\.\s|\bFor example\b|\be\.g\.|,?\s+including,/)[0].trim().replace(/[.,;]+$/,"");
    t=t.replace(/^(\w+?)(ies|s)\b/,(m,w,e)=>/^(applies|carries|complies|identifies|specifies)$/i.test(m)?w+"y":/ss$/i.test(m)||!/^(uses|selects|applies|works|takes|follows|carries|communicates|interprets|maintains|installs|builds|sets|prepares|checks|plans|identifies|complies|contributes|demonstrates)$/i.test(m)?m:w+(e==="ies"?"y":""));
    t=t.replace(/\btheir own\b/gi,"your own").replace(/\bthemselves\b/gi,"yourself").replace(/\btheir\b/gi,"your");
    return t.length>6&&t.length<140?t.charAt(0).toUpperCase()+t.slice(1):"";
  }
  /* The plan for a pack: which stages to photograph and which to ask about, with what to think about in each. */
  function plan(ctx){
    const caps=split(ctx.prompts&&ctx.prompts.photos),terms=split(ctx.prompts&&ctx.prompts.writeup);
    const ksbs=(ctx.ksbs||[]).filter(k=>/^[SB]\d/.test(String(k)));
    const by={};ORDER.forEach(k=>by[k]={caps:[],terms:[],can:[]});
    caps.forEach(c=>by[stageOf(c)].caps.push(c));
    terms.forEach(t=>by[stageOf(t)].terms.push(t));
    ksbs.forEach(k=>{const p=plain(k);if(p&&!by[stageOf(p)].can.includes(p))by[stageOf(p)].can.push(p)});
    const def=k=>k==="reflect"?REFLECT:STAGES.find(s=>s.key===k);
    const photos=["ready","setout","doing","finish"].filter(k=>k==="doing"||k==="finish"||k==="ready"||by[k].caps.length).map(k=>{
      const s=def(k),c=by[k].caps;
      return {key:k,say:s.title,hint:s.photo+(c.length?" Try to show "+list(c)+".":"")};
    });
    const asks=ORDER.filter(k=>k==="doing"||k==="reflect"||by[k].terms.length||by[k].can.length).map(k=>{
      const s=def(k);return {key:k,title:s.title,ask:s.ask,terms:by[k].terms,can:by[k].can.slice(0,3)};
    });
    return {photos,asks};
  }

  /* ---------- The flow ---------- */
  const answeredIn=(g,asks)=>asks.filter(a=>String(g.answers[a.key]||"").trim()).length;
  function start(ctx){
    const P=plan(ctx);
    const g=ctx.pack.guide=ctx.pack.guide&&ctx.pack.guide.v===2?ctx.pack.guide:{v:2,answers:{},covered:{}};
    const answered=answeredIn(g,P.asks);
    const canCam=window.eviaCamera&&window.eviaCamera.supported();
    sheet('<p class="eg-say">'+(answered?"Welcome back. You’ve answered "+answered+" of my "+P.asks.length+" questions.":"I’ll guide you through this job from start to finish. First photos of each stage, then a few questions about how it went. I’ll put your answers together into your statement.")+'</p>'+
      (answered?"":'<ol class="eg-stages">'+P.photos.map(p=>'<li>'+esc(p.say)+'</li>').join("")+'</ol>')+
      '<p class="eg-small">Skip anything you like. Your answers save as you go.</p>',
      [answered?{label:"Carry on with the questions",primary:true,run:()=>ask(ctx,P,firstGap(P,g))}:null,
       canCam?{label:"Start with photos",primary:!answered,run:()=>photos(ctx,P)}:null,
       {label:canCam?"Skip to the questions":"Start the questions",primary:!canCam&&!answered,run:()=>ask(ctx,P,answered?firstGap(P,g):0)}].filter(Boolean),
      {kicker:"EVIA · GUIDED EVIDENCE",title:ctx.unitName});
  }
  const firstGap=(P,g)=>{const i=P.asks.findIndex(a=>!String(g.answers[a.key]||"").trim());return i<0?P.asks.length:i};

  function photos(ctx,P){
    close(true);
    window.eviaCamera.open({title:ctx.unitName,guide:P.photos,onDone:async files=>{
      if(files.length)await ctx.addFiles(files);
      setTimeout(()=>{
        sheet('<p class="eg-say">'+(files.length?"Nice, that’s "+files.length+" photo"+(files.length===1?"":"s")+" added.":"No photos this time. You can add them later.")+' Now a few questions about how the job went. Answer in your own words, as if you were explaining it to someone new.</p>',
          [{label:"Start the questions",primary:true,run:()=>ask(ctx,P,firstGap(P,ctx.pack.guide))},{label:"Stop for now",run:()=>close()}],
          {kicker:"EVIA · GUIDED EVIDENCE",title:"Photos done"});
      },files.length?250:60);
    }});
  }

  function ask(ctx,P,i){
    const g=ctx.pack.guide,n=P.asks.length;
    if(i>=n){review(ctx,P);return}
    const a=P.asks[i];
    const el=sheet(
      '<div class="eg-progress" aria-hidden="true"><i style="width:'+Math.round(i/n*100)+'%"></i></div>'+
      '<p class="eg-say eg-q">'+esc(a.ask)+'</p>'+
      (a.terms.length||a.can.length?'<div class="eg-think">'+
        (a.terms.length?'<p><strong>Think about:</strong> '+esc(a.terms.join(" · "))+'</p>':"")+
        (a.can.length?'<p><strong>Good evidence shows you can:</strong></p><ul>'+a.can.map(c=>'<li>'+esc(c)+'</li>').join("")+'</ul>':"")+
      '</div>':"")+
      '<textarea class="eg-text" id="eg-text" rows="6" placeholder="In your own words…" aria-label="'+esc(a.ask)+'">'+esc(g.answers[a.key]||"")+'</textarea>',
      [{label:"Skip",run:()=>{save();ask(ctx,P,i+1)}},{label:i===n-1?"Save and finish":"Save and continue",primary:true,run:()=>{save();ask(ctx,P,i+1)}}],
      {kicker:"EVIA · QUESTION "+(i+1)+" OF "+n,title:a.title,back:i>0?()=>{save();ask(ctx,P,i-1)}:null,keep:true});
    const box=el.querySelector("#eg-text");
    /* An answered stage counts in full for the things to mention it covers (strength.js). */
    function save(){g.answers[a.key]=box.value.trim();g.covered[a.key]=g.answers[a.key]?a.terms.slice():[];ctx.save()}
    let timer=null;box.oninput=()=>{clearTimeout(timer);timer=setTimeout(save,400)};
    setTimeout(()=>box.focus({preventScroll:true}),reduced()?0:220);
  }

  /* The statement: what they already wrote, then each answer as its own paragraph, in the order of the job. */
  function compile(ctx,P){
    const g=ctx.pack.guide,parts=P.asks.map(a=>String(g.answers[a.key]||"").trim()).filter(Boolean);
    const had=String(ctx.pack.write||"").trim();
    return [had,...parts.filter(p=>!had.includes(p))].filter(Boolean).join("\n\n");
  }
  function review(ctx,P){
    const text=compile(ctx,P),n=answeredIn(ctx.pack.guide,P.asks);
    if(!text){
      sheet('<p class="eg-say">You skipped all the questions, so there’s nothing to put together yet. You can come back to me any time, or write it yourself.</p>',[{label:"Close",primary:true,run:()=>close()}],{kicker:"EVIA · GUIDED EVIDENCE",title:"Your statement"});return;
    }
    const el=sheet('<p class="eg-say">Here’s your statement, made from your '+n+' answer'+(n===1?"":"s")+'. Read it through and change anything you like. It goes in your write-up and on the PDF with your photos.</p>'+
      '<textarea class="eg-text eg-final" id="eg-final" rows="12" aria-label="Your statement">'+esc(text)+'</textarea>',
      [{label:"Back",run:()=>ask(ctx,P,P.asks.length-1)},{label:"Use this statement",primary:true,run:()=>{
        ctx.pack.write=el.querySelector("#eg-final").value.trim();ctx.pack.guide.used=new Date().toISOString();
        ctx.save();close();ctx.done();
        if(typeof showEvidenceToast==="function")setTimeout(()=>showEvidenceToast("Statement added to your write-up"),250);
      }}],
      {kicker:"EVIA · GUIDED EVIDENCE",title:"Your statement",keep:true});
  }

  /* ---------- Sheet ---------- */
  function sheet(body,buttons,o){
    const root=document.getElementById("modal-root");
    root.innerHTML='<div class="overlay eg-overlay"><section class="sheet pr-sheet eg-sheet" role="dialog" aria-modal="true" aria-labelledby="eg-title">'+
      '<div class="sheet-head"><div class="eg-head">'+AVATAR+'<div><div class="chat-kicker">'+esc(o.kicker)+'</div><h2 id="eg-title">'+esc(o.title)+'</h2></div></div><button class="close" id="eg-close" type="button" aria-label="Close">×</button></div>'+
      '<div class="pr-body">'+body+'<div class="pr-actions eg-actions">'+(o.back?'<button type="button" class="eg-back" id="eg-back">‹ Back</button>':"")+buttons.map((b,i)=>'<button type="button" class="'+(b.primary?"primary":"secondary")+'" data-eg="'+i+'">'+esc(b.label)+'</button>').join("")+'</div></div></section></div>';
    const el=root.querySelector(".eg-sheet");
    el.querySelectorAll("[data-eg]").forEach(b=>b.onclick=()=>buttons[+b.dataset.eg].run());
    if(o.back)el.querySelector("#eg-back").onclick=o.back;
    const x=()=>{const t=el.querySelector("#eg-text");if(t&&t.oninput)t.oninput();close()};
    el.querySelector("#eg-close").onclick=x;
    if(!o.keep)root.querySelector(".overlay").addEventListener("click",e=>{if(e.target.classList.contains("overlay"))close()});
    if(!el.querySelector("textarea")){const h=el.querySelector("#eg-title");h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}
    return el;
  }
  function close(now){
    const root=document.getElementById("modal-root"),o=root&&root.querySelector(".eg-overlay");if(!o)return;
    if(now||reduced()){root.innerHTML="";return}
    o.classList.add("ui-closing");setTimeout(()=>{if(root.contains(o))root.innerHTML=""},170);
  }

  window.eviaGuide={start,plan,plain};
})();
