/* Evia's Site Run: a platform game. Evia starts with no PPE and picks it up on the way; each bit of kit gets her
   through one kind of hazard (hard hat: falling objects, dust mask: dust, hi-vis: moving plant, ear defenders: noise,
   safety boots: nails). All five at once (or a full PPE kit) makes her safe from everything for a few seconds.
   Tools open the way (a bolster cuts through a wall, a spirit level fixes a wonky board, a ladder gets her up high).
   Question gates and the Big Mixer boss use questions from the learner's Teach me course.
   Landscape: move and jump with the buttons (or the keyboard). Portrait: Evia runs on her own; tap to jump.
   Unlocked in Rewards (epic); coins go through the game's daily cap in rewards.js. */
(function(){
  const G=window.eviaGames;if(!G||!G.register)return;
  const {esc,buzz,reduced}=G,R=()=>window.eviaRewards;
  const coinSvg=()=>R()&&R().coin?R().coin():"";
  const KEY="evia7-siterun";
  const GY=300;                    /* the ground's top, in world units */
  const PW=28,PH=34;               /* Evia's box */
  const GRAV=.9,JUMP=-13.5,RUN=4.2,AUTO=3.8;

  /* Icons (24-unit box). Shared by the canvas (Path2D) and the HUD (SVG). "eo" = holes cut with even-odd. */
  const ICON={
    hat:{d:"M4 15A8 8 0 0 1 20 15ZM11 7.2H13V15H11ZM2 15H22V17.8H2Z",c:"#f5b800",name:"Hard hat"},
    mask:{d:"M4.5 9.5Q12 5.5 19.5 9.5L18.5 15Q12 20.5 5.5 15ZM1.5 9H4.8V10.6H1.5ZM19.2 9H22.5V10.6H19.2Z",c:"#e9edf1",name:"Dust mask"},
    vis:{d:"M7 3H10L12 7L14 3H17L20.5 8L18.5 10V21H5.5V10L3.5 8ZM5.5 13H18.5V15H5.5ZM5.5 17H18.5V19H5.5Z",c:"#fb8c1a",eo:1,name:"Hi-vis"},
    ears:{d:"M4 13A8 8 0 0 1 20 13H18A6 6 0 0 0 6 13ZM2.5 11.5H8V19.5H2.5ZM16 11.5H21.5V19.5H16Z",c:"#3f4a57",name:"Ear defenders"},
    boots:{d:"M6 3H12.5V12.5L19 14.5Q21.5 15.4 21.5 18V19.5H6ZM6 20.5H21.5V22H6Z",c:"#3a3f46",name:"Safety boots"},
    bolster:{d:"M10.5 2H13.5V12L17.5 15V22H6.5V15L10.5 12Z",c:"#6b7684",name:"Bolster"},
    level:{d:"M1.5 8.5H22.5V15.5H1.5ZM9.5 10.2H14.5V13.8H9.5Z",c:"#2f7fd8",eo:1,name:"Spirit level"},
    ladder:{d:"M5.5 2H8.3V22H5.5ZM15.7 2H18.5V22H15.7ZM8.3 5.5H15.7V7.5H8.3ZM8.3 10.5H15.7V12.5H8.3ZM8.3 15.5H15.7V17.5H8.3Z",c:"#a8763e",name:"Ladder"},
    kit:{d:"M12 2L20 5V11Q20 18 12 22Q4 18 4 11V5ZM10.6 7H13.4V10.6H17V13.4H13.4V17H10.6V13.4H7V10.6H10.6Z",c:"#16a34a",eo:1,name:"Full PPE kit"}
  };
  const PPE=["hat","mask","vis","ears","boots"];
  const P2D={};const path=k=>P2D[k]||(P2D[k]=new Path2D(ICON[k].d));
  const svg=(k,cls)=>'<svg class="'+(cls||"")+'" viewBox="0 0 24 24" aria-hidden="true"><path d="'+ICON[k].d+'"'+(ICON[k].eo?' fill-rule="evenodd"':"")+'/></svg>';
  const HAZ={
    fall:{need:"hat",hurt:"Falling bricks! A hard hat protects your head.",safe:"Hard hat on: falling bricks bounce off."},
    dust:{need:"mask",hurt:"Dust! Wear a dust mask when cutting or mixing.",safe:"Mask on: the dust can’t get you."},
    plant:{need:"vis",hurt:"Moving plant! Wear hi-vis so the driver can see you.",safe:"Hi-vis on: the driver sees you and stops."},
    noise:{need:"ears",hurt:"Too loud! Ear defenders protect your hearing.",safe:"Ear defenders on: the noise can’t hurt you."},
    nails:{need:"boots",hurt:"Nails! Safety boots have a midsole that stops them.",safe:"Safety boots on: nails can’t get through."}
  };
  const TOOL={bolster:"Cut through with the bolster.",level:"Board levelled. Safe to cross.",ladder:"Ladder up. Climb on."};
  const NEED={bolster:"You need a bolster to cut through this wall.",level:"Wonky board! Find a spirit level to set it right.",ladder:"Too high to jump. Find a ladder."};

  /* ---------- Levels ----------
     Each op moves along the site: run (ground, with coins), gap, zone (a hazard over ground), q (a question gate),
     tool (a tool gate), boss, flag (the finish). pick, sign, plat, crate and cp are placed without moving on. */
  const LEVELS=[
    {name:"Getting set up",about:"Hard hat and safety boots. Cut through with a bolster.",ops:[
      ["run",380,5],["pick","hat"],["run",160],["sign","hat"],["zone","fall",460],["run",140],["crate",60,44],["run",220,4],["gap",90],
      ["cp"],["q"],["run",140,3],["pick","boots"],["run",150],["sign","boots"],["zone","nails",300],["plat",60,90,150,4],["run",220],
      ["pick","bolster"],["run",150],["tool","bolster"],["cp"],["q"],["run",140,4],["flag"]]},
    {name:"Cutting and mixing",about:"Dust mask and ear defenders. Level a wonky board.",ops:[
      ["run",360,5],["pick","mask"],["run",160],["sign","mask"],["zone","dust",420],["run",160,3],["gap",100],["plat",20,90,140,3],["run",220],
      ["cp"],["q"],["pick","ears"],["run",160],["sign","ears"],["zone","noise",380],["run",120],["pick","level"],["run",150],["tool","level"],
      ["crate",90,40],["crate",200,80],["run",300,4],["cp"],["q"],["run",120,3],["flag"]]},
    {name:"The busy site",about:"Hi-vis round moving plant. Grab the full PPE kit.",ops:[
      ["run",340,5],["pick","vis"],["run",160],["sign","vis"],["zone","plant",540],["run",120],["cp"],["q"],
      ["pick","hat",30],["pick","boots",110],["plat",170,90,120],["pick","kit",200,122],["run",320],
      ["zone","fall",280],["zone","nails",260],["zone","noise",300],["run",140],["cp"],["pick","ladder"],["run",160],["tool","ladder"],
      ["run",140,4],["cp"],["q"],["run",120],["flag"]]},
    {name:"Boss: the Big Mixer",about:"Answer three questions to switch it off.",boss:true,ops:[
      ["run",320,5],["pick","hat",120],["run",60],["boss"]]}
  ];

  /* ---------- Questions from the learner's Teach me course ---------- */
  function questions(){
    const T=window.eviaTeach,c=typeof course!=="undefined"?course:"",units=(T&&T.COURSES&&T.COURSES[c])||[],out=[];
    const walk=(o,u,d)=>{
      if(!o||typeof o!=="object"||d>8)return;
      if(Array.isArray(o)){o.forEach(x=>walk(x,u,d+1));return}
      if((o.t==="choice"||o.t==="tf")&&typeof o.q==="string"&&o.q.length<=140){
        if(o.t==="tf"&&typeof o.a==="boolean")out.push({u,q:o.q,opts:["True","False"],a:o.a?0:1,why:o.why||"",tf:1});
        else if(o.t==="choice"&&Array.isArray(o.opts)&&o.opts.length>=3&&o.opts.every(x=>typeof x==="string"&&x.length<=46)){
          const a=o.a|0,wrong=o.opts.filter((_,i)=>i!==a).sort(()=>Math.random()-.5).slice(0,2),opts=[o.opts[a],...wrong].sort(()=>Math.random()-.5);
          out.push({u,q:o.q,opts,a:opts.indexOf(o.opts[a]),why:o.why||""});
        }
        return;
      }
      Object.keys(o).forEach(k=>{if(k!=="why"&&k!=="opts")walk(o[k],u,d+1)});
    };
    units.forEach((u,i)=>walk(u,i,0));
    if(out.length<8)(G.GATES||[]).forEach(g=>out.push({u:0,q:g[0],opts:["True","False"],a:g[1]?0:1,why:g[2]||"",tf:1}));
    return out;
  }
  /* Level n gets questions from its share of the course's units, in a new order each time. */
  function deal(all,n){
    const k=LEVELS.length,max=Math.max(...all.map(q=>q.u),0)+1,lo=Math.floor(max*n/k),hi=Math.max(lo+1,Math.floor(max*(n+1)/k));
    let pool=all.filter(q=>q.u>=lo&&q.u<hi);if(pool.length<6)pool=all.slice();
    return pool.sort(()=>Math.random()-.5);
  }

  /* ---------- Saved progress (per course) ---------- */
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(_){return {}}};
  const ckey=()=>typeof course!=="undefined"&&course?course:"any";
  const prog=()=>{const s=load()[ckey()]||{};return {open:Math.max(1,s.open|0),stars:(s.stars||[]).slice(0,LEVELS.length)}};
  function saveProg(p){const s=load();s[ckey()]=p;try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}

  /* ---------- Build a level ---------- */
  function build(n,qs){
    const L=LEVELS[n],w={solids:[],plats:[],coins:[],picks:[],signs:[],zones:[],stations:[],gates:[],cps:[],flag:null,boss:null,end:0};
    let x=0;
    const ground=(len)=>{w.solids.push({x,y:GY,w:len,h:1200,kind:"ground"});};
    const coinRow=(x0,len,n,y)=>{for(let i=0;i<n;i++)w.coins.push({x:x0+(len/(n+1))*(i+1),y:y})};
    let qi=0;const nextQ=()=>qs[qi++%qs.length];
    for(const op of L.ops){
      const [t,a,b,c,d]=op;
      if(t==="run"){ground(a);if(b)coinRow(x,a,b,GY-40);x+=a}
      else if(t==="gap"){w.coins.push({x:x+a/2,y:GY-110});x+=a}
      else if(t==="zone"){ground(b);w.zones.push({kind:a,x,w:b,t:0,brick:0,dumper:a==="plant"?{x:x+b-80,dir:-1}:null});x+=b}
      else if(t==="pick")w.picks.push({kind:a,x:x+(b==null?60:b),y:GY-30-(c||0)});
      else if(t==="sign")w.signs.push({kind:a,x:x+30});
      else if(t==="plat"){w.plats.push({x:x+a,y:GY-b,w:c});if(d)coinRow(x+a,c,d,GY-b-28)}
      else if(t==="crate")w.solids.push({x:x+a,y:GY-b,w:40,h:b,kind:"crate"});
      else if(t==="cp")w.cps.push({x:x+30,on:false});
      else if(t==="q"){
        ground(440);const q=nextQ(),st={x,q,tries:0,done:false,blocks:[],bar:null};
        q.opts.forEach((o,i)=>{const bl={x:x+(q.opts.length===2?150:120)+i*84,y:GY-144,w:46,h:34,kind:"block",st,i,state:""};st.blocks.push(bl);w.solids.push(bl)});
        st.bar={x:x+390,y:GY-300,w:22,h:300,kind:"bar",st,lift:0};w.solids.push(st.bar);w.stations.push(st);x+=440;
      }
      else if(t==="tool"){
        if(a==="bolster"){ground(320);const g={x:x+130,y:GY-170,w:36,h:170,kind:"wall",tool:a,brk:0};w.solids.push(g);w.gates.push(g);x+=320}
        else if(a==="ladder"){ground(380);const g={x:x+140,y:GY-200,w:70,h:200,kind:"block-wall",tool:a,placed:false};w.solids.push(g);w.gates.push(g);x+=380}
        else{ground(120);const g={x:x+120,w:200,kind:"board",tool:a,fixed:false};w.plats.push({x:x+120,y:GY,w:200,gate:g});w.gates.push(g);x+=320;ground(160);x+=160}
      }
      else if(t==="boss"){
        ground(820);const B={x,hp:3,hit:0,t:0,blobs:[],splats:[],q:null,tries:0,right:0,wait:0,on:false,dead:false,blocks:[]};
        B.mixer={x:x+640,y:GY-104,w:110,h:104,kind:"mixer"};w.solids.push(B.mixer);
        B.wall={x:x-20,y:GY-400,w:20,h:400,kind:"arena",gone:true};w.solids.push(B.wall);
        for(let i=0;i<3;i++){const bl={x:x+210+i*90,y:GY-144,w:46,h:34,kind:"block",st:B,i,state:"",gone:true};B.blocks.push(bl);w.solids.push(bl)}
        B.ask=()=>{B.q=nextQ();B.tries=0;B.blocks.forEach((bl,i)=>{bl.state="";bl.gone=i>=B.q.opts.length})};
        w.boss=B;x+=820;
      }
      else if(t==="flag"){ground(300);w.flag={x:x+140};x+=300}
    }
    w.end=x;w.total=w.coins.length;return w;
  }

  /* ---------- The game ---------- */
  function run(ctx){
    ctx.body.innerHTML='<div class="sr"><canvas aria-label="Evia’s Site Run"></canvas>'+
      '<div class="sr-hud"><div class="sr-hearts" aria-label="Hearts"></div><div class="sr-kit"></div><b class="sr-name"></b><span class="sr-coins">'+coinSvg()+'<b>0</b></span><button type="button" class="sr-x" aria-label="Close">×</button></div>'+
      '<div class="sr-q" hidden></div><div class="sr-toast" role="status" aria-live="polite"></div>'+
      '<div class="sr-pad" hidden><button type="button" data-k="l" aria-label="Left"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" data-k="r" aria-label="Right"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button><button type="button" data-k="j" class="sr-jump" aria-label="Jump"><svg viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg></button></div>'+
      '<div class="sr-menu"></div></div>';
    const $=s=>ctx.body.querySelector(s);
    const wrap=$(".sr"),cv=$("canvas"),g=cv.getContext("2d"),menu=$(".sr-menu"),qEl=$(".sr-q"),toastEl=$(".sr-toast"),pad=$(".sr-pad");
    const css=getComputedStyle(document.documentElement),accent=css.getPropertyValue("--yellow").trim()||"#f5c400";
    let W=0,H=0,dpr=1,scale=1,camX=0,camY=0,land=true;
    const size=()=>{const r=wrap.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+"px";cv.style.height=H+"px";
      land=W>=H;scale=land?H/360:W/360;wrap.classList.toggle("port",!land);pad.hidden=!land||state!=="play"};
    let state="menu",lv=0,w=null,p=null,raf=0,last=0,fs=false;
    size();const ro=new ResizeObserver(size);ro.observe(wrap);

    /* Input */
    const keys={l:0,r:0,j:0};let jb=0;
    const press=k=>{if(k==="j"){if(!keys.j)jb=8;keys.j=1}else keys[k]=1};
    const release=k=>{keys[k]=0};
    pad.querySelectorAll("[data-k]").forEach(b=>{
      const k=b.dataset.k;
      b.addEventListener("pointerdown",e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add("on");press(k)});
      ["pointerup","pointercancel","lostpointercapture"].forEach(ev=>b.addEventListener(ev,()=>{b.classList.remove("on");release(k)}));
    });
    cv.addEventListener("pointerdown",e=>{if(state!=="play")return;e.preventDefault();if(!land)press("j")});
    cv.addEventListener("pointerup",()=>release("j"));cv.addEventListener("pointercancel",()=>release("j"));
    const KM={ArrowLeft:"l",KeyA:"l",ArrowRight:"r",KeyD:"r",ArrowUp:"j",KeyW:"j",Space:"j"};
    const kd=e=>{const k=KM[e.code];if(!k||state!=="play"||e.target.closest&&e.target.closest("button"))return;e.preventDefault();if(!e.repeat)press(k)};
    const ku=e=>{const k=KM[e.code];if(k)release(k)};
    document.addEventListener("keydown",kd);document.addEventListener("keyup",ku);
    const vis=()=>{if(document.hidden){keys.l=keys.r=keys.j=0}};document.addEventListener("visibilitychange",vis);
    $(".sr-x").onclick=()=>ctx.close();
    ctx.stops.push(()=>{cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener("keydown",kd);document.removeEventListener("keyup",ku);document.removeEventListener("visibilitychange",vis);
      if(fs){try{window.screen.orientation&&window.screen.orientation.unlock&&window.screen.orientation.unlock()}catch(_){}try{document.fullscreenElement&&document.exitFullscreen()}catch(_){}}});

    /* Phones: go full screen and turn to landscape where the browser allows it. */
    function goBig(){
      if(fs||!matchMedia("(pointer:coarse)").matches||document.fullscreenElement||!document.documentElement.requestFullscreen)return;
      document.documentElement.requestFullscreen({navigationUI:"hide"}).then(()=>{fs=true;const o=window.screen&&window.screen.orientation;if(o&&o.lock)o.lock("landscape").catch(()=>{})}).catch(()=>{});
    }

    /* HUD and messages */
    let toastT=0;const said={};
    function toast(msg,key,gap){const now=performance.now();if(key){if(said[key]&&now-said[key]<(gap||3000))return;said[key]=now}toastEl.textContent=msg;toastEl.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove("on"),2600)}
    function hud(){
      if(!p)return;
      $(".sr-hearts").innerHTML=[0,1,2].map(i=>'<svg viewBox="0 0 24 24" class="'+(i<p.hearts?"on":"")+'"><path d="M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.5 4.4 2 7.5 2c1.8 0 3.4.8 4.5 2.1C13.1 2.8 14.7 2 16.5 2 19.6 2 22 4.5 22 7.6c0 3.8-3.4 6.9-8.6 11.6z"/></svg>').join("");
      $(".sr-hearts").setAttribute("aria-label",p.hearts+" hearts left");
      $(".sr-kit").innerHTML=PPE.map(k=>'<span class="sr-slot'+(p.ppe[k]?" on":"")+'" title="'+ICON[k].name+'" style="--c:'+ICON[k].c+'">'+svg(k)+'</span>').join("")+
        ["bolster","level","ladder"].filter(k=>p.tools[k]).map(k=>'<span class="sr-slot on tool" title="'+ICON[k].name+'" style="--c:'+ICON[k].c+'">'+svg(k)+'</span>').join("");
      $(".sr-coins b").textContent=p.coins;
    }

    /* ---------- Menu and cards ---------- */
    const star=on=>'<svg viewBox="0 0 24 24" class="sr-star'+(on?" on":"")+'"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>';
    function showMenu(){
      state="menu";qEl.hidden=true;pad.hidden=true;wrap.classList.remove("playing");const pr=prog();
      menu.hidden=false;menu.innerHTML='<div class="sr-card sr-levels"><button type="button" class="sr-x sr-cx" aria-label="Close">×</button><h2>Evia’s Site Run</h2><p>Pick up the right PPE, answer the questions and get to the end of the site.</p>'+
        '<div class="sr-list">'+LEVELS.map((L,i)=>{const open=i<pr.open,s=pr.stars[i]|0;return '<button type="button" class="sr-lv'+(open?"":" locked")+'" data-lv="'+i+'"'+(open?"":" disabled")+'><span class="sr-lv-n">'+(L.boss?"!":i+1)+'</span><span class="sr-lv-t"><strong>'+esc(L.name)+'</strong><small>'+(open?esc(L.about):"Finish the level before to open")+'</small></span><span class="sr-lv-s">'+[0,1,2].map(k=>star(k<s)).join("")+'</span></button>'}).join("")+'</div>'+
        (land?"":'<p class="sr-turn"><svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M20 14a7 7 0 0 1-5 6.5M4 10a7 7 0 0 1 5-6.5"/></svg>Best played with your phone turned sideways.</p>')+'</div>';
      menu.querySelector(".sr-cx").onclick=()=>ctx.close();
      menu.querySelectorAll("[data-lv]").forEach(b=>b.onclick=()=>{goBig();start(+b.dataset.lv)});
      const f=menu.querySelector(".sr-lv:not(.locked)");try{f&&f.focus({preventScroll:true})}catch(_){}
    }
    function card(html,btns){
      menu.hidden=false;menu.innerHTML='<div class="sr-card">'+html+'<div class="sr-btns">'+btns.map(b=>'<button type="button" class="'+(b[2]||"secondary")+'" data-b="'+b[0]+'">'+b[1]+'</button>').join("")+'</div></div>';
      const acts={next:()=>start(lv+1),again:()=>start(lv),levels:showMenu};
      menu.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>acts[b.dataset.b]());
      setTimeout(()=>{const b=menu.querySelector("[data-b]");try{b&&b.focus({preventScroll:true})}catch(_){}},60);
    }

    /* ---------- Start a level ---------- */
    let qs=[];
    function start(n){
      lv=n;qs=deal(questions(),n);w=build(n,qs);
      p={x:60,y:GY-PH,vx:0,vy:0,face:1,ground:true,coy:0,hearts:3,inv:0,power:0,ppe:{},tools:{},coins:0,cp:60,dust:0,noise:0,climb:null,full:false,missed:0,answered:0,wobble:0,dead:0};
      Object.keys(said).forEach(k=>delete said[k]);
      menu.hidden=true;menu.innerHTML="";state="play";wrap.classList.add("playing");pad.hidden=!land;qEl.hidden=true;shownQ=null;parts.length=0;
      $(".sr-name").textContent=LEVELS[n].name;hud();
      toast(land?"Move with the arrows. Jump with the up button.":"Evia runs on her own. Tap to jump.");
      last=performance.now();
    }
    function lose(){
      state="over";buzz([30,40,30]);pad.hidden=true;qEl.hidden=true;
      card('<h2>Out of hearts</h2><p class="sr-sub">Look out for the blue signs: they tell you which PPE you need next.</p>',[["again","Try again","primary"],["levels","Levels"]]);
    }
    function win(){
      state="won";pad.hidden=true;qEl.hidden=true;buzz([20,30,20]);
      const allRight=p.missed===0,coinsOk=p.coins>=Math.ceil(w.total*.8),stars=1+(allRight?1:0)+(coinsOk?1:0);
      const pr=prog();pr.stars[lv]=Math.max(pr.stars[lv]|0,stars);pr.open=Math.max(pr.open,Math.min(LEVELS.length,lv+2));saveProg(pr);
      const want=Math.min(20,Math.floor(p.coins/3)+stars*2),got=want&&R()&&R().gameCoins?R().gameCoins(want):0;ctx.coins();
      if(got&&window.eviaMood)window.eviaMood("happy");
      const last=lv===LEVELS.length-1;
      card('<h2>'+(last?"Big Mixer switched off!":"Level complete")+'</h2><div class="sr-stars">'+[0,1,2].map(k=>star(k<stars)).join("")+'</div>'+
        '<ul class="sr-why"><li class="ok">Got to the end</li><li class="'+(allRight?"ok":"")+'">'+(allRight?"Every question right first time":"Questions: "+p.missed+" wrong "+(p.missed===1?"try":"tries"))+'</li><li class="'+(coinsOk?"ok":"")+'">Coins: '+p.coins+" of "+w.total+'</li></ul>'+
        '<div class="gm-end-coins">'+coinSvg()+'<b>+'+got+'</b><span>'+(got?"coins":want?"Today’s game coins are all collected. Play for fun!":"coins")+'</span></div>',
        last?[["levels","Levels","primary"],["again","Play again"]]:[["next","Next level","primary"],["again","Play again"],["levels","Levels"]]);
    }

    /* ---------- Rules ---------- */
    const hitBox=(a,b)=>a.x<b.x+b.w&&a.x+PW>b.x&&a.y<b.y+b.h&&a.y+PH>b.y;
    const safe=()=>p.inv>0||p.power>0;
    const parts=[];
    const burst=(x,y,col,n,sp)=>{if(reduced())n=Math.ceil(n/3);for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*(sp||4),vy:-Math.random()*(sp||4),life:30+Math.random()*20,col,r:2+Math.random()*2.5})};
    function hurt(msg,key){
      if(safe()||state!=="play")return;
      p.hearts--;p.inv=90;p.vy=-7;p.vx=-3.5*p.face;buzz(40);toast(msg,key,0);hud();
      if(p.hearts<=0){p.dead=1;setTimeout(lose,600);state="dying"}
    }
    function respawn(){
      p.hearts--;hud();if(p.hearts<=0){state="dying";setTimeout(lose,300);return}
      p.x=p.cp;p.y=GY-PH-80;p.vx=p.vy=0;p.inv=90;p.climb=null;toast("Mind the gaps! Back to the last cone.","gap",0);buzz(40);
    }
    function wear(k){
      if(k==="kit"){PPE.forEach(x=>p.ppe[x]=true);powerUp();return}
      if(ICON[k]&&PPE.includes(k)){p.ppe[k]=true;toast(ICON[k].name+" on.");if(!p.full&&PPE.every(x=>p.ppe[x]))powerUp()}
      else{p.tools[k]=true;toast("Got the "+ICON[k].name.toLowerCase()+".")}
      hud();
    }
    function powerUp(){p.full=true;p.power=480;toast("Full PPE! Nothing can hurt you for a bit.");buzz([15,30,15]);hud()}
    function answer(st,i){
      const boss=st===w.boss;
      if(boss?(!st.q||st.wait>0):st.done)return;
      const q=st.q,bl=st.blocks[i];if(!bl||bl.state==="no")return;
      if(i===q.a){
        bl.state="ok";burst(bl.x+23,bl.y,"#16a34a",14);buzz(15);
        if(!st.tries)p.answered++;
        toast("Right! "+(q.why||""));
        if(boss){st.hp--;st.hit=40;st.right++;st.wait=90;st.q=null;if(st.hp<=0){st.dead=true;w.flag={x:st.x+540};st.blobs.length=0}}
        else{st.done=true;for(let k=0;k<3;k++){w.coins.push({x:st.bar.x-80+k*20,y:GY-60,got:false});w.total++}}
      }else{
        bl.state="no";st.tries++;p.missed++;buzz([20,30]);
        toast("Not that one. "+(q.tf?"":"Have another go."));
        if(boss){st.t=Math.max(st.t,100);if(st.tries>=q.opts.length-1){st.wait=70;st.q=null;toast("It was: "+q.opts[q.a]+". "+(q.why||""))}}
      }
    }

    function stepPlayer(d){
      /* Portrait: Evia runs on her own (and paces the boss arena). */
      let dir=keys.r-keys.l;
      if(!land){dir=1;const B=w.boss;if(B&&B.on&&!B.dead){if(p.x>B.x+470)p.auto=-1;if(p.x<B.x+110)p.auto=1;dir=p.auto||1}}
      if(p.climb){const g=p.climb;p.vx=0;p.vy=0;p.y-=3*d;p.x=g.x-PW;if(p.y+PH<=g.y){p.y=g.y-PH-1;p.x=g.x+2;p.climb=null}return}
      const top=(land?RUN:AUTO)*dir;p.vx+=(top-p.vx)*Math.min(1,(p.ground?.28:.12)*d);if(dir)p.face=dir;
      if(jb>0&&(p.ground||p.coy>0)){p.vy=JUMP;jb=0;p.coy=0;p.ground=false;buzz(5)}
      p.vy+=GRAV*d*(land&&p.vy<-4&&!keys.j?2:1);   /* a short press is a small hop, except for portrait taps */if(p.vy>16)p.vy=16;
      const S=w.solids.filter(s=>!s.gone);
      /* across */
      p.x+=p.vx*d;if(p.x<0)p.x=0;
      for(const s of S){if(!hitBox(p,s))continue;
        if(p.vx>0||(p.vx===0&&p.x<s.x)){p.x=s.x-PW;if(s.tool)touchGate(s)}else p.x=s.x+s.w;p.vx=0}
      /* up and down */
      const oldB=p.y+PH;p.y+=p.vy*d;const wasG=p.ground;p.ground=false;
      for(const s of S){if(!hitBox(p,s))continue;
        if(p.vy>=0&&oldB<=s.y+1){p.y=s.y-PH;p.vy=0;p.ground=true}
        else if(p.vy<0){p.y=s.y+s.h;p.vy=0;if(s.kind==="block")answer(s.st,s.i)}}
      if(p.vy>=0)for(const q of w.plats){if(q.gate&&!q.gate.fixed)continue;
        if(p.x+PW>q.x&&p.x<q.x+q.w&&oldB<=q.y+1&&p.y+PH>=q.y){p.y=q.y-PH;p.vy=0;p.ground=true}}
      if(wasG&&!p.ground&&p.vy>=0)p.coy=land?6:9;
    }
    function touchGate(s){
      if(s.tool==="bolster"){if(p.tools.bolster){if(!s.brk){s.brk=1;toast(TOOL.bolster);buzz(20)}}else toast(NEED.bolster,"need-bolster")}
      if(s.tool==="ladder"){if(p.tools.ladder||s.placed){if(!s.placed)toast(TOOL.ladder);s.placed=true;p.climb=s}else toast(NEED.ladder,"need-ladder")}
    }

    function update(dt){
      if(state!=="play"&&state!=="dying")return;
      const n=Math.ceil(dt),d=dt/n;
      for(let i=0;i<n;i++){if(state==="play")stepPlayer(d);if(jb>0)jb-=d;if(p.coy>0)p.coy-=d}
      if(p.inv>0)p.inv-=dt;if(p.power>0)p.power-=dt;
      if(p.y>GY+140&&state==="play")respawn();
      /* the level board: fix it with the spirit level as she walks up to it */
      for(const g of w.gates){
        if(g.kind==="board"&&!g.fixed&&p.x+PW>g.x-50&&p.x<g.x+10){if(p.tools.level){g.fixed=true;toast(TOOL.level);buzz(15)}else toast(NEED.level,"need-level")}
        if(g.kind==="wall"&&g.brk){g.brk+=dt;if(g.brk>24&&!g.gone){g.gone=true;burst(g.x+18,GY-80,"#b5654a",26,6)}}
      }
      /* pick-ups: portrait pulls them in, as there's no stopping */
      for(const k of w.picks){if(k.got)continue;const dx=k.x-(p.x+PW/2),dy=k.y-(p.y+PH/2);
        if(!land&&Math.abs(dx)<110&&Math.abs(dy)<160){k.x-=dx*.12;k.y-=dy*.12}
        if(Math.abs(dx)<26&&Math.abs(dy)<40){k.got=true;wear(k.kind);burst(k.x,k.y,ICON[k.kind].c,12)}}
      for(const c of w.coins){if(c.got)continue;if(Math.abs(c.x-(p.x+PW/2))<20&&Math.abs(c.y-(p.y+PH/2))<24){c.got=true;p.coins++;$(".sr-coins b").textContent=p.coins;burst(c.x,c.y,"#f5b800",5,2.5)}}
      for(const c of w.cps)if(!c.on&&p.x>c.x-10){c.on=true;p.cp=c.x;toast("Checkpoint.")}
      /* hazards */
      const cx=p.x+PW/2;
      for(const z of w.zones){
        z.t+=dt;const inZ=cx>z.x&&cx<z.x+z.w,near=cx>z.x-160&&cx<z.x+z.w+40,H=HAZ[z.kind],has=p.ppe[H.need];
        if(inZ&&has)toast(H.safe,"safe-"+z.kind,60000);
        if(z.kind==="fall"){
          if(near){z.brick-=dt;if(z.brick<=0){z.brick=48+Math.random()*20;const bx=Math.max(z.x+10,Math.min(z.x+z.w-30,p.x+(Math.random()*180-40)+p.vx*20));(z.bricks=z.bricks||[]).push({x:bx,y:GY-262,vy:2,vx:0,w:22,h:11,dead:0})}}
          for(const b of z.bricks||[]){b.vy+=.32*dt;b.y+=b.vy*dt;b.x+=b.vx*dt;
            if(!b.dead&&b.x<p.x+PW&&b.x+b.w>p.x&&b.y<p.y+PH&&b.y+b.h>p.y){if(has||safe()){b.dead=1;b.vy=-5;b.vx=2.5;burst(b.x,b.y,"#f5b800",6,3)}else{b.dead=1;hurt(H.hurt,"h")}}
            if(b.y+b.h>=GY&&!b.gone){b.gone=true;burst(b.x+11,GY,"#b5654a",8,3)}}
          if(z.bricks)z.bricks=z.bricks.filter(b=>!b.gone&&b.y<GY+40);
        }
        if(z.kind==="dust"||z.kind==="noise"){const k=z.kind;if(inZ&&!has&&!safe()){p[k]+=dt;if(p[k]>40){p[k]=0;hurt(H.hurt,"h")}}else p[k]=Math.max(0,p[k]-dt)}
        if(z.kind==="nails"&&inZ&&p.ground&&!has&&p.y+PH>=GY-1)hurt(H.hurt,"h");
        if(z.kind==="plant"){const m=z.dumper,mcx=m.x+35;m.stop=has&&Math.abs(mcx-cx)<240;
          if(!m.stop){m.x+=m.dir*1.8*dt;if(m.x<z.x){m.x=z.x;m.dir=1}if(m.x>z.x+z.w-70){m.x=z.x+z.w-70;m.dir=-1}}
          if(!m.stop&&p.x<m.x+68&&p.x+PW>m.x+2&&p.y+PH>GY-44)hurt(H.hurt,"h")}
      }
      /* the boss */
      const B=w.boss;
      if(B){
        if(!B.on&&p.x>B.x+60){B.on=true;B.wall.gone=false;B.ask();toast("The Big Mixer! Jump into the right answer three times.")}
        if(B.on&&!B.dead){
          if(B.wait>0){B.wait-=dt;if(B.wait<=0)B.ask()}
          B.t-=dt;if(B.hit>0)B.hit-=dt;
          if(B.t<=0){B.t=reduced()?150:120-(3-B.hp)*15;
            const sx=B.mixer.x+20,sy=GY-120,T=62,tx=p.x+PW/2+p.vx*20;B.blobs.push({x:sx,y:sy,vx:(tx-sx)/T,vy:(GY-10-sy-.5*.3*T*T)/T})}
        }
        for(const b of B.blobs){b.vy+=.3*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
          if(!b.done&&Math.abs(b.x-cx)<18&&Math.abs(b.y-(p.y+PH/2))<22){b.done=1;hurt("Mortar! Keep moving and jump clear.","h")}
          if(b.y>=GY-4){b.done=1;B.splats.push({x:b.x,t:120})}}
        B.blobs=B.blobs.filter(b=>!b.done);B.splats.forEach(s=>s.t-=dt);B.splats=B.splats.filter(s=>s.t>0);
      }
      for(const s of w.stations)if(s.done&&s.bar.lift<1){s.bar.lift=Math.min(1,s.bar.lift+.04*dt);if(s.bar.lift>=1)s.bar.gone=true}
      if(w.flag&&p.x+PW>w.flag.x&&state==="play"){win();return}
      for(const q of parts){q.vy+=.2*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt}
      for(let i=parts.length-1;i>=0;i--)if(parts[i].life<=0)parts.splice(i,1);
      question();
    }

    /* The question banner: shows as Evia gets near a question gate (and all through the boss). Tap an answer, or jump into its block. */
    let shownQ=null;
    function question(){
      let st=null,q=null;
      const B=w.boss;if(B&&B.on&&!B.dead&&B.q){st=B;q=B.q}
      else for(const s of w.stations)if(!s.done&&p.x>s.x-320&&p.x<s.x+420){st=s;q=s.q;break}
      if(!q){if(shownQ){qEl.hidden=true;shownQ=null}return}
      const sig=q.q+"|"+st.blocks.map(b=>b.state).join();
      if(shownQ===sig)return;shownQ=sig;qEl.hidden=false;
      const L=q.tf?["T","F"]:["A","B","C"];
      qEl.innerHTML='<p>'+esc(q.q)+'</p><div class="sr-opts">'+q.opts.map((o,i)=>'<button type="button" data-i="'+i+'" class="'+(st.blocks[i].state||"")+'"'+(st.blocks[i].state==="no"?" disabled":"")+'><b>'+L[i]+'</b>'+esc(o)+'</button>').join("")+'</div>';
      qEl.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{answer(st,+b.dataset.i);b.blur()});
    }

    /* ---------- Drawing ---------- */
    const rr=(x,y,w2,h2,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w2,h2,r);else g.rect(x,y,w2,h2)};
    function icon(k,x,y,s,col){g.save();g.translate(x-s/2,y-s/2);g.scale(s/24,s/24);g.fillStyle=col||ICON[k].c;g.fill(path(k),ICON[k].eo?"evenodd":"nonzero");g.restore()}
    function bricks(x,y,w2,h2,col){g.fillStyle=col||"#b8674b";g.fillRect(x,y,w2,h2);g.strokeStyle="rgba(255,255,255,.55)";g.lineWidth=1.2;g.beginPath();
      for(let yy=y+9,r=0;yy<y+h2;yy+=9,r++){g.moveTo(x,yy);g.lineTo(x+w2,yy)}
      for(let yy=y,r=0;yy<y+h2;yy+=9,r++)for(let xx=x+(r%2?10:0);xx<x+w2;xx+=20){if(xx>x){g.moveTo(xx,yy);g.lineTo(xx,Math.min(y+h2,yy+9))}}g.stroke()}
    function background(){
      const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#e6ecf2");sky.addColorStop(1,"#f7f8fa");g.fillStyle=sky;g.fillRect(0,0,W,H);
      g.save();g.scale(scale,scale);g.translate(0,-camY);const vw=W/scale;
      const off=(camX*.25)%420;g.fillStyle="#d9e0e7";
      for(let x=-off-420;x<vw+420;x+=420){g.fillRect(x+20,GY-150,70,150);g.fillRect(x+100,GY-95,54,95);g.fillRect(x+250,GY-185,62,185);
        g.strokeStyle="#cfd7df";g.lineWidth=4;g.beginPath();g.moveTo(x+340,GY);g.lineTo(x+340,GY-250);g.lineTo(x+440,GY-250);g.moveTo(x+300,GY-250);g.lineTo(x+340,GY-250);g.moveTo(x+420,GY-250);g.lineTo(x+420,GY-215);g.stroke()}
      /* site hoarding and fences, nearer */
      const o2=(camX*.6)%300;
      for(let x=-o2-300;x<vw+300;x+=300){g.fillStyle="#e3e8ed";g.fillRect(x,GY-64,190,64);g.fillStyle="#d5dce3";g.fillRect(x,GY-64,190,5);
        g.strokeStyle="#d3d9df";g.lineWidth=1.5;g.strokeRect(x+200,GY-52,86,52);g.beginPath();for(let k=x+206;k<x+286;k+=8){g.moveTo(k,GY-52);g.lineTo(k,GY)}g.stroke();g.fillStyle="#cdd4db";g.fillRect(x+196,GY-6,10,6);g.fillRect(x+280,GY-6,10,6)}
      g.restore();
    }
    function drawEvia(){
      const cx=p.x+PW/2,cy=p.y+15,flick=p.inv>0&&!p.power&&Math.floor(p.inv/5)%2;
      if(flick)return;
      const t=performance.now()/1000,bob=p.ground&&Math.abs(p.vx)>.5?Math.abs(Math.sin(t*14))*1.6:0;
      g.save();g.translate(cx,cy-bob);
      if(p.power>0){g.fillStyle="rgba(22,163,74,"+(.18+.1*Math.sin(t*10))+")";g.beginPath();g.arc(0,2,27,0,Math.PI*2);g.fill();g.strokeStyle="rgba(22,163,74,.6)";g.lineWidth=2;g.stroke()}
      /* boots first, under the body */
      if(p.ppe.boots){g.fillStyle="#2f343a";const sw=p.ground&&Math.abs(p.vx)>.5?Math.sin(t*14)*3:0;rr(-12+sw,13,11,7,2.5);g.fill();rr(1-sw,13,11,7,2.5);g.fill();g.fillStyle="#f5b800";g.fillRect(-12+sw,18,11,1.5);g.fillRect(1-sw,18,11,1.5)}
      /* the body: always the original round Evia, white with the learner's colour as the outline */
      g.save();g.scale(.34,.34);g.translate(-50,-50);const bodyClip=new Path2D();
      bodyClip.arc(50,50,46,0,Math.PI*2);
      g.fillStyle="#fff";g.fill(bodyClip);
      if(p.ppe.vis){g.save();g.clip(bodyClip);g.fillStyle="#fb8c1a";g.fillRect(0,64,100,40);g.fillStyle="#e8ecef";g.fillRect(0,72,100,6);g.fillRect(0,84,100,6);g.restore()}
      g.strokeStyle=accent;g.lineWidth=9;g.lineJoin="round";g.stroke(bodyClip);
      g.restore();
      /* eyes look where she's going */
      const ex=p.face*2;g.strokeStyle=accent;g.lineWidth=2.6;g.lineCap="round";g.beginPath();g.moveTo(-4.5+ex,-4);g.lineTo(-4.5+ex,1.5);g.moveTo(4.5+ex,-4);g.lineTo(4.5+ex,1.5);g.stroke();
      if(p.ppe.mask){g.fillStyle="#f1f4f6";g.strokeStyle="#9aa6b2";g.lineWidth=1;g.beginPath();g.moveTo(-8+ex,4);g.quadraticCurveTo(ex,1.5,8+ex,4);g.lineTo(6+ex,9.5);g.quadraticCurveTo(ex,13,-6+ex,9.5);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(-8+ex,4.5);g.lineTo(-16,1);g.moveTo(8+ex,4.5);g.lineTo(16,1);g.stroke()}
      if(p.ppe.ears){g.strokeStyle="#3f4a57";g.lineWidth=2.4;g.beginPath();g.arc(0,-2,17,Math.PI*1.08,Math.PI*1.92);g.stroke();g.fillStyle="#3f4a57";rr(-20,-6,6,12,3);g.fill();rr(14,-6,6,12,3);g.fill()}
      if(p.ppe.hat){g.fillStyle="#f5b800";g.beginPath();g.arc(0,-11,12,Math.PI,0);g.closePath();g.fill();g.fillStyle="#d99f00";g.fillRect(-1.2,-22.5,2.4,11);rr(-16,-12,32,3.8,1.9);g.fillStyle="#e2a700";g.fill()}
      g.restore();
    }
    function draw(){
      g.setTransform(dpr,0,0,dpr,0,0);
      if(!w){const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#e6ecf2");sky.addColorStop(1,"#f7f8fa");g.fillStyle=sky;g.fillRect(0,0,W,H);return}
      const vw=W/scale,vh=H/scale;camY=land?0:GY-vh*.68;
      const B=w.boss;let want=p.x-vw*.35;
      if(B&&B.on)want=vw>=820?B.x-(vw-820)/2:Math.max(B.x-20,Math.min(B.x+820-vw,want));
      else want=Math.max(0,Math.min(w.end-vw,want));
      camX+=(want-camX)*(Math.abs(want-camX)>400?1:.2);
      background();
      g.save();g.scale(scale,scale);g.translate(-camX,-camY);
      const L=camX-60,Rr=camX+vw+60,vis=o=>o.x+(o.w||60)>L&&o.x<Rr;
      /* zones behind everything */
      for(const z of w.zones){if(!vis(z))continue;
        if(z.kind==="fall"){g.strokeStyle="#9aa5b1";g.lineWidth=4;g.beginPath();g.moveTo(z.x,GY-262);g.lineTo(z.x+z.w,GY-262);g.stroke();g.fillStyle="#9aa5b1";for(let x=z.x;x<=z.x+z.w+1;x+=z.w/4)g.fillRect(x-2,GY-262,4,GY-(GY-262));
          g.fillStyle="#c79b62";g.fillRect(z.x,GY-266,z.w,6);bricks(z.x+z.w*.3,GY-290,60,24);bricks(z.x+z.w*.7,GY-284,40,18);g.fillStyle="rgba(220,38,38,.85)";for(let x=z.x+8;x<z.x+z.w;x+=40){g.fillRect(x,GY-258,20,4)}
          for(const b of z.bricks||[]){if(b.y<GY-20&&!b.dead){g.fillStyle="rgba(15,23,42,"+Math.min(.22,(b.y-(GY-262))/700)+")";g.beginPath();g.ellipse(b.x+11,GY,12,3,0,0,Math.PI*2);g.fill()}bricks(b.x,b.y,b.w,b.h)}}
        if(z.kind==="nails"){g.fillStyle="#c9a26a";g.fillRect(z.x,GY-4,z.w,4);g.fillStyle="#6b7280";for(let x=z.x+5;x<z.x+z.w;x+=9){g.beginPath();g.moveTo(x-2,GY-4);g.lineTo(x,GY-12);g.lineTo(x+2,GY-4);g.fill()}}
        if(z.kind==="noise"){const bx=z.x+z.w/2;g.fillStyle="#3f4a57";g.fillRect(bx-4,GY-58,8,46);rr(bx-14,GY-66,28,10,4);g.fill();g.fillStyle="#fb8c1a";rr(bx-9,GY-40,18,20,3);g.fill();g.fillStyle="#6b7280";g.fillRect(bx-1.5,GY-14,3,14);
          g.strokeStyle="rgba(63,74,87,.3)";g.lineWidth=3;for(let i=0;i<3;i++){const r=((z.t*1.4+i*40)%120)+10;g.globalAlpha=1-r/130;g.beginPath();g.arc(bx,GY-40,r,Math.PI*1.05,Math.PI*1.95);g.stroke()}g.globalAlpha=1}
        if(z.kind==="plant"){const m=z.dumper,x=m.x,y=GY-46;g.fillStyle="#f5b800";g.beginPath();g.moveTo(x+(m.dir<0?40:0),y);g.lineTo(x+(m.dir<0?70:30),y);g.lineTo(x+(m.dir<0?66:26),y+26);g.lineTo(x+(m.dir<0?44:4),y+26);g.fill();
          g.fillStyle="#e2a700";g.fillRect(x+4,y+22,62,10);g.fillStyle="#3f4a57";g.fillRect(x+(m.dir<0?8:48),y-14,14,22);g.fillStyle="#2f343a";for(const wx of [x+14,x+56]){g.beginPath();g.arc(wx,GY-9,9,0,Math.PI*2);g.fill()}
          const on=Math.floor(z.t/10)%2;g.fillStyle=m.stop?(on?"#fb8c1a":"#fde3c2"):"#fb8c1a";g.beginPath();g.arc(x+(m.dir<0?15:55),y-18,4,0,Math.PI*2);g.fill()}
      }
      /* ground and platforms */
      for(const s of w.solids){if(s.gone||!vis(s))continue;
        if(s.kind==="ground"){g.fillStyle="#e2d9c8";g.fillRect(s.x,s.y,s.w,s.h);g.fillStyle="#c4b89f";g.fillRect(s.x,s.y,s.w,6);g.fillStyle="#d3c8b3";for(let x=s.x+((s.x*7)%23);x<s.x+s.w-6;x+=37)g.fillRect(x,s.y+16+((x*3)%17),6,3)}
        else if(s.kind==="crate"){g.fillStyle="#c79b62";g.fillRect(s.x-2,s.y+s.h-6,s.w+4,6);bricks(s.x,s.y,s.w,s.h-6)}
        else if(s.kind==="wall"){const k=s.brk?Math.min(1,s.brk/24):0;g.globalAlpha=1-k;bricks(s.x+(k?Math.sin(s.brk*3)*2:0),s.y,s.w,s.h);g.globalAlpha=1}
        else if(s.kind==="block-wall"){bricks(s.x,s.y,s.w,s.h,"#c3c7cc");if(s.placed){g.strokeStyle="#a8763e";g.lineWidth=3;g.beginPath();g.moveTo(s.x-12,GY);g.lineTo(s.x-4,s.y-14);g.moveTo(s.x-2,GY);g.lineTo(s.x+6,s.y-14);for(let y=GY-14;y>s.y-10;y-=16){const f=(GY-y)/(GY-s.y+14);g.moveTo(s.x-12+f*8,y);g.lineTo(s.x-2+f*8,y)}g.stroke()}}
        else if(s.kind==="bar"){const y=s.y-s.lift*300;g.save();g.beginPath();g.rect(s.x-4,s.y-300,s.w+8,s.h+300);g.clip();g.fillStyle="#8d99a8";g.fillRect(s.x,y,4,s.h);g.fillRect(s.x+s.w-4,y,4,s.h);g.strokeStyle="rgba(141,153,168,.6)";g.lineWidth=1;for(let yy=y;yy<y+s.h;yy+=6){g.beginPath();g.moveTo(s.x,yy);g.lineTo(s.x+s.w,yy);g.stroke()}
          g.fillStyle=accent;rr(s.x-9,y+s.h-110,s.w+18,26,6);g.fill();g.fillStyle="#fff";g.font="800 16px system-ui,sans-serif";g.textAlign="center";g.fillText("?",s.x+s.w/2,y+s.h-91);g.restore()}
        else if(s.kind==="block"){const c=s.state==="ok"?"#16a34a":s.state==="no"?"#d9dde2":"#fff";g.fillStyle=c;rr(s.x,s.y,s.w,s.h,7);g.fill();g.strokeStyle=s.state==="no"?"#c3c8ce":s.state==="ok"?"#15803d":accent;g.lineWidth=3;g.stroke();
          const q=s.st.q;if(q){g.fillStyle=s.state==="ok"?"#fff":s.state==="no"?"#9aa3ad":"#1f2937";g.font="800 17px system-ui,sans-serif";g.textAlign="center";g.fillText((q.tf?["T","F"]:["A","B","C"])[s.i],s.x+s.w/2,s.y+23)}}
        else if(s.kind==="mixer"&&B)drawMixer(B);
      }
      for(const q of w.plats){if(!vis(q))continue;
        if(q.gate){const f=q.gate.fixed;g.save();g.translate(q.x,q.y);if(!f)g.rotate(.12);g.fillStyle="#c79b62";g.fillRect(0,0,q.w,8);g.fillStyle="#a57a44";g.fillRect(0,8,q.w,2);g.restore();
          if(!f){g.fillStyle="#dc2626";rr(q.x+q.w/2-24,q.y-26,48,16,4);g.fill();g.fillStyle="#fff";g.font="700 10px system-ui,sans-serif";g.textAlign="center";g.fillText("WONKY",q.x+q.w/2,q.y-15)}continue}
        g.fillStyle="#8d99a8";for(const x of [q.x+8,q.x+q.w-12])g.fillRect(x,q.y,4,GY-q.y);g.strokeStyle="#aab4bf";g.lineWidth=2;g.beginPath();g.moveTo(q.x+10,q.y+10);g.lineTo(q.x+q.w-10,GY-4);g.stroke();
        g.fillStyle="#c79b62";g.fillRect(q.x,q.y,q.w,8);g.fillStyle="#a57a44";g.fillRect(q.x,q.y+8,q.w,2)}
      /* signs, checkpoints, the finish */
      for(const s of w.signs){if(!vis(s))continue;g.fillStyle="#8d99a8";g.fillRect(s.x-2,GY-70,4,70);g.fillStyle="#0b5cad";g.beginPath();g.arc(s.x,GY-84,17,0,Math.PI*2);g.fill();icon(s.kind,s.x,GY-84,22,"#fff")}
      for(const c of w.cps){if(!vis(c))continue;g.fillStyle=c.on?accent:"#fb8c1a";g.beginPath();g.moveTo(c.x-10,GY);g.lineTo(c.x-3,GY-30);g.lineTo(c.x+3,GY-30);g.lineTo(c.x+10,GY);g.fill();g.fillStyle="#fff";g.fillRect(c.x-6,GY-18,12,4)}
      if(w.flag){const f=w.flag;g.fillStyle="#6b7280";g.fillRect(f.x,GY-130,4,130);g.fillStyle=accent;g.beginPath();g.moveTo(f.x+4,GY-128);g.lineTo(f.x+46,GY-114);g.lineTo(f.x+4,GY-100);g.fill()}
      if(B)for(const s of B.splats){g.fillStyle="rgba(120,113,108,"+Math.min(.8,s.t/60)+")";g.beginPath();g.ellipse(s.x,GY-1,14,4,0,0,Math.PI*2);g.fill()}
      /* coins and pick-ups */
      const t=performance.now()/1000;
      for(const c of w.coins){if(c.got||!vis(c))continue;const sq=Math.abs(Math.cos(t*3+c.x*.05));g.fillStyle="#f5b800";g.strokeStyle="#b07f00";g.lineWidth=1.5;g.beginPath();g.ellipse(c.x,c.y,8*Math.max(.25,sq),8,0,0,Math.PI*2);g.fill();g.stroke()}
      for(const k of w.picks){if(k.got||!vis(k))continue;const y=k.y+Math.sin(t*3+k.x)*3;g.fillStyle="#fff";g.shadowColor="rgba(15,23,42,.18)";g.shadowBlur=8;g.beginPath();g.arc(k.x,y,16,0,Math.PI*2);g.fill();g.shadowBlur=0;
        g.strokeStyle=k.kind==="kit"?"#16a34a":"rgba(15,23,42,.12)";g.lineWidth=k.kind==="kit"?2.5:1;g.stroke();icon(k.kind,k.x,y,20)}
      if(B)for(const b of B.blobs){g.fillStyle="#8a817a";g.beginPath();g.arc(b.x,b.y,8,0,Math.PI*2);g.fill();g.fillStyle="#a8a19b";g.beginPath();g.arc(b.x-2,b.y-2,3,0,Math.PI*2);g.fill()}
      if(p)drawEvia();
      /* dust drawn over Evia */
      for(const z of w.zones){if(z.kind!=="dust"||!vis(z))continue;for(let i=0;i<26;i++){const x=z.x+((i*97+z.t*(.6+i%3*.3))%z.w),y=GY-20-((i*53)%150)-Math.sin(z.t*.03+i)*8;g.fillStyle="rgba(170,160,145,"+(.16+(i%4)*.05)+")";g.beginPath();g.arc(x,y,16+(i%5)*5,0,Math.PI*2);g.fill()}
        g.fillStyle="#6b7280";g.fillRect(z.x+30,GY-26,30,10);g.fillStyle="#c3c7cc";g.fillRect(z.x+60,GY-30,26,26)}
      for(const q of parts){g.globalAlpha=Math.max(0,Math.min(1,q.life/20));g.fillStyle=q.col;g.fillRect(q.x-q.r/2,q.y-q.r/2,q.r,q.r)}g.globalAlpha=1;
      g.restore();
    }
    function drawMixer(B){
      const m=B.mixer,sh=B.hit>0?Math.sin(B.hit*1.5)*3:0,x=m.x+sh,y=m.y,rot=B.dead?0:performance.now()/400;
      g.fillStyle="#6b7280";g.fillRect(x+20,y+70,70,10);g.fillStyle="#2f343a";for(const wx of [x+28,x+84]){g.beginPath();g.arc(wx,GY-12,12,0,Math.PI*2);g.fill()}
      g.save();g.translate(x+55,y+42);g.rotate(-.35);g.fillStyle=B.dead?"#b9bec5":"#e8772e";g.beginPath();g.ellipse(0,0,48,36,0,0,Math.PI*2);g.fill();
      g.strokeStyle="rgba(0,0,0,.18)";g.lineWidth=4;for(let i=0;i<3;i++){const a=rot+i*2.1;g.beginPath();g.ellipse(0,0,48*Math.abs(Math.cos(a)),36,0,-Math.PI/2,Math.PI/2);g.stroke()}
      g.fillStyle="#3f4a57";g.beginPath();g.ellipse(-46,0,8,20,0,0,Math.PI*2);g.fill();g.restore();
      g.strokeStyle="#1f2937";g.lineWidth=3;g.lineCap="round";g.beginPath();
      if(B.dead){g.moveTo(x+30,y+30);g.lineTo(x+40,y+40);g.moveTo(x+40,y+30);g.lineTo(x+30,y+40);g.moveTo(x+56,y+26);g.lineTo(x+66,y+36);g.moveTo(x+66,y+26);g.lineTo(x+56,y+36)}
      else{g.moveTo(x+28,y+24);g.lineTo(x+42,y+30);g.moveTo(x+68,y+22);g.lineTo(x+54,y+28);g.moveTo(x+34,y+32);g.lineTo(x+34,y+40);g.moveTo(x+60,y+30);g.lineTo(x+60,y+38)}g.stroke();
      if(B.dead){g.fillStyle="rgba(148,163,184,.4)";for(let i=0;i<3;i++){g.beginPath();g.arc(x+30+i*12,y-10-((performance.now()/30+i*20)%40),8+i*2,0,Math.PI*2);g.fill()}}
      for(let i=0;i<3;i++){g.fillStyle=i<B.hp?"#dc2626":"#d9dde2";rr(x+20+i*24,y-26,18,8,4);g.fill()}
    }

    function step(now){
      raf=requestAnimationFrame(step);
      if(document.hidden){last=now;return}
      const dt=Math.min(2,(now-(last||now))/16.67);last=now;
      if(w&&p)update(dt);draw();
    }
    ctx.o.srState=()=>({p,w,state,lv,land});   /* for the tests */
    showMenu();raf=requestAnimationFrame(step);
  }

  G.register({id:"game-siterun",key:"siterun",label:"Evia’s Site Run",rarity:"epic",about:"Wear the right PPE, use the right tools and answer your course questions."},run,
    '<svg viewBox="0 0 24 24"><path d="M2 20h20"/><path d="M4 20v-5h5v5M13 20v-9h6v9"/><circle cx="8" cy="8" r="3"/><path d="M5.5 7.5a2.5 2.5 0 0 1 5 0"/></svg>');
})();
