import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Container, Typography, TextField, Button, Grid, Paper,
  Avatar, CircularProgress, IconButton, MenuItem, Stack, alpha
} from '@mui/material';
import { styled } from '@mui/system';
import {
  Pets as PetsIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import Header from '../../components/layout/Header';

const PageContainer = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  paddingTop: '40px',
  paddingBottom: '80px',
});

const GlassPaper = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  borderRadius: '32px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 25px 70px rgba(0, 0, 0, 0.07)',
  overflow: 'hidden',
});

const FormBanner = styled(Box)({
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  color: 'white',
  padding: '60px 40px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -30,
    right: -30,
    width: '150px',
    height: '150px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
  }
});

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: '',
    color: '',
    weight: '',
    microchipNumber: '',
    photo: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get(`/pets/${id}`);
        const petData = response.data.pet || response.data;
        setFormData({
          name: petData.name || '',
          species: petData.species || '',
          breed: petData.breed || '',
          dateOfBirth: petData.dateOfBirth ? petData.dateOfBirth.split('T')[0] : '',
          gender: petData.gender || '',
          color: petData.color || '',
          weight: petData.weight || '',
          microchipNumber: petData.microchipNumber || '',
          photo: petData.photo || '',
          notes: petData.notes || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pet:', error);
        Swal.fire('Error', 'Could not load pet details', 'error');
        navigate('/owner/profile');
      }
    };
    fetchPet();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/pets/${id}`, formData);
      Swal.fire({
        title: 'Profile Updated!',
        text: `${formData.name}'s information has been saved successfully.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
        borderRadius: '20px'
      });
      navigate(`/owner/pets/${id}`);
    } catch (error) {
      Swal.fire('Error', 'Failed to update pet profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
      <CircularProgress color="primary" />
    </Box>
  );

  return (
    <PageContainer>
      <Header />
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: '#64748b', fontWeight: 600, '&:hover': { bgcolor: 'transparent', color: '#1e293b' } }}
          >
            Back
          </Button>
        </Box>

        <GlassPaper>
          <FormBanner>
            <PetsIcon sx={{ fontSize: 48, mb: 2, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }} />
            <Typography variant="h3" fontWeight="900" gutterBottom>Edit Pet Profile</Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Update details for your beloved {formData.name}
            </Typography>
          </FormBanner>

          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 4, md: 6 } }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={formData.photo}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '4px solid white',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: '#4f46e5',
                      color: 'white',
                      '&:hover': { bgcolor: '#4338ca' }
                    }}
                  >
                    <ImageIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Pet Name" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Species" required
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Gender" select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Date of Birth" type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Weight (kg)" type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Profile Photo URL"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Special care or medical notes"
                  multiline rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 6, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderColor: alpha('#4f46e5', 0.5),
                  color: '#4f46e5'
                }}
              >
                Cancel Changes
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: '50px',
                  px: 6,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                  }
                }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Profile Changes'}
              </Button>
            </Box>
          </Box>
        </GlassPaper>
      </Container>
    </PageContainer>
  );
};

export default EditPet;
