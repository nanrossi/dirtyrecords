var cacheName = 'cacheName-1'
var cacheFiles = [
  'index.html',
  'js/index.js',
  'css/materialize.css',
  'css/style.css'
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
    .open(cacheName)
    .then(function (cache) {
      return cache.addAll(cacheFiles)
    })
    .then(function () {
      return self.skipWaiting()
    })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
    .keys()
    .then(function (keyList) {
      console.log(keyList)
      return Promise.all(keyList.map(function (key) {
        console.log(key)
        if (key !== cacheName) return caches.delete(key)
      }))
    })
  )

  return self.clients.claim()
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
    .then(function (response) {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Push do Renan';
  const options = {
    body: event.data.text(),
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };

  const notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(notificationPromise);
})

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://developers.google.com/web/')
  );
});
