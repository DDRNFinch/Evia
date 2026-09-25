/* Evia7 Teach me pictures (window.EVIA_TEACH.pics). SVG, drawn here so they work offline and scale cleanly.
   Accuracy comes first: brickwork is drawn to real sizes (215 × 65 mm faces, 102.5 mm headers, 10 mm joints,
   75 mm courses) with the right laps and closers; safety signs follow ISO 7010 shapes and colours; PPE, plant
   and tools look like the real kit. The Evia colour is only used where colour carries no meaning. */
(function(){
  const T=window.EVIA_TEACH=window.EVIA_TEACH||{courses:{},fs:[]};
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const r=v=>Math.round(v*100)/100;
  const svg=(w,h,body,label,at)=>'<svg class="tp" viewBox="'+(at||"0 0")+' '+w+' '+h+'" role="img" aria-label="'+esc(label)+'">'+body+'</svg>';
  const t=(x,y,s,c)=>'<text x="'+x+'" y="'+y+'"'+(c?' class="'+c+'"':"")+'>'+esc(s)+'</text>';
  const t2=(x,y,a,b,c)=>'<text x="'+x+'" y="'+y+'"'+(c?' class="'+c+'"':"")+'>'+esc(a)+'<tspan x="'+x+'" dy="12">'+esc(b)+'</tspan></text>';
  let uid=0;
  const P={};

  /* ---------- Brickwork to scale ----------
     s is px per mm. faces(k) lists course k's faces in mm, laid from the left with 10 mm joints and cut off at the
     edge of the panel: 215 a stretcher, 102.5 a header or half bat, 46.25 a queen closer. */
  const rep=(a,n)=>Array.from({length:n},(_,k)=>a[k%a.length]);
  const BOND={
    stretcher:k=>k%2?[102.5].concat(rep([215],30)):rep([215],30),
    english:k=>k%2?[102.5,46.25].concat(rep([102.5],40)):rep([215],30),
    flemish:k=>k%2?[102.5,46.25].concat(rep([215,102.5],30)):rep([215,102.5],30),
    /* English garden wall: three stretcher courses (half bond) to one header course, closer after the quoin header. */
    garden:k=>k%4===3?[102.5,46.25].concat(rep([102.5],40)):k%4===1?[102.5].concat(rep([215],30)):rep([215],30)
  };
  const kind=f=>f===215?"":f===46.25?" tp-cl":f===102.5?" tp-hd":"";
  function brickwork(x,y,w,courses,s,faces,o){
    o=o||{};const hdr=o.headers!==false;
    let out='<rect class="tp-mortar" x="'+r(x)+'" y="'+r(y)+'" width="'+r(w)+'" height="'+r(courses*75*s-10*s)+'"/>';
    for(let k=0;k<courses;k++){
      const cy=y+k*75*s;
      if(o.band)out+='<rect class="'+o.band(k)+'" x="'+r(x)+'" y="'+r(k?cy-10*s:cy)+'" width="'+r(w)+'" height="'+r(k?75*s:65*s)+'"/>';
      let at=0,j=0;const f=faces(k);
      while(at*s<w-.01&&j<f.length){
        const fw=Math.min(f[j],w/s-at);
        out+='<rect class="tp-b'+(1+(k*7+j*3+(k*j)%5)%3)+(hdr&&fw===f[j]?kind(f[j]):"")+'" x="'+r(x+at*s)+'" y="'+r(cy)+'" width="'+r(fw*s)+'" height="'+r(65*s)+'"/>';
        at+=f[j]+10;j++;
      }
    }
    return out;
  }

  /* ---------- Buckets and tools ---------- */
  /* A black builder's bucket seen slightly from above. mode: level (struck off), heaped, under (not full), empty. */
  function bucket(cx,top,fill,mode,k){
    const id="tpk"+(++uid);
    let g='<g transform="translate('+cx+' '+top+')'+(k&&k!==1?' scale('+k+')':"")+'"><ellipse class="tp-bin" cx="0" cy="0" rx="20" ry="6"/>';
    if(mode==="level"||mode==="heaped")g+='<ellipse class="'+fill+'" cx="0" cy=".4" rx="18.6" ry="4.9"/>';
    if(mode==="under")g+='<clipPath id="'+id+'"><ellipse cx="0" cy="0" rx="19" ry="5.3"/></clipPath><ellipse class="'+fill+'" clip-path="url(#'+id+')" cx="0" cy="7" rx="17.4" ry="4.6"/>';
    g+='<path class="tp-bkt" d="M-20 0 L-15 36 A15 4.5 0 0 0 15 36 L20 0 A20 6 0 0 1 -20 0 Z"/><path class="tp-bktl" d="M-17.5 7 L-13.5 33"/>';
    g+='<ellipse class="tp-rim" cx="0" cy="0" rx="20" ry="6"/>';
    if(mode==="heaped")g+='<path class="'+fill+' tp-edge" d="M-19 .5 Q0 -27 19 .5 A19 5.5 0 0 1 -19 .5 Z"/><path class="tp-rim" d="M20 0 A20 6 0 0 1 -20 0"/>';
    return g+'<path class="tp-wire" d="M-19 3 Q0 24 19 3"/></g>';
  }
  const shovel=(x,y,a,fill)=>'<g transform="translate('+x+' '+y+') rotate('+a+')"><path class="tp-grip" d="M0 -6 H-10 Q-14 -6 -14 -2 V2 Q-14 6 -10 6 H0"/><rect class="tp-wood" x="0" y="-2.2" width="64" height="4.4" rx="2"/>'+
    '<path class="tp-steel" d="M62 -4 L68 -9 H86 Q93 -9 93 -2 V2 Q93 9 86 9 H68 L62 4 Z"/>'+(fill?'<path class="'+fill+'" d="M71 -8 Q84 -16 91 -7 Z"/>':"")+'</g>';
  /* A brick trowel from the side, with mortar of the given kind on the blade. */
  function trowel(ox,oy,kind){
    const M={
      good:'<path class="tp-wet" d="M12 63.5 C13 50 25 40 39 40.5 C53 41 63 51 65 63.5 Z"/><path class="tp-sheen" d="M24 50 C30 44 40 43 48 45"/>',
      wet:'<path class="tp-wet" d="M3 63.5 C6 59 20 57.5 37 57.5 C54 57.5 66 59 72 63.5 Z"/><path class="tp-wet" d="M5 64 Q2.5 70 5 74 Q7.5 70 5 64 Z M70 64 Q67.5 71 70 76 Q72.5 71 70 64 Z M38 67 Q36 72 38 75 Q40 72 38 67 Z"/><ellipse class="tp-water" cx="37" cy="59.5" rx="20" ry="1.6" opacity=".7"/><ellipse class="tp-wet" cx="37" cy="84" rx="22" ry="2.6" opacity=".55"/>',
      dry:'<path class="tp-dry2" d="M15 63.5 L17 55 L22 51 L26 53 L30 45 L36 47 L41 43 L47 48 L52 49 L55 55 L59 57 L62 63.5 Z"/><path class="tp-crk" d="M29 48 L32 56 M45 46 L43 54 M53 52 L50 59"/><g class="tp-dry2"><circle cx="18" cy="72" r="1.8"/><circle cx="62" cy="70" r="1.6"/><circle cx="21" cy="80" r="1.4"/><circle cx="60" cy="79" r="1.8"/><circle cx="57" cy="86" r="1.2"/></g>'
    };
    return '<g transform="translate('+ox+' '+oy+')">'+(M[kind]||"")+'<path class="tp-steel" d="M2 63.5 L72 63.5 L72 66.5 L7 66.5 Z"/><path class="tp-shank" d="M70 65 L76 51 L81 51"/>'+
      '<path class="tp-wood" d="M80 46.5 L100 48.5 Q103.5 51 100 53.5 L80 55.5 Z"/><rect class="tp-steel" x="78" y="46" width="4" height="10" rx="1"/></g>';
  }
  /* A site worker in PPE (front view), feet at y. */
  function person(cx,y,o){
    o=o||{};const s=o.scale||1;
    return '<g transform="translate('+cx+' '+y+') scale('+s+')">'+
      '<path class="tp-trou" d="M-11 -44 H-1 L-1.5 -6 H-10.5 Z M1 -44 H11 L10.5 -6 H1.5 Z"/><path class="tp-boot" d="M-12 -7 H-1 V0 H-14 Q-14 -7 -12 -7 Z M1 -7 H12 Q14 -7 14 0 H1 Z"/>'+
      '<path class="tp-navy" d="M-13 -73 Q-10 -77 -4 -77 H4 Q10 -77 13 -73 L14 -42 H-14 Z"/>'+
      (o.arm==="up"?'<path class="tp-navy" d="M11 -72 L24 -84 L28 -80 L15 -66 Z"/><circle class="tp-nitrile" cx="27" cy="-84" r="3.4"/>':'<path class="tp-navy" d="M11 -72 Q17 -68 18 -58 L19 -46 H14 L13 -58 Z"/><circle class="tp-nitrile" cx="16.5" cy="-44" r="3.2"/>')+
      '<path class="tp-navy" d="M-11 -72 Q-17 -68 -18 -58 L-19 -46 H-14 L-13 -58 Z"/><circle class="tp-nitrile" cx="-16.5" cy="-44" r="3.2"/>'+
      '<path class="tp-hivis" d="M-12 -72 Q-9 -76 -5 -76 L-3 -70 H3 L5 -76 Q9 -76 12 -72 L13 -44 H-13 Z"/><rect class="tp-refl" x="-13" y="-57" width="26" height="3"/><rect class="tp-refl" x="-13" y="-50" width="26" height="3"/><rect class="tp-refl" x="-9" y="-74" width="3" height="17"/><rect class="tp-refl" x="6" y="-74" width="3" height="17"/>'+
      '<circle class="tp-head" cx="0" cy="-86" r="8.5"/><path class="tp-hat" d="M-9 -88 Q-9 -99 0 -99 Q9 -99 9 -88 Z"/><path class="tp-hat" d="M-11 -88.5 H11 V-86.5 H-11 Z"/></g>';
  }

  /* A worker in PPE for mixing, front on (drawn in a 320 × 210 space). */
  const PPE=()=>'<ellipse class="tp-shadow" cx="160" cy="203" rx="40" ry="4"/>'+
      '<path class="tp-trou" d="M139 132 H158 L157 186 H141 Z M162 132 H181 L179 186 H163 Z"/>'+
      '<path class="tp-boot" d="M140 184 H157 V200 H134 Q134 188 140 184 Z M163 184 H180 Q186 188 186 200 H163 Z"/><path class="tp-toe" d="M134 196 H148 M172 196 H186"/>'+
      '<path class="tp-navy" d="M136 77 Q124 84 121 104 L115 128 H127 L132 106 Z M184 77 Q196 84 199 104 L205 128 H193 L188 106 Z"/>'+
      '<path class="tp-nitrile" d="M114 126 H128 V139 Q128 147 121 147 Q114 147 114 139 Z M192 126 H206 V139 Q206 147 199 147 Q192 147 192 139 Z"/>'+
      '<rect class="tp-head" x="153" y="60" width="14" height="12"/><path class="tp-navy" d="M136 77 Q140 70 150 69 H170 Q180 70 184 77 L186 134 H134 Z"/>'+
      '<path class="tp-hivis" d="M137 78 Q141 72 150 71 L154 80 H166 L170 71 Q179 72 183 78 L185 132 H135 Z"/><rect class="tp-refl" x="135" y="103" width="50" height="5"/><rect class="tp-refl" x="135" y="116" width="50" height="5"/><rect class="tp-refl" x="143" y="73" width="5" height="30"/><rect class="tp-refl" x="172" y="73" width="5" height="30"/>'+
      '<circle class="tp-head" cx="160" cy="46" r="17"/><path class="tp-strap" d="M143 50 H177"/><rect class="tp-lens" x="145" y="45" width="13" height="9" rx="3.5"/><rect class="tp-lens" x="162" y="45" width="13" height="9" rx="3.5"/>'+
      '<path class="tp-strap2" d="M150 57 L143 54 M170 57 L177 54"/><path class="tp-maskw" d="M149 56 Q160 52 171 56 L169 64 Q160 70 151 64 Z"/>'+
      '<path class="tp-hat" d="M142 40 Q142 22 160 22 Q178 22 178 40 Z"/><path class="tp-hat" d="M137 39.5 H183 Q183 44 179 44 H141 Q137 44 137 39.5 Z"/><path class="tp-thin" d="M160 23 V39"/>';
  /* ---------- Mixing mortar ---------- */
  Object.assign(P,{
    ingredients:()=>svg(320,122,
      '<path class="tp-sand" d="M8 98 C22 70 38 56 54 56 C70 56 86 70 100 98 Z"/><g class="tp-grain"><circle cx="40" cy="80" r="1.2"/><circle cx="58" cy="70" r="1.2"/><circle cx="70" cy="86" r="1.2"/><circle cx="30" cy="92" r="1.2"/><circle cx="52" cy="90" r="1.2"/><circle cx="80" cy="92" r="1.2"/></g>'+
      '<path class="tp-grey" d="M116 44 Q116 38 122 38 H162 Q168 38 168 44 V94 Q168 98 164 98 H120 Q116 98 116 94 Z"/><path class="tp-grey2" d="M116 44 Q116 38 122 38 H162 Q168 38 168 44 V47 H116 Z"/><rect class="tp-grey2" x="116" y="60" width="52" height="17"/>'+
      '<text class="tp-on" x="142" y="72">CEMENT</text><text class="tp-xs" x="142" y="90">25 kg</text>'+
      bucket(205,60,"tp-water","level")+
      '<rect class="tp-can" x="250" y="48" width="44" height="50" rx="6"/><rect class="tp-can" x="255" y="40" width="12" height="9" rx="2"/><path class="tp-canh" d="M275 48 V42 H290 V48"/><rect class="tp-paper" x="256" y="62" width="32" height="20" rx="2"/><path class="tp-thin" d="M261 69 H283 M261 75 H278"/>'+
      t(54,116,"Sand")+t(142,116,"Cement")+t(205,116,"Water")+t(272,116,"Plasticiser"),
      "Building sand, a 25 kg bag of cement, a bucket of water and a tub of plasticiser"),
    ratio:()=>svg(320,112,
      '<g class="tp-pop" style="--d:0">'+bucket(36,40,"tp-cement","level")+'</g>'+t(76,68,":","tp-big")+
      [0,1,2,3].map(i=>'<g class="tp-pop" style="--d:'+(i+1)+'">'+bucket(116+i*50,40,"tp-sand","level")+'</g>').join("")+
      t(36,102,"1 cement")+t(191,102,"4 sand"),"A 1:4 mix: one bucket of cement to four buckets of sand, each filled level"),
    ratio3:()=>svg(320,110,
      bucket(30,46,"tp-cement","level",.72)+t(51,66,":","tp-mid")+bucket(72,46,"tp-lime","level",.72)+t(93,66,":","tp-mid")+
      [0,1,2,3,4,5].map(i=>bucket(116+i*33,46,"tp-sand","level",.72)).join("")+
      t2(30,90,"1","cement")+t2(72,90,"1","lime")+t2(198.5,90,"6","sand"),"A 1:1:6 mix: one bucket of cement, one of lime and six of sand"),
    level:()=>svg(72,82,bucket(36,26,"tp-sand","level",1.3),"A bucket of sand struck off level with the rim"),
    heaped:()=>svg(72,82,bucket(36,26,"tp-sand","heaped",1.3),"A bucket of sand heaped above the rim"),
    under:()=>svg(72,82,bucket(36,26,"tp-sand","under",1.3),"A bucket of sand that isn't filled to the rim"),
    strike:()=>svg(320,132,
      bucket(160,58,"tp-sand","level",1.7)+
      '<g class="tp-slide"><rect class="tp-wood" x="104" y="49" width="118" height="7" rx="1.5"/></g>'+
      '<g class="tp-fall tp-sand"><circle cx="203" cy="66" r="1.6"/><circle cx="207" cy="74" r="1.4"/><circle cx="204" cy="82" r="1.6"/></g><path class="tp-sand" d="M198 126 Q210 112 222 126 Z"/>'+
      '<path class="tp-arrow" d="M238 40 H262"/><path class="tp-arrowh" d="M258 35 L264 40 L258 45"/>'+t(262,28,"Strike off level"),
      "A bucket of sand struck off level with a timber straight edge, the extra falling away"),
    gauge:()=>svg(320,112,
      bucket(60,44,"tp-sand","level",1.2)+'<path class="tp-okm" d="M88 22 L94 28 L106 14"/>'+t(60,104,"Level: right")+
      bucket(160,44,"tp-sand","heaped",1.2)+'<path class="tp-cross" d="M186 14 L200 28 M200 14 L186 28"/>'+t(160,104,"Heaped: wrong")+
      bucket(260,44,"tp-sand","under",1.2)+'<path class="tp-cross" d="M286 14 L300 28 M300 14 L286 28"/>'+t(260,104,"Not full: wrong"),
      "Three buckets: struck off level is right, heaped or not full is wrong"),
    cracks:()=>{
      const s=.13,x1=12,x2=168,y=8,st=BOND.stretcher;
      const pts=[[895,0],[895,70],[782.5,70],[782.5,145],[670,145],[670,220],[557.5,220],[557.5,295],[445,295],[445,370],[332.5,370],[332.5,445],[220,445],[220,520],[107.5,520],[107.5,590]];
      const jag=[[560,0],[541,62],[572,118],[522,186],[548,254],[494,330],[514,402],[468,468],[492,536],[452,590]];
      const path=(x,p)=>"M"+p.map(q=>r(x+q[0]*s)+" "+r(y+q[1]*s)).join(" L");
      return svg(320,122,brickwork(x1,y,140,8,s,st,{headers:false})+'<path class="tp-crk" d="'+path(x1,pts)+'"/>'+
        brickwork(x2,y,140,8,s,st,{headers:false})+'<path class="tp-crk" d="'+path(x2,jag)+'"/>'+
        t(82,101,"Crack in the joints")+t(82,114,"mortar right: easy to repoint","tp-xs")+t(238,101,"Crack through bricks")+t(238,114,"mortar too strong","tp-xs"),
        "Two cracked walls: in one the crack steps along the mortar joints, in the other it splits the bricks");
    },
    banding:()=>svg(320,128,
      brickwork(10,8,240,6,.25,BOND.stretcher,{headers:false,band:k=>k<2?"tp-mortar":k<4?"tp-mortar2":"tp-mortar3"})+
      '<path class="tp-dim" d="M258 9 V42 M258 47 V80 M258 85 V118"/>'+t(290,29,"Batch 1")+t(290,67,"Batch 2")+t(290,104,"Batch 3"),
      "A wall where each batch of mortar dried a different colour, so the joints look patchy"),
    consistency:()=>svg(320,112,
      trowel(2,0,"wet")+trowel(108,0,"good")+trowel(214,0,"dry")+
      t(52,104,"Too wet")+t(158,104,"Just right","tp-ok")+t(264,104,"Too dry"),
      "Three trowels of mortar: too wet and running off, just right and holding its shape, and too dry and crumbly"),
    "trowel-wet":()=>svg(108,92,trowel(2,0,"wet"),"Mortar on a trowel, slumped flat and dripping off the edges"),
    "trowel-good":()=>svg(108,92,trowel(2,0,"good"),"Mortar on a trowel, holding a neat rounded shape"),
    "trowel-dry":()=>svg(108,92,trowel(2,0,"dry"),"Mortar on a trowel, crumbly and cracked with bits falling off"),
    hand1:()=>svg(320,118,
      '<path class="tp-ply" d="M44 90 H276 L294 104 H26 Z"/><path class="tp-ply2" d="M26 104 H294 V109 H26 Z"/>'+
      '<path class="tp-sand" d="M78 96 C98 66 130 54 160 54 C190 54 222 66 242 96 Z"/><path class="tp-cement" d="M126 60 C138 48 182 48 194 60 C184 66 136 66 126 60 Z"/>'+
      bucket(268,66,"","empty",.75),"Sand and cement gauged into a heap on a clean mixing board"),
    hand2:()=>svg(320,118,
      '<path class="tp-ply" d="M44 90 H276 L294 104 H26 Z"/><path class="tp-ply2" d="M26 104 H294 V109 H26 Z"/>'+
      '<path class="tp-dry" d="M78 96 C98 66 130 54 160 54 C190 54 222 66 242 96 Z"/>'+
      '<g class="tp-dig">'+shovel(252,34,152,"tp-dry")+'</g><path class="tp-arrow" d="M122 40 C136 24 170 22 188 34"/><path class="tp-arrowh" d="M181 28 L189 35 L179 38"/>',
      "The dry sand and cement turned over with a shovel until it's one even colour"),
    hand3:()=>svg(320,118,
      '<path class="tp-ply" d="M44 90 H276 L294 104 H26 Z"/><path class="tp-ply2" d="M26 104 H294 V109 H26 Z"/>'+
      '<path class="tp-dry" d="M78 96 C94 68 116 58 132 58 C138 62 148 64 160 64 C172 64 182 62 188 58 C204 58 226 68 242 96 Z"/><ellipse class="tp-water" cx="160" cy="61" rx="23" ry="4.2"/>'+
      '<g transform="translate(222 30) rotate(-58)">'+bucket(0,0,"tp-water","level",.8)+'</g><path class="tp-pour" d="M210 32 Q186 36 172 58"/>',
      "A well made in the middle of the dry mix, with water poured into it from a bucket"),
    hand4:()=>svg(320,118,
      '<path class="tp-ply" d="M44 90 H276 L294 104 H26 Z"/><path class="tp-ply2" d="M26 104 H294 V109 H26 Z"/>'+
      '<path class="tp-wet" d="M84 96 C100 70 130 60 160 60 C190 60 220 70 236 96 Z"/><path class="tp-sheen" d="M122 72 C140 64 172 64 192 70"/>'+
      '<path class="tp-arrow" d="M52 82 H80"/><path class="tp-arrowh" d="M75 77 L81 82 L75 87"/><path class="tp-arrow" d="M268 82 H240"/><path class="tp-arrowh" d="M245 77 L239 82 L245 87"/>'+
      '<g class="tp-dig">'+shovel(64,30,28,"tp-wet")+'</g>',"Wet mortar turned in from the edges until it's smooth and workable"),
    mixload:()=>{
      const steps=[["Some","water","tp-water"],["Half the","sand","tp-sand"],["All the","cement","tp-cement"],["Rest of","the sand","tp-sand"],["Top up","water","tp-water"]];
      return svg(320,104,steps.map((st,i)=>{const x=34+i*63;return '<circle class="tp-num" cx="'+x+'" cy="14" r="9"/>'+t(x,18,String(i+1),"tp-numt")+bucket(x,36,st[2],"level",.75)+t2(x,84,st[0],st[1])+(i<4?'<path class="tp-chev" d="M'+(x+26)+' 44 L'+(x+34)+' 50 L'+(x+26)+' 56"/>':"")}).join(""),
        "Loading a drum mixer: some water, half the sand, all the cement, the rest of the sand, then top up the water");
    },
    mixer:()=>svg(320,170,
      '<ellipse class="tp-shadow" cx="160" cy="161" rx="96" ry="5"/>'+
      '<path class="tp-frame" d="M150 104 L112 158 M150 104 L188 158 M124 141 H176"/><path class="tp-frame" d="M104 158 H120 M180 158 H196"/>'+
      '<path class="tp-shaft" d="M104 92 H126"/><circle class="tp-wheel3" cx="104" cy="92" r="15"/><path class="tp-shaft" d="M104 77 V107 M89 92 H119"/><circle class="tp-motor" cx="104" cy="92" r="3.5"/><circle class="tp-motor" cx="93" cy="81" r="3"/>'+
      '<rect class="tp-motor" x="124" y="84" width="54" height="26" rx="4"/><path class="tp-vent" d="M162 90 V104 M167 90 V104 M172 90 V104"/>'+
      '<g transform="translate(150 80) rotate(-32)"><path class="tp-drum2" d="M0 -30 C12 -34 22 -36 34 -36 L88 -18 L88 18 L34 36 C22 36 12 34 0 30 Z"/>'+
        '<g class="tp-spin"><path class="tp-band" d="M46 -32.5 L54 -30 V30 L46 32.5 Z"/><path class="tp-band" d="M66 -25.8 L73 -23.4 V23.4 L66 25.8 Z"/></g>'+
        '<rect class="tp-ring" x="17" y="-35.5" width="8" height="71" rx="2"/><path class="tp-teeth" d="M17 -28 H25 M17 -20 H25 M17 -12 H25 M17 -4 H25 M17 4 H25 M17 12 H25 M17 20 H25 M17 28 H25"/>'+
        '<ellipse class="tp-motor" cx="0" cy="0" rx="5" ry="30"/><ellipse class="tp-hole" cx="88" cy="0" rx="5" ry="18"/><ellipse class="tp-lip" cx="88" cy="0" rx="5" ry="18"/></g>'+
      '<path class="tp-cable" d="M178 104 C198 110 198 152 226 153 L252 153"/><rect class="tp-plug" x="252" y="145" width="24" height="16" rx="4"/><rect class="tp-plug" x="274" y="148" width="6" height="10" rx="1.5"/>'+t(266,138,"110 V","tp-xs"),
      "A drum mixer on its stand: the turning drum, the tipping wheel, the motor, and a yellow 110 V plug"),
    silo:()=>svg(320,200,
      '<ellipse class="tp-shadow" cx="150" cy="194" rx="118" ry="4"/>'+
      '<path class="tp-frame2" d="M100 110 L96 190 M128 110 L132 190"/><path class="tp-frame" d="M84 100 L76 190 M144 100 L152 190 M80 146 L148 186 M148 146 L80 186"/>'+
      '<path class="tp-silo2" d="M80 22 Q80 8 114 8 Q148 8 148 22 V104 L126 126 H102 L80 104 Z"/><path class="tp-thin" d="M80 36 H148 M80 70 H148"/>'+
      t(114,54,"DRY","tp-sm")+t(114,66,"MORTAR","tp-sm")+
      '<rect class="tp-steel" x="106" y="124" width="16" height="10"/><rect class="tp-steel" x="104" y="132" width="96" height="14" rx="7"/><rect class="tp-motor" x="86" y="128" width="22" height="22" rx="3"/>'+
      '<path class="tp-steel" d="M192 144 H202 V156 L198 160 H194 L192 156 Z"/><g class="tp-drop tp-wet"><circle cx="197" cy="164" r="2"/><circle cx="197" cy="170" r="1.6"/></g>'+
      '<path class="tp-barrow" d="M174 172 H224 L216 186 H184 Z"/><path class="tp-wet" d="M178 173 Q199 162 220 173 Z"/><circle class="tp-tyre" cx="178" cy="189" r="5"/><path class="tp-frame" d="M220 178 L246 172 M214 186 L216 193"/>'+
      '<rect class="tp-motor" x="150" y="104" width="22" height="18" rx="2"/><circle class="tp-go" cx="161" cy="113" r="4.2"/><path class="tp-lead" d="M172 110 C190 110 196 94 214 94"/>'+
      '<path class="tp-pipe" d="M292 192 V120"/><path class="tp-pipe" d="M292 122 H282 V128"/><rect class="tp-motor" x="286" y="112" width="12" height="5" rx="2"/>'+
      '<path class="tp-hose" d="M282 128 C262 132 248 120 232 122 C216 124 206 128 196 132"/>',
      "A mortar silo: dry pre-blended mortar in the silo, a mixer at the bottom fed by a water hose, a control box, and mortar coming out into a barrow"),
    premix:()=>svg(320,120,
      '<path class="tp-tubk" d="M12 56 H96 L89 100 H19 Z"/><rect class="tp-lid" x="8" y="48" width="92" height="9" rx="3"/><rect class="tp-paper" x="36" y="66" width="36" height="17" rx="2"/><path class="tp-thin" d="M41 72 H67 M41 78 H61"/>'+
      '<path class="tp-tubk" d="M111 56 H195 L188 100 H118 Z"/><ellipse class="tp-wet" cx="153" cy="57" rx="41" ry="6"/><path class="tp-sheen" d="M134 56 C146 53 162 53 174 55"/>'+
      '<g transform="rotate(6 250 70)"><rect class="tp-paper" x="228" y="38" width="44" height="58" rx="2"/>'+t(250,52,"USE BY","tp-xs")+t(250,64,"Fri 4 pm","tp-xs")+'<path class="tp-thin" d="M234 74 H266 M234 81 H260 M234 88 H264"/></g>'+
      t(54,116,"Keep it covered")+t(153,116,"Ready to use")+t(258,116,"Check the ticket"),
      "Tubs of ready-to-use mortar, one with its lid on and one open, and a delivery ticket with a use-by time"),
    "ppe-person":()=>svg(320,210,PPE(),"A worker kitted up to mix mortar: hard hat, goggles, dust mask, long sleeves under a hi-vis vest, gloves and safety boots"),
    "ppe-close":()=>svg(124,196,PPE(),"A worker kitted up to mix mortar: hard hat, goggles, dust mask, long sleeves under a hi-vis vest, gloves and safety boots","98 12"),

    team:()=>svg(320,140,
      brickwork(12,72,104,7,.12,BOND.stretcher,{headers:false})+
      person(140,134,{arm:"up"})+
      '<path class="tp-barrow" d="M196 108 H244 L236 122 H204 Z"/><path class="tp-wet" d="M200 109 Q220 98 240 109 Z"/><circle class="tp-tyre" cx="198" cy="126" r="6"/><path class="tp-frame" d="M240 114 L262 110 M234 122 L236 132"/>'+
      person(276,134)+
      '<path class="tp-bubble" d="M148 3 H300 Q306 3 306 9 V24 Q306 30 300 30 H172 L154 42 L162 30 H148 Q142 30 142 24 V9 Q142 3 148 3 Z"/>'+t(224,20,"More mortar in 30 mins?","tp-sm"),
      "A bricklayer at a wall asking the labourer, who has a barrow of mortar, for more mortar in half an hour"),
    "wall-est":()=>{
      const s=.052;
      return svg(320,130,brickwork(34,16,256,16,s,BOND.stretcher,{headers:false})+
        '<path class="tp-dim" d="M34 90 H290 M34 85 V95 M290 85 V95 M20 16 V77.9 M15 16 H25 M15 77.9 H25"/>'+t(162,106,"5 m")+'<text transform="rotate(-90 10 47)" x="10" y="47">1.2 m</text>'+
        t(162,124,"Half-brick wall: about 60 bricks per m²","tp-xs"),"A half-brick wall 5 metres long and 1.2 metres high");
    }
  });

  Object.assign(P,{
    /* One bucket of each material, for dragging into a mix. */
    "bucket-cement":()=>svg(48,48,bucket(24,9,"tp-cement","level",.95),"A bucket of cement"),
    "bucket-sand":()=>svg(48,48,bucket(24,9,"tp-sand","level",.95),"A bucket of sand"),
    "bucket-lime":()=>svg(48,48,bucket(24,9,"tp-lime","level",.95),"A bucket of lime"),
    "bucket-water":()=>svg(48,48,bucket(24,9,"tp-water","level",.95),"A bucket of water"),
    sandcover:()=>svg(320,112,
      '<g class="tp-rain">'+[[34,6],[62,14],[90,4],[118,12],[48,30],[104,28],[76,34],[132,32]].map(p=>'<path d="M'+p[0]+' '+p[1]+' l-3 10"/>').join("")+'</g>'+
      '<path class="tp-sandwet" d="M16 92 C32 64 54 54 78 54 C102 54 124 64 140 92 Z"/><ellipse class="tp-water" cx="58" cy="90" rx="14" ry="2.2" opacity=".8"/><ellipse class="tp-water" cx="108" cy="91" rx="10" ry="1.8" opacity=".8"/>'+
      '<path class="tp-sand" d="M180 92 C196 64 218 54 242 54 C266 54 288 64 304 92 Z"/><path class="tp-tarp" d="M174 94 C190 60 216 46 242 46 C268 46 294 60 310 94 Z"/><path class="tp-fold" d="M212 56 C224 68 230 80 232 92 M262 52 C258 66 258 80 262 92"/>'+
      '<rect class="tp-b2" x="170" y="86" width="22" height="8" rx="1"/><rect class="tp-b1" x="292" y="86" width="22" height="8" rx="1"/>'+
      t(78,108,"Left out: soaked")+t(242,108,"Covered: stays the same"),"Two heaps of sand: one left out in the rain and soaked, one kept under a sheet"),
    clock2h:()=>svg(320,112,
      '<circle class="tp-face2" cx="92" cy="52" r="40"/><path class="tp-arc" d="M92 52 L92 16 A36 36 0 0 1 123.2 34 Z"/>'+
      Array.from({length:12},(_,k)=>{const a=k*Math.PI/6,x1=92+Math.sin(a)*33,y1=52-Math.cos(a)*33,x2=92+Math.sin(a)*37,y2=52-Math.cos(a)*37;return '<path class="tp-tickc" d="M'+r(x1)+' '+r(y1)+' L'+r(x2)+' '+r(y2)+'"/>'}).join("")+
      '<path class="tp-hand2" d="M92 52 L92 22 M92 52 L109 42"/><circle class="tp-hub2" cx="92" cy="52" r="3"/>'+t(92,108,"About 2 hours")+
      '<path class="tp-arrow" d="M148 52 H176"/><path class="tp-arrowh" d="M171 47 L177 52 L171 57"/>'+
      '<path class="tp-tubk" d="M192 40 H292 L284 86 H200 Z"/><ellipse class="tp-wet" cx="242" cy="41" rx="48" ry="6.5"/><path class="tp-crk" d="M222 40 L230 43 L226 46 M254 38 L262 42"/>'+t(242,108,"Setting? Mix fresh"),
      "A clock showing about two hours, then a tub of mortar starting to set: mix a fresh batch"),
  });

  /* ---------- Safety signs (ISO 7010 shapes and colours) ----------
     Blue circle: must do. Red ring and bar: must not. Yellow triangle: warning. Green square: safe condition.
     Red square: fire equipment. Each sign is 100 × 100. */
  const SIGN={
    eyes:['M004 Wear eye protection','<circle class="tp-sb" cx="50" cy="50" r="46"/><path class="tp-sw" d="M50 17 C38 17 31 26 31 38 C31 51 39 61 50 61 C61 61 69 51 69 38 C69 26 62 17 50 17 Z M23 84 C25 71 36 64 50 64 C64 64 75 71 77 84 Z"/><rect class="tp-sb" x="30" y="31" width="40" height="13" rx="6.5"/><rect class="tp-sw" x="34" y="33.5" width="14" height="8" rx="4"/><rect class="tp-sw" x="52" y="33.5" width="14" height="8" rx="4"/>'],
    hat:['M014 Wear head protection','<circle class="tp-sb" cx="50" cy="50" r="46"/><path class="tp-sw" d="M28 42 C28 24 38 14 50 14 C62 14 72 24 72 42 Z M23 43 H77 V49 H23 Z M35 52 C35 62 41 68 50 68 C59 68 65 62 65 52 Z M24 86 C26 76 36 71 50 71 C64 71 74 76 76 86 Z"/><path class="tp-sbl" d="M50 16 V40"/>'],
    gloves:['M009 Wear hand protection','<circle class="tp-sb" cx="50" cy="50" r="46"/><g class="tp-sw"><rect x="34" y="27" width="7.5" height="27" rx="3.75"/><rect x="42.5" y="21" width="7.5" height="31" rx="3.75"/><rect x="51" y="24" width="7.5" height="29" rx="3.75"/><rect x="59.5" y="31" width="7" height="23" rx="3.5"/><path d="M34 46 H66.5 V69 C66.5 75 62 79 56 79 H42 C37 79 34 75 34 70 Z"/><path d="M35 62 L23 48 C21 45.5 22 42.5 25 41.5 C27 41 29 42 30.5 44 L39 55 Z"/><rect x="36" y="80" width="28" height="9" rx="2"/></g>'],
    nosmoke:['P002 No smoking','<circle class="tp-sw" cx="50" cy="50" r="46"/><rect class="tp-sk" x="20" y="54" width="44" height="10"/><rect class="tp-sk" x="66" y="54" width="14" height="10"/><path class="tp-skl" d="M24 48 C19 42 28 38 24 31 C20 25 28 21 26 15"/><path class="tp-srl" d="M22 22 L78 78"/><circle class="tp-srl" cx="50" cy="50" r="41"/>'],
    nophone:['P013 No mobile phones','<circle class="tp-sw" cx="50" cy="50" r="46"/><rect class="tp-sk" x="37" y="20" width="26" height="60" rx="5"/><rect class="tp-sw" x="41" y="27" width="18" height="38" rx="1.5"/><circle class="tp-sw" cx="50" cy="72" r="3"/><path class="tp-srl" d="M22 22 L78 78"/><circle class="tp-srl" cx="50" cy="50" r="41"/>'],
    warn:['W001 General warning','<path class="tp-sy tp-syl" d="M50 9 L93 85 H7 Z"/><rect class="tp-sk" x="46" y="34" width="8" height="31" rx="4"/><circle class="tp-sk" cx="50" cy="74" r="5"/>'],
    electric:['W012 Warning: electricity','<path class="tp-sy tp-syl" d="M50 9 L93 85 H7 Z"/><path class="tp-sk" d="M55 30 L40 56 H50 L42 79 L39 76 L40 84 L47 80 L44 79 L60 50 H50 L59 30 Z"/>'],
    firstaid:['E003 First aid','<rect class="tp-sg" x="4" y="4" width="92" height="92" rx="4"/><path class="tp-sw" d="M38 18 H62 V38 H82 V62 H62 V82 H38 V62 H18 V38 H38 Z"/>'],
    eyewash:['E011 Eyewash station','<rect class="tp-sg" x="4" y="4" width="92" height="92" rx="4"/><path class="tp-sw" d="M16 40 Q50 12 84 40 Q50 68 16 40 Z"/><circle class="tp-sg" cx="50" cy="40" r="11"/><circle class="tp-sw" cx="50" cy="40" r="4.5"/><rect class="tp-sw" x="43" y="80" width="14" height="10" rx="2"/><path class="tp-swl" d="M47 79 Q42 66 38 56 M50 78 V58 M53 79 Q58 66 62 56"/>'],
    extinguisher:['F001 Fire extinguisher','<rect class="tp-sr" x="4" y="4" width="92" height="92" rx="4"/><g class="tp-sw"><rect x="30" y="34" width="22" height="50" rx="8"/><rect x="36" y="24" width="10" height="11" rx="2"/><path d="M36 26 L22 20 L24 16 L38 22 Z"/><path d="M68 84 C60 84 56 76 58 68 C60 62 64 60 64 52 C70 58 70 64 69 68 C72 66 73 62 72 58 C78 64 80 72 76 78 C74 82 71 84 68 84 Z"/></g><path class="tp-swl" d="M46 28 C56 26 60 34 60 44"/>']
  };
  Object.keys(SIGN).forEach(k=>{P["sign-"+k]=()=>svg(100,100,SIGN[k][1],SIGN[k][0])});
  const place=(k,x,y,sz)=>'<g transform="translate('+r(x-sz/2)+' '+r(y-sz/2)+') scale('+r(sz/100)+')">'+SIGN[k][1]+'</g>';
  Object.assign(P,{
    signs:()=>svg(320,98,["eyes","nosmoke","warn","firstaid","extinguisher"].map((k,i)=>place(k,34+i*63,40,54)).join("")+
      ["Must do","Must not","Warning","Safe","Fire kit"].map((l,i)=>t(34+i*63,88,l)).join(""),
      "The five kinds of safety sign: blue circle must do, red ring and bar must not, yellow triangle warning, green square safe condition, red square fire equipment"),
    signs4:()=>svg(320,84,["eyes","nosmoke","warn","firstaid"].map((k,i)=>place(k,44+i*77,42,66)).join(""),
      "Four safety signs: wear eye protection, no smoking, general warning and first aid")
  });

  /* ---------- Other units ---------- */
  const sbucket=(x,y,cls,heap)=>'<g transform="translate('+x+' '+y+')">'+(heap?'<path class="'+cls+'" d="M4 10 Q20 -12 36 10 Z"/>':"")+'<path class="'+cls+'" d="M4 10 H36 L32 46 H8 Z"/><path class="tp-line" d="M2 10 H38 M4 10 L8 46 H32 L36 10"/><path class="tp-thin" d="M6 10 Q20 -8 34 10"/></g>';
  const bondPanel=(x,label,sub,faces)=>'<g>'+brickwork(x,10,96,7,.12,faces)+t(x+48,88,label)+t(x+48,101,sub,"tp-xs")+'</g>';
  Object.assign(P,{
    tape:()=>svg(320,120,
      '<rect class="tp-tape" x="14" y="30" width="70" height="62" rx="14"/><circle class="tp-hub" cx="49" cy="61" r="12"/>'+
      '<rect class="tp-blade" x="80" y="52" width="226" height="22" rx="2"/>'+Array.from({length:23},(_,k)=>'<path class="tp-tick" d="M'+(88+k*9.5)+' 52 V'+(k%5===0?66:59)+'"/>').join("")+
      '<text x="88" y="90">0</text><text x="135.5" y="90">50</text><text x="183" y="90">100</text><text x="230.5" y="90">150</text><text x="278" y="90">200 mm</text>',"A tape measure marked in millimetres"),
    area:()=>svg(320,130,
      '<rect class="tp-wall" x="70" y="20" width="180" height="72" rx="3"/>'+Array.from({length:5},(_,k)=>'<path class="tp-thin" d="M70 '+(32+k*12)+' H250"/>').join("")+
      '<path class="tp-dim" d="M70 106 H250 M70 101 V111 M250 101 V111 M262 20 V92 M257 20 H267 M257 92 H267"/><text x="160" y="124">5 m</text><text x="286" y="60">2 m</text>',"A wall 5 metres long and 2 metres high"),
    write:()=>svg(320,120,
      '<rect class="tp-page" x="70" y="10" width="180" height="104" rx="8"/>'+[0,1,2,3,4].map(k=>'<path class="tp-thin" d="M88 '+(34+k*16)+' H232"/>').join("")+
      '<text class="tp-hand" x="160" y="30">First, I checked the drawings.</text><text class="tp-hand" x="160" y="46">Then I set out the job.</text><text class="tp-hand" x="160" y="62">Finally, I checked the quality.</text>'+
      '<path class="tp-pen" d="M262 94 L292 34 L300 38 L270 98 Z"/>',"A neat write-up in full sentences"),
    heap:()=>svg(320,120,
      '<rect class="tp-board" x="20" y="88" width="280" height="10" rx="3"/><path class="tp-mix" d="M50 88 Q160 8 270 88 Z"/><ellipse class="tp-water" cx="160" cy="52" rx="34" ry="9"/>'+
      '<path class="tp-thin" d="M126 50 Q160 30 194 50"/><text x="160" y="116">A well in the middle for the water</text>',"A mixed heap on a board with a well of water"),
    ppe:()=>svg(320,120,
      '<path class="tp-glove" d="M40 100 V56 Q40 46 48 46 V30 Q48 24 54 24 Q60 24 60 30 V44 V22 Q60 16 66 16 Q72 16 72 22 V44 V26 Q72 20 78 20 Q84 20 84 26 V48 V36 Q84 30 90 30 Q96 30 96 36 V74 Q96 100 70 100 Z"/>'+
      '<g><rect class="tp-goggle" x="130" y="42" width="44" height="30" rx="12"/><rect class="tp-goggle" x="180" y="42" width="44" height="30" rx="12"/><path class="tp-line" d="M174 56 H180 M120 56 H130 M224 56 H234"/></g>'+
      '<g><path class="tp-mask" d="M258 50 Q282 38 306 50 L302 78 Q282 92 262 78 Z"/><path class="tp-line" d="M258 54 L248 48 M306 54 L316 48"/></g>'+
      '<text x="68" y="116">Gloves</text><text x="177" y="116">Eye protection</text><text x="282" y="116">Dust mask</text>',"Gloves, eye protection and a dust mask"),
    /* Joint finishes in section: the face of the wall is on the left. */
    joints:()=>svg(320,124,[["Flush","",'<path class="tp-mortar" d="M0 34 H56 V50 H0 Z"/>'],["Half round","(bucket handle)",'<path class="tp-mortar" d="M0 34 H56 V50 H0 V49 A7.5 7.5 0 0 0 0 35 Z"/>'],["Weather","struck",'<path class="tp-mortar" d="M6 34 H56 V50 H0 Z"/>'],["Recessed","",'<path class="tp-mortar" d="M6 34 H56 V50 H6 Z"/>']].map((j,i)=>{const x=14+i*78;return '<g transform="translate('+x+' 4)"><rect class="tp-brick" x="0" y="0" width="56" height="34"/><rect class="tp-brick" x="0" y="50" width="56" height="34"/>'+j[2]+'<path class="tp-face" d="M0 -2 V86"/></g>'+t(x+28,102,j[0],"tp-sm")+(j[1]?t(x+28,114,j[1],"tp-xs"):"")}).join(""),"Joint finishes cut through the wall with the face on the left: flush, half round, weather struck and recessed"),
    /* The three main bonds, to scale, each with a stopped end on the left: half bats in stretcher bond, a header
       and queen closer starting the header courses of English bond and every other course of Flemish bond. */
    bonds:()=>svg(320,108,bondPanel(8,"Stretcher","half-brick wall",BOND.stretcher)+bondPanel(112,"English","one-brick wall",BOND.english)+bondPanel(216,"Flemish","one-brick wall",BOND.flemish),
      "Stretcher bond, English bond and Flemish bond, each with a stopped end on the left"),
    /* Cavity wall section. Wall ties lie level or fall to the outside leaf, never towards the inside, with the drip in the cavity. */
    cavity:()=>svg(320,130,'<rect class="tp-brick" x="70" y="10" width="42" height="96"/><rect class="tp-insul" x="126" y="10" width="26" height="96"/><rect class="tp-block" x="160" y="10" width="54" height="96"/><path class="tp-tie" d="M98 58 H116 L119 64 L122 58 H182"/><path class="tp-dpc" d="M66 92 H116 M156 92 H218"/>'+
      '<text x="91" y="122">Brick</text><text x="187" y="122">Block</text><text x="270" y="32">Insulation</text><text x="260" y="64">Wall tie</text><text x="262" y="96">DPC</text><path class="tp-thin" d="M236 28 H146 M232 60 H186 M244 92 H220"/>',"Cavity wall section: brick, cavity with insulation, block, a level wall tie with its drip in the cavity, and DPC")
  });
  /* ---------- Bricklayer ---------- */
  const panel=(x,y,w,c,s,f,o)=>brickwork(x,y,w,c,s,f||BOND.stretcher,Object.assign({headers:false},o||{}));
  const dimV=(x,y1,y2,label,side)=>'<path class="tp-dim" d="M'+x+' '+y1+' V'+y2+' M'+(x-4)+' '+y1+' H'+(x+4)+' M'+(x-4)+' '+y2+' H'+(x+4)+'"/>'+t(x+(side||14),(y1+y2)/2+4,label,"tp-sm");
  const dimH=(y,x1,x2,label)=>'<path class="tp-dim" d="M'+x1+' '+y+' H'+x2+' M'+x1+' '+(y-4)+' V'+(y+4)+' M'+x2+' '+(y-4)+' V'+(y+4)+'"/>'+t((x1+x2)/2,y+14,label,"tp-sm");
  Object.assign(P,{
    protect:()=>svg(320,120,
      '<g class="tp-rain">'+[[40,6],[70,14],[100,4],[130,12],[250,6],[280,16],[222,12]].map(p=>'<path d="M'+p[0]+' '+p[1]+' l-3 10"/>').join("")+'</g>'+
      panel(90,40,140,4,.2)+'<path class="tp-tarp" d="M82 40 H238 V58 Q236 62 232 58 V44 H88 V58 Q86 62 82 58 Z"/>'+
      '<rect class="tp-wood" x="100" y="31" width="120" height="8" rx="1.5"/>'+t(160,114,"Cover new work, held clear of the face","tp-xs"),
      "A newly built wall with a waterproof sheet over the top, weighted down with a board, in the rain"),
    defects:()=>svg(320,110,panel(10,6,300,6,.2)+
      '<path class="tp-spall" d="M34 7.2 H73 V12 L66 16 L58 13 L50 17 L40 14 L34 16 Z"/>'+
      '<g class="tp-salt"><ellipse cx="140" cy="48" rx="22" ry="10"/><ellipse cx="165" cy="58" rx="16" ry="8"/><ellipse cx="128" cy="62" rx="12" ry="6"/></g>'+
      '<path class="tp-crk" d="M268 6 V20 H245.5 V35 H223 V50 H200.5 V65 H178 V80"/>'+
      '<path class="tp-erode" d="M40 79 H120 M40 94 H120 M62 79 V94 M107 79 V94"/>',
      "A brick wall with a spalled brick face, white efflorescence salts, a stepped crack and crumbling joints"),
    course75:()=>svg(320,130,panel(60,10,150,3,.5)+
      dimV(222,10,42.5,"",0)+t(262,30,"65 brick","tp-sm")+'<path class="tp-dim" d="M222 42.5 H232 M222 47.5 H232"/>'+t(262,50,"10 joint","tp-sm")+
      dimV(46,10,47.5,"",0)+t(26,32,"75","tp-sm")+t(135,126,"brick + joint = 75 mm a course","tp-xs"),
      "Three courses of brickwork: each course is a 65 millimetre brick and a 10 millimetre joint, 75 millimetres"),
    tools:()=>svg(320,120,
      '<g transform="translate(-4 -30)"><path class="tp-steel" d="M8 63.5 L52 63.5 L52 66 L12 66 Z"/><path class="tp-shank" d="M50 65 L55 55 L58 55"/><path class="tp-wood" d="M57 51.5 L74 53 Q77 55 74 57 L57 58.5 Z"/></g>'+
      '<rect class="tp-lvl" x="100" y="24" width="84" height="12" rx="2"/><rect class="tp-vial" x="136" y="27" width="12" height="6" rx="3"/><circle class="tp-bub" cx="142" cy="30" r="1.8"/>'+
      '<path class="tp-steel" d="M222 18 L226 44 L230 18 Z"/><path class="tp-steel" d="M270 18 L274 44 L278 18 Z"/><path class="tp-string" d="M226 20 H274"/>'+
      '<path class="tp-steel" d="M34 94 H56 L52 100 H38 Z"/><rect class="tp-steel" x="40" y="66" width="10" height="30" rx="2"/><rect class="tp-grip2" x="40" y="72" width="10" height="12" rx="3"/>'+
      '<rect class="tp-wood" x="110" y="80" width="54" height="8" rx="3"/><rect class="tp-steel" x="164" y="74" width="24" height="20" rx="3"/>'+
      '<path class="tp-jointer" d="M226 92 C232 92 232 84 240 84 H268 C276 84 276 92 282 92"/><rect class="tp-wood" x="244" y="72" width="22" height="8" rx="3"/><path class="tp-shank" d="M248 80 V84 M262 80 V84"/>'+
      t(34,56,"Trowel","tp-xs")+t(142,50,"Spirit level","tp-xs")+t(250,56,"Line and pins","tp-xs")+t(45,114,"Bolster","tp-xs")+t(149,114,"Club hammer","tp-xs")+t(254,114,"Jointer","tp-xs"),
      "Bricklaying hand tools: trowel, spirit level, line and pins, bolster, club hammer and jointer"),
    coping:()=>svg(320,124,panel(120,52,80,3,.26,BOND.english)+
      '<path class="tp-dpc" d="M116 51 H204"/><path class="tp-coping" d="M104 50 V40 L160 26 L216 40 V50 Z"/><path class="tp-dripg" d="M112 50 a3 3 0 0 0 6 0 M202 50 a3 3 0 0 0 6 0"/>'+
      '<g class="tp-drop2"><circle cx="110" cy="62" r="2"/><circle cx="110" cy="74" r="2"/><circle cx="210" cy="62" r="2"/><circle cx="210" cy="74" r="2"/></g>'+
      '<path class="tp-thin" d="M72 50 H108 M240 51 H206"/>'+t(46,54,"Drip")+t(266,55,"DPC")+t(160,118,"Water drips clear of the wall face","tp-xs"),
      "A coping on top of a brick wall, with a DPC underneath and drips under each overhang so water falls clear of the face"),
    /* Checking a corner is square with a 3-4-5 triangle. */
    square345:()=>svg(320,130,'<path class="tp-string2" d="M60 110 H260 M60 110 V14"/><path class="tp-tri" d="M60 110 H220 L60 14 Z"/>'+
      '<circle class="tp-peg" cx="60" cy="110" r="4"/><circle class="tp-peg" cx="220" cy="110" r="4"/><circle class="tp-peg" cx="60" cy="14" r="4"/><path class="tp-thin" d="M60 98 H72 V110"/>'+
      t(140,125,"4 m")+t(40,66,"3 m")+t(156,56,"5 m")+t(262,40,"3, 4, 5 means","tp-xs")+t(262,52,"a right angle","tp-xs"),
      "A corner set out with lines: 3 metres one way, 4 metres the other, and 5 metres across means the corner is square"),
    /* Plan views: a pier bonded into a wall, and a pier on its own. */
    piers:()=>svg(320,120,'<rect class="tp-plan" x="16" y="40" width="170" height="22"/><rect class="tp-plan" x="78" y="62" width="44" height="22"/><path class="tp-thin" d="M78 62 H122"/>'+
      '<rect class="tp-plan" x="236" y="36" width="44" height="44"/>'+t(100,104,"Attached pier","tp-sm")+t(100,116,"bonded into the wall","tp-xs")+t(258,104,"Isolated pier","tp-sm")+t(258,116,"stands on its own","tp-xs")+t(100,32,"Plan (from above)","tp-xs"),
      "Plan views of an attached pier bonded into a wall and an isolated pier standing on its own"),
    "garden-bond":()=>svg(320,112,'<g>'+brickwork(70,8,180,8,.12,BOND.garden)+'</g>'+t(160,94,"English garden wall bond")+t(160,107,"3 stretcher courses, then a header course","tp-xs"),
      "English garden wall bond: three courses of stretchers, then a course of headers"),
    soldier:()=>{const s2=.14,W=140,n=Math.floor(W/(75*s2)),row=(x,y,h,k0)=>Array.from({length:n},(_,k)=>'<rect class="tp-b'+(1+(k+k0)%3)+'" x="'+r(x+k*75*s2)+'" y="'+r(y)+'" width="'+r(65*s2)+'" height="'+r(h*s2)+'"/>').join("");
      return svg(320,122,panel(16,6,W,2,s2)+'<rect class="tp-mortar" x="16" y="'+r(6+2*75*s2-10*s2)+'" width="'+W+'" height="'+r(225*s2+2)+'"/>'+row(16,6+2*75*s2,215,0)+panel(16,r(6+2*75*s2+225*s2),W,2,s2)+
        '<rect class="tp-mortar" x="168" y="'+r(28-10*s2)+'" width="'+W+'" height="'+r(112.5*s2+1)+'"/>'+row(168,28,102.5,1)+panel(168,r(28+112.5*s2),W,4,s2)+
        t(86,112,"Soldier course: on end","tp-sm")+t(238,112,"Brick-on-edge capping","tp-sm"),"A soldier course of bricks stood on end in a wall, and a brick-on-edge capping along the top of a wall")},
    dpc150:()=>svg(320,130,'<rect class="tp-conc" x="60" y="96" width="170" height="30"/><rect class="tp-brick" x="90" y="14" width="40" height="82"/><rect class="tp-block" x="160" y="14" width="46" height="82"/>'+
      '<path class="tp-ground" d="M30 80 H90 M206 80 H250"/><path class="tp-dpc" d="M86 56 H134 M156 56 H210"/>'+dimV(64,56,80,"",0)+t(34,64,"150 mm","tp-sm")+t(34,76,"min","tp-xs")+
      t(284,60,"DPC")+t(284,84,"Ground")+t(145,11,"Cavity","tp-xs")+'<path class="tp-thin" d="M262 57 H214 M258 81 H252"/>',"A cavity wall section with the DPC in both leaves at least 150 millimetres above ground level"),
    gaugerod:()=>{let m="";for(let k=0;k<=13;k++){const y=116-k*7.5;m+='<path class="tp-tickc" d="M150 '+y+' H'+(k%4===0?166:160)+'"/>'}
      return svg(320,124,'<rect class="tp-wood" x="146" y="10" width="14" height="108"/>'+m+'<path class="tp-mark" d="M146 71 H178 M146 26 H178"/>'+t(214,74,"Sill height")+t(218,29,"Lintel bearing")+t(96,119,"Ground / DPC","tp-xs")+t(84,56,"A mark every","tp-xs")+t(84,68,"course (75 mm)","tp-xs"),
      "A timber gauge rod with a mark every 75 millimetre course and the sill and lintel heights marked")},
    /* UK fire extinguishers: all red, with a coloured band. */
    extinguishers:()=>svg(320,124,[["Water","tp-exw"],["Foam","tp-exf"],["CO2","tp-exc"],["Powder","tp-exp"]].map((e,i)=>{const x=40+i*80;
      return '<rect class="tp-exbody" x="'+(x-16)+'" y="30" width="32" height="70" rx="10"/><rect class="'+e[1]+'" x="'+(x-16)+'" y="48" width="32" height="14"/><rect class="tp-exhead" x="'+(x-6)+'" y="20" width="12" height="11" rx="2"/>'+
        (e[0]==="CO2"?'<path class="tp-horn" d="M'+(x+6)+' 24 C'+(x+26)+' 24 '+(x+26)+' 40 '+(x+22)+' 60 L'+(x+30)+' 64 L'+(x+26)+' 52"/>':'<path class="tp-hosex" d="M'+(x+6)+' 24 C'+(x+24)+' 26 '+(x+24)+' 50 '+(x+20)+' 70"/>')+t(x,116,e[0])}).join(""),
      "Four red fire extinguishers with coloured bands: water red, foam cream, CO2 black with a horn, and dry powder blue"),
    opening:()=>{const s2=.13,L=110-150*s2,LW=100+300*s2,n=Math.floor(LW/(75*s2));return svg(320,146,panel(20,6,280,14,s2)+'<rect class="tp-hole2" x="110" y="45" width="100" height="62"/>'+
      '<rect class="tp-lintel" x="'+r(L)+'" y="36" width="'+r(LW)+'" height="9"/><rect class="tp-mortar" x="'+r(L)+'" y="7" width="'+r(LW)+'" height="29"/>'+
      Array.from({length:n},(_,k)=>'<rect class="tp-b'+(1+k%3)+'" x="'+r(L+(LW-n*75*s2+10*s2)/2+k*75*s2)+'" y="8" width="'+r(65*s2)+'" height="'+r(215*s2)+'"/>').join("")+
      '<rect class="tp-sill" x="104" y="107" width="112" height="10"/><rect class="tp-weep" x="129.5" y="30" width="2" height="5"/><rect class="tp-weep" x="188" y="30" width="2" height="5"/>'+
      dimH(128,r(L),110,"150")+dimH(128,210,r(210+150*s2),"150")+t(160,80,"Opening","tp-xs"),
      "A window opening in brickwork: a lintel with a soldier course above, 150 millimetre bearings at each end, a brick-on-edge sill and weep holes")},
    movement:()=>svg(320,120,panel(20,8,128,6,.2)+panel(158,8,142,6,.2,k=>k%2?rep([215],30):[102.5].concat(rep([215],30)))+
      '<rect class="tp-filler" x="148" y="8" width="10" height="88"/><rect class="tp-seal" x="148" y="8" width="3" height="88"/>'+t(153,112,"Movement joint: filler and sealant, no mortar","tp-xs"),
      "Two panels of brickwork with a movement joint between them filled with compressible filler and sealant"),
    gable:()=>{const id="tpg"+(++uid);return svg(320,130,'<clipPath id="'+id+'"><path d="M30 118 L160 12 L290 118 Z"/></clipPath><g clip-path="url(#'+id+')">'+panel(20,10,280,14,.1)+'</g>'+
      '<path class="tp-rake" d="M26 121 L160 9 L294 121"/><path class="tp-string" d="M160 9 L300 124"/>'+t(262,40,"Line set","tp-xs")+t(262,52,"to the rake","tp-xs")+t(58,40,"Bricks cut","tp-xs")+t(58,52,"to the line","tp-xs"),
      "A gable end wall with each course cut along a line set to the angle of the rake")},
    bolster:()=>svg(320,120,'<rect class="tp-brick" x="70" y="72" width="180" height="40"/><path class="tp-mark" d="M160 72 V112"/>'+
      '<g transform="rotate(-6 160 60)"><path class="tp-steel" d="M146 70 H174 L170 60 H150 Z"/><rect class="tp-steel" x="155" y="26" width="10" height="36" rx="2"/><rect class="tp-grip2" x="154" y="36" width="12" height="16" rx="3"/></g>'+
      '<g transform="rotate(20 200 26)"><rect class="tp-wood" x="176" y="22" width="80" height="8" rx="3"/><rect class="tp-steel" x="156" y="14" width="24" height="24" rx="3"/></g>'+
      t(60,40,"Mark all faces,","tp-xs")+t(60,52,"bolster on the line","tp-xs"),"A brick marked for cutting with a bolster held on the line and a club hammer ready to strike")
  });
  /* The old simple bucket, kept for any lesson that still uses it. */
  P.sbucket=()=>svg(120,100,sbucket(40,34,"tp-sand"),"A bucket");
  T.pics=Object.assign(T.pics||{},P);
  /* A picture's own space: its size, and where it starts when it's a close-up of a bigger drawing. */
  T.picSize=name=>{const f=T.pics[name];if(!f)return null;const m=/viewBox="([\d.-]+) ([\d.-]+) ([\d.]+) ([\d.]+)"/.exec(f());return m?{x:+m[1],y:+m[2],w:+m[3],h:+m[4]}:null};
})();
