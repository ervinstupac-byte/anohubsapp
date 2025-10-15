import React from 'react';
import { BackButton } from './BackButton';
import { turbineDetailData } from '../data/turbineDetailData';
import type { TurbineDetail, TurbineComponent } from '../data/turbineDetailData';

interface TurbineDetailProps {
    turbineKey: string;
    onBack: () => void;
}

const criticalityStyles = {
    High: 'border-red-500/50 bg-red-500/10 text-red-300',
    Medium: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
    Low: 'border-green-500/50 bg-green-500/10 text-green-300',
};

const ComponentCard: React.FC<TurbineComponent> = ({ name, description, criticality }) => (
    <div className={`p-4 border rounded-lg ${criticalityStyles[criticality]}`}>
        <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-slate-100">{name}</h4>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${criticalityStyles[criticality]}`}>{criticality}</span>
        </div>
        <p className="text-sm text-slate-400">{description}</p>
    </div>
);


const TurbineDetail: React.FC<TurbineDetailProps> = ({ turbineKey, onBack }) => {
    const data: TurbineDetail | undefined = turbineDetailData[turbineKey];

    if (!data) {
        return (
            <div className="text-center">
                <p className="text-red-400">Podaci za odabranu turbinu nisu pronađeni.</p>
                <BackButton onClick={onBack} text="Natrag na Kalkulator" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <BackButton onClick={onBack} text="Natrag na Kalkulator" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mechanical Components */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-500/50 pb-2">Mehaničke Komponente</h3>
                    {data.mechanical.map((comp) => (
                        <ComponentCard key={comp.name} {...comp} />
                    ))}
                </div>

                {/* Electrical Components */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-500/50 pb-2">Električne Komponente</h3>
                    {data.electrical.map((comp) => (
                        <ComponentCard key={comp.name} {...comp} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TurbineDetail;