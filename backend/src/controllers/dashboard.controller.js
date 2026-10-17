const User = require("../models/User");
const Attendance = require("../models/Attendance");

const todayStr = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// EMPLOYEE DASHBOARD STATS
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const date = todayStr();
    const todayRecord = await Attendance.findOne({ userId, date });
    const records = await Attendance.find({ userId }).sort({ date: -1 });

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === "present").length;
    const lateDays = records.filter((r) => r.status === "late").length;
    const halfDays = records.filter((r) => r.status === "half-day").length;
    const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);

    const attendanceRate =
      totalDays > 0
        ? (((presentDays + lateDays + halfDays * 0.5) / totalDays) * 100).toFixed(1)
        : 100;

    res.json({
      today: {
        date,
        status: todayRecord ? todayRecord.status : "absent",
        checkInTime: todayRecord?.checkInTime || null,
        checkOutTime: todayRecord?.checkOutTime || null,
        totalHours: todayRecord?.totalHours || 0,
      },
      stats: {
        totalDays,
        presentDays,
        lateDays,
        halfDays,
        totalHours: parseFloat(totalHours.toFixed(1)),
        avgHours: totalDays > 0 ? parseFloat((totalHours / totalDays).toFixed(1)) : 0,
        attendanceRate: parseFloat(attendanceRate),
      },
      recentActivity: records.slice(0, 5),
    });
  } catch (err) {
    console.error("Employee dashboard stats error:", err);
    res.status(500).json({ message: "Server error fetching employee dashboard" });
  }
};

// MANAGER DASHBOARD STATS
exports.getManagerDashboard = async (req, res) => {
  try {
    const date = todayStr();
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const todayRecords = await Attendance.find({ date }).populate("userId", "name employeeId department role");

    const validToday = todayRecords.filter((r) => r.userId && r.userId.role === "employee");

    const presentToday = validToday.filter((r) => r.status === "present").length;
    const lateToday = validToday.filter((r) => r.status === "late").length;
    const halfDayToday = validToday.filter((r) => r.status === "half-day").length;
    const totalActive = presentToday + lateToday + halfDayToday;
    const absentToday = Math.max(0, totalEmployees - totalActive);

    const attendanceRate = totalEmployees > 0 ? ((totalActive / totalEmployees) * 100).toFixed(1) : 0;

    // Past 7 days attendance trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const startRange = todayStr(sevenDaysAgo);

    const pastRecords = await Attendance.find({
      date: { $gte: startRange, $lte: date },
    }).populate("userId", "role");

    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayDate = todayStr(d);
      const dayRecords = pastRecords.filter(
        (r) => r.date === dayDate && r.userId && r.userId.role === "employee"
      );

      dailyTrends.push({
        date: dayDate,
        present: dayRecords.filter((r) => r.status === "present" || r.status === "late").length,
        hours: parseFloat(
          dayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(1)
        ),
      });
    }

    res.json({
      overview: {
        date,
        totalEmployees,
        presentToday,
        lateToday,
        halfDayToday,
        absentToday,
        attendanceRate: parseFloat(attendanceRate),
      },
      dailyTrends,
      recentCheckIns: validToday.slice(0, 8).map((r) => ({
        _id: r._id,
        name: r.userId.name,
        employeeId: r.userId.employeeId,
        department: r.userId.department || "General",
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
        status: r.status,
      })),
    });
  } catch (err) {
    console.error("Manager dashboard stats error:", err);
    res.status(500).json({ message: "Server error fetching manager dashboard" });
  }
};
