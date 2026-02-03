// src/pages/vet/AddNewStaff.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import {
  Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Paper, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Styled Components (your beautiful design)
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
    staffType: 'veterinarian',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    veterinaryId: '',
    specialization: '',
    accessLevel: 'Normal Access',
    role: 'Receptionist',
    clinicId: ''
  });

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasClinic, setHasClinic] = useState(false);
  const navigate = useNavigate();

  // Load user data and clinics when component mounts
  useEffect(() => {
    const loadUserAndClinics = async () => {
      try {
        const userData = localStorage.getItem('vet_user');
        if (!userData) {
          Swal.fire('Session Expired', 'Please log in again', 'info');
          navigate('/login');
          return;
        }

        const user = JSON.parse(userData);
        
        // Check if user is a veterinarian
        if (user.role !== 'vet') {
          Swal.fire('Access Denied', 'Only veterinarians can access this page', 'error');
          navigate('/login');
          return;
        }

        console.log('Vet user detected:', user);
        
        // Fetch the veterinarian's clinics
        const response = await api.get('/vets/my-clinics');
        
        if (response.data.clinics && response.data.clinics.length > 0) {
          const userClinics = response.data.clinics;
          setClinics(userClinics);
          setHasClinic(true);
          
          // If vet has a clinicId in user object, use it
          if (user.clinicId) {
            setFormData(prev => ({ ...prev, clinicId: user.clinicId }));
          } else if (userClinics.length === 1) {
            // If only one clinic, select it automatically
            setFormData(prev => ({ ...prev, clinicId: userClinics[0]._id }));
          }
        } else {
          setHasClinic(false);
          Swal.fire({
            title: 'No Clinic Found',
            text: 'You need to create or be associated with a clinic before adding staff.',
            icon: 'warning',
            confirmButtonText: 'Create Clinic',
            showCancelButton: true,
            cancelButtonText: 'Stay Here'
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/vet/clinic-settings');
            }
          });
        }
      } catch (err) {
        console.error('Error loading user/clinics:', err);
        
        if (err.response?.status === 401) {
          Swal.fire('Session Expired', 'Please log in again', 'info');
          localStorage.removeItem('vet_user');
          localStorage.removeItem('vet_token');
          navigate('/login');
        } else {
          setHasClinic(false);
          Swal.fire('Error', 'Failed to load clinic information. You can still fill out the form.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserAndClinics();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    const required = ['firstName', 'lastName', 'email', 'password', 'clinicId'];
    if (formData.staffType === 'veterinarian') {
      required.push('veterinaryId');
    }

    const missing = required.filter(field => !formData[field]?.trim());
    if (missing.length > 0) {
      Swal.fire('Missing Fields', 'Please fill all required fields including clinic selection', 'warning');
      return;
    }

    if (!formData.clinicId) {
      Swal.fire('Error', 'Please select a clinic', 'error');
      return;
    }

    try {
      // Common base payload
      const basePayload = {
        staffType: formData.staffType,
        clinicId: formData.clinicId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber?.trim() || ''
      };

      let payload;

      if (formData.staffType === 'veterinarian') {
        payload = {
          ...basePayload,
          veterinaryId: formData.veterinaryId.trim(),
          specialization: formData.specialization?.trim() || '',
          accessLevel: formData.accessLevel
        };
      } else {
        payload = {
          ...basePayload,
          role: formData.role
        };
      }

      // Use the unified endpoint for both types
      const response = await api.post('/clinics/staff', payload);

      const title = formData.staffType === 'veterinarian'
        ? `Dr. ${formData.firstName} ${formData.lastName}`
        : `${formData.firstName} ${formData.lastName} (${formData.role})`;

      // Get selected clinic name for success message
      const selectedClinic = clinics.find(c => c._id === formData.clinicId);
      const clinicName = selectedClinic ? selectedClinic.name : 'the clinic';

      Swal.fire({
        title: 'Success!',
        html: `${title} has been successfully added to <strong>${clinicName}</strong>.`,
        icon: 'success',
        timer: 3500,
        showConfirmButton: false
      });

      navigate('/vet/staff');
    } catch (error) {
      console.error('Error adding staff:', error);
      const message = error.response?.data?.message || 'Failed to add staff member.';
      Swal.fire('Error!', message, 'error');
    }
  };

  const isVet = formData.staffType === 'veterinarian';

  if (loading) {
    return (
      <PageContainer>
        <Sidebar />
        <ContentArea>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} style={{ color: '#8e24aa' }} />
          </Box>
        </ContentArea>
      </PageContainer>
    );
  }

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
              Add a veterinarian or other team member to your clinic
            </HeaderSubtitle>
          </CardHeader>

          <CardBody>
            <BackButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vet/staff')}
            >
              Back to Staff List
            </BackButton>

            {/* Clinic Warning Banner */}
            {!hasClinic && (
              <Box sx={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                p: 2,
                mb: 3
              }}>
                <Typography variant="body1" color="#856404">
                  ⚠️ <strong>No Clinic Associated</strong> - You need to create or be associated with a clinic before adding staff. 
                  Please contact your administrator or create a clinic in Clinic Settings.
                </Typography>
              </Box>
            )}

            {/* Main Form - Two Column Layout */}
            <div className="row g-4">
              {/* Left Column */}
              <div className="col-12 col-lg-6">
                <div className="row g-4">
                  {/* Staff Type Selector - Moved to left column */}
                  <div className="col-12">
                    <FormControl fullWidth>
                      <InputLabel>Staff Type</InputLabel>
                      <Select
                        name="staffType"
                        value={formData.staffType}
                        onChange={handleChange}
                        label="Staff Type"
                      >
                        <MenuItem value="veterinarian">Veterinarian</MenuItem>
                        <MenuItem value="receptionist">Receptionist</MenuItem>
                        <MenuItem value="vetTech">Veterinary Technician</MenuItem>
                        <MenuItem value="manager">Clinic Manager</MenuItem>
                        <MenuItem value="assistant">Assistant / Kennel Staff</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <div className="col-12">
                    <TextField fullWidth label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <TextField fullWidth label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <TextField fullWidth label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-12 col-lg-6">
                <div className="row g-4">
                  {/* Clinic Selection Dropdown - Moved to top of right column */}
                  <div className="col-12">
                    <FormControl fullWidth required error={!hasClinic}>
                      <InputLabel>Select Clinic *</InputLabel>
                      <Select
                        name="clinicId"
                        value={formData.clinicId}
                        onChange={handleChange}
                        label="Select Clinic *"
                        disabled={!hasClinic}
                      >
                        {clinics.map((clinic) => (
                          <MenuItem key={clinic._id} value={clinic._id}>
                            {clinic.name} - {clinic.address}
                          </MenuItem>
                        ))}
                        {clinics.length === 0 && (
                          <MenuItem disabled>
                            No clinics available
                          </MenuItem>
                        )}
                      </Select>
                      {!hasClinic && (
                        <Typography variant="caption" color="error">
                          No clinic associated with your account
                        </Typography>
                      )}
                    </FormControl>
                  </div>

                  <div className="col-12">
                    <TextField fullWidth label="Password *" name="password" type="password" value={formData.password} onChange={handleChange} required />
                  </div>

                  {/* Veterinarian Fields */}
                  {isVet && (
                    <>
                      <div className="col-12">
                        <TextField 
                          fullWidth 
                          label="Veterinary License ID *" 
                          name="veterinaryId" 
                          value={formData.veterinaryId} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="col-12">
                        <TextField fullWidth label="Specialization (e.g., Surgery, Dermatology)" name="specialization" value={formData.specialization} onChange={handleChange} />
                      </div>
                      <div className="col-12">
                        <FormControl fullWidth>
                          <InputLabel>Vet Access Level</InputLabel>
                          <Select name="accessLevel" value={formData.accessLevel} onChange={handleChange} label="Vet Access Level">
                            <MenuItem value="Normal Access">Normal Access</MenuItem>
                            <MenuItem value="Full Access">Full Access</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </>
                  )}

                  {/* Non-Vet Role */}
                  {!isVet && (
                    <div className="col-12">
                      <FormControl fullWidth>
                        <InputLabel>Staff Role</InputLabel>
                        <Select name="role" value={formData.role} onChange={handleChange} label="Staff Role">
                          <MenuItem value="Receptionist">Receptionist</MenuItem>
                          <MenuItem value="Vet Tech">Veterinary Technician</MenuItem>
                          <MenuItem value="Manager">Clinic Manager</MenuItem>
                          <MenuItem value="Assistant">Assistant</MenuItem>
                          <MenuItem value="Kennel Staff">Kennel Staff</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Box sx={{ textAlign: 'center', mt: { xs: 6, md: 8 } }}>
              <SubmitButton 
                onClick={handleSubmit} 
                disabled={!formData.clinicId || !hasClinic}
                title={!hasClinic ? "No clinic associated with your account" : ""}
              >
                {hasClinic ? (
                  `Add ${isVet ? 'Veterinarian' : 'Staff Member'} to ${clinics.find(c => c._id === formData.clinicId)?.name || 'Clinic'}`
                ) : (
                  'Add Staff (No Clinic Available)'
                )}
              </SubmitButton>
              
              {!hasClinic && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  You need to create or be associated with a clinic before adding staff.
                </Typography>
              )}
            </Box>
          </CardBody>
        </FormCard>
      </ContentArea>
    </PageContainer>
  );
};

export default AddNewStaff;