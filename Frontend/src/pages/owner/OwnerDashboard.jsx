// src/pages/owner/OwnerDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader, Avatar, Button,
  Paper, Divider, Collapse, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, LinearProgress,
  Fade, Grow, Zoom, Slide, Skeleton, Tabs, Tab, Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WarningIcon from '@mui/icons-material/Warning';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import Navbar from '../../components/Navbar';

// Enhanced Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #e8eeff 100%)',
  padding: '40px 20px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '400px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    clipPath: 'ellipse(100% 55% at 50% 0%)',
    zIndex: 0,
  },
}));

const ContentArea = styled(Box)(({ theme }) => ({
  maxWidth: '1400px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
}));

const WelcomeCard = styled(Card)(({ theme }) => ({
  borderRadius: '24px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(20px)',
  overflow: 'hidden',
  marginBottom: '40px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
  },
}));

const WelcomeHeader = styled(Box)(({ theme }) => ({
  padding: '48px 40px 32px',
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '24px',
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: '120px',
  height: '120px',
  border: '6px solid white',
  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  fontSize: '48px',
  fontWeight: 'bold',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05) rotate(5deg)',
    boxShadow: '0 20px 50px rgba(102, 126, 234, 0.4)',
  },
}));

const PetCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 24px 60px rgba(102, 126, 234, 0.2)',
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
}));

const PetAvatar = styled(Avatar)(({ theme, status }) => ({
  width: '100px',
  height: '100px',
  border: '4px solid white',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  background: status === 'Approved' ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' :
             status === 'Pending' ? 'linear-gradient(135deg, #FF9800, #FFB74D)' :
             'linear-gradient(135deg, #F44336, #E57373)',
  fontSize: '36px',
  fontWeight: 'bold',
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: '32px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 50px rgba(102, 126, 234, 0.15)',
  },
}));

const AddPetButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '18px 36px',
  borderRadius: '30px',
  fontWeight: '600',
  fontSize: '1.1rem',
  textTransform: 'none',
  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4090 100%)',
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 50px rgba(102, 126, 234, 0.4)',
  },
}));

const ActionButton = styled(IconButton)(({ theme, color }) => ({
  width: '40px',
  height: '40px',
  background: color === 'edit' ? 'rgba(102, 126, 234, 0.1)' :
             color === 'delete' ? 'rgba(244, 67, 54, 0.1)' :
             'rgba(33, 150, 243, 0.1)',
  color: color === 'edit' ? '#667eea' :
         color === 'delete' ? '#f44336' :
         '#2196f3',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: color === 'edit' ? 'rgba(102, 126, 234, 0.2)' :
               color === 'delete' ? 'rgba(244, 67, 54, 0.2)' :
               'rgba(33, 150, 243, 0.2)',
    transform: 'scale(1.1)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: '600',
  fontSize: '0.85rem',
  padding: '6px 16px',
  borderRadius: '20px',
  background: status === 'Approved' ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' :
              status === 'Pending' ? 'linear-gradient(135deg, #FF9800, #FFB74D)' :
              'linear-gradient(135deg, #F44336, #E57373)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const OwnerDashboard = () => {
  const navigate = useNavigate();
  
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
  });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: ''
  });
  const [filteredPets, setFilteredPets] = useState([]);

  // Check if user is owner
  const isOwnerUser = (user) => {
    if (!user) return false;
    return user.role === 'owner' || user.userType === 'PetOwner';
  };

  // Fetch owner data
  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        
        // FIRST: Check if owner is logged in - check BOTH possible keys
        const ownerDataStr = localStorage.getItem('ownerUser'); // OwnerLogin key
        const userDataStr = localStorage.getItem('user'); // VetLogin key (or fallback)
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Not logged in at all
          Swal.fire({
            title: 'Not Logged In',
            text: 'Please log in to access this dashboard',
            icon: 'error',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#667eea',
          }).then(() => {
            navigate('/owner/login');
          });
          return;
        }
        
        // Determine which user is logged in
        let loggedInUser = null;
        let userRole = null;
        
        // Try ownerUser first
        if (ownerDataStr) {
          try {
            const ownerData = JSON.parse(ownerDataStr);
            if (ownerData.role === 'owner' || ownerData.userType === 'PetOwner') {
              loggedInUser = ownerData;
              userRole = 'owner';
            }
          } catch (e) {
            console.error('Error parsing ownerData:', e);
          }
        }
        
        // If not owner, check user key (might be vet)
        if (!loggedInUser && userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            if (userData.role === 'owner' || userData.userType === 'PetOwner') {
              loggedInUser = userData;
              userRole = 'owner';
            } else if (userData.role === 'vet') {
              // Vet is logged in, redirect to vet dashboard
              Swal.fire({
                title: 'Veterinarian Account',
                text: 'Redirecting to veterinarian dashboard...',
                icon: 'info',
                timer: 1500,
                showConfirmButton: false
              }).then(() => {
                navigate('/vet/dashboard');
              });
              return;
            }
          } catch (e) {
            console.error('Error parsing userData:', e);
          }
        }
        
        // If still no valid user, redirect to login
        if (!loggedInUser || userRole !== 'owner') {
          Swal.fire({
            title: 'Not Authorized',
            text: 'Please log in as a pet owner to access this dashboard',
            icon: 'warning',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#667eea',
          }).then(() => {
            navigate('/owner/login');
          });
          return;
        }
        
        // Set owner data from localStorage
        setOwner(loggedInUser);
        setEditForm({
          firstName: loggedInUser.firstName || '',
          lastName: loggedInUser.lastName || '',
          phoneNumber: loggedInUser.phoneNumber || '',
          address: loggedInUser.address || ''
        });
        
        // Now try to verify with backend - but don't block if it fails
        console.log('Fetching fresh data from backend...');
        try {
          const profileRes = await api.get('/auth/me');
          const backendUserData = profileRes.data.user;
          console.log('Backend user data:', backendUserData);
          
          // Update with fresh data from backend
          if (backendUserData) {
            setOwner(backendUserData);
            setEditForm({
              firstName: backendUserData.firstName || '',
              lastName: backendUserData.lastName || '',
              phoneNumber: backendUserData.phoneNumber || '',
              address: backendUserData.address || ''
            });
          }
        } catch (apiError) {
          console.log('Could not fetch from /auth/me, using localStorage data:', apiError.message);
          // Continue with localStorage data - it's okay if API fails
        }

        // Get owner's pets
        let petsData = [];
        const ownerId = loggedInUser.id || loggedInUser._id;
        console.log('Fetching pets for owner ID:', ownerId);
        
        try {
          // Try the most likely endpoint
          const petsRes = await api.get(`/pets/owner/${ownerId}`);
          petsData = petsRes.data.pets || petsRes.data || [];
          console.log(`Found ${petsData.length} pets via /pets/owner/${ownerId}`);
        } catch (endpointError) {
          console.log('First endpoint failed, trying alternatives...');
          
          try {
            // Try alternative endpoint
            const petsRes = await api.get('/pets/my');
            petsData = petsRes.data.pets || petsRes.data || [];
            console.log(`Found ${petsData.length} pets via /pets/my`);
          } catch (myPetsError) {
            console.error('Both endpoints failed:', myPetsError);
            
            // Try to fetch all pets and filter client-side
            try {
              const allPetsRes = await api.get('/pets');
              if (allPetsRes.data.pets) {
                petsData = allPetsRes.data.pets.filter(pet => 
                  pet.ownerId === ownerId || 
                  (pet.ownerId && pet.ownerId._id === ownerId)
                );
                console.log(`Found ${petsData.length} pets by filtering`);
              }
            } catch (allPetsError) {
              console.error('Could not fetch pets:', allPetsError);
              Swal.fire({
                title: 'Info',
                text: 'Could not load pets. Please try adding a pet first.',
                icon: 'info',
                timer: 3000,
                showConfirmButton: false
              });
            }
          }
        }

        console.log('Final pets data:', petsData);
        setPets(petsData);
        setFilteredPets(petsData);

        // Calculate stats
        const approved = petsData.filter(p => p.registrationStatus === 'Approved').length;
        const pending = petsData.filter(p => p.registrationStatus === 'Pending').length;
        setStats({
          totalPets: petsData.length,
          approvedPets: approved,
          pendingPets: pending,
          vetVisits: petsData.reduce((acc, pet) => acc + (pet.vetVisits || 0), 0),
        });
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        
        // Check for authentication error
        if (error.response?.status === 401) {
          Swal.fire({
            title: 'Session Expired',
            text: 'Please log in again as a pet owner',
            icon: 'error',
            confirmButtonText: 'Login',
            confirmButtonColor: '#667eea',
          }).then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('ownerUser');
            localStorage.removeItem('owner');
            navigate('/owner/login');
          });
          return;
        }
        
        Swal.fire({
          title: 'Connection Error',
          text: error.response?.data?.message || 'Unable to load your dashboard',
          icon: 'error',
          background: '#ffffff',
          color: '#333',
          confirmButtonColor: '#667eea',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [navigate]);

  // Filter pets based on active tab
  useEffect(() => {
    if (!pets.length) {
      setFilteredPets([]);
      return;
    }

    let filtered = [...pets];
    
    switch (activeTab) {
      case 1: // Approved
        filtered = pets.filter(pet => pet.registrationStatus === 'Approved');
        break;
      case 2: // Pending
        filtered = pets.filter(pet => pet.registrationStatus === 'Pending');
        break;
      default: // All
        filtered = [...pets];
    }
    
    setFilteredPets(filtered);
  }, [activeTab, pets]);

  // Helper functions
  const togglePetExpand = (petId) => {
    setExpandedPet(expandedPet === petId ? null : petId);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Not specified';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age === 0 ? '< 1 year' : `${age} year${age > 1 ? 's' : ''}`;
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handler functions
  const handleDeletePet = async (petId, petName) => {
    const result = await Swal.fire({
      title: `Remove ${petName}?`,
      text: "This pet will be permanently removed from your account",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      color: '#333',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/pets/${petId}`);
        
        // Update local state
        const updatedPets = pets.filter(p => p._id !== petId);
        setPets(updatedPets);
        
        // Update stats
        const approved = updatedPets.filter(p => p.registrationStatus === 'Approved').length;
        const pending = updatedPets.filter(p => p.registrationStatus === 'Pending').length;
        setStats({
          totalPets: updatedPets.length,
          approvedPets: approved,
          pendingPets: pending,
          vetVisits: updatedPets.reduce((acc, pet) => acc + (pet.vetVisits || 0), 0),
        });
        
        Swal.fire({
          title: 'Success!',
          text: `${petName} has been removed from your account`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: '#ffffff',
          color: '#333',
        });
      } catch (error) {
        console.error('Delete pet error:', error);
        
        let errorMsg = 'Could not remove pet';
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
        
        Swal.fire({
          title: 'Error',
          text: errorMsg,
          icon: 'error',
          background: '#ffffff',
          color: '#333',
        });
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      console.log('Updating profile with data:', editForm);
      
      // Get owner ID
      const ownerId = owner.id || owner._id;
      if (!ownerId) {
        throw new Error('Owner ID not found');
      }
      
      let updateEndpoint = '';
      let updatePayload = editForm;
      
      // Try different endpoints
      const endpoints = [
        `/pet-owners/${ownerId}`,
        `/owners/${ownerId}`,
        `/auth/update-profile`
      ];
      
      let updateSuccessful = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying update endpoint: ${endpoint}`);
          
          // For auth/update-profile, might need different payload structure
          if (endpoint === '/auth/update-profile') {
            updatePayload = { userId: ownerId, ...editForm };
          }
          
          const response = await api.put(endpoint, updatePayload);
          
          if (response.data.success || response.status === 200) {
            updateSuccessful = true;
            console.log(`Update successful via ${endpoint}`);
            
            // Update local state
            setOwner(prev => ({ ...prev, ...editForm }));
            setOpenEditProfile(false);
            
            Swal.fire({
              title: 'Profile Updated!',
              text: 'Your profile has been updated successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              background: '#ffffff',
              color: '#333',
            });
            break;
          }
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
          continue;
        }
      }
      
      if (!updateSuccessful) {
        // If no endpoint worked, update locally anyway
        setOwner(prev => ({ ...prev, ...editForm }));
        setOpenEditProfile(false);
        
        Swal.fire({
          title: 'Profile Updated Locally',
          text: 'Profile updated locally. Backend update may need configuration.',
          icon: 'info',
          timer: 3000,
          showConfirmButton: false,
          background: '#ffffff',
          color: '#333',
        });
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Could not update profile';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire({
        title: 'Update Failed',
        text: errorMessage,
        icon: 'error',
        background: '#ffffff',
        color: '#333',
      });
    }
  };

  // Debug function
  const debugUserData = () => {
    console.log('=== DEBUG INFO ===');
    console.log('Owner:', owner);
    console.log('Pets:', pets);
    console.log('Stats:', stats);
    console.log('Filtered Pets:', filteredPets);
    console.log('Active Tab:', activeTab);
    console.log('==================');
  };

  // Loading state
  if (loading) {
    return (
      <DashboardContainer>
        <ContentArea>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: '24px' }} />
            </Grid>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rounded" height={150} sx={{ borderRadius: '20px' }} />
              </Grid>
            ))}
            {[1, 2].map((item) => (
              <Grid item xs={12} md={6} key={item}>
                <Skeleton variant="rounded" height={300} sx={{ borderRadius: '20px' }} />
              </Grid>
            ))}
          </Grid>
        </ContentArea>
      </DashboardContainer>
    );
  }

  // No owner data
  if (!owner) {
    return (
      <DashboardContainer>
        <ContentArea>
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="error">
              Unable to load profile. Please try again later.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mt: 3 }}
            >
              Retry
            </Button>
          </Box>
        </ContentArea>
      </DashboardContainer>
    );
  }

  return (
    <>
      <Navbar />
      <DashboardContainer>
        <ContentArea>
          {/* Debug button (temporary) */}
          <Button
            variant="outlined"
            size="small"
            onClick={debugUserData}
            sx={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 1000,
              opacity: 0.3,
              '&:hover': { opacity: 1 }
            }}
          >
            Debug
          </Button>

          {/* Welcome Section */}
          <Grow in={true} timeout={800}>
            <WelcomeCard>
              <WelcomeHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <UserAvatar>
                    {owner.firstName?.charAt(0)?.toUpperCase()}{owner.lastName?.charAt(0)?.toUpperCase()}
                  </UserAvatar>
                  <Box>
                    <Typography variant="h3" fontWeight="700" sx={{ 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}>
                      Welcome back, {owner.firstName}!
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.8 }}>
                      Your pet care dashboard is ready
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<PetsIcon />} 
                        label={`${stats.totalPets} Pet${stats.totalPets !== 1 ? 's' : ''}`}
                        sx={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}
                      />
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label={`${stats.approvedPets} Approved`}
                        sx={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}
                      />
                      <Chip 
                        icon={<PendingIcon />} 
                        label={`${stats.pendingPets} Pending`}
                        sx={{ background: 'rgba(255, 152, 0, 0.1)', color: '#FF9800' }}
                      />
                      <Chip 
                        icon={<TrendingUpIcon />} 
                        label={`${stats.vetVisits} Total Visits`}
                        sx={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3' }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setOpenEditProfile(true)}
                    sx={{
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                      color: '#667eea',
                      '&:hover': { 
                        borderColor: '#667eea',
                        background: 'rgba(102, 126, 234, 0.05)' 
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                  <AddPetButton
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/owner/pets/new')}
                  >
                    Add New Pet
                  </AddPetButton>
                </Box>
              </WelcomeHeader>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6} md={4}>
                    <DetailRow>
                      <EmailIcon sx={{ color: '#667eea', fontSize: 24 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body1" fontWeight="500">{owner.email}</Typography>
                      </Box>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <DetailRow>
                      <PhoneIcon sx={{ color: '#667eea', fontSize: 24 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography variant="body1" fontWeight="500">{owner.phoneNumber || 'Not provided'}</Typography>
                      </Box>
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DetailRow>
                      <LocationOnIcon sx={{ color: '#667eea', fontSize: 24 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Address</Typography>
                        <Typography variant="body1" fontWeight="500">{owner.address || 'Not provided'}</Typography>
                      </Box>
                    </DetailRow>
                  </Grid>
                </Grid>
              </CardContent>
            </WelcomeCard>
          </Grow>

          {/* Stats Overview */}
          <Zoom in={true} timeout={1000}>
            <Grid container spacing={4} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      width: 60,
                      height: 60
                    }}>
                      <PetsIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="700">{stats.totalPets}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Pets</Typography>
                    </Box>
                  </Box>
                </StatsCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                      width: 60,
                      height: 60
                    }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="700">{stats.approvedPets}</Typography>
                      <Typography variant="body2" color="text.secondary">Approved</Typography>
                    </Box>
                  </Box>
                </StatsCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
                      width: 60,
                      height: 60
                    }}>
                      <PendingIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="700">{stats.pendingPets}</Typography>
                      <Typography variant="body2" color="text.secondary">Pending</Typography>
                    </Box>
                  </Box>
                </StatsCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(135deg, #2196F3, #64B5F6)',
                      width: 60,
                      height: 60
                    }}>
                      <HealthAndSafetyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="700">{stats.vetVisits}</Typography>
                      <Typography variant="body2" color="text.secondary">Vet Visits</Typography>
                    </Box>
                  </Box>
                </StatsCard>
              </Grid>
            </Grid>
          </Zoom>

          {/* Pets Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight="700" sx={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                My Pets
              </Typography>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab label={`All (${pets.length})`} />
                <Tab label={`Approved (${stats.approvedPets})`} />
                <Tab label={`Pending (${stats.pendingPets})`} />
              </Tabs>
            </Box>

            {filteredPets.length === 0 ? (
              <Fade in={true} timeout={1200}>
                <Paper sx={{ 
                  p: 8, 
                  textAlign: 'center', 
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                }}>
                  <Box sx={{ 
                    width: '120px', 
                    height: '120px', 
                    margin: '0 auto 32px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PetsIcon sx={{ fontSize: 60, color: '#667eea', opacity: 0.5 }} />
                  </Box>
                  <Typography variant="h5" fontWeight="600" color="text.secondary" gutterBottom>
                    {pets.length === 0 ? 'No pets yet' : 'No pets in this category'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, opacity: 0.7 }}>
                    {pets.length === 0 
                      ? 'Start by adding your first furry friend!' 
                      : 'No pets match the selected filter.'}
                  </Typography>
                  {pets.length === 0 && (
                    <AddPetButton
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/owner/pets/new')}
                    >
                      Add Your First Pet
                    </AddPetButton>
                  )}
                </Paper>
              </Fade>
            ) : (
              <Grid container spacing={4}>
                {filteredPets.map((pet, index) => (
                  <Grid item xs={12} sm={6} md={4} key={pet._id || index}>
                    <Slide direction="up" in={true} timeout={500 + (index * 100)}>
                      <PetCard>
                        <Box sx={{ p: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                            <PetAvatar 
                              status={pet.registrationStatus || 'Pending'} 
                              src={pet.photo}
                            >
                              {pet.name?.charAt(0)?.toUpperCase() || 'P'}
                            </PetAvatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h5" fontWeight="700">
                                  {pet.name || 'Unnamed Pet'}
                                </Typography>
                                <StatusChip 
                                  status={pet.registrationStatus || 'Pending'}
                                  icon={pet.registrationStatus === 'Approved' ? <CheckCircleIcon /> :
                                        pet.registrationStatus === 'Pending' ? <PendingIcon /> :
                                        <WarningIcon />}
                                  label={pet.registrationStatus || 'Pending'}
                                />
                              </Box>
                              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                {pet.species || 'Unknown'} • {pet.breed || 'Mixed Breed'}
                              </Typography>
                            </Box>
                          </Box>

                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                              <DetailRow>
                                {pet.gender === 'Male' ? 
                                  <MaleIcon sx={{ color: '#2196F3' }} /> : 
                                  <FemaleIcon sx={{ color: '#E91E63' }} />
                                }
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Gender</Typography>
                                  <Typography variant="body2" fontWeight="500">{pet.gender || 'Unknown'}</Typography>
                                </Box>
                              </DetailRow>
                            </Grid>
                            <Grid item xs={6}>
                              <DetailRow>
                                <CalendarTodayIcon sx={{ color: '#4CAF50' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Age</Typography>
                                  <Typography variant="body2" fontWeight="500">{calculateAge(pet.dateOfBirth)}</Typography>
                                </Box>
                              </DetailRow>
                            </Grid>
                            <Grid item xs={6}>
                              <DetailRow>
                                <ScaleIcon sx={{ color: '#FF9800' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Weight</Typography>
                                  <Typography variant="body2" fontWeight="500">
                                    {pet.weight ? `${pet.weight} kg` : 'Not recorded'}
                                  </Typography>
                                </Box>
                              </DetailRow>
                            </Grid>
                            <Grid item xs={6}>
                              <DetailRow>
                                <ColorLensIcon sx={{ color: '#9C27B0' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Color</Typography>
                                  <Typography variant="body2" fontWeight="500">{pet.color || 'Not specified'}</Typography>
                                </Box>
                              </DetailRow>
                            </Grid>
                          </Grid>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                              variant="text"
                              onClick={() => togglePetExpand(pet._id)}
                              endIcon={<ExpandMoreIcon sx={{ 
                                transform: expandedPet === pet._id ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: '0.3s'
                              }} />}
                              sx={{ color: '#667eea' }}
                            >
                              {expandedPet === pet._id ? 'Show Less' : 'View Details'}
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <ActionButton 
                                color="edit"
                                onClick={() => navigate(`/owner/pets/${pet._id}/edit`)}
                              >
                                <EditIcon />
                              </ActionButton>
                              <ActionButton 
                                color="delete"
                                onClick={() => handleDeletePet(pet._id, pet.name)}
                              >
                                <DeleteIcon />
                              </ActionButton>
                            </Box>
                          </Box>

                          <Collapse in={expandedPet === pet._id} timeout="auto" unmountOnExit>
                            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
                              <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" fontWeight="600" color="text.secondary" gutterBottom>
                                    Additional Information
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Date of Birth:</strong> {formatDate(pet.dateOfBirth)}
                                  </Typography>
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Microchip:</strong> {pet.microchipNumber || 'Not registered'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  {pet.vaccinationStatus && (
                                    <Typography variant="body2" gutterBottom>
                                      <strong>Vaccination:</strong> 
                                      <Chip 
                                        size="small" 
                                        label={pet.vaccinationStatus}
                                        color={pet.vaccinationStatus === 'Up to date' ? 'success' : 'warning'}
                                        sx={{ ml: 1 }}
                                      />
                                    </Typography>
                                  )}
                                  {pet.notes && (
                                    <Typography variant="body2" gutterBottom>
                                      <strong>Has Notes:</strong> Yes
                                    </Typography>
                                  )}
                                </Grid>
                                {pet.registeredClinicId && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ 
                                      color: '#667eea',
                                      fontWeight: '600'
                                    }}>
                                      <HealthAndSafetyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      Registered at: {typeof pet.registeredClinicId === 'object' 
                                        ? pet.registeredClinicId.name 
                                        : 'Clinic'}
                                    </Typography>
                                  </Grid>
                                )}
                                {pet.notes && (
                                  <Grid item xs={12}>
                                    <Box sx={{ 
                                      p: 3, 
                                      background: 'rgba(102, 126, 234, 0.05)',
                                      borderRadius: '12px',
                                      mt: 2
                                    }}>
                                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                        Notes
                                      </Typography>
                                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        {pet.notes}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          </Collapse>
                        </Box>
                      </PetCard>
                    </Slide>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Edit Profile Dialog */}
          <Dialog 
            open={openEditProfile} 
            onClose={() => setOpenEditProfile(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              textAlign: 'center',
              py: 3
            }}>
              <Typography variant="h5" fontWeight="600">Edit Profile</Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    variant="outlined"
                    multiline
                    rows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 4, pb: 4 }}>
              <Button 
                onClick={() => setOpenEditProfile(false)}
                sx={{
                  color: '#666',
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateProfile}
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '12px',
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
      </DashboardContainer>
    </>
  );
};

export default OwnerDashboard;