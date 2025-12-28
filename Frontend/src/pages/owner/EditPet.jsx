import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, TextField, Button, Paper, Grid, FormControl,
  InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ScaleIcon from '@mui/icons-material/Scale';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import Header from '../../components/layout/Header';

const FormContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}));

const FormCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 700,
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
  padding: '16px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.2rem',
  textTransform: 'none',
  marginTop: 30,
  '&:hover': {
    background: 'linear-gradient(90deg, #1976d2, #00bcd4)',
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  padding: '16px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.2rem',
  textTransform: 'none',
  marginTop: 20,
  marginLeft: 16,
}));

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
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
        const petData = response.data;

        setPet(petData);
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
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.species.trim()) {
      Swal.fire('Error', 'Pet name and species are required', 'warning');
      return;
    }

    setSaving(true);

    try {
      await api.put(`/pets/${id}`, formData);

      Swal.fire({
        title: 'Updated!',
        text: `${formData.name}'s profile has been updated`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      navigate(`/owner/dashboard`);
    } catch (error) {
      console.error('Error updating pet:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Could not update pet profile',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <FormContainer>
          <Typography variant="h5" color="#666">
            Loading pet details...
          </Typography>
        </FormContainer>
      </>
    );
  }

  return (
    <>
      <Header />
      <FormContainer>
        <FormCard>
          <CardHeader>
            <LogoIcon />
            <Typography variant="h4" fontWeight="bold">
              Edit Pet Profile
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
              Update {pet?.name}'s information
            </Typography>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pet Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PetsIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Species"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Breed (Optional)"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScaleIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Color/Markings"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ColorLensIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Microchip Number"
                    name="microchipNumber"
                    value={formData.microchipNumber}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Photo URL"
                    name="photo"
                    value={formData.photo}
                    onChange={handleChange}
                    placeholder="Paste updated image link"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhotoCameraIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Update medical history, behavior, or care instructions..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} textAlign="center">
                  <SubmitButton
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </SubmitButton>

                  <CancelButton
                    onClick={() => navigate(`/owner/pets/${id}`)}
                    disabled={saving}
                  >
                    Cancel
                  </CancelButton>
                </Grid>
              </Grid>
            </form>
          </CardBody>
        </FormCard>
      </FormContainer>
    </>
  );
};

export default EditPet;