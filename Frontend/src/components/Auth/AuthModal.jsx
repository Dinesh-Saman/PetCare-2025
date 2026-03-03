import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

import LoginView from './LoginView';
import RegisterView from './RegisterView';
import TwoFactorVerifyView from './TwoFactorVerifyView';
import ForgotPasswordView from './ForgotPasswordView';

const AuthModal = () => {
    const { authModalOpen, authModalView, closeAuthModal } = useAuth();

    const renderView = () => {
        switch (authModalView) {
            case 'login': return <LoginView />;
            case 'register': return <RegisterView />;
            case '2fa': return <TwoFactorVerifyView />;
            case 'forgot': return <ForgotPasswordView />;
            default: return <LoginView />;
        }
    };

    return (
        <Dialog
            open={authModalOpen}
            onClose={closeAuthModal}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: '850px',
                    borderRadius: '28px',
                    overflow: 'hidden', // Strictly no scrollbar
                    position: 'relative',
                    boxShadow: '0 40px 100px -24px rgba(0,0,0,0.35)',
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.05)',
                }
            }}
        >
            <IconButton
                onClick={closeAuthModal}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    zIndex: 100,
                    color: '#64748b',
                    bgcolor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(4px)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                }}
            >
                <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <DialogContent sx={{ p: 0, overflow: 'visible' }}>
                {renderView()}
            </DialogContent>
        </Dialog >
    );
};

export default AuthModal;
