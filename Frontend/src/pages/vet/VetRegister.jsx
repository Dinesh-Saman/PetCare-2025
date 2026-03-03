import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, CircularProgress,
  Alert, Link, Grid, InputAdornment, alpha, Divider,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
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
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phoneNumber: '', veterinaryId: '', specialization: '',
    clinicId: '', isPrimaryVet: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mainColor = '#7c3aed';
  const bgGradient = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
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
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      p: { xs: 2, md: 4 }
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: '600px',
        bgcolor: 'white',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <Box sx={{ background: bgGradient, color: 'white', py: 4, px: 3, textAlign: 'center' }}>
          <PetsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
          <Typography variant="h5" fontWeight="900">Join our Network</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Create your professional veterinary account</Typography>
        </Box>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <form onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required error={isFieldInvalid('firstName')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: alpha(mainColor, 0.4), fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required error={isFieldInvalid('lastName')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: alpha(mainColor, 0.4), fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required error={isFieldInvalid('email')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: alpha(mainColor, 0.4), fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required error={isFieldInvalid('password')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: alpha(mainColor, 0.4), fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ color: alpha(mainColor, 0.4), fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Veterinary License ID" name="veterinaryId" value={formData.veterinaryId} onChange={handleChange} required error={isFieldInvalid('veterinaryId')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: alpha(mainColor, 0.4), fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Specialization</InputLabel>
                  <Select name="specialization" value={formData.specialization} onChange={handleChange} label="Specialization" sx={{ borderRadius: '12px' }}
                    startAdornment={<InputAdornment position="start"><WorkOutline sx={{ color: alpha(mainColor, 0.4), fontSize: 18, ml: 1, mr: -0.5 }} /></InputAdornment>}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {specializations.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox name="isPrimaryVet" checked={formData.isPrimaryVet} onChange={handleChange} color="secondary" />}
                  label={<Typography variant="body2" color="textSecondary">I am the Primary Veterinarian of my clinic</Typography>}
                />
              </Grid>

              {formData.isPrimaryVet && (
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Clinic ID (Optional)" name="clinicId" value={formData.clinicId} onChange={handleChange}
                    placeholder="Leave blank to create a new clinic"
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocalHospitalOutlined sx={{ color: alpha(mainColor, 0.4), fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: '12px' } }} />
                </Grid>
              )}
            </Grid>

            <Button type="submit" fullWidth variant="contained" disabled={loading}
              sx={{
                mt: 4, background: bgGradient, color: 'white', py: 1.5, borderRadius: '12px', fontSize: '1rem', fontWeight: 800, textTransform: 'none',
                boxShadow: `0 10px 20px ${alpha(mainColor, 0.2)}`,
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 15px 25px ${alpha(mainColor, 0.3)}` }
              }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Professional Account'}
            </Button>
          </form>

          <Box textAlign="center" mt={4} pt={3} borderTop="1px solid #f1f5f9">
            <Typography variant="body2" color="textSecondary">
              Already part of our network?{' '}
              <Link href="/vet/login" sx={{ color: mainColor, fontWeight: 800, textDecoration: 'none' }}>
                Sign In Portals
              </Link>
            </Typography>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2, color: '#94a3b8', textTransform: 'none' }}>Home</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VetRegister;