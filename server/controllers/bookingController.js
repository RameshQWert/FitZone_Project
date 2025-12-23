const asyncHandler = require('express-async-handler');
const { Booking, Waitlist, RecurringBooking, Class, Member } = require('../models');

// @desc    Get available time slots for a class on a specific date
// @route   GET /api/bookings/availability/:classId/:date
// @access  Public
const getClassAvailability = asyncHandler(async (req, res) => {
  const { classId, date } = req.params;

  const classItem = await Class.findById(classId);
  if (!classItem) {
    res.status(404);
    throw new Error('Class not found');
  }

  // Get all bookings for this class on this date
  const bookings = await Booking.find({
    class: classId,
    bookingDate: new Date(date),
    status: { $ne: 'cancelled' }
  });

  // Get all waitlist entries for this class on this date
  const waitlistCount = await Waitlist.countDocuments({
    class: classId,
    bookingDate: new Date(date),
    status: 'waiting'
  });

  const bookedCount = bookings.length;
  const availableSpots = Math.max(0, classItem.capacity - bookedCount);
  const isFull = availableSpots <= 0;

  res.json({
    success: true,
    data: {
      classId,
      date,
      capacity: classItem.capacity,
      bookedCount,
      availableSpots,
      waitlistCount,
      isFull,
      canBook: availableSpots > 0,
      canJoinWaitlist: true, // Always allow waitlist
    },
  });
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { classId, bookingDate, startTime, endTime, notes } = req.body;
  const memberId = req.user._id;

  // Validate required fields
  if (!classId || !bookingDate || !startTime || !endTime) {
    res.status(400);
    throw new Error('All booking details are required');
  }

  // Check if class exists
  const classItem = await Class.findById(classId);
  if (!classItem) {
    res.status(404);
    throw new Error('Class not found');
  }

  // Check if member exists
  const member = await Member.findOne({ user: memberId });
  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  // Check if already booked for this time slot
  const existingBooking = await Booking.findOne({
    member: member._id,
    class: classId,
    bookingDate: new Date(bookingDate),
    startTime,
    status: { $ne: 'cancelled' }
  });

  if (existingBooking) {
    res.status(400);
    throw new Error('You already have a booking for this class at this time');
  }

  // Check availability
  const bookingsCount = await Booking.countDocuments({
    class: classId,
    bookingDate: new Date(bookingDate),
    startTime,
    status: { $ne: 'cancelled' }
  });

  if (bookingsCount >= classItem.capacity) {
    // Class is full - add to waitlist instead
    const waitlistPosition = await Waitlist.countDocuments({
      class: classId,
      bookingDate: new Date(bookingDate),
      startTime,
      status: 'waiting'
    }) + 1;

    const waitlistEntry = await Waitlist.create({
      member: member._id,
      class: classId,
      className: classItem.name,
      bookingDate: new Date(bookingDate),
      startTime,
      position: waitlistPosition,
      expiresAt: new Date(bookingDate + 'T' + endTime)
    });

    return res.status(201).json({
      success: true,
      message: 'Class is full. You have been added to the waitlist.',
      data: {
        type: 'waitlist',
        waitlistEntry,
        position: waitlistPosition
      }
    });
  }

  // Create booking
  const booking = await Booking.create({
    member: member._id,
    class: classId,
    className: classItem.name,
    trainer: classItem.trainer,
    trainerName: classItem.trainerName,
    bookingDate: new Date(bookingDate),
    startTime,
    endTime,
    duration: classItem.duration,
    location: classItem.location,
    notes
  });

  // Populate the booking data
  await booking.populate([
    { path: 'member', select: 'user', populate: { path: 'user', select: 'fullName email' } },
    { path: 'class' },
    { path: 'trainer', populate: { path: 'user', select: 'fullName' } }
  ]);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
  const memberId = req.user._id;
  const member = await Member.findOne({ user: memberId });

  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  const bookings = await Booking.find({ member: member._id })
    .populate('class')
    .populate('trainer', 'user', 'User')
    .sort({ bookingDate: 1, startTime: 1 });

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(booking =>
    new Date(booking.bookingDate) > now || (
      new Date(booking.bookingDate).toDateString() === now.toDateString() &&
      booking.startTime > now.toLocaleTimeString('en-US', { hour12: false })
    )
  );

  const pastBookings = bookings.filter(booking =>
    new Date(booking.bookingDate) < now || (
      new Date(booking.bookingDate).toDateString() === now.toDateString() &&
      booking.startTime <= now.toLocaleTimeString('en-US', { hour12: false })
    )
  );

  res.json({
    success: true,
    data: {
      upcoming: upcomingBookings,
      past: pastBookings,
      total: bookings.length
    }
  });
});

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const memberId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if user owns this booking
  const member = await Member.findOne({ user: memberId });
  if (!booking.member.equals(member._id)) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  // Check if booking can be cancelled (not in the past)
  const bookingDateTime = new Date(booking.bookingDate + 'T' + booking.startTime);
  const now = new Date();
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

  if (hoursUntilBooking < 2) {
    res.status(400);
    throw new Error('Bookings can only be cancelled at least 2 hours in advance');
  }

  // Update booking status
  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  await booking.save();

  // Check if there's a waitlist and offer spot to next person
  const waitlistEntry = await Waitlist.findOne({
    class: booking.class,
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
    status: 'waiting'
  }).sort({ position: 1 });

  if (waitlistEntry) {
    // Convert waitlist entry to booking
    const classItem = await Class.findById(booking.class);

    const newBooking = await Booking.create({
      member: waitlistEntry.member,
      class: waitlistEntry.class,
      className: waitlistEntry.className,
      bookingDate: waitlistEntry.bookingDate,
      startTime: waitlistEntry.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      location: booking.location,
      status: 'confirmed'
    });

    // Update waitlist entry
    waitlistEntry.status = 'converted';
    await waitlistEntry.save();

    // Notify user about the conversion (you could add email/SMS notification here)
  }

  res.json({
    success: true,
    message: 'Booking cancelled successfully'
  });
});

// @desc    Get user's waitlist entries
// @route   GET /api/bookings/waitlist
// @access  Private
const getUserWaitlist = asyncHandler(async (req, res) => {
  const memberId = req.user._id;
  const member = await Member.findOne({ user: memberId });

  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  const waitlistEntries = await Waitlist.find({
    member: member._id,
    status: { $in: ['waiting', 'offered'] }
  })
    .populate('class')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: waitlistEntries
  });
});

// @desc    Remove from waitlist
// @route   DELETE /api/bookings/waitlist/:id
// @access  Private
const removeFromWaitlist = asyncHandler(async (req, res) => {
  const waitlistId = req.params.id;
  const memberId = req.user._id;

  const waitlistEntry = await Waitlist.findById(waitlistId);
  if (!waitlistEntry) {
    res.status(404);
    throw new Error('Waitlist entry not found');
  }

  // Check if user owns this waitlist entry
  const member = await Member.findOne({ user: memberId });
  if (!waitlistEntry.member.equals(member._id)) {
    res.status(403);
    throw new Error('Not authorized to remove this waitlist entry');
  }

  waitlistEntry.status = 'expired';
  await waitlistEntry.save();

  res.json({
    success: true,
    message: 'Removed from waitlist successfully'
  });
});

// @desc    Create recurring booking
// @route   POST /api/bookings/recurring
// @access  Private
const createRecurringBooking = asyncHandler(async (req, res) => {
  const {
    classId,
    recurrenceType,
    recurrenceDay,
    startDate,
    endDate,
    startTime,
    endTime,
    notes
  } = req.body;
  const memberId = req.user._id;

  // Validate required fields
  if (!classId || !recurrenceType || !recurrenceDay || !startDate || !endDate || !startTime || !endTime) {
    res.status(400);
    throw new Error('All recurring booking details are required');
  }

  // Check if class exists
  const classItem = await Class.findById(classId);
  if (!classItem) {
    res.status(404);
    throw new Error('Class not found');
  }

  // Check if member exists
  const member = await Member.findOne({ user: memberId });
  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  // Calculate total sessions
  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalSessions = 0;

  if (recurrenceType === 'weekly') {
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    totalSessions = Math.floor(daysDiff / 7) + 1;
  } else if (recurrenceType === 'monthly') {
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalSessions = monthsDiff + 1;
  }

  // Create recurring booking
  const recurringBooking = await RecurringBooking.create({
    member: member._id,
    class: classId,
    className: classItem.name,
    trainer: classItem.trainer,
    trainerName: classItem.trainerName,
    recurrenceType,
    recurrenceDay,
    startDate,
    endDate,
    startTime,
    endTime,
    duration: classItem.duration,
    totalSessions,
    location: classItem.location,
    notes
  });

  // Generate individual bookings for the recurring schedule
  const bookings = [];
  let currentDate = new Date(startDate);

  while (currentDate <= end) {
    // Check if current date matches the recurrence day
    const currentDayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

    if (currentDayName === recurrenceDay) {
      // Check availability and create booking
      const bookingsCount = await Booking.countDocuments({
        class: classId,
        bookingDate: new Date(currentDate),
        startTime,
        status: { $ne: 'cancelled' }
      });

      if (bookingsCount < classItem.capacity) {
        const booking = await Booking.create({
          member: member._id,
          class: classId,
          className: classItem.name,
          trainer: classItem.trainer,
          trainerName: classItem.trainerName,
          bookingDate: new Date(currentDate),
          startTime,
          endTime,
          duration: classItem.duration,
          location: classItem.location,
          bookingType: 'recurring',
          recurringBooking: recurringBooking._id
        });
        bookings.push(booking);
      }
    }

    // Move to next occurrence
    if (recurrenceType === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (recurrenceType === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  res.status(201).json({
    success: true,
    message: `Recurring booking created with ${bookings.length} individual bookings`,
    data: {
      recurringBooking,
      bookingsCreated: bookings.length,
      totalSessions
    }
  });
});

// @desc    Get user's recurring bookings
// @route   GET /api/bookings/recurring
// @access  Private
const getUserRecurringBookings = asyncHandler(async (req, res) => {
  const memberId = req.user._id;
  const member = await Member.findOne({ user: memberId });

  if (!member) {
    res.status(404);
    throw new Error('Member profile not found');
  }

  const recurringBookings = await RecurringBooking.find({
    member: member._id,
    status: { $ne: 'cancelled' }
  })
    .populate('class')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: recurringBookings
  });
});

// @desc    Get all bookings (for trainers/admins)
// @route   GET /api/bookings
// @access  Private/Trainer
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate({
      path: 'member',
      populate: { path: 'user', select: 'fullName email avatar' }
    })
    .populate('class')
    .populate({
      path: 'trainer',
      populate: { path: 'user', select: 'fullName' }
    })
    .sort({ bookingDate: -1, startTime: -1 });

  res.json({
    success: true,
    data: bookings
  });
});

module.exports = {
  getClassAvailability,
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  getUserWaitlist,
  removeFromWaitlist,
  createRecurringBooking,
  getUserRecurringBookings,
};