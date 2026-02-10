import { TurbineFactory } from './src/lib/engines/TurbineFactory.ts';
import Decimal from 'decimal.js';

const engines = ['francis', 'kaplan', 'pelton'];
const params = {
    francis: { h: 150, q: 30 },
    kaplan: { h: 25, q: 100 },
    pelton: { h: 600, q: 5 }
};

engines.forEach(type => {
    const engine = TurbineFactory.getEngine(type);
    const { h, q } = params[type];
    const eta = engine.calculateEfficiency(h, q);
    const p = engine.calculatePower(h, q, eta);
    console.log(`${type.toUpperCase()}: H=${h}, Q=${q}, Eta=${eta} -> P=${p} MW`);
});
