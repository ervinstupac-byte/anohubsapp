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
  onStartPhaseGuide: () => void;
  onStartSuggestionBox: () => void;
}

// A more premium card component
const Card: React.FC<{title: string, description: string, onClick: () => void, children: React.ReactNode, isCritical?: boolean}> = ({ title, description, onClick, children, isCritical = false }) => (
    <div 
        onClick={onClick}
        className={`group h-full flex flex-col bg-slate-800/80 p-6 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl backdrop-blur-sm 
        ${isCritical 
            ? 'border-cyan-500/70 hover:border-cyan-400 hover:shadow-cyan-400/30' 
            : 'border-slate-700 hover:border-cyan-500/50 hover:shadow-cyan-500/25'
        }`}
    >
        <div className="mb-4 text-cyan-400">
            {children}
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors duration-300">
            {title}
        </h3>
        <p className="text-sm text-slate-400 flex-grow">
            {description}
        </p>
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
  onStartHPPBuilder,
  onStartPhaseGuide,
  onStartSuggestionBox
}) => {
   const menuItems = [
    {
      id: 'assessment',
      onClick: onStartAssessment,
      title: "Alat za Procjenu Rizika",
      description: "Analizirajte 'Execution Gap' i rane znakove upozorenja kako biste procijenili operativni rizik.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      isCritical: true,
    },
    {
      id: 'phaseGuide',
      onClick: onStartPhaseGuide,
      title: "Vodič Kroz Faze Projekta",
      description: "Precizne instrukcije za svaku fazu životnog ciklusa postrojenja, od ideje do revitalizacije.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      isCritical: true,
    },
     {
      id: 'installation',
      onClick: onStartInstallationGuarantee,
      title: "Standard za Montažu",
      description: "Detaljan kodeks za montažu turbina, naglašavajući preciznost, sigurnost i dokumentaciju.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
      isCritical: true,
    },
    {
      id: 'intro',
      onClick: onStartDigitalIntroduction,
      title: "Digital Introduction",
      description: "Upoznajte se s našim ključnim kompetencijama, uslugama i globalnim iskustvom.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
      isCritical: false,
    },
    {
      id: 'builder',
      onClick: onStartHPPBuilder,
      title: "HPP-s Builder",
      description: "Interaktivno konfigurirajte parametre i dobijte uvid u komponente za vašu hidroelektranu.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      isCritical: false,
    },
    {
      id: 'investor',
      onClick: onStartInvestorBriefing,
      title: "Info-Centar za Investitore",
      description: "Brzi, digitalni uvid u ključne tehničke i operativne standarde modernih hidroelektrana.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      isCritical: false,
    },
    {
      id: 'excellence',
      onClick: onStartStandardOfExcellence,
      title: "Standard Izvrsnosti",
      description: "Istražite našu metodologiju za postizanje vrhunskih rezultata u hidroenergetskim projektima.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
      isCritical: false,
    },
    {
      id: 'improvements',
      onClick: onStartHPPImprovements,
      title: "HPP-s Ino Hub",
      description: "Zabilježite i razvijajte svoje inovativne ideje za budućnost hidroenergetskih postrojenja.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      isCritical: false,
    },
    {
      id: 'equity',
      onClick: onStartGenderEquity,
      title: "Rodna Ravnopravnost",
      description: "Strateški nacrt za inženjering kulture inkluzivnosti i postizanje istinske izvrsnosti.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      isCritical: false,
    },
     {
      id: 'suggestion',
      onClick: onStartSuggestionBox,
      title: "Prijedlog / Ideja",
      description: "Imate ideju ili povratnu informaciju? Podijelite je s nama putem jednostavne forme.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      isCritical: false,
    }
  ];

  const criticalItems = menuItems.filter(item => item.isCritical);
  const standardItems = menuItems.filter(item => !item.isCritical);

  return (
    <div className="animate-fade-in space-y-12">
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-300 border-b-2 border-cyan-500/30 pb-3">Ključni Strateški Alati</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {criticalItems.map((item) => (
                    <Card key={item.id} title={item.title} description={item.description} onClick={item.onClick} isCritical={item.isCritical}>
                        {item.icon}
                    </Card>
                ))}
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-300 border-b-2 border-slate-700/50 pb-3">Ostali Resursi i Alati</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {standardItems.map((item) => (
                    <Card key={item.id} title={item.title} description={item.description} onClick={item.onClick} isCritical={item.isCritical}>
                        {item.icon}
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
};