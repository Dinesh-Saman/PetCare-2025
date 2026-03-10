import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, Chip,
  Divider, Paper, Container, Stack, Tooltip, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Pagination
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
  Vaccines as VaccineIcon,
  MedicalServices as VetIcon,
  Person as UserIcon
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



const InfoLabel = styled(Typography)({
  fontWeight: 'bold',
  color: '#64748b',
  minWidth: '120px',
});

const InfoValue = styled(Typography)({
  color: '#1e293b',
});

const RecordCard = styled(Paper)(({ theme }) => ({
  padding: '20px 24px',
  borderRadius: '16px',
  border: '1px solid #f1f5f9',
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
    transform: 'translateY(-2px)'
  }
}));

const FileIconBox = styled(Box)(({ color }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(color, 0.1),
  color: color,
  marginRight: '20px'
}));

const SectionHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '24px',
  marginTop: '32px',
  '& .MuiSvgIcon-root': {
    color: '#4f46e5',
    fontSize: '24px'
  },
  '& h6': {
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: '-0.5px'
  }
});

const InstructionBox = styled(Box)(({ color = '#fffbeb', borderColor = '#fef3c7', textColor = '#92400e' }) => ({
  backgroundColor: color,
  border: `1px solid ${borderColor}`,
  borderRadius: '12px',
  padding: '16px',
  marginTop: '16px',
  marginBottom: '20px',
  '& .instruction-label': {
    fontWeight: 800,
    fontSize: '0.85rem',
    color: textColor,
    marginRight: '8px'
  },
  '& .instruction-text': {
    color: textColor,
    fontSize: '0.9rem',
    fontWeight: 500,
    lineHeight: 1.5
  }
}));

const DetailLabel = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 800,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px'
});

const DetailValue = styled(Typography)({
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#1e293b'
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
  const [vetPage, setVetPage] = useState(1);
  const [personalPage, setPersonalPage] = useState(1);
  const [presPage, setPresPage] = useState(1);
  const [vaccPage, setVaccPage] = useState(1);
  const RECORDS_PER_PAGE = 5;
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
    setVetPage(1);
    setPersonalPage(1);
    setPresPage(1);
    setVaccPage(1);
  };

  const downloadPrescription = async (presId, name, reportType = 'prescription') => {
    try {
      const response = await api.get(`/prescriptions/${presId}/pdf?reportType=${reportType}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType === 'vaccination' ? 'Vaccination' : 'Prescription'}_${name}.pdf`);
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
              variant="fullWidth"
              sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '16px 16px 0 0',
                borderBottom: '1px solid #f1f5f9',
                px: 1,
                '& .MuiTab-root': {
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.92rem',
                  py: 2,
                  position: 'relative', // Necessary for absolute positioning of pseudo-element
                  transition: 'all 0.3s ease',
                  '&:not(:last-child)::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: '25%',
                    height: '50%',
                    width: '1px',
                    backgroundColor: '#e2e8f0',
                  },
                  '&:hover': {
                    color: '#4f46e5',
                    backgroundColor: alpha('#4f46e5', 0.02),
                  },
                  '&.Mui-selected': {
                    color: '#4f46e5',
                    fontWeight: 800,
                    backgroundColor: '#ffffff', // Selected tab stands out in white
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    '&::after': { display: 'none' } // Hide divider when selected
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4f46e5',
                  height: '3px',
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab label="Overview" />
              <Tab label="Medical Records" />
              <Tab label="Prescriptions" />
              <Tab label="Vaccinations" />
            </Tabs>
          </Box>
        </ProfileBanner>

        <Box sx={{ mt: 4 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: '16px' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Pet Information</Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex' }}><InfoLabel>Species:</InfoLabel><InfoValue>{pet.species}</InfoValue></Box>
                    <Box sx={{ display: 'flex' }}><InfoLabel>Breed:</InfoLabel><InfoValue>{pet.breed || 'N/A'}</InfoValue></Box>
                    <Box sx={{ display: 'flex' }}><InfoLabel>Gender:</InfoLabel><InfoValue>{pet.gender || 'N/A'}</InfoValue></Box>
                    <Box sx={{ display: 'flex' }}><InfoLabel>Weight:</InfoLabel><InfoValue>{pet.weight ? `${pet.weight} kg` : 'N/A'}</InfoValue></Box>
                    <Box sx={{ display: 'flex' }}><InfoLabel>DOB:</InfoLabel><InfoValue>{pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A'}</InfoValue></Box>
                  </Stack>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Notes:</Typography>
                  <Typography variant="body2">{pet.notes || 'No notes available.'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: '16px' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Owner & Clinic</Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <OwnerIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Owner</Typography>
                        <Typography variant="body1" fontWeight="bold">{pet.ownerId?.firstName} {pet.ownerId?.lastName}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <HospitalIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Registered Clinic</Typography>
                        <Typography variant="body1" fontWeight="bold">{pet.registeredClinicId?.name || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              {/* Veterinarian Records Section */}
              <SectionHeader>
                <VetIcon />
                <Typography variant="h6">Veterinarian Records</Typography>
              </SectionHeader>

              {(() => {
                // Flatten all attachments from all records into a single list for pagination
                const allVetAttachments = [];
                [...records]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .forEach(record => {
                    record.attachments?.forEach(url => {
                      allVetAttachments.push({ record, url });
                    });
                  });

                const totalVetPages = Math.ceil(allVetAttachments.length / RECORDS_PER_PAGE);
                const displayedVetRecords = allVetAttachments.slice(
                  (vetPage - 1) * RECORDS_PER_PAGE,
                  vetPage * RECORDS_PER_PAGE
                );

                if (allVetAttachments.length === 0) {
                  return <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>No veterinarian records found.</Typography>;
                }

                return (
                  <>
                    {displayedVetRecords.map((item, idx) => {
                      const { record, url } = item;
                      const isPdf = url.toLowerCase().endsWith('.pdf');
                      return (
                        <RecordCard key={`${record._id}-${idx}`} elevation={0}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FileIconBox color={isPdf ? '#ef4444' : '#3b82f6'}>
                              {isPdf ? <PdfIcon /> : <ImageIcon />}
                            </FileIconBox>
                            <Box>
                              <Typography variant="body1" fontWeight="800" sx={{ color: '#1e293b', mb: 0.5 }}>
                                {record.diagnosis}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                                {new Date(record.date).toLocaleDateString()} • {isPdf ? 'PDF' : 'IMAGE'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
                                Dr. {record.vetId?.firstName} {record.vetId?.lastName}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton onClick={() => window.open(url)} sx={{ color: '#64748b' }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </RecordCard>
                      );
                    })}
                    {totalVetPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
                        <Pagination
                          count={totalVetPages}
                          page={vetPage}
                          onChange={(e, v) => setVetPage(v)}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    )}
                  </>
                );
              })()}

              {/* My Uploads Section */}
              <SectionHeader>
                <UserIcon />
                <Typography variant="h6">My Uploads</Typography>
              </SectionHeader>

              {(() => {
                // Combine legacy and personal records for sorting and pagination
                const allPersonal = [];
                if (pet.medicalRecords && typeof pet.medicalRecords === 'string' && pet.medicalRecords.startsWith('http')) {
                  allPersonal.push({
                    name: 'Pet Identity/Health Document',
                    url: pet.medicalRecords,
                    date: pet.createdAt || new Date(0), // Use creation date for legacy if available
                    type: 'Legacy upload'
                  });
                }

                (pet.personalRecords || []).forEach(r => {
                  allPersonal.push({ ...r, type: 'Personal upload' });
                });

                // Sort by date descending (most recent first)
                allPersonal.sort((a, b) => new Date(b.date) - new Date(a.date));

                const totalPersonalPages = Math.ceil(allPersonal.length / RECORDS_PER_PAGE);
                const displayedPersonal = allPersonal.slice(
                  (personalPage - 1) * RECORDS_PER_PAGE,
                  personalPage * RECORDS_PER_PAGE
                );

                if (allPersonal.length === 0) {
                  return <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>No personal uploads found.</Typography>;
                }

                return (
                  <>
                    <Stack spacing={2}>
                      {displayedPersonal.map((record, index) => {
                        const isPdf = record.url?.toLowerCase().endsWith('.pdf');
                        return (
                          <RecordCard key={index} elevation={0}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FileIconBox color={isPdf ? '#ef4444' : '#3b82f6'}>
                                {isPdf ? <PdfIcon /> : <ImageIcon />}
                              </FileIconBox>
                              <Box>
                                <Typography variant="body1" fontWeight="800" sx={{ color: '#1e293b', mb: 0.5 }}>
                                  {record.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                                  {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'} • {isPdf ? 'PDF' : 'IMAGE'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
                                  {record.type}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton onClick={() => window.open(record.url)} sx={{ color: '#64748b' }}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </RecordCard>
                        );
                      })}
                    </Stack>
                    {totalPersonalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                          count={totalPersonalPages}
                          page={personalPage}
                          onChange={(e, v) => setPersonalPage(v)}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    )}
                  </>
                );
              })()}

              <Box sx={{ pt: 3, textAlign: 'left' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#e2e8f0',
                    color: '#475569',
                    px: 3,
                    '&:hover': {
                      borderColor: '#cbd5e1',
                      backgroundColor: '#f8fafc'
                    }
                  }}
                >
                  Upload New Record
                  <input type="file" hidden onChange={handleUploadPersonalRecord} />
                </Button>
              </Box>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <SectionHeader>
                <MedicineIcon />
                <Typography variant="h6">Active Prescriptions</Typography>
              </SectionHeader>

              {(() => {
                const meds = prescriptions.filter(p => p.type === 'Medication');
                // Most recent first
                meds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                if (meds.length === 0) return (
                  <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '32px', border: '2px dashed #e2e8f0', bgcolor: alpha('#f1f5f9', 0.5) }}>
                    <MedicineIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography color="#64748b" variant="h6" fontWeight="800">No prescriptions found.</Typography>
                  </Paper>
                );

                const totalPresPages = Math.ceil(meds.length / RECORDS_PER_PAGE);
                const displayedMeds = meds.slice(
                  (presPage - 1) * RECORDS_PER_PAGE,
                  presPage * RECORDS_PER_PAGE
                );

                return (
                  <>
                    <Stack spacing={3}>
                      {displayedMeds.map((pres) => (
                        <Paper
                          key={pres._id}
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: '24px',
                            border: '1.5px solid #f1f5f9',
                            bgcolor: '#ffffff',
                            position: 'relative'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FileIconBox color="#10b981">
                                <MedicineIcon />
                              </FileIconBox>
                              <Typography variant="h5" fontWeight="900" color="#1e293b">
                                {pres.medicationName}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                              {new Date(pres.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>

                          <Grid container spacing={4} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                              <DetailLabel>Dosage</DetailLabel>
                              <DetailValue>{pres.dosage} {pres.duration ? `• ${pres.duration}` : ''}</DetailValue>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <DetailLabel>Prescribed By</DetailLabel>
                              <DetailValue>
                                {pres.medicalRecordId?.vetId
                                  ? `Dr. ${pres.medicalRecordId.vetId.firstName} ${pres.medicalRecordId.vetId.lastName}`
                                  : pres.createdBy
                                    ? `Dr. ${pres.createdBy.firstName} ${pres.createdBy.lastName}`
                                    : 'Attending Veterinarian'}
                              </DetailValue>
                            </Grid>
                          </Grid>

                          <InstructionBox>
                            <span className="instruction-label">Instructions:</span>
                            <span className="instruction-text">{pres.instructions || 'Follow as directed by the veterinarian.'}</span>
                          </InstructionBox>

                          <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => downloadPrescription(pres._id, pres.medicationName)}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '12px',
                              fontWeight: 800,
                              color: '#64748b',
                              borderColor: '#e2e8f0',
                              px: 3,
                              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                            }}
                          >
                            Download Prescription
                          </Button>
                        </Paper>
                      ))}
                    </Stack>
                    {totalPresPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                          count={totalPresPages}
                          page={presPage}
                          onChange={(e, v) => setPresPage(v)}
                          color="primary"
                        />
                      </Box>
                    )}
                  </>
                );
              })()}
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <SectionHeader>
                <VaccineIcon />
                <Typography variant="h6">Vaccination History</Typography>
              </SectionHeader>

              {(() => {
                const vaccinationRecords = prescriptions.filter(p => p.type !== 'Medication');
                // Most recent first
                vaccinationRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                if (vaccinationRecords.length === 0) {
                  return (
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '32px', border: '2px dashed #e2e8f0', bgcolor: alpha('#f1f5f9', 0.5) }}>
                      <VaccineIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                      <Typography color="#64748b" variant="h6" fontWeight="800">No vaccinations recorded.</Typography>
                    </Paper>
                  );
                }

                const totalVaccPages = Math.ceil(vaccinationRecords.length / RECORDS_PER_PAGE);
                const displayedVacc = vaccinationRecords.slice(
                  (vaccPage - 1) * RECORDS_PER_PAGE,
                  vaccPage * RECORDS_PER_PAGE
                );

                return (
                  <>
                    <Stack spacing={3}>
                      {displayedVacc.map((pres) => (
                        <Paper
                          key={pres._id}
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: '24px',
                            border: '1.5px solid #f1f5f9',
                            bgcolor: '#ffffff',
                            position: 'relative'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FileIconBox color="#7c3aed">
                                <VaccineIcon />
                              </FileIconBox>
                              <Box>
                                <Typography variant="h5" fontWeight="900" color="#1e293b">
                                  {pres.medicationName}
                                </Typography>
                                <Chip
                                  label={pres.type === 'Vaccination' ? 'Certified' : pres.type}
                                  size="small"
                                  sx={{
                                    mt: 1,
                                    bgcolor: alpha('#7c3aed', 0.1),
                                    color: '#7c3aed',
                                    fontWeight: 800,
                                    borderRadius: '8px'
                                  }}
                                />
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                              Administered: {new Date(pres.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>

                          <Grid container spacing={4} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                              <DetailLabel>Dosage</DetailLabel>
                              <DetailValue>{pres.dosage || 'Standard dose'}</DetailValue>
                            </Grid>
                          </Grid>

                          <InstructionBox color="#f5f3ff" borderColor="#ddd6fe" textColor="#5b21b6">
                            <span className="instruction-label">Next Booster Due:</span>
                            <span className="instruction-text" style={{ fontWeight: 800, fontSize: '1rem' }}>
                              {pres.dueDate ? new Date(pres.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                            </span>
                          </InstructionBox>

                          <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => downloadPrescription(pres._id, pres.medicationName, 'vaccination')}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '12px',
                              fontWeight: 800,
                              color: '#64748b',
                              borderColor: '#e2e8f0',
                              px: 3,
                              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                            }}
                          >
                            Download Vaccination Report
                          </Button>
                        </Paper>
                      ))}
                    </Stack>
                    {totalVaccPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                          count={totalVaccPages}
                          page={vaccPage}
                          onChange={(e, v) => setVaccPage(v)}
                          color="secondary"
                        />
                      </Box>
                    )}
                  </>
                );
              })()}
            </Box>
          )}
        </Box>

        {/* Edit Pet Dialog */}
        <Dialog
          open={openEditPet}
          onClose={() => setOpenEditPet(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '24px' } }}
        >
          <DialogTitle sx={{ p: 4, pb: 1 }}>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#1e293b' }}>Edit Patient Profile</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Keep your pet's information up to date</Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mt: 1 }}>
              <TextField fullWidth label="Pet Name *" value={editPetForm.name} onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })} />
              <TextField fullWidth label="Species *" value={editPetForm.species} onChange={(e) => setEditPetForm({ ...editPetForm, species: e.target.value })} />
              <TextField fullWidth label="Breed" value={editPetForm.breed} onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" value={editPetForm.gender} onChange={(e) => setEditPetForm({ ...editPetForm, gender: e.target.value })}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={editPetForm.dateOfBirth} onChange={(e) => setEditPetForm({ ...editPetForm, dateOfBirth: e.target.value })} />
              <TextField fullWidth label="Weight (kg)" type="number" value={editPetForm.weight} onChange={(e) => setEditPetForm({ ...editPetForm, weight: e.target.value })} />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField fullWidth label="Clinical Notes" multiline rows={4} value={editPetForm.notes} onChange={(e) => setEditPetForm({ ...editPetForm, notes: e.target.value })} />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2 }}>
            <Button onClick={() => setOpenEditPet(false)} sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleUpdatePet}
              disabled={savingPet}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                px: 4,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
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
