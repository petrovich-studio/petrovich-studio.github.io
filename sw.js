var CACHE_NAME = 'petrovich';
var cache_urls = [
    '/',
    '/js/',
    '/css/',
    '/icons/',
    '/js/jquery-3.5.1.slim.min.js',
    '/js/bootstrap.bundle.min.js',
    '/js/firebase-app.js',
    '/js/firebase-auth.js',
    '/js/firebase-database.js',
    '/css/bootstrap.min.css',
    '/auth.html',
    '/contacts.html',
    '/groups.html',
    '/mail.html',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/icons/user.svg',
    '/sw.js'
];

self.addEventListener('install', function(event) {
    var indexPage = new Request('index.html');
    event.waitUntil(
        fetch(indexPage).then(function(response) {
            return caches.open(CACHE_NAME).then(function(cache) {
                console.log('[PWA Builder] Cached index page during Install' + response.url);
                return cache.addAll(indexPage, response, cache_urls);
            });
        }));
});
self.addEventListener('fetch', function(event) {
    var updateCache = function(request) {
        return caches.open(CACHE_NAME).then(function(cache) {
            return fetch(request).then(function(response) {
                console.log('[PWA Builder] add page to offline' + response.url)
                return cache.addAll(request, response, cache_urls);
            });
        });
    };
    event.waitUntil(updateCache(event.request));
    event.respondWith(
        fetch(event.request).catch(function(error) {
            console.log('[PWA Builder] Network request Failed. Serving content from cache: ' + error);
            return caches.open(CACHE_NAME).then(function(cache) {
                return cache.match(event.request).then(function(matching) {
                    var report = !matching || matching.status == 404 ? Promise.reject('no-match') : matching;
                    return report
                });
            });
        })
    );
});
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
        .match(event.request)
        .then(function(response) {
            return response || fetch(event.request);
        })
        .catch(function() {
            return caches.match('/offline.html');
        }),
    );
});