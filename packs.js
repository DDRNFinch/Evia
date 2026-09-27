/* Evia7 course packs: each trade's content is its own pack, and a learner's phone loads only their own.
   Today a pack is the trade's Teach me file (the biggest part of a trade's content); the unit lists stay in app.js so
   the course picker can show every course. When Nisia supplies packs, fetch() here swaps from script files to
   Nisia's download, and the rest of Evia doesn't change: it asks for eviaPacks.ensure(course) and eviaPacks.pack().

   eviaPacks.files(course)      the files that make up a course's pack
   eviaPacks.ensure(course)     loads them if they aren't already (a Promise); storage.js loads the saved course's at boot
   eviaPacks.loaded(course)     whether they are in
   eviaPacks.unitId(course, name)  a unit's stable id: fixed below for every unit that exists today, so renaming a unit
                                later keeps its id (add the old id against the new name). New units get one from the name.
   eviaPacks.pack(course)       the course in the pack format Nisia will use: { id, version, name, standard, units:[{id,
                                name, ksbs:[{code,text}], lessons}], lessons } (see the "Evia data model" write-up) */
(function(){
  const FILES={
    bricklayer:["teach-bricklayer.js?v=tb-v6"],
    joiner:["teach-joiner.js?v=tj-v3"],
    site:["teach-site.js?v=ts-v3"],
    trowel3:["teach-trowel3.js?v=t3-v2"]
  };
  const VERSION="2026.09.1";
  /* Stable unit ids, frozen from the unit names on 27 Sept 2026. Never change an id: rename the key instead. */
  const UNIT_IDS={
    bricklayer:{"Mixing mortar":"bricklayer/mixing-mortar","Jointing Styles":"bricklayer/jointing-styles","Repair brick walling":"bricklayer/repair-brick-walling","Basic Brick wall":"bricklayer/basic-brick-wall","Set out solid walling":"bricklayer/set-out-solid-walling","Build solid walling":"bricklayer/build-solid-walling","Set out Cavity Walling":"bricklayer/set-out-cavity-walling","Construct Cavity Walling":"bricklayer/construct-cavity-walling","Cavity opening":"bricklayer/cavity-opening","Gable end/Raked wall":"bricklayer/gable-end-raked-wall"},
    site:{"Structural carcassing":"site/structural-carcassing","Timber/metal partition walls":"site/timber-metal-partition-walls","Floor joists (and coverings)":"site/floor-joists-and-coverings","Straight flights of stairs":"site/straight-flights-of-stairs","Service encasement":"site/service-encasement","Cladding":"site/cladding","Wall and floor units":"site/wall-and-floor-units","Handrails and spindles":"site/handrails-and-spindles","Internal and external doors":"site/internal-and-external-doors","Skirting boards and architrave":"site/skirting-boards-and-architrave","Window boards":"site/window-boards","Roofs and loft hatch":"site/roofs-and-loft-hatch"},
    joiner:{"Basic woodworking joints":"joiner/basic-woodworking-joints","Timber Window":"joiner/timber-window","Straight staircases":"joiner/straight-staircases","Door frames and linings":"joiner/door-frames-and-linings","Timber doors":"joiner/timber-doors","Wall and floor units":"joiner/wall-and-floor-units","Timber mouldings":"joiner/timber-mouldings","Staircase spindles and balustrades":"joiner/staircase-spindles-and-balustrades","Ironmongery":"joiner/ironmongery","Fixed Machinery":"joiner/fixed-machinery"},
    trowel3:{"Arches":"trowel3/arches","Chimney stack":"trowel3/chimney-stack","Fireplace":"trowel3/fireplace","Decorative features":"trowel3/decorative-features","Curved wall (on plan)":"trowel3/curved-wall-on-plan","Curved wall (in elevation)":"trowel3/curved-wall-in-elevation","Splayed wall":"trowel3/splayed-wall","Setting out a building":"trowel3/setting-out-a-building","Setting out angles and batters":"trowel3/setting-out-angles-and-batters","Setting out curves":"trowel3/setting-out-curves","Setting out openings":"trowel3/setting-out-openings","Cavity wall":"trowel3/cavity-wall","Blockwork":"trowel3/blockwork","Solid wall":"trowel3/solid-wall","Openings":"trowel3/openings","Cills, cappings and copings":"trowel3/cills-cappings-and-copings","Thin joint cavity wall":"trowel3/thin-joint-cavity-wall","Thin joint solid wall":"trowel3/thin-joint-solid-wall","Thin joint openings":"trowel3/thin-joint-openings","Cladding a timber frame":"trowel3/cladding-a-timber-frame","Cladding a concrete frame":"trowel3/cladding-a-concrete-frame","Cladding a steel frame":"trowel3/cladding-a-steel-frame","Cladding existing masonry":"trowel3/cladding-existing-masonry","Fire barriers and support angles":"trowel3/fire-barriers-and-support-angles","Brick soffit system":"trowel3/brick-soffit-system","Channel systems":"trowel3/channel-systems","Wind posts":"trowel3/wind-posts","Vapour and moisture barriers":"trowel3/vapour-and-moisture-barriers","Wall starter kits":"trowel3/wall-starter-kits","Replacing damaged brickwork":"trowel3/replacing-damaged-brickwork","Extending or tying into existing walls":"trowel3/extending-or-tying-into-existing-walls","New opening in an existing wall":"trowel3/new-opening-in-an-existing-wall","Drainage pipework":"trowel3/drainage-pipework","Inspection chamber":"trowel3/inspection-chamber","Surface water system":"trowel3/surface-water-system","Foul water system":"trowel3/foul-water-system"}
  };
  const slug=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  const unitId=(course,name)=>!course||!name?null:(UNIT_IDS[course]&&UNIT_IDS[course][name])||course+"/"+slug(name);
  const loading={},done={};
  const plain=f=>f.split("?")[0];
  /* A file counts as loaded if a script for it is already on the page (storage.js adds the saved course's at boot). */
  const onPage=f=>[...document.scripts].some(s=>s.src&&plain(new URL(s.src,location.href).pathname).endsWith("/"+plain(f)));
  const files=course=>(FILES[course]||[]).slice();
  const loaded=course=>files(course).every(f=>done[f]||onPage(f));
  function load(f){
    if(done[f]||onPage(f))return Promise.resolve();
    return loading[f]||(loading[f]=new Promise((resolve,reject)=>{
      const s=document.createElement("script");s.src=f;s.async=false;
      s.onload=()=>{done[f]=true;resolve()};
      s.onerror=()=>{delete loading[f];reject(new Error("Couldn’t load "+plain(f)+". Connect to the internet once to download this course."))};
      document.head.appendChild(s);
    }));
  }
  const ensure=course=>Promise.all(files(course).map(load)).then(()=>course);
  function pack(course){
    const c=typeof C!=="undefined"&&C[course];if(!c)return null;
    const lessons=((window.EVIA_TEACH||{}).courses||{})[course]||[];
    const split=k=>{const i=String(k).indexOf("|");return {code:i<0?String(k):String(k).slice(0,i),text:i<0?"":String(k).slice(i+1)}};
    return {id:course,version:VERSION,name:c.name,standard:c.std,
      units:c.u.map(u=>({id:unitId(course,u[0]),name:u[0],ksbs:(u[1]||[]).map(split),lessons:(lessons.find(l=>l.unit===u[0])||{lessons:[]}).lessons.map(l=>l.id)})),
      lessons:lessons.map(l=>({unit:l.unit,lessons:l.lessons.map(x=>({id:x.id,title:x.title,steps:(x.steps||[]).length}))}))};
  }
  window.eviaPacks={VERSION,files,ensure,loaded,unitId,pack,COURSES:Object.keys(FILES)};
})();
