import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Tvoj globalni dizajn (Glassmorphism, Tailwind)
import './i18n/index.ts'; // Inicijalizacija prijevoda

// --- IMPORT PROVIDERS ---
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AssetProvider } from './contexts/AssetContext.tsx';
import { TelemetryProvider } from './contexts/TelemetryContext.tsx'; // <--- NOVI "MOTOR"
import { RiskProvider } from './contexts/RiskContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* 1. AUTH PROVIDER (Najvažniji, provjerava korisnika) */}
    <AuthProvider>
      
      {/* 2. TOAST PROVIDER (Da obavijesti rade svugdje) */}
      <ToastProvider>
        
        {/* 3. ASSET PROVIDER (Učitava turbine iz baze) */}
        <AssetProvider>
          
          {/* 4. TELEMETRY PROVIDER (Generira Live Podatke) */}
          {/* VAŽNO: Mora biti UNUTAR AssetProvidera jer koristi popis imovine */}
          <TelemetryProvider>
            
            {/* 5. LOGIC PROVIDERS (Rizik i Upitnik) */}
            <RiskProvider>
              <QuestionnaireProvider>
                
                {/* 6. GLAVNA APLIKACIJA */}
                <App />
                
              </QuestionnaireProvider>
            </RiskProvider>

          </TelemetryProvider>
          
        </AssetProvider>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);