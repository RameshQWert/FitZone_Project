import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const token = localStorage.getItem('token');
      
      // Determine socket URL based on environment
      const getSocketUrl = () => {
        // If production API URL is set, extract the base URL
        if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
          return import.meta.env.VITE_API_URL.replace('/api', '');
        }
        // For development: use the same hostname as the browser
        const hostname = window.location.hostname;
        return `http://${hostname}:5000`;
      };
      
      const socketUrl = getSocketUrl();

      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      // Listen for new messages (for notification badge)
      newSocket.on('message-notification', (data) => {
        setUnreadCount((prev) => prev + 1);
      });

      newSocket.on('new-member-message', (data) => {
        // For admin - increment unread count
        setUnreadCount((prev) => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else if (!isAuthenticated && socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, user?._id]);

  const joinConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('join-conversation', conversationId);
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave-conversation', conversationId);
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((conversationId, content, recipientId) => {
    if (socket && isConnected) {
      socket.emit('send-message', { conversationId, content, recipientId });
    }
  }, [socket, isConnected]);

  const sendTyping = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing', conversationId);
    }
  }, [socket, isConnected]);

  const sendStopTyping = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('stop-typing', conversationId);
    }
  }, [socket, isConnected]);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = {
    socket,
    isConnected,
    unreadCount,
    setUnreadCount,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    sendStopTyping,
    resetUnreadCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
