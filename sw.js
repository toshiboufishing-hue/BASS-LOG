// Bass Log service worker revision: v10.27
const BASS_LOG_SW_REVISION = 'v10.27';
const CACHE_NAME='basslog-v10-16-header-redo-20260827';
const OFFLINE_URL='./index.html';

self.addEventListener('install',event=>{
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('basslog-') && key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request,{cache:'no-store'});
        if(response && response.ok){
          const cache=await caches.open(CACHE_NAME);
          await cache.put(OFFLINE_URL,response.clone());
        }
        return response;
      }catch(err){
        const cached=await caches.match(OFFLINE_URL);
        if(cached) return cached;
        throw err;
      }
    })());
    return;
  }

  if(new URL(request.url).pathname.endsWith('/sw.js')){
    event.respondWith(fetch(request,{cache:'no-store'}));
    return;
  }

  event.respondWith((async()=>{
    try{
      const response=await fetch(request,{cache:'no-store'});
      if(response && response.ok){
        const cache=await caches.open(CACHE_NAME);
        await cache.put(request,response.clone());
      }
      return response;
    }catch(err){
      const cached=await caches.match(request);
      if(cached) return cached;
      throw err;
    }
  })());
});
