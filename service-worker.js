const CACHE_NAME = 'riyad-portfolio-v52';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './style.css?v=47',
  './script.js?v=49',
  './translations.js?v=51',
  './data-certifications.js?v=47',
  './data-projects.js?v=49',
  './data-skills.js',
  './data-achievements.js',
  './data-testimonials.js',
  './data-social.js?v=1',
  './data-education.js',
  './data-research.js',
  './data-roadmap.js',
  './data-services.js',
  './data-uses.js?v=42',
  './data-resources.js?v=43',
  './posts-data.js?v=45',
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
