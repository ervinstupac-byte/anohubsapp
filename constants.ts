import type { Question, TurbineCategories } from './types';

export const TURBINE_CATEGORIES: TurbineCategories = {
  kaplan: {
    name: 'Kaplan',
    types: [
      { id: 'kaplan_vertical', name: 'Vertical', description: 'Standard design for low heads and high flow rates.' },
      { id: 'kaplan_horizontal', name: 'Horizontal', description: 'Used for specific installations where a vertical design is not feasible.'},
      { id: 'kaplan_bulb', name: 'Bulb', description: 'Horizontal unit inside a pipe, maximizing hydraulic efficiency.' },
      { id: 'kaplan_s', name: 'S-Type', description: 'Horizontal turbine with an S-shaped draft tube, for retrofitting existing sites.' },
    ],
  },
  francis: {
    name: 'Francis',
    types: [
       { id: 'francis_vertical', name: 'Vertical', description: 'For higher power outputs and medium to high heads.' },
       { id: 'francis_horizontal', name: 'Horizontal', description: 'For lower power outputs, often with a spiral casing.' },
    ],
  },
  pelton: {
    name: 'Pelton',
    types: [
      { id: 'pelton_vertical', name: 'Vertical', description: 'With multiple jets (3-6), for high power and high heads.' },
      { id: 'pelton_horizontal', name: 'Horizontal', description: 'With one or two jets, for small to medium power outputs.' },
    ],
  },
  crossflow: {
      name: 'Crossflow (Banki-Michell)',
      types: [
        { id: 'crossflow', name: 'Crossflow', description: 'Simple and robust, for small HPPs and a wide range of flows.' },
      ],
  },
  flow_through: {
    name: 'Run-of-River',
    types: [
      { id: 'flow_through_generic', name: 'Run-of-River', description: 'Optimized for operation on rivers with low head and constant flow.' },
    ],
  },
};


export const QUESTIONS: Question[] = [
  // --- CORE DISCIPLINE & ASSEMBLY ---
  {
    id: 'q1',
    text: 'Was laser alignment of the runner used within specified tolerances (e.g., 0.05 mm/m)?',
    options: ['Yes, documented', 'Yes, but not documented', 'No'],
  },
  {
    id: 'q2',
    text: 'Were the machine foundations checked and leveled (flatness <0.1mm) before final equipment assembly?',
    options: ['Yes', 'No', 'Partially'],
  },
  {
    id: 'q11',
    text: 'Is the quality of the runner balancing (G-grade) within ISO standards (e.g., G 2.5)?',
    options: ['Yes', 'No', 'We do not measure it'],
  },
  
  // --- DOCUMENTATION & ETHICS ---
  {
    id: 'q6',
    text: 'Is the electronic Maintenance Logbook fully completed and verified?',
    options: ['Yes, completely', 'Partially filled', 'Not maintained'],
  },
  {
    id: 'q9',
    text: 'Did the on-site technical staff have immediate digital access to the complete service history?',
    options: ['Yes, always', 'Limited access', 'No'],
  },
  {
    id: 'q12',
    text: 'In the last service quote, was the client offered the option to repair a critical component before full replacement?',
    options: ['Yes, always offered', 'Sometimes', 'No, only replacement is offered'],
  },

  // --- SENSORS & MONITORING ---
  {
    id: 'q5',
    text: 'Are there unusual vibrations, sounds, or elevated temperatures during machine operation?',
    options: ['No', 'Occasionally', 'Yes, frequently'],
  },
  {
    id: 'q8',
    text: 'Is an Acoustic Monitoring system (AI for cavitation/erosion detection) implemented?',
    options: ['Yes, implemented', 'In testing phase', 'No'],
  },
  {
    id: 'q13',
    text: 'Is the sediment concentration at the turbine inlet proactively monitored?',
    options: ['Yes, continuously', 'Periodically', 'No'],
  },
  {
    id: 'q14',
    text: 'What is the status of the vibration and temperature sensors?',
    options: ['All correct and calibrated', 'Some require checking', 'Not installed/functional'],
  },
  {
    id: 'q15',
    text: 'Is the runner speed monitored by precise sensors, and is there overspeed protection?',
    options: ['Yes, a reliable system', 'System exists, but is outdated', 'No'],
  },

  // --- AUXILIARY SYSTEMS ---
   {
    id: 'q4',
    text: 'Are specified lubricants and oils used at recommended intervals?',
    options: ['Yes, always', 'Sometimes', 'No'],
  },
  {
    id: 'q16',
    text: 'Is the bearing lubrication system automatic or manual?',
    options: ['Fully automatic', 'Semi-automatic', 'Manual'],
  },
  {
    id: 'q17',
    text: 'What is the condition of the hydraulic power unit (pressure, oil cleanliness, valve function)?',
    options: ['Optimal', 'Requires minor maintenance', 'Major service needed'],
  },

  // --- OPERATIONAL & ENVIRONMENTAL RISKS ---
  {
    id: 'q7',
    text: 'Are failures resolved by addressing the root cause or only by fixing the symptom?',
    options: ['We always seek the root cause', 'Sometimes we only fix the symptom', 'Often we only fix the symptom'],
  },
  {
    id: 'q10',
    text: 'Is the minimum environmental flow (E-flow) maintained and automatically documented?',
    options: ['Yes, continuously and automatically', 'Monitored periodically', 'Not monitored'],
  },
];