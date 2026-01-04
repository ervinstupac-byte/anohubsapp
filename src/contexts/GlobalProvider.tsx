import React from 'react';
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
import { DEFAULT_TECHNICAL_STATE } from '../models/TechnicalSchema.ts';

interface GlobalProviderProps {
    children: React.ReactNode;
}

/**
 * GLOBAL PROVIDER (REVISED NC-4.2)
 * The Hierarchy of Truth: Consolidates all core engineering and system contexts.
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    return (
        <ToastProvider>
            <AuditProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <ProjectProvider initialState={DEFAULT_TECHNICAL_STATE}>
                            <HydrologyProvider>
                                <AssetProvider>
                                    <MaintenanceProvider>
                                        <RiskProvider>
                                            <TelemetryProvider>
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
                                                                                        {children}
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
                    </AuthProvider>
                </NotificationProvider>
            </AuditProvider>
        </ToastProvider>
    );
};
