import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SensorFallbackBanner from './shared/components/ui/SensorFallbackBanner';
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
        <SensorFallbackBanner />
      </React.StrictMode>
    );
    console.log('[main.tsx] ✅✅✅ React Mount Command Sent');
  } catch (err) {
    console.error('[main.tsx] 💥 React Mount Crashed:', err);
    if (window.confirm('React Mount Crashed. Show error?')) {
      alert(String(err));
    }
  }
}
