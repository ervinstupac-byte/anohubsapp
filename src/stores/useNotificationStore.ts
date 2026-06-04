import { create } from 'zustand';
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

interface NotificationStore {
  notifications: NotificationItem[];
  settings: NotificationSettings;
  unreadCount: number;
  pushNotification: (
    severity: Severity,
    key: string,
    params?: Record<string, any>,
    link?: string
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  simulateCriticalEvent: () => void;
}

// Sound Effect
const playAlertSound = () => {
  console.log('🔊 PLAYING CRITICAL ALARM SOUND 🔊');
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  settings: {
    allowCritical: true,
    allowWarning: true,
    allowInfo: true,
  },
  unreadCount: 0,

  pushNotification: (
    severity: Severity,
    key: string,
    params?: Record<string, any>,
    link?: string
  ) => {
    const { settings } = get();

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
      link,
    };

    set(state => ({
      notifications: [newItem, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    if (severity === 'CRITICAL') {
      playAlertSound();
    }
  },

  markAsRead: (id: string) => {
    set(state => {
      const updated = state.notifications.map(n => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set(state => {
      const updated = state.notifications.map(n => ({ ...n, read: true }));
      return {
        notifications: updated,
        unreadCount: 0,
      };
    });
  },

  updateSettings: (newSettings: Partial<NotificationSettings>) => {
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  simulateCriticalEvent: () => {
    get().pushNotification(
      'CRITICAL',
      'notifications.tempSpike',
      { temp: 85, limit: 75 },
      '/expert-advice/thermal-runaway'
    );
  },
}));
