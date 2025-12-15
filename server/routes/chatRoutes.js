const express = require('express');
const router = express.Router();
const {
  getMyConversation,
  getMessages,
  sendMessage,
  getAllConversations,
  getConversationByMember,
  getUnreadCount,
  deleteConversation,
  markMessagesAsRead,
} = require('../controllers/chatController');
const { protect, admin } = require('../middleware/authMiddleware');

// Member routes
router.get('/my-conversation', protect, getMyConversation);
router.get('/unread-count', protect, getUnreadCount);

// Common routes (both member and admin)
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.put('/messages/:conversationId/read', protect, markMessagesAsRead);

// Admin routes
router.get('/conversations', protect, admin, getAllConversations);
router.get('/conversation/member/:memberId', protect, admin, getConversationByMember);
router.delete('/conversation/:conversationId', protect, admin, deleteConversation);

module.exports = router;
