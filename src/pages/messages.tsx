import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  TextField,
  Button,
  List,
  Typography,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Divider,
  Container,
  ListItemButton,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import React from 'react';

const SOCKET_SERVER_URL = import.meta.env.VITE_Backend_Domain_URL + '';

const Messages = () => {
  const location = useLocation();
  const { state } = location;
  const initialProductId = state?.productId || null;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [productId, setProductId] = useState<string | null>(initialProductId);
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
  const [isCurrentUserImage, setIsCurrentUserImage] = useState<string | null>(null); // Current user profile image
  const [otherUserImage, setOtherUserImage] = useState<string | null>(null); // Other user profile image

  // Reference for message container
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Effect to hold scroll to the end
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // Connect to socket and handle events
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, { withCredentials: true });
    setSocket(newSocket);

    newSocket.on('messages_listed', (data) => {
      setHasLoadedMessages(true);

      if (data.messages && data.messages.length > 0) {
        // Save profile images in the state
        setIsCurrentUserImage(data.isCurrentUserImage);
        setOtherUserImage(data.otherUserImage);

        // Assigns profile images for each message
        const messagesWithProfileImages = data.messages.map((msg: any) => ({
          ...msg,
          senderImage: msg.isCurrentUser
            ? data.isCurrentUserImage
            : data.otherUserImage, // Assigns the correct profile image
        }));
        setMessages(messagesWithProfileImages);
      } else {
        setMessages([]);
      }
      console.log('Evento: listed_messages', data);
    });

    newSocket.on('conversations_listed', (data) => {
      if (data.conversations && data.conversations.length > 0) {
        // Order conversations by date (The most recent first)
        const sortedConversations = data.conversations.sort((a: any, b: any) => {
          return (
            new Date(b.lastMessageDate).getTime() -
            new Date(a.lastMessageDate).getTime()
          );
        });
        setConversations(sortedConversations);

        // If there is no initial product ID, selects the most recent conversation
        if (!initialProductId && !currentChatId) {
          const mostRecentConversation = sortedConversations[0];
          setCurrentChatId(mostRecentConversation.chatId);
          setProductId(mostRecentConversation.productId);
        }
      } else {
        setConversations([]);
      }
      console.log('Event: listed_conversations', data);
    });

    newSocket.on('message_created', (data) => {
      console.log('Received data in message_created:', data);

      if (data.data.chatId === currentChatId) {
        setMessages((prev) => [
          ...prev,
          {
            ...data.data,
            isCurrentUser: data.data.isCurrentUser,
            senderImage: data.data.isCurrentUser ? isCurrentUserImage : otherUserImage, // Assigns the correct profile image
          },
        ]);

        // Updates the conversation list
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.map((conv) => {
            if (conv.chatId === currentChatId) {
              return {
                ...conv,
                lastMessage: data.data.content,
                lastMessageDate: new Date().toISOString(),
              };
            }
            return conv;
          });

          // Reorder conversations by date
          return updatedConversations.sort((a, b) => {
            return (
              new Date(b.lastMessageDate).getTime() -
              new Date(a.lastMessageDate).getTime()
            );
          });
        });
      }
    });

    newSocket.on('error', (error) => {
      setHasLoadedMessages(true);
      console.error('Error desde el servidor:', error.message);
      if (error.message === 'No messages found for this chat') {
        setMessages([]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentChatId, initialProductId, isCurrentUserImage, otherUserImage]);

  // Callback to get all the conversations when component renders
  useEffect(() => {
    if (socket) {
      socket.emit('listConversations');
    }
  }, [socket]);

  // Effect to join a conversation when currentChatId changes
  useEffect(() => {
    if (socket && currentChatId) {
      setHasLoadedMessages(false);
      socket.emit('joinConversation', {
        chatId: currentChatId,
        date: new Date().toISOString(),
      });
    }
  }, [currentChatId, socket]);

  // Selects a conversation
  const handleSelectConversation = (chatId: number) => {
    console.log(chatId);
    const selectedConversation = conversations.find(
      (conv) => conv.chatId === chatId
    );
    if (selectedConversation) {
      setCurrentChatId(chatId);
      setProductId(selectedConversation.productId);
    }
  };

  // Function to send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    console.log('Enviando mensaje...');
    setNewMessage('');

    if (productId && !currentChatId) {
      // Creates a new conversation and sends the message
      socket.emit(
        'createConversationAndMessage',
        { productid: productId, content: newMessage },
        (response: any) => {
          if (response.success) {
            setCurrentChatId(response.chatId);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                ...response.message,
                isCurrentUser: true,
                senderImage: isCurrentUserImage, // Assigns the current user profile image
              },
            ]);

            // requests the updated conversation list
            socket.emit('listConversations');
          } else {
            console.error('Error al enviar el mensaje:', response.error);
          }
        }
      );
    } else if (currentChatId) {
      // Sends a message in an existing conversation
      socket.emit(
        'sendMessage',
        { chatId: currentChatId, content: newMessage },
        (response: any) => {
          if (response.success) {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                ...response.message,
                isCurrentUser: true,
                senderImage: isCurrentUserImage, // Assigns the current user profile image
              },
            ]);

            // requests the updated conversation list
            socket.emit('listConversations');
          } else {
            console.error('Error al enviar el mensaje:', response.error);
          }
        }
      );
    }
  };

  // Function to handle the "Enter" key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Enable the button only if there is a message and a conversation selected
  const isSendButtonDisabled = !newMessage.trim() || (!currentChatId && !productId);

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 3, sm: 5, md: 10 },
        height: '100vh',
      }}
    >
      <Box display="flex" height="100vh">
  {/* Sidebar with chats */}
  <Box
    sx={{
      width: '30%', // Ancho del sidebar
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #e0e0e0', // Línea divisoria
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ p: 2 }}>
      Chats
    </Typography>

    <Box
      sx={{
        flex: 1, 
        overflowY: 'auto', 
        bgcolor: '#f4f4f4', 
      }}
    >
      <List>
        {conversations.map((conv, index) => (
          <React.Fragment key={conv.chatId}>
            <ListItemButton
              onClick={() => handleSelectConversation(conv.chatId)}
              selected={conv.chatId === currentChatId}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                },
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={conv.productImage || 'default-product-image.png'}
                  alt={conv.productName}
                  sx={{ width: 56, height: 56, marginRight: 2 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="bold">
                    {conv.productName}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {conv.lastMessage || 'No messages yet'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {conv.lastMessageDate
                        ? new Date(conv.lastMessageDate).toLocaleString()
                        : 'No date available'}
                    </Typography>
                  </Box>
                }
                secondaryTypographyProps={{ component: 'div' }}
              />
            </ListItemButton>
            {index < conversations.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  </Box>

  {/* Messages area */}
  <Box flex={1} p={2} display="flex" flexDirection="column">
    <Box
      flex={1}
      overflow="auto"
      bgcolor="#e8e8e8"
      p={2}
      ref={messagesEndRef}
      borderRadius={2}
      sx={{ width: { xs: 250, sm: 320, md: 500 } }}
    >
      {hasLoadedMessages ? (
        messages.length > 0 ? (
          messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                msg.isCurrentUser ? 'flex-end' : 'flex-start'
              }
              mb={1}
            >
              {msg.isCurrentUser ? (
                <>
                  <Box
                    bgcolor="#3f51b5"
                    color="#fff"
                    px={2}
                    py={1}
                    borderRadius={5}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                  </Box>
                  <Avatar
                    src={msg.senderImage || 'default-user-image.png'}
                    alt="Sender"
                    sx={{ width: 40, height: 40, marginLeft: 2 }}
                  />
                </>
              ) : (
                <>
                  <Avatar
                    src={msg.senderImage || 'default-user-image.png'}
                    alt="Sender"
                    sx={{ width: 40, height: 40, marginRight: 2 }}
                  />
                  <Box
                    bgcolor="#f1f1f1"
                    color="#000"
                    px={2}
                    py={1}
                    borderRadius={5}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                  </Box>
                </>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No messages in this conversation.
          </Typography>
        )
      ) : null}
    </Box>

    {/* Text field and send button */}
    <Box
      display="flex"
      mt={2}
      sx={{ width: { xs: 250, sm: 320, md: 500 } }}
    >
      <TextField
        fullWidth
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        variant="outlined"
        multiline
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSendMessage}
        disabled={isSendButtonDisabled}
        sx={{ ml: 2 }}
      >
        Send
      </Button>
    </Box>
  </Box>
</Box>
    </Container>
  );
};

export default Messages;
