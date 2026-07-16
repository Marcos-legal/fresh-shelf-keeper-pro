import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Detecta ambiente de preview do Lovable (iframe / *.lovable.app / dev).
// Nestes ambientes, um Service Worker cacheado pode congelar a pré-visualização.
const isPreviewEnv =
  typeof window !== 'undefined' &&
  (import.meta.env.DEV ||
    /lovable\.(app|dev)$/.test(window.location.hostname) ||
    window.self !== window.top);

if (isPreviewEnv && 'serviceWorker' in navigator) {
  // Desregistra qualquer SW antigo e limpa caches para evitar preview travado.
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
  if (typeof caches !== 'undefined') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
} else {
  registerSW({ immediate: true });
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
