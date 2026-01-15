import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Učitavamo env varijable da budu dostupne u configu ako zatrebaju
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // Relativna putanja za siguran build (radi i u podfolderima)
        base: '/',

        server: {
            port: 3000,
            host: '0.0.0.0', // Omogućuje pristup s drugih uređaja na mreži
        },

        plugins: [react()],

        resolve: {
            alias: {
                // --- BEST PRACTICE ---
                // @ mapiramo na ./src folder. 
                // Ovo omogućuje import: import Button from '@/components/Button'
                '@': path.resolve(__dirname, './src'),
            }
        },

        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: false, // Manji bundle, teže za debuggiranje u produkciji (dobro za performance)
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    manualChunks: {
                        pdf: ['jspdf', 'jspdf-autotable'],
                        vendor: ['react', 'react-dom'],
                        ui: ['framer-motion', 'lucide-react']
                    }
                }
            }
        },

        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: 'src/setupTests.ts',
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            testTimeout: 15000,
            coverage: {
                provider: 'v8',
                reporter: ['text', 'lcov'],
                reportsDirectory: 'coverage',
                all: true,
                threshold: {
                    global: {
                        statements: 60,
                        branches: 15,
                        functions: 45,
                        lines: 60,
                    }
                }
            }
        }
    };
});