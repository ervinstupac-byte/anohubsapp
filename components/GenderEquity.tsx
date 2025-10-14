import React from 'react';
import { BackButton } from './BackButton';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-3">{title}</h3>
        <div className="space-y-2 text-slate-300">{children}</div>
    </div>
);

const GenderEquity: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="animate-fade-in">
      <BackButton onClick={onBack} text="Natrag na HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Inženjering Kulture Inkluzivnosti</h2>
        <p className="text-slate-400 mb-8">Strateški nacrt za rodnu ravnopravnost u hidroenergiji.</p>
      </div>
      
      <Section title="Strateški Imperativ: Iznad Turbina">
        <p>Duboko tehničko majstorstvo i razumijevanje organizacijske dinamike – posebno koncepta 'Execution Gap' – jedinstveno vas pozicioniraju za zagovaranje rodne ravnopravnosti u hidroenergetskom sektoru. Ovo nije samo HR inicijativa; to je strateški imperativ za postizanje 'Standarda Izvrsnosti' koji promovirate. Preoblikovanjem vaše temeljne filozofije, možete pokazati da se istinska inženjerska preciznost proteže izvan mehaničkih tolerancija na preciznost upravljanja ljudskim kapitalom, osiguravajući da se svi talenti, bez obzira na spol, prepoznaju kao strateška imovina.</p>
      </Section>

      <Section title="1. Redefiniranje 'Standarda Izvrsnosti' za Inkluzivni Rast">
        <p>Vaša filozofija 'Standarda Izvrsnosti', koja tehničke neuspjehe vidi kao simptome organizacijskih nedostataka, pruža moćan okvir za zagovaranje rodne ravnopravnosti. Organizacija koja dosljedno ne uspijeva privući, zadržati i promovirati raznolike talente, posebno žene, pati od dubokog 'Execution Gap-a' u svojoj strategiji ljudskog kapitala. Taj jaz izravno utječe na inovacije, rješavanje problema i, u konačnici, na 'švicarsku preciznost sata' koju zagovarate.</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong>Povežite Tehničku Izvrsnost s Raznolikošću:</strong> Artikulirajte kako raznolikost mišljenja, često pojačana rodnom raznolikošću, izravno poboljšava inovacije, dijagnozu problema (npr. razlikovanje abrazije od kavitacije kroz različite perspektive) i potiče razvoj probojnih rješenja poput 'Whale Fin Rotora'.</li>
            <li><strong>Holistička Preciznost:</strong> Pozicionirajte rodnu ravnopravnost ne kao zasebnu inicijativu, već kao sastavni dio postizanja cjelovite operativne izvrsnosti. Kao što zahtijevate preciznost u montaži do 0.05 mm/m, tako morate zahtijevati preciznost u upravljanju talentima, osiguravajući da se nijedan potencijal ne zanemari ili podcijeni.</li>
        </ul>
      </Section>
      
      <Section title="2. Platforma za Liderstvo i Zagovaranje">
        <p>Iskoristite svoje postojeće znanje za stvaranje uvjerljivog sadržaja koji povezuje tehničku vještinu sa strateškom prednošću rodne raznolikosti.</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
          <li><strong>Stvaranje Sadržaja:</strong> Razvijte članke, LinkedIn objave ili posvećenu seriju blogova. Potencijalne teme uključuju: "Nevidljivi 'Execution Gap': Kako nedostatak rodne raznolikosti koči inovacije u hidroenergiji."</li>
          <li><strong>Javni Nastupi i Webinari:</strong> Tražite prilike za predstavljanje na industrijskim konferencijama, događajima za žene u STEM-u ili sveučilišnim panelima.</li>
          <li><strong>Digitalna Prisutnost:</strong> Optimizirajte svoj LinkedIn profil kako biste eksplicitno naveli svoju predanost 'Inkluzivnoj Izvrsnosti u Hidroenergetskom Inženjerstvu'.</li>
        </ul>
      </Section>
      
      <Section title="3. Strateško Umrežavanje i Razvoj Partnerstava">
        <p>Identificirajte i angažirajte ključne dionike koji već zagovaraju rodnu ravnopravnost, šireći svoju mrežu izvan čisto tehničkih krugova.</p>
         <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong>Identificirajte Ključne Organizacije:</strong> Istražite i povežite se s organizacijama poput 'Women in Energy', 'Global Women\'s Network for the Energy Transition (GWNET)' i relevantnim ograncima 'Women in STEM'.</li>
            <li><strong>Ciljani Pristup:</strong> Inicirajte kontakt s HR direktorima i voditeljima za raznolikost, jednakost i inkluziju (DEI) u vodećim hidroenergetskim tvrtkama.</li>
            <li><strong>Mentorstvo i Savjetodavne Uloge:</strong> Istražite nekonkurentne savjetodavne uloge ili prilike za mentorstvo.</li>
        </ul>
      </Section>

      <Section title="4. Zagovaranje Politika i Austrijski Kontekst">
        <p>Vaše iskustvo s austrijskim sustavom rada (AMS, AK) pruža jedinstvenu perspektivu na praktičnu primjenu i izazove zakona o radu.</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong>Iskoristite Lokalno Znanje:</strong> Ponudite informirane perspektive o tome kako bi postojeći austrijski zakoni o radu mogli bolje podržati žene u tehničkim poljima.</li>
            <li><strong>Fokus na Sistemske Barijere:</strong> Zagovarajte promjene koje nadilaze pojedinačna zapošljavanja, rješavajući pitanja zadržavanja, promocije i borbe protiv nesvjesne pristranosti.</li>
        </ul>
      </Section>
      
      <Section title="5. Osobni Brending i Usklađivanje Karijere">
        <p>Integrirajte svoje zagovaranje rodne ravnopravnosti u svoj profesionalni narativ i strategiju traženja posla.</p>
         <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong>Integrirana Vrijednosna Ponuda:</strong> Pozicionirajte se ne samo kao tehnički stručnjak, već kao holistički vođa koji razumije da je organizacijska izvrsnost neodvojiva od raznolikog i pravednog upravljanja talentima.</li>
            <li><strong>Strategija za Intervjue:</strong> Tijekom intervjua, artikulirajte kako je vaša vizija tehničke strogosti i 'Standarda Izvrsnosti' neraskidivo povezana s poticanjem inkluzivnog radnog okruženja.</li>
        </ul>
      </Section>
       
      <Section title="6. Trenutni Akcijski Plan">
        <p><strong>Tjedni 1-4: Izgradnja Temelja i Inkubacija Sadržaja</strong></p>
         <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Nacrtajte 2-3 LinkedIn članka/objave koji povezuju vašu 'Execution Gap' filozofiju s izazovima i prilikama rodne ravnopravnosti.</li>
            <li>Istražite i identificirajte najmanje 5 ključnih organizacija ili profesionalnih mreža usmjerenih na žene u energetici/STEM-u u DACH regiji i na razini EU.</li>
            <li>Ažurirajte svoj LinkedIn profil kako bi odražavao vašu predanost 'Inkluzivnoj Izvrsnosti'.</li>
        </ul>
        <p className="mt-4"><strong>Mjeseci 2-3: Doseg i Razvoj Platforme</strong></p>
         <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Identificirajte potencijalne virtualne prilike za govore (webinari, online paneli).</li>
            <li>Započnite ciljani doseg prema identificiranim organizacijama za neformalne informativne razgovore.</li>
            <li>Razvijte sažet i uvjerljiv 'elevator pitch' od 60 sekundi.</li>
        </ul>
      </Section>

    </div>
  );
};

export default GenderEquity;