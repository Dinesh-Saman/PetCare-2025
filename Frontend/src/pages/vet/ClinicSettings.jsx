// src/pages/vet/ClinicList.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/sidebar';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, Select, InputLabel, TablePagination,
  IconButton, Collapse, Grid, Card, CardContent, CardHeader,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack,
  ToggleButton, ToggleButtonGroup, Divider
} from '@mui/material';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import { useTheme, useMediaQuery } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Delete as DeleteIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  PhoneOutlined as PhoneOutlinedIcon,
  AccessTimeOutlined as AccessTimeOutlinedIcon,
  EditOutlined as EditOutlinedIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { FaPaw } from 'react-icons/fa';

// Custom components
const CustomPagination = ({ count, page, rowsPerPage, onPageChange }) => (
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

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  boxSizing: 'border-box',
  boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
  border: '1px solid #e2e8f0',
  flex: 1,
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
}));

const SearchSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  flexWrap: 'wrap',
  gap: 20,
});

const TableRowStyled = styled(TableRow)({
  backgroundColor: '#f9f9f9',
  '&:hover': { backgroundColor: '#f1f1f1' },
});

const TableHeadRow = styled(TableRow)({
  backgroundColor: '#e08c0eff',
});

const TableHeadCell = styled(TableCell)({
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
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
  '& svg': { marginRight: 12, color: '#8e24aa', fontSize: 28 },
}));

const InfoLabel = styled(Typography)({
  fontWeight: 'bold',
  color: '#555',
  minWidth: 90,
});

const InfoValue = styled(Typography)({
  color: '#333',
});

const DayChip = styled(Box)(({ active }) => ({
  padding: '6px 16px',
  borderRadius: '12px',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: active ? alpha('#49149e', 0.1) : '#f8fafc',
  color: active ? '#49149e' : '#64748b',
  border: `1px solid ${active ? '#49149e' : '#e2e8f0'}`,
  '&:hover': {
    background: active ? alpha('#49149e', 0.15) : '#f1f5f9',
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
  color: 'white',
  padding: '10px 24px',
  borderRadius: '12px',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: '0 10px 25px rgba(142, 36, 170, 0.2)',
  transition: 'all 0.3s ease',
  height: 44,
  '&:hover': {
    background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 30px rgba(142, 36, 170, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const ClinicList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('list');
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    daysFrom: 'Monday',
    daysTo: 'Friday',
    timeFrom: '08:00',
    timeTo: '17:00',
    description: '',
    location: null
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const navigate = useNavigate();

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vets/my-clinics');
      setClinics(response.data.clinics || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      Swal.fire('Error', 'Could not load your clinics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: { lng: position.coords.longitude, lat: position.coords.latitude }
          }));
        },
        () => { }
      );
    }
  }, []);

  const handleExpandRow = (id) => setExpandedRow(expandedRow === id ? null : id);
  const handleOpenPopup = () => setIsAddPopupOpen(true);
  const handleClosePopup = () => {
    setIsAddPopupOpen(false);
    setFormData(prev => ({
      ...prev,
      name: '', address: '', phoneNumber: '', description: '',
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      daysFrom: 'Monday', daysTo: 'Friday', timeFrom: '08:00', timeTo: '17:00'
    }));
  };

  const handleEditOpen = (clinic) => {
    let daysFrom = 'Monday', daysTo = 'Friday', timeFrom = '08:00', timeTo = '17:00';
    try {
      if (clinic.operatingHours) {
        const parts = clinic.operatingHours.split('|');
        if (parts.length === 2) {
          const daysPart = parts[0].split('-');
          daysFrom = daysPart[0]?.trim() || 'Monday';
          daysTo = daysPart[1]?.trim() || 'Friday';
          const timesPart = parts[1].split('-');
          timeFrom = timesPart[0]?.trim() || '08:00';
          timeTo = timesPart[1]?.trim() || '17:00';
        }
      }
    } catch (e) { }

    setFormData({
      name: clinic.name || '',
      address: clinic.address || '',
      phoneNumber: clinic.phoneNumber || '',
      description: clinic.description || '',
      operatingDays: clinic.operatingDays || [],
      daysFrom, daysTo, timeFrom, timeTo,
      location: null
    });
    setCurrentEditId(clinic._id);
    setIsEditPopupOpen(true);
  };

  const handleEditClose = () => {
    setIsEditPopupOpen(false);
    setCurrentEditId(null);
    setFormData(prev => ({
      ...prev,
      name: '', address: '', phoneNumber: '', description: '',
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      daysFrom: 'Monday', daysTo: 'Friday', timeFrom: '08:00', timeTo: '17:00'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleOperatingDay = (day) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.phoneNumber) {
      Swal.fire('Validation Error', 'Clinic name, address, and phone number are required', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const operatingHours = `${formData.daysFrom} - ${formData.daysTo} | ${formData.timeFrom} - ${formData.timeTo}`;
      const startIndex = days.indexOf(formData.daysFrom);
      const endIndex = days.indexOf(formData.daysTo);
      const computedOperatingDays = days.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);

      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        operatingDays: computedOperatingDays,
        operatingHours: operatingHours,
        description: formData.description.trim(),
        location: formData.location ? { type: 'Point', coordinates: [formData.location.lng, formData.location.lat] } : undefined
      };

      await api.post('/vets/clinics', payload);
      Swal.fire({ title: 'Success!', text: 'Clinic registered successfully', icon: 'success', timer: 2000, showConfirmButton: false });
      handleClosePopup();
      fetchClinics();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Could not create clinic', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!formData.name || !formData.address || !formData.phoneNumber) {
      Swal.fire('Validation Error', 'Clinic name, address, and phone number are required', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const operatingHours = `${formData.daysFrom} - ${formData.daysTo} | ${formData.timeFrom} - ${formData.timeTo}`;
      const startIndex = days.indexOf(formData.daysFrom);
      const endIndex = days.indexOf(formData.daysTo);
      const computedOperatingDays = days.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);

      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        operatingDays: computedOperatingDays,
        operatingHours: operatingHours,
        description: formData.description.trim()
      };

      await api.put(`/clinics/${currentEditId}`, payload);
      Swal.fire({ title: 'Success!', text: 'Clinic updated successfully', icon: 'success', timer: 2000, showConfirmButton: false });
      handleEditClose();
      fetchClinics();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Could not update clinic', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleViewPets = (clinicId) => {
    navigate(`/vet/pets?clinicId=${encodeURIComponent(clinicId)}`);
  };

  const filteredClinics = clinics.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedClinics = filteredClinics.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, p: isMobile ? 1 : 2 }}>
          <ContentContainer>
            <SearchSection>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>My Clinics</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => {
                    if (newMode !== null) setViewMode(newMode);
                  }}
                  size="small"
                  sx={{
                    bgcolor: 'white',
                    height: 40,
                    '& .MuiToggleButton-root': {
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      '&.Mui-selected': {
                        bgcolor: alpha('#49149e', 0.1),
                        color: '#49149e',
                        '&:hover': { bgcolor: alpha('#49149e', 0.15) }
                      }
                    }
                  }}
                >
                  <ToggleButton value="list"><ViewListIcon /></ToggleButton>
                  <ToggleButton value="card"><ViewModuleIcon /></ToggleButton>
                </ToggleButtonGroup>
                <TextField
                  size="small"
                  placeholder="Search clinics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <StyledButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenPopup}
                >
                  Create New Clinic
                </StyledButton>
              </Box>
            </SearchSection>

            {viewMode === 'list' ? (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableHeadRow>
                      <TableCell />
                      <TableHeadCell>Name</TableHeadCell>
                      <TableHeadCell>Address</TableHeadCell>
                      <TableHeadCell>Phone</TableHeadCell>
                      <TableHeadCell>Actions</TableHeadCell>
                    </TableHeadRow>
                  </TableHead>
                  <TableBody>
                    {paginatedClinics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>No clinics found</TableCell>
                      </TableRow>
                    ) : (
                      paginatedClinics.map((clinic) => (
                        <React.Fragment key={clinic._id}>
                          <TableRowStyled>
                            <TableCell>
                              <IconButton onClick={() => handleExpandRow(clinic._id)}>
                                <ExpandMoreIcon sx={{ transform: expandedRow === clinic._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                              </IconButton>
                            </TableCell>
                            <TableCell><Typography fontWeight="bold">{clinic.name}</Typography></TableCell>
                            <TableCell>{clinic.address}</TableCell>
                            <TableCell>{clinic.phoneNumber}</TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <Button size="small" variant="outlined" startIcon={<FaPaw />} onClick={() => handleViewPets(clinic._id)} sx={{ borderRadius: '8px', textTransform: 'none', color: '#8e24aa', borderColor: '#8e24aa' }}>
                                  View Pets
                                </Button>
                                <IconButton color="primary" onClick={() => handleEditOpen(clinic)}><EditIcon /></IconButton>
                              </Box>
                            </TableCell>
                          </TableRowStyled>
                          <TableRow>
                            <TableCell colSpan={5} sx={{ p: 0 }}>
                              <Collapse in={expandedRow === clinic._id}>
                                <DetailsCard>
                                  <Grid container spacing={3} sx={{ p: 2 }} alignItems="stretch">
                                    {/* Left panel: Clinic Info */}
                                    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'white', border: '1px solid #edf2f7', width: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                        <Typography variant="h6" sx={{ color: '#49149e', fontWeight: 700, mb: 2, borderBottom: '2px solid #f0f0f0', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <BusinessIcon /> Clinic Information
                                        </Typography>
                                        <Box sx={{ px: 1, flexGrow: 1 }}>
                                          <InfoRow>
                                            <LocationOnIcon />
                                            <InfoLabel sx={{ minWidth: 105 }}>Address:</InfoLabel>
                                            <InfoValue>{clinic.address || 'N/A'}</InfoValue>
                                          </InfoRow>
                                          <InfoRow>
                                            <PhoneIcon />
                                            <InfoLabel sx={{ minWidth: 105 }}>Phone:</InfoLabel>
                                            <InfoValue>{clinic.phoneNumber || 'N/A'}</InfoValue>
                                          </InfoRow>
                                          <InfoRow>
                                            <DescriptionIcon />
                                            <InfoLabel sx={{ minWidth: 105 }}>Description:</InfoLabel>
                                            <InfoValue sx={{ fontStyle: clinic.description ? 'normal' : 'italic', color: clinic.description ? 'inherit' : '#94a3b8' }}>
                                              {clinic.description || 'No description provided.'}
                                            </InfoValue>
                                          </InfoRow>
                                        </Box>
                                      </Box>
                                    </Grid>

                                    {/* Right panel: Schedule */}
                                    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'white', border: '1px solid #edf2f7', width: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                        <Typography variant="h6" sx={{ color: '#e08c0e', fontWeight: 700, mb: 2, borderBottom: '2px solid #f0f0f0', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <CalendarIcon /> Operating Schedule
                                        </Typography>
                                        <Box sx={{ px: 1, flexGrow: 1 }}>
                                          <InfoRow>
                                            <CalendarIcon />
                                            <InfoLabel sx={{ minWidth: 60 }}>Days:</InfoLabel>
                                            <InfoValue>
                                              {clinic.operatingDays?.length > 1
                                                ? `${clinic.operatingDays[0]} – ${clinic.operatingDays[clinic.operatingDays.length - 1]}`
                                                : clinic.operatingDays?.[0] || 'N/A'}
                                            </InfoValue>
                                          </InfoRow>
                                          <InfoRow>
                                            <AccessTimeIcon />
                                            <InfoLabel sx={{ minWidth: 60 }}>Hours:</InfoLabel>
                                            <InfoValue>{clinic.operatingHours || 'N/A'}</InfoValue>
                                          </InfoRow>
                                          <Divider sx={{ my: 1.5 }} />
                                          <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '4px solid #e08c0e' }}>
                                            <Typography variant="body2" fontWeight="700" color="#64748b" sx={{ mb: 0.5 }}>Operating Days</Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                              {(clinic.operatingDays || []).map(day => (
                                                <DayChip key={day} active={true}>{day.slice(0, 3)}</DayChip>
                                              ))}
                                            </Box>
                                          </Box>
                                        </Box>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </DetailsCard>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 3,
                mb: 3
              }}>
                {paginatedClinics.length === 0 ? (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <Typography variant="body1" align="center" sx={{ py: 8, color: '#64748b' }}>No clinics found</Typography>
                  </Box>
                ) : (
                  paginatedClinics.map((clinic) => (
                    <Box key={clinic._id} sx={{ height: '100%' }}>
                      <Card sx={{
                        borderRadius: '16px',
                        boxShadow: 'none',
                        border: '1px solid #e2e8f0',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }
                      }}>
                        <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
                          <Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b', mb: 2 }}>{clinic.name}</Typography>

                          <Stack spacing={1.5} mb={3}>
                            <Box display="flex" alignItems="flex-start" gap={1}>
                              <LocationOnOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18, mt: 0.2 }} />
                              <Typography variant="body2" color="#64748b">{clinic.address}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <PhoneOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                              <Typography variant="body2" color="#475569" fontWeight="500">{clinic.phoneNumber}</Typography>
                            </Box>
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                              <AccessTimeOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18, mt: 0.2 }} />
                              <Box>
                                <Typography variant="body2" color="#475569" fontWeight="500">
                                  {clinic.operatingDays?.length > 1 ? `${clinic.operatingDays[0]} - ${clinic.operatingDays[clinic.operatingDays.length - 1]}` : clinic.operatingDays?.[0]}
                                </Typography>
                                <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                                  {clinic.operatingHours}
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>

                          <Box sx={{ p: 2, bgcolor: alpha('#49149e', 0.05), borderRadius: '12px', mb: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <FaPaw size={14} style={{ color: '#49149e' }} />
                              <Typography variant="body2" fontWeight="700" sx={{ color: '#49149e' }}>Pets</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="800" sx={{ color: '#49149e' }}>
                              {clinic.petsCount || 0}
                            </Typography>
                          </Box>
                        </CardContent>

                        <Box sx={{ p: 3, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Button
                            variant="contained"
                            onClick={() => handleViewPets(clinic.name)}
                            fullWidth
                            sx={{
                              borderRadius: '12px',
                              textTransform: 'none',
                              background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
                              color: 'white',
                              fontWeight: 700,
                              py: 1.2,
                              justifyContent: 'space-between',
                              px: 3,
                              boxShadow: '0 10px 25px rgba(142, 36, 170, 0.15)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 15px 30px rgba(142, 36, 170, 0.25)'
                              },
                              '&:active': { transform: 'translateY(0)' }
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <FaPaw size={16} />
                              <Typography fontWeight="700">View Pets</Typography>
                            </Box>
                            <ChevronRightIcon fontSize="small" />
                          </Button>

                          <Button
                            variant="outlined"
                            onClick={() => handleEditOpen(clinic)}
                            startIcon={<EditOutlinedIcon />}
                            fullWidth
                            sx={{
                              borderRadius: '12px',
                              textTransform: 'none',
                              color: '#64748b',
                              borderColor: '#e2e8f0',
                              fontWeight: 600,
                              py: 0.8,
                              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                            }}
                          >
                            Edit
                          </Button>
                        </Box>
                      </Card>
                    </Box>
                  ))
                )}
              </Box>
            )}
            <CustomPagination count={filteredClinics.length} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, p) => setPage(p)} />
          </ContentContainer>
        </Box>

        {/* Add Clinic Popup */}
        <Dialog
          open={isAddPopupOpen}
          onClose={handleClosePopup}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '24px', overflow: 'hidden' }
          }}
        >
          <DialogTitle sx={{
            color: '#1e293b',
            fontWeight: 800,
            pb: 1,
            px: 4,
            pt: 4
          }}>
            Register New Clinic
          </DialogTitle>
          <DialogContent sx={{ p: 4, pt: 1, bgcolor: '#fbfcfd' }}>
            <Grid container spacing={4}>
              {/* Left Column: All Fundamental Info Fields */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, color: '#49149e', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ fontSize: 18 }} /> Fundamental Info
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Clinic Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Clinic Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Stack>
              </Grid>

              {/* Right Column: Operations */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, color: '#49149e', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 18 }} /> Operational Schedules
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                      Operating Days
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Select size="small" fullWidth name="daysFrom" value={formData.daysFrom} onChange={handleChange} sx={{ borderRadius: '10px' }}>
                        {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                      </Select>
                      <Typography variant="body2" fontWeight="bold">to</Typography>
                      <Select size="small" fullWidth name="daysTo" value={formData.daysTo} onChange={handleChange} sx={{ borderRadius: '10px' }}>
                        {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                      </Select>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                      Operating Hours
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField size="small" fullWidth type="time" name="timeFrom" value={formData.timeFrom} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                      <Typography variant="body2" fontWeight="bold">to</Typography>
                      <TextField size="small" fullWidth type="time" name="timeTo" value={formData.timeTo} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                    </Stack>
                  </Box>
                </Stack>
                <Box sx={{ mt: 4, p: 2, bgcolor: alpha('#49149e', 0.03), borderRadius: '16px', border: '1px dashed', borderColor: alpha('#49149e', 0.2) }}>
                  <Typography variant="caption" color="#49149e" fontWeight="600">
                    ⚠️ Note: These hours will be displayed on your clinic profile for pet owners.
                  </Typography>
                </Box>
              </Grid>

              {/* Full Width: Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Clinic Description (Optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, bgcolor: '#fbfcfd', borderTop: '1px solid #f1f5f9', gap: 2 }}>
            <Button
              onClick={handleClosePopup}
              sx={{
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                borderRadius: '10px'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                bgcolor: '#49149e',
                '&:hover': { bgcolor: '#3a1080' },
                borderRadius: '12px',
                px: 6,
                py: 1.5,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(73, 20, 158, 0.25)'
              }}
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Clinic Popup */}
        <Dialog
          open={isEditPopupOpen}
          onClose={handleEditClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '24px', overflow: 'hidden' }
          }}
        >
          <DialogTitle sx={{
            color: '#1e293b',
            fontWeight: 800,
            pb: 1,
            px: 4,
            pt: 4
          }}>
            Edit Clinic Data
          </DialogTitle>
          <DialogContent sx={{ p: 4, pt: 1, bgcolor: '#fbfcfd' }}>
            <Grid container spacing={4}>
              {/* Left Column: All Fundamental Info Fields */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, color: '#49149e', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ fontSize: 18 }} /> Fundamental Info
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Clinic Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Clinic Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Stack>
              </Grid>

              {/* Right Column: Operations */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, color: '#49149e', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 18 }} /> Operational Schedules
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                      Operating Days
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Select size="small" fullWidth name="daysFrom" value={formData.daysFrom} onChange={handleChange} sx={{ borderRadius: '10px' }}>
                        {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                      </Select>
                      <Typography variant="body2" fontWeight="bold">to</Typography>
                      <Select size="small" fullWidth name="daysTo" value={formData.daysTo} onChange={handleChange} sx={{ borderRadius: '10px' }}>
                        {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                      </Select>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                      Operating Hours
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField size="small" fullWidth type="time" name="timeFrom" value={formData.timeFrom} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                      <Typography variant="body2" fontWeight="bold">to</Typography>
                      <TextField size="small" fullWidth type="time" name="timeTo" value={formData.timeTo} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                    </Stack>
                  </Box>
                </Stack>
                <Box sx={{ mt: 4, p: 2, bgcolor: alpha('#49149e', 0.03), borderRadius: '16px', border: '1px dashed', borderColor: alpha('#49149e', 0.2) }}>
                  <Typography variant="caption" color="#49149e" fontWeight="600">
                    ⚠️ Note: These hours will be displayed on your clinic profile for pet owners.
                  </Typography>
                </Box>
              </Grid>

              {/* Full Width: Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Clinic Description (Optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, bgcolor: '#fbfcfd', borderTop: '1px solid #f1f5f9', gap: 2 }}>
            <Button
              onClick={handleEditClose}
              sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, borderRadius: '10px' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSubmit}
              disabled={isSubmitting}
              sx={{
                bgcolor: '#49149e',
                '&:hover': { bgcolor: '#3a1080' },
                borderRadius: '12px',
                px: 6,
                py: 1.5,
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(73, 20, 158, 0.25)'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Edits'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ClinicList;