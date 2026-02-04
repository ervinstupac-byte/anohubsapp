import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { AuthProvider } from './AuthContext.tsx';
import { QuestionnaireProvider } from './QuestionnaireContext.tsx';
import { HPPDesignProvider } from './HPPDesignContext.tsx';
import { RiskProvider } from './RiskContext.tsx';
import { ToastProvider } from './ToastContext.tsx';
import { AssetProvider } from './AssetContext.tsx';
import { TelemetryProvider } from './TelemetryContext.tsx';
import { AuditProvider } from './AuditContext.tsx';
import { MaintenanceProvider } from './MaintenanceContext.tsx';
import { InventoryProvider } from './InventoryContext.tsx';
import { WorkOrderProvider } from './WorkOrderContext.tsx';
import { DiagnosticProvider } from './DiagnosticContext.tsx';
import { FleetProvider } from './FleetContext.tsx';
import { VoiceAssistantProvider } from './VoiceAssistantContext.tsx';
import { ForensicsProvider } from './ForensicsContext.tsx';
import { CommissioningProvider } from './CommissioningContext.tsx';
import { DocumentProvider } from './DocumentContext.tsx';
import { ProjectProvider } from './ProjectContext.tsx';
import { NotificationProvider } from './NotificationContext.tsx';
import { HydrologyProvider } from './HydrologyContext.tsx';
import { AssetConfigProvider } from './AssetConfigContext.tsx'; // NEW: Static configuration
import { DEFAULT_TECHNICAL_STATE } from '../core/TechnicalSchema.ts';
// NEW: Sync Engine Bridge for incremental migration
import { DataBridge } from '../hooks/useSyncLegacyToNew';
import { DensityProvider } from './DensityContext.tsx';
import { WorkflowProvider } from './WorkflowContext.tsx'; // NEW: Cross-module workflow state

interface GlobalProviderProps {
    children: React.ReactNode;
}

/**
 * GLOBAL PROVIDER (REVISED NC-9.0)
 * The Hierarchy of Truth: Consolidates all core engineering and system contexts.
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    const isMaintenanceLocked = useTelemetryStore(state => state.isMaintenanceLocked);

    return (
        <DensityProvider>
            <ToastProvider>
                <AuditProvider>
                    <NotificationProvider>
                        <AuthProvider>
                            {/* NEW STORES: Zustand stores don't need providers, but AssetConfig does */}
                            <AssetConfigProvider>
                                <ProjectProvider initialState={DEFAULT_TECHNICAL_STATE}>
                                    {/* SYNC ENGINE: Bridges legacy ProjectContext → New Stores */}
                                    <DataBridge />
                                    <HydrologyProvider>
                                        <AssetProvider>
                                            <MaintenanceProvider>
                                                <RiskProvider>
                                                    <TelemetryProvider>
                                                        {/* Global LOTO Banner overlayed across the app */}
                                                        {isMaintenanceLocked && (
                                                            <div className="loto-override-banner" role="status" aria-live="polite">
                                                                <ShieldAlert className="w-5 h-5 mr-3 text-white animate-bounce" />
                                                                <div className="text-sm font-black uppercase tracking-widest">MAINTENANCE LOCK - LOTO ACTIVE - CONTROL INHIBITED</div>
                                                            </div>
                                                        )}
                                                        <QuestionnaireProvider>
                                                            <HPPDesignProvider>
                                                                <InventoryProvider>
                                                                    <WorkOrderProvider>
                                                                        <DiagnosticProvider>
                                                                            <FleetProvider>
                                                                                <VoiceAssistantProvider>
                                                                                    <ForensicsProvider>
                                                                                        <CommissioningProvider>
                                                                                            <DocumentProvider>
                                                                                                <WorkflowProvider>
                                                                                                    {children}
                                                                                                </WorkflowProvider>
                                                                                            </DocumentProvider>
                                                                                        </CommissioningProvider>
                                                                                    </ForensicsProvider>
                                                                                </VoiceAssistantProvider>
                                                                            </FleetProvider>
                                                                        </DiagnosticProvider>
                                                                    </WorkOrderProvider>
                                                                </InventoryProvider>
                                                            </HPPDesignProvider>
                                                        </QuestionnaireProvider>
                                                    </TelemetryProvider>
                                                </RiskProvider>
                                            </MaintenanceProvider>
                                        </AssetProvider>
                                    </HydrologyProvider>
                                </ProjectProvider>
                            </AssetConfigProvider>
                        </AuthProvider>
                    </NotificationProvider>
                </AuditProvider>
            </ToastProvider>
        </DensityProvider>
    );
};
