import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * RoleBasedRedirect — All roles land on HomeHub ('/').
 * HomeHub adapts its content and quick-actions based on userRole.
 */
export const RoleBasedRedirect: React.FC = () => {
    const { loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        navigate('/', { replace: true });
    }, [loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#05070a] text-slate-400">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-sm uppercase tracking-wider">Loading...</p>
                </div>
            </div>
        );
    }

    return null;
};
