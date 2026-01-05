// src/pages/vet/PetProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
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
  InputLabel
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
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(4),
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
    let attachmentUrls = [...medFormData.attachments]; // Keep existing

    try {
      if (selectedFiles.length > 0) {
        setUploading(true);
        const formData = new FormData();

        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        const uploadRes = await api.post('/upload/attachments', formData);
        const newUrls = uploadRes.data.attachments || [];
        attachmentUrls = [...attachmentUrls, ...newUrls];  // ← THIS LINE WAS MISSING!
        setUploading(false);
      }

      const payload = {
        diagnosis: medFormData.diagnosis.trim(),
        treatmentNotes: medFormData.treatmentNotes.trim(),
        visibleToOwner: medFormData.visibleToOwner,
        date: medFormData.date,
        attachments: attachmentUrls,  // ← Now includes new uploads
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
      Swal.fire('Success!', 'Medical record saved with attachments!', 'success');
    } catch (error) {
      console.error('Error:', error);
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

    // ← ADD THIS BLOCK
    if (!isEditingPres) {
      payload.petId = petId;  // Required for new prescriptions
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
    <PageContainer>
      <Sidebar />
      <ContentArea>
        <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#2e7d32', color: 'white', p: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <PetAvatarLarge src={pet.photo} alt={pet.name}>
              {pet.name?.[0]?.toUpperCase() || 'P'}
            </PetAvatarLarge>
            <Box>
              <Typography variant="h3" fontWeight="bold">{pet.name}</Typography>
              <Typography variant="h6">{pet.species} • {pet.breed || 'Mixed'}</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Age: {calculateAge(pet.dateOfBirth)} • Gender: {pet.gender || 'Unknown'}
              </Typography>
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ bgcolor: '#f5f7fa', borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Pet Information" />
            <Tab label="Medical Records" />
            <Tab label="Appointments" />
            <Tab label="Vaccinations & Prescriptions" />
          </Tabs>

          <Box sx={{ p: 6 }}>
            {activeTab === 0 && (
            <AlignedContent>
              <div className="row g-4">

                {/* PET DETAILS – 2/5 WIDTH */}
                <div className="col-12 col-md-5">
                  <Paper elevation={3} sx={{ height: '100%' }}>
                    <Box sx={{ bgcolor: '#2e7d32', color: 'white', p: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Pet Details
                      </Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <InfoRow><CalendarTodayIcon /><InfoLabel>Age:</InfoLabel><InfoValue>{calculateAge(pet.dateOfBirth)}</InfoValue></InfoRow>
                      <InfoRow><ScaleIcon /><InfoLabel>Weight:</InfoLabel><InfoValue>{pet.weight ? `${pet.weight} kg` : 'Not recorded'}</InfoValue></InfoRow>
                      <InfoRow><ColorLensIcon /><InfoLabel>Color:</InfoLabel><InfoValue>{pet.color || 'Not specified'}</InfoValue></InfoRow>
                      <InfoRow><DescriptionIcon /><InfoLabel>Microchip:</InfoLabel><InfoValue>{pet.microchipNumber || 'None'}</InfoValue></InfoRow>
                    </Box>
                  </Paper>
                </div>

                {/* OWNER INFORMATION – 3/5 WIDTH */}
                <div className="col-12 col-md-7">
                  <Paper elevation={3} sx={{ height: '100%' }}>
                    <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Owner Information
                      </Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <InfoRow><PersonIcon /><InfoLabel>Name:</InfoLabel><InfoValue>{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</InfoValue></InfoRow>
                      <InfoRow><PhoneIcon /><InfoLabel>Phone:</InfoLabel><InfoValue>{pet.ownerId?.phoneNumber || 'N/A'}</InfoValue></InfoRow>
                      <InfoRow><LocationOnIcon /><InfoLabel>Email:</InfoLabel><InfoValue>{pet.ownerId?.email || 'N/A'}</InfoValue></InfoRow>
                    </Box>
                  </Paper>
                </div>

                {/* ADDITIONAL NOTES – FULL WIDTH */}
                {pet.notes && (
                  <div className="col-12">
                    <Paper elevation={3}>
                      <Box sx={{ bgcolor: '#9c27b0', color: 'white', p: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Additional Notes
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                          {pet.notes}
                        </Typography>
                      </Box>
                    </Paper>
                  </div>
                )}
              </div>
            </AlignedContent>


            )}

            {activeTab === 1 && (
              <AlignedContent>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" color="#2e7d32">
                    Medical Records ({medicalRecords.length})
                  </Typography>
                  {!showMedForm && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowMedForm(true)}
                      sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                    >
                      Add New Record
                    </Button>
                  )}
                </Box>

                <Collapse in={showMedForm}>
                  <Paper
                    elevation={4}
                    sx={{ mb: 5, p: 4, border: '2px dashed #2e7d32', borderRadius: 3 }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" color="#2e7d32">
                        {isEditingMed ? 'Edit Medical Record' : 'New Medical Record'}
                      </Typography>
                      <IconButton onClick={cancelMedForm}>
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    {/* BOOTSTRAP GRID */}
                    <div className="row g-4">

                      {/* FULL WIDTH – Diagnosis */}
                      <div className="col-12">
                        <TextField
                          fullWidth
                          label="Diagnosis"
                          required
                          value={medFormData.diagnosis}
                          onChange={(e) =>
                            setMedFormData({ ...medFormData, diagnosis: e.target.value })
                          }
                          placeholder="e.g., Upper respiratory infection"
                        />
                      </div>

                      {/* LEFT – Visit Date */}
                      <div className="col-12 col-md-6">
                        <TextField
                          fullWidth
                          label="Visit Date"
                          type="date"
                          value={medFormData.date}
                          onChange={(e) =>
                            setMedFormData({ ...medFormData, date: e.target.value })
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EventIcon />
                              </InputAdornment>
                            ),
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </div>

                      {/* RIGHT – Visibility Switch */}
                      <div className="col-12 col-md-6 d-flex align-items-center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={medFormData.visibleToOwner}
                              onChange={(e) =>
                                setMedFormData({
                                  ...medFormData,
                                  visibleToOwner: e.target.checked,
                                })
                              }
                              color="success"
                            />
                          }
                          label="Visible to Pet Owner"
                        />
                      </div>

                      {/* FULL WIDTH – Treatment Notes */}
                      <div className="col-12">
                        <TextField
                          fullWidth
                          label="Treatment Notes"
                          multiline
                          rows={6}
                          value={medFormData.treatmentNotes}
                          onChange={(e) =>
                            setMedFormData({
                              ...medFormData,
                              treatmentNotes: e.target.value,
                            })
                          }
                          placeholder="Symptoms observed, medications prescribed, follow-up instructions..."
                        />
                      </div>

                      {/* FULL WIDTH – Attachments */}
                      <div className="col-12">
                        <Box
                          sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            p: 3,
                            bgcolor: '#f9f9f9',
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Attachments
                          </Typography>

                          {medFormData.attachments.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                gutterBottom
                              >
                                Current attachments:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                {medFormData.attachments.map((url, idx) => (
                                  <Tooltip key={idx} title="Click to view">
                                    <Chip
                                      label={url.split('/').pop().substring(0, 20) + '...'}
                                      onDelete={() => removeExistingAttachment(idx)}
                                      deleteIcon={<DeleteIcon />}
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                ))}
                              </Box>
                            </Box>
                          )}

                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mb: 2 }}
                          >
                            Add more files:
                          </Typography>

                          <input
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            id="attachment-upload"
                            multiple
                            type="file"
                            onChange={handleFileSelect}
                          />
                          <label htmlFor="attachment-upload">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<AttachFileIcon />}
                              disabled={uploading}
                              onClick={() => {
                                // Reset input value so onChange fires even if same file selected
                                document.getElementById('attachment-upload').value = '';
                              }}
                            >
                              {uploading ? 'Uploading...' : 'Select Files'} ({selectedFiles.length})
                            </Button>
                          </label>

                          {selectedFiles.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                              {selectedFiles.map((file, index) => (
                                <Tooltip key={index} title={file.name}>
                                  <Chip
                                    icon={
                                      file.type.includes('pdf') ? (
                                        <PictureAsPdfIcon />
                                      ) : (
                                        <ImageIcon />
                                      )
                                    }
                                    label={
                                      file.name.length > 25
                                        ? file.name.substring(0, 25) + '...'
                                        : file.name
                                    }
                                    onDelete={() => removeSelectedFile(index)}
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </div>

                      {/* BUTTONS */}
                      <div className="col-12 text-end">
                        <Button
                          onClick={cancelMedForm}
                          disabled={saving || uploading}
                          sx={{ mr: 2 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSaveMedRecord}
                          disabled={saving || uploading}
                          sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                        >
                          {saving || uploading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            'Save Record'
                          )}
                        </Button>
                      </div>
                    </div>
                  </Paper>
                </Collapse>


                <Collapse in={showPresForm}>
                  <Paper
                    elevation={4}
                    sx={{ p: 5, mb: 5, border: '2px dashed #1976d2', borderRadius: 3 }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 5,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" color="#1976d2">
                        {isEditingPres ? 'Edit' : 'New'} {presFormData.type}
                      </Typography>
                      <IconButton onClick={cancelPresForm} size="large">
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    {/* BOOTSTRAP TWO COLUMN SPLIT */}
                    <div className="row g-4">
                      {/* LEFT COLUMN */}
                      <div className="col-12 col-lg-6">
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={presFormData.type}
                            label="Type"
                            onChange={(e) =>
                              setPresFormData({ ...presFormData, type: e.target.value })
                            }
                          >
                            <MenuItem value="Medication">Medication</MenuItem>
                            <MenuItem value="Vaccination">Vaccination</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          fullWidth
                          label="Name"
                          required
                          value={presFormData.medicationName}
                          onChange={(e) =>
                            setPresFormData({
                              ...presFormData,
                              medicationName: e.target.value,
                            })
                          }
                          sx={{ mb: 3 }}
                        />

                        <TextField
                          fullWidth
                          label="Duration"
                          value={presFormData.duration}
                          onChange={(e) =>
                            setPresFormData({ ...presFormData, duration: e.target.value })
                          }
                          placeholder="e.g., 7 days, 1 month"
                          sx={{ mb: 3 }}
                        />
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="col-12 col-lg-6">
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel>Associated Medical Record</InputLabel>
                          <Select
                            value={presFormData.medicalRecordId}
                            label="Associated Medical Record"
                            onChange={(e) =>
                              setPresFormData({
                                ...presFormData,
                                medicalRecordId: e.target.value,
                              })
                            }
                          >
                            <MenuItem value="">None</MenuItem>
                            {medicalRecords.map((record) => (
                              <MenuItem key={record._id} value={record._id}>
                                {new Date(record.date).toLocaleDateString()} –{" "}
                                {record.diagnosis?.substring(0, 40) || "No diagnosis"}...
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <TextField
                          fullWidth
                          label="Dosage"
                          required
                          value={presFormData.dosage}
                          onChange={(e) =>
                            setPresFormData({ ...presFormData, dosage: e.target.value })
                          }
                          placeholder="e.g., 1 tablet, 5ml"
                          sx={{ mb: 3 }}
                        />

                        <TextField
                          fullWidth
                          label="Due Date"
                          type="date"
                          value={presFormData.dueDate}
                          onChange={(e) =>
                            setPresFormData({ ...presFormData, dueDate: e.target.value })
                          }
                          InputLabelProps={{ shrink: true }}
                          required={presFormData.type === "Vaccination"}
                          helperText={
                            presFormData.type === "Vaccination"
                              ? "Required for vaccination"
                              : "Optional"
                          }
                        />
                      </div>
                    </div>

                    {/* FULL WIDTH INSTRUCTIONS */}
                    <div className="row mt-4">
                      <div className="col-12">
                        <TextField
                          fullWidth
                          label="Instructions"
                          multiline
                          rows={8}
                          value={presFormData.instructions}
                          onChange={(e) =>
                            setPresFormData({
                              ...presFormData,
                              instructions: e.target.value,
                            })
                          }
                          placeholder="Take with food, twice daily, etc."
                        />
                      </div>
                    </div>


                    {/* Buttons */}
                    <Box sx={{ mt: 5, textAlign: 'right' }}>
                      <Button
                        variant="outlined"
                        onClick={cancelPresForm}
                        disabled={saving}
                        sx={{ mr: 2, minWidth: 110 }}
                      >
                        Cancel
                      </Button>

                      <Button
                        variant="contained"
                        onClick={handleSavePres}
                        disabled={saving}
                        sx={{
                          bgcolor: '#1976d2',
                          '&:hover': { bgcolor: '#1565c0' },
                          minWidth: 130,
                          py: 1.2,
                        }}
                      >
                        {saving ? (
                          <CircularProgress size={22} color="inherit" />
                        ) : (
                          'Save Prescription'
                        )}
                      </Button>
                    </Box>
                  </Paper>
                </Collapse>



                {medicalRecords.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <LocalHospitalIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
                    <Typography variant="h6" color="textSecondary">No medical records yet</Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={3}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#2e7d32' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} width="5%"></TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diagnosis</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Veterinarian</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Visibility</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Attachments</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicalRecords.map((record) => {
                          const isExpanded = expandedMedRows.has(record._id);
                          const shortDiagnosis = record.diagnosis?.length > 30 ? record.diagnosis.substring(0, 30) + '...' : record.diagnosis || '—';

                          const associatedPres = prescriptions.filter(pres => {
                            if (!pres.medicalRecordId || !record._id) return false;
                            const presId = typeof pres.medicalRecordId === 'object' 
                              ? pres.medicalRecordId._id || pres.medicalRecordId 
                              : pres.medicalRecordId;
                            return presId.toString() === record._id.toString();
                          });

                          return (
                            <React.Fragment key={record._id}>
                              <TableRow hover onClick={() => toggleMedExpand(record._id)} sx={{ cursor: 'pointer' }}>
                                <TableCell>
                                  <ExpandMore expand={isExpanded} onClick={(e) => { e.stopPropagation(); toggleMedExpand(record._id); }}>
                                    <ExpandMoreIcon />
                                  </ExpandMore>
                                </TableCell>
                                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                <TableCell>{shortDiagnosis}</TableCell>
                                <TableCell>Dr. {record.vetId?.firstName || 'Unknown'} {record.vetId?.lastName || ''}</TableCell>
                                <TableCell>
                                  {record.visibleToOwner ? <Chip label="Visible" color="success" size="small" /> : <Chip label="Hidden" color="default" size="small" />}
                                </TableCell>
                                <TableCell>
                                  <Chip label={record.attachments?.length || 0} icon={<AttachFileIcon />} size="small" color="primary" />
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                  <IconButton onClick={(e) => { e.stopPropagation(); startEditMed(record); }} size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteRecord(record._id); }} size="small" sx={{ color: '#d32f2f' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton onClick={(e) => { e.stopPropagation(); handleToggleVisibility(record._id, record.visibleToOwner); }} size="small">
                                    {record.visibleToOwner ? <VisibilityIcon fontSize="small" color="success" /> : <VisibilityOffIcon fontSize="small" />}
                                  </IconButton>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ p: 3, bgcolor: '#f9f9f9', borderTop: '1px solid #e0e0e0' }}>
                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Full Diagnosis:</Typography>
                                      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                                        {record.diagnosis || 'No diagnosis recorded.'}
                                      </Typography>

                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Treatment Notes:</Typography>
                                      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                                        {record.treatmentNotes || 'No treatment notes recorded.'}
                                      </Typography>

                                      {record.attachments && record.attachments.length > 0 && (
                                        <Box sx={{ mb: 3 }}>
                                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Attachments ({record.attachments.length})</Typography>
                                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                            {record.attachments.map((url, idx) => {
                                              const isPdf = url.toLowerCase().includes('.pdf');
                                              return (
                                                <Tooltip key={idx} title="Click to view">
                                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                                    <Box sx={{
                                                      width: 120,
                                                      height: 120,
                                                      borderRadius: 2,
                                                      border: '2px dashed #ccc',
                                                      display: 'flex',
                                                      flexDirection: 'column',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      bgcolor: '#f8f9fa',
                                                      '&:hover': { bgcolor: '#e9ecef', borderColor: '#2e7d32' }
                                                    }}>
                                                      {isPdf ? (
                                                        <>
                                                          <PictureAsPdfIcon sx={{ fontSize: 50, color: '#d32f2f', mb: 1 }} />
                                                          <Typography variant="caption" align="center">PDF</Typography>
                                                        </>
                                                      ) : (
                                                        <img src={url} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                                                      )}
                                                    </Box>
                                                  </a>
                                                </Tooltip>
                                              );
                                            })}
                                          </Box>
                                        </Box>
                                      )}

                                      <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                          Associated Prescriptions ({associatedPres.length})
                                        </Typography>
                                        {associatedPres.length === 0 ? (
                                          <Typography variant="body2" color="textSecondary">No prescriptions linked to this record.</Typography>
                                        ) : (
                                          <TableContainer component={Paper} sx={{ mt: 2 }}>
                                            <Table size="small">
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell width="5%"></TableCell>
                                                  <TableCell>Type</TableCell>
                                                  <TableCell>Name</TableCell>
                                                  <TableCell>Dosage</TableCell>
                                                  <TableCell>Duration</TableCell>
                                                  <TableCell>Due Date</TableCell>
                                                  <TableCell>Actions</TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {associatedPres.map((pres) => {
                                                  const isSubExpanded = expandedPresSubRows.has(pres._id);
                                                  return (
                                                    <React.Fragment key={pres._id}>
                                                      <TableRow hover onClick={() => togglePresSubExpand(pres._id)} sx={{ cursor: 'pointer' }}>
                                                        <TableCell>
                                                          <ExpandMore expand={isSubExpanded} onClick={(e) => { e.stopPropagation(); togglePresSubExpand(pres._id); }}>
                                                            <ExpandMoreIcon />
                                                          </ExpandMore>
                                                        </TableCell>
                                                        <TableCell>{pres.type}</TableCell>
                                                        <TableCell>{pres.medicationName}</TableCell>
                                                        <TableCell>{pres.dosage}</TableCell>
                                                        <TableCell>{pres.duration || '-'}</TableCell>
                                                        <TableCell>{pres.dueDate ? new Date(pres.dueDate).toLocaleDateString() : '-'}</TableCell>
                                                        <TableCell>
                                                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); startEditPres(pres); }}>
                                                            <EditIcon fontSize="small" />
                                                          </IconButton>
                                                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeletePres(pres._id); }} sx={{ color: '#d32f2f' }}>
                                                            <DeleteIcon fontSize="small" />
                                                          </IconButton>
                                                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDownloadPres(pres._id); }} sx={{ color: '#4caf50' }}>
                                                            <DownloadIcon fontSize="small" />
                                                          </IconButton>
                                                        </TableCell>
                                                      </TableRow>

                                                      <TableRow>
                                                        <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                                                          <Collapse in={isSubExpanded} timeout="auto" unmountOnExit>
                                                            <Box sx={{ p: 2, bgcolor: '#f0f0f0' }}>
                                                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Instructions:</Typography>
                                                              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                                                {pres.instructions || 'No instructions provided.'}
                                                              </Typography>
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
                                        )}
                                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAddPresForm(record._id)} sx={{ mt: 2 }}>
                                          Add Prescription
                                        </Button>
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
                )}
              </AlignedContent>
            )}

            {activeTab === 2 && (
              <AlignedContent>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" fontWeight="bold" color="#2e7d32">
                    Appointments ({appointments.length})
                  </Typography>
                </Box>

                {appointments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <CalendarTodayIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
                    <Typography variant="h6" color="textSecondary">No appointments</Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={3}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#1976d2' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date & Time</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clinic</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Veterinarian</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reason</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.map((appt) => (
                          <TableRow key={appt._id} hover>
                            <TableCell>{new Date(appt.dateTime).toLocaleString()}</TableCell>
                            <TableCell>{appt.clinicId?.name || 'Unknown'}</TableCell>
                            <TableCell>Dr. {appt.vetId?.firstName || 'Unknown'} {appt.vetId?.lastName || ''}</TableCell>
                            <TableCell>{getStatusChip(appt.status)}</TableCell>
                            <TableCell>{appt.reason || '—'}</TableCell>
                            <TableCell>{appt.notes || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AlignedContent>
            )}

            {activeTab === 3 && (
              <AlignedContent>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" color="#2e7d32">
                    Vaccinations & Prescriptions ({prescriptions.length})
                  </Typography>
                  {!showPresForm && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => openAddPresForm(null)}
                      sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                    >
                      Add New
                    </Button>
                  )}
                </Box>

                <Collapse in={showPresForm}>
                  <Paper elevation={4} sx={{ mb: 5, p: 4, border: '2px dashed #1976d2', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                      <Typography variant="h6" fontWeight="bold" color="#1976d2">
                        {isEditingPres ? 'Edit' : 'New'} {presFormData.type}
                      </Typography>
                      <IconButton onClick={cancelPresForm}>
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    {/* BOOTSTRAP GRID WRAPPER */}
                    <div className="row g-3">

                      {/* LEFT COLUMN */}
                      <div className="col-12 col-md-6">
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={presFormData.type}
                            label="Type"
                            onChange={(e) =>
                              setPresFormData({ ...presFormData, type: e.target.value })
                            }
                          >
                            <MenuItem value="Medication">Medication</MenuItem>
                            <MenuItem value="Vaccination">Vaccination</MenuItem>
                          </Select>
                        </FormControl>
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="col-12 col-md-6">
                        <FormControl fullWidth>
                          <InputLabel>Associated Medical Record</InputLabel>
                          <Select
                            value={presFormData.medicalRecordId}
                            label="Associated Medical Record"
                            onChange={(e) =>
                              setPresFormData({
                                ...presFormData,
                                medicalRecordId: e.target.value,
                              })
                            }
                          >
                            <MenuItem value="">None</MenuItem>
                            {medicalRecords.map((record) => (
                              <MenuItem key={record._id} value={record._id}>
                                {new Date(record.date).toLocaleDateString()} -{" "}
                                {record.diagnosis?.substring(0, 30) || "Untitled"}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>

                      {/* LEFT COLUMN */}
                      <div className="col-12 col-md-6">
                        <TextField
                          fullWidth
                          label="Name"
                          required
                          value={presFormData.medicationName}
                          onChange={(e) =>
                            setPresFormData({
                              ...presFormData,
                              medicationName: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="col-12 col-md-6">
                        <TextField
                          fullWidth
                          label="Dosage"
                          required
                          value={presFormData.dosage}
                          onChange={(e) =>
                            setPresFormData({ ...presFormData, dosage: e.target.value })
                          }
                        />
                      </div>

                      {/* LEFT COLUMN */}
                      <div className="col-12 col-md-6">
                        <TextField
                          fullWidth
                          label="Duration"
                          value={presFormData.duration}
                          onChange={(e) =>
                            setPresFormData({ ...presFormData, duration: e.target.value })
                          }
                        />
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="col-12 col-md-6">
                        <TextField
                          fullWidth
                          label="Due Date"
                          type="date"
                          value={presFormData.dueDate}
                          onChange={(e) =>
                            setPresFormData({ ...presFormData, dueDate: e.target.value })
                          }
                          InputLabelProps={{ shrink: true }}
                          required={presFormData.type === "Vaccination"}
                        />
                      </div>

                      {/* FULL WIDTH INSTRUCTIONS */}
                      <div className="col-12">
                        <TextField
                          fullWidth
                          label="Instructions"
                          multiline
                          rows={4}
                          value={presFormData.instructions}
                          onChange={(e) =>
                            setPresFormData({
                              ...presFormData,
                              instructions: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* BUTTONS */}
                      <div className="col-12 text-end">
                        <Button onClick={cancelPresForm} disabled={saving} sx={{ mr: 2 }}>
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSavePres}
                          disabled={saving}
                          sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}
                        >
                          {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
                        </Button>
                      </div>
                    </div>

                  </Paper>
                </Collapse>

                {prescriptions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <VaccinesIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
                    <Typography variant="h6" color="textSecondary">No vaccinations or prescriptions yet</Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={3}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#1976d2' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} width="5%"></TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dosage</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prescriptions.map((pres) => {
                          const isExpanded = expandedPresRows.has(pres._id);
                          return (
                            <React.Fragment key={pres._id}>
                              <TableRow hover onClick={() => togglePresExpand(pres._id)} sx={{ cursor: 'pointer' }}>
                                <TableCell>
                                  <ExpandMore expand={isExpanded} onClick={(e) => { e.stopPropagation(); togglePresExpand(pres._id); }}>
                                    <ExpandMoreIcon />
                                  </ExpandMore>
                                </TableCell>
                                <TableCell>{pres.type}</TableCell>
                                <TableCell>{pres.medicationName}</TableCell>
                                <TableCell>{pres.dosage}</TableCell>
                                <TableCell>{pres.duration || '—'}</TableCell>
                                <TableCell>{pres.dueDate ? new Date(pres.dueDate).toLocaleDateString() : '—'}</TableCell>
                                <TableCell>
                                  <IconButton onClick={(e) => { e.stopPropagation(); startEditPres(pres); }} size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton onClick={(e) => { e.stopPropagation(); handleDeletePres(pres._id); }} size="small" sx={{ color: '#d32f2f' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton onClick={(e) => { e.stopPropagation(); handleDownloadPres(pres._id); }} size="small" sx={{ color: '#4caf50' }}>
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ p: 3, bgcolor: '#f9f9f9' }}>
                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Instructions:</Typography>
                                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                        {pres.instructions || 'No instructions provided.'}
                                      </Typography>
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
                )}
              </AlignedContent>
            )}
          </Box>
        </Paper>
      </ContentArea>
    </PageContainer>
  );
};

export default PetProfile;