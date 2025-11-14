// vite.config.ts

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        // Zadržavamo relativnu base putanju
        base: './', 
        
        plugins: [react()],
        
        // KRITIČNA BLOKADA: Konfiguracija Rollup-a da stavi JS i CSS u ROOT 'dist' foldera.
        build: {
            rollupOptions: {
                output: {
                    // Stavljamo sve fajlove direktno u dist/ folder
                    entryFileNames: `[name].js`,  // npr. index.js
                    chunkFileNames: `[name]-[hash].js`,
                    assetFileNames: `[name].[ext]`, // npr. style.css
                }
            }
        },
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
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