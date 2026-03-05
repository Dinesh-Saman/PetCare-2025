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

// Styled Components
const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 12,
  boxShadow: '0px 0px 15px rgba(0,0,0,0.1)',
  flex: 1,
  margin: '20px',
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  color: '#49149eff',
  textAlign: 'center',
  marginBottom: 40,
  fontSize: '2.6rem',
  letterSpacing: '1px',
}));

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
    level === 'Primary' ? '#d32f2f' :
      level === 'Full Access' ? '#1976d2' :
        level === 'Admin' ? '#7b1fa2' :
          level === 'Moderate' ? '#f57c00' :
            '#43a047',
}));

const AddButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: 30,
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: '0 6px 20px rgba(142, 36, 170, 0.3)',
  '&:hover': {
    background: 'linear-gradient(90deg, #7b1fa2, #9c27b0)',
    transform: 'translateY(-2px)',
  },
}));

const StaffAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: '#8e24aa',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  border: '3px solid white',
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
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
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
    const isPrimary = member.isPrimary || member.details?.isPrimary || false;
    if (isPrimary) {
      if (typeof member.clinic === 'string' && clinics.length > 0) {
        return clinics.find(c => c._id === member.clinic)?.name || 'Primary';
      }
      return member.clinic?.name || 'Primary Veterinarian';
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
    clinicId: '',
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
        accessLevel: isVet ? (vetData.accessLevel || 'Normal Access') : (member.details?.accessLevel || 'Basic'),
        role: isVet ? '' : (member.details?.role || 'Receptionist'),
        clinicId: isVet ? (vetData.currentActiveClinicId?._id || vetData.currentActiveClinicId || '') : (member.currentActiveClinicId || member.clinicId || '')
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
        submitPayload.isPrimary = payload.accessLevel === 'Primary';
        await api.put(`/vets/${payload._id}`, submitPayload);
      } else {
        await api.put(`/vets/clinic-staff/${payload._id}`, submitPayload);
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
        const endpoint = member.type === 'Veterinarian' ? `/vets/${id}` : `/vets/clinic-staff/${id}`;
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
  const canEditMember = (member) => !member.details?.isPrimary;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
          <ContentContainer>
            <HeaderContainer>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#49149eff', fontFamily: 'Georgia, serif' }}>Clinic Staff</Typography>
              <Box sx={{ display: 'flex', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                <SearchField
                  variant="outlined"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                />
                <AddButton startIcon={<PersonAddIcon />} onClick={() => navigate('/vet/add-new-staff')} size="small">Add Staff</AddButton>
              </Box>
            </HeaderContainer>

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeadCell width="50px"></TableHeadCell>
                    <TableHeadCell>Staff No.</TableHeadCell>
                    <TableHeadCell>Member</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                    <TableHeadCell>Access</TableHeadCell>
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
                                <Grid container spacing={3} sx={{ p: 2 }}>
                                  <Grid item xs={12} md={6}>
                                    <CardHeaderStyled bgcolor="#4caf50" title="Information" icon={<PersonIcon />} />
                                    <CardContent>
                                      <InfoRow><EmailIcon /><InfoLabel>Email:</InfoLabel><InfoValue>{member.email}</InfoValue></InfoRow>
                                      <InfoRow><PhoneIcon /><InfoLabel>Phone:</InfoLabel><InfoValue>{member.phoneNumber}</InfoValue></InfoRow>
                                    </CardContent>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <CardHeaderStyled bgcolor="#2196f3" title="Professional" icon={<BadgeIcon />} />
                                    <CardContent>
                                      <InfoRow><BusinessIcon /><InfoLabel>Clinic:</InfoLabel><InfoValue>{getClinicName(member)}</InfoValue></InfoRow>
                                    </CardContent>
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

      {/* Edit Staff Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#8e24aa' }}>
          Edit {editFormData.staffType === 'veterinarian' ? 'Veterinarian' : 'Staff Member'}
        </DialogTitle>
        <DialogContent dividers>
          {loadingEdit ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name" name="firstName" value={editFormData.firstName} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" name="lastName" value={editFormData.lastName} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="email" label="Email Address" name="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" name="phoneNumber" value={editFormData.phoneNumber} onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Assigned Clinic</InputLabel>
                  <Select name="clinicId" value={editFormData.clinicId || ''} onChange={(e) => setEditFormData({ ...editFormData, clinicId: e.target.value })} label="Assigned Clinic">
                    {clinics.map(clinic => (
                      <MenuItem key={clinic._id} value={clinic._id}>{clinic.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {editFormData.staffType === 'veterinarian' ? (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Veterinary Registration ID" name="veterinaryId" value={editFormData.veterinaryId} onChange={(e) => setEditFormData({ ...editFormData, veterinaryId: e.target.value })} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Specialization" name="specialization" value={editFormData.specialization} onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Access Level</InputLabel>
                      <Select name="accessLevel" value={editFormData.accessLevel} onChange={(e) => setEditFormData({ ...editFormData, accessLevel: e.target.value })} label="Access Level">
                        <MenuItem value="Normal Access">Normal Access</MenuItem>
                        <MenuItem value="Full Access">Full Access</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select name="role" value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })} label="Role">
                        <MenuItem value="Receptionist">Receptionist</MenuItem>
                        <MenuItem value="Assistant">Assistant</MenuItem>
                        <MenuItem value="Technician">Technician</MenuItem>
                        <MenuItem value="Manager">Manager</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Access Level</InputLabel>
                      <Select name="accessLevel" value={editFormData.accessLevel} onChange={(e) => setEditFormData({ ...editFormData, accessLevel: e.target.value })} label="Access Level">
                        <MenuItem value="Basic">Basic (Appointments only)</MenuItem>
                        <MenuItem value="Moderate">Moderate (Appts + Pets)</MenuItem>
                        <MenuItem value="Full Access">Full Access (All features)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
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