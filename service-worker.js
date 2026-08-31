const C='evia-pwa-v4';
const F=['./manifest.webmanifest','./evia-approved-features.js','./icons/evia-180.png','./icons/evia-192.png','./icons/evia-512.png'];
const QR_CACHE='evia-feature-lib-v1';
const QR_LIBRARY_URL='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
const NAXOS_CACHE='evia-naxos-offline-v1';
const NAXOS_BASE='https://ddrnfinch.github.io/Naxos-Mapping_Engine/';
const NAXOS_SEEDS=[
  'course-catalog.json',
  'ksb-manifest.json',
  'manifest-6570-04.json',
  'manifest.json',
  'evidence-rules.json'
].map(path=>new URL(path,NAXOS_BASE).href);

function injectFeatures(html){
  if(typeof html!=='string'||html.includes('evia-approved-features.js'))return html;
  const tag='<script src="./evia-approved-features.js"></script>';
  return html.includes('</body>')?html.replace('</body>',`${tag}</body>`):`${html}${tag}`;
}

function htmlResponse(text,source){
  const headers=new Headers(source.headers);
  headers.set('content-type','text/html; charset=utf-8');
  headers.delete('content-length');
  headers.delete('content-encoding');
  return new Response(injectFeatures(text),{status:source.status,statusText:source.statusText,headers});
}

function collectNaxosJsonReferences(value,baseUrl,out=new Set()){
  if(typeof value==='string'){
    const text=value.trim();
    if(!/\.json(?:[?#].*)?$/i.test(text)) return out;
    try{
      const url=new URL(text,baseUrl);
      const naxos=new URL(NAXOS_BASE);
      if(url.origin===naxos.origin&&url.pathname.startsWith(naxos.pathname)) out.add(url.href);
    }catch{}
    return out;
  }
  if(Array.isArray(value)){
    value.forEach(item=>collectNaxosJsonReferences(item,baseUrl,out));
    return out;
  }
  if(value&&typeof value==='object') Object.values(value).forEach(item=>collectNaxosJsonReferences(item,baseUrl,out));
  return out;
}

async function cacheNaxosCourseGraph(){
  const cache=await caches.open(NAXOS_CACHE);
  const queue=[...NAXOS_SEEDS];
  const seen=new Set();
  while(queue.length){
    const href=queue.shift();
    if(seen.has(href)) continue;
    seen.add(href);
    const response=await fetch(href,{cache:'reload'});
    if(!response.ok) throw new Error(`Could not cache Naxos course data: ${href}`);
    await cache.put(href,response.clone());
    let data=null;
    try{data=await response.json()}catch{}
    if(!data) continue;
    for(const next of collectNaxosJsonReferences(data,href)) if(!seen.has(next)) queue.push(next);
  }
}

async function cacheQrLibrary(){
  const response=await fetch(QR_LIBRARY_URL,{mode:'cors',cache:'reload'});
  if(!response.ok) throw new Error('Could not cache the offline QR library.');
  const qrCache=await caches.open(QR_CACHE);
  await qrCache.put(QR_LIBRARY_URL,response);
}

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const cache=await caches.open(C);
    await cache.addAll(F);
    const index=await fetch('./index.html',{cache:'no-store'});
    if(!index.ok) throw new Error('Could not cache Evia.');
    const prepared=htmlResponse(await index.text(),index);
    await cache.put('./index.html',prepared.clone());
    await cache.put('./',prepared.clone());
    await cacheQrLibrary();
    await cacheNaxosCourseGraph();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==C&&key!==QR_CACHE&&key!==NAXOS_CACHE).map(key=>caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith((async()=>{
      try{
        const network=await fetch(e.request);
        const prepared=htmlResponse(await network.text(),network);
        const cache=await caches.open(C);
        await cache.put('./index.html',prepared.clone());
        await cache.put('./',prepared.clone());
        return prepared;
      }catch(error){
        return (await caches.match('./index.html'))||(await caches.match('./'));
      }
    })());
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(async response=>{
    if(new URL(e.request.url).origin===self.location.origin&&response&&response.ok){
      const cache=await caches.open(C);
      await cache.put(e.request,response.clone());
    }
    return response;
  })));
});