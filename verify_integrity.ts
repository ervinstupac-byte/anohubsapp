
import fs from 'fs';
import path from 'path';

// Paths
const LOCALE_PATH = './src/i18n/locales/en.json';
const VALIDATION_PATH = './src/services/EngineeringValidation.ts';
const TERMINAL_PATH = './src/components/dashboard/CommanderTerminal.tsx';
const PATHS_PATH = './src/routes/paths.ts';
const ROUTER_PATH = './src/routes/FrancisRouter.tsx';

function verify() {
    console.log("Starting System Integrity Verification...");
    let errors = 0;

    // 1. Verify i18n Keys
    if (fs.existsSync(LOCALE_PATH)) {
        const json = JSON.parse(fs.readFileSync(LOCALE_PATH, 'utf-8'));
        const hasValidation = !!json.validation?.fields?.alignment;
        const hasInference = !!json.expert_inference?.verdicts?.critical_multi;

        if (!hasValidation) { console.error("FAIL: en.json missing validation.fields.alignment"); errors++; }
        else console.log("PASS: en.json has validation keys");

        if (!hasInference) { console.error("FAIL: en.json missing expert_inference.verdicts"); errors++; }
        else console.log("PASS: en.json has expert_inference keys");
    } else {
        console.error("FAIL: en.json not found"); errors++;
    }

    // 2. Verify EngineeringValidation.ts
    const validationContent = fs.readFileSync(VALIDATION_PATH, 'utf-8');
    if (validationContent.includes("i18n.t('validation.fields.alignment')")) {
        console.log("PASS: EngineeringValidation.ts uses i18n for alignment");
    } else {
        console.error("FAIL: EngineeringValidation.ts does not use i18n.t for alignment field"); errors++;
    }

    // 3. Verify CommanderTerminal.tsx
    const terminalContent = fs.readFileSync(TERMINAL_PATH, 'utf-8');
    if (terminalContent.includes("pointer-events-none") && terminalContent.includes("pointer-events-auto")) {
        console.log("PASS: CommanderTerminal.tsx has pointer-events classes");
    } else {
        console.error("FAIL: CommanderTerminal.tsx missing pointer properties"); errors++;
    }

    // 4. Verify Paths & Router
    const pathsContent = fs.readFileSync(PATHS_PATH, 'utf-8');
    if (pathsContent.includes("DESIGNER: 'designer'")) {
        console.log("PASS: paths.ts has DESIGNER path");
    } else {
        console.error("FAIL: paths.ts missing DESIGNER path"); errors++;
    }

    const routerContent = fs.readFileSync(ROUTER_PATH, 'utf-8');
    if (routerContent.includes("path={ROUTES.FRANCIS.DESIGNER}") && routerContent.includes("HPPBuilder")) {
        console.log("PASS: FrancisRouter.tsx handles DESIGNER route with HPPBuilder");
    } else {
        console.error("FAIL: FrancisRouter.tsx missing DESIGNER route or HPPBuilder component"); errors++;
    }

    if (errors === 0) {
        console.log("\nVERDICT: SYSTEM INTEGRITY 100%");
    } else {
        console.error(`\nVERDICT: FAILED with ${errors} errors`);
        process.exit(1);
    }
}

try {
    verify();
} catch (e) {
    console.error("Verification crashed:", e);
}
