// src/pages/owner/MyAppointments.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DoneIcon from '@mui/icons-material/Done';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';

import Navbar from '../../components/Navbar';

const AppointmentsContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)',
  padding: '30px 24px 60px', // ← reduced top padding (was 80px)
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: '28px 40px', // Reduced from '32px 40px'
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(33, 150, 243, 0.3)',
  marginBottom: '28px', // Reduced from '32px'
  textAlign: 'center',
}));

const AppointmentCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 24px 60px rgba(33, 150, 243, 0.15)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: '600',
  fontSize: '0.85rem',
  padding: '6px 16px',
  borderRadius: '20px',
  background:
    status === 'Booked' ? 'linear-gradient(135deg, #2196f3, #64b5f6)' :
    status === 'Confirmed' ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' :
    status === 'Canceled' ? 'linear-gradient(135deg, #f44336, #e57373)' :
    status === 'Completed' ? 'linear-gradient(135deg, #9C27B0, #BA68C8)' :
    'linear-gradient(135deg, #FF9800, #FFB74D)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: '16px 12px', // Reduced from '20px 16px'
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 16px 48px rgba(33, 150, 243, 0.1)',
  },
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: '600',
  padding: '10px 24px',
  background: color === 'cancel' ? 'linear-gradient(135deg, #f44336, #e57373)' :
             color === 'confirm' ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' :
             'linear-gradient(135deg, #2196f3, #64b5f6)',
  color: 'white',
  '&:hover': {
    background: color === 'cancel' ? 'linear-gradient(135deg, #d32f2f, #e53935)' :
               color === 'confirm' ? 'linear-gradient(135deg, #388E3C, #43A047)' :
               'linear-gradient(135deg, #1976d2, #42a5f5)',
    transform: 'translateY(-2px)',
  },
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 0',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    pending: 0,
    confirmed: 0,
    canceled: 0,
    completed: 0,
  });
  const [cancelDialog, setCancelDialog] = useState({ open: false, appointment: null, reason: '' });
  const [viewDialog, setViewDialog] = useState({ open: false, appointment: null });
  const [filterStatus, setFilterStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Appointments', color: '#2196f3' },
    { value: 'upcoming', label: 'Upcoming', color: '#4CAF50' },
    { value: 'Booked', label: 'Pending', color: '#FF9800' },
    { value: 'Confirmed', label: 'Confirmed', color: '#4CAF50' },
    { value: 'Canceled', label: 'Canceled', color: '#f44336' },
    { value: 'Completed', label: 'Completed', color: '#9C27B0' },
  ];

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments/owner/my-appointments');
      setAppointments(response.data.appointments || []);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Could not load appointments',
        icon: 'error',
        confirmButtonColor: '#2196f3',
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') {
      const isUpcoming = new Date(appointment.dateTime) > new Date();
      return isUpcoming && appointment.status !== 'Canceled' && appointment.status !== 'Completed';
    }
    return appointment.status === filterStatus;
  });

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return {
      date: date.toLocaleDateString('en-US', options),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      isUpcoming: date > new Date(),
      isPast: date < new Date(),
    };
  };

  const handleCancel = async () => {
    if (!cancelDialog.appointment || !cancelDialog.reason.trim()) {
      Swal.fire('Error', 'Please provide a cancellation reason', 'warning');
      return;
    }

    try {
      await api.patch(`/appointments/${cancelDialog.appointment._id}/cancel`, {
        reason: cancelDialog.reason,
      });

      Swal.fire({
        title: 'Cancelled!',
        text: 'Appointment has been cancelled successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      fetchAppointments();
      setCancelDialog({ open: false, appointment: null, reason: '' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Could not cancel appointment',
        icon: 'error',
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Booked': return <PendingIcon />;
      case 'Confirmed': return <CheckCircleIcon />;
      case 'Canceled': return <CancelIcon />;
      case 'Completed': return <DoneIcon />;
      default: return <InfoIcon />;
    }
  };

  if (loading) {
    return (
      <AppointmentsContainer>
        <Navbar />
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <CircularProgress size={64} thickness={5} sx={{ color: '#2196f3' }} />
          <Typography variant="h6" sx={{ mt: 4, color: '#555' }}>
            Loading your pet appointments...
          </Typography>
        </Box>
      </AppointmentsContainer>
    );
  }

  return (
    <AppointmentsContainer>
      <Navbar />

      {/* Header Section */}
      <HeaderCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <CalendarTodayIcon sx={{ fontSize: 64, mr: 2, opacity: 0.9 }} />
          <Box>
            <Typography variant="h3" fontWeight="bold">
              My Appointments
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
              Manage your pet's veterinary visits
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} justifyContent="space-between">  {/* Changed from spacing={3} to spacing={2} */}
          {Object.entries(stats).map(([key, value]) => (
            <Grid item xs={6} sm={4} md={12 / 5} key={key}>
              <StatCard>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    color:
                      key === 'upcoming' ? '#4CAF50' :
                      key === 'pending' ? '#FF9800' :
                      key === 'confirmed' ? '#4CAF50' :
                      key === 'canceled' ? '#f44336' :
                      key === 'completed' ? '#9C27B0' :
                      '#2196f3',
                  }}
                >
                  {value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </Typography>
              </StatCard>
            </Grid>
          ))}
        </Grid>
      </HeaderCard>

      {/* Filter & Actions Bar */}
      <Paper
        sx={{
          p: 3,
          mb: 4,          // ← reduced from 5
          borderRadius: '20px',
          background: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterListIcon color="primary" />
          <Typography variant="h6" fontWeight="600">Filter by status:</Typography>

          {statusOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => setFilterStatus(option.value)}
              color={filterStatus === option.value ? 'primary' : 'default'}
              variant={filterStatus === option.value ? 'filled' : 'outlined'}
              sx={{ fontWeight: '600', px: 2 }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAppointments}
            sx={{ borderRadius: '12px' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/owner/appointment')}
            sx={{
              background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              },
            }}
          >
            Book New Appointment
          </Button>
        </Box>
      </Paper>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Paper
          sx={{
            p: 10,
            textAlign: 'center',
            borderRadius: '24px',
            background: 'white',
            boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
          }}
        >
          <Box
            sx={{
              width: 140,
              height: 140,
              margin: '0 auto 32px',
              background: 'linear-gradient(135deg, rgba(33,150,243,0.08), rgba(33,203,243,0.08))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 68, color: '#2196f3', opacity: 0.5 }} />
          </Box>
          <Typography variant="h5" fontWeight="700" color="text.secondary" gutterBottom>
            No appointments found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 480, mx: 'auto' }}>
            {filterStatus === 'all'
              ? "You haven't booked any pet appointments yet."
              : `No ${filterStatus.toLowerCase()} appointments match your filter.`}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/owner/appointment')}
            sx={{
              background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
              py: 1.5,
              px: 5,
              fontSize: '1.1rem',
              borderRadius: '50px',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              },
            }}
          >
            Book Your First Appointment
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>  {/* ← reduced from spacing={4} */}
          {filteredAppointments.map((appointment) => {
            const formatted = formatDateTime(appointment.dateTime);

            return (
              <Grid item xs={12} sm={6} lg={4} key={appointment._id}>
                <AppointmentCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="700" gutterBottom>
                          {appointment.reason}
                        </Typography>
                        <StatusChip
                          status={appointment.status}
                          icon={getStatusIcon(appointment.status)}
                          label={appointment.status}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setViewDialog({ open: true, appointment })}
                        sx={{ color: '#2196f3' }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        PET
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
                          }}
                        >
                          <PetsIcon fontSize="large" />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="600">
                            {appointment.petId?.name || 'Unknown Pet'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.petId?.species || '—'} • {appointment.petId?.breed || 'Unknown breed'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} /> {/* slightly reduced */}

                    <Box>
                      <DetailRow>
                        <CalendarTodayIcon sx={{ color: '#2196f3', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date</Typography>
                          <Typography variant="body2" fontWeight="500">{formatted.date}</Typography>
                        </Box>
                      </DetailRow>

                      <DetailRow>
                        <AccessTimeIcon sx={{ color: '#4CAF50', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Time</Typography>
                          <Typography variant="body2" fontWeight="500">{formatted.time}</Typography>
                        </Box>
                      </DetailRow>

                      <DetailRow>
                        <PersonIcon sx={{ color: '#9C27B0', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Veterinarian</Typography>
                          <Typography variant="body2" fontWeight="500">
                            Dr. {appointment.vetId?.firstName} {appointment.vetId?.lastName}
                          </Typography>
                        </Box>
                      </DetailRow>

                      <DetailRow>
                        <LocationOnIcon sx={{ color: '#FF9800', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Clinic</Typography>
                          <Typography variant="body2" fontWeight="500">
                            {appointment.clinicId?.name || '—'}
                          </Typography>
                        </Box>
                      </DetailRow>
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}> {/* reduced mt from 4 */}
                      {appointment.status === 'Booked' && formatted.isUpcoming && (
                        <>
                          <ActionButton
                            color="cancel"
                            fullWidth
                            startIcon={<CancelIcon />}
                            onClick={() => setCancelDialog({ open: true, appointment, reason: '' })}
                          >
                            Cancel
                          </ActionButton>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setViewDialog({ open: true, appointment })}
                            sx={{ borderRadius: '12px' }}
                          >
                            View Details
                          </Button>
                        </>
                      )}

                      {(appointment.status === 'Confirmed' || appointment.status === 'Completed') && (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => setViewDialog({ open: true, appointment })}
                          sx={{ borderRadius: '12px' }}
                        >
                          View Details
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </AppointmentCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, appointment: null, reason: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #f44336, #e57373)',
            color: 'white',
            textAlign: 'center',
            py: 3,
          }}
        >
          Cancel Appointment
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel this appointment?
          </Typography>

          {cancelDialog.appointment && (
            <Paper
              elevation={0}
              sx={{ p: 2, mt: 2, mb: 3, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}
            >
              <Typography variant="body2">
                <strong>Pet:</strong> {cancelDialog.appointment.petId?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {formatDateTime(cancelDialog.appointment.dateTime).date}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {formatDateTime(cancelDialog.appointment.dateTime).time}
              </Typography>
              <Typography variant="body2">
                <strong>Reason:</strong> {cancelDialog.appointment.reason}
              </Typography>
            </Paper>
          )}

          <TextField
            fullWidth
            label="Cancellation Reason (required)"
            multiline
            rows={3}
            value={cancelDialog.reason}
            onChange={(e) => setCancelDialog((prev) => ({ ...prev, reason: e.target.value }))}
            placeholder="Please tell us why you're cancelling..."
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setCancelDialog({ open: false, appointment: null, reason: '' })}
            color="inherit"
          >
            Keep Appointment
          </Button>
          <ActionButton
            color="cancel"
            onClick={handleCancel}
            disabled={!cancelDialog.reason.trim()}
          >
            Confirm Cancellation
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, appointment: null })}
        maxWidth="md"
        fullWidth
      >
        {viewDialog.appointment && (
          <>
            <DialogTitle
              sx={{
                background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
                color: 'white',
                textAlign: 'center',
                py: 3,
              }}
            >
              Appointment Details
            </DialogTitle>
            <DialogContent sx={{ pt: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom color="primary">
                    Pet Information
                  </Typography>
                  <DetailRow>
                    <PetsIcon sx={{ color: '#2196f3', fontSize: 28 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight="600">
                        {viewDialog.appointment.petId?.name || 'Unknown'}
                      </Typography>
                    </Box>
                  </DetailRow>
                  <DetailRow>
                    <MedicalServicesIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Species & Breed</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {viewDialog.appointment.petId?.species || '—'} •{' '}
                        {viewDialog.appointment.petId?.breed || 'Unknown'}
                      </Typography>
                    </Box>
                  </DetailRow>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom color="primary">
                    Appointment Info
                  </Typography>
                  <DetailRow>
                    <CalendarTodayIcon sx={{ color: '#2196f3', fontSize: 28 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDateTime(viewDialog.appointment.dateTime).date} at{' '}
                        {formatDateTime(viewDialog.appointment.dateTime).time}
                      </Typography>
                    </Box>
                  </DetailRow>
                  <DetailRow>
                    <PersonIcon sx={{ color: '#9C27B0', fontSize: 28 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Veterinarian</Typography>
                      <Typography variant="body1" fontWeight="500">
                        Dr. {viewDialog.appointment.vetId?.firstName} {viewDialog.appointment.vetId?.lastName}
                        {viewDialog.appointment.vetId?.specialization && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' '}({viewDialog.appointment.vetId.specialization})
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </DetailRow>
                  <DetailRow>
                    <LocationOnIcon sx={{ color: '#FF9800', fontSize: 28 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Clinic</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {viewDialog.appointment.clinicId?.name || '—'}
                      </Typography>
                      {viewDialog.appointment.clinicId?.address && (
                        <Typography variant="body2" color="text.secondary">
                          {viewDialog.appointment.clinicId.address}
                        </Typography>
                      )}
                    </Box>
                  </DetailRow>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom color="primary" sx={{ mt: 2 }}>
                    Visit Purpose
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: 'rgba(33,150,243,0.04)',
                      borderRadius: '16px',
                      border: '1px solid rgba(33,150,243,0.12)',
                    }}
                  >
                    <Typography variant="body1" fontWeight={500} gutterBottom>
                      {viewDialog.appointment.reason}
                    </Typography>
                    {viewDialog.appointment.notes && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                          Additional Notes:
                        </Typography>
                        <Typography variant="body1">
                          {viewDialog.appointment.notes}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setViewDialog({ open: false, appointment: null })}
                color="inherit"
              >
                Close
              </Button>
              {viewDialog.appointment.status === 'Booked' &&
                formatDateTime(viewDialog.appointment.dateTime).isUpcoming && (
                  <ActionButton
                    color="cancel"
                    onClick={() => {
                      setViewDialog({ open: false, appointment: null });
                      setCancelDialog({
                        open: true,
                        appointment: viewDialog.appointment,
                        reason: '',
                      });
                    }}
                  >
                    Cancel Appointment
                  </ActionButton>
                )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </AppointmentsContainer>
  );
};

export default MyAppointments;