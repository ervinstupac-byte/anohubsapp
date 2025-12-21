import { EngineeringError, ITurbineEngine } from './types.ts';
import { KaplanEngine } from './KaplanEngine.ts';
import { FrancisEngine } from './FrancisEngine.ts';
import { PeltonEngine } from './PeltonEngine.ts';
import { CrossflowEngine } from './CrossflowEngine.ts';

export class TurbineFactory {
    static getEngine(turbineType: string): ITurbineEngine {
        const type = turbineType.toLowerCase();

        switch (type) {
            case 'kaplan':
                return new KaplanEngine();
            case 'francis':
                return new FrancisEngine();
            case 'pelton':
                return new PeltonEngine();
            case 'crossflow':
                return new CrossflowEngine();
            default:
                throw new EngineeringError(`Unknown turbine type: ${turbineType}`, turbineType);
        }
    }

    static getAllEngines(): ITurbineEngine[] {
        return [
            new PeltonEngine(),
            new FrancisEngine(),
            new KaplanEngine(),
            new CrossflowEngine()
        ];
    }

    static calculateCoolingDeltaT(inletTemp: number, outletTemp: number): number {
        return Math.abs(outletTemp - inletTemp);
    }

    static readonly COOLING_THRESHOLD_DELTA_T = 15;
}
