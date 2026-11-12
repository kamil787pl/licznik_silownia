// Licznik siłownia – service worker: aplikacja działa bez internetu.
// Strona: najpierw sieć (max 3 s), potem kopia z telefonu. Biblioteki, czcionki, ikony: kopia z telefonu + odświeżanie w tle.
// Zapytania do Supabase nie są przechowywane – dane synchronizuje sama aplikacja.
const V = 'licznik-v2';
const SB_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
const SHELL = ['./', './index.html', './favicon.svg', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png', SB_LIB];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      .then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { mode: u.startsWith('http') ? 'cors' : 'same-origin' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function pageFromCache() {
  return caches.match('./index.html').then(r => r || caches.match('./'));
}

function networkFirstPage(req) {
  return new Promise(resolve => {
    let done = false;
    const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const timer = setTimeout(() => pageFromCache().then(finish), 3000);
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(V).then(c => c.put('./index.html', copy));
        }
        clearTimeout(timer);
        finish(res);
      })
      .catch(() => pageFromCache().then(r => { clearTimeout(timer); finish(r || Response.error()); }));
  });
}

function cacheFirst(req) {
  return caches.match(req).then(hit => {
    const net = fetch(req)
      .then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(V).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => hit);
    return hit || net;
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return;
  const sameOrigin = url.origin === self.location.origin;
  if (req.mode === 'navigate' || (sameOrigin && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')))) {
    e.respondWith(networkFirstPage(req));
    return;
  }
  if (sameOrigin || url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(req));
  }
});
