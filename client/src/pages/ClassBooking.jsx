import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { classService, bookingService } from '../services';

const ClassBooking = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availability, setAvailability] = useState(null);
  const [notes, setNotes] = useState('');
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurringData, setRecurringData] = useState({
    recurrenceType: 'weekly',
    recurrenceDay: '',
    endDate: ''
  });

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await classService.getClassById(classId);
      setClassData(response.data);
    } catch (error) {
      toast.error('Failed to load class details');
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (date, time) => {
    if (!date || !time) return;

    try {
      const response = await bookingService.getClassAvailability(classId, date);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  useEffect(() => {
    if (selectedDate && selectedTime) {
      checkAvailability(selectedDate, selectedTime);
    }
  }, [selectedDate, selectedTime]);

  const generateTimeSlots = () => {
    if (!classData?.schedules?.length) return [];

    const slots = [];
    classData.schedules.forEach(schedule => {
      // Generate slots for the next 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (dayName === schedule.day) {
          slots.push({
            date: date.toISOString().split('T')[0],
            time: schedule.startTime,
            endTime: schedule.endTime,
            day: dayName,
            formattedDate: date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })
          });
        }
      }
    });

    return slots.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setBookingLoading(true);
    try {
      if (showRecurring) {
        // Create recurring booking
        const endTime = generateTimeSlots().find(
          slot => slot.date === selectedDate && slot.time === selectedTime
        )?.endTime;

        await bookingService.createRecurringBooking({
          classId,
          recurrenceType: recurringData.recurrenceType,
          recurrenceDay: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }),
          startDate: selectedDate,
          endDate: recurringData.endDate,
          startTime: selectedTime,
          endTime,
          notes
        });

        toast.success('Recurring booking created successfully!');
      } else {
        // Create single booking
        const endTime = generateTimeSlots().find(
          slot => slot.date === selectedDate && slot.time === selectedTime
        )?.endTime;

        const result = await bookingService.createBooking({
          classId,
          bookingDate: selectedDate,
          startTime: selectedTime,
          endTime,
          notes
        });

        if (result.data?.type === 'waitlist') {
          toast.success(`Added to waitlist (Position: ${result.data.position})`);
        } else {
          toast.success('Booking created successfully!');
        }
      }

      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="text-white">Class not found</div>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-dark-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Book Class</h1>
            <p className="text-white/80">Reserve your spot in {classData.name}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Class Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-4">{classData.name}</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{classData.icon}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{classData.type}</p>
                  <p className="text-gray-400 text-sm">{classData.category}</p>
                </div>
              </div>

              {classData.trainerName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-500 rounded-xl flex items-center justify-center">
                    <span className="text-white">👨‍🏫</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Trainer</p>
                    <p className="text-gray-400 text-sm">{classData.trainerName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
                  <span className="text-white">⏱️</span>
                </div>
                <div>
                  <p className="text-white font-medium">Duration</p>
                  <p className="text-gray-400 text-sm">{classData.duration} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <span className="text-white">📍</span>
                </div>
                <div>
                  <p className="text-white font-medium">Location</p>
                  <p className="text-gray-400 text-sm">{classData.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-gray-300 text-sm leading-relaxed">
                {classData.description}
              </p>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-6">Select Date & Time</h3>

            {/* Date Selection - Card Style */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">📅 Select Date</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...new Set(timeSlots.map(slot => slot.date))].map(date => {
                  const slot = timeSlots.find(s => s.date === date);
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = dateObj.getDate();
                  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                  const isSelected = selectedDate === date;
                  const isToday = new Date().toDateString() === dateObj.toDateString();
                  
                  return (
                    <motion.button
                      key={date}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime('');
                      }}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-br from-primary-500 to-secondary-500 border-transparent shadow-lg shadow-primary-500/30'
                          : 'bg-dark-400/50 border-white/10 hover:border-primary-500/50 hover:bg-dark-400'
                      }`}
                    >
                      {isToday && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                          TODAY
                        </span>
                      )}
                      <div className="text-center">
                        <p className={`text-xs font-medium uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {dayName}
                        </p>
                        <p className={`text-3xl font-bold my-1 ${isSelected ? 'text-white' : 'text-white'}`}>
                          {dayNum}
                        </p>
                        <p className={`text-sm font-medium ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                          {monthName}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {timeSlots.length === 0 && (
                <p className="text-yellow-400 text-sm mt-3 text-center">
                  No available slots for this class in the next 7 days.
                </p>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <label className="block text-white font-medium mb-3">⏰ Select Time</label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots
                    .filter(slot => slot.date === selectedDate)
                    .map((slot, index) => {
                      const isSelected = selectedTime === slot.time;
                      const [hours, minutes] = slot.time.split(':');
                      const hour = parseInt(hours);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 || 12;
                      
                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-br from-primary-500 to-secondary-500 border-transparent shadow-lg shadow-primary-500/30'
                              : 'bg-dark-400/50 border-white/10 hover:border-primary-500/50 hover:bg-dark-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
                              {displayHour}:{minutes}
                            </span>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded-md ${
                              isSelected 
                                ? 'bg-white/20 text-white' 
                                : 'bg-primary-500/20 text-primary-400'
                            }`}>
                              {ampm}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                            {slot.day} • {classData.duration} min
                          </p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                            >
                              <svg className="w-3 h-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* Availability Info */}
            {availability && (
              <div className="mb-6 p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Availability</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    availability.isFull ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {availability.availableSpots} spots left
                  </span>
                </div>
                {availability.isFull && (
                  <p className="text-yellow-400 text-sm">
                    Class is full. You'll be added to the waitlist.
                  </p>
                )}
              </div>
            )}

            {/* Recurring Booking Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRecurring}
                  onChange={(e) => setShowRecurring(e.target.checked)}
                  className="w-4 h-4 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                />
                <span className="text-white font-medium">Make this a recurring booking</span>
              </label>
            </div>

            {/* Recurring Options */}
            {showRecurring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 space-y-4 p-4 bg-dark-400/50 rounded-xl border border-white/10"
              >
                <div>
                  <label className="block text-white font-medium mb-2">🔄 Recurrence</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRecurringData({...recurringData, recurrenceType: 'weekly'})}
                      className={`p-3 rounded-xl font-medium transition-all ${
                        recurringData.recurrenceType === 'weekly'
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setRecurringData({...recurringData, recurrenceType: 'monthly'})}
                      className={`p-3 rounded-xl font-medium transition-all ${
                        recurringData.recurrenceType === 'monthly'
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">📆 End Date</label>
                  <input
                    type="date"
                    value={recurringData.endDate}
                    onChange={(e) => setRecurringData({...recurringData, endDate: e.target.value})}
                    min={selectedDate}
                    className="w-full px-4 py-3 bg-dark-300 border border-white/20 rounded-xl text-white focus:outline-none focus:border-primary-500 [color-scheme:dark]"
                  />
                </div>
              </motion.div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 resize-none"
                rows={3}
              />
            </div>

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={bookingLoading || !selectedDate || !selectedTime}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : showRecurring ? (
                'Create Recurring Booking'
              ) : availability?.isFull ? (
                'Join Waitlist'
              ) : (
                'Book Class'
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClassBooking;