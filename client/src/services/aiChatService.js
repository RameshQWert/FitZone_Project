import api from './api';

export const aiChatService = {
  // Send message to AI chatbot
  sendMessage: async (message, conversationHistory = []) => {
    const response = await api.post('/ai-chat', { message, conversationHistory });
    return response.data;
  },

  // Get chat suggestions
  getSuggestions: async () => {
    const response = await api.get('/ai-chat/suggestions');
    return response.data;
  }
};

export default aiChatService;
