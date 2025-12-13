import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // Zadržavamo relativnu putanju zbog onog iframe problema
        base: './', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },

        plugins: [react()],

        define: {
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },

        resolve: {
            alias: {
                // --- GLAVNA PROMJENA ---
                // Prije je bilo: path.resolve(__dirname, './src')
                // Sada je točka (.), što znači "ovaj glavni folder gdje se nalazim"
                '@': path.resolve(__dirname, '.'),
            }
        },

        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: false,
            emptyOutDir: true, 
        }
        ,
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: 'src/setupTests.ts',
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        }
    };
});