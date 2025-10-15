import React, { useState, useCallback } from 'react';
// KRITIČNA KOREKCIJA: Dodavanje .tsx ekstenzije za sve komponente za rješavanje Rollup greške
import { Questionnaire } from './components/Questionnaire.tsx';
import { Hub } from './components/Hub.tsx';
import { InvestorBriefing } from './components/InvestorBriefing.tsx';
import StandardOfExcellence from './components/StandardOfExcellence.tsx';
import DigitalIntroduction from './components/DigitalIntroduction.tsx';
import HPPImprovements from './components/HPPImprovements.tsx';
import InstallationGuarantee from './components/InstallationGuarantee.tsx';
import GenderEquity from './components/GenderEquity.tsx';
import HPPBuilder from './components/HPPBuilder.tsx';
import TurbineDetail from './components/TurbineDetail.tsx';
import ProjectPhaseGuide from './components/ProjectPhaseGuide.tsx'; 
import SuggestionBox from './components/SuggestionBox.tsx';

// Dodavanje .ts ekstenzije za datoteke definicije (constants i types)
import { QUESTIONS, TURBINE_CATEGORIES } from './constants.ts'; 
import type { Answers, OperationalData, TurbineType, AppView } from './types.ts';


const App: React.FC = () => {
  const [viewStack, setViewStack] = useState<AppView[]>(['hub']);
  const currentView = viewStack[viewStack.length - 1];
  
  // State for Questionnaire
  const [answers, setAnswers] = useState<Answers>({});
  const [description, setDescription] = useState<string>('');
  const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(null);
  const [operationalData, setOperationalData] = useState<OperationalData>({ head: '', flow: '', pressure: '', output: '' });
  
  // State for Turbine Detail View
  const [detailTurbineKey, setDetailTurbineKey] = useState<string | null>(null);


  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
  }, []);

  const handleOperationalDataChange = useCallback((field: keyof OperationalData, value: string) => {
    setOperationalData(prev => ({ ...prev, [field]: value }));
  }, []);

  const navigateToView = (view: AppView) => {
    setViewStack(prev => [...prev, view]);
  };

  const navigateBack = () => {
    if (viewStack.length > 1) {
      setViewStack(prev => prev.slice(0, -1));
    }
  };

  const navigateToHub = () => {
    setAnswers({});
    setDescription('');
    setSelectedTurbine(null);
    setOperationalData({ head: '', flow: '', pressure: '', output: '' });
    setDetailTurbineKey(null);
    setViewStack(['hub']);
  };
  
  const startAssessment = () => navigateToView('riskAssessment');
  const startInvestorBriefing = () => navigateToView('investorBriefing');
  const startStandardOfExcellence = () => navigateToView('standardOfExcellence');
  const startDigitalIntroduction = () => navigateToView('digitalIntroduction');
  const startHPPImprovements = () => navigateToView('hppImprovements');
  const startInstallationGuarantee = () => navigateToView('installationGuarantee');
  const startGenderEquity = () => navigateToView('genderEquity');
  const startHPPBuilder = () => navigateToView('hppBuilder');
  const startPhaseGuide = () => navigateToView('phaseGuide');
  const startSuggestionBox = () => navigateToView('suggestionBox');

  const navigateToTurbineDetail = (turbineKey: string) => {
    setDetailTurbineKey(turbineKey);
    navigateToView('turbineDetail');
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
        return { title: 'HPP Kalkulator Snage', subtitle: "Interaktivni alat za brzi izračun snage hidroelektrane." };
      case 'turbineDetail':
        const turbineName = detailTurbineKey ? TURBINE_CATEGORIES[detailTurbineKey]?.name : '';
        return { title: `Detalji: ${turbineName} Turbina`, subtitle: "Tehnički pregled ključnih mehaničkih i električnih komponenti." };
       case 'phaseGuide': 
        return { title: 'Vodič Kroz Faze Projekta', subtitle: "Precizne instrukcije za svaku fazu životnog ciklusa postrojenja." };
       case 'suggestionBox':
        return { title: 'Dnevnik Ideja i Prijedloga', subtitle: "Podijelite vaše ideje, prijedloge ili povratne informacije za poboljšanje." };
      default:
        return { title: '', subtitle: ''};
    }
  };
  
  const { title, subtitle } = getHeaderText();

  return (
    <div className="min-h-screen bg-slate-900/90 backdrop-blur-sm text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
            <div className="relative h-20 flex items-center justify-center">
                 {currentView !== 'hub' && (
                  <button 
                    onClick={navigateBack} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-10"
                    aria-label="Povratak na prethodni prozor"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Natrag</span>
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

        <main className="bg-slate-800/80 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-500">
          {currentView === 'hub' && <Hub onStartAssessment={startAssessment} onStartInvestorBriefing={startInvestorBriefing} onStartStandardOfExcellence={startStandardOfExcellence} onStartDigitalIntroduction={startDigitalIntroduction} onStartHPPImprovements={startHPPImprovements} onStartInstallationGuarantee={startInstallationGuarantee} onStartGenderEquity={startGenderEquity} onStartHPPBuilder={startHPPBuilder} onStartPhaseGuide={startPhaseGuide} onStartSuggestionBox={startSuggestionBox} />}
          
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

          {currentView === 'standardOfExcellence' && <StandardOfExcellence onBack={navigateBack} />}

          {currentView === 'digitalIntroduction' && <DigitalIntroduction onBack={navigateBack} />}

          {currentView === 'hppImprovements' && <HPPImprovements onBack={navigateBack} />}

          {currentView === 'installationGuarantee' && <InstallationGuarantee onBack={navigateBack} />}

          {currentView === 'genderEquity' && <GenderEquity onBack={navigateBack} />}

          {currentView === 'hppBuilder' && <HPPBuilder onBack={navigateBack} onSelectTurbineType={navigateToTurbineDetail} />}
          
          {currentView === 'turbineDetail' && detailTurbineKey && <TurbineDetail turbineKey={detailTurbineKey} onBack={navigateBack} />}

          {currentView === 'phaseGuide' && (
            <ProjectPhaseGuide 
              onBack={navigateBack} 
              onStartInvestorBriefing={startInvestorBriefing}
              onStartInstallationGuarantee={startInstallationGuarantee}
              onStartRiskAssessment={startAssessment}
              onStartStandardOfExcellence={startStandardOfExcellence}
            />
          )}

          {currentView === 'suggestionBox' && <SuggestionBox onBack={navigateBack} />}

        </main>
        
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Strateško Ublažavanje Rizika. Sva prava pridržana.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;