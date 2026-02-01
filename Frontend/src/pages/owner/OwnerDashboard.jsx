// src/pages/owner/OwnerDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader, Avatar, Button,
  Paper, Divider, Collapse, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, LinearProgress,
  Fade, Grow, Zoom, Slide, Skeleton, Tabs, Tab, Badge,
  Container, Stack, List, ListItem, ListItemIcon, ListItemText,
  CircularProgress, useTheme, alpha, Tooltip, Menu, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, CardActions, CardMedia, Drawer,
  ListItemAvatar, ListItemButton, Fab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  Pets as PetsIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  CalendarToday as CalendarTodayIcon,
  Scale as ScaleIcon,
  ColorLens as ColorLensIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Vaccines as VaccinesIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  NotificationsActive as NotificationsActiveIcon,
  ArrowForward as ArrowForwardIcon,
  MedicalServices as MedicalServicesIcon,
  Assignment as AssignmentIcon,
  QrCode2 as QrCodeIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  LocalHospital as LocalHospitalIcon,
  Event as EventIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  FileCopy as FileCopyIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
  Assessment as AssessmentIcon,
  Favorite as FavoriteIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';

// Modern Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  paddingTop: '20px',
  paddingBottom: '60px',
}));

const ContentArea = styled(Container)(({ theme }) => ({
  maxWidth: '1600px !important',
  margin: '0 auto',
}));

const WelcomeCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
  marginBottom: '32px',
  overflow: 'visible',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 70%)',
  },
}));

const PetCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: theme.palette.background.paper,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
    borderColor: theme.palette.primary.main,
  },
}));

const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid',
  borderColor: alpha(color || theme.palette.primary.main, 0.1),
  height: '100%',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: color ? `linear-gradient(90deg, ${color}00, ${color}ff)` : 'linear-gradient(90deg, #667eea, #764ba2)',
  },
  '&:hover': {
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
  },
}));

const QuickActionButton = styled(Button)(({ theme, color }) => ({
  padding: theme.spacing(2, 3),
  borderRadius: '12px',
  background: alpha(color || theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '120px',
  '&:hover': {
    background: alpha(color || theme.palette.primary.main, 0.2),
    transform: 'translateY(-4px)',
  },
}));

const StatusBadge = styled(Box)(({ theme, status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: status === 'Approved' ? alpha('#10B981', 0.1) :
              status === 'Pending' ? alpha('#F59E0B', 0.1) :
              alpha('#EF4444', 0.1),
  color: status === 'Approved' ? '#10B981' :
         status === 'Pending' ? '#F59E0B' :
         '#EF4444',
  border: `1px solid ${status === 'Approved' ? alpha('#10B981', 0.2) :
                               status === 'Pending' ? alpha('#F59E0B', 0.2) :
                               alpha('#EF4444', 0.2)}`,
}));

// Simple Chart Component without Recharts
const SimpleLineChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.visits), ...data.map(d => d.expenses));
  
  return (
    <Box sx={{ height: 200, mt: 2 }}>
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end', gap: 1 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 150, gap: 1 }}>
              <Box sx={{ 
                width: 12,
                height: `${(item.visits / maxValue) * 100}%`,
                background: 'linear-gradient(to top, #667eea, #764ba2)',
                borderRadius: '6px 6px 0 0',
              }} />
              <Box sx={{ 
                width: 12,
                height: `${(item.expenses / maxValue) * 100}%`,
                background: 'linear-gradient(to top, #10B981, #34D399)',
                borderRadius: '6px 6px 0 0',
              }} />
            </Box>
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
              {item.month}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, background: '#667eea', borderRadius: 2 }} />
          <Typography variant="caption">Visits</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, background: '#10B981', borderRadius: 2 }} />
          <Typography variant="caption">Expenses ($)</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const SimplePieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Box sx={{ height: 200, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ position: 'relative', width: 160, height: 160 }}>
        {/* Pie chart visualization using CSS gradients */}
        <Box sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(${data.map((item, index) => 
            `${item.color} ${index === 0 ? 0 : data.slice(0, index).reduce((sum, d) => sum + (d.value/total*360), 0)}deg ${data.slice(0, index+1).reduce((sum, d) => sum + (d.value/total*360), 0)}deg`
          ).join(', ')})`,
        }} />
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 80,
          height: 80,
          background: theme => theme.palette.background.paper,
          borderRadius: '50%',
        }} />
      </Box>
      <Box sx={{ ml: 3 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 12, height: 12, background: item.color, borderRadius: 2 }} />
            <Typography variant="caption">
              {item.name}: {((item.value / total) * 100).toFixed(1)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State declarations
  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPet, setExpandedPet] = useState(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalPets: 0,
    approvedPets: 0,
    pendingPets: 0,
    vetVisits: 0,
    upcomingAppointments: 3,
    healthScore: 85,
  });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    email: '',
    profilePicture: ''
  });
  const [appointments, setAppointments] = useState([
    { id: 1, petName: 'Max', date: '2024-01-15', time: '10:00 AM', type: 'Vaccination', status: 'Confirmed' },
    { id: 2, petName: 'Bella', date: '2024-01-16', time: '2:30 PM', type: 'Checkup', status: 'Pending' },
    { id: 3, petName: 'Charlie', date: '2024-01-18', time: '11:00 AM', type: 'Grooming', status: 'Confirmed' },
  ]);
  const [healthRecords, setHealthRecords] = useState([
    { id: 1, petName: 'Max', date: '2024-01-10', type: 'Vaccination', vaccine: 'Rabies', nextDue: '2025-01-10' },
    { id: 2, petName: 'Bella', date: '2024-01-05', type: 'Deworming', medication: 'Drontal', nextDue: '2024-04-05' },
    { id: 3, petName: 'Charlie', date: '2024-01-02', type: 'Health Check', findings: 'Healthy', nextDue: '2024-07-02' },
  ]);
  const [chartData, setChartData] = useState([
    { month: 'Jan', visits: 2, expenses: 120 },
    { month: 'Feb', visits: 3, expenses: 180 },
    { month: 'Mar', visits: 1, expenses: 80 },
    { month: 'Apr', visits: 4, expenses: 240 },
    { month: 'May', visits: 2, expenses: 120 },
    { month: 'Jun', visits: 3, expenses: 180 },
  ]);
  const [petSpeciesData, setPetSpeciesData] = useState([
    { name: 'Dogs', value: 60, color: '#667eea' },
    { name: 'Cats', value: 30, color: '#764ba2' },
    { name: 'Birds', value: 5, color: '#10B981' },
    { name: 'Others', value: 5, color: '#F59E0B' },
  ]);

  // Quick Actions
  const quickActions = [
    { icon: <AddIcon />, label: 'Add Pet', color: '#667eea', path: '/owner/pets/new' },
    { icon: <MedicalServicesIcon />, label: 'Book Visit', color: '#10B981', path: '/owner/appointments/new' },
    { icon: <AssignmentIcon />, label: 'Records', color: '#8B5CF6', path: '/owner/medical-records' },
    { icon: <QrCodeIcon />, label: 'ID Cards', color: '#F59E0B', path: '/owner/pet-cards' },
    { icon: <HistoryIcon />, label: 'History', color: '#EF4444', path: '/owner/history' },
    { icon: <DownloadIcon />, label: 'Reports', color: '#3B82F6', path: '/owner/reports' },
  ];

  // Fetch data
  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        
        // Check authentication
        const token = localStorage.getItem('token');
        const ownerDataStr = localStorage.getItem('ownerUser');
        
        if (!token || !ownerDataStr) {
          navigate('/owner/login');
          return;
        }

        // Parse owner data
        const ownerData = JSON.parse(ownerDataStr);
        setOwner(ownerData);
        setEditForm({
          firstName: ownerData.firstName || '',
          lastName: ownerData.lastName || '',
          phoneNumber: ownerData.phoneNumber || '',
          address: ownerData.address || '',
          email: ownerData.email || '',
          profilePicture: ownerData.profilePicture || ''
        });

        // Fetch pets
        const petsRes = await api.get('/pets/my');
        const petsData = petsRes.data.pets || petsRes.data || [];
        setPets(petsData);

        // Calculate stats
        const approved = petsData.filter(p => p.registrationStatus === 'Approved').length;
        const pending = petsData.filter(p => p.registrationStatus === 'Pending').length;
        setStats({
          totalPets: petsData.length,
          approvedPets: approved,
          pendingPets: pending,
          vetVisits: petsData.reduce((acc, pet) => acc + (pet.vetVisits || 0), 0),
          upcomingAppointments: appointments.length,
          healthScore: Math.min(100, Math.max(50, 85 - pending * 5)),
        });

        // Update chart data based on pets
        if (petsData.length > 0) {
          const speciesCount = {};
          petsData.forEach(pet => {
            const species = pet.species || 'Other';
            speciesCount[species] = (speciesCount[species] || 0) + 1;
          });
          
          const newPetSpeciesData = Object.entries(speciesCount).map(([name, value], index) => ({
            name,
            value: (value / petsData.length) * 100,
            color: ['#667eea', '#764ba2', '#10B981', '#F59E0B', '#EF4444'][index % 5]
          }));
          setPetSpeciesData(newPetSpeciesData);
        }
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        Swal.fire({
          title: 'Error',
          text: 'Unable to load dashboard data. Please try again.',
          icon: 'error',
          confirmButtonColor: '#667eea',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [navigate]);

  // Handlers
  const handleDeletePet = async (petId, petName) => {
    const result = await Swal.fire({
      title: `Remove ${petName}?`,
      text: "This action cannot be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/pets/${petId}`);
        setPets(pets.filter(p => p._id !== petId));
        Swal.fire('Success', `${petName} has been removed`, 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to remove pet', 'error');
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/auth/update-profile', editForm);
      setOwner(response.data.user);
      localStorage.setItem('ownerUser', JSON.stringify(response.data.user));
      setOpenEditProfile(false);
      Swal.fire('Success', 'Profile updated successfully', 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await api.post('/auth/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setOwner({ ...owner, profilePicture: response.data.url });
      setEditForm({ ...editForm, profilePicture: response.data.url });
    } catch (error) {
      Swal.fire('Error', 'Failed to upload profile picture', 'error');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age === 0 ? '< 1 year' : `${age} year${age > 1 ? 's' : ''}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#10B981';
      case 'Pending': return '#F59E0B';
      case 'Rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#10B981';
      case 'Pending': return '#F59E0B';
      case 'Cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardContainer>
        <ContentArea>
          <Stack spacing={4}>
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={item}>
                  <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
              </Grid>
            </Grid>
          </Stack>
        </ContentArea>
      </DashboardContainer>
    );
  }

  return (
    <>
      <Navbar />
      <DashboardContainer>
        <ContentArea>
          {/* Welcome Section */}
          <WelcomeCard>
            <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
              <Grid container alignItems="center" spacing={4}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" fontWeight="800" gutterBottom sx={{ letterSpacing: '-0.5px' }}>
                    Welcome back, {owner?.firstName} 👋
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, fontSize: '1.1rem' }}>
                    Here's what's happening with your pets today
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/owner/pets/new')}
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.3)',
                        }
                      }}
                    >
                      Add New Pet
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setOpenEditProfile(true)}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={owner?.profilePicture}
                      sx={{
                        width: 140,
                        height: 140,
                        border: '4px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.2)',
                        fontSize: 56,
                        fontWeight: 'bold',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {owner?.firstName?.charAt(0)}
                      {owner?.lastName?.charAt(0)}
                    </Avatar>
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(255,255,255,0.9)',
                        '&:hover': { background: 'white' }
                      }}
                    >
                      <PhotoCameraIcon sx={{ color: '#667eea' }} />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                      />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </WelcomeCard>

          {/* Quick Actions */}
          <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <QuickActionButton
                  color={action.color}
                  onClick={() => navigate(action.path)}
                  startIcon={React.cloneElement(action.icon, { sx: { fontSize: 32, mb: 1 } })}
                >
                  {action.label}
                </QuickActionButton>
              </Grid>
            ))}
          </Grid>

          {/* Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatsCard>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Pets
                    </Typography>
                    <PetsIcon sx={{ color: '#667eea', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h3" fontWeight="800" color="#667eea">
                    {stats.totalPets}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#667eea' }
                    }}
                  />
                </Stack>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatsCard color="#10B981">
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Approved
                    </Typography>
                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h3" fontWeight="800" color="#10B981">
                    {stats.approvedPets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.totalPets > 0 ? `${((stats.approvedPets / stats.totalPets) * 100).toFixed(0)}%` : '0%'}
                  </Typography>
                </Stack>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatsCard color="#F59E0B">
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pending
                    </Typography>
                    <PendingIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h3" fontWeight="800" color="#F59E0B">
                    {stats.pendingPets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Awaiting approval
                  </Typography>
                </Stack>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatsCard color="#8B5CF6">
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vet Visits
                    </Typography>
                    <MedicalServicesIcon sx={{ color: '#8B5CF6', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h3" fontWeight="800" color="#8B5CF6">
                    {stats.vetVisits}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This year
                  </Typography>
                </Stack>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatsCard color="#3B82F6">
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Appointments
                    </Typography>
                    <EventIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h3" fontWeight="800" color="#3B82F6">
                    {stats.upcomingAppointments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                </Stack>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatsCard color="#EC4899">
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Health Score
                    </Typography>
                    <FavoriteIcon sx={{ color: '#EC4899', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h3" fontWeight="800" color="#EC4899">
                    {stats.healthScore}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.healthScore} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(236, 72, 153, 0.1)',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#EC4899' }
                    }}
                  />
                </Stack>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Charts and Data Visualization - Custom Implementation */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="700">
                      Veterinary Visits & Expenses
                    </Typography>
                    <TimelineIcon sx={{ color: '#667eea' }} />
                  </Box>
                  <SimpleLineChart data={chartData} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Visits</Typography>
                      <Typography variant="h6">{chartData.reduce((sum, d) => sum + d.visits, 0)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Expenses</Typography>
                      <Typography variant="h6">${chartData.reduce((sum, d) => sum + d.expenses, 0)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Avg per Visit</Typography>
                      <Typography variant="h6">
                        ${(chartData.reduce((sum, d) => sum + d.expenses, 0) / chartData.reduce((sum, d) => sum + d.visits, 0) || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="700">
                      Pet Distribution
                    </Typography>
                    <PieChartIcon sx={{ color: '#764ba2' }} />
                  </Box>
                  <SimplePieChart data={petSpeciesData} />
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="text.secondary">Total Pets</Typography>
                    <Typography variant="h6">{stats.totalPets}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content - Pets & Appointments */}
          <Grid container spacing={4}>
            {/* My Pets Section */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Typography variant="h6" fontWeight="700">
                      My Pets ({pets.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tabs 
                        value={activeTab} 
                        onChange={(e, v) => setActiveTab(v)}
                        sx={{ minHeight: 40 }}
                      >
                        <Tab label="All" sx={{ minHeight: 40, fontSize: '0.875rem' }} />
                        <Tab label="Approved" sx={{ minHeight: 40, fontSize: '0.875rem' }} />
                        <Tab label="Pending" sx={{ minHeight: 40, fontSize: '0.875rem' }} />
                      </Tabs>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/owner/pets/new')}
                        sx={{ ml: 2 }}
                      >
                        Add Pet
                      </Button>
                    </Box>
                  </Box>

                  {pets.length === 0 ? (
                    <Paper sx={{ 
                      p: 8, 
                      textAlign: 'center', 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
                    }}>
                      <Box sx={{ 
                        width: 100, 
                        height: 100, 
                        margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PetsIcon sx={{ fontSize: 48, color: '#667eea' }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600" color="text.secondary" gutterBottom>
                        No pets added yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, opacity: 0.7 }}>
                        Start by adding your first furry friend
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/owner/pets/new')}
                        sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                      >
                        Add Your First Pet
                      </Button>
                    </Paper>
                  ) : (
                    <Grid container spacing={3}>
                      {pets.map((pet) => (
                        <Grid item xs={12} md={6} key={pet._id}>
                          <PetCard>
                            <CardContent sx={{ p: 3 }}>
                              <Stack spacing={3}>
                                {/* Pet Header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    src={pet.photo}
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      border: '3px solid',
                                      borderColor: getStatusColor(pet.registrationStatus),
                                      fontSize: 32,
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {pet.name?.charAt(0)?.toUpperCase() || 'P'}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <Typography variant="h6" fontWeight="700">
                                        {pet.name || 'Unnamed Pet'}
                                      </Typography>
                                      <StatusBadge status={pet.registrationStatus || 'Pending'}>
                                        {pet.registrationStatus === 'Approved' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> :
                                         pet.registrationStatus === 'Pending' ? <PendingIcon sx={{ fontSize: 14 }} /> :
                                         <WarningIcon sx={{ fontSize: 14 }} />}
                                        {pet.registrationStatus || 'Pending'}
                                      </StatusBadge>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {pet.species || 'Unknown'} • {pet.breed || 'Mixed Breed'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ID: {pet._id?.substring(0, 8) || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Pet Details */}
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      {pet.gender === 'Male' ? 
                                        <MaleIcon sx={{ color: '#3B82F6', fontSize: 20 }} /> : 
                                        <FemaleIcon sx={{ color: '#EC4899', fontSize: 20 }} />
                                      }
                                      <Typography variant="body2">
                                        {pet.gender || 'Unknown'}
                                      </Typography>
                                    </Stack>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <CalendarTodayIcon sx={{ color: '#10B981', fontSize: 20 }} />
                                      <Typography variant="body2">
                                        {calculateAge(pet.dateOfBirth)}
                                      </Typography>
                                    </Stack>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <ScaleIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                                      <Typography variant="body2">
                                        {pet.weight ? `${pet.weight} kg` : 'Unknown'}
                                      </Typography>
                                    </Stack>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <ColorLensIcon sx={{ color: '#8B5CF6', fontSize: 20 }} />
                                      <Typography variant="body2">
                                        {pet.color || 'Unknown'}
                                      </Typography>
                                    </Stack>
                                  </Grid>
                                </Grid>

                                {/* Action Buttons */}
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  pt: 2,
                                  borderTop: 1,
                                  borderColor: 'divider'
                                }}>
                                  <Button
                                    size="small"
                                    onClick={() => togglePetExpand(pet._id)}
                                    endIcon={<ExpandMoreIcon sx={{ 
                                      transform: expandedPet === pet._id ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: '0.3s'
                                    }} />}
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    {expandedPet === pet._id ? 'Less' : 'More'}
                                  </Button>
                                  <Stack direction="row" spacing={1}>
                                    <Tooltip title="View Details">
                                      <IconButton 
                                        size="small"
                                        onClick={() => navigate(`/owner/pets/${pet._id}`)}
                                        sx={{ color: '#667eea' }}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                      <IconButton 
                                        size="small"
                                        onClick={() => navigate(`/owner/pets/${pet._id}/edit`)}
                                        sx={{ color: '#10B981' }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton 
                                        size="small"
                                        onClick={() => handleDeletePet(pet._id, pet.name)}
                                        sx={{ color: '#EF4444' }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </Box>

                                {/* Expanded Details */}
                                <Collapse in={expandedPet === pet._id}>
                                  <Box sx={{ 
                                    pt: 3, 
                                    borderTop: 1,
                                    borderColor: 'divider'
                                  }}>
                                    <Stack spacing={2}>
                                      {pet.microchipNumber && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary" display="block">
                                            Microchip Number
                                          </Typography>
                                          <Typography variant="body2" fontWeight="500">
                                            {pet.microchipNumber}
                                          </Typography>
                                        </Box>
                                      )}
                                      {pet.dateOfBirth && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary" display="block">
                                            Date of Birth
                                          </Typography>
                                          <Typography variant="body2" fontWeight="500">
                                            {new Date(pet.dateOfBirth).toLocaleDateString()}
                                          </Typography>
                                        </Box>
                                      )}
                                      {pet.vaccinationStatus && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary" display="block">
                                            Vaccination Status
                                          </Typography>
                                          <Chip 
                                            size="small"
                                            label={pet.vaccinationStatus}
                                            color={pet.vaccinationStatus === 'Up to date' ? 'success' : 'warning'}
                                            sx={{ mt: 0.5 }}
                                          />
                                        </Box>
                                      )}
                                      {pet.registeredClinicId && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary" display="block">
                                            Registered Clinic
                                          </Typography>
                                          <Typography variant="body2" fontWeight="500">
                                            {typeof pet.registeredClinicId === 'object' 
                                              ? pet.registeredClinicId.name 
                                              : pet.registeredClinicId}
                                          </Typography>
                                        </Box>
                                      )}
                                      {pet.notes && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary" display="block">
                                            Notes
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                            "{pet.notes}"
                                          </Typography>
                                        </Box>
                                      )}
                                    </Stack>
                                  </Box>
                                </Collapse>
                              </Stack>
                            </CardContent>
                          </PetCard>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Sidebar - Appointments & Health Records */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={4}>
                {/* Upcoming Appointments */}
                <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
                      Upcoming Appointments
                    </Typography>
                    <Stack spacing={2}>
                      {appointments.map((appointment) => (
                        <Paper 
                          key={appointment.id}
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: alpha(getAppointmentStatusColor(appointment.status), 0.2),
                            background: alpha(getAppointmentStatusColor(appointment.status), 0.05),
                          }}
                        >
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" fontWeight="600">
                                {appointment.petName}
                              </Typography>
                              <Chip 
                                label={appointment.status}
                                size="small"
                                sx={{ 
                                  background: getAppointmentStatusColor(appointment.status),
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.type}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {appointment.date} • {appointment.time}
                              </Typography>
                              <IconButton size="small">
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                    <Button
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/owner/appointments/new')}
                      sx={{ mt: 3 }}
                    >
                      Schedule New Appointment
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Health Records */}
                <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
                      Recent Health Records
                    </Typography>
                    <List disablePadding>
                      {healthRecords.map((record) => (
                        <ListItem 
                          key={record.id}
                          disablePadding
                          sx={{ mb: 2 }}
                        >
                          <Paper sx={{ width: '100%', p: 2, borderRadius: 2 }}>
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" fontWeight="600">
                                  {record.petName}
                                </Typography>
                                <Chip 
                                  label={record.type}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {record.vaccine || record.medication || record.findings}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {record.date} • Next: {record.nextDue}
                              </Typography>
                            </Stack>
                          </Paper>
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      fullWidth
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate('/owner/medical-records')}
                      sx={{ mt: 2 }}
                    >
                      View All Records
                    </Button>
                  </CardContent>
                </Card>

                {/* Emergency Contacts */}
                <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#92400E' }}>
                      Emergency Contacts
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#92400E' }}>
                          24/7 Vet Emergency
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#92400E' }}>
                          📞 (555) 123-4567
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#92400E' }}>
                          Pet Poison Helpline
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#92400E' }}>
                          📞 (555) 987-6543
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<LocalHospitalIcon />}
                        sx={{ 
                          background: '#92400E',
                          '&:hover': { background: '#78350F' }
                        }}
                      >
                        Emergency Help
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>

          {/* Edit Profile Dialog */}
          <Dialog 
            open={openEditProfile} 
            onClose={() => setOpenEditProfile(false)} 
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              py: 3,
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
            }}>
              <Typography variant="h5" fontWeight="700" textAlign="center">
                Edit Profile
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    src={editForm.profilePicture}
                    sx={{
                      width: 140,
                      height: 140,
                      mb: 2,
                      border: '4px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {editForm.firstName?.charAt(0)}
                    {editForm.lastName?.charAt(0)}
                  </Avatar>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    JPG, PNG up to 5MB
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 4, pb: 4 }}>
              <Button 
                onClick={() => setOpenEditProfile(false)}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateProfile}
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8, #6a4090)',
                  }
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        </ContentArea>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8, #6a4090)',
            }
          }}
          onClick={() => navigate('/owner/pets/new')}
        >
          <AddIcon />
        </Fab>
      </DashboardContainer>
    </>
  );
};

export default OwnerDashboard;