import React, { useState, useEffect } from 'react';

interface FeedbackProps {
    onClose: () => void;
}

// --- MODERN STAR COMPONENT ---
const Star: React.FC<{ filled: boolean; onHover: () => void; onClick: () => void; }> = ({ filled, onHover, onClick }) => (
    <button
        type="button"
        onMouseEnter={onHover}
        onClick={onClick}
        className="group relative focus:outline-none transition-transform duration-200 hover:scale-110 p-1"
    >
        <svg
            className={`w-10 h-10 transition-all duration-300 ${
                filled 
                ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]' 
                : 'text-slate-600 group-hover:text-slate-500'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    </button>
);

export const Feedback: React.FC<FeedbackProps> = ({ onClose }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('General Comment');
    const [comment, setComment] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    // Zajednički stil za input polja (Glass efekt)
    const inputClass = "w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 backdrop-blur-sm";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !comment) {
            // Dodati ćemo malu animaciju "trešnje" u budućnosti, za sada alert je ok
            alert("Please provide a rating and a comment."); 
            return;
        }

        setStatus('submitting');
        const formData = new FormData();
        formData.append('Rating', `${rating}/5`);
        formData.append('Category', category);
        formData.append('Comment', comment);
        formData.append('Email', email);
        formData.append('_subject', `New App Feedback (${category}) - ${rating} Stars`);

        try {
            const response = await fetch('https://formspree.io/f/mqkrvvvy', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => onClose(), 2500);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-lg relative overflow-hidden transform transition-all animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Ukrasni sjaj na vrhu */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10 p-2 rounded-full hover:bg-slate-700/50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className="p-8">
                    {status === 'success' ? (
                        <div className="text-center py-10 animate-fade-in-up">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Thank You!</h2>
                            <p className="text-slate-400">Your feedback is crucial for our Standard of Excellence.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-1">We Value Your Input</h2>
                                <p className="text-slate-400 text-sm">Help us close the Execution Gap by sharing your thoughts.</p>
                            </div>
                            
                            {/* RATING SECTION */}
                            <div className="flex flex-col items-center justify-center space-y-2 py-2">
                                <div className="flex justify-center space-x-1" onMouseLeave={() => setHoverRating(0)}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            filled={hoverRating >= star || rating >= star}
                                            onHover={() => setHoverRating(star)}
                                            onClick={() => setRating(star)}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-cyan-400 uppercase tracking-widest h-4">
                                    {hoverRating > 0 ? 
                                        ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating - 1] 
                                        : (rating > 0 ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1] : '')}
                                </span>
                            </div>

                            {/* FORM FIELDS */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option>General Comment</option>
                                        <option>Feature Suggestion</option>
                                        <option>Bug Report</option>
                                        <option>UI/UX Feedback</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Comments</label>
                                    <textarea
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className={inputClass}
                                        placeholder="Tell us more about your experience..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputClass}
                                        placeholder="So we can follow up"
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={status === 'submitting' || rating === 0 || !comment}
                                className={`
                                    w-full py-3.5 px-6 rounded-lg font-bold text-white uppercase tracking-wider shadow-lg
                                    transition-all duration-300 transform
                                    ${(status === 'submitting' || rating === 0 || !comment) 
                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/25 hover:-translate-y-1'
                                    }
                                `}
                            >
                                {status === 'submitting' ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : 'Submit Feedback'}
                            </button>
                            
                            {status === 'error' && (
                                <p className="text-red-400 text-sm text-center animate-pulse">
                                    Something went wrong. Please try again.
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};