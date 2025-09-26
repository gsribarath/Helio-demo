// Push notification service worker
// Handles background push notifications and displays them

self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.message || 'New notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'helio-notification',
      requireInteraction: data.type === 'emergency_request' || data.type === 'incoming_call',
      vibrate: data.type === 'incoming_call' ? [200, 100, 200] : [100],
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Helio', options)
    );
  } catch (e) {
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Helio', {
        body: 'You have a new notification',
        icon: '/favicon.ico'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Focus or open the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      // Check if there's already a window/tab open
      for (let client of clients) {
        if (client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      return clients.openWindow('/');
    })
  );
});