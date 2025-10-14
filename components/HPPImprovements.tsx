import React, { useState } from 'react';
import { BackButton } from './BackButton';
import { HPPImprovement } from '../types';

interface HPPImprovementsProps {
  onBack: () => void;
}

const initialIdeas: HPPImprovement[] = [
    {
        id: 'idea-1',
        title: '"Kitovo Peraje" (Whale Fin) Rotor-Stator Jedinica',
        description: 'Biomimetički rotor s prednjim rubom s tuberkulama (inspiriran grbavim kitovima) za maksimalnu efikasnost u turbulentnim uvjetima. Sadrži integrirani konusni stator za povrat energije vrtloga.',
        category: 'Mechanical',
    },
    {
        id: 'idea-2',
        title: 'Pasivni Sustav Pozicioniranja za Piko-Hidroelektrane',
        description: 'Inovativni sustav koji koristi hidrodinamičke peraje za pasivno pozicioniranje piko-turbine u glavnoj struji rijeke, eliminirajući potrebu za energetski intenzivnim aktivnim potisnicima.',
        category: 'Ecological',
    },
    {
        id: 'idea-3',
        title: '"Hidrauličko Srce" Sustav',
        description: 'Hibridni koncept za pohranu energije koji kombinira principe reverzibilne hidroelektrane (RHE) s mehaničkim motorom na uzgon, stvarajući dvociklični sustav za proizvodnju i pohranu energije.',
        category: 'Systemic',
    },
];


const HPPImprovements: React.FC<HPPImprovementsProps> = ({ onBack }) => {
  const [ideas, setIdeas] = useState<HPPImprovement[]>(initialIdeas);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HPPImprovement['category']>('Mechanical');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    const newIdea: HPPImprovement = {
      id: new Date().toISOString(),
      title,
      description,
      category,
    };
    setIdeas(prev => [newIdea, ...prev]);
    setTitle('');
    setDescription('');
    setCategory('Mechanical');
  };

  const categoryColor = (cat: HPPImprovement['category']) => {
    switch(cat) {
      case 'Mechanical': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'Digital': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'Ecological': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'Systemic': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  }

  return (
    <div className="animate-fade-in">
      <BackButton onClick={onBack} text="Natrag na HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">HPP-s Ino Hub</h2>
        <p className="text-gray-400 mb-8">Zabilježite, kategorizirajte i razvijajte svoje inovativne ideje za poboljšanja hidroelektrana.</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Zabilježi Novu Ideju</h3>
          <div>
            <label htmlFor="idea-title" className="block text-sm font-medium text-slate-300 mb-1">Naslov Ideje</label>
            <input
              type="text"
              id="idea-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Npr. 'Kitovo Peraje' Rotor za Lopatice Distributora"
              required
            />
          </div>
           <div>
            <label htmlFor="idea-category" className="block text-sm font-medium text-slate-300 mb-1">Kategorija</label>
            <select
              id="idea-category"
              value={category}
              onChange={e => setCategory(e.target.value as HPPImprovement['category'])}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="Mechanical">Mehanička</option>
              <option value="Digital">Digitalna</option>
              <option value="Ecological">Ekološka</option>
              <option value="Systemic">Sistemska</option>
            </select>
          </div>
          <div>
            <label htmlFor="idea-desc" className="block text-sm font-medium text-slate-300 mb-1">Opis</label>
            <textarea
              id="idea-desc"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Opišite koncept, njegove prednosti i potencijalne izazove..."
              required
            />
          </div>
          <div className="text-right">
            <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors">
              Dodaj Ideju
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-white mb-4 text-center">Dnevnik Ideja</h3>
        {ideas.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Još nema zabilježenih ideja. Koristite gornji obrazac za početak prikupljanja vaših inovacija.</p>
        ) : (
          <div className="space-y-4">
            {ideas.map(idea => (
              <div key={idea.id} className="bg-slate-700/50 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-lg font-bold text-white">{idea.title}</h4>
                  <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full border ${categoryColor(idea.category)}`}>{idea.category}</span>
                </div>
                <p className="mt-2 text-slate-300">{idea.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HPPImprovements;