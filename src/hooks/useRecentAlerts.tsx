import { useEffect, useState, useRef } from 'react';
import { useNotificationStore } from '../stores/useNotificationStore';
import mapDiagnosticToUI from '../lib/engines/diagnosticMapper';
import { Diagnostic } from '../lib/engines/schemas';

export type RecentAlert = {
  id: number | string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  uiSeverity: 'high' | 'medium' | 'low';
  issue: string;
  message: string;
  action?: string;
  turbineId?: string;
  timestamp?: string;
  riskScore?: number;
  payload?: any;
};

export function useRecentAlerts(
  pollIntervalMs: number = 10000,
  pushToNotifications: boolean = true
) {
  const [alerts, setAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const processedRef = useRef<Set<string | number>>(new Set());
  const { pushNotification } = useNotificationStore();

  const fetchOnce = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/alerts/recent', { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setAlerts(Array.isArray(j.alerts) ? j.alerts : []);
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    abortRef.current = new AbortController();
    fetchOnce(abortRef.current.signal);
    const id = setInterval(() => {
      const c = new AbortController();
      abortRef.current = c;
      fetchOnce(c.signal);
    }, pollIntervalMs);
    return () => {
      clearInterval(id);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [pollIntervalMs]);

  // Push new alerts into global NotificationStore once
  useEffect(() => {
    if (!pushToNotifications) return;
    for (const a of alerts) {
      if (processedRef.current.has(a.id)) continue;
      if (a.severity === 'CRITICAL' || a.severity === 'WARNING') {
        // Prefer structured Diagnostic payloads when available
        let ui = null as null | { message: string; uiSeverity: string; translationKey?: string };
        if (a.payload && typeof a.payload === 'object' && (a.payload as Diagnostic).code) {
          try {
            ui = mapDiagnosticToUI(a.payload as Diagnostic) as any;
          } catch (e) {
            console.warn('Failed to map diagnostic payload', e);
          }
        }

        // Fallback for legacy alerts that only contain message/issue
        if (!ui) {
          ui = {
            message: a.message || a.issue || 'Alert',
            uiSeverity: a.severity === 'CRITICAL' ? 'high' : 'medium',
            translationKey: 'notifications.alert',
          };
        }

        const params = {
          issue: a.issue,
          action: a.action,
          turbineId: a.turbineId,
          riskScore: a.riskScore,
          message: ui.message,
        };
        const link = a.id ? `/alerts#${a.id}` : undefined;
        try {
          pushNotification(
            a.severity as any,
            ui.translationKey || 'notifications.alert',
            params,
            link
          );
        } catch (e) {
          console.error('Failed to push notification', e);
        }
        processedRef.current.add(a.id);
      }
    }
  }, [alerts, pushNotification, pushToNotifications]);

  return { alerts, loading, error, refresh: () => fetchOnce(abortRef.current?.signal) };
}
