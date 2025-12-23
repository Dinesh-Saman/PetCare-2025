import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import {
  Box, Typography, TextField, Button, Grid, Card, CardContent, Paper,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';

// Styled Components
const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 12,
  boxShadow: '0px 0px 15px rgba(0,0,0,0.1)',
  flex: 1,
  margin: '20px',
  padding: '40px',
  display: 'flex',
  flexDirection: 'column',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  color: '#49149eff',
  textAlign: 'center',
  marginBottom: 50,
  fontSize: '2.8rem',
  letterSpacing: '1px',
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  overflow: 'hidden',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
  color: 'white',
  padding: 24,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
}));

const SaveButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
  color: 'white',
  padding: '14px 40px',
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.1rem',
  textTransform: 'none',
  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
  '&:hover': {
    background: 'linear-gradient(90deg, #388e3c, #4caf50)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: '#ccc',
    boxShadow: 'none',
  }
}));

const ClinicSettings = () => {
  const [clinic, setClinic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    operatingHours: '',
    description: '',
    location: { lng: '', lat: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const response = await api.get('/clinic/current'); // Adjust to your endpoint
        const clinicData = response.data.clinic || response.data;
        
        setClinic(clinicData);
        setFormData({
          name: clinicData.name || '',
          address: clinicData.address || '',
          phoneNumber: clinicData.phoneNumber || '',
          operatingHours: clinicData.operatingHours || '',
          description: clinicData.description || '',
          location: {
            lng: clinicData.location?.coordinates[0] || '',
            lat: clinicData.location?.coordinates[1] || ''
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clinic:', error);
        Swal.fire('Error', 'Could not load clinic settings', 'error');
        setLoading(false);
      }
    };

    fetchClinic();
  }, []);

  const handleInputChange = (field) => (e) => {
    if (field.startsWith('location.')) {
      const locField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [locField]: e.target.value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name || !formData.address || !formData.phoneNumber) {
      Swal.fire('Validation Error', 'Name, address, and phone number are required', 'warning');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        operatingHours: formData.operatingHours.trim(),
        description: formData.description.trim(),
      };

      // Only include location if both coordinates are provided
      if (formData.location.lng && formData.location.lat) {
        updateData.location = {
          type: 'Point',
          coordinates: [
            parseFloat(formData.location.lng),
            parseFloat(formData.location.lat)
          ]
        };
      }

      await api.patch(`/clinic/${clinic._id}`, updateData);

      setClinic(prev => ({ ...prev, ...updateData }));
      Swal.fire('Saved!', 'Clinic settings updated successfully', 'success');
    } catch (error) {
      console.error('Error saving clinic:', error);
      Swal.fire('Error', error.response?.data?.message || 'Could not save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa', marginTop: '70px' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h5" color="textSecondary">Loading clinic settings...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa', marginTop: '70px' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <ContentContainer>
          <PageTitle variant="h4">
            Clinic Settings
          </PageTitle>

          <SettingsCard>
            <CardHeader>
              <BusinessIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {clinic?.name || 'My Clinic'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Update your clinic information
                </Typography>
              </Box>
            </CardHeader>

            <CardContent sx={{ pt: 6 }}>
              <Grid container spacing={4}>
                {/* Basic Info */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Clinic Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange('phoneNumber')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <LocationOnIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Operating Hours"
                    value={formData.operatingHours}
                    onChange={handleInputChange('operatingHours')}
                    placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM, Sun: Closed"
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <AccessTimeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Clinic Description"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    multiline
                    rows={4}
                    placeholder="Tell pet owners about your clinic, services, and care philosophy..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Location Fields */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#8e24aa' }}>
                    Clinic Location (Optional)
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        value={formData.location.lng}
                        onChange={handleInputChange('location.lng')}
                        placeholder="e.g., 79.8612"
                        type="number"
                        step="any"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Latitude"
                        value={formData.location.lat}
                        onChange={handleInputChange('location.lat')}
                        placeholder="e.g., 6.9271"
                        type="number"
                        step="any"
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Used for "Find Nearby Clinics" feature
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <SaveButton
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </SaveButton>
              </Box>
            </CardContent>
          </SettingsCard>
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default ClinicSettings;