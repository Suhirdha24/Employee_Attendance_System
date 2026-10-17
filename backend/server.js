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

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  app.listen(PORT, () => console.log(`Attendance Backend Server running on port ${PORT}`));
})
.catch(err => {
  console.error('Mongo connection error:', err.message);
});
