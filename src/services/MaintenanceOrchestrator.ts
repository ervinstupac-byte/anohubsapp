/**
 * MaintenanceOrchestrator.ts
 * 
 * Generates comprehensive forensic dossiers and orchestrates maintenance workflows.
 */

import { CausalChain } from './ForensicDiagnosticService';
import { HealingResult } from './SystemRecoveryService';
import { ForensicReportService } from './ForensicReportService';
import { DiagnosticSnapshot } from '../features/telemetry/store/useTelemetryStore';
import { supabase } from './supabaseClient';

export interface ForensicDossier {
    incidentId: string;
    timestamp: number;
    causalChain: CausalChain;
    healingAttempt?: HealingResult;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    maintenanceTicketId?: string;
    dossierPath?: string;
}

export class MaintenanceOrchestrator {

    /**
     * Generate comprehensive forensic dossier for an incident
     */
    public static async generateDossier(
        chain: CausalChain,
        healingResult?: HealingResult
    ): Promise<ForensicDossier> {

        const incidentId = `INC-${Date.now()}`;
        const severity = this.calculateSeverity(chain);

        const dossier: ForensicDossier = {
            incidentId,
            timestamp: Date.now(),
            causalChain: chain,
            healingAttempt: healingResult,
            severity
        };

        // Generate PDF report
        const pdfPath = await this.generatePDFReport(dossier);
        dossier.dossierPath = pdfPath;

        // Auto-create maintenance ticket if severity warrants it
        if (severity === 'HIGH' || severity === 'CRITICAL') {
            const ticketId = await this.createMaintenanceTicket(dossier);
            dossier.maintenanceTicketId = ticketId;
        }

        return dossier;
    }

    /**
     * Calculate incident severity based on root cause and impact
     */
    private static calculateSeverity(chain: CausalChain): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
        const rootValue = chain.rootCause.value;
        const metric = chain.rootCause.metric;

        // Severity rules
        if (metric === 'temperature' && rootValue > 60) return 'CRITICAL';
        if (metric === 'vibration' && rootValue > 4.0) return 'CRITICAL';
        if (metric === 'temperature' && rootValue > 45) return 'HIGH';
        if (metric === 'vibration' && rootValue > 3.0) return 'HIGH';
        if (metric === 'cavitation' && rootValue > 0.9) return 'MEDIUM';

        return 'LOW';
    }

    /**
     * Generate PDF forensic report
     */
    private static async generatePDFReport(dossier: ForensicDossier): Promise<string> {
        try {
            // Convert Dossier to Snapshot for the report generator
            // We map the causal chain data into a diagnostic snapshot structure
            const snapshot: DiagnosticSnapshot = {
                id: dossier.incidentId,
                timestamp: dossier.timestamp,
                triggerType: 'AUTO',
                pathology: `${dossier.causalChain.rootCause.metric.toUpperCase()} ANOMALY`,
                telemetry: {
                    rpm: 0, // Placeholder
                    vibrationX: dossier.causalChain.rootCause.metric === 'vibration' ? dossier.causalChain.rootCause.value : 0,
                    vibrationY: 0,
                    bearingTemp: dossier.causalChain.rootCause.metric === 'temperature' ? dossier.causalChain.rootCause.value : 0
                },
                kineticState: {
                    eccentricity: 0.05, // Assumed nominal
                    phase: 0,
                    rsquared: 1.0,
                    offset: 0
                },
                oracleWisdom: {
                    title: `Severity: ${dossier.severity}`,
                    message: dossier.causalChain.description,
                    action: dossier.maintenanceTicketId ? `Ticket #${dossier.maintenanceTicketId} Created` : 'Monitor Closely'
                }
            };

            const service = new ForensicReportService();
            const blob = service.generateForensicSnapshotReport(snapshot);
            
            // Return Object URL for immediate display/download
            return URL.createObjectURL(blob);
        } catch (err) {
            console.error('[Orchestrator] PDF Generation Failed:', err);
            return `/forensic_reports/fallback_${dossier.incidentId}.pdf`;
        }
    }

    /**
     * Create maintenance ticket in system
     */
    private static async createMaintenanceTicket(dossier: ForensicDossier): Promise<string> {
        const ticketId = `MAINT-${Date.now()}`;

        console.log(`[Orchestrator] 🎫 Creating Maintenance Ticket: ${ticketId}`);
        
        try {
            // NC-25100: Offline-First / Cloud Sync
            // We attempt to push to Supabase, but fallback to local log if needed
            
            // Construct Work Order payload matching DB schema
            const workOrderPayload = {
                // id: ticketId, // Let DB generate ID or use UUID if we want to force it
                asset_id: 1, // Default/Placeholder - in real scenario, extract from CausalChain context
                asset_name: 'Main Turbine', // Extract from context
                component: dossier.causalChain.rootCause.metric.toUpperCase(),
                description: `AUTO-GENERATED: ${dossier.causalChain.description}. Severity: ${dossier.severity}`,
                priority: dossier.severity,
                status: 'PENDING',
                trigger_source: 'AI_PREDICTION',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('work_orders')
                .insert(workOrderPayload)
                .select()
                .single();

            if (error) throw error;
            
            console.log(`[Orchestrator] ✅ Ticket Persisted to Cloud: ${data.id}`);
            return data.id;

        } catch (err) {
            console.warn('[Orchestrator] ⚠️ Cloud Sync Failed, using local ID:', err);
            return ticketId;
        }
    }

    /**
     * Generate daily Sovereign Summary report
     * NC-17.0: Automated reporting for 168-hour sovereign operation
     */
    public static async generateSovereignSummary(): Promise<string> {
        console.log('[Orchestrator] 📊 Generating Daily Sovereign Summary...');

        let stats = {
            total: 0,
            completed: 0,
            critical: 0
        };

        try {
            // Fetch real stats from Supabase
            const { data, error } = await supabase
                .from('work_orders')
                .select('status, priority');
            
            if (data) {
                stats.total = data.length;
                stats.completed = data.filter(r => r.status === 'COMPLETED').length;
                stats.critical = data.filter(r => r.priority === 'CRITICAL').length;
            }
        } catch (e) {
            console.warn('[Orchestrator] Failed to fetch stats, using baseline.');
        }

        // Import ROI service (would be at top in real implementation)
        // const { ROIMonitorService } = await import('./ROIMonitorService');

        // Mock data for demonstration (ROI calculation is complex)
        const dailyROI = {
            totalSaved: 6420,
            preventedMaintenanceCosts: 4200,
            marketOpportunityGains: 2800,
            productionDips: 580,
            autonomousActionsCount: stats.total, // Use real count
            averageHealingEffectiveness: 0.83
        };

        const reportPath = `/sovereign_reports/daily_${new Date().toISOString().split('T')[0]}.pdf`;

        // Mock report content
        const reportContent = {
            date: new Date().toISOString(),
            summary: {
                totalAutonomousActions: dailyROI.autonomousActionsCount,
                averageHealingEffectiveness: dailyROI.averageHealingEffectiveness,
                cumulativeROI: dailyROI.totalSaved,
                breakdown: {
                    preventedFailures: dailyROI.preventedMaintenanceCosts,
                    marketOptimizations: dailyROI.marketOpportunityGains,
                    operationalCosts: dailyROI.productionDips
                }
            },
            systemHealth: stats.critical > 0 ? 'ATTENTION' : 'OPTIMAL',
            operatorVetoRate: 0.08 // 8% of actions vetoed (learning indicator)
        };

        console.log('[Orchestrator] Summary Report:');
        console.log(`  Actions: ${reportContent.summary.totalAutonomousActions}`);
        console.log(`  Avg H_eff: ${(reportContent.summary.averageHealingEffectiveness * 100).toFixed(1)}%`);
        console.log(`  Daily ROI: €${reportContent.summary.cumulativeROI}`);
        console.log(`  Veto Rate: ${(reportContent.operatorVetoRate * 100).toFixed(1)}%`);

        // In real system: Generate actual PDF with charts
        return reportPath;
    }
}
