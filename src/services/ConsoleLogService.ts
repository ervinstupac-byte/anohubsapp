import { EventEmitter } from '../utils/EventEmitter';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SYSTEM';

export interface LogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    message: string;
    source?: string;
}

export class ConsoleLogService extends EventEmitter {
    private static instance: ConsoleLogService;
    private logs: LogEntry[] = [];
    private maxLogs: number = 200;
    // recent message tracker to suppress rapid duplicate logs
    private recentMessages: Map<string, { last: number; count: number }> = new Map();
    private originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };

    private constructor() {
        super();
    }

    public static getInstance(): ConsoleLogService {
        if (!ConsoleLogService.instance) {
            ConsoleLogService.instance = new ConsoleLogService();
        }
        return ConsoleLogService.instance;
    }

    /**
     * Intercept global console logs
     */
    public intercept() {
        console.log = (...args) => {
            this.addLog('INFO', args);
            this.originalConsole.log.apply(console, args);
        };
        console.warn = (...args) => {
            this.addLog('WARN', args);
            this.originalConsole.warn.apply(console, args);
        };
        console.error = (...args) => {
            this.addLog('ERROR', args);
            this.originalConsole.error.apply(console, args);
        };
        console.debug = (...args) => {
            this.addLog('DEBUG', args);
            this.originalConsole.debug.apply(console, args);
        };
    }

    public system(message: string, source: string = 'SYSTEM') {
        this.addLog('SYSTEM', [message], source);
    }

    private addLog(level: LogLevel, args: any[], source?: string) {
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');

        const now = Date.now();
        const key = `${level}::${message}`;

        // Known noisy patterns which should be throttled more aggressively
        const noisyPatterns = [/SovereignKernel/, /TruthJudge/, /TEST API present\?/i];
        const isNoisy = noisyPatterns.some(rx => rx.test(message));

        // Simple duplicate suppression: if the same message appears repeatedly
        // within a short window, increment a counter and suppress frequent repeats
        const recent = this.recentMessages.get(key);
        const windowMs = isNoisy ? 8000 : 1500;
        const emitEvery = isNoisy ? 32 : 8;
        if (recent && (now - recent.last) < windowMs) {
            // bump counter
            recent.count += 1;
            recent.last = now;
            // Only emit every Nth repeat to avoid flooding
            if (recent.count % emitEvery !== 0) {
                return; // suppress this duplicate
            }
            // Replace message with summary on the emitted entry
            const summaryMsg = `${message} (repeated ${recent.count}x)`;
            this.recentMessages.set(key, { last: now, count: 0 });

            const entry: LogEntry = {
                id: Math.random().toString(36).substring(7),
                timestamp: now,
                level,
                message: summaryMsg,
                source
            };

            this.logs.unshift(entry);
            if (this.logs.length > this.maxLogs) this.logs.pop();
            this.emit('log', entry);
            // Also forward to original console for visibility
            try { this.originalConsole.warn.apply(console, [summaryMsg]); } catch { }
            return;
        }

        // First time seen (or outside suppression window)
        this.recentMessages.set(key, { last: now, count: 0 });

        const entry: LogEntry = {
            id: Math.random().toString(36).substring(7),
            timestamp: now,
            level,
            message,
            source
        };

        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        this.emit('log', entry);
    }

    public getLogs(): LogEntry[] {
        return this.logs;
    }
    
    // Allow external listeners to subscribe
    public on(event: 'log', listener: (entry: LogEntry) => void): this {
        return super.on(event, listener);
    }

    public off(event: 'log', listener: (entry: LogEntry) => void): this {
        return super.off(event, listener);
    }
}

export const consoleLogService = ConsoleLogService.getInstance();
