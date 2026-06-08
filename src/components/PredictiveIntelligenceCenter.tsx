import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton } from './BackButton';
import { Zap, Activity, TrendingUp, Calculator, ChevronRight } from 'lucide-react';

interface LabCard {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

const CORE_LABS: LabCard[] = [
  {
    id: 'system-prediction',
    title: 'System Prediction Lab',
    description: 'Physics-based turbine performance and power calculation',
    route: '/prediction-lab',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  {
    id: 'vibration-analysis',
    title: 'Vibration Analysis Lab',
    description: 'ISO 10816 compliant vibration and fault diagnosis',
    route: '/vibration-lab',
    icon: <Activity className="w-5 h-5" />,
    color: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'governor-deadband',
    title: 'Governor Deadband Lab',
    description: 'IEC 61362 compliant governor deadband verification',
    route: '/lab/governor-deadband',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'generator-airgap',
    title: 'Generator Air Gap Lab',
    description: 'Stator-rotor eccentricity and air gap measurement',
    route: '/lab/generator-airgap',
    icon: <Calculator className="w-5 h-5" />,
    color: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  }
];

const LabCard: React.FC<{ lab: LabCard; onClick: () => void }> = ({ lab, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`relative p-6 rounded-xl border-2 ${lab.borderColor} ${lab.color} bg-slate-900/50 backdrop-blur-sm transition-all duration-300 group hover:shadow-lg`}
    style={{ minHeight: '160px' }}
  >
    <div className="flex flex-col items-center text-center gap-4 h-full justify-center">
      <div className={`p-4 rounded-xl ${lab.color.replace('bg-', 'bg-opacity-20 ')} text-cyan-400`}>
        {lab.icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">{lab.title}</h3>
        <p className="text-sm text-slate-400 leading-tight">{lab.description}</p>
      </div>
    </div>
    <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
  </motion.button>
);

export const PredictiveIntelligenceCenter: React.FC = () => {
  const navigate = useNavigate();

  const handleLabClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center pt-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Predictive <span className="text-cyan-400">Intelligence Center</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Lean core: Four mathematically verified hydro turbine diagnostic tools
          </p>
        </div>
        <BackButton text="Back to Hub" />
      </div>

      {/* Core Lab Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CORE_LABS.map((lab) => (
          <LabCard
            key={lab.id}
            lab={lab}
            onClick={() => handleLabClick(lab.route)}
          />
        ))}
      </div>
    </div>
  );
};
