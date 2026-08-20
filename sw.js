/* El Águila — service worker
   Guarda la app para que abra al instante y funcione sin señal.
   Los datos de Firestore NUNCA se guardan aquí: siempre van a la red. */

const VERSION = 'aguila-v1';
const SHELL   = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

// Lo mínimo para que la app abra sin conexión.
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Dominios que siempre deben ir a la red (datos en vivo y sesión).
const ALWAYS_NETWORK = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'firebaselogging',
  'google-analytics.com',
  'googletagmanager.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL)
      // addAll falla entero si un archivo falla; agregamos uno por uno.
      .then(cache => Promise.all(
        SHELL_FILES.map(f => cache.add(f).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== RUNTIME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Permite que la página aplique una actualización sin esperar.
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Solo GET, solo http(s).
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Datos en vivo: que pase directo, sin tocar.
  if (ALWAYS_NETWORK.some(h => url.hostname.includes(h))) return;

  // Navegación: red primero para recibir cambios; si no hay señal, la copia guardada.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(SHELL).then(c => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match('./index.html').then(r => r || caches.match('./'))
        )
    );
    return;
  }

  // Todo lo demás (iconos, SDK de Firebase): usa la copia y la refresca en segundo plano.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(res => {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(RUNTIME).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
