// src/pages/vet/PetProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  IconButton,
  CircularProgress,
  Avatar,
  TextField,
  FormControlLabel,
  Switch,
  Collapse,
  InputAdornment,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ScaleIcon from '@mui/icons-material/Scale';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DownloadIcon from '@mui/icons-material/Download';
import ChatIcon from '@mui/icons-material/Chat';

const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(2, 0),
  '& svg': {
    marginRight: 16,
    color: '#2e7d32',
    fontSize: 30,
  },
}));

const InfoLabel = styled(Typography)({
  fontWeight: 'bold',
  color: '#444',
  minWidth: 150,
});

const InfoValue = styled(Typography)({
  color: '#333',
});

const PetAvatarLarge = styled(Avatar)(({ theme }) => ({
  width: 140,
  height: 140,
  border: '5px solid white',
  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
}));

const VACCINATION_TYPES = [
  "Bordetella (Kennel Cough)",
  "Calicivirus (Feline)",
  "Canine Influenza (H3N2)",
  "Canine Influenza (H3N8)",
  "Chlamydia (Feline)",
  "Coronavirus (Canine)",
  "DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus)",
  "DHLPP (Distemper, Hepatitis, Leptospirosis, Parainfluenza, Parvovirus)",
  "Distemper (Canine)",
  "Feline Leukemia (FeLV)",
  "FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)",
  "Giardia",
  "Hepatitis (Canine)",
  "Lyme Disease",
  "Leptospirosis",
  "Parainfluenza (Canine)",
  "Panleukopenia (Feline Distemper)",
  "Parvovirus (Canine)",
  "Rabies (1-year)",
  "Rabies (3-year)",
  "Rattlesnake Vaccine",
].sort();

const AlignedContent = styled(Box)(({ theme }) => ({
  width: '100%',
}));

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const getStatusChip = (status) => {
  switch (status) {
    case 'Booked':
      return <Chip label="Booked" color="primary" size="small" icon={<AccessTimeIcon />} />;
    case 'Confirmed':
      return <Chip label="Confirmed" color="success" size="small" icon={<CheckCircleIcon />} />;
    case 'Canceled':
      return <Chip label="Canceled" color="error" size="small" icon={<CancelIcon />} />;
    case 'Completed':
      return <Chip label="Completed" color="default" size="small" icon={<EventAvailableIcon />} />;
    case 'Rescheduled':
      return <Chip label="Rescheduled" color="warning" size="small" />;
    default:
      return <Chip label={status || 'Unknown'} size="small" />;
  }
};

const PetProfile = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [expandedMedRows, setExpandedMedRows] = useState(new Set());
  const [expandedPresSubRows, setExpandedPresSubRows] = useState(new Set());
  const [expandedPresRows, setExpandedPresRows] = useState(new Set());
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal visibilities
  const [showMedForm, setShowMedForm] = useState(false);
  const [showPresForm, setShowPresForm] = useState(false);

  // Appt View Modal
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showApptModal, setShowApptModal] = useState(false);

  const [isEditingMed, setIsEditingMed] = useState(false);
  const [currentMedRecordId, setCurrentMedRecordId] = useState(null);
  const [isEditingPres, setIsEditingPres] = useState(false);
  const [currentPresId, setCurrentPresId] = useState(null);
  const [currentAssociatedMedId, setCurrentAssociatedMedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [medFormData, setMedFormData] = useState({
    diagnosis: '',
    date: new Date().toISOString().split('T')[0],
    visibleToOwner: false,
    attachments: []
  });

  const [presFormData, setPresFormData] = useState({
    medicationName: '',
    dosage: '',
    duration: '',
    instructions: '',
    type: 'Medication',
    dueDate: '',
    medicalRecordId: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const petRes = await api.get(`/pets/${petId}`);
        setPet(petRes.data);

        const medRes = await api.get(`/medical-records/pet/${petId}`);
        setMedicalRecords(medRes.data.records || []);

        const presRes = await api.get(`/prescriptions/pet/${petId}`);
        setPrescriptions(presRes.data.prescriptions || []);

        try {
          const apptRes = await api.get(`/appointments/pet/${petId}`);
          setAppointments(apptRes.data.appointments || []);
        } catch (err) {
          console.log('Appointments endpoint not available');
          setAppointments([]);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire('Error', 'Could not load pet profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (petId) fetchData();
  }, [petId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birth = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  const toggleMedExpand = (id) => {
    const newSet = new Set(expandedMedRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedMedRows(newSet);
  };

  const togglePresSubExpand = (id) => {
    const newSet = new Set(expandedPresSubRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedPresSubRows(newSet);
  };

  const togglePresExpand = (id) => {
    const newSet = new Set(expandedPresRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedPresRows(newSet);
  };

  // Medical Record Form
  const startEditMed = (record) => {
    setIsEditingMed(true);
    setCurrentMedRecordId(record._id);
    setMedFormData({
      diagnosis: record.diagnosis || '',
      date: new Date(record.date).toISOString().split('T')[0],
      visibleToOwner: record.visibleToOwner || false,
      attachments: record.attachments || []
    });
    setSelectedFiles([]);
    setShowMedForm(true);
  };

  const cancelMedForm = () => {
    setShowMedForm(false);
    setIsEditingMed(false);
    setCurrentMedRecordId(null);
    setSelectedFiles([]);
    setMedFormData({
      diagnosis: '',
      date: new Date().toISOString().split('T')[0],
      visibleToOwner: false,
      attachments: []
    });
  };

  // Prescription Form
  const openAddPresForm = (medRecordId = null) => {
    setCurrentAssociatedMedId(medRecordId);
    setShowPresForm(true);
    setIsEditingPres(false);
    setPresFormData({
      medicationName: '',
      dosage: '',
      duration: '',
      instructions: '',
      type: 'Medication',
      dueDate: '',
      medicalRecordId: medRecordId || ''
    });
  };

  const startEditPres = (pres) => {
    setIsEditingPres(true);
    setCurrentPresId(pres._id);
    setCurrentAssociatedMedId(pres.medicalRecordId || null);
    setPresFormData({
      medicationName: pres.medicationName || '',
      dosage: pres.dosage || '',
      duration: pres.duration || '',
      instructions: pres.instructions || '',
      type: pres.type || 'Medication',
      dueDate: pres.dueDate ? new Date(pres.dueDate).toISOString().split('T')[0] : '',
      medicalRecordId: pres.medicalRecordId ? (typeof pres.medicalRecordId === 'object' ? pres.medicalRecordId._id : pres.medicalRecordId) : ''
    });
    setShowPresForm(true);
  };

  const cancelPresForm = () => {
    setShowPresForm(false);
    setIsEditingPres(false);
    setCurrentPresId(null);
    setCurrentAssociatedMedId(null);
    setPresFormData({
      medicationName: '',
      dosage: '',
      duration: '',
      instructions: '',
      type: 'Medication',
      dueDate: '',
      medicalRecordId: ''
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(file.type));
    if (validFiles.length < files.length) {
      Swal.fire('Invalid Files', 'Only images (JPG, PNG, GIF) and PDFs are allowed.', 'warning');
    }
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const removeExistingAttachment = (index) => setMedFormData(prev => ({
    ...prev,
    attachments: prev.attachments.filter((_, i) => i !== index)
  }));


  const handleSaveMedRecord = async () => {
    if (!medFormData.diagnosis.trim()) {
      return Swal.fire('Validation', 'Description is required', 'warning');
    }

    setSaving(true);
    let attachmentUrls = [...medFormData.attachments];

    try {
      if (selectedFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();

        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        const uploadRes = await api.post('/upload/attachments', formData);
        const newUrls = uploadRes.data.attachments || [];
        attachmentUrls = [...attachmentUrls, ...newUrls];
        setUploading(false);
      }

      const payload = {
        diagnosis: medFormData.diagnosis.trim(),
        visibleToOwner: medFormData.visibleToOwner,
        date: medFormData.date,
        attachments: attachmentUrls,
      };

      if (!isEditingMed) {
        payload.petId = petId;
      }

      if (isEditingMed) {
        await api.put(`/medical-records/${currentMedRecordId}`, payload);
      } else {
        await api.post('/medical-records', payload);
      }

      const refreshed = await api.get(`/medical-records/pet/${petId}`);
      setMedicalRecords(refreshed.data.records || []);

      cancelMedForm();
      Swal.fire('Success!', 'Medical record saved!', 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleSavePres = async () => {
    if (!presFormData.medicationName.trim() || !presFormData.dosage.trim()) {
      return Swal.fire('Validation', 'Name and Dosage are required', 'warning');
    }
    if (presFormData.type === 'Vaccination' && !presFormData.dueDate) {
      return Swal.fire('Validation', 'Due Date is required for vaccinations', 'warning');
    }

    setSaving(true);
    try {
      const payload = {
        medicalRecordId: presFormData.medicalRecordId || null,
        medicationName: presFormData.medicationName.trim(),
        dosage: presFormData.dosage.trim(),
        duration: presFormData.duration.trim(),
        instructions: presFormData.instructions.trim(),
        type: presFormData.type,
        dueDate: presFormData.dueDate ? new Date(presFormData.dueDate) : null
      };

      if (!isEditingPres) {
        payload.petId = petId;
      }

      if (isEditingPres) {
        await api.put(`/prescriptions/${currentPresId}`, payload);
      } else {
        await api.post('/prescriptions', payload);
      }

      const res = await api.get(`/prescriptions/pet/${petId}`);
      setPrescriptions(res.data.prescriptions || []);
      cancelPresForm();
      Swal.fire('Success!', `${presFormData.type} saved`, 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (recordId, current) => {
    try {
      await api.patch(`/medical-records/${recordId}/visibility`, { visibleToOwner: !current });
      const res = await api.get(`/medical-records/pet/${petId}`);
      setMedicalRecords(res.data.records || []);
      Swal.fire('Updated', `Visibility changed`, 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to update visibility', 'error');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    const result = await Swal.fire({
      title: 'Delete medical record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      confirmButtonText: 'Yes, delete'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/medical-records/${recordId}`);
      const res = await api.get(`/medical-records/pet/${petId}`);
      setMedicalRecords(res.data.records || []);
      Swal.fire('Deleted!', '', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  const handleDeletePres = async (presId) => {
    const result = await Swal.fire({
      title: 'Delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      confirmButtonText: 'Yes, delete'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/prescriptions/${presId}`);
      const res = await api.get(`/prescriptions/pet/${petId}`);
      setPrescriptions(res.data.prescriptions || []);
      Swal.fire('Deleted!', '', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  const handleDownloadPres = async (presId) => {
    try {
      const res = await api.get(`/prescriptions/${presId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${presId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      Swal.fire('Success', 'Prescription PDF downloaded', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to download PDF', 'error');
    }
  };

  if (!pet) {
    return (
      <PageContainer>
        <Sidebar />
        <ContentArea sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h5" color="textSecondary">Pet not found</Typography>
        </ContentArea>
      </PageContainer>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
          <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#2e7d32', color: 'white', p: isMobile ? 3 : 6, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 2 : 4 }}>
              <PetAvatarLarge src={pet.photo} alt={pet.name}>
                {pet.name?.[0]?.toUpperCase() || 'P'}
              </PetAvatarLarge>
              <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="bold">{pet.name}</Typography>
                <Typography variant="h6">{pet.species} • {pet.breed || 'Mixed'}</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Age: {calculateAge(pet.dateOfBirth)} • Gender: {pet.gender || 'Unknown'}
                </Typography>

                {pet.ownerId?._id && (
                  <Button
                    variant="contained"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate(`/vet/chat/owner/${pet.ownerId._id}`, { state: { selectedPetId: pet._id } })}
                    sx={{
                      mt: 2,
                      bgcolor: 'white',
                      color: '#2e7d32',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: '20px',
                      '&:hover': {
                        bgcolor: '#f1f8e9',
                      }
                    }}
                  >
                    Chat with Owner
                  </Button>
                )}
              </Box>
            </Box>

            <Tabs value={activeTab} onChange={handleTabChange} variant={isMobile ? "scrollable" : "standard"} scrollButtons="auto" centered={!isMobile} sx={{ bgcolor: '#f5f7fa', borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Vet Info" />
              <Tab label="Medical Notes" />
              <Tab label="Medical Records" />
              <Tab label="Appointments & Prescs" />
              <Tab label="Vaccinations" />
            </Tabs>

            <Box sx={{ p: isMobile ? 2 : 4 }}>
              {activeTab === 0 && (
                <AlignedContent>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', height: '100%' }}>
                        <Box sx={{ bgcolor: '#2e7d32', color: 'white', p: 2 }}>
                          <Typography variant="h6" fontWeight="bold">Pet Details</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          <InfoRow><ScaleIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 80 }}>Weight:</InfoLabel><InfoValue>{pet.weight || 'N/A'} kg</InfoValue></InfoRow>
                          <InfoRow><ColorLensIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 80 }}>Color:</InfoLabel><InfoValue>{pet.color || 'N/A'}</InfoValue></InfoRow>
                          <InfoRow><PetsIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 80 }}>Species:</InfoLabel><InfoValue>{pet.species || 'N/A'}</InfoValue></InfoRow>
                          <InfoRow><PetsIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 80 }}>Breed:</InfoLabel><InfoValue>{pet.breed || 'Mixed'}</InfoValue></InfoRow>
                          <InfoRow><CalendarTodayIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 80 }}>DOB:</InfoLabel><InfoValue>{pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A'}</InfoValue></InfoRow>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', height: '100%' }}>
                        <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2 }}>
                          <Typography variant="h6" fontWeight="bold">Owner Details</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          <InfoRow><PersonIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 80 }}>Name:</InfoLabel><InfoValue>{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</InfoValue></InfoRow>
                          <InfoRow><PhoneIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 80 }}>Phone:</InfoLabel><InfoValue>{pet.ownerId?.phoneNumber || 'N/A'}</InfoValue></InfoRow>
                          {pet.registeredClinicId && (
                            <InfoRow><LocationOnIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 80 }}>Clinic:</InfoLabel><InfoValue>{typeof pet.registeredClinicId === 'object' ? pet.registeredClinicId.name : pet.registeredClinicId}</InfoValue></InfoRow>
                          )}

                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </AlignedContent>
              )}

              {activeTab === 1 && (
                <AlignedContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" color="#e08c0eff">Medical Notes</Typography>
                    <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => { cancelMedForm(); setShowMedForm(true); }}>
                      Add Medical Note
                    </Button>
                  </Box>

                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#e08c0eff' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}></TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Appointment Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Veterinarian</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicalRecords.length === 0 ? (
                          <TableRow><TableCell colSpan={5} align="center"><Typography color="textSecondary" py={4}>No medical notes found</Typography></TableCell></TableRow>
                        ) : medicalRecords.map(record => (
                          <React.Fragment key={record._id}>
                            <TableRow sx={{ bgcolor: '#f9f9f9', '&:hover': { bgcolor: '#f1f1f1' } }}>
                              <TableCell>
                                <IconButton size="small" onClick={() => toggleMedExpand(record._id)}>
                                  <ExpandMoreIcon sx={{ transform: expandedMedRows.has(record._id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                                </IconButton>
                              </TableCell>
                              <TableCell>
                                <Link component="button" variant="body2" sx={{ fontWeight: 'bold', textDecoration: 'none', color: '#1976d2' }} onClick={() => setActiveTab(3)}>
                                  {new Date(record.date).toLocaleDateString()}
                                </Link>
                              </TableCell>
                              <TableCell><Typography fontWeight="bold">{record.diagnosis}</Typography></TableCell>
                              <TableCell>{record.vetId ? `Dr. ${record.vetId.firstName} ${record.vetId.lastName}` : 'N/A'}</TableCell>
                              <TableCell align="center">
                                <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => startEditMed(record)}><EditIcon /></IconButton></Tooltip>
                                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteRecord(record._id)}><DeleteIcon /></IconButton></Tooltip>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={5} sx={{ p: 0 }}>
                                <Collapse in={expandedMedRows.has(record._id)} timeout="auto" unmountOnExit>
                                  <Box sx={{ p: 3, bgcolor: '#f5fdf5', borderLeft: '4px solid #2e7d32' }}>
                                    <Typography fontWeight="bold" mb={1}>Description:</Typography>
                                    <Typography mb={2}>{record.diagnosis || 'N/A'}</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="textSecondary">
                                      Appointment: <Link component="button" variant="body2" sx={{ fontWeight: 'bold' }} onClick={() => setActiveTab(3)}>
                                        {new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </Link>
                                    </Typography>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AlignedContent>
              )}

              {activeTab === 2 && (
                <AlignedContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" color="#e08c0eff">Medical Records</Typography>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => { cancelMedForm(); setShowMedForm(true); }}>
                      Upload Record
                    </Button>
                  </Box>

                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#e08c0eff' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}></TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Veterinarian</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Visibility</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Attachments</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicalRecords.length === 0 ? (
                          <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary" py={4}>No medical records found</Typography></TableCell></TableRow>
                        ) : medicalRecords.map(record => (
                          <React.Fragment key={record._id}>
                            <TableRow sx={{ bgcolor: '#f9f9f9', '&:hover': { bgcolor: '#f1f1f1' } }}>
                              <TableCell>
                                <IconButton size="small" onClick={() => toggleMedExpand(record._id)}>
                                  <ExpandMoreIcon sx={{ transform: expandedMedRows.has(record._id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                                </IconButton>
                              </TableCell>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                              <TableCell><Typography fontWeight="bold">{record.diagnosis || 'N/A'}</Typography></TableCell>
                              <TableCell>{record.vetId ? `Dr. ${record.vetId.firstName} ${record.vetId.lastName}` : 'N/A'}</TableCell>
                              <TableCell>
                                <Tooltip title={record.visibleToOwner ? 'Visible to Owner' : 'Hidden from Owner'}>
                                  <IconButton size="small" onClick={() => handleToggleVisibility(record._id, record.visibleToOwner)}>
                                    {record.visibleToOwner ? <VisibilityIcon color="success" /> : <VisibilityOffIcon color="disabled" />}
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                {record.attachments?.length > 0 ? (
                                  <Chip label={`${record.attachments.length} file(s)`} size="small" icon={<AttachFileIcon />} />
                                ) : <Typography variant="caption" color="textSecondary">None</Typography>}
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Edit/View"><IconButton size="small" color="primary" onClick={() => startEditMed(record)}><EditIcon /></IconButton></Tooltip>
                                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteRecord(record._id)}><DeleteIcon /></IconButton></Tooltip>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={7} sx={{ p: 0 }}>
                                <Collapse in={expandedMedRows.has(record._id)} timeout="auto" unmountOnExit>
                                  <Box sx={{ p: 3, bgcolor: '#f5fdf5', borderLeft: '4px solid #1976d2' }}>
                                    {record.attachments?.length > 0 && (
                                      <Box mt={2}>
                                        <Typography fontWeight="bold" mb={1}>Attachments:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                          {record.attachments.map((url, i) => (
                                            <Chip
                                              key={i}
                                              icon={url.endsWith('.pdf') ? <PictureAsPdfIcon /> : <ImageIcon />}
                                              label={`File ${i + 1}`}
                                              component="a"
                                              href={url}
                                              target="_blank"
                                              download
                                              clickable
                                              size="small"
                                            />
                                          ))}
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AlignedContent>
              )}

              {activeTab === 3 && (
                <AlignedContent>
                  <Typography variant="h5" fontWeight="bold" color="#e08c0eff" mb={3}>Appointments & Prescriptions</Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#e08c0eff' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date & Time</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clinic</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Veterinarian</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reason</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Owner's Notes</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.length === 0 ? (
                          <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary" py={4}>No appointments</Typography></TableCell></TableRow>
                        ) : appointments.map(appt => (
                          <TableRow key={appt._id} sx={{ '&:hover': { bgcolor: '#fff9f7' } }}>
                            <TableCell>
                              <Typography fontWeight="bold">{new Date(appt.dateTime).toLocaleDateString()}</Typography>
                              <Typography variant="caption">{new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                            </TableCell>
                            <TableCell>{appt.clinicId?.name || 'N/A'}</TableCell>
                            <TableCell>{appt.vetId ? `Dr. ${appt.vetId.firstName} ${appt.vetId.lastName}` : 'N/A'}</TableCell>
                            <TableCell>{getStatusChip(appt.status)}</TableCell>
                            <TableCell>{appt.reason || 'N/A'}</TableCell>
                            <TableCell>{appt.notes || '-'}</TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={async () => {
                                  try {
                                    const res = await api.get(`/appointments/${appt._id}`);
                                    setSelectedAppt(res.data);
                                    setShowApptModal(true);
                                  } catch (err) {
                                    setSelectedAppt(appt);
                                    setShowApptModal(true);
                                  }
                                }}
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
                                  fontWeight: 700,
                                  px: 3,
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
                                    transform: 'translateY(-1px)',
                                  },
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AlignedContent>
              )}

              {activeTab === 4 && (
                <AlignedContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" color="#e08c0eff">Vaccinations</Typography>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => { cancelPresForm(); setPresFormData(p => ({ ...p, type: 'Vaccination' })); setShowPresForm(true); }}>
                      Add Vaccination
                    </Button>
                  </Box>
                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#e08c0eff' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date of Vaccination</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dosage</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Frequency</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Next Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prescriptions.filter(p => p.type !== 'Medication').length === 0 ? (
                          <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary" py={4}>No vaccination records</Typography></TableCell></TableRow>
                        ) : prescriptions.filter(p => p.type !== 'Medication').map(pres => (
                          <TableRow key={pres._id} sx={{ '&:hover': { bgcolor: '#f7f2f9' } }}>
                            <TableCell>{new Date(pres.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell><Chip label={pres.type} size="small" color="secondary" /></TableCell>
                            <TableCell><Typography fontWeight="bold">{pres.medicationName}</Typography></TableCell>
                            <TableCell>{pres.dosage}</TableCell>
                            <TableCell>{pres.duration || 'N/A'}</TableCell>
                            <TableCell>{pres.dueDate ? new Date(pres.dueDate).toLocaleDateString() : '-'}</TableCell>
                            <TableCell align="center">
                              <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => startEditPres(pres)}><EditIcon /></IconButton></Tooltip>
                              <Tooltip title="Download PDF"><IconButton size="small" color="info" onClick={() => handleDownloadPres(pres._id)}><DownloadIcon /></IconButton></Tooltip>
                              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeletePres(pres._id)}><DeleteIcon /></IconButton></Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AlignedContent>
              )}

              {/* Modals */}
              <Dialog open={showMedForm} onClose={cancelMedForm} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#f5f7fa', fontWeight: 'bold' }}>
                  {isEditingMed ? 'Edit Medical Record' : 'Add Medical Record'}
                </DialogTitle>
                <DialogContent dividers>
                  <Grid container direction="column" spacing={4} sx={{ mt: 0 }}>
                    {/* Record Info Section */}
                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Examination Date"
                            InputLabelProps={{ shrink: true }}
                            value={medFormData.date}
                            onChange={e => setMedFormData(p => ({ ...p, date: e.target.value }))}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            borderRadius: 1
                          }}>
                            <FormControlLabel
                              control={<Switch checked={medFormData.visibleToOwner} onChange={e => setMedFormData(p => ({ ...p, visibleToOwner: e.target.checked }))} color="success" />}
                              label="Make Visible to Owner"
                              sx={{ width: '100%', m: 0 }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Description Section */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Description *"
                        placeholder="Detailed description of findings, observations, and clinical assessment..."
                        value={medFormData.diagnosis}
                        onChange={e => setMedFormData(p => ({ ...p, diagnosis: e.target.value }))}
                      />
                    </Grid>

                    {/* Attachments Section */}
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, border: '1px dashed #cbd5e1', borderRadius: 2 }}>
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<AttachFileIcon />}
                          sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#1e293b', '&:hover': { bgcolor: '#334155' } }}
                        >
                          Choose Files
                          <input type="file" hidden multiple accept="image/*,.pdf" onChange={handleFileSelect} />
                        </Button>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                          {selectedFiles.map((f, i) => (
                            <Chip
                              key={i}
                              label={f.name}
                              onDelete={() => removeSelectedFile(i)}
                              size="small"
                              sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}
                            />
                          ))}
                          {isEditingMed && medFormData.attachments?.map((url, i) => (
                            <Chip
                              key={`ext-${i}`}
                              label={`Existing File ${i + 1}`}
                              onDelete={() => removeExistingAttachment(i)}
                              variant="outlined"
                              size="small"
                              color="primary"
                            />
                          ))}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          Supported formats: JPG, PNG, GIF, PDF. Max 10MB per file.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f7fa' }}>
                  <Button onClick={cancelMedForm}>Cancel</Button>
                  <Button variant="contained" color="success" onClick={handleSaveMedRecord} disabled={saving || uploading}>{saving ? 'Saving...' : 'Save'}</Button>
                </DialogActions>
              </Dialog>

              <Dialog open={showPresForm} onClose={cancelPresForm} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#f5f7fa', fontWeight: 'bold' }}>
                  {isEditingPres ? 'Edit' : 'Add'} Vaccination
                </DialogTitle>
                <DialogContent dividers sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                  <Grid container spacing={3} sx={{ maxWidth: '800px' }}>
                    {/* Line 1: Type and Name */}
                    {/* Line 1: Type - Full width to accommodate long placeholder/padding */}
                    <Grid item xs={12}>
                      <Autocomplete
                        fullWidth
                        options={["Medication", ...VACCINATION_TYPES]}
                        value={presFormData.type || "Medication"}
                        onChange={(e, val) => setPresFormData(p => ({ ...p, type: val }))}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            pr: '175px !important'
                          }
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Category" placeholder="Select or type vaccination category..." />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name *"
                        placeholder="e.g. DHPP, Brand Name..."
                        value={presFormData.medicationName}
                        onChange={e => setPresFormData(p => ({ ...p, medicationName: e.target.value }))}
                      />
                    </Grid>

                    {/* Line 2: Dosage and Frequency */}
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Dosage"
                        placeholder="e.g. 5ml, 1 Tablet..."
                        value={presFormData.dosage}
                        onChange={e => setPresFormData(p => ({ ...p, dosage: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Frequency/Duration"
                        placeholder="e.g. Twice a day, 1 week..."
                        value={presFormData.duration}
                        onChange={e => setPresFormData(p => ({ ...p, duration: e.target.value }))}
                      />
                    </Grid>

                    {/* Line 3: Next Due Date */}
                    {presFormData.type !== 'Medication' && (
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Next Due Date"
                          InputLabelProps={{ shrink: true }}
                          value={presFormData.dueDate || ''}
                          onChange={e => setPresFormData(p => ({ ...p, dueDate: e.target.value }))}
                        />
                      </Grid>
                    )}
                  </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f7fa' }}>
                  <Button onClick={cancelPresForm}>Cancel</Button>
                  <Button variant="contained" color="secondary" onClick={handleSavePres} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                </DialogActions>
              </Dialog>

              <Dialog open={showApptModal} onClose={() => setShowApptModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#f5f7fa' }}>Appointment Details & Documents</DialogTitle>
                <DialogContent dividers>
                  {selectedAppt && (
                    <Box sx={{ py: 1 }}>
                      <Typography variant="h6" color="primary" gutterBottom>Documents</Typography>
                      {selectedAppt.medicalRecordUrl ? (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f4f8', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachFileIcon color="primary" />
                            <Typography fontWeight="bold">Medical Notes</Typography>
                          </Box>
                          <Button size="small" variant="contained" component="a" href={selectedAppt.medicalRecordUrl} target="_blank">View</Button>
                        </Box>
                      ) : <Typography color="textSecondary" mb={2}>No medical notes document attached.</Typography>}

                      {selectedAppt.prescriptionUrl ? (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f4f8', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachFileIcon color="secondary" />
                            <Typography fontWeight="bold">Prescription</Typography>
                          </Box>
                          <Button size="small" variant="contained" color="secondary" component="a" href={selectedAppt.prescriptionUrl} target="_blank">View</Button>
                        </Box>
                      ) : <Typography color="textSecondary" mb={2}>No prescription document attached.</Typography>}
                    </Box>
                  )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button onClick={() => setShowApptModal(false)} variant="outlined">Close</Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Paper>
        </Box>
      </Box >
    </Box >
  );
};

export default PetProfile;
