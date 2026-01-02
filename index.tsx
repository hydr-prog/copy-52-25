import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// تسجيل الـ Service Worker بشكل يضمن التحكم المباشر
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW Registered successfully:', registration.scope);
        
        // التحقق من وجود تحديثات وتفعيلها فوراً
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // إذا وجد تحديث، نقوم بتنبيه التطبيق أو إعادة التحميل
                window.location.reload();
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('SW Registration failed:', error);
      });
  });

  // التأكد من تفعيل الكنترولر فوراً
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload();
      refreshing = true;
    }
  });
}