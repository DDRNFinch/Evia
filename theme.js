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
  function setTheme(name){
    if(!THEMES[name])return;
    localStorage.setItem(KEY,name);
    applyTheme(name);
  }
  function hasPickedTheme(){return localStorage.getItem(PICKED_KEY)==="1"}
  function markPicked(){localStorage.setItem(PICKED_KEY,"1")}

  applyTheme(currentTheme());

  function faceMarkup(name,t,selected){
    return '<button type="button" class="evia-theme-option'+(selected?" selected":"")+'" data-theme="'+name+'" aria-label="'+t.label+' Evia" style="--opt-accent:'+t.accent+'">'+
      '<span class="evia-theme-avatar"><span class="evia-face"><i></i><i></i></span></span>'+
      '<strong>'+t.label+'</strong>'+
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
      '.evia-theme-avatar{width:64px;height:64px;border-radius:50%;background:#fffdfa;border:4px solid var(--opt-accent);display:grid;place-items:center;position:relative}'+
      '.evia-theme-avatar .evia-face i{border-color:var(--opt-accent)!important;background:transparent!important}'+
      '.evia-theme-avatar .evia-face i:after{background:var(--opt-accent)!important}'+
      '.evia-theme-option strong{font-size:12px;font-weight:700;color:#273244}'+
      '.evia-theme-dot{display:block;width:18px;height:18px;border-radius:50%;background:var(--yellow);border:2px solid #fff;box-shadow:0 0 0 1px var(--yellow-line)}'+
      '@media(max-width:380px){.evia-theme-grid{gap:10px}.evia-theme-avatar{width:56px;height:56px}}';
    document.head.appendChild(style);
  }

  function showPicker(onDone){
    injectStyles();
    const root=document.createElement("div");
    root.id="evia-theme-screen";
    const current=currentTheme();
    root.innerHTML='<div class="evia-theme-inner">'+
      '<button type="button" class="evia-theme-close" id="evia-theme-close" aria-label="Close">\u00d7</button>'+
      '<div class="evia-theme-kicker">WELCOME TO EVIA</div>'+
      '<h2>Pick your Evia</h2>'+
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
})();