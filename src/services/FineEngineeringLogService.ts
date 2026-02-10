/**
 * Fine Engineering Log Service
 * 0.01mm precision measurements with digital signatures
 */

import { PrecisionMeasurement, FineEngineeringLog } from '../types/trends';

export class FineEngineeringLogService {

    /**
     * Generate SHA-256 digital signature for measurement
     */
    static async generateSignature(
        measurement: {
            parameterId: string;
            valueMM: number;
            measuredAt: string;
        },
        engineerName: string,
        engineerLicense: string
    ): Promise<string> {
        // Create signature payload
        const payload = `${measurement.parameterId}|${measurement.valueMM}|${measurement.measuredAt}|${engineerName}|${engineerLicense}`;

        // Generate SHA-256 hash
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }

    /**
     * Verify digital signature
     */
    static async verifySignature(
        measurement: PrecisionMeasurement
    ): Promise<boolean> {
        const expectedHash = await this.generateSignature(
            {
                parameterId: measurement.parameterId,
                valueMM: measurement.valueMM,
                measuredAt: measurement.measuredAt
            },
            measurement.signature.engineerName,
            measurement.signature.engineerLicense
        );

        return expectedHash === measurement.signature.signatureHash;
    }

    /**
     * Create precision measurement with signature
     */
    static async createPrecisionMeasurement(
        parameterId: string,
        parameterName: string,
        valueMM: number,
        engineerName: string,
        engineerLicense: string,
        temperature: number,
        measurementMethod: 'FEELER_GAUGE' | 'MICROMETER' | 'DIAL_INDICATOR' | 'LASER',
        calibrationCertificateId?: string
    ): Promise<PrecisionMeasurement> {
        const measuredAt = new Date().toISOString();

        const signatureHash = await this.generateSignature(
            { parameterId, valueMM, measuredAt },
            engineerName,
            engineerLicense
        );

        // Convert to hundredths for display
        const hundredths = Math.round(valueMM * 100);

        return {
            id: `pm_${Date.now()}_${parameterId}`,
            parameterId,
            parameterName,
            valueMM,
            displayValue: `${valueMM.toFixed(2)}mm`,
            precisionValue: `${hundredths} hundredths`,
            measuredAt,
            measuredBy: engineerName,
            signature: {
                engineerName,
                engineerLicense,
                signedAt: measuredAt,
                signatureHash
            },
            temperature,
            calibrationCertificateId,
            measurementMethod
        };
    }

    /**
     * Add measurement to engineering log
     */
    static addMeasurement(
        log: FineEngineeringLog,
        measurement: PrecisionMeasurement
    ): FineEngineeringLog {
        return {
            ...log,
            measurements: [...log.measurements, measurement],
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Get measurements for specific parameter
     */
    static getMeasurementsByParameter(
        log: FineEngineeringLog,
        parameterId: string
    ): PrecisionMeasurement[] {
        return log.measurements
            .filter(m => m.parameterId === parameterId)
            .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
    }

    /**
     * Get measurements by engineer
     */
    static getMeasurementsByEngineer(
        log: FineEngineeringLog,
        engineerName: string
    ): PrecisionMeasurement[] {
        return log.measurements
            .filter(m => m.signature.engineerName === engineerName)
            .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
    }

    /**
     * Validate all signatures in log
     */
    static async validateAllSignatures(
        log: FineEngineeringLog
    ): Promise<{ valid: number; invalid: number; invalidMeasurements: string[] }> {
        let valid = 0;
        let invalid = 0;
        const invalidMeasurements: string[] = [];

        for (const measurement of log.measurements) {
            const isValid = await this.verifySignature(measurement);
            if (isValid) {
                valid++;
            } else {
                invalid++;
                invalidMeasurements.push(measurement.id);
            }
        }

        return { valid, invalid, invalidMeasurements };
    }

    /**
     * Export log to audit format
     */
    static exportToAudit(
        log: FineEngineeringLog
    ): string {
        let audit = `FINE ENGINEERING LOG - AUDIT EXPORT\n`;
        audit += `Asset: ${log.assetId}\n`;
        audit += `Generated: ${new Date().toISOString()}\n`;
        audit += `Total Measurements: ${log.measurements.length}\n\n`;
        audit += `${'='.repeat(80)}\n\n`;

        log.measurements
            .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
            .forEach((m, idx) => {
                audit += `[${idx + 1}] ${m.parameterName}\n`;
                audit += `    Value: ${m.displayValue} (${m.precisionValue})\n`;
                audit += `    Measured: ${new Date(m.measuredAt).toLocaleString()}\n`;
                audit += `    Engineer: ${m.signature.engineerName} (Lic: ${m.signature.engineerLicense})\n`;
                audit += `    Method: ${m.measurementMethod}\n`;
                audit += `    Temperature: ${m.temperature}°C\n`;
                audit += `    Signature: ${m.signature.signatureHash.substring(0, 16)}...\n`;
                if (m.calibrationCertificateId) {
                    audit += `    Calibration: ${m.calibrationCertificateId}\n`;
                }
                audit += `\n`;
            });

        return audit;
    }

    /**
     * Create default engineering log
     */
    static createLog(assetId: string): FineEngineeringLog {
        return {
            assetId,
            measurements: [],
            lastUpdated: new Date().toISOString()
        };
    }
}
