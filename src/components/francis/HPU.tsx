import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Activity, Droplet, FileCheck } from 'lucide-react';

export const HPU: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f4f7f6] text-[#333] font-sans pb-12 overflow-x-hidden p-6 md:p-12">
            <style>
                {`
                .formula-box {
                    background: #000;
                    color: #0f0;
                    font-family: 'Courier New', monospace;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 15px 0;
                    text-align: center;
                    font-weight: bold;
                }
                `}
            </style>

            <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 shadow-xl rounded-lg">

                {/* Header */}
                <header className="border-b-[3px] border-[#003366] pb-5 mb-8 text-center">
                    <h1 className="text-[#003366] text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2">
                        {t('francis.hpu.title')}
                    </h1>
                    <h2 className="text-[#0066cc] text-lg font-normal mb-6">
                        {t('francis.hpu.subtitle')}
                    </h2>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="inline-flex items-center gap-2 border border-[#0066cc] text-[#0066cc] px-5 py-2 rounded font-bold hover:bg-[#0066cc] hover:text-white transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('francis.hpu.back_btn') || "Return to Operations Center"}</span>
                    </button>
                </header>

                {/* SAFETY MODULE */}
                <div className="bg-[#fff5f5] border-l-[5px] border-[#d9534f] p-4 my-4 rounded">
                    <h3 className="text-[#003366] font-bold text-lg mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-[#d9534f] w-6 h-6" /> {t('francis.hpu.safetyTitle')}
                    </h3>
                    <p className="mb-2">
                        <strong className="text-[#d9534f]">{t('francis.hpu.danger')}</strong> <span>{t('francis.hpu.dangerDesc')}</span>
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>{t('francis.hpu.deEnergize')}</strong> <span>{t('francis.hpu.deEnDesc')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.hpu.injectRisk')}</strong> <span>{t('francis.hpu.injectDesc')}</span>
                        </li>
                    </ul>
                </div>

                {/* SOP 1 */}
                <div className="bg-[#003366] text-white p-3 rounded mt-10 mb-4 font-bold text-lg flex items-center gap-2">
                    <span>►</span> {t('francis.hpu.sop1Title')}
                </div>
                <div className="bg-[#f0f7ff] border-l-[5px] border-[#0066cc] p-4 my-4 rounded border border-[#dde]">
                    <p className="mb-4">{t('francis.hpu.accDesc')}</p>

                    <h3 className="text-[#003366] border-l-[4px] border-[#0066cc] pl-3 text-lg font-bold mt-6 mb-2">
                        1.1 ESD Energy Verification (Quarterly)
                    </h3>
                    {/* Note: some text might be hardcoded in t() structure in previous step, checking keys */}

                    <div className="space-y-4">
                        <p><strong>{t('francis.hpu.p0Rule')}</strong></p>

                        <div className="bg-[#fdf8e4] border-l-[5px] border-[#f0ad4e] p-3 my-3">
                            <strong>{t('francis.hpu.techNote')}</strong> <span>{t('francis.hpu.techNoteDesc')}</span>
                        </div>
                    </div>
                </div>

                {/* SOP 2 */}
                <div className="bg-[#003366] text-white p-3 rounded mt-10 mb-4 font-bold text-lg flex items-center gap-2">
                    <span>►</span> {t('francis.hpu.sop2Title')}
                </div>
                <div className="bg-[#f0f7ff] border-l-[5px] border-[#0066cc] p-4 my-4 rounded border border-[#dde]">
                    <p className="mb-4">{t('francis.hpu.sludgeDesc')}</p>

                    <ul className="list-disc pl-5 mb-4">
                        <li>
                            <strong>{t('francis.hpu.target')}</strong>
                        </li>
                    </ul>
                </div>

                {/* SOP 3 */}
                <div className="bg-[#003366] text-white p-3 rounded mt-10 mb-4 font-bold text-lg flex items-center gap-2">
                    <span>►</span> {t('francis.hpu.sop3Title')}
                </div>
                <div className="bg-[#fff5f5] border-l-[5px] border-[#d9534f] p-4 my-4 rounded border border-[#dde]">
                    <p className="mb-4">{t('francis.hpu.hammerDesc')}</p>

                    <h3 className="text-[#003366] font-bold mt-4 mb-2">3.1 Zhukovsky Equation</h3>
                    <div className="formula-box">
                        ΔP = ρ · c · Δv
                    </div>
                </div>

            </div>
        </div>
    );
};
