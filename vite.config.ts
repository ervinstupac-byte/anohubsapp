// vite.config.ts

import path from 'path'; // Zadržavamo path ako se koristi u resolve aliasu, kao u tvom originalnom kodu
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Ostavljamo sve definicije iz tvog starog koda, ali mijenjamo base property

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        // KRITIČNO: Postavljamo base na RELATIVNU putanju.
        // To rešava probleme sa putanjama (404 greške) kada se aplikacija hostuje u podfolderu
        // (kao što je slučaj na GitHub Pages).
        base: './', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            // Zadržavamo tvoje varijable okruženja
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                // Zadržavamo tvoj alias ako se koristi
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});