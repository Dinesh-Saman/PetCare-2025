import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, Chip,
  Divider, Paper, Container, Stack, Tooltip, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled, alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Cake as CakeIcon,
  MonitorWeight as WeightIcon,
  ColorLens as ColorIcon,
  LocalHospital as HospitalIcon,
  Timeline as VitalIcon,
  Info as InfoIcon,
  Person as OwnerIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
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
import Navbar from '../../components/Navbar';

// Styled Components
const PageContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  paddingTop: '32px',
  paddingBottom: '64px',
});

const ProfileBanner = styled(Card)({
  borderRadius: '24px',
  background: '#ffffff',
  padding: '40px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0',
  marginBottom: '40px',
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
  padding: '16px 24px',
  borderRadius: '12px',
  border: '1px solid #f1f5f9',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0'
  }
});

const InfoBox = styled(Box)({
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  height: '100%',
  '& .info-label': {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    color: '#64748b',
    fontSize: '0.7rem',
  },
  '& .info-value': {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 800,
    color: '#1e293b',
    fontSize: '1.1rem',
  }
});

const InstructionBox = styled(Box)({
  backgroundColor: '#fffbeb',
  border: '1px solid #fef3c7',
  borderRadius: '12px',
  padding: '16px',
  marginTop: '16px',
  marginBottom: '16px',
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
  const [openEditPet, setOpenEditPet] = useState(false);
  const [savingPet, setSavingPet] = useState(false);
  const [editPetForm, setEditPetForm] = useState({
    name: '', species: '', breed: '', dateOfBirth: '', gender: '', weight: '', color: '', notes: '', photo: ''
  });

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

      // Fetch prescriptions (include all for the prescriptions tab)
      const presRes = await api.get(`/prescriptions/pet/${id}`);
      const allPres = presRes.data.prescriptions || [];

      // Store ALL prescriptions in the main state for the tab
      setPrescriptions(allPres.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      // Keep a filtered version for any other potential specific displays
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

  const handleOpenEditPet = () => {
    setEditPetForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      dateOfBirth: pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : '',
      gender: pet.gender || '',
      weight: pet.weight || '',
      color: pet.color || '',
      notes: pet.notes || '',
      photo: pet.photo || ''
    });
    setOpenEditPet(true);
  };

  const handleUpdatePet = async () => {
    setSavingPet(true);
    try {
      const response = await api.put(`/pets/${pet._id}`, editPetForm);
      setPet(response.data.pet || response.data);
      Swal.fire({ title: 'Updated!', text: 'Pet has been updated successfully.', icon: 'success', toast: true, position: 'top-end', timer: 2500, showConfirmButton: false });
      setOpenEditPet(false);
    } catch (error) {
      console.error('Error updating pet:', error);
      Swal.fire('Error', 'Failed to update pet details', 'error');
    } finally {
      setSavingPet(false);
    }
  };

  const handleUploadPersonalRecord = async (e) => {
    console.log('Upload function triggered');
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('File detected:', file.name, file.size);

    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we secure your document',
      allowOutsideClick: false,
      didOpen: () => {
        console.log('Spinner activated');
        Swal.showLoading();
      }
    });

    const d = new FormData();
    d.append('file', file);
    d.append('upload_preset', 'petcare_preset');

    try {
      console.log('Starting Cloudinary upload...');
      const r = await fetch('https://api.cloudinary.com/v1_1/dy78lcfqg/auto/upload', {
        method: 'POST',
        body: d
      });
      const data = await r.json();
      console.log('Cloudinary data received:', data);

      if (data.secure_url) {
        console.log('Upload successful, updating backend...');
        const newRecord = {
          name: file.name.split('.')[0] || 'Medical Record',
          url: data.secure_url,
          date: new Date()
        };

        const updatedPersonalRecords = [...(pet.personalRecords || []), newRecord];

        await api.put(`/pets/${pet._id}`, { personalRecords: updatedPersonalRecords });

        setPet(prev => ({ ...prev, personalRecords: updatedPersonalRecords }));

        Swal.fire({
          title: 'Success!',
          text: 'Record uploaded successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire('Error', 'Failed to upload document. Please check your connection.', 'error');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Navbar />
        <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 15 }}>
          <Typography>Loading pet profile...</Typography>
        </Container>
      </PageContainer>
    );
  }

  if (!pet) return null;

  return (
    <PageContainer>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: { xs: 12, md: 15 } }}>
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
              onClick={() => navigate(`/owner/chat?petId=${pet._id}`)}
              sx={{ borderRadius: '12px', fontWeight: 600, px: 3 }}
            >
              Chat with Vet
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => handleOpenEditPet()}
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
                  border: '6px solid #f8fafc',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                }}
              >
                <PetsIcon sx={{ fontSize: 60 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h2" fontWeight="900" sx={{ letterSpacing: '-0.5px', color: '#1e293b' }}>
                  {pet.name}
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500, mb: 3 }}>
                {pet.species}
              </Typography>

            </Grid>
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                borderBottom: '1px solid #e2e8f0',
                '& .MuiTab-root': {
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  minWidth: 160,
                  transition: '0.2s',
                  '&.Mui-selected': {
                    color: '#4f46e5',
                    backgroundColor: alpha('#4f46e5', 0.04),
                  }
                },
                '& .MuiTabs-indicator': { backgroundColor: '#4f46e5', height: '3px', borderRadius: '3px 3px 0 0' }
              }}
            >
              <Tab label="Overview" />
              <Tab label="Medical Records" />
              <Tab label="Prescriptions" />
            </Tabs>
          </Box>
        </ProfileBanner>

        <Box sx={{ mt: 4 }}>
          {tabValue === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                      <InfoIcon sx={{ color: '#4f46e5' }} />
                      <Typography variant="h6" fontWeight="800" color="#1e293b">Pet Information</Typography>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <InfoBox>
                          <Typography className="info-label">Age</Typography>
                          <Typography className="info-value">{calculateAge(pet.dateOfBirth)}</Typography>
                        </InfoBox>
                      </Grid>
                      <Grid item xs={6}>
                        <InfoBox>
                          <Typography className="info-label">Weight</Typography>
                          <Typography className="info-value">{pet.weight ? `${pet.weight}kg` : '—'}</Typography>
                        </InfoBox>
                      </Grid>
                      <Grid item xs={6}>
                        <InfoBox>
                          <Typography className="info-label">Gender</Typography>
                          <Typography className="info-value">{pet.gender || '—'}</Typography>
                        </InfoBox>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                      <OwnerIcon sx={{ color: '#4f46e5' }} />
                      <Typography variant="h6" fontWeight="800" color="#1e293b">Owner Details</Typography>
                    </Stack>

                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">Primary Owner</Typography>
                        <Typography variant="body1" fontWeight="800" color="#1e293b">
                          {pet.ownerId?.firstName} {pet.ownerId?.lastName}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">Contact Number</Typography>
                        <Typography variant="body1" fontWeight="800" color="#1e293b">
                          {pet.ownerId?.phoneNumber || '+1 (555) 123-4567'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">Home Clinic</Typography>
                        <Typography variant="body1" fontWeight="800" color="#1e293b">
                          {pet.registeredClinicId?.name || 'Not Registered'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: 'none', bgcolor: '#f8fafc' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="800" gutterBottom>ADDITIONAL NOTES</Typography>
                    <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                      {pet.notes || "No special notes recorded for this pawpal."}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Stack spacing={4}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <HospitalIcon sx={{ color: '#4f46e5', fontSize: '1.4rem' }} />
                  <Typography variant="h6" fontWeight="900" color="#1e293b">Veterinarian Records</Typography>
                </Stack>
                <Stack spacing={2}>
                  {records.length > 0 ? records.map((record) => (
                    <RecordItem key={record._id}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha('#ef4444', 0.1), borderRadius: '8px' }}>
                          <PdfIcon sx={{ color: '#ef4444', fontSize: '1.2rem' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="800" color="#1e293b">{record.diagnosis}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')} • PDF
                          </Typography>
                          <Typography variant="caption" display="block" color="#64748b" sx={{ mt: 0.5, fontWeight: 500 }}>
                            {record.treatmentNotes || 'No additional notes provided'}
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton onClick={() => record.attachments?.[0] && window.open(record.attachments[0])}>
                        <DownloadIcon sx={{ fontSize: '1.2rem', color: '#64748b' }} />
                      </IconButton>
                    </RecordItem>
                  )) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No veterinarian records found.</Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <OwnerIcon sx={{ color: '#4f46e5', fontSize: '1.4rem' }} />
                  <Typography variant="h6" fontWeight="900" color="#1e293b">My Uploads</Typography>
                </Stack>
                <Stack spacing={2}>
                  {pet.medicalRecords && (
                    <RecordItem>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha('#4f46e5', 0.1), borderRadius: '8px' }}>
                          <PdfIcon sx={{ color: '#4f46e5', fontSize: '1.2rem' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="800" color="#1e293b">Registration Document</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {new Date(pet.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')} • PDF
                          </Typography>
                          <Typography variant="caption" display="block" color="#64748b" sx={{ mt: 0.5, fontWeight: 500 }}>
                            Initial registration documentation
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton onClick={() => window.open(pet.medicalRecords)}>
                        <DownloadIcon sx={{ fontSize: '1.2rem', color: '#64748b' }} />
                      </IconButton>
                    </RecordItem>
                  )}

                  {pet.personalRecords && pet.personalRecords.map((record, index) => (
                    <RecordItem key={index}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha('#4f46e5', 0.1), borderRadius: '8px' }}>
                          <PdfIcon sx={{ color: '#4f46e5', fontSize: '1.2rem' }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="800" color="#1e293b">{record.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')} • PDF
                          </Typography>
                          <Typography variant="caption" display="block" color="#64748b" sx={{ mt: 0.5, fontWeight: 500 }}>
                            Personal upload
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton onClick={() => window.open(record.url)}>
                        <DownloadIcon sx={{ fontSize: '1.2rem', color: '#64748b' }} />
                      </IconButton>
                    </RecordItem>
                  ))}

                  {!pet.medicalRecords && (!pet.personalRecords || pet.personalRecords.length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No personal uploads found.</Typography>
                  )}
                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AddIcon />}
                      size="small"
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#1e293b' }}
                    >
                      Upload New Record
                      <input type="file" hidden onChange={handleUploadPersonalRecord} />
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}

          {tabValue === 2 && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <MedicineIcon sx={{ color: '#4f46e5', fontSize: '1.4rem' }} />
                <Typography variant="h6" fontWeight="900" color="#1e293b">Active Prescriptions</Typography>
              </Stack>
              <Grid container spacing={3}>
                {prescriptions.length > 0 ? prescriptions.map((pres) => (
                  <Grid item xs={12} key={pres._id}>
                    <Card sx={{ borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: 'none', position: 'relative', overflow: 'visible' }}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{
                              bgcolor: pres.type === 'Vaccination' ? alpha('#7c3aed', 0.1) : alpha('#10b981', 0.1),
                              width: 52,
                              height: 52,
                              borderRadius: '14px'
                            }}>
                              {pres.type === 'Vaccination' ?
                                <VaccineIcon sx={{ color: '#7c3aed', fontSize: '1.6rem' }} /> :
                                <MedicineIcon sx={{ color: '#10b981', fontSize: '1.6rem' }} />
                              }
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight="900" color="#1e293b" sx={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
                                {pres.medicationName}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Chip
                                  label={pres.type}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    bgcolor: pres.type === 'Vaccination' ? '#f5f3ff' : '#f0fdf4',
                                    color: pres.type === 'Vaccination' ? '#7c3aed' : '#166534',
                                    border: '1px solid',
                                    borderColor: pres.type === 'Vaccination' ? '#ddd6fe' : '#bbf7d0'
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary" fontWeight="700">
                                  {new Date(pres.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          {pres.dueDate && pres.type === 'Vaccination' && (
                            <Box sx={{
                              textAlign: 'right',
                              p: '10px 16px',
                              bgcolor: '#fff7ed',
                              borderRadius: '12px',
                              border: '1px solid #ffedd5'
                            }}>
                              <Typography variant="caption" color="#9a3412" fontWeight="800" display="block" sx={{ letterSpacing: '0.5px' }}>NEXT DUE DATE</Typography>
                              <Typography variant="body2" color="#c2410c" fontWeight="900">
                                {new Date(pres.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </Typography>
                            </Box>
                          )}
                        </Stack>

                        <Grid container spacing={4} sx={{ mb: 3 }}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ letterSpacing: '1px' }}>DOSAGE/DETAIL</Typography>
                            <Typography variant="body1" fontWeight="800" sx={{ mt: 0.5, color: '#334155' }}>{pres.dosage || 'Standard'}</Typography>
                          </Grid>
                          {pres.duration && (
                            <Grid item xs={12} sm={4}>
                              <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ letterSpacing: '1px' }}>DURATION/FREQUENCY</Typography>
                              <Typography variant="body1" fontWeight="800" sx={{ mt: 0.5, color: '#334155' }}>{pres.duration}</Typography>
                            </Grid>
                          )}
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ letterSpacing: '1px' }}>PRESCRIBED BY</Typography>
                            <Typography variant="body1" fontWeight="800" sx={{ mt: 0.5, color: '#334155' }}>
                              {pres.createdBy?.firstName ? `Dr. ${pres.createdBy.firstName} ${pres.createdBy.lastName}` :
                                (pres.medicalRecordId?.vetId?.firstName ? `Dr. ${pres.medicalRecordId.vetId.firstName} ${pres.medicalRecordId.vetId.lastName}` : 'Medical Staff')}
                            </Typography>
                          </Grid>
                        </Grid>

                        <InstructionBox>
                          <Typography variant="body2" fontWeight="800" color="#92400e" display="inline">Medical Instructions & Notes: </Typography>
                          <Typography variant="body2" display="inline" sx={{ color: '#92400e', fontWeight: 500 }}>
                            {pres.instructions || 'No specific instructions provided. Follow standard administration procedures.'}
                          </Typography>
                        </InstructionBox>

                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                          <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<DownloadIcon />}
                            onClick={() => downloadPrescription(pres._id, pres.medicationName)}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 700,
                              borderColor: '#e2e8f0',
                              color: '#475569',
                              px: 3,
                              '&:hover': {
                                bgcolor: '#f8fafc',
                                borderColor: '#cbd5e1'
                              }
                            }}
                          >
                            Download {pres.type === 'Vaccination' ? 'Certification' : 'Prescription'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )) : (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '32px', border: '2px dashed #e2e8f0', bgcolor: alpha('#f1f5f9', 0.5) }}>
                      <Box sx={{ mb: 2 }}>
                        <MedicineIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                      </Box>
                      <Typography color="#64748b" variant="h6" fontWeight="800">No medical records or prescriptions found.</Typography>
                      <Typography color="#94a3b8" variant="body2" sx={{ mt: 1 }}>All your pet's professional medical treatments will appear here.</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Box>

        {/* Edit Pet Dialog */}
        <Dialog
          open={openEditPet}
          onClose={() => setOpenEditPet(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          <DialogTitle sx={{ p: 4, pb: 1 }}>
            <Typography variant="h5" fontWeight="800" sx={{ color: '#1e293b' }}>Edit {pet.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>Update your pet's information</Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 4, pt: 5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField fullWidth label="Pet Name *" value={editPetForm.name} onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })} />
              <TextField fullWidth label="Species *" value={editPetForm.species} onChange={(e) => setEditPetForm({ ...editPetForm, species: e.target.value })} placeholder="Dog, Cat..." />
              <TextField fullWidth label="Breed" value={editPetForm.breed} onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" value={editPetForm.gender} onChange={(e) => setEditPetForm({ ...editPetForm, gender: e.target.value })}>
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={editPetForm.dateOfBirth} onChange={(e) => setEditPetForm({ ...editPetForm, dateOfBirth: e.target.value })} />
              <TextField fullWidth label="Weight (kg)" type="number" value={editPetForm.weight} onChange={(e) => setEditPetForm({ ...editPetForm, weight: e.target.value })} />
              <TextField fullWidth label="Color/Markings" value={editPetForm.color} onChange={(e) => setEditPetForm({ ...editPetForm, color: e.target.value })} />

              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={editPetForm.photo}
                  sx={{ width: 56, height: 56, border: '2px solid #e2e8f0' }}
                >
                  <PetsIcon />
                </Avatar>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ borderRadius: '8px', py: 1.5, borderStyle: 'dashed', borderColor: '#4f46e5', color: '#4f46e5', height: '100%' }}
                >
                  Change Photo
                  <input
                    type="file" hidden accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const d = new FormData();
                      d.append('file', file);
                      d.append('upload_preset', 'petcare_preset');
                      try {
                        const r = await fetch('https://api.cloudinary.com/v1_1/dy78lcfqg/image/upload', { method: 'POST', body: d });
                        const data = await r.json();
                        setEditPetForm({ ...editPetForm, photo: data.secure_url });
                        Swal.fire({ title: 'Uploaded!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                      } catch { Swal.fire('Error', 'Upload failed', 'error'); }
                    }}
                  />
                </Button>
              </Stack>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField fullWidth label="Additional Notes" multiline rows={4} value={editPetForm.notes} onChange={(e) => setEditPetForm({ ...editPetForm, notes: e.target.value })} placeholder="Allergies, conditions, etc..." />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 3 }}>
            <Button onClick={() => setOpenEditPet(false)} sx={{ borderRadius: '12px', fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
            <Button
              variant="contained" onClick={handleUpdatePet} disabled={savingPet}
              sx={{
                borderRadius: '12px', fontWeight: 700, px: 4,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
                '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)' }
              }}
            >
              {savingPet ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </PageContainer>
  );
};

export default PetProfile;
