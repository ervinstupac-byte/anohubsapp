import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * verify_env.ts
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
    const examplePath = join(process.cwd(), '.env.example');

    if (!existsSync(envPath)) {
        console.error("CRITICAL ERROR: .env file is missing from project root.");
        if (existsSync(examplePath)) {
            console.warn("TIP: Copy .env.example to .env and populate it with your Supabase credentials.");
        }
        process.exit(1);
    }

    const envContent = readFileSync(envPath, 'utf-8');
    const missing = [];

    for (const v of REQUIRED_VARS) {
        // Simple check: is the key present and followed by an equals sign and some value?
        const regex = new RegExp(`^${v}\\s*=.*`, 'm');
        const match = envContent.match(regex);

        if (!match) {
            missing.push(v);
        } else {
            const value = match[0].split('=')[1]?.trim();
            if (!value || value.startsWith('your_')) {
                missing.push(`${v} (Value is empty or placeholder)`);
            }
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
