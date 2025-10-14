// Fix: Replacing placeholder content with actual data for the Investor Briefing component.
export interface ComponentData {
  id: string;
  title: string;
  description: string;
  kpis: string[];
  risks: string[];
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
      'Pogrešan građevinski dizajn (npr. ulazna građevina, odvod)',
      'Loša specifikacija opreme',
      'Neupropusni raspored koji povećava gubitke',
      'Nedovoljna sigurnosna ili ekološka razmatranja',
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
      'Neuspješno zatvaranje (katastrofalan rizik)',
      'Neuspješno otvaranje (gubitak proizvodnje)',
      'Propuštanje brtve uzrokuje gubitak vode i trošenje',
      'Kvar hidrauličkog pogona',
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
      'Pukotine zamora materijala na lopaticama',
      'Neuravnoteženost rotora uzrokuje vibracije',
      'Oštećenja od kavitacije smanjuju efikasnost',
      'Erozija sedimentima na ulaznim rubovima',
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
      'Zaglavljivanje zbog krhotina ili trošenja',
      'Prekomjerno propuštanje uzrokuje rotaciju pri zaustavljanju',
      'Pucanje sigurnosnih elemenata (smičnih zatika)',
      'Kvar polužnog mehanizma',
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
      'Prekomjerno curenje koje vodi do poplave',
      'Gubitak vakuuma u usisnoj cijevi (reakcijske turbine)',
      'Trošenje osovine na mjestu brtvljenja',
      'Naglo otkazivanje brtve',
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
      'Pregrijavanje i topljenje bijele kovine ("wiping")',
      'Trošenje zbog kontaminiranog ulja',
      'Kvar sustava podmazivanja',
      'Vibracije uzrokovane nestabilnošću uljnog filma',
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
      'Pregrijavanje namotaja statora',
      'Kvar izolacije',
      'Problemi s ležajevima generatora',
      'Greške u sustavu uzbude',
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
      'Kibernetički napadi',
      'Zastarjelost hardvera/softvera',
      'Gubitak podataka',
      'Neispravna kalibracija senzora',
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
      'Curenje ulja (ekološki i operativni rizik)',
      'Neispravnost servo ventila',
      'Gubitak tlaka u sustavu',
      'Kontaminacija ulja uzrokuje kvarove komponenti',
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
      'Začepljeni vodovi uzrokuju nedostatak podmazivanja',
      'Kvar pumpe',
      'Primjena pogrešnog maziva',
      'Kontaminacija maziva',
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
      'Začepljenje cijevi/izmjenjivača topline',
      'Kvar pumpe',
      'Propuštanje u sustavu',
      'Nedovoljno hlađenje dovodi do pregrijavanja komponenti',
    ],
  },
];
