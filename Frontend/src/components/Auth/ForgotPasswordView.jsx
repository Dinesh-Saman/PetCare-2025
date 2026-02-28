import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Link } from '@mui/material';
import { LockReset as LockResetIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ForgotPasswordView = () => {
    const { setAuthModalView } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess('If an account exists with that email, a password reset link has been sent.');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ background: 'linear-gradient(90deg, #2196f3, #21cbf3)', color: 'white', py: 4, textAlign: 'center' }}>
                <LockResetIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">Reset Password</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Enter your email to receive a reset link</Typography>
            </Box>

            <Box sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

                    <TextField
                        fullWidth label="Email Address" type="email"
                        value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        variant="outlined" required disabled={loading} autoFocus
                        sx={{ mb: 3 }}
                    />

                    <Button type="submit" fullWidth variant="contained" disabled={loading}
                        sx={{
                            background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
                            color: 'white', py: 1.5, borderRadius: 3, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none',
                            '&:hover': { background: 'linear-gradient(90deg, #1976d2, #00bcd4)' }
                        }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                    </Button>
                </form>

                <Box textAlign="center" mt={3}>
                    <Typography variant="body2" color="textSecondary">
                        Remember your password?{' '}
                        <Link component="button" type="button" onClick={() => setAuthModalView('login')} sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ForgotPasswordView;
