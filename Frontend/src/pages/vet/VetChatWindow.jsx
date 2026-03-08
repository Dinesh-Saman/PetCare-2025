// src/pages/vet/VetChatWindow.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import Sidebar from '../../components/layout/sidebar';
import VetAdminNavbar from '../../components/layout/VetAdminNavbar';
import {
    Box, Typography, Paper, TextField, IconButton, Avatar,
    List, ListItem, ListItemAvatar, ListItemText, Divider,
    CircularProgress, Chip, Tooltip, useTheme, useMediaQuery,
    alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const SOCKET_URL = 'http://localhost:5000';

// Modern Styled Components (consistent with DashboardHome)
const PageContainer = styled(Box)({
    display: 'flex',
    flex: '1 1 0',       // grow to fill remaining space, don't shrink below 0
    minHeight: 0,        // critical: allow flex child to shrink below content size
    background: '#f8fafc',
    overflow: 'hidden',
});

const MainContent = styled(Box)(({ theme }) => ({
    flex: '1 1 0',       // grow, shrink, basis 0
    minWidth: 0,         // prevent overflowing sidebar
    minHeight: 0,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
        padding: '12px',
    },
}));

const ContentCard = styled(Paper)(({ theme }) => ({
    background: 'white',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
    flex: '1 1 0',       // fill MainContent height
    minHeight: 0,
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    overflow: 'hidden',
}));

const VetChatWindow = () => {
    const { ownerId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();

    const [owner, setOwner] = useState(null);
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const inputRef = useRef(null);

    const currentVet = JSON.parse(localStorage.getItem('vet_user') || '{}');

    // Helper to scroll to bottom with condition
    const scrollToBottom = (force = false) => {
        const area = messagesEndRef.current?.parentElement;
        if (!area) return;

        const isAtBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 150;
        if (force || isAtBottom) {
            // Using direct scrollTop to prevent page jumping that scrollIntoView can cause
            setTimeout(() => {
                if (area) {
                    area.scrollTo({
                        top: area.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    };

    // ── Socket setup ──
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;
        if (currentVet._id || currentVet.id) socket.emit('join_user', currentVet._id || currentVet.id);
        if (currentVet.clinicId) socket.emit('join_clinic', currentVet.clinicId);

        socket.on('new_message', (msg) => {
            setMessages(prev => {
                const exists = prev.some(m => m._id === msg._id);
                if (exists) return prev;

                // If the message is from the current vet, force scroll.
                // Otherwise only scroll if already at bottom.
                const isFromMe = msg.senderId === (currentVet._id || currentVet.id);
                setTimeout(() => scrollToBottom(isFromMe), 50);

                return [...prev, msg];
            });
        });

        return () => socket.disconnect();
    }, []);

    // ── Join/leave pet room ──
    useEffect(() => {
        if (!socketRef.current || !selectedPet) return;
        socketRef.current.emit('join_chat', selectedPet._id);
        return () => socketRef.current?.emit('leave_chat', selectedPet._id);
    }, [selectedPet?._id]);

    // ── Fetch owner's pets ──
    // ── Fetch owner's pets ──
    const loadOwnerData = useCallback(async () => {
        if (!ownerId) return;
        try {
            setLoading(true);

            // Use pets/owner/:ownerId which returns ALL pets (Approved + Pending)
            const res = await api.get(`/pets/owner/${ownerId}`);
            const allOwnerPets = res.data?.pets || [];

            // Filter pets relevant to this vet (optional safety)
            const vetClinics = [
                currentVet.clinicId,
                currentVet.currentActiveClinicId,
                ...(currentVet.ownedClinics || [])
            ].filter(Boolean);

            const clinicIds = vetClinics.map(id => (typeof id === 'object' ? id._id : id)?.toString());

            const visiblePets = currentVet.accessLevel === 'Enhanced'
                ? allOwnerPets
                : allOwnerPets.filter(p => {
                    const petClinicId = (p.registeredClinicId?._id || p.registeredClinicId)?.toString();
                    return clinicIds.includes(petClinicId);
                });

            if (visiblePets.length > 0) {
                const firstPetWithInfo = visiblePets.find(p => typeof p.ownerId === 'object');
                setOwner(firstPetWithInfo?.ownerId || { _id: ownerId, firstName: 'Owner', lastName: '' });
                setPets(visiblePets);

                // Handle initial selection from notification state
                const targetPetId = location.state?.selectedPetId;
                const initialPet = targetPetId
                    ? (visiblePets.find(p => p._id === targetPetId) || visiblePets[0])
                    : visiblePets[0];

                setSelectedPet(initialPet);

                if (targetPetId) {
                    window.history.replaceState({}, document.title);
                }
            } else {
                setOwner({ _id: ownerId, firstName: 'Owner', lastName: '' });
                setPets([]);
                setSelectedPet(null);
            }
        } catch (err) {
            console.error('Failed to load owner data:', err);
            setPets([]);
            setSelectedPet(null);
        } finally {
            setLoading(false);
        }
    }, [ownerId, location.state?.selectedPetId, currentVet._id, currentVet.id]);

    useEffect(() => {
        loadOwnerData();
    }, [loadOwnerData]);

    // ── Fetch messages ──
    const fetchMessages = useCallback(async () => {
        if (!selectedPet) return;
        try {
            const res = await api.get(`/chat/history/${selectedPet._id}`);
            setMessages(res.data.messages || []);
            // Initial load: force scroll to bottom
            setTimeout(() => scrollToBottom(true), 150);

            // Mark as read
            api.patch('/chat/read', { petId: selectedPet._id }).catch(e => console.error(e));
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    }, [selectedPet?._id]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    // ── Send ──
    const handleSend = async () => {
        if (!newMessage.trim() || !selectedPet || sending) return;
        const text = newMessage.trim();
        setNewMessage('');
        setSending(true);
        try {
            await api.post('/chat/send', { petId: selectedPet._id, content: text });
            inputRef.current?.focus();
        } catch {
            Swal.fire('Error', 'Could not send message', 'error');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatDate = (ts) => {
        const d = new Date(ts), today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Today';
        const yest = new Date(today); yest.setDate(today.getDate() - 1);
        if (d.toDateString() === yest.toDateString()) return 'Yesterday';
        return d.toLocaleDateString();
    };

    // Group messages by date
    const grouped = messages.reduce((acc, msg) => {
        const k = new Date(msg.timestamp).toDateString();
        (acc[k] = acc[k] || []).push(msg);
        return acc;
    }, {});

    // ─── Render ────────────────────────────────────────────────
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <VetAdminNavbar />
            <PageContainer>
                {!isMobile && <Sidebar computedHeight="100%" />}
                <MainContent style={{ minWidth: 0 }}>
                    <ContentCard elevation={0}>
                        {/* Pet list panel */}
                        {!isMobile && (
                            <Box sx={{
                                width: 300,
                                minWidth: 300,
                                borderRight: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                            }}>
                                {/* Header */}
                                <Box sx={{
                                    px: 3, py: 3,
                                    background: 'linear-gradient(135deg, #49149e 0%, #8e24aa 100%)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    flexShrink: 0
                                }}>
                                    <IconButton size="small" sx={{ color: 'white' }} onClick={() => navigate('/vet/chat')}>
                                        <ArrowBackIcon fontSize="small" />
                                    </IconButton>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography fontWeight="800" variant="subtitle1" noWrap>
                                            {owner ? `${owner.firstName} ${owner.lastName}` : 'Owner'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
                                            {pets.length} pet{pets.length !== 1 ? 's' : ''} registered
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Pet list */}
                                <List sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    py: 1,
                                    '&::-webkit-scrollbar': { width: '5px' },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '10px' }
                                }}>
                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                                            <CircularProgress size={32} color="secondary" />
                                        </Box>
                                    ) : pets.length === 0 ? (
                                        <Box sx={{ p: 4, textAlign: 'center', color: '#94a3b8' }}>
                                            <PetsIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                                            <Typography variant="body2" fontWeight="600">No pets found</Typography>
                                        </Box>
                                    ) : (
                                        pets.map((pet, idx) => {
                                            const isSelected = selectedPet?._id === pet._id;
                                            return (
                                                <React.Fragment key={pet._id}>
                                                    <ListItem
                                                        button
                                                        onClick={() => setSelectedPet(pet)}
                                                        sx={{
                                                            mx: 1,
                                                            width: 'auto',
                                                            borderRadius: '16px',
                                                            bgcolor: isSelected ? alpha('#8e24aa', 0.08) : 'transparent',
                                                            '&:hover': { bgcolor: isSelected ? alpha('#8e24aa', 0.12) : '#f8fafc' },
                                                            transition: 'all 0.2s',
                                                            py: 1.5,
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar src={pet.photo || ''} sx={{ width: 44, height: 44, borderRadius: '14px', border: isSelected ? '2px solid #8e24aa' : 'none' }}>
                                                                {pet.name?.charAt(0)?.toUpperCase()}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={<Typography fontWeight="700" variant="body2" color={isSelected ? '#49149e' : '#1e293b'}>{pet.name}</Typography>}
                                                            secondary={
                                                                <Typography variant="caption" color="textSecondary" fontWeight="500">
                                                                    {pet.species}
                                                                </Typography>
                                                            }
                                                        />
                                                    </ListItem>
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </List>
                            </Box>
                        )}

                        {/* Main chat window */}
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8fafc' }}>
                            {loading && isMobile ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                                    <CircularProgress color="secondary" size={48} />
                                </Box>
                            ) : selectedPet ? (
                                <>
                                    {/* Chat header */}
                                    <Box sx={{
                                        px: 4, py: 2.5,
                                        background: 'white',
                                        borderBottom: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        flexShrink: 0,
                                        zIndex: 2
                                    }}>
                                        {isMobile && (
                                            <IconButton size="small" onClick={() => navigate('/vet/chat')}>
                                                <ArrowBackIcon />
                                            </IconButton>
                                        )}
                                        <Avatar src={selectedPet.photo || ''} sx={{ width: 48, height: 48, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                            {selectedPet.name?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant="h6" fontWeight="800" color="#0f172a">{selectedPet.name}</Typography>
                                            <Typography variant="body2" color="textSecondary" fontWeight="600">
                                                {selectedPet.species} {selectedPet.breed && `• ${selectedPet.breed}`}
                                                {owner && ` • Owned by ${owner.firstName}`}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Messages */}
                                    <Box sx={{
                                        flexGrow: 1,
                                        overflowY: 'auto',
                                        p: 4,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                                        backgroundSize: '20px 20px',
                                        '&::-webkit-scrollbar': { width: '6px' },
                                        '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '10px' }
                                    }}>
                                        {Object.keys(grouped).length === 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, opacity: 0.5 }}>
                                                <PetsIcon sx={{ fontSize: 72, mb: 3, color: '#94a3b8' }} />
                                                <Typography variant="h6" fontWeight="700" color="#64748b">No chat history</Typography>
                                                <Typography variant="body2" color="#94a3b8">Start a conversation about {selectedPet.name}</Typography>
                                            </Box>
                                        ) : (
                                            Object.entries(grouped).map(([dateKey, msgs]) => (
                                                <React.Fragment key={dateKey}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                                        <Chip
                                                            label={formatDate(msgs[0].timestamp)}
                                                            size="small"
                                                            sx={{ bgcolor: 'white', color: '#64748b', fontWeight: 700, border: '1px solid #e2e8f0' }}
                                                        />
                                                    </Box>

                                                    {msgs.map((msg) => {
                                                        const isVet = msg.senderType === 'Vet';
                                                        return (
                                                            <Box key={msg._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: isVet ? 'flex-end' : 'flex-start' }}>
                                                                <Box sx={{
                                                                    maxWidth: '75%',
                                                                    px: 2.5, py: 2,
                                                                    borderRadius: isVet ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                                                                    bgcolor: isVet ? '#49149e' : 'white',
                                                                    color: isVet ? 'white' : '#1e293b',
                                                                    boxShadow: isVet ? '0 8px 20px rgba(73, 20, 158, 0.15)' : '0 2px 10px rgba(0,0,0,0.03)',
                                                                    border: isVet ? 'none' : '1px solid #e2e8f0'
                                                                }}>
                                                                    <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 500, wordBreak: 'break-word' }}>
                                                                        {msg.content}
                                                                    </Typography>
                                                                    <Typography sx={{
                                                                        fontSize: '0.65rem',
                                                                        mt: 1,
                                                                        opacity: 0.7,
                                                                        textAlign: 'right',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        {formatTime(msg.timestamp)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </Box>

                                    {/* Input bar */}
                                    <Box sx={{
                                        px: 4, py: 3,
                                        bgcolor: 'white',
                                        borderTop: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        flexShrink: 0
                                    }}>
                                        <TextField
                                            inputRef={inputRef}
                                            fullWidth
                                            multiline
                                            maxRows={4}
                                            variant="outlined"
                                            placeholder={`Type a message...`}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '16px',
                                                    bgcolor: '#f8fafc',
                                                    padding: '12px 16px',
                                                    '& fieldset': { borderColor: '#e2e8f0' },
                                                    '&.Mui-focused fieldset': { borderColor: '#8e24aa' },
                                                }
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleSend}
                                            disabled={!newMessage.trim() || sending}
                                            sx={{
                                                bgcolor: '#49149e',
                                                color: 'white',
                                                width: 52,
                                                height: 52,
                                                '&:hover': { bgcolor: '#3a1080', transform: 'scale(1.05)' },
                                                '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                                                boxShadow: '0 8px 20px rgba(73, 20, 158, 0.2)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: '#94a3b8' }}>
                                    <PetsIcon sx={{ fontSize: 80, mb: 3, opacity: 0.15 }} />
                                    <Typography variant="h5" fontWeight="800" color="#64748b">Select a pet profile</Typography>
                                    <Typography variant="body1" fontWeight="500">Choose a pet from the list to view chat history</Typography>
                                </Box>
                            )}
                        </Box>
                    </ContentCard>
                </MainContent>
            </PageContainer>
        </Box>
    );
};

export default VetChatWindow;
