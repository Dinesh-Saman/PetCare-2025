// src/components/LoginPopup.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Pets as PetsIcon } from '@mui/icons-material';
import api from '../services/api';
import Swal from 'sweetalert2';

const LoginPopup = ({ open, onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

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
        setError('This portal is for pet owners only');
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

      onLoginSuccess(user);
      onClose();
      setFormData({ email: '', password: '' });

    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
          color: 'white',
          py: 3,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <PetsIcon sx={{ fontSize: 50 }} />
        </Box>
        <Typography variant="h5" fontWeight="bold">
          Pet Owner Login
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Access your pet's health records and appointments
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

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
              autoFocus
              sx={{ 
                mt: 2, // Added top margin here
              }}
            />

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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
                color: 'white',
                py: 1.5,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                mt: 1,
                '&:hover': {
                  background: 'linear-gradient(90deg, #1976d2, #00bcd4)',
                },
                '&:disabled': {
                  background: '#ccc',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="textSecondary">
                New pet owner?{' '}
                <Button
                  component="a"
                  href="/register"
                  sx={{
                    color: '#2196f3',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                  }}
                  onClick={handleClose}
                >
                  Create an account
                </Button>
              </Typography>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopup;