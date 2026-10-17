const express = require("express");
const router = express.Router();

const {
  getEmployeeDashboard,
  getManagerDashboard,
} = require("../controllers/dashboard.controller.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

router.get("/employee", protect, getEmployeeDashboard);
router.get("/manager", protect, authorize("manager"), getManagerDashboard);

module.exports = router;
