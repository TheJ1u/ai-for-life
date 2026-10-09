// Network first; never let cached announcements confirm cancelled meetings.
const CACHE = 'ai-for-life-v2';
self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k.startsWith('ai-for-life-') && k !== CACHE).map(k => caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  if (r.headers.has('range') || u.pathname.endsWith('.mp4') || u.pathname.endsWith('/meetings.json')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(r);
      if (response.ok && response.type !== 'opaque') {
        try { await cache.put(r, response.clone()); } catch (_) { /* Storage failure must not break navigation. */ }
      }
      return response;
    } catch (_) {
      const saved = await cache.match(r);
      if (saved) return saved;
      if (r.mode === 'navigate') return new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Offline | AI For Life</title><h1>This page is not saved offline</h1><p>Reconnect and reload to open it. Meeting changes cannot be confirmed offline.</p><button onclick="location.reload()">Try again</button></html>', {status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
      return new Response('Unavailable offline', {status:503,headers:{'Content-Type':'text/plain'}});
    }
  })());
});
