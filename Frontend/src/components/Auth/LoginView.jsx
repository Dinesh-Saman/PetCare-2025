import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, CircularProgress,
    Alert, Link, Divider, IconButton, InputAdornment,
    alpha, Fade, Checkbox, FormControlLabel
} from '@mui/material';
import {
    Pets as PetsIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import authIllustration from '../../images/auth_illustration.png';
import vetAuthIllustration from '../../images/vet_auth_illustration.png';

const LoginView = () => {
    const navigate = useNavigate();
    const {
        setAuthModalView,
        authModalRole,
        login
    } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Dynamic configuration based on role
    const isVet = authModalRole === 'vet';
    const bgMain = isVet ? '#7c3aed' : '#3B59FE';
    const illustration = isVet
        ? vetAuthIllustration
        : authIllustration;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const isFieldInvalid = (field) => submitted && !formData[field].trim();

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

            // Check if user role matches the intended modal role
            if (data.user && data.user.role !== authModalRole) {
                setError(`This account is not registered as a ${authModalRole}.`);
                setLoading(false);
                return;
            }

            if (data.requires2FA) {
                setAuthModalView('2fa');
                sessionStorage.setItem('temp_2fa_userId', data.userId);
                sessionStorage.setItem('temp_2fa_role', data.role);
            } else {
                if (data.user.role === 'vet' && !data.user.veterinaryId) {
                    login(data.user, data.token, true); // Stay open to complete profile
                    setAuthModalView('register');
                } else {
                    login(data.user, data.token);
                    if (data.user.role === 'vet') navigate('/vet/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            setLoading(true);
            const { data } = await api.post('/auth/google-login', { token: response.credential, role: authModalRole });

            if (data.user && data.user.role !== authModalRole) {
                setError(`This account is not registered as a ${authModalRole}.`);
                setLoading(false);
                return;
            }

            if (data.requires2FA) {
                setAuthModalView('2fa');
                sessionStorage.setItem('temp_2fa_userId', data.userId);
                sessionStorage.setItem('temp_2fa_role', data.role);
            } else {
                if (data.user.role === 'vet' && !data.user.veterinaryId) {
                    login(data.user, data.token, true); // Stay open to complete profile
                    setAuthModalView('register');
                } else {
                    login(data.user, data.token);
                    if (data.user.role === 'vet') navigate('/vet/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fade in timeout={400}>
            <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap' }, width: '100%', overflow: 'hidden' }}>
                {/* Left Section - Dynamic Color */}
                <Box sx={{
                    flex: { xs: '1 1 100%', md: 1 },
                    background: bgMain,
                    color: 'white',
                    p: { xs: 2.5, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'background 0.4s ease'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PetsIcon sx={{ fontSize: 22 }} />
                        <Typography variant="body1" fontWeight="bold">Pawpal {isVet ? 'Vet' : ''}</Typography>
                    </Box>

                    <Typography variant="h5" fontWeight="900" sx={{ mb: 2, letterSpacing: '-0.5px' }}>
                        {isVet ? 'Vet Portal Sign In' : 'Sign In'}
                    </Typography>

                    {/* Google Login Section */}
                    <Box sx={{
                        mb: 2,
                        width: '100%',
                        bgcolor: 'white',
                        borderRadius: '50px',
                        overflow: 'hidden',
                        '& iframe': { width: '100% !important' }
                    }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Authentication Failed')}
                            width="100%"
                            theme="outline"
                            shape="pill"
                            text="signin_with"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, width: '100%' }}>
                        <Divider sx={{ flex: 1, height: '1.5px', background: '#FFFFFF', border: 'none' }} />
                        <Typography variant="caption" sx={{ px: 2, color: 'white', opacity: 1, fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            Or Login with Email
                        </Typography>
                        <Divider sx={{ flex: 1, height: '1.5px', background: '#FFFFFF', border: 'none' }} />
                    </Box>

                    <form onSubmit={handleSubmit} noValidate>
                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 1.5, py: 0, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}
                            >
                                {error}
                            </Alert>
                        )}

                        <Typography variant="body2" sx={{ mb: 0.6, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.85rem' }}>Username / Email</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            name="email"
                            type="email"
                            placeholder={isVet ? "doctor@pawpal.com" : "Type your email"}
                            value={formData.email}
                            onChange={handleChange}
                            variant="outlined"
                            required
                            disabled={loading}
                            error={isFieldInvalid('email')}
                            sx={{
                                mb: 1.5,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'white',
                                    color: '#1e293b',
                                    borderRadius: '16px',
                                    height: '42px',
                                    fontSize: '0.9rem',
                                    '& fieldset': { borderColor: 'transparent' },
                                    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.05)' },
                                    '&.Mui-focused fieldset': { borderColor: 'white', borderWidth: '2px' },
                                },
                            }}
                        />

                        <Typography variant="body2" sx={{ mb: 0.6, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.85rem' }}>Password</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            variant="outlined"
                            required
                            disabled={loading}
                            error={isFieldInvalid('password')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                            sx={{ color: '#64748b' }}
                                        >
                                            {showPassword ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 1,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'white',
                                    color: '#1e293b',
                                    borderRadius: '16px',
                                    height: '42px',
                                    fontSize: '0.9rem',
                                    '& fieldset': { borderColor: 'transparent' },
                                    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.05)' },
                                    '&.Mui-focused fieldset': { borderColor: 'white', borderWidth: '2px' },
                                },
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <FormControlLabel
                                control={<Checkbox size="small" sx={{ p: 0.5, color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: 'white' } }} />}
                                label={<Typography sx={{ color: 'white', opacity: 0.9, fontSize: '0.75rem', fontWeight: 500 }}>Keep me logged in</Typography>}
                                sx={{ ml: -0.5 }}
                            />
                            <Link
                                component="button"
                                type="button"
                                variant="caption"
                                onClick={() => setAuthModalView('forgot')}
                                sx={{ color: 'white', opacity: 0.9, textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                            >
                                Forget your password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                bgcolor: 'white',
                                color: bgMain,
                                py: 1.25,
                                borderRadius: '50px',
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.95)',
                                    transform: 'translateY(-1px)',
                                },
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : `Login as ${isVet ? 'Vet' : 'Owner'}`}
                        </Button>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem', fontWeight: 500 }}>
                            {isVet ? 'Interested in joining?' : "Haven't sign up yet?"} {' '}
                            <Link
                                component="button"
                                type="button"
                                onClick={() => setAuthModalView('register')}
                                sx={{ color: 'white', fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                                {isVet ? 'Register vet' : 'Sign up'}
                            </Link>
                        </Typography>
                    </Box>
                </Box>

                {/* Right Section - Illustration */}
                <Box sx={{
                    display: { xs: 'none', md: 'flex' },
                    flex: 1, // Equal halves
                    bgcolor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                }}>
                    <Box
                        component="img"
                        src={illustration}
                        alt="Security Illustration"
                        sx={{
                            width: '100%',
                            maxWidth: isVet ? '400px' : '340px',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: isVet ? '24px' : '0',
                            boxShadow: isVet ? '0 20px 40px rgba(0,0,0,0.1)' : 'none'
                        }}
                    />
                </Box>
            </Box>
        </Fade>
    );
};

export default LoginView;
