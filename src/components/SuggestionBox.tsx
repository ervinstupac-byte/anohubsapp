import React, { useState } from 'react';
import { BackButton } from './BackButton';

const SuggestionBox: React.FC = () => {
    const [formData, setFormData] = useState({ title: '', category: 'Process Improvement', description: '', email: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const subject = `AnoHub Idea: ${formData.title} (${formData.category})`;
        const body = `
Hello AnoHub Team (ino@anohubs.com),

I have a suggestion for the platform:

--- IDEA DETAILS ---
Title: ${formData.title}
Category: ${formData.category}

Description:
${formData.description}

--- CONTACT ---
Submitted by: ${formData.email || 'Anonymous User'}
        `;
        
        // Otvara defaultni email klijent (Outlook, Gmail...)
        window.location.href = `mailto:ino@anohubs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const inputClass = "w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors";

    return (
        <div className="animate-fade-in max-w-3xl mx-auto pb-10">
            <BackButton text="Back to HUB" />
            
            <div className="glass-panel p-8 rounded-2xl border-t-4 border-cyan-500 mt-4 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Suggestion & Idea Log</h2>
                    <p className="text-slate-400">Share your expertise. Help us close the Execution Gap.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Suggestion Title</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            className={inputClass} 
                            placeholder="e.g., Improved Laser Target Mount"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                        <select 
                            value={formData.category} 
                            onChange={e => setFormData({...formData, category: e.target.value})} 
                            className={inputClass}
                        >
                            <option>Process Improvement</option>
                            <option>Digital Tool Feature</option>
                            <option>Safety Protocol</option>
                            <option>Cost Saving</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Detailed Description</label>
                        <textarea 
                            required 
                            rows={6} 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            className={inputClass} 
                            placeholder="Describe the current problem and your proposed solution..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Your Email (Optional)</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            className={inputClass} 
                            placeholder="Only if you want a reply" 
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <span>🚀</span> SEND PROPOSAL TO HQ
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-3">
                            This will open your email client to send data securely to <strong>ino@anohubs.com</strong>.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuggestionBox;