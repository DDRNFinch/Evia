/* Evia7 Rewards: tokens, the collection, the loot box and Evia's kit.
   Coins (called tokens in the code): real work (evidence, off-the-job hours, reviews, targets), Teach me (up to 60 a
   day) and achievements. See "Coins" below.
   Items have a rarity (common, rare, epic, legendary). Three shapes and three colours are free; everything else is
   bought with tokens (common to epic) or won in a loot box (legendary only comes from boxes).
   Loot boxes cost tokens only, show their odds, refund tokens for a duplicate, and guarantee an epic or better
   after 9 boxes without one.
   Store "evia7-rewards": {bank, spent, lastXp, day, dayEarned, owned[], hat, expr, pity, seenAch[]}.
   window.eviaRewards: page(), locked(kind,name), openItem(id), hatHtml(shape,hat), wearOn(), sync(), balance(). */
(function(){
  const KEY="evia7-rewards",DAILY=60,ACH_TOKENS=25,BOX=60;
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const blank=()=>({bank:0,spent:0,owned:[],hat:"",pity:0,seenAch:[]});
  /* Hazard spotter was swapped for the Crossword: anyone who had it gets the Crossword. */
  const migrate=r=>{const i=r.owned.indexOf("game-hazard");if(i>=0){r.owned.splice(i,1);if(!r.owned.includes("game-crossword"))r.owned.push("game-crossword")}return r};
  const read=()=>{try{return migrate(Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||"{}")||{}))}catch(_){return blank()}};
  const write=r=>{try{localStorage.setItem(KEY,JSON.stringify(r))}catch(_){}};
  const today=()=>{const d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};

  /* ---------- The catalogue ---------- */
  const RARITY={common:{label:"Common",price:30,refund:10,odds:55},rare:{label:"Rare",price:80,refund:25,odds:30},epic:{label:"Epic",price:180,refund:60,odds:12},legendary:{label:"Legendary",price:0,refund:150,odds:3}};
  const ORDER=["common","rare","epic","legendary"];
  const HATS={
    "hat-blue":{label:"Blue hard hat",rarity:"common",about:"The colour site operatives wear."},
    "hat-silver":{label:"Silver hard hat",rarity:"rare",about:"A trophy hat for a hard worker."},
    "hat-gold":{label:"Gold hard hat",rarity:"epic",about:"For the very best on site."},
    "hat-glow":{label:"Glowing hard hat",rarity:"legendary",about:"Legendary. Only from a loot box."}
  };
  /* PPE, one per slot, worn with any hard hat. */
  const PPE={
    "ppe-specs":{slot:"eyes",label:"Safety specs",rarity:"common",about:"Clear safety glasses for cutting and drilling."},
    "ppe-goggles":{slot:"eyes",label:"Safety goggles",rarity:"rare",about:"Sealed goggles for dust and splashes."},
    "ppe-ears":{slot:"ears",label:"Ear defenders",rarity:"rare",about:"For the noisy jobs, like breakers and saws."},
    "ppe-ears-gold":{slot:"ears",label:"Gold ear defenders",rarity:"epic",about:"Top-spec hearing protection."},
    "ppe-hivis":{slot:"body",label:"Hi-vis vest",rarity:"common",about:"Be seen on site, every day."},
    "ppe-hivis-glow":{slot:"body",label:"Glowing hi-vis",rarity:"legendary",about:"Legendary. Only from a loot box."}
  };
  const SHAPE_R={oval:"common",splat:"rare",hex:"rare",gear:"epic",shield:"epic","particle-aqua":"legendary","particle-violet":"legendary","particle-ember":"legendary","glass-aqua":"legendary","glass-violet":"legendary","glass-ember":"legendary"};
  /* Expressions: Evia's resting look. Her moods (happy when you save something, sleepy when idle) still take over
     for a moment. "classic" is the free default. */
  const EXPR={
    wink:{label:"Wink",rarity:"common",about:"A cheeky wink."},
    surprised:{label:"Surprised",rarity:"common",about:"Wide-eyed and amazed."},
    happy:{label:"Happy",rarity:"rare",about:"Always smiling."},
    sleepy:{label:"Sleepy",rarity:"rare",about:"Early start on site."},
    focused:{label:"Focused",rarity:"epic",about:"Locked in and ready to learn."},
    stars:{label:"Star eyes",rarity:"epic",about:"Star struck."},
    hearts:{label:"Heart eyes",rarity:"legendary",about:"Legendary. Only from a loot box."}
  };
  const COLOUR_R={orange:"common",purple:"rare",pink:"rare",red:"rare",teal:"epic",midnight:"epic"};
  function catalogue(){
    const out=[],S=window.eviaShapes||{},T=window.eviaThemes||{};
    Object.keys(HATS).forEach(id=>out.push(Object.assign({id,kind:"hat",slot:"hat"},HATS[id])));
    Object.keys(PPE).forEach(id=>out.push(Object.assign({id,kind:"hat"},PPE[id])));
    Object.keys(EXPR).forEach(k=>out.push({id:"expr-"+k,kind:"expr",key:k,label:EXPR[k].label,rarity:EXPR[k].rarity,about:EXPR[k].about}));
    Object.keys(SHAPE_R).forEach(k=>S[k]&&out.push({id:"shape-"+k,kind:"shape",key:k,label:S[k].label+" Evia",rarity:SHAPE_R[k],about:S[k].orb?(S[k].orb.style==="glass"?"An advanced Evia: a glass orb whose light moves when she talks.":"An advanced Evia: a living sphere of light."):"A new shape for Evia."}));
    ((window.eviaGames&&window.eviaGames.GAMES)||[]).forEach(g=>out.push({id:g.id,kind:"game",key:g.key,label:g.label,rarity:g.rarity,about:g.about}));
    Object.keys(COLOUR_R).forEach(k=>T[k]&&out.push({id:"colour-"+k,kind:"colour",key:k,label:T[k].label,rarity:COLOUR_R[k],about:"Evia and the app in "+T[k].label.toLowerCase()+"."}));
    return out;
  }
  const item=id=>catalogue().find(x=>x.id===id);
  const owns=id=>read().owned.includes(id);
  /* Theme.js asks this: is a shape or colour locked, and if so, what rarity? */
  function locked(kind,name){
    const F=window.eviaFree||{themes:[],shapes:[]};
    if(kind==="shape"){if(F.shapes.includes(name)||owns("shape-"+name))return false;return SHAPE_R[name]||false}
    if(F.themes.includes(name)||owns("colour-"+name))return false;return COLOUR_R[name]||false;
  }

  /* ---------- Coins ----------
     Real work pays the most: unit evidence by strength (an upgrade pays the difference), off-the-job hours (5 an hour,
     up to 40 a week), each progress review done on time, and each target met. Teach me pays 1 for every 10 XP, up to
     60 a day. Every payment is remembered, so nothing is paid twice. */
  const EV_PAY={weak:10,good:30,strong:60},OTJ_HOUR=5,OTJ_WEEK=40,REVIEW_PAY=50,TARGET_PAY=20,BACKFILL=300;
  const xp=()=>window.eviaTeach&&window.eviaTeach.stats?window.eviaTeach.stats().xp:0;
  const achievements=()=>{try{const S=window.eviaStats.compute();return window.eviaStats.achievements(S).list.filter(a=>a.earned).map(a=>a.id)}catch(_){return []}};
  const weekOf=t=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
  const readJ=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||"null")||f}catch(_){return f}};
  /* What real work has earned so far: [{key, coins, why}] with each key's full value (paid ones are skipped later). */
  function work(){
    const out=[],c=typeof course!=="undefined"?course:"";
    const ev=typeof evidence!=="undefined"?evidence:[],S=window.eviaStrength;
    if(S)[...new Set(ev.filter(e=>e.c===c&&e.u).map(e=>e.u))].forEach(u=>{const lv=S.unit(u);if(lv)out.push({key:"ev|"+c+"|"+u,coins:EV_PAY[lv],why:lv.charAt(0).toUpperCase()+lv.slice(1)+" evidence: "+u})});
    const hs=typeof hours!=="undefined"?hours:[],wk={};
    hs.forEach(h=>{const t=Number(h.createdAt)||Date.parse(h.savedAt||"");if(!t)return;const w=weekOf(t);wk[w]=(wk[w]||0)+Number(h.n||0)});
    Object.keys(wk).forEach(w=>{const n=Math.min(OTJ_WEEK,Math.floor(wk[w]*OTJ_HOUR));if(n)out.push({key:"otj|"+w,coins:n,why:"Off-the-job hours"})});
    /* Reviews are due 3 months after the last one (or the course start); up to a week late still counts. */
    const p=readJ("evia7-profile",{});let from=p.start?new Date(p.start+"T12:00:00"):null;
    readJ("evia7-progress-reviews",[]).filter(x=>x&&x.course===c&&x.date).sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(x=>{
      const d=new Date(x.date);let ok=true;if(from&&!isNaN(from)){const due=new Date(from);due.setMonth(due.getMonth()+3);ok=d<=new Date(+due+7*864e5)}
      if(ok)out.push({key:"rev|"+(x.id||x.date),coins:REVIEW_PAY,why:"Progress review on time"});from=d;
    });
    try{(window.eviaTargets?window.eviaTargets.mine():[]).filter(t=>t&&t.done).forEach(t=>out.push({key:"tg|"+t.id,coins:TARGET_PAY,why:"Target met: "+t.title}))}catch(_){}
    return out;
  }
  function sync(){
    const r=read(),x=xp(),d=today(),gained=[];
    if(r.day!==d){r.day=d;r.dayEarned=0}
    /* The first time: tokens for what they've already done (up to 200), and keep anything already chosen. */
    if(r.lastXp==null){
      r.bank+=Math.min(200,Math.floor(x/10));r.lastXp=x;
      const F=window.eviaFree||{themes:[],shapes:[]},sh=window.eviaCurrentShape&&window.eviaCurrentShape(),th=window.eviaCurrentTheme&&window.eviaCurrentTheme();
      if(sh&&SHAPE_R[sh]&&!r.owned.includes("shape-"+sh))r.owned.push("shape-"+sh);
      if(th&&COLOUR_R[th]&&!r.owned.includes("colour-"+th))r.owned.push("colour-"+th);
    }else if(x>r.lastXp){
      const t=Math.min(Math.floor((x-r.lastXp)/10),Math.max(0,DAILY-(r.dayEarned||0)));
      r.bank+=t;r.dayEarned=(r.dayEarned||0)+t;r.lastXp=x-((x-r.lastXp)%10);
    }else if(x<r.lastXp)r.lastXp=x;
    const got=achievements().filter(id=>!r.seenAch.includes(id));
    got.forEach(id=>{r.seenAch.push(id);r.bank+=ACH_TOKENS});
    /* Real work. The first time this runs, work already done pays out too (up to 300 in all). */
    r.paid=r.paid||{};const first=!r.workV;let back=BACKFILL;
    work().forEach(w=>{const due=w.coins-(r.paid[w.key]||0);if(due<=0)return;
      const n=first?Math.min(due,back):due;if(first)back-=n;
      r.paid[w.key]=first?w.coins:(r.paid[w.key]||0)+due;if(n>0){r.bank+=n;if(!first)gained.push({n,why:w.why})}});
    r.workV=1;
    write(r);badge();if(gained.length){toast(gained);if(isOpen())setTimeout(page,0)}return r;
  }
  /* Mini games pay a few coins each, up to GAME_DAILY a day. */
  const GAME_DAILY=20;
  const gameRoom=()=>{const r=read();return r.gDay===today()?Math.max(0,GAME_DAILY-(r.gEarned||0)):GAME_DAILY};
  function gameCoins(n){
    const r=read(),d=today();if(r.gDay!==d){r.gDay=d;r.gEarned=0}
    const got=Math.max(0,Math.min(Math.floor(n)||0,GAME_DAILY-r.gEarned));r.gEarned+=got;r.bank+=got;write(r);badge();return got;
  }
  /* Room left today for Teach me coins. */
  const room=()=>{const r=read();return r.day===today()?Math.max(0,DAILY-(r.dayEarned||0)):DAILY};
  /* A small note when real work pays out. */
  function toast(g){
    const n=g.reduce((a,x)=>a+x.n,0),t=document.createElement("div");t.className="rw-toast";t.setAttribute("role","status");
    t.innerHTML=coin+'<b>+'+n+'</b><span>'+esc(g.length>1?g.length+" things done":g[0].why)+'</span>';
    document.body.appendChild(t);setTimeout(()=>t.classList.add("out"),2600);setTimeout(()=>t.remove(),3000);
  }
  /* Real work may have changed after any screen: check quietly a moment later. */
  let st=0;const later=()=>{clearTimeout(st);st=setTimeout(sync,400)};
  const balance=()=>{const r=read();return Math.max(0,r.bank-r.spent)};

  /* ---------- Hard hats, fitted to each shape ----------
     Positions are in the Evia button's own box (0–100). cx: centre, y: the brim, w: brim width, a: tilt. Outline
     shapes are drawn 28% larger than their box (16% for the oval), which these numbers already allow for. */
  const FIT={
    circle:{cx:50,y:15,w:80,a:0},
    squircle:{cx:50,y:9,w:86,a:0},
    cloud:{cx:53,y:19,w:74,a:-4},
    oval:{cx:50,y:17,w:80,a:0},
    splat:{cx:50,y:17,w:66,a:0},
    gear:{cx:50,y:6,w:80,a:0},
    hex:{cx:50,y:5,w:86,a:0},
    shield:{cx:50,y:3,w:92,a:0}
  };
  let uid=0;
  function hatSvg(shape,hat){
    const f=FIT[shape]||FIT.circle,w=f.w,x1=f.cx-w*.39,x2=f.cx+w*.39,top=f.y-w*.4,bh=w*.085,id="evh"+(++uid);
    const grad={"hat-blue":["#3a86d6","#1c5ea8","#123f73"],"hat-silver":["#f4f6f8","#b8c0ca","#6b7480"],"hat-gold":["#ffe58a","#e0a800","#8a6400"],"hat-glow":["#fffbe0","#ffd84a","#ff9d00"]}[hat]||["#3a86d6","#1c5ea8","#123f73"];
    return '<svg class="evia-hat '+hat+'" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+grad[0]+'"/><stop offset="1" stop-color="'+grad[1]+'"/></linearGradient></defs>'+
      '<g transform="rotate('+f.a+' '+f.cx+' '+f.y+')">'+
      '<path class="eh-dome" fill="url(#'+id+')" stroke="'+grad[2]+'" d="M'+x1+' '+f.y+' C'+x1+' '+(top+w*.05)+' '+(f.cx-w*.28)+' '+top+' '+f.cx+' '+top+' C'+(f.cx+w*.28)+' '+top+' '+x2+' '+(top+w*.05)+' '+x2+' '+f.y+' Z"/>'+
      '<path class="eh-ridge" stroke="'+grad[0]+'" d="M'+f.cx+' '+(top+w*.03)+' V'+(f.y-1)+'"/>'+
      '<path class="eh-shine" d="M'+(f.cx-w*.26)+' '+(f.y-w*.08)+' C'+(f.cx-w*.26)+' '+(top+w*.14)+' '+(f.cx-w*.16)+' '+(top+w*.07)+' '+(f.cx-w*.08)+' '+(top+w*.06)+'"/>'+
      '<rect class="eh-brim" fill="url(#'+id+')" stroke="'+grad[2]+'" x="'+(f.cx-w/2)+'" y="'+(f.y-bh/2)+'" width="'+w+'" height="'+bh+'" rx="'+bh/2+'"/></g></svg>';
  }
  const hatHtml=(shape,hat)=>hat?'<span class="evia-kit" aria-hidden="true">'+hatSvg(shape,hat)+'</span>':"";

  /* ---------- PPE, fitted to each shape ----------
     Sides of the head at eye level (L, R), the top of the head (top) and the outline as a path for clipping the vest,
     all in the Evia button's own box. */
  const BODY={
    circle:{L:1,R:99,top:0,clip:'<circle cx="50" cy="50" r="50"/>',line:'<circle cx="50" cy="50" r="48"/>'},
    squircle:{L:1,R:99,top:0,clip:'<rect x="0" y="0" width="100" height="100" rx="30"/>',line:'<rect x="2" y="2" width="96" height="96" rx="28"/>'},
    cloud:{L:-7,R:108,top:8},oval:{L:-3,R:103,top:11},splat:{L:3,R:96,top:0},gear:{L:2,R:98,top:1},hex:{L:-4,R:104,top:-2},shield:{L:-2,R:102,top:-4}
  };
  function outlinePath(shape){
    const b=BODY[shape]||BODY.circle;if(b.clip)return {clip:b.clip,line:b.line};
    const svg=window.eviaOutlineSvg?window.eviaOutlineSvg(shape):"",d=(svg.match(/ d="([^"]+)"/)||[])[1]||"";
    const k=shape==="oval"?1.16:1.28,o=shape==="oval"?-8:-14,p='<path transform="translate('+o+' '+o+') scale('+k+')" d="'+d+'"/>';
    return {clip:p,line:p};
  }
  function earsSvg(shape,id){
    const b=BODY[shape]||BODY.circle,gold=id==="ppe-ears-gold",cup=gold?["#ffe58a","#e0a800","#8a6400"]:["#ff6b5c","#d8342a","#7a1a14"],cx=50;
    const band='<path class="ek-band" d="M'+(b.L+2)+' 38 C'+(b.L+1)+' '+(b.top-30)+' '+(b.R-1)+' '+(b.top-30)+' '+(b.R-2)+' 38"/>';
    const c=x=>'<rect class="ek-cup" x="'+(x-8)+'" y="35" width="16" height="30" rx="7" fill="'+cup[1]+'" stroke="'+cup[2]+'"/><rect x="'+(x-5)+'" y="39" width="4" height="22" rx="2" fill="'+cup[0]+'" opacity=".7"/>';
    return '<svg class="evia-ppe ek-ears" viewBox="0 0 100 100" aria-hidden="true">'+band+c(b.L)+c(b.R)+'</svg>';
  }
  function vestSvg(shape,id){
    const o=outlinePath(shape),cid="evv"+(++uid),glow=id==="ppe-hivis-glow";
    return '<svg class="evia-ppe ek-vest'+(glow?" glow":"")+'" viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="'+cid+'">'+o.clip+'</clipPath></defs>'+
      '<g clip-path="url(#'+cid+')"><rect class="ek-hv" x="-20" y="72" width="140" height="60"/><path class="ek-neck" d="M38 71 L50 86 L62 71 Z"/>'+
      '<rect class="ek-strip" x="-20" y="88" width="140" height="5"/><rect class="ek-strip" x="30" y="72" width="5" height="40"/><rect class="ek-strip" x="65" y="72" width="5" height="40"/></g>'+
      '<g class="ek-line">'+o.line+'</g></svg>';
  }
  /* Everything worn on one Evia: body and ears under the hat. Eye PPE is placed on the eyes by fitEyes(). */
  function kitHtml(shape,w){
    const out=(w.body?vestSvg(shape,w.body):"")+(w.ears?earsSvg(shape,w.ears):"")+(w.hat?hatSvg(shape,w.hat):"");
    return out?'<span class="evia-kit" aria-hidden="true">'+out+'</span>':"";
  }
  /* Specs and goggles sit on Evia's actual eyes (measured, so they fit at every size and with every face). */
  function fitEyes(host){
    const id=host.dataset.eyes,face=host.querySelector(".evia-face");if(!face)return;
    let g=face.querySelector(":scope > .ek-eyes");if(!id){if(g)g.remove();return}
    const eyes=[...face.querySelectorAll(":scope > i")];if(eyes.length<2||!eyes[0].offsetWidth)return;
    const w=eyes[0].offsetWidth,h=eyes[0].offsetHeight,gap=Math.max(0,eyes[1].offsetLeft-eyes[0].offsetLeft-w);
    const bw=Math.max(1.3,w*.13),pad=Math.max(1.5,Math.min(w*.3,(gap-bw*1.5)/2));
    const box=e=>({x:e.offsetLeft-pad,y:e.offsetTop-pad,w:e.offsetWidth+pad*2,h:e.offsetHeight+pad*2});
    const a=box(eyes[0]),b=box(eyes[1]),goggles=id==="ppe-goggles";
    if(!g){g=document.createElement("span");g.className="ek-eyes";g.setAttribute("aria-hidden","true");face.appendChild(g)}
    g.className="ek-eyes "+(goggles?"goggles":"specs");g.style.setProperty("--bw",bw+"px");
    const px=v=>Math.round(v*10)/10+"px";
    g.innerHTML=goggles?
      '<b class="ek-strap" style="left:'+px(-face.offsetLeft-4)+';right:'+px(-(host.offsetWidth-face.offsetLeft-face.offsetWidth)-4)+';top:'+px(a.y+a.h/2-bw)+';height:'+px(bw*2)+'"></b>'+
      '<b class="ek-gog" style="left:'+px(a.x-bw)+';top:'+px(Math.min(a.y,b.y)-bw*.5)+';width:'+px(b.x+b.w-a.x+bw*2)+';height:'+px(Math.max(a.h,b.h)+bw)+'"></b>'
      :'<b class="ek-lens" style="left:'+px(a.x)+';top:'+px(a.y)+';width:'+px(a.w)+';height:'+px(a.h)+'"></b><b class="ek-lens" style="left:'+px(b.x)+';top:'+px(b.y)+';width:'+px(b.w)+';height:'+px(b.h)+'"></b>'+
       '<b class="ek-bridge" style="left:'+px(a.x+a.w-1)+';width:'+px(b.x-a.x-a.w+2)+';top:'+px(a.y+a.h*.38)+';height:'+px(bw)+'"></b>'+
       '<b class="ek-arm" style="left:'+px(a.x-w*.7)+';width:'+px(w*.7+1)+';top:'+px(a.y+a.h*.38)+';height:'+px(bw)+'"></b><b class="ek-arm" style="left:'+px(b.x+b.w-1)+';width:'+px(w*.7+1)+';top:'+px(b.y+b.h*.38)+';height:'+px(bw)+'"></b>';
  }
  const fitAll=root=>(root||document).querySelectorAll("[data-eyes]").forEach(fitEyes);
  /* Put what's worn on the Evia button (and keep it there when her shape changes). */
  function wearOn(){
    const r=read(),shape=window.eviaCurrentShape?window.eviaCurrentShape():"circle",ok=id=>id&&owns(id)?id:"";
    const w={hat:ok(r.hat),eyes:ok(r.eyes),ears:ok(r.ears),body:ok(r.body)};
    document.querySelectorAll(".evia-fab").forEach(el=>{
      let k=el.querySelector(":scope > .evia-kit");const sig=shape+"|"+w.hat+"|"+w.ears+"|"+w.body;
      if(!(k&&k.dataset.sig===sig)){if(k)k.remove();const html=kitHtml(shape,w);if(html){el.insertAdjacentHTML("beforeend",html);el.lastElementChild.dataset.sig=sig}}
      if(w.eyes)el.dataset.eyes=w.eyes;else delete el.dataset.eyes;
      fitEyes(el);
    });
  }

  /* ---------- Buying, wearing and loot boxes ---------- */
  function buy(id){
    const it=item(id),r=read();if(!it||r.owned.includes(id))return;
    const price=RARITY[it.rarity].price;if(!price||balance()<price)return;
    r.spent+=price;r.owned.push(id);write(r);if(it.kind!=="game")use(id);
    if(window.eviaMood)window.eviaMood("happy");
    reveal(it,false);
  }
  function use(id){
    const it=item(id);if(!it||!owns(id))return;
    if(it.kind==="hat"){const r=read(),sl=it.slot||"hat";r[sl]=r[sl]===id?"":id;write(r);wearOn()}
    else if(it.kind==="expr"){const r=read();r.expr=r.expr===it.key?"":it.key;write(r);applyExpr()}
    else if(it.kind==="shape"&&window.eviaSetShape){window.eviaSetShape(it.key);wearOn()}
    else if(it.kind==="colour"&&window.eviaSetTheme)window.eviaSetTheme(it.key);
    else if(it.kind==="game"){if(window.eviaGames)window.eviaGames.open(it.key);return}
    if(isOpen())page();
  }
  const inUse=it=>it.kind==="game"?false:it.kind==="expr"?read().expr===it.key:it.kind==="hat"?read()[it.slot||"hat"]===it.id:it.kind==="shape"?window.eviaCurrentShape&&window.eviaCurrentShape()===it.key:window.eviaCurrentTheme&&window.eviaCurrentTheme()===it.key;
  /* A loot box: roll a rarity from the odds (an epic or better is guaranteed after 9 without one), then an item of
     that rarity the learner doesn't have yet. If they have them all, they get tokens back instead. */
  function openBox(){
    const r=read();if(balance()<BOX)return;
    r.spent+=BOX;
    let roll=Math.random()*100,rar="common",acc=0;
    for(const k of ORDER){acc+=RARITY[k].odds;if(roll<acc){rar=k;break}}
    if(r.pity>=9&&(rar==="common"||rar==="rare"))rar="epic";
    r.pity=rar==="epic"||rar==="legendary"?0:r.pity+1;
    const pool=catalogue().filter(x=>x.rarity===rar&&!r.owned.includes(x.id));
    let won=null,refund=0;
    if(pool.length){won=pool[Math.floor(Math.random()*pool.length)];r.owned.push(won.id)}
    else{refund=RARITY[rar].refund;r.bank+=refund}
    write(r);
    boxAnim(()=>{if(won){reveal(won,true)}else reveal({label:"Duplicate",rarity:rar,refund},true)});
  }

  /* ---------- The Rewards page ---------- */
  const scr=()=>document.getElementById("screen");
  const isOpen=()=>typeof screen!=="undefined"&&screen==="rewards"&&!!document.getElementById("rw-page");
  const coin='<svg class="rw-coin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path class="rw-star" d="m12 6.8 1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5Z"/></svg>';
  const face='<span class="evia-face"><i></i><i></i></span>';
  /* A small Evia showing the item: the learner's own shape and colour, with the item on. */
  function preview(it){
    if(it.kind==="game")return '<span class="rw-game" aria-hidden="true">'+(window.eviaGames?window.eviaGames.iconFor(it.key):"")+'</span>';
    const T=window.eviaThemes||{},shape=it.kind==="shape"?it.key:(window.eviaCurrentShape?window.eviaCurrentShape():"circle");
    const x=it.kind==="expr"?' data-x="'+it.key+'"':"";
    const wear=it.kind==="hat"?{[it.slot||"hat"]:it.id}:{},col=it.kind==="colour"?' style="--yellow:'+T[it.key].accent+';--evia-shape-stroke:'+T[it.key].accent+'"':"";
    return '<span class="rw-evia evia-shape-avatar shape-'+shape+'"'+col+(wear.eyes?' data-eyes="'+wear.eyes+'"':"")+'><span class="evia-face"'+x+'><i></i><i></i></span>'+kitHtml(shape,wear)+'</span>';
  }
  const tag=r=>'<span class="rw-tag r-'+r+'">'+RARITY[r].label+'</span>';
  const EARN=[["Strong evidence for a unit",EV_PAY.strong],["Good evidence for a unit",EV_PAY.good],["Weak evidence for a unit",EV_PAY.weak],["Off-the-job learning, per hour",OTJ_HOUR+" (up to "+OTJ_WEEK+" a week)"],["Progress review on time",REVIEW_PAY],["Target met",TARGET_PAY],["Achievement on My progress",ACH_TOKENS],["Teach me lessons","up to "+DAILY+" a day"]];
  let tab="hat";
  function page(){
    const r=sync(),bal=balance(),all=catalogue(),got=all.filter(x=>r.owned.includes(x.id)).length;
    const list=all.filter(x=>x.kind===tab).sort((a,b)=>ORDER.indexOf(a.rarity)-ORDER.indexOf(b.rarity));
    scr().innerHTML='<div id="rw-page"><header class="ui-page-head"><h1>Rewards</h1><span>'+got+' of '+all.length+' collected</span></header>'+
      '<section class="rw-bal"><div>'+coin+'<b>'+bal+'</b></div><p>Coins</p><details class="rw-earn"><summary>How to earn coins</summary><ul>'+EARN.map(e=>'<li><span>'+e[0]+'</span><b>'+e[1]+'</b></li>').join("")+'</ul><p>Improve your evidence later and you get the difference.</p></details></section>'+
      '<section class="rw-box"><div class="rw-box-art" aria-hidden="true">'+GIFT+'</div><div class="rw-box-copy"><strong>Loot box</strong><small>Win something you don’t have yet. Duplicates give coins back, and 10 boxes always include an Epic or better.</small>'+
        '<div class="rw-odds">'+ORDER.map(k=>'<span class="r-'+k+'">'+RARITY[k].label+' '+RARITY[k].odds+'%</span>').join("")+'</div>'+
        '<button type="button" class="rw-btn buy" id="rw-open"'+(bal>=BOX?"":" disabled")+'>'+coin+BOX+' · Open</button></div></section>'+
      '<div class="rw-tabs" role="tablist">'+[["hat","Kit"],["expr","Faces"],["shape","Shapes"],["colour","Colours"],["game","Games"]].map(t=>'<button type="button" role="tab" aria-selected="'+(tab===t[0])+'" class="'+(tab===t[0]?"on":"")+'" data-tab="'+t[0]+'">'+t[1]+'</button>').join("")+'</div>'+
      '<div class="rw-grid">'+list.map(it=>{const own=r.owned.includes(it.id),on=own&&inUse(it),price=RARITY[it.rarity].price;
        return '<div class="rw-item r-'+it.rarity+(own?" own":"")+(on?" on":"")+'" id="rw-'+it.id+'">'+tag(it.rarity)+preview(it)+'<strong>'+esc(it.label)+'</strong><small>'+esc(it.about)+'</small>'+
          (own?'<button type="button" class="rw-btn'+(on?" on":"")+'" data-use="'+it.id+'">'+(on?(it.kind==="hat"?"Wearing":"In use"):(it.kind==="hat"?"Wear":it.kind==="game"?"Play":"Use"))+'</button>'
            :price?'<button type="button" class="rw-btn buy" data-buy="'+it.id+'"'+(bal>=price?"":" disabled")+'>'+coin+price+'</button>':'<span class="rw-only">Loot box only</span>')+'</div>'}).join("")+'</div>'+
      (tab==="shape"||tab==="colour"?'<p class="rw-note">Circle, Squircle and Cloud, and Yellow, Green and Blue, are always free.</p>':tab==="expr"?'<p class="rw-note">Evia’s classic face is always free. Tap “In use” to go back to it.</p>':tab==="game"?'<p class="rw-note">Games you unlock are in the Teach me tab too. Each game pays a few coins, up to '+GAME_DAILY+' a day.</p>':"")+'</div>';
    requestAnimationFrame(()=>fitAll(scr()));
    scr().querySelector("#rw-open").onclick=openBox;
    scr().querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;page()});
    scr().querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buy(b.dataset.buy));
    scr().querySelectorAll("[data-use]").forEach(b=>b.onclick=()=>use(b.dataset.use));
  }
  /* From a locked shape or colour in the pickers: open Rewards on that item. */
  function openItem(id){
    const it=item(id);if(!it)return;tab=it.kind;
    window.nav("rewards");setTimeout(()=>{const el=document.getElementById("rw-"+id);if(el){el.scrollIntoView({block:"center",behavior:"smooth"});el.classList.add("rw-flash")}},450);
  }

  /* ---------- The loot box opening and the reveal ---------- */
  const GIFT='<svg viewBox="0 0 64 64"><rect class="g-box" x="10" y="28" width="44" height="28" rx="4"/><rect class="g-lid" x="7" y="19" width="50" height="11" rx="3"/><rect class="g-rib" x="28.5" y="19" width="7" height="37"/><path class="g-bow" d="M32 19c-3-9-14-11-14-4 0 4 7 5 14 4Zm0 0c3-9 14-11 14-4 0 4-7 5-14 4Z"/></svg>';
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;
  function overlay(html){const o=document.createElement("div");o.className="rw-over";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.innerHTML=html;document.body.appendChild(o);return o}
  function boxAnim(done){
    if(reduced())return done();
    const o=overlay('<div class="rw-shake">'+GIFT+'</div><p class="rw-over-t">Opening…</p>');
    setTimeout(()=>{o.remove();done()},1500);
  }
  function reveal(it,fromBox){
    const dup=it.refund!=null;
    const o=overlay('<div class="rw-reveal r-'+it.rarity+'"><span class="rw-burst" aria-hidden="true"></span>'+tag(it.rarity)+
      (dup?'<div class="rw-dup">'+coin+'</div><h2>You have them all</h2><p>Every '+RARITY[it.rarity].label.toLowerCase()+' item is already yours, so here’s <strong>'+it.refund+' coins</strong> back.</p>'
          :'<div class="rw-big">'+preview(it)+'</div><h2>'+esc(it.label)+'</h2><p>'+(fromBox?"New in your collection!":"It’s yours.")+'</p>')+
      '<div class="rw-reveal-btns">'+(dup?"":'<button type="button" class="rw-btn buy" data-go="use">'+(it.kind==="hat"?"Wear it":it.kind==="game"?"Play it":"Use it")+'</button>')+'<button type="button" class="rw-btn" data-go="ok">'+(dup?"OK":"Later")+'</button></div></div>');
    requestAnimationFrame(()=>fitAll(o));
    const close=()=>{o.classList.add("out");setTimeout(()=>o.remove(),200);if(isOpen())page();badge()};
    o.querySelector('[data-go="ok"]').onclick=close;
    const u=o.querySelector('[data-go="use"]');if(u)u.onclick=()=>{const r=read();if(it.kind==="hat"&&r.hat===it.id){close();return}use(it.id);close()};
    if(it.rarity==="legendary"&&window.eviaMood)window.eviaMood("happy");
  }

  /* A dot on the Rewards tab when a loot box can be opened. */
  function badge(){const b=document.querySelector('[data-nav="rewards"]');if(b)b.classList.toggle("rw-dot",balance()>=BOX)}

  /* The expression in use goes on <html>, so every Evia in the app shows it (moods still win for a moment). */
  function applyExpr(){const r=read(),on=r.expr&&owns("expr-"+r.expr);if(on)document.documentElement.setAttribute("data-evia-expr",r.expr);else document.documentElement.removeAttribute("data-evia-expr")}
  applyExpr();
  window.eviaRewards={coin:()=>coin,gameCoins,gameRoom,GAME_DAILY,owns,page,room,later,EV_PAY,applyExpr,kitHtml,fitAll,locked,openItem,hatHtml,hatSvg,wearOn,sync,balance,catalogue,FIT};
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync()});
  setTimeout(()=>{sync();wearOn()},500);
  /* Keep the hat on when Evia's shape changes. */
  new MutationObserver(()=>wearOn()).observe(document.documentElement,{attributes:true,attributeFilter:["data-evia-shape"]});
})();
