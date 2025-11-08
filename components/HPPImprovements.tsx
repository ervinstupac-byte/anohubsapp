import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton';
import { HPPImprovement } from '../types';

const initialIdeas: HPPImprovement[] = [
    {
        id: 'idea-5',
        title: 'Guide Vane Redesign',
        description: 'Future research into redesigning the guide vanes (GV) using a combination of tubercle and denticle technology principles to optimize flow, reduce vibration, and increase efficiency at partial loads.',
        category: 'Systemic',
    },
    {
        id: 'idea-4',
        title: 'Shark Skin (DENTICLE) Technology',
        description: 'Application of micro-structures inspired by shark skin (denticles) on blade and casing surfaces to reduce friction, prevent biofilm buildup, and improve hydrodynamic efficiency.',
        category: 'Mechanical',
    },
    {
        id: 'idea-1',
        title: '"Whale Fin" Runner-Stator Unit',
        description: 'A biomimetic runner with a leading edge featuring tubercles (inspired by humpback whales) for maximum efficiency in turbulent conditions. Includes an integrated conical stator to recover vortex energy.',
        category: 'Mechanical',
    },
    {
        id: 'idea-2',
        title: 'Passive Positioning System for Pico-Hydropower',
        description: 'An innovative system that uses hydrodynamic fins to passively position a pico-turbine in the main river current, eliminating the need for energy-intensive active thrusters.',
        category: 'Ecological',
    },
    {
        id: 'idea-3',
        title: '"Hydraulic Heart" System',
        description: 'A hybrid energy storage concept that combines the principles of a pumped-storage hydropower (PSH) with a mechanical buoyancy engine, creating a dual-cycle system for energy generation and storage.',
        category: 'Systemic',
    },
];

const LOCAL_STORAGE_KEY = 'hpp-improvement-ideas';

const HPPImprovements: React.FC = () => {
  const [ideas, setIdeas] = useState<HPPImprovement[]>(() => {
    try {
        const savedIdeas = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedIdeas) {
            const parsedIdeas = JSON.parse(savedIdeas);
            if(Array.isArray(parsedIdeas) && parsedIdeas.length > 0) {
              return parsedIdeas;
            }
        }
    } catch (error) {
        console.error("Failed to load ideas from localStorage", error);
    }
    return initialIdeas;
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HPPImprovement['category']>('Mechanical');

  useEffect(() => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ideas));
    } catch (error) {
        console.error("Failed to save ideas to localStorage", error);
    }
  }, [ideas]);

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

  const handleDelete = (idToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== idToDelete));
    }
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
      <BackButton text="Back to HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">HPP Ino-Hub</h2>
        <p className="text-gray-400 mb-8">Log, categorize, and develop your innovative ideas for hydropower plant improvements.</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Log a New Idea</h3>
          <div>
            <label htmlFor="idea-title" className="block text-sm font-medium text-slate-300 mb-1">Idea Title</label>
            <input
              type="text"
              id="idea-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="E.g., 'Whale Fin' Runner for Distributor Vanes"
              required
            />
          </div>
           <div>
            <label htmlFor="idea-category" className="block text-sm font-medium text-slate-300 mb-1">Category</label>
            <select
              id="idea-category"
              value={category}
              onChange={e => setCategory(e.target.value as HPPImprovement['category'])}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="Mechanical">Mechanical</option>
              <option value="Digital">Digital</option>
              <option value="Ecological">Ecological</option>
              <option value="Systemic">Systemic</option>
            </select>
          </div>
          <div>
            <label htmlFor="idea-desc" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              id="idea-desc"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Describe the concept, its benefits, and potential challenges..."
              required
            />
          </div>
          <div className="text-right">
            <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors">
              Add Idea
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-white mb-4 text-center">Idea Log</h3>
        {ideas.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No ideas have been logged yet. Use the form above to start collecting your innovations.</p>
        ) : (
          <div className="space-y-4">
            {ideas.map(idea => (
              <div key={idea.id} className="bg-slate-700/50 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-lg font-bold text-white">{idea.title}</h4>
                  <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full border ${categoryColor(idea.category)}`}>{idea.category}</span>
                </div>
                <p className="mt-2 text-slate-300">{idea.description}</p>
                <div className="text-right mt-3">
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="inline-flex items-center space-x-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                    aria-label={`Delete idea: ${idea.title}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HPPImprovements;