const C='evia-pwa-v3';
const F=['./manifest.webmanifest','./evia-approved-features.js','./icons/evia-180.png','./icons/evia-192.png','./icons/evia-512.png'];
const QR_CACHE='evia-feature-lib-v1';
const QR_LIBRARY_URL='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

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

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const cache=await caches.open(C);
    await cache.addAll(F);
    const index=await fetch('./index.html',{cache:'no-store'});
    const prepared=htmlResponse(await index.text(),index);
    await cache.put('./index.html',prepared.clone());
    await cache.put('./',prepared.clone());
    try{
      const qr=await fetch(QR_LIBRARY_URL,{mode:'cors',cache:'no-store'});
      if(qr.ok){
        const qrCache=await caches.open(QR_CACHE);
        await qrCache.put(QR_LIBRARY_URL,qr);
      }
    }catch(error){}
  })());
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==C&&key!==QR_CACHE).map(key=>caches.delete(key)))));
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
    if(new URL(e.request.url).origin===self.location.origin){
      const cache=await caches.open(C);
      cache.put(e.request,response.clone());
    }
    return response;
  })));
});
