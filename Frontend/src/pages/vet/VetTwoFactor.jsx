import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, CircularProgress,
    Alert, Link, IconButton, InputAdornment, alpha, Divider
} from '@mui/material';
import {
    Pets as PetsIcon,
    VpnKey as VpnKeyIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const VetTwoFactor = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const mainColor = '#7c3aed';
    const bgGradient = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';

    const userId = sessionStorage.getItem('temp_2fa_userId');
    const role = sessionStorage.getItem('temp_2fa_role');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token || token.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/2fa/verify', { token, userId, role });

            sessionStorage.removeItem('temp_2fa_userId');
            sessionStorage.removeItem('temp_2fa_role');

            login(data.user, data.token);

            Swal.fire({
                title: 'Verified!',
                text: 'Access granted.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            navigate('/vet/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid authentication code');
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return <Navigate to="/vet/login" />;
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            p: 2
        }}>
            <Box sx={{
                width: '100%',
                maxWidth: '440px',
                bgcolor: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Box sx={{ background: bgGradient, color: 'white', py: 4, px: 3, textAlign: 'center' }}>
                    <Box sx={{
                        width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, backdropFilter: 'blur(8px)'
                    }}>
                        <VpnKeyIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" fontWeight="900">Security Verify</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>Two-Factor Authentication Required</Typography>
                </Box>

                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                        Please enter the 6-digit code from your authenticator app to continue to the dashboard.
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="000 000"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            disabled={loading}
                            autoFocus
                            inputProps={{
                                style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem', fontWeight: 800 },
                                maxLength: 6
                            }}
                            sx={{ mb: 4 }}
                        />

                        <Button type="submit" fullWidth variant="contained" disabled={loading || token.length !== 6}
                            sx={{
                                background: bgGradient, color: 'white', py: 1.5, borderRadius: '12px', fontSize: '1rem', fontWeight: 700, textTransform: 'none',
                                boxShadow: `0 8px 16px ${alpha(mainColor, 0.2)}`,
                                '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 12px 20px ${alpha(mainColor, 0.3)}` }
                            }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
                        </Button>
                    </form>

                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/vet/login')}
                        sx={{ mt: 4, color: '#94a3b8', textTransform: 'none' }}
                    >
                        Back to Login
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default VetTwoFactor;
