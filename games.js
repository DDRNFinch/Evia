/* Evia7 mini games: short games that teach without feeling like lessons. Unlocked in Rewards, played from Teach me.
     Brickle         guess the trade word in six tries (like Wordle); the word's meaning is shown at the end, and as a
                     clue after four tries.
     Hazard spotter  tap the hazards in a site or workshop picture before time runs out; each one says why.
     Flappy Evia     fly Evia through the scaffold; every few gaps a safety gate asks a true-or-false question.
   Games pay a few coins each (rewards.js caps game coins at 20 a day).
   window.eviaGames: {GAMES, open(key), iconFor(key)} */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(_){}};
  const R=()=>window.eviaRewards;
  const coinSvg=()=>R()&&R().coin?R().coin():"";
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const group=()=>{const c=typeof course!=="undefined"?course:"";return c==="joiner"?"bench":c==="site"?"site":"brick"};

  const ICONS={
    brickle:'<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="5.5" height="6" rx="1.2"/><rect x="9.25" y="5" width="5.5" height="6" rx="1.2"/><rect x="16" y="5" width="5.5" height="6" rx="1.2"/><rect x="2.5" y="13" width="5.5" height="6" rx="1.2"/><rect x="9.25" y="13" width="5.5" height="6" rx="1.2"/><rect x="16" y="13" width="5.5" height="6" rx="1.2"/></svg>',
    hazard:'<svg viewBox="0 0 24 24"><path d="M12 3.5 21.5 20h-19Z"/><path d="M12 10v4.5M12 17.2v.1"/></svg>',
    flappy:'<svg viewBox="0 0 24 24"><circle cx="13" cy="12" r="7"/><path d="M11 11v1.5M15 11v1.5M2.5 9h3M2 12.5h3.5M2.5 16h3"/></svg>'
  };
  const GAMES=[
    {id:"game-brickle",key:"brickle",label:"Brickle",rarity:"common",about:"Guess the trade word in six tries."},
    {id:"game-hazard",key:"hazard",label:"Hazard spotter",rarity:"common",about:"Find the hazards before time runs out."},
    {id:"game-flappy",key:"flappy",label:"Flappy Evia",rarity:"rare",about:"Fly through the scaffold and pass the safety gates."}
  ];

  /* ---------- The game screen ---------- */
  let cur=null;
  function shell(g){
    if(cur)cur.close();
    const o=document.createElement("div");o.className="gm gm-"+g.key;o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label",g.label);
    o.innerHTML='<header class="gm-bar"><button type="button" class="gm-x" aria-label="Close">×</button><strong>'+esc(g.label)+'</strong><span class="gm-coins" title="Game coins today">'+coinSvg()+'<b></b></span></header><div class="gm-body"></div>';
    document.body.appendChild(o);document.documentElement.classList.add("gm-open");
    const ctx={o,g,body:o.querySelector(".gm-body"),stops:[],
      coins(){const b=o.querySelector(".gm-coins b"),rm=R()&&R().gameRoom?R().gameRoom():0;b.textContent=(R()?R().GAME_DAILY:20)-rm+"/"+(R()?R().GAME_DAILY:20);o.querySelector(".gm-coins").setAttribute("aria-label","Game coins today: "+b.textContent)},
      close(){ctx.stops.forEach(f=>{try{f()}catch(_){}});o.remove();document.removeEventListener("keydown",esc2);if(cur===ctx)cur=null;if(!document.querySelector(".gm"))document.documentElement.classList.remove("gm-open");if(typeof screen!=="undefined"&&screen==="teach"&&window.render)window.render()}};
    const esc2=e=>{if(e.key==="Escape")ctx.close()};document.addEventListener("keydown",esc2);
    o.querySelector(".gm-x").onclick=()=>ctx.close();ctx.coins();cur=ctx;return ctx;
  }
  /* The end of a round: coins (within today's cap), a summary, then play again or done. */
  function finish(ctx,o){
    const got=o.coins>0&&R()&&R().gameCoins?R().gameCoins(o.coins):0;ctx.coins();
    const card=document.createElement("div");card.className="gm-end";
    card.innerHTML='<div class="gm-end-card"><h2>'+esc(o.title)+'</h2>'+(o.sub?'<p class="gm-end-sub">'+o.sub+'</p>':"")+
      '<div class="gm-end-coins">'+coinSvg()+'<b>+'+got+'</b><span>'+(got?"coins":o.coins>0?"Today’s game coins are all collected. Play for fun!":"coins")+'</span></div>'+
      (o.html||"")+'<div class="gm-end-btns"><button type="button" class="primary" data-a="again">Play again</button><button type="button" class="secondary" data-a="done">Done</button></div></div>';
    ctx.body.appendChild(card);
    card.querySelector('[data-a="again"]').onclick=()=>{card.remove();o.again()};
    card.querySelector('[data-a="done"]').onclick=()=>ctx.close();
    if(got&&window.eviaMood)window.eviaMood("happy");
    setTimeout(()=>{const b=card.querySelector('[data-a="again"]');try{b.focus({preventScroll:true})}catch(_){}},80);
  }

  /* ---------- Brickle ---------- */
  const WORDS={
    brick:[
      ["LEVEL","A spirit level. It checks courses are level and, held upright, that walls are plumb."],
      ["PLUMB","Perfectly upright. Check it by holding the level against the wall."],
      ["GAUGE","Keeping every course the same height: 75 mm for a brick and its joint. Check it with a gauge rod."],
      ["BRICK","A standard UK brick is 215 × 102.5 × 65 mm."],
      ["BLOCK","A concrete block’s face is 440 × 215 mm: the size of six bricks."],
      ["JOINT","The mortar between bricks, usually 10 mm. Bed joints are flat; perpends are upright."],
      ["DATUM","A fixed height that everything is measured from, often marked on a peg or a wall."],
      ["ARRIS","The sharp edge where two faces of a brick meet."],
      ["QUOIN","The outside corner of a wall. Build the quoins first, then run a line between them."],
      ["CHASE","A groove cut into a wall for pipes or cables."],
      ["FLUSH","A joint finished level with the face of the bricks."],
      ["BATCH","One mix of mortar. Gauge every batch the same so the colour matches."],
      ["MIXER","A drum mixer for mortar. Keep hands and shovels out of the drum while it turns."],
      ["PIERS","Thicker columns of brickwork that stiffen a wall or carry a load."],
      ["LINES","A builder’s line pinned between the corners keeps each course straight."]
    ],
    site:[
      ["JOIST","A timber beam that carries a floor or ceiling, usually at 400 mm centres."],
      ["TRUSS","A factory-made triangle frame that holds up a roof."],
      ["RIDGE","The top line of a roof, where the two slopes meet."],
      ["EAVES","The lower edge of a roof that overhangs the wall."],
      ["TREAD","The part of a stair step you stand on."],
      ["RISER","The upright part between two stair treads."],
      ["NEWEL","The big post at the top or bottom of a staircase that holds the handrail."],
      ["PITCH","The angle of a roof or a staircase."],
      ["STILE","An upright side piece of a door or window frame."],
      ["HINGE","Doors hang on hinges. Fire doors need three."],
      ["LATCH","Holds a door shut until you turn the handle."],
      ["MITRE","A joint cut at 45° on each piece to turn a corner, like skirting on an outside corner."],
      ["STUDS","The upright timbers in a stud wall, usually at 400 or 600 mm centres."],
      ["JAMBS","The upright sides of a door frame or lining."],
      ["PLUMB","Perfectly upright. Door linings must be plumb or the door swings open or shut on its own."]
    ],
    bench:[
      ["TENON","The tongue on the end of a rail that fits into a mortice."],
      ["MITRE","A joint cut at 45° on each piece to turn a corner."],
      ["DOWEL","A round wooden pin glued into holes to join two pieces."],
      ["STILE","An upright side piece of a door or frame."],
      ["RAILS","The flat pieces of a door or frame, joined into the stiles."],
      ["PLANE","A hand plane shaves timber smooth, straight and to size."],
      ["GRAIN","The way the wood fibres run. Plane and sand with the grain."],
      ["KNOTS","Where a branch grew. Big or loose knots weaken the timber."],
      ["BEVEL","A sloping edge, or the sliding bevel you use to mark angles."],
      ["CRAMP","What joiners call a clamp. Cramps hold joints tight while the glue sets."],
      ["HINGE","Doors hang on hinges. Fire doors need three."],
      ["TREAD","The part of a stair step you stand on."],
      ["RISER","The upright part between two stair treads."],
      ["NEWEL","The big post at the top or bottom of a staircase that holds the handrail."],
      ["ARRIS","The sharp edge between two faces. Take it off with a light sand."]
    ]
  };
  const TOPIC={brick:"a bricklaying word",site:"a site carpentry word",bench:"a joinery word"};
  const dayNo=()=>{const d=new Date();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)};
  let brickleRound=0,lastWord="";
  /* Colours for a guess: right place, in the word, or not in it (repeated letters handled like Wordle). */
  function score(guess,word){
    const out=Array(5).fill("no"),left={};
    for(let i=0;i<5;i++){if(guess[i]===word[i])out[i]="hit";else left[word[i]]=(left[word[i]]||0)+1}
    for(let i=0;i<5;i++)if(out[i]!=="hit"&&left[guess[i]]){out[i]="near";left[guess[i]]--}
    return out;
  }
  function brickle(ctx){
    const list=WORDS[group()];
    /* The first game of the day is the day's word; after that, a different word each time. */
    let pair=brickleRound++===0?list[dayNo()%list.length]:pick(list.filter(w=>w[0]!==lastWord));
    lastWord=pair[0];
    const word=pair[0],rows=[],keys={};let row=0,cell="",over=false;
    const KB=["QWERTYUIOP","ASDFGHJKL","⏎ZXCVBNM⌫"];
    ctx.body.innerHTML='<div class="bk"><p class="bk-say">Guess '+TOPIC[group()]+' in six tries.</p><div class="bk-grid">'+
      Array.from({length:6},(_,r)=>'<div class="bk-row">'+Array.from({length:5},()=>'<span class="bk-t"></span>').join("")+'</div>').join("")+'</div>'+
      '<p class="bk-clue" hidden></p><p class="bk-msg" aria-live="polite"></p>'+
      '<div class="bk-kb">'+KB.map(r=>'<div>'+[...r].map(k=>'<button type="button" data-k="'+k+'" class="'+(k==="⏎"||k==="⌫"?"wide":"")+'" aria-label="'+(k==="⏎"?"Enter":k==="⌫"?"Delete":k)+'">'+(k==="⏎"?"Enter":k)+'</button>').join("")+'</div>').join("")+'</div>'+
      '<details class="bk-how"><summary>How to play</summary><p><span class="bk-t hit">A</span> right letter, right place. <span class="bk-t near">B</span> in the word, wrong place. <span class="bk-t no">C</span> not in the word.</p></details></div>';
    const $=q=>ctx.body.querySelector(q),tiles=r=>[...ctx.body.querySelectorAll(".bk-row")[r].children];
    const msg=t=>{$(".bk-msg").textContent=t};
    const paint=()=>tiles(row).forEach((t,i)=>{t.textContent=cell[i]||"";t.classList.toggle("full",!!cell[i])});
    const shake=()=>{const r=ctx.body.querySelectorAll(".bk-row")[row];r.classList.remove("shake");void r.offsetWidth;r.classList.add("shake")};
    function enter(){
      if(over)return;
      if(cell.length<5){msg("Five letters, please.");shake();return}
      const res=score(cell,word),ts=tiles(row);
      ts.forEach((t,i)=>{setTimeout(()=>{t.classList.add(res[i],"flip")},reduced()?0:i*170)});
      [...cell].forEach((ch,i)=>{const rank={no:1,near:2,hit:3},was=keys[ch];if(!was||rank[res[i]]>rank[was])keys[ch]=res[i]});
      setTimeout(()=>{ctx.body.querySelectorAll("[data-k]").forEach(b=>{const s=keys[b.dataset.k];b.className=(b.classList.contains("wide")?"wide ":"")+(s||"")})},reduced()?0:900);
      rows.push(cell);const won=cell===word;row++;cell="";msg("");
      if(won||row===6){over=true;setTimeout(()=>end(won),reduced()?200:1150);return}
      if(row===4){const c=$(".bk-clue");c.hidden=false;c.innerHTML="<strong>Clue:</strong> "+esc(pair[1].replace(new RegExp(word,"ig"),"_____"))}
    }
    function key(k){
      if(over)return;
      if(k==="⏎"||k==="ENTER")return enter();
      if(k==="⌫"||k==="BACKSPACE"){cell=cell.slice(0,-1);return paint()}
      if(/^[A-Z]$/.test(k)&&cell.length<5){cell+=k;paint();buzz(5)}
    }
    ctx.body.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>key(b.dataset.k));
    const kd=e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toUpperCase();if(k==="ENTER"||k==="BACKSPACE"||/^[A-Z]$/.test(k)){e.preventDefault();key(k)}};
    document.addEventListener("keydown",kd);ctx.stops.push(()=>document.removeEventListener("keydown",kd));
    function end(won){
      document.removeEventListener("keydown",kd);
      finish(ctx,{title:won?(rows.length<=2?"Brilliant!":rows.length<=4?"Nice one!":"Got it!"):"The word was "+word,
        sub:won?"You got <strong>"+word+"</strong> in "+rows.length+(rows.length===1?" try.":" tries."):"Here’s what it means, for next time.",
        coins:won?Math.max(2,8-rows.length):0,
        html:'<div class="gm-learn"><strong>'+word+'</strong><p>'+esc(pair[1])+'</p></div>',
        again:()=>brickle(ctx)});
    }
  }

  /* ---------- Hazard spotter ----------
     Two pictures, drawn in a 360 × 300 box. Each hazard has a tap zone (x, y, r) and says why it's a hazard. */
  const person=(x,y,o)=>{o=o||{};const hv=o.vest||"#ffb300";
    return '<g class="hz-man" transform="translate('+x+' '+y+')">'+
      '<rect x="-7" y="30" width="6" height="26" rx="2.5" fill="#26324a"/><rect x="1" y="30" width="6" height="26" rx="2.5" fill="#26324a"/>'+
      '<rect x="-8.5" y="54" width="8" height="4" rx="2" fill="#3b2f25"/><rect x="0.5" y="54" width="8" height="4" rx="2" fill="#3b2f25"/>'+
      '<rect x="-10" y="8" width="20" height="25" rx="7" fill="'+hv+'"/><path d="M-10 21h20M-10 26h20" stroke="#e8edf3" stroke-width="2"/>'+
      '<rect x="-14" y="10" width="5" height="18" rx="2.5" fill="'+hv+'"/><rect x="9" y="10" width="5" height="18" rx="2.5" fill="'+hv+'"/>'+
      '<circle cx="0" cy="0" r="8.5" fill="#f1c7a3"/>'+
      (o.hat===false?'<path d="M-8.5 -1.5c0-6 3.5-8.5 8.5-8.5s8.5 2.5 8.5 8.5c-2-3-5-4-8.5-4s-6.5 1-8.5 4Z" fill="#5a3b22"/>':
        '<path d="M-9 -2a9 9 0 0 1 18 0Z" fill="'+(o.hat||"#2f6fcf")+'"/><rect x="-11.5" y="-3" width="23" height="3" rx="1.5" fill="'+(o.hat||"#2f6fcf")+'"/>')+
      '<circle cx="-3" cy="1.5" r="1" fill="#263040"/><circle cx="3" cy="1.5" r="1" fill="#263040"/></g>'};
  const SCENES=[
    {id:"site",title:"On site",svg:()=>{
      let bricks="";for(let r=0;r<15;r++){const y=40+r*10;for(let c=-1;c<13;c++){const x=150+c*16+(r%2?8:0);bricks+='<rect x="'+x+'" y="'+y+'" width="15" height="9" rx="1"/>'}}
      return '<defs><clipPath id="hzWall"><rect x="150" y="40" width="200" height="150"/></clipPath></defs>'+
        '<rect width="360" height="300" fill="#dcefff"/><circle cx="46" cy="42" r="18" fill="#fff4c2"/>'+
        '<path d="M0 190h360v110H0Z" fill="#d8c69e"/><path d="M0 232h360v28H0Z" fill="#cbb78c"/>'+
        '<rect x="150" y="40" width="200" height="150" fill="#b8573a"/><g clip-path="url(#hzWall)" fill="#c9683f" stroke="#a24a2f" stroke-width=".6">'+bricks+'</g>'+
        '<rect x="262" y="60" width="44" height="34" fill="#9fd0ef" stroke="#eee" stroke-width="3"/><rect x="262" y="128" width="44" height="34" fill="#9fd0ef" stroke="#eee" stroke-width="3"/>'+
        /* scaffold */
        '<g stroke="#8d99a8" stroke-width="3.2" stroke-linecap="round"><path d="M152 26V192M246 26V192M340 26V192"/><path d="M150 150h192M150 86h192"/></g>'+
        '<g fill="#c99a57" stroke="#9c7338" stroke-width="1"><rect x="146" y="112" width="198" height="7" rx="1.5"/><rect x="146" y="50" width="198" height="7" rx="1.5"/></g>'+
        '<rect x="146" y="105" width="198" height="7" fill="#e0b56c" stroke="#9c7338" stroke-width=".8"/>'+
        '<g stroke="#8d99a8" stroke-width="2.6" stroke-linecap="round"><path d="M150 92h192M150 100h192"/><path d="M246 30h96M246 40h96"/></g>'+
        '<rect x="246" y="43" width="96" height="7" fill="#e0b56c" stroke="#9c7338" stroke-width=".8"/>'+
        /* bricks stacked over the end of the lift */
        '<g fill="#c9683f" stroke="#8f3f28" stroke-width=".8"><rect x="326" y="96" width="18" height="8"/><rect x="330" y="88" width="18" height="8"/><rect x="334" y="80" width="18" height="8"/><rect x="340" y="72" width="16" height="8"/></g>'+
        /* short ladder */
        '<g stroke="#b88a3e" stroke-width="3" stroke-linecap="round"><path d="M108 192 132 126M121 192 145 126"/></g><g stroke="#b88a3e" stroke-width="2.2"><path d="M112 180h13M116 168h13M121 155h13M126 142h13M130 131h13"/></g>'+
        /* mixer and cable */
        '<g><path d="M38 192l10-26h30l10 26" fill="none" stroke="#56606e" stroke-width="3"/><ellipse cx="63" cy="158" rx="26" ry="20" fill="#f28c28" stroke="#c46a12" stroke-width="2" transform="rotate(-20 63 158)"/><ellipse cx="45" cy="146" rx="8" ry="11" fill="#5b4636" transform="rotate(-20 45 146)"/><circle cx="44" cy="193" r="5" fill="#333"/><circle cx="82" cy="193" r="5" fill="#333"/></g>'+
        '<path d="M86 186c14 16 4 40 30 52s40 8 64 10 40-8 66-4" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/><rect x="244" y="239" width="12" height="9" rx="2" fill="#1f2937"/>'+
        /* skip */
        '<path d="M8 258h54l-6 32H14Z" fill="#f5c400" stroke="#b28f00" stroke-width="2"/><path d="M14 262h42" stroke="#b28f00" stroke-width="1.5"/>'+
        /* open trench, no barrier */
        '<path d="M272 262h66l-6 24h-54Z" fill="#4b3a2a"/><path d="M272 262h66" stroke="#8a6d49" stroke-width="3"/><path d="M270 258c8-6 18-7 26-3" fill="#bca678"/>'+
        person(220,205,{hat:false})+person(92,214,{hat:"#2f6fcf"});
    },hazards:[
      {x:198,y:36,r:26,label:"No guard rail on the top lift",why:"Anyone on the top lift could fall. Guard rails and toe boards are needed along every open edge."},
      {x:133,y:138,r:22,label:"The ladder is too short",why:"A ladder should stick out about 1 metre above the platform, so you have something to hold as you step off, and be tied."},
      {x:340,y:88,r:20,label:"Bricks stacked over the edge",why:"They could fall on someone below. Keep loads away from the edge, behind a brick guard."},
      {x:150,y:244,r:24,label:"Cable trailing across the walkway",why:"It’s a trip hazard and can get damaged. Run cables overhead or along the edge, or use a cable cover."},
      {x:220,y:204,r:16,label:"No hard hat",why:"Hard hats must be worn on site. Something could fall from the scaffold."},
      {x:305,y:272,r:24,label:"Open trench with no barrier",why:"People could fall in. Trenches and holes need barriers or covers, and signs."}
    ]},
    {id:"shop",title:"In the workshop",svg:()=>{
      let planks="";for(let i=0;i<7;i++)planks+='<path d="M0 '+(214+i*14)+'h360" stroke="#c4ab82" stroke-width="1"/>';
      return '<rect width="360" height="300" fill="#eceff3"/><path d="M0 200h360v100H0Z" fill="#d9c39c"/>'+planks+
        '<rect x="0" y="196" width="360" height="6" fill="#b8c0cb"/>'+
        '<rect x="120" y="28" width="92" height="56" rx="3" fill="#b9dcf2" stroke="#fff" stroke-width="4"/><path d="M166 28v56" stroke="#fff" stroke-width="3"/>'+
        /* fire exit, blocked */
        '<rect x="18" y="86" width="64" height="112" fill="#d2d8e0" stroke="#aab3bf" stroke-width="2"/><rect x="22" y="60" width="56" height="20" rx="2" fill="#16a34a"/><path d="M30 70h14m-5-5 5 5-5 5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="62" y="75" fill="#fff" font-size="10" font-weight="800" text-anchor="middle" font-family="sans-serif">EXIT</text>'+
        '<g fill="#c8965a" stroke="#8d6434" stroke-width="1.2"><rect x="16" y="160" width="36" height="38"/><rect x="50" y="170" width="36" height="28"/><rect x="26" y="130" width="32" height="30"/></g><path d="M16 172h36M50 180h36M26 142h32" stroke="#8d6434" stroke-width="1"/>'+
        /* extinguisher (fine) */
        '<rect x="96" y="160" width="12" height="30" rx="5" fill="#dc2626"/><path d="M99 160v-5h6v5M105 156h6" stroke="#333" stroke-width="2" fill="none"/>'+
        /* bench, drill with damaged cable, chisel over the edge */
        '<rect x="118" y="136" width="120" height="10" rx="2" fill="#b9854d" stroke="#8d6434"/><rect x="124" y="146" width="7" height="52" fill="#8d6434"/><rect x="225" y="146" width="7" height="52" fill="#8d6434"/>'+
        '<g><rect x="132" y="122" width="30" height="12" rx="4" fill="#0e9f9a"/><rect x="146" y="126" width="14" height="10" rx="2" fill="#0b7b77"/><rect x="118" y="126" width="16" height="4" rx="1" fill="#6b7280"/></g>'+
        '<path d="M156 136c4 10-2 20 4 30" stroke="#1f2937" stroke-width="3" fill="none"/><path d="M160 166l-4 4M160 166l3 5M160 166l0 6" stroke="#dc2626" stroke-width="1.6" stroke-linecap="round"/><path d="M158 172c-2 14 8 22 12 28" stroke="#1f2937" stroke-width="3" fill="none"/>'+
        '<g transform="rotate(-6 236 133)"><rect x="214" y="130" width="18" height="6" rx="2.5" fill="#d97706"/><rect x="232" y="131.5" width="22" height="3" fill="#9ca3af"/></g>'+
        /* table saw with no guard, sawdust and offcuts */
        '<rect x="262" y="148" width="86" height="8" rx="2" fill="#9aa3ae" stroke="#6b7280"/><rect x="270" y="156" width="70" height="42" rx="3" fill="#4b5563"/>'+
        '<path d="M281 148a15 15 0 0 1 30 0Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.2"/><path d="M283 142l-3-2M288 136l-2-3M296 134v-3M304 136l2-3M309 142l3-2" stroke="#64748b" stroke-width="1.6"/>'+
        '<ellipse cx="305" cy="274" rx="40" ry="9" fill="#e8d4a4"/><g fill="#b9854d" stroke="#8d6434" stroke-width=".8"><rect x="282" y="262" width="26" height="6" transform="rotate(12 295 265)"/><rect x="306" y="270" width="22" height="5" transform="rotate(-18 317 272)"/><rect x="292" y="276" width="18" height="5"/></g>'+
        /* sockets: extension leads plugged into each other */
        '<rect x="176" y="170" width="14" height="12" rx="2" fill="#fff" stroke="#9aa3ae"/><path d="M183 182c0 30 -20 40 -30 62" stroke="#f8fafc" stroke-width="3" fill="none"/><path d="M183 182c0 30 -20 40 -30 62" stroke="#94a3b8" stroke-width="1" fill="none"/>'+
        '<rect x="132" y="240" width="40" height="11" rx="3" fill="#f8fafc" stroke="#94a3b8"/><rect x="162" y="252" width="40" height="11" rx="3" fill="#f8fafc" stroke="#94a3b8"/><path d="M168 244c14 0 10 10 14 8" stroke="#94a3b8" stroke-width="3" fill="none"/><rect x="190" y="264" width="30" height="10" rx="3" fill="#f8fafc" stroke="#94a3b8"/><path d="M198 257c12 2 6 10 10 7" stroke="#94a3b8" stroke-width="3" fill="none"/>'+
        '<rect x="322" y="92" width="26" height="36" rx="3" fill="#fff" stroke="#16a34a" stroke-width="2"/><path d="M335 101v18M326 110h18" stroke="#16a34a" stroke-width="4"/>';
    },hazards:[
      {x:50,y:160,r:30,label:"Fire exit blocked",why:"Fire exits must be kept clear at all times, so everyone can get out fast."},
      {x:296,y:140,r:20,label:"Saw blade with no guard",why:"Always set the crown guard and riving knife before using a table saw, and use a push stick."},
      {x:160,y:170,r:16,label:"Damaged cable on the drill",why:"Bare wires can give an electric shock. Take it out of use, label it and report it."},
      {x:243,y:132,r:15,label:"Chisel hanging over the edge",why:"It could fall and cut someone. Keep chisels flat, away from the edge, in a roll or rack."},
      {x:175,y:256,r:28,label:"Extension leads plugged into each other",why:"Daisy-chaining leads can overload them and start a fire. Use one lead, fully unwound."},
      {x:305,y:272,r:26,label:"Offcuts and sawdust on the floor",why:"A slip and trip hazard, and a fire risk. Clear up as you go."}
    ]}
  ];
  let sceneN=0;
  function hazard(ctx){
    const pref=group()==="bench"?1:0,sc=SCENES[(pref+sceneN++)%SCENES.length],TIME=60;
    const found=new Set();let misses=0,left=TIME,t0=Date.now(),done=false;
    ctx.body.innerHTML='<div class="hz"><div class="hz-top"><p class="hz-say"><strong>'+esc(sc.title)+':</strong> tap the <b>'+sc.hazards.length+'</b> hazards.</p><span class="hz-count"><b>0</b>/'+sc.hazards.length+'</span></div>'+
      '<div class="hz-time"><i></i></div><div class="hz-pic"><svg viewBox="0 0 360 300" role="img" aria-label="'+esc(sc.title)+' picture">'+sc.svg()+'<g class="hz-marks"></g></svg></div>'+
      '<div class="hz-info" aria-live="polite"><p>Look carefully: some things are safe.</p></div></div>';
    const svg=ctx.body.querySelector("svg"),marks=svg.querySelector(".hz-marks"),info=ctx.body.querySelector(".hz-info"),bar=ctx.body.querySelector(".hz-time i");
    const mark=(h,i,cls)=>{marks.insertAdjacentHTML("beforeend",'<g class="hz-ring '+cls+'"><circle cx="'+h.x+'" cy="'+h.y+'" r="'+Math.max(13,h.r*.75)+'"/><text x="'+h.x+'" y="'+(h.y-h.r*.75-4)+'">'+(i+1)+'</text></g>')};
    svg.addEventListener("pointerdown",e=>{
      if(done)return;
      const m=svg.getScreenCTM();if(!m)return;const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());
      const i=sc.hazards.findIndex((h,k)=>!found.has(k)&&Math.hypot(h.x-pt.x,h.y-pt.y)<=h.r+6);
      if(i<0){
        if(sc.hazards.some((h,k)=>found.has(k)&&Math.hypot(h.x-pt.x,h.y-pt.y)<=h.r))return;
        misses++;buzz(30);marks.insertAdjacentHTML("beforeend",'<g class="hz-miss"><path d="M'+(pt.x-6)+' '+(pt.y-6)+'l12 12M'+(pt.x+6)+' '+(pt.y-6)+'l-12 12"/></g>');
        const x=marks.lastChild;setTimeout(()=>x.remove(),700);
        info.innerHTML='<p>That one’s safe. Keep looking.</p>';return;
      }
      found.add(i);buzz(12);mark(sc.hazards[i],i,"ok");
      ctx.body.querySelector(".hz-count b").textContent=found.size;
      info.innerHTML='<strong>'+esc(sc.hazards[i].label)+'</strong><p>'+esc(sc.hazards[i].why)+'</p>';
      if(found.size===sc.hazards.length)end();
    });
    const tick=()=>{if(done)return;left=Math.max(0,TIME-(Date.now()-t0)/1000);bar.style.width=(left/TIME*100)+"%";bar.classList.toggle("low",left<15);if(left<=0)end()};
    const iv=setInterval(tick,200);ctx.stops.push(()=>clearInterval(iv));
    function end(){
      if(done)return;done=true;clearInterval(iv);
      sc.hazards.forEach((h,i)=>{if(!found.has(i))mark(h,i,"missed")});
      const all=found.size===sc.hazards.length,secs=Math.round(TIME-left);
      setTimeout(()=>finish(ctx,{title:all?"All "+found.size+" found!":found.size+" of "+sc.hazards.length+" found",
        sub:all?"In "+secs+" seconds"+(misses?", with "+misses+(misses===1?" wrong tap.":" wrong taps."):", with no wrong taps."):"Time’s up. The ones you missed are circled in red.",
        coins:found.size+(all?3:0),
        html:'<ol class="gm-list">'+sc.hazards.map((h,i)=>'<li class="'+(found.has(i)?"ok":"no")+'"><strong>'+esc(h.label)+'</strong><span>'+esc(h.why)+'</span></li>').join("")+'</ol>',
        again:()=>hazard(ctx)}),all?500:900);
    }
  }

  /* ---------- Flappy Evia ---------- */
  const GATES=[
    ["Toe boards stop tools and materials falling off a scaffold platform.",true,"Toe boards run along the edge of the platform so nothing gets kicked off onto people below."],
    ["You can take a scaffold tie out if it’s in your way.",false,"Only a competent scaffolder should alter a scaffold. Removing a tie can make it collapse."],
    ["Check the scaffold tag before you go up.",true,"The tag shows it has been inspected and is safe to use. No tag, or a red tag, means don’t use it."],
    ["A ladder should lean at about 75°: 1 out for every 4 up.",true,"That’s the 1-in-4 rule. Too steep and it can tip back; too shallow and the feet can slide."],
    ["Working at height only means above 2 metres.",false,"It’s anywhere you could fall and hurt yourself, even from a step or into a hole."],
    ["It’s fine to overload a platform for a minute or two.",false,"Overloading can make boards break or the scaffold fail. Stick to the safe load, however quick the job."],
    ["A ladder should stick out about 1 metre above where you step off.",true,"It gives you a handhold as you get on and off."],
    ["Keep the scaffold platform clear of offcuts and loose bricks.",true,"Clutter causes trips, and things can fall onto people below."],
    ["A missing guard rail is OK if you’re careful.",false,"Guard rails must be in place along every open edge. Don’t work there until it’s fixed."],
    ["Report damaged scaffold boards straight away.",true,"Split or rotten boards can snap. Report them and don’t use that bay."],
    ["You should wear a harness on a normal tube scaffold with guard rails.",false,"Guard rails and toe boards are the protection there. Harnesses are for other jobs, like MEWPs, when you’ve been trained."],
    ["Never climb the outside of a scaffold: use the ladder or stairs.",true,"Climbing the frame can pull it over, and you could slip. Use the access provided."]
  ];
  function flappy(ctx){
    ctx.body.innerHTML='<div class="fl"><canvas aria-label="Flappy Evia game"></canvas><div class="fl-hud"><b class="fl-score">0</b><span class="fl-shield" hidden>Shield</span></div>'+
      '<div class="fl-tip"><strong>Tap to flap</strong><span>Fly through the gaps in the scaffold. Every fifth gap is a safety gate: get it right for a shield and bonus points.</span></div><div class="fl-q" hidden></div></div>';
    const wrap=ctx.body.querySelector(".fl"),cv=wrap.querySelector("canvas"),g=cv.getContext("2d"),tip=wrap.querySelector(".fl-tip"),qEl=wrap.querySelector(".fl-q");
    const accent=getComputedStyle(document.documentElement).getPropertyValue("--yellow").trim()||"#f5c400";
    let W=0,H=0,dpr=1;
    const size=()=>{const r=wrap.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+"px";cv.style.height=H+"px"};
    size();const ro=new ResizeObserver(size);ro.observe(wrap);ctx.stops.push(()=>ro.disconnect());
    const GROUND=40,R=15;
    let s,raf=0,last=0,state="ready",asked=[];
    const reset=()=>{s={y:H*.42,v:0,x:W*.28,pipes:[],made:0,t:0,score:0,dist:0,passed:0,shield:false,flash:0,gates:0,right:0,bg:0}};
    reset();
    const gap=()=>Math.max(128,168-s.passed*2),speed=()=>Math.min(3.2,2.2+s.passed*.04);
    const addPipe=x=>{const gp=gap(),top=60+Math.random()*(H-GROUND-gp-120);s.pipes.push({x,top,gp,gate:++s.made%5===0,done:false})};
    function flap(){
      if(state==="q"||state==="over")return;
      if(state==="ready"){state="play";tip.hidden=true;addPipe(W+40)}
      s.v=-6.2;buzz(6);
    }
    const down=e=>{if(e.target.closest&&e.target.closest(".fl-q,.gm-end"))return;e.preventDefault();flap()};
    cv.addEventListener("pointerdown",down);tip.addEventListener("pointerdown",down);
    const kd=e=>{if(e.code==="Space"||e.key===" "||e.key==="ArrowUp"){if(document.querySelector(".gm-end"))return;e.preventDefault();flap()}};
    document.addEventListener("keydown",kd);ctx.stops.push(()=>{document.removeEventListener("keydown",kd);cancelAnimationFrame(raf)});

    function ask(){
      state="q";const pool=GATES.filter(q=>!asked.includes(q[0]));const q=pick(pool.length?pool:GATES);asked.push(q[0]);s.gates++;
      qEl.hidden=false;qEl.innerHTML='<div class="fl-q-card"><span class="fl-q-tag">Safety gate</span><p>'+esc(q[0])+'</p><div class="fl-q-btns"><button type="button" data-a="1">True</button><button type="button" data-a="0">False</button></div></div>';
      qEl.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{
        const ok=(b.dataset.a==="1")===q[1];if(ok){s.right++;s.score+=3;s.shield=true}
        qEl.innerHTML='<div class="fl-q-card '+(ok?"ok":"no")+'"><span class="fl-q-tag">'+(ok?"Right! +3 and a shield":"Not quite")+'</span><p><strong>'+(q[1]?"True.":"False.")+'</strong> '+esc(q[2])+'</p><div class="fl-q-btns"><button type="button" class="go">Keep flying</button></div></div>';
        const go=qEl.querySelector(".go");try{go.focus({preventScroll:true})}catch(_){}
        go.onclick=()=>{qEl.hidden=true;state="play";s.v=-4;last=performance.now()};
      });
    }
    function hit(){
      if(s.shield){s.shield=false;s.flash=40;s.v=-5;return false}
      state="over";buzz([30,40,30]);
      const best=Math.max(s.score,Number(localStorage.getItem("evia7-flappy-best")||0));try{localStorage.setItem("evia7-flappy-best",best)}catch(_){}
      setTimeout(()=>finish(ctx,{title:"Score: "+s.score,sub:(s.score>=best&&s.score?"A new best!":"Best: "+best)+(s.gates?" · Safety gates: "+s.right+" of "+s.gates:""),
        coins:Math.min(10,Math.floor(s.score/3)),again:()=>flappy(ctx)}),500);
      return true;
    }
    /* Drawing: sky, buildings and a crane far away, scaffold towers, the ground, and Evia. */
    function draw(){
      g.setTransform(dpr,0,0,dpr,0,0);
      const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#bfe3ff");sky.addColorStop(1,"#eef8ff");g.fillStyle=sky;g.fillRect(0,0,W,H);
      const off=(s.bg*.3)%240;g.fillStyle="#d3e3f0";
      for(let x=-off;x<W+240;x+=240){g.fillRect(x+10,H-GROUND-110,50,110);g.fillRect(x+70,H-GROUND-70,40,70);g.fillRect(x+150,H-GROUND-140,44,140);
        g.strokeStyle="#c3d6e6";g.lineWidth=3;g.beginPath();g.moveTo(x+200,H-GROUND);g.lineTo(x+200,H-GROUND-190);g.lineTo(x+280,H-GROUND-190);g.moveTo(x+170,H-GROUND-190);g.lineTo(x+200,H-GROUND-190);g.stroke()}
      for(const p of s.pipes){
        const tw=46;
        const tower=(y1,y2,end)=>{g.fillStyle="#8d99a8";g.fillRect(p.x,y1,5,y2-y1);g.fillRect(p.x+tw-5,y1,5,y2-y1);
          g.strokeStyle="#9fabb9";g.lineWidth=3;for(let y=y1+16;y<y2-4;y+=26){g.beginPath();g.moveTo(p.x,y);g.lineTo(p.x+tw,y);g.stroke()}
          g.lineWidth=2;g.strokeStyle="#b3bdc9";for(let y=y1+16;y<y2-26;y+=26){g.beginPath();g.moveTo(p.x+4,y);g.lineTo(p.x+tw-4,y+26);g.stroke()}
          g.fillStyle="#c99a57";g.fillRect(p.x-6,end-4,tw+12,8);g.fillStyle="#9c7338";g.fillRect(p.x-6,end+3,tw+12,2)};
        tower(-10,p.top,p.top);tower(p.top+p.gp,H-GROUND,p.top+p.gp);
        if(p.gate&&!p.done){g.fillStyle="rgba(22,163,74,.16)";g.fillRect(p.x,p.top+4,tw,p.gp-8);g.fillStyle="#16a34a";g.beginPath();g.roundRect?g.roundRect(p.x-8,p.top+p.gp/2-11,tw+16,22,6):g.rect(p.x-8,p.top+p.gp/2-11,tw+16,22);g.fill();
          g.fillStyle="#fff";g.font="700 11px system-ui,sans-serif";g.textAlign="center";g.fillText("GATE",p.x+tw/2,p.top+p.gp/2+4)}
      }
      g.fillStyle="#cbb78c";g.fillRect(0,H-GROUND,W,GROUND);g.fillStyle="#b69f70";const go=s.dist%24;for(let x=-go;x<W;x+=24)g.fillRect(x,H-GROUND,12,4);
      /* Evia */
      g.save();g.translate(s.x,s.y);g.rotate(Math.max(-.4,Math.min(.9,s.v*.07)));
      if(s.shield||s.flash%8>3){g.strokeStyle="rgba(59,130,246,.55)";g.lineWidth=4;g.beginPath();g.arc(0,0,R+7,0,Math.PI*2);g.stroke()}
      g.fillStyle="#fff";g.strokeStyle=accent;g.lineWidth=4;g.beginPath();g.arc(0,0,R,0,Math.PI*2);g.fill();g.stroke();
      g.strokeStyle=accent;g.lineWidth=2.6;g.lineCap="round";g.beginPath();g.moveTo(-4.5,-4);g.lineTo(-4.5,2);g.moveTo(4.5,-4);g.lineTo(4.5,2);g.stroke();
      g.fillStyle="#2f6fcf";g.beginPath();g.arc(0,-R+3,R*.78,Math.PI,0);g.fill();g.fillRect(-R-2,-R+2,2*R+4,3.5);
      g.restore();
    }
    function step(now){
      raf=requestAnimationFrame(step);
      if(document.hidden){last=now;return}
      const dt=Math.min(2,(now-(last||now))/16.67);last=now;
      if(state==="ready"){s.t+=dt;s.y=H*.42+Math.sin(s.t*.08)*6;s.bg+=dt*speed();s.dist+=dt*speed();draw();return}
      if(state==="q"){draw();return}
      if(state==="over"){if(s.y<H-GROUND-R){s.v+=.5*dt;s.y=Math.min(H-GROUND-R,s.y+s.v*dt)}draw();return}
      const sp=speed()*dt;s.v=Math.min(9,s.v+.36*dt);s.y+=s.v*dt;s.bg+=sp;s.dist+=sp;if(s.flash>0)s.flash-=dt;
      for(const p of s.pipes)p.x-=sp;
      if(s.pipes.length&&s.pipes[s.pipes.length-1].x<W-210)addPipe(W+20);
      s.pipes=s.pipes.filter(p=>p.x>-70);
      for(const p of s.pipes){
        if(!p.done&&p.x+46<s.x-R){p.done=true;s.passed++;s.score++;wrap.querySelector(".fl-score").textContent=s.score;if(p.gate){ask();break}}
        if(s.flash<=0&&s.x+R-3>p.x&&s.x-R+3<p.x+46&&(s.y-R+3<p.top+4||s.y+R-3>p.top+p.gp-4)){if(hit())break;}
      }
      if(s.y>H-GROUND-R){s.y=H-GROUND-R;if(state==="play"&&!hit())s.v=-6}
      if(s.y<R){s.y=R;s.v=0}
      wrap.querySelector(".fl-shield").hidden=!s.shield;
      draw();
    }
    raf=requestAnimationFrame(step);
  }

  const RUN={brickle,hazard,flappy};
  function open(key){const g=GAMES.find(x=>x.key===key);if(!g||!RUN[key])return;const ctx=shell(g);RUN[key](ctx)}
  window.eviaGames={GAMES,open,group,iconFor:k=>ICONS[k]||"",WORDS,SCENES,GATES,score};
})();
