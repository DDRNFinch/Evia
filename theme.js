(function(){
  const THEMES={
    yellow:{label:"Yellow",accent:"#e7b900",soft:"#fff7d6",line:"#f1d878",ink:"#6e5c00",bg:"#fffdfa"},
    green:{label:"Green",accent:"#1fae5c",soft:"#e6f8ee",line:"#a9e2c2",ink:"#146238",bg:"#f8fcfa"},
    blue:{label:"Blue",accent:"#2f6fed",soft:"#e8f0ff",line:"#aecbfa",ink:"#1a3f91",bg:"#f8faff"},
    purple:{label:"Purple",accent:"#8b5cf6",soft:"#f2ecff",line:"#d2bdfb",ink:"#5b32b0",bg:"#fbf9ff"},
    pink:{label:"Pink",accent:"#ef5da8",soft:"#fdecf4",line:"#f7bcd9",ink:"#a52a6f",bg:"#fff9fc"},
    red:{label:"Red",accent:"#e2483d",soft:"#fdeceb",line:"#f5b6af",ink:"#a32921",bg:"#fff9f8"}
  };
  const KEY="evia7-theme";
  const PICKED_KEY="evia7-theme-picked";
  const SHAPE_KEY="evia7-shape";
  const SHAPE_PICKED_KEY="evia7-shape-picked";
  const SHAPES={
    circle:{label:"Circle",className:"circle"},
    squircle:{label:"Squircle",className:"squircle"},
    blob:{label:"Blob",className:"blob"}
  };

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
  function currentShape(){const saved=localStorage.getItem(SHAPE_KEY);return SHAPES[saved]?saved:"circle"}
  function setShape(name){
    if(!SHAPES[name])return;
    localStorage.setItem(SHAPE_KEY,name);
    document.documentElement.setAttribute("data-evia-shape",SHAPES[name].className);
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

  function faceMarkup(name,t,selected){
    const shape=currentShape();
    return '<button type="button" class="evia-theme-option'+(selected?" selected":"")+'" data-theme="'+name+'" aria-label="'+t.label+' Evia" style="--opt-accent:'+t.accent+'">'+
      '<span class="evia-theme-avatar shape-'+SHAPES[shape].className+'"><span class="evia-face"><i></i><i></i></span></span>'+
      '<strong>'+t.label+'</strong>'+
    '</button>';
  }

  function shapeMarkup(name,s,selected){
    return '<button type="button" class="evia-shape-option '+(selected?"selected":"")+'" data-shape="'+name+'" aria-label="'+s.label+' Evia">'+
      '<span class="evia-shape-avatar shape-'+s.className+'"><span class="evia-face"><i></i><i></i></span></span>'+
      '<strong>'+s.label+'</strong>'+
    '</button>';
  }

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
      '.evia-theme-avatar.shape-cloud,.evia-theme-avatar.shape-cloud:before,.evia-shape-avatar.shape-cloud,.evia-shape-avatar.shape-cloud:before{clip-path:polygon(50% 4%,62% 4%,72% 10%,80% 20%,90% 25%,96% 36%,96% 52%,91% 64%,82% 70%,76% 82%,64% 90%,50% 90%,36% 90%,24% 82%,18% 70%,9% 64%,4% 52%,4% 36%,10% 25%,20% 20%,28% 10%,38% 4%)}'+
      '.evia-theme-avatar.shape-squircle,.evia-theme-avatar.shape-squircle:before,.evia-shape-avatar.shape-squircle,.evia-shape-avatar.shape-squircle:before{border-radius:30%}'+
      '.evia-theme-avatar.shape-blob,.evia-theme-avatar.shape-blob:before,.evia-shape-avatar.shape-blob,.evia-shape-avatar.shape-blob:before{border-radius:58% 42% 46% 54% / 43% 52% 48% 57%}'+
      '.evia-theme-option strong,.evia-shape-option strong{font-size:12px;font-weight:700;color:#273244}'+
      '.evia-shape-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}'+
      '.evia-shape-option{display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px 6px;border-radius:20px;border:2px solid #edf0f4;background:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(25,36,55,.05)}'+
      '.evia-shape-option.selected{border-color:var(--yellow)}'+
      '.evia-shape-option:active{transform:scale(.97)}'+
      '.evia-shape-avatar{width:64px;height:64px;background:var(--yellow);border:0;display:grid;place-items:center;position:relative;overflow:hidden}'+
      '.evia-shape-avatar:before{content:"";position:absolute;inset:4px;background:#fffdfa;z-index:0}'+
      '.evia-shape-avatar .evia-face{position:relative;z-index:1}'+
      '.shape-circle,.shape-circle:before{border-radius:50%}'+
      '.shape-cloud,.shape-cloud:before{clip-path:polygon(50% 4%,62% 4%,72% 10%,80% 20%,90% 25%,96% 36%,96% 52%,91% 64%,82% 70%,76% 82%,64% 90%,50% 90%,36% 90%,24% 82%,18% 70%,9% 64%,4% 52%,4% 36%,10% 25%,20% 20%,28% 10%,38% 4%)}'+
      '.shape-squircle,.shape-squircle:before{border-radius:30%}'+
      '.shape-hexagon,.shape-hexagon:before{clip-path:polygon(25% 2%,75% 2%,100% 50%,75% 98%,25% 98%,0 50%);border-radius:0}'+
      '.shape-diamond,.shape-diamond:before{clip-path:polygon(50% 1%,99% 50%,50% 99%,1% 50%);border-radius:0}'+
      '.shape-splat{clip-path:polygon(50% 0%,58% 13%,68% 3%,71% 18%,84% 11%,81% 28%,98% 26%,88% 41%,100% 50%,87% 59%,95% 74%,79% 72%,82% 89%,66% 82%,57% 100%,48% 87%,38% 96%,34% 82%,18% 90%,21% 74%,3% 77%,12% 61%,0 52%,13% 43%,6% 28%,21% 30%,16% 13%,33% 19%,40% 3%)}'+
      '.shape-splat:before{clip-path:inherit}'+
      '.evia-shape-avatar .evia-face i{border-color:var(--yellow)!important;background:transparent!important}'+
      '.evia-shape-avatar .evia-face i:after{background:var(--yellow)!important}'+
      '@media(max-width:380px){.evia-theme-grid,.evia-shape-grid{gap:10px}.evia-theme-avatar,.evia-shape-avatar{width:56px;height:56px}}'+
      '.evia-theme-dot{display:block;width:18px;height:18px;border-radius:50%;background:var(--yellow);border:2px solid #fff;box-shadow:0 0 0 1px var(--yellow-line)}'+
      '@media(max-width:380px){.evia-theme-grid{gap:10px}.evia-theme-avatar{width:56px;height:56px}}';
    document.head.appendChild(style);
  }

  function showShapePicker(onDone){
    injectStyles();
    const root=document.createElement("div");
    root.id="evia-theme-screen";
    const current=currentShape();
    root.innerHTML='<div class="evia-theme-inner">'+
      '<button type="button" class="evia-theme-close" id="evia-shape-close" aria-label="Close">\u00d7</button>'+
      '<div class="evia-theme-kicker">WELCOME TO EVIA</div>'+
      '<h2>Choose your Evia shape</h2>'+
      '<p>Pick the Evia shape you like. You can change it anytime from your profile.</p>'+
      '<div class="evia-shape-grid">'+Object.keys(SHAPES).map(k=>shapeMarkup(k,SHAPES[k],k===current)).join("")+'</div>'+
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    const finish=name=>{
      if(name)setShape(name);
      markShapePicked();
      root.classList.add("leaving");
      setTimeout(()=>{root.remove();if(onDone)onDone();},320);
    };
    root.querySelectorAll("[data-shape]").forEach(b=>b.onclick=()=>finish(b.dataset.shape));
    document.getElementById("evia-shape-close").onclick=()=>finish(null);
  }

  function showPicker(onDone){
    injectStyles();
    const root=document.createElement("div");
    root.id="evia-theme-screen";
    const current=currentTheme();
    root.innerHTML='<div class="evia-theme-inner">'+
      '<button type="button" class="evia-theme-close" id="evia-theme-close" aria-label="Close">\u00d7</button>'+
      '<div class="evia-theme-kicker">WELCOME TO EVIA</div>'+
      '<h2>Pick your Evia colour</h2>'+
      '<p>Choose a colour and Evia will use it throughout the app. You can change this anytime from your profile.</p>'+
      '<div class="evia-theme-grid">'+Object.keys(THEMES).map(k=>faceMarkup(k,THEMES[k],k===current)).join("")+'</div>'+
      '</div>';
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add("visible"));
    const finish=name=>{
      if(name)setTheme(name);
      markPicked();
      root.classList.add("leaving");
      setTimeout(()=>{root.remove();if(onDone)onDone();},320);
    };
    root.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>finish(b.dataset.theme));
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
})();