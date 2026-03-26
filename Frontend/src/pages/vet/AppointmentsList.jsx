import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, FormControl, Select, InputLabel, TablePagination,
  Avatar, Chip, IconButton, Collapse, Grid, Card, CardContent, CardHeader, Tabs, Tab, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, alpha, Divider, Stack, Autocomplete,
  CircularProgress, Tooltip, Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import { useTheme, useMediaQuery } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Pets as PetsIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Medication as MedicationIcon,
  Chat as ChatIcon,
  Add as AddIcon
} from '@mui/icons-material';
import api from '../../services/api';
import socket, { connectSocket, disconnectSocket } from '../../services/socket';

// Styled Components
const CustomPagination = ({ count, page, rowsPerPage, onPageChange }) => {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      rowsPerPageOptions={[]}
      labelRowsPerPage=""
    />
  );
};

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  boxSizing: 'border-box',
  boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
  border: '1px solid #e2e8f0',
  flex: 1,
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    padding: '16px',
  },
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  marginTop: 20,
  flexWrap: 'wrap',
  gap: 20,
}));

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  '&:hover': {
    backgroundColor: '#f1f1f1',
  },
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  borderRadius: 12,
  marginBottom: 10,
  transition: 'all 0.3s ease',
  '&.highlight-row': {
    backgroundColor: alpha(theme.palette.secondary.main || '#7b1fa2', 0.1),
    borderLeft: `5px solid ${theme.palette.secondary.main || '#7b1fa2'}`,
    animation: 'pulse 2s infinite'
  },
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.7 },
    '100%': { opacity: 1 }
  }
}));

const TableHeadRow = styled(TableRow)({
  backgroundColor: '#7b1fa2',
});

const TableHeadCell = styled(TableCell)({
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
});

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  border: '3px solid white',
  [theme.breakpoints.down('sm')]: {
    width: 45,
    height: 45,
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 'bold',
  color: 'white',
  backgroundColor:
    status === 'Confirmed' ? '#4caf50' :
      status === 'Booked' ? '#2196f3' :
        status === 'Canceled' ? '#f44336' :
          status === 'Completed' ? '#9c27b0' : '#ff9800',
}));

const DetailsCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  borderRadius: 12,
  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
}));

const CardHeaderStyled = styled(CardHeader)(({ bgcolor }) => ({
  backgroundColor: bgcolor || '#8e24aa',
  color: 'white',
  padding: 16,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(2, 0),
  '& svg': {
    marginRight: 12,
    color: '#8e24aa',
    fontSize: 28,
  },
}));

const InfoLabel = styled(Typography)({
  fontWeight: 'bold',
  color: '#555',
  minWidth: 120,
});

const InfoValue = styled(Typography)({
  color: '#333',
});

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
  color: 'white',
  padding: '6px 20px',
  borderRadius: '12px',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '0.9rem',
  boxShadow: '0 10px 25px rgba(142, 36, 170, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 30px rgba(142, 36, 170, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const StyledTabs = styled(Tabs)({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': { backgroundColor: '#7b1fa2' },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: '1rem',
  color: '#64748b',
  '&.Mui-selected': { color: '#7b1fa2' },
  padding: '16px 24px',
});

const VetAppointmentsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.highlightId) {
      setExpandedRow(location.state.highlightId);
      // Optional: Clear state so it doesn't re-expand on other actions
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("petName");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clinicFilter, setClinicFilter] = useState("all");

  const [pageAll, setPageAll] = useState(0);
  const [rowsPerPageAll] = useState(8);

  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('vet_user');
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const vetId = currentUser?.id || currentUser?._id || null;
  const clinicId = 'all';
  const isVeterinarian = currentUser && (!currentUser.staffRole || currentUser.staffRole === 'Veterinarian');

  const isToday = (dateString) => {
    if (!dateString) return false;
    const appDate = new Date(dateString);
    const today = new Date();
    return (
      appDate.getDate() === today.getDate() &&
      appDate.getMonth() === today.getMonth() &&
      appDate.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    if (!vetId) return;

    connectSocket(vetId);

    socket.on('newAppointment', (newApp) => {
      setAppointments(prev => {
        if (prev.find(a => a._id === newApp._id)) return prev;
        const updated = [...prev, newApp];
        updated.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        return updated;
      });
    });

    socket.on('appointmentStatusChanged', (updatedApp) => {
      setAppointments(prev =>
        prev.map(app => app._id === updatedApp._id ? updatedApp : app)
      );
    });

    return () => {
      socket.off('newAppointment');
      socket.off('appointmentStatusChanged');
      disconnectSocket();
    };
  }, [vetId]);

  useEffect(() => {
    if (!vetId) {
      Swal.fire({ title: 'Access Denied', text: 'Veterinarian information not found. Please log in again.', icon: 'error' });
      setLoading(false);
      return;
    }

    const fetchVetAppointments = async () => {
      try {
        setLoading(true);
        // FETCH FROM CLINIC INSTEAD OF VET
        const endpoint = clinicId ? `/appointments/clinic/${clinicId}` : `/appointments/vet/${vetId}`;
        const response = await api.get(endpoint);

        let appointmentsData = [];
        if (Array.isArray(response.data)) {
          appointmentsData = response.data;
        } else if (response.data?.appointments && Array.isArray(response.data.appointments)) {
          appointmentsData = response.data.appointments;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          appointmentsData = response.data.data;
        }

        appointmentsData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching vet appointments:', error);
        Swal.fire({ title: 'Error!', text: error.response?.data?.message || 'Failed to load your appointments', icon: 'error' });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVetAppointments();
  }, [vetId]);

  const handleConfirm = async (id) => {
    try {
      const response = await api.patch(`/appointments/${id}/confirm`);
      const updatedApp = response.data.appointment;
      setAppointments(appointments.map(app =>
        app._id === id ? updatedApp : app
      ));
      Swal.fire({
        title: 'Confirmed!',
        text: 'Appointment has been confirmed.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Could not confirm appointment', 'error');
    }
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Cancel Appointment?',
      text: 'This action cannot be undone and will notify the owner.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.patch(`/appointments/${id}/cancel`);
        const updatedApp = response.data.appointment;
        setAppointments(appointments.map(app =>
          app._id === id ? updatedApp : app
        ));
        Swal.fire({
          title: 'Canceled!',
          text: 'Appointment has been canceled.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire('Error!', error.response?.data?.message || 'Could not cancel appointment', 'error');
      }
    }
  };


  const handlePendingManage = async (app) => {
    const result = await Swal.fire({
      title: 'Manage Pending Appointment',
      text: `Manage appointment for ${app.petId?.name || 'this pet'}`,
      showCloseButton: true,
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Confirm Appointment',
      denyButtonText: 'Reject Appointment',
      confirmButtonColor: '#4caf50',
      denyButtonColor: '#f44336',
    });

    if (result.isConfirmed) {
      handleConfirm(app._id);
    } else if (result.isDenied) {
      handleCancel(app._id);
    }
  };

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAllAppointments = appointments.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (clinicFilter !== 'all' && app.clinicId?._id !== clinicFilter) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    switch (searchCriteria) {
      case 'petName': return app.petId?.name?.toLowerCase().includes(query);
      case 'ownerName': return `${app.petId?.ownerId?.firstName || ''} ${app.petId?.ownerId?.lastName || ''}`.toLowerCase().includes(query);
      case 'reason': return app.reason?.toLowerCase().includes(query);
      default: return true;
    }
  }).sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  const paginatedAllAppointments = filteredAllAppointments.slice(pageAll * rowsPerPageAll, pageAll * rowsPerPageAll + rowsPerPageAll);

  // Get unique clinics from appointments to populate filter
  const uniqueClinics = appointments.reduce((acc, app) => {
    if (app.clinicId && !acc.find(c => c._id === app.clinicId._id)) {
      acc.push(app.clinicId);
    }
    return acc;
  }, []);

  const [openManageModal, setOpenManageModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [manageDiagnosis, setManageDiagnosis] = useState('');
  const [manageNotes, setManageNotes] = useState('');
  const [recordFile, setRecordFile] = useState(null);
  const [rxFile, setRxFile] = useState(null);

  const [prescriptionsRows, setPrescriptionsRows] = useState([]);

  const handleAddPresRow = () => {
    setPrescriptionsRows(prev => [...prev, { medicationName: '', dosage: '', duration: '', type: 'Medication' }]);
  };

  const handleRemovePresRow = (index) => {
    setPrescriptionsRows(prev => prev.filter((_, i) => i !== index));
  };

  const handlePresFieldChange = (index, field, value) => {
    setPrescriptionsRows(prev => {
      const newPres = [...prev];
      newPres[index] = { ...newPres[index], [field]: value };
      return newPres;
    });
  };

  const handleOpenManage = async (app) => {
    setSelectedApp(app);
    setManageDiagnosis(app.diagnosis || '');
    setManageNotes(app.medicalNotes || '');
    setRecordFile(null);
    setRxFile(null);
    setPrescriptionsRows([]);
    setOpenManageModal(true);

    // Fetch previously saved prescriptions for this appointment
    try {
      const petId = app.petId?._id || app.petId;
      if (petId) {
        const res = await api.get(`/prescriptions/pet/${petId}`);
        const allPres = res.data.prescriptions || [];

        // Fetch medical records for the pet to find this appointment's record
        const medRes = await api.get(`/medical-records/pet/${petId}`);
        const medRecords = medRes.data.records || [];
        const apptRecord = medRecords.find(m => {
          const mid = m.appointmentId?._id || m.appointmentId;
          return mid?.toString() === app._id?.toString();
        });

        if (apptRecord) {
          const linked = allPres.filter(p => {
            const pMedId = p.medicalRecordId?._id || p.medicalRecordId;
            return pMedId?.toString() === apptRecord._id?.toString();
          });

          if (linked.length > 0) {
            setPrescriptionsRows(linked.map(p => ({
              medicationName: p.medicationName || '',
              dosage: p.dosage || '',
              duration: p.duration || '',
              type: p.type || 'Medication'
            })));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load existing prescriptions:', err);
    }
  };

  const handleCloseManage = () => {
    setOpenManageModal(false);
    setSelectedApp(null);
    setManageDiagnosis('');
    setManageNotes('');
    setPrescriptionsRows([]);
  };

  const handleUpdateConfirmedApp = async (markCompleted = false) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('diagnosis', manageDiagnosis);
      formData.append('medicalNotes', manageNotes);
      if (recordFile) formData.append('medicalRecord', recordFile);
      if (rxFile) formData.append('prescription', rxFile);
      if (markCompleted) formData.append('status', 'Completed');

      if (prescriptionsRows.length > 0) {
        formData.append('prescriptions', JSON.stringify(prescriptionsRows));
      }

      // Do not explicitly set Content-Type header so Axios can automatically generate the correct boundary
      const response = await api.patch(`/appointments/${selectedApp._id}/manage`, formData);

      const updatedAppt = response.data.appointment;

      setAppointments(prev => prev.map(app =>
        app._id === selectedApp._id
          ? updatedAppt
          : app
      ));

      Swal.fire('Success', `Appointment ${markCompleted ? 'completed' : 'updated'} successfully!`, 'success');
      handleCloseManage();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (appointmentsList, page, rowsPerPage, onPageChange, totalCount) => (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeadCell></TableHeadCell>
              <TableHeadCell>Pet</TableHeadCell>
              <TableHeadCell>Clinic</TableHeadCell>
              <TableHeadCell>Date & Time</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {appointmentsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="h6" color="textSecondary">No appointments found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              appointmentsList.map((app) => (
                <React.Fragment key={app._id}>
                  <TableRowStyled className={expandedRow === app._id ? 'highlight-row' : ''}>
                    <TableCell>
                      <IconButton onClick={() => handleExpandRow(app._id)}>
                        <ExpandMoreIcon sx={{ transform: expandedRow === app._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PetAvatar src={app.petId?.photo || ''} alt={app.petId?.name}>
                          {app.petId?.name?.charAt(0).toUpperCase() || 'P'}
                        </PetAvatar>
                        <Box>
                          <Typography fontWeight="bold">{app.petId?.name || 'Unknown'}</Typography>
                          <Typography variant="caption" sx={{ color: '#1e293b', display: 'block', fontWeight: 600 }}>
                            {app.petId?.ownerId ? `${app.petId.ownerId.firstName} ${app.petId.ownerId.lastName}` : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#49149eff' }}>
                        {app.clinicId?.name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {new Date(app.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusChip label={app.status === 'Booked' ? 'Pending' : app.status} status={app.status} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {isVeterinarian && app.status === 'Booked' && (
                          <StyledButton
                            size="small"
                            onClick={() => handlePendingManage(app)}
                          >
                            Manage
                          </StyledButton>
                        )}
                        {isVeterinarian && app.status === 'Confirmed' && (
                          <StyledButton
                            size="small"
                            onClick={() => handleOpenManage(app)}
                          >
                            Manage
                          </StyledButton>
                        )}
                        {isVeterinarian && app.status === 'Confirmed' && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleCancel(app._id)}
                            sx={{
                              bgcolor: alpha('#f44336', 0.1),
                              '&:hover': { bgcolor: alpha('#f44336', 0.2) }
                            }}
                          >
                            <CancelIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRowStyled>

                  <TableRow>
                    <TableCell style={{ padding: 0 }} colSpan={6}>
                      <Collapse in={expandedRow === app._id} timeout="auto" unmountOnExit>
                        <DetailsCard sx={{ m: 2 }}>
                          <Grid container spacing={3} sx={{ p: 2 }}>
                            <Grid item xs={12}>
                              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'white', border: '1px solid #edf2f7', width: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <Typography variant="h6" sx={{ color: '#7b1fa2', fontWeight: 700, mb: 2, borderBottom: '2px solid #f0f0f0', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CalendarTodayIcon /> Appointment Details
                                </Typography>
                                <Box sx={{ px: 1, flexGrow: 1 }}>
                                  <InfoRow><CalendarTodayIcon sx={{ fontSize: 20 }} /><InfoLabel sx={{ minWidth: 100 }}>Date:</InfoLabel><Typography variant="body2"><strong>{new Date(app.dateTime).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></Typography></InfoRow>
                                  <InfoRow><AccessTimeIcon sx={{ fontSize: 20 }} /><InfoLabel sx={{ minWidth: 100 }}>Time:</InfoLabel><Typography variant="body2"><strong>{new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></Typography></InfoRow>
                                  <InfoRow><DescriptionIcon sx={{ fontSize: 20 }} /><InfoLabel sx={{ minWidth: 100 }}>Reason:</InfoLabel><Typography variant="body2">{app.reason || 'Not specified'}</Typography></InfoRow>
                                  {app.notes && (
                                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '4px solid #7b1fa2' }}>
                                      <Typography variant="body2"><strong>Notes:</strong> {app.notes}</Typography>
                                    </Box>
                                  )}
                                  {app.petId?.ownerId?._id && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<ChatIcon />}
                                        onClick={() => navigate(`/vet/chat/owner/${app.petId.ownerId._id}`, { state: { selectedPetId: app.petId._id } })}
                                        sx={{
                                          borderRadius: '12px',
                                          textTransform: 'none',
                                          fontWeight: 'bold',
                                          color: '#49149eff',
                                          borderColor: '#49149eff',
                                          '&:hover': {
                                            borderColor: '#49149eff',
                                            backgroundColor: alpha('#49149eff', 0.04),
                                            boxShadow: '0 4px 12px rgba(73, 20, 158, 0.1)'
                                          }
                                        }}
                                      >
                                        Chat with Owner
                                      </Button>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </DetailsCard>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <CustomPagination count={totalCount} page={page} rowsPerPage={rowsPerPage} onPageChange={onPageChange} />
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc'
        }}>
          <ContentContainer sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', mb: 3 }}>
              Appointments Management
            </Typography>

            <SearchSection>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                  <FormControl sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                    <InputLabel>Search By</InputLabel>
                    <Select size="small" value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)} label="Search By">
                      <MenuItem value="petName">Pet Name</MenuItem>
                      <MenuItem value="ownerName">Owner Name</MenuItem>
                      <MenuItem value="reason">Reason</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    variant="outlined"
                    placeholder={`Search...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      width: isMobile ? '100%' : 300,
                      '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                    <InputLabel>Clinic</InputLabel>
                    <Select
                      size="small"
                      value={clinicFilter}
                      onChange={(e) => setClinicFilter(e.target.value)}
                      label="Clinic"
                    >
                      <MenuItem value="all">All Clinics</MenuItem>
                      {uniqueClinics.map(clinic => (
                        <MenuItem key={clinic._id} value={clinic._id}>{clinic.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                    <InputLabel>Status</InputLabel>
                    <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="Booked">Pending</MenuItem>
                      <MenuItem value="Confirmed">Confirmed</MenuItem>
                      <MenuItem value="Canceled">Canceled</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </SearchSection>

            {renderTable(paginatedAllAppointments, pageAll, rowsPerPageAll, (e, newPage) => setPageAll(newPage), filteredAllAppointments.length)}

          </ContentContainer>
        </Box>
      </Box>

      {/* Manage Appointment Modal */}
      <Dialog open={openManageModal} onClose={handleCloseManage} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'none' }}>
          Manage Appointment
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#fdfdfd' }}>
          <Box sx={{ p: 4, pb: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <CheckCircleOutlineIcon sx={{ color: '#2196f3', fontSize: 24, mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  Medical Documents {selectedApp?.petId?.name ? `- ${selectedApp.petId.name}` : ''}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', ml: 4, fontWeight: 700, display: 'block' }}>
                Visit Date: {selectedApp?.dateTime ? new Date(selectedApp.dateTime).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' }) : 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Box
                  component="label"
                  sx={{
                    border: '2px dashed #e0e0e0',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#2196f3', backgroundColor: '#f0f8ff' },
                    transition: 'all 0.2s',
                    height: '100%'
                  }}
                >
                  <Box sx={{ width: 45, height: 45, borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ color: '#2196f3', fontSize: 24 }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: '#333' }}>Medical Records</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>Upload visit summary (PDF/JPG)</Typography>
                  <input type="file" hidden onChange={(e) => setRecordFile(e.target.files[0])} />
                  {recordFile && <Typography variant="caption" sx={{ mt: 1, color: '#2196f3', fontWeight: 'bold', wordBreak: 'break-all' }}>{recordFile.name}</Typography>}
                </Box>
              </Box>

            </Box>

            {(selectedApp?.medicalRecordUrl || selectedApp?.prescriptionUrl) && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>Previously Uploaded Documents:</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {selectedApp.medicalRecordUrl && (
                    <Button size="small" variant="outlined" component="a" href={selectedApp.medicalRecordUrl} target="_blank" startIcon={<DescriptionIcon />}>
                      View Medical Record
                    </Button>
                  )}
                  {selectedApp.prescriptionUrl && (
                    <Button size="small" variant="outlined" color="success" component="a" href={selectedApp.prescriptionUrl} target="_blank" startIcon={<MedicationIcon />}>
                      View Prescription
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666', mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              Diagnosis
            </Typography>
            <TextField
              multiline
              rows={2}
              variant="outlined"
              fullWidth
              value={manageDiagnosis}
              onChange={(e) => setManageDiagnosis(e.target.value)}
              placeholder="e.g. Mild dermatitis, Gastrointestinal upset"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f9f9f9',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e0e0e0' }
                }
              }}
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666', mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              Special Notes & Observations (Medical Notes)
            </Typography>
            <TextField
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              value={manageNotes}
              onChange={(e) => setManageNotes(e.target.value)}
              placeholder="Luna has been a bit sluggish lately, owner wants to check energy levels."
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f9f9f9',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#e0e0e0' }
                }
              }}
            />

            {/* Structured Prescriptions Section */}
            <Box sx={{ mt: 3, border: '1px solid #e0e0e0', borderRadius: 2, p: 2, bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>Prescriptions</Typography>
                <Button startIcon={<AddIcon />} size="small" variant="outlined" onClick={handleAddPresRow} sx={{ textTransform: 'none' }}>Add Prescription</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Upload Prescription File Card moved here */}
              <Box sx={{ mb: 3 }}>
                <Box
                  component="label"
                  sx={{
                    border: '2px dashed #e0e0e0',
                    borderRadius: 3,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    bgcolor: 'white',
                    '&:hover': { borderColor: '#4caf50', backgroundColor: '#f1f8e9' },
                    transition: 'all 0.2s',
                  }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <MedicationIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: '#333' }}>Upload Prescription File</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>Optional: Upload digital/scanned prescription</Typography>
                  <input type="file" hidden onChange={(e) => setRxFile(e.target.files[0])} />
                  {rxFile && <Typography variant="caption" sx={{ mt: 1, color: '#4caf50', fontWeight: 'bold', wordBreak: 'break-all' }}>{rxFile.name}</Typography>}
                </Box>
              </Box>
              {prescriptionsRows.length === 0 ? (
                <Typography variant="caption" color="textSecondary" align="center" display="block" py={2}>No medications added.</Typography>
              ) : (
                <Stack spacing={2}>
                  {prescriptionsRows.map((pres, idx) => (
                    <Box key={idx} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Prescription"
                            placeholder="e.g. Amoxicillin"
                            value={pres.medicationName}
                            onChange={(e) => handlePresFieldChange(idx, 'medicationName', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Dosage"
                            placeholder="e.g. 250mg"
                            value={pres.dosage}
                            onChange={(e) => handlePresFieldChange(idx, 'dosage', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={10} sm={4}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Duration"
                            placeholder="e.g. 7 days / Twice daily"
                            value={pres.duration}
                            onChange={(e) => handlePresFieldChange(idx, 'duration', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={2} sm={1} sx={{ textAlign: 'right' }}>
                          <IconButton size="small" color="error" onClick={() => handleRemovePresRow(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, backgroundColor: '#fdfdfd' }}>
          <Button onClick={handleCloseManage} color="inherit" sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 'bold' }}>
            Cancel
          </Button>

          <Button onClick={() => handleUpdateConfirmedApp(true)} variant="contained" color="success" sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 'bold', boxShadow: 'none' }}>
            Mark Completed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VetAppointmentsList;