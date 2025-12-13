import React, { useState } from 'react';

// Definiramo props interfejs (dobra praksa)
interface FeedbackProps {
    onClose: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({ onClose }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');

    const handleSend = () => {
        // Ne šaljemo ako nema ocjene
        if (!rating) return;

        const subject = `AnoHUB Feedback (${rating}/5 Stars)`;
        const body = `
Hello AnoHub Team (ino@anohubs.com),

Here is my feedback regarding the platform:

--------------------------------------------------
RATING: ${rating} / 5
--------------------------------------------------
COMMENT:
${comment}
--------------------------------------------------

Sent directly from AnoHUB App.
        `;
        
        // Ova linija otvara tvoj zadani email program (Outlook, Mail, Gmail...)
        // s već upisanom adresom, naslovom i tekstom.
        window.location.href = `mailto:ino@anohubs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Zatvaramo modal odmah nakon klika
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0 pointer-events-none">
            {/* Tamna pozadina (klik zatvara modal) */}
            <div 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm pointer-events-auto transition-opacity animate-fade-in" 
                onClick={onClose}
            ></div>
            
            {/* Glavni prozor */}
            <div className="bg-slate-800 border border-slate-600 w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto p-6 relative animate-scale-in">
                
                {/* Close Button (X) */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2"
                >
                    ✕
                </button>
                
                <h3 className="text-xl font-bold text-white mb-2 text-center">Rate Your Experience</h3>
                <p className="text-slate-400 text-sm text-center mb-6">
                    Help us refine the Standard of Excellence.
                </p>
                
                {/* Zvjezdice za ocjenjivanje */}
                <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`
                                text-4xl transition-all duration-200 transform hover:scale-125 focus:outline-none
                                ${rating && star <= rating 
                                    ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                                    : 'text-slate-600 hover:text-slate-500'}
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
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white mb-6 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none transition-all placeholder-slate-600"
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
            </div>
        </div>
    );
};