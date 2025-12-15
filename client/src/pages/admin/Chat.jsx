import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services';
import { Loading } from '../../components/common';
import {
  HiOutlineChatAlt2,
  HiOutlinePaperAirplane,
  HiOutlineUserCircle,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineSearch,
  HiOutlineInbox
} from 'react-icons/hi';

const AdminChat = () => {
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

  // Load all conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await chatService.getAllConversations();
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
              ? { ...c, unreadByAdmin: 0 } 
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
      // Leave conversation room when deselecting
      if (socket && isConnected) {
        socket.emit('leave-conversation', selectedConversation._id);
      }
    };
  }, [selectedConversation?._id, socket, isConnected, joinConversation]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // If message is for current conversation
      if (selectedConversation && (message.conversationId === selectedConversation._id || message.conversation === selectedConversation._id)) {
        setMessages(prev => {
          if (prev.find(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTyping(false);
        
        // Mark as read
        chatService.markAsRead(selectedConversation._id).catch(console.error);
      } else {
        // Update unread count for other conversations
        setConversations(prev =>
          prev.map(c =>
            c._id === message.conversationId || c._id === message.conversation
              ? { ...c, unreadByAdmin: (c.unreadByAdmin || 0) + 1, lastMessage: message.content }
              : c
          )
        );
      }

      // Update last message in conversation list
      setConversations(prev =>
        prev.map(c =>
          c._id === message.conversationId || c._id === message.conversation
            ? { ...c, lastMessage: message.content, lastMessageAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt))
      );
    };

    const handleNewMemberMessage = (data) => {
      // Notification for new member message - reload conversations
      chatService.getAllConversations().then(response => {
        const convData = response.data?.data || response.data || [];
        setConversations(Array.isArray(convData) ? convData : []);
      }).catch(console.error);
    };

    const handleTyping = ({ conversationId, userId }) => {
      if (selectedConversation?._id === conversationId && userId !== user?._id) {
        setTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      if (selectedConversation?._id === conversationId && userId !== user?._id) {
        setTyping(false);
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('new-member-message', handleNewMemberMessage);
    socket.on('user-typing', handleTyping);
    socket.on('user-stop-typing', handleStopTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('new-member-message', handleNewMemberMessage);
      socket.off('user-typing', handleTyping);
      socket.off('user-stop-typing', handleStopTyping);
    };
  }, [socket, selectedConversation, user?._id]);

  // Auto-scroll to bottom on new messages
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
        
        // Emit via socket for real-time to member
        if (socket && isConnected) {
          socketSendMessage(selectedConversation._id, messageContent, selectedConversation.member?._id || selectedConversation.member);
        }
      }
      
      // Update conversation list
      setConversations(prev =>
        prev.map(c =>
          c._id === selectedConversation._id
            ? { ...c, lastMessage: messageContent, lastMessageAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt))
      );
      
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

  // Load more messages
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMessages || !selectedConversation) return;

    try {
      const nextPage = page + 1;
      const response = await chatService.getMessages(selectedConversation._id, nextPage, 50);
      
      const messagesData = response.data?.data || response.data || [];
      const newMessages = Array.isArray(messagesData) ? messagesData : [];
      setMessages(prev => [...newMessages, ...prev]);
      setPage(nextPage);
      setHasMore(response.data?.pagination?.hasMore || false);
    } catch (error) {
      console.error('Error loading more messages:', error);
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

  const formatLastMessageTime = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    
    if (msgDate.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else {
      return formatDate(date);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.member?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.member?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Get total unread count
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);

  if (loading) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HiOutlineChatAlt2 className="w-8 h-8 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-gray-400 text-sm">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              {totalUnread > 0 && (
                <span className="ml-2 text-primary-400">• {totalUnread} unread</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden ${
            selectedConversation ? 'hidden lg:block' : ''
          }`}
        >
          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 72px)' }}>
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <HiOutlineInbox className="w-12 h-12 mb-2" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <motion.div
                  key={conv._id}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                    selectedConversation?._id === conv._id ? 'bg-primary-600/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary-600/30 rounded-full flex items-center justify-center">
                        <span className="text-primary-400 font-bold">
                          {conv.memberInfo?.fullName?.charAt(0)?.toUpperCase() || conv.member?.fullName?.charAt(0)?.toUpperCase() || 'M'}
                        </span>
                      </div>
                      {conv.unreadByAdmin > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadByAdmin > 9 ? '9+' : conv.unreadByAdmin}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold truncate ${conv.unreadByAdmin > 0 ? 'text-white' : 'text-gray-300'}`}>
                          {conv.memberInfo?.fullName || conv.member?.fullName || 'Unknown Member'}
                        </h3>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage ? (
                        <p className={`text-sm truncate ${conv.unreadByAdmin > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                          {conv.lastMessageBy === 'admin' ? 'You: ' : ''}
                          {conv.lastMessage}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">No messages yet</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col ${
            !selectedConversation ? 'hidden lg:flex' : ''
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
                >
                  <HiOutlineArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div className="w-10 h-10 bg-primary-600/30 rounded-full flex items-center justify-center">
                  <span className="text-primary-400 font-bold">
                    {selectedConversation.memberInfo?.fullName?.charAt(0)?.toUpperCase() || selectedConversation.member?.fullName?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {selectedConversation.memberInfo?.fullName || selectedConversation.member?.fullName || 'Unknown Member'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedConversation.memberInfo?.email || selectedConversation.member?.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <HiOutlineChatAlt2 className="w-12 h-12 mb-2" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <>
                    {hasMore && (
                      <div className="text-center">
                        <button
                          onClick={loadMoreMessages}
                          className="text-sm text-primary-400 hover:text-primary-300"
                        >
                          Load older messages
                        </button>
                      </div>
                    )}

                    {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                      <div key={date}>
                        <div className="flex items-center justify-center my-4">
                          <span className="bg-gray-700 text-gray-400 text-xs px-3 py-1 rounded-full">
                            {date}
                          </span>
                        </div>

                        {msgs.map((message) => {
                          const isOwn = message.sender._id === user._id;
                          return (
                            <motion.div
                              key={message._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                            >
                              <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                {!isOwn && (
                                  <div className="w-8 h-8 bg-primary-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-400 text-xs font-bold">
                                      {selectedConversation.member?.fullName?.charAt(0)?.toUpperCase() || 'M'}
                                    </span>
                                  </div>
                                )}

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
                    ))}

                    {/* Typing Indicator */}
                    <AnimatePresence>
                      {typing && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-8 h-8 bg-primary-600/30 rounded-full flex items-center justify-center">
                            <span className="text-primary-400 text-xs font-bold">
                              {selectedConversation.member?.fullName?.charAt(0)?.toUpperCase() || 'M'}
                            </span>
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
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTypingStart();
                    }}
                    placeholder="Type your reply..."
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <HiOutlineChatAlt2 className="w-16 h-16 mb-4" />
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm">Choose a member from the list to start chatting</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminChat;
