import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * verify_env.mjs
 * "Build Cleanliness Check" - Industrial Safety Protocol
 * 
 * Verifies that critical Supabase environment variables are present
 * before allowing a production build to proceed. 
 */

const REQUIRED_VARS = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
];

function verify() {
    console.log("------------------------------------------");
    console.log("BUILD CLEANLINESS CHECK: NC-4.2 PROTOCOL");
    console.log("------------------------------------------");

    const envPath = join(process.cwd(), '.env');
    let envContent = '';

    if (existsSync(envPath)) {
        envContent = readFileSync(envPath, 'utf-8');
    } else {
        console.warn("NOTICE: .env file not found. Assuming CI/CD environment with injected variables.");
    }

    // PRIORITY 0: Check Vercel Installation Phase
    // If Vercel is just installing dependencies (CI=1), we skip validation.
    // The build phase comes later, where vars should be present.
    if (process.env.CI && process.env.VERCEL) {
        console.log("NOTICE: Running in Vercel CI environment. Skipping strict ENV check for install phase.");
        console.log("------------------------------------------\n");
        return;
    }

    const missing = [];

    for (const v of REQUIRED_VARS) {
        // PRIORITY 1: Check System Environment (Vercel/CI)
        let value = process.env[v];

        // PRIORITY 2: Check .env file content (Local Dev)
        if (!value && envContent) {
            const regex = new RegExp(`^${v}\\s*=.*`, 'm');
            const match = envContent.match(regex);
            if (match) {
                value = match[0].split('=')[1]?.trim();
            }
        }

        if (!value || value.startsWith('your_')) {
            missing.push(v);
        }
    }

    if (missing.length > 0) {
        console.error("ENV_MISSING: The following critical variables are missing or invalid:");
        missing.forEach(m => console.error(` - ${m}`));
        console.error("\nBuild aborted to prevent production failure.");
        process.exit(1);
    }

    console.log("SUCCESS: All critical environment variables verified.");
    console.log("------------------------------------------\n");
}

try {
    verify();
} catch (error) {
    console.error("VERIFY_ENV_FAILED: An unexpected error occurred during environment check.");
    console.error(error);
    process.exit(1);
}
