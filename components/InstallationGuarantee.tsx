import React, { useState } from 'react';
import { BackButton } from './BackButton';
import type { ProtocolSection } from '../types';

// Data synthesized from user-provided documents
const generalProtocol: ProtocolSection[] = [
    {
        id: 'gen1', title: 'Faza 1: Inicijacija Projekta i Spremnost na Daljinu',
        steps: [
            { id: 'g1.1', title: 'Postavljanje Daljinskog Nadzora', details: ['Internet: Minimalno 5 Mbit/s UPLOAD potrebno u svakom trenutku. Testirati video pozivima prije početka.', 'Nadzor: Kamere na gradilištu moraju biti operativne za daljinsko praćenje.', 'Komunikacija: Pametne naočale i prijenosna računala s pristupom internetu obavezni su za lokalnog inženjera.', 'Izvještavanje: Dnevni izvještaji moraju se dostavljati putem cloud servisa (npr. OneDrive) kako bi se osiguralo praćenje napretka u stvarnom vremenu.'], critical: true },
            { id: 'g1.2', title: 'HSE (Zdravlje, Sigurnost, Okoliš)', details: ['Visoki Rizik: Lokalno osoblje NE SMIJE raditi bez izravnih uputa od daljinskog GH-AT inženjera.', 'Dokumentacija: Certifikat o obrazovanju, CV i potpisani protokol s uputama za lokalno osoblje moraju se dostaviti prije početka rada.'], critical: true },
        ]
    },
    {
        id: 'gen2', title: 'Faza 2: Provjera Gradilišta i Opreme',
        steps: [
            { id: 'g2.1', title: 'Dokumentacija i Alati', details: ['Provjeriti je li sva potrebna dokumentacija na gradilištu: protokoli o poravnanju, liste pakiranja, najnoviji crteži.', 'Pregledati i organizirati sve alate prema listi alata za projekt.'] },
            { id: 'g2.2', title: 'Rukovanje i Skladištenje Opreme', details: ['Pregledati svu isporučenu opremu na transportna oštećenja PRIJE istovara.', 'Koristiti listu pakiranja za identifikaciju i otvaranje samo potrebnih kutija.', 'Rukovati svim komponentama s certificiranom, prethodno pregledanom opremom za dizanje.', 'Skladištiti svu otvorenu opremu na suhom, zaštićenom mjestu.'] },
            { id: 'g2.3', title: 'Inspekcija Temelja i Betona', details: ['Provjeriti dimenzije i razine temeljnog betona prema "općem nacrtu".', 'Osigurati da su sve središnje linije (turbina, generator) osigurane od strane kupca i jasno označene.', 'Potvrditi da je temelj spreman i čist za pozicioniranje turbine.'] },
        ]
    }
];

const kaplanProtocol: ProtocolSection[] = [
    {
        id: 's1', title: 'Faza 1: Prva Mehanička Montaža (Usisna Cijev i Prsten Rotora)',
        steps: [
            { id: '1.1', title: 'Središnje i Referentne Linije', details: ['Označiti središnje linije koljena usisne cijevi i generatora na 1. betonu.', 'Označiti referentnu visinsku liniju unutar strojarnice za niveliranje.'] },
            { id: '1.2', title: 'Pozicioniranje i Zavarivanje Usisne Cijevi', details: ['Pozicionirati dijelove usisne cijevi na središnje linije. Brusiti i očistiti zavarene šavove (približno 50mm).', 'Koristiti privremene čelične konstrukcije za savršeno uklapanje i poravnanje dijelova prije zavarivanja.', 'Završno zavarivanje moraju obaviti certificirani stručnjaci. Sve šavove izbrusiti glatko iznutra i izvana.'], critical: true },
            { id: '1.3', title: 'Montaža Prstena Rotora', details: ['Očistiti prirubnicu između prstena rotora i konusa usisne cijevi.', 'Postaviti O-prsten i montirati prsten rotora na konus usisne cijevi, poravnavajući središnje linije.', 'Pričvrstiti vijčani spoj prema tablici momenta pritezanja.'] },
        ]
    },
    {
        id: 's2', title: 'Faza 2: Druga Mehanička Montaža (Vučni Lanac i Generator)',
        steps: [
            { id: '2.1', title: 'Pozicioniranje Vučnog Lanca', details: ['Podignuti vučni lanac u vertikalni položaj i pregledati ulje u glavčini rotora.', 'Poravnati središnju liniju vučnog lanca turbine sa središnjom linijom prstenova privodnog kola.', 'Pregledati i podesiti zazor lopatica rotora prema prstenu rotora da bude približno jednak po cijelom obodu.'] },
            { id: '2.2', title: 'Temeljni Okvir i Pozicioniranje Generatora', details: ['Podesiti razinu temeljnog okvira generatora prema duljini osovine generatora, osiguravajući zazor od 1mm između prirubnica spojke.', 'Koristiti navojne šipke i vijke za podizanje za fina podešavanja. Fiksirati položaj na beton čeličnim gredama za ojačanje.'], critical: true },
            { id: '2.3', title: 'Završno Poravnanje Osovina', details: ['Spojiti generator i turbinu. Pritegnuti vijke spojke na 25%-50%-75%-100% specificiranog momenta u ispravnom redoslijedu.', 'Podignuti kućište ležaja približno 0.1mm kako bi se osovina turbine podesila u slobodan vertikalni položaj.', 'Izmjeriti i podesiti zazore između glavčine rotora/poklopca turbine i lopatice rotora/prstena rotora. Sve vrijednosti zabilježiti u protokol.'], critical: true },
        ]
    }
];

const francisProtocol: ProtocolSection[] = [
    {
        id: 'fra1', title: 'Faza 1: Spiralno Kućište Turbine i MIV',
        steps: [
            { id: 'f1.1', title: 'Montaža MIV-a (Glavnog Dovodnog Zatvarača)', details: ['Pregledati funkciju i komponente MIV-a, uključujući bypass i protuutege.', 'Osigurati mehaničku sigurnost za zatvoreni položaj i funkcionalnost senzora.'] },
            { id: 'f1.2', title: 'Spiralno Kućište Turbine', details: ['Pozicionirati spiralno kućište i pregledati na kavitaciju ili druga transportna oštećenja.', 'Instalirati senzore tlaka i ventile za odzračivanje usisne cijevi.', 'Provjeriti pristup i brtvljenje revizijskog otvora.'] },
        ]
    },
    {
        id: 'fra2', title: 'Faza 2: Rotirajući Sklop i Brtvljenje',
        steps: [
            { id: 'f2.1', title: 'Brtva Osovina i Sustav za Podmazivanje', details: ['Pregledati sve dijelove brtve osovine prije montaže.', 'Spojiti centralni sustav za podmazivanje, osiguravajući ispravan tip masti i pravilnu funkciju razina u spremniku.', 'Provjeriti i dokumentirati cijevi za curenje.'] },
            { id: 'f2.2', title: 'Rotor i Distributer', details: ['Pregledati položaj rotora i zazore sa stražnje strane spiralnog kućišta.', 'Provjeriti funkciju distributera turbine i instalirati sve senzore za položaj lopatica.', 'Održavati i čistiti cilindar distributera.'] },
            { id: 'f2.3', title: 'Generator i Ležajevi', details: ['Spojiti osovinu generatora na rotor, provjeravajući vibracije.', 'Provjeriti tipove ležajeva, funkciju podmazivanja i osjetljivost kliznih ležajeva.', 'Spojiti mehaničku pumpu za podmazivanje i kočioni sustav.'] },
        ]
    }
];

const peltonProtocol: ProtocolSection[] = [
    {
        id: 'pel1', title: 'Faza 1: Poravnanje i Fiksiranje Kućišta',
        steps: [
            { id: 'p1.1', title: 'Početno Pozicioniranje', details: ['Postaviti kućište turbine u približan položaj pomoću vijaka za podizanje i metalnih ploča.', 'Poravnati kućište prema središnjim linijama (laserska ili metoda tankog užeta). Provjeriti da se CL ulazne cijevi podudara s CL MIV-a.'] },
            { id: 'p1.2', title: 'Podešavanje Visine i Razine', details: ['Odrediti visinski položaj od prvog betona do središnje točke prirubnice generatora ili prirubnice igle.', 'Koristiti preciznu strojarsku libelu (0.05mm/m) na četiri strane prirubnice generatora kako bi se osigurala savršena razina.'], critical: true },
            { id: 'p1.3', title: 'Fiksiranje Položaja', details: ['Spojiti kućište na temeljni beton pomoću dvokomponentnih kemikalija i navojnih sidrenih šipki.', 'Zavariti T-profile od nosača kućišta do temeljnih sidrenih ploča kako bi se spriječilo bilo kakvo pomicanje tijekom betoniranja.'] },
        ]
    },
    {
        id: 'pel2', title: 'Faza 2: Montaža nakon Betoniranja',
        steps: [
            { id: 'p2.1', title: 'Prstenasti Vod i MIV', details: ['Sastaviti prstenasti vod kućišta. Svi dijelovi su označeni brojem položaja injektora.', 'Instalirati MIV s ispravnim brtvama i usidriti ga u temelj.'] },
            { id: 'p2.2', title: 'Odbijač Mlaznice i Generator', details: ['Instalirati komponente odbijača mlaznice, počevši od cilindra. Pregledati udaljenost do mlaznice i testirati funkciju komprimiranim zrakom.', 'Instalirati brtvu poklopca turbine. Postaviti generator na kućište, osiguravajući da je središnja točka rotora u ravnini sa središtem injektora.', 'Podesiti razinu generatora vijcima za podizanje i metalnim podloškama. Pritegnuti vijke na ispravan moment.'], critical: true },
            { id: 'p2.3', title: 'Integracija Sustava', details: ['Spojiti sve hidrauličke cijevi prema hidrauličkoj shemi. Isprati sustav prije konačnog spajanja.', 'Instalirati sustave za podmazivanje (automatizirana pumpa za mast, uljni ležajevi) prema dokumentaciji.', 'Instalirati i pregledati sve mehaničke i električne senzore.'] },
        ]
    }
];

const AccordionItem: React.FC<{ section: ProtocolSection; isOpen: boolean; onClick: () => void }> = ({ section, isOpen, onClick }) => {
    return (
        <div className="border border-gray-700 rounded-lg bg-gray-800/50">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left p-4"
            >
                <h3 className="text-lg font-bold text-cyan-400">{section.title}</h3>
                <svg
                    className={`w-6 h-6 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700">
                    <div className="space-y-4">
                        {section.steps.map(step => (
                            <div key={step.id}>
                                <h4 className={`font-semibold text-white ${step.critical ? 'text-red-400' : ''}`}>
                                  {step.title}
                                  {step.critical && <span className="ml-2 text-xs font-mono bg-red-500/20 text-red-300 border border-red-500/50 px-2 py-0.5 rounded">KRITIČNO</span>}
                                </h4>
                                <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-gray-300">
                                    {step.details.map((detail, i) => <li key={i}>{detail}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void }> = ({ title, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                isActive
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
        >
            {title}
        </button>
    );
};


const InstallationGuarantee: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [openSection, setOpenSection] = useState<string | null>('gen1');
    const [activeTab, setActiveTab] = useState<'General' | 'Kaplan' | 'Francis' | 'Pelton'>('General');

    const protocols = {
        General: generalProtocol,
        Kaplan: kaplanProtocol,
        Francis: francisProtocol,
        Pelton: peltonProtocol,
    };

    const currentProtocol = protocols[activeTab];

    const handleTabClick = (tab: 'General' | 'Kaplan' | 'Francis' | 'Pelton', firstSectionId: string) => {
        setActiveTab(tab);
        setOpenSection(firstSectionId);
    }

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? null : id);
    };

    return (
        <div className="animate-fade-in">
            <BackButton onClick={onBack} text="Natrag na HUB" />
            <div className='text-center'>
                <h2 className="text-3xl font-bold text-white mb-2">Standard za Montažu Hidroelektrana</h2>
                <p className="text-gray-400 mb-8">Sveobuhvatni kodeks za montažu Kaplan, Francis i Pelton turbina, naglašavajući preciznost, sigurnost i dokumentaciju.</p>
            </div>

            <div className="mb-8 overflow-x-auto">
                <div className="flex space-x-2 border-b border-gray-700 pb-4 w-max">
                    <TabButton title="Opći Protokol" isActive={activeTab === 'General'} onClick={() => handleTabClick('General', 'gen1')} />
                    <TabButton title="Kaplan Turbine" isActive={activeTab === 'Kaplan'} onClick={() => handleTabClick('Kaplan', 's1')} />
                    <TabButton title="Francis Turbine" isActive={activeTab === 'Francis'} onClick={() => handleTabClick('Francis', 'fra1')} />
                    <TabButton title="Pelton Turbine" isActive={activeTab === 'Pelton'} onClick={() => handleTabClick('Pelton', 'pel1')} />
                </div>
            </div>

            <div className="space-y-4">
                {currentProtocol.map(section => (
                    <AccordionItem
                        key={section.id}
                        section={section}
                        isOpen={openSection === section.id}
                        onClick={() => toggleSection(section.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default InstallationGuarantee;
