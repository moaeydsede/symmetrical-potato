const CACHE = 'company-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './qr.js',
  './data/company.json',
  './manifest.webmanifest',
  './assets/uploads/logo.svg',
  './admin/',
  './admin/index.html',
  './admin/config.yml'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if(url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(res=>{
      return res || fetch(e.request).then(net=>{
        const copy = net.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
        return net;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
