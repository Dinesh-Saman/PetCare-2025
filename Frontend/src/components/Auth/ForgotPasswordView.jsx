import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Link, Fade, InputAdornment, alpha } from '@mui/material';
import { LockReset as LockResetIcon, EmailOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ForgotPasswordView = () => {
    const { setAuthModalView, authModalRole } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isVet = authModalRole === 'vet';
    const mainColor = isVet ? '#7c3aed' : '#2563eb';
    const bgGradient = isVet
        ? 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)'
        : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess('Reset link sent! Please check your inbox.');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fade in timeout={400}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ background: bgGradient, color: 'white', py: 3, textAlign: 'center' }}>
                    <Box sx={{
                        width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, backdropFilter: 'blur(8px)'
                    }}>
                        <LockResetIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="800">Reset Password</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Enter your email to receive a recovery link</Typography>
                </Box>

                <Box sx={{ p: 4, bgcolor: 'white' }}>
                    <form onSubmit={handleSubmit}>
                        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '0.85rem' }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px', fontSize: '0.85rem' }}>{success}</Alert>}

                        <TextField
                            fullWidth size="small" label="Email Address" type="email"
                            value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            variant="outlined" required disabled={loading} autoFocus
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: alpha(mainColor, 0.5), fontSize: 18 }} /></InputAdornment>,
                                sx: { borderRadius: '10px' }
                            }}
                            sx={{ mb: 3 }}
                        />

                        <Button type="submit" fullWidth variant="contained" disabled={loading}
                            sx={{
                                background: bgGradient, color: 'white', py: 1.25, borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, textTransform: 'none',
                                boxShadow: `0 4px 12px ${alpha(mainColor, 0.2)}`,
                                '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 15px ${alpha(mainColor, 0.3)}` }
                            }}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Send Recovery Link'}
                        </Button>
                    </form>

                    <Box textAlign="center" mt={3} pt={2} borderTop="1px solid #f1f5f9">
                        <Link component="button" type="button" onClick={() => setAuthModalView('login')} sx={{ color: mainColor, fontWeight: 800, textDecoration: 'none', fontSize: '0.85rem' }}>
                            Back to Sign In
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
};

export default ForgotPasswordView;
