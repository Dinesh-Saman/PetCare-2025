// src/components/NotificationBell.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  Divider,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MedicationIcon from '@mui/icons-material/Medication';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import PetsIcon from '@mui/icons-material/Pets';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.jsx';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';


const typeConfig = {
  reminder: { color: '#f59e0b', bg: '#fffbeb', icon: ScheduleIcon, chipLabel: 'Reminder', chipColor: 'warning' },
  confirmed: { color: '#10b981', bg: '#f0fdf4', icon: CheckCircleIcon, chipLabel: 'Confirmed', chipColor: 'success' },
  cancelled: { color: '#ef4444', bg: '#fef2f2', icon: CancelIcon, chipLabel: 'Cancelled', chipColor: 'error' },
  prescription: { color: '#8b5cf6', bg: '#f5f3ff', icon: MedicationIcon, chipLabel: 'Prescription', chipColor: 'secondary' },
  medical_record: { color: '#3b82f6', bg: '#eff6ff', icon: AssignmentIcon, chipLabel: 'Medical Record', chipColor: 'primary' },
  rescheduled: { color: '#f97316', bg: '#fff7ed', icon: EventRepeatIcon, chipLabel: 'Rescheduled', chipColor: 'warning' },
  chat: { color: '#ec4899', bg: '#fdf2f8', icon: PetsIcon, chipLabel: 'Chat', chipColor: 'secondary' },
};

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readNotifIds') || '[]')); }
    catch { return new Set(); }
  });
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/owner/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const { user } = useAuth(); // Assuming useAuth provides the logged-in user

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;
    
    // Determine socket URL from env or fallback to current origin (stripped of port)
    const socketBase = import.meta.env.VITE_SOCKET_URL || 
                      (window.location.protocol + '//' + window.location.hostname + ':5000');
    
    const socket = io(socketBase, {
        transports: ['websocket'],
        withCredentials: true
    });

    socket.on('connect', () => {
        console.log(`🔌 NotificationBell: Connected to ${socketBase}`);
        const uid = user.id || user._id;
        if (uid) socket.emit('join_user', uid);
    });

    const handleUpdate = (type) => {
        console.log(`🔔 Socket Notification: Recieved ${type} update`);
        fetchNotifications();
    };

    socket.on('newAppointment', () => handleUpdate('newAppointment'));
    socket.on('appointmentStatusChanged', () => handleUpdate('appointmentStatusChanged'));
    socket.on('registrationStatusChanged', () => handleUpdate('registrationStatusChanged'));
    socket.on('chat_notification', (data) => {
        console.log('💬 Socket: New chat notification data:', data);
        handleUpdate('chat_notification');
    });

    return () => {
        socket.disconnect();
    };
  }, [user, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadNotifications = notifications.filter(n => !readIds.has(n.id));
  const unreadCount = unreadNotifications.length;

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    fetchNotifications();
  };
  const handleClose = () => setAnchorEl(null);

  // Navigate to the appropriate page and highlight the specific record
  const handleNotificationClick = (n) => {
    // Mark as read and remove from display locally
    const updatedReadIds = new Set([...readIds, n.id]);
    setReadIds(updatedReadIds);
    localStorage.setItem('readNotifIds', JSON.stringify([...updatedReadIds]));

    handleClose();
    
    if (n.type === 'chat') {
      navigate('/owner/chat', { state: { petId: n.petId } });
    } else if (n.type === 'prescription' || n.type === 'medical_record') {
      // Navigate to Pet Profile for records/prescriptions
      navigate(`/owner/pets/${n.petId}`, {
        state: { 
          highlightId: n.appointmentId?.toString(),
          targetTab: n.type === 'prescription' ? 3 : 2 // 2: Medical Records, 3: Prescriptions
        }
      });
    } else {
      // Navigate to Appointments Page for others
      navigate('/owner/my-appointments', {
        state: { highlightId: n.appointmentId?.toString() }
      });
    }
  };

  const getIcon = (type) => {
    const cfg = typeConfig[type];
    if (!cfg) return <PetsIcon />;
    const Icon = cfg.icon;
    return <Icon sx={{ color: cfg.color }} />;
  };

  const getBg = (type) => typeConfig[type]?.bg || '#f8fafc';
  const getBorder = (type) => typeConfig[type]?.color || '#e2e8f0';

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpen} color="inherit" id="notification-bell-btn">
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                fontWeight: 'bold',
                minWidth: 18,
                height: 18,
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: { xs: '95vw', sm: 400 },
            maxHeight: 520,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }
        }}
      >
        {/* Header */}
        <Box sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #004aad 0%, #0077ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <NotificationsIcon sx={{ color: 'white', fontSize: 22 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', fontSize: '1rem' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 'bold', height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.85)', cursor: 'pointer', '&:hover': { color: 'white' } }}
            onClick={() => { navigate('/owner/my-appointments'); handleClose(); }}
          >
            View All Appointments →
          </Typography>
        </Box>

        {/* Body */}
        <Box sx={{ overflowY: 'auto', maxHeight: 400 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={32} />
            </Box>
          ) : unreadNotifications.length === 0 ? (
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
            unreadNotifications.map((n, idx) => {
                const cfg = typeConfig[n.type] || {};
                return (
                  <React.Fragment key={n.id}>
                    {idx > 0 && <Divider />}
                    <Box
                      onClick={() => handleNotificationClick(n)}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        p: 2,
                        bgcolor: 'rgba(79, 70, 229, 0.03)',
                        borderLeft: `4px solid ${getBorder(n.type)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                    <Avatar
                      src={n.petPhoto}
                      sx={{ width: 42, height: 42, bgcolor: cfg.bg || '#f0f0f0', flexShrink: 0 }}
                    >
                      {getIcon(n.type)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>
                          {n.title}
                        </Typography>
                        <Chip
                          label={(typeConfig[n.type] || {}).chipLabel || n.type}
                          size="small"
                          color={(typeConfig[n.type] || {}).chipColor || 'default'}
                          sx={{ height: 16, fontSize: '0.6rem', '.MuiChip-label': { px: 0.8 } }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                        {n.message}
                      </Typography>
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })
          )}
        </Box>

        {notifications.length > 0 && (
          <Box sx={{ p: 1.5, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
            <Button
              fullWidth
              size="small"
              variant="text"
              onClick={() => { navigate('/owner/my-appointments'); handleClose(); }}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#004aad' }}
            >
              Go to My Appointments
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;
