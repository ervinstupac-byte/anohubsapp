import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('[main.tsx] 🚀 BOOT SEQUENCE STARTED');
console.log('[main.tsx] ✅ React Core Imports Loaded');

// ============================================================================
// NC-76.3: SYNCHRONOUS i18n IMPORT (NO TOP-LEVEL AWAIT)
// ============================================================================
console.log('[main.tsx] 🔧 Importing i18n...');
import './i18n/index.ts';
console.log('[main.tsx] ✅ i18n Imported');

// ============================================================================
// MOUNT REACT
// ============================================================================
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[main.tsx] 🚨 FATAL: Root element missing!');
} else {
  // Hide the static loader manually
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.display = 'none';
    console.log('[main.tsx] 👻 Ghost Loader Hidden');
  }

  console.log('[main.tsx] ⚡ Mounting React Root...');
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
      // Quick UI banner for sensor fallback state (listens to events from telemetry store)
      try {
        const showBanner = (msg?: string) => {
          let el = document.getElementById('sensor-fallback-banner');
          if (!el) {
            el = document.createElement('div');
            el.id = 'sensor-fallback-banner';
            el.style.position = 'fixed';
            el.style.top = '8px';
            el.style.right = '8px';
            el.style.zIndex = '9999';
            el.style.padding = '8px 12px';
            el.style.background = 'rgba(220,53,69,0.95)';
            el.style.color = '#fff';
            el.style.borderRadius = '6px';
            el.style.fontWeight = '600';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            document.body.appendChild(el);
          }
          el.textContent = msg || 'Sensor fallback active';
          (el as HTMLElement).style.display = 'block';
        };

        const hideBanner = () => {
          const el = document.getElementById('sensor-fallback-banner');
          if (el) (el as HTMLElement).style.display = 'none';
        };

        window.addEventListener('sensorFallback', (e: any) => {
          const detailMsg = e?.detail?.message || 'Sensor fallback active';
          showBanner(detailMsg);
        });
        window.addEventListener('sensorFallbackCleared', () => hideBanner());

        // If the flag was already set before mount, show banner
        try {
          if ((window as any).__sensorFallbackActive) showBanner();
        } catch (e) { }
      } catch (e) {
        console.warn('[main.tsx] Sensor banner init failed', e);
      }
    console.log('[main.tsx] ✅✅✅ React Mount Command Sent');
  } catch (err) {
    console.error('[main.tsx] 💥 React Mount Crashed:', err);
    if (window.confirm('React Mount Crashed. Show error?')) {
      alert(String(err));
    }
  }
}
