import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// DEFINIŠITE NAZIV REPOZITORIJUMA OVDE (Sa / na početku i na kraju)
// Proverite da li je 'anohubsapp' tačan naziv repozitorijuma na GitHubu!
const repoName = '/anohubsapp/'; 

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        // KLJUČNA IZMENA: OVO MORATE DODATI!
        base: repoName, 
        // -----------------------------------------------------------------

        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});