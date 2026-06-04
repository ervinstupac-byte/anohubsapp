import { useEffect } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { PeltonEngine } from '../../lib/engines/PeltonEngine';
import mapDiagnosticToUI from '../../lib/engines/diagnosticMapper';
import Decimal from 'decimal.js';
import { useNotificationStore } from '../../stores/useNotificationStore';

export const NotificationTestAPI: React.FC = () => {
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const telemetry = useTelemetryStore.getState();
            const { pushNotification } = useNotificationStore.getState();

            (window as any).__TEST__ = (window as any).__TEST__ || {};
            (window as any).__TEST__.injectPeltonFault = () => {
                const allow = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') || (window as any).__ANOHUBS_TEST_API === true;
                if (!allow) {
                    console.warn('[__TEST__] injectPeltonFault blocked: set window.__ANOHUBS_TEST_API = true and reload (or run in non-production).');
                    return null;
                }

                try {
                    const engine = new PeltonEngine();
                    const diag = engine.checkAxialJump(-1.5);

                    telemetry.updateTelemetry({
                        mechanical: { bearingTemp: 120 } as any,
                        diagnosis: {
                            severity: 'CRITICAL',
                            messages: [{ code: diag.code, en: diag.params?.message ?? diag.code, bs: diag.params?.message ?? diag.code }],
                            safetyFactor: new Decimal(0.2)
                        } as any
                    });

                    const ui = mapDiagnosticToUI(diag as any);
                    telemetry.pushAlarm({ id: `TEST-${Date.now()}`, severity: diag.severity as any, message: ui.message });
                    pushNotification('CRITICAL', ui.translationKey || 'notifications.alert', { message: ui.message }, '/alerts');
                    console.log('[__TEST__] injectPeltonFault invoked', ui.message);
                    return ui.message;
                } catch (e) {
                    console.error('injectPeltonFault failed', e);
                    throw e;
                }
            };

            try {
                if ((window as any).__ANOHUBS_TEST_API === true) {
                    setTimeout(() => {
                        try {
                            const r = (window as any).__TEST__.injectPeltonFault();
                            console.log('[__TEST__] auto-invoked injectPeltonFault', r);
                        } catch (e) {
                            console.error('[__TEST__] auto-invoke failed', e);
                        }
                    }, 50);
                }
            } catch (e) { /* swallow */ }
        } catch (e) {
            // swallow in environments where window/process aren't available
        }
    }, []);

    return null;
};
