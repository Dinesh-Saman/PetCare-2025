// src/pages/owner/BookAppointment.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, Grid, FormControl,
  InputLabel, Select, MenuItem, InputAdornment, CircularProgress,
  Chip, Divider, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import Navbar from '../../components/Navbar';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  paddingTop: '100px', // Adjusted for Navbar
  paddingBottom: '60px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const BookingWrapper = styled(Paper)(({ theme }) => ({
  width: '95%',
  maxWidth: 1200,
  borderRadius: 40,
  overflow: 'hidden',
  boxShadow: '0 25px 70px rgba(79, 70, 229, 0.12)',
  display: 'grid',
  gridTemplateColumns: '1fr 1.2fr',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const ImageSide = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '60px',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '300px',
    height: '300px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
  [theme.breakpoints.down('md')]: {
    padding: '40px',
    textAlign: 'center',
    alignItems: 'center',
  }
}));

const FormSide = styled(Box)(({ theme }) => ({
  padding: '60px',
  background: 'white',
  [theme.breakpoints.down('sm')]: {
    padding: '40px 24px',
  }
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#4f46e5' },
    '&.Mui-focused fieldset': { borderColor: '#4f46e5', borderWidth: '2px' },
  },
});

const StyledSelect = styled(Select)({
  borderRadius: 16,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5', borderWidth: '2px' },
});

const SubmitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  color: 'white',
  padding: '18px',
  borderRadius: 20,
  fontWeight: '800',
  fontSize: '1.1rem',
  textTransform: 'none',
  marginTop: 20,
  boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 30px rgba(79, 70, 229, 0.4)',
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
  borderRadius: '14px',
  border: '1.5px solid',
  borderColor: isBooked ? '#f1f5f9' : isSelected ? '#4f46e5' : '#e2e8f0',
  backgroundColor: isBooked ? '#f8fafc' : isSelected ? alpha('#4f46e5', 0.1) : 'white',
  color: isBooked ? '#cbd5e1' : isSelected ? '#4f46e5' : '#475569',
  fontWeight: '700',
  textTransform: 'none',
  cursor: isBooked ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  borderStyle: isBooked ? 'dashed' : 'solid',
  '&:hover': {
    borderColor: isBooked ? '#f1f5f9' : '#4f46e5',
    backgroundColor: isBooked ? '#f8fafc' : alpha('#4f46e5', 0.05),
    transform: isBooked ? 'none' : 'translateY(-2px)',
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

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    const userData = localStorage.getItem('owner_user') || localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserId(parsed.id || parsed._id);
      } catch (e) {
        console.error('Failed to parse user data');
        Swal.fire('Error', 'Session invalid. Please log in again.', 'error');
        navigate('/');
      }
    } else {
      Swal.fire('Error', 'Not authenticated. Please log in.', 'error');
      navigate('/');
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
      <>
        <Navbar />
        <PageContainer>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={5} sx={{ color: '#4f46e5' }} />
            <Typography variant="h6" sx={{ mt: 3, color: '#1e293b' }}>
              Finding the best care for your pet...
            </Typography>
          </Box>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageContainer>
        <BookingWrapper elevation={0}>
          <ImageSide>
            <PetsIcon sx={{ fontSize: 80, mb: 4, opacity: 0.8 }} />
            <Typography variant="h2" fontWeight="900" sx={{ mb: 2, letterSpacing: '-2px', lineHeight: 1.1 }}>
              Book Your Pet's Visit
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: '400px' }}>
              Schedule a consultation with our expert veterinarians in just a few clicks.
            </Typography>

            <Box sx={{ mt: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarTodayIcon />
                </Box>
                <Typography variant="body1" fontWeight="600">Choose your date</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AccessTimeIcon />
                </Box>
                <Typography variant="body1" fontWeight="600">Pick a time slot</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PersonIcon />
                </Box>
                <Typography variant="body1" fontWeight="600">See your vet</Typography>
              </Box>
            </Box>
          </ImageSide>

          <FormSide>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Select Your Pet</InputLabel>
                    <StyledSelect
                      name="petId"
                      label="Select Your Pet"
                      value={formData.petId}
                      onChange={handleChange}
                      startAdornment={<InputAdornment position="start"><PetsIcon sx={{ color: '#4f46e5' }} /></InputAdornment>}
                    >
                      {pets.map(pet => (
                        <MenuItem key={pet._id} value={pet._id}>{pet.name} ({pet.species})</MenuItem>
                      ))}
                      {pets.length === 0 && <MenuItem disabled>No pets found</MenuItem>}
                    </StyledSelect>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Clinic</InputLabel>
                    <StyledSelect
                      name="clinicId"
                      label="Clinic"
                      value={formData.clinicId}
                      onChange={handleChange}
                      startAdornment={<InputAdornment position="start"><LocationOnIcon sx={{ color: '#4f46e5' }} /></InputAdornment>}
                    >
                      {clinics.map(clinic => (
                        <MenuItem key={clinic._id} value={clinic._id}>{clinic.name}</MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={!formData.clinicId}>
                    <InputLabel>Veterinarian</InputLabel>
                    <StyledSelect
                      name="vetId"
                      label="Veterinarian"
                      value={formData.vetId}
                      onChange={handleChange}
                      startAdornment={<InputAdornment position="start"><PersonIcon sx={{ color: '#4f46e5' }} /></InputAdornment>}
                    >
                      {vets.map(vet => (
                        <MenuItem key={vet._id} value={vet._id}>Dr. {vet.firstName} {vet.lastName}</MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Booking Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ color: '#4f46e5' }} /></InputAdornment>,
                    }}
                  />
                </Grid>

                {formData.vetId && formData.date && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="700" color="#1e293b" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="primary" /> Select Time Slot
                    </Typography>
                    {fetchingSlots ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="textSecondary">Checking slots...</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 1.5 }}>
                        {timeSlots.map((time) => (
                          <TimeSlotButton
                            key={time}
                            variant="outlined"
                            isBooked={bookedSlots.includes(time)}
                            isSelected={formData.time === time}
                            onClick={() => handleSlotSelect(time)}
                            disabled={bookedSlots.includes(time)}
                          >
                            {time}
                          </TimeSlotButton>
                        ))}
                      </Box>
                    )}
                  </Grid>
                )}

                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Reason for Visit"
                    name="reason"
                    multiline
                    rows={2}
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    placeholder="Short description of the visit..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Additional Notes"
                    name="notes"
                    multiline
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions or history..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <SubmitButton
                    fullWidth
                    type="submit"
                    disabled={loading || !formData.time}
                  >
                    {loading ? 'Confirming...' : 'Complete Booking'}
                  </SubmitButton>
                </Grid>
              </Grid>
            </form>
          </FormSide>
        </BookingWrapper>
      </PageContainer>
    </>
  );
};

export default BookAppointment;
