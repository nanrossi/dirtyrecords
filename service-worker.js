var cacheName = 'cache-name-1'
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
