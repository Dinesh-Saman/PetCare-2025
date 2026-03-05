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
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack
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
  Delete as DeleteIcon
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
  borderRadius: 12,
  boxShadow: '0px 0px 15px rgba(0,0,0,0.1)',
  flex: 1,
  margin: '20px',
  padding: '30px',
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
  minWidth: 140,
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

const ClinicList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
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
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        operatingDays: formData.operatingDays,
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
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        operatingDays: formData.operatingDays,
        operatingHours: operatingHours,
        description: formData.description.trim()
      };

      await api.put(`/vets/clinics/${currentEditId}`, payload);
      Swal.fire({ title: 'Success!', text: 'Clinic updated successfully', icon: 'success', timer: 2000, showConfirmButton: false });
      handleEditClose();
      fetchClinics();
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Could not update clinic', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/vets/clinics/${id}`);
        Swal.fire('Deleted!', 'Clinic has been deleted.', 'success');
        fetchClinics();
      } catch (error) {
        Swal.fire('Error!', error.response?.data?.message || 'Could not delete clinic.', 'error');
      }
    }
  };

  const handleViewPets = (clinicName) => {
    navigate(`/vet/pets?clinic=${encodeURIComponent(clinicName)}`);
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
        <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
          <ContentContainer>
            <SearchSection>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#49149e' }}>My Clinics</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search clinics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 300 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenPopup}
                  sx={{ bgcolor: '#8e24aa', '&:hover': { bgcolor: '#7b1fa2' } }}
                >
                  Add Clinic
                </Button>
              </Box>
            </SearchSection>

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
                              <Button size="small" variant="outlined" startIcon={<FaPaw />} onClick={() => handleViewPets(clinic.name)} sx={{ borderRadius: '8px', textTransform: 'none', color: '#8e24aa', borderColor: '#8e24aa' }}>
                                View Pets
                              </Button>
                              <IconButton color="primary" onClick={() => handleEditOpen(clinic)}><EditIcon /></IconButton>
                              <IconButton color="error" onClick={() => handleDelete(clinic._id)}><DeleteIcon /></IconButton>
                            </Box>
                          </TableCell>
                        </TableRowStyled>
                        <TableRow>
                          <TableCell colSpan={5} sx={{ p: 0 }}>
                            <Collapse in={expandedRow === clinic._id}>
                              <Box sx={{ p: 3 }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#49149e', mb: 1 }}>Clinic Info</Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>{clinic.description || 'No description'}</Typography>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#49149e', mb: 1 }}>Schedules</Typography>
                                    <Stack spacing={1}>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <CalendarIcon sx={{ fontSize: 18, color: '#8e24aa' }} />
                                        <Typography variant="body2" fontWeight="600">{clinic.operatingDays?.join(', ') || 'N/A'}</Typography>
                                      </Box>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <AccessTimeIcon sx={{ fontSize: 18, color: '#8e24aa' }} />
                                        <Typography variant="body2">{clinic.operatingHours}</Typography>
                                      </Box>
                                    </Stack>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
            background: 'linear-gradient(135deg, #49149e 0%, #8e24aa 100%)',
            color: 'white',
            fontWeight: 800,
            py: 3,
            px: 4
          }}>
            Register New Clinic
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: '#fbfcfd' }}>
            <Grid container spacing={4}>
              {/* Fundamentals Column */}
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2.5, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ color: '#49149e' }} /> Fundamental Info
                </Typography>
                <Stack spacing={2.5}>
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
                    rows={4}
                    label="Precise Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
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
                </Stack>
              </Grid>

              {/* Operations Column */}
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2.5, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: '#49149e' }} /> Operational Schedules
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                    Select Working Days
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {days.map(day => (
                      <DayChip
                        key={day}
                        active={formData.operatingDays.includes(day)}
                        onClick={() => toggleOperatingDay(day)}
                      >
                        {formData.operatingDays.includes(day) ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <UncheckedIcon sx={{ fontSize: 16 }} />}
                        {day}
                      </DayChip>
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                    Define Hours Range
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Select size="small" fullWidth name="daysFrom" value={formData.daysFrom} onChange={handleChange} sx={{ borderRadius: '10px' }}>
                          {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </Select>
                        <Typography variant="body2" fontWeight="bold">to</Typography>
                        <Select size="small" fullWidth name="daysTo" value={formData.daysTo} onChange={handleChange} sx={{ borderRadius: '10px' }}>
                          {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField size="small" fullWidth type="time" name="timeFrom" value={formData.timeFrom} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                        <Typography variant="body2" fontWeight="bold">to</Typography>
                        <TextField size="small" fullWidth type="time" name="timeTo" value={formData.timeTo} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mt: 4, p: 2, bgcolor: alpha('#49149e', 0.03), borderRadius: '16px', border: '1px dashed', borderColor: alpha('#49149e', 0.2) }}>
                  <Typography variant="caption" color="#49149e" fontWeight="600">
                    ⚠️ Note: These hours will be displayed on your clinic profile for pet owners.
                  </Typography>
                </Box>
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
            background: 'linear-gradient(135deg, #49149e 0%, #8e24aa 100%)',
            color: 'white',
            fontWeight: 800,
            py: 3,
            px: 4
          }}>
            Edit Clinic Data
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: '#fbfcfd' }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2.5, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ color: '#49149e' }} /> Fundamental Info
                </Typography>
                <Stack spacing={2.5}>
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
                    rows={4}
                    label="Precise Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
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
                </Stack>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2.5, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: '#49149e' }} /> Operational Schedules
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                    Select Working Days
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {days.map(day => (
                      <DayChip
                        key={day}
                        active={formData.operatingDays.includes(day)}
                        onClick={() => toggleOperatingDay(day)}
                      >
                        {formData.operatingDays.includes(day) ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <UncheckedIcon sx={{ fontSize: 16 }} />}
                        {day}
                      </DayChip>
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                    Define Hours Range
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Select size="small" fullWidth name="daysFrom" value={formData.daysFrom} onChange={handleChange} sx={{ borderRadius: '10px' }}>
                          {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </Select>
                        <Typography variant="body2" fontWeight="bold">to</Typography>
                        <Select size="small" fullWidth name="daysTo" value={formData.daysTo} onChange={handleChange} sx={{ borderRadius: '10px' }}>
                          {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                        </Select>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField size="small" fullWidth type="time" name="timeFrom" value={formData.timeFrom} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                        <Typography variant="body2" fontWeight="bold">to</Typography>
                        <TextField size="small" fullWidth type="time" name="timeTo" value={formData.timeTo} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ mt: 4, p: 2, bgcolor: alpha('#49149e', 0.03), borderRadius: '16px', border: '1px dashed', borderColor: alpha('#49149e', 0.2) }}>
                  <Typography variant="caption" color="#49149e" fontWeight="600">
                    ⚠️ Note: These hours will be displayed on your clinic profile for pet owners.
                  </Typography>
                </Box>
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