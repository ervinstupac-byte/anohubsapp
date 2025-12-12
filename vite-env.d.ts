/// <reference types="vite/client" />

// --- ENVIRONMENT VARIABLES ---
// Ovo omogućuje TypeScriptu da prepozna tvoj Gemini API ključ
interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    // Ovdje možeš dodati druge varijable ako ih budeš imao
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// --- ASSET DECLARATIONS ---
// Ovo omogućuje importiranje slika kao modula
declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const value: string;
    export default value;
}