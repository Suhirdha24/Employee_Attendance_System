// ==========================================================================
// MOCK API HANDLER FOR SEAMLESS CLIENT-SIDE DEMO EXECUTION
// Automatically provides fast, responsive responses when backend is offline
// ==========================================================================

import {
  MOCK_USERS,
  getTodayDateStr,
  getMockStore,
  saveMockStore,
} from "./mockData";

export function handleMockRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = (config.url || "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "");
  const params = config.params || {};

  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch (_) {
      body = config.data || {};
    }
  }

  // Get current logged-in user
  let currentUser = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw && raw !== "undefined") currentUser = JSON.parse(raw);
  } catch (_) {}

  const currentUserId = currentUser?._id || "emp_1";
  const { records, todayRecords } = getMockStore();
  const todayStr = getTodayDateStr();

  // Helper response wrapper
  const ok = (data, status = 200) => ({
    data,
    status,
    statusText: "OK",
    headers: {},
    config,
  });

  // ----------------------------------------------------------------------
  // AUTH ROUTES
  // ----------------------------------------------------------------------
  if (url === "/auth/login" && method === "post") {
    const email = (body.email || "").toLowerCase().trim();
    let matchedUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email);

    if (!matchedUser) {
      if (email.includes("manager") || email.includes("admin")) {
        matchedUser = {
          _id: "mgr_custom",
          name: email.split("@")[0].replace(/[._]/g, " "),
          email,
          role: "manager",
          department: "Operations",
          employeeId: "MGR2099",
        };
      } else {
        matchedUser = {
          _id: `emp_${Date.now()}`,
          name: email.split("@")[0].replace(/[._]/g, " "),
          email,
          role: "employee",
          department: "Engineering",
          employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
        };
      }
    }

    const token = `mock_demo_jwt_token_${matchedUser._id}`;
    return ok({
      message: `Welcome back, ${matchedUser.name}!`,
      token,
      user: matchedUser,
    });
  }

  if (url === "/auth/register" && method === "post") {
    const newUser = {
      _id: `emp_${Date.now()}`,
      name: body.name || "New Team Member",
      email: body.email,
      role: body.role || "employee",
      department: body.department || "Engineering",
      employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
    };
    const token = `mock_demo_jwt_token_${newUser._id}`;
    return ok({
      message: "Account registered successfully!",
      token,
      user: newUser,
    });
  }

  if (url === "/auth/me" && method === "get") {
    const user = currentUser || MOCK_USERS[0];
    return ok({ user });
  }

  if (url === "/auth/profile" && method === "put") {
    const updated = {
      ...currentUser,
      name: body.name || currentUser?.name,
      department: body.department || currentUser?.department,
    };
    try {
      localStorage.setItem("user", JSON.stringify(updated));
    } catch (_) {}
    return ok({ message: "Profile updated successfully!", user: updated });
  }

  if (url === "/auth/request-reset" && method === "post") {
    return ok({ message: "Password reset link sent to your email!" });
  }

  if (url === "/auth/reset-password" && method === "post") {
    return ok({ message: "Password updated successfully!" });
  }

  // ----------------------------------------------------------------------
  // EMPLOYEE ATTENDANCE ROUTES
  // ----------------------------------------------------------------------
  if (url === "/attendance/today" && method === "get") {
    let todayItem = todayRecords.find(
      (r) => r.userId === currentUserId || (currentUser && r.employeeId === currentUser.employeeId)
    );

    if (!todayItem) {
      todayItem = {
        _id: `rec_${todayStr}_${currentUserId}`,
        userId: currentUserId,
        name: currentUser?.name || "Alex Johnson",
        employeeId: currentUser?.employeeId || "EMP1001",
        department: currentUser?.department || "Engineering",
        email: currentUser?.email || "alex@company.com",
        date: todayStr,
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        status: "absent",
        workMode: "Office",
        remarks: "",
      };
      todayRecords.push(todayItem);
      saveMockStore(records, todayRecords);
    }

    return ok({
      status: todayItem.status,
      attendance: todayItem,
    });
  }

  if (url === "/attendance/workmode" && (method === "put" || method === "post")) {
    let todayItem = todayRecords.find(
      (r) => r.userId === currentUserId || (currentUser && r.employeeId === currentUser.employeeId)
    );

    if (!todayItem) {
      todayItem = {
        _id: `rec_${todayStr}_${currentUserId}`,
        userId: currentUserId,
        name: currentUser?.name || "Alex Johnson",
        employeeId: currentUser?.employeeId || "EMP1001",
        department: currentUser?.department || "Engineering",
        email: currentUser?.email || "alex@company.com",
        date: todayStr,
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        status: "absent",
        remarks: "",
      };
      todayRecords.push(todayItem);
    }

    todayItem.workMode = body.workMode || "Office";
    saveMockStore(records, todayRecords);
    return ok({
      message: `Work mode updated to ${todayItem.workMode === "Remote" ? "Remote (WFH)" : "In-Office"}`,
      attendance: todayItem,
    });
  }

  if (url === "/attendance/checkin" && method === "post") {
    let todayItem = todayRecords.find(
      (r) => r.userId === currentUserId || (currentUser && r.employeeId === currentUser.employeeId)
    );

    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const status = isLate ? "late" : "present";

    if (!todayItem) {
      todayItem = {
        _id: `rec_${todayStr}_${currentUserId}`,
        userId: currentUserId,
        name: currentUser?.name || "Alex Johnson",
        employeeId: currentUser?.employeeId || "EMP1001",
        department: currentUser?.department || "Engineering",
        email: currentUser?.email || "alex@company.com",
        date: todayStr,
      };
      todayRecords.push(todayItem);
    }

    todayItem.checkInTime = now.toISOString();
    todayItem.checkOutTime = null;
    todayItem.workMode = body.workMode || "Office";
    todayItem.remarks = body.remarks || "";
    todayItem.status = status;
    todayItem.totalHours = 0;

    saveMockStore(records, todayRecords);
    return ok({ message: "Check-in successful! Have a great shift.", attendance: todayItem });
  }

  if (url === "/attendance/checkout" && method === "post") {
    let todayItem = todayRecords.find(
      (r) => r.userId === currentUserId || (currentUser && r.employeeId === currentUser.employeeId)
    );

    if (!todayItem || !todayItem.checkInTime) {
      throw new Error("You must check in before checking out.");
    }

    const now = new Date();
    const inTime = new Date(todayItem.checkInTime);
    const diffHours = Math.max(0.1, Number(((now - inTime) / (1000 * 3600)).toFixed(1)));

    todayItem.checkOutTime = now.toISOString();
    todayItem.totalHours = diffHours > 0.1 ? diffHours : 8.0; // Realistic demo hours
    if (body.remarks) {
      todayItem.remarks = todayItem.remarks ? `${todayItem.remarks} | ${body.remarks}` : body.remarks;
    }

    saveMockStore(records, todayRecords);
    return ok({ message: "Check-out successful! Great job today.", attendance: todayItem });
  }

  if (url === "/attendance/my-summary" && method === "get") {
    const userRecs = records.filter(
      (r) => r.userId === currentUserId || (currentUser && r.employeeId === currentUser.employeeId)
    );

    const presentCount = userRecs.filter((r) => r.status === "present").length;
    const lateCount = userRecs.filter((r) => r.status === "late").length;
    const totalDays = userRecs.length || 1;
    const totalHours = userRecs.reduce((sum, r) => sum + (Number(r.totalHours) || 0), 0);
    const avgHours = (totalHours / (presentCount + lateCount || 1)).toFixed(1);
    const attendancePercentage = Math.round(((presentCount + lateCount) / totalDays) * 100);

    return ok({
      presentCount,
      lateCount,
      attendancePercentage,
      totalHours: Math.round(totalHours),
      avgHours,
      recentRecords: userRecs.slice(0, 10),
    });
  }

  if (url === "/attendance/my-history" && method === "get") {
    const userRecs = records.filter(
      (r) => r.userId === currentUserId || (currentUser && r.employeeId === currentUser.employeeId)
    );
    return ok(userRecs);
  }

  // ----------------------------------------------------------------------
  // MANAGER ATTENDANCE ROUTES
  // ----------------------------------------------------------------------
  if (url === "/attendance/summary" && method === "get") {
    const totalEmployees = MOCK_USERS.length;
    const presentToday = todayRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const lateToday = todayRecords.filter((r) => r.status === "late").length;
    const absentToday = todayRecords.filter((r) => r.status === "absent").length;
    const officeToday = todayRecords.filter((r) => r.workMode === "Office" && r.status !== "absent").length;
    const remoteToday = todayRecords.filter((r) => r.workMode === "Remote" && r.status !== "absent").length;

    return ok({
      totalEmployees,
      presentToday,
      lateToday,
      absentToday,
      officeToday,
      remoteToday,
    });
  }

  if (url === "/attendance/all-today" && method === "get") {
    return ok(todayRecords);
  }

  if (url === "/attendance/all" && method === "get") {
    let combined = [...todayRecords, ...records];
    if (params.department && params.department !== "all") {
      combined = combined.filter(
        (r) => r.department && r.department.toLowerCase() === params.department.toLowerCase()
      );
    }
    if (params.status && params.status !== "all") {
      combined = combined.filter((r) => r.status === params.status);
    }
    if (params.workMode && params.workMode !== "all") {
      combined = combined.filter((r) => r.workMode === params.workMode);
    }
    return ok(combined);
  }

  if (url === "/attendance/today-status" && method === "get") {
    return ok(MOCK_USERS.map((u) => {
      const match = todayRecords.find((r) => r.userId === u._id || r.employeeId === u.employeeId);
      return {
        userId: u._id,
        name: u.name,
        employeeId: u.employeeId,
        department: u.department,
        email: u.email,
        status: match ? match.status : "absent",
      };
    }));
  }

  if (url.startsWith("/attendance/employee/") && method === "get") {
    const empId = url.replace("/attendance/employee/", "");
    const user = MOCK_USERS.find((u) => u._id === empId || u.employeeId === empId) || MOCK_USERS[0];
    const userRecs = records.filter((r) => r.userId === user._id || r.employeeId === user.employeeId);
    return ok({
      employee: user,
      history: userRecs,
    });
  }

  if (url.startsWith("/attendance/") && method === "put") {
    const recId = url.replace("/attendance/", "");
    const item =
      todayRecords.find((r) => r._id === recId) ||
      records.find((r) => r._id === recId);

    if (item) {
      if (body.status) {
        item.status = body.status;
        if (body.status !== "absent" && !item.checkInTime) {
          item.checkInTime = `${item.date}T09:00:00.000Z`;
          item.checkOutTime = `${item.date}T17:30:00.000Z`;
        }
      }
      if (body.totalHours !== undefined) item.totalHours = Number(body.totalHours);
      if (body.workMode) item.workMode = body.workMode;
      if (body.remarks !== undefined) item.remarks = body.remarks;
      item.modifiedByManager = true;
      saveMockStore(records, todayRecords);
    }
    return ok({ message: "Attendance adjusted successfully!", attendance: item });
  }

  if (url === "/dashboard/employee" && method === "get") {
    return ok({ message: "Employee dashboard data loaded" });
  }

  if (url === "/dashboard/manager" && method === "get") {
    const presentToday = todayRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const lateToday = todayRecords.filter((r) => r.status === "late").length;
    const absentToday = todayRecords.filter((r) => r.status === "absent").length;
    return ok({
      totalEmployees: MOCK_USERS.length,
      presentToday,
      lateToday,
      absentToday,
    });
  }

  // Fallback default
  return ok({ message: "OK" });
}

