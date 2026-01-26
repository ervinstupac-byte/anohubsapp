import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Visualizer for bundle analysis (temporary - NC-9.4)
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    // Učitavamo env varijable da budu dostupne u configu ako zatrebaju
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // Base URL for serving from root (Vercel production domain)
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
            sourcemap: false,
            emptyOutDir: true,
            chunkSizeWarningLimit: 5000, // Reduced noise for monoliths
            rollupOptions: {
                output: {
                    experimentalMinChunkSize: 50000, // 50KB - Aggressive merging
                    manualChunks(id) {
                        // 1. VENDOR MONOLITHS
                        if (id.includes('node_modules')) {
                            if (id.includes('react') || id.includes('three') || id.includes('@react-three')) {
                                return 'vendor-heavy';
                            }
                            return 'vendor-lib';
                        }
                        // 2. APPLICATION MONOLITH (Prevent 100+ lazy chunks)
                        // Force all src/ code into a single file to survive Windows deployment
                        return 'app-main';
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