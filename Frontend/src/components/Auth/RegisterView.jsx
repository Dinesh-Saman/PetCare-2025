import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Link, Grid } from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RegisterView = ({ isVet: initialIsVet = false }) => {
    const { setAuthModalView, login } = useAuth();
    const [isVet, setIsVet] = useState(initialIsVet);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', phoneNumber: '', address: '',
        veterinaryId: '', specialization: '', isPrimaryVet: false, clinicId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const themeColor = isVet ? '#8e24aa' : '#2196f3';
    const themeGradient = isVet
        ? 'linear-gradient(90deg, #8e24aa, #ab47bc)'
        : 'linear-gradient(90deg, #2196f3, #21cbf3)';

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        setError('');
    };

    const isFieldInvalid = (field) => submitted && !formData[field]?.toString().trim();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const commonFields = ['firstName', 'lastName', 'email', 'password', 'phoneNumber'];
        const vetFields = ['veterinaryId'];
        const requiredFields = isVet ? [...commonFields, ...vetFields] : [...commonFields, 'address'];

        const invalid = requiredFields.some(field => !formData[field]?.toString().trim());
        if (invalid) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const endpoint = isVet ? '/vets/register' : '/owners/register';
            await api.post(endpoint, formData);

            // Auto login after registration
            const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
            login(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const specializations = [
        'General Practice', 'Surgery', 'Dermatology', 'Internal Medicine', 'Cardiology',
        'Oncology', 'Neurology', 'Ophthalmology', 'Dentistry', 'Emergency & Critical Care'
    ];

    return (
        <Box>
            <Box sx={{ background: themeGradient, color: 'white', py: 4, textAlign: 'center', transition: 'all 0.3s ease' }}>
                <PetsIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">Create an Account</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Join PetCare as a new {isVet ? 'veterinarian' : 'owner'}</Typography>
            </Box>

            <Box sx={{ p: 4, maxHeight: '70vh', overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', mb: 3, borderRadius: 2, overflow: 'hidden', border: `1px solid ${themeColor}` }}>
                    <Button
                        fullWidth
                        onClick={() => setIsVet(false)}
                        sx={{
                            borderRadius: 0,
                            bgcolor: !isVet ? themeColor : 'transparent',
                            color: !isVet ? 'white' : themeColor,
                            '&:hover': { bgcolor: !isVet ? themeColor : 'rgba(33, 150, 243, 0.1)' }
                        }}
                    >
                        Pet Owner
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setIsVet(true)}
                        sx={{
                            borderRadius: 0,
                            bgcolor: isVet ? themeColor : 'transparent',
                            color: isVet ? 'white' : themeColor,
                            '&:hover': { bgcolor: isVet ? themeColor : 'rgba(142, 36, 170, 0.1)' }
                        }}
                    >
                        Veterinarian
                    </Button>
                </Box>

                <form onSubmit={handleSubmit} noValidate>
                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} required error={isFieldInvalid('firstName')} helperText={isFieldInvalid('firstName') ? 'Required' : ''} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} required error={isFieldInvalid('lastName')} helperText={isFieldInvalid('lastName') ? 'Required' : ''} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Email Address *" type="email" name="email" value={formData.email} onChange={handleChange} required error={isFieldInvalid('email')} helperText={isFieldInvalid('email') ? 'Required' : ''} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Password *" type="password" name="password" value={formData.password} onChange={handleChange} required error={isFieldInvalid('password')} helperText={isFieldInvalid('password') ? 'Required' : ''} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone Number *" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required error={isFieldInvalid('phoneNumber')} helperText={isFieldInvalid('phoneNumber') ? 'Required' : ''} />
                        </Grid>

                        {!isVet ? (
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Address *" name="address" value={formData.address} onChange={handleChange} required error={isFieldInvalid('address')} helperText={isFieldInvalid('address') ? 'Required' : ''} />
                            </Grid>
                        ) : (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Vet License ID *" name="veterinaryId" value={formData.veterinaryId} onChange={handleChange} required error={isFieldInvalid('veterinaryId')} helperText={isFieldInvalid('veterinaryId') ? 'Required' : ''} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select fullWidth label="Specialization" name="specialization"
                                        value={formData.specialization} onChange={handleChange}
                                        SelectProps={{ native: true }}
                                    >
                                        <option value="">Select Specialization</option>
                                        {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <input type="checkbox" name="isPrimaryVet" checked={formData.isPrimaryVet} onChange={handleChange} id="primary-vet-check" />
                                        <label htmlFor="primary-vet-check">I am the Primary Veterinarian of my clinic</label>
                                    </Box>
                                </Grid>
                                {formData.isPrimaryVet && (
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Clinic ID (optional)" name="clinicId" value={formData.clinicId} onChange={handleChange} placeholder="Leave blank for new clinic" />
                                    </Grid>
                                )}
                            </>
                        )}
                    </Grid>

                    <Button type="submit" fullWidth variant="contained" disabled={loading}
                        sx={{
                            mt: 3, background: themeGradient,
                            color: 'white', py: 1.5, borderRadius: 3, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none',
                            '&:hover': { opacity: 0.9 }
                        }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                    </Button>
                </form>

                <Box textAlign="center" mt={3}>
                    <Typography variant="body2" color="textSecondary">
                        Already have an account?{' '}
                        <Link component="button" type="button" onClick={() => setAuthModalView('login')} sx={{ color: themeColor, fontWeight: 'bold' }}>
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default RegisterView;
