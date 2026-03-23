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
    alpha, LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';

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
    borderRadius: '10px',
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
    const [uploading, setUploading] = useState(false);
    const [fileAttachments, setFileAttachments] = useState([]); // URLs from Cloudinary
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

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

                // Standardized isFromMe check for populated objects
                const senderId = msg.senderId?._id || msg.senderId;
                const currentUserId = currentVet._id || currentVet.id;
                const isFromMe = String(senderId) === String(currentUserId);
                
                setTimeout(() => scrollToBottom(isFromMe), 50);

                return [...prev, msg];
            });
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (!socketRef.current || !selectedPet?._id) return;
        const petId = selectedPet._id.toString();
        socketRef.current.emit('join_chat', petId);
        return () => socketRef.current?.emit('leave_chat', petId);
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

            // Only show approved pets for chat
            const approvedPets = allOwnerPets.filter(p => p.registrationStatus === 'Approved');

            const visiblePets = currentVet.accessLevel === 'Enhanced'
                ? approvedPets
                : approvedPets.filter(p => {
                    const petClinicId = (p.registeredClinicId?._id || p.registeredClinicId)?.toString();
                    return clinicIds.includes(petClinicId);
                });

            if (allOwnerPets.length > 0) {
                const firstPetWithInfo = allOwnerPets.find(p => p.ownerId && typeof p.ownerId === 'object');
                setOwner(firstPetWithInfo?.ownerId || { _id: ownerId, firstName: 'Owner', lastName: '' });
                setPets(visiblePets);
                
                // If there are no visible pets in THIS clinic, at least the vet can see the owner name
                // from the general pets list before filtering.
                if (visiblePets.length > 0) {
                    const targetPetId = location.state?.selectedPetId;
                    const initialPet = targetPetId
                        ? (visiblePets.find(p => p._id === targetPetId) || visiblePets[0])
                        : visiblePets[0];
                    setSelectedPet(initialPet);
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
        if ((!newMessage.trim() && fileAttachments.length === 0) || !selectedPet || sending || uploading) return;
        const text = newMessage.trim();
        const attachments = [...fileAttachments];

        setNewMessage('');
        setFileAttachments([]);
        setSending(true);
        try {
            await api.post('/chat/send', {
                petId: selectedPet._id,
                content: text || (attachments.length > 0 ? "[Attachment]" : ""),
                attachments
            });
            inputRef.current?.focus();
        } catch {
            Swal.fire('Error', 'Could not send message', 'error');
        } finally {
            setSending(false);
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        setUploading(true);
        try {
            const res = await api.post('/upload/attachments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFileAttachments(prev => [...prev, ...res.data.attachments]);
        } catch (err) {
            Swal.fire('Upload Failed', err.response?.data?.message || 'Could not upload files', 'error');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const removeAttachment = (index) => {
        setFileAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleDownload = (url) => {
        if (!url) return;

        // Cloudinary force download: Using 'fl_attachment' transformation
        // ensures the file is downloaded in its original format with proper headers.
        if (url.includes('cloudinary.com') && url.includes('/upload/')) {
            const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
            window.open(downloadUrl, '_blank');
            return;
        }

        // Fallback or non-Cloudinary
        window.open(url, '_blank');
    };

    const renderAttachment = (url, isVet) => {
        const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i);
        const isPdf = url.match(/\.pdf$/i);
        const isDoc = url.match(/\.(doc|docx)$/i);
        const isExcel = url.match(/\.(xls|xlsx)$/i);

        if (isImage) {
            return (
                <Box sx={{ position: 'relative', mt: 1 }}>
                    <Box
                        component="img"
                        src={url}
                        alt="Attachment"
                        sx={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            borderRadius: 2,
                            cursor: 'pointer',
                            display: 'block'
                        }}
                        onClick={() => window.open(url, '_blank')}
                    />
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleDownload(url); }}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255,255,255,0.85)',
                            color: '#1e293b',
                            '&:hover': { bgcolor: 'white' }
                        }}
                    >
                        <DownloadIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    mt: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isVet ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: isVet ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: isVet ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }
                }}
                onClick={() => window.open(url, '_blank')}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isPdf ? <PictureAsPdfIcon fontSize="small" sx={{ color: '#ff5252' }} /> :
                        isDoc ? <AttachFileIcon fontSize="small" sx={{ color: '#448aff' }} /> :
                            isExcel ? <AttachFileIcon fontSize="small" sx={{ color: '#4caf50' }} /> :
                                <AttachFileIcon fontSize="small" />}
                    <Typography variant="caption" sx={{ fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isVet ? 'white' : 'inherit' }}>
                        {url.split('/').pop()}
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleDownload(url); }}
                    sx={{ color: isVet ? 'white' : 'inherit', p: 0.5 }}
                >
                    <DownloadIcon fontSize="small" />
                </IconButton>
            </Box>
        );
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
                                    minHeight: '120px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'linear-gradient(135deg, #49149e 0%, #8e24aa 100%)',
                                    color: 'white',
                                    gap: 1.5,
                                    flexShrink: 0
                                }}>
                                    <IconButton size="small" sx={{ color: 'white' }} onClick={() => navigate(-1)}>
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
                                                                <Typography
                                                                    variant="caption"
                                                                    color="textSecondary"
                                                                    fontWeight="500"
                                                                    sx={{
                                                                        display: 'block',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        maxWidth: '180px'
                                                                    }}
                                                                >
                                                                    {pet.lastMessage
                                                                        ? (pet.lastMessage.length > 30 ? pet.lastMessage.substring(0, 30) + '...' : pet.lastMessage)
                                                                        : pet.species}
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
                                        px: isMobile ? 2 : 4, py: isMobile ? 2 : 3,
                                        minHeight: isMobile ? '80px' : '120px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'white',
                                        borderBottom: '1px solid #e2e8f0',
                                        gap: 2,
                                        flexShrink: 0,
                                        zIndex: 2
                                    }}>
                                        {isMobile && (
                                            <IconButton size="small" onClick={() => navigate(-1)}>
                                                <ArrowBackIcon />
                                            </IconButton>
                                        )}
                                        <Avatar src={selectedPet.photo || ''} sx={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: isMobile ? '12px' : '16px', border: '1px solid #e2e8f0' }}>
                                            {selectedPet.name?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="800" color="#0f172a" noWrap>{selectedPet.name}</Typography>
                                            <Typography variant="body2" color="#1e293b" fontWeight="700">
                                                {owner?.firstName} {owner?.lastName}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" fontWeight="600" noWrap>
                                                {selectedPet.species}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Messages */}
                                    <Box sx={{
                                        flexGrow: 1,
                                        overflowY: 'auto',
                                        p: isMobile ? 2 : 4,
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

                                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                            {msg.attachments.map((url, i) => (
                                                                                <React.Fragment key={i}>
                                                                                    {renderAttachment(url, isVet)}
                                                                                </React.Fragment>
                                                                            ))}
                                                                        </Box>
                                                                    )}
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
                                        px: isMobile ? 2 : 4, py: isMobile ? 2 : 3,
                                        bgcolor: 'white',
                                        borderTop: '1px solid #e2e8f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        flexShrink: 0
                                    }}>
                                        {/* Attachment Preview Area */}
                                        {(fileAttachments.length > 0 || uploading) && (
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                                {fileAttachments.map((url, i) => (
                                                    <Box key={i} sx={{ position: 'relative', width: 60, height: 60 }}>
                                                        <Box
                                                            component={url.match(/\.(jpeg|jpg|gif|png)$/i) ? "img" : "div"}
                                                            src={url}
                                                            sx={{
                                                                width: '100%',
                                                                height: '100%',
                                                                borderRadius: 1,
                                                                objectFit: 'cover',
                                                                bgcolor: '#f1f5f9',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            {!url.match(/\.(jpeg|jpg|gif|png)$/i) && <AttachFileIcon />}
                                                        </Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeAttachment(i)}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                bgcolor: '#ef4444',
                                                                color: 'white',
                                                                p: 0.2,
                                                                '&:hover': { bgcolor: '#dc2626' }
                                                            }}
                                                        >
                                                            <CloseIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                                {uploading && (
                                                    <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9', borderRadius: 1 }}>
                                                        <CircularProgress size={24} />
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <input
                                                type="file"
                                                multiple
                                                hidden
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                            />
                                            <Tooltip title="Attach Files (Images, PDFs, or Office Docs)">
                                                <IconButton
                                                    onClick={handleFileClick}
                                                    disabled={uploading || sending}
                                                    sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                                                >
                                                    <AttachFileIcon />
                                                </IconButton>
                                            </Tooltip>

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
                                                disabled={uploading || sending}
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
                                                disabled={(!newMessage.trim() && fileAttachments.length === 0) || sending || uploading}
                                                sx={{
                                                    bgcolor: '#49149e',
                                                    color: 'white',
                                                    width: isMobile ? 44 : 52,
                                                    height: isMobile ? 44 : 52,
                                                    '&:hover': { bgcolor: '#3a1080', transform: 'scale(1.05)' },
                                                    '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                                                    boxShadow: '0 8px 20px rgba(73, 20, 158, 0.2)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <SendIcon />
                                            </IconButton>
                                        </Box>
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
