import { generateArchitectReport } from '../src/services/SovereignArchitectReflector';

const r = generateArchitectReport();
console.log('SUMMARY::', JSON.stringify(r.summary));
console.log('SUBSYSTEMS COUNT::', r.subsystemsCount);
console.log('SUBSYSTEMS SAMPLE::', r.subsystems.slice(0,10));
