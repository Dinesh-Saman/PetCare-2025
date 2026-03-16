import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, CircularProgress,
    Alert, Fade, Link, alpha, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';
import {
    Pets as PetsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RegisterView = () => {
    const navigate = useNavigate();
    const { setAuthModalView, authModalRole, login, vetUser, updateUser, closeAuthModal } = useAuth();
    const isVet = authModalRole === 'vet';
    const isCompleteProfileMode = isVet && vetUser && !vetUser.address;

    const [formData, setFormData] = useState({
        firstName: (isVet && vetUser?.firstName) || '',
        lastName: (isVet && vetUser?.lastName) || '',
        email: (isVet && vetUser?.email) || '',
        password: '',
        confirmPassword: '',
        phoneNumber: (isVet && vetUser?.phoneNumber) || '',
        address: (isVet && vetUser?.address) || '',
        veterinaryId: (isVet && vetUser?.veterinaryId) || '',
        specialization: (isVet && vetUser?.specialization) || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const primaryColor = isVet ? '#7c3aed' : '#3B59FE';
    const textMain = '#1e293b';
    const textMuted = '#64748b';

    const specializations = [
        'General Practice', 'Surgery', 'Dermatology', 'Internal Medicine', 'Cardiology',
        'Oncology', 'Neurology', 'Ophthalmology', 'Dentistry', 'Emergency Care'
    ];

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        setError('');
    };

    const isFieldInvalid = (field) => submitted && !formData[field]?.toString().trim() && (isVet || !['veterinaryId', 'specialization'].includes(field));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phoneNumber', 'address'];

        const invalid = requiredFields.some(field => !formData[field]?.trim());

        if (invalid) {
            setError('Please complete all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            if (isCompleteProfileMode) {
                // Update existing vet profile
                const { data } = await api.put(`/vets/${vetUser.id}`, { ...formData, accessLevel: 'Enhanced' });
                updateUser(data.vet);
                closeAuthModal();
                navigate('/vet/dashboard');
                return;
            }

            const registerEndpoint = isVet ? '/vets/register' : '/owners/register';
            await api.post(registerEndpoint, formData);

            const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
            login(res.data.user, res.data.token);
            if (res.data.user.role === 'vet') navigate('/vet/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fade in timeout={400}>
            <Box sx={{ width: '100%', overflowX: 'hidden', bgcolor: 'white', maxHeight: '85vh', overflowY: 'auto' }}>
                <Box sx={{
                    width: '100%',
                    p: { xs: 2.5, md: 4 },
                    pb: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Box sx={{ maxWidth: '92%', width: '100%', mx: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PetsIcon sx={{ fontSize: 20, color: primaryColor }} />
                            <Typography variant="body2" fontWeight="bold" sx={{ color: primaryColor }}>PawPal {isVet ? 'Vet' : ''}</Typography>
                        </Box>

                        <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5, color: textMain, letterSpacing: '-0.5px' }}>
                            {isVet ? 'Complete Your Vet Profile' : 'Create Account'}
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 2, opacity: 0.9, color: textMuted, fontWeight: 500, fontSize: '0.8rem', display: 'block' }}>
                            {isVet
                                ? 'Please provide your professional details to activate your vet account and access the dashboard.'
                                : 'Join PawPal to manage your pet\'s health records.'}
                        </Typography>

                        <form onSubmit={handleSubmit} noValidate>
                            {error && (
                                <Alert severity="error" sx={{ mb: 1.5, py: 0, borderRadius: '12px', fontSize: '0.75rem' }}>
                                    {error}
                                </Alert>
                            )}

                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: isVet ? 2 : 2.5,
                                width: '100%'
                            }}>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>First Name</Typography>
                                    <TextField fullWidth size="small" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required error={isFieldInvalid('firstName')}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Last Name</Typography>
                                    <TextField fullWidth size="small" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required error={isFieldInvalid('lastName')}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Email Address</Typography>
                                    <TextField fullWidth size="small" name="email" type="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} required error={isFieldInvalid('email')}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Contact Number</Typography>
                                    <TextField fullWidth size="small" name="phoneNumber" placeholder="Contact Number" value={formData.phoneNumber} onChange={handleChange} required error={isFieldInvalid('phoneNumber')}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Password</Typography>
                                    <TextField fullWidth size="small" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required error={isFieldInvalid('password')}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Confirm Password</Typography>
                                    <TextField fullWidth size="small" name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required error={isFieldInvalid('confirmPassword')}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                </Box>

                                {isVet ? (
                                    <>
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Address</Typography>
                                            <TextField fullWidth size="small" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required error={isFieldInvalid('address')}
                                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Specialization</Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                name="specialization"
                                                select
                                                value={formData.specialization}
                                                onChange={handleChange}
                                                SelectProps={{
                                                    displayEmpty: true,
                                                    renderValue: (viewValue) => {
                                                        if (!viewValue) return <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', opacity: 0.7 }}>Select Specialization</Typography>;
                                                        return viewValue;
                                                    }
                                                }}
                                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }}
                                            >
                                                <MenuItem value="" disabled>Select Specialization</MenuItem>
                                                {specializations.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                            </TextField>
                                        </Box>
                                    </>
                                ) : (
                                    <Box sx={{ gridColumn: 'span 2' }}>
                                        <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Address</Typography>
                                        <TextField fullWidth size="small" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required error={isFieldInvalid('address')}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                                <Button type="submit" variant="contained" disabled={loading}
                                    sx={{ width: { xs: '100%', sm: '320px' }, bgcolor: primaryColor, color: 'white', py: 1.25, borderRadius: '50px', fontSize: '0.95rem', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: alpha(primaryColor, 0.9) } }}>
                                    {loading ? <CircularProgress size={20} color="inherit" /> : (isCompleteProfileMode ? 'Complete Profile & Continue' : `Create ${isVet ? 'Professional' : ''} Account`)}
                                </Button>
                            </Box>
                        </form>

                        <Box sx={{ textAlign: 'center', mt: 1, pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem', fontWeight: 500, color: textMuted }}>
                                Already have an account?
                            </Typography>
                            <Link
                                component="button"
                                type="button"
                                onClick={() => setAuthModalView('login')}
                                sx={{
                                    color: primaryColor,
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    textDecoration: 'none',
                                    border: 'none',
                                    background: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    '&:hover': { textDecoration: 'underline' },
                                    verticalAlign: 'baseline'
                                }}
                            >
                                Sign in
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
};

export default RegisterView;
