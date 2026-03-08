// src/pages/vet/AddNewStaff.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import {
  Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Paper, CircularProgress, useTheme, useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
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
    minWidth: 'unset',
  },
}));

const AddNewStaff = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    staffType: 'veterinarian',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    veterinaryId: '',
    specialization: '',
    accessLevel: 'Basic',
    role: 'Receptionist',
    clinicId: ''
  });

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasClinic, setHasClinic] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAndClinics = async () => {
      try {
        const userData = localStorage.getItem('vet_user');
        if (!userData) {
          navigate('/login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'vet') {
          navigate('/login');
          return;
        }

        const response = await api.get('/vets/my-clinics');
        if (response.data.clinics && response.data.clinics.length > 0) {
          setClinics(response.data.clinics);
          setHasClinic(true);
          if (user.clinicId) {
            setFormData(prev => ({ ...prev, clinicId: user.clinicId }));
          } else if (response.data.clinics.length === 1) {
            setFormData(prev => ({ ...prev, clinicId: response.data.clinics[0]._id }));
          }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    loadUserAndClinics();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'staffType') {
      let role = '';
      if (value === 'receptionist') role = 'Receptionist';
      if (value === 'vetTech') role = 'Vet Tech';
      if (value === 'assistant') role = 'Assistant';
      if (value === 'manager') role = 'Manager';
      if (value === 'nurse') role = 'Nurse';
      if (value === 'kennelStaff') role = 'Kennel Staff';
      setFormData(prev => ({ ...prev, staffType: value, role: role }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const required = ['firstName', 'lastName', 'email', 'password', 'phoneNumber'];
    if (formData.staffType === 'veterinarian') required.push('veterinaryId');

    const missing = required.filter(field => !formData[field]?.trim());
    if (missing.length > 0) {
      Swal.fire('Missing Fields', 'Please fill all required fields', 'warning');
      return;
    }

    try {
      const payload = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
      };
      await api.post('/clinics/staff', payload);
      Swal.fire('Success!', 'Staff member added successfully.', 'success');
      navigate('/vet/staff');
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Failed to add staff', 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 4, display: 'flex', justifyContent: 'center' }}>
          <FormCard>
            <CardHeader>
              <HeaderTitle variant="h4">Add Staff Member</HeaderTitle>
              <HeaderSubtitle>Expand your clinic team with skilled professionals</HeaderSubtitle>
            </CardHeader>

            <CardBody>
              <BackButton startIcon={<ArrowBackIcon />} onClick={() => navigate('/vet/staff')} size="small">
                Back to List
              </BackButton>

              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                    <InputLabel>Staff Type</InputLabel>
                    <Select name="staffType" value={formData.staffType} onChange={handleChange} label="Staff Type">
                      <MenuItem value="veterinarian">Veterinarian</MenuItem>
                      <MenuItem value="receptionist">Receptionist</MenuItem>
                      <MenuItem value="vetTech">Vet Technician</MenuItem>
                      <MenuItem value="assistant">Assistant</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="nurse">Nurse</MenuItem>
                      <MenuItem value="kennelStaff">Kennel Staff</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} size="small" sx={{ mb: 3 }} />
                  <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} size="small" sx={{ mb: 3 }} />
                  <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} size="small" sx={{ mb: 3 }} />
                </div>
                <div className="col-12 col-md-6">
                  <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                    <InputLabel>Select Clinic (Optional)</InputLabel>
                    <Select name="clinicId" value={formData.clinicId} onChange={handleChange} label="Select Clinic (Optional)">
                      <MenuItem value=""><em>None selected</em></MenuItem>
                      {clinics.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                    <InputLabel>Access Level</InputLabel>
                    <Select name="accessLevel" value={formData.accessLevel} onChange={handleChange} label="Access Level">
                      <MenuItem value="Basic">Basic</MenuItem>
                      <MenuItem value="Enhanced">Enhanced</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} size="small" sx={{ mb: 3 }} />
                </div>
                <div className="col-12 col-md-6">
                  <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} size="small" sx={{ mb: 3 }} />
                </div>
                {formData.staffType === 'veterinarian' && (
                  <div className="col-12 col-md-6">
                    <TextField fullWidth label="Veterinary License ID" name="veterinaryId" value={formData.veterinaryId} onChange={handleChange} size="small" sx={{ mb: 3 }} />
                  </div>
                )}
              </div>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <SubmitButton onClick={handleSubmit}>
                  Add Staff Member
                </SubmitButton>
              </Box>
            </CardBody>
          </FormCard>
        </Box>
      </Box>
    </Box>
  );
};

export default AddNewStaff;
