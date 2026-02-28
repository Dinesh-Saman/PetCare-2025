// src/pages/vet/DashboardHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, CircularProgress, Grid, Paper, Avatar,
  IconButton, Tooltip, Stack, alpha
} from '@mui/material';
import { styled } from '@mui/system';
import Sidebar from '../../components/layout/sidebar';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Modern Styled Components
const PageContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  background: '#f8fafc',
});

const MainContent = styled(Box)({
  flexGrow: 1,
  padding: '40px',
});

const ProfileBanner = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  borderRadius: '32px',
  padding: '60px 40px',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: '40px',
  boxShadow: '0 20px 50px rgba(79, 70, 229, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
  }
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  padding: '24px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-5px)',
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

import {
  FaPaw,
  FaCalendarCheck,
  FaClock,
  FaUsers
} from 'react-icons/fa';
import socket, { connectSocket, disconnectSocket } from '../../services/socket';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPets: 0,
    pendingRegistrations: 0,
    todayAppointments: 0,
    clinicStaff: 0
  });
  const [loading, setLoading] = useState({
    totalPets: true,
    pendingRegistrations: true,
    todayAppointments: true,
    clinicStaff: true
  });

  const fetchDashboardStats = async () => {
    try {
      const userData = localStorage.getItem('vet_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const vetId = user.id || user._id || user.userId || user.vetId;
      if (!vetId) return;

      // Parallel fetching for better performance
      const [registeredRes, pendingRes, apptRes, staffRes] = await Promise.all([
        api.get('/pets/clinic/registered').catch(() => ({ data: {} })),
        api.get('/pets/clinic/pending').catch(() => ({ data: {} })),
        api.get(`/appointments/vet/${vetId}/today-count`).catch(() => ({ data: {} })),
        api.get('/vets/clinics/staff').catch(() => ({ data: {} }))
      ]);

      setStats({
        totalPets: registeredRes.data.registeredPets?.length || registeredRes.data.count || 0,
        pendingRegistrations: pendingRes.data.pendingPets?.length || pendingRes.data.count || 0,
        todayAppointments: apptRes.data.todayAppointmentsCount || 0,
        clinicStaff: staffRes.data.totalStaff || staffRes.data.staff?.length || 0
      });

      setLoading({
        totalPets: false,
        pendingRegistrations: false,
        todayAppointments: false,
        clinicStaff: false
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const userData = localStorage.getItem('vet_user');
    if (userData) {
      const user = JSON.parse(userData);
      const vetId = user.id || user._id;
      if (vetId) {
        connectSocket(vetId);
        socket.on('newAppointment', fetchDashboardStats);
        socket.on('appointmentStatusChanged', fetchDashboardStats);
      }
    }
    return () => {
      socket.off('newAppointment');
      socket.off('appointmentStatusChanged');
      disconnectSocket();
    };
  }, []);

  const statCards = [
    { label: "Registered Pets", count: stats.totalPets, loading: loading.totalPets, icon: <FaPaw />, color: '#10b981' },
    { label: "Pending Requests", count: stats.pendingRegistrations, loading: loading.pendingRegistrations, icon: <FaClock />, color: '#f59e0b' },
    { label: "Today's Schedule", count: stats.todayAppointments, loading: loading.todayAppointments, icon: <FaCalendarCheck />, color: '#3b82f6' },
    { label: "Clinic Team", count: stats.clinicStaff, loading: loading.clinicStaff, icon: <FaUsers />, color: '#6366f1' }
  ];

  const quickActions = [
    { title: "Today's Schedule", icon: <FaCalendarCheck />, path: "/vet/appointments/today" },
    { title: "Pending Requests", icon: <FaClock />, path: "/vet/pets/pending" },
    { title: "Registered Pets", icon: <FaPaw />, path: "/vet/pets" },
    { title: "Manage Team", icon: <FaUsers />, path: "/vet/staff" },
  ];

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <ProfileBanner elevation={0}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }}>
            <FaPaw size={40} />
          </Avatar>
          <Typography variant="h3" fontWeight="900" gutterBottom>Veterinary Dashboard</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            Welcome back! Here's what's happening at your clinic today.
          </Typography>
        </ProfileBanner>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                <Typography variant="body1" fontWeight="600" color="text.secondary">
                  {stat.label}
                </Typography>
              </GlassCard>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" fontWeight="800" sx={{ mb: 3, color: '#334155' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ActionCard elevation={0} onClick={() => navigate(action.path)}>
                <Box sx={{
                  width: 60, height: 60, borderRadius: '16px', bgcolor: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 2, fontSize: '24px', color: '#4f46e5'
                }}>
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight="700" color="#334155">
                  {action.title}
                </Typography>
              </ActionCard>
            </Grid>
          ))}
        </Grid>
      </MainContent>
    </PageContainer>
  );
};

export default DashboardHome;