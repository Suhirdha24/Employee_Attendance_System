const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretattendancejwtkey_2026_dev_env";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      employeeId: user.employeeId,
      department: user.department || "General",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// AUTO GENERATE EMPLOYEE ID
async function generateEmployeeId() {
  const count = await User.countDocuments();
  const lastUser = await User.findOne().sort({ createdAt: -1 });

  if (!lastUser || !lastUser.employeeId) {
    return "EMP1001";
  }

  const matches = lastUser.employeeId.match(/\d+/);
  if (matches) {
    const nextNum = parseInt(matches[0], 10) + 1;
    return `EMP${nextNum}`;
  }

  return `EMP${1001 + count}`;
}

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department || "General",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "employee", department = "General" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const employeeId = await generateEmployeeId();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role === "manager" ? "manager" : "employee",
      department: department || "General",
      employeeId,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CURRENT USER PROFILE
exports.me = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    return res.json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department || "General",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Me endpoint error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD REQUEST
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    return res.json({
      message: "Email verified. You can now reset your password.",
      id: user._id,
      email: user.email,
    });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { id, newPassword } = req.body;
    if (!id || !newPassword) {
      return res.status(400).json({ message: "User ID and new password are required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully! Please login with your new password." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
