import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, Chip,
  Divider, Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ScaleIcon from '@mui/icons-material/Scale';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import Header from '../../components/layout/Header';

const ProfileContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  padding: '40px 20px',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  maxWidth: 1000,
  margin: '0 auto',
  marginTop: '70px',
}));

const PetHeaderCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  overflow: 'hidden',
  marginBottom: 40,
}));

const HeaderBackground = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: 60,
  display: 'flex',
  alignItems: 'center',
  gap: 40,
}));

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  border: '8px solid white',
  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
  padding: 32,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#1565c0',
  marginBottom: 24,
  fontSize: '1.8rem',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginBottom: 20,
  '& svg': {
    color: '#2196f3',
    fontSize: 32,
  },
}));

const EditButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
  padding: '12px 32px',
  borderRadius: 30,
  fontWeight: 'bold',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #1976d2, #00bcd4)',
  },
}));

const PetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get(`/pets/${id}`);
        setPet(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pet:', error);
        Swal.fire('Error', 'Could not load pet profile', 'error');
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} years`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ProfileContainer>
        <Header />
        <ContentArea>
          <Typography variant="h5" textAlign="center" color="#666" mt={10}>
            Loading pet profile...
          </Typography>
        </ContentArea>
      </ProfileContainer>
    );
  }

  if (!pet) {
    return (
      <ProfileContainer>
        <Header />
        <ContentArea>
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 20 }}>
            <PetsIcon sx={{ fontSize: 100, color: '#ccc', mb: 3 }} />
            <Typography variant="h5" color="textSecondary">
              Pet not found
            </Typography>
          </Paper>
        </ContentArea>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Header />
      <ContentArea>
        {/* Pet Header */}
        <PetHeaderCard>
          <HeaderBackground>
            <PetAvatar src={pet.photo || ''} alt={pet.name}>
              {pet.name.charAt(0).toUpperCase()}
            </PetAvatar>
            <Box>
              <Typography variant="h3" fontWeight="bold">
                {pet.name}
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.9, mt: 1 }}>
                {pet.species} • {pet.breed || 'Mixed Breed'}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Chip
                  label={pet.registrationStatus}
                  color={
                    pet.registrationStatus === 'Approved' ? 'success' :
                    pet.registrationStatus === 'Pending' ? 'warning' :
                    'error'
                  }
                  size="large"
                  sx={{ px: 2, py: 2, fontSize: '1rem', fontWeight: 'bold' }}
                />
              </Box>
            </Box>
            <Box sx={{ marginLeft: 'auto' }}>
              <EditButton
                startIcon={<EditIcon />}
                onClick={() => navigate(`/owner/pets/${pet._id}/edit`)} // Future edit page
              >
                Edit Profile
              </EditButton>
            </Box>
          </HeaderBackground>
        </PetHeaderCard>

        {/* Details Grid */}
        <Grid container spacing={5}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <SectionTitle variant="h5">
                <PetsIcon /> Basic Information
              </SectionTitle>
              <Divider sx={{ mb: 4 }} />

              <InfoRow>
                <CalendarTodayIcon />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                  <Typography variant="h6">{formatDate(pet.dateOfBirth)}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Age: {calculateAge(pet.dateOfBirth)}
                  </Typography>
                </Box>
              </InfoRow>

              <InfoRow>
                {pet.gender === 'Male' ? <MaleIcon /> : <FemaleIcon />}
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                  <Typography variant="h6">{pet.gender || 'Not specified'}</Typography>
                </Box>
              </InfoRow>

              <InfoRow>
                <ScaleIcon />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Weight</Typography>
                  <Typography variant="h6">
                    {pet.weight ? `${pet.weight} kg` : 'Not recorded'}
                  </Typography>
                </Box>
              </InfoRow>

              <InfoRow>
                <ColorLensIcon />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Color / Markings</Typography>
                  <Typography variant="h6">{pet.color || 'Not specified'}</Typography>
                </Box>
              </InfoRow>

              <InfoRow>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Microchip Number</Typography>
                  <Typography variant="h6">
                    {pet.microchipNumber || 'Not registered'}
                  </Typography>
                </Box>
              </InfoRow>
            </InfoCard>
          </Grid>

          {/* Clinic & Notes */}
          <Grid item xs={12} md={6}>
            <InfoCard>
              <SectionTitle variant="h5">
                <LocationOnIcon /> Clinic Registration
              </SectionTitle>
              <Divider sx={{ mb: 4 }} />

              {pet.registeredClinicId ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {pet.registeredClinicId.name}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    {pet.registeredClinicId.address}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Phone: {pet.registeredClinicId.phoneNumber}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  Not registered with any clinic yet
                </Typography>
              )}
            </InfoCard>

            {pet.notes && (
              <InfoCard sx={{ mt: 5 }}>
                <SectionTitle variant="h5">
                  <DescriptionIcon /> Owner Notes
                </SectionTitle>
                <Divider sx={{ mb: 4 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {pet.notes}
                </Typography>
              </InfoCard>
            )}
          </Grid>

          {/* Medical History Placeholder */}
          <Grid item xs={12}>
            <InfoCard>
              <SectionTitle variant="h5">
                <MedicalInformationIcon /> Medical History
              </SectionTitle>
              <Divider sx={{ mb: 4 }} />

              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 16, backgroundColor: '#f8fdff' }}>
                <MedicalInformationIcon sx={{ fontSize: 80, color: '#bbdefb', mb: 3 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Medical records coming soon
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Once your pet is registered with a clinic, vaccination records, visit history,
                  and treatment notes will appear here.
                </Typography>
              </Paper>
            </InfoCard>
          </Grid>
        </Grid>
      </ContentArea>
    </ProfileContainer>
  );
};

export default PetProfile;