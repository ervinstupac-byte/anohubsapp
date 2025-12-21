import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
