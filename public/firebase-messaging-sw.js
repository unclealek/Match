// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: 'AIzaSyC7bef6YnS5XOF_JZFfJSN59njPUm0MZ2M',
  authDomain: 'giftedhands-5f32b.firebaseapp.com',
  projectId: 'giftedhands-5f32b',
  storageBucket: 'giftedhands-5f32b.appspot.com',
  messagingSenderId: '325135436772',
  appId: '1:325135436772:web:e2bb9b7c9d41b6e58d55f1',
  measurementId: 'G-K2LCK38M83'
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  if (!payload.notification) {
    console.warn('[firebase-messaging-sw.js] Received message without notification data');
    return;
  }

  const { title, body } = payload.notification;
  if (!title) {
    console.warn('[firebase-messaging-sw.js] Received notification without title');
    return;
  }

  const notificationOptions = {
    body: body || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data || {},
    tag: payload.data?.tag || 'default',
    // Add vibration pattern
    vibrate: [100, 50, 100],
    // Add notification click behavior
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View'
      }
    ]
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Get the notification data
  const data = event.notification.data;
  const urlToOpen = data?.url || '/';

  // This will open the app and navigate to the specified URL
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If we have a client, focus it and navigate
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no client is found, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
