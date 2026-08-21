import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const metaSource=fs.readFileSync("assets/evia-trowel-meta.js","utf8");
const handbookSource=fs.readFileSync("assets/evia-trowel-handbook-v89.js","utf8");
const dataSource=fs.readFileSync("assets/evia-trowel-data.js","utf8");
const loaderSource=fs.readFileSync("assets/evia-trowel-loader.js","utf8");

function runtime(){
  const box={console,Promise,setTimeout,clearTimeout};
  box.window=box;
  box.XMLHttpRequest=class{
    open(){}
    send(){this.status=200;this.responseText=dataSource}
  };
  box.fetch=async()=>{throw new Error("fetch fallback should not be needed in this test")};
  vm.createContext(box);
  vm.runInContext(metaSource,box,{filename:"evia-trowel-meta.js"});
  vm.runInContext(handbookSource,box,{filename:"evia-trowel-handbook-v89.js"});
  vm.runInContext(loaderSource,box,{filename:"evia-trowel-loader.js"});
  return box;
}

function allOpps(data){return data.flatMap(cat=>(cat.jobs||[]).flatMap(job=>(job.opps||[]).map(op=>({cat,job,op}))))}

test("every selectable Level 3 NVQ area maps to at least one legitimate AC",()=>{
  const box=runtime(),meta=box.EviaTrowelMeta;
  for(const route of ["thin","repair","specialist","drainage"]){
    const data=box.EviaTrowelData.build(route),opps=allOpps(data);
    assert.ok(opps.length>0,`${route} has evidence areas`);
    const expected=(meta.routeUnits[route]||[]).flatMap(unit=>meta.unitCodes[String(unit)]||[]).map(String);
    const allowed=new Set(expected),mapped=new Set();
    for(const {cat,job,op} of opps){
      assert.ok(Array.isArray(op.codes)&&op.codes.length>0,`${route}: ${cat.title} / ${job.title} / ${op.title} has ACs`);
      for(const code of op.codes){
        assert.ok(allowed.has(String(code)),`${route}: ${op.title} maps only route ACs (${code})`);
        mapped.add(String(code));
      }
    }
    assert.deepEqual(expected.filter(code=>!mapped.has(code)),[],`${route}: every official AC remains reachable`);
  }
});

test("v91 remap refuses an installed pack containing an empty selectable area",()=>{
  const remap=fs.readFileSync("assets/evia-6570-v91-remap.js","utf8");
  assert.match(remap,/!Array\.isArray\(op\.codes\)\|\|!op\.codes\.length/);
  assert.match(remap,/every-selectable-area-has-ac/);
  const index=fs.readFileSync("index.html","utf8");
  const sw=fs.readFileSync("sw.js","utf8");
  const publicSw=fs.readFileSync("public/sw.js","utf8");
  assert.match(index,/evia-app-version" content="91"/);
  assert.match(index,/evia-trowel-loader\.js\?v=91/);
  assert.match(index,/evia-6570-v91-remap\.js\?v=91/);
  assert.match(sw,/evia-shell-v91/);
  assert.equal(sw,publicSw);
});
