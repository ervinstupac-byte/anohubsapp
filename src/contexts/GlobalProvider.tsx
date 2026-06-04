import React from 'react';
import { AuthProvider } from './AuthContext.tsx';
import { MaintenanceProvider } from './MaintenanceContext.tsx';
import { RiskProvider } from './RiskContext.tsx';
import { DiagnosticProvider } from './DiagnosticContext.tsx';
import { AuditProvider } from './AuditContext.tsx';

import { AssetProvider } from './AssetContext.tsx';
import { TelemetryProvider } from './TelemetryContext.tsx';

import { InventoryProvider } from './InventoryContext.tsx';
import { WorkOrderProvider } from './WorkOrderContext.tsx';

import { FleetProvider } from './FleetContext.tsx';
import { VoiceAssistantProvider } from './VoiceAssistantContext.tsx';
import { ForensicsProvider } from './ForensicsContext.tsx';
import { CommissioningProvider } from './CommissioningContext.tsx';
import { DocumentProvider } from './DocumentContext.tsx';

import { AssetConfigProvider } from './AssetConfigContext.tsx'; // NEW: Static configuration
import { ToastContainer } from '../components/ui/ToastContainer';
import { ComposeProviders } from '../utils/ComposeProviders';

interface GlobalProviderProps {
  children: React.ReactNode;
}

/**
 * GLOBAL PROVIDER (REVISED NC-9.0)
 * The Hierarchy of Truth: Consolidates all core engineering and system contexts.
 * Refactored to use provider composition for better readability and performance.
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  // Order matters: Top-level providers first (Audit, Auth, etc.)
  const providers = [
    AuditProvider,
    AuthProvider,
    // NEW STORES: Zustand stores don't need providers, but AssetConfig does
    AssetConfigProvider,
    AssetProvider,
    TelemetryProvider,
    MaintenanceProvider,
    RiskProvider,
    InventoryProvider,
    WorkOrderProvider,
    DiagnosticProvider,
    FleetProvider,
    VoiceAssistantProvider,
    ForensicsProvider,
    CommissioningProvider,
    DocumentProvider,
  ];

  return (
    <ComposeProviders components={providers}>
      <ToastContainer />
      {children}
    </ComposeProviders>
  );
};
