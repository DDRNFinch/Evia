/* Evia's Site Run: a platform game. Evia runs across a building site; whenever something is in her way, she stops and
   her tool belt opens with a choice:
     hazard areas   which PPE protects you (hard hat, dust mask, hi-vis, ear defenders, boots, glasses, gloves)
     obstacles      which tool clears it (bolster and club hammer, ladder, spirit level, handsaw)
     fires          which extinguisher, by its colour band (water, foam, CO2, dry powder, wet chemical)
     paperwork      which document or regulation (RAMS, COSHH, LOLER, RIDDOR, PUWER, CDM, permits...)
     drawings       hatching, safety sign types, scales and plan symbols
   A wrong PPE or extinguisher costs a heart (it's a safety mistake); a wrong tool, document or drawing answer just
   greys out. Course questions are jump boxes: jump into the right lettered block. The Big Mixer boss uses them too.
   A full PPE kit makes Evia safe from everything for a few seconds; a first aid kit gives back a heart.
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
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

  /* Icons (24-unit box), used on the canvas (Path2D) and in the tool belt (SVG). "eo": holes cut with even-odd. */
  const ICON={
    hat:{d:"M4 15A8 8 0 0 1 20 15ZM11 7.2H13V15H11ZM2 15H22V17.8H2Z",c:"#f5b800",name:"Hard hat"},
    mask:{d:"M4.5 9.5Q12 5.5 19.5 9.5L18.5 15Q12 20.5 5.5 15ZM1.5 9H4.8V10.6H1.5ZM19.2 9H22.5V10.6H19.2Z",c:"#c9d1d9",name:"Dust mask"},
    vis:{d:"M7 3H10L12 7L14 3H17L20.5 8L18.5 10V21H5.5V10L3.5 8ZM5.5 13H18.5V15H5.5ZM5.5 17H18.5V19H5.5Z",c:"#fb8c1a",eo:1,name:"Hi-vis"},
    ears:{d:"M4 13A8 8 0 0 1 20 13H18A6 6 0 0 0 6 13ZM2.5 11.5H8V19.5H2.5ZM16 11.5H21.5V19.5H16Z",c:"#3f4a57",name:"Ear defenders"},
    boots:{d:"M6 3H12.5V12.5L19 14.5Q21.5 15.4 21.5 18V19.5H6ZM6 20.5H21.5V22H6Z",c:"#3a3f46",name:"Safety boots"},
    glasses:{d:"M1.5 8.5H22.5V10.5H21.6L20.6 14.6Q20.1 16.6 17.8 16.6H15.4Q13.2 16.6 12.9 14.4L12.6 12.2H11.4L11.1 14.4Q10.8 16.6 8.6 16.6H6.2Q3.9 16.6 3.4 14.6L2.4 10.5H1.5Z",c:"#2f7fd8",name:"Safety glasses"},
    gloves:{d:"M7 21.5V13L4.8 10.2Q4 9 5 8.2Q6 7.5 6.9 8.5L8.2 10V4.6Q8.2 3.4 9.3 3.4Q10.4 3.4 10.4 4.6V9.6H10.9V3.2Q10.9 2 12 2Q13.1 2 13.1 3.2V9.6H13.6V4Q13.6 2.8 14.7 2.8Q15.8 2.8 15.8 4V10H16.3V6Q16.3 4.8 17.4 4.8Q18.5 4.8 18.5 6V14.2Q18.5 17.6 16.8 19.2V21.5Z",c:"#2563eb",name:"Gloves"},
    bolster:{d:"M10.5 2H13.5V12L17.5 15V22H6.5V15L10.5 12Z",c:"#6b7684",name:"Bolster and club hammer"},
    ladder:{d:"M5.5 2H8.3V22H5.5ZM15.7 2H18.5V22H15.7ZM8.3 5.5H15.7V7.5H8.3ZM8.3 10.5H15.7V12.5H8.3ZM8.3 15.5H15.7V17.5H8.3Z",c:"#a8763e",name:"Ladder"},
    level:{d:"M1.5 8.5H22.5V15.5H1.5ZM9.5 10.2H14.5V13.8H9.5Z",c:"#2f7fd8",eo:1,name:"Spirit level"},
    saw:{d:"M2 18.5L17.5 5L19.2 6.8L4 21.5H2ZM17 3.2H22.5V9.8L19.8 7.4L20.8 6.4L18.4 4.3Z",c:"#6b7684",name:"Handsaw"},
    trowel:{d:"M2 22L5.5 10.5L16.5 7ZM15.5 8L20.8 2.7L22.3 4.2L17 9.5Z",c:"#6b7684",name:"Trowel"},
    tape:{d:"M3 7Q3 4 6 4H15Q18 4 18 7V15Q18 18 15 18H6Q3 18 3 15ZM8 11A2.5 2.5 0 1 0 13 11A2.5 2.5 0 1 0 8 11ZM18 14.5H23V16.5H18Z",c:"#f5b800",eo:1,name:"Tape measure"},
    hammer:{d:"M8.5 3H17.5Q20 3 21.5 5.5L19.4 6.6Q18.4 5.2 17 5.2H15V8.5H11V5.2H8.5ZM11.4 8.5H14.6V22H11.4Z",c:"#6b7684",name:"Claw hammer"},
    doc:{d:"M5 2H14.5L19 6.5V22H5ZM8 10.5H16V12.1H8ZM8 14H16V15.6H8ZM8 17.5H13V19.1H8Z",c:"#64748b",eo:1,name:"Document"},
    regs:{d:"M4 3H17Q20 3 20 6V21H7Q4 21 4 18ZM7 17H17V19H7ZM8 6.5H16V8.1H8ZM8 10H14V11.6H8Z",c:"#475569",eo:1,name:"Regulations"},
    aid:{d:"M3 5H21V19H3ZM10.5 8H13.5V10.5H16V13.5H13.5V16H10.5V13.5H8V10.5H10.5Z",c:"#16a34a",eo:1,name:"First aid kit"},
    kit:{d:"M12 2L20 5V11Q20 18 12 22Q4 18 4 11V5ZM10.6 7H13.4V10.6H17V13.4H13.4V17H10.6V13.4H7V10.6H10.6Z",c:"#16a34a",eo:1,name:"Full PPE kit"}
  };
  const PPE=["hat","mask","vis","ears","boots","glasses","gloves"];
  const P2D={};const path=k=>P2D[k]||(P2D[k]=new Path2D(ICON[k].d));
  const svg=k=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="'+ICON[k].c+'" d="'+ICON[k].d+'"'+(ICON[k].eo?' fill-rule="evenodd"':"")+'/></svg>';

  /* ---------- What can be in the way ---------- */
  /* Hazard areas: the PPE that protects you, and wrong choices that clearly don't. */
  const HAZ={
    fall:{need:"hat",what:"falling bricks",off:["mask","gloves","ears"],q:"Bricks are being loaded out on the scaffold above. Which PPE protects you?",why:"A hard hat protects your head from falling objects."},
    dust:{need:"mask",what:"dust",off:["hat","boots","vis"],q:"Blocks are being cut and the air is full of dust. Which PPE protects you?",why:"A dust mask (FFP3 for silica) stops you breathing in fine dust."},
    plant:{need:"vis",what:"moving plant",off:["ears","gloves","mask"],q:"A dumper is moving about. Which PPE helps the driver see you?",why:"Hi-vis makes you easy to see, so the driver stops for you."},
    noise:{need:"ears",what:"noise",off:["hat","boots","gloves"],q:"A breaker is working here. It’s very loud. Which PPE protects you?",why:"Ear defenders protect your hearing from loud tools."},
    nails:{need:"boots",what:"nails",off:["hat","glasses","ears"],q:"Old boards full of nails are on the ground. Which PPE protects you?",why:"Safety boots have a midsole that stops nails going through."},
    sparks:{need:"glasses",what:"sparks",off:["boots","vis","mask"],q:"Someone’s grinding steel and sparks are flying. Which PPE protects you?",why:"Safety glasses keep sparks and bits out of your eyes."},
    cement:{need:"gloves",what:"wet cement",off:["ears","hat","vis"],q:"You’re handling wet mortar. Which PPE protects your skin?",why:"Gloves stop wet cement burning your skin."}
  };
  /* Obstacles: the tool that clears it. */
  const OBS={
    wall:{need:"bolster",off:["trowel","level","tape"],q:"An old brick wall is in the way. Which tool cuts through it?",why:"A bolster and club hammer cut bricks and break out old work. Wear safety glasses."},
    high:{need:"ladder",off:["bolster","trowel","hammer"],q:"It’s too high to jump. How does Evia get up safely?",why:"A ladder for a short job: set at 1 in 4, tied or footed."},
    board:{need:"level",off:["tape","trowel","hammer"],q:"The walkway board over the trench looks wonky. Which tool checks it?",why:"The bubble sits between the lines when it’s level."},
    timber:{need:"saw",off:["bolster","trowel","level"],q:"A length of timber is stuck across the path. Which tool cuts it?",why:"A handsaw cuts timber. Let the saw do the work."}
  };
  /* Fires: UK extinguishers are red with a coloured band. */
  const EXT={water:{c:"#d62828",name:"Water"},foam:{c:"#f1dfae",name:"Foam"},co2:{c:"#1f2328",name:"CO₂"},powder:{c:"#1d5fbf",name:"Dry powder"},wet:{c:"#f5d000",name:"Wet chemical"}};
  const FIRES=[
    {kind:"timber",need:"water",off:["co2","wet"],q:"Timber offcuts and cardboard are on fire. Which extinguisher?",why:"Water (red) for wood, paper and cardboard."},
    {kind:"fuel",need:"foam",off:["water","wet"],q:"Petrol from the generator has caught fire. Which extinguisher?",why:"Foam (cream) for burning liquids like petrol. Never water."},
    {kind:"electric",need:"co2",off:["water","foam"],q:"The electrics in the site cabin are on fire. Which extinguisher?",why:"CO₂ (black) for electrical fires. Water and foam conduct electricity."},
    {kind:"oil",need:"wet",off:["water","foam"],q:"Cooking oil in the canteen is on fire. Which extinguisher?",why:"Wet chemical (yellow) for cooking oil. Water makes it explode."},
    {kind:"gas",need:"powder",off:["water","wet"],q:"A gas cylinder is on fire. Which extinguisher?",why:"Dry powder (blue) for gas fires, but only if the gas can be turned off. If not, get out and call 999."}
  ];
  /* Paperwork: documents and regulations. */
  const DOCS=[
    {id:"induction",ic:"doc",a:"Site induction",off:["Permit to work","RIDDOR report","Delivery note"],q:"First day on a new site. What do you need before you start work?",why:"The induction covers the site rules, hazards, first aid and fire points."},
    {id:"ra",ic:"doc",a:"Risk assessment",off:["Method statement","Delivery note","RIDDOR report"],q:"Before the job starts: which document finds the hazards and how to control them?",why:"A risk assessment looks at what could cause harm and how to stop it."},
    {id:"ms",ic:"doc",a:"Method statement",off:["Risk assessment","COSHH assessment","Delivery note"],q:"Which document sets out, step by step, how the job will be done safely?",why:"The method statement is the safe order of work. With the risk assessment it’s called RAMS."},
    {id:"coshh",ic:"regs",a:"COSHH",off:["LOLER","RIDDOR","PUWER"],q:"Wet cement can burn skin. Which regulations cover hazardous substances?",why:"COSHH: Control of Substances Hazardous to Health."},
    {id:"loler",ic:"regs",a:"LOLER",off:["COSHH","RIDDOR","Manual Handling Regs"],q:"A telehandler lifts blocks up to the scaffold. Which regulations cover lifting equipment?",why:"LOLER: Lifting Operations and Lifting Equipment Regulations."},
    {id:"riddor",ic:"regs",a:"RIDDOR",off:["COSHH","LOLER","PUWER"],q:"Someone breaks an arm in a fall on site. Which regulations say it must be reported to the HSE?",why:"RIDDOR: Reporting of Injuries, Diseases and Dangerous Occurrences Regulations."},
    {id:"wah",ic:"regs",a:"Work at Height Regs",off:["COSHH","RIDDOR","Manual Handling Regs"],q:"Working from a scaffold. Which regulations cover this?",why:"The Work at Height Regulations cover any work where you could fall and be hurt."},
    {id:"puwer",ic:"regs",a:"PUWER",off:["COSHH","RIDDOR","Work at Height Regs"],q:"The disc cutter must suit the job, be kept in good order and used by trained people. Which regulations?",why:"PUWER: Provision and Use of Work Equipment Regulations."},
    {id:"mh",ic:"regs",a:"Manual Handling Regs",off:["LOLER","COSHH","RIDDOR"],q:"Carrying heavy blocks by hand. Which regulations cover this?",why:"The Manual Handling Operations Regulations: avoid, assess, then reduce the risk."},
    {id:"permit",ic:"doc",a:"Permit to work",off:["Delivery note","RIDDOR report","Site induction"],q:"Hot works with a gas torch near timber. What must be in place first?",why:"A permit to work controls high-risk jobs like hot works and confined spaces."},
    {id:"toolbox",ic:"doc",a:"Toolbox talk",off:["Site induction","RIDDOR report","Method statement"],q:"A short safety briefing on one topic, given on site. What’s it called?",why:"Toolbox talks keep everyone up to date on one hazard at a time."},
    {id:"cdm",ic:"regs",a:"CDM 2015",off:["COSHH","LOLER","RIDDOR"],q:"Which regulations say who plans and manages health and safety on building projects?",why:"CDM: the Construction (Design and Management) Regulations 2015."}
  ];
  /* Drawings: hatching, sign types, scales and plan symbols. "v" is the picture shown in the belt. */
  const SYMS=[
    {v:"h-brick",a:"Brickwork",off:["Concrete","Insulation"],q:"On a section drawing, what does this hatching show?",why:"Brickwork is shown with diagonal lines."},
    {v:"h-concrete",a:"Concrete",off:["Brickwork","Timber"],q:"On a section drawing, what does this hatching show?",why:"Concrete is shown with dots and small triangles (the stones)."},
    {v:"h-insulation",a:"Insulation",off:["Brickwork","Hardcore"],q:"On a section drawing, what does this hatching show?",why:"Insulation is shown with a looping line."},
    {v:"h-timber",a:"Timber",off:["Concrete","Insulation"],q:"On a section drawing, what does this hatching show?",why:"Timber is shown with its grain."},
    {v:"h-hardcore",a:"Hardcore",off:["Concrete","Timber"],q:"On a section drawing, what does this hatching show?",why:"Hardcore is shown as broken stones."},
    {v:"s-prohibit",a:"Prohibition: you must not",off:["Mandatory: you must","Warning: danger"],q:"What type of safety sign is this?",why:"Red circle with a line through it: you must not."},
    {v:"s-mandatory",a:"Mandatory: you must",off:["Prohibition: you must not","Safe condition"],q:"What type of safety sign is this?",why:"Blue circle: you must do this, like wear a hard hat."},
    {v:"s-warning",a:"Warning: danger",off:["Mandatory: you must","Safe condition"],q:"What type of safety sign is this?",why:"Yellow triangle: warns of a danger."},
    {v:"s-safe",a:"Safe condition",off:["Warning: danger","Prohibition: you must not"],q:"What type of safety sign is this?",why:"Green: safe condition, like first aid or the way out."},
    {v:"scale-50",a:"3 m",off:["30 m","0.3 m"],q:"At 1:50, this wall measures 60 mm on the drawing. How long is it really?",why:"60 × 50 = 3000 mm, which is 3 m."},
    {v:"scale-100",a:"2.5 m",off:["25 m","0.25 m"],q:"At 1:100, this wall measures 25 mm on the drawing. How long is it really?",why:"25 × 100 = 2500 mm, which is 2.5 m."},
    {v:"scale-20",a:"3 m",off:["0.3 m","30 m"],q:"At 1:20, this wall measures 150 mm on the drawing. How long is it really?",why:"150 × 20 = 3000 mm, which is 3 m."},
    {v:"p-door",a:"A door (and which way it opens)",off:["A window","Stairs"],q:"What does this plan symbol show?",why:"The arc shows the door swinging open."},
    {v:"p-window",a:"A window",off:["A door (and which way it opens)","Stairs"],q:"What does this plan symbol show?",why:"Thin lines across the opening show the glass."},
    {v:"p-stairs",a:"Stairs",off:["A window","A door (and which way it opens)"],q:"What does this plan symbol show?",why:"The lines are the treads; the arrow points up."}
  ];
  /* The pictures for the drawing questions (SVG, 80 × 56). */
  function symSvg(v){
    const o='<svg viewBox="0 0 80 56" class="sr-vis" aria-hidden="true">',c='</svg>',box='<rect x="4" y="6" width="72" height="44" fill="#fff" stroke="#1f2937" stroke-width="1.6"/>';
    const clip='<clipPath id="srb"><rect x="4" y="6" width="72" height="44"/></clipPath>';
    if(v==="h-brick"){let l="";for(let i=-50;i<80;i+=6)l+='<path d="M'+i+' 50L'+(i+44)+' 6"/>';return o+clip+box+'<g clip-path="url(#srb)" stroke="#1f2937" stroke-width="1">'+l+'</g>'+c}
    if(v==="h-concrete"){let l="";const pts=[[10,14],[22,30],[36,16],[50,38],[64,20],[16,42],[44,24],[60,44],[28,44],[70,32],[8,28],[56,12]];pts.forEach(([x,y],i)=>{l+=i%2?'<path d="M'+x+' '+y+'l4 -6l4 6z" fill="none"/>':'<circle cx="'+x+'" cy="'+y+'" r="1.3" fill="#1f2937"/>';l+='<circle cx="'+(x+7)+'" cy="'+(y-4)+'" r=".9" fill="#1f2937"/>'});return o+box+'<g stroke="#1f2937" stroke-width="1">'+l+'</g>'+c}
    if(v==="h-insulation"){let l="";for(let x=8;x<72;x+=8)l+='<path d="M'+x+' 48 C'+(x-6)+' 30 '+(x+10)+' 26 '+(x+4)+' 8"/>';return o+box+'<g fill="none" stroke="#1f2937" stroke-width="1">'+l+'</g>'+c}
    if(v==="h-timber"){let l="";for(let r=6;r<70;r+=7)l+='<path d="M4 '+(50-r*.2)+' Q'+(4+r)+' '+(50-r*.6)+' '+(4+r*1.1)+' 6"/>';return o+clip+box+'<g clip-path="url(#srb)" fill="none" stroke="#1f2937" stroke-width="1">'+l+'</g>'+c}
    if(v==="h-hardcore"){const st=["M8 12l8-2 4 6-6 5-7-3z","M26 10l9 1 1 7-8 3-4-6z","M44 12l10-1 3 8-9 3z","M62 10l9 2-1 8-8-1z","M10 30l8-3 5 6-5 7-8-3z","M30 28l9-1 2 9-9 3-4-6z","M50 30l8 1 1 8-9 2z","M64 28l8 3-2 8-7-2z","M20 42l7-2 3 6-9 1z","M42 42l8 0 2 5-9 1z"];return o+box+'<g fill="none" stroke="#1f2937" stroke-width="1.1">'+st.map(d=>'<path d="'+d+'"/>').join("")+'</g>'+c}
    if(v==="s-prohibit")return o+'<circle cx="40" cy="28" r="22" fill="#fff" stroke="#d62828" stroke-width="6"/><path d="M25 13L55 43" stroke="#d62828" stroke-width="6"/>'+c;
    if(v==="s-mandatory")return o+'<circle cx="40" cy="28" r="24" fill="#0b5cad"/><path d="M40 15v17" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="40" r="3" fill="#fff"/>'+c;
    if(v==="s-warning")return o+'<path d="M40 5L66 50H14Z" fill="#f5c400" stroke="#1f2937" stroke-width="3.5" stroke-linejoin="round"/><path d="M40 20v15" stroke="#1f2937" stroke-width="4.5" stroke-linecap="round"/><circle cx="40" cy="42" r="2.6" fill="#1f2937"/>'+c;
    if(v==="s-safe")return o+'<rect x="16" y="4" width="48" height="48" rx="3" fill="#16a34a"/><path d="M34 14h12v8h8v12h-8v8H34v-8h-8V22h8z" fill="#fff"/>'+c;
    if(v.startsWith("scale-")){const t={"scale-50":["60 mm","1:50"],"scale-100":["25 mm","1:100"],"scale-20":["150 mm","1:20"]}[v];
      return o+'<rect x="8" y="24" width="64" height="10" fill="#e5e7eb" stroke="#1f2937" stroke-width="1.2"/><path d="M8 16v8M72 16v8M8 19h64" stroke="#1f2937" stroke-width="1.2"/><text x="40" y="15" text-anchor="middle" font-size="9" font-weight="700" fill="#1f2937">'+t[0]+'</text><text x="40" y="48" text-anchor="middle" font-size="9" fill="#64748b">Scale '+t[1]+'</text>'+c}
    if(v==="p-door")return o+'<path d="M4 44H26M54 44H76" stroke="#1f2937" stroke-width="5"/><path d="M26 44V14" stroke="#1f2937" stroke-width="2"/><path d="M26 14A30 30 0 0 1 54 44" fill="none" stroke="#1f2937" stroke-width="1" stroke-dasharray="3 2"/>'+c;
    if(v==="p-window")return o+'<path d="M4 28H24M56 28H76" stroke="#1f2937" stroke-width="10"/><path d="M24 23H56M24 28H56M24 33H56M24 23V33M56 23V33" stroke="#1f2937" stroke-width="1.2"/>'+c;
    if(v==="p-stairs"){let l="";for(let x=14;x<=66;x+=6.5)l+='<path d="M'+x+' 12V44"/>';return o+'<rect x="8" y="12" width="64" height="32" fill="#fff" stroke="#1f2937" stroke-width="1.6"/><g stroke="#1f2937" stroke-width="1">'+l+'</g><path d="M12 28H66" stroke="#1f2937" stroke-width="1.4"/><path d="M60 24L67 28L60 32" fill="none" stroke="#1f2937" stroke-width="1.4"/><text x="16" y="25" font-size="7" font-weight="700" fill="#1f2937">UP</text>'+c}
    return "";
  }
  const extSvg=k=>'<svg viewBox="4 2.5 16 21" aria-hidden="true"><path d="M9 3.5h4v2H9z" fill="#3f4a57"/><path d="M13 4.5l4.5-1.5v2.2L13 6z" fill="#3f4a57"/><rect x="7" y="5.5" width="8" height="17" rx="3" fill="#d62828"/><rect x="7" y="10" width="8" height="5" fill="'+EXT[k].c+'" stroke="rgba(0,0,0,.25)" stroke-width=".6"/></svg>';

  /* ---------- Levels ----------
     Each op moves along the site: run (ground, with coins), gap, ppe (a hazard area), tool (an obstacle), fire, doc
     (paperwork gate), sym (drawing gate), q (course question boxes), boss, flag (the finish).
     plat, crate, cp (checkpoint cone), aid (first aid) and kit (full PPE) are placed without moving on. */
  const LEVELS=[
    {name:"First day on site",about:"Induction, falling bricks, nails, a wall to cut through and a fire.",ops:[
      ["run",300,4],["doc","induction"],["run",200,3],["ppe","fall",380],["run",140],["crate",60,44],["run",200,4],["gap",90],
      ["cp"],["q"],["run",120,3],["tool","wall"],["run",160,3],["ppe","nails",260],["run",140],["aid",60],["fire"],["run",180,3],
      ["sym"],["cp"],["q"],["run",140,4],["flag"]]},
    {name:"Cutting and mixing",about:"Dust, wet cement and noise. Level a wonky board.",ops:[
      ["run",300,4],["doc"],["run",140],["ppe","dust",380],["run",160,3],["gap",100],["plat",20,90,140,3],["run",200],
      ["cp"],["q"],["ppe","cement",300],["run",120],["tool","board"],["crate",90,40],["crate",200,80],["run",260,4],
      ["fire"],["run",140],["ppe","noise",340],["run",120],["aid",50],["sym"],["cp"],["doc"],["q"],["run",120,3],["flag"]]},
    {name:"The busy site",about:"Moving plant, sparks, a ladder and the full PPE kit.",ops:[
      ["run",300,4],["ppe","plant",480],["run",120],["cp"],["q"],["ppe","sparks",300],["run",120],["tool","timber"],["run",160,3],
      ["plat",40,90,120],["kit",90,122],["run",320],["ppe","fall",260],["ppe","nails",240],["ppe","noise",280],["run",140],["cp"],
      ["tool","high"],["run",140,4],["fire"],["run",120],["doc"],["aid",40],["sym"],["cp"],["q"],["run",120],["flag"]]},
    {name:"Boss: the Big Mixer",about:"Jump into three right answers to switch it off.",boss:true,ops:[
      ["run",320,5],["aid",140],["run",60],["boss"]]}
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
          const a=o.a|0,wrong=shuffle(o.opts.filter((_,i)=>i!==a)).slice(0,2),opts=shuffle([o.opts[a],...wrong]);
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
    return shuffle(pool);
  }
  /* Paperwork, fires and drawings come round in a new order, without repeats until each list is used up. */
  const decks={};
  function draw1(name,list){if(!decks[name]||!decks[name].length)decks[name]=shuffle(list);return decks[name].pop()}

  /* ---------- Saved progress (per course) ---------- */
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(_){return {}}};
  const ckey=()=>typeof course!=="undefined"&&course?course:"any";
  const prog=()=>{const s=load()[ckey()]||{};return {open:Math.max(1,s.open|0),stars:(s.stars||[]).slice(0,LEVELS.length)}};
  function saveProg(p){const s=load();s[ckey()]=p;try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}

  /* ---------- Build a level ----------
     Every stop is an "encounter" {type, opts[{k,label,ic|ext}], a (the right k), q, why, done} on a solid Evia walks
     into: an invisible stop line for hazard areas, the obstacle itself, the fire, or a gate for paperwork and drawings. */
  function build(n,qs){
    const L=LEVELS[n],w={solids:[],plats:[],coins:[],picks:[],zones:[],stations:[],encs:[],cps:[],flag:null,boss:null,end:0};
    let x=0;
    const ground=len=>{w.solids.push({x,y:GY,w:len,h:1200,kind:"ground"})};
    const coinRow=(x0,len,n,y)=>{for(let i=0;i<n;i++)w.coins.push({x:x0+(len/(n+1))*(i+1),y})};
    let qi=0;const nextQ=()=>qs[qi++%qs.length];
    const enc=(e,solid)=>{e.done=false;e.solid=solid;solid.enc=e;w.encs.push(e);w.solids.push(solid);return e};
    const opts=(right,off,n,mk)=>shuffle([right].concat(shuffle(off).slice(0,n-1))).map(mk);
    for(const op of L.ops){
      const [t,a,b,c,d]=op;
      if(t==="run"){ground(a);if(b)coinRow(x,a,b,GY-40);x+=a}
      else if(t==="gap"){w.coins.push({x:x+a/2,y:GY-110});x+=a}
      else if(t==="ppe"){
        const H=HAZ[a];ground(b);
        const z={kind:a,x,w:b,t:0,brick:0,dumper:a==="plant"?{x:x+b-80,dir:-1}:null};w.zones.push(z);
        enc({type:"ppe",tag:"PPE",x,zone:z,need:H.need,q:H.q,why:H.why,what:H.what,a:H.need,opts:opts(H.need,H.off,4,k=>({k,label:ICON[k].name,ic:k}))},{x:x-2,y:GY-400,w:4,h:400,kind:"stop"});
        x+=b;
      }
      else if(t==="tool"){
        const O=OBS[a],e={type:"tool",tag:"Tools",obs:a,q:O.q,why:O.why,a:O.need,opts:opts(O.need,O.off,4,k=>({k,label:ICON[k].name,ic:k}))};
        if(a==="wall"){ground(320);enc(e,{x:x+130,y:GY-170,w:36,h:170,kind:"wall",brk:0});x+=320}
        else if(a==="high"){ground(380);enc(e,{x:x+140,y:GY-200,w:70,h:200,kind:"block-wall",placed:false});x+=380}
        else if(a==="timber"){ground(320);enc(e,{x:x+140,y:GY-150,w:26,h:150,kind:"timber",cut:0});x+=320}
        else{ground(120);const bd={x:x+120,y:GY,w:200,board:e};w.plats.push(bd);e.board=bd;enc(e,{x:x+116,y:GY-400,w:4,h:400,kind:"stop"});x+=320;ground(160);x+=160}
      }
      else if(t==="fire"){
        const F=draw1("fire",FIRES);ground(280);
        enc({type:"fire",tag:"Fire",fire:F.kind,q:F.q,why:F.why,a:F.need,opts:opts(F.need,F.off,3,k=>({k,label:EXT[k].name,ext:k})),out:0},{x:x+150,y:GY-400,w:50,h:400,kind:"fire",t:0});
        x+=280;
      }
      else if(t==="doc"){
        const D=a?DOCS.find(q=>q.id===a):draw1("doc",DOCS.filter(q=>q.id!=="induction"));ground(280);
        enc({type:"doc",tag:"Paperwork",q:D.q,why:D.why,a:D.a,opts:opts(D.a,D.off,4,k=>({k,label:k,ic:/Regs|COSHH|LOLER|RIDDOR|PUWER|CDM/.test(k)?"regs":"doc"}))},{x:x+170,y:GY-300,w:22,h:300,kind:"gate",sign:"doc",lift:0});
        x+=280;
      }
      else if(t==="sym"){
        const S=draw1("sym",SYMS);ground(280);
        enc({type:"sym",tag:"Drawings and signs",v:S.v,q:S.q,why:S.why,a:S.a,opts:opts(S.a,S.off,3,k=>({k,label:k}))},{x:x+170,y:GY-300,w:22,h:300,kind:"gate",sign:"sym",lift:0});
        x+=280;
      }
      else if(t==="aid"||t==="kit")w.picks.push({kind:t,x:x+(a==null?60:a),y:GY-30-(b||0)});
      else if(t==="plat"){w.plats.push({x:x+a,y:GY-b,w:c});if(d)coinRow(x+a,c,d,GY-b-28)}
      else if(t==="crate")w.solids.push({x:x+a,y:GY-b,w:40,h:b,kind:"crate"});
      else if(t==="cp")w.cps.push({x:x+30,on:false});
      else if(t==="q"){
        ground(440);const q=nextQ(),st={x,q,tries:0,done:false,blocks:[],bar:null};
        q.opts.forEach((o,i)=>{const bl={x:x+(q.opts.length===2?150:120)+i*84,y:GY-144,w:46,h:34,kind:"block",st,i,state:""};st.blocks.push(bl);w.solids.push(bl)});
        st.bar={x:x+390,y:GY-300,w:22,h:300,kind:"bar",st,lift:0};w.solids.push(st.bar);w.stations.push(st);x+=440;
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
      '<div class="sr-hud"><div class="sr-hearts" aria-label="Hearts"></div><b class="sr-name"></b><span class="sr-coins">'+coinSvg()+'<b>0</b></span><button type="button" class="sr-x" aria-label="Close">×</button></div>'+
      '<div class="sr-top"><div class="sr-q" hidden></div><div class="sr-toast" role="status" aria-live="polite"></div></div>'+
      '<div class="sr-belt" role="dialog" aria-label="Evia’s tool belt" hidden></div>'+
      '<div class="sr-pad" hidden><button type="button" data-k="l" aria-label="Left"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" data-k="r" aria-label="Right"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button><button type="button" data-k="j" class="sr-jump" aria-label="Jump"><svg viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg></button></div>'+
      '<div class="sr-menu"></div></div>';
    const $=s=>ctx.body.querySelector(s);
    const wrap=$(".sr"),cv=$("canvas"),g=cv.getContext("2d"),menu=$(".sr-menu"),qEl=$(".sr-q"),toastEl=$(".sr-toast"),pad=$(".sr-pad"),belt=$(".sr-belt");
    const css=getComputedStyle(document.documentElement),accent=css.getPropertyValue("--yellow").trim()||"#f5c400";
    let W=0,H=0,dpr=1,scale=1,camX=0,camY=0,land=true;
    const size=()=>{const r=wrap.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+"px";cv.style.height=H+"px";
      land=W>=H;scale=land?H/360:W/360;wrap.classList.toggle("port",!land);pad.hidden=!land||state!=="play"};
    let state="menu",lv=0,w=null,p=null,raf=0,last=0,fs=false,cur=null;
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
    const kd=e=>{
      const n=/^Digit([1-4])$/.exec(e.code);if(n&&state==="belt"){const b=belt.querySelectorAll("[data-o]")[n[1]-1];if(b&&!b.disabled)b.click();return}
      const k=KM[e.code];if(!k||state!=="play"||e.target.closest&&e.target.closest("button"))return;e.preventDefault();if(!e.repeat)press(k)};
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
    function toast(msg,key,gap,long){const now=performance.now();if(key){if(said[key]&&now-said[key]<(gap||3000))return;said[key]=now}toastEl.textContent=msg;toastEl.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove("on"),long?4200:2600)}
    function hud(){
      if(!p)return;
      $(".sr-hearts").innerHTML=[0,1,2].map(i=>'<svg viewBox="0 0 24 24" class="'+(i<p.hearts?"on":"")+'"><path d="M12 20.5l-1.4-1.3C5.4 14.5 2 11.4 2 7.6 2 4.5 4.4 2 7.5 2c1.8 0 3.4.8 4.5 2.1C13.1 2.8 14.7 2 16.5 2 19.6 2 22 4.5 22 7.6c0 3.8-3.4 6.9-8.6 11.6z"/></svg>').join("");
      $(".sr-hearts").setAttribute("aria-label",p.hearts+" hearts left");
      $(".sr-coins b").textContent=p.coins;
    }

    /* ---------- Menu and cards ---------- */
    const star=on=>'<svg viewBox="0 0 24 24" class="sr-star'+(on?" on":"")+'"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>';
    const quiet=()=>{qEl.hidden=true;pad.hidden=true;belt.hidden=true};
    function showMenu(){
      state="menu";quiet();wrap.classList.remove("playing");const pr=prog();
      menu.hidden=false;menu.innerHTML='<div class="sr-card sr-levels"><button type="button" class="sr-x sr-cx" aria-label="Close">×</button><h2>Evia’s Site Run</h2><p>When something’s in the way, pick the right PPE, tool, extinguisher or paperwork from Evia’s tool belt.</p>'+
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
      lv=n;qs=deal(questions(),n);w=build(n,qs);cur=null;
      p={x:60,y:GY-PH,vx:0,vy:0,face:1,ground:true,coy:0,hearts:3,inv:0,power:0,worn:{},coins:0,cp:60,climb:null,missed:0,dead:0,auto:1};
      Object.keys(said).forEach(k=>delete said[k]);
      menu.hidden=true;menu.innerHTML="";state="play";wrap.classList.add("playing");pad.hidden=!land;belt.hidden=true;qEl.hidden=true;shownQ=null;parts.length=0;
      $(".sr-name").textContent=LEVELS[n].name;hud();
      toast(land?"Move with the arrows and jump. When something’s in the way, Evia’s tool belt opens.":"Evia runs on her own. Tap to jump. When something’s in the way, her tool belt opens.",0,0,1);
      last=performance.now();
    }
    function lose(){
      state="over";buzz([30,40,30]);quiet();
      card('<h2>Out of hearts</h2><p class="sr-sub">Read the signs and think about what the hazard could do to you before you choose.</p>',[["again","Try again","primary"],["levels","Levels"]]);
    }
    function win(){
      state="won";quiet();buzz([20,30,20]);
      const allRight=p.missed===0,coinsOk=p.coins>=Math.ceil(w.total*.8),stars=1+(allRight?1:0)+(coinsOk?1:0);
      const pr=prog();pr.stars[lv]=Math.max(pr.stars[lv]|0,stars);pr.open=Math.max(pr.open,Math.min(LEVELS.length,lv+2));saveProg(pr);
      const want=Math.min(20,Math.floor(p.coins/3)+stars*2),got=want&&R()&&R().gameCoins?R().gameCoins(want):0;ctx.coins();
      if(got&&window.eviaMood)window.eviaMood("happy");
      const end=lv===LEVELS.length-1;
      card('<h2>'+(end?"Big Mixer switched off!":"Level complete")+'</h2><div class="sr-stars">'+[0,1,2].map(k=>star(k<stars)).join("")+'</div>'+
        '<ul class="sr-why"><li class="ok">Got to the end</li><li class="'+(allRight?"ok":"")+'">'+(allRight?"Every choice right first time":p.missed+" wrong "+(p.missed===1?"choice":"choices"))+'</li><li class="'+(coinsOk?"ok":"")+'">Coins: '+p.coins+" of "+w.total+'</li></ul>'+
        '<div class="gm-end-coins">'+coinSvg()+'<b>+'+got+'</b><span>'+(got?"coins":want?"Today’s game coins are all collected. Play for fun!":"coins")+'</span></div>',
        end?[["levels","Levels","primary"],["again","Play again"]]:[["next","Next level","primary"],["again","Play again"],["levels","Levels"]]);
    }

    /* ---------- Rules ---------- */
    const hitBox=(a,b)=>a.x<b.x+b.w&&a.x+PW>b.x&&a.y<b.y+b.h&&a.y+PH>b.y;
    const safe=()=>p.inv>0||p.power>0;
    const worn=k=>p.power>0||!!p.worn[k];
    const parts=[];
    const burst=(x,y,col,n,sp)=>{if(reduced())n=Math.ceil(n/3);for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*(sp||4),vy:-Math.random()*(sp||4),life:30+Math.random()*20,col,r:2+Math.random()*2.5})};
    function loseHeart(msg){
      p.hearts--;p.inv=90;buzz(40);toast(msg,0,0,1);hud();
      if(p.hearts<=0){state="dying";belt.hidden=true;setTimeout(lose,700);return true}
      return false;
    }
    function hurt(msg){if(safe()||state!=="play")return;p.vy=-7;p.vx=-3.5*p.face;loseHeart(msg)}
    function respawn(){
      p.hearts--;hud();if(p.hearts<=0){state="dying";setTimeout(lose,300);return}
      p.x=p.cp;p.y=GY-PH-80;p.vx=p.vy=0;p.inv=90;p.climb=null;toast("Mind the gaps! Back to the last cone.");buzz(40);
    }
    function collect(k){
      if(k==="aid"){if(p.hearts<3){p.hearts++;toast("First aid kit: one heart back.")}else toast("First aid kit. You’re fine, but it’s good to know where it is.");hud();return}
      if(k==="kit"){p.power=480;toast("Full PPE kit! Nothing can hurt you for a bit.");buzz([15,30,15])}
    }

    /* ---------- The tool belt ----------
       Evia stops; the belt opens with the choices. Right: the way clears. Wrong: that choice greys out, and a wrong
       PPE or extinguisher costs a heart. */
    function openBelt(e){
      if(e.done||state!=="play")return;
      if(e.type==="ppe"&&worn(e.need)){clear(e,true);return}
      state="belt";cur=e;keys.l=keys.r=keys.j=0;jb=0;p.vx=0;pad.hidden=true;qEl.hidden=true;buzz(10);
      const pics=e.type==="sym"?symSvg(e.v):"";
      belt.innerHTML='<div class="sr-belt-head">'+(pics?'<span class="sr-belt-pic">'+pics+'</span>':"")+'<p><b>'+esc(e.tag)+'</b>'+esc(e.q)+'</p></div>'+
        '<div class="sr-belt-strap"><div class="sr-belt-opts n'+e.opts.length+'">'+e.opts.map((o,i)=>'<button type="button" data-o="'+i+'" class="'+(o.ic||o.ext?"":"txt")+'">'+
          (o.ext?extSvg(o.ext):o.ic?svg(o.ic):"")+'<span>'+esc(o.label)+'</span></button>').join("")+'</div></div>';
      belt.hidden=false;
      belt.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>choose(+b.dataset.o,b));
      setTimeout(()=>{const b=belt.querySelector("[data-o]");try{b&&b.focus({preventScroll:true})}catch(_){}},60);
    }
    function choose(i,b){
      const e=cur;if(!e||state!=="belt")return;const o=e.opts[i];
      if(o.k===e.a){
        belt.hidden=true;state="play";cur=null;pad.hidden=!land;buzz(15);last=performance.now();
        toast("Right! "+e.why,0,0,e.why.length>60);clear(e);
      }else{
        b.disabled=true;b.classList.add("no");p.missed++;buzz([20,30]);
        if(e.type==="ppe")loseHeart(ICON[o.k].name+" won’t protect you from "+e.what+".");
        else if(e.type==="fire")loseHeart(EXT[o.k].name+" is the wrong one here. The fire spreads!");
        else toast("Not that one. Try again.");
      }
    }
    /* The way clears: PPE goes on, the wall breaks, the fire goes out, the gate lifts. */
    function clear(e,already){
      e.done=true;const s=e.solid;
      if(e.type==="ppe"){if(!already)p.worn[e.need]=true;else if(!p.power)toast(ICON[e.need].name+" still on. On you go.");s.gone=true;burst(p.x+PW/2,p.y,ICON[e.need].c,10)}
      else if(e.type==="tool"){
        if(e.obs==="wall")s.brk=1;
        else if(e.obs==="high"){s.placed=true}
        else if(e.obs==="timber")s.cut=1;
        else{e.board.fixed=true;s.gone=true}
      }
      else if(e.type==="fire")e.out=1;
      else s.lift=.001;
      for(let k=0;k<2;k++){w.coins.push({x:s.x+60+k*22,y:GY-50});w.total++}
    }
    function answer(st,i){
      const boss=st===w.boss;
      if(boss?(!st.q||st.wait>0):st.done)return;
      const q=st.q,bl=st.blocks[i];if(!bl||bl.state==="no")return;
      if(i===q.a){
        bl.state="ok";burst(bl.x+23,bl.y,"#16a34a",14);buzz(15);
        toast("Right! "+(q.why||""),0,0,1);
        if(boss){st.hp--;st.hit=40;st.right++;st.wait=90;st.q=null;if(st.hp<=0){st.dead=true;w.flag={x:st.x+540};st.blobs.length=0}}
        else{st.done=true;for(let k=0;k<3;k++){w.coins.push({x:st.bar.x-80+k*20,y:GY-60});w.total++}}
      }else{
        bl.state="no";st.tries++;p.missed++;buzz([20,30]);
        toast("Not that one. "+(q.tf?"":"Have another go."));
        if(boss){st.t=Math.max(st.t,100);if(st.tries>=q.opts.length-1){st.wait=70;st.q=null;toast("It was: "+q.opts[q.a]+". "+(q.why||""),0,0,1)}}
      }
    }

    function stepPlayer(d){
      let dir=keys.r-keys.l,speed=land?RUN:AUTO;
      /* Portrait: Evia runs on her own; under question boxes and in the boss arena she paces to and fro. */
      if(!land){
        let lo=null,hi=null;const B=w.boss;
        if(B&&B.on&&!B.dead){lo=B.x+110;hi=B.x+470}
        else{const st=w.stations.find(s=>!s.done&&p.x>s.x+40&&p.x<s.bar.x);if(st){lo=st.blocks[0].x-6;hi=st.blocks[st.blocks.length-1].x+30;speed=AUTO*.6}}
        if(lo!=null){if(p.x>hi)p.auto=-1;if(p.x<lo)p.auto=1;dir=p.auto}else dir=1;
      }
      if(p.climb){const g=p.climb;p.vx=0;p.vy=0;p.y-=3*d;p.x=g.x-PW;if(p.y+PH<=g.y){p.y=g.y-PH-1;p.x=g.x+2;p.climb=null}return}
      const top=speed*dir;p.vx+=(top-p.vx)*Math.min(1,(p.ground?.28:.12)*d);if(dir)p.face=dir;
      if(jb>0&&(p.ground||p.coy>0)){p.vy=JUMP;jb=0;p.coy=0;p.ground=false;buzz(5)}
      p.vy+=GRAV*d*(land&&p.vy<-4&&!keys.j?2:1);   /* a short press is a small hop, except for portrait taps */
      if(p.vy>16)p.vy=16;
      const S=w.solids.filter(s=>!s.gone);
      /* across */
      p.x+=p.vx*d;if(p.x<0)p.x=0;
      for(const s of S){if(!hitBox(p,s))continue;
        if(p.vx>0||(p.vx===0&&p.x<s.x)){p.x=s.x-PW;if(s.placed){p.climb=s}else if(s.enc)openBelt(s.enc)}else p.x=s.x+s.w;p.vx=0}
      /* up and down */
      const oldB=p.y+PH;p.y+=p.vy*d;const wasG=p.ground;p.ground=false;
      for(const s of S){if(!hitBox(p,s))continue;
        if(p.vy>=0&&oldB<=s.y+1){p.y=s.y-PH;p.vy=0;p.ground=true}
        else if(p.vy<0){p.y=s.y+s.h;p.vy=0;if(s.kind==="block")answer(s.st,s.i)}}
      if(p.vy>=0)for(const q of w.plats){if(q.board&&!q.board.done)continue;
        if(p.x+PW>q.x&&p.x<q.x+q.w&&oldB<=q.y+1&&p.y+PH>=q.y){p.y=q.y-PH;p.vy=0;p.ground=true}}
      if(wasG&&!p.ground&&p.vy>=0)p.coy=land?6:9;
    }

    function update(dt){
      const cx=p.x+PW/2;
      /* things that keep moving while the belt is open */
      for(const z of w.zones)z.t+=dt;
      for(const e of w.encs){const s=e.solid;
        if(s.kind==="fire"){s.t+=dt;if(e.out){e.out+=dt;if(e.out<50&&Math.random()<.7)parts.push({x:s.x-10+Math.random()*10,y:GY-40-Math.random()*20,vx:3+Math.random()*2,vy:-Math.random(),life:24,col:"#e5e7eb",r:5});if(e.out>50)s.gone=true}}
        if(s.brk&&!s.gone){s.brk+=dt;if(s.brk>24){s.gone=true;burst(s.x+18,GY-80,"#b5654a",26,6)}}
        if(s.cut&&!s.gone){s.cut+=dt;if(s.cut>24){s.gone=true;burst(s.x+13,GY-80,"#c79b62",18,5)}}
        if(s.lift&&!s.gone){s.lift=Math.min(1,s.lift+.04*dt);if(s.lift>=1)s.gone=true}
      }
      if(state!=="play"&&state!=="dying")return;
      const n=Math.ceil(dt),d=dt/n;
      for(let i=0;i<n;i++){if(state==="play")stepPlayer(d);if(jb>0)jb-=d;if(p.coy>0)p.coy-=d}
      if(p.inv>0)p.inv-=dt;if(p.power>0)p.power-=dt;
      if(p.y>GY+140&&state==="play")respawn();
      for(const k of w.picks){if(k.got)continue;const dx=k.x-cx,dy=k.y-(p.y+PH/2);
        if(!land&&Math.abs(dx)<110&&Math.abs(dy)<160){k.x-=dx*.12;k.y-=dy*.12}
        if(Math.abs(dx)<26&&Math.abs(dy)<40){k.got=true;collect(k.kind);burst(k.x,k.y,ICON[k.kind].c,12)}}
      for(const c of w.coins){if(c.got)continue;if(Math.abs(c.x-cx)<20&&Math.abs(c.y-(p.y+PH/2))<24){c.got=true;p.coins++;$(".sr-coins b").textContent=p.coins;burst(c.x,c.y,"#f5b800",5,2.5)}}
      for(const c of w.cps)if(!c.on&&p.x>c.x-10){c.on=true;p.cp=c.x;toast("Checkpoint.")}
      /* hazard areas: once the right PPE is on, they can't hurt her; they still look the part */
      for(const z of w.zones){
        const near=cx>z.x-40&&cx<z.x+z.w+40;
        if(z.kind==="fall"){
          if(near){z.brick-=dt;if(z.brick<=0){z.brick=48+Math.random()*20;const bx=Math.max(z.x+10,Math.min(z.x+z.w-30,p.x+(Math.random()*180-40)+p.vx*20));(z.bricks=z.bricks||[]).push({x:bx,y:GY-220,vy:2,vx:0,w:22,h:11,dead:0})}}
          for(const b of z.bricks||[]){b.vy+=.32*dt;b.y+=b.vy*dt;b.x+=b.vx*dt;
            if(!b.dead&&b.x<p.x+PW&&b.x+b.w>p.x&&b.y<p.y+PH&&b.y+b.h>p.y){b.dead=1;b.vy=-5;b.vx=2.5;burst(b.x,b.y,"#f5b800",6,3)}
            if(b.y+b.h>=GY&&!b.gone){b.gone=true;burst(b.x+11,GY,"#b5654a",8,3)}}
          if(z.bricks)z.bricks=z.bricks.filter(b=>!b.gone&&b.y<GY+40);
        }
        if(z.kind==="sparks"&&Math.random()<.5)parts.push({x:z.x+z.w*.5,y:GY-44,vx:(Math.random()-.3)*6,vy:-Math.random()*4,life:18,col:Math.random()<.5?"#fb923c":"#fde047",r:2});
        if(z.kind==="plant"){const m=z.dumper;m.stop=worn("vis")&&Math.abs(m.x+35-cx)<260;
          if(!m.stop){m.x+=m.dir*1.8*dt;if(m.x<z.x){m.x=z.x;m.dir=1}if(m.x>z.x+z.w-70){m.x=z.x+z.w-70;m.dir=-1}}}
      }
      /* the boss */
      const B=w.boss;
      if(B){
        if(!B.on&&p.x>B.x+60){B.on=true;B.wall.gone=false;B.ask();toast("The Big Mixer! Jump into the right answer three times.",0,0,1)}
        if(B.on&&!B.dead){
          if(B.wait>0){B.wait-=dt;if(B.wait<=0)B.ask()}
          B.t-=dt;if(B.hit>0)B.hit-=dt;
          if(B.t<=0){B.t=reduced()?150:120-(3-B.hp)*15;
            const sx=B.mixer.x+20,sy=GY-120,T=62,tx=cx+p.vx*20;B.blobs.push({x:sx,y:sy,vx:(tx-sx)/T,vy:(GY-10-sy-.5*.3*T*T)/T})}
        }
        for(const b of B.blobs){b.vy+=.3*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
          if(!b.done&&Math.abs(b.x-cx)<18&&Math.abs(b.y-(p.y+PH/2))<22){b.done=1;hurt("Mortar! Keep moving and jump clear.")}
          if(b.y>=GY-4){b.done=1;B.splats.push({x:b.x,t:120})}}
        B.blobs=B.blobs.filter(b=>!b.done);B.splats.forEach(s=>s.t-=dt);B.splats=B.splats.filter(s=>s.t>0);
      }
      for(const s of w.stations)if(s.done&&s.bar.lift<1){s.bar.lift=Math.min(1,s.bar.lift+.04*dt);if(s.bar.lift>=1)s.bar.gone=true}
      if(w.flag&&p.x+PW>w.flag.x&&state==="play"){win();return}
      question();
    }

    /* The question banner: shows as Evia gets near the question boxes (and all through the boss). She answers by
       jumping into a box; the banner only shows the question and what each letter means. */
    let shownQ=null;
    function question(){
      let st=null,q=null;
      const B=w.boss;if(B&&B.on&&!B.dead&&B.q){st=B;q=B.q}
      else for(const s of w.stations)if(!s.done&&p.x>s.x-320&&p.x<s.x+420){st=s;q=s.q;break}
      if(!q){if(shownQ){qEl.hidden=true;shownQ=null}return}
      const sig=q.q+"|"+st.blocks.map(b=>b.state).join();
      if(shownQ===sig)return;shownQ=sig;qEl.hidden=false;
      const L=q.tf?["T","F"]:["A","B","C"];
      qEl.innerHTML='<p>'+esc(q.q)+'</p><div class="sr-opts">'+q.opts.map((o,i)=>'<span class="'+(st.blocks[i].state||"")+'"><b>'+L[i]+'</b>'+esc(o)+'</span>').join("")+'</div><small>Jump into the right box.</small>';
    }

    /* ---------- Drawing ---------- */
    const rr=(x,y,w2,h2,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w2,h2,r);else g.rect(x,y,w2,h2)};
    function icon(k,x,y,s,col){g.save();g.translate(x-s/2,y-s/2);g.scale(s/24,s/24);g.fillStyle=col||ICON[k].c;g.fill(path(k),ICON[k].eo?"evenodd":"nonzero");g.restore()}
    function bricks(x,y,w2,h2,col){g.fillStyle=col||"#b8674b";g.fillRect(x,y,w2,h2);g.strokeStyle="rgba(255,255,255,.55)";g.lineWidth=1.2;g.beginPath();
      for(let yy=y+9;yy<y+h2;yy+=9){g.moveTo(x,yy);g.lineTo(x+w2,yy)}
      for(let yy=y,r=0;yy<y+h2;yy+=9,r++)for(let xx=x+(r%2?10:0);xx<x+w2;xx+=20){if(xx>x){g.moveTo(xx,yy);g.lineTo(xx,Math.min(y+h2,yy+9))}}g.stroke()}
    function background(){
      const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#e6ecf2");sky.addColorStop(1,"#f7f8fa");g.fillStyle=sky;g.fillRect(0,0,W,H);
      g.save();g.scale(scale,scale);g.translate(0,-camY);const vw=W/scale;
      const off=(camX*.25)%420;g.fillStyle="#d9e0e7";
      for(let x=-off-420;x<vw+420;x+=420){g.fillRect(x+20,GY-150,70,150);g.fillRect(x+100,GY-95,54,95);g.fillRect(x+250,GY-185,62,185);
        g.strokeStyle="#cfd7df";g.lineWidth=4;g.beginPath();g.moveTo(x+340,GY);g.lineTo(x+340,GY-230);g.lineTo(x+440,GY-230);g.moveTo(x+300,GY-230);g.lineTo(x+340,GY-230);g.moveTo(x+420,GY-230);g.lineTo(x+420,GY-195);g.stroke()}
      const o2=(camX*.6)%300;
      for(let x=-o2-300;x<vw+300;x+=300){g.fillStyle="#e3e8ed";g.fillRect(x,GY-64,190,64);g.fillStyle="#d5dce3";g.fillRect(x,GY-64,190,5);
        g.strokeStyle="#d3d9df";g.lineWidth=1.5;g.strokeRect(x+200,GY-52,86,52);g.beginPath();for(let k=x+206;k<x+286;k+=8){g.moveTo(k,GY-52);g.lineTo(k,GY)}g.stroke();g.fillStyle="#cdd4db";g.fillRect(x+196,GY-6,10,6);g.fillRect(x+280,GY-6,10,6)}
      g.restore();
    }
    function drawEvia(){
      const cx=p.x+PW/2,cy=p.y+15,flick=p.inv>0&&!p.power&&state!=="belt"&&Math.floor(p.inv/5)%2;
      if(flick)return;
      const t=performance.now()/1000,bob=p.ground&&Math.abs(p.vx)>.5?Math.abs(Math.sin(t*14))*1.6:0;
      g.save();g.translate(cx,cy-bob);
      if(p.power>0){g.fillStyle="rgba(22,163,74,"+(.18+.1*Math.sin(t*10))+")";g.beginPath();g.arc(0,2,27,0,Math.PI*2);g.fill();g.strokeStyle="rgba(22,163,74,.6)";g.lineWidth=2;g.stroke()}
      if(worn("boots")){g.fillStyle="#2f343a";const sw=p.ground&&Math.abs(p.vx)>.5?Math.sin(t*14)*3:0;rr(-12+sw,13,11,7,2.5);g.fill();rr(1-sw,13,11,7,2.5);g.fill();g.fillStyle="#f5b800";g.fillRect(-12+sw,18,11,1.5);g.fillRect(1-sw,18,11,1.5)}
      /* the body: the original round Evia, white with the learner's colour as the outline */
      g.save();g.scale(.34,.34);g.translate(-50,-50);const body=new Path2D();body.arc(50,50,46,0,Math.PI*2);
      g.fillStyle="#fff";g.fill(body);
      if(worn("vis")){g.save();g.clip(body);g.fillStyle="#fb8c1a";g.fillRect(0,64,100,40);g.fillStyle="#e8ecef";g.fillRect(0,72,100,6);g.fillRect(0,84,100,6);g.restore()}
      g.strokeStyle=accent;g.lineWidth=9;g.lineJoin="round";g.stroke(body);
      g.restore();
      const ex=p.face*2;g.strokeStyle=accent;g.lineWidth=2.6;g.lineCap="round";g.beginPath();g.moveTo(-4.5+ex,-4);g.lineTo(-4.5+ex,1.5);g.moveTo(4.5+ex,-4);g.lineTo(4.5+ex,1.5);g.stroke();
      if(worn("glasses")){g.fillStyle="rgba(147,197,253,.45)";g.strokeStyle="#1f2937";g.lineWidth=1.3;rr(-10+ex,-6,20,9,3);g.fill();g.stroke();g.beginPath();g.moveTo(-10+ex,-3);g.lineTo(-16,-4);g.moveTo(10+ex,-3);g.lineTo(16,-4);g.stroke()}
      if(worn("mask")){g.fillStyle="#f1f4f6";g.strokeStyle="#9aa6b2";g.lineWidth=1;g.beginPath();g.moveTo(-8+ex,4);g.quadraticCurveTo(ex,1.5,8+ex,4);g.lineTo(6+ex,9.5);g.quadraticCurveTo(ex,13,-6+ex,9.5);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(-8+ex,4.5);g.lineTo(-16,1);g.moveTo(8+ex,4.5);g.lineTo(16,1);g.stroke()}
      if(worn("ears")){g.strokeStyle="#3f4a57";g.lineWidth=2.4;g.beginPath();g.arc(0,-2,17,Math.PI*1.08,Math.PI*1.92);g.stroke();g.fillStyle="#3f4a57";rr(-20,-6,6,12,3);g.fill();rr(14,-6,6,12,3);g.fill()}
      if(worn("gloves")){g.fillStyle="#2563eb";g.beginPath();g.arc(-17,8,4.2,0,Math.PI*2);g.arc(17,8,4.2,0,Math.PI*2);g.fill()}
      if(worn("hat")){g.fillStyle="#f5b800";g.beginPath();g.arc(0,-11,12,Math.PI,0);g.closePath();g.fill();g.fillStyle="#d99f00";g.fillRect(-1.2,-22.5,2.4,11);rr(-16,-12,32,3.8,1.9);g.fillStyle="#e2a700";g.fill()}
      g.restore();
    }
    /* A hazard area: a yellow warning sign at the start (it warns; it doesn't give the answer), then the hazard. */
    function drawZone(z,e){
      const t=z.t;
      if(z.kind==="fall"){g.strokeStyle="#9aa5b1";g.lineWidth=4;g.beginPath();g.moveTo(z.x,GY-222);g.lineTo(z.x+z.w,GY-222);g.stroke();g.fillStyle="#9aa5b1";for(let x=z.x;x<=z.x+z.w+1;x+=z.w/4)g.fillRect(x-2,GY-222,4,222);
        g.fillStyle="#c79b62";g.fillRect(z.x,GY-226,z.w,6);bricks(z.x+z.w*.3,GY-250,60,24);bricks(z.x+z.w*.7,GY-244,40,18);
        for(const b of z.bricks||[]){if(b.y<GY-20&&!b.dead){g.fillStyle="rgba(15,23,42,"+Math.min(.22,(b.y-(GY-220))/700)+")";g.beginPath();g.ellipse(b.x+11,GY,12,3,0,0,Math.PI*2);g.fill()}bricks(b.x,b.y,b.w,b.h)}}
      if(z.kind==="nails"){g.fillStyle="#c9a26a";g.fillRect(z.x,GY-4,z.w,4);g.fillStyle="#6b7280";for(let x=z.x+5;x<z.x+z.w;x+=9){g.beginPath();g.moveTo(x-2,GY-4);g.lineTo(x,GY-12);g.lineTo(x+2,GY-4);g.fill()}}
      if(z.kind==="noise"){const bx=z.x+z.w/2;g.fillStyle="#3f4a57";g.fillRect(bx-4,GY-58,8,46);rr(bx-14,GY-66,28,10,4);g.fill();g.fillStyle="#fb8c1a";rr(bx-9,GY-40,18,20,3);g.fill();g.fillStyle="#6b7280";g.fillRect(bx-1.5,GY-14,3,14);
        g.strokeStyle="rgba(63,74,87,.3)";g.lineWidth=3;for(let i=0;i<3;i++){const r=((t*1.4+i*40)%120)+10;g.globalAlpha=1-r/130;g.beginPath();g.arc(bx,GY-40,r,Math.PI*1.05,Math.PI*1.95);g.stroke()}g.globalAlpha=1}
      if(z.kind==="plant"){const m=z.dumper,x=m.x,y=GY-46;g.fillStyle="#f5b800";g.beginPath();g.moveTo(x+(m.dir<0?40:0),y);g.lineTo(x+(m.dir<0?70:30),y);g.lineTo(x+(m.dir<0?66:26),y+26);g.lineTo(x+(m.dir<0?44:4),y+26);g.fill();
        g.fillStyle="#e2a700";g.fillRect(x+4,y+22,62,10);g.fillStyle="#3f4a57";g.fillRect(x+(m.dir<0?8:48),y-14,14,22);g.fillStyle="#2f343a";for(const wx of [x+14,x+56]){g.beginPath();g.arc(wx,GY-9,9,0,Math.PI*2);g.fill()}
        const on=Math.floor(t/10)%2;g.fillStyle=m.stop?(on?"#fb8c1a":"#fde3c2"):"#fb8c1a";g.beginPath();g.arc(x+(m.dir<0?15:55),y-18,4,0,Math.PI*2);g.fill()}
      if(z.kind==="sparks"){const bx=z.x+z.w*.5;g.fillStyle="#8d99a8";g.fillRect(bx-60,GY-40,120,6);g.fillRect(bx-54,GY-34,5,34);g.fillRect(bx+49,GY-34,5,34);g.fillStyle="#3f4a57";rr(bx-8,GY-54,20,10,3);g.fill();g.fillStyle="#9aa3ad";g.beginPath();g.arc(bx,GY-44,7,0,Math.PI*2);g.fill()}
      if(z.kind==="cement"){g.fillStyle="#9ca3af";for(let x=z.x+30;x<z.x+z.w-30;x+=90){g.beginPath();g.ellipse(x,GY-2,26,5,0,0,Math.PI*2);g.fill()}
        const bx=z.x+z.w*.55;g.fillStyle="#c79b62";g.fillRect(bx-30,GY-26,60,6);g.fillRect(bx-26,GY-20,5,20);g.fillRect(bx+21,GY-20,5,20);g.fillStyle="#8b9098";g.beginPath();g.ellipse(bx,GY-29,24,7,0,Math.PI,0);g.fill();
        g.fillStyle="#3f4a57";rr(bx+40,GY-28,20,28,3);g.fill();g.fillStyle="#8b9098";g.fillRect(bx+42,GY-28,16,5)}
      /* the warning sign */
      const sx=z.x-26;g.fillStyle="#8d99a8";g.fillRect(sx-2,GY-64,4,64);g.fillStyle="#f5c400";g.strokeStyle="#1f2937";g.lineWidth=2.5;g.lineJoin="round";g.beginPath();g.moveTo(sx,GY-100);g.lineTo(sx+19,GY-66);g.lineTo(sx-19,GY-66);g.closePath();g.fill();g.stroke();
      g.fillStyle="#1f2937";g.fillRect(sx-1.6,GY-91,3.2,14);g.beginPath();g.arc(sx,GY-72,2,0,Math.PI*2);g.fill();
      if(e&&!e.done){g.strokeStyle="rgba(220,38,38,.55)";g.lineWidth=3;g.setLineDash([6,5]);g.beginPath();g.moveTo(z.x,GY);g.lineTo(z.x,GY-60);g.stroke();g.setLineDash([])}
    }
    function drawFire(e){
      const s=e.solid,x=s.x,t=s.t,k=e.fire;
      if(k==="timber"){g.fillStyle="#b88a52";for(let i=0;i<4;i++)g.fillRect(x+2+i*3,GY-10-i*7,46-i*6,6);g.fillStyle="#c9a26a";g.fillRect(x+6,GY-36,24,8)}
      if(k==="fuel"){g.fillStyle="#f5b800";rr(x,GY-36,50,36,4);g.fill();g.fillStyle="#3f4a57";g.fillRect(x+6,GY-28,18,12);g.fillStyle="#2f343a";g.beginPath();g.arc(x+36,GY-18,6,0,Math.PI*2);g.fill()}
      if(k==="electric"){g.fillStyle="#9aa3ad";rr(x+4,GY-58,42,58,3);g.fill();g.fillStyle="#f5c400";g.beginPath();g.moveTo(x+27,GY-50);g.lineTo(x+18,GY-32);g.lineTo(x+25,GY-32);g.lineTo(x+21,GY-18);g.lineTo(x+32,GY-38);g.lineTo(x+25,GY-38);g.closePath();g.fill()}
      if(k==="oil"){g.fillStyle="#6b7280";g.fillRect(x,GY-30,50,30);g.fillStyle="#3f4a57";g.fillRect(x+8,GY-38,34,8);g.fillRect(x+40,GY-36,16,3)}
      if(k==="gas"){g.fillStyle="#d62828";rr(x+12,GY-56,26,56,9);g.fill();g.fillStyle="#6b7280";g.fillRect(x+20,GY-64,10,8)}
      if(e.done&&e.out>50)return;
      const out=e.out?Math.max(0,1-e.out/50):1,base=k==="electric"?GY-58:k==="gas"?GY-64:k==="oil"?GY-38:GY-34;
      for(let i=0;i<5;i++){const fx=x+8+i*9,h=(26+Math.sin(t*.25+i*1.7)*8+(i%2?6:0))*out;
        g.fillStyle="rgba(249,115,22,.9)";g.beginPath();g.moveTo(fx-7,base);g.quadraticCurveTo(fx-6,base-h*.6,fx,base-h);g.quadraticCurveTo(fx+6,base-h*.6,fx+7,base);g.fill();
        g.fillStyle="rgba(253,224,71,.95)";g.beginPath();g.moveTo(fx-3.5,base);g.quadraticCurveTo(fx-3,base-h*.35,fx,base-h*.55);g.quadraticCurveTo(fx+3,base-h*.35,fx+3.5,base);g.fill()}
      g.fillStyle="rgba(100,116,139,"+(.22*out)+")";for(let i=0;i<4;i++){g.beginPath();g.arc(x+25+Math.sin(t*.05+i)*8,base-50-i*30-((t*.8)%30),14+i*5,0,Math.PI*2);g.fill()}
    }
    /* A gate: a fence panel with a sign (paperwork, drawings, or ? for course questions). It lifts when opened. */
    function drawGate(s,sign){
      const y=s.y-(s.lift||0)*300;g.save();g.beginPath();g.rect(s.x-30,s.y-300,s.w+60,s.h+300);g.clip();
      g.fillStyle="#8d99a8";g.fillRect(s.x,y,4,s.h);g.fillRect(s.x+s.w-4,y,4,s.h);g.strokeStyle="rgba(141,153,168,.6)";g.lineWidth=1;for(let yy=y;yy<y+s.h;yy+=6){g.beginPath();g.moveTo(s.x,yy);g.lineTo(s.x+s.w,yy);g.stroke()}
      g.fillStyle=sign==="q"?accent:"#fff";rr(s.x-13,y+s.h-118,s.w+26,32,7);g.fill();g.strokeStyle="rgba(15,23,42,.15)";g.lineWidth=1;g.stroke();
      if(sign==="q"){g.fillStyle="#fff";g.font="800 18px system-ui,sans-serif";g.textAlign="center";g.fillText("?",s.x+s.w/2,y+s.h-95)}
      else if(sign==="doc")icon("doc",s.x+s.w/2,y+s.h-102,22,"#475569");
      else{const bx=s.x+s.w/2-11,by=y+s.h-112;g.strokeStyle="#1f2937";g.lineWidth=1.4;g.strokeRect(bx,by,22,20);g.save();g.beginPath();g.rect(bx,by,22,20);g.clip();g.beginPath();for(let k=-20;k<22;k+=5){g.moveTo(bx+k,by+20);g.lineTo(bx+k+20,by)}g.lineWidth=1;g.stroke();g.restore()}
      g.restore();
      if(sign==="doc"&&!s.gone){const cx=s.x-120;g.fillStyle="#cfd6de";g.fillRect(cx,GY-70,86,70);g.fillStyle="#b8c1cb";g.fillRect(cx-4,GY-74,94,6);g.fillStyle="#eef2f6";g.fillRect(cx+10,GY-56,26,18);g.fillStyle="#9aa3ad";g.fillRect(cx+54,GY-50,20,50);
        g.fillStyle="#475569";g.font="700 9px system-ui,sans-serif";g.textAlign="center";g.fillText("SITE OFFICE",cx+43,GY-60)}
      if(sign==="sym"&&!s.gone){const ex=s.x-80;g.strokeStyle="#8d6a3e";g.lineWidth=3;g.beginPath();g.moveTo(ex-18,GY);g.lineTo(ex,GY-70);g.lineTo(ex+18,GY);g.stroke();g.fillStyle="#fff";g.strokeStyle="#9aa3ad";g.lineWidth=1.5;g.fillRect(ex-24,GY-76,48,34);g.strokeRect(ex-24,GY-76,48,34);
        g.strokeStyle="#64748b";g.lineWidth=1;g.beginPath();for(let i=0;i<5;i++){g.moveTo(ex-20+i*8,GY-46);g.lineTo(ex-12+i*8,GY-72)}g.stroke()}
    }
    function draw(){
      g.setTransform(dpr,0,0,dpr,0,0);
      if(!w){const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#e6ecf2");sky.addColorStop(1,"#f7f8fa");g.fillStyle=sky;g.fillRect(0,0,W,H);return}
      /* the ground sits high enough that the buttons and the tool belt fit inside it */
      const vw=W/scale,vh=H/scale;camY=land?GY-250:GY-vh*.62;
      const B=w.boss;let want=p.x-vw*.35;
      if(B&&B.on)want=vw>=820?B.x-(vw-820)/2:Math.max(B.x-20,Math.min(B.x+820-vw,want));
      else want=Math.max(0,Math.min(w.end-vw,want));
      camX+=(want-camX)*(Math.abs(want-camX)>400?1:.2);
      background();
      g.save();g.scale(scale,scale);g.translate(-camX,-camY);
      const L=camX-140,Rr=camX+vw+60,vis=o=>o.x+(o.w||60)>L&&o.x<Rr;
      for(const z of w.zones)if(vis(z)||vis({x:z.x-40}))drawZone(z,w.encs.find(e=>e.zone===z));
      for(const s of w.solids){if(s.gone&&s.kind!=="fire"||!vis(s))continue;
        if(s.kind==="ground"){g.fillStyle="#e2d9c8";g.fillRect(s.x,s.y,s.w,s.h);g.fillStyle="#c4b89f";g.fillRect(s.x,s.y,s.w,6);g.fillStyle="#d3c8b3";for(let x=s.x+((s.x*7)%23);x<s.x+s.w-6;x+=37)g.fillRect(x,s.y+16+((x*3)%17),6,3)}
        else if(s.kind==="crate"){g.fillStyle="#c79b62";g.fillRect(s.x-2,s.y+s.h-6,s.w+4,6);bricks(s.x,s.y,s.w,s.h-6)}
        else if(s.kind==="wall"){const k=s.brk?Math.min(1,s.brk/24):0;g.globalAlpha=1-k;bricks(s.x+(k?Math.sin(s.brk*3)*2:0),s.y,s.w,s.h);g.globalAlpha=1}
        else if(s.kind==="timber"){const k=s.cut?Math.min(1,s.cut/24):0;g.save();g.globalAlpha=1-k;g.translate(s.x+13,GY);g.rotate(-.18-k*.6);g.fillStyle="#c79b62";g.fillRect(-9,-160,18,160);g.fillStyle="#a57a44";g.fillRect(-9,-160,4,160);g.restore()}
        else if(s.kind==="block-wall"){bricks(s.x,s.y,s.w,s.h,"#c3c7cc");if(s.placed){g.strokeStyle="#a8763e";g.lineWidth=3;g.beginPath();g.moveTo(s.x-12,GY);g.lineTo(s.x-4,s.y-14);g.moveTo(s.x-2,GY);g.lineTo(s.x+6,s.y-14);for(let y=GY-14;y>s.y-10;y-=16){const f=(GY-y)/(GY-s.y+14);g.moveTo(s.x-12+f*8,y);g.lineTo(s.x-2+f*8,y)}g.stroke()}}
        else if(s.kind==="bar")drawGate(s,"q");
        else if(s.kind==="gate")drawGate(s,s.sign);
        else if(s.kind==="fire")drawFire(s.enc);
        else if(s.kind==="block"){const c=s.state==="ok"?"#16a34a":s.state==="no"?"#d9dde2":"#fff";g.fillStyle=c;rr(s.x,s.y,s.w,s.h,7);g.fill();g.strokeStyle=s.state==="no"?"#c3c8ce":s.state==="ok"?"#15803d":accent;g.lineWidth=3;g.stroke();
          const q=s.st.q;if(q){g.fillStyle=s.state==="ok"?"#fff":s.state==="no"?"#9aa3ad":"#1f2937";g.font="800 17px system-ui,sans-serif";g.textAlign="center";g.fillText((q.tf?["T","F"]:["A","B","C"])[s.i],s.x+s.w/2,s.y+23)}}
        else if(s.kind==="mixer"&&B)drawMixer(B);
      }
      for(const q of w.plats){if(!vis(q))continue;
        if(q.board){const f=q.board.done;g.save();g.translate(q.x,q.y);if(!f)g.rotate(.12);g.fillStyle="#c79b62";g.fillRect(0,0,q.w,8);g.fillStyle="#a57a44";g.fillRect(0,8,q.w,2);g.restore();
          if(!f){g.fillStyle="#dc2626";rr(q.x+q.w/2-24,q.y-26,48,16,4);g.fill();g.fillStyle="#fff";g.font="700 10px system-ui,sans-serif";g.textAlign="center";g.fillText("WONKY",q.x+q.w/2,q.y-15)}continue}
        g.fillStyle="#8d99a8";for(const x of [q.x+8,q.x+q.w-12])g.fillRect(x,q.y,4,GY-q.y);g.strokeStyle="#aab4bf";g.lineWidth=2;g.beginPath();g.moveTo(q.x+10,q.y+10);g.lineTo(q.x+q.w-10,GY-4);g.stroke();
        g.fillStyle="#c79b62";g.fillRect(q.x,q.y,q.w,8);g.fillStyle="#a57a44";g.fillRect(q.x,q.y+8,q.w,2)}
      for(const c of w.cps){if(!vis(c))continue;g.fillStyle=c.on?accent:"#fb8c1a";g.beginPath();g.moveTo(c.x-10,GY);g.lineTo(c.x-3,GY-30);g.lineTo(c.x+3,GY-30);g.lineTo(c.x+10,GY);g.fill();g.fillStyle="#fff";g.fillRect(c.x-6,GY-18,12,4)}
      if(w.flag){const f=w.flag;g.fillStyle="#6b7280";g.fillRect(f.x,GY-130,4,130);g.fillStyle=accent;g.beginPath();g.moveTo(f.x+4,GY-128);g.lineTo(f.x+46,GY-114);g.lineTo(f.x+4,GY-100);g.fill()}
      if(B)for(const s of B.splats){g.fillStyle="rgba(120,113,108,"+Math.min(.8,s.t/60)+")";g.beginPath();g.ellipse(s.x,GY-1,14,4,0,0,Math.PI*2);g.fill()}
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
      if(w&&p)update(dt);
      for(const q of parts){q.vy+=.2*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt}
      for(let i=parts.length-1;i>=0;i--)if(parts[i].life<=0)parts.splice(i,1);
      draw();
    }
    ctx.o.srState=()=>({p,w,state,lv,land,belt:cur});   /* for the tests */
    showMenu();raf=requestAnimationFrame(step);
  }

  G.register({id:"game-siterun",key:"siterun",label:"Evia’s Site Run",rarity:"epic",about:"Pick the right PPE, tools, extinguishers and paperwork from Evia’s tool belt to get across the site."},run,
    '<svg viewBox="0 0 24 24"><path d="M2 20h20"/><path d="M4 20v-5h5v5M13 20v-9h6v9"/><circle cx="8" cy="8" r="3"/><path d="M5.5 7.5a2.5 2.5 0 0 1 5 0"/></svg>');
})();
