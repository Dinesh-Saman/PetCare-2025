// src/pages/owner/BookAppointment.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ── Styled Components (unchanged) ────────────────────────────────────────
const PageContainer = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
  padding: '2rem 2rem',
});

const BookingWrapper = styled(Box)({
  maxWidth: 1400,
  margin: '0 auto',
  borderRadius: 28,
  overflow: 'hidden',
  boxShadow: '0 30px 80px rgba(16, 185, 129, 0.20)',
  background: 'white',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  minHeight: '680px',
});

const ImageSide = styled(Box)({
  position: 'relative',
  overflow: 'hidden',
  background: '#e5e7eb',
  display: 'flex',
  alignItems: 'center',
});

const AppointmentImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
});

const FormSide = styled(Box)({
  padding: '4.5rem 4rem 5rem',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '680px',
});

const HeaderTitle = styled(Typography)({
  fontSize: '2.6rem',
  fontWeight: 700,
  color: '#065f46',
  marginBottom: '0.8rem',
  textAlign: 'center',
});

const FormSubtitle = styled(Typography)({
  color: '#475569',
  fontSize: '1.18rem',
  textAlign: 'center',
  marginBottom: '3.5rem',
  lineHeight: 1.6,
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
    '& fieldset': { borderColor: '#d1d5db' },
    '&:hover fieldset': { borderColor: '#10b981' },
    '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': {
    color: '#4b5563',
    fontWeight: 500,
    '&.Mui-focused': { color: '#10b981' },
  },
});

const StyledSelect = styled(Select)({
  borderRadius: 14,
  backgroundColor: 'rgba(255,255,255,0.75)',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981', borderWidth: '2px' },
});

const SubmitButton = styled(Button)({
  width: '100%',
  padding: '1.3rem',
  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
  color: 'white',
  borderRadius: 18,
  fontSize: '1.22rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 12px 32px rgba(16,185,129,0.35)',
  transition: 'all 0.35s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 48px rgba(16,185,129,0.45)',
    background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
  },
  '&:disabled': {
    background: '#9ca3af',
    boxShadow: 'none',
    transform: 'none',
  },
});

// ────────────────────────────────────────────────────────────────────────────

const BookAppointment = () => {
  const navigate = useNavigate();

  // ── ALL hooks go here (unconditionally) ─────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    petId: '',
    clinicId: '',
    vetId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  });

  const [pets, setPets] = useState([]);
  const [selectedPetInfo, setSelectedPetInfo] = useState(null);
  const [registeredClinic, setRegisteredClinic] = useState(null);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [userId, setUserId] = useState(null);
  const [fetchingClinic, setFetchingClinic] = useState(false);
  const [clinicFetchError, setClinicFetchError] = useState(null);

  // 1. Check if user is logged in
  useEffect(() => {
    const ownerData = localStorage.getItem('owner_user');
    let valid = false;

    if (ownerData) {
      try {
        JSON.parse(ownerData);
        valid = true;
      } catch (err) {
        localStorage.removeItem('owner_user');
      }
    }

    setIsAuthenticated(valid);
    setCheckingAuth(false);
  }, []);

  // 2. Extract userId once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const ownerData = localStorage.getItem('owner_user');
    if (ownerData) {
      try {
        const parsed = JSON.parse(ownerData);
        setUserId(parsed.id || parsed._id || null);
      } catch (e) {
        console.error('Failed to parse owner data');
        Swal.fire('Error', 'Invalid session. Please log in again.', 'error');
        navigate('/login');
      }
    }
  }, [isAuthenticated, navigate]);

  // 3. Load pets when we have userId
  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    const fetchInitialData = async () => {
      try {
        setFetchingData(true);
        const res = await api.get(`/pets/owner/${userId}`);
        setPets(res.data.pets || res.data || []);
      } catch (err) {
        console.error('Failed to load pets', err);
        Swal.fire('Error', 'Could not load your pets', 'error');
      } finally {
        setFetchingData(false);
      }
    };

    fetchInitialData();
  }, [userId, isAuthenticated]);

  // 4. Load pet + registered clinic when pet is selected
  useEffect(() => {
    if (!isAuthenticated || !formData.petId) {
      setSelectedPetInfo(null);
      setRegisteredClinic(null);
      setClinicFetchError(null);
      setFormData(prev => ({ ...prev, clinicId: '', vetId: '' }));
      return;
    }

    const fetchPetAndClinic = async () => {
      setFetchingClinic(true);

      try {
        const petRes = await api.get(`/pets/${formData.petId}`);
        const pet = petRes.data.pet || petRes.data;
        setSelectedPetInfo(pet);

        let clinic = null;

        if (pet.registeredClinicId) {
          if (typeof pet.registeredClinicId === 'object') {
            clinic = pet.registeredClinicId;
          } else if (typeof pet.registeredClinicId === 'string') {
            const clinicRes = await api.get(`/clinics/${pet.registeredClinicId}`);
            clinic = clinicRes.data.clinic || clinicRes.data;
          }
        }

        setRegisteredClinic(clinic);

        if (clinic?._id) {
          setFormData(prev => ({ ...prev, clinicId: clinic._id, vetId: '' }));
        }
      } catch (err) {
        console.error('Error loading pet/clinic', err);
        setClinicFetchError('Could not load pet or clinic info');
      } finally {
        setFetchingClinic(false);
      }
    };

    fetchPetAndClinic();
  }, [formData.petId, isAuthenticated]);

  // 5. Load vets when clinic changes
  useEffect(() => {
    if (!isAuthenticated || !formData.clinicId) {
      setVets([]);
      return;
    }

    const loadVets = async () => {
      try {
        const res = await api.get(`/vets/clinic/${formData.clinicId}`);
        const vetList = res.data.vets || res.data || [];
        setVets(vetList);

        // Clear vet selection if it's no longer valid
        if (formData.vetId && !vetList.some(v => v._id === formData.vetId)) {
          setFormData(prev => ({ ...prev, vetId: '' }));
        }
      } catch (err) {
        console.error('Failed to load vets', err);
        setVets([]);
      }
    };

    loadVets();
  }, [formData.clinicId, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'petId') {
        return { ...prev, petId: value, clinicId: '', vetId: '' };
      }
      return { ...prev, [name]: value };
    });

    if (name === 'petId') {
      setSelectedPetInfo(null);
      setRegisteredClinic(null);
      setClinicFetchError(null);
    }
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.petId || !formData.clinicId || !formData.vetId || !formData.date || !formData.time || !formData.reason?.trim()) {
      Swal.fire('Missing fields', 'Please complete all required information', 'warning');
      return;
    }

    if (selectedPetInfo?.registrationStatus !== 'Approved') {
      Swal.fire('Not allowed', 'Pet registration must be approved before booking', 'warning');
      return;
    }

    const selected = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      Swal.fire('Invalid date', 'Appointment cannot be in the past', 'warning');
      return;
    }

    setLoading(true);

    try {
      await api.post('/appointments/book', {
        petId: formData.petId,
        clinicId: formData.clinicId,
        vetId: formData.vetId,
        dateTime: `${formData.date}T${formData.time}:00`,
        reason: formData.reason.trim(),
        notes: formData.notes?.trim() || '',
      });

      Swal.fire({
        title: 'Success!',
        text: 'Appointment booked successfully',
        icon: 'success',
        timer: 2400,
        showConfirmButton: false,
      });

    } catch (err) {
      Swal.fire(
        'Error',
        err.response?.data?.message || 'Failed to book appointment',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (checkingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return null; // ← hides component when not logged in

    // Alternative: show login prompt (uncomment if desired)
    /*
    return (
      <PageContainer>
        <Box sx={{ textAlign: 'center', py: 12, px: 4, maxWidth: 700, mx: 'auto' }}>
          <Typography variant="h4" gutterBottom color="primary">
            Please sign in
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            You need to be logged in to book appointments for your pets.
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Box>
      </PageContainer>
    );
    */
  }

  if (fetchingData) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <CircularProgress size={80} sx={{ color: '#10b981' }} thickness={5} />
          <Typography variant="h6" sx={{ mt: 4, color: '#065f46' }}>
            Loading your pets...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BookingWrapper>
        <ImageSide>
          <AppointmentImage
            src="https://images.pexels.com/photos/15005236/pexels-photo-15005236.jpeg"
            alt="Happy pet at vet"
          />
        </ImageSide>

        <FormSide>
          <HeaderTitle>Book Your Pet's Appointment</HeaderTitle>
          <FormSubtitle>
            Select your pet, clinic, vet, date & time... we'll take care of the rest.
          </FormSubtitle>

          <form onSubmit={handleSubmit}>
            <div className="container">
              <div className="row g-4">
                {/* Pet */}
                <div className="col-12">
                  <FormControl fullWidth required>
                    <InputLabel>Select Pet</InputLabel>
                    <StyledSelect
                      name="petId"
                      value={formData.petId}
                      label="Select Pet"
                      onChange={handleChange}
                      startAdornment={<InputAdornment position="start"><PetsIcon sx={{ color: '#10b981' }} /></InputAdornment>}
                    >
                      <MenuItem value=""><em>Choose a pet</em></MenuItem>
                      {pets.map(pet => (
                        <MenuItem key={pet._id} value={pet._id}>
                          {pet.name} ({pet.species}{pet.breed ? ` • ${pet.breed}` : ''})
                        </MenuItem>
                      ))}
                      {pets.length === 0 && (
                        <MenuItem disabled>No pets found. Add one first.</MenuItem>
                      )}
                    </StyledSelect>
                  </FormControl>
                </div>

                {/* Registration warning */}
                {selectedPetInfo && selectedPetInfo.registrationStatus !== 'Approved' && (
                  <div className="col-12">
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      {selectedPetInfo.name}'s registration is <strong>{selectedPetInfo.registrationStatus?.toLowerCase() || 'pending'}</strong>.
                      Booking is only allowed after approval.
                    </Alert>
                  </div>
                )}

                {/* Clinic – read-only registered clinic */}
                <div className="col-12">
                  <FormControl fullWidth required disabled={!formData.petId || fetchingClinic}>
                    <InputLabel>Clinic</InputLabel>
                    <StyledSelect
                      name="clinicId"
                      value={formData.clinicId}
                      label="Clinic"
                      startAdornment={<InputAdornment position="start"><LocationOnIcon sx={{ color: '#10b981' }} /></InputAdornment>}
                    >
                      {registeredClinic ? (
                        <MenuItem value={registeredClinic._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography fontWeight={600}>{registeredClinic.name}</Typography>
                            {registeredClinic.address && (
                              <Typography variant="body2" color="text.secondary">
                                {registeredClinic.address}
                              </Typography>
                            )}
                            <Chip label="Registered" color="success" size="small" icon={<CheckCircleIcon />} />
                          </Box>
                        </MenuItem>
                      ) : (
                        <MenuItem value="">
                          <em>{fetchingClinic ? 'Loading...' : 'No registered clinic'}</em>
                        </MenuItem>
                      )}
                    </StyledSelect>
                    {registeredClinic && (
                      <Typography variant="caption" sx={{ mt: 1, ml: 1.5, display: 'block', color: 'text.secondary' }}>
                        To book at another clinic, update your pet's registration first.
                      </Typography>
                    )}
                  </FormControl>
                </div>

                {/* Vet */}
                <div className="col-12">
                  <FormControl fullWidth required disabled={!formData.clinicId || fetchingClinic}>
                    <InputLabel>Veterinarian</InputLabel>
                    <StyledSelect
                      name="vetId"
                      value={formData.vetId}
                      label="Veterinarian"
                      onChange={handleChange}
                      startAdornment={<InputAdornment position="start"><PersonIcon sx={{ color: '#10b981' }} /></InputAdornment>}
                    >
                      <MenuItem value=""><em>{vets.length ? 'Select vet' : 'No vets available'}</em></MenuItem>
                      {vets.map(vet => (
                        <MenuItem key={vet._id} value={vet._id}>
                          Dr. {vet.firstName} {vet.lastName}
                          {vet.specialization && ` (${vet.specialization})`}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </div>

                {/* Date + Time */}
                <div className="col-12 col-md-6">
                  <StyledTextField
                    fullWidth
                    required
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    disabled={!formData.clinicId}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: getTomorrowDate() }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ color: '#10b981' }} /></InputAdornment>,
                    }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <StyledTextField
                    fullWidth
                    required
                    label="Time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={!formData.clinicId}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{ color: '#10b981' }} /></InputAdornment>,
                    }}
                  />
                </div>

                <div className="col-12">
                  <StyledTextField
                    fullWidth
                    required
                    multiline
                    rows={3}
                    label="Reason for visit"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    disabled={!formData.clinicId}
                    placeholder="Annual check-up, vaccination, skin problem, surgery consult..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <MedicalServicesIcon sx={{ color: '#10b981' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className="col-12">
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Additional notes (optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={!formData.clinicId}
                    placeholder="Allergies, current medications, behavior notes..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <NoteIcon sx={{ color: '#10b981' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className="col-12">
                  <SubmitButton
                    type="submit"
                    disabled={
                      loading ||
                      fetchingClinic ||
                      !registeredClinic?._id ||
                      selectedPetInfo?.registrationStatus !== 'Approved' ||
                      !formData.vetId ||
                      !formData.date ||
                      !formData.time ||
                      !formData.reason?.trim()
                    }
                  >
                    {loading ? 'Booking...' : 'Confirm Appointment'}
                  </SubmitButton>
                </div>
              </div>
            </div>
          </form>
        </FormSide>
      </BookingWrapper>
    </PageContainer>
  );
};

export default BookAppointment;