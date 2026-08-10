const BALANCE_TAG='<script src="./balance.js?v=9"></script>';
const ENEMY_TAG='<script src="./enemy-visuals.js?v=8"></script>';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.map(key=>caches.delete(key)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window'});
  for(const client of clients){try{await client.navigate(client.url)}catch{}}
})()));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const res=await fetch(req,{cache:'no-store'});
      const type=res.headers.get('content-type')||'';
      if(!type.includes('text/html')) return res;
      let html=await res.text();
      let tags='';
      if(!html.includes('balance.js?v=9')) tags+=BALANCE_TAG;
      if(!html.includes('enemy-visuals.js?v=8')) tags+=ENEMY_TAG;
      if(tags) html=html.replace('</body>',tags+'</body>');
      return new Response(html,{status:res.status,statusText:res.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
    })());
    return;
  }
  event.respondWith(fetch(req,{cache:'no-store'}));
});
