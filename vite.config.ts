import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// TAČAN NAZIV VAŠEG REPOZITORIJUMA (VIDLJIVO U ERVINSTUPAC-BYTE.GITHUB.IO/ANOHUBSAPP/)
const repoName = '/anohubsapp/'; 

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        // PROVERITE: Dodajte Base path (koristeći naziv repozitorijuma)
        base: repoName, 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        // ... ostalo nepromenjeno ...
    };
});