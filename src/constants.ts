import { HubTool, Question, TurbineCategories } from './types.ts';

// --- 1. TURBINE CATEGORIES (Used in Builder & Briefing) ---
export const TURBINE_CATEGORIES: TurbineCategories = {
    kaplan: {
        name: 'Kaplan Turbine',
        description: 'Adjustable blades for low head (10-70m) and variable flow. High efficiency across wide operating ranges.',
        types: [
            { id: 'kaplan_vertical', name: 'Vertical Kaplan', description: 'Standard for large run-of-river plants.' },
            { id: 'kaplan_horizontal', name: 'Horizontal (Pit) Kaplan', description: 'Low profile, easier maintenance access.' },
            { id: 'kaplan_bulb', name: 'Bulb Turbine', description: 'Submerged generator for very low heads.' },
            { id: 'kaplan_s', name: 'S-Type Kaplan', description: 'Cost-effective for small hydro.' },
        ]
    },
    francis: {
        name: 'Francis Turbine',
        description: 'The workhorse of hydro. Medium heads (40-600m). Fixed blades, variable guide vanes.',
        types: [
            { id: 'francis_vertical', name: 'Vertical Francis', description: 'High capacity, standard configuration.' },
            { id: 'francis_horizontal', name: 'Horizontal Francis', description: 'Smaller units, easier installation.' },
        ]
    },
    pelton: {
        name: 'Pelton Turbine',
        description: 'Impulse turbine for high heads (>200m) and low flow. Buckets and jets.',
        types: [
            { id: 'pelton_vertical', name: 'Vertical Pelton', description: 'Multi-jet (4-6) for higher power.' },
            { id: 'pelton_horizontal', name: 'Horizontal Pelton', description: '1-2 jets, simple maintenance.' },
        ]
    },
    crossflow: {
        name: 'Crossflow (Banki)',
        description: 'Robust, self-cleaning, varying flow for small hydro.',
        types: [
            { id: 'crossflow', name: 'Standard Crossflow', description: 'Simple design, easy repair.' },
        ]
    }
};

// --- 2. RISK ASSESSMENT QUESTIONS (Used in Questionnaire) ---
export const QUESTIONS: Question[] = [
    { id: 'q1', text: 'Are the turbine centerlines (mechanical vs. hydraulic) documented in the commissioning report?', options: ['Yes', 'No', 'Not Documented', 'Partial'] },
    { id: 'q2', text: 'Is there a digital log of the initial shaft alignment tolerance (< 0.05 mm/m)?', options: ['Yes', 'No', 'Partially', 'Paper Only'] },
    { id: 'q3', text: 'Have the foundation bolts been retightened and torqued after 500 operating hours?', options: ['Yes', 'No', 'Unknown', 'Scheduled'] },
    { id: 'q4', text: 'Is the "Acoustic Signature" (baseline vibration) recorded at varying loads?', options: ['Yes', 'No', 'Sometimes', 'Only at Full Load'] },
    { id: 'q5', text: 'Do you experience frequent shear pin failures on the guide vanes?', options: ['Never', 'Rarely', 'Occasionally', 'Frequently'] },
    { id: 'q6', text: 'Is the runner clearance (gap) monitored and logged annually?', options: ['Yes', 'No', 'Not Maintained', 'Partially Filled'] },
    { id: 'q7', text: 'When failures occur, is a Root Cause Failure Analysis (RCFA) performed?', options: ['Always', 'Often we only fix the symptom', 'Sometimes we only fix the symptom', 'Never'] },
    { id: 'q8', text: 'Is there an automated lubrication system for the wicket gate bearings?', options: ['Yes', 'No', 'In Testing Phase'] },
    { id: 'q9', text: 'Are spare parts (seals, bearings) strictly OEM certified?', options: ['Yes', 'No', 'Limited Access', 'Mixed Stock'] },
    { id: 'q10', text: 'Is the oil quality (water content/particles) monitored in real-time?', options: ['Yes', 'Not Monitored', 'Monitored Periodically'] },
    { id: 'q11', text: 'Do you measure the "Execution Gap" (Planned vs. Actual maintenance time)?', options: ['Yes', 'No', 'Do not measure'] },
    { id: 'q12', text: 'Does the contract enforce specific penalties for alignment deviations?', options: ['Yes', 'No, only replacement is offered', 'Only Replacement', 'Sometimes'] },
    { id: 'q13', text: 'Is the cavitation pitting depth measured during every major overhaul?', options: ['Yes', 'No', 'Periodically'] },
    { id: 'q14', text: 'Are vibration sensors installed on all main bearings?', options: ['Yes', 'Not Installed/Functional', 'Some require checking'] },
    { id: 'q15', text: 'Is the SCADA system updated with the latest security patches?', options: ['Yes', 'No', 'Outdated'] },
    { id: 'q16', text: 'Is the emergency shutdown sequence tested annually?', options: ['Automatic', 'Manual', 'Semi-Automatic'] },
    { id: 'q17', text: 'What is the current condition of the draft tube concrete surface?', options: ['Good', 'Requires Minor Maintenance', 'Major Service Needed'] }
];

// --- 3. COMPONENT DATA (Used in Technical Details) ---
export const COMPONENT_DATA = [
    {
        id: 'runner',
        title: 'Runner & Blades',
        description: 'The heart of the turbine. Converts hydraulic energy into rotation. Critical for efficiency.',
        risks: [
            { text: 'Cavitation Pitting', level: 'High' },
            { text: 'Fatigue Cracking (Root)', level: 'High' },
            { text: 'Erosion (Sand/Silt)', level: 'Medium' }
        ],
        kpis: ['Efficiency > 94%', 'Vibration < 2.5 mm/s', 'Cavitation Loss < 2g/1000h']
    },
    {
        id: 'bearings',
        title: 'Guide Bearings',
        description: 'Supports the shaft radially. Sensitive to alignment and oil quality.',
        risks: [
            { text: 'White Metal Wiping', level: 'Critical' },
            { text: 'Oil Film Instability', level: 'High' },
            { text: 'Contamination', level: 'Medium' }
        ],
        kpis: ['Temp < 65°C', 'Oil Water < 200ppm', 'Clearance Compliance']
    },
    {
        id: 'shaft',
        title: 'Main Shaft & Seal',
        description: 'Transmits torque. The seal prevents water ingress into the powerhouse.',
        risks: [
            { text: 'Seal Leakage (Flooding)', level: 'High' },
            { text: 'Run-out / Alignment', level: 'Critical' },
            { text: 'Torsional Vibration', level: 'Medium' }
        ],
        kpis: ['Run-out < 0.05mm', 'Seal Leakage < 5 L/min', 'Alignment < 0.05 mm/m']
    },
    {
        id: 'distributor',
        title: 'Distributor (Wicket Gates)',
        description: 'Regulates flow to the runner. High mechanical stress area.',
        risks: [
            { text: 'Shear Pin Failure', level: 'Medium' },
            { text: 'Linkage Wear', level: 'Medium' },
            { text: 'Jamming (Debris)', level: 'High' }
        ],
        kpis: ['Opening Sync < 1%', 'Hysteresis < 0.5%', 'Leakage (Closed) < 1%']
    }
];

// --- 4. HUB TOOLS (MENU ITEMS - Used in Hub.tsx) ---
export const HUB_TOOLS: HubTool[] = [
    {
        id: 'risk',
        view: 'riskAssessment',
        title: 'Risk Assessment',
        description: 'Complete diagnostic tool to identify the Execution Gap.',
        icon: '🛡️',
        isCritical: true
    },
    {
        id: 'install',
        view: 'installationGuarantee',
        title: 'Installation Standard',
        description: 'The 0.05 mm/m protocol. Non-negotiable precision.',
        icon: '🏗️',
        isCritical: true
    },
    {
        id: 'design',
        view: 'hppBuilder',
        title: 'HPP Design Studio',
        description: 'Physics-based turbine selection and calculation.',
        icon: '⚡'
    },
    {
        id: 'integrity',
        view: 'digitalIntegrity',
        title: 'Digital Integrity',
        description: 'Blockchain ledger for immutable data proof.',
        icon: '🔗'
    },
    {
        id: 'investor',
        view: 'investorBriefing',
        title: 'Investor Briefing',
        description: 'Financial KPIs and Risk Impact Analysis.',
        icon: '📊'
    },
    {
        id: 'contract',
        view: 'contractManagement',
        title: 'Contract & Legal',
        description: 'Warranty protection via data compliance.',
        icon: '⚖️'
    },
    {
        id: 'excellence',
        view: 'standardOfExcellence',
        title: 'Standard of Excellence',
        description: 'Masterclass modules for eliminating the Execution Gap.',
        icon: '🎓'
    },
    {
        id: 'revital',
        view: 'revitalizationStrategy',
        title: 'Revitalization Strategy',
        description: 'Closing the M-E Synergy Gap in legacy assets.',
        icon: '♻️'
    },
    {
        id: 'phase',
        view: 'phaseGuide',
        title: 'Project Phase Guide',
        description: 'Step-by-step enforcement of the Three Postulates.',
        icon: '📅'
    },
    {
        id: 'digital',
        view: 'digitalIntroduction',
        title: 'Digital Introduction',
        description: 'Core principles of the AnoHUB philosophy.',
        icon: '📱'
    },
    {
        id: 'ino',
        view: 'hppImprovements',
        title: 'HPP Ino-Hub',
        description: 'Innovations supporting LCC Optimization.',
        icon: '💡'
    },
    {
        id: 'gender',
        view: 'genderEquity',
        title: 'Gender Equity',
        description: 'Inclusive strategies for human capital.',
        icon: '👥'
    },
    {
        id: 'wildlife',
        view: 'riverWildlife',
        title: 'River & Wildlife',
        description: 'Ethical mandate for Ecosystem Protection.',
        icon: '🐟'
    },
    {
        id: 'suggestion',
        view: 'suggestionBox',
        title: 'Suggestion Box',
        description: 'Feedback loop for protocol improvement.',
        icon: '💬'
    }
];