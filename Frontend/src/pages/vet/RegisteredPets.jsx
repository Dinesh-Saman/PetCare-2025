// src/pages/vet/RegisteredPets.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Grid,
  TablePagination,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 16,
  boxShadow: '0px 8px 30px rgba(0,0,0,0.08)',
  maxWidth: '1400px',
  padding: theme.spacing(3),
  margin: '0 auto',
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
    backgroundColor: '#f0fff4 !important',
  },
  cursor: 'pointer',
  transition: 'background-color 0.2s',
}));

const TableHeadCell = styled(TableCell)({
  backgroundColor: '#2e7d32',
  color: 'white',
  fontWeight: 'bold',
});

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  border: '3px solid white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const RegisteredPets = () => {
  const navigate = useNavigate();

  const [approvedPets, setApprovedPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('petName');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

useEffect(() => {
  const fetchRegisteredPets = async () => {
    try {
      setLoading(true);

      // Check authentication
      const token = localStorage.getItem('vet_token');
      if (!token) {
        Swal.fire('Error', 'Please log in again.', 'error');
        navigate('/login');
        return;
      }

      // Set auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Try the simple endpoint first
      console.log('Trying /pets/clinic/registered endpoint...');
      try {
        const response = await api.get('/pets/clinic/registered');
        console.log('Registered pets response:', response.data);
        
        if (response.data.success) {
          const petsData = response.data.registeredPets || response.data.approvedPets || [];
          setApprovedPets(petsData);
          setFilteredPets(petsData);
          
          // If clinic info is available, you can store it if needed
          if (response.data.clinicInfo) {
            console.log('Clinic info:', response.data.clinicInfo);
          }
          
          setLoading(false);
          return;
        }
      } catch (endpointError) {
        console.log('Primary endpoint failed, trying alternative...');
        console.error('Error details:', endpointError.response?.data || endpointError.message);
      }

      // Alternative: Try with clinicId from user
      console.log('Trying alternative method...');
      const userData = localStorage.getItem('vet_user');
      if (!userData) {
        Swal.fire('Error', 'User data not found. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      console.log('User object:', user);
      
      // Try to get clinicId from various possible locations
      let clinicId = null;
      
      // Check multiple possible field names
      if (user.clinicId) clinicId = user.clinicId;
      else if (user.currentActiveClinicId) clinicId = user.currentActiveClinicId;
      else if (user.clinic && user.clinic._id) clinicId = user.clinic._id;
      else if (user.clinic && typeof user.clinic === 'string') clinicId = user.clinic;
      
      console.log('Extracted clinicId:', clinicId);

      if (clinicId) {
        console.log(`Trying /pets/clinic/${clinicId}/registered endpoint...`);
        try {
          const response = await api.get(`/pets/clinic/${clinicId}/registered`);
          console.log('Registered pets by clinic response:', response.data);
          
          const petsData = response.data.registeredPets || response.data.approvedPets || [];
          setApprovedPets(petsData);
          setFilteredPets(petsData);
        } catch (clinicError) {
          console.error('Clinic endpoint failed:', clinicError);
          console.error('Error details:', clinicError.response?.data || clinicError.message);
          
          // Last try: old endpoint
          console.log('Trying old /pets/clinic/:clinicId/approved endpoint...');
          try {
            const response = await api.get(`/pets/clinic/${clinicId}/approved`);
            console.log('Old approved endpoint response:', response.data);
            
            const petsData = response.data.approvedPets || response.data || [];
            setApprovedPets(petsData);
            setFilteredPets(petsData);
          } catch (oldError) {
            console.error('All endpoints failed:', oldError);
            throw new Error('Could not fetch registered pets');
          }
        }
      } else {
        console.error('No clinicId found in user object');
        Swal.fire('Info', 'No clinic association found. If you are a veterinarian, please ensure you are associated with a clinic.', 'info');
      }

    } catch (error) {
      console.error('Error fetching registered pets:', error);
      
      // User-friendly error message
      let errorMessage = 'Failed to load registered pets. ';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        localStorage.removeItem('vet_token');
        localStorage.removeItem('vet_user');
        setTimeout(() => navigate('/login'), 1500);
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
      setApprovedPets([]);
      setFilteredPets([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH COMPLETE ===');
    }
  };

  fetchRegisteredPets();
}, [navigate]);

  useEffect(() => {
    let filtered = approvedPets;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pet => {
        switch (searchCriteria) {
          case 'petName':
            return pet.name?.toLowerCase().includes(query);
          case 'ownerName':
            return `${pet.ownerId?.firstName || ''} ${pet.ownerId?.lastName || ''}`.toLowerCase().includes(query);
          case 'species':
            return pet.species?.toLowerCase().includes(query);
          case 'breed':
            return pet.breed?.toLowerCase().includes(query);
          default:
            return true;
        }
      });
    }

    if (speciesFilter !== 'all') {
      filtered = filtered.filter(pet => pet.species === speciesFilter);
    }

    setFilteredPets(filtered);
  }, [searchQuery, searchCriteria, speciesFilter, approvedPets]);

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} year${age !== 1 ? 's' : ''}`;
  };

  const getUniqueSpecies = () => [...new Set(approvedPets.map(p => p.species).filter(Boolean))];

  const paginatedPets = filteredPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRowClick = (petId) => {
    navigate(`/vet/pets/profile/${petId}`);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <ContentContainer>
          <SearchSection>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#49149eff', fontFamily: 'Georgia, serif' }}>
              Registered Pets
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
                placeholder="Search pets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                sx={{ width: 300 }}
              />

              {approvedPets.length > 0 && (
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Species</InputLabel>
                  <Select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} label="Species">
                    <MenuItem value="all">All Species</MenuItem>
                    {getUniqueSpecies().map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </SearchSection>

          {approvedPets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <PetsIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
              <Typography variant="h5" color="textSecondary">
                No Registered Pets
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                {loading ? 'Loading...' : 'No approved pets found for your account.'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                If you're a primary veterinarian, please contact support to configure your registered pets access.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  Showing {filteredPets.length} registered pet{filteredPets.length !== 1 ? 's' : ''}
                </Typography>
                {filteredPets.length !== approvedPets.length && (
                  <Typography variant="body2" color="textSecondary">
                    ({approvedPets.length} total)
                  </Typography>
                )}
              </Box>
              
              <TableContainer component={Paper} elevation={6}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>Pet</TableHeadCell>
                      <TableHeadCell>Owner</TableHeadCell>
                      <TableHeadCell>Species & Breed</TableHeadCell>
                      <TableHeadCell>Age & Gender</TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPets.map((pet) => (
                      <TableRowStyled
                        key={pet._id}
                        onClick={() => handleRowClick(pet._id)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PetAvatar src={pet.photo} alt={pet.name}>
                              {pet.name?.[0]?.toUpperCase() || 'P'}
                            </PetAvatar>
                            <Box>
                              <Typography fontWeight="bold">{pet.name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Registered pet
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Box>
                              <Typography fontWeight="bold">
                                {pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {pet.ownerId?.phoneNumber || 'No phone'}
                              </Typography>
                            </Box>
                          </Box>
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
                      </TableRowStyled>
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

export default RegisteredPets;