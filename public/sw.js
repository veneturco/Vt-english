const CACHE_NAME = "vt-english-core-v1";
const RUNTIME_CACHE = "vt-english-runtime-v1";
const SESSION_CACHE = "vt-english-session-v1";

// Core static assets to precache immediately on install
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install Event: Precache core app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[ServiceWorker] Precache failed:", err);
      })
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, SESSION_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log("[ServiceWorker] Removing old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent offline caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests for standard caching (handle API POST separately)
  if (request.method !== "GET") {
    if (url.pathname.startsWith("/api/chat") || url.pathname.startsWith("/api/tts")) {
      event.respondWith(
        fetch(request.clone()).catch(() => {
          // If offline and request is /api/chat, return smart offline fallback response
          if (url.pathname.startsWith("/api/chat")) {
            return new Response(
              JSON.stringify({
                success: true,
                offline: true,
                data: {
                  teacherCommentary:
                    "Estás en modo sin conexión. Tu sesión activa está guardada en tu dispositivo para continuar practicando sin interrupciones.",
                  targetEnglishPhrase: "Let's continue practicing offline.",
                  phoneticGuide: "lets kənˈtɪn.juː ˈpræk.tɪ.sɪŋ ˌɒfˈlaɪn",
                  nativeLinkingTrick: "Pronuncia 'let's continue' de manera fluida y continua.",
                  tutorSpeech:
                    "You are currently offline, but your active learning session is saved! Keep speaking and practicing your pronunciation.",
                  spanishTranslation:
                    "Actualmente estás sin conexión, ¡pero tu sesión activa está guardada! Sigue hablando y practicando tu pronunciación.",
                  correction: {
                    hasError: false,
                    praise: "¡Excelente práctica sin conexión!",
                  },
                  quickChips: [
                    "I want to review my vocabulary.",
                    "Let's practice the active lesson.",
                    "How is my pronunciation?",
                  ],
                  vocabularyNotes: [],
                  pedagogicalTip:
                    "La memoria muscular vocal se entrena igual de bien practicando sin conexión.",
                },
              }),
              {
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // If TTS fails offline, inform client to use local Web Speech API
          return new Response(
            JSON.stringify({
              error: "Offline mode",
              fallbackToWebSpeech: true,
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            }
          );
        })
      );
    }
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First with Cache fallback
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const indexFallback = await caches.match("/index.html");
          if (indexFallback) return indexFallback;
          return new Response(
            "<!DOCTYPE html><html><body><h1>Modo Offline</h1><p>VT English IA está disponible sin conexión con tu última sesión.</p></body></html>",
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
    );
    return;
  }

  // 2. Google Fonts, Icons & Static CDNs: Cache-First with background revalidation
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".webp")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Application Scripts, CSS & Dynamic Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle custom message from clients (e.g. cache session snapshot)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_ACTIVE_SESSION") {
    caches.open(SESSION_CACHE).then((cache) => {
      const sessionData = event.data.payload;
      const response = new Response(JSON.stringify(sessionData), {
        headers: { "Content-Type": "application/json" },
      });
      cache.put("/offline-active-session.json", response);
    });
  } else if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
