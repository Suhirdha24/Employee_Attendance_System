// ==========================================================================
// MOCK DATA & IN-MEMORY OFFLINE STORE FOR VERCEL PREVIEWS & CLIENT DEMOS
// Enables 100% interactive UI/UX testing even when backend is not running
// ==========================================================================

const STORAGE_KEY_RECORDS = "stafftrack_mock_records";
const STORAGE_KEY_TODAY = "stafftrack_mock_today";

// Sample workforce roster
export const MOCK_USERS = [
  {
    _id: "emp_1",
    name: "Alex Johnson",
    email: "alex@company.com",
    role: "employee",
    department: "Engineering",
    employeeId: "EMP1001",
  },
  {
    _id: "mgr_1",
    name: "Eleanor Vance",
    email: "manager@company.com",
    role: "manager",
    department: "Operations",
    employeeId: "MGR2001",
  },
  {
    _id: "emp_2",
    name: "David Kim",
    email: "david.kim@company.com",
    role: "employee",
    department: "Engineering",
    employeeId: "EMP1002",
  },
  {
    _id: "emp_3",
    name: "Sarah Chen",
    email: "sarah.c@company.com",
    role: "employee",
    department: "UI/UX Design",
    employeeId: "EMP1003",
  },
  {
    _id: "emp_4",
    name: "Michael Torres",
    email: "m.torres@company.com",
    role: "employee",
    department: "Marketing",
    employeeId: "EMP1004",
  },
  {
    _id: "emp_5",
    name: "Priya Sharma",
    email: "priya.s@company.com",
    role: "employee",
    department: "Finance",
    employeeId: "EMP1005",
  },
  {
    _id: "emp_6",
    name: "James Wilson",
    email: "j.wilson@company.com",
    role: "employee",
    department: "Engineering",
    employeeId: "EMP1006",
  },
  {
    _id: "emp_7",
    name: "Emma Watson",
    email: "emma.w@company.com",
    role: "employee",
    department: "Human Resources",
    employeeId: "EMP1007",
  },
  {
    _id: "emp_8",
    name: "Lucas Scott",
    email: "l.scott@company.com",
    role: "employee",
    department: "Operations",
    employeeId: "EMP1008",
  },
  {
    _id: "emp_9",
    name: "Olivia Brown",
    email: "o.brown@company.com",
    role: "employee",
    department: "UI/UX Design",
    employeeId: "EMP1009",
  },
  {
    _id: "emp_10",
    name: "Daniel Lee",
    email: "d.lee@company.com",
    role: "employee",
    department: "Engineering",
    employeeId: "EMP1010",
  },
  {
    _id: "emp_11",
    name: "Sophia Martinez",
    email: "s.martinez@company.com",
    role: "employee",
    department: "Marketing",
    employeeId: "EMP1011",
  },
];

// Helper to get today's date string YYYY-MM-DD
export function getTodayDateStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Generate realistic initial records
function generateInitialRecords() {
  const records = [];
  const todayStr = getTodayDateStr();

  // Past 14 working days
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    MOCK_USERS.forEach((user, idx) => {
      // Deterministic variety based on index and day
      const isAbsent = (idx + i) % 7 === 0;
      const isLate = (idx + i) % 5 === 0;
      const isRemote = (idx + i) % 3 === 0;

      if (isAbsent) {
        records.push({
          _id: `rec_${dateStr}_${user._id}`,
          userId: user._id,
          name: user.name,
          employeeId: user.employeeId,
          department: user.department,
          email: user.email,
          date: dateStr,
          checkInTime: null,
          checkOutTime: null,
          totalHours: 0,
          status: "absent",
          workMode: "Office",
          remarks: "Leave / Absent",
        });
      } else {
        const inHour = isLate ? "09:42" : "08:58";
        const outHour = "17:35";
        const totalHrs = isLate ? 7.8 : 8.5;

        records.push({
          _id: `rec_${dateStr}_${user._id}`,
          userId: user._id,
          name: user.name,
          employeeId: user.employeeId,
          department: user.department,
          email: user.email,
          date: dateStr,
          checkInTime: `${dateStr}T${inHour}:00.000Z`,
          checkOutTime: `${dateStr}T${outHour}:00.000Z`,
          totalHours: totalHrs,
          status: isLate ? "late" : "present",
          workMode: isRemote ? "Remote" : "Office",
          remarks: isRemote ? "Remote Work Day" : "On-site shift",
        });
      }
    });
  }

  return records;
}

// Generate today's initial attendance list
function generateTodayRecords() {
  const todayStr = getTodayDateStr();

  return MOCK_USERS.map((user, idx) => {
    // Alex (emp_1) starts not checked in by default today, so user can test punch-in!
    if (user._id === "emp_1") {
      return {
        _id: `rec_${todayStr}_${user._id}`,
        userId: user._id,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department,
        email: user.email,
        date: todayStr,
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        status: "absent",
        workMode: "Office",
        remarks: "",
      };
    }

    const isAbsent = idx === 4 || idx === 8;
    const isLate = idx === 3 || idx === 7;
    const isRemote = idx % 2 === 0;

    if (isAbsent) {
      return {
        _id: `rec_${todayStr}_${user._id}`,
        userId: user._id,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department,
        email: user.email,
        date: todayStr,
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        status: "absent",
        workMode: "Office",
        remarks: "Not yet checked in",
      };
    }

    const inTime = isLate ? `${todayStr}T09:44:00.000Z` : `${todayStr}T08:52:00.000Z`;

    return {
      _id: `rec_${todayStr}_${user._id}`,
      userId: user._id,
      name: user.name,
      employeeId: user.employeeId,
      department: user.department,
      email: user.email,
      date: todayStr,
      checkInTime: inTime,
      checkOutTime: null, // Still active!
      totalHours: 0,
      status: isLate ? "late" : "present",
      workMode: isRemote ? "Remote" : "Office",
      remarks: isRemote ? "Working from home" : "Office workstation",
    };
  });
}

// Get or initialize mock store
export function getMockStore() {
  let records;
  let todayRecords;

  try {
    const rawRecs = localStorage.getItem(STORAGE_KEY_RECORDS);
    records = rawRecs ? JSON.parse(rawRecs) : null;
  } catch (e) {
    records = null;
  }

  try {
    const rawToday = localStorage.getItem(STORAGE_KEY_TODAY);
    todayRecords = rawToday ? JSON.parse(rawToday) : null;
  } catch (e) {
    todayRecords = null;
  }

  if (!records || !Array.isArray(records)) {
    records = generateInitialRecords();
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch (_) {}
  }

  if (!todayRecords || !Array.isArray(todayRecords)) {
    todayRecords = generateTodayRecords();
    try {
      localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(todayRecords));
    } catch (_) {}
  }

  return { records, todayRecords };
}

export function saveMockStore(records, todayRecords) {
  try {
    if (records) localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    if (todayRecords) localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(todayRecords));
  } catch (_) {}
}
