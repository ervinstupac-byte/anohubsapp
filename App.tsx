import React, { useState, useCallback, useEffect } from 'react';
// CRITICAL CORRECTION: Adding .tsx extension for all components to resolve a Rollup error
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
import { Feedback } from './components/Feedback.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import RiverWildlife from './components/RiverWildlife.tsx';
import QuestionnaireSummary from './components/QuestionnaireSummary.tsx';
import { InterventionCTA } from './components/InterventionCTA.tsx';
import RevitalizationStrategy from './components/RevitalizationStrategy.tsx';
import DigitalIntegrity from './components/DigitalIntegrity.tsx';
import ContractManagement from './components/ContractManagement.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';
import { RiskProvider } from './contexts/RiskContext.tsx';

// Adding .ts extension for definition files (constants and types)
import { TURBINE_CATEGORIES } from './constants.ts'; 
import type { AppView } from './types.ts';


const AppContent: React.FC = () => {
  const [viewStack, setViewStack] = useState<AppView[]>(['hub']);
  const currentView = viewStack[viewStack.length - 1];
  
  // State for Turbine Detail View
  const [detailTurbineKey, setDetailTurbineKey] = useState<string | null>(null);
  
  // State for Feedback Modal
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  
  // State for Onboarding Flow
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
    if (!hasCompleted) {
        setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
      localStorage.setItem('hasCompletedOnboarding', 'true');
      setShowOnboarding(false);
  };

  const navigateToView = (view: AppView) => {
    setViewStack(prev => [...prev, view]);
  };

  const navigateBack = () => {
    if (viewStack.length > 1) {
      setViewStack(prev => prev.slice(0, -1));
    }
  };

  const navigateToHub = () => {
    setDetailTurbineKey(null);
    setViewStack(['hub']);
  };

  const navigateToTurbineDetail = (turbineKey: string) => {
    setDetailTurbineKey(turbineKey);
    navigateToView('turbineDetail');
  };

  const showQuestionnaireSummary = () => {
      navigateToView('questionnaireSummary');
  };
  
  const getHeaderText = () => {
    switch (currentView) {
      case 'hub':
        return { title: 'AnoHUB', subtitle: "Your center for enforcing the Standard of Excellence in hydropower." };
      case 'riskAssessment':
        return { title: 'HPP Risk Assessment', subtitle: "A diagnostic tool to quantify the Execution Gap and identify systemic risks before they impact LCC." };
      case 'investorBriefing':
        return { title: 'Investor Briefing (KPI Review)', subtitle: "A technical review ensuring KPIs are based on realistic risk assessment and ethical LCC Optimization." };
      case 'standardOfExcellence':
        return { title: 'THE STANDARD OF EXCELLENCE', subtitle: "Masterclass modules for eliminating the Execution Gap through the 0.05 mm/m precision mandate." };
      case 'digitalIntroduction':
        return { title: 'Digital Introduction', subtitle: "Our core principles: enforcing the 0.05 mm/m precision mandate to close the Execution Gap." };
      case 'hppImprovements':
        return { title: 'HPP Ino-Hub', subtitle: "A collaborative hub for innovations that support LCC Optimization and Ecosystem Protection." };
      case 'installationGuarantee':
        return { title: 'Installation Standard', subtitle: "The non-negotiable protocol for closing the Execution Gap and M-E Synergy Gap during assembly." };
      case 'genderEquity':
        return { title: 'Gender Equity in Hydropower', subtitle: "Eliminating the 'Execution Gap' in human capital by applying the same zero-tolerance principles as our 0.05 mm/m technical mandate." };
       case 'hppBuilder':
        return { title: 'HPP Power Calculator', subtitle: "An interactive tool for HPP configuration, guided by the principles of LCC Optimization and resilience to the Execution Gap." };
      case 'turbineDetail':
        const turbineName = detailTurbineKey ? TURBINE_CATEGORIES[detailTurbineKey]?.name : '';
        return { title: `Details: ${turbineName} Turbine`, subtitle: "A technical overview focused on components critical to LCC and vulnerable to the Execution Gap." };
       case 'phaseGuide': 
        return { title: 'Project Phase Guide', subtitle: "Enforcing the Three Postulates: Precision (0.05 mm/m), Risk Mitigation (Execution Gap), and Ethical LCC Optimization." };
       case 'suggestionBox':
        return { title: 'Suggestion & Idea Log', subtitle: "Share your ideas for improving our protocols for precision, risk mitigation, and ethics." };
       case 'riverWildlife':
        return { title: 'River & Wildlife Stewardship', subtitle: "The ethical mandate for Ecosystem Protection: enforcing and documenting E-Flow as a core operational requirement." };
      case 'questionnaireSummary':
        return { title: 'Preliminary Execution Gap Analysis', subtitle: "An initial analysis linking operational symptoms to failures in discipline against our non-negotiable precision standards." };
      case 'revitalizationStrategy':
        return { title: 'Revitalization & Obsolescence', subtitle: "A data-driven framework for ensuring LCC Optimization by closing the M-E Synergy Gap in legacy assets." };
      case 'digitalIntegrity':
        return { title: 'Digital Integrity & Blockchain', subtitle: "Using an immutable ledger to provide irrefutable proof of discipline and close the Execution Gap against legal liability." };
      case 'contractManagement':
        return { title: 'Contract & Legal Risk', subtitle: "Legally mandating the 0.05 mm/m precision standard to protect your warranty from the Execution Gap." };
      default:
        return { title: '', subtitle: ''};
    }
  };
  
  const { title, subtitle } = getHeaderText();

  const navigationContextValue = {
    navigateTo: navigateToView,
    navigateBack,
    navigateToHub,
    navigateToTurbineDetail,
    showFeedbackModal: () => setIsFeedbackVisible(true),
  };

  return (
    <NavigationProvider value={navigationContextValue}>
      <div className="min-h-screen bg-slate-900/90 backdrop-blur-sm text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans print-container">
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

        <div className="w-full max-w-6xl mx-auto">
          <header className="text-center mb-8 no-print">
              <div className="relative h-20 flex items-center justify-center">
                   {currentView !== 'hub' && (
                    <button 
                      onClick={navigateBack} 
                      className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-10"
                      aria-label="Back to previous screen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Back</span>
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

          <main className="bg-slate-800/80 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-500 print-main">
            {currentView === 'hub' && <Hub />}
            
            {currentView === 'riskAssessment' && (
               <Questionnaire onShowSummary={showQuestionnaireSummary} />
            )}
            
            {currentView === 'questionnaireSummary' && <QuestionnaireSummary />}

            {currentView === 'investorBriefing' && <InvestorBriefing turbineCategories={TURBINE_CATEGORIES} />}

            {currentView === 'standardOfExcellence' && <StandardOfExcellence />}

            {currentView === 'digitalIntroduction' && <DigitalIntroduction />}

            {currentView === 'hppImprovements' && <HPPImprovements />}

            {currentView === 'installationGuarantee' && <InstallationGuarantee />}

            {currentView === 'genderEquity' && <GenderEquity />}

            {currentView === 'hppBuilder' && <HPPBuilder />}
            
            {currentView === 'turbineDetail' && detailTurbineKey && <TurbineDetail turbineKey={detailTurbineKey} />}

            {currentView === 'phaseGuide' && <ProjectPhaseGuide />}

            {currentView === 'suggestionBox' && <SuggestionBox />}

            {currentView === 'riverWildlife' && <RiverWildlife />}
            
            {currentView === 'revitalizationStrategy' && <RevitalizationStrategy />}

            {currentView === 'digitalIntegrity' && <DigitalIntegrity />}

            {currentView === 'contractManagement' && <ContractManagement />}

          </main>
          
          <footer className="text-center mt-8 text-sm text-slate-500 no-print">
            <p>&copy; {new Date().getFullYear()} Strategic Risk Mitigation. All rights reserved.</p>
          </footer>
        </div>
        
        <InterventionCTA />

        <button
          onClick={() => setIsFeedbackVisible(true)}
          className="fixed bottom-6 right-6 bg-cyan-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-cyan-500 transition-all transform hover:-translate-y-1 z-50 flex items-center space-x-2 no-print"
          aria-label="Provide Feedback"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-semibold hidden sm:inline">Feedback</span>
        </button>

        {isFeedbackVisible && <Feedback onClose={() => setIsFeedbackVisible(false)} />}
      </div>
    </NavigationProvider>
  );
};

const App: React.FC = () => (
  <QuestionnaireProvider>
    <RiskProvider>
      <AppContent />
    </RiskProvider>
  </QuestionnaireProvider>
);

export default App;