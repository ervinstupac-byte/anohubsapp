import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
