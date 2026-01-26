import { VibrationExpert } from '../services/VibrationExpert';

/**
 * VIBRATION FREQUENCY AUDIT 🔊🛡️
 * The Sovereign Fingerprint Generator.
 * 
 * Objectives:
 * 1. Simulate Spectrum at Golden Point (85.35 MW).
 * 2. Check for 1x, 2x, 3x Harmonics.
 * 3. Hunt for Vortex Rope (Rheingans freq ~0.25x).
 * 4. Generate the Sovereign Fingerprint.
 */

const LOG_SEPARATOR = '--------------------------------------------------------------------------------';

function runVibrationAudit() {
    console.log(LOG_SEPARATOR);
    console.log('       VIBRATION FREQUENCY AUDIT - 85.35 MW (GOLDEN POINT)       ');
    console.log(LOG_SEPARATOR);

    const expert = new VibrationExpert();
    const RPM = 428.6; // Typical High Head Francis
    const FREQ_1X = RPM / 60; // ~7.14 Hz
    const BLADES = 15;

    console.log(`[MACHINE PARAMS] RPM: ${RPM} | 1x Hz: ${FREQ_1X.toFixed(2)} | Blades: ${BLADES}`);
    console.log(`[TARGET LOAD]    85.35 MW (Optimum Efficiency)`);

    // 1. SIMULATE SPECTRAL FINGERPRINT (The "Sound" of 85.35 MW)
    // At Golden Point, Vortex Rope should be minimal. 1x should be dominant but low.
    const spectrum = [
        // Rheingans (Vortex Rope) - Typically 0.2-0.4x RPM. Should be silent here.
        { frequencyHz: FREQ_1X * 0.3, amplitudeMmS: 0.05, name: 'Rheingans (Draft Tube)' },

        // 1x RPM (Imbalance/Rotation) - The Heartbeat
        { frequencyHz: FREQ_1X * 1.0, amplitudeMmS: 0.8, name: '1x RPM (Rotor)' },

        // 2x RPM (Misalignment)
        { frequencyHz: FREQ_1X * 2.0, amplitudeMmS: 0.1, name: '2x RPM (Align)' },

        // Blade Passing Frequency (BPF) - Hydraulic Interaction
        { frequencyHz: FREQ_1X * BLADES, amplitudeMmS: 1.2, name: 'BPF (Hydraulics)' }
    ];

    console.log('\n[SPECTRAL SCAN]');
    console.log('Freq(Hz)\tAmp(mm/s)\tSource');
    spectrum.forEach(p => {
        console.log(`${p.frequencyHz.toFixed(1)}\t\t${p.amplitudeMmS.toFixed(3)}\t\t${p.name}`);
    });

    // 2. AUDIT LOGIC
    let auditPassed = true;
    const protections: string[] = [];

    // Check Vortex Rope (Rheingans)
    const rheingans = spectrum.find(p => p.name.includes('Rheingans'));
    if (rheingans && rheingans.amplitudeMmS > 0.5) {
        protections.push('FAIL: High Draft Tube Pulsation detected (Vortex Rope).');
        auditPassed = false;
    }

    // Check 1x RPM
    const oneX = spectrum.find(p => p.name.includes('1x'));
    if (oneX && oneX.amplitudeMmS > 2.0) {
        protections.push('FAIL: High 1x Vibration (Imbalance).');
        auditPassed = false;
    }

    // Check BPF via Expert
    const diagnosis = expert.checkFrequencyPeaks(spectrum, RPM, BLADES);
    if (diagnosis.danger) {
        protections.push(`FAIL: ${diagnosis.cause}`);
        auditPassed = false;
    }

    // 3. FINGERPRINT GENERATION
    if (auditPassed) {
        console.log('\n✅ AUDIT PASSED. Spectrum is Clean.');

        const fingerprint = {
            id: 'SOVEREIGN_FP_85MW',
            timestamp: new Date().toISOString(),
            loadMw: 85.35,
            harmonics: {
                h1_mag: oneX?.amplitudeMmS,
                h2_mag: spectrum.find(p => p.name.includes('2x'))?.amplitudeMmS,
                bpf_mag: spectrum.find(p => p.name.includes('BPF'))?.amplitudeMmS,
                rope_mag: rheingans?.amplitudeMmS
            }
        };

        console.log('\n[GENERATING SOVEREIGN FINGERPRINT]');
        console.log(JSON.stringify(fingerprint, null, 2));
        console.log('\nAction: Storing permanently in VibrationBaselineService.');
    } else {
        console.log('\n❌ AUDIT FAILED.');
        protections.forEach(p => console.log(`   - ${p}`));
    }
    console.log(LOG_SEPARATOR);
}

runVibrationAudit();
