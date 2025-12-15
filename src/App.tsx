import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, useLocation, useNavigate, Route, Routes, useParams } from 'react-router-dom';

// --- 1. KONTEKSTI (STATE MANAGEMENT) ---
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';
import { RiskProvider } from './contexts/RiskContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AssetProvider } from './contexts/AssetContext.tsx';

// --- 2. EAGER COMPONENTS (UI & CORE) ---
import { Login } from './components/Login.tsx';
import { Feedback } from './components/Feedback.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { InterventionCTA } from './components/InterventionCTA.tsx';
import { Spinner } from './components/Spinner.tsx';
import { supabase } from './services/supabaseClient.ts';
import { LanguageSelector } from './components/LanguageSelector.tsx';

// --- 3. ASSETS & TYPES ---
import bgImage from './assets/digital_cfd_mesh.png';
import type { AppView } from './types.ts';
import { TURBINE_CATEGORIES } from './constants.ts';

// --- 4. LAZY LOADED MODULES ---
const Hub = React.lazy(() => import('./components/Hub.tsx').then((m: any) => ({ default: m.Hub || m.default })));
const UserProfile = React.lazy(() => import('./components/UserProfile.tsx').then((m: any) => ({ default: m.UserProfile || m.default })));
const GlobalMap = React.lazy(() => import('./components/GlobalMap.tsx').then((m: any) => ({ default: m.GlobalMap || m.default })));

// Any cast components (za izbjegavanje TS grešaka s propsima)
const RiskAssessment = React.lazy(() => import('./components/RiskAssessment.tsx').then((m: any) => ({ default: m.RiskAssessment || m.default }))) as any;
const InvestorBriefing = React.lazy(() => import('./components/InvestorBriefing.tsx').then((m: any) => ({ default: m.InvestorBriefing || m.default }))) as any;
const TurbineDetail = React.lazy(() => import('./components/TurbineDetail.tsx').then((m: any) => ({ default: m.TurbineDetail || m.default }))) as any;

const QuestionnaireSummary = React.lazy(() => import('./components/QuestionnaireSummary.tsx').then((m: any) => ({ default: m.QuestionnaireSummary || m.default })));
const RiskReport = React.lazy(() => import('./components/RiskReport.tsx').then((m: any) => ({ default: m.RiskReport || m.default })));
const StandardOfExcellence = React.lazy(() => import('./components/StandardOfExcellence.tsx').then((m: any) => ({ default: m.StandardOfExcellence || m.default })));
const DigitalIntroduction = React.lazy(() => import('./components/DigitalIntroduction.tsx').then((m: any) => ({ default: m.DigitalIntroduction || m.default })));
const HPPImprovements = React.lazy(() => import('./components/HPPImprovements.tsx').then((m: any) => ({ default: m.HPPImprovements || m.default })));
const InstallationGuarantee = React.lazy(() => import('./components/InstallationGuarantee.tsx').then((m: any) => ({ default: m.InstallationGuarantee || m.default })));
const GenderEquity = React.lazy(() => import('./components/GenderEquity.tsx').then((m: any) => ({ default: m.GenderEquity || m.default })));
const HPPBuilder = React.lazy(() => import('./components/HPPBuilder.tsx').then((m: any) => ({ default: m.HPPBuilder || m.default })));
const ProjectPhaseGuide = React.lazy(() => import('./components/ProjectPhaseGuide.tsx').then((m: any) => ({ default: m.ProjectPhaseGuide || m.default })));
const RiverWildlife = React.lazy(() => import('./components/RiverWildlife.tsx').then((m: any) => ({ default: m.RiverWildlife || m.default })));
const RevitalizationStrategy = React.lazy(() => import('./components/RevitalizationStrategy.tsx').then((m: any) => ({ default: m.RevitalizationStrategy || m.default })));
const DigitalIntegrity = React.lazy(() => import('./components/DigitalIntegrity.tsx').then((m: any) => ({ default: m.DigitalIntegrity || m.default })));
const ContractManagement = React.lazy(() => import('./components/ContractManagement.tsx').then((m: any) => ({ default: m.ContractManagement || m.default })));
const ComponentLibrary = React.lazy(() => import('./components/ComponentLibrary.tsx').then((m: any) => ({ default: m.ComponentLibrary || m.default })));

// --- 5. ROUTE WRAPPERS ---
const TurbineDetailWrapper = () => {
    const { id } = useParams();
    if (!id) return <div className="text-center text-slate-400 mt-10">Turbine not found</div>;
    return <TurbineDetail turbineKey={id} />;
};

const QuestionnaireWrapper = () => {
    return <RiskAssessment onShowSummary={() => window.location.hash = '#/questionnaire-summary'} />;
};

// --- 6. HEADER LOGIC ---
const getHeaderInfo = (pathname: string): { title: string; subtitle: string } => {
    const path = pathname.startsWith('/') ? pathname.slice(1) : pathname;

    if (path.startsWith('turbine/')) {
        const turbineKey = path.split('/')[1];
        const turbineName = TURBINE_CATEGORIES[turbineKey]?.name || 'Turbine';
        return {
            title: `Details: ${turbineName}`,
            subtitle: "Technical overview focused on Execution Gap vulnerabilities."
        };
    }

    const titles: Record<string, {title: string, subtitle: string}> = {
        '': { title: '', subtitle: "" }, // Empty for Hub
        'profile': { title: 'Engineer Profile', subtitle: "Identity & Access Management." },
        'map': { title: 'Global Operations Map', subtitle: "Real-time geospatial intelligence & asset status." },
        'risk-assessment': { title: 'HPP Risk Assessment', subtitle: "Diagnostic tool to identify systemic risks." },
        'risk-report': { title: 'Risk Analysis Report', subtitle: "Generated Executive Summary." },
        'investor-briefing': { title: 'Investor Briefing', subtitle: "Financial KPIs and Risk Impact Analysis." },
        'standard-of-excellence': { title: 'THE STANDARD OF EXCELLENCE', subtitle: "Masterclass modules for eliminating the Execution Gap." },
        'digital-introduction': { title: 'Digital Introduction', subtitle: "Core principles: enforcing the 0.05 mm/m precision mandate." },
        'hpp-improvements': { title: 'HPP Ino-Hub', subtitle: "Collaborative hub for innovations supporting LCC Optimization." },
        'installation-guarantee': { title: 'Installation Standard', subtitle: "Non-negotiable protocol for closing the Execution Gap during assembly." },
        'gender-equity': { title: 'Gender Equity', subtitle: "Inclusive strategies for human capital." },
        'hpp-builder': { title: 'HPP Design Studio', subtitle: "Physics-based turbine selection and calculation." },
        'phase-guide': { title: 'Project Phase Guide', subtitle: "Enforcing the Three Postulates: Precision, Risk Mitigation, and Ethics." },
        'river-wildlife': { title: 'River & Wildlife', subtitle: "Ethical mandate for Ecosystem Protection." },
        'questionnaire-summary': { title: 'Execution Gap Analysis', subtitle: "Linking operational symptoms to failures in discipline." },
        'revitalization-strategy': { title: 'Revitalization Strategy', subtitle: "Closing the M-E Synergy Gap in legacy assets." },
        'digital-integrity': { title: 'Digital Integrity', subtitle: "Immutable ledger providing irrefutable proof." },
        'contract-management': { title: 'Contract & Legal', subtitle: "Warranty protection via data compliance." },
        'library': { title: 'Component Library', subtitle: "Technical Encyclopedia of KPIs & Failure Modes." },
    };
    return titles[path] || { title: 'AnoHUB', subtitle: "Standard of Excellence" };
};

// --- 7. AUTH GUARD ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]"><Spinner /></div>;
    if (!user) return <Login />;
    return <>{children}</>;
};

// --- 8. APP LAYOUT ---
const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [displayName, setDisplayName] = useState('Engineer');

    const { title, subtitle } = getHeaderInfo(location.pathname);
    const isHub = location.pathname === '/';
    const { signOut, user } = useAuth();

    const currentView = (location.pathname === '/' ? 'hub' : location.pathname.substring(1)) as AppView;

    useEffect(() => {
        const fetchProfileName = async () => {
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (data?.full_name) {
                    setDisplayName(data.full_name);
                } else if (user.user_metadata?.full_name) {
                    setDisplayName(user.user_metadata.full_name);
                } else {
                    setDisplayName(user.email?.split('@')[0] || 'Engineer');
                }
            }
        };
        fetchProfileName();
    }, [user]);

    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        if (!hasCompleted) setShowOnboarding(true);
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const navigationContextValue = {
        currentView,
        showOnboarding,
        completeOnboarding: handleOnboardingComplete,
        navigateTo: (view: AppView) => {
            const routeMap: Record<string, string> = {
                'hub': '/',
                'globalMap': '/map',
                'riskAssessment': '/risk-assessment',
                'investorBriefing': '/investor-briefing',
                'standardOfExcellence': '/standard-of-excellence',
                'digitalIntroduction': '/digital-introduction',
                'hppImprovements': '/hpp-improvements',
                'installationGuarantee': '/installation-guarantee',
                'genderEquity': '/gender-equity',
                'hppBuilder': '/hpp-builder',
                'phaseGuide': '/phase-guide',
                'riverWildlife': '/river-wildlife',
                'questionnaireSummary': '/questionnaire-summary',
                'riskReport': '/risk-report',
                'revitalizationStrategy': '/revitalization-strategy',
                'digitalIntegrity': '/digital-integrity',
                'contractManagement': '/contract-management',
                'turbineDetail': '/turbine',
                'library': '/library'
            };
            navigate(routeMap[view] || '/');
        },
        navigateBack: () => navigate(-1),
        navigateToHub: () => navigate('/'),
        navigateToTurbineDetail: (turbineKey: string) => navigate(`/turbine/${turbineKey}`),
        showFeedbackModal: () => setIsFeedbackVisible(true),
    };

    return (
        <NavigationProvider value={navigationContextValue}>
            <div className="min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden flex flex-col"
                style={{
                    backgroundColor: '#0f172a',
                    backgroundImage: `
                        radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.08) 0%, transparent 40%),
                        linear-gradient(to bottom, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.98)),
                        url(${bgImage})
                    `,
                    backgroundSize: '100% 100%, cover',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center top, center'
                }}
            >
                {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
                
                {/* --- HEADER (Lebdeći) --- */}
                <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/5 bg-[#0f172a]/70 supports-[backdrop-filter]:bg-[#0f172a]/30">
                    <div className="max-w-8xl mx-auto px-6 h-16 flex items-center justify-between">
                        {/* LEFT SECTION */}
                        <div className="flex items-center gap-4">
                            {!isHub && (
                                <button onClick={() => navigate(-1)} className="group flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
                                    <span className="text-sm group-hover:-translate-x-0.5 transition-transform text-slate-300">←</span>
                                </button>
                            )}
                            
                            {!isHub && (
                                <div className="hidden md:block">
                                    <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
                                    {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
                                </div>
                            )}
                        </div>

                        {/* RIGHT SECTION */}
                        <div className="flex items-center gap-4">
                            <LanguageSelector />
                            
                            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>
                            
                            <div className="hidden md:flex flex-col items-end cursor-pointer" onClick={() => navigate('/profile')}>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Logged in as</span>
                                <span className="text-xs font-bold text-cyan-400 hover:text-white transition-colors">{displayName}</span>
                            </div>
                            
                            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-500/20 transition-all">
                                Exit
                            </button>
                        </div>
                    </div>
                </header>

                {/* --- MAIN CONTENT --- */}
                <main className="flex-grow w-full relative z-10">
                    <Suspense fallback={<div className="h-[80vh] flex flex-col items-center justify-center gap-4"><Spinner /> <span className="text-xs text-slate-500 tracking-widest animate-pulse">LOADING MODULE...</span></div>}>
                        {/* Ako nije Hub, dodajemo container da sadržaj ne "bježi", Hub ima svoj layout */}
                        <div className={!isHub ? "max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in" : ""}>
                            <Routes>
                                <Route index element={<Hub />} />
                                <Route path="profile" element={<UserProfile />} />
                                <Route path="map" element={<GlobalMap />} />
                                <Route path="risk-assessment" element={<QuestionnaireWrapper />} />
                                <Route path="questionnaire-summary" element={<QuestionnaireSummary />} />
                                <Route path="risk-report" element={<RiskReport />} />
                                <Route path="investor-briefing" element={<InvestorBriefing turbineCategories={TURBINE_CATEGORIES} />} />
                                <Route path="standard-of-excellence" element={<StandardOfExcellence />} />
                                <Route path="digital-introduction" element={<DigitalIntroduction />} />
                                <Route path="hpp-improvements" element={<HPPImprovements />} />
                                <Route path="installation-guarantee" element={<InstallationGuarantee />} />
                                <Route path="gender-equity" element={<GenderEquity />} />
                                <Route path="hpp-builder" element={<HPPBuilder />} />
                                <Route path="turbine/:id" element={<TurbineDetailWrapper />} />
                                <Route path="phase-guide" element={<ProjectPhaseGuide />} />
                                <Route path="river-wildlife" element={<RiverWildlife />} />
                                <Route path="revitalization-strategy" element={<RevitalizationStrategy />} />
                                <Route path="digital-integrity" element={<DigitalIntegrity />} />
                                <Route path="contract-management" element={<ContractManagement />} />
                                <Route path="library" element={<ComponentLibrary />} />
                                <Route path="*" element={<div className="flex flex-col items-center justify-center pt-20 text-slate-500">
                                    <div className="text-4xl mb-2">🚧</div>
                                    <div className="text-xl">Module Under Construction</div>
                                </div>} />
                            </Routes>
                        </div>
                    </Suspense>
                </main>

                <footer className="text-center py-8 text-[10px] text-slate-600 uppercase tracking-widest no-print border-t border-white/5 mt-auto">
                    <p>&copy; {new Date().getFullYear()} Strategic Risk Mitigation. Secured by Blockchain.</p>
                </footer>

                <InterventionCTA />
                
                {/* Floating Feedback Button */}
                <button 
                    onClick={() => setIsFeedbackVisible(true)} 
                    className="fixed bottom-6 right-6 group flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-110 hover:bg-cyan-400 transition-all z-50"
                >
                    <span className="text-xl group-hover:rotate-12 transition-transform">💬</span>
                </button>
                
                {isFeedbackVisible && <Feedback onClose={() => setIsFeedbackVisible(false)} />}
            </div>
        </NavigationProvider>
    );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
        <AuthProvider>
            <QuestionnaireProvider>
                <RiskProvider>
                    <AssetProvider>
                        <HashRouter>
                            <Routes>
                                <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
                            </Routes>
                        </HashRouter>
                    </AssetProvider>
                </RiskProvider>
            </QuestionnaireProvider>
        </AuthProvider>
    </ToastProvider>
  );
};

export default App;