// src/pages/owner/BookAppointment.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Paper, FormControl,
    InputLabel, Select, MenuItem, InputAdornment, CircularProgress,
    Chip, Divider, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import Navbar from '../../components/Navbar';

const PageContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr',
    background: 'white',
    paddingTop: '64px',
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const ImageSide = styled(Box)(({ theme }) => ({
    background: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
        display: 'none',
    }
}));

const AppointmentImage = styled('img')({
    width: '100%',
    height: 'calc(100vh - 64px)',
    objectFit: 'cover',
    objectPosition: 'center',
    position: 'sticky',
    top: '64px',
    display: 'block',
});

const FormSide = styled(Box)(({ theme }) => ({
    padding: '80px 100px',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('lg')]: {
        padding: '60px 60px',
    },
    [theme.breakpoints.down('sm')]: {
        padding: '40px 24px',
    }
}));

const FormHeader = styled(Box)(({ theme }) => ({
    marginBottom: '40px',
    textAlign: 'left',
}));

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: 16,
        '& fieldset': { borderColor: '#e2e8f0', transition: 'all 0.2s ease' },
        '&:hover fieldset': { borderColor: '#4f46e5' },
        '&.Mui-focused fieldset': { borderColor: '#4f46e5', borderWidth: '2px' },
        '& input, & textarea': {
            outline: 'none !important',
            boxShadow: 'none !important',
        },
    },
});

const StyledSelect = styled(Select)(({ theme }) => ({
    height: '60px',
    borderRadius: 16,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5', borderWidth: '2px' },
    '& .MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
    },
}));

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
    shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isBooked' && prop !== 'isPast',
})(({ theme, isSelected, isBooked, isPast }) => ({
    padding: '12px',
    borderRadius: '14px',
    border: '1.5px solid',
    borderColor: (isBooked || isPast) ? '#f1f5f9' : isSelected ? '#4f46e5' : '#e2e8f0',
    backgroundColor: (isBooked || isPast) ? '#f8fafc' : isSelected ? alpha('#4f46e5', 0.1) : 'white',
    color: (isBooked || isPast) ? '#cbd5e1' : isSelected ? '#4f46e5' : '#475569',
    fontWeight: '700',
    textTransform: 'none',
    cursor: (isBooked || isPast) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        borderColor: (isBooked || isPast) ? '#f1f5f9' : '#4f46e5',
        backgroundColor: (isBooked || isPast) ? '#f8fafc' : alpha('#4f46e5', 0.05),
        transform: (isBooked || isPast) ? 'none' : 'translateY(-2px)',
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
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'date' || name === 'vetId' || name === 'clinicId' || name === 'petId' ? { time: '' } : {}),
            ...(name === 'petId' ? { clinicId: '', vetId: '' } : {})
        }));
    };

    const isPastTime = (slotTime) => {
        if (!formData.date) return false;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const localToday = `${year}-${month}-${day}`;

        if (formData.date !== localToday) return false;

        const [hours, minutes] = slotTime.split(':').map(Number);
        const slotDate = new Date(now);
        slotDate.setHours(hours, minutes, 0, 0);

        return slotDate < now;
    };

    const handleSlotSelect = (time) => {
        if (bookedSlots.includes(time) || isPastTime(time)) return;
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
                    <Box sx={{ textAlign: 'center', p: 10 }}>
                        <CircularProgress size={60} thickness={5} sx={{ color: '#4f46e5' }} />
                        <Typography variant="h6" sx={{ mt: 3, color: '#1e293b' }}>
                            Preparing the booking form...
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
                <ImageSide>
                    <AppointmentImage
                        src="https://images.pexels.com/photos/15005236/pexels-photo-15005236.jpeg"
                        alt="Happy pet"
                    />
                </ImageSide>

                <FormSide>
                    <FormHeader>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, letterSpacing: '-0.5px' }}>
                            Schedule Appointment
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748b' }}>
                            Complete the details below to secure your pet's session.
                        </Typography>
                    </FormHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="container-fluid p-0">
                            <div className="row g-4">
                                {/* ── Section 1: Core Details ── */}
                                <div className="col-12">
                                    <Typography variant="subtitle2" sx={{ color: '#4f46e5', fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                                        1. Patient & Provider
                                    </Typography>
                                </div>

                                <div className="col-12">
                                    <FormControl fullWidth required>
                                        <InputLabel id="pet-select-label">Select Your Pet</InputLabel>
                                        <StyledSelect
                                            name="petId"
                                            labelId="pet-select-label"
                                            label="Select Your Pet"
                                            value={formData.petId}
                                            onChange={handleChange}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (!selected) return <Box component="span" sx={{ color: 'text.secondary' }}>Choose a pet...</Box>;
                                                const pet = pets.find(p => p._id === selected);
                                                return pet ? pet.name : selected;
                                            }}
                                            startAdornment={<InputAdornment position="start"><PetsIcon sx={{ color: '#4f46e5', mr: 1 }} /></InputAdornment>}
                                        >
                                            <MenuItem value="" disabled><em>Choose a pet...</em></MenuItem>
                                            {pets.map(pet => (
                                                <MenuItem key={pet._id} value={pet._id}>{pet.name} ({pet.species})</MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>
                                </div>

                                <div className="col-md-6">
                                    <FormControl fullWidth required disabled={!formData.petId}>
                                        <InputLabel id="clinic-select-label">Clinic</InputLabel>
                                        <StyledSelect
                                            name="clinicId"
                                            labelId="clinic-select-label"
                                            label="Clinic"
                                            value={formData.clinicId}
                                            onChange={handleChange}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (!selected) return <Box component="span" sx={{ color: 'text.secondary' }}>{formData.petId ? 'Select Clinic...' : 'Select a pet first'}</Box>;
                                                const clinic = clinics.find(c => c._id === selected);
                                                return clinic ? clinic.name : selected;
                                            }}
                                            startAdornment={<InputAdornment position="start"><LocationOnIcon sx={{ color: '#4f46e5', mr: 1 }} /></InputAdornment>}
                                        >
                                            <MenuItem value="" disabled><em>Select Clinic...</em></MenuItem>
                                            {formData.petId && (() => {
                                                const selectedPet = pets.find(p => p._id === formData.petId);
                                                const petClinicId = selectedPet?.registeredClinicId?._id || selectedPet?.registeredClinicId;
                                                return clinics
                                                    .filter(clinic => clinic._id === petClinicId)
                                                    .map(clinic => (
                                                        <MenuItem key={clinic._id} value={clinic._id}>{clinic.name}</MenuItem>
                                                    ));
                                            })()}
                                        </StyledSelect>
                                    </FormControl>
                                </div>

                                <div className="col-md-6">
                                    <FormControl fullWidth required disabled={!formData.clinicId}>
                                        <InputLabel id="vet-select-label">Veterinarian</InputLabel>
                                        <StyledSelect
                                            name="vetId"
                                            labelId="vet-select-label"
                                            label="Veterinarian"
                                            value={formData.vetId}
                                            onChange={handleChange}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (!selected) return <Box component="span" sx={{ color: 'text.secondary' }}>Select Vet...</Box>;
                                                const vet = vets.find(v => v._id === selected);
                                                return vet ? `Dr. ${vet.firstName} ${vet.lastName}` : selected;
                                            }}
                                            startAdornment={<InputAdornment position="start"><PersonIcon sx={{ color: '#4f46e5', mr: 1 }} /></InputAdornment>}
                                        >
                                            <MenuItem value="" disabled><em>Select Vet...</em></MenuItem>
                                            {vets.map(vet => (
                                                <MenuItem key={vet._id} value={vet._id}>Dr. {vet.firstName} {vet.lastName}</MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>
                                </div>

                                {/* ── Section 2: Date & Time ── */}
                                <div className="col-12">
                                    <Divider sx={{ mb: 3, mt: 1 }} />
                                    <Typography variant="subtitle2" sx={{ color: '#4f46e5', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                                        2. Schedule
                                    </Typography>
                                </div>

                                <div className="col-12">
                                    <StyledTextField
                                        fullWidth
                                        label="Booking Date"
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{
                                            min: (() => {
                                                const now = new Date();
                                                return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                            })()
                                        }}
                                    />
                                </div>

                                {formData.vetId && formData.date && (
                                    <div className="col-12">
                                        <Typography variant="subtitle1" fontWeight="700" color="#1e293b" sx={{ mb: 2, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon fontSize="small" color="primary" /> Select Time Slot
                                        </Typography>
                                        {fetchingSlots ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                                                <CircularProgress size={16} />
                                                <Typography variant="body2" color="textSecondary">Checking slots...</Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5 }}>
                                                {timeSlots.map((time) => {
                                                    const isPast = isPastTime(time);
                                                    const isBooked = bookedSlots.includes(time);
                                                    return (
                                                        <TimeSlotButton
                                                            key={time}
                                                            variant="outlined"
                                                            isBooked={isBooked}
                                                            isPast={isPast}
                                                            isSelected={formData.time === time}
                                                            onClick={() => handleSlotSelect(time)}
                                                            disabled={isBooked || isPast}
                                                        >
                                                            {time}
                                                        </TimeSlotButton>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </div>
                                )}

                                {/* ── Section 3: Additional Info ── */}
                                <div className="col-12">
                                    <Divider sx={{ mb: 3, mt: 2 }} />
                                    <Typography variant="subtitle2" sx={{ color: '#4f46e5', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                                        3. Reason & Notes
                                    </Typography>
                                </div>

                                <div className="col-12">
                                    <StyledTextField
                                        fullWidth
                                        label="Reason for Visit"
                                        name="reason"
                                        multiline
                                        rows={2}
                                        value={formData.reason}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Annual checkup..."
                                    />
                                </div>

                                <div className="col-12">
                                    <StyledTextField
                                        fullWidth
                                        label="Additional Notes"
                                        name="notes"
                                        multiline
                                        rows={2}
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Any special instructions..."
                                    />
                                </div>

                                <div className="col-12">
                                    <SubmitButton
                                        fullWidth
                                        type="submit"
                                        disabled={loading || !formData.time}
                                    >
                                        {loading ? 'Confirming...' : 'Complete Booking'}
                                    </SubmitButton>
                                </div>
                            </div>
                        </div>
                    </form>
                </FormSide>
            </PageContainer>
        </>
    );
};

export default BookAppointment;
