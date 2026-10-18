const dns = require('dns');
// Ensure reliable SRV DNS resolution for MongoDB Atlas across Windows network providers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom dns servers cannot be set
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const attendanceRoutes = require('./src/routes/attendance');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
app.use(express.json());
app.use(cors());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/password', authRoutes); // alias for legacy password routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendanceDB';
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/attendanceDB';

async function startServer() {
  try {
    const isAtlas = MONGO_URI.includes('mongodb+srv');
    console.log(`Connecting to MongoDB (${isAtlas ? 'MongoDB Atlas' : 'Local'})...`);
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.warn(`\n⚠️ Primary MongoDB connection failed: ${err.message}`);
    if (MONGO_URI !== LOCAL_MONGO_URI) {
      console.log('🔄 Attempting fallback to local MongoDB (127.0.0.1:27017)...');
      try {
        await mongoose.connect(LOCAL_MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000,
        });
        console.log('✅ Connected to local MongoDB fallback successfully!');
      } catch (localErr) {
        console.error('❌ Local MongoDB fallback failed:', localErr.message);
      }
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Attendance Backend Server running on port ${PORT}`);
  });
}

startServer();
