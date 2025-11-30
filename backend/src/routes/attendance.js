const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  myHistory,
  todayStatus,
  allAttendance,
  allEmployeesToday
} = require("../controllers/attendance.controller.js");

// Employee routes
router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.get("/my-history", myHistory);
router.get("/today", todayStatus);

// Manager routes
router.get("/all", allAttendance);
router.get("/all-today", allEmployeesToday);

module.exports = router;
