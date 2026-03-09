// src/pages/owner/MyAppointments.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Container
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import { styled } from '@mui/material/styles';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  XCircle,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCcw,
  Filter,
  ChevronRight,
  Stethoscope,
  Info,
  Trash2,
  MoreVertical,
  Activity
} from "lucide-react";

import Navbar from '../../components/Navbar';
import socket, { connectSocket, disconnectSocket } from '../../services/socket';
import BookAppointmentModal from '../../components/owner/BookAppointmentModal';

const AppointmentsContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#f8fafc',
  padding: '120px 0 80px',
  fontFamily: "'Inter', sans-serif",
}));

const MainCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '24px',
  padding: '40px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
  width: '100%',
  boxSizing: 'border-box'
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: '40px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  gap: '20px',
}));

const StatCard = styled(Box)(({ theme, color = '#4f46e5' }) => ({
  background: '#f8fafc',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  transition: 'transform 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    border: `1px solid ${alpha(color, 0.2)}`,
  }
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  width: '52px',
  height: '52px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: alpha(color, 0.1),
  color: color,
}));

const AppointmentCard = styled(Card)(({ theme }) => ({
  borderRadius: '32px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 25px 60px rgba(79, 70, 229, 0.12)',
  },
}));

const StatusBadge = styled(Box)(({ theme, status }) => {
  const colors = {
    'Booked': { bg: alpha('#3b82f6', 0.1), text: '#2563eb', border: alpha('#3b82f6', 0.2) },
    'Confirmed': { bg: alpha('#10b981', 0.1), text: '#059669', border: alpha('#10b981', 0.2) },
    'Canceled': { bg: alpha('#ef4444', 0.1), text: '#dc2626', border: alpha('#ef4444', 0.2) },
    'Completed': { bg: alpha('#7c3aed', 0.1), text: '#6d28d9', border: alpha('#7c3aed', 0.2) },
    'Rescheduled': { bg: alpha('#f59e0b', 0.1), text: '#d97706', border: alpha('#f59e0b', 0.2) },
  };
  const config = colors[status] || colors['Booked'];

  return {
    padding: '6px 14px',
    borderRadius: '12px',
    background: config.bg,
    color: config.text,
    border: `1px solid ${config.border}`,
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };
});

const ControlPanel = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(12px)',
  padding: '16px 24px',
  borderRadius: '24px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
  marginBottom: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
  border: '1px solid rgba(255,255,255,0.3)',
}));

const ActionButton = styled(Button)(({ theme, variant = 'primary' }) => ({
  borderRadius: '14px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: '700',
  fontSize: '0.95rem',
  transition: 'all 0.3s ease',
  boxShadow: variant === 'contained' ? '0 10px 20px rgba(79, 70, 229, 0.2)' : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' ? '0 15px 30px rgba(79, 70, 229, 0.3)' : 'none',
  }
}));

const DetailRow = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '14px' }}>
    <Box sx={{ color: '#94a3b8', display: 'flex' }}>
      <Icon size={18} />
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: '2px', fontWeight: '500' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: '#334155', fontWeight: '600' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const GlassDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '32px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    padding: '24px',
    boxShadow: '0 25px 70px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  borderRadius: '32px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
  marginTop: '20px'
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '20px 24px',
  borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
  color: '#334155',
  fontSize: '0.95rem',
  fontWeight: 500
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: '24px',
  background: 'rgba(248, 250, 252, 0.8)',
  color: '#64748b',
  fontWeight: '800',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  letterSpacing: '1px',
  borderBottom: '2px solid #f1f5f9'
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha('#4f46e5', 0.02),
  },
  '&:last-child .MuiTableCell-root': {
    borderBottom: 'none'
  }
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [bookModalOpen, setBookModalOpen] = useState(false);

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
          text: 'We could not sync your appointments. Please try again.',
          icon: 'error',
          confirmButtonColor: '#10b981',
        });
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('owner_user') || localStorage.getItem('user');
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortOption === 'dateAsc') return new Date(a.dateTime) - new Date(b.dateTime);
    if (sortOption === 'dateDesc') return new Date(b.dateTime) - new Date(a.dateTime);
    return 0;
  });

  const handleCancel = async () => {
    if (!cancelDialog.appointment || !cancelDialog.reason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Reason Required',
        text: 'Please tell us why you are canceling.',
        confirmButtonColor: '#10b981',
      });
      return;
    }

    try {
      await api.patch(`/appointments/${cancelDialog.appointment._id}/cancel`, {
        reason: cancelDialog.reason,
      });

      Swal.fire({
        title: 'Canceled',
        text: 'Your appointment has been successfully canceled.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      fetchAppointments(false);
      setCancelDialog({ open: false, appointment: null, reason: '' });
    } catch (error) {
      Swal.fire({
        title: 'Cancellation failed',
        text: error.response?.data?.message || 'Something went wrong.',
        icon: 'error',
        confirmButtonColor: '#10b981',
      });
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <AppointmentsContainer sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#10b981' }} size={60} />
            <Typography sx={{ mt: 3, color: '#64748b', fontWeight: 500 }}>Syncing your appointments...</Typography>
          </Box>
        </AppointmentsContainer>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <AppointmentsContainer>
        <Container maxWidth="lg">
          <MainCard>
            <PageHeader>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                  My appointments
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem' }}>
                  Keep track of your pet's health journey
                </Typography>
              </Box>
              <ActionButton
                variant="contained"
                sx={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }}
                startIcon={<Plus size={20} />}
                onClick={() => setBookModalOpen(true)}
              >
                Book New Appointment
              </ActionButton>
            </PageHeader>

            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard color="#10b981">
                  <IconWrapper color="#10b981">
                    <Calendar size={26} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{stats.upcoming}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Upcoming</Typography>
                  </Box>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard color="#3b82f6">
                  <IconWrapper color="#3b82f6">
                    <CheckCircle size={26} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{stats.confirmed}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Confirmed</Typography>
                  </Box>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <IconWrapper color="#f59e0b">
                    <Clock size={26} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{stats.pending}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Requests</Typography>
                  </Box>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <IconWrapper color="#b91c1c">
                    <XCircle size={26} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{stats.canceled}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Canceled</Typography>
                  </Box>
                </StatCard>
              </Grid>
            </Grid>

            <ControlPanel>
              <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Filter size={18} color="#64748b" />
                <Box sx={{ display: 'flex', gap: '8px' }}>
                  {['all', 'upcoming', 'Confirmed', 'Completed', 'Canceled'].map((status) => (
                    <Chip
                      key={status}
                      label={status === 'all' ? 'All Sessions' : status}
                      onClick={() => { setFilterStatus(status); setPage(0); }}
                      sx={{
                        borderRadius: '12px',
                        fontWeight: 700,
                        px: 1,
                        background: filterStatus === status ? '#10b981' : 'transparent',
                        color: filterStatus === status ? 'white' : '#64748b',
                        border: filterStatus === status ? 'none' : '1px solid #e2e8f0',
                        '&:hover': { background: filterStatus === status ? '#059669' : '#f8fafc' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    value={sortOption}
                    onChange={(e) => { setSortOption(e.target.value); setPage(0); }}
                    sx={{ borderRadius: '12px', bgcolor: 'white' }}
                  >
                    <MenuItem value="dateAsc">Date: Earliest</MenuItem>
                    <MenuItem value="dateDesc">Date: Latest</MenuItem>
                  </Select>
                </FormControl>
                <IconButton onClick={() => fetchAppointments()} sx={{ bgcolor: 'white', p: 1, border: '1px solid #e2e8f0' }}>
                  <RefreshCcw size={20} color="#10b981" />
                </IconButton>
              </Box>
            </ControlPanel>

            {sortedAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10, background: 'white', borderRadius: '32px', border: '1px dashed #cbd5e1' }}>
                <AlertCircle size={60} color="#94a3b8" style={{ marginBottom: '20px' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>No appointments found</Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>Time for a check-up? Book your next session now.</Typography>
                <ActionButton
                  variant="contained"
                  sx={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }}
                  onClick={() => setBookModalOpen(true)}
                >
                  Book Now
                </ActionButton>
              </Box>
            ) : (
              <StyledTableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledHeaderCell>Pet</StyledHeaderCell>
                      <StyledHeaderCell>Veterinarian</StyledHeaderCell>
                      <StyledHeaderCell>Date & Time</StyledHeaderCell>
                      <StyledHeaderCell>Reason</StyledHeaderCell>
                      <StyledHeaderCell>Status</StyledHeaderCell>
                      <StyledHeaderCell align="right">Actions</StyledHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedAppointments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((app) => (
                        <StyledTableRow key={app._id}>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={app.petId?.photo}
                                sx={{ width: 48, height: 48, borderRadius: '14px', border: '1px solid #e2e8f0' }}
                              >
                                <PetsIcon />
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>{app.petId?.name}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>{app.petId?.species}</Typography>
                              </Box>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#4f46e5', 0.1), color: '#4f46e5' }}>
                                <User size={16} />
                              </Avatar>
                              <Typography sx={{ fontWeight: 600 }}>Dr. {app.vetId?.firstName} {app.vetId?.lastName}</Typography>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Box>
                              <Typography sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Calendar size={14} color="#4f46e5" /> {formatDate(app.dateTime)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Clock size={12} /> {formatTime(app.dateTime)}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography sx={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 200, noWrap: true, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {app.reason}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <StatusBadge status={app.status}>
                              {app.status === 'Confirmed' ? <CheckCircle size={14} /> :
                                app.status === 'Canceled' ? <XCircle size={14} /> : <Clock size={14} />}
                              {app.status}
                            </StatusBadge>
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                onClick={() => setViewDialog({ open: true, appointment: app })}
                                sx={{ color: '#4f46e5', bgcolor: alpha('#4f46e5', 0.05), '&:hover': { bgcolor: alpha('#4f46e5', 0.1) } }}
                              >
                                <Info size={18} />
                              </IconButton>
                              {(app.status === 'Booked' || app.status === 'Confirmed') && new Date(app.dateTime) > new Date() && (
                                <IconButton
                                  onClick={() => setCancelDialog({ open: true, appointment: app, reason: '' })}
                                  sx={{ color: '#ef4444', bgcolor: alpha('#ef4444', 0.05), '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}
                                >
                                  <Trash2 size={18} />
                                </IconButton>
                              )}
                            </Box>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={sortedAppointments.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    borderTop: '1px solid rgba(226, 232, 240, 0.6)',
                    '& .MuiTablePagination-toolbar': {
                      padding: '12px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '64px'
                    },
                    '& .MuiTablePagination-spacer': {
                      display: { xs: 'none', sm: 'block' },
                      flex: '1 1 100%'
                    },
                    '& .MuiTablePagination-selectLabel': {
                      fontWeight: 600,
                      color: '#64748b',
                      margin: 0
                    },
                    '& .MuiTablePagination-displayedRows': {
                      fontWeight: 600,
                      color: '#64748b',
                      margin: 0
                    }
                  }}
                />
              </StyledTableContainer>
            )}

            {/* Professional Modals */}
            <GlassDialog
              open={cancelDialog.open}
              onClose={() => setCancelDialog({ open: false, appointment: null, reason: '' })}
              fullWidth maxWidth="sm"
            >
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ w: 48, h: 48, borderRadius: '16px', bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
                    <Trash2 size={24} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>Cancel Appointment</Typography>
                </Box>

                <Typography sx={{ color: '#64748b', mb: 3 }}>
                  We're sorry to hear you need to cancel. Please provide a reason so we can improve our service.
                </Typography>

                <TextField
                  fullWidth multiline rows={4}
                  placeholder="E.g., Personal emergency, Change of plans..."
                  value={cancelDialog.reason}
                  onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: '#f8fafc' }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <ActionButton
                    fullWidth sx={{ border: '2px solid #e2e8f0', color: '#64748b' }}
                    onClick={() => setCancelDialog({ open: false, appointment: null, reason: '' })}
                  >
                    Go Back
                  </ActionButton>
                  <ActionButton
                    fullWidth variant="contained"
                    sx={{ bgcolor: '#b91c1c', color: 'white', '&:hover': { bgcolor: '#991b1b' } }}
                    onClick={handleCancel}
                  >
                    Cancel Session
                  </ActionButton>
                </Box>
              </Box>
            </GlassDialog>

            <GlassDialog
              open={viewDialog.open}
              onClose={() => setViewDialog({ open: false, appointment: null })}
              fullWidth maxWidth="sm"
            >
              {viewDialog.appointment && (
                <Box sx={{ p: 0 }}>
                  {/* Compact Header with Status Bar */}
                  <Box sx={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    p: 3,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={viewDialog.appointment.petId?.photo}
                        sx={{ width: 56, height: 56, borderRadius: '16px', border: '2px solid rgba(255,255,255,0.3)' }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          {viewDialog.appointment.petId?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Activity size={12} /> Session Details
                        </Typography>
                      </Box>
                    </Box>
                    <StatusBadge status={viewDialog.appointment.status} sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                      {viewDialog.appointment.status}
                    </StatusBadge>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {/* Time & Location Column */}
                      <Grid item xs={12} sm={6}>
                        <DetailRow
                          icon={Calendar}
                          label="Date"
                          value={formatDate(viewDialog.appointment.dateTime)}
                        />
                        <DetailRow
                          icon={Clock}
                          label="Time"
                          value={formatTime(viewDialog.appointment.dateTime)}
                        />
                      </Grid>

                      {/* Professional Info Column */}
                      <Grid item xs={12} sm={6}>
                        <DetailRow
                          icon={User}
                          label="Veterinarian"
                          value={`Dr. ${viewDialog.appointment.vetId?.firstName} ${viewDialog.appointment.vetId?.lastName}`}
                        />
                        <DetailRow
                          icon={MapPin}
                          label="Clinic"
                          value={viewDialog.appointment.clinicId?.name}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                      </Grid>

                      {/* Reasons Section */}
                      <Grid item xs={12}>
                        <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', mb: 1, display: 'block' }}>
                            REASON FOR VISIT
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                            {viewDialog.appointment.reason}
                          </Typography>

                          {viewDialog.appointment.notes && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', mb: 1, display: 'block' }}>
                                DOCTOR'S NOTES
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                                {viewDialog.appointment.notes}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <ActionButton
                        fullWidth
                        variant="contained"
                        sx={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }}
                        onClick={() => setViewDialog({ open: false, appointment: null })}
                      >
                        Close
                      </ActionButton>
                    </Box>
                  </Box>
                </Box>
              )}
            </GlassDialog>

            <BookAppointmentModal
              open={bookModalOpen}
              onClose={() => setBookModalOpen(false)}
              onSuccess={() => fetchAppointments()}
            />
          </MainCard>
        </Container>
      </AppointmentsContainer>
    </>
  );
};

export default MyAppointments;
