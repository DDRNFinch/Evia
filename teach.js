/* Evia7 Teach me: short interactive lessons, a bit like Duolingo or Mimo, with Evia teaching.
   A full page with an animated Evia and a path of lessons for each unit. Each lesson mixes picture cards with
   quick steps: pick the answer (words or pictures), true or false, match the pairs, and put the steps in order.
   Wrong answers explain why and let you try again; nothing is lost. Each unit's lessons cover all of its KSBs
   between them (the learner never sees the codes).
   Results give "Evia's view" of the matching confidence skill, shown beside the learner's own rating.
   window.eviaTeach: open(), available(), summary(), viewFor(area). Pilot: Bricklayer, Mixing mortar. */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(_){}};
  const LEVELS=["Need training","Basics","Confident","Mastered"];
  const KEY="evia7-teach";
  const readStore=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(_){return {}}};
  const writeStore=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}};
  const mine=()=>{const s=readStore();return (s[course]=s[course]||{lessons:{}}).lessons};
  const saveResult=(id,score)=>{const s=readStore(),c=s[course]=s[course]||{lessons:{}},was=c.lessons[id];c.lessons[id]={done:true,best:Math.max(score,was?was.best:0),last:score,at:Date.now()};writeStore(s)};

  /* ---------- Pictures, drawn here so they work offline and follow the theme ---------- */
  const svg=(w,h,body,label)=>'<svg class="tp" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(label)+'">'+body+'</svg>';
  const bucket=(x,y,cls,heap)=>'<g transform="translate('+x+' '+y+')">'+(heap?'<path class="'+cls+'" d="M4 10 Q20 -12 36 10 Z"/>':"")+'<path class="'+cls+'" d="M4 10 H36 L32 46 H8 Z"/><path class="tp-line" d="M2 10 H38 M4 10 L8 46 H32 L36 10"/><path class="tp-thin" d="M6 10 Q20 -8 34 10"/></g>';
  const PICS={
    ingredients:()=>svg(320,120,
      '<g><path class="tp-sand" d="M14 92 Q50 30 86 92 Z"/><text x="50" y="112">Sand</text></g>'+
      '<g><rect class="tp-bag" x="104" y="40" width="52" height="54" rx="6"/><text class="tp-on" x="130" y="72">CEMENT</text><text x="130" y="112">Cement</text></g>'+
      '<g><path class="tp-water" d="M200 36 Q222 64 222 78 A22 22 0 0 1 178 78 Q178 64 200 36 Z"/><text x="200" y="112">Water</text></g>'+
      '<g><rect class="tp-bottle" x="258" y="46" width="30" height="48" rx="6"/><rect class="tp-bottle" x="266" y="34" width="14" height="14" rx="2"/><text x="273" y="112">Plasticiser</text></g>',
      "Sand, cement, water and plasticiser"),
    ratio:()=>svg(320,120,
      bucket(18,40,"tp-cement")+'<text class="tp-big" x="92" y="78">:</text>'+[0,1,2,3].map(i=>bucket(112+i*50,40,"tp-sand")).join("")+
      '<text x="38" y="106">1 cement</text><text x="211" y="106">4 sand</text>',"One bucket of cement to four buckets of sand"),
    level:()=>svg(120,100,bucket(40,34,"tp-sand")+'<path class="tp-accent" d="M40 44 H80"/>',"A bucket filled level"),
    heaped:()=>svg(120,100,bucket(40,34,"tp-sand",true),"A heaped bucket"),
    gauge:()=>svg(320,120,
      bucket(40,40,"tp-sand")+'<path class="tp-accent" d="M40 50 H80"/><text x="60" y="106">Level: right</text>'+
      bucket(200,40,"tp-sand",true)+'<path class="tp-cross" d="M204 20 L236 52 M236 20 L204 52"/><text x="220" y="106">Heaped: wrong</text>',"A level bucket is right, a heaped bucket is wrong"),
    heap:()=>svg(320,120,
      '<rect class="tp-board" x="20" y="88" width="280" height="10" rx="3"/><path class="tp-mix" d="M50 88 Q160 8 270 88 Z"/><ellipse class="tp-water" cx="160" cy="52" rx="34" ry="9"/>'+
      '<path class="tp-thin" d="M126 50 Q160 30 194 50"/><text x="160" y="116">A well in the middle for the water</text>',"A mixed heap on a board with a well of water"),
    mixer:()=>svg(320,120,
      '<path class="tp-drum" d="M110 30 L190 22 L214 78 L128 92 Z"/><ellipse class="tp-drumlip" cx="150" cy="27" rx="42" ry="12" transform="rotate(-6 150 27)"/>'+
      '<path class="tp-line" d="M168 86 L180 104 M140 90 L120 104 M100 104 H200"/><circle class="tp-wheel" cx="112" cy="104" r="8"/><circle class="tp-wheel" cx="194" cy="104" r="8"/>'+
      '<path class="tp-cross" d="M240 36 L272 68 M272 36 L240 68"/><text x="256" y="92">No hands</text><text x="256" y="106">in the drum</text>',"A drum mixer: never reach in while it turns"),
    silo:()=>svg(320,120,
      '<rect class="tp-silo" x="40" y="6" width="56" height="78" rx="10"/><path class="tp-silo" d="M44 84 L60 100 H76 L92 84 Z"/><rect class="tp-drum" x="54" y="100" width="28" height="10" rx="2"/><text class="tp-on" x="68" y="48">SILO</text>'+
      '<rect class="tp-tub" x="170" y="60" width="70" height="36" rx="6"/><text class="tp-on" x="205" y="82">PRE-MIX</text>'+
      '<text x="68" y="118">Dry mix + water at the outlet</text><text x="205" y="118">Ready to use</text>',"A silo on site and a tub of pre-mixed mortar"),
    ppe:()=>svg(320,120,
      '<path class="tp-glove" d="M40 100 V56 Q40 46 48 46 V30 Q48 24 54 24 Q60 24 60 30 V44 V22 Q60 16 66 16 Q72 16 72 22 V44 V26 Q72 20 78 20 Q84 20 84 26 V48 V36 Q84 30 90 30 Q96 30 96 36 V74 Q96 100 70 100 Z"/>'+
      '<g><rect class="tp-goggle" x="130" y="42" width="44" height="30" rx="12"/><rect class="tp-goggle" x="180" y="42" width="44" height="30" rx="12"/><path class="tp-line" d="M174 56 H180 M120 56 H130 M224 56 H234"/></g>'+
      '<g><path class="tp-mask" d="M258 50 Q282 38 306 50 L302 78 Q282 92 262 78 Z"/><path class="tp-line" d="M258 54 L248 48 M306 54 L316 48"/></g>'+
      '<text x="68" y="116">Gloves</text><text x="177" y="116">Eye protection</text><text x="282" y="116">Dust mask</text>',"Gloves, eye protection and a dust mask"),
    signs:()=>svg(320,120,
      '<circle class="tp-sign-blue" cx="40" cy="50" r="30"/><text class="tp-sign-t" x="40" y="56">MUST</text>'+
      '<path class="tp-sign-yellow" d="M120 20 L152 78 H88 Z"/><text class="tp-sign-k" x="120" y="70">!</text>'+
      '<g><circle class="tp-sign-white" cx="200" cy="50" r="30"/><circle class="tp-sign-red" cx="200" cy="50" r="27"/><path class="tp-sign-redline" d="M181 31 L219 69"/></g>'+
      '<rect class="tp-sign-green" x="252" y="22" width="56" height="56" rx="6"/><path class="tp-sign-cross" d="M280 34 V66 M264 50 H296"/>'+
      '<text x="40" y="104">Must do</text><text x="120" y="104">Warning</text><text x="200" y="104">Must not</text><text x="280" y="104">Safe</text>',"Blue, yellow, red and green safety signs"),
    team:()=>svg(320,120,
      '<circle class="tp-head" cx="90" cy="34" r="14"/><path class="tp-body" d="M66 100 Q66 56 90 56 Q114 56 114 100 Z"/>'+
      '<circle class="tp-head" cx="230" cy="34" r="14"/><path class="tp-body" d="M206 100 Q206 56 230 56 Q254 56 254 100 Z"/>'+
      '<path class="tp-bubble" d="M122 22 H196 Q204 22 204 30 V50 Q204 58 196 58 H150 L138 68 L140 58 H122 Q114 58 114 50 V30 Q114 22 122 22 Z"/><text x="159" y="45">More mortar at 11?</text>',"Two people talking about when mortar is needed")
  };
  const pic=name=>PICS[name]?'<div class="tm-pic">'+PICS[name]()+'</div>':"";

  /* ---------- Lessons ---------- */
  const COURSES={
    bricklayer:[{
      unit:"Mixing mortar",skill:"Mortar mixing",
      lessons:[
        {id:"mm1",title:"What’s in mortar",blurb:"Sand, cement, water and ratios",steps:[
          {t:"learn",pic:"ingredients",title:"Four ingredients",text:"Mortar is sand, cement and water. Sand gives it body, cement binds it together as it sets, and water starts the setting. A plasticiser (or lime) can be added to make it easier to spread."},
          {t:"match",q:"Match each ingredient to its job",pairs:[["Sand","Fills out the mix"],["Cement","Binds it as it sets"],["Water","Starts the setting"],["Plasticiser","Makes it easier to spread"]]},
          {t:"learn",pic:"ratio",title:"Mixing by ratio",text:"Mortar is mixed by ratio, by volume. 1:4 means 1 part cement to 4 parts sand, using the same bucket or gauge box for every part."},
          {t:"choice",q:"In a 1:5 mix, how many buckets of sand go with 1 bucket of cement?",opts:["1","4","5","6"],a:2,why:"The second number is the sand: 1 part cement to 5 parts sand."},
          {t:"choice",q:"You have 6 buckets of sand for a 1:6 mix. How much cement do you need?",opts:["Half a bucket","1 bucket","2 buckets","6 buckets"],a:1,why:"1:6 means 1 part cement for every 6 parts sand."},
          {t:"tf",q:"The strongest mix is always the best choice.",a:false,why:"Mortar should suit the bricks and the job. Too strong and it can crack rather than let the wall move a little. The specification tells you the mix."},
          {t:"choice",q:"Where do you find which ratio to use?",opts:["The specification, or ask your supervisor","Whatever you used last time","Add cement until it looks right","On the sand bag"],a:0,why:"The ratio is set for the job in the specification. If you’re not sure, ask."}
        ]},
        {id:"mm2",title:"Gauging it right",blurb:"Measuring the same way every time",steps:[
          {t:"learn",pic:"gauge",title:"What gauging means",text:"Gauging means measuring each part the same way every time. Use a bucket or gauge box and fill it level, not heaped, so every batch is the same strength and colour."},
          {t:"choice",q:"Which bucket is gauged properly?",pics:true,opts:[{pic:"heaped",text:"Heaped up"},{pic:"level",text:"Filled level"}],a:1,why:"Level buckets hold the same amount every time. Heaped ones don’t."},
          {t:"choice",q:"Why not just count shovelfuls?",opts:["Shovelfuls vary, so the mix changes","Shovels are too slow","It mixes better in a bucket","Counting shovelfuls is fine"],a:0,why:"Every shovelful is a different size, so the ratio drifts from batch to batch."},
          {t:"tf",q:"If batches aren’t gauged the same, the joints can dry a different colour.",a:true,why:"Colour and strength change with the ratio, and it shows on the finished wall."},
          {t:"choice",q:"Your sand is very wet today. What should you do?",opts:["Add water slowly: the sand already holds some","Add extra cement","Add the usual amount of water all at once","Nothing changes"],a:0,why:"Wet sand already carries water, so add water a little at a time until the mix is right."}
        ]},
        {id:"mm3",title:"Mixing it",blurb:"By hand, by mixer, silos and pre-mix",steps:[
          {t:"learn",pic:"heap",title:"Mixing by hand",text:"On a clean board, dry mix the sand and cement until it’s one even colour. Make a well in the middle, add water a little at a time, and turn it in until it’s smooth and holds its shape on the trowel."},
          {t:"order",q:"Put the hand-mixing steps in order",items:["Gauge the sand and cement","Dry mix to one even colour","Make a well in the middle","Add water a little at a time","Turn it until it’s smooth and workable"],why:"Dry mixing first gets the cement spread evenly before any water goes in."},
          {t:"learn",pic:"mixer",title:"Mixing by machine",text:"With a drum mixer, add some water first, then the sand and cement in the right ratio, and let it turn for a few minutes. Keep it clean between batches, and never put your hands or a shovel in while it’s turning."},
          {t:"match",q:"Match each way of getting mortar",pairs:[["By hand","Small amounts on a clean board"],["Drum mixer","Bigger batches, turned for a few minutes"],["Silo","Dry mix on site, water added at the outlet"],["Pre-mixed","Arrives ready to use"]]},
          {t:"choice",q:"Your mortar has started to stiffen and set in the tub. What should you do?",opts:["Mix a fresh batch","Add water and knock it back up","Add more cement","Put it in the sun"],a:0,why:"Once it’s started to set, adding water weakens it. Mix fresh, and only mix what you’ll use. For pre-mixed mortar, follow the maker’s time limit."},
          {t:"tf",q:"It’s fine to reach into a mixer if it’s turning slowly.",a:false,why:"Never. Switch it off first. A turning drum can catch a glove or sleeve in a moment."}
        ]},
        {id:"mm4",title:"Safe, ready and together",blurb:"PPE, signs, quantities and teamwork",steps:[
          {t:"learn",pic:"ppe",title:"Cement can burn",text:"Wet cement is alkaline and can burn skin, sometimes without you noticing until later. Wear gloves, eye protection and long sleeves, and wash it off straight away. Wear a dust mask when you open or tip bags."},
          {t:"choice",q:"Wet mortar has splashed on your arm. What do you do?",opts:["Wash it off straight away with clean water","Leave it until break","Wipe it on your trousers","It dries, so it’s harmless"],a:0,why:"The longer it stays on, the worse the burn. Wash it off with clean water straight away."},
          {t:"learn",pic:"signs",title:"Signs by colour",text:"Blue circles tell you what you must do. Yellow triangles warn of a hazard. Red circles show what you must not do. Green signs show safe conditions, like first aid."},
          {t:"match",q:"Match each sign to what it means",pairs:[["Blue circle","You must do this"],["Yellow triangle","Warning of a hazard"],["Red circle","You must not do this"],["Green square","Safe condition, like first aid"]]},
          {t:"choice",q:"Cement bags weigh 25 kg. What’s the safest way to move several?",opts:["A trolley or barrow, or share the load","Carry two at once to save time","Drag them along the ground","Throw them onto the pile"],a:0,why:"Use equipment where you can and lift with your legs. Your back has to last your whole career."},
          {t:"choice",q:"How do you avoid mixing too much mortar?",opts:["Work out what you need for the bricks you’ll lay before it goes off","Fill the mixer every time","Mix the whole day’s worth first thing","Add water later to keep it going"],a:0,why:"Estimate from the work in front of you, so nothing is wasted and it’s always fresh."},
          {t:"learn",pic:"team",title:"Working as a team",text:"Mortar runs the job. Tell your labourer or team what you’ll need and when, so it’s ready without waiting, and look after each other’s health and safety as you go."},
          {t:"choice",q:"You’ll need more mortar in half an hour. What’s best?",opts:["Tell your labourer now so it’s ready in time","Wait until you run out","Mix it yourself without telling anyone","Stop work and wait"],a:0,why:"A heads-up keeps the job flowing and nobody is left waiting."}
        ]}
      ]
    }]
  };
  const units=()=>COURSES[typeof course!=="undefined"?course:""]||[];
  const available=()=>units().length>0;
  function summary(){
    const L=mine(),all=[].concat(...units().map(u=>u.lessons)),done=all.filter(l=>L[l.id]&&L[l.id].done).length;
    const next=all.find(l=>!(L[l.id]&&L[l.id].done));
    return {done,total:all.length,next:next?next.title:null,unit:units()[0]?units()[0].unit:""};
  }
  /* Evia's view of a confidence skill, from how the lessons went (first-try answers). Needs half the lessons done. */
  function viewFor(area){
    const u=units().find(x=>x.skill===area);if(!u)return null;
    const L=mine(),done=u.lessons.filter(l=>L[l.id]&&L[l.id].done);
    if(done.length<Math.ceil(u.lessons.length/2))return null;
    /* Rated on first-try accuracy; "Mastered" only once every lesson in the unit is done. */
    const avg=done.reduce((n,l)=>n+L[l.id].best,0)/done.length,all=done.length===u.lessons.length;
    const level=Math.min(avg>=.9?4:avg>=.7?3:avg>=.5?2:1,all?4:3);
    return {level,label:LEVELS[level-1],done:done.length,total:u.lessons.length,soFar:!all};
  }

  /* ---------- The page ---------- */
  let root=null,onKey=null;
  const EVIA='<span class="tm-evia evia-mini" aria-hidden="true"><span class="evia-face"><i></i><i></i></span></span>';
  function open(){
    if(root)root.remove();
    root=document.createElement("div");root.className="tm";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-label","Teach me");
    document.body.appendChild(root);
    onKey=e=>{if(e.key==="Escape")close()};document.addEventListener("keydown",onKey);
    path();
  }
  function close(){
    if(!root)return;document.removeEventListener("keydown",onKey);
    const r=root;root=null;r.classList.add("tm-out");setTimeout(()=>r.remove(),reduced()?0:200);
    if(typeof render==="function"&&typeof screen!=="undefined"&&screen==="course")render();
  }

  function path(){
    const L=mine(),us=units(),all=[].concat(...us.map(u=>u.lessons));
    const nextI=all.findIndex(l=>!(L[l.id]&&L[l.id].done)),s=summary();
    const name=(()=>{try{return (JSON.parse(localStorage.getItem("evia7-profile")||"{}").name||"").split(/\s+/)[0]}catch(_){return ""}})();
    const say=s.done===0?"Hi"+(name?" "+esc(name):"")+"! I’ll teach you everything in each unit, a few minutes at a time. Tap the first lesson to start.":
      s.done===s.total?"You’ve finished every lesson here. Nice work! Replay any lesson to beat your score.":
      "Welcome back"+(name?", "+esc(name):"")+". Next up: <strong>"+esc(s.next)+"</strong>.";
    const others=(typeof data==="function"?data().u.map(u=>u[0]):[]).filter(n=>!us.some(u=>u.unit===n)).slice(0,4);
    let n=0;
    root.innerHTML='<header class="tm-bar"><button type="button" class="tm-x" aria-label="Close">×</button><strong>Teach me</strong><span class="tm-count">'+s.done+' / '+s.total+'</span></header>'+
      '<div class="tm-scroll">'+
        '<section class="tm-hero">'+EVIA+'<p class="tm-say">'+say+'</p></section>'+
        us.map(u=>{
          const d=u.lessons.filter(l=>L[l.id]&&L[l.id].done).length;
          return '<section class="tm-unit"><div class="tm-unit-head"><span class="tm-unit-k">Unit</span><h2>'+esc(u.unit)+'</h2><small>'+u.lessons.length+' lessons · covers the whole unit</small><span class="tm-unit-bar"><i style="width:'+Math.round(d/u.lessons.length*100)+'%"></i></span></div>'+
            '<ol class="tm-path">'+u.lessons.map(l=>{
              const i=n++,r=L[l.id],state=r&&r.done?"done":i===nextI?"next":i<nextI||nextI<0?"done":"locked";
              return '<li class="tm-node '+state+'" style="--i:'+(i%4)+'"><button type="button" data-lesson="'+l.id+'"'+(state==="locked"?' disabled aria-disabled="true"':"")+' aria-label="'+esc(l.title)+(state==="done"?", done":state==="locked"?", locked":"")+'">'+
                '<span class="tm-dot">'+(state==="done"?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>':state==="locked"?'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>':'<b>'+(i+1)+'</b>')+'</span>'+
                (state==="next"?'<span class="tm-start">Start</span>':"")+
                '<span class="tm-label"><strong>'+esc(l.title)+'</strong><small>'+esc(l.blurb)+(r?' · best '+Math.round(r.best*100)+'%':"")+'</small></span></button></li>';
            }).join("")+'</ol></section>';
        }).join("")+
        (others.length?'<section class="tm-soon"><h3>Coming next</h3>'+others.map(o=>'<div class="tm-soon-row"><span class="tm-dot sm"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg></span>'+esc(o)+'</div>').join("")+'</section>':"")+
      '</div>';
    root.querySelector(".tm-x").onclick=close;
    root.querySelectorAll("[data-lesson]").forEach(b=>b.onclick=()=>{const l=all.find(x=>x.id===b.dataset.lesson);if(l)lesson(l)});
    const nx=s.done?root.querySelector(".tm-node.next"):null;if(nx)setTimeout(()=>nx.scrollIntoView({block:"center",behavior:reduced()?"auto":"smooth"}),120);
  }

  /* ---------- A lesson ---------- */
  function lesson(l){
    const steps=l.steps,asks=steps.filter(s=>s.t!=="learn").length;
    let i=0,first=0;
    const frame=()=>{
      root.innerHTML='<header class="tm-bar tm-lbar"><button type="button" class="tm-x" aria-label="Leave lesson">×</button><span class="tm-prog" aria-hidden="true"><i></i></span></header>'+
        '<div class="tm-scroll tm-step" aria-live="polite"></div><footer class="tm-foot"><div class="tm-fb" hidden></div><button type="button" class="primary tm-go" disabled>Check</button></footer>';
      root.querySelector(".tm-x").onclick=()=>{path()};
    };
    frame();
    const stepEl=()=>root.querySelector(".tm-step"),go=()=>root.querySelector(".tm-go"),fb=()=>root.querySelector(".tm-fb");
    const progress=()=>{root.querySelector(".tm-prog i").style.width=Math.round(i/steps.length*100)+"%"};
    const feedback=(ok,why,btn,run)=>{
      const f=fb();f.hidden=false;f.className="tm-fb "+(ok?"ok":"no");
      f.innerHTML='<div class="tm-fb-top">'+EVIA.replace("tm-evia","tm-evia sm")+'<strong>'+(ok?["Nice one!","Spot on!","That’s it!","Great!"][Math.floor(Math.random()*4)]:"Not quite")+'</strong></div>'+(why?'<p>'+esc(why)+'</p>':"");
      const g=go();g.disabled=false;g.textContent=btn;g.onclick=run;
      root.classList.toggle("tm-happy",ok);root.classList.toggle("tm-oops",!ok);buzz(ok?12:[20,40,20]);
    };
    const clearFb=()=>{const f=fb();f.hidden=true;root.classList.remove("tm-happy","tm-oops")};
    const next=()=>{i++;show()};
    function show(){
      clearFb();progress();
      if(i>=steps.length){done();return}
      const s=steps[i],el=stepEl(),g=go();el.scrollTop=0;
      let tries=0;
      const retryOrNext=(ok,why)=>{if(ok){if(!tries)first++;feedback(true,why,"Continue",next)}else{tries++;feedback(false,why,"Try again",()=>{clearFb();reset()})}};
      let reset=()=>{};
      if(s.t==="learn"){
        el.innerHTML='<div class="tm-card"><span class="tm-kicker">Evia explains</span><h2>'+esc(s.title)+'</h2>'+pic(s.pic)+'<p>'+esc(s.text)+'</p></div>';
        g.disabled=false;g.textContent="Continue";g.onclick=next;return;
      }
      if(s.t==="choice"||s.t==="tf"){
        const opts=s.t==="tf"?["True","False"]:s.opts,ans=s.t==="tf"?(s.a?0:1):s.a;
        el.innerHTML='<h2 class="tm-q">'+esc(s.q)+'</h2><div class="tm-opts'+(s.pics?" pics":"")+(s.t==="tf"?" tf":"")+'">'+opts.map((o,k)=>'<button type="button" class="tm-opt" data-k="'+k+'">'+(typeof o==="object"?pic(o.pic)+'<span>'+esc(o.text)+'</span>':'<span>'+esc(o)+'</span>')+'</button>').join("")+'</div>';
        let picked=null;
        reset=()=>{picked=null;el.querySelectorAll(".tm-opt").forEach(b=>{b.classList.remove("on","wrong");b.disabled=false});g.disabled=true;g.textContent="Check";g.onclick=check};
        const check=()=>{const ok=picked===ans;const b=el.querySelector('[data-k="'+picked+'"]');b.classList.add(ok?"right":"wrong");if(ok)el.querySelectorAll(".tm-opt").forEach(x=>x.disabled=true);retryOrNext(ok,s.why)};
        el.querySelectorAll(".tm-opt").forEach(b=>b.onclick=()=>{if(b.disabled)return;picked=+b.dataset.k;el.querySelectorAll(".tm-opt").forEach(x=>x.classList.toggle("on",x===b));g.disabled=false});
        reset();return;
      }
      if(s.t==="order"){
        const shuffled=s.items.map((t,k)=>({t,k})).sort(()=>Math.random()-.5);
        if(shuffled.every((x,k)=>x.k===k))shuffled.reverse();
        let placed=[];
        const paint=()=>{
          el.innerHTML='<h2 class="tm-q">'+esc(s.q)+'</h2><ol class="tm-slots">'+s.items.map((_,k)=>'<li class="tm-slot'+(placed[k]?" filled":"")+'">'+(placed[k]?'<button type="button" class="tm-chip in" data-out="'+k+'"><b>'+(k+1)+'</b>'+esc(placed[k].t)+'</button>':'<span>'+(k+1)+'</span>')+'</li>').join("")+'</ol>'+
            '<div class="tm-pool">'+shuffled.filter(x=>!placed.includes(x)).map(x=>'<button type="button" class="tm-chip" data-in="'+x.k+'">'+esc(x.t)+'</button>').join("")+'</div>';
          el.querySelectorAll("[data-in]").forEach(b=>b.onclick=()=>{placed.push(shuffled.find(x=>x.k===+b.dataset.in));buzz(6);paint()});
          el.querySelectorAll("[data-out]").forEach(b=>b.onclick=()=>{placed.splice(+b.dataset.out,1);paint()});
          g.disabled=placed.length<s.items.length;g.textContent="Check";g.onclick=check;
        };
        const check=()=>{const ok=placed.every((x,k)=>x.k===k);
          el.querySelectorAll(".tm-slot").forEach((li,k)=>li.classList.add(placed[k].k===k?"right":"wrong"));
          retryOrNext(ok,ok?s.why:"The ones in orange are in the wrong place. Have another go.")};
        reset=()=>{placed=placed.filter((x,k)=>x.k===k&&placed.slice(0,k).every((y,j)=>y.k===j));paint()};
        paint();return;
      }
      if(s.t==="match"){
        const left=s.pairs.map((p,k)=>({t:p[0],k})).sort(()=>Math.random()-.5),right=s.pairs.map((p,k)=>({t:p[1],k})).sort(()=>Math.random()-.5);
        const got=new Set();let sel=null,misses=0;
        el.innerHTML='<h2 class="tm-q">'+esc(s.q)+'</h2><div class="tm-match"><div>'+left.map(x=>'<button type="button" class="tm-m" data-side="l" data-k="'+x.k+'">'+esc(x.t)+'</button>').join("")+'</div><div>'+right.map(x=>'<button type="button" class="tm-m" data-side="r" data-k="'+x.k+'">'+esc(x.t)+'</button>').join("")+'</div></div>';
        g.disabled=true;g.textContent="Match them all";
        el.querySelectorAll(".tm-m").forEach(b=>b.onclick=()=>{
          if(b.classList.contains("got"))return;
          if(!sel||sel.dataset.side===b.dataset.side){el.querySelectorAll(".tm-m.on").forEach(x=>x.classList.remove("on"));sel=b;b.classList.add("on");return}
          const a=sel;sel=null;a.classList.remove("on");
          if(a.dataset.k===b.dataset.k){[a,b].forEach(x=>{x.classList.add("got");x.disabled=true});got.add(b.dataset.k);buzz(8);
            if(got.size===s.pairs.length){if(!misses)first++;feedback(true,misses?"All matched. You got there!":"All matched first time.","Continue",next)}}
          else{misses++;[a,b].forEach(x=>{x.classList.add("wrong");setTimeout(()=>x.classList.remove("wrong"),450)});buzz([15,30,15])}
        });
        return;
      }
    }
    function done(){
      const score=asks?first/asks:1;saveResult(l.id,score);
      const all=[].concat(...units().map(u=>u.lessons)),idx=all.findIndex(x=>x.id===l.id),nx=all[idx+1];
      const u=units().find(x=>x.lessons.includes(l)),view=u?viewFor(u.skill):null;
      root.classList.add("tm-happy");
      root.innerHTML='<div class="tm-scroll tm-end"><div class="tm-confetti" aria-hidden="true">'+Array.from({length:18},(_,k)=>'<i style="--k:'+k+'"></i>').join("")+'</div>'+
        EVIA.replace("tm-evia","tm-evia xl")+'<h2>Lesson complete!</h2><p class="tm-end-sub">'+esc(l.title)+'</p>'+
        '<div class="tm-stats"><div><b>'+first+'/'+asks+'</b><span>right first time</span></div><div><b>'+Math.round(score*100)+'%</b><span>score</span></div></div>'+
        (view?'<p class="tm-view">From your lessons'+(view.soFar?" so far":"")+', Evia rates your <strong>'+esc(u.skill.toLowerCase())+'</strong> as <strong>'+esc(view.label)+'</strong>. You’ll see this next to your own rating in the confidence check.</p>':"")+
        '</div><footer class="tm-foot">'+(nx?'<button type="button" class="primary tm-go" id="tm-next">Next lesson</button>':"")+'<button type="button" class="'+(nx?"secondary":"primary")+' tm-go" id="tm-path">Back to the path</button></footer>';
      const n=root.querySelector("#tm-next");if(n)n.onclick=()=>{root.classList.remove("tm-happy");lesson(nx)};
      root.querySelector("#tm-path").onclick=()=>{root.classList.remove("tm-happy");path()};
      buzz([10,40,10,40,30]);
    }
    show();
  }

  window.eviaTeach={open,available,summary,viewFor,COURSES};
})();
