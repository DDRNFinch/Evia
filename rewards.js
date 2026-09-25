/* Evia7 Rewards: tokens, the collection, the loot box and Evia's kit.
   Tokens: 1 for every 10 Teach me XP (up to 60 a day), and 25 for each achievement on My progress.
   Items have a rarity (common, rare, epic, legendary). Three shapes and three colours are free; everything else is
   bought with tokens (common to epic) or won in a loot box (legendary only comes from boxes).
   Loot boxes cost tokens only, show their odds, refund tokens for a duplicate, and guarantee an epic or better
   after 9 boxes without one.
   Store "evia7-rewards": {bank, spent, lastXp, day, dayEarned, owned[], hat, pity, seenAch[]}.
   window.eviaRewards: page(), locked(kind,name), openItem(id), hatHtml(shape,hat), wearOn(), sync(), balance(). */
(function(){
  const KEY="evia7-rewards",DAILY=60,ACH_TOKENS=25,BOX=60;
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const blank=()=>({bank:0,spent:0,owned:[],hat:"",pity:0,seenAch:[]});
  const read=()=>{try{return Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||"{}")||{})}catch(_){return blank()}};
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
  const SHAPE_R={oval:"common",splat:"rare",hex:"rare",gear:"epic",shield:"epic"};
  const COLOUR_R={orange:"common",purple:"rare",pink:"rare",red:"rare",teal:"epic",midnight:"epic"};
  function catalogue(){
    const out=[],S=window.eviaShapes||{},T=window.eviaThemes||{};
    Object.keys(HATS).forEach(id=>out.push(Object.assign({id,kind:"hat"},HATS[id])));
    Object.keys(SHAPE_R).forEach(k=>S[k]&&out.push({id:"shape-"+k,kind:"shape",key:k,label:S[k].label+" Evia",rarity:SHAPE_R[k],about:"A new shape for Evia."}));
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

  /* ---------- Tokens ---------- */
  const xp=()=>window.eviaTeach&&window.eviaTeach.stats?window.eviaTeach.stats().xp:0;
  const achievements=()=>{try{const S=window.eviaStats.compute();return window.eviaStats.achievements(S).list.filter(a=>a.earned).map(a=>a.id)}catch(_){return []}};
  function sync(){
    const r=read(),x=xp(),d=today();
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
    write(r);badge();return r;
  }
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
  /* Put the worn hat on the Evia button (and keep it there when her shape changes). */
  function wearOn(){
    const r=read(),shape=window.eviaCurrentShape?window.eviaCurrentShape():"circle";
    document.querySelectorAll(".evia-fab").forEach(el=>{
      let k=el.querySelector(":scope > .evia-kit");
      if(!r.hat||!owns(r.hat)){if(k)k.remove();return}
      const sig=shape+"|"+r.hat;if(k&&k.dataset.sig===sig)return;
      if(k)k.remove();el.insertAdjacentHTML("beforeend",hatHtml(shape,r.hat));el.lastElementChild.dataset.sig=sig;
    });
  }

  /* ---------- Buying, wearing and loot boxes ---------- */
  function buy(id){
    const it=item(id),r=read();if(!it||r.owned.includes(id))return;
    const price=RARITY[it.rarity].price;if(!price||balance()<price)return;
    r.spent+=price;r.owned.push(id);write(r);use(id);
    if(window.eviaMood)window.eviaMood("happy");
    reveal(it,false);
  }
  function use(id){
    const it=item(id);if(!it||!owns(id))return;
    if(it.kind==="hat"){const r=read();r.hat=r.hat===id?"":id;write(r);wearOn()}
    else if(it.kind==="shape"&&window.eviaSetShape){window.eviaSetShape(it.key);wearOn()}
    else if(it.kind==="colour"&&window.eviaSetTheme)window.eviaSetTheme(it.key);
    if(isOpen())page();
  }
  const inUse=it=>it.kind==="hat"?read().hat===it.id:it.kind==="shape"?window.eviaCurrentShape&&window.eviaCurrentShape()===it.key:window.eviaCurrentTheme&&window.eviaCurrentTheme()===it.key;
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
    const T=window.eviaThemes||{},shape=it.kind==="shape"?it.key:(window.eviaCurrentShape?window.eviaCurrentShape():"circle");
    const hat=it.kind==="hat"?it.id:"",col=it.kind==="colour"?' style="--yellow:'+T[it.key].accent+';--evia-shape-stroke:'+T[it.key].accent+'"':"";
    return '<span class="rw-evia evia-shape-avatar shape-'+shape+'"'+col+'>'+face+hatHtml(shape,hat)+'</span>';
  }
  const tag=r=>'<span class="rw-tag r-'+r+'">'+RARITY[r].label+'</span>';
  let tab="hat";
  function page(){
    const r=sync(),bal=balance(),all=catalogue(),got=all.filter(x=>r.owned.includes(x.id)).length;
    const list=all.filter(x=>x.kind===tab).sort((a,b)=>ORDER.indexOf(a.rarity)-ORDER.indexOf(b.rarity));
    scr().innerHTML='<div id="rw-page"><header class="ui-page-head"><h1>Rewards</h1><span>'+got+' of '+all.length+' collected</span></header>'+
      '<section class="rw-bal"><div>'+coin+'<b>'+bal+'</b></div><p>Tokens</p><small>Earn them in Teach me (up to '+DAILY+' a day) and from achievements on My progress.</small></section>'+
      '<section class="rw-box"><div class="rw-box-art" aria-hidden="true">'+GIFT+'</div><div class="rw-box-copy"><strong>Loot box</strong><small>Win something you don’t have yet. Duplicates give tokens back, and 10 boxes always include an Epic or better.</small>'+
        '<div class="rw-odds">'+ORDER.map(k=>'<span class="r-'+k+'">'+RARITY[k].label+' '+RARITY[k].odds+'%</span>').join("")+'</div>'+
        '<button type="button" class="rw-btn buy" id="rw-open"'+(bal>=BOX?"":" disabled")+'>'+coin+BOX+' · Open</button></div></section>'+
      '<div class="rw-tabs" role="tablist">'+[["hat","Evia’s kit"],["shape","Shapes"],["colour","Colours"]].map(t=>'<button type="button" role="tab" aria-selected="'+(tab===t[0])+'" class="'+(tab===t[0]?"on":"")+'" data-tab="'+t[0]+'">'+t[1]+'</button>').join("")+'</div>'+
      '<div class="rw-grid">'+list.map(it=>{const own=r.owned.includes(it.id),on=own&&inUse(it),price=RARITY[it.rarity].price;
        return '<div class="rw-item r-'+it.rarity+(own?" own":"")+(on?" on":"")+'" id="rw-'+it.id+'">'+tag(it.rarity)+preview(it)+'<strong>'+esc(it.label)+'</strong><small>'+esc(it.about)+'</small>'+
          (own?'<button type="button" class="rw-btn'+(on?" on":"")+'" data-use="'+it.id+'">'+(on?(it.kind==="hat"?"Wearing":"In use"):(it.kind==="hat"?"Wear":"Use"))+'</button>'
            :price?'<button type="button" class="rw-btn buy" data-buy="'+it.id+'"'+(bal>=price?"":" disabled")+'>'+coin+price+'</button>':'<span class="rw-only">Loot box only</span>')+'</div>'}).join("")+'</div>'+
      (tab!=="hat"?'<p class="rw-note">Circle, Squircle and Cloud, and Yellow, Green and Blue, are always free.</p>':"")+'</div>';
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
      (dup?'<div class="rw-dup">'+coin+'</div><h2>You have them all</h2><p>Every '+RARITY[it.rarity].label.toLowerCase()+' item is already yours, so here’s <strong>'+it.refund+' tokens</strong> back.</p>'
          :'<div class="rw-big">'+preview(it)+'</div><h2>'+esc(it.label)+'</h2><p>'+(fromBox?"New in your collection!":"It’s yours.")+'</p>')+
      '<div class="rw-reveal-btns">'+(dup?"":'<button type="button" class="rw-btn buy" data-go="use">'+(it.kind==="hat"?"Wear it":"Use it")+'</button>')+'<button type="button" class="rw-btn" data-go="ok">'+(dup?"OK":"Later")+'</button></div></div>');
    if(window.eviaDecorate)window.eviaDecorate(o);
    const close=()=>{o.classList.add("out");setTimeout(()=>o.remove(),200);if(isOpen())page();badge()};
    o.querySelector('[data-go="ok"]').onclick=close;
    const u=o.querySelector('[data-go="use"]');if(u)u.onclick=()=>{const r=read();if(it.kind==="hat"&&r.hat===it.id){close();return}use(it.id);close()};
    if(it.rarity==="legendary"&&window.eviaMood)window.eviaMood("happy");
  }

  /* A dot on the Rewards tab when a loot box can be opened. */
  function badge(){const b=document.querySelector('[data-nav="rewards"]');if(b)b.classList.toggle("rw-dot",balance()>=BOX)}

  window.eviaRewards={page,locked,openItem,hatHtml,hatSvg,wearOn,sync,balance,catalogue,FIT};
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)sync()});
  setTimeout(()=>{sync();wearOn()},500);
  /* Keep the hat on when Evia's shape changes. */
  new MutationObserver(()=>wearOn()).observe(document.documentElement,{attributes:true,attributeFilter:["data-evia-shape"]});
})();
