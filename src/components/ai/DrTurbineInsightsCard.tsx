/**
 * DrTurbineInsightsCard
 * AI analysis card with confidence scoring, expert verification, and ISO/DIN standards
 */

import React, { useState } from 'react';
import { AIFinding, ExpertVerdict } from '../../types/aiFinding';
import { AIFindingService } from '../../services/AIFindingService';
import { TechnicalStandardsService } from '../../services/TechnicalStandardsService';
import { Check, AlertCircle, ExternalLink, Shield } from 'lucide-react';

interface DrTurbineInsightsCardProps {
    finding: AIFinding;
    onVerify?: (updatedFinding: AIFinding) => void;
    showVerificationUI?: boolean;
}

export const DrTurbineInsightsCard: React.FC<DrTurbineInsightsCardProps> = ({
    finding,
    onVerify,
    showVerificationUI = false
}) => {
    const [showExpertForm, setShowExpertForm] = useState(false);
    const [expertName, setExpertName] = useState('');
    const [expertLicense, setExpertLicense] = useState('');
    const [verdict, setVerdict] = useState<ExpertVerdict>('CONFIRMED');
    const [comments, setComments] = useState('');
    const [commentsDE, setCommentsDE] = useState('');

    const confidenceLevel = AIFindingService.getConfidenceLevel(finding.confidenceScore);
    const standard = finding.referencedStandard
        ? TechnicalStandardsService.getStandardByCode(finding.referencedStandard)
        : undefined;

    const handleSubmitVerification = async () => {
        const { updatedFinding } = await AIFindingService.submitExpertVerification(
            finding,
            expertName,
            expertLicense,
            verdict,
            comments,
            commentsDE
        );

        if (onVerify) {
            onVerify(updatedFinding);
        }

        setShowExpertForm(false);
    };

    // Severity color mapping
    const severityColors = {
        'LOW': 'text-blue-400 bg-blue-950/30 border-blue-500/30',
        'MEDIUM': 'text-yellow-400 bg-yellow-950/30 border-yellow-500/30',
        'HIGH': 'text-orange-400 bg-orange-950/30 border-orange-500/30',
        'CRITICAL': 'text-red-400 bg-red-950/30 border-red-500/30'
    };

    const severityIcons = {
        'LOW': 'ℹ️',
        'MEDIUM': '⚡',
        'HIGH': '⚠️',
        'CRITICAL': '🚨'
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2dd4bf]/20 to-blue-500/20 border-b border-slate-700 px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🤖</span>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">Dr. Turbine AI Analysis</h3>
                        <p className="text-sm text-slate-400">Analysis ID: {finding.id.substring(0, 16)}...</p>
                    </div>
                    {finding.verifiedByExpert && (
                        <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/30 rounded px-3 py-1">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-300">Verified</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
                {/* Analysis Type & Confidence */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Analysis Type</label>
                        <div className="text-lg font-bold text-[#2dd4bf]">{finding.analysisType}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Confidence Score</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#2dd4bf] to-emerald-400"
                                    style={{ width: `${finding.confidenceScore}%` }}
                                />
                            </div>
                            <span className="text-lg font-bold text-white font-mono">
                                {finding.confidenceScore}%
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{confidenceLevel.description}</p>
                    </div>
                </div>

                {/* AI Diagnosis */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">AI Diagnosis</label>
                    <div className="bg-slate-800 border border-slate-700 rounded p-4">
                        <p className="text-white leading-relaxed">{finding.aiDiagnosis}</p>
                        <p className="text-slate-400 text-sm mt-2 italic">{finding.aiDiagnosisDE}</p>
                    </div>
                </div>

                {/* Severity */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Severity Level</label>
                    <div className={`flex items-center gap-2 px-4 py-3 rounded border ${severityColors[finding.severity]}`}>
                        <span className="text-2xl">{severityIcons[finding.severity]}</span>
                        <span className="font-bold text-lg">{finding.severity}</span>
                    </div>
                </div>

                {/* Recommended Action */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Recommended Action</label>
                    <div className="bg-blue-950/30 border border-blue-500/30 rounded p-4">
                        <p className="text-blue-200 leading-relaxed">{finding.recommendedAction}</p>
                        <p className="text-blue-300/70 text-sm mt-2 italic">{finding.recommendedActionDE}</p>
                    </div>
                </div>

                {/* Reference Standard */}
                {standard && (
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Reference Standard</label>
                        <div className="bg-slate-800 border border-slate-700 rounded p-4 flex items-start gap-3">
                            <span className="text-2xl">📋</span>
                            <div className="flex-1">
                                <div className="font-bold text-[#2dd4bf]">{standard.standardCode}</div>
                                <div className="text-sm text-white mt-1">{standard.title}</div>
                                <div className="text-xs text-slate-400 mt-1">{standard.titleDE}</div>
                                {standard.url && (
                                    <a
                                        href={standard.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-[#2dd4bf] hover:underline mt-2"
                                    >
                                        View Standard <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Integrity */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>Data Integrity Hash: {finding.dataIntegrityHash.substring(0, 16)}...</span>
                </div>

                {/* Expert Verification Section */}
                {finding.verifiedByExpert ? (
                    <div className="border-t border-slate-700 pt-6">
                        <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Expert Verification
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Verified by:</span>
                                <span className="text-white font-bold">{finding.expertName} ({finding.expertLicense})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Date:</span>
                                <span className="text-white">{new Date(finding.verifiedAt!).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Verdict:</span>
                                <span className={`font-bold ${finding.verdict === 'CONFIRMED' ? 'text-emerald-400'
                                        : finding.verdict === 'MODIFIED' ? 'text-yellow-400'
                                            : 'text-red-400'
                                    }`}>
                                    {finding.verdict}
                                </span>
                            </div>
                        </div>

                        {finding.expertComments && (
                            <div className="mt-4 bg-emerald-950/20 border border-emerald-500/30 rounded p-4">
                                <label className="block text-sm font-bold text-emerald-300 mb-2">Expert Comments</label>
                                <p className="text-emerald-100 text-sm leading-relaxed">{finding.expertComments}</p>
                                {finding.expertCommentsDE && (
                                    <p className="text-emerald-200/70 text-xs mt-2 italic">{finding.expertCommentsDE}</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : showVerificationUI && (
                    <div className="border-t border-slate-700 pt-6">
                        {!showExpertForm ? (
                            <button
                                onClick={() => setShowExpertForm(true)}
                                className="w-full py-3 bg-[#2dd4bf] hover:bg-emerald-400 text-black rounded font-bold flex items-center justify-center gap-2"
                            >
                                <AlertCircle className="w-5 h-5" />
                                Submit Expert Verification
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-[#2dd4bf]">Expert Verification Form</h4>

                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Expert Name</label>
                                    <input
                                        type="text"
                                        value={expertName}
                                        onChange={(e) => setExpertName(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-[#2dd4bf]"
                                        placeholder="Dr. Markus Schmidt"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">License Number</label>
                                    <input
                                        type="text"
                                        value={expertLicense}
                                        onChange={(e) => setExpertLicense(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white font-mono outline-none focus:border-[#2dd4bf]"
                                        placeholder="ING-2024-789"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Verdict</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['CONFIRMED', 'MODIFIED', 'REJECTED'] as ExpertVerdict[]).map(v => (
                                            <button
                                                key={v}
                                                onClick={() => setVerdict(v)}
                                                className={`py-2 rounded font-bold transition-all ${verdict === v
                                                        ? 'bg-[#2dd4bf] text-black'
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Comments (English)</label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-[#2dd4bf]"
                                        placeholder="Additional observations or corrections..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Comments (German)</label>
                                    <textarea
                                        value={commentsDE}
                                        onChange={(e) => setCommentsDE(e.target.value)}
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-[#2dd4bf]"
                                        placeholder="Zusätzliche Beobachtungen oder Korrekturen..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmitVerification}
                                        disabled={!expertName || !expertLicense || !comments}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded font-bold"
                                    >
                                        Submit Verification
                                    </button>
                                    <button
                                        onClick={() => setShowExpertForm(false)}
                                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
