import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, TextField, IconButton,
  List, ListItem, ListItemAvatar, ListItemText, Divider, Paper, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import PetsIcon from '@mui/icons-material/Pets';

// Main Layout
const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
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
  background: 'linear-gradient(90deg, #8e24aa, #ab47bc)',
  color: 'white',
}));

const ChatList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
}));

const ChatListItem = styled(ListItem)(({ theme, selected }) => ({
  cursor: 'pointer',
  borderLeft: selected ? '4px solid #8e24aa' : '4px solid transparent',
  backgroundColor: selected ? '#f3e5f5' : 'transparent',
  '&:hover': {
    backgroundColor: '#ede7f6',
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
  background: 'linear-gradient(90deg, #4a148c, #7b1fa2)',
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

const MessageBubble = styled(Box)(({ theme, isVet }) => ({
  maxWidth: '70%',
  padding: 16,
  borderRadius: 20,
  backgroundColor: isVet ? '#8e24aa' : '#e3f2fd',
  color: isVet ? 'white' : '#1e293b',
  alignSelf: isVet ? 'flex-end' : 'flex-start',
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

const ChatWithOwners = () => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch chat list (active conversations)
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

  // Fetch messages when a chat is selected
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
        senderId: 'current-vet-id', // Replace with actual vet ID from auth
        senderType: 'Vet',
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      scrollToBottom();

      // Update chat list preview
      setChatList(prev => prev.map(chat => 
        chat.petId === selectedChat.petId 
          ? { ...chat, latestMessage: { content: newMessage.trim(), timestamp: new Date(), senderType: 'Vet' } }
          : chat
      ));
    } catch (error) {
      Swal.fire('Error', 'Could not send message', 'error');
    }
  };

  return (
    <ChatContainer>
      <Header />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar />
        <ContentWrapper>
          <Grid container spacing={0} sx={{ height: '100%' }}>
            {/* Chat List */}
            <Grid item>
              <ChatListContainer>
                <ChatListHeader>
                  <Typography variant="h5" fontWeight="bold">
                    Conversations
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    {chatList.length} active chats
                  </Typography>
                </ChatListHeader>
                <ChatList>
                  {chatList.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: '#666' }}>
                      <PetsIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                      <Typography>No conversations yet</Typography>
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
                                  Owner: {chat.ownerName}
                                </Typography>
                                <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                                  {chat.latestMessage?.content || 'No messages yet'}
                                </Typography>
                              </>
                            }
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip
                              label={chat.latestMessage?.senderType || 'Owner'}
                              size="small"
                              color={chat.latestMessage?.senderType === 'Vet' ? 'secondary' : 'default'}
                            />
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
                          Owner: {selectedChat.ownerName}
                        </Typography>
                      </Box>
                    </ChatHeader>

                    <MessagesContainer>
                      {messages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', color: '#999', mt: 8 }}>
                          <PetsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.6 }} />
                          <Typography>No messages yet. Start the conversation!</Typography>
                        </Box>
                      ) : (
                        messages.map((msg, index) => (
                          <MessageBubble key={index} isVet={msg.senderType === 'Vet'}>
                            <Typography variant="body1">{msg.content}</Typography>
                            <MessageTimestamp>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        placeholder="Type your message..."
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
                          backgroundColor: '#8e24aa',
                          color: 'white',
                          '&:hover': { backgroundColor: '#7b1fa2' },
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
                        Select a conversation to start chatting
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        Choose a pet from the list to view messages
                      </Typography>
                    </Box>
                  </Box>
                )}
              </ChatWindowContainer>
            </Grid>
          </Grid>
        </ContentWrapper>
      </Box>
    </ChatContainer>
  );
};

export default ChatWithOwners;