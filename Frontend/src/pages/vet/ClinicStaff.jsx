// src/pages/vet/ClinicStaff.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Button, Tooltip, TextField, Grid, Card, CardContent,
  CardHeader, Avatar, Collapse, InputAdornment, TablePagination, useTheme, useMediaQuery,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';

const specializations = [
  'General Practice', 'Surgery', 'Dermatology', 'Internal Medicine', 'Cardiology',
  'Oncology', 'Neurology', 'Ophthalmology', 'Dentistry', 'Emergency Care',
  'Radiology', 'Anesthesiology', 'Exotic Animals', 'Equine Medicine'
];

// Styled Components
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

const PageTitle = styled(Typography)({
  fontWeight: 900,
  color: '#0f172a',
  letterSpacing: '-0.5px',
  marginBottom: 24,
});

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  '&:hover': { backgroundColor: '#f1f1f1' },
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  borderRadius: 12,
  marginBottom: 10,
}));

const TableHeadRow = styled(TableRow)({
  backgroundColor: '#e08c0eff',
});

const TableHeadCell = styled(TableCell)({
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
});

const AccessChip = styled(Chip)(({ level }) => ({
  fontWeight: 'bold',
  color: 'white',
  backgroundColor:
    level === 'Enhanced' ? '#1976d2' :
      level === 'Admin' ? '#7b1fa2' :
        level === 'Moderate' ? '#f57c00' :
          '#43a047',
}));

const AddButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
  color: 'white',
  padding: '10px 24px',
  borderRadius: '12px',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: '0 10px 25px rgba(142, 36, 170, 0.2)',
  transition: 'all 0.3s ease',
  height: 44,
  '&:hover': {
    background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 30px rgba(142, 36, 170, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const StaffAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: '#8e24aa',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  border: '3px solid white',
  [theme.breakpoints.down('sm')]: {
    width: 60,
    height: 60,
  },
}));

const DetailsCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2, 0),
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
    fontSize: 24,
  },
}));

const InfoLabel = styled(Typography)({
  fontWeight: 'bold',
  color: '#555',
  minWidth: 150,
  marginRight: 16,
});

const InfoValue = styled(Typography)({
  color: '#333',
  flex: 1,
});

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  flex: 1,
}));

const SearchField = styled(TextField)(({ theme }) => ({
  flex: 1,
  maxWidth: 400,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    width: '100%',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#f9f9f9',
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  flexWrap: 'wrap',
  gap: 20,
}));

const ClinicStaff = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [staff, setStaff] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);
  const navigate = useNavigate();

  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    staffType: 'veterinarian',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    specialization: '',
    accessLevel: 'Basic',
    role: 'Veterinarian',
    clinicId: ''
  });

  const handleOpenAddPopup = () => setIsAddPopupOpen(true);
  const handleCloseAddPopup = () => {
    setIsAddPopupOpen(false);
    setErrors({});
    setFormData({
      staffType: 'veterinarian',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      specialization: '',
      accessLevel: 'Basic',
      role: 'Veterinarian',
      clinicId: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddStaffSubmit = async () => {
    const required = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phoneNumber', 'specialization'];

    const missing = required.filter(field => !formData[field]?.trim());
    if (missing.length > 0) {
      Swal.fire('Missing Fields', 'Please fill all required fields', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    try {
      const payload = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
      };
      await api.post('/clinics/staff', payload);
      Swal.fire('Success!', 'Staff member added successfully.', 'success');
      handleCloseAddPopup();
      const response = await api.get('/vets/clinics/staff');
      setStaff(response.data.staff || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add staff';
      if (errorMsg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMsg }));
      } else if (errorMsg.toLowerCase().includes('phone')) {
        setErrors(prev => ({ ...prev, phoneNumber: errorMsg }));
      } else {
        Swal.fire('Error!', errorMsg, 'error');
      }
    }
  };

  useEffect(() => {
    const fetchClinicStaff = async () => {
      try {
        const response = await api.get('/vets/clinics/staff');
        setStaff(response.data.staff || []);
        setClinics(response.data.clinics || []);
      } catch (error) {
        Swal.fire('Error', 'Could not load clinic staff', 'error');
        setStaff([]);
        setClinics([]);
      }
    };
    fetchClinicStaff();
  }, []);

  const getStaffNumber = (id) => (id ? id.slice(-6).toUpperCase() : 'N/A');

  const getClinicName = (member) => {
    const isEnhanced = member.isEnhanced || member.details?.isEnhanced || member.details?.accessLevel === 'Enhanced';
    if (isEnhanced) {
      if (typeof member.clinic === 'string' && clinics.length > 0) {
        return clinics.find(c => c._id === member.clinic)?.name || 'Enhanced Access';
      }
      return member.clinic?.name || 'Enhanced Veterinarian';
    }
    if (member.clinic?.name) return member.clinic.name;
    if (member.currentActiveClinicId && clinics.length > 0) {
      return clinics.find(c => c._id === member.currentActiveClinicId)?.name || 'Unassigned';
    }
    return 'Unassigned';
  };

  const filteredStaff = staff.filter((member) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const staffNumber = getStaffNumber(member._id).toLowerCase();
    return fullName.includes(query) || staffNumber.includes(query) || (member.email || '').toLowerCase().includes(query);
  });

  const paginatedStaff = filteredStaff.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDeactivate = async (id, name) => {
    const result = await Swal.fire({
      title: `Deactivate ${name}?`,
      text: "This member will no longer have access to the system",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, deactivate'
    });
    if (result.isConfirmed) {
      try {
        const member = staff.find(s => s._id === id);
        const endpoint = member.type === 'Veterinarian' ? `/vets/${id}/deactivate` : `/clinics/staff/${id}/deactivate`;
        await api.patch(endpoint);
        setStaff(prev => prev.map(s => s._id === id ? { ...s, status: 'Inactive' } : s));
        Swal.fire('Deactivated!', `${name} has been deactivated.`, 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not deactivate member', 'error');
      }
    }
  };

  const handleActivate = async (id, name) => {
    const result = await Swal.fire({ title: `Activate ${name}?`, icon: 'question', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        const member = staff.find(s => s._id === id);
        const endpoint = member.type === 'Veterinarian' ? `/vets/${id}/activate` : `/clinics/staff/${id}/activate`;
        await api.patch(endpoint);
        setStaff(prev => prev.map(s => s._id === id ? { ...s, status: 'Active' } : s));
        Swal.fire('Activated!', `${name} has been activated.`, 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not activate member', 'error');
      }
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: '',
    staffType: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    veterinaryId: '',
    specialization: '',
    accessLevel: '',
    role: '',
    assignedClinics: [],
    status: 'Active'
  });

  const handleEdit = async (id, type) => {
    try {
      setLoadingEdit(true);
      setIsEditModalOpen(true);

      const member = staff.find(s => s._id === id);
      if (!member) throw new Error('Staff member not found');

      const isVet = type === 'Veterinarian';

      let vetData = {};
      if (isVet) {
        const vetRes = await api.get(`/vets/${id}`);
        vetData = vetRes.data;
      }

      setEditFormData({
        _id: id,
        staffType: isVet ? 'veterinarian' : 'staff',
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phoneNumber: member.phoneNumber || '',
        status: member.status || 'Active',
        veterinaryId: isVet ? (vetData.veterinaryId || '') : '',
        specialization: isVet ? (vetData.specialization || '') : '',
        accessLevel: isVet ? (vetData.accessLevel || 'Basic') : (member.details?.accessLevel || 'Basic'),
        role: isVet ? '' : (member.details?.role || 'Receptionist'),
        clinicId: isVet ? (vetData.currentActiveClinicId?._id || vetData.currentActiveClinicId || '') : (member.clinicId || ''),
        assignedClinics: isVet ? (vetData.ownedClinics || []) : (member.assignedClinics || (member.clinicId ? [member.clinicId] : []))
      });

    } catch (error) {
      console.error("Error loading edit details", error);
      Swal.fire('Error', 'Failed to load staff details', 'error');
      setIsEditModalOpen(false);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = async () => {
    try {
      setSavingEdit(true);
      const payload = { ...editFormData };
      // Delete internal _id so it's not sent in the body update if not needed (optional)
      const submitPayload = { ...payload };
      delete submitPayload._id;

      if (payload.staffType === 'veterinarian') {
        submitPayload.isEnhanced = payload.accessLevel === 'Enhanced';
        await api.put(`/vets/${payload._id}`, submitPayload);
      } else {
        await api.put(`/clinics/staff/${payload._id}`, submitPayload);
      }

      Swal.fire('Success', 'Staff member updated successfully', 'success');
      setIsEditModalOpen(false);

      // Refresh data
      const response = await api.get('/vets/clinics/staff');
      setStaff(response.data.staff || []);

    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update member', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({ title: `Delete ${name}?`, text: "This is permanent.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });
    if (result.isConfirmed) {
      try {
        const member = staff.find(s => s._id === id);
        const endpoint = member.type === 'Veterinarian' ? `/vets/${id}` : `/clinics/staff/${id}`;
        await api.delete(endpoint);
        setStaff(prev => prev.filter(s => s._id !== id));
        Swal.fire('Deleted!', `${name} has been deleted.`, 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not delete member', 'error');
      }
    }
  };

  const toggleExpandRow = (id) => setExpandedRow(expandedRow === id ? null : id);
  const getStatusColor = (status) => (status === 'Active' ? 'success' : (['Inactive', 'Deactivated'].includes(status) ? 'error' : 'default'));
  const canEditMember = (member) => {
    const userData = JSON.parse(localStorage.getItem('vet_user') || '{}');
    const isRequesterEnhanced = userData.accessLevel === 'Enhanced';

    // Only Enhanced vets can manage staff.
    if (!isRequesterEnhanced) return false;

    // Allow everything if the requester is Enhanced.
    return true;
  };

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
            <HeaderContainer>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>Clinic Staff</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', ml: { md: 'auto' }, width: isMobile ? '100%' : 'auto' }}>
                <SearchField
                  variant="outlined"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                />
                <AddButton
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenAddPopup}
                  size="small"
                  sx={{ width: isMobile ? '100%' : 'auto' }}
                >
                  Add Veterinarian
                </AddButton>
              </Box>
            </HeaderContainer>

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeadCell width="50px"></TableHeadCell>
                    <TableHeadCell>Staff ID</TableHeadCell>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                    <TableHeadCell>Access Level</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell align="center">Actions</TableHeadCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {paginatedStaff.length === 0 ? (
                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}><Typography color="textSecondary">No staff found</Typography></TableCell></TableRow>
                  ) : (
                    paginatedStaff.map((member) => (
                      <React.Fragment key={member._id}>
                        <TableRowStyled>
                          <TableCell><IconButton onClick={() => toggleExpandRow(member._id)} size="small"><ExpandMoreIcon sx={{ transform: expandedRow === member._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} /></IconButton></TableCell>
                          <TableCell><Typography fontWeight="bold" sx={{ color: '#8e24aa', fontFamily: 'monospace' }}>#{getStaffNumber(member._id)}</Typography></TableCell>
                          <TableCell><Typography fontWeight="bold">{member.firstName} {member.lastName}</Typography><Typography variant="caption" color="textSecondary">{member.type}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{member.details?.role || member.type}</Typography></TableCell>
                          <TableCell><AccessChip label={member.details?.accessLevel || 'Basic'} level={member.details?.accessLevel} size="small" /></TableCell>
                          <TableCell><Chip label={member.status || 'Active'} color={getStatusColor(member.status)} variant="outlined" size="small" /></TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              {canEditMember(member) && <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleEdit(member._id, member.type)} size="small"><EditIcon /></IconButton></Tooltip>}
                              {canEditMember(member) && (member.status === 'Active' ? <IconButton color="warning" onClick={() => handleDeactivate(member._id, member.firstName)} size="small"><BlockIcon /></IconButton> : <IconButton color="success" onClick={() => handleActivate(member._id, member.firstName)} size="small"><CheckCircleIcon /></IconButton>)}
                              {canEditMember(member) && <IconButton color="error" onClick={() => handleDelete(member._id, member.firstName)} size="small"><DeleteIcon /></IconButton>}
                            </Box>
                          </TableCell>
                        </TableRowStyled>
                        <TableRow>
                          <TableCell colSpan={7} sx={{ p: 0 }}>
                            <Collapse in={expandedRow === member._id} timeout="auto" unmountOnExit>
                              <DetailsCard>
                                <Grid container spacing={3} sx={{ p: 2 }} alignItems="stretch">
                                  <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'white', border: '1px solid #edf2f7', width: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                      <Typography variant="h6" sx={{ color: '#49149eff', fontWeight: 700, mb: 2, borderBottom: '2px solid #f0f0f0', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon /> Personal Information
                                      </Typography>
                                      <Box sx={{ px: 1, flexGrow: 1 }}>
                                        <InfoRow><EmailIcon /><InfoLabel sx={{ minWidth: 'auto', mr: 1 }}>Email:</InfoLabel><InfoValue>{member.email}</InfoValue></InfoRow>
                                        <InfoRow><PhoneIcon /><InfoLabel sx={{ minWidth: 'auto', mr: 1 }}>Phone:</InfoLabel><InfoValue>{member.phoneNumber || 'Not provided'}</InfoValue></InfoRow>
                                        <InfoRow><BadgeIcon /><InfoLabel sx={{ minWidth: 'auto', mr: 1 }}>Staff ID:</InfoLabel><InfoValue sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#8e24aa' }}>#{getStaffNumber(member._id)}</InfoValue></InfoRow>
                                      </Box>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'white', border: '1px solid #edf2f7', width: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                      <Typography variant="h6" sx={{ color: '#e08c0eff', fontWeight: 700, mb: 2, borderBottom: '2px solid #f0f0f0', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AdminPanelSettingsIcon /> Professional Information
                                      </Typography>
                                      <Box sx={{ px: 1, flexGrow: 1 }}>
                                        <InfoRow>
                                          <BadgeIcon />
                                          <InfoLabel>Role:</InfoLabel>
                                          <InfoValue sx={{ fontWeight: 600 }}>{member.details?.role || member.type}</InfoValue>
                                        </InfoRow>
                                        <InfoRow>
                                          <AdminPanelSettingsIcon />
                                          <InfoLabel>Access Level:</InfoLabel>
                                          <InfoValue>
                                            <AccessChip
                                              label={member.details?.accessLevel || 'Basic'}
                                              level={member.details?.accessLevel}
                                              size="small"
                                            />
                                          </InfoValue>
                                        </InfoRow>

                                        {member.veterinaryId && (
                                          <InfoRow><BadgeIcon /><InfoLabel>License ID:</InfoLabel><InfoValue>{member.veterinaryId}</InfoValue></InfoRow>
                                        )}
                                        {member.specialization && (
                                          <InfoRow><BadgeIcon /><InfoLabel>Specialization:</InfoLabel><InfoValue>{member.specialization}</InfoValue></InfoRow>
                                        )}

                                        {/* Clinic Assignment Information */}
                                        {(member.details?.accessLevel === 'Enhanced' || member.accessLevel === 'Enhanced') ? (
                                          <InfoRow>
                                            <BusinessIcon />
                                            <InfoLabel>Clinics:</InfoLabel>
                                            <InfoValue sx={{ color: '#10b981', fontWeight: 700 }}>System-wide (All Clinics)</InfoValue>
                                          </InfoRow>
                                        ) : (
                                          <InfoRow sx={{ alignItems: 'flex-start' }}>
                                            <BusinessIcon sx={{ mt: 0.5 }} />
                                            <InfoLabel sx={{ mt: 0.5 }}>Assigned Clinics:</InfoLabel>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                              {member.assignedClinics && member.assignedClinics.length > 0
                                                ? member.assignedClinics.map((cid, idx) => {
                                                  const clinicId = cid._id || cid;
                                                  const name = clinics.find(c => c._id === clinicId)?.name;
                                                  return name ? <InfoValue key={idx} sx={{ fontWeight: 600, mb: 0.5 }}>{name}</InfoValue> : null;
                                                })
                                                : <InfoValue color="textSecondary">Initially Unassigned</InfoValue>}
                                            </Box>
                                          </InfoRow>
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
            <TablePagination rowsPerPageOptions={[]} component="div" count={filteredStaff.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(_, p) => setPage(p)} labelRowsPerPage="" />
          </ContentContainer>
        </Box>
      </Box>

      {/* Add Staff Modal */}
      <Dialog
        open={isAddPopupOpen}
        onClose={handleCloseAddPopup}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{
          color: '#1e293b',
          fontWeight: 800,
          pb: 1,
          px: 4,
          pt: 4
        }}>
          Add Veterinarian
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 1, bgcolor: '#fbfcfd' }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Expand your clinic team with skilled veterinarians
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
            {/* Row 1: First Name + Last Name */}
            <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleFormChange} required />
            <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleFormChange} required />

            {/* Row 3: Phone Number + Access Level */}
            <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} error={!!errors.phoneNumber} helperText={errors.phoneNumber} />
            <FormControl fullWidth>
              <InputLabel>Access Level</InputLabel>
              <Select name="accessLevel" value={formData.accessLevel} onChange={handleFormChange} label="Access Level">
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Enhanced">Enhanced</MenuItem>
              </Select>
            </FormControl>

            {/* Row 4: Email + Specialization */}
            <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleFormChange} required error={!!errors.email} helperText={errors.email} />
            <FormControl fullWidth required>
              <InputLabel>Specialization</InputLabel>
              <Select
                name="specialization"
                value={formData.specialization}
                onChange={handleFormChange}
                label="Specialization"
              >
                <MenuItem value="" disabled>Select Specialization</MenuItem>
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Row 4: Password + Confirm Password */}
            <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleFormChange} required />
            <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleFormChange} required error={!!errors.confirmPassword} helperText={errors.confirmPassword} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 0, bgcolor: '#fbfcfd' }}>
          <Button onClick={handleCloseAddPopup} sx={{ color: '#64748b', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddStaffSubmit}
            sx={{
              borderRadius: '8px',
              bgcolor: '#49149e',
              px: 4,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(73, 20, 158, 0.2)',
              '&:hover': { bgcolor: '#3a1080' }
            }}
          >
            Add Veterinarian
          </Button>
        </DialogActions>
      </Dialog>


      {/* Edit Staff Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#8e24aa' }}>
          Edit {editFormData.staffType === 'veterinarian' ? 'Veterinarian' : 'Staff Member'}
        </DialogTitle>
        <DialogContent dividers>
          {loadingEdit ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', mt: 1 }}>
              {/* Row 1 */}
              <TextField fullWidth label="First Name" name="firstName" value={editFormData.firstName} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} required />
              <TextField fullWidth label="Last Name" name="lastName" value={editFormData.lastName} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} required />

              {/* Row 2 */}
              <TextField fullWidth type="email" label="Email Address" name="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required />
              <TextField fullWidth label="Phone Number" name="phoneNumber" value={editFormData.phoneNumber} onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })} />

              {/* Row 3: Access Level + Role or Vet ID */}
              <FormControl fullWidth>
                <InputLabel>Access Level</InputLabel>
                <Select name="accessLevel" value={editFormData.accessLevel || 'Basic'} onChange={(e) => setEditFormData({ ...editFormData, accessLevel: e.target.value })} label="Access Level">
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Enhanced">Enhanced</MenuItem>
                </Select>
              </FormControl>

              {editFormData.staffType === 'veterinarian' ? (
                <TextField fullWidth label="Veterinary Registration ID" name="veterinaryId" value={editFormData.veterinaryId} onChange={(e) => setEditFormData({ ...editFormData, veterinaryId: e.target.value })} required />
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select name="role" value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })} label="Role">
                    <MenuItem value="Receptionist">Receptionist</MenuItem>
                    <MenuItem value="Assistant">Assistant</MenuItem>
                    <MenuItem value="Vet Tech">Vet Tech</MenuItem>
                    <MenuItem value="Nurse">Nurse</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Kennel Staff">Kennel Staff</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* Row 4: Full-width — Specialization (vet) or Assigned Clinics (staff Basic) */}
              {editFormData.staffType === 'veterinarian' && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <FormControl fullWidth>
                    <InputLabel>Specialization</InputLabel>
                    <Select
                      name="specialization"
                      value={editFormData.specialization || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                      label="Specialization"
                    >
                      <MenuItem value="" disabled>Select Specialization</MenuItem>
                      {specializations.map((spec) => (
                        <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              {editFormData.staffType !== 'veterinarian' && editFormData.accessLevel === 'Basic' && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned Clinics</InputLabel>
                    <Select
                      multiple
                      name="assignedClinics"
                      value={editFormData.assignedClinics || []}
                      onChange={(e) => setEditFormData({ ...editFormData, assignedClinics: e.target.value })}
                      label="Assigned Clinics"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={clinics.find(c => c._id === value)?.name || value}
                              onDelete={(e) => { e.stopPropagation(); setEditFormData({ ...editFormData, assignedClinics: editFormData.assignedClinics.filter(id => id !== value) }); }}
                              onMouseDown={(e) => { e.stopPropagation(); }} size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {clinics.map(clinic => (
                        <MenuItem key={clinic._id} value={clinic._id}>{clinic.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>
          )}


        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEdit} color="inherit" disabled={savingEdit}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={loadingEdit || savingEdit}>
            {savingEdit ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClinicStaff;