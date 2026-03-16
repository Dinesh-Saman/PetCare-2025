// src/components/owner/RescheduleAppointmentModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
    Box, Typography, TextField, Button, Dialog, DialogContent,
    InputAdornment, CircularProgress, alpha, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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

const RescheduleAppointmentModal = ({ open, onClose, onSuccess, appointment }) => {
    const [formData, setFormData] = useState({
        date: '',
        time: ''
    });

    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00'
    ];

    useEffect(() => {
        if (open && appointment) {
            // Pre-fill if needed, but usually we want them to pick a NEW date/time
            setFormData({
                date: '',
                time: ''
            });
        }
    }, [open, appointment]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!appointment?.vetId?._id && !appointment?.vetId) return;
            if (!formData.date) {
                setBookedSlots([]);
                return;
            }

            const vetId = appointment.vetId._id || appointment.vetId;

            try {
                setFetchingSlots(true);
                const response = await api.get(`/appointments/vet/${vetId}?date=${formData.date}`);
                const appointments = response.data.appointments || [];

                const bookedTimes = appointments
                    .filter(app => app.status !== 'Canceled' && app._id !== appointment._id)
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
    }, [appointment, formData.date]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'date' ? { time: '' } : {})
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

        if (!formData.date || !formData.time) {
            Swal.fire('Error', 'Please select a new date and time', 'warning');
            return;
        }

        const dateTime = `${formData.date}T${formData.time}:00`;

        setLoading(true);
        try {
            await api.patch(`/appointments/${appointment._id}/reschedule`, {
                dateTime
            });

            Swal.fire({
                title: 'Rescheduled!',
                text: 'Your appointment has been successfully rescheduled.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Could not reschedule appointment', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!appointment) return null;

    return (
        <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 2, pt: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                    Reschedule Appointment
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent sx={{ pt: 1 }}>
                <Box sx={{ mb: 3, p: 2, bgcolor: alpha('#4f46e5', 0.05), borderRadius: 4, border: '1px solid', borderColor: alpha('#4f46e5', 0.1) }}>
                    <Typography variant="subtitle2" sx={{ color: '#4f46e5', fontWeight: 700, mb: 1 }}>
                        CURRENT APPOINTMENT
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                        <strong>Pet:</strong> {appointment.petId?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                        <strong>Doctor:</strong> Dr. {appointment.vetId?.firstName} {appointment.vetId?.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                        <strong>Current Time:</strong> {new Date(appointment.dateTime).toLocaleString()}
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <StyledTextField
                            fullWidth
                            label="New Date"
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
                        />

                        {formData.date && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon fontSize="small" /> Select New Available Time
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

                        <SubmitButton
                            fullWidth
                            type="submit"
                            disabled={loading || !formData.time}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Confirm New Schedule'}
                        </SubmitButton>
                        
                        <Button 
                            fullWidth 
                            variant="text" 
                            onClick={onClose}
                            sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}
                        >
                            Nevermind, keep my original slot
                        </Button>
                    </Box>
                </form>
            </DialogContent>
        </StyledDialog>
    );
};

export default RescheduleAppointmentModal;
