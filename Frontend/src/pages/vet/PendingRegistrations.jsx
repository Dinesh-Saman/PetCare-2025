// src/pages/vet/PendingRegistrations.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  TablePagination,
  Button,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ScaleIcon from '@mui/icons-material/Scale';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClinicIcon from '@mui/icons-material/LocalHospital';
import ErrorIcon from '@mui/icons-material/Error';

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 16,
  boxShadow: '0px 8px 30px rgba(0,0,0,0.08)',
  maxWidth: '1400px',
  padding: theme.spacing(3),
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  flexWrap: 'wrap',
  gap: theme.spacing(3),
}));

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#f5f0ff !important',
  },
  cursor: 'pointer',
}));

const TableHeadCell = styled(TableCell)({
  backgroundColor: '#8e24aa',
  color: 'white',
  fontWeight: 'bold',
});

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  border: '3px solid white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#ff9800',
  color: 'white',
  fontWeight: 'bold',
}));

const ClinicBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: '#4caf50',
  color: 'white',
  fontWeight: 'bold',
  marginLeft: theme.spacing(1),
}));

const DetailsCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 16,
  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(2, 0),
  '& svg': {
    marginRight: 16,
    color: '#8e24aa',
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

const PendingRegistrations = () => {
  const [pendingPets, setPendingPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('petName');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const [clinicInfo, setClinicInfo] = useState(null);
  const [error, setError] = useState(null);

const fetchPendingRegistrations = async () => {
  try {
    setLoading(true);
    setError(null);
    // Get token
    const token = localStorage.getItem('vet_token');
    if (!token) {
      console.log('No token found');
      Swal.fire('Error', 'Please log in again.', 'error');
      window.location.href = '/login';
      return;
    }

    // Set auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // STEP 1: First test the simple endpoint
    console.log('Step 1: Testing /pets/test-simple');
    try {
      const testResponse = await api.get('/pets/test-simple');
      console.log('Test endpoint response:', testResponse.data);
      
      if (testResponse.data.success) {
        console.log('✓ Test passed! Vet clinicId:', testResponse.data.vet.clinicId);
        console.log('✓ Clinic:', testResponse.data.clinic?.name);
      }
    } catch (testErr) {
      console.error('Test endpoint failed:', testErr.response?.data || testErr.message);
      setError('Test endpoint failed. Please check backend logs.');
      setLoading(false);
      return;
    }

    // STEP 2: Now try the actual endpoint
    console.log('Step 2: Trying /pets/clinic/pending');
    try {
      const response = await api.get('/pets/clinic/pending');
      console.log('Main endpoint response:', response.data);
      
      if (response.data.success) {
        const petsData = response.data.pendingPets || [];
        console.log(`✓ Success! Found ${petsData.length} pending pets`);
        
        setPendingPets(petsData);
        setFilteredPets(petsData);
        setClinicInfo(response.data.clinicInfo || null);
      } else {
        setError(response.data.message || 'Request failed');
        setPendingPets([]);
        setFilteredPets([]);
      }
      
    } catch (apiErr) {
      console.error('Main endpoint failed:');
      console.error('Status:', apiErr.response?.status);
      console.error('Data:', apiErr.response?.data);
      console.error('Message:', apiErr.message);
      
      let msg = 'Failed to load pending registrations';
      if (apiErr.response?.status === 401) {
        msg = 'Session expired. Please log in again.';
        localStorage.removeItem('vet_token');
        localStorage.removeItem('vet_user');
        setTimeout(() => window.location.href = '/login', 1500);
      } else if (apiErr.response?.data?.message) {
        msg = apiErr.response.data.message;
      }
      
      setError(msg);
      setPendingPets([]);
      setFilteredPets([]);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    setError('An unexpected error occurred. Please try again.');
    setPendingPets([]);
    setFilteredPets([]);
  } finally {
    setLoading(false);
    console.log('=== FETCH COMPLETE ===');
  }
};

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPets(pendingPets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = pendingPets.filter(pet => {
      switch (searchCriteria) {
        case 'petName':
          return pet.name?.toLowerCase().includes(query);
        case 'ownerName':
          const ownerName = `${pet.ownerId?.firstName || ''} ${pet.ownerId?.lastName || ''}`.toLowerCase();
          return ownerName.includes(query);
        case 'species':
          return pet.species?.toLowerCase().includes(query);
        case 'breed':
          return pet.breed?.toLowerCase().includes(query);
        case 'microchip':
          return pet.microchipNumber?.toLowerCase().includes(query);
        default:
          return true;
      }
    });

    setFilteredPets(filtered);
  }, [searchQuery, searchCriteria, pendingPets]);

  const handleApprove = async (petId) => {
    const result = await Swal.fire({
      title: 'Approve Registration?',
      text: 'This pet will be officially registered with your clinic.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/pets/${petId}/approve`);
        // Update local state
        const updatedPets = pendingPets.filter(p => p._id !== petId);
        setPendingPets(updatedPets);
        setFilteredPets(updatedPets);
        
        Swal.fire({
          title: 'Approved!',
          text: 'Pet has been registered successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Error approving pet:', err);
        Swal.fire('Error', 'Could not approve registration. Please try again.', 'error');
      }
    }
  };

const handleReject = async (petId) => {
  const result = await Swal.fire({
    title: 'Reject Registration?',
    text: 'This pet registration request will be rejected.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#666',
    confirmButtonText: 'Yes, Reject',
    cancelButtonText: 'Cancel',
    background: '#ffffff',
    color: '#333'
  });

  if (result.isConfirmed) {
    try {
      // Reject with a default reason
      await api.patch(`/pets/${petId}/reject`, { reason: 'Registration rejected by veterinarian' });
      
      // Update local state
      const updatedPets = pendingPets.filter(p => p._id !== petId);
      setPendingPets(updatedPets);
      setFilteredPets(updatedPets);
      
      Swal.fire({
        title: 'Rejected!',
        text: 'Registration request has been rejected.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        color: '#333'
      });
    } catch (err) {
      console.error('Error rejecting pet:', err);
      Swal.fire('Error', 'Could not reject registration. Please try again.', 'error');
    }
  }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedPets = filteredPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <ContentContainer>
          <SearchSection>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#8e24aa', fontFamily: 'Georgia, serif', mb: 1 }}>
                Pending Pet Registrations
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Search By</InputLabel>
                <Select 
                  value={searchCriteria} 
                  onChange={(e) => setSearchCriteria(e.target.value)} 
                  label="Search By"
                  size="small"
                >
                  <MenuItem value="petName">Pet Name</MenuItem>
                  <MenuItem value="ownerName">Owner Name</MenuItem>
                  <MenuItem value="species">Species</MenuItem>
                  <MenuItem value="breed">Breed</MenuItem>
                  <MenuItem value="microchip">Microchip</MenuItem>
                </Select>
              </FormControl>

              <TextField
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                sx={{ width: 300 }}
                size="small"
              />

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchPendingRegistrations}
                sx={{ height: 40 }}
              >
                Refresh
              </Button>
            </Box>
          </SearchSection>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={fetchPendingRegistrations}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {!error && pendingPets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <PetsIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
              <Typography variant="h5" color="textSecondary" gutterBottom>
                No Pending Registrations
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                All registration requests have been processed.
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                New registration requests will appear here when submitted by pet owners.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={fetchPendingRegistrations}
                sx={{ mt: 3 }}
              >
                Check Again
              </Button>
            </Box>
          ) : !error && (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    Showing {filteredPets.length} pending registration{filteredPets.length !== 1 ? 's' : ''}
                  </Typography>
                  {clinicInfo && (
                    <ClinicBadge 
                      icon={<ClinicIcon />} 
                      label={clinicInfo.name}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
                {filteredPets.length !== pendingPets.length && (
                  <Typography variant="body2" color="textSecondary">
                    ({pendingPets.length} total)
                  </Typography>
                )}
              </Box>
              
              <TableContainer component={Paper} elevation={6} sx={{ mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeadCell></TableHeadCell>
                      <TableHeadCell>Pet</TableHeadCell>
                      <TableHeadCell>Owner</TableHeadCell>
                      <TableHeadCell>Species & Breed</TableHeadCell>
                      <TableHeadCell>Age & Gender</TableHeadCell>
                      <TableHeadCell>Status</TableHeadCell>
                      <TableHeadCell align="center">Actions</TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPets.map((pet) => (
                      <React.Fragment key={pet._id}>
                        <TableRowStyled onClick={() => handleExpandRow(pet._id)}>
                          <TableCell>
                            <IconButton size="small">
                              <ExpandMoreIcon
                                sx={{
                                  transform: expandedRow === pet._id ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: '0.3s'
                                }}
                              />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <PetAvatar src={pet.photo} alt={pet.name}>
                                {pet.name?.[0]?.toUpperCase() || 'P'}
                              </PetAvatar>
                              <Box>
                                <Typography fontWeight="bold">{pet.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {pet.microchipNumber ? `Microchip: ${pet.microchipNumber}` : 'No microchip'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {pet.ownerId?.email || 'No email'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">{pet.species}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {pet.breed || 'Not specified'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {pet.gender === 'Male' ? <MaleIcon color="primary" /> : pet.gender === 'Female' ? <FemaleIcon color="secondary" /> : null}
                              <Typography>
                                {calculateAge(pet.dateOfBirth)} • {pet.gender || 'Unknown'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusChip label="Pending" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              color="success" 
                              onClick={(e) => { e.stopPropagation(); handleApprove(pet._id); }}
                              title="Approve Registration"
                              size="small"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={(e) => { e.stopPropagation(); handleReject(pet._id); }}
                              title="Reject Registration"
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          </TableCell>
                        </TableRowStyled>

                        <TableRow>
                          <TableCell colSpan={7} sx={{ p: 0 }}>
                            <Collapse in={expandedRow === pet._id} timeout="auto" unmountOnExit>
                              <DetailsCard>
                                <Grid container spacing={4} sx={{ p: 4 }}>
                                  <Grid item xs={12} md={6}>
                                    <CardHeader 
                                      title="Pet Details" 
                                      sx={{ 
                                        bgcolor: '#4caf50', 
                                        color: 'white',
                                        borderRadius: '12px 12px 0 0'
                                      }} 
                                    />
                                    <CardContent>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                        <PetAvatar src={pet.photo} sx={{ width: 120, height: 120, mr: 4 }} />
                                        <Box>
                                          <Typography variant="h5" gutterBottom>{pet.name}</Typography>
                                          <Typography variant="body1" gutterBottom>
                                            {pet.species} • {pet.breed || 'Mixed'}
                                          </Typography>
                                          {pet.microchipNumber && (
                                            <Typography variant="body2" color="textSecondary">
                                              Microchip: {pet.microchipNumber}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                      <InfoRow>
                                        <CalendarTodayIcon />
                                        <InfoLabel>Date of Birth:</InfoLabel>
                                        <InfoValue>
                                          {formatDate(pet.dateOfBirth)}
                                          {pet.dateOfBirth && ` (${calculateAge(pet.dateOfBirth)})`}
                                        </InfoValue>
                                      </InfoRow>
                                      <InfoRow>
                                        <ScaleIcon />
                                        <InfoLabel>Weight:</InfoLabel>
                                        <InfoValue>{pet.weight ? `${pet.weight} kg` : 'Not recorded'}</InfoValue>
                                      </InfoRow>
                                      <InfoRow>
                                        <ColorLensIcon />
                                        <InfoLabel>Color:</InfoLabel>
                                        <InfoValue>{pet.color || 'Not specified'}</InfoValue>
                                      </InfoRow>
                                    </CardContent>
                                  </Grid>

                                  <Grid item xs={12} md={6}>
                                    <CardHeader 
                                      title="Owner Information" 
                                      sx={{ 
                                        bgcolor: '#2196f3', 
                                        color: 'white',
                                        borderRadius: '12px 12px 0 0'
                                      }} 
                                    />
                                    <CardContent>
                                      <InfoRow>
                                        <PersonIcon />
                                        <InfoLabel>Name:</InfoLabel>
                                        <InfoValue>{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</InfoValue>
                                      </InfoRow>
                                      <InfoRow>
                                        <PhoneIcon />
                                        <InfoLabel>Phone:</InfoLabel>
                                        <InfoValue>{pet.ownerId?.phoneNumber || 'N/A'}</InfoValue>
                                      </InfoRow>
                                      <InfoRow>
                                        <LocationOnIcon />
                                        <InfoLabel>Email:</InfoLabel>
                                        <InfoValue>{pet.ownerId?.email || 'N/A'}</InfoValue>
                                      </InfoRow>
                                    </CardContent>
                                  </Grid>

                                  <Grid item xs={12}>
                                    <CardHeader 
                                      title="Additional Information" 
                                      sx={{ 
                                        bgcolor: '#9c27b0', 
                                        color: 'white',
                                        borderRadius: '12px 12px 0 0'
                                      }} 
                                    />
                                    <CardContent>
                                      <Typography variant="h6" gutterBottom>Owner Notes:</Typography>
                                      <Typography paragraph>
                                        {pet.notes || 'No additional notes provided by the owner.'}
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mt: 3 }}>
                                        <Box>
                                          <Typography variant="body2" color="textSecondary" gutterBottom>
                                            Registration Requested:
                                          </Typography>
                                          <Typography>
                                            {formatDate(pet.createdAt)}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography variant="body2" color="textSecondary" gutterBottom>
                                            Clinic:
                                          </Typography>
                                          <Typography>
                                            {pet.registeredClinicId?.name || 'No clinic specified'}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Grid>
                                </Grid>
                              </DetailsCard>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10]}
                component="div"
                count={filteredPets.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                sx={{ borderTop: '1px solid #e0e0e0' }}
              />
            </>
          )}
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default PendingRegistrations;