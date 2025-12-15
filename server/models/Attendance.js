const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // Duration in minutes
      default: null,
    },
    qrToken: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['checked-in', 'checked-out'],
      default: 'checked-in',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
attendanceSchema.index({ user: 1, date: 1 });
attendanceSchema.index({ date: 1 });

// Static method to check if user already marked attendance today
attendanceSchema.statics.hasMarkedToday = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await this.findOne({
    user: userId,
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  return attendance !== null;
};

// Static method to get attendance stats for a user
attendanceSchema.statics.getUserStats = async function (userId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalVisits: { $sum: 1 },
        dates: { $push: '$date' },
      },
    },
  ]);

  return stats[0] || { totalVisits: 0, dates: [] };
};

module.exports = mongoose.model('Attendance', attendanceSchema);
