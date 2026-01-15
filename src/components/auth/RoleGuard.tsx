import React from 'react';
import { useContextAwareness, UserPersona } from '../../contexts/ContextAwarenessContext';
import { Navigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserPersona[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
    const { activePersona } = useContextAwareness();
    const { showToast } = useToast();

    // ENGINEER has access to everything by default in this hierarchy? 
    // Or strictly check? based on requirement "Technician accessing Executive".
    // Let's implement strict check but maybe define hierarchy logic if needed.
    // For now: Strict inclusion.

    if (!allowedRoles.includes(activePersona)) {
        // Prevent toast spam on initial render if it redirects immediately
        // showToast('Access Denied: Insufficient Permissions', 'error'); 
        return <Navigate to="/access-denied" replace />;
    }

    return <>{children}</>;
};
