// Fix: Replacing placeholder content with actual data for the Investor Briefing component.

type RiskLevel = 'High' | 'Medium' | 'Low';

export interface Risk {
  text: string;
  level: RiskLevel;
}

export interface ComponentData {
  id: string;
  title: string;
  description: string;
  kpis: string[];
  risks: Risk[];
  imageUrl?: string; // Optional image
}

export const componentData: ComponentData[] = [
  {
    id: 'design',
    title: 'Cjelokupni Dizajn i Inženjering Postrojenja',
    description: 'Holistički inženjerski pristup koji obuhvaća građevinske strukture, odabir opreme, raspored i integraciju sustava, a koji diktira dugoročne performanse i pouzdanost postrojenja.',
    kpis: [
      'Ukupna efikasnost postrojenja (od vode do žice)',
      'Faktori dostupnosti i pouzdanosti (>99%)',
      'Troškovi izgradnje u odnosu na proračun',
      'Pridržavanje sigurnosnih i ekoloških standarda',
    ],
    risks: [
      { text: 'Pogrešan građevinski dizajn (npr. ulazna građevina, odvod)', level: 'High' },
      { text: 'Loša specifikacija opreme', level: 'High' },
      { text: 'Neupropusni raspored koji povećava gubitke', level: 'Medium' },
      { text: 'Nedovoljna sigurnosna ili ekološka razmatranja', level: 'High' },
    ],
  },
  {
    id: 'miv',
    title: 'Glavni dovodni zatvarač (MIV)',
    description: 'Primarni zaporni ventil uzvodno od turbine, ključan za sigurnost i održavanje. Najčešće se koriste kuglasti ili leptirasti zatvarači.',
    kpis: [
      'Vrijeme zatvaranja u hitnim slučajevima (<60 sekundi)',
      'Efikasnost brtvljenja (stopa propuštanja)',
      'Pouzdanost (broj uspješnih operacija bez kvara)',
      'Stanje hidrauličkog pogona',
    ],
    risks: [
      { text: 'Neuspješno zatvaranje (katastrofalan rizik)', level: 'High' },
      { text: 'Neuspješno otvaranje (gubitak proizvodnje)', level: 'High' },
      { text: 'Propuštanje brtve uzrokuje gubitak vode i trošenje', level: 'Medium' },
      { text: 'Kvar hidrauličkog pogona', level: 'High' },
    ],
  },
  {
    id: 'rotor',
    title: 'Rotor i Lopatice Turbine',
    description: 'Srce turbine, rotor pretvara energiju vode u mehaničku rotaciju. Lopatice su dizajnirane za maksimalnu efikasnost i otpornost na kavitaciju i eroziju.',
    kpis: [
      'Efikasnost pretvorbe energije (>90%)',
      'Vibracijski nivoi (prema ISO 20816)',
      'Stopa erozije/kavitacije (mm/godina)',
      'Vrijeme između remonta (MTBR)',
    ],
    risks: [
      { text: 'Pukotine zamora materijala na lopaticama', level: 'High' },
      { text: 'Neuravnoteženost rotora uzrokuje vibracije', level: 'Medium' },
      { text: 'Oštećenja od kavitacije smanjuju efikasnost', level: 'High' },
      { text: 'Erozija sedimentima na ulaznim rubovima', level: 'Medium' },
    ],
  },
  {
    id: 'guide_vanes',
    title: 'Aparat za usmjeravanje (Guide Vanes)',
    description: 'Podesive lopatice koje kontroliraju protok i kut ulaska vode na rotor turbine, čime se regulira snaga agregata.',
    kpis: [
      'Točnost pozicioniranja i odziv',
      'Propuštanje u zatvorenom položaju',
      'Stopa trošenja na rubovima i osovinicama',
      'Integritet mehanizma za pokretanje',
    ],
    risks: [
      { text: 'Zaglavljivanje zbog krhotina ili trošenja', level: 'High' },
      { text: 'Prekomjerno propuštanje uzrokuje rotaciju pri zaustavljanju', level: 'Medium' },
      { text: 'Pucanje sigurnosnih elemenata (smičnih zatika)', level: 'Medium' },
      { text: 'Kvar polužnog mehanizma', level: 'High' },
    ],
  },
   {
    id: 'shaft_sealing',
    title: 'Sustav brtvljenja osovine',
    description: 'Sprječava istjecanje vode iz turbine duž osovine. Moderni sustavi uključuju labirintne, ugljične i mehaničke brtve, ovisno o primjeni.',
    kpis: [
      'Stopa propuštanja vode',
      'Potrošnja vode za hlađenje/ispiranje',
      'Vijek trajanja brtvenih elemenata',
      'Temperatura rada',
    ],
    risks: [
      { text: 'Prekomjerno curenje koje vodi do poplave', level: 'High' },
      { text: 'Gubitak vakuuma u usisnoj cijevi (reakcijske turbine)', level: 'Medium' },
      { text: 'Trošenje osovine na mjestu brtvljenja', level: 'Medium' },
      { text: 'Naglo otkazivanje brtve', level: 'High' },
    ],
  },
  {
    id: 'bearings',
    title: 'Ležajevi (Vodeći i Nosivi)',
    description: 'Podupiru rotirajuću osovinu, prenoseći ogromna radijalna (vodeći) i aksijalna (nosivi) opterećenja. Najčešće su hidrodinamički klizni ležajevi.',
    kpis: [
      'Radna temperatura ležaja',
      'Debljina i tlak uljnog filma',
      'Nivoi vibracija na kućištu ležaja',
      'Čistoća ulja (broj čestica prema ISO 4406)',
    ],
    risks: [
      { text: 'Pregrijavanje i topljenje bijele kovine ("wiping")', level: 'High' },
      { text: 'Trošenje zbog kontaminiranog ulja', level: 'Medium' },
      { text: 'Kvar sustava podmazivanja', level: 'High' },
      { text: 'Vibracije uzrokovane nestabilnošću uljnog filma', level: 'Medium' },
    ],
  },
  {
    id: 'generator',
    title: 'Generator',
    description: 'Povezan s turbinom, generator pretvara mehaničku energiju u električnu. Njegova pouzdanost i efikasnost su ključni za profitabilnost postrojenja.',
    kpis: [
      'Efikasnost generatora (>98%)',
      'Temperatura namotaja i ležajeva',
      'Faktor snage (blizu 1.0)',
      'Dostupnost postrojenja (>99%)',
    ],
    risks: [
      { text: 'Pregrijavanje namotaja statora', level: 'High' },
      { text: 'Kvar izolacije', level: 'High' },
      { text: 'Problemi s ležajevima generatora', level: 'Medium' },
      { text: 'Greške u sustavu uzbude', level: 'Medium' },
    ],
  },
  {
    id: 'control_system',
    title: 'Upravljački Sustav (SCADA & PLC)',
    description: 'Moderni digitalni sustavi za nadzor, kontrolu i prikupljanje podataka. Omogućuju optimizaciju rada, prediktivno održavanje i daljinsko upravljanje.',
    kpis: [
      'Vrijeme odziva sustava (<500ms)',
      'Pouzdanost komunikacijske mreže',
      'Točnost senzorskih podataka',
      'Broj neplaniranih zastoja uzrokovanih sustavom',
    ],
    risks: [
      { text: 'Kibernetički napadi', level: 'High' },
      { text: 'Zastarjelost hardvera/softvera', level: 'Medium' },
      { text: 'Gubitak podataka', level: 'Medium' },
      { text: 'Neispravna kalibracija senzora', level: 'Low' },
    ],
  },
   {
    id: 'hydraulic_system',
    title: 'Hidraulički Agregat i Regulacija',
    description: 'Sustav koji upravlja protokom vode kroz turbinu pomoću zakretanja lopatica i/ili regulacijskih zatvarača, osiguravajući stabilan rad i brzu reakciju na promjene opterećenja.',
    kpis: [
      'Vrijeme zatvaranja/otvaranja regulacijskih organa',
      'Tlak i čistoća hidrauličkog ulja (prema ISO 4406)',
      'Odstupanje od zadane snage/protoka',
      'Pouzdanost pumpi i akumulatora',
    ],
    risks: [
      { text: 'Curenje ulja (ekološki i operativni rizik)', level: 'Medium' },
      { text: 'Neispravnost servo ventila', level: 'High' },
      { text: 'Gubitak tlaka u sustavu', level: 'High' },
      { text: 'Kontaminacija ulja uzrokuje kvarove komponenti', level: 'Medium' },
    ],
  },
   {
    id: 'lubrication_system',
    title: 'Centralni sustav podmazivanja',
    description: 'Automatizirani sustav koji opskrbljuje točnom količinom ulja ili masti različite točke podmazivanja, prvenstveno ležajeve i pokretne dijelove mehanizama.',
    kpis: [
      'Tlak i protok u sustavu',
      'Čistoća maziva',
      'Pouzdanost pumpi i dozatora',
      'Potrošnja maziva',
    ],
    risks: [
      { text: 'Začepljeni vodovi uzrokuju nedostatak podmazivanja', level: 'High' },
      { text: 'Kvar pumpe', level: 'High' },
      { text: 'Primjena pogrešnog maziva', level: 'Medium' },
      { text: 'Kontaminacija maziva', level: 'Medium' },
    ],
  },
  {
    id: 'cooling_system',
    title: 'Sustav hlađenja',
    description: 'Upravlja toplinom koju generiraju generator i ležajevi, najčešće koristeći vodu (izravno iz cjevovoda ili u zatvorenoj petlji) putem izmjenjivača topline.',
    kpis: [
      'Temperaturna stabilnost hlađenih komponenti',
      'Protok rashladnog medija',
      'Efikasnost izmjenjivača topline (onečišćenje)',
      'Pouzdanost pumpi za hlađenje',
    ],
    risks: [
      { text: 'Začepljenje cijevi/izmjenjivača topline', level: 'High' },
      { text: 'Kvar pumpe', level: 'High' },
      { text: 'Propuštanje u sustavu', level: 'Medium' },
      { text: 'Nedovoljno hlađenje dovodi do pregrijavanja komponenti', level: 'High' },
    ],
  },
];