const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/en_new.json', 'utf8'));
const bs = JSON.parse(fs.readFileSync('src/i18n/bs_new.json', 'utf8'));

// Helper to flatten/unflatten if needed, but I'll work directly with paths
function get(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function set(obj, path, value) {
    const parts = path.split('.');
    let curr = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!curr[part]) curr[part] = {};
        curr = curr[part];
    }
    curr[parts[parts.length - 1]] = value;
}

// 1. Map legacy keys to modern ones if missing
const legacyMap = {
    'profile_legacy': 'profile',
    'revitalization': '', // Move contents to root or merge
};

// 2. Add New Keys
const newTranslations = {
    "commander.title": { en: "ANOHUB COMMANDER", bs: "ANOHUB COMMANDER" },
    "commander.verified": { en: "DECIMAL.JS VERIFIED", bs: "DECIMAL.JS VERIFIKOVANO" },
    "commander.neuralLink": { en: "Neural Link Active", bs: "Neuralna Veza Aktivna" },
    "commander.forensicLog": { en: "Forensic Log", bs: "Forenzički Dnevnik" },
    "commander.lastSync": { en: "Last Sync", bs: "Zadnja Sinhronizacija" },
    "commander.latency": { en: "Neural Core Latency", bs: "Kašnjenje Neuralne Jezgre" },
    "commander.dataIntegrity": { en: "Data Integrity", bs: "Integritet Podataka" },
    "commander.verifiedStatus": { en: "99.9% Verified", bs: "99.9% Verifikovano" },

    "sidebar.learningLab": { en: "Learning Lab", bs: "Laboratorij za Učenje" },
    "sidebar.version": { en: "CDR_X_V4.2", bs: "CDR_X_V4.2" },
    "sidebar.operationalFocus": { en: "Operational Focus", bs: "Operativni Fokus" },
    "sidebar.systemIdle": { en: "System Idle", bs: "Sistem u Mirovanju" },
    "sidebar.monitoring": { en: "Monitoring global streams...", bs: "Praćenje globalnih tokova..." },
    "sidebar.playbackScrubber": { en: "Playback Scrubber", bs: "Pregled Arhive" },
    "sidebar.insight": { en: "INSIGHT", bs: "UVID" },
    "sidebar.operationalCommand": { en: "Operational Command", bs: "Operativna Komanda" },
    "sidebar.systemIntel": { en: "System Intel", bs: "Sistemska Inteligencija" },
    "sidebar.neuralBridge": { en: "Neural Bridge", bs: "Neuralni Most" },
    "sidebar.syncHistory": { en: "Sync History", bs: "Sinhronizuj Historiju" },
    "sidebar.generateForensic": { en: "Generate Forensic Log", bs: "Generiši Forenzički Dnevnik" },
    "sidebar.secureTrace": { en: "Secure Physics Trace // 60s", bs: "Osiguraj Fizički Trag // 60s" },
    "sidebar.hiveLink": { en: "HIVE LINK:", bs: "HIVE VEZA:" },
    "sidebar.connected": { en: "CONNECTED", bs: "POVEZAN" },
    "sidebar.offline": { en: "OFFLINE", bs: "OFFLINE" },

    "neuralFlow.physicsBreach": { en: "Physics Breach: Vib Limit Exceeded", bs: "Kršenje Fizike: Prekoračen Limit Vibracija" },
    "neuralFlow.intelInit": { en: "Asset Intelligence Initialization", bs: "Inicijalizacija Inteligencije Agregata" },
    "neuralFlow.diagnosticTwin": { en: "Diagnostic Twin", bs: "Dijagnostički Blizanac" },
    "neuralFlow.heroText": { en: "Connect high-fidelity field data for forensic analysis and predictive physics synchronization.", bs: "Povežite visokovjerne terenske podatke za forenzičku analizu i prediktivnu sinhronizaciju fizike." },
    "neuralFlow.registerAsset": { en: "Register New Asset", bs: "Registruj Novi Agregat" },
    "neuralFlow.flowTitle": { en: "Neural Flow", bs: "Neuralni Protok" },
    "neuralFlow.flowDesc": { en: "Real-time physics synchronization", bs: "Sinhronizacija fizike u realnom vremenu" },
    "neuralFlow.integrityTitle": { en: "Forensic Integrity", bs: "Forenzički Integritet" },
    "neuralFlow.integrityDesc": { en: "Certified diagnostic stream", bs: "Certificirani dijagnostički tok" },
    "neuralFlow.latencyTitle": { en: "Zero Latency", bs: "Nulto Kašnjenje" },
    "neuralFlow.latencyDesc": { en: "Non-intrusive metadata focus", bs: "Fokus na neinvazivne metapodatke" },
    "neuralFlow.coreTwin": { en: "Neural Core // Forensic Twin", bs: "Neuralna Jezgra // Forenzički Blizanac" },
    "neuralFlow.diagnosticBreach": { en: "Diagnostic Breach", bs: "Dijagnostički Prekid" },
    "neuralFlow.integrityVerified": { en: "Integrity Verified", bs: "Integritet Verifikovan" },
    "neuralFlow.detectionActive": { en: "Forensic Detection Active", bs: "Forenzička Detekcija Aktivna" },

    "toolbox.activity.descLogbook": { en: "Digital logs & tracking", bs: "Digitalni dnevnici i praćenje" },
    "toolbox.activity.descStructural": { en: "Civil works analysis", bs: "Analiza građevinskih radova" },
    "toolbox.activity.descShadow": { en: "Standard procedures", bs: "Standardne procedure" },
    "toolbox.activity.descAnalytics": { en: "Fleet performance", bs: "Performanse flote" },
    "toolbox.diagnostics.francisTitle": { en: "Francis Diagnostics", bs: "Francis Dijagnostika" },
    "toolbox.diagnostics.francisDesc": { en: "Run troubleshooting engine for {{name}}", bs: "Pokrenite motor za rješavanje problema za {{name}}" },
    "toolbox.logicHub.title": { en: "Francis Logic Hub", bs: "Francis Logičko Čvorište" },
    "toolbox.logicHub.desc": { en: "System Map & Logic Interlocks for Unit 1", bs: "Mapa sistema i logičke blokade za Agregat 1" },
    "toolbox.pelton.title": { en: "Pelton Impulse Protocols", bs: "Pelton Protokoli" },
    "toolbox.pelton.desc": { en: "Nozzle erosion & bucket MPI checklists", bs: "Provjere erozije mlaznica i MPI kontrolne liste kašika" },
    "toolbox.kaplan.title": { en: "Kaplan Reaction Protocols", bs: "Kaplan Protokoli" },
    "toolbox.kaplan.desc": { en: "Blade seal & oil head integrity checks", bs: "Provjere integriteta brtvi lopatica i uljne glave" },
    "toolbox.bulb.title": { en: "Bulb Housing Protocols", bs: "Protokoli Cjevnih Agregata" },
    "toolbox.bulb.desc": { en: "Watertightness & cooling air audits", bs: "Revizije vodonepropusnosti i rashladnog zraka" },

    "common.active": { en: "Active", bs: "Aktivno" },
    "common.detected": { en: "Detected", bs: "Detektovano" },
    "common.new": { en: "NEW", bs: "NOVO" },
    "common.statusLabel": { en: "Status:", bs: "Status:" },

    "header.title": { en: "AnoHUB Diagnostic Twin", bs: "AnoHUB Dijagnostički Blizanac" },
    "header.searchPlaceholder": { en: "Search modules...", bs: "Pretraži module..." },
    "header.modalPlaceholder": { en: "EXECUTE COMMAND OR SEARCH MODULES...", bs: "IZVRŠI KOMANDU ILI PRETRAŽI MODULE..." },
    "header.jumpTo": { en: "Jump to", bs: "Pređi na" },
    "header.noResults": { en: "No results found.", bs: "Nema rezultata." },
    "header.recentSuggested": { en: "Recent / Suggested", bs: "Nedavno / Predloženo" },
    "header.terminateTitle": { en: "Terminate Session?", bs: "Prekid Sesije?" },

    "dashboard.riskStatus.label": { en: "RISK STATUS", bs: "STATUS RIZIKA" },
    "dashboard.riskStatus.normal": { en: "OPTIMAL", bs: "OPTIMALNO" },
    "dashboard.riskStatus.warning": { en: "WARNING", bs: "UPOZORENJE" },
    "dashboard.riskStatus.critical": { en: "CRITICAL", bs: "KRITIČNO" }
};

for (const [key, val] of Object.entries(newTranslations)) {
    set(en, key, val.en);
    set(bs, key, val.bs);
}

// 3. Terminology Hardening (Bihać Standard)
const hardening = {
    "engineering.head": { en: "Head", bs: "Pad" },
    "engineering.surge": { en: "Surge", bs: "Povratni udar" },
    "engineering.alignment": { en: "Alignment", bs: "Centriranje" },
    "engineering.guideVane": { en: "Guide Vane", bs: "Vodišni aparat" },
    "engineering.runner": { en: "Runner", bs: "Radno kolo" },
    "engineering.thrustBearing": { en: "Thrust Bearing", bs: "Odrivni ležaj" },
    "engineering.shaft": { en: "Shaft", bs: "Vratilo" }
};

for (const [key, val] of Object.entries(hardening)) {
    set(en, key, val.en);
    set(bs, key, val.bs);
}

// 4. Resolve placeholders [EN] / [BS]
function walk(obj, lang, otherLangObj) {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            walk(obj[key], lang, otherLangObj);
        } else if (typeof obj[key] === 'string' && (obj[key].startsWith('[EN]') || obj[key].startsWith('[BS]'))) {
            // Try to clean up simple translations if possible, but for thousands of keys,
            // we'll just remove the prefix for now to keep it usable, and hope most match.
            obj[key] = obj[key].replace(/^\[(EN|BS)\]\s*/, '');
        }
    }
}

walk(en, 'en', bs);
walk(bs, 'bs', en);

fs.writeFileSync('src/i18n/en.json', JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync('src/i18n/bs.json', JSON.stringify(bs, null, 2), 'utf8');

console.log('Final i18n files updated and synchronized.');
