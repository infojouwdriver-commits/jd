self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name.startsWith('jouw-driver-')).map(name => caches.delete(name)));
  await self.clients.claim();
})()));
// Network-only requests. Offline personal-data persistence is disabled pending an encrypted queue.
