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
// import { AIPredictionProvider } from './AIPredictionContext.tsx'; // REMOVED: AI predictions disabled for authentic data only
import { CommissioningProvider } from './CommissioningContext.tsx';
import { DocumentProvider } from './DocumentContext.tsx';

interface GlobalProviderProps {
    children: React.ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    return (
        <ToastProvider>
            <AuditProvider>
                <DocumentProvider>
                    <AuthProvider>
                        <QuestionnaireProvider>
                            <HPPDesignProvider>
                                <RiskProvider>
                                    <AssetProvider>
                                        <TelemetryProvider>
                                            <MaintenanceProvider>
                                                <InventoryProvider>
                                                    <WorkOrderProvider>
                                                        <DiagnosticProvider>
                                                            {/* AIPredictionProvider removed - AI predictions disabled */}
                                                            <FleetProvider>
                                                                <VoiceAssistantProvider>
                                                                    <ForensicsProvider>
                                                                        <CommissioningProvider>
                                                                            {children}
                                                                        </CommissioningProvider>
                                                                    </ForensicsProvider>
                                                                </VoiceAssistantProvider>
                                                            </FleetProvider>
                                                        </DiagnosticProvider>
                                                    </WorkOrderProvider>
                                                </InventoryProvider>
                                            </MaintenanceProvider>
                                        </TelemetryProvider>
                                    </AssetProvider>
                                </RiskProvider>
                            </HPPDesignProvider>
                        </QuestionnaireProvider>
                    </AuthProvider>
                </DocumentProvider>
            </AuditProvider>
        </ToastProvider>
    );
};
