import { KaplanEngine } from '../../lib/engines/KaplanEngine';
import { FrancisEngine } from '../../lib/engines/FrancisEngine';
import { PeltonEngine } from '../../lib/engines/PeltonEngine';
import { CrossflowEngine } from '../../lib/engines/CrossflowEngine';

export type VariantId =
  | 'kaplan_vertical'
  | 'kaplan_horizontal'
  | 'kaplan_pit'
  | 'kaplan_bulb'
  | 'kaplan_s'
  | 'kaplan_spiral'
  | 'francis_vertical'
  | 'francis_horizontal'
  | 'francis_slow_runner'
  | 'francis_fast_runner'
  | 'pelton_vertical'
  | 'pelton_horizontal'
  | 'pelton_multi_jet'
  | 'crossflow_standard';

export const VariantLogicRegistry: Record<VariantId, any> = {
  kaplan_vertical: KaplanEngine,
  kaplan_horizontal: KaplanEngine,
  kaplan_pit: KaplanEngine,
  kaplan_bulb: KaplanEngine,
  kaplan_s: KaplanEngine,
  kaplan_spiral: KaplanEngine,
  francis_vertical: FrancisEngine,
  francis_horizontal: FrancisEngine,
  francis_slow_runner: FrancisEngine,
  francis_fast_runner: FrancisEngine,
  pelton_vertical: PeltonEngine,
  pelton_horizontal: PeltonEngine,
  pelton_multi_jet: PeltonEngine,
  crossflow_standard: CrossflowEngine
};
