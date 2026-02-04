import React from 'react';
import { ShieldCheck, Award, Binary } from 'lucide-react';

interface SovereignCertificateProps {
    assetName: string;
    assetType: string;
    commissionDate: string;
    serialNumber: string;
}

export const SovereignCertificate: React.FC<SovereignCertificateProps> = ({
    assetName,
    assetType,
    commissionDate,
    serialNumber
}) => {
    return (
        <div className="bg-slate-50 text-slate-900 p-8 max-w-2xl mx-auto border-[12px] border-slate-900 shadow-2xl relative overflow-hidden font-serif">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <ShieldCheck className="w-96 h-96" />
            </div>

            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
                <div className="flex justify-center mb-4">
                    <Award className="w-16 h-16 text-slate-900" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-widest mb-2">Sovereign Integrity</h1>
                <p className="text-sm font-sans tracking-[0.2em] text-slate-600">CERTIFICATE OF PHYSICS COMPLIANCE</p>
            </div>

            {/* Body */}
            <div className="space-y-6 text-center mb-8">
                <p className="text-lg italic font-serif">This certifies that the asset known as</p>
                <div className="text-3xl font-bold font-sans uppercase border-b border-dashed border-slate-400 inline-block px-8 pb-1">
                    {assetName}
                </div>

                <p className="text-lg italic">
                    has been forged under the strict protocols of <strong className="font-bold">MONOLIT V1.0</strong> and is verified to meet the Standard of Excellence (0.05 mm/m).
                </p>

                <div className="grid grid-cols-2 gap-8 text-left max-w-md mx-auto mt-8 font-sans text-sm">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Asset Type</p>
                        <p className="font-bold">{assetType}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Commission Date</p>
                        <p className="font-bold">{commissionDate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Serial Hash</p>
                        <p className="font-mono text-xs break-all">{serialNumber}</p>
                    </div>
                </div>
            </div>

            {/* Footer / Neural Sig */}
            <div className="border-t-2 border-slate-900 pt-6 flex justify-between items-end">
                <div className="text-center">
                    <div className="font-script text-2xl text-slate-800 mb-1">Neural Core</div>
                    <div className="h-px w-32 bg-slate-900 mx-auto" />
                    <p className="text-[10px] uppercase font-bold mt-1 text-slate-500">Digital Signature</p>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-slate-900 font-mono text-xs border border-slate-900 px-2 py-1 rounded-sm">
                        <Binary className="w-3 h-3" />
                        <span>VERIFIED: MONOLIT-NC15</span>
                    </div>
                </div>
            </div>

            {/* Corner Decor */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-900" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-900" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-900" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-900" />
        </div>
    );
};
