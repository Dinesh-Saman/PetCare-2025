// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Button,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Mail as MailIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  HowToReg as RegisterIcon,
  Close as CloseIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import LoginPopup from './LoginPopup';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const ownerData = localStorage.getItem('owner_user');
      const ownerToken = localStorage.getItem('owner_token');
      
      if (ownerData && ownerToken) {
        try {
          const parsed = JSON.parse(ownerData);
          if (parsed?.id && (parsed.role === 'owner' || parsed.userType === 'PetOwner')) {
            setIsLoggedIn(true);
            const fullName = `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim();
            setUserName(fullName || 'Pet Owner');
            return;
          }
        } catch (err) {
          console.warn('Invalid owner_user data', err);
        }
      }
      setIsLoggedIn(false);
      setUserName('');
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const openLoginPopup = () => {
    setLoginPopupOpen(true);
    if (drawerOpen) setDrawerOpen(false);
  };

  const closeLoginPopup = () => setLoginPopupOpen(false);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    setUserName(fullName || 'Pet Owner');
  };

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);

  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('owner_token');
    localStorage.removeItem('owner_user');
    localStorage.removeItem('owner');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsLoggedIn(false);
    setUserName('');
    setAnchorEl(null);
    setDrawerOpen(false);
    
    Swal.fire({
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    
    navigate('/');
  };

  // Menu items in Pascal Case
  const commonItems = [
    { path: "/", icon: <HomeIcon />, label: "Home" },
    { path: "/about", icon: <InfoIcon />, label: "About Us" },
    { path: "/contact", icon: <MailIcon />, label: "Contact Us" },
  ];

  const ownerItems = [
    { path: "/owner/my-appointments", icon: <CalendarIcon />, label: "My Appointments" },
  ];

  let menuItems = commonItems;
  if (isLoggedIn) menuItems = [...commonItems, ...ownerItems];

  const drawerContent = () => (
    <Box
      sx={{
        width: isMobile ? '100%' : 380,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #004aad 0%, #0077ff 100%)',
        color: 'white',
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="https://i.imgur.com/RHsVvXq.jpeg"
            alt="Pawpal Logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          />
          <Typography variant="h5" fontWeight="bold">
            Pawpal
          </Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      {/* User Info Section */}
      {isLoggedIn && (
        <>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <PersonIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {userName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Pet Owner
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        </>
      )}

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={toggleDrawer(false)}
            sx={{
              color: 'white',
              py: 2,
              px: 3,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              ...(location.pathname === item.path && {
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRight: '4px solid white',
              }),
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 45 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 500 }}
            />
          </ListItem>
        ))}
      </List>

      {/* Auth Section */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        {isLoggedIn ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              to="/owner/profile"
              onClick={toggleDrawer(false)}
              startIcon={<PersonIcon />}
              sx={{
                py: 1.5,
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.25)' },
              }}
            >
              My Profile
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { toggleDrawer(false)(); handleLogout(); }}
              startIcon={<LogoutIcon />}
              sx={{
                py: 1.5,
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.3)' },
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { toggleDrawer(false)(); openLoginPopup(); }}
              startIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.25)' },
              }}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              to="/register"
              onClick={toggleDrawer(false)}
              startIcon={<RegisterIcon />}
              sx={{
                py: 1.5,
                background: 'rgba(255,255,255,0.25)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.35)' },
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center', opacity: 0.7 }}>
        <Typography variant="caption">
          © {new Date().getFullYear()} Pawpal
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #004aad, #0077ff)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
          <Toolbar
            sx={{
              maxWidth: '1400px',
              width: '100%',
              mx: 'auto',
              px: { xs: 2, md: 4 },

              minHeight: 80, // 👈 mobile height
              '@media (min-width:600px)': {
                minHeight: 96, // 👈 desktop height
              },
            }}
          >

          {/* Logo + Drawer Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Box
              component={Link}
              to={isLoggedIn ? "/owner/profile" : "/"}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}
            >
              <img
                src="https://i.imgur.com/RHsVvXq.jpeg"
                alt="Pawpal Logo"
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              />
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', md: '1.6rem' } }}>
                Pawpal
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 4 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  textTransform: 'none',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    width: location.pathname === item.path ? '100%' : '0%',
                    height: '2px',
                    backgroundColor: 'white',
                    transition: 'width 0.3s',
                  },
                  '&:hover::after': { width: '100%' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right Side - Auth/Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isLoggedIn ? (
              <>
                <Button
                  onClick={handleProfileMenuOpen}
                  startIcon={<PersonIcon />}
                  endIcon={<ArrowDropDownIcon />}
                  sx={{
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 2,
                    px: 2,
                    py: 0.8,
                    background: 'rgba(255,255,255,0.12)',
                    textTransform: 'none',
                    display: { xs: 'none', md: 'flex' },
                    '&:hover': { background: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  {userName.split(' ')[0] || 'Profile'}
                </Button>

                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  onClick={openLoginPopup}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    display: { xs: 'none', md: 'flex' },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{
                    background: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    textTransform: 'none',
                    display: { xs: 'none', md: 'flex' },
                    '&:hover': { background: 'rgba(255,255,255,0.35)' },
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
        }}
      >
        <MenuItem component={Link} to="/owner/profile" onClick={handleProfileMenuClose}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => { handleProfileMenuClose(); handleLogout(); }}
        >
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ sx: { backgroundColor: 'transparent', backdropFilter: 'blur(10px)' } }}
        ModalProps={{
          BackdropProps: { sx: { backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' } },
        }}
      >
        {drawerContent()}
      </Drawer>

      {/* Login Popup */}
      <LoginPopup
        open={loginPopupOpen}
        onClose={closeLoginPopup}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;