const mongoose = require('mongoose');
const crypto = require('crypto');

const qrTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      usedAt: {
        type: Date,
      },
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups and auto-deletion
qrTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
qrTokenSchema.index({ token: 1 });

// Static method to generate a new token
qrTokenSchema.statics.generateToken = async function (createdBy, expirySeconds = 15) {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);

  const qrToken = await this.create({
    token,
    expiresAt,
    createdBy,
  });

  return qrToken;
};

// Static method to validate a token
qrTokenSchema.statics.validateToken = async function (token) {
  const qrToken = await this.findOne({ token });

  if (!qrToken) {
    return { valid: false, error: 'Invalid QR code' };
  }

  if (new Date() > qrToken.expiresAt) {
    return { valid: false, error: 'QR code has expired. Please scan the new one.' };
  }

  return { valid: true, qrToken };
};

// Method to mark token as used by a user
qrTokenSchema.methods.markUsedBy = async function (userId) {
  // Check if already used by this user
  const alreadyUsed = this.usedBy.some(
    (use) => use.user.toString() === userId.toString()
  );

  if (alreadyUsed) {
    return false;
  }

  this.usedBy.push({
    user: userId,
    usedAt: new Date(),
  });

  await this.save();
  return true;
};

// Static method to get the latest active token
qrTokenSchema.statics.getLatestActiveToken = async function () {
  return await this.findOne({
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('QRToken', qrTokenSchema);
