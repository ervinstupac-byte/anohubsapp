import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Učitavamo .env varijable iz trenutnog direktorija
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // BITNO: Za custom domenu (anohubs.com) ovo MORA biti '/'
        // Da je običan github page bez domene, bilo bi '/anohubsapp/'
        base: '/', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },

        plugins: [react()],

        define: {
            // Sigurno prosljeđivanje API ključa
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },

        resolve: {
            alias: {
                // Ovo omogućuje da pišeš import { Hub } from '@/components/Hub'
                '@': path.resolve(__dirname, './src'),
            }
        },

        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: false,
            // Čisti output folder prije svakog builda da nema starih fileova
            emptyOutDir: true, 
        }
    };
});