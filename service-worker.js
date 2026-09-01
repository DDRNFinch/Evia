const C='evia-pwa-v26';
const UPDATE_UI_MARKER='evia-update-ui-ready-v1';
const RELEASE_VERSION='1.0';
const RELEASE_MARKER_URL=new URL('./__evia-visible-release-version__',self.registration.scope).href;
const INTERNAL_RELOAD_MARKER_URL=new URL('./__evia-internal-reload__',self.registration.scope).href;
const F=['./manifest.webmanifest','./evia-release.json','./evia-approved-features.js','./evia-approved-learning-ui.js','./evia-approved-menu-support.js','./evia-approved-epa.js','./evia-approved-targets.js','./evia-approved-target-plan-v1.js','./evia-approved-updates-stable-v1.js','./evia-approved-runtime-fixes-v1.js','./evia-ui-polish-v1.js','./evia-ui-polish-visible-v1.js','./evia-approved-settings-stable-v1.js','./evia-approved-support-preview-visual-v1.js','./evia-approved-naxos-evidence-contract-v2.js','./evia-approved-naxos-evidence-existing-v2.js','./evia-approved-speech-landing-fix.js','./evia-approved-evidence-capture-layout-v1.js','./icons/evia-180.png','./icons/evia-192.png','./icons/evia-512.png'];
const QR_CACHE='evia-feature-lib-v1';
const QR_LIBRARY_URL='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
const NAXOS_CACHE='evia-naxos-offline-v1';
const NAXOS_BASE='https://ddrnfinch.github.io/Naxos-Mapping_Engine/';
const NAXOS_SEEDS=[
  'course-catalog.json',
  'ksb-manifest.json',
  'manifest-6570-04.json',
  'manifest.json',
  'evidence-rules.json',
  'evidence-capture-contract-v2.json'
].map(path=>new URL(path,NAXOS_BASE).href);

function injectFeatures(html){
  if(typeof html!=='string')return html;
  const tags=[];
  if(!html.includes('evia-approved-features.js'))tags.push('<script src="./evia-approved-features.js"></script>');
  if(!html.includes('evia-approved-learning-ui.js'))tags.push('<script src="./evia-approved-learning-ui.js"></script>');
  if(!html.includes('evia-approved-menu-support.js'))tags.push('<script src="./evia-approved-menu-support.js"></script>');
  if(!html.includes('evia-approved-epa.js'))tags.push('<script src="./evia-approved-epa.js"></script>');
  if(!html.includes('evia-approved-targets.js'))tags.push('<script src="./evia-approved-targets.js"></script>');
  if(!html.includes('evia-approved-target-plan-v1.js'))tags.push('<script src="./evia-approved-target-plan-v1.js"></script>');
  if(!html.includes('evia-approved-updates-stable-v1.js'))tags.push('<script src="./evia-approved-updates-stable-v1.js"></script>');
  if(!html.includes('evia-approved-runtime-fixes-v1.js'))tags.push('<script src="./evia-approved-runtime-fixes-v1.js"></script>');
  if(!html.includes('evia-ui-polish-v1.js'))tags.push('<script src="./evia-ui-polish-v1.js"></script>');
  if(!html.includes('evia-ui-polish-visible-v1.js'))tags.push('<script src="./evia-ui-polish-visible-v1.js"></script>');
  if(!html.includes('evia-approved-settings-stable-v1.js'))tags.push('<script src="./evia-approved-settings-stable-v1.js"></script>');
  if(!html.includes('evia-approved-support-preview-visual-v1.js'))tags.push('<script src="./evia-approved-support-preview-visual-v1.js"></script>');
  if(!html.includes('evia-approved-naxos-evidence-contract-v2.js'))tags.push('<script src="./evia-approved-naxos-evidence-contract-v2.js"></script>');
  if(!html.includes('evia-approved-naxos-evidence-existing-v2.js'))tags.push('<script src="./evia-approved-naxos-evidence-existing-v2.js"></script>');
  if(!html.includes('evia-approved-speech-landing-fix.js'))tags.push('<script src="./evia-approved-speech-landing-fix.js"></script>');
  if(!html.includes('evia-approved-evidence-capture-layout-v1.js'))tags.push('<script src="./evia-approved-evidence-capture-layout-v1.js"></script>');
  if(!tags.length)return html;
  const tag=tags.join('');
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
    const marker=await caches.open(UPDATE_UI_MARKER);
    const installedRelease=await marker.match(RELEASE_MARKER_URL);
    const installedVersion=installedRelease?await installedRelease.text():'';
    const cache=await caches.open(C);
    await cache.addAll(F);
    const index=await fetch('./index.html',{cache:'no-store'});
    if(!index.ok) throw new Error('Could not cache Evia.');
    const prepared=htmlResponse(await index.text(),index);
    await cache.put('./index.html',prepared.clone());
    await cache.put('./',prepared.clone());
    await cacheQrLibrary();
    await cacheNaxosCourseGraph();
    if(installedVersion===RELEASE_VERSION)await marker.put(INTERNAL_RELOAD_MARKER_URL,new Response('1',{headers:{'content-type':'text/plain'}}));
    if(!installedVersion||installedVersion===RELEASE_VERSION) await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==C&&key!==QR_CACHE&&key!==NAXOS_CACHE&&key!==UPDATE_UI_MARKER).map(key=>caches.delete(key)));
    const marker=await caches.open(UPDATE_UI_MARKER);
    const internalReload=await marker.match(INTERNAL_RELOAD_MARKER_URL);
    await marker.put(RELEASE_MARKER_URL,new Response(RELEASE_VERSION,{headers:{'content-type':'text/plain'}}));
    await self.clients.claim();
    if(internalReload){
      await marker.delete(INTERNAL_RELOAD_MARKER_URL);
      const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
      await Promise.all(windows.map(client=>client.navigate(client.url).catch(()=>null)));
    }
  })());
});

self.addEventListener('message',e=>{
  if(e.data?.type==='EVIA_INSTALL_UPDATE') e.waitUntil(self.skipWaiting());
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
