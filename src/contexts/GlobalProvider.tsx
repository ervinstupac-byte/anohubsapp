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
import { AssetConfigProvider } from './AssetConfigContext.tsx';
import { ProjectStateProvider } from './ProjectStateContext.tsx';
import { AIPredictionProvider } from './AIPredictionContext.tsx';
import { AlarmBridgeProvider } from './AlarmBridgeContext';
import { ToastContainer } from '../components/ui/ToastContainer';
import { ComposeProviders } from '../utils/ComposeProviders';

interface GlobalProviderProps {
  children: React.ReactNode;
}

/**
 * GLOBAL PROVIDER (NC-SOVEREIGN-LOOP)
 * The Hierarchy of Truth: Consolidates all core engineering and system contexts.
 *
 * Provider order is intentional — dependency chain:
 *   Audit → Auth → AssetConfig → Asset → Telemetry
 *   → ProjectState (reads Telemetry + Assets, runs PhysicsEngine)
 *   → AIPrediction (reads ProjectState, generates prescriptions + work orders)
 *   → Maintenance / WorkOrder / Diagnostic (consume AI output)
 *   → Fleet / Voice / Forensics / Commissioning / Document
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const providers = [
    // Layer 0: Infrastructure
    AuditProvider,
    AuthProvider,
    AssetConfigProvider,

    // Layer 1: Data Sources
    AssetProvider,
    TelemetryProvider,

    // Layer 2: The Living Brain — consumes Telemetry + Assets, runs PhysicsEngine
    ProjectStateProvider,

    // Layer 3: Intelligence — consumes ProjectState for predictions
    AIPredictionProvider,

    // Layer 3.5: Alarm Bridge — wires Telemetry thresholds → SovereignAlarmManager → useAlarmStore
    AlarmBridgeProvider,

    // Layer 4: Operations — consume AI output and canonical state
    MaintenanceProvider,
    RiskProvider,
    InventoryProvider,
    WorkOrderProvider,
    DiagnosticProvider,

    // Layer 5: Cross-cutting concerns
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
