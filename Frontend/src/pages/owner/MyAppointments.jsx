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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import socket, { connectSocket, disconnectSocket } from '../../services/socket';

const AppointmentsContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)',
  padding: '80px 24px 80px',
  [theme.breakpoints.up('md')]: {
    padding: '100px 40px 100px',
  },
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: '28px 40px',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(33, 150, 243, 0.3)',
  marginBottom: '28px',
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
  padding: '16px 12px',
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
  const [sortOption, setSortOption] = useState('dateAsc');

  const statusOptions = [
    { value: 'all', label: 'All', color: '#2196f3' },
    { value: 'upcoming', label: 'Upcoming', color: '#4CAF50' },
    { value: 'Booked', label: 'Pending', color: '#FF9800' },
    { value: 'Confirmed', label: 'Confirmed', color: '#4CAF50' },
    { value: 'Canceled', label: 'Canceled', color: '#f44336' },
    { value: 'Completed', label: 'Completed', color: '#9C27B0' },
  ];

  const fetchAppointments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/appointments/owner/my-appointments');
      setAppointments(response.data.appointments || []);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (showLoading) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Could not load appointments',
          icon: 'error',
          confirmButtonColor: '#2196f3',
        });
      }
      setAppointments([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const userId = user.id || user._id;
      if (userId) {
        connectSocket(userId);
        socket.on('appointmentStatusChanged', () => fetchAppointments(false));
        socket.on('newAppointment', () => fetchAppointments(false));
      }
    }

    fetchAppointments();

    return () => {
      socket.off('appointmentStatusChanged');
      socket.off('newAppointment');
      disconnectSocket();
    };
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') {
      const isUpcoming = new Date(appointment.dateTime) > new Date();
      return isUpcoming && appointment.status !== 'Canceled' && appointment.status !== 'Completed';
    }
    return appointment.status === filterStatus;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortOption === 'dateAsc') return new Date(a.dateTime) - new Date(b.dateTime);
    if (sortOption === 'dateDesc') return new Date(b.dateTime) - new Date(a.dateTime);
    if (sortOption === 'status') return a.status.localeCompare(b.status);
    return 0;
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

      fetchAppointments(false);
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
            Loading your appointments...
          </Typography>
        </Box>
      </AppointmentsContainer>
    );
  }

  return (
    <AppointmentsContainer>
      <Navbar />
      <HeaderCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <CalendarTodayIcon sx={{ fontSize: 64, mr: 2, opacity: 0.9 }} />
          <Box>
            <Typography variant="h3" fontWeight="bold">My Appointments</Typography>
            <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>Manage your pet's visits</Typography>
          </Box>
        </Box>
        <Grid container spacing={2} justifyContent="center">
          {Object.entries(stats).map(([key, value]) => (
            <Grid item xs={6} sm={4} md={2} key={key}>
              <StatCard>
                <Typography variant="h4" fontWeight="bold" color="primary">{value}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {key}
                </Typography>
              </StatCard>
            </Grid>
          ))}
        </Grid>
      </HeaderCard>

      <Paper sx={{ p: 3, mb: 4, borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterListIcon color="primary" />
          {statusOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => setFilterStatus(option.value)}
              color={filterStatus === option.value ? 'primary' : 'default'}
              variant={filterStatus === option.value ? 'filled' : 'outlined'}
            />
          ))}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortOption} label="Sort By" onChange={(e) => setSortOption(e.target.value)}>
              <MenuItem value="dateAsc">Date (Earliest)</MenuItem>
              <MenuItem value="dateDesc">Date (Latest)</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => fetchAppointments()}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/owner/appointment')}>Book New</Button>
        </Box>
      </Paper>

      {sortedAppointments.length === 0 ? (
        <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '24px' }}>
          <Typography variant="h5" color="text.secondary">No appointments found</Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/owner/appointment')}>Book Now</Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sortedAppointments.map((app) => {
            const formatted = formatDateTime(app.dateTime);
            return (
              <Grid item xs={12} sm={6} lg={4} key={app._id}>
                <AppointmentCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="700">{app.reason}</Typography>
                      <StatusChip status={app.status} label={app.status} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={app.petId?.photo}><PetsIcon /></Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">{app.petId?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{app.petId?.species}</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <DetailRow><CalendarTodayIcon fontSize="small" /><Typography variant="body2">{formatted.date}</Typography></DetailRow>
                    <DetailRow><AccessTimeIcon fontSize="small" /><Typography variant="body2">{formatted.time}</Typography></DetailRow>
                    <DetailRow><PersonIcon fontSize="small" /><Typography variant="body2">Dr. {app.vetId?.firstName} {app.vetId?.lastName}</Typography></DetailRow>
                    <DetailRow><LocationOnIcon fontSize="small" /><Typography variant="body2">{app.clinicId?.name}</Typography></DetailRow>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button fullWidth variant="outlined" onClick={() => setViewDialog({ open: true, appointment: app })}>Details</Button>
                      {app.status === 'Booked' && formatted.isUpcoming && (
                        <Button fullWidth variant="contained" color="error" onClick={() => setCancelDialog({ open: true, appointment: app, reason: '' })}>Cancel</Button>
                      )}
                    </Box>
                  </CardContent>
                </AppointmentCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialogs */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, appointment: null, reason: '' })} fullWidth maxWidth="sm">
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Reason" sx={{ mt: 2 }} value={cancelDialog.reason} onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, appointment: null, reason: '' })}>Exit</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Confirm Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, appointment: null })} fullWidth maxWidth="md">
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {viewDialog.appointment && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6">Reason: {viewDialog.appointment.reason}</Typography>
              <Typography>Pet: {viewDialog.appointment.petId?.name}</Typography>
              <Typography>Vet: Dr. {viewDialog.appointment.vetId?.firstName} {viewDialog.appointment.vetId?.lastName}</Typography>
              <Typography>Clinic: {viewDialog.appointment.clinicId?.name}</Typography>
              <Typography>Address: {viewDialog.appointment.clinicId?.address}</Typography>
              {viewDialog.appointment.notes && <Typography sx={{ mt: 2 }}>Notes: {viewDialog.appointment.notes}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewDialog({ open: false, appointment: null })}>Close</Button></DialogActions>
      </Dialog>
    </AppointmentsContainer>
  );
};

export default MyAppointments;