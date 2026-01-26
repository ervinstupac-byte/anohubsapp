import { Sovereign_Executive_Engine } from '../services/Sovereign_Executive_Engine';
import { FinancialImpactEngine } from '../services/FinancialImpactEngine';

try {
    const engine = new Sovereign_Executive_Engine();
    console.log('✅ Sovereign Executive Engine instantiated successfully.');

    const profit = FinancialImpactEngine.calculateNetProfit(100, 100, 100, 50);
    console.log('✅ FinancialImpactEngine calculated profit:', profit);
} catch (e) {
    console.error('❌ Failed:', e);
}
