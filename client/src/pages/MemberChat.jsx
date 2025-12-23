import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services';
import api from '../services/api';
import { Loading } from '../components/common';
import { 
  HiOutlineChatAlt2, 
  HiOutlinePaperAirplane,
  HiOutlineUserCircle,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineUserGroup,
} from 'react-icons/hi';

const MemberChat = () => {
  const { user } = useAuth();
  const { socket, isConnected, sendMessage: socketSendMessage, sendTyping, joinConversation } = useSocket();
  const [chatMode, setChatMode] = useState(null); // null = selection, 'admin', 'trainer'
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [trainerConversations, setTrainerConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch available trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await api.get('/trainers');
        const data = response.data.data || response.data;
        setTrainers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching trainers:', error);
      }
    };
    fetchTrainers();
  }, []);

  // Fetch trainer conversations
  useEffect(() => {
    const fetchTrainerConversations = async () => {
      try {
        const response = await chatService.getMyTrainerConversations();
        const data = response.data?.data || response.data || [];
        setTrainerConversations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching trainer conversations:', error);
      }
    };
    if (user) {
      fetchTrainerConversations();
    }
  }, [user]);

  // Initialize conversation based on chat mode
  useEffect(() => {
    // If no chat mode selected, just ensure loading is false
    if (!chatMode) {
      setLoading(false);
      return;
    }

    // If user not loaded yet, wait
    if (!user) {
      return;
    }

    const initConversation = async () => {
      try {
        setLoading(true);
        setConversation(null);
        setMessages([]);
        let conv = null;
        
        if (chatMode === 'admin') {
          console.log('Fetching admin conversation...');
          const response = await chatService.getMyConversation();
          console.log('Admin conversation response:', response);
          conv = response.data?.data || response.data || response;
        } else if (chatMode === 'trainer' && selectedTrainer) {
          console.log('Fetching trainer conversation for:', selectedTrainer._id);
          const response = await chatService.getOrCreateTrainerConversation(selectedTrainer._id);
          console.log('Trainer conversation response:', response);
          conv = response.data?.data || response.data || response;
        }
        
        if (conv && conv._id) {
          console.log('Got conversation:', conv._id);
          setConversation(conv);
          
          const messagesResponse = await chatService.getMessages(conv._id, 1, 50);
          console.log('Messages response:', messagesResponse);
          const messagesData = messagesResponse.data?.data || messagesResponse.data || [];
          setMessages(Array.isArray(messagesData) ? messagesData : []);
          setHasMore(messagesResponse.data?.pagination?.hasMore || false);
        } else {
          console.log('No conversation returned');
          setConversation(conv || {});
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        // Still set conversation to empty object so UI doesn't stay in loading
        setConversation({});
      } finally {
        setLoading(false);
      }
    };

    initConversation();
  }, [user, chatMode, selectedTrainer]);

  // Join conversation room when conversation is loaded
  useEffect(() => {
    if (conversation?._id && socket && isConnected) {
      joinConversation(conversation._id);
      return () => {
        // Leave conversation when unmounting
        socket.emit('leave-conversation', conversation._id);
      };
    }
  }, [conversation?._id, socket, isConnected, joinConversation]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (conversation && messages.length > 0 && user) {
      const unreadMessages = messages.filter(
        m => !m.read && m.sender?._id !== user._id
      );
      if (unreadMessages.length > 0) {
        chatService.markAsRead(conversation._id).catch(console.error);
      }
    }
  }, [conversation, messages, user]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message) => {
      // Only add if message is for this conversation
      if (message.conversationId === conversation?._id || message.conversation === conversation?._id) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTyping(false);
        
        // Mark as read immediately if from admin
        if (message.senderRole === 'admin' && conversation) {
          chatService.markAsRead(conversation._id).catch(console.error);
        }
      }
    };

    const handleTyping = ({ conversationId, userId }) => {
      if (conversationId === conversation?._id && userId !== user._id) {
        setTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      if (conversationId === conversation?._id && userId !== user._id) {
        setTyping(false);
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTyping);
    socket.on('user-stop-typing', handleStopTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleTyping);
      socket.off('user-stop-typing', handleStopTyping);
    };
  }, [socket, user, conversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load more messages
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !conversation || !conversation._id) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await chatService.getMessages(conversation._id, nextPage, 50);
      
      const messagesData = response.data?.data || response.data || [];
      const newMessages = Array.isArray(messagesData) ? messagesData : [];
      setMessages(prev => [...newMessages, ...prev]);
      setPage(nextPage);
      setHasMore(response.data?.pagination?.hasMore || false);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle scroll to load more
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !loadingMore && conversation?._id) {
      loadMoreMessages();
    }
  };

  // Handle typing indicator
  const handleTypingStart = () => {
    if (conversation && socket && isConnected) {
      sendTyping(conversation._id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', conversation._id);
      }, 2000);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      setSending(true);
      const response = await chatService.sendMessage(conversation._id, messageContent);
      
      // Add message locally for immediate feedback
      const newMsg = response.data?.data || response.data;
      if (newMsg && newMsg._id) {
        setMessages(prev => {
          if (prev.find(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        
        // Also emit via socket for real-time to admin
        if (socket && isConnected) {
          socketSendMessage(conversation._id, messageContent, null);
        }
      }
      
      if (socket && isConnected) {
        socket.emit('stop-typing', conversation._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = formatDate(msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  if (loading) {
    return <Loading />;
  }

  const messageGroups = groupMessagesByDate(messages);

  // Chat selection screen
  if (!chatMode) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
            <p className="text-gray-400">Choose who you want to chat with</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Chat with Admin */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setChatMode('admin')}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-primary-500 transition-all text-left"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4">
                <HiOutlineChatAlt2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Chat with Admin</h3>
              <p className="text-gray-400 text-sm">Get help with memberships, payments, and general inquiries</p>
            </motion.button>

            {/* Chat with Trainers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-4">
                <HiOutlineUserGroup className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Chat with Trainers</h3>
              <p className="text-gray-400 text-sm mb-4">Connect with your trainers for fitness guidance</p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {trainers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No trainers available</p>
                ) : (
                  trainers.map((trainer) => {
                    const existingConv = trainerConversations.find(c => c.trainer === trainer._id);
                    return (
                      <button
                        key={trainer._id}
                        onClick={() => {
                          setSelectedTrainer(trainer);
                          setChatMode('trainer');
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          {trainer.user?.avatar ? (
                            <img src={trainer.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {trainer.user?.fullName?.charAt(0) || 'T'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{trainer.user?.fullName || 'Trainer'}</p>
                          <p className="text-gray-400 text-xs truncate">{trainer.specializations?.join(', ') || 'Fitness Trainer'}</p>
                        </div>
                        {existingConv?.unreadByMember > 0 && (
                          <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                            {existingConv.unreadByMember}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Get chat partner name
  const getChatPartnerName = () => {
    if (chatMode === 'admin') return 'Admin';
    if (chatMode === 'trainer' && selectedTrainer) {
      return selectedTrainer.user?.fullName || 'Trainer';
    }
    return 'Chat';
  };

  const getChatPartnerInitial = () => {
    if (chatMode === 'admin') return 'A';
    if (chatMode === 'trainer' && selectedTrainer) {
      return selectedTrainer.user?.fullName?.charAt(0) || 'T';
    }
    return 'C';
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-8">
      <div className="max-w-4xl ml-auto mr-4 lg:mr-8 px-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700"
          style={{ height: 'calc(100vh - 140px)', minHeight: '500px' }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setChatMode(null);
                  setSelectedTrainer(null);
                  setConversation(null);
                  setMessages([]);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <HiOutlineArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {chatMode === 'trainer' && selectedTrainer?.user?.avatar ? (
                  <img src={selectedTrainer.user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{getChatPartnerInitial()}</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Chat with {getChatPartnerName()}</h2>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  <span className="text-sm text-white/80">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ height: 'calc(100% - 140px)' }}
          >
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="text-sm text-primary-400 hover:text-primary-300 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load older messages'}
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <HiOutlineChatAlt2 className="w-16 h-16 mb-4" />
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Start a conversation with {getChatPartnerName()}!</p>
              </div>
            ) : (
              Object.entries(messageGroups).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <span className="bg-gray-700 text-gray-400 text-xs px-3 py-1 rounded-full">
                      {date}
                    </span>
                  </div>

                  {/* Messages */}
                  {msgs.map((message, index) => {
                    const isOwn = message.sender._id === user._id;
                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                      >
                        <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          {!isOwn && (
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {chatMode === 'trainer' && selectedTrainer?.user?.avatar ? (
                                <img src={selectedTrainer.user.avatar} alt="" className="w-8 h-8 object-cover" />
                              ) : (
                                <span className="text-white text-xs font-bold">{getChatPartnerInitial()}</span>
                              )}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-gray-700 text-gray-100 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                              <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                {formatTime(message.createdAt)}
                              </span>
                              {isOwn && (
                                message.read ? (
                                  <HiOutlineCheckCircle className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <HiOutlineCheck className="w-4 h-4 text-white/50" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            <AnimatePresence>
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                    {chatMode === 'trainer' && selectedTrainer?.user?.avatar ? (
                      <img src={selectedTrainer.user.avatar} alt="" className="w-8 h-8 object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">{getChatPartnerInitial()}</span>
                    )}
                  </div>
                  <div className="bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTypingStart();
                }}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none placeholder-gray-400"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending || !isConnected}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
              >
                {sending ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <HiOutlinePaperAirplane className="w-6 h-6 rotate-90" />
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MemberChat;
