/**
 * PHASE 14 DEMO: THE GIANTS' COMMAND 💂‍♂️🌉
 * 🤝 Master Protocol Bridge (Handshake)
 * 🆔 Giant Tag Mapper (Identity Thief)
 * 🧠 Wisdom Filter (Data Enrichment)
 */

import { MasterProtocolBridge } from '../services/MasterProtocolBridge';
import { GiantTagMapper } from '../services/GiantTagMapper';
import { WisdomFilter } from '../services/WisdomFilter';

const ear = new MasterProtocolBridge();
const thief = new GiantTagMapper();
const brain = new WisdomFilter();

console.log('🏛️ THE GIANTS COMMAND (Phase 14.0) 🏛️');
console.log('=======================================');

// 1. THE HANDSHAKE (Universal Ear)
console.log('\n[1] THE HANDSHAKE 🤝');
const connection = ear.connectToGiant('SIEMENS_PLC_MAIN', 'OPC_UA');

if (connection.status === 'CONNECTED') {

    // 2. THE IDENTITY THEFT (Mapping)
    console.log('\n[2] THE IDENTITY THEFT 🆔');
    // Giant speaks in strange tongues...
    const rawPackets = [
        { tag: 'TE_101_B1', value: 45.5 }, // Bearing Temp
        { tag: 'PIT_202_X', value: 12.0 }, // Pressure
        { tag: 'UNKNOWN_TAG_99', value: 123 }, // Stranger
        { tag: 'PIT_202_X', value: 16.5 }  // Pressure Spike!
    ];

    rawPackets.forEach(packet => {
        const passportId = thief.assimilateTag(packet.tag);
        // If it was renamed, show the theft
        if (passportId !== `RAW_GIANT_${packet.tag}`) {
            console.log(`   Captured [${packet.tag}] -> Renamed to [${passportId}]`);
        } else {
            console.log(`   Unknown Tag [${packet.tag}] -> Kept as Raw`);
        }

        // 3. THE WISDOM FILTER (Enrichment)
        // Now feed the Passport ID to the Brain
        const smartSignal = brain.enrichSignal(passportId, packet.value);

        // Did we add wisdom?
        if (smartSignal.wisdom.length > 0) {
            smartSignal.wisdom.forEach(w => {
                // Highlight WISDOM in the console
                if (w.includes('Stable')) {
                    // Boring wisdom
                } else {
                    console.log(`   🧠 WISDOM ADDED: "${w}"`);
                }
            });
            if (smartSignal.wisdomKpi) {
                console.log(`      (KPI Impact: ${smartSignal.wisdomKpi.toFixed(1)})`);
            }
        }
    });

} else {
    console.log('   (Mock Handshake Failed - Retry would normally happen here)');
}

console.log('\n✅ GIANTS SUBORDINATED. The Fortress Commands the Data.');
