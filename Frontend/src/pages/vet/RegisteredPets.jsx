// src/pages/vet/RegisteredPets.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  TablePagination,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Pets as PetsIcon,
  Person as PersonIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import api from '../../services/api';

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 16,
  boxSizing: 'border-box',
  boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
  border: '1px solid #e2e8f0',
  width: '100%',
  padding: 32,
  margin: '0 auto',
  [theme.breakpoints.down('md')]: {
    padding: 16,
  },
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
  flexWrap: 'wrap',
  gap: theme.spacing(3),
}));

const TableRowStyled = styled(TableRow)({
  '&:hover': { backgroundColor: '#f0fff4 !important' },
  cursor: 'pointer',
  transition: 'background-color 0.2s',
});

const TableHeadCell = styled(TableCell)({
  backgroundColor: '#e08c0e',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
});

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  border: '3px solid white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  [theme.breakpoints.down('sm')]: {
    width: 50,
    height: 50,
  },
}));

const RegisteredPets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const clinicIdFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('clinicId') || null;
  }, [location.search]);

  const [approvedPets, setApprovedPets] = useState([]);
  const [filteredApprovedPets, setFilteredApprovedPets] = useState([]);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [searchQueryApproved, setSearchQueryApproved] = useState('');
  const [searchCriteriaApproved, setSearchCriteriaApproved] = useState('petName');
  const [speciesFilterApproved, setSpeciesFilterApproved] = useState('all');
  const [clinicFilterApproved, setClinicFilterApproved] = useState('all');
  const [pageApproved, setPageApproved] = useState(0);
  const [rowsPerPageApproved] = useState(10);

  useEffect(() => {
    fetchApprovedPets();
  }, [navigate]);

  // When navigated from clinics page, preselect that clinic in the filter
  useEffect(() => {
    if (clinicIdFromQuery) {
      setClinicFilterApproved(clinicIdFromQuery);
    }
  }, [clinicIdFromQuery]);

  const fetchApprovedPets = async () => {
    try {
      setLoadingApproved(true);
      const token = localStorage.getItem('vet_token');
      if (!token) {
        navigate('/vet/login');
        return;
      }

      const response = await api.get('/pets/clinic/registered').catch(() => ({ data: {} }));
      if (response?.data?.success || response?.data?.registeredPets) {
        const petsData = response.data.registeredPets || response.data.approvedPets || [];
        setApprovedPets(petsData);
      } else {
        const userData = JSON.parse(localStorage.getItem('vet_user'));
        const clinicId = userData?.clinicId || userData?.currentActiveClinicId;
        if (clinicId) {
          const res =
            (await api.get(`/pets/clinic/${clinicId}/registered`).catch(() => null)) ||
            (await api.get(`/pets/clinic/${clinicId}/approved`).catch(() => null));
          setApprovedPets(res?.data?.approvedPets || res?.data?.registeredPets || res?.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch registered pets:', error);
    } finally {
      setLoadingApproved(false);
    }
  };

  useEffect(() => {
    let filtered = approvedPets;

    if (searchQueryApproved.trim()) {
      const query = searchQueryApproved.toLowerCase();
      filtered = filtered.filter((pet) => {
        switch (searchCriteriaApproved) {
          case 'petName':
            return pet.name?.toLowerCase().includes(query);
          case 'ownerName':
            return `${pet.ownerId?.firstName || ''} ${pet.ownerId?.lastName || ''}`
              .toLowerCase()
              .includes(query);
          case 'species':
            return pet.species?.toLowerCase().includes(query);
          case 'breed':
            return pet.breed?.toLowerCase().includes(query);
          default:
            return true;
        }
      });
    }

    if (speciesFilterApproved !== 'all') {
      filtered = filtered.filter((pet) => pet.species === speciesFilterApproved);
    }

    if (clinicFilterApproved !== 'all') {
      filtered = filtered.filter((pet) => pet.registeredClinicId?._id === clinicFilterApproved);
    }

    setFilteredApprovedPets(filtered);
  }, [
    searchQueryApproved,
    searchCriteriaApproved,
    speciesFilterApproved,
    clinicFilterApproved,
    approvedPets,
  ]);

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const numYears = dayjs().diff(dayjs(dob), 'year');
    if (numYears > 0) return `${numYears} year${numYears !== 1 ? 's' : ''}`;
    const numMonths = dayjs().diff(dayjs(dob), 'month');
    if (numMonths > 0) return `${numMonths} month${numMonths !== 1 ? 's' : ''}`;
    return 'Less than a month';
  };

  const getUniqueSpecies = () =>
    [...new Set(approvedPets.map((p) => p.species).filter(Boolean))];

  const getUniqueClinics = () => {
    const map = new Map();
    approvedPets.forEach((p) => {
      if (p.registeredClinicId) {
        map.set(p.registeredClinicId._id, p.registeredClinicId.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  };

  const handleRowClick = (petId) => {
    navigate(`/vet/pets/profile/${petId}`);
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
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', mb: 3 }}
            >
              Registered Pets
            </Typography>

            <Box>
              <SearchSection>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                  <FormControl sx={{ flex: { xs: 1, sm: 'none' }, minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                    <InputLabel>Search By</InputLabel>
                    <Select
                      value={searchCriteriaApproved}
                      label="Search By"
                      size="small"
                      onChange={(e) => setSearchCriteriaApproved(e.target.value)}
                    >
                      <MenuItem value="petName">Pet Name</MenuItem>
                      <MenuItem value="ownerName">Owner Name</MenuItem>
                      <MenuItem value="species">Species</MenuItem>
                      <MenuItem value="breed">Breed</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    placeholder="Search pets..."
                    value={searchQueryApproved}
                    onChange={(e) => setSearchQueryApproved(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      flex: { xs: 2, sm: 'none' },
                      width: isMobile ? '100%' : 300,
                      '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                    <InputLabel>Species</InputLabel>
                    <Select
                      value={speciesFilterApproved}
                      label="Species"
                      size="small"
                      onChange={(e) => setSpeciesFilterApproved(e.target.value)}
                    >
                      <MenuItem value="all">All Species</MenuItem>
                      {getUniqueSpecies().map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                    <InputLabel>Clinic</InputLabel>
                    <Select
                      value={clinicFilterApproved}
                      label="Clinic"
                      size="small"
                      onChange={(e) => setClinicFilterApproved(e.target.value)}
                    >
                      <MenuItem value="all">All Clinics</MenuItem>
                      {getUniqueClinics().map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </SearchSection>

              {loadingApproved ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress color="success" />
                </Box>
              ) : approvedPets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 12 }}>
                  <PetsIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
                  <Typography variant="h5" color="textSecondary">
                    No Registered Pets
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeadCell>Pet</TableHeadCell>
                          <TableHeadCell>Owner</TableHeadCell>
                          <TableHeadCell>Clinic Name</TableHeadCell>
                          <TableHeadCell>Species & Breed</TableHeadCell>
                          <TableHeadCell>Age & Gender</TableHeadCell>
                          <TableHeadCell align="center">Actions</TableHeadCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredApprovedPets
                          .slice(
                            pageApproved * rowsPerPageApproved,
                            pageApproved * rowsPerPageApproved + rowsPerPageApproved,
                          )
                          .map((pet) => (
                            <TableRowStyled key={pet._id} onClick={() => handleRowClick(pet._id)}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <PetAvatar src={pet.photo} alt={pet.name}>
                                    {pet.name?.[0]?.toUpperCase() || 'P'}
                                  </PetAvatar>
                                  <Box>
                                    <Typography fontWeight="bold">{pet.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      Registered
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PersonIcon fontSize="small" color="action" />
                                  <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                      {pet.ownerId
                                        ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}`
                                        : 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="500">
                                  {pet.registeredClinicId?.name || 'Unknown Clinic'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight="bold">
                                  {pet.species}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {pet.breed || 'Not specified'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    {calculateAge(pet.dateOfBirth)}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    {pet.gender === 'Male' ? (
                                      <MaleIcon color="primary" sx={{ fontSize: 18, mr: 0.5 }} />
                                    ) : pet.gender === 'Female' ? (
                                      <FemaleIcon color="secondary" sx={{ fontSize: 18, mr: 0.5 }} />
                                    ) : null}
                                    <Typography variant="body2" color="textSecondary">
                                      {pet.gender || 'Unknown'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRowClick(pet._id);
                                    }}
                                    sx={{
                                      textTransform: 'none',
                                      borderRadius: '12px',
                                      background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
                                      fontWeight: 700,
                                      px: 3,
                                      '&:hover': {
                                        background:
                                          'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
                                        transform: 'translateY(-1px)',
                                      },
                                    }}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ChatIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const ownerId = pet.ownerId?._id || pet.ownerId;
                                      if (ownerId) navigate(`/vet/chat/owner/${ownerId}`);
                                    }}
                                    sx={{
                                      textTransform: 'none',
                                      borderRadius: '12px',
                                      borderColor: '#8e24aa',
                                      color: '#8e24aa',
                                      fontWeight: 700,
                                      px: 2,
                                      '&:hover': {
                                        borderColor: '#7b1fa2',
                                        bgcolor: 'rgba(142, 36, 170, 0.04)',
                                        transform: 'translateY(-1px)',
                                      },
                                    }}
                                  >
                                    Chat
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRowStyled>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredApprovedPets.length}
                    rowsPerPage={rowsPerPageApproved}
                    page={pageApproved}
                    onPageChange={(_, newPage) => setPageApproved(newPage)}
                    rowsPerPageOptions={[]}
                  />
                </>
              )}
            </Box>
          </ContentContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisteredPets;

