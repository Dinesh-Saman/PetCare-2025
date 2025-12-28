import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader, Button, Chip,
  IconButton, Collapse, TextField, MenuItem, FormControl, InputLabel,
  Select, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Paper // ← Added missing import
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PetsIcon from '@mui/icons-material/Pets';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import Header from '../../components/layout/Header';

const AppointmentsContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  padding: '40px 20px',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
  marginTop: '70px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  color: '#1565c0',
  textAlign: 'center',
  marginBottom: 40,
  fontSize: '2.6rem',
}));

const AppointmentCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
  marginBottom: 24,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 16px 50px rgba(0,0,0,0.15)',
  },
}));

const CardHeaderStyled = styled(Box)(({ theme, status }) => ({
  padding: 24,
  borderRadius: '20px 20px 0 0',
  color: 'white',
  background:
    status === 'Confirmed' ? 'linear-gradient(90deg, #4caf50, #66bb6a)' :
    status === 'Booked' ? 'linear-gradient(90deg, #2196f3, #21cbf3)' :
    status === 'Canceled' ? 'linear-gradient(90deg, #f44336, #ef5350)' :
    'linear-gradient(90deg, #9e9e9e, #bdbdbd)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const BookButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: '16px 40px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.2rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
  '&:hover': {
    background: 'linear-gradient(90deg, #1976d2, #00bcd4)',
    transform: 'translateY(-3px)',
  },
}));

const OwnerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [petFilter, setPetFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [expandedId, setExpandedId] = useState(null);
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [bookForm, setBookForm] = useState({
    petId: '',
    clinicId: '',
    vetId: '',
    dateTime: '',
    reason: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch owner's pets
        const petsRes = await api.get('/pets/my');
        setPets(petsRes.data.pets || []);

        // Fetch owner's appointments (you'll need this endpoint)
        const apptsRes = await api.get('/appointments/owner'); // ← Create this backend route
        const appts = apptsRes.data.appointments || apptsRes.data || [];
        setAppointments(appts);
        setFilteredAppointments(appts);
      } catch (error) {
        console.error('Error loading data:', error);
        Swal.fire('Error', 'Could not load appointments or pets', 'error');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = appointments;

    if (petFilter !== 'all') {
      filtered = filtered.filter(a => a.petId?._id === petFilter);
    }

    const now = new Date();
    if (statusFilter === 'upcoming') {
      filtered = filtered.filter(a => new Date(a.dateTime) > now && a.status !== 'Canceled');
    } else if (statusFilter === 'past') {
      filtered = filtered.filter(a => new Date(a.dateTime) <= now || a.status === 'Completed');
    } else if (statusFilter === 'canceled') {
      filtered = filtered.filter(a => a.status === 'Canceled');
    }

    setFilteredAppointments(filtered.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)));
  }, [appointments, petFilter, statusFilter]);

  const handleCancel = async (apptId) => {
    const result = await Swal.fire({
      title: 'Cancel Appointment?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, cancel it'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/appointments/${apptId}/cancel`, { reason: 'Canceled by owner' });
        setAppointments(prev => prev.map(a => 
          a._id === apptId ? { ...a, status: 'Canceled' } : a
        ));
        Swal.fire('Canceled!', 'Appointment has been canceled', 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Could not cancel', 'error');
      }
    }
  };

  const handleBookAppointment = async () => {
    if (!bookForm.petId || !bookForm.clinicId || !bookForm.vetId || !bookForm.dateTime || !bookForm.reason) {
      Swal.fire('Error', 'Please fill all required fields', 'warning');
      return;
    }

    try {
      const response = await api.post('/appointments/book', {
        petId: bookForm.petId,
        clinicId: bookForm.clinicId,
        vetId: bookForm.vetId,
        dateTime: bookForm.dateTime,
        reason: bookForm.reason,
        notes: bookForm.notes
      });

      Swal.fire('Booked!', 'Your appointment has been requested', 'success');
      setOpenBookDialog(false);
      
      // Add new appointment to list
      setAppointments(prev => [response.data.appointment, ...prev]);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Could not book appointment', 'error');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Header />
      <AppointmentsContainer>
        <ContentArea>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <SectionTitle variant="h4">
              My Appointments
            </SectionTitle>
            <BookButton
              startIcon={<AddIcon />}
              onClick={() => setOpenBookDialog(true)}
            >
              Book New Appointment
            </BookButton>
          </Box>

          {/* Filters */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Pet</InputLabel>
                <Select value={petFilter} onChange={(e) => setPetFilter(e.target.value)}>
                  <MenuItem value="all">All Pets</MenuItem>
                  {pets.map(pet => (
                    <MenuItem key={pet._id} value={pet._id}>{pet.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="past">Past</MenuItem>
                  <MenuItem value="canceled">Canceled</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {filteredAppointments.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 20 }}>
              <EventAvailableIcon sx={{ fontSize: 100, color: '#ccc', mb: 3 }} />
              <Typography variant="h5" color="textSecondary" gutterBottom>
                No appointments
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {statusFilter === 'upcoming' ? 'You have no upcoming appointments' : 'No appointments found'}
              </Typography>
            </Paper>
          ) : (
            filteredAppointments.map((appt) => (
              <AppointmentCard key={appt._id}>
                <CardHeaderStyled status={appt.status}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {appt.petId?.name || 'My Pet'}
                    </Typography>
                    <Chip label={appt.status} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarTodayIcon />
                    <Typography variant="body1">
                      {formatDateTime(appt.dateTime)}
                    </Typography>
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => setExpandedId(expandedId === appt._id ? null : appt._id)}
                    >
                      <ExpandMoreIcon sx={{ transform: expandedId === appt._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                    </IconButton>
                  </Box>
                </CardHeaderStyled>

                <Collapse in={expandedId === appt._id} timeout="auto" unmountOnExit>
                  <CardContent sx={{ pt: 4 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <PetsIcon sx={{ color: '#2196f3' }} />
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary">Pet</Typography>
                            <Typography variant="h6">{appt.petId?.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {appt.petId?.species} • {appt.petId?.breed || 'Mixed'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <PersonIcon sx={{ color: '#2196f3' }} />
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary">Veterinarian</Typography>
                            <Typography variant="h6">
                              Dr. {appt.vetId?.firstName} {appt.vetId?.lastName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {appt.vetId?.specialization || 'General Practice'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <LocationOnIcon sx={{ color: '#2196f3' }} />
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary">Clinic</Typography>
                            <Typography variant="h6">{appt.clinicId?.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {appt.clinicId?.address}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                          <Typography variant="body1">{appt.reason || 'Routine check-up'}</Typography>
                        </Box>

                        {appt.notes && (
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                            <Typography variant="body1">{appt.notes}</Typography>
                          </Box>
                        )}
                      </Grid>

                      {appt.status === 'Booked' && new Date(appt.dateTime) > new Date() && (
                        <Grid item xs={12} textAlign="right">
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancel(appt._id)}
                          >
                            Cancel Appointment
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Collapse>
              </AppointmentCard>
            ))
          )}
        </ContentArea>
      </AppointmentsContainer>

      {/* Book Appointment Dialog */}
      <Dialog open={openBookDialog} onClose={() => setOpenBookDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #2196f3, #21cbf3)', color: 'white', py: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Book New Appointment
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Select Pet</InputLabel>
                <Select
                  value={bookForm.petId}
                  onChange={(e) => setBookForm({ ...bookForm, petId: e.target.value })}
                >
                  <MenuItem value=""><em>Choose a pet</em></MenuItem>
                  {pets.map(pet => (
                    <MenuItem key={pet._id} value={pet._id}>
                      {pet.name} ({pet.species} - {pet.breed || 'Mixed'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Clinic ID"
                placeholder="Enter clinic ID (from clinic finder)"
                value={bookForm.clinicId}
                onChange={(e) => setBookForm({ ...bookForm, clinicId: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vet ID (optional)"
                placeholder="Leave blank for any available vet"
                value={bookForm.vetId}
                onChange={(e) => setBookForm({ ...bookForm, vetId: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Appointment Date & Time"
                type="datetime-local"
                value={bookForm.dateTime}
                onChange={(e) => setBookForm({ ...bookForm, dateTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Visit"
                value={bookForm.reason}
                onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes (optional)"
                value={bookForm.notes}
                onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                multiline
                rows={3}
                placeholder="Symptoms, special requests, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button onClick={() => setOpenBookDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBookAppointment}
            sx={{
              background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
              px: 4,
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OwnerAppointments;