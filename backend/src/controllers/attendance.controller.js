const Attendance = require("../models/Attendance.js");
const User = require("../models/User.js");

// Format today's date as YYYY-MM-DD
const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// CHECK IN
exports.checkIn = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const date = todayStr();
    let att = await Attendance.findOne({ userId, date });
    const now = new Date().toISOString();

    if (!att) {
      att = await Attendance.create({
        userId,
        date,
        checkInTime: now,
        status: "present",
      });
      return res.json(att);
    }

    if (att.checkInTime) {
      return res.status(400).json({
        message: "You have already checked in today. Please check in again tomorrow."
      });
    }

    att.checkInTime = now;
    await att.save();
    res.json(att);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// CHECK OUT
exports.checkOut = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const date = todayStr();
    let att = await Attendance.findOne({ userId, date });

    if (!att || !att.checkInTime) {
      return res.status(400).json({ message: "You haven't checked in yet" });
    }

    if (att.checkOutTime) {
      return res.status(400).json({ message: "Already checked out" });
    }

    const now = new Date().toISOString();
    att.checkOutTime = now;

    const start = new Date(att.checkInTime);
    const end = new Date(att.checkOutTime);
    const diff = (end - start) / (1000 * 60 * 60);
    att.totalHours = parseFloat(diff.toFixed(2));

    await att.save();
    res.json(att);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// EMPLOYEE HISTORY
exports.myHistory = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const list = await Attendance.find({ userId }).sort({ date: -1 });
    res.json(list);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// TODAY STATUS
exports.todayStatus = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const date = todayStr();
    const att = await Attendance.findOne({ userId, date });

    if (!att) return res.json({ status: "absent", date });

    return res.json({
      status: att.checkInTime ? "present" : "absent",
      attendance: att,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// MANAGER — ALL RECORDS (ONLY EMPLOYEES)
exports.allAttendance = async (req, res) => {
  try {
    let records = await Attendance.find()
      .populate("userId", "name employeeId role")
      .sort({ date: -1 });

    records = records.filter(r => r.userId && r.userId.role === "employee");

    const formatted = records.map(r => ({
      _id: r._id,   // <-- FIXED
      name: r.userId.name,
      employeeId: r.userId.employeeId,
      date: r.date,
      checkInTime: r.checkInTime || "-",
      checkOutTime: r.checkOutTime || "-",
      totalHours: r.totalHours || "-",
      status: r.status
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// MANAGER — TODAY'S STATUS OF ALL EMPLOYEES
// MANAGER — TODAY STATUS OF ALL EMPLOYEES
exports.allEmployeesToday = async (req, res) => {
  try {
    const date = todayStr();

    const attendance = await Attendance.find({ date })
      .populate("userId", "name employeeId role");

    const users = await User.find({ role: "employee" }, "name employeeId");

    const result = users.map(user => {
      const rec = attendance.find(
        a => a.userId && a.userId._id.toString() === user._id.toString()
      );

      return {
        _id: rec ? rec._id : user._id,   // <-- FIXED (React key)
        name: user.name,
        employeeId: user.employeeId,
        date,
        checkInTime: rec ? rec.checkInTime : "-",
        checkOutTime: rec ? rec.checkOutTime : "-",
        totalHours: rec ? rec.totalHours : "-",
        status: rec ? "present" : "absent"
      };
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
