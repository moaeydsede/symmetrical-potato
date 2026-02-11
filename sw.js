const CACHE='joodkids-v1';
const ASSETS=[
  './','./index.html','./editor.html',
  './styles.css','./app.js','./qr.js','./editor.js',
  './company.json','./manifest.webmanifest','./icon.svg'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return;
  e.respondWith(
    caches.match(e.request).then(res=>res||fetch(e.request).then(net=>{
      const copy=net.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return net;
    }).catch(()=>caches.match('./index.html')))
  );
});
