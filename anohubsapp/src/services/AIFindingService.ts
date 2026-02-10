/**
 * AI Finding Service
 * Data integrity hashing and expert verification workflow
 */

import { AIFinding, ExpertVerification, ExpertVerdict } from '../types/aiFinding';

export class AIFindingService {

    /**
     * Generate SHA-256 data integrity hash for AI finding
     */
    static async generateFindingHash(
        finding: Omit<AIFinding, 'dataIntegrityHash'>
    ): Promise<string> {
        const payload = `${finding.id}|${finding.analysisType}|${finding.aiDiagnosis}|${finding.confidenceScore}|${finding.severity}|${finding.createdAt}`;

        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Verify data integrity of AI finding
     */
    static async verifyFindingIntegrity(finding: AIFinding): Promise<boolean> {
        const expectedHash = await this.generateFindingHash({
            ...finding,
            dataIntegrityHash: ''
        } as any);

        return expectedHash === finding.dataIntegrityHash;
    }

    /**
     * Generate signature hash for expert verification
     */
    static async generateVerificationSignature(
        verification: Omit<ExpertVerification, 'signatureHash'>
    ): Promise<string> {
        const payload = `${verification.findingId}|${verification.verdict}|${verification.comments}|${verification.expertName}|${verification.expertLicense}|${verification.verifiedAt}`;

        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Create new AI finding with integrity hash
     */
    static async createFinding(
        imageUrl: string,
        analysisType: 'CAVITATION' | 'EROSION' | 'CORROSION' | 'CRACK' | 'THERMAL' | 'VIBRATION',
        diagnosis: string,
        diagnosisDE: string,
        confidenceScore: number,
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        recommendedAction: string,
        recommendedActionDE: string,
        referencedStandard?: string
    ): Promise<AIFinding> {
        const createdAt = new Date().toISOString();
        const id = `finding_${Date.now()}_${analysisType.toLowerCase()}`;

        const finding: Omit<AIFinding, 'dataIntegrityHash'> = {
            id,
            imageUrl,
            analysisType,
            aiDiagnosis: diagnosis,
            aiDiagnosisDE: diagnosisDE,
            confidenceScore,
            severity,
            verifiedByExpert: false,
            recommendedAction,
            recommendedActionDE,
            referencedStandard,
            createdAt
        };

        const dataIntegrityHash = await this.generateFindingHash(finding);

        return {
            ...finding,
            dataIntegrityHash
        } as AIFinding;
    }

    /**
     * Submit expert verification
     */
    static async submitExpertVerification(
        finding: AIFinding,
        expertName: string,
        expertLicense: string,
        verdict: ExpertVerdict,
        comments: string,
        commentsDE: string
    ): Promise<{ updatedFinding: AIFinding; verification: ExpertVerification }> {
        const verifiedAt = new Date().toISOString();

        // Create verification record
        const verificationData: Omit<ExpertVerification, 'signatureHash'> = {
            findingId: finding.id,
            expertName,
            expertLicense,
            verdict,
            comments,
            commentsDE,
            verifiedAt
        };

        const signatureHash = await this.generateVerificationSignature(verificationData);

        const verification: ExpertVerification = {
            ...verificationData,
            signatureHash
        };

        // Update finding
        const updatedFinding: AIFinding = {
            ...finding,
            verifiedByExpert: true,
            expertName,
            expertLicense,
            expertComments: comments,
            expertCommentsDE: commentsDE,
            verifiedAt,
            verdict
        };

        // Regenerate integrity hash
        updatedFinding.dataIntegrityHash = await this.generateFindingHash(updatedFinding);

        return { updatedFinding, verification };
    }

    /**
     * Get confidence level description
     */
    static getConfidenceLevel(score: number): {
        level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
        description: string;
        descriptionDE: string;
    } {
        if (score >= 90) {
            return {
                level: 'VERY_HIGH',
                description: 'Very high confidence',
                descriptionDE: 'Sehr hohes Vertrauen'
            };
        } else if (score >= 75) {
            return {
                level: 'HIGH',
                description: 'High confidence',
                descriptionDE: 'Hohes Vertrauen'
            };
        } else if (score >= 60) {
            return {
                level: 'MEDIUM',
                description: 'Medium confidence - expert review recommended',
                descriptionDE: 'Mittleres Vertrauen - Expertenprüfung empfohlen'
            };
        } else {
            return {
                level: 'LOW',
                description: 'Low confidence - expert verification required',
                descriptionDE: 'Geringes Vertrauen - Expertenverifizierung erforderlich'
            };
        }
    }
}
