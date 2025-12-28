import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, FormControl, Select, InputLabel, TablePagination,
  Avatar, Chip, IconButton, Collapse, Grid, Card, CardContent, CardHeader, Divider, List, ListItem, ListItemText
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
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

// Styled Components — matching AppointmentsList structure
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

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: 
    status === 'Approved' ? '#4caf50' :
    status === 'Pending' ? '#ff9800' :
    status === 'Rejected' ? '#f44336' : '#9e9e9e',
}));

// Details Section — Hotel-style cards
const DetailsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#ffffff',
  borderRadius: 16,
  margin: theme.spacing(3, 0),
  boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
}));

const PetInfoFlex = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderRadius: 16,
  backgroundColor: '#f8f9fa',
  marginBottom: theme.spacing(4),
}));

const PetAvatarLarge = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(4),
  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  border: '5px solid white',
}));

const PetDetailsSection = styled(Box)({
  flex: 1,
});

const PetName = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '1.8rem',
  marginBottom: 8,
  color: '#1a237e',
});

const CardHeaderStyled = styled(CardHeader)(({ bgcolor }) => ({
  backgroundColor: bgcolor || '#8e24aa',
  color: 'white',
  padding: 16,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(2, 0),
  '& svg': {
    marginRight: 16,
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

const RegisteredPets = () => {
  const [pets, setPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("petName");
  const [statusFilter, setStatusFilter] = useState("all");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegisteredPets = async () => {
      try {
        const response = await api.get('/pets');
        
        let petsData = [];
        if (Array.isArray(response.data)) {
          petsData = response.data;
        } else if (response.data?.pets) {
          petsData = response.data.pets;
        } else {
          petsData = [];
        }

        setPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load pets',
          icon: 'error',
        });
        setPets([]);
      }
    };

    fetchRegisteredPets();
  }, []);

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

  const filteredPets = pets.filter(pet => {
    if (statusFilter !== 'all' && pet.registrationStatus !== statusFilter) return false;
    if (speciesFilter !== 'all' && pet.species !== speciesFilter) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    switch(searchCriteria) {
      case 'petName': return pet.name?.toLowerCase().includes(query);
      case 'ownerName': return `${pet.ownerId?.firstName || ''} ${pet.ownerId?.lastName || ''}`.toLowerCase().includes(query);
      case 'species': return pet.species?.toLowerCase().includes(query);
      case 'breed': return pet.breed?.toLowerCase().includes(query);
      case 'microchip': return pet.microchipNumber?.toLowerCase().includes(query);
      default: return true;
    }
  });

  const paginatedPets = filteredPets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getUniqueSpecies = () => [...new Set(pets.map(p => p.species).filter(Boolean))];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa'}}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ContentContainer>
          <SearchSection>
            <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#49149eff' }}>
              Registered Pets
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Search By</InputLabel>
                <Select value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)}  label="Search By">
                  <MenuItem value="petName">Pet Name</MenuItem>
                  <MenuItem value="ownerName">Owner Name</MenuItem>
                  <MenuItem value="species">Species</MenuItem>
                  <MenuItem value="breed">Breed</MenuItem>
                  <MenuItem value="microchip">Microchip</MenuItem>
                </Select>
              </FormControl>

              <TextField
                variant="outlined"
                placeholder="Search pets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}  label="Status">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Species</InputLabel>
                <Select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}  label="Species">
                  <MenuItem value="all">All Species</MenuItem>
                  {getUniqueSpecies().map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </SearchSection>

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
                              ID: {pet._id.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {pet.ownerId ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}` : 'N/A'}
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
                        <StatusChip label={pet.registrationStatus} status={pet.registrationStatus} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton color="primary" onClick={() => navigate(`/vet/pets/${pet._id}/medical`)} title="Medical Records">
                            <MedicalInformationIcon />
                          </IconButton>
                          <IconButton color="warning" onClick={() => handleDelete(pet._id, pet.name)} title="Delete">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRowStyled>

                    <TableRow>
                      <TableCell colSpan={7} sx={{ padding: 0 }}>
                        <Collapse in={expandedRow === pet._id} timeout="auto" unmountOnExit>
                          <DetailsContainer>
                            {/* Pet Header */}
                            <PetInfoFlex>
                              <PetAvatarLarge src={pet.photo || ''} alt={pet.name}>
                                {pet.name?.charAt(0).toUpperCase() || 'P'}
                              </PetAvatarLarge>
                              <PetDetailsSection>
                                <PetName variant="h5">{pet.name}</PetName>
                                <Typography variant="h6" color="textSecondary">
                                  {pet.species} • {pet.breed || 'Mixed Breed'}
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                  Microchip: {pet.microchipNumber || 'Not registered'}
                                </Typography>
                              </PetDetailsSection>
                            </PetInfoFlex>

                            <Grid container spacing={4}>
                              {/* Pet Details Card */}
                              <Grid item xs={12} md={6}>
                                <Card>
                                  <CardHeaderStyled bgcolor="#4caf50" title="Pet Details" avatar={<PetsIcon />} />
                                  <CardContent>
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
                                </Card>
                              </Grid>

                              {/* Owner Card */}
                              <Grid item xs={12} md={6}>
                                <Card>
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
                                </Card>
                              </Grid>

                              {/* Registration Card */}
                              <Grid item xs={12}>
                                <Card>
                                  <CardHeaderStyled bgcolor="#9c27b0" title="Registration & Notes" avatar={<CalendarTodayIcon />} />
                                  <CardContent>
                                    <Grid container spacing={4}>
                                      <Grid item xs={12} md={6}>
                                        <InfoRow>
                                          <Typography variant="h6">
                                            <strong>Status:</strong> <StatusChip label={pet.registrationStatus} status={pet.registrationStatus} />
                                          </Typography>
                                        </InfoRow>
                                        <InfoRow>
                                          <LocationOnIcon />
                                          <InfoLabel>Clinic:</InfoLabel>
                                          <InfoValue>{pet.registeredClinicId?.name || 'Not assigned'}</InfoValue>
                                        </InfoRow>
                                      </Grid>
                                      <Grid item xs={12} md={6}>
                                        {pet.notes && (
                                          <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                              Notes:
                                            </Typography>
                                            <Typography variant="body1">{pet.notes}</Typography>
                                          </Box>
                                        )}
                                      </Grid>
                                    </Grid>
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                          </DetailsContainer>
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
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default RegisteredPets;