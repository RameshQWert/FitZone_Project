const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['supplements', 'clothing', 'equipment', 'accessories']
    },
    subcategory: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    images: [{
      url: {
        type: String,
        required: true
      },
      publicId: String,
      alt: String
    }],
    thumbnail: {
      type: String
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    // For clothing
    sizes: [{
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12']
    }],
    colors: [{
      name: String,
      hexCode: String
    }],
    // For equipment
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs', 'g']
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches', 'm']
      }
    },
    // For supplements
    flavor: [String],
    servings: Number,
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    },
    // Common fields
    tags: [String],
    features: [String],
    specifications: [{
      key: String,
      value: String
    }],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    soldCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Generate slug before saving
productSchema.pre('save', function() {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  }
  if (!this.thumbnail && this.images && this.images.length > 0) {
    this.thumbnail = this.images[0].url;
  }
});

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ soldCount: -1 });

module.exports = mongoose.model('Product', productSchema);
