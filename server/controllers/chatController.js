const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Get or create conversation for member
// @route   GET /api/chat/my-conversation
// @access  Private (Member)
const getMyConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select('fullName email avatar');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const conversation = await Conversation.getOrCreateConversation(userId, {
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
  });

  // Mark messages as read by member
  await conversation.markAsRead('member');

  res.json({
    success: true,
    data: conversation,
  });
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Check authorization - member can only access their own conversation
  if (req.user.role !== 'admin' && conversation.member.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this conversation');
  }

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('sender', 'fullName avatar');

  // Mark messages as read
  const readerRole = req.user.role === 'admin' ? 'admin' : 'member';
  await conversation.markAsRead(readerRole);

  // Mark individual messages as read
  await Message.updateMany(
    { 
      conversation: conversationId, 
      isRead: false,
      senderRole: readerRole === 'admin' ? 'member' : 'admin'
    },
    { isRead: true, readAt: new Date() }
  );

  res.json({
    success: true,
    data: messages.reverse(), // Return in chronological order
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
    },
  });
});

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;
  const userId = req.user.id;
  const senderRole = req.user.role === 'admin' ? 'admin' : 'member';

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  let conversation;

  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }
  } else {
    // Create new conversation for member
    if (req.user.role === 'admin') {
      res.status(400);
      throw new Error('Admin must specify a conversation ID');
    }
    const user = await User.findById(userId).select('fullName email avatar');
    conversation = await Conversation.getOrCreateConversation(userId, {
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
    });
  }

  // Check authorization
  if (req.user.role !== 'admin' && conversation.member.toString() !== userId) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: userId,
    senderRole,
    content: content.trim(),
  });

  // Update conversation
  await conversation.updateLastMessage(content.trim(), senderRole);

  // Populate sender info
  await message.populate('sender', 'fullName avatar');

  res.status(201).json({
    success: true,
    data: message,
  });
});

// @desc    Get all conversations (Admin)
// @route   GET /api/chat/conversations
// @access  Private/Admin
const getAllConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  let query = { isActive: true };

  if (search) {
    query['memberInfo.fullName'] = { $regex: search, $options: 'i' };
  }

  const total = await Conversation.countDocuments(query);
  const conversations = await Conversation.find(query)
    .sort({ lastMessageAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('member', 'fullName email avatar');

  // Calculate total unread for admin
  const totalUnread = await Conversation.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } },
  ]);

  res.json({
    success: true,
    data: conversations,
    totalUnread: totalUnread[0]?.total || 0,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get conversation by member ID (Admin)
// @route   GET /api/chat/conversation/member/:memberId
// @access  Private/Admin
const getConversationByMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  let conversation = await Conversation.findOne({ member: memberId });

  if (!conversation) {
    // Get member info to create conversation
    const member = await User.findById(memberId).select('fullName email avatar');
    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }
    
    conversation = await Conversation.getOrCreateConversation(memberId, {
      fullName: member.fullName,
      email: member.email,
      avatar: member.avatar,
    });
  }

  // Mark as read by admin
  await conversation.markAsRead('admin');

  res.json({
    success: true,
    data: conversation,
  });
});

// @desc    Get unread count for member
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (req.user.role === 'admin') {
    const result = await Conversation.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } },
    ]);
    
    res.json({
      success: true,
      unreadCount: result[0]?.total || 0,
    });
  } else {
    const conversation = await Conversation.findOne({ member: userId });
    
    res.json({
      success: true,
      unreadCount: conversation?.unreadByMember || 0,
    });
  }
});

// @desc    Delete conversation (Admin)
// @route   DELETE /api/chat/conversation/:conversationId
// @access  Private/Admin
const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Soft delete - just mark as inactive
  conversation.isActive = false;
  await conversation.save();

  res.json({
    success: true,
    message: 'Conversation archived',
  });
});

// @desc    Mark messages as read
// @route   PUT /api/chat/messages/:conversationId/read
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && conversation.member.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this conversation');
  }

  const readerRole = req.user.role === 'admin' ? 'admin' : 'member';
  await conversation.markAsRead(readerRole);

  // Mark individual messages as read
  await Message.updateMany(
    { 
      conversation: conversationId, 
      isRead: false,
      senderRole: readerRole === 'admin' ? 'member' : 'admin'
    },
    { isRead: true, readAt: new Date() }
  );

  res.json({
    success: true,
    message: 'Messages marked as read',
  });
});

module.exports = {
  getMyConversation,
  getMessages,
  sendMessage,
  getAllConversations,
  getConversationByMember,
  getUnreadCount,
  deleteConversation,
  markMessagesAsRead,
};
