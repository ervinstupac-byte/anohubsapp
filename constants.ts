
import type { Question, TurbineCategories } from './types';

export const TURBINE_CATEGORIES: TurbineCategories = {
  kaplan: {
    name: 'Kaplan',
    types: [
      { id: 'kaplan_vertical', name: 'Vertikalna', description: 'Standardna izvedba za niske padove i velike protoke.' },
      { id: 'kaplan_horizontal', name: 'Horizontalna', description: 'Koristi se za specifične instalacije gdje vertikalna izvedba nije moguća.'},
      { id: 'kaplan_bulb', name: 'Cijevna (Bulb)', description: 'Horizontalna jedinica unutar cijevi, maksimalna hidraulička efikasnost.' },
      { id: 'kaplan_s', name: 'S-tip', description: 'Horizontalna turbina sa S-oblikovanom usisnom cijevi, za adaptacije postojećih lokacija.' },
    ],
  },
  francis: {
    name: 'Francis',
    types: [
       { id: 'francis_vertical', name: 'Vertikalna', description: 'Za veće snage i srednje do visoke padove.' },
       { id: 'francis_horizontal', name: 'Horizontalna', description: 'Za manje snage, često s spiralnim kućištem.' },
    ],
  },
  pelton: {
    name: 'Pelton',
    types: [
      { id: 'pelton_vertical', name: 'Vertikalna', description: 'S više mlaznica (3-6), za velike snage i visoke padove.' },
      { id: 'pelton_horizontal', name: 'Horizontalna', description: 'S jednom ili dvije mlaznice, za manje do srednje snage.' },
    ],
  },
  crossflow: {
      name: 'Crossflow (Banki-Michell)',
      types: [
        { id: 'crossflow', name: 'Crossflow', description: 'Jednostavna i robusna, za male HPP i širok raspon protoka.' },
      ],
  },
  flow_through: {
    name: 'Protočna',
    types: [
      { id: 'flow_through_generic', name: 'Protočna', description: 'Optimizirana za rad na rijekama s malim padom i konstantnim protokom (Run-of-river).' },
    ],
  },
};


export const QUESTIONS: Question[] = [
  // --- TEMELJNA DISCIPLINA I MONTAŽA ---
  {
    id: 'q1',
    text: 'Jeste li koristili lasersko poravnanje rotora unutar specificiranih tolerancija (npr. 0.05 mm/m)?',
    options: ['Da, dokumentovano', 'Da, ali nije dokumentovano', 'Ne'],
  },
  {
    id: 'q2',
    text: 'Jesu li temelji stroja provjereni i poravnati (ravnost <0.1mm) prije finalne montaže opreme?',
    options: ['Da', 'Ne', 'Djelomično'],
  },
  {
    id: 'q11',
    text: 'Da li je kvaliteta balansiranja rotora (Q rated) unutar ISO standarda (npr. Q 2.5)?',
    options: ['Da', 'Ne', 'Ne mjerimo'],
  },
  
  // --- DOKUMENTACIJA I ETIKA ---
  {
    id: 'q6',
    text: 'Da li je elektronski Dnevnik Održavanja (Logbook) u potpunosti popunjen i verifikovan?',
    options: ['Da, u potpunosti', 'Djelomično popunjen', 'Ne vodi se'],
  },
  {
    id: 'q9',
    text: 'Da li je tehničko osoblje na terenu imalo trenutni digitalni pristup celokupnoj istoriji servisiranja?',
    options: ['Da, uvijek', 'Ograničen pristup', 'Ne'],
  },
  {
    id: 'q12',
    text: 'U posljednjoj ponudi servisa, da li je klijentu ponuđena opcija popravke kritične komponente prije pune zamjene?',
    options: ['Da, uvijek se nudi', 'Ponekad', 'Ne, nudi se samo zamjena'],
  },

  // --- SENZORI I MONITORING ---
  {
    id: 'q5',
    text: 'Postoje li neuobičajene vibracije, zvukovi ili povišene temperature tijekom rada stroja?',
    options: ['Ne', 'Povremeno', 'Da, često'],
  },
  {
    id: 'q8',
    text: 'Da li je implementiran sistem za Akustični Monitoring (AI za prepoznavanje kavitacije/erozije)?',
    options: ['Da, implementiran', 'U fazi testiranja', 'Ne'],
  },
  {
    id: 'q13',
    text: 'Da li se na ulazu u turbinu vrši proaktivno praćenje koncentracije sedimenata?',
    options: ['Da, kontinuirano', 'Povremeno', 'Ne'],
  },
  {
    id: 'q14',
    text: 'Kakav je status senzora za mjerenje vibracija i temperature?',
    options: ['Svi ispravni i kalibrirani', 'Neki zahtijevaju provjeru', 'Nisu instalirani/funkcionalni'],
  },
  {
    id: 'q15',
    text: 'Prati li se brzina rotora preciznim senzorima i postoji li zaštita od prevelike brzine (overspeed)?',
    options: ['Da, pouzdan sustav', 'Postoji, ali je zastario', 'Ne'],
  },

  // --- POMOĆNI SUSTAVI ---
   {
    id: 'q4',
    text: 'Koristite li specificirana maziva i ulja u preporučenim intervalima?',
    options: ['Da, uvijek', 'Ponekad', 'Ne'],
  },
  {
    id: 'q16',
    text: 'Je li sustav podmazivanja ležajeva automatski ili manualni?',
    options: ['Potpuno automatski', 'Polu-automatski', 'Manualni'],
  },
  {
    id: 'q17',
    text: 'U kakvom je stanju hidraulički agregat (tlak, čistoća ulja, ispravnost ventila)?',
    options: ['Optimalno', 'Zahtijeva manje održavanje', 'Potreban je veći servis'],
  },

  // --- OPERATIVNI I OKOLIŠNI RIZICI ---
  {
    id: 'q7',
    text: 'Da li se kvarovi rešavaju uklanjanjem uzroka ili samo saniranjem posljedice (simptoma)?',
    options: ['Uvijek tražimo uzrok', 'Ponekad rješavamo samo simptom', 'Često rješavamo samo simptom'],
  },
  {
    id: 'q10',
    text: 'Da li se minimalni ekološki protok (E-flow) održava i automatski dokumentuje?',
    options: ['Da, kontinuirano i automatski', 'Prati se povremeno', 'Ne prati se'],
  },
];
