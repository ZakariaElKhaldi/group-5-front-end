import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch full user profile from /api/me
    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/me');
            const data = response.data;
            setUser({
                id: data.id,
                email: data.email,
                nom: data.nom,
                prenom: data.prenom,
                roles: data.roles,
                role: data.role, // NEW: dynamic role object with permissions
                permissions: data.role?.permissions || [], // NEW: flat permissions array
                technicien: data.technicien, // Contains id, specialite, tauxHoraire, statut
            });
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // Token might be invalid, clear it
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 > Date.now()) {
                    // Fetch full profile from /api/me
                    fetchUserProfile().finally(() => setLoading(false));
                } else {
                    localStorage.removeItem('token');
                    setLoading(false);
                }
            } catch (error) {
                localStorage.removeItem('token');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/login_check', {
            username: email,
            password,
        });
        const { token } = response.data;
        localStorage.setItem('token', token);

        // Fetch full profile after login
        await fetchUserProfile();

        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Update technician status
    const updateTechnicienStatus = async (newStatus) => {
        try {
            const response = await api.patch('/me/status', { statut: newStatus });
            if (user?.technicien) {
                setUser({
                    ...user,
                    technicien: {
                        ...user.technicien,
                        statut: response.data.statut,
                    },
                });
            }
            return response.data;
        } catch (error) {
            console.error('Failed to update status:', error);
            throw error;
        }
    };

    const isAdmin = () => user?.roles?.includes('ROLE_ADMIN');
    const isTechnicien = () => user?.roles?.includes('ROLE_TECHNICIEN');
    const isReceptionist = () => user?.roles?.includes('ROLE_RECEPTIONIST');
    const getTechnicienId = () => user?.technicien?.id || null;
    const getTechnicienStatus = () => user?.technicien?.statut || null;

    // NEW: Permission-based access control
    const hasPermission = (permission) => {
        if (!user || !user.permissions) return false;
        // Wildcard permission grants access to everything
        if (user.permissions.includes('*')) return true;
        // Check for specific permission
        return user.permissions.includes(permission);
    };

    // NEW: Get all permissions for current user
    const getPermissions = () => user?.permissions || [];

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            isAdmin,
            isTechnicien,
            isReceptionist,
            getTechnicienId,
            getTechnicienStatus,
            updateTechnicienStatus,
            fetchUserProfile,
            hasPermission, // NEW
            getPermissions, // NEW
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
