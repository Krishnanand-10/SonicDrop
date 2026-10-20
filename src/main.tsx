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

// In development mode, cleanly unregister service workers if an active controller exists to prevent stale cache interception
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
} else {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
