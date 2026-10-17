const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  myHistory,
  todayStatus,
  mySummary,
  allAttendance,
  allEmployeesToday,
  employeeHistoryById,
  teamSummary,
  exportCSV,
} = require("../controllers/attendance.controller.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

// Employee routes (Requires authentication)
router.post("/checkin", protect, checkIn);
router.post("/checkout", protect, checkOut);
router.get("/my-history", protect, myHistory);
router.get("/my-summary", protect, mySummary);
router.get("/today", protect, todayStatus);

// Manager routes (Requires manager authorization)
router.get("/all", protect, authorize("manager"), allAttendance);
router.get("/all-today", protect, authorize("manager"), allEmployeesToday);
router.get("/today-status", protect, authorize("manager"), allEmployeesToday);
router.get("/employee/:id", protect, authorize("manager"), employeeHistoryById);
router.get("/summary", protect, authorize("manager"), teamSummary);
router.get("/export", protect, authorize("manager"), exportCSV);

module.exports = router;
