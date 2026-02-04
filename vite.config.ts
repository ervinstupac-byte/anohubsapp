import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        base: '/',
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        },
        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            // ENABLE SOURCEMAPS FOR DEBUGGING
            sourcemap: true,
            emptyOutDir: true,
            chunkSizeWarningLimit: 10000,
            rollupOptions: {
                output: {
                    // NUCLEAR OPTION: REMOVE CUSTOM MANUAL CHUNKS
                    // Let Vite/Rollup invoke their default intelligent splitting algorithm.
                    // Custom chunking was causing the 'createContext' split-brain issue (NC-76.3).
                    manualChunks: undefined
                }
            },
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                },
            },
        },
        esbuild: {
            drop: mode === 'production' ? ['console', 'debugger'] : [],
        },
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: 'src/setupTests.ts',
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            testTimeout: 15000,
            deps: {
                inline: ['decimal.js', 'react-i18next']
            }
        }
    };
});