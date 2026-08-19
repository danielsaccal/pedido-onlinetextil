// Service worker minimo: solo se encarga de mostrar las notificaciones push
self.addEventListener('push', event => {
  let data = {};
  try{ data = event.data ? event.data.json() : {}; } catch(e){ data = { title: 'OnLineTextil', body: event.data ? event.data.text() : '' }; }
  const opciones = {
    body: data.body || '',
    icon: '/pedido-onlinetextil/icon-192.png',
    badge: '/pedido-onlinetextil/icon-192.png',
    data: { url: data.url || '/pedido-onlinetextil/' }
  };
  event.waitUntil(self.registration.showNotification(data.title || 'OnLineTextil', opciones));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/pedido-onlinetextil/'));
});
