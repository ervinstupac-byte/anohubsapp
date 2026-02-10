/**
 * DeploymentConfig.ts
 * 
 * Environment & Security Configuration for Production (Vercel).
 * Centralizes API endpoints, Secrets, and CORS policies.
 */

export const DeploymentConfig = {
    // Environment
    isProduction: import.meta.env.PROD,

    // API Endpoints (Switch based on env)
    apiBaseUrl: import.meta.env.PROD
        ? 'https://api.anohubs-monolit.com/v1'
        : 'http://localhost:3000/api/v1',

    // Edge Function Limits
    edgeTimeoutMs: 25, // < 30ms limit for Vercel Edge

    // Security (CORS & Headers)
    corsOrigin: import.meta.env.PROD
        ? 'https://anohubs-platform.vercel.app'
        : '*',

    // Feature Flags    
    enableOfflineMode: true,
    enableTelemetry: true
};

export const SecurityPolicy = {
    getHeaders: () => ({
        'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://api.anohubs-monolit.com;",
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
    })
};
