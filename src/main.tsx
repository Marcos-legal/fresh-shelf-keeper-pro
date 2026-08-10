import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Nunca permita que o antigo app-shell PWA controle o preview/desenvolvimento.
// O worker de mensagens (caso seja adicionado no futuro) não deve ser removido aqui.
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
      host === 'lovableproject-dev.com' ||
      host.endsWith('.lovableproject-dev.com') ||
      host === 'beta.lovable.dev' ||
      host.endsWith('.beta.lovable.dev') ||
      new URLSearchParams(window.location.search).get('sw') === 'off'
    );
  } catch {
    return true;
  }
})();

if (isPreviewLike && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      Promise.all(
        registrations
          .filter((registration) => {
            const scriptURL = registration.active?.scriptURL
              ?? registration.waiting?.scriptURL
              ?? registration.installing?.scriptURL
              ?? '';
            return new URL(scriptURL, window.location.origin).pathname === '/sw.js';
          })
          .map((registration) => registration.unregister()),
      ),
    )
    .catch(() => { /* noop */ });
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
