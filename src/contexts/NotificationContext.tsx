import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { PeltonEngine } from '../lib/engines/PeltonEngine';
import mapDiagnosticToUI from '../lib/engines/diagnosticMapper';
import Decimal from 'decimal.js';
import { useTranslation } from 'react-i18next';

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface NotificationItem {
    id: string;
    severity: Severity;
    translationKey: string; // e.g., 'notifications.tempSpike'
    params?: Record<string, any>;
    timestamp: Date;
    read: boolean;
    link?: string; // Link to Expert Advice
}

export interface NotificationSettings {
    allowCritical: boolean;
    allowWarning: boolean;
    allowInfo: boolean;
}

interface NotificationContextType {
    notifications: NotificationItem[];
    settings: NotificationSettings;
    unreadCount: number;
    pushNotification: (severity: Severity, key: string, params?: Record<string, any>, link?: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    updateSettings: (newSettings: Partial<NotificationSettings>) => void;
    simulateCriticalEvent: () => void; // For Demo
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>({
        allowCritical: true,
        allowWarning: true,
        allowInfo: true
    });

    // Sound Effect
    const playAlertSound = () => {
        // In a real app, this would be a real Audio file.
        // Using a mild beep logic or checking if we can play audio.
        // For now, console log is safe, or we can try a BEEP (browser dependent).
        console.log("🔊 PLAYING CRITICAL ALARM SOUND 🔊");
        try {
            // Very simple beep using AudioContext if user interacted? 
            // Or just logging for this simplified environment.
        } catch (e) { }
    };

    const pushNotification = (severity: Severity, key: string, params?: Record<string, any>, link?: string) => {
        // Check settings
        if (severity === 'CRITICAL' && !settings.allowCritical) return;
        if (severity === 'WARNING' && !settings.allowWarning) return;
        if (severity === 'INFO' && !settings.allowInfo) return;

        const newItem: NotificationItem = {
            id: Math.random().toString(36).substr(2, 9),
            severity,
            translationKey: key,
            params,
            timestamp: new Date(),
            read: false,
            link
        };

        setNotifications(prev => [newItem, ...prev]);

        if (severity === 'CRITICAL') {
            playAlertSound();
            // Trigger browser notification if supported/allowed
            // if ("Notification" in window && Notification.permission === "granted") {
            //     new Notification("CRITICAL ALERT", { body: key }); // simplified
            // }
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const updateSettings = (newSettings: Partial<NotificationSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    // Simulated "Firebase" Push from Backend Watchdog
    const simulateCriticalEvent = () => {
        pushNotification(
            'CRITICAL',
            'notifications.tempSpike',
            { temp: 85, limit: 75 },
            '/expert-advice/thermal-runaway'
        );
    };

    // Expose a guarded test API for deterministic E2E triggers.
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const telemetry = useTelemetryStore.getState();

            // Always expose a guarded test API function. It will check current
            // runtime flags when invoked so callers can set flags after load.
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

                    // Update telemetry store with an explicit bearing spike + diagnosis
                    telemetry.updateTelemetry({ mechanical: { bearingTemp: 120 } as any, diagnosis: {
                        severity: 'CRITICAL',
                        messages: [{ code: diag.code, en: diag.params?.message ?? diag.code, bs: diag.params?.message ?? diag.code }],
                        safetyFactor: new Decimal(0.2)
                    } as any });

                    const ui = mapDiagnosticToUI(diag as any);
                    telemetry.pushAlarm({ id: `TEST-${Date.now()}`, severity: diag.severity as any, message: ui.message });
                    // Use provider pushNotification via internal function to keep UX consistent
                    pushNotification('CRITICAL', ui.translationKey || 'notifications.alert', { message: ui.message }, '/alerts');
                    console.log('[__TEST__] injectPeltonFault invoked', ui.message);
                    return ui.message;
                } catch (e) {
                    console.error('injectPeltonFault failed', e);
                    throw e;
                }
            };

            // Auto-invoke if the flag was set prior to load
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

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            settings,
            unreadCount,
            pushNotification,
            markAsRead,
            markAllAsRead,
            updateSettings,
            simulateCriticalEvent
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within NotificationProvider");
    return context;
};
