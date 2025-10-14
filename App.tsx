import React, { useState, useCallback } from 'react';
import { Questionnaire } from './components/Questionnaire';
import { Hub } from './components/Hub';
import { InvestorBriefing } from './components/InvestorBriefing';
import StandardOfExcellence from './components/StandardOfExcellence';
import DigitalIntroduction from './components/DigitalIntroduction';
import HPPImprovements from './components/HPPImprovements';
import InstallationGuarantee from './components/InstallationGuarantee';
import GenderEquity from './components/GenderEquity';
import HPPBuilder from './components/HPPBuilder';
import { QUESTIONS, TURBINE_CATEGORIES } from './constants';
import type { Answers, OperationalData, TurbineType } from './types';

type AppView = 'hub' | 'riskAssessment' | 'investorBriefing' | 'standardOfExcellence' | 'digitalIntroduction' | 'hppImprovements' | 'installationGuarantee' | 'genderEquity' | 'hppBuilder';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('hub');
  
  // State for Questionnaire
  const [answers, setAnswers] = useState<Answers>({});
  const [description, setDescription] = useState<string>('');
  const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(null);
  const [operationalData, setOperationalData] = useState<OperationalData>({ head: '', flow: '', pressure: '', output: '' });


  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
  }, []);

  const handleOperationalDataChange = useCallback((field: keyof OperationalData, value: string) => {
    setOperationalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const navigateToHub = () => {
    setAnswers({});
    setDescription('');
    setSelectedTurbine(null);
    setOperationalData({ head: '', flow: '', pressure: '', output: '' });
    setCurrentView('hub');
  };
  
  const startAssessment = () => {
    setCurrentView('riskAssessment');
  };

  const startInvestorBriefing = () => {
    setCurrentView('investorBriefing');
  };
  
  const startStandardOfExcellence = () => {
    setCurrentView('standardOfExcellence');
  };

  const startDigitalIntroduction = () => {
    setCurrentView('digitalIntroduction');
  };

  const startHPPImprovements = () => {
    setCurrentView('hppImprovements');
  };

  const startInstallationGuarantee = () => {
    setCurrentView('installationGuarantee');
  };

  const startGenderEquity = () => {
    setCurrentView('genderEquity');
  };
  
  const startHPPBuilder = () => {
    setCurrentView('hppBuilder');
  };


  const getHeaderText = () => {
    switch (currentView) {
      case 'hub':
        return { title: 'AnoHUB', subtitle: "Dobrodošli u centar za strateško upravljanje rizicima HPP-a." };
      case 'riskAssessment':
        return { title: 'Procjena Rizika HPP-a', subtitle: "Ispunite upitnik kako biste dobili stručnu analizu 'Execution Gap-a' u vašem postrojenju." };
      case 'investorBriefing':
        return { title: 'Briefing za Investitore (Revizija KPI)', subtitle: "Formalni tehnički pregled ključnih pokazatelja uspješnosti za dubinsku analizu." };
      case 'standardOfExcellence':
        return { title: 'Standard Izvrsnosti', subtitle: "Holistička metodologija za uspjeh projekata u hidroenergiji." };
      case 'digitalIntroduction':
        return { title: 'Digital Introduction', subtitle: "Sažetak ključnih kompetencija, globalnog iskustva i profesionalnih usluga." };
      case 'hppImprovements':
        return { title: 'HPP-s Ino Hub', subtitle: "Zabilježite, kategorizirajte i razvijajte svoje inovativne ideje za poboljšanja hidroelektrana." };
      case 'installationGuarantee':
        return { title: 'Standard za Montažu', subtitle: "Sveobuhvatni kodeks za montažu Kaplan, Francis i Pelton turbina." };
      case 'genderEquity':
        return { title: 'Rodna Ravnopravnost u Hidroenergiji', subtitle: "Inženjering kulture inkluzivnosti: strateški nacrt." };
       case 'hppBuilder':
        return { title: 'HPP-s Builder', subtitle: "Interaktivni alat za konfiguraciju i analizu parametara hidroelektrana." };
      default:
        return { title: '', subtitle: ''};
    }
  };
  
  const { title, subtitle } = getHeaderText();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
            <div className="relative h-20 flex items-center justify-center">
                 {currentView !== 'hub' && (
                  <button 
                    onClick={navigateToHub} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-10"
                    aria-label="Povratak na izbornik"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Izbornik</span>
                  </button>
                )}
                <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">
                    {title}
                </h1>
            </div>
          <p className="mt-2 text-lg text-slate-400 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </header>

        <main className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-500">
          {currentView === 'hub' && <Hub onStartAssessment={startAssessment} onStartInvestorBriefing={startInvestorBriefing} onStartStandardOfExcellence={startStandardOfExcellence} onStartDigitalIntroduction={startDigitalIntroduction} onStartHPPImprovements={startHPPImprovements} onStartInstallationGuarantee={startInstallationGuarantee} onStartGenderEquity={startGenderEquity} onStartHPPBuilder={startHPPBuilder} />}
          
          {currentView === 'riskAssessment' && (
             <Questionnaire
                questions={QUESTIONS}
                answers={answers}
                description={description}
                onAnswerChange={handleAnswerChange}
                onDescriptionChange={handleDescriptionChange}
                turbineCategories={TURBINE_CATEGORIES}
                selectedTurbine={selectedTurbine}
                onSelectTurbine={setSelectedTurbine}
                operationalData={operationalData}
                onOperationalDataChange={handleOperationalDataChange}
              />
          )}

          {currentView === 'investorBriefing' && <InvestorBriefing turbineCategories={TURBINE_CATEGORIES} />}

          {currentView === 'standardOfExcellence' && <StandardOfExcellence onBack={navigateToHub} />}

          {currentView === 'digitalIntroduction' && <DigitalIntroduction onBack={navigateToHub} />}

          {currentView === 'hppImprovements' && <HPPImprovements onBack={navigateToHub} />}

          {currentView === 'installationGuarantee' && <InstallationGuarantee onBack={navigateToHub} />}

          {currentView === 'genderEquity' && <GenderEquity onBack={navigateToHub} />}

          {currentView === 'hppBuilder' && <HPPBuilder turbineCategories={TURBINE_CATEGORIES} onBack={navigateToHub} />}

        </main>
        
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Strateško Ublažavanje Rizika. Sva prava pridržana.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;