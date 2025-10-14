import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Učitavanje varijabli okoline (za API ključ)
    const env = loadEnv(mode, '.', '');

    return {
        // KRITIČNO: Definiranje osnovne putanje za GitHub Pages
        // Mora odgovarati imenu repozitorija
        base: '/anohubsapp/', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        
        // Prosljeđivanje varijabli okoline (API ključ) kodu aplikacije
        define: {
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        
        resolve: {
            alias: {
                // Skraćeni alias za putanje ('@')
                '@': path.resolve(__dirname, 'src'), 
            }
        }
    };
});
```

---

## **Sljedeći Koraci (Obavezno)**

1.  **Zamijenite kod:** Zamijenite stari sadržaj u vašoj `vite.config.ts` datoteci s ovim ispravnim, objedinjenim kodom.
2.  **Ponovite Build:** Pokrenite u terminalu (nakon što se uvjerite da su sve komponente popravljene) komandu:
    ```bash
    npm run build
    
