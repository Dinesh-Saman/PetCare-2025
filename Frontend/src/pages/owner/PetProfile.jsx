import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, Chip,
  Divider, Paper, Container, Stack, Tooltip, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Pagination,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, Link
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
  Person as UserIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Description as FileIcon
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
  const location = useLocation();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(location.state?.targetTab || 0);
  const [highlightedId, setHighlightedId] = useState(location.state?.highlightId || null);
  const [medPage, setMedPage] = useState(1);
  const [vetPage, setVetPage] = useState(1);
  const [personalPage, setPersonalPage] = useState(1);
  const [presPage, setPresPage] = useState(1);
  const [vaccPage, setVaccPage] = useState(1);
  const RECORDS_PER_PAGE = 5;
  const [expandedMedRows, setExpandedMedRows] = useState(new Set());
  const toggleMedExpand = (id) => {
    const newSet = new Set(expandedMedRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedMedRows(newSet);
  };
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [openEditPet, setOpenEditPet] = useState(false);
  const [savingPet, setSavingPet] = useState(false);
  const [editPetForm, setEditPetForm] = useState({
    name: '', species: '', breed: '', dateOfBirth: '', gender: '', weight: '', color: '', notes: '', photo: ''
  });
  const highlightRef = useRef(null);

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
      let finalPres = [...allPres];

      // Also check for medical records with prescriptionUrl but NO linked structured prescriptions
      const recordsWithFiles = recordsRes.data.records?.filter(r => r.prescriptionUrl) || [];
      recordsWithFiles.forEach(record => {
        const hasStructured = allPres.some(p => (p.medicalRecordId?._id || p.medicalRecordId)?.toString() === record._id.toString());
        if (!hasStructured) {
          finalPres.push({
            _id: `file-${record._id}`,
            medicationName: 'Uploaded Prescription Document',
            dosage: 'See attached file',
            instructions: record.diagnosis || 'Prescribed by veterinarian',
            createdAt: record.date,
            medicalRecordId: record, // already contains prescriptionUrl
            isVirtual: true
          });
        }
      });

      setPrescriptions(finalPres.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }
  };

  // Scroll to and highlight the notification-linked record
  useEffect(() => {
    if (!highlightedId || loading) return;

    const timer = setTimeout(() => {
      const elementId = `record-${highlightedId}`;
      const el = document.getElementById(elementId);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Remove highlight after 4 seconds
        const fadeTimer = setTimeout(() => setHighlightedId(null), 4000);
        return () => clearTimeout(fadeTimer);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [highlightedId, loading, tabValue]);

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

  const handleDownload = async (url, fileName) => {
    if (!url) return;

    try {
      // Ensure fileName has an extension if not present
      let finalFileName = fileName;
      if (!fileName.includes('.')) {
        const extension = url.split('.').pop().split('?')[0];
        if (extension && extension.length <= 4) {
          finalFileName = `${fileName}.${extension}`;
        }
      }

      // If it's a Cloudinary URL, we can force download by adding fl_attachment
      let downloadUrl = url;
      if (url.includes('cloudinary.com')) {
        downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = finalFileName;
        link.target = '_self';
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      // For other URLs, try the blob approach
      const response = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', finalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const downloadPrescription = async (presId, name, reportType = 'prescription') => {
    try {
      const response = await api.get(`/prescriptions/${presId}/pdf?reportType=${reportType}`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const fileName = `${reportType === 'vaccination' ? 'Vaccination' : 'Prescription'}_${name}.pdf`;
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('PDF Download error:', error);
      Swal.fire('Error', 'Failed to download PDF', 'error');
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
      Swal.fire({
        title: 'Updated!',
        text: 'Pet has been updated successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setOpenEditPet(false);
    } catch (error) {
      console.error('Error updating pet:', error);
      Swal.fire('Error', 'Failed to update pet details', 'error');
    } finally {
      setSavingPet(false);
    }
  };

  const handleDeletePet = async () => {
    const result = await Swal.fire({
      title: `Delete ${pet.name}'s Profile?`,
      text: "This will permanently remove all medical records and history. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete Profile',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/pets/${id}`);
        Swal.fire({
          title: 'Deleted!',
          text: 'Pet profile has been removed.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/owner/profile');
      } catch (error) {
        console.error('Error deleting pet:', error);
        Swal.fire('Error', 'Failed to delete pet profile', 'error');
      }
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

        const response = await api.put(`/pets/${pet._id}`, { personalRecords: updatedPersonalRecords });
        setPet(response.data.pet || response.data);

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

  const handleDeletePersonalRecord = async (recordId, recordName) => {
    const result = await Swal.fire({
      title: 'Remove Record?',
      text: `Are you sure you want to delete "${recordName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/pets/${pet._id}/personal-records/${recordId}`);
        setPet(response.data.pet || response.data);
        Swal.fire({
          title: 'Deleted!',
          text: 'The record has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting record:', error);
        Swal.fire('Error', 'Failed to delete record', 'error');
      }
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
              disabled={pet.registrationStatus !== 'Approved'}
              sx={{ borderRadius: '12px', fontWeight: 600, px: 3 }}
              title={pet.registrationStatus !== 'Approved' ? "Chat is only available for approved pets" : ""}
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
            <IconButton
              onClick={handleDeletePet}
              sx={{
                color: '#ef4444',
                bgcolor: 'rgba(239, 68, 68, 0.05)',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#b91c1c'
                },
                borderRadius: '12px',
                p: 1.5
              }}
            >
              <DeleteIcon />
            </IconButton>
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
              <Tab label="Pet Info" />
              <Tab label="Medical Notes" />
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
              <SectionHeader>
                <HospitalIcon />
                <Typography variant="h6">Medical History & Notes</Typography>
              </SectionHeader>

              {(() => {
                const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
                const totalMedPages = Math.ceil(sortedRecords.length / RECORDS_PER_PAGE);
                const displayedNotes = sortedRecords.slice((medPage - 1) * RECORDS_PER_PAGE, medPage * RECORDS_PER_PAGE);

                if (sortedRecords.length === 0) return (
                  <Card sx={{ borderRadius: '24px', border: '1.5px dashed #e2e8f0', bgcolor: '#ffffff', mb: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                    <CardContent sx={{ py: 8, textAlign: 'center' }}>
                      <HospitalIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                      <Typography color="#64748b" variant="h6" fontWeight="800">No medical notes found.</Typography>
                    </CardContent>
                  </Card>
                );

                return (
                  <Card sx={{ borderRadius: '24px', bgcolor: '#ffffff', mb: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }} elevation={0}>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell width={50} />
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Diagnosis</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Veterinarian</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedNotes.map((record) => {
                            const isExpanded = expandedMedRows.has(record._id);
                            return (
                              <React.Fragment key={record._id}>
                                <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                  <TableCell>
                                    <IconButton size="small" onClick={() => toggleMedExpand(record._id)}>
                                      <ExpandMoreIcon sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                                    </IconButton>
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                    {new Date(record.date).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{record.diagnosis}</TableCell>
                                  <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                                    Dr. {record.vetId?.firstName} {record.vetId?.lastName}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Tooltip title={isExpanded ? "Hide Details" : "View Details"}>
                                      <IconButton size="small" onClick={() => toggleMedExpand(record._id)} sx={{ color: '#4f46e5' }}>
                                        <ViewIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell colSpan={5} sx={{ py: 0, px: 4 }}>
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                      <Box sx={{ py: 3, borderLeft: '4px solid #4f46e5', pl: 3, my: 1, bgcolor: alpha('#4f46e5', 0.02) }}>
                                        <Typography variant="subtitle2" fontWeight="800" color="#4f46e5" gutterBottom>Diagnosis:</Typography>
                                        <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 600, mb: 2 }}>
                                          {record.diagnosis || 'Test'}
                                        </Typography>

                                        <Typography variant="subtitle2" fontWeight="800" color="#4f46e5" gutterBottom>Treatment Notes:</Typography>
                                        <Typography variant="body2" sx={{ color: '#1e293b', whiteSpace: 'pre-wrap', mb: 2, lineHeight: 1.6 }}>
                                          {record.treatmentNotes || 'No specific treatment notes recorded.'}
                                        </Typography>

                                        {record.recommendations && (
                                          <>
                                            <Typography variant="subtitle2" fontWeight="800" color="#4f46e5" gutterBottom>Recommendations:</Typography>
                                            <Typography variant="body2" sx={{ color: '#1e293b', whiteSpace: 'pre-wrap', mb: 2, lineHeight: 1.6 }}>
                                              {record.recommendations}
                                            </Typography>
                                          </>
                                        )}

                                        <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>
                                            Appointment:
                                          </Typography>
                                          <Link
                                            component="button"
                                            variant="caption"
                                            onClick={() => navigate('/owner/my-appointments', { state: { highlightId: (record.appointmentId?._id || record.appointmentId)?.toString() } })}
                                            sx={{
                                              fontWeight: 700,
                                              color: '#4f46e5',
                                              textDecoration: 'none',
                                              '&:hover': { textDecoration: 'underline' }
                                            }}
                                          >
                                            {new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </Link>
                                        </Box>
                                      </Box>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {totalMedPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #f1f5f9' }}>
                        <Pagination count={totalMedPages} page={medPage} onChange={(e, v) => setMedPage(v)} color="primary" size="small" />
                      </Box>
                    )}
                  </Card>
                );
              })()}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              {/* Veterinarian Records Section */}
              <SectionHeader>
                <VetIcon />
                <Typography variant="h6">Veterinarian Records</Typography>
              </SectionHeader>

              {(() => {
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
                  return (
                    <Card sx={{ borderRadius: '24px', border: '1.5px dashed #e2e8f0', bgcolor: '#ffffff', mb: 4, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                      <CardContent sx={{ py: 8, textAlign: 'center' }}>
                        <VetIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                        <Typography color="#64748b" variant="h6" fontWeight="800">No veterinarian records found.</Typography>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card sx={{ borderRadius: '24px', bgcolor: '#ffffff', mb: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }} elevation={0}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b', py: 2 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Diagnosis</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Veterinarian</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>File Type</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedVetRecords.map((item, idx) => {
                            const { record, url } = item;
                            const isPdf = url.toLowerCase().endsWith('.pdf');
                            const isText = url.toLowerCase().endsWith('.txt');
                            const appIdStr = record.appointmentId?._id?.toString() || record.appointmentId?.toString();
                            const itemHighlight = appIdStr === highlightedId;

                            return (
                              <TableRow
                                key={`${record._id}-${idx}`}
                                id={`record-${appIdStr}`}
                                sx={{
                                  bgcolor: itemHighlight ? alpha('#4f46e5', 0.05) : 'inherit',
                                  borderLeft: itemHighlight ? '4px solid #4f46e5' : 'none',
                                  '&:hover': { bgcolor: '#f9fafb' }
                                }}
                              >
                                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                  {new Date(record.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                                  {record.diagnosis}
                                </TableCell>
                                <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                                  Dr. {record.vetId?.firstName} {record.vetId?.lastName}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={isPdf ? <PdfIcon sx={{ fontSize: '1rem !important' }} /> : isText ? <FileIcon sx={{ fontSize: '1rem !important' }} /> : <ImageIcon sx={{ fontSize: '1rem !important' }} />}
                                    label={isPdf ? 'PDF' : isText ? 'TEXT' : 'IMAGE'}
                                    size="small"
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: '0.7rem',
                                      bgcolor: alpha(isPdf ? '#ef4444' : isText ? '#64748b' : '#3b82f6', 0.1),
                                      color: isPdf ? '#ef4444' : isText ? '#64748b' : '#3b82f6'
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    onClick={() => handleDownload(url, `Record_${record.diagnosis}_${new Date(record.date).toLocaleDateString()}.pdf`)}
                                    sx={{ color: '#64748b', '&:hover': { color: '#4f46e5', bgcolor: alpha('#4f46e5', 0.05) } }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {totalVetPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #f1f5f9' }}>
                        <Pagination count={totalVetPages} page={vetPage} onChange={(e, v) => setVetPage(v)} color="primary" size="small" />
                      </Box>
                    )}
                  </Card>
                );
              })()}

              <SectionHeader>
                <UserIcon />
                <Typography variant="h6">My Uploads</Typography>
              </SectionHeader>

              {(() => {
                const allPersonal = [];
                if (pet.medicalRecords && typeof pet.medicalRecords === 'string' && pet.medicalRecords.startsWith('http')) {
                  allPersonal.push({ name: 'Health Document', url: pet.medicalRecords, date: pet.createdAt || new Date(0), type: 'Legacy' });
                }
                (pet.personalRecords || []).forEach(r => allPersonal.push({ ...r, type: 'Personal' }));
                allPersonal.sort((a, b) => new Date(b.date) - new Date(a.date));

                const totalPersonalPages = Math.ceil(allPersonal.length / RECORDS_PER_PAGE);
                const displayedPersonal = allPersonal.slice((personalPage - 1) * RECORDS_PER_PAGE, personalPage * RECORDS_PER_PAGE);

                if (allPersonal.length === 0) return (
                  <Card sx={{ borderRadius: '24px', border: '1.5px dashed #e2e8f0', bgcolor: '#ffffff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                    <CardContent sx={{ py: 8, textAlign: 'center' }}>
                      <UserIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                      <Typography color="#64748b" variant="h6" fontWeight="800">No personal uploads found.</Typography>
                    </CardContent>
                  </Card>
                );

                return (
                  <Card sx={{ borderRadius: '24px', bgcolor: '#ffffff', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }} elevation={0}>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Record Name</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Source</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>File Type</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedPersonal.map((record, index) => {
                            const isPdf = record.url?.toLowerCase().endsWith('.pdf');
                            const isText = record.url?.toLowerCase().endsWith('.txt');
                            return (
                              <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                  {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{record.name}</TableCell>
                                <TableCell>
                                  <Chip label={record.type} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={isPdf ? <PdfIcon sx={{ fontSize: '1rem !important' }} /> : isText ? <FileIcon sx={{ fontSize: '1rem !important' }} /> : <ImageIcon sx={{ fontSize: '1rem !important' }} />}
                                    label={isPdf ? 'PDF' : isText ? 'TEXT' : 'IMAGE'}
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: '0.7rem', color: isPdf ? '#ef4444' : '#3b82f6', bgcolor: 'transparent' }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Stack direction="row" spacing={0.5} justifyContent="center">
                                    <IconButton
                                      onClick={() => handleDownload(record.url, record.name || 'PersonalRecord')}
                                      sx={{ color: '#64748b', '&:hover': { color: '#4f46e5' } }}
                                    >
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                    {record._id && (
                                      <IconButton onClick={() => handleDeletePersonalRecord(record._id, record.name)} sx={{ color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.05) } }}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {totalPersonalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #f1f5f9' }}>
                        <Pagination count={totalPersonalPages} page={personalPage} onChange={(e, v) => setPersonalPage(v)} color="primary" size="small" />
                      </Box>
                    )}
                  </Card>
                );
              })()}

              <Box sx={{ pt: 3, textAlign: 'left' }}>
                <Button variant="outlined" component="label" startIcon={<AddIcon />}
                  sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#475569', px: 3, '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' } }}
                >
                  Upload New Record
                  <input type="file" hidden onChange={handleUploadPersonalRecord} />
                </Button>
              </Box>
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <SectionHeader>
                <MedicineIcon />
                <Typography variant="h6">Active Prescriptions</Typography>
              </SectionHeader>

              {(() => {
                const meds = prescriptions.filter(p => p.type === 'Medication');
                meds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                if (meds.length === 0) return (
                  <Card sx={{ borderRadius: '24px', border: '1.5px dashed #e2e8f0', bgcolor: '#ffffff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                    <CardContent sx={{ py: 8, textAlign: 'center' }}>
                      <MedicineIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                      <Typography color="#64748b" variant="h6" fontWeight="800">No prescriptions found.</Typography>
                    </CardContent>
                  </Card>
                );

                const totalPresPages = Math.ceil(meds.length / RECORDS_PER_PAGE);
                const displayedMeds = meds.slice(
                  (presPage - 1) * RECORDS_PER_PAGE,
                  presPage * RECORDS_PER_PAGE
                );

                return (
                  <Card sx={{ borderRadius: '24px', bgcolor: '#ffffff', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }} elevation={0}>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Medication</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Dosage</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Prescribed By</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedMeds.map((pres) => {
                            const appIdStr = pres.appointmentId?._id?.toString() || pres.appointmentId?.toString() || pres.medicalRecordId?.appointmentId?._id?.toString() || pres.medicalRecordId?.appointmentId?.toString();
                            const presHighlight = appIdStr === highlightedId;

                            return (
                              <TableRow
                                key={pres._id}
                                id={`record-${appIdStr}`}
                                sx={{
                                  bgcolor: presHighlight ? alpha('#10b981', 0.05) : 'inherit',
                                  borderLeft: presHighlight ? '4px solid #10b981' : 'none',
                                  '&:hover': { bgcolor: '#f9fafb' },
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                                  {new Date(pres.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                                  {pres.medicationName}
                                </TableCell>
                                <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                                  {pres.dosage} {pres.duration ? `• ${pres.duration}` : ''}
                                </TableCell>
                                <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                                  {pres.medicalRecordId?.vetId
                                    ? `Dr. ${pres.medicalRecordId.vetId.firstName} ${pres.medicalRecordId.vetId.lastName}`
                                    : pres.createdBy
                                      ? `Dr. ${pres.createdBy.firstName} ${pres.createdBy.lastName}`
                                      : 'Veterinarian'}
                                </TableCell>
                                <TableCell align="center">
                                  <Stack direction="row" spacing={1} justifyContent="center">
                                    {!pres.isVirtual && (
                                      <Tooltip title="Download PDF Report">
                                        <IconButton size="small" onClick={() => downloadPrescription(pres._id, pres.medicationName)} sx={{ color: '#64748b' }}>
                                          <DownloadIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {pres.medicalRecordId?.prescriptionUrl && (
                                      <Tooltip title={pres.isVirtual ? "Download Uploaded Prescription" : "Download Uploaded File"}>
                                        <IconButton size="small" onClick={() => handleDownload(pres.medicalRecordId.prescriptionUrl, `File_${pres.medicationName}`)} sx={{ color: '#10b981' }}>
                                          <FileIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {totalPresPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #f1f5f9' }}>
                        <Pagination count={totalPresPages} page={presPage} onChange={(e, v) => setPresPage(v)} color="primary" size="small" />
                      </Box>
                    )}
                  </Card>
                );
              })()}
            </Box>
          )}

          {tabValue === 4 && (
            <Box>
              <SectionHeader>
                <VaccineIcon />
                <Typography variant="h6">Vaccination History</Typography>
              </SectionHeader>

              {(() => {
                const vaccinationRecords = prescriptions.filter(p => p.type !== 'Medication');
                vaccinationRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                if (vaccinationRecords.length === 0) {
                  return (
                    <Card sx={{ borderRadius: '24px', border: '1.5px dashed #e2e8f0', bgcolor: '#ffffff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                      <CardContent sx={{ py: 8, textAlign: 'center' }}>
                        <VaccineIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                        <Typography color="#64748b" variant="h6" fontWeight="800">No vaccinations recorded.</Typography>
                      </CardContent>
                    </Card>
                  );
                }

                const totalVaccPages = Math.ceil(vaccinationRecords.length / RECORDS_PER_PAGE);
                const displayedVacc = vaccinationRecords.slice(
                  (vaccPage - 1) * RECORDS_PER_PAGE,
                  vaccPage * RECORDS_PER_PAGE
                );

                return (
                  <Card sx={{ borderRadius: '24px', bgcolor: '#ffffff', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }} elevation={0}>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Administered</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Vaccine</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Dosage</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Next Booster</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedVacc.map((pres) => {
                            const appIdStr = pres.appointmentId?._id?.toString() || pres.appointmentId?.toString() || pres.medicalRecordId?.appointmentId?._id?.toString() || pres.medicalRecordId?.appointmentId?.toString();
                            const vaccHighlight = appIdStr === highlightedId;

                            return (
                              <TableRow
                                key={pres._id}
                                id={`record-${appIdStr}`}
                                sx={{
                                  bgcolor: vaccHighlight ? alpha('#7c3aed', 0.05) : 'inherit',
                                  borderLeft: vaccHighlight ? '4px solid #7c3aed' : 'none',
                                  '&:hover': { bgcolor: '#f9fafb' },
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                                  {new Date(pres.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body1" fontWeight="700" color="#1e293b">
                                      {pres.medicationName}
                                    </Typography>
                                    <Chip label="Certified" size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha('#7c3aed', 0.1), color: '#7c3aed' }} />
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                                  {pres.dosage || 'Standard dose'}
                                </TableCell>
                                <TableCell>
                                  {pres.dueDate ? (
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#5b21b6' }}>
                                      {new Date(pres.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </Typography>
                                  ) : 'N/A'}
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Download Certificate">
                                    <IconButton size="small" onClick={() => downloadPrescription(pres._id, pres.medicationName, 'vaccination')} sx={{ color: '#7c3aed', '&:hover': { bgcolor: alpha('#7c3aed', 0.05) } }}>
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {totalVaccPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #f1f5f9' }}>
                        <Pagination count={totalVaccPages} page={vaccPage} onChange={(e, v) => setVaccPage(v)} color="secondary" size="small" />
                      </Box>
                    )}
                  </Card>
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
            <Typography variant="h5" fontWeight="900" sx={{ color: '#1e293b' }}>Edit Pet Profile</Typography>
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
