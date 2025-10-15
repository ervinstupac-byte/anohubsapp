import React, { useState } from 'react';
import { BackButton } from './BackButton';

const sectionsData = [
  {
    id: 'faza1',
    title: 'I. Hydrodynamic Immunity (Temeljna Faza Upravljanja Rizikom)',
    content: (
      <>
        <p className="mb-3">Ovo je najkritičnija faza, jer se ovdje rizici eliminiraju, a ne ublažavaju. Ulaganje u superioran dizajn stvara inherentni imunitet postrojenja na kronične kvarove, osiguravajući dugoročnu stabilnost i zaštitu imovine od samog početka.</p>
        <ul className="list-disc list-inside pl-2 space-y-2">
          <li>
            <strong>Inženjering Imuniteta:</strong> Temeljni princip ove faze je prelazak s reaktivnog popravljanja na proaktivno eliminiranje rizika u samom dizajnu. Fokus je na fundamentalnom sprječavanju hidrodinamičke nestabilnosti, vrtloga (vortex shedding) i separacije protoka, čime se uzrok kroničnih kvarova rješava u korijenu.
          </li>
          <li>
            <strong>Dual Application Strategy (Napredna Inovacija):</strong> Istraživanje biomimetičkih rješenja, poput primjene tuberkula (izbočina inspiriranih perajama kita) na lopatice rotora i privodno kolo, predstavlja vrhunac ove filozofije. Cilj je stvoriti sinergijski efekt koji drastično proširuje operativni prozor visoke efikasnosti i smanjuje vibracije. Iako je još u fazi naprednog istraživanja, ova strategija pokazuje smjer budućeg razvoja ka potpunom hidrodinamičkom imunitetu.
          </li>
          <li>
            <strong>Materijalni Mandat (Garancija Dugovječnosti):</strong> Obavezna upotreba martenzitnog nehrđajućeg čelika <strong>13Cr4Ni</strong> za sve ključne hidrauličke komponente. Ovaj mandat osigurava da je materijal izabran na temelju superiorne otpornosti na kavitacijsku eroziju i zamor materijala, a ne isključivo na temelju cijene. Njegova fina mikrostruktura i uravnotežen sastav kroma i nikla pružaju izvanrednu žilavost i sposobnost podnošenja implozijskih šokova kavitacije, čime se eliminira rizik od preuranjenih katastrofalnih kvarova i značajno produžava životni vijek opreme.
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'faza2',
    title: 'II. Flawless Execution (Premošćivanje Jaza)',
    content: (
      <>
        <p className="mb-3">Srž protokola besprijekorne montaže. Ova faza eliminira "Execution Gap" (jaz između plana i izvedbe) kroz apsolutnu preciznost i digitalnu verifikaciju na terenu.</p>
        <ul className="list-disc list-inside pl-2 space-y-2">
          <li>
            <strong>Laserski Mandat:</strong> Obavezna verifikacija poravnanja osovine s tolerancijom manjom od <strong>0.1 mm</strong>. Ovaj korak izravno sprječava 48% rizika od dinamičke nestabilnosti uzrokovane lošom montažom.
          </li>
          <li>
            <strong>Digitalni Audit (3D Skeniranje):</strong> Uspostava QC protokola gdje se svi ključni zavari, momenti pritezanja vijaka i geometrija komponenti mjere 3D skeniranjem i trajno bilježe u digitalnom formatu, stvarajući nepromjenjiv zapis o kvaliteti.
          </li>
          <li>
            <strong>Ljudski Faktor i Sigurnosne Granice:</strong> Sva obuka osoblja na terenu mora biti temeljena na granicama sigurnosti definiranim kroz CFD (računalna dinamika fluida) i FEA (analiza konačnih elemenata) simulacije, osiguravajući duboko razumijevanje operativnih granica.
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'faza3',
    title: 'III. Active Operational Resilience (Prediktivno Upravljanje)',
    content: (
       <>
        <p className="mb-3">Ova faza se odnosi na održavanje optimalnog zdravlja postrojenja kroz proaktivno i prediktivno praćenje, umjesto reaktivnog djelovanja.</p>
         <ul className="list-disc list-inside pl-2 space-y-2">
            <li>
                <strong>Baseline Monitoring ("Otisak Prsta"):</strong> Obavezno snimanje "Otiska Prsta" vibracija i akustike tijekom puštanja u pogon. Ovaj zapis služi kao Zlatni Standard Zdravlja postrojenja, s kojim se uspoređuju sva buduća mjerenja.
            </li>
            <li>
                <strong>Vibracijski Prag (VRT):</strong> Postavljanje internih VRT (Vibratory Risk Threshold) pragova koji su znatno niži od ISO standarda. Cilj je održavati vibracije na <strong>60% ISO granice</strong>, čime se problemi detektiraju u najranijoj fazi.
            </li>
            <li>
                <strong>Mašinsko-Električna Sinergija:</strong> Uvođenje integriranog nadzora koji korelira mehaničke parametre (vibracije, temperatura) s električnim podacima (struja, napon, frekvencija). Ovo omogućuje rano otkrivanje kvarova u automatizaciji i elektro-sustavu koji uzrokuju mehanički stres.
            </li>
        </ul>
       </>
    )
  },
  {
    id: 'faza4',
    title: 'IV. Strategic & Cultural Mandate (Širenje Izvrsnosti)',
    content: (
       <>
        <p className="mb-3">Ova sekcija povezuje tehničku izvrsnost sa širom poslovnom strategijom, kulturom i budućim tehnološkim razvojem.</p>
        <ul className="list-disc list-inside pl-2 space-y-2">
            <li>
                <strong>Digitalni Blizanac (Digital Twin):</strong> Postavljanje vizije za budućnost gdje se koriste AI analitika i virtualne replike postrojenja za potpuno prediktivno održavanje i optimizaciju performansi.
            </li>
            <li>
                <strong>ESG & Kultura Izvrsnosti:</strong> Integracija tehničke preciznosti u šire okvire održivosti (ESG), uključujući <strong>Rodnu Ravnopravnost (Gender Equity)</strong> i ciljeve Europske tehnološke i inovacijske platforme (ETIP/EERA), dokazujući da je inkluzivnost ključna za inovacije.
            </li>
            <li>
                <strong>Aditivna Proizvodnja (AM):</strong> Naglašavanje strateške potrebe za ulaganjem u AM tehnologiju (3D printanje metala) za brzu i jeftinu izradu kompleksnih rezervnih dijelova i prototipova, čime se smanjuju troškovi i povećava operativna fleksibilnost.
            </li>
        </ul>
      </>
    )
  },
  {
    id: 'faza5',
    title: 'V. Održavanje Znanja i Zatvorena Petlja Učenja',
    content: (
       <>
        <p className="mb-3">Izvrsnost nije jednokratno postignuće, već kontinuirani proces. Ova faza osigurava da se svako iskustvo—bilo uspjeh ili neuspjeh—sistematski pretvara u trajno znanje koje jača cijelu organizaciju.</p>
        <ul className="list-disc list-inside pl-2 space-y-2">
            <li>
                <strong>Mandatorna Analiza Korijenskog Uzroka (RCA):</strong> Za svaki značajan kvar ili 'skoro incident', obavezna je provedba strukturirane analize korijenskog uzroka. Zaključci se moraju formalno dokumentirati i unijeti u centralnu bazu znanja.
            </li>
            <li>
                <strong>Živući Standardi (Dynamic Protocols):</strong> Ovaj 'Standard Izvrsnosti' nije statičan dokument. Nalaže se godišnja revizija i ažuriranje svih protokola na temelju novih terenskih podataka, tehnoloških inovacija i zaključaka iz RCA analiza.
            </li>
            <li>
                <strong>Digitalna Baza Znanja:</strong> Uspostava jedinstvene, digitalne baze znanja koja sadrži sve tehničke protokole, povijest održavanja, RCA izvještaje i najbolje prakse. Pristup ovoj bazi mora biti osiguran svim inženjerima i tehničkom osoblju.
            </li>
        </ul>
      </>
    )
  },
  {
    id: 'faza6',
    title: 'VI. Izvrsnost u Lancu Opskrbe i Partnerskom Ekosustavu',
    content: (
       <>
        <p className="mb-3">Standard izvrsnosti ne može postojati izolirano. On se mora protezati na cijeli ekosustav, uključujući dobavljače, proizvođače komponenti i servisne partnere.</p>
        <ul className="list-disc list-inside pl-2 space-y-2">
            <li>
                <strong>Program Certificiranih Partnera:</strong> Samo dobavljači i izvođači koji mogu dokazati usklađenost s ključnim načelima Faze II (Flawless Execution) i materijalnim mandatima mogu dobiti status 'Certificiranog Partnera'. Time se osigurava kvaliteta kroz cijeli lanac vrijednosti.
            </li>
            <li>
                <strong>Mandat Sljedivosti Materijala:</strong> Zahtijeva se potpuna sljedivost materijala (npr. certifikati EN 10204 3.1) za sve kritične komponente. Time se garantira da su specificirani materijali (poput 13Cr4Ni) ugrađeni, a ne zamijenjeni jeftinijim alternativama.
            </li>
             <li>
                <strong>Zajedničke Inovacijske Inicijative:</strong> Poticanje strateških partnerstava s ključnim dobavljačima i akademskim institucijama za zajednička istraživanja i razvoj (R&D), posebno u područjima aditivne proizvodnje, novih materijala i napredne dijagnostike.
            </li>
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

const StandardOfExcellence: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [openSectionId, setOpenSectionId] = useState<string | null>(sectionsData[0]?.id ?? null);

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };
  
  return (
    <div className="animate-fade-in">
      <BackButton onClick={onBack} text="Natrag na HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Standard Izvrsnosti: Šest Faza Upravljanja Rizicima</h2>
        <p className="text-slate-400 mb-8">Holistička metodologija za uspjeh hidroenergetskih projekata, od dizajna do strateške integracije.</p>
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

export default StandardOfExcellence;