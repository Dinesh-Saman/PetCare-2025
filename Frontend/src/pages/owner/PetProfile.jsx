import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, Chip,
  Divider, Paper, Container, Stack, Tooltip, IconButton, Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/system';
import {
  ArrowBack as ArrowBackIcon,
  Cake as CakeIcon,
  MonitorWeight as WeightIcon,
  ColorLens as ColorIcon,
  LocalHospital as HospitalIcon,
  Edit as EditIcon,
  FileUpload as UploadIcon,
  Chat as ChatIcon,
  Pets as PetsIcon,
  CalendarToday as CalendarTodayIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Assignment as RecordIcon,
  Medication as MedicineIcon,
  Vaccines as VaccineIcon
} from '@mui/icons-material';
import Header from '../../components/layout/Header';

// Styled Components
const PageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  paddingTop: '32px',
  paddingBottom: '64px',
});

const ProfileBanner = styled(Card)({
  borderRadius: '32px',
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  color: 'white',
  padding: '60px 48px',
  boxShadow: '0 20px 50px rgba(79, 70, 229, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  marginBottom: '40px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
  }
});

const GlassCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  height: '100%',
});

const RecordItem = styled(Paper)({
  padding: '20px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    borderColor: '#cbd5e1'
  }
});

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved': return '#10B981';
    case 'Pending': return '#F59E0B';
    case 'Rejected': return '#EF4444';
    default: return '#6B7280';
  }
};

const PetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);

  useEffect(() => {
    fetchPetDetails();
    fetchMedicalHistory();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const response = await api.get(`/pets/${id}`);
      setPet(response.data.pet || response.data);
    } catch (error) {
      console.error('Error fetching pet details:', error);
      Swal.fire('Error', 'Failed to fetch pet details', 'error');
      navigate('/owner/profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      // Fetch certified medical records
      const recordsRes = await api.get(`/medical-records/pet/${id}?ownerView=true`);
      setRecords(recordsRes.data.records || []);

      // Fetch prescriptions (separate into meds and vaccines)
      const presRes = await api.get(`/prescriptions/pet/${id}`);
      const allPres = presRes.data.prescriptions || [];
      setPrescriptions(allPres.filter(p => p.type === 'Medication'));
      setVaccinations(allPres.filter(p => p.type === 'Vaccination'));
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const numMonths = (new Date().getTime() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (numMonths < 12) return `${Math.floor(numMonths)} months`;
    return `${Math.floor(numMonths / 12)} years`;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const downloadPrescription = async (presId, name) => {
    try {
      const response = await api.get(`/prescriptions/${presId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Prescription_${name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('PDF Download error:', error);
      Swal.fire('Error', 'Failed to generate PDF', 'error');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Header />
        <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 10 }}>
          <Typography>Loading pet profile...</Typography>
        </Container>
      </PageContainer>
    );
  }

  if (!pet) return null;

  return (
    <PageContainer>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 10 }}>
        {/* Top Navigation */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/owner/profile')}
            sx={{ color: '#64748b', '&:hover': { bgcolor: 'transparent', color: '#334155' } }}
          >
            Back to Dashboard
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ChatIcon />}
              onClick={() => navigate(`/owner/messages?petId=${pet._id}`)}
              sx={{ borderRadius: '12px', fontWeight: 600, px: 3 }}
            >
              Pet Chat
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => Swal.fire('Coming Soon', 'Edit profile feature is under development.', 'info')}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #667eea, #764ba2)'
              }}
            >
              Edit Profile
            </Button>
          </Stack>
        </Box>

        {/* Header Profile Section */}
        <ProfileBanner>
          <Grid container spacing={4} alignItems="center">
            <Grid item>
              <Avatar
                src={pet.photo}
                sx={{
                  width: 140,
                  height: 140,
                  border: '6px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
              >
                <PetsIcon sx={{ fontSize: 60 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h2" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
                  {pet.name}
                </Typography>
                <Chip
                  label={pet.status || 'Active'}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 800,
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                />
              </Stack>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 2 }}>
                {pet.breed} • {pet.species} • {calculateAge(pet.dateOfBirth)}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{
                    borderRadius: '50px',
                    px: 3,
                    bgcolor: 'white',
                    color: '#4f46e5',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#f0f4f8' }
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ChatIcon />}
                  sx={{
                    borderRadius: '50px',
                    px: 3,
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    fontWeight: 700,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Chat with Vet
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
                '& .Mui-selected': { color: '#fff !important' },
                '& .MuiTabs-indicator': { backgroundColor: '#fff', height: '3px', borderRadius: '3px' }
              }}
            >
              <Tab label="Overview" />
              <Tab label="Medical Records" />
              <Tab label="Prescriptions" />
              <Tab label="Vaccinations" />
            </Tabs>
          </Box>
        </ProfileBanner>

        {/* Tab Content */}
        <Box sx={{ mt: 4 }}>
          {tabValue === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <GlassCard>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                      <WeightIcon color="primary" /> Physical Details
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Gender</Typography>
                        <Typography fontWeight="600" display="flex" alignItems="center" gap={0.5}>
                          {pet.gender === 'Male' ? <MaleIcon color="primary" /> : <FemaleIcon color="error" />}
                          {pet.gender}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Weight</Typography>
                        <Typography fontWeight="600">{pet.weight} kg</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Color</Typography>
                        <Typography fontWeight="600">{pet.color || 'N/A'}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </GlassCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <GlassCard>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                      <HospitalIcon color="primary" /> Medical Status
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Clinic</Typography>
                        <Typography fontWeight="600">{pet.clinicId?.name || 'N/A'}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Last Vaccination</Typography>
                        <Typography fontWeight="600">
                          {pet.lastVaccinationDate ? new Date(pet.lastVaccinationDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </GlassCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <GlassCard>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                      <CakeIcon color="primary" /> Birth Information
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Birthday</Typography>
                        <Typography fontWeight="600">
                          {pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </GlassCard>
              </Grid>

              <Grid item xs={12}>
                <GlassCard>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>About {pet.name}</Typography>
                    <Typography variant="body1" sx={{ mt: 2, color: '#475569', lineHeight: 1.6 }}>
                      {pet.notes || "No special notes recorded for this pawpal."}
                    </Typography>
                  </CardContent>
                </GlassCard>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="800" color="#334155">Vet Certified Records</Typography>
              {records.length > 0 ? records.map((record) => (
                <RecordItem key={record._id}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha('#4f46e5', 0.1) }}><RecordIcon sx={{ color: '#4f46e5' }} /></Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>{record.diagnosis}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Consulted on {new Date(record.date).toLocaleDateString()} • Dr. {record.vetId?.firstName} {record.vetId?.lastName}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                      {record.attachments?.map((file, idx) => (
                        <Button
                          key={idx}
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          href={file}
                          target="_blank"
                          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                        >
                          Download Record
                        </Button>
                      ))}
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2, p: 3, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>TREATMENT NOTES</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#334155' }}>
                          {record.treatmentNotes}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </RecordItem>
              )) : (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed #e2e8f0', bgcolor: 'transparent' }}>
                  <Typography color="text.secondary" variant="h6">No certified vet records found for this pawpal.</Typography>
                </Paper>
              )}

              <Divider sx={{ my: 4 }} />

              <Typography variant="h5" fontWeight="800" color="#334155">Personal Uploads</Typography>
              {pet.medicalRecords ? (
                <RecordItem>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#f1f5f9' }}><UploadIcon sx={{ color: '#64748b' }} /></Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Registration Document</Typography>
                        <Typography variant="body2" color="text.secondary">Initial documentation provided during registration</Typography>
                      </Box>
                    </Stack>
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      href={pet.medicalRecords}
                      target="_blank"
                      sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                      View Document
                    </Button>
                  </Stack>
                </RecordItem>
              ) : (
                <Typography variant="body2" color="text.secondary">No supplemental records uploaded.</Typography>
              )}
            </Stack>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              {prescriptions.length > 0 ? prescriptions.map((pres) => (
                <Grid item xs={12} md={6} key={pres._id}>
                  <GlassCard>
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction="row" spacing={2}>
                          <Avatar sx={{ bgcolor: alpha('#10b981', 0.1) }}><MedicineIcon sx={{ color: '#10b981' }} /></Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={800}>{pres.medicationName}</Typography>
                            <Typography variant="body2" color="text.secondary">Dosage: {pres.dosage}</Typography>
                          </Box>
                        </Stack>
                        <Tooltip title="Download PDF Prescription">
                          <IconButton onClick={() => downloadPrescription(pres._id, pres.medicationName)} sx={{ bgcolor: alpha('#4f46e5', 0.1), color: '#4f46e5' }}>
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="700">INSTRUCTIONS</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#334155' }}>{pres.instructions || 'Follow standard dosage provided by vet'}</Typography>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Next dose reminder: Daily
                        </Typography>
                        <Typography variant="caption" fontWeight="700" sx={{ color: '#4f46e5' }}>
                          Dr. {pres.medicalRecordId?.vetId?.lastName || 'Clinic Vet'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </GlassCard>
                </Grid>
              )) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed #e2e8f0', bgcolor: 'transparent' }}>
                    <Typography color="text.secondary" variant="h6">No active prescriptions found.</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {tabValue === 3 && (
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="800" color="#334155">Vaccination History</Typography>
              {vaccinations.length > 0 ? vaccinations.map((vax) => (
                <RecordItem key={vax._id}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha('#f43f5e', 0.1) }}><VaccineIcon sx={{ color: '#f43f5e' }} /></Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>{vax.medicationName}</Typography>
                          <Typography variant="body2" color="text.secondary">Status: Protocol Administered</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Box sx={{ display: 'inline-block', p: 1.5, bgcolor: alpha('#f43f5e', 0.05), borderRadius: '12px', border: '1px solid', borderColor: alpha('#f43f5e', 0.2) }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">NEXT BOOSTER DUE</Typography>
                        <Typography variant="h6" color="#f43f5e" fontWeight="900" sx={{ mt: -0.5 }}>
                          {vax.dueDate ? new Date(vax.dueDate).toLocaleDateString() : 'Protocol Completed'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </RecordItem>
              )) : (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '24px', border: '2px dashed #e2e8f0', bgcolor: 'transparent' }}>
                  <Typography color="text.secondary" variant="h6">No vaccination history found for this pawpal.</Typography>
                </Paper>
              )}
            </Stack>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default PetProfile;
