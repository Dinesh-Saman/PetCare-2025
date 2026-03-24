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
  Paper,
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
  background: '#f8fafc',
  padding: '100px 24px 80px',
  fontFamily: "'Inter', sans-serif",
  [theme.breakpoints.up('md')]: {
    padding: '120px 40px 100px',
  },
}));

const ContentContainer = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  padding: '32px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
  minHeight: '80vh',
  width: '100%',
  boxSizing: 'border-box'
}));

const StatsCard = styled(Box)(({ theme, color = '#4f46e5' }) => ({
  background: '#f8fafc',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  transition: 'transform 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    border: `1px solid ${alpha(color, 0.2)}`,
  }
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  width: '52px',
  height: '52px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: alpha(color, 0.1),
  color: color,
}));

const PetCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
  }
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

const ContentArea = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
}));

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser, loading: authLoading } = useAuth();

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
    rejectedPets: 0,
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
  const [activeTab, setActiveTab] = useState(0);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [tfaLoading, setTfaLoading] = useState(false);

  const setup2FA = async () => {
    try {
      setTfaLoading(true);
      const { data } = await api.post('/auth/2fa/setup');
      setTwoFactorData(data);
    } catch (err) {
      Swal.fire('Error', 'Failed to initiate 2FA setup', 'error');
    } finally {
      setTfaLoading(false);
    }
  };

  const disable2FA = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Disabling 2FA reduces your account security.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, disable it!'
    });

    if (result.isConfirmed) {
      try {
        setTfaLoading(true);
        await api.post('/auth/2fa/disable');
        Swal.fire('Disabled', '2FA has been disabled.', 'success');
        const profileRes = await api.get('/auth/me');
        const ownerWithRole = { ...profileRes.data.user, role: 'owner' };
        setOwner(ownerWithRole);
        updateUser(ownerWithRole);
      } catch (err) {
        Swal.fire('Error', 'Failed to disable 2FA', 'error');
      } finally {
        setTfaLoading(false);
      }
    }
  };

  const enable2FA = async () => {
    if (!twoFactorToken) return;
    try {
      setTfaLoading(true);
      const { data } = await api.post('/auth/2fa/verify', { token: twoFactorToken, role: 'owner' });
      if (data.success) {
        Swal.fire('Success', 'Two-factor authentication enabled!', 'success');
        setTwoFactorData(null);
        setTwoFactorToken('');
        const profileRes = await api.get('/auth/me');
        const ownerWithRole = { ...profileRes.data.user, role: 'owner' };
        setOwner(ownerWithRole);
        updateUser(ownerWithRole);
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Verification failed', 'error');
    } finally {
      setTfaLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to finish loading before determining if user is logged in
    if (authLoading) return;

    // Redirect to home if not logged in
    if (!user?.id) {
      navigate('/');
      return;
    }

    const fetchOwnerData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Owner Profile
        const ownerRes = await api.get(`/owners/${user.id}`);
        const ownerData = ownerRes.data;
        setOwner(ownerData);
        setEditForm({
          firstName: ownerData.firstName || '',
          lastName: ownerData.lastName || '',
          phoneNumber: ownerData.phoneNumber || '',
          address: ownerData.address || '',
          email: ownerData.email || '',
        });

        // 2. Fetch User's Pets
        const petsRes = await api.get('/pets/my');
        const petsData = petsRes.data.pets || petsRes.data || [];
        setPets(petsData);

        // 3. Calculate Stats
        const approved = petsData.filter(p => p.registrationStatus === 'Approved').length;
        const pending = petsData.filter(p => p.registrationStatus === 'Pending').length;
        const rejected = petsData.filter(p => p.registrationStatus === 'Rejected').length;

        setStats({
          totalPets: petsData.length,
          approvedPets: approved,
          pendingPets: pending,
          rejectedPets: rejected,
          vetVisits: petsData.reduce((acc, pet) => acc + (pet.vetVisits || 0), 0),
          healthScore: Math.min(100, Math.max(50, 85 - pending * 5)),
        });

      } catch (error) {
        console.error('Error loading dashboard:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Unable to load dashboard data. Please try again.',
          icon: 'error',
          confirmButtonColor: '#667eea',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [user, authLoading, navigate]);

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
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editForm.email && !emailRegex.test(editForm.email)) {
      Swal.fire('Error', 'Please enter a valid email address', 'error');
      return;
    }

    // Validate Phone Number
    const phoneRegex = /^(?:0|94|\+94)?\d{9}$/;
    const genericPhoneRegex = /^\d{10}$/;
    const cleanPhone = editForm.phoneNumber?.replace(/[\s-]/g, '') || '';
    if (cleanPhone && !phoneRegex.test(cleanPhone) && !genericPhoneRegex.test(cleanPhone)) {
      Swal.fire('Error', 'Please enter a valid 10-digit phone number', 'error');
      return;
    }

    try {
      const response = await api.put(`/owners/${owner._id || owner.id}`, editForm);
      const updatedOwner = response.data.owner;

      // Ensure we preserve the role for AuthContext and Navbar logic
      const ownerWithRole = { ...updatedOwner, role: 'owner' };

      setOwner(ownerWithRole);
      updateUser(ownerWithRole); // Synchronize with AuthContext
      setOpenEditProfile(false);

      Swal.fire({
        title: 'Success',
        text: 'Profile updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
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

  return (
    <>
      <Navbar />
      <DashboardContainer>
        <ContentArea>
          {/* Welcome Section */}
          <ContentContainer>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b', mb: 1 }}>
                  Welcome back, {owner?.firstName}
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem' }}>
                  Here's an overview of your registered pets and their status
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button variant="outlined" onClick={() => setOpenEditProfile(true)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                  Manage Profile
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddPet(true)} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, background: '#49149e', '&:hover': { background: '#3b0c82' } }}>
                  Add Pet
                </Button>
              </Stack>
            </Box>

            <Box sx={{ height: '1px', bgcolor: '#e2e8f0', mb: 4 }} />

            {/* Stats Overview */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 6
            }}>
              <StatsCard color="#4f46e5">
                <IconWrapper color="#4f46e5">
                  <PetsIcon />
                </IconWrapper>
                <Box>
                  <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
                    {stats.totalPets}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Total Pets</Typography>
                </Box>
              </StatsCard>

              <StatsCard color="#10b981">
                <IconWrapper color="#10b981">
                  <CheckCircleIcon />
                </IconWrapper>
                <Box>
                  <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
                    {stats.approvedPets}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Approved</Typography>
                </Box>
              </StatsCard>

              <StatsCard color="#F59E0B">
                <IconWrapper color="#F59E0B">
                  <PendingIcon />
                </IconWrapper>
                <Box>
                  <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
                    {stats.pendingPets}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Pending</Typography>
                </Box>
              </StatsCard>

              <StatsCard color="#EF4444">
                <IconWrapper color="#EF4444">
                  <WarningIcon />
                </IconWrapper>
                <Box>
                  <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
                    {stats.rejectedPets}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Rejected</Typography>
                </Box>
              </StatsCard>
            </Box>

            {/* My Pets Section */}
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexWrap: 'wrap', gap: 3 }}>
                <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b' }}>
                  My Pets <PetsIcon sx={{ verticalAlign: 'middle', ml: 1, color: '#4f46e5' }} />
                </Typography>
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
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: '#49149e',
                      px: 5,
                      py: 1.5,
                      '&:hover': {
                        background: '#3b0c82',
                      }
                    }}
                  >
                    Add Pet
                  </Button>
                </Box>
              ) : (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(3, 1fr)' },
                  gap: 3
                }}>
                  {pets.map((pet) => (
                    <Box key={pet._id} sx={{ height: '100%' }}>
                      <PetCard sx={{ position: 'relative' }}>
                        <IconButton
                          onClick={() => handleDeletePet(pet._id, pet.name)}
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            color: '#ef4444',
                            bgcolor: 'rgba(239, 68, 68, 0.05)',
                            '&:hover': {
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                              color: '#b91c1c'
                            }
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, gap: 1.5 }}>
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
                            <Box sx={{ bgcolor: 'white', borderRadius: '30px' }}>
                              <StatusBadge status={pet.registrationStatus || 'Pending'} sx={{ mb: 0, fontSize: '0.7rem', px: 1.5, py: 0.5 }}>
                                {pet.registrationStatus === 'Approved' ? <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5 }} /> :
                                  pet.registrationStatus === 'Pending' ? <PendingIcon sx={{ fontSize: 14, mr: 0.5 }} /> :
                                    <WarningIcon sx={{ fontSize: 14, mr: 0.5 }} />}
                                {pet.registrationStatus || 'Pending'}
                              </StatusBadge>
                            </Box>
                          </Box>

                          <Typography variant="h5" fontWeight="800" sx={{ mt: 2, mb: 1, color: '#1f2937' }} noWrap>
                            {pet.name || 'Unnamed'}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }} noWrap>
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
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </ContentContainer>

          {/* Edit Profile Dialog */}
          <Dialog
            open={openEditProfile}
            onClose={() => { setOpenEditProfile(false); setTwoFactorData(null); setTwoFactorToken(''); }}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: '16px' } }}
          >
            <DialogTitle sx={{ p: 4, pb: 1 }}>
              <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>Edit Profile</Typography>
              <Typography variant="body2" color="text.secondary">Manage your account settings and security</Typography>
            </DialogTitle>

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
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editForm.phoneNumber}
                    onChange={(e) => { const v = e.target.value; if (v.length <= 10 && (v === '' || /^\d+$/.test(v))) setEditForm({ ...editForm, phoneNumber: v }) }}
                  />

                  <TextField
                    fullWidth
                    label="Address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    multiline
                    rows={3}
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
          </Dialog>

          {/* Edit Pet Dialog */}
          <Dialog
            open={openEditPet}
            onClose={() => setOpenEditPet(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: '16px' } }}
          >
            <DialogTitle sx={{ p: 4, pb: 1 }}>
              <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>Edit {selectedPet?.name}</Typography>
              <Typography variant="body2" color="text.secondary">Update your furry friend's information</Typography>
            </DialogTitle>

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
                    inputProps={{
                      max: new Date().toISOString().split('T')[0]
                    }}
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
                            const response = await fetch('https://api.cloudinary.com/v1_1/dy78lcfqg/image/upload', {
                              method: 'POST',
                              body: formData,
                            });
                            const data = await response.json();
                            setEditPetForm({ ...editPetForm, photo: data.secure_url });
                            Swal.fire({
                              title: 'Success!',
                              text: 'Pet image uploaded successfully',
                              icon: 'success',
                              timer: 1500,
                              showConfirmButton: false
                            });
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
          </Dialog>

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