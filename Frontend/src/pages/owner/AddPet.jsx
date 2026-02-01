import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import LocationCityIcon from '@mui/icons-material/LocationCity'; // New icon for clinic

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
  maxWidth: 800, // Increased slightly to accommodate new field
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

const AddPet = () => {
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
    notes: '',
    clinicId: '' // New field
  });

  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch available clinics on mount
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await api.get('/clinics'); // Adjust endpoint if needed
        setClinics(response.data.clinics || response.data);
      } catch (error) {
        console.error('Error fetching clinics:', error);
        Swal.fire('Warning', 'Could not load clinics list. You can still proceed.', 'warning');
        setClinics([]);
      } finally {
        setLoadingClinics(false);
      }
    };

    fetchClinics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.species.trim() || !formData.clinicId) {
      Swal.fire('Error', 'Pet name, species, and registered clinic are required', 'warning');
      return;
    }

    setLoading(true);

    try {
      await api.post('/pets', formData);

      Swal.fire({
        title: 'Pet Added!',
        text: `${formData.name} has been successfully registered!`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });

      navigate('/owner/profile');
    } catch (error) {
      console.error('Error adding pet:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Could not add pet. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormCard>
        <CardHeader>
          <LogoIcon />
          <Typography variant="h4" fontWeight="bold">
            Add New Pet
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
            Register your pet to manage health records and appointments
          </Typography>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Row 1 */}
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
                  label="Species (e.g., Dog, Cat, Bird)"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Row 2 */}
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
                <FormControl fullWidth required>
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

              {/* Row 3 */}
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

              {/* Row 4 */}
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
                  label="Microchip Number (Optional)"
                  name="microchipNumber"
                  value={formData.microchipNumber}
                  onChange={handleChange}
                />
              </Grid>

              {/* Row 5: NEW - Registered Clinic */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Registered Clinic</InputLabel>
                  <Select
                    name="clinicId"
                    value={formData.clinicId}
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationCityIcon color="action" />
                      </InputAdornment>
                    }
                    disabled={loadingClinics}
                  >
                    <MenuItem value="">
                      <em>{loadingClinics ? 'Loading clinics...' : 'Select a clinic'}</em>
                    </MenuItem>
                    {clinics.map((clinic) => (
                      <MenuItem key={clinic._id} value={clinic._id}>
                        {clinic.name} - {clinic.address}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Row 6: Photo URL */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Photo URL (Optional)"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  placeholder="Paste image link (e.g., from Imgur, Cloudinary)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhotoCameraIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Row 7: Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Any medical history, allergies, behavior notes, or special care instructions..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12} textAlign="center">
                <SubmitButton type="submit" disabled={loading}>
                  {loading ? 'Adding Pet...' : 'Add My Pet'}
                </SubmitButton>
              </Grid>
            </Grid>
          </form>
        </CardBody>
      </FormCard>
    </FormContainer>
  );
};

export default AddPet;