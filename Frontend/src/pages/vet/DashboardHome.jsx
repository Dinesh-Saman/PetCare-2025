import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  FaPaw, 
  FaCalendarCheck, 
  FaUserInjured, 
  FaClock, 
  FaComments, 
  FaStethoscope,
  FaSyringe,
  FaUsers
} from 'react-icons/fa';
import { Typography, Box } from '@mui/material';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

// Styled Components — exactly matching AppointmentsList
const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 12,
  boxShadow: '0px 0px 15px rgba(0,0,0,0.1)',
  flex: 1,
  margin: '20px',
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  flexWrap: 'wrap',
  gap: 20,
}));

// Page Title
const PageTitle = styled(Typography)`
  && {
    font-family: 'Georgia', serif;
    font-weight: 700;
    color: #49149eff;
    text-align: center;
    margin-bottom: 40px;
    font-size: 2.8rem;
    letter-spacing: 1px;
  }
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 48px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Individual Stat Card — your original design preserved
const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  min-height: 150px;

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
  font-size: 26px;
  margin-bottom: 16px;
  color: ${(props) => props.color || '#475569'};
  background: ${(props) => props.bgColor || '#f1f5f9'};
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
`;

const StatCount = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1.5;
`;

// Quick Actions
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
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
  background-color: #f8fafc;
  border-radius: 16px;
  padding: 30px;
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
`;

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalPets: 0,
    todayAppointments: 0,
    pendingRegistrations: 0,
    unreadMessages: 0,
    activePatients: 0,
    vaccinationsDue: 0,
    clinicStaff: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    setStats({
      totalPets: 1247,
      todayAppointments: 18,
      pendingRegistrations: 5,
      unreadMessages: 12,
      activePatients: 89,
      vaccinationsDue: 23,
      clinicStaff: 8,
      todayRevenue: 245000
    });
  }, []);

  const statCards = [
    { label: "Registered Pets", count: stats.totalPets, icon: <FaPaw />, gradient: "#10b981, #059669", color: "#10b981", bgColor: "#d1fae5" },
    { label: "Today's Appointments", count: stats.todayAppointments, icon: <FaCalendarCheck />, gradient: "#3b82f6, #2563eb", color: "#3b82f6", bgColor: "#dbeafe" },
    { label: "Pending Registrations", count: stats.pendingRegistrations, icon: <FaClock />, gradient: "#f59e0b, #d97706", color: "#f59e0b", bgColor: "#fef3c7" },
    { label: "Unread Messages", count: stats.unreadMessages, icon: <FaComments />, gradient: "#8b5cf6, #7c3aed", color: "#8b5cf6", bgColor: "#ede9fe" },
    { label: "Active Patients", count: stats.activePatients, icon: <FaUserInjured />, gradient: "#ef4444, #dc2626", color: "#ef4444", bgColor: "#fee2e2" },
    { label: "Vaccinations Due", count: stats.vaccinationsDue, icon: <FaSyringe />, gradient: "#06b6d4, #0891b2", color: "#06b6d4", bgColor: "#cffafe" },
    { label: "Staff Members", count: stats.clinicStaff, icon: <FaUsers />, gradient: "#64748b, #475569", color: "#64748b", bgColor: "#f1f5f9" },
    { label: "Today's Revenue", count: `Rs. ${stats.todayRevenue.toLocaleString()}`, icon: <FaStethoscope />, gradient: "#8b5cf6, #7c3aed", color: "#8b5cf6", bgColor: "#ede9fe" },
  ];

  const quickActions = [
    { title: "Today's Schedule", icon: <FaCalendarCheck />, path: "/vet/appointments/today" },
    { title: "Pending Registrations", icon: <FaClock />, path: "/vet/pets/pending" },
    { title: "Owner Chat", icon: <FaComments />, path: "/vet/chat" },
    { title: "Add Medical Record", icon: <FaStethoscope />, path: "/vet/pets" },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
              <ActionCard key={index} onClick={() => window.location.href = action.path}>
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