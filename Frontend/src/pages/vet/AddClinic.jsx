// src/pages/vet/AddNewClinic.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import {
  Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Styled Components - Identical to AddNewStaff
const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
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
  padding: theme.spacing(5, 3),
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 2),
  },
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  fontSize: '2.4rem',
  marginBottom: '8px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const HeaderSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  opacity: 0.95,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

const CardBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 4, 6),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6, 8),
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  marginBottom: '30px',
  textTransform: 'none',
  fontWeight: 'bold',
  color: '#8e24aa',
  fontSize: '1.1rem',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
  color: 'white',
  padding: theme.spacing(2.5, 8),
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.3rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(142, 36, 170, 0.3)',
  minWidth: '320px',
  '&:hover': {
    background: 'linear-gradient(90deg, #7b1fa2, #9c27b0)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(142, 36, 170, 0.4)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const ClearButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #f44336, #ef5350)',
  color: 'white',
  padding: theme.spacing(2.5, 8),
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.3rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
  minWidth: '320px',
  '&:hover': {
    background: 'linear-gradient(90deg, #d32f2f, #f44336)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(244, 67, 54, 0.4)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddNewClinic = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    daysFrom: 'Monday',
    daysTo: 'Friday',
    timeFrom: '08:00',
    timeTo: '17:00',
    description: '',
    location: null
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: { lng: longitude, lat: latitude }
          }));
        },
        () => {}
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      name: '',
      address: '',
      phoneNumber: '',
      daysFrom: 'Monday',
      daysTo: 'Friday',
      timeFrom: '08:00',
      timeTo: '17:00',
      description: '',
      location: null
    });

    Swal.fire({
      title: 'Cleared!',
      text: 'All fields have been reset.',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.phoneNumber) {
      Swal.fire('Validation Error', 'Clinic name, address, and phone number are required', 'warning');
      return;
    }

    setLoading(true);

    try {
      const operatingHours = `${formData.daysFrom} - ${formData.daysTo} | ${formData.timeFrom} - ${formData.timeTo}`;

      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        operatingHours: operatingHours.trim(),
        description: formData.description.trim(),
      };

      if (formData.location) {
        payload.location = {
          type: 'Point',
          coordinates: [formData.location.lng, formData.location.lat]
        };
      }

      await api.post('/clinics', payload);

      Swal.fire({
        title: 'Clinic Created!',
        text: `${formData.name} has been successfully created!`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });

      navigate('/vet/clinic-settings');
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Could not create clinic', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Sidebar />
      <ContentArea>
        <FormCard>
          <CardHeader>
            <HeaderTitle variant="h4">
              Create Your Clinic
            </HeaderTitle>
            <HeaderSubtitle>
              Set up your veterinary practice in just a few steps
            </HeaderSubtitle>
          </CardHeader>

          <CardBody>
            <BackButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vet/clinic-settings')}
            >
              Back to Clinic Settings
            </BackButton>

            {/* Bootstrap Grid Layout - Exactly like AddNewStaff */}
            <div className="row g-4">
              {/* LEFT COLUMN */}
              <div className="col-12 col-lg-6">
                <div className="row g-4">
                  <div className="col-12">
                    <TextField
                      fullWidth
                      label="Clinic Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Clinic Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="col-12 col-lg-6">
                <div className="row g-4">
                  <div className="col-12">
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Clinic Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell pet owners about your services, team, and care philosophy..."
                    />
                  </div>
                  {/* Operating Days From & To */}
                  <div className="col-12">
                    <div className="row g-3">
                      <div className="col-6">
                        <FormControl fullWidth>
                          <InputLabel>Operating Days From</InputLabel>
                          <Select
                            name="daysFrom"
                            value={formData.daysFrom}
                            onChange={handleChange}
                            label="Operating Days From"
                            startAdornment={<CalendarTodayIcon sx={{ color: '#666', mr: 2 }} />}
                          >
                            {days.map(day => (
                              <MenuItem key={day} value={day}>{day}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                      <div className="col-6">
                        <FormControl fullWidth>
                          <InputLabel>Operating Days To</InputLabel>
                          <Select
                            name="daysTo"
                            value={formData.daysTo}
                            onChange={handleChange}
                            label="Operating Days To"
                            startAdornment={<CalendarTodayIcon sx={{ color: '#666', mr: 2 }} />}
                          >
                            {days.map(day => (
                              <MenuItem key={day} value={day}>{day}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                  {/* Opening & Closing Time */}
                  <div className="col-12">
                    <div className="row g-3">
                      <div className="col-6">
                        <TextField
                          fullWidth
                          label="Opening Time"
                          name="timeFrom"
                          type="time"
                          value={formData.timeFrom}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </div>
                      <div className="col-6">
                        <TextField
                          fullWidth
                          label="Closing Time"
                          name="timeTo"
                          type="time"
                          value={formData.timeTo}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons - Full width matching the form fields above */}
            <Box sx={{ mt: { xs: 6, md: 8 } }}>
              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <div className="px-2">
                    <SubmitButton 
                      onClick={handleSubmit} 
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? 'Creating...' : 'Create Clinic'}
                    </SubmitButton>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="px-2">
                    <ClearButton 
                      onClick={handleClear}
                      fullWidth
                    >
                      Clear Form
                    </ClearButton>
                  </div>
                </div>
              </div>
            </Box>
          </CardBody>
        </FormCard>
      </ContentArea>
    </PageContainer>
  );
};

export default AddNewClinic;