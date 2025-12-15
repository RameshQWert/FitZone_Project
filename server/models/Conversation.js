const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One conversation per member with admin
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageBy: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
    unreadByAdmin: {
      type: Number,
      default: 0,
    },
    unreadByMember: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Store member info for quick access without populate
    memberInfo: {
      fullName: String,
      email: String,
      avatar: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ member: 1 });
conversationSchema.index({ unreadByAdmin: -1 });

// Static method to get or create conversation for a member
conversationSchema.statics.getOrCreateConversation = async function (memberId, memberInfo) {
  let conversation = await this.findOne({ member: memberId });
  
  if (!conversation) {
    conversation = await this.create({
      member: memberId,
      memberInfo: {
        fullName: memberInfo.fullName,
        email: memberInfo.email,
        avatar: memberInfo.avatar || '',
      },
    });
  }
  
  return conversation;
};

// Method to update last message
conversationSchema.methods.updateLastMessage = async function (content, senderRole) {
  this.lastMessage = content.substring(0, 100); // Store first 100 chars
  this.lastMessageAt = new Date();
  this.lastMessageBy = senderRole;
  
  if (senderRole === 'member') {
    this.unreadByAdmin += 1;
  } else {
    this.unreadByMember += 1;
  }
  
  await this.save();
};

// Method to mark messages as read
conversationSchema.methods.markAsRead = async function (readerRole) {
  if (readerRole === 'admin') {
    this.unreadByAdmin = 0;
  } else {
    this.unreadByMember = 0;
  }
  await this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
