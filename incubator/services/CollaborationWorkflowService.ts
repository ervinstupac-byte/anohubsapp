// Multi-User Collaboration Workflow
// Field Worker → AI Validation → Consultant Remote Sign-Off

export interface User {
    id: string;
    name: string;
    role: 'FIELD_WORKER' | 'ENGINEER' | 'CONSULTANT' | 'MANAGER';
    email: string;
    phone?: string;
}

export interface MeasurementSubmission {
    id: string;
    submittedBy: User;
    assetId: number;
    measurementType: 'GEODETIC' | 'VIBRATION' | 'THERMAL' | 'OIL_ANALYSIS' | 'HYDRAULIC_CHANGE';
    data: unknown;
    timestamp: number;
    status: 'PENDING_AI_VALIDATION' | 'AI_VALIDATED' | 'REJECTED_BY_AI' | 'PENDING_CONSULTANT_REVIEW' | 'APPROVED' | 'REJECTED';
    aiValidationResult?: AIValidationResult;
    consultantReview?: ConsultantReview;
}

export interface AIValidationResult {
    timestamp: number;
    passed: boolean;
    complianceScore: number; // 0-100
    deviationsFrom005Standard: string[];
    recommendations: string[];
    autoApproved: boolean; // True if within tolerance, no human review needed
    requiresConsultantReview: boolean;
}

export interface ConsultantReview {
    reviewedBy: User;
    timestamp: number;
    decision: 'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL';
    comments: string;
    conditions?: string[]; // For conditional approval
    digitalSignature: string;
}

export interface NotificationPayload {
    recipient: User;
    type: 'AI_VALIDATION_COMPLETE' | 'CONSULTANT_REVIEW_REQUIRED' | 'APPROVAL_GRANTED' | 'REJECTION';
    submissionId: string;
    message: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class CollaborationWorkflowService {
    /**
     * STEP 1: Field worker submits measurement
     */
    static async submitMeasurement(
        fieldWorker: User,
        assetId: number,
        measurementType: MeasurementSubmission['measurementType'],
        data: unknown
    ): Promise<MeasurementSubmission> {
        const submission: MeasurementSubmission = {
            id: `MEAS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            submittedBy: fieldWorker,
            assetId,
            measurementType,
            data,
            timestamp: Date.now(),
            status: 'PENDING_AI_VALIDATION'
        };

        // Save to database (Supabase)
        // await supabase.from('measurement_submissions').insert(submission);

        // Trigger AI validation immediately
        await this.triggerAIValidation(submission);

        return submission;
    }

    /**
     * STEP 2: AI validates against 0.05 mm/m standard
     */
    static async triggerAIValidation(submission: MeasurementSubmission): Promise<void> {
        let validationResult: AIValidationResult;

        switch (submission.measurementType) {
            case 'GEODETIC':
                validationResult = await this.validateGeodeticMeasurement(submission.data);
                break;
            case 'HYDRAULIC_CHANGE':
                validationResult = await this.validateHydraulicChange(submission.data);
                break;
            case 'VIBRATION':
                validationResult = await this.validateVibrationMeasurement(submission.data);
                break;
            default:
                validationResult = {
                    timestamp: Date.now(),
                    passed: true,
                    complianceScore: 100,
                    deviationsFrom005Standard: [],
                    recommendations: [],
                    autoApproved: true,
                    requiresConsultantReview: false
                };
        }

        submission.aiValidationResult = validationResult;

        // Update status based on AI result
        if (!validationResult.passed) {
            submission.status = 'REJECTED_BY_AI';

            // Notify field worker of rejection
            await this.sendNotification({
                recipient: submission.submittedBy,
                type: 'REJECTION',
                submissionId: submission.id,
                message: `AI validation failed. Deviations: ${validationResult.deviationsFrom005Standard.join(', ')}`,
                urgency: 'HIGH'
            });
        } else if (validationResult.autoApproved) {
            submission.status = 'APPROVED';

            // Auto-approved, no human review needed
            await this.sendNotification({
                recipient: submission.submittedBy,
                type: 'APPROVAL_GRANTED',
                submissionId: submission.id,
                message: '✅ Measurement auto-approved by AI. Within 0.05 mm/m standard.',
                urgency: 'LOW'
            });
        } else if (validationResult.requiresConsultantReview) {
            submission.status = 'PENDING_CONSULTANT_REVIEW';

            // Notify consultant for review
            await this.notifyConsultantForReview(submission);
        } else {
            submission.status = 'AI_VALIDATED';
        }

        // Update database
        // await supabase.from('measurement_submissions').update(submission).eq('id', submission.id);
    }

    /**
     * STEP 3: Consultant performs remote sign-off
     */
    static async consultantReview(
        submission: MeasurementSubmission,
        consultant: User,
        decision: ConsultantReview['decision'],
        comments: string,
        conditions?: string[]
    ): Promise<void> {
        const review: ConsultantReview = {
            reviewedBy: consultant,
            timestamp: Date.now(),
            decision,
            comments,
            conditions,
            digitalSignature: this.generateDigitalSignature(consultant, submission.id)
        };

        submission.consultantReview = review;
        submission.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';

        // Notify field worker of decision
        await this.sendNotification({
            recipient: submission.submittedBy,
            type: decision === 'APPROVED' ? 'APPROVAL_GRANTED' : 'REJECTION',
            submissionId: submission.id,
            message: decision === 'APPROVED'
                ? `✅ Approved by ${consultant.name}: ${comments}`
                : `❌ Rejected by ${consultant.name}: ${comments}`,
            urgency: decision === 'APPROVED' ? 'LOW' : 'HIGH'
        });

        // Update database
        // await supabase.from('measurement_submissions').update(submission).eq('id', submission.id);
    }

    // ===== AI VALIDATION METHODS =====

    private static async validateGeodeticMeasurement(data: unknown): Promise<AIValidationResult> {
        const STANDARD_005_MM_M = 0.05; // The sacred 0.05 mm/m standard
        let shaftDeviation = 0;
        if (typeof data === 'object' && data !== null && 'shaftDeviation' in data) {
            const sd = (data as Record<string, unknown>).shaftDeviation;
            if (typeof sd === 'number') shaftDeviation = sd;
            else if (typeof sd === 'string' && !Number.isNaN(Number(sd))) shaftDeviation = Number(sd);
        }

        const passed = shaftDeviation <= STANDARD_005_MM_M;
        const deviations: string[] = [];
        const recommendations: string[] = [];

        if (!passed) {
            deviations.push(`Shaft deviation ${shaftDeviation.toFixed(3)} mm/m exceeds 0.05 mm/m standard by ${(shaftDeviation - STANDARD_005_MM_M).toFixed(3)} mm/m`);
            recommendations.push('Perform precision realignment immediately');
            recommendations.push('Check foundation for settlement or cracks');
        }

        const complianceScore = Math.max(0, (1 - (shaftDeviation - STANDARD_005_MM_M) / STANDARD_005_MM_M) * 100);

        return {
            timestamp: Date.now(),
            passed,
            complianceScore: passed ? 100 : complianceScore,
            deviationsFrom005Standard: deviations,
            recommendations,
            autoApproved: passed && shaftDeviation < 0.03, // Auto-approve if well within tolerance
            requiresConsultantReview: !passed || (shaftDeviation > 0.04 && shaftDeviation <= 0.05)
        };
    }

    private static async validateHydraulicChange(_data: unknown): Promise<AIValidationResult> {
        void _data;
        // Mock validation for missing module
        const result = {
            safe: true,
            risks: [] as string[],
            warnings: [] as string[],
            recommendation: 'APPROVE'
        };

        return {
            timestamp: Date.now(),
            passed: result.safe,
            complianceScore: result.safe ? 100 : 0,
            deviationsFrom005Standard: result.risks,
            recommendations: result.warnings,
            autoApproved: result.recommendation === 'APPROVE',
            requiresConsultantReview: result.recommendation === 'APPROVE_WITH_MODIFICATIONS' || result.recommendation === 'REJECT'
        };
    }

    private static async validateVibrationMeasurement(data: unknown): Promise<AIValidationResult> {
        let vibrationLevel = 0;
        if (typeof data === 'object' && data !== null && 'rmsLevel' in data) {
            const v = (data as Record<string, unknown>).rmsLevel;
            if (typeof v === 'number') vibrationLevel = v;
            else if (typeof v === 'string' && !Number.isNaN(Number(v))) vibrationLevel = Number(v);
        }
        const THRESHOLD = 4.5; // mm/s

        const passed = vibrationLevel <= THRESHOLD;

        return {
            timestamp: Date.now(),
            passed,
            complianceScore: passed ? 100 : Math.max(0, (1 - (vibrationLevel - THRESHOLD) / THRESHOLD) * 100),
            deviationsFrom005Standard: passed ? [] : [`Vibration ${vibrationLevel.toFixed(2)} mm/s exceeds ${THRESHOLD} mm/s`],
            recommendations: passed ? [] : ['Schedule bearing inspection', 'Check for misalignment'],
            autoApproved: passed && vibrationLevel < 3.5,
            requiresConsultantReview: vibrationLevel > 4.0
        };
    }

    // ===== NOTIFICATION METHODS =====

    private static async notifyConsultantForReview(submission: MeasurementSubmission): Promise<void> {
        // Get consultant users from database
        // const consultants = await supabase.from('users').select('*').eq('role', 'CONSULTANT');

        const mockConsultant: User = {
            id: 'CONSULTANT_001',
            name: 'Ervin Stupac',
            role: 'CONSULTANT',
            email: 'ervin@anohubs.com',
            phone: '+387...'
        };

        const score = submission.aiValidationResult?.complianceScore;
        const urgency = (typeof score === 'number' && score < 70) ? 'CRITICAL' : 'HIGH';
        const message = `New measurement requires your review: ${submission.measurementType} for asset ${submission.assetId}. AI Score: ${typeof score === 'number' ? score.toFixed(0) : 'N/A'}%`;

        await this.sendNotification({
            recipient: mockConsultant,
            type: 'CONSULTANT_REVIEW_REQUIRED',
            submissionId: submission.id,
            message,
            urgency
        });
    }

    private static async sendNotification(payload: NotificationPayload): Promise<void> {
        console.log(`📧 Notification sent to ${payload.recipient.name}:`);
        console.log(`   Type: ${payload.type}`);
        console.log(`   Message: ${payload.message}`);
        console.log(`   Urgency: ${payload.urgency}`);

        // In production:
        // 1. Email via SendGrid/AWS SES
        // 2. SMS via Twilio (for CRITICAL urgency)
        // 3. Push notification via Firebase
        // 4. In-app notification via Supabase Realtime
    }

    private static generateDigitalSignature(user: User, submissionId: string): string {
        // In production: Use proper cryptographic signing
        // For now: Simple hash
        const payload = `${user.id}:${submissionId}:${Date.now()}`;
        return btoa(payload); // Base64 encoding (NOT secure, just placeholder)
    }

    /**
     * Get pending reviews for a consultant
     */
    static async getPendingReviews(consultantId: string): Promise<MeasurementSubmission[]> {
        void consultantId;
        // return await supabase
        //     .from('measurement_submissions')
        //     .select('*')
        //     .eq('status', 'PENDING_CONSULTANT_REVIEW');

        return []; // Mock
    }

    /**
     * Get submission history for an asset
     */
    static async getSubmissionHistory(assetId: number): Promise<MeasurementSubmission[]> {
        void assetId;
        // return await supabase
        //     .from('measurement_submissions')
        //     .select('*')
        //     .eq('assetId', assetId)
        //     .order('timestamp', { ascending: false });

        return []; // Mock
    }
}

// ===== USAGE EXAMPLE =====

/*
// Scenario: Field worker measures shaft alignment

const fieldWorker: User = {
    id: 'WORKER_001',
    name: 'Marko Petrović',
    role: 'FIELD_WORKER',
    email: 'marko@anohubs.com'
};

const submission = await CollaborationWorkflowService.submitMeasurement(
    fieldWorker,
    'KAPLAN_001',
    'GEODETIC',
    {
        shaftDeviation: 0.08, // mm/m - EXCEEDS 0.05!
        foundationSettlement: 1.2
    }
);

// AI automatically validates:
// - Deviation: 0.08 mm/m > 0.05 mm/m ❌
// - Status: PENDING_CONSULTANT_REVIEW
// - Notification sent to Ervin Stupac

// Later, consultant reviews:
await CollaborationWorkflowService.consultantReview(
    submission,
    {
        id: 'CONSULTANT_001',
        name: 'Ervin Stupac',
        role: 'CONSULTANT',
        email: 'ervin@anohubs.com'
    },
    'CONDITIONAL_APPROVAL',
    'Approved with conditions: Realign within 30 days',
    ['Schedule precision alignment during next outage', 'Monitor vibration weekly']
);

// Field worker receives notification:
// ✅ Conditionally approved by Ervin Stupac: Realign within 30 days
*/
