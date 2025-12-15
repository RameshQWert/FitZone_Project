const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS - Allow specific origins in production, all in development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,  // Add your Vercel URL here
].filter(Boolean);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed => origin.startsWith(allowed) || origin.includes('vercel.app'))) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      }
    : true,  // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ai-chat', require('./routes/aiChatRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/site-content', require('./routes/siteContentRoutes'));

// Root route - API welcome
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to FitZone API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      members: '/api/members',
      trainers: '/api/trainers',
      products: '/api/products',
    }
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FitZone API is running',
    timestamp: new Date().toISOString()
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitzone');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;

// Socket.io Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`);
  
  // Join user's personal room
  socket.join(`user:${socket.userId}`);
  
  // Admin joins admin room
  if (socket.userRole === 'admin') {
    socket.join('admin-room');
    console.log('Admin joined admin-room');
  }
  
  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${socket.userId} joined conversation: ${conversationId}`);
  });
  
  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`User ${socket.userId} left conversation: ${conversationId}`);
  });
  
  // Handle new message
  socket.on('send-message', async (data) => {
    const { conversationId, content, recipientId } = data;
    
    // Emit to conversation room (for real-time chat)
    socket.to(`conversation:${conversationId}`).emit('new-message', {
      conversationId,
      content,
      sender: socket.userId,
      senderRole: socket.userRole === 'admin' ? 'admin' : 'member',
      createdAt: new Date(),
    });
    
    // Notify recipient
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('message-notification', {
        conversationId,
        preview: content.substring(0, 50),
      });
    }
    
    // Notify admin room for new member messages
    if (socket.userRole !== 'admin') {
      io.to('admin-room').emit('new-member-message', {
        conversationId,
        memberId: socket.userId,
        preview: content.substring(0, 50),
      });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (conversationId) => {
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      conversationId,
      userId: socket.userId,
      userRole: socket.userRole,
    });
  });
  
  // Handle stop typing
  socket.on('stop-typing', (conversationId) => {
    socket.to(`conversation:${conversationId}`).emit('user-stop-typing', {
      conversationId,
      userId: socket.userId,
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 Socket.io is ready for real-time communication`);
  });
});

module.exports = { app, io };
