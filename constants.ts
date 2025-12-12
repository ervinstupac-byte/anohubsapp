import { HubTool } from './types.ts';

// --- HUB KARTICE ---

export const CORE_STRATEGY_TOOLS: HubTool[] = [
  {
    id: 'assessment',
    view: 'riskAssessment',
    title: "Risk Assessment Tool",
    description: "Quantify the Execution Gap and diagnose systemic risks before they impact LCC.",
    icon: '⚠️',
    isCritical: true,
    delay: 0
  },
  {
    id: 'phaseGuide',
    view: 'phaseGuide',
    title: "Project Phase Guide",
    description: "Master the protocols that enforce our Three Postulates for precision and risk mitigation.",
    icon: '🗺️',
    isCritical: true,
    delay: 100
  },
  {
    id: 'installation',
    view: 'installationGuarantee',
    title: "Installation Standard",
    description: "Enforce the 0.05 mm/m precision mandate to close the Execution Gap.",
    icon: '⚙️',
    isCritical: true,
    delay: 200
  },
  {
    id: 'revitalization',
    view: 'revitalizationStrategy',
    title: "Revitalization Strategy",
    description: "Data-driven framework for closing the M-E Synergy Gap in legacy assets.",
    icon: '🔄',
    isCritical: true,
    delay: 300
  },
  {
    id: 'digitalIntegrity',
    view: 'digitalIntegrity',
    title: "Digital Integrity",
    description: "Immutable ledger providing irrefutable proof of discipline against liability.",
    icon: '🛡️',
    isCritical: true,
    delay: 400
  },
  {
    id: 'contractManagement',
    view: 'contractManagement',
    title: "Contract & Legal",
    description: "Legally mandate the 0.05 mm/m precision standard to protect warranty.",
    icon: '⚖️',
    isCritical: true,
    delay: 500
  },
];

export const KNOWLEDGE_INNOVATION_TOOLS: HubTool[] = [
  {
    id: 'intro',
    view: 'digitalIntroduction',
    title: "Digital Introduction",
    description: "Core principles: enforcing the 0.05 mm/m precision mandate.",
    icon: '🌐',
    delay: 0
  },
  {
    id: 'builder',
    view: 'hppBuilder',
    title: "HPP Power Calculator",
    description: "Configure HPPs using principles of LCC Optimization.",
    icon: '⚡',
    delay: 100
  },
  {
    id: 'investor',
    view: 'investorBriefing',
    title: "Investor Info-Center",
    description: "Review transparent, risk-adjusted KPIs for sustainable returns.",
    icon: '💰',
    delay: 200
  },
  {
    id: 'riverWildlife',
    view: 'riverWildlife',
    title: "River Stewardship",
    description: "Ethical mandates for Ecosystem Protection and E-Flow.",
    icon: '🌿',
    delay: 300
  },
  {
    id: 'excellence',
    view: 'standardOfExcellence',
    title: "Standard of Excellence",
    description: "Blueprint for uncompromised quality and elimination of Execution Gap.",
    icon: '🏆',
    delay: 400
  },
  {
    id: 'improvements',
    view: 'hppImprovements',
    title: "HPP Ino-Hub",
    description: "Collaborative innovations supporting LCC Optimization.",
    icon: '💡',
    delay: 500
  },
  {
    id: 'equity',
    view: 'genderEquity',
    title: "Gender Equity",
    description: "Closing the Execution Gap in human capital.",
    icon: '⚖️',
    delay: 600
  },
];

export const FEEDBACK_TOOLS: HubTool[] = [
  {
    id: 'suggestion',
    view: 'suggestionBox',
    title: "Suggestion / Idea",
    description: "Share ideas to improve protocols for precision and risk mitigation.",
    icon: '✍️',
    delay: 0
  },
];

// --- TURBINE CATEGORIES (Prošireno za Investor Briefing) ---
export const TURBINE_CATEGORIES: any = {
    kaplan: { 
        name: 'Kaplan', 
        description: 'Adjustable blades for low head, high flow efficiency.',
        types: [
            { id: 'kaplan_vertical', name: 'Vertical Kaplan', description: 'Standard for large flows and low heads.' },
            { id: 'kaplan_horizontal', name: 'Horizontal Kaplan (Pit/S-Type)', description: 'For smaller heads and easier access.' },
            { id: 'kaplan_bulb', name: 'Bulb Turbine', description: 'Compact, submerged unit for run-of-river.' }
        ]
    },
    francis: { 
        name: 'Francis', 
        description: 'The most common water turbine, covering medium heads.',
        types: [
            { id: 'francis_vertical', name: 'Vertical Francis', description: 'For medium to high heads and large power outputs.' },
            { id: 'francis_horizontal', name: 'Horizontal Francis', description: 'For smaller units, often in spiral casing.' }
        ]
    },
    pelton: { 
        name: 'Pelton', 
        description: 'Impulse turbine for high heads and low flows.',
        types: [
            { id: 'pelton_vertical', name: 'Vertical Pelton', description: 'Multiple jets (4-6) for high power.' },
            { id: 'pelton_horizontal', name: 'Horizontal Pelton', description: '1-2 jets, easier maintenance for smaller units.' }
        ]
    },
    crossflow: {
        name: 'Crossflow',
        description: 'Robust, simple design for variable flows.',
        types: [
            { id: 'crossflow', name: 'Standard Crossflow', description: 'Banki-Michell design for broad efficiency curve.' }
        ]
    }
};

// --- RISK ASSESSMENT QUESTIONS ---
export const QUESTIONS = [
    {
        id: 'q1',
        text: 'Is there a digital, searchable archive of all original design documents and "as-built" drawings?',
        options: ['Yes, fully digitized', 'Partially / Hard copies only', 'No / Not documented']
    },
    {
        id: 'q2',
        text: 'Was the shaft alignment verified to < 0.05 mm/m during the last major overhaul?',
        options: ['Yes, documented', 'Partially / Unknown', 'No']
    },
    {
        id: 'q4',
        text: 'Do you experience unexplained vibrations or noise at specific load points?',
        options: ['No', 'Sometimes', 'Yes, frequently']
    },
    {
        id: 'q5',
        text: 'Is there visible pitting (cavitation) on the runner blades?',
        options: ['No', 'Occasionally', 'Yes, frequently']
    },
    {
        id: 'q6',
        text: 'Is the Digital Logbook regularly updated with maintenance events?',
        options: ['Yes, always', 'Partially filled', 'Not maintained']
    },
    {
        id: 'q7',
        text: 'When a failure occurs, is a Root Cause Failure Analysis (RCFA) performed?',
        options: ['Yes, always', 'Sometimes we only fix the symptom', 'Often we only fix the symptom']
    },
    {
        id: 'q8',
        text: 'Do you use AI-driven acoustic monitoring for predictive maintenance?',
        options: ['Yes', 'In testing phase', 'No']
    },
    {
        id: 'q9',
        text: 'Is remote monitoring (SCADA) accessible securely from off-site?',
        options: ['Yes', 'Limited access', 'No']
    },
    {
        id: 'q10',
        text: 'Are bearing temperatures monitored continuously?',
        options: ['Yes, real-time', 'Monitored periodically', 'Not monitored']
    },
    {
        id: 'q11',
        text: 'Is Environmental Flow (E-flow) automatically measured and logged?',
        options: ['Yes', 'No, do not measure']
    },
    {
        id: 'q12',
        text: 'Is "Repair" considered before "Replace" for major components?',
        options: ['Yes, always', 'Sometimes', 'No, only replacement is offered']
    },
    {
        id: 'q13',
        text: 'Does the staff receive regular training on new protocols?',
        options: ['Yes', 'Periodically', 'No']
    },
    {
        id: 'q14',
        text: 'Are protection relays tested annually?',
        options: ['Yes', 'Some require checking', 'Not installed/functional']
    },
    {
        id: 'q15',
        text: 'Is the control system hardware less than 10 years old?',
        options: ['Yes', 'No (Outdated)']
    },
    {
        id: 'q16',
        text: 'Is the lubrication system automated?',
        options: ['Yes', 'Semi-automatic', 'Manual']
    },
    {
        id: 'q17',
        text: 'What is the current maintenance status?',
        options: ['Fully operational', 'Requires minor maintenance', 'Major service needed']
    }
];