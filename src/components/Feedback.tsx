import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// Props Interface
interface FeedbackProps {
    onClose: () => void;
}

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const Feedback: React.FC<FeedbackProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
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

        window.location.href = `mailto:ino@anohubs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        setIsSent(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            {/* Click outside to close handled by parent div */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="relative w-full max-w-md animate-scale-in z-10">
                <GlassCard className="p-0 border-t-4 border-t-cyan-500 shadow-2xl">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {isSent ? (
                        <div className="text-center py-12 px-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t('feedback.thankYouTitle', 'Thank You!')}</h3>
                            <p className="text-slate-400">{t('feedback.thankYouDesc', 'Your feedback is invaluable for refining the Standard of Excellence.')}</p>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">{t('feedback.rateTitle', 'Rate Your Experience')}</h3>
                                <p className="text-slate-400 text-sm">{t('feedback.rateDesc', 'Help us engineer a better platform.')}</p>
                            </div>

                            {/* Star Rating */}
                            <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`
                                            text-4xl transition-all duration-200 transform hover:scale-110 focus:outline-none p-1
                                            ${rating && star <= rating
                                                ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                                                : 'text-slate-700 hover:text-slate-500'}
                                        `}
                                        type="button"
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            {/* Comment Field */}
                            <div className="mb-6">
                                <textarea
                                    rows={4}
                                    placeholder={t('feedback.placeholder', 'Optional: What can we improve to close the Execution Gap?')}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none resize-none transition-all placeholder-slate-600"
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <ModernButton
                                onClick={handleSend}
                                disabled={!rating}
                                variant="primary"
                                fullWidth
                                className="shadow-lg shadow-cyan-500/20"
                            >
                                {t('feedback.submitBtn', 'Submit Feedback')}
                            </ModernButton>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

// Uklonjen dupli eksport na dnu fajla.