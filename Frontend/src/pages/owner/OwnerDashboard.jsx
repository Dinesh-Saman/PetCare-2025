import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader, Avatar, Button,
  Paper, Divider, Collapse, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
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
import Header from '../../components/layout/Header';

const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  padding: '40px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  color: '#1565c0',
  marginBottom: 30,
  fontSize: '2.4rem',
  textAlign: 'center',
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  overflow: 'hidden',
  marginBottom: 40,
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: 40,
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  justifyContent: 'space-between',
}));

const PetCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 50px rgba(0,0,0,0.15)',
  },
}));

const PetHeader = styled(Box)(({ theme }) => ({
  padding: 24,
  background: '#f8fdff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  border: '4px solid white',
}));

const AddPetButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: '16px 32px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.2rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
  '&:hover': {
    background: 'linear-gradient(90deg, #1976d2, #00bcd4)',
    transform: 'translateY(-3px)',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#f0f7ff',
  marginLeft: 8,
  '&:hover': {
    backgroundColor: '#bbdefb',
  },
}));

const OwnerDashboard = () => {
  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [expandedPet, setExpandedPet] = useState(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const profileRes = await api.get('/auth/me');
        const userData = profileRes.data.user;
        setOwner(userData);
        setEditForm({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || ''
        });

        const petsRes = await api.get('/pets/my');
        setPets(petsRes.data.pets || []);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        Swal.fire('Error', 'Could not load your dashboard', 'error');
      }
    };

    fetchOwnerData();
  }, []);

  const togglePetExpand = (petId) => {
    setExpandedPet(expandedPet === petId ? null : petId);
  };

  const handleDeletePet = async (petId, petName) => {
    const result = await Swal.fire({
      title: `Delete ${petName}?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/pets/${petId}`);
        setPets(prev => prev.filter(p => p._id !== petId));
        Swal.fire('Deleted!', `${petName} has been removed`, 'success');
      } catch (error) {
        Swal.fire('Error', 'Could not delete pet', 'error');
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put(`/owners/${owner.id}`, editForm);
      
      // Update local state
      setOwner(prev => ({ ...prev, ...editForm }));
      
      // Close dialog
      setOpenEditProfile(false);
      
      // Show success message
      Swal.fire({
        title: 'Updated!',
        text: 'Your profile has been updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Navigate to dashboard (refreshes the page to ensure fresh data)
      navigate('/owner/dashboard', { replace: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Could not update profile',
        'error'
      );
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} years`;
  };

  if (!owner) {
    return (
      <DashboardContainer>
        <Header />
        <ContentArea>
          <Typography variant="h5" textAlign="center" color="#666">
            Loading your dashboard...
          </Typography>
        </ContentArea>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header />
      <ContentArea>
        <SectionTitle variant="h4">
          Welcome back, {owner.firstName}!
        </SectionTitle>

        <ProfileCard>
          <ProfileHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <Avatar sx={{ width: 120, height: 120, fontSize: '3rem' }}>
                {owner.firstName.charAt(0)}{owner.lastName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {owner.firstName} {owner.lastName}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Pet Owner
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditProfile(true)}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
              }}
            >
              Edit Profile
            </Button>
          </ProfileHeader>

          <CardContent sx={{ pt: 6 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <EmailIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="h6">{owner.email}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PhoneIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                    <Typography variant="h6">{owner.phoneNumber || 'Not provided'}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOnIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                    <Typography variant="h6">{owner.address || 'Not provided'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </ProfileCard>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <SectionTitle variant="h4">
            My Pets ({pets.length})
          </SectionTitle>
          <AddPetButton
            startIcon={<AddIcon />}
            onClick={() => navigate('/owner/pets/new')}
          >
            Add New Pet
          </AddPetButton>
        </Box>

        {pets.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
            <PetsIcon sx={{ fontSize: 100, color: '#ccc', mb: 3 }} />
            <Typography variant="h5" color="textSecondary" gutterBottom>
              No pets yet
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Add your first pet to get started!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {pets.map((pet) => (
              <Grid item xs={12} md={6} key={pet._id}>
                <PetCard>
                  <PetHeader onClick={() => togglePetExpand(pet._id)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <PetAvatar src={pet.photo || ''} alt={pet.name}>
                        {pet.name.charAt(0).toUpperCase()}
                      </PetAvatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {pet.name}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          {pet.species} • {pet.breed || 'Mixed'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={pet.registrationStatus}
                        color={
                          pet.registrationStatus === 'Approved' ? 'success' :
                          pet.registrationStatus === 'Pending' ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
                      <ActionButton onClick={(e) => { e.stopPropagation(); navigate(`/owner/pets/${pet._id}/edit`); }}>
                        <EditIcon />
                      </ActionButton>
                      <ActionButton onClick={(e) => { e.stopPropagation(); handleDeletePet(pet._id, pet.name); }}>
                        <DeleteIcon color="error" />
                      </ActionButton>
                      <IconButton>
                        <ExpandMoreIcon sx={{ transform: expandedPet === pet._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                      </IconButton>
                    </Box>
                  </PetHeader>

                  <Collapse in={expandedPet === pet._id} timeout="auto" unmountOnExit>
                    <CardContent sx={{ pt: 4 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            {pet.gender === 'Male' ? <MaleIcon color="primary" /> : <FemaleIcon color="secondary" />}
                            <Typography><strong>Gender:</strong> {pet.gender || 'Unknown'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <CalendarTodayIcon color="action" />
                            <Typography><strong>Age:</strong> {calculateAge(pet.dateOfBirth)}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography><strong>Weight:</strong> {pet.weight ? `${pet.weight} kg` : 'Not recorded'}</Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography><strong>Color:</strong> {pet.color || 'Not specified'}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography><strong>Microchip:</strong> {pet.microchipNumber || 'Not registered'}</Typography>
                        </Grid>
                        {pet.registeredClinicId && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" color="#1976d2">
                              Registered at: {pet.registeredClinicId.name}
                            </Typography>
                          </Grid>
                        )}
                        {pet.notes && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Notes
                            </Typography>
                            <Typography variant="body1">{pet.notes}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Collapse>
                </PetCard>
              </Grid>
            ))}
          </Grid>
        )}
      </ContentArea>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditProfile} onClose={() => setOpenEditProfile(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #2196f3, #21cbf3)', color: 'white' }}>
          Edit My Profile
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProfile(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateProfile}
            sx={{ background: 'linear-gradient(90deg, #2196f3, #21cbf3)' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default OwnerDashboard;