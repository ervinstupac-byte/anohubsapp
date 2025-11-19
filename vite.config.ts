import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// --- KONFIGURACIJA ---
// Ovo mora odgovarati imenu tvog repozitorija na GitHubu.
// Ako ti je repozitorij https://github.com/korisnik/anohubsapp, onda je ovo točno.
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
            // Dostupno u kodu kao process.env.GEMINI_API_KEY
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },

        resolve: {
            alias: {
                // Omogućuje importiranje s '@' (npr. import X from '@/components/...')
                '@': path.resolve(__dirname, '.'),
            }
        },

        build: {
            // Optimizacija za produkciju
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: false, // Isključujemo mape za manji build
        }
    };
});