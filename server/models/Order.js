const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: String,
  color: String,
  flavor: String
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderNumber: {
      type: String,
      unique: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      email: String,
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'India'
      }
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    statusHistory: [{
      status: String,
      date: {
        type: Date,
        default: Date.now
      },
      note: String
    }],
    itemsTotal: {
      type: Number,
      required: true
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    couponCode: String,
    notes: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String
  },
  {
    timestamps: true
  }
);

// Generate order number before saving
orderSchema.pre('save', function() {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `FZ-${timestamp}-${random}`;
  }
});

// Add initial status to history
orderSchema.pre('save', function() {
  if (this.isNew) {
    this.statusHistory.push({
      status: 'pending',
      note: 'Order placed'
    });
  }
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
