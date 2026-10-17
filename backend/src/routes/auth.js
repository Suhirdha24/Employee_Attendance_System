const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/auth.controller.js");
const { protect } = require("../middleware/authMiddleware.js");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;
