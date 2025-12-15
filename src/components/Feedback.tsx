import React, { useState } from 'react';

// Definiramo props interfejs
interface FeedbackProps {
    onClose: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({ onClose }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
        // Ne šaljemo ako nema ocjene
        if (!rating) return;

        const subject = `AnoHub Feedback (${rating}/5 Stars)`;
        const body = `
Hello AnoHub Team (ino@anohubs.com),

Here is my feedback regarding the platform:

--------------------------------------------------
RATING: ${rating} / 5
--------------------------------------------------
COMMENT:
${comment}
--------------------------------------------------

Sent directly from AnoHub App.
        `;
        
        // Otvara email klijent
        window.location.href = `mailto:ino@anohubs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Prikazujemo poruku zahvale prije zatvaranja
        setIsSent(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
            {/* Tamna pozadina (klik zatvara modal) */}
            <div 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity animate-fade-in" 
                onClick={onClose}
            ></div>
            
            {/* Glavni prozor */}
            <div className="relative bg-slate-800 border border-slate-600 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scale-in overflow-hidden">
                
                {/* Close Button (X) */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 z-10"
                >
                    ✕
                </button>
                
                {isSent ? (
                    <div className="text-center py-10 animate-fade-in">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-xl font-bold text-white">Thank You!</h3>
                        <p className="text-slate-400">Your feedback helps us improve.</p>
                    </div>
                ) : (
                    <>
                        <h3 className="text-xl font-bold text-white mb-2 text-center">Rate Your Experience</h3>
                        <p className="text-slate-400 text-sm text-center mb-6">
                            Help us refine the Standard of Excellence.
                        </p>
                        
                        {/* Zvjezdice za ocjenjivanje */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`
                                        text-3xl sm:text-4xl transition-all duration-200 transform hover:scale-110 focus:outline-none p-1
                                        ${rating && star <= rating 
                                            ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                                            : 'text-slate-600 hover:text-slate-400'}
                                    `}
                                    type="button"
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        {/* Polje za komentar */}
                        <textarea
                            rows={4}
                            placeholder="Optional: What can we improve to close the Execution Gap?"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white mb-6 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none transition-all placeholder-slate-600 text-sm"
                        ></textarea>

                        {/* Gumb za slanje */}
                        <button
                            onClick={handleSend}
                            disabled={!rating}
                            className={`
                                w-full py-3 rounded-xl font-bold uppercase tracking-widest transition-all duration-300
                                ${!rating 
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50' 
                                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:-translate-y-1'}
                            `}
                        >
                            Submit Feedback
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};