import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
// Putanja: Izlazimo iz 'routes', pa iz 'src' u root po komponente (../../)
import { Spinner } from '../../components/Spinner.tsx'; 
import { TURBINE_CATEGORIES } from '../../constants.ts';

// --- LAZY LOADING KOMPONENTI (Sve putanje su sada ../../) ---
const Hub = React.lazy(() => import('../../components/Hub.tsx').then(module => ({ default: module.Hub })));
const Questionnaire = React.lazy(() => import('../../components/Questionnaire.tsx').then(module => ({ default: module.Questionnaire })));
const QuestionnaireSummary = React.lazy(() => import('../../components/QuestionnaireSummary.tsx'));
const InvestorBriefing = React.lazy(() => import('../../components/InvestorBriefing.tsx').then(module => ({ default: module.InvestorBriefing })));
const StandardOfExcellence = React.lazy(() => import('../../components/StandardOfExcellence.tsx'));
const DigitalIntroduction = React.lazy(() => import('../../components/DigitalIntroduction.tsx'));
const HPPImprovements = React.lazy(() => import('../../components/HPPImprovements.tsx'));
const InstallationGuarantee = React.lazy(() => import('../../components/InstallationGuarantee.tsx'));
const GenderEquity = React.lazy(() => import('../../components/GenderEquity.tsx'));
const HPPBuilder = React.lazy(() => import('../../components/HPPBuilder.tsx'));
const TurbineDetail = React.lazy(() => import('../../components/TurbineDetail.tsx'));
const ProjectPhaseGuide = React.lazy(() => import('../../components/ProjectPhaseGuide.tsx'));
const SuggestionBox = React.lazy(() => import('../../components/SuggestionBox.tsx'));
const RiverWildlife = React.lazy(() => import('../../components/RiverWildlife.tsx'));
const RevitalizationStrategy = React.lazy(() => import('../../components/RevitalizationStrategy.tsx'));
const DigitalIntegrity = React.lazy(() => import('../../components/DigitalIntegrity.tsx'));
const ContractManagement = React.lazy(() => import('../../components/ContractManagement.tsx'));

// Wrappers
const TurbineDetailWrapper = () => {
    const { id } = useParams();
    if (!id) return <div>Turbine not found</div>;
    return <TurbineDetail turbineKey={id} />;
};

const QuestionnaireWrapper = () => {
    return <Questionnaire onShowSummary={() => window.location.hash = '#/questionnaire-summary'} />;
}

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    }>
      <Routes>
        <Route index element={<Hub />} />
        <Route path="risk-assessment" element={<QuestionnaireWrapper />} />
        <Route path="questionnaire-summary" element={<QuestionnaireSummary />} />
        <Route path="investor-briefing" element={<InvestorBriefing turbineCategories={TURBINE_CATEGORIES} />} />
        <Route path="standard-of-excellence" element={<StandardOfExcellence />} />
        <Route path="digital-introduction" element={<DigitalIntroduction />} />
        <Route path="hpp-improvements" element={<HPPImprovements />} />
        <Route path="installation-guarantee" element={<InstallationGuarantee />} />
        <Route path="gender-equity" element={<GenderEquity />} />
        <Route path="hpp-builder" element={<HPPBuilder />} />
        <Route path="turbine/:id" element={<TurbineDetailWrapper />} />
        <Route path="phase-guide" element={<ProjectPhaseGuide />} />
        <Route path="suggestion-box" element={<SuggestionBox />} />
        <Route path="river-wildlife" element={<RiverWildlife />} />
        <Route path="revitalization-strategy" element={<RevitalizationStrategy />} />
        <Route path="digital-integrity" element={<DigitalIntegrity />} />
        <Route path="contract-management" element={<ContractManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};