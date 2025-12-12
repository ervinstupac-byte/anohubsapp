import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Dodao sam .tsx za svaki slučaj
import './index.css'; // <--- OVO JE NEDOSTAJALO! Tu živi tvoj dizajn.

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);