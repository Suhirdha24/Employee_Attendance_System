const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");
const Attendance = require("./src/models/Attendance");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";
const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/attendanceDB";

const seedDatabase = async () => {
  try {
    const isAtlas = MONGO_URI.includes("mongodb+srv");
    console.log(`Connecting to MongoDB (${isAtlas ? "MongoDB Atlas" : "Local"})...`);

    try {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 4000,
      });
      console.log("Connected to MongoDB.");
    } catch (connErr) {
      console.warn(`Primary connection failed: ${connErr.message}`);
      if (MONGO_URI !== LOCAL_MONGO_URI) {
        console.log("Attempting fallback to local MongoDB (127.0.0.1:27017)...");
        await mongoose.connect(LOCAL_MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000,
        });
        console.log("Connected to local MongoDB fallback successfully!");
      } else {
        throw connErr;
      }
    }

    // Clear existing data
    console.log("Clearing old collections...");
    await User.deleteMany({});
    await Attendance.deleteMany({});

    // Hash default password
    const hashedPassword = await bcrypt.hash("password123", 10);
    const hashedManagerPassword = await bcrypt.hash("manager123", 10);

    // 1. Create Manager
    const manager = await User.create({
      name: "Eleanor Vance (Team Lead)",
      email: "manager@company.com",
      password: hashedManagerPassword,
      role: "manager",
      employeeId: "MGR1001",
      department: "Management",
    });
    console.log("Created Manager: manager@company.com / manager123");

    // 2. Create Diverse Employees
    const employeeData = [
      {
        name: "Alex Johnson",
        email: "alex@company.com",
        employeeId: "EMP1001",
        department: "Engineering",
      },
      {
        name: "Priya Sharma",
        email: "priya@company.com",
        employeeId: "EMP1002",
        department: "Engineering",
      },
      {
        name: "Marcus Aurelius",
        email: "marcus@company.com",
        employeeId: "EMP1003",
        department: "UI/UX Design",
      },
      {
        name: "Sarah Chen",
        email: "sarah@company.com",
        employeeId: "EMP1004",
        department: "Human Resources",
      },
      {
        name: "David Miller",
        email: "david@company.com",
        employeeId: "EMP1005",
        department: "Marketing",
      },
      {
        name: "Emily Watson",
        email: "emily@company.com",
        employeeId: "EMP1006",
        department: "Finance",
      },
    ];

    const employees = [];
    for (const emp of employeeData) {
      const user = await User.create({
        ...emp,
        password: hashedPassword,
        role: "employee",
      });
      employees.push(user);
    }
    console.log(`Created ${employees.length} employees (password: password123)`);

    // 3. Generate 30 days of historical attendance
    const attendanceRecords = [];
    const today = new Date();

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - dayOffset);

      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
      const dd = String(targetDate.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const isToday = dayOffset === 0;

      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];

        // Seed realistic variations:
        // ~85% present, ~10% late, ~5% half-day, occasional absent
        const rand = (i * 17 + dayOffset * 23) % 100;

        let status = "present";
        let checkInHour = 9;
        let checkInMinute = 5 + (rand % 20); // 9:05 - 9:25
        let totalHours = 8.5;
        let remarks = "";
        let workMode = (i + dayOffset) % 4 === 0 ? "Remote" : "Office";

        if (rand > 85) {
          status = "late";
          checkInHour = 9;
          checkInMinute = 45 + (rand % 15); // 9:45 - 10:00
          totalHours = 7.8;
          remarks = "Transit delay / heavy traffic";
        } else if (rand > 78) {
          status = "half-day";
          checkInHour = 9;
          checkInMinute = 15;
          totalHours = 4.2;
          remarks = "Personal emergency / early exit approved";
        } else if (rand < 5 && !isToday) {
          // Absent on that day (skip creating check-in)
          continue;
        }

        // For today: Alex and Priya and Marcus are already checked in, Sarah checked out, David not yet checked in
        if (isToday) {
          if (emp.email === "david@company.com") {
            // Not checked in yet today
            continue;
          }
        }

        const checkInDate = new Date(targetDate);
        checkInDate.setHours(checkInHour, checkInMinute, 0, 0);

        const checkOutDate = new Date(checkInDate);
        const checkOutHours = Math.floor(totalHours);
        const checkOutMinutes = Math.round((totalHours - checkOutHours) * 60);
        checkOutDate.setHours(checkInHour + checkOutHours, checkInMinute + checkOutMinutes, 0, 0);

        const isStillCheckedInToday =
          isToday && (emp.email === "alex@company.com" || emp.email === "priya@company.com");

        attendanceRecords.push({
          userId: emp._id,
          date: dateStr,
          checkInTime: checkInDate.toISOString(),
          checkOutTime: isStillCheckedInToday ? null : checkOutDate.toISOString(),
          status,
          workMode,
          remarks,
          totalHours: isStillCheckedInToday ? 0 : totalHours,
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Seeded ${attendanceRecords.length} attendance records.`);

    console.log("\n==========================================");
    console.log("Database Seeding Completed Successfully!");
    console.log("==========================================");
    console.log("Credentials for Testing:");
    console.log("Manager:  manager@company.com  |  manager123");
    console.log("Employee: alex@company.com     |  password123");
    console.log("Employee: priya@company.com    |  password123");
    console.log("Employee: marcus@company.com   |  password123");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
