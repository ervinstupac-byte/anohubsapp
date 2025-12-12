import React, { useState } from 'react';

const SuggestionBox: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                setStatus('success');
                form.reset();
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    const inputClass = "w-full bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 backdrop-blur-sm placeholder-slate-500";

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-12">
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Suggestion & <span className="text-cyan-400">Idea Log</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Help us refine the Standard of Excellence. Your field experience is the key to closing the Execution Gap.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* LEFT COLUMN: INSPIRATION & INFO */}
                <div className="space-y-8 lg:sticky lg:top-8">
                    <div className="glass-panel p-8 rounded-2xl border-l-4 border-cyan-500 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="text-3xl">💡</span> Why Contribute?
                        </h3>
                        <p className="text-slate-300 leading-relaxed mb-6">
                            The "Execution Gap" often hides in the details that only those on the front lines can see. 
                            Whether it's a safer way to align a shaft, a digital tool improvement, or a contract clause that needs clarification — 
                            <strong className="text-cyan-400"> we want to know.</strong>
                        </p>
                        <div className="p-4 bg-cyan-900/20 rounded-xl border border-cyan-500/20">
                            <p className="text-sm text-cyan-200 italic">
                                "Innovation is not just about new technology; it's about better discipline and smarter protocols."
                            </p>
                        </div>
                    </div>

                    {/* Direct Contact Option */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 text-center">
                        <p className="text-slate-400 text-sm mb-4">Prefer to send a direct email with attachments?</p>
                        <a 
                            href="mailto:info@anohubs.com?subject=Direct Innovation Submission"
                            className="inline-flex items-center space-x-2 text-cyan-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-xs"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Email: info@anohubs.com</span>
                        </a>
                    </div>
                </div>

                {/* RIGHT COLUMN: THE FORM */}
                <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {status === 'success' ? (
                        <div className="text-center py-12 animate-fade-in-up">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6 border border-green-500/30">
                                <span className="text-4xl">🚀</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Submission Received!</h3>
                            <p className="text-slate-400 mb-8">Thank you for contributing to the collective intelligence of AnoHub.</p>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="text-cyan-400 hover:text-white font-bold underline decoration-cyan-500/50 hover:decoration-white"
                            >
                                Submit another idea
                            </button>
                        </div>
                    ) : (
                        <form 
                            action="https://formspree.io/f/mvojozll" 
                            method="POST" 
                            onSubmit={handleSubmit}
                            className="space-y-6 relative z-10"
                        >
                            <div>
                                <label htmlFor="title" className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="Title"
                                    className={inputClass}
                                    placeholder="e.g. Improved Laser Target Mount"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Category</label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        name="Category"
                                        className={`${inputClass} appearance-none cursor-pointer`}
                                    >
                                        <option>Process Improvement</option>
                                        <option>Safety Protocol</option>
                                        <option>Digital Tool Feature</option>
                                        <option>Cost Saving Idea</option>
                                        <option>Other</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Detailed Description</label>
                                <textarea
                                    id="description"
                                    name="Description"
                                    rows={5}
                                    className={inputClass}
                                    placeholder="Describe the current problem and your proposed solution..."
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Contact Email (Optional)</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="Email"
                                    className={inputClass}
                                    placeholder="For follow-up questions"
                                />
                            </div>

                            <input type="hidden" name="_subject" value="New Innovation Idea from AnoHUB" />

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={status === 'submitting'}
                                    className={`
                                        w-full py-4 px-6 rounded-xl font-bold text-white uppercase tracking-widest shadow-lg
                                        transition-all duration-300 transform flex items-center justify-center gap-3
                                        ${status === 'submitting' 
                                            ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:-translate-y-1 hover:shadow-cyan-500/25'}
                                    `}
                                >
                                    {status === 'submitting' ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Transmitting...
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Proposal</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                                {status === 'error' && (
                                    <p className="text-red-400 text-sm text-center mt-4">Transmission failed. Please check your connection.</p>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuggestionBox;