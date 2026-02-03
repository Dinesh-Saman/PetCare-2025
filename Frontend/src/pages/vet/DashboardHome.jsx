// src/pages/vet/DashboardHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaPaw, 
  FaCalendarCheck, 
  FaClock, 
  FaUsers 
} from 'react-icons/fa';
import { Typography, Box, CircularProgress } from '@mui/material';
import Sidebar from '../../components/layout/Sidebar';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Styled Components - Optimized for 4 cards per row
const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 12,
  boxShadow: '0px 0px 15px rgba(0,0,0,0.1)',
  flex: 1,
  margin: '20px',
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden',
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  flexWrap: 'wrap',
  gap: 20,
}));

const PageTitle = styled(Typography)`
  && {
    font-family: 'Georgia', serif;
    font-weight: 700;
    color: #49149eff;
    text-align: center;
    margin-bottom: 40px;
    font-size: 2.8rem;
    letter-spacing: 1px;
    width: 100%;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
  width: 100%;

  /* Responsive design that maintains 4 cards as long as possible */
  @media (max-width: 1600px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  @media (max-width: 1400px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  min-height: 140px;
  width: 100%;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    border-color: #cbd5e1;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, ${(props) => props.gradient || '#667eea, #764ba2'});
  }
`;

const IconWrapper = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
  color: ${(props) => props.color || '#475569'};
  background: ${(props) => props.bgColor || '#f1f5f9'};
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
`;

const StatCount = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1.5;
`;

const SectionTitle = styled(Typography)`
  && {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: #334155;
    margin-bottom: 28px;
    font-size: 1.5rem;
    letter-spacing: -0.025em;
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ActionCard = styled.div`
  background-color: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 140px;
  width: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    border-color: #6366f1;
    background-color: white;
  }
`;

const ActionIcon = styled.div`
  font-size: 28px;
  color: #6366f1;
  margin-bottom: 16px;
  background: #eef2ff;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.1);
`;

const ActionTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  text-align: center;
`;

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

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        console.log('=== DASHBOARD DEBUG START ===');
        
        // First, check what's in localStorage
        const userData = localStorage.getItem('vet_user');
        console.log('Raw userData from localStorage:', userData);
        
        if (!userData) {
          console.error('No user data found in localStorage');
          Swal.fire('Error', 'User not found. Please log in again.', 'error');
          return;
        }

        // Parse the user data
        let user;
        try {
          user = JSON.parse(userData);
          console.log('Parsed user object:', user);
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          Swal.fire('Error', 'Invalid user data. Please log in again.', 'error');
          return;
        }

        // Check if user is a vet
        if (user.role !== 'vet') {
          Swal.fire('Error', 'Access denied. Veterinarian account required.', 'error');
          navigate('/login');
          return;
        }

        // 1. Fetch REGISTERED pets count
        try {
          console.log('Fetching registered pets...');
          const registeredResponse = await api.get('/pets/clinic/registered');
          console.log('Registered pets response:', registeredResponse.data);
          
          let registeredCount = 0;
          if (registeredResponse.data.registeredPets && Array.isArray(registeredResponse.data.registeredPets)) {
            registeredCount = registeredResponse.data.registeredPets.length;
          } else if (registeredResponse.data.count !== undefined) {
            registeredCount = registeredResponse.data.count;
          }
          
          console.log('Registered pets count:', registeredCount);
          setStats(prev => ({ ...prev, totalPets: registeredCount }));
        } catch (err) {
          console.error('Failed to fetch registered pets:', err);
          console.error('Error details:', err.response?.data || err.message);
          setStats(prev => ({ ...prev, totalPets: 0 }));
        } finally {
          setLoading(prev => ({ ...prev, totalPets: false }));
        }

        // 2. Fetch PENDING registrations count
        try {
          console.log('Fetching pending registrations...');
          const pendingResponse = await api.get('/pets/clinic/pending');
          console.log('Pending registrations response:', pendingResponse.data);
          
          let pendingCount = 0;
          if (pendingResponse.data.pendingPets && Array.isArray(pendingResponse.data.pendingPets)) {
            pendingCount = pendingResponse.data.pendingPets.length;
          } else if (pendingResponse.data.count !== undefined) {
            pendingCount = pendingResponse.data.count;
          }
          
          console.log('Pending registrations count:', pendingCount);
          setStats(prev => ({ ...prev, pendingRegistrations: pendingCount }));
        } catch (err) {
          console.error('Failed to fetch pending registrations:', err);
          console.error('Error details:', err.response?.data || err.message);
          setStats(prev => ({ ...prev, pendingRegistrations: 0 }));
        } finally {
          setLoading(prev => ({ ...prev, pendingRegistrations: false }));
        }

        // 3. Today's Appointments Count
        try {
          const vetId = user.id || user._id || user.userId || user.vetId;
          console.log('Fetching today appointments for vetId:', vetId);
          
          if (vetId) {
            const apptResponse = await api.get(`/appointments/vet/${vetId}/today-count`);
            console.log('Today appointments response:', apptResponse.data);
            setStats(prev => ({ 
              ...prev, 
              todayAppointments: apptResponse.data.todayAppointmentsCount || 0 
            }));
          } else {
            setStats(prev => ({ ...prev, todayAppointments: 0 }));
          }
        } catch (err) {
          console.error('Failed to fetch today\'s appointments:', err);
          console.error('Error details:', err.response?.data || err.message);
          setStats(prev => ({ ...prev, todayAppointments: 0 }));
        } finally {
          setLoading(prev => ({ ...prev, todayAppointments: false }));
        }

        // 4. Clinic Staff Count
        try {
          console.log('Fetching staff count...');
          const staffResponse = await api.get('/vets/clinics/staff');
          console.log('Staff response:', staffResponse.data);
          
          let staffCount = 0;
          if (staffResponse.data.totalStaff) {
            staffCount = staffResponse.data.totalStaff;
          } else if (staffResponse.data.staff && Array.isArray(staffResponse.data.staff)) {
            staffCount = staffResponse.data.staff.length;
          }
          
          setStats(prev => ({ ...prev, clinicStaff: staffCount }));
        } catch (err) {
          console.error('Failed to fetch staff count:', err);
          console.error('Error details:', err.response?.data || err.message);
          setStats(prev => ({ ...prev, clinicStaff: 0 }));
        } finally {
          setLoading(prev => ({ ...prev, clinicStaff: false }));
        }

        console.log('=== DASHBOARD DEBUG END ===');

      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    { 
      label: "Registered Pets", 
      count: loading.totalPets ? <CircularProgress size={24} /> : stats.totalPets, 
      icon: <FaPaw />, 
      gradient: "#10b981, #059669", 
      color: "#10b981", 
      bgColor: "#d1fae5" 
    },
    { 
      label: "Pending Registrations", 
      count: loading.pendingRegistrations ? <CircularProgress size={24} /> : stats.pendingRegistrations, 
      icon: <FaClock />, 
      gradient: "#f59e0b, #d97706", 
      color: "#f59e0b", 
      bgColor: "#fef3c7" 
    },
    { 
      label: "Today's Appointments", 
      count: loading.todayAppointments ? <CircularProgress size={24} /> : stats.todayAppointments, 
      icon: <FaCalendarCheck />, 
      gradient: "#3b82f6, #2563eb", 
      color: "#3b82f6", 
      bgColor: "#dbeafe" 
    },
    { 
      label: "Staff Members", 
      count: loading.clinicStaff ? <CircularProgress size={24} /> : stats.clinicStaff, 
      icon: <FaUsers />, 
      gradient: "#64748b, #475569", 
      color: "#64748b", 
      bgColor: "#f1f5f9" 
    }
  ];

  const quickActions = [
    { title: "Today's Schedule", icon: <FaCalendarCheck />, path: "/vet/appointments/today" },
    { title: "Pending Registrations", icon: <FaClock />, path: "/vet/pets/pending" },
    { title: "View Registered Pets", icon: <FaPaw />, path: "/vet/pets" },
    { title: "Manage Staff", icon: <FaUsers />, path: "/vet/staff" },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f5f7fa',
      minWidth: '1200px', // Ensure minimum width for 4 cards
    }}>
      <Sidebar />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: 'calc(100% - 280px)', // Account for sidebar width
      }}>
        <ContentContainer>
          <SearchSection>
            <PageTitle variant="h4">
              Veterinary Dashboard
            </PageTitle>
          </SearchSection>

          <StatsGrid>
            {statCards.map((stat, index) => (
              <StatCard key={index} gradient={stat.gradient}>
                <IconWrapper color={stat.color} bgColor={stat.bgColor}>
                  {stat.icon}
                </IconWrapper>
                <StatCount>{stat.count}</StatCount>
                <StatLabel>{stat.label}</StatLabel>
              </StatCard>
            ))}
          </StatsGrid>

          <SectionTitle variant="h5">
            Quick Actions
          </SectionTitle>
          <QuickActionsGrid>
            {quickActions.map((action, index) => (
              <ActionCard key={index} onClick={() => navigate(action.path)}>
                <ActionIcon>{action.icon}</ActionIcon>
                <ActionTitle>{action.title}</ActionTitle>
              </ActionCard>
            ))}
          </QuickActionsGrid>
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default DashboardHome;