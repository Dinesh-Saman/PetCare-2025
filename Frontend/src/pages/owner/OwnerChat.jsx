// src/pages/owner/OwnerChat.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import {
  Box, Typography, Paper, TextField, IconButton, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Divider,
  CircularProgress, Chip, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import PetsIcon from '@mui/icons-material/Pets';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

// ─── Styled Components ───────────────────────────────────────
const PageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: '#f8fafc', // Light slate background
  overflow: 'hidden',
});

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  marginTop: 80, // Space for Navbar
  [theme.breakpoints.down('md')]: {
    padding: '12px',
    marginTop: 70,
  },
}));

const ContentCard = styled(Paper)({
  display: 'flex',
  flex: 1,
  borderRadius: '12px',
  overflow: 'hidden',
  background: 'white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: '1px solid #e2e8f0',
  minHeight: 0,
});

const PetListPanel = styled(Box)({
  width: 320,
  minWidth: 320,
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid #e2e8f0',
  bgcolor: '#fff',
});

const PetListHeader = styled(Box)({
  padding: '24px 24px',
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  color: 'white',
  boxSizing: 'border-box',
});

const PetListItem = styled(ListItem)(({ selected }) => ({
  cursor: 'pointer',
  borderLeft: selected ? '4px solid #2196f3' : '4px solid transparent',
  backgroundColor: selected ? '#e3f2fd' : 'transparent',
  '&:hover': { backgroundColor: selected ? '#e3f2fd' : '#fafafa' },
  transition: 'all 0.2s',
}));

const ChatWindow = styled(Box)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  background: '#f9fafb',
});

const ChatHeader = styled(Box)({
  padding: '24px 32px',
  minHeight: '120px',
  background: '#fff',
  borderBottom: '1px solid #e2e8f0',
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  boxSizing: 'border-box',
});

const MessagesArea = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

const MessageBubble = styled(Box)(({ isowner }) => ({
  maxWidth: '65%',
  padding: '12px 16px',
  borderRadius: isowner === 'true' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
  backgroundColor: isowner === 'true' ? '#1976d2' : '#fff',
  color: isowner === 'true' ? 'white' : '#1a1a2e',
  alignSelf: isowner === 'true' ? 'flex-end' : 'flex-start',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}));

const InputBar = styled(Box)({
  padding: '16px 24px',
  backgroundColor: '#fff',
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  borderTop: '1px solid #e0e0e0',
});

const EmptyState = styled(Box)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#aaa',
});

// ─── Component ───────────────────────────────────────────────
const OwnerChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialPetId = searchParams.get('petId');

  const { user, loading: authLoading } = useAuth();
  const [myPets, setMyPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileAttachments, setFileAttachments] = useState([]); // URLs
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Robust Scroll to Bottom (consistent with VetChatWindow)
  const scrollToBottom = (force = false) => {
    const area = messagesEndRef.current?.parentElement;
    if (!area) return;

    const isAtBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 150;
    if (force || isAtBottom) {
      setTimeout(() => {
        if (area) {
          area.scrollTo({
            top: area.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  // ── Socket setup ──
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('join_user', user.id);

    socket.on('new_message', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;

        // Only scroll if it's from current user or already at bottom
        const isFromMe = msg.senderType === 'Owner' && msg.senderId === user.id;
        scrollToBottom(isFromMe);

        return [...prev, msg];
      });
    });

    socket.on('chat_notification', (data) => {
      // Show a subtle notification if the chat is not currently open for this pet
      if (!selectedPet || selectedPet._id !== data.petId) {
        // Could show a toast here
      }
    });

    return () => socket.disconnect();
  }, []);

  // ── Join/leave pet chat rooms ──
  useEffect(() => {
    if (!socketRef.current || !selectedPet) return;
    socketRef.current.emit('join_chat', selectedPet._id);
    return () => socketRef.current?.emit('leave_chat', selectedPet._id);
  }, [selectedPet]);

  // ── Fetch owner's pets ──
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchPets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/pets/my');
        const pets = res.data?.pets || res.data || [];
        setMyPets(pets);

        if (initialPetId) {
          const match = pets.find(p => p._id === initialPetId);
          if (match) {
            setSelectedPet(match);
            navigate('/owner/chat', { replace: true });
          } else if (pets.length > 0) {
            setSelectedPet(pets[0]);
          }
        } else if (pets.length > 0) {
          setSelectedPet(pets[0]);
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Could not load your pets', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, [authLoading, user, initialPetId, navigate]);

  // ── Fetch messages on pet select ──
  const fetchMessages = useCallback(async () => {
    if (!selectedPet) return;
    try {
      const res = await api.get(`/chat/history/${selectedPet._id}`);
      setMessages(res.data.messages || []);
      scrollToBottom(true);
    } catch (err) {
      console.error(err);
    }
  }, [selectedPet]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── Send message ──
  const handleSend = async () => {
    if ((!newMessage.trim() && fileAttachments.length === 0) || !selectedPet || sending || uploading) return;
    const text = newMessage.trim();
    const attachments = [...fileAttachments];

    // Optimistic Update
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      petId: selectedPet._id,
      senderId: user.id || user._id,
      senderType: 'Owner',
      content: text || (attachments.length > 0 ? "[Attachment]" : ""),
      attachments,
      timestamp: new Date().toISOString(),
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMsg]);
    scrollToBottom(true);
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
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
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
      e.target.value = '';
    }
  };

  const removeAttachment = (index) => {
    setFileAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownload = (url) => {
    if (!url) return;

    // Cloudinary force download trick: 
    // Injecting 'fl_attachment' transformation forces the browser to download the file 
    // in its original format with correct headers.
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
      window.open(downloadUrl, '_blank');
      return;
    }

    // Fallback for non-cloudinary or simple cases
    window.open(url, '_blank');
  };

  const renderAttachment = (url, isOwner) => {
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
              bgcolor: 'rgba(255,255,255,0.8)',
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
          bgcolor: isOwner ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          border: isOwner ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
          cursor: 'pointer',
          '&:hover': { bgcolor: isOwner ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }
        }}
        onClick={() => window.open(url, '_blank')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isPdf ? <PictureAsPdfIcon fontSize="small" sx={{ color: '#ef4444' }} /> :
            isDoc ? <AttachFileIcon fontSize="small" sx={{ color: '#2563eb' }} /> :
              isExcel ? <AttachFileIcon fontSize="small" sx={{ color: '#10b981' }} /> :
                <AttachFileIcon fontSize="small" />}
          <Typography variant="caption" sx={{ fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isOwner ? 'white' : 'inherit' }}>
            {url.split('/').pop()}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); handleDownload(url); }}
          sx={{ color: isOwner ? 'white' : 'inherit', p: 0.5 }}
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
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const key = new Date(msg.timestamp).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  if (authLoading || loading) {
    return (
      <PageContainer>
        <Navbar />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <CircularProgress color="primary" size={60} />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Navbar />
      <MainContent>
        <ContentCard elevation={0}>
          {/* Pet List */}
          <PetListPanel>
            <PetListHeader>
              <Typography variant="h6" fontWeight="800">Chat with Your Vet</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }}>
                {myPets.length} pet{myPets.length !== 1 ? 's' : ''} registered
              </Typography>
            </PetListHeader>

            <List sx={{ overflowY: 'auto', flexGrow: 1, py: 0 }}>
              {myPets.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: '#64748b' }}>
                  <PetsIcon sx={{ fontSize: 56, mb: 2, opacity: 0.2 }} />
                  <Typography variant="body2" fontWeight="600">No pets registered yet</Typography>
                </Box>
              ) : (
                myPets.map((pet, idx) => (
                  <React.Fragment key={pet._id}>
                    <PetListItem
                      selected={selectedPet?._id === pet._id}
                      onClick={() => setSelectedPet(pet)}
                    >
                      <ListItemAvatar>
                        <Avatar src={pet.photo || ''} sx={{ bgcolor: '#1976d2', width: 44, height: 44, fontWeight: 'bold' }}>
                          {pet.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography fontWeight="700" variant="body1" color="#1e293b">{pet.name}</Typography>}
                        secondary={
                          <Typography variant="caption" color="textSecondary" noWrap sx={{ display: 'block', maxWidth: 180, fontWeight: 500 }}>
                            {pet.lastMessage || 'No messages yet'}
                          </Typography>
                        }
                      />
                      {selectedPet?._id === pet._id && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2' }} />
                      )}
                    </PetListItem>
                    {idx < myPets.length - 1 && <Divider sx={{ mx: 2, opacity: 0.5 }} />}
                  </React.Fragment>
                ))
              )}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
              <Typography variant="caption" color="textSecondary" display="block" textAlign="center" fontWeight="600">
                Select a pet to start chatting
              </Typography>
            </Box>
          </PetListPanel>

          {/* Chat Window */}
          <ChatWindow>
            {selectedPet ? (
              <>
                <ChatHeader>
                  <Avatar src={selectedPet.photo || ''} sx={{ width: 52, height: 52, border: '2px solid #e2e8f0' }}>
                    {selectedPet.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="800" color="#0f172a">{selectedPet.name}</Typography>
                    <Typography variant="body2" color="textSecondary" fontWeight="600">
                      {selectedPet.registeredClinicId?.name || 'Veterinary Consultation'}
                    </Typography>
                  </Box>
                </ChatHeader>

                <MessagesArea>
                  {Object.keys(groupedMessages).length === 0 ? (
                    <EmptyState>
                      <PetsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.1 }} />
                      <Typography variant="h6" color="#64748b" fontWeight="800">No messages yet</Typography>
                      <Typography variant="body2" color="textSecondary" mt={1} fontWeight="600">
                        Start a conversation about {selectedPet.name}'s health
                      </Typography>
                    </EmptyState>
                  ) : (
                    Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                      <React.Fragment key={dateKey}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                          <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#f1f5f9' }} />
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, px: 2, py: 0.5, borderRadius: 10, border: '1px solid #f1f5f9', bgcolor: '#fff' }}>
                            {formatDate(msgs[0].timestamp)}
                          </Typography>
                          <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#f1f5f9' }} />
                        </Box>

                        {msgs.map((msg) => {
                          const isOwner = msg.senderType === 'Owner';
                          return (
                            <Box key={msg._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: isOwner ? 'flex-end' : 'flex-start' }}>
                              <MessageBubble isowner={isOwner ? 'true' : 'false'}>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 600 }}>{msg.content}</Typography>

                                {msg.attachments && msg.attachments.length > 0 && (
                                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {msg.attachments.map((url, i) => (
                                      <React.Fragment key={i}>
                                        {renderAttachment(url, isOwner)}
                                      </React.Fragment>
                                    ))}
                                  </Box>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, justifyContent: isOwner ? 'flex-end' : 'flex-start' }}>
                                  <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.68rem', fontWeight: 600 }}>
                                    {formatTime(msg.timestamp)}
                                  </Typography>
                                </Box>
                              </MessageBubble>
                            </Box>
                          );
                        })}
                      </React.Fragment>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </MessagesArea>

                <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #f1f5f9' }}>
                  {/* Attachment Preview */}
                  {(fileAttachments.length > 0 || uploading) && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, px: 1 }}>
                      {fileAttachments.map((url, i) => (
                        <Box key={i} sx={{ position: 'relative', width: 50, height: 50 }}>
                          <Box
                            component={url.match(/\.(jpeg|jpg|gif|png)$/i) ? "img" : "div"}
                            src={url}
                            sx={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 1,
                              objectFit: 'cover',
                              bgcolor: '#f8fafc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            {!url.match(/\.(jpeg|jpg|gif|png)$/i) && <AttachFileIcon sx={{ color: '#64748b' }} />}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeAttachment(i)}
                            sx={{
                              position: 'absolute',
                              top: -10,
                              right: -10,
                              bgcolor: '#ef4444',
                              color: 'white',
                              p: 0.1,
                              '&:hover': { bgcolor: '#dc2626' }
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                      {uploading && (
                        <Box sx={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 1 }}>
                          <CircularProgress size={20} />
                        </Box>
                      )}
                    </Box>
                  )}

                  <InputBar sx={{ borderTop: 'none', p: 0 }}>
                    <input
                      type="file"
                      multiple
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <IconButton
                      onClick={handleFileClick}
                      disabled={uploading || sending}
                      sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                    >
                      <AttachFileIcon />
                    </IconButton>

                    <TextField
                      inputRef={inputRef}
                      fullWidth
                      multiline
                      maxRows={4}
                      variant="outlined"
                      placeholder={`Ask your vet about ${selectedPet.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={uploading || sending}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '16px',
                          bgcolor: '#f8fafc',
                          '& fieldset': { borderColor: '#e2e8f0' },
                          '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                        }
                      }}
                    />
                    <Tooltip title="Send (Enter)">
                      <span>
                        <IconButton
                          onClick={handleSend}
                          disabled={(!newMessage.trim() && fileAttachments.length === 0) || sending || uploading}
                          sx={{
                            bgcolor: '#1976d2',
                            color: 'white',
                            width: 50,
                            height: 50,
                            '&:hover': { bgcolor: '#1565c0', transform: 'scale(1.05)' },
                            '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </InputBar>
                </Box>
              </>
            ) : (
              <EmptyState>
                <PetsIcon sx={{ fontSize: 100, mb: 3, opacity: 0.1 }} />
                <Typography variant="h5" color="#64748b" fontWeight="800">Select a pet to start chatting</Typography>
                <Typography variant="body1" color="textSecondary" mt={2} fontWeight="600">
                  Choose one of your pets to message your veterinarian
                </Typography>
              </EmptyState>
            )}
          </ChatWindow>
        </ContentCard>
      </MainContent>
    </PageContainer>
  );
};

export default OwnerChat;