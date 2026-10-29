const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD for easy queries
  checkInTime: { type: String, default: null },
  checkOutTime: { type: String, default: null },
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day'], default: 'present' },
  totalHours: { type: Number, default: 0 },
  workMode: { type: String, enum: ['Office', 'Remote', 'On-Site'], default: 'Office' },
  remarks: { type: String, default: '' },
  modifiedByManager: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
