// src/pages/vet/ClinicStaff.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Avatar, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Styled Components
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

const PageTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  color: '#49149eff',
  textAlign: 'center',
  marginBottom: 40,
  fontSize: '2.6rem',
  letterSpacing: '1px',
}));

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  '&:hover': { backgroundColor: '#f1f1f1' },
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  borderRadius: 12,
  marginBottom: 10,
}));

const TableHeadRow = styled(TableRow)({
  backgroundColor: '#e08c0eff',
});

const TableHeadCell = styled(TableCell)({
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
});

const StaffAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  border: '3px solid white',
}));

const AccessChip = styled(Chip)(({ level }) => ({
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: 
    level === 'Primary' ? '#d32f2f' :
    level === 'Full Access' ? '#1976d2' :
    level === 'Admin' ? '#7b1fa2' :
    level === 'Moderate' ? '#f57c00' :
    '#43a047',
}));

const AddButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: 30,
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: '0 6px 20px rgba(142, 36, 170, 0.3)',
  '&:hover': {
    background: 'linear-gradient(90deg, #7b1fa2, #9c27b0)',
    transform: 'translateY(-2px)',
  },
}));

const ClinicStaff = () => {
  const [staff, setStaff] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinicStaff = async () => {
      try {
        const response = await api.get('/clinics/staff');
        const staffList = response.data.staff || [];
        setStaff(staffList);
      } catch (error) {
        console.error('Error fetching staff:', error);
        Swal.fire('Error', 'Could not load clinic staff', 'error');
        setStaff([]);
      }
    };

    fetchClinicStaff();
  }, []);

  const handleDeactivate = async (id, name) => {
    const result = await Swal.fire({
      title: `Deactivate ${name}?`,
      text: "This member will no longer have access",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate'
    });

    if (result.isConfirmed) {
      try {
        // Assuming you have a deactivate endpoint for both types
        await api.patch(`/vets/${id}/deactivate`); // Adjust if needed for staff
        setStaff(prev => prev.map(s => s._id === id ? { ...s, status: 'Deactivated' } : s));
        Swal.fire('Deactivated!', `${name} has been deactivated.`, 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not deactivate member', 'error');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <PageTitle variant="h4">
              Clinic Staff
            </PageTitle>
            <AddButton
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/vet/add-new-staff')}
            >
              Add New Staff
            </AddButton>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeadCell>Staff Member</TableHeadCell>
                  <TableHeadCell>Contact</TableHeadCell>
                  <TableHeadCell>Role / Specialization</TableHeadCell>
                  <TableHeadCell>Access Level</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                      <AdminPanelSettingsIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        No staff members yet
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Click "Add New Staff" to invite your team
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member) => (
                    <TableRowStyled key={member._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <StaffAvatar>
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </StaffAvatar>
                          <Box>
                            <Typography fontWeight="bold">
                              {member.type === 'Veterinarian' ? 'Dr.' : ''} {member.firstName} {member.lastName}
                              {member.details?.isPrimary && (
                                <Chip label="Primary" size="small" color="error" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {member.type}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography>{member.email}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {member.phoneNumber || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {member.type === 'Veterinarian' ? (
                          <>
                            <Typography fontWeight="bold">{member.details?.licenseId || '—'}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {member.details?.specialization || 'General Practice'}
                            </Typography>
                          </>
                        ) : (
                          <Typography fontWeight="bold">
                            {member.details?.role || '—'}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <AccessChip
                          label={member.details?.accessLevel || 'Basic'}
                          level={member.details?.accessLevel}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label="Active"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        {/* Only allow deactivating non-primary vets for now */}
                        {member.type === 'Veterinarian' && !member.details?.isPrimary && (
                          <IconButton
                            color="error"
                            onClick={() => handleDeactivate(member._id, `${member.firstName} ${member.lastName}`)}
                            title="Deactivate"
                          >
                            <BlockIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRowStyled>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default ClinicStaff;