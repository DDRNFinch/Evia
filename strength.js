/* Evia7 evidence strength: scores an evidence pack against its unit's "Things to capture" and "Things to mention".
   window.eviaStrength:
     score(pack,prompts) -> {total,level,written,photos,next}  (pack = {photos:[{prompt,takenAt,q}],write})
     analyse(blob)       -> {b,s,h}  brightness, sharpness and a small picture hash, worked out on the phone
     mount(pack,prompts,hooks) paints the live meter and the ticking prompt chips on the evidence pack page
     guide()             opens "How to build a strong portfolio"
   Everything runs offline. Nothing here looks at what a photo shows: learners tag photos with the prompt they cover
   (Evia's camera tags them as they're taken). */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const split=s=>String(s||"").split("·").map(t=>t.trim()).filter(Boolean);
  const words=t=>String(t||"").trim().split(/\s+/).filter(Boolean).length;
  const matched=(term,text)=>window.eviaTermMatched?window.eviaTermMatched(term,text):String(text||"").toLowerCase().includes(term.toLowerCase());
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const count=(re,text)=>(String(text||"").toLowerCase().match(re)||[]).length;

  /* Written parts: what the unit asks for, then the detail an assessor looks for. */
  const STEPS=/\b(first(ly)?|then|next|after(wards)?|once|finally|before|started|to start|finished|last(ly)?|when i|while)\b/g;
  const SPECIFIC=/\b\d+(\.\d+)?\s*(mm|cm|m|metres?|meters?|kg|litres?|bags?|courses?|bricks?|blocks?|%|degrees?|°|:\s*\d+)|\b\d+\s*(?::|to)\s*\d+\b|\b(level|spirit level|line and pins|gauge rod|trowel|jointer|bolster|club hammer|tape|square|plumb|mixer|shovel|profile|builder'?s square)\b/g;
  const REFLECT=/\b(i learn(ed|t)|learn(ed|t)|next time|i would|would do|improve|better|found it|difficult|hard(est)?|tricky|mistake|feedback|my tutor said|supervisor said|i now|i know now|understand)\b/g;
  const MAX={mention:50,length:15,steps:10,specific:10,reflect:15};
  function written(text,terms){
    const covered=terms.filter(t=>matched(t,text)),missing=terms.filter(t=>!covered.includes(t)),w=words(text);
    const parts={
      mention:terms.length?covered.length/terms.length*MAX.mention:0,
      length:clamp((w-20)/100,0,1)*MAX.length,
      steps:clamp(count(STEPS,text)/3,0,1)*MAX.steps,
      specific:clamp(count(SPECIFIC,text)/3,0,1)*MAX.specific,
      reflect:clamp(count(REFLECT,text)/2,0,1)*MAX.reflect
    };
    const raw=Object.values(parts).reduce((a,b)=>a+b,0),total=terms.length?raw:raw/(100-MAX.mention)*100;
    return {score:Math.round(clamp(total,0,100)),covered,missing,words:w,parts};
  }

  /* Photos: usable ones (not too dark, not blurry, not a repeat), the prompts they cover and the job's stages. */
  const DARK=40,BLUR=18,SAME=6;
  const ham=(a,b)=>{let d=0;for(let i=0;i<a.length;i++){const x=parseInt(a[i],16)^parseInt(b[i],16);d+=(x&1)+(x>>1&1)+(x>>2&1)+(x>>3&1)}return d};
  function problems(list){
    const seen=[];
    return list.map(p=>{
      const q=p&&p.q,out=[];
      if(q){if(q.b<DARK)out.push("dark");else if(q.s<BLUR)out.push("blurry");
        if(q.h&&seen.some(h=>ham(h,q.h)<=SAME))out.push("repeat");if(q.h)seen.push(q.h)}
      return out;
    });
  }
  function stages(list){
    const t=list.map(p=>Number(p.takenAt)||Date.parse(p.addedAt)||0).filter(Boolean).sort((a,b)=>a-b);
    let n=t.length?1:0;for(let i=1;i<t.length;i++)if(t[i]-t[i-1]>=20*60e3)n++;
    return n;
  }
  function photos(list,caps){
    list=list||[];
    const probs=problems(list),usable=list.filter((_,i)=>!probs[i].length);
    const tags=new Set(usable.map(p=>p.prompt).filter(Boolean));
    const covered=caps.filter(c=>tags.has(c)),missing=caps.filter(c=>!tags.has(c));
    const need=Math.min(caps.length,5)||1,st=stages(usable);
    const parts={count:clamp(usable.length/6,0,1)*35,prompts:caps.length?clamp(covered.length/need,0,1)*45:clamp(usable.length/6,0,1)*45,stages:(st>=3?1:st===2?.5:0)*20};
    return {score:Math.round(Object.values(parts).reduce((a,b)=>a+b,0)),count:list.length,usable:usable.length,covered,missing,stages:st,probs,parts};
  }

  function score(pack,prompts){
    const caps=split(prompts&&prompts.photos),terms=split(prompts&&prompts.writeup);
    const W=written(pack.write||"",terms),P=photos(pack.photos,caps);
    const empty=!P.count&&!W.words,total=empty?0:Math.round((W.score+P.score)/2);
    const level=empty?null:total>=75&&W.score>=60&&P.score>=60?"strong":total>=45?"good":"weak";
    return {total,level,written:W,photos:P,next:nextSteps(W,P)};
  }
  /* The one or two things that would add the most. */
  function nextSteps(W,P){
    const out=[];
    const bad=P.probs.reduce((n,x)=>n+(x.length?1:0),0);
    if(!P.count)out.push({gain:40,text:"Add photos of the job: beginning, middle and end."});
    if(W.missing.length)out.push({gain:W.missing.length*8,text:"Mention "+listText(W.missing.slice(0,2))+(W.missing.length>2?" (and "+(W.missing.length-2)+" more)":"")+"."});
    if(P.missing.length&&P.covered.length<Math.min(5,P.covered.length+P.missing.length))out.push({gain:P.missing.length*6,text:"Add a photo of "+listText(P.missing.slice(0,2))+"."});
    if(bad)out.push({gain:bad*7,text:"Retake "+(bad===1?"one photo that is":bad+" photos that are")+" too dark, blurry or a repeat."});
    if(P.count&&P.stages<3)out.push({gain:(3-P.stages)*6,text:P.stages<2?"Take photos at the start, middle and end of the job, not all at once.":"Add a photo from another stage of the job."});
    if(W.words&&W.parts.reflect<MAX.reflect)out.push({gain:MAX.reflect-W.parts.reflect,text:"Say what you learned or what you’d do differently next time."});
    if(W.words&&W.parts.steps<MAX.steps)out.push({gain:MAX.steps-W.parts.steps,text:"Explain the steps in order: first, then, finally."});
    if(W.words&&W.parts.specific<MAX.specific)out.push({gain:MAX.specific-W.parts.specific,text:"Add real details: sizes, ratios, the tools you used."});
    if(!W.words)out.push({gain:30,text:"Write about what you did, step by step."});
    return out.sort((a,b)=>b.gain-a.gain).slice(0,2).map(x=>x.text);
  }
  const listText=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];

  /* ---------- Photo checks, on the phone ---------- */
  async function analyse(blob){
    try{
      const img=await createImageBitmap(blob);
      const N=128,c=document.createElement("canvas");c.width=c.height=N;const g=c.getContext("2d",{willReadFrequently:true});
      g.drawImage(img,0,0,N,N);const d=g.getImageData(0,0,N,N).data,L=new Float32Array(N*N);
      let sum=0;for(let i=0;i<N*N;i++){L[i]=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];sum+=L[i]}
      /* sharpness: variance of the Laplacian */
      let m=0,m2=0,k=0;
      for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const i=y*N+x,v=4*L[i]-L[i-1]-L[i+1]-L[i-N]-L[i+N];m+=v;m2+=v*v;k++}
      m/=k;const s=m2/k-m*m;
      /* 64-bit difference hash from a 9×8 grid */
      const h9=document.createElement("canvas");h9.width=9;h9.height=8;const hg=h9.getContext("2d",{willReadFrequently:true});hg.drawImage(img,0,0,9,8);
      const hd=hg.getImageData(0,0,9,8).data;let bits="";
      for(let y=0;y<8;y++)for(let x=0;x<8;x++){const a=(y*9+x)*4,b=a+4;bits+=(hd[a]+hd[a+1]+hd[a+2]<hd[b]+hd[b+1]+hd[b+2])?"1":"0"}
      let h="";for(let i=0;i<64;i+=4)h+=parseInt(bits.slice(i,i+4),2).toString(16);
      if(img.close)img.close();
      return {b:Math.round(sum/(N*N)),s:Math.round(Math.sqrt(Math.max(0,s))*10)/10,h};
    }catch(_){return null}
  }

  /* ---------- On the evidence pack page ---------- */
  const LABEL={strong:"Strong",good:"Good",weak:"Weak"};
  const bars=level=>{const n=level==="strong"?3:level==="good"?2:level==="weak"?1:0;return '<span class="st-bars '+(level||"none")+'" aria-hidden="true">'+[1,2,3].map(i=>'<i'+(i<=n?' class="on"':"")+'></i>').join("")+'</span>'};
  let tagging=null;
  function mount(pack,prompts,hooks){
    const caps=split(prompts.photos),terms=split(prompts.writeup);
    const paint=()=>{
      const r=score(pack,prompts);
      const cap=document.getElementById("st-cap"),men=document.getElementById("st-men"),met=document.getElementById("st-meter");
      if(cap)cap.innerHTML=caps.map(c=>'<span class="st-chip'+(r.photos.covered.includes(c)?" on":"")+'">'+esc(c)+'</span>').join("");
      if(men)men.innerHTML=terms.map(t=>'<span class="st-chip'+(r.written.covered.includes(t)?" on":"")+'">'+esc(t)+'</span>').join("");
      if(met){
        met.innerHTML='<button type="button" class="st-meter-top" aria-label="How strength is worked out"><span class="st-meter-label">Strength</span>'+bars(r.level)+'<strong>'+(r.level?LABEL[r.level]:"Not started")+'</strong><span class="st-meter-num">'+r.total+'</span></button>'+
          '<span class="st-track"><i style="width:'+r.total+'%"></i><b style="left:75%" aria-hidden="true"></b></span>'+
          '<span class="st-split"><span>Photos <strong>'+r.photos.score+'</strong></span><span>Write-up <strong>'+r.written.score+'</strong></span></span>'+
          (r.next.length?'<span class="st-next"><span class="st-next-h">'+(r.level==="strong"?"To make it even better":"To make it stronger")+'</span>'+r.next.map(t=>'<span class="st-next-i">'+esc(t)+'</span>').join("")+'</span>':'<span class="st-next"><span class="st-next-i done">This pack covers everything. Nice work.</span></span>')+
          '<button type="button" class="st-how">What makes evidence strong? ›</button>';
        met.className="st-meter "+(r.level||"none");
        met.querySelector(".st-meter-top").onclick=()=>explain(r);
        met.querySelector(".st-how").onclick=guide;
      }
      paintThumbs(pack,r,caps,hooks);
      return r;
    };
    return paint;
  }
  /* Tag and warning under each thumbnail; tap a thumbnail to say which prompt it shows. */
  function paintThumbs(pack,r,caps,hooks){
    const items=[...document.querySelectorAll("#evidence-photos .photo-item")];
    items.forEach((el,i)=>{
      const p=pack.photos[i];if(!p)return;
      let cap=el.querySelector(".st-tag");if(!cap){cap=document.createElement("button");cap.type="button";cap.className="st-tag";el.appendChild(cap)}
      const pr=r.photos.probs[i]||[];
      cap.className="st-tag"+(p.prompt?" on":"")+(pr.length?" warn":"");
      cap.innerHTML=pr.length?'<span aria-hidden="true">!</span> '+esc(pr[0]==="repeat"?"Repeat":pr[0]==="dark"?"Too dark":"Blurry"):esc(p.prompt||"Tag it");
      cap.setAttribute("aria-label",(p.prompt?"Photo shows "+p.prompt:"Tag this photo")+(pr.length?". "+pr.join(", "):""));
      cap.onclick=()=>openTagger(i,pack,caps,hooks);
    });
    const tg=document.getElementById("st-tagger");
    if(tg&&tagging!=null&&!pack.photos[tagging]){tg.hidden=true;tagging=null}
  }
  function openTagger(i,pack,caps,hooks){
    const tg=document.getElementById("st-tagger");if(!tg||!caps.length)return;
    tagging=i;const p=pack.photos[i];
    tg.hidden=false;
    tg.innerHTML='<span class="st-tagger-h">Photo '+(i+1)+' shows…</span><span class="st-tagger-list">'+caps.map(c=>'<button type="button" class="st-chip pick'+(p.prompt===c?" on":"")+'" data-c="'+esc(c)+'">'+esc(c)+'</button>').join("")+(p.prompt?'<button type="button" class="st-chip pick clear" data-c="">Not sure</button>':"")+'</span>';
    tg.querySelectorAll("[data-c]").forEach(b=>b.onclick=async()=>{p.prompt=b.dataset.c||undefined;tg.hidden=true;tagging=null;await hooks.save();hooks.repaint()});
    tg.scrollIntoView({block:"nearest",behavior:"smooth"});
  }

  /* ---------- Explanations ---------- */
  function sheet(kicker,title,body){
    const root=document.getElementById("modal-root");
    root.innerHTML='<div class="overlay"><section class="sheet pr-sheet st-sheet" role="dialog" aria-modal="true" aria-labelledby="st-title"><div class="sheet-head"><div><div class="chat-kicker">'+kicker+'</div><h2 id="st-title">'+title+'</h2></div><button class="close" id="st-close" type="button" aria-label="Close">×</button></div><div class="pr-body">'+body+'</div></section></div>';
    const close=()=>{const o=root.querySelector(".overlay");if(!o)return;o.classList.add("ui-closing");setTimeout(()=>{if(root.contains(o))root.innerHTML=""},170)};
    document.getElementById("st-close").onclick=close;
    root.querySelector(".overlay").addEventListener("click",e=>{if(e.target.classList.contains("overlay"))close()});
    const h=document.getElementById("st-title");h.setAttribute("tabindex","-1");h.focus({preventScroll:true});
    return root.querySelector(".st-sheet");
  }
  const row=(label,got,max)=>'<span class="st-row"><span>'+label+'</span><span class="st-row-bar"><i style="width:'+Math.round(got/max*100)+'%"></i></span><strong>'+Math.round(got)+'<small>/'+max+'</small></strong></span>';
  function explain(r){
    const W=r.written,P=r.photos;
    sheet("EVIDENCE STRENGTH",(r.level?LABEL[r.level]:"Not started")+" · "+r.total,
      '<p class="pr-intro">Strength is half your photos and half your write-up, checked against this unit’s things to capture and things to mention. Strong is 75 or more, with both halves at 60 or more.</p>'+
      '<h3 class="pr-h">Photos · '+P.score+'</h3><div class="st-rows">'+
        row("Clear photos ("+P.usable+" of 6)",P.parts.count,35)+row("Things to capture ("+P.covered.length+")",P.parts.prompts,45)+row("Start, middle and end",P.parts.stages,20)+'</div>'+
      '<h3 class="pr-h">Write-up · '+W.score+'</h3><div class="st-rows">'+
        row("Things to mention ("+W.covered.length+" of "+(W.covered.length+W.missing.length)+")",W.parts.mention,MAX.mention)+row("Enough detail ("+W.words+" words)",W.parts.length,MAX.length)+row("Steps in order",W.parts.steps,MAX.steps)+row("Real details: sizes, ratios, tools",W.parts.specific,MAX.specific)+row("What you learned",W.parts.reflect,MAX.reflect)+'</div>'+
      '<div class="pr-actions"><button type="button" class="secondary" id="st-guide">How to build a strong portfolio</button></div>');
    document.getElementById("st-guide").onclick=guide;
  }
  function guide(){
    const tip=(n,title,text)=>'<li class="st-tip"><span class="st-tip-n">'+n+'</span><span><strong>'+title+'</strong><span>'+text+'</span></span></li>';
    sheet("MY PORTFOLIO","How to build a strong portfolio",
      '<p class="pr-intro">Your assessor needs to see that <strong>you</strong> did the work, that you did it properly, and that you understand why. Every unit has <strong>things to capture</strong> and <strong>things to mention</strong>: they are your checklist.</p>'+
      '<ol class="st-tips">'+
        tip(1,"Photos from start to finish","Take photos at the beginning, middle and end of the job, not all at the end. Six or more clear photos is a good pack.")+
        tip(2,"One photo for each thing to capture","Use Evia’s camera: it shows each thing to capture and tags the photo for you. For gallery photos, tap the tag under the photo.")+
        tip(3,"Clear, close and well lit","Get close enough to see the detail, hold still and make sure it’s not too dark. Evia flags blurry, dark or repeated photos.")+
        tip(4,"Mention every key point","Write about each thing to mention in your own words. The chips tick as you cover them.")+
        tip(5,"Explain the steps in order","First, then, finally. Say what you did and why you did it that way.")+
        tip(6,"Use real details","Sizes, ratios, the number of courses, the tools and PPE you used, who you worked with.")+
        tip(7,"Say what you learned","What went well, what was tricky, and what you’d do differently next time. This is what lifts good evidence to strong.")+
        tip(8,"A little every week","Add evidence while the job is fresh. Short, regular packs beat a rush before your review.")+
      '</ol>'+
      '<div class="pr-banner"><strong>How Evia rates it:</strong> half photos, half write-up. <strong>Weak</strong> is under 45, <strong>Good</strong> is 45 to 74, <strong>Strong</strong> is 75 or more with both halves at 60 or more. Your assessor makes the final decision.</div>');
  }

  window.eviaStrength={score,analyse,mount,guide,explain,problems};
})();
