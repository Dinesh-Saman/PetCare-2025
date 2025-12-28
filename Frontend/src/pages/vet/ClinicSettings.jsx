import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import {
  Box, Typography, TextField, Button, Grid, Card, CardContent, Paper,
  InputAdornment, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}));

const ContentArea = styled(Box)(({ theme }) => ({
  padding: '40px',
  flexGrow: 1,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  color: '#49149eff',
  textAlign: 'center',
  marginBottom: 40,
  fontSize: '2.8rem',
}));

const ClinicListCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 50px rgba(142, 36, 170, 0.2)',
  },
}));

const SelectedClinicCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 12px 40px rgba(142, 36, 170, 0.15)',
  overflow: 'hidden',
  border: '3px solid #8e24aa',
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
}));

const ClinicSettings = () => {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
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
    const fetchClinics = async () => {
      try {
        // This endpoint should return all clinics the vet has access to
        const response = await api.get('/clinics/my'); // You'll create this backend route
        const clinicsData = response.data.clinics || response.data || [];
        
        setClinics(clinicsData);

        // Auto-select first clinic if exists
        if (clinicsData.length > 0 && !selectedClinic) {
          handleSelectClinic(clinicsData[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching clinics:', error);
        Swal.fire('Error', 'Could not load your clinics', 'error');
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const handleSelectClinic = (clinic) => {
    setSelectedClinic(clinic);
    setFormData({
      name: clinic.name || '',
      address: clinic.address || '',
      phoneNumber: clinic.phoneNumber || '',
      operatingHours: clinic.operatingHours || '',
      description: clinic.description || '',
      location: {
        lng: clinic.location?.coordinates[0] || '',
        lat: clinic.location?.coordinates[1] || ''
      }
    });
  };

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

    if (formData.location.lng && formData.location.lat) {
      updateData.location = {
        type: 'Point',
        coordinates: [
          parseFloat(formData.location.lng),
          parseFloat(formData.location.lat)
        ]
      };
    }

    // ← CHANGE THIS LINE: patch → put
    await api.put(`/clinics/${selectedClinic._id}`, updateData);

    // Update local state
    setClinics(prev => prev.map(c => 
      c._id === selectedClinic._id ? { ...c, ...updateData } : c
    ));
    setSelectedClinic(prev => ({ ...prev, ...updateData }));

    Swal.fire('Saved!', 'Clinic settings updated successfully', 'success');
  } catch (error) {
    console.error('Error saving clinic:', error);
    Swal.fire('Error', error.response?.data?.message || 'Could not save changes', 'error');
  } finally {
    setSaving(false);
  }
};

  return (
    <PageContainer sx={{ display: 'flex' }}>
      <Sidebar />
      <ContentWrapper>
        <ContentArea>
          <SectionTitle variant="h4">
            My Clinics
          </SectionTitle>

          {clinics.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 20 }}>
              <BusinessIcon sx={{ fontSize: 100, color: '#ccc', mb: 3 }} />
              <Typography variant="h5" color="textSecondary" gutterBottom>
                No clinics yet
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Create your first clinic to get started!
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={4}>
              {/* Clinic List */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#8e24aa', mb: 2 }}>
                  Select a Clinic to Edit
                </Typography>
                {clinics.map((clinic) => (
                  <ClinicListCard
                    key={clinic._id}
                    onClick={() => handleSelectClinic(clinic)}
                    sx={{
                      mb: 2,
                      border: selectedClinic?._id === clinic._id ? '3px solid #8e24aa' : 'none'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">
                        {clinic.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {clinic.address || 'Address not set'}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={
                            clinic.primaryVetId?.toString() === JSON.parse(localStorage.getItem('user') || '{}').id
                              ? 'Primary Vet'
                              : 'Staff Member'
                          }
                          color={
                            clinic.primaryVetId?.toString() === JSON.parse(localStorage.getItem('user') || '{}').id
                              ? 'secondary'
                              : 'default'
                          }
                          size="small"r
                        />
                      </Box>
                    </CardContent>
                  </ClinicListCard>
                ))}
              </Grid>

              {/* Edit Form */}
              <Grid item xs={12} md={8}>
                {selectedClinic ? (
                  <SelectedClinicCard>
                    <CardHeader>
                      <BusinessIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {selectedClinic.name}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Edit clinic information
                        </Typography>
                      </Box>
                      <EditIcon sx={{ fontSize: 32, ml: 'auto' }} />
                    </CardHeader>

                    <CardContent sx={{ pt: 6 }}>
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Clinic Name"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BusinessIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleInputChange('phoneNumber')}
                            required
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
                            required
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
                            placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                            multiline
                            rows={2}
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
                            placeholder="Tell pet owners about your clinic..."
                          />
                        </Grid>

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
                                type="number"
                                step="any"
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <SaveButton onClick={handleSave} disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </SaveButton>
                      </Box>
                    </CardContent>
                  </SelectedClinicCard>
                ) : (
                  <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 20 }}>
                    <BusinessIcon sx={{ fontSize: 80, color: '#ccc', mb: 3 }} />
                    <Typography variant="h6" color="textSecondary">
                      Select a clinic from the list to edit
                    </Typography>
                  </Paper>
                )}
              </Grid>
            </Grid>
          )}
        </ContentArea>
      </ContentWrapper>
    </PageContainer>
  );
};

export default ClinicSettings;