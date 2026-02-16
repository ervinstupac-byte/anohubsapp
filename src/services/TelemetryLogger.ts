/**
 * TelemetryLogger.ts
 * 
 * Production Logging & Error Ingestion.
 * Sends critical failures to Sentry/Datadog (Simulated).
 */

import { DeploymentConfig } from '../config/DeploymentConfig';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export class TelemetryLogger {

    public static log(level: LogLevel, message: string, context?: any) {
        if (!DeploymentConfig.enableTelemetry) return;

        const timestamp = new Date().toISOString();
        const payload = { timestamp, level, message, context };

        // Console fallback
        if (level === 'ERROR' || level === 'FATAL') {
            console.error(`[${level}] ${message}`, context);
            this.sendToExternalMonitor(payload);
        } else {
            console.log(`[${level}] ${message}`);
        }
    }

    private static sendToExternalMonitor(payload: any) {
        // Simulated external ingestion (e.g. fetch to Sentry DSN)
        if (DeploymentConfig.isProduction) {
            // fetch('https://sentry.io/api/...', { method: 'POST', body: JSON.stringify(payload) });
            // console.log('Sent to Sentry');
        }
    }
}
