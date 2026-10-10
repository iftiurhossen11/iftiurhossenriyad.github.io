const CACHE_NAME = 'riyad-portfolio-v35';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './style.css',
  './script.js',
  './translations.js',
  './data-certifications.js',
  './data-projects.js',
  './data-skills.js',
  './data-achievements.js',
  './data-testimonials.js',
  './data-social.js',
  './data-education.js',
  './data-research.js',
  './data-roadmap.js',
  './data-services.js',
  './data-uses.js',
  './data-resources.js',
  './posts-data.js',
  './resources/cyber-safety-guide.html',
  './rss.xml',
  './uses.html',
  './blog.html',
  './post.html',
  './cover-letter.html',
  './site.webmanifest',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('riyad-portfolio-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          const copy = response.clone();
          await caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    fetch(request).then(async (response) => {
      if (response.ok) {
        const copy = response.clone();
        await caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw new Error(`Offline asset is not cached: ${new URL(request.url).pathname}`);
    })
  );
});
