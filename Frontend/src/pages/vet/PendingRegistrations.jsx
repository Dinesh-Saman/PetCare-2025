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
  TablePagination
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

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 16,
  boxShadow: '0px 8px 30px rgba(0,0,0,0.08)',
  margin: '30px auto',
  maxWidth: '1400px',
  padding: theme.spacing(4),
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

// Inside your useEffect in PendingRegistrations.jsx

useEffect(() => {
  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);

      // Get clinicId from localStorage
      const userData = localStorage.getItem('user'); // or whatever key you use
      if (!userData) {
        Swal.fire('Error', 'User data not found. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      let clinicId;
      try {
        const parsedUser = JSON.parse(userData);
        clinicId = parsedUser.clinicId;
      } catch (e) {
        console.error('Failed to parse user data from localStorage');
        Swal.fire('Error', 'Invalid user data. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      if (!clinicId) {
        Swal.fire('Error', 'Clinic ID not found. Contact support.', 'error');
        setLoading(false);
        return;
      }

      // Now call the correct backend route with the clinicId
      const response = await api.get(`/pets/clinic/${clinicId}/pending`);

      const petsData = response.data?.pendingPets || response.data || [];

      setPendingPets(petsData);
      setFilteredPets(petsData);
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      const message = error.response?.data?.message || 'Failed to load pending registrations';
      Swal.fire('Error', message, 'error');
      setPendingPets([]);
      setFilteredPets([]);
    } finally {
      setLoading(false);
    }
  };

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
          return `${pet.ownerId?.firstName || ''} ${pet.ownerId?.lastName || ''}`
            .toLowerCase().includes(query);
        case 'species':
          return pet.species?.toLowerCase().includes(query);
        case 'breed':
          return pet.breed?.toLowerCase().includes(query);
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
      confirmButtonText: 'Yes, Approve'
    });

    if (result.isConfirmed) {
      try {
        // You may want a dedicated endpoint, but using patch for now
        await api.patch(`/pets/${petId}/approve`, { status: 'Approved' }); // Create this route if needed

        setPendingPets(prev => prev.filter(p => p._id !== petId));
        Swal.fire('Approved!', 'Pet has been registered successfully.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Could not approve registration', 'error');
      }
    }
  };

  const handleReject = async (petId) => {
    const result = await Swal.fire({
      title: 'Reject Registration?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, Reject'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/pets/${petId}/reject`, { status: 'Rejected' });

        setPendingPets(prev => prev.filter(p => p._id !== petId));
        Swal.fire('Rejected', 'Registration request rejected.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Could not reject registration', 'error');
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

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const paginatedPets = filteredPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <ContentContainer>
          <SearchSection>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#8e24aa', fontFamily: 'Georgia, serif' }}>
              Pending Pet Registrations
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Search By</InputLabel>
                <Select value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)} label="Search By">
                  <MenuItem value="petName">Pet Name</MenuItem>
                  <MenuItem value="ownerName">Owner Name</MenuItem>
                  <MenuItem value="species">Species</MenuItem>
                  <MenuItem value="breed">Breed</MenuItem>
                </Select>
              </FormControl>

              <TextField
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                sx={{ width: 300 }}
              />
            </Box>
          </SearchSection>

          {pendingPets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <PetsIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
              <Typography variant="h5" color="textSecondary">
                No Pending Registrations
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                All registration requests have been processed.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={6}>
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
                            <IconButton>
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
                                  Registration requested
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {pet.ownerId?.phoneNumber || 'No phone'}
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
                              <Typography>{calculateAge(pet.dateOfBirth)} • {pet.gender || 'Unknown'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusChip label="Pending" />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton color="success" onClick={(e) => { e.stopPropagation(); handleApprove(pet._id); }}>
                              <CheckCircleIcon />
                            </IconButton>
                            <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleReject(pet._id); }}>
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
                                    <CardHeader title="Pet Details" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                                    <CardContent>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                        <PetAvatar src={pet.photo} sx={{ width: 120, height: 120, mr: 4 }} />
                                        <Box>
                                          <Typography variant="h5">{pet.name}</Typography>
                                          <Typography>{pet.species} • {pet.breed || 'Mixed'}</Typography>
                                        </Box>
                                      </Box>
                                      <InfoRow><CalendarTodayIcon /><InfoLabel>Date of Birth:</InfoLabel><InfoValue>{pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'Unknown'}</InfoValue></InfoRow>
                                      <InfoRow><ScaleIcon /><InfoLabel>Weight:</InfoLabel><InfoValue>{pet.weight ? `${pet.weight} kg` : 'Not recorded'}</InfoValue></InfoRow>
                                      <InfoRow><ColorLensIcon /><InfoLabel>Color:</InfoLabel><InfoValue>{pet.color || 'Not specified'}</InfoValue></InfoRow>
                                    </CardContent>
                                  </Grid>

                                  <Grid item xs={12} md={6}>
                                    <CardHeader title="Owner Information" sx={{ bgcolor: '#2196f3', color: 'white' }} />
                                    <CardContent>
                                      <InfoRow><PersonIcon /><InfoLabel>Name:</InfoLabel><InfoValue>{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</InfoValue></InfoRow>
                                      <InfoRow><PhoneIcon /><InfoLabel>Phone:</InfoLabel><InfoValue>{pet.ownerId?.phoneNumber || 'N/A'}</InfoValue></InfoRow>
                                      <InfoRow><LocationOnIcon /><InfoLabel>Email:</InfoLabel><InfoValue>{pet.ownerId?.email || 'N/A'}</InfoValue></InfoRow>
                                    </CardContent>
                                  </Grid>

                                  <Grid item xs={12}>
                                    <CardHeader title="Notes from Owner" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
                                    <CardContent>
                                      <Typography>{pet.notes || 'No additional notes provided by the owner.'}</Typography>
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
                onPageChange={(e, newPage) => setPage(newPage)}
              />
            </>
          )}
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default PendingRegistrations;