// © 2025 Tobias Schmidt Services LLC. All rights reserved.
const CACHE = 'vidflow-v4';
const ASSETS = ['./', './VidFlow.html', './logo.png', './favicon.png', './manifest.json'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => 
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (url.hostname.includes('youtube') || url.hostname.includes('google') || url.hostname.includes('ytimg')) return;
    if (e.request.method === 'GET') {
        e.respondWith(
            caches.match(e.request).then(cached => {
                const fetched = fetch(e.request).then(res => {
                    if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
                    return res;
                }).catch(() => cached);
                return cached || fetched;
            })
        );
    }
});
