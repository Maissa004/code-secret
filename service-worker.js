/* Changer cette version à chaque modification d’un fichier de l’application. */
const APP_VERSION = "0.4.0";
const CACHE_PREFIX = `code-secret:${self.registration.scope}:`;
const CACHE_NAME = CACHE_PREFIX + APP_VERSION;
const APP_FILES = [
  "./index.html", "./style.css", "./engine.js", "./script.js", "./pwa.js",
  "./planet.svg", "./manifest.webmanifest",
  "./icons/planet-192.png", "./icons/planet-512.png", "./icons/planet-180.png"
];
const appURLs = new Set(APP_FILES.map(path => new URL(path, self.registration.scope).href));
const indexURL = new URL("./index.html", self.registration.scope).href;

self.addEventListener("install", event => {
  // L’installation ne réussit que si la version complète a été téléchargée.
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll([...appURLs].map(url => new Request(url, { cache: "reload" })));
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});

function isTestURL(value) {
  if (!value) return false;
  try { return new URL(value).searchParams.get("test") === "1"; }
  catch { return false; }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Les tests enseignants utilisent la version réseau, y compris ses scripts.
  if (isTestURL(request.url) || isTestURL(request.referrer)) {
    event.respondWith(fetch(new Request(request, { cache: "no-store" })));
    return;
  }

  const isAppPage = request.mode === "navigate" &&
    (url.pathname === new URL(self.registration.scope).pathname || url.href.split("?")[0] === indexURL);
  const cacheKey = isAppPage ? indexURL : url.href;
  if (!appURLs.has(cacheKey)) return;
  // Une même version de la page et de ses ressources reste utilisée jusqu’à la mise à jour.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(cacheKey)) || fetch(request);
  })());
});
