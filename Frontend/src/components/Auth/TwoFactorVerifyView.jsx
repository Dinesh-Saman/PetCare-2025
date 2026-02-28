import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Link } from '@mui/material';
import { VpnKey as VpnKeyIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TwoFactorVerifyView = () => {
    const { setAuthModalView, login } = useAuth();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        <Box>
            <Box sx={{ background: 'linear-gradient(90deg, #2196f3, #21cbf3)', color: 'white', py: 4, textAlign: 'center' }}>
                <VpnKeyIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">Two-Factor Authentication</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Enter the code from your authenticator app</Typography>
            </Box>

            <Box sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                    <TextField
                        fullWidth label="6-Digit Code" type="text"
                        value={token} onChange={(e) => { setToken(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                        variant="outlined" required disabled={loading} autoFocus
                        placeholder="123456"
                        sx={{ mb: 3 }}
                        inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
                    />

                    <Button type="submit" fullWidth variant="contained" disabled={loading || token.length !== 6}
                        sx={{
                            background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
                            color: 'white', py: 1.5, borderRadius: 3, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none',
                            '&:hover': { background: 'linear-gradient(90deg, #1976d2, #00bcd4)' }
                        }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
                    </Button>
                </form>

                <Box textAlign="center" mt={3}>
                    <Link component="button" type="button" onClick={() => setAuthModalView('login')} sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                        Back to Login
                    </Link>
                </Box>
            </Box>
        </Box>
    );
};

export default TwoFactorVerifyView;
