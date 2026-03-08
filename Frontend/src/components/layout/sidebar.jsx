import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  FaPlusCircle,  // New icon for "Create Clinic"
  FaUser,
  FaChevronDown,
  FaChevronUp,
  FaTimes
} from 'react-icons/fa';
import Logo from '../../assets/logo.png';

const SidebarContainer = styled.div`
  width: ${props => props.mobileView ? '100% !important' : '320px'};
  min-width: ${props => props.mobileView ? '100% !important' : '320px'};
  max-width: ${props => props.mobileView ? '100% !important' : '320px'};
  min-height: ${props => props.computedHeight || '100vh'};
  height: ${props => props.computedHeight || 'auto'};
  background: url('https://img.freepik.com/free-vector/decorative-background-with-purple-damask-pattern_1048-3458.jpg') repeat;
  background-size: auto; /* Use auto for repeating patterns */
  padding: ${props => props.mobileView ? '60px 20px' : '30px 20px'};
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
    background: rgba(26, 35, 126, 0.82);
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
  height: 80px;           /* ← make height = width */
  border-radius: 50%;     /* ← perfect circle */
  object-fit: cover;      /* ← important: prevents distortion */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  background: #fff;       /* optional: fallback color if image fails to load */
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

const CategoryHeader = styled.div`
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin: 24px 0 10px 10px;
  letter-spacing: 1.5px;
  position: relative;
  z-index: 1;
`;

const Sidebar = ({ computedHeight, mobileView, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedCats, setExpandedCats] = React.useState({});

  const toggleCat = (title) => {
    setExpandedCats(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    if (mobileView && onClose) onClose();
    navigate('/');
  };

  const categories = [
    {
      title: "Dashboard",
      items: [
        { to: "/vet/dashboard", icon: <FaTachometerAlt />, label: "Overview" },
      ]
    },
    {
      title: "Clinic Management",
      items: [
        { to: "/vet/clinic-settings", icon: <FaCog />, label: "Manage Clinics" },
        { to: "/vet/chat", icon: <FaComments />, label: "Chat with Owners" },
      ]
    },
    {
      title: "Appointments",
      items: [
        { to: "/vet/appointments", icon: <FaCalendarAlt />, label: "All Appointments" },
        { to: "/vet/appointments/today", icon: <FaCalendarDay />, label: "Today's Appointments" },
      ]
    },
    {
      title: "Pet Management",
      items: [
        { to: "/vet/pets", icon: <FaPaw />, label: "Registered Pets" },
        { to: "/vet/pets/pending", icon: <FaHourglassHalf />, label: "Pending Registrations" },
      ]
    },
    {
      title: "Staff Management",
      items: [
        { to: "/vet/staff", icon: <FaUsers />, label: "All Staff" },
        { to: "/vet/add-new-staff", icon: <FaPlusCircle />, label: "Add Staff Member" },
        { to: "/vet/profile", icon: <FaUser />, label: "My Profile" },
      ]
    }
  ];

  return (
    <SidebarContainer computedHeight={computedHeight} mobileView={mobileView}>
      {mobileView && (
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            cursor: 'pointer',
            fontSize: '24px',
            color: 'white'
          }}
        >
          <FaTimes />
        </div>
      )}
      <LogoContainer>
        <LogoImage src="https://i.imgur.com/RHsVvXq.jpeg" alt="PawPal" />
        <ClinicName>Pawpal Clinic</ClinicName>
      </LogoContainer>

      <Menu>
        {categories.map((cat, idx) => (
          <React.Fragment key={idx}>
            <CategoryHeader
              onClick={() => mobileView && toggleCat(cat.title)}
              style={{
                cursor: mobileView ? 'pointer' : 'default',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {cat.title}
              {mobileView && (expandedCats[cat.title] ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />)}
            </CategoryHeader>
            {(!mobileView || expandedCats[cat.title]) && cat.items.map((item) => (
              <MenuItem
                key={item.to}
                to={item.to}
                className={location.pathname === item.to ? 'active' : ''}
                onClick={() => mobileView && onClose && onClose()}
              >
                <Icon>{item.icon}</Icon>
                {item.label}
              </MenuItem>
            ))}
          </React.Fragment>
        ))}
      </Menu>

      <SignOutContainer>
        <MenuItem to="/" onClick={handleLogout}>
          <Icon><FaSignOutAlt /></Icon>
          Sign Out
        </MenuItem>
      </SignOutContainer>
    </SidebarContainer>
  );
};

export default Sidebar;