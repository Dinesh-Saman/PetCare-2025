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
            case 'vet-register': return <RegisterView isVet={true} />; // Reuse RegisterView with a prop
            case '2fa': return <TwoFactorVerifyView />;
            case 'forgot': return <ForgotPasswordView />;
            default: return <LoginView />;
        }
    };

    return (
        <Dialog
            open={authModalOpen}
            onClose={closeAuthModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4, overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
            }}
        >
            <IconButton
                onClick={closeAuthModal}
                sx={{ position: 'absolute', right: 8, top: 8, zIndex: 10, color: '#333' }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                {renderView()}
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
