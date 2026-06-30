const CACHE_NAME = 'peytabam-checklist-v1';
const ASSETS = [
    'manifest-checklist.json',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
    'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // فایل HTML رو همیشه از شبکه بگیر
    if (url.pathname.endsWith('CheckListPersonel.html') || url.pathname.endsWith('/')) {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    let clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // API رو هیچوقت cache نکن
    if (url.hostname.includes('liara.run') || url.hostname.includes('api')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // بقیه: اول cache، بعد شبکه
    event.respondWith(
        caches.match(event.request)
            .then(res => res || fetch(event.request))
    );
});
