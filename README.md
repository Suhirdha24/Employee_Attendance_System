# StaffTrack HRMS — Workforce Attendance & Timesheet System

An enterprise-grade, full-stack MERN application for modern workforce management. Enables employees to record verified biometric-style punch times (Check-In / Check-Out) with Work Mode selection (Office vs Remote), and provides managers with real-time attendance telemetry, compliance auditing, attendance rectification, department filtering, and CSV timesheet exports.

---

## 🚀 Tech Stack

### **Frontend**
- **React.js 18** (Functional components, Hooks)
- **Redux Toolkit & React-Redux** (Centralized state management)
- **React Router v6** (Protected routes with Role-Based Access Control)
- **React Calendar** (Interactive monthly attendance heatmaps)
- **Chart.js, react-chartjs-2 & Recharts** (Attendance analytics & weekly trends)
- **Vanilla CSS (Design Tokens)** (Corporate HRMS theme, crisp typography, responsive layout, mobile drawer menu)

### **Backend**
- **Node.js & Express.js** (RESTful API architecture)
- **MongoDB & Mongoose** (Dual-mode support: MongoDB Atlas + Local MongoDB fallback)
- **JWT (JSON Web Tokens)** (Stateless authorization with `Bearer` tokens)
- **bcryptjs** (Enterprise password hashing)
- **CORS & dotenv** (Cross-origin resource sharing & environment configuration)

---

## 👥 User Roles & Features

### 👨‍💼 **Employee Portal**
- **Secure Authentication**: Register with automated Employee ID generation (`EMP10xx`), sign in with password visibility toggle.
- **Work Mode Selection**: Select between `🏢 In-Office` and `🌐 Authorized Remote / WFH` for each daily shift.
- **Live Workstation Punching**: Real-time digital clock with single-click Check-In and Check-Out with animated active shift pulse.
- **Shift Remarks & Notes**: Attach optional comments to shifts (e.g., transit delays, client meetings, doctor appointments).
- **Shift Duration Tracking**: Automated computation of total hours logged and compliance classification (*Present*, *Late (>09:30)*, *Half-Day (<4.5h)*, *Absent*).
- **Personal Timesheet Audit**:
  - **Tabular View**: Chronological log with search, Work Mode tags, and status badges.
  - **Calendar Heatmap**: Interactive calendar with color-coded day tiles and detailed daily shift inspector.
- **Profile & Security Settings**: Update full legal name, department, or change password with instant feedback toast notifications.
- **Personal Summary Statistics**: Present days, late marks, half days, average working hours, compliance percentage.

### 👩‍💼 **Manager & HR Portal**
- **Workforce KPI Dashboard**: Real-time metrics for total workforce, present count, absent count, late arrivals, and office vs remote split.
- **7-Day Attendance Trend**: Interactive bar and line charts visualizing presence rates across departments.
- **Workforce Audit Table**: Comprehensive master timesheet with multi-parameter filtering:
  - Quick filter chips (All, Present, Late, Half-Day, Remote Only)
  - Filter by Department (Engineering, Marketing, HR, Finance, Operations, UI/UX)
  - Filter by Status (Present, Late, Half-Day, Absent)
  - Filter by Work Mode (In-Office, Authorized Remote)
  - Search by employee name, ID, or email
- **Real-Time Active Duration**: Live elapsed shift timer for employees currently clocked in (`● Active (3h 24m)`).
- **Attendance Rectification / Adjustment**: Managers can adjust shift status, logged hours, work mode, and add audit justification notes directly from the master table or drilldown modal.
- **Employee Drill-Down**: Direct inspection of individual employee historical logs and performance metrics.
- **CSV Data Export**: Instant download of formatted, timestamped attendance audit logs (including Work Mode and Remarks) for payroll integration.

---

## 🔑 Default Demo Credentials

For quick evaluation, pre-seeded accounts are ready to use:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Employee** | `alex@company.com` | `password123` | Personal Dashboard, Punches, History, Profile |
| **Manager** | `manager@company.com` | `manager123` | Master Audit, Attendance Adjustment, Team Analytics, CSV Export |

---

## 📦 Getting Started & Local Setup

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local Community Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

---

### **1. Clone the Repository**
```bash
git clone https://github.com/Suhirdha24/Employee_Attendance_System.git
cd Employee_Attendance_System
```

---

### **2. Backend Configuration & Setup**
Navigate to the `backend` folder:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendanceDB
JWT_SECRET=supersecretattendancejwtkey_2026_dev_env
```
*(Note: If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string. If connection times out, the backend automatically falls back to your local MongoDB server on port 27017.)*

Seed the database with sample employees and attendance records:
```bash
npm run seed
# or: node seed.js
```

Start the backend server:
```bash
npm start
# Server runs on: http://localhost:5000
```

Run the automated test suite (verifies all 26 endpoints and operations):
```bash
npm test
```

---

### **3. Frontend Configuration & Setup**
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm start
# Application opens on: http://localhost:3000
```

---

## 🧪 Comprehensive Automated Test Suite

StaffTrack HRMS includes a built-in end-to-end integration test suite that tests health, authentication, role access control, punch clock operations, manager controls, and CSV generation:

```bash
cd backend
npm test
```

Output:
```
====================================================
🧪 RUNNING COMPREHENSIVE ATTENDANCE SYSTEM TEST SUITE
====================================================

--- 1. SYSTEM HEALTH CHECKS ---
✅ [PASS] GET /api/health responds with 200 OK

--- 2. AUTHENTICATION & SECURITY ---
✅ [PASS] Employee login (alex@company.com) returns JWT token
✅ [PASS] Manager login returns JWT with role "manager"
✅ [PASS] Invalid password correctly rejected with 400 Bad Request
✅ [PASS] GET /api/auth/me returns authenticated employee profile
✅ [PASS] POST /api/auth/request-reset verifies email and returns user ID
✅ [PASS] POST /api/auth/register provisions user with generated employeeId: EMP1007
✅ [PASS] PUT /api/auth/profile updates user display name

--- 3. EMPLOYEE ATTENDANCE OPERATIONS ---
✅ [PASS] POST /api/attendance/checkin records valid punch time with Remote workMode
✅ [PASS] POST /api/attendance/checkin prevents double check-in on the same day
✅ [PASS] POST /api/attendance/checkout records check-out time and totalHours
✅ [PASS] POST /api/attendance/checkout prevents double check-out on the same day
✅ [PASS] GET /api/attendance/today returns today attendance object
✅ [PASS] GET /api/attendance/my-history returns attendance history array
✅ [PASS] GET /api/attendance/my-summary returns compliance metrics
✅ [PASS] GET /api/dashboard/employee returns live workstation data

--- 4. ROLE-BASED ACCESS CONTROL (RBAC) ---
✅ [PASS] Employee token accessing manager route GET /api/attendance/all is blocked with 403 Forbidden

--- 5. MANAGER WORKFORCE OPERATIONS ---
✅ [PASS] GET /api/attendance/all returns 132 attendance logs
✅ [PASS] GET /api/attendance/all?department=Engineering filters correctly
✅ [PASS] GET /api/attendance/all?status=present filters correctly
✅ [PASS] GET /api/attendance/all-today returns status for 7 team members
✅ [PASS] GET /api/attendance/employee/:id returns comprehensive drilldown for Alex Johnson
✅ [PASS] PUT /api/attendance/:id rectifies record and sets modifiedByManager flag
✅ [PASS] GET /api/attendance/summary returns metrics for 7 total employees
✅ [PASS] GET /api/dashboard/manager returns KPI overview and 7-day trend series
✅ [PASS] GET /api/attendance/export generates valid CSV with Work Mode & Remarks columns

====================================================
📊 TEST SUITE SUMMARY: 26 PASSED | 0 FAILED
====================================================
🎉 ALL SYSTEM FUNCTIONS ARE WORKING PROPERLY!
```

---

## 📄 License
MIT License. Free for open-source and enterprise use.
