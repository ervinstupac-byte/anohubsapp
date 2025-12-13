import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import bgImage from '../assets/digital_cfd_mesh.png'; // Koristimo istu pozadinu

export const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false); // Toggle između Login i Sign Up
    const { showToast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                showToast('Registration successful! Please check your email.', 'success');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                showToast('Welcome back to AnoHUB.', 'success');
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900"
             style={{
                 backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url(${bgImage})`,
                 backgroundSize: 'cover', backgroundPosition: 'center'
             }}
        >
            <div className="w-full max-w-md bg-slate-800/80 border border-slate-700 backdrop-blur-md p-8 rounded-2xl shadow-2xl animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">AnoHUB</h1>
                    <p className="text-cyan-400 text-sm font-mono tracking-widest uppercase">Secure Enterprise Access</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Corporate Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                            placeholder="engineer@statkraft.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : (isSignUp ? 'REGISTER ACCOUNT' : 'SECURE LOGIN')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-slate-400 hover:text-white transition-colors underline decoration-slate-600 hover:decoration-white"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : 'Need access? Create Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};