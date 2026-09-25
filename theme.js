(function(){
  const THEMES={
    yellow:{label:"Yellow",accent:"#e7b900",soft:"#fff7d6",line:"#f1d878",ink:"#6e5c00",bg:"#fffdfa"},
    green:{label:"Green",accent:"#1fae5c",soft:"#e6f8ee",line:"#a9e2c2",ink:"#146238",bg:"#f8fcfa"},
    blue:{label:"Blue",accent:"#2f6fed",soft:"#e8f0ff",line:"#aecbfa",ink:"#1a3f91",bg:"#f8faff"},
    purple:{label:"Purple",accent:"#8b5cf6",soft:"#f2ecff",line:"#d2bdfb",ink:"#5b32b0",bg:"#fbf9ff"},
    pink:{label:"Pink",accent:"#ef5da8",soft:"#fdecf4",line:"#f7bcd9",ink:"#a52a6f",bg:"#fff9fc"},
    red:{label:"Red",accent:"#e2483d",soft:"#fdeceb",line:"#f5b6af",ink:"#a32921",bg:"#fff9f8"},
    orange:{label:"Orange",accent:"#f47c20",soft:"#fff1e6",line:"#fbc79a",ink:"#9a4a0b",bg:"#fffbf7"},
    teal:{label:"Teal",accent:"#0fa3a3",soft:"#e3f7f7",line:"#9edede",ink:"#0b6464",bg:"#f7fdfd"},
    midnight:{label:"Midnight",accent:"#334155",soft:"#eef1f6",line:"#c6cfdc",ink:"#1e293b",bg:"#f8fafc"}
  };
  /* Free for everyone and shown on the first-run pickers; the rest are unlocked in Rewards (rewards.js). */
  const FREE_THEMES=["yellow","green","blue"],FREE_SHAPES=["circle","squircle","cloud"];
  const KEY="evia7-theme";
  const PICKED_KEY="evia7-theme-picked";
  const SHAPE_KEY="evia7-shape";
  const SHAPE_PICKED_KEY="evia7-shape-picked";
  const SHAPES={
    circle:{label:"Circle",className:"circle"},
    squircle:{label:"Squircle",className:"squircle"},
    cloud:{label:"Cloud",className:"cloud",svg:true},
    splat:{label:"Splat",className:"splat",svg:true},
    gear:{label:"Gear",className:"gear",svg:true},
    oval:{label:"Oval",className:"oval",svg:true},
    hex:{label:"Hexagon",className:"hex",svg:true},
    shield:{label:"Shield",className:"shield",svg:true}
  };
  /* Outline shapes are drawn as SVG (0–100 box) behind Evia's eyes. "body" is filled and outlined. */
  const OUTLINES={
    cloud:{body:["M26 78C13 79 6 69 10 60C2 54 6 40 18 40C18 26 34 19 45 26C52 15 72 16 76 30C89 30 95 44 88 54C95 64 86 77 74 76C68 84 52 85 46 79C40 84 30 83 26 78Z"]},
    splat:{body:["M50 10C54.4 9.8 57.8 19.9 63.5 22.1C69.1 24.3 80.5 19.8 83.6 23.2C86.7 26.6 81.6 36.8 82.2 42.7C82.7 48.5 88.6 54.2 87 58.5C85.5 62.7 75.6 62.7 72.7 68.1C69.8 73.4 73.3 88.2 69.5 90.5C65.7 92.9 56.1 82.9 50 82C43.9 81.1 37 87.4 33.1 85.1C29.2 82.9 30.5 73 26.5 68.7C22.5 64.4 10.2 63.6 9.1 59.3C7.9 55.1 17.8 48.5 19.8 43.1C21.8 37.7 18.2 30.3 21.1 26.9C23.9 23.6 32.2 25.8 37 23C41.8 20.1 45.6 10.2 50 10Z"],dots:[[91,84,4],[12,84,3],[86,11,2.6]]},
    gear:{body:["M43.8 12.5L45.0 3.3A47 47 0 0 1 55.0 3.3L56.2 12.5A38 38 0 0 1 67.0 16.0L73.4 9.2A47 47 0 0 1 81.5 15.1L77.0 23.3A38 38 0 0 1 83.7 32.5L92.9 30.8A47 47 0 0 1 96.0 40.3L87.6 44.3A38 38 0 0 1 87.6 55.7L96.0 59.7A47 47 0 0 1 92.9 69.2L83.7 67.5A38 38 0 0 1 77.0 76.7L81.5 84.9A47 47 0 0 1 73.4 90.8L67.0 84.0A38 38 0 0 1 56.2 87.5L55.0 96.7A47 47 0 0 1 45.0 96.7L43.8 87.5A38 38 0 0 1 33.0 84.0L26.6 90.8A47 47 0 0 1 18.5 84.9L23.0 76.7A38 38 0 0 1 16.3 67.5L7.1 69.2A47 47 0 0 1 4.0 59.7L12.4 55.7A38 38 0 0 1 12.4 44.3L4.0 40.3A47 47 0 0 1 7.1 30.8L16.3 32.5A38 38 0 0 1 23.0 23.3L18.5 15.1A47 47 0 0 1 26.6 9.2L33.0 16.0A38 38 0 0 1 43.8 12.5Z"]},
    oval:{body:["M4 50A46 34 0 1 1 96 50A46 34 0 1 1 4 50Z"]},
    hex:{body:["M30 9Q28 9 27 10.7L8.2 47.4Q7 50 8.2 52.6L27 89.3Q28 91 30 91H70Q72 91 73 89.3L91.8 52.6Q93 50 91.8 47.4L73 10.7Q72 9 70 9Z"]},
    shield:{body:["M50 7C62 12 75 13 88 11Q91 11 91 14V47C91 71 74 86 51.5 94.5Q50 95 48.5 94.5C26 86 9 71 9 47V14Q9 11 12 11C25 13 38 12 50 7Z"]}
  };
  function outlineSvg(name){
    const o=OUTLINES[name];if(!o)return"";
    return '<svg class="evia-outline" viewBox="0 0 100 100" aria-hidden="true" focusable="false">'+
      o.body.map(d=>'<path class="evia-outline-body" d="'+d+'"/>').join("")+
      (o.dots||[]).map(c=>'<circle class="evia-outline-body" cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'"/>').join("")+
    '</svg>';
  }
  /* Every place Evia's face appears gets the outline for its shape: pickers use their own shape, everything else the learner's. */
  const HOSTS=".evia-fab,.evia-welcome-face,.target-evia,.evia-mini,.evia-shape-avatar,.evia-theme-avatar";
  function hostShape(el){const m=[...el.classList].find(c=>c.startsWith("shape-")&&c!=="shape-svg");return m&&SHAPES[m.slice(6)]?m.slice(6):(el.classList.contains("evia-shape-avatar")?null:currentShape())}
  function decorate(el){
    const name=el.classList.contains("evia-theme-avatar")?currentShape():hostShape(el);if(!name)return;
    const svg=SHAPES[name]&&SHAPES[name].svg;
    if(el.dataset.eviaOutline===(svg?name:"")&&(!svg||el.querySelector(":scope > .evia-outline")))return;
    const old=el.querySelector(":scope > .evia-outline");if(old)old.remove();
    [...el.classList].filter(c=>c.startsWith("evia-outline-")).forEach(c=>el.classList.remove(c));
    el.classList.toggle("evia-svg-shape",!!svg);
    el.dataset.eviaOutline=svg?name:"";
    if(svg){el.classList.add("evia-outline-"+name);el.insertAdjacentHTML("afterbegin",outlineSvg(name))}
  }
  function decorateAll(root){(root||document).querySelectorAll(HOSTS).forEach(decorate)}

  function applyTheme(name){
    const t=THEMES[name]||THEMES.yellow;
    const root=document.documentElement.style;
    root.setProperty("--yellow",t.accent);
    root.setProperty("--soft",t.soft);
    root.setProperty("--yellow-line",t.line);
    root.setProperty("--yellow-ink",t.ink);
    root.setProperty("--bg",t.bg);
    document.documentElement.setAttribute("data-evia-theme",THEMES[name]?name:"yellow");
  }
  function currentTheme(){return localStorage.getItem(KEY)||"yellow"}
  function currentShape(){const saved=({sun:"gear",alien:"oval"})[localStorage.getItem(SHAPE_KEY)]||localStorage.getItem(SHAPE_KEY);return SHAPES[saved]?saved:"circle"}
  function setShape(name){
    if(!SHAPES[name])return;
    localStorage.setItem(SHAPE_KEY,name);
    document.documentElement.setAttribute("data-evia-shape",SHAPES[name].className);
    decorateAll();
  }
  function hasPickedShape(){return localStorage.getItem(SHAPE_PICKED_KEY)==="1"}
  function markShapePicked(){localStorage.setItem(SHAPE_PICKED_KEY,"1")}
  function setTheme(name){
    if(!THEMES[name])return;
    localStorage.setItem(KEY,name);
    applyTheme(name);
  }
  function hasPickedTheme(){return localStorage.getItem(PICKED_KEY)==="1"}
  function markPicked(){localStorage.setItem(PICKED_KEY,"1")}

  setShape(currentShape());
  applyTheme(currentTheme());
  new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(!(n instanceof Element))continue;if(n.matches(HOSTS))decorate(n);if(n.querySelector&&n.querySelector(HOSTS))decorateAll(n)}}).observe(document.body||document.documentElement,{childList:true,subtree:true});

  function faceMarkup(name,t,selected){
    const shape=currentShape(),lock=locked("colour",name);
    return '<button type="button" class="evia-theme-option'+(selected?" selected":"")+(lock?" locked":"")+'" data-theme="'+name+'" aria-label="'+t.label+' Evia'+(lock?", locked":"")+'" style="--opt-accent:'+t.accent+'">'+
      '<span class="evia-theme-avatar shape-'+SHAPES[shape].className+'"><span class="evia-face"><i></i><i></i></span></span>'+
      '<strong>'+t.label+'</strong>'+lockTag(lock)+
    '</button>';
  }

  function shapeMarkup(name,s,selected){
    const lock=locked("shape",name);
    return '<button type="button" class="evia-shape-option '+(selected?"selected":"")+(lock?" locked":"")+'" data-shape="'+name+'" aria-label="'+s.label+' Evia'+(lock?", locked":"")+'">'+
      '<span class="evia-shape-avatar shape-'+s.className+'"><span class="evia-face"><i></i><i></i></span></span>'+
      '<strong>'+s.label+'</strong>'+lockTag(lock)+
    '</button>';
  }
  /* Locked items show their rarity; the rarity and ownership live in rewards.js. */
  const R=()=>window.eviaRewards;
  function locked(kind,name){const r=R();return (r&&r.locked&&r.locked(kind,name))||false}
  const lockTag=lock=>lock?'<span class="evia-lock-tag r-'+lock+'"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>'+lock+'</span>':"";
  const firstRun=()=>!hasPickedShape()||!hasPickedTheme();

  function injectStyles(){
    if(document.getElementById("evia-theme-styles"))return;
    const style=document.createElement("style");
    style.id="evia-theme-styles";
    style.textContent=
      '#evia-theme-screen{position:fixed;inset:0;z-index:10050;background:var(--bg,#fffdfa);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;opacity:0;transition:opacity .4s ease}'+
      '#evia-theme-screen.visible{opacity:1}'+
      '#evia-theme-screen.leaving{opacity:0}'+
      '.evia-theme-inner{max-width:420px;width:100%;text-align:center;position:relative}'+
      '.evia-theme-close{position:fixed;top:22px;right:22px;width:38px;height:38px;border-radius:50%;background:#fff;border:1px solid #e9edf2;color:#7b8797;font-size:20px;line-height:1;cursor:pointer}'+
      '.evia-theme-kicker{font-size:11px;letter-spacing:.16em;color:#9aa3af;font-weight:800;margin-bottom:8px}'+
      '.evia-theme-inner h2{font-size:26px;margin:0 0 8px;letter-spacing:-.03em;color:#172033}'+
      '.evia-theme-inner p{font-size:14px;color:#7b8797;margin:0 0 26px;line-height:1.5}'+
      '.evia-theme-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}'+
      '.evia-theme-option{display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px 6px;border-radius:20px;border:2px solid #edf0f4;background:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(25,36,55,.05)}'+
      '.evia-theme-option.selected{border-color:var(--opt-accent)}'+
      '.evia-theme-option:active{transform:scale(.97)}'+
      '.evia-theme-avatar{width:64px;height:64px;background:var(--opt-accent);border:0;display:grid;place-items:center;position:relative;overflow:hidden}'+
      '.evia-theme-avatar:before{content:"";position:absolute;inset:4px;background:#fffdfa;z-index:0}'+
      '.evia-theme-avatar .evia-face{position:relative;z-index:1}'+
      '.evia-theme-avatar .evia-face i{border-color:var(--opt-accent)!important;background:transparent!important}'+
      '.evia-theme-avatar .evia-face i:after{background:var(--opt-accent)!important}'+
      '.evia-theme-avatar.shape-circle,.evia-theme-avatar.shape-circle:before,.evia-shape-avatar.shape-circle,.evia-shape-avatar.shape-circle:before{border-radius:50%}'+
      '.evia-theme-avatar.shape-squircle,.evia-theme-avatar.shape-squircle:before,.evia-shape-avatar.shape-squircle,.evia-shape-avatar.shape-squircle:before{border-radius:30%}'+
      '.evia-theme-option strong,.evia-shape-option strong{font-size:12px;font-weight:700;color:#273244}'+
      '.evia-shape-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}'+
      '.evia-shape-option{display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px 6px;border-radius:20px;border:2px solid #edf0f4;background:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(25,36,55,.05)}'+
      '.evia-shape-option.selected{border-color:var(--yellow)}'+
      '.evia-shape-option:active{transform:scale(.97)}'+
      '.evia-shape-avatar{width:64px;height:64px;background:var(--yellow);border:0;display:grid;place-items:center;position:relative;overflow:hidden}'+
      '.evia-shape-avatar:before{content:"";position:absolute;inset:4px;background:#fffdfa;z-index:0}'+
      '.evia-shape-avatar .evia-face{position:relative;z-index:1}'+
      '.shape-circle,.shape-circle:before{border-radius:50%}'+
      '.shape-squircle,.shape-squircle:before{border-radius:30%}'+
      '.evia-shape-avatar .evia-face i{border-color:var(--yellow)!important;background:transparent!important}'+
      '.evia-shape-avatar .evia-face i:after{background:var(--yellow)!important}'+
      '@media(max-width:380px){.evia-theme-grid,.evia-shape-grid{gap:10px}.evia-theme-avatar,.evia-shape-avatar{width:56px;height:56px}}'+
      '.evia-theme-dot{display:block;width:18px;height:18px;border-radius:50%;background:var(--yellow);border:2px solid #fff;box-shadow:0 0 0 1px var(--yellow-line)}'+
      '@media(max-width:380px){.evia-theme-grid{gap:10px}.evia-theme-avatar{width:56px;height:56px}}'+
      '.evia-shape-option,.evia-theme-option{position:relative}.evia-shape-option.locked .evia-shape-avatar,.evia-theme-option.locked .evia-theme-avatar{opacity:.45;filter:grayscale(.4)}'+
      '.evia-lock-tag{display:inline-flex;align-items:center;gap:3px;margin-top:-4px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:800;text-transform:capitalize;color:#fff;background:#8792a2}'+
      '.evia-lock-tag svg{width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2.4}'+
      '.evia-lock-tag.r-common{background:#8792a2}.evia-lock-tag.r-rare{background:#2f6fed}.evia-lock-tag.r-epic{background:#8b5cf6}.evia-lock-tag.r-legendary{background:linear-gradient(90deg,#e0a800,#f5c542);color:#3b2a00}'+
      '.evia-more{margin:18px 0 0!important;font-size:13px!important;color:#98a2b3!important}';
    document.head.appendChild(style);
  }

  function showShapePicker(onDone){
    injectStyles();
    const root=document.createElement("div");
    root.id="evia-theme-screen";
    const current=currentShape(),first=firstRun();
    root.innerHTML='<div class="evia-theme-inner">'+
      '<button type="button" class="evia-theme-close" id="evia-shape-close" aria-label="Close">\u00d7</button>'+
      '<div class="evia-theme-kicker">WELCOME TO EVIA</div>'+
      '<h2>Choose your Evia shape</h2>'+
      '<p>Pick the Evia shape you like. You can change it anytime from your profile.</p>'+
      '<div class="evia-shape-grid">'+Object.keys(SHAPES).filter(k=>!first||FREE_SHAPES.includes(k)).map(k=>shapeMarkup(k,SHAPES[k],k===current)).join("")+'</div>'+
      '<p class="evia-more">'+(first?"More shapes to unlock in Rewards as you learn.":"Locked shapes are unlocked in Rewards.")+'</p>'+
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    const finish=name=>{
      if(name)setShape(name);
      markShapePicked();
      root.classList.add("leaving");
      setTimeout(()=>{root.remove();if(onDone)onDone();},320);
    };
    root.querySelectorAll("[data-shape]").forEach(b=>b.onclick=()=>{if(b.classList.contains("locked")){finish(null);setTimeout(()=>R()&&R().openItem("shape-"+b.dataset.shape),350);return}finish(b.dataset.shape)});
    document.getElementById("evia-shape-close").onclick=()=>finish(null);
  }

  function showPicker(onDone){
    injectStyles();
    const root=document.createElement("div");
    root.id="evia-theme-screen";
    const current=currentTheme(),first=firstRun();
    root.innerHTML='<div class="evia-theme-inner">'+
      '<button type="button" class="evia-theme-close" id="evia-theme-close" aria-label="Close">\u00d7</button>'+
      '<div class="evia-theme-kicker">WELCOME TO EVIA</div>'+
      '<h2>Pick your Evia colour</h2>'+
      '<p>Choose a colour and Evia will use it throughout the app. You can change this anytime from your profile.</p>'+
      '<div class="evia-theme-grid">'+Object.keys(THEMES).filter(k=>!first||FREE_THEMES.includes(k)).map(k=>faceMarkup(k,THEMES[k],k===current)).join("")+'</div>'+
      '<p class="evia-more">'+(first?"More colours to unlock in Rewards as you learn.":"Locked colours are unlocked in Rewards.")+'</p>'+
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    const finish=name=>{
      if(name)setTheme(name);
      markPicked();
      root.classList.add("leaving");
      setTimeout(()=>{root.remove();if(onDone)onDone();},320);
    };
    root.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>{if(b.classList.contains("locked")){finish(null);setTimeout(()=>R()&&R().openItem("colour-"+b.dataset.theme),350);return}finish(b.dataset.theme)});
    document.getElementById("evia-theme-close").onclick=()=>finish(null);
  }

  window.eviaThemes=THEMES;
  window.eviaSetTheme=setTheme;
  window.eviaCurrentTheme=currentTheme;
  window.eviaShowThemePicker=showPicker;
  window.eviaThemeHasBeenPicked=hasPickedTheme;
  window.eviaShapes=SHAPES;
  window.eviaSetShape=setShape;
  window.eviaCurrentShape=currentShape;
  window.eviaShowShapePicker=showShapePicker;
  window.eviaShapeHasBeenPicked=hasPickedShape;
  window.eviaFree={themes:FREE_THEMES,shapes:FREE_SHAPES};
  window.eviaOutlineSvg=outlineSvg;
})();