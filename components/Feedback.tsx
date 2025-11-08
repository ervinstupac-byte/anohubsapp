import React, { useState, useEffect } from 'react';

interface FeedbackProps {
  onClose: () => void;
}

const Star: React.FC<{ filled: boolean; onHover: () => void; onClick: () => void; }> = ({ filled, onHover, onClick }) => (
    <svg
        onMouseEnter={onHover}
        onClick={onClick}
        className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${filled ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-400'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

export const Feedback: React.FC<FeedbackProps> = ({ onClose }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('General Comment');
    const [comment, setComment] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !comment) {
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
            const response = await fetch('https://formspree.io/f/mqkrvvvy', { // New endpoint for feedback
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                }, 2000); // Close modal after 2 seconds
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    // Close on escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
        >
            <div
                className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg m-4 relative transition-all transform scale-95 animate-scale-in"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    aria-label="Close feedback form"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {status === 'success' ? (
                    <div className="text-center py-12">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 id="feedback-title" className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                        <p className="text-slate-400">Your feedback has been submitted successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center">
                            <h2 id="feedback-title" className="text-2xl font-bold text-white">Provide Feedback</h2>
                            <p className="text-slate-400 mt-1">We value your opinion to improve our platform.</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 text-center">How would you rate your experience?</label>
                            <div className="flex justify-center space-x-2" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        filled={hoverRating >= star || rating >= star}
                                        onHover={() => setHoverRating(star)}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">Feedback Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                <option>General Comment</option>
                                <option>Feature Suggestion</option>
                                <option>Bug Report</option>
                                <option>UI/UX Feedback</option>
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-slate-300 mb-1">Comments</label>
                            <textarea
                                id="comment"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="Tell us more about your experience or suggestions..."
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Your Email (Optional)</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="So we can follow up if needed"
                            />
                        </div>
                        
                        <div className="text-center pt-2">
                            <button
                                type="submit"
                                disabled={status === 'submitting' || rating === 0 || !comment}
                                className="w-full sm:w-auto px-8 py-3 text-lg font-bold rounded-lg transition-all duration-300 bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                            {status === 'error' && <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
