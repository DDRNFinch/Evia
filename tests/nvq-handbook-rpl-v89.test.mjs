import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const handbookSource=read('assets/evia-trowel-handbook-v89.js');
const metaSource=read('assets/evia-trowel-meta.js');
const loader=read('assets/evia-trowel-loader.js');
const migration=read('assets/evia-6570-pack-migration.js');
const nvq=read('assets/evia-nvq.js');
const rplUnit=read('assets/evia-rpl-unit-order-v88.js');
const index=read('index.html');
const sw=read('sw.js');
const publicSw=read('public/sw.js');

function jsonBetween(source,start,end){
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,`Missing ${start}`);
  return JSON.parse(source.slice(a+start.length,b));
}

const handbook=jsonBetween(handbookSource,'const TEXT=',';\nfunction describe');
const meta=jsonBetween(metaSource,'window.EviaTrowelMeta=',';');
const expected={thin:238,repair:239,specialist:239,drainage:240};

test('handbook contains every official 6570-05 AC used by Evia',()=>{
  assert.equal(Object.keys(handbook).length,335);
  assert.match(handbook['102.1.1'],/workplace inductions/);
  assert.match(handbook['235.7.4'],/erect cavity walling and solid walling/);
  assert.match(handbook['701.7.3'],/at least four of the following lines/);
  assert.match(handbook['837.7.8'],/maintain the tools and equipment/);
  for(const [route,total] of Object.entries(expected)){
    const codes=meta.routeUnits[route].flatMap(unit=>meta.unitCodes[String(unit)]||[]);
    assert.equal(codes.length,total,`${route} AC total`);
    assert.equal(new Set(codes).size,total,`${route} AC uniqueness`);
    assert.deepEqual(codes.filter(code=>!handbook[code]),[],`${route} handbook wording gaps`);
  }
});

test('6570 mapping is holistic without losing any official AC',()=>{
  assert.match(loader,/TRANSFERABLE_UNITS=new Set\(\[102,300,303,502\]\)/);
  assert.match(loader,/item\.o\.themes\.includes\(theme\)/);
  assert.match(loader,/item\.o\.codes\.push\(code\)/);
  assert.match(loader,/Fail-safe: every official AC must remain reachable/);
  assert.match(migration,/MAPPING_REVISION=3/);
  assert.match(migration,/s\.assignments<expected\.acs/);
  assert.doesNotMatch(migration,/s\.duplicates\)errors\.push/);
});

test('RPL contributes to AC and unit coverage and shows purple o markers',()=>{
  assert.match(nvq,/RPL_KEY="evia-rpl-ksbs-v1"/);
  assert.match(nvq,/function coveredSet\(\)/);
  assert.match(nvq,/out=rplSet\(\)/);
  assert.match(nvq,/rplCount/);
  assert.match(nvq,/evia-nvq-rpl-mark/);
  assert.match(nvq,/Evidence and RPL both count towards unit AC coverage/);
  assert.match(rplUnit,/const VERSION=89/);
  assert.match(rplUnit,/evia-nvq-rpl-mark/);
  assert.match(rplUnit,/qualification handbook wording/);
});

test('v89 release and offline shell are wired consistently',()=>{
  assert.match(index,/evia-app-version" content="89"/);
  assert.match(index,/evia-trowel-handbook-v89\.js\?v=89/);
  assert.match(index,/evia-trowel-loader\.js\?v=89/);
  assert.match(index,/evia-nvq\.js\?v=89/);
  assert.match(sw,/evia-shell-v89/);
  assert.equal(sw,publicSw);
});
