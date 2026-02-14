import { useEffect, useRef } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useAppStore } from '../stores/useAppStore';
import { useNotifications } from '../contexts/NotificationContext';
import { SentinelKernel } from '../services/SentinelKernel';
import { useTranslation } from 'react-i18next';

/**
 * SentinelWatchdog (Infrastructure Genesis v4.2)
 * Monitors the technical state and bridges SentinelKernel diagnostics to the notification system.
 */
export const useSentinelWatchdog = () => {
    const { mechanical, identity, activeScenario } = useTelemetryStore();
    const { demoMode } = useAppStore();
    const { pushNotification } = useNotifications();
    const { t } = useTranslation();

    // Persistent counters/history for rate calculations
    const lastCheck = useRef<number>(0);
    const alertedRisks = useRef<Set<string>>(new Set());

    useEffect(() => {
        const now = Date.now();
        // Throttling checks to every 5 seconds
        if (now - lastCheck.current < 5000) return;
        lastCheck.current = now;

        const assetId = identity.assetId;

        // 1. Check Standby Grease Risk
        const status = demoMode ? 'STBY' : 'RUNNING';
        const standbyCycles = activeScenario === 'BEARING_HAZARD' ? 25 : 5;
        const greaseRisk = SentinelKernel.checkGreaseRisk(status, standbyCycles);

        if (greaseRisk.risk && !alertedRisks.current.has('grease')) {
            pushNotification(
                greaseRisk.risk === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                'notifications.greaseRisk',
                { message: greaseRisk.message },
                '/maintenance/hydraulic'
            );
            alertedRisks.current.add('grease');
        }

        // 2. Thermal Inertia (Bearing Temperatures)
        // We simulate history since Cerebro is mostly instant for now
        const tempHistory = [mechanical.vibration > 1 ? 75 : 55, mechanical.vibration > 3 ? 82 : 56];
        const thermalAlert = SentinelKernel.checkThermalInertia(tempHistory, [now - 10000, now]);

        if (thermalAlert.risk && !alertedRisks.current.has('thermal')) {
            pushNotification(
                thermalAlert.risk === 'EMERGENCY' ? 'CRITICAL' : 'WARNING',
                'notifications.thermalInertia',
                { rate: thermalAlert.rateOfRise?.toFixed(1) },
                '/forensics'
            );
            alertedRisks.current.add('thermal');
        }

        // 3. Magnetic Unbalance (Excitation vs Temperature)
        const statorTemps = [55, 56, 55, activeScenario === 'BEARING_HAZARD' ? 88 : 56, 55, 55];
        const excitation = 450;
        const magAlert = SentinelKernel.checkMagneticUnbalance(statorTemps, excitation);

        if (magAlert.risk && !alertedRisks.current.has('magnetic')) {
            pushNotification(
                magAlert.risk === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                'notifications.magneticUnbalance',
                { delta: magAlert.deltaT?.toFixed(1) },
                '/francis/diagnostics'
            );
            alertedRisks.current.add('magnetic');
        }

        // Reset alerted risks if everything is normal
        if (!greaseRisk.risk && !thermalAlert.risk && !magAlert.risk) {
            alertedRisks.current.clear();
        }

    }, [mechanical, activeScenario, demoMode, identity]);
};
