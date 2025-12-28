import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Avatar, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

// Styled Components — matching your other pages
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
  '&:hover': {
    backgroundColor: '#f1f1f1',
  },
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

const VetAvatar = styled(Avatar)(({ theme }) => ({
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
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newVet, setNewVet] = useState({
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

  useEffect(() => {
    const fetchClinicStaff = async () => {
      try {
        const response = await api.get('/vets/clinic/current'); // Adjust to your endpoint
        setStaff(response.data.vets || []);
      } catch (error) {
        console.error('Error fetching staff:', error);
        Swal.fire('Error', 'Could not load clinic staff', 'error');
      }
    };

    fetchClinicStaff();
  }, []);

  const handleDeactivate = async (vetId, vetName) => {
    const result = await Swal.fire({
      title: `Deactivate ${vetName}?`,
      text: "This vet will no longer have access",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/vets/${vetId}/deactivate`);
        setStaff(prev => prev.map(v => v._id === vetId ? { ...v, status: 'Deactivated' } : v));
        Swal.fire('Deactivated!', `${vetName} has been deactivated.`, 'success');
      } catch (error) {
        Swal.fire('Error!', 'Could not deactivate vet', 'error');
      }
    }
  };

  const handleAddStaff = async () => {
    if (!newVet.firstName || !newVet.lastName || !newVet.email || !newVet.password || !newVet.veterinaryId) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    try {
      const response = await api.post('/vets/subaccount', newVet);
      setStaff(prev => [...prev, response.data.vet]);
      setOpenAddDialog(false);
      setNewVet({
        firstName: '', lastName: '', email: '', password: '',
        phoneNumber: '', veterinaryId: '', specialization: '', accessLevel: 'Normal Access'
      });
      Swal.fire('Success!', 'New staff member added', 'success');
    } catch (error) {
      Swal.fire('Error!', error.response?.data?.message || 'Could not add staff', 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa'}}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <PageTitle variant="h4">
              Clinic Staff
            </PageTitle>
            <AddButton
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/vet/add-new-staff')}  // Navigate to new page
            >
              Add New Staff
            </AddButton>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeadCell>Veterinarian</TableHeadCell>
                  <TableHeadCell>Contact</TableHeadCell>
                  <TableHeadCell>License ID</TableHeadCell>
                  <TableHeadCell>Specialization</TableHeadCell>
                  <TableHeadCell>Access Level</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <AdminPanelSettingsIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        No staff members yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((vet) => (
                    <TableRowStyled key={vet._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <VetAvatar>
                            {vet.firstName.charAt(0)}{vet.lastName.charAt(0)}
                          </VetAvatar>
                          <Box>
                            <Typography fontWeight="bold">
                              Dr. {vet.firstName} {vet.lastName}
                              {vet.isPrimaryVet && <Chip label="Primary" size="small" color="error" sx={{ ml: 1 }} />}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>{vet.email}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {vet.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">{vet.veterinaryId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{vet.specialization || 'General Practice'}</Typography>
                      </TableCell>
                      <TableCell>
                        <AccessChip label={vet.accessLevel} level={vet.accessLevel} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vet.status}
                          color={vet.status === 'Active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeactivate(vet._id, `Dr. ${vet.firstName} ${vet.lastName}`)}
                          disabled={vet.isPrimaryVet || vet.status === 'Deactivated'}
                          title="Deactivate"
                        >
                          <BlockIcon />
                        </IconButton>
                      </TableCell>
                    </TableRowStyled>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </ContentContainer>
      </Box>

      {/* Add New Staff Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #8e24aa, #ab47bc)', color: 'white', py: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Add New Clinic Staff
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newVet.firstName}
                onChange={(e) => setNewVet({ ...newVet, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newVet.lastName}
                onChange={(e) => setNewVet({ ...newVet, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newVet.email}
                onChange={(e) => setNewVet({ ...newVet, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newVet.password}
                onChange={(e) => setNewVet({ ...newVet, password: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newVet.phoneNumber}
                onChange={(e) => setNewVet({ ...newVet, phoneNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Veterinary License ID"
                value={newVet.veterinaryId}
                onChange={(e) => setNewVet({ ...newVet, veterinaryId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialization"
                value={newVet.specialization}
                onChange={(e) => setNewVet({ ...newVet, specialization: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Access Level</InputLabel>
                <Select
                  value={newVet.accessLevel}
                  onChange={(e) => setNewVet({ ...newVet, accessLevel: e.target.value })}
                >
                  <MenuItem value="Normal Access">Normal Access</MenuItem>
                  <MenuItem value="Full Access">Full Access</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddStaff}
            sx={{
              background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
              px: 4,
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            Add Staff Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClinicStaff;