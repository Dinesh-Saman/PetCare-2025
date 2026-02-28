import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Link, Divider } from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const LoginView = () => {
    const { setAuthModalView, login, setAuthModalOpen } = useAuth();
    const [role, setRole] = useState('owner'); // 'owner' or 'vet'
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const themeColor = role === 'owner' ? '#2196f3' : '#8e24aa';
    const themeGradient = role === 'owner'
        ? 'linear-gradient(90deg, #2196f3, #21cbf3)'
        : 'linear-gradient(90deg, #8e24aa, #ab47bc)';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const isFieldInvalid = (field) => submitted && !formData[field].trim();

    const handleLoginSuccess = (user, token) => {
        login(user, token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', formData);
            if (data.requires2FA) {
                setAuthModalView('2fa');
                sessionStorage.setItem('temp_2fa_userId', data.userId);
                sessionStorage.setItem('temp_2fa_role', data.role);
            } else {
                handleLoginSuccess(data.user, data.token);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            setLoading(true);
            const { data } = await api.post('/auth/google-login', { token: response.credential, role });
            if (data.requires2FA) {
                setAuthModalView('2fa');
                sessionStorage.setItem('temp_2fa_userId', data.userId);
                sessionStorage.setItem('temp_2fa_role', data.role);
            } else {
                handleLoginSuccess(data.user, data.token);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ background: themeGradient, color: 'white', py: 4, textAlign: 'center', transition: 'all 0.3s ease' }}>
                <PetsIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">Welcome Back</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Sign in to continue to PetCare</Typography>
            </Box>

            <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', mb: 3, borderRadius: 2, overflow: 'hidden', border: `1px solid ${themeColor}` }}>
                    <Button
                        fullWidth
                        onClick={() => setRole('owner')}
                        sx={{
                            borderRadius: 0,
                            bgcolor: role === 'owner' ? themeColor : 'transparent',
                            color: role === 'owner' ? 'white' : themeColor,
                            '&:hover': { bgcolor: role === 'owner' ? themeColor : 'rgba(33, 150, 243, 0.1)' }
                        }}
                    >
                        Pet Owner
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setRole('vet')}
                        sx={{
                            borderRadius: 0,
                            bgcolor: role === 'vet' ? themeColor : 'transparent',
                            color: role === 'vet' ? 'white' : themeColor,
                            '&:hover': { bgcolor: role === 'vet' ? themeColor : 'rgba(142, 36, 170, 0.1)' }
                        }}
                    >
                        Veterinarian
                    </Button>
                </Box>

                <form onSubmit={handleSubmit} noValidate>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                    <TextField
                        fullWidth label="Email Address" name="email" type="email"
                        value={formData.email} onChange={handleChange}
                        variant="outlined" required disabled={loading} autoFocus
                        error={isFieldInvalid('email')}
                        helperText={isFieldInvalid('email') ? 'Required' : ''}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="Password" name="password" type="password"
                        value={formData.password} onChange={handleChange}
                        variant="outlined" required disabled={loading}
                        error={isFieldInvalid('password')}
                        helperText={isFieldInvalid('password') ? 'Required' : ''}
                        sx={{ mb: 1 }}
                    />

                    <Box textAlign="right" mb={2}>
                        <Link component="button" type="button" variant="body2" onClick={() => setAuthModalView('forgot')} sx={{ color: themeColor }}>
                            Forgot Password?
                        </Link>
                    </Box>

                    <Button type="submit" fullWidth variant="contained" disabled={loading}
                        sx={{
                            background: themeGradient,
                            color: 'white', py: 1.5, borderRadius: 3, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none',
                            '&:hover': { opacity: 0.9 }
                        }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                </form>

                <Box my={3}>
                    <Divider><Typography variant="body2" color="textSecondary">OR</Typography></Divider>
                </Box>

                <Box display="flex" justifyContent="center">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Log in Failed')} />
                </Box>

                <Box textAlign="center" mt={3}>
                    <Typography variant="body2" color="textSecondary">
                        Don't have an account?{' '}
                        <Link component="button" type="button" onClick={() => setAuthModalView(role === 'vet' ? 'vet-register' : 'register')} sx={{ color: themeColor, fontWeight: 'bold' }}>
                            Sign Up
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginView;
