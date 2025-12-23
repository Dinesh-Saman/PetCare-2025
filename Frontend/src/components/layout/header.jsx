import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Badge,
  Box,
  styled
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  ExitToApp,
  Settings,
  Dashboard as DashboardIcon,
  People as PeopleIcon
} from '@mui/icons-material';

// Styled components (your original + improvements)
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #1a237e 0%, #3949ab 100%)',
  boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0, 4),
  minHeight: 140, // Increased height
  [theme.breakpoints.down('md')]: {
    minHeight: 120,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const LogoImage = styled('img')({
  height: 70,
  marginRight: 20,
  borderRadius: 12,
});

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(5),
  [theme.breakpoints.down('md')]: { gap: theme.spacing(3) },
  [theme.breakpoints.down('sm')]: {
    order: 2,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(3),
  },
}));

const NavLink = styled(Typography)(({ theme }) => ({
  color: '#e8eaf6',
  fontWeight: 600,
  fontSize: '1.1rem',
  cursor: 'pointer',
  padding: '8px 16px',
  borderRadius: 30,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    order: 3,
    width: '100%',
    justifyContent: 'center',
  },
}));

const WelcomeText = styled(Typography)({
  color: '#e8eaf6',
  fontWeight: 500,
});

const MenuHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  textAlign: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
}));

const AvatarLarge = styled(Avatar)({
  width: 80,
  height: 80,
  marginBottom: 8,
  border: '4px solid #fff',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
});

const VetName = styled(Typography)({
  fontWeight: 700,
  fontSize: '1.1rem',
});

const ClinicText = styled(Typography)({
  fontSize: '0.9rem',
  opacity: 0.9,
});

const LogoutItem = styled(MenuItem)({
  color: '#e74c3c',
  '& .MuiListItemIcon-root': {
    color: '#e74c3c'
  }
});

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.8, 3),
  '&:hover': {
    backgroundColor: '#f0f4ff',
  }
}));

// Spacer to push content down
const HeaderSpacer = styled('div')(({ theme }) => ({
  height: 140,
  [theme.breakpoints.down('md')]: { height: 120 },
  [theme.breakpoints.down('sm')]: { height: 240 }, // Extra for mobile
}));

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const vetName = "Dr. Sarah Johnson";
  const clinicName = "Happy Paws Veterinary Clinic";
  const profilePicture = "https://randomuser.me/api/portraits/women/68.jpg";
  const unreadNotifications = 6;

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    handleClose();
    navigate('/login');
  };

  return (
    <>
      <StyledAppBar position="fixed">
        <StyledToolbar>
          {/* Left: Logo + Title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/">
              <LogoImage
                src="https://img.freepik.com/free-vector/colorful-paw-print-logo_23-2147495866.jpg?w=2000"
                alt="PawPal Logo"
              />
            </Link>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
                PawPal
              </Typography>
              <Typography variant="caption" sx={{ color: '#c5cae9' }}>
                Veterinary Management System
              </Typography>
            </Box>
          </Box>

          {/* Center: Added Navigation Links */}
          <NavLinks>
            <NavLink component={Link} to="/">Home</NavLink>
            <NavLink component={Link} to="/about">About Us</NavLink>
            <NavLink component={Link} to="/services">Services</NavLink>
            <NavLink component={Link} to="/contact">Contact Us</NavLink>
            <NavLink component={Link} to="/login">Sign In</NavLink>
          </NavLinks>

          {/* Right: Notifications + Profile */}
          <RightSection>
            <WelcomeText variant="body1">
              Welcome back, {vetName.split(' ')[1] || vetName}
            </WelcomeText>

            <IconButton color="inherit">
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon fontSize="large" />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileClick} color="inherit">
              <Avatar
                src={profilePicture}
                alt={vetName}
                sx={{ width: 48, height: 48, border: '3px solid #fff' }}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  minWidth: 260,
                  borderRadius: 3,
                  mt: 1.5,
                  boxShadow: '0px 8px 30px rgba(0,0,0,0.2)',
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuHeader>
                <AvatarLarge src={profilePicture} alt={vetName} />
                <VetName variant="h6">{vetName}</VetName>
                <ClinicText>{clinicName}</ClinicText>
              </MenuHeader>

              <Divider />

              <StyledMenuItem onClick={() => { navigate('/vet/profile'); handleClose(); }}>
                <ListItemIcon><AccountCircle /></ListItemIcon>
                My Profile
              </StyledMenuItem>

              <StyledMenuItem onClick={() => { navigate('/vet/dashboard'); handleClose(); }}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                Dashboard
              </StyledMenuItem>

              <StyledMenuItem onClick={() => { navigate('/vet/staff'); handleClose(); }}>
                <ListItemIcon><PeopleIcon /></ListItemIcon>
                Clinic Staff
              </StyledMenuItem>

              <StyledMenuItem onClick={() => { navigate('/vet/clinic-settings'); handleClose(); }}>
                <ListItemIcon><Settings /></ListItemIcon>
                Clinic Settings
              </StyledMenuItem>

              <Divider />

              <LogoutItem onClick={handleLogout}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                Logout
              </LogoutItem>
            </Menu>
          </RightSection>
        </StyledToolbar>
      </StyledAppBar>
    </>
  );
};

export default Header;