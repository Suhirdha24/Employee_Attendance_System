const bcrypt = require("bcryptjs");
const User = require("../models/User.js");

// AUTO GENERATE EMPLOYEE ID
async function generateEmployeeId() {
  const lastUser = await User.findOne().sort({ createdAt: -1 });

  if (!lastUser || !lastUser.employeeId) {
    return "EMP001";
  }

  const lastNum = parseInt(lastUser.employeeId.replace("EMP", ""));
  return "EMP" + String(lastNum + 1).padStart(3, "0");
}

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const employeeId = await generateEmployeeId();

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      employeeId,
    });

    return res.json({
      message: "User created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// NO TOKEN PROFILE
exports.me = (req, res) => {
  return res.status(400).json({
    message: "No token-based authentication. Profile is returned at login.",
  });
};
