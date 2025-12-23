import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, FormControl, Select, InputLabel,
  Avatar, Chip, IconButton, Collapse, Grid, Card, CardContent, CardHeader, Divider
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

// Styled Components — matching your other pages
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

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  flexWrap: 'wrap',
  gap: 20,
}));

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  '&:hover': {
    backgroundColor: '#f1f1f1',
  },
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

const PetAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  border: '3px solid white',
}));

const StatusChip = styled(Chip)({
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#ff9800', // Pending = orange
});

const DetailsCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3, 0),
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
    fontSize: 28,
  },
}));

const InfoLabel = styled(Typography)({
  fontWeight: 'bold',
  color: '#555',
  minWidth: 140,
});

const InfoValue = styled(Typography)({
  color: '#333',
});

const PendingRegistrations = () => {
  const [pendingPets, setPendingPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("petName");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingRegistrations = async () => {
      try {
        // This should be protected and return only pending pets for the logged-in vet's clinic
        const response = await api.get('/pets/clinic/pending'); // Adjust endpoint if needed

        let petsData = [];

        if (Array.isArray(response.data)) {
          petsData = response.data;
        } else if (response.data?.pendingPets) {
          petsData = response.data.pendingPets;
        } else {
          petsData = [];
        }

        setPendingPets(petsData);
      } catch (error) {
        console.error("Error fetching pending registrations:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load pending registrations',
          icon: 'error',
        });
        setPendingPets([]);
      }
    };

    fetchPendingRegistrations();
  }, []);

  const handleApprove = async (petId) => {
    const result = await Swal.fire({
      title: 'Approve Registration?',
      text: "This pet will be registered with your clinic",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve!'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/pets/${petId}/status`, { status: 'Approved' });
        setPendingPets(prev => prev.filter(pet => pet._id !== petId));
        Swal.fire('Approved!', 'Pet registration approved.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not approve registration', 'error');
      }
    }
  };

  const handleReject = async (petId) => {
    const result = await Swal.fire({
      title: 'Reject Registration?',
      text: "This action cannot be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject!'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/pets/${petId}/status`, { status: 'Rejected' });
        setPendingPets(prev => prev.filter(pet => pet._id !== petId));
        Swal.fire('Rejected!', 'Pet registration rejected.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not reject registration', 'error');
      }
    }
  };

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
    return `${age} years`;
  };

  const filteredPets = pendingPets.filter(pet => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    switch(searchCriteria) {
      case 'petName': return pet.name?.toLowerCase().includes(query);
      case 'ownerName': return `${pet.ownerId?.firstName || ''} ${pet.ownerId?.lastName || ''}`.toLowerCase().includes(query);
      case 'species': return pet.species?.toLowerCase().includes(query);
      case 'breed': return pet.breed?.toLowerCase().includes(query);
      default: return true;
    }
  });

  const paginatedPets = filteredPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa', marginTop: '70px' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <ContentContainer>
          <SearchSection>
            <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#49149eff' }}>
              Pending Pet Registrations
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Search By</InputLabel>
                <Select value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)}>
                  <MenuItem value="petName">Pet Name</MenuItem>
                  <MenuItem value="ownerName">Owner Name</MenuItem>
                  <MenuItem value="species">Species</MenuItem>
                  <MenuItem value="breed">Breed</MenuItem>
                </Select>
              </FormControl>

              <TextField
                variant="outlined"
                placeholder="Search pending pets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>
          </SearchSection>

          {pendingPets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <PetsIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h5" color="textSecondary" gutterBottom>
                No Pending Registrations
              </Typography>
              <Typography variant="body1" color="textSecondary">
                All pet registrations have been processed.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableHeadRow>
                      <TableHeadCell></TableHeadCell>
                      <TableHeadCell>Pet</TableHeadCell>
                      <TableHeadCell>Owner</TableHeadCell>
                      <TableHeadCell>Species & Breed</TableHeadCell>
                      <TableHeadCell>Age & Gender</TableHeadCell>
                      <TableHeadCell>Status</TableHeadCell>
                      <TableHeadCell>Actions</TableHeadCell>
                    </TableHeadRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPets.map((pet) => (
                      <React.Fragment key={pet._id}>
                        <TableRowStyled>
                          <TableCell>
                            <IconButton onClick={() => handleExpandRow(pet._id)}>
                              <ExpandMoreIcon sx={{ transform: expandedRow === pet._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <PetAvatar src={pet.photo || ''} alt={pet.name}>
                                {pet.name?.charAt(0).toUpperCase() || 'P'}
                              </PetAvatar>
                              <Box>
                                <Typography fontWeight="bold">{pet.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Requested registration
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {pet.ownerId?.phoneNumber || ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">{pet.species}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {pet.breed || 'Mixed'}
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
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton color="success" onClick={() => handleApprove(pet._id)}>
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton color="error" onClick={() => handleReject(pet._id)}>
                                <CancelIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRowStyled>

                        <TableRow>
                          <TableCell colSpan={7} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                            <Collapse in={expandedRow === pet._id} timeout="auto" unmountOnExit>
                              <DetailsCard>
                                <Grid container spacing={4}>
                                  {/* Pet Information */}
                                  <Grid item xs={12} md={6}>
                                    <CardHeaderStyled bgcolor="#4caf50" title="Pet Information" avatar={<PetsIcon />} />
                                    <CardContent>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <PetAvatar src={pet.photo || ''} alt={pet.name} sx={{ width: 100, height: 100, mr: 3 }} />
                                        <Box>
                                          <Typography variant="h6">{pet.name}</Typography>
                                          <Typography>{pet.species} • {pet.breed || 'Mixed'}</Typography>
                                          <Typography color="textSecondary">
                                            Microchip: {pet.microchipNumber || 'Not registered'}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <InfoRow>
                                        <CalendarTodayIcon />
                                        <InfoLabel>Age:</InfoLabel>
                                        <InfoValue>{calculateAge(pet.dateOfBirth)}</InfoValue>
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

                                  {/* Owner Information */}
                                  <Grid item xs={12} md={6}>
                                    <CardHeaderStyled bgcolor="#2196f3" title="Owner Information" avatar={<PersonIcon />} />
                                    <CardContent>
                                      <InfoRow>
                                        <PersonIcon />
                                        <InfoLabel>Owner:</InfoLabel>
                                        <InfoValue>{pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}</InfoValue>
                                      </InfoRow>
                                      <InfoRow>
                                        <PhoneIcon />
                                        <InfoLabel>Phone:</InfoLabel>
                                        <InfoValue>{pet.ownerId?.phoneNumber || 'N/A'}</InfoValue>
                                      </InfoRow>
                                      <InfoRow>
                                        <LocationOnIcon />
                                        <InfoLabel>Address:</InfoLabel>
                                        <InfoValue>{pet.ownerId?.address || 'N/A'}</InfoValue>
                                      </InfoRow>
                                    </CardContent>
                                  </Grid>

                                  {/* Notes */}
                                  <Grid item xs={12}>
                                    <CardHeaderStyled bgcolor="#9c27b0" title="Additional Notes" avatar={<DescriptionIcon />} />
                                    <CardContent>
                                      <Typography variant="body1">
                                        {pet.notes || 'No additional notes provided.'}
                                      </Typography>
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
                component="div"
                count={filteredPets.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPageOptions={[]}
                labelRowsPerPage=""
              />
            </>
          )}
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default PendingRegistrations;