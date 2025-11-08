import React from 'react';
import { BackButton } from './BackButton';

const SuggestionBox: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <BackButton text="Back to HUB" />
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8 max-w-2xl mx-auto">
        <form 
            action="https://formspree.io/f/mvojozll" // Endpoint for info@anohubs.com
            method="POST"
            className="space-y-6"
        >
          <h3 className="text-2xl font-semibold text-white text-center">Submit a Suggestion or Idea</h3>
          
          <div>
            <label htmlFor="suggestion-title" className="block text-sm font-medium text-slate-300 mb-1">Suggestion Title</label>
            <input
              type="text"
              id="suggestion-title"
              name="Title"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="E.g., Improvement for the Risk Assessment Tool"
              required
            />
          </div>
          
          <div>
            <label htmlFor="suggestion-desc" className="block text-sm font-medium text-slate-300 mb-1">Description of Suggestion/Idea</label>
            <textarea
              id="suggestion-desc"
              name="Description"
              rows={5}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Describe your idea, suggestion, or feedback in detail..."
              required
            />
          </div>

           <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Your Email (Optional)</label>
            <input
              type="email"
              id="email"
              name="Email"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="name@example.com"
            />
          </div>

          <input type="hidden" name="_subject" value="New Suggestion/Idea from AnoHUB" />
          
          <div className="text-center pt-4">
            <button 
                type="submit" 
                className="px-8 py-3 text-lg font-bold rounded-lg transition-all duration-300 bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transform hover:-translate-y-1"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionBox;