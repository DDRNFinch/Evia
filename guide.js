/* Evia7 guided evidence: Evia walks a learner through one evidence pack, if they want her to.
   window.eviaGuide.start({unitName, prompts, pack, addFiles, save, done})
     1. Photos: Evia's camera asks for each thing to capture in turn (take one or more, or skip).
     2. Questions: one question for each thing to mention, with a text box (skip, or save and continue).
     3. Statement: the answers are put together, in the learner's own words, as the pack's write-up,
        which goes on the PDF with the photos as normal.
   Answers are saved in the pack as they go (pack.guide), so a learner can stop and carry on later. */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const split=s=>{const seen=new Set();return String(s||"").split("·").map(t=>t.trim()).filter(t=>{const k=t.toLowerCase();if(!t||seen.has(k))return false;seen.add(k);return true})};
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AVATAR='<span class="evia-mini" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span>';

  /* ---------- What Evia asks ---------- */
  /* Photo requests: how many and what kind, so learners get close-ups and the wider view. */
  function photoAsk(term){
    const t=term.toLowerCase();
    if(/\bppe\b|\brpe\b/.test(t))return {say:"Show me your PPE for this job.",hint:"One photo is fine."};
    if(/safe|hazard|risk|sign/.test(t))return {say:"Show me how the area was kept safe.",hint:"Barriers, signs, a tidy work area: one or two photos."};
    if(/drawing|specification|plan\b/.test(t))return {say:"Show me the "+term+" you worked from.",hint:"One photo, close enough to read."};
    if(/team|communicat/.test(t))return {say:"Show me the team at work.",hint:"One photo. Ask before you photograph anyone."};
    if(/tool/.test(t))return {say:"Show me the "+term+".",hint:"One photo, laid out so each tool can be seen."};
    return {say:"Show me the "+term+".",hint:"Take two: a close-up, and one from further back."};
  }
  /* Questions for the write-up: specific where the topic is common across trades, otherwise how and why. */
  const ASK=[
    [/\bppe\b/,t=>"What PPE did you wear for this job, and why did you need it?"],
    [/\brpe\b|\blev\b|dust/,t=>"How did you protect yourself from dust on this job?"],
    [/asbestos/,t=>"What would you do if you thought you’d found asbestos? Why does it matter?"],
    [/slips|trips|falls/,t=>"How did you stop slips, trips and falls on this job?"],
    [/height|scaffold|ladder/,t=>"How did you work safely at height on this job?"],
    [/manual handling|lifting/,t=>"How did you lift and move materials safely?"],
    [/^health$|wellbeing|well-being|mental/,t=>"How did you look after your health and wellbeing during this job?"],
    [/safe|safety|hazard|risk assessment|method statement|toolbox/,t=>"How did you keep yourself and others safe on this job?"],
    [/team/,t=>"Who did you work with, and how did you help each other?"],
    [/communicat/,t=>"Who did you need to talk to on this job, and what about?"],
    [/drawing|specification/,t=>"How did you use the "+t+" on this job? What did they tell you?"],
    [/environment|waste|recycl|resource|surface water/,t=>"How did you deal with waste and look after the environment on this job?"],
    [/regulation|standard|warrant/,t=>"Which "+t+" applied to this job, and how did your work meet them?"],
    [/inclusion|equity|diversity|equality/,t=>"What does "+t+" mean on site or in your team? Give an example."],
    [/terminology/,t=>"Which trade words came up on this job? Explain two or three of them."],
    [/digital|modern|modelling|bim/,t=>"Where does "+t+" fit into jobs like this one?"],
    [/ownership|responsib/,t=>"What were you responsible for on this job, and how did you make sure it was right?"],
    [/defect|damage/,t=>"What "+t+" did you look for, and what did you do about them?"],
    [/maintenance|maintain/,t=>"How do you look after your tools and equipment, and why?"],
    [/ratio|gauging|quantit/,t=>"What "+t+" did you use, and how did you get it right?"],
    [/cost|time|programme|schedule/,t=>"How did "+t+" affect the way you planned this job?"]
  ];
  function question(term){
    const t=term.toLowerCase();
    for(const [re,fn] of ASK)if(re.test(t))return fn(term);
    return "Tell me about the "+term+" on this job: what you did, and what it’s for.";
  }

  /* ---------- The flow ---------- */
  function start(ctx){
    const caps=split(ctx.prompts&&ctx.prompts.photos),terms=split(ctx.prompts&&ctx.prompts.writeup);
    const g=ctx.pack.guide=ctx.pack.guide||{answers:{}};
    const answered=terms.filter(t=>String(g.answers[t]||"").trim()).length;
    const canCam=window.eviaCamera&&window.eviaCamera.supported()&&caps.length;
    sheet('<p class="eg-say">'+(answered?"Welcome back. You’ve answered "+answered+" of my "+terms.length+" questions.":"I’ll guide you through this pack. First the photos, one thing at a time, then a few questions about the job. I’ll put your answers together into your statement.")+'</p>'+
      '<p class="eg-small">Skip anything you like. Your answers save as you go.</p>',
      [answered?{label:"Carry on with the questions",primary:true,run:()=>ask(ctx,terms,firstGap(terms,g))}:null,
       canCam?{label:"Start with photos",primary:!answered,run:()=>photos(ctx,caps,terms)}:null,
       {label:canCam?"Skip to the questions":"Start the questions",primary:!canCam&&!answered,run:()=>ask(ctx,terms,answered?firstGap(terms,g):0)}].filter(Boolean),
      {kicker:"EVIA · GUIDED EVIDENCE",title:ctx.unitName});
  }
  const firstGap=(terms,g)=>{const i=terms.findIndex(t=>!String(g.answers[t]||"").trim());return i<0?terms.length:i};

  function photos(ctx,caps,terms){
    close(true);
    window.eviaCamera.open({title:ctx.unitName,guide:caps.map(c=>Object.assign({term:c},photoAsk(c))),onDone:async files=>{
      if(files.length)await ctx.addFiles(files);
      setTimeout(()=>{
        sheet('<p class="eg-say">'+(files.length?"Nice, that’s "+files.length+" photo"+(files.length===1?"":"s")+" added.":"No photos this time. You can add them later.")+' Now a few questions about the job. Answer in your own words, as if you were explaining it to someone new.</p>',
          [{label:"Start the questions",primary:true,run:()=>ask(ctx,terms,firstGap(terms,ctx.pack.guide))},{label:"Stop for now",run:()=>close()}],
          {kicker:"EVIA · GUIDED EVIDENCE",title:"Photos done"});
      },files.length?250:60);
    }});
  }

  function ask(ctx,terms,i){
    const g=ctx.pack.guide;
    if(!terms.length||i>=terms.length){review(ctx,terms);return}
    const t=terms[i];
    const el=sheet(
      '<div class="eg-progress" aria-hidden="true"><i style="width:'+Math.round(i/terms.length*100)+'%"></i></div>'+
      '<p class="eg-say eg-q">'+esc(question(t))+'</p>'+
      '<textarea class="eg-text" id="eg-text" rows="6" placeholder="In your own words…" aria-label="'+esc(question(t))+'">'+esc(g.answers[t]||"")+'</textarea>',
      [{label:"Skip",run:()=>{save();ask(ctx,terms,i+1)}},{label:i===terms.length-1?"Save and finish":"Save and continue",primary:true,run:()=>{save();ask(ctx,terms,i+1)}}],
      {kicker:"EVIA · QUESTION "+(i+1)+" OF "+terms.length,title:t.charAt(0).toUpperCase()+t.slice(1),back:i>0?()=>{save();ask(ctx,terms,i-1)}:null,keep:true});
    const box=el.querySelector("#eg-text");
    function save(){g.answers[t]=box.value.trim();ctx.save()}
    let timer=null;box.oninput=()=>{clearTimeout(timer);timer=setTimeout(save,400)};
    setTimeout(()=>box.focus({preventScroll:true}),reduced()?0:220);
  }

  /* The statement: what they already wrote, then each answer as its own paragraph, in the order asked. */
  function compile(ctx,terms){
    const g=ctx.pack.guide,parts=terms.map(t=>String(g.answers[t]||"").trim()).filter(Boolean);
    const had=String(ctx.pack.write||"").trim();
    const fresh=parts.filter(p=>!had.includes(p));
    return [had,...fresh].filter(Boolean).join("\n\n");
  }
  function review(ctx,terms){
    const text=compile(ctx,terms),n=terms.filter(t=>String(ctx.pack.guide.answers[t]||"").trim()).length;
    if(!text){
      sheet('<p class="eg-say">You skipped all the questions, so there’s nothing to put together yet. You can come back to me any time, or write it yourself.</p>',[{label:"Close",primary:true,run:()=>close()}],{kicker:"EVIA · GUIDED EVIDENCE",title:"Your statement"});return;
    }
    const el=sheet('<p class="eg-say">Here’s your statement, made from your '+n+' answer'+(n===1?"":"s")+'. Read it through and change anything you like. It goes in your write-up and on the PDF with your photos.</p>'+
      '<textarea class="eg-text eg-final" id="eg-final" rows="12" aria-label="Your statement">'+esc(text)+'</textarea>',
      [{label:"Back",run:()=>ask(ctx,terms,terms.length-1)},{label:"Use this statement",primary:true,run:()=>{
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

  window.eviaGuide={start,question,photoAsk};
})();
