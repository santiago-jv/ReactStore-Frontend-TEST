import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import React from 'react';

const SOCKET_SERVER_URL = 'http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net';

const ChatView = () => {
  const location = useLocation();
  const { state } = location;
  const initialProductId = state?.productId || null;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [productId, setProductId] = useState<number | null>(initialProductId);

  // Referencia para el contenedor de mensajes
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Efecto para mantener el scroll al final
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, { withCredentials: true });
    setSocket(newSocket);

    newSocket.on('messages_listed', (data) => {
      setMessages(data.messages || []);
      console.log('Evento: listed_messages', data);
    });

    newSocket.on('conversations_listed', (data) => {
      setConversations(data.conversations || []);
      console.log('Evento: listed_conversations', data);
    });

    newSocket.on('message_created', (data) => {
      setMessages((prev) => [...prev, data.data]);
      console.log('Evento: message_created', data);
    });

    newSocket.on('error', (error) => {
      console.error('Error desde el servidor:', error.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('listConversations');
    }
  }, [socket]);

  const handleSelectConversation = (chatId: number) => {
    const selectedConversation = conversations.find((conv) => conv.chatId === chatId);
    if (selectedConversation) {
      setCurrentChatId(chatId);
      setProductId(selectedConversation.productId);
      if (socket) {
        socket.emit('joinConversation', { chatId, date: new Date().toISOString() });
      }
    }
  };

  const handleConsultButton = useCallback(() => {
    if (productId && socket) {
      socket.emit('createMessage', {
        productid: productId,
        content: '¡Consulta inicial!',
      });
    }
  }, [socket, productId]);

  const handleSendMessage = () => {
    if (newMessage.trim() && productId && socket) {
      socket.emit('createMessage', { productid: productId, content: newMessage });
      setNewMessage('');
    }
  };

  // Función para manejar el evento "Enter"
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Evita el salto de línea
      handleSendMessage();
    }
  };

  return (
    <Box display="flex" height="100vh">
      {/* Barra lateral de conversaciones */}
      <Box width="30%" bgcolor="#f4f4f4" p={2}>
        <Typography variant="h6" gutterBottom>
          Chats
        </Typography>
        <List>
          {conversations.map((conv, index) => (
            <React.Fragment key={conv.chatId}>
              <ListItem
                button
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
                />
              </ListItem>
              {index < conversations.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Área de mensajes */}
      <Box flex={1} p={2} display="flex" flexDirection="column">
        <Box
          flex={1}
          overflow="auto"
          bgcolor="#e8e8e8"
          p={2}
          ref={messagesEndRef}
          borderRadius={2}
          width={600}
        >
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={msg.isCurrentUser ? 'flex-end' : 'flex-start'}
                mb={1}
              >
                {!msg.isCurrentUser && (
                  <Avatar
                    src={msg.senderImage || 'default-user-image.png'}
                    alt="Sender"
                    sx={{ width: 40, height: 40, marginRight: 2 }}
                  />
                )}
                <Box
                  bgcolor={msg.isCurrentUser ? '#3f51b5' : '#f1f1f1'}
                  color={msg.isCurrentUser ? '#fff' : '#000'}
                  px={2}
                  py={1}
                  borderRadius={5}
                >
                  <Typography variant="body2">{msg.content}</Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              There are no messages in this conversation.
            </Typography>
          )}
        </Box>

        {/* Campo de texto y botón de enviar */}
        <Box display="flex" mt={2} width={600}>
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
            disabled={!currentChatId}
            sx={{ ml: 2 }}
          >
            Send
          </Button>
        </Box>
      </Box>

      {/* Botón de consulta */}
      {productId && (
        <Box position="fixed" bottom={16} right={16}>
          <Button variant="contained" color="secondary" onClick={handleConsultButton}>
            Consultar
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ChatView;