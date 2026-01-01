// src/pages/vet/RegisteredPets.jsx
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
import ChatIcon from '@mui/icons-material/Chat';

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
    backgroundColor: '#f0fff4 !important',
  },
  cursor: 'pointer',
}));

const TableHeadCell = styled(TableCell)({
  backgroundColor: '#2e7d32', // Dark green for approved pets
  color: 'white',
  fontWeight: 'bold',
});

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  border: '3px solid white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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

const RegisteredPets = () => {
  const [approvedPets, setApprovedPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('petName');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchApprovedRegistrations = async () => {
      try {
        setLoading(true);

        // Get clinicId from localStorage (same method as PendingRegistrations)
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

        // Fetch approved pets for this clinic
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
    if (!searchQuery.trim()) {
      setFilteredPets(approvedPets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = approvedPets.filter(pet => {
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

    setFilteredPets(filtered);
  }, [searchQuery, searchCriteria, approvedPets]);

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
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

  const getUniqueSpecies = () => [...new Set(approvedPets.map(p => p.species).filter(Boolean))];

  const paginatedPets = filteredPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                  {getUniqueSpecies().map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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
                      <TableHeadCell></TableHeadCell>
                      <TableHeadCell>Pet</TableHeadCell>
                      <TableHeadCell>Owner</TableHeadCell>
                      <TableHeadCell>Species & Breed</TableHeadCell>
                      <TableHeadCell>Age & Gender</TableHeadCell>
                      <TableHeadCell>Chat</TableHeadCell>
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
                                  Registered pet
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
                            <IconButton color="primary" title="Chat with Owner">
                              <ChatIcon />
                            </IconButton>
                          </TableCell>
                        </TableRowStyled>

                        <TableRow>
                          <TableCell colSpan={6} sx={{ p: 0 }}>
                            <Collapse in={expandedRow === pet._id} timeout="auto" unmountOnExit>
                              <DetailsCard>
                                <Grid container spacing={4} sx={{ p: 4 }}>
                                  <Grid item xs={12} md={6}>
                                    <CardHeader title="Pet Details" sx={{ bgcolor: '#2e7d32', color: 'white' }} />
                                    <CardContent>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                        <PetAvatar src={pet.photo} sx={{ width: 120, height: 120, mr: 4 }} />
                                        <Box>
                                          <Typography variant="h5">{pet.name}</Typography>
                                          <Typography>{pet.species} • {pet.breed || 'Mixed'}</Typography>
                                        </Box>
                                      </Box>
                                      <InfoRow><CalendarTodayIcon /><InfoLabel>Age:</InfoLabel><InfoValue>{calculateAge(pet.dateOfBirth)}</InfoValue></InfoRow>
                                      <InfoRow><ScaleIcon /><InfoLabel>Weight:</InfoLabel><InfoValue>{pet.weight ? `${pet.weight} kg` : 'Not recorded'}</InfoValue></InfoRow>
                                      <InfoRow><ColorLensIcon /><InfoLabel>Color:</InfoLabel><InfoValue>{pet.color || 'Not specified'}</InfoValue></InfoRow>
                                    </CardContent>
                                  </Grid>

                                  <Grid item xs={12} md={6}>
                                    <CardHeader title="Owner Information" sx={{ bgcolor: '#1976d2', color: 'white' }} />
                                    <CardContent>
                                      <InfoRow><PersonIcon /><InfoLabel>Name:</InfoLabel><InfoValue>{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</InfoValue></InfoRow>
                                      <InfoRow><PhoneIcon /><InfoLabel>Phone:</InfoLabel><InfoValue>{pet.ownerId?.phoneNumber || 'N/A'}</InfoValue></InfoRow>
                                      <InfoRow><LocationOnIcon /><InfoLabel>Email:</InfoLabel><InfoValue>{pet.ownerId?.email || 'N/A'}</InfoValue></InfoRow>
                                    </CardContent>
                                  </Grid>

                                  {pet.notes && (
                                    <Grid item xs={12}>
                                      <CardHeader title="Additional Notes" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
                                      <CardContent>
                                        <Typography>{pet.notes}</Typography>
                                      </CardContent>
                                    </Grid>
                                  )}
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

export default RegisteredPets;