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
                              <PickersDay
                                {...props}
                                key={props.day.toString()}
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
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', flexGrow: 1 }}>
                    Appointments for {selectedDate.format('dddd, MMMM D, YYYY')}
                  </Typography>
                  {selectedDateAppointments.length > 0 && (
                    <Box sx={{
                      bgcolor: '#4f46e5', color: 'white', borderRadius: '50%',
                      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 800, flexShrink: 0
                    }}>
                      {selectedDateAppointments.length}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{
                  overflowY: selectedDateAppointments.length > 4 ? 'auto' : 'visible',
                  maxHeight: selectedDateAppointments.length > 4 ? '480px' : 'none',
                  pr: selectedDateAppointments.length > 4 ? 1 : 0
                }}>
                  {fetchingAppointments ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : selectedDateAppointments.length > 0 ? (
                    selectedDateAppointments.map((appt, idx) => (
                      <Box
                        key={appt._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          py: 2,
                          px: 1,
                          borderBottom: idx < selectedDateAppointments.length - 1 ? '1px solid #f1f5f9' : 'none',
                          transition: 'background 0.15s ease',
                          borderRadius: '8px',
                          '&:hover': { bgcolor: '#f8fafc' },
                        }}
                      >
                        {/* Time */}
                        <Typography
                          variant="body2"
                          fontWeight="700"
                          sx={{ color: '#374151', minWidth: 72, flexShrink: 0 }}
                        >
                          {dayjs(appt.dateTime).format('h:mm A')}
                        </Typography>

                        {/* Avatar + Pet Name + Owner */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 170, flexShrink: 0 }}>
                          <Avatar
                            src={appt.petId?.photo}
                            sx={{ width: 38, height: 38, borderRadius: '8px', border: '1.5px solid #e2e8f0' }}
                          >
                            <FaPaw size={16} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="700" sx={{ color: '#111827', lineHeight: 1.2 }}>
                              {appt.petId?.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                              {appt.petId?.ownerId?.firstName} {appt.petId?.ownerId?.lastName}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Reason */}
                        <Typography
                          variant="body2"
                          sx={{ color: '#4b5563', flexGrow: 1, fontStyle: 'italic' }}
                          noWrap
                        >
                          {appt.reason || 'Regular Checkup'}
                        </Typography>

                        {/* Clinic */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, minWidth: 120 }}>
                          <FaHospital size={12} color="#94a3b8" />
                          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }} noWrap>
                            {appt.clinicId?.name || 'Main Clinic'}
                          </Typography>
                        </Box>

                        {/* Status Badge */}
                        <Box sx={{
                          px: 1.5, py: 0.4,
                          borderRadius: '6px',
                          bgcolor: appt.status === 'Confirmed' ? '#eff6ff' : appt.status === 'Completed' ? '#f0fdf4' : '#fef9c3',
                          color: appt.status === 'Confirmed' ? '#3b82f6' : appt.status === 'Completed' ? '#16a34a' : '#ca8a04',
                          border: `1px solid ${appt.status === 'Confirmed' ? '#bfdbfe' : appt.status === 'Completed' ? '#bbf7d0' : '#fde68a'}`,
                          flexShrink: 0,
                        }}>
                          <Typography variant="caption" fontWeight="700">
                            {appt.status || 'Confirmed'}
                          </Typography>
                        </Box>
                      </Box>
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

