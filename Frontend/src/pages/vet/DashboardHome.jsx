// src/pages/vet/DashboardHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, CircularProgress, Grid, Paper, Avatar,
  IconButton, Tooltip, Stack, alpha, Divider, Badge
} from '@mui/material';
import { styled } from '@mui/system';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useTheme, useMediaQuery } from '@mui/material';

// Modern Styled Components
const PageContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  background: '#f8fafc',
  overflow: 'hidden',
});

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: '16px',
  minWidth: 0,
  width: '100%',
  [theme.breakpoints.down('md')]: {
    padding: '8px',
  },
}));

const HeaderSection = styled(Box)({
  marginBottom: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const WelcomeTitle = styled(Typography)({
  fontWeight: 900,
  color: '#0f172a',
  letterSpacing: '-0.5px',
});

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #e0e7ff',
  boxShadow: '0 4px 20px rgba(79, 70, 229, 0.06)',
  transition: 'all 0.3s ease',
  height: '100%',
  minHeight: '160px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 16px 36px rgba(79, 70, 229, 0.12)',
    borderColor: '#4f46e5',
    background: 'linear-gradient(135deg, #e8edff 0%, #f5f7ff 100%)',
  }
}));

const IconBox = styled(Box)(({ color }) => ({
  width: '64px',
  height: '64px',
  borderRadius: '18px',
  background: alpha(color, 0.1),
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  fontSize: '28px',
  boxShadow: `0 8px 20px ${alpha(color, 0.1)}`,
}));

const ActionCard = styled(Paper)({
  background: 'white',
  borderRadius: '24px',
  padding: '30px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid #f1f5f9',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
    borderColor: '#4f46e5',
  }
});

const ContentCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  padding: '32px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
  minHeight: '80vh',
  width: '100%',
  boxSizing: 'border-box'
}));

import {
  FaPaw,
  FaCalendarCheck,
  FaClock,
  FaUsers,
  FaHospital,
  FaPhone,
  FaUserAlt,
  FaNotesMedical,
  FaChevronRight
} from 'react-icons/fa';
import socket, { connectSocket, disconnectSocket } from '../../services/socket';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';

const DashboardHome = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [appointmentDates, setAppointmentDates] = useState([]);

  const [stats, setStats] = useState({
    totalPets: 0,
    totalClinics: 0,
    todayAppointments: 0,
    clinicStaff: 0
  });
  const [loading, setLoading] = useState({
    totalPets: true,
    totalClinics: true,
    todayAppointments: true,
    clinicStaff: true
  });

  const fetchDashboardStats = async () => {
    try {
      const userData = localStorage.getItem('vet_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const vetId = user.id || user._id;

      // Parallel fetching for better performance
      const [registeredRes, clinicsRes, apptRes, staffRes] = await Promise.all([
        api.get('/pets/clinic/registered').catch(() => ({ data: {} })),
        api.get('/vets/my-clinics').catch(() => ({ data: {} })),
        api.get(`/appointments/vet/${vetId}/today-count`).catch(() => ({ data: {} })),
        api.get('/vets/clinics/staff').catch(() => ({ data: {} }))
      ]);

      setStats({
        totalPets: registeredRes.data.count || registeredRes.data.registeredPets?.length || 0,
        totalClinics: clinicsRes.data.total || 0,
        todayAppointments: apptRes.data.todayAppointmentsCount || 0,
        clinicStaff: staffRes.data.totalStaff || staffRes.data.staff?.length || 0
      });

      setLoading({
        totalPets: false,
        totalClinics: false,
        todayAppointments: false,
        clinicStaff: false
      });
      // Also fetch all confirmed appointment dates for highlighting (next 30 days and last 30 days)
      fetchAppointmentHighlightDates();
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const fetchAppointmentHighlightDates = async () => {
    try {
      const userData = localStorage.getItem('vet_user');
      if (!userData) return;
      const user = JSON.parse(userData);
      const vetId = user.id || user._id;

      // Fetch a range of appointments to highlight dates on calendar
      const res = await api.get(`/appointments/vet/${vetId}`);
      const confirmedDates = (res.data.appointments || [])
        .filter(a => a.status === 'Confirmed')
        .map(a => dayjs(a.dateTime).format('YYYY-MM-DD'));

      setAppointmentDates([...new Set(confirmedDates)]); // Unique dates
    } catch (error) {
      console.error('Error fetching highlight dates:', error);
    }
  };

  const fetchAppointmentsForDate = async (date) => {
    setFetchingAppointments(true);
    try {
      const userData = localStorage.getItem('vet_user');
      if (!userData) return;
      const user = JSON.parse(userData);
      const vetId = user.id || user._id;

      const formattedDate = date.format('YYYY-MM-DD');
      const res = await api.get(`/appointments/vet/${vetId}?date=${formattedDate}`);

      // Filter only confirmed ones as per requirement
      const confirmedOnly = (res.data.appointments || []).filter(a => a.status === 'Confirmed');
      setSelectedDateAppointments(confirmedOnly);
    } catch (error) {
      console.error('Error fetching appointments for date:', error);
    } finally {
      setFetchingAppointments(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchAppointmentsForDate(selectedDate);

    const userData = localStorage.getItem('vet_user');
    if (userData) {
      const user = JSON.parse(userData);
      const vetId = user.id || user._id;
      if (vetId) {
        connectSocket(vetId);
        socket.on('newAppointment', () => {
          fetchDashboardStats();
          fetchAppointmentsForDate(selectedDate);
        });
        socket.on('appointmentStatusChanged', () => {
          fetchDashboardStats();
          fetchAppointmentsForDate(selectedDate);
        });
      }
    }
    return () => {
      socket.off('newAppointment');
      socket.off('appointmentStatusChanged');
      disconnectSocket();
    };
  }, []);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchAppointmentsForDate(newDate);
  };

  const statCards = [
    { label: "Today's Appointments", count: stats.todayAppointments, loading: loading.todayAppointments, icon: <FaCalendarCheck />, color: '#3b82f6' },
    { label: "Registered Pets", count: stats.totalPets, loading: loading.totalPets, icon: <FaPaw />, color: '#10b981' },
    { label: "Total Staff Members", count: stats.clinicStaff, loading: loading.clinicStaff, icon: <FaUsers />, color: '#6366f1' },
    { label: "Registered clinics", count: stats.totalClinics, loading: loading.totalClinics, icon: <FaHospital />, color: '#f59e0b' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <VetAdminNavbar />
        <PageContainer>
          {!isMobile && <Sidebar />}
          <MainContent>
            <ContentCard elevation={0}>
              <HeaderSection>
                <Box>
                  <WelcomeTitle variant="h4">My Dashboard</WelcomeTitle>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {dayjs().format('dddd, MMMM D, YYYY')}
                  </Typography>
                </Box>
                <Tooltip title="Refresh Stats">
                  <IconButton onClick={fetchDashboardStats} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                    <FaClock size={16} color="#64748b" />
                  </IconButton>
                </Tooltip>
              </HeaderSection>

              {/* === TOP SECTION: Stats (left 2/3) + Calendar (right 1/3) === */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>
                {/* Left: 2x2 Stats Grid */}
                <Box sx={{ flex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {statCards.map((stat, index) => (
                    <GlassCard key={index} elevation={0} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '160px' }}>
                      <IconBox color={stat.color} sx={{ width: '48px', height: '48px', fontSize: '22px', mb: 2 }}>
                        {stat.icon}
                      </IconBox>
                      {stat.loading ? <CircularProgress size={24} sx={{ mb: 1 }} /> : (
                        <Typography variant="h4" fontWeight="800" sx={{ color: '#1e293b', mb: 0.5 }}>{stat.count}</Typography>
                      )}
                      <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</Typography>
                    </GlassCard>
                  ))}
                </Box>

                {/* Right: Calendar */}
                <Box sx={{ flex: 1 }}>
                  <Paper sx={{
                    p: 4,
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                    bgcolor: 'white',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h5" fontWeight="900" sx={{ mb: 2, color: '#0f172a', width: '100%', textAlign: 'left' }}>
                      Schedule Calendar
                    </Typography>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <DateCalendar
                        value={selectedDate}
                        onChange={handleDateChange}
                        slots={{
                          day: (props) => {
                            const isToday = props.day.isSame(dayjs(), 'day');
                            const hasAppointment = appointmentDates.includes(props.day.format('YYYY-MM-DD'));
                            return (
                              <Badge
                                key={props.day.toString()}
                                overlap="circular"
                                badgeContent={hasAppointment ? <Box sx={{ width: 6, height: 6, bgcolor: '#10b981', borderRadius: '50%' }} /> : undefined}
                                sx={{ '& .MuiBadge-badge': { bottom: 6, right: '50%', transform: 'translateX(50%)' } }}
                              >
                                <PickersDay
                                  {...props}
                                  sx={{
                                    borderRadius: '12px',
                                    ...(isToday && {
                                      bgcolor: alpha('#4f46e5', 0.1) + ' !important',
                                      border: '2px solid #4f46e5 !important',
                                      color: '#4f46e5 !important',
                                      fontWeight: '900',
                                    }),
                                    ...(hasAppointment && !isToday && {
                                      bgcolor: alpha('#10b981', 0.12) + ' !important',
                                      border: '1px solid #10b981 !important',
                                      color: '#059669 !important',
                                      fontWeight: '700'
                                    }),
                                    '&:hover': { bgcolor: alpha('#4f46e5', 0.05) + ' !important' }
                                  }}
                                />
                              </Badge>
                            );
                          }
                        }}
                        sx={{
                          width: '100%',
                          maxWidth: '320px',
                          '& .MuiPickersDay-root.Mui-selected': {
                            bgcolor: '#4f46e5 !important',
                            color: 'white !important',
                            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
                          },
                          '& .MuiPickersCalendarHeader-root': { px: 0, pt: 0 },
                          '& .MuiPickersArrowSwitcher-root': { mr: 0 }
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
              </Box>

              {/* === BOTTOM SECTION: Appointment Details (full width) === */}
              <Paper sx={{
                p: 4,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                bgcolor: 'white',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#0f172a' }}>
                      Appointment Details
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight="600">
                      {selectedDate.format('MMMM DD, YYYY')}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h3" fontWeight="900" color="#4f46e5">
                      {selectedDateAppointments.length}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                      Confirmed Bookings
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{
                  overflowY: selectedDateAppointments.length > 2 ? 'auto' : 'visible',
                  maxHeight: selectedDateAppointments.length > 2 ? '480px' : 'none',
                  pr: selectedDateAppointments.length > 2 ? 1 : 0
                }}>
                  {fetchingAppointments ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : selectedDateAppointments.length > 0 ? (
                    selectedDateAppointments.map((appt) => (
                      <Paper key={appt._id} elevation={0} sx={{
                        p: 3,
                        borderRadius: '12px',
                        border: '1px solid #e8f5e9',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #fafffe 100%)',
                        transition: 'all 0.2s ease',
                        mb: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
                          borderColor: '#10b981',
                        }
                      }}>
                        <Grid container alignItems="center" spacing={3}>
                          {/* Column 1: Pet Profile */}
                          <Grid item xs={12} sm={6} md={3}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                src={appt.petId?.photo}
                                sx={{ width: 56, height: 56, borderRadius: '12px', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
                              >
                                <FaPaw size={24} />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#1e293b', lineHeight: 1.2 }}>
                                  {appt.petId?.name}
                                </Typography>
                                <Typography variant="caption" fontWeight="700" sx={{ color: '#64748b', textTransform: 'uppercase' }}>
                                  {appt.petId?.type || 'Pet'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          {/* Column 2: Owner Info */}
                          <Grid item xs={12} sm={6} md={3}>
                            <Stack spacing={0.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569' }}>
                                <FaUserAlt size={12} color="#94a3b8" />
                                <Typography variant="body2" fontWeight="700">
                                  {appt.petId?.ownerId?.firstName} {appt.petId?.ownerId?.lastName}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                <FaPhone size={12} color="#94a3b8" />
                                <Typography variant="caption" fontWeight="600">
                                  {appt.petId?.ownerId?.phoneNumber}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          {/* Column 3: Appt Info & Reason */}
                          <Grid item xs={12} md={4}>
                            <Stack spacing={0.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4f46e5' }}>
                                  <FaClock size={14} />
                                  <Typography variant="body2" fontWeight="900">
                                    {dayjs(appt.dateTime).format('hh:mm A')}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b', bgcolor: alpha('#4f46e5', 0.05), px: 1, py: 0.2, borderRadius: '6px' }}>
                                  <FaHospital size={12} color="#4f46e5" />
                                  <Typography variant="caption" fontWeight="800">
                                    {appt.clinicId?.name || 'Main Clinic'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                <FaNotesMedical size={12} color="#94a3b8" />
                                <Typography variant="caption" fontWeight="600" sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.3
                                }}>
                                  <Box component="span" sx={{ fontWeight: 800, color: '#475569' }}>Reason:</Box> {appt.reason || 'Regular Checkup'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          {/* Column 4: Status & Actions */}
                          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                            <Box sx={{
                              px: 1.5, py: 0.5, borderRadius: '8px',
                              bgcolor: '#ecfdf5', color: '#10b981',
                              display: 'inline-flex', alignItems: 'center', gap: 1
                            }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                              <Typography variant="caption" fontWeight="800" sx={{ textTransform: 'uppercase' }}>
                                Confirmed
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))
                  ) : (
                    <Paper sx={{
                      p: 8, textAlign: 'center', borderRadius: '32px', border: '2px dashed #e2e8f0', bgcolor: '#f8fafc'
                    }}>
                      <Box sx={{ mb: 2, color: '#cbd5e1' }}>
                        <FaCalendarCheck size={60} />
                      </Box>
                      <Typography variant="h6" fontWeight="700" color="#64748b">No confirmed appointments</Typography>
                      <Typography variant="body2" color="#94a3b8">Your schedule is clear for this date.</Typography>
                    </Paper>
                  )}
                </Box>
              </Paper>
            </ContentCard>
          </MainContent>
        </PageContainer>
      </Box>
    </LocalizationProvider>
  );
};

export default DashboardHome;
