import React from 'react';
import { BackButton } from './BackButton';

const skills = [
    "Vrhunske tehničke vještine, uključujući rad po dokumentaciji",
    "Sposobnost rada pod pritiskom",
    "Vještine rješavanja problema, uključujući pomoć klijentima i daljinsku podršku",
    "Dnevno izvještavanje o radu, financijsko izvještavanje, upravljanje gradilištem",
    "Organizacija sastanaka s lokalnim klijentima/predstavnicima",
    "Interpersonalne i timske vještine",
    "Izvrsne verbalne i pisane komunikacijske vještine",
    "Komercijalna svijest",
    "Pažnja na detalje",
    "Liderske vještine",
];

const services = [
    { title: "Sigurnost na Prvom Mjestu", description: "Upoznati s međunarodnim normama (Norveška, Švedska, Švicarska, Čile, itd.) i dobro uvedeni u organizacije za sigurnost na gradilištu." },
    { title: "Evaluacija Gradilišta", description: "Inspekcija gradilišta i donošenje konačnih odluka u dogovoru s vašim projektnim menadžmentom." },
    { title: "Koordinacija Lokalnih Partnera", description: "Detaljna obuka i redoviti sastanci s lokalnim timovima kako bi se garantirali rokovi i razjasnili zadaci." },
    { title: "Briga o Opremi", description: "Sigurno rukovanje, inspekcija i dokumentirano skladištenje sve opreme s certificiranim procedurama za dizanje i rad, uključujući ugradnju i kalibraciju osjetljive opreme poput senzora brzine (inductive sensor)." },
    { title: "Obuka Rukovatelja Strojevima", description: "Isporuka dokumenata i obuka na licu mjesta za timove nakon uspješnog puštanja u pogon." },
    { title: "Precizna Montaža", description: "Svijest o čvrstim vezama s prvim betonom i podešavanje opreme s tolerancijama u stotinkama milimetra." },
    { title: "Hidraulički i Lubrikacijski Sustavi", description: "Stručnost u cijelom ciklusu: Montaža, Servis, Rješavanje problema i duboko tehničko razumijevanje." },
    { title: "Fino Podešavanje Rotirajuće Opreme", description: "Vladanje različitim vezama osovina (konusne, stezni set, SCHAAF) i podešavanje spojki." },
    { 
        title: "Garancija Performansi i ROI", 
        description: "Naš precizan rad direktno doprinosi maksimalnoj učinkovitosti turbine, produžava životni vijek opreme i osigurava brži povrat investicije (ROI) za naše klijente." 
    },
    { 
        title: "Stručnost Višeg Inženjera za Hidroelektrane i Opseg Projekata", 
        description: "Posjedujemo specijalizirano, praktično znanje u montaži, rješavanju problema i servisiranju za Francis, Kaplan i Pelton turbine, dokazano kroz uspješno izvedene projekte male hidroelektrane (HPP - Hydro Power Plant). Naše iskustvo obuhvaća širok raspon snage, od malih projekata (npr. 224 kW Kaplan turbina) do velikih sustava (npr. Francis turbine snage do 9.6 MW po jedinici). Imamo dubinsku ekspertizu u radu s raznim konfiguracijama, uključujući Horizontalne i Vertikalne Francis turbine, Horizontalne i Vertikalne Pelton turbine s različitim brojem mlaznica/düsen (npr. 2, 3, 5, 6), te razne tipove Kaplan turbina (Bulb, Pit, s Spiralom). Posebno ističemo kompetenciju u projektima koji uključuju kombinaciju montaže nove opreme i obimnu restauraciju/renovaciju postojećih turbina kako bi se garantirala njihova dugotrajna i pouzdana izvedba (npr. projekti Novaci II, III i IV)." 
    },
    {
        title: "Kompleksna Integracija Sustava",
        description: "Naša stručnost seže izvan pojedinačne turbine. Imamo dokazano iskustvo u planiranju i integraciji kompletnih hidroenergetskih rješenja, često koristeći različite tipove turbina (npr. vertikalne i horizontalne Pelton, ili Francis i Kaplan) unutar iste elektrane kako bismo optimizirali izlaznu snagu za specifične hidrauličke uvjete projekta (npr. HPP Dinč I-II, HPP Kriva reka)."
    },
    {
        title: "Strateško Ublažavanje Rizika (Risk Mitigation)",
        description: "Koristeći međunarodno iskustvo i strogu disciplinu, aktivno prepoznajemo i ublažavamo rizike projekta u ranoj fazi, osiguravajući da su rokovi i proračuni zadržani. Naš pristup u radu s prvim betonom i finim podešavanjem opreme eliminira skupe prerade i štiti vaše kapitalne investicije."
    },
    {
        title: "Digitalna Dokumentacija i Daljinska Podrška",
        description: "Koristimo najnovije alate za dnevno digitalno izvještavanje i precizno financijsko praćenje. Naše vještine rješavanja problema proširuju se na daljinsku tehničku podršku (remote support) nakon puštanja u pogon, osiguravajući brzu intervenciju i minimalan zastoj za operatera."
    }
];

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-6 ${className}`}>
        <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
        {children}
    </div>
);


const DigitalIntroduction: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="animate-fade-in">
      <BackButton onClick={onBack} text="Natrag na HUB" />
      <div className='text-center'>
        <h2 className="text-3xl font-bold text-white mb-2">Digital Introduction & Portfelj Usluga</h2>
        <p className="text-slate-400 mb-8">Sažetak ključnih kompetencija, globalnog iskustva i profesionalnih usluga u hidroenergetskom sektoru.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Section title="Ključne Kompetencije">
                <ul className="space-y-3 text-slate-300">
                    {skills.map((skill, index) => (
                        <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 mr-2 text-cyan-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>{skill}</span>
                        </li>
                    ))}
                </ul>
            </Section>
        </div>
        <div className="lg:col-span-2">
            <Section title="Profesionalne Usluge">
                 <div className="space-y-4 text-slate-300">
                    {services.map((service, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-slate-100">{service.title}</h4>
                            <p className="text-slate-400">{service.description}</p>
                        </div>
                    ))}
                </div>
            </Section>
            <Section title="Globalni Mentalitet" className="mt-8">
                <p className="text-slate-300">
                    Mi smo globalni – govorimo engleski, njemački (što potvrđuje opsežnu suradnju i dokumentaciju s klijentima na tom jeziku) i jezike bivše Jugoslavije (s primarnom lokacijom u Bosni i Hercegovini ), a u nekim slučajevima čak i španjolski ili ruski. S izvanrednim lokalnim vezama stečenim diljem svijeta, donosimo sa sobom mrežu povjerenja i pouzdanosti.
                </p>
            </Section>
            <Section title="Globalni Portfelj i Doseg" className="mt-8">
                <p className="text-slate-300 mb-4">
                    Naše iskustvo nije ograničeno na jednu regiju. Uspješno smo realizirali projekte diljem svijeta, dokazujući našu sposobnost prilagodbe različitim tehničkim standardima, kulturama i tržištima:
                </p>
                <div className="space-y-3 text-sm">
                    <div>
                        <h4 className="font-semibold text-slate-200">Europa:</h4>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-slate-400">
                            <li>Albanija</li>
                            <li>Austrija</li>
                            <li>Bosna i Hercegovina</li>
                            <li>Bugarska</li>
                            <li>Crna Gora</li>
                            <li>Finska</li>
                            <li>Francuska</li>
                            <li>Hrvatska</li>
                            <li>Island</li>
                            <li>Italija</li>
                            <li>Mađarska</li>
                            <li>Njemačka</li>
                            <li>Norveška</li>
                            <li>Portugal</li>
                            <li>Sjeverna Makedonija</li>
                            <li>Srbija</li>
                            <li>Švedska</li>
                            <li>Švicarska</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-200">Azija:</h4>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-slate-400">
                           <li>Filipini</li>
                           <li>Indonezija</li>
                           <li>Kazahstan</li>
                           <li>Malezija</li>
                           <li>Šri Lanka</li>
                           <li>Turska</li>
                           <li>Vijetnam</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-200">Južna Amerika:</h4>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-slate-400">
                            <li>Čile</li>
                            <li>Kolumbija</li>
                            <li>Peru</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-200">Afrika:</h4>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-slate-400">
                            <li>Gvineja</li>
                            <li>Ruanda</li>
                        </ul>
                    </div>
                </div>
            </Section>
        </div>
      </div>
    </div>
  );
};

export default DigitalIntroduction;