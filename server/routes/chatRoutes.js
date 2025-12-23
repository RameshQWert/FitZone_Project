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
  getMyTrainerConversations,
  getOrCreateTrainerConversation,
  getTrainerConversations,
} = require('../controllers/chatController');
const { protect, admin, trainer } = require('../middleware/authMiddleware');

// Member routes
router.get('/my-conversation', protect, getMyConversation);
router.get('/my-trainer-conversations', protect, getMyTrainerConversations);
router.post('/trainer-conversation', protect, getOrCreateTrainerConversation);
router.get('/unread-count', protect, getUnreadCount);

// Common routes (member, admin, and trainer)
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.put('/messages/:conversationId/read', protect, markMessagesAsRead);

// Trainer routes
router.get('/trainer-conversations', protect, trainer, getTrainerConversations);

// Admin routes
router.get('/conversations', protect, admin, getAllConversations);
router.get('/conversation/member/:memberId', protect, admin, getConversationByMember);
router.delete('/conversation/:conversationId', protect, admin, deleteConversation);

module.exports = router;
