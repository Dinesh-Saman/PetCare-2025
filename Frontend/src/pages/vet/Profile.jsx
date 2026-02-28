import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, TextField, Button,
    Stack, Avatar, Switch, alpha, CircularProgress, Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Security as SecurityIcon,
    Badge as BadgeIcon,
    MedicalServices as MedicalIcon
} from '@mui/icons-material';
import Sidebar from '../../components/layout/sidebar';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { styled } from '@mui/material/styles';

const GlassCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
    },
}));

const ProfileBanner = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #49149e 0%, #7b1fa2 100%)',
    borderRadius: '32px',
    padding: '48px',
    color: 'white',
    marginBottom: '40px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(73, 20, 158, 0.2)',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -50,
        right: -50,
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
    }
}));

const VetProfile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tfaLoading, setTfaLoading] = useState(false);
    const [twoFactorData, setTwoFactorData] = useState(null);
    const [twoFactorToken, setTwoFactorToken] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        specialization: '',
        veterinaryId: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
                specialization: user.specialization || '',
                veterinaryId: user.veterinaryId || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/vets/profile', formData);
            updateUser(res.data.user);
            Swal.fire('Success', 'Profile updated successfully', 'success');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const setup2FA = async () => {
        try {
            setTfaLoading(true);
            const { data } = await api.get('/auth/2fa/setup');
            setTwoFactorData(data);
        } catch (err) {
            Swal.fire('Error', 'Failed to initiate 2FA setup', 'error');
        } finally {
            setTfaLoading(false);
        }
    };

    const enable2FA = async () => {
        if (!twoFactorToken) return;
        try {
            setTfaLoading(true);
            const { data } = await api.post('/auth/2fa/verify', { token: twoFactorToken, role: 'vet' });
            if (data.success) {
                Swal.fire('Success', 'Two-factor authentication enabled!', 'success');
                setTwoFactorData(null);
                setTwoFactorToken('');
                const profileRes = await api.get('/auth/me');
                updateUser(profileRes.data.user);
            }
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Verification failed', 'error');
        } finally {
            setTfaLoading(false);
        }
    };

    const disable2FA = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Disabling 2FA reduces your account security.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, disable it!'
        });

        if (result.isConfirmed) {
            try {
                setTfaLoading(true);
                await api.post('/auth/2fa/disable');
                Swal.fire('Disabled', '2FA has been disabled.', 'success');
                const profileRes = await api.get('/auth/me');
                updateUser(profileRes.data.user);
            } catch (err) {
                Swal.fire('Error', 'Failed to disable 2FA', 'error');
            } finally {
                setTfaLoading(false);
            }
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress color="secondary" />
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, p: 4, ml: { xs: 0, md: '20px' } }}>
                <ProfileBanner>
                    <Typography variant="h3" fontWeight="800" gutterBottom>
                        Vet Profile Settings
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                        Manage your professional credentials and account security
                    </Typography>
                </ProfileBanner>

                <Grid container spacing={4}>
                    {/* General Information */}
                    <Grid item xs={12} md={7}>
                        <GlassCard>
                            <CardContent sx={{ p: 5 }}>
                                <Typography variant="h5" gutterBottom fontWeight="800" display="flex" alignItems="center" gap={2} sx={{ color: '#49149e', mb: 4 }}>
                                    <PersonIcon sx={{ fontSize: 32 }} /> Professional Identity
                                </Typography>
                                <Box component="form" onSubmit={handleUpdateProfile}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth label="First Name"
                                                variant="outlined"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth label="Last Name"
                                                variant="outlined"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth label="Email Address"
                                                value={user.email} disabled
                                                helperText="Primary contact email"
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth label="Phone Number"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth label="Vet License ID"
                                                value={formData.veterinaryId}
                                                onChange={(e) => setFormData({ ...formData, veterinaryId: e.target.value })}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth label="Specialization"
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Button
                                        type="submit" variant="contained"
                                        disabled={saving}
                                        sx={{
                                            mt: 5,
                                            background: 'linear-gradient(135deg, #49149e 0%, #7b1fa2 100%)',
                                            borderRadius: '50px',
                                            px: 6,
                                            py: 1.5,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            boxShadow: '0 10px 25px rgba(73, 20, 158, 0.2)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #3d1184 0%, #6a1b8e 100%)',
                                            }
                                        }}
                                    >
                                        {saving ? <CircularProgress size={24} color="inherit" /> : 'Update Professional Profile'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </GlassCard>
                    </Grid>

                    {/* Security Section */}
                    <Grid item xs={12} md={5}>
                        <GlassCard sx={{ mb: 4 }}>
                            <CardContent sx={{ p: 5 }}>
                                <Typography variant="h5" gutterBottom fontWeight="800" display="flex" alignItems="center" gap={2} sx={{ color: '#49149e', mb: 3 }}>
                                    <SecurityIcon sx={{ fontSize: 32 }} /> Account Security
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                    Protect your account with Two-Factor Authentication (2FA).
                                </Typography>

                                <Box sx={{
                                    p: 2, borderRadius: 2,
                                    bgcolor: user?.isTwoFactorEnabled ? alpha('#10B981', 0.1) : alpha('#64748b', 0.1),
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        </Typography>
                                    </Box>
                                    <Switch
                                        checked={!!user?.isTwoFactorEnabled}
                                        onChange={(e) => e.target.checked ? setup2FA() : disable2FA()}
                                        disabled={tfaLoading}
                                        color="secondary"
                                    />
                                </Box>

                                {twoFactorData && !user?.isTwoFactorEnabled && (
                                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                                        <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                                            Scan this code with your authenticator app
                                        </Typography>
                                        <img src={twoFactorData.qrCode} alt="QR" style={{ width: 150, height: 150, marginBottom: 16 }} />
                                        <TextField
                                            fullWidth size="small" placeholder="6-digit code"
                                            value={twoFactorToken}
                                            onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            sx={{ mb: 2 }}
                                        />
                                        <Button
                                            fullWidth variant="contained" onClick={enable2FA}
                                            disabled={twoFactorToken.length !== 6 || tfaLoading}
                                            sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                                        >
                                            Verify & Enable
                                        </Button>
                                        <Button
                                            fullWidth sx={{ mt: 1 }} color="error" size="small"
                                            onClick={() => setTwoFactorData(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </GlassCard>

                        {/* Clinic Info Summary */}
                        <GlassCard>
                            <CardContent sx={{ p: 5, textAlign: 'center' }}>
                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                    <Avatar
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            bgcolor: alpha('#49149e', 0.1),
                                            color: '#49149e',
                                            border: '4px solid rgba(73, 20, 158, 0.1)',
                                            fontSize: '2.5rem'
                                        }}
                                    >
                                        <MedicalIcon sx={{ fontSize: 50 }} />
                                    </Avatar>
                                </Box>
                                <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: '#1e293b' }}>
                                    {user?.clinic?.name || 'Independent Specialist'}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    {user?.isPrimaryVet ? 'Principal Veterinarian' : 'Associate Veterinarian'}
                                </Typography>
                                <Divider sx={{ my: 3, opacity: 0.6 }} />
                                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Professional Appointment Tier
                                </Typography>
                            </CardContent>
                        </GlassCard>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default VetProfile;
