import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, TextField, Button, Paper, Grid, Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';

const AuthContainer = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
});

const AuthCard = styled(Paper)({
  width: '100%',
  maxWidth: 480,
  borderRadius: 24,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  overflow: 'hidden'
});

const CardHeader = styled(Box)({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: 40,
  textAlign: 'center'
});

const CardBody = styled(Box)({
  padding: 48
});

const LogoIcon = styled(PetsIcon)({
  fontSize: 80,
  marginBottom: 16
});

const SubmitButton = styled(Button)({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: '14px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.1rem',
  textTransform: 'none',
  marginTop: 20,
  '&:hover': {
    background: 'linear-gradient(90deg, #1976d2, #00bcd4)'
  }
});

const OwnerLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      Swal.fire('Error', 'Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);

    try {
      // Clear only owner-related items
      localStorage.removeItem('owner_token');
      localStorage.removeItem('owner_user');
      localStorage.removeItem('owner');

      delete api.defaults.headers.common['Authorization'];

      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;

      if (!user || user.role !== 'owner') {
        Swal.fire('Access Denied', 'This portal is for pet owners only', 'error');
        setLoading(false);
        return;
      }

      localStorage.setItem('owner_token', token);
      localStorage.setItem('owner_user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      Swal.fire({
        title: 'Welcome back!',
        text: `${user.firstName} ${user.lastName}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/owner/profile');
    } catch (error) {
      Swal.fire(
        'Login Failed',
        error.response?.data?.message || 'Invalid credentials',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <CardHeader>
          <LogoIcon />
          <Typography variant="h4" fontWeight="bold">
            Pet Owner Login
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
            Access your pet's health records and appointments
          </Typography>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  disabled={loading}
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
                  variant="outlined"
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <SubmitButton fullWidth type="submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </SubmitButton>
              </Grid>
            </Grid>

            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="textSecondary">
                New pet owner?{' '}
                <Link href="/register" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                  Create an account
                </Link>
              </Typography>
            </Box>
          </form>
        </CardBody>
      </AuthCard>
    </AuthContainer>
  );
};

export default OwnerLogin;