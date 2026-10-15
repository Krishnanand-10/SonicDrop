import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { transceiver, getGGWaveEngine } from './acoustic/ggwave-engine'

// Expose transceiver on window for DevTools console inspection and viva demo
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).transceiver = transceiver;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).getGGWaveEngine = getGGWaveEngine;
}

// In development mode, unregister old cached service workers so changes appear instantly without hard-refresh
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) caches.delete(name);
      });
    }
  }
} else {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
