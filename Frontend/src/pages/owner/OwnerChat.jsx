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
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

// ─── Styled Components ───────────────────────────────────────
const PageWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e8f5e9 0%, #f3e5f5 100%)',
});

const ChatLayout = styled(Box)({
  display: 'flex',
  flexGrow: 1,
  marginTop: 96, // Match Owner Navbar height (approx 96px)
  height: 'calc(100vh - 96px)',
  overflow: 'hidden',
});

const PetListPanel = styled(Paper)({
  width: 300,
  minWidth: 300,
  borderRadius: 0,
  borderRight: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const PetListHeader = styled(Box)({
  padding: '20px 16px',
  background: 'linear-gradient(135deg, #1976d2, #2196f3)',
  color: 'white',
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
  padding: '16px 24px',
  background: 'linear-gradient(135deg, #1565c0, #1976d2)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);

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
        return [...prev, msg];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
    } catch (err) {
      console.error(err);
    }
  }, [selectedPet]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── Send message ──
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedPet || sending) return;
    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);
    try {
      await api.post('/chat/send', { petId: selectedPet._id, content: text });
      inputRef.current?.focus();
    } catch (err) {
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
      <PageWrapper>
        <Navbar />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, mt: 15 }}>
          <CircularProgress color="primary" size={60} />
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar />
      <ChatLayout>
        {/* Pet List */}
        <PetListPanel elevation={0}>
          <PetListHeader>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Chat with Your Vet</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {myPets.length} pet{myPets.length !== 1 ? 's' : ''} registered
            </Typography>
          </PetListHeader>

          <List sx={{ overflowY: 'auto', flexGrow: 1, py: 0 }}>
            {myPets.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: '#aaa' }}>
                <PetsIcon sx={{ fontSize: 56, mb: 2, opacity: 0.4 }} />
                <Typography variant="body2">No pets registered yet</Typography>
              </Box>
            ) : (
              myPets.map((pet, idx) => (
                <React.Fragment key={pet._id}>
                  <PetListItem
                    selected={selectedPet?._id === pet._id ? 1 : 0}
                    onClick={() => setSelectedPet(pet)}
                  >
                    <ListItemAvatar>
                      <Avatar src={pet.photo || ''} sx={{ bgcolor: '#1976d2', width: 46, height: 46 }}>
                        {pet.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight="bold" variant="body1">{pet.name}</Typography>}
                      secondary={
                        <Typography variant="caption" color="textSecondary">
                          {pet.species} • {pet.breed || 'Mixed breed'}
                        </Typography>
                      }
                    />
                    {selectedPet?._id === pet._id && (
                      <Chip label="Open" size="small" color="primary" sx={{ fontSize: '0.65rem' }} />
                    )}
                  </PetListItem>
                  {idx < myPets.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              ))
            )}
          </List>

          <Box sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: '#f5fdff' }}>
            <Typography variant="caption" color="textSecondary" display="block" textAlign="center">
              Select a pet to chat with your veterinarian
            </Typography>
          </Box>
        </PetListPanel>

        {/* Chat Window */}
        <ChatWindow>
          {selectedPet ? (
            <>
              <ChatHeader>
                <Avatar src={selectedPet.photo || ''} sx={{ width: 52, height: 52, border: '2px solid rgba(255,255,255,0.5)' }}>
                  {selectedPet.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>{selectedPet.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    <PetsIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    {selectedPet.species} • {selectedPet.breed || 'Mixed'}
                    {selectedPet.registeredClinicId?.name && ` • ${selectedPet.registeredClinicId.name}`}
                  </Typography>
                </Box>
              </ChatHeader>

              <MessagesArea>
                {Object.keys(groupedMessages).length === 0 ? (
                  <EmptyState>
                    <PetsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.4 }} />
                    <Typography variant="h6" color="textSecondary">No messages yet</Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Start a conversation about {selectedPet.name}'s health
                    </Typography>
                  </EmptyState>
                ) : (
                  Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                    <React.Fragment key={dateKey}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
                        <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#e0e0e0' }} />
                        <Typography variant="caption" color="textSecondary" sx={{ bgcolor: '#f9fafb', px: 1.5, py: 0.5, borderRadius: 10, border: '1px solid #e0e0e0' }}>
                          {formatDate(msgs[0].timestamp)}
                        </Typography>
                        <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#e0e0e0' }} />
                      </Box>

                      {msgs.map((msg) => {
                        const isOwner = msg.senderType === 'Owner';
                        return (
                          <Box key={msg._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: isOwner ? 'flex-end' : 'flex-start' }}>
                            <MessageBubble isowner={isOwner ? 'true' : 'false'}>
                              <Typography variant="body2" lineHeight={1.5}>{msg.content}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, justifyContent: isOwner ? 'flex-end' : 'flex-start' }}>
                                <AccessTimeIcon sx={{ fontSize: 10, opacity: 0.6 }} />
                                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.68rem' }}>
                                  {formatTime(msg.timestamp)}
                                </Typography>
                              </Box>
                            </MessageBubble>
                            {!isOwner && (
                              <Typography variant="caption" color="textSecondary" mt={0.3} ml={0.5}>
                                Veterinarian
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
                <div ref={messagesEndRef} />
              </MessagesArea>

              <InputBar>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '24px',
                      bgcolor: '#f5f5f5',
                      '&.Mui-focused': { bgcolor: '#fff' },
                    }
                  }}
                />
                <Tooltip title="Send (Enter)">
                  <span>
                    <IconButton
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      sx={{
                        bgcolor: '#1976d2',
                        color: 'white',
                        width: 50,
                        height: 50,
                        '&:hover': { bgcolor: '#1565c0' },
                        '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#aaa' },
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputBar>
            </>
          ) : (
            <EmptyState>
              <PetsIcon sx={{ fontSize: 100, mb: 3, opacity: 0.4 }} />
              <Typography variant="h5" color="textSecondary">Select a pet to start chatting</Typography>
              <Typography variant="body1" color="textSecondary" mt={2}>
                Choose one of your pets to message your veterinarian
              </Typography>
            </EmptyState>
          )}
        </ChatWindow>
      </ChatLayout>
    </PageWrapper>
  );
};

export default OwnerChat;