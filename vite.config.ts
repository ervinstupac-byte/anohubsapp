// vite.config.ts

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// KRITIČNO: Apsolutna putanja ka podfolderu (Ime tvog repozitorijuma)
const repoName = '/anohubsapp/'; 

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        // Postavljamo base na APSOLUTNU putanju. Ovo prisiljava Vite da kreira putanje
        // koje sadrže /anohubsapp/ na početku (npr. /anohubsapp/assets/index-XXXX.js).
        base: repoName, 
        
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
                // Zadržavamo tvoj alias
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});