import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // NC-11940: Shim process.env for legacy compatibility
        define: {
            'process.env': {}
        },
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
            }
        },
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: 'src/setupTests.tsx',
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            testTimeout: 15000
        }
    };
});