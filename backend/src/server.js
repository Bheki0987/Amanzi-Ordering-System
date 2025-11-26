require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  w: 'majority'
};

// Retry connection logic
let connectionAttempts = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectWithRetry = async () => {
  try {
    connectionAttempts++;
    console.log(`📡 Attempting MongoDB connection (attempt ${connectionAttempts}/${MAX_RETRIES})...`);
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(MONGODB_URI, mongoOptions);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🖥️  Host: ${mongoose.connection.host}`);
    
    connectionAttempts = 0; // Reset on success
    
    // Start server only after successful DB connection
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📝 API Docs: http://localhost:${PORT}/`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⚠️  SIGTERM received, shutting down gracefully...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error (attempt ${connectionAttempts}):`, error.message);
    
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      setTimeout(connectWithRetry, RETRY_DELAY);
    } else {
      console.error('💥 Max retries reached. Unable to connect to MongoDB.');
      console.error('Please check:');
      console.error('  1. MongoDB Atlas cluster is running');
      console.error('  2. Network access allows your IP (or 0.0.0.0/0 for testing)');
      console.error('  3. Database user credentials are correct');
      console.error('  4. Connection string format: mongodb+srv://user:pass@cluster.mongodb.net/dbname');
      process.exit(1);
    }
  }
};

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔌 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  // Don't exit immediately, let retry logic handle it
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Start initial connection
connectWithRetry();