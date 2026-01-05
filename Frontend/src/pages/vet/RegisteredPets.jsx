// src/pages/vet/RegisteredPets.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← ADD THIS
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
  CircularProgress // ← For loading state if needed
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
  const navigate = useNavigate(); // ← For navigation

  const [approvedPets, setApprovedPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('petName');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const fetchApprovedRegistrations = async () => {
      try {
        setLoading(true);

        const userData = localStorage.getItem('user');
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
          console.error('Failed to parse user data');
          Swal.fire('Error', 'Invalid user data. Please log in again.', 'error');
          setLoading(false);
          return;
        }

        if (!clinicId) {
          Swal.fire('Error', 'Clinic ID not found. Contact support.', 'error');
          setLoading(false);
          return;
        }

        const response = await api.get(`/pets/clinic/${clinicId}/approved`);
        const petsData = response.data?.approvedPets || response.data || [];

        setApprovedPets(petsData);
        setFilteredPets(petsData);
      } catch (error) {
        console.error('Error fetching approved pets:', error);
        const message = error.response?.data?.message || 'Failed to load registered pets';
        Swal.fire('Error', message, 'error');
        setApprovedPets([]);
        setFilteredPets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedRegistrations();
  }, []);

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

  // Navigate to Pet Profile on row click
  const handleRowClick = (petId) => {
    navigate(`/vet/pets/profile/${petId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

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

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Species</InputLabel>
                <Select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} label="Species">
                  <MenuItem value="all">All Species</MenuItem>
                  {getUniqueSpecies().map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </SearchSection>

          {approvedPets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <PetsIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
              <Typography variant="h5" color="textSecondary">
                No Registered Pets
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                Approved pets will appear here once registered.
              </Typography>
            </Box>
          ) : (
            <>
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