import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [vetUser, setVetUser] = useState(() => {
        const saved = localStorage.getItem('vet_user');
        try { return saved ? JSON.parse(saved) : null; } catch { return null; }
    });
    const [ownerUser, setOwnerUser] = useState(() => {
        const saved = localStorage.getItem('owner_user');
        try { return saved ? JSON.parse(saved) : null; } catch { return null; }
    });
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState('login'); // 'login', 'register', '2fa', 'forgot'
    const [authModalRole, setAuthModalRole] = useState('owner'); // 'owner' or 'vet'
    const location = useLocation();

    // Determine "active" user based on current path
    const isVetPath = location.pathname.startsWith('/vet');
    const user = isVetPath ? vetUser : ownerUser; // Strictly separate the sessions visually

    useEffect(() => {
        const initAuth = async () => {
            const vetToken = localStorage.getItem('vet_token');
            const ownerToken = localStorage.getItem('owner_token');

            const validateToken = async (token, role) => {
                try {
                    // Temporarily override interceptor for this check if needed, 
                    // or just rely on the API being configured correctly.
                    const response = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data.success) {
                        const validatedUser = response.data.user;

                        // Safety check: ensure the token belongs to the role we expect
                        // Role in DB might be 'vet' or 'owner' (or staff/enhanced etc)
                        const isVetRole = validatedUser.role === 'vet' || validatedUser.role === 'enhanced' || validatedUser.role === 'clinic_staff';
                        const isOwnerRole = validatedUser.role === 'owner';

                        if (role === 'vet' && isVetRole) {
                            setVetUser(validatedUser);
                            localStorage.setItem('vet_user', JSON.stringify(validatedUser));
                        } else if (role === 'owner' && isOwnerRole) {
                            setOwnerUser(validatedUser);
                            localStorage.setItem('owner_user', JSON.stringify(validatedUser));
                        } else {
                            console.warn(`Token role mismatch: Expected ${role}, got ${validatedUser.role}`);
                        }
                    }
                } catch (err) {
                    console.log(`Failed to validate ${role} token`);
                    if (role === 'vet') {
                        localStorage.removeItem('vet_token');
                        localStorage.removeItem('vet_user');
                        setVetUser(null);
                    } else {
                        localStorage.removeItem('owner_token');
                        localStorage.removeItem('owner_user');
                        setOwnerUser(null);
                    }
                }
            };

            const promises = [];
            if (vetToken) promises.push(validateToken(vetToken, 'vet'));
            if (ownerToken) promises.push(validateToken(ownerToken, 'owner'));

            if (promises.length > 0) {
                await Promise.all(promises);
            }

            setLoading(false);
        };
        initAuth();
    }, []);

    // Sync across tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'vet_user') {
                setVetUser(e.newValue ? JSON.parse(e.newValue) : null);
            }
            if (e.key === 'owner_user') {
                setOwnerUser(e.newValue ? JSON.parse(e.newValue) : null);
            }
            if (e.key === 'vet_token' && !e.newValue) {
                setVetUser(null);
            }
            if (e.key === 'owner_token' && !e.newValue) {
                setOwnerUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (userData, token) => {
        if (userData.role === 'vet') {
            setVetUser(userData);
            localStorage.setItem('vet_token', token);
            localStorage.setItem('vet_user', JSON.stringify(userData));
        } else {
            setOwnerUser(userData);
            localStorage.setItem('owner_token', token);
            localStorage.setItem('owner_user', JSON.stringify(userData));
        }
        // No longer setting global default as interceptor handles it per-path
        setAuthModalOpen(false);
    };

    const logout = (roleOverride) => {
        const pathname = window.location.pathname;
        const targetRole = roleOverride || (pathname.startsWith('/vet') ? 'vet' : 'owner');

        if (targetRole === 'vet') {
            setVetUser(null);
            localStorage.removeItem('vet_token');
            localStorage.removeItem('vet_user');
        } else {
            setOwnerUser(null);
            localStorage.removeItem('owner_token');
            localStorage.removeItem('owner_user');
        }

        // Remove legacy token if any
        localStorage.removeItem('token');
    };

    const openAuthModal = (view = 'login', role = 'owner') => {
        setAuthModalView(view);
        setAuthModalRole(role);
        setAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setAuthModalOpen(false);
    };

    const updateUser = (userData) => {
        if (userData.role === 'vet') {
            setVetUser(userData);
            localStorage.setItem('vet_user', JSON.stringify(userData));
        } else {
            setOwnerUser(userData);
            localStorage.setItem('owner_user', JSON.stringify(userData));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            vetUser,
            ownerUser,
            loading,
            login,
            logout,
            updateUser,
            authModalOpen,
            authModalView,
            setAuthModalView,
            authModalRole,
            setAuthModalRole,
            openAuthModal,
            closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
};
