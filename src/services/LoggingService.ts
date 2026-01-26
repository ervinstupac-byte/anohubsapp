import { supabase } from './supabaseClient.ts';
import idAdapter from '../utils/idAdapter';

export type LogSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type LogEventType = 'STRESS_TEST' | 'CRITICAL_FAILURE' | 'SYSTEM_RESET' | 'PERIODIC_HEALTH' | 'USER_ACTION' | 'MODULE_OPEN';

export interface TelemetryLog {
    assetId: number | null;
    eventType: LogEventType;
    severity: LogSeverity;
    details: any;
}

class LoggingService {
    /**
     * Pushes a telemetry event to the Supabase log table.
     */
    async logEvent(log: TelemetryLog) {
        try {
            const numeric = idAdapter.toNumber(log.assetId);
            const dbAssetId = numeric !== null ? idAdapter.toDb(numeric) : log.assetId;
            const { error } = await supabase
                .from('telemetry_logs')
                .insert({
                    asset_id: dbAssetId,
                    event_type: log.eventType,
                    severity: log.severity,
                    details: log.details
                });

            if (error) throw error;
            console.log(`[LoggingService] Event logged: ${log.eventType}`);
        } catch (err) {
            console.error('[LoggingService] Failed to log event:', err);
        }
    }

    /**
     * Generic action logger
     */
    async logAction(assetId: number | null, actionType: string, details: any) {
        return this.logEvent({
            assetId,
            eventType: 'USER_ACTION',
            severity: 'INFO',
            details: { ...details, action: actionType }
        });
    }

    /**
     * Specialized logger for Incident Simulator events
     */
    async logIncident(assetId: number, type: string, details: any) {
        return this.logEvent({
            assetId,
            eventType: 'CRITICAL_FAILURE',
            severity: 'CRITICAL',
            details: { ...details, incident_type: type }
        });
    }

    /**
     * Logs the clearance of an emergency state
     */
    async logReset(assetId: number) {
        return this.logEvent({
            assetId,
            eventType: 'SYSTEM_RESET',
            severity: 'INFO',
            details: { status: 'NORMALIZED' }
        });
    }
}

export const loggingService = new LoggingService();
