// src/pages/owner/MyClinics.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Stack, Button,
  CircularProgress, Paper, alpha, TextField, InputAdornment
} from '@mui/material';
import Navbar from '../../components/Navbar';
import { styled } from '@mui/material/styles';
import {
  LocationOnOutlined as LocationOnOutlinedIcon,
  PhoneOutlined as PhoneOutlinedIcon,
  AccessTimeOutlined as AccessTimeOutlinedIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { FaPaw } from 'react-icons/fa';

const PageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  paddingTop: '120px',
  paddingBottom: '40px'
});

const ContentContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 60px',
  [theme.breakpoints.down('sm')]: {
    padding: '0 24px',
  },
}));

const HeaderSection = styled(Box)({
  marginBottom: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const MyClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clinics/my-owner');
      setClinics(response.data.clinics || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      Swal.fire('Error', 'Could not load your clinics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const filteredClinics = clinics.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <PageContainer>
        <ContentContainer>
          <HeaderSection>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  My Clinics
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
                  View clinics where your pets are registered.
                </Typography>
              </Box>
              <TextField
                placeholder="Search your clinics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: '100%', sm: 320 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'white',
                  }
                }}
              />
            </Box>
          </HeaderSection>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 10 }}>
              <CircularProgress size={40} sx={{ color: '#0077ff' }} />
            </Box>
          ) : filteredClinics.length === 0 ? (
            <Paper sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: '32px',
              border: '2px dashed #e2e8f0',
              bgcolor: 'white'
            }}>
              <Box sx={{ mb: 3, color: '#cbd5e1' }}>
                <BusinessIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" fontWeight="800" color="#1e293b" gutterBottom>
                No clinics found
              </Typography>
              <Typography variant="body1" color="#64748b" sx={{ maxWidth: 450, mx: 'auto', mb: 4 }}>
                It seems you don't have any pets registered with a clinic yet, or your registrations are still pending.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/owner/profile')}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #004aad 0%, #0077ff 100%)',
                  boxShadow: '0 8px 16px rgba(0, 74, 173, 0.2)',
                }}
              >
                Go to My Pets
              </Button>
            </Paper>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 3
            }}>
              {filteredClinics.map((clinic) => (
                <Box key={clinic._id} sx={{ height: '100%' }}>
                  <Card sx={{
                    borderRadius: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                      borderColor: '#0077ff'
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1, p: 4 }}>
                      <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b', mb: 3 }}>
                        {clinic.name}
                      </Typography>

                      <Stack spacing={2} mb={4}>
                        <Box display="flex" alignItems="flex-start" gap={2}>
                          <LocationOnOutlinedIcon sx={{ color: '#0077ff', fontSize: 22, mt: 0.3 }} />
                          <Typography variant="body1" color="#475569" sx={{ lineHeight: 1.5 }}>
                            {clinic.address}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                          <PhoneOutlinedIcon sx={{ color: '#0077ff', fontSize: 22 }} />
                          <Typography variant="body1" color="#1e293b" fontWeight="600">
                            {clinic.phoneNumber}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="flex-start" gap={2}>
                          <AccessTimeOutlinedIcon sx={{ color: '#0077ff', fontSize: 22, mt: 0.3 }} />
                          <Box>
                            <Typography variant="body1" color="#1e293b" fontWeight="600">
                              {clinic.operatingDays?.length > 1
                                ? `${clinic.operatingDays[0]} - ${clinic.operatingDays[clinic.operatingDays.length - 1]}`
                                : clinic.operatingDays?.[0]}
                            </Typography>
                            <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                              {clinic.operatingHours?.includes('|')
                                ? clinic.operatingHours.split('|')[1].trim()
                                : clinic.operatingHours}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>

                      <Box sx={{
                        p: 2.5,
                        bgcolor: alpha('#0077ff', 0.05),
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                          }}>
                            <FaPaw size={20} style={{ color: '#0077ff' }} />
                          </Box>
                          <Typography variant="body1" fontWeight="700" sx={{ color: '#004aad' }}>
                            Your Pets
                          </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="900" sx={{ color: '#004aad' }}>
                          {clinic.petsCount || 0}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Box sx={{ p: 4, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/owner/profile')}
                        sx={{
                          borderRadius: '16px',
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #004aad 0%, #0077ff 100%)',
                          color: 'white',
                          fontWeight: 700,
                          py: 1.8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          px: 3,
                          boxShadow: '0 8px 16px rgba(0, 74, 173, 0.15)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #003a8c 0%, #0066db 100%)',
                            boxShadow: '0 12px 24px rgba(0, 74, 173, 0.25)',
                          }
                        }}
                      >
                        <Typography fontWeight="800">Manage Pets</Typography>
                        <ChevronRightIcon />
                      </Button>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </ContentContainer>
      </PageContainer>
    </Box>
  );
};

export default MyClinics;
