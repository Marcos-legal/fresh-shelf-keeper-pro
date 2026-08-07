import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Limpeza de PWA: em preview/iframe/dev, remove qualquer service worker e cache antigo
// que possa servir arquivos obsoletos e travar a pré-visualização.
const isPreviewLike = (() => {
  try {
    const host = window.location.hostname;
    return (
      !import.meta.env.PROD ||
      window.self !== window.top ||
      host.startsWith('id-preview--') ||
      host.startsWith('preview--') ||
      host === 'lovableproject.com' ||
      host.endsWith('.lovableproject.com') ||
      host === 'lovable.app' ||
      host.endsWith('.lovable.app') ||
      new URLSearchParams(window.location.search).has('sw')
    );
  } catch {
    return true;
  }
})();

if (isPreviewLike && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
    .catch(() => { /* noop */ });

  if ('caches' in window) {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => { /* noop */ });
  }
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
