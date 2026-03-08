import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState('login'); // 'login', 'register', '2fa', 'forgot'
    const [authModalRole, setAuthModalRole] = useState('owner'); // 'owner' or 'vet'

    useEffect(() => {
        const initAuth = async () => {
            const pathname = window.location.pathname;
            let token = null;

            if (pathname.startsWith('/vet')) {
                token = localStorage.getItem('vet_token');
            } else if (pathname.startsWith('/owner')) {
                token = localStorage.getItem('owner_token');
            } else {
                token = localStorage.getItem('owner_token') || localStorage.getItem('vet_token');
            }

            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get('/auth/me');
                    if (res.data.success) {
                        setUser(res.data.user);
                        if (res.data.user.role === 'vet') {
                            localStorage.setItem('vet_token', token);
                            localStorage.setItem('vet_user', JSON.stringify(res.data.user));
                        } else {
                            localStorage.setItem('owner_token', token);
                            localStorage.setItem('owner_user', JSON.stringify(res.data.user));
                        }
                    }
                } catch (err) {
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        if (userData.role === 'vet') {
            localStorage.setItem('vet_token', token);
            localStorage.setItem('vet_user', JSON.stringify(userData));
        } else {
            localStorage.setItem('owner_token', token);
            localStorage.setItem('owner_user', JSON.stringify(userData));
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAuthModalOpen(false);
    };

    const logout = () => {
        setUser(null);
        const pathname = window.location.pathname;
        if (pathname.startsWith('/vet')) {
            localStorage.removeItem('vet_token');
            localStorage.removeItem('vet_user');
        } else if (pathname.startsWith('/owner')) {
            localStorage.removeItem('owner_token');
            localStorage.removeItem('owner_user');
        } else {
            // If logging out from home page or elsewhere, clear all.
            localStorage.removeItem('owner_token');
            localStorage.removeItem('owner_user');
            localStorage.removeItem('vet_token');
            localStorage.removeItem('vet_user');
        }
        localStorage.removeItem('token'); // Clear legacy token if it exists
        delete api.defaults.headers.common['Authorization'];
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
        setUser(userData);
        if (userData.role === 'vet') {
            localStorage.setItem('vet_user', JSON.stringify(userData));
        } else {
            localStorage.setItem('owner_user', JSON.stringify(userData));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
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
