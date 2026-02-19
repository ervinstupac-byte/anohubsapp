import React from 'react';
import { AuthProvider } from './AuthContext.tsx';
import { QuestionnaireProvider } from './QuestionnaireContext.tsx';
import { HPPDesignProvider } from './HPPDesignContext.tsx';
import { RiskProvider } from './RiskContext.tsx';
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
import { NotificationProvider } from './NotificationContext.tsx';
import { AssetConfigProvider } from './AssetConfigContext.tsx'; // NEW: Static configuration
import { WorkflowProvider } from './WorkflowContext.tsx'; // NEW: Cross-module workflow state
import { ToastContainer } from '../components/ui/ToastContainer';
import { ConfirmProvider } from './ConfirmContext';
import { ValidationProvider } from './ValidationContext';
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
        NotificationProvider,
        AuthProvider,
        // NEW STORES: Zustand stores don't need providers, but AssetConfig does
        AssetConfigProvider,
        AssetProvider,
        MaintenanceProvider,
        RiskProvider,
        TelemetryProvider,
        QuestionnaireProvider,
        HPPDesignProvider,
        InventoryProvider,
        WorkOrderProvider,
        DiagnosticProvider,
        FleetProvider,
        VoiceAssistantProvider,
        ForensicsProvider,
        CommissioningProvider,
        DocumentProvider,
        ConfirmProvider,
        ValidationProvider,
        WorkflowProvider,
    ];

    return (
        <ComposeProviders components={providers}>
            <ToastContainer />
            {children}
        </ComposeProviders>
    );
};
