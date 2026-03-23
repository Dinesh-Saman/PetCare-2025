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
    CircularProgress,
    Popover,
    Chip,
    Tooltip
} from '@mui/material';
import Button from '@mui/material/Button';
import api from '../../services/api';
import { io } from 'socket.io-client';
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
    Mail as MailIcon,
    Cancel as CancelIcon
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
    }, []);

    // Socket.IO for real-time updates
    useEffect(() => {
        if (!user) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            transports: ['websocket'],
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('🔌 VetAdminNavbar: Connected to socket');
            // Join personal room and clinic room if available
            const uid = user.id || user._id;
            const cid = user.currentActiveClinicId?._id || user.currentActiveClinicId || user.clinicId;

            if (uid) socket.emit('join_user', uid);
            if (cid) {
                socket.emit('join_clinic', cid.toString());
                console.log(`🏥 Joining clinic room: clinic_${cid}`);
            }
        });

        const handleUpdate = () => {
            console.log('🔄 Socket: Notification update received');
            fetchNotifications();
        };

        socket.on('newRegistration', handleUpdate);
        socket.on('newAppointment', handleUpdate);
        socket.on('appointmentStatusChanged', handleUpdate);
        socket.on('chat_notification', handleUpdate);

        return () => {
            socket.off('newRegistration', handleUpdate);
            socket.off('newAppointment', handleUpdate);
            socket.off('appointmentStatusChanged', handleUpdate);
            socket.off('chat_notification', handleUpdate);
            socket.disconnect();
        };
    }, [user]);

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
                        <Tooltip title="Notifications">
                            <IconButton color="inherit" onClick={handleNotifMenuOpen} size={isMobile ? "small" : "medium"}>
                                <Badge 
                                    badgeContent={totalNotifs} 
                                    color="error" 
                                    sx={{ 
                                        '& .MuiBadge-badge': { 
                                            fontSize: '0.65rem', 
                                            height: 18, 
                                            minWidth: 18,
                                            fontWeight: 'bold',
                                            border: '2px solid #8e24aa'
                                        } 
                                    }}
                                >
                                    <NotificationsIcon fontSize={isMobile ? "small" : "medium"} />
                                </Badge>
                            </IconButton>
                        </Tooltip>
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
            {/* Notifications Popover - Styled like Owner side */}
            <Popover
                anchorEl={notifAnchorEl}
                open={Boolean(notifAnchorEl)}
                onClose={handleNotifMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        width: { xs: '95vw', sm: 400 },
                        maxHeight: 600,
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        zIndex: 9999
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    p: 2.5,
                    background: 'linear-gradient(135deg, #49149e 0%, #8e24aa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <NotificationsIcon sx={{ color: 'white', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', fontSize: '1rem' }}>
                            Notifications
                        </Typography>
                        {totalNotifs > 0 && (
                            <Chip
                                label={totalNotifs}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 'bold', height: 20, fontSize: '0.7rem' }}
                            />
                        )}
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.85)', cursor: 'pointer', '&:hover': { color: 'white' } }}
                        onClick={() => { navigate('/vet/dashboard'); handleNotifMenuClose(); }}
                    >
                        Go to Dashboard →
                    </Typography>
                </Box>

                {/* Body */}
                <Box sx={{ overflowY: 'auto', maxHeight: 400 }}>
                    {loadingNotifs ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : totalNotifs === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                            <NotificationsIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
                            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                All caught up!
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                No new notifications at the moment.
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {/* Pending Registrations */}
                            {notifications.pendingRegistrations?.length > 0 && (
                                <>
                                    <Box sx={{ px: 2, pt: 1.5, pb: 0.5, bgcolor: '#f8fafc' }}>
                                        <Typography variant="caption" fontWeight="800" color="warning.main" sx={{ letterSpacing: 0.5 }}>NEW PET REGISTRATIONS</Typography>
                                    </Box>
                                    {notifications.pendingRegistrations.map((reg) => (
                                        <Box key={reg._id} 
                                            onClick={async () => {
                                                handleNotifMenuClose();
                                                setNotifications(prev => ({ ...prev, pendingRegistrations: prev.pendingRegistrations.filter(r => r._id !== reg._id) }));
                                                try { await api.patch(`/vets/notifications/registration/${reg._id}/read`); } catch (err) { console.error(err); }
                                                navigate('/vet/pets/pending', { state: { highlightId: reg._id } });
                                            }}
                                            sx={{
                                                display: 'flex', gap: 2, p: 2,
                                                bgcolor: 'rgba(245, 158, 11, 0.03)',
                                                borderLeft: '4px solid #f59e0b',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                '&:hover': { bgcolor: '#f1f5f9' },
                                            }}
                                        >
                                            <Avatar src={reg.ownerId?.photo} sx={{ width: 42, height: 42, bgcolor: '#fffbeb', flexShrink: 0 }}>
                                                <HourglassEmptyIcon sx={{ color: '#f59e0b' }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>
                                                        {reg.name}
                                                    </Typography>
                                                    <Chip label="Registration" size="small" color="warning" sx={{ height: 16, fontSize: '0.6rem', '.MuiChip-label': { px: 0.8 } }} />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                                                    {`New request from ${reg.ownerId?.firstName} ${reg.ownerId?.lastName || ''}`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                    <Divider />
                                </>
                            )}

                            {/* Appointments */}
                            {notifications.appointments?.length > 0 && (
                                <>
                                    <Box sx={{ px: 2, pt: 1.5, pb: 0.5, bgcolor: '#f8fafc' }}>
                                        <Typography variant="caption" fontWeight="800" color="primary.main" sx={{ letterSpacing: 0.5 }}>UPCOMING APPOINTMENTS</Typography>
                                    </Box>
                                    {notifications.appointments.map((app) => (
                                        <Box key={app._id} 
                                            onClick={async () => {
                                                handleNotifMenuClose();
                                                setNotifications(prev => ({ ...prev, appointments: prev.appointments.filter(a => a._id !== app._id) }));
                                                try { await api.patch(`/vets/notifications/appointment/${app._id}/read`); } catch (err) { console.error(err); }
                                                navigate('/vet/appointments', { state: { highlightId: app._id } });
                                            }}
                                            sx={{
                                                display: 'flex', gap: 2, p: 2,
                                                bgcolor: app.status === 'Booked' ? 'rgba(245, 158, 11, 0.03)' : (app.status === 'Canceled' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(14, 165, 233, 0.03)'),
                                                borderLeft: `4px solid ${app.status === 'Booked' ? '#f59e0b' : (app.status === 'Canceled' ? '#ef4444' : '#0ea5e9')}`,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                '&:hover': { bgcolor: '#f1f5f9' },
                                            }}
                                        >
                                            <Avatar src={app.petId?.photo} sx={{ width: 42, height: 42, bgcolor: app.status === 'Booked' ? '#fffbeb' : (app.status === 'Canceled' ? '#fef2f2' : '#f0f9ff'), flexShrink: 0 }}>
                                                {app.status === 'Booked' ? <HourglassEmptyIcon sx={{ color: '#f59e0b' }} /> : (app.status === 'Canceled' ? <CancelIcon sx={{ color: '#ef4444' }} /> : <CalendarMonthIcon sx={{ color: '#0ea5e9' }} />)}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>
                                                        {app.petId?.name || 'Pet'}
                                                    </Typography>
                                                    <Chip 
                                                        label={app.status === 'Booked' ? 'New Request' : (app.status === 'Canceled' ? 'Canceled' : 'Confirmed')} 
                                                        size="small" 
                                                        color={app.status === 'Booked' ? 'warning' : (app.status === 'Canceled' ? 'error' : 'info')} 
                                                        sx={{ height: 16, fontSize: '0.6rem', '.MuiChip-label': { px: 0.8 } }} 
                                                    />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                                                    <strong>{dayjs(app.dateTime).format('h:mm A')}</strong> | {dayjs(app.dateTime).format('MMM D')}
                                                    <br />
                                                    {app.clinicId?.name || 'Clinic'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                    <Divider />
                                </>
                            )}

                            {/* Unread Chats */}
                            {notifications.unreadChats?.length > 0 && (
                                <>
                                    <Box sx={{ px: 2, pt: 1.5, pb: 0.5, bgcolor: '#f8fafc' }}>
                                        <Typography variant="caption" fontWeight="800" color="secondary.main" sx={{ letterSpacing: 0.5 }}>NEW MESSAGES</Typography>
                                    </Box>
                                    {notifications.unreadChats.map((chat) => (
                                        <Box key={chat._id} 
                                            onClick={async () => {
                                                handleNotifMenuClose();
                                                const ownerId = chat.ownerId || chat.senderId;
                                                const petId = chat.petId?._id || chat.petId;
                                                setNotifications(prev => ({ ...prev, unreadChats: prev.unreadChats.filter(c => c._id !== chat._id) }));
                                                try { if (petId) await api.patch('/chat/read', { petId }); } catch (err) { console.error(err); }
                                                if (ownerId) navigate(`/vet/chat/owner/${ownerId}`, { state: { selectedPetId: petId } });
                                                else navigate('/vet/chat');
                                            }}
                                            sx={{
                                                display: 'flex', gap: 2, p: 2,
                                                bgcolor: 'rgba(139, 92, 246, 0.03)',
                                                borderLeft: '4px solid #8b5cf6',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                '&:hover': { bgcolor: '#f1f5f9' },
                                            }}
                                        >
                                            <Avatar src={chat.petId?.photo} sx={{ width: 42, height: 42, bgcolor: '#f5f3ff', flexShrink: 0 }}>
                                                <ChatIcon sx={{ color: '#8b5cf6' }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>
                                                        {chat.petId?.name || 'Owner'}
                                                    </Typography>
                                                    <Chip label="Message" size="small" color="secondary" sx={{ height: 16, fontSize: '0.6rem', '.MuiChip-label': { px: 0.8 } }} />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.4, fontStyle: 'italic' }}>
                                                    "{chat.content.substring(0, 45)}{chat.content.length > 45 ? '...' : ''}"
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </>
                            )}
                        </List>
                    )}
                </Box>

                <Box sx={{ p: 1.5, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Button
                        fullWidth
                        size="small"
                        variant="text"
                        onClick={fetchNotifications}
                        sx={{ textTransform: 'none', fontWeight: 600, color: '#49149e' }}
                    >
                        Refresh Notifications
                    </Button>
                    <Typography variant="caption" sx={{ mt: 0.2, fontSize: '0.65rem', color: 'text.secondary', opacity: 0.7 }}>
                        Last updated: {dayjs().format('h:mm:ss A')}
                    </Typography>
                </Box>
            </Popover>

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
