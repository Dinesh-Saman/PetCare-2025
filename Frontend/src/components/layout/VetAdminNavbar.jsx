import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Drawer,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    useTheme,
    useMediaQuery,
    alpha
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    AccountCircle,
    ExitToApp,
    Settings,
    Dashboard as DashboardIcon,
    Person,
    Chat as ChatIcon,
    CalendarMonth as CalendarMonthIcon,
    Pets as PetsIcon,
    HourglassEmpty as HourglassEmptyIcon,
    Group as GroupIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import { useAuth } from '../../context/AuthContext';

const VetAdminNavbar = () => {
    const { logout } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    background: 'linear-gradient(135deg, #49149e 0%, #8e24aa 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={toggleDrawer(true)}
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <img
                                src="https://i.imgur.com/RHsVvXq.jpeg"
                                alt="Logo"
                                style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid white' }}
                            />
                            <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '0.5px', display: { xs: 'none', sm: 'block' } }}>
                                PAWPAL <span style={{ fontWeight: 400, opacity: 0.8 }}>VET ADMIN</span>
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton color="inherit">
                            <NotificationsIcon />
                        </IconButton>
                        <Box
                            onClick={handleProfileMenuOpen}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                ml: 1,
                                padding: '4px 12px',
                                borderRadius: '50px',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#fff', 0.2), fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.4)' }}>
                                V
                            </Avatar>
                            {!isMobile && (
                                <Typography variant="body2" fontWeight="600">
                                    Vet Admin
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                width: 200,
                                borderRadius: '16px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                border: '1px solid #f1f5f9'
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/profile'); }}>
                            <ListItemIcon><Person fontSize="small" color="primary" /></ListItemIcon>
                            My Profile
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />

                        {/* Dashboard */}
                        <MenuItem disabled sx={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Dashboard</MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/dashboard'); }}>
                            <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                            Overview
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />

                        {/* Clinic Management */}
                        <MenuItem disabled sx={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Clinic Management</MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/clinic-settings'); }}>
                            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                            Manage Clinics
                        </MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/chat'); }}>
                            <ListItemIcon><ChatIcon fontSize="small" /></ListItemIcon>
                            Chat with Owners
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />

                        {/* Appointments */}
                        <MenuItem disabled sx={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Appointments</MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/appointments'); }}>
                            <ListItemIcon><CalendarMonthIcon fontSize="small" /></ListItemIcon>
                            All Appointments
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />

                        {/* Pet Management */}
                        <MenuItem disabled sx={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Pet Management</MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/pets'); }}>
                            <ListItemIcon><PetsIcon fontSize="small" /></ListItemIcon>
                            Registered Pets
                        </MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/pets?tab=pending'); }}>
                            <ListItemIcon><HourglassEmptyIcon fontSize="small" /></ListItemIcon>
                            Pending Registrations
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />

                        {/* Staff Management */}
                        <MenuItem disabled sx={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Staff Management</MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/staff'); }}>
                            <ListItemIcon><GroupIcon fontSize="small" /></ListItemIcon>
                            All Staff
                        </MenuItem>
                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/vet/add-new-staff'); }}>
                            <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                            Add Staff Member
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />

                        <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                            <ListItemIcon><ExitToApp fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: {
                        width: '100%',
                        border: 'none',
                        background: 'transparent'
                    }
                }}
            >
                <Box onKeyDown={toggleDrawer(false)}>
                    <Sidebar mobileView={true} onClose={() => setDrawerOpen(false)} />
                </Box>
            </Drawer>
        </>
    );
};

export default VetAdminNavbar;
