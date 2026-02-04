
export interface AlertEvent {
    id: string;
    timestamp: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    source: string;
}

class AlertJournalService {
    private readonly STORAGE_KEY = 'nc19_alert_journal';

    public logEvent(severity: AlertEvent['severity'], message: string, source: string = 'SYSTEM') {
        const event: AlertEvent = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            severity,
            message,
            source
        };
        const history = this.getHistory();
        history.unshift(event); // Add to top
        // Keep last 50 events to prevent quota issues
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    }

    public getHistory(): AlertEvent[] {
        try {
            const raw = sessionStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('Failed to parse Alert Journal', e);
            return [];
        }
    }

    public async logAction(operatorId: string, action: string, systemState: any) {
        const timestamp = new Date().toISOString();
        const payload = JSON.stringify({ operatorId, action, systemState, timestamp });

        // Simulate SHA-256 Hash (Web Crypto API)
        const msgBuffer = new TextEncoder().encode(payload);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const event: AlertEvent = {
            id: crypto.randomUUID(),
            timestamp,
            severity: 'INFO',
            message: `ACTION: ${action} by [${operatorId}] // HASH: ${hashHex.substring(0, 16)}...`,
            source: 'OPERATOR_ACTION'
        };

        const history = this.getHistory();
        history.unshift(event);
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(history.slice(0, 50)));

        console.log(`[AUDIT] Action Signed: ${hashHex}`);
        return hashHex;
    }

    public clear() {
        sessionStorage.removeItem(this.STORAGE_KEY);
    }
}

export const AlertJournal = new AlertJournalService();
