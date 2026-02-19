import { useState, useEffect } from 'react';
import { consoleLogService, LogEntry } from '../services/ConsoleLogService';

/**
 * Hook to monitor system logs
 */
export const useConsoleMonitor = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        // Subscribe to updates
        const handler = (entry: LogEntry) => {
            setLogs(prev => [entry, ...prev].slice(0, 200));
        };

        // Initial load (using slice to match max buffer)
        setLogs(consoleLogService.getLogs().slice(0, 200));

        consoleLogService.on('log', handler);

        return () => {
            consoleLogService.off('log', handler);
        };
    }, []);

    return logs;
};
