import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, TextField, Button, Paper, Grid, Link, Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import Header from '../../components/layout/Header'; // Keep header if needed

// Styled Components
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
  maxWidth: 480,
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

const VetLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;

      // Save token & user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      Swal.fire({
        title: 'Welcome back!',
        text: `Dr. ${user.firstName} ${user.lastName}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      // Navigate to vet dashboard
      navigate('/vet/dashboard');
    } catch (error) {
      Swal.fire('Login Failed', error.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header /> {/* Optional: keep header or remove */}
      <AuthContainer>
        <AuthCard>
          <CardHeader>
            <LogoIcon />
            <Typography variant="h4" fontWeight="bold">
              Veterinarian Login
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
              Access your clinic dashboard
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <SubmitButton
                    fullWidth
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </SubmitButton>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  New to PawPal?
                </Typography>
              </Divider>

              <Box textAlign="center">
                <Link href="/vet/register" variant="body1" sx={{ color: '#8e24aa', fontWeight: 'bold' }}>
                  Register as a Veterinarian
                </Link>
              </Box>
            </form>
          </CardBody>
        </AuthCard>
      </AuthContainer>
    </>
  );
};

export default VetLogin;