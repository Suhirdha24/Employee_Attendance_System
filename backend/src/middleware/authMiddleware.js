const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // Check if query or body has userId as fallback for legacy compatibility
    const fallbackId = req.query?.userId || req.body?.userId;
    if (fallbackId) {
      try {
        const user = await User.findById(fallbackId).select("-password");
        if (user) {
          req.user = user;
          return next();
        }
      } catch (e) {
        // Continue to unauthorized response
      }
    }
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretattendancejwtkey_2026_dev_env"
    );
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found for this token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
