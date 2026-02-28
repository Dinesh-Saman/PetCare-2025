// src/pages/owner/BookAppointment.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, Grid, FormControl,
  InputLabel, Select, MenuItem, InputAdornment, CircularProgress,
  Chip, Divider
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
  padding: '40px 20px',
}));

const AuthCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 800,
  borderRadius: 32,
  boxShadow: '0 25px 70px rgba(0,0,0,0.18)',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.3)',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  color: 'white',
  padding: '50px 40px',
  textAlign: 'center',
}));

const CardBody = styled(Box)(({ theme }) => ({
  padding: '48px 40px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
  color: 'white',
  padding: '18px',
  borderRadius: 16,
  fontWeight: '800',
  fontSize: '1.25rem',
  textTransform: 'none',
  marginTop: 30,
  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #059669, #2563eb)',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 30px rgba(16, 185, 129, 0.4)',
  },
  '&:disabled': {
    background: '#e2e8f0',
    color: '#94a3b8'
  }
}));

const TimeSlotButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isBooked',
})(({ theme, isSelected, isBooked }) => ({
  padding: '12px',
  borderRadius: '12px',
  border: '2px solid',
  borderColor: isBooked ? '#e2e8f0' : isSelected ? '#3b82f6' : '#f1f5f9',
  backgroundColor: isBooked ? '#f8fafc' : isSelected ? '#eff6ff' : 'white',
  color: isBooked ? '#94a3b8' : isSelected ? '#1e3a8a' : '#475569',
  fontWeight: '600',
  textTransform: 'none',
  cursor: isBooked ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: isBooked ? '#e2e8f0' : '#3b82f6',
    backgroundColor: isBooked ? '#f8fafc' : '#eff6ff',
    transform: isBooked ? 'none' : 'scale(1.02)',
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
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  // Generate slots from 9:00 AM to 6:00 PM
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

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

  useEffect(() => {
    if (!userId) return;

    const fetchInitialData = async () => {
      try {
        setFetchingData(true);
        const petsRes = await api.get(`/pets/owner/${userId}`);
        setPets(petsRes.data.pets || []);
        const clinicsRes = await api.get('/clinics');
        setClinics(clinicsRes.data.clinics || clinicsRes.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
        Swal.fire('Error', 'Could not load pets or clinics', 'error');
      } finally {
        setFetchingData(false);
      }
    };

    fetchInitialData();
  }, [userId]);

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
        setVets([]);
      }
    };
    fetchVets();
  }, [formData.clinicId]);

  // Fetch booked slots when vet and date are selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.vetId || !formData.date) {
        setBookedSlots([]);
        return;
      }

      try {
        setFetchingSlots(true);
        const response = await api.get(`/appointments/vet/${formData.vetId}?date=${formData.date}`);
        const appointments = response.data.appointments || [];

        // Extract times from appointments (format: HH:mm)
        const bookedTimes = appointments
          .filter(app => app.status !== 'Canceled')
          .map(app => {
            const date = new Date(app.dateTime);
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          });

        setBookedSlots(bookedTimes);
      } catch (error) {
        console.error('Error fetching slots:', error);
        setBookedSlots([]);
      } finally {
        setFetchingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.vetId, formData.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'date' || name === 'vetId' ? { time: '' } : {}) }));
  };

  const handleSlotSelect = (time) => {
    if (bookedSlots.includes(time)) return;
    setFormData(prev => ({ ...prev, time }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.petId || !formData.clinicId || !formData.vetId || !formData.date || !formData.time || !formData.reason) {
      Swal.fire('Error', 'Please fill all required fields and select a time slot', 'warning');
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
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/owner/my-appointments');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Could not book appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <AuthContainer>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={5} />
          <Typography variant="h6" sx={{ mt: 3, color: '#1e3a8a' }}>
            Preparing everything for your pet...
          </Typography>
        </Box>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <AuthCard>
        <CardHeader>
          <PetsIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" fontWeight="900" letterSpacing="-1px">
            Book Appointment
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, opacity: 0.9, fontWeight: 400 }}>
            Choose the best time for your pet's health
          </Typography>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Pet Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Choose Pet</InputLabel>
                  <Select
                    name="petId"
                    label="Choose Pet"
                    value={formData.petId}
                    onChange={handleChange}
                    sx={{ borderRadius: 4 }}
                  >
                    {pets.map(pet => (
                      <MenuItem key={pet._id} value={pet._id}>
                        {pet.name} ({pet.species})
                      </MenuItem>
                    ))}
                    {pets.length === 0 && <MenuItem disabled>No pets found</MenuItem>}
                  </Select>
                </FormControl>
              </Grid>

              {/* Clinic Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Clinic</InputLabel>
                  <Select
                    name="clinicId"
                    label="Clinic"
                    value={formData.clinicId}
                    onChange={handleChange}
                    sx={{ borderRadius: 4 }}
                  >
                    {clinics.map(clinic => (
                      <MenuItem key={clinic._id} value={clinic._id}>{clinic.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Vet Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required disabled={!formData.clinicId} variant="outlined">
                  <InputLabel>Veterinarian</InputLabel>
                  <Select
                    name="vetId"
                    label="Veterinarian"
                    value={formData.vetId}
                    onChange={handleChange}
                    sx={{ borderRadius: 4 }}
                  >
                    {vets.map(vet => (
                      <MenuItem key={vet._id} value={vet._id}>Dr. {vet.firstName} {vet.lastName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Visit Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                />
              </Grid>

              {/* Time Slots Section */}
              {formData.vetId && formData.date && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="700" color="#1e293b" gutterBottom>
                      Available Time Slots
                    </Typography>
                    {fetchingSlots ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="textSecondary">Checking availability...</Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {timeSlots.map((time) => (
                          <Grid item xs={4} sm={3} md={2.4} key={time}>
                            <TimeSlotButton
                              fullWidth
                              variant="outlined"
                              isBooked={bookedSlots.includes(time)}
                              isSelected={formData.time === time}
                              onClick={() => handleSlotSelect(time)}
                              disabled={bookedSlots.includes(time)}
                            >
                              {time}
                            </TimeSlotButton>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                  <Divider sx={{ my: 3 }} />
                </Grid>
              )}

              {/* Reason */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Visit"
                  name="reason"
                  multiline
                  rows={2}
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <SubmitButton
                  fullWidth
                  type="submit"
                  disabled={loading || !formData.time}
                >
                  {loading ? 'Confirming...' : 'Confirm Appointment'}
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
