// src/components/VetNavbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Divider,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Mail as MailIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const VetNavbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { openAuthModal, vetUser } = useAuth();
  const isVetLoggedIn = !!vetUser;

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const menuItems = [
    { path: "/vet-home", icon: <HomeIcon />, label: "Home" },
    { path: "/about", icon: <InfoIcon />, label: "About Us" },
    { path: "/contact", icon: <MailIcon />, label: "Contact Us" },
  ];

  const drawerContent = () => (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="https://i.imgur.com/RHsVvXq.jpeg"
            alt="PawPal Logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Typography variant="h5" fontWeight="bold"> PawPal </Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            state={{ fromVet: true }}
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

      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        {isVetLoggedIn ? (
          <Button
            fullWidth
            variant="contained"
            component={Link}
            to="/vet/dashboard"
            onClick={toggleDrawer(false)}
            startIcon={<DashboardIcon />}
            sx={{
              py: 1.5,
              background: 'rgba(255,255,255,0.25)',
              color: 'white',
              '&:hover': { background: 'rgba(255,255,255,0.35)' },
            }}
          >
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { toggleDrawer(false)(); openAuthModal('login', 'vet'); }}
              startIcon={<LoginIcon />}
              sx={{
                mb: 2,
                py: 1.5,
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.25)' },
              }}
            >
              Vet Login
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => { toggleDrawer(false)(); openAuthModal('register', 'vet'); }}
              startIcon={<InfoIcon />} // Using InfoIcon as a placeholder
              sx={{
                py: 1.5,
                background: 'rgba(255,255,255,0.25)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.35)' },
              }}
            >
              Vet Register
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #49149e, #8e24aa)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '1400px',
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 4 },
            minHeight: 80,
            '@media (min-width:600px)': { minHeight: 96 },
          }}
        >
          <Box
            component={Link}
            to="/vet-home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, md: 1.5 },
              textDecoration: 'none',
              color: 'inherit',
              mr: 'auto'
            }}
          >
            <Box
              component="img"
              src="https://i.imgur.com/RHsVvXq.jpeg"
              alt="PawPal Logo"
              sx={{
                width: { xs: 50, md: 70 },
                height: { xs: 50, md: 70 },
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid white'
              }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.6rem' } }}
            >
              PawPal <span style={{ fontWeight: 400, opacity: 0.8, fontSize: '0.9rem' }}>VET PORTAL</span>
            </Typography>
          </Box>

          <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 4 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                state={{ fromVet: true }}
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {isVetLoggedIn ? (
              <Button
                component={Link}
                to="/vet/dashboard"
                variant="contained"
                startIcon={<DashboardIcon />}
                sx={{
                  background: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  textTransform: 'none',
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': { background: 'rgba(255,255,255,0.35)' },
                }}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => openAuthModal('login', 'vet')}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    display: { xs: 'none', md: 'flex' },
                  }}
                >
                  Vet Login
                </Button>
                <Button
                  onClick={() => openAuthModal('register', 'vet')}
                  variant="contained"
                  sx={{
                    background: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    textTransform: 'none',
                    display: { xs: 'none', md: 'flex' },
                    '&:hover': { background: 'rgba(255,255,255,0.35)' },
                  }}
                >
                  Vet Register
                </Button>
              </>
            )}
            <IconButton
              color="inherit"
              edge="end"
              onClick={toggleDrawer(true)}
              sx={{
                display: { md: 'none' },
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: '100vw',
            background: 'linear-gradient(135deg, #49149e 0%, #8e24aa 100%)',
            color: 'white',
          }
        }}
      >
        {drawerContent()}
      </Drawer>
    </>
  );
};

export default VetNavbar;
