import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTelemetry } from './TelemetryContext.tsx';
import { useAssetContext } from './AssetContext.tsx';
import { useToast } from '../stores/useAppStore';
import { useAudit } from './AuditContext';
import { useMaintenance } from './MaintenanceContext.tsx';
import {
    aiPredictionService,
    SynergeticRisk,
    RULEstimate,
    IncidentPattern,
    PrescriptiveRecommendation
} from '../services/AIPredictionService.ts';
import idAdapter from '../utils/idAdapter';
import { ProjectStateManager } from '../core/ProjectStateManager';

// NEW: Sensor aggregation types
export interface AggregatedSensorData {
    assetId: number;
    timeWindow: { start: number; end: number };
    vibration: { mean: number; max: number; trend: number };
    temperature: { mean: number; max: number; trend: number };
    efficiency: { mean: number; min: number; trend: number };
    pressure: { mean: number; max: number; trend: number };
    cavitationIntensity: { mean: number; max: number; trend: number };
    sampleCount: number;
}

export interface FailurePrediction {
    assetId: number;
    component: string;
    probability: number;
    confidence: number;
    contributingFactors: string[];
    timestamp: number;
    recommendedAction: string;
}

export interface AutonomousWorkOrder {
    id: string;
    assetId: number;
    assetName: string;
    trigger: 'AI_PREDICTION';
    failureProbability: number;
    component: string;
    reservedParts: string[];
    assignedEngineer?: string;
    status: 'AUTO_GENERATED' | 'ACKNOWLEDGED' | 'IN_PROGRESS';
    createdAt: number;
}

interface AIPredictionContextType {
    synergeticRisks: Record<string, SynergeticRisk>;
    rulEstimates: Record<string, RULEstimate[]>;
    incidentPatterns: IncidentPattern[];
    prescriptions: Map<string, PrescriptiveRecommendation>;
    autonomousOrders: AutonomousWorkOrder[];
    isEvaluating: boolean;
    acknowledgeWorkOrder: (orderId: string) => void;
    executeAction: (assetId: number, action: string, value?: number) => void;
}

const AIPredictionContext = createContext<AIPredictionContextType | undefined>(undefined);

export const AIPredictionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { telemetry } = useTelemetry();
    const { assets } = useAssetContext();
    const { showToast } = useToast();
    const { logAction } = useAudit();
    const maintenanceContext = useMaintenance();
    const { telemetry: telemetryContext } = useTelemetry() as any; // Expose for executeAction

    const [synergeticRisks, setSynergeticRisks] = useState<Record<string, SynergeticRisk>>({});
    const [rulEstimates, setRulEstimates] = useState<Record<string, RULEstimate[]>>({});
    const [incidentPatterns, setIncidentPatterns] = useState<IncidentPattern[]>([]);
    const [prescriptions, setPrescriptions] = useState<Map<string, PrescriptiveRecommendation>>(new Map());
    const [autonomousOrders, setAutonomousOrders] = useState<AutonomousWorkOrder[]>([]);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // AI Evaluation Engine - runs every 10 seconds
    useEffect(() => {
        const evaluateAI = () => {
            setIsEvaluating(true);

            const newSynergeticRisks: Record<string, SynergeticRisk> = {};
            const newRulEstimates: Record<string, RULEstimate[]> = {};
            const newIncidentPatterns: IncidentPattern[] = [];
            const newPrescriptions = new Map<string, PrescriptiveRecommendation>();

            // Process each asset with telemetry data
            Object.entries(telemetry).forEach(([assetId, tData]) => {
                const numericAssetId = idAdapter.toNumber(assetId);
                if (numericAssetId === null) return;

                // 1. SYNERGETIC RISK DETECTION (Spider Logic)
                const synergeticRisk = aiPredictionService.detectSynergeticRisk(numericAssetId, tData);
                newSynergeticRisks[assetId] = synergeticRisk;

                if (synergeticRisk.detected && !synergeticRisks[assetId]?.detected) {
                    // New synergetic risk detected!
                    showToast(`🕷️ SYNERGETIC RISK DETECTED on ${assetId}: ${synergeticRisk.probability}% failure probability!`, 'warning');
                }

                // 2. RUL ESTIMATION
                const asset = assets.find(a => a.id === numericAssetId);
                const operatingHours = maintenanceContext.operatingHours[idAdapter.toStorage(numericAssetId)] || 5000;

                const rulEstimatesForAsset: RULEstimate[] = [
                    aiPredictionService.calculateRUL('bearing', operatingHours, tData),
                    aiPredictionService.calculateRUL('seal', operatingHours, tData),
                    aiPredictionService.calculateRUL('hose', operatingHours, tData),
                    aiPredictionService.calculateRUL('wicket_gate', operatingHours, tData)
                ];
                newRulEstimates[assetId] = rulEstimatesForAsset;

                // 3. INCIDENT PATTERN MATCHING (Incident Ghost)
                const patternMatch = aiPredictionService.matchHistoricalPattern(numericAssetId, tData);
                if (patternMatch) {
                    newIncidentPatterns.push(patternMatch);

                    // Alert on new pattern match
                    const existingMatch = incidentPatterns.find(p => p.matchedIncidentId === patternMatch.matchedIncidentId);
                    if (!existingMatch) {
                        showToast(`👻 INCIDENT GHOST: Pattern match detected - ${patternMatch.pattern}!`, 'error');
                    }
                }

                // 4. PRESCRIPTIVE RECOMMENDATIONS
                // Check critical components
                rulEstimatesForAsset.forEach(rul => {
                    const failureProbability = rul.remainingHours < rul.criticalThreshold
                        ? 100 - (rul.remainingHours / rul.criticalThreshold) * 100
                        : 0;

                        if (failureProbability > 50) {
                        const prescription = aiPredictionService.generatePrescription(
                            rul.componentType,
                            failureProbability
                        );
                        newPrescriptions.set(`${idAdapter.toStorage(numericAssetId)}-${rul.componentType}`, prescription);

                        // 5. AUTONOMOUS WORK ORDER TRIGGER (>=95%)
                        if (failureProbability >= 95) {
                                const existingOrder = autonomousOrders.find(
                                order => order.assetId === numericAssetId && order.component === rul.componentType
                            );

                            if (!existingOrder) {
                                // Create autonomous work order
                                const orderId = `AI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                                // Get required parts (mock implementation)
                                const requiredParts = getRequiredParts(rul.componentType);

                                const newOrder: AutonomousWorkOrder = {
                                    id: orderId,
                                    assetId: numericAssetId,
                                    assetName: asset?.name || String(numericAssetId),
                                    trigger: 'AI_PREDICTION',
                                    failureProbability,
                                    component: rul.componentType,
                                    reservedParts: requiredParts,
                                    status: 'AUTO_GENERATED',
                                    createdAt: Date.now()
                                };

                                setAutonomousOrders(prev => [...prev, newOrder]);

                                showToast(
                                    `🤖 AUTONOMOUS WORK ORDER CREATED: ${rul.componentType} failure at ${failureProbability.toFixed(0)}%!`,
                                    'error'
                                );

                                // Send mobile notification (placeholder for future integration)
                                sendMobileNotification(
                                    orderId, 
                                    numericAssetId, 
                                    rul.componentType, 
                                    failureProbability, 
                                    showToast, 
                                    (action, details, status) => logAction(action, details, status as any)
                                );

                                // Sync with Maintenance Context
                                if (maintenanceContext) {
                                    maintenanceContext.createWorkOrder({
                                        assetId: numericAssetId,
                                        assetName: asset?.name || String(numericAssetId),
                                        trigger: 'AI_PREDICTION',
                                        component: rul.componentType,
                                        description: `AI Predicted Failure (${failureProbability.toFixed(1)}%). Auto-generated work order.`,
                                        priority: failureProbability > 90 ? 'HIGH' : 'MEDIUM',
                                        requiredParts: requiredParts
                                    });
                                }
                            }
                        }
                    }
                });
            });

            setSynergeticRisks(newSynergeticRisks);
            setRulEstimates(newRulEstimates);
            setIncidentPatterns(newIncidentPatterns);
            setPrescriptions(newPrescriptions);
            setIsEvaluating(false);
        };

        // Initial evaluation
        if (Object.keys(telemetry).length > 0) {
            evaluateAI();
        }

        // Set up interval for continuous evaluation
        const intervalId = setInterval(evaluateAI, 10000); // Every 10 seconds

        return () => clearInterval(intervalId);
    }, [telemetry, assets]);

    const acknowledgeWorkOrder = (orderId: string) => {
        setAutonomousOrders(prev =>
            prev.map(order =>
                order.id === orderId
                    ? { ...order, status: 'ACKNOWLEDGED' }
                    : order
            )
        );
        showToast(`Work Order ${orderId} acknowledged`, 'success');
    };

    const executeAction = (assetId: number, action: string, value?: number) => {
        // Execute immediate actions
        switch (action) {
            case 'REDUCE_PRESSURE':
                showToast(`Reducing pressure by ${value}% on ${assetId}...`, 'info');
                // Integrate with TelemetryContext to update setpoint
                if (value) {
                    const newDiameter = 1000 + (value * 10); // Convert percentage to diameter adjustment
                    // Route to canonical ProjectStateManager
                    ProjectStateManager.setState({ penstock: { diameter: newDiameter } } as any);
                }
                break;
            case 'REDUCE_LOAD':
                showToast(`Reducing load by ${value}% on ${assetId}...`, 'info');
                // Reduce load by adjusting wicket gate setpoint
                if (value) {
                    const currentSetpoint = 100; // Would come from canonical state in production
                    const newSetpoint = currentSetpoint - value;
                    ProjectStateManager.setState({ specializedState: { sensors: { wicketGateSetpoint: newSetpoint } } as any });
                }
                break;
            case 'ACTIVATE_HYDROSTATIC_LIFT':
                showToast(`Activating hydrostatic lift on ${assetId}...`, 'success');
                break;
            case 'INCREASE_MONITORING_FREQUENCY':
                showToast(`Monitoring frequency increased for ${assetId}`, 'success');
                break;
            default:
                showToast(`Action ${action} queued for ${assetId}`, 'info');
        }
    };

    return (
        <AIPredictionContext.Provider
            value={{
                synergeticRisks,
                rulEstimates,
                incidentPatterns,
                prescriptions,
                autonomousOrders,
                isEvaluating,
                acknowledgeWorkOrder,
                executeAction
            }}
        >
            {children}
        </AIPredictionContext.Provider>
    );
};

export const useAIPrediction = () => {
    const context = useContext(AIPredictionContext);
    if (!context) {
        throw new Error('useAIPrediction must be used within AIPredictionProvider');
    }
    return context;
};

// Helper function to get required parts for component replacement
function getRequiredParts(componentType: string): string[] {
    const partsMap: Record<string, string[]> = {
        bearing: ['SKF-6312', 'THERMAL-PASTE-HT200', 'SEAL-KIT-SK450'],
        seal: ['SEAL-KIT-SK450', 'GASKET-SET-GS220'],
        hose: ['HYDRAULIC-HOSE-16MM-450BAR', 'HOSE-CLAMP-HC16'],
        wicket_gate: ['WICKET-GATE-BEARING-WGB12', 'SERVO-MOTOR-SM450']
    };
    return partsMap[componentType] || [];
}

/**
 * Placeholder for mobile notification service
 * In production, this would integrate with push notification provider
 */
function sendMobileNotification(
    orderId: string,
    assetId: number,
    component: string,
    failureProbability: number,
    toast?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void,
    auditLog?: (action: string, details: string, status: string) => void
): void {
    const msg = `[Mobile] Work Order ${orderId} | ${component} Risk: ${failureProbability.toFixed(1)}%`;
    console.log(msg);
    
    // Simulate push notification via in-app toast
    if (toast) {
        toast(`📱 PUSH NOTIFICATION SENT: ${msg}`, 'info');
    }

    // Log to audit trail
    if (auditLog) {
        auditLog('MOBILE_ALERT_SENT', msg, 'SUCCESS');
    }
}
