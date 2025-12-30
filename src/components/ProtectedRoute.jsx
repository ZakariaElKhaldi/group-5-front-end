import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

// Role hierarchy: ROLE_ADMIN includes all, ROLE_RECEPTIONIST includes ROLE_USER
const roleHierarchy = {
    'ROLE_ADMIN': ['ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_TECHNICIEN', 'ROLE_USER'],
    'ROLE_RECEPTIONIST': ['ROLE_RECEPTIONIST', 'ROLE_USER'],
    'ROLE_TECHNICIEN': ['ROLE_TECHNICIEN', 'ROLE_USER'],
    'ROLE_USER': ['ROLE_USER'],
};

function hasRole(userRoles, requiredRole) {
    if (!userRoles || !requiredRole) return false;

    // Check if user has any role that includes the required role
    for (const userRole of userRoles) {
        const inheritedRoles = roleHierarchy[userRole] || [userRole];
        if (inheritedRoles.includes(requiredRole)) {
            return true;
        }
    }
    return false;
}

export function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();
    const hasNotified = useRef(false);

    // Show notification when access is denied due to role
    useEffect(() => {
        if (!loading && user && requiredRole && !hasRole(user.roles, requiredRole) && !hasNotified.current) {
            hasNotified.current = true;
            toast.error('Accès non autorisé à cette page');
        }
    }, [loading, user, requiredRole]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role if required (using hierarchy)
    if (requiredRole && !hasRole(user.roles, requiredRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

