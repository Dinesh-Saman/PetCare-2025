import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, FormControl, Select, InputLabel, Avatar, IconButton,
  TablePagination, CircularProgress, useTheme, useMediaQuery, Tabs, Tab, Button, Collapse, Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Pets as PetsIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationOnIcon,
  LocalHospital as ClinicIcon,
  CalendarToday as CalendarTodayIcon,
  ColorLens as ColorLensIcon,
  Scale as ScaleIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 16,
  boxShadow: '0px 8px 30px rgba(0,0,0,0.08)',
  width: '100%',
  padding: theme.spacing(3),
  margin: '0 auto',
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

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  '&:hover': { backgroundColor: '#f0fff4 !important' },
  cursor: 'pointer',
  transition: 'background-color 0.2s',
}));

const TableHeadCell = styled(TableCell)({
  backgroundColor: '#2e7d32',
  color: 'white',
  fontWeight: 'bold',
});

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 70, height: 70, border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
}));

const StyledTabs = styled(Tabs)({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': { backgroundColor: '#2e7d32' },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: '1ren',
  color: '#64748b',
  '&.Mui-selected': { color: '#2e7d32' },
  padding: '16px 24px',
});

const RegisteredPets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);

  // Registered Pets State
  const [approvedPets, setApprovedPets] = useState([]);
  const [filteredApprovedPets, setFilteredApprovedPets] = useState([]);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [searchQueryApproved, setSearchQueryApproved] = useState('');
  const [searchCriteriaApproved, setSearchCriteriaApproved] = useState('petName');
  const [speciesFilterApproved, setSpeciesFilterApproved] = useState('all');
  const [pageApproved, setPageApproved] = useState(0);
  const [rowsPerPageApproved] = useState(10);

  // Pending Pets State
  const [pendingPets, setPendingPets] = useState([]);
  const [filteredPendingPets, setFilteredPendingPets] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [searchQueryPending, setSearchQueryPending] = useState('');
  const [searchCriteriaPending, setSearchCriteriaPending] = useState('petName');
  const [pagePending, setPagePending] = useState(0);
  const [rowsPerPagePending] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchApprovedPets();
    fetchPendingPets();
  }, [navigate]);

  const fetchApprovedPets = async () => {
    try {
      setLoadingApproved(true);
      const token = localStorage.getItem('vet_token');
      if (!token) { navigate('/login'); return; }

      const response = await api.get('/pets/clinic/registered').catch(() => ({ data: {} }));
      if (response?.data?.success || response?.data?.registeredPets) {
        const petsData = response.data.registeredPets || response.data.approvedPets || [];
        setApprovedPets(petsData);
      } else {
        const userData = JSON.parse(localStorage.getItem('vet_user'));
        const clinicId = userData?.clinicId || userData?.currentActiveClinicId;
        if (clinicId) {
          const res = await api.get(`/pets/clinic/${clinicId}/registered`).catch(() => null)
            || await api.get(`/pets/clinic/${clinicId}/approved`).catch(() => null);
          setApprovedPets(res?.data?.approvedPets || res?.data?.registeredPets || res?.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch registered pets:", error);
    } finally {
      setLoadingApproved(false);
    }
  };

  const fetchPendingPets = async () => {
    try {
      setLoadingPending(true);
      const response = await api.get('/pets/clinic/pending');
      const petsData = response.data.pendingPets || [];
      setPendingPets(petsData);
    } catch (error) {
      console.error("Failed to fetch pending pets:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    let filtered = approvedPets;
    if (searchQueryApproved.trim()) {
      const query = searchQueryApproved.toLowerCase();
      filtered = filtered.filter(pet => {
        switch (searchCriteriaApproved) {
          case 'petName': return pet.name?.toLowerCase().includes(query);
          case 'ownerName': return `${pet.ownerId?.firstName || ''} ${pet.ownerId?.lastName || ''}`.toLowerCase().includes(query);
          case 'species': return pet.species?.toLowerCase().includes(query);
          case 'breed': return pet.breed?.toLowerCase().includes(query);
          default: return true;
        }
      });
    }
    if (speciesFilterApproved !== 'all') {
      filtered = filtered.filter(pet => pet.species === speciesFilterApproved);
    }
    setFilteredApprovedPets(filtered);
  }, [searchQueryApproved, searchCriteriaApproved, speciesFilterApproved, approvedPets]);

  useEffect(() => {
    let filtered = pendingPets;
    if (searchQueryPending.trim()) {
      const query = searchQueryPending.toLowerCase();
      filtered = filtered.filter(pet => {
        switch (searchCriteriaPending) {
          case 'petName': return pet.name?.toLowerCase().includes(query);
          case 'ownerName': return `${pet.ownerId?.firstName || ''} ${pet.ownerId?.lastName || ''}`.toLowerCase().includes(query);
          case 'species': return pet.species?.toLowerCase().includes(query);
          case 'breed': return pet.breed?.toLowerCase().includes(query);
          case 'microchip': return pet.microchipNumber?.toLowerCase().includes(query);
          default: return true;
        }
      });
    }
    setFilteredPendingPets(filtered);
  }, [searchQueryPending, searchCriteriaPending, pendingPets]);


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

  const handleRowClick = (petId) => navigate(`/vet/pets/profile/${petId}`);

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
        await api.patch(`/pets/${petId}/approve`);
        const approvedPet = pendingPets.find(p => p._id === petId);
        if (approvedPet) {
          setApprovedPets(prev => [...prev, approvedPet]);
        }
        setPendingPets(prev => prev.filter(p => p._id !== petId));
        Swal.fire({ title: 'Approved!', text: 'Pet has been registered.', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Error', 'Could not approve registration.', 'error');
      }
    }
  };

  const handleReject = async (petId) => {
    const result = await Swal.fire({
      title: 'Reject Registration?',
      text: 'This will decline the owner\'s request to register their pet with your clinic.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, Reject'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/pets/${petId}/reject`);
        setPendingPets(prev => prev.filter(p => p._id !== petId));
        Swal.fire({ title: 'Rejected', text: 'Registration request was declined.', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Error', 'Could not reject registration.', 'error');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
          <ContentContainer>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#49149eff', mb: 3 }}>
              Pet Management
            </Typography>

            <StyledTabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <StyledTab label="Registered Pets" />
              <StyledTab label={`Pending Registrations (${pendingPets.length})`} />
            </StyledTabs>

            {activeTab === 0 && (
              <Box>
                <SearchSection>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    <FormControl sx={{ minWidth: 160 }}>
                      <InputLabel>Search By</InputLabel>
                      <Select value={searchCriteriaApproved} onChange={(e) => setSearchCriteriaApproved(e.target.value)} label="Search By" size="small">
                        <MenuItem value="petName">Pet Name</MenuItem>
                        <MenuItem value="ownerName">Owner Name</MenuItem>
                        <MenuItem value="species">Species</MenuItem>
                        <MenuItem value="breed">Breed</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      placeholder="Search registered pets..."
                      value={searchQueryApproved}
                      onChange={(e) => setSearchQueryApproved(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ width: isMobile ? '100%' : 300 }}
                    />
                    {approvedPets.length > 0 && (
                      <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Species</InputLabel>
                        <Select value={speciesFilterApproved} onChange={(e) => setSpeciesFilterApproved(e.target.value)} label="Species" size="small">
                          <MenuItem value="all">All Species</MenuItem>
                          {getUniqueSpecies().map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </SearchSection>

                {loadingApproved ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="success" /></Box>
                ) : approvedPets.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 12 }}>
                    <PetsIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
                    <Typography variant="h5" color="textSecondary">No Registered Pets</Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeadCell>Pet</TableHeadCell>
                            <TableHeadCell>Owner</TableHeadCell>
                            <TableHeadCell>Species & Breed</TableHeadCell>
                            <TableHeadCell>Age & Gender</TableHeadCell>
                            <TableHeadCell>Clinic</TableHeadCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredApprovedPets.slice(pageApproved * rowsPerPageApproved, pageApproved * rowsPerPageApproved + rowsPerPageApproved).map((pet) => (
                            <TableRowStyled key={pet._id} onClick={() => handleRowClick(pet._id)}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <PetAvatar src={pet.photo} alt={pet.name}>{pet.name?.[0]?.toUpperCase() || 'P'}</PetAvatar>
                                  <Box>
                                    <Typography fontWeight="bold">{pet.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">Registered</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PersonIcon fontSize="small" color="action" />
                                  <Box>
                                    <Typography variant="body1" fontWeight="bold">{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      <PhoneIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                      {pet.ownerId?.phoneNumber || 'No phone'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight="bold">{pet.species}</Typography>
                                <Typography variant="body2" color="textSecondary">{pet.breed || 'Not specified'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {pet.gender === 'Male' ? <MaleIcon color="primary" sx={{ fontSize: 20 }} /> : pet.gender === 'Female' ? <FemaleIcon color="secondary" sx={{ fontSize: 20 }} /> : null}
                                  <Typography variant="body2">{calculateAge(pet.dateOfBirth)} • {pet.gender || 'Unknown'}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="500">{pet.clinicId?.name || 'Assigned Clinic'}</Typography>
                              </TableCell>
                            </TableRowStyled>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination component="div" count={filteredApprovedPets.length} rowsPerPage={rowsPerPageApproved} page={pageApproved} onPageChange={(e, newPage) => setPageApproved(newPage)} rowsPerPageOptions={[]} />
                  </>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <SearchSection>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    <FormControl sx={{ minWidth: 160 }}>
                      <InputLabel>Search By</InputLabel>
                      <Select value={searchCriteriaPending} onChange={(e) => setSearchCriteriaPending(e.target.value)} label="Search By" size="small">
                        <MenuItem value="petName">Pet Name</MenuItem>
                        <MenuItem value="ownerName">Owner Name</MenuItem>
                        <MenuItem value="species">Species</MenuItem>
                        <MenuItem value="breed">Breed</MenuItem>
                        <MenuItem value="microchip">Microchip No.</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      placeholder="Search pending requests..."
                      value={searchQueryPending}
                      onChange={(e) => setSearchQueryPending(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ width: isMobile ? '100%' : 300 }}
                    />
                  </Box>
                </SearchSection>

                {loadingPending ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="success" /></Box>
                ) : pendingPets.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 12 }}>
                    <PetsIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
                    <Typography variant="h5" color="textSecondary">No Pending Requests</Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#8e24aa' }}>
                          <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Expand</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pet Details</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Owner</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clinic</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredPendingPets.slice(pagePending * rowsPerPagePending, pagePending * rowsPerPagePending + rowsPerPagePending).map((pet) => (
                            <React.Fragment key={pet._id}>
                              <TableRowStyled sx={{ backgroundColor: expandedRow === pet._id ? '#fafafa !important' : 'inherit' }}>
                                <TableCell>
                                  <IconButton onClick={() => setExpandedRow(expandedRow === pet._id ? null : pet._id)}>
                                    <ExpandMoreIcon sx={{ transform: expandedRow === pet._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                                  </IconButton>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <PetAvatar src={pet.photo} alt={pet.name}>{pet.name?.[0]?.toUpperCase()}</PetAvatar>
                                    <Box>
                                      <Typography fontWeight="bold" sx={{ color: '#49149e' }}>{pet.name}</Typography>
                                      <Typography variant="caption" color="textSecondary">{pet.species} • {pet.breed}</Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" color="action" />
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</Typography>
                                      <Typography variant="caption" color="textSecondary">{pet.ownerId?.email}</Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="bold">{pet.clinicId?.name}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />} onClick={(e) => { e.stopPropagation(); handleApprove(pet._id); }} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                      Approve
                                    </Button>
                                    <Button variant="outlined" color="error" size="small" startIcon={<CancelIcon />} onClick={(e) => { e.stopPropagation(); handleReject(pet._id); }} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                      Reject
                                    </Button>
                                  </Box>
                                </TableCell>
                              </TableRowStyled>
                              <TableRow>
                                <TableCell colSpan={6} sx={{ py: 0, px: 0, borderBottom: expandedRow === pet._id ? '1px solid rgba(224, 224, 224, 1)' : 'none' }}>
                                  <Collapse in={expandedRow === pet._id} timeout="auto" unmountOnExit>
                                    <Box sx={{ p: 4, backgroundColor: '#fafafa' }}>
                                      <Grid container spacing={4}>
                                        <Grid item xs={12} md={6}>
                                          <Typography variant="h6" fontWeight="bold" color="#49149e" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PetsIcon /> Comprehensive Pet Details
                                          </Typography>
                                          <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, backgroundColor: 'white' }}>
                                            <Grid container spacing={2}>
                                              <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}><CalendarTodayIcon fontSize="small" color="action" /><Typography variant="body2" color="textSecondary">Species</Typography></Box>
                                                <Typography variant="body1" fontWeight="500" sx={{ ml: 3 }}>{pet.species}</Typography>
                                              </Grid>
                                              <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}><PetsIcon fontSize="small" color="action" /><Typography variant="body2" color="textSecondary">Breed</Typography></Box>
                                                <Typography variant="body1" fontWeight="500" sx={{ ml: 3 }}>{pet.breed || 'N/A'}</Typography>
                                              </Grid>
                                              <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}><MaleIcon fontSize="small" color="action" /><Typography variant="body2" color="textSecondary">Gender</Typography></Box>
                                                <Typography variant="body1" fontWeight="500" sx={{ ml: 3 }}>{pet.gender}</Typography>
                                              </Grid>
                                            </Grid>
                                          </Paper>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                          <Typography variant="h6" fontWeight="bold" color="#49149e" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon /> Owner Information
                                          </Typography>
                                          <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, backgroundColor: 'white' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                              <PersonIcon color="primary" />
                                              <Typography variant="body1"><strong>Name:</strong> {pet.ownerId?.firstName} {pet.ownerId?.lastName}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                              <PhoneIcon color="primary" />
                                              <Typography variant="body1"><strong>Phone:</strong> {pet.ownerId?.phoneNumber || 'Not provided'}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                              <LocationOnIcon color="primary" />
                                              <Typography variant="body1"><strong>Address:</strong> {pet.ownerId?.address || 'Not provided'}</Typography>
                                            </Box>
                                          </Paper>
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination component="div" count={filteredPendingPets.length} rowsPerPage={rowsPerPagePending} page={pagePending} onPageChange={(e, newPage) => setPagePending(newPage)} rowsPerPageOptions={[]} />
                  </>
                )}
              </Box>
            )}
          </ContentContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisteredPets;