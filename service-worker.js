/* =========================
   SERVICE WORKER
   Cuma nge-cache file aplikasi sendiri (HTML/CSS/JS/icon)
   supaya app bisa dibuka lagi walau internet lambat/putus.
   Data silsilah (Firestore/Auth) TIDAK di-cache di sini -
   itu selalu ambil langsung dari server supaya datanya
   selalu yang terbaru & tidak bentrok antar anggota.
========================= */

const CACHE_NAME = "silsilah-keluarga-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./firebase.js",
  "./store.js",
  "./utils.js",
  "./auth.js",
  "./trees.js",
  "./tree.js",
  "./modal.js",
  "./export.js",
  "./app.js",
  "./theme.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png"
];



/* =========================
   INSTALL: simpan app shell ke cache
========================= */

self.addEventListener("install", (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME).then((cache) => {

      return cache.addAll(APP_SHELL);

    })

  );

  self.skipWaiting();

});



/* =========================
   ACTIVATE: bersihkan cache versi lama
========================= */

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys().then((keys) => {

      return Promise.all(

        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))

      );

    })

  );

  self.clients.claim();

});



/* =========================
   FETCH
   - Request ke domain lain (Firebase, CDN D3/jsPDF/html2canvas)
     dibiarkan lewat jaringan normal, TIDAK di-cache di sini.
   - Request ke file aplikasi sendiri (same-origin): coba
     cache dulu (cepat & bisa offline), lalu tetap update
     cache di belakang layar kalau ada koneksi.
========================= */

self.addEventListener("fetch", (event) => {

  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(

    caches.match(req).then((cached) => {

      const networkFetch =
        fetch(req)
          .then((res) => {

            if (res && res.status === 200) {

              const resClone = res.clone();

              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, resClone);
              });

            }

            return res;

          })
          .catch(() => cached);

      return cached || networkFetch;

    })

  );

});
