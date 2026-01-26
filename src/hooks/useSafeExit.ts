import { useEffect } from 'react';
import { useProtocolHistoryStore } from '../stores/ProtocolHistoryStore';

/**
 * useSafeExit - Guard against closing the tab with unsaved data.
 * 
 * Monitors the ProtocolHistoryStore for 'unsynced' entries.
 * Triggers a browser confirm dialog if the user attempts to close the tab.
 */
export const useSafeExit = () => {
    // Optimization: Use selector to subscribe ONLY to pendingSyncCount changes
    const pendingSyncCount = useProtocolHistoryStore(state => state.pendingSyncCount);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (pendingSyncCount > 0) {
                // Standard browser behavior requires setting returnValue
                const message = 'Unsaved field data detected. Protocols are still syncing to the cloud.';
                event.preventDefault();
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [pendingSyncCount]);
};
