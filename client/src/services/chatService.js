import api from './api';

const chatService = {
  // Get or create member's conversation
  getMyConversation: async () => {
    const response = await api.get('/chat/my-conversation');
    return response;
  },

  // Get messages for a conversation
  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/messages/${conversationId}`, {
      params: { page, limit },
    });
    return response;
  },

  // Send a message
  sendMessage: async (conversationId, content) => {
    const response = await api.post('/chat/messages', {
      conversationId,
      content,
    });
    return response;
  },

  // Get all conversations (Admin)
  getAllConversations: async (page = 1, limit = 20, search = '') => {
    const response = await api.get('/chat/conversations', {
      params: { page, limit, search },
    });
    return response;
  },

  // Get conversation by member ID (Admin)
  getConversationByMember: async (memberId) => {
    const response = await api.get(`/chat/conversation/member/${memberId}`);
    return response;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread-count');
    return response;
  },

  // Mark as read
  markAsRead: async (conversationId) => {
    const response = await api.put(`/chat/messages/${conversationId}/read`);
    return response;
  },
};

export default chatService;
