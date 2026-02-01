import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, TextField, Button, Paper, Grid, Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import Header from '../../components/layout/Header';

const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
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
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
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
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: '14px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.1rem',
  textTransform: 'none',
  marginTop: 20,
  '&:hover': {
    background: 'linear-gradient(90deg, #1976d2, #00bcd4)',
  },
}));

const OwnerRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    profilePhoto: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'address'];
    for (let field of required) {
      if (!formData[field].trim()) {
        Swal.fire('Error', 'Please fill all required fields', 'warning');
        return;
      }
    }

    setLoading(true);
    try {
      await api.post('owners/register', formData);

      // Auto login after registration
      const loginRes = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = loginRes.data;
      localStorage.setItem('token', token);
      localStorage.setItem('owner', JSON.stringify(user));

      Swal.fire({
        title: 'Welcome to PawPal!',
        text: 'Your account has been created',
        icon: 'success',
        timer: 2000
      });

      navigate('/owner/profile');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthContainer>
        <AuthCard>
          <CardHeader>
            <LogoIcon />
            <Typography variant="h4" fontWeight="bold">
              Join PawPal as Pet Owner
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
              Manage your pet's health and appointments
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
                    label="Profile Photo URL (Optional)"
                    name="profilePhoto"
                    value={formData.profilePhoto}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Home Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <SubmitButton
                    fullWidth
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </SubmitButton>
                </Grid>
              </Grid>

              <Box textAlign="center" mt={4}>
                <Typography variant="body2" color="textSecondary">
                  Already have an account?{' '}
                  <Link href="/login" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
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

export default OwnerRegister;