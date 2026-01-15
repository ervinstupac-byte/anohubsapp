import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, CloudOff, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useSyncWatcher, SyncStatus } from '../../hooks/useSyncWatcher';

/**
 * SyncBadge — Visual indicator for offline sync status
 * 
 * Status Icons:
 * ☁️ (Gray Cloud) — Offline/Pending
 * 🔄 (Spinning) — Syncing
 * ✅ (Green Check) — All synced
 * ⚠️ (Red Triangle) — Sync error
 */

const statusConfig: Record<SyncStatus, {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    animate?: boolean;
}> = {
    IDLE: {
        icon: <Check className="w-4 h-4" />,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30'
    },
    SYNCING: {
        icon: <RefreshCw className="w-4 h-4" />,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        animate: true
    },
    OFFLINE: {
        icon: <CloudOff className="w-4 h-4" />,
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/30'
    },
    ERROR: {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
    }
};

interface SyncBadgeProps {
    className?: string;
    showLabel?: boolean;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({
    className = '',
    showLabel = true
}) => {
    const { t } = useTranslation();
    const { syncStatus, pendingCount, isOnline, triggerSync } = useSyncWatcher();
    const isSyncing = syncStatus === 'SYNCING';

    let config = statusConfig[syncStatus];
    if (syncStatus === 'IDLE' && pendingCount > 0) config = statusConfig['SYNCING'];

    const getLabel = () => {
        if (!isOnline) return t('sidebar.offline', 'Offline');
        if (isSyncing || pendingCount > 0) return t('dashboard.syncStatus.syncing', 'Syncing Data...');
        return t('dashboard.syncStatus.synced');
    };

    return (
        <button
            onClick={triggerSync}
            disabled={!isOnline || isSyncing}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg
                ${config.bgColor} ${config.borderColor} border
                ${config.color}
                transition-all duration-300
                hover:scale-105 disabled:hover:scale-100
                disabled:opacity-60 disabled:cursor-not-allowed
                ${className}
            `}
            title={isOnline ? 'Click to sync' : 'Waiting for network'}
        >
            <span className={config.animate ? 'animate-spin' : ''}>
                {config.icon}
            </span>

            {showLabel && (
                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {getLabel()}
                </span>
            )}

            {pendingCount > 0 && !isSyncing && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black">
                    {pendingCount}
                </span>
            )}
        </button>
    );
};
