const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Type of conversation - admin or trainer
    conversationType: {
      type: String,
      enum: ['admin', 'trainer'],
      default: 'admin',
    },
    // For trainer conversations, store the trainer reference
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
    },
    trainerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      enum: ['member', 'admin', 'trainer'],
      default: 'member',
    },
    unreadByAdmin: {
      type: Number,
      default: 0,
    },
    unreadByTrainer: {
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
    // Store trainer info for quick access
    trainerInfo: {
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
// Compound index for member + conversationType + trainer (for unique trainer conversations)
conversationSchema.index({ member: 1, conversationType: 1, trainer: 1 }, { unique: true, sparse: true });
conversationSchema.index({ member: 1, conversationType: 1 });
conversationSchema.index({ trainer: 1 });
conversationSchema.index({ trainerUser: 1 });
conversationSchema.index({ unreadByAdmin: -1 });
conversationSchema.index({ unreadByTrainer: -1 });

// Static method to get or create conversation for a member (admin chat)
conversationSchema.statics.getOrCreateConversation = async function (memberId, memberInfo) {
  let conversation = await this.findOne({ member: memberId, conversationType: 'admin' });
  
  if (!conversation) {
    conversation = await this.create({
      member: memberId,
      conversationType: 'admin',
      memberInfo: {
        fullName: memberInfo.fullName,
        email: memberInfo.email,
        avatar: memberInfo.avatar || '',
      },
    });
  }
  
  return conversation;
};

// Static method to get or create conversation with a trainer
conversationSchema.statics.getOrCreateTrainerConversation = async function (memberId, memberInfo, trainerId, trainerUserId, trainerInfo) {
  let conversation = await this.findOne({ 
    member: memberId, 
    conversationType: 'trainer',
    trainer: trainerId 
  });
  
  if (!conversation) {
    conversation = await this.create({
      member: memberId,
      conversationType: 'trainer',
      trainer: trainerId,
      trainerUser: trainerUserId,
      memberInfo: {
        fullName: memberInfo.fullName,
        email: memberInfo.email,
        avatar: memberInfo.avatar || '',
      },
      trainerInfo: {
        fullName: trainerInfo.fullName,
        email: trainerInfo.email,
        avatar: trainerInfo.avatar || '',
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
    if (this.conversationType === 'admin') {
      this.unreadByAdmin += 1;
    } else {
      this.unreadByTrainer += 1;
    }
  } else {
    this.unreadByMember += 1;
  }
  
  await this.save();
};

// Method to mark messages as read
conversationSchema.methods.markAsRead = async function (readerRole) {
  if (readerRole === 'admin') {
    this.unreadByAdmin = 0;
  } else if (readerRole === 'trainer') {
    this.unreadByTrainer = 0;
  } else {
    this.unreadByMember = 0;
  }
  await this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
