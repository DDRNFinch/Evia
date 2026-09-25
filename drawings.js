/* Evia7 drawings: learning drawings for bricklaying jobs, drawn on the phone from a brick-by-brick model.
   Every brick is placed by the bond rules below, so elevations, plans, sections, isometrics and quantities all
   agree. Sizes in millimetres: brick 215 x 102.5 x 65, 10 mm joints, 75 mm gauge.
   window.EviaDraw: sheet(cfg) -> SVG, open(cfg) viewer, generator(), forTask(id), pdf(cfg). */
(function(){
  const B={L:215,W:102.5,H:65,J:10};
  const HU=112.5,SU=225,QU=56.25,G=75;
  const EPS=.01;

  /* ---------- Piece helpers ---------- */
  const piece=(x0,x1,y0,y1,z,t,c)=>({x0,x1,y0,y1,z0:z,z1:z+B.H,t,c});
  const typeByLen=w=>Math.abs(w-B.L)<1?"S":Math.abs(w-B.W)<1?"B":Math.abs(w-46.25)<1?"Q":Math.abs(w-158.75)<2?"T":"X";
  /* A half-brick run along x from x0 for len mm; starts with a half bat when offset, ends with whatever fits. */
  function runX(out,x0,len,offset,y0,y1,z,c){
    let p=x0;const end=x0+len;
    if(offset){out.push(piece(p,p+B.W,y0,y1,z,"B",c));p+=HU}
    while(p+B.L<=end+EPS){out.push(piece(p,p+B.L,y0,y1,z,"S",c));p+=SU}
    const r=end-p;if(r>=40)out.push(piece(p,end,y0,y1,z,typeByLen(r),c));
  }
  function runY(out,y0,len,offset,x0,x1,z,c){
    const tmp=[];runX(tmp,y0,len,offset,0,0,z,c);
    tmp.forEach(b=>out.push({x0,x1,y0:b.x0,y1:b.x1,z0:b.z0,z1:b.z1,t:b.t,c}));
  }
  /* English header course on a one-brick wall along x: quoin header, queen closer, headers, closer, header. */
  function englishHeaders(out,x0,m,z,c,noStartQuoin){
    const k=2*m-3;let x=x0;
    const seq=(noStartQuoin?["Q"]:["H","Q"]).concat(Array(k).fill("H"),["Q","H"]);
    if(noStartQuoin)x=x0+HU; // the quoin here belongs to the return
    seq.forEach(t=>{const u=t==="H"?HU:QU;out.push(piece(x,x+u-B.J,0,B.L,z,t,c));x+=u});
  }

  /* ---------- Models ---------- */
  const lenFor=(bond,n)=>bond==="flemish"?SU+337.5*n-B.J:n*SU-B.J;
  function courseZ(cfg,i){return cfg.base+i*G+B.J}

  function build(cfg){
    const c=Object.assign({bond:"stretcher",kind:"wall",n:8,courses:12,setting:"workshop",ret:3},cfg);
    c.below=c.setting==="site"?3:0;c.base=-c.below*G;
    const total=c.below+c.courses;
    const oneBrick=c.bond!=="stretcher";
    const depth=oneBrick?B.L:B.W;
    const bricks=[],extra={lintels:[],vous:[],keep:null,holes:[],blocks:[]};
    let len=lenFor(c.bond,c.n);
    if(c.kind==="pier"){len=B.L}
    for(let i=0;i<total;i++){
      const z=courseZ(c,i),odd=i%2===1;
      if(c.kind==="pier"){
        if(!odd){bricks.push(piece(0,B.L,0,B.W,z,"S",i),piece(0,B.L,B.W+B.J,B.L,z,"S",i))}
        else{bricks.push(piece(0,B.W,0,B.L,z,"H",i),piece(B.W+B.J,B.L,0,B.L,z,"H",i))}
        continue;
      }
      if(c.kind==="corner"){
        const rl=lenFor(c.bond,c.ret);
        if(c.bond==="stretcher"){
          /* Half-brick quoin: runs swap at the corner each course. */
          if(!odd){runX(bricks,0,len,false,0,B.W,z,i);runY(bricks,HU,rl-HU,false,0,B.W,z,i)}
          else{runY(bricks,0,rl,false,0,B.W,z,i);runX(bricks,HU,len-HU,false,0,B.W,z,i)}
        }else{
          /* English bond quoin: a header course on one face meets a stretcher course on the return. */
          const mR=c.ret;
          if(!odd){ // front: header course; return: stretcher course
            englishHeaders(bricks,0,c.n,z,i,true);
            for(let s=0;s<mR;s++){bricks.push({x0:0,x1:B.W,y0:s*SU,y1:s*SU+B.L,z0:z,z1:z+B.H,t:"S",c:i});if(s>0)bricks.push({x0:B.W+B.J,x1:B.L,y0:s*SU,y1:s*SU+B.L,z0:z,z1:z+B.H,t:"S",c:i})}
          }else{ // front: stretcher course; return: header course
            bricks.push({x0:0,x1:B.L,y0:0,y1:B.W,z0:z,z1:z+B.H,t:"H",c:i,quoin:true});
            const k=2*mR-3;let y=HU;
            ["Q"].concat(Array(k).fill("H"),["Q","H"]).forEach(t=>{const u=t==="H"?HU:QU;bricks.push({x0:0,x1:B.L,y0:y,y1:y+u-B.J,z0:z,z1:z+B.H,t,c:i});y+=u});
            for(let s=1;s<c.n;s++){const x=s*SU;bricks.push(piece(x,x+B.L,0,B.W,z,"S",i),piece(x,x+B.L,B.W+B.J,B.L,z,"S",i))}
          }
        }
        continue;
      }
      /* Straight wall */
      if(c.bond==="stretcher")runX(bricks,0,len,odd,0,B.W,z,i);
      else if(c.bond==="english"){
        if(!odd)englishHeaders(bricks,0,c.n,z,i);
        else for(let s=0;s<c.n;s++){const x=s*SU;bricks.push(piece(x,x+B.L,0,B.W,z,"S",i),piece(x,x+B.L,B.W+B.J,B.L,z,"S",i))}
      }else if(c.bond==="flemish"){
        let x=0;
        const pair=()=>{bricks.push(piece(x,x+B.L,0,B.W,z,"S",i),piece(x,x+B.L,B.W+B.J,B.L,z,"S",i));x+=SU};
        const head=t=>{const u=t==="H"?HU:QU;bricks.push(piece(x,x+u-B.J,0,B.L,z,t,i));x+=u};
        if(!odd){head("H");head("Q");pair();for(let a=0;a<c.n-1;a++){head("H");pair()}head("Q");head("H")}
        else{pair();for(let a=0;a<c.n;a++){head("H");pair()}}
      }else if(c.bond==="egw"){
        const r=i%4;
        if(r===0)englishHeaders(bricks,0,c.n,z,i);
        else{runX(bricks,0,len,r===2,0,B.W,z,i);runX(bricks,0,len,r===2,B.W+B.J,B.L,z,i)}
      }
    }
    const M={cfg:c,len,depth,bricks,extra,base:c.base,top:c.base+total*G,total,oneBrick};
    if(c.kind==="corner")M.retLen=lenFor(c.bond,c.ret);
    if(c.opening)cutOpening(M);
    if(c.gable)cutGable(M);
    /* Coping on site, one-brick walls: brick-on-edge, bedded on a DPC */
    if(c.setting==="site"&&oneBrick&&c.kind==="wall"&&!c.gable){
      const cz=M.top+B.J;M.coping=[];
      for(let k=0;k<Math.round((len+B.J)/G);k++)M.coping.push({x0:k*G,x1:k*G+B.H,y0:0,y1:B.L,z0:cz,z1:cz+B.W,t:"C",c:"cop"});
      M.copingTop=cz+B.W;
    }
    M.all=()=>M.bricks.concat(M.coping||[]);
    M.height=(M.coping?M.copingTop:M.top)-0;
    return M;
  }
  /* Openings (stretcher bond): jambs fall on joints, so reveals get full and half bats. Then a lintel or an arch. */
  function cutOpening(M){
    const o=M.cfg.opening,a=o.p*SU-B.J,b=(o.p+o.q)*SU,zb=courseZ(M.cfg,M.cfg.below+o.sill)-B.J,zs=courseZ(M.cfg,M.cfg.below+o.head)-B.J;
    o.a=a;o.b=b;o.zb=zb;o.zs=zs;o.clear=b-a;
    carveRect(M,a,b,zb,zs);
    if(o.arch){arch(M,o)}
    else{ // concrete lintel two courses deep; one-brick (215) bearing each end so its ends fall on the bond
      const lz=zs+B.J,lx0=a-B.L,lx1=b+B.L,lz1=lz+2*G-B.J;
      carveRect(M,lx0-B.J,lx1+B.J,lz-B.J,lz1+B.J);
      M.extra.lintels.push({x0:lx0,x1:lx1,z0:lz,z1:lz1,y0:0,y1:M.depth});
      o.lintel={x0:lx0,x1:lx1,z0:lz,z1:lz1};
    }
    M.extra.holes.push([[a,zb],[b,zb],[b,zs],[a,zs]]);
  }
  function carveRect(M,x0,x1,z0,z1){
    const out=[];
    M.bricks.forEach(b=>{
      /* the hole runs x0..x1: bricks either side are cut back to its edges */
      if(b.z1<=z0+EPS||b.z0>=z1-EPS){out.push(b);return}
      if(b.x1<=x0+EPS||b.x0>=x1-EPS){out.push(b);return}
      if(b.x0<x0-EPS){const w=x0-b.x0;if(w>=40)out.push(Object.assign({},b,{x1:x0,t:typeByLen(w)}))}
      if(b.x1>x1+EPS){const w=b.x1-x1;if(w>=40)out.push(Object.assign({},b,{x0:x1,t:typeByLen(w)}))}
    });
    M.bricks=out;
  }
  function arch(M,o){
    const W=o.clear,xc=(o.a+o.b)/2,zs=o.zs;
    let r,cz,t0;
    if(o.arch==="segmental"){const h=Math.round(W/6/5)*5;r=(W*W/4+h*h)/(2*h);cz=zs+h-r;t0=Math.asin((zs-cz)/r);o.rise=h}
    else{r=W/2;cz=zs;t0=0;o.rise=r}
    const R=r+B.L,t1=Math.PI-t0;
    o.r=r;o.cz=cz;o.xc=xc;o.R=R;
    const P=(rad,t)=>[xc+rad*Math.cos(t),cz+rad*Math.sin(t)];
    /* Area the ring takes out of the wall: skewback to skewback along the extrados. */
    const poly=[P(r,t1),P(R,t1)];
    for(let k=1;k<48;k++)poly.push(P(R,t1-(t1-t0)*k/48));
    poly.push(P(R,t0),P(r,t0));
    for(let k=1;k<48;k++)poly.push(P(r,t0+(t1-t0)*k/48));
    M.extra.holes.push(poly);
    carvePoly(M,poly,true);
    /* Voussoirs: bricks on edge, rough ring (tapered joints, about 5 mm at the intrados). Odd count, key at the crown. */
    let n=Math.floor(r*(t1-t0)/(B.H+5));if(n%2===0)n--;
    const step=(t1-t0)/n,g=2.5/r;
    for(let k=0;k<n;k++){const a0=t0+k*step+g,a1=t0+(k+1)*step-g;M.extra.vous.push({pts:[P(r,a0),P(R,a0),P(R,a1),P(r,a1)],key:k===(n-1)/2})}
    o.vCount=n;
  }
  const inPoly=(pt,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))c=!c}return c};
  /* Bricks wholly in the area go, bricks part in it are cut (drawn clipped). inside=true: the polygon is a hole. */
  function carvePoly(M,poly,inside){
    M.bricks=M.bricks.filter(b=>{
      if(b.y0>M.depth+1)return true;
      const pts=[[b.x0+2,b.z0+2],[b.x1-2,b.z0+2],[b.x0+2,b.z1-2],[b.x1-2,b.z1-2],[(b.x0+b.x1)/2,(b.z0+b.z1)/2],[(b.x0+b.x1)/2,b.z1-2],[(b.x0+b.x1)/2,b.z0+2]];
      const n=pts.filter(p=>inPoly(p,poly)===inside).length;
      if(n===pts.length)return false;
      if(n>0)b.cut=true;
      return true;
    });
  }
  function cutGable(M){
    const g=M.cfg.gable,ze=courseZ(M.cfg,M.cfg.below+g.eaves)-B.J,apex=ze+(M.len/2)*Math.tan(g.pitch*Math.PI/180);
    g.ze=ze;g.apex=apex;
    const keep=[[0,M.base],[M.len,M.base],[M.len,ze],[M.len/2,apex],[0,ze]];
    M.extra.keep=keep;
    carvePoly(M,keep,false);
    M.bricks.forEach(b=>{if(b.z0>apex)b.gone=true});
    M.bricks=M.bricks.filter(b=>!b.gone);
    M.top=Math.max(...M.bricks.map(b=>b.z1));
  }

  /* ---------- Quantities ---------- */
  function quantities(M){
    const all=M.all(),whole=all.filter(b=>!b.cut&&(b.t==="S"||b.t==="H"||b.t==="C")).length;
    const halves=all.filter(b=>!b.cut&&b.t==="B").length,closers=all.filter(b=>!b.cut&&b.t==="Q").length;
    const cuts=all.filter(b=>b.cut||b.t==="X"||b.t==="T").length,vous=M.extra.vous.length;
    const order=whole+Math.ceil(halves/2)+Math.ceil(closers/2)+cuts+vous;
    const brickVol=(whole+halves/2+closers/4+cuts*.7+vous)*(B.L*B.W*B.H)/1e9;
    const faceArea=M.cfg.gable?(M.len*(M.cfg.gable.ze-M.base)+M.len*(M.cfg.gable.apex-M.cfg.gable.ze)/2)/1e6:(M.len*(M.top-M.base))/1e6;
    const wallLen=M.len+(M.retLen||0);
    const vol=faceArea*(M.depth/1000)*(wallLen/M.len);
    const mortar=Math.max(.01,(vol-brickVol)*1.1);
    return {whole,halves,closers,cuts,vous,order:Math.ceil(order*1.05),mortar,lintels:M.extra.lintels.length,
      conc:M.cfg.setting==="site"?((wallLen+450)/1000)*((M.depth+235)/1000)*.225:0};
  }

  /* ---------- SVG helpers (paper mm) ---------- */
  const f=n=>Math.round(n*100)/100;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const rect=(x,y,w,h,a)=>'<rect x="'+f(x)+'" y="'+f(y)+'" width="'+f(Math.max(0,w))+'" height="'+f(Math.max(0,h))+'" '+(a||"")+'/>';
  const line=(x1,y1,x2,y2,a)=>'<line x1="'+f(x1)+'" y1="'+f(y1)+'" x2="'+f(x2)+'" y2="'+f(y2)+'" '+(a||'class="ln"')+'/>';
  const text=(x,y,t,a)=>'<text x="'+f(x)+'" y="'+f(y)+'" '+(a||"")+'>'+esc(t)+'</text>';
  const poly=(pts,a)=>'<polygon points="'+pts.map(p=>f(p[0])+","+f(p[1])).join(" ")+'" '+(a||"")+'/>';
  function dimH(x1,x2,y,label,ext){
    let s=line(x1,y,x2,y,'class="dim"')+line(x1-1,y+1,x1+1,y-1,'class="tick"')+line(x2-1,y+1,x2+1,y-1,'class="tick"');
    if(ext!=null)s+=line(x1,ext,x1,y+1.2,'class="ext"')+line(x2,ext,x2,y+1.2,'class="ext"');
    return s+text((x1+x2)/2,y-1,label,'class="dt" text-anchor="middle"');
  }
  function dimV(x,y1,y2,label,ext){
    let s=line(x,y1,x,y2,'class="dim"')+line(x-1,y1+1,x+1,y1-1,'class="tick"')+line(x-1,y2+1,x+1,y2-1,'class="tick"');
    if(ext!=null)s+=line(ext,y1,x+1.2,y1,'class="ext"')+line(ext,y2,x+1.2,y2,'class="ext"');
    return s+'<text class="dt" text-anchor="middle" transform="translate('+f(x-1)+' '+f((y1+y2)/2)+') rotate(-90)">'+esc(label)+'</text>';
  }
  let uid=0;
  const DEFS=id=>'<defs>'+
    '<pattern id="hB'+id+'" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="1.6" stroke="#8a3b2c" stroke-width=".22"/></pattern>'+
    '<pattern id="hC'+id+'" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".35" fill="#555"/><circle cx="4" cy="3.2" r=".25" fill="#555"/><path d="M2.4 4.6l.9-.9.5 1.1z" fill="none" stroke="#555" stroke-width=".2"/><circle cx="5" cy="5.4" r=".2" fill="#555"/></pattern>'+
    '<pattern id="hE'+id+'" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#6b5a3e" stroke-width=".3"/><line x1="2" y1="0" x2="2" y2="4" stroke="#6b5a3e" stroke-width=".15" stroke-dasharray=".6 .6"/></pattern>'+
    '<pattern id="hK'+id+'" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#475467" stroke-width=".2"/></pattern>'+
    '<pattern id="hI'+id+'" width="3" height="2" patternUnits="userSpaceOnUse"><path d="M0 1q.75-1 1.5 0t1.5 0" fill="none" stroke="#b54708" stroke-width=".2"/></pattern>'+
    '</defs>';
  const CSS='<style>'+
    '.ln{stroke:#172033;stroke-width:.25;fill:none}.thin{stroke:#172033;stroke-width:.12;fill:none}.hid{stroke:#172033;stroke-width:.18;stroke-dasharray:1.2 .8;fill:none}'+
    '.dim{stroke:#1d4ed8;stroke-width:.15}.tick{stroke:#1d4ed8;stroke-width:.3}.ext{stroke:#1d4ed8;stroke-width:.1}.dt{fill:#1d4ed8;font:600 2.2px Arial,Helvetica,sans-serif}'+
    '.br{fill:#c9745a;stroke:#5b2a1c;stroke-width:.12}.brq{fill:#e3a24c;stroke:#5b2a1c;stroke-width:.12}.brh{fill:#dd8b62;stroke:#5b2a1c;stroke-width:.12}.brc{fill:#b35f47;stroke:#5b2a1c;stroke-width:.12}.brx{fill:#e9c3a8;stroke:#5b2a1c;stroke-width:.12}.brv{fill:#a94f38;stroke:#5b2a1c;stroke-width:.12}.brv.key{fill:#8e3e2a}'+
    '.mortar{fill:#ece6da}.lint{fill:#cfd4dc;stroke:#172033;stroke-width:.2}'+
    '.lab{font:700 3.3px Arial,Helvetica,sans-serif;fill:#172033;letter-spacing:.2px}.sub{font:400 2.3px Arial,Helvetica,sans-serif;fill:#475467}.note{font:400 2.45px Arial,Helvetica,sans-serif;fill:#172033}.noteb{font:700 2.45px Arial,Helvetica,sans-serif;fill:#172033}.sm{font:400 2px Arial,Helvetica,sans-serif;fill:#475467}'+
    '.gl{stroke:#172033;stroke-width:.35}.dpc{stroke:#111;stroke-width:.7}'+
    '.iso-t{fill:#d98f73;stroke:#5b2a1c;stroke-width:.1}.iso-f{fill:#c46a50;stroke:#5b2a1c;stroke-width:.1}.iso-s{fill:#a9533d;stroke:#5b2a1c;stroke-width:.1}.isq-t{fill:#f0bf73;stroke:#5b2a1c;stroke-width:.1}.isq-f{fill:#e3a24c;stroke:#5b2a1c;stroke-width:.1}.isq-s{fill:#c98a36;stroke:#5b2a1c;stroke-width:.1}.ish-t{fill:#eaa98a;stroke:#5b2a1c;stroke-width:.1}.ish-f{fill:#dd8b62;stroke:#5b2a1c;stroke-width:.1}.ish-s{fill:#bf6e4e;stroke:#5b2a1c;stroke-width:.1}.mo-t,.mo-f,.mo-s{fill:#e9e2d4;stroke:#9a8f7c;stroke-width:.08}.li-t,.li-f,.li-s{fill:#cfd4dc;stroke:#172033;stroke-width:.1}'+
    '</style>';
  const title=(x,y,t,sc)=>text(x,y,t,'class="lab"')+text(x,y+3.2,sc,'class="sub"')+line(x,y+.9,x+t.length*2.3,y+.9,'stroke="#172033" stroke-width=".35"');
  const SCALES=[5,10,15,20,25,30,40,50,75,100];
  const fitScale=(w,h,bw,bh)=>SCALES.find(s=>w/s<=bw&&h/s<=bh)||100;
  const brickClass=b=>b.cut||b.t==="X"||b.t==="T"?"brx":b.t==="Q"?"brq":b.t==="B"?"brh":b.t==="C"?"brc":"br";

  /* ---------- Views ---------- */
  function elevation(M,ox,oy,sc,id){
    const X=x=>ox+x/sc,Z=z=>oy-z/sc,c=M.cfg;
    const face=M.all().filter(b=>b.y0<EPS);
    const zTop=Math.max(M.top,M.copingTop||0);
    let s='';
    /* Outline of the wall, less its holes, clips the bricks so cut edges show true. */
    const outline=M.extra.keep||[[0,M.base],[M.len,M.base],[M.len,zTop],[0,zTop]];
    const d='M'+outline.map(p=>f(X(p[0]))+" "+f(Z(p[1]))).join("L")+"Z"+M.extra.holes.map(h=>"M"+h.map(p=>f(X(p[0]))+" "+f(Z(p[1]))).join("L")+"Z").join("");
    s+='<clipPath id="cl'+id+'"><path d="'+d+'" clip-rule="evenodd"/></clipPath>';
    s+='<g clip-path="url(#cl'+id+')">'+rect(X(0),Z(zTop),M.len/sc,(zTop-M.base)/sc,'class="mortar"');
    face.forEach(b=>{s+=rect(X(b.x0),Z(b.z1),(b.x1-b.x0)/sc,(b.z1-b.z0)/sc,'class="'+brickClass(b)+'"'+(b.z1<=0&&c.setting==="site"?' opacity=".45"':""))});
    s+='</g>';
    s+='<path d="'+d+'" fill="none" stroke="#172033" stroke-width=".3" clip-rule="evenodd"/>';
    M.extra.lintels.forEach(l=>{s+=rect(X(l.x0),Z(l.z1),(l.x1-l.x0)/sc,(l.z1-l.z0)/sc,'class="lint"')+text(X((l.x0+l.x1)/2),Z((l.z0+l.z1)/2)+.8,"LINTEL",'class="sm" text-anchor="middle"')});
    M.extra.vous.forEach(v=>{s+=poly(v.pts.map(p=>[X(p[0]),Z(p[1])]),'class="brv'+(v.key?" key":"")+'"')});
    if(c.opening){const o=c.opening;
      s+=line(X(o.a),Z(o.zb),X(o.b),Z(o.zs),'class="thin" stroke-dasharray="1 1"')+line(X(o.b),Z(o.zb),X(o.a),Z(o.zs),'class="thin" stroke-dasharray="1 1"');
      s+=dimH(X(o.a),X(o.b),Z(o.zb)+4,Math.round(o.clear)+" clear");
      s+=dimV(X(o.b)+4,Z(o.zb),Z(o.zs),Math.round(o.zs-o.zb)+"");
      if(o.arch){s+=text(X(o.xc),Z(o.zs)+3,(o.arch==="segmental"?"Segmental":"Semicircular")+" arch · rise "+Math.round(o.rise)+" · "+o.vCount+" bricks on edge",'class="sm" text-anchor="middle"');
        s+=line(X(o.a)-2,Z(o.zs),X(o.b)+2,Z(o.zs),'class="thin" stroke-dasharray="2 .6 .4 .6"')+text(X(o.b)+2.5,Z(o.zs)+.7,"springing",'class="sm"')}
    }
    if(c.setting==="site"){
      s+=rect(X(-117.5),Z(M.base),(M.len+235)/sc,225/sc,'class="hid"');
      s+=line(X(0)-8,Z(0),X(M.len)+8,Z(0),'class="gl"')+text(X(M.len)+9,Z(0)+.7,"GL",'class="sm"');
      s+=line(X(0),Z(150),X(M.len),Z(150),'class="dpc"')+text(X(M.len)+9,Z(150)+.7,"DPC",'class="sm"');
      if(M.coping)s+=line(X(0),Z(M.top),X(M.len),Z(M.top),'class="dpc"');
    }else s+=rect(X(-60),Z(M.base),(M.len+120)/sc,3,'fill="url(#hC'+id+')" stroke="#172033" stroke-width=".2"')+text(X(M.len+60)+1,Z(M.base)+2,"Floor",'class="sm"');
    if(c.gable){const g=c.gable;s+=text(X(M.len*.25)-4,Z((g.ze+g.apex)/2)-2,g.pitch+"°",'class="dt"')}
    // dimensions
    s+=dimH(X(0),X(M.len),Z(zTop)-5,Math.round(M.len)+"",Z(zTop)-1);
    if(M.len>SU*2)s+=dimH(X(0),X(SU),Z(zTop)-9.5,"225");
    s+=dimV(X(M.len)+(c.setting==="site"?16:6),Z(c.setting==="site"?0:M.base),Z(zTop),Math.round(zTop-(c.setting==="site"?0:M.base))+"",X(M.len)+1);
    if(c.courses>=4)s+=dimV(X(0)-6,Z(Math.max(0,M.base)),Z(Math.max(0,M.base)+4*G),"300 = 4 courses",X(0)-1);
    return s;
  }
  function planView(M,course,ox,oy,sc,label,id){
    const pd=(M.cfg.kind==="corner"?M.retLen:M.depth)+(M.cfg.cavity?200:0);
    const X=x=>ox+x/sc,Y=y=>oy+(pd-y)/sc;
    let s='';
    const list=M.bricks.filter(b=>b.c===course);
    list.forEach(b=>{s+=rect(X(b.x0),Y(b.y1),(b.x1-b.x0)/sc,(b.y1-b.y0)/sc,b.t==="Q"?'fill="#f3c98f" stroke="#172033" stroke-width=".18"':b.t==="B"||b.t==="X"||b.t==="T"?'fill="#f6ddc9" stroke="#172033" stroke-width=".18"':'fill="url(#hB'+id+')" stroke="#172033" stroke-width=".18"')});
    if(M.cfg.cavity){const w=M.cfg.kind==="corner";
      s+=rect(X(0),Y(B.W+200),M.len/sc,100/sc,'fill="url(#hK'+id+')" stroke="#475467" stroke-width=".15" stroke-dasharray="1 .6"');
      if(w)s+=rect(X(B.W+100),Y(M.retLen),100/sc,(M.retLen-B.W-100)/sc,'fill="url(#hK'+id+')" stroke="#475467" stroke-width=".15" stroke-dasharray="1 .6"')}
    s+=text(X(0),oy-1.6,label,'class="noteb"');
    s+=text(X(M.len)+1.5,Y(0)-.4,"front",'class="sm"');
    return s;
  }
  function sectionView(M,ox,oy,sc,id){
    const c=M.cfg,Y=y=>ox+y/sc,Z=z=>oy-z/sc;
    /* Cut where the most courses have a brick (not a perpend), clear of the corner and any opening. */
    let lo=c.kind==="corner"?300:40,hi=c.opening?c.opening.a-40:M.len-40;
    if(c.gable){lo=M.len/2-120;hi=M.len/2+120}
    let xs=(lo+hi)/2,best=-1;
    for(let x=lo;x<=hi;x+=5){const n=new Set(M.all().filter(b=>b.y0<EPS&&b.x0+8<x&&b.x1-8>x).map(b=>b.c)).size;if(n>best){best=n;xs=x}}
    const cutB=M.all().filter(b=>b.x0<=xs&&b.x1>=xs);
    const top=cutB.length?Math.max(...cutB.map(b=>b.z1)):M.top;
    let s='';
    const lead=(y,z,t)=>line(Y(y),Z(z),Y(-160),Z(z),'class="thin"')+text(Y(-160)-.6,Z(z)+.7,t,'class="sm" text-anchor="end"');
    if(c.setting==="site"){
      const fs=117.5,fw=M.depth+2*fs+(c.cavity?200:0);
      s+=rect(Y(-fs-140),Z(0),140/sc,(-M.base+285)/sc,'fill="url(#hE'+id+')"')+rect(Y(fw-fs),Z(0),140/sc,(-M.base+285)/sc,'fill="url(#hE'+id+')"');
      s+=rect(Y(-fs),Z(M.base),fw/sc,225/sc,'fill="url(#hC'+id+')" stroke="#172033" stroke-width=".3"');
      s+=line(Y(-fs-140),Z(0),Y(0),Z(0),'class="gl"')+line(Y(fw-fs),Z(0),Y(fw-fs+140),Z(0),'class="gl"');
      s+=dimH(Y(-fs),Y(fw-fs),Z(M.base-225)+5,Math.round(fw)+"",Z(M.base-225)+1);
      s+=lead(-fs,M.base-110,"C20 concrete");
    }else s+=rect(Y(-60),Z(M.base),(M.depth+120+(c.cavity?200:0))/sc,4,'fill="url(#hC'+id+')" stroke="#172033" stroke-width=".2"');
    s+=rect(Y(0),Z(top),M.depth/sc,(top-M.base)/sc,'class="mortar" stroke="#172033" stroke-width=".22"');
    cutB.forEach(b=>{s+=rect(Y(b.y0),Z(b.z1),(b.y1-b.y0)/sc,(b.z1-b.z0)/sc,'fill="url(#hB'+id+')" stroke="#172033" stroke-width=".2"')});
    if(c.cavity){ // 100 cavity, 100 blockwork inner leaf, ties every 450 up
      const bx=M.depth+100;
      for(let z=M.base+B.J;z<top-5;z+=225){const z1=Math.min(z+215,top);s+=rect(Y(bx),Z(z1),100/sc,(z1-z)/sc,'fill="url(#hK'+id+')" stroke="#172033" stroke-width=".2"')}
      for(let z=M.base+(c.setting==="site"?225:150);z<top-40;z+=450)s+=line(Y(M.depth-40),Z(z),Y(bx+40),Z(z),'stroke="#1f2937" stroke-width=".35"');
      s+=dimH(Y(M.depth),Y(bx),Z(top)-4,"100");
      s+=text(Y(bx+50),Z(top)-7,"Blockwork",'class="sm" text-anchor="middle"');
      s+=lead(0,top-300,"Wall ties at 450 vertical");
    }
    if(c.setting==="site"){
      s+=line(Y(-3),Z(155),Y(M.depth+(c.cavity?203:3)),Z(155),'class="dpc"');
      s+=lead(0,155,"DPC 150 above GL");
      if(M.coping){s+=line(Y(-3),Z(M.top+5),Y(M.depth+3),Z(M.top+5),'class="dpc"');s+=lead(0,M.top+40,"Brick-on-edge coping on DPC")}
      s+=dimV(Y(M.depth+(c.cavity?200:0))+13,Z(0),Z(150),"150");
    }
    s+=dimH(Y(0),Y(M.depth),Z(top)-(c.cavity?9:4),M.depth+"",Z(top)-1);
    s+=dimV(Y(M.depth+(c.cavity?200:0))+7,Z(c.setting==="site"?0:M.base),Z(top),Math.round(top-(c.setting==="site"?0:M.base))+"",Y(M.depth)+1);
    const hc=cutB.find(b=>b.t==="H"&&b.z0>0),sc2=cutB.find(b=>b.t==="S"&&b.z0>0&&M.oneBrick);
    if(hc)s+=lead(0,(hc.z0+hc.z1)/2,"Header course");
    if(sc2)s+=lead(0,(sc2.z0+sc2.z1)/2,"Stretcher course");
    return {svg:s,xs};
  }
  function isoView(M,ox,oy,boxW,boxH,id){
    const c=M.cfg,C=Math.cos(Math.PI/6),S=Math.sin(Math.PI/6);
    let cut=Math.min(M.len,c.kind==="pier"?M.len:900),cutY=c.kind==="corner"?Math.min(M.retLen,700):M.depth;
    if(c.opening)cut=Math.min(cut,c.opening.lintel?c.opening.lintel.x0-B.J-20:c.opening.a-160);
    let zMax=Math.max(M.top,M.copingTop||0);
    if(c.gable)zMax=c.gable.ze;
    const zMin=c.setting==="site"?0:M.base;
    const list=M.all().filter(b=>b.x0<cut&&b.y0<cutY&&b.z1>zMin&&b.z1<=zMax+1).map(b=>Object.assign({},b,{x1:Math.min(b.x1,cut),y1:Math.min(b.y1,cutY),z0:Math.max(b.z0,zMin)}));
    if(!list.length)return "";
    const P0=(x,y,z)=>[(x*C-y*C),-(x*S+y*S+z)];
    let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
    list.forEach(b=>[[b.x0,b.y0,b.z0],[b.x1,b.y0,b.z0],[b.x0,b.y1,b.z1],[b.x1,b.y1,b.z1],[b.x0,b.y1,b.z0],[b.x1,b.y0,b.z1]].forEach(p=>{const q=P0(...p);mnx=Math.min(mnx,q[0]);mxx=Math.max(mxx,q[0]);mny=Math.min(mny,q[1]);mxy=Math.max(mxy,q[1])}));
    const sc=Math.max((mxx-mnx)/boxW,(mxy-mny)/boxH);
    const P=(x,y,z)=>{const q=P0(x,y,z);return [ox+(q[0]-mnx)/sc+(boxW-(mxx-mnx)/sc)/2,oy+(q[1]-mny)/sc]};
    const pg=(pts,cls)=>'<polygon points="'+pts.map(p=>f(p[0])+","+f(p[1])).join(" ")+'" class="'+cls+'"/>';
    const box=(b,col)=>{const {x0,x1,y0,y1,z0,z1}=b;
      return pg([P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)],col+"-t")+pg([P(x0,y0,z0),P(x1,y0,z0),P(x1,y0,z1),P(x0,y0,z1)],col+"-f")+pg([P(x0,y0,z0),P(x0,y1,z0),P(x0,y1,z1),P(x0,y0,z1)],col+"-s")};
    let s='';
    const topCourse=Math.max(...list.filter(b=>b.t!=="C").map(b=>b.z1));
    s+=box({x0:0,x1:cut,y0:0,y1:M.depth,z0:zMin,z1:topCourse},"mo");
    if(c.kind==="corner")s+=box({x0:0,x1:M.depth,y0:0,y1:cutY,z0:zMin,z1:topCourse},"mo");
    if(M.coping)s+=box({x0:0,x1:cut,y0:0,y1:M.depth,z0:topCourse,z1:M.copingTop-1},"mo");
    list.sort((a,b)=>(a.z0-b.z0)||((b.x0+b.y0)-(a.x0+a.y0)));
    list.forEach(b=>{s+=box(b,b.t==="Q"?"isq":b.t==="B"?"ish":"iso")});
    return s;
  }

  /* ---------- Text ---------- */
  const BOND={stretcher:"Stretcher bond",english:"English bond",flemish:"Flemish bond",egw:"English garden wall bond"};
  function describe(c){
    const kind={wall:"Wall",corner:"Wall with a return corner",pier:"One-brick pier"}[c.kind]||"Wall";
    const extra=c.opening?(c.opening.arch?" with "+(c.opening.arch==="segmental"?"a segmental":"a semicircular")+" arch":" with an opening"):c.gable?" · gable":"";
    const thick=c.kind==="pier"?"":c.bond==="stretcher"?"Half-brick ":"One-brick ";
    return c.kind==="pier"?"One-brick pier · English bond":thick+kind.toLowerCase()+extra+" · "+BOND[c.bond];
  }
  function spec(M){
    const c=M.cfg,out=[];
    out.push("Bricks: 215 × 102.5 × 65 mm"+(c.setting==="site"?" clay facing bricks, frost resistant (F2).":" (workshop bricks)."));
    out.push(c.setting==="site"?"Mortar: designation (iii) 1:1:6 cement : lime : sand. 10 mm joints, bucket-handle finish.":"Mortar: the practice mortar your workshop provides. 10 mm joints throughout.");
    const bondNote={stretcher:"Stretcher bond, half-brick (102.5 mm). Half-bond lap: each perpend sits over the middle of the brick below.",english:"English bond, one brick (215 mm). Alternate courses of headers and stretchers.",flemish:"Flemish bond, one brick (215 mm). Headers and stretchers alternate in every course; each header sits centrally over the stretcher below.",egw:"English garden wall bond, one brick (215 mm). Three stretcher courses to one header course."}[c.bond];
    out.push("Bond: "+bondNote);
    if((c.bond==="english"||c.bond==="egw")&&c.kind!=="pier")out.push("Stopped ends"+(c.kind==="corner"?" and quoin":"")+": quoin header followed by a queen closer in every header course.");
    if(c.bond==="flemish")out.push("Stopped ends: header and queen closer in one course, a stretcher in the next, keeping the quarter-bond lap.");
    if(c.bond==="stretcher")out.push(c.kind==="corner"?"Quoin: the runs swap at the corner each course, so the return bonds in. Half bats at stopped ends.":"Stopped ends: half bats in alternate courses keep the half-bond lap.");
    out.push("Gauge: 75 mm per course (65 brick + 10 joint). Check with a gauge rod every 4 courses = 300 mm.");
    if(c.opening&&!c.opening.arch)out.push("Opening: jambs plumb and square, reveals in half bats. Concrete lintel, 215 mm bearing each end (150 mm minimum), bedded level on mortar.");
    if(c.opening&&c.opening.arch)out.push("Arch: set out on a timber turning piece. Rough ring of bricks on edge, tapered joints about 5 mm at the intrados. Key brick at the crown. Strike the centre only when the mortar has set.");
    if(c.gable)out.push("Gable: set the rake with a pitch line from the apex; cut bricks to the line with a disc cutter or bolster, cut face kept tidy.");
    if(c.cavity)out.push("Cavity: 100 mm, inner leaf 100 mm blockwork. Wall ties at 900 horizontal and 450 vertical, closer at openings; keep the cavity clean.");
    if(c.setting==="site"){out.push("DPC: 150 mm min above ground level"+(M.coping?", and under the coping":"")+". Lap 100 mm at joints.");out.push("Foundation: C20 concrete strip, 225 mm deep, on firm natural ground.")}
    if(c.kind==="pier")out.push("Pier: alternate courses turn through 90° so no straight joint runs up the pier. Check both faces plumb.");
    out.push("Keep perpends in line: every other perpend should line up vertically.");
    out.push("Protect new work from rain and frost. Tool the joints when thumb-print hard.");
    return out.slice(0,11);
  }

  /* ---------- Sheet ---------- */
  function sheet(cfg,meta){
    const id=++uid,M=build(cfg),Q=quantities(M),c=M.cfg;meta=meta||{};
    let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" width="420mm" height="297mm" font-family="Arial,Helvetica,sans-serif">'+DEFS(id)+CSS;
    s+=rect(0,0,420,297,'fill="#fff"')+rect(8,8,404,281,'fill="none" stroke="#172033" stroke-width=".5"');
    // Elevation
    const zTop=Math.max(M.top,M.copingTop||0),eh=zTop-M.base+(c.setting==="site"?225:0);
    const es=fitScale(M.len+500,eh+300,138,84);
    s+=title(18,20,"FRONT ELEVATION","Scale 1:"+es+" · "+BOND[c.bond]);
    const eoy=36+(zTop+140)/es;
    s+=elevation(M,34,eoy,es,id);
    if(c.opening||c.gable){}
    // Plans: one per distinct course pattern (up to 3), from the courses above ground or floor
    const firstAbove=c.below;
    const sig=i=>M.bricks.filter(b=>b.c===i).map(b=>b.t+Math.round(b.x0)+","+Math.round(b.y0)).join("|");
    const pl=[];const seen=new Set();
    for(let i=firstAbove;i<M.total&&pl.length<3;i++){const g=sig(i);if(g&&!seen.has(g)){seen.add(g);pl.push(i)}}
    const pd=(c.kind==="corner"?M.retLen:M.depth)+(c.cavity?200:0);
    const eBottom=eoy+(c.setting==="site"?(-M.base+225)/es:3);
    const boxH=180-(eBottom+21),n=pl.length;
    /* Side by side when narrow (corners, piers), stacked when long. Pick whichever draws them bigger. */
    const rowS=SCALES.find(k=>(M.len/k+12)*n<=138&&pd/k+8<=boxH)||100,colS=SCALES.find(k=>M.len/k+12<=138&&(pd/k+9)*n<=boxH)||100;
    const inRow=rowS<colS,ps=Math.min(rowS,colS);
    s+=title(18,eBottom+10,"PLANS","Scale 1:"+ps+" · cut bricks hatched · closers and bats shaded");
    let px=34,py=eBottom+23;
    const courseName=i=>{if(c.opening&&M.bricks.filter(b=>b.c===i).some(b=>b.x0<c.opening.b&&b.x1>c.opening.a)===false&&i-c.below>=c.opening.sill&&i-c.below<c.opening.head)return "Course through the opening";if(c.kind==="pier")return i%2?"Courses 2, 4, 6 …":"Courses 1, 3, 5 …";if(c.bond==="egw")return ["Header courses (1, 5, 9 …)","Stretcher courses (2, 4 …)","Stretcher courses (3, 7 …)"][[0,1,2,1][i%4]];return (i%2?"Courses 2, 4, 6 …":"Courses 1, 3, 5 …")+(c.bond==="english"?(i%2?" (stretchers)":" (headers)"):"")};
    pl.forEach(i=>{s+=planView(M,i,px,py,ps,courseName(i),id);if(inRow)px+=M.len/ps+14;else py+=pd/ps+9});
    // Section
    const sh=zTop-M.base+(c.setting==="site"?225:0)+200;
    const ss=fitScale(M.depth+(c.cavity?200:0)+500,sh,70,140);
    s+=title(170,20,"SECTION A–A","Scale 1:"+ss);
    const soy=30+(zTop+120)/ss;
    const sec=sectionView(M,208,soy,ss,id);
    s+=sec.svg;
    s+=line(34+sec.xs/es,eoy-zTop/es-2,34+sec.xs/es,eoy+3,'stroke="#b42318" stroke-width=".3" stroke-dasharray="2 1"')+text(34+sec.xs/es+.8,eoy+5.2,"A",'class="noteb" fill="#b42318"');
    // Isometric
    s+=title(278,20,"ISOMETRIC","Not to scale · "+(c.kind==="corner"?"the quoin, showing both faces":c.kind==="pier"?"the whole pier":"the left-hand end"));
    s+=isoView(M,284,32,118,138,id);
    // Specification
    const sy=190;
    s+=text(18,sy,"SPECIFICATION",'class="lab"');
    spec(M).forEach((t,i)=>{
      const words=t.split(" "),lines=[];let cur="";words.forEach(w=>{if((cur+" "+w).length>112){lines.push(cur);cur=w}else cur=(cur?cur+" ":"")+w});lines.push(cur);
      s+=text(18,sy+5+i*3.35,(i+1)+". "+lines[0]+(lines[1]?" "+lines.slice(1).join(" "):""),'class="note"');
    });
    // Quantities
    const qx=226,qy=190;
    s+=text(qx,qy,"QUANTITIES",'class="lab"');
    const rows=[["Whole bricks",Q.whole]];
    if(Q.halves)rows.push(["Half bats",Q.halves]);
    if(Q.closers)rows.push(["Queen closers",Q.closers]);
    if(Q.cuts)rows.push(["Cut bricks (rakes, curves)",Q.cuts]);
    if(Q.vous)rows.push(["Arch bricks (on edge)",Q.vous]);
    if(Q.lintels)rows.push(["Lintels",Q.lintels]);
    rows.push(["Bricks to order (+5% waste)",Q.order],["Mortar (approx.)",(Math.round(Q.mortar*100)/100)+" m³"]);
    if(Q.conc)rows.push(["Foundation concrete",(Math.round(Q.conc*100)/100)+" m³"]);
    rows.forEach((r,i)=>{const y=qy+5+i*3.9;s+=text(qx,y,r[0],'class="note"')+text(qx+80,y,String(r[1]),'class="noteb" text-anchor="end"')+line(qx,y+1.2,qx+80,y+1.2,'stroke="#e4e7ec" stroke-width=".2"')});
    const ly=qy+8+rows.length*3.9;
    s+=rect(qx,ly,4.5,2.8,'class="br"')+text(qx+5.5,ly+2.2,"Brick",'class="sm"')+rect(qx+20,ly,4.5,2.8,'class="brq"')+text(qx+25.5,ly+2.2,"Closer",'class="sm"')+rect(qx+40,ly,4.5,2.8,'class="brh"')+text(qx+45.5,ly+2.2,"Half bat",'class="sm"')+rect(qx+60,ly,4.5,2.8,'class="brx"')+text(qx+65.5,ly+2.2,"Cut",'class="sm"');
    // Title block
    const tx=316,ty=186,tw=88,th=95;
    s+=rect(tx,ty,tw,th,'fill="none" stroke="#172033" stroke-width=".4"')+rect(tx,ty,tw,11,'fill="#172033"')+text(tx+4,ty+7.3,"EVIA · LEARNING DRAWING",'font-size="3.3" font-weight="700" fill="#fff" letter-spacing=".3"');
    const tb=[["Job",meta.job||"Practice build"],["Drawing",describe(c)],["Drawing no.",meta.no||("EV-"+Date.now().toString(36).toUpperCase().slice(-5))],["Course",meta.course||""],["Size",Math.round(M.len)+(c.kind==="corner"?" × "+Math.round(M.retLen):"")+" long · "+c.courses+" courses"+(c.setting==="site"?" above ground":"")],["Units","Millimetres unless stated · A3"],["Drawn","Evia · "+new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})]];
    tb.forEach((r,i)=>{const y=ty+18+i*8.4;s+=text(tx+4,y,r[0].toUpperCase(),'class="sm"')+text(tx+4,y+3.5,String(r[1]).slice(0,52),'class="noteb"')+line(tx,y+5.4,tx+tw,y+5.4,'stroke="#e4e7ec" stroke-width=".2"')});
    s+=text(tx+4,ty+th-4,"For learning only. Not a construction drawing.",'class="sm"')+text(tx+4,ty+th-1.4,"Do not scale: work to the figured dimensions.",'class="sm"');
    return s+'</svg>';
  }

  /* ---------- Drawings for the college tasks ---------- */
  const TASKS={
    "cavity-opening":[{title:"Outer leaf with window opening",cfg:{kind:"corner",bond:"stretcher",n:9,ret:3,courses:16,opening:{p:4,q:3,sill:4,head:12},cavity:true},job:"Cavity wall panel with window opening"}],
    "bonds-return":[{title:"English bond with a return",cfg:{kind:"corner",bond:"english",n:6,ret:3,courses:10},job:"One-brick wall, English bond, return"},{title:"Flemish bond wall",cfg:{kind:"wall",bond:"flemish",n:4,courses:10},job:"One-brick wall, Flemish bond"}],
    "gable":[{title:"Raking gable panel",cfg:{kind:"wall",bond:"stretcher",n:9,courses:20,gable:{eaves:8,pitch:35}},job:"Raking gable end panel"}],
    "garden-repair":[{title:"Garden wall bond panel",cfg:{kind:"wall",bond:"egw",n:8,courses:13},job:"Garden wall bond panel"},{title:"One-brick pier",cfg:{kind:"pier",bond:"english",courses:13},job:"One-brick pier"}],
    "l3-arch":[{title:"Segmental arch over an opening",cfg:{kind:"wall",bond:"stretcher",n:9,courses:18,opening:{p:3,q:3,sill:2,head:10,arch:"segmental"}},job:"Segmental arch over an opening"}]
  };
  const forTask=id=>TASKS[id]||[];

  /* ---------- Viewer ---------- */
  const $=s=>document.querySelector(s);
  const reduced=()=>window.eviaAccessibility?window.eviaAccessibility.reducedMotion():matchMedia("(prefers-reduced-motion: reduce)").matches;
  function open(cfg,meta){
    meta=Object.assign({course:(typeof data==="function"?data().name:"")},meta||{});
    const svg=sheet(cfg,meta);
    const ov=document.createElement("div");ov.className="dv-overlay";
    ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Drawing");
    ov.innerHTML='<div class="dv-bar"><button type="button" class="dv-close" aria-label="Close">×</button><div class="dv-title"><small>LEARNING DRAWING</small><strong>'+esc(meta.title||describe(Object.assign({kind:"wall",bond:"stretcher"},cfg)))+'</strong></div><button type="button" class="dv-pdf">PDF</button></div>'+
      '<div class="dv-stage"><div class="dv-paper">'+svg+'</div></div>'+
      '<div class="dv-zoom"><button type="button" data-z="-1" aria-label="Zoom out">−</button><button type="button" data-z="0" aria-label="Fit">Fit</button><button type="button" data-z="1" aria-label="Zoom in">+</button></div>';
    document.body.appendChild(ov);
    const prevFocus=document.activeElement;ov.querySelector(".dv-close").focus({preventScroll:true});
    const stage=ov.querySelector(".dv-stage"),paper=ov.querySelector(".dv-paper");
    let z=1;const fit=()=>stage.clientWidth-16;
    const apply=()=>{paper.style.width=(fit()*z)+"px"};apply();
    ov.querySelectorAll("[data-z]").forEach(b=>b.onclick=()=>{const d=+b.dataset.z;const cx=(stage.scrollLeft+stage.clientWidth/2)/stage.scrollWidth,cy=(stage.scrollTop+stage.clientHeight/2)/stage.scrollHeight;z=d===0?1:Math.max(1,Math.min(5,z*(d>0?1.6:1/1.6)));apply();stage.scrollLeft=cx*stage.scrollWidth-stage.clientWidth/2;stage.scrollTop=cy*stage.scrollHeight-stage.clientHeight/2});
    /* two-finger pinch zoom */
    let pinch=null;
    stage.addEventListener("touchstart",e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);pinch={d,z}}},{passive:true});
    stage.addEventListener("touchmove",e=>{if(pinch&&e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);z=Math.max(1,Math.min(5,pinch.z*d/pinch.d));apply()}},{passive:true});
    stage.addEventListener("touchend",()=>{pinch=null},{passive:true});
    const onKey=e=>{if(e.key==="Escape")close()};document.addEventListener("keydown",onKey);
    const close=()=>{document.removeEventListener("keydown",onKey);ov.classList.add("dv-out");setTimeout(()=>{ov.remove();if(prevFocus&&prevFocus.focus)prevFocus.focus({preventScroll:true})},reduced()?0:180)};
    ov.querySelector(".dv-close").onclick=close;
    ov.querySelector(".dv-pdf").onclick=async e=>{const b=e.currentTarget;b.disabled=true;b.textContent="…";try{await pdf(svg,meta)}catch(err){console.error(err);if(typeof showEvidenceToast==="function")showEvidenceToast("Couldn’t make the PDF",true)}b.disabled=false;b.textContent="PDF"};
  }
  /* PDF: the drawing is drawn onto an A3 canvas and placed in a jsPDF page, then shared or saved. */
  async function pdf(svg,meta){
    const {jsPDF}=await (window.eviaLoadJsPdf?window.eviaLoadJsPdf():new Promise((res,rej)=>{if(window.jspdf)return res(window.jspdf);const s=document.createElement("script");s.src="vendor/jspdf.umd.min.js";s.onload=()=>res(window.jspdf);s.onerror=rej;document.head.appendChild(s)}));
    const W=3508,H=2480; // A3 at 212 dpi
    const img=new Image();const url=URL.createObjectURL(new Blob([svg.replace('width="420mm" height="297mm"','width="'+W+'" height="'+H+'"')],{type:"image/svg+xml"}));
    await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});
    const cv=document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,W,H);g.drawImage(img,0,0,W,H);URL.revokeObjectURL(url);
    const doc=new jsPDF({orientation:"landscape",unit:"mm",format:"a3",compress:true});
    doc.addImage(cv.toDataURL("image/jpeg",.92),"JPEG",0,0,420,297);
    const name=("Evia drawing "+(meta.title||"")).trim().replace(/[^\w\- ]+/g,"").replace(/\s+/g,"_")+".pdf";
    const blob=doc.output("blob"),file=new File([blob],name,{type:"application/pdf"});
    try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:meta.title||"Drawing"});return}}catch(e){if(e&&e.name==="AbortError")return}
    const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();a.remove();
  }

  /* ---------- Generator: pick the job, Evia draws it ---------- */
  function generator(){
    const st={kind:"wall",bond:"english",n:6,courses:10,setting:"workshop",extra:"none"};
    const root=document.getElementById("modal-root")||document.body;
    const seg=(key,opts)=>'<div class="dg-seg" data-key="'+key+'">'+opts.map(([v,l])=>'<button type="button" data-v="'+v+'">'+l+'</button>').join("")+'</div>';
    const stepper=(key,label,min,max)=>'<div class="dg-step" data-key="'+key+'" data-min="'+min+'" data-max="'+max+'"><span>'+label+'</span><button type="button" data-d="-1" aria-label="Less">−</button><b></b><button type="button" data-d="1" aria-label="More">+</button></div>';
    root.innerHTML='<div class="overlay dg-overlay"><section class="sheet pr-sheet dg-sheet" role="dialog" aria-modal="true" aria-label="Draw a job"><div class="sheet-head"><div><div class="chat-kicker">EVIA · DRAWINGS</div><h2>Draw me a job</h2></div><button class="close" type="button" aria-label="Close">×</button></div><div class="pr-body">'+
      '<h3 class="pr-h">What are you building?</h3>'+seg("kind",[["wall","Straight wall"],["corner","Corner"],["opening","Opening"],["arch","Arch"],["gable","Gable"],["pier","Pier"]])+
      '<div class="dg-bond"><h3 class="pr-h">Bond</h3>'+seg("bond",[["stretcher","Stretcher"],["english","English"],["flemish","Flemish"],["egw","Garden wall"]])+'</div>'+
      '<h3 class="pr-h">Size</h3><div class="dg-steps">'+stepper("n","Length",2,14)+stepper("courses","Courses",4,30)+'</div><p class="dg-size"></p>'+
      '<h3 class="pr-h">Where</h3>'+seg("setting",[["workshop","College workshop"],["site","On site, with foundation"]])+
      '<p class="dg-note"></p><div class="pr-actions"><button type="button" class="primary dg-go">Draw it</button></div></div></section></div>';
    const ov=root.querySelector(".dg-overlay");
    const allowed=k=>({wall:["stretcher","english","flemish","egw"],corner:["stretcher","english"],opening:["stretcher"],arch:["stretcher"],gable:["stretcher"],pier:["english"]})[k];
    const cfgOf=()=>{
      const c={kind:st.kind==="corner"||st.kind==="pier"?st.kind:"wall",bond:st.bond,n:st.n,courses:st.courses,setting:st.setting,ret:3};
      if(st.kind==="opening"||st.kind==="arch"){c.n=Math.max(st.n,7);const q=Math.max(2,Math.min(4,c.n-4)),p=Math.floor((c.n-q)/2);c.courses=Math.max(st.courses,14);c.opening={p,q,sill:st.kind==="arch"?2:3,head:c.courses-5};if(st.kind==="arch")c.opening.arch="segmental"}
      if(st.kind==="gable"){c.courses=Math.max(st.courses,16);c.gable={eaves:Math.max(4,Math.floor(c.courses/2)-2),pitch:35}}
      return c;
    };
    const paint=()=>{
      const ok=allowed(st.kind);if(!ok.includes(st.bond))st.bond=ok[0];
      ov.querySelectorAll(".dg-seg").forEach(g=>g.querySelectorAll("button").forEach(b=>{const on=st[g.dataset.key]===b.dataset.v;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);if(g.dataset.key==="bond")b.hidden=!ok.includes(b.dataset.v)}));
      ov.querySelector(".dg-bond").hidden=ok.length<2;
      const lenStep=ov.querySelector('.dg-step[data-key="n"]');lenStep.hidden=st.kind==="pier";
      ov.querySelectorAll(".dg-step").forEach(g=>{g.querySelector("b").textContent=st[g.dataset.key]});
      const c=cfgOf(),len=c.kind==="pier"?215:lenFor(c.bond,c.n);
      ov.querySelector(".dg-size").textContent=(c.kind==="pier"?"215 × 215 pier":"Length "+len+" mm")+" · height "+(c.courses*75)+" mm ("+c.courses+" courses). Lengths snap to whole bond units.";
      ov.querySelector(".dg-note").textContent={opening:"Opening with a concrete lintel. Reveals in half bats.",arch:"Segmental arch, rough ring of bricks on edge, over an opening.",gable:"Raking gable at 35°: bricks cut to the rake.",pier:"One-brick square pier; courses turn through 90°.",corner:st.bond==="english"?"English bond quoin with a queen closer on each face.":"Half-brick quoin in stretcher bond.",wall:"Stopped ends at both ends."}[st.kind];
    };
    ov.querySelectorAll(".dg-seg").forEach(g=>g.onclick=e=>{const b=e.target.closest("button");if(!b)return;st[g.dataset.key]=b.dataset.v;paint()});
    ov.querySelectorAll(".dg-step").forEach(g=>g.onclick=e=>{const b=e.target.closest("button");if(!b)return;const k=g.dataset.key;st[k]=Math.max(+g.dataset.min,Math.min(+g.dataset.max,st[k]+ +b.dataset.d));paint()});
    const close=()=>{ov.classList.add("ui-closing");setTimeout(()=>ov.remove(),reduced()?0:170)};
    ov.querySelector(".close").onclick=close;ov.addEventListener("click",e=>{if(e.target===ov)close()});
    ov.querySelector(".dg-go").onclick=()=>{const c=cfgOf();close();setTimeout(()=>open(c,{title:describe(c),job:"Practice build"}),120)};
    paint();
  }
  const available=()=>typeof course!=="undefined"&&(course==="bricklayer"||course==="trowel3");
  window.EviaDraw={build,sheet,quantities,open,pdf,generator,forTask,describe,available,TASKS};
})();
