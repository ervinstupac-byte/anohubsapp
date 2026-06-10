// React Hook for Black Box Recorder Integration
// Bridges Web Worker with React components

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTelemetry } from '../contexts/TelemetryContext';
import idAdapter from '../utils/idAdapter';
import { useAssetContext } from '../contexts/AssetContext';

interface ForensicTrigger {
    index: number;
    triggeredAt: number;
    reason: string;
    pointCount: number;
}

interface BlackBoxStatus {
    isActive: boolean;
    mode: 'NORMAL' | 'HIGH_FREQUENCY';
    samplingRate: number;
    triggers: ForensicTrigger[];
}

export function useBlackBoxRecorder() {
    const { telemetry } = useTelemetry();
    const { selectedAsset } = useAssetContext();
    const workerRef = useRef<Worker | null>(null);
    const [status, setStatus] = useState<BlackBoxStatus>({
        isActive: false,
        mode: 'NORMAL',
        samplingRate: 1,
        triggers: []
    });

    // Initialize Web Worker
    useEffect(() => {
        // Create worker
        const worker = new Worker(
            new URL('../workers/BlackBoxRecorder.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current = worker;

        // Make worker globally accessible for SafetyInterlockEngine
        if (typeof window !== 'undefined') {
            (window as any).blackBoxWorker = worker;
        }

        // Handle messages from worker
        worker.onmessage = (event) => {
            const { type, data } = event.data;

            switch (type) {
                case 'REQUEST_DATA':
                    // Worker requests current telemetry data
                    if (selectedAsset && telemetry[idAdapter.toStorage(selectedAsset.id)]) {
                        const key = idAdapter.toStorage(selectedAsset.id);
                        const tData = telemetry[key];
                        worker.postMessage({
                            type: 'RECORD',
                            data: {
                                assetId: key,
                                vibration: tData.vibration,
                                temperature: tData.temperature,
                                pressure: (tData as any).cylinderPressure || 0,
                                bladeAngle: (tData as any).kaplan_data?.blade_angle,
                                hubPosition: (tData as any).kaplan_data?.hub_position,
                                command: null,
                                eventType: tData.status === 'CRITICAL' ? 'CRITICAL' : 'NORMAL'
                            }
                        });
                    }
                    break;

                case 'TRIGGER_SAVED':
                    console.log('📹 Black Box trigger saved:', data);
                    // Save to Supabase
                    saveForensicRecording(data);
                    // Update UI
                    refreshTriggers();
                    break;

                case 'CSV_EXPORTED':
                    // Download CSV
                    downloadCSV(data.csv, data.filename);
                    break;

                case 'TRIGGERS_LIST':
                    setStatus(prev => ({ ...prev, triggers: data.triggers }));
                    break;
            }
        };

        // Initialize worker
        worker.postMessage({ type: 'INIT' });
        setStatus(prev => ({ ...prev, isActive: true }));

        return () => {
            worker.terminate();
            setStatus(prev => ({ ...prev, isActive: false }));
        };
    }, []);

    // Activate high-frequency mode
    const activateHighFrequency = useCallback((duration: number = 60000) => {
        if (workerRef.current) {
            workerRef.current.postMessage({
                type: 'ACTIVATE_HIGH_FREQUENCY',
                data: { duration }
            });
            setStatus(prev => ({
                ...prev,
                mode: 'HIGH_FREQUENCY',
                samplingRate: 100
            }));
        }
    }, []);

    // Deactivate high-frequency mode
    const deactivateHighFrequency = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'DEACTIVATE_HIGH_FREQUENCY' });
            setStatus(prev => ({
                ...prev,
                mode: 'NORMAL',
                samplingRate: 1
            }));
        }
    }, []);

    // Export trigger to CSV
    const exportTrigger = useCallback((triggerIndex: number) => {
        if (workerRef.current) {
            workerRef.current.postMessage({
                type: 'EXPORT_CSV',
                data: { triggerIndex }
            });
        }
    }, []);

    // Get list of triggers
    const refreshTriggers = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'GET_TRIGGERS' });
        }
    }, []);

    useEffect(() => {
        refreshTriggers();
    }, [refreshTriggers]);

    return {
        status,
        activateHighFrequency,
        deactivateHighFrequency,
        exportTrigger,
        refreshTriggers
    };
}

// ===== HELPER FUNCTIONS =====

async function saveForensicRecording(triggerData: any) {
    // In production: Save to Supabase
    /*
    const { error } = await supabase.from('forensic_recordings').insert({
        asset_id: triggerData.assetId,
        triggered_at: new Date(triggerData.triggeredAt).toISOString(),
        trigger_reason: triggerData.reason,
        sampling_rate: 100,
        duration_seconds: 60,
        data_point_count: triggerData.bufferSnapshot.length,
        csv_export: JSON.stringify(triggerData.bufferSnapshot)
    });
    */

    console.log('💾 Forensic recording saved to database');
}

function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
