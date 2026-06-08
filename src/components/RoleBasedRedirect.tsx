import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * RoleBasedRedirect - Automatically redirects users based on their role
 * 
 * Redirect logic:
 * - MANAGER -> /executive
 * - OWNER -> /owner
 * - TECHNICIAN or ENGINEER -> /predictive-intelligence
 * - No role -> / (ToolboxLaunchpad)
 */
export const RoleBasedRedirect: React.FC = () => {
    const { userRole, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        // Redirect based on user role
        if (userRole === 'MANAGER') {
            navigate('/executive');
        } else if (userRole === 'OWNER') {
            navigate('/owner');
        } else if (userRole === 'TECHNICIAN' || userRole === 'ENGINEER') {
            navigate('/predictive-intelligence');
        } else {
            // Default: no role or unknown role -> stay at root (ToolboxLaunchpad)
            navigate('/');
        }
    }, [userRole, loading, navigate]);

    // Show loading state while checking auth
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

    // Return null while redirecting
    return null;
};
