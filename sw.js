// Service worker: notificaciones push y "Compartir con la app" (Android)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Recibe lo que se comparte desde otra app (fotos, PDF, texto), lo guarda y abre la app
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(event.request.method === 'POST' && url.searchParams.get('compartir') === '1'){
    event.respondWith((async () => {
      try{
        const fd = await event.request.formData();
        const cache = await caches.open('compartidos');
        const viejas = await cache.keys(); await Promise.all(viejas.map(k => cache.delete(k)));
        const archivos = fd.getAll('archivos').filter(f => f && f.size);
        const lista = [];
        for(let i = 0; i < archivos.length; i++){
          const f = archivos[i], key = './compartido/' + i;
          await cache.put(key, new Response(f, { headers: { 'Content-Type': f.type || 'application/octet-stream', 'X-Nombre': encodeURIComponent(f.name || ('archivo' + i)) } }));
          lista.push({ key, nombre: f.name || ('archivo' + i), tipo: f.type || '' });
        }
        const texto = [fd.get('title'), fd.get('text'), fd.get('url')].filter(Boolean).join('\n');
        await cache.put('./compartido/indice', new Response(JSON.stringify({ lista, texto, cuando: Date.now() }), { headers: { 'Content-Type': 'application/json' } }));
      } catch(e){}
      return Response.redirect('./?compartido=1', 303);
    })());
  }
});

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
