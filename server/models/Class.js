const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide class name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide class description'],
    },
    shortDescription: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'Yoga',
        'HIIT',
        'Strength Training',
        'Cardio',
        'Pilates',
        'Zumba',
        'Boxing',
        'CrossFit',
        'Spinning',
        'Swimming',
        'Functional Training',
        'Kickboxing',
        'Dance Fitness',
        'Meditation',
      ],
    },
    category: {
      type: String,
      enum: ['Strength', 'Cardio', 'Flexibility', 'Mind & Body', 'Combat', 'Dance', 'Aquatic'],
      default: 'Cardio',
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
    },
    trainerName: {
      type: String,
    },
    schedule: {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      startTime: {
        type: String,
      },
      endTime: {
        type: String,
      },
    },
    schedules: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: String,
        endTime: String,
      },
    ],
    duration: {
      type: Number,
      default: 60,
    },
    capacity: {
      type: Number,
      default: 20,
    },
    enrolledMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
      default: 'all-levels',
    },
    location: {
      type: String,
      default: 'Main Studio',
    },
    image: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '🏋️',
    },
    color: {
      type: String,
      default: 'primary',
    },
    benefits: [String],
    equipment: [String],
    calories: {
      type: Number,
      default: 300,
    },
    intensity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High'],
      default: 'Medium',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug before saving
classSchema.pre('save', async function () {
  try {
    if (!this.slug) {
      const baseSlug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      let slug = baseSlug;
      let counter = 1;
      
      // Check for existing slugs and add suffix if needed
      const Class = mongoose.model('Class');
      while (await Class.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      this.slug = slug;
    }
  } catch (error) {
    console.error('Error generating slug:', error);
    // Generate a unique slug with timestamp as fallback
    this.slug = `${this.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }
});

// Virtual for available spots
classSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.enrolledMembers.length;
});

module.exports = mongoose.model('Class', classSchema);
