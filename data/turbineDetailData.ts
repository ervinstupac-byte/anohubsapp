
export interface TurbineComponent {
    name: string;
    description: string;
    criticality: 'High' | 'Medium' | 'Low';
}

export interface TurbineDetail {
    name: string;
    mechanical: TurbineComponent[];
    electrical: TurbineComponent[];
}

export const turbineDetailData: Record<string, TurbineDetail> = {
    kaplan: {
        name: 'Kaplan Turbina',
        mechanical: [
            { name: 'Rotor s Podesivim Lopaticama', description: 'Glavna komponenta koja omogućava visoku efikasnost pri promjenjivim protocima podešavanjem kuta lopatica.', criticality: 'High' },
            { name: 'Mehanizam za Zakretanje Lopatca', description: 'Hidraulički sustav unutar glavčine rotora koji upravlja lopaticama. Zahtijeva precizno brtvljenje.', criticality: 'High' },
            { name: 'Privodno Kolo (Wicket Gate)', description: 'Podesive lopatice koje reguliraju protok vode prema rotoru.', criticality: 'High' },
            { name: 'Usisna Cijev (Draft Tube)', description: 'Povećava iskoristivi pad obnavljanjem kinetičke energije na izlazu iz rotora.', criticality: 'Medium' },
            { name: 'Nosivi i Vodeći Ležajevi', description: 'Podupiru teški rotirajući sklop i prenose aksijalne i radijalne sile.', criticality: 'High' },
        ],
        electrical: [
            { name: 'Generator (Sporohodni)', description: 'Sinkroni generator velikog promjera dizajniran za niske brzine vrtnje, često direktno spojen.', criticality: 'High' },
            { name: 'Sustav Uzbude', description: 'Osigurava istosmjernu struju za magnetsko polje generatora.', criticality: 'Medium' },
            { name: 'Regulator Brzine i Snage', description: 'Upravlja mehanizmom zakretanja lopatica i privodnim kolom za održavanje zadane brzine i snage.', criticality: 'High' },
            { name: 'Rashladni Sustav Generatora', description: 'Obično zračno ili vodeno hlađenje za odvođenje topline s namotaja.', criticality: 'Medium' },
        ],
    },
    francis: {
        name: 'Francis Turbina',
        mechanical: [
            { name: 'Rotor s Fiksnim Lopaticama', description: 'Robusni rotor dizajniran za specifičnu točku najbolje efikasnosti. Osjetljiv na rad izvan optimalnih uvjeta.', criticality: 'High' },
            { name: 'Spiralno Kućište', description: 'Usmjerava vodu ravnomjerno po obodu privodnog kola, osiguravajući stabilan dotok.', criticality: 'Medium' },
            { name: 'Privodno Kolo (Guide Vanes)', description: 'Glavni regulacijski element koji kontrolira protok i snagu turbine.', criticality: 'High' },
            { name: 'Brtva Osovine', description: 'Sprječava curenje vode pod visokim tlakom duž osovine. Kritična za pouzdanost.', criticality: 'High' },
            { name: 'Tlačni Ležaj', description: 'Preuzima ogromne aksijalne sile generirane protokom vode kroz rotor.', criticality: 'High' },
        ],
        electrical: [
            { name: 'Generator (Srednje Brzine)', description: 'Sinkroni generator prilagođen višim brzinama vrtnje u usporedbi s Kaplan turbinama.', criticality: 'High' },
            { name: 'Zaštitni Releji', description: 'Štite generator od preopterećenja, kratkih spojeva i drugih električnih kvarova.', criticality: 'High' },
            { name: 'Transformator', description: 'Podiže napon generatora na razinu prikladnu za prijenos električne energije.', criticality: 'Medium' },
            { name: 'SCADA Sustav', description: 'Nadzire i upravlja svim aspektima rada postrojenja, od turbine do rasklopnog postrojenja.', criticality: 'High' },
        ],
    },
    pelton: {
        name: 'Pelton Turbina',
        mechanical: [
            { name: 'Rotor s Lopaticama (Buckets)', description: 'Disk s dvostrukim lopaticama koje primaju mlaz vode pod visokim tlakom. Podložan zamoru materijala.', criticality: 'High' },
            { name: 'Mlaznice i Igle', description: 'Precizno kontroliraju protok i oblik mlaza vode. Trošenje igle smanjuje efikasnost.', criticality: 'High' },
            { name: 'Deflektor (Odbijač Mlaznice)', description: 'U hitnim slučajevima brzo skreće mlaz s rotora kako bi se spriječio nekontrolirani porast brzine (overspeed).', criticality: 'High' },
            { name: 'Kućište Turbine', description: 'Štiti od prskanja vode i usmjerava vodu prema odvodnom kanalu. Nije pod tlakom.', criticality: 'Low' },
            { name: 'Kočioni Sustav', description: 'Koristi se za zaustavljanje rotora nakon zatvaranja mlaznica.', criticality: 'Medium' },
        ],
        electrical: [
            { name: 'Generator (Brzohodni)', description: 'Često četveropolni ili dvopolni sinkroni generator za visoke brzine vrtnje, ponekad spojen preko multiplikatora.', criticality: 'High' },
            { name: 'Sustav za Zaštitu od Prevelike Brzine', description: 'Nezavisni sustav koji aktivira deflektore i zatvara mlaznice pri detekciji prekomjerne brzine.', criticality: 'High' },
            { name: 'Rasklopno Postrojenje (Switchgear)', description: 'Sklopke i prekidači za sigurno spajanje i odvajanje generatora s mreže.', criticality: 'Medium' },
            { name: 'Sustav Pomoćnog Napajanja (UPS)', description: 'Osigurava napajanje za upravljačke i zaštitne sustave u slučaju nestanka mreže.', criticality: 'Medium' },
        ],
    },
    crossflow: {
        name: 'Crossflow Turbina',
        mechanical: [
            { name: 'Cilindrični Rotor (Lopatice u Obliku Slova C)', description: 'Jednostavan i robustan rotor koji omogućava prolazak vode dva puta kroz lopatice.', criticality: 'High' },
            { name: 'Pravokutna Mlaznica s Regulacijskom Lopatcom', description: 'Jednostavan mehanizam za regulaciju protoka dijeljenjem ulaznog otvora.', criticality: 'Medium' },
            { name: 'Kućište', description: 'Jednostavna struktura koja usmjerava vodu i sprječava prskanje.', criticality: 'Low' },
            { name: 'Standardni Ležajevi', description: 'Često se koriste standardni industrijski kotrljajući ležajevi, što pojednostavljuje održavanje.', criticality: 'Medium' },
        ],
        electrical: [
            { name: 'Asinkroni (Indukcijski) Generator', description: 'Često se koristi zbog jednostavnosti, robusnosti i niže cijene. Može zahtijevati kompenzaciju jalove snage.', criticality: 'High' },
            { name: 'Upravljačka Ploča', description: 'Osnovni sustav za pokretanje, zaustavljanje i zaštitu generatora.', criticality: 'Medium' },
            { name: 'Mrežna Zaštita', description: 'Releji koji štite od otočnog rada, podnapona i prenapona.', criticality: 'High' },
        ],
    },
    flow_through: {
        name: 'Protočna Turbina',
        mechanical: [
            { name: 'Aksijalni Rotor', description: 'Sličan Kaplan rotoru, ali često s fiksnim ili ograničeno podesivim lopaticama za rad u uskom rasponu protoka.', criticality: 'High' },
            { name: 'Cijevno ili Potopljeno Kućište (Bulb/Pit)', description: 'Integrira turbinu i generator u jedinstvenu, hidrodinamički optimiziranu cjelinu unutar toka vode.', criticality: 'High' },
            { name: 'Brtveni Sustavi', description: 'Visoko kritični sustavi koji štite generator i ležajeve od prodora vode.', criticality: 'High' },
            { name: 'Rešetka za Čišćenje (Trash Rack)', description: 'Ključna za sprječavanje ulaska krupnog otpada u turbinu, što može uzrokovati velika oštećenja.', criticality: 'Medium' },
        ],
        electrical: [
            { name: 'Potopljeni Generator', description: 'Posebno dizajniran generator za rad unutar vodonepropusnog kućišta (Bulb ili Pit), zahtijeva efikasno hlađenje.', criticality: 'High' },
            { name: 'Planetarni Prijenosnik (ako se koristi)', description: 'Povećava brzinu vrtnje turbine na brzinu prikladnu za standardni, brži generator.', criticality: 'High' },
            { name: 'Sustav za Praćenje Stanja (CMS)', description: 'Nadzire vibracije, temperature i curenje kako bi se omogućilo prediktivno održavanje.', criticality: 'Medium' },
            { name: 'Podvodni Kabeli', description: 'Visokonaponski kabeli za prijenos energije od potopljenog generatora do obale.', criticality: 'Medium' },
        ],
    },
};
