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
    { title: "Briga o Opremi", description: "Sigurno rukovanje, inspekcija i dokumentirano skladištenje sve opreme s certificiranim procedurama za dizanje i rad." },
    { title: "Obuka Rukovatelja Strojevima", description: "Isporuka dokumenata i obuka na licu mjesta za timove nakon uspješnog puštanja u pogon." },
    { title: "Precizna Montaža", description: "Svijest o čvrstim vezama s prvim betonom i podešavanje opreme s tolerancijama u stotinkama milimetra." },
    { title: "Hidraulički i Lubrikacijski Sustavi", description: "Stručnost u cijelom ciklusu: Montaža, Servis, Rješavanje problema i duboko tehničko razumijevanje." },
    { title: "Fino Podešavanje Rotirajuće Opreme", description: "Vladanje različitim vezama osovina (konusne, stezni set, SCHAAF) i podešavanje spojki." },
    { title: "Garancija za Ispravno Podešavanje Opreme", description: "Mi smo inženjeri strojarstva; radimo u vrlo finim tolerancijama kako bismo garantirali performanse." },
    { title: "Stručnost Višeg Inženjera za Hidroelektrane", description: "Specijalizirano znanje u montaži, rješavanju problema i servisiranju za Francis, Kaplan i Pelton turbine." }
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
                    Mi smo globalni – govorimo engleski, njemački i jezike bivše Jugoslavije, a u nekim slučajevima čak i španjolski ili ruski. S izvanrednim lokalnim vezama stečenim diljem svijeta, donosimo sa sobom mrežu povjerenja i pouzdanosti.
                </p>
            </Section>
        </div>
      </div>
    </div>
  );
};

export default DigitalIntroduction;