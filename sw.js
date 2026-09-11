const VERSION = 'nagham-v3';
const CORE = ['./', './index.html', './master-check.html', './preview-maker.html', './converter.html', './spark.html', './stem-fx.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const external = url.origin !== location.origin;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok && (external || url.origin === location.origin)) caches.open(VERSION).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return external ? (cached || network) : network.then(r => r || cached);
    })
  );
});
