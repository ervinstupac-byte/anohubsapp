import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css'; // Tvoj globalni dizajn (Glassmorphism, Tailwind)
import './i18n/index.ts'; // Inicijalizacija prijevoda

// --- IMPORT PROVIDERS REMOVED (Moved to App.tsx) ---

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// ============================================================================
// FAILSAFE ESCAPE HATCH (NC-76.3 Bootstrap Deadlock Diagnosis)
// ============================================================================
// If loader is still present after 5 seconds, force-remove it and show error
const initialLoader = document.getElementById('initial-loader');
let bootstrapHanging = false;

if (initialLoader) {
  console.log('[main.tsx] ⏱️  Setting 5-second escape hatch for loader...');

  setTimeout(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      console.error('[main.tsx] 🚨 BOOTSTRAP DEADLOCK DETECTED - Loader still present after 5s');
      bootstrapHanging = true;

      // Replace loader content with error diagnostic
      loader.innerHTML = `
        <div style="position: fixed; inset: 0; background: #020617; display: flex; align-items: center; justify-content: center; padding: 40px; z-index: 9999;">
          <div style="max-width: 600px; text-align: center; font-family: 'Inter', monospace;">
            <div style="color: #EF4444; font-size: 16px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 24px;">
              ⚠️ BOOTSTRAP DEADLOCK DETECTED
            </div>
            <div style="color: #94A3B8; font-size: 14px; line-height: 1.8; margin-bottom: 32px; text-align: left; background: #0F172A; padding: 20px; border-radius: 12px; border: 1px solid #1E293B;">
              <div style="color: #22D3EE; font-weight: 600; margin-bottom: 12px;">Diagnostic Information:</div>
              <div>• Time: ${new Date().toLocaleTimeString()}</div>
              <div>• Status: Loading screen timeout after 5 seconds</div>
              <div>• React Mount: ${bootstrapHanging ? 'BLOCKED' : 'UNKNOWN'}</div>
              <div style="margin-top: 12px; color: #F59E0B;">
                <strong>Action Required:</strong> Check browser console (F12) for errors
              </div>
            </div>
            <div style="color: #64748B; font-size: 11px; font-family: monospace;">
              Protocol NC-76.3 | Failsafe Escape Hatch Active
            </div>
          </div>
        </div>
      `;

      console.error('[main.tsx] Error diagnostic displayed to user');
      console.error('[main.tsx] Check BootstrapService.ts logs above for deadlock point');
    } else {
      console.log('[main.tsx] ✅ Loader removed successfully within timeout');
    }
  }, 5000);

  // Remove loader when React successfully mounts
  initialLoader.remove();
  console.log('[main.tsx] ✅ Initial loader removed - React mounting...');
}

const root = ReactDOM.createRoot(rootElement);
console.log('[main.tsx] 🚀 ReactDOM root created - rendering App...');

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('[main.tsx] ✅ App rendered to root');
