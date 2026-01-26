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
            sourcemap: false, // Manji bundle, teže za debuggiranje u produkciji (dobro za performance)
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    // Aggressive manualChunks function to isolate heavy deps
                    manualChunks(id: string) {
                        if (!id) return null;

                        // Use cross-platform regex for node_modules path separators
                        const nm = /node_modules[\\/]/.test(id);
                        if (!nm) return null;

                        const mapChunk = (pkgNames: string[]) => {
                            for (const p of pkgNames) {
                                const re = new RegExp(`node_modules[\\/].*${p}`);
                                if (re.test(id)) return true;
                            }
                            return false;
                        };

                        // 3D renderers and common heavy groups kept as stable names
                        if (mapChunk(['three', '@react-three'])) return 'vendor-three';
                        if (mapChunk(['jspdf', 'jspdf-autotable', 'html2canvas'])) return 'vendor-pdf';
                        if (mapChunk(['react', 'react-dom', 'framer-motion', 'lucide-react', '@radix-ui'])) return 'vendor-ui';

                        // Default: split remaining node_modules by package to avoid giant vendor bundle
                        const pkgMatch = id.match(/node_modules[\\/](?:@?[^\\/]+[\\/])?([^\\/]+)/);
                        if (pkgMatch && pkgMatch[1]) {
                            const pkg = pkgMatch[1].replace('@', '').replace('/', '-');
                            return `vendor-${pkg}`;
                        }

                        // Fallback vendor
                        return 'vendor';
                    }
                }
            }
        ,
        // Add visualizer plugin only during build to generate an HTML report
        // It will emit `dist/visualizer-feature-dashboard.html`
        plugins: [
            // preserve existing react plugin set above via config-level merging, but include visualizer as an additive plugin here
            // Use the visualizer in build mode to write a static HTML file with treemap
            {
                name: 'temporary-visualizer-adder',
                apply: 'build',
                config() {
                    return {
                        // Rollup plugin array
                        rollupOptions: {},
                    } as any;
                }
            },
            // Rollup plugin: visualizer
            visualizer({ filename: 'dist/visualizer-feature-dashboard.html', title: 'Bundle Visualizer - feature-dashboard', sourcemap: true, gzipSize: true })
        ],
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