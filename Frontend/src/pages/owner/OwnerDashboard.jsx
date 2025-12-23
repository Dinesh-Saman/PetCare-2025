import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader, Avatar, Button,
  Paper, Divider, Collapse, IconButton, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import AddIcon from '@mui/icons-material/Add';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Header from '../../components/layout/Header'; // Optional: if you have a shared header
import Sidebar from '../../components/layout/Sidebar'; // Remove if you want no sidebar for owner

// Main Container
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  padding: '40px',
  marginTop: '70px', // Space for header
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

const OwnerDashboard = () => {
  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [expandedPet, setExpandedPet] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        // Get current user profile
        const profileRes = await api.get('/auth/me');
        const userData = profileRes.data.user;
        setOwner(userData);

        // Get owner's pets
        const petsRes = await api.get('/pets/my'); // Adjust endpoint if needed
        setPets(petsRes.data.pets || petsRes.data || []);
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
        {/* Owner Profile Section */}
        <SectionTitle variant="h4">
          Welcome back, {owner.firstName}!
        </SectionTitle>

        <ProfileCard>
          <ProfileHeader>
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

        {/* My Pets Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <SectionTitle variant="h4">
            My Pets ({pets.length})
          </SectionTitle>
          <AddPetButton
            startIcon={<AddIcon />}
            onClick={() => navigate('/owner/pets/new')} // You'll create this form later
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
                <PetCard onClick={() => togglePetExpand(pet._id)}>
                  <PetHeader>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={pet.registrationStatus}
                        color={
                          pet.registrationStatus === 'Approved' ? 'success' :
                          pet.registrationStatus === 'Pending' ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
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
    </DashboardContainer>
  );
};

export default OwnerDashboard;