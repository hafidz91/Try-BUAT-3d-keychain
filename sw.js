const CACHE_NAME = 'bentara-keychain-studio-v2';

// Senarai semua fail dan enjin 3D yang akan disimpan automatik ke dalam tablet pengguna
const CORE_ASSETS = [
    './',
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/STLExporter.js',
    'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js',
    'https://cdn.jsdelivr.net/npm/clipper-lib@6.4.2/clipper.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://raw.githubusercontent.com/google/fonts/main/apache/chewy/Chewy-Regular.ttf'
];

// 1. Pasang & simpan semua pustaka utama serta fon Chewy terus ke memori peranti
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                CORE_ASSETS.map(url => cache.add(url).catch(() => {}))
            );
        })
    );
    self.skipWaiting();
});

// 2. Bersihkan versi cache lama jika ada kemas kini baharu
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. Pintas setiap permintaan: Guna Internet jika ada (sambil kemas kini cache), atau terus ambil dari Cache jika Offline!
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request, { ignoreSearch: true });
            })
    );
});
