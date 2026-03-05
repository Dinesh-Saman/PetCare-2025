// src/pages/vet/PetProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  useTheme,
  useMediaQuery
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

const AlignedContent = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1100,
  margin: '0 auto',
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

  // Independent form visibility
  const [showMedForm, setShowMedForm] = useState(false);
  const [showPresForm, setShowPresForm] = useState(false);

  const [isEditingMed, setIsEditingMed] = useState(false);
  const [currentMedRecordId, setCurrentMedRecordId] = useState(null);
  const [isEditingPres, setIsEditingPres] = useState(false);
  const [currentPresId, setCurrentPresId] = useState(null);
  const [currentAssociatedMedId, setCurrentAssociatedMedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [medFormData, setMedFormData] = useState({
    diagnosis: '',
    treatmentNotes: '',
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
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} year${age !== 1 ? 's' : ''}`;
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
      treatmentNotes: record.treatmentNotes || '',
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
      treatmentNotes: '',
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
      return Swal.fire('Validation', 'Diagnosis is required', 'warning');
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
        treatmentNotes: medFormData.treatmentNotes.trim(),
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

  if (loading) {
    return (
      <PageContainer>
        <Sidebar />
        <ContentArea sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} thickness={4} />
        </ContentArea>
      </PageContainer>
    );
  }

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
              </Box>
            </Box>

            <Tabs value={activeTab} onChange={handleTabChange} variant={isMobile ? "scrollable" : "standard"} scrollButtons="auto" centered={!isMobile} sx={{ bgcolor: '#f5f7fa', borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Info" />
              <Tab label="Records" />
              <Tab label="Appts" />
              <Tab label="Prescs" />
            </Tabs>

            <Box sx={{ p: isMobile ? 2 : 4 }}>
              {activeTab === 0 && (
                <AlignedContent>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ bgcolor: '#2e7d32', color: 'white', p: 2 }}>
                          <Typography variant="h6" fontWeight="bold">Pet Details</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          <InfoRow><ScaleIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 100 }}>Weight:</InfoLabel><InfoValue>{pet.weight || 'N/A'} kg</InfoValue></InfoRow>
                          <InfoRow><ColorLensIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 100 }}>Color:</InfoLabel><InfoValue>{pet.color || 'N/A'}</InfoValue></InfoRow>
                          <InfoRow><PetsIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 100 }}>Species:</InfoLabel><InfoValue>{pet.species || 'N/A'}</InfoValue></InfoRow>
                          <InfoRow><PetsIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 100 }}>Breed:</InfoLabel><InfoValue>{pet.breed || 'Mixed'}</InfoValue></InfoRow>
                          <InfoRow><CalendarTodayIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 100 }}>DOB:</InfoLabel><InfoValue>{pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A'}</InfoValue></InfoRow>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2 }}>
                          <Typography variant="h6" fontWeight="bold">Owner Details</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          <InfoRow><PersonIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 130 }}>Name:</InfoLabel><InfoValue>{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</InfoValue></InfoRow>
                          <InfoRow><PhoneIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 130 }}>Phone:</InfoLabel><InfoValue>{pet.ownerId?.phoneNumber || 'N/A'}</InfoValue></InfoRow>
                          {pet.registeredClinicId && (
                            <InfoRow><LocationOnIcon sx={{ fontSize: 24 }} /><InfoLabel sx={{ minWidth: 130 }}>Clinic:</InfoLabel><InfoValue>{typeof pet.registeredClinicId === 'object' ? pet.registeredClinicId.name : pet.registeredClinicId}</InfoValue></InfoRow>
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
                    <Typography variant="h5" fontWeight="bold" color="#2e7d32">Medical Records</Typography>
                    <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => { cancelMedForm(); setShowMedForm(!showMedForm); }}>
                      {showMedForm ? 'Cancel' : 'Add Record'}
                    </Button>
                  </Box>

                  <Collapse in={showMedForm}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #c8e6c9' }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>{isEditingMed ? 'Edit Record' : 'New Medical Record'}</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField fullWidth multiline rows={2} label="Diagnosis *" value={medFormData.diagnosis} onChange={e => setMedFormData(p => ({ ...p, diagnosis: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth multiline rows={3} label="Treatment Notes" value={medFormData.treatmentNotes} onChange={e => setMedFormData(p => ({ ...p, treatmentNotes: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={medFormData.date} onChange={e => setMedFormData(p => ({ ...p, date: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                          <FormControlLabel
                            control={<Switch checked={medFormData.visibleToOwner} onChange={e => setMedFormData(p => ({ ...p, visibleToOwner: e.target.checked }))} color="success" />}
                            label="Visible to Owner"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>
                            Attach Files
                            <input type="file" hidden multiple accept="image/*,.pdf" onChange={handleFileSelect} />
                          </Button>
                          {selectedFiles.map((f, i) => (
                            <Chip key={i} label={f.name} onDelete={() => removeSelectedFile(i)} sx={{ ml: 1, mt: 0.5 }} />
                          ))}
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'right' }}>
                          <Button onClick={cancelMedForm} sx={{ mr: 1 }}>Cancel</Button>
                          <Button variant="contained" color="success" onClick={handleSaveMedRecord} disabled={saving || uploading}>
                            {saving ? 'Saving...' : 'Save Record'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Collapse>

                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#2e7d32' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}></TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diagnosis</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Visibility</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Attachments</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicalRecords.length === 0 ? (
                          <TableRow><TableCell colSpan={6} align="center"><Typography color="textSecondary" py={4}>No medical records</Typography></TableCell></TableRow>
                        ) : medicalRecords.map(record => (
                          <React.Fragment key={record._id}>
                            <TableRow sx={{ bgcolor: '#f9f9f9', '&:hover': { bgcolor: '#f1f1f1' } }}>
                              <TableCell>
                                <IconButton size="small" onClick={() => toggleMedExpand(record._id)}>
                                  <ExpandMoreIcon sx={{ transform: expandedMedRows.has(record._id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                                </IconButton>
                              </TableCell>
                              <TableCell><Typography fontWeight="bold">{record.diagnosis}</Typography></TableCell>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
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
                                <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => startEditMed(record)}><EditIcon /></IconButton></Tooltip>
                                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteRecord(record._id)}><DeleteIcon /></IconButton></Tooltip>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={6} sx={{ p: 0 }}>
                                <Collapse in={expandedMedRows.has(record._id)} timeout="auto" unmountOnExit>
                                  <Box sx={{ p: 3, bgcolor: '#f5fdf5', borderLeft: '4px solid #2e7d32' }}>
                                    <Typography fontWeight="bold" mb={1}>Treatment Notes:</Typography>
                                    <Typography>{record.treatmentNotes || 'No notes'}</Typography>
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

              {activeTab === 2 && (
                <AlignedContent>
                  <Typography variant="h5" fontWeight="bold" color="#1976d2" mb={3}>Appointments</Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#1976d2' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date & Time</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clinic</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reason</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.length === 0 ? (
                          <TableRow><TableCell colSpan={5} align="center"><Typography color="textSecondary" py={4}>No appointments</Typography></TableCell></TableRow>
                        ) : appointments.map(appt => (
                          <TableRow key={appt._id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                            <TableCell>
                              <Typography fontWeight="bold">{new Date(appt.dateTime).toLocaleDateString()}</Typography>
                              <Typography variant="caption">{new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                            </TableCell>
                            <TableCell>{appt.clinicId?.name || 'N/A'}</TableCell>
                            <TableCell>{getStatusChip(appt.status)}</TableCell>
                            <TableCell>{appt.reason || 'Routine Checkup'}</TableCell>
                            <TableCell>{appt.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AlignedContent>
              )}

              {activeTab === 3 && (
                <AlignedContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" color="#7b1fa2">Prescriptions</Typography>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => { cancelPresForm(); setShowPresForm(!showPresForm); }}>
                      {showPresForm ? 'Cancel' : 'Add Prescription'}
                    </Button>
                  </Box>

                  <Collapse in={showPresForm}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e1bee7' }}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>{isEditingPres ? 'Edit' : 'New'} Prescription / Medication / Vaccination</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select value={presFormData.type} onChange={e => setPresFormData(p => ({ ...p, type: e.target.value }))} label="Type">
                              <MenuItem value="Medication">Medication</MenuItem>
                              <MenuItem value="Vaccination">Vaccination</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Linked Record</InputLabel>
                            <Select value={presFormData.medicalRecordId || ''} onChange={e => setPresFormData(p => ({ ...p, medicalRecordId: e.target.value }))} label="Linked Record">
                              <MenuItem value=""><em>None</em></MenuItem>
                              {medicalRecords.map(r => <MenuItem key={r._id} value={r._id}>{r.diagnosis} ({new Date(r.date).toLocaleDateString()})</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Medication / Vaccine Name *" value={presFormData.medicationName} onChange={e => setPresFormData(p => ({ ...p, medicationName: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Dosage *" value={presFormData.dosage} onChange={e => setPresFormData(p => ({ ...p, dosage: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Duration" value={presFormData.duration} onChange={e => setPresFormData(p => ({ ...p, duration: e.target.value }))} />
                        </Grid>
                        {presFormData.type === 'Vaccination' && (
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="date" label="Due Date *" InputLabelProps={{ shrink: true }} value={presFormData.dueDate} onChange={e => setPresFormData(p => ({ ...p, dueDate: e.target.value }))} />
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <TextField fullWidth multiline rows={2} label="Instructions" value={presFormData.instructions} onChange={e => setPresFormData(p => ({ ...p, instructions: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'right' }}>
                          <Button onClick={cancelPresForm} sx={{ mr: 1 }}>Cancel</Button>
                          <Button variant="contained" color="secondary" onClick={handleSavePres} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Collapse>

                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#7b1fa2' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dosage</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prescriptions.length === 0 ? (
                          <TableRow><TableCell colSpan={6} align="center"><Typography color="textSecondary" py={4}>No prescriptions or vaccinations</Typography></TableCell></TableRow>
                        ) : prescriptions.map(pres => (
                          <TableRow key={pres._id} sx={{ '&:hover': { bgcolor: '#fdf3ff' } }}>
                            <TableCell><Typography fontWeight="bold">{pres.medicationName}</Typography></TableCell>
                            <TableCell><Chip label={pres.type} size="small" color={pres.type === 'Vaccination' ? 'success' : 'primary'} /></TableCell>
                            <TableCell>{pres.dosage}</TableCell>
                            <TableCell>{pres.duration || '-'}</TableCell>
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
            </Box>
          </Paper>
        </Box>
      </Box >
    </Box >
  );
};

export default PetProfile;