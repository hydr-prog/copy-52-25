const CACHE_NAME = 'dentro-v10-fixed';

// قائمة شاملة بكل ملف يحتاجه التطبيق للعمل
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  'https://res.cloudinary.com/dvcaqoy2a/image/upload/v1765499260/Dentro-app-logo_fpqnjq.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&family=Noto+Sans+Arabic:wght@100..900&family=Inter:wght@300;400;500;600;700&display=swap',
  // المكتبات من importmap (يجب تخزينها جميعاً ليعمل الكود)
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://esm.sh/react-dom@^19.2.1',
  'https://aistudiocdn.com/recharts@^3.5.0',
  'https://aistudiocdn.com/date-fns@^4.1.0',
  'https://aistudiocdn.com/@supabase/supabase-js@^2.39.0',
  'https://esm.sh/pdf-lib@1.17.1',
  'https://esm.sh/@pdf-lib/fontkit@1.1.1',
  'https://esm.sh/arabic-persian-reshaper@1.0.1',
  'https://esm.sh/@react-pdf/renderer@^4.3.1',
  'https://esm.sh/@google/genai@^1.34.0'
];

// تثبيت الـ Service Worker وتخزين كل شيء فوراً
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Pre-caching all essential assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// تفعيل الكاش الجديد وحذف القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

// معالج الطلبات - الاستراتيجية: الكاش أولاً ثم الشبكة
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // إذا كان الطلب هو فتح الموقع (Navigation)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(cachedResponse => {
        return cachedResponse || fetch(event.request).catch(() => {
          // إذا فشل كل شيء، نرجع النسخة المخزنة من الصفحة الرئيسية
          return caches.match('/');
        });
      })
    );
    return;
  }

  // باقي الملفات (الصور، السكربتات)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => {
        // إذا كنا أوفلاين والملف ليس في الكاش
        console.log('Offline: Resource not in cache', event.request.url);
      });
    })
  );
});