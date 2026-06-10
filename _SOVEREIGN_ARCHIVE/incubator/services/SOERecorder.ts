/**
 * SOERecorder.ts
 * 
 * Sequence of Events (SOE) Recorder
 * Captures breaker operations and relay statuses with 1ms resolution
 * Critical for post-fault analysis and protection coordination
 */

export interface SOEEvent {
    timestamp: number; // High-resolution timestamp (ms precision)
    microseconds: number; // Additional microsecond precision
    eventType: 'BREAKER' | 'RELAY' | 'PROTECTION' | 'CONTROL';
    assetId: string;
    kksCode: string;
    action: 'OPEN' | 'CLOSE' | 'TRIP' | 'RESET' | 'ALARM';
    status: 'BEFORE' | 'AFTER';
    value: any;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export class SOERecorder {
    private static events: SOEEvent[] = [];
    private static maxEvents: number = 10000; // Keep last 10k events
    private static recording: boolean = true;

    /**
     * Record a high-resolution event
     */
    public static recordEvent(event: Omit<SOEEvent, 'timestamp' | 'microseconds'>): void {
        if (!this.recording) return;

        const now = performance.now(); // High-resolution timestamp
        const timestamp = Date.now();
        const microseconds = Math.floor((now % 1) * 1000); // Extract microseconds

        const soeEvent: SOEEvent = {
            timestamp,
            microseconds,
            ...event
        };

        this.events.push(soeEvent);

        // Maintain size limit
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        // Log critical events
        if (soeEvent.severity === 'CRITICAL') {
            console.log(`[SOE] CRITICAL: ${soeEvent.kksCode} ${soeEvent.action} at ${this.formatTimestamp(soeEvent)}`);
        }
    }

    /**
     * Record breaker operation with before/after status
     */
    public static recordBreakerOperation(
        assetId: string,
        kksCode: string,
        action: 'OPEN' | 'CLOSE',
        beforeStatus: string,
        afterStatus: string
    ): void {
        // Record BEFORE state
        this.recordEvent({
            eventType: 'BREAKER',
            assetId,
            kksCode,
            action,
            status: 'BEFORE',
            value: beforeStatus,
            severity: 'INFO'
        });

        // Small delay to show sequence
        setTimeout(() => {
            // Record AFTER state
            this.recordEvent({
                eventType: 'BREAKER',
                assetId,
                kksCode,
                action,
                status: 'AFTER',
                value: afterStatus,
                severity: action === 'OPEN' ? 'WARNING' : 'INFO'
            });
        }, 1); // 1ms delay
    }

    /**
     * Record protection relay trip
     */
    public static recordRelayTrip(
        assetId: string,
        kksCode: string,
        relayType: string,
        cause: string
    ): void {
        this.recordEvent({
            eventType: 'RELAY',
            assetId,
            kksCode,
            action: 'TRIP',
            status: 'AFTER',
            value: { relayType, cause },
            severity: 'CRITICAL'
        });
    }

    /**
     * Get events within time window
     */
    public static getEvents(
        startTime: number,
        endTime: number,
        filters?: {
            assetId?: string;
            eventType?: SOEEvent['eventType'];
            severity?: SOEEvent['severity'];
        }
    ): SOEEvent[] {
        let filtered = this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);

        if (filters) {
            if (filters.assetId) {
                filtered = filtered.filter(e => e.assetId === filters.assetId);
            }
            if (filters.eventType) {
                filtered = filtered.filter(e => e.eventType === filters.eventType);
            }
            if (filters.severity) {
                filtered = filtered.filter(e => e.severity === filters.severity);
            }
        }

        return filtered.sort((a, b) => {
            if (a.timestamp !== b.timestamp) {
                return a.timestamp - b.timestamp;
            }
            return a.microseconds - b.microseconds;
        });
    }

    /**
     * Get last N events
     */
    public static getRecentEvents(count: number = 100): SOEEvent[] {
        return this.events.slice(-count);
    }

    /**
     * Format timestamp with microsecond precision
     */
    private static formatTimestamp(event: SOEEvent): string {
        const date = new Date(event.timestamp);
        const ms = event.timestamp % 1000;
        const us = event.microseconds;

        return `${date.toISOString().slice(0, -5)}.${ms.toString().padStart(3, '0')}.${us.toString().padStart(3, '0')}Z`;
    }

    /**
     * Export events for forensic analysis
     */
    public static exportForensics(startTime: number, endTime: number): string {
        const events = this.getEvents(startTime, endTime);

        let report = 'SEQUENCE OF EVENTS (SOE) REPORT\n';
        report += '='.repeat(80) + '\n';
        report += `Period: ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}\n`;
        report += `Total Events: ${events.length}\n`;
        report += '='.repeat(80) + '\n\n';

        for (const event of events) {
            report += `${this.formatTimestamp(event)} | `;
            report += `${event.kksCode.padEnd(12)} | `;
            report += `${event.eventType.padEnd(10)} | `;
            report += `${event.action.padEnd(8)} | `;
            report += `${event.severity}\n`;
        }

        return report;
    }

    /**
     * Clear all events
     */
    public static clearEvents(): void {
        this.events = [];
        console.log('[SOE] Event log cleared');
    }

    /**
     * Pause/Resume recording
     */
    public static setRecording(enabled: boolean): void {
        this.recording = enabled;
        console.log(`[SOE] Recording ${enabled ? 'enabled' : 'paused'}`);
    }
}
