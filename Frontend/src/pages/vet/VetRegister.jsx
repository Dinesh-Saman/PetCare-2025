import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, CircularProgress,
  Alert, Link, Grid, InputAdornment, alpha, Divider,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel,
  useMediaQuery, useTheme
} from '@mui/material';
import {
  Pets as PetsIcon,
  PersonOutline,
  EmailOutlined,
  LockOutlined,
  PhoneOutlined,
  BadgeOutlined,
  WorkOutline,
  LocalHospitalOutlined,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import api from '../../services/api';
import Swal from 'sweetalert2';

const specializations = [
  'General Practice', 'Surgery', 'Dermatology', 'Internal Medicine', 'Cardiology',
  'Oncology', 'Neurology', 'Ophthalmology', 'Dentistry', 'Emergency Care',
  'Radiology', 'Anesthesiology', 'Exotic Animals', 'Equine Medicine'
];

const VetRegister = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phoneNumber: '', veterinaryId: '', specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mainColor = '#7c3aed';
  const bgGradient = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (name === 'phoneNumber') {
      if (value.length > 10) return;
      if (value !== '' && !/^\d+$/.test(value)) return;
    }
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  const isFieldInvalid = (field) => submitted && !formData[field];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'veterinaryId'];
    const invalid = requiredFields.some(f => !formData[f]?.trim());

    if (invalid) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/vets/register', formData);
      Swal.fire({
        title: 'Success!',
        text: 'Your professional account has been created.',
        icon: 'success',
        confirmButtonColor: mainColor
      });
      navigate('/vet/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        flex: { xs: '1 1 100%', md: '0 0 600px', lg: '0 0 700px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 2.5, sm: 4, md: 8, lg: 10 },
        position: 'relative',
        zIndex: 1,
        bgcolor: 'white'
      }}>
        <Box sx={{ position: isMobile ? 'relative' : 'absolute', top: isMobile ? 0 : 40, left: isMobile ? 0 : 40, mb: isMobile ? 4 : 0, display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            Join our Network
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, color: '#64748b', fontWeight: 500 }}>
            Create your professional veterinarian account and join Sri Lanka's leading pet care platform.
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>First Name</Typography>
                <TextField
                  fullWidth
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={isFieldInvalid('firstName')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>Last Name</Typography>
                <TextField
                  fullWidth
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={isFieldInvalid('lastName')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>Email Address</Typography>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={isFieldInvalid('email')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>Password</Typography>
                <TextField
                  fullWidth
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={isFieldInvalid('password')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>Phone Number</Typography>
                <TextField
                  fullWidth
                  name="phoneNumber"
                  placeholder="+94 7X XXX XXXX"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>Veterinary License ID</Typography>
                <TextField
                  fullWidth
                  name="veterinaryId"
                  placeholder="VET-XXXXX"
                  value={formData.veterinaryId}
                  onChange={handleChange}
                  error={isFieldInvalid('veterinaryId')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    sx: { borderRadius: '14px', bgcolor: '#f8fafc' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#334155' }}>Specialization</Typography>
                <FormControl fullWidth>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    displayEmpty
                    startIcon={<WorkOutline />}
                    sx={{ borderRadius: '14px', bgcolor: '#f8fafc' }}
                  >
                    <MenuItem value="" disabled>Select Specialization</MenuItem>
                    {specializations.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>


            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                background: bgGradient,
                color: 'white',
                py: 2,
                mt: 4,
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Professional Account'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Already registered?
              <Link
                href="/vet/login"
                sx={{ color: mainColor, fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, verticalAlign: 'baseline' }}
              >
                Sign in to Portal
              </Link>
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ mt: 3, color: '#94a3b8', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Return to Website
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Right Section - Illustration */}
      <Box sx={{
        flex: 1,
        display: { xs: 'none', lg: 'block' },
        position: 'relative',
        background: bgGradient,
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.05)',
          zIndex: 1
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
            src="https://img.freepik.com/free-vector/veterinary-concept-illustration_114360-17300.jpg?w=826"
            alt="Veterinary Concept"
            sx={{
              width: '100%',
              maxWidth: '550px',
              height: 'auto',
              borderRadius: '40px',
              mb: 6,
              boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
              border: '10px solid rgba(255,255,255,0.15)'
            }}
          />
          <Typography variant="h3" fontWeight="900" sx={{ mb: 2, letterSpacing: '-1px' }}>
            Advanced Pet Care
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: '500px', lineHeight: 1.6 }}>
            Join thousands of professionals providing top-tier veterinary services. Manage your clinic, staff, and appointments with ease.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VetRegister;
