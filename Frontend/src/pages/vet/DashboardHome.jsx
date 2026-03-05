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
  padding: '40px',
  minWidth: 0,
  width: '100%',
  [theme.breakpoints.down('md')]: {
    padding: '20px',
  },
}));

const HeaderSection = styled(Box)({
  marginBottom: '32px',
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
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  padding: '24px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.3s ease',
  height: '100%',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
    borderColor: '#4f46e5',
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
  borderRadius: '32px',
  padding: '40px',
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
    { label: "Clinical Staff", count: stats.clinicStaff, loading: loading.clinicStaff, icon: <FaUsers />, color: '#6366f1' },
    { label: "Total Clinics", count: stats.totalClinics, loading: loading.totalClinics, icon: <FaHospital />, color: '#f59e0b' }
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

              <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
                {/* Left Column: Stats Cards (2 per row) */}
                <Grid item xs={12} lg={7}>
                  <Grid container spacing={4}>
                    {statCards.map((stat, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <GlassCard elevation={0}>
                          <IconBox color={stat.color}>
                            {stat.icon}
                          </IconBox>
                          {stat.loading ? (
                            <CircularProgress size={28} sx={{ mb: 1 }} />
                          ) : (
                            <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b', mb: 0.5 }}>
                              {stat.count}
                            </Typography>
                          )}
                          <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {stat.label}
                          </Typography>
                        </GlassCard>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Right Column: Calendar */}
                <Grid item xs={12} lg={5}>
                  <Paper sx={{
                    p: 3,
                    borderRadius: '32px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                    bgcolor: 'white',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" fontWeight="800" sx={{ mb: 1, color: '#0f172a', width: '100%', textAlign: 'left', px: 2 }}>
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
                                    '&:hover': {
                                      bgcolor: alpha('#4f46e5', 0.05) + ' !important'
                                    }
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
                          '& .MuiPickersCalendarHeader-root': {
                            px: 0, pt: 0
                          },
                          '& .MuiPickersArrowSwitcher-root': {
                            mr: 0
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>

                {/* Bottom Section: Appointments (Full Width) */}
                <Grid item xs={12}>
                  <Paper sx={{
                    p: 4,
                    borderRadius: '32px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                    bgcolor: 'white',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    mt: 4
                  }}>
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

                    <Divider sx={{ mb: 4 }} />

                    <Box sx={{ flexGrow: 1 }}>
                      {fetchingAppointments ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                          <CircularProgress size={30} />
                        </Box>
                      ) : selectedDateAppointments.length > 0 ? (
                        selectedDateAppointments.map((appt) => (
                          <Paper key={appt._id} elevation={0} sx={{
                            p: 3,
                            borderRadius: '24px',
                            border: '1px solid #f1f5f9',
                            bgcolor: 'white',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                              borderColor: alpha('#10b981', 0.2)
                            }
                          }}>
                            <Grid container alignItems="center" spacing={2}>
                              <Grid item>
                                <Avatar
                                  src={appt.petId?.photo}
                                  sx={{ width: 64, height: 64, borderRadius: '18px', border: '3px solid #f8fafc' }}
                                >
                                  <FaPaw size={30} />
                                </Avatar>
                              </Grid>
                              <Grid item xs>
                                <Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b' }}>
                                  {appt.petId?.name}
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                                    <FaUserAlt size={12} color="#94a3b8" />
                                    <Typography variant="caption" fontWeight="600">
                                      {appt.petId?.ownerId?.firstName} {appt.petId?.ownerId?.lastName}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                                    <FaPhone size={12} color="#94a3b8" />
                                    <Typography variant="caption" fontWeight="600">
                                      {appt.petId?.ownerId?.phoneNumber}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                                    <FaUserAlt size={12} color="#4f46e5" />
                                    <Typography variant="caption" fontWeight="700" sx={{ color: '#4f46e5' }}>
                                      Vet: {appt.vetId?.firstName} {appt.vetId?.lastName}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                              <Grid item sx={{ textAlign: 'right' }}>
                                <Typography variant="h5" fontWeight="900" color="#4f46e5">
                                  {dayjs(appt.dateTime).format('hh:mm A')}
                                </Typography>
                                <Box sx={{
                                  mt: 1, px: 1.5, py: 0.5, borderRadius: '8px',
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
                            <Divider sx={{ my: 2, borderColor: '#f8fafc' }} />
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, color: '#475569' }}>
                              <FaNotesMedical size={16} style={{ marginTop: 2, color: '#94a3b8' }} />
                              <Typography variant="body2" fontWeight="500">
                                <Box component="span" sx={{ fontWeight: 700, color: '#1e293b' }}>Reason:</Box> {appt.reason || 'N/A'}
                              </Typography>
                            </Box>
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
                </Grid>
              </Grid>
            </ContentCard>
          </MainContent>
        </PageContainer>
      </Box>
    </LocalizationProvider>
  );
};

export default DashboardHome;