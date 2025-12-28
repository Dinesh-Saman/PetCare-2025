import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaTachometerAlt, 
  FaCalendarDay, 
  FaCalendarAlt, 
  FaPaw, 
  FaHourglassHalf, 
  FaComments, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt,
  FaPlusCircle  // New icon for "Create Clinic"
} from 'react-icons/fa';
import Logo from '../../assets/logo.png';

// Strictly fixed 260px width sidebar
const SidebarContainer = styled.div`
  width: 260px;
  min-width: 330px;
  max-width: 280px;
  min-height: 100vh;
  background: url('https://img.freepik.com/free-vector/decorative-background-with-purple-damask-pattern_1048-3458.jpg') repeat;
  background-size: cover;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  color: #ecf0f1;
  box-shadow: 6px 0 25px rgba(0, 0, 0, 0.25);
  position: relative;
  flex-shrink: 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(26, 35, 126, 0.78);
    z-index: 0;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const LogoImage = styled.img`
  width: 80px;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
`;

const ClinicName = styled.h2`
  margin-top: 16px;
  font-size: 21px;
  font-weight: 700;
  text-align: center;
  color: #fff;
  letter-spacing: 1px;
`;

const Menu = styled.div`
  flex-grow: 1;
  position: relative;
  z-index: 1;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px 18px;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 500;
  text-decoration: none;
  color: #ecf0f1;
  border-radius: 12px;
  transition: all 0.35s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.18);
    color: #fff;
    transform: translateX(10px);
  }

  &.active {
    background: linear-gradient(90deg, #9c27b0, #ab47bc);
    color: white;
    font-weight: 700;
    box-shadow: 0 6px 25px rgba(156, 39, 176, 0.5);
  }
`;

const Icon = styled.div`
  margin-right: 18px;
  font-size: 24px;
  min-width: 36px;
  display: flex;
  justify-content: center;
`;

const SignOutContainer = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    // New: Create Clinic at the very top
    { to: "/vet/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/vet/clinic/create", icon: <FaPlusCircle />, label: "Create Clinic" },
    { to: "/vet/appointments/today", icon: <FaCalendarDay />, label: "Today's Appointments" },
    { to: "/vet/appointments", icon: <FaCalendarAlt />, label: "All Appointments" },
    { to: "/vet/pets", icon: <FaPaw />, label: "Registered Pets" },
    { to: "/vet/pets/pending", icon: <FaHourglassHalf />, label: "Pending Registrations" },
    { to: "/vet/chat", icon: <FaComments />, label: "Chat with Owners" },
    { to: "/vet/staff", icon: <FaUsers />, label: "Clinic Staff" },
    { to: "/vet/clinic-settings", icon: <FaCog />, label: "Clinic Settings" },
  ];

  return (
    <SidebarContainer>
      <LogoContainer>
        <LogoImage src={Logo} alt="PawPal Logo" />
        <ClinicName>Happy Paws Clinic</ClinicName>
      </LogoContainer>

      <Menu>
        {menuItems.map((item) => (
          <MenuItem
            key={item.to}
            to={item.to}
            className={location.pathname === item.to ? 'active' : ''}
          >
            <Icon>{item.icon}</Icon>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <SignOutContainer>
        <MenuItem to="/logout">
          <Icon><FaSignOutAlt /></Icon>
          Sign Out
        </MenuItem>
      </SignOutContainer>
    </SidebarContainer>
  );
};

export default Sidebar;