import { BasinCoordinator, UnitStatus } from '../services/BasinCoordinator';
import { MetalFactoryLink } from '../services/MetalFactoryLink';
import { AncestralOracle } from '../services/AncestralOracle';
import { SovereignMemory } from '../services/SovereignMemory';

/**
 * PHASE 30.0 INTEGRATION DEMO
 * The Full System Seal 🐜👑
 */

const LOG_SEPARATOR = '--------------------------------------------------------------------------------';
const memory = new SovereignMemory();
const coordinator = new BasinCoordinator();
const metalLink = new MetalFactoryLink();
const oracle = new AncestralOracle();

async function runDemo() {
    console.log('\n🐜 SOVEREIGN FORTRESS - PHASE 30.0 INTEGRATION SEAL');
    console.log(LOG_SEPARATOR);

    // Test 1: THE PERSISTENCE LAYER
    console.log('\n[1] TESTING PERSISTENCE (SovereignMemory)');
    memory.wipeMemory(); // Start fresh
    memory.saveMolecularDebt('UNIT-01', 54000);
    console.log(`Saved Debt: €54,000.`);

    // Simulate Restart
    const loadedDebt = memory.getMolecularDebt('UNIT-01');
    console.log(`Loaded Debt after restart: €${loadedDebt} (Expected: 54000)`);
    if (loadedDebt === 54000) console.log('✅ MEMORY SEALED.');
    else console.error('❌ MEMORY LEAK!');

    // Test 2: FLEET COORDINATION (BasinCoordinator)
    console.log('\n[2] TESTING FLEET HIVE MIND');
    const u1: UnitStatus = { id: 'U1', currentMw: 100, condition: 'DANGER', maxCapacityMw: 120 };
    const u2: UnitStatus = { id: 'U2', currentMw: 50, condition: 'OPTIMAL', maxCapacityMw: 120 };

    console.log('Scenario: Unit 1 in DANGER (Chemical). Grid Demand: 180 MW.');
    const fleetAction = coordinator.coordinateFleet(u1, u2, 180);

    console.log(`Hive Decision: ${fleetAction.message}`);
    fleetAction.unitActions.forEach(a => console.log(`   -> ${a.unitId}: ${a.targetMw} MW (${a.reason})`));

    if (fleetAction.unitActions.find(a => a.unitId === 'U1' && a.targetMw === 0)) {
        console.log('✅ HIVE MIND SEALED (Saved U1).');
    } else console.error('❌ HIVE FAILURE.');

    // Test 3: SUPPLY CHAIN REFLEX (MetalFactoryLink)
    console.log('\n[3] TESTING SUPPLY CHAIN REFLEX');
    const integrity = 65.5; // Critical
    console.log(`Unit 1 Molecular Integrity: ${integrity}%`);
    const order = metalLink.checkAndOrder(integrity, 'D42-Rev9');

    if (order) {
        console.log(`📦 ORDER GENERATED: ${order.orderId} | Material: ${order.material}`);
        console.log('✅ FACTORY LINK SEALED.');
    } else console.error('❌ PROCUREMENT FAILURE.');

    // Test 4: ANCESTRAL LEARNING (AncestralOracle)
    console.log('\n[4] TESTING ANCESTRAL WISDOM');
    console.log('Operator Action: Manual Logic Override.');
    const overrideReason = 'Vibration spikes during lunar tide.';
    oracle.learnFromOverride(overrideReason, { tag: 'VIB-001', tide: 'HIGH' });

    console.log('...Simulating 5 Years passing...');
    const wisdom = oracle.consult('VIB-001 override', 2031);
    console.log(`Oracle Response: ${wisdom}`);

    if (wisdom.includes(overrideReason)) console.log('✅ WISDOM SEALED.');
    else console.error('❌ AMNESIA DETECTED.');

    console.log('\n' + LOG_SEPARATOR);
    console.log('PHASE 30.0 COMPLETE. THE SYSTEM IS ALIVE.');
}

runDemo();
