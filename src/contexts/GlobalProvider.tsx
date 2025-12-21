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

interface GlobalProviderProps {
    children: React.ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    return (
        <ToastProvider>
            <AuditProvider>
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
                                                        <FleetProvider>
                                                            <VoiceAssistantProvider>
                                                                <ForensicsProvider>
                                                                    {children}
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
            </AuditProvider>
        </ToastProvider>
    );
};
