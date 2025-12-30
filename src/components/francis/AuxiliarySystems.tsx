import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export const AuxiliarySystems: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f4f7f6] text-[#333] font-sans pb-12 overflow-x-hidden p-6 md:p-12">
            <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 shadow-xl rounded-lg">

                {/* Header */}
                <header className="border-b-[3px] border-[#003366] pb-5 mb-8 text-center">
                    <h1 className="text-[#003366] text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2">
                        {t('francis.auxiliary.title')}
                    </h1>
                    <h2 className="text-[#0066cc] text-lg font-normal mb-6">
                        {t('francis.auxiliary.subtitle')}
                    </h2>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="inline-flex items-center gap-2 border border-[#0066cc] text-[#0066cc] px-5 py-2 rounded font-bold hover:bg-[#0066cc] hover:text-white transition-all text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('francis.auxiliary.back') || "Return"}</span>
                    </button>
                </header>

                {/* SAFETY MODULE */}
                <div className="bg-[#fff5f5] border-l-[5px] border-[#d9534f] p-4 my-4 rounded">
                    <h3 className="text-[#003366] font-bold text-lg mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-[#d9534f] w-6 h-6" /> {t('francis.auxiliary.s1Title')}
                    </h3>
                    <p className="mb-2">
                        <strong>{t('francis.auxiliary.context')}</strong> <span>{t('francis.auxiliary.s1Desc')}</span>
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>{t('francis.auxiliary.danger')}</strong> <span>{t('francis.auxiliary.s1Li1')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.rule')}</strong> <span>{t('francis.auxiliary.s1Li2')}</span>
                        </li>
                    </ul>
                </div>

                {/* SOP 1 */}
                <div className="bg-[#003366] text-white p-3 rounded mt-10 mb-4 font-bold text-lg flex items-center gap-2">
                    <span>►</span> {t('francis.auxiliary.sop1')}
                </div>
                <div className="bg-[#f0f7ff] border-l-[5px] border-[#0066cc] p-4 my-4 rounded border border-[#dde]">
                    <p className="mb-4">{t('francis.auxiliary.sop1Desc')}</p>

                    <h3 className="text-[#003366] border-l-[4px] border-[#0066cc] pl-3 text-lg font-bold mt-6 mb-2">
                        {t('francis.auxiliary.s2Title')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li>
                            <strong>{t('francis.auxiliary.setpoint')}</strong> <span>{t('francis.auxiliary.s2Li1')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.tooEarly')}</strong> <span>{t('francis.auxiliary.s2Li2')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.tooLate')}</strong> <span>{t('francis.auxiliary.s2Li3')}</span>
                        </li>
                    </ul>

                    <h3 className="text-[#003366] border-l-[4px] border-[#0066cc] pl-3 text-lg font-bold mt-6 mb-2">
                        {t('francis.auxiliary.s3Title')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>{t('francis.auxiliary.dust')}</strong> <span>{t('francis.auxiliary.s3Li1')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.thickness')}</strong> <span>{t('francis.auxiliary.s3Li2')}</span>
                        </li>
                    </ul>
                </div>

                {/* SOP 2 */}
                <div className="bg-[#003366] text-white p-3 rounded mt-10 mb-4 font-bold text-lg flex items-center gap-2">
                    <span>►</span> {t('francis.auxiliary.sop2')}
                </div>
                <div className="bg-[#fff5f5] border-l-[5px] border-[#d9534f] p-4 my-4 rounded border border-[#dde]">
                    <p className="mb-4">{t('francis.auxiliary.sop2Desc')}</p>

                    <h3 className="text-[#003366] border-l-[4px] border-[#0066cc] pl-3 text-lg font-bold mt-6 mb-2">
                        {t('francis.auxiliary.s4Title')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>{t('francis.auxiliary.level1')}</strong> <span>{t('francis.auxiliary.s4Li1')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.level2')}</strong> <span>{t('francis.auxiliary.s4Li2')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.level3')}</strong> <span>{t('francis.auxiliary.s4Li3')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.logic')}</strong> <span>{t('francis.auxiliary.s4Li4')}</span>
                        </li>
                    </ul>
                </div>

                {/* Checklist */}
                <div className="bg-[#003366] text-white p-3 rounded mt-10 mb-4 font-bold text-lg flex items-center gap-2">
                    <span>►</span> {t('francis.auxiliary.summary')}
                </div>
                <div className="bg-[#fafafa] border border-[#dde] p-4 my-4 rounded">
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>{t('francis.auxiliary.weekly')}</strong> <span>{t('francis.auxiliary.weeklyDesc')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.monthly')}</strong> <span>{t('francis.auxiliary.monthlyDesc')}</span>
                        </li>
                        <li>
                            <strong>{t('francis.auxiliary.annually')}</strong> <span>{t('francis.auxiliary.annuallyDesc')}</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
};
