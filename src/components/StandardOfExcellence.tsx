import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // <--- IMPORT
import { BackButton } from './BackButton.tsx';

// --- DATA STRUCTURE (Samo metadata, tekst je u JSON-u) ---
const modulesMetadata = [
  { id: 'm1', sysId: 'MOD-01', icon: '💧' },
  { id: 'm2', sysId: 'MOD-02', icon: '🎯' },
  { id: 'm3', sysId: 'MOD-03', icon: '🧠' },
  { id: 'm4', sysId: 'MOD-04', icon: '🤝' },
  { id: 'm5', sysId: 'MOD-05', icon: '📚' },
  { id: 'm6', sysId: 'MOD-06', icon: '🔗' }
];

// --- COMPONENT: MODULE CARD ---
const ModuleCard: React.FC<{
  meta: typeof modulesMetadata[0]; // Primamo samo meta podatke
  isOpen: boolean;
  onClick: () => void;
  delay: number;
}> = ({ meta, isOpen, onClick, delay }) => {
  const { t } = useTranslation(); // <--- HOOK

  return (
    <div 
        onClick={onClick}
        className={`
            relative group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-500 ease-out
            ${isOpen 
                ? 'bg-slate-800/80 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.15)] scale-[1.02]' 
                : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-500'}
            animate-fade-in-up
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px'}}>
        </div>

        <div className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className={`text-3xl p-3 rounded-xl transition-colors ${isOpen ? 'bg-cyan-900/30' : 'bg-slate-800'}`}>
                        {meta.icon}
                    </div>
                    <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{meta.sysId}</span>
                        {/* Dinamički prijevod naslova */}
                        <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-white' : 'text-slate-200'}`}>
                            {t(`standardOfExcellence.modules.${meta.id}.title`)}
                        </h3>
                    </div>
                </div>
                {isOpen && <div className="text-cyan-500 animate-pulse text-xs font-bold uppercase tracking-wider border border-cyan-500/30 px-2 py-1 rounded">Active</div>}
            </div>

            {/* Dinamički prijevod problema */}
            <p className={`text-sm italic mb-4 transition-colors ${isOpen ? 'text-cyan-200' : 'text-slate-400'}`}>
                "{t(`standardOfExcellence.modules.${meta.id}.problem`)}"
            </p>

            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-4 border-t border-slate-700/50">
                    {/* Dinamički prijevod sadržaja */}
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {t(`standardOfExcellence.modules.${meta.id}.content`)}
                    </p>
                </div>
            </div>
        </div>

        {/* Hover Accent Line */}
        <div className={`absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-500 ${isOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
    </div>
  );
};

const StandardOfExcellence: React.FC = () => {
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const { t } = useTranslation(); // <--- HOOK

  const handleToggleModule = (moduleId: string) => {
    setOpenModuleId(prevId => (prevId === moduleId ? null : moduleId));
  };
  
  return (
    <div className="animate-fade-in space-y-12 pb-12 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <BackButton text={t('actions.back', 'Back to Hub')} />
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4">
            {t('standardOfExcellence.title').split('Standard of')[0]} 
            The Standard of <span className="text-cyan-400">Excellence</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            {t('standardOfExcellence.subtitle')}
        </p>
      </div>
      
      {/* MODULE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulesMetadata.map((meta, index) => (
           <ModuleCard
            key={meta.id}
            meta={meta}
            isOpen={openModuleId === meta.id}
            onClick={() => handleToggleModule(meta.id)}
            delay={index * 100}
          />
        ))}
      </div>
      
      {/* CERTIFIED PARTNER MANDATE (GOLD SECTION) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-900/40 to-slate-900 border border-yellow-500/30 p-8 text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
              <div className="flex justify-center items-center gap-6 text-5xl mb-6 opacity-90">
                <span>🏅</span>
                <div className="h-12 w-px bg-yellow-500/30"></div>
                <span>📜</span>
              </div>
              
              <h3 className="text-2xl font-bold text-yellow-400 mb-3 tracking-wide">
                  {t('standardOfExcellence.partnerMandate.title')}
              </h3>
              
              <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {t('standardOfExcellence.partnerMandate.text')}
              </p>

              <div className="mt-6 inline-block px-4 py-1 rounded border border-yellow-500/30 text-yellow-200 text-xs font-mono uppercase tracking-widest">
                  {t('standardOfExcellence.partnerMandate.badge')}
              </div>
          </div>
      </div>

    </div>
  );
};

export default StandardOfExcellence;