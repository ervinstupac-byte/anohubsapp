import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { AlertJournal } from '../services/AlertJournal';

export function guardedAction(actionName: string, fn: () => void) {
    let isLocked = false;
    try {
        const getState = (useTelemetryStore as any)?.getState;
        const state = typeof getState === 'function' ? getState() : undefined;
        isLocked = !!(state && state.isMaintenanceLocked);
    } catch (e) {
        // If telemetry store isn't available in this environment (tests/isolate), default to unlocked
        isLocked = false;
    }
    if (isLocked) {
        AlertJournal.logEvent('WARNING', `${actionName} suppressed: maintenance lock active`, 'GUARDED_ACTION');
        return false;
    }
    try {
        fn();
        return true;
    } catch (e) {
        AlertJournal.logEvent('CRITICAL', `${actionName} failed: ${String(e)}`, 'GUARDED_ACTION');
        throw e;
    }
}

export default guardedAction;
