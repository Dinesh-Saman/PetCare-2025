import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Link, Fade, alpha } from '@mui/material';
import { VpnKey as VpnKeyIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TwoFactorVerifyView = () => {
    const { setAuthModalView, authModalRole, login } = useAuth();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isVet = authModalRole === 'vet';
    const mainColor = isVet ? '#7c3aed' : '#2563eb';
    const bgGradient = isVet
        ? 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)'
        : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token || token.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userId = sessionStorage.getItem('temp_2fa_userId');
            const role = sessionStorage.getItem('temp_2fa_role');

            const { data } = await api.post('/auth/2fa/verify', { token, userId, role });

            sessionStorage.removeItem('temp_2fa_userId');
            sessionStorage.removeItem('temp_2fa_role');

            login(data.user, data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid authentication code');
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
                        <VpnKeyIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="800">Two-Factor Auth</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Enter the code from your app</Typography>
                </Box>

                <Box sx={{ p: 4, bgcolor: 'white' }}>
                    <form onSubmit={handleSubmit}>
                        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '0.85rem' }}>{error}</Alert>}

                        <TextField
                            fullWidth label="6-Digit Verification Code" type="text"
                            value={token} onChange={(e) => { setToken(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                            variant="outlined" required disabled={loading} autoFocus
                            placeholder="000 000"
                            sx={{ mb: 3 }}
                            inputProps={{
                                style: { textAlign: 'center', fontSize: '1.6rem', letterSpacing: '0.4rem', fontWeight: 800 },
                                maxLength: 6
                            }}
                            InputProps={{
                                sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                            }}
                        />

                        <Button type="submit" fullWidth variant="contained" disabled={loading || token.length !== 6}
                            sx={{
                                background: bgGradient, color: 'white', py: 1.25, borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, textTransform: 'none',
                                boxShadow: `0 4px 12px ${alpha(mainColor, 0.2)}`,
                                '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 15px ${alpha(mainColor, 0.3)}` }
                            }}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Code'}
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

export default TwoFactorVerifyView;
