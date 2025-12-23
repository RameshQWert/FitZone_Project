import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services';
import { Loading } from '../../components/common';
import {
  HiOutlineChatAlt2,
  HiOutlinePaperAirplane,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineSearch,
  HiOutlineInbox
} from 'react-icons/hi';

const TrainerChat = () => {
  const { user } = useAuth();
  const { socket, isConnected, sendMessage: socketSendMessage, sendTyping, joinConversation } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load trainer's conversations with members
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await chatService.getTrainerConversations();
        const convData = response.data?.data || response.data || [];
        setConversations(Array.isArray(convData) ? convData : []);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    // Join conversation room for real-time updates
    if (socket && isConnected) {
      joinConversation(selectedConversation._id);
    }

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setPage(1);
        const response = await chatService.getMessages(selectedConversation._id, 1, 50);
        const messagesData = response.data?.data || response.data || [];
        setMessages(Array.isArray(messagesData) ? messagesData : []);
        setHasMore(response.data?.pagination?.hasMore || false);
        
        // Mark as read
        await chatService.markAsRead(selectedConversation._id);
        
        // Update unread count in conversation list
        setConversations(prev => 
          prev.map(c => 
            c._id === selectedConversation._id 
              ? { ...c, unreadByTrainer: 0 } 
              : c
          )
        );
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    return () => {
      if (socket && isConnected) {
        socket.emit('leave-conversation', selectedConversation._id);
      }
    };
  }, [selectedConversation?._id, socket, isConnected, joinConversation]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message) => {
      if (message.conversationId === selectedConversation?._id || message.conversation === selectedConversation?._id) {
        setMessages(prev => {
          if (prev.find(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTyping(false);

        if (message.senderRole === 'member' && selectedConversation) {
          chatService.markAsRead(selectedConversation._id).catch(console.error);
        }
      }

      // Update conversation list
      setConversations(prev => 
        prev.map(c => {
          if (c._id === message.conversationId || c._id === message.conversation) {
            return {
              ...c,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              lastMessageBy: message.senderRole,
              unreadByTrainer: c._id === selectedConversation?._id ? 0 : (c.unreadByTrainer || 0) + 1
            };
          }
          return c;
        })
      );
    };

    const handleTyping = ({ conversationId, userId }) => {
      if (conversationId === selectedConversation?._id && userId !== user._id) {
        setTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      if (conversationId === selectedConversation?._id && userId !== user._id) {
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
  }, [socket, user, selectedConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle typing indicator
  const handleTypingStart = () => {
    if (selectedConversation && socket && isConnected) {
      sendTyping(selectedConversation._id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', selectedConversation._id);
      }, 2000);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      setSending(true);
      const response = await chatService.sendMessage(selectedConversation._id, messageContent);
      
      const newMsg = response.data?.data || response.data;
      if (newMsg && newMsg._id) {
        setMessages(prev => {
          if (prev.find(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        
        if (socket && isConnected) {
          socketSendMessage(selectedConversation._id, messageContent, null);
        }
      }
      
      if (socket && isConnected) {
        socket.emit('stop-typing', selectedConversation._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
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
        day: 'numeric'
      });
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const memberName = conv.memberInfo?.fullName || conv.member?.fullName || '';
    return memberName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="h-[calc(100vh-80px)] flex bg-dark-900 rounded-2xl overflow-hidden border border-dark-700">
      {/* Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 bg-dark-800 border-r border-dark-700 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Search Header */}
        <div className="p-4 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white mb-4">Member Messages</h2>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <HiOutlineInbox className="w-12 h-12 mb-2" />
              <p>No messages yet</p>
              <p className="text-sm text-center">Members will appear here when they message you</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <motion.button
                key={conv._id}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 flex items-center gap-3 border-b border-dark-700 text-left transition-colors ${
                  selectedConversation?._id === conv._id ? 'bg-primary-500/10' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {conv.memberInfo?.avatar ? (
                    <img src={conv.memberInfo.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">
                      {conv.memberInfo?.fullName?.charAt(0) || 'M'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium truncate">
                      {conv.memberInfo?.fullName || 'Member'}
                    </p>
                    {conv.unreadByTrainer > 0 && (
                      <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {conv.unreadByTrainer}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm truncate">{conv.lastMessage || 'No messages'}</p>
                  <p className="text-gray-500 text-xs">{formatDate(conv.lastMessageAt)}</p>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <HiOutlineChatAlt2 className="w-16 h-16 mb-4" />
            <p className="text-lg">Select a conversation</p>
            <p className="text-sm">Choose a member to view their messages</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-dark-800 px-4 py-3 border-b border-dark-700 flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-dark-700 rounded-lg text-gray-400"
              >
                <HiOutlineArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                {selectedConversation.memberInfo?.avatar ? (
                  <img src={selectedConversation.memberInfo.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {selectedConversation.memberInfo?.fullName?.charAt(0) || 'M'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  {selectedConversation.memberInfo?.fullName || 'Member'}
                </p>
                <p className="text-gray-400 text-sm">{selectedConversation.memberInfo?.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {loadingMessages ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <HiOutlineChatAlt2 className="w-12 h-12 mb-2" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender._id === user._id || message.senderRole === 'trainer';
                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {!isOwn && (
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {selectedConversation.memberInfo?.fullName?.charAt(0) || 'M'}
                            </span>
                          </div>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-dark-700 text-gray-100 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                            <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                              {formatTime(message.createdAt)}
                            </span>
                            {isOwn && (
                              message.isRead ? (
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
                })
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
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {selectedConversation.memberInfo?.fullName?.charAt(0) || 'M'}
                      </span>
                    </div>
                    <div className="bg-dark-700 px-4 py-2 rounded-2xl rounded-bl-md">
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
            <form onSubmit={handleSendMessage} className="p-4 bg-dark-800 border-t border-dark-700">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTypingStart();
                  }}
                  placeholder="Type your reply..."
                  className="flex-1 bg-dark-700 text-white px-4 py-3 rounded-xl border border-dark-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
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
          </>
        )}
      </div>
    </div>
  );
};

export default TrainerChat;
