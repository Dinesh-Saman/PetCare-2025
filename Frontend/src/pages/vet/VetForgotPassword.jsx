import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, CircularProgress,
    Alert, Link, IconButton, InputAdornment, alpha, Divider
} from '@mui/material';
import {
    Pets as PetsIcon,
    MailOutline as MailIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircleOutline as SuccessIcon
} from '@mui/icons-material';
import api from '../../services/api';

const VetForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const mainColor = '#7c3aed';
    const bgGradient = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email, role: 'vet' });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

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
                        <MailIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" fontWeight="900">Reset Password</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>Veterinary Professional Portal</Typography>
                </Box>

                <Box sx={{ p: 4 }}>
                    {!success ? (
                        <>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
                                Enter the email address associated with your clinic account and we'll send you a link to reset your password.
                            </Typography>

                            <form onSubmit={handleSubmit}>
                                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

                                <TextField
                                    fullWidth
                                    label="Clinic Email Address"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><MailIcon sx={{ color: alpha(mainColor, 0.4) }} /></InputAdornment>,
                                        sx: { borderRadius: '12px' }
                                    }}
                                    sx={{ mb: 3 }}
                                />

                                <Button type="submit" fullWidth variant="contained" disabled={loading}
                                    sx={{
                                        background: bgGradient, color: 'white', py: 1.5, borderRadius: '12px', fontSize: '1rem', fontWeight: 700, textTransform: 'none',
                                        boxShadow: `0 8px 16px ${alpha(mainColor, 0.2)}`,
                                        '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 12px 20px ${alpha(mainColor, 0.3)}` }
                                    }}>
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <SuccessIcon sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
                            <Typography variant="h6" fontWeight="800" gutterBottom>Check your email</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                                We've sent password reset instructions to <b>{email}</b>.
                            </Typography>
                            <Button variant="outlined" fullWidth onClick={() => navigate('/vet/login')} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
                                Return to Login
                            </Button>
                        </Box>
                    )}

                    {!success && (
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/vet/login')}
                            sx={{ mt: 3, color: '#94a3b8', textTransform: 'none', width: '100%' }}
                        >
                            Back to Login
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default VetForgotPassword;
