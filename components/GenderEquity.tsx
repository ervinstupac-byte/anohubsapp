import React, { useState } from 'react';
import { BackButton } from './BackButton';

const sectionsData = [
  {
    id: 'imperativ',
    title: 'Strateški Imperativ: Iznad Turbina',
    content: (
      <p>Duboko tehničko majstorstvo i razumijevanje organizacijske dinamike – posebno koncepta 'Execution Gap' – predstavljaju jedinstvenu polugu za zagovaranje rodne ravnopravnosti u hidroenergetskom sektoru. Ovo nije samo HR inicijativa; to je strateški imperativ za postizanje 'Standarda Izvrsnosti'. Istinska inženjerska preciznost proteže se izvan mehaničkih tolerancija na preciznost upravljanja ljudskim kapitalom, osiguravajući da se svi talenti, bez obzira na spol, prepoznaju kao strateška imovina.</p>
    )
  },
  {
    id: 'redefiniranje',
    title: '1. Redefiniranje \'Standarda Izvrsnosti\' za Inkluzivni Rast',
    content: (
      <>
        <p>Filozofija 'Standarda Izvrsnosti', koja tehničke neuspjehe vidi kao simptome organizacijskih nedostataka, pruža moćan okvir za zagovaranje rodne ravnopravnosti. Organizacija koja dosljedno ne uspijeva privući, zadržati i promovirati raznolike talente, posebno žene, pati od dubokog 'Execution Gap-a' u svojoj strategiji ljudskog kapitala. Taj jaz izravno utječe na inovacije, rješavanje problema i, u konačnici, na 'švicarsku preciznost sata' koja se zagovara.</p>
        <ul className="list-disc list-inside pl-2 space-y-1 mt-3">
            <li><strong>Povezivanje Tehničke Izvrsnosti s Raznolikošću:</strong> Neophodno je artikulirati kako raznolikost mišljenja, često pojačana rodnom raznolikošću, izravno poboljšava inovacije, dijagnozu problema (npr. razlikovanje abrazije od kavitacije kroz različite perspektive) i potiče razvoj probojnih rješenja.</li>
            <li><strong>Holistička Preciznost:</strong> Rodnu ravnopravnost treba pozicionirati ne kao zasebnu inicijativu, već kao sastavni dio postizanja cjelovite operativne izvrsnosti. Kao što se zahtijeva preciznost u montaži do 0.05 mm/m, tako se mora zahtijevati preciznost u upravljanju talentima, osiguravajući da se nijedan potencijal ne zanemari ili podcijeni.</li>
        </ul>
      </>
    )
  },
  {
    id: 'platforma',
    title: '2. Platforma za Liderstvo i Zagovaranje',
    content: (
      <>
        <p>Korištenje postojećeg znanja omogućuje stvaranje uvjerljivog sadržaja koji povezuje tehničku vještinu sa strateškom prednošću rodne raznolikosti.</p>
        <ul className="list-disc list-inside pl-2 space-y-1 mt-3">
          <li><strong>Stvaranje Sadržaja:</strong> Razvoj članaka, LinkedIn objava ili posvećenih serija blogova. Potencijalne teme uključuju: "Nevidljivi 'Execution Gap': Kako nedostatak rodne raznolikosti koči inovacije u hidroenergiji."</li>
          <li><strong>Javni Nastupi i Webinari:</strong> Traženje prilika za predstavljanje na industrijskim konferencijama, događajima za žene u STEM-u ili sveučilišnim panelima.</li>
          <li><strong>Digitalna Prisutnost:</strong> Optimizacija profesionalnih profila kako bi eksplicitno navodili predanost 'Inkluzivnoj Izvrsnosti u Hidroenergetskom Inženjerstvu'.</li>
        </ul>
      </>
    )
  },
  {
    id: 'umrezavanje',
    title: '3. Strateško Umrežavanje i Razvoj Partnerstava',
    content: (
       <>
        <p>Identifikacija i angažman ključnih dionika koji već zagovaraju rodnu ravnopravnost, što zahtijeva širenje mreže izvan čisto tehničkih krugova.</p>
         <ul className="list-disc list-inside pl-2 space-y-1 mt-3">
            <li><strong>Identifikacija Ključnih Organizacija:</strong> Istraživanje i povezivanje s organizacijama poput 'Women in Energy', 'Global Women\'s Network for the Energy Transition (GWNET)' i relevantnim ograncima 'Women in STEM'.</li>
            <li><strong>Ciljani Pristup:</strong> Iniciranje kontakta s HR direktorima i voditeljima za raznolikost, jednakost i inkluziju (DEI) u vodećim hidroenergetskim tvrtkama.</li>
            <li><strong>Mentorstvo i Savjetodavne Uloge:</strong> Istraživanje nekonkurentnih savjetodavnih uloga ili prilika za mentorstvo.</li>
        </ul>
       </>
    )
  },
  {
    id: 'politike',
    title: '4. Zagovaranje Politika i Lokalni Kontekst',
    content: (
       <>
        <p>Iskustvo s lokalnim sustavima rada (npr. austrijski AMS, AK) pruža jedinstvenu perspektivu na praktičnu primjenu i izazove zakona o radu.</p>
        <ul className="list-disc list-inside pl-2 space-y-1 mt-3">
            <li><strong>Korištenje Lokalnog Znanja:</strong> Pružanje informiranih perspektiva o tome kako bi postojeći zakoni o radu mogli bolje podržati žene u tehničkim poljima.</li>
            <li><strong>Fokus na Sistemske Barijere:</strong> Zagovaranje promjena koje nadilaze pojedinačna zapošljavanja, rješavajući pitanja zadržavanja, promocije i borbe protiv nesvjesne pristranosti.</li>
        </ul>
       </>
    )
  },
   {
    id: 'brending',
    title: '5. Profesionalni Brending i Usklađivanje Karijere',
    content: (
        <>
        <p>Integracija zagovaranja rodne ravnopravnosti u profesionalni narativ i strategiju razvoja karijere.</p>
         <ul className="list-disc list-inside pl-2 space-y-1 mt-3">
            <li><strong>Integrirana Vrijednosna Ponuda:</strong> Pozicioniranje stručnjaka ne samo kao tehničkih eksperata, već kao holističkih vođa koji razumiju da je organizacijska izvrsnost neodvojiva od raznolikog i pravednog upravljanja talentima.</li>
            <li><strong>Strateški Pristup Intervjuima:</strong> Tijekom razgovora, važno je artikulirati kako je vizija tehničke strogosti i 'Standarda Izvrsnosti' neraskidivo povezana s poticanjem inkluzivnog radnog okruženja.</li>
        </ul>
        </>
    )
  },
  {
    id: 'plan',
    title: '6. Strateški Akcijski Plan',
    content: (
      <>
        <p><strong>Faza 1: Izgradnja Temelja i Inkubacija Sadržaja</strong></p>
         <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Izrada nacrta za 2-3 stručna članka/objave koji povezuju filozofiju 'Execution Gap' s izazovima i prilikama rodne ravnopravnosti.</li>
            <li>Istraživanje i identifikacija najmanje 5 ključnih organizacija ili profesionalnih mreža usmjerenih na žene u energetici/STEM-u u DACH regiji i na razini EU.</li>
            <li>Ažuriranje profesionalnih profila kako bi odražavali predanost 'Inkluzivnoj Izvrsnosti'.</li>
        </ul>
        <p className="mt-4"><strong>Faza 2: Doseg i Razvoj Platforme</strong></p>
         <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Identifikacija potencijalnih prilika za virtualne govore (webinari, online paneli).</li>
            <li>Započinjanje ciljanog dosega prema identificiranim organizacijama za neformalne informativne razgovore.</li>
            <li>Razvoj sažetog i uvjerljivog 'elevator pitcha' od 60 sekundi koji sažima ključnu poruku.</li>
        </ul>
      </>
    )
  }
];

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onClick: () => void }> = ({ title, children, isOpen, onClick }) => (
    <div className="border border-slate-700 rounded-lg bg-slate-800/50 mb-4 overflow-hidden">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 hover:bg-slate-700/50 transition-colors"
            aria-expanded={isOpen}
        >
            <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        {isOpen && (
            <div className="p-6 pt-0 text-slate-300 space-y-2 animate-fade-in">
                {children}
            </div>
        )}
    </div>
);


const GenderEquity: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [openSectionId, setOpenSectionId] = useState<string | null>(sectionsData[0]?.id ?? null);

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };

  return (
    <div className="animate-fade-in">
      <BackButton onClick={onBack} text="Natrag na HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Inženjering Kulture Inkluzivnosti</h2>
        <p className="text-slate-400 mb-8">Strateški nacrt za rodnu ravnopravnost u hidroenergiji.</p>
      </div>
      
      <div>
        {sectionsData.map(section => (
           <AccordionSection
            key={section.id}
            title={section.title}
            isOpen={openSectionId === section.id}
            onClick={() => handleToggleSection(section.id)}
          >
            {section.content}
          </AccordionSection>
        ))}
      </div>

    </div>
  );
};

export default GenderEquity;