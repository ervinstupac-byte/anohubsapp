// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // KLJUČNO: Postavljamo base na RELATIVNU putanju ('.')
    return {
        base: './', 
        
        // ... (Ostale konfiguracije)
        
        plugins: [react()],
        // ...
    };
});