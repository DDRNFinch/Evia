/* Checks every Teach me lesson file: unique ids, answers present, and match/order steps that can be completed. */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const ctx={window:{}};vm.createContext(ctx);
const files=["teach-kit.js",...fs.readdirSync(root).filter(f=>/^teach-(?!kit).*\.js$/.test(f))];
files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f}));
const T=ctx.window.EVIA_TEACH,problems=[],ids=new Set();let lessons=0,steps=0;
const units=[].concat(...Object.values(T.courses),T.fs);
units.forEach(u=>{
  if(!u.unit||!u.lessons||!u.lessons.length)problems.push("unit without lessons: "+u.unit);
  u.lessons.forEach(l=>{
    lessons++;
    if(ids.has(l.id))problems.push("duplicate lesson id "+l.id);ids.add(l.id);
    if(!l.steps.some(s=>s.t!=="learn"))problems.push(l.id+": no questions");
    l.steps.forEach((s,i)=>{steps++;const at=l.id+" step "+(i+1)+": ";
      if(s.t==="learn"&&!(s.title&&s.text))problems.push(at+"learn needs title and text");
      if(s.t==="choice"){if(!Array.isArray(s.opts)||s.opts.length<2)problems.push(at+"choice needs options");if(new Set(s.opts).size!==s.opts.length)problems.push(at+"repeated option");if(!s.q)problems.push(at+"no question")}
      if(s.t==="tf"&&typeof s.a!=="boolean")problems.push(at+"true/false needs a boolean");
      if(s.t==="match"){const l1=s.pairs.map(p=>p[0]),r=s.pairs.map(p=>p[1]);if(s.pairs.length<3)problems.push(at+"match needs 3+ pairs");if(new Set(l1).size!==l1.length||new Set(r).size!==r.length)problems.push(at+"match has a repeated item");if(s.pairs.some(p=>p.length!==2))problems.push(at+"bad pair")}
      if(s.t==="order"&&(s.items.length<3||new Set(s.items).size!==s.items.length))problems.push(at+"order needs 3+ different items");
    });
  });
});
const byCourse=Object.entries(T.courses).map(([c,us])=>c+" "+us.length+" units").join(", ");
if(problems.length){console.log(problems.join("\n"));console.log("\n✗ "+problems.length+" problem(s)");process.exit(1)}
console.log("✓ "+lessons+" lessons, "+steps+" steps OK · "+(byCourse||"no course units yet")+" · maths/English "+T.fs.length+" units");
