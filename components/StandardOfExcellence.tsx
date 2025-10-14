import React from 'react';
import { BackButton } from './BackButton';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-3">{title}</h3>
        <div className="space-y-2 text-slate-300">{children}</div>
    </div>
);

const StandardOfExcellence: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="animate-fade-in">
      <BackButton onClick={onBack} text="Natrag na HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Okvir "Standard Izvrsnosti"</h2>
        <p className="text-slate-400 mb-8">Holistička metodologija za uspjeh hidroenergetskih projekata, od puštanja u pogon do digitalne transformacije.</p>
      </div>
      
      <Section title="Temeljni Princip: Preciznost kao Osnova">
        <p>Pravo zdravlje hidroenergetskog postrojenja mjeri se u milimetrima. Temelj dugoročne pouzdanosti i profitabilnosti je nepokolebljiva predanost preciznosti, kvantificirana kritičnom tolerancijom od <strong className="text-white">0.05 mm/m</strong> tijekom montaže. To nije tehnička preporuka; to je kulturološki imperativ.</p>
      </Section>

      <Section title="Faza 1: Puštanje u Pogon - Prvi Milimetar je Bitаn">
        <p>Najskuplje greške se prave prvog dana. Disciplinirana faza puštanja u pogon sprječava "tempiranu bombu" latentnih nedostataka.</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
          <li><strong>Strogo Poravnanje:</strong> Korištenje laserskih ili tradicionalnih metoda za garantiranje temeljne točnosti, čime se sprječava 48% rizika od dinamičke nestabilnosti prije nego što se ugradi u postrojenje.</li>
          <li><strong>Dokumentacija kao Imovina:</strong> Tretiranje početnog izvještaja o puštanju u pogon i dnevnika održavanja ne kao birokracije, već kao pravnog i financijskog štita koji osigurava garanciju i dugoročnu vrijednost.</li>
        </ul>
      </Section>
      
      <Section title="Faza 2: Dijagnostika - Slušanje Stroja">
        <p>"Bučna" turbina nije "jaka" turbina; ona pati. Prava stručnost leži u razlikovanju simptoma od temeljnih uzroka.</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
          <li><strong>Abrazija vs. Kavitacija:</strong> Nadilaženje prikladne dijagnoze abrazije kako bi se identificirali i riješili dublji projektni ili operativni nedostaci koji uzrokuju kavitaciju.</li>
          <li><strong>Ljudski Senzor:</strong> Vrednovanje osjetilnog unosa tehničara—sposobnosti da čuje neispravan ležaj ili osjeti suptilnu vibraciju—kao prvog i najvažnijeg sloja dijagnostike.</li>
        </ul>
      </Section>

      <Section title="Faza 3: Održavanje - Disciplina Dugovječnosti">
        <p>Kultura u industriji mora se prebaciti s reaktivnog, profitno vođenog modela "zamijeni" na proaktivni, etički model "popravi i održavaj".</p>
         <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong>Etički Popravci:</strong> Davanje prioriteta popravku komponenti umjesto nepotrebnih potpunih zamjena kako bi se optimizirali troškovi i izgradilo dugoročno povjerenje klijenata.</li>
            <li><strong>Sistemsko Zdravlje:</strong> Razumijevanje da je zdravlje jednog ležaja metafora za zdravlje cijelog sustava. Kultura preciznosti mora se primjenjivati na svaku komponentu.</li>
        </ul>
      </Section>

      <Section title="Digitalna Budućnost: Jedinstveni Digitalni Protokol">
        <p>Povezivanje praktične preciznosti s vizionarskim digitalnim okvirom kako bi se stvorio jedinstveni izvor istine za svako postrojenje.</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
            <li><strong>Digitalni Blizanac i AI Analitika:</strong> Korištenje virtualnih replika i AI-vođenog akustičnog monitoringa za prelazak s reaktivnih popravaka na prediktivno upravljanje zdravljem.</li>
            <li><strong>Daljinska Odgovornost:</strong> Korištenje alata temeljenih na oblaku i daljinskog nadzora za provođenje preciznosti na globalnoj razini, smanjujući troškove i podižući standarde kvalitete.</li>
            <li><strong>Blockchain za Integritet:</strong> Osiguravanje transparentnosti lanca opskrbe i borba protiv krivotvorenih komponenti s nepromjenjivim digitalnim zapisom za svaki kritični dio.</li>
        </ul>
      </section>

    </div>
  );
};

export default StandardOfExcellence;