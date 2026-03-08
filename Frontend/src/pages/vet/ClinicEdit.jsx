// src/pages/vet/ClinicEdit.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import {
  Box, Typography, TextField, Button, Paper, InputAdornment, CircularProgress, useTheme, useMediaQuery, Grid
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
}));

const FormCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1100px',
  borderRadius: '20px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
}));

const CardHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
  color: 'white',
  padding: theme.spacing(5, 4),
  textAlign: 'center',
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  fontSize: '2.6rem',
  marginBottom: '8px',
}));

const HeaderSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.3rem',
  opacity: 0.95,
}));

const CardBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 8),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  marginBottom: '30px',
  textTransform: 'none',
  fontWeight: 'bold',
  color: '#8e24aa',
  fontSize: '1.1rem',
}));

const SaveButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
  color: 'white',
  padding: '16px 50px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.3rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
  minWidth: '280px',
  '&:hover': {
    background: 'linear-gradient(90deg, #388e3c, #4caf50)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(76, 175, 80, 0.4)',
  },
  '&.Mui-disabled': {
    background: '#ccc',
    boxShadow: 'none',
  },
}));

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

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ClinicEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [clinic, setClinic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    operatingHours: '',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    description: '',
    location: { lng: '', lat: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const response = await api.get(`/clinics/${id}`);
        const clinicData = response.data;

        setClinic(clinicData);
        setFormData({
          name: clinicData.name || '',
          address: clinicData.address || '',
          phoneNumber: clinicData.phoneNumber || '',
          operatingHours: clinicData.operatingHours || '',
          operatingDays: clinicData.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          description: clinicData.description || '',
          location: {
            lng: clinicData.location?.coordinates[0] || '',
            lat: clinicData.location?.coordinates[1] || ''
          }
        });
      } catch (error) {
        console.error('Error fetching clinic:', error);
        Swal.fire('Error', 'Could not load clinic details', 'error');
        navigate('/vet/clinic-settings');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClinic();
  }, [id, navigate]);

  const handleChange = (field) => (e) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: e.target.value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }
  };

  const toggleOperatingDay = (day) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.address.trim() || !formData.phoneNumber.trim()) {
      Swal.fire('Validation Error', 'Clinic name, address, and phone number are required', 'warning');
      return;
    }

    setSaving(true);

    try {
      const updatePayload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        operatingHours: formData.operatingHours.trim(),
        operatingDays: formData.operatingDays,
        description: formData.description.trim(),
      };

      if (formData.location.lng && formData.location.lat) {
        updatePayload.location = {
          type: 'Point',
          coordinates: [
            parseFloat(formData.location.lng),
            parseFloat(formData.location.lat)
          ]
        };
      }

      await api.put(`/clinics/${id}`, updatePayload);

      Swal.fire({
        title: 'Saved!',
        text: 'Clinic information updated successfully',
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });

      navigate('/vet/clinic-settings');
    } catch (error) {
      console.error('Error saving clinic:', error);
      Swal.fire('Error', error.response?.data?.message || 'Could not save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <VetAdminNavbar />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      </PageContainer>
    );
  }

  if (!clinic) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 4, display: 'flex', justifyContent: 'center' }}>
          <FormCard>
            <CardHeader>
              <HeaderTitle variant="h4">Edit Clinic</HeaderTitle>
              <HeaderSubtitle>Update information for {clinic.name}</HeaderSubtitle>
            </CardHeader>

            <CardBody>
              <BackButton startIcon={<ArrowBackIcon />} onClick={() => navigate('/vet/clinic-settings')} size="small">
                Back to Clinic Settings
              </BackButton>

              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <div className="row g-4">
                    <div className="col-12">
                      <TextField
                        fullWidth
                        label="Clinic Name *"
                        value={formData.name}
                        onChange={handleChange('name')}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <TextField
                        fullWidth
                        label="Phone Number *"
                        value={formData.phoneNumber}
                        onChange={handleChange('phoneNumber')}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <TextField
                        fullWidth
                        label="Full Address *"
                        value={formData.address}
                        onChange={handleChange('address')}
                        multiline
                        rows={4}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                              <LocationOnIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <TextField
                        fullWidth
                        label="Operating Hours"
                        value={formData.operatingHours}
                        onChange={handleChange('operatingHours')}
                        placeholder="e.g., 8:00 AM - 6:00 PM"
                        multiline
                        rows={3}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <AccessTimeIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>

                    <div className="col-12">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon color="primary" /> Operating Days
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {daysOfWeek.map(day => (
                          <DayChip
                            key={day}
                            active={formData.operatingDays.includes(day)}
                            onClick={() => toggleOperatingDay(day)}
                          >
                            {formData.operatingDays.includes(day) ? <CheckCircleIcon fontSize="small" /> : <UncheckedIcon fontSize="small" />}
                            {day.substring(0, 3)}
                          </DayChip>
                        ))}
                      </Box>
                    </div>

                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <div className="row g-4">
                    <div className="col-12">
                      <TextField
                        fullWidth
                        label="Clinic Description"
                        value={formData.description}
                        onChange={handleChange('description')}
                        multiline
                        rows={8}
                        placeholder="Tell pet owners about your clinic, services, team, or special care..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                              <DescriptionIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#8e24aa', mb: 2 }}>
                        Clinic Location on Map (Optional)
                      </Typography>
                      <div className="row g-3">
                        <div className="col-12 col-sm-6">
                          <TextField
                            fullWidth
                            label="Longitude (lng)"
                            value={formData.location.lng}
                            onChange={handleChange('location.lng')}
                            type="number"
                            inputProps={{ step: "0.000001" }}
                            placeholder="e.g., 80.123456"
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <TextField
                            fullWidth
                            label="Latitude (lat)"
                            value={formData.location.lat}
                            onChange={handleChange('location.lat')}
                            type="number"
                            inputProps={{ step: "0.000001" }}
                            placeholder="e.g., 6.123456"
                          />
                        </div>
                      </div>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                        Leave blank to hide clinic on the map
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <Box sx={{ textAlign: 'center', mt: 8 }}>
                <SaveButton onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Clinic Settings'}
                </SaveButton>
              </Box>
            </CardBody>
          </FormCard>
        </Box>
      </Box>
    </Box>
  );
};

export default ClinicEdit;
