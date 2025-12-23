import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, TextField, IconButton,
  List, ListItem, ListItemAvatar, ListItemText, Divider, Paper, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import PetsIcon from '@mui/icons-material/Pets';
import Header from '../../components/layout/Header';

const ChatContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  display: 'flex',
  flexDirection: 'column',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: '20px',
  marginTop: '70px',
  display: 'flex',
}));

// Chat List Sidebar
const ChatListContainer = styled(Paper)(({ theme }) => ({
  width: 360,
  backgroundColor: '#fff',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const ChatListHeader = styled(Box)(({ theme }) => ({
  padding: 20,
  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
  color: 'white',
}));

const ChatList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
}));

const ChatListItem = styled(ListItem)(({ theme, selected }) => ({
  cursor: 'pointer',
  borderLeft: selected ? '4px solid #2196f3' : '4px solid transparent',
  backgroundColor: selected ? '#e3f2fd' : 'transparent',
  '&:hover': {
    backgroundColor: '#bbdefb',
  },
}));

// Chat Window
const ChatWindowContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  marginLeft: 24,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  overflow: 'hidden',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: 20,
  background: 'linear-gradient(90deg, #1976d2, #2196f3)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: 24,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}));

const MessageBubble = styled(Box)(({ theme, isOwner }) => ({
  maxWidth: '70%',
  padding: 16,
  borderRadius: 20,
  backgroundColor: isOwner ? '#2196f3' : '#e0e0e0',
  color: isOwner ? 'white' : '#000',
  alignSelf: isOwner ? 'flex-end' : 'flex-start',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const MessageTimestamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  opacity: 0.7,
  marginTop: 8,
}));

const InputArea = styled(Box)(({ theme }) => ({
  padding: 20,
  backgroundColor: '#f8f9fa',
  display: 'flex',
  gap: 12,
  alignItems: 'center',
}));

const OwnerChat = () => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch owner's chat list (pets with conversations)
  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const response = await api.get('/chat/list'); // Your getUserChatList endpoint
        setChatList(response.data.chats || []);
      } catch (error) {
        console.error('Error fetching chat list:', error);
        Swal.fire('Error', 'Could not load conversations', 'error');
      }
    };

    fetchChatList();
  }, []);

  // Fetch messages when a pet is selected
  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/chat/${selectedChat.petId}`);
          setMessages(response.data.messages || []);
          scrollToBottom();
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await api.post('/chat/send', {
        petId: selectedChat.petId,
        senderId: 'current-owner-id', // Will come from auth
        senderType: 'Owner',
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      scrollToBottom();

      // Update chat list preview
      setChatList(prev => prev.map(chat => 
        chat.petId === selectedChat.petId 
          ? { ...chat, latestMessage: { content: newMessage.trim(), timestamp: new Date(), senderType: 'Owner' } }
          : chat
      ));
    } catch (error) {
      Swal.fire('Error', 'Could not send message', 'error');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Header />
      <ChatContainer>
        <ContentWrapper>
          <Grid container spacing={0} sx={{ height: '100%' }}>
            {/* Chat List */}
            <Grid item>
              <ChatListContainer>
                <ChatListHeader>
                  <Typography variant="h5" fontWeight="bold">
                    Chat with Your Vet
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    {chatList.length} conversations
                  </Typography>
                </ChatListHeader>
                <ChatList>
                  {chatList.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: '#666' }}>
                      <PetsIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                      <Typography>No conversations yet</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Messages will appear here once you chat with your vet
                      </Typography>
                    </Box>
                  ) : (
                    chatList.map((chat) => (
                      <React.Fragment key={chat.petId}>
                        <ChatListItem
                          selected={selectedChat?.petId === chat.petId}
                          onClick={() => setSelectedChat(chat)}
                        >
                          <ListItemAvatar>
                            <Avatar src={chat.petPhoto || ''} alt={chat.petName}>
                              {chat.petName?.charAt(0).toUpperCase() || 'P'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography fontWeight="bold">{chat.petName}</Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="textSecondary">
                                  {chat.latestMessage?.senderType === 'Owner' ? 'You' : 'Vet'}: {chat.latestMessage?.content || 'No messages yet'}
                                </Typography>
                              </>
                            }
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="textSecondary">
                              {chat.latestMessage?.timestamp ? formatTime(chat.latestMessage.timestamp) : ''}
                            </Typography>
                          </Box>
                        </ChatListItem>
                        <Divider variant="inset" />
                      </React.Fragment>
                    ))
                  )}
                </ChatList>
              </ChatListContainer>
            </Grid>

            {/* Chat Window */}
            <Grid item xs>
              <ChatWindowContainer>
                {selectedChat ? (
                  <>
                    <ChatHeader>
                      <Avatar src={selectedChat.petPhoto || ''} sx={{ width: 60, height: 60 }}>
                        {selectedChat.petName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {selectedChat.petName}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Talking to your veterinarian
                        </Typography>
                      </Box>
                    </ChatHeader>

                    <MessagesContainer>
                      {messages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', color: '#999', mt: 8 }}>
                          <PetsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.6 }} />
                          <Typography>No messages yet</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Start a conversation about {selectedChat.petName}'s health
                          </Typography>
                        </Box>
                      ) : (
                        messages.map((msg, index) => (
                          <MessageBubble key={index} isOwner={msg.senderType === 'Owner'}>
                            <Typography variant="body1">{msg.content}</Typography>
                            <MessageTimestamp>
                              {formatTime(msg.timestamp)}
                            </MessageTimestamp>
                          </MessageBubble>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </MessagesContainer>

                    <InputArea>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '30px',
                            backgroundColor: '#fff',
                          }
                        }}
                      />
                      <IconButton
                        color="primary"
                        size="large"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        sx={{
                          backgroundColor: '#2196f3',
                          color: 'white',
                          '&:hover': { backgroundColor: '#1976d2' },
                          width: 56,
                          height: 56
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputArea>
                  </>
                ) : (
                  <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PetsIcon sx={{ fontSize: 100, mb: 3, opacity: 0.5 }} />
                      <Typography variant="h5">
                        Select a pet to start chatting
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        Choose one of your pets to message the veterinarian
                      </Typography>
                    </Box>
                  </Box>
                )}
              </ChatWindowContainer>
            </Grid>
          </Grid>
        </ContentWrapper>
      </ChatContainer>
    </>
  );
};

export default OwnerChat;