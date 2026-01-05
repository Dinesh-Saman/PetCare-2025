// src/pages/vet/ClinicEdit.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import {
  Box, Typography, TextField, Button, Paper, InputAdornment, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(6),
  },
}));

const FormCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1100px',
  borderRadius: '20px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  overflow: 'hidden',
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

const ClinicEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        const response = await api.get(`/clinics/${id}`);
        const clinicData = response.data;

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
      <PageContainer sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} thickness={4} />
      </PageContainer>
    );
  }

  if (!clinic) {
    return null;
  }

  return (
    <PageContainer>
      <Sidebar />
      <ContentArea>
        <FormCard>
          <CardHeader>
            <HeaderTitle variant="h4">
              Edit Clinic
            </HeaderTitle>
            <HeaderSubtitle>
              Update information for {clinic.name}
            </HeaderSubtitle>
          </CardHeader>

          <CardBody>
            <BackButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vet/clinic-settings')}
            >
              Back to Clinic Settings
            </BackButton>

            {/* Bootstrap Grid Layout - Perfect Balance */}
            <div className="row g-4">
              {/* Left Column */}
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
                      placeholder="e.g., Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM"
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
                </div>
              </div>

              {/* Right Column */}
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
                {saving ? 'Saving Changes...' : 'Save Clinic Settings'}
              </SaveButton>
            </Box>
          </CardBody>
        </FormCard>
      </ContentArea>
    </PageContainer>
  );
};

export default ClinicEdit;