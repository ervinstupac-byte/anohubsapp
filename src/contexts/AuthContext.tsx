import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.ts';
import { useAudit } from './AuditContext.tsx';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    isGuest: boolean; // <--- NOVO
    userRole: 'MANAGER' | 'OWNER' | 'TECHNICIAN' | 'ENGINEER' | null; // <--- NOVO: Role-based routing
    signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
    signInAsGuest: (role: 'MANAGER' | 'OWNER' | 'TECHNICIAN' | 'ENGINEER') => Promise<void>; // <--- NOVO: Accept role parameter
    signOut: () => Promise<void>;
    loading: boolean;
    updateUserMetadata?: (metadata: { full_name?: string; role?: string; company?: string; avatar_url?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logAction } = useAudit(); // HOOK NA VRHU
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(() => {
        try {
            return localStorage.getItem('anohub_is_guest') === 'true';
        } catch {
            return false;
        }
    });
    const [userRole, setUserRole] = useState<'MANAGER' | 'OWNER' | 'TECHNICIAN' | 'ENGINEER' | null>(() => {
        try {
            return localStorage.getItem('anohub_guest_role') as any || null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Provjeri pravu sesiju SAMO ako nismo u guest modu
        // Test hook: if tests set a localStorage flag, auto-sign-in as guest to ease E2E flows
        try {
            const autoGuest = localStorage.getItem('ANOHUB_AUTO_GUEST') === 'true';
            if (autoGuest) {
                const savedProfileRaw = localStorage.getItem('guest_profile');
                let savedProfile: any = {};
                if (savedProfileRaw) {
                    try {
                        savedProfile = JSON.parse(savedProfileRaw);
                    } catch (e) {
                        console.error('Failed to parse guest_profile', e);
                    }
                }
                const guestUser = {
                    id: 'guest-auto-1',
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: 'guest@anohub.com',
                    email_confirmed_at: new Date().toISOString(),
                    phone: '',
                    confirmed_at: new Date().toISOString(),
                    last_sign_in_at: new Date().toISOString(),
                    app_metadata: { provider: 'email', providers: ['email'] },
                    user_metadata: {
                        full_name: savedProfile.full_name || 'Auto Guest',
                        role: savedProfile.role || 'ENGINEER',
                        company: savedProfile.company || 'Demo Mode',
                        avatar_url: savedProfile.avatar_url || ''
                    },
                    identities: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                } as User;
                setIsGuest(true);
                try {
                    localStorage.setItem('anohub_is_guest', 'true');
                    localStorage.setItem('anohub_guest_role', savedProfile.role || 'ENGINEER');
                } catch (err) {}
                setUserRole((savedProfile.role || 'ENGINEER') as any);
                setUser(guestUser);
                setLoading(false);
                try { window.location.hash = '#/'; } catch(e) { /* noop */ }
                logAction('AUTH_LOGIN', 'AutoGuest', 'SUCCESS', {});
                return;
            }
        } catch (e) { /* ignore */ }

        if (isGuest) {
            const savedProfileRaw = localStorage.getItem('guest_profile');
            let savedProfile: any = {};
            if (savedProfileRaw) {
                try {
                    savedProfile = JSON.parse(savedProfileRaw);
                } catch (e) {
                    console.error('Failed to parse guest_profile', e);
                }
            }
            const guestUser = {
                id: 'guest-123',
                aud: 'authenticated',
                role: 'authenticated',
                email: 'guest@anohub.com',
                email_confirmed_at: new Date().toISOString(),
                phone: '',
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                app_metadata: { provider: 'email', providers: ['email'] },
                user_metadata: {
                    full_name: savedProfile.full_name || 'Guest Engineer',
                    role: savedProfile.role || userRole || 'ENGINEER',
                    company: savedProfile.company || 'Demo Mode',
                    avatar_url: savedProfile.avatar_url || ''
                },
                identities: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as User;
            setUser(guestUser);
            setLoading(false);
            return;
        }

        if (!isGuest) {
            // Safety Timeout: if Supabase doesn't respond in 5s, continue as anonymous
            const timeout = setTimeout(() => {
                if (loading) {
                    console.warn('[AUTH] Session check timed out. Proceeding as anonymous.');
                    setLoading(false);
                }
            }, 5000);

            supabase.auth.getSession()
                .then(({ data: { session } }: any) => {
                    clearTimeout(timeout);
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                })
                .catch((err: any) => {
                    clearTimeout(timeout);
                    console.error('[AUTH] Critical session check failure:', err);
                    setLoading(false);
                });
        }

        // Slušaj promjene
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            // Ako smo u guest modu, ignoriraj supabase promjene dok se ne odjavimo
            if (!isGuest) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => { try { subscription.unsubscribe(); } catch (e) { } };
    }, [isGuest, userRole]);

    // 1. STANDARDNI LOGIN
    const signIn = async (email: string, password: string) => {
        setIsGuest(false);
        try {
            localStorage.removeItem('anohub_is_guest');
            localStorage.removeItem('anohub_guest_role');
        } catch (err) {}
        return await supabase.auth.signInWithPassword({ email, password });
    };

    // 2. GUEST LOGIN (Lažiramo korisnika)
    const signInAsGuest = async (role: 'MANAGER' | 'OWNER' | 'TECHNICIAN' | 'ENGINEER') => {
        setIsGuest(true);
        try {
            localStorage.setItem('anohub_is_guest', 'true');
            localStorage.setItem('anohub_guest_role', role);
        } catch (err) {}
        
        const savedProfileRaw = localStorage.getItem('guest_profile');
        let savedProfile: any = {};
        if (savedProfileRaw) {
            try {
                savedProfile = JSON.parse(savedProfileRaw);
            } catch (e) {
                console.error('Failed to parse guest_profile from localStorage', e);
            }
        }

        setUserRole(savedProfile.role || role); // <--- NOVO: Set the user role
        // Kreiramo lažni User objekt da zavaramo TypeScript i UI
        const guestUser = {
            id: 'guest-123',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'guest@anohub.com',
            email_confirmed_at: new Date().toISOString(),
            phone: '',
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: { 
                full_name: savedProfile.full_name || 'Guest Engineer', 
                role: savedProfile.role || role,
                company: savedProfile.company || 'Demo Mode',
                avatar_url: savedProfile.avatar_url || ''
            },
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as User;

        setUser(guestUser);
        setLoading(false); // CRITICAL: Allow AuthProvider to render children
        logAction('AUTH_LOGIN', 'Guest System', 'SUCCESS', { user: 'guest', role: savedProfile.role || role });
    };

    // 3. LOGOUT (Pokriva i Guest i Pravi logout)
    const signOut = async () => {
        const currentUser = user?.email || 'unknown';

        if (isGuest) {
            setIsGuest(false);
            try {
                localStorage.removeItem('anohub_is_guest');
                localStorage.removeItem('anohub_guest_role');
            } catch (err) {}
            setUser(null);
            setSession(null);
            setUserRole(null); // <--- NOVO: Reset user role on logout
            logAction('AUTH_LOGOUT', 'Guest System', 'SUCCESS', { user: currentUser });
        } else {
            await supabase.auth.signOut();
            setUserRole(null); // <--- NOVO: Reset user role on logout
            logAction('AUTH_LOGOUT', 'Supabase Auth', 'SUCCESS', { user: currentUser });
        }
    };

    const updateUserMetadata = (metadata: { full_name?: string; role?: string; company?: string; avatar_url?: string }) => {
        if (user) {
            const updatedUser = {
                ...user,
                user_metadata: {
                    ...user.user_metadata,
                    ...metadata,
                }
            } as User;
            setUser(updatedUser);
            if (metadata.role) {
                setUserRole(metadata.role as any);
                if (isGuest) {
                    try {
                        localStorage.setItem('anohub_guest_role', metadata.role);
                    } catch (err) {}
                }
            }
            if (isGuest) {
                try {
                    const savedProfileRaw = localStorage.getItem('guest_profile');
                    let savedProfile: any = {};
                    if (savedProfileRaw) {
                        try {
                            savedProfile = JSON.parse(savedProfileRaw);
                        } catch (e) {}
                    }
                    const newProfile = { ...savedProfile, ...metadata };
                    localStorage.setItem('guest_profile', JSON.stringify(newProfile));
                } catch (err) {}
            }
        }
    };

    const value = {
        session,
        user,
        isGuest,
        userRole, // <--- NOVO: Export user role
        signIn,
        signInAsGuest, // Exportamo novu funkciju
        signOut,
        loading,
        updateUserMetadata
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
