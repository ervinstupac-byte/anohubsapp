import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// --- KONFIGURACIJA ---
// Postavljeno na /anohubsapp/ jer je to ime GitHub repozitorija
const repoName = '/anohubsapp/'; 

export default defineConfig(({ mode }) => {
    // Učitavamo .env varijable iz trenutnog direktorija
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // Base URL je ključan za GitHub Pages
        base: repoName, 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },

        plugins: [react()],

        define: {
            // Sigurno prosljeđivanje API ključa u aplikaciju
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },

        resolve: {
            alias: {
                // Omogućuje importiranje s '@'
                '@': path.resolve(__dirname, '.'),
            }
        },

        build: {
            // Optimizacija za produkciju
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: false, 
        }
    };
});