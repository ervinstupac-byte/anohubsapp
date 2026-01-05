/**
 * STATE PERSISTENCE SERVICE (NC-4.2 PRODUCTION)
 * 
 * Robust localStorage backup for field engineers.
 * Survives browser refreshes, tab closures, and tablet crashes.
 * 
 * Data Categories:
 * - Alignment readings (dial indicators)
 * - Bearing temperatures
 * - Oil analysis (ppm)
 * - Vibration measurements
 * - User observations/notes
 */

const STORAGE_KEYS = {
    TECHNICAL_STATE: 'anohub_nc42_technicalState',
    ALIGNMENT_READINGS: 'anohub_nc42_alignment',
    BEARING_DATA: 'anohub_nc42_bearings',
    OIL_ANALYSIS: 'anohub_nc42_oil',
    VIBRATION_LOG: 'anohub_nc42_vibration',
    OBSERVATIONS: 'anohub_nc42_observations',
    SESSION_METADATA: 'anohub_nc42_session',
    LAST_BACKUP: 'anohub_nc42_lastBackup'
} as const;

export interface AlignmentReading {
    timestamp: string;
    position: 'TDC' | 'BDC' | '3' | '9';
    dialA: number;  // Coupled end
    dialB: number;  // Free end
    angularMisalignment: number;
    offsetMisalignment: number;
}

export interface BearingData {
    timestamp: string;
    location: 'UPPER_GUIDE' | 'LOWER_GUIDE' | 'THRUST' | 'GENERATOR_DE' | 'GENERATOR_NDE';
    temperature: number;
    vibration?: number;
    notes?: string;
}

export interface OilAnalysis {
    timestamp: string;
    location: string;
    ironPpm: number;
    copperPpm: number;
    waterPpm: number;
    viscosity40C: number;
    tadPpm?: number;
    verdict: 'GOOD' | 'MARGINAL' | 'CRITICAL';
}

export interface VibrationEntry {
    timestamp: string;
    location: string;
    velocityMMs: number;
    accelerationG: number;
    dominantFrequencyHz: number;
    notes?: string;
}

export interface SessionMetadata {
    startTime: string;
    assetId: string;
    engineerId?: string;
    auditType: string;
    version: string;
}

export const StatePersistenceService = {
    /**
     * Get current backup timestamp
     */
    getLastBackupTime(): Date | null {
        const saved = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
        return saved ? new Date(saved) : null;
    },

    /**
     * CORE BACKUP: Save entire technical state
     */
    backupTechnicalState(state: any): void {
        try {
            const backup = {
                data: state,
                timestamp: new Date().toISOString(),
                version: 'NC-4.2'
            };
            localStorage.setItem(STORAGE_KEYS.TECHNICAL_STATE, JSON.stringify(backup));
            localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
        } catch (e) {
            console.error('[NC-4.2] State backup failed:', e);
        }
    },

    /**
     * CORE RESTORE: Recover technical state
     */
    restoreTechnicalState<T>(): T | null {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.TECHNICAL_STATE);
            if (!saved) return null;

            const backup = JSON.parse(saved);
            console.log(`[NC-4.2] State restored from ${backup.timestamp}`);
            return backup.data as T;
        } catch (e) {
            console.error('[NC-4.2] State restore failed:', e);
            return null;
        }
    },

    /**
     * Save alignment readings (incremental)
     */
    saveAlignmentReading(reading: AlignmentReading): void {
        try {
            const existing = this.getAlignmentReadings();
            existing.push(reading);
            localStorage.setItem(STORAGE_KEYS.ALIGNMENT_READINGS, JSON.stringify(existing));
            localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
        } catch (e) {
            console.error('[NC-4.2] Alignment save failed:', e);
        }
    },

    getAlignmentReadings(): AlignmentReading[] {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.ALIGNMENT_READINGS);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },

    /**
     * Save bearing data (incremental)
     */
    saveBearingData(data: BearingData): void {
        try {
            const existing = this.getBearingData();
            existing.push(data);
            localStorage.setItem(STORAGE_KEYS.BEARING_DATA, JSON.stringify(existing));
            localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
        } catch (e) {
            console.error('[NC-4.2] Bearing save failed:', e);
        }
    },

    getBearingData(): BearingData[] {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.BEARING_DATA);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },

    /**
     * Save oil analysis (incremental)
     */
    saveOilAnalysis(data: OilAnalysis): void {
        try {
            const existing = this.getOilAnalyses();
            existing.push(data);
            localStorage.setItem(STORAGE_KEYS.OIL_ANALYSIS, JSON.stringify(existing));
            localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
        } catch (e) {
            console.error('[NC-4.2] Oil analysis save failed:', e);
        }
    },

    getOilAnalyses(): OilAnalysis[] {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.OIL_ANALYSIS);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },

    /**
     * Save vibration entry (incremental)
     */
    saveVibrationEntry(entry: VibrationEntry): void {
        try {
            const existing = this.getVibrationLog();
            existing.push(entry);
            localStorage.setItem(STORAGE_KEYS.VIBRATION_LOG, JSON.stringify(existing));
            localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
        } catch (e) {
            console.error('[NC-4.2] Vibration save failed:', e);
        }
    },

    getVibrationLog(): VibrationEntry[] {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.VIBRATION_LOG);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },

    /**
     * Save user observation
     */
    saveObservation(observation: { timestamp: string; category: string; text: string; severity?: string }): void {
        try {
            const existing = this.getObservations();
            existing.push(observation);
            localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(existing));
        } catch (e) {
            console.error('[NC-4.2] Observation save failed:', e);
        }
    },

    getObservations(): { timestamp: string; category: string; text: string; severity?: string }[] {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.OBSERVATIONS);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },

    /**
     * Session management
     */
    startSession(metadata: SessionMetadata): void {
        localStorage.setItem(STORAGE_KEYS.SESSION_METADATA, JSON.stringify(metadata));
    },

    getSession(): SessionMetadata | null {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.SESSION_METADATA);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    },

    /**
     * Check if there's recoverable data
     */
    hasRecoverableData(): boolean {
        return !!(
            localStorage.getItem(STORAGE_KEYS.TECHNICAL_STATE) ||
            localStorage.getItem(STORAGE_KEYS.ALIGNMENT_READINGS) ||
            localStorage.getItem(STORAGE_KEYS.BEARING_DATA) ||
            localStorage.getItem(STORAGE_KEYS.OIL_ANALYSIS)
        );
    },

    /**
     * Get recovery summary
     */
    getRecoverySummary(): {
        hasData: boolean;
        lastBackup: string | null;
        counts: {
            alignments: number;
            bearings: number;
            oilSamples: number;
            vibrations: number;
            observations: number;
        }
    } {
        return {
            hasData: this.hasRecoverableData(),
            lastBackup: localStorage.getItem(STORAGE_KEYS.LAST_BACKUP),
            counts: {
                alignments: this.getAlignmentReadings().length,
                bearings: this.getBearingData().length,
                oilSamples: this.getOilAnalyses().length,
                vibrations: this.getVibrationLog().length,
                observations: this.getObservations().length
            }
        };
    },

    /**
     * Export all data as JSON blob (for backup to file)
     */
    exportAllData(): Blob {
        const exportData = {
            technicalState: this.restoreTechnicalState<any>(),
            alignments: this.getAlignmentReadings(),
            bearings: this.getBearingData(),
            oilAnalyses: this.getOilAnalyses(),
            vibrations: this.getVibrationLog(),
            observations: this.getObservations(),
            session: this.getSession(),
            exportTimestamp: new Date().toISOString(),
            version: 'NC-4.2'
        };

        return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    },

    /**
     * Import data from JSON blob
     */
    importData(data: string): boolean {
        try {
            const parsed = JSON.parse(data);

            if (parsed.technicalState) {
                this.backupTechnicalState(parsed.technicalState);
            }
            if (parsed.alignments) {
                localStorage.setItem(STORAGE_KEYS.ALIGNMENT_READINGS, JSON.stringify(parsed.alignments));
            }
            if (parsed.bearings) {
                localStorage.setItem(STORAGE_KEYS.BEARING_DATA, JSON.stringify(parsed.bearings));
            }
            if (parsed.oilAnalyses) {
                localStorage.setItem(STORAGE_KEYS.OIL_ANALYSIS, JSON.stringify(parsed.oilAnalyses));
            }
            if (parsed.vibrations) {
                localStorage.setItem(STORAGE_KEYS.VIBRATION_LOG, JSON.stringify(parsed.vibrations));
            }
            if (parsed.observations) {
                localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(parsed.observations));
            }

            localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
            return true;
        } catch (e) {
            console.error('[NC-4.2] Import failed:', e);
            return false;
        }
    },

    /**
     * FULL RESET: Clear all persisted data
     */
    clearAllData(): void {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('[NC-4.2] All persisted data cleared');
    },

    /**
     * Generate audit hash for data integrity
     */
    generateAuditHash(data: any): string {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
    }
};
