import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, MenuItem, FormControl, Select, InputLabel, TablePagination, 
  Avatar, Chip, IconButton, Collapse, Grid, Card, CardContent, CardHeader, Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/sidebar';
import Header from '../../components/layout/header';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import PetsIcon from '@mui/icons-material/Pets';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../../services/api';

// Styled Pagination
const CustomPagination = ({ count, page, rowsPerPage, onPageChange }) => {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      rowsPerPageOptions={[]}
      labelRowsPerPage=""
    />
  );
};

// Styled Components (replacing makeStyles)
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
    status === 'Confirmed' ? '#4caf50' :
    status === 'Booked' ? '#2196f3' :
    status === 'Canceled' ? '#f44336' :
    status === 'Completed' ? '#9c27b0' : '#ff9800',
}));

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
  minWidth: 120,
});

const InfoValue = styled(Typography)({
  color: '#333',
});

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("petName");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      const fetchAppointments = async () => {
        try {
          const response = await api.get('/appointments'); // ← Clean call

          let appointmentsData = [];

          if (Array.isArray(response.data)) {
            appointmentsData = response.data;
          } else if (response.data?.appointments && Array.isArray(response.data.appointments)) {
            appointmentsData = response.data.appointments;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            appointmentsData = response.data.data;
          } else {
            console.warn('Unexpected response format:', response.data);
            appointmentsData = [];
          }

          setAppointments(appointmentsData);
        } catch (error) {
          console.error("Error fetching appointments:", error);
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to load appointments',
            icon: 'error',
          });
          setAppointments([]);
        }
      };

      fetchAppointments();
    }, []);

  const handleConfirm = async (id) => {
    const result = await Swal.fire({
      title: 'Confirm Appointment?',
      text: "This will mark the appointment as confirmed",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, confirm it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`/appointments/${id}/confirm`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAppointments(appointments.map(app => 
          app._id === id ? { ...app, status: 'Confirmed' } : app
        ));
        Swal.fire('Confirmed!', 'Appointment has been confirmed.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not confirm appointment', 'error');
      }
    }
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Cancel Appointment?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`/appointments/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAppointments(appointments.map(app => 
          app._id === id ? { ...app, status: 'Canceled' } : app
        ));
        Swal.fire('Canceled!', 'Appointment has been canceled.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not cancel appointment', 'error');
      }
    }
  };

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    switch(searchCriteria) {
      case 'petName': return app.petId?.name?.toLowerCase().includes(query);
      case 'ownerName': return `${app.petId?.ownerId?.firstName || ''} ${app.petId?.ownerId?.lastName || ''}`.toLowerCase().includes(query);
      case 'vetName': return `${app.vetId?.firstName || ''} ${app.vetId?.lastName || ''}`.toLowerCase().includes(query);
      case 'reason': return app.reason?.toLowerCase().includes(query);
      default: return true;
    }
  });

  const paginatedAppointments = filteredAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa'}}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ContentContainer>
          <SearchSection>
            <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#49149eff' }}>
              My Appointments
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',  // This separates left and right
              alignItems: 'center',
              width: '100%',
              flexWrap: 'wrap',
              gap: 2
            }}>
              {/* Left side - Search By and Search Textfield */}
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                flexWrap: 'wrap', 
                alignItems: 'center',
              }}>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Search By</InputLabel>
                  <Select value={searchCriteria} onChange={(e) => setSearchCriteria(e.target.value)} label="Search By">
                    <MenuItem value="petName">Pet Name</MenuItem>
                    <MenuItem value="ownerName">Owner Name</MenuItem>
                    <MenuItem value="vetName">Vet Name</MenuItem>
                    <MenuItem value="reason">Reason</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  variant="outlined"
                  placeholder={`Search by ${searchCriteria.replace(/([A-Z])/g, ' $1')}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    width: 300,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                    },
                    '& .MuiOutlinedInput-input': {
                    paddingLeft: '20px', 
                    }
                  }}
                />
              </Box>

              {/* Right side - Only Status filter */}
              <Box>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Booked">Booked</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Canceled">Canceled</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </SearchSection>

          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeadCell></TableHeadCell>
                  <TableHeadCell>Pet</TableHeadCell>
                  <TableHeadCell>Owner</TableHeadCell>
                  <TableHeadCell>Date & Time</TableHeadCell>
                  <TableHeadCell>Vet</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Reason</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {paginatedAppointments.map((app) => (
                  <React.Fragment key={app._id}>
                    <TableRowStyled>
                      <TableCell>
                        <IconButton onClick={() => handleExpandRow(app._id)}>
                          <ExpandMoreIcon sx={{ transform: expandedRow === app._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <PetAvatar src={app.petId?.photo || ''} alt={app.petId?.name}>
                            {app.petId?.name?.charAt(0).toUpperCase() || 'P'}
                          </PetAvatar>
                          <Box>
                            <Typography fontWeight="bold">{app.petId?.name || 'Unknown'}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {app.petId?.species} • {app.petId?.breed}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {app.petId?.ownerId ? `${app.petId.ownerId.firstName} ${app.petId.ownerId.lastName}` : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon fontSize="small" color="primary" />
                          <Typography>{formatDateTime(app.dateTime)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          Dr. {app.vetId?.firstName} {app.vetId?.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {app.vetId?.specialization || 'General'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip label={app.status} status={app.status} />
                      </TableCell>
                      <TableCell>{app.reason || 'Routine Checkup'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {app.status === 'Booked' && (
                            <IconButton color="success" onClick={() => handleConfirm(app._id)}>
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                          {app.status !== 'Canceled' && app.status !== 'Completed' && (
                            <IconButton color="error" onClick={() => handleCancel(app._id)}>
                              <CancelIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRowStyled>

                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedRow === app._id} timeout="auto" unmountOnExit>
                          <DetailsCard>
                            <Grid container spacing={4}>
                              {/* Pet & Owner Info */}
                              <Grid item xs={12} md={6}>
                                <CardHeaderStyled bgcolor="#4caf50" title="Pet & Owner Information" avatar={<PetsIcon />} />
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <PetAvatar src={app.petId?.photo || ''} alt={app.petId?.name} sx={{ width: 100, height: 100, mr: 3 }} />
                                    <Box>
                                      <Typography variant="h6">{app.petId?.name}</Typography>
                                      <Typography>{app.petId?.species} • {app.petId?.breed}</Typography>
                                      <Typography color="textSecondary">Owner: {app.petId?.ownerId ? `${app.petId.ownerId.firstName} ${app.petId.ownerId.lastName}` : 'N/A'}</Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Grid>

                              {/* Clinic Info */}
                              <Grid item xs={12} md={6}>
                                <CardHeaderStyled bgcolor="#2196f3" title="Clinic Information" avatar={<LocationOnIcon />} />
                                <CardContent>
                                  <InfoRow>
                                    <LocationOnIcon />
                                    <InfoLabel>Clinic:</InfoLabel>
                                    <InfoValue>{app.clinicId?.name || 'N/A'}</InfoValue>
                                  </InfoRow>
                                  <InfoRow>
                                    <LocationOnIcon />
                                    <InfoLabel>Address:</InfoLabel>
                                    <InfoValue>{app.clinicId?.address || 'N/A'}</InfoValue>
                                  </InfoRow>
                                  <InfoRow>
                                    <PhoneIcon />
                                    <InfoLabel>Phone:</InfoLabel>
                                    <InfoValue>{app.clinicId?.phoneNumber || 'N/A'}</InfoValue>
                                  </InfoRow>
                                </CardContent>
                              </Grid>

                              {/* Appointment Details */}
                              <Grid item xs={12}>
                                <CardHeaderStyled bgcolor="#9c27b0" title="Appointment Details" avatar={<EventIcon />} />
                                <CardContent>
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                      <InfoRow>
                                        <AccessTimeIcon />
                                        <InfoLabel>Date & Time:</InfoLabel>
                                        <InfoValue>{formatDateTime(app.dateTime)}</InfoValue>
                                      </InfoRow>
                                      <InfoRow>
                                        <DescriptionIcon />
                                        <InfoLabel>Reason:</InfoLabel>
                                        <InfoValue>{app.reason || 'Not specified'}</InfoValue>
                                      </InfoRow>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                      <InfoRow>
                                        <Typography><strong>Status:</strong> <StatusChip label={app.status} status={app.status} /></Typography>
                                      </InfoRow>
                                      {app.notes && (
                                        <InfoRow>
                                          <DescriptionIcon />
                                          <InfoLabel>Notes:</InfoLabel>
                                          <InfoValue>{app.notes}</InfoValue>
                                        </InfoRow>
                                      )}
                                    </Grid>
                                  </Grid>
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

          <CustomPagination
            count={filteredAppointments.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
          />
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default AppointmentsList;