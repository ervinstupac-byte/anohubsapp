import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Dodao sam .tsx za svaki slučaj
import { AuthProvider } from './contexts/AuthContext.tsx';
import './index.css'; // <--- OVO JE NEDOSTAJALO! Tu živi tvoj dizajn.
import './i18n/index.ts';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);