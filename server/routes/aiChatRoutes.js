const express = require('express');
const router = express.Router();
const { chatWithAI, getSuggestions } = require('../controllers/aiChatController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.post('/', protect, chatWithAI);
router.get('/suggestions', protect, getSuggestions);

module.exports = router;
