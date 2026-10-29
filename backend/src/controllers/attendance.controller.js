const Attendance = require("../models/Attendance.js");
const User = require("../models/User.js");

// Format date as YYYY-MM-DD
const todayStr = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// CHECK IN
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const { workMode, remarks } = req.body;
    const date = todayStr();
    let att = await Attendance.findOne({ userId, date });
    const now = new Date();
    const nowIso = now.toISOString();

    // Check if late (after 9:30 AM local time)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const initialStatus = isLate ? "late" : "present";

    if (!att) {
      att = await Attendance.create({
        userId,
        date,
        checkInTime: nowIso,
        status: initialStatus,
        workMode: workMode || "Office",
        remarks: remarks || "",
      });
      return res.json({
        message: isLate ? "Checked in (Marked Late: after 09:30 AM)" : "Check-in successful",
        attendance: att,
      });
    }

    if (att.checkInTime) {
      return res.status(400).json({
        message: "You have already checked in today. Please check in again tomorrow.",
      });
    }

    att.checkInTime = nowIso;
    att.status = initialStatus;
    if (workMode) att.workMode = workMode;
    if (remarks) att.remarks = remarks;
    await att.save();

    res.json({
      message: isLate ? "Checked in (Marked Late: after 09:30 AM)" : "Check-in successful",
      attendance: att,
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Server error during check-in" });
  }
};

// CHECK OUT
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const { remarks } = req.body;
    const date = todayStr();
    let att = await Attendance.findOne({ userId, date });

    if (!att || !att.checkInTime) {
      return res.status(400).json({ message: "You have not checked in yet today" });
    }

    if (att.checkOutTime) {
      return res.status(400).json({ message: "Already checked out for today" });
    }

    const now = new Date();
    att.checkOutTime = now.toISOString();

    const start = new Date(att.checkInTime);
    const end = new Date(att.checkOutTime);
    const diffHours = (end - start) / (1000 * 60 * 60);
    att.totalHours = parseFloat(diffHours.toFixed(2));

    // Smart status adjustment: if working hours < 4.5 hours -> half-day
    if (att.totalHours < 4.5) {
      att.status = "half-day";
    }

    if (remarks) {
      att.remarks = att.remarks ? `${att.remarks} | ${remarks}` : remarks;
    }

    await att.save();
    res.json({
      message: `Checked out successfully. Total working hours: ${att.totalHours} hrs`,
      attendance: att,
    });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: "Server error during check-out" });
  }
};

// EMPLOYEE ATTENDANCE HISTORY
exports.myHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const list = await Attendance.find({ userId }).sort({ date: -1 });
    res.json(list);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Server error retrieving history" });
  }
};

// TODAY STATUS FOR SINGLE EMPLOYEE
exports.todayStatus = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const date = todayStr();
    const att = await Attendance.findOne({ userId, date });

    if (!att || !att.checkInTime) {
      return res.json({
        status: "absent",
        date,
        attendance: null,
      });
    }

    return res.json({
      status: att.status,
      date,
      attendance: att,
    });
  } catch (err) {
    console.error("Today status error:", err);
    res.status(500).json({ message: "Server error retrieving today's status" });
  }
};

// EMPLOYEE MONTHLY SUMMARY
exports.mySummary = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const records = await Attendance.find({ userId }).sort({ date: -1 });

    const totalDaysRecorded = records.length;
    const presentCount = records.filter((r) => r.status === "present").length;
    const lateCount = records.filter((r) => r.status === "late").length;
    const halfDayCount = records.filter((r) => r.status === "half-day").length;
    const absentCount = records.filter((r) => r.status === "absent").length;

    const totalHours = records.reduce((acc, r) => acc + (r.totalHours || 0), 0);
    const avgHours = totalDaysRecorded > 0 ? (totalHours / totalDaysRecorded).toFixed(1) : 0;
    const attendancePercentage =
      totalDaysRecorded > 0
        ? (((presentCount + lateCount + halfDayCount * 0.5) / totalDaysRecorded) * 100).toFixed(1)
        : 100;

    res.json({
      totalDaysRecorded,
      presentCount,
      lateCount,
      halfDayCount,
      absentCount,
      totalHours: parseFloat(totalHours.toFixed(1)),
      avgHours: parseFloat(avgHours),
      attendancePercentage: parseFloat(attendancePercentage),
      recentRecords: records.slice(0, 10),
    });
  } catch (err) {
    console.error("My summary error:", err);
    res.status(500).json({ message: "Server error retrieving summary" });
  }
};

// MANAGER — ALL ATTENDANCE RECORDS (WITH SEARCH & FILTER)
exports.allAttendance = async (req, res) => {
  try {
    const { search, department, status, startDate, endDate, workMode } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (workMode && workMode !== "all") {
      query.workMode = workMode;
    }

    let records = await Attendance.find(query)
      .populate("userId", "name employeeId email department role")
      .sort({ date: -1 });

    // Filter by role and optional search / department
    records = records.filter((r) => r.userId && r.userId.role === "employee");

    if (department && department !== "all") {
      records = records.filter(
        (r) => r.userId.department && r.userId.department.toLowerCase() === department.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.userId.name.toLowerCase().includes(q) ||
          r.userId.employeeId.toLowerCase().includes(q) ||
          (r.userId.department && r.userId.department.toLowerCase().includes(q))
      );
    }

    const formatted = records.map((r) => ({
      _id: r._id,
      userId: r.userId._id,
      name: r.userId.name,
      employeeId: r.userId.employeeId,
      department: r.userId.department || "General",
      email: r.userId.email,
      date: r.date,
      checkInTime: r.checkInTime || "-",
      checkOutTime: r.checkOutTime || "-",
      totalHours: r.totalHours || "-",
      status: r.status,
      workMode: r.workMode || "Office",
      remarks: r.remarks || "",
      modifiedByManager: Boolean(r.modifiedByManager),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("All attendance error:", err);
    res.status(500).json({ message: "Server error retrieving all records" });
  }
};

// MANAGER — TODAY'S STATUS OF ALL EMPLOYEES
exports.allEmployeesToday = async (req, res) => {
  try {
    const date = todayStr();
    const { department, search } = req.query;

    const attendance = await Attendance.find({ date }).populate(
      "userId",
      "name employeeId email department role"
    );

    let userQuery = { role: "employee" };
    if (department && department !== "all") {
      userQuery.department = department;
    }

    let users = await User.find(userQuery, "name employeeId email department role");

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.employeeId.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }

    const result = users.map((user) => {
      const rec = attendance.find(
        (a) => a.userId && a.userId._id.toString() === user._id.toString()
      );

      return {
        _id: rec ? rec._id : `virtual-${user._id}`,
        userId: user._id,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department || "General",
        email: user.email,
        date,
        checkInTime: rec ? rec.checkInTime : "-",
        checkOutTime: rec ? rec.checkOutTime : "-",
        totalHours: rec ? rec.totalHours : "-",
        status: rec ? rec.status : "absent",
        workMode: rec ? (rec.workMode || "Office") : "Office",
        remarks: rec ? (rec.remarks || "") : "",
        modifiedByManager: rec ? Boolean(rec.modifiedByManager) : false,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Today's all employees error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// MANAGER — SPECIFIC EMPLOYEE HISTORY
exports.employeeHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const history = await Attendance.find({ userId: id }).sort({ date: -1 });

    const totalDays = history.length;
    const presentDays = history.filter((h) => h.status === "present").length;
    const lateDays = history.filter((h) => h.status === "late").length;
    const halfDays = history.filter((h) => h.status === "half-day").length;
    const totalHours = history.reduce((sum, h) => sum + (h.totalHours || 0), 0);

    res.json({
      employee: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department || "General",
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        totalDays,
        presentDays,
        lateDays,
        halfDays,
        totalHours: parseFloat(totalHours.toFixed(1)),
        avgHours: totalDays > 0 ? parseFloat((totalHours / totalDays).toFixed(1)) : 0,
      },
      history,
    });
  } catch (err) {
    console.error("Employee history by ID error:", err);
    res.status(500).json({ message: "Server error fetching employee details" });
  }
};

// MANAGER — TEAM SUMMARY METRICS
exports.teamSummary = async (req, res) => {
  try {
    const date = todayStr();
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const todayRecords = await Attendance.find({ date }).populate("userId", "department role");

    const validToday = todayRecords.filter((r) => r.userId && r.userId.role === "employee");

    const presentToday = validToday.filter((r) => r.status === "present").length;
    const lateToday = validToday.filter((r) => r.status === "late").length;
    const halfDayToday = validToday.filter((r) => r.status === "half-day").length;
    const totalPresentOrActive = presentToday + lateToday + halfDayToday;
    const absentToday = Math.max(0, totalEmployees - totalPresentOrActive);

    const remoteToday = validToday.filter((r) => r.workMode === "Remote").length;
    const officeToday = validToday.filter((r) => r.workMode !== "Remote").length;

    const totalHoursToday = validToday.reduce(
      (sum, r) => sum + (typeof r.totalHours === "number" ? r.totalHours : 0),
      0
    );

    // Department-wise distribution
    const employees = await User.find({ role: "employee" }, "department");
    const departmentDistribution = {};
    employees.forEach((e) => {
      const dept = e.department || "General";
      departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
    });

    res.json({
      date,
      totalEmployees,
      presentToday,
      lateToday,
      halfDayToday,
      absentToday,
      remoteToday,
      officeToday,
      attendancePercentage:
        totalEmployees > 0
          ? parseFloat(((totalPresentOrActive / totalEmployees) * 100).toFixed(1))
          : 0,
      totalHoursToday: parseFloat(totalHoursToday.toFixed(1)),
      departmentDistribution,
    });
  } catch (err) {
    console.error("Team summary error:", err);
    res.status(500).json({ message: "Server error fetching team summary" });
  }
};

// MANAGER — UPDATE / RECTIFY ATTENDANCE RECORD
exports.updateAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, totalHours, remarks, workMode } = req.body;

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (status) record.status = status;
    if (totalHours !== undefined) {
      record.totalHours = parseFloat(totalHours);
    }
    if (workMode) record.workMode = workMode;
    if (remarks !== undefined) {
      record.remarks = remarks;
    }
    record.modifiedByManager = true;

    await record.save();
    return res.json({
      message: "Attendance record updated successfully by manager",
      attendance: record,
    });
  } catch (err) {
    console.error("Update attendance error:", err);
    res.status(500).json({ message: "Server error updating attendance record" });
  }
};

// MANAGER — EXPORT ATTENDANCE CSV
exports.exportCSV = async (req, res) => {
  try {
    const { startDate, endDate, department, status, employeeId, workMode } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (workMode && workMode !== "all") {
      query.workMode = workMode;
    }

    let records = await Attendance.find(query)
      .populate("userId", "name employeeId department role")
      .sort({ date: -1 });

    records = records.filter((r) => r.userId && r.userId.role === "employee");

    if (department && department !== "all") {
      records = records.filter(
        (r) => r.userId.department && r.userId.department.toLowerCase() === department.toLowerCase()
      );
    }

    if (employeeId) {
      records = records.filter(
        (r) => r.userId.employeeId && r.userId.employeeId.toLowerCase() === employeeId.toLowerCase()
      );
    }

    const headers = [
      "Employee Name",
      "Employee ID",
      "Department",
      "Date",
      "Work Mode",
      "Check-In",
      "Check-Out",
      "Hours Worked",
      "Status",
      "Remarks",
    ];

    const rows = records.map((r) => [
      `"${r.userId.name.replace(/"/g, '""')}"`,
      `"${r.userId.employeeId}"`,
      `"${r.userId.department || "General"}"`,
      r.date,
      `"${r.workMode || "Office"}"`,
      r.checkInTime ? `"${new Date(r.checkInTime).toLocaleTimeString()}"` : `"-"`,
      r.checkOutTime ? `"${new Date(r.checkOutTime).toLocaleTimeString()}"` : `"-"`,
      r.totalHours || "0",
      `"${r.status}"`,
      `"${(r.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_export_${todayStr()}.csv`
    );
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("Export CSV error:", err);
    res.status(500).json({ message: "Server error exporting CSV" });
  }
};
