// src/pages/owner/OwnerDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Skeleton,
  IconButton,
  InputAdornment,
  Fab,
  Tooltip,
  Collapse,
  FormControl,
  InputLabel,
  Switch,
  Tabs,
  Tab,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
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
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import AddPetModal from './AddPet';
import { useAuth } from '../../context/AuthContext';

// ────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
  padding: '100px 24px 80px',
  [theme.breakpoints.up('md')]: {
    padding: '120px 40px 100px',
  },
}));

const WelcomeCard = styled(Card)(({ theme }) => ({
  borderRadius: '32px',
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  color: 'white',
  boxShadow: '0 20px 50px rgba(79, 70, 229, 0.3)',
  marginBottom: '48px',
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
  },
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
  },
}));

const PetCard = styled(GlassCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const StatsCard = styled(GlassCard)(({ theme, color }) => ({
  padding: '28px',
  height: '100%',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '6px',
    height: '100%',
    background: color || '#4f46e5',
  },
}));

const StatusBadge = styled(Box)(({ theme, status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 14px',
  borderRadius: '30px',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  background: status === 'Approved' ? alpha('#10b981', 0.15) :
    status === 'Pending' ? alpha('#f59e0b', 0.15) : alpha('#ef4444', 0.15),
  color: status === 'Approved' ? '#059669' :
    status === 'Pending' ? '#d97706' : '#dc2626',
  border: `1px solid ${status === 'Approved' ? alpha('#10b981', 0.3) :
    status === 'Pending' ? alpha('#f59e0b', 0.3) : alpha('#ef4444', 0.3)}`,
}));

const GlassDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    borderRadius: '32px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  },
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  padding: '40px 32px',
  color: 'white',
  textAlign: 'center',
  position: 'relative',
}));

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPet, setExpandedPet] = useState(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openEditPet, setOpenEditPet] = useState(false);
  const [openAddPet, setOpenAddPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [stats, setStats] = useState({
    totalPets: 0,
    approvedPets: 0,
    pendingPets: 0,
    vetVisits: 0,
    healthScore: 85,
  });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    email: '',
  });
  const [editPetForm, setEditPetForm] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: '',
    color: '',
    weight: '',
    microchipNumber: '',
    photo: '',
    notes: ''
  });
  const [savingPet, setSavingPet] = useState(false);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {

        setStats({
          totalPets: petsData.length,
          approvedPets: approved,
          pendingPets: pending,
          vetVisits: petsData.reduce((acc, pet) => acc + (pet.vetVisits || 0), 0),
          healthScore: Math.min(100, Math.max(50, 85 - pending * 5)),
        });

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
      const response = await api.put(`/owners/${owner._id || owner.id}`, editForm);
      setOwner(response.data);
      localStorage.setItem('owner_user', JSON.stringify(response.data));
      setOpenEditProfile(false);
      Swal.fire('Success', 'Profile updated successfully', 'success');
    } catch (error) {
      console.error('Update profile error:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleOpenEditPet = (pet) => {
    setSelectedPet(pet);
    setEditPetForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      dateOfBirth: pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : '',
      gender: pet.gender || '',
      color: pet.color || '',
      weight: pet.weight || '',
      photo: pet.photo || '',
      notes: pet.notes || ''
    });
    setOpenEditPet(true);
  };

  const handleUpdatePet = async () => {
    if (!editPetForm.name.trim() || !editPetForm.species.trim()) {
      Swal.fire('Error', 'Pet name and species are required', 'warning');
      return;
    }

    setSavingPet(true);

    try {
      const response = await api.put(`/pets/${selectedPet._id}`, editPetForm);

      setPets(pets.map(pet =>
        pet._id === selectedPet._id ? { ...pet, ...response.data } : pet
      ));

      Swal.fire({
        title: 'Updated!',
        text: `${editPetForm.name}'s profile has been updated`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      setOpenEditPet(false);
      setSelectedPet(null);
    } catch (error) {
      console.error('Error updating pet:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Could not update pet profile',
        'error'
      );
    } finally {
      setSavingPet(false);
    }
  };

  const togglePetExpand = (petId) => {
    setExpandedPet(expandedPet === petId ? null : petId);
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

  if (loading) {
    return (
      <DashboardContainer>
        <ContentArea>
          <Stack spacing={5}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
            <Grid container spacing={3}>
              {Array(6).fill(0).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                  <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Skeleton variant="rounded" height={500} sx={{ borderRadius: 4 }} />
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
            <CardContent sx={{ p: { xs: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
              <Box>
                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: '-0.5px', mb: 2 }}>
                  Welcome back, {owner?.firstName} 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
                  Here's an overview of your registered pets and their status
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddPet(true)}
                    size="large"
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '16px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    Add Pawpal
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenEditProfile(true)}
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.4)',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(5px)',
                      color: 'white',
                      borderRadius: '16px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Manage Profile
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </WelcomeCard>

          {/* Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={6} sm={6} md={4} lg={2}>
              <StatsCard>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">Total Pets</Typography>
                  <Typography variant="h3" fontWeight="800" color="#667eea">
                    {stats.totalPets}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                      height: 6,
                      borderRadius: 4,
                      backgroundColor: 'rgba(102,126,234,0.12)',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#667eea' }
                    }}
                  />
                </Stack>
              </StatsCard>
            </Grid>

            <Grid item xs={6} sm={6} md={4} lg={2}>
              <StatsCard color="#10B981">
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">Approved</Typography>
                  <Typography variant="h3" fontWeight="800" color="#10B981">
                    {stats.approvedPets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.totalPets > 0 ? `${((stats.approvedPets / stats.totalPets) * 100).toFixed(0)}%` : '0%'}
                  </Typography>
                </Stack>
              </StatsCard>
            </Grid>

            <Grid item xs={6} sm={6} md={4} lg={2}>
              <StatsCard color="#F59E0B">
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
                  <Typography variant="h3" fontWeight="800" color="#F59E0B">
                    {stats.pendingPets}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Awaiting approval</Typography>
                </Stack>
              </StatsCard>
            </Grid>
          </Grid>

          {/* My Pets Section */}
          <GlassCard sx={{ mb: 6 }}>
            <CardContent sx={{ p: { xs: 4, md: 5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexWrap: 'wrap', gap: 3 }}>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#1e293b' }}>
                  Your Pawpals <PetsIcon sx={{ verticalAlign: 'middle', ml: 1, color: '#4f46e5' }} />
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddPet(true)}
                  sx={{
                    borderRadius: '50px',
                    px: 4,
                    py: 1.2,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Register New Pet
                </Button>
              </Box>

              {pets.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 32px',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PetsIcon sx={{ fontSize: 60, color: '#667eea', opacity: 0.6 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600" color="text.secondary" gutterBottom>
                    No pets registered yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
                    Add your pets to manage their profiles, health records, and appointments
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddPet(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      px: 5,
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8, #6a4090)',
                      }
                    }}
                  >
                    Register First Pet
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {pets.map((pet) => (
                    <Grid item xs={12} sm={6} md={4} key={pet._id}>
                      <PetCard>
                        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            <Avatar
                              src={pet.photo}
                              sx={{
                                width: 100,
                                height: 100,
                                border: '4px solid',
                                borderColor: getStatusColor(pet.registrationStatus),
                                fontSize: 40,
                                bgcolor: getStatusColor(pet.registrationStatus) + '20',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                              }}
                            >
                              {pet.name?.charAt(0)?.toUpperCase() || 'P'}
                            </Avatar>
                            <Box sx={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)' }}>
                              <StatusBadge status={pet.registrationStatus || 'Pending'} sx={{ mb: 0, fontSize: '0.75rem', px: 1.5, py: 0.5 }}>
                                {pet.registrationStatus === 'Approved' ? <CheckCircleIcon sx={{ fontSize: 12 }} /> :
                                  pet.registrationStatus === 'Pending' ? <PendingIcon sx={{ fontSize: 12 }} /> :
                                    <WarningIcon sx={{ fontSize: 12 }} />}
                                {pet.registrationStatus || 'Pending'}
                              </StatusBadge>
                            </Box>
                          </Box>

                          <Typography variant="h5" fontWeight="800" sx={{ mt: 2, mb: 1, color: '#1f2937' }} noWrap>
                            {pet.name || 'Unnamed'}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} noWrap>
                            {pet.species || '—'}
                          </Typography>

                          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="medium"
                              fullWidth
                              onClick={() => navigate(`/owner/pets/${pet._id}`)}
                              sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: '600',
                                borderColor: '#e5e7eb',
                                color: '#4b5563',
                                '&:hover': {
                                  borderColor: '#2196f3',
                                  color: '#2196f3',
                                  bgcolor: 'transparent'
                                }
                              }}
                            >
                              View Profile
                            </Button>
                          </Box>
                        </CardContent>
                      </PetCard>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </GlassCard>

          {/* Edit Profile Dialog */}
          <GlassDialog
            open={openEditProfile}
            onClose={() => { setOpenEditProfile(false); setTwoFactorData(null); setTwoFactorToken(''); }}
            maxWidth="sm"
            fullWidth
          >
            <ModalHeader>
              <Avatar sx={{ width: 70, height: 70, bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 2 }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="800">Edit Profile</Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Manage your account settings and security</Typography>
            </ModalHeader>

            <DialogContent sx={{ p: 4 }}>
              <Tabs
                value={activeTab}
                onChange={(e, v) => { setActiveTab(v); setTwoFactorData(null); }}
                variant="fullWidth"
                sx={{
                  mb: 4,
                  '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '1rem' },
                  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                }}
              >
                <Tab label="Profile Details" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
              </Tabs>
              {activeTab === 0 ? (
                <Stack spacing={4} sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
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
                          startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment>,
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
                      startAdornment: <InputAdornment position="start"><LocationOnIcon color="action" /></InputAdornment>,
                    }}
                  />
                </Stack>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <SecurityIcon color="primary" /> Two-Factor Authentication
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Enhance your account security by requiring a 6-digit code from your authenticator app when you sign in.
                  </Typography>

                  <Box sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: owner?.isTwoFactorEnabled ? alpha('#10B981', 0.05) : alpha('#64748b', 0.05),
                    border: '1px solid',
                    borderColor: owner?.isTwoFactorEnabled ? alpha('#10B981', 0.2) : alpha('#64748b', 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {owner?.isTwoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {owner?.isTwoFactorEnabled
                          ? 'Your account is protected with an extra layer of security.'
                          : 'We recommend enabling this for better protection.'}
                      </Typography>
                    </Box>
                    <Switch
                      checked={!!owner?.isTwoFactorEnabled}
                      onChange={(e) => e.target.checked ? setup2FA() : disable2FA()}
                      disabled={tfaLoading}
                      color="success"
                    />
                  </Box>

                  {twoFactorData && !owner?.isTwoFactorEnabled && (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Step 1: Scan this QR code with Google Authenticator
                      </Typography>
                      <Box sx={{
                        p: 2,
                        display: 'inline-block',
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        mb: 3
                      }}>
                        <img src={twoFactorData.qrCode} alt="2FA QR Code" style={{ width: 180, height: 180 }} />
                      </Box>

                      <Typography variant="subtitle2" gutterBottom>
                        Step 2: Enter the 6-digit code to verify
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                        <TextField
                          size="small"
                          label="6-digit code"
                          value={twoFactorToken}
                          onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          sx={{ width: 160 }}
                        />
                        <Button
                          variant="contained"
                          onClick={enable2FA}
                          disabled={twoFactorToken.length !== 6 || tfaLoading}
                          sx={{ background: '#10B981' }}
                        >
                          Verify
                        </Button>
                      </Box>
                      <Button size="small" variant="text" color="error" onClick={() => setTwoFactorData(null)}>
                        Cancel Setup
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 4, pt: 0 }}>
              <Button
                onClick={() => { setOpenEditProfile(false); setTwoFactorData(null); setTwoFactorToken(''); }}
                sx={{ borderRadius: '12px', fontWeight: 700, color: 'text.secondary' }}
              >
                Cancel
              </Button>
              {activeTab === 0 && (
                <Button
                  variant="contained"
                  onClick={handleUpdateProfile}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    px: 4,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                    }
                  }}
                >
                  Save Changes
                </Button>
              )}
            </DialogActions>
          </GlassDialog>

          {/* Edit Pet Dialog */}
          <GlassDialog
            open={openEditPet}
            onClose={() => setOpenEditPet(false)}
            maxWidth="md"
            fullWidth
          >
            <ModalHeader>
              <Avatar src={selectedPet?.photo} sx={{ width: 80, height: 80, border: '4px solid rgba(255,255,255,0.3)', mx: 'auto', mb: 2 }}>
                <PetsIcon />
              </Avatar>
              <Typography variant="h4" fontWeight="800">Edit {selectedPet?.name}</Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Update your furry friend's information</Typography>
            </ModalHeader>

            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pet Name"
                    value={editPetForm.name}
                    onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Species"
                    value={editPetForm.species}
                    onChange={(e) => setEditPetForm({ ...editPetForm, species: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Breed"
                    value={editPetForm.breed}
                    onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <select
                      style={{
                        padding: '16.5px 14px',
                        borderRadius: '12px',
                        border: '1px solid #c4c4c4',
                        fontSize: '1rem',
                        background: 'transparent'
                      }}
                      value={editPetForm.gender}
                      onChange={(e) => setEditPetForm({ ...editPetForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={editPetForm.dateOfBirth}
                    onChange={(e) => setEditPetForm({ ...editPetForm, dateOfBirth: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    type="number"
                    value={editPetForm.weight}
                    onChange={(e) => setEditPetForm({ ...editPetForm, weight: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Color / Markings"
                    value={editPetForm.color}
                    onChange={(e) => setEditPetForm({ ...editPetForm, color: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={4}
                    value={editPetForm.notes}
                    onChange={(e) => setEditPetForm({ ...editPetForm, notes: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{
                      borderRadius: '12px',
                      py: 2,
                      borderStyle: 'dashed',
                      borderColor: '#4f46e5',
                      color: '#4f46e5'
                    }}
                  >
                    Change Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('upload_preset', 'petcare_preset');
                          try {
                            const response = await fetch('https://api.cloudinary.com/v1_1/dtt1ytuzj/image/upload', {
                              method: 'POST',
                              body: formData,
                            });
                            const data = await response.json();
                            setEditPetForm({ ...editPetForm, photo: data.secure_url });
                            Swal.fire({ title: 'Image Uploaded', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                          } catch (error) {
                            Swal.fire('Error', 'Failed to upload image', 'error');
                          }
                        }
                      }}
                    />
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 4, pt: 0 }}>
              <Button
                onClick={() => setOpenEditPet(false)}
                sx={{ borderRadius: '12px', fontWeight: 700, color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdatePet}
                disabled={savingPet}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  px: 4,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                  }
                }}
              >
                {savingPet ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </GlassDialog>

          {/* Floating Action Button */}
          <Fab
            color="primary"
            aria-label="add pet"
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8, #6a4090)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setOpenAddPet(true)}
          >
            <AddIcon />
          </Fab>

          <AddPetModal
            open={openAddPet}
            onClose={() => setOpenAddPet(false)}
            onPetAdded={(newPet) => {
              // Basic optimistic update or re-fetch logic:
              setPets([...pets, { ...newPet, _id: Date.now().toString(), registrationStatus: 'Pending' }]);
            }}
          />
        </ContentArea>
      </DashboardContainer>

    </>
  );
};

export default OwnerDashboard;