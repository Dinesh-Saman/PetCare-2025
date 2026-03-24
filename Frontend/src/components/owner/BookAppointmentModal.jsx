// src/components/owner/BookAppointmentModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
    Box, Typography, TextField, Button, Dialog, DialogContent,
    FormControl, InputLabel, Select, MenuItem, InputAdornment,
    CircularProgress, Divider, alpha, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: '32px',
        padding: '16px',
        boxShadow: '0 25px 70px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
    },
}));

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: 16,
        '& fieldset': { borderColor: '#e2e8f0', transition: 'all 0.2s ease' },
        '&:hover fieldset': { borderColor: '#4f46e5' },
        '&.Mui-focused fieldset': { borderColor: '#4f46e5', borderWidth: '2px' },
    },
});

const StyledSelect = styled(Select)(({ theme }) => ({
    height: '60px',
    borderRadius: 16,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5', borderWidth: '2px' },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white',
    padding: '16px',
    borderRadius: 18,
    fontWeight: '800',
    fontSize: '1rem',
    textTransform: 'none',
    marginTop: 10,
    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 25px rgba(79, 70, 229, 0.35)',
    },
    '&:disabled': {
        background: '#e2e8f0',
        color: '#94a3b8'
    }
}));

const TimeSlotButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isBooked' && prop !== 'isPast',
})(({ theme, isSelected, isBooked, isPast }) => ({
    padding: '10px',
    borderRadius: '12px',
    border: '1.5px solid',
    borderColor: (isBooked || isPast) ? '#f1f5f9' : isSelected ? '#4f46e5' : '#e2e8f0',
    backgroundColor: (isBooked || isPast) ? '#f8fafc' : isSelected ? alpha('#4f46e5', 0.1) : 'white',
    color: (isBooked || isPast) ? '#cbd5e1' : isSelected ? '#4f46e5' : '#475569',
    fontWeight: '700',
    textTransform: 'none',
    cursor: (isBooked || isPast) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: (isBooked || isPast) ? '#f1f5f9' : '#4f46e5',
        backgroundColor: (isBooked || isPast) ? '#f8fafc' : alpha('#4f46e5', 0.05),
    },
    '&.Mui-disabled': {
        borderColor: (isBooked || isPast) ? '#f1f5f9' : '#e2e8f0',
        backgroundColor: (isBooked || isPast) ? '#f8fafc' : '#f8fafc',
        color: (isBooked || isPast) ? '#cbd5e1' : '#cbd5e1',
    }
}));

const BookAppointmentModal = ({ open, onClose, onSuccess }) => {
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
    const [fetchingData, setFetchingData] = useState(false);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00'
    ];

    useEffect(() => {
        if (open) {
            fetchInitialData();
        } else {
            // Reset form on close
            setFormData({
                petId: '',
                clinicId: '',
                vetId: '',
                date: '',
                time: '',
                reason: '',
                notes: ''
            });
        }
    }, [open]);

    const fetchInitialData = async () => {
        const userData = localStorage.getItem('owner_user') || localStorage.getItem('user');
        if (!userData) return;

        try {
            setFetchingData(true);
            const user = JSON.parse(userData);
            const userId = user.id || user._id;

            const [petsRes, clinicsRes, vetsRes] = await Promise.all([
                api.get(`/pets/owner/${userId}`),
                api.get('/clinics'),
                api.get('/vets/all-vets')
            ]);

            setPets(petsRes.data.pets || []);
            setClinics(clinicsRes.data.clinics || clinicsRes.data || []);
            setVets(vetsRes.data.vets || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setFetchingData(false);
        }
    };



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
            ...(name === 'petId' ? { clinicId: '', vetId: '' } : {}),
            ...(name === 'clinicId' ? { vetId: '' } : {})
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
            Swal.fire('Error', 'Please fill all required fields', 'warning');
            return;
        }

        const dateTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();

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
                title: 'Success!',
                text: 'Appointment booked successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Could not book appointment', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 2, pt: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                    Book New Appointment
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent sx={{ pt: 1 }}>
                {fetchingData ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                        <CircularProgress size={40} sx={{ color: '#4f46e5' }} />
                        <Typography sx={{ mt: 2, color: '#64748b' }}>Loading details...</Typography>
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                {pets.filter(p => p.registrationStatus === 'Approved').length > 0 ? (
                                    <FormControl fullWidth required>
                                        <InputLabel shrink>Select Your Pet</InputLabel>
                                        <StyledSelect
                                            name="petId"
                                            label="Select Your Pet"
                                            value={formData.petId}
                                            onChange={handleChange}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                if (!selected) return <Typography sx={{ color: '#94a3b8' }}>Choose a pet...</Typography>;
                                                const pet = pets.find(p => p._id === selected);
                                                return pet ? `${pet.name} (${pet.species})` : selected;
                                            }}
                                            startAdornment={<InputAdornment position="start"><PetsIcon sx={{ color: '#4f46e5', mr: 1 }} /></InputAdornment>}
                                        >
                                            <MenuItem value="" disabled><em>Choose a pet...</em></MenuItem>
                                            {pets
                                                .filter(pet => pet.registrationStatus === 'Approved')
                                                .map(pet => (
                                                    <MenuItem key={pet._id} value={pet._id}>{pet.name} ({pet.species})</MenuItem>
                                                ))}
                                        </StyledSelect>
                                    </FormControl>
                                ) : (
                                    <Box sx={{ gridColumn: '1 / -1', p: 3, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 4, border: '1px dashed #f59e0b', textAlign: 'center' }}>
                                        <Typography sx={{ color: '#d97706', fontWeight: 600 }}>
                                            No approved pets found. You can only book appointments for pets that have been approved by a clinic.
                                        </Typography>
                                    </Box>
                                )}

                                <FormControl fullWidth required disabled={!formData.petId}>
                                    <InputLabel shrink>Clinic</InputLabel>
                                    <StyledSelect
                                        name="clinicId"
                                        label="Clinic"
                                        value={formData.clinicId}
                                        onChange={handleChange}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) return <Typography sx={{ color: '#94a3b8' }}>{formData.petId ? 'Select Clinic...' : 'Select a pet first'}</Typography>;
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

                                <FormControl fullWidth required disabled={!formData.clinicId}>
                                    <InputLabel shrink>Veterinarian</InputLabel>
                                    <StyledSelect
                                        name="vetId"
                                        label="Veterinarian"
                                        value={formData.vetId}
                                        onChange={handleChange}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) return <Typography sx={{ color: '#94a3b8' }}>{formData.clinicId ? 'Select Veterinarian...' : 'Select a clinic first'}</Typography>;
                                            const vet = vets.find(v => v._id === selected);
                                            return vet ? `Dr. ${vet.firstName} ${vet.lastName}` : selected;
                                        }}
                                        startAdornment={<InputAdornment position="start"><PersonIcon sx={{ color: '#4f46e5', mr: 1 }} /></InputAdornment>}
                                    >
                                        <MenuItem value="" disabled><em>Select Veterinarian...</em></MenuItem>
                                        {vets
                                            .filter(vet => {
                                                if (!formData.clinicId) return false;
                                                const owned = vet.ownedClinics?.map(c => c._id || c).map(String) || [];
                                                const assigned = vet.assignedClinics?.map(c => c._id || c).map(String) || [];
                                                const active = String(vet.currentActiveClinicId?._id || vet.currentActiveClinicId || '');
                                                const legacy = String(vet.clinicId?._id || vet.clinicId || '');
                                                const cid = String(formData.clinicId);
                                                return owned.includes(cid) || assigned.includes(cid) || active === cid || legacy === cid;
                                            })
                                            .map(vet => (
                                                <MenuItem key={vet._id} value={vet._id}>Dr. {vet.firstName} {vet.lastName}</MenuItem>
                                            ))}
                                    </StyledSelect>
                                </FormControl>

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
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <CalendarTodayIcon
                                                    sx={{ color: '#4f46e5', cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.closest('.MuiInputBase-root').querySelector('input');
                                                        if (input.showPicker) input.showPicker();
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        position: 'relative',
                                        '& input::-webkit-calendar-picker-indicator': {
                                            position: 'absolute',
                                            right: 12,
                                            width: '32px',
                                            height: '100%',
                                            cursor: 'pointer',
                                            opacity: 0,
                                            zIndex: 2,
                                        },
                                        '& input::-webkit-inner-spin-button': {
                                            display: 'none',
                                        },
                                        '& .MuiInputAdornment-root': {
                                            zIndex: 1,
                                        }
                                    }}
                                />
                            </Box>

                            {formData.vetId && formData.date && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTimeIcon fontSize="small" /> Select Available Time
                                    </Typography>
                                    {fetchingSlots ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                                            <CircularProgress size={16} />
                                            <Typography variant="caption">Checking slots...</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 1 }}>
                                            {timeSlots.map((time) => {
                                                const isPast = isPastTime(time);
                                                const isBooked = bookedSlots.includes(time);
                                                return (
                                                    <TimeSlotButton
                                                        key={time}
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
                                </Box>
                            )}



                            <StyledTextField
                                fullWidth
                                label="Reason for Visit"
                                name="reason"
                                multiline
                                rows={2}
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                placeholder="What's the visit about?"
                            />

                            <StyledTextField
                                fullWidth
                                label="Additional Notes (Optional)"
                                name="notes"
                                multiline
                                rows={2}
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any special instructions for the doctor..."
                            />

                            <SubmitButton
                                fullWidth
                                type="submit"
                                disabled={loading || !formData.time}
                            >
                                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Confirm Appointment Reservation'}
                            </SubmitButton>
                        </Box>
                    </form>
                )}
            </DialogContent>
        </StyledDialog>
    );
};

export default BookAppointmentModal;
