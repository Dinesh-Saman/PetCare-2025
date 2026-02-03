// src/pages/vet/ClinicStaff.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Button, Tooltip, TextField, Grid, Card, CardContent,
  CardHeader, Avatar, Collapse, InputAdornment, TablePagination
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

// Custom Pagination Component
const CustomPagination = ({ count, page, rowsPerPage, onPageChange }) => {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      rowsPerPageOptions={[]} // Remove rows per page options
      labelRowsPerPage=""
      sx={{
        '& .MuiTablePagination-toolbar': {
          padding: '16px 0',
        },
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          marginBottom: 0,
        }
      }}
    />
  );
};

const ClinicStaff = () => {
  const [staff, setStaff] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10); // Fixed rows per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinicStaff = async () => {
      try {
        console.log('Fetching staff from /vets/clinics/staff');
        const response = await api.get('/vets/clinics/staff');
        console.log('API Response:', response.data);
        
        const staffList = response.data.staff || [];
        const clinicsList = response.data.clinics || [];
        
        console.log('Staff list after processing:', staffList);
        console.log('Clinics list:', clinicsList);
        
        setStaff(staffList);
        setClinics(clinicsList);
      } catch (error) {
        console.error('Error fetching staff:', error);
        console.error('Error response:', error.response?.data);
        Swal.fire('Error', 'Could not load clinic staff', 'error');
        setStaff([]);
        setClinics([]);
      }
    };

    fetchClinicStaff();
  }, []);

  // Function to get staff number (last 6 digits of object ID)
  const getStaffNumber = (id) => {
    if (!id) return 'N/A';
    // Take last 6 characters of the ID
    return id.slice(-6).toUpperCase();
  };

  // Function to get clinic name
const getClinicName = (member) => {
  const isPrimary = member.isPrimary || member.details?.isPrimary || false;

  if (isPrimary) {
    if (typeof member.clinic === 'string' && clinics.length > 0) {
      const found = clinics.find(c => c._id === member.clinic);
      return found?.name || 'Primary (clinic ID not matched)';
    }
    if (member.clinic?.name) {
      return member.clinic.name;
    }
    return 'Primary Veterinarian';
  }

  // Non-primary vets & staff
  if (member.clinic?.name) {
    return member.clinic.name;
  }

  // Fallback: try matching currentActiveClinicId against clinics list
  if (member.currentActiveClinicId && clinics.length > 0) {
    const found = clinics.find(c => c._id === member.currentActiveClinicId);
    return found?.name || 'Unassigned';
  }

  return 'Unassigned';
};

  // Filter staff based on search query
  const filteredStaff = staff.filter((member) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const staffNumber = getStaffNumber(member._id).toLowerCase();
    const email = (member.email || '').toLowerCase();
    const phone = (member.phoneNumber || '').toLowerCase();
    
    return (
      fullName.includes(query) ||
      staffNumber.includes(query) ||
      email.includes(query) ||
      phone.includes(query)
    );
  });

  // Get paginated staff
  const paginatedStaff = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeactivate = async (id, name) => {
    const result = await Swal.fire({
      title: `Deactivate ${name}?`,
      text: "This member will no longer have access to the system",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const member = staff.find(s => s._id === id);
        let endpoint;
        
        if (member.type === 'Veterinarian') {
          endpoint = `/vets/${id}/deactivate`;
        } else {
          endpoint = `/clinics/staff/${id}/deactivate`;
        }
        
        console.log('Deactivating via endpoint:', endpoint);
        await api.patch(endpoint);
        
        setStaff(prev => prev.map(s => 
          s._id === id ? { ...s, status: 'Inactive' } : s
        ));
        
        Swal.fire('Deactivated!', `${name} has been deactivated.`, 'success');
      } catch (error) {
        console.error('Error deactivating:', error);
        console.error('Error response:', error.response?.data);
        Swal.fire('Error!', error.response?.data?.message || 'Could not deactivate member', 'error');
      }
    }
  };

  const handleActivate = async (id, name) => {
    const result = await Swal.fire({
      title: `Activate ${name}?`,
      text: "This member will regain access to the system",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, activate',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const member = staff.find(s => s._id === id);
        let endpoint;
        
        if (member.type === 'Veterinarian') {
          endpoint = `/vets/${id}/activate`;
        } else {
          endpoint = `/clinics/staff/${id}/activate`;
        }
        
        console.log('Activating via endpoint:', endpoint);
        await api.patch(endpoint);
        
        setStaff(prev => prev.map(s => 
          s._id === id ? { ...s, status: 'Active' } : s
        ));
        
        Swal.fire('Activated!', `${name} has been activated.`, 'success');
      } catch (error) {
        console.error('Error activating:', error);
        console.error('Error response:', error.response?.data);
        Swal.fire('Error!', error.response?.data?.message || 'Could not activate member', 'error');
      }
    }
  };

  const handleEdit = (id, type) => {
    if (type === 'Veterinarian') {
      navigate(`/vet/edit-vet/${id}`);
    } else {
      navigate(`/vet/edit-staff/${id}`);
    }
  };

  const handleDelete = async (id, name) => {
    console.log('=== FRONTEND DELETE DEBUG ===');
    console.log('Delete called for ID:', id);
    console.log('Name:', name);
    
    const member = staff.find(s => s._id === id);
    console.log('Member found:', member);
    console.log('Member type:', member?.type);
    
    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This will permanently remove them from the system. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        let endpoint;
        
        if (member.type === 'Veterinarian') {
          endpoint = `/vets/${id}`;
          console.log('Calling vet delete endpoint:', endpoint);
        } else {
          endpoint = `/vets/clinic-staff/${id}`;
          console.log('Calling clinic staff delete endpoint:', endpoint);
        }
        
        const response = await api.delete(endpoint);
        console.log('Delete response:', response.data);
        
        setStaff(prev => prev.filter(s => s._id !== id));
        Swal.fire('Deleted!', `${name} has been permanently deleted.`, 'success');
      } catch (error) {
        console.error('Delete error details:');
        console.error('Error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        Swal.fire(
          'Error!', 
          error.response?.data?.message || 'Could not delete member', 
          'error'
        );
      }
    }
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
      case 'Deactivated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Active':
        return 'Active';
      case 'Inactive':
      case 'Deactivated':
        return 'Inactive';
      default:
        return status || 'Active';
    }
  };

  const canEditMember = (member) => {
    return !member.details?.isPrimary;
  };

  const canDeleteMember = (member) => {
    return !member.details?.isPrimary;
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ContentContainer>
          <HeaderContainer>
            <PageTitle variant="h4">
              Clinic Staff
            </PageTitle>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>
              <SearchContainer>
                <SearchField
                  variant="outlined"
                  placeholder="Search by name, staff number, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </SearchContainer>
              
              <AddButton
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/vet/add-new-staff')}
              >
                Add New Staff
              </AddButton>
            </Box>
          </HeaderContainer>

          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeadCell width="50px"></TableHeadCell>
                  <TableHeadCell width="120px">Staff No.</TableHeadCell>
                  <TableHeadCell>Staff Member</TableHeadCell>
                  <TableHeadCell>Role / Specialization</TableHeadCell>
                  <TableHeadCell>Access Level</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell align="center">Actions</TableHeadCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {paginatedStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <AdminPanelSettingsIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        No staff members found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {searchQuery ? 'Try a different search term' : 'Click "Add New Staff" to invite your team'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStaff.map((member) => {
                    const isActive = member.status === 'Active';
                    const canEdit = canEditMember(member);
                    const canDelete = canDeleteMember(member);
                    const staffNumber = getStaffNumber(member._id);
                    
                    return (
                      <React.Fragment key={member._id}>
                        <TableRowStyled 
                          sx={{ 
                            opacity: isActive ? 1 : 0.85,
                            backgroundColor: isActive ? '#f9f9f9' : '#f5f5f5'
                          }}
                        >
                          <TableCell>
                            <IconButton onClick={() => toggleExpandRow(member._id)} size="small">
                              <ExpandMoreIcon
                                sx={{
                                  transform: expandedRow === member._id ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: '0.3s',
                                }}
                              />
                            </IconButton>
                          </TableCell>
                          
                          <TableCell>
                            <Typography 
                              fontWeight="bold" 
                              sx={{ 
                                color: '#8e24aa',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem'
                              }}
                            >
                              #{staffNumber}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography fontWeight="bold">
                                {member.type === 'Veterinarian' ? 'Dr.' : ''} {member.firstName} {member.lastName}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {member.type}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            {member.type === 'Veterinarian' ? (
                              <>
                                <Typography fontWeight="bold">
                                  {member.details?.licenseId || member.veterinaryId || '—'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {member.details?.specialization || member.specialization || 'General Practice'}
                                </Typography>
                              </>
                            ) : (
                              <Typography fontWeight="bold">
                                {member.details?.role || 'Staff Member'}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <AccessChip
                              label={member.details?.accessLevel || member.accessLevel || 'Basic'}
                              level={member.details?.accessLevel || member.accessLevel || 'Basic'}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={getStatusLabel(member.status)}
                              color={getStatusColor(member.status)}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              {canEdit && (
                                <Tooltip title="Edit">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleEdit(member._id, member.type)}
                                    size="small"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {canEdit && isActive ? (
                                <Tooltip title="Deactivate">
                                  <IconButton
                                    color="warning"
                                    onClick={() => handleDeactivate(member._id, `${member.firstName} ${member.lastName}`)}
                                    size="small"
                                  >
                                    <BlockIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : canEdit && !isActive ? (
                                <Tooltip title="Activate">
                                  <IconButton
                                    color="success"
                                    onClick={() => handleActivate(member._id, `${member.firstName} ${member.lastName}`)}
                                    size="small"
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : null}

                              {canDelete && (
                                <Tooltip title="Delete Permanently">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDelete(member._id, `${member.firstName} ${member.lastName}`)}
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRowStyled>

                        {/* Expanded Details Row */}
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                            <Collapse in={expandedRow === member._id} timeout="auto" unmountOnExit>
                              <DetailsCard>
                                <Grid container spacing={3}>
                                  {/* Personal Information */}
                                  <Grid item xs={12} md={6}>
                                    <CardHeaderStyled 
                                      bgcolor="#4caf50" 
                                      title="Personal Information" 
                                      avatar={<PersonIcon />} 
                                    />
                                    <CardContent>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <StaffAvatar sx={{ width: 80, height: 80, mr: 3 }}>
                                          {member.firstName?.charAt(0).toUpperCase() || 'S'}
                                        </StaffAvatar>
                                        <Box>
                                          <Typography variant="h6">
                                            {member.type === 'Veterinarian' ? 'Dr.' : ''} {member.firstName} {member.lastName}
                                          </Typography>
                                          <Typography color="textSecondary">
                                            {member.type}
                                            {member.details?.isPrimary && ' • Primary Veterinarian'}
                                          </Typography>
                                          <Chip 
                                            label={`Staff #${staffNumber}`} 
                                            size="small" 
                                            sx={{ mt: 1 }}
                                            icon={<BadgeIcon />}
                                          />
                                        </Box>
                                      </Box>
                                      
                                      <InfoRow>
                                        <EmailIcon />
                                        <InfoLabel>Email:</InfoLabel>
                                        <InfoValue>{member.email || 'N/A'}</InfoValue>
                                      </InfoRow>
                                      
                                      <InfoRow>
                                        <PhoneIcon />
                                        <InfoLabel>Phone:</InfoLabel>
                                        <InfoValue>{member.phoneNumber || 'N/A'}</InfoValue>
                                      </InfoRow>
                                      
                                      <InfoRow>
                                        <CalendarTodayIcon />
                                        <InfoLabel>Status:</InfoLabel>
                                        <InfoValue>
                                          <Chip
                                            label={getStatusLabel(member.status)}
                                            color={getStatusColor(member.status)}
                                            size="small"
                                          />
                                        </InfoValue>
                                      </InfoRow>
                                    </CardContent>
                                  </Grid>

                                  {/* Professional Information */}
                                  <Grid item xs={12} md={6}>
                                    <CardHeaderStyled 
                                      bgcolor="#2196f3" 
                                      title="Professional Information" 
                                      avatar={<BadgeIcon />} 
                                    />
                                    <CardContent>
                                      {member.type === 'Veterinarian' ? (
                                        <>
                                          <InfoRow>
                                            <AccessTimeIcon />
                                            <InfoLabel>License ID:</InfoLabel>
                                            <InfoValue>{member.details?.licenseId || 'N/A'}</InfoValue>
                                          </InfoRow>
                                          
                                          <InfoRow>
                                            <AccessTimeIcon />
                                            <InfoLabel>Specialization:</InfoLabel>
                                            <InfoValue>{member.details?.specialization || 'General Practice'}</InfoValue>
                                          </InfoRow>
                                          
                                          <InfoRow>
                                            <AccessTimeIcon />
                                            <InfoLabel>Role:</InfoLabel>
                                            <InfoValue>{member.details?.role || 'Veterinarian'}</InfoValue>
                                          </InfoRow>
                                        </>
                                      ) : (
                                        <>
                                          <InfoRow>
                                            <AccessTimeIcon />
                                            <InfoLabel>Role:</InfoLabel>
                                            <InfoValue>{member.details?.role || 'Staff Member'}</InfoValue>
                                          </InfoRow>
                                        </>
                                      )}
                                      
                                      <InfoRow>
                                        <AccessTimeIcon />
                                        <InfoLabel>Access Level:</InfoLabel>
                                        <InfoValue>
                                          <AccessChip
                                            label={member.details?.accessLevel || 'Basic'}
                                            level={member.details?.accessLevel}
                                            size="small"
                                          />
                                        </InfoValue>
                                      </InfoRow>
                                    </CardContent>
                                  </Grid>

                                  {/* Clinic Information */}
                                  <Grid item xs={12}>
                                    <CardHeaderStyled 
                                      bgcolor="#9c27b0" 
                                      title="Clinic Information" 
                                      avatar={<BusinessIcon />} 
                                    />
                                    <CardContent>
                                      <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                          <InfoRow>
                                            <LocationOnIcon />
                                            <InfoLabel>Current Clinic:</InfoLabel>
                                            <InfoValue>{getClinicName(member)}</InfoValue>
                                          </InfoRow>
                                          
                                          {member.clinic && member.clinic.address && (
                                            <InfoRow>
                                              <LocationOnIcon />
                                              <InfoLabel>Clinic Address:</InfoLabel>
                                              <InfoValue>{member.clinic.address}</InfoValue>
                                            </InfoRow>
                                          )}
                                          
                                          {member.clinic && member.clinic.phoneNumber && (
                                            <InfoRow>
                                              <PhoneIcon />
                                              <InfoLabel>Clinic Phone:</InfoLabel>
                                              <InfoValue>{member.clinic.phoneNumber}</InfoValue>
                                            </InfoRow>
                                          )}
                                        </Grid>
                                        
                                        {/* Additional Information for Primary Vet */}
                                        {member.details?.isPrimary && clinics && clinics.length > 0 && (
                                          <Grid item xs={12} md={6}>
                                            <InfoRow>
                                              <BusinessIcon />
                                              <InfoLabel>Managed Clinics:</InfoLabel>
                                              <InfoValue>
                                                <Box>
                                                  {clinics.map((clinic, index) => (
                                                    <Chip 
                                                      key={clinic._id}
                                                      label={clinic.name}
                                                      size="small"
                                                      sx={{ m: 0.5 }}
                                                      color="primary"
                                                      variant="outlined"
                                                    />
                                                  ))}
                                                </Box>
                                              </InfoValue>
                                            </InfoRow>
                                            <InfoRow>
                                              <InfoLabel>Total Clinics:</InfoLabel>
                                              <InfoValue>{clinics.length} clinic{clinics.length !== 1 ? 's' : ''}</InfoValue>
                                            </InfoRow>
                                          </Grid>
                                        )}
                                      </Grid>
                                    </CardContent>
                                  </Grid>
                                </Grid>
                              </DetailsCard>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredStaff.length > 0 && (
            <CustomPagination
              count={filteredStaff.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
            />
          )}

          {/* Status Summary */}
          {filteredStaff.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Showing {paginatedStaff.length} of {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
                {filteredStaff.some(s => s.status !== 'Active') && (
                  <span>
                    {' '}({filteredStaff.filter(s => s.status === 'Active').length} active, 
                    {filteredStaff.filter(s => s.status !== 'Active').length} inactive)
                  </span>
                )}
              </Typography>
              
              {/* Status Legend */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                  <Typography variant="caption">Active</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
                  <Typography variant="caption">Inactive</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default ClinicStaff;