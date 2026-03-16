import React, { useState, useEffect } from 'react';
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
    alpha,
    Badge,
    List,
    ListItem,
    ListItemText,
    CircularProgress
} from '@mui/material';
import Button from '@mui/material/Button';
import api from '../../services/api';
import dayjs from 'dayjs';
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
    PersonAdd as PersonAddIcon,
    Home as HomeIcon,
    Info as InfoIcon,
    Mail as MailIcon
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import { useAuth } from '../../context/AuthContext';

const VetAdminNavbar = () => {
    const { user, logout } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState({
        pendingRegistrations: [],
        appointments: [],
        unreadChats: []
    });
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: "/vet-home", icon: <HomeIcon />, label: "Home" },
        { path: "/about", icon: <InfoIcon />, label: "About Us" },
        { path: "/contact", icon: <MailIcon />, label: "Contact Us" },
    ];

    useEffect(() => {
        fetchNotifications();
        // Refresh every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoadingNotifs(true);
            const response = await api.get(`/vets/notifications?t=${Date.now()}`);
            if (response.data.success) {
                setNotifications({
                    pendingRegistrations: response.data.notifications?.pendingRegistrations || [],
                    appointments: response.data.notifications?.appointments || [],
                    unreadChats: response.data.notifications?.unreadChats || []
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifs(false);
        }
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotifMenuOpen = (event) => {
        setNotifAnchorEl(event.currentTarget);
    };

    const handleNotifMenuClose = () => {
        setNotifAnchorEl(null);
    };

    const totalNotifs = (notifications.pendingRegistrations?.length || 0) +
        (notifications.appointments?.length || 0) +
        (notifications.unreadChats?.length || 0);

    const handleLogout = () => {
        logout();
        navigate('/vet-home');
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
                position="fixed"
                sx={{
                    background: 'linear-gradient(135deg, #49149e 0%, #8e24aa 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    width: '100%',
                    left: 0,
                    top: 0,
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >
                <Toolbar sx={{
                    maxWidth: '1400px',
                    width: '100%',
                    mx: 'auto',
                    px: { xs: 2, md: 4 },
                    minHeight: 80,
                    '@media (min-width:600px)': { minHeight: 96 }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}>
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={toggleDrawer(true)}
                                sx={{ mr: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                            <img
                                src="https://i.imgur.com/RHsVvXq.jpeg"
                                alt="Logo"
                                style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, borderRadius: '50%', border: '2px solid white' }}
                            />
                            <Typography
                                variant={isMobile ? "subtitle1" : "h6"}
                                fontWeight="800"
                                sx={{
                                    letterSpacing: '0.5px',
                                    display: { xs: 'block', sm: 'block' },
                                    fontSize: { xs: '0.9rem', sm: '1.25rem' }
                                }}
                            >
                                PawPal {!isMobile && <span style={{ fontWeight: 400, opacity: 0.8, fontSize: '0.9rem' }}>VET PORTAL</span>}
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: 'auto' }}>
                        <IconButton color="inherit" onClick={handleNotifMenuOpen} size={isMobile ? "small" : "medium"}>
                            <Badge badgeContent={totalNotifs} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                                <NotificationsIcon fontSize={isMobile ? "small" : "medium"} />
                            </Badge>
                        </IconButton>
                        <Box
                            onClick={handleProfileMenuOpen}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 0.5, sm: 1.5 },
                                cursor: 'pointer',
                                ml: { xs: 0.5, sm: 1 },
                                padding: { xs: '2px 4px', sm: '4px 12px' },
                                borderRadius: '50px',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <Avatar sx={{
                                width: isMobile ? 28 : 32,
                                height: isMobile ? 28 : 32,
                                bgcolor: alpha('#fff', 0.2),
                                fontSize: isMobile ? '0.75rem' : '0.9rem',
                                border: '1px solid rgba(255,255,255,0.4)',
                                fontWeight: 'bold'
                            }}>
                                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'V'}
                            </Avatar>
                            {!isMobile && (
                                <Typography variant="body2" fontWeight="600">
                                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Vet Admin'}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Toolbar spacer */}
            <Toolbar sx={{
                minHeight: 80,
                '@media (min-width:600px)': { minHeight: 96 }
            }} />

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

                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                    <ListItemIcon><ExitToApp fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
                anchorEl={notifAnchorEl}
                open={Boolean(notifAnchorEl)}
                onClose={handleNotifMenuClose}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        width: 350,
                        maxHeight: 500,
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        border: '1px solid #e2e8f0',
                        overflow: 'auto',
                        zIndex: 9999
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="800">Notifications</Typography>
                    {loadingNotifs && <CircularProgress size={16} />}
                </Box>
                <Divider />

                <List sx={{ p: 0 }}>
                    {/* Pending Registrations */}
                    {notifications.pendingRegistrations?.length > 0 && (
                        <>
                            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                                <Typography variant="caption" fontWeight="bold" color="warning.main">PENDING REGISTRATIONS</Typography>
                            </Box>
                            {notifications.pendingRegistrations.map(reg => (
                                <MenuItem key={reg._id} onClick={async () => {
                                    handleNotifMenuClose();
                                    // Immediately update local state to hide it
                                    setNotifications(prev => ({
                                        ...prev,
                                        pendingRegistrations: prev.pendingRegistrations.filter(r => r._id !== reg._id)
                                    }));

                                    try {
                                        await api.patch(`/vets/notifications/registration/${reg._id}/read`);
                                    } catch (error) {
                                        console.error('Failed to mark read:', error);
                                    }

                                    // Then navigate
                                    navigate('/vet/pets/pending', { state: { highlightId: reg._id } });
                                }}>
                                    <ListItemIcon><HourglassEmptyIcon color="warning" /></ListItemIcon>
                                    <ListItemText
                                        primary={reg.name}
                                        secondary={`From ${reg.ownerId?.firstName} ${reg.ownerId?.lastName || ''}`}
                                        primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                </MenuItem>
                            ))}
                        </>
                    )}

                    {/* Appointments Today/Tomorrow */}
                    {notifications.appointments.length > 0 && (
                        <>
                            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                                <Typography variant="caption" fontWeight="bold" color="primary">UPCOMING APPOINTMENTS</Typography>
                            </Box>
                            {notifications.appointments.map(app => (
                                <MenuItem key={app._id} onClick={async () => {
                                    handleNotifMenuClose();
                                    // Immediately update local state to hide it
                                    setNotifications(prev => ({
                                        ...prev,
                                        appointments: prev.appointments.filter(a => a._id !== app._id)
                                    }));

                                    try {
                                        await api.patch(`/vets/notifications/appointment/${app._id}/read`);
                                    } catch (error) {
                                        console.error('Failed to mark read:', error);
                                    }

                                    navigate('/vet/appointments', { state: { highlightId: app._id } });
                                }}>
                                    <ListItemIcon>
                                        {app.status === 'Booked' ? (
                                            <Badge color="warning" variant="dot" overlap="circular">
                                                <HourglassEmptyIcon sx={{ color: '#f59e0b' }} />
                                            </Badge>
                                        ) : (
                                            <CalendarMonthIcon color="info" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {app.petId?.name || 'Pet'}
                                                {app.status === 'Booked' && (
                                                    <Typography component="span" sx={{ fontSize: '0.65rem', bgcolor: '#fef3c7', color: '#92400e', px: 0.8, py: 0.2, borderRadius: '4px', fontWeight: 800 }}>REQUEST</Typography>
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: app.status === 'Booked' ? '#92400e' : 'inherit' }}>
                                                    {dayjs(app.dateTime).format('h:mm A')}
                                                </Typography>
                                                {` | ${dayjs(app.dateTime).format('MMM D')} | ${app.clinicId?.name || 'Clinic'}`}
                                            </>
                                        }
                                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                                    />
                                </MenuItem>
                            ))}
                        </>
                    )}

                    {/* Unread Chats */}
                    {notifications.unreadChats.length > 0 && (
                        <>
                            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                                <Typography variant="caption" fontWeight="bold" color="secondary">NEW MESSAGES</Typography>
                            </Box>
                            {notifications.unreadChats.map(chat => (
                                <MenuItem key={chat._id} onClick={async () => {
                                    handleNotifMenuClose();
                                    const ownerId = chat.ownerId || chat.senderId;
                                    const petId = chat.petId?._id || chat.petId;

                                    setNotifications(prev => ({
                                        ...prev,
                                        unreadChats: prev.unreadChats.filter(c => c._id !== chat._id)
                                    }));

                                    try {
                                        if (petId) {
                                            await api.patch('/chat/read', { petId });
                                        }
                                    } catch (error) {
                                        console.error('Failed to mark chat read:', error);
                                    }

                                    if (ownerId) {
                                        navigate(`/vet/chat/owner/${ownerId}`, {
                                            state: { selectedPetId: petId }
                                        });
                                    } else {
                                        navigate('/vet/chat');
                                    }
                                }}>
                                    <ListItemIcon><ChatIcon color="secondary" /></ListItemIcon>
                                    <ListItemText
                                        primary={`${chat.petId?.name || 'Owner'}`}
                                        secondary={chat.content.substring(0, 40) + (chat.content.length > 40 ? '...' : '')}
                                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                </MenuItem>
                            ))}
                        </>
                    )}

                    {totalNotifs === 0 && !loadingNotifs && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="textSecondary">No new notifications</Typography>
                        </Box>
                    )}
                </List>
                <Divider />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Typography
                        variant="caption"
                        color="primary"
                        sx={{ cursor: 'pointer', fontWeight: 700 }}
                        onClick={fetchNotifications}
                    >
                        Refresh Notifications
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
                        Last updated: {dayjs().format('h:mm:ss A')}
                    </Typography>
                </Box>
            </Menu>

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
