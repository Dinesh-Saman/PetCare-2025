// src/pages/vet/EditClinicStaff.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import {
  Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Paper, CircularProgress, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Styled Components (matching your beautiful design)
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

const UpdateButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
  color: 'white',
  padding: theme.spacing(2.5, 8),
  borderRadius: 30,
  fontWeight: 'bold',
  fontSize: '1.3rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
  minWidth: '320px',
  '&:hover': {
    background: 'linear-gradient(90deg, #1565c0, #1e88e5)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(25, 118, 210, 0.4)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const EditClinicStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    staffType: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    veterinaryId: '',
    specialization: '',
    accessLevel: '',
    role: '',
    clinicId: '',
    status: 'Active'
  });

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staffMember, setStaffMember] = useState(null);
  const [hasClinic, setHasClinic] = useState(false);
  const [isPrimaryVet, setIsPrimaryVet] = useState(false);

// Load staff member data
useEffect(() => {
  const loadStaffData = async () => {
    try {
      setLoading(true);
      console.log('Loading staff data for ID:', id);
      
      // First check: Is this a veterinarian or clinic staff?
      // We'll need to know which endpoint to use
      // Let's try to get the staff list first to determine the type
      const staffListResponse = await api.get('/vets/clinics/staff');
      const allStaff = staffListResponse.data.staff || [];
      
      console.log('All staff count:', allStaff.length);
      
      // Find the staff member in the list
      const staffInList = allStaff.find(s => s._id === id);
      
      if (!staffInList) {
        throw new Error('Staff member not found in your clinics');
      }
      
      console.log('Found staff in list:', staffInList);
      
      // Determine staff type from the list data
      const isVet = staffInList.type === 'Veterinarian';
      setFormData(prev => ({
        ...prev,
        staffType: isVet ? 'veterinarian' : 'staff',
        firstName: staffInList.firstName || '',
        lastName: staffInList.lastName || '',
        email: staffInList.email || '',
        phoneNumber: staffInList.phoneNumber || '',
        status: staffInList.status || 'Active'
      }));
      
      if (isVet) {
        // For veterinarians, fetch full details
        try {
          const vetResponse = await api.get(`/vets/${id}`);
          const vetData = vetResponse.data;
          
          setFormData(prev => ({
            ...prev,
            veterinaryId: vetData.veterinaryId || '',
            specialization: vetData.specialization || '',
            accessLevel: vetData.accessLevel || 'Normal Access',
            clinicId: vetData.currentActiveClinicId?._id || vetData.currentActiveClinicId || ''
          }));
          setIsPrimaryVet(vetData.accessLevel === 'Primary');
        } catch (vetError) {
          console.error('Error fetching vet details:', vetError);
        }
      } else {
        // For clinic staff, set role and access level
        setFormData(prev => ({
          ...prev,
          role: staffInList.details?.role || 'Receptionist',
          accessLevel: staffInList.details?.accessLevel || 'Basic',
          clinicId: staffInList.currentActiveClinicId || staffInList.clinicId || ''
        }));
      }
      
      // Fetch clinics owned by the primary vet
      const clinicsResponse = await api.get('/vets/my-clinics');
      if (clinicsResponse.data.clinics && clinicsResponse.data.clinics.length > 0) {
        const userClinics = clinicsResponse.data.clinics;
        setClinics(userClinics);
        setHasClinic(true);
      } else {
        setHasClinic(false);
      }
      
    } catch (err) {
      console.error('Error loading staff data:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 404) {
        Swal.fire('Not Found', 'Staff member not found', 'error').then(() => {
          navigate('/vet/staff');
        });
      } else if (err.response?.status === 401) {
        Swal.fire('Session Expired', 'Please log in again', 'info');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        Swal.fire('Error', err.message || 'Failed to load staff information', 'error').then(() => {
          navigate('/vet/staff');
        });
      }
    } finally {
      setLoading(false);
    }
  };

  loadStaffData();
}, [id, navigate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for staffType change
    if (name === 'staffType') {
      // Reset vet-specific fields when switching to staff
      if (value !== 'veterinarian') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          veterinaryId: '',
          specialization: '',
          accessLevel: 'Basic'
        }));
      } else {
        // Reset staff-specific fields when switching to vet
        setFormData(prev => ({
          ...prev,
          [name]: value,
          role: '',
          accessLevel: 'Normal Access'
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    const required = ['firstName', 'lastName', 'email', 'clinicId'];
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
      setSaving(true);
      
      // Common base payload for update
      const basePayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formData.phoneNumber?.trim() || '',
        currentActiveClinicId: formData.clinicId
      };

      let payload;

      if (formData.staffType === 'veterinarian') {
        payload = {
          ...basePayload,
          veterinaryId: formData.veterinaryId.trim(),
          specialization: formData.specialization?.trim() || '',
          accessLevel: formData.accessLevel,
          status: formData.status
        };
        
        // Update veterinarian
        const response = await api.put(`/vets/${id}`, payload);
        console.log('Update response:', response.data);
      } else {
        payload = {
          ...basePayload,
          role: formData.role,
          accessLevel: formData.accessLevel,
          status: formData.status,
          clinicId: formData.clinicId
        };
        
        // Update clinic staff (you'll need to create this endpoint)
        const response = await api.put(`/clinics/staff/${id}`, payload);
        console.log('Update response:', response.data);
      }

      const title = formData.staffType === 'veterinarian'
        ? `Dr. ${formData.firstName} ${formData.lastName}`
        : `${formData.firstName} ${formData.lastName} (${formData.role})`;

      // Get selected clinic name for success message
      const selectedClinic = clinics.find(c => c._id === formData.clinicId);
      const clinicName = selectedClinic ? selectedClinic.name : 'the clinic';

      Swal.fire({
        title: 'Success!',
        html: `${title} has been successfully updated in <strong>${clinicName}</strong>.`,
        icon: 'success',
        timer: 3500,
        showConfirmButton: false
      }).then(() => {
        navigate('/vet/staff');
      });

    } catch (error) {
      console.error('Error updating staff:', error);
      const message = error.response?.data?.message || 'Failed to update staff member.';
      Swal.fire('Error!', message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    const result = await Swal.fire({
      title: `Deactivate ${formData.firstName} ${formData.lastName}?`,
      text: "This member will no longer have access to the system.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setSaving(true);
        
        if (formData.staffType === 'veterinarian') {
          await api.patch(`/vets/${id}/deactivate`);
        } else {
          // For clinic staff deactivation (you'll need to create this endpoint)
          await api.patch(`/clinics/staff/${id}/deactivate`);
        }
        
        setFormData(prev => ({ ...prev, status: 'Inactive' }));
        
        Swal.fire('Deactivated!', 'Staff member has been deactivated.', 'success');
      } catch (error) {
        console.error('Error deactivating:', error);
        Swal.fire('Error!', 'Could not deactivate staff member', 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleActivate = async () => {
    try {
      setSaving(true);
      
      if (formData.staffType === 'veterinarian') {
        await api.patch(`/vets/${id}/activate`); // You'll need to create this endpoint
      } else {
        // For clinic staff activation
        await api.patch(`/clinics/staff/${id}/activate`); // You'll need to create this endpoint
      }
      
      setFormData(prev => ({ ...prev, status: 'Active' }));
      
      Swal.fire('Activated!', 'Staff member has been activated.', 'success');
    } catch (error) {
      console.error('Error activating:', error);
      Swal.fire('Error!', 'Could not activate staff member', 'error');
    } finally {
      setSaving(false);
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
              Edit Staff Member
            </HeaderTitle>
            <HeaderSubtitle>
              Update information for {formData.firstName} {formData.lastName}
            </HeaderSubtitle>
          </CardHeader>

          <CardBody>
            <BackButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vet/staff')}
            >
              Back to Staff List
            </BackButton>

            {/* Status Alert */}
            {formData.status !== 'Active' && (
              <Alert 
                severity="warning" 
                sx={{ mb: 3, borderRadius: 2 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleActivate}
                    disabled={saving}
                  >
                    Activate
                  </Button>
                }
              >
                This staff member is currently <strong>{formData.status}</strong>.
              </Alert>
            )}

            {/* Primary Vet Warning */}
            {isPrimaryVet && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                <strong>Primary Veterinarian:</strong> Some fields cannot be edited for primary veterinarians.
              </Alert>
            )}

            {/* Main Form - Two Column Layout */}
            <div className="row g-4">
              {/* Left Column */}
              <div className="col-12 col-lg-6">
                <div className="row g-4">
                  {/* Staff Type (Read-only if primary vet) */}
                  <div className="col-12">
                    <FormControl fullWidth>
                      <InputLabel>Staff Type</InputLabel>
                      <Select
                        name="staffType"
                        value={formData.staffType}
                        onChange={handleChange}
                        label="Staff Type"
                        disabled={isPrimaryVet}
                      >
                        <MenuItem value="veterinarian">Veterinarian</MenuItem>
                        <MenuItem value="staff">Clinic Staff</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <div className="col-12">
                    <TextField 
                      fullWidth 
                      label="First Name *" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleChange} 
                      required 
                      disabled={isPrimaryVet}
                    />
                  </div>
                  <div className="col-12">
                    <TextField 
                      fullWidth 
                      label="Last Name *" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleChange} 
                      required 
                      disabled={isPrimaryVet}
                    />
                  </div>
                  <div className="col-12">
                    <TextField 
                      fullWidth 
                      label="Email Address *" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      disabled={isPrimaryVet}
                    />
                  </div>
                  <div className="col-12">
                    <TextField 
                      fullWidth 
                      label="Phone Number" 
                      name="phoneNumber" 
                      value={formData.phoneNumber} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-12 col-lg-6">
                <div className="row g-4">
                  {/* Clinic Selection Dropdown */}
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

                  {/* Status Field */}
                  <div className="col-12">
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="Status"
                        disabled={isPrimaryVet}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
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
                          disabled={isPrimaryVet}
                        />
                      </div>
                      <div className="col-12">
                        <TextField 
                          fullWidth 
                          label="Specialization" 
                          name="specialization" 
                          value={formData.specialization} 
                          onChange={handleChange} 
                          disabled={isPrimaryVet}
                        />
                      </div>
                      <div className="col-12">
                        <FormControl fullWidth>
                          <InputLabel>Vet Access Level</InputLabel>
                          <Select 
                            name="accessLevel" 
                            value={formData.accessLevel} 
                            onChange={handleChange} 
                            label="Vet Access Level"
                            disabled={isPrimaryVet}
                          >
                            <MenuItem value="Normal Access">Normal Access</MenuItem>
                            <MenuItem value="Full Access">Full Access</MenuItem>
                            {isPrimaryVet && (
                              <MenuItem value="Primary">Primary</MenuItem>
                            )}
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
                        <Select 
                          name="role" 
                          value={formData.role} 
                          onChange={handleChange} 
                          label="Staff Role"
                        >
                          <MenuItem value="Receptionist">Receptionist</MenuItem>
                          <MenuItem value="Vet Tech">Veterinary Technician</MenuItem>
                          <MenuItem value="Manager">Clinic Manager</MenuItem>
                          <MenuItem value="Assistant">Assistant</MenuItem>
                          <MenuItem value="Kennel Staff">Kennel Staff</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  )}

                  {/* Non-Vet Access Level */}
                  {!isVet && (
                    <div className="col-12">
                      <FormControl fullWidth>
                        <InputLabel>Access Level</InputLabel>
                        <Select 
                          name="accessLevel" 
                          value={formData.accessLevel} 
                          onChange={handleChange} 
                          label="Access Level"
                        >
                          <MenuItem value="Basic">Basic</MenuItem>
                          <MenuItem value="Moderate">Moderate</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <Box sx={{ 
              textAlign: 'center', 
              mt: { xs: 6, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}>
              <UpdateButton 
                onClick={handleSubmit} 
                disabled={!formData.clinicId || !hasClinic || saving}
                title={!hasClinic ? "No clinic associated with your account" : ""}
              >
                {saving ? 'Updating...' : 'Update Staff Member'}
              </UpdateButton>
              
              {/* Deactivate/Activate Button */}
              {formData.status === 'Active' && !isPrimaryVet && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleDeactivate}
                  disabled={saving}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 'bold',
                    padding: '12px 40px',
                    borderRadius: 30
                  }}
                >
                  Deactivate Staff Member
                </Button>
              )}
              
              {!hasClinic && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  You need to create or be associated with a clinic before editing staff.
                </Typography>
              )}
            </Box>
          </CardBody>
        </FormCard>
      </ContentArea>
    </PageContainer>
  );
};

export default EditClinicStaff;