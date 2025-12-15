import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import bgImage from '../assets/digital_cfd_mesh.png';

export const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'GUEST'>('LOGIN');
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    
    const { showToast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'GUEST') {
                if (!nickname) throw new Error('Please enter a nickname.');
                
                // Sanitizacija nickname-a
                const cleanNick = nickname.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                if (cleanNick.length < 3) throw new Error('Nickname must have at least 3 letters/numbers.');

                // Generiraj siguran "privremeni" identitet
                const randomId = Math.floor(Math.random() * 100000);
                const dummyEmail = `${cleanNick}.${randomId}@guest.anohub.com`; 
                const dummyPassword = `guest-${randomId}-secure`;

                // Guest SignUp (Login ako već postoji je malo vjerojatan s random ID, ali sigurno)
                const { data, error } = await supabase.auth.signUp({
                    email: dummyEmail,
                    password: dummyPassword,
                    options: {
                        data: {
                            full_name: nickname, // Pravo ime za prikaz
                            is_guest: true
                        }
                    }
                });

                if (error) throw error;

                if (data.session) {
                    showToast(`Welcome aboard, ${nickname}! (Guest Mode)`, 'success');
                } else {
                    // Fallback ako je Confirm Email uključen
                    showToast('Please disable "Confirm Email" in Supabase Auth settings.', 'warning');
                }

            } else if (mode === 'REGISTER') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                showToast('Registration successful! Please check your email.', 'success');
                
            } else {
                // LOGIN
                const { error } = await supabase.auth.signInWithPassword({ email, password });
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
                    <p className="text-cyan-400 text-sm font-mono tracking-widest uppercase">Global Operations OS</p>
                </div>

                {/* TABS */}
                <div className="flex bg-slate-900/50 p-1 rounded-lg mb-6 border border-slate-700">
                    {(['LOGIN', 'REGISTER', 'GUEST'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === m ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    
                    {/* INPUTS FOR LOGIN/REGISTER */}
                    {(mode === 'LOGIN' || mode === 'REGISTER') && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Enterprise Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                                    placeholder="engineer@anohub.com"
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
                        </>
                    )}

                    {/* INPUT FOR GUEST */}
                    {mode === 'GUEST' && (
                        <div className="animate-scale-in">
                            <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Choose your Codename</label>
                            <input
                                type="text"
                                required
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-mono"
                                placeholder="e.g. HydroWolf"
                                autoFocus
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                *Guest access creates a temporary session. Perfect for live demos.
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full py-4 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider
                            ${mode === 'GUEST' 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-green-500/20' 
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/20'}
                            hover:-translate-y-1
                        `}
                    >
                        {loading ? 'Authenticating...' : (
                            mode === 'LOGIN' ? 'Access Dashboard' : 
                            mode === 'REGISTER' ? 'Register Account' : 
                            'Initialize Guest Session'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[10px] text-slate-600 uppercase flex items-center justify-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-green-500"></span>
                        Secured by Supabase Auth
                    </p>
                </div>
            </div>
        </div>
    );
};