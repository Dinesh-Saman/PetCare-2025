// src/pages/vet/PendingRegistrations.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
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
  Alert,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ScaleIcon from '@mui/icons-material/Scale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClinicIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';
import dayjs from 'dayjs';

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 16,
  boxShadow: '0px 8px 30px rgba(0,0,0,0.08)',
  width: '100%',
  padding: '32px',
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
  backgroundColor: '#e08c0eff',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
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
  borderLeft: '5px solid #49149e',
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(1.5, 0),
  '& svg': {
    marginRight: 12,
    color: '#49149e',
    fontSize: 24,
  },
}));

const InfoLabel = styled(Typography)({
  fontWeight: 'bold',
  color: '#444',
  minWidth: 120,
});

const PendingRegistrations = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [pendingPets, setPendingPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('petName');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [clinicFilter, setClinicFilter] = useState('all');
  const [clinics, setClinics] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);
  const [expandedRow, setExpandedRow] = useState(null);
  const [error, setError] = useState(null);

  const fetchClinics = async () => {
    try {
      const response = await api.get('/clinics');
      if (response.data && response.data.clinics) {
        setClinics(response.data.clinics);
      } else if (response.data) {
        setClinics(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch clinics:', err);
    }
  };

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use clinicFilter if selected, otherwise endpoint might handle default clinic
      let url = '/pets/clinic/pending';
      if (clinicFilter !== 'all') {
        url = `/pets/clinic/${clinicFilter}/pending`;
      }

      const response = await api.get(`${url}?status=${statusFilter}`);
      if (response.data) {
        const petsData = response.data.pendingPets || response.data.approvedPets || response.data.registeredPets || [];
        setPendingPets(petsData);
        setFilteredPets(petsData);
      }
    } catch (apiErr) {
      let msg = 'Failed to load registrations';
      if (apiErr.response?.data?.message) {
        msg = apiErr.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    fetchPendingRegistrations();
  }, [statusFilter, clinicFilter]);

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
        await api.patch(`/pets/${petId}/approve`);
        fetchPendingRegistrations();
        Swal.fire({
          title: 'Approved!',
          text: 'Pet has been registered successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire('Error', 'Could not approve registration.', 'error');
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
      confirmButtonText: 'Yes, Reject'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/pets/${petId}/reject`, { reason: 'Registration rejected by veterinarian' });
        fetchPendingRegistrations();
        Swal.fire({
          title: 'Rejected!',
          text: 'Registration request has been rejected.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire('Error', 'Could not reject registration.', 'error');
      }
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const numYears = dayjs().diff(dayjs(dob), 'year');
    if (numYears > 0) return `${numYears} year${numYears !== 1 ? 's' : ''}`;
    const numMonths = dayjs().diff(dayjs(dob), 'month');
    if (numMonths > 0) return `${numMonths} month${numMonths !== 1 ? 's' : ''}`;
    return 'Less than a month';
  };

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Pending': return <Chip label="Pending" size="small" sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 'bold' }} />;
      case 'Approved': return <Chip label="Approved" size="small" sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 'bold' }} />;
      case 'Rejected': return <Chip label="Rejected" size="small" sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 'bold' }} />;
      default: return <Chip label={status} size="small" />;
    }
  };

  const paginatedPets = filteredPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
          <ContentContainer>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', mb: 1 }}>
                Registration Requests
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage and review pet registration requests for your clinics.
              </Typography>
            </Box>

            <SearchSection>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 150 }} size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel>Clinic</InputLabel>
                  <Select
                    value={clinicFilter}
                    onChange={(e) => setClinicFilter(e.target.value)}
                    label="Clinic"
                  >
                    <MenuItem value="all">All Clinics</MenuItem>
                    {clinics.map(c => (
                      <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }} size="small">
                  <InputLabel>Search By</InputLabel>
                  <Select
                    value={searchCriteria}
                    onChange={(e) => setSearchCriteria(e.target.value)}
                    label="Search By"
                  >
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
                  sx={{ width: isMobile ? '100%' : 250 }}
                  size="small"
                />

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchPendingRegistrations}
                  size="small"
                  sx={{ height: 40 }}
                >
                  Refresh
                </Button>
              </Box>
            </SearchSection>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchPendingRegistrations}>Retry</Button>}>
                {error}
              </Alert>
            )}

            {!error && filteredPets.length === 0 && !loading ? (
              <Box sx={{ textAlign: 'center', py: 12 }}>
                <PetsIcon sx={{ fontSize: 100, color: '#ddd', mb: 3 }} />
                <Typography variant="h5" color="textSecondary">No Requests Found</Typography>
              </Box>
            ) : !error && (
              <>
                <TableContainer component={Paper} elevation={4} sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeadCell width={50}></TableHeadCell>
                        <TableHeadCell>Pet Name</TableHeadCell>
                        <TableHeadCell>Owner</TableHeadCell>
                        <TableHeadCell>Clinic</TableHeadCell>
                        <TableHeadCell>Status</TableHeadCell>
                        <TableHeadCell align="center">Actions</TableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={6} sx={{ py: 10, textAlign: 'center' }}><CircularProgress color="secondary" /></TableCell></TableRow>
                      ) : paginatedPets.map((pet) => (
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
                                <Avatar src={pet.photo} sx={{ width: 50, height: 50 }}>{pet.name?.[0]}</Avatar>
                                <Typography variant="body1" fontWeight="bold">{pet.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{pet.registeredClinicId?.name || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>
                              {getStatusChip(pet.registrationStatus)}
                            </TableCell>
                            <TableCell align="center">
                              {pet.registrationStatus === 'Pending' ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                  <Tooltip title="Approve">
                                    <IconButton color="success" onClick={(e) => { e.stopPropagation(); handleApprove(pet._id); }}>
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleReject(pet._id); }}>
                                      <CancelIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="textSecondary">No Actions Available</Typography>
                              )}
                            </TableCell>
                          </TableRowStyled>

                          <TableRow>
                            <TableCell colSpan={6} sx={{ p: 0 }}>
                              <Collapse in={expandedRow === pet._id} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 3, bgcolor: '#fbfaff' }}>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                      <Typography variant="h6" color="#49149e" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PetsIcon fontSize="small" /> Pet Details
                                      </Typography>
                                      <DetailsCard>
                                        <CardContent>
                                          <InfoRow><InfoLabel>Species:</InfoLabel><Typography>{pet.species}</Typography></InfoRow>
                                          <InfoRow><InfoLabel>Breed:</InfoLabel><Typography>{pet.breed || 'N/A'}</Typography></InfoRow>
                                          <InfoRow><InfoLabel>Age:</InfoLabel><Typography>{calculateAge(pet.dateOfBirth)}</Typography></InfoRow>
                                          <InfoRow><InfoLabel>Gender:</InfoLabel><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {pet.gender === 'Male' ? <MaleIcon color="primary" /> : <FemaleIcon color="secondary" />}
                                            <Typography>{pet.gender}</Typography>
                                          </Box></InfoRow>
                                          <InfoRow><InfoLabel>Weight:</InfoLabel><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ScaleIcon fontSize="small" />
                                            <Typography>{pet.weight ? `${pet.weight} kg` : 'N/A'}</Typography>
                                          </Box></InfoRow>
                                        </CardContent>
                                      </DetailsCard>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                      <Typography variant="h6" color="#49149e" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon fontSize="small" /> Owner Information
                                      </Typography>
                                      <DetailsCard sx={{ borderLeftColor: '#2196f3' }}>
                                        <CardContent>
                                          <InfoRow><InfoLabel>Email:</InfoLabel><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon fontSize="small" />
                                            <Typography>{pet.ownerId?.email || 'N/A'}</Typography>
                                          </Box></InfoRow>
                                          <InfoRow><InfoLabel>Phone:</InfoLabel><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon fontSize="small" />
                                            <Typography>{pet.ownerId?.phoneNumber || 'N/A'}</Typography>
                                          </Box></InfoRow>
                                        </CardContent>
                                      </DetailsCard>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                      <Typography variant="h6" color="#49149e" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DescriptionIcon fontSize="small" /> Additional Notes
                                      </Typography>
                                      <DetailsCard sx={{ borderLeftColor: '#ff9800' }}>
                                        <CardContent>
                                          <Typography variant="body2" sx={{ fontStyle: pet.notes ? 'normal' : 'italic', color: pet.notes ? 'textPrimary' : 'textSecondary' }}>
                                            {pet.notes || "No notes provided by the owner."}
                                          </Typography>
                                        </CardContent>
                                      </DetailsCard>
                                    </Grid>
                                  </Grid>
                                </Box>
                                <Divider />
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[]}
                  component="div"
                  count={filteredPets.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                />
              </>
            )}
          </ContentContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default PendingRegistrations;