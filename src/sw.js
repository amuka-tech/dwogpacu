import { precacheAndRoute } from 'workbox-precaching';

// This is required for Vite PWA to inject the precache manifest
precacheAndRoute(self.__WB_MANIFEST);

// Handle Push Events
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: 'https://amuka-tech.github.io/dwogpacu/web-app-manifest-192x192.png',
      badge: 'https://amuka-tech.github.io/dwogpacu/web-app-manifest-192x192.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      // NOTE: requireInteraction is intentionally removed — it is NOT supported on
      // Android and causes push notifications to fail silently on mobile browsers.
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/dwogpacu/'
      },
      actions: [
        { action: 'explore', title: 'View Match' },
        { action: 'close', title: 'Close' }
      ]
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle Notification Clicks
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action !== 'close') {
    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If so, just focus it.
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, then open the target URL in a new window/tab.
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
