// src/pages/vet/AddNewStaff.jsx
import React, { useState } from 'react';
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

// Styled Components (MUI fields + Bootstrap layout via classes)
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
  },
}));

const AddNewStaff = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    veterinaryId: '',
    specialization: '',
    accessLevel: 'Normal Access'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.veterinaryId) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    try {
      await api.post('/vets/subaccount', formData);

      Swal.fire({
        title: 'Success!',
        text: `Dr. ${formData.firstName} ${formData.lastName} has been added to your clinic staff.`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });

      navigate('/vet/clinic-staff');
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Could not add staff member', 'error');
    }
  };

  return (
    <PageContainer>
      <Sidebar />
      <ContentArea>
        <FormCard>
          <CardHeader>
            <HeaderTitle variant="h4">
              Add New Clinic Staff
            </HeaderTitle>
            <HeaderSubtitle>
              Invite a new veterinarian to join your clinic team
            </HeaderSubtitle>
          </CardHeader>

          <CardBody>
            <BackButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vet/clinic-staff')}
            >
              Back to Staff List
            </BackButton>

            {/* Bootstrap Grid Layout + Material UI Fields */}
            <div className="row g-4">
              {/* LEFT COLUMN - 4 Fields */}
              <div className="col-12 col-lg-6">
                <div className="row g-4">
                  <div className="col-12">
                    <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - 4 Fields */}
              <div className="col-12 col-lg-6">
                <div className="row g-4">
                  <div className="col-12">
                    <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <TextField fullWidth label="Veterinary License ID" name="veterinaryId" value={formData.veterinaryId} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <TextField fullWidth label="Specialization (e.g., Surgery, Dermatology)" name="specialization" value={formData.specialization} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <FormControl fullWidth>
                      <InputLabel>Access Level</InputLabel>
                      <Select
                        name="accessLevel"
                        value={formData.accessLevel}
                        onChange={handleChange}
                        label="Access Level"
                      >
                        <MenuItem value="Normal Access">Normal Access</MenuItem>
                        <MenuItem value="Full Access">Full Access</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Submit Button */}
            <Box sx={{ textAlign: 'center', mt: { xs: 6, md: 8 } }}>
              <SubmitButton onClick={handleSubmit}>
                Add Staff Member
              </SubmitButton>
            </Box>
          </CardBody>
        </FormCard>
      </ContentArea>
    </PageContainer>
  );
};

export default AddNewStaff;