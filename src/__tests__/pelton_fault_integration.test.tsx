// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { it, describe, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '../stores/useNotificationStore';
import { DiagnosticAlertsPanel } from '../components/dashboard/DiagnosticAlertsPanel';
import { act } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import Decimal from 'decimal.js';

function NotificationsList() {
  const { notifications } = useNotificationStore();
  return (
    <div data-testid="notif-list">
      {notifications.map(n => (
        <div key={n.id} data-testid="notif-item">
          {n.translationKey} - {n.params?.message || ''}
        </div>
      ))}
    </div>
  );
}

describe('Pelton fault -> UI integration (simulated)', () => {
  beforeEach(() => {
    act(() => {
      useNotificationStore.setState({ notifications: [], unreadCount: 0 });
    });
  });

  it('renders critical diagnostic in DiagnosticAlertsPanel and shows notification toast', async () => {
    function TestTrigger() {
      const { pushNotification } = useNotificationStore();
      React.useEffect(() => {
        pushNotification &&
          pushNotification(
            'CRITICAL',
            'notifications.tempSpike',
            { message: 'Shaft jump detected (-1.2 mm)' },
            '/alerts'
          );
      }, [pushNotification]);
      return null;
    }

    render(
      <div>
        <DiagnosticAlertsPanel />
        <NotificationsList />
        <TestTrigger />
      </div>
    );

    // Set diagnosis in the telemetry store to simulate engine output
    act(() => {
      useTelemetryStore.setState({
        diagnosis: {
          severity: 'CRITICAL',
          messages: [{ code: 'SHAFT_JUMP', en: 'Shaft jump detected (-1.2 mm)', bs: 'SHAFT_JUMP' }],
          safetyFactor: new Decimal(0.2),
        } as any,
      });
    });

    await waitFor(
      () => {
        const matches = screen.getAllByText(/Shaft jump detected/i);
        expect(matches.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        const list = screen.getByTestId('notif-list');
        expect(list).toBeTruthy();
        const items = Array.from(list.querySelectorAll('[data-testid="notif-item"]'));
        expect(items.length).toBeGreaterThan(0);
        expect(items.some(n => /Shaft jump detected/i.test(n.textContent || ''))).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });
});
