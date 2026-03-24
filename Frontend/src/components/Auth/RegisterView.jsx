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
    const { authModalRole, vetUser, updateUser, closeAuthModal, setAuthModalView, login } = useAuth();
    const navigate = useNavigate();
    const isVet = authModalRole === 'vet';

    // A profile is incomplete if address or specialization is missing (for professional vets, not general staff)
    const isCompleteProfileMode = isVet && vetUser && !vetUser.staffRole && 
        (!vetUser.address || vetUser.address === 'Please update your address' || !vetUser.specialization);

    const [formData, setFormData] = useState({
        firstName: (isVet && vetUser?.firstName) || '',
        lastName: (isVet && vetUser?.lastName) || '',
        email: (isVet && vetUser?.email) || '',
        password: '',
        confirmPassword: '',
        phoneNumber: (isVet && vetUser?.phoneNumber) || '',
        address: (isVet && (vetUser?.address === 'Please update your address' ? '' : vetUser?.address)) || '',
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
        'Oncology', 'Neurology', 'Ophthalmology', 'Dentistry', 'Emergency Care',
        'Radiology', 'Anesthesiology', 'Exotic Animals', 'Equine Medicine'
    ];

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (name === 'phoneNumber') {
            if (value.length > 10) return;
            if (value !== '' && !/^\d+$/.test(value)) return;
        }
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        setError('');
    };

    const isFieldInvalid = (field) => {
        if (!submitted) return false;
        
        // Hide red borders for passwords in complete profile mode
        if (isCompleteProfileMode && (field === 'password' || field === 'confirmPassword')) return false;
        
        const value = formData[field]?.toString().trim();
        if (!value) {
            // If it's a vet, address and specialization are required. 
            // If it's an owner, address is required.
            if (isVet) {
                return ['address', 'specialization', 'firstName', 'lastName', 'email', 'phoneNumber'].includes(field);
            }
            return !['veterinaryId', 'specialization'].includes(field);
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const requiredFields = isVet 
            ? ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'specialization']
            : ['firstName', 'lastName', 'email', 'phoneNumber', 'address'];

        // Add password fields only if we are NOT in complete profile mode
        if (!isCompleteProfileMode) {
            requiredFields.push('password', 'confirmPassword');
        }

        const invalid = requiredFields.some(field => !formData[field]?.toString().trim());

        if (invalid) {
            setError('Please complete all required fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        const phoneRegex = /^(?:0|94|\+94)?\d{9}$/; // Starts with 0, 94, or +94 followed by 9 digits
        const genericPhoneRegex = /^\d{10}$/; // Alternatively 10 digits directly
        const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
        if (!phoneRegex.test(cleanPhone) && !genericPhoneRegex.test(cleanPhone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        if (!isCompleteProfileMode && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            if (isCompleteProfileMode) {
                // Update existing vet profile
                const { data } = await api.put(`/vets/${vetUser.id || vetUser._id}`, { ...formData, accessLevel: 'Enhanced' });
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
                            <Typography variant="body2" fontWeight="bold" sx={{ color: primaryColor }}>PawPal</Typography>
                        </Box>

                        <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5, color: textMain, letterSpacing: '-0.5px' }}>
                            {isCompleteProfileMode ? 'Complete Your Vet Profile' : 'Create Account'}
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 2, opacity: 0.9, color: textMuted, fontWeight: 500, fontSize: '0.8rem', display: 'block' }}>
                            {isCompleteProfileMode
                                ? 'Please provide your professional details to activate your vet account.'
                                : isVet ? 'Join PawPal to provide professional care for pets.' : 'Join PawPal to manage your pet\'s health records.'}
                        </Typography>

                        <form onSubmit={handleSubmit} noValidate>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2, py: 0.5, borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                gap: 2,
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

                                {!isCompleteProfileMode && (
                                    <>
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
                                    </>
                                )}

                                {isVet ? (
                                    <>
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Professional Address</Typography>
                                            <TextField fullWidth size="small" name="address" placeholder="Professional Address" value={formData.address} onChange={handleChange} required error={isFieldInvalid('address')}
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
                                                required
                                                error={isFieldInvalid('specialization')}
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
                                    <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                                        <Typography variant="body2" sx={{ mb: 0.4, fontWeight: 700, opacity: 0.9, display: 'block', fontSize: '0.82rem', color: textMain }}>Address</Typography>
                                        <TextField fullWidth size="small" name="address" placeholder="Your Address" value={formData.address} onChange={handleChange} required error={isFieldInvalid('address')}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '16px', height: '42px', fontSize: '0.9rem' } }} />
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                                <Button type="submit" variant="contained" disabled={loading}
                                    sx={{ width: { xs: '100%', sm: '320px' }, bgcolor: primaryColor, color: 'white', py: 1.25, borderRadius: '50px', fontSize: '0.95rem', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: alpha(primaryColor, 0.9) } }}>
                                    {loading ? <CircularProgress size={20} color="inherit" /> : (isCompleteProfileMode ? 'Complete Profile & Continue' : 'Create Account')}
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
