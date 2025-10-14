import React from 'react';

interface HubProps {
  onStartAssessment: () => void;
  onStartInvestorBriefing: () => void;
  onStartStandardOfExcellence: () => void;
  onStartDigitalIntroduction: () => void;
  onStartHPPImprovements: () => void;
  onStartInstallationGuarantee: () => void;
  onStartGenderEquity: () => void;
  onStartHPPBuilder: () => void;
}

const Card: React.FC<{title: string, description: string, onClick: () => void, children: React.ReactNode}> = ({ title, description, onClick, children }) => (
    <div 
        onClick={onClick}
        className="group h-full flex flex-col bg-slate-700/50 p-6 sm:p-8 rounded-xl border border-slate-700 hover:border-cyan-500 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20"
    >
        <div className="mb-4 text-center">
            {children}
        </div>
        <div className='text-center'>
            <h3 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                {title}
            </h3>
            <p className="text-slate-400">
                {description}
            </p>
        </div>
    </div>
);


export const Hub: React.FC<HubProps> = ({ 
  onStartAssessment, 
  onStartInvestorBriefing, 
  onStartStandardOfExcellence, 
  onStartDigitalIntroduction, 
  onStartHPPImprovements, 
  onStartInstallationGuarantee,
  onStartGenderEquity,
  onStartHPPBuilder
}) => {
  return (
    <div className="text-center animate-fade-in">
      
      <div className="flex flex-col items-center gap-10">
        {/* Featured Card */}
        <div className="w-full md:w-2/3 lg:w-1/2">
            <Card title="Digital Introduction" description="Upoznajte se s našim ključnim kompetencijama, uslugama i globalnim iskustvom u hidroenergetskom sektoru." onClick={onStartDigitalIntroduction}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-cyan-400 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                 </svg>
            </Card>
        </div>

        {/* Separator */}
        <div className="w-full border-t border-slate-700"></div>

        {/* Special Two */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Alat za Procjenu Rizika" description="Analizirajte 'Execution Gap' i rane znakove upozorenja kako biste procijenili operativni rizik." onClick={onStartAssessment}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-cyan-400 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </Card>
            <Card title="Info-Centar za Investitore" description="Brzi, digitalni uvid u ključne tehničke i operativne standarde modernih hidroelektrana." onClick={onStartInvestorBriefing}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-cyan-400 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </Card>
        </div>

        {/* Remaining Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card title="Standard Izvrsnosti" description="Istražite našu metodologiju za postizanje vrhunskih rezultata u hidroenergetskim projektima." onClick={onStartStandardOfExcellence}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-cyan-400 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            </Card>
            <Card title="Standard za Montažu" description="Detaljan kodeks za montažu turbina, naglašavajući preciznost, sigurnost i dokumentaciju." onClick={onStartInstallationGuarantee}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-cyan-400 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </Card>
            <Card title="HPP-s Ino Hub" description="Zabilježite i razvijajte svoje inovativne ideje za budućnost hidroenergetskih postrojenja." onClick={onStartHPPImprovements}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-cyan-400 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                 </svg>
            </Card>
            <Card title="Rodna Ravnopravnost" description="Strateški nacrt za inženjering kulture inkluzivnosti i postizanje istinske izvrsnosti." onClick={onStartGenderEquity}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-cyan-400 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </Card>
        </div>

        {/* Separator */}
        <div className="w-full border-t border-slate-700"></div>
        
        {/* HPP Builder */}
         <div className="w-full">
            <div 
                onClick={onStartHPPBuilder}
                className="group flex flex-col sm:flex-row items-center justify-between bg-slate-700/50 p-6 rounded-xl border border-slate-700 hover:border-cyan-500 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20"
            >
                <div className='text-center sm:text-left mb-4 sm:mb-0'>
                    <h3 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                        HPP-s Builder
                    </h3>
                    <p className="text-slate-400">
                        Interaktivno konfigurirajte parametre i dobijte uvid u potrebne komponente za vašu hidroelektranu.
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-400 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-2xl font-bold text-white group-hover:text-cyan-400">&rarr;</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};