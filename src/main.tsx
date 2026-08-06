import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove service workers antigos que podem servir arquivos em cache e travar a pré-visualização.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      if (registration.active?.scriptURL.includes('/sw.js')) {
        registration.unregister();
      }
    });
  }).catch(() => { /* noop */ });
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
