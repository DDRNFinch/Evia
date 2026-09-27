/* Evia's Site Quest (demo): explore the site Zelda-style, and face hazards in Pokémon-style battles where Evia's
   moves are her kit (extinguishers, a spill kit, isolating the power). The learning happens in play: people teach
   before anything is tested, every hazard and bit of kit goes into Evia's Site Handbook (open it any time, even in a
   battle), wrong moves explain why, and the help fades: the gym hides the fire class, so Inspect for clues.
   Beaten hazards drop what opens the next part of the site. Knowledge doors (like the 3-4-5 gate) need working out.
   Layout like a handheld: the game at the top, the text panel in the middle, the controller at the bottom
   (a d-pad, A to talk or use, B for the Handbook). In battles the controller shows Evia's moves.
   The site report at the end is the assessment. Unlocked in Rewards (epic). */
(function(){
  const G=window.eviaGames;if(!G||!G.register)return;
  const {esc,buzz,reduced}=G,R=()=>window.eviaRewards;
  const coinSvg=()=>R()&&R().coin?R().coin():"";
  const KEY="evia7-quest",T=16;

  /* ---------- The map ---------- */
  const SOLID=new Set("#xOSEPNTbGL");
  function makeMap(){
    const m=Array.from({length:20},()=>Array(24).fill("."));
    const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)m[j][i]=c};
    rect(0,0,24,1,"#");rect(0,19,24,1,"#");rect(0,0,1,20,"#");rect(23,0,1,20,"#");
    rect(1,1,10,1,"g");rect(2,2,5,3,"O");rect(1,7,22,1,"=");rect(8,5,1,2,"=");
    rect(11,1,1,12,"x");m[7][11]="G";
    rect(13,2,6,2,"S");rect(20,2,2,2,"P");rect(20,9,2,2,"N");rect(13,10,2,2,"b");rect(15,4,1,3,"=");
    rect(1,13,22,1,"x");m[13][21]="L";
    rect(2,16,21,1,"=");rect(21,14,1,2,"=");rect(3,14,6,2,"T");rect(16,14,5,2,"E");rect(1,17,22,2,"g");rect(5,15,1,1,"T");
    return m;
  }

  /* ---------- Kit (Evia's moves) and hazards ---------- */
  const MOVE={
    alarm:{name:"Raise the alarm",col:"#dc2626",kind:"status",info:"Press the nearest call point so everyone gets out. Always first for a fire."},
    water:{name:"Water extinguisher",col:"#d62828",band:"#d62828",info:"Red label. For Class A: wood, paper, cardboard, fabric. Never on electrics or burning liquids."},
    foam:{name:"Foam extinguisher",col:"#d62828",band:"#f1dfae",info:"Cream label. For Class A and Class B (burning liquids like petrol). Not on electrics or cooking oil."},
    co2:{name:"CO₂ extinguisher",col:"#d62828",band:"#1f2328",info:"Black label. For electrical fires and Class B liquids. It doesn’t cool, so wood and paper can reignite."},
    wet:{name:"Wet chemical",col:"#d62828",band:"#f5d000",info:"Yellow label. For Class F: cooking oil and fat fires, like a chip pan. Also works on Class A."},
    sign:{name:"Wet floor sign",col:"#f5c400",kind:"status",info:"Warns people while you deal with a spill, so nobody else slips."},
    spill:{name:"Spill kit",col:"#16a34a",info:"Absorbent pads and granules: contain the spill, soak it up, bag it for proper disposal."},
    mop:{name:"Mop and water",col:"#60a5fa",info:"Fine for water. Water on oil just spreads it further."},
    isolate:{name:"Isolate the power",col:"#475569",kind:"status",info:"Switch off at the isolator, if it’s safe to reach. Never fight an electrical fire with the power on."}
  };
  /* How well each move works on each hazard: 3 super effective, 2 effective, 1 not very effective, 0 no effect, -1 backfires. */
  const FOES={
    blaze:{name:"Blaze",type:"Class A fire",what:"Wood, paper and cardboard burning.",hit:10,col:"#f97316",
      eff:{water:3,foam:2,co2:1,wet:2},why:{co2:"The CO₂ knocks the flames down, but the embers reignite. It doesn’t cool."}},
    slick:{name:"Slick",type:"Oil spill",what:"Oil across a walkway: a slip hazard, and it mustn’t reach the drains.",hit:10,col:"#334155",
      eff:{spill:3,mop:-1},why:{mop:"Water on oil just spreads it further!",alarm:"It’s a spill, not a fire. No need to empty the site."}},
    sparky:{name:"Sparky",type:"Electrical fire",what:"A distribution board on fire. The power is still live.",hit:14,col:"#eab308",
      eff:{co2:3,water:-1,foam:-1,wet:-1},why:{water:"Water conducts electricity! That could have killed you.",foam:"Foam is water-based and conducts electricity!",wet:"Wet chemical is water-based: never on live electrics."}},
    fuel:{name:"Fuel fire",type:"Class B fire",what:"Burning petrol by the generator.",hit:12,col:"#fb923c",clue:"It’s by the generator, and it smells strongly of petrol.",
      eff:{foam:3,co2:2,water:-1,wet:1},why:{water:"Water spreads burning petrol and makes it worse!",wet:"Wet chemical is for cooking oil, not petrol."}},
    chip:{name:"Chip pan fire",type:"Class F fire",what:"Cooking oil alight in the canteen.",hit:12,col:"#f59e0b",clue:"It’s in the canteen. A pan of cooking oil has caught light.",
      eff:{wet:3,water:-1,foam:1,co2:1},why:{water:"Water on burning oil causes a fireball!",foam:"Foam isn’t made for oil fires this hot.",co2:"CO₂ knocks it back, but the oil is so hot it reignites."}},
    card:{name:"Packaging fire",type:"Class A fire",what:"A pile of cardboard packaging burning.",hit:12,col:"#f97316",clue:"A pile of cardboard packaging from a delivery.",
      eff:{water:3,foam:2,wet:2,co2:1},why:{co2:"CO₂ knocks it down, but cardboard smoulders and reignites."}}
  };
  const RULES={
    classes:{name:"Fire classes",info:"Class A: solids (wood, paper, cardboard). Class B: flammable liquids (petrol, paint). Class C: gases. Electrical fires. Class F: cooking oil and fat."},
    chart:{name:"Which extinguisher?",info:"Water (red): A. Foam (cream): A and B. CO₂ (black): electrical and B. Dry powder (blue): A, B, C and electrical. Wet chemical (yellow): F and A. Only tackle small fires, after raising the alarm."},
    r345:{name:"The 3-4-5 rule",info:"Sides of 3 and 4 with a diagonal of 5 make a square (90°) corner. It works in multiples: 6-8-10, 9-12-15, 30-40-50."},
    ppe:{name:"Induction and PPE",info:"Sign in and do your induction on a new site. Hard hat, hi-vis and safety boots on at all times."}
  };

  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(_){return null}};
  const save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}};

  function run(ctx){
    ctx.body.innerHTML='<div class="eq">'+
      '<div class="eq-screen"><canvas aria-label="Evia’s Site Quest"></canvas><div class="eq-hud"><b class="eq-lv"></b><span class="eq-coins">'+coinSvg()+'<b>0</b></span><button type="button" class="eq-x" aria-label="Close">×</button></div></div>'+
      '<div class="eq-panel"><div class="eq-msg" role="status" aria-live="polite"></div></div>'+
      '<div class="eq-left"><div class="eq-dpad"><button type="button" data-d="u" aria-label="Up"><svg viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg></button><button type="button" data-d="l" aria-label="Left"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" data-d="r" aria-label="Right"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button><button type="button" data-d="d" aria-label="Down"><svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7"/></svg></button></div></div>'+
      '<div class="eq-right"><div class="eq-ab"><button type="button" class="eq-b" data-k="b" aria-label="Handbook"><b>B</b><span>Book</span></button><button type="button" class="eq-a" data-k="a" aria-label="Action"><b>A</b><span>Use</span></button></div>'+
        '<div class="eq-moves"></div><div class="eq-keypad"></div></div>'+
      '<div class="eq-over"></div></div>';
    const $=s=>ctx.body.querySelector(s);
    const wrap=$(".eq"),scr=$(".eq-screen"),cv=$("canvas"),g=cv.getContext("2d"),msgEl=$(".eq-msg"),over=$(".eq-over"),movesEl=$(".eq-moves"),keypadEl=$(".eq-keypad"),aLab=$(".eq-a span");
    const accent=getComputedStyle(document.documentElement).getPropertyValue("--yellow").trim()||"#f5c400";
    let W=0,H=0,dpr=1,scale=2,camX=0,camY=0,mode="title",raf=0,last=0;
    const size=()=>{const o=wrap.getBoundingClientRect();wrap.classList.toggle("land",o.width>o.height*1.1);
      const r=scr.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+"px";cv.style.height=H+"px";
      scale=Math.max(W/(10*T),H/(9*T))};
    const ro=new ResizeObserver(size);ro.observe(wrap);ro.observe(scr);size();
    const setMode=m=>{mode=m;wrap.dataset.mode=m};

    /* ---------- State ---------- */
    let S=null,map=null,ents=[],p=null;
    function fresh(){return {v:1,tx:2,ty:8,face:"r",lv:1,xp:0,coins:0,moves:["alarm","water","co2"],items:[],book:{},f:{},beaten:{},report:{alarmFirst:0,fires:0,backfires:0,signFirst:null,isolateFirst:null,gate345:0,gymBackfires:0},got:{}}}
    function begin(s){
      S=s;map=makeMap();if(S.f.gate)map[7][11]=".";if(S.f.compound)map[13][21]="=";
      p={tx:S.tx,ty:S.ty,x:S.tx*T,y:S.ty*T,face:S.face,moving:0,fx:0,fy:0,walk:0};
      buildEnts();hud();setMode("world");
      if(!S.f.started){S.f.started=1;say([["","First day on site. Walk over to Sam, the site manager, and press A to talk."]])}
    }
    const persist=()=>{if(!S)return;S.tx=p.tx;S.ty=p.ty;S.face=p.face;save(S)};
    function learn(k,quiet){if(S.book[k])return;S.book[k]=1;if(!quiet)note("Added to your Site Handbook: "+(MOVE[k]||FOES[k]||RULES[k]).name+".")}
    function addMove(k){if(!S.moves.includes(k)){S.moves.push(k)}learn(k,true)}

    /* Everything on the map you can talk to, fight, read or pick up. */
    function buildEnts(){
      ents=[];const E=(o)=>ents.push(o);
      E({id:"sam",kind:"npc",tx:4,ty:5,hat:"#fff",name:"Sam",act:talkSam});
      E({id:"fpoint",kind:"fp",tx:6,ty:5,act:()=>say([["Fire point","Extinguishers and a fire alarm call point. On site, check the labels before you use one."]])});
      if(!S.beaten.blaze)E({id:"blaze",kind:"foe",foe:"blaze",tx:8,ty:7,act:()=>S.f.inducted?battle("blaze"):say([["","The waste bin is smouldering. Talk to Sam first!"]])});
      E({id:"mo",kind:"npc",tx:10,ty:6,hat:"#2f6fcf",name:"Mo",act:talkMo});
      if(!S.f.gate)E({id:"gate",kind:"gate345",tx:11,ty:7,act:talkMo});
      E({id:"jas",kind:"npc",tx:16,ty:4,hat:"#2f6fcf",name:"Jas",act:talkJas});
      if(!S.beaten.slick)E({id:"slick",kind:"foe",foe:"slick",tx:19,ty:7,act:()=>S.f.jas?battle("slick"):say([["","Oil is spreading across the walkway from the generator. Jas at the stores will know what to do."]])});
      if(!S.f.compound)E({id:"lock",kind:"lock",tx:21,ty:13,act:()=>{if(S.items.includes("keys")){S.f.compound=1;map[13][21]="=";ents=ents.filter(e=>e.id!=="lock");buzz(15);persist();say([["","The keys fit. The electrical compound is open."]])}else say([["Locked gate","Electrical compound. Authorised people only. It needs a key."]])}});
      E({id:"pat",kind:"npc",tx:21,ty:17,hat:"#2f6fcf",name:"Pat",act:talkPat});
      if(!S.beaten.sparky)E({id:"sparky",kind:"foe",foe:"sparky",tx:18,ty:16,act:()=>S.f.pat?battle("sparky"):say([["","The distribution board is sparking and smoking! Talk to Pat, the electrician, first."]])});
      E({id:"cabin",kind:"door",tx:5,ty:16,act:()=>{if(S.f.badge)return say([["Training cabin","You’ve passed the fire safety check. Your badge is in the Handbook."]]);if(!S.items.includes("pass"))return say([["Training cabin","Fire safety check. Pass holders only."]]);gymIntro()}});
      E({id:"notice",kind:"notice",tx:9,ty:12,act:()=>say([["Site notice","Setting-out gate: engineers only. Stores: see Jas. Electrical compound: authorised people only. Training cabin: fire safety checks."]])});
      [[3,10],[6,11],[9,9],[14,8],[18,11],[21,5],[13,5],[3,17],[10,18],[15,18],[20,18],[2,3]].forEach(([x,y],i)=>{if(!S.got["c"+i])E({id:"c"+i,kind:"coin",tx:x,ty:y})});
    }
    const entAt=(x,y)=>ents.find(e=>e.tx===x&&e.ty===y&&e.kind!=="coin");
    const solid=(x,y)=>{const c=(map[y]||[])[x];if(c==null||SOLID.has(c))return true;const e=entAt(x,y);return !!e};

    /* ---------- People ---------- */
    function talkSam(){
      if(!S.f.inducted){S.f.inducted=1;learn("ppe",true);learn("classes",true);learn("water",true);learn("co2",true);learn("alarm",true);persist();
        return say([["Sam","Morning! I’m Sam, the site manager. First job for any new starter: your induction."],
          ["Sam","Here’s your site pass and your PPE: hard hat, hi-vis and safety boots. On at all times on site."],
          ["Sam","And this is your Site Handbook. Everything you learn goes in it. Press B to open it any time, even in the middle of a battle."],
          ["Sam","Hazards on site fight back. You deal with them using the right kit: that’s your moves."],
          ["Sam","Let’s start with fire. Fires come in classes, by what’s burning. Class A is solids like wood and paper. Class B is liquids like petrol. There are also gas, electrical and cooking oil fires."],
          ["Sam","Oh! The waste bin by the walkway is smouldering. Go on: I’ll talk you through it. It’s just to your right."]],()=>hud())}
      if(!S.beaten.blaze)return say([["Sam","The bin fire, on the walkway to your right. Walk up to it and press A."]]);
      if(!S.f.gate)return say([["Sam","Nicely done. Mo’s on the setting-out gate to the yard. Brush up on your 3-4-5!"]]);
      return say([["Sam","Keep going. When you’ve got a pass for the training cabin, come and see me there."]]);
    }
    function talkMo(){
      if(S.f.gate)return say([["Mo","Square corners every time. 3-4-5, in multiples."]]);
      if(!S.beaten.blaze)return say([["Mo","Sorry, can’t let you through yet. Sam wants you inducted and that bin fire sorted first."]]);
      learn("r345",true);
      if(!S.f.moTaught){S.f.moTaught=1;S.f.mult=S.f.mult||[2,3,4][Math.floor(Math.random()*3)];persist();
        return say([["Mo","I’m Mo, the site engineer. This is the setting-out gate: you only get through if you can set out a square corner."],
          ["Mo","We use the 3-4-5 rule. Measure 3 along one side and 4 along the other. If the diagonal between them is exactly 5, the corner is square: 90°."],
          ["Mo","It works in multiples too: 6-8-10, 9-12-15. It’s in your Handbook now."],
          ["Mo","The gate’s keypad will ask you. Try it."]],keypad345)}
      keypad345();
    }
    function keypad345(){
      const m=S.f.mult||2,a=3*m,b=4*m;
      askNumber("Setting-out gate: one side is "+a+" m, the other is "+b+" m. What must the diagonal be for a square corner?",n=>{
        if(n===5*m){S.f.gate=1;if(!S.report.gate345)S.report.gate345=1;map[7][11]=".";ents=ents.filter(e=>e.id!=="gate");buzz([15,30]);gain(20);persist();
          say([["Mo","Spot on: "+a+", "+b+", "+(5*m)+". That corner’s square. Through you go."]])}
        else{S.report.gate345=-1;buzz([20,30]);say([["Mo","Not square. Think of 3-4-5 in multiples: "+a+" is 3 × "+m+", "+b+" is 4 × "+m+"… so the diagonal is 5 × "+m+"."]],keypad345)}
      });
    }
    function talkJas(){
      if(S.beaten.slick)return say([["Jas","Thanks for sorting that spill. Those keys are Pat’s: the electrical compound, behind the fence down the bottom."]]);
      if(S.f.jas)return say([["Jas","The spill’s by the generator. Sign first, then the spill kit."]]);
      S.f.jas=1;addMove("sign");addMove("spill");addMove("mop");persist();
      say([["Jas","You’re the new starter? Perfect timing. Someone’s knocked the generator oil over and it’s spreading across the walkway."],
        ["Jas","Take these: a wet floor sign and a spill kit. The spill kit has absorbent pads and granules. Contain it, soak it up, bag it for disposal."],
        ["Jas","Put the sign out first so nobody else slips. And don’t let it get into the drains."]],()=>note("New moves: Wet floor sign, Spill kit. They’re in your Handbook."));
    }
    function talkPat(){
      if(S.beaten.sparky)return say([["Pat","Power stays off until I’ve tested that board. Good work."]]);
      if(S.f.pat)return say([["Pat","Isolate first, then CO₂. Never water or foam on electrics."]]);
      S.f.pat=1;addMove("isolate");persist();
      say([["Pat","I’m Pat, the electrician. That distribution board is on fire. Sparky, we call it."],
        ["Pat","Two rules. One: never use water or foam on electrics. They conduct, and it could kill you."],
        ["Pat","Two: if it’s safe to reach, isolate the power first. Otherwise it keeps restarting. Then CO₂: the black label."]],()=>note("New move: Isolate the power."));
    }
    function gymIntro(){
      addMove("foam");addMove("wet");learn("chart",true);
      say([["Sam","Welcome to the fire safety check. Three fires, one after another. This time I won’t tell you the class."],
        ["Sam","Use Inspect for clues. Check your Handbook if you need to: on site, you’d read the label. Here’s a wet chemical extinguisher, the yellow label."],
        ["Sam","It’s a drill, so the alarm’s already raised. Ready?"]],()=>battle("fuel",{gym:["fuel","chip","card"]}));
    }

    /* ---------- The panel: messages you tap through ---------- */
    let queue=[],after=null,noteT="";
    function say(lines,then){queue=lines.slice();after=then||null;show()}
    function note(t){noteT=t;if(!queue.length)show()}
    function show(){
      if(queue.length){const [who,text]=queue[0];msgEl.innerHTML=(who?'<b>'+esc(who)+'</b>':"")+'<p>'+esc(text)+'</p><small>Tap here or press A ▾</small>';msgEl.classList.add("talk");return}
      msgEl.classList.remove("talk");msgEl.innerHTML=noteT?'<p>'+esc(noteT)+'</p>':"";
    }
    function next(){if(!queue.length)return false;queue.shift();if(queue.length){show();return true}const f=after;after=null;show();if(f)f();return true}
    msgEl.addEventListener("pointerdown",e=>{if(queue.length){e.preventDefault();next()}});

    /* ---------- Controller ---------- */
    let held=null;
    wrap.querySelectorAll(".eq-dpad [data-d]").forEach(b=>{
      b.addEventListener("pointerdown",e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}held=b.dataset.d;b.classList.add("on")});
      ["pointerup","pointercancel","lostpointercapture"].forEach(ev=>b.addEventListener(ev,()=>{b.classList.remove("on");if(held===b.dataset.d)held=null}))});
    wrap.querySelectorAll(".eq-ab [data-k]").forEach(b=>b.addEventListener("pointerdown",e=>{e.preventDefault();b.classList.add("on");setTimeout(()=>b.classList.remove("on"),120);b.dataset.k==="a"?pressA():openBook()}));
    const KD={ArrowUp:"u",KeyW:"u",ArrowDown:"d",KeyS:"d",ArrowLeft:"l",KeyA:"l",ArrowRight:"r",KeyD:"r"};
    const kd=e=>{if(KD[e.code]){if(mode==="world"){held=KD[e.code];e.preventDefault()}return}
      if(/^(Space|Enter|KeyZ)$/.test(e.code)&&!e.repeat){e.preventDefault();if(mode==="book")return closeBook();pressA()}
      if(/^(KeyX|KeyB)$/.test(e.code)&&!e.repeat){mode==="book"?closeBook():openBook()}
      if(mode==="battle"&&/^Digit[1-4]$/.test(e.code)){const b=movesEl.querySelectorAll("[data-m]")[+e.code.slice(5)-1];if(b)b.click()}};
    const ku=e=>{if(KD[e.code]&&held===KD[e.code])held=null};
    document.addEventListener("keydown",kd);document.addEventListener("keyup",ku);
    $(".eq-x").onclick=()=>{persist();ctx.close()};
    ctx.stops.push(()=>{persist();cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener("keydown",kd);document.removeEventListener("keyup",ku)});

    function pressA(){
      if(next())return;
      if(mode!=="world")return;
      const [dx,dy]=DIR[p.face],e=entAt(p.tx+dx,p.ty+dy);
      if(e&&e.act){buzz(8);e.act(e)}
    }
    const DIR={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
    function aLabel(){
      if(queue.length)return "Next";if(mode!=="world")return "Use";
      const [dx,dy]=DIR[p.face],e=entAt(p.tx+dx,p.ty+dy);if(!e)return "Use";
      return e.kind==="npc"?"Talk":e.kind==="foe"?"Face it":e.kind==="gate345"||e.kind==="lock"||e.kind==="door"?"Open":"Look";
    }
    function step(dt){
      if(queue.length){held=null}
      if(p.moving){p.moving-=dt;const k=Math.max(0,p.moving/9);p.x=(p.tx-p.fx*k)*T;p.y=(p.ty-p.fy*k)*T;p.walk+=dt;if(p.moving<=0){p.moving=0;p.x=p.tx*T;p.y=p.ty*T;arrive()}return}
      if(held&&!queue.length){p.face=held;const [dx,dy]=DIR[held],nx=p.tx+dx,ny=p.ty+dy;
        if(!solid(nx,ny)){p.tx=nx;p.ty=ny;p.fx=dx;p.fy=dy;p.moving=9}}
    }
    function arrive(){
      const c=ents.find(e=>e.kind==="coin"&&e.tx===p.tx&&e.ty===p.ty);
      if(c){S.got[c.id]=1;S.coins++;ents=ents.filter(e=>e!==c);buzz(6);hud()}
      persist();
    }
    function hud(){$(".eq-lv").textContent="Evia · Lv "+S.lv;$(".eq-coins b").textContent=S.coins}
    function gain(xp){S.xp+=xp;const lv=1+Math.floor(S.xp/60);if(lv>S.lv){S.lv=lv;note("Evia grew to level "+lv+"!");buzz([15,30,15])}hud()}

    /* ---------- The keypad (knowledge doors) ---------- */
    let kpVal="",kpDone=null;
    function askNumber(text,done){
      setMode("keypad");kpVal="";kpDone=done;say([["",text]]);queue=[];msgEl.innerHTML='<p>'+esc(text)+'</p><div class="eq-kpv">–</div>';
      keypadEl.innerHTML=["1","2","3","4","5","6","7","8","9","⌫","0","OK"].map(k=>'<button type="button" data-kp="'+k+'">'+k+'</button>').join("");
      keypadEl.querySelectorAll("[data-kp]").forEach(b=>b.addEventListener("pointerdown",e=>{e.preventDefault();const k=b.dataset.kp;buzz(5);
        if(k==="⌫")kpVal=kpVal.slice(0,-1);else if(k==="OK"){if(!kpVal)return;const n=+kpVal;setMode("world");kpDone(n);return}else if(kpVal.length<3)kpVal+=k;
        const v=msgEl.querySelector(".eq-kpv");if(v)v.textContent=kpVal||"–"}));
    }

    /* ---------- Battles ---------- */
    let B=null;
    function battle(id,opt){
      const f=FOES[id],gym=opt&&opt.gym;
      B={id,foe:f,hp:100,me:100,gym,gi:gym?gym.indexOf(id):-1,alarm:!!gym,isolated:false,sign:false,known:!gym,inspected:false,turn:0,tried:{},busy:false,t:0,shake:0,hitT:0};
      learn(id,true);setMode("battle");held=null;
      const intro=gym?[["Fire safety check","Fire "+(B.gi+1)+" of 3! What’s burning? Inspect it for clues."]]:
        id==="blaze"?[["","A small fire in the waste bin! It’s Blaze: a Class A fire. Wood, paper and cardboard."],["Sam","First, raise the alarm, so everyone else gets out. Then pick an extinguisher. Check the Handbook with B if you’re not sure."]]:
        id==="slick"?[["","Slick is spreading across the walkway! An oil spill: a slip hazard."]]:
        [["","Sparky! The distribution board is on fire, and the power is still live."]];
      say(intro,moveMenu);moveMenu(true);
    }
    function moveList(){
      if(B.gym)return ["water","foam","co2","wet"];
      if(B.id==="slick")return ["sign","spill","mop","alarm"];
      if(B.id==="sparky")return ["alarm","isolate","water","co2"];
      return ["alarm","water","co2"];
    }
    function moveMenu(lock){
      const ms=moveList().filter(k=>S.moves.includes(k));
      movesEl.innerHTML='<div class="eq-mgrid">'+ms.map(k=>{const M=MOVE[k];return '<button type="button" data-m="'+k+'"'+(lock?" disabled":"")+'>'+(M.band?'<i class="eq-ext" style="--b:'+M.band+'"></i>':'<i class="eq-dot" style="--c:'+M.col+'"></i>')+'<span>'+esc(M.name)+'</span></button>'}).join("")+'</div>'+
        '<div class="eq-mrow"><button type="button" data-x="inspect"'+(lock?" disabled":"")+'>Inspect</button><button type="button" data-x="book">Handbook</button></div>';
      movesEl.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>use(b.dataset.m));
      movesEl.querySelector('[data-x="inspect"]').onclick=inspect;
      movesEl.querySelector('[data-x="book"]').onclick=openBook;
      if(!lock&&!queue.length)note(B.known?"What will Evia do?":"What will Evia do? Inspect gives you clues.");
    }
    function inspect(){
      if(B.busy)return;const f=B.foe;
      if(B.gym&&!B.inspected){B.inspected=true;return say([["Inspect",f.clue],["Inspect","Which class is that? Your Handbook has the fire classes and the extinguisher chart."]],()=>moveMenu())}
      say([["Inspect",f.name+": "+(B.known||B.inspected?f.type+". ":"")+f.what]],()=>moveMenu());
    }
    function use(k){
      if(B.busy||queue.length)return;B.busy=true;moveMenu(true);B.turn++;
      const f=B.foe,M=MOVE[k],lines=[],isFire=/fire/i.test(f.type);
      lines.push(["","Evia uses "+M.name+"!"]);
      if(k==="alarm"){
        if(!isFire)lines.push(["",f.why.alarm||"No need for that here."]);
        else if(B.alarm)lines.push(["","The alarm is already sounding."]);
        else{B.alarm=true;lines.push(["","The alarm sounds. Everyone heads for the assembly point. Now Evia can tackle it safely."]);if(B.turn===1)S.report.alarmFirst++}
      }else if(k==="isolate"){
        if(B.isolated)lines.push(["","The power’s already off."]);else{B.isolated=true;if(S.report.isolateFirst==null)S.report.isolateFirst=1;lines.push(["","Evia switches off at the isolator. Sparky can’t restart itself now!"])}
      }else if(k==="sign"){
        if(B.sign)lines.push(["","The sign is already out."]);else{B.sign=true;if(S.report.signFirst==null)S.report.signFirst=1;lines.push(["","Wet floor sign out. Nobody else will walk into it."])}
      }else{
        let e=f.eff[k];if(e==null)e=0;
        if(isFire&&!B.alarm&&!B.gym&&!B.tried.warnAlarm){B.tried.warnAlarm=1;lines.push(["Sam","Raise the alarm first next time! Other people need to get out."])}
        if(B.id==="slick"&&k==="spill"&&!B.sign&&S.report.signFirst==null)S.report.signFirst=0;
        if(B.id==="sparky"&&k==="co2"&&!B.isolated){e=2;if(S.report.isolateFirst==null)S.report.isolateFirst=0}
        if(e<0){B.me-=25;S.report.backfires++;if(B.gym)S.report.gymBackfires++;B.shake=16;buzz([40,30,40]);lines.push(["","It backfired! "+(f.why[k]||"Wrong kit for this hazard.")]);B.known=true;learn(k,true)}
        else if(e===0)lines.push(["","It has no effect. "+(f.why[k]||"")]);
        else{const dmg=e===3?55:e===2?34:14;B.hp=Math.max(0,B.hp-dmg);B.hitT=18;buzz(e===3?[15,20,15]:12);
          lines.push(["",e===3?"It’s super effective!":e===2?"It’s effective.":"It’s not very effective…"]);
          if(e===1&&f.why[k])lines.push(["",f.why[k]]);
          if(B.id==="sparky"&&k==="co2"&&!B.isolated&&B.hp>0){B.hp=Math.min(100,B.hp+25);lines.push(["Pat","It’s still live! It keeps restarting. Isolate the power!"])}
          if(e===1&&isFire&&B.hp>0){B.hp=Math.min(100,B.hp+10);lines.push(["",f.name+" flares up again."])}
          if(e>=2)B.known=true}
      }
      if(B.hp<=0)return say(lines,win);
      /* the hazard's turn */
      let hit=f.hit;if(B.id==="slick"&&B.sign)hit=5;if(B.id==="sparky"&&B.isolated)hit=6;
      B.me-=hit;lines.push(["",B.id==="slick"?"Slick spreads further. Evia nearly slips!":B.id==="sparky"?"Sparky crackles and spits!":f.name+" spreads. The heat is building!"]);
      if(B.me<=0)return say(lines,retreat);
      say(lines,()=>{B.busy=false;moveMenu()});
    }
    function retreat(){
      say([["","Evia backs off to safety to regroup. It’s OK to step back and think."],["","Check your Handbook (B), then try again."]],()=>{
        setMode("world");const f=ents.find(e=>e.foe===B.id);B=null;
        const [dx,dy]=DIR[p.face];const bx=p.tx-dx,by=p.ty-dy;if(!solid(bx,by)){p.tx=bx;p.ty=by;p.x=bx*T;p.y=by*T}note("Walk back up to it when you’re ready.")});
    }
    function win(){
      const f=B.foe,id=B.id;gain(30);S.report.fires+=/fire/i.test(f.type)?1:0;
      if(B.gym){
        const nextId=B.gym[B.gi+1];
        say([["",f.name+" is out! It was a "+f.type+"."]],()=>{if(nextId){const g=B.gym;battle(nextId,{gym:g})}else gymWon()});return;
      }
      S.beaten[id]=1;ents=ents.filter(e=>e.foe!==id);
      const lines=[["",f.name+" is dealt with!"]];
      if(id==="blaze"){addMove("foam");lines.push(["","Blaze dropped a Foam extinguisher (cream label)! It’s in your Handbook."],["Sam","Well done. Water was the one for wood and paper. Now, Mo’s on the setting-out gate to the yard."])}
      if(id==="slick"){S.items.push("keys");lines.push(["","Slick dropped a set of keys! The tag says: Electrical compound."],["Jas","Pat’s keys! The compound is behind the fence at the bottom of the yard."])}
      if(id==="sparky"){S.items.push("pass");lines.push(["","Sparky dropped a training cabin pass!"],["Pat","Power stays off now until I’ve tested it. Sam’s running the fire safety check in the training cabin. Go on."])}
      B=null;setMode("world");persist();say(lines,()=>note(""));
    }
    function gymWon(){
      S.f.badge=1;B=null;setMode("world");persist();
      say([["Sam","Three fires, three right answers. That’s your Fire Safety badge!"],["Sam","That’s the end of the demo. Here’s your site report."]],report);
    }
    function report(){
      const r=S.report,rows=[
        ["Raised the alarm before tackling a fire",r.alarmFirst>=2],
        ["Never used kit that backfired",r.backfires===0],
        ["Put the wet floor sign out before cleaning the spill",r.signFirst===1],
        ["Isolated the power before using CO₂ on the electrical fire",r.isolateFirst===1],
        ["Worked out the 3-4-5 gate first time",r.gate345===1],
        ["Fire safety check: no backfires",r.gymBackfires===0]];
      const ok=rows.filter(x=>x[1]).length,stars=ok===rows.length?3:ok>=4?2:1;
      const want=Math.min(25,Math.floor(S.coins)+stars*4),got=want&&R()&&R().gameCoins?R().gameCoins(want):0;ctx.coins();
      over.hidden=false;over.innerHTML='<div class="sr-card"><h2>Site report</h2><p class="sr-sub">The Yard · Fire Safety badge</p><div class="sr-stars">'+[0,1,2].map(k=>'<svg viewBox="0 0 24 24" class="sr-star'+(k<stars?" on":"")+'"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>').join("")+'</div>'+
        '<ul class="sr-why">'+rows.map(x=>'<li class="'+(x[1]?"ok":"")+'">'+esc(x[0])+'</li>').join("")+'</ul><div class="gm-end-coins">'+coinSvg()+'<b>+'+got+'</b><span>'+(got?"coins":"coins (today’s game coins are collected)")+'</span></div>'+
        '<div class="sr-btns"><button type="button" class="primary" data-o="new">Play again</button><button type="button" class="secondary" data-o="close">Done</button></div></div>';
      over.querySelector('[data-o="new"]').onclick=()=>{over.hidden=true;over.innerHTML="";begin(fresh())};
      over.querySelector('[data-o="close"]').onclick=()=>ctx.close();
    }

    /* ---------- The Handbook ---------- */
    let bookFrom="world";
    function openBook(){
      if(!S||mode==="book"||mode==="title")return;bookFrom=mode;setMode("book");
      const sec=(title,list,get)=>'<h3>'+title+'</h3>'+list.map(k=>{const o=get[k],on=S.book[k];return '<div class="eq-card'+(on?"":" locked")+'">'+(on?(o.band?'<i class="eq-ext" style="--b:'+o.band+'"></i>':o.col?'<i class="eq-dot" style="--c:'+o.col+'"></i>':'')+'<div><strong>'+esc(o.name)+(o.type?' · '+esc(o.type):"")+'</strong><p>'+esc(o.info||o.what)+'</p>'+(o.eff?'<p class="eq-eff">'+Object.keys(o.eff).filter(m=>S.book[m]).map(m=>'<span class="e'+o.eff[m]+'">'+esc(MOVE[m].name)+'</span>').join("")+'</p>':"")+'</div>':'<div><strong>???</strong><p>Not found yet.</p></div>')+'</div>'}).join("");
      over.hidden=false;over.innerHTML='<div class="eq-book"><header><strong>Site Handbook</strong><button type="button" class="eq-close">Close</button></header><div class="eq-book-body">'+
        sec("Rules and know-how",["ppe","classes","chart","r345"],RULES)+sec("Hazards met",["blaze","slick","sparky","fuel","chip","card"],FOES)+sec("Kit and moves",["alarm","water","foam","co2","wet","sign","spill","mop","isolate"],MOVE)+
        '<p class="eq-key"><span class="e3">Super effective</span><span class="e2">Effective</span><span class="e1">Not very effective</span><span class="e-1">Backfires</span></p></div></div>';
      over.querySelector(".eq-close").onclick=closeBook;
    }
    function closeBook(){over.hidden=true;over.innerHTML="";setMode(bookFrom)}

    /* ---------- Title ---------- */
    function title(){
      setMode("title");const s=load();
      over.hidden=false;over.innerHTML='<div class="sr-card"><button type="button" class="sr-x sr-cx" aria-label="Close">×</button><h2>Evia’s Site Quest</h2><p>Demo: The Yard. Explore the site, face hazards with the right kit, and fill your Site Handbook.</p>'+
        '<div class="sr-btns">'+(s&&s.f&&s.f.started&&!s.f.badge?'<button type="button" class="primary" data-t="cont">Continue</button>':"")+'<button type="button" class="'+(s&&s.f&&s.f.started&&!s.f.badge?"secondary":"primary")+'" data-t="new">New game</button></div>'+
        '<p class="eq-how">◀ ▲ ▼ ▶ to move · A to talk and use · B for your Handbook</p></div>';
      over.querySelector(".sr-cx").onclick=()=>ctx.close();
      const c=over.querySelector('[data-t="cont"]');if(c)c.onclick=()=>{over.hidden=true;over.innerHTML="";begin(s)};
      over.querySelector('[data-t="new"]').onclick=()=>{over.hidden=true;over.innerHTML="";begin(fresh())};
    }

    /* ---------- Drawing ---------- */
    const rr=(x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)};
    function tile(x,y,c){
      const X=x*T,Y=y*T;
      const floor={".":"#e6dfd1",g:"#cfe0bf","=":"#cde6d1"}[c]||"#e6dfd1";g.fillStyle=floor;g.fillRect(X,Y,T+.3,T+.3);
      if(c==="."&&(x*7+y*3)%4===0){g.fillStyle="#d6cdbb";g.fillRect(X+4,Y+6,1.5,1.5);g.fillRect(X+11,Y+11,1.5,1.5)}
      if(c==="g"&&(x+y)%2){g.fillStyle="#bfd4ad";g.fillRect(X+3,Y+4,1.5,3);g.fillRect(X+10,Y+9,1.5,3)}
      if(c==="="){g.fillStyle="#fff";const r=map[y],up=(map[y-1]||[])[x],dn=(map[y+1]||[])[x];if(up!=="=")g.fillRect(X,Y,T,1.2);if(dn!=="=")g.fillRect(X,Y+T-1.2,T,1.2);if(r[x-1]!=="="&&up!=="="&&dn!=="=")g.fillRect(X,Y,1.2,T)}
    }
    function block(x,y,c){
      const X=x*T,Y=y*T;
      if(c==="x"){g.fillStyle="#e6dfd1";g.fillRect(X,Y,T+.3,T+.3);g.strokeStyle="#98a3b0";g.lineWidth=.8;g.beginPath();for(let k=2;k<T;k+=3){g.moveTo(X+k,Y-4);g.lineTo(X+k,Y+T-2)}g.stroke();g.fillStyle="#8d99a8";g.fillRect(X,Y-4,T,1.4);g.fillRect(X,Y+T-3,T,1.4);return}
      if(c==="G"||c==="L"){g.fillStyle="#e6dfd1";g.fillRect(X,Y,T,T);g.fillStyle=c==="G"?"#f59e0b":"#dc2626";rr(X+1,Y-3,T-2,T+1,2);g.fill();g.fillStyle="#fff";g.font="700 5px system-ui,sans-serif";g.textAlign="center";g.fillText(c==="G"?"3-4-5":"LOCK",X+8,Y+6);return}
      const col={"#":["#8f9bab","#6f7b8a"],O:["#d4dbe3","#aab4bf"],S:["#6f8a78","#56705f"],E:["#9aa3ad","#6b7684"],P:["#c79b62","#9c7338"],N:["#f5b800","#c79200"],T:["#e2e8f0","#b8c2cd"],b:["#b8674b","#8e4d37"]}[c]||["#8f9bab","#6f7b8a"];
      const h=c==="P"||c==="b"||c==="N"?4:6;g.fillStyle=col[1];g.fillRect(X,Y+T-h,T+.3,h);g.fillStyle=col[0];g.fillRect(X,Y-h,T+.3,T);
      if(c==="b"){g.strokeStyle="rgba(255,255,255,.45)";g.lineWidth=.6;g.beginPath();for(let k=0;k<T;k+=4){g.moveTo(X,Y-h+k);g.lineTo(X+T,Y-h+k)}g.stroke()}
    }
    function label(txt,x,y,col){g.fillStyle=col||"#475569";g.font="700 5px system-ui,sans-serif";g.textAlign="center";g.fillText(txt,x,y)}
    function person(x,y,hat,t){
      const X=x+8,Y=y+8,b=Math.sin(t*3)*.4;g.fillStyle="rgba(15,23,42,.14)";g.beginPath();g.ellipse(X,Y+6,5,1.6,0,0,Math.PI*2);g.fill();
      g.fillStyle="#3f4a57";g.fillRect(X-3,Y+2,2.4,4);g.fillRect(X+.6,Y+2,2.4,4);g.fillStyle="#fb8c1a";rr(X-4,Y-4+b,8,7,2);g.fill();g.fillStyle="#e8ecef";g.fillRect(X-4,Y+b,8,1);
      g.fillStyle="#f1c8a5";g.beginPath();g.arc(X,Y-6.5+b,3,0,Math.PI*2);g.fill();g.fillStyle=hat;g.beginPath();g.arc(X,Y-7.5+b,3.4,Math.PI,0);g.fill();g.fillRect(X-4.4,Y-7.8+b,8.8,1.2);
    }
    function foeSprite(id,x,y,s,t){
      const f=FOES[id];g.save();g.translate(x,y);g.scale(s,s);
      if(id==="slick"){g.fillStyle="#1f2937";g.beginPath();g.ellipse(0,3,8,3.4,0,0,Math.PI*2);g.fill();g.fillStyle="rgba(148,163,184,.5)";g.beginPath();g.ellipse(-2,2,3,1,0,0,Math.PI*2);g.fill();
        g.fillStyle="#fff";g.beginPath();g.arc(-2.4,1,1.5,0,Math.PI*2);g.arc(2.4,1,1.5,0,Math.PI*2);g.fill();g.fillStyle="#111";g.beginPath();g.arc(-2.2,1.2,.7,0,Math.PI*2);g.arc(2.6,1.2,.7,0,Math.PI*2);g.fill()}
      else if(id==="sparky"){const w=Math.sin(t*20)*.6;g.fillStyle="#fde047";g.beginPath();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?4:7+w;g.lineTo(Math.cos(a)*r,Math.sin(a)*r-1)}g.closePath();g.fill();g.strokeStyle="#ca8a04";g.lineWidth=.6;g.stroke();
        g.fillStyle="#111";g.fillRect(-2.8,-2.4,1.2,1.8);g.fillRect(1.6,-2.4,1.2,1.8);g.strokeStyle="#111";g.lineWidth=.6;g.beginPath();g.moveTo(-2,1.4);g.lineTo(-.7,.6);g.lineTo(.6,1.4);g.lineTo(2,.6);g.stroke()}
      else{const w=Math.sin(t*9);g.fillStyle=f.col;g.beginPath();g.moveTo(-6,5);g.quadraticCurveTo(-7,-2,-2,-6-w);g.quadraticCurveTo(-1,-2,0,-9+w);g.quadraticCurveTo(2,-3,3,-6-w*.6);g.quadraticCurveTo(7,-1,6,5);g.closePath();g.fill();
        g.fillStyle="#fde047";g.beginPath();g.moveTo(-3.6,5);g.quadraticCurveTo(-4,0,-.6,-3-w*.6);g.quadraticCurveTo(3,0,3.6,5);g.closePath();g.fill();
        g.fillStyle="#111";g.beginPath();g.arc(-1.6,1.4,.8,0,Math.PI*2);g.arc(1.6,1.4,.8,0,Math.PI*2);g.fill()}
      g.restore();
    }
    function evia(x,y,face,s,back){
      const t=performance.now()/1000;g.save();g.translate(x,y);g.scale(s,s);
      g.fillStyle="rgba(15,23,42,.14)";g.beginPath();g.ellipse(0,6.5,5,1.6,0,0,Math.PI*2);g.fill();
      if(S&&S.f.inducted){g.fillStyle="#2f343a";g.fillRect(-4,5,3,2);g.fillRect(1,5,3,2)}
      const b=new Path2D();b.arc(0,0,6,0,Math.PI*2);g.fillStyle="#fff";g.fill(b);
      if(S&&S.f.inducted){g.save();g.clip(b);g.fillStyle="#fb8c1a";g.fillRect(-7,2,14,5);g.fillStyle="#e8ecef";g.fillRect(-7,3.2,14,.9);g.fillRect(-7,5,14,.9);g.restore()}
      g.strokeStyle=accent;g.lineWidth=1.3;g.stroke(b);
      if(!back&&face!=="u"){const ex=face==="l"?-1.4:face==="r"?1.4:0;g.strokeStyle=accent;g.lineWidth=1;g.lineCap="round";g.beginPath();g.moveTo(-1.8+ex,-2);g.lineTo(-1.8+ex,.2);g.moveTo(1.8+ex,-2);g.lineTo(1.8+ex,.2);g.stroke()}
      if(S&&S.f.inducted){g.fillStyle="#f5b800";g.beginPath();g.arc(0,-4,4.6,Math.PI,0);g.closePath();g.fill();g.fillStyle="#e2a700";g.fillRect(-6,-4.4,12,1.2)}
      g.restore();
    }
    function drawWorld(t){
      const vw=W/scale,vh=H/scale,mw=24*T,mh=20*T;
      const tx=p.x+8-vw/2,ty=p.y+8-vh/2;camX=Math.max(-8,Math.min(mw-vw+8,tx));camY=Math.max(-8,Math.min(mh-vh+8,ty));
      g.save();g.scale(scale,scale);g.translate(-Math.round(camX*scale)/scale,-Math.round(camY*scale)/scale);
      const x0=Math.max(0,Math.floor(camX/T)-1),x1=Math.min(23,Math.ceil((camX+vw)/T)+1),y0=Math.max(0,Math.floor(camY/T)-1),y1=Math.min(19,Math.ceil((camY+vh)/T)+1);
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=map[y][x];tile(x,y,SOLID.has(c)?".":c)}
      const list=[];
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=map[y][x];if(SOLID.has(c))list.push([y*T+T,()=>block(x,y,c)])}
      for(const e of ents)list.push([e.ty*T+T+.5,()=>drawEnt(e,t)]);
      list.push([p.y+T+.6,()=>evia(p.x+8,p.y+8,p.face,1)]);
      list.sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
      label("SITE OFFICE",4.5*T,2*T-1);label("STORES",16*T,2*T-1,"#fff");label("TRAINING CABIN",6*T,14*T-1);label("ELECTRICAL",18.5*T,14*T-1,"#fff");
      g.restore();
    }
    function drawEnt(e,t){
      const X=e.tx*T,Y=e.ty*T;
      if(e.kind==="npc")return person(X,Y,e.hat,t+e.tx);
      if(e.kind==="coin"){const s=Math.abs(Math.cos(t*3+e.tx));g.fillStyle="#f5b800";g.strokeStyle="#b07f00";g.lineWidth=.6;g.beginPath();g.ellipse(X+8,Y+8,3.4*Math.max(.3,s),3.4,0,0,Math.PI*2);g.fill();g.stroke();return}
      if(e.kind==="foe"){g.fillStyle="rgba(15,23,42,.15)";g.beginPath();g.ellipse(X+8,Y+14,6,1.8,0,0,Math.PI*2);g.fill();
        if(e.foe==="blaze"){g.fillStyle="#6b7280";rr(X+3,Y+7,10,8,1.5);g.fill()}
        if(e.foe==="sparky"){g.fillStyle="#9aa3ad";rr(X+2,Y+1,12,13,1.5);g.fill()}
        foeSprite(e.foe,X+8,Y+(e.foe==="slick"?10:6),e.foe==="slick"?1:.8,t);return}
      if(e.kind==="fp"){g.fillStyle="#dc2626";rr(X+3,Y+1,10,4,1);g.fill();g.fillStyle="#d62828";rr(X+4,Y+6,3,8,1);g.fill();rr(X+9,Y+6,3,8,1);g.fill();g.fillStyle="#1f2328";g.fillRect(X+9,Y+8,3,2);return}
      if(e.kind==="door"){g.fillStyle="#8b6b4a";g.fillRect(X+3,Y-6,10,8);g.fillStyle=S.items.includes("pass")?"#16a34a":"#dc2626";g.fillRect(X+11,Y-3,1.5,1.5);return}
      if(e.kind==="notice"){g.fillStyle="#8d6a3e";g.fillRect(X+7,Y+6,2,8);g.fillStyle="#fff";g.strokeStyle="#0b5cad";g.lineWidth=.8;g.fillRect(X+2,Y,12,7);g.strokeRect(X+2,Y,12,7);g.fillStyle="#9aa3ad";g.fillRect(X+4,Y+2,8,.8);g.fillRect(X+4,Y+4,6,.8);return}
    }
    function drawBattle(t){
      const f=B.foe,vw=W/scale,vh=H/scale;
      g.save();g.scale(scale,scale);
      const sky=g.createLinearGradient(0,0,0,vh);sky.addColorStop(0,"#eef2f6");sky.addColorStop(1,"#e2dccf");g.fillStyle=sky;g.fillRect(0,0,vw,vh);
      g.fillStyle="#d9e0e7";g.fillRect(vw*.05,vh*.18,vw*.12,vh*.3);g.fillRect(vw*.72,vh*.08,vw*.1,vh*.25);
      const ex=vw*.72,ey=vh*.36,mx=vw*.28,my=vh*.78;
      g.fillStyle="#cdc4b2";g.beginPath();g.ellipse(ex,ey+12,vw*.2,5,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(mx,my+8,vw*.2,5,0,0,Math.PI*2);g.fill();
      if(B.hp>0){const shake=B.hitT>0?Math.sin(B.hitT)*2:0;g.globalAlpha=B.hitT>0&&Math.floor(B.hitT/3)%2?.5:1;foeSprite(B.id,ex+shake,ey,2.6,t);g.globalAlpha=1}
      const sh=B.shake>0?Math.sin(B.shake*1.3)*2:0;evia(mx+sh,my-6,"r",2.4,true);
      /* the two cards: the hazard (top left) and Evia (bottom right), like the classic battle screen */
      const bar=(x,y,w,name,sub,v,col)=>{g.fillStyle="rgba(255,255,255,.94)";rr(x,y,w,20,4);g.fill();g.strokeStyle="rgba(15,23,42,.12)";g.lineWidth=.6;g.stroke();
        g.fillStyle="#1f2937";g.font="800 6.5px system-ui,sans-serif";g.textAlign="left";g.fillText(name,x+5,y+8);g.fillStyle="#6b7280";g.font="600 4.8px system-ui,sans-serif";g.fillText(sub,x+5,y+14);
        g.fillStyle="#e5e7eb";rr(x+5,y+15.5,w-10,2.6,1.3);g.fill();g.fillStyle=v>50?col:v>25?"#f59e0b":"#dc2626";rr(x+5,y+15.5,Math.max(0,(w-10)*v/100),2.6,1.3);g.fill()};
      const nm=B.gym&&!B.known?"??? fire":f.name,sub=B.gym&&!B.known?"Inspect for clues":f.type;
      bar(6,6,Math.min(96,vw*.5),nm,sub,B.hp,"#f97316");
      bar(vw-Math.min(96,vw*.5)-6,vh-28,Math.min(96,vw*.5),"Evia  Lv "+S.lv,"Safety",Math.max(0,B.me),"#16a34a");
      g.restore();
      if(B.hitT>0)B.hitT-=1;if(B.shake>0)B.shake-=1;
    }
    function frame(now){
      raf=requestAnimationFrame(frame);
      const dt=Math.min(2,(now-(last||now))/16.67);last=now;const t=now/1000;
      g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle="#eef1f4";g.fillRect(0,0,W,H);
      if(!S)return;
      if(mode==="world")step(dt);
      if(B&&(mode==="battle"||(mode==="book"&&bookFrom==="battle")))drawBattle(t);else drawWorld(t);
      const l=aLabel();if(aLab.textContent!==l)aLab.textContent=l;
    }
    ctx.o.eqState=()=>({S,p,mode,B,ents,queue});   /* for the tests */
    title();raf=requestAnimationFrame(frame);
  }

  G.register({id:"game-quest",key:"quest",label:"Evia’s Site Quest",rarity:"epic",about:"Explore the site, face hazards with the right kit and fill your Site Handbook."},run,
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>');
})();
