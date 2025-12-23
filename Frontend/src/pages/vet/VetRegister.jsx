import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, TextField, Button, Paper, Grid, FormControlLabel,
  Checkbox, Link, InputLabel, Select, MenuItem, FormControl
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import Header from '../../components/layout/Header';

const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  borderRadius: 24,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  overflow: 'hidden',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
  color: 'white',
  padding: 40,
  textAlign: 'center',
}));

const CardBody = styled(Box)(({ theme }) => ({
  padding: 48,
}));

const LogoIcon = styled(PetsIcon)(({ theme }) => ({
  fontSize: 80,
  marginBottom: 16,
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
  color: 'white',
  padding: '14px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.1rem',
  textTransform: 'none',
  marginTop: 20,
  '&:hover': {
    background: 'linear-gradient(90deg, #7b1fa2, #9c27b0)',
  },
}));

const VetRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    veterinaryId: '',
    specialization: '',
    clinicId: '',
    isPrimaryVet: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.veterinaryId) {
      Swal.fire('Error', 'Please fill all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/vets/register', formData);

      Swal.fire({
        title: 'Registration Successful!',
        text: 'Welcome to PawPal Veterinary System',
        icon: 'success',
        timer: 2000
      });

      // Auto login after registration
      const loginRes = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));

      navigate('/vet/dashboard');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <AuthContainer>
        <AuthCard>
          <CardHeader>
            <LogoIcon />
            <Typography variant="h4" fontWeight="bold">
              Join PawPal as Veterinarian
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
              Create your professional account
            </Typography>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Veterinary License ID"
                    name="veterinaryId"
                    value={formData.veterinaryId}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specialization (e.g., Surgery, Dermatology)"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isPrimaryVet"
                        checked={formData.isPrimaryVet}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="I am the Primary Veterinarian of my clinic"
                  />
                </Grid>
                {formData.isPrimaryVet && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Clinic ID (if already created)"
                      name="clinicId"
                      value={formData.clinicId}
                      onChange={handleChange}
                      helperText="Leave blank if creating new clinic"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <SubmitButton
                    fullWidth
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Register as Veterinarian'}
                  </SubmitButton>
                </Grid>
              </Grid>

              <Box textAlign="center" mt={4}>
                <Typography variant="body2" color="textSecondary">
                  Already have an account?{' '}
                  <Link href="/vet/login" sx={{ color: '#8e24aa', fontWeight: 'bold' }}>
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardBody>
        </AuthCard>
      </AuthContainer>
    </>
  );
};

export default VetRegister;