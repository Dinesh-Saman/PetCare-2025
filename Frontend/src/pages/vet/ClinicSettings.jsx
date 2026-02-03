// src/pages/vet/ClinicList.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, MenuItem, FormControl, Select, InputLabel, TablePagination,
  IconButton, Collapse, Grid, Card, CardContent, CardHeader, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import ClinicEdit from '../vet/ClinicEdit';

// Styled Components — matching your VetAppointmentsList perfectly
const CustomPagination = ({ count, page, rowsPerPage, onPageChange }) => (
  <TablePagination
    component="div"
    count={count}
    page={page}
    rowsPerPage={rowsPerPage}
    onPageChange={onPageChange}
    rowsPerPageOptions={[]}
    labelRowsPerPage=""
  />
);

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

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  flexWrap: 'wrap',
  gap: 20,
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

const DetailsCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  borderRadius: 12,
  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
}));

const CardHeaderStyled = styled(CardHeader)(({ bgcolor }) => ({
  backgroundColor: bgcolor || '#8e24aa',
  color: 'white',
  padding: 16,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(2, 0),
  '& svg': { marginRight: 12, color: '#8e24aa', fontSize: 28 },
}));

const InfoLabel = styled(Typography)({
  fontWeight: 'bold',
  color: '#555',
  minWidth: 140,
});

const InfoValue = styled(Typography)({
  color: '#333',
});

const ClinicList = () => {
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clinics/my'); // Gets vet's clinics

        let clinicsData = [];
        if (response.data.clinics) {
          clinicsData = response.data.clinics;
        } else if (Array.isArray(response.data)) {
          clinicsData = response.data;
        }

        setClinics(clinicsData);
      } catch (error) {
        console.error('Error fetching clinics:', error);
        Swal.fire('Error', 'Could not load your clinics', 'error');
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleEdit = (clinicId) => {
    navigate(`/vet/clinic-edit/${clinicId}`);
  };

  // Search filter
  const filteredClinics = clinics.filter(clinic =>
    clinic.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.phoneNumber?.includes(searchQuery)
  );

  const paginatedClinics = filteredClinics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ContentContainer>
          <SearchSection>
            <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#49149eff' }}>
              My Clinics
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <TextField
                variant="outlined"
                placeholder="Search by name, address, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 350, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Box>
          </SearchSection>

          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeadCell></TableHeadCell>
                  <TableHeadCell>Clinic Name</TableHeadCell>
                  <TableHeadCell>Address</TableHeadCell>
                  <TableHeadCell>Phone</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {paginatedClinics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <BusinessIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        No clinics found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Create your first clinic to get started
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClinics.map((clinic) => (
                    <React.Fragment key={clinic._id}>
                      <TableRowStyled>
                        <TableCell>
                          <IconButton onClick={() => handleExpandRow(clinic._id)}>
                            <ExpandMoreIcon
                              sx={{
                                transform: expandedRow === clinic._id ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: '0.3s'
                              }}
                            />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">{clinic.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="body2">{clinic.address || 'Not set'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography>{clinic.phoneNumber || 'Not set'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(clinic._id)}
                            title="Edit Clinic"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRowStyled>

                      {/* Expanded Details */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={expandedRow === clinic._id} timeout="auto" unmountOnExit>
                            <DetailsCard>
                              <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                  <CardHeaderStyled bgcolor="#2196f3" title="Clinic Details" avatar={<BusinessIcon />} />
                                  <CardContent>
                                    <InfoRow>
                                      <LocationOnIcon />
                                      <InfoLabel>Full Address:</InfoLabel>
                                      <InfoValue>{clinic.address || 'Not provided'}</InfoValue>
                                    </InfoRow>
                                    <InfoRow>
                                      <PhoneIcon />
                                      <InfoLabel>Phone:</InfoLabel>
                                      <InfoValue>{clinic.phoneNumber || 'Not provided'}</InfoValue>
                                    </InfoRow>
                                    <InfoRow>
                                      <AccessTimeIcon />
                                      <InfoLabel>Operating Hours:</InfoLabel>
                                      <InfoValue>{clinic.operatingHours || 'Not specified'}</InfoValue>
                                    </InfoRow>
                                  </CardContent>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                  <CardHeaderStyled bgcolor="#9c27b0" title="About Clinic" avatar={<DescriptionIcon />} />
                                  <CardContent>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                      {clinic.description || 'No description provided yet.'}
                                    </Typography>
                                  </CardContent>
                                </Grid>
                              </Grid>
                            </DetailsCard>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <CustomPagination
            count={filteredClinics.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
          />
        </ContentContainer>
      </Box>
    </Box>
  );
};

export default ClinicList;