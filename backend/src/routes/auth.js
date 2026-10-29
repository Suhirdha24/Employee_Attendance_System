const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  updateProfile,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/auth.controller.js");
const { protect } = require("../middleware/authMiddleware.js");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;
