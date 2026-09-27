/* Evia's Site Quest: a top-down adventure. The game comes first: Evia explores the site, talks to people, picks things
   up and uses them. Site safety is how the world works, not a quiz: the turnstile needs the pass from the induction,
   the cutting area's dust makes her cough without a mask, a reversing dumper can't see anyone behind it, a fire needs
   the alarm raising and the right extinguisher (the wrong one just doesn't work), and the Big Mixer has to be stopped,
   isolated and tagged. The game quietly notes what she did, and the site manager's report at the end is the
   assessment. Running out of hearts only sends her back to the last checkpoint.
   Area 1, "The compound": site office induction, the yard, the stores, a skip fire, the cutting area, the Big Mixer.
   Controls: drag anywhere to move (or arrows/WASD); A to talk, read, take or use (Space/Z); B to use what she's
   holding (X). Unlocked in Rewards (epic); coins go through the game's daily cap in rewards.js. */
(function(){
  const G=window.eviaGames;if(!G||!G.register)return;
  const {esc,buzz,reduced}=G,R=()=>window.eviaRewards;
  const coinSvg=()=>R()&&R().coin?R().coin():"";
  const KEY="evia7-sitequest";
  const T=32,SPEED=2.4,PR=10;       /* tile size; Evia's speed and half-size, in world units */

  /* ---------- Maps ---------- */
  const SOLID=new Set("#xOSWPkbTrdL");
  function grid(w,h,c){return Array.from({length:h},()=>Array(w).fill(c))}
  function rect(m,x,y,w,h,c){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(m[j]&&m[j][i]!=null)m[j][i]=c}
  function yardMap(){
    const m=grid(52,26,".");
    rect(m,0,0,52,1,"#");rect(m,0,25,52,1,"#");rect(m,0,0,1,26,"#");rect(m,51,0,1,26,"#");
    /* outside the site: the office, the assembly point */
    rect(m,1,1,9,2,"g");rect(m,2,4,6,4,"O");m[7][4]="D";rect(m,2,20,3,3,"a");
    rect(m,10,1,1,24,"#");m[12][10]="T";
    /* the yard: green walkway, stores, pallets, road behind a barrier, welfare cabin, an old brick wall */
    rect(m,11,12,16,1,"=");rect(m,16,5,1,7,"=");
    rect(m,13,2,7,3,"S");rect(m,21,3,3,2,"P");
    rect(m,11,14,15,1,"x");m[14][12]=".";
    rect(m,11,15,15,4,"-");
    rect(m,16,20,5,4,"W");
    rect(m,11,20,4,1,"b");rect(m,14,21,1,4,"b");
    rect(m,23,9,2,2,"k");
    /* the cutting area (dusty), then the work area where the mixer is */
    rect(m,26,1,1,24,"x");m[12][26]="=";rect(m,27,1,8,24,"c");
    rect(m,29,5,1,3,"r");rect(m,32,14,1,3,"r");rect(m,29,18,2,1,"r");
    rect(m,35,1,1,24,"x");m[20][35]="c";rect(m,36,1,15,24,"m");
    return m;
  }
  function officeMap(){
    const m=grid(12,9,"_");rect(m,0,0,12,1,"#");rect(m,0,8,12,1,"#");rect(m,0,0,1,9,"#");rect(m,11,0,1,9,"#");
    rect(m,4,4,3,1,"d");m[8][5]="D";return m;
  }

  /* ---------- Saved progress ---------- */
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(_){return {}}};
  const save=o=>{try{localStorage.setItem(KEY,JSON.stringify(Object.assign(load(),o)))}catch(_){}};

  const ITEM={water:{name:"Water extinguisher",band:"#d62828"},co2:{name:"CO₂ extinguisher",band:"#1f2328"},foam:{name:"Foam extinguisher",band:"#f1dfae"},bolster:{name:"Bolster and club hammer"}};

  function run(ctx){
    ctx.body.innerHTML='<div class="sq"><canvas aria-label="Evia’s Site Quest"></canvas>'+
      '<div class="sq-hud"><div class="sq-hearts"></div><div class="sq-goal"></div><span class="sq-coins">'+coinSvg()+'<b>0</b></span><button type="button" class="sq-x" aria-label="Close">×</button></div>'+
      '<div class="sq-toast" role="status" aria-live="polite"></div>'+
      '<div class="sq-touch"></div><div class="sq-stick" hidden><i></i></div>'+
      '<div class="sq-btns"><button type="button" class="sq-b" aria-label="Use what you’re holding" hidden></button><button type="button" class="sq-a" aria-label="Action">A</button></div>'+
      '<div class="sq-talk" hidden></div><div class="sq-menu"></div></div>';
    const $=s=>ctx.body.querySelector(s);
    const wrap=$(".sq"),cv=$("canvas"),g=cv.getContext("2d"),menu=$(".sq-menu"),talkEl=$(".sq-talk"),toastEl=$(".sq-toast"),aBtn=$(".sq-a"),bBtn=$(".sq-b"),stickEl=$(".sq-stick");
    const accent=getComputedStyle(document.documentElement).getPropertyValue("--yellow").trim()||"#f5c400";
    let W=0,H=0,dpr=1,scale=1,camX=0,camY=0,raf=0,last=0,state="menu";
    const size=()=>{const r=wrap.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+"px";cv.style.height=H+"px";
      scale=W>=H?H/(11*T):W/(9*T);wrap.classList.toggle("port",W<H)};
    size();const ro=new ResizeObserver(size);ro.observe(wrap);

    /* ---------- Input: drag to move, A and B ---------- */
    const mv={x:0,y:0},keys={};let stickId=null,sx0=0,sy0=0,aHeld=false,bHeld=false;
    const touch=$(".sq-touch");
    touch.addEventListener("pointerdown",e=>{if(state!=="play"||stickId!=null)return;e.preventDefault();stickId=e.pointerId;sx0=e.clientX;sy0=e.clientY;try{touch.setPointerCapture(e.pointerId)}catch(_){}
      const r=wrap.getBoundingClientRect();stickEl.style.left=(sx0-r.left)+"px";stickEl.style.top=(sy0-r.top)+"px";stickEl.hidden=false;stickEl.firstChild.style.transform="";mv.x=mv.y=0});
    touch.addEventListener("pointermove",e=>{if(e.pointerId!==stickId)return;let dx=e.clientX-sx0,dy=e.clientY-sy0;const d=Math.hypot(dx,dy),m=46;if(d>m){dx*=m/d;dy*=m/d}
      stickEl.firstChild.style.transform="translate("+dx+"px,"+dy+"px)";const k=Math.min(1,d/m);mv.x=d>6?dx/Math.max(d,1)*Math.max(k,.35):0;mv.y=d>6?dy/Math.max(d,1)*Math.max(k,.35):0});
    const endStick=e=>{if(e.pointerId!==stickId)return;stickId=null;mv.x=mv.y=0;stickEl.hidden=true};
    ["pointerup","pointercancel","lostpointercapture"].forEach(ev=>touch.addEventListener(ev,endStick));
    aBtn.addEventListener("pointerdown",e=>{e.preventDefault();pressA()});
    bBtn.addEventListener("pointerdown",e=>{e.preventDefault();if(e.target.closest("i")){cycle();return}bHeld=true;bBtn.classList.add("on");useB(true)});
    ["pointerup","pointercancel","pointerleave"].forEach(ev=>bBtn.addEventListener(ev,()=>{bHeld=false;bBtn.classList.remove("on")}));
    talkEl.addEventListener("pointerdown",e=>{e.preventDefault();nextTalk()});
    const kd=e=>{
      if(state==="talk"&&/^(Space|Enter|KeyZ)$/.test(e.code)){e.preventDefault();if(!e.repeat)nextTalk();return}
      if(state!=="play")return;
      if(/^(Arrow|Key[WASD]$)/.test(e.code)){keys[e.code]=1;e.preventDefault()}
      if(/^(Space|Enter|KeyZ)$/.test(e.code)&&!e.repeat){e.preventDefault();pressA()}
      if(e.code==="KeyX"&&!e.repeat){bHeld=true;useB(true)}
      if(e.code==="KeyC"&&!e.repeat)cycle()};
    const ku=e=>{keys[e.code]=0;if(e.code==="KeyX")bHeld=false};
    document.addEventListener("keydown",kd);document.addEventListener("keyup",ku);
    $(".sq-x").onclick=()=>ctx.close();
    ctx.stops.push(()=>{cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener("keydown",kd);document.removeEventListener("keyup",ku)});

    /* ---------- The world ---------- */
    let S=null,maps=null,map=null,mapName="",ents=[],p=null;
    const tile=(tx,ty)=>(map[ty]&&map[ty][tx])||"#";
    function fresh(){
      maps={yard:yardMap(),office:officeMap()};
      S={pass:false,ppe:{},tour:{},items:[],held:-1,alarm:false,sprayedBeforeAlarm:false,usedCO2:false,fireOn:false,fireOut:false,dustHit:false,dumperHit:0,
        boss:{on:false,hp:3,done:false,tagged:false},coins:0,hearts:3,maxHearts:3,cp:{map:"yard",x:3.5*T,y:22.5*T},start:performance.now(),got:{}};
      p={x:3.5*T,y:22.5*T,fx:0,fy:-1,inv:0,slow:0,cough:0,walk:0};
      go("yard",p.x,p.y);
    }
    /* Everything you can walk up to. act(): what A does; label: what the A button says. */
    function entsFor(name){
      const E=[];const at=(x,y)=>({x:(x+.5)*T,y:(y+.5)*T});
      const coin=(x,y,id)=>{if(!S.got[id])E.push(Object.assign(at(x,y),{kind:"coin",id}))};
      if(name==="office"){
        E.push(Object.assign(at(8,3),{kind:"npc",who:"Sam",hat:"#fff",solid:1,label:"Talk",act:talkSam}));
        E.push(Object.assign(at(2,1),{kind:"aid",wall:1,label:"Look",act:()=>tourItem("aid","First aid kit: the green box with the white cross. The first aider’s name is on the notice next to it.")}));
        E.push(Object.assign(at(10,1),{kind:"firepoint",wall:1,label:"Look",act:()=>tourItem("fire","Fire point: the extinguishers and the fire alarm. Know where they are before you need them.")}));
        E.push(Object.assign(at(6,1),{kind:"notice",wall:1,label:"Read",act:()=>tourItem("notice","Fire action notice: raise the alarm, leave by the nearest exit, and go to the fire assembly point by the gate.")}));
        return E;
      }
      E.push(Object.assign(at(8.6,11),{kind:"board",solid:1,label:"Read",act:()=>say([["Site rules","Hard hat, hi-vis and safety boots at all times. Visitors and new starters sign in at the site office."]])}));
      E.push(Object.assign(at(10,12),{kind:"turnstile",label:"Use",act:()=>{if(S.pass){toast("Pass accepted.")}else say([["Turnstile","It needs a site pass. New starters sign in at the site office first."]])}}));
      E.push(Object.assign(at(3.5,19.2),{kind:"assembly",label:"Read",act:()=>say([["Fire assembly point","If the alarm sounds, stop work, leave the site and wait here to be counted."]])}));
      E.push(Object.assign(at(16,5.3),{kind:"npc",who:"Jas",hat:"#2f6fcf",solid:1,label:"Talk",act:talkJas}));
      if(!S.items.includes("bolster")&&!S.got.bolster)E.push(Object.assign(at(22,6),{kind:"item",item:"bolster",label:"Take",act:e=>take(e)}));
      E.push(Object.assign(at(18.2,10.2),{kind:"callpoint",label:"Press",act:raiseAlarm}));
      ["water","co2","foam"].forEach((k,i)=>E.push(Object.assign(at(19.6+i*.8,10.3),{kind:"ext",item:k,label:"Take",act:e=>takeExt(e)})));
      E.push(Object.assign(at(24,13.2),{kind:"sign",sign:"mask",label:"Read",act:()=>say([["Sign","Respiratory protection must be worn. Cutting in progress."]])}));
      E.push(Object.assign(at(31,9),{kind:"npc",who:"Kai",hat:"#2f6fcf",solid:1,cutter:1,label:"Talk",act:()=>say([["Kai",S.ppe.mask?"Mask on? Good. The water on the saw keeps most of the dust down too.":"You shouldn’t be in here without a mask! Silica dust wrecks your lungs."]])}));
      E.push(Object.assign(at(18,17),{kind:"dumper",x0:12.5*T,x1:23.5*T,dir:1,t:0,stop:false}));
      if(!S.got.heart)E.push(Object.assign(at(12,22.5),{kind:"heart",id:"heart",label:"Take",act:e=>{S.got.heart=1;S.maxHearts=4;S.hearts=4;drop(e);toast("A heart! Evia can take one more knock now.");hud()}}));
      if(!S.fireOut)E.push(Object.assign(at(25,12.3),{kind:"fire",hp:100,t:0,solid:1,w:3*T,h:3*T,hidden:!S.fireOn}));
      if(!S.boss.done||!S.boss.tagged)E.push(Object.assign(at(43,11),{kind:"mixer",solid:1,w:56,h:48,t:0,vx:0,vy:0,tx:0,ty:0,stall:0,volley:120,blobs:[],puddles:[]}));
      if(S.boss.done)E.push(Object.assign(at(37,21),{kind:"npc",who:"Dee",hat:"#1f2937",solid:1,label:"Talk",act:talkDee}));
      /* coins: along the way, in corners and behind the old wall */
      [[13,12],[15,12],[18,12],[21,12],[16,8],[16,10],[24,6],[20,6],[12,3],[25,3],[12,16],[24,16],[22,19],[11,21],[12,21],[13,21],[11,23],[13,23],
       [28,3],[33,3],[28,22],[33,22],[31,12],[38,4],[48,4],[38,23],[48,23],[43,3],[43,22],[6,13],[8,23],[5,10]].forEach(([x,y],i)=>coin(x,y,"c"+i));
      return E;
    }
    function go(name,x,y){map=maps[name];mapName=name;ents=entsFor(name);p.x=x;p.y=y;camX=null;parts.length=0}
    const drop=e=>{ents=ents.filter(x=>x!==e)};
    const byKind=k=>ents.find(e=>e.kind===k);

    /* ---------- The story ---------- */
    function goal(){
      if(!S.pass){const n=Object.keys(S.tour).length;return mapName==="office"?(n<3?"Find the first aid kit, the fire point and the fire action notice ("+n+" of 3)":"Tell Sam you’ve found them"):"Sign in at the site office"}
      if(!S.ppe.mask)return "Go through the turnstile and find the stores";
      if(S.fireOn&&!S.fireOut)return S.alarm?"Put out the fire in the skip":"Fire! Raise the alarm";
      if(!S.boss.on&&!S.boss.done)return "Get through the cutting area to the work area";
      if(!S.boss.done)return "Stop the Big Mixer: wait for it to stall, then pull the lever";
      if(!S.boss.tagged)return "Isolate the mixer and tag it";
      return "Done! Talk to Dee";
    }
    function talkSam(){
      if(S.pass)return say([["Sam","Stay on the green walkway, and keep your PPE on. Off you go."]]);
      const n=Object.keys(S.tour).length;
      if(!n&&!S.met){S.met=1;return say([["Sam","Morning! I’m Sam, the site manager. Before you go on site, you need your induction."],["Sam","Show me you know where three things are in here: the first aid kit, the fire point and the fire action notice."]])}
      if(n<3)return say([["Sam","Found "+n+" of 3. Have a look round the walls."]]);
      S.pass=true;S.ppe.hat=S.ppe.vis=S.ppe.boots=true;buzz([15,30,15]);hud();
      say([["Sam","That’s your induction done. Here’s your site pass."],["Sam","And your PPE: hard hat, hi-vis and safety boots. On at all times on site."],["Sam","One more thing: stay on the green walkway. The dumper can’t see anyone behind it when it reverses."]]);
    }
    function tourItem(k,text){if(!S.tour[k]){S.tour[k]=1;buzz(10)}say([["Induction",text]])}
    function talkJas(){
      if(S.ppe.mask)return say([["Jas","There’s an old wall by the welfare cabin nobody’s knocked through. The bolster’s on the pallets if you fancy it."]]);
      S.ppe.mask=true;hud();
      say([["Jas","Heading for the cutting area? They’re cutting blocks, so there’s silica dust."],["Jas","Here: an FFP3 mask. Make sure it fits snugly."],["Jas","And there’s an old wall by the welfare cabin nobody’s knocked through. The bolster’s on the pallets."]],()=>setTimeout(startFire,1500));
    }
    function startFire(){const f=byKind("fire");if(!f||S.fireOn)return;S.fireOn=true;f.hidden=false;buzz([30,40,30]);toast("Smoke! The waste skip by the walkway is on fire.",1)}
    function raiseAlarm(){
      if(S.alarm)return toast("The alarm’s already sounding.");
      S.alarm=true;buzz([40,30,40]);
      if(S.fireOn&&!S.fireOut)say([["Fire alarm","Alarm raised. Everyone else heads for the assembly point."],["","It’s a small fire. If it’s safe, you can tackle it with the right extinguisher from the fire point."]]);
      else say([["Fire alarm","You pressed the fire alarm with no fire! Only use it in an emergency."]]);
    }
    function talkDee(){
      if(!S.boss.tagged)return say([["Dee","It’s stopped, but it could start again. Isolate it and put a Do Not Use tag on it."]]);
      say([["Dee","Machine stopped, isolated and tagged. That’s the compound sorted."]],finishArea);
    }
    function take(e){S.items.push(e.item);S.got[e.item]=1;S.held=S.items.length-1;drop(e);toast("Got the "+ITEM[e.item].name.toLowerCase()+". Press B to use it.");hud()}
    function takeExt(e){
      const i=S.items.findIndex(k=>ITEM[k].band);
      if(i>=0){if(S.items[i]===e.item)return;S.items.splice(i,1)}
      S.items.push(e.item);S.held=S.items.length-1;toast("You take the "+ITEM[e.item].name+".");hud();
    }
    function cycle(){if(S.items.length>1){S.held=(S.held+1)%S.items.length;hud()}}

    /* ---------- Talking ---------- */
    let lines=[],after=null;
    function say(ls,then){lines=ls.slice();after=then||null;state="talk";mv.x=mv.y=0;stickEl.hidden=true;stickId=null;showLine()}
    function showLine(){const [who,text]=lines[0];talkEl.hidden=false;talkEl.innerHTML=(who?'<b>'+esc(who)+'</b>':"")+'<p>'+esc(text)+'</p><small>Tap to carry on</small>'}
    function nextTalk(){if(state!=="talk")return;lines.shift();if(lines.length)return showLine();talkEl.hidden=true;state="play";last=performance.now();const f=after;after=null;if(f)f()}

    /* ---------- A and B ---------- */
    function target(){
      let best=null,bd=1e9;
      for(const e of ents){if(!e.act||e.hidden)continue;const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy),reach=e.wall?40:e.kind==="npc"?46:30;
        if(d>reach+(e.w?e.w/2:0))continue;const face=(dx*p.fx+dy*p.fy)/(d||1);const score=d-face*14;if(score<bd){bd=score;best=e}}
      const m=byKind("mixer");if(m&&S.boss.on){const lx=m.x-38,ly=m.y;if(Math.hypot(lx-p.x,ly-p.y)<34&&(m.stall>0||S.boss.done))return {lever:1,label:S.boss.done?"Tag":"Pull"}}
      return best;
    }
    function pressA(){
      if(state==="talk")return nextTalk();if(state!=="play")return;
      const t=target();if(!t)return;
      if(t.lever)return pullLever();
      t.act(t);
    }
    /* B: spray the extinguisher (while held) or swing the bolster at what's in front. */
    function useB(first){
      if(state!=="play"||S.held<0)return;const it=S.items[S.held];
      if(it==="bolster"&&first){
        const tx=Math.floor((p.x+p.fx*26)/T),ty=Math.floor((p.y+p.fy*26)/T);buzz(12);
        if(tile(tx,ty)==="b"){for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(tile(tx+i,ty+j)==="b"&&Math.abs(i)+Math.abs(j)<=1)map[ty+j][tx+i]=".";burst((tx+.5)*T,(ty+.5)*T,"#b5654a",24,5);toast("The old wall comes down.")}
        else{burst(p.x+p.fx*24,p.y+p.fy*24,"#9aa3ad",4,2)}
      }
    }
    function spray(dt){
      const it=S.items[S.held];if(!ITEM[it]||!ITEM[it].band)return;
      const col=it==="water"?"#bfdbfe":it==="foam"?"#fff7e0":"#e5e7eb";
      for(let i=0;i<2;i++)parts.push({x:p.x+p.fx*14,y:p.y+p.fy*14,vx:p.fx*5+(Math.random()-.5)*1.6,vy:p.fy*5+(Math.random()-.5)*1.6,life:18,col,r:4,nog:1});
      const f=byKind("fire");if(!f||f.hidden||S.fireOut)return;
      const dx=f.x-p.x,dy=f.y-p.y,d=Math.hypot(dx,dy);if(d>110||(dx*p.fx+dy*p.fy)/(d||1)<.5)return;
      if(!S.alarm&&!S.sprayedBeforeAlarm){S.sprayedBeforeAlarm=true;toast("Raise the alarm first, so everyone else gets out. Then tackle it if it’s small and safe.",1)}
      if(it==="co2"){S.usedCO2=true;f.hp=Math.max(45,f.hp-.8*dt);if(f.hp<=46)toast("The CO₂ knocks the flames down, but the timber keeps reigniting.","co2")}
      else{f.hp-=.9*dt;if(f.hp<=0){S.fireOut=true;f.hidden=true;drop(f);burst(f.x,f.y,"#e5e7eb",30,3);buzz([15,30]);toast(it==="water"?"Fire out. Water is right for wood, paper and cardboard.":"Fire out. Foam works on wood and paper too.",1)}}
    }

    /* ---------- The Big Mixer ---------- */
    function pullLever(){
      const m=byKind("mixer");
      if(S.boss.done){if(!S.boss.tagged){S.boss.tagged=true;m.tag=1;buzz([15,30,15]);if(!ents.some(e=>e.who==="Dee"))ents.push({x:37.5*T,y:21.5*T,kind:"npc",who:"Dee",hat:"#1f2937",solid:1,label:"Talk",act:talkDee});
        say([["","Evia switches off the fuel, takes out the key and ties on a Do Not Use tag."],["Dee","Spot on. That’s it isolated and tagged."]])}return}
      S.boss.hp--;m.stall=0;m.hit=40;buzz([30,40,30]);burst(m.x-30,m.y,"#f5b800",16,4);
      p.x-=18;
      if(S.boss.hp<=0){S.boss.done=true;m.blobs.length=0;S.cp={map:"yard",x:38*T,y:20*T};save({});
        say([["","The Big Mixer judders to a stop."],["Dee","Nice work! Now isolate it properly: fuel off, key out, and tag it so nobody starts it."]],()=>ents.push({x:37.5*T,y:21.5*T,kind:"npc",who:"Dee",hat:"#1f2937",solid:1,label:"Talk",act:talkDee}))}
      else toast(S.boss.hp===2?"It splutters… and starts again! Once more.":"Nearly! One more stall.",1);
    }
    function mixer(m,dt){
      m.t+=dt;if(m.hit>0)m.hit-=dt;
      if(!S.boss.on){if(p.x>36.2*T){S.boss.on=true;map[20][35]="L";S.cp={map:"yard",x:37*T,y:20*T};say([["","The Big Mixer’s running out of control, flinging mortar!"],["","Dodge the mortar. When it stalls and steams, run to the lever on its side and press A."]])}return}
      if(S.boss.done)return;
      if(m.stall>0){m.stall-=dt;if(m.stall<=0)toast("Too slow! It’s running again.","slow")}
      else{
        if(!m.tx||Math.hypot(m.tx-m.x,m.ty-m.y)<6){m.tx=(37.5+Math.random()*12.5)*T;m.ty=(2.5+Math.random()*20)*T}
        const dx=m.tx-m.x,dy=m.ty-m.y,d=Math.hypot(dx,dy)||1,sp=(1+(3-S.boss.hp)*.35)*dt;m.x+=dx/d*sp;m.y+=dy/d*sp;
        m.volley-=dt;if(m.volley<=0){m.shots=(m.shots||0)+1;
          const n=2+(3-S.boss.hp);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=i?30+Math.random()*50:0;m.blobs.push({sx:m.x,sy:m.y-20,tx:p.x+Math.cos(a)*r,ty:p.y+Math.sin(a)*r,t:0,T:reduced()?70:55})}
          m.volley=reduced()?150:110-(3-S.boss.hp)*15;if(m.shots%2===0){m.stall=reduced()?200:150;toast("It’s stalled! Quick, the lever!","stall",1500)}}
      }
      for(const b of m.blobs){b.t+=dt;if(b.t>=b.T&&!b.done){b.done=1;m.puddles.push({x:b.tx,y:b.ty,life:360});if(Math.hypot(b.tx-p.x,b.ty-p.y)<22)hurt("Splat! Mortar. Keep moving.")}}
      m.blobs=m.blobs.filter(b=>!b.done);m.puddles.forEach(q=>q.life-=dt);m.puddles=m.puddles.filter(q=>q.life>0);
    }

    /* ---------- Hurting, checkpoints ---------- */
    function hurt(msg){
      if(p.inv>0)return;S.hearts--;p.inv=70;buzz(40);toast(msg,1);hud();
      if(S.hearts<=0){state="faint";setTimeout(()=>{S.hearts=S.maxHearts;const c=S.cp;go(c.map,c.x,c.y);if(S.boss.on&&!S.boss.done){S.boss.on=false;S.boss.hp=3;map[20][35]="c";ents=entsFor("yard");p.x=34*T;p.y=20.5*T}
        state="play";hud();toast("Evia takes a breather and has another go.")},900)}
    }

    /* ---------- Moving ---------- */
    const solidAt=(x,y)=>{const c=tile(Math.floor(x/T),Math.floor(y/T));if(c==="T")return !S.pass;return SOLID.has(c)};
    function blocked(x,y){
      if(solidAt(x-PR,y-PR)||solidAt(x+PR,y-PR)||solidAt(x-PR,y+PR)||solidAt(x+PR,y+PR))return true;
      for(const e of ents){if(!e.solid||e.hidden)continue;const hw=(e.w||24)/2,hh=(e.h||20)/2;if(Math.abs(x-e.x)<hw+PR&&Math.abs(y-e.y)<hh+PR)return true}
      return false;
    }
    function step(dt){
      let dx=mv.x,dy=mv.y;
      if(keys.ArrowLeft||keys.KeyA)dx=-1;if(keys.ArrowRight||keys.KeyD)dx=1;if(keys.ArrowUp||keys.KeyW)dy=-1;if(keys.ArrowDown||keys.KeyS)dy=1;
      const d=Math.hypot(dx,dy);
      if(d>.05){if(d>1){dx/=d;dy/=d}const m=byKind("mixer"),inPud=m&&m.puddles.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<20);const sp=SPEED*dt*(inPud?.5:1);
        const nx=p.x+dx*sp,ny=p.y+dy*sp;if(!blocked(nx,p.y))p.x=nx;if(!blocked(p.x,ny))p.y=ny;
        if(Math.abs(dx)>Math.abs(dy)){p.fx=Math.sign(dx);p.fy=0}else{p.fx=0;p.fy=Math.sign(dy)}p.walk+=dt}
      /* doors */
      const c=tile(Math.floor(p.x/T),Math.floor(p.y/T));
      if(c==="D"){if(mapName==="yard"){go("office",5.5*T,7.2*T);p.fx=0;p.fy=-1;if(!S.met)setTimeout(()=>{if(state==="play"&&!S.met)talkSam()},300)}else{go("yard",4.5*T,8.6*T);p.fx=0;p.fy=1}return}
      if(p.inv>0)p.inv-=dt;
      if(mapName!=="yard")return;
      /* dust: without a mask she coughs, then has to back out */
      if(c==="c"&&!S.ppe.mask){p.cough+=dt;if(p.cough>70){p.cough=0;S.dustHit=true;p.x=25*T;p.y=12.5*T;hurt("*Cough* Silica dust! You need a dust mask. Try the stores.")}else toast("Evia’s coughing. It’s very dusty in here…","cough",4000)}else p.cough=Math.max(0,p.cough-dt);
      if(c==="a"&&S.alarm&&!S.assembled){S.assembled=1;toast("At the assembly point. Good habit.")}
      /* the dumper: it stops if the driver can see her ahead, but not when reversing */
      const dm=byKind("dumper");
      if(dm){dm.t+=dt;const ahead=dm.dir>0?(p.x>dm.x&&p.x-dm.x<110):false,inRow=Math.abs(p.y-dm.y)<34;dm.stop=inRow&&ahead;
        if(!dm.stop){dm.x+=dm.dir*(dm.dir>0?1.5:1.1)*dt;if(dm.x>dm.x1){dm.x=dm.x1;dm.dir=-1}if(dm.x<dm.x0){dm.x=dm.x0;dm.dir=1}}
        if(Math.abs(p.x-dm.x)<34+PR&&Math.abs(p.y-dm.y)<22+PR&&!dm.stop&&p.inv<=0){S.dumperHit++;p.x+=dm.dir*30;hurt(dm.dir<0?"The reversing dumper didn’t see you! Stay out of its blind spot, on the walkway.":"Watch the dumper! Stay on the walkway.")}}
      const m=byKind("mixer");if(m)mixer(m,dt);
      const f=byKind("fire");if(f&&!f.hidden){f.t+=dt;if(S.items[S.held]==="co2"||!bHeld)f.hp=Math.min(100,f.hp+(bHeld?0:.05)*dt)}
      if(bHeld)spray(dt);
      for(const e of ents)if(e.kind==="coin"&&Math.hypot(e.x-p.x,e.y-p.y)<18){S.got[e.id]=1;S.coins++;drop(e);burst(e.x,e.y,"#f5b800",5,2);$(".sq-coins b").textContent=S.coins}
      if(S.pass&&S.ppe.mask&&!S.cpStores){S.cpStores=1;S.cp={map:"yard",x:16.5*T,y:11.5*T}}
      if(S.fireOut&&!S.cpCut){S.cpCut=1;S.cp={map:"yard",x:27.5*T,y:12.5*T}}
    }

    /* ---------- HUD, toasts ---------- */
    let toastT=0;const said={};
    function toast(msg,key,gap){const now=performance.now();if(typeof key==="string"){if(said[key]&&now-said[key]<(gap||3000))return;said[key]=now}
      toastEl.textContent=msg;toastEl.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove("on"),msg.length>60?4200:2600)}
    const heart=on=>'<svg viewBox="0 0 24 24" class="'+(on?"on":"")+'"><path d="M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.5 4.4 2 7.5 2c1.8 0 3.4.8 4.5 2.1C13.1 2.8 14.7 2 16.5 2 19.6 2 22 4.5 22 7.6c0 3.8-3.4 6.9-8.6 11.6z"/></svg>';
    function hud(){
      if(!S)return;
      $(".sq-hearts").innerHTML=Array.from({length:S.maxHearts},(_,i)=>heart(i<S.hearts)).join("");
      $(".sq-coins b").textContent=S.coins;
      const it=S.items[S.held];bBtn.hidden=!it;
      if(it)bBtn.innerHTML=(ITEM[it].band?'<svg viewBox="4 2.5 16 21"><path d="M9 3.5h4v2H9z" fill="#3f4a57"/><path d="M13 4.5l4.5-1.5v2.2L13 6z" fill="#3f4a57"/><rect x="7" y="5.5" width="8" height="17" rx="3" fill="#d62828"/><rect x="7" y="10" width="8" height="5" fill="'+ITEM[it].band+'"/></svg>':'<svg viewBox="0 0 24 24"><path d="M10.5 2H13.5V12L17.5 15V22H6.5V15L10.5 12Z" fill="#6b7684"/></svg>')+'<span>B</span>'+(S.items.length>1?'<i>⇄</i>':"");
    }
    let lastGoal="";

    /* ---------- Menu and the end ---------- */
    function showMenu(){
      state="menu";const sv=load();
      menu.hidden=false;menu.innerHTML='<div class="sr-card sq-card"><button type="button" class="sr-x sr-cx" aria-label="Close">×</button><h2>Evia’s Site Quest</h2><p>First day on a new site. Explore, talk to people and sort out whatever the site throws at you.</p>'+
        '<button type="button" class="sq-area" data-go><span class="sq-area-n">1</span><span><strong>The compound</strong><small>'+(sv.done?"Best: "+"★".repeat(sv.stars||1)+"☆".repeat(3-(sv.stars||1)):"Induction, the yard, a fire and the Big Mixer.")+'</small></span></button>'+
        '<p class="sq-how">Drag anywhere to move. <b>A</b> talks, reads and uses. <b>B</b> uses what you’re holding.</p></div>';
      menu.querySelector(".sr-cx").onclick=()=>ctx.close();
      menu.querySelector("[data-go]").onclick=()=>{menu.hidden=true;menu.innerHTML="";fresh();state="play";wrap.classList.add("playing");hud();last=performance.now();toast("Drag to move. Head for the site office.")};
    }
    /* The site report: what Evia did, noted as she played. This is the assessment. */
    function finishArea(){
      state="done";wrap.classList.remove("playing");const rows=[
        ["Did the induction and found the first aid kit, fire point and fire action notice",true],
        ["Kept out of the dumper’s way",S.dumperHit===0],
        ["Wore a dust mask in the cutting area",!S.dustHit],
        ["Raised the alarm before tackling the fire",S.alarm&&!S.sprayedBeforeAlarm],
        ["Used the right extinguisher on a timber fire",!S.usedCO2],
        ["Stopped, isolated and tagged the mixer",S.boss.tagged]];
      const ok=rows.filter(r=>r[1]).length,stars=ok>=6?3:ok>=4?2:1;
      const want=Math.min(25,Math.floor(S.coins/2)+stars*3),got=want&&R()&&R().gameCoins?R().gameCoins(want):0;ctx.coins();
      const sv=load();save({done:1,stars:Math.max(sv.stars||0,stars)});if(got&&window.eviaMood)window.eviaMood("happy");
      menu.hidden=false;menu.innerHTML='<div class="sr-card"><h2>Site report</h2><p class="sr-sub">From Sam, the site manager</p><div class="sr-stars">'+[0,1,2].map(k=>'<svg viewBox="0 0 24 24" class="sr-star'+(k<stars?" on":"")+'"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>').join("")+'</div>'+
        '<ul class="sr-why sq-report">'+rows.map(r=>'<li class="'+(r[1]?"ok":"")+'">'+esc(r[0])+'</li>').join("")+'</ul>'+
        '<div class="gm-end-coins">'+coinSvg()+'<b>+'+got+'</b><span>'+(got?"coins":want?"Today’s game coins are all collected.":"coins")+'</span></div>'+
        '<div class="sr-btns"><button type="button" class="primary" data-b="again">Play again</button><button type="button" class="secondary" data-b="done">Done</button></div></div>';
      menu.querySelector('[data-b="again"]').onclick=()=>{menu.hidden=true;menu.innerHTML="";fresh();state="play";wrap.classList.add("playing");hud()};
      menu.querySelector('[data-b="done"]').onclick=()=>ctx.close();
    }

    /* ---------- Drawing ---------- */
    const parts=[];
    const burst=(x,y,col,n,sp)=>{if(reduced())n=Math.ceil(n/3);for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*(sp||4),vy:(Math.random()-.5)*(sp||4),life:26+Math.random()*16,col,r:2+Math.random()*2.5})};
    const rr=(x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)};
    const FLOOR={".":"#e7e1d5",g:"#d3e2c4","=":"#cfe6d2","-":"#a3a9b0",c:"#dcd9d2",m:"#dcd6c8",a:"#bfe3c6",_:"#eadfcd",D:"#8b6b4a",T:"#9aa3ad",L:"#dcd6c8"};
    function ground(tx,ty,c){
      const x=tx*T,y=ty*T;g.fillStyle=FLOOR[c]||FLOOR["."];g.fillRect(x,y,T+.5,T+.5);
      if(c==="."&&(tx*7+ty*13)%5===0){g.fillStyle="#d6cfc0";g.fillRect(x+9,y+13,3,3);g.fillRect(x+21,y+6,2,2)}
      if(c==="=")[["=",-1],["=",1]].forEach(([_,s])=>{if(tile(tx,ty+s)!=="="&&tile(tx,ty+s)!=="T"){g.fillStyle="#fff";g.fillRect(x,s<0?y:y+T-3,T,3)}}),tile(tx-1,ty)!=="="&&tile(tx+1,ty)!=="="&&(g.fillStyle="#fff",g.fillRect(x,y,3,T),g.fillRect(x+T-3,y,3,T));
      if(c==="-"&&ty===16){g.fillStyle="#eef0f2";g.fillRect(x+6,y+T-2,16,3)}
      if(c==="a"&&tx===3&&ty===21){g.fillStyle="#16a34a";rr(x-20,y-20,72,72,8);g.fill();g.fillStyle="#fff";g.font="700 9px system-ui,sans-serif";g.textAlign="center";g.fillText("ASSEMBLY",x+16,y+10);g.fillText("POINT",x+16,y+22)}
      if(c==="_"&&(tx+ty)%2){g.fillStyle="rgba(0,0,0,.03)";g.fillRect(x,y,T,T)}
    }
    /* Solid tiles stand up a little (a top and a darker front), and everything is drawn back to front. */
    const BLOCK={"#":["#8f9bab","#6f7b8a"],x:null,O:["#d4dbe3","#aab4bf"],S:["#6f8a78","#56705f"],W:["#d9dfe5","#b3bcc6"],P:["#c79b62","#9c7338"],k:["#f5b800","#c79200"],b:["#b8674b","#8e4d37"],T:["#9aa3ad","#6b7684"],r:["#c3c7cc","#9ea3a9"],d:["#a57a4f","#7c5a39"],L:["#8d99a8","#6b7684"]};
    function block(tx,ty,c){
      const x=tx*T,y=ty*T;
      if(c==="x"||c==="L"){g.fillStyle="rgba(141,153,168,.9)";g.fillRect(x+T/2-1.5,y-12,3,T+12);g.strokeStyle="rgba(141,153,168,.55)";g.lineWidth=1;g.beginPath();for(let k=-10;k<T;k+=6){g.moveTo(x+T/2-8,y+k);g.lineTo(x+T/2+8,y+k)}g.stroke();
        if(tile(tx+1,ty)==="x"||tile(tx-1,ty)==="x"){g.fillStyle="rgba(141,153,168,.9)";g.fillRect(x,y-12,T,2);g.fillRect(x,y+T/2,T,2);g.strokeStyle="rgba(141,153,168,.5)";g.beginPath();for(let k=0;k<T;k+=6){g.moveTo(x+k,y-12);g.lineTo(x+k,y+T/2)}g.stroke()}return}
      if(c==="T"){g.fillStyle=S.pass?"#16a34a":"#dc2626";g.fillRect(x+6,y+4,T-12,T-8);g.fillStyle="#6b7684";g.fillRect(x+2,y-8,4,T+8);g.fillRect(x+T-6,y-8,4,T+8);return}
      const [top,front]=BLOCK[c]||BLOCK["#"],hgt=c==="k"||c==="P"||c==="r"||c==="d"?8:16;
      g.fillStyle=front;g.fillRect(x,y+T-hgt,T+.5,hgt);g.fillStyle=top;g.fillRect(x,y-hgt,T+.5,T);
      if(c==="b"){g.strokeStyle="rgba(255,255,255,.45)";g.lineWidth=1;g.beginPath();for(let k=0;k<T;k+=8){g.moveTo(x,y-hgt+k);g.lineTo(x+T,y-hgt+k)}g.stroke()}
      if(c==="S"&&tx===13&&ty===2){g.fillStyle="#fff";g.font="700 11px system-ui,sans-serif";g.textAlign="left";g.fillText("STORES",x+8,y+46)}
      if(c==="O"&&tx===2&&ty===4){g.fillStyle="#475569";g.font="700 11px system-ui,sans-serif";g.textAlign="left";g.fillText("SITE OFFICE",x+30,y+20)}
      if(c==="W"&&tx===16&&ty===20){g.fillStyle="#475569";g.font="700 11px system-ui,sans-serif";g.textAlign="left";g.fillText("WELFARE",x+44,y+30)}
    }
    function person(e){
      const t=performance.now()/1000;g.fillStyle="rgba(15,23,42,.12)";g.beginPath();g.ellipse(e.x,e.y+12,12,4,0,0,Math.PI*2);g.fill();
      g.fillStyle="#fb8c1a";rr(e.x-10,e.y-6,20,18,7);g.fill();g.fillStyle="#e8ecef";g.fillRect(e.x-10,e.y+2,20,2.5);
      g.fillStyle="#f1c8a5";g.beginPath();g.arc(e.x,e.y-12,8,0,Math.PI*2);g.fill();
      g.fillStyle=e.hat;g.beginPath();g.arc(e.x,e.y-14,8.5,Math.PI,0);g.fill();g.fillRect(e.x-10,e.y-15,20,3);g.strokeStyle="rgba(0,0,0,.15)";g.lineWidth=1;g.stroke();
      if(e.cutter){const k=Math.sin(t*20)*1.5;g.fillStyle="#3f4a57";rr(e.x+10,e.y-2+k,16,7,2);g.fill();g.fillStyle="#9aa3ad";g.beginPath();g.arc(e.x+26,e.y+1+k,6,0,Math.PI*2);g.fill()}
    }
    function drawEnt(e){
      const t=performance.now()/1000;
      if(e.kind==="npc")return person(e);
      if(e.kind==="coin"){const sq=Math.abs(Math.cos(t*3+e.x*.05));g.fillStyle="#f5b800";g.strokeStyle="#b07f00";g.lineWidth=1.5;g.beginPath();g.ellipse(e.x,e.y,7*Math.max(.25,sq),7,0,0,Math.PI*2);g.fill();g.stroke();return}
      if(e.kind==="heart"){g.save();g.translate(e.x-10,e.y-12+Math.sin(t*3)*2);g.scale(20/24,20/24);g.fillStyle="#e0445a";g.fill(new Path2D("M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.5 4.4 2 7.5 2c1.8 0 3.4.8 4.5 2.1C13.1 2.8 14.7 2 16.5 2 19.6 2 22 4.5 22 7.6c0 3.8-3.4 6.9-8.6 11.6z"));g.restore();return}
      if(e.kind==="item"){g.fillStyle="#6b7684";g.fillRect(e.x-2,e.y-12,4,14);g.fillStyle="#9aa3ad";g.fillRect(e.x-6,e.y+1,12,5);g.fillStyle="#3f4a57";rr(e.x+6,e.y-10,12,7,2);g.fill();g.fillStyle="#a57a44";g.fillRect(e.x+10,e.y-4,3,12);return}
      if(e.kind==="ext"){const band=ITEM[e.item].band;const held=S.items.includes(e.item);g.globalAlpha=held?.25:1;g.fillStyle="#d62828";rr(e.x-5,e.y-14,10,22,4);g.fill();g.fillStyle=band;g.fillRect(e.x-5,e.y-8,10,5);g.fillStyle="#3f4a57";g.fillRect(e.x-2,e.y-17,4,3);g.globalAlpha=1;return}
      if(e.kind==="callpoint"){g.fillStyle="#6b7684";g.fillRect(e.x-2,e.y-4,4,14);g.fillStyle=S.alarm&&Math.floor(t*4)%2?"#fca5a5":"#dc2626";rr(e.x-8,e.y-16,16,14,2);g.fill();g.fillStyle="#fff";g.fillRect(e.x-4,e.y-12,8,6);return}
      if(e.kind==="board"){g.fillStyle="#8d6a3e";g.fillRect(e.x-12,e.y-4,3,16);g.fillRect(e.x+9,e.y-4,3,16);g.fillStyle="#fff";g.strokeStyle="#0b5cad";g.lineWidth=2;rr(e.x-15,e.y-24,30,22,3);g.fill();g.stroke();g.fillStyle="#0b5cad";for(let i=0;i<3;i++){g.beginPath();g.arc(e.x-8+i*8,e.y-15,3,0,Math.PI*2);g.fill()}g.fillStyle="#9aa3ad";g.fillRect(e.x-10,e.y-9,20,2);return}
      if(e.kind==="assembly"||e.kind==="turnstile")return;
      if(e.kind==="sign"){g.fillStyle="#8d99a8";g.fillRect(e.x-1.5,e.y-8,3,18);g.fillStyle="#0b5cad";g.beginPath();g.arc(e.x,e.y-16,10,0,Math.PI*2);g.fill();g.fillStyle="#fff";g.beginPath();g.moveTo(e.x-6,e.y-18);g.quadraticCurveTo(e.x,e.y-21,e.x+6,e.y-18);g.lineTo(e.x+5,e.y-13);g.quadraticCurveTo(e.x,e.y-10,e.x-5,e.y-13);g.fill();return}
      if(e.kind==="aid"){g.fillStyle="#16a34a";rr(e.x-11,e.y-18,22,18,3);g.fill();g.fillStyle="#fff";g.fillRect(e.x-2,e.y-15,4,12);g.fillRect(e.x-6,e.y-11,12,4);return}
      if(e.kind==="firepoint"){g.fillStyle="#dc2626";rr(e.x-14,e.y-22,28,8,2);g.fill();g.fillStyle="#fff";g.font="700 6px system-ui,sans-serif";g.textAlign="center";g.fillText("FIRE POINT",e.x,e.y-16);for(let i=0;i<2;i++){g.fillStyle="#d62828";rr(e.x-9+i*10,e.y-12,8,16,3);g.fill()}g.fillStyle="#1f2328";g.fillRect(e.x+1,e.y-8,8,4);return}
      if(e.kind==="notice"){g.fillStyle="#fff";g.strokeStyle="#16a34a";g.lineWidth=2;rr(e.x-12,e.y-22,24,20,2);g.fill();g.stroke();g.fillStyle="#16a34a";g.fillRect(e.x-10,e.y-20,20,5);g.fillStyle="#9aa3ad";for(let i=0;i<3;i++)g.fillRect(e.x-9,e.y-12+i*3,18,1.5);return}
      if(e.kind==="dumper"){const x=e.x,y=e.y,f=e.dir;g.fillStyle="rgba(15,23,42,.15)";g.beginPath();g.ellipse(x,y+18,36,6,0,0,Math.PI*2);g.fill();
        g.fillStyle="#2f343a";for(const [wx,wy] of [[-22,14],[22,14],[-22,-12],[22,-12]]){rr(x+wx-7,y+wy-5,14,10,3);g.fill()}
        g.fillStyle="#f5b800";rr(x-32,y-14,64,28,6);g.fill();g.fillStyle="#e2a700";g.beginPath();g.moveTo(x+f*6,y-16);g.lineTo(x+f*34,y-20);g.lineTo(x+f*34,y+10);g.lineTo(x+f*6,y+14);g.fill();
        g.fillStyle="#3f4a57";rr(x-f*22-8,y-24,16,16,3);g.fill();const on=Math.floor(e.t/8)%2;g.fillStyle=e.dir<0?(on?"#fb8c1a":"#fde3c2"):"#fb8c1a";g.beginPath();g.arc(x-f*22,y-26,4,0,Math.PI*2);g.fill();
        if(e.dir<0&&!e.stop){g.fillStyle="rgba(220,38,38,.12)";g.beginPath();g.moveTo(x-34,y-14);g.lineTo(x-110,y-40);g.lineTo(x-110,y+40);g.lineTo(x-34,y+14);g.fill();if(on){g.fillStyle="#dc2626";g.font="700 10px system-ui,sans-serif";g.textAlign="center";g.fillText("BEEP",x,y-32)}}
        return}
      if(e.kind==="fire"){if(e.hidden)return;const k=Math.max(.35,e.hp/100);
        for(let i=0;i<9;i++){const fx=e.x-38+i*10,fy=e.y+10-(i%3)*12,h=(24+Math.sin(t*9+i*1.7)*7)*k;g.fillStyle="rgba(249,115,22,.9)";g.beginPath();g.moveTo(fx-7,fy);g.quadraticCurveTo(fx-6,fy-h*.6,fx,fy-h);g.quadraticCurveTo(fx+6,fy-h*.6,fx+7,fy);g.fill();
          g.fillStyle="rgba(253,224,71,.95)";g.beginPath();g.moveTo(fx-3.5,fy);g.quadraticCurveTo(fx-3,fy-h*.35,fx,fy-h*.55);g.quadraticCurveTo(fx+3,fy-h*.35,fx+3.5,fy);g.fill()}
        g.fillStyle="rgba(100,116,139,.25)";for(let i=0;i<4;i++){g.beginPath();g.arc(e.x-10+Math.sin(t+i)*10,e.y-50-i*26-((t*30)%26),14+i*5,0,Math.PI*2);g.fill()}return}
      if(e.kind==="mixer")return drawMixer(e);
    }
    function drawMixer(m){
      const t=performance.now()/1000,sh=m.hit>0?Math.sin(m.hit)*3:0,x=m.x+sh,y=m.y,stalled=m.stall>0||S.boss.done;
      for(const q of m.puddles){g.fillStyle="rgba(120,113,108,"+Math.min(.55,q.life/200)+")";g.beginPath();g.ellipse(q.x,q.y,18,8,0,0,Math.PI*2);g.fill()}
      g.fillStyle="rgba(15,23,42,.15)";g.beginPath();g.ellipse(x,y+26,40,9,0,0,Math.PI*2);g.fill();
      g.fillStyle="#2f343a";g.beginPath();g.arc(x-22,y+18,8,0,Math.PI*2);g.arc(x+22,y+18,8,0,Math.PI*2);g.fill();
      g.fillStyle="#6b7280";g.fillRect(x-28,y+4,56,8);
      g.save();g.translate(x,y-8);g.rotate(-.4);g.fillStyle=S.boss.done?"#b9bec5":"#e8772e";g.beginPath();g.ellipse(0,0,30,22,0,0,Math.PI*2);g.fill();
      g.strokeStyle="rgba(0,0,0,.2)";g.lineWidth=3;const rot=stalled?0:t*5;for(let i=0;i<3;i++){const a=rot+i*2.1;g.beginPath();g.ellipse(0,0,30*Math.abs(Math.cos(a)),22,0,-Math.PI/2,Math.PI/2);g.stroke()}
      g.fillStyle="#3f4a57";g.beginPath();g.ellipse(-29,0,5,12,0,0,Math.PI*2);g.fill();g.restore();
      g.strokeStyle="#1f2937";g.lineWidth=2.5;g.lineCap="round";g.beginPath();
      if(S.boss.done){g.moveTo(x-12,y-16);g.lineTo(x-6,y-10);g.moveTo(x-6,y-16);g.lineTo(x-12,y-10);g.moveTo(x+6,y-18);g.lineTo(x+12,y-12);g.moveTo(x+12,y-18);g.lineTo(x+6,y-12)}
      else{g.moveTo(x-14,y-20);g.lineTo(x-5,y-16);g.moveTo(x+14,y-22);g.lineTo(x+5,y-18);g.moveTo(x-9,y-12);g.lineTo(x-9,y-7);g.moveTo(x+9,y-14);g.lineTo(x+9,y-9)}g.stroke();
      /* the stop lever on its side glows when it stalls */
      const lx=x-38,ly=y+4;if(stalled&&!m.tag){g.fillStyle="rgba(245,196,0,"+(.3+.2*Math.sin(t*8))+")";g.beginPath();g.arc(lx,ly,14,0,Math.PI*2);g.fill()}
      g.fillStyle="#3f4a57";g.fillRect(lx-2,ly-12,4,14);g.fillStyle="#dc2626";g.beginPath();g.arc(lx,ly-12,4,0,Math.PI*2);g.fill();
      if(m.stall>0){g.fillStyle="rgba(226,232,240,.8)";for(let i=0;i<3;i++){g.beginPath();g.arc(x+10+i*6,y-36-((t*40+i*14)%30),6+i*2,0,Math.PI*2);g.fill()}}
      if(m.tag){g.fillStyle="#dc2626";rr(x+18,y-30,16,20,2);g.fill();g.fillStyle="#fff";g.font="700 5px system-ui,sans-serif";g.textAlign="center";g.fillText("DO NOT",x+26,y-21);g.fillText("USE",x+26,y-15)}
      if(S.boss.on&&!S.boss.done)for(let i=0;i<3;i++){g.fillStyle=i<S.boss.hp?"#dc2626":"#d9dde2";rr(x-25+i*18,y-52,14,6,3);g.fill()}
      for(const b of m.blobs){const k=b.t/b.T,bx=b.sx+(b.tx-b.sx)*k,by=b.sy+(b.ty-b.sy)*k-Math.sin(k*Math.PI)*90;
        g.fillStyle="rgba(15,23,42,"+(.1+k*.25)+")";g.beginPath();g.ellipse(b.tx,b.ty,6+k*10,3+k*5,0,0,Math.PI*2);g.fill();
        g.fillStyle="#8a817a";g.beginPath();g.arc(bx,by,7,0,Math.PI*2);g.fill()}
    }
    function drawEvia(){
      const flick=p.inv>0&&Math.floor(p.inv/5)%2;if(flick)return;
      const t=performance.now()/1000,bob=(mv.x||mv.y||keys.ArrowLeft||keys.ArrowRight||keys.ArrowUp||keys.ArrowDown)?Math.abs(Math.sin(p.walk*.3))*1.5:0,x=p.x,y=p.y-10-bob;
      g.fillStyle="rgba(15,23,42,.14)";g.beginPath();g.ellipse(p.x,p.y+8,12,4,0,0,Math.PI*2);g.fill();
      if(S.ppe.boots){g.fillStyle="#2f343a";rr(x-10,y+11,8,6,2.5);g.fill();rr(x+2,y+11,8,6,2.5);g.fill()}
      const body=new Path2D();body.arc(x,y,14,0,Math.PI*2);g.fillStyle="#fff";g.fill(body);
      if(S.ppe.vis){g.save();g.clip(body);g.fillStyle="#fb8c1a";g.fillRect(x-15,y+4,30,12);g.fillStyle="#e8ecef";g.fillRect(x-15,y+6.5,30,2);g.fillRect(x-15,y+10.5,30,2);g.restore()}
      g.strokeStyle=accent;g.lineWidth=3;g.stroke(body);
      if(p.fy>=0||p.fx){const ex=p.fx*3,ey=p.fy>0?1:-1;g.strokeStyle=accent;g.lineWidth=2.2;g.lineCap="round";g.beginPath();g.moveTo(x-4+ex,y-4+ey);g.lineTo(x-4+ex,y+ey);g.moveTo(x+4+ex,y-4+ey);g.lineTo(x+4+ex,y+ey);g.stroke()}
      if(S.ppe.mask&&(p.fy>=0||p.fx)&&mapName==="yard"&&tile(Math.floor(p.x/T),Math.floor(p.y/T))==="c"){g.fillStyle="#f1f4f6";g.strokeStyle="#9aa6b2";g.lineWidth=1;rr(x-6+p.fx*3,y+1,12,7,3);g.fill();g.stroke()}
      if(S.ppe.hat){g.fillStyle="#f5b800";g.beginPath();g.arc(x,y-8,10,Math.PI,0);g.closePath();g.fill();g.fillStyle="#e2a700";rr(x-13,y-9,26,3,1.5);g.fill()}
      const it=S.items[S.held];if(it&&ITEM[it].band){g.fillStyle="#d62828";rr(x+p.fx*16-3+(p.fy?10:0),y+2+p.fy*6,6,12,2);g.fill();g.fillStyle=ITEM[it].band;g.fillRect(x+p.fx*16-3+(p.fy?10:0),y+5+p.fy*6,6,3)}
    }
    function draw(){
      g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle="#eef1f4";g.fillRect(0,0,W,H);
      if(!S)return;
      const vw=W/scale,vh=H/scale,mw=map[0].length*T,mh=map.length*T;
      let wx=p.x-vw/2,wy=p.y-vh/2;const pad=2.5*T;wx=mw+2*pad<vw?(mw-vw)/2:Math.max(-pad,Math.min(mw-vw+pad,wx));wy=mh+2*pad<vh?(mh-vh)/2:Math.max(-pad,Math.min(mh-vh+pad,wy));
      if(camX==null){camX=wx;camY=wy}camX+=(wx-camX)*.18;camY+=(wy-camY)*.18;
      g.save();g.scale(scale,scale);g.translate(-camX,-camY);
      const x0=Math.max(0,Math.floor(camX/T)-1),x1=Math.min(map[0].length-1,Math.ceil((camX+vw)/T)+1),y0=Math.max(0,Math.floor(camY/T)-1),y1=Math.min(map.length-1,Math.ceil((camY+vh)/T)+1);
      for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=map[ty][tx];ground(tx,ty,SOLID.has(c)||c==="x"?(mapName==="office"?"_":tile(tx,ty+1)==="c"?"c":"."):c)}
      /* dust haze over the cutting area */
      if(mapName==="yard"&&x1>=26){const tt=performance.now()/1000;for(let i=0;i<40;i++){const hx=27*T+((i*97+tt*20*(1+i%3))%(8*T)),hy=1*T+((i*151)%(24*T));g.fillStyle="rgba(170,160,145,"+(.10+(i%4)*.04)+")";g.beginPath();g.arc(hx,hy,18+(i%5)*6,0,Math.PI*2);g.fill()}}
      const list=[];
      for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const c=map[ty][tx];if(SOLID.has(c))list.push({k:(ty+1)*T-.5,f:()=>block(tx,ty,c)})}
      for(const e of ents){if(e.x<camX-80||e.x>camX+vw+80||e.y<camY-80||e.y>camY+vh+80)continue;list.push({k:e.wall?-1:e.y+(e.kind==="fire"?40:10),f:()=>drawEnt(e)})}
      list.push({k:p.y+10,f:drawEvia});
      list.sort((a,b)=>a.k-b.k).forEach(o=>o.f());
      for(const q of parts){g.globalAlpha=Math.max(0,Math.min(1,q.life/16));g.fillStyle=q.col;g.beginPath();g.arc(q.x,q.y,q.r,0,Math.PI*2);g.fill()}g.globalAlpha=1;
      g.restore();
    }

    function frame(now){
      raf=requestAnimationFrame(frame);
      if(document.hidden){last=now;return}
      const dt=Math.min(2,(now-(last||now))/16.67);last=now;
      if(S&&state==="play")step(dt);
      for(const q of parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.96;q.vy*=.96;q.life-=dt}
      for(let i=parts.length-1;i>=0;i--)if(parts[i].life<=0)parts.splice(i,1);
      if(S&&state==="play"){const t=target(),lab=t?t.label:"A";if(aBtn.textContent!==lab){aBtn.textContent=lab;aBtn.classList.toggle("dim",!t)}const gl=goal();if(gl!==lastGoal){lastGoal=gl;$(".sq-goal").textContent=gl}}
      draw();
    }
    ctx.o.sqState=()=>({S,p,state,mapName,ents,target});   /* for the tests */
    showMenu();raf=requestAnimationFrame(frame);
  }

  G.register({id:"game-sitequest",key:"sitequest",label:"Evia’s Site Quest",rarity:"epic",about:"A top-down adventure: explore the site, help the team and deal with whatever the day throws at you."},run,
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>');
})();
