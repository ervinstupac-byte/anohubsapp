import React from 'react';
import { useRisk } from '../contexts/RiskContext';

export const InterventionCTA: React.FC = () => {
    const { disciplineRiskScore } = useRisk();

    if (disciplineRiskScore < 55) {
        return null;
    }

    const mailtoLink = `mailto:info@anohubs.com?subject=Inquiry: Zero-Tolerance Audit (Risk Score: ${disciplineRiskScore})&body=My current Discipline Risk Index score is ${disciplineRiskScore}. I would like to schedule a private, remote 'Zero-Tolerance Audit' to address the Execution Gap and protect my asset's warranty. Please provide me with the next steps.`;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-red-800/95 border-t-2 border-red-500 text-white p-4 z-[60] animate-fade-in no-print backdrop-blur-sm">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-shrink-0 text-3xl">
                    ⚠️
                </div>
                <div className="text-center md:text-left flex-grow">
                    <h3 className="font-bold text-lg">
                        YOUR DISCIPLINE RISK IS {disciplineRiskScore}! Immediate Strategic Intervention Required.
                    </h3>
                    <p className="text-sm text-red-200">
                        Don't lose your warranty to the Execution Gap. Book a private, remote 'Zero-Tolerance Audit' with the founder now.
                    </p>
                </div>
                <a
                    href={mailtoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-6 py-3 bg-white text-red-700 font-bold rounded-lg shadow-lg hover:bg-red-100 transition-colors transform hover:scale-105"
                >
                    BOOK ZERO-TOLERANCE AUDIT
                </a>
            </div>
        </div>
    );
};