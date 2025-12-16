import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.ts';
import { useAudit } from './AuditContext.tsx';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    isGuest: boolean; // <--- NOVO
    signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
    signInAsGuest: () => void; // <--- NOVO
    signOut: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logAction } = useAudit(); // HOOK NA VRHU
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false); // <--- NOVO STANJE
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Provjeri pravu sesiju
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Slušaj promjene
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Ako smo u guest modu, ignoriraj supabase promjene dok se ne odjavimo
            if (!isGuest) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [isGuest]);

    // 1. STANDARDNI LOGIN
    const signIn = async (email: string, password: string) => {
        setIsGuest(false);
        return await supabase.auth.signInWithPassword({ email, password });
    };

    // 2. GUEST LOGIN (Lažiramo korisnika)
    const signInAsGuest = () => {
        setIsGuest(true);
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
            user_metadata: { full_name: 'Guest Engineer' },
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as User;

        setUser(guestUser);
        logAction('AUTH_LOGIN', 'Guest System', 'SUCCESS', { user: 'guest' });
    };

    // 3. LOGOUT (Pokriva i Guest i Pravi logout)
    const signOut = async () => {
        const { logAction } = useAudit();
        const currentUser = user?.email || 'unknown';

        if (isGuest) {
            setIsGuest(false);
            setUser(null);
            setSession(null);
            logAction('AUTH_LOGOUT', 'Guest System', 'SUCCESS', { user: currentUser });
        } else {
            await supabase.auth.signOut();
            logAction('AUTH_LOGOUT', 'Supabase Auth', 'SUCCESS', { user: currentUser });
        }
    };

    const value = {
        session,
        user,
        isGuest,
        signIn,
        signInAsGuest, // Exportamo novu funkciju
        signOut,
        loading
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