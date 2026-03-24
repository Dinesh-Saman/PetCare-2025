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
      alignItems: 'stretch',
      bgcolor: '#fff',
      overflow: 'hidden'
    }}>
      {/* Left Section - Form */}
      <Box sx={{
        flex: { xs: '1 1 100%', md: '0 0 500px', lg: '0 0 550px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 2.5, sm: 4, md: 8, lg: 10 },
        position: 'relative',
        zIndex: 1,
        bgcolor: 'white'
      }}>
        <Box sx={{ position: { xs: 'relative', md: 'absolute' }, top: { xs: 0, md: 40 }, left: { xs: 0, md: 40 }, mb: { xs: 4, md: 0 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, bgcolor: mainColor, borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            boxShadow: `0 8px 16px ${alpha(mainColor, 0.25)}`
          }}>
            <PetsIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="h6" fontWeight="800" color="#1e293b" letterSpacing="-0.5px">PawPal</Typography>
        </Box>

        <Box sx={{ maxWidth: '400px', width: '100%', mx: 'auto' }}>
          <Typography variant="h3" fontWeight="900" sx={{ mb: 1, color: '#0f172a', letterSpacing: '-1.5px', fontSize: { xs: '2.25rem', md: '3rem' } }}>
            Welcome back, Doc!
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, color: '#64748b', fontWeight: 500 }}>
            Login to access your clinic dashboard and manage your appointments.
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>Email Address</Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="doctor@pawpal.com"
                value={formData.email}
                onChange={handleChange}
                error={isFieldInvalid('email')}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: '#94a3b8' }} /></InputAdornment>,
                  sx: {
                    borderRadius: '16px',
                    height: '56px',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: mainColor },
                    '&.Mui-focused fieldset': { borderColor: mainColor, borderWidth: '2px' }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>Password</Typography>
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
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={isFieldInvalid('password')}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#94a3b8' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '16px',
                    height: '56px',
                    bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: mainColor },
                    '&.Mui-focused fieldset': { borderColor: mainColor, borderWidth: '2px' }
                  }
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                background: bgGradient,
                color: 'white',
                py: 2,
                mt: 3,
                borderRadius: '16px',
                fontSize: '1.05rem',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: `0 12px 24px ${alpha(mainColor, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 15px 30px ${alpha(mainColor, 0.4)}`,
                  background: bgGradient
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In as Vet'}
            </Button>
          </form>

          <Box sx={{ my: 4 }}>
            <Divider>
              <Typography variant="caption" sx={{ px: 2, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                OR CONTINUE WITH
              </Typography>
            </Divider>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Authentication Failed')}
              theme="outline"
              shape="pill"
              size="large"
              text="signin_with"
            />
          </Box>

          <Box sx={{ textAlign: 'center', pt: 3, borderTop: '1px solid #f1f5f9' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Interested in joining our network?{' '}
              <Link
                href="/vet/register"
                sx={{ color: mainColor, fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Register your clinic
              </Link>
            </Typography>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ mt: 3, color: '#94a3b8', textTransform: 'none', fontSize: '0.85rem', fontWeight: 600, '&:hover': { color: mainColor } }}
            >
              Return to Website
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Right Section - Immersive Image/Illustration */}
      <Box sx={{
        flex: 1,
        display: { xs: 'none', md: 'block' },
        position: 'relative',
        background: bgGradient,
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.1)',
          zIndex: 1
        }} />

        {/* Abstract Shapes for modern look */}
        <Box sx={{
          position: 'absolute',
          top: '-10%', right: '-10%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          filter: 'blur(80px)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '-20%', left: '-10%',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          filter: 'blur(100px)',
          zIndex: 0
        }} />

        <Box sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 8,
          position: 'relative',
          zIndex: 2,
          color: 'white',
          textAlign: 'center'
        }}>
          <Box
            component="img"
            src="https://img.freepik.com/free-vector/veterinary-clinic-modern-medicine-professional-care-pet-illustration-white-background_257312-320.jpg?w=826"
            alt="Vet Care Illustration"
            sx={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              borderRadius: '40px',
              mb: 6,
              boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
              border: '8px solid rgba(255,255,255,0.2)'
            }}
          />
          <Typography variant="h3" fontWeight="900" sx={{ mb: 2, letterSpacing: '-1px' }}>
            Empowering Caretakers
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: '500px', lineHeight: 1.6 }}>
            Access advanced tools to streamline your clinic management, keep detailed pet records, and enhance communication with pet owners.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VetLogin;
