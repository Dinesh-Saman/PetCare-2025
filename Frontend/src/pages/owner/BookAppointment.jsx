// src/pages/owner/BookAppointment.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, Grid, FormControl,
  InputLabel, Select, MenuItem, InputAdornment, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';

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

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    petId: '',
    clinicId: '',
    vetId: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });

  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  // Get current user ID from localStorage (or your auth context)
  useEffect(() => {
    const userData = localStorage.getItem('owner');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id || parsed._id);
      } catch (e) {
        console.error('Failed to parse user data');
        Swal.fire('Error', 'Session invalid. Please log in again.', 'error');
        navigate('/login');
      }
    } else {
      Swal.fire('Error', 'Not authenticated. Please log in.', 'error');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch owner's pets using secure /pets/owner/:ownerId route + all clinics
  useEffect(() => {
    if (!userId) return;

    const fetchInitialData = async () => {
      try {
        setFetchingData(true);

        // Secure route: Only allows viewing own pets
        const petsRes = await api.get(`/pets/owner/${userId}`);
        setPets(petsRes.data.pets || []);

        // Fetch all clinics
        const clinicsRes = await api.get('/clinics');
        setClinics(clinicsRes.data.clinics || clinicsRes.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
        const message = error.response?.data?.message || 'Could not load pets or clinics';
        Swal.fire('Error', message, 'error');
        setPets([]);
        setClinics([]);
      } finally {
        setFetchingData(false);
      }
    };

    fetchInitialData();
  }, [userId]);

  // Fetch vets when clinic is selected
  useEffect(() => {
    const fetchVets = async () => {
      if (!formData.clinicId) {
        setVets([]);
        return;
      }

      try {
        const response = await api.get(`vets/clinic/${formData.clinicId}`);
        setVets(response.data.vets || []);
      } catch (error) {
        console.error('Error fetching vets:', error);
        setVets([]);
        Swal.fire('Warning', 'Could not load veterinarians for this clinic', 'warning');
      }
    };

    fetchVets();
  }, [formData.clinicId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.petId || !formData.clinicId || !formData.vetId || !formData.date || !formData.time || !formData.reason) {
      Swal.fire('Error', 'Please fill all required fields', 'warning');
      return;
    }

    const dateTime = `${formData.date}T${formData.time}:00`;

    setLoading(true);
    try {
      await api.post('/appointments/book', {
        petId: formData.petId,
        clinicId: formData.clinicId,
        vetId: formData.vetId,
        dateTime,
        reason: formData.reason.trim(),
        notes: formData.notes.trim()
      });

      Swal.fire({
        title: 'Appointment Booked!',
        text: 'Your appointment has been successfully scheduled',
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });

      navigate('/owner/profile');
    } catch (error) {
      console.error('Error booking appointment:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Could not book appointment. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <AuthContainer>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={5} />
          <Typography variant="h6" sx={{ mt: 3, color: '#555' }}>
            Loading your pets and clinics...
          </Typography>
        </Box>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <AuthCard>
        <CardHeader>
          <LogoIcon />
          <Typography variant="h4" fontWeight="bold">
            Book Appointment
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
            Schedule a visit for your pet
          </Typography>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Pet Selection - Uses secure /pets/owner/:ownerId route */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Your Pet</InputLabel>
                  <Select
                    name="petId"
                    value={formData.petId}
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <PetsIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Choose a pet</em>
                    </MenuItem>
                    {pets.length === 0 ? (
                      <MenuItem disabled>No pets found. Please add one first!</MenuItem>
                    ) : (
                      pets.map(pet => (
                        <MenuItem key={pet._id} value={pet._id}>
                          {pet.name} ({pet.species}{pet.breed ? ` • ${pet.breed}` : ''})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Clinic Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Select Clinic</InputLabel>
                  <Select
                    name="clinicId"
                    value={formData.clinicId}
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>Choose a clinic</em>
                    </MenuItem>
                    {clinics.map(clinic => (
                      <MenuItem key={clinic._id} value={clinic._id}>
                        {clinic.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Vet Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required disabled={!formData.clinicId}>
                  <InputLabel>Select Veterinarian</InputLabel>
                  <Select
                    name="vetId"
                    value={formData.vetId}
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>{formData.clinicId ? 'Choose a vet' : 'Select clinic first'}</em>
                    </MenuItem>
                    {vets.map(vet => (
                      <MenuItem key={vet._id} value={vet._id}>
                        Dr. {vet.firstName} {vet.lastName} {vet.specialization ? `(${vet.specialization})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Appointment Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
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

              {/* Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Appointment Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Reason */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Visit"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  multiline
                  rows={3}
                  placeholder="e.g., Annual checkup, Vaccination, Skin issue, etc."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <MedicalServicesIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Any symptoms, concerns, or special requests..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <NoteIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <SubmitButton
                  fullWidth
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Booking Appointment...' : 'Book Appointment'}
                </SubmitButton>
              </Grid>
            </Grid>
          </form>
        </CardBody>
      </AuthCard>
    </AuthContainer>
  );
};

export default BookAppointment;