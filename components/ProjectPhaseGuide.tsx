import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';

// Interface za sve navigacijske funkcije koje dolaze iz App.tsx
interface ProjectPhaseGuideProps {
    onBack: () => void;
    onStartInvestorBriefing: () => void;
    onStartInstallationGuarantee: () => void;
    onStartRiskAssessment: () => void;
    onStartStandardOfExcellence: () => void;
}

const phasesData = [
    {
        id: 'planning',
        icon: '🔭',
        title: '1. Istraživanje i Planiranje',
        objectives: [
            'Potvrda tehničke i ekonomske izvodljivosti projekta.',
            'Osiguravanje financiranja i ishođenje ključnih dozvola.',
            'Definiranje opsega, proračuna i vremenskog okvira projekta.'
        ],
        protocols: [
            { text: 'Studija izvodljivosti (Feasibility Study)', action: null },
            { text: 'Procjena utjecaja na okoliš (EIA)', action: null },
            { text: 'Briefing za investitore i tehnička revizija (KPI)', action: 'onStartInvestorBriefing' },
        ],
        risks: [
            'Netočni hidrološki podaci dovode do pogrešne procjene proizvodnje.',
            'Kašnjenja u ishođenju dozvola blokiraju početak radova.',
            'Podcjenjivanje troškova (CAPEX) ugrožava financijsku stabilnost.',
        ],
        tools: ['HPP Builder Alat', 'Softver za hidrološko modeliranje (npr. HEC-RAS)', 'Alati za financijsko modeliranje i LCOE analizu']
    },
    {
        id: 'construction',
        icon: '🏗️',
        title: '2. Izgradnja i Montaža',
        objectives: [
            'Izvođenje projekta unutar zadanog proračuna i rokova.',
            'Osiguravanje najviše kvalitete izvedbe i montaže.',
            'Strogo pridržavanje HSE (Zdravlje, Sigurnost, Okoliš) standarda.'
        ],
        protocols: [
            { text: 'Standard za Besprijekornu Montažu', action: 'onStartInstallationGuarantee' },
            { text: 'Lasersko poravnanje osovine (<0.1mm)', action: 'onStartInstallationGuarantee' },
            { text: 'Digitalni QC protokoli (3D skeniranje)', action: null },
        ],
        risks: [
            'Jaz između plana i izvedbe ("Execution Gap") uzrokuje sistemske greške.',
            'Problemi u lancu opskrbe (kašnjenje opreme).',
            'Nekvalitetna izvedba radova koja dovodi do preuranjenih kvarova.',
        ],
        tools: ['Alati za lasersko poravnanje', 'Softver za upravljanje projektima (npr. Primavera)', 'Oprema za 3D skeniranje i digitalnu verifikaciju']
    },
    {
        id: 'maintenance',
        icon: '⚙️',
        title: '3. Održavanje i Dijagnostika',
        objectives: [
            'Maksimiziranje dostupnosti i pouzdanosti postrojenja (>99%).',
            'Optimizacija performansi i efikasnosti.',
            'Prevencija katastrofalnih kvarova kroz prediktivno održavanje.'
        ],
        protocols: [
            { text: 'Procjena Operativnog Rizika', action: 'onStartRiskAssessment' },
            { text: 'Snimanje "Otiska Prsta" vibracija (Baseline)', action: null },
            { text: 'Analiza korijenskog uzroka kvara (RCA)', action: null },
        ],
        risks: [
            'Neplanirani zastoji uzrokuju značajne gubitke u proizvodnji.',
            'Kavitacija i erozija smanjuju efikasnost i životni vijek turbine.',
            'Katastrofalni kvar ležajeva ili izolacije generatora.',
        ],
        tools: [
            'Napredni sistemi za analizu vibracija (npr. Emerson CSI, Bently Nevada)',
            'Termovizijske kamere za inspekciju električnih i mehaničkih komponenti',
            'SCADA sustavi integrirani s platformama za prediktivnu analitiku (AI Monitoring)',
            'Interni Alat za Procjenu Rizika za dubinsku, strukturiranu analizu simptoma.'
        ]
    },
    {
        id: 'strategic',
        icon: '🧠',
        title: '4. Strateško Upravljanje',
        objectives: [
            'Dugoročno upravljanje imovinom (Asset Management).',
            'Implementacija kulture kontinuiranog poboljšanja.',
            'Osiguravanje usklađenosti s budućim tehnološkim i regulatornim promjenama.'
        ],
        protocols: [
            { text: 'Implementacija Standarda Izvrsnosti', action: 'onStartStandardOfExcellence' },
            { text: 'Analiza životnog ciklusa troškova (LCC)', action: null },
            { text: 'Strategija Digitalnog Blizanca (Digital Twin)', action: 'onStartStandardOfExcellence' },
        ],
        risks: [
            'Tehnološka zastarjelost opreme i upravljačkih sustava.',
            'Promjene u tržišnim uvjetima i regulativi.',
            'Gubitak institucionalnog znanja odlaskom iskusnog osoblja.',
        ],
        tools: ['Platforme za upravljanje imovinom (APM)', 'Softver za Digital Twin simulacije', 'Sustavi za upravljanje znanjem (Knowledge Management)']
    }
];

// Pomoćna komponenta za sekciju Elektro usluga
const ElectroSection: React.FC = () => (
    <div className="bg-slate-800 border border-cyan-500/50 p-6 rounded-xl mt-10">
        <h3 className="text-2xl font-bold text-yellow-400 mb-3">M-E Sinergija: Elektro Usluge (HOAI Standard)</h3>
        <p className="text-slate-300 mb-4">
            Rizik nije samo mašinski. Greške u elektro-projektovanju (automatizacija, zaštita) direktno uzrokuju mehanički stres. Naš audit osigurava da je vaša elektro-dokumentacija normativno besprijekorna.
        </p>
        <a 
            href="./downloads/EH.pdf" 
            target="_blank" 
            className="inline-flex items-center space-x-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors"
            aria-label="Preuzmite detaljan pregled Elektro usluga po HOAI standardu"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3"/><path d="M4 11L12 3 20 11"/><path d="M20 21H4"/></svg>
            <span>Preuzmite HOAI Elektro-Usluge (PDF)</span>
        </a>
    </div>
);

const AccordionSection: React.FC<{ 
    phase: typeof phasesData[0]; 
    isOpen: boolean; 
    onClick: () => void;
    actions: Record<string, () => void>;
}> = ({ phase, isOpen, onClick, actions }) => (
    <div className="border border-slate-700 rounded-lg bg-slate-800/50 mb-4 overflow-hidden">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 hover:bg-slate-700/50 transition-colors"
            aria-expanded={isOpen}
        >
            <div className="flex items-center">
                <span className="text-3xl mr-4">{phase.icon}</span>
                <h3 className="text-xl font-bold text-cyan-400">{phase.title}</h3>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        {isOpen && (
            <div className="p-6 pt-0 text-slate-300 space-y-6 animate-fade-in">
                {/* Key Objectives */}
                <div>
                    <h4 className="font-bold text-slate-100 mb-2">Ključni Ciljevi</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                        {phase.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                </div>
                {/* Main Protocols */}
                <div>
                    <h4 className="font-bold text-slate-100 mb-2">Glavni Protokoli</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                        {phase.protocols.map((proto, i) => (
                            <li key={i}>
                                {proto.text}
                                {proto.action && actions[proto.action] && (
                                    <button onClick={actions[proto.action]} className="ml-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline">(Prikaži Alat)</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Critical Risk Points */}
                <div>
                    <h4 className="font-bold text-red-400 mb-2">Kritične Točke Rizika</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                        {phase.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                </div>
                 {/* Suggested Tools */}
                <div>
                    <h4 className="font-bold text-yellow-400 mb-2">Predloženi Alati</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                        {phase.tools.map((tool, i) => <li key={i}>{tool}</li>)}
                    </ul>
                </div>
            </div>
        )}
    </div>
);


const ProjectPhaseGuide: React.FC<ProjectPhaseGuideProps> = (props) => {
    const { 
        onBack, 
        onStartInvestorBriefing, 
        onStartInstallationGuarantee, 
        onStartRiskAssessment, 
        onStartStandardOfExcellence 
    } = props;
    
    const [openSectionId, setOpenSectionId] = useState<string | null>(phasesData[0]?.id ?? null);

    const handleToggleSection = (sectionId: string) => {
        setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
    };

    const navActions = {
      onStartInvestorBriefing,
      onStartInstallationGuarantee,
      onStartRiskAssessment,
      onStartStandardOfExcellence,
    };

    return (
        <div className="animate-fade-in">
            <BackButton onClick={onBack} text="Natrag na HUB" />
            <div className="text-center mb-8">
                <p className="mt-2 text-xl text-slate-400 max-w-3xl mx-auto">
                    Proširite svaku fazu projekta kako biste dobili detaljne protokole, ciljeve i alate.
                </p>
            </div>

            {/* Accordion */}
            <div>
                {phasesData.map(phase => (
                    <AccordionSection 
                        key={phase.id}
                        phase={phase}
                        isOpen={openSectionId === phase.id}
                        onClick={() => handleToggleSection(phase.id)}
                        actions={navActions}
                    />
                ))}
            </div>
            
            <ElectroSection />
        </div>
    );
};

export default ProjectPhaseGuide;