import React from 'react';
import { useMaintenance } from '../../../contexts/MaintenanceContext';
import { getComponentIdFromRoute } from '../../../data/knowledge/ComponentTaxonomy';
import { AlertCircle, FileText } from 'lucide-react';

interface StatusBadgeProps {
    route: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ route }) => {
    const { workOrders, logs } = useMaintenance();

    // Resolve ID (e.g. 'francis.civil.penstock')
    const id = getComponentIdFromRoute(route);
    if (!id) return null;

    // Keyword matching (same logic as Context Engine)
    const keyword = id.split('.').pop();
    if (!keyword) return null;

    // 1. Active Work Orders
    const activeWOs = workOrders.filter((wo: any) =>
        (wo.component?.toLowerCase().includes(keyword) || wo.description?.toLowerCase().includes(keyword)) &&
        wo.status !== 'COMPLETED'
    );

    // 2. Recent Logs (last 24h? or just recent fails?) 
    // Let's count recent fails or just total logs for now to show activity.
    // Actually, "Issues" implies problems.
    // Let's count Active WOs (Issues) and maybe recent Fails.
    const failedLogs = logs.filter((log: any) =>
        log.taskId?.toLowerCase().includes(keyword) &&
        log.pass === false &&
        new Date(log.timestamp).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    const issueCount = activeWOs.length + failedLogs.length;

    if (issueCount === 0) return null;

    return (
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[9px] font-black text-red-400 uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" />
            <span>{issueCount} ISSUES</span>
        </div>
    );
};
