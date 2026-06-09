import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { describe, it, expect, vi } from 'vitest';

// Mock the supabase client BEFORE importing the provider so the module import uses the mock
let callCount = 0;
vi.mock('../../services/supabaseClient', () => {
    const supabase: any = {
        from: (table: string) => ({
            insert: (payload: any) => ({
                select: () => ({
                    single: async () => {
                        callCount += 1;
                        if (callCount === 1) {
                            return { data: null, error: { message: 'invalid input syntax for type uuid: "3001"' } };
                        }
                        return { data: { id: 'workorder-123' }, error: null };
                    }
                })
            }),
            select: (cols?: any) => ({
                order: (field: string, opts?: any) => Promise.resolve({ data: [], error: null })
            }),
            order: (field: string, opts?: any) => Promise.resolve({ data: [], error: null })
        }),
        channel: (name?: string) => {
            const ch: any = {
                on: function () { return ch; },
                subscribe: async () => ({})
            };
            return ch;
        },
        removeChannel: () => {},
        storage: { from: () => ({ upload: async () => ({ error: null, data: null }) }) },
        auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), getUser: async () => ({ data: null, error: null }) }
    };
    return { supabase } as any;
});

import { MaintenanceProvider, useMaintenance } from '../../contexts/MaintenanceContext';

const Harness: React.FC<{ onReady: (createWorkOrder: any) => void }> = ({ onReady }) => {
    const { createWorkOrder } = useMaintenance();
    React.useEffect(() => { onReady(createWorkOrder); }, [createWorkOrder]);
    return null;
};

describe('MaintenanceContext.createWorkOrder', () => {
    it('retries insert when DB returns UUID syntax error and returns created id', async () => {
        let createFn: any = null;
        render(
            <MaintenanceProvider>
                <Harness onReady={(fn) => { createFn = fn; }} />
            </MaintenanceProvider>
        );

        expect(typeof createFn).toBe('function');

        const payload = {
            assetId: 3001,
            assetName: 'Iron Gorge HPP',
            component: 'TEST_COMPONENT',
            description: 'E2E test payload',
            priority: 'HIGH',
            trigger: 'AI_PREDICTION'
        } as any;

        let result: any = null;
        await act(async () => {
            result = await createFn(payload);
        });

        // After retry, mocked supabase returns id 'workorder-123'
        expect(result).toBeTruthy();
        expect(result.id).toBe('workorder-123');
    });
});
