// src/pages/vet/VetChat.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, TablePagination, IconButton, Chip, useTheme, useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import PetsIcon from '@mui/icons-material/Pets';

const ContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
  border: '1px solid #e2e8f0',
  flex: 1,
  padding: '32px',
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

const OwnerAvatar = styled('div')({
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: '#8e24aa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
});

const ChatButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b8e 100%)',
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(142, 36, 170, 0.4)',
  },
  boxShadow: '0 4px 15px rgba(142, 36, 170, 0.3)',
  padding: 12,
  borderRadius: '12px',
  transition: 'all 0.3s ease',
}));

const VetChat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [owners, setOwners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnersWithPets = async () => {
      try {
        // Use the correct vet endpoint that returns approved registered pets with owner info
        const response = await api.get('/pets/clinic/registered');
        const pets = response.data?.registeredPets || response.data?.pets || [];

        const ownersMap = {};
        pets.forEach(pet => {
          if (pet.ownerId) {
            const ownerId = pet.ownerId._id || pet.ownerId;
            if (!ownersMap[ownerId]) {
              ownersMap[ownerId] = {
                _id: ownerId,
                firstName: pet.ownerId.firstName || 'Unknown',
                lastName: pet.ownerId.lastName || 'Owner',
                email: pet.ownerId.email || '',
                phoneNumber: pet.ownerId.phoneNumber || '',
                pets: []
              };
            }
            ownersMap[ownerId].pets.push({
              name: pet.name,
              species: pet.species,
              photo: pet.photo
            });
          }
        });

        const ownersList = Object.values(ownersMap);
        setOwners(ownersList);
      } catch (error) {
        console.error('Error fetching owners:', error);
        setOwners([]);
      }
    };

    fetchOwnersWithPets();
  }, []);

  const filteredOwners = owners.filter(owner => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase();
    return fullName.includes(query) || owner.email.toLowerCase().includes(query);
  });

  const paginatedOwners = filteredOwners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChatClick = (ownerId) => {
    navigate(`/vet/chat/owner/${ownerId}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <VetAdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, p: isMobile ? 1 : 2, display: 'flex', flexDirection: 'column' }}>
          <ContentContainer>
            <SearchSection>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Chat with Owners
              </Typography>

              <TextField
                variant="outlined"
                placeholder="Search owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{ width: isMobile ? '100%' : 400, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </SearchSection>

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeadCell>Owner</TableHeadCell>
                    <TableHeadCell>Pets</TableHeadCell>
                    {!isMobile && <TableHeadCell>Contact</TableHeadCell>}
                    <TableHeadCell align="center">Chat</TableHeadCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {paginatedOwners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 3 : 4} align="center" sx={{ py: 8 }}>
                        <Typography variant="h6" color="textSecondary">
                          No owners found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOwners.map((owner) => (
                      <TableRowStyled key={owner._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <OwnerAvatar sx={{ width: 50, height: 50, fontSize: '1.4rem' }}>
                              {owner.firstName.charAt(0).toUpperCase()}
                            </OwnerAvatar>
                            <Box>
                              <Typography fontWeight="bold" variant="body1">
                                {owner.firstName} {owner.lastName}
                              </Typography>
                              {!isMobile && <Typography variant="caption" color="textSecondary">{owner.email}</Typography>}
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {owner.pets.length > 0 ? (
                              owner.pets.map((pet, idx) => (
                                <Chip
                                  key={idx}
                                  icon={<PetsIcon sx={{ fontSize: '0.8rem !important' }} />}
                                  label={pet.name}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography variant="caption" color="textSecondary">No pets</Typography>
                            )}
                          </Box>
                        </TableCell>

                        {!isMobile && (
                          <TableCell>
                            <Typography variant="body2">{owner.phoneNumber || 'N/A'}</Typography>
                          </TableCell>
                        )}

                        <TableCell align="center">
                          <ChatButton
                            onClick={() => handleChatClick(owner._id)}
                            size="small"
                          >
                            <ChatIcon fontSize="medium" />
                          </ChatButton>
                        </TableCell>
                      </TableRowStyled>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredOwners.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
              labelRowsPerPage=""
            />
          </ContentContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default VetChat;