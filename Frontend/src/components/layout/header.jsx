import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Container,
  alpha,
  Button,
  InputBase,
  Paper,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  ExitToApp,
  Settings,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Search,
  Pets,
  CalendarToday,
  LocalHospital,
  AttachMoney,
  Inventory,
  Assessment,
  Add,
  PersonAdd,
  Menu as MenuIcon,
  KeyboardArrowDown,
  Today,
  AccessTime
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  borderBottom: '1px solid #eaeaea',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  minHeight: 88,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.5, 2),
    minHeight: 76,
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const BrandName = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  color: '#1a237e',
  letterSpacing: '-0.5px',
  lineHeight: 1,
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
}));

const BrandTagline = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  fontSize: '0.95rem',
  color: '#666',
  letterSpacing: '0.3px',
  marginTop: theme.spacing(0.5),
  [theme.breakpoints.down('md')]: {
    fontSize: '0.85rem',
  },
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: 450,
  backgroundColor: '#f8f9fa',
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: theme.spacing(0.5, 2),
  marginLeft: theme.spacing(4),
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#1a237e',
    boxShadow: '0 0 0 1px #1a237e',
  },
  [theme.breakpoints.down('lg')]: {
    width: 350,
    marginLeft: theme.spacing(2),
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  color: '#333',
  fontSize: '0.95rem',
  '& input': {
    '&::placeholder': {
      color: '#888',
    }
  }
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flex: 1,
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    gap: theme.spacing(0.5),
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: active ? '#1a237e' : '#555',
  padding: theme.spacing(1, 1.5),
  minWidth: 'auto',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '0.9rem',
  borderRadius: 6,
  position: 'relative',
  '&:hover': {
    backgroundColor: '#f0f2ff',
    color: '#1a237e',
  },
  '&::after': active && {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: '#1a237e',
  }
}));

const QuickStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    gap: theme.spacing(1.5),
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 70,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: '#1a237e',
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1a237e',
  color: 'white',
  padding: theme.spacing(0.75, 2),
  borderRadius: 6,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.9rem',
  '&:hover': {
    backgroundColor: '#283593',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)',
  },
}));

const UserProfile = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1, 0.5, 1.5),
  border: '1px solid #e0e0e0',
  borderRadius: 50,
  cursor: 'pointer',
  backgroundColor: 'white',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#1a237e',
    backgroundColor: '#f8f9ff',
  },
}));

const UserInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

const UserName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#333',
}));

const UserRole = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: '#666',
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  color: '#1a237e',
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
  }
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#ff4081',
    color: 'white',
    fontSize: '0.6rem',
    fontWeight: 700,
    minWidth: 18,
    height: 18,
    border: '2px solid white',
  },
}));

// Profile Menu
const ProfileMenuPaper = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: 8,
  minWidth: 280,
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  border: '1px solid #e0e0e0',
}));

const MenuHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
  color: 'white',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  marginBottom: theme.spacing(1),
  border: '3px solid rgba(255,255,255,0.3)',
}));

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.2, 2),
  borderRadius: 6,
  margin: theme.spacing(0.3, 1),
  '&:hover': {
    backgroundColor: '#f0f2ff',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 40,
    color: '#1a237e',
  }
}));

const LogoutMenuItem = styled(MenuItemStyled)(({ theme }) => ({
  color: '#d32f2f',
  '&:hover': {
    backgroundColor: '#ffebee',
  },
  '& .MuiListItemIcon-root': {
    color: '#d32f2f',
  }
}));

// Spacer
const HeaderSpacer = styled('div')(({ theme }) => ({
  height: 88,
  [theme.breakpoints.down('md')]: {
    height: 76,
  },
}));

// Main Component
const PetManagerHeader = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  
  // Mock data
  const user = {
    name: 'Dr. Sarah Wilson',
    role: 'Veterinarian',
    clinic: 'City Vet Clinic',
    initials: 'SW'
  };
  
  const stats = {
    appointments: 12,
    patients: 5,
    reminders: 3
  };
  
  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/' },
    { label: 'Patients', icon: <Pets fontSize="small" />, path: '/patients' },
    { label: 'Appointments', icon: <CalendarToday fontSize="small" />, path: '/appointments' },
    { label: 'Medical', icon: <LocalHospital fontSize="small" />, path: '/medical' },
    { label: 'Billing', icon: <AttachMoney fontSize="small" />, path: '/billing' },
    { label: 'Inventory', icon: <Inventory fontSize="small" />, path: '/inventory' },
    { label: 'Reports', icon: <Assessment fontSize="small" />, path: '/reports' },
  ];
  
  const profileMenuItems = [
    { label: 'My Profile', icon: <AccountCircle />, path: '/profile' },
    { label: 'Schedule', icon: <CalendarToday />, path: '/schedule' },
    { label: 'Clinic Settings', icon: <Settings />, path: '/settings' },
    { label: 'Staff Management', icon: <PeopleIcon />, path: '/staff' },
  ];

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClick = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    handleClose();
    navigate('/login');
  };

  const navigateTo = (path) => {
    navigate(path);
    handleClose();
  };

  const isActive = (path) => window.location.pathname === path;

  return (
    <>
      <StyledAppBar position="fixed">
        <Container maxWidth="xl" disableGutters>
          <StyledToolbar>
            {/* Left: Logo & Brand */}
            <LogoSection>
              <BrandName variant="h1">
                PET MANAGER
              </BrandName>
              <BrandTagline>
                EASIER PETCARE ADMINISTRATION
              </BrandTagline>
            </LogoSection>

            {/* Center: Search */}
            <SearchContainer>
              <Search sx={{ color: '#888', mr: 1 }} />
              <SearchInput
                placeholder="Search patients, appointments, records..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </SearchContainer>

            {/* Navigation */}
            <NavContainer>
              {navItems.map((item) => (
                <NavButton
                  key={item.label}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  active={isActive(item.path)}
                >
                  {item.label}
                </NavButton>
              ))}
            </NavContainer>

            {/* Quick Stats */}
            <QuickStats>
              <StatItem>
                <StatValue>{stats.appointments}</StatValue>
                <StatLabel>Today</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{stats.patients}</StatValue>
                <StatLabel>Active</StatLabel>
              </StatItem>
            </QuickStats>

            {/* Right: Action Buttons */}
            <ActionButtons>
              {/* New Appointment Button */}
              <Tooltip title="New Appointment" arrow>
                <PrimaryButton
                  startIcon={<Add />}
                  onClick={() => navigate('/appointments/new')}
                >
                  New
                </PrimaryButton>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title="Notifications" arrow>
                <IconButton sx={{ color: '#555' }}>
                  <NotificationBadge badgeContent={stats.reminders} max={99}>
                    <NotificationsIcon />
                  </NotificationBadge>
                </IconButton>
              </Tooltip>

              {/* User Profile */}
              <UserProfile onClick={handleProfileClick}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#1a237e',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {user.initials}
                </Avatar>
                <UserInfo>
                  <UserName>Dr. Wilson</UserName>
                  <UserRole>Veterinarian</UserRole>
                </UserInfo>
                <KeyboardArrowDown sx={{ color: '#666' }} />
              </UserProfile>

              {/* Mobile Menu Button */}
              <MobileMenuButton onClick={handleMobileMenuClick}>
                <MenuIcon />
              </MobileMenuButton>
            </ActionButtons>
          </StyledToolbar>
        </Container>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperComponent={ProfileMenuPaper}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuHeader>
            <ProfileAvatar>{user.initials}</ProfileAvatar>
            <Typography variant="subtitle1" fontWeight={600}>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {user.clinic}
            </Typography>
          </MenuHeader>

          <Divider sx={{ my: 1 }} />

          {profileMenuItems.map((item) => (
            <MenuItemStyled
              key={item.label}
              onClick={() => navigateTo(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              {item.label}
            </MenuItemStyled>
          ))}

          <Divider sx={{ my: 1 }} />

          <LogoutMenuItem onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            Logout
          </LogoutMenuItem>
        </Menu>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              minWidth: 280,
              borderRadius: 2,
              mt: 1,
            }
          }}
        >
          <MenuItem sx={{ backgroundColor: '#f8f9ff' }}>
            <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: '#1a237e' }}>
              {user.initials}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.clinic}
              </Typography>
            </Box>
          </MenuItem>

          <Divider />

          {navItems.map((item) => (
            <MenuItem
              key={item.label}
              onClick={() => navigateTo(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              {item.label}
            </MenuItem>
          ))}

          <Divider />

          <MenuItem onClick={() => navigate('/appointments/new')}>
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            New Appointment
          </MenuItem>

          <MenuItem onClick={() => navigate('/patients/new')}>
            <ListItemIcon>
              <PersonAdd />
            </ListItemIcon>
            New Patient
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <ExitToApp />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </StyledAppBar>
      <HeaderSpacer />
    </>
  );
};

export default PetManagerHeader;