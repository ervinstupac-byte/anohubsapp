import React from 'react';
import { FinancialHealthPanel } from '../FinancialHealthPanel';
import { SovereignComponentTree } from '../SovereignComponentTree';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultSize: { w: number; h: number };
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  category: 'monitoring' | 'analytics' | 'control' | 'forensics';
}

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  financialHealth: {
    id: 'financialHealth',
    name: 'Financial Health',
    description: 'Real-time financial impact analysis',
    icon: <span>💰</span>,
    defaultSize: { w: 2, h: 2 },
    component: FinancialHealthPanel,
    category: 'analytics'
  },
  componentHealth: {
    id: 'componentHealth',
    name: 'Component Health Tree',
    description: 'Interactive component health monitoring',
    icon: <span>🌳</span>,
    defaultSize: { w: 4, h: 3 },
    component: SovereignComponentTree,
    category: 'monitoring'
  },
  // Add more widgets here as we go!
};
