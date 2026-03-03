import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, CircularProgress,
  Alert, Link, IconButton, InputAdornment, alpha, Divider
} from '@mui/material';
import {
  Pets as PetsIcon,
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const VetLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mainColor = '#7c3aed'; // Medical Purple
  const bgGradient = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';

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

      if (data.user.role !== 'vet') {
        setError('This portal is for veterinarians only.');
        setLoading(false);
        return;
      }

      if (data.requires2FA) {
        sessionStorage.setItem('temp_2fa_userId', data.userId);
        sessionStorage.setItem('temp_2fa_role', data.role);
        navigate('/vet/verify-2fa');
      } else {
        login(data.user, data.token);
        Swal.fire({
          title: 'Welcome back, Doctor!',
          text: `Dr. ${data.user.firstName} ${data.user.lastName}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/vet/dashboard');
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
      const { data } = await api.post('/auth/google-login', { token: response.credential, role: 'vet' });
      if (data.requires2FA) {
        sessionStorage.setItem('temp_2fa_userId', data.userId);
        sessionStorage.setItem('temp_2fa_role', data.role);
        navigate('/vet/verify-2fa');
      } else {
        login(data.user, data.token);
        navigate('/vet/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
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
        maxWidth: '460px',
        bgcolor: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <Box sx={{ background: bgGradient, color: 'white', py: 4, px: 3, textAlign: 'center' }}>
          <Box sx={{
            width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, backdropFilter: 'blur(8px)'
          }}>
            <PetsIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight="900" letterSpacing="-1px">Veterinarian Login</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>Clinic Management & Care Portal</Typography>
        </Box>

        {/* Form */}
        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.85rem' }}>{error}</Alert>}

            <TextField
              fullWidth label="Email Address" name="email" type="email"
              value={formData.email} onChange={handleChange}
              variant="outlined" required disabled={loading}
              error={isFieldInvalid('email')}
              helperText={isFieldInvalid('email') ? 'Email is required' : ''}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: alpha(mainColor, 0.4), fontSize: 20 }} /></InputAdornment>,
                sx: { borderRadius: '12px' }
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'}
              value={formData.password} onChange={handleChange}
              variant="outlined" required disabled={loading}
              error={isFieldInvalid('password')}
              helperText={isFieldInvalid('password') ? 'Password is required' : ''}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: alpha(mainColor, 0.4), fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              sx={{ mb: 1.5 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/vet/forgot-password')}
                variant="caption"
                sx={{ color: mainColor, fontWeight: 700, textDecoration: 'none' }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button type="submit" fullWidth variant="contained" disabled={loading}
              sx={{
                background: bgGradient, color: 'white', py: 1.5, borderRadius: '12px', fontSize: '1rem', fontWeight: 700, textTransform: 'none',
                boxShadow: `0 8px 16px ${alpha(mainColor, 0.2)}`,
                '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 12px 20px ${alpha(mainColor, 0.3)}` }
              }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In to Dashboard'}
            </Button>
          </form>

          <Box sx={{ my: 3 }}>
            <Divider><Typography variant="caption" color="textSecondary" sx={{ px: 2, fontWeight: 600 }}>OR</Typography></Divider>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Authentication Failed')}
              theme="outline" shape="pill" size="large" text="signin_with"
            />
          </Box>

          <Box textAlign="center" pt={3} borderTop="1px solid #f1f5f9">
            <Typography variant="body2" color="textSecondary">
              Don't have a clinic account?{' '}
              <Link href="/vet/register" sx={{ color: mainColor, fontWeight: 800, textDecoration: 'none' }}>
                Create One Now
              </Link>
            </Typography>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ mt: 3, color: '#64748b', textTransform: 'none', fontSize: '0.8rem' }}
            >
              Back to Home
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VetLogin;