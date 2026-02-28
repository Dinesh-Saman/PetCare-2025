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
  Select,
  MenuItem,
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
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';

// ────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  padding: '90px 24px 80px',
  [theme.breakpoints.up('md')]: {
    padding: '110px 40px 100px',
  },
}));

const ContentArea = styled(Box)(({ theme }) => ({
  maxWidth: '1600px',
  margin: '0 auto',
}));

const WelcomeCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.25)',
  marginBottom: '40px',
  position: 'relative',
  overflow: 'visible',
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
  border: '1px solid rgba(102, 126, 234, 0.12)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.18)',
    borderColor: '#667eea',
  },
}));

const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: '16px',
  padding: '24px',
  background: theme.palette.background.paper,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid',
  borderColor: color ? `rgba(${color.replace('#', '')}, 0.12)` : 'rgba(102, 126, 234, 0.12)',
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
    background: color ? `linear-gradient(90deg, ${color}33, ${color})` : 'linear-gradient(90deg, #667eea, #764ba2)',
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
  background:
    status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' :
    status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' :
    'rgba(239, 68, 68, 0.1)',
  color:
    status === 'Approved' ? '#10B981' :
    status === 'Pending' ? '#F59E0B' :
    '#EF4444',
  border:
    status === 'Approved' ? '1px solid rgba(16, 185, 129, 0.2)' :
    status === 'Pending' ? '1px solid rgba(245, 158, 11, 0.2)' :
    '1px solid rgba(239, 68, 68, 0.2)',
}));

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPet, setExpandedPet] = useState(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openEditPet, setOpenEditPet] = useState(false);
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
        setLoading(true);

        const token = localStorage.getItem('owner_token');
        const ownerDataStr = localStorage.getItem('owner_user');

        if (!token || !ownerDataStr) {
          navigate('/owner/login');
          return;
        }

        const ownerData = JSON.parse(ownerDataStr);
        setOwner(ownerData);
        setEditForm({
          firstName: ownerData.firstName || '',
          lastName: ownerData.lastName || '',
          phoneNumber: ownerData.phoneNumber || '',
          address: ownerData.address || '',
          email: ownerData.email || '',
        });

        const petsRes = await api.get('/pets/my');
        const petsData = petsRes.data.pets || petsRes.data || [];
        setPets(petsData);

        const approved = petsData.filter(p => p.registrationStatus === 'Approved').length;
        const pending = petsData.filter(p => p.registrationStatus === 'Pending').length;

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
      microchipNumber: pet.microchipNumber || '',
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
                    onClick={() => navigate('/owner/pets/new')}
                    size="large"
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { 
                        background: 'rgba(255,255,255,0.3)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Add New Pet
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenEditProfile(true)}
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { 
                        borderColor: 'white', 
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Edit Profile
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
          <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', mb: 6 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="700">
                  My Pets ({pets.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/owner/pets/new')}
                  sx={{ 
                    minWidth: 140,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8, #6a4090)',
                    }
                  }}
                >
                  Add Pet
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
                    onClick={() => navigate('/owner/pets/new')}
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
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={2.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={pet.photo}
                                sx={{
                                  width: 72,
                                  height: 72,
                                  border: '3px solid',
                                  borderColor: getStatusColor(pet.registrationStatus),
                                  fontSize: 32,
                                  bgcolor: getStatusColor(pet.registrationStatus) + '20',
                                }}
                              >
                                {pet.name?.charAt(0)?.toUpperCase() || 'P'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="h6" fontWeight="700" noWrap>
                                    {pet.name || 'Unnamed'}
                                  </Typography>
                                  <StatusBadge status={pet.registrationStatus || 'Pending'}>
                                    {pet.registrationStatus === 'Approved' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> :
                                     pet.registrationStatus === 'Pending' ? <PendingIcon sx={{ fontSize: 14 }} /> :
                                     <WarningIcon sx={{ fontSize: 14 }} />}
                                    {pet.registrationStatus || 'Pending'}
                                  </StatusBadge>
                                </Box>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {pet.species || '—'} • {pet.breed || 'Mixed'}
                                </Typography>
                              </Box>
                            </Box>

                            <Grid container spacing={1.5}>
                              <Grid item xs={6}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {pet.gender === 'Male' ? <MaleIcon sx={{ color: '#3B82F6', fontSize: 18 }} /> : <FemaleIcon sx={{ color: '#EC4899', fontSize: 18 }} />}
                                  <Typography variant="body2">{pet.gender || '—'}</Typography>
                                </Stack>
                              </Grid>
                              <Grid item xs={6}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <CalendarTodayIcon sx={{ color: '#10B981', fontSize: 18 }} />
                                  <Typography variant="body2">{calculateAge(pet.dateOfBirth)}</Typography>
                                </Stack>
                              </Grid>
                            </Grid>

                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              pt: 1.5,
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
                              >
                                {expandedPet === pet._id ? 'Less' : 'Details'}
                              </Button>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenEditPet(pet)}
                                    sx={{ color: '#F59E0B' }}
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

                            <Collapse in={expandedPet === pet._id}>
                              <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                <Stack spacing={1.5}>
                                  {pet.microchipNumber && (
                                    <Typography variant="body2">
                                      <strong>Microchip:</strong> {pet.microchipNumber}
                                    </Typography>
                                  )}
                                  {pet.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                      "{pet.notes}"
                                    </Typography>
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

          {/* Edit Profile Dialog (still MUI) */}
          <Dialog 
            open={openEditProfile} 
            onClose={() => setOpenEditProfile(false)} 
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              py: 3,
              textAlign: 'center'
            }}>
              <Typography variant="h5" fontWeight="700">
                Edit Profile
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ 
              pt: 8,
              pb: 6,
              px: { xs: 3, sm: 4 }
            }}>
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
                      sx={{ mt: 1 }}
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
                      sx={{ mt: 1 }}
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
            </DialogContent>
            <DialogActions 
              sx={{ 
                px: 4, 
                pb: 6,
                pt: 2 
              }}
            >
              <Button 
                onClick={() => setOpenEditProfile(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateProfile}
                sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* ────────────────────────────────────────────────
              Edit Pet Dialog – NOW PURE HTML + CUSTOM CSS
          ──────────────────────────────────────────────── */}
          {openEditPet && selectedPet && (
            <div className="edit-pet-modal-overlay" onClick={() => setOpenEditPet(false)}>
              <div className="edit-pet-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <span className="modal-icon">🐾</span>
                  <h2 className="modal-title">Edit Pet Profile</h2>
                  <p className="modal-subtitle">
                    Update {selectedPet.name || 'your pet'}'s information
                  </p>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setOpenEditPet(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdatePet(); }}>
                    <div className="form-grid">
                      <div className="field-group">
                        <label htmlFor="edit-name">Pet Name *</label>
                        <div className="input-wrapper">
                          <span className="input-icon">🐱</span>
                          <input
                            id="edit-name"
                            name="name"
                            value={editPetForm.name}
                            onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })}
                            required
                            placeholder="Pet name"
                          />
                        </div>
                      </div>

                      <div className="field-group">
                        <label htmlFor="edit-species">Species *</label>
                        <input
                          id="edit-species"
                          name="species"
                          value={editPetForm.species}
                          onChange={(e) => setEditPetForm({ ...editPetForm, species: e.target.value })}
                          required
                          placeholder="Dog, Cat, Rabbit..."
                        />
                      </div>

                      <div className="field-group">
                        <label htmlFor="edit-breed">Breed (optional)</label>
                        <input
                          id="edit-breed"
                          name="breed"
                          value={editPetForm.breed}
                          onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })}
                          placeholder="Golden Retriever, Siamese..."
                        />
                      </div>

                      <div className="field-group">
                        <label htmlFor="edit-gender">Gender</label>
                        <select
                          id="edit-gender"
                          name="gender"
                          value={editPetForm.gender}
                          onChange={(e) => setEditPetForm({ ...editPetForm, gender: e.target.value })}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="field-group">
                        <label htmlFor="edit-dob">Date of Birth</label>
                        <div className="input-wrapper">
                          <span className="input-icon">📅</span>
                          <input
                            id="edit-dob"
                            name="dateOfBirth"
                            type="date"
                            value={editPetForm.dateOfBirth}
                            onChange={(e) => setEditPetForm({ ...editPetForm, dateOfBirth: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="field-group">
                        <label htmlFor="edit-weight">Weight (kg)</label>
                        <div className="input-wrapper">
                          <span className="input-icon">⚖️</span>
                          <input
                            id="edit-weight"
                            name="weight"
                            type="number"
                            step="0.1"
                            value={editPetForm.weight}
                            onChange={(e) => setEditPetForm({ ...editPetForm, weight: e.target.value })}
                            placeholder="e.g. 12.5"
                          />
                        </div>
                      </div>

                      <div className="field-group">
                        <label htmlFor="edit-color">Color / Markings</label>
                        <div className="input-wrapper">
                          <span className="input-icon">🎨</span>
                          <input
                            id="edit-color"
                            name="color"
                            value={editPetForm.color}
                            onChange={(e) => setEditPetForm({ ...editPetForm, color: e.target.value })}
                            placeholder="Black & White, Ginger..."
                          />
                        </div>
                      </div>

                      <div className="field-group">
                        <label htmlFor="edit-microchip">Microchip Number</label>
                        <input
                          id="edit-microchip"
                          name="microchipNumber"
                          value={editPetForm.microchipNumber}
                          onChange={(e) => setEditPetForm({ ...editPetForm, microchipNumber: e.target.value })}
                          placeholder="985123456789012"
                        />
                      </div>

                      <div className="field-group full-width">
                        <label htmlFor="edit-photo">Photo URL (optional)</label>
                        <div className="input-wrapper">
                          <span className="input-icon">📷</span>
                          <input
                            id="edit-photo"
                            name="photo"
                            value={editPetForm.photo}
                            onChange={(e) => setEditPetForm({ ...editPetForm, photo: e.target.value })}
                            placeholder="https://example.com/pet.jpg"
                          />
                        </div>
                      </div>

                      <div className="field-group full-width">
                        <label htmlFor="edit-notes">Additional Notes</label>
                        <div className="input-wrapper notes-wrapper">
                          <span className="input-icon top">📝</span>
                          <textarea
                            id="edit-notes"
                            name="notes"
                            value={editPetForm.notes}
                            onChange={(e) => setEditPetForm({ ...editPetForm, notes: e.target.value })}
                            rows={4}
                            placeholder="Medical history, allergies, behavior notes..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setOpenEditPet(false)}
                        disabled={savingPet}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`save-btn ${savingPet ? 'loading' : ''}`}
                        disabled={savingPet}
                      >
                        {savingPet ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

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
            onClick={() => navigate('/owner/pets/new')}
          >
            <AddIcon />
          </Fab>
        </ContentArea>
      </DashboardContainer>

      {/* ────────────────────────────────────────────────
          Custom CSS for Edit Pet Modal
      ──────────────────────────────────────────────── */}
      <style>{`
        .edit-pet-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1400;
          padding: 20px;
          overflow-y: auto;
        }

        .edit-pet-modal {
          width: 100%;
          max-width: 820px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 70px rgba(0,0,0,0.25);
          overflow: hidden;
          position: relative;
          max-height: 95vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          background: linear-gradient(90deg, #2196f3, #21cbf3);
          color: white;
          padding: 40px 32px;
          text-align: center;
          position: relative;
        }

        .modal-icon {
          font-size: 70px;
          display: block;
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 2.3rem;
          font-weight: 700;
          margin: 0 0 10px;
        }

        .modal-subtitle {
          font-size: 1.15rem;
          opacity: 0.92;
          margin: 0;
        }

        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 24px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 28px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: rgba(255,255,255,0.4);
        }

        .modal-body {
          padding: 40px;
          overflow-y: auto;
          flex: 1;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-group.full-width {
          grid-column: 1 / -1;
        }

        .field-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 1.3rem;
          pointer-events: none;
        }

        .input-icon.top {
          top: 14px;
          transform: none;
        }

        input, select, textarea {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 3px rgba(33,150,243,0.15);
        }

        textarea {
          resize: vertical;
          min-height: 110px;
          padding-top: 12px;
          padding-left: 48px;
        }

        .notes-wrapper textarea {
          padding-top: 40px;
        }

        select {
          padding-left: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 12px;
          appearance: none;
        }

        .modal-actions {
          display: flex;
          justify-content: center;
          gap: 24px;
          padding: 24px 40px;
          border-top: 1px solid #e5e7eb;
        }

        .save-btn, .cancel-btn {
          padding: 14px 48px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1rem;
          min-width: 220px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .save-btn {
          background: linear-gradient(90deg, #2196f3, #21cbf3);
          color: white;
          border: none;
          box-shadow: 0 6px 20px rgba(33,150,243,0.25);
        }

        .save-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #1976d2, #00bcd4);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(33,150,243,0.35);
        }

        .save-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: transparent;
          border: 2px solid #2196f3;
          color: #2196f3;
        }

        .cancel-btn:hover:not(:disabled) {
          background: rgba(33,150,243,0.08);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .modal-body {
            padding: 32px 24px;
          }
          .modal-actions {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default OwnerDashboard;