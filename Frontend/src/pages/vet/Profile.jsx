import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, TextField, Button,
    Stack, Avatar, Switch, alpha, CircularProgress, Alert, Divider,
    MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Security as SecurityIcon,
    Badge as BadgeIcon,
    MedicalServices as MedicalIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { styled, useTheme, useMediaQuery } from '@mui/material';

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
    width: '100%'
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: '16px',
    boxSizing: 'border-box',
    boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
    border: '1px solid #e2e8f0',
    minHeight: '80vh',
    width: '100%',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
        padding: '16px',
    },
}));

const VetProfile = () => {
    const specializations = [
        'General Practice', 'Surgery', 'Dermatology', 'Internal Medicine', 'Cardiology',
        'Oncology', 'Neurology', 'Ophthalmology', 'Dentistry', 'Emergency Care',
        'Radiology', 'Anesthesiology', 'Exotic Animals', 'Equine Medicine'
    ];
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tfaLoading, setTfaLoading] = useState(false);
    const [twoFactorData, setTwoFactorData] = useState(null);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        specialization: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
                specialization: user.specialization || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put(`/vets/${user.id || user._id}`, formData);
            updateUser({ ...user, ...res.data.vet }); // vet data is returned inside vet key
            Swal.fire('Success', 'Profile updated successfully', 'success');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return Swal.fire('Error', 'New passwords do not match', 'error');
        }
        setPasswordLoading(true);
        try {
            await api.post('/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            Swal.fire('Success', 'Password updated successfully', 'success');
            updateUser({ ...user, hasPassword: true });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update password', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const setup2FA = async () => {
        try {
            setTfaLoading(true);
            const { data } = await api.post('/auth/2fa/setup');
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            <VetAdminNavbar />
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                {!isMobile && <Sidebar />}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress color="secondary" />
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc', overflowX: 'hidden' }}>
            <VetAdminNavbar />
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                {!isMobile && <Sidebar />}
                <Box sx={{ flexGrow: 1, p: isMobile ? 1 : 2, minWidth: 0, width: '100%' }}>
                    <ContentContainer>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', fontSize: isMobile ? '1.75rem' : '2.125rem' }}>
                                My Profile
                            </Typography>
                        </Box>

                        <Grid container spacing={isMobile ? 2 : 4} sx={{ width: '100%', m: 0 }}>
                            {/* General Information */}
                            <Grid item xs={12} sx={{ width: '100%' }}>
                                <GlassCard>
                                    <CardContent sx={{ p: isMobile ? 3 : 5 }}>
                                        <Typography variant="h5" gutterBottom fontWeight="800" display="flex" alignItems="center" gap={2} sx={{ color: '#49149e', mb: 4 }}>
                                            <PersonIcon sx={{ fontSize: 32 }} /> Professional Identity
                                        </Typography>
                                        <Box component="form" onSubmit={handleUpdateProfile}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <TextField
                                                        fullWidth label="First Name"
                                                        variant="outlined"
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <TextField
                                                        fullWidth label="Last Name"
                                                        variant="outlined"
                                                        value={formData.lastName}
                                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <TextField
                                                        fullWidth label="Email Address"
                                                        value={user.email} disabled
                                                        helperText="Primary contact email"
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6}>
                                                    <TextField
                                                        fullWidth label="Phone Number"
                                                        value={formData.phoneNumber}
                                                        onChange={(e) => { const v = e.target.value; if (v.length <= 10 && (v === '' || /^\d+$/.test(v))) setFormData({ ...formData, phoneNumber: v }) }}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={6} sx={{ display: user?.staffRole ? 'none' : undefined, boxSizing: 'border-box', minWidth: 0 }}>
                                                    <FormControl fullWidth sx={{ minWidth: '220px', width: '100%' }}>
                                                        <InputLabel>Specialization</InputLabel>
                                                        <Select
                                                            value={formData.specialization}
                                                            label="Specialization"
                                                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                            sx={{ borderRadius: '12px', width: '100%' }}
                                                        >
                                                            {specializations.map((option) => (
                                                                <MenuItem key={option} value={option}>
                                                                    {option}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
                                                <Button
                                                    type="submit" variant="contained"
                                                    disabled={saving}
                                                    fullWidth={isMobile}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
                                                        borderRadius: '12px',
                                                        px: isMobile ? 3 : 6,
                                                        py: 1.5,
                                                        fontWeight: 700,
                                                        textTransform: 'none',
                                                        fontSize: isMobile ? '0.9rem' : '1rem',
                                                        boxShadow: '0 10px 25px rgba(142, 36, 170, 0.2)',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 15px 30px rgba(142, 36, 170, 0.3)',
                                                        },
                                                        '&:active': {
                                                            transform: 'translateY(0)',
                                                        },
                                                    }}
                                                >
                                                    {saving ? <CircularProgress size={24} color="inherit" /> : 'Update Professional Profile'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </GlassCard>
                            </Grid>

                            {/* Security Section */}
                            <Grid item xs={12} lg={6} sx={{ width: '100%' }}>
                                <GlassCard sx={{ height: '100%' }}>
                                    <CardContent sx={{ p: isMobile ? 3 : 5 }}>
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
                                            <Box sx={{ mt: 4, textAlign: 'center', bgcolor: '#f8fafc', p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                <Typography variant="caption" display="block" sx={{ mb: 2, fontWeight: 'bold' }}>
                                                    Scan this code with your authenticator app
                                                </Typography>
                                                <img src={twoFactorData.qrCode} alt="QR" style={{ width: 150, height: 150, marginBottom: 16, borderRadius: '8px' }} />
                                                <TextField
                                                    fullWidth size="small" placeholder="6-digit code"
                                                    value={twoFactorToken}
                                                    onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' } }}
                                                />
                                                <Button
                                                    fullWidth variant="contained" onClick={enable2FA}
                                                    disabled={twoFactorToken.length !== 6 || tfaLoading}
                                                    sx={{ bgcolor: '#10B981', borderRadius: '50px', '&:hover': { bgcolor: '#059669' } }}
                                                >
                                                    Verify & Enable
                                                </Button>
                                            </Box>
                                        )}
                                    </CardContent>
                                </GlassCard>
                            </Grid>

                            {/* Password Update Section */}
                            <Grid item xs={12} lg={6} sx={{ width: '100%' }}>
                                <GlassCard sx={{ height: '100%' }}>
                                    <CardContent sx={{ p: isMobile ? 3 : 5 }}>
                                        <Typography variant="h5" gutterBottom fontWeight="800" display="flex" alignItems="center" gap={2} sx={{ color: '#49149e', mb: 3 }}>
                                            <LockIcon sx={{ fontSize: 32 }} /> Update Password
                                        </Typography>
                                        <Box component="form" onSubmit={handleChangePassword}>
                                            <Stack spacing={3}>
                                                {user.hasPassword && (
                                                    <TextField
                                                        fullWidth label="Old Password"
                                                        type="password"
                                                        value={passwordData.oldPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                                    />
                                                )}
                                                <TextField
                                                    fullWidth label="New Password"
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                                />
                                                <TextField
                                                    fullWidth label="Confirm New Password"
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                                />
                                                <Box sx={{ mt: 2 }}>
                                                    <Button
                                                        type="submit" variant="contained"
                                                        disabled={passwordLoading}
                                                        fullWidth
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
                                                            borderRadius: '12px',
                                                            py: 1.5,
                                                            fontWeight: 700,
                                                            textTransform: 'none',
                                                            boxShadow: '0 10px 25px rgba(142, 36, 170, 0.2)',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 15px 30px rgba(142, 36, 170, 0.3)',
                                                            },
                                                            '&:active': {
                                                                transform: 'translateY(0)',
                                                            },
                                                        }}
                                                    >
                                                        {passwordLoading ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </GlassCard>
                            </Grid>

                        </Grid>
                    </ContentContainer>
                </Box>
            </Box>
        </Box>
    );
};

export default VetProfile;
